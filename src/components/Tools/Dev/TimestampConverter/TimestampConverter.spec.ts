/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'
import TimestampConverter from './TimestampConverter.vue'

const clipboard = vi.hoisted(() => ({ copy: vi.fn().mockResolvedValue(undefined) }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: clipboard.copy }) }))
vi.mock('element-plus', () => ({ ElMessage: { success: vi.fn(), error: vi.fn() } }))

const InputStub = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue', 'input'],
  template: `<div><input :value="modelValue" @input="$emit('update:modelValue', $event.target.value); $emit('input', $event.target.value)" /><slot name="append" /></div>`
})
const SelectStub = defineComponent({
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)"><slot /></select>`
})

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  clipboard.copy.mockClear()
})

/** 挂载带原生表单替身的转换器，通过真实输入和选择事件验证两区联动。 */
function mountConverter() {
  wrapper = mount(TimestampConverter, {
    global: {
      stubs: {
        ElInput: InputStub,
        ElSelect: SelectStub,
        ElOption: { props: ['value', 'label'], template: '<option :value="value">{{ label }}</option>' },
        ElButton: { template: '<button><slot /></button>' },
        ElIcon: { template: '<span><slot /></span>' },
        ToolsRecommend: true
      }
    }
  })
  return wrapper
}

describe('时间戳转换的单位与结果', () => {
  it('上半区切换单位不会把下半区秒值误标成毫秒', async () => {
    const view = mountConverter()
    const inputs = view.findAll('input')
    await inputs[2].setValue('2024-01-02 03:04:05')
    const seconds = inputs[3].element.value
    await view.get('select[aria-label="时间戳输入单位"]').setValue('ms')
    expect(inputs[3].element.value).toBe(seconds)
    expect(view.get<HTMLSelectElement>('select[aria-label="日期转换结果单位"]').element.value).toBe('s')
  })

  it('日期输出秒与毫秒可往返切换，复制值始终与选定单位一致', async () => {
    const view = mountConverter()
    const inputs = view.findAll('input')
    await inputs[2].setValue('2024-01-02 03:04:05')
    const seconds = inputs[3].element.value
    const unit = view.get('select[aria-label="日期转换结果单位"]')
    await unit.setValue('ms')
    expect(inputs[3].element.value).toBe((BigInt(seconds) * 1000n).toString())
    await view.findAll('button')[2].trigger('click')
    expect(clipboard.copy).toHaveBeenLastCalledWith((BigInt(seconds) * 1000n).toString())
    await unit.setValue('s')
    expect(inputs[3].element.value).toBe(seconds)
    await view.findAll('button')[2].trigger('click')
    expect(clipboard.copy).toHaveBeenLastCalledWith(seconds)
  })

  it('拒绝带非法后缀或超出日期范围的时间戳，零时间戳可转换', async () => {
    const view = mountConverter()
    const inputs = view.findAll('input')
    await inputs[0].setValue('123abc')
    expect(inputs[1].element.value).toBe('无效的时间戳')
    await inputs[0].setValue('9007199254740993')
    expect(inputs[1].element.value).toBe('无效的时间戳')
    await inputs[0].setValue('8640000000001')
    expect(inputs[1].element.value).toBe('无效的时间戳')
    await inputs[0].setValue('0')
    expect(inputs[1].element.value).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
  })
})
