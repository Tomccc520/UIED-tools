import request from '@/utils/request'

// 用户列表
export function getUserList(params: any) {
    return request.get({ url: '/user/list', params })
}

// 用户详情
export function getUserDetail(params: any) {
    return request.get({ url: '/user/detail', params })
}

// 用户编辑
export function userEdit(params: any) {
    return request.post({ url: '/user/edit', params })
}

// 订单列表
export function getOrderList(params: any) {
    return request.get({ url: '/order/list', params })
}

// 订单导出
export function exportOrderList(params: any) {
    return request.get({ url: '/order/export', params })
}

// 支付回调审计列表
export function getOrderCallbackAuditList(params: any) {
    return request.get({ url: '/order/callback_audit/list', params })
}

// 订单交付联动统计
export function getOrderLinkageSummary() {
    return request.get({ url: '/order/linkage_summary' })
}

// 订单补单
export function reissueOrder(params: any) {
    return request.post({ url: '/order/reissue', params })
}

// 订单关闭
export function closeOrder(params: any) {
    return request.post({ url: '/order/close', params })
}

// 订单交付保存
export function saveOrderDelivery(params: any) {
    return request.post({ url: '/order/delivery/save', params })
}

// 订单下载链接检测
export function checkOrderDownload(params: any) {
    return request.post({ url: '/order/check_download', params })
}
