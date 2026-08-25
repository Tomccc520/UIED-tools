/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
package setting

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"likeadmin/admin/schemas/req"
	"likeadmin/admin/schemas/resp"
	"likeadmin/core/response"
)

const providerModelsResponseLimit = 4 << 20

type providerModelsUpstreamResp struct {
	Data []struct {
		ID      string `json:"id"`
		OwnedBy string `json:"owned_by"`
	} `json:"data"`
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
	Message string `json:"message"`
}

// FetchProviderModels 函数说明：通过 Provider 的 OpenAI 兼容模型接口获取当前 Key 可用的真实模型列表。
func (aSrv settingAiModelService) FetchProviderModels(fetchReq req.SettingAiProviderModelsReq) (res resp.SettingAiProviderModelsResp, e error) {
	provider := strings.ToLower(strings.TrimSpace(fetchReq.Provider))
	baseURL, apiKey, err := aSrv.resolveProviderModelCredentials(provider, fetchReq.BaseURL, fetchReq.ApiKey)
	if err != nil {
		return res, err
	}
	modelsURL, err := buildProviderModelsURL(provider, baseURL)
	if err != nil {
		return res, err
	}

	request, err := http.NewRequest(http.MethodGet, modelsURL, nil)
	if err != nil {
		return res, response.AssertArgumentError.Make("模型接口地址无效")
	}
	request.Header.Set("Authorization", "Bearer "+apiKey)
	request.Header.Set("Accept", "application/json")
	request.Header.Set("User-Agent", "UIED-Tools/3.0.1")

	client := &http.Client{Timeout: 20 * time.Second}
	upstreamResp, err := client.Do(request)
	if err != nil {
		return res, response.AssertArgumentError.Make("获取模型失败，请检查 Base URL、网络或 Provider 状态")
	}
	defer upstreamResp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(upstreamResp.Body, providerModelsResponseLimit))
	if err != nil {
		return res, response.AssertArgumentError.Make("读取 Provider 模型响应失败")
	}

	var payload providerModelsUpstreamResp
	if err = json.Unmarshal(body, &payload); err != nil {
		return res, response.AssertArgumentError.Make("Provider 模型接口返回了无法识别的数据")
	}
	if upstreamResp.StatusCode < http.StatusOK || upstreamResp.StatusCode >= http.StatusMultipleChoices {
		message := strings.TrimSpace(payload.Error.Message)
		if message == "" {
			message = strings.TrimSpace(payload.Message)
		}
		if message == "" {
			message = http.StatusText(upstreamResp.StatusCode)
		}
		return res, response.AssertArgumentError.Make(fmt.Sprintf("Provider 获取模型失败（HTTP %d）：%s", upstreamResp.StatusCode, message))
	}

	models := make([]resp.SettingAiProviderModelOptionResp, 0, len(payload.Data))
	seen := make(map[string]struct{}, len(payload.Data))
	for _, item := range payload.Data {
		modelID := strings.TrimSpace(item.ID)
		if modelID == "" {
			continue
		}
		key := strings.ToLower(modelID)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		desc := "Provider 当前 Key 可用模型"
		if owner := strings.TrimSpace(item.OwnedBy); owner != "" {
			desc = "模型所有者：" + owner
		}
		models = append(models, resp.SettingAiProviderModelOptionResp{
			Label:     modelID,
			Value:     modelID,
			Desc:      desc,
			MaxTokens: defaultAiProviderMaxTokens,
		})
	}
	sort.SliceStable(models, func(i, j int) bool {
		return strings.ToLower(models[i].Value) < strings.ToLower(models[j].Value)
	})
	if len(models) == 0 {
		return res, response.AssertArgumentError.Make("Provider 未返回可用模型，请确认 Key 权限")
	}

	return resp.SettingAiProviderModelsResp{
		Provider: provider,
		Total:    len(models),
		Models:   models,
	}, nil
}

// resolveProviderModelCredentials 函数说明：优先使用管理端未保存的配置，缺失时回退数据库中的 Provider 配置。
func (aSrv settingAiModelService) resolveProviderModelCredentials(provider string, rawBaseURL string, rawAPIKey string) (string, string, error) {
	if provider == "" {
		return "", "", response.AssertArgumentError.Make("Provider 不能为空")
	}
	baseURL := strings.TrimSpace(rawBaseURL)
	apiKey := strings.TrimSpace(rawAPIKey)
	if baseURL == "" || apiKey == "" {
		providers, err := aSrv.getProviderConfigs()
		if err != nil {
			return "", "", err
		}
		for _, item := range providers {
			if strings.EqualFold(strings.TrimSpace(item.Provider), provider) {
				if baseURL == "" {
					baseURL = strings.TrimSpace(item.BaseURL)
				}
				if apiKey == "" {
					apiKey = strings.TrimSpace(item.ApiKey)
				}
				break
			}
		}
	}
	if baseURL == "" {
		return "", "", response.AssertArgumentError.Make("请先填写 Provider Base URL")
	}
	if apiKey == "" {
		return "", "", response.AssertArgumentError.Make("请先填写 Provider API Key")
	}
	return baseURL, apiKey, nil
}

// buildProviderModelsURL 函数说明：拼接 OpenAI 兼容的 /models 地址，并为 SiliconFlow 限定文本聊天模型。
func buildProviderModelsURL(provider string, baseURL string) (string, error) {
	parsed, err := url.Parse(strings.TrimSpace(baseURL))
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return "", response.AssertArgumentError.Make("Provider Base URL 需为有效的 HTTP(S) 地址")
	}
	path := strings.TrimRight(parsed.Path, "/")
	if !strings.HasSuffix(strings.ToLower(path), "/models") {
		path += "/models"
	}
	parsed.Path = path
	parsed.RawQuery = ""
	parsed.Fragment = ""
	if provider == "siliconflow" {
		query := parsed.Query()
		query.Set("type", "text")
		query.Set("sub_type", "chat")
		parsed.RawQuery = query.Encode()
	}
	return parsed.String(), nil
}
