package common

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"html"
	"io"
	"likeadmin/core/response"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

var (
	titleRegex = regexp.MustCompile(`(?is)<title[^>]*>(.*?)</title>`)
	metaRegex  = regexp.MustCompile(`(?is)<meta[^>]*>`)
	linkRegex  = regexp.MustCompile(`(?is)<link[^>]*>`)
)

type IWebInfoService interface {
	Detail(rawLink string) (res map[string]interface{}, e error)
}

// NewWebInfoService 初始化
func NewWebInfoService(db *gorm.DB) IWebInfoService {
	_ = db
	return &webInfoService{
		client: &http.Client{Timeout: 12 * time.Second},
	}
}

// webInfoService 网站信息解析服务
type webInfoService struct {
	client *http.Client
}

/**
 * 函数说明：校验并标准化传入域名，支持 link/url 参数传纯域名或完整 URL。
 */
func normalizeWebInfoInput(rawLink string) (*url.URL, error) {
	link := strings.TrimSpace(rawLink)
	if link == "" {
		return nil, response.AssertArgumentError.Make("请输入有效域名")
	}

	if !strings.Contains(link, "://") {
		link = "https://" + link
	}

	parsed, err := url.Parse(link)
	if err != nil {
		return nil, response.AssertArgumentError.Make("域名格式不正确")
	}

	if strings.TrimSpace(parsed.Host) == "" {
		return nil, response.AssertArgumentError.Make("域名格式不正确")
	}

	parsed.Path = "/"
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed, nil
}

/**
 * 函数说明：读取 HTML 里的首个属性值，兼容单双引号和不带引号写法。
 */
func readTagAttr(tag string, attr string) string {
	quotedDouble := regexp.MustCompile(`(?i)\b` + attr + `\s*=\s*"([^"]*)"`)
	if matched := quotedDouble.FindStringSubmatch(tag); len(matched) > 1 {
		return strings.TrimSpace(html.UnescapeString(matched[1]))
	}
	quotedSingle := regexp.MustCompile(`(?i)\b` + attr + `\s*=\s*'([^']*)'`)
	if matched := quotedSingle.FindStringSubmatch(tag); len(matched) > 1 {
		return strings.TrimSpace(html.UnescapeString(matched[1]))
	}
	unquoted := regexp.MustCompile(`(?i)\b` + attr + `\s*=\s*([^\s>]+)`)
	if matched := unquoted.FindStringSubmatch(tag); len(matched) > 1 {
		return strings.Trim(strings.TrimSpace(html.UnescapeString(matched[1])), `"'`)
	}
	return ""
}

/**
 * 函数说明：从 HTML 文本中提取网页标题。
 */
func extractTitle(htmlText string) string {
	matched := titleRegex.FindStringSubmatch(htmlText)
	if len(matched) < 2 {
		return ""
	}
	return strings.TrimSpace(html.UnescapeString(matched[1]))
}

/**
 * 函数说明：从 HTML 文本中提取 description 与 keywords 元信息。
 */
func extractMeta(htmlText string) (desc string, keywords string) {
	for _, tag := range metaRegex.FindAllString(htmlText, -1) {
		name := strings.ToLower(readTagAttr(tag, "name"))
		property := strings.ToLower(readTagAttr(tag, "property"))
		content := strings.TrimSpace(readTagAttr(tag, "content"))
		if content == "" {
			continue
		}

		if desc == "" && (name == "description" || property == "og:description") {
			desc = content
		}
		if keywords == "" && name == "keywords" {
			keywords = content
		}
		if desc != "" && keywords != "" {
			break
		}
	}
	return
}

/**
 * 函数说明：从 HTML 文本中提取 favicon 地址，未命中时回退 /favicon.ico。
 */
func extractFavicon(htmlText string, pageURL *url.URL) string {
	for _, tag := range linkRegex.FindAllString(htmlText, -1) {
		rel := strings.ToLower(readTagAttr(tag, "rel"))
		if !strings.Contains(rel, "icon") {
			continue
		}
		href := strings.TrimSpace(readTagAttr(tag, "href"))
		if href == "" {
			continue
		}
		ref, err := url.Parse(href)
		if err != nil {
			continue
		}
		return pageURL.ResolveReference(ref).String()
	}

	fallback := *pageURL
	fallback.Path = "/favicon.ico"
	fallback.RawQuery = ""
	fallback.Fragment = ""
	return fallback.String()
}

/**
 * 函数说明：请求目标网站并返回最终 URL 与 HTML 源码，默认优先 HTTPS。
 */
func (wSrv webInfoService) fetchHtmlWithFallback(target *url.URL) (*url.URL, string, error) {
	candidates := []*url.URL{target}
	if strings.EqualFold(target.Scheme, "https") {
		httpCandidate := *target
		httpCandidate.Scheme = "http"
		candidates = append(candidates, &httpCandidate)
	}

	var lastErr error
	for _, candidate := range candidates {
		req, err := http.NewRequest(http.MethodGet, candidate.String(), nil)
		if err != nil {
			lastErr = err
			continue
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; UIEDToolBot/1.0; +https://uiedtool.com)")
		req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")

		resp, err := wSrv.client.Do(req)
		if err != nil {
			lastErr = err
			continue
		}

		body, readErr := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024))
		_ = resp.Body.Close()
		if readErr != nil {
			lastErr = readErr
			continue
		}
		if resp.StatusCode >= http.StatusBadRequest {
			lastErr = fmt.Errorf("status=%d", resp.StatusCode)
			continue
		}
		if resp.Request == nil || resp.Request.URL == nil {
			return candidate, string(body), nil
		}
		return resp.Request.URL, string(body), nil
	}

	if lastErr == nil {
		lastErr = errors.New("请求失败")
	}
	return nil, "", lastErr
}

// Detail 获取网站信息
func (wSrv webInfoService) Detail(rawLink string) (res map[string]interface{}, e error) {
	target, err := normalizeWebInfoInput(rawLink)
	if err != nil {
		return nil, err
	}

	finalURL, htmlText, err := wSrv.fetchHtmlWithFallback(target)
	if err != nil {
		return nil, response.Failed.Make("网站信息抓取失败，请稍后重试")
	}

	title := extractTitle(htmlText)
	desc, keywords := extractMeta(htmlText)
	logo := extractFavicon(htmlText, finalURL)

	return map[string]interface{}{
		"link":     finalURL.Host,
		"title":    title,
		"desc":     desc,
		"keywords": keywords,
		"logo":     logo,
	}, nil
}
