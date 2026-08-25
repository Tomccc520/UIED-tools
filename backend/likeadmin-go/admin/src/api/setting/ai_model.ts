/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-21
 */

import request from '@/utils/request'

export interface AiModelOption {
    modelId: string
    name: string
    description: string
    isDefault: boolean
}

export interface AiModelCurrent {
    modelId: string
    modelName: string
    available: boolean
    description: string
}

export interface AiMattingProviderConfig {
    provider: 'aliyun' | 'koukoutu'
    label: string
    description: string
    apiUrl: string
    apiKey: string
    accessKeyId: string
    accessKeySecret: string
    endpoint: string
    timeoutSeconds: number
    available: boolean
}

export interface AiProviderModelOption {
    label: string
    value: string
    desc: string
    maxTokens: number
}

export interface AiProviderConfig {
    provider: string
    label: string
    description: string
    enabled: boolean
    isDefault: boolean
    baseUrl: string
    apiKey: string
    defaultModel: string
    models: AiProviderModelOption[]
}

export interface AiProviderCurrent {
    available: boolean
    scene: string
    provider: string
    label: string
    description: string
    defaultModel: string
    models: AiProviderModelOption[]
}

export interface AiProviderModelsResult {
    provider: string
    total: number
    models: AiProviderModelOption[]
}

export interface AiImageAbilityConfig {
    ability: string
    label: string
    description: string
    enabled: boolean
    method: 'GET' | 'POST'
    upstreamUrl: string
    apiKeyHeader: string
    apiKey: string
    timeoutSeconds: number
}

export interface AiModelDetail {
    currentModelId: string
    current: AiModelCurrent
    supported: AiModelOption[]
    mattingProviders: AiMattingProviderConfig[]
    providerCurrent: AiProviderCurrent
    providers: AiProviderConfig[]
    imageAbilities: AiImageAbilityConfig[]
}

/**
 * 函数说明：获取 AI 抠图 API Provider 配置详情。
 */
export function getAiModelDetail() {
    return request.get<AiModelDetail>({ url: '/setting/ai/model/detail' })
}

/**
 * 函数说明：保存 AI 抠图 API Provider、文本 Provider 与图片 AI 能力配置。
 */
export function saveAiModel(params: {
    modelId: string
    mattingProviders: AiMattingProviderConfig[]
    providers: AiProviderConfig[]
    imageAbilities: AiImageAbilityConfig[]
}) {
    return request.post({ url: '/setting/ai/model/save', params })
}

/**
 * 函数说明：通过服务端使用 Provider Base URL 与 API Key 获取当前账号可用模型。
 */
export function fetchAiProviderModels(params: { provider: string; baseUrl: string; apiKey: string }) {
    return request.post<AiProviderModelsResult>({ url: '/setting/ai/provider/models', params })
}
