package legacy

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
)

var LegacyCompatGroup = core.Group("", newCompatHandler, regLegacyCompat, middleware.TokenAuth())

type compatHandler struct{}

// newCompatHandler 函数说明：创建历史接口兼容处理器。
func newCompatHandler() *compatHandler {
	return &compatHandler{}
}

// regLegacyCompat 函数说明：集中注册历史模块兼容路由，统一消化旧接口 404 问题。
func regLegacyCompat(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *compatHandler) {
		articleGroup := rg.Group("/article")
		articleGroup.GET("/cate/list", handle.okPager)
		articleGroup.GET("/cate/lists", handle.okPager)
		articleGroup.GET("/cate/all", handle.okArray)
		articleGroup.GET("/cate/detail", handle.okObject)
		articleGroup.POST("/cate/add", handle.noop)
		articleGroup.POST("/cate/edit", handle.noop)
		articleGroup.POST("/cate/del", handle.noop)
		articleGroup.POST("/cate/change", handle.noop)
		articleGroup.GET("/list", handle.okPager)
		articleGroup.GET("/lists", handle.okPager)
		articleGroup.GET("/all", handle.okArray)
		articleGroup.GET("/detail", handle.okObject)
		articleGroup.POST("/add", handle.noop)
		articleGroup.POST("/edit", handle.noop)
		articleGroup.POST("/del", handle.noop)
		articleGroup.POST("/change", handle.noop)

		// 函数说明：兼容更早期“/article/article/*”路由写法，避免旧页面请求直接 404。
		articleLegacyGroup := articleGroup.Group("/article")
		articleLegacyGroup.GET("/list", handle.okPager)
		articleLegacyGroup.GET("/lists", handle.okPager)
		articleLegacyGroup.GET("/all", handle.okArray)
		articleLegacyGroup.GET("/detail", handle.okObject)
		articleLegacyGroup.POST("/add", handle.noop)
		articleLegacyGroup.POST("/edit", handle.noop)
		articleLegacyGroup.POST("/del", handle.noop)
		articleLegacyGroup.POST("/change", handle.noop)

		decorateGroup := rg.Group("/decorate")
		decorateGroup.GET("/pages/detail", handle.okObject)
		decorateGroup.GET("/pages/list", handle.okPager)
		decorateGroup.GET("/pages/lists", handle.okPager)
		decorateGroup.POST("/pages/save", handle.noop)
		decorateGroup.GET("/data/article", handle.okArray)
		decorateGroup.GET("/tabbar/detail", handle.okObject)
		decorateGroup.GET("/tabbar/list", handle.okArray)
		decorateGroup.GET("/tabbar/lists", handle.okArray)
		decorateGroup.POST("/tabbar/save", handle.noop)

		settingGroup := rg.Group("/setting")
		settingGroup.GET("/notice/list", handle.okArray)
		settingGroup.GET("/notice/lists", handle.okArray)
		settingGroup.GET("/notice/detail", handle.okObject)
		settingGroup.POST("/notice/save", handle.noop)
		settingGroup.GET("/sms/list", handle.okArray)
		settingGroup.GET("/sms/lists", handle.okArray)
		settingGroup.GET("/sms/detail", handle.okObject)
		settingGroup.POST("/sms/save", handle.noop)

	})
}

// okArray 函数说明：返回空数组兼容数据结构。
func (h compatHandler) okArray(c *gin.Context) {
	response.OkWithData(c, []any{})
}

// okObject 函数说明：返回空对象兼容详情结构。
func (h compatHandler) okObject(c *gin.Context) {
	response.OkWithData(c, gin.H{})
}

// okPager 函数说明：返回空分页结构，兼容 usePaging 读取列表。
func (h compatHandler) okPager(c *gin.Context) {
	response.OkWithData(c, gin.H{
		"lists":    []any{},
		"count":    0,
		"pageNo":   parsePageValue(c, "pageNo", 1),
		"pageSize": parsePageValue(c, "pageSize", 15),
	})
}

// noop 函数说明：历史写接口兼容为无副作用成功返回，避免旧页面提交失败。
func (h compatHandler) noop(c *gin.Context) {
	response.OkWithMsg(c, "历史模块已下线，当前请求已兼容处理")
}

// parsePageValue 函数说明：解析分页参数，异常时回退默认值。
func parsePageValue(c *gin.Context, key string, defaultValue int) int {
	raw := c.DefaultQuery(key, strconv.Itoa(defaultValue))
	value, err := strconv.Atoi(raw)
	if err != nil || value <= 0 {
		return defaultValue
	}
	return value
}
