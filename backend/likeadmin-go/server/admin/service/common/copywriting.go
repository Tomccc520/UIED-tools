/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */
package common

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"gorm.io/gorm"
)

const (
	// 随机文案属于轻量非关键请求，故障时应快速回退本地内容，避免前台等待过久。
	copywritingRequestTimeout          = 2 * time.Second
	copywritingTranslateRequestTimeout = 6 * time.Second
	copywritingHTTPClientTimeout       = 3 * time.Second
	copywritingMaxBodyBytes            = 512 * 1024
	copywritingMaxTranslateChars       = 10000
)

// copywritingRandomConfig 函数说明：定义每类随机文案的上游白名单和本地降级内容。
type copywritingRandomConfig struct {
	upstreams []string
	fallbacks []CopywritingTextResult
}

var (
	copywritingScriptPattern  = regexp.MustCompile(`(?is)<script\b[^>]*>.*?</script>`)
	copywritingYiyanUpstreams = []string{
		// 当前 hitokoto 响应稳定，优先使用；52vmy 作为兼容备用源保留。
		"https://v1.hitokoto.cn/?encode=json",
		"https://api.52vmy.cn/api/wl/yan/yiyan",
	}
	copywritingKFCUpstreams = []string{
		"https://api.pearktrue.cn/api/kfc?type=json",
		"https://api.pearktrue.cn/api/v1/get/kfc",
		"https://tools.mgtv100.com/external/v1/pear/kfc",
	}
	copywritingTranslateUpstreams = []string{
		"https://suapi.net/api/text/translate",
		"https://api.mymemory.translated.net/get",
	}
	copywritingYiyanFallbacks = []string{
		"生活中最重要的不是你所处的位置，而是你所朝的方向。",
		"每一个不曾起舞的日子，都是对生命的辜负。",
		"不要等待机会，而要创造机会。",
		"生命不是要超越别人，而是要超越自己。",
		"没有人能替你承担人生的修行，每一步都需要自己走。",
		"生活不是等待暴风雨过去，而是学会在雨中翩翩起舞。",
		"不要让未来的你，讨厌现在的自己。",
		"成功的秘诀是坚持做正确的事情，而不是做容易的事情。",
		"每一个优秀的人，都有一段沉默的时光。",
		"人生没有白走的路，每一步都算数。",
	}
	copywritingKFCFallbacks = []string{
		"V我50，请我吃肯德基疯狂星期四。",
		"今天是肯德基疯狂星期四，谁请我吃？",
		"小时候妈妈说我吃饭不专心，吃得不多，长不高。现在KFC疯狂星期四，我更加专心，吃得更多，个子也长得更高了。",
		"如果生活有开关，那肯德基疯狂星期四就是快乐启动键。",
		"今天不谈工作，只谈肯德基疯狂星期四。",
	}
	copywritingRandomConfigs = map[string]copywritingRandomConfig{
		"poison-soup": {
			upstreams: []string{"https://v.api.aa1.cn/api/api-wenan-dujitang/index.php?aa1=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "你以为有钱人很快乐吗？他们的快乐你根本想象不到。"},
				{Text: "条条大路通罗马，而有些人就生在罗马。"},
			},
		},
		"daily-poem": {
			upstreams: []string{"https://v1.jinrishici.com/all.json"},
			fallbacks: []CopywritingTextResult{
				{Text: "海内存知己，天涯若比邻。", Title: "送杜少府之任蜀州", Author: "王勃"},
				{Text: "长风破浪会有时，直挂云帆济沧海。", Title: "行路难", Author: "李白"},
			},
		},
		"funny": {
			upstreams: []string{"https://zj.v.api.aa1.cn/api/wenan-gaoxiao/?type=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "我的钱包就像洋葱，每打开一次就会哭一次。"},
				{Text: "我不是懒，我只是在充电，可惜充电器是个冒牌货。"},
			},
		},
		"inspiring": {
			upstreams: []string{"https://zj.v.api.aa1.cn/api/wenan-zl/?type=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "人生没有白走的路，每一步都算数。"},
				{Text: "不要等待机会，而要创造机会。"},
			},
		},
		"moments": {
			upstreams: []string{"https://v.api.aa1.cn/api/pyq/index.php?aa1=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "生活不在别处，当下即是全部。"},
				{Text: "愿你遍历山河，仍觉人间值得。"},
			},
		},
		"comfort": {
			upstreams: []string{"https://v.api.aa1.cn/api/api-wenan-anwei/index.php?type=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "每个人都有自己的节奏，慢一点也没关系。"},
				{Text: "记住，你比自己想象的要坚强得多。"},
			},
		},
		"dog-diary": {
			upstreams: []string{"https://api.pearktrue.cn/api/jdyl/tiangou.php"},
			fallbacks: []CopywritingTextResult{
				{Text: "今天你终于回了我一个字，我截图保存了下来，因为这是我们今天全部的故事。"},
				{Text: "今天你又很忙，没关系，我把想说的话都存在了草稿箱里。"},
			},
		},
		"cloud-music": {
			upstreams: []string{"https://zj.v.api.aa1.cn/api/wenan-wy/?type=json"},
			fallbacks: []CopywritingTextResult{
				{Text: "我们听歌的时候，遇见的不是旋律，而是自己。", From: "网易云音乐"},
				{Text: "你的孤独，虽败犹荣。", From: "孤独患者 - 陈奕迅"},
			},
		},
	}
)

// CopywritingTextResult 函数说明：定义随机文案接口的统一返回结构，屏蔽第三方字段差异。
type CopywritingTextResult struct {
	Text   string `json:"text"`
	Source string `json:"source"`
	Title  string `json:"title,omitempty"`
	Author string `json:"author,omitempty"`
	From   string `json:"from,omitempty"`
}

// CopywritingTranslationResult 函数说明：定义同域翻译接口的统一返回结构。
type CopywritingTranslationResult struct {
	Text string `json:"text"`
}

// ICopywritingService 函数说明：提供前台随机文案与翻译的同域服务能力。
type ICopywritingService interface {
	Yiyan(ctx context.Context) (CopywritingTextResult, error)
	KFC(ctx context.Context) (CopywritingTextResult, error)
	Random(ctx context.Context, kind string) (CopywritingTextResult, error)
	Translate(ctx context.Context, text string) (CopywritingTranslationResult, error)
}

// copywritingService 函数说明：通过固定上游白名单请求随机文案，并在上游异常时返回本地内容。
type copywritingService struct {
	client *http.Client
}

// NewCopywritingService 函数说明：初始化随机文案服务，避免前台直接暴露第三方请求和跨域依赖。
func NewCopywritingService(db *gorm.DB) ICopywritingService {
	_ = db
	return &copywritingService{
		client: &http.Client{Timeout: copywritingHTTPClientTimeout},
	}
}

// Yiyan 函数说明：获取随机一言，上游不可用时自动返回本地精选语录。
func (s *copywritingService) Yiyan(ctx context.Context) (CopywritingTextResult, error) {
	text, err := s.fetchText(ctx, copywritingYiyanUpstreams)
	if err == nil && text != "" {
		return CopywritingTextResult{Text: text, Source: "upstream"}, nil
	}
	return CopywritingTextResult{Text: randomCopywritingFallback(copywritingYiyanFallbacks), Source: "fallback"}, nil
}

// KFC 函数说明：获取肯德基疯狂星期四文案，上游不可用时自动返回本地精选文案。
func (s *copywritingService) KFC(ctx context.Context) (CopywritingTextResult, error) {
	text, err := s.fetchText(ctx, copywritingKFCUpstreams)
	if err == nil && text != "" {
		return CopywritingTextResult{Text: text, Source: "upstream"}, nil
	}
	return CopywritingTextResult{Text: randomCopywritingFallback(copywritingKFCFallbacks), Source: "fallback"}, nil
}

// Random 函数说明：按白名单类型获取随机文案，并在上游故障时返回对应的本地降级内容。
func (s *copywritingService) Random(ctx context.Context, kind string) (CopywritingTextResult, error) {
	config, ok := copywritingRandomConfigs[strings.TrimSpace(kind)]
	if !ok {
		return CopywritingTextResult{}, errors.New("不支持的文案类型")
	}

	result, err := s.fetchResultWithTimeout(ctx, config.upstreams, copywritingRequestTimeout)
	if err == nil && result.Text != "" {
		result.Source = "upstream"
		return result, nil
	}
	fallback := randomCopywritingResult(config.fallbacks)
	fallback.Source = "fallback"
	return fallback, nil
}

// Translate 函数说明：通过同域后台代理翻译肯德基文案，避免浏览器直接请求第三方接口产生跨域或生产 404。
func (s *copywritingService) Translate(ctx context.Context, text string) (CopywritingTranslationResult, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return CopywritingTranslationResult{}, errors.New("请输入需要翻译的文案")
	}
	if len([]rune(text)) > copywritingMaxTranslateChars {
		return CopywritingTranslationResult{}, fmt.Errorf("翻译文案不能超过 %d 个字符", copywritingMaxTranslateChars)
	}

	primaryQuery := url.Values{}
	primaryQuery.Set("to", "en")
	primaryQuery.Set("text[]", text)
	backupQuery := url.Values{}
	backupQuery.Set("q", text)
	backupQuery.Set("langpair", "zh-CN|en")
	upstreams := []string{
		copywritingTranslateUpstreams[0] + "?" + primaryQuery.Encode(),
		copywritingTranslateUpstreams[1] + "?" + backupQuery.Encode(),
	}
	translated, err := s.fetchTextWithTimeout(ctx, upstreams, copywritingTranslateRequestTimeout)
	if err != nil || translated == "" {
		if err == nil {
			err = errors.New("翻译接口未返回有效内容")
		}
		return CopywritingTranslationResult{}, err
	}
	return CopywritingTranslationResult{Text: translated}, nil
}

// fetchText 函数说明：按固定顺序尝试上游地址，统一处理超时、非成功状态和响应体大小限制。
func (s *copywritingService) fetchText(ctx context.Context, upstreams []string) (string, error) {
	return s.fetchTextWithTimeout(ctx, upstreams, copywritingRequestTimeout)
}

// fetchTextWithTimeout 函数说明：在给定的整体时限内按顺序请求上游，为关键接口预留备用源切换时间。
func (s *copywritingService) fetchTextWithTimeout(ctx context.Context, upstreams []string, timeout time.Duration) (string, error) {
	result, err := s.fetchResultWithTimeout(ctx, upstreams, timeout)
	return result.Text, err
}

// fetchResultWithTimeout 函数说明：在限定时间内请求白名单上游，同时保留诗词标题、作者和音乐来源等可选元数据。
func (s *copywritingService) fetchResultWithTimeout(ctx context.Context, upstreams []string, timeout time.Duration) (CopywritingTextResult, error) {
	if s == nil || s.client == nil {
		return CopywritingTextResult{}, errors.New("文案服务 HTTP 客户端未初始化")
	}
	requestCtx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	var lastErr error
	for _, upstream := range upstreams {
		request, err := http.NewRequestWithContext(requestCtx, http.MethodGet, upstream, nil)
		if err != nil {
			lastErr = err
			continue
		}
		request.Header.Set("Accept", "application/json, text/plain;q=0.9, */*;q=0.1")
		request.Header.Set("User-Agent", "UIED-Tools/3.0 (+https://uiedtool.com)")

		resp, err := s.client.Do(request)
		if err != nil {
			lastErr = err
			continue
		}
		body, readErr := io.ReadAll(io.LimitReader(resp.Body, copywritingMaxBodyBytes))
		_ = resp.Body.Close()
		if readErr != nil {
			lastErr = readErr
			continue
		}
		if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
			lastErr = fmt.Errorf("上游状态码 %d", resp.StatusCode)
			continue
		}

		if result := parseCopywritingResult(body); result.Text != "" {
			return result, nil
		}
		lastErr = errors.New("上游未返回有效文案")
	}
	if lastErr == nil {
		lastErr = errors.New("没有可用的文案上游")
	}
	return CopywritingTextResult{}, lastErr
}

// parseCopywritingResult 函数说明：将上游响应解析为统一文案结果，并保留常用的顶层元数据。
func parseCopywritingResult(body []byte) CopywritingTextResult {
	result := CopywritingTextResult{Text: parseCopywritingResponse(body)}
	if result.Text == "" {
		return result
	}

	var payload interface{}
	if json.Unmarshal(body, &payload) != nil {
		return result
	}
	result.Title = extractCopywritingTopLevelString(payload, "origin", "title")
	result.Author = extractCopywritingTopLevelString(payload, "author")
	result.From = extractCopywritingTopLevelString(payload, "from", "source")
	return result
}

// extractCopywritingTopLevelString 函数说明：从上游顶层 JSON 对象中读取首个有效字符串字段。
func extractCopywritingTopLevelString(payload interface{}, keys ...string) string {
	value, ok := payload.(map[string]interface{})
	if !ok {
		return ""
	}
	for _, key := range keys {
		if text, ok := value[key].(string); ok {
			if normalized := normalizeCopywritingText(text); normalized != "" {
				return normalized
			}
		}
	}
	return ""
}

// parseCopywritingResponse 函数说明：兼容 JSON、纯文本和多层 data/msg 字段，避免第三方响应格式变更导致空内容。
func parseCopywritingResponse(body []byte) string {
	raw := strings.TrimSpace(copywritingScriptPattern.ReplaceAllString(string(body), ""))
	if raw == "" || strings.HasPrefix(strings.ToLower(raw), "<!doctype html") || strings.HasPrefix(strings.ToLower(raw), "<html") {
		return ""
	}

	var payload interface{}
	if json.Unmarshal([]byte(raw), &payload) == nil {
		return extractCopywritingText(payload)
	}
	return normalizeCopywritingText(raw)
}

// extractCopywritingText 函数说明：优先读取文案字段，再递归处理 data 嵌套对象和数组。
func extractCopywritingText(payload interface{}) string {
	switch value := payload.(type) {
	case string:
		return normalizeCopywritingText(value)
	case []interface{}:
		for _, item := range value {
			if text := extractCopywritingText(item); text != "" {
				return text
			}
		}
	case map[string]interface{}:
		for _, key := range []string{"text", "translatedText", "hitokoto", "content", "sentence", "wenan", "dujitang", "pyq", "translations", "responseData", "data"} {
			if item, ok := value[key]; ok {
				if text := extractCopywritingText(item); text != "" {
					return text
				}
			}
		}
		// 部分旧接口仅使用 msg 返回正文，但需要过滤“成功”等状态文案。
		if item, ok := value["msg"]; ok {
			if text := extractCopywritingText(item); text != "" && !isCopywritingStatusText(text) {
				return text
			}
		}
	}
	return ""
}

// normalizeCopywritingText 函数说明：清理第三方纯文本响应中的 BOM、HTML 包裹和多余空白。
func normalizeCopywritingText(raw string) string {
	text := strings.TrimSpace(strings.TrimPrefix(raw, "\ufeff"))
	if text == "" || strings.HasPrefix(strings.ToLower(text), "<!doctype html") || strings.HasPrefix(strings.ToLower(text), "<html") {
		return ""
	}
	return text
}

// isCopywritingStatusText 函数说明：过滤上游把状态信息误放在 msg 字段时的无效文案。
func isCopywritingStatusText(text string) bool {
	switch strings.ToLower(strings.TrimSpace(text)) {
	case "ok", "success", "成功", "请求成功", "操作成功":
		return true
	default:
		return false
	}
}

// randomCopywritingFallback 函数说明：从本地兜底文案中随机选择一条，确保接口在上游故障时仍可用。
func randomCopywritingFallback(items []string) string {
	if len(items) == 0 {
		return "暂时没有可用文案，请稍后重试。"
	}
	return items[rand.Intn(len(items))]
}

// randomCopywritingResult 函数说明：从指定类型的本地降级结果中随机取一条，保证异常时仍有可用内容。
func randomCopywritingResult(items []CopywritingTextResult) CopywritingTextResult {
	if len(items) == 0 {
		return CopywritingTextResult{Text: "暂时没有可用文案，请稍后重试。"}
	}
	return items[rand.Intn(len(items))]
}
