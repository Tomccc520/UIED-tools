import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import PdfSplit from './index.vue'

const runtime = vi.hoisted(() => ({ getDocument: vi.fn(), destroy: vi.fn().mockResolvedValue(undefined) }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-split' }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: vi.fn(), warning: vi.fn(), success: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({ getPdfFileError: () => '', ensurePdfjsRuntime: async () => runtime, ensurePdfLibRuntime: vi.fn() }))
let wrapper: VueWrapper | undefined
afterEach(() => { wrapper?.unmount(); vi.restoreAllMocks() })

describe('PDF 分割预览取消', () => {
  it('清除仍在加载的文件后，旧预览不能重新填入页面', async () => {
    let resolveDocument!: (value: unknown) => void
    const promise = new Promise((resolve) => { resolveDocument = resolve })
    runtime.getDocument.mockReturnValue({ promise, destroy: runtime.destroy })
    wrapper = mount(PdfSplit, { global: { stubs: { ToolsRecommend: true, UsageGuide: true } } })
    const file = new File(['pdf'], 'pending.pdf')
    Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(3) })
    Object.defineProperty(wrapper.get('input[type=file]').element, 'files', { value: [file], configurable: true })
    await wrapper.get('input[type=file]').trigger('change')
    await flushPromises()
    const cancel = wrapper.findAll('button').find((button) => button.text() === '取消加载')!
    await cancel.trigger('click')
    resolveDocument({ numPages: 1, getPage: vi.fn() })
    await flushPromises()
    expect(runtime.destroy).toHaveBeenCalled()
    expect(wrapper.find('input[type=file]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('页面预览 (')
    expect(wrapper.text()).not.toContain('正在加载 PDF')
  })
})
