/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
package common

import (
	"net/http"

	"github.com/gin-gonic/gin"

	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
)

// RandomEmojiGroup 注册免登录的随机表情包图片接口。
var RandomEmojiGroup = core.Group("/common/emoji", newRandomEmojiHandler, regRandomEmoji)

type randomEmojiHandler struct {
	service *serviceCommon.RandomEmojiService
}

// newRandomEmojiHandler 注入表情包服务。
func newRandomEmojiHandler(service *serviceCommon.RandomEmojiService) *randomEmojiHandler {
	return &randomEmojiHandler{service: service}
}

// regRandomEmoji 挂载随机表情包读取路由。
func regRandomEmoji(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handler *randomEmojiHandler) {
		rg.GET("/random", handler.random)
	})
}

// random 返回未经转换的原始图片，并标记来源以便前台展示。
func (h *randomEmojiHandler) random(c *gin.Context) {
	c.Header("Cache-Control", "no-store")
	c.Header("X-Content-Type-Options", "nosniff")
	result, err := h.service.Random(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusBadGateway, response.Response{Code: http.StatusBadGateway, Msg: "暂时无法获取表情包"})
		return
	}
	c.Header("X-UIED-Emoji-Source", result.Source)
	c.Data(http.StatusOK, result.ContentType, result.Body)
}
