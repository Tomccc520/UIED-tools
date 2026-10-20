import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import JSZip from 'jszip'
import PdfCompress from './index.vue'

const messages = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), success: vi.fn() }))
const media = vi.hoisted(() => ({ mobile: false }))
const pdfRuntime = vi.hoisted(() => ({ enabled: false, outputSize: 3, getDocument: vi.fn(), getPage: vi.fn(), render: vi.fn(), cleanup: vi.fn(), destroy: vi.fn(), addImage: vi.fn() }))
vi.mock('@vueuse/core', async () => {
  const { ref } = await import('vue')
  return { useMediaQuery: () => ref(media.mobile) }
})
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-compress' }) }))
vi.mock('element-plus', () => ({ ElMessage: messages, ElMessageBox: { alert: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({
  getPdfFileError: (file: File) => file.name.endsWith('.pdf') ? '' : '仅支持PDF文件',
  ensurePdfjsRuntime: () => pdfRuntime.enabled
    ? Promise.resolve({ getDocument: pdfRuntime.getDocument })
    : new Promise(() => undefined)
}))
vi.mock('@/utils/toolRuntimeLoaders', () => ({
  ensureJsPdfRuntime: async () => ({
    jsPDF: class {
      setProperties() {}
      addImage = pdfRuntime.addImage
      /** 模拟有效且小于源文件的导出，不改动真实压缩队列逻辑。 */
      output() {
        const blob = new Blob(['x'.repeat(pdfRuntime.outputSize)])
        Object.defineProperty(blob, 'arrayBuffer', { value: async () => new ArrayBuffer(pdfRuntime.outputSize) })
        return blob
      }
    },
  }),
}))
const UploadStub = defineComponent({
  props: ['onChange'],
  setup(props, { expose }) {
    expose({ handleRemove: vi.fn(), clearFiles: vi.fn() })
    /** 通过上传组件回调提交文件，模拟其内部已接收原始文件的行为。 */
    const upload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files![0]
      props.onChange({ raw: file, name: file.name, size: file.size, uid: `${file.name}_${file.size}`, status: 'ready' }, [])
    }
    return { upload }
  },
  template: '<input type="file" @change="upload" />'
})
const MobileActionsStub = defineComponent({
  props: ['title', 'description', 'actionLabel', 'disabled', 'busy', 'hidden'],
  emits: ['action'],
  template: '<section v-if="!hidden" aria-label="PDF 压缩操作"><span>{{description}}</span><button :disabled="disabled || busy" @click="$emit(\'action\')">{{actionLabel}}</button></section>',
})
const DialogStub = defineComponent({
  props: ['modelValue', 'fullscreen', 'title'],
  emits: ['update:modelValue'],
  template: '<div v-if="modelValue" role="dialog"><button aria-label="关闭预览" @click="$emit(\'update:modelValue\', false)">关闭</button><slot /></div>',
})
let wrapper: VueWrapper | undefined
beforeEach(() => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:qa'), revokeObjectURL: vi.fn() })
  vi.clearAllMocks()
  media.mobile = false
  pdfRuntime.enabled = false
  pdfRuntime.outputSize = 3
})
afterEach(() => { wrapper?.unmount(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

/** 使用隔离的上传组件验证业务队列，避免真实 PDF 渲染干扰文件入队规则。 */
const mountTool = () => {
  wrapper = mount(PdfCompress, { global: {
    mocks: { $ensureFreeToolTitle: (value: string) => value },
    stubs: { ElUpload: UploadStub, ToolsRecommend: true, UsageGuide: true, ElDialog: DialogStub, MobileToolActions: MobileActionsStub,
      ElInputNumber: true, ElSlider: true, ElSelect: true, ElOption: true, ElInput: true, ElSwitch: true }
  } })
  return wrapper
}

/** 通过上传入口添加可供压缩引擎读取的文件。 */
async function uploadPdf(name: string) {
  const file = new File(['x'.repeat(2048)], name, { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(2048), configurable: true })
  Object.defineProperty(wrapper!.get('input[type=file]').element, 'files', { value: [file], configurable: true })
  await wrapper!.get('input[type=file]').trigger('change')
  await flushPromises()
  return file
}

/** 模拟一页 PDF 的本地渲染，测试手机入口复用真实队列与下载状态。 */
function enablePdfRuntime() {
  pdfRuntime.enabled = true
  pdfRuntime.destroy.mockResolvedValue(undefined)
  pdfRuntime.getDocument.mockReturnValue({
    promise: Promise.resolve({ numPages: 1, getPage: pdfRuntime.getPage }), destroy: pdfRuntime.destroy,
  })
  pdfRuntime.getPage.mockResolvedValue({
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render: pdfRuntime.render, cleanup: pdfRuntime.cleanup,
  })
  pdfRuntime.render.mockReturnValue({ promise: Promise.resolve() })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn() } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,cGRm')
}

describe('PDF 压缩上传队列', () => {
  it('无效文件校验失败后不会进入可压缩队列', async () => {
    const view = mountTool()
    Object.defineProperty(view.get('input').element, 'files', { value: [new File(['bad'], 'bad.txt')], configurable: true })
    await view.get('input').trigger('change')
    await flushPromises()
    expect(messages.error).toHaveBeenCalledWith('仅支持PDF文件')
    expect(view.findAll('h4').filter((item) => item.text() === 'bad.txt')).toHaveLength(0)
    expect(view.findAll('button').some((button) => button.text() === '开始压缩')).toBe(false)
  })
  it('正常文件只加入一次，首次上传不会误报重复文件', async () => {
    const view = mountTool()
    Object.defineProperty(view.get('input').element, 'files', { value: [new File(['pdf'], 'ok.pdf')], configurable: true })
    await view.get('input').trigger('change')
    await flushPromises()
    expect(view.findAll('h4').filter((item) => item.text() === 'ok.pdf')).toHaveLength(1)
    expect(messages.warning).not.toHaveBeenCalled()
  })
})

describe('PDF 压缩手机工作区', () => {
  it('手机参数默认折叠，光栅化影响在操作前始终可见', async () => {
    media.mobile = true
    mountTool()
    await uploadPdf('mobile.pdf')
    expect((wrapper!.get('details.pdf-compress-parameters').element as HTMLDetailsElement).open).toBe(false)
    expect((wrapper!.get('details.pdf-compress-advanced').element as HTMLDetailsElement).open).toBe(false)
    const notice = wrapper!.get('[role=note]')
    expect(notice.text()).toContain('文字将无法选中、复制或搜索')
    expect(notice.element.closest('details')).toBeNull()
    const mobileBar = wrapper!.getComponent(MobileActionsStub)
    expect(mobileBar.props('actionLabel')).toBe('开始压缩 (1)')
    expect(mobileBar.props('description')).toContain('文字不可复制或搜索')
    expect(wrapper!.get('.pdf-compress-file-card').text()).toContain('mobile.pdf')
  })

  it('手机预览全屏并隐藏底部栏，关闭后恢复主操作', async () => {
    media.mobile = true
    mountTool()
    await uploadPdf('preview.pdf')
    await wrapper!.get('button[aria-label="预览 preview.pdf"]').trigger('click')
    expect(wrapper!.getComponent(DialogStub).props('fullscreen')).toBe(true)
    expect(wrapper!.getComponent(MobileActionsStub).props('hidden')).toBe(true)
    expect(wrapper!.find('[aria-label="PDF 压缩操作"]').exists()).toBe(false)
    expect(wrapper!.find('iframe').exists()).toBe(false)
    expect(wrapper!.find('canvas[aria-label="原始 PDF 第 1 页预览"]').exists()).toBe(true)
    await wrapper!.get('button[aria-label="关闭预览"]').trigger('click')
    expect(wrapper!.getComponent(MobileActionsStub).props('hidden')).toBe(false)
    expect(wrapper!.find('[aria-label="PDF 压缩操作"]').exists()).toBe(true)
  })

  it('底部入口压缩完整批次，完成后切换下载并保留每张卡片操作', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    await uploadPdf('first.pdf')
    await uploadPdf('second.pdf')
    const mobileBar = wrapper!.getComponent(MobileActionsStub)
    expect(mobileBar.props('actionLabel')).toBe('开始压缩 (2)')
    await mobileBar.get('button').trigger('click')
    expect(mobileBar.props('busy')).toBe(true)
    await flushPromises()
    expect(pdfRuntime.addImage).toHaveBeenCalledTimes(2)
    expect(pdfRuntime.cleanup).toHaveBeenCalledTimes(2)
    expect(mobileBar.props('actionLabel')).toBe('下载全部 (2)')
    expect(mobileBar.props('busy')).toBe(false)
    expect(wrapper!.find('button[aria-label="下载 first.pdf"]').exists()).toBe(true)
    expect(wrapper!.find('button[aria-label="下载 second.pdf"]').exists()).toBe(true)
    const zip = vi.spyOn(JSZip.prototype, 'generateAsync').mockResolvedValue(new Blob(['zip']))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.useFakeTimers()
    await mobileBar.get('button').trigger('click')
    await flushPromises()
    await vi.runAllTimersAsync()
    expect(zip).toHaveBeenCalledWith({ type: 'blob' })
    const entries = (zip.mock.contexts[0] as JSZip).files
    expect(Object.keys(entries).filter(name => !entries[name].dir)).toEqual([
      'compressed_pdfs/medium_first.pdf', 'compressed_pdfs/medium_second.pdf',
    ])
    expect(click).toHaveBeenCalledOnce()
    expect(mobileBar.props('busy')).toBe(false)
  })

  it('桌面参数保持展开且预览不切全屏', async () => {
    mountTool()
    await uploadPdf('desktop.pdf')
    expect((wrapper!.get('details.pdf-compress-parameters').element as HTMLDetailsElement).open).toBe(true)
    expect((wrapper!.get('details.pdf-compress-advanced').element as HTMLDetailsElement).open).toBe(true)
    await wrapper!.get('button[aria-label="预览 desktop.pdf"]').trigger('click')
    expect(wrapper!.getComponent(DialogStub).props('fullscreen')).toBe(false)
  })
})

describe('手机 PDF.js 预览', () => {
  it('直接读取源文件并渲染非零画布，翻页复用同一文档而不是 iframe', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    const file = await uploadPdf('pages.pdf')
    const reader = vi.spyOn(file, 'arrayBuffer')
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    pdfRuntime.getDocument.mockReturnValueOnce({
      promise: Promise.resolve({ numPages: 2, getPage: pdfRuntime.getPage }), destroy: pdfRuntime.destroy,
    })
    const count = pdfRuntime.getDocument.mock.calls.length
    await wrapper!.get('button[aria-label="预览 pages.pdf"]').trigger('click')
    await flushPromises()
    const canvas = wrapper!.get('.pdf-compress-preview-sheet canvas').element as HTMLCanvasElement
    expect(canvas.width).toBeGreaterThan(0)
    expect(canvas.height).toBeGreaterThan(0)
    expect(reader).toHaveBeenCalledOnce()
    expect(fetch).not.toHaveBeenCalled()
    expect(wrapper!.find('iframe').exists()).toBe(false)
    await wrapper!.get('button[aria-label="预览下一页"]').trigger('click')
    await flushPromises()
    expect(pdfRuntime.getPage).toHaveBeenLastCalledWith(2)
    expect(pdfRuntime.getDocument).toHaveBeenCalledTimes(count + 1)
    expect(wrapper!.get('.pdf-compress-preview-pages').text()).toContain('第 2 / 2 页')
  })

  it('切换原始和压缩结果会读取对应 Blob 并释放旧文档', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    await uploadPdf('switch.pdf')
    await wrapper!.getComponent(MobileActionsStub).get('button').trigger('click')
    await flushPromises()
    await wrapper!.get('button[aria-label="预览 switch.pdf"]').trigger('click')
    await flushPromises()
    const compressedInput = pdfRuntime.getDocument.mock.lastCall![0] as { data: ArrayBuffer }
    expect(compressedInput.data.byteLength).toBe(3)
    const previousDestroyCount = pdfRuntime.destroy.mock.calls.length
    const original = wrapper!.findAll('[role=dialog] button').find(button => button.text() === '原始文件')!
    await original.trigger('click')
    await flushPromises()
    const sourceInput = pdfRuntime.getDocument.mock.lastCall![0] as { data: ArrayBuffer }
    expect(sourceInput.data.byteLength).toBe(2048)
    expect(pdfRuntime.destroy.mock.calls.length).toBeGreaterThan(previousDestroyCount)
    expect(wrapper!.get('canvas').attributes('aria-label')).toBe('原始 PDF 第 1 页预览')
  })

  it('加载失败提供重试且不会展示原始错误，重试后恢复画布', async () => {
    media.mobile = true
    enablePdfRuntime()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mountTool()
    await uploadPdf('retry.pdf')
    pdfRuntime.getDocument.mockImplementationOnce(() => ({
      promise: Promise.reject(new Error('internal private PDF error')), destroy: pdfRuntime.destroy,
    }))
    await wrapper!.get('button[aria-label="预览 retry.pdf"]').trigger('click')
    await flushPromises()
    expect(wrapper!.get('[role=alert]').text()).toContain('PDF 预览加载失败')
    expect(wrapper!.text()).not.toContain('internal private PDF error')
    const retry = wrapper!.findAll('button').find(button => button.text() === '重试预览')!
    await retry.trigger('click')
    await flushPromises()
    expect(wrapper!.find('[role=alert]').exists()).toBe(false)
    expect((wrapper!.get('canvas').element as HTMLCanvasElement).width).toBeGreaterThan(0)
  })

  it('关闭时取消渲染并释放加载任务，旧任务结束不能覆盖重新打开的预览', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    await uploadPdf('close.pdf')
    let finish!: () => void
    const cancel = vi.fn()
    pdfRuntime.render.mockReturnValueOnce({ promise: new Promise<void>(resolve => { finish = resolve }), cancel })
    await wrapper!.get('button[aria-label="预览 close.pdf"]').trigger('click')
    await flushPromises()
    expect(wrapper!.get('[role=status]').text()).toContain('正在加载 PDF')
    const previousDestroyCount = pdfRuntime.destroy.mock.calls.length
    await wrapper!.get('button[aria-label="关闭预览"]').trigger('click')
    await flushPromises()
    expect(cancel).toHaveBeenCalledOnce()
    expect(pdfRuntime.destroy.mock.calls.length).toBeGreaterThan(previousDestroyCount)
    await wrapper!.get('button[aria-label="预览 close.pdf"]').trigger('click')
    await flushPromises()
    const canvas = wrapper!.get('canvas').element as HTMLCanvasElement
    const width = canvas.width
    finish()
    await flushPromises()
    expect(wrapper!.find('[role=status]').exists()).toBe(false)
    expect(wrapper!.find('[role=alert]').exists()).toBe(false)
    expect(canvas.width).toBe(width)
  })

  it('加载超时结束等待并提供重试入口', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    await uploadPdf('timeout.pdf')
    pdfRuntime.getDocument.mockReturnValueOnce({ promise: new Promise(() => {}), destroy: pdfRuntime.destroy })
    vi.useFakeTimers()
    await wrapper!.get('button[aria-label="预览 timeout.pdf"]').trigger('click')
    await flushPromises()
    await vi.advanceTimersByTimeAsync(30000)
    expect(wrapper!.find('[role=status]').exists()).toBe(false)
    expect(wrapper!.get('[role=alert]').text()).toContain('PDF 预览加载超时，请重试')
    expect(pdfRuntime.destroy).toHaveBeenCalled()
  })

  it('卸载时销毁加载任务，迟到的文档也会释放且不再渲染', async () => {
    media.mobile = true
    enablePdfRuntime()
    mountTool()
    await uploadPdf('unmount.pdf')
    let resolveDocument!: (document: unknown) => void
    pdfRuntime.getDocument.mockReturnValueOnce({
      promise: new Promise(resolve => { resolveDocument = resolve }), destroy: pdfRuntime.destroy,
    })
    await wrapper!.get('button[aria-label="预览 unmount.pdf"]').trigger('click')
    await flushPromises()
    const previousDestroyCount = pdfRuntime.destroy.mock.calls.length
    const previousPageCount = pdfRuntime.getPage.mock.calls.length
    wrapper!.unmount()
    wrapper = undefined
    expect(pdfRuntime.destroy.mock.calls.length).toBeGreaterThan(previousDestroyCount)
    const destroyLateDocument = vi.fn().mockResolvedValue(undefined)
    resolveDocument({ numPages: 1, getPage: pdfRuntime.getPage, destroy: destroyLateDocument })
    await flushPromises()
    expect(destroyLateDocument).toHaveBeenCalledOnce()
    expect(pdfRuntime.getPage).toHaveBeenCalledTimes(previousPageCount)
  })

  it('体积回退在卡片中明确显示保留原文件', async () => {
    media.mobile = true
    enablePdfRuntime()
    pdfRuntime.outputSize = 4096
    mountTool()
    await uploadPdf('already-small.pdf')
    await wrapper!.getComponent(MobileActionsStub).get('button').trigger('click')
    await flushPromises()
    expect(wrapper!.get('.pdf-compress-file-card').text()).toContain('保留原文件')
    expect(wrapper!.get('.pdf-compress-file-card').text()).not.toContain('减小 0.0%')
    expect(wrapper!.getComponent(MobileActionsStub).props('actionLabel')).toBe('下载 PDF')
  })
})
