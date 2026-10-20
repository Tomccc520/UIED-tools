/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import JSZip from 'jszip'
import FaviconMaker from './FaviconMaker.vue'

const messages = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
const cropper = vi.hoisted(() => ({ replace: vi.fn(), destroy: vi.fn() }))
vi.mock('element-plus', async (original) => ({ ...await original<typeof import('element-plus')>(), ElMessage: messages }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/favicon-maker' }) }))
vi.mock('vue-cropperjs', async () => ({ default: (await import('vue')).defineComponent({
  /** 只替换图像裁剪，保留表单、生成流程与真实下载逻辑。 */
  setup(_, { expose }) { expose({ getCroppedCanvas: () => sourceCanvas, replace: cropper.replace, destroy: cropper.destroy }); return () => null }
}) }))

let page: VueWrapper | undefined
let sourceCanvas: HTMLCanvasElement
let saved: { name: string; blob: Blob }[]
let blobs: Map<string, Blob>
let urlIndex = 0
const BrowserFileReader = FileReader
const blobArrayBufferDescriptor = Object.getOwnPropertyDescriptor(Blob.prototype, 'arrayBuffer')

/** 生成带 PNG 签名和尺寸字段的模拟编码结果，用于验证页面实际请求的画布尺寸。 */
function encodedCanvas(canvas: HTMLCanvasElement): Blob {
  const bytes = new Uint8Array(24)
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10])
  const data = new DataView(bytes.buffer)
  data.setUint32(16, canvas.width)
  data.setUint32(20, canvas.height)
  return new Blob([bytes], { type: 'image/png' })
}

/** 按可见文案取得实际操作按钮。 */
function button(text: string) {
  return page!.findAll('button').find(item => item.text() === text)!
}

/** 上传 1024 方图，再通过真实表单选择 PNG 与需要的输出尺寸。 */
async function preparePng(sizes: number[]) {
  sourceCanvas = document.createElement('canvas')
  sourceCanvas.width = sourceCanvas.height = 1024
  page = mount(FaviconMaker, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: { ToolsRecommend: true }
  } })
  const input = page.get('input[type=file]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['image'], 'source.png', { type: 'image/png' })] })
  await input.trigger('change')
  await flushPromises()
  await page.get('#format-png').setValue(true)
  for (const checkbox of page.findAll<HTMLInputElement>('input[type=checkbox]')) {
    const size = Number.parseInt(checkbox.element.closest('label')?.textContent?.trim() || '', 10)
    await checkbox.setValue(sizes.includes(size))
  }
}

/** 读取 PNG IHDR 的宽高，避免仅断言下载名称而漏过画布尺寸错误。 */
async function pngDimensions(blob: Blob): Promise<number[]> {
  const bytes = await blob.arrayBuffer()
  const data = new DataView(bytes)
  return [data.getUint32(16), data.getUint32(20)]
}

beforeEach(() => {
  Object.defineProperty(Blob.prototype, 'arrayBuffer', { configurable: true,
    /** 用浏览器原生 FileReader 读取测试 Blob，兼容 jsdom 尚未提供的 arrayBuffer。 */
    value(this: Blob) { return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new BrowserFileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(this)
    }) }
  })
  saved = []
  blobs = new Map()
  vi.stubGlobal('FileReader', class {
    onload: null | ((event: unknown) => void) = null
    /** 模拟文件读取成功，组件仍通过文件输入事件进入裁剪和生成流程。 */
    readAsDataURL(file: File) { queueMicrotask(() => this.onload?.({ target: { result: `data:image/png;base64,${btoa(file.name)}` } })) }
  })
  URL.createObjectURL = vi.fn((blob: Blob) => { const url = `blob:favicon-${++urlIndex}`; blobs.set(url, blob); return url })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (callback) { callback(encodedCanvas(this)) })
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,iVBORw0KGgo=')
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () { saved.push({ name: this.download, blob: blobs.get(this.href)! }) })
})
afterEach(() => {
  page?.unmount(); page = undefined
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.clearAllMocks()
  if (blobArrayBufferDescriptor) Object.defineProperty(Blob.prototype, 'arrayBuffer', blobArrayBufferDescriptor)
  else delete (Blob.prototype as Partial<Blob>).arrayBuffer
})

describe('Favicon PNG 输出尺寸与结果一致性', () => {
  it('1024 源画布仅选 16 时，实际下载 PNG 为 16×16', async () => {
    await preparePng([16])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    await button('下载Favicon').trigger('click')
    expect(saved[0].name).toMatch(/\.png$/)
    expect(saved[0].blob.type).toBe('image/png')
    expect(await pngDimensions(saved[0].blob)).toEqual([16, 16])
  })

  it('多选 16、32 时下载 ZIP，两个 PNG 分别有正确尺寸', async () => {
    await preparePng([16, 32])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    await button('下载Favicon').trigger('click')
    expect(saved[0].name).toMatch(/\.zip$/)
    const zip = await JSZip.loadAsync(await saved[0].blob.arrayBuffer())
    const entries = Object.values(zip.files).filter(file => !file.dir)
    expect(entries.map(entry => entry.name)).toEqual(['favicon-16x16.png', 'favicon-32x32.png'])
    for (const [index, entry] of entries.entries()) {
      const bytes = await entry.async('arraybuffer')
      expect(await pngDimensions(new Blob([bytes]))).toEqual([[16, 16], [32, 32]][index])
    }
  })

  it('PNG 生成后切成 ICO，下载仍按已生成结果的 PNG 类型与名称', async () => {
    await preparePng([16])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    await page!.get('#format-ico').setValue(true)
    await button('下载Favicon').trigger('click')
    expect(saved[0].name).toMatch(/\.png$/)
    expect(saved[0].blob.type).toBe('image/png')
    expect(page!.text()).toContain('设置已更改')
  })

  it('重新生成失败时撤销旧下载，不能提示新文件已生成', async () => {
    await preparePng([16])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    const previousUrl = [...blobs.keys()][0]
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(callback => callback(null))
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(messages.error).toHaveBeenCalled())
    expect(button('下载Favicon')).toBeUndefined()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(previousUrl)
    expect(messages.success).toHaveBeenCalledOnce()
  })

  it('离开页面会释放生成结果的对象地址', async () => {
    await preparePng([16])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    const previousUrl = [...blobs.keys()][0]
    page!.unmount()
    page = undefined
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(previousUrl)
    expect(cropper.destroy).toHaveBeenCalledOnce()
  })

  it('连续上传第二张图片时主动替换裁剪源，清理上一张图片的生成结果', async () => {
    await preparePng([16])
    await button('生成Favicon').trigger('click')
    await vi.waitFor(() => expect(button('下载Favicon')).toBeDefined())
    expect(cropper.replace).not.toHaveBeenCalled()
    const input = page!.get('input[type=file]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['second'], 'second.png', { type: 'image/png' })] })
    await input.trigger('change')
    await flushPromises()
    expect(cropper.replace).toHaveBeenCalledWith(`data:image/png;base64,${btoa('second.png')}`)
    expect(button('下载Favicon')).toBeUndefined()
  })

  it('第二张图片尚未读取完成时禁用生成，避免导出上一张图', async () => {
    await preparePng([16])
    let finishRead: () => void = () => {}
    vi.stubGlobal('FileReader', class {
      onload: null | ((event: unknown) => void) = null
      /** 暂停第二次读取，以验证旧裁剪图不能在新文件读取期间被导出。 */
      readAsDataURL() { finishRead = () => this.onload?.({ target: { result: 'data:image/png;base64,second' } }) }
    })
    const input = page!.get('input[type=file]')
    Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['second'], 'second.png', { type: 'image/png' })] })
    await input.trigger('change')
    expect(button('生成Favicon').attributes('disabled')).toBeDefined()
    expect(page!.get('[role="status"]').text()).toContain('正在读取图片')
    await button('生成Favicon').trigger('click')
    expect(messages.success).not.toHaveBeenCalled()
    finishRead()
    await flushPromises()
    expect(button('生成Favicon').attributes('disabled')).toBeUndefined()
  })
})
