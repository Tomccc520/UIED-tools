package common

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"

	"likeadmin/admin/schemas/req"
	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/util"
)

var FrontendUserGroup = core.Group("/common", newFrontendUserHandler, regFrontendUser)

// newFrontendUserHandler 函数说明：初始化前台用户中心路由处理器
func newFrontendUserHandler(srv serviceCommon.IFrontendUserService) *frontendUserHandler {
	return &frontendUserHandler{srv: srv}
}

// regFrontendUser 函数说明：注册前台用户中心接口（登录、资料读取、资料保存、退出）
func regFrontendUser(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *frontendUserHandler) {
		rg.POST("/frontend-user/login", handle.login)
		rg.GET("/frontend-user/profile", handle.profile)
		rg.POST("/frontend-user/profile/save", handle.saveProfile)
		rg.POST("/frontend-user/points/consume", handle.consumePoints)
		rg.POST("/frontend-user/points/consume/resolve", handle.resolvePointsConsume)
		rg.GET("/frontend-user/products", handle.products)
		rg.POST("/frontend-user/purchase", handle.purchase)
		rg.POST("/frontend-user/purchase/pay", handle.purchasePay)
		rg.POST("/frontend-user/purchase/callback", handle.purchaseCallback)
		rg.POST("/frontend-user/purchase/wechat/callback", handle.purchaseWechatCallback)
		rg.POST("/frontend-user/purchase/close", handle.closeOrder)
		rg.GET("/frontend-user/order/status", handle.orderStatus)
		rg.GET("/frontend-user/orders", handle.orders)
		rg.GET("/frontend-user/points/logs", handle.pointsLogs)
		rg.POST("/frontend-user/logout", handle.logout)
	})
}

type frontendUserHandler struct {
	srv serviceCommon.IFrontendUserService
}

// login 函数说明：处理前台用户登录请求（首次登录自动注册）
func (h frontendUserHandler) login(c *gin.Context) {
	var loginReq req.CommonFrontendUserLoginReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &loginReq)) {
		return
	}
	res, err := h.srv.Login(c, loginReq)
	response.CheckAndRespWithData(c, res, err)
}

// profile 函数说明：读取前台用户个人中心资料（依赖 frontend-token）
func (h frontendUserHandler) profile(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	res, err := h.srv.Profile(tokenReq.FrontendToken)
	response.CheckAndRespWithData(c, res, err)
}

// saveProfile 函数说明：保存前台用户昵称与 QQ 邮箱绑定信息（依赖 frontend-token）
func (h frontendUserHandler) saveProfile(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var saveReq req.CommonFrontendUserProfileSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	res, err := h.srv.SaveProfile(tokenReq.FrontendToken, saveReq)
	response.CheckAndRespWithData(c, res, err)
}

// consumePoints 函数说明：扣减前台用户工具积分（自动处理每日赠送），依赖 frontend-token
func (h frontendUserHandler) consumePoints(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var consumeReq req.CommonFrontendUserPointsConsumeReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &consumeReq)) {
		return
	}
	res, err := h.srv.ConsumePoints(tokenReq.FrontendToken, consumeReq)
	response.CheckAndRespWithData(c, res, err)
}

// resolvePointsConsume 函数说明：确认核心工具运行成功，或在运行失败时幂等退还本次预扣积分。
func (h frontendUserHandler) resolvePointsConsume(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var resolveReq req.CommonFrontendUserPointsConsumeResolveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &resolveReq)) {
		return
	}
	res, err := h.srv.ResolvePointsConsume(tokenReq.FrontendToken, resolveReq)
	response.CheckAndRespWithData(c, res, err)
}

// products 函数说明：读取前台可售卖的会员套餐与积分包配置（无需登录）。
func (h frontendUserHandler) products(c *gin.Context) {
	res, err := h.srv.Products()
	response.CheckAndRespWithData(c, res, err)
}

// purchase 函数说明：前台用户购买会员套餐/积分包并即时生效（当前 mock 支付）。
func (h frontendUserHandler) purchase(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var purchaseReq req.CommonFrontendUserPurchaseReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &purchaseReq)) {
		return
	}
	res, err := h.srv.Purchase(tokenReq.FrontendToken, purchaseReq)
	response.CheckAndRespWithData(c, res, err)
}

// purchasePay 函数说明：前台用户为待支付订单重新拉起支付（可刷新 payUrl / tradeNo）。
func (h frontendUserHandler) purchasePay(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var payReq req.CommonFrontendUserPurchasePayReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &payReq)) {
		return
	}
	res, err := h.srv.PurchasePay(tokenReq.FrontendToken, payReq)
	response.CheckAndRespWithData(c, res, err)
}

// purchaseCallback 函数说明：前台订单支付回调（mock/第三方支付完成后调用，驱动待支付->已支付状态变更）。
func (h frontendUserHandler) purchaseCallback(c *gin.Context) {
	var callbackReq req.CommonFrontendUserPurchaseCallbackReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &callbackReq)) {
		return
	}
	res, err := h.srv.PurchaseCallback(strings.TrimSpace(c.GetHeader("frontend-token")), callbackReq)
	response.CheckAndRespWithData(c, res, err)
}

// purchaseWechatCallback 函数说明：微信支付V3官方回调入口，返回微信规范的 SUCCESS/FAIL JSON 响应。
func (h frontendUserHandler) purchaseWechatCallback(c *gin.Context) {
	_, err := h.srv.PurchaseWechatCallback(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "FAIL",
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code":    "SUCCESS",
		"message": "成功",
	})
}

// closeOrder 函数说明：前台用户主动关闭待支付订单，驱动待支付->已关闭状态变更。
func (h frontendUserHandler) closeOrder(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var closeReq req.CommonFrontendUserOrderCloseReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &closeReq)) {
		return
	}
	res, err := h.srv.CloseOrder(tokenReq.FrontendToken, closeReq)
	response.CheckAndRespWithData(c, res, err)
}

// orderStatus 函数说明：读取当前登录用户指定订单状态（用于支付轮询兜底查询）。
func (h frontendUserHandler) orderStatus(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var statusReq req.CommonFrontendUserOrderStatusReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &statusReq)) {
		return
	}
	res, err := h.srv.OrderStatus(tokenReq.FrontendToken, statusReq)
	response.CheckAndRespWithData(c, res, err)
}

// orders 函数说明：读取当前登录用户的购买记录列表（支持分页）。
func (h frontendUserHandler) orders(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var listReq req.CommonFrontendUserOrderListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.Orders(tokenReq.FrontendToken, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// pointsLogs 函数说明：读取当前登录用户的积分流水（含扣次与赠送）。
func (h frontendUserHandler) pointsLogs(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	var listReq req.CommonFrontendUserPointsLogListReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &listReq)) {
		return
	}
	res, err := h.srv.PointsLogs(tokenReq.FrontendToken, listReq)
	response.CheckAndRespWithData(c, res, err)
}

// logout 函数说明：处理前台用户退出登录请求并清理 Redis 会话
func (h frontendUserHandler) logout(c *gin.Context) {
	var tokenReq req.CommonFrontendUserTokenReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyHeader(c, &tokenReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.Logout(tokenReq.FrontendToken))
}
