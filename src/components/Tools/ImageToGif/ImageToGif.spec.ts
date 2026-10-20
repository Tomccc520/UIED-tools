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

const mocks = vi.hoisted(() => ({ finished: null as null | ((blob: Blob) => void), render: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-to-gif' }) }))
vi.mock('element-plus', () => ({ ElMessage: { success: vi.fn(), error: vi.fn() } }))
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

/** 挂载真实页面、上传两张图片并生成一份可下载的 GIF 预览。 */
async function createPreview() {
  view = mount(ImageToGif, { global: {
    mocks: { $ensureFreeToolTitle: (title: string) => title },
    stubs: {
      draggable: DraggableStub, ToolsRecommend: true,
      ElButton: defineComponent({ props: ['disabled', 'loading', 'type'], template: '<button type="button" :disabled="disabled || loading"><slot /></button>' }),
      ElInputNumber: true, ElSlider: true, ElSwitch: true, ElIcon: true, ElProgress: true
    }
  } })
  const input = view.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [
    new File(['first'], 'first.png', { type: 'image/png' }), new File(['second'], 'second.png', { type: 'image/png' })
  ] })
  await input.trigger('change')
  await flushPromises()
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

afterEach(() => { view?.unmount(); view = undefined; vi.restoreAllMocks(); vi.unstubAllGlobals() })

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
