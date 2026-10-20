/**
 * @description 修正本页 Element Plus 数字输入框动态状态未同步 ARIA 属性的问题。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import type { DirectiveBinding, ObjectDirective } from 'vue'

interface NumberInputAriaState {
  disabled: boolean
  min?: number
  max?: number
}

/**
 * 将实际组件参数同步到内部数字输入框，仅更新 ARIA，不重建 DOM 或改变禁用逻辑。
 * @param element 数字输入组件的根元素
 * @param binding 与该组件 disabled/min/max 一致的当前参数
 */
const syncNumberInputAria = (element: HTMLElement, binding: DirectiveBinding<NumberInputAriaState>): void => {
  const input = element.querySelector<HTMLInputElement>('input[type="number"]')
  if (!input) return
  input.setAttribute('aria-disabled', String(Boolean(binding.value.disabled)))
  for (const name of ['min', 'max'] as const) {
    const value = binding.value[name]
    if (Number.isFinite(value)) input.setAttribute(`aria-value${name}`, String(value))
    else input.removeAttribute(`aria-value${name}`)
  }
}

export const videoGifNumberAria: ObjectDirective<HTMLElement, NumberInputAriaState> = {
  mounted: syncNumberInputAria,
  updated: syncNumberInputAria
}
