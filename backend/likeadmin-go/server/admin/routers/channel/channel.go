package channel

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	channelService "likeadmin/admin/service/channel"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var ChannelGroup = core.Group("/channel", newChannelHandler, regChannel, middleware.TokenAuth())

func newChannelHandler(srv channelService.IChannelService) *channelHandler {
	return &channelHandler{srv: srv}
}

func regChannel(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *channelHandler) {
		rg.GET("/h5/detail", handle.h5Detail)
		rg.POST("/h5/save", middleware.RecordLog("H5渠道配置保存"), handle.h5Save)
		rg.GET("/mp/detail", handle.mpDetail)
		rg.POST("/mp/save", middleware.RecordLog("微信小程序配置保存"), handle.mpSave)
		rg.GET("/wx/detail", handle.wxDetail)
		rg.POST("/wx/save", middleware.RecordLog("微信开放平台配置保存"), handle.wxSave)
		rg.GET("/oa/detail", handle.oaDetail)
		rg.POST("/oa/save", middleware.RecordLog("公众号配置保存"), handle.oaSave)
	})
}

type channelHandler struct {
	srv channelService.IChannelService
}

// h5Detail 函数说明：获取 H5 渠道配置详情
func (h channelHandler) h5Detail(c *gin.Context) {
	res, err := h.srv.H5Detail()
	response.CheckAndRespWithData(c, res, err)
}

// h5Save 函数说明：保存 H5 渠道配置
func (h channelHandler) h5Save(c *gin.Context) {
	var saveReq req.ChannelH5SaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.H5Save(saveReq))
}

// mpDetail 函数说明：获取微信小程序配置详情
func (h channelHandler) mpDetail(c *gin.Context) {
	res, err := h.srv.MpDetail()
	response.CheckAndRespWithData(c, res, err)
}

// mpSave 函数说明：保存微信小程序配置
func (h channelHandler) mpSave(c *gin.Context) {
	var saveReq req.ChannelMpSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.MpSave(saveReq))
}

// wxDetail 函数说明：获取微信开放平台配置详情
func (h channelHandler) wxDetail(c *gin.Context) {
	res, err := h.srv.WxDetail()
	response.CheckAndRespWithData(c, res, err)
}

// wxSave 函数说明：保存微信开放平台配置
func (h channelHandler) wxSave(c *gin.Context) {
	var saveReq req.ChannelWxSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.WxSave(saveReq))
}

// oaDetail 函数说明：获取微信公众号配置详情
func (h channelHandler) oaDetail(c *gin.Context) {
	res, err := h.srv.OaDetail()
	response.CheckAndRespWithData(c, res, err)
}

// oaSave 函数说明：保存微信公众号配置
func (h channelHandler) oaSave(c *gin.Context) {
	var saveReq req.ChannelOaSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.OaSave(saveReq))
}
