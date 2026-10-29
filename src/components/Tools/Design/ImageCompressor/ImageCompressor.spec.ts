/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ImageCompressor from './ImageCompressor.vue'

vi.mock('element-plus', () => ({ ElMessage: { warning: vi.fn(), error: vi.fn() } }))

const readers: { result: string; onload?: () => void; onerror?: () => void }[] = []
const images: { src: string; onload?: () => void; onerror?: () => void }[] = []
const NativeFileReader = globalThis.FileReader
let wrapper: VueWrapper | undefined
beforeEach(() => {
  readers.length = 0
  images.length = 0
  vi.stubGlobal('FileReader', class {
    result = ''
    onload?: () => void
    onerror?: () => void
    constructor() { readers.push(this) }
    readAsDataURL() {}
  })
  vi.stubGlobal('Image', class {
    src = ''
    width = 100
    height = 100
    onload?: () => void
    onerror?: () => void
    constructor() { images.push(this) }
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,YWJj')
  URL.createObjectURL = vi.fn(() => 'blob:legacy-compressed-image')
  URL.revokeObjectURL = vi.fn()
  wrapper = mount(ImageCompressor, { global: { stubs: { ToolsRecommend: true } } })
})
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

/** 通过文件输入替换当前图片，异步加载由测试显式控制完成顺序。 */
const selectFile = async (name = 'sample.png', content = 'image') => {
  const input = wrapper!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File([content], name, { type: 'image/png' })] })
  await input.trigger('change')
}

/** 完成指定文件读取，创建后续可独立控制成功或失败的图片加载。 */
const finishRead = async (index: number, value = 'data:image/png;base64,aW1hZ2U=') => {
  readers[index].result = value
  readers[index].onload?.()
  await wrapper!.vm.$nextTick()
}

/** 判断页面是否仍提供结果下载，防止失败后误下载上一张图。 */
const hasDownload = () => wrapper!.findAll('button').some((button) => button.text().includes('下载图片'))

/** 通过原生读取器独立核对下载 Blob 的实际字节，不只断言点击事件发生。 */
const readDownloadedBlob = (blob: Blob): Promise<Uint8Array> => new Promise((resolve, reject) => {
  const reader = new NativeFileReader()
  reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
  reader.onerror = () => reject(new Error('读取下载 Blob 失败'))
  reader.readAsArrayBuffer(blob)
})

describe('设计图片压缩器的异步状态', () => {
  it.each([
    ['JPEG', 'image/jpeg', 'jpeg', [255, 216, 255]],
    ['PNG', 'image/png', 'png', [137, 80, 78, 71, 13, 10, 26, 10]],
    ['WEBP', 'image/webp', 'webp', [82, 73, 70, 70, 4, 0, 0, 0, 87, 69, 66, 80]]
  ] as const)('%s 使用实际 MIME 的 Blob URL 下载，字节与扩展名一致且延迟释放地址', async (label, mime, extension, bytes) => {
    const original = 'original image'.repeat(100)
    await selectFile('sample.png', original)
    await finishRead(0, `data:image/png;base64,${btoa(original)}`)
    await wrapper!.findAll('button').find(button => button.text() === label)!.trigger('click')
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue(`data:${mime};base64,${btoa(String.fromCharCode(...bytes))}`)
    images.at(-1)!.onload?.()
    await wrapper!.vm.$nextTick()
    let revokeCallback: (() => void) | undefined
    const timer = vi.spyOn(window, 'setTimeout').mockImplementation((callback, delay) => {
      expect(delay).toBeGreaterThanOrEqual(1000)
      revokeCallback = callback as () => void
      return 1 as unknown as ReturnType<typeof window.setTimeout>
    })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.href).toBe('blob:legacy-compressed-image')
      expect(this.download).toMatch(new RegExp(`\\.${extension}$`))
    })
    await wrapper!.findAll('button').find(button => button.text().includes('下载图片'))!.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(blob.type).toBe(mime)
    expect(Array.from(await readDownloadedBlob(blob))).toEqual([...bytes])
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    expect(timer).toHaveBeenCalledOnce()
    revokeCallback!()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:legacy-compressed-image')
  })

  it('同格式原尺寸的重编码结果更大时保留原图，不输出负压缩率', async () => {
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue(`data:image/png;base64,${'YWJj'.repeat(30)}`)
    await selectFile()
    await finishRead(0)
    await wrapper!.findAll('button').find(button => button.text() === 'PNG')!.trigger('click')
    images.at(-1)!.onload?.()
    await wrapper!.vm.$nextTick()
    expect(wrapper!.text()).toContain('已保留原图')
    expect(wrapper!.text()).not.toContain('--')
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.href).toBe('blob:legacy-compressed-image')
    })
    await wrapper!.findAll('button').find(button => button.text().includes('下载图片'))!.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob
    expect(blob.type).toBe('image/png')
    expect(Array.from(await readDownloadedBlob(blob))).toEqual([105, 109, 97, 103, 101])
  })

  it('主动缩放后的文件即使更大也保留缩放结果，并明确显示体积增加', async () => {
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue(`data:image/png;base64,${'YWJj'.repeat(30)}`)
    await selectFile()
    await finishRead(0)
    await wrapper!.findAll('input[type="range"]')[1].setValue('0.5')
    images.at(-1)!.onload?.()
    await wrapper!.vm.$nextTick()
    expect(wrapper!.text()).toContain('增加')
    expect(wrapper!.text()).not.toContain('已保留原图')
    expect(vi.mocked(HTMLCanvasElement.prototype.getContext).mock.results.at(-1)!.value.drawImage)
      .toHaveBeenCalledWith(expect.anything(), 0, 0, 50, 50)
  })

  it('PNG 不显示有效的质量调节，避免用户反复滑动却没有压缩变化', async () => {
    await selectFile()
    await finishRead(0)
    await wrapper!.findAll('button').find(button => button.text() === 'PNG')!.trigger('click')
    expect(wrapper!.findAll('input[type="range"]')[0].attributes('disabled')).toBeDefined()
    expect(wrapper!.text()).toContain('PNG 不支持质量调节')
  })

  it('APNG 和动态 WebP 都在进入 Canvas 前拒绝，防止丢失动画帧', async () => {
    await selectFile()
    const png = new Uint8Array(28)
    png.set([137, 80, 78, 71, 13, 10, 26, 10])
    new DataView(png.buffer).setUint32(8, 8)
    png.set(new TextEncoder().encode('acTL'), 12)
    await finishRead(0, `data:image/png;base64,${btoa(String.fromCharCode(...png))}`)
    expect(wrapper!.get('[role="alert"]').text()).toContain('APNG')
    expect(images).toHaveLength(0)
    await selectFile()
    const webp = new Uint8Array(30)
    webp.set(new TextEncoder().encode('RIFF'), 0)
    webp.set(new TextEncoder().encode('WEBPVP8X'), 8)
    new DataView(webp.buffer).setUint32(16, 10, true)
    webp[20] = 2
    // 真实输入 MIME 为 WebP，校验不依赖输出格式或当前选中按钮。
    const input = wrapper!.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [new File([webp], 'animation.webp', { type: 'image/webp' })] })
    await input.trigger('change')
    await finishRead(2, `data:image/webp;base64,${btoa(String.fromCharCode(...webp))}`)
    expect(wrapper!.get('[role="alert"]').text()).toContain('动态 WebP')
    expect(images).toHaveLength(0)
  })

  it('新文件损坏时清空旧结果，明确报错且可重新选择恢复', async () => {
    await selectFile()
    await finishRead(0)
    images[0].onload?.()
    await wrapper!.vm.$nextTick()
    expect(hasDownload()).toBe(true)
    await selectFile('broken.png')
    expect(hasDownload()).toBe(false)
    await finishRead(1)
    images[1].onerror?.()
    await wrapper!.vm.$nextTick()
    expect(wrapper!.get('[role="alert"]').text()).toContain('文件可能已损坏')
    expect(hasDownload()).toBe(false)
    await selectFile()
    await finishRead(2)
    images[2].onload?.()
    await wrapper!.vm.$nextTick()
    expect(hasDownload()).toBe(true)
  })

  it('快速重选后忽略旧文件读取，最新图片不会被旧回调覆盖', async () => {
    await selectFile('old.png')
    await selectFile('new.png')
    await finishRead(0, 'data:image/png;base64,old')
    expect(images).toHaveLength(0)
    await finishRead(1, 'data:image/png;base64,new')
    expect(images[0].src).toBe('data:image/png;base64,new')
  })

  it('修改格式会废弃上一次编码回调，并按实际 MIME 保存结果', async () => {
    await selectFile()
    await finishRead(0)
    const webp = wrapper!.findAll('button').find((button) => button.text() === 'WEBP')!
    await webp.trigger('click')
    images[0].onload?.()
    await wrapper!.vm.$nextTick()
    expect(hasDownload()).toBe(false)
    images[1].onload?.()
    await wrapper!.vm.$nextTick()
    expect(hasDownload()).toBe(true)
    // 模拟不支持 WebP 的浏览器回退到 PNG，下载后缀必须跟随实际结果。
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toMatch(/\.png$/)
    })
    await wrapper!.findAll('button').find((button) => button.text().includes('下载图片'))!.trigger('click')
    expect(click).toHaveBeenCalledOnce()
  })

  it('页面卸载后不再继续读取旧图片或回写结果', async () => {
    await selectFile()
    wrapper!.unmount()
    readers[0].onload?.()
    expect(images).toHaveLength(0)
    wrapper = undefined
  })
})
