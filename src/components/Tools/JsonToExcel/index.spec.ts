/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import * as XLSX from 'xlsx'
import { minifyJsonLosslessly } from '@/utils/losslessJson'
import JsonToExcel from './index.vue'

const runtime = vi.hoisted(() => ({ load: vi.fn(), writeFile: vi.fn(), error: vi.fn(), success: vi.fn() }))
vi.mock('@/utils/toolRuntimeLoaders', () => ({ ensureXlsxRuntime: runtime.load }))
vi.mock('element-plus', () => ({ ElMessage: runtime }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/json-to-excel' }) }))

const Input = defineComponent({
  props: ['modelValue'], emits: ['update:modelValue'],
  /** 保留输入行为和 v-model，直接操作页面输入验证转换状态。 */
  setup(props, { emit, attrs }) {
    return () => h('textarea', { ...attrs, value: props.modelValue, onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLTextAreaElement).value) })
  }
})
const Button = defineComponent({
  props: ['disabled', 'loading'],
  /** 保留禁用和加载语义，防止测试绕开用户实际可执行的操作。 */
  setup(props, { slots, attrs }) { return () => h('button', { ...attrs, disabled: props.disabled || props.loading }, slots.default?.()) }
})
let view: VueWrapper
const xlsxRuntime = { XLSX: { ...XLSX, writeFile: runtime.writeFile } }

/** 通过可见名称触发页面操作，并等待异步运行时完成。 */
async function click(name: string) {
  await view.findAll('button').find(button => button.text() === name)!.trigger('click')
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  runtime.load.mockReset().mockResolvedValue(xlsxRuntime)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  view = mount(JsonToExcel, { global: { stubs: { ElInput: Input, ElButton: Button, ToolsRecommend: true, UsageGuide: true } } })
})
afterEach(() => { view?.unmount(); vi.restoreAllMocks() })

describe('JSON 转 Excel 的内容保真', () => {
  it('格式化保留大整数、长小数、极大指数与原始字符串', async () => {
    const source = String.raw`[{"id":9007199254740993,"decimal":0.1234567890123456789,"exp":1e400,"text":"C:\\temp\\a.txt"}]`
    await view.get('textarea').setValue(source)
    await click('格式化')
    expect(minifyJsonLosslessly(view.get<HTMLTextAreaElement>('textarea').element.value)).toBe(source)
  })

  it.each(['9007199254740993', '-9007199254740993', '1e400', '1e-400', '0.1234567890123456789',
    '1125899906842624', '0.1234567890123456', '1e-308', '1e308'])('数值 %s 无法安全转换时保留原文并阻止下载', async number => {
    const source = `[{"value":${number}}]`
    await view.get('textarea').setValue(source)
    await click('转换并下载Excel')
    expect(runtime.writeFile).not.toHaveBeenCalled()
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(source)
    expect(view.get('[role="alert"]').text()).toContain('双引号')
    expect(runtime.success).not.toHaveBeenCalled()
  })

  it('真实 XLSX 编解码后保留普通值和嵌套对象数组，长数字字符串仍为文本', async () => {
    const source = '[{"name":"Tom","id":"9007199254740993","value":1.2300,"active":true,"profile":{"city":"深圳"},"tags":["a","b"]}]'
    await view.get('textarea').setValue(source)
    await click('转换并下载Excel')
    const [book] = runtime.writeFile.mock.calls[0]
    const bytes = XLSX.write(book, { type: 'array', bookType: 'xlsx' })
    const read = XLSX.read(bytes, { type: 'array' })
    expect(XLSX.utils.sheet_to_json(read.Sheets.Sheet1)).toEqual([{ name: 'Tom', id: '9007199254740993', value: 1.23, active: true, profile: '{"city":"深圳"}', tags: '["a","b"]' }])
    expect(runtime.success).toHaveBeenCalledOnce()
  })

  it.each(['{}', '[]', '[null]', '[1,2]', '[[1,2]]', '[{}]'])('拒绝无法构成表格的数据 %s，不生成空文件并提示成功', async source => {
    await view.get('textarea').setValue(source)
    await click('转换并下载Excel')
    expect(runtime.writeFile).not.toHaveBeenCalled()
    expect(runtime.success).not.toHaveBeenCalled()
    expect(view.find('[role="alert"]').exists()).toBe(true)
  })

  it('无效 JSON 格式化保留输入并显示可读错误', async () => {
    const source = '[{"id":1,}]'
    await view.get('textarea').setValue(source)
    await click('格式化')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(source)
    expect(view.get('[role="alert"]').text()).toContain('JSON')
  })

  it('超过 Excel 列数上限时明确报错，不能生成被静默截断的工作簿', async () => {
    const row = Object.fromEntries(Array.from({ length: 16385 }, (_, index) => [`field${index}`, index]))
    const source = JSON.stringify([row])
    await view.get('textarea').setValue(source)
    await click('转换并下载Excel')
    expect(runtime.writeFile).not.toHaveBeenCalled()
    expect(view.get('[role="alert"]').text()).toContain('16384')
    expect(view.get<HTMLTextAreaElement>('textarea').element.value).toBe(source)
  })
})

describe('JSON 转 Excel 异步任务归属', () => {
  it.each(['edit', 'clear', 'unmount'])('等待转换库时 %s，迟到任务不能继续下载或提示成功', async action => {
    let resolveRuntime!: (value: typeof xlsxRuntime) => void
    runtime.load.mockImplementationOnce(() => new Promise(resolve => { resolveRuntime = resolve }))
    await view.get('textarea').setValue('[{"name":"A"}]')
    await click('转换并下载Excel')
    if (action === 'edit') await view.get('textarea').setValue('[{"name":"B"}]')
    else if (action === 'clear') await click('清空')
    else view.unmount()
    resolveRuntime(xlsxRuntime)
    await flushPromises()
    expect(runtime.writeFile).not.toHaveBeenCalled()
    expect(runtime.success).not.toHaveBeenCalled()
    expect(runtime.error).not.toHaveBeenCalled()
  })
})
