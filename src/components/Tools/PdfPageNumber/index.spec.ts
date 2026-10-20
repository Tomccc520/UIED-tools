import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import PdfPageNumber from './index.vue'

const runtime = vi.hoisted(() => ({ getDocument: vi.fn(), getPage: vi.fn(), render: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-page-number' }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({
  getPdfFileError: () => '',
  ensurePdfjsRuntime: async () => ({ getDocument: runtime.getDocument }),
  ensurePdfLibRuntime: vi.fn(),
}))

/** 用真实私有字段模拟 PDF.js 文档，防止普通对象桩掩盖 Vue Proxy 错误。 */
class PrivatePdfDocument {
  numPages = 2
  #getPage = runtime.getPage

  /** 使用私有成员获取页面，调用者必须保持原文档实例。 */
  getPage(pageNumber: number) {
    return this.#getPage(pageNumber)
  }
}

let wrapper: VueWrapper | undefined
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks() })

describe('PDF 页码预览文档实例', () => {
  it('含私有字段的文档上传后可显示非零页面并翻页', async () => {
    runtime.getDocument.mockReturnValue({ promise: Promise.resolve(new PrivatePdfDocument()) })
    runtime.getPage.mockResolvedValue({
      getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
      render: runtime.render,
    })
    runtime.render.mockReturnValue({ promise: Promise.resolve() })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D)
    wrapper = mount(PdfPageNumber, {
      global: {
        mocks: { $ensureFreeToolTitle: (title: string) => title },
        stubs: { ToolsRecommend: true, UsageGuide: true, ElSlider: true, ElInputNumber: true, ElSelect: true, ElOption: true, ElRadioGroup: true, ElRadio: true, ElButton: true },
      },
    })
    const file = new File(['pdf fixture'], 'page-numbers.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(4) })
    Object.defineProperty(wrapper.get('input[type=file]').element, 'files', { value: [file] })
    await wrapper.get('input[type=file]').trigger('change')
    await flushPromises()

    const canvas = wrapper.get('canvas').element as HTMLCanvasElement
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(800)
    expect(runtime.render).toHaveBeenCalledOnce()
    const next = wrapper.findAll('button').find(button => button.text() === '下一页')!
    await next.trigger('click')
    await flushPromises()
    expect(runtime.getPage).toHaveBeenLastCalledWith(2)
    expect(runtime.render).toHaveBeenCalledTimes(2)
  })
})
