import config from '@/config'
import request from '@/utils/request'

export interface AdminProfileUpdateResult {
    passwordChanged: boolean
}

// 获取登录验证码
export function getLoginCaptcha() {
    return request.get({ url: '/system/captcha' }, { withToken: false })
}

// 登录
export function login(params: Record<string, any>) {
    return request.post({ url: '/system/login', params: { ...params, terminal: config.terminal } })
}

// 退出登录
export function logout() {
    return request.post({ url: '/system/logout' })
}

// 用户信息
export function getUserInfo() {
    return request.get({ url: '/system/admin/self' })
}

// 菜单路由
export function getMenu() {
    return request.get({ url: '/system/menu/route' })
}

// 编辑管理员信息
export function setUserInfo(params: any) {
    return request.post<AdminProfileUpdateResult>({ url: '/system/admin/upInfo', params })
}
