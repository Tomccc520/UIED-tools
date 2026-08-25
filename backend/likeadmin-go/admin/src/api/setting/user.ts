import request from '@/utils/request'

/**
 * @return { Promise }
 * @description 获取用户设置
 */
export function getUserSetup() {
    return request.get({ url: '/setting/user/detail' })
}

/**
 * @return { Promise }
 * @param { string } defaultAvatar 默认用户头像
 * @description 设置用户设置
 */
export function setUserSetup(params: { defaultAvatar: string }) {
    return request.post({ url: '/setting/user/save', params })
}

/**
 * @return { Promise }
 * @description 设置登录注册规则
 */
export function getLogin() {
    return request.get({ url: '/setting/login/detail' })
}

export interface LoginSetup {
    frontendLoginEnabled: number // 前台登录总开关 0/1
    loginWay: number[] | any // 登录方式, 逗号隔开
    forceBindMobile: number // 强制绑定手机 0/1
    openAgreement: number // 是否开启协议 0/1
    openOtherAuth: number // 第三方登录 0/1
    autoLoginAuth: number[] | any // 第三方自动登录 逗号隔开
    openWechatAuth: number // 微信登录开关 0/1
    openQqAuth: number // QQ登录开关 0/1
    wechatAppId: string // 微信开放平台 AppID
    wechatAppSecret: string // 微信开放平台 AppSecret
    wechatRedirectUrl: string // 微信回调地址
    qqAppId: string // QQ互联 AppID
    qqAppKey: string // QQ互联 AppKey
    qqRedirectUrl: string // QQ回调地址
    userCenterEnabled: number // 用户中心开关 0/1
    userCenterTitle: string // 用户中心入口文案
    userCenterLink: string // 用户中心入口链接
    dailyGiftPoints: number // 每日赠送积分
    toolConsumePoints: number // 单次工具消耗积分
    toolConsumeRules: any[] | string // 按工具计费规则（数组或 JSON 字符串）
    consumeRiskRules: any | string // 工具调用风控规则（对象或 JSON 字符串）
    memberEnabled: number // 会员功能开关 0/1
    memberTrialDays: number // 新用户会员试用天数
    memberPlans: any[] | string // 会员套餐配置（数组或 JSON 字符串）
    pointsPacks: any[] | string // 积分包配置（数组或 JSON 字符串）
    memberRightsIntro: string // 会员权益说明
    paymentChannels: string[] | any // 支付渠道（mock/wechat_h5/alipay_h5）
    paymentWechatUrl: string // 微信支付跳转地址
    paymentWechatCreateApi: string // 微信服务端下单接口地址
    paymentWechatMchId: string // 微信支付商户号（mchid）
    paymentWechatAppId: string // 微信支付 AppID
    paymentWechatSerialNo: string // 微信支付商户证书序列号（serial_no）
    paymentWechatApiV3Key: string // 微信支付 APIv3 密钥
    paymentWechatPrivateKey: string // 微信支付商户私钥（PEM）
    paymentWechatPlatformCert: string // 微信支付平台证书（PEM，可选）
    paymentWechatPlatformSerialNo: string // 微信平台证书序列号（自动同步）
    paymentWechatPlatformEffectiveTime: string // 微信平台证书生效时间（自动同步）
    paymentWechatPlatformExpireTime: string // 微信平台证书到期时间（自动同步）
    paymentWechatPlatformSyncedAt: number // 微信平台证书最近同步时间戳（秒）
    paymentWechatNotifyUrl: string // 微信支付回调地址
    paymentAlipayUrl: string // 支付宝支付跳转地址
    paymentAlipayCreateApi: string // 支付宝服务端下单接口地址
    paymentCallbackSecret: string // 支付回调签名密钥
    paymentRequestSecret: string // 支付请求签名密钥
    paymentRequestAuthType: string // 支付网关鉴权模式（none/bearer/header）
    paymentRequestHeader: string // 支付网关自定义鉴权请求头
    paymentRequestToken: string // 支付网关鉴权令牌
    paymentRequestTimeout: number // 支付网关下单请求超时（秒）
    adminLoginCaptchaOn: number // 后台登录验证码开关 0/1
    adminLoginFailLimit: number // 后台登录失败锁定阈值（次数）
    adminLoginFailWindow: number // 后台登录失败锁定窗口（秒）
}
/**
 * @return { Promise }
 * @param { LoginSetup } LoginSetup
 * @description 设置登录注册规则
 */
export function setLogin(params: LoginSetup) {
    return request.post({ url: '/setting/login/save', params })
}

/**
 * @return { Promise }
 * @description 微信支付V3：自动拉取平台证书并写回后台配置
 */
export function syncWechatPlatformCert() {
    return request.post({ url: '/setting/login/wechat/cert/sync' })
}
