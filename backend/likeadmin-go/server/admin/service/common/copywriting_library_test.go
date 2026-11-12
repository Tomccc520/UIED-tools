/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"context"
	"net/http"
	"strings"
	"testing"
	"time"
)

// TestCopywritingLibraryOffline 校验四个新旧入口及站内英文均不会访问第三方，随机结果保留旧接口字段。
func TestCopywritingLibraryOffline(t *testing.T) {
	service := &copywritingService{client: &http.Client{Transport: roundTripFunc(func(request *http.Request) (*http.Response, error) {
		t.Fatalf("站内文案不应发起网络请求: %s", request.URL)
		return nil, nil
	})}}
	ctx := context.Background()
	for _, kind := range []string{"kfc", "daily-poem", "dog-diary", "moments"} {
		t.Run(kind, func(t *testing.T) {
			catalog, err := service.Library(kind)
			if err != nil || len(catalog.Items) < 2 {
				t.Fatalf("站内库缺少可切换内容: count=%d err=%v", len(catalog.Items), err)
			}
			if _, err := time.Parse("2006-01-02", catalog.UpdatedAt); err != nil {
				t.Fatalf("更新日期不合法: %v", err)
			}
			byText, ids, topics := map[string]CopywritingLibraryEntry{}, map[string]bool{}, map[string]int{}
			for _, item := range catalog.Items {
				if item.ID == "" || strings.TrimSpace(item.Text) == "" || ids[item.ID] || byText[item.Text].ID != "" {
					t.Fatalf("存在空内容、重复 ID 或重复正文: %+v", item)
				}
				byText[item.Text], ids[item.ID] = item, true
				switch kind {
				case "daily-poem":
					if item.Title == "" || item.Author == "" || item.Dynasty == "" || item.From == "" || !strings.Contains(item.Text, "\n") {
						t.Fatalf("诗词必须保留分行、篇名、作者、朝代及出处: %+v", item)
					}
				case "kfc":
					translation, err := service.Translate(ctx, item.Text)
					if err != nil || item.English == "" || translation.Text != item.English {
						t.Fatalf("英文必须从同一条站内内容取得: id=%s err=%v", item.ID, err)
					}
				case "moments":
					if item.Topic == "" {
						t.Fatalf("朋友圈文案缺少场景: %s", item.ID)
					}
					topics[item.Topic]++
				}
			}
			for topic, count := range topics {
				if count < 2 {
					t.Fatalf("场景内缺少可切换内容: %s", topic)
				}
			}
			var result CopywritingTextResult
			if kind == "kfc" {
				result, err = service.KFC(ctx)
			} else {
				result, err = service.Random(ctx, kind)
			}
			entry := byText[result.Text]
			if err != nil || result.Source != "editorial" || entry.ID == "" || result.Title != entry.Title || result.Author != entry.Author || result.From != entry.From {
				t.Fatalf("旧接口没有返回站内正文及对应元数据: result=%+v err=%v", result, err)
			}
		})
	}
	if _, err := service.Library("yiyan"); err == nil {
		t.Fatal("非站内库类型应被拒绝")
	}
}
