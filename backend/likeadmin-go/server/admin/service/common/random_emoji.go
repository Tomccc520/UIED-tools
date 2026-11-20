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
	"errors"
	"io"
	"math/rand"
	"net/http"
	"net/url"
	"path"
	"strings"
	"time"
)

const (
	randomEmojiCatalogURL = "https://api.ruseo.cn/api/bqb?type=1&limit=5"
	randomEmojiBackupURL  = "https://api3.mhimg.cn/api/Api_stdd"
	randomEmojiMaxJSON    = 64 << 10
	randomEmojiMaxImage   = 5 << 20
)

// RandomEmojiResult 保存图片原始字节、实际媒体类型和素材来源。
type RandomEmojiResult struct {
	Body        []byte
	ContentType string
	Source      string
}

// RandomEmojiService 从固定来源读取随机表情包。
type RandomEmojiService struct {
	client *http.Client
}

// NewRandomEmojiService 初始化有超时和跳转限制的图片请求客户端。
func NewRandomEmojiService() *RandomEmojiService {
	return &RandomEmojiService{client: &http.Client{
		Timeout:       3 * time.Second,
		CheckRedirect: checkRandomEmojiRedirect,
	}}
}

// checkRandomEmojiRedirect 只允许水豚接口跳转一次到对应的图片存储地址。
func checkRandomEmojiRedirect(req *http.Request, via []*http.Request) error {
	if len(via) == 1 && via[0].URL.String() == randomEmojiBackupURL &&
		isRandomEmojiImageURL(req.URL, "gg.oss.mhimg.cn", "/cosplay/水豚嘟嘟/") {
		return nil
	}
	return http.ErrUseLastResponse
}

// isRandomEmojiImageURL 校验图片使用指定的 HTTPS 域名和素材目录。
func isRandomEmojiImageURL(imageURL *url.URL, host, directory string) bool {
	return imageURL.Scheme == "https" && imageURL.Host == host && imageURL.User == nil &&
		strings.HasPrefix(imageURL.Path, directory) && path.Clean(imageURL.Path) == imageURL.Path
}

// Random 优先获取澄曜随机表情，失败时切换到水豚动图。
func (s *RandomEmojiService) Random(ctx context.Context) (RandomEmojiResult, error) {
	ctx, cancel := context.WithTimeout(ctx, 6*time.Second)
	defer cancel()
	primaryCtx, stopPrimary := context.WithTimeout(ctx, 3*time.Second)
	result, err := s.catalogImage(primaryCtx)
	stopPrimary()
	if err == nil {
		return result, nil
	}
	return s.image(ctx, randomEmojiBackupURL, "capybara")
}

// catalogImage 在随机结果中选取可下载的图片，单次最多尝试三张。
func (s *RandomEmojiService) catalogImage(ctx context.Context) (RandomEmojiResult, error) {
	body, err := s.get(ctx, randomEmojiCatalogURL, "application/json", randomEmojiMaxJSON)
	if err != nil {
		return RandomEmojiResult{}, err
	}
	var response struct {
		Code int `json:"code"`
		Data struct {
			Code   int      `json:"code"`
			Images []string `json:"res"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &response); err != nil || response.Code != 0 || response.Data.Code != http.StatusOK {
		return RandomEmojiResult{}, errors.New("表情包目录返回异常")
	}
	images := response.Data.Images
	attempts := 0
	for _, index := range rand.Perm(len(images)) {
		if ctx.Err() != nil || attempts >= 3 {
			break
		}
		imageURL, err := url.Parse(images[index])
		if err != nil || !isRandomEmojiImageURL(imageURL, "res.apihz.cn", "/img/bqb/") {
			continue
		}
		attempts++
		if result, err := s.image(ctx, imageURL.String(), "ruseo"); err == nil {
			return result, nil
		}
	}
	return RandomEmojiResult{}, errors.New("表情包目录没有可用图片")
}

// image 读取原图并根据文件字节识别格式，拒绝网页、脚本及其他非图片响应。
func (s *RandomEmojiService) image(ctx context.Context, imageURL, source string) (RandomEmojiResult, error) {
	body, err := s.get(ctx, imageURL, "image/*", randomEmojiMaxImage)
	if err != nil {
		return RandomEmojiResult{}, err
	}
	contentType := http.DetectContentType(body)
	switch contentType {
	case "image/jpeg", "image/png", "image/gif", "image/webp":
		return RandomEmojiResult{Body: body, ContentType: contentType, Source: source}, nil
	default:
		return RandomEmojiResult{}, errors.New("上游未返回有效图片")
	}
}

// get 在请求期限内读取上游响应，拒绝非成功状态和超出限制的内容。
func (s *RandomEmojiService) get(ctx context.Context, upstream, accept string, limit int64) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, upstream, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Accept", accept)
	req.Header.Set("User-Agent", "UIED-Tools/3.0 (+https://uiedtool.com)")
	response, err := s.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK || response.ContentLength > limit {
		return nil, errors.New("表情包来源响应异常")
	}
	body, err := io.ReadAll(io.LimitReader(response.Body, limit+1))
	if err != nil {
		return nil, err
	}
	if int64(len(body)) > limit {
		return nil, errors.New("表情包来源响应超过大小限制")
	}
	return body, nil
}
