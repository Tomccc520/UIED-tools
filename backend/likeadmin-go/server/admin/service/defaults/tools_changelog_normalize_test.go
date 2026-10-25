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
	if len(items) != 5 {
		t.Fatalf("期望补齐 3.0.6、3.0.5、3.0.4、3.0.3 并合并为 5 个版本，实际为 %d", len(items))
	}
	if items[0].Version != "3.0.6" || items[1].Version != "3.0.5" || items[2].Version != "3.0.4" || items[3].Version != "3.0.3" {
		t.Fatalf("期望最新版本排在首位，实际为 %s", items[0].Version)
	}
	legacyItem := items[4]
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
 * 函数说明：验证旧存储会补齐缺失的 3.0.6、3.0.5 和 3.0.4，且已有 3.0.3 自定义标题与数据保持不变。
 */
func TestNormalizeToolsChangelogTimelineJSONAdds306ToStoredTimeline(t *testing.T) {
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
	if len(items) != 4 || items[0].Version != "3.0.6" || items[1].Version != "3.0.5" || items[2].Version != "3.0.4" {
		t.Fatalf("旧存储未正确补齐最新版本: %#v", items)
	}
	if !reflect.DeepEqual(items[:3], defaults[:3]) {
		t.Fatalf("新版本内容应与默认发布记录一致: %#v", items[0])
	}
	if !reflect.DeepEqual(items[3], storedItems[0]) {
		t.Fatalf("旧版本自定义内容被覆盖: %#v", items[3])
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
	if len(actual) != 4 || actual[0].Version != "3.0.6" || actual[1].Version != "3.0.5" || !reflect.DeepEqual(actual[2:], expected) {
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
	if len(actual) != 4 || actual[0].Version != "3.0.6" || actual[1].Version != "3.0.5" || !reflect.DeepEqual(actual[2], expected[0]) || actual[3].Version != "3.0.3" {
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

/**
 * 函数说明：验证已维护的 3.0.5 不会被默认内容覆盖，缺失历史版本按发布顺序补齐且重复读取稳定。
 */
func TestNormalizeToolsChangelogTimelineJSONPreservesCustom305(t *testing.T) {
	raw := `[{"id":"custom-305","version":"3.0.5","date":"2026-10-22","badgeText":"运营发布","badgeType":"warning","title":"自定义 3.0.5","features":[{"title":"自定义说明","points":["保留运营维护内容"]}]}]`
	var stored, actual []toolsChangelogTimelineItem
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		t.Fatalf("解析测试数据失败: %v", err)
	}
	result := NormalizeToolsChangelogTimelineJSON(raw)
	if err := json.Unmarshal([]byte(result), &actual); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if len(actual) != 4 || actual[0].Version != "3.0.6" || !reflect.DeepEqual(actual[1], stored[0]) || actual[2].Version != "3.0.4" || actual[3].Version != "3.0.3" {
		t.Fatalf("自定义最新版本被覆盖或历史版本顺序错误: %#v", actual)
	}
	if repeated := NormalizeToolsChangelogTimelineJSON(result); repeated != result {
		t.Fatal("重复读取不应改变自定义记录或重复添加历史版本")
	}
}

/**
 * 函数说明：验证同时存在的 3.0.5 与 3.0.4 自定义记录完整保留，前插 3.0.6 并在末尾补入缺失的 3.0.3。
 */
func TestNormalizeToolsChangelogTimelineJSONPreservesCustom305And304(t *testing.T) {
	raw := `[
		{"id":"custom-305","version":"3.0.5","date":"2026-10-22","badgeText":"新发布","badgeType":"warning","title":"运营维护新版","features":[{"title":"新版说明","points":["保留新版本正文"]}]},
		{"id":"custom-304","version":"3.0.4","date":"2026-10-20","badgeText":"旧发布","badgeType":"info","title":"运营维护旧版","features":[{"title":"旧版说明","points":["保留旧版本正文"]}]}
	]`
	var stored, actual []toolsChangelogTimelineItem
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		t.Fatalf("解析测试数据失败: %v", err)
	}
	if err := json.Unmarshal([]byte(NormalizeToolsChangelogTimelineJSON(raw)), &actual); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if len(actual) != 4 || actual[0].Version != "3.0.6" || !reflect.DeepEqual(actual[1:3], stored) || actual[3].Version != "3.0.3" {
		t.Fatalf("已有版本内容被覆盖或补齐位置错误: %#v", actual)
	}
}

/**
 * 函数说明：验证运营已维护的 3.0.6 和 3.0.5 原样保留，历史版本按顺序补齐且重复读取稳定。
 */
func TestNormalizeToolsChangelogTimelineJSONPreservesCustom306And305(t *testing.T) {
	raw := `[
  {"id":"custom-306","version":"3.0.6","date":"2026-10-26","badgeText":"运营新版","badgeType":"warning","title":"运营维护 3.0.6","features":[{"title":"自定义 SEO 说明","points":["保留当版定制内容"]}]},
  {"id":"custom-305","version":"3.0.5","date":"2026-10-22","badgeText":"旧版备注","badgeType":"info","title":"运营维护 3.0.5","features":[{"title":"自定义工具说明","points":["保留旧版定制内容"]}]}
 ]`
	var stored, actual []toolsChangelogTimelineItem
	if err := json.Unmarshal([]byte(raw), &stored); err != nil {
		t.Fatalf("解析测试数据失败: %v", err)
	}
	result := NormalizeToolsChangelogTimelineJSON(raw)
	if err := json.Unmarshal([]byte(result), &actual); err != nil {
		t.Fatalf("解析归一化结果失败: %v", err)
	}
	if len(actual) != 4 || !reflect.DeepEqual(actual[:2], stored) || actual[2].Version != "3.0.4" || actual[3].Version != "3.0.3" {
		t.Fatalf("自定义版本被覆盖或历史补齐顺序错误: %#v", actual)
	}
	if repeated := NormalizeToolsChangelogTimelineJSON(result); repeated != result {
		t.Fatal("重复读取不应覆盖运营记录或新增重复发布版本")
	}
}
