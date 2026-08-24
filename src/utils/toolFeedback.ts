/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

import { ElMessage } from 'element-plus'

type ToolFeedbackType = 'success' | 'warning' | 'info' | 'error'

/**
 * 函数说明：以项目统一的非阻塞消息提示工具反馈工具执行结果。
 */
export const showToolFeedback = (message: string, type: ToolFeedbackType = 'info'): void => {
  ElMessage({
    message,
    type,
    grouping: true,
    duration: type === 'error' ? 4200 : 3000,
    showClose: true
  })
}
