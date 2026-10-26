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
	"errors"
	"testing"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type certificateSaveTestConnector struct{ store *websitePatchTestStore }
type certificateSaveTestConn struct{ *websitePatchTestConn }

// Connect 函数说明：复用隔离事务驱动，不连接真实数据库或微信服务。
func (connector certificateSaveTestConnector) Connect(context.Context) (driver.Conn, error) {
	return &certificateSaveTestConn{&websitePatchTestConn{store: connector.store}}, nil
}

// Driver 函数说明：返回内存驱动，实际连接由当前连接器创建。
func (connector certificateSaveTestConnector) Driver() driver.Driver {
	return websitePatchTestDriver{store: connector.store}
}

// ExecContext 函数说明：确认真实 SQL 限于登录配置，再适配公共内存事务存储。
func (conn *certificateSaveTestConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	if len(args) < 3 || args[len(args)-2].Value != loginConfigType {
		return nil, errors.New("certificate save must only update login configuration")
	}
	adapted := append([]driver.NamedValue(nil), args...)
	adapted[len(adapted)-2].Value = "website"
	return conn.websitePatchTestConn.ExecContext(ctx, query, adapted)
}

// newCertificateSaveTestDB 函数说明：使用真实 GORM/MySQL SQL 生成，数据与事务仅存于内存。
func newCertificateSaveTestDB(t *testing.T, values map[string]string) (*gorm.DB, *websitePatchTestStore) {
	t.Helper()
	store := &websitePatchTestStore{values: make(map[string]string)}
	for key, value := range values {
		store.values[key] = value
	}
	sqlDB := sql.OpenDB(certificateSaveTestConnector{store: store})
	t.Cleanup(func() { _ = sqlDB.Close() })
	db, err := gorm.Open(mysql.New(mysql.Config{Conn: sqlDB, SkipInitializeWithVersion: true}), &gorm.Config{DisableAutomaticPing: true, Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		t.Fatal(err)
	}
	return db, store
}

// TestCertificateSaveAnyFailureRollsBack 函数说明：五项中的任何一项失败，证书及元数据全部保持原值。
func TestCertificateSaveAnyFailureRollsBack(t *testing.T) {
	original := map[string]string{loginConfigPaymentWechatPlatCa: "old certificate", loginConfigPaymentWechatPlatSN: "old serial", loginConfigPaymentWechatPlatET: "old effective", loginConfigPaymentWechatPlatXP: "old expiry", loginConfigPaymentWechatSyncAt: "1", "unrelated": "keep"}
	for _, name := range []string{loginConfigPaymentWechatPlatCa, loginConfigPaymentWechatPlatSN, loginConfigPaymentWechatPlatET, loginConfigPaymentWechatPlatXP, loginConfigPaymentWechatSyncAt} {
		t.Run(name, func(t *testing.T) {
			db, store := newCertificateSaveTestDB(t, original)
			store.failKey = name
			err := (settingLoginService{db: db}).saveWechatPlatformCertificate("sample certificate", "new serial", "new effective", "new expiry", 77)
			if err == nil || !websitePatchValuesEqual(store.values, original) || store.commits != 0 || store.rollbacks != 1 {
				t.Fatal("证书保存失败未完整回滚")
			}
		})
	}
}

// TestCertificateSaveCommitsOneConsistentVersion 函数说明：成功时一次提交同一套证书和元数据，不改动其他登录设置。
func TestCertificateSaveCommitsOneConsistentVersion(t *testing.T) {
	db, store := newCertificateSaveTestDB(t, map[string]string{loginConfigPaymentWechatPlatCa: "old certificate", loginConfigPaymentWechatPlatSN: "old serial", loginConfigPaymentWechatPlatET: "old effective", loginConfigPaymentWechatPlatXP: "old expiry", loginConfigPaymentWechatSyncAt: "1", "unrelated": "keep"})
	if err := (settingLoginService{db: db}).saveWechatPlatformCertificate("sample certificate", " serial ", " effective ", " expiry ", 77); err != nil {
		t.Fatal(err)
	}
	expected := map[string]string{loginConfigPaymentWechatPlatCa: "sample certificate", loginConfigPaymentWechatPlatSN: "serial", loginConfigPaymentWechatPlatET: "effective", loginConfigPaymentWechatPlatXP: "expiry", loginConfigPaymentWechatSyncAt: "77", "unrelated": "keep"}
	if !websitePatchValuesEqual(store.values, expected) || store.begins != 1 || store.commits != 1 || store.rollbacks != 0 {
		t.Fatal("证书与元数据未在同一事务中完整保存")
	}
}
