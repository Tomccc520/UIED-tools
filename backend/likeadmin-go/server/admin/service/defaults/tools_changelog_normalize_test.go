package defaults

import (
	"encoding/json"
	"reflect"
	"testing"
)

/**
 * 函数说明：验证更新时间线会合并重复版本、功能块以及忽略 HTML 差异的重复描述。
 */
func TestNormalizeToolsChangelogTimelineJSON(t *testing.T) {
	raw := `[
		{"id":"v1","version":"1.0.0","date":"2026-08-25","badgeText":"发布","badgeType":"success","title":"首次发布","features":[{"title":"功能更新","points":["新增 <strong>搜索</strong>","移动端适配"]}]},
		{"id":"v1-copy","version":"1.0.0","date":"2026-08-26","badgeText":"优化","badgeType":"info","title":"重复版本","features":[{"title":"功能更新","points":["新增 搜索","增加版本筛选"]},{"title":"体验优化</div><div class=\"legacy\">旧结构","points":["移动端适配","无阴影卡片"]}]}
	]`

	normalizedJSON := NormalizeToolsChangelogTimelineJSON(raw)
	items := make([]toolsChangelogTimelineItem, 0)
	if err := json.Unmarshal([]byte(normalizedJSON), &items); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("期望补齐 3.0.4、3.0.3 并合并为 3 个版本，实际为 %d", len(items))
	}
	if items[0].Version != "3.0.4" || items[1].Version != "3.0.3" {
		t.Fatalf("期望最新版本排在首位，实际为 %s", items[0].Version)
	}
	legacyItem := items[2]
	if legacyItem.Title != "首次发布" {
		t.Fatalf("期望保留首次版本标题，实际为 %s", legacyItem.Title)
	}
	if len(legacyItem.Features) != 2 {
		t.Fatalf("期望保留 2 个功能块，实际为 %d", len(legacyItem.Features))
	}
	if len(legacyItem.Features[0].Points) != 3 {
		t.Fatalf("期望功能更新包含 3 条去重描述，实际为 %d", len(legacyItem.Features[0].Points))
	}
	if len(legacyItem.Features[1].Points) != 1 || legacyItem.Features[1].Points[0] != "无阴影卡片" {
		t.Fatalf("跨功能块重复描述未正确移除: %#v", legacyItem.Features[1].Points)
	}
	if legacyItem.Features[1].Title != "体验优化" {
		t.Fatalf("历史 HTML 功能标题未正确清洗: %s", legacyItem.Features[1].Title)
	}
}

/**
 * 函数说明：验证旧存储会补齐缺失的 3.0.4，且已有 3.0.3 自定义标题与数据保持不变。
 */
func TestNormalizeToolsChangelogTimelineJSONAdds304ToStoredTimeline(t *testing.T) {
	raw := `[{"id":"custom-303","version":"3.0.3","date":"2026-09-15","badgeText":"运营备注","badgeType":"warning","title":"我维护的旧版本","features":[{"title":"自定义功能","points":["保留这条运营描述"]}]}]`
	var storedItems, defaults, items []toolsChangelogTimelineItem
	for source, target := range map[string]*[]toolsChangelogTimelineItem{
		raw: &storedItems, toolsChangelogTimelineJSON: &defaults,
	} {
		if err := json.Unmarshal([]byte(source), target); err != nil {
			t.Fatalf("解析测试数据失败: %v", err)
		}
	}
	result := NormalizeToolsChangelogTimelineJSON(raw)
	if err := json.Unmarshal([]byte(result), &items); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if len(items) != 2 || items[0].Version != "3.0.4" {
		t.Fatalf("旧存储未正确补齐最新版本: %#v", items)
	}
	if !reflect.DeepEqual(items[0], defaults[0]) {
		t.Fatalf("新版本内容应与默认发布记录一致: %#v", items[0])
	}
	if !reflect.DeepEqual(items[1], storedItems[0]) {
		t.Fatalf("旧版本自定义内容被覆盖: %#v", items[1])
	}
	if repeated := NormalizeToolsChangelogTimelineJSON(result); repeated != result {
		t.Fatal("重复读取配置时不应重复补入发布记录")
	}
}

/**
 * 函数说明：验证已配置的 3.0.4 保留自定义标题、日期、标签及功能，不被默认发布记录覆盖。
 */
func TestNormalizeToolsChangelogTimelineJSONPreservesCustom304(t *testing.T) {
	raw := `[
		{"id":"custom-304","version":"3.0.4","date":"2026-10-21","badgeText":"我的发布","badgeType":"warning","title":"自定义发布标题","features":[{"title":"运营维护","points":["自定义说明，不使用默认记录"]}]},
		{"id":"custom-303","version":"3.0.3","date":"2026-09-12","badgeText":"历史","badgeType":"info","title":"历史版本","features":[{"title":"历史功能","points":["保留历史记录"]}]}
	]`
	var expected, actual []toolsChangelogTimelineItem
	if err := json.Unmarshal([]byte(raw), &expected); err != nil {
		t.Fatalf("解析测试数据失败: %v", err)
	}
	if err := json.Unmarshal([]byte(NormalizeToolsChangelogTimelineJSON(raw)), &actual); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if !reflect.DeepEqual(actual, expected) {
		t.Fatalf("已有版本的自定义内容或顺序被修改: %#v", actual)
	}
	// 只有最新版本时，补齐的历史版本不能挤到最新版本前面。
	latestOnly, err := json.Marshal(expected[:1])
	if err != nil {
		t.Fatalf("编码最新版本测试数据失败: %v", err)
	}
	if err := json.Unmarshal([]byte(NormalizeToolsChangelogTimelineJSON(string(latestOnly))), &actual); err != nil {
		t.Fatalf("解析仅含最新版本的结果失败: %v", err)
	}
	if len(actual) != 2 || !reflect.DeepEqual(actual[0], expected[0]) || actual[1].Version != "3.0.3" {
		t.Fatalf("补齐历史版本时改变了最新版本内容或顺序: %#v", actual)
	}
}

/**
 * 函数说明：验证默认时间线中的历史重复版本只返回一份。
 */
func TestGetToolsChangelogTimelineItemsDeduplicatesVersions(t *testing.T) {
	items := GetToolsChangelogTimelineItems()
	versionSet := make(map[string]struct{})
	for _, item := range items {
		version, _ := item["version"].(string)
		if _, exists := versionSet[version]; exists {
			t.Fatalf("默认时间线仍包含重复版本: %s", version)
		}
		versionSet[version] = struct{}{}
	}
}
