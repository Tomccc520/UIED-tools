package common

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var ToolRankingGroup = core.Group("/common", newToolRankingHandler, regToolRanking, middleware.TokenAuth())

// newToolRankingHandler 函数说明：初始化工具排行榜公共接口处理器。
func newToolRankingHandler(srv serviceCommon.IToolRankingService) *toolRankingHandler {
	return &toolRankingHandler{srv: srv}
}

// regToolRanking 函数说明：注册工具排行榜榜单读取与事件埋点接口。
func regToolRanking(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *toolRankingHandler) {
		rg.GET("/tool-ranking/list", handle.list)
		rg.POST("/tool-ranking/track", handle.track)
	})
}

type toolRankingHandler struct {
	srv serviceCommon.IToolRankingService
}

// list 函数说明：读取工具排行榜列表，支持按榜单周期和排序方式查询。
func (h toolRankingHandler) list(c *gin.Context) {
	var listReq req.CommonToolRankingListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.List(listReq)
	response.CheckAndRespWithData(c, res, err)
}

// track 函数说明：写入工具排行榜事件埋点，供前台浏览/开始处理/下载等动作统一聚合。
func (h toolRankingHandler) track(c *gin.Context) {
	var trackReq req.CommonToolRankingTrackReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &trackReq)) {
		return
	}
	res, err := h.srv.Track(trackReq)
	response.CheckAndRespWithData(c, res, err)
}
