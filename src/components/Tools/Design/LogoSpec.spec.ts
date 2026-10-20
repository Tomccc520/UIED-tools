/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import LogoSpec from './LogoSpec.vue'

const runtime = vi.hoisted(() => ({
  warning: vi.fn(), error: vi.fn(), success: vi.fn(), render: vi.fn(), loadCanvas: vi.fn(), loadPdf: vi.fn(),
  save: vi.fn(), addImage: vi.fn(), addPage: vi.fn(), decode: vi.fn()
}))
vi.mock('element-plus', () => ({ ElMessage: runtime }))
vi.mock('@vueuse/head', () => ({ useHead: vi.fn() }))
vi.mock('@/utils/toolRuntimeLoaders', () => ({
  ensureHtml2canvasRuntime: runtime.loadCanvas,
  ensureJsPdfRuntime: runtime.loadPdf
}))

const DialogStub = defineComponent({
  props: ['modelValue'],
  setup(props, { slots }) {
    return () => props.modelValue ? h('section', { role: 'dialog' }, [slots.default?.(), slots.footer?.()]) : null
  }
})
const ButtonStub = defineComponent({
  props: ['disabled', 'loading'],
  setup(props, { slots, attrs }) {
    return () => h('button', { ...attrs, type: 'button', disabled: props.disabled }, slots.default?.())
  }
})
let view: VueWrapper | undefined
const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jG1sAAAAASUVORK5CYII='

/** PDF 替身仅记录页面与下载行为，组件仍通过真实的按需加载入口调用它。 */
function PdfStub() {
  return {
    getImageProperties: () => ({ width: 760, height: 1600 }),
    internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
    addImage: runtime.addImage, addPage: runtime.addPage, save: runtime.save
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  runtime.decode.mockResolvedValue(undefined)
  runtime.render.mockResolvedValue({ toDataURL: () => logoUrl })
  runtime.loadCanvas.mockResolvedValue({ html2canvas: runtime.render })
  runtime.loadPdf.mockResolvedValue({ jsPDF: PdfStub })
  runtime.save.mockResolvedValue(undefined)
  vi.stubGlobal('FileReader', class {
    onload: ((event: unknown) => void) | null = null
    /** 立即提供本地图片数据，避免规范预览测试依赖浏览器文件读取时序。 */
    readAsDataURL() { this.onload?.({ target: { result: logoUrl } }) }
  })
  Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: runtime.decode })
})
afterEach(() => {
  view?.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  delete (HTMLImageElement.prototype as any).decode
})

/** 保留原生表单与预览 DOM，只替换对话框传送和 PDF 运行时。 */
function mountTool() {
  view = mount(LogoSpec, { global: { stubs: { ElDialog: DialogStub, ElButton: ButtonStub } } })
  return view
}

/** 按可见文案定位操作按钮，覆盖用户入口而不直接调用生成函数。 */
function button(text: string) {
  return view!.findAll('button').find(item => item.text() === text)!
}

/** 通过实际文件输入与品牌名称表单准备一份可生成的规范。 */
async function fillRequired() {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['logo'], 'logo.png', { type: 'image/png' })] })
  await input.trigger('change')
  await view!.get('#brandName').setValue('示例品牌')
  await flushPromises()
}

describe('Logo 规范预览与 PDF 导出', () => {
  it('缺少 Logo 或品牌名称时给出提示，不打开空白预览或加载导出库', async () => {
    mountTool()
    await button('生成规范文档').trigger('click')
    expect(runtime.warning).toHaveBeenCalledWith('请上传 Logo 并填写品牌名称')
    expect(view!.find('[role="dialog"]').exists()).toBe(false)
    await fillRequired()
    await view!.get('#brandName').setValue('   ')
    await button('生成规范文档').trigger('click')
    expect(view!.find('[role="dialog"]').exists()).toBe(false)
    expect(runtime.loadCanvas).not.toHaveBeenCalled()
    expect(runtime.loadPdf).not.toHaveBeenCalled()
  })

  it('生成后显示真实 Logo、品牌信息、颜色、尺寸与选中的使用规范，保留作品色值', async () => {
    mountTool()
    await fillRequired()
    await view!.get('#brandDesc').setValue('让设计更清晰')
    await view!.get('#logoType').setValue('pictorial')
    await view!.get('input[value="digital"]').setValue(true)
    await view!.get('input[value="recolor"]').setValue(true)
    await button('生成规范文档').trigger('click')
    const preview = view!.get('.preview-content')
    expect(preview.get('img').attributes('src')).toBe(logoUrl)
    expect(preview.text()).toContain('示例品牌 Logo 使用规范')
    expect(preview.text()).toContain('让设计更清晰')
    expect(preview.text()).toContain('图形标志')
    expect(preview.text()).toContain('#000000')
    expect(preview.text()).toContain('20 mm')
    expect(preview.text()).toContain('60 px')
    expect(preview.text()).toContain('安全区域：20%')
    expect(preview.text()).toContain('数字媒体')
    expect(preview.text()).toContain('禁止改色')
    expect(preview.text()).not.toContain('禁止旋转')
    expect(preview.get('.spec-color-swatch').attributes('style')).toContain('rgb(0, 0, 0)')
    expect(button('下载 PDF').exists()).toBe(true)
    expect(runtime.loadCanvas).not.toHaveBeenCalled()
  })

  it('下载入口按需加载完整预览，导出期间禁止重复执行，完成后才提示成功', async () => {
    mountTool()
    await fillRequired()
    await button('生成规范文档').trigger('click')
    let resolveRender!: (value: unknown) => void
    runtime.render.mockImplementationOnce(() => new Promise(resolve => { resolveRender = resolve }))
    await button('下载 PDF').trigger('click')
    await flushPromises()
    expect((view!.vm as any).exporting).toBe(true)
    expect(button('正在导出').attributes('disabled')).toBeDefined()
    await (view!.vm as any).downloadSpec()
    expect(runtime.render).toHaveBeenCalledTimes(1)
    expect(runtime.render.mock.calls[0][0]).toBe(view!.get('.preview-content').element)
    expect(runtime.success).not.toHaveBeenCalled()
    resolveRender({ toDataURL: () => logoUrl })
    await flushPromises()
    expect(runtime.addPage).toHaveBeenCalledOnce()
    expect(runtime.save).toHaveBeenCalledWith('示例品牌_logo规范.pdf', { returnPromise: true })
    expect(runtime.success).toHaveBeenCalledWith('Logo 规范 PDF 已下载')
    expect((view!.vm as any).exporting).toBe(false)
  })

  it.each(['decode', 'render', 'save'] as const)('%s 失败时显示错误、不提示成功，并保留预览和重试入口', async (failure) => {
    mountTool()
    await fillRequired()
    await button('生成规范文档').trigger('click')
    runtime[failure].mockRejectedValueOnce(new Error('isolated export failure'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await button('下载 PDF').trigger('click')
    await flushPromises()
    expect(runtime.error).toHaveBeenCalledWith('生成 PDF 时出错，请重试')
    expect(runtime.success).not.toHaveBeenCalled()
    expect(view!.find('.preview-content').exists()).toBe(true)
    expect(button('下载 PDF').attributes('disabled')).toBeUndefined()
    if (failure !== 'save') expect(runtime.save).not.toHaveBeenCalled()
  })

  it('非法颜色或非正尺寸不进入预览，避免导出不正确的规范参数', async () => {
    mountTool()
    await fillRequired()
    const vm = view!.vm as any
    vm.colors[0].hex = '#not-a-color'
    await button('生成规范文档').trigger('click')
    expect(view!.find('.preview-content').exists()).toBe(false)
    expect(runtime.warning).toHaveBeenCalledWith('请填写有效的六位 HEX 颜色，例如 #6C54FF')
    vm.colors[0].hex = '#000000'
    vm.minSizePrint = 0
    await button('生成规范文档').trigger('click')
    expect(runtime.warning).toHaveBeenCalledWith('最小尺寸必须为大于 0 的数字')
    expect(view!.find('.preview-content').exists()).toBe(false)
  })
})
