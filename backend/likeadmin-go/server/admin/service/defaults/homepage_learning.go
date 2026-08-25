package defaults

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"
)

const (
	// 首页每日学习配置键名，供后台保存、网站配置和公共 RSS 接口统一使用。
	ToolsHomepageLearningEnabledConfigName      = "toolsHomepageLearningEnabled"
	ToolsHomepageLearningTitleConfigName        = "toolsHomepageLearningTitle"
	ToolsHomepageLearningRssURLConfigName       = "toolsHomepageLearningRssUrl"
	ToolsHomepageLearningFilterTypeConfigName   = "toolsHomepageLearningFilterType"
	ToolsHomepageLearningCategorySlugConfigName = "toolsHomepageLearningCategorySlug"
	ToolsHomepageLearningCategoryIDsConfigName  = "toolsHomepageLearningCategoryIds"
	ToolsHomepageLearningLimitConfigName        = "toolsHomepageLearningLimit"

	HomepageLearningDefaultTitle      = "每日学习"
	HomepageLearningDefaultRssURL     = "https://www.uied.cn/api/open/v1/rss.xml"
	HomepageLearningDefaultFilterType = "all"
	HomepageLearningDefaultLimit      = 20
	HomepageLearningMaxLimit          = 50
)

// HomepageLearningConfig 首页每日学习的结构化配置。
type HomepageLearningConfig struct {
	Enabled      bool
	Title        string
	RssURL       string
	FilterType   string
	CategorySlug string
	CategoryIDs  string
	Limit        int
}

// NormalizeHomepageLearningConfig 函数说明：读取网站配置并统一补齐首页每日学习默认值。
func NormalizeHomepageLearningConfig(values map[string]string) HomepageLearningConfig {
	cfg := HomepageLearningConfig{
		Enabled:      parseHomepageLearningBool(values[ToolsHomepageLearningEnabledConfigName], true),
		Title:        strings.TrimSpace(values[ToolsHomepageLearningTitleConfigName]),
		RssURL:       strings.TrimSpace(values[ToolsHomepageLearningRssURLConfigName]),
		FilterType:   normalizeHomepageLearningFilterType(values[ToolsHomepageLearningFilterTypeConfigName]),
		CategorySlug: strings.TrimSpace(values[ToolsHomepageLearningCategorySlugConfigName]),
		CategoryIDs:  normalizeHomepageLearningCategoryIDs(values[ToolsHomepageLearningCategoryIDsConfigName]),
		Limit:        normalizeHomepageLearningLimit(values[ToolsHomepageLearningLimitConfigName]),
	}
	if cfg.Title == "" {
		cfg.Title = HomepageLearningDefaultTitle
	}
	if !isAllowedHomepageLearningURL(cfg.RssURL) {
		cfg.RssURL = HomepageLearningDefaultRssURL
	}
	return cfg
}

// HomepageLearningConfigToWebsiteValues 函数说明：将结构化配置转换为网站配置中心使用的字符串值。
func HomepageLearningConfigToWebsiteValues(cfg HomepageLearningConfig) map[string]string {
	return map[string]string{
		ToolsHomepageLearningEnabledConfigName:      boolToHomepageLearningFlag(cfg.Enabled),
		ToolsHomepageLearningTitleConfigName:        strings.TrimSpace(cfg.Title),
		ToolsHomepageLearningRssURLConfigName:       strings.TrimSpace(cfg.RssURL),
		ToolsHomepageLearningFilterTypeConfigName:   normalizeHomepageLearningFilterType(cfg.FilterType),
		ToolsHomepageLearningCategorySlugConfigName: strings.TrimSpace(cfg.CategorySlug),
		ToolsHomepageLearningCategoryIDsConfigName:  normalizeHomepageLearningCategoryIDs(cfg.CategoryIDs),
		ToolsHomepageLearningLimitConfigName:        strconv.Itoa(normalizeHomepageLearningLimit(strconv.Itoa(cfg.Limit))),
	}
}

// ValidateHomepageLearningRSSURL 函数说明：校验 RSS 地址，仅允许 uied.cn 官方 HTTPS 地址，防止 SSRF。
func ValidateHomepageLearningRSSURL(raw string) error {
	if !isAllowedHomepageLearningURL(strings.TrimSpace(raw)) {
		return fmt.Errorf("首页每日学习 RSS 地址仅允许 https://uied.cn 或 https://www.uied.cn")
	}
	return nil
}

// NormalizeHomepageLearningCategoryIDs 函数说明：清理分类 ID 逗号串，保留纯数字并去重。
func NormalizeHomepageLearningCategoryIDs(raw string) string {
	return normalizeHomepageLearningCategoryIDs(raw)
}

// normalizeHomepageLearningFilterType 函数说明：将未知 RSS 筛选方式回退为全部文章。
func normalizeHomepageLearningFilterType(raw string) string {
	switch strings.TrimSpace(raw) {
	case "category_slug", "categories":
		return strings.TrimSpace(raw)
	default:
		return HomepageLearningDefaultFilterType
	}
}

// normalizeHomepageLearningCategoryIDs 函数说明：标准化逗号分隔的分类 ID，不支持 tags 参数。
func normalizeHomepageLearningCategoryIDs(raw string) string {
	seen := make(map[string]struct{})
	items := make([]string, 0)
	for _, item := range strings.Split(raw, ",") {
		item = strings.TrimSpace(item)
		if item == "" {
			continue
		}
		if _, err := strconv.ParseUint(item, 10, 32); err != nil {
			continue
		}
		if _, ok := seen[item]; ok {
			continue
		}
		seen[item] = struct{}{}
		items = append(items, item)
	}
	return strings.Join(items, ",")
}

// normalizeHomepageLearningLimit 函数说明：限制首页每日学习展示数量，避免异常配置放大上游请求和页面负载。
func normalizeHomepageLearningLimit(raw string) int {
	limit, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil || limit <= 0 {
		return HomepageLearningDefaultLimit
	}
	if limit > HomepageLearningMaxLimit {
		return HomepageLearningMaxLimit
	}
	return limit
}

// parseHomepageLearningBool 函数说明：兼容数据库中的 0/1 和 true/false 开关值。
func parseHomepageLearningBool(raw string, fallback bool) bool {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "1", "true":
		return true
	case "0", "false":
		return false
	default:
		return fallback
	}
}

// boolToHomepageLearningFlag 函数说明：将布尔开关转换为配置中心惯用的 0/1 字符串。
func boolToHomepageLearningFlag(value bool) string {
	if value {
		return "1"
	}
	return "0"
}

// isAllowedHomepageLearningURL 函数说明：严格限制 RSS 主机、协议、端口和用户信息，降低 SSRF 风险。
func isAllowedHomepageLearningURL(raw string) bool {
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Scheme != "https" || parsed.User != nil || parsed.Hostname() == "" {
		return false
	}
	if port := parsed.Port(); port != "" && port != "443" {
		return false
	}
	switch strings.ToLower(parsed.Hostname()) {
	case "uied.cn", "www.uied.cn":
		return true
	default:
		return false
	}
}
