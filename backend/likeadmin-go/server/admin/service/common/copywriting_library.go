/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	_ "embed"
	"encoding/json"
	"math/rand"
	"strings"

	"likeadmin/core/response"
)

//go:embed copywriting_library.json
var copywritingLibraryJSON []byte

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

type copywritingLibraryCatalog struct {
	UpdatedAt string                               `json:"updatedAt"`
	Entries   map[string][]CopywritingLibraryEntry `json:"entries"`
}

var copywritingCatalog, copywritingCatalogErr = loadCopywritingLibrary(copywritingLibraryJSON)

// loadCopywritingLibrary 解析随构建发布的同一份内容库，避免每次请求重复读取文件。
func loadCopywritingLibrary(body []byte) (copywritingLibraryCatalog, error) {
	var catalog copywritingLibraryCatalog
	err := json.Unmarshal(body, &catalog)
	return catalog, err
}

// Library 返回指定工具的站内内容，不请求第三方，也不需要数据库或用户登录。
func (s *copywritingService) Library(kind string) (CopywritingLibraryResult, error) {
	if copywritingCatalogErr != nil {
		return CopywritingLibraryResult{}, copywritingCatalogErr
	}
	items, ok := copywritingCatalog.Entries[strings.TrimSpace(kind)]
	if !ok {
		return CopywritingLibraryResult{}, response.AssertArgumentError.Make("不支持的站内文案类型")
	}
	return CopywritingLibraryResult{
		UpdatedAt: copywritingCatalog.UpdatedAt,
		Items:     append([]CopywritingLibraryEntry(nil), items...),
	}, nil
}

// libraryRandomText 保留已有随机接口的字段和切换语义，内容直接从站内库选取。
func (s *copywritingService) libraryRandomText(kind string) (CopywritingTextResult, error) {
	if copywritingCatalogErr != nil {
		return CopywritingTextResult{}, copywritingCatalogErr
	}
	items := copywritingCatalog.Entries[kind]
	if len(items) == 0 {
		return CopywritingTextResult{}, response.SystemError
	}
	item := items[rand.Intn(len(items))]
	return CopywritingTextResult{Text: item.Text, Source: "editorial", Title: item.Title, Author: item.Author, From: item.From}, nil
}

// libraryKFCTranslation 查找站内原句的配套英文，供仍在使用旧翻译入口的页面复用。
func libraryKFCTranslation(text string) string {
	for _, item := range copywritingCatalog.Entries["kfc"] {
		if item.Text == text {
			return item.English
		}
	}
	return ""
}
