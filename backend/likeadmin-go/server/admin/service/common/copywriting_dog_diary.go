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
)

const dogDiaryUpstream = "https://v.api.aa1.cn/api/tiangou/index.php?aa1=json"

// dogDiary 读取夏柔 API 的随机日记，网络或响应异常时从站内库选取一篇。
func (s *copywritingService) dogDiary(ctx context.Context) (CopywritingTextResult, error) {
	body, err := s.fetchFixedCopywritingBody(ctx, dogDiaryUpstream)
	if err == nil {
		if text := parseDogDiaryResponse(body); text != "" {
			return CopywritingTextResult{Text: text, Source: "upstream", From: "夏柔 API"}, nil
		}
	}
	return s.libraryRandomText("dog-diary")
}

// parseDogDiaryResponse 读取实际返回的 msg 或文档中的 newslist 正文，拒绝错误状态和无效内容。
func parseDogDiaryResponse(body []byte) string {
	var payload struct {
		Code     *int   `json:"code"`
		Msg      string `json:"msg"`
		Newslist []struct {
			Content string `json:"content"`
		} `json:"newslist"`
	}
	if json.Unmarshal(body, &payload) != nil || (payload.Code != nil && *payload.Code != http.StatusOK) {
		return ""
	}
	if payload.Newslist == nil {
		return parsePlainCopywritingText([]byte(payload.Msg))
	}
	for _, row := range payload.Newslist {
		if text := parsePlainCopywritingText([]byte(row.Content)); text != "" {
			return text
		}
	}
	return ""
}
