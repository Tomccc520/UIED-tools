/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 */

const DANGEROUS_PROTOCOL_RE = /^(?:javascript|data|vbscript|file|blob):/i

/**
 * 函数说明：清理 URL 中可用于绕过协议检查的控制字符与空白。
 */
const compactAdvertisingUrl = (value: string): string => value.replace(/[\u0000-\u001f\u007f\s]+/g, '')

/**
 * 函数说明：标准化广告内的链接或素材地址，并拦截危险协议。
 */
export const normalizeSafeAdvertisingUrl = (value: unknown, fallback = ''): string => {
  const url = String(value || '').trim()
  if (!url) return fallback
  if (DANGEROUS_PROTOCOL_RE.test(compactAdvertisingUrl(url))) return fallback
  if (
    url.startsWith('/') ||
    url.startsWith('#') ||
    url.startsWith('?') ||
    /^(?:https?:)?\/\//i.test(url) ||
    /^mailto:/i.test(url) ||
    /^tel:/i.test(url)
  ) {
    return url
  }
  return fallback
}

/**
 * 函数说明：净化后台配置的 HTML 广告，移除脚本、事件属性与危险地址。
 */
export const sanitizeAdvertisingHtml = (value: unknown): string =>
  String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[\s\S]*?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+srcdoc\s*=\s*(["'])[\s\S]*?\1/gi, '')
    .replace(/\s+srcdoc\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+style\s*=\s*(["'])[^"']*(?:javascript|vbscript|file|blob|data)\s*:[^"']*\1/gi, '')
    .replace(
      /\s+(href|src|action|xlink:href)\s*=\s*(["'])\s*([^"']*?)\s*\2/gi,
      (_matched, attributeName: string, quote: string, rawUrl: string) => {
        const safeUrl = normalizeSafeAdvertisingUrl(rawUrl)
        return safeUrl ? ` ${attributeName}=${quote}${safeUrl}${quote}` : ''
      }
    )
    .replace(
      /\s+(href|src|action|xlink:href)\s*=\s*(?!["'])([^\s>]+)/gi,
      (_matched, attributeName: string, rawUrl: string) => {
        const safeUrl = normalizeSafeAdvertisingUrl(rawUrl)
        return safeUrl ? ` ${attributeName}="${safeUrl}"` : ''
      }
    )

/**
 * 函数说明：转义历史广告文本，防止迁移过程将普通文字解析为 HTML。
 */
const escapeAdvertisingHtml = (value: unknown): string =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * 函数说明：将历史角标、文案和渐变配置转换为等效 HTML 广告。
 */
export const buildLegacyAdvertisingHtml = (source: {
  badge: string
  text: string
  link: string
  gradient: string
}): string => {
  const safeLink = normalizeSafeAdvertisingUrl(source.link, '#')
  const gradient = /^linear-gradient\([a-z0-9#%(),.\s-]+\)$/i.test(source.gradient.trim())
    ? source.gradient.trim()
    : 'linear-gradient(to right,#e5e7eb,#f8fafc)'
  return `<a href="${escapeAdvertisingHtml(safeLink)}" target="_blank" rel="noopener noreferrer" style="display:flex;height:100%;align-items:center;justify-content:center;gap:8px;padding:0 16px;color:#111827;text-decoration:none;background:${escapeAdvertisingHtml(gradient)}"><span style="padding:2px 8px;background:rgba(255,255,255,.55);font-size:12px;font-weight:700">${escapeAdvertisingHtml(source.badge)}</span><strong style="font-size:15px">${escapeAdvertisingHtml(source.text)}</strong></a>`
}
