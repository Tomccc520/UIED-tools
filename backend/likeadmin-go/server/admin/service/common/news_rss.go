package common

import (
	"context"
	"errors"
	"net/http"
	"sync"
	"time"

	servicedefaults "likeadmin/admin/service/defaults"
)

const newsRSSAccept = "application/rss+xml, application/atom+xml, application/xml, text/xml"

// ErrUnknownNewsRSSSource 表示该来源尚未接入公开资讯接口。
var ErrUnknownNewsRSSSource = errors.New("unknown news RSS source")

type newsRSSSource struct {
	url       string
	mu        sync.Mutex
	items     []homepageLearningFeedItem
	err       error
	expiresAt time.Time
}

var newsRSSSources = map[string]*newsRSSSource{
	"36kr":   {url: "https://www.36kr.com/feed"},
	"ithome": {url: "https://www.ithome.com/rss/"},
	"sspai":  {url: "https://sspai.com/feed"},
	"uied":   {url: servicedefaults.HomepageLearningDefaultRssURL},
	"qbitai": {url: "https://www.qbitai.com/feed"},
}

var newsRSSClient = &http.Client{
	Timeout: 6 * time.Second,
	// 使用已验证的最终 URL，防止上游重定向离开固定来源。
	CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
		return http.ErrUseLastResponse
	},
}

// NewsRSS 仅按预登记的来源读取 RSS，统一输出可展示的标题、日期和原文链接。
func NewsRSS(ctx context.Context, sourceID string) ([]homepageLearningFeedItem, error) {
	source := newsRSSSources[sourceID]
	if source == nil {
		return nil, ErrUnknownNewsRSSSource
	}
	return source.load(ctx, newsRSSClient)
}

// load 在来源内合并并发请求，成功数据缓存五分钟，故障短暂缓存以限制重试。
func (source *newsRSSSource) load(ctx context.Context, client *http.Client) ([]homepageLearningFeedItem, error) {
	source.mu.Lock()
	defer source.mu.Unlock()
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if time.Now().Before(source.expiresAt) {
		return source.items, source.err
	}

	body, err := fetchRSSSource(ctx, source.url, client, newsRSSAccept)
	var items []homepageLearningFeedItem
	if err == nil {
		items, err = parseRSSFeed(body, 60, true)
	}
	if ctx.Err() == nil {
		ttl := 5 * time.Minute
		if err != nil {
			ttl = 30 * time.Second
		}
		source.items, source.err, source.expiresAt = items, err, time.Now().Add(ttl)
	}
	return items, err
}
