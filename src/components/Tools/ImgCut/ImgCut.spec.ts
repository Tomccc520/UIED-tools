/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ImgCut from './ImgCut.vue'

const messages = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
const zipMock = vi.hoisted(() => ({ generate: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/img-cut' }) }))
vi.mock('element-plus', () => ({ ElMessage: messages, genFileId: () => 1 }))
vi.mock('jszip', () => ({ default: class {
  /** ZIP 内容添加保持同步，测试仅控制耗时打包完成的先后顺序。 */
  folder() { return { file: vi.fn() } }
  /** 由测试手动返回打包结果，覆盖清空和换图之后的迟到完成。 */
  generateAsync() { return zipMock.generate() }
} }))

type LoadCallback = (event?: unknown) => void
interface ControlledReader {
  result: string
  onload: LoadCallback | null
  onerror: LoadCallback | null
  onabort: LoadCallback | null
  listeners: Map<string, LoadCallback>
  abort: ReturnType<typeof vi.fn>
}
interface ControlledImage {
  src: string
  naturalWidth: number
  naturalHeight: number
  onload: LoadCallback | null
  onerror: LoadCallback | null
}
let view: VueWrapper | undefined
let readers: ControlledReader[]
let images: ControlledImage[]
let drawImage: ReturnType<typeof vi.fn>
let clearRect: ReturnType<typeof vi.fn>
let lastSource: string

/** 挂载真实切图页，仅替换外部控件与浏览器解码接口，保留文件选择和清空交互。 */
const mountPage = () => {
  view = mount(ImgCut, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: {
      ToolsRecommend: true, ElSlider: true,
      ElButton: defineComponent({ props: ['loading', 'disabled'], template: '<button :disabled="loading || disabled"><slot /></button>' })
    }
  } })
}

/** 使用文件输入提交一个有效图片，读取与解码顺序由各测试显式控制。 */
const upload = async (name: string) => {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File([name], name, { type: 'image/png' })] })
  await input.trigger('change')
  await flushPromises()
}

/** 返回当前读取回调的快照，用来模拟已经排入事件队列的迟到回调。 */
const loadCallback = (reader: ControlledReader) => reader.onload || reader.listeners.get('load')!

/** 完成指定读取并返回本次创建的图片解码对象。 */
const finishRead = async (reader: ControlledReader) => {
  loadCallback(reader)?.({ target: reader })
  await flushPromises()
  return images.at(-1)!
}

/** 完成当前解码并等待页面切片更新。 */
const finishImage = async (image: ControlledImage) => {
  image.onload?.()
  await flushPromises()
}

/** 按真实操作文案定位按钮，不依赖组件内部状态。 */
const button = (label: string) => view!.findAll('button').find(item => item.text() === label)!

/** 读取当前切图预览，源文件名称由隔离的 Canvas 编码替身保留以便核对身份。 */
const previewSources = () => view!.findAll('img').map(item => item.attributes('src'))

beforeEach(() => {
  readers = []
  images = []
  lastSource = ''
  vi.clearAllMocks()
  vi.stubGlobal('FileReader', class {
    result = ''
    onload: LoadCallback | null = null
    onerror: LoadCallback | null = null
    onabort: LoadCallback | null = null
    listeners = new Map<string, LoadCallback>()
    abort = vi.fn()
    /** 记录读取对象，避免测试使用真实文件读取速度掩盖竞态。 */
    readAsDataURL(file: File) { this.result = `data:${file.name}`; readers.push(this) }
    /** 兼容修复前使用的监听方式，确保失败测试直接覆盖旧实现。 */
    addEventListener(name: string, callback: LoadCallback) { this.listeners.set(name, callback) }
  })
  vi.stubGlobal('Image', class {
    src = ''
    naturalWidth = 6
    naturalHeight = 6
    onload: LoadCallback | null = null
    onerror: LoadCallback | null = null
    /** 保留解码器，便于手动模拟换图或卸载之后的迟到事件。 */
    constructor() { images.push(this) }
  })
  drawImage = vi.fn((image: ControlledImage) => { lastSource = image.src })
  clearRect = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage, clearRect } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(() => `data:image/png;base64,${btoa(lastSource)}`)
})

afterEach(() => {
  view?.unmount()
  view = undefined
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('九宫格切图读取与清理', () => {
  it('先选 A 后选 B，A 的迟到解码不能把 B 的切片改回 A', async () => {
    mountPage()
    await upload('A.png')
    const first = await finishRead(readers[0])
    const lateFirstLoad = first.onload!
    await upload('B.png')
    const second = await finishRead(readers[1])
    await finishImage(second)
    const expected = previewSources()
    lateFirstLoad()
    await flushPromises()
    expect(previewSources()).toEqual(expected)
    expect(expected).toHaveLength(9)
    expect(atob(expected[0].split(',')[1])).toBe('data:B.png')
  })

  it('旧读取完成不会创建新解码器或提前结束新文件的处理中状态', async () => {
    mountPage()
    await upload('initial.png')
    await finishImage(await finishRead(readers[0]))
    await upload('A.png')
    const lateRead = loadCallback(readers[1])
    await upload('B.png')
    lateRead()
    await flushPromises()
    expect(images).toHaveLength(1)
    expect(button('下载').element.disabled).toBe(true)
    await finishImage(await finishRead(readers[2]))
    expect(button('下载').element.disabled).toBe(false)
  })

  it('清空使已排队的解码失效，旧切片不会重新出现', async () => {
    mountPage()
    await upload('initial.png')
    await finishImage(await finishRead(readers[0]))
    await upload('pending.png')
    const pending = await finishRead(readers[1])
    const lateLoad = pending.onload!
    await button('清除').trigger('click')
    lateLoad()
    await flushPromises()
    expect(previewSources()).toEqual([])
    expect(view!.text()).not.toContain('切割预览')
    expect(pending.src).toBe('')
  })

  it('读取期间清空会停止 FileReader，迟到读取不会重新创建解码任务', async () => {
    mountPage()
    await upload('initial.png')
    await finishImage(await finishRead(readers[0]))
    await upload('pending.png')
    const reader = readers[1]
    const lateRead = loadCallback(reader)
    await button('清除').trigger('click')
    lateRead()
    await flushPromises()
    expect(reader.abort).toHaveBeenCalled()
    expect(images).toHaveLength(1)
    expect(previewSources()).toEqual([])
  })

  it('文件读取失败给出反馈，仍可重新选择并完成切图', async () => {
    mountPage()
    await upload('broken.png')
    readers[0].onerror?.()
    await flushPromises()
    expect(messages.error).toHaveBeenCalled()
    await upload('retry.png')
    await finishImage(await finishRead(readers[1]))
    expect(previewSources()).toHaveLength(9)
    expect(button('下载').element.disabled).toBe(false)
  })

  it('图片解码失败给出反馈并释放解码器，可重选同名文件重试', async () => {
    mountPage()
    await upload('broken.png')
    const broken = await finishRead(readers[0])
    broken.onerror?.()
    await flushPromises()
    expect(messages.error).toHaveBeenCalled()
    expect(broken.src).toBe('')
    await upload('broken.png')
    await finishImage(await finishRead(readers[1]))
    expect(previewSources()).toHaveLength(9)
  })

  it('卸载时撤销读取，并忽略已经排队的读取回调', async () => {
    mountPage()
    await upload('pending.png')
    const reader = readers[0]
    const lateRead = loadCallback(reader)
    view!.unmount()
    view = undefined
    lateRead()
    await flushPromises()
    expect(reader.abort).toHaveBeenCalled()
    expect(images).toHaveLength(0)
    expect(drawImage).not.toHaveBeenCalled()
  })

  it('卸载时释放解码器，已排队的解码回调不会再绘制切片', async () => {
    mountPage()
    await upload('pending.png')
    const image = await finishRead(readers[0])
    const lateLoad = image.onload!
    view!.unmount()
    view = undefined
    lateLoad()
    await flushPromises()
    expect(image.src).toBe('')
    expect(drawImage).not.toHaveBeenCalled()
  })

  it('旧 ZIP 打包完成不下载旧切片，也不提前结束新文件读取', async () => {
    let finishZip!: (blob: Blob) => void
    zipMock.generate.mockImplementationOnce(() => new Promise(resolve => { finishZip = resolve }))
    const download = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:old-zip'), revokeObjectURL: vi.fn() })
    mountPage()
    await upload('initial.png')
    await finishImage(await finishRead(readers[0]))
    await button('下载').trigger('click')
    await upload('new.png')
    finishZip(new Blob(['old zip']))
    await flushPromises()
    expect(download).not.toHaveBeenCalled()
    expect(button('下载').element.disabled).toBe(true)
    await finishImage(await finishRead(readers[1]))
    expect(button('下载').element.disabled).toBe(false)
  })

  it('每个切片绘制前清空画布，透明和半透明区域不会叠加前一片像素', async () => {
    const colors = [[255, 0, 0, 255], [0, 0, 0, 0], [0, 0, 255, 128]]
    let pixel = [0, 0, 0, 0]
    clearRect.mockImplementation(() => { pixel = [0, 0, 0, 0] })
    drawImage.mockImplementation((_image: ControlledImage, sx: number) => {
      const source = colors[sx / 2]
      const sa = source[3] / 255
      const da = pixel[3] / 255
      const alpha = sa + da * (1 - sa)
      pixel = alpha ? [...source.slice(0, 3).map((value, i) => Math.round((value * sa + pixel[i] * da * (1 - sa)) / alpha)), Math.round(alpha * 255)] : [0, 0, 0, 0]
    })
    vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementation(() => `data:image/png;base64,${btoa(JSON.stringify(pixel))}`)
    mountPage()
    await upload('transparent.png')
    await finishImage(await finishRead(readers[0]))
    const decoded = previewSources().slice(0, 3).map(value => JSON.parse(atob(value.split(',')[1])))
    expect(decoded).toEqual(colors)
    expect(clearRect).toHaveBeenCalledTimes(9)
  })
})
