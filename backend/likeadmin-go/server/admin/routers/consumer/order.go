package consumer

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	consumerService "likeadmin/admin/service/consumer"
	"likeadmin/core"
	"likeadmin/core/request"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var OrderGroup = core.Group("/order", newOrderHandler, regOrder, middleware.TokenAuth())

// newOrderHandler 函数说明：初始化会员订单管理路由处理器。
func newOrderHandler(srv consumerService.IOrderService) *orderHandler {
	return &orderHandler{srv: srv}
}

// regOrder 函数说明：注册后台订单管理接口（筛选列表/导出/补单/关闭/交付信息/下载检测）。
func regOrder(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *orderHandler) {
		rg.GET("/list", middleware.RecordLog("订单列表"), handle.list)
		rg.GET("/export", middleware.RecordLog("订单导出"), handle.export)
		rg.GET("/callback_audit/list", middleware.RecordLog("支付回调审计列表"), handle.callbackAuditList)
		rg.GET("/linkage_summary", middleware.RecordLog("订单交付联动统计"), handle.linkageSummary)
		rg.POST("/reissue", middleware.RecordLog("订单补单"), handle.reissue)
		rg.POST("/close", middleware.RecordLog("订单关闭"), handle.close)
		rg.POST("/delivery/save", middleware.RecordLog("订单交付保存"), handle.saveDelivery)
		rg.POST("/check_download", middleware.RecordLog("订单下载检测"), handle.checkDownload)
	})
}

type orderHandler struct {
	srv consumerService.IOrderService
}

// list 函数说明：分页读取会员/积分订单列表。
func (h orderHandler) list(c *gin.Context) {
	var page request.PageReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &page)) {
		return
	}
	var listReq req.UserOrderListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.List(page, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// export 函数说明：按筛选条件导出订单列表（返回明细数据给前端生成 CSV）。
func (h orderHandler) export(c *gin.Context) {
	var listReq req.UserOrderListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.Export(listReq)
	response.CheckAndRespWithData(c, res, err)
}

// callbackAuditList 函数说明：分页读取支付回调审计日志，供后台定位签名失败、重放与锁冲突问题。
func (h orderHandler) callbackAuditList(c *gin.Context) {
	var page request.PageReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &page)) {
		return
	}
	var listReq req.UserOrderCallbackAuditListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.CallbackAuditList(page, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// linkageSummary 函数说明：汇总源码交付订单与系统授权联动状态，供授权页顶部统计卡直接读取。
func (h orderHandler) linkageSummary(c *gin.Context) {
	res, err := h.srv.LinkageSummary()
	response.CheckAndRespWithData(c, res, err)
}

// reissue 函数说明：后台手工补单，将待支付/已关闭订单改为已支付并补发权益。
func (h orderHandler) reissue(c *gin.Context) {
	var reissueReq req.UserOrderReissueReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &reissueReq)) {
		return
	}
	res, err := h.srv.Reissue(reissueReq)
	response.CheckAndRespWithData(c, res, err)
}

// close 函数说明：后台关闭待支付订单，防止重复支付。
func (h orderHandler) close(c *gin.Context) {
	var closeReq req.UserOrderCloseReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &closeReq)) {
		return
	}
	res, err := h.srv.Close(closeReq)
	response.CheckAndRespWithData(c, res, err)
}

// saveDelivery 函数说明：保存订单交付信息（授权域名、授权码、下载链接与交付状态）。
func (h orderHandler) saveDelivery(c *gin.Context) {
	var saveReq req.UserOrderDeliverySaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	res, err := h.srv.SaveDelivery(saveReq)
	response.CheckAndRespWithData(c, res, err)
}

// checkDownload 函数说明：手动检测订单下载链接是否可访问，并回写检测结果。
func (h orderHandler) checkDownload(c *gin.Context) {
	var checkReq req.UserOrderCheckDownloadReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &checkReq)) {
		return
	}
	res, err := h.srv.CheckDownload(checkReq)
	response.CheckAndRespWithData(c, res, err)
}
