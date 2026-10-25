/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import PdfExtractText from './index.vue'

const runtime = vi.hoisted(() => ({ getDocument: vi.fn() }))
const messages = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-extract-text' }) }))
vi.mock('element-plus', () => ({ ElMessage: messages }))
vi.mock('@/utils/pdf', () => ({ getPdfFileError: () => '', ensurePdfjsRuntime: async () => runtime }))

let view: VueWrapper | undefined
const tasks: Array<{ destroy: ReturnType<typeof vi.fn> }> = []

/** 构造可手动完成的 PDF 文本读取，让旧任务在切换文件后才返回。 */
const deferred = <T,>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

/** 用一个文本项模拟 PDF.js 返回的数据，避免测试依赖真实 worker 调度顺序。 */
const textContent = (text: string) => ({ items: [{ str: text, transform: [1, 0, 0, 1, 0, 100], height: 10 }] })

/** 通过实际文件选择事件上传测试文件，以首字节标记 A、B 文档身份。 */
const upload = async (marker: number) => {
  const file = new File(['pdf'], `${marker === 1 ? 'A' : 'B'}.pdf`, { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', { value: async () => new Uint8Array([marker]).buffer })
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
  await flushPromises()
}

/** 依照按钮文案触发真实组件处理流程。 */
const click = async (label: string) => {
  const button = view!.findAll('button').find((item) => item.text() === label)!
  await button.trigger('click')
  await flushPromises()
}

/** 从只读文本框读取实际提取结果，避免 DOM textContent 忽略 textarea 的 value。 */
const resultText = () => {
  const textarea = view!.find('textarea')
  return textarea.exists() ? (textarea.element as HTMLTextAreaElement).value : ''
}

beforeEach(() => {
  vi.clearAllMocks()
  tasks.length = 0
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  view = mount(PdfExtractText, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: { ToolsRecommend: true, UsageGuide: true }
  } })
})

afterEach(() => { view?.unmount(); view = undefined; vi.restoreAllMocks() })

/** 每次加载返回独立可销毁任务；缩略图与文本提取读取同一文件但互不抢占结果。 */
const useDocuments = (contents: Record<number, Promise<unknown>>) => {
  runtime.getDocument.mockImplementation((buffer: ArrayBuffer) => {
    const marker = new Uint8Array(buffer)[0]
    const task = { destroy: vi.fn().mockResolvedValue(undefined), promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        getViewport: () => ({ width: 100 * marker, height: 120 * marker }),
        render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
        getTextContent: () => contents[marker]
      })
    }) }
    tasks.push(task)
    return task
  })
}

describe('PDF 文本提取任务归属', () => {
  it('A 提取中重新上传 B，A 的迟到结果不得进入 B 的文本或下载内容', async () => {
    const first = deferred<unknown>()
    useDocuments({ 1: first.promise, 2: Promise.resolve(textContent('B_CONTENT')) })
    await upload(1)
    await click('开始提取')
    await click('重新上传')
    await upload(2)
    first.resolve(textContent('A_CONTENT'))
    await flushPromises()
    expect(view!.text()).toContain('B.pdf')
    expect(resultText()).not.toContain('A_CONTENT')
    expect(messages.success).not.toHaveBeenCalled()
    expect(tasks.some((task) => task.destroy.mock.calls.length > 0)).toBe(true)
    await click('开始提取')
    expect(resultText()).toContain('B_CONTENT')
  })

  it('旧任务的 finally 不得提前结束 B 正在运行的提取状态', async () => {
    const first = deferred<unknown>()
    const second = deferred<unknown>()
    useDocuments({ 1: first.promise, 2: second.promise })
    await upload(1)
    await click('开始提取')
    await click('重新上传')
    await upload(2)
    await click('开始提取')
    first.resolve(textContent('A_CONTENT'))
    await flushPromises()
    expect(view!.text()).toContain('正在提取文本')
    expect(resultText()).not.toContain('A_CONTENT')
    second.resolve(textContent('B_CONTENT'))
    await flushPromises()
    expect(resultText()).toContain('B_CONTENT')
    expect(view!.text()).not.toContain('正在提取文本')
  })

  it('清空或卸载后旧任务失败不再弹错误或成功提示，并释放任务', async () => {
    const first = deferred<unknown>()
    useDocuments({ 1: first.promise })
    await upload(1)
    await click('开始提取')
    await click('重新上传')
    view!.unmount()
    view = undefined
    first.reject(new Error('old PDF failure'))
    await flushPromises()
    expect(messages.error).not.toHaveBeenCalled()
    expect(messages.success).not.toHaveBeenCalled()
    expect(tasks.every((task) => task.destroy.mock.calls.length > 0)).toBe(true)
  })

  it('A 的迟到缩略图不能重绘 B 的当前画布', async () => {
    const first = deferred<unknown>()
    const renderA = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    const renderB = vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() }))
    runtime.getDocument.mockImplementation((buffer: ArrayBuffer) => ({
      destroy: vi.fn().mockResolvedValue(undefined),
      promise: new Uint8Array(buffer)[0] === 1 ? first.promise : Promise.resolve({ getPage: async () => ({
        getViewport: () => ({ width: 200, height: 240 }), render: renderB
      }) })
    }))
    await upload(1)
    await new Promise((resolve) => setTimeout(resolve, 110))
    await click('重新上传')
    await upload(2)
    await new Promise((resolve) => setTimeout(resolve, 110))
    await flushPromises()
    first.resolve({ getPage: async () => ({ getViewport: () => ({ width: 100, height: 120 }), render: renderA }) })
    await flushPromises()
    expect(renderB).toHaveBeenCalledOnce()
    expect(renderA).not.toHaveBeenCalled()
    expect((view!.get('canvas').element as HTMLCanvasElement).width).toBe(200)
  })
})
