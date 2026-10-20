/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { PDFDocument, degrees } from 'pdf-lib'
import PdfRotate from './index.vue'
import PdfDelete from '../PdfDelete/index.vue'

const runtime = vi.hoisted(() => ({
  getDocument: vi.fn(), create: vi.fn(), load: vi.fn(),
  error: vi.fn(), success: vi.fn(), warning: vi.fn(),
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-rotate' }) }))
vi.mock('element-plus', () => ({ ElMessage: runtime }))
vi.mock('@/utils/pdf', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/utils/pdf')>(),
  ensurePdfjsRuntime: async () => ({ getDocument: runtime.getDocument }),
  ensurePdfLibRuntime: async () => ({ PDFDocument: { create: runtime.create, load: runtime.load }, degrees }),
}))
const DraggableStub = defineComponent({
  props: ['modelValue'],
  setup(props, { slots }) {
    return () => h('div', props.modelValue.map((element: unknown, index: number) => slots.item?.({ element, index })))
  },
})

let wrapper: VueWrapper | undefined
let exported: PDFDocument[]
let viewportAngles: number[]
let sourceBytes: Uint8Array

/** 构造页面宽度各异的真实 PDF，宽度用于独立确认复制的是哪一个源页面。 */
const createSource = async (rotations = [0, 0, 0]) => {
  const pdf = await PDFDocument.create()
  rotations.forEach((rotation, index) => pdf.addPage([300 + index * 100, 600]).setRotation(degrees(rotation)))
  sourceBytes = await pdf.save()
}

/** 加载真实 PDF 文件；仅预览渲染替身不参与导出 PDF 的页序及角度判断。 */
const mountTool = async (component = PdfRotate) => {
  wrapper = mount(component, { global: {
    mocks: { $ensureFreeToolTitle: (value: string) => value },
    stubs: { VueDraggable: DraggableStub, draggable: DraggableStub, ToolsRecommend: true, UsageGuide: true },
  } })
  const file = new File(['pdf'], 'pages.pdf')
  Object.defineProperty(file, 'arrayBuffer', { value: async () => sourceBytes.slice().buffer })
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
  await input.trigger('change')
  await flushPromises()
  return wrapper
}

beforeEach(async () => {
  vi.clearAllMocks()
  exported = []
  viewportAngles = []
  await createSource()
  runtime.load.mockImplementation((bytes) => PDFDocument.load(bytes))
  runtime.create.mockImplementation(async () => {
    const pdf = await PDFDocument.create()
    exported.push(pdf)
    return pdf
  })
  runtime.getDocument.mockImplementation((input) => ({ promise: (async () => {
    const source = await PDFDocument.load(input?.data ?? input)
    return { numPages: source.getPageCount(), destroy: vi.fn().mockResolvedValue(undefined), getPage: async (number: number) => ({
      rotate: source.getPage(number - 1).getRotation().angle,
      getViewport: ({ scale, rotation = source.getPage(number - 1).getRotation().angle }: any) => {
        viewportAngles.push(rotation)
        return { width: 300 * scale, height: 600 * scale, rotation }
      },
      render: () => ({ promise: Promise.resolve(), cancel: vi.fn() }),
    }) }
  })(), destroy: vi.fn() }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ clearRect: vi.fn() } as any)
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:pdf-test'), revokeObjectURL: vi.fn() })
})
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('PDF 公共上传入口', () => {
  it.each([PdfRotate, PdfDelete])('拒绝非法与超限文件后仍可选择 PDF，清空后允许重新选择同一文件', async (component) => {
    const view = await mountTool(component)
    const vm = view.vm as any
    const file = vm.currentFile as File
    vm.clearFile()
    await flushPromises()
    const previousLoads = runtime.getDocument.mock.calls.length
    const input = view.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['text'], 'notes.txt', { type: 'text/plain' })] })
    await input.trigger('change')
    await flushPromises()
    expect(runtime.error).toHaveBeenCalledWith('仅支持PDF文件')
    expect(runtime.getDocument).toHaveBeenCalledTimes(previousLoads)
    expect(vm.currentFile).toBeNull()
    expect(view.get('button[aria-label="选择 PDF 文件"]').attributes('disabled')).toBeUndefined()

    const oversized = new File([], 'oversized.pdf', { type: 'application/pdf' })
    Object.defineProperty(oversized, 'size', { value: 200 * 1024 * 1024 + 1 })
    Object.defineProperty(input.element, 'files', { configurable: true, value: [oversized] })
    await input.trigger('change')
    await flushPromises()
    expect(runtime.error).toHaveBeenCalledWith('文件大小不能超过200MB')
    expect(runtime.getDocument).toHaveBeenCalledTimes(previousLoads)
    expect(vm.currentFile).toBeNull()

    Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
    await input.trigger('change')
    await flushPromises()
    expect(view.findAll('canvas')).toHaveLength(3)
    expect((input.element as HTMLInputElement).value).toBe('')
  })
})

describe('PDF 页面旋转与删除的真实导出', () => {
  it('拖拽为 C/A/B 后保持源页顺序，只旋转 C 而不误转 A', async () => {
    const view = await mountTool()
    const vm = view.vm as any
    vm.pages = [vm.pages[2], vm.pages[0], vm.pages[1]]
    await vm.rotatePage(0, 90)
    await vm.savePDF()
    expect(runtime.error).not.toHaveBeenCalled()
    expect(exported[0].getPages().map((page) => page.getWidth())).toEqual([500, 300, 400])
    expect(exported[0].getPages().map((page) => page.getRotation().angle)).toEqual([90, 0, 0])
  })

  it('保存开始后即快照顺序和角度，等待依赖期间的编辑不会改变本次导出', async () => {
    const view = await mountTool()
    const vm = view.vm as any
    const saving = vm.savePDF()
    vm.pages.reverse()
    vm.pages[0].rotation = 180
    await saving
    expect(exported[0].getPages().map((page) => page.getWidth())).toEqual([300, 400, 500])
    expect(exported[0].getPages().map((page) => page.getRotation().angle)).toEqual([0, 0, 0])
  })

  it.each([90, 180, 270])('删除工具支持增量旋转 %s 度并导出 Rotation 对象', async (angle) => {
    const view = await mountTool(PdfDelete)
    const vm = view.vm as any
    vm.pdfPages[0].selected = true
    vm.pdfPages[1].deleted = true
    await vm.rotateSelectedPages(angle)
    await vm.savePDF()
    expect(runtime.error).not.toHaveBeenCalled()
    expect(exported[0].getPages().map((page) => page.getWidth())).toEqual([300, 500])
    expect(exported[0].getPages().map((page) => page.getRotation().angle)).toEqual([angle, 0])
  })

  it('源页面已旋转 90 度，两款工具再旋转 90 度均导出 180 度', async () => {
    await createSource([90, 0, 0])
    for (const component of [PdfRotate, PdfDelete]) {
      const view = await mountTool(component)
      const vm = view.vm as any
      if (component === PdfRotate) await vm.rotatePage(0, 90)
      else { vm.pdfPages[0].selected = true; await vm.rotateSelectedPages(90) }
      await vm.savePDF()
      expect(runtime.error).not.toHaveBeenCalled()
      expect(exported[exported.length - 1].getPage(0).getRotation().angle).toBe(180)
      view.unmount()
      wrapper = undefined
    }
  })

  it('删除工具按快照顺序串行复制，首个页面较慢时也不会被后续页抢先加入', async () => {
    const view = await mountTool(PdfDelete)
    const vm = view.vm as any
    vm.pdfPages = [vm.pdfPages[2], vm.pdfPages[0], vm.pdfPages[1]]
    let release!: () => void
    const pending = new Promise<void>((resolve) => { release = resolve })
    runtime.create.mockImplementationOnce(async () => {
      const pdf = await PDFDocument.create()
      exported.push(pdf)
      const copy = pdf.copyPages.bind(pdf)
      vi.spyOn(pdf, 'copyPages').mockImplementation(async (source, indices) => {
        if (indices[0] === 2) await pending
        return copy(source, indices)
      })
      return pdf
    })
    const saving = vm.savePDF()
    await flushPromises()
    vm.pdfPages.reverse()
    vm.pdfPages[0].rotation = 270
    release()
    await saving
    expect(exported[0].getPages().map((page) => page.getWidth())).toEqual([500, 300, 400])
    expect(exported[0].getPages().map((page) => page.getRotation().angle)).toEqual([0, 0, 0])
  })

  it('不能导出零页 PDF，全部标记删除时保留编辑状态并提示', async () => {
    const view = await mountTool(PdfDelete)
    const vm = view.vm as any
    vm.pdfPages.forEach((page: any) => { page.deleted = true })
    await vm.savePDF()
    expect(runtime.warning).toHaveBeenCalledWith('请至少保留一页后再保存')
    expect(runtime.create).not.toHaveBeenCalled()
    expect(vm.pdfPages).toHaveLength(3)
  })
})

describe('PDF 旋转预览', () => {
  it('旋转仅由 PDF.js 完成，画布不再叠加同角度 CSS 旋转', async () => {
    const view = await mountTool()
    await (view.vm as any).rotatePage(0, 90)
    await flushPromises()
    expect(viewportAngles).toContain(90)
    expect(view.get('canvas').element.style.transform).toBe('')
  })

  it('重置会重新绘制源页面原来的角度，而非仅清空增量', async () => {
    await createSource([90, 0, 0])
    const view = await mountTool()
    await (view.vm as any).rotatePage(0, 90)
    await flushPromises()
    viewportAngles.length = 0
    await (view.vm as any).resetRotation()
    await flushPromises()
    expect(viewportAngles).toContain(90)
    expect(viewportAngles).not.toContain(180)
  })

  it.each([PdfRotate, PdfDelete])('清除等待中的文件后，不会被旧文档结果重新填充页面', async (component) => {
    let resolveDocument!: (value: unknown) => void
    const pending = new Promise((resolve) => { resolveDocument = resolve })
    const destroy = vi.fn().mockResolvedValue(undefined)
    runtime.getDocument.mockReturnValueOnce({ promise: pending })
    wrapper = mount(component, { global: {
      mocks: { $ensureFreeToolTitle: (value: string) => value },
      stubs: { VueDraggable: DraggableStub, draggable: DraggableStub, ToolsRecommend: true, UsageGuide: true },
    } })
    const file = new File(['pdf'], 'late.pdf')
    Object.defineProperty(file, 'arrayBuffer', { value: async () => sourceBytes.slice().buffer })
    const loading = (wrapper.vm as any).handleFile(file)
    await flushPromises()
    ;(wrapper.vm as any).clearFile()
    resolveDocument({ numPages: 3, destroy })
    await loading
    expect(destroy).toHaveBeenCalled()
    expect((wrapper.vm as any).currentFile).toBeNull()
    expect(wrapper.findAll('canvas')).toHaveLength(0)
  })
})
