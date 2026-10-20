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

/** 安装可控制完成顺序的读取替身，模拟取消后仍到达的浏览器旧回调。 */
function controlFileReads() {
  const readers: Array<{
    onload: ((event: unknown) => void) | null
    onerror: (() => void) | null
    onabort: (() => void) | null
    readyState: number
    abort: ReturnType<typeof vi.fn>
    readAsDataURL: ReturnType<typeof vi.fn>
  }> = []
  vi.stubGlobal('FileReader', class {
    onload: ((event: unknown) => void) | null = null
    onerror: (() => void) | null = null
    onabort: (() => void) | null = null
    readyState = 0
    /** 模拟启动读取，保留回调供测试决定完成顺序。 */
    readAsDataURL = vi.fn(() => { this.readyState = 1 })
    /** 模拟取消读取，不自动触发回调，以便单独验证过时事件保护。 */
    abort = vi.fn(() => { this.readyState = 2 })
    /** 保存每次创建的读取器，测试无需直接改动组件状态。 */
    constructor() { readers.push(this) }
  })
  return readers
}

/** 通过文件输入选择指定文件，保持与用户上传操作相同的事件入口。 */
async function chooseLogo(file: File) {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [file] })
  await input.trigger('change')
}

/** 创建带可辨识名称的合法 Logo，便于追踪多次上传的对应结果。 */
function logoFile(name: string) {
  return new File(['logo'], name, { type: 'image/png' })
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

describe('Logo 文件读取时序', () => {
  it('选择 A 后再选 B，只接收 B 的结果，取消后到达的 A 回调不覆盖预览', async () => {
    const readers = controlFileReads()
    mountTool()
    await chooseLogo(logoFile('A.png'))
    const oldLoad = readers[0].onload!
    const oldError = readers[0].onerror!
    await chooseLogo(logoFile('B.png'))
    expect(readers[0].abort).toHaveBeenCalledOnce()
    oldLoad({ target: { result: 'data:image/png;base64,A' } })
    oldError()
    await flushPromises()
    expect(view!.find('img[alt="Logo预览"]').exists()).toBe(false)
    expect(view!.find('[role="status"]').exists()).toBe(true)
    readers[1].onload!({ target: { result: 'data:image/png;base64,B' } })
    oldLoad({ target: { result: 'data:image/png;base64,A' } })
    await flushPromises()
    expect(view!.get('img[alt="Logo预览"]').attributes('src')).toBe('data:image/png;base64,B')
    expect((view!.vm as any).logoFile.name).toBe('B.png')
    expect(runtime.error).not.toHaveBeenCalled()
  })

  it('换图读取期间禁用生成，直接触发生成也不能复用上一张 Logo', async () => {
    const readers = controlFileReads()
    mountTool()
    await chooseLogo(logoFile('A.png'))
    readers[0].onload!({ target: { result: logoUrl } })
    await view!.get('#brandName').setValue('示例品牌')
    await flushPromises()
    await chooseLogo(logoFile('B.png'))
    expect(button('生成规范文档').attributes('disabled')).toBeDefined()
    expect(view!.get('[role="status"]').text()).toContain('正在读取 Logo')
    await (view!.vm as any).generateSpec()
    expect(runtime.warning).toHaveBeenCalledWith('Logo 尚未读取完成，请稍后重试')
    expect(view!.find('[role="dialog"]').exists()).toBe(false)
  })

  it.each(['重置', '移除Logo'])('读取期间%s会取消读取，旧成功或失败回调不能重填或报错', async (action) => {
    const readers = controlFileReads()
    mountTool()
    await chooseLogo(logoFile('pending.png'))
    const oldLoad = readers[0].onload!
    const oldError = readers[0].onerror!
    await button(action).trigger('click')
    oldLoad({ target: { result: logoUrl } })
    oldError()
    await flushPromises()
    expect(readers[0].abort).toHaveBeenCalledOnce()
    expect(view!.find('img[alt="Logo预览"]').exists()).toBe(false)
    expect(view!.find('[role="status"]').exists()).toBe(false)
    expect((view!.vm as any).logoFile).toBeNull()
    expect(runtime.error).not.toHaveBeenCalled()
  })

  it('读取失败给出提示并清理忙碌状态，可重新选择同一文件成功生成', async () => {
    const readers = controlFileReads()
    mountTool()
    const file = logoFile('retry.png')
    await chooseLogo(file)
    readers[0].onerror!()
    await flushPromises()
    expect(runtime.error).toHaveBeenCalledWith('Logo 读取失败，请重新选择文件')
    expect(button('生成规范文档').attributes('disabled')).toBeUndefined()
    expect((view!.vm as any).logoFile).toBeNull()
    await chooseLogo(file)
    readers[1].onload!({ target: { result: logoUrl } })
    await view!.get('#brandName').setValue('重试品牌')
    await button('生成规范文档').trigger('click')
    expect(view!.find('[role="dialog"]').exists()).toBe(true)
    expect(view!.get('.preview-content img').attributes('src')).toBe(logoUrl)
  })

  it('同步读取异常同样解除忙碌状态并保留重试入口', async () => {
    const readers = controlFileReads()
    mountTool()
    await chooseLogo(logoFile('first.png'))
    readers[0].onerror!()
    await flushPromises()
    // 下一次 FileReader 的读取方法在浏览器拒绝操作时同步抛出。
    vi.stubGlobal('FileReader', class {
      onload = null
      onerror = null
      onabort = null
      readyState = 0
      /** 模拟读取器在读取开始前抛出异常。 */
      readAsDataURL() { throw new Error('read unavailable') }
    })
    await chooseLogo(logoFile('throw.png'))
    expect(runtime.error).toHaveBeenLastCalledWith('Logo 读取失败，请重新选择文件')
    expect(view!.find('[role="status"]').exists()).toBe(false)
    expect((view!.vm as any).logoFile).toBeNull()
  })

  it.each(['type', 'size'] as const)('非法文件 %s 不清空已有 Logo 和已生成的规范预览', async (invalid) => {
    mountTool()
    await fillRequired()
    await button('生成规范文档').trigger('click')
    const file = invalid === 'type' ? new File(['text'], 'invalid.txt', { type: 'text/plain' }) : logoFile('large.png')
    if (invalid === 'size') Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 + 1 })
    await chooseLogo(file)
    expect(runtime.warning).toHaveBeenCalledWith(invalid === 'type' ? '请上传 PNG、JPG 或 SVG 格式的文件' : '文件大小不能超过 10MB')
    expect(view!.get('img[alt="Logo预览"]').attributes('src')).toBe(logoUrl)
    expect(view!.get('.preview-content img').attributes('src')).toBe(logoUrl)
  })

  it('组件卸载取消读取，已排队的成功或失败事件不更新状态或提示', async () => {
    const readers = controlFileReads()
    mountTool()
    await chooseLogo(logoFile('pending.png'))
    const vm = view!.vm as any
    const oldLoad = readers[0].onload!
    const oldError = readers[0].onerror!
    view!.unmount()
    view = undefined
    oldLoad({ target: { result: logoUrl } })
    oldError()
    await flushPromises()
    expect(readers[0].abort).toHaveBeenCalledOnce()
    expect(vm.previewUrl).toBe('')
    expect(runtime.error).not.toHaveBeenCalled()
  })
})
