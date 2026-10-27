package setting

import (
	"github.com/gin-gonic/gin"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/service/setting"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
	"net/http"
)

var WebsiteGroup = core.Group("/setting", newWebsiteHandler, regWebsite, middleware.TokenAuth())

func newWebsiteHandler(srv setting.ISettingWebsiteService) *websiteHandler {
	return &websiteHandler{srv: srv}
}

func regWebsite(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *websiteHandler) {
		rg.GET("/website/detail", handle.detail)
		rg.POST("/website/save", handle.save)
		rg.POST("/website/catalog/sync", handle.syncCatalogSeed)
	})
}

type websiteHandler struct {
	srv setting.ISettingWebsiteService
}

// detail 获取网站信息
func (wh websiteHandler) detail(c *gin.Context) {
	res, err := wh.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 函数说明：保存网站配置并返回详情；写入成功后的回读失败只提示重新加载，不误报保存失败或诱导重复提交。
func (wh websiteHandler) save(c *gin.Context) {
	var wsReq req.SettingWebsiteReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &wsReq)) {
		return
	}
	if response.IsFailWithResp(c, wh.srv.Save(wsReq)) {
		return
	}
	res, err := wh.srv.Detail()
	if err != nil {
		core.Logger.Warnf("Website config saved but detail reload failed: path=[%s], err=[%+v]", c.Request.URL.Path, err)
		c.JSON(http.StatusOK, gin.H{
			"code": response.Success.Code(),
			"msg":  "配置已保存，请重新加载查看，无需重复提交",
			"data": gin.H{"saved": true, "reloadRequired": true},
			"show": true,
		})
		return
	}
	response.CheckAndRespWithData(c, res, err)
}

// syncCatalogSeed 函数说明：后台工具主数据页批量触发前端工具树同步，减少后续纯脚本维护成本。
func (wh websiteHandler) syncCatalogSeed(c *gin.Context) {
	var syncReq req.SettingWebsiteCatalogSyncReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &syncReq)) {
		return
	}
	res, err := wh.srv.SyncToolsCatalogSeed(syncReq)
	response.CheckAndRespWithData(c, res, err)
}
