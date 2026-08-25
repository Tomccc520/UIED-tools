package resp

import "likeadmin/core"

// SettingDictTypeResp 字典类型返回信息
type SettingDictTypeResp struct {
	ID         uint        `json:"id" structs:"id"`                 // 主键
	DictName   string      `json:"dictName" structs:"dictName"`     // 字典名称
	DictType   string      `json:"dictType" structs:"dictType"`     // 字典类型
	DictRemark string      `json:"dictRemark" structs:"dictRemark"` // 字典备注
	DictStatus uint8       `json:"dictStatus" structs:"dictStatus"` // 字典状态
	CreateTime core.TsTime `json:"createTime" structs:"createTime"` // 创建时间
	UpdateTime core.TsTime `json:"updateTime" structs:"updateTime"` // 更新时间
}

// SettingDictDataResp 字典数据返回信息
type SettingDictDataResp struct {
	ID         uint        `json:"id" structs:"id"`                 // 主键
	TypeId     uint        `json:"typeId" structs:"typeId"`         // 类型
	Name       string      `json:"name" structs:"name"`             // 键
	Value      string      `json:"value" structs:"value"`           // 值
	Remark     string      `json:"remark" structs:"remark"`         // 备注
	Sort       uint16      `json:"sort" structs:"sort"`             // 排序
	Status     uint8       `json:"status" structs:"status"`         // 状态: [0=停用, 1=禁用]
	CreateTime core.TsTime `json:"createTime" structs:"createTime"` // 创建时间
	UpdateTime core.TsTime `json:"updateTime" structs:"updateTime"` // 更新时间
}

// SettingAiModelOptionResp AI 抠图 Provider 选项，保留字段名兼容既有接口。
type SettingAiModelOptionResp struct {
	ModelId     string `json:"modelId"`     // Provider ID
	Name        string `json:"name"`        // Provider 名称
	Description string `json:"description"` // Provider 描述
	IsDefault   bool   `json:"isDefault"`   // 是否默认 Provider
}

// SettingAiModelCurrentResp 当前启用的 AI 抠图 Provider。
type SettingAiModelCurrentResp struct {
	ModelId     string `json:"modelId"`     // 当前 Provider ID
	ModelName   string `json:"modelName"`   // 当前 Provider 名称
	Available   bool   `json:"available"`   // 当前 Provider 是否配置完整
	Description string `json:"description"` // 当前 Provider 说明
}

// SettingAiMattingProviderConfigResp 抠图 API Provider 配置详情。
type SettingAiMattingProviderConfigResp struct {
	Provider        string `json:"provider"`        // Provider 标识
	Label           string `json:"label"`           // Provider 名称
	Description     string `json:"description"`     // Provider 描述
	ApiURL          string `json:"apiUrl"`          // API 地址
	ApiKey          string `json:"apiKey"`          // 通用 API Key（仅后台返回）
	AccessKeyID     string `json:"accessKeyId"`     // 阿里云 AccessKey ID（仅后台返回）
	AccessKeySecret string `json:"accessKeySecret"` // 阿里云 AccessKey Secret（仅后台返回）
	Endpoint        string `json:"endpoint"`        // 阿里云 Endpoint
	TimeoutSeconds  int    `json:"timeoutSeconds"`  // 超时时间
	Available       bool   `json:"available"`       // 是否配置完整
}

// SettingAiMattingProviderInternalResp 抠图代理内部配置，仅允许服务间鉴权读取。
type SettingAiMattingProviderInternalResp struct {
	Provider        string `json:"provider"`        // Provider 标识
	ApiURL          string `json:"apiUrl"`          // API 地址
	ApiKey          string `json:"apiKey"`          // 通用 API Key
	AccessKeyID     string `json:"accessKeyId"`     // 阿里云 AccessKey ID
	AccessKeySecret string `json:"accessKeySecret"` // 阿里云 AccessKey Secret
	Endpoint        string `json:"endpoint"`        // 阿里云 Endpoint
	TimeoutSeconds  int    `json:"timeoutSeconds"`  // 超时时间
}

// SettingAiModelDetailResp AI 抠图与文本 Provider 配置详情。
type SettingAiModelDetailResp struct {
	CurrentModelId   string                               `json:"currentModelId"`   // 当前抠图 Provider ID
	Current          SettingAiModelCurrentResp            `json:"current"`          // 当前抠图 Provider
	Supported        []SettingAiModelOptionResp           `json:"supported"`        // 支持的抠图 Provider 列表
	MattingProviders []SettingAiMattingProviderConfigResp `json:"mattingProviders"` // 抠图 Provider 配置
	ProviderCurrent  SettingAiProviderCurrentResp         `json:"providerCurrent"`  // 当前启用的文本 AI Provider
	Providers        []SettingAiProviderConfigResp        `json:"providers"`        // 文本 Provider 配置列表
	ImageAbilities   []SettingAiImageAbilityConfigResp    `json:"imageAbilities"`   // 图片 AI 能力配置列表
}

// SettingAiProviderModelOptionResp AI Provider 可选模型
type SettingAiProviderModelOptionResp struct {
	Label     string `json:"label"`     // 模型展示名称
	Value     string `json:"value"`     // 模型值
	Desc      string `json:"desc"`      // 模型说明
	MaxTokens int    `json:"maxTokens"` // 建议最大输出 token
}

// SettingAiProviderConfigResp AI Provider 配置详情
type SettingAiProviderConfigResp struct {
	Provider     string                             `json:"provider"`     // Provider 标识
	Label        string                             `json:"label"`        // Provider 名称
	Description  string                             `json:"description"`  // Provider 描述
	Enabled      bool                               `json:"enabled"`      // 是否启用
	IsDefault    bool                               `json:"isDefault"`    // 是否默认
	BaseURL      string                             `json:"baseUrl"`      // 基础地址
	ApiKey       string                             `json:"apiKey"`       // API Key（仅后台管理端返回）
	DefaultModel string                             `json:"defaultModel"` // 默认模型
	Models       []SettingAiProviderModelOptionResp `json:"models"`       // 模型选项
}

// SettingAiProviderCurrentResp 当前启用的文本 AI Provider
type SettingAiProviderCurrentResp struct {
	Available    bool                               `json:"available"`    // 是否存在可用 Provider
	Scene        string                             `json:"scene"`        // 当前业务场景
	Provider     string                             `json:"provider"`     // Provider 标识
	Label        string                             `json:"label"`        // Provider 名称
	Description  string                             `json:"description"`  // Provider 描述
	DefaultModel string                             `json:"defaultModel"` // 默认模型
	Models       []SettingAiProviderModelOptionResp `json:"models"`       // 当前可选模型
}

// SettingAiImageAbilityConfigResp 图片 AI 能力配置详情
type SettingAiImageAbilityConfigResp struct {
	Ability        string `json:"ability"`        // 能力标识
	Label          string `json:"label"`          // 能力名称
	Description    string `json:"description"`    // 能力描述
	Enabled        bool   `json:"enabled"`        // 是否启用
	Method         string `json:"method"`         // 上游调用方法
	UpstreamURL    string `json:"upstreamUrl"`    // 上游地址
	ApiKeyHeader   string `json:"apiKeyHeader"`   // API Key 头名称
	ApiKey         string `json:"apiKey"`         // API Key（仅后台管理端返回）
	TimeoutSeconds int    `json:"timeoutSeconds"` // 超时时间（秒）
}

// SettingAiImageAbilityCurrentResp 当前启用的图片 AI 能力
type SettingAiImageAbilityCurrentResp struct {
	Available      bool   `json:"available"`      // 是否可调用
	Ability        string `json:"ability"`        // 能力标识
	Label          string `json:"label"`          // 能力名称
	Description    string `json:"description"`    // 能力描述
	Method         string `json:"method"`         // 请求方法
	TimeoutSeconds int    `json:"timeoutSeconds"` // 超时时间（秒）
}
