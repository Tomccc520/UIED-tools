/**
 * @file imageCompress.spec.ts
 * @description 图片压缩工具共享限制配置回归测试。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-06
 */

import { describe, expect, it } from 'vitest'
import {
  getImageCompressToolDescription,
  IMAGE_COMPRESS_MAX_FILE_COUNT,
  IMAGE_COMPRESS_MAX_FILE_SIZE_MB,
  IMAGE_COMPRESS_SUPPORTED_FORMATS
} from './imageCompress'

describe('图片压缩共享限制', () => {
  it('统一目录和界面使用 25MB、30 个文件及实际支持格式', () => {
    expect(IMAGE_COMPRESS_MAX_FILE_SIZE_MB).toBe(25)
    expect(IMAGE_COMPRESS_MAX_FILE_COUNT).toBe(30)
    expect(IMAGE_COMPRESS_SUPPORTED_FORMATS).toBe('JPG、PNG、WebP')
    expect(getImageCompressToolDescription()).toBe('支持JPG、PNG、WebP格式图片压缩，单个文件不超过25MB')
  })
})
