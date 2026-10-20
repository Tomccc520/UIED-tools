/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
package defaults

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

/** 验证只将 HTTP/HTTPS 的已知旧根链接迁移到每日文章的新地址。 */
func TestNormalizeToolsSidebarRecommendJSONMigratesKnownRoots(t *testing.T) {
	for _, link := range []string{
		"https://hot.uied.cn", "https://hot.uied.cn/",
		"http://hot.uied.cn", "http://hot.uied.cn/",
	} {
		t.Run(link, func(t *testing.T) {
			raw := `[{"name":"每日文章","link":"` + link + `"}]`
			var items []map[string]string
			result := NormalizeToolsSidebarRecommendJSON(raw)
			if err := json.Unmarshal([]byte(result), &items); err != nil {
				t.Fatalf("解析迁移结果失败：%v", err)
			}
			if len(items) != 1 || items[0]["link"] != "https://uied.cn/" {
				t.Fatalf("已知旧地址未迁移：%s", result)
			}
			if repeated := NormalizeToolsSidebarRecommendJSON(result); repeated != result {
				t.Fatal("重复读取不应再次改变配置")
			}
		})
	}
}

/** 验证自定义地址、非目标名称、非法输入和无变化配置均逐字保留。 */
func TestNormalizeToolsSidebarRecommendJSONPreservesUnmatchedInput(t *testing.T) {
	for _, raw := range []string{
		` [{"name":"每日文章","link":"https://uied.cn/"}] `,
		`[{"name":"每日文章","link":"https://example.com/articles"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn/articles"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn/?source=sidebar"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn#latest"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn?"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn/#"}]`,
		`[{"name":"每日文章","link":"https://hot.uied.cn:443/"}]`,
		`[{"name":"每日文章","link":" https://hot.uied.cn/ "}]`,
		`[{"name":"AI资讯热榜","link":"https://hot.uied.cn/"}]`,
		`[{"name":"每日文章 ","link":"https://hot.uied.cn/"}]`,
		`[{"name":null,"link":"https://hot.uied.cn/"}]`,
		`[{"name":"每日文章","link":123}]`,
		`[null,17,"每日文章",{"name":"每日文章"}]`,
		`{"name":"每日文章","link":"https://hot.uied.cn/"}`,
		`[{"name":"每日文章","link":"https://hot.uied.cn/"}`,
		` [{"name":"每日文章","link":"https://hot.uied.cn/"}] invalid`,
		" \n[] \t", "null", "", "  ",
	} {
		t.Run(raw, func(t *testing.T) {
			if result := NormalizeToolsSidebarRecommendJSON(raw); result != raw {
				t.Fatalf("非目标配置被改变：原值=%q，结果=%q", raw, result)
			}
		})
	}
}

/** 验证迁移不改变条目顺序、其他链接、嵌套扩展字段及大整数精度。 */
func TestNormalizeToolsSidebarRecommendJSONPreservesFieldsAndOrder(t *testing.T) {
	raw := `[
		{"name":"AI资讯热榜","link":"https://hot.uied.cn/","rank":1},
		{"name":"每日文章","link":"https://hot.uied.cn/","id":9007199254740993,"custom":{"list":[1,"值",true,null],"link":"https://hot.uied.cn/"}},
		{"name":"每日文章","link":"https://hot.uied.cn/articles","rank":3},
		null,
		{"name":"每日文章","link":"http://hot.uied.cn","target":"_blank"}
	]`
	result := NormalizeToolsSidebarRecommendJSON(raw)
	expectedJSON := strings.Replace(raw, `"name":"每日文章","link":"https://hot.uied.cn/"`, `"name":"每日文章","link":"https://uied.cn/"`, 1)
	expectedJSON = strings.Replace(expectedJSON, `"name":"每日文章","link":"http://hot.uied.cn"`, `"name":"每日文章","link":"https://uied.cn/"`, 1)
	var expected, actual []map[string]json.RawMessage
	if err := json.Unmarshal([]byte(expectedJSON), &expected); err != nil {
		t.Fatalf("解析预期数据失败：%v", err)
	}
	if err := json.Unmarshal([]byte(result), &actual); err != nil {
		t.Fatalf("解析迁移结果失败：%v", err)
	}
	if !reflect.DeepEqual(actual, expected) {
		t.Fatalf("条目顺序或扩展字段被改变：%s", result)
	}
}
