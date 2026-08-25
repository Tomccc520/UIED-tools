package setting

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	"likeadmin/admin/service/setting"
	"likeadmin/core"
	corerequest "likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var ToolRankingSettingGroup = core.Group("/setting", newToolRankingSettingHandler, regToolRankingSetting, middleware.TokenAuth())

// newToolRankingSettingHandler 函数说明：初始化后台工具热榜管理路由处理器。
func newToolRankingSettingHandler(srv setting.ISettingToolRankingService) *toolRankingSettingHandler {
	return &toolRankingSettingHandler{srv: srv}
}

// regToolRankingSetting 函数说明：注册后台工具热榜管理页与榜单配置页所需接口。
func regToolRankingSetting(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *toolRankingSettingHandler) {
		rg.GET("/tool-ranking/list", middleware.RecordLog("工具热榜列表"), handle.list)
		rg.GET("/tool-ranking/summary", middleware.RecordLog("工具热榜概览"), handle.summary)
		rg.GET("/tool-ranking/trend", middleware.RecordLog("工具热榜趋势"), handle.trend)
		rg.GET("/tool-ranking/export", middleware.RecordLog("工具热榜导出"), handle.export)
		rg.GET("/tool-ranking/config/detail", middleware.RecordLog("工具热榜配置详情"), handle.configDetail)
		rg.POST("/tool-ranking/config/save", middleware.RecordLog("工具热榜配置保存"), handle.configSave)
	})
}

type toolRankingSettingHandler struct {
	srv setting.ISettingToolRankingService
}

// list 函数说明：分页读取后台工具热榜聚合结果。
func (h toolRankingSettingHandler) list(c *gin.Context) {
	var page corerequest.PageReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &page)) {
		return
	}
	var listReq req.SettingToolRankingListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.List(page, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// summary 函数说明：读取后台工具热榜概览统计，用于页面顶部工作区与卡片。
func (h toolRankingSettingHandler) summary(c *gin.Context) {
	res, err := h.srv.Summary()
	response.CheckAndRespWithData(c, res, err)
}

// trend 函数说明：读取后台工具热榜趋势图数据，供管理页图表展示。
func (h toolRankingSettingHandler) trend(c *gin.Context) {
	var trendReq req.SettingToolRankingListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &trendReq)) {
		return
	}
	res, err := h.srv.Trend(trendReq)
	response.CheckAndRespWithData(c, res, err)
}

// export 函数说明：导出后台工具热榜当前筛选结果，供管理页生成 CSV 文件。
func (h toolRankingSettingHandler) export(c *gin.Context) {
	var exportReq req.SettingToolRankingListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &exportReq)) {
		return
	}
	res, err := h.srv.Export(exportReq)
	response.CheckAndRespWithData(c, res, err)
}

// configDetail 函数说明：读取工具热榜榜单配置详情。
func (h toolRankingSettingHandler) configDetail(c *gin.Context) {
	res, err := h.srv.ConfigDetail()
	response.CheckAndRespWithData(c, res, err)
}

// configSave 函数说明：保存工具热榜榜单配置。
func (h toolRankingSettingHandler) configSave(c *gin.Context) {
	var saveReq req.SettingToolRankingConfigSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.ConfigSave(saveReq))
}
