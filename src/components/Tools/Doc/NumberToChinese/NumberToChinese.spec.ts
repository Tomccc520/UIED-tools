/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElMessage } from 'element-plus'
import NumberToChinese from './NumberToChinese.vue'

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/doc/number-chinese' }) }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: vi.fn() }) }))
vi.mock('element-plus', () => ({ ElMessage: { warning: vi.fn(), error: vi.fn() } }))

describe('中文大写页面完整输入校验', () => {
  it('零可转换；小数不能被 parseInt 截断，并保留原输入、清除过期结果', async () => {
    const view = mount(NumberToChinese, { global: {
      mocks: { $ensureFreeToolTitle: (title: string) => title },
      stubs: {
        ToolsRecommend: true,
        ElInput: {
          props: ['modelValue', 'readonly'], emits: ['update:modelValue'],
          template: '<textarea :readonly="readonly" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        ElButton: { props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' }
      }
    } })
    try {
      const input = view.findAll('textarea')[0]
      const output = view.findAll('textarea')[1]
      const convert = view.findAll('button')[0]
      await input.setValue('0')
      await convert.trigger('click')
      expect(output.element.value).toBe('零')
      await input.setValue('100000')
      await convert.trigger('click')
      expect(output.element.value).toBe('壹拾万')
      await input.setValue('12.5')
      await convert.trigger('click')
      expect(input.element.value).toBe('12.5')
      expect(output.element.value).toBe('')
      expect(ElMessage.error).toHaveBeenCalledWith(expect.stringContaining('不支持小数'))
      expect(view.findAll('button')[1].attributes('disabled')).toBeDefined()
    } finally { view.unmount() }
  })
})
