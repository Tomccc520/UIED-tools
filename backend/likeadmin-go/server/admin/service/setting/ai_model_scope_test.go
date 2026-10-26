/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
package setting

import (
	"errors"
	"reflect"
	"sort"
	"testing"

	"likeadmin/admin/schemas/req"
)

// aiScopeFixture 函数说明：使用合成凭据构建各模块载荷，不读取真实配置或数据库。
func aiScopeFixture(scope string) req.SettingAiModelSaveReq {
	return req.SettingAiModelSaveReq{
		Scope: scope, ModelId: "koukoutu",
		MattingProviders: []req.SettingAiMattingProviderConfigReq{{Provider: "koukoutu", Label: "抠图", ApiURL: "https://matting.example.test", ApiKey: "synthetic", TimeoutSeconds: 30}},
		Providers:        []req.SettingAiProviderConfigReq{{Provider: "openai", Label: "文本", BaseURL: "https://ai.example.test/v1", ApiKey: "synthetic", DefaultModel: "model", Enabled: true, IsDefault: true}},
		ImageAbilities:   []req.SettingAiImageAbilityConfigReq{{Ability: "ocr", Label: "识别", Method: "POST", UpstreamURL: "https://ocr.example.test", Enabled: true, TimeoutSeconds: 30}},
	}
}

// TestAiModelScopeWritesOnlySelectedModule 函数说明：验证真实写入器只接收当前模块的配置键，即使提交了其他模块旧快照。
func TestAiModelScopeWritesOnlySelectedModule(t *testing.T) {
	service := settingAiModelService{}
	for _, item := range []struct {
		scope string
		keys  []string
	}{
		{"matting", []string{aiMattingModelConfigName, aiMattingProviderConfigName}},
		{"provider", []string{aiProviderConfigName}},
		{"ability", []string{aiImageAbilityConfigName}},
	} {
		t.Run(item.scope, func(t *testing.T) {
			values, err := service.buildAiModelSaveValues(aiScopeFixture(item.scope), nil)
			if err != nil {
				t.Fatal(err)
			}
			written := []string{}
			if err = writeAiModelSaveValues(values, func(name, value string) error { written = append(written, name); return nil }); err != nil {
				t.Fatal(err)
			}
			sort.Strings(written)
			sort.Strings(item.keys)
			if !reflect.DeepEqual(written, item.keys) {
				t.Fatalf("写入了非当前模块: %v", written)
			}
		})
	}
}

// TestAiModelScopeMissingDataRejected 函数说明：无效范围、缺失模块或缺失标识不能静默恢复默认配置。
func TestAiModelScopeMissingDataRejected(t *testing.T) {
	service := settingAiModelService{}
	for _, value := range []req.SettingAiModelSaveReq{
		{Scope: "unknown"}, {Scope: "provider"}, {Scope: "provider", Providers: []req.SettingAiProviderConfigReq{}},
		{Scope: "ability"}, {Scope: "matting", ModelId: "koukoutu"},
		{Scope: "matting", ModelId: "koukoutu", MattingProviders: []req.SettingAiMattingProviderConfigReq{{Provider: "koukoutu", Label: "抠图", ApiKey: "synthetic"}}},
		{Scope: "provider", Providers: []req.SettingAiProviderConfigReq{{Label: "缺少标识"}}},
		{Scope: "ability", ImageAbilities: []req.SettingAiImageAbilityConfigReq{{Ability: "ocr", Label: "识别", Enabled: true}}},
	} {
		values, err := service.buildAiModelSaveValues(value, nil)
		if err == nil || len(values) != 0 {
			t.Fatalf("无效补丁必须在写入前拒绝: scope=%q", value.Scope)
		}
	}
}

// TestAiModelLegacyFullSaveCompatible 函数说明：省略 scope 保留旧全量保存的四项写入与默认模板行为。
func TestAiModelLegacyFullSaveCompatible(t *testing.T) {
	service := settingAiModelService{}
	fixture := aiScopeFixture("")
	fixture.MattingProviders = nil
	fixture.Providers = nil
	fixture.ImageAbilities = nil
	values, err := service.buildAiModelSaveValues(fixture, []aiMattingProviderConfig{{Provider: "koukoutu", Label: "原抠图", ApiKey: "synthetic-preserved"}})
	if err != nil {
		t.Fatal(err)
	}
	if len(values) != 4 || values[aiMattingModelConfigName] != "koukoutu" {
		t.Fatalf("旧全量模式不兼容: %v", reflect.ValueOf(values).MapKeys())
	}
	if values[aiMattingProviderConfigName] == "[]" {
		t.Fatal("旧客户端未传抠图配置时必须保留原值")
	}
	if values[aiProviderConfigName] == "[]" || values[aiImageAbilityConfigName] == "[]" {
		t.Fatal("旧全量模式继续保留原默认模板语义")
	}
}

// TestAiModelWriterStopsOnFailure 函数说明：写入失败立即返回错误，由调用处事务回滚已写键。
func TestAiModelWriterStopsOnFailure(t *testing.T) {
	writes := 0
	err := writeAiModelSaveValues(map[string]string{aiMattingModelConfigName: "koukoutu", aiMattingProviderConfigName: "[]"}, func(name, value string) error { writes++; return errors.New("synthetic write failure") })
	if err == nil || writes != 1 {
		t.Fatal("写入失败后不应继续写入其他配置")
	}
}
