/**
 * @file userAgent.spec.ts
 * @description User Agent 解析单元测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

import { describe, expect, it } from 'vitest'
import { parseUserAgent } from './userAgent'

describe('User Agent 解析', () => {
  it('优先识别 Chromium Edge 而不是 Chrome', () => {
    const result = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.42'
    )

    expect(result.browser).toEqual({ name: 'Edge', version: '128.0.2739.42' })
    expect(result.os).toEqual({ name: 'Windows', version: '10.0' })
    expect(result.engine.name).toBe('Blink')
  })

  it('读取 Safari 的 Version 版本号', () => {
    const result = parseUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15'
    )

    expect(result.browser).toEqual({ name: 'Safari', version: '17.6' })
    expect(result.os).toEqual({ name: 'macOS', version: '14.6' })
    expect(result.engine.name).toBe('WebKit')
  })

  it('识别 iPhone 上的 Chrome 和 iOS', () => {
    const result = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1'
    )

    expect(result.browser).toEqual({ name: 'Chrome', version: '126.0.6478.54' })
    expect(result.os).toEqual({ name: 'iOS', version: '17.5' })
    expect(result.device).toEqual({ type: 'Mobile', vendor: 'Apple', model: 'iPhone' })
  })

  it('识别 Firefox 和 Gecko 引擎', () => {
    const result = parseUserAgent(
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0'
    )

    expect(result.browser).toEqual({ name: 'Firefox', version: '129.0' })
    expect(result.os.name).toBe('Linux')
    expect(result.engine).toEqual({ name: 'Gecko', version: '129.0' })
  })
})
