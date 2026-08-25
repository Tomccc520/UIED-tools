/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package operation

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	operationservice "likeadmin/admin/service/operation"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var AdvertisingGroup = core.Group("/operation", newAdvertisingHandler, regAdvertising, middleware.TokenAuth())

// advertisingHandler 运营广告管理路由处理器。
type advertisingHandler struct {
	srv operationservice.IOperationAdvertisingService
}

// newAdvertisingHandler 初始化运营广告管理路由处理器。
func newAdvertisingHandler(srv operationservice.IOperationAdvertisingService) *advertisingHandler {
	return &advertisingHandler{srv: srv}
}

// regAdvertising 注册运营广告详情与保存接口。
func regAdvertising(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *advertisingHandler) {
		rg.GET("/advertising/detail", middleware.RecordLog("广告配置详情"), handle.detail)
		rg.POST("/advertising/save", middleware.RecordLog("广告配置保存"), handle.save)
	})
}

// detail 返回当前广告内容列表。
func (h advertisingHandler) detail(c *gin.Context) {
	res, err := h.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 校验并保存广告内容列表。
func (h advertisingHandler) save(c *gin.Context) {
	var saveReq req.OperationAdvertisingSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	if response.IsFailWithResp(c, h.srv.Save(saveReq)) {
		return
	}
	res, err := h.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}
