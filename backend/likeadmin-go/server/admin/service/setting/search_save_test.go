/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package setting

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"reflect"
	"testing"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"likeadmin/admin/schemas/req"
)

type searchSaveTestConnector struct{ store *websitePatchTestStore }
type searchSaveTestConn struct{ *websitePatchTestConn }

// Connect 函数说明：复用隔离事务存储，每个连接单独校验搜索配置类型，不连接真实数据库。
func (connector searchSaveTestConnector) Connect(context.Context) (driver.Conn, error) {
	return &searchSaveTestConn{websitePatchTestConn: &websitePatchTestConn{store: connector.store}}, nil
}

// Driver 函数说明：提供标准库连接器驱动，实际连接由当前连接器创建。
func (connector searchSaveTestConnector) Driver() driver.Driver {
	return websitePatchTestDriver{store: connector.store}
}

// ExecContext 函数说明：确保真实 SQL 仅写搜索配置，再适配已有内存事务驱动。
func (conn *searchSaveTestConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	if len(args) < 3 || args[len(args)-2].Value != searchConfigType {
		return nil, errors.New("search save must only write search configuration")
	}
	adapted := append([]driver.NamedValue(nil), args...)
	adapted[len(adapted)-2].Value = "website"
	return conn.websitePatchTestConn.ExecContext(ctx, query, adapted)
}

// newSearchSaveTestDB 函数说明：使用真实 MySQL 方言与 GORM 事务，数据仅保存在测试内存中。
func newSearchSaveTestDB(t *testing.T, values map[string]string) (*gorm.DB, *websitePatchTestStore) {
	t.Helper()
	store := &websitePatchTestStore{values: make(map[string]string)}
	for name, value := range values {
		store.values[name] = value
	}
	sqlDB := sql.OpenDB(searchSaveTestConnector{store: store})
	t.Cleanup(func() { _ = sqlDB.Close() })
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatalf("open isolated search database: %v", err)
	}
	return db, store
}

// TestSearchSaveSecondFailureRollsBack 函数说明：词条写入失败必须回滚此前的启用状态，不留下半次保存。
func TestSearchSaveSecondFailureRollsBack(t *testing.T) {
	original := map[string]string{searchConfigIsHotSearchKey: "0", searchConfigListKey: `[{"name":"原词条","sort":2}]`}
	db, store := newSearchSaveTestDB(t, original)
	store.failKey = searchConfigListKey
	err := (settingSearchService{db: db}).Save(req.SettingSearchReq{IsHotSearch: 1, List: []req.SettingSearchItemReq{{Name: "新词条", Sort: 1}}})
	if err == nil || !websitePatchValuesEqual(store.values, original) || store.begins != 1 || store.commits != 0 || store.rollbacks != 1 {
		t.Fatalf("search save left partial state: begins=%d commits=%d rollbacks=%d", store.begins, store.commits, store.rollbacks)
	}
}

// TestSearchSaveKeepsNormalizationAndEmptyList 函数说明：成功保存保留既有词条清洗与清空语义，其他配置不受影响。
func TestSearchSaveKeepsNormalizationAndEmptyList(t *testing.T) {
	for _, fixture := range []req.SettingSearchReq{
		{IsHotSearch: 1, List: []req.SettingSearchItemReq{{Name: "  PDF 压缩  ", Sort: -2}, {Name: " ", Sort: 1}, {Name: "JSON", Sort: 5}}},
		{IsHotSearch: 0, List: []req.SettingSearchItemReq{}},
	} {
		db, store := newSearchSaveTestDB(t, map[string]string{searchConfigIsHotSearchKey: "1", searchConfigListKey: "old list", "unrelated": "keep"})
		if err := (settingSearchService{db: db}).Save(fixture); err != nil {
			t.Fatal(err)
		}
		var got []req.SettingSearchItemReq
		if err := json.Unmarshal([]byte(store.values[searchConfigListKey]), &got); err != nil {
			t.Fatal(err)
		}
		if !reflect.DeepEqual(got, normalizeSearchItems(fixture.List)) || store.values["unrelated"] != "keep" || len(store.values) != 3 || store.begins != 1 || store.commits != 1 {
			t.Fatalf("search content or transaction differs: values=%v", store.values)
		}
	}
}
