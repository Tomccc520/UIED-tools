/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-11
 */

/** 解析有效的 HTTP(S) 预览页面，拒绝危险协议、缺失主机或包含登录凭据的地址。 */
const parsePreviewHttpUrl = (value: string, baseUrl: string): URL | undefined => {
    try {
        const parsed = new URL(value, baseUrl)
        if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) return
        return parsed
    } catch {
        return undefined
    }
}

/** 读取明确配置的站点地址，允许同域绝对路径，不把无协议域名误当作管理端相对路径。 */
const parseConfiguredPreviewUrl = (value: unknown, origin: string): URL | undefined => {
    const candidate = String(value || '').trim()
    if (!/^https?:\/\//i.test(candidate) && !candidate.startsWith('/')) return
    return parsePreviewHttpUrl(candidate, origin)
}

/**
 * 函数说明：解析前端预览地址，环境变量和后台配置优先；仅本机开发后台缺省时切换到主站端口。
 * 参数：配置对象与工具路径，或直接传入工具路径；返回经过协议和主机校验的完整预览地址。
 */
export const resolveToolsPreviewUrl = (
    configOrPath: Record<string, any> | string = {},
    path = ''
): string => {
    const config =
        configOrPath && typeof configOrPath === 'object' && !Array.isArray(configOrPath) ? configOrPath : {}
    const targetPath =
        typeof configOrPath === 'string' ? String(configOrPath || '').trim() : String(path || '').trim()
    const origin = window.location.origin
    const configuredUrl = [import.meta.env.VITE_TOOLS_PREVIEW_URL, config.webUrl, config.web_url, config.web]
        .map(candidate => parseConfiguredPreviewUrl(candidate, origin))
        .find((candidate): candidate is URL => Boolean(candidate))
    const baseUrl = configuredUrl || new URL(origin)
    if (!configuredUrl && import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname) && baseUrl.port === '5180') {
        baseUrl.port = '5179'
    }
    const directoryBase = new URL(baseUrl.toString())
    if (!directoryBase.pathname.endsWith('/')) directoryBase.pathname += '/'
    const targetUrl = targetPath ? parsePreviewHttpUrl(targetPath, directoryBase.toString()) || baseUrl : baseUrl
    if (targetUrl.origin === baseUrl.origin) targetUrl.searchParams.set('_uied_preview', '1')
    return targetUrl.toString()
}
