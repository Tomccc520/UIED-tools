/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ImageJoiner from './ImageJoiner.vue'

const messages = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-joiner' }) }))
vi.mock('element-plus', () => ({ ElMessage: messages }))

interface ControlledImage {
  width: number
  height: number
  src: string
  onload: null | (() => void)
  onerror: null | (() => void)
}
let images: ControlledImage[]
let canvases: Array<{ canvas: HTMLCanvasElement, drawImage: ReturnType<typeof vi.fn>, fillRect: ReturnType<typeof vi.fn> }>
let view: VueWrapper | undefined
let download: { href: string, name: string } | undefined
let downloadBlob: Blob | undefined
let urlIndex = 0

/** 创建含真实文件头的测试 Blob，并补齐 jsdom 尚未提供的切片 arrayBuffer 接口。 */
function encodedBlob(type = 'image/jpeg') {
  const bytes = new Uint8Array(type === 'image/png' ? [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] : [0xff, 0xd8, 0xff, 0xe0])
  const blob = new Blob([bytes], { type })
  const originalSlice = blob.slice.bind(blob)
  blob.slice = (start = 0, end = bytes.length) => {
    const part = originalSlice(start, end)
    part.arrayBuffer = async () => bytes.slice(start, end).buffer
    return part
  }
  return blob
}

/** 挂载真实工具，外围控件仅保留模型和按钮语义。 */
function mountPage() {
  view = mount(ImageJoiner, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: {
      ToolsRecommend: true, ElIcon: true, ElSlider: true, ElRadioButton: true, ElOption: true,
      ElRadioGroup: defineComponent({ props: ['modelValue'], template: '<div><slot /></div>' }),
      ElSelect: defineComponent({ props: ['modelValue'], emits: ['update:modelValue'], template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option></select>' }),
      ElButton: defineComponent({ props: ['disabled', 'loading'], template: '<button :disabled="disabled || loading"><slot /></button>' }),
      draggable: defineComponent({ props: ['modelValue'], template: '<div><slot v-for="(element,index) in modelValue" name="item" :element="element" :index="index" /></div>' })
    }
  } })
}

/** 使用真实文件选择事件添加图片，不直接修改组件状态。 */
async function upload(names: string[]) {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: names.map(name => new File([name], name, { type: 'image/png' })) })
  await input.trigger('change')
  await flushPromises()
}

/** 按实际按钮文案查找用户操作入口。 */
function button(label: string) {
  return view!.findAll('button').find(item => item.text() === label)!
}

/** 完成所有已创建及随后创建的解码，旧实现的两套加载也都会被触发。 */
async function completeImages(start = 0) {
  let index = start
  for (let round = 0; round < 8 && index < images.length; round += 1) {
    const batch = images.slice(index)
    index = images.length
    batch.forEach(image => image.onload?.())
    await flushPromises()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  images = []
  canvases = []
  download = undefined
  downloadBlob = undefined
  URL.createObjectURL = vi.fn(value => {
    if (!(value instanceof File)) downloadBlob = value as Blob
    return `blob:joiner-${++urlIndex}`
  })
  URL.revokeObjectURL = vi.fn()
  vi.stubGlobal('Image', class {
    width = 100
    height = 60
    src = ''
    onload: null | (() => void) = null
    onerror: null | (() => void) = null
    /** 收集图片对象以控制成功、失败和迟到回调顺序。 */
    constructor() { images.push(this) }
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
    const record = { canvas: this, drawImage: vi.fn(), fillRect: vi.fn() }
    canvases.push(record)
    return record as unknown as CanvasRenderingContext2D
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (this: HTMLCanvasElement, type?: string) {
    return `data:${type};base64,canvas-${canvases.findIndex(item => item.canvas === this)}`
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback: BlobCallback, type?: string) {
    callback(encodedBlob(type))
  })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    download = { href: this.href, name: this.download }
  })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => { view?.unmount(); view = undefined; vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('图片拼接的单次绘制与读取生命周期', () => {
  it('透明图片一次预览仅绘制一次，不重复创建加载器或叠色', async () => {
    mountPage()
    await upload(['alpha.png'])
    await completeImages()
    expect(canvases).toHaveLength(1)
    expect(canvases[0].drawImage).toHaveBeenCalledTimes(1)
    expect(images).toHaveLength(1)
  })

  it('导出与预览每张图片均仅绘制一次，沿用相同的顺序、尺寸和位置', async () => {
    mountPage()
    await upload(['01.png', '02.png'])
    images[1].width = 50
    images[1].height = 30
    await completeImages()
    const preview = canvases.at(-1)!
    await view!.get('select').setValue('image/png')
    await button('生成并下载').trigger('click')
    await completeImages(2)
    const exported = canvases.at(-1)!
    expect(exported.drawImage.mock.calls).toEqual(preview.drawImage.mock.calls)
    expect(exported.drawImage).toHaveBeenCalledTimes(2)
    expect([exported.canvas.width, exported.canvas.height]).toEqual([100, 90])
    expect(download?.name).toMatch(/\.png$/)
    expect(download?.href).toContain('blob:joiner-')
    expect(downloadBlob?.type).toBe('image/png')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(download?.href)
  })

  it('第二张先解码仍保留选择顺序与纵向布局', async () => {
    mountPage()
    await upload(['01.png', '02.png'])
    const [first, second] = images
    first.width = 100
    first.height = 60
    second.width = 50
    second.height = 30
    second.onload!()
    await flushPromises()
    first.onload!()
    await flushPromises()
    await completeImages(2)
    expect(view!.findAll('.file-tool-filename').map(item => item.text())).toEqual(['01.png', '02.png'])
    const calls = canvases.at(-1)!.drawImage.mock.calls
    expect(calls.map(call => [call[0].src, call[1], call[2]])).toEqual([[first.src, 0, 0], [second.src, 25, 60]])
  })

  it('初次读取中可以清空，旧图片迟到后不能恢复列表或预览', async () => {
    mountPage()
    await upload(['old.png'])
    const old = images[0]
    const late = old.onload!
    expect(button('清空')).toBeDefined()
    await button('清空').trigger('click')
    late()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename')).toHaveLength(0)
    expect(view!.find('img.max-w-full').exists()).toBe(false)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(old.src)
    await upload(['new.png'])
    images[1].onload!()
    late()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename').map(item => item.text())).toEqual(['new.png'])
    expect(canvases.at(-1)!.drawImage).toHaveBeenCalledTimes(1)
  })

  it('读取失败释放资源，其他成功图片仍可导出', async () => {
    mountPage()
    await upload(['broken.png', 'valid.png'])
    const failed = images[0]
    failed.onerror?.()
    images[1].onload!()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename').map(item => item.text())).toEqual(['valid.png'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(failed.src)
    expect(messages.error).toHaveBeenCalledWith(expect.stringContaining('broken.png'))
    expect(button('生成并下载').attributes('disabled')).toBeUndefined()
  })

  it('后一批先解码仍等待前批，并保留所有批次的原始选择顺序', async () => {
    mountPage()
    await upload(['01.png', '02.png'])
    await upload(['03.png'])
    images[2].onload!()
    images[1].onload!()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename')).toHaveLength(0)
    images[0].onload!()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename').map(item => item.text())).toEqual(['01.png', '02.png', '03.png'])
    expect(canvases.at(-1)!.drawImage).toHaveBeenCalledTimes(3)
  })

  it('解码超时不阻塞成功图片，超时后的迟到回调也不能重新插入', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    mountPage()
    await upload(['stuck.png', 'ready.png'])
    const late = images[0].onload!
    images[1].onload!()
    await vi.advanceTimersByTimeAsync(15000)
    await flushPromises()
    late()
    await flushPromises()
    expect(view!.findAll('.file-tool-filename').map(item => item.text())).toEqual(['ready.png'])
    expect(view!.find('[role="status"]').exists()).toBe(false)
    expect(messages.error).toHaveBeenCalledTimes(1)
    expect(canvases.at(-1)!.drawImage).toHaveBeenCalledTimes(1)
  })

  it('卸载时取消读取并释放资源，保存的旧回调不再绘制或提示', async () => {
    mountPage()
    await upload(['pending.png'])
    const old = images[0]
    const late = old.onload!
    view!.unmount()
    view = undefined
    late()
    await flushPromises()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(old.src)
    expect(canvases).toHaveLength(0)
    expect(messages.error).not.toHaveBeenCalled()
  })

  it('无法获得绘图上下文时反馈失败，下载不永久停留在处理中', async () => {
    mountPage()
    await upload(['valid.png'])
    await completeImages()
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    await button('生成并下载').trigger('click')
    await flushPromises()
    expect(messages.error).toHaveBeenCalledWith('图片拼接失败，请重试')
    expect(button('生成并下载').attributes('disabled')).toBeUndefined()
  })

  it('浏览器返回空画布编码时明确失败，不把 data:, 当作成功下载', async () => {
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue('data:,')
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(callback => callback(null))
    mountPage()
    await upload(['large.png'])
    await completeImages()
    expect(view!.get('[role="alert"]').text()).toContain('预览生成失败')
    await button('生成并下载').trigger('click')
    await flushPromises()
    expect(messages.error).toHaveBeenCalledWith('图片拼接失败，请重试')
    expect(download).toBeUndefined()
  })

  it('导出编码未完成时清空或切换格式，不下载旧画布或使用新的扩展名', async () => {
    mountPage()
    await upload(['alpha.png'])
    await completeImages()
    let complete!: BlobCallback
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementation(callback => { complete = callback })
    await button('生成并下载').trigger('click')
    await view!.get('select').setValue('image/png')
    complete(encodedBlob('image/jpeg'))
    await flushPromises()
    expect(download).toBeUndefined()
    expect(messages.success).not.toHaveBeenCalled()
    expect(button('生成并下载').attributes('disabled')).toBeUndefined()
    await button('生成并下载').trigger('click')
    await button('清空').trigger('click')
    complete(encodedBlob('image/png'))
    await flushPromises()
    expect(download).toBeUndefined()
  })
})
