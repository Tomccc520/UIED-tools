/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package setting

import (
	"strings"
	"testing"

	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
)

// dictTypeStatusTestPointer 创建明确传入的测试状态，不与缺失字段混淆。
func dictTypeStatusTestPointer(value int8) *int8 { return &value }

// TestDictTypeAddPreservesDisabledInsertSQL 使用真实GORM生成SQL，验证模型默认值不会把新增停用状态改成启用。
func TestDictTypeAddPreservesDisabledInsertSQL(t *testing.T) {
	for _, status := range []int8{0, 1} {
		t.Run(string(rune('0'+status)), func(t *testing.T) {
			db, _ := newWebsitePatchTestDB(t, nil)
			db = db.Session(&gorm.Session{DryRun: true, SkipDefaultTransaction: true})
			var capturedSQL string
			var capturedStatus interface{}
			var capturedCreated, capturedUpdated interface{}
			if err := db.Callback().Create().After("gorm:create").Register("dict-status-create-test", func(tx *gorm.DB) {
				capturedSQL = tx.Statement.SQL.String()
				values, ok := tx.Statement.Dest.(map[string]interface{})
				if !ok {
					t.Errorf("新增必须显式保留零值，实际目标 %T", tx.Statement.Dest)
					return
				}
				capturedStatus = values["dict_status"]
				capturedCreated = values["create_time"]
				capturedUpdated = values["update_time"]
			}); err != nil {
				t.Fatal(err)
			}
			err := (settingDictTypeService{db: db}).Add(req.SettingDictTypeAddReq{DictName: "示例", DictType: "example", DictRemark: "保留备注", DictStatus: dictTypeStatusTestPointer(status)})
			if err != nil {
				t.Fatal(err)
			}
			if !strings.Contains(capturedSQL, "`dict_status`") || capturedStatus != uint8(status) {
				t.Fatalf("新增状态未按实际值写入: sql=%s status=%v", capturedSQL, capturedStatus)
			}
			created, ok := capturedCreated.(int64)
			if !ok || created <= 0 || capturedUpdated != capturedCreated {
				t.Fatalf("显式插入遗漏原自动时间戳: created=%v updated=%v", capturedCreated, capturedUpdated)
			}
		})
	}
}

// TestDictTypeEditPreservesZeroUpdateSQL 编辑保存的SQL必须包含关闭值，不能因零值被省略。
func TestDictTypeEditPreservesZeroUpdateSQL(t *testing.T) {
	for _, status := range []int8{0, 1} {
		t.Run(string(rune('0'+status)), func(t *testing.T) {
			db, _ := newWebsitePatchTestDB(t, nil)
			db = db.Session(&gorm.Session{DryRun: true, SkipDefaultTransaction: true})
			var capturedSQL string
			var capturedStatus interface{}
			if err := db.Callback().Update().After("gorm:update").Register("dict-status-update-test", func(tx *gorm.DB) {
				capturedSQL = tx.Statement.SQL.String()
				capturedStatus, _ = tx.Statement.Schema.LookUpField("DictStatus").ValueOf(tx.Statement.Context, tx.Statement.ReflectValue)
			}); err != nil {
				t.Fatal(err)
			}
			err := (settingDictTypeService{db: db}).Edit(req.SettingDictTypeEditReq{ID: 3, DictName: "示例", DictType: "example", DictRemark: "保留备注", DictStatus: dictTypeStatusTestPointer(status)})
			if err != nil {
				t.Fatal(err)
			}
			if !strings.Contains(capturedSQL, "`dict_status`=?") || capturedStatus != uint8(status) {
				t.Fatalf("编辑状态未按实际值写入: sql=%s status=%v", capturedSQL, capturedStatus)
			}
		})
	}
}

// TestDictTypeServiceRejectsMissingStatus 未经路由校验的内部调用也必须拒绝缺失或非法状态，不能解引用崩溃。
func TestDictTypeServiceRejectsMissingStatus(t *testing.T) {
	service := settingDictTypeService{}
	for _, status := range []*int8{nil, dictTypeStatusTestPointer(-1), dictTypeStatusTestPointer(2)} {
		if err := service.Add(req.SettingDictTypeAddReq{DictStatus: status}); err == nil {
			t.Fatal("新增未拒绝无效状态")
		}
		if err := service.Edit(req.SettingDictTypeEditReq{DictStatus: status}); err == nil {
			t.Fatal("编辑未拒绝无效状态")
		}
	}
}
