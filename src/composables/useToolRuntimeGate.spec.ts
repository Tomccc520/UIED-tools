/**
 * @file useToolRuntimeGate.spec.ts
 * @description 工具运行态门禁纯函数回归测试，覆盖链接安全与 query 工具 key 口径
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import { describe, expect, it } from 'vitest'
import {
  deriveRuntimeToolKeyByUrl,
  isInternalToolRuntimeLink,
  resolveToolRuntimeLinkKind
} from './useToolRuntimeGate'

describe('useToolRuntimeGate 纯函数', () => {
  it('保留 query 参数生成细分工具 toolKey，避免会员核心工具退化为基础工具', () => {
    expect(deriveRuntimeToolKeyByUrl('/tools/ai/work-summary?type=annual')).toBe('ai-work-summary-annual')
    expect(deriveRuntimeToolKeyByUrl('/tools/unit?active=length')).toBe('unit-active-length')
    expect(deriveRuntimeToolKeyByUrl('/tools/video/convert')).toBe('video-format-convert')
  })

  it('识别站内工具入口和安全链接类型', () => {
    expect(isInternalToolRuntimeLink('/tools/photo/background')).toBe(true)
    expect(isInternalToolRuntimeLink('https://fsuied.com')).toBe(false)
    expect(resolveToolRuntimeLinkKind('https://fsuied.com')).toBe('external')
    expect(resolveToolRuntimeLinkKind('javascript:alert(1)')).toBe('unsafe')
    expect(resolveToolRuntimeLinkKind('/tools/ai/toolbox')).toBe('internal')
  })
})
