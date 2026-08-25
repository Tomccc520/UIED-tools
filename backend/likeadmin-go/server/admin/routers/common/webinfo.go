package common

import (
	"github.com/gin-gonic/gin"
	serviceCommon "likeadmin/admin/service/common"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"net/url"
	"strings"
)

var WebInfoGroup = core.Group("/", newWebInfoHandler, regWebInfo, middleware.TokenAuth())

func newWebInfoHandler(srv serviceCommon.IWebInfoService) *webInfoHandler {
	return &webInfoHandler{srv: srv}
}

func regWebInfo(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *webInfoHandler) {
		rg.GET("/webinfo", handle.detail)
	})
}

type webInfoHandler struct {
	srv serviceCommon.IWebInfoService
}

// extractSchemeAndHost 函数说明：从 URL 文本中提取「scheme://host」，用于兼容 Referer/Origin 传参。
func extractSchemeAndHost(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	parsed, err := url.Parse(raw)
	if err != nil {
		return ""
	}
	if strings.TrimSpace(parsed.Scheme) == "" || strings.TrimSpace(parsed.Host) == "" {
		return ""
	}
	return parsed.Scheme + "://" + parsed.Host
}

// resolveWebInfoLink 函数说明：解析 webinfo 的目标站点，优先使用显式参数，缺省时回退到 Referer/Origin/Host。
func resolveWebInfoLink(c *gin.Context) string {
	link := strings.TrimSpace(c.Query("link"))
	if link == "" {
		link = strings.TrimSpace(c.Query("url"))
	}
	if link != "" {
		return link
	}

	// 函数说明：前端未传 link 时，优先使用页面来源，修复本地代理场景下 /api/webinfo 的 313 报错。
	for _, headerKey := range []string{"Referer", "Origin"} {
		if candidate := extractSchemeAndHost(c.GetHeader(headerKey)); candidate != "" {
			return candidate
		}
	}

	// 函数说明：兜底使用 Host，保证无 Referer/Origin 的请求仍可解析当前站点。
	host := strings.TrimSpace(c.Request.Host)
	if host == "" {
		return ""
	}

	proto := strings.TrimSpace(c.GetHeader("X-Forwarded-Proto"))
	if proto == "" {
		if c.Request.TLS != nil {
			proto = "https"
		} else {
			proto = "http"
		}
	}
	return proto + "://" + host
}

// detail 获取指定网站基础信息（标题、关键词、描述、favicon）
func (wh webInfoHandler) detail(c *gin.Context) {
	link := resolveWebInfoLink(c)
	res, err := wh.srv.Detail(link)
	response.CheckAndRespWithData(c, res, err)
}
