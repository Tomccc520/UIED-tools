package defaults

import (
	_ "embed"
	"regexp"
	"strings"
)

//go:embed tools_changelog_timeline.json
var toolsChangelogTimelineJSON string

// 识别项目历次发布的默认文本，保留运营自定义说明和未来版本。
var legacyChangelogTitle = regexp.MustCompile(`^3\.0\.[13456] 全栈开源说明$`)
var legacyChangelogStats = regexp.MustCompile(`^当前版本：3\.0\.[13456] 全栈开源版 \| 当前工具总数：33[34]个 \| 最后更新：(2026-08-25 14:17|2026-08-28 18:00|2026-09-12 15:50|2026-10-20|2026-10-21|2026-10-25)$`)

// NormalizeChangelogTitle 返回主站和后台共用的开源说明标题，旧默认标题随版本升级。
func NormalizeChangelogTitle(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" || legacyChangelogTitle.MatchString(value) {
		return "3.0.7 全栈开源说明"
	}
	return value
}

// NormalizeChangelogDescription 统一替换上一版默认说明，保留运营编写的正文。
func NormalizeChangelogDescription(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" || value == "主站、Go API、Arco Pro 管理后台与部署工具按 MIT 协议开放源码。3.0.6 完善站点配置请求可靠性、工具页首个 HTML 预渲染及独立 SEO，继续保持未知路径真实 404 与非必要商业化入口默认隐藏。" {
		return "主站、Go API、Arco Pro 管理后台与部署工具按 MIT 协议开放源码。"
	}
	return value
}

// NormalizeChangelogStats 返回当前版本的默认统计说明，仅升级与旧版默认格式匹配的记录。
func NormalizeChangelogStats(raw string) string {
	value := strings.TrimSpace(raw)
	if value == "" || legacyChangelogStats.MatchString(value) ||
		value == "当前版本：3.0.7 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-11-20" {
		return "当前版本：3.0.7 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-11-25"
	}
	return value
}
