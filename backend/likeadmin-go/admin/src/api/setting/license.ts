import request from '@/utils/request'

export interface LicenseSettingPayload {
    licenseKey: string
    customerName: string
    contactName: string
    contactMobile: string
    contactEmail: string
    productCode: string
    boundDomain: string
    machineCode: string
    expireTime: number
    remark: string
    enforce: number
    verifyApiUrl: string
    verifyApiToken: string
    verifyApiMethod: string
    verifyApiTimeout: number
    verifyApiAllowInsecureTls: number
    apiSignSecret: string
}

export interface LicenseVerifyPayload {
    forceRemote?: number
}

// 获取授权配置详情
export function getLicenseDetail() {
    return request.get({ url: '/setting/license/detail' })
}

// 保存授权配置
export function saveLicenseDetail(params: LicenseSettingPayload) {
    return request.post({ url: '/setting/license/save', params })
}

// 执行授权校验
export function verifyLicense(params: LicenseVerifyPayload = {}) {
    return request.post({ url: '/setting/license/verify', params })
}
