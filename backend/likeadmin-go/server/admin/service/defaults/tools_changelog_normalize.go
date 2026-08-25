package defaults

import (
	"encoding/json"
	"html"
	"regexp"
	"strings"
)

var toolsChangelogHTMLTagRegex = regexp.MustCompile(`(?s)<[^>]*>`)

type toolsChangelogFeatureItem struct {
	Title  string   `json:"title"`
	Points []string `json:"points"`
}

type toolsChangelogTimelineItem struct {
	ID        string                      `json:"id"`
	Version   string                      `json:"version"`
	Date      string                      `json:"date"`
	BadgeText string                      `json:"badgeText"`
	BadgeType string                      `json:"badgeType"`
	Title     string                      `json:"title"`
	Features  []toolsChangelogFeatureItem `json:"features"`
}

/**
 * 函数说明：生成更新记录文本去重键，忽略 HTML 标签、实体、空白差异与大小写。
 */
func normalizeToolsChangelogTextKey(input string) string {
	plainText := toolsChangelogHTMLTagRegex.ReplaceAllString(input, " ")
	plainText = html.UnescapeString(plainText)
	return strings.ToLower(strings.Join(strings.Fields(plainText), " "))
}

/**
 * 函数说明：清洗历史功能标题中误混入的 HTML 结构，仅保留首个标签之前的可读标题。
 */
func normalizeToolsChangelogFeatureTitle(input string) string {
	rawTitle := strings.TrimSpace(input)
	if location := toolsChangelogHTMLTagRegex.FindStringIndex(rawTitle); len(location) == 2 {
		rawTitle = rawTitle[:location[0]]
	}
	return strings.TrimSpace(html.UnescapeString(rawTitle))
}

/**
 * 函数说明：清洗并合并功能块，同名功能块合并且同一版本内重复描述只保留一次。
 */
func normalizeToolsChangelogFeatures(features []toolsChangelogFeatureItem) []toolsChangelogFeatureItem {
	normalized := make([]toolsChangelogFeatureItem, 0, len(features))
	featureIndex := make(map[string]int)
	pointKeySet := make(map[string]struct{})

	for _, feature := range features {
		feature.Title = normalizeToolsChangelogFeatureTitle(feature.Title)
		featureKey := normalizeToolsChangelogTextKey(feature.Title)
		if featureKey == "" {
			continue
		}

		index, exists := featureIndex[featureKey]
		if !exists {
			index = len(normalized)
			featureIndex[featureKey] = index
			normalized = append(normalized, toolsChangelogFeatureItem{
				Title:  feature.Title,
				Points: make([]string, 0, len(feature.Points)),
			})
		}

		for _, point := range feature.Points {
			point = strings.TrimSpace(point)
			pointKey := normalizeToolsChangelogTextKey(point)
			if pointKey == "" {
				continue
			}
			if _, duplicated := pointKeySet[pointKey]; duplicated {
				continue
			}
			pointKeySet[pointKey] = struct{}{}
			normalized[index].Points = append(normalized[index].Points, point)
		}
	}

	result := make([]toolsChangelogFeatureItem, 0, len(normalized))
	for _, feature := range normalized {
		if len(feature.Points) > 0 {
			result = append(result, feature)
		}
	}
	return result
}

/**
 * 函数说明：清洗更新时间线并按版本合并重复条目，保留首次出现的版本元信息。
 */
func normalizeToolsChangelogTimeline(items []toolsChangelogTimelineItem) []toolsChangelogTimelineItem {
	normalized := make([]toolsChangelogTimelineItem, 0, len(items))
	versionIndex := make(map[string]int)

	for _, item := range items {
		item.ID = strings.TrimSpace(item.ID)
		item.Version = strings.TrimSpace(item.Version)
		item.Date = strings.TrimSpace(item.Date)
		item.BadgeText = strings.TrimSpace(item.BadgeText)
		item.BadgeType = strings.TrimSpace(item.BadgeType)
		item.Title = strings.TrimSpace(item.Title)
		item.Features = normalizeToolsChangelogFeatures(item.Features)
		if item.Version == "" || item.Date == "" || item.Title == "" || len(item.Features) == 0 {
			continue
		}
		if item.BadgeType == "" {
			item.BadgeType = "info"
		}

		versionKey := normalizeToolsChangelogTextKey(item.Version)
		index, exists := versionIndex[versionKey]
		if !exists {
			versionIndex[versionKey] = len(normalized)
			normalized = append(normalized, item)
			continue
		}
		normalized[index].Features = normalizeToolsChangelogFeatures(append(
			normalized[index].Features,
			item.Features...,
		))
	}

	return normalized
}

/**
 * 函数说明：将更新时间线 JSON 归一化为无重复版本、功能块和描述的 JSON 字符串。
 */
func NormalizeToolsChangelogTimelineJSON(raw string) string {
	input := strings.TrimSpace(raw)
	if input == "" {
		input = toolsChangelogTimelineJSON
	}
	items := make([]toolsChangelogTimelineItem, 0)
	if err := json.Unmarshal([]byte(input), &items); err != nil {
		if err = json.Unmarshal([]byte(toolsChangelogTimelineJSON), &items); err != nil {
			return "[]"
		}
	}
	normalized := normalizeToolsChangelogTimeline(items)
	if len(normalized) == 0 && input != toolsChangelogTimelineJSON {
		if err := json.Unmarshal([]byte(toolsChangelogTimelineJSON), &items); err == nil {
			normalized = normalizeToolsChangelogTimeline(items)
		}
	}
	encoded, err := json.Marshal(normalized)
	if err != nil {
		return "[]"
	}
	return string(encoded)
}

/**
 * 函数说明：将公共配置接口使用的更新时间线数组归一化，避免数据库旧数据重复展示。
 */
func NormalizeToolsChangelogTimelineItems(items []map[string]interface{}) []map[string]interface{} {
	encoded, err := json.Marshal(items)
	if err != nil {
		return []map[string]interface{}{}
	}
	normalizedJSON := NormalizeToolsChangelogTimelineJSON(string(encoded))
	result := make([]map[string]interface{}, 0)
	if err = json.Unmarshal([]byte(normalizedJSON), &result); err != nil {
		return []map[string]interface{}{}
	}
	return result
}
