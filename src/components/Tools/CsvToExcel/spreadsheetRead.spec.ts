/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import * as XLSX from 'xlsx'
import CsvToExcel from './index.vue'
import ExcelToCsv from '../ExcelToCsv/index.vue'
import ExcelToJson from '../ExcelToJson/index.vue'

const runtime = vi.hoisted(() => ({ load: vi.fn(), writeFile: vi.fn(), read: vi.fn(), error: vi.fn(), success: vi.fn(), clipboard: vi.fn() }))
vi.mock('@/utils/toolRuntimeLoaders', () => ({ ensureXlsxRuntime: runtime.load }))
vi.mock('element-plus', () => ({ ElMessage: runtime }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/spreadsheet-read-test' }) }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: runtime.clipboard }) }))

const ButtonStub = defineComponent({
  props: ['disabled', 'loading'],
  /** 保留原生按钮禁用语义，让测试覆盖真实用户操作状态。 */
  setup(props, { slots, attrs }) {
    return () => h('button', { ...attrs, disabled: props.disabled, type: 'button' }, slots.default?.())
  }
})
const InputStub = defineComponent({
  props: ['modelValue'],
  /** 只替换 Element 输入外壳，仍展示组件产生的实际 JSON 文本。 */
  setup(props) { return () => h('textarea', { value: props.modelValue }) }
})

class ControlledReader {
  onload: ((event: { target: { result: string | ArrayBuffer } }) => unknown) | null = null
  onerror: (() => unknown) | null = null
  onabort: (() => unknown) | null = null
  readyState = 0
  inputFile: File | null = null
  result: string | ArrayBuffer | null = null
  error = new DOMException('read fixture failure', 'NotReadableError')
  /** 模拟开始读取，由每个用例指定完成顺序。 */
  readAsBinaryString = vi.fn((file: File) => { this.inputFile = file; this.readyState = 1 })
  /** Excel→JSON 使用数组读取，其余转换沿用二进制读取。 */
  readAsArrayBuffer = vi.fn((file: File) => { this.inputFile = file; this.readyState = 1 })
  /** 记录取消动作，保留已被事件队列捕获的回调供回归测试触发。 */
  abort = vi.fn(() => { this.readyState = 2 })
  /** 保存读取器，不直接修改被测组件状态。 */
  constructor() { readers.push(this) }
}
const NativeFileReader = FileReader
let readers: ControlledReader[] = []
let view: VueWrapper | undefined
const xlsxRuntime = { XLSX: { ...XLSX, read: runtime.read, writeFile: runtime.writeFile } }

beforeEach(() => {
  vi.clearAllMocks()
  readers = []
  runtime.load.mockReset().mockResolvedValue(xlsxRuntime)
  runtime.read.mockReset().mockImplementation(XLSX.read)
  vi.stubGlobal('FileReader', ControlledReader)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  view?.unmount()
  view = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const tools = [
  { name: 'CSV→Excel', component: CsvToExcel, extension: 'csv', download: 'downloadExcel', output: 'xlsx', binary: true },
  { name: 'Excel→CSV', component: ExcelToCsv, extension: 'xlsx', download: 'downloadCsv', output: 'csv', binary: true },
  { name: 'Excel→JSON', component: ExcelToJson, extension: 'xlsx', download: 'downloadJson', output: 'json', binary: false }
] as const

/** 使用真实 SheetJS 编码内容，解析与导出校验不依赖人为构造的工作簿替身。 */
function fixture(marker: string, binary: boolean, csv: boolean) {
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet([['name'], [marker]]), 'Sheet1')
  return XLSX.write(book, { type: binary ? 'binary' : 'array', bookType: csv ? 'csv' : 'xlsx' }) as string | ArrayBuffer
}

/** 通过页面已绑定的选择入口触发读取，支持上传控件被预览替换后的连续选择时序。 */
async function choose(name: string, extension: string) {
  ;(view!.vm as any).handleFileInputChange({ target: { files: [new File(['fixture'], `${name}.${extension}`)] } })
  await flushPromises()
}

/** 读取结果使用原始事件回调，取消后仍可模拟已经排队的旧 load 事件。 */
async function complete(reader: ControlledReader, marker: string, binary: boolean, callback = reader.onload) {
  const result = fixture(marker, binary, reader.inputFile?.name.endsWith('.csv') ?? false)
  reader.result = result
  reader.readyState = 2
  callback?.({ target: { result } })
  await flushPromises()
}

/** 同时核对文件归属与预览数据，避免只修文件名而继续导出旧内容。 */
function expectCurrent(marker: string, extension: string, binary: boolean) {
  expect((view!.vm as any).file?.name).toBe(`${marker}.${extension}`)
  if (binary) {
    expect(view!.get('tbody').text()).toContain(marker)
  } else {
    expect(view!.get('textarea').element.value).toContain(marker)
  }
}

/** 使用浏览器原生读取器检查实际下载 Blob，避免受竞态测试替身影响。 */
function readBlobText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new NativeFileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe.each(tools)('$name 文件读取与结果归属', ({ component, extension, download, output, binary }) => {
  beforeEach(() => {
    view = mount(component, { global: { stubs: { ToolsRecommend: true, UsageGuide: true, ElButton: ButtonStub, ElInput: InputStub } } })
  })

  it('A、B 乱序完成时取消 A，只展示并导出 B 的真实内容', async () => {
    await choose('A', extension)
    const oldLoad = readers[0].onload
    const oldError = readers[0].onerror
    await choose('B', extension)
    await complete(readers[1], 'B', binary)
    await complete(readers[0], 'A', binary, oldLoad)
    oldError?.()
    expectCurrent('B', extension, binary)
    expect(runtime.error).not.toHaveBeenCalled()
    expect(readers[0].abort).toHaveBeenCalledOnce()
    if (binary) {
      await (view!.vm as any)[download]()
      const [book, name] = runtime.writeFile.mock.calls[0]
      expect(name).toBe(`B.${output}`)
      expect(XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]])).toEqual([{ name: 'B' }])
    } else {
      let blob: Blob | undefined
      vi.spyOn(URL, 'createObjectURL').mockImplementation(value => { blob = value as Blob; return 'blob:spreadsheet-test' })
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
      ;(view!.vm as any)[download]()
      expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe('B.json')
      expect(JSON.parse(await readBlobText(blob!))).toEqual([{ name: 'B' }])
    }
  })

  it('读取中清空后到达的旧 load 和 error 不恢复内容、不弹出旧反馈', async () => {
    await choose('A', extension)
    const oldLoad = readers[0].onload
    const oldError = readers[0].onerror
    ;(view!.vm as any).clearFile()
    await complete(readers[0], 'A', binary, oldLoad)
    oldError?.()
    await flushPromises()
    expect((view!.vm as any).file).toBeNull()
    expect(binary ? (view!.vm as any).workbook : (view!.vm as any).jsonContent).toBe(binary ? null : '')
    expect(runtime.success).not.toHaveBeenCalled()
    expect(runtime.error).not.toHaveBeenCalled()
    expect(readers[0].abort).toHaveBeenCalledOnce()
  })

  it('A 已读完但解析库仍加载时换 B，延迟的 A 解析不覆盖 B', async () => {
    let release!: (value: typeof xlsxRuntime) => void
    runtime.load.mockImplementationOnce(() => new Promise(resolve => { release = resolve }))
    await choose('A', extension)
    await complete(readers[0], 'A', binary)
    await choose('B', extension)
    await complete(readers[1], 'B', binary)
    release(xlsxRuntime)
    await flushPromises()
    expectCurrent('B', extension, binary)
    expect(runtime.success).toHaveBeenCalledTimes(1)
  })

  it('换文件时立即清除旧产物，读取期间禁用下载', async () => {
    await choose('A', extension)
    await complete(readers[0], 'A', binary)
    await choose('B', extension)
    const downloadButton = view!.findAll('button').find(button => button.text().startsWith('下载'))!
    expect(downloadButton.attributes('disabled')).toBeDefined()
    expect(binary ? (view!.vm as any).workbook : (view!.vm as any).jsonContent).toBe(binary ? null : '')
    expect(view!.get('[role="status"]').text()).toContain('读取')
  })

  it('当前读取失败时展示错误与重新上传入口，不保留旧内容或继续下载', async () => {
    await choose('A', extension)
    await complete(readers[0], 'A', binary)
    await choose('B', extension)
    const failedLoad = readers[1].onload
    expect(readers[1].onerror).toBeTypeOf('function')
    readers[1].onerror?.()
    await complete(readers[1], 'B', binary, failedLoad)
    await flushPromises()
    expect(view!.get('[role="alert"]').text()).toContain('文件读取失败，请重新上传')
    expect(view!.findAll('button').find(button => button.text() === '重新上传')).toBeTruthy()
    expect(view!.findAll('button').find(button => button.text().startsWith('下载'))!.attributes('disabled')).toBeDefined()
    expect(binary ? (view!.vm as any).workbook : (view!.vm as any).jsonContent).toBe(binary ? null : '')
  })

  it('解析失败时清空产物并提示可重试，重新选择后可正常转换', async () => {
    runtime.read.mockImplementationOnce(() => { throw new Error('isolated parse failure') })
    await choose('A', extension)
    await complete(readers[0], 'A', binary)
    expect(view!.get('[role="alert"]').text()).toContain('文件解析失败，请重新上传')
    expect(runtime.success).not.toHaveBeenCalled()
    ;(view!.vm as any).clearFile()
    await choose('B', extension)
    await complete(readers[1], 'B', binary)
    expectCurrent('B', extension, binary)
    expect(view!.find('[role="alert"]').exists()).toBe(false)
  })

  it('卸载后取消读取，已排队的旧事件不继续解析或提示成功', async () => {
    await choose('A', extension)
    const oldLoad = readers[0].onload
    view!.unmount()
    view = undefined
    await complete(readers[0], 'A', binary, oldLoad)
    expect(readers[0].abort).toHaveBeenCalledOnce()
    expect(runtime.load).not.toHaveBeenCalled()
    expect(runtime.success).not.toHaveBeenCalled()
  })

  it('读取方法同步失败时结束加载并允许重新上传', async () => {
    const readMethod = binary ? 'readAsBinaryString' : 'readAsArrayBuffer'
    const originalReader = ControlledReader
    vi.stubGlobal('FileReader', class extends originalReader {
      /** 模拟浏览器安全或文件访问限制使读取方法直接抛错。 */
      constructor() {
        super()
        this[readMethod] = vi.fn((_file: File): void => { throw new DOMException('read blocked', 'InvalidStateError') })
      }
    })
    await choose('A', extension)
    expect(view!.get('[role="alert"]').text()).toContain('文件读取失败，请重新上传')
    expect(view!.find('[role="status"]').exists()).toBe(false)
    expect(runtime.success).not.toHaveBeenCalled()
  })


  if (binary) {
    it('下载等待运行时期间换文件时取消旧导出，不混用新文件名和旧工作簿', async () => {
      await choose('A', extension)
      await complete(readers[0], 'A', binary)
      let release!: (value: typeof xlsxRuntime) => void
      runtime.load.mockImplementationOnce(() => new Promise(resolve => { release = resolve }))
      const pendingDownload = (view!.vm as any)[download]()
      await choose('B', extension)
      await complete(readers[1], 'B', binary)
      release(xlsxRuntime)
      await pendingDownload
      expect(runtime.writeFile).not.toHaveBeenCalled()
      expectCurrent('B', extension, binary)
    })
  }

})
