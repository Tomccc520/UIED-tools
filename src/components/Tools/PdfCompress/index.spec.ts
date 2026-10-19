import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import PdfCompress from './index.vue'

const messages = vi.hoisted(() => ({ error: vi.fn(), warning: vi.fn(), success: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-compress' }) }))
vi.mock('element-plus', () => ({ ElMessage: messages, ElMessageBox: { alert: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({
  getPdfFileError: (file: File) => file.name.endsWith('.pdf') ? '' : '仅支持PDF文件',
  ensurePdfjsRuntime: () => new Promise(() => undefined)
}))
const UploadStub = defineComponent({
  props: ['onChange'],
  setup(props, { expose }) {
    expose({ handleRemove: vi.fn(), clearFiles: vi.fn() })
    /** 通过上传组件回调提交文件，模拟其内部已接收原始文件的行为。 */
    const upload = (event: Event) => {
      const file = (event.target as HTMLInputElement).files![0]
      props.onChange({ raw: file, name: file.name, size: file.size, uid: 42, status: 'ready' }, [])
    }
    return { upload }
  },
  template: '<input type="file" @change="upload" />'
})
let wrapper: VueWrapper | undefined
beforeEach(() => {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:qa'), revokeObjectURL: vi.fn() })
  vi.clearAllMocks()
})
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals() })

/** 使用隔离的上传组件验证业务队列，避免真实 PDF 渲染干扰文件入队规则。 */
const mountTool = () => {
  wrapper = mount(PdfCompress, { global: {
    mocks: { $ensureFreeToolTitle: (value: string) => value },
    stubs: { ElUpload: UploadStub, ToolsRecommend: true, UsageGuide: true, ElDialog: true,
      ElInputNumber: true, ElSlider: true, ElSelect: true, ElOption: true, ElInput: true, ElSwitch: true }
  } })
  return wrapper
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
