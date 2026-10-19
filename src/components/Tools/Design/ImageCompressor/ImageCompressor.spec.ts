/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ImageCompressor from './ImageCompressor.vue'

vi.mock('element-plus', () => ({ ElMessage: { warning: vi.fn() } }))

const readers: { result: string; onload?: () => void; onerror?: () => void }[] = []
const images: { src: string; onload?: () => void; onerror?: () => void }[] = []
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
  wrapper = mount(ImageCompressor, { global: { stubs: { ToolsRecommend: true } } })
})
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

/** 通过文件输入替换当前图片，异步加载由测试显式控制完成顺序。 */
const selectFile = async (name = 'sample.png') => {
  const input = wrapper!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: [new File(['image'], name, { type: 'image/png' })] })
  await input.trigger('change')
}

/** 完成指定文件读取，创建后续可独立控制成功或失败的图片加载。 */
const finishRead = async (index: number, value = `data:image/png;base64,image${index}`) => {
  readers[index].result = value
  readers[index].onload?.()
  await wrapper!.vm.$nextTick()
}

/** 判断页面是否仍提供结果下载，防止失败后误下载上一张图。 */
const hasDownload = () => wrapper!.findAll('button').some((button) => button.text().includes('下载图片'))

describe('设计图片压缩器的异步状态', () => {
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
