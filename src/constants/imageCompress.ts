/**
 * @file imageCompress.ts
 * @description 图片压缩工具共享限制配置，供上传校验、界面提示、FAQ 与工具目录描述统一引用
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-06
 */

/**
 * 函数说明：图片压缩工具允许的单文件大小上限（MB），所有展示与校验共用此配置。
 */
export const IMAGE_COMPRESS_MAX_FILE_SIZE_MB = 25

/**
 * 函数说明：统一图片压缩工具支持的输入格式文案，避免目录与页面出现不同口径。
 */
export const IMAGE_COMPRESS_SUPPORTED_FORMATS = 'JPG、PNG、WebP'

/**
 * 函数说明：统一图片压缩工具允许的批量文件数量。
 */
export const IMAGE_COMPRESS_MAX_FILE_COUNT = 30

/**
 * 函数说明：统一图片压缩工具允许的 MIME 类型，和浏览器压缩分支保持一致。
 */
export const IMAGE_COMPRESS_SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/**
 * 函数说明：生成图片压缩工具目录和最近使用区域共用的描述文案。
 * @returns 图片压缩工具描述
 */
export const getImageCompressToolDescription = (): string => {
  return `支持${IMAGE_COMPRESS_SUPPORTED_FORMATS}格式图片压缩，单个文件不超过${IMAGE_COMPRESS_MAX_FILE_SIZE_MB}MB`
}
