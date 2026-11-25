package defaults

import (
	"encoding/json"
	"html"
	"regexp"
	"strings"
)

var toolsChangelogHTMLTagRegex = regexp.MustCompile(`(?s)<[^>]*>`)

type toolsChangelogFeatureItem struct {
	extra  map[string]json.RawMessage
	Title  string   `json:"title"`
	Points []string `json:"points"`
}

type toolsChangelogTimelineItem struct {
	extra     map[string]json.RawMessage
	ID        string                      `json:"id"`
	Version   string                      `json:"version"`
	Date      string                      `json:"date"`
	BadgeText string                      `json:"badgeText"`
	BadgeType string                      `json:"badgeType"`
	Title     string                      `json:"title"`
	Features  []toolsChangelogFeatureItem `json:"features"`
}

// decodeChangelogFields 解析已有业务字段，同时原样保留未知 JSON 值供后台再次编辑。
func decodeChangelogFields(data []byte, known interface{}, keys ...string) (map[string]json.RawMessage, error) {
	if err := json.Unmarshal(data, known); err != nil {
		return nil, err
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(data, &fields); err != nil {
		return nil, err
	}
	for key := range fields {
		for _, name := range keys {
			if strings.EqualFold(key, name) {
				delete(fields, key)
				break
			}
		}
	}
	if len(fields) == 0 {
		return nil, nil
	}
	return fields, nil
}

// encodeChangelogFields 输出规范化后的业务字段及原始扩展字段，保留扩展值的类型与数值精度。
func encodeChangelogFields(known interface{}, extra map[string]json.RawMessage) ([]byte, error) {
	data, err := json.Marshal(known)
	if err != nil || len(extra) == 0 {
		return data, err
	}
	var fields map[string]json.RawMessage
	if err := json.Unmarshal(data, &fields); err != nil {
		return nil, err
	}
	return json.Marshal(mergeChangelogFields(fields, extra))
}

// mergeChangelogFields 为合并的条目补齐缺失字段，同一键沿用首条记录。
func mergeChangelogFields(first, later map[string]json.RawMessage) map[string]json.RawMessage {
	if first == nil {
		return later
	}
	for key, value := range later {
		if _, exists := first[key]; !exists {
			first[key] = value
		}
	}
	return first
}

// UnmarshalJSON 读取版本已知字段及运营自定义字段。
func (item *toolsChangelogTimelineItem) UnmarshalJSON(data []byte) error {
	type fields toolsChangelogTimelineItem
	var err error
	item.extra, err = decodeChangelogFields(data, (*fields)(item), "id", "version", "date", "badgeText", "badgeType", "title", "features")
	return err
}

// MarshalJSON 将已归一化的版本与运营扩展字段一起写回。
func (item toolsChangelogTimelineItem) MarshalJSON() ([]byte, error) {
	type fields toolsChangelogTimelineItem
	return encodeChangelogFields(fields(item), item.extra)
}

// UnmarshalJSON 读取功能块和分组级扩展字段。
func (item *toolsChangelogFeatureItem) UnmarshalJSON(data []byte) error {
	type fields toolsChangelogFeatureItem
	var err error
	item.extra, err = decodeChangelogFields(data, (*fields)(item), "title", "points")
	return err
}

// MarshalJSON 将规范化后的分组与其扩展字段一起写回。
func (item toolsChangelogFeatureItem) MarshalJSON() ([]byte, error) {
	type fields toolsChangelogFeatureItem
	return encodeChangelogFields(fields(item), item.extra)
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
				extra:  feature.extra,
				Points: make([]string, 0, len(feature.Points)),
			})
		} else {
			normalized[index].extra = mergeChangelogFields(normalized[index].extra, feature.extra)
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
		normalized[index].extra = mergeChangelogFields(normalized[index].extra, item.extra)
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
		return NormalizeToolsChangelogTimelineJSON("")
	}
	// 已保存的旧站点配置补齐缺失发布版本，保留运营已经编辑的同版本内容。
	releaseVersions := []string{"3.0.3", "3.0.4", "3.0.5", "3.0.6", "3.0.7"}
	var defaultItems []toolsChangelogTimelineItem
	for releaseIndex, version := range releaseVersions {
		if hasChangelogVersion(normalized, version) {
			continue
		}
		if defaultItems == nil {
			if err := json.Unmarshal([]byte(toolsChangelogTimelineJSON), &defaultItems); err != nil {
				break
			}
			defaultItems = normalizeToolsChangelogTimeline(defaultItems)
		}
		for _, item := range defaultItems {
			if item.Version != version {
				continue
			}
			insertAt := 0
			for index, existing := range normalized {
				for _, newer := range releaseVersions[releaseIndex+1:] {
					if strings.EqualFold(existing.Version, newer) {
						insertAt = index + 1
						break
					}
				}
			}
			normalized = append(normalized, toolsChangelogTimelineItem{})
			copy(normalized[insertAt+1:], normalized[insertAt:])
			normalized[insertAt] = item
			break
		}
	}
	encoded, err := json.Marshal(normalized)
	if err != nil {
		return "[]"
	}
	return string(encoded)
}

/**
 * 判断更新时间线中是否已经包含指定版本。
 * @param items 已清洗的更新时间线
 * @param version 目标版本号
 * @returns 是否存在目标版本
 */
func hasChangelogVersion(items []toolsChangelogTimelineItem, version string) bool {
	versionKey := normalizeToolsChangelogTextKey(version)
	for _, item := range items {
		if normalizeToolsChangelogTextKey(item.Version) == versionKey {
			return true
		}
	}
	return false
}

/**
 * 函数说明：将更新时间线原文转成公共配置数组，避免旧记录重复及扩展数值丢失精度。
 */
func NormalizeToolsChangelogTimelineItems(raw string) []map[string]interface{} {
	decoder := json.NewDecoder(strings.NewReader(NormalizeToolsChangelogTimelineJSON(raw)))
	decoder.UseNumber()
	result := make([]map[string]interface{}, 0)
	if err := decoder.Decode(&result); err != nil {
		return []map[string]interface{}{}
	}
	return result
}
