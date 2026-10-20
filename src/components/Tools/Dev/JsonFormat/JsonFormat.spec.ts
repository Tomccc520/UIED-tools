/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import JsonFormat from './JsonFormat.vue'

const messages = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('element-plus', () => ({ ElMessage: messages }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: vi.fn() }) }))
let view: VueWrapper | undefined

/** 挂载页面真实按钮与结果文本框，只替换页面骨架和输入组件。 */
function mountJsonFormat() {
  view = mount(JsonFormat, { global: { stubs: {
    StandardToolPageTemplate: { template: '<main><slot /><slot name="actions" /><slot name="support" /></main>' },
    ElInput: { props: ['modelValue'], emits: ['update:modelValue'], template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />' },
    ElButton: { template: '<button><slot /></button>' },
    ElIcon: true, ElSelect: true, ElOption: true, ToolsRecommend: true
  } } })
  return view
}

afterEach(() => { view?.unmount(); vi.clearAllMocks() })

describe('JSON 格式化页保持数字原文', () => {
  it.each(['格式化', '压缩'])('%s 不改变数字 token、类型与嵌套顺序', async (action) => {
    const page = mountJsonFormat()
    const input = '{"id":9007199254740993,"negative":-9007199254740993,"decimal":0.1234567890123456789012345,"value":1e400,"nested":[-0,1E-400,{"id":9007199254740995}]}'
    await page.get('textarea[aria-label="输入 JSON"]').setValue(input)
    await page.findAll('button').find(button => button.text() === action)!.trigger('click')
    const output = page.get<HTMLTextAreaElement>('textarea[aria-label="JSON 处理结果"]').element.value
    expect(output.replace(/\s/g, '')).toBe(input)
    expect(messages.success).toHaveBeenCalledOnce()
  })

  it.each(['格式化', '压缩'])('%s 失败时保留输入，清理旧结果并显示错误', async (action) => {
    const page = mountJsonFormat()
    await page.get('textarea[aria-label="输入 JSON"]').setValue('{"valid":1}')
    await page.findAll('button').find(button => button.text() === action)!.trigger('click')
    const invalid = '{"id":9007199254740993,}'
    await page.get('textarea[aria-label="输入 JSON"]').setValue(invalid)
    await page.findAll('button').find(button => button.text() === action)!.trigger('click')
    expect(page.get<HTMLTextAreaElement>('textarea[aria-label="输入 JSON"]').element.value).toBe(invalid)
    expect(page.get<HTMLTextAreaElement>('textarea[aria-label="JSON 处理结果"]').element.value).toBe('')
    expect(page.get('[role="alert"]').text()).toContain('无效')
    expect(messages.success).toHaveBeenCalledOnce()
  })
})
