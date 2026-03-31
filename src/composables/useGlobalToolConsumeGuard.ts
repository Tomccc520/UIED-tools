/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-31
 */

import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToolConsume } from '@/composables/useToolConsume'

const AUTO_GUARD_SKIP_ATTR = 'data-tool-consume-guard-skip'
const MANUAL_GUARD_SKIP_SELECTOR = '[data-skip-tool-consume="1"]'
const ACTION_TRIGGER_SELECTOR = 'button, a, [role="button"], .el-button'
const ACTION_KEYWORD_REG = /(开始|生成|压缩|转换|导出|下载|去水印|抠图|提取|合并|裁剪|旋转|重设|录制|封装|开通|购买|支付|处理)/i
const ACTION_IGNORE_REG = /(取消|关闭|返回|展开|收起|刷新|清空|重置|选择|上传|复制|粘贴|预览|更多|上一|下一|登录|退出)/i

/**
 * 函数说明：标准化按钮文案，统一为单行文本，便于后续关键词识别。
 */
const normalizeActionText = (rawText: string): string => {
  return String(rawText || '').replace(/\s+/g, ' ').trim()
}

/**
 * 函数说明：从点击元素提取动作文案，优先读取可见文本，兜底读取 aria/title。
 */
const resolveActionText = (target: HTMLElement): string => {
  const visibleText = normalizeActionText(target.innerText || target.textContent || '')
  if (visibleText) {
    return visibleText
  }
  const ariaLabel = normalizeActionText(target.getAttribute('aria-label') || '')
  if (ariaLabel) {
    return ariaLabel
  }
  return normalizeActionText(target.getAttribute('title') || '')
}

/**
 * 函数说明：从工具路由路径生成 toolKey，统一按 “-” 连接，便于积分扣减统计归类。
 */
const resolveToolKeyByPath = (path: string): string => {
  const normalizedPath = String(path || '')
    .replace(/^\/tools\//, '')
    .replace(/^\/+|\/+$/g, '')
    .split('?')[0]
    .split('#')[0]
  const key = normalizedPath.replace(/[\/_]+/g, '-').trim()
  return key || 'tools-home'
}

/**
 * 函数说明：根据动作文案推断 action 标识，便于后端统计不同操作类型。
 */
const resolveActionCode = (actionText: string): string => {
  const text = normalizeActionText(actionText)
  if (/下载|导出/i.test(text)) {
    return 'download'
  }
  if (/支付|购买|开通/i.test(text)) {
    return 'purchase'
  }
  if (/压缩/i.test(text)) {
    return 'compress'
  }
  if (/转换/i.test(text)) {
    return 'convert'
  }
  if (/抠图|去水印/i.test(text)) {
    return 'matting'
  }
  if (/裁剪/i.test(text)) {
    return 'crop'
  }
  if (/旋转/i.test(text)) {
    return 'rotate'
  }
  if (/合并/i.test(text)) {
    return 'merge'
  }
  if (/录制/i.test(text)) {
    return 'record'
  }
  if (/提取/i.test(text)) {
    return 'extract'
  }
  if (/生成/i.test(text)) {
    return 'generate'
  }
  return 'use'
}

/**
 * 函数说明：判断触发元素是否可操作（未禁用且未处于 loading 锁定态）。
 */
const isActionElementEnabled = (target: HTMLElement): boolean => {
  if (target.getAttribute('disabled') !== null) {
    return false
  }
  if (target.getAttribute('aria-disabled') === 'true') {
    return false
  }
  if (target.classList.contains('is-disabled') || target.classList.contains('is-loading')) {
    return false
  }
  return true
}

/**
 * 函数说明：判断当前点击是否属于“应拦截的高价值动作”。
 */
const shouldGuardAction = (target: HTMLElement, actionText: string): boolean => {
  if (!actionText) {
    return false
  }
  if (ACTION_IGNORE_REG.test(actionText)) {
    return false
  }
  if (!ACTION_KEYWORD_REG.test(actionText)) {
    return false
  }
  if (!isActionElementEnabled(target)) {
    return false
  }
  return true
}

/**
 * 函数说明：全局挂载“工具动作扣分拦截层”，用于补齐未接入页面的登录/积分校验。
 */
export const useGlobalToolConsumeGuard = () => {
  const route = useRoute()
  const { ensureToolConsume } = useToolConsume()
  let isHandling = false

  /**
   * 函数说明：全局点击捕获器，在工具页识别高价值动作并先执行登录/积分校验。
   */
  const handleClickCapture = async (event: MouseEvent) => {
    if (isHandling) {
      return
    }
    if (!String(route.path || '').startsWith('/tools/')) {
      return
    }

    const eventTarget = event.target
    if (!(eventTarget instanceof HTMLElement)) {
      return
    }

    const trigger = eventTarget.closest(ACTION_TRIGGER_SELECTOR) as HTMLElement | null
    if (!trigger) {
      return
    }
    if (trigger.getAttribute(AUTO_GUARD_SKIP_ATTR) === '1') {
      return
    }
    if (trigger.closest(MANUAL_GUARD_SKIP_SELECTOR)) {
      return
    }

    const actionText = resolveActionText(trigger)
    if (!shouldGuardAction(trigger, actionText)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    isHandling = true

    try {
      const allow = await ensureToolConsume({
        toolKey: resolveToolKeyByPath(route.path),
        action: resolveActionCode(actionText),
        redirectPath: route.fullPath,
        loginWarningText: '请先登录后再继续当前工具操作'
      })
      if (!allow) {
        return
      }

      trigger.setAttribute(AUTO_GUARD_SKIP_ATTR, '1')
      trigger.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }))
      window.setTimeout(() => {
        trigger.removeAttribute(AUTO_GUARD_SKIP_ATTR)
      }, 0)
    } finally {
      isHandling = false
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickCapture, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickCapture, true)
  })
}

