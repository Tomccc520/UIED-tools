/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package operation

import (
	"testing"

	"likeadmin/admin/schemas/req"
)

// TestNormalizeAdvertisingItems 验证广告列表会清理空白并保留既有数据结构。
func TestNormalizeAdvertisingItems(t *testing.T) {
	items, err := normalizeAdvertisingItems([]req.OperationAdvertisingItemReq{{
		Badge:    " 推荐 ",
		Text:     " UIED 广告 ",
		Link:     " https://fsuied.com ",
		Gradient: " linear-gradient(to right,#111,#fff) ",
	}})
	if err != nil {
		t.Fatalf("广告清洗失败: %v", err)
	}
	if len(items) != 1 || items[0].Badge != "推荐" || items[0].Link != "https://fsuied.com" {
		t.Fatalf("广告清洗结果不正确: %#v", items)
	}
}

// TestNormalizeAdvertisingItemsAllowsSharedLandingPage 验证不同广告可以共用同一落地页。
func TestNormalizeAdvertisingItemsAllowsSharedLandingPage(t *testing.T) {
	items, err := normalizeAdvertisingItems([]req.OperationAdvertisingItemReq{
		{Badge: "推荐", Text: "广告一", Link: "https://fsuied.com", Gradient: "linear-gradient(to right,#111,#fff)"},
		{Badge: "热门", Text: "广告二", Link: "https://fsuied.com", Gradient: "linear-gradient(to right,#222,#fff)"},
	})
	if err != nil || len(items) != 2 {
		t.Fatalf("共用落地页的广告应允许保存: items=%#v err=%v", items, err)
	}
}

// TestParseAdvertisingItemsFallback 验证非法历史配置会回退默认广告。
func TestParseAdvertisingItemsFallback(t *testing.T) {
	items := parseAdvertisingItems("invalid-json")
	if len(items) == 0 {
		t.Fatal("非法历史配置应回退默认广告")
	}
}
