/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { chromium } from 'playwright'

/** 仅允许本机测试服务，防止默认测试账号或故障注入脚本误用于线上。 */
const requireLocal = (value) => {
    const url = new URL(value)
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)) throw new Error('此验收仅允许本机地址')
    return value.replace(/\/+$/, '')
}

/** 沿用项目既有本地 API 登录流程，凭据只保留在浏览器内存，不输出或写入验收产物。 */
export const createLocalAdminSession = async (viewport = { width: 1440, height: 1080 }) => {
    const baseUrl = requireLocal(process.env.ADMIN_SMOKE_BASE_URL || 'http://127.0.0.1:5180')
    const apiUrl = requireLocal(process.env.ADMIN_SMOKE_API_BASE_URL || 'http://127.0.0.1:8003')
    const captcha = (await (await fetch(apiUrl + '/api/system/captcha')).json()).data
    const svg = Buffer.from(captcha.captchaImage?.split(',').pop() || '', 'base64').toString()
    const code = [...svg.matchAll(/<text\b[^>]*>(.*?)<\/text>/gi)].map(match => match[1].trim()).join('').toUpperCase()
    const response = await (await fetch(apiUrl + '/api/system/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || '123456', terminal: 1, captchaKey: captcha.captchaKey, captchaCode: code }) })).json()
    if (response.code !== 200 || !response.data?.token) throw new Error('本地测试登录失败')
    const token = response.data.token
    const browser = await chromium.launch({ channel: process.env.ADMIN_BROWSER_CHANNEL || 'chrome', headless: true })
    const context = await browser.newContext({ viewport })
    await context.addInitScript(value => localStorage.setItem('like_admin_token', JSON.stringify({ value, expire: '' })), token)
    const page = await context.newPage()
    /** 对本机 API 发起已登录读取，不暴露 Token 给日志。 */
    const readApi = async path => {
        const result = await (await fetch(apiUrl + path, { headers: { token } })).json()
        if (result.code !== 200) throw new Error('本地 API 读取失败：' + path)
        return result.data
    }
    return { browser, context, page, baseUrl, readApi }
}
