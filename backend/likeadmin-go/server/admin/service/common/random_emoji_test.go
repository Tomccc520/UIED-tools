/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"context"
	"encoding/base64"
	"io"
	"net/http"
	"strings"
	"testing"
)

// TestRandomEmoji 校验目录来源、备用跳转、格式识别和上游地址白名单。
func TestRandomEmoji(t *testing.T) {
	const catalogImageURL = "https://res.apihz.cn/img/bqb/reaction.GIF"
	const backupImageURL = "https://gg.oss.mhimg.cn/cosplay/%E6%B0%B4%E8%B1%9A%E5%98%9F%E5%98%9F/reaction.gif"
	gif, err := base64.StdEncoding.DecodeString("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")
	if err != nil {
		t.Fatal(err)
	}
	gifBody := string(gif)
	tests := []struct {
		name     string
		catalog  string
		image    string
		location string
		want     string
	}{
		{
			name:    "目录返回真实动图",
			catalog: `{"code":0,"data":{"code":200,"res":["` + catalogImageURL + `"]}}`,
			image:   gifBody,
			want:    "ruseo",
		},
		{
			name:     "错误网页切到备用动图",
			catalog:  `{"code":0,"data":{"code":200,"res":["` + catalogImageURL + `"]}}`,
			image:    "<!doctype html><p>图片不可用</p>",
			location: backupImageURL,
			want:     "capybara",
		},
		{
			name:     "拒绝目录和备用返回的非白名单地址",
			catalog:  `{"code":0,"data":{"code":200,"res":["http://127.0.0.1/img/bqb/reaction.gif","https://res.apihz.cn/img/bqb/../../other.gif"]}}`,
			location: "http://127.0.0.1/private",
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			service := NewRandomEmojiService()
			service.client.Transport = roundTripFunc(func(req *http.Request) (*http.Response, error) {
				response := &http.Response{StatusCode: http.StatusOK, Header: make(http.Header)}
				var body string
				switch req.URL.String() {
				case randomEmojiCatalogURL:
					body = test.catalog
				case catalogImageURL:
					body = test.image
				case randomEmojiBackupURL:
					if test.location == "" {
						t.Fatal("主来源成功时不应请求备用源")
					}
					response.StatusCode = http.StatusFound
					response.Header.Set("Location", test.location)
				case backupImageURL:
					body = gifBody
				default:
					t.Fatalf("向非预期地址发起了请求: %s", req.URL)
				}
				response.Body = io.NopCloser(strings.NewReader(body))
				return response, nil
			})
			result, err := service.Random(context.Background())
			if test.want == "" {
				if err == nil {
					t.Fatal("没有可用的白名单图片时应返回错误")
				}
				return
			}
			if err != nil || result.Source != test.want || result.ContentType != "image/gif" || string(result.Body) != gifBody {
				t.Fatalf("未返回预期来源的 GIF 原图: source=%q type=%q err=%v", result.Source, result.ContentType, err)
			}
		})
	}
}
