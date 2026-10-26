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

type protocolSaveTestConnector struct{ store *websitePatchTestStore }
type protocolSaveTestConn struct{ *websitePatchTestConn }

// Connect 函数说明：复用已有内存事务存储，每条协议连接仅增加配置类型校验，不访问真实数据库。
func (connector protocolSaveTestConnector) Connect(context.Context) (driver.Conn, error) {
	return &protocolSaveTestConn{websitePatchTestConn: &websitePatchTestConn{store: connector.store}}, nil
}

// Driver 函数说明：返回隔离测试驱动，database/sql 的实际连接由当前连接器创建。
func (connector protocolSaveTestConnector) Driver() driver.Driver {
	return websitePatchTestDriver{store: connector.store}
}

// ExecContext 函数说明：确保真实 SQL 写的是 protocol 类型，再适配到公共内存事务驱动的 website 类型。
func (conn *protocolSaveTestConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	if len(args) < 3 || args[len(args)-2].Value != "protocol" {
		return nil, errors.New("protocol save must only write protocol configuration")
	}
	adapted := append([]driver.NamedValue(nil), args...)
	adapted[len(adapted)-2].Value = "website"
	return conn.websitePatchTestConn.ExecContext(ctx, query, adapted)
}

// newProtocolSaveTestDB 函数说明：使用项目现有 MySQL 方言生成真实 SQL，事务数据仅存于测试内存中。
func newProtocolSaveTestDB(t *testing.T, values map[string]string) (*gorm.DB, *websitePatchTestStore) {
	t.Helper()
	store := &websitePatchTestStore{values: make(map[string]string)}
	for name, value := range values {
		store.values[name] = value
	}
	sqlDB := sql.OpenDB(protocolSaveTestConnector{store: store})
	t.Cleanup(func() { _ = sqlDB.Close() })
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatalf("open isolated protocol test database: %v", err)
	}
	return db, store
}

// TestProtocolSaveSecondFailureRollsBackService 函数说明：隐私协议写入失败时，前面的服务协议也必须回滚。
func TestProtocolSaveSecondFailureRollsBackService(t *testing.T) {
	original := map[string]string{"service": `{"name":"原服务协议","content":"原正文"}`, "privacy": `{"name":"原隐私政策","content":"原隐私正文"}`}
	db, store := newProtocolSaveTestDB(t, original)
	store.failKey = "privacy"
	err := (settingProtocolService{db: db}).Save(req.SettingProtocolReq{Service: req.SettingProtocolItem{Name: "新服务协议", Content: "新正文"}, Privacy: req.SettingProtocolItem{Name: "新隐私政策", Content: "新隐私正文"}})
	if err == nil || !websitePatchValuesEqual(store.values, original) || store.begins != 1 || store.commits != 0 || store.rollbacks != 1 {
		t.Fatalf("第二项失败留下了部分更新: values=%v begins=%d commits=%d rollbacks=%d error=%v", store.values, store.begins, store.commits, store.rollbacks, err)
	}
}

// TestProtocolSaveKeepsOriginalHTMLAndWhitespace 函数说明：同一事务保存两项时不改正文 HTML、名称空白或空内容。
func TestProtocolSaveKeepsOriginalHTMLAndWhitespace(t *testing.T) {
	for _, fixture := range []req.SettingProtocolReq{
		{Service: req.SettingProtocolItem{Name: "  服务协议 \t", Content: "\r\n  <p data-x=\"a  b\">甲&nbsp;乙</p>\n<script type=\"application/ld+json\">{\"keep\":true}</script>\t"}, Privacy: req.SettingProtocolItem{Name: "隐私政策\n", Content: " <div><strong>保留格式</strong><br />\n  第二行</div> "}},
		{Service: req.SettingProtocolItem{Name: "", Content: ""}, Privacy: req.SettingProtocolItem{Name: " \t", Content: " \n\t"}},
	} {
		db, store := newProtocolSaveTestDB(t, map[string]string{"service": "old service", "privacy": "old privacy", "unrelated": "keep"})
		if err := (settingProtocolService{db: db}).Save(fixture); err != nil {
			t.Fatal(err)
		}
		var service, privacy req.SettingProtocolItem
		if err := json.Unmarshal([]byte(store.values["service"]), &service); err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal([]byte(store.values["privacy"]), &privacy); err != nil {
			t.Fatal(err)
		}
		if !reflect.DeepEqual(service, fixture.Service) || !reflect.DeepEqual(privacy, fixture.Privacy) || store.values["unrelated"] != "keep" || len(store.values) != 3 || store.begins != 1 || store.commits != 1 {
			t.Fatalf("协议未按原值整体提交: begins=%d commits=%d", store.begins, store.commits)
		}
	}
}
