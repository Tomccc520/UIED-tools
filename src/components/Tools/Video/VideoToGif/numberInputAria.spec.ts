/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, reactive } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ElInputNumber } from 'element-plus'
import { videoGifNumberAria } from './numberInputAria'

let wrapper: VueWrapper | undefined
afterEach(() => { wrapper?.unmount(); wrapper = undefined })

/** 挂载真实 Element Plus 数字输入框，通过组件参数触发局部指令的生命周期。 */
const mountNumber = () => {
  const state = reactive({ disabled: true, min: 0, max: 0, value: 0 })
  wrapper = mount(defineComponent({
    components: { ElInputNumber },
    directives: { gifNumberAria: videoGifNumberAria },
    setup: () => ({ state }),
    template: '<el-input-number v-gif-number-aria="state" v-model="state.value" :disabled="state.disabled" :min="state.min" :max="state.max" :step="0.1" aria-label="开始时间（秒）" />'
  }), { attachTo: document.body })
  return { state, input: wrapper.get<HTMLInputElement>('input[type="number"]').element }
}

describe('视频转 GIF 数字输入 ARIA', () => {
  it('真实组件挂载及启用后同步 disabled/min/max，不改变原生禁用逻辑', async () => {
    const { state, input } = mountNumber()
    expect(input.disabled).toBe(true)
    expect(input.getAttribute('aria-disabled')).toBe('true')
    expect(input.getAttribute('aria-valuemin')).toBe('0')
    expect(input.getAttribute('aria-valuemax')).toBe('0')
    state.disabled = false
    state.max = 2
    await flushPromises()
    expect(input.disabled).toBe(false)
    expect(input.getAttribute('aria-disabled')).toBe('false')
    expect(input.getAttribute('aria-valuemax')).toBe('2')
    expect(input.getAttribute('aria-label')).toBe('开始时间（秒）')
    state.disabled = true
    await flushPromises()
    expect(input.disabled).toBe(true)
    expect(input.getAttribute('aria-disabled')).toBe('true')
  })

  it('修改时间约束和输入值时保留同一个 DOM 与焦点，不通过重建控件更新属性', async () => {
    const { state, input } = mountNumber()
    state.disabled = false
    state.max = 2
    await flushPromises()
    input.focus()
    expect(document.activeElement).toBe(input)
    state.min = 0.5
    state.max = 1.5
    state.value = 0.7
    await flushPromises()
    expect(wrapper!.get('input[type="number"]').element).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-valuemin')).toBe('0.5')
    expect(input.getAttribute('aria-valuemax')).toBe('1.5')
    expect(input.getAttribute('aria-valuenow')).toBe('0.7')
    expect(input.value).toBe('0.7')
  })

  it('范围变为无限值时移除旧 ARIA 约束，不把 Infinity 暴露给辅助技术', async () => {
    const { state, input } = mountNumber()
    state.disabled = false
    state.min = Number.NEGATIVE_INFINITY
    state.max = Number.POSITIVE_INFINITY
    await flushPromises()
    expect(input.hasAttribute('aria-valuemin')).toBe(false)
    expect(input.hasAttribute('aria-valuemax')).toBe(false)
    expect(input.getAttribute('aria-disabled')).toBe('false')
  })
})
