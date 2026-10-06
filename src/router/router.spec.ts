/**
 * @file router.spec.ts
 * @description 前台异常路径与账号路由语义回归测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-04
 */

import { describe, expect, it } from 'vitest'
import router from './index'

describe('前台异常路由', () => {
  it('未知路径命中统一 404 路由', () => {
    const resolved = router.resolve('/no-such-qa-xyz')
    expect(resolved.matched.some((record) => record.name === 'Any')).toBe(true)
    expect(resolved.matched.at(-1)?.redirect).toBe('/404')
  })

  it('登录路由明确跳转到账号功能未开放的 404 页面', () => {
    const resolved = router.resolve('/login')
    expect(resolved.matched.at(-1)?.name).toBe('loginUnavailable')
    expect(resolved.matched.at(-1)?.redirect).toBe('/404')
  })

  it('注册路由明确跳转到账号功能未开放的 404 页面', () => {
    const resolved = router.resolve('/register')
    expect(resolved.matched.at(-1)?.name).toBe('registerUnavailable')
    expect(resolved.matched.at(-1)?.redirect).toBe('/404')
  })

  it('404 页面标记为 noindex，避免错误页进入搜索索引', () => {
    const resolved = router.resolve('/404')
    expect(resolved.meta.robots).toBe('noindex,nofollow')
  })
})
