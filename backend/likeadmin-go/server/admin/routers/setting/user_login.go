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

var UserLoginGroup = core.Group("/setting", newUserLoginHandler, regUserLogin, middleware.TokenAuth())

func newUserLoginHandler(userSrv serviceSetting.ISettingUserService, loginSrv serviceSetting.ISettingLoginService) *userLoginHandler {
	return &userLoginHandler{
		userSrv:  userSrv,
		loginSrv: loginSrv,
	}
}

func regUserLogin(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *userLoginHandler) {
		rg.GET("/user/detail", handle.userDetail)
		rg.POST("/user/save", handle.userSave)

		rg.GET("/login/detail", handle.loginDetail)
		rg.POST("/login/save", handle.loginSave)
		rg.POST("/login/wechat/cert/sync", handle.loginWechatCertSync)
	})
}

type userLoginHandler struct {
	userSrv  serviceSetting.ISettingUserService
	loginSrv serviceSetting.ISettingLoginService
}

// userDetail 获取用户设置
func (ulh userLoginHandler) userDetail(c *gin.Context) {
	res, err := ulh.userSrv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// userSave 保存用户设置
func (ulh userLoginHandler) userSave(c *gin.Context) {
	var userReq req.SettingUserSetupReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &userReq)) {
		return
	}
	response.CheckAndResp(c, ulh.userSrv.Save(userReq))
}

// loginDetail 获取登录设置
func (ulh userLoginHandler) loginDetail(c *gin.Context) {
	res, err := ulh.loginSrv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// loginSave 保存登录设置
func (ulh userLoginHandler) loginSave(c *gin.Context) {
	var loginReq req.SettingLoginReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &loginReq)) {
		return
	}
	response.CheckAndResp(c, ulh.loginSrv.Save(loginReq))
}

// loginWechatCertSync 函数说明：按当前微信支付V3配置向微信官方拉取平台证书并回写配置。
func (ulh userLoginHandler) loginWechatCertSync(c *gin.Context) {
	res, err := ulh.loginSrv.SyncWechatPlatformCert()
	response.CheckAndRespWithData(c, res, err)
}
