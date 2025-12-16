/**
 * 调试工具模块 - 提供全应用范围的调试功能
 * 根据环境变量控制日志输出，生产环境不显示调试信息
 */

// 判断当前是否为开发环境
const isDev = import.meta.env.MODE === 'development'

/**
 * 开发环境日志输出
 * @param args 需要输出的内容
 */
export const debugLog = (...args: any[]): void => {
  if (isDev) {
    console.log('[DEBUG]', ...args)
  }
}

/**
 * 开发环境错误日志输出
 * @param args 需要输出的错误内容
 */
export const debugError = (...args: any[]): void => {
  if (isDev) {
    console.error('[ERROR]', ...args)
  }
}

/**
 * 开发环境警告日志输出
 * @param args 需要输出的警告内容
 */
export const debugWarn = (...args: any[]): void => {
  if (isDev) {
    console.warn('[WARN]', ...args)
  }
}

/**
 * 条件调试日志
 * 为了支持链式简洁写法：isDev && debugIf('信息')
 * @param args 需要输出的内容
 */
export const debugIf = (...args: any[]): void => {
  debugLog(...args)
}

/**
 * 计时器开始
 * @param label 计时器标签
 */
export const debugTimeStart = (label: string): void => {
  if (isDev) {
    console.time(`[TIME] ${label}`)
  }
}

/**
 * 计时器结束
 * @param label 计时器标签
 */
export const debugTimeEnd = (label: string): void => {
  if (isDev) {
    console.timeEnd(`[TIME] ${label}`)
  }
}

/**
 * 开发环境组件性能监控
 * @param componentName 组件名称
 * @param method 方法名称
 * @param callback 需要执行的回调函数
 */
export const debugPerformance = <T>(componentName: string, method: string, callback: () => T): T => {
  if (!isDev) return callback()

  const label = `${componentName}.${method}`
  debugTimeStart(label)
  const result = callback()
  debugTimeEnd(label)
  return result
}

// 导出环境变量，方便条件性执行代码
export { isDev }
