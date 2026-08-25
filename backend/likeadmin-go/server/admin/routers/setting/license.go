package setting

import (
	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	serviceSetting "likeadmin/admin/service/setting"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var LicenseGroup = core.Group("/setting", newLicenseHandler, regLicense, middleware.TokenAuth())

// newLicenseHandler 函数说明：初始化授权配置路由处理器。
func newLicenseHandler(srv serviceSetting.ISettingLicenseService) *licenseHandler {
	return &licenseHandler{srv: srv}
}

// regLicense 函数说明：注册授权配置接口（详情、保存、校验）。
func regLicense(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *licenseHandler) {
		rg.GET("/license/detail", handle.detail)
		rg.POST("/license/save", handle.save)
		rg.POST("/license/verify", handle.verify)
	})
}

type licenseHandler struct {
	srv serviceSetting.ISettingLicenseService
}

// detail 函数说明：读取授权配置详情。
func (h licenseHandler) detail(c *gin.Context) {
	res, err := h.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 函数说明：保存授权配置。
func (h licenseHandler) save(c *gin.Context) {
	var saveReq req.SettingLicenseSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, h.srv.Save(saveReq))
}

// verify 函数说明：执行授权校验并返回校验结果。
func (h licenseHandler) verify(c *gin.Context) {
	var verifyReq req.SettingLicenseVerifyReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &verifyReq)) {
		return
	}
	res, err := h.srv.Verify(verifyReq)
	response.CheckAndRespWithData(c, res, err)
}
