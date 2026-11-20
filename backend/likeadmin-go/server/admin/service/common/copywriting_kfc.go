/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

const kfcProviderCooldown = 30 * time.Second

var kfcProviders = [...]struct {
	name  string
	url   string
	parse func([]byte) string
}{
	{name: "夏柔 API · v50", url: "https://apis.uctb.cn/api/v50", parse: parsePlainCopywritingText},
	{name: "60s API", url: "https://60s.viki.moe/v2/kfc", parse: parseKFC60s},
}

// kfcRotation 按请求交替选择首选来源，并记录故障来源的下次尝试时间。
type kfcRotation struct {
	mu      sync.Mutex
	next    int
	retryAt [len(kfcProviders)]time.Time
}

// KFC 按请求轮换两个文案源，单个来源失败时尝试另一个，两者均不可用时返回站内文案。
func (s *copywritingService) KFC(ctx context.Context) (CopywritingTextResult, error) {
	if s.client == nil || ctx.Err() != nil {
		return s.libraryRandomText("kfc")
	}
	s.kfc.mu.Lock()
	start, retryAt := s.kfc.next, s.kfc.retryAt
	s.kfc.next = (start + 1) % len(kfcProviders)
	s.kfc.mu.Unlock()

	for offset := range kfcProviders {
		if ctx.Err() != nil {
			break
		}
		index := (start + offset) % len(kfcProviders)
		if time.Now().Before(retryAt[index]) {
			continue
		}
		provider := kfcProviders[index]
		body, err := s.fetchFixedCopywritingBody(ctx, provider.url)
		if err == nil {
			if text := provider.parse(body); text != "" {
				return CopywritingTextResult{Text: text, Source: "upstream", From: provider.name}, nil
			}
		}
		if ctx.Err() == nil {
			s.kfc.mu.Lock()
			s.kfc.retryAt[index] = time.Now().Add(kfcProviderCooldown)
			s.kfc.mu.Unlock()
		}
	}
	return s.libraryRandomText("kfc")
}

// parseKFC60s 从 60s API 的成功响应中取出 data.kfc，避免把消息字段误当作文案。
func parseKFC60s(body []byte) string {
	var payload struct {
		Code int `json:"code"`
		Data struct {
			KFC string `json:"kfc"`
		} `json:"data"`
	}
	if json.Unmarshal(body, &payload) != nil || payload.Code != http.StatusOK {
		return ""
	}
	return parsePlainCopywritingText([]byte(payload.Data.KFC))
}
