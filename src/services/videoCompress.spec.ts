/**
 * @file videoCompress.spec.ts
 * @description 视频压缩响应头解析单元测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */

import { describe, expect, it } from 'vitest'
import { parseVideoCompressBoolean, parseVideoCompressFileName } from './videoCompress'

describe('视频压缩接口响应解析', () => {
  it('优先解析 UTF-8 下载文件名', () => {
    expect(
      parseVideoCompressFileName(
        "attachment; filename*=UTF-8''%E6%B5%8B%E8%AF%95_compressed.mp4",
        'fallback.mp4'
      )
    ).toBe('测试_compressed.mp4')
  })

  it('响应头缺失时使用回退文件名', () => {
    expect(parseVideoCompressFileName('', 'fallback.mp4')).toBe('fallback.mp4')
  })

  it('仅将 true 识别为已压缩', () => {
    expect(parseVideoCompressBoolean('true')).toBe(true)
    expect(parseVideoCompressBoolean('false')).toBe(false)
  })
})
