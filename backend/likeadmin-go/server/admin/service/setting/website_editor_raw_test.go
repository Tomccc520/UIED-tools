/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package setting

import "testing"

// TestNavigationEditorKeepsStoredRawValues 函数说明：后台原文不能被默认值掩盖，坏 JSON、空值和未知字段都保留，读取不修改存储。
func TestNavigationEditorKeepsStoredRawValues(t *testing.T) {
	for _, raw := range []string{"{ broken", "[]", "", `[{"title":"设计","status":0,"items":[{"name":"A","link":"/a","nofollow":true}]}]`} {
		stored := map[string]string{toolsFooterQuickSectionsConfigName: raw}
		normalized := map[string]string{toolsFooterQuickSectionsConfigName: "default", toolsFooterIntroConfigName: "intro"}
		result := preserveNavigationEditorRawValues(normalized, stored)
		if result[toolsFooterQuickSectionsConfigName] != raw || result[toolsFooterIntroConfigName] != "intro" || stored[toolsFooterQuickSectionsConfigName] != raw {
			t.Fatal("管理端读取替换了原始配置或改动了无关内容")
		}
	}
}

// TestNavigationEditorCoversOnlyEditableNavigationFields 函数说明：三页导航编辑字段均保留原文，未配置字段及其他站点配置不受覆盖影响。
func TestNavigationEditorCoversOnlyEditableNavigationFields(t *testing.T) {
	fields := []string{toolsHeaderLinksConfigName, toolsSearchQuickToolsConfigName, toolsAiChatHeaderLinksConfigName, toolsAiCommonHeaderLinksConfigName, toolsSidebarRecommendConfigName, toolsSidebarCategoryMenusConfigName, toolsSidebarMenuBlocksConfigName, toolsSidebarBottomLinksConfigName, toolsAiToolboxSidebarMenusConfigName, toolsFooterSupportLinksConfigName, toolsFooterRecordLinksConfigName, toolsOfficialMediaLinksConfigName, toolsFooterQuickSectionsConfigName, toolsFooterFriendSectionsConfigName}
	stored := map[string]string{toolsSiteSloganConfigName: "out of scope"}
	normalized := map[string]string{toolsSiteSloganConfigName: "existing slogan behavior"}
	for _, field := range fields {
		stored[field] = "raw:" + field
		normalized[field] = "default"
	}
	result := preserveNavigationEditorRawValues(normalized, stored)
	for _, field := range fields {
		if result[field] != stored[field] {
			t.Fatalf("字段 %s 未保留原文", field)
		}
	}
	if result[toolsSiteSloganConfigName] != "existing slogan behavior" {
		t.Fatal("修改了本轮范围外的配置读取")
	}
	if result := preserveNavigationEditorRawValues(map[string]string{toolsFooterQuickSectionsConfigName: "default"}, map[string]string{}); result[toolsFooterQuickSectionsConfigName] != "default" {
		t.Fatal("不存在的配置未保留原默认值")
	}
}

// TestStructuredWebsiteEditorsKeepStoredRawValues 函数说明：目录和 SEO 编辑器读取损坏或带扩展字段的原文，避免默认空数组掩盖待修复内容；缺失时仍保留原默认值。
func TestStructuredWebsiteEditorsKeepStoredRawValues(t *testing.T) {
	for _, field := range []string{toolsCategoryTreeConfigName, toolsSeoPagesConfigName} {
		for _, raw := range []string{"{ broken", "null", "", "[]", `  [{"path":"/tools/test","extra":true}]  `} {
			t.Run(field+":"+raw, func(t *testing.T) {
				stored := map[string]string{field: raw}
				normalized := map[string]string{field: "default"}
				if result := preserveNavigationEditorRawValues(normalized, stored); result[field] != raw || stored[field] != raw {
					t.Fatalf("编辑器原文被默认值替换: field=%s result=%q raw=%q", field, result[field], raw)
				}
			})
		}
		if result := preserveNavigationEditorRawValues(map[string]string{field: "default"}, map[string]string{}); result[field] != "default" {
			t.Fatalf("未配置字段失去默认值: field=%s value=%q", field, result[field])
		}
	}
}

// TestNavigationFrontendFallbackIsUnchanged 函数说明：原标准化函数仍为展示与保存契约提供默认回退，后台原文读取不改变其行为。
func TestNavigationFrontendFallbackIsUnchanged(t *testing.T) {
	for _, raw := range []string{"{ broken", "[]", ""} {
		if normalizeToolsLayoutArrayConfig(raw, "default") != "default" {
			t.Fatal("默认回退行为发生变化")
		}
	}
}
