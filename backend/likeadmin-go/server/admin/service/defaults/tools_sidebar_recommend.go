/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
package defaults

import "encoding/json"

/**
 * NormalizeToolsSidebarRecommendJSON 仅迁移“每日文章”的已知旧默认根链接，保留条目顺序和扩展字段。
 * @param raw 已存储的侧栏推荐 JSON 数组
 * @returns 迁移后的 JSON；无匹配项或输入非法时原样返回，不写入数据库
 */
func NormalizeToolsSidebarRecommendJSON(raw string) string {
	var items []json.RawMessage
	if err := json.Unmarshal([]byte(raw), &items); err != nil {
		return raw
	}

	changed := false
	for index, item := range items {
		var fields map[string]json.RawMessage
		if err := json.Unmarshal(item, &fields); err != nil {
			continue
		}
		var name, link string
		if json.Unmarshal(fields["name"], &name) != nil || name != "每日文章" {
			continue
		}
		if json.Unmarshal(fields["link"], &link) != nil {
			continue
		}
		switch link {
		case "https://hot.uied.cn", "https://hot.uied.cn/", "http://hot.uied.cn", "http://hot.uied.cn/":
			fields["link"] = json.RawMessage(`"https://uied.cn/"`)
		default:
			continue
		}
		encoded, err := json.Marshal(fields)
		if err != nil {
			return raw
		}
		items[index] = encoded
		changed = true
	}
	if !changed {
		return raw
	}
	encoded, err := json.Marshal(items)
	if err != nil {
		return raw
	}
	return string(encoded)
}
