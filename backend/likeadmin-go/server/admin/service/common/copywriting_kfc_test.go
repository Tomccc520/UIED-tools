/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"context"
	"io"
	"net/http"
	"reflect"
	"strings"
	"testing"
	"time"
)

// TestCopywritingKFCRotation 校验正常请求按来源交替，两个响应格式都能提取正文和来源。
func TestCopywritingKFCRotation(t *testing.T) {
	var requested []string
	service := &copywritingService{client: &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		requested = append(requested, req.URL.String())
		body := "\ufeff第一条测试文案\n"
		if req.URL.String() == kfcProviders[1].url {
			body = `{"code":200,"message":"获取成功","data":{"kfc":"第二条测试文案"}}`
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(body))}, nil
	})}}

	wantTexts := []string{"第一条测试文案", "第二条测试文案", "第一条测试文案"}
	for i, wantText := range wantTexts {
		result, err := service.KFC(context.Background())
		if err != nil || result.Text != wantText || result.Source != "upstream" || result.From != kfcProviders[i%2].name {
			t.Fatalf("第 %d 次获取文案错误: %+v (%v)", i+1, result, err)
		}
	}
	if want := []string{kfcProviders[0].url, kfcProviders[1].url, kfcProviders[0].url}; !reflect.DeepEqual(requested, want) {
		t.Fatalf("上游请求顺序 = %v，期望 %v", requested, want)
	}
}

// TestCopywritingKFCFailover 校验上游异常时切换、冷却跳过、双路兜底以及恢复后的重新尝试。
func TestCopywritingKFCFailover(t *testing.T) {
	var requested []string
	available := [2]bool{false, true}
	service := &copywritingService{client: &http.Client{Transport: roundTripFunc(func(req *http.Request) (*http.Response, error) {
		requested = append(requested, req.URL.String())
		if req.URL.String() == kfcProviders[0].url {
			if !available[0] {
				return nil, context.DeadlineExceeded
			}
			return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader("恢复后的测试文案"))}, nil
		}
		body := `{"code":200,"data":{"kfc":"备用测试文案"}}`
		if !available[1] {
			body = `{"code":503,"data":{"kfc":"错误消息不应显示"}}`
		}
		return &http.Response{StatusCode: http.StatusOK, Body: io.NopCloser(strings.NewReader(body))}, nil
	})}}
	ctx := context.Background()
	result, err := service.KFC(ctx)
	if err != nil || result.Text != "备用测试文案" || result.From != kfcProviders[1].name {
		t.Fatalf("第一路超时后应使用第二路: %+v (%v)", result, err)
	}

	available[1] = false
	for i := 0; i < 2; i++ {
		result, err = service.KFC(ctx)
		if err != nil || result.Source != "editorial" || libraryKFCTranslation(result.Text) == "" {
			t.Fatalf("两路均不可用时应返回带配套英文的站内文案: %+v (%v)", result, err)
		}
	}
	if want := []string{kfcProviders[0].url, kfcProviders[1].url, kfcProviders[1].url}; !reflect.DeepEqual(requested, want) {
		t.Fatalf("应跳过仍在冷却的来源: 请求=%v，期望=%v", requested, want)
	}

	available[0] = true
	service.kfc.retryAt[0] = time.Now().Add(-time.Second)
	result, err = service.KFC(ctx)
	if err != nil || result.Text != "恢复后的测试文案" || result.From != kfcProviders[0].name {
		t.Fatalf("冷却结束后应再次尝试已恢复的来源: %+v (%v)", result, err)
	}
}
