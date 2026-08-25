package common

import (
	"bytes"
	"crypto/subtle"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"likeadmin/admin/schemas/req"
	"likeadmin/admin/service/setting"
	"likeadmin/config"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var AiModelPublicGroup = core.Group("/common", newAiModelPublicHandler, regAiModelPublic, middleware.TokenAuth())

// newAiModelPublicHandler 函数说明：初始化前台可读的 AI 模型与 Provider 接口处理器
func newAiModelPublicHandler(srv setting.ISettingAiModelService) *aiModelPublicHandler {
	return &aiModelPublicHandler{srv: srv}
}

// regAiModelPublic 函数说明：注册 AI 模型公共读取与代理接口
func regAiModelPublic(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *aiModelPublicHandler) {
		rg.GET("/ai/model/current", handle.current)
		rg.GET("/ai/matting/internal-config", handle.currentMattingProviderInternal)
		rg.GET("/ai/provider/current", handle.currentProvider)
		rg.POST("/ai/provider/chat", handle.proxyChat)
		rg.GET("/ai/image/current", handle.currentImageAbility)
		rg.GET("/ai/image/proxy", handle.proxyImageAbility)
		rg.POST("/ai/image/proxy", handle.proxyImageAbility)
	})
}

type aiModelPublicHandler struct {
	srv setting.ISettingAiModelService
}

// current 函数说明：返回当前启用的抠图 Provider 元信息，供 tools 前端调用。
func (ah aiModelPublicHandler) current(c *gin.Context) {
	res, err := ah.srv.Current()
	response.CheckAndRespWithData(c, res, err)
}

// currentMattingProviderInternal 函数说明：校验服务间令牌后返回抠图 Provider 密钥，仅供 8091 代理读取。
func (ah aiModelPublicHandler) currentMattingProviderInternal(c *gin.Context) {
	expectedToken := strings.TrimSpace(config.Config.MattingInternalToken)
	requestToken := strings.TrimSpace(c.GetHeader("X-Matting-Internal-Token"))
	if expectedToken == "" {
		c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{
			"code": 503,
			"msg":  "抠图内部配置接口尚未启用",
		})
		return
	}
	if len(expectedToken) != len(requestToken) ||
		subtle.ConstantTimeCompare([]byte(expectedToken), []byte(requestToken)) != 1 {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"code": 401,
			"msg":  "抠图内部配置鉴权失败",
		})
		return
	}

	res, err := ah.srv.CurrentMattingProviderInternal()
	response.CheckAndRespWithData(c, res, err)
}

// currentProvider 函数说明：返回当前启用的文本 AI Provider 元信息，供前端 AI 工具读取
func (ah aiModelPublicHandler) currentProvider(c *gin.Context) {
	var currentReq req.CommonAiProviderCurrentReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &currentReq)) {
		return
	}
	res, err := ah.srv.CurrentTextProvider(currentReq.Scene)
	response.CheckAndRespWithData(c, res, err)
}

// currentImageAbility 函数说明：返回当前图片 AI 能力配置元信息，供前端图片工具页展示状态与可用性。
func (ah aiModelPublicHandler) currentImageAbility(c *gin.Context) {
	var currentReq req.CommonAiImageAbilityCurrentReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyQuery(c, &currentReq)) {
		return
	}
	res, err := ah.srv.CurrentImageAbility(currentReq.Ability)
	response.CheckAndRespWithData(c, res, err)
}

// proxyChat 函数说明：统一代理前端 AI 对话/写作请求到后台配置的 Provider，避免前台暴露真实 API Key
func (ah aiModelPublicHandler) proxyChat(c *gin.Context) {
	var chatReq req.CommonAiProviderChatReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &chatReq)) {
		return
	}

	proxyPayload, err := ah.srv.BuildChatProxyPayload(chatReq)
	if err != nil {
		response.CheckAndResp(c, err)
		return
	}

	bodyBytes, marshalErr := util.ToolsUtil.ObjToJson(proxyPayload.RequestBody)
	if marshalErr != nil {
		response.FailWithMsg(c, response.SystemError, "AI Provider 请求体构建失败")
		return
	}

	upstreamURL := strings.TrimRight(proxyPayload.BaseURL, "/") + "/chat/completions"
	requestObj, reqErr := http.NewRequest(http.MethodPost, upstreamURL, bytes.NewReader([]byte(bodyBytes)))
	if reqErr != nil {
		response.FailWithMsg(c, response.SystemError, "AI Provider 请求初始化失败")
		return
	}

	requestObj.Header.Set("Accept", "application/json")
	requestObj.Header.Set("Content-Type", "application/json")
	requestObj.Header.Set("Authorization", "Bearer "+proxyPayload.APIKey)

	timeout := 90 * time.Second
	if proxyPayload.Stream {
		timeout = 5 * time.Minute
	}
	client := &http.Client{Timeout: timeout}

	respObj, respErr := client.Do(requestObj)
	if respErr != nil {
		response.FailWithMsg(c, response.SystemError, "AI Provider 请求失败，请检查 Key 或上游模型服务状态")
		return
	}
	defer respObj.Body.Close()

	for key, values := range respObj.Header {
		lowerKey := strings.ToLower(key)
		if lowerKey == "content-length" || lowerKey == "content-encoding" || lowerKey == "transfer-encoding" || lowerKey == "connection" {
			continue
		}
		for _, value := range values {
			c.Writer.Header().Add(key, value)
		}
	}

	contentType := respObj.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json; charset=utf-8"
	}
	c.Status(respObj.StatusCode)
	c.Header("Content-Type", contentType)

	if _, copyErr := io.Copy(c.Writer, respObj.Body); copyErr != nil {
		c.Error(copyErr)
		return
	}

	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	}
}

// proxyImageAbility 函数说明：统一代理图片 AI 能力请求到后台配置的上游地址，支持 GET 查询与 POST 上传两种模式。
func (ah aiModelPublicHandler) proxyImageAbility(c *gin.Context) {
	ability := strings.TrimSpace(c.Query("ability"))
	proxyPayload, err := ah.srv.BuildImageAbilityProxyPayload(ability)
	if err != nil {
		response.CheckAndResp(c, err)
		return
	}

	if strings.ToUpper(c.Request.Method) != proxyPayload.Method {
		response.FailWithMsg(c, response.AssertArgumentError, "当前图片 AI 能力请求方法不匹配")
		return
	}

	upstreamURL := strings.TrimSpace(proxyPayload.UpstreamURL)
	query := c.Request.URL.Query()
	query.Del("ability")
	if encoded := query.Encode(); encoded != "" {
		joiner := "?"
		if strings.Contains(upstreamURL, "?") {
			joiner = "&"
		}
		upstreamURL += joiner + encoded
	}

	var requestBody io.Reader
	if proxyPayload.Method == http.MethodPost {
		bodyBytes, readErr := io.ReadAll(c.Request.Body)
		if readErr != nil {
			response.FailWithMsg(c, response.SystemError, "读取图片 AI 请求体失败")
			return
		}
		requestBody = bytes.NewReader(bodyBytes)
	}

	requestObj, reqErr := http.NewRequest(proxyPayload.Method, upstreamURL, requestBody)
	if reqErr != nil {
		response.FailWithMsg(c, response.SystemError, "图片 AI 请求初始化失败")
		return
	}

	if contentType := strings.TrimSpace(c.Request.Header.Get("Content-Type")); contentType != "" {
		requestObj.Header.Set("Content-Type", contentType)
	}
	if accept := strings.TrimSpace(c.Request.Header.Get("Accept")); accept != "" {
		requestObj.Header.Set("Accept", accept)
	} else {
		requestObj.Header.Set("Accept", "application/json")
	}
	if proxyPayload.APIKeyHeader != "" && proxyPayload.APIKey != "" {
		requestObj.Header.Set(proxyPayload.APIKeyHeader, proxyPayload.APIKey)
	}

	timeout := time.Duration(proxyPayload.TimeoutSeconds) * time.Second
	if timeout <= 0 {
		timeout = 90 * time.Second
	}
	client := &http.Client{Timeout: timeout}

	respObj, respErr := client.Do(requestObj)
	if respErr != nil {
		response.FailWithMsg(c, response.SystemError, "图片 AI 请求失败，请检查后台能力配置或上游服务状态")
		return
	}
	defer respObj.Body.Close()

	for key, values := range respObj.Header {
		lowerKey := strings.ToLower(key)
		if lowerKey == "content-length" || lowerKey == "content-encoding" || lowerKey == "transfer-encoding" || lowerKey == "connection" {
			continue
		}
		for _, value := range values {
			c.Writer.Header().Add(key, value)
		}
	}

	contentType := respObj.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/json; charset=utf-8"
	}
	c.Status(respObj.StatusCode)
	c.Header("Content-Type", contentType)

	if _, copyErr := io.Copy(c.Writer, respObj.Body); copyErr != nil {
		c.Error(copyErr)
		return
	}

	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	}
}
