package setting

import (
	"testing"

	"likeadmin/admin/schemas/req"
)

// TestStorageListIndependent 验证修改某个请求的返回行不会污染其他请求。
func TestStorageListIndependent(t *testing.T) {
	service := NewSettingStorageService(nil)
	first, _ := service.List()
	second, _ := service.List()
	first[0]["name"] = "仅此请求"
	if second[0]["name"] != "本地存储" || second[0]["status"] != 1 {
		t.Fatal("存储列表共享了可变行")
	}
}

// TestStorageRejectsUnsupportedChanges 验证唯一上传引擎不能被关闭，也不能切到尚未接入的引擎。
func TestStorageRejectsUnsupportedChanges(t *testing.T) {
	service := NewSettingStorageService(nil)
	for _, edit := range []req.SettingStorageEditReq{{Alias: "local", Status: 0}, {Alias: "qiniu", Status: 1}} {
		if err := service.Edit(edit); err == nil {
			t.Fatal("不应保存无效的引擎配置")
		}
		if err := service.Change(edit.Alias, edit.Status); err == nil {
			t.Fatal("不应切换到无效的引擎配置")
		}
	}
}
