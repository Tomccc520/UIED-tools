package setting

import (
	"likeadmin/admin/schemas/req"
	"testing"
)

// stringPointer 函数说明：生成字符串指针，便于构造部分字段保存请求。
func stringPointer(value string) *string {
	return &value
}

// TestBuildSidebarWebsiteConfigUpdates 函数说明：验证侧栏请求只生成已提交字段，并执行必要规范化。
func TestBuildSidebarWebsiteConfigUpdates(t *testing.T) {
	updates, sidebarOnly := buildSidebarWebsiteConfigUpdates(req.SettingWebsiteReq{
		ToolsSidebarBrandText:      stringPointer("  UIED-Tools  "),
		ToolsSidebarRecommendTitle: stringPointer("  推荐工具  "),
		ToolsSidebarMenuBlocks:     stringPointer("not-json"),
	})
	if !sidebarOnly {
		t.Fatal("expected sidebar-only request")
	}
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

// TestBuildSidebarWebsiteConfigUpdatesRejectsMixedRequest 函数说明：混合其它官网字段时回退通用保存流程。
func TestBuildSidebarWebsiteConfigUpdatesRejectsMixedRequest(t *testing.T) {
	updates, sidebarOnly := buildSidebarWebsiteConfigUpdates(req.SettingWebsiteReq{
		ToolsSidebarBrandText: stringPointer("UIED-Tools"),
		ToolsFooterIntro:      stringPointer("footer"),
	})
	if sidebarOnly || updates != nil {
		t.Fatal("expected mixed request to use general website save flow")
	}
}

// TestBuildSidebarWebsiteConfigUpdatesRejectsEmptyRequest 函数说明：空请求不能误判为侧栏保存。
func TestBuildSidebarWebsiteConfigUpdatesRejectsEmptyRequest(t *testing.T) {
	updates, sidebarOnly := buildSidebarWebsiteConfigUpdates(req.SettingWebsiteReq{})
	if sidebarOnly || updates != nil {
		t.Fatal("expected empty request to use general website save flow")
	}
}
