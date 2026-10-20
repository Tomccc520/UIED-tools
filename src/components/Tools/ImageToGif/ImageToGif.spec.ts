/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ImageToGif from './ImageToGif.vue'

const mocks = vi.hoisted(() => ({ finished: null as null | ((blob: Blob) => void), render: vi.fn(), error: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-to-gif' }) }))
vi.mock('element-plus', () => ({ ElMessage: { success: vi.fn(), error: mocks.error } }))
vi.mock('gif.js', () => ({ default: class {
  /** 测试仅替换编码器，保留页面上传、排序与下载交互。 */
  addFrame() {}
  /** 保存完成回调，让测试明确控制编码结束时机。 */
  on(event: string, callback: (blob: Blob) => void) { if (event === 'finished') mocks.finished = callback }
  /** 标记编码开始，避免测试依赖 Worker 或实际耗时。 */
  render() { mocks.render() }
} }))

const DraggableStub = defineComponent({
  name: 'Draggable', props: ['modelValue', 'disabled'], emits: ['update:modelValue'],
  template: '<div><slot v-for="(element, index) in modelValue" name="item" :element="element" :index="index" /></div>'
})

let view: VueWrapper | undefined
let urlNumber = 0

/** 挂载真实页面并替换外围控件，让测试通过文件输入和可见操作验证行为。 */
function mountPage() {
  view = mount(ImageToGif, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: {
      draggable: DraggableStub, ToolsRecommend: true,
      ElButton: defineComponent({ props: ['disabled', 'loading', 'type'], template: '<button type="button" :disabled="disabled || loading"><slot /></button>' }),
      ElInputNumber: true, ElSlider: true, ElSwitch: true, ElIcon: true, ElProgress: true
    }
  } })
  return view
}

/** 按一次文件选择提交图片，保留不同选择批次的原始顺序。 */
async function uploadFiles(names: string[]) {
  const input = view!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value:
    names.map(name => new File([name], name, { type: 'image/png' }))
  })
  await input.trigger('change')
  await flushPromises()
}

/** 挂载真实页面、上传两张图片并生成一份可下载的 GIF 预览。 */
async function createPreview() {
  mountPage()
  await uploadFiles(['first.png', 'second.png'])
  await findButton('预览GIF').trigger('click')
  await flushPromises()
  mocks.finished!(new Blob(['GIF89a'], { type: 'image/gif' }))
  await flushPromises()
  return view
}

/** 按可见文案定位主操作，避免依赖组件内部状态。 */
function findButton(label: string) {
  return view!.findAll('button').find(button => button.text() === label)!
}

/** 提供可控的图片解码对象，测试可按任意先后顺序完成或失败。 */
function controlImageDecoding() {
  const images: Array<{
    width: number
    height: number
    src: string
    onload: null | (() => void)
    onerror: null | (() => void)
  }> = []
  vi.stubGlobal('Image', class {
    width = 100
    height = 100
    src = ''
    onload: null | (() => void) = null
    onerror: null | (() => void) = null
    /** 收集每个解码对象，便于测试保留并触发迟到的回调。 */
    constructor() { images.push(this) }
  })
  return images
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.finished = null
  URL.createObjectURL = vi.fn(() => `blob:image-gif-${++urlNumber}`)
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage: vi.fn() } as unknown as CanvasRenderingContext2D)
  vi.stubGlobal('Image', class {
    width = 64
    height = 32
    onload: null | (() => void) = null
    /** 模拟图片解码完成；页面逻辑仍从真实文件输入开始执行。 */
    set src(_value: string) { queueMicrotask(() => this.onload?.()) }
  })
})

afterEach(() => { view?.unmount(); view = undefined; vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('图片合成 GIF 的上传解码顺序与清理', () => {
  it('上传非图片时保留已有帧和 GIF 预览，并明确提示选择图片', async () => {
    await createPreview()
    const previewUrl = view!.get('img.max-w-full').attributes('src')
    const input = view!.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      configurable: true, value: [new File(['plain text'], 'notes.txt', { type: 'text/plain' })]
    })
    await input.trigger('change')
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['first.png', 'second.png'])
    expect(view!.get('img.max-w-full').attributes('src')).toBe(previewUrl)
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(previewUrl)
    expect(mocks.error).toHaveBeenCalledWith('请选择图片文件')
  })

  it('02 先解码时仍按 01、02 入队，默认画布取 01 的 100×100', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['01.png', '02.png'])
    images[1].width = 240
    images[1].height = 180
    images[1].onload!()
    await flushPromises()
    const previewDisabledWhileLoading = findButton('预览GIF').attributes('disabled')
    images[0].onload!()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['01.png', '02.png'])
    expect(view!.text()).toContain('图片宽度 (100px)')
    expect(view!.text()).toContain('图片高度 (100px)')
    expect(previewDisabledWhileLoading).toBeDefined()
  })

  it('第一张失败时跳过失败帧，画布取下一张成功图片并释放失败资源', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['bad.png', 'next.png'])
    const failedUrl = images[0].src
    images[1].width = 160
    images[1].height = 90
    images[1].onload!()
    images[0].onerror?.()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['next.png'])
    expect(view!.text()).toContain('图片宽度 (160px)')
    expect(view!.text()).toContain('图片高度 (90px)')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(failedUrl)
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('bad.png'))
    expect(findButton('预览GIF').attributes('disabled')).toBeUndefined()
  })

  it('后一批先解码也必须等待前一批，最终保留连续选择的批次顺序', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['01.png', '02.png'])
    await uploadFiles(['03.png'])
    images[2].onload!()
    images[1].onload!()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename')).toHaveLength(0)
    images[0].onload!()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['01.png', '02.png', '03.png'])
  })

  it('清空会取消未完成解码并释放地址，迟到回调不能把图片重新加入', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['existing.png'])
    images[0].onload!()
    await flushPromises()
    await uploadFiles(['late.png'])
    const pendingUrl = images[1].src
    const lateLoad = images[1].onload!
    await findButton('清空').trigger('click')
    lateLoad()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename')).toHaveLength(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(pendingUrl)
    expect(images[1].onload).toBeNull()
    expect(findButton('预览GIF').attributes('disabled')).toBeDefined()
    await uploadFiles(['new.png'])
    images[2].onload!()
    lateLoad()
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['new.png'])
  })

  it('首帧还未读完时也能清空，同时释放已读完但等待入队的后续帧', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['pending.png', 'ready.png'])
    const urls = images.map(image => image.src)
    images[1].onload!()
    await flushPromises()
    await findButton('清空').trigger('click')
    expect(view!.findAll('.image-gif-filename')).toHaveLength(0)
    urls.forEach(url => expect(URL.revokeObjectURL).toHaveBeenCalledWith(url))
    expect(view!.find('[role="status"]').exists()).toBe(false)
  })

  it('卸载会释放尚未解码的资源并解除事件，迟到回调不再产生消息', async () => {
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['late.png'])
    const pendingUrl = images[0].src
    const lateLoad = images[0].onload!
    const lateError = images[0].onerror
    view!.unmount()
    view = undefined
    lateLoad()
    lateError?.()
    await flushPromises()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(pendingUrl)
    expect(images[0].onload).toBeNull()
    expect(images[0].onerror).toBeNull()
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('解码超时会释放阻塞项，已解码的后续图片可以正常入队与预览', async () => {
    vi.useFakeTimers()
    const images = controlImageDecoding()
    mountPage()
    await uploadFiles(['stuck.png', 'ready.png'])
    const stuckUrl = images[0].src
    images[1].onload!()
    await vi.advanceTimersByTimeAsync(30_000)
    await flushPromises()
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['ready.png'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(stuckUrl)
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('读取超时'))
    expect(findButton('预览GIF').attributes('disabled')).toBeUndefined()
  })
})

describe('图片合成 GIF 的排序预览一致性', () => {
  it('上移和下移都会撤销旧预览并禁用下载，重新生成后才能下载新顺序', async () => {
    await createPreview()
    expect(findButton('下载GIF').attributes('disabled')).toBeUndefined()
    const firstPreview = view!.get('.image-gif-preview img').attributes('src')
    await view!.get('button[aria-label="上移第 2 张图片"]').trigger('click')
    expect(view!.findAll('.image-gif-filename').map(item => item.text())).toEqual(['second.png', 'first.png'])
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(firstPreview)
    expect(findButton('下载GIF').attributes('disabled')).toBeDefined()
    expect(view!.find('.image-gif-preview img').exists()).toBe(false)
    await findButton('预览GIF').trigger('click')
    await flushPromises()
    mocks.finished!(new Blob(['new-gif'], { type: 'image/gif' }))
    await flushPromises()
    expect(findButton('下载GIF').attributes('disabled')).toBeUndefined()
    await view!.get('button[aria-label="下移第 1 张图片"]').trigger('click')
    expect(findButton('下载GIF').attributes('disabled')).toBeDefined()
  })

  it('原拖拽排序变化同样撤销预览，顺序未变化不会误删现有结果', async () => {
    await createPreview()
    const drag = view!.findComponent(DraggableStub)
    const source = [...drag.props('modelValue')]
    drag.vm.$emit('update:modelValue', [...source])
    await flushPromises()
    expect(findButton('下载GIF').attributes('disabled')).toBeUndefined()
    drag.vm.$emit('update:modelValue', [...source].reverse())
    await flushPromises()
    expect(findButton('下载GIF').attributes('disabled')).toBeDefined()
    expect(view!.find('.image-gif-preview img').exists()).toBe(false)
  })

  it('正在生成时锁定拖拽和顺序按钮，防止结果顺序在编码期间变化', async () => {
    await createPreview()
    await findButton('预览GIF').trigger('click')
    await flushPromises()
    expect(view!.findComponent(DraggableStub).props('disabled')).toBe(true)
    expect(view!.get('button[aria-label="下移第 1 张图片"]').attributes('disabled')).toBeDefined()
    expect(view!.get('button[aria-label="上移第 2 张图片"]').attributes('disabled')).toBeDefined()
  })
})
