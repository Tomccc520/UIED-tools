package setting

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"likeadmin/admin/schemas/req"
	"strings"
	"sync"
	"testing"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// websitePatchTestStore 为隔离的事务测试存储，不连接开发或生产数据库；仅在提交时合并本次修改的键。
type websitePatchTestStore struct {
	mu           sync.Mutex
	values       map[string]string
	failKey      string
	failCommit   bool
	begins       int
	commits      int
	rollbacks    int
	queries      int
	barrierSize  int
	barrierCount int
	barrier      chan struct{}
}

type websitePatchTestConnector struct{ store *websitePatchTestStore }
type websitePatchTestDriver struct{ store *websitePatchTestStore }
type websitePatchTestConn struct {
	store   *websitePatchTestStore
	pending map[string]string
	waited  bool
}

// Connect 函数说明：为每个 SQL 连接创建独立事务暂存区，让并发保存测试真实经过 database/sql 和 GORM 事务边界。
func (connector websitePatchTestConnector) Connect(context.Context) (driver.Conn, error) {
	return &websitePatchTestConn{store: connector.store}, nil
}

// Driver 函数说明：返回隔离驱动实例，满足标准库连接器接口，不注册全局驱动或修改数据库配置。
func (connector websitePatchTestConnector) Driver() driver.Driver {
	return websitePatchTestDriver{store: connector.store}
}

// Open 函数说明：按标准库驱动协议返回隔离连接，所有数据只存在测试内存中。
func (testDriver websitePatchTestDriver) Open(string) (driver.Conn, error) {
	return &websitePatchTestConn{store: testDriver.store}, nil
}

// Prepare 函数说明：拒绝未预期的预编译语句，避免测试绕过明确校验的 UPDATE 执行路径。
func (conn *websitePatchTestConn) Prepare(string) (driver.Stmt, error) {
	return nil, errors.New("unexpected prepared statement in website patch test")
}

// Close 函数说明：隔离连接没有外部资源，关闭时不发布任何未提交数据。
func (conn *websitePatchTestConn) Close() error { return nil }

// Begin 函数说明：兼容传统 SQL 事务接口，并交由带上下文的事务入口创建暂存区。
func (conn *websitePatchTestConn) Begin() (driver.Tx, error) {
	return conn.BeginTx(context.Background(), driver.TxOptions{})
}

// BeginTx 函数说明：开始独立事务并记录次数；后续任何事务外写入都视为测试失败。
func (conn *websitePatchTestConn) BeginTx(context.Context, driver.TxOptions) (driver.Tx, error) {
	conn.pending = make(map[string]string)
	conn.waited = false
	conn.store.mu.Lock()
	conn.store.begins++
	conn.store.mu.Unlock()
	return conn, nil
}

// QueryContext 函数说明：保存流程不应查询全量配置，任何读查询都立即失败并计数，直接守护陈旧快照回写问题。
func (conn *websitePatchTestConn) QueryContext(context.Context, string, []driver.NamedValue) (driver.Rows, error) {
	conn.store.mu.Lock()
	conn.store.queries++
	conn.store.mu.Unlock()
	return nil, errors.New("website patch save must not read a complete config snapshot")
}

// ExecContext 函数说明：解析 GORM 实际生成的配置 UPDATE，仅在事务暂存区写入；可在指定字段注入失败或同步多个并发请求。
func (conn *websitePatchTestConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	if conn.pending == nil {
		return nil, errors.New("configuration write happened outside a transaction")
	}
	if !strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "UPDATE ") || (len(args) != 3 && len(args) != 4) {
		return nil, fmt.Errorf("unexpected website patch statement: %s", query)
	}
	value, valueOK := args[0].Value.(string)
	configType, typeOK := args[len(args)-2].Value.(string)
	name, nameOK := args[len(args)-1].Value.(string)
	if !valueOK || !typeOK || !nameOK || configType != "website" {
		return nil, errors.New("unexpected website patch arguments")
	}
	conn.store.mu.Lock()
	fail := name == conn.store.failKey
	barrier := conn.store.barrier
	if barrier != nil && !conn.waited {
		conn.waited = true
		conn.store.barrierCount++
		if conn.store.barrierCount == conn.store.barrierSize {
			close(barrier)
		}
	}
	conn.store.mu.Unlock()
	if barrier != nil && conn.waited {
		select {
		case <-barrier:
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-time.After(3 * time.Second):
			return nil, errors.New("parallel website saves did not overlap")
		}
	}
	if fail {
		return nil, errors.New("injected website field write failure")
	}
	conn.pending[name] = value
	return driver.RowsAffected(1), nil
}

// Commit 函数说明：仅合并当前事务提交的键，支持模拟提交失败，保证失败时不会发布任何暂存内容。
func (conn *websitePatchTestConn) Commit() error {
	conn.store.mu.Lock()
	defer conn.store.mu.Unlock()
	if conn.store.failCommit {
		conn.pending = nil
		return errors.New("injected website commit failure")
	}
	for name, value := range conn.pending {
		conn.store.values[name] = value
	}
	conn.store.commits++
	conn.pending = nil
	return nil
}

// Rollback 函数说明：丢弃整批事务改动，用于验证第二个字段失败时第一个字段也不会落库。
func (conn *websitePatchTestConn) Rollback() error {
	conn.store.mu.Lock()
	conn.store.rollbacks++
	conn.store.mu.Unlock()
	conn.pending = nil
	return nil
}

// newWebsitePatchTestDB 函数说明：创建只含内存测试驱动的 GORM 数据库，复用真实 MySQL SQL 生成和事务流程，不新增依赖。
func newWebsitePatchTestDB(t *testing.T, values map[string]string) (*gorm.DB, *websitePatchTestStore) {
	t.Helper()
	store := &websitePatchTestStore{values: make(map[string]string)}
	for name, value := range values {
		store.values[name] = value
	}
	sqlDB := sql.OpenDB(websitePatchTestConnector{store: store})
	sqlDB.SetMaxOpenConns(4)
	t.Cleanup(func() { _ = sqlDB.Close() })
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{
		DisableAutomaticPing: true,
		Logger:               logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		t.Fatalf("open isolated website test database: %v", err)
	}
	return db, store
}

// TestWebsiteSaveParallelPatches 函数说明：强制头部、页脚、SEO 保存同时处于事务中，断言它们互不覆盖且未提交字段保持原值。
func TestWebsiteSaveParallelPatches(t *testing.T) {
	db, store := newWebsitePatchTestDB(t, map[string]string{
		toolsHeaderLinksConfigName:      "old header",
		toolsFooterIntroConfigName:      "old footer",
		toolsSeoDefaultTitleConfigName:  "old SEO",
		toolsSidebarBrandTextConfigName: "keep sidebar",
		"toolsHomepageLearningRssUrl":   "https://www.uied.cn/unchanged.xml",
	})
	store.barrierSize = 3
	store.barrier = make(chan struct{})
	requests := []req.SettingWebsiteReq{
		{ToolsHeaderLinks: stringPointer("[]")},
		{ToolsFooterIntro: stringPointer("new footer")},
		{ToolsSeoDefaultTitle: stringPointer("new SEO")},
	}
	errorsFound := make(chan error, len(requests))
	for _, request := range requests {
		request := request
		go func() { errorsFound <- (settingWebsiteService{db: db}).Save(request) }()
	}
	for range requests {
		if err := <-errorsFound; err != nil {
			t.Fatalf("parallel website save failed: %v", err)
		}
	}
	want := map[string]string{
		toolsHeaderLinksConfigName:      "[]",
		toolsFooterIntroConfigName:      "new footer",
		toolsSeoDefaultTitleConfigName:  "new SEO",
		toolsSidebarBrandTextConfigName: "keep sidebar",
		"toolsHomepageLearningRssUrl":   "https://www.uied.cn/unchanged.xml",
	}
	if !websitePatchValuesEqual(store.values, want) || store.begins != 3 || store.commits != 3 || store.queries != 0 {
		t.Fatalf("parallel patches changed unrelated data or read snapshots: values=%v, begins=%d commits=%d queries=%d", store.values, store.begins, store.commits, store.queries)
	}
}

// websitePatchValuesEqual 函数说明：逐键核对配置快照，避免断言只检查新值而漏掉额外写入的默认项。
func websitePatchValuesEqual(actual, expected map[string]string) bool {
	if len(actual) != len(expected) {
		return false
	}
	for name, value := range expected {
		if actual[name] != value {
			return false
		}
	}
	return true
}

// TestWebsiteSaveRollsBackWholePatch 函数说明：第二个字段写入失败或事务提交失败时，整份原始配置必须保持不变。
func TestWebsiteSaveRollsBackWholePatch(t *testing.T) {
	for _, mode := range []string{"field", "commit"} {
		t.Run(mode, func(t *testing.T) {
			original := map[string]string{"name": "old name", toolsFooterIntroConfigName: "old footer"}
			db, store := newWebsitePatchTestDB(t, original)
			if mode == "field" {
				store.failKey = toolsFooterIntroConfigName
			} else {
				store.failCommit = true
			}
			err := (settingWebsiteService{db: db}).Save(req.SettingWebsiteReq{
				Name:             stringPointer("new name"),
				ToolsFooterIntro: stringPointer("new footer"),
			})
			if err == nil || !websitePatchValuesEqual(store.values, original) || store.commits != 0 {
				t.Fatalf("failed transaction leaked changes: error=%v values=%v commits=%d", err, store.values, store.commits)
			}
			if mode == "field" && store.rollbacks != 1 {
				t.Fatalf("expected rollback after a field failure, got %d", store.rollbacks)
			}
		})
	}
}
