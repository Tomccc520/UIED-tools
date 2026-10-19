/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import ImageCompress from './ImageCompress.vue'

const mocks = vi.hoisted(() => ({
  compress: vi.fn(), addToZip: vi.fn(), generateZip: vi.fn(), download: vi.fn(),
  message: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }
}))
vi.mock('compressorjs', () => ({ default: class { constructor(file: Blob, options: unknown) { mocks.compress(file, options) } } }))
vi.mock('element-plus', () => ({ ElMessage: mocks.message }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/image-compress' }) }))
vi.mock('@/utils/file', () => ({ autoDown: mocks.download }))
vi.mock('jszip', () => ({ default: class { file = mocks.addToZip; generateAsync = mocks.generateZip } }))

let wrapper: VueWrapper | undefined
let urlCount = 0
beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => `blob:test-${++urlCount}`), revokeObjectURL: vi.fn() })
  mocks.compress.mockImplementation((_file, options) => options.success(new Blob(['compressed'], { type: 'image/jpeg' })))
  mocks.generateZip.mockResolvedValue(new Blob(['zip']))
})
afterEach(() => { wrapper?.unmount(); vi.unstubAllGlobals() })

/** 挂载真实文件队列与压缩逻辑，仅替换浏览器编解码和站点外壳。 */
const mountCompressor = () => {
  wrapper = mount(ImageCompress, { global: { stubs: {
    StandardToolPageTemplate: { template: '<main><slot /><slot name="actions" /></main>' },
    ToolsRecommend: true, ElImage: true, ElSlider: true,
    ElButton: defineComponent({ props: ['disabled'], template: '<button :disabled="disabled"><slot /></button>' })
  } } })
  return wrapper
}

/** 通过真实文件输入事件添加本地文件，验证批次状态而不访问组件私有方法。 */
const addFiles = async (files: File[]) => {
  const input = wrapper!.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: files })
  await input.trigger('change')
}

/** 创建尺寸足够大的 JPEG 样本供压缩引擎替身处理。 */
const image = (name: string, type = 'image/jpeg') => new File(['original image content'], name, { type })

/** 点击压缩入口并等待批次结果回写。 */
const compress = async () => {
  await wrapper!.get('[data-smoke="image-compress-start"]').trigger('click')
  await flushPromises()
}

describe('图片压缩批量与打包', () => {
  it('已完成数量响应式更新，新增图片会在打包前完成压缩', async () => {
    const view = mountCompressor()
    await addFiles([image('first.jpg')])
    await compress()
    expect(view.text()).toContain('已完成: 1')
    await addFiles([image('second.jpg')])
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.compress).toHaveBeenCalledTimes(2)
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_first.jpg', 'uied_second.jpg'])
    expect(view.text()).toContain('已完成: 2')
  })

  it('同名图片的独立下载及 ZIP 条目均有唯一名称', async () => {
    const view = mountCompressor()
    await addFiles([image('same.jpg'), image('same.jpg')])
    await compress()
    expect(view.findAll('a[download]').map((link) => link.attributes('download'))).toEqual(['uied_same.jpg', 'uied_same (2).jpg'])
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_same.jpg', 'uied_same (2).jpg'])
  })

  it('打包期间锁定上传、移除和重新压缩，避免结果被清空或重复下载', async () => {
    const view = mountCompressor()
    await addFiles([image('one.jpg')])
    await compress()
    let finishZip!: (blob: Blob) => void
    mocks.generateZip.mockReturnValue(new Promise<Blob>((resolve) => { finishZip = resolve }))
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeDefined()
    await addFiles([image('blocked.jpg')])
    expect(view.findAll('[data-smoke="image-compress-file"]')).toHaveLength(1)
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    expect(mocks.generateZip).toHaveBeenCalledTimes(1)
    finishZip(new Blob(['zip']))
    await flushPromises()
    expect(view.get('button[aria-label="移除 one.jpg"]').attributes('disabled')).toBeUndefined()
  })

  it('损坏图片显示持久错误，不阻止后续文件压缩；移除后剩余结果可下载', async () => {
    const view = mountCompressor()
    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Cannot decode image')))
    await addFiles([image('broken.jpg'), image('good.jpg')])
    await compress()
    expect(view.get('[role="alert"]').text()).toContain('图片可能已损坏')
    expect(view.text()).toContain('已完成: 1')
    await view.get('button[aria-label="移除 broken.jpg"]').trigger('click')
    expect(view.findAll('[role="alert"]')).toHaveLength(0)
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.addToZip.mock.calls.map((call) => call[0])).toEqual(['uied_good.jpg'])
  })

  it('重新压缩失败时撤下旧结果，不能继续下载上一次的文件', async () => {
    const view = mountCompressor()
    await addFiles([image('retry.jpg')])
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(1)
    mocks.compress.mockImplementationOnce((_file, options) => options.error(new Error('Decode failed on retry')))
    await compress()
    expect(view.findAll('a[download]')).toHaveLength(0)
    expect(view.get('[role="alert"]').text()).toContain('压缩失败')
    expect(view.text()).not.toContain('已完成: 1')
  })

  it('生成 ZIP 失败后明确报错并解除锁定，允许重试下载', async () => {
    const view = mountCompressor()
    await addFiles([image('retry.zip.jpg')])
    await compress()
    mocks.generateZip.mockRejectedValueOnce(new Error('ZIP failed'))
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.message.error).toHaveBeenCalledWith('打包下载失败，请重试')
    expect(mocks.download).not.toHaveBeenCalled()
    expect(view.get('button[aria-label="移除 retry.zip.jpg"]').attributes('disabled')).toBeUndefined()
    await view.findAll('[data-smoke="image-compress-download"]')[0].trigger('click')
    await flushPromises()
    expect(mocks.download).toHaveBeenCalledOnce()
  })

  it('缺少 MIME 但后缀有效的图片传给编码器前会补齐格式', async () => {
    mountCompressor()
    await addFiles([image('dragged.JPG', '')])
    await compress()
    expect(mocks.compress.mock.calls[0][0].type).toBe('image/jpeg')
  })
})
