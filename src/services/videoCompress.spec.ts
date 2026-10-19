/**
 * @file videoCompress.spec.ts
 * @description 视频压缩响应头解析单元测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import {
  compressVideoWithServer,
  parseVideoCompressBoolean,
  parseVideoCompressFileName,
  VIDEO_COMPRESS_REQUEST_TIMEOUT_MS
} from './videoCompress'

afterEach(() => vi.restoreAllMocks())

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

  it('视频压缩请求必须有有限超时，避免异常连接无限等待', () => {
    expect(VIDEO_COMPRESS_REQUEST_TIMEOUT_MS).toBeGreaterThan(10 * 60 * 1000)
    expect(VIDEO_COMPRESS_REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(11 * 60 * 1000)
  })

  it.each([
    { blob: new Blob([]), type: 'video/mp4' },
    { blob: new Blob(['<html>gateway error</html>']), type: 'text/html' }
  ])('空响应或网关 HTML 不得作为视频下载', async ({ blob, type }) => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: blob, headers: { 'content-type': type } })
    await expect(compressVideoWithServer(new File(['source'], 'sample.mp4'))).rejects.toThrow('未返回有效视频')
  })
})
