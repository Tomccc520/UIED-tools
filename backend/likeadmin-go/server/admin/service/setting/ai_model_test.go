/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package setting

import (
	"strings"
	"testing"

	"likeadmin/admin/schemas/req"
)

// TestNormalizeTextProviderModel 函数说明：验证旧 SiliconFlow 模型会自动迁移，自定义模型保持不变。
func TestNormalizeTextProviderModel(t *testing.T) {
	service := settingAiModelService{}
	tests := []struct {
		name     string
		provider string
		model    string
		want     string
	}{
		{name: "迁移已下线的 R1 7B", provider: "siliconflow", model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B", want: defaultSiliconFlowModel},
		{name: "迁移旧 DeepSeek V3", provider: "siliconflow", model: "deepseek-ai/DeepSeek-V3", want: defaultSiliconFlowModel},
		{name: "保留用户自定义模型", provider: "siliconflow", model: "custom/provider-model", want: "custom/provider-model"},
		{name: "不修改其他 Provider", provider: "openai", model: "deepseek-ai/DeepSeek-V3", want: "deepseek-ai/DeepSeek-V3"},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := service.normalizeTextProviderModel(test.provider, test.model); got != test.want {
				t.Fatalf("normalizeTextProviderModel() = %q, want %q", got, test.want)
			}
		})
	}
}

// TestNormalizeProviderReqsKeepsFetchedModels 函数说明：验证通过 Key 获取的模型列表保存后仍会保留并去重。
func TestNormalizeProviderReqsKeepsFetchedModels(t *testing.T) {
	service := settingAiModelService{}
	providers := service.normalizeProviderReqs([]req.SettingAiProviderConfigReq{
		{
			Provider:     "siliconflow",
			Label:        "SiliconFlow",
			Enabled:      true,
			IsDefault:    true,
			BaseURL:      "https://api.siliconflow.cn/v1",
			ApiKey:       "test-key",
			DefaultModel: defaultSiliconFlowModel,
			Models: []req.SettingAiProviderModelOptionReq{
				{Label: "DeepSeek V3.2", Value: defaultSiliconFlowModel, MaxTokens: 8000},
				{Label: "重复模型", Value: defaultSiliconFlowModel, MaxTokens: 8000},
			},
		},
	})
	if len(providers) == 0 || len(providers[0].Models) != 1 {
		t.Fatalf("模型列表未正确持久化去重: %#v", providers)
	}
	options := service.getProviderModelOptions(providers[0])
	if len(options) != 1 || options[0].Value != defaultSiliconFlowModel {
		t.Fatalf("Provider 响应未优先使用已获取模型: %#v", options)
	}
}

// TestProviderModelAllowed 函数说明：验证前台只能调用默认模型或后台已获取的模型，拒绝任意模型 ID。
func TestProviderModelAllowed(t *testing.T) {
	service := settingAiModelService{}
	provider := aiProviderConfig{
		Provider:     "siliconflow",
		DefaultModel: defaultSiliconFlowModel,
		Models: []aiProviderModelOption{
			{Label: "Qwen3", Value: "Qwen/Qwen3-8B", MaxTokens: 8000},
		},
	}
	if !service.isProviderModelAllowed(provider, defaultSiliconFlowModel) {
		t.Fatal("默认模型应允许调用")
	}
	if !service.isProviderModelAllowed(provider, "Qwen/Qwen3-8B") {
		t.Fatal("后台模型列表中的模型应允许调用")
	}
	if service.isProviderModelAllowed(provider, "untrusted/expensive-model") {
		t.Fatal("后台未允许的模型不应调用")
	}
}

// TestAiProviderPromptSizeLimit 函数说明：验证 AI 消息总长度超过限制时会被拒绝。
func TestAiProviderPromptSizeLimit(t *testing.T) {
	if !isAiProviderPromptSizeAllowed([]req.CommonAiProviderChatMessageReq{{Role: "user", Content: "正常内容"}}) {
		t.Fatal("正常消息应通过长度校验")
	}
	if isAiProviderPromptSizeAllowed([]req.CommonAiProviderChatMessageReq{{Role: "user", Content: strings.Repeat("x", maxAiProviderPromptBytes+1)}}) {
		t.Fatal("超长消息应被拒绝")
	}
}
