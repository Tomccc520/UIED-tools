package common

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"

	servicedefaults "likeadmin/admin/service/defaults"
)

// TestNormalizeHomepageLearningRSS 函数说明：验证 RSS XML 解析、日期标准化和无效链接过滤。
func TestNormalizeHomepageLearningRSS(t *testing.T) {
	body := []byte(`<?xml version="1.0"?><rss><channel>
<item><title>第一篇</title><link>https://www.uied.cn/post/1</link><pubDate>Wed, 16 Jul 2025 00:00:00 +0800</pubDate></item>
<item><title>危险链接</title><link>javascript:alert(1)</link></item>
<item><title>第二篇</title><link>https://www.uied.cn/post/2</link><pubDate>2025-07-15</pubDate></item>
</channel></rss>`)

	items, err := parseHomepageLearningRSS(body, 2)
	if err != nil {
		t.Fatalf("parse RSS failed: %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("expected 2 normalized items, got %d", len(items))
	}
	if items[0].Title != "第一篇" || items[0].URL != "https://www.uied.cn/post/1" {
		t.Fatalf("unexpected first item: %#v", items[0])
	}
	if !strings.HasPrefix(items[0].PublishedAt, "2025-07-16T00:00:00+08:00") {
		t.Fatalf("unexpected normalized date: %q", items[0].PublishedAt)
	}
	if items[1].Title != "第二篇" {
		t.Fatalf("unexpected second item: %#v", items[1])
	}
}

// TestHomepageLearningSectionURLs 函数说明：验证三个附属栏目只使用固定官方 RSS 地址与设计分类参数。
func TestHomepageLearningSectionURLs(t *testing.T) {
	expected := map[string]struct {
		path     string
		queryKey string
		queryVal string
	}{
		homepageLearningSectionRelax:    {path: "/api/open/v1/rss.xml", queryKey: "categories", queryVal: "307"},
		homepageLearningSectionDeepSeek: {path: "/api/open/v1/rss.xml", queryKey: "categories", queryVal: "337"},
		homepageLearningSectionAIGC:     {path: "/api/open/v1/rss.xml", queryKey: "categories", queryVal: "417"},
	}
	for _, spec := range homepageLearningSectionSpecs() {
		rawURL := buildHomepageLearningSectionURL(spec)
		parsed, err := url.Parse(rawURL)
		if err != nil {
			t.Fatalf("parse section URL failed: %v", err)
		}
		want := expected[spec.Name]
		if parsed.Scheme != "https" || parsed.Host != "www.uied.cn" || parsed.Path != want.path {
			t.Fatalf("unexpected fixed section URL: %s", rawURL)
		}
		if want.queryKey != "" && parsed.Query().Get(want.queryKey) != want.queryVal {
			t.Fatalf("missing section query %s=%s in %s", want.queryKey, want.queryVal, rawURL)
		}
		if spec.Format != homepageLearningSectionFormatRSS {
			t.Fatalf("unexpected section format in %s", rawURL)
		}
	}
}

// TestHomepageLearningSectionsPartialFallback 函数说明：验证单个 RSS 栏目失败时其它栏目正常返回且错误信息不泄露内部细节。
func TestHomepageLearningSectionsPartialFallback(t *testing.T) {
	client := &http.Client{
		Transport: homepageLearningRoundTripFunc(func(request *http.Request) (*http.Response, error) {
			if request.URL.Query().Get("categories") == "337" {
				return &http.Response{
					StatusCode: http.StatusBadGateway,
					Body:       io.NopCloser(strings.NewReader("upstream failure")),
					Header:     make(http.Header),
				}, nil
			}
			body := `<?xml version="1.0"?><rss><channel><item><title>栏目文章</title><link>https://www.uied.cn/posts/1</link><pubDate>2026-07-17</pubDate></item></channel></rss>`
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(body)),
				Header:     make(http.Header),
			}, nil
		}),
	}

	sections, sectionErrors := fetchHomepageLearningSections(context.Background(), client)
	if len(sections[homepageLearningSectionRelax]) != 1 || len(sections[homepageLearningSectionAIGC]) != 1 {
		t.Fatalf("healthy sections should be returned: %#v", sections)
	}
	if len(sections[homepageLearningSectionDeepSeek]) != 0 {
		t.Fatalf("failed deepseek section should degrade to empty: %#v", sections[homepageLearningSectionDeepSeek])
	}
	if sectionErrors[homepageLearningSectionDeepSeek] != "数据暂时不可用" {
		t.Fatalf("unexpected sanitized section error: %#v", sectionErrors)
	}
	if strings.Contains(sectionErrors[homepageLearningSectionDeepSeek], "337") || strings.Contains(sectionErrors[homepageLearningSectionDeepSeek], "502") {
		t.Fatalf("section error leaked upstream details: %#v", sectionErrors)
	}
}

// homepageLearningRoundTripFunc 函数说明：为 WP JSON 局部降级测试提供可控的 HTTP 响应。
type homepageLearningRoundTripFunc func(*http.Request) (*http.Response, error)

// RoundTrip 函数说明：执行测试用 HTTP transport，避免单测访问真实网络。
func (roundTrip homepageLearningRoundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return roundTrip(request)
}

// TestBuildHomepageLearningRSSURL 函数说明：验证 all/category_slug/categories 三种筛选方式和 tags 禁用约束。
func TestBuildHomepageLearningRSSURL(t *testing.T) {
	base := servicedefaults.HomepageLearningConfig{RssURL: "https://www.uied.cn/api/open/v1/rss.xml?tags=3842&categories=old", Limit: 30}

	allURL, err := buildHomepageLearningRSSURL(base)
	if err != nil || strings.Contains(allURL, "tags=") || strings.Contains(allURL, "categories=") {
		t.Fatalf("all filter should remove unsupported filters: %q, err=%v", allURL, err)
	}

	categoryURL, err := buildHomepageLearningRSSURL(servicedefaults.HomepageLearningConfig{
		RssURL:       "https://www.uied.cn/api/open/v1/rss.xml",
		FilterType:   "category_slug",
		CategorySlug: "aigc",
	})
	if err != nil || !strings.Contains(categoryURL, "category_slug=aigc") {
		t.Fatalf("category_slug filter was not applied: %q, err=%v", categoryURL, err)
	}

	idURL, err := buildHomepageLearningRSSURL(servicedefaults.HomepageLearningConfig{
		RssURL:      "https://www.uied.cn/api/open/v1/rss.xml",
		FilterType:  "categories",
		CategoryIDs: "417,3351",
	})
	if err != nil || !strings.Contains(idURL, "categories=417%2C3351") {
		t.Fatalf("categories filter was not applied: %q, err=%v", idURL, err)
	}
}

// TestHomepageLearningDefaults 函数说明：验证默认全部文章、默认 RSS 地址和分类 ID 多值清理。
func TestHomepageLearningDefaults(t *testing.T) {
	cfg := servicedefaults.NormalizeHomepageLearningConfig(map[string]string{
		servicedefaults.ToolsHomepageLearningCategoryIDsConfigName: "417,3351,417,bad",
	})
	if !cfg.Enabled || cfg.FilterType != "all" || cfg.RssURL != servicedefaults.HomepageLearningDefaultRssURL {
		t.Fatalf("unexpected defaults: %#v", cfg)
	}
	if cfg.CategoryIDs != "417,3351" {
		t.Fatalf("unexpected category IDs: %q", cfg.CategoryIDs)
	}
}

// TestHomepageLearningRSSURLValidation 函数说明：验证 RSS 地址白名单拒绝非官方域名、HTTP 和非标准端口。
func TestHomepageLearningRSSURLValidation(t *testing.T) {
	for _, rawURL := range []string{
		"http://www.uied.cn/api/open/v1/rss.xml",
		"https://example.com/rss.xml",
		"https://uied.cn:8443/rss.xml",
		"https://127.0.0.1/rss.xml",
	} {
		if err := servicedefaults.ValidateHomepageLearningRSSURL(rawURL); err == nil {
			t.Fatalf("expected URL to be rejected: %s", rawURL)
		}
	}
}
