/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package setting

import "testing"

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
