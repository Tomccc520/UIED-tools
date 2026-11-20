/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"embed"
	"encoding/json"
	"fmt"
	"math/rand"
	"strings"

	"likeadmin/core/response"
)

//go:embed copywriting_library/*.json
var copywritingLibraryFiles embed.FS

// CopywritingLibraryEntry 定义可在浏览器内切换、复制和展示出处的一条站内内容。
type CopywritingLibraryEntry struct {
	ID      string `json:"id"`
	Text    string `json:"text"`
	English string `json:"english,omitempty"`
	Title   string `json:"title,omitempty"`
	Author  string `json:"author,omitempty"`
	Dynasty string `json:"dynasty,omitempty"`
	From    string `json:"from,omitempty"`
	Topic   string `json:"topic,omitempty"`
}

// CopywritingLibraryResult 提供单个工具的内容与更新日期，前端按北京时间轮换展示。
type CopywritingLibraryResult struct {
	UpdatedAt string                    `json:"updatedAt"`
	Items     []CopywritingLibraryEntry `json:"items"`
}

var copywritingCatalog, copywritingCatalogErr = loadCopywritingLibrary()

// loadCopywritingLibrary 在启动时解析各工具与浏览器共用的内容文件。
func loadCopywritingLibrary() (map[string]CopywritingLibraryResult, error) {
	kinds := []string{"kfc", "daily-poem", "dog-diary", "moments"}
	catalog := make(map[string]CopywritingLibraryResult, len(kinds))
	for _, kind := range kinds {
		body, err := copywritingLibraryFiles.ReadFile("copywriting_library/" + kind + ".json")
		if err != nil {
			return nil, fmt.Errorf("读取站内内容库 %s 失败: %w", kind, err)
		}
		var library CopywritingLibraryResult
		if err := json.Unmarshal(body, &library); err != nil {
			return nil, fmt.Errorf("解析站内内容库 %s 失败: %w", kind, err)
		}
		catalog[kind] = library
	}
	return catalog, nil
}

// Library 返回指定工具的站内内容，不请求第三方，也不需要数据库或用户登录。
func (s *copywritingService) Library(kind string) (CopywritingLibraryResult, error) {
	if copywritingCatalogErr != nil {
		return CopywritingLibraryResult{}, copywritingCatalogErr
	}
	library, ok := copywritingCatalog[strings.TrimSpace(kind)]
	if !ok {
		return CopywritingLibraryResult{}, response.AssertArgumentError.Make("不支持的站内文案类型")
	}
	library.Items = append([]CopywritingLibraryEntry(nil), library.Items...)
	return library, nil
}

// libraryRandomText 保留已有随机接口的字段和切换语义，内容直接从站内库选取。
func (s *copywritingService) libraryRandomText(kind string) (CopywritingTextResult, error) {
	if copywritingCatalogErr != nil {
		return CopywritingTextResult{}, copywritingCatalogErr
	}
	items := copywritingCatalog[kind].Items
	if len(items) == 0 {
		return CopywritingTextResult{}, response.SystemError
	}
	item := items[rand.Intn(len(items))]
	return CopywritingTextResult{Text: item.Text, Source: "editorial", Title: item.Title, Author: item.Author, From: item.From}, nil
}

// libraryKFCTranslation 查找站内原句的配套英文，供仍在使用旧翻译入口的页面复用。
func libraryKFCTranslation(text string) string {
	for _, item := range copywritingCatalog["kfc"].Items {
		if item.Text == text {
			return item.English
		}
	}
	return ""
}
