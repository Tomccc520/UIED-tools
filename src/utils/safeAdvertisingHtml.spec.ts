/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 */
import { describe, expect, it } from 'vitest'
import { buildLegacyAdvertisingHtml, sanitizeAdvertisingHtml } from './safeAdvertisingHtml'

describe('safeAdvertisingHtml', () => {
  it('会移除脚本、事件属性和危险协议', () => {
    const result = sanitizeAdvertisingHtml(
      '<script>alert(1)</script><a href="javascript:alert(1)" style="background:url(javascript:alert(2))"><img src="/ad.png" onerror="alert(2)"></a>'
    )
    expect(result).not.toContain('<script')
    expect(result).not.toContain('javascript:')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('background:url')
    expect(result).toContain('src="/ad.png"')
  })

  it('会安全转义历史文字广告', () => {
    const result = buildLegacyAdvertisingHtml({
      badge: '<推荐>',
      text: 'UIED <img src=x>',
      link: 'https://fsuied.com',
      gradient: 'linear-gradient(to right,#111,#fff)'
    })
    expect(result).toContain('&lt;推荐&gt;')
    expect(result).not.toContain('<img src=x>')
    expect(result).toContain('https://fsuied.com')
  })
})
