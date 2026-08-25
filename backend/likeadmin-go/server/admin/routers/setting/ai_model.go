package setting

import (
	"github.com/gin-gonic/gin"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/service/setting"
	"likeadmin/core"
	"likeadmin/core/response"
	"likeadmin/middleware"
	"likeadmin/util"
)

var AiModelGroup = core.Group("/setting", newAiModelHandler, regAiModel, middleware.TokenAuth())

// newAiModelHandler 函数说明：初始化 AI 模型配置路由处理器
func newAiModelHandler(srv setting.ISettingAiModelService) *aiModelHandler {
	return &aiModelHandler{srv: srv}
}

// regAiModel 函数说明：注册 AI 模型配置管理接口
func regAiModel(rg *gin.RouterGroup, group *core.GroupBase) error {
	return group.Reg(func(handle *aiModelHandler) {
		rg.GET("/ai/model/detail", handle.detail)
		rg.POST("/ai/model/save", handle.save)
		rg.POST("/ai/provider/models", handle.providerModels)
	})
}

type aiModelHandler struct {
	srv setting.ISettingAiModelService
}

// detail 函数说明：获取 AI 模型配置详情
func (ah aiModelHandler) detail(c *gin.Context) {
	res, err := ah.srv.Detail()
	response.CheckAndRespWithData(c, res, err)
}

// save 函数说明：保存 AI 模型配置
func (ah aiModelHandler) save(c *gin.Context) {
	var saveReq req.SettingAiModelSaveReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &saveReq)) {
		return
	}
	response.CheckAndResp(c, ah.srv.Save(saveReq))
}

// providerModels 函数说明：使用管理端填写的 Base URL 与 API Key 从上游获取模型列表。
func (ah aiModelHandler) providerModels(c *gin.Context) {
	var fetchReq req.SettingAiProviderModelsReq
	if response.IsFailWithResp(c, util.VerifyUtil.VerifyJSON(c, &fetchReq)) {
		return
	}
	res, err := ah.srv.FetchProviderModels(fetchReq)
	response.CheckAndRespWithData(c, res, err)
}
