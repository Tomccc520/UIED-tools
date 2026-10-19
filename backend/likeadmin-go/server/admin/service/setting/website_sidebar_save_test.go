package setting

import (
	"likeadmin/admin/schemas/req"
	defaults "likeadmin/admin/service/defaults"
	"reflect"
	"testing"
)

// stringPointer 函数说明：生成字符串指针，便于构造部分字段保存请求。
func stringPointer(value string) *string {
	return &value
}

// TestBuildWebsiteConfigUpdatesSidebar 函数说明：验证侧栏请求仍只保存已提交字段，并保持原有规范化规则。
func TestBuildWebsiteConfigUpdatesSidebar(t *testing.T) {
	updates := buildWebsiteConfigUpdates(req.SettingWebsiteReq{
		ToolsSidebarBrandText:      stringPointer("  UIED-Tools  "),
		ToolsSidebarRecommendTitle: stringPointer("  推荐工具  "),
		ToolsSidebarMenuBlocks:     stringPointer("not-json"),
	})
	values := make(map[string]string, len(updates))
	for _, update := range updates {
		values[update.name] = update.value
	}
	if len(values) != 3 {
		t.Fatalf("expected 3 updates, got %d", len(values))
	}
	if values[toolsSidebarBrandTextConfigName] != "UIED-Tools" {
		t.Fatalf("unexpected brand text: %q", values[toolsSidebarBrandTextConfigName])
	}
	if values[toolsSidebarRecommendTitleConfigName] != "推荐工具" {
		t.Fatalf("unexpected recommend title: %q", values[toolsSidebarRecommendTitleConfigName])
	}
	if values[toolsSidebarMenuBlocksConfigName] != toolsSidebarMenuBlocksDefaultJSON {
		t.Fatalf("unexpected menu blocks: %q", values[toolsSidebarMenuBlocksConfigName])
	}
}

// TestBuildWebsiteConfigUpdatesMixedRequest 函数说明：混合页面字段也必须只生成本次提供的键，禁止回写其它配置。
func TestBuildWebsiteConfigUpdatesMixedRequest(t *testing.T) {
	updates := buildWebsiteConfigUpdates(req.SettingWebsiteReq{
		ToolsSidebarBrandText: stringPointer("UIED-Tools"),
		ToolsFooterIntro:      stringPointer("footer"),
	})
	if len(updates) != 2 || updates[0].name != toolsSidebarBrandTextConfigName || updates[1].name != toolsFooterIntroConfigName {
		t.Fatalf("mixed request generated unrelated updates: %+v", updates)
	}
}

// TestBuildWebsiteConfigUpdatesEmptyRequest 函数说明：空请求必须无更新且不依赖数据库，防止默认值意外覆盖已配置内容。
func TestBuildWebsiteConfigUpdatesEmptyRequest(t *testing.T) {
	updates := buildWebsiteConfigUpdates(req.SettingWebsiteReq{})
	if len(updates) != 0 {
		t.Fatalf("empty request generated updates: %+v", updates)
	}
	if err := (settingWebsiteService{}).Save(req.SettingWebsiteReq{}); err != nil {
		t.Fatalf("empty save should not access database: %v", err)
	}
}

// TestBuildWebsiteConfigUpdatesCoversRequestFields 函数说明：每个公开请求字段必须有唯一白名单映射，新增字段若忘记接入保存会在测试中暴露。
func TestBuildWebsiteConfigUpdatesCoversRequestFields(t *testing.T) {
	requestType := reflect.TypeOf(req.SettingWebsiteReq{})
	for index := 0; index < requestType.NumField(); index++ {
		field := requestType.Field(index)
		t.Run(field.Name, func(t *testing.T) {
			request := req.SettingWebsiteReq{}
			reflect.ValueOf(&request).Elem().Field(index).Set(reflect.ValueOf(stringPointer("[]")))
			updates := buildWebsiteConfigUpdates(request)
			if len(updates) != 1 || updates[0].name != field.Tag.Get("json") {
				t.Fatalf("expected only %s, got %+v", field.Tag.Get("json"), updates)
			}
		})
	}
}

// TestBuildWebsiteConfigUpdatesExplicitClear 函数说明：显式空字符串应清除允许留空的字段，不能当作未传或回填默认值。
func TestBuildWebsiteConfigUpdatesExplicitClear(t *testing.T) {
	updates := buildWebsiteConfigUpdates(req.SettingWebsiteReq{
		ToolsSeoDefaultTitle: stringPointer(""),
		ToolsHeaderLinks:     stringPointer("[]"),
	})
	if len(updates) != 2 || updates[0].name != toolsHeaderLinksConfigName || updates[0].value != "[]" || updates[1].value != "" {
		t.Fatalf("explicit empty values were not retained: %+v", updates)
	}
}

// TestBuildWebsiteConfigUpdatesLearningPatch 函数说明：每日学习的单键修改必须规范化自身，不写入该模块其它字段的默认值。
func TestBuildWebsiteConfigUpdatesLearningPatch(t *testing.T) {
	tests := []struct {
		name string
		req  req.SettingWebsiteReq
		key  string
		want string
	}{
		{"limit", req.SettingWebsiteReq{ToolsHomepageLearningLimit: stringPointer("999")}, defaults.ToolsHomepageLearningLimitConfigName, "50"},
		{"disabled", req.SettingWebsiteReq{ToolsHomepageLearningEnabled: stringPointer("false")}, defaults.ToolsHomepageLearningEnabledConfigName, "0"},
		{"ids", req.SettingWebsiteReq{ToolsHomepageLearningCategoryIDs: stringPointer(" 1,2,1,bad ")}, defaults.ToolsHomepageLearningCategoryIDsConfigName, "1,2"},
		{"slug", req.SettingWebsiteReq{ToolsHomepageLearningCategorySlug: stringPointer(" ai ")}, defaults.ToolsHomepageLearningCategorySlugConfigName, "ai"},
		{"title", req.SettingWebsiteReq{ToolsHomepageLearningTitle: stringPointer("  ")}, defaults.ToolsHomepageLearningTitleConfigName, defaults.HomepageLearningDefaultTitle},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			updates := buildWebsiteConfigUpdates(test.req)
			if len(updates) != 1 || updates[0].name != test.key || updates[0].value != test.want {
				t.Fatalf("unexpected learning patch: %+v", updates)
			}
		})
	}
}

// TestSaveWebsiteRejectsRSSBeforeWrite 函数说明：不受信任的 RSS 地址必须在事务前被拒绝，不进行任何数据库访问。
func TestSaveWebsiteRejectsRSSBeforeWrite(t *testing.T) {
	if err := (settingWebsiteService{}).Save(req.SettingWebsiteReq{
		ToolsHomepageLearningRssURL: stringPointer("http://127.0.0.1/private"),
	}); err == nil {
		t.Fatal("invalid RSS URL was accepted")
	}
}
