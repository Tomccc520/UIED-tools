package defaults

import (
	_ "embed"
	"encoding/json"
)

//go:embed tools_changelog_timeline.json
var toolsChangelogTimelineJSON string

/**
 * 函数说明：返回更新记录页默认时间线 JSON，供后台配置缺省时直接回填。
 */
func GetToolsChangelogTimelineJSON() string {
	return toolsChangelogTimelineJSON
}

/**
 * 函数说明：返回更新记录页默认时间线数组，供公共配置接口未配置时直接下发。
 */
func GetToolsChangelogTimelineItems() []map[string]interface{} {
	items := make([]map[string]interface{}, 0)
	if err := json.Unmarshal([]byte(toolsChangelogTimelineJSON), &items); err != nil {
		return []map[string]interface{}{}
	}
	return NormalizeToolsChangelogTimelineItems(items)
}
