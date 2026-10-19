/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Unicode from './Unicode.vue'

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/unicode' }) }))
vi.mock('element-plus', () => ({ ElMessage: vi.fn() }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: vi.fn() }) }))
vi.mock('vue-codemirror', () => ({ Codemirror: {
  props: ['modelValue'], emits: ['update:modelValue'],
  template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
} }))

describe('Unicode 页面选择性解码', () => {
  it('通过按钮转换时保留路径、百分号和输入框原文', async () => {
    const view = mount(Unicode, {
      global: {
        mocks: { $ensureFreeToolTitle: (title: string) => title },
        stubs: {
          ElInput: { props: ['modelValue'], template: '<textarea :value="modelValue" readonly />' },
          ElButton: { template: '<button><slot /></button>' },
          ToolsRecommend: true
        }
      }
    })
    try {
      const input = String.raw`C:\temp\u4e2d 100%25`
      await view.findAll('textarea')[0].setValue(input)
      await view.findAll('button').find((button) => button.text() === 'Unicode转中文')!.trigger('click')
      expect(view.findAll('textarea')[0].element.value).toBe(input)
      expect(view.findAll('textarea')[1].element.value).toBe(String.raw`C:\temp中 100%25`)
    } finally { view.unmount() }
  })
})
