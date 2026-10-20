/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { shallowMount, type VueWrapper } from '@vue/test-utils'
import VideoCrop from './VideoCrop.vue'

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/video/crop' }), onBeforeRouteLeave: vi.fn() }))
vi.mock('element-plus', () => ({ ElMessage: { warning: vi.fn(), error: vi.fn(), success: vi.fn() } }))
vi.mock('@/composables/useToolConsume', () => ({ useToolConsume: () => ({ ensureToolConsume: vi.fn() }) }))

let view: VueWrapper | undefined

/** 上传本地测试视频并固定画面区域，以真实模板事件检查触屏裁剪交互。 */
async function mountCrop() {
  view = shallowMount(VideoCrop)
  const input = view.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [new File(['video'], 'clip.mp4', { type: 'video/mp4' })], configurable: true })
  await input.trigger('change')
  const box = view.get('.video-crop-box')
  const container = box.element.parentElement!.parentElement!
  vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ width: 200, height: 100 } as DOMRect)
  return box
}

/** 构造带指针身份的浏览器事件；jsdom 缺少 PointerEvent 时仍使用真实 DOM 派发。 */
function pointer(target: EventTarget, type: string, pointerId: number, clientX: number, clientY: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY })
  Object.defineProperties(event, { pointerId: { value: pointerId }, isPrimary: { value: true }, pointerType: { value: 'touch' } })
  target.dispatchEvent(event)
}

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  URL.createObjectURL = vi.fn(() => 'blob:crop-test')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => { view?.unmount(); view = undefined; vi.restoreAllMocks() })

describe('视频裁剪的指针交互', () => {
  it('只跟随开始拖动的指针，位置始终钳制在画面内', async () => {
    const box = await mountCrop()
    pointer(box.element, 'pointerdown', 1, 100, 50)
    pointer(window, 'pointermove', 2, 300, 150)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 10%')
    pointer(window, 'pointermove', 1, 500, 500)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 20%')
    expect(box.attributes('style')).toContain('top: 20%')
    pointer(window, 'pointermove', 1, -500, -500)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 0%')
    expect(box.attributes('style')).toContain('top: 0%')
  })

  it.each([
    { corner: '左上', index: 0, shrinkX: 999, shrinkY: 999, expandX: -999, expandY: -999 },
    { corner: '右上', index: 1, shrinkX: -999, shrinkY: 999, expandX: 999, expandY: -999 },
    { corner: '左下', index: 2, shrinkX: 999, shrinkY: -999, expandX: -999, expandY: 999 },
    { corner: '右下', index: 3, shrinkX: -999, shrinkY: -999, expandX: 999, expandY: 999 }
  ])('$corner 角缩放保持尺寸边界，忽略其他指针的移动和释放', async ({ index, shrinkX, shrinkY, expandX, expandY }) => {
    const box = await mountCrop()
    const handle = view!.findAll('.video-crop-handle')[index]
    pointer(handle.element, 'pointerdown', 3, 180, 90)
    pointer(window, 'pointermove', 9, 0, 0)
    pointer(window, 'pointerup', 9, 0, 0)
    pointer(window, 'pointermove', 3, shrinkX, shrinkY)
    await nextTick()
    expect(box.attributes('style')).toContain('width: 5%')
    expect(box.attributes('style')).toContain('height: 5%')
    pointer(window, 'pointermove', 3, expandX, expandY)
    await nextTick()
    expect(box.attributes('style')).toContain('width: 90%')
    expect(box.attributes('style')).toContain('height: 90%')
  })

  it('pointercancel 和 pointerup 结束旧操作、清理监听，并允许下一次拖动', async () => {
    const box = await mountCrop()
    const remove = vi.spyOn(window, 'removeEventListener')
    pointer(box.element, 'pointerdown', 4, 100, 50)
    pointer(window, 'pointercancel', 4, 100, 50)
    pointer(window, 'pointermove', 4, 140, 70)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 10%')
    expect(remove).toHaveBeenCalledWith('pointermove', expect.any(Function))
    expect(remove).toHaveBeenCalledWith('pointercancel', expect.any(Function))
    pointer(box.element, 'pointerdown', 5, 100, 50)
    pointer(window, 'pointermove', 5, 110, 55)
    pointer(window, 'pointerup', 5, 110, 55)
    pointer(window, 'pointermove', 5, 150, 75)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 15%')
    expect(box.attributes('style')).toContain('top: 15%')
  })

  it('取消角点缩放后允许开始拖动，卸载会移除全部在途监听', async () => {
    const box = await mountCrop()
    const remove = vi.spyOn(window, 'removeEventListener')
    pointer(view!.findAll('.video-crop-handle')[3].element, 'pointerdown', 7, 100, 50)
    pointer(window, 'pointercancel', 7, 100, 50)
    pointer(window, 'pointermove', 7, 999, 999)
    await nextTick()
    expect(box.attributes('style')).toContain('width: 80%')
    pointer(box.element, 'pointerdown', 8, 100, 50)
    pointer(window, 'pointermove', 8, 110, 55)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 15%')
    view!.unmount()
    view = undefined
    for (const event of ['pointermove', 'pointerup', 'pointercancel', 'blur']) {
      expect(remove).toHaveBeenCalledWith(event, expect.any(Function))
    }
  })

  it('窗口失焦清理拖动与缩放，窗口外释放后下一次交互仍可开始', async () => {
    const box = await mountCrop()
    pointer(box.element, 'pointerdown', 10, 100, 50)
    window.dispatchEvent(new Event('blur'))
    pointer(window, 'pointermove', 10, 999, 999)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 10%')
    const handle = view!.findAll('.video-crop-handle')[3]
    pointer(handle.element, 'pointerdown', 11, 100, 50)
    pointer(window, 'pointermove', 11, 110, 55)
    await nextTick()
    expect(box.attributes('style')).toContain('width: 85%')
    window.dispatchEvent(new Event('blur'))
    pointer(window, 'pointermove', 11, -999, -999)
    await nextTick()
    expect(box.attributes('style')).toContain('width: 85%')
    pointer(box.element, 'pointerdown', 12, 100, 50)
    pointer(window, 'pointermove', 12, 110, 55)
    pointer(window, 'pointerup', 12, 110, 55)
    await nextTick()
    expect(box.attributes('style')).toContain('left: 15%')
    expect(box.attributes('style')).toContain('top: 15%')
  })
})
