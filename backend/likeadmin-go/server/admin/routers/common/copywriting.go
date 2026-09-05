/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */
package common

import (
	"strings"

	"github.com/gin-gonic/gin"

	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
)

// CopywritingGroup 函数说明：注册免登录的文案与翻译接口，统一承接前台跨域风险较高的第三方请求。
var CopywritingGroup = core.Group("/common", newCopywritingHandler, regCopywriting)

// newCopywritingHandler 函数说明：初始化随机文案处理器。
func newCopywritingHandler(srv serviceCommon.ICopywritingService) *copywritingHandler {
	return &copywritingHandler{srv: srv}
}

// regCopywriting 函数说明：注册一言、肯德基文案和翻译的同域读取路由。
func regCopywriting(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *copywritingHandler) {
		rg.GET("/copywriting/yiyan", handle.yiyan)
		rg.GET("/copywriting/kfc", handle.kfc)
		rg.GET("/copywriting/random/:kind", handle.random)
		rg.GET("/copywriting/translate", handle.translate)
	})
}

type copywritingHandler struct {
	srv serviceCommon.ICopywritingService
}

// yiyan 函数说明：返回随机一言，服务端自动处理上游异常和本地兜底。
func (h copywritingHandler) yiyan(c *gin.Context) {
	result, err := h.srv.Yiyan(c.Request.Context())
	response.CheckAndRespWithData(c, result, err)
}

// kfc 函数说明：返回肯德基疯狂星期四文案，服务端自动处理上游异常和本地兜底。
func (h copywritingHandler) kfc(c *gin.Context) {
	result, err := h.srv.KFC(c.Request.Context())
	response.CheckAndRespWithData(c, result, err)
}

// random 函数说明：按路径中的白名单类型返回随机文案，屏蔽各第三方接口差异。
func (h copywritingHandler) random(c *gin.Context) {
	result, err := h.srv.Random(c.Request.Context(), c.Param("kind"))
	response.CheckAndRespWithData(c, result, err)
}

// translate 函数说明：接收待翻译文案并返回英文结果，统一校验参数后交给服务层代理上游。
func (h copywritingHandler) translate(c *gin.Context) {
	text := c.Query("text")
	if text == "" {
		text = c.Query("text[]")
	}
	if strings.TrimSpace(text) == "" {
		response.FailWithMsg(c, response.AssertArgumentError, "请输入需要翻译的文案")
		return
	}
	result, err := h.srv.Translate(c.Request.Context(), text)
	response.CheckAndRespWithData(c, result, err)
}
