/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package util

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"fmt"
	"io"
	"strings"
	"testing"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type configSetTestStep struct {
	kind   string
	prefix string
	rows   int64
	err    error
}
type configSetTestStore struct {
	steps                                        []configSetTestStep
	queries, inserts, begins, commits, rollbacks int
}
type configSetTestConnector struct{ store *configSetTestStore }
type configSetTestDriver struct{ store *configSetTestStore }
type configSetTestConn struct{ store *configSetTestStore }
type configSetTestRows struct {
	value int64
	read  bool
}
type configSetTestResult struct{ affected int64 }

// Connect 函数说明：创建只处理预设 SQL 的隔离连接，不读取真实配置或连接真实数据库。
func (connector configSetTestConnector) Connect(context.Context) (driver.Conn, error) {
	return &configSetTestConn{store: connector.store}, nil
}

// Driver 函数说明：满足标准连接器接口，实际连接由 Connect 创建。
func (connector configSetTestConnector) Driver() driver.Driver {
	return configSetTestDriver{store: connector.store}
}

// Open 函数说明：兼容标准库驱动入口，仍使用同一隔离期望队列。
func (testDriver configSetTestDriver) Open(string) (driver.Conn, error) {
	return &configSetTestConn{store: testDriver.store}, nil
}

// Prepare 函数说明：拒绝未声明的语句路径，避免测试悄悄跳过真实 SQL 校验。
func (conn *configSetTestConn) Prepare(string) (driver.Stmt, error) {
	return nil, errors.New("unexpected prepared statement")
}

// Close 函数说明：内存连接没有需要释放的外部资源。
func (conn *configSetTestConn) Close() error { return nil }

// Begin 函数说明：记录真实 GORM 事务的开始次数。
func (conn *configSetTestConn) Begin() (driver.Tx, error) { conn.store.begins++; return conn, nil }

// Commit 函数说明：记录真实 GORM 事务提交，不执行外部写入。
func (conn *configSetTestConn) Commit() error { conn.store.commits++; return nil }

// Rollback 函数说明：记录失败事务回滚，供外层事务契约断言。
func (conn *configSetTestConn) Rollback() error { conn.store.rollbacks++; return nil }

// next 函数说明：按顺序验证实际生成的语句，并返回该语句的受影响行或注入错误。
func (conn *configSetTestConn) next(kind, query string) (configSetTestStep, error) {
	if len(conn.store.steps) == 0 {
		return configSetTestStep{}, fmt.Errorf("unexpected %s: %s", kind, query)
	}
	step := conn.store.steps[0]
	conn.store.steps = conn.store.steps[1:]
	if kind != step.kind || !strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), step.prefix) {
		return step, fmt.Errorf("expected %s %s, got %s: %s", step.kind, step.prefix, kind, query)
	}
	return step, step.err
}

// ExecContext 函数说明：模拟 MySQL 同值更新返回零行，以及真实新配置插入路径。
func (conn *configSetTestConn) ExecContext(_ context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	step, err := conn.next("exec", query)
	if strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "INSERT ") {
		conn.store.inserts++
	}
	if len(args) < 3 {
		return nil, errors.New("configuration SQL missing arguments")
	}
	if err != nil {
		return nil, err
	}
	return configSetTestResult{affected: step.rows}, nil
}

// QueryContext 函数说明：只允许按类型和键确认匹配行，查询失败不得继续插入。
func (conn *configSetTestConn) QueryContext(_ context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	conn.store.queries++
	step, err := conn.next("query", query)
	if err != nil {
		return nil, err
	}
	if len(args) != 2 || args[0].Value != "website" || args[1].Value != "fixture" {
		return nil, errors.New("existence check must use configuration type and key")
	}
	return &configSetTestRows{value: step.rows}, nil
}

// Columns 函数说明：提供真实 COUNT 查询需要的单列结构。
func (rows *configSetTestRows) Columns() []string { return []string{"count(*)"} }

// Close 函数说明：测试结果集不持有外部资源。
func (rows *configSetTestRows) Close() error { return nil }

// Next 函数说明：只返回一次匹配数量，然后结束结果集。
func (rows *configSetTestRows) Next(values []driver.Value) error {
	if rows.read {
		return io.EOF
	}
	rows.read = true
	values[0] = rows.value
	return nil
}

// LastInsertId 函数说明：提供 GORM 创建模型时读取的合成主键。
func (result configSetTestResult) LastInsertId() (int64, error) { return 1, nil }

// RowsAffected 函数说明：返回当前语句的合成实际变化行数。
func (result configSetTestResult) RowsAffected() (int64, error) { return result.affected, nil }

// newConfigSetTestDB 函数说明：使用现有 MySQL 方言生成实际 SQL，全部期望和数据仅在内存中。
func newConfigSetTestDB(t *testing.T, steps ...configSetTestStep) (*gorm.DB, *configSetTestStore) {
	t.Helper()
	store := &configSetTestStore{steps: append([]configSetTestStep(nil), steps...)}
	sqlDB := sql.OpenDB(configSetTestConnector{store: store})
	sqlDB.SetMaxOpenConns(1)
	t.Cleanup(func() {
		_ = sqlDB.Close()
		if len(store.steps) != 0 {
			t.Errorf("%d expected SQL statements were not executed", len(store.steps))
		}
	})
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal(err)
	}
	return db, store
}

// TestConfigSetUnchangedExistingDoesNotInsert 函数说明：同值更新零行或历史重复键仍只确认存在，不新增重复配置。
func TestConfigSetUnchangedExistingDoesNotInsert(t *testing.T) {
	for _, matched := range []int64{1, 3} {
		db, store := newConfigSetTestDB(t, configSetTestStep{kind: "exec", prefix: "UPDATE ", rows: 0}, configSetTestStep{kind: "query", prefix: "SELECT COUNT(*)", rows: matched})
		if err := ConfigUtil.Set(db, "website", "fixture", "unchanged"); err != nil {
			t.Fatal(err)
		}
		if store.inserts != 0 || store.queries != 1 {
			t.Fatal("unchanged existing configuration was inserted again")
		}
	}
}

// TestConfigSetMissingInsertsOnce 函数说明：更新零行且确认不存在时，保留正常插入新配置的行为。
func TestConfigSetMissingInsertsOnce(t *testing.T) {
	db, store := newConfigSetTestDB(t, configSetTestStep{kind: "exec", prefix: "UPDATE ", rows: 0}, configSetTestStep{kind: "query", prefix: "SELECT COUNT(*)", rows: 0}, configSetTestStep{kind: "exec", prefix: "INSERT ", rows: 1})
	if err := ConfigUtil.Set(db, "website", "fixture", "new value"); err != nil {
		t.Fatal(err)
	}
	if store.inserts != 1 || store.queries != 1 {
		t.Fatal("missing configuration was not inserted once")
	}
}

// TestConfigSetErrorsDoNotFallThroughToInsert 函数说明：更新或存在性读取失败保持原错误，不把失败误判为新记录。
func TestConfigSetErrorsDoNotFallThroughToInsert(t *testing.T) {
	failure := errors.New("synthetic database failure")
	for _, steps := range [][]configSetTestStep{
		{{kind: "exec", prefix: "UPDATE ", err: failure}},
		{{kind: "exec", prefix: "UPDATE ", rows: 0}, {kind: "query", prefix: "SELECT COUNT(*)", err: failure}},
	} {
		db, store := newConfigSetTestDB(t, steps...)
		if err := ConfigUtil.Set(db, "website", "fixture", "new value"); !errors.Is(err, failure) {
			t.Fatalf("original database error was lost: %v", err)
		}
		if store.inserts != 0 {
			t.Fatal("database failure must not insert a new row")
		}
	}
}

// TestConfigSetChangedSkipsExistenceQuery 函数说明：正常有变化更新不新增查询，保留既有热路径。
func TestConfigSetChangedSkipsExistenceQuery(t *testing.T) {
	db, store := newConfigSetTestDB(t, configSetTestStep{kind: "exec", prefix: "UPDATE ", rows: 2})
	if err := ConfigUtil.Set(db, "website", "fixture", "changed"); err != nil {
		t.Fatal(err)
	}
	if store.queries != 0 || store.inserts != 0 {
		t.Fatal("changed update must return without an extra query")
	}
}

// TestConfigSetFailureRollsBackOuterTransaction 函数说明：存在性读取失败仍交由调用方事务整体回滚。
func TestConfigSetFailureRollsBackOuterTransaction(t *testing.T) {
	failure := errors.New("synthetic read failure")
	db, store := newConfigSetTestDB(t, configSetTestStep{kind: "exec", prefix: "UPDATE ", rows: 0}, configSetTestStep{kind: "query", prefix: "SELECT COUNT(*)", err: failure})
	err := db.Transaction(func(tx *gorm.DB) error { return ConfigUtil.Set(tx, "website", "fixture", "new value") })
	if !errors.Is(err, failure) || store.begins != 1 || store.commits != 0 || store.rollbacks != 1 {
		t.Fatalf("outer transaction did not roll back: err=%v begins=%d commits=%d rollbacks=%d", err, store.begins, store.commits, store.rollbacks)
	}
}

// TestConfigSetInsertErrorPreserved 函数说明：真正缺失的配置插入失败时返回原错误，不能报告保存成功。
func TestConfigSetInsertErrorPreserved(t *testing.T) {
	failure := errors.New("synthetic insert failure")
	db, _ := newConfigSetTestDB(t, configSetTestStep{kind: "exec", prefix: "UPDATE ", rows: 0}, configSetTestStep{kind: "query", prefix: "SELECT COUNT(*)", rows: 0}, configSetTestStep{kind: "exec", prefix: "INSERT ", err: failure})
	if err := ConfigUtil.Set(db, "website", "fixture", "new value"); !errors.Is(err, failure) {
		t.Fatalf("insert failure was lost: %v", err)
	}
}
