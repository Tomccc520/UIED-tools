/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */
package common

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"
)

// TestParseCopywritingResponse 函数说明：校验常见 JSON 嵌套字段可以统一解析为文案。
func TestParseCopywritingResponse(t *testing.T) {
	tests := []struct {
		name string
		body string
		want string
	}{
		{name: "data text", body: `{"code":200,"data":{"text":"一条测试文案"}}`, want: "一条测试文案"},
		{name: "hitokoto", body: `{"hitokoto":"保持热爱，奔赴山海。"}`, want: "保持热爱，奔赴山海。"},
		{name: "MyMemory response", body: `{"responseData":{"translatedText":"Crazy Thursday"}}`, want: "Crazy Thursday"},
		{name: "script wrapped moments", body: `<script>alert(1)</script>{"pyq":"今日宜开心"}`, want: "今日宜开心"},
		{name: "plain text", body: "\ufeff纯文本接口返回", want: "纯文本接口返回"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := parseCopywritingResponse([]byte(test.body)); got != test.want {
				t.Fatalf("解析结果不符合预期: got=%q want=%q", got, test.want)
			}
		})
	}
}

// TestParseCopywritingResultMetadata 函数说明：校验每日诗词与音乐热评的可选元数据会被保留。
func TestParseCopywritingResultMetadata(t *testing.T) {
	poem := parseCopywritingResult([]byte(`{"content":"海内存知己。","origin":"送杜少府之任蜀州","author":"王勃"}`))
	if poem.Text != "海内存知己。" || poem.Title != "送杜少府之任蜀州" || poem.Author != "王勃" {
		t.Fatalf("诗词元数据解析不符合预期: %+v", poem)
	}

	comment := parseCopywritingResult([]byte(`{"text":"一条热评","from":"测试歌曲"}`))
	if comment.Text != "一条热评" || comment.From != "测试歌曲" {
		t.Fatalf("音乐热评元数据解析不符合预期: %+v", comment)
	}
}

// TestParseCopywritingResponseRejectsHTML 函数说明：校验上游返回错误页面时不会把 HTML 当作文案展示。
func TestParseCopywritingResponseRejectsHTML(t *testing.T) {
	if got := parseCopywritingResponse([]byte("<!doctype html><html><body>502</body></html>")); got != "" {
		t.Fatalf("HTML 错误页不应被解析为文案: %q", got)
	}
}

// TestParseCopywritingResponseRejectsErrorJSON 函数说明：校验仅包含错误字段的 JSON 不会被当作正文返回。
func TestParseCopywritingResponseRejectsErrorJSON(t *testing.T) {
	if got := parseCopywritingResponse([]byte(`{"code":500,"message":"temporary unavailable"}`)); got != "" {
		t.Fatalf("错误 JSON 不应被解析为文案: %q", got)
	}
}

// TestCopywritingFallback 函数说明：校验上游请求失败时接口仍返回本地兜底内容。
func TestCopywritingFallback(t *testing.T) {
	service := &copywritingService{
		client: &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
			return nil, errors.New("模拟上游不可用")
		})},
	}
	result, err := service.Yiyan(context.Background())
	if err != nil {
		t.Fatalf("兜底接口不应返回错误: %v", err)
	}
	if result.Source != "fallback" || result.Text == "" {
		t.Fatalf("兜底结果不符合预期: %+v", result)
	}
}

// TestCopywritingRandomFallback 函数说明：校验扩展文案类型在上游故障时仍返回带来源的本地内容。
func TestCopywritingRandomFallback(t *testing.T) {
	service := &copywritingService{
		client: &http.Client{Transport: roundTripFunc(func(*http.Request) (*http.Response, error) {
			return nil, errors.New("模拟扩展文案上游不可用")
		})},
	}
	result, err := service.Random(context.Background(), "daily-poem")
	if err != nil {
		t.Fatalf("扩展文案降级不应返回错误: %v", err)
	}
	if result.Source != "fallback" || result.Text == "" || result.Title == "" || result.Author == "" {
		t.Fatalf("诗词降级结果不符合预期: %+v", result)
	}
}

// TestCopywritingRandomRejectsUnknownKind 函数说明：校验动态路由只允许预置文案类型。
func TestCopywritingRandomRejectsUnknownKind(t *testing.T) {
	service := &copywritingService{client: &http.Client{}}
	if _, err := service.Random(context.Background(), "unknown"); err == nil {
		t.Fatal("未知文案类型应返回错误")
	}
}

// TestCopywritingTranslate 函数说明：校验翻译接口的多层 translations 响应可以提取为统一文本。
func TestCopywritingTranslate(t *testing.T) {
	service := &copywritingService{
		client: &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
			if request.URL.Query().Get("text[]") != "疯狂星期四" {
				t.Fatalf("翻译请求参数未正确编码: %s", request.URL.String())
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"code":200,"data":[{"translations":[{"text":"Mad Thursday"}]}]}`)),
			}, nil
		})},
	}
	result, err := service.Translate(context.Background(), "疯狂星期四")
	if err != nil {
		t.Fatalf("翻译接口不应返回错误: %v", err)
	}
	if result.Text != "Mad Thursday" {
		t.Fatalf("翻译结果不符合预期: %+v", result)
	}
}

// TestCopywritingTranslateFallback 函数说明：校验主翻译源异常时会自动切换到 MyMemory 备用源。
func TestCopywritingTranslateFallback(t *testing.T) {
	requestCount := 0
	service := &copywritingService{
		client: &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
			requestCount++
			if requestCount == 1 {
				return &http.Response{
					StatusCode: http.StatusServiceUnavailable,
					Body:       io.NopCloser(strings.NewReader(`{"message":"temporary unavailable"}`)),
				}, nil
			}
			if request.URL.Query().Get("q") != "疯狂星期四" || request.URL.Query().Get("langpair") != "zh-CN|en" {
				t.Fatalf("备用翻译请求参数不正确: %s", request.URL.String())
			}
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"responseData":{"translatedText":"Crazy Thursday"}}`)),
			}, nil
		})},
	}
	result, err := service.Translate(context.Background(), "疯狂星期四")
	if err != nil {
		t.Fatalf("备用翻译源不应返回错误: %v", err)
	}
	if requestCount != 2 || result.Text != "Crazy Thursday" {
		t.Fatalf("备用翻译结果不符合预期: count=%d result=%+v", requestCount, result)
	}
}

// roundTripFunc 函数说明：将函数适配为 HTTP RoundTripper，便于隔离第三方网络请求测试。
type roundTripFunc func(*http.Request) (*http.Response, error)

// RoundTrip 函数说明：执行测试用 RoundTripper 回调。
func (fn roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return fn(request)
}
