package common

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import "testing"

// TestCanonicalToolRankingRoutePath 函数说明：验证拼豆专心模式统一归因到主工具。
func TestCanonicalToolRankingRoutePath(t *testing.T) {
	if actual := canonicalToolRankingRoutePath("/tools/ai-perler/focus?from=smoke"); actual != "/tools/ai-perler" {
		t.Fatalf("unexpected canonical route: %s", actual)
	}
	if actual := canonicalToolRankingKey("ai-perler-focus"); actual != "ai-perler" {
		t.Fatalf("unexpected canonical key: %s", actual)
	}
}

// TestReconcileToolRankingListRows 函数说明：验证子路由统计合并且未知导航页不进入榜单。
func TestReconcileToolRankingListRows(t *testing.T) {
	catalogItems := []toolRankingCatalogItem{
		{
			ToolKey:   "ai-perler",
			RoutePath: "/tools/ai-perler",
			ToolTitle: "拼豆图纸生成器",
			ToolURL:   "/tools/ai-perler",
			CateTitle: "AI图像工具",
		},
	}
	rows := []toolRankingListRow{
		{ToolKey: "ai-perler", ToolURL: "/tools/ai-perler", ViewCount: 52, SuccessCount: 2},
		{ToolKey: "ai-perler-focus", ToolURL: "/tools/ai-perler/focus", ViewCount: 24, StartCount: 3},
		{ToolKey: "ai-toolbox", ToolURL: "/tools/ai/toolbox", ViewCount: 13},
	}

	actual := reconcileToolRankingListRows(rows, catalogItems)
	if len(actual) != 1 {
		t.Fatalf("unexpected reconciled row count: %d", len(actual))
	}
	row := actual[0]
	if row.ToolKey != "ai-perler" || row.ToolTitle != "拼豆图纸生成器" || row.CateTitle != "AI图像工具" {
		t.Fatalf("unexpected reconciled metadata: %#v", row)
	}
	if row.ViewCount != 76 || row.StartCount != 3 || row.SuccessCount != 2 {
		t.Fatalf("unexpected reconciled counters: %#v", row)
	}
}
