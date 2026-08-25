package common

import (
	"crypto/subtle"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	serviceSetting "likeadmin/admin/service/setting"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
)

var UiedLicenseClientGroup = core.Group("/uied", newUiedLicenseHandler, regUiedLicenseClient)

// newUiedLicenseHandler 函数说明：初始化客户项目授权消费端路由处理器。
func newUiedLicenseHandler(srv serviceSetting.ISettingLicenseService) *uiedLicenseHandler {
	return &uiedLicenseHandler{srv: srv}
}

// regUiedLicenseClient 函数说明：注册客户项目对外暴露的授权信息/激活/验签/保存接口。
func regUiedLicenseClient(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *uiedLicenseHandler) {
		rg.GET("/license/info", handle.info)
		rg.POST("/license/info", handle.info)
		rg.GET("/license/activate", handle.activate)
		rg.POST("/license/activate", handle.activate)
		rg.POST("/license/verify", handle.verifyPayload)
		rg.POST("/license/save", handle.savePayload)
	})
}

type uiedLicenseHandler struct {
	srv serviceSetting.ISettingLicenseService
}

// info 函数说明：返回当前项目实例的本地授权运行态信息。
func (h uiedLicenseHandler) info(c *gin.Context) {
	var infoReq req.CommonUiedLicenseInfoReq
	if !bindUiedLicenseRequest(c, &infoReq) {
		return
	}
	res, err := h.srv.ClientInfo(infoReq, c.Request.Host)
	if err != nil {
		code, msg := resolveUiedLicenseError(err, 0)
		writeUiedLicenseError(c, code, msg)
		return
	}
	writeUiedLicenseSuccess(c, res)
}

// activate 函数说明：按授权码向 FSUIED 授权中心请求激活并落本地缓存。
func (h uiedLicenseHandler) activate(c *gin.Context) {
	var activateReq req.CommonUiedLicenseActivateReq
	if !bindUiedLicenseRequest(c, &activateReq) {
		return
	}
	res, remoteCode, err := h.srv.ClientActivate(activateReq, c.Request.Host)
	if err != nil {
		code, msg := resolveUiedLicenseError(err, remoteCode)
		writeUiedLicenseError(c, code, msg)
		return
	}
	writeUiedLicenseSuccess(c, res)
}

// verifyPayload 函数说明：校验外部签名授权载荷的基本合法性。
func (h uiedLicenseHandler) verifyPayload(c *gin.Context) {
	if !validateUiedLicenseWriteAccess(c) {
		return
	}
	var verifyReq req.CommonUiedLicenseVerifyReq
	if !bindUiedLicenseRequest(c, &verifyReq) {
		return
	}
	res, err := h.srv.ClientVerifyPayload(verifyReq, c.Request.Host)
	if err != nil {
		code, msg := resolveUiedLicenseError(err, 0)
		writeUiedLicenseError(c, code, msg)
		return
	}
	writeUiedLicenseSuccess(c, res)
}

// savePayload 函数说明：直接保存已通过预检的签名授权载荷到本地。
func (h uiedLicenseHandler) savePayload(c *gin.Context) {
	if !validateUiedLicenseWriteAccess(c) {
		return
	}
	var saveReq req.CommonUiedLicenseSaveReq
	if !bindUiedLicenseRequest(c, &saveReq) {
		return
	}
	res, err := h.srv.ClientSavePayload(saveReq, c.Request.Host)
	if err != nil {
		code, msg := resolveUiedLicenseError(err, 0)
		writeUiedLicenseError(c, code, msg)
		return
	}
	writeUiedLicenseSuccess(c, res)
}

// bindUiedLicenseRequest 函数说明：兼容 GET Query 与 POST JSON 两种入参形态。
func bindUiedLicenseRequest(c *gin.Context, target interface{}) bool {
	var err error
	if strings.EqualFold(c.Request.Method, http.MethodGet) {
		err = c.ShouldBindQuery(target)
	} else {
		err = c.ShouldBindJSON(target)
	}
	if err != nil {
		writeUiedLicenseError(c, 41000, "请求参数不完整或格式不合法")
		return false
	}
	return true
}

// isUiedLicenseStrictRuntime 函数说明：判断当前是否为生产运行模式（release/prod/production）。
func isUiedLicenseStrictRuntime() bool {
	mode := strings.ToLower(strings.TrimSpace(config.Config.GinMode))
	return mode == "release" || mode == "prod" || mode == "production"
}

// extractUiedLicenseAccessToken 函数说明：提取授权写入访问令牌，兼容自定义头、Bearer 和 query token。
func extractUiedLicenseAccessToken(c *gin.Context) string {
	token := strings.TrimSpace(c.GetHeader("x-uied-license-token"))
	if token != "" {
		return token
	}
	token = strings.TrimSpace(c.GetHeader("x-license-token"))
	if token != "" {
		return token
	}
	authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		bearerToken := strings.TrimSpace(authHeader[7:])
		if bearerToken != "" {
			return bearerToken
		}
	}
	return strings.TrimSpace(c.Query("token"))
}

// compareUiedLicenseSecret 函数说明：使用常量时间比较令牌，降低时序攻击风险。
func compareUiedLicenseSecret(source string, target string) bool {
	left := strings.TrimSpace(source)
	right := strings.TrimSpace(target)
	if left == "" || right == "" {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(left), []byte(right)) == 1
}

// validateUiedLicenseWriteAccess 函数说明：生产环境限制 verify/save 入口，必须携带可信访问令牌。
func validateUiedLicenseWriteAccess(c *gin.Context) bool {
	if !isUiedLicenseStrictRuntime() {
		return true
	}
	providedToken := extractUiedLicenseAccessToken(c)
	expectedTokens := []string{
		strings.TrimSpace(config.Config.UiedLicenseActivateToken),
		strings.TrimSpace(config.Config.UiedLicenseApiSignSecret),
	}
	hasConfiguredToken := false
	for _, expectedToken := range expectedTokens {
		if expectedToken == "" {
			continue
		}
		hasConfiguredToken = true
		if compareUiedLicenseSecret(providedToken, expectedToken) {
			return true
		}
	}
	if !hasConfiguredToken {
		writeUiedLicenseError(c, 41003, "授权写入入口未配置访问令牌，已拒绝请求。")
		return false
	}
	writeUiedLicenseError(c, 41003, "授权写入入口访问令牌无效。")
	return false
}

// resolveUiedLicenseError 函数说明：把内部错误统一映射为客户项目接口可识别的业务错误码。
func resolveUiedLicenseError(err error, preferredCode int) (code int, msg string) {
	if preferredCode > 0 {
		return preferredCode, firstErrorMessage(err)
	}
	switch typed := err.(type) {
	case response.RespType:
		switch typed.Code() {
		case response.AssertArgumentError.Code(), response.ParamsValidError.Code(), response.ParamsTypeError.Code(), response.RequestMethodError.Code():
			return 41000, typed.Msg()
		default:
			return typed.Code(), typed.Msg()
		}
	default:
		return 500, firstErrorMessage(err)
	}
}

// firstErrorMessage 函数说明：抽取首个可展示错误文案，避免返回空字符串。
func firstErrorMessage(err error) string {
	if err == nil {
		return "系统错误"
	}
	if strings.TrimSpace(err.Error()) != "" {
		return strings.TrimSpace(err.Error())
	}
	var respErr response.RespType
	if errors.As(err, &respErr) {
		return respErr.Msg()
	}
	return "系统错误"
}

// writeUiedLicenseSuccess 函数说明：按 FSUIED 对接文档统一输出成功响应。
func writeUiedLicenseSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"data":    data,
		"message": "请求成功",
		"msg":     "请求成功",
	})
}

// writeUiedLicenseError 函数说明：按 FSUIED 对接文档统一输出失败响应。
func writeUiedLicenseError(c *gin.Context, code int, msg string) {
	if strings.TrimSpace(msg) == "" {
		msg = "请求失败"
	}
	c.JSON(http.StatusOK, gin.H{
		"code":    code,
		"data":    gin.H{},
		"message": msg,
		"msg":     msg,
	})
}
