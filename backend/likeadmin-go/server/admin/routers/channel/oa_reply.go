package channel

/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-14
 */

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	channelService "likeadmin/admin/service/channel"
	"likeadmin/core"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var OaReplyGroup = core.Group("/channel", newOaReplyHandler, regOaReply, middleware.TokenAuth())

// newOaReplyHandler 函数说明：初始化微信公众号回复规则路由处理器。
func newOaReplyHandler(srv channelService.IOaReplyService) *oaReplyHandler {
	return &oaReplyHandler{srv: srv}
}

// regOaReply 函数说明：注册关注回复、关键词回复和默认回复的完整 CRUD 路由。
func regOaReply(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *oaReplyHandler) {
		handle.registerReplyRoutes(rg, "oaReplyFollow", "follow", "关注回复")
		handle.registerReplyRoutes(rg, "oaReplyKeyword", "keyword", "关键词回复")
		handle.registerReplyRoutes(rg, "oaReplyDefault", "default", "默认回复")
	})
}

type oaReplyHandler struct {
	srv channelService.IOaReplyService
}

// registerReplyRoutes 函数说明：按回复类型批量注册列表、详情、新增、编辑、删除和状态接口。
func (h oaReplyHandler) registerReplyRoutes(rg *gin.RouterGroup, pathName string, replyType string, logName string) {
	group := rg.Group("/" + pathName)
	group.GET("/list", middleware.RecordLog(logName+"列表"), h.list(replyType))
	group.GET("/detail", middleware.RecordLog(logName+"详情"), h.detail(replyType))
	group.POST("/add", middleware.RecordLog(logName+"新增"), h.add(replyType))
	group.POST("/edit", middleware.RecordLog(logName+"编辑"), h.edit(replyType))
	group.POST("/del", middleware.RecordLog(logName+"删除"), h.del(replyType))
	group.POST("/status", middleware.RecordLog(logName+"状态修改"), h.changeStatus(replyType))
}

// list 函数说明：返回指定类型回复规则的分页列表处理器。
func (h oaReplyHandler) list(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var page request.PageReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &page)) {
			return
		}
		res, err := h.srv.List(page, replyType)
		response.CheckAndRespWithData(c, res, err)
	}
}

// detail 函数说明：返回指定类型回复规则的详情处理器。
func (h oaReplyHandler) detail(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var detailReq req.ChannelOaReplyDetailReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &detailReq)) {
			return
		}
		res, err := h.srv.Detail(detailReq.ID, replyType)
		response.CheckAndRespWithData(c, res, err)
	}
}

// add 函数说明：返回指定类型回复规则的新增处理器。
func (h oaReplyHandler) add(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var saveReq req.ChannelOaReplySaveReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
			return
		}
		response.CheckAndResp(c, h.srv.Add(saveReq, replyType))
	}
}

// edit 函数说明：返回指定类型回复规则的编辑处理器。
func (h oaReplyHandler) edit(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var saveReq req.ChannelOaReplySaveReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
			return
		}
		response.CheckAndResp(c, h.srv.Edit(saveReq, replyType))
	}
}

// del 函数说明：返回指定类型回复规则的删除处理器。
func (h oaReplyHandler) del(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var actionReq req.ChannelOaReplyActionReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &actionReq)) {
			return
		}
		response.CheckAndResp(c, h.srv.Del(actionReq.ID, replyType))
	}
}

// changeStatus 函数说明：返回指定类型回复规则的启停切换处理器。
func (h oaReplyHandler) changeStatus(replyType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var actionReq req.ChannelOaReplyActionReq
		if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &actionReq)) {
			return
		}
		response.CheckAndResp(c, h.srv.ChangeStatus(actionReq.ID, replyType))
	}
}
