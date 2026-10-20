/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, onMounted } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ImageCrop from './ImageCrop.vue'

const mocks = vi.hoisted(() => ({
  encode: vi.fn(),
  getCanvas: vi.fn(),
  setAspectRatio: vi.fn(),
  relativeZoom: vi.fn(),
  rotate: vi.fn(),
  move: vi.fn(),
  error: vi.fn(),
  warning: vi.fn()
}))

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-crop' }) }))
vi.mock('element-plus', () => ({ ElMessage: { error: mocks.error, warning: mocks.warning } }))
vi.mock('@/utils/imageFormatConversion', () => ({ encodeImageCanvas: mocks.encode }))
vi.mock('vue-cropperjs', () => ({
  default: defineComponent({
    props: ['src', 'crop', 'ready'],
    setup(props, { expose }) {
      expose({
        getCroppedCanvas: mocks.getCanvas,
        getData: () => ({ width: 128, height: 128 }),
        setAspectRatio: mocks.setAspectRatio,
        relativeZoom: mocks.relativeZoom,
        rotate: mocks.rotate,
        move: mocks.move
      })
      onMounted(() => props.crop(new CustomEvent('crop', { detail: { width: 128, height: 128 } })))
      return () => h('div', { 'data-testid': 'cropper' })
    }
  })
}))

let wrapper: VueWrapper | undefined
let canvas: HTMLCanvasElement
let downloads: { href: string; name: string }[]
let createObjectURL: ReturnType<typeof vi.fn>
let revokeObjectURL: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  mocks.getCanvas.mockReturnValue(canvas)
  mocks.encode.mockImplementation(async (_canvas, format: string) => new Blob(['encoded'], {
    type: format === 'jpg' ? 'image/jpeg' : `image/${format}`
  }))
  downloads = []
  createObjectURL = vi.fn(() => `blob:crop-${createObjectURL.mock.calls.length}`)
  revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push({ href: this.href, name: this.download })
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

/** 通过真实文件选择入口挂载图片，Cropper 替身只提供库接口和真实事件结构。 */
const mountImage = async () => {
  wrapper = mount(ImageCrop, {
    attachTo: document.body,
    global: {
      mocks: { $ensureFreeToolTitle: (title: string) => title },
      stubs: { ToolsRecommend: true }
    }
  })
  const input = wrapper.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [new File(['input'], 'design.v1.png', { type: 'image/png' })] })
  await input.trigger('change')
  await flushPromises()
  return wrapper
}

/** 按按钮的完整可见名称定位，避免格式名与说明区文本误匹配。 */
const button = (view: VueWrapper, name: string) => view.findAll('button').find((item) => item.text() === name)!

describe('图片裁切当前结果下载', () => {
  it('Cropper CustomEvent 就绪后，按当前1:1区域编码PNG并触发对象URL下载', async () => {
    const view = await mountImage()
    await button(view, '1:1 正方形').trigger('click')
    await button(view, 'PNG').trigger('click')
    expect(button(view, '下载').attributes('disabled')).toBeUndefined()
    await button(view, '下载').trigger('click')
    await flushPromises()
    expect(mocks.setAspectRatio).toHaveBeenCalledWith(1)
    expect(mocks.getCanvas).toHaveBeenCalledWith(expect.objectContaining({ fillColor: 'transparent' }))
    expect(mocks.encode).toHaveBeenCalledWith(canvas, 'png', 1)
    expect(downloads).toEqual([{ href: 'blob:crop-2', name: 'design.v1_cropped.png' }])
    expect(createObjectURL.mock.calls[1][0]).toBeInstanceOf(Blob)
  })

  it('切换格式后重新取当前画布，不使用上次缓存数据或把PNG误命名为JPG', async () => {
    const view = await mountImage()
    await button(view, '下载').trigger('click')
    await flushPromises()
    const second = document.createElement('canvas')
    second.width = 64
    second.height = 64
    mocks.getCanvas.mockReturnValue(second)
    await button(view, 'WebP').trigger('click')
    await button(view, '下载').trigger('click')
    await flushPromises()
    expect(mocks.encode.mock.calls[0]).toEqual([canvas, 'jpg', 0.9])
    expect(mocks.encode.mock.calls[1]).toEqual([second, 'webp', 0.9])
    expect(downloads.map((item) => item.name)).toEqual(['design.v1_cropped.jpg', 'design.v1_cropped.webp'])
  })

  it('编码失败明确提示并恢复下载按钮，不能静默产生错误文件', async () => {
    const view = await mountImage()
    mocks.encode.mockRejectedValueOnce(new Error('当前浏览器不支持导出 WEBP，请改用其他格式'))
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await button(view, 'WebP').trigger('click')
    await button(view, '下载').trigger('click')
    await flushPromises()
    expect(downloads).toEqual([])
    expect(view.get('[role="alert"]').text()).toContain('不支持导出 WEBP')
    expect(button(view, '下载').attributes('disabled')).toBeUndefined()
    await button(view, 'PNG').trigger('click')
    await button(view, '下载').trigger('click')
    await flushPromises()
    expect(downloads[0].name).toBe('design.v1_cropped.png')
    expect(view.find('[role="alert"]').exists()).toBe(false)
  })

  it('导出中重复点击只编码一次，清除图片后旧异步结果不会再下载', async () => {
    const view = await mountImage()
    let finish!: (blob: Blob) => void
    mocks.encode.mockImplementation(() => new Promise<Blob>((resolve) => { finish = resolve }))
    const download = button(view, '下载')
    await download.trigger('click')
    await download.trigger('click')
    expect(mocks.encode).toHaveBeenCalledTimes(1)
    await button(view, '清除图片').trigger('click')
    finish(new Blob(['result'], { type: 'image/jpeg' }))
    await flushPromises()
    expect(downloads).toEqual([])
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:crop-1')
  })

  it('亮度对比度用于导出画布，并使用库实际的relativeZoom接口', async () => {
    const view = await mountImage()
    const drawImage = vi.fn()
    const context = { filter: '', drawImage }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    const ranges = view.findAll('input[type="range"]')
    await ranges[0].setValue('120')
    await ranges[1].setValue('80')
    await view.get('button[title="放大"]').trigger('click')
    await button(view, '下载').trigger('click')
    await flushPromises()
    expect(mocks.relativeZoom).toHaveBeenCalledWith(0.1)
    expect(context.filter).toBe('brightness(120%) contrast(80%)')
    expect(drawImage).toHaveBeenCalledWith(canvas, 0, 0)
    expect(mocks.encode.mock.calls[0][0]).not.toBe(canvas)
    expect(downloads).toHaveLength(1)
  })
})
