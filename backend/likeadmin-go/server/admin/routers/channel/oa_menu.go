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
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var OaMenuGroup = core.Group("/channel", newOaMenuHandler, regOaMenu, middleware.TokenAuth())

// newOaMenuHandler 函数说明：初始化微信公众号菜单路由处理器。
func newOaMenuHandler(srv channelService.IOaMenuService) *oaMenuHandler {
	return &oaMenuHandler{srv: srv}
}

// regOaMenu 函数说明：注册公众号菜单读取、保存和真实发布接口。
func regOaMenu(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *oaMenuHandler) {
		rg.GET("/oaMenu/list", middleware.RecordLog("公众号菜单列表"), handle.detail)
		rg.GET("/oaMenu/lists", middleware.RecordLog("公众号菜单列表"), handle.detail)
		rg.GET("/oaMenu/detail", middleware.RecordLog("公众号菜单详情"), handle.detail)
		rg.POST("/oaMenu/save", middleware.RecordLog("公众号菜单保存"), handle.save)
		rg.POST("/oaMenu/publish", middleware.RecordLog("公众号菜单发布"), handle.publish)
	})
}

type oaMenuHandler struct {
	srv channelService.IOaMenuService
}

// detail 函数说明：读取公众号菜单本地配置。
func (h oaMenuHandler) detail(c *gin.Context) {
	res, err := h.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 函数说明：保存公众号菜单本地配置。
func (h oaMenuHandler) save(c *gin.Context) {
	var menuList []req.ChannelOaMenuItemReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &menuList)) {
		return
	}
	response.CheckAndResp(c, h.srv.Save(menuList))
}

// publish 函数说明：保存并发布公众号菜单到微信平台。
func (h oaMenuHandler) publish(c *gin.Context) {
	var menuList []req.ChannelOaMenuItemReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &menuList)) {
		return
	}
	response.CheckAndResp(c, h.srv.Publish(menuList))
}
