package setting

import (
	"encoding/json"
	"strings"

	"gorm.io/gorm"
	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/core/response"
	"likeadmin/util"
)

const (
	aiModelConfigType            = "ai_model"
	aiMattingModelConfigName     = "matting_model_id"
	aiMattingProviderConfigName  = "matting_provider_configs"
	aiProviderConfigName         = "ai_provider_configs"
	aiImageAbilityConfigName     = "ai_image_ability_configs"
	defaultMattingProviderId     = "koukoutu"
	aliyunMattingProviderId      = "aliyun"
	koukoutuMattingProviderId    = "koukoutu"
	defaultAiProviderScene       = "chat"
	defaultAiProviderMaxTokens   = 8000
	defaultAiProviderTemperature = 0.7
	defaultAiImageMethod         = "POST"
	defaultAiImageTimeoutSeconds = 90
	defaultMattingTimeoutSeconds = 120
	defaultSiliconFlowModel      = "deepseek-ai/DeepSeek-V3.2"
)

var deprecatedSiliconFlowModels = map[string]string{
	"deepseek-ai/DeepSeek-R1-Distill-Llama-70B": defaultSiliconFlowModel,
	"deepseek-ai/DeepSeek-R1-Distill-Llama-8B":  defaultSiliconFlowModel,
	"deepseek-ai/DeepSeek-R1-Distill-Qwen-32B":  defaultSiliconFlowModel,
	"deepseek-ai/DeepSeek-R1-Distill-Qwen-14B":  defaultSiliconFlowModel,
	"deepseek-ai/DeepSeek-R1-Distill-Qwen-7B":   defaultSiliconFlowModel,
	"deepseek-ai/DeepSeek-V3":                   defaultSiliconFlowModel,
	"Qwen/Qwen2.5-72B-Instruct":                 "Qwen/Qwen3-32B",
	"THUDM/glm-4-9b-chat":                       "Qwen/Qwen3-8B",
}

var supportedMattingProviders = []resp.SettingAiModelOptionResp{
	{
		ModelId:     aliyunMattingProviderId,
		Name:        "阿里云通用分割 API",
		Description: "适合人、动物、食物、商品和家居等视觉中心主体，密钥由服务端环境变量管理",
		IsDefault:   false,
	},
	{
		ModelId:     koukoutuMattingProviderId,
		Name:        "抠抠图 API",
		Description: "支持同步文件抠图，服务端通过 X-API-Key 调用并返回透明背景结果",
		IsDefault:   true,
	},
}

var defaultMattingProviderConfigs = []aiMattingProviderConfig{
	{
		Provider:       aliyunMattingProviderId,
		Label:          "阿里云通用分割",
		Description:    "适合人、动物、食物、商品和家居等视觉中心主体。",
		ApiURL:         "",
		Endpoint:       "imageseg.cn-shanghai.aliyuncs.com",
		TimeoutSeconds: defaultMattingTimeoutSeconds,
	},
	{
		Provider:       koukoutuMattingProviderId,
		Label:          "抠抠图 API",
		Description:    "同步文件抠图，适合快速接入通用背景移除。",
		ApiURL:         "https://sync.koukoutu.com/v1/create",
		TimeoutSeconds: defaultMattingTimeoutSeconds,
	},
}

var defaultAiProviderConfigs = []aiProviderConfig{
	{
		Provider:     "siliconflow",
		Label:        "SiliconFlow",
		Description:  "适合当前站内多数 DeepSeek/写作/搜索工具，兼容现有模型列表。",
		Enabled:      true,
		IsDefault:    true,
		BaseURL:      "https://api.siliconflow.cn/v1",
		DefaultModel: defaultSiliconFlowModel,
	},
	{
		Provider:     "deepseek",
		Label:        "DeepSeek 官方",
		Description:  "适合官方 deepseek-chat / deepseek-reasoner 场景。",
		Enabled:      false,
		IsDefault:    false,
		BaseURL:      "https://api.deepseek.com/v1",
		DefaultModel: "deepseek-chat",
	},
	{
		Provider:     "kimi",
		Label:        "Kimi / Moonshot",
		Description:  "适合配置 Moonshot Chat Completions 接口，默认模型可自行填写。",
		Enabled:      false,
		IsDefault:    false,
		BaseURL:      "https://api.moonshot.cn/v1",
		DefaultModel: "moonshot-v1-8k",
	},
	{
		Provider:     "doubao",
		Label:        "豆包 / 火山方舟",
		Description:  "适合配置火山引擎方舟接入点，默认模型请填写你的 Endpoint ID。",
		Enabled:      false,
		IsDefault:    false,
		BaseURL:      "https://ark.cn-beijing.volces.com/api/v3",
		DefaultModel: "",
	},
	{
		Provider:     "openai",
		Label:        "OpenAI 兼容接口",
		Description:  "适合兼容 OpenAI Chat Completions 协议的模型网关与自建中转。",
		Enabled:      false,
		IsDefault:    false,
		BaseURL:      "https://api.openai.com/v1",
		DefaultModel: "",
	},
}

var defaultAiImageAbilityConfigs = []aiImageAbilityConfig{
	{
		Ability:        "prompt_reverse",
		Label:          "图片提示词反推",
		Description:    "上传图片后反推提示词，供 Prompt Reverse 页面使用。",
		Enabled:        true,
		Method:         "POST",
		UpstreamURL:    "https://api.pearktrue.cn/api/prompt_image",
		ApiKeyHeader:   "",
		TimeoutSeconds: 90,
	},
	{
		Ability:        "stable_diffusion",
		Label:          "Stable Diffusion 绘图",
		Description:    "根据提示词生成图片，供 StableDiffusion 页面使用。",
		Enabled:        true,
		Method:         "GET",
		UpstreamURL:    "https://api.pearktrue.cn/api/stablediffusion/",
		ApiKeyHeader:   "",
		TimeoutSeconds: 120,
	},
	{
		Ability:        "ai_qrcode",
		Label:          "AI 二维码",
		Description:    "根据提示词与链接生成 AI 艺术二维码。",
		Enabled:        true,
		Method:         "GET",
		UpstreamURL:    "https://api.pearktrue.cn/api/aiqrcode/",
		ApiKeyHeader:   "",
		TimeoutSeconds: 120,
	},
	{
		Ability:        "ocr",
		Label:          "OCR 图像识别",
		Description:    "识别图片文字内容，兼容文件上传与图片 URL 输入。",
		Enabled:        true,
		Method:         "POST",
		UpstreamURL:    "https://api.pearktrue.cn/api/ocr/",
		ApiKeyHeader:   "",
		TimeoutSeconds: 90,
	},
	{
		Ability:        "image_enhance",
		Label:          "图像增强",
		Description:    "上传图片后执行清晰化增强，供 ImageEnhance 页面使用。",
		Enabled:        true,
		Method:         "POST",
		UpstreamURL:    "https://api.pearktrue.cn/api/imagedistinct/",
		ApiKeyHeader:   "",
		TimeoutSeconds: 120,
	},
	{
		Ability:        "text_to_speech",
		Label:          "文本配音生成",
		Description:    "根据文本、角色和风格生成语音音频，供 TextToSpeech 页面使用。",
		Enabled:        true,
		Method:         "GET",
		UpstreamURL:    "https://api.pearktrue.cn/api/freedub",
		ApiKeyHeader:   "",
		TimeoutSeconds: 120,
	},
}

type aiProviderConfig struct {
	Provider     string `json:"provider"`
	Label        string `json:"label"`
	Description  string `json:"description"`
	Enabled      bool   `json:"enabled"`
	IsDefault    bool   `json:"isDefault"`
	BaseURL      string `json:"baseUrl"`
	ApiKey       string `json:"apiKey"`
	DefaultModel string `json:"defaultModel"`
}

type aiMattingProviderConfig struct {
	Provider        string `json:"provider"`
	Label           string `json:"label"`
	Description     string `json:"description"`
	ApiURL          string `json:"apiUrl"`
	ApiKey          string `json:"apiKey"`
	AccessKeyID     string `json:"accessKeyId"`
	AccessKeySecret string `json:"accessKeySecret"`
	Endpoint        string `json:"endpoint"`
	TimeoutSeconds  int    `json:"timeoutSeconds"`
}

type aiImageAbilityConfig struct {
	Ability        string `json:"ability"`
	Label          string `json:"label"`
	Description    string `json:"description"`
	Enabled        bool   `json:"enabled"`
	Method         string `json:"method"`
	UpstreamURL    string `json:"upstreamUrl"`
	ApiKeyHeader   string `json:"apiKeyHeader"`
	ApiKey         string `json:"apiKey"`
	TimeoutSeconds int    `json:"timeoutSeconds"`
}

// AiProviderProxyPayload 函数说明：封装后端 AI Provider 代理请求所需信息，供公共路由直接转发上游模型接口。
type AiProviderProxyPayload struct {
	Scene       string
	Provider    string
	BaseURL     string
	APIKey      string
	RequestBody map[string]interface{}
	Stream      bool
}

// AiImageAbilityProxyPayload 函数说明：封装图片 AI 能力代理请求所需的上游能力配置。
type AiImageAbilityProxyPayload struct {
	Ability        string
	Method         string
	UpstreamURL    string
	APIKeyHeader   string
	APIKey         string
	TimeoutSeconds int
}

type ISettingAiModelService interface {
	Detail() (res resp.SettingAiModelDetailResp, e error)
	Current() (res resp.SettingAiModelCurrentResp, e error)
	CurrentMattingProviderInternal() (res resp.SettingAiMattingProviderInternalResp, e error)
	CurrentTextProvider(scene string) (res resp.SettingAiProviderCurrentResp, e error)
	BuildChatProxyPayload(chatReq req.CommonAiProviderChatReq) (res AiProviderProxyPayload, e error)
	CurrentImageAbility(ability string) (res resp.SettingAiImageAbilityCurrentResp, e error)
	BuildImageAbilityProxyPayload(ability string) (res AiImageAbilityProxyPayload, e error)
	Save(saveReq req.SettingAiModelSaveReq) (e error)
}

// NewSettingAiModelService 函数说明：初始化 AI 模型与 Provider 配置服务
func NewSettingAiModelService(db *gorm.DB) ISettingAiModelService {
	return &settingAiModelService{db: db}
}

// settingAiModelService AI 模型与文本 Provider 配置服务实现类
type settingAiModelService struct {
	db *gorm.DB
}

// Detail 函数说明：返回 AI 抠图模型与文本 Provider 配置详情，供后台管理端使用
func (aSrv settingAiModelService) Detail() (res resp.SettingAiModelDetailResp, e error) {
	current, err := aSrv.Current()
	if err != nil {
		e = err
		return
	}

	providerCurrent, err := aSrv.CurrentTextProvider(defaultAiProviderScene)
	if err != nil {
		e = err
		return
	}

	providers, err := aSrv.getProviderConfigs()
	if err != nil {
		e = err
		return
	}

	imageAbilities, err := aSrv.getImageAbilityConfigs()
	if err != nil {
		e = err
		return
	}

	mattingProviders, err := aSrv.getMattingProviderConfigs()
	if err != nil {
		e = err
		return
	}

	return resp.SettingAiModelDetailResp{
		CurrentModelId:   current.ModelId,
		Current:          current,
		Supported:        supportedMattingProviders,
		MattingProviders: aSrv.toMattingProviderRespList(mattingProviders, true),
		ProviderCurrent:  providerCurrent,
		Providers:        aSrv.toProviderRespList(providers, true),
		ImageAbilities:   aSrv.toImageAbilityRespList(imageAbilities, true),
	}, nil
}

// Current 函数说明：返回当前启用的抠图 API Provider，保留旧字段名兼容前台接口。
func (aSrv settingAiModelService) Current() (res resp.SettingAiModelCurrentResp, e error) {
	modelId, err := aSrv.getCurrentModelId()
	if err != nil {
		e = err
		return
	}

	providers, err := aSrv.getMattingProviderConfigs()
	if err != nil {
		e = err
		return
	}
	current := aSrv.findMattingProvider(providers, modelId)

	return resp.SettingAiModelCurrentResp{
		ModelId:     modelId,
		ModelName:   aSrv.getModelNameById(modelId),
		Available:   current != nil && aSrv.isMattingProviderReady(*current),
		Description: aSrv.getMattingProviderDescription(current),
	}, nil
}

// CurrentMattingProviderInternal 函数说明：返回当前抠图 Provider 完整密钥，仅供内部代理服务读取。
func (aSrv settingAiModelService) CurrentMattingProviderInternal() (res resp.SettingAiMattingProviderInternalResp, e error) {
	modelId, err := aSrv.getCurrentModelId()
	if err != nil {
		e = err
		return
	}
	providers, err := aSrv.getMattingProviderConfigs()
	if err != nil {
		e = err
		return
	}
	current := aSrv.findMattingProvider(providers, modelId)
	if current == nil || !aSrv.isMattingProviderReady(*current) {
		e = response.AssertArgumentError.Make("当前抠图 Provider 密钥尚未配置完整")
		return
	}

	return resp.SettingAiMattingProviderInternalResp{
		Provider:        current.Provider,
		ApiURL:          current.ApiURL,
		ApiKey:          current.ApiKey,
		AccessKeyID:     current.AccessKeyID,
		AccessKeySecret: current.AccessKeySecret,
		Endpoint:        current.Endpoint,
		TimeoutSeconds:  current.TimeoutSeconds,
	}, nil
}

// CurrentTextProvider 函数说明：返回当前启用的文本 AI Provider 元信息，供前台工具选择模型与状态提示
func (aSrv settingAiModelService) CurrentTextProvider(scene string) (res resp.SettingAiProviderCurrentResp, e error) {
	scene = aSrv.normalizeScene(scene)
	providers, err := aSrv.getProviderConfigs()
	if err != nil {
		e = err
		return
	}

	current := aSrv.pickCurrentTextProvider(providers)
	if current == nil {
		return resp.SettingAiProviderCurrentResp{
			Available: false,
			Scene:     scene,
			Models:    []resp.SettingAiProviderModelOptionResp{},
		}, nil
	}

	return resp.SettingAiProviderCurrentResp{
		Available:    aSrv.isProviderReady(*current),
		Scene:        scene,
		Provider:     current.Provider,
		Label:        current.Label,
		Description:  current.Description,
		DefaultModel: current.DefaultModel,
		Models:       aSrv.getProviderModelOptions(*current),
	}, nil
}

// BuildChatProxyPayload 函数说明：解析当前有效的文本 Provider，并构造统一的 Chat Completions 代理请求载荷
func (aSrv settingAiModelService) BuildChatProxyPayload(chatReq req.CommonAiProviderChatReq) (res AiProviderProxyPayload, e error) {
	scene := aSrv.normalizeScene(chatReq.Scene)
	providers, err := aSrv.getProviderConfigs()
	if err != nil {
		e = err
		return
	}

	current := aSrv.pickReadyTextProvider(providers)
	if current == nil {
		e = response.AssertArgumentError.Make("AI Provider 未配置，请先到后台 AI 模型管理填写可用 Key")
		return
	}

	model := strings.TrimSpace(chatReq.Model)
	if model == "" {
		model = current.DefaultModel
	}
	model = aSrv.normalizeTextProviderModel(current.Provider, model)
	if model == "" {
		e = response.AssertArgumentError.Make("当前 AI Provider 未配置默认模型")
		return
	}

	apiKey := strings.TrimSpace(chatReq.OverrideApiKey)
	if apiKey == "" {
		apiKey = strings.TrimSpace(current.ApiKey)
	}
	if apiKey == "" {
		e = response.AssertArgumentError.Make("当前 AI Provider 未配置 API Key")
		return
	}

	stream := false
	if chatReq.Stream != nil {
		stream = *chatReq.Stream
	}

	requestBody := map[string]interface{}{
		"model":    model,
		"messages": chatReq.Messages,
		"stream":   stream,
	}

	if chatReq.Temperature != nil {
		requestBody["temperature"] = *chatReq.Temperature
	} else {
		requestBody["temperature"] = defaultAiProviderTemperature
	}
	if chatReq.MaxTokens != nil && *chatReq.MaxTokens > 0 {
		requestBody["max_tokens"] = *chatReq.MaxTokens
	}
	if chatReq.PresencePenalty != nil {
		requestBody["presence_penalty"] = *chatReq.PresencePenalty
	}
	if chatReq.FrequencyPenalty != nil {
		requestBody["frequency_penalty"] = *chatReq.FrequencyPenalty
	}
	if chatReq.TopP != nil {
		requestBody["top_p"] = *chatReq.TopP
	}
	if len(chatReq.ExtraOptions) > 0 {
		requestBody["extra_options"] = chatReq.ExtraOptions
	}

	return AiProviderProxyPayload{
		Scene:       scene,
		Provider:    current.Provider,
		BaseURL:     strings.TrimRight(current.BaseURL, "/"),
		APIKey:      apiKey,
		RequestBody: requestBody,
		Stream:      stream,
	}, nil
}

// CurrentImageAbility 函数说明：返回当前图片 AI 能力的可用状态，供前端图片工具页读取能力开关与文案。
func (aSrv settingAiModelService) CurrentImageAbility(ability string) (res resp.SettingAiImageAbilityCurrentResp, e error) {
	current, err := aSrv.getCurrentImageAbility(ability)
	if err != nil {
		e = err
		return
	}
	if current == nil {
		return resp.SettingAiImageAbilityCurrentResp{
			Available: false,
			Ability:   aSrv.normalizeImageAbility(ability),
		}, nil
	}

	return resp.SettingAiImageAbilityCurrentResp{
		Available:      aSrv.isImageAbilityReady(*current),
		Ability:        current.Ability,
		Label:          current.Label,
		Description:    current.Description,
		Method:         current.Method,
		TimeoutSeconds: current.TimeoutSeconds,
	}, nil
}

// BuildImageAbilityProxyPayload 函数说明：读取当前图片 AI 能力配置，并构造统一代理上游所需的能力信息。
func (aSrv settingAiModelService) BuildImageAbilityProxyPayload(ability string) (res AiImageAbilityProxyPayload, e error) {
	current, err := aSrv.getCurrentImageAbility(ability)
	if err != nil {
		e = err
		return
	}
	if current == nil || !aSrv.isImageAbilityReady(*current) {
		e = response.AssertArgumentError.Make("当前图片 AI 能力未启用，请先到后台 AI 模型管理开启")
		return
	}

	return AiImageAbilityProxyPayload{
		Ability:        current.Ability,
		Method:         current.Method,
		UpstreamURL:    strings.TrimSpace(current.UpstreamURL),
		APIKeyHeader:   strings.TrimSpace(current.ApiKeyHeader),
		APIKey:         strings.TrimSpace(current.ApiKey),
		TimeoutSeconds: current.TimeoutSeconds,
	}, nil
}

// Save 函数说明：保存当前启用的抠图 API Provider、文本 AI Provider 与图片 AI 能力配置。
func (aSrv settingAiModelService) Save(saveReq req.SettingAiModelSaveReq) (e error) {
	modelId := strings.TrimSpace(saveReq.ModelId)
	if modelId == "" {
		return response.AssertArgumentError.Make("抠图 Provider 不能为空")
	}
	if !aSrv.isSupportedModelId(modelId) {
		return response.AssertArgumentError.Make("抠图 Provider 不受支持")
	}

	var err error
	var mattingProviders []aiMattingProviderConfig
	if saveReq.MattingProviders == nil {
		mattingProviders, err = aSrv.getMattingProviderConfigs()
		if err != nil {
			return err
		}
	} else {
		mattingProviders = aSrv.normalizeMattingProviderReqs(saveReq.MattingProviders)
	}
	mattingProvidersJSON, err := json.Marshal(mattingProviders)
	if err != nil {
		return response.CheckErr(err, "Save json.Marshal matting providers err")
	}

	providers := aSrv.normalizeProviderReqs(saveReq.Providers)
	providersJSON, err := json.Marshal(providers)
	if err != nil {
		return response.CheckErr(err, "Save json.Marshal providers err")
	}

	if err = util.ConfigUtil.Set(aSrv.db, aiModelConfigType, aiMattingModelConfigName, modelId); err != nil {
		return response.CheckErr(err, "Save Set matting model err")
	}
	if err = util.ConfigUtil.Set(aSrv.db, aiModelConfigType, aiMattingProviderConfigName, string(mattingProvidersJSON)); err != nil {
		return response.CheckErr(err, "Save Set matting provider configs err")
	}
	if err = util.ConfigUtil.Set(aSrv.db, aiModelConfigType, aiProviderConfigName, string(providersJSON)); err != nil {
		return response.CheckErr(err, "Save Set provider configs err")
	}

	imageAbilities := aSrv.normalizeImageAbilityReqs(saveReq.ImageAbilities)
	imageAbilitiesJSON, err := json.Marshal(imageAbilities)
	if err != nil {
		return response.CheckErr(err, "Save json.Marshal image abilities err")
	}
	if err = util.ConfigUtil.Set(aSrv.db, aiModelConfigType, aiImageAbilityConfigName, string(imageAbilitiesJSON)); err != nil {
		return response.CheckErr(err, "Save Set image abilities err")
	}
	return nil
}

// getCurrentModelId 函数说明：读取当前抠图 Provider，旧模型值会自动回退到默认 API Provider。
func (aSrv settingAiModelService) getCurrentModelId() (modelId string, e error) {
	value, err := util.ConfigUtil.GetVal(aSrv.db, aiModelConfigType, aiMattingModelConfigName, defaultMattingProviderId)
	if e = response.CheckErr(err, "getCurrentModelId GetVal err"); e != nil {
		return
	}

	modelId = strings.TrimSpace(value)
	if !aSrv.isSupportedModelId(modelId) {
		modelId = defaultMattingProviderId
	}
	return
}

// getMattingProviderConfigs 函数说明：读取抠图 Provider 密钥配置，不存在时使用安全空值模板。
func (aSrv settingAiModelService) getMattingProviderConfigs() (providers []aiMattingProviderConfig, e error) {
	value, err := util.ConfigUtil.GetVal(aSrv.db, aiModelConfigType, aiMattingProviderConfigName, "")
	if e = response.CheckErr(err, "getMattingProviderConfigs GetVal err"); e != nil {
		return
	}

	value = strings.TrimSpace(value)
	if value == "" {
		return aSrv.cloneDefaultMattingProviderConfigs(), nil
	}
	if err = json.Unmarshal([]byte(value), &providers); err != nil {
		return aSrv.cloneDefaultMattingProviderConfigs(), nil
	}
	return aSrv.mergeMattingProviderConfigsWithDefaults(providers), nil
}

// getProviderConfigs 函数说明：读取文本 AI Provider 配置，不存在时使用默认 Provider 列表兜底
func (aSrv settingAiModelService) getProviderConfigs() (providers []aiProviderConfig, e error) {
	value, err := util.ConfigUtil.GetVal(aSrv.db, aiModelConfigType, aiProviderConfigName, "")
	if e = response.CheckErr(err, "getProviderConfigs GetVal err"); e != nil {
		return
	}

	value = strings.TrimSpace(value)
	if value == "" {
		return aSrv.cloneDefaultProviderConfigs(), nil
	}

	if err = json.Unmarshal([]byte(value), &providers); err != nil {
		return aSrv.cloneDefaultProviderConfigs(), nil
	}

	return aSrv.mergeProviderConfigsWithDefaults(providers), nil
}

// cloneDefaultMattingProviderConfigs 函数说明：复制抠图 Provider 默认模板，避免修改全局配置。
func (aSrv settingAiModelService) cloneDefaultMattingProviderConfigs() []aiMattingProviderConfig {
	copied := make([]aiMattingProviderConfig, 0, len(defaultMattingProviderConfigs))
	for _, item := range defaultMattingProviderConfigs {
		copied = append(copied, item)
	}
	return copied
}

// getImageAbilityConfigs 函数说明：读取图片 AI 能力配置，不存在时使用默认能力列表兜底。
func (aSrv settingAiModelService) getImageAbilityConfigs() (abilities []aiImageAbilityConfig, e error) {
	value, err := util.ConfigUtil.GetVal(aSrv.db, aiModelConfigType, aiImageAbilityConfigName, "")
	if e = response.CheckErr(err, "getImageAbilityConfigs GetVal err"); e != nil {
		return
	}

	value = strings.TrimSpace(value)
	if value == "" {
		return aSrv.cloneDefaultImageAbilityConfigs(), nil
	}

	if err = json.Unmarshal([]byte(value), &abilities); err != nil {
		return aSrv.cloneDefaultImageAbilityConfigs(), nil
	}

	return aSrv.mergeImageAbilityConfigsWithDefaults(abilities), nil
}

// getCurrentImageAbility 函数说明：按能力标识返回当前图片 AI 能力配置，找不到时返回空。
func (aSrv settingAiModelService) getCurrentImageAbility(ability string) (res *aiImageAbilityConfig, e error) {
	ability = aSrv.normalizeImageAbility(ability)
	if ability == "" {
		e = response.AssertArgumentError.Make("图片 AI 能力标识不能为空")
		return
	}

	abilities, err := aSrv.getImageAbilityConfigs()
	if err != nil {
		e = err
		return
	}

	for i := range abilities {
		item := &abilities[i]
		if item.Ability == ability {
			return item, nil
		}
	}
	return nil, nil
}

// cloneDefaultProviderConfigs 函数说明：复制默认 Provider 配置，避免直接修改全局默认切片
func (aSrv settingAiModelService) cloneDefaultProviderConfigs() []aiProviderConfig {
	copied := make([]aiProviderConfig, 0, len(defaultAiProviderConfigs))
	for _, item := range defaultAiProviderConfigs {
		copied = append(copied, item)
	}
	return copied
}

// mergeMattingProviderConfigsWithDefaults 函数说明：将数据库密钥合并到固定 Provider 模板。
func (aSrv settingAiModelService) mergeMattingProviderConfigsWithDefaults(raw []aiMattingProviderConfig) []aiMattingProviderConfig {
	rawMap := make(map[string]aiMattingProviderConfig, len(raw))
	for _, item := range raw {
		provider := strings.TrimSpace(strings.ToLower(item.Provider))
		if provider != "" {
			rawMap[provider] = item
		}
	}

	merged := make([]aiMattingProviderConfig, 0, len(defaultMattingProviderConfigs))
	for _, defaultItem := range defaultMattingProviderConfigs {
		item := defaultItem
		if rawItem, ok := rawMap[defaultItem.Provider]; ok {
			item = aSrv.mergeSingleMattingProvider(defaultItem, rawItem)
		}
		merged = append(merged, item)
	}
	return merged
}

// mergeSingleMattingProvider 函数说明：使用后台保存值覆盖抠图 Provider 默认模板。
func (aSrv settingAiModelService) mergeSingleMattingProvider(defaultItem aiMattingProviderConfig, rawItem aiMattingProviderConfig) aiMattingProviderConfig {
	merged := aSrv.normalizeSingleMattingProvider(rawItem)
	merged.Provider = defaultItem.Provider
	if merged.Label == "" {
		merged.Label = defaultItem.Label
	}
	if merged.Description == "" {
		merged.Description = defaultItem.Description
	}
	if merged.ApiURL == "" {
		merged.ApiURL = defaultItem.ApiURL
	}
	if merged.Endpoint == "" {
		merged.Endpoint = defaultItem.Endpoint
	}
	if merged.TimeoutSeconds <= 0 {
		merged.TimeoutSeconds = defaultItem.TimeoutSeconds
	}
	return merged
}

// cloneDefaultImageAbilityConfigs 函数说明：复制默认图片 AI 能力配置，避免直接修改全局默认切片。
func (aSrv settingAiModelService) cloneDefaultImageAbilityConfigs() []aiImageAbilityConfig {
	copied := make([]aiImageAbilityConfig, 0, len(defaultAiImageAbilityConfigs))
	for _, item := range defaultAiImageAbilityConfigs {
		copied = append(copied, item)
	}
	return copied
}

// mergeProviderConfigsWithDefaults 函数说明：将数据库中的 Provider 配置合并到默认模板，确保后台新增供应商后仍有完整字段
func (aSrv settingAiModelService) mergeProviderConfigsWithDefaults(raw []aiProviderConfig) []aiProviderConfig {
	rawMap := make(map[string]aiProviderConfig, len(raw))
	for _, item := range raw {
		key := strings.TrimSpace(item.Provider)
		if key == "" {
			continue
		}
		rawMap[key] = item
	}

	merged := make([]aiProviderConfig, 0, len(defaultAiProviderConfigs)+len(raw))
	for _, defaultItem := range defaultAiProviderConfigs {
		item := defaultItem
		if rawItem, ok := rawMap[defaultItem.Provider]; ok {
			item = aSrv.mergeSingleProvider(defaultItem, rawItem)
			delete(rawMap, defaultItem.Provider)
		}
		merged = append(merged, item)
	}

	for _, rawItem := range rawMap {
		merged = append(merged, aSrv.normalizeSingleProvider(rawItem))
	}

	return aSrv.normalizeProviderConfigs(merged)
}

// mergeSingleProvider 函数说明：用后台保存值覆盖默认模板，未填写字段回退到默认值
func (aSrv settingAiModelService) mergeSingleProvider(defaultItem aiProviderConfig, rawItem aiProviderConfig) aiProviderConfig {
	merged := aiProviderConfig{
		Provider:     defaultItem.Provider,
		Label:        strings.TrimSpace(rawItem.Label),
		Description:  strings.TrimSpace(rawItem.Description),
		Enabled:      rawItem.Enabled,
		IsDefault:    rawItem.IsDefault,
		BaseURL:      strings.TrimSpace(rawItem.BaseURL),
		ApiKey:       strings.TrimSpace(rawItem.ApiKey),
		DefaultModel: strings.TrimSpace(rawItem.DefaultModel),
	}

	if merged.Label == "" {
		merged.Label = defaultItem.Label
	}
	if merged.Description == "" {
		merged.Description = defaultItem.Description
	}
	if merged.BaseURL == "" {
		merged.BaseURL = defaultItem.BaseURL
	}
	if merged.DefaultModel == "" {
		merged.DefaultModel = defaultItem.DefaultModel
	}
	merged.DefaultModel = aSrv.normalizeTextProviderModel(merged.Provider, merged.DefaultModel)

	return merged
}

// normalizeTextProviderModel 函数说明：将已下线的 Provider 模型 ID 迁移为当前可用模型，避免历史配置导致前台工具中断。
func (aSrv settingAiModelService) normalizeTextProviderModel(provider string, model string) string {
	normalizedModel := strings.TrimSpace(model)
	if strings.EqualFold(strings.TrimSpace(provider), "siliconflow") {
		if replacement, ok := deprecatedSiliconFlowModels[normalizedModel]; ok {
			return replacement
		}
	}
	return normalizedModel
}

// mergeImageAbilityConfigsWithDefaults 函数说明：将数据库中的图片 AI 能力配置合并到默认模板，确保新增能力字段完整。
func (aSrv settingAiModelService) mergeImageAbilityConfigsWithDefaults(raw []aiImageAbilityConfig) []aiImageAbilityConfig {
	rawMap := make(map[string]aiImageAbilityConfig, len(raw))
	for _, item := range raw {
		key := strings.TrimSpace(item.Ability)
		if key == "" {
			continue
		}
		rawMap[key] = item
	}

	merged := make([]aiImageAbilityConfig, 0, len(defaultAiImageAbilityConfigs)+len(raw))
	for _, defaultItem := range defaultAiImageAbilityConfigs {
		item := defaultItem
		if rawItem, ok := rawMap[defaultItem.Ability]; ok {
			item = aSrv.mergeSingleImageAbility(defaultItem, rawItem)
			delete(rawMap, defaultItem.Ability)
		}
		merged = append(merged, item)
	}

	for _, rawItem := range rawMap {
		merged = append(merged, aSrv.normalizeSingleImageAbility(rawItem))
	}

	return aSrv.normalizeImageAbilityConfigs(merged)
}

// mergeSingleImageAbility 函数说明：使用后台保存值覆盖默认图片 AI 能力模板，未填写字段回退到默认值。
func (aSrv settingAiModelService) mergeSingleImageAbility(defaultItem aiImageAbilityConfig, rawItem aiImageAbilityConfig) aiImageAbilityConfig {
	merged := aiImageAbilityConfig{
		Ability:        defaultItem.Ability,
		Label:          strings.TrimSpace(rawItem.Label),
		Description:    strings.TrimSpace(rawItem.Description),
		Enabled:        rawItem.Enabled,
		Method:         strings.ToUpper(strings.TrimSpace(rawItem.Method)),
		UpstreamURL:    strings.TrimSpace(rawItem.UpstreamURL),
		ApiKeyHeader:   strings.TrimSpace(rawItem.ApiKeyHeader),
		ApiKey:         strings.TrimSpace(rawItem.ApiKey),
		TimeoutSeconds: rawItem.TimeoutSeconds,
	}

	if merged.Label == "" {
		merged.Label = defaultItem.Label
	}
	if merged.Description == "" {
		merged.Description = defaultItem.Description
	}
	if merged.Method == "" {
		merged.Method = defaultItem.Method
	}
	if merged.UpstreamURL == "" {
		merged.UpstreamURL = defaultItem.UpstreamURL
	}
	if merged.ApiKeyHeader == "" {
		merged.ApiKeyHeader = defaultItem.ApiKeyHeader
	}
	if merged.TimeoutSeconds == 0 {
		merged.TimeoutSeconds = defaultItem.TimeoutSeconds
	}

	return merged
}

// normalizeProviderReqs 函数说明：将后台保存请求中的 Provider 配置规范化，保证启用态、默认态与字段值可控
func (aSrv settingAiModelService) normalizeProviderReqs(raw []req.SettingAiProviderConfigReq) []aiProviderConfig {
	if len(raw) == 0 {
		return aSrv.cloneDefaultProviderConfigs()
	}

	providers := make([]aiProviderConfig, 0, len(raw))
	for _, item := range raw {
		providers = append(providers, aiProviderConfig{
			Provider:     strings.TrimSpace(item.Provider),
			Label:        strings.TrimSpace(item.Label),
			Description:  strings.TrimSpace(item.Description),
			Enabled:      item.Enabled,
			IsDefault:    item.IsDefault,
			BaseURL:      strings.TrimSpace(item.BaseURL),
			ApiKey:       strings.TrimSpace(item.ApiKey),
			DefaultModel: strings.TrimSpace(item.DefaultModel),
		})
	}
	return aSrv.mergeProviderConfigsWithDefaults(providers)
}

// normalizeMattingProviderReqs 函数说明：规范化后台提交的两组抠图 Provider 密钥。
func (aSrv settingAiModelService) normalizeMattingProviderReqs(raw []req.SettingAiMattingProviderConfigReq) []aiMattingProviderConfig {
	if len(raw) == 0 {
		return aSrv.cloneDefaultMattingProviderConfigs()
	}

	providers := make([]aiMattingProviderConfig, 0, len(raw))
	for _, item := range raw {
		providers = append(providers, aiMattingProviderConfig{
			Provider:        item.Provider,
			Label:           item.Label,
			Description:     item.Description,
			ApiURL:          item.ApiURL,
			ApiKey:          item.ApiKey,
			AccessKeyID:     item.AccessKeyID,
			AccessKeySecret: item.AccessKeySecret,
			Endpoint:        item.Endpoint,
			TimeoutSeconds:  item.TimeoutSeconds,
		})
	}
	return aSrv.mergeMattingProviderConfigsWithDefaults(providers)
}

// normalizeImageAbilityReqs 函数说明：将后台保存请求中的图片 AI 能力配置规范化，保证默认能力与自定义字段并存。
func (aSrv settingAiModelService) normalizeImageAbilityReqs(raw []req.SettingAiImageAbilityConfigReq) []aiImageAbilityConfig {
	if len(raw) == 0 {
		return aSrv.cloneDefaultImageAbilityConfigs()
	}

	abilities := make([]aiImageAbilityConfig, 0, len(raw))
	for _, item := range raw {
		abilities = append(abilities, aiImageAbilityConfig{
			Ability:        strings.TrimSpace(item.Ability),
			Label:          strings.TrimSpace(item.Label),
			Description:    strings.TrimSpace(item.Description),
			Enabled:        item.Enabled,
			Method:         strings.ToUpper(strings.TrimSpace(item.Method)),
			UpstreamURL:    strings.TrimSpace(item.UpstreamURL),
			ApiKeyHeader:   strings.TrimSpace(item.ApiKeyHeader),
			ApiKey:         strings.TrimSpace(item.ApiKey),
			TimeoutSeconds: item.TimeoutSeconds,
		})
	}

	return aSrv.mergeImageAbilityConfigsWithDefaults(abilities)
}

// normalizeSingleProvider 函数说明：为未知 Provider 补齐基本字段，避免后台保存自定义兼容接口时字段缺失
func (aSrv settingAiModelService) normalizeSingleProvider(item aiProviderConfig) aiProviderConfig {
	item.Provider = strings.TrimSpace(item.Provider)
	item.Label = strings.TrimSpace(item.Label)
	item.Description = strings.TrimSpace(item.Description)
	item.BaseURL = strings.TrimSpace(item.BaseURL)
	item.ApiKey = strings.TrimSpace(item.ApiKey)
	item.DefaultModel = strings.TrimSpace(item.DefaultModel)

	if item.Label == "" {
		item.Label = item.Provider
	}
	return item
}

// normalizeSingleMattingProvider 函数说明：清理抠图 Provider 字段并补齐基础超时。
func (aSrv settingAiModelService) normalizeSingleMattingProvider(item aiMattingProviderConfig) aiMattingProviderConfig {
	item.Provider = strings.TrimSpace(strings.ToLower(item.Provider))
	item.Label = strings.TrimSpace(item.Label)
	item.Description = strings.TrimSpace(item.Description)
	item.ApiURL = strings.TrimSpace(item.ApiURL)
	item.ApiKey = strings.TrimSpace(item.ApiKey)
	item.AccessKeyID = strings.TrimSpace(item.AccessKeyID)
	item.AccessKeySecret = strings.TrimSpace(item.AccessKeySecret)
	item.Endpoint = strings.TrimSpace(item.Endpoint)
	if item.TimeoutSeconds <= 0 {
		item.TimeoutSeconds = defaultMattingTimeoutSeconds
	}
	return item
}

// normalizeSingleImageAbility 函数说明：为图片 AI 能力补齐基础字段，避免后台保存后出现空方法与空超时。
func (aSrv settingAiModelService) normalizeSingleImageAbility(item aiImageAbilityConfig) aiImageAbilityConfig {
	item.Ability = aSrv.normalizeImageAbility(item.Ability)
	item.Label = strings.TrimSpace(item.Label)
	item.Description = strings.TrimSpace(item.Description)
	item.Method = strings.ToUpper(strings.TrimSpace(item.Method))
	item.UpstreamURL = strings.TrimSpace(item.UpstreamURL)
	item.ApiKeyHeader = strings.TrimSpace(item.ApiKeyHeader)
	item.ApiKey = strings.TrimSpace(item.ApiKey)

	if item.Label == "" {
		item.Label = item.Ability
	}
	if item.Method != "GET" && item.Method != "POST" {
		item.Method = defaultAiImageMethod
	}
	if item.TimeoutSeconds <= 0 {
		item.TimeoutSeconds = defaultAiImageTimeoutSeconds
	}
	return item
}

// normalizeProviderConfigs 函数说明：统一 Provider 列表中的默认态，只保留一个默认 Provider，并在必要时自动补齐
func (aSrv settingAiModelService) normalizeProviderConfigs(items []aiProviderConfig) []aiProviderConfig {
	normalized := make([]aiProviderConfig, 0, len(items))
	firstEnabledIndex := -1
	defaultIndex := -1

	for _, item := range items {
		item = aSrv.normalizeSingleProvider(item)
		if item.Provider == "" {
			continue
		}
		if item.Enabled {
			if firstEnabledIndex == -1 {
				firstEnabledIndex = len(normalized)
			}
			if item.IsDefault && defaultIndex == -1 {
				defaultIndex = len(normalized)
			} else {
				item.IsDefault = false
			}
		} else {
			item.IsDefault = false
		}
		normalized = append(normalized, item)
	}

	if defaultIndex == -1 && firstEnabledIndex >= 0 {
		normalized[firstEnabledIndex].IsDefault = true
	}

	return normalized
}

// normalizeImageAbilityConfigs 函数说明：统一图片 AI 能力列表中的字段格式，并剔除空能力项。
func (aSrv settingAiModelService) normalizeImageAbilityConfigs(items []aiImageAbilityConfig) []aiImageAbilityConfig {
	normalized := make([]aiImageAbilityConfig, 0, len(items))
	for _, item := range items {
		item = aSrv.normalizeSingleImageAbility(item)
		if item.Ability == "" {
			continue
		}
		normalized = append(normalized, item)
	}
	return normalized
}

// pickCurrentTextProvider 函数说明：选择当前展示用的文本 Provider，优先返回“已就绪默认项”，否则回退到首个启用项
func (aSrv settingAiModelService) pickCurrentTextProvider(items []aiProviderConfig) *aiProviderConfig {
	var fallback *aiProviderConfig
	for i := range items {
		item := &items[i]
		if !item.Enabled {
			continue
		}
		if fallback == nil {
			fallback = item
		}
		if item.IsDefault && aSrv.isProviderReady(*item) {
			return item
		}
	}
	if fallback != nil && aSrv.isProviderReady(*fallback) {
		return fallback
	}
	return fallback
}

// pickReadyTextProvider 函数说明：选择当前真正可用于发起代理请求的 Provider，优先默认项，失败时回退到其他已就绪 Provider
func (aSrv settingAiModelService) pickReadyTextProvider(items []aiProviderConfig) *aiProviderConfig {
	var fallback *aiProviderConfig
	for i := range items {
		item := &items[i]
		if !item.Enabled || !aSrv.isProviderReady(*item) {
			continue
		}
		if fallback == nil {
			fallback = item
		}
		if item.IsDefault {
			return item
		}
	}
	return fallback
}

// isProviderReady 函数说明：判断 Provider 是否具备发起代理请求的必要字段
func (aSrv settingAiModelService) isProviderReady(item aiProviderConfig) bool {
	return item.Enabled &&
		strings.TrimSpace(item.BaseURL) != "" &&
		strings.TrimSpace(item.ApiKey) != "" &&
		strings.TrimSpace(item.DefaultModel) != ""
}

// isMattingProviderReady 函数说明：判断抠图 Provider 是否具备实际调用所需的密钥。
func (aSrv settingAiModelService) isMattingProviderReady(item aiMattingProviderConfig) bool {
	switch item.Provider {
	case aliyunMattingProviderId:
		return strings.TrimSpace(item.AccessKeyID) != "" &&
			strings.TrimSpace(item.AccessKeySecret) != "" &&
			strings.TrimSpace(item.Endpoint) != ""
	case koukoutuMattingProviderId:
		return strings.TrimSpace(item.ApiURL) != "" && strings.TrimSpace(item.ApiKey) != ""
	default:
		return false
	}
}

// findMattingProvider 函数说明：按标识查找抠图 Provider 配置。
func (aSrv settingAiModelService) findMattingProvider(items []aiMattingProviderConfig, provider string) *aiMattingProviderConfig {
	for i := range items {
		if items[i].Provider == provider {
			return &items[i]
		}
	}
	return nil
}

// getMattingProviderDescription 函数说明：安全读取当前抠图 Provider 说明。
func (aSrv settingAiModelService) getMattingProviderDescription(item *aiMattingProviderConfig) string {
	if item == nil {
		return ""
	}
	return item.Description
}

// isImageAbilityReady 函数说明：判断图片 AI 能力是否具备代理上游接口的必要字段。
func (aSrv settingAiModelService) isImageAbilityReady(item aiImageAbilityConfig) bool {
	return item.Enabled &&
		strings.TrimSpace(item.UpstreamURL) != "" &&
		(item.Method == "GET" || item.Method == "POST")
}

// toProviderRespList 函数说明：将内部 Provider 配置转换为前端/后台统一返回结构，可按需脱敏 API Key
func (aSrv settingAiModelService) toProviderRespList(items []aiProviderConfig, includeSecret bool) []resp.SettingAiProviderConfigResp {
	result := make([]resp.SettingAiProviderConfigResp, 0, len(items))
	for _, item := range items {
		apiKey := ""
		if includeSecret {
			apiKey = item.ApiKey
		}
		result = append(result, resp.SettingAiProviderConfigResp{
			Provider:     item.Provider,
			Label:        item.Label,
			Description:  item.Description,
			Enabled:      item.Enabled,
			IsDefault:    item.IsDefault,
			BaseURL:      item.BaseURL,
			ApiKey:       apiKey,
			DefaultModel: item.DefaultModel,
			Models:       aSrv.getProviderModelOptions(item),
		})
	}
	return result
}

// toMattingProviderRespList 函数说明：转换抠图 Provider 配置，并按调用场景决定是否返回密钥。
func (aSrv settingAiModelService) toMattingProviderRespList(items []aiMattingProviderConfig, includeSecret bool) []resp.SettingAiMattingProviderConfigResp {
	result := make([]resp.SettingAiMattingProviderConfigResp, 0, len(items))
	for _, item := range items {
		apiKey := ""
		accessKeyID := ""
		accessKeySecret := ""
		if includeSecret {
			apiKey = item.ApiKey
			accessKeyID = item.AccessKeyID
			accessKeySecret = item.AccessKeySecret
		}
		result = append(result, resp.SettingAiMattingProviderConfigResp{
			Provider:        item.Provider,
			Label:           item.Label,
			Description:     item.Description,
			ApiURL:          item.ApiURL,
			ApiKey:          apiKey,
			AccessKeyID:     accessKeyID,
			AccessKeySecret: accessKeySecret,
			Endpoint:        item.Endpoint,
			TimeoutSeconds:  item.TimeoutSeconds,
			Available:       aSrv.isMattingProviderReady(item),
		})
	}
	return result
}

// toImageAbilityRespList 函数说明：将内部图片 AI 能力配置转换为前端/后台统一返回结构，可按需脱敏 API Key。
func (aSrv settingAiModelService) toImageAbilityRespList(items []aiImageAbilityConfig, includeSecret bool) []resp.SettingAiImageAbilityConfigResp {
	result := make([]resp.SettingAiImageAbilityConfigResp, 0, len(items))
	for _, item := range items {
		apiKey := ""
		if includeSecret {
			apiKey = item.ApiKey
		}
		result = append(result, resp.SettingAiImageAbilityConfigResp{
			Ability:        item.Ability,
			Label:          item.Label,
			Description:    item.Description,
			Enabled:        item.Enabled,
			Method:         item.Method,
			UpstreamURL:    item.UpstreamURL,
			ApiKeyHeader:   item.ApiKeyHeader,
			ApiKey:         apiKey,
			TimeoutSeconds: item.TimeoutSeconds,
		})
	}
	return result
}

// getProviderModelOptions 函数说明：返回 Provider 对应的推荐模型列表，未知 Provider 回退为“后台默认模型”
func (aSrv settingAiModelService) getProviderModelOptions(item aiProviderConfig) []resp.SettingAiProviderModelOptionResp {
	switch item.Provider {
	case "siliconflow":
		return []resp.SettingAiProviderModelOptionResp{
			{Label: "DeepSeek V3.2", Value: defaultSiliconFlowModel, Desc: "推荐默认，通用写作与对话", MaxTokens: 8000},
			{Label: "Pro DeepSeek V3.2", Value: "Pro/deepseek-ai/DeepSeek-V3.2", Desc: "高性能版", MaxTokens: 8000},
			{Label: "DeepSeek R1", Value: "deepseek-ai/DeepSeek-R1", Desc: "深度推理", MaxTokens: 8000},
			{Label: "Qwen3 32B", Value: "Qwen/Qwen3-32B", Desc: "通义千问均衡模型", MaxTokens: 16000},
			{Label: "Qwen3 14B", Value: "Qwen/Qwen3-14B", Desc: "通用中型模型", MaxTokens: 16000},
			{Label: "Qwen3 8B", Value: "Qwen/Qwen3-8B", Desc: "轻量高效", MaxTokens: 16000},
		}
	case "deepseek":
		return []resp.SettingAiProviderModelOptionResp{
			{Label: "deepseek-chat", Value: "deepseek-chat", Desc: "通用对话", MaxTokens: defaultAiProviderMaxTokens},
			{Label: "deepseek-reasoner", Value: "deepseek-reasoner", Desc: "推理增强", MaxTokens: defaultAiProviderMaxTokens},
		}
	default:
		defaultModel := strings.TrimSpace(item.DefaultModel)
		if defaultModel == "" {
			return []resp.SettingAiProviderModelOptionResp{}
		}
		return []resp.SettingAiProviderModelOptionResp{
			{
				Label:     defaultModel,
				Value:     defaultModel,
				Desc:      "后台配置的默认模型",
				MaxTokens: defaultAiProviderMaxTokens,
			},
		}
	}
}

// normalizeScene 函数说明：标准化前台请求场景，当前统一收口到 chat
func (aSrv settingAiModelService) normalizeScene(scene string) string {
	scene = strings.TrimSpace(strings.ToLower(scene))
	if scene == "" {
		return defaultAiProviderScene
	}
	return scene
}

// normalizeImageAbility 函数说明：标准化图片 AI 能力标识，统一转为小写下划线形式。
func (aSrv settingAiModelService) normalizeImageAbility(ability string) string {
	ability = strings.TrimSpace(strings.ToLower(ability))
	ability = strings.ReplaceAll(ability, "-", "_")
	return ability
}

// isSupportedModelId 函数说明：校验抠图 API Provider 是否在可用白名单内。
func (aSrv settingAiModelService) isSupportedModelId(modelId string) bool {
	for _, item := range supportedMattingProviders {
		if item.ModelId == modelId {
			return true
		}
	}
	return false
}

// getModelNameById 函数说明：按兼容字段中的 Provider ID 返回展示名称。
func (aSrv settingAiModelService) getModelNameById(modelId string) string {
	for _, item := range supportedMattingProviders {
		if item.ModelId == modelId {
			return item.Name
		}
	}
	return "抠抠图 API"
}
