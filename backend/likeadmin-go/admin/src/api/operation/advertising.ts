/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
import request from '@/utils/request'

export interface AdvertisingItem {
    badge: string
    text: string
    link: string
    gradient: string
}

export interface AdvertisingDetail {
    items: AdvertisingItem[]
    total: number
}

/**
 * 函数说明：读取运营广告管理配置。
 */
export function getAdvertisingDetail() {
    return request.get<AdvertisingDetail>({ url: '/operation/advertising/detail' })
}

/**
 * 函数说明：保存运营广告列表并返回最新配置。
 */
export function saveAdvertising(items: AdvertisingItem[]) {
    return request.post<AdvertisingDetail>({ url: '/operation/advertising/save', params: { items } })
}
