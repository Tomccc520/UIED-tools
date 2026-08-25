package common

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 */

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	servicedefaults "likeadmin/admin/service/defaults"
	"likeadmin/core/response"
	"likeadmin/util"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	homepageLearningRSSRequestTimeout = 8 * time.Second
	homepageLearningRSSMaxBodyBytes   = 2 << 20
	homepageLearningSectionRelax      = "relax"
	homepageLearningSectionDeepSeek   = "deepseek"
	homepageLearningSectionAIGC       = "aigc"
	homepageLearningSectionFormatRSS  = "rss"
)

// homepageLearningSectionSpec 函数说明：描述固定的官方栏目来源和解析格式，不接受请求参数覆盖。
type homepageLearningSectionSpec struct {
	Name   string
	Path   string
	Query  url.Values
	Format string
}

// homepageLearningSectionSpecs 函数说明：返回设计干货、交互灵感和 AIGC 三个附属栏目的官方 RSS 定义。
func homepageLearningSectionSpecs() []homepageLearningSectionSpec {
	return []homepageLearningSectionSpec{
		{
			Name:   homepageLearningSectionRelax,
			Path:   "https://www.uied.cn/api/open/v1/rss.xml",
			Format: homepageLearningSectionFormatRSS,
			Query: url.Values{
				"categories": []string{"307"},
			},
		},
		{
			Name:   homepageLearningSectionDeepSeek,
			Path:   "https://www.uied.cn/api/open/v1/rss.xml",
			Format: homepageLearningSectionFormatRSS,
			Query: url.Values{
				"categories": []string{"337"},
			},
		},
		{
			Name:   homepageLearningSectionAIGC,
			Path:   "https://www.uied.cn/api/open/v1/rss.xml",
			Format: homepageLearningSectionFormatRSS,
			Query: url.Values{
				"categories": []string{"417"},
			},
		},
	}
}

// homepageLearningFeedItem 函数说明：首页每日学习对外返回的 RSS 条目结构。
type homepageLearningFeedItem struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	PublishedAt string `json:"publishedAt"`
}

// homepageLearningRSSDocument 函数说明：兼容 RSS 2.0 与 Atom feed 的最小解析结构。
type homepageLearningRSSDocument struct {
	Channel homepageLearningRSSChannel  `xml:"channel"`
	Feed    homepageLearningAtomFeed    `xml:"feed"`
	Entries []homepageLearningAtomEntry `xml:"entry"`
}

// homepageLearningRSSChannel 函数说明：RSS 2.0 channel 的文章列表。
type homepageLearningRSSChannel struct {
	Items []homepageLearningRSSItem `xml:"item"`
}

// homepageLearningRSSItem 函数说明：RSS 2.0 item 的标题、链接和发布时间字段。
type homepageLearningRSSItem struct {
	Title       string `xml:"title"`
	URL         string `xml:"link"`
	PublishedAt string `xml:"pubDate"`
	Date        string `xml:"date"`
}

// homepageLearningAtomFeed 函数说明：Atom feed 的文章列表。
type homepageLearningAtomFeed struct {
	Entries []homepageLearningAtomEntry `xml:"entry"`
}

// homepageLearningAtomEntry 函数说明：Atom entry 的标题、链接和发布时间字段。
type homepageLearningAtomEntry struct {
	Title       string                     `xml:"title"`
	Links       []homepageLearningAtomLink `xml:"link"`
	PublishedAt string                     `xml:"published"`
	UpdatedAt   string                     `xml:"updated"`
}

// homepageLearningAtomLink 函数说明：Atom link 节点的 href 属性。
type homepageLearningAtomLink struct {
	Href string `xml:"href,attr"`
	Rel  string `xml:"rel,attr"`
}

// LearningRSS 函数说明：读取首页每日学习配置并通过服务端代理返回标准化 JSON，避免浏览器跨域读取 RSS。
func (iSrv indexService) LearningRSS() (res map[string]interface{}, e error) {
	website, err := util.ConfigUtil.Get(iSrv.db, "website")
	if e = response.CheckErr(err, "LearningRSS Get website config err"); e != nil {
		return
	}
	cfg := servicedefaults.NormalizeHomepageLearningConfig(website)
	res = map[string]interface{}{
		"config": map[string]interface{}{
			"enabled":      cfg.Enabled,
			"title":        cfg.Title,
			"rssUrl":       cfg.RssURL,
			"filterType":   cfg.FilterType,
			"categorySlug": cfg.CategorySlug,
			"categoryIds":  cfg.CategoryIDs,
			"limit":        cfg.Limit,
		},
		"items": []homepageLearningFeedItem{},
		"sections": map[string][]homepageLearningFeedItem{
			homepageLearningSectionRelax:    {},
			homepageLearningSectionDeepSeek: {},
			homepageLearningSectionAIGC:     {},
		},
	}
	if !cfg.Enabled {
		return res, nil
	}

	client := newHomepageLearningHTTPClient()
	mainResultCh := make(chan homepageLearningFetchResult, 1)
	go func() {
		items, fetchErr := fetchHomepageLearningRSS(context.Background(), cfg, client)
		mainResultCh <- homepageLearningFetchResult{Items: items, Err: fetchErr}
	}()
	sectionResultCh := make(chan homepageLearningSectionsResult, 1)
	go func() {
		sections, sectionErrors := fetchHomepageLearningSections(context.Background(), client)
		sectionResultCh <- homepageLearningSectionsResult{Sections: sections, Errors: sectionErrors}
	}()

	mainResult := <-mainResultCh
	if e = response.CheckErr(mainResult.Err, "LearningRSS fetch and normalize err"); e != nil {
		return
	}
	res["items"] = mainResult.Items
	sectionResult := <-sectionResultCh
	res["sections"] = sectionResult.Sections
	if len(sectionResult.Errors) > 0 {
		res["sectionErrors"] = sectionResult.Errors
	}
	return res, nil
}

// homepageLearningFetchResult 函数说明：承载主 RSS 异步请求结果，保持主数据失败语义不变。
type homepageLearningFetchResult struct {
	Items []homepageLearningFeedItem
	Err   error
}

// homepageLearningSectionsResult 函数说明：承载三个附属栏目结果及不敏感的诊断信息。
type homepageLearningSectionsResult struct {
	Sections map[string][]homepageLearningFeedItem
	Errors   map[string]string
}

// newHomepageLearningHTTPClient 函数说明：创建带超时和重定向域名校验的官方来源 HTTP 客户端。
func newHomepageLearningHTTPClient() *http.Client {
	return &http.Client{
		Timeout: homepageLearningRSSRequestTimeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if err := servicedefaults.ValidateHomepageLearningRSSURL(req.URL.String()); err != nil {
				return err
			}
			return nil
		},
	}
}

// fetchHomepageLearningRSS 函数说明：请求受限的官方 RSS 地址并解析为首页所需的最小字段集合。
func fetchHomepageLearningRSS(ctx context.Context, cfg servicedefaults.HomepageLearningConfig, client *http.Client) ([]homepageLearningFeedItem, error) {
	feedURL, err := buildHomepageLearningRSSURL(cfg)
	if err != nil {
		return nil, err
	}
	body, err := fetchHomepageLearningSource(ctx, feedURL, client, "application/rss+xml, application/atom+xml, application/xml, text/xml")
	if err != nil {
		return nil, err
	}
	return parseHomepageLearningRSS(body, cfg.Limit)
}

// fetchHomepageLearningSections 函数说明：并发读取三个固定官方栏目，单个失败只记录局部错误并返回空数组。
func fetchHomepageLearningSections(ctx context.Context, client *http.Client) (map[string][]homepageLearningFeedItem, map[string]string) {
	sections := map[string][]homepageLearningFeedItem{
		homepageLearningSectionRelax:    {},
		homepageLearningSectionDeepSeek: {},
		homepageLearningSectionAIGC:     {},
	}
	sectionErrors := make(map[string]string)
	type sectionResult struct {
		name  string
		items []homepageLearningFeedItem
		err   error
	}
	specs := homepageLearningSectionSpecs()
	resultCh := make(chan sectionResult, len(specs))
	for _, spec := range specs {
		spec := spec
		go func() {
			sectionURL := buildHomepageLearningSectionURL(spec)
			body, err := fetchHomepageLearningSource(ctx, sectionURL, client, "application/rss+xml, application/atom+xml, application/xml, text/xml")
			if err != nil {
				resultCh <- sectionResult{name: spec.Name, err: err}
				return
			}
			items, err := parseHomepageLearningRSS(body, servicedefaults.HomepageLearningDefaultLimit)
			resultCh <- sectionResult{name: spec.Name, items: items, err: err}
		}()
	}
	for range specs {
		result := <-resultCh
		if result.err != nil {
			sectionErrors[result.name] = homepageLearningSectionErrorMessage(result.err)
			continue
		}
		sections[result.name] = result.items
	}
	return sections, sectionErrors
}

// buildHomepageLearningSectionURL 函数说明：从代码内固定定义构造官方 RSS 地址，阻断用户输入进入请求目标。
func buildHomepageLearningSectionURL(spec homepageLearningSectionSpec) string {
	parsed, err := url.Parse(spec.Path)
	if err != nil {
		return ""
	}
	parsed.RawQuery = spec.Query.Encode()
	return parsed.String()
}

// fetchHomepageLearningSource 函数说明：统一执行官方来源的 URL、超时、状态码和响应体大小校验。
func fetchHomepageLearningSource(ctx context.Context, sourceURL string, client *http.Client, accept string) ([]byte, error) {
	if err := servicedefaults.ValidateHomepageLearningRSSURL(sourceURL); err != nil {
		return nil, err
	}
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, sourceURL, nil)
	if err != nil {
		return nil, err
	}
	request.Header.Set("Accept", accept)
	request.Header.Set("User-Agent", "UIED-Tools Homepage Learning Proxy/1.0")
	responseBody, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer responseBody.Body.Close()
	if responseBody.StatusCode < http.StatusOK || responseBody.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("upstream returned HTTP %d", responseBody.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(responseBody.Body, homepageLearningRSSMaxBodyBytes+1))
	if err != nil {
		return nil, err
	}
	if len(body) > homepageLearningRSSMaxBodyBytes {
		return nil, errors.New("upstream response is too large")
	}
	return body, nil
}

// homepageLearningSectionErrorMessage 函数说明：将附属栏目错误收敛为不暴露 URL、状态码和内部错误的诊断文案。
func homepageLearningSectionErrorMessage(err error) string {
	if errors.Is(err, context.DeadlineExceeded) {
		return "请求超时"
	}
	return "数据暂时不可用"
}

// buildHomepageLearningRSSURL 函数说明：按配置拼接 RSS 筛选参数，明确不支持 tags 筛选。
func buildHomepageLearningRSSURL(cfg servicedefaults.HomepageLearningConfig) (string, error) {
	parsed, err := url.Parse(cfg.RssURL)
	if err != nil {
		return "", err
	}
	if err = servicedefaults.ValidateHomepageLearningRSSURL(parsed.String()); err != nil {
		return "", err
	}
	query := parsed.Query()
	query.Del("tags")
	query.Del("category_slug")
	query.Del("categories")
	switch cfg.FilterType {
	case "category_slug":
		if slug := strings.TrimSpace(cfg.CategorySlug); slug != "" {
			query.Set("category_slug", slug)
		}
	case "categories":
		if categoryIDs := servicedefaults.NormalizeHomepageLearningCategoryIDs(cfg.CategoryIDs); categoryIDs != "" {
			query.Set("categories", categoryIDs)
		}
	}
	parsed.RawQuery = query.Encode()
	return parsed.String(), nil
}

// parseHomepageLearningRSS 函数说明：解析 RSS/Atom XML，并过滤缺失标题或安全链接的条目。
func parseHomepageLearningRSS(body []byte, limit int) ([]homepageLearningFeedItem, error) {
	var document homepageLearningRSSDocument
	if err := xml.Unmarshal(body, &document); err != nil {
		return nil, err
	}
	items := make([]homepageLearningFeedItem, 0, limit)
	for _, item := range document.Channel.Items {
		if normalized, ok := normalizeHomepageLearningRSSItem(item.Title, item.URL, firstHomepageLearningString(item.PublishedAt, item.Date)); ok {
			items = append(items, normalized)
		}
		if len(items) >= limit {
			return items, nil
		}
	}
	atomEntries := append(document.Feed.Entries, document.Entries...)
	for _, entry := range atomEntries {
		if normalized, ok := normalizeHomepageLearningRSSItem(entry.Title, atomEntryURL(entry.Links), firstHomepageLearningString(entry.PublishedAt, entry.UpdatedAt)); ok {
			items = append(items, normalized)
		}
		if len(items) >= limit {
			return items, nil
		}
	}
	return items, nil
}

// normalizeHomepageLearningRSSItem 函数说明：校验并标准化单条 RSS 数据，阻断 javascript 等危险链接。
func normalizeHomepageLearningRSSItem(title string, rawURL string, publishedAt string) (homepageLearningFeedItem, bool) {
	title = strings.TrimSpace(title)
	rawURL = strings.TrimSpace(rawURL)
	parsedURL, err := url.Parse(rawURL)
	if title == "" || err != nil || parsedURL.Host == "" || (parsedURL.Scheme != "http" && parsedURL.Scheme != "https") {
		return homepageLearningFeedItem{}, false
	}
	return homepageLearningFeedItem{
		Title:       title,
		URL:         parsedURL.String(),
		PublishedAt: normalizeHomepageLearningPublishedAt(publishedAt),
	}, true
}

// atomEntryURL 函数说明：优先取 Atom 的 alternate 链接，兼容只有一个 link 的 feed。
func atomEntryURL(links []homepageLearningAtomLink) string {
	for _, link := range links {
		if strings.TrimSpace(link.Rel) == "" || strings.EqualFold(strings.TrimSpace(link.Rel), "alternate") {
			return link.Href
		}
	}
	return ""
}

// firstHomepageLearningString 函数说明：从多个可能的发布时间字段中取第一个非空值。
func firstHomepageLearningString(values ...string) string {
	for _, value := range values {
		if value = strings.TrimSpace(value); value != "" {
			return value
		}
	}
	return ""
}

// normalizeHomepageLearningPublishedAt 函数说明：将常见 RSS 日期转换为 RFC3339，无法识别时保留原文。
func normalizeHomepageLearningPublishedAt(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	for _, layout := range []string{
		time.RFC3339,
		time.RFC1123Z,
		time.RFC1123,
		time.RFC822Z,
		time.RFC822,
		"2006-01-02 15:04:05",
		"2006-01-02",
	} {
		if parsed, err := time.Parse(layout, raw); err == nil {
			return parsed.Format(time.RFC3339)
		}
	}
	return raw
}
