package common

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import (
	"errors"
	"sort"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	"likeadmin/util"
)

const (
	toolRankingEventView     = "view"
	toolRankingEventStart    = "start"
	toolRankingEventSuccess  = "success"
	toolRankingEventDownload = "download"

	toolRankingPeriodDay   = "day"
	toolRankingPeriodWeek  = "week"
	toolRankingPeriodMonth = "month"
	toolRankingPeriodAll   = "all"

	toolRankingSortScore    = "score"
	toolRankingSortView     = "view"
	toolRankingSortStart    = "start"
	toolRankingSortSuccess  = "success"
	toolRankingSortDownload = "download"

	toolRankingCatalogCacheTTLSeconds = 5 * 60
	toolRankingDefaultLimit           = 10
	toolRankingMaxLimit               = 20
)

var toolRankingCatalogCache = struct {
	sync.RWMutex
	expiresAt int64
	items     []toolRankingCatalogItem
}{}

// IToolRankingService 函数说明：工具排行榜公共服务接口，负责埋点聚合写入与榜单读取。
type IToolRankingService interface {
	Track(trackReq req.CommonToolRankingTrackReq) (res map[string]interface{}, e error)
	List(listReq req.CommonToolRankingListReq) (res map[string]interface{}, e error)
}

// NewToolRankingService 函数说明：初始化工具排行榜服务。
func NewToolRankingService(db *gorm.DB) IToolRankingService {
	return &toolRankingService{db: db}
}

// toolRankingService 函数说明：工具排行榜服务实现，统一处理埋点聚合与榜单查询。
type toolRankingService struct {
	db *gorm.DB
}

// toolRankingDailyEntity 函数说明：映射 la_tool_ranking_daily 按日聚合表。
type toolRankingDailyEntity struct {
	ID            uint   `gorm:"column:id"`
	StatDate      string `gorm:"column:stat_date"`
	ToolKey       string `gorm:"column:tool_key"`
	ToolTitle     string `gorm:"column:tool_title"`
	ToolURL       string `gorm:"column:tool_url"`
	CateTitle     string `gorm:"column:cate_title"`
	ViewCount     int64  `gorm:"column:view_count"`
	StartCount    int64  `gorm:"column:start_count"`
	SuccessCount  int64  `gorm:"column:success_count"`
	DownloadCount int64  `gorm:"column:download_count"`
	CreateTime    int64  `gorm:"column:create_time"`
	UpdateTime    int64  `gorm:"column:update_time"`
}

// TableName 函数说明：声明工具排行榜按日聚合实体对应表名。
func (toolRankingDailyEntity) TableName() string {
	return "la_tool_ranking_daily"
}

// toolRankingCategoryConfig 函数说明：映射后台工具一级分类配置结构。
type toolRankingCategoryConfig struct {
	Title string                         `json:"title"`
	List  []toolRankingSubCategoryConfig `json:"list"`
}

// toolRankingSubCategoryConfig 函数说明：映射后台工具二级分类配置结构。
type toolRankingSubCategoryConfig struct {
	Title string                  `json:"title"`
	List  []toolRankingToolConfig `json:"list"`
}

// toolRankingToolConfig 函数说明：映射后台单个工具配置结构。
type toolRankingToolConfig struct {
	Title   string `json:"title"`
	URL     string `json:"url"`
	ToolKey string `json:"toolKey"`
	Cate    string `json:"cate"`
}

// toolRankingCatalogItem 函数说明：缓存标准化后的工具主数据，供埋点与榜单统一归因。
type toolRankingCatalogItem struct {
	ToolKey   string
	RoutePath string
	ToolTitle string
	ToolURL   string
	CateTitle string
}

// toolRankingMeta 函数说明：工具埋点写入前的标准化元信息。
type toolRankingMeta struct {
	ToolKey   string
	ToolTitle string
	ToolURL   string
	CateTitle string
}

// toolRankingListRow 函数说明：承接聚合查询结果，用于后续统一排序与响应映射。
type toolRankingListRow struct {
	ToolKey       string `gorm:"column:tool_key"`
	ToolTitle     string `gorm:"column:tool_title"`
	ToolURL       string `gorm:"column:tool_url"`
	CateTitle     string `gorm:"column:cate_title"`
	ViewCount     int64  `gorm:"column:view_count"`
	StartCount    int64  `gorm:"column:start_count"`
	SuccessCount  int64  `gorm:"column:success_count"`
	DownloadCount int64  `gorm:"column:download_count"`
}

// normalizeToolRankingText 函数说明：标准化文本，统一去除首尾空格。
func normalizeToolRankingText(value string) string {
	return strings.TrimSpace(value)
}

// normalizeToolRankingKey 函数说明：标准化 toolKey，统一转为小写，便于跨端稳定归因。
func normalizeToolRankingKey(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

// normalizeToolRankingRoutePath 函数说明：标准化工具路由，统一去除 query/hash 与尾斜杠。
func normalizeToolRankingRoutePath(value string) string {
	cleaned := strings.TrimSpace(value)
	if cleaned == "" {
		return ""
	}
	if index := strings.Index(cleaned, "?"); index >= 0 {
		cleaned = cleaned[:index]
	}
	if index := strings.Index(cleaned, "#"); index >= 0 {
		cleaned = cleaned[:index]
	}
	if cleaned == "/" {
		return cleaned
	}
	return strings.TrimRight(cleaned, "/")
}

// canonicalToolRankingRoutePath 函数说明：将工具内部子路由归并到主工具路由，避免内部模式单独进入榜单。
func canonicalToolRankingRoutePath(value string) string {
	normalizedPath := normalizeToolRankingRoutePath(value)
	switch normalizedPath {
	case "/tools/ai-perler/focus":
		return "/tools/ai-perler"
	default:
		return normalizedPath
	}
}

// canonicalToolRankingKey 函数说明：将历史子路由推导的 toolKey 归并到主工具键。
func canonicalToolRankingKey(value string) string {
	normalizedKey := normalizeToolRankingKey(value)
	switch normalizedKey {
	case "ai-perler-focus":
		return "ai-perler"
	default:
		return normalizedKey
	}
}

// deriveToolRankingKeyByPath 函数说明：当后台未显式配置 toolKey 时，按工具路由推导稳定 key。
func deriveToolRankingKeyByPath(routePath string) string {
	normalizedPath := strings.TrimPrefix(normalizeToolRankingRoutePath(routePath), "/tools/")
	normalizedPath = strings.Trim(normalizedPath, "/")
	replacer := strings.NewReplacer("/", "-", "_", "-")
	derivedKey := normalizeToolRankingKey(replacer.Replace(normalizedPath))
	if derivedKey == "" {
		return "tools-home"
	}
	return derivedKey
}

// isSupportedToolRankingEvent 函数说明：校验当前埋点事件类型是否在支持列表内。
func isSupportedToolRankingEvent(eventType string) bool {
	switch normalizeToolRankingText(eventType) {
	case toolRankingEventView, toolRankingEventStart, toolRankingEventSuccess, toolRankingEventDownload:
		return true
	default:
		return false
	}
}

// normalizeToolRankingPeriod 函数说明：标准化榜单周期，非法值统一回退为周榜。
func normalizeToolRankingPeriod(period string) string {
	switch strings.ToLower(strings.TrimSpace(period)) {
	case toolRankingPeriodDay, toolRankingPeriodWeek, toolRankingPeriodMonth, toolRankingPeriodAll:
		return strings.ToLower(strings.TrimSpace(period))
	default:
		return toolRankingPeriodWeek
	}
}

// normalizeToolRankingSortBy 函数说明：标准化排序字段，非法值统一回退为点击量排序。
func normalizeToolRankingSortBy(sortBy string) string {
	switch strings.ToLower(strings.TrimSpace(sortBy)) {
	case toolRankingSortScore, toolRankingSortView, toolRankingSortStart, toolRankingSortSuccess, toolRankingSortDownload:
		return strings.ToLower(strings.TrimSpace(sortBy))
	default:
		return toolRankingSortView
	}
}

// normalizeToolRankingLimit 函数说明：约束榜单数量，避免前台一次拉取过多结果。
func normalizeToolRankingLimit(limit int) int {
	if limit <= 0 {
		return toolRankingDefaultLimit
	}
	if limit > toolRankingMaxLimit {
		return toolRankingMaxLimit
	}
	return limit
}

// calculateToolRankingScore 函数说明：按统一权重计算榜单综合分，保证 success/download 权重大于 visit/start。
func calculateToolRankingScore(row toolRankingListRow) int64 {
	return row.ViewCount + row.StartCount*5 + row.SuccessCount*8 + row.DownloadCount*10
}

// loadToolRankingCatalogItems 函数说明：从网站配置解析工具分类树，输出标准化的工具目录缓存。
func (srv *toolRankingService) loadToolRankingCatalogItems() []toolRankingCatalogItem {
	websiteConfig, err := util.ConfigUtil.Get(srv.db, "website")
	if err != nil {
		return []toolRankingCatalogItem{}
	}
	rawCategoryTree := strings.TrimSpace(websiteConfig["toolsCategoryTree"])
	if rawCategoryTree == "" {
		return []toolRankingCatalogItem{}
	}

	var categoryList []toolRankingCategoryConfig
	if err = util.ToolsUtil.JsonToObj(rawCategoryTree, &categoryList); err != nil {
		return []toolRankingCatalogItem{}
	}

	items := make([]toolRankingCatalogItem, 0)
	for _, category := range categoryList {
		for _, subCategory := range category.List {
			for _, tool := range subCategory.List {
				routePath := normalizeToolRankingRoutePath(tool.URL)
				if !strings.HasPrefix(routePath, "/tools/") {
					continue
				}
				toolKey := normalizeToolRankingKey(tool.ToolKey)
				if toolKey == "" {
					toolKey = deriveToolRankingKeyByPath(routePath)
				}
				cateTitle := normalizeToolRankingText(tool.Cate)
				if cateTitle == "" {
					cateTitle = normalizeToolRankingText(subCategory.Title)
				}
				if cateTitle == "" {
					cateTitle = normalizeToolRankingText(category.Title)
				}
				items = append(items, toolRankingCatalogItem{
					ToolKey:   toolKey,
					RoutePath: routePath,
					ToolTitle: normalizeToolRankingText(tool.Title),
					ToolURL:   routePath,
					CateTitle: cateTitle,
				})
			}
		}
	}
	return items
}

// getToolRankingCatalogItems 函数说明：读取工具目录缓存，减少高频埋点时反复解析网站配置。
func (srv *toolRankingService) getToolRankingCatalogItems() []toolRankingCatalogItem {
	now := time.Now().Unix()
	toolRankingCatalogCache.RLock()
	if toolRankingCatalogCache.expiresAt > now && len(toolRankingCatalogCache.items) > 0 {
		cached := append([]toolRankingCatalogItem(nil), toolRankingCatalogCache.items...)
		toolRankingCatalogCache.RUnlock()
		return cached
	}
	toolRankingCatalogCache.RUnlock()

	toolRankingCatalogCache.Lock()
	defer toolRankingCatalogCache.Unlock()
	if toolRankingCatalogCache.expiresAt > now && len(toolRankingCatalogCache.items) > 0 {
		return append([]toolRankingCatalogItem(nil), toolRankingCatalogCache.items...)
	}

	items := srv.loadToolRankingCatalogItems()
	toolRankingCatalogCache.items = items
	toolRankingCatalogCache.expiresAt = now + toolRankingCatalogCacheTTLSeconds
	return append([]toolRankingCatalogItem(nil), items...)
}

// resolveToolRankingMeta 函数说明：按 toolKey/路由从工具目录中解析元信息，主数据可用时拒绝未知工具。
func (srv *toolRankingService) resolveToolRankingMeta(trackReq req.CommonToolRankingTrackReq) toolRankingMeta {
	normalizedToolKey := canonicalToolRankingKey(trackReq.ToolKey)
	normalizedRoutePath := canonicalToolRankingRoutePath(trackReq.RoutePath)
	catalogItems := srv.getToolRankingCatalogItems()

	for _, item := range catalogItems {
		if normalizedToolKey != "" && item.ToolKey == normalizedToolKey {
			return toolRankingMeta{
				ToolKey:   item.ToolKey,
				ToolTitle: item.ToolTitle,
				ToolURL:   item.ToolURL,
				CateTitle: item.CateTitle,
			}
		}
	}
	for _, item := range catalogItems {
		if normalizedRoutePath != "" && item.RoutePath == normalizedRoutePath {
			return toolRankingMeta{
				ToolKey:   item.ToolKey,
				ToolTitle: item.ToolTitle,
				ToolURL:   item.ToolURL,
				CateTitle: item.CateTitle,
			}
		}
	}
	if len(catalogItems) > 0 {
		return toolRankingMeta{}
	}

	if normalizedToolKey == "" {
		normalizedToolKey = deriveToolRankingKeyByPath(normalizedRoutePath)
	}
	toolTitle := normalizeToolRankingText(trackReq.ToolTitle)
	if toolTitle == "" {
		toolTitle = normalizedToolKey
	}
	toolURL := normalizedRoutePath
	if toolURL == "" {
		toolURL = normalizeToolRankingRoutePath(trackReq.ToolURL)
	}
	cateTitle := normalizeToolRankingText(trackReq.CateTitle)
	return toolRankingMeta{
		ToolKey:   normalizedToolKey,
		ToolTitle: toolTitle,
		ToolURL:   toolURL,
		CateTitle: cateTitle,
	}
}

// findToolRankingCatalogItem 函数说明：按标准键或路由查找工具主数据，支持历史子路由别名。
func findToolRankingCatalogItem(items []toolRankingCatalogItem, toolKey string, toolURL string) (toolRankingCatalogItem, bool) {
	normalizedKey := canonicalToolRankingKey(toolKey)
	normalizedURL := canonicalToolRankingRoutePath(toolURL)
	for _, item := range items {
		if normalizedKey != "" && item.ToolKey == normalizedKey {
			return item, true
		}
	}
	for _, item := range items {
		if normalizedURL != "" && item.RoutePath == normalizedURL {
			return item, true
		}
	}
	return toolRankingCatalogItem{}, false
}

// reconcileToolRankingListRows 函数说明：用当前工具主数据清理榜单历史脏值，并合并同一工具的子路由统计。
func reconcileToolRankingListRows(rowList []toolRankingListRow, catalogItems []toolRankingCatalogItem) []toolRankingListRow {
	if len(catalogItems) == 0 {
		return rowList
	}
	mergedRows := make(map[string]*toolRankingListRow)
	for _, row := range rowList {
		catalogItem, matched := findToolRankingCatalogItem(catalogItems, row.ToolKey, row.ToolURL)
		if !matched {
			continue
		}
		mergedRow, exists := mergedRows[catalogItem.ToolKey]
		if !exists {
			mergedRow = &toolRankingListRow{
				ToolKey:   catalogItem.ToolKey,
				ToolTitle: catalogItem.ToolTitle,
				ToolURL:   catalogItem.ToolURL,
				CateTitle: catalogItem.CateTitle,
			}
			mergedRows[catalogItem.ToolKey] = mergedRow
		}
		mergedRow.ViewCount += row.ViewCount
		mergedRow.StartCount += row.StartCount
		mergedRow.SuccessCount += row.SuccessCount
		mergedRow.DownloadCount += row.DownloadCount
	}

	reconciledRows := make([]toolRankingListRow, 0, len(mergedRows))
	for _, row := range mergedRows {
		reconciledRows = append(reconciledRows, *row)
	}
	return reconciledRows
}

// resolveToolRankingDateRange 函数说明：按榜单周期生成聚合时间窗口；总榜返回空范围表示不过滤日期。
func resolveToolRankingDateRange(period string) (startDate string, endDate string) {
	now := time.Now()
	endDate = now.Format("2006-01-02")
	switch period {
	case toolRankingPeriodDay:
		startDate = endDate
	case toolRankingPeriodWeek:
		startDate = now.AddDate(0, 0, -6).Format("2006-01-02")
	case toolRankingPeriodMonth:
		startDate = now.AddDate(0, 0, -29).Format("2006-01-02")
	default:
		startDate = ""
		endDate = ""
	}
	return
}

// buildToolRankingSortedList 函数说明：按指定字段对聚合结果排序，并补齐综合分与名次。
func buildToolRankingSortedList(rowList []toolRankingListRow, sortBy string, limit int) []map[string]interface{} {
	sort.SliceStable(rowList, func(i, j int) bool {
		leftRow := rowList[i]
		rightRow := rowList[j]
		leftScore := calculateToolRankingScore(leftRow)
		rightScore := calculateToolRankingScore(rightRow)

		switch sortBy {
		case toolRankingSortView:
			if leftRow.ViewCount != rightRow.ViewCount {
				return leftRow.ViewCount > rightRow.ViewCount
			}
		case toolRankingSortStart:
			if leftRow.StartCount != rightRow.StartCount {
				return leftRow.StartCount > rightRow.StartCount
			}
		case toolRankingSortSuccess:
			if leftRow.SuccessCount != rightRow.SuccessCount {
				return leftRow.SuccessCount > rightRow.SuccessCount
			}
		case toolRankingSortDownload:
			if leftRow.DownloadCount != rightRow.DownloadCount {
				return leftRow.DownloadCount > rightRow.DownloadCount
			}
		default:
			if leftScore != rightScore {
				return leftScore > rightScore
			}
		}

		if leftScore != rightScore {
			return leftScore > rightScore
		}
		if leftRow.SuccessCount != rightRow.SuccessCount {
			return leftRow.SuccessCount > rightRow.SuccessCount
		}
		if leftRow.StartCount != rightRow.StartCount {
			return leftRow.StartCount > rightRow.StartCount
		}
		if leftRow.ViewCount != rightRow.ViewCount {
			return leftRow.ViewCount > rightRow.ViewCount
		}
		return leftRow.ToolKey < rightRow.ToolKey
	})

	if len(rowList) > limit {
		rowList = rowList[:limit]
	}

	result := make([]map[string]interface{}, 0, len(rowList))
	for index, row := range rowList {
		result = append(result, map[string]interface{}{
			"rank":          index + 1,
			"toolKey":       row.ToolKey,
			"toolTitle":     row.ToolTitle,
			"toolUrl":       row.ToolURL,
			"cateTitle":     row.CateTitle,
			"viewCount":     row.ViewCount,
			"startCount":    row.StartCount,
			"successCount":  row.SuccessCount,
			"downloadCount": row.DownloadCount,
			"score":         calculateToolRankingScore(row),
		})
	}
	return result
}

// Track 函数说明：记录工具事件到按日聚合表，支持 visit/start/success/download 四种埋点。
func (srv *toolRankingService) Track(trackReq req.CommonToolRankingTrackReq) (res map[string]interface{}, e error) {
	eventType := normalizeToolRankingText(trackReq.EventType)
	if !isSupportedToolRankingEvent(eventType) {
		return nil, errors.New("工具排行榜事件类型不支持")
	}

	meta := srv.resolveToolRankingMeta(trackReq)
	if meta.ToolKey == "" {
		return map[string]interface{}{
			"recorded": false,
			"ignored":  true,
		}, nil
	}

	statDate := time.Now().Format("2006-01-02")
	nowUnix := time.Now().Unix()
	var viewCount, startCount, successCount, downloadCount int64
	switch eventType {
	case toolRankingEventView:
		viewCount = 1
	case toolRankingEventStart:
		startCount = 1
	case toolRankingEventSuccess:
		successCount = 1
	case toolRankingEventDownload:
		downloadCount = 1
	}

	result := srv.db.Exec(`
INSERT INTO la_tool_ranking_daily (
  stat_date, tool_key, tool_title, tool_url, cate_title,
  view_count, start_count, success_count, download_count,
  create_time, update_time
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  tool_title = IF(VALUES(tool_title) <> '', VALUES(tool_title), tool_title),
  tool_url = IF(VALUES(tool_url) <> '', VALUES(tool_url), tool_url),
  cate_title = IF(VALUES(cate_title) <> '', VALUES(cate_title), cate_title),
  view_count = view_count + VALUES(view_count),
  start_count = start_count + VALUES(start_count),
  success_count = success_count + VALUES(success_count),
  download_count = download_count + VALUES(download_count),
  update_time = VALUES(update_time)
`, statDate, meta.ToolKey, meta.ToolTitle, meta.ToolURL, meta.CateTitle, viewCount, startCount, successCount, downloadCount, nowUnix, nowUnix)
	if result.Error != nil {
		return nil, result.Error
	}

	return map[string]interface{}{
		"recorded":  true,
		"toolKey":   meta.ToolKey,
		"eventType": eventType,
		"statDate":  statDate,
		"toolTitle": meta.ToolTitle,
	}, nil
}

// List 函数说明：读取工具排行榜聚合结果，支持日/周/月/总榜与多排序方式。
func (srv *toolRankingService) List(listReq req.CommonToolRankingListReq) (res map[string]interface{}, e error) {
	period := normalizeToolRankingPeriod(listReq.Period)
	sortBy := normalizeToolRankingSortBy(listReq.SortBy)
	limit := normalizeToolRankingLimit(listReq.Limit)
	startDate, endDate := resolveToolRankingDateRange(period)

	querySQL := `
SELECT
  tool_key,
  MAX(tool_title) AS tool_title,
  MAX(tool_url) AS tool_url,
  MAX(cate_title) AS cate_title,
  SUM(view_count) AS view_count,
  SUM(start_count) AS start_count,
  SUM(success_count) AS success_count,
  SUM(download_count) AS download_count
FROM la_tool_ranking_daily
WHERE tool_key <> ''`
	queryArgs := make([]interface{}, 0)
	if startDate != "" && endDate != "" {
		querySQL += ` AND stat_date >= ? AND stat_date <= ?`
		queryArgs = append(queryArgs, startDate, endDate)
	}
	querySQL += ` GROUP BY tool_key`

	rowList := make([]toolRankingListRow, 0)
	if err := srv.db.Raw(querySQL, queryArgs...).Scan(&rowList).Error; err != nil {
		return nil, err
	}
	rowList = reconcileToolRankingListRows(rowList, srv.getToolRankingCatalogItems())

	return map[string]interface{}{
		"period":    period,
		"sortBy":    sortBy,
		"limit":     limit,
		"startDate": startDate,
		"endDate":   endDate,
		"list":      buildToolRankingSortedList(rowList, sortBy, limit),
		"updatedAt": time.Now().Unix(),
	}, nil
}
