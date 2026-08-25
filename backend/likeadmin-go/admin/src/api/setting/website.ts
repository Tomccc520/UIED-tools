import request from '@/utils/request'

/**
 * 函数说明：网站配置接口统一使用键值对载荷，后端已支持部分字段更新（PATCH 语义）
 */
export type WebsiteSettingPayload = Partial<Record<string, string>>

/**
 * 函数说明：工具主数据批量同步结果，用于后台页面回显当前已同步的分类、工具和策略覆盖数量。
 */
export interface WebsiteCatalogSyncResult {
    categoryCount: number
    subCategoryCount: number
    toolCount: number
    explicitToolKeyCount: number
    strategyFieldToolCount: number
    toolConsumeRuleCount: number
    force: boolean
    output: string
}

// 获取备案信息
export function getCopyright() {
    return request.get({ url: '/setting/copyright/detail' })
}
// 设置备案信息
export function setCopyright(params: any) {
    return request.post({ url: '/setting/copyright/save', params })
}
// 获取网站信息
export function getWebsite() {
    return request.get<WebsiteSettingPayload>({ url: '/setting/website/detail' })
}
// 设置网站信息
export function setWebsite(params: WebsiteSettingPayload) {
    return request.post<WebsiteSettingPayload>({ url: '/setting/website/save', params })
}

/**
 * 函数说明：触发前端工具主数据批量同步脚本，将高频工具的主数据和策略字段注入后台配置。
 */
export function syncWebsiteCatalogSeed(params: { force: 0 | 1; syncToolConsumeRules?: 0 | 1 }) {
    return request.post<WebsiteCatalogSyncResult>({ url: '/setting/website/catalog/sync', params })
}

// 获取政策协议
export function getProtocol() {
    return request.get({ url: '/setting/protocol/detail' })
}
// 设置政策协议
export function setProtocol(params: any) {
    return request.post({ url: '/setting/protocol/save', params })
}
