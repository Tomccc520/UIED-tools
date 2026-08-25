/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import request from '@/utils/request'

export type ToolRankingPeriod = 'day' | 'week' | 'month' | 'all'
export type ToolRankingSortBy = 'score' | 'view' | 'start' | 'success' | 'download'

export interface ToolRankingManageParams {
    pageNo?: number
    pageSize?: number
    keyword?: string
    cateTitle?: string
    period?: ToolRankingPeriod
    sortBy?: ToolRankingSortBy
}

export interface ToolRankingManageSummary {
    period: ToolRankingPeriod
    toolCount: number
    cateCount: number
    viewCount: number
    startCount: number
    successCount: number
    downloadCount: number
    champion: Record<string, any>
    updatedAt: number
}

export interface ToolRankingManageTrend {
    period: ToolRankingPeriod
    sortBy: ToolRankingSortBy
    startDate: string
    endDate: string
    labels: string[]
    viewSeries: number[]
    startSeries: number[]
    successSeries: number[]
    downloadSeries: number[]
    scoreSeries: number[]
}

export interface ToolRankingExportRow {
    rank: number
    toolKey: string
    toolTitle: string
    toolUrl: string
    cateTitle: string
    viewCount: number
    startCount: number
    successCount: number
    downloadCount: number
    score: number
}

export interface ToolRankingExportResult {
    fileName: string
    period: ToolRankingPeriod
    sortBy: ToolRankingSortBy
    exportedAt: number
    list: ToolRankingExportRow[]
}

export interface ToolRankingConfigDetail {
    enabled: number
    pageTitle: string
    pageDescription: string
    defaultPeriod: ToolRankingPeriod
    pageLimit: number
    showOnSidebar: number
    sidebarTitle: string
    sidebarPeriod: ToolRankingPeriod
}

/**
 * 函数说明：读取后台工具热榜管理列表。
 */
export function getToolRankingManageList(params: ToolRankingManageParams) {
    return request.get({ url: '/setting/tool-ranking/list', params })
}

/**
 * 函数说明：读取后台工具热榜顶部概览统计。
 */
export function getToolRankingManageSummary() {
    return request.get<ToolRankingManageSummary>({ url: '/setting/tool-ranking/summary' })
}

/**
 * 函数说明：读取后台工具热榜趋势图数据。
 */
export function getToolRankingManageTrend(params: ToolRankingManageParams) {
    return request.get<ToolRankingManageTrend>({ url: '/setting/tool-ranking/trend', params })
}

/**
 * 函数说明：导出后台工具热榜当前筛选结果。
 */
export function exportToolRankingManage(params: ToolRankingManageParams) {
    return request.get<ToolRankingExportResult>({ url: '/setting/tool-ranking/export', params })
}

/**
 * 函数说明：读取工具热榜榜单配置详情。
 */
export function getToolRankingConfigDetail() {
    return request.get<ToolRankingConfigDetail>({ url: '/setting/tool-ranking/config/detail' })
}

/**
 * 函数说明：保存工具热榜榜单配置。
 */
export function saveToolRankingConfigDetail(params: ToolRankingConfigDetail) {
    return request.post({ url: '/setting/tool-ranking/config/save', params })
}
