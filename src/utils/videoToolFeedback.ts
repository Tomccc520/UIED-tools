/**
 * @file videoToolFeedback.ts
 * @description 视频工具页通用反馈能力：错误提示、ETA 计算与格式化
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-19
 */

/**
 * 估算剩余处理秒数
 * @param progress 当前进度（0-100）
 * @param startedAt 任务开始时间戳（毫秒）
 * @returns 剩余秒数，无法估算时返回 null
 */
export const estimateRemainingSeconds = (progress: number, startedAt: number): number | null => {
  if (!startedAt || progress <= 0 || progress >= 99) {
    return null
  }

  const elapsedSeconds = (Date.now() - startedAt) / 1000
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) {
    return null
  }

  const perProgress = elapsedSeconds / progress
  const remain = perProgress * (100 - progress)

  if (!Number.isFinite(remain) || remain < 0) {
    return null
  }

  return Math.round(remain)
}

/**
 * 格式化 ETA 文本
 * @param seconds 剩余秒数
 * @returns 用于界面展示的 ETA 文本
 */
export const formatEtaText = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) {
    return '预计剩余时间：计算中'
  }

  if (seconds < 60) {
    return `预计剩余时间：约 ${seconds} 秒`
  }

  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  return `预计剩余时间：约 ${minutes} 分 ${remainSeconds} 秒`
}

/**
 * 统一视频处理错误文案
 * @param error 原始错误对象
 * @param fallback 默认文案
 * @returns 用户可读错误信息
 */
export const getFriendlyVideoError = (
  error: unknown,
  fallback = '处理失败，请更换浏览器或调低参数后重试'
): string => {
  if (error instanceof DOMException) {
    if (error.name === 'NotSupportedError') {
      return '当前浏览器不支持该编码格式，请切换为 WebM 或升级浏览器'
    }

    if (error.name === 'AbortError') {
      return '处理已取消'
    }

    if (error.name === 'NotReadableError') {
      return '视频解码失败，请检查文件是否损坏或更换格式'
    }

    if (error.name === 'QuotaExceededError') {
      return '浏览器内存不足，请关闭其他页面后重试'
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()

    if (message.includes('memory') || message.includes('quota')) {
      return '浏览器内存不足，请尝试缩短时长或降低参数后重试'
    }

    if (message.includes('decode') || message.includes('codec')) {
      return '视频解码或编码不受支持，请更换输入格式或浏览器'
    }

    return error.message || fallback
  }

  return fallback
}
