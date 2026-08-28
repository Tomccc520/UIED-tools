/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
import request from '@/utils/request'

export interface AdvertisingItem {
    renderMode: 'image' | 'html'
    text: string
    image: string
    htmlCode: string
    link: string
    target: '_self' | '_blank'
    height: number
}

export interface AdvertisingHotToolItem {
    title: string
    desc: string
    link: string
}

export interface AdvertisingDetail {
    items: AdvertisingItem[]
    total: number
    hotTools: AdvertisingHotToolItem[]
    hotToolsTotal: number
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
export function saveAdvertising(items: AdvertisingItem[], hotTools: AdvertisingHotToolItem[]) {
    return request.post<AdvertisingDetail>({ url: '/operation/advertising/save', params: { items, hotTools } })
}
