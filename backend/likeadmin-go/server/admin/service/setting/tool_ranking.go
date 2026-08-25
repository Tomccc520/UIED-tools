package setting

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"

	"likeadmin/admin/schemas/req"
	corerequest "likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	toolRankingConfigType                = "website"
	toolRankingEnabledConfigName         = "toolsToolRankingEnabled"
	toolRankingPageTitleConfigName       = "toolsToolRankingPageTitle"
	toolRankingPageDescriptionConfigName = "toolsToolRankingPageDescription"
	toolRankingDefaultPeriodConfigName   = "toolsToolRankingDefaultPeriod"
	toolRankingPageLimitConfigName       = "toolsToolRankingPageLimit"
	toolRankingShowOnSidebarConfigName   = "toolsToolRankingShowOnSidebar"
	toolRankingSidebarTitleConfigName    = "toolsToolRankingSidebarTitle"
	toolRankingSidebarPeriodConfigName   = "toolsToolRankingSidebarPeriod"
	toolRankingPeriodDay                 = "day"
	toolRankingPeriodWeek                = "week"
	toolRankingPeriodMonth               = "month"
	toolRankingPeriodAll                 = "all"
	toolRankingSortScore                 = "score"
	toolRankingSortView                  = "view"
	toolRankingSortStart                 = "start"
	toolRankingSortSuccess               = "success"
	toolRankingSortDownload              = "download"
	toolRankingDefaultEnabledValue       = "1"
	toolRankingDefaultPageTitleValue     = "站内工具使用排行榜"
	toolRankingDefaultPageDescValue      = "按站内真实点击量排行，帮助运营快速判断哪些工具最受欢迎。"
	toolRankingDefaultPeriodValue        = toolRankingPeriodWeek
	toolRankingDefaultPageLimitValue     = "12"
	toolRankingDefaultShowOnSidebarValue = "1"
	toolRankingDefaultSidebarTitleValue  = "本周热榜"
	toolRankingDefaultSidebarPeriodValue = toolRankingPeriodWeek
	toolRankingDefaultPageSize           = 20
	toolRankingMaxPageSize               = 100
)

// ISettingToolRankingService 函数说明：统一定义后台工具热榜管理页与榜单配置页所需接口。
type ISettingToolRankingService interface {
	List(page corerequest.PageReq, listReq req.SettingToolRankingListReq) (res response.PageResp, e error)
	Summary() (res map[string]interface{}, e error)
	Trend(listReq req.SettingToolRankingListReq) (res map[string]interface{}, e error)
	Export(listReq req.SettingToolRankingListReq) (res map[string]interface{}, e error)
	ConfigDetail() (res map[string]interface{}, e error)
	ConfigSave(saveReq req.SettingToolRankingConfigSaveReq) (e error)
}

// NewSettingToolRankingService 函数说明：初始化后台工具热榜管理服务。
func NewSettingToolRankingService(db *gorm.DB) ISettingToolRankingService {
	return &settingToolRankingService{db: db}
}

// settingToolRankingService 函数说明：后台工具热榜管理服务实现。
type settingToolRankingService struct {
	db *gorm.DB
}

// settingToolRankingRow 函数说明：承接热榜聚合查询结果，供后台管理页排序与分页使用。
type settingToolRankingRow struct {
	ToolKey       string `gorm:"column:tool_key"`
	ToolTitle     string `gorm:"column:tool_title"`
	ToolURL       string `gorm:"column:tool_url"`
	CateTitle     string `gorm:"column:cate_title"`
	ViewCount     int64  `gorm:"column:view_count"`
	StartCount    int64  `gorm:"column:start_count"`
	SuccessCount  int64  `gorm:"column:success_count"`
	DownloadCount int64  `gorm:"column:download_count"`
}

// settingToolRankingSummaryRow 函数说明：承接热榜统计卡聚合结果，避免页面重复拼接 SQL。
type settingToolRankingSummaryRow struct {
	ToolCount     int64 `gorm:"column:tool_count"`
	CateCount     int64 `gorm:"column:cate_count"`
	ViewCount     int64 `gorm:"column:view_count"`
	StartCount    int64 `gorm:"column:start_count"`
	SuccessCount  int64 `gorm:"column:success_count"`
	DownloadCount int64 `gorm:"column:download_count"`
}

// settingToolRankingTrendRow 函数说明：承接热榜趋势按日聚合结果，供后台图表直接消费。
type settingToolRankingTrendRow struct {
	StatDate      string `gorm:"column:stat_date"`
	ViewCount     int64  `gorm:"column:view_count"`
	StartCount    int64  `gorm:"column:start_count"`
	SuccessCount  int64  `gorm:"column:success_count"`
	DownloadCount int64  `gorm:"column:download_count"`
}

// normalizeToolRankingStatDate 函数说明：标准化趋势日期字符串，兼容数据库返回完整时间戳与纯日期两种格式。
func normalizeToolRankingStatDate(value string) string {
	dateText := strings.TrimSpace(value)
	if dateText == "" {
		return ""
	}
	if len(dateText) >= 10 {
		if _, err := time.Parse("2006-01-02", dateText[:10]); err == nil {
			return dateText[:10]
		}
	}
	parsedTimeLayouts := []string{
		time.RFC3339,
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05",
	}
	for _, layout := range parsedTimeLayouts {
		if parsedTime, err := time.Parse(layout, dateText); err == nil {
			return parsedTime.Format("2006-01-02")
		}
	}
	return dateText
}

// normalizeToolRankingPeriod 函数说明：标准化热榜周期，非法值统一回退为周榜。
func normalizeToolRankingPeriod(period string) string {
	switch strings.ToLower(strings.TrimSpace(period)) {
	case toolRankingPeriodDay, toolRankingPeriodWeek, toolRankingPeriodMonth, toolRankingPeriodAll:
		return strings.ToLower(strings.TrimSpace(period))
	default:
		return toolRankingDefaultPeriodValue
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

// normalizeToolRankingPageSize 函数说明：统一约束后台热榜管理页分页大小，避免一次读取过多聚合数据。
func normalizeToolRankingPageSize(pageSize int) int {
	if pageSize <= 0 {
		return toolRankingDefaultPageSize
	}
	if pageSize > toolRankingMaxPageSize {
		return toolRankingMaxPageSize
	}
	return pageSize
}

// normalizeToolRankingScore 函数说明：按统一权重计算综合热度分，保证下载/成功权重大于浏览。
func normalizeToolRankingScore(row settingToolRankingRow) int64 {
	return row.ViewCount + row.StartCount*5 + row.SuccessCount*8 + row.DownloadCount*10
}

// normalizeToolRankingDailyScore 函数说明：按日计算综合分，供趋势图补充综合热度走势。
func normalizeToolRankingDailyScore(row settingToolRankingTrendRow) int64 {
	return row.ViewCount + row.StartCount*5 + row.SuccessCount*8 + row.DownloadCount*10
}

// resolveToolRankingDateRange 函数说明：按周期生成热榜统计窗口；总榜返回空区间表示不过滤日期。
func resolveToolRankingDateRange(period string) (startDate string, endDate string) {
	now := time.Now()
	switch normalizeToolRankingPeriod(period) {
	case toolRankingPeriodDay:
		dateText := now.Format("2006-01-02")
		return dateText, dateText
	case toolRankingPeriodWeek:
		return now.AddDate(0, 0, -6).Format("2006-01-02"), now.Format("2006-01-02")
	case toolRankingPeriodMonth:
		return now.AddDate(0, 0, -29).Format("2006-01-02"), now.Format("2006-01-02")
	default:
		return "", ""
	}
}

// buildToolRankingListChain 函数说明：构建热榜聚合查询链路，统一复用列表、导出和趋势筛选条件。
func (srv settingToolRankingService) buildToolRankingListChain(listReq req.SettingToolRankingListReq) (*gorm.DB, string, string, string, string) {
	period := normalizeToolRankingPeriod(listReq.Period)
	sortBy := normalizeToolRankingSortBy(listReq.SortBy)
	keyword := strings.TrimSpace(listReq.Keyword)
	cateTitle := strings.TrimSpace(listReq.CateTitle)
	startDate, endDate := resolveToolRankingDateRange(period)

	chain := srv.db.Table("la_tool_ranking_daily")
	if startDate != "" && endDate != "" {
		chain = chain.Where("stat_date >= ? AND stat_date <= ?", startDate, endDate)
	}
	if keyword != "" {
		likeKeyword := "%" + keyword + "%"
		chain = chain.Where("tool_title LIKE ? OR tool_key LIKE ? OR tool_url LIKE ?", likeKeyword, likeKeyword, likeKeyword)
	}
	if cateTitle != "" {
		chain = chain.Where("cate_title LIKE ?", "%"+cateTitle+"%")
	}
	return chain, period, sortBy, startDate, endDate
}

// queryToolRankingRows 函数说明：统一读取筛选后的热榜聚合结果，并在内存中完成稳定排序。
func (srv settingToolRankingService) queryToolRankingRows(listReq req.SettingToolRankingListReq) (rows []settingToolRankingRow, period string, sortBy string, startDate string, endDate string, e error) {
	chain, normalizedPeriod, normalizedSortBy, resolvedStartDate, resolvedEndDate := srv.buildToolRankingListChain(listReq)
	query := chain.Select(`
			tool_key,
			MAX(tool_title) AS tool_title,
			MAX(tool_url) AS tool_url,
			MAX(cate_title) AS cate_title,
			SUM(view_count) AS view_count,
			SUM(start_count) AS start_count,
			SUM(success_count) AS success_count,
			SUM(download_count) AS download_count
		`).
		Group("tool_key")

	rowList := make([]settingToolRankingRow, 0)
	if err := query.Find(&rowList).Error; err != nil {
		return nil, normalizedPeriod, normalizedSortBy, resolvedStartDate, resolvedEndDate, response.CheckErr(err, "ToolRanking QueryRows Find err")
	}

	sort.SliceStable(rowList, func(leftIndex, rightIndex int) bool {
		leftRow := rowList[leftIndex]
		rightRow := rowList[rightIndex]
		leftScore := normalizeToolRankingScore(leftRow)
		rightScore := normalizeToolRankingScore(rightRow)
		switch normalizedSortBy {
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
		if leftRow.ViewCount != rightRow.ViewCount {
			return leftRow.ViewCount > rightRow.ViewCount
		}
		return leftRow.ToolKey < rightRow.ToolKey
	})

	return rowList, normalizedPeriod, normalizedSortBy, resolvedStartDate, resolvedEndDate, nil
}

// buildToolRankingTrendAxis 函数说明：按周期生成趋势坐标，周/月补齐缺失日期，总榜按真实数据日期输出。
func buildToolRankingTrendAxis(period string, startDate string, endDate string, rowList []settingToolRankingTrendRow) []string {
	if startDate != "" && endDate != "" {
		startTime, startErr := time.Parse("2006-01-02", startDate)
		endTime, endErr := time.Parse("2006-01-02", endDate)
		if startErr == nil && endErr == nil && !endTime.Before(startTime) {
			labels := make([]string, 0)
			for current := startTime; !current.After(endTime); current = current.AddDate(0, 0, 1) {
				labels = append(labels, current.Format("2006-01-02"))
			}
			return labels
		}
	}

	labels := make([]string, 0, len(rowList))
	for _, item := range rowList {
		normalizedStatDate := normalizeToolRankingStatDate(item.StatDate)
		if normalizedStatDate == "" {
			continue
		}
		labels = append(labels, normalizedStatDate)
	}
	sort.Strings(labels)
	return labels
}

// getToolRankingConfigValue 函数说明：读取工具热榜配置值，未配置时回退默认值。
func (srv settingToolRankingService) getToolRankingConfigValue(configs map[string]string, key string, defaultValue string) string {
	value := strings.TrimSpace(configs[key])
	if value == "" {
		return defaultValue
	}
	return value
}

// List 函数说明：读取后台工具热榜管理列表，支持关键词、分类、周期、排序与分页。
func (srv settingToolRankingService) List(page corerequest.PageReq, listReq req.SettingToolRankingListReq) (res response.PageResp, e error) {
	pageNo := page.PageNo
	if pageNo <= 0 {
		pageNo = 1
	}
	pageSize := normalizeToolRankingPageSize(page.PageSize)
	rowList, _, _, _, _, err := srv.queryToolRankingRows(listReq)
	if err != nil {
		return response.PageResp{}, err
	}

	count := int64(len(rowList))
	offset := pageSize * (pageNo - 1)
	if offset > len(rowList) {
		offset = len(rowList)
	}
	end := offset + pageSize
	if end > len(rowList) {
		end = len(rowList)
	}
	slicedRows := rowList[offset:end]
	lists := make([]map[string]interface{}, 0, len(slicedRows))
	for index, item := range slicedRows {
		lists = append(lists, map[string]interface{}{
			"rank":          offset + index + 1,
			"toolKey":       item.ToolKey,
			"toolTitle":     item.ToolTitle,
			"toolUrl":       item.ToolURL,
			"cateTitle":     item.CateTitle,
			"viewCount":     item.ViewCount,
			"startCount":    item.StartCount,
			"successCount":  item.SuccessCount,
			"downloadCount": item.DownloadCount,
			"score":         normalizeToolRankingScore(item),
		})
	}

	return response.PageResp{
		Count:    count,
		PageNo:   pageNo,
		PageSize: pageSize,
		Lists:    lists,
	}, nil
}

// Summary 函数说明：返回后台工具热榜管理页顶部概览统计与当前热榜冠军信息。
func (srv settingToolRankingService) Summary() (res map[string]interface{}, e error) {
	weekStartDate, weekEndDate := resolveToolRankingDateRange(toolRankingPeriodWeek)

	var summaryRow settingToolRankingSummaryRow
	if err := srv.db.Table("la_tool_ranking_daily").
		Select(`
				COUNT(DISTINCT tool_key) AS tool_count,
				COUNT(DISTINCT NULLIF(cate_title, '')) AS cate_count,
				COALESCE(SUM(view_count), 0) AS view_count,
				COALESCE(SUM(start_count), 0) AS start_count,
				COALESCE(SUM(success_count), 0) AS success_count,
				COALESCE(SUM(download_count), 0) AS download_count
			`).
		Where("stat_date >= ? AND stat_date <= ?", weekStartDate, weekEndDate).
		Scan(&summaryRow).Error; err != nil {
		return nil, response.CheckErr(err, "ToolRanking Summary Scan err")
	}

	championPage, err := srv.List(corerequest.PageReq{PageNo: 1, PageSize: 1}, req.SettingToolRankingListReq{
		Period: toolRankingPeriodWeek,
		SortBy: toolRankingSortView,
	})
	if err != nil {
		return nil, err
	}
	champion := map[string]interface{}{}
	if championList, ok := championPage.Lists.([]map[string]interface{}); ok && len(championList) > 0 {
		champion = championList[0]
	}

	return map[string]interface{}{
		"period":        toolRankingPeriodWeek,
		"toolCount":     summaryRow.ToolCount,
		"cateCount":     summaryRow.CateCount,
		"viewCount":     summaryRow.ViewCount,
		"startCount":    summaryRow.StartCount,
		"successCount":  summaryRow.SuccessCount,
		"downloadCount": summaryRow.DownloadCount,
		"champion":      champion,
		"updatedAt":     time.Now().Unix(),
	}, nil
}

// Trend 函数说明：返回后台热榜管理页趋势图数据，支持随周期与筛选条件同步变化。
func (srv settingToolRankingService) Trend(listReq req.SettingToolRankingListReq) (res map[string]interface{}, e error) {
	chain, period, sortBy, startDate, endDate := srv.buildToolRankingListChain(listReq)
	rowList := make([]settingToolRankingTrendRow, 0)
	if err := chain.Select(`
			stat_date,
			SUM(view_count) AS view_count,
			SUM(start_count) AS start_count,
			SUM(success_count) AS success_count,
			SUM(download_count) AS download_count
		`).
		Group("stat_date").
		Order("stat_date ASC").
		Find(&rowList).Error; err != nil {
		return nil, response.CheckErr(err, "ToolRanking Trend Find err")
	}

	axis := buildToolRankingTrendAxis(period, startDate, endDate, rowList)
	trendMap := make(map[string]settingToolRankingTrendRow, len(rowList))
	for _, item := range rowList {
		normalizedStatDate := normalizeToolRankingStatDate(item.StatDate)
		if normalizedStatDate == "" {
			continue
		}
		item.StatDate = normalizedStatDate
		trendMap[normalizedStatDate] = item
	}

	viewSeries := make([]int64, 0, len(axis))
	startSeries := make([]int64, 0, len(axis))
	successSeries := make([]int64, 0, len(axis))
	downloadSeries := make([]int64, 0, len(axis))
	scoreSeries := make([]int64, 0, len(axis))
	for _, label := range axis {
		currentRow := trendMap[label]
		viewSeries = append(viewSeries, currentRow.ViewCount)
		startSeries = append(startSeries, currentRow.StartCount)
		successSeries = append(successSeries, currentRow.SuccessCount)
		downloadSeries = append(downloadSeries, currentRow.DownloadCount)
		scoreSeries = append(scoreSeries, normalizeToolRankingDailyScore(currentRow))
	}

	return map[string]interface{}{
		"period":         period,
		"sortBy":         sortBy,
		"startDate":      startDate,
		"endDate":        endDate,
		"labels":         axis,
		"viewSeries":     viewSeries,
		"startSeries":    startSeries,
		"successSeries":  successSeries,
		"downloadSeries": downloadSeries,
		"scoreSeries":    scoreSeries,
	}, nil
}

// Export 函数说明：导出当前筛选条件下的热榜结果，供后台管理页生成 CSV 文件。
func (srv settingToolRankingService) Export(listReq req.SettingToolRankingListReq) (res map[string]interface{}, e error) {
	rowList, period, sortBy, _, _, err := srv.queryToolRankingRows(listReq)
	if err != nil {
		return nil, err
	}

	exportList := make([]map[string]interface{}, 0, len(rowList))
	for index, item := range rowList {
		exportList = append(exportList, map[string]interface{}{
			"rank":          index + 1,
			"toolKey":       item.ToolKey,
			"toolTitle":     item.ToolTitle,
			"toolUrl":       item.ToolURL,
			"cateTitle":     item.CateTitle,
			"viewCount":     item.ViewCount,
			"startCount":    item.StartCount,
			"successCount":  item.SuccessCount,
			"downloadCount": item.DownloadCount,
			"score":         normalizeToolRankingScore(item),
		})
	}

	fileName := fmt.Sprintf("tool-ranking-%s-%s-%s.csv", period, sortBy, time.Now().Format("20060102_150405"))
	return map[string]interface{}{
		"fileName":   fileName,
		"period":     period,
		"sortBy":     sortBy,
		"exportedAt": time.Now().Unix(),
		"list":       exportList,
	}, nil
}

// ConfigDetail 函数说明：读取工具热榜榜单配置，供后台榜单配置页使用。
func (srv settingToolRankingService) ConfigDetail() (res map[string]interface{}, e error) {
	configs, err := util.ConfigUtil.Get(srv.db, toolRankingConfigType)
	if e = response.CheckErr(err, "ToolRanking ConfigDetail Get err"); e != nil {
		return
	}

	pageLimitRaw, _ := strconv.Atoi(srv.getToolRankingConfigValue(configs, toolRankingPageLimitConfigName, toolRankingDefaultPageLimitValue))
	if pageLimitRaw <= 0 {
		pageLimitRaw = 12
	}
	return map[string]interface{}{
		"enabled": func() int {
			value, _ := strconv.Atoi(srv.getToolRankingConfigValue(configs, toolRankingEnabledConfigName, toolRankingDefaultEnabledValue))
			return value
		}(),
		"pageTitle":       srv.getToolRankingConfigValue(configs, toolRankingPageTitleConfigName, toolRankingDefaultPageTitleValue),
		"pageDescription": srv.getToolRankingConfigValue(configs, toolRankingPageDescriptionConfigName, toolRankingDefaultPageDescValue),
		"defaultPeriod":   normalizeToolRankingPeriod(srv.getToolRankingConfigValue(configs, toolRankingDefaultPeriodConfigName, toolRankingDefaultPeriodValue)),
		"pageLimit":       pageLimitRaw,
		"showOnSidebar": func() int {
			value, _ := strconv.Atoi(srv.getToolRankingConfigValue(configs, toolRankingShowOnSidebarConfigName, toolRankingDefaultShowOnSidebarValue))
			return value
		}(),
		"sidebarTitle":  srv.getToolRankingConfigValue(configs, toolRankingSidebarTitleConfigName, toolRankingDefaultSidebarTitleValue),
		"sidebarPeriod": normalizeToolRankingPeriod(srv.getToolRankingConfigValue(configs, toolRankingSidebarPeriodConfigName, toolRankingDefaultSidebarPeriodValue)),
	}, nil
}

// ConfigSave 函数说明：保存工具热榜榜单配置，统一写入 website 配置中心供前台和后台共用。
func (srv settingToolRankingService) ConfigSave(saveReq req.SettingToolRankingConfigSaveReq) (e error) {
	pageLimit := saveReq.PageLimit
	if pageLimit <= 0 {
		pageLimit = 12
	}

	err := srv.db.Transaction(func(tx *gorm.DB) error {
		setConfig := func(name string, value string, errMsg string) error {
			err := util.ConfigUtil.Set(tx, toolRankingConfigType, name, value)
			return response.CheckErr(err, errMsg)
		}

		if err := setConfig(toolRankingEnabledConfigName, strconv.Itoa(saveReq.Enabled), "ToolRanking ConfigSave enabled err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingPageTitleConfigName, strings.TrimSpace(saveReq.PageTitle), "ToolRanking ConfigSave pageTitle err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingPageDescriptionConfigName, strings.TrimSpace(saveReq.PageDescription), "ToolRanking ConfigSave pageDescription err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingDefaultPeriodConfigName, normalizeToolRankingPeriod(saveReq.DefaultPeriod), "ToolRanking ConfigSave defaultPeriod err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingPageLimitConfigName, strconv.Itoa(pageLimit), "ToolRanking ConfigSave pageLimit err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingShowOnSidebarConfigName, strconv.Itoa(saveReq.ShowOnSidebar), "ToolRanking ConfigSave showOnSidebar err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingSidebarTitleConfigName, strings.TrimSpace(saveReq.SidebarTitle), "ToolRanking ConfigSave sidebarTitle err"); err != nil {
			return err
		}
		if err := setConfig(toolRankingSidebarPeriodConfigName, normalizeToolRankingPeriod(saveReq.SidebarPeriod), "ToolRanking ConfigSave sidebarPeriod err"); err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return err
	}
	return nil
}
