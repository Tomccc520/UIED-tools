/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import PdfToImages from './index.vue'

const runtime = vi.hoisted(() => ({ getDocument: vi.fn() }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/pdf-to-images' }) }))
vi.mock('element-plus', () => ({ ElMessage: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('@/utils/pdf', () => ({ getPdfFileError: () => '', ensurePdfjsRuntime: async () => runtime }))
vi.mock('jszip', () => ({ default: class {
  /** 测试只校验交付编码前的页面尺寸，ZIP 写入不改变内容。 */
  file() {}
  /** 返回最小下载 Blob，使真实转换流程可以完成。 */
  async generateAsync() { return new Blob(['zip']) }
} }))

let view: VueWrapper | undefined
let releaseFirst!: () => void
const scales: number[] = []

beforeEach(async () => {
  scales.length = 0
  const firstRender = new Promise<void>((resolve) => { releaseFirst = resolve })
  runtime.getDocument.mockReturnValue({ promise: Promise.resolve({
    numPages: 2,
    getPage: async (number: number) => ({
      getViewport: ({ scale }: { scale: number }) => { scales.push(scale); return { width: 600 * scale, height: 800 * scale } },
      render: () => ({ promise: number === 1 ? firstRender : Promise.resolve() })
    })
  }) })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,eA==')
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
  vi.stubGlobal('URL', { createObjectURL: () => 'blob:qa', revokeObjectURL: vi.fn() })
  view = mount(PdfToImages, { global: { mocks: { $ensureFreeToolTitle: (title: string) => title }, stubs: { ToolsRecommend: true, UsageGuide: true } } })
  const file = new File(['pdf'], 'two-page.pdf', { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', { value: async () => new ArrayBuffer(1) })
  const input = view.get('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
})

afterEach(() => { view?.unmount(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

/** 点击真实转换入口，并让第一页渲染保持未完成。 */
const start = async () => {
  await view!.findAll('button').find((button) => button.text().includes('开始转换'))!.trigger('click')
  await flushPromises()
  expect(scales).toEqual([150 / 72])
}

describe('PDF 转图片批次参数', () => {
  it('转换期间禁止切换 DPI，避免同一批次出现不同规格', async () => {
    await start()
    const qualityButtons = view!.findAll('button').filter((button) => button.text().includes('dpi)'))
    expect(qualityButtons).toHaveLength(2)
    expect(qualityButtons.every((button) => (button.element as HTMLButtonElement).disabled)).toBe(true)
    releaseFirst()
    await flushPromises()
  })

  it('第一页渲染期间参数值变化，剩余页面仍使用启动时 DPI 快照', async () => {
    await start()
    ;(view!.vm as unknown as { quality: number }).quality = 300
    releaseFirst()
    await flushPromises()
    expect(scales).toEqual([150 / 72, 150 / 72])
  })
})
