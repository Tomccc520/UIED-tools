import request from '@/utils/request'

// 配置
export function getConfig() {
    return request.get({ url: '/common/index/config' })
}

/** 函数说明：读取工作台统计，十秒超时后交由页面重试，避免后台自动重复等待。 */
export function getWorkbench() {
    return request.get({ url: '/common/index/console', timeout: 10000 }, { isOpenRetry: false })
}
