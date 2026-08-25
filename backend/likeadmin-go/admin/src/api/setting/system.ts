import request from '@/utils/request'

// 获取系统环境
export function systemInfo() {
    return request.get({ url: '/monitor/server' })
}

/**
 * 函数说明：兼容历史后端接口，部分环境仍使用 setting/system/environment 返回监控数据。
 */
export function systemInfoLegacy() {
    return request.get({ url: '/setting/system/environment' })
}

// 获取系统日志列表
export function systemLogLists(params: any) {
    return request.get({ url: '/system/log/operate', params })
}

// 系统缓存监控
export function systemCache() {
    return request.get({ url: '/monitor/cache' })
}
