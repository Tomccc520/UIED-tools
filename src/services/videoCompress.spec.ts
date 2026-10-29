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

  it.each([
    ['attachment; filename="demo;v2_compressed.mp4"', 'demo;v2_compressed.mp4'],
    ['attachment; filename="demo\\"quoted\\".mp4"', 'demo"quoted".mp4'],
    ["attachment; filename*=UTF-8''%E6%B5%8B%E8%AF%95%20%2B%20%E8%A7%86%E9%A2%91.mp4", '测试 + 视频.mp4'],
    ["attachment; filename=plain.mp4; filename*=UTF-8'zh'%E6%B5%8B%E8%AF%95.mp4", '测试.mp4'],
    ["attachment; filename=plain.mp4; filename*=UTF-8''%ZZ", 'plain.mp4']
  ])('下载名保留引号内分号、转义与 UTF-8 参数：%s', (header, expected) => {
    expect(parseVideoCompressFileName(header, 'fallback.mp4')).toBe(expected)
  })

  it('仅将 true 识别为已压缩', () => {
    expect(parseVideoCompressBoolean('true')).toBe(true)
    expect(parseVideoCompressBoolean('false')).toBe(false)
  })

  it('视频压缩请求必须有有限超时，避免异常连接无限等待', () => {
    expect(VIDEO_COMPRESS_REQUEST_TIMEOUT_MS).toBeGreaterThan(10 * 60 * 1000)
    expect(VIDEO_COMPRESS_REQUEST_TIMEOUT_MS).toBeLessThanOrEqual(11 * 60 * 1000)
  })

  it('上传所选速度档位，并分别通知上传与下载进度', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: new Blob(['video']), headers: { 'content-type': 'video/mp4', 'x-video-compressed': 'true' }
    })
    const upload = vi.fn()
    const download = vi.fn()
    await compressVideoWithServer(new File(['source'], 'sample.mp4'), {
      speed: 'balanced', onUploadProgress: upload, onDownloadProgress: download
    })
    const [, form, config] = post.mock.calls[0]
    expect((form as FormData).get('speed')).toBe('balanced')
    config!.onUploadProgress!({ loaded: 10, total: 20 } as any)
    config!.onDownloadProgress!({ loaded: 10, total: 40 } as any)
    expect(upload).toHaveBeenCalledWith(50)
    expect(download).toHaveBeenCalledWith(25)
    config!.onDownloadProgress!({ loaded: 10 } as any)
    expect(download).toHaveBeenLastCalledWith(null)
  })

  it('默认上传快速档，非 2xx JSON 错误也显示后端的可读提示', async () => {
    const post = vi.spyOn(axios, 'post').mockRejectedValue({
      response: { data: new Blob([JSON.stringify({ msg: '压缩服务繁忙，请稍后重试' })], { type: 'application/json' }) }
    })
    await expect(compressVideoWithServer(new File(['source'], 'sample.mp4'))).rejects.toThrow('压缩服务繁忙')
    expect((post.mock.calls[0][1] as FormData).get('speed')).toBe('fast')
  })

  it.each([
    { blob: new Blob([]), type: 'video/mp4' },
    { blob: new Blob(['<html>gateway error</html>']), type: 'text/html' }
  ])('空响应或网关 HTML 不得作为视频下载', async ({ blob, type }) => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: blob, headers: { 'content-type': type } })
    await expect(compressVideoWithServer(new File(['source'], 'sample.mp4'))).rejects.toThrow('未返回有效视频')
  })
})
