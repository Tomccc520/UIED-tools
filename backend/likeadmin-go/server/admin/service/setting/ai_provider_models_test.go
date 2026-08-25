/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package setting

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"likeadmin/admin/schemas/req"
)

// TestFetchProviderModels 函数说明：验证服务端会携带 Key 获取、过滤并排序 SiliconFlow 聊天模型。
func TestFetchProviderModels(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/v1/models" {
			t.Fatalf("模型地址不正确: %s", request.URL.Path)
		}
		if request.URL.Query().Get("type") != "text" || request.URL.Query().Get("sub_type") != "chat" {
			t.Fatalf("SiliconFlow 模型筛选参数不正确: %s", request.URL.RawQuery)
		}
		if request.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatal("模型接口未携带 Bearer Key")
		}
		writer.Header().Set("Content-Type", "application/json")
		_, _ = writer.Write([]byte(`{"object":"list","data":[{"id":"Qwen/Qwen3-8B","owned_by":"Qwen"},{"id":"deepseek-ai/DeepSeek-V3.2","owned_by":"DeepSeek"},{"id":"Qwen/Qwen3-8B","owned_by":"Qwen"}]}`))
	}))
	defer server.Close()

	service := settingAiModelService{}
	result, err := service.FetchProviderModels(req.SettingAiProviderModelsReq{
		Provider: "siliconflow",
		BaseURL:  server.URL + "/v1",
		ApiKey:   "test-key",
	})
	if err != nil {
		t.Fatalf("获取模型失败: %v", err)
	}
	if result.Total != 2 || result.Models[0].Value != "deepseek-ai/DeepSeek-V3.2" || result.Models[1].Value != "Qwen/Qwen3-8B" {
		t.Fatalf("模型去重排序结果不正确: %#v", result.Models)
	}
}

// TestFetchProviderModelsReportsUpstreamError 函数说明：验证上游鉴权失败会转换为可读错误且不会泄露 Key。
func TestFetchProviderModelsReportsUpstreamError(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.WriteHeader(http.StatusUnauthorized)
		_, _ = writer.Write([]byte(`{"error":{"message":"invalid api key"}}`))
	}))
	defer server.Close()

	service := settingAiModelService{}
	_, err := service.FetchProviderModels(req.SettingAiProviderModelsReq{
		Provider: "openai",
		BaseURL:  server.URL + "/v1",
		ApiKey:   "secret-test-key",
	})
	if err == nil || !strings.Contains(err.Error(), "HTTP 401") {
		t.Fatalf("应返回上游 401 错误: %v", err)
	}
	if strings.Contains(err.Error(), "secret-test-key") {
		t.Fatal("错误信息不应泄露 API Key")
	}
}

// TestBuildProviderModelsURL 函数说明：验证通用 Provider 地址不会附加 SiliconFlow 专用筛选参数。
func TestBuildProviderModelsURL(t *testing.T) {
	modelsURL, err := buildProviderModelsURL("deepseek", "https://api.deepseek.com/v1/")
	if err != nil {
		t.Fatalf("拼接模型地址失败: %v", err)
	}
	if modelsURL != "https://api.deepseek.com/v1/models" {
		t.Fatalf("模型地址不正确: %s", modelsURL)
	}
}
