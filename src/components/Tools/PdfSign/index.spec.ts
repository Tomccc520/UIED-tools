import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import PdfSign from './index.vue'

const runtime = vi.hoisted(() => ({ getDocument: vi.fn(), getPage: vi.fn(), render: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-sign' }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({
  getPdfFileError: () => '',
  ensurePdfjsRuntime: async () => ({ getDocument: runtime.getDocument }),
  ensurePdfLibRuntime: vi.fn(),
}))

const ButtonStub = defineComponent({
  props: { disabled: Boolean, loading: Boolean },
  template: '<button :disabled="disabled || loading"><slot /></button>',
})
let wrapper: VueWrapper | undefined

/** 模拟 PDF.js 含原生私有字段的文档；深层 Vue Proxy 调用会直接报错。 */
class PrivatePdfDocument {
  numPages = 2
  #getPage = runtime.getPage

  /** 读取私有成员后转发页面请求，确保测试能暴露错误的响应式代理。 */
  getPage(pageNumber: number) {
    return this.#getPage(pageNumber)
  }
}

/** 通过真实上传入口和鼠标事件创建签名，不直接修改组件内部状态。 */
async function uploadAndDrawSignature() {
  wrapper = mount(PdfSign, {
    global: { stubs: { ElButton: ButtonStub, ToolsRecommend: true, UsageGuide: true } },
  })
  const file = new File(['pdf fixture'], 'signature.pdf', { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(4) })
  Object.defineProperty(wrapper.get('input[type=file]').element, 'files', { value: [file] })
  await wrapper.get('input[type=file]').trigger('change')
  await flushPromises()
  const pad = wrapper.get('canvas')
  await pad.trigger('mousedown', { clientX: 30, clientY: 20 })
  await pad.trigger('mousemove', { clientX: 60, clientY: 40 })
  await pad.trigger('mouseup')
  return wrapper
}

/** 按可见文案查找操作按钮，使测试跟随实际用户流程。 */
function buttonNamed(text: string) {
  return wrapper!.findAll('button').find(button => button.text() === text)!
}

beforeEach(() => {
  vi.clearAllMocks()
  runtime.getDocument.mockReturnValue({
    promise: Promise.resolve(new PrivatePdfDocument()),
  })
  runtime.getPage.mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render: runtime.render,
  })
  runtime.render.mockReturnValue({ promise: Promise.resolve() })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), clearRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,c2lnbmF0dXJl')
})

afterEach(() => {
  wrapper?.unmount()
  vi.restoreAllMocks()
})

describe('PDF 签名首次确认预览', () => {
  it('先挂载预览画布，再渲染 PDF 并按非零尺寸居中签名', async () => {
    await uploadAndDrawSignature()
    expect(wrapper!.findAll('canvas')).toHaveLength(1)
    expect(runtime.render).not.toHaveBeenCalled()
    await buttonNamed('使用此签名').trigger('click')
    await flushPromises()

    expect(runtime.getPage).toHaveBeenCalledWith(1)
    expect(runtime.render).toHaveBeenCalledOnce()
    const canvas = wrapper!.get('.pdf-canvas-scroll canvas').element as HTMLCanvasElement
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(800)
    expect(canvas.parentElement!.style.width).toBe('600px')
    expect(canvas.parentElement!.style.height).toBe('800px')
    const signature = wrapper!.get('.pdf-canvas-scroll img').element.parentElement!
    expect(signature.style.left).toBe('225px')
    expect(signature.style.top).toBe('362.5px')
    expect(buttonNamed('生成并下载PDF').attributes('disabled')).toBeUndefined()
    expect(wrapper!.get('button[aria-label="上一页"]').attributes('disabled')).toBeDefined()
    expect(wrapper!.get('button[aria-label="下一页"]').attributes('disabled')).toBeUndefined()
  })

  it('含私有字段的 PDF 文档可以继续翻页渲染', async () => {
    await uploadAndDrawSignature()
    await buttonNamed('使用此签名').trigger('click')
    await flushPromises()
    await wrapper!.get('button[aria-label="下一页"]').trigger('click')
    await flushPromises()
    expect(runtime.getPage).toHaveBeenLastCalledWith(2)
    expect(runtime.render).toHaveBeenCalledTimes(2)
    expect(wrapper!.find('[role=alert]').exists()).toBe(false)
    expect(wrapper!.text()).toContain('第 2 / 2 页')
  })

  it('预览尚在渲染时禁止重复确认、翻页和导出', async () => {
    let finish!: () => void
    runtime.render.mockReturnValue({ promise: new Promise<void>(resolve => { finish = resolve }) })
    await uploadAndDrawSignature()
    await buttonNamed('使用此签名').trigger('click')
    await flushPromises()
    expect(wrapper!.get('[role=status]').text()).toContain('正在加载')
    expect(buttonNamed('使用此签名').attributes('disabled')).toBeDefined()
    expect(buttonNamed('生成并下载PDF').attributes('disabled')).toBeDefined()
    expect(wrapper!.get('button[aria-label="下一页"]').attributes('disabled')).toBeDefined()
    finish()
    await flushPromises()
    expect(wrapper!.find('[role=status]').exists()).toBe(false)
    expect(buttonNamed('生成并下载PDF').attributes('disabled')).toBeUndefined()
  })

  it('预览失败时明确提示、禁止导出，并允许重新确认恢复', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    runtime.getPage.mockRejectedValueOnce(new Error('PDF fixture render failure'))
    await uploadAndDrawSignature()
    await buttonNamed('使用此签名').trigger('click')
    await flushPromises()
    expect(wrapper!.get('[role=alert]').text()).toBe('PDF 预览加载失败，请重新确认签名')
    expect(wrapper!.text()).not.toContain('PDF fixture render failure')
    expect(buttonNamed('生成并下载PDF').attributes('disabled')).toBeDefined()
    await buttonNamed('使用此签名').trigger('click')
    await flushPromises()
    expect(wrapper!.find('[role=alert]').exists()).toBe(false)
    expect((wrapper!.get('.pdf-canvas-scroll canvas').element as HTMLCanvasElement).width).toBe(600)
    expect(buttonNamed('生成并下载PDF').attributes('disabled')).toBeUndefined()
  })
})
