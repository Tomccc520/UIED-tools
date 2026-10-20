/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import JsonTran from './JsonTran.vue'

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/json' }) }))
vi.mock('element-plus', () => ({ ElMessage: vi.fn() }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: vi.fn() }) }))
vi.mock('@codemirror/lang-json', () => ({ json: () => ({}) }))

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  document.body.innerHTML = ''
})

/** 使用原生文本框替身操作页面按钮，保留组件实际转义、错误及 v-model 行为。 */
const mountJson = () => {
  wrapper = mount(JsonTran, {
    attachTo: document.body,
    global: {
      mocks: { $ensureFreeToolTitle: (title: string) => title },
      stubs: {
        AsyncCodemirror: {
          props: ['modelValue'], emits: ['update:modelValue'],
          template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        },
        ElButton: { template: '<button><slot /></button>' },
        ToolsRecommend: true
      }
    }
  })
  return wrapper
}

/** 按可见名称点击唯一按钮，避免“转义”和“去转义”的子串匹配。 */
const clickButton = async (view: VueWrapper, name: string) => {
  await view.findAll('button').find((button) => button.text() === name)!.trigger('click')
}

describe('JSON 页面转义与去转义', () => {
  it.each(['校验/格式化', '压缩'])('%s 保留大整数、小数、指数与嵌套原始数字', async (action) => {
    const view = mountJson()
    const original = '{"id":9007199254740993,"negative":-9007199254740993,"decimal":0.1234567890123456789012345,"value":1e400,"nested":[-0,1E-400,{"id":9007199254740995}]}'
    await view.get('textarea').setValue(original)
    await clickButton(view, action)
    expect(view.get<HTMLTextAreaElement>('textarea').element.value.replace(/\s/g, '')).toBe(original)
    expect(view.get('[role="alert"]').isVisible()).toBe(false)
  })

  it.each(['校验/格式化', '压缩'])('%s 错误时保留原文并显示错误', async (action) => {
    const view = mountJson()
    const original = '{"id":9007199254740993,}'
    await view.get('textarea').setValue(original)
    await clickButton(view, action)
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(original)
    expect(view.get('[role="alert"]').isVisible()).toBe(true)
  })

  it('连续点击转义和去转义后，路径、引号、换行及字面 Unicode 完全一致', async () => {
    const view = mountJson()
    const original = String.raw`C:\temp\a.txt "引号" \u4e2d` + '\n第二行\t\\'
    await view.get('textarea').setValue(original)
    await clickButton(view, '转义')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).not.toBe(original)
    await clickButton(view, '去转义')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(original)
    expect(view.get('[role="alert"]').isVisible()).toBe(false)
  })

  it('错误输入保留原文并报错，修正后的成功操作清除旧错误', async () => {
    const view = mountJson()
    const invalid = String.raw`C:\temp\a.txt`
    await view.get('textarea').setValue(invalid)
    await clickButton(view, '去转义')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(invalid)
    expect(view.get('[role="alert"]').isVisible()).toBe(true)
    expect(view.get('[role="alert"]').text()).toContain('原文已保留')
    await clickButton(view, '转义')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(String.raw`C:\\temp\\a.txt`)
    expect(view.get('[role="alert"]').isVisible()).toBe(false)
    await clickButton(view, '去转义')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(invalid)
    expect(view.get('[role="alert"]').isVisible()).toBe(false)
  })
})
