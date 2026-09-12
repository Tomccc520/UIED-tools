package defaults

import (
	"encoding/json"
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
	if len(items) != 2 {
		t.Fatalf("期望补齐 3.0.3 并合并为 2 个版本，实际为 %d", len(items))
	}
	if items[0].Version != "3.0.3" {
		t.Fatalf("期望最新版本排在首位，实际为 %s", items[0].Version)
	}
	legacyItem := items[1]
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
