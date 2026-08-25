/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-11
 */

/**
 * 函数说明：解析前端预览地址，优先读取环境变量与后台配置，避免写死本地端口导致生产不可用。
 */
export const resolveToolsPreviewUrl = (
    configOrPath: Record<string, any> | string = {},
    path = ''
): string => {
    const envPreviewUrl = String(import.meta.env.VITE_TOOLS_PREVIEW_URL || '').trim()
    const config =
        typeof configOrPath === 'string' || Array.isArray(configOrPath) ? {} : configOrPath
    const configPreviewUrl = String(config.webUrl || config.web_url || config.web || '').trim()
    const candidate = envPreviewUrl || configPreviewUrl
    const targetPath =
        typeof configOrPath === 'string' ? String(configOrPath || '').trim() : String(path || '').trim()

    let baseUrl = window.location.origin
    if (candidate) {
        if (/^https?:\/\//i.test(candidate)) {
            baseUrl = candidate
        } else if (candidate.startsWith('/')) {
            baseUrl = `${window.location.origin}${candidate}`
        }
    }

    if (!targetPath) {
        return baseUrl
    }
    return new URL(targetPath, `${baseUrl.replace(/\/+$/g, '')}/`).toString()
}
