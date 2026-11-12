package common

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
)

// TestNewsRSSSourceCachesValidatedFeed 验证同一来源复用有效结果，并过滤危险链接。
func TestNewsRSSSourceCachesValidatedFeed(t *testing.T) {
	var requests int32
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&requests, 1)
		_, _ = w.Write([]byte(`<rss><channel>
			<item><title>测试文章</title><link>https://example.com/article</link><pubDate>2026-11-12 10:00:00  +0800</pubDate><description><![CDATA[<p>摘要</p>]]></description></item>
			<item><title>错误链接</title><link>javascript:alert(1)</link></item>
		</channel></rss>`))
	}))
	defer server.Close()
	source := newsRSSSource{url: server.URL}

	for i := 0; i < 2; i++ {
		items, err := source.load(context.Background(), server.Client())
		if err != nil || len(items) != 1 {
			t.Fatalf("资讯结果异常: items=%+v err=%v", items, err)
		}
		if items[0].PublishedAt != "2026-11-12T10:00:00+08:00" || items[0].Description != "<p>摘要</p>" {
			t.Fatalf("发布时间或摘要丢失: %+v", items[0])
		}
	}
	if got := atomic.LoadInt32(&requests); got != 1 {
		t.Fatalf("缓存应只读取一次上游，实际 %d 次", got)
	}
}

// TestNewsRSSSourceRejectsHTML 验证上游 HTTP 200 网页按故障处理，而有效空 RSS 是空结果。
func TestNewsRSSSourceRejectsHTML(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("<html><title>来源已迁移</title></html>"))
	}))
	defer server.Close()
	source := newsRSSSource{url: server.URL}
	if _, err := source.load(context.Background(), server.Client()); err == nil {
		t.Fatal("HTTP 200 HTML 不应当作 RSS")
	}
	empty, err := parseRSSFeed([]byte("<rss><channel></channel></rss>"), 60, true)
	if err != nil || empty == nil || len(empty) != 0 {
		t.Fatalf("合法空 RSS 应返回空数组: %+v, %v", empty, err)
	}
}

// TestNewsRSSRejectsUnknownSource 验证外部输入只能选择登记的 ID，不能覆盖上游地址。
func TestNewsRSSRejectsUnknownSource(t *testing.T) {
	_, err := NewsRSS(context.Background(), "https://127.0.0.1/")
	if !errors.Is(err, ErrUnknownNewsRSSSource) {
		t.Fatalf("未知来源错误异常: %v", err)
	}
}
