/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package operation

import (
	"strings"
	"testing"

	"likeadmin/admin/schemas/req"
)

// TestNormalizeAdvertisingItems 验证图片广告会清理空白并保留可选跳转链接。
func TestNormalizeAdvertisingItems(t *testing.T) {
	items, err := normalizeAdvertisingItems([]req.OperationAdvertisingItemReq{{
		RenderMode: "image",
		Text:       " UIED 广告 ",
		Image:      " https://uiedtool.com/ad.png ",
		Link:       " https://fsuied.com ",
		Target:     "_self",
		Height:     80,
	}})
	if err != nil {
		t.Fatalf("广告清洗失败: %v", err)
	}
	if len(items) != 1 || items[0].RenderMode != advertisingModeImage || items[0].Image != "https://uiedtool.com/ad.png" || items[0].Link != "https://fsuied.com" || items[0].Height != 80 {
		t.Fatalf("广告清洗结果不正确: %#v", items)
	}
}

// TestNormalizeAdvertisingItemsAllowsSharedLandingPage 验证不同广告可以共用同一落地页。
func TestNormalizeAdvertisingItemsAllowsSharedLandingPage(t *testing.T) {
	items, err := normalizeAdvertisingItems([]req.OperationAdvertisingItemReq{
		{RenderMode: "image", Text: "广告一", Image: "/uploads/ad-1.png", Link: "https://fsuied.com"},
		{RenderMode: "image", Text: "广告二", Image: "/uploads/ad-2.png", Link: "https://fsuied.com"},
	})
	if err != nil || len(items) != 2 {
		t.Fatalf("共用落地页的广告应允许保存: items=%#v err=%v", items, err)
	}
}

// TestNormalizeAdvertisingItemsRejectsUnsafeHTML 验证 HTML 广告中的脚本与事件属性会被拒绝。
func TestNormalizeAdvertisingItemsRejectsUnsafeHTML(t *testing.T) {
	unsafeSamples := []string{
		`<img src="/ad.png" onerror="alert(1)">`,
		`<div style="background:url(javascript:alert(1))">广告</div>`,
	}
	for _, sample := range unsafeSamples {
		_, err := normalizeAdvertisingItems([]req.OperationAdvertisingItemReq{{
			RenderMode: "html",
			Text:       "不安全广告",
			HTMLCode:   sample,
		}})
		if err == nil {
			t.Fatalf("包含不安全内容的 HTML 广告应被拒绝: %s", sample)
		}
	}
}

// TestParseAdvertisingItemsMigratesLegacy 验证历史渐变广告会自动转换为可继续编辑的 HTML 广告。
func TestParseAdvertisingItemsMigratesLegacy(t *testing.T) {
	items := parseAdvertisingItems(`[{"badge":"推荐","text":"UIED 广告","link":"https://fsuied.com","gradient":"linear-gradient(to right,#111,#fff)"}]`)
	if len(items) != 1 || items[0].RenderMode != advertisingModeHTML || !strings.Contains(items[0].HTMLCode, "UIED 广告") {
		t.Fatalf("历史广告迁移结果不正确: %#v", items)
	}
}

// TestParseAdvertisingItemsFallback 验证非法历史配置会回退默认广告。
func TestParseAdvertisingItemsFallback(t *testing.T) {
	items := parseAdvertisingItems("invalid-json")
	if len(items) == 0 {
		t.Fatal("非法历史配置应回退默认广告")
	}
}

// TestNormalizeAdvertisingHotTools 验证热门工具原生广告会清理字段并保留有效跳转地址。
func TestNormalizeAdvertisingHotTools(t *testing.T) {
	items, err := normalizeAdvertisingHotTools([]req.OperationAdvertisingHotToolItemReq{{
		Title: " UIED 热门工具 ",
		Desc:  " 原生推荐广告 ",
		Link:  " https://uiedtool.com/tools ",
	}})
	if err != nil {
		t.Fatalf("热门工具广告清洗失败: %v", err)
	}
	if len(items) != 1 || items[0].Title != "UIED 热门工具" || items[0].Desc != "原生推荐广告" || items[0].Link != "https://uiedtool.com/tools" {
		t.Fatalf("热门工具广告清洗结果不正确: %#v", items)
	}
}

// TestNormalizeAdvertisingHotToolsAllowsSharedLandingPage 验证多个原生广告可复用同一活动落地页。
func TestNormalizeAdvertisingHotToolsAllowsSharedLandingPage(t *testing.T) {
	items, err := normalizeAdvertisingHotTools([]req.OperationAdvertisingHotToolItemReq{
		{Title: "广告一", Desc: "简介一", Link: "https://uiedtool.com/tools"},
		{Title: "广告二", Desc: "简介二", Link: "https://uiedtool.com/tools"},
	})
	if err != nil || len(items) != 2 {
		t.Fatalf("复用落地页的热门工具广告应允许保存: items=%#v err=%v", items, err)
	}
}

// TestParseAdvertisingHotToolsFallback 验证非法热门工具配置会回退默认内容。
func TestParseAdvertisingHotToolsFallback(t *testing.T) {
	items := parseAdvertisingHotTools("invalid-json")
	if len(items) == 0 {
		t.Fatal("非法热门工具配置应回退默认内容")
	}
}
