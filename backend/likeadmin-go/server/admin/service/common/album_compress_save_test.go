/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package common

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"errors"
	"reflect"
	"strings"
	"testing"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"likeadmin/admin/schemas/req"
)

type albumCompressStore struct {
	values                     map[string]string
	failKey                    string
	begins, commits, rollbacks int
}
type albumCompressConnector struct{ store *albumCompressStore }
type albumCompressDriver struct{ store *albumCompressStore }
type albumCompressConn struct {
	store   *albumCompressStore
	pending map[string]string
}

// Connect 函数说明：为隔离 SQL 事务创建连接，不访问开发或生产数据库。
func (connector albumCompressConnector) Connect(context.Context) (driver.Conn, error) {
	return &albumCompressConn{store: connector.store}, nil
}

// Driver 函数说明：返回只使用当前内存存储的标准库驱动。
func (connector albumCompressConnector) Driver() driver.Driver {
	return albumCompressDriver{store: connector.store}
}

// Open 函数说明：兼容标准库入口，返回同一隔离事务存储的连接。
func (testDriver albumCompressDriver) Open(string) (driver.Conn, error) {
	return &albumCompressConn{store: testDriver.store}, nil
}

// Prepare 函数说明：拒绝未声明的预编译路径，防止保存测试跳过真实 SQL 校验。
func (conn *albumCompressConn) Prepare(string) (driver.Stmt, error) {
	return nil, errors.New("unexpected prepared statement")
}

// Close 函数说明：内存连接不持有外部资源。
func (conn *albumCompressConn) Close() error { return nil }

// Begin 函数说明：创建尚未提交的配置暂存区，记录真实 GORM 事务边界。
func (conn *albumCompressConn) Begin() (driver.Tx, error) {
	conn.pending = make(map[string]string)
	conn.store.begins++
	return conn, nil
}

// ExecContext 函数说明：仅接受事务内 material 类型的配置更新，并在指定字段注入失败。
func (conn *albumCompressConn) ExecContext(_ context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	if conn.pending == nil || !strings.HasPrefix(strings.ToUpper(strings.TrimSpace(query)), "UPDATE ") || len(args) < 3 {
		return nil, errors.New("compression configuration must update inside one transaction")
	}
	value, valueOK := args[0].Value.(string)
	configType, typeOK := args[len(args)-2].Value.(string)
	name, nameOK := args[len(args)-1].Value.(string)
	if !valueOK || !typeOK || !nameOK || configType != "material" {
		return nil, errors.New("unexpected compression update arguments")
	}
	if name == conn.store.failKey {
		return nil, errors.New("synthetic compression write failure")
	}
	conn.pending[name] = value
	return driver.RowsAffected(1), nil
}

// Commit 函数说明：仅提交本次事务触及的配置，不覆盖其他素材设置。
func (conn *albumCompressConn) Commit() error {
	for name, value := range conn.pending {
		conn.store.values[name] = value
	}
	conn.pending = nil
	conn.store.commits++
	return nil
}

// Rollback 函数说明：丢弃所有暂存修改，确保后续字段失败时前面的字段也保持原值。
func (conn *albumCompressConn) Rollback() error {
	conn.pending = nil
	conn.store.rollbacks++
	return nil
}

// newAlbumCompressDB 函数说明：用项目已有 MySQL 方言和真实事务回调验证保存，不新增测试依赖。
func newAlbumCompressDB(t *testing.T, values map[string]string) (*gorm.DB, *albumCompressStore) {
	t.Helper()
	store := &albumCompressStore{values: make(map[string]string)}
	for key, value := range values {
		store.values[key] = value
	}
	sqlDB := sql.OpenDB(albumCompressConnector{store: store})
	t.Cleanup(func() { _ = sqlDB.Close() })
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal(err)
	}
	return db, store
}

// albumCompressFixture 函数说明：创建显式关闭且阈值为零的合法策略，检查零值不被默认值替换。
func albumCompressFixture() req.CommonAlbumCompressConfigSaveReq {
	enabled, minSize := 0, 0
	return req.CommonAlbumCompressConfigSaveReq{Enabled: &enabled, MinSizeKB: &minSize, JpegQuality: 91, PngCompressionLevel: "best"}
}

// TestAlbumCompressSaveFailureRollsBackAllFields 函数说明：四个字段任意写入失败，原策略及无关配置必须全部保留。
func TestAlbumCompressSaveFailureRollsBackAllFields(t *testing.T) {
	original := map[string]string{materialCompressEnabledConfigName: "1", materialCompressMinSizeKBConfigName: "300", materialCompressJpegQualityConfigName: "82", materialCompressPngLevelConfigName: "default", "unrelated": "keep"}
	for _, failed := range []string{materialCompressEnabledConfigName, materialCompressMinSizeKBConfigName, materialCompressJpegQualityConfigName, materialCompressPngLevelConfigName} {
		t.Run(failed, func(t *testing.T) {
			db, store := newAlbumCompressDB(t, original)
			store.failKey = failed
			err := (albumService{db: db}).AlbumCompressConfigSave(albumCompressFixture())
			if err == nil || !reflect.DeepEqual(store.values, original) || store.begins != 1 || store.commits != 0 || store.rollbacks != 1 {
				t.Fatalf("partial compression strategy survived failure: values=%v", store.values)
			}
		})
	}
}

// TestAlbumCompressSaveKeepsZeroAndUnrelatedFields 函数说明：完整成功保存保留显式零值，仅发布四个策略字段。
func TestAlbumCompressSaveKeepsZeroAndUnrelatedFields(t *testing.T) {
	db, store := newAlbumCompressDB(t, map[string]string{"unrelated": "keep"})
	if err := (albumService{db: db}).AlbumCompressConfigSave(albumCompressFixture()); err != nil {
		t.Fatal(err)
	}
	want := map[string]string{materialCompressEnabledConfigName: "0", materialCompressMinSizeKBConfigName: "0", materialCompressJpegQualityConfigName: "91", materialCompressPngLevelConfigName: "best", "unrelated": "keep"}
	if !reflect.DeepEqual(store.values, want) || store.begins != 1 || store.commits != 1 || store.rollbacks != 0 {
		t.Fatalf("unexpected saved compression strategy: values=%v", store.values)
	}
}

// TestAlbumCompressSaveMissingFieldDoesNotOpenTransaction 函数说明：服务层调用未经过路由时也拒绝缺失的关键字段。
func TestAlbumCompressSaveMissingFieldDoesNotOpenTransaction(t *testing.T) {
	if err := (albumService{}).AlbumCompressConfigSave(req.CommonAlbumCompressConfigSaveReq{}); err == nil {
		t.Fatal("missing compression fields must fail before database access")
	}
}
