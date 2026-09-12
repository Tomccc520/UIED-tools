package common

import (
	"errors"
	"fmt"
	"gorm.io/gorm"
	"html"
	"io"
	"likeadmin/core/response"
	"net"
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
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return nil, response.AssertArgumentError.Make("仅支持 HTTP 或 HTTPS 网站")
	}
	if err := validateWebInfoURL(parsed); err != nil {
		return nil, response.AssertArgumentError.Make("暂不支持内网或本机地址")
	}

	parsed.Path = "/"
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed, nil
}

/**
 * 函数说明：判断网站信息抓取目标是否属于本机、内网、链路本地或云元数据地址，避免公开接口形成 SSRF。
 * 参数说明：hostname 为 URL 解析后的主机名，不包含端口。
 * 返回值说明：属于受限地址时返回 true，否则返回 false。
 */
func isPrivateWebInfoHost(hostname string) bool {
	host := strings.ToLower(strings.TrimSuffix(strings.TrimSpace(hostname), "."))
	if host == "" || strings.Contains(host, "%") || host == "localhost" || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") {
		return true
	}
	parsedIP := net.ParseIP(host)
	if parsedIP == nil {
		return false
	}
	return parsedIP.IsLoopback() || parsedIP.IsPrivate() || parsedIP.IsLinkLocalUnicast() || parsedIP.IsLinkLocalMulticast() || parsedIP.IsUnspecified()
}

/**
 * 函数说明：校验网站信息抓取地址及其 DNS 解析结果，阻止域名指向内网或本机地址。
 * 参数说明：target 为待请求的完整网站 URL。
 * 返回值说明：地址不安全或 DNS 解析到受限地址时返回错误。
 */
func validateWebInfoURL(target *url.URL) error {
	if target == nil || (target.Scheme != "http" && target.Scheme != "https") || target.User != nil {
		return errors.New("网站地址不安全")
	}
	hostname := target.Hostname()
	if isPrivateWebInfoHost(hostname) {
		return errors.New("网站地址不安全")
	}
	resolvedIPs, err := net.LookupIP(hostname)
	if err != nil {
		// DNS 失败交给 HTTP 客户端处理，避免误伤暂时不可解析但格式合法的公网域名。
		return nil
	}
	for _, resolvedIP := range resolvedIPs {
		if isPrivateWebInfoHost(resolvedIP.String()) {
			return errors.New("网站地址不安全")
		}
	}
	return nil
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
	client := *wSrv.client
	client.CheckRedirect = func(request *http.Request, via []*http.Request) error {
		if len(via) >= 5 {
			return errors.New("网站重定向次数过多")
		}
		return validateWebInfoURL(request.URL)
	}
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

		resp, err := client.Do(req)
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
