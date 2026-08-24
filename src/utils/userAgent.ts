/**
 * @file userAgent.ts
 * @description 浏览器 User Agent 基础解析能力
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

export interface UserAgentInfo {
  browser: { name: string; version: string }
  os: { name: string; version: string }
  device: { type: string; vendor: string; model: string }
  engine: { name: string; version: string }
}

/**
 * 函数说明：从 User Agent 中提取第一个匹配到的版本号。
 */
const resolveVersion = (userAgent: string, pattern: RegExp): string => {
  return userAgent.match(pattern)?.[1] || ''
}

/**
 * 函数说明：解析常见桌面端和移动端 User Agent，返回浏览器、系统、设备与渲染引擎信息。
 */
export const parseUserAgent = (userAgent: string): UserAgentInfo => {
  const ua = String(userAgent || '')
  const result: UserAgentInfo = {
    browser: { name: 'Unknown', version: '' },
    os: { name: 'Unknown', version: '' },
    device: { type: /Mobile|Android|iPhone|iPad/i.test(ua) ? 'Mobile' : 'Desktop', vendor: '', model: '' },
    engine: { name: '', version: '' }
  }

  const browserRules = [
    { name: 'Edge', pattern: /(?:Edg|EdgA|EdgiOS)\/([\d.]+)/ },
    { name: 'Opera', pattern: /OPR\/([\d.]+)/ },
    { name: 'Firefox', pattern: /(?:Firefox|FxiOS)\/([\d.]+)/ },
    { name: 'Chrome', pattern: /(?:Chrome|CriOS)\/([\d.]+)/ },
    { name: 'Safari', pattern: /Version\/([\d.]+).*Safari\// }
  ]
  const browserRule = browserRules.find((rule) => rule.pattern.test(ua))
  if (browserRule) {
    result.browser.name = browserRule.name
    result.browser.version = resolveVersion(ua, browserRule.pattern)
  }

  if (/iPhone|iPad|iPod/i.test(ua)) {
    result.os.name = 'iOS'
    result.os.version = resolveVersion(ua, /(?:CPU (?:iPhone )?OS|iPhone OS) ([\d_]+)/).replace(/_/g, '.')
    result.device.vendor = 'Apple'
    result.device.model = /iPad/i.test(ua) ? 'iPad' : /iPod/i.test(ua) ? 'iPod' : 'iPhone'
  } else if (/Android/i.test(ua)) {
    result.os.name = 'Android'
    result.os.version = resolveVersion(ua, /Android ([\d.]+)/)
  } else if (/Windows NT/i.test(ua)) {
    result.os.name = 'Windows'
    result.os.version = resolveVersion(ua, /Windows NT ([\d.]+)/)
  } else if (/Mac OS X/i.test(ua)) {
    result.os.name = 'macOS'
    result.os.version = resolveVersion(ua, /Mac OS X ([\d_]+)/).replace(/_/g, '.')
  } else if (/Linux/i.test(ua)) {
    result.os.name = 'Linux'
  }

  if (/AppleWebKit\/([\d.]+)/i.test(ua)) {
    result.engine.name = /(?:Chrome|CriOS|Edg|EdgA|OPR)\//.test(ua) ? 'Blink' : 'WebKit'
    result.engine.version = resolveVersion(ua, /AppleWebKit\/([\d.]+)/i)
  } else if (/Gecko\/\d/i.test(ua)) {
    result.engine.name = 'Gecko'
    result.engine.version = resolveVersion(ua, /rv:([\d.]+)/i)
  }

  return result
}
