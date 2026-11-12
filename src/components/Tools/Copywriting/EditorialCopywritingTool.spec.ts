/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getBundledEditorialLibrary, type EditorialCopywritingKind } from '@/services/editorialCopywriting'
import EditorialCopywritingTool from './EditorialCopywritingTool.vue'

const mocks = vi.hoisted(() => ({ copy: vi.fn(), success: vi.fn(), error: vi.fn(), fetch: vi.fn() }))
vi.mock('@/utils/copy', () => ({ copy: mocks.copy }))
vi.mock('element-plus', () => ({ ElMessage: { success: mocks.success, error: mocks.error } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/copywriting/test' }) }))

let view: VueWrapper | undefined

/** 挂载真实操作区和数据逻辑，隔离与测试无关的工具推荐区域。 */
function openTool(kind: EditorialCopywritingKind) {
  view = mount(EditorialCopywritingTool, { props: { kind }, global: { stubs: { ToolsRecommend: true } } })
  return view
}

/** 用页面可见的按钮文案触发用户操作。 */
function button(name: string) {
  const found = view!.findAll('button').find(item => item.text() === name)
  if (!found) throw new Error(`页面没有“${name}”按钮`)
  return found
}

/** 读取用户当前能看到、复制的正文。 */
function content() {
  return view!.get('[data-copywriting-content]').text()
}

beforeEach(() => {
  mocks.fetch.mockReset().mockRejectedValue(new Error('模拟 API 不可用'))
  mocks.copy.mockReset().mockResolvedValue(true)
  mocks.success.mockClear()
  mocks.error.mockClear()
  vi.stubGlobal('fetch', mocks.fetch)
})

afterEach(() => {
  view?.unmount()
  view = undefined
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('四个站内文案工具', () => {
  it.each([
    ['kfc', '换一条'], ['daily-poem', '换一首'], ['dog-diary', '换一篇'], ['moments', '换一条']
  ] as const)('%s 接口离线时仍有首屏内容，连续切换无需再次请求', async (kind, next) => {
    openTool(kind)
    const first = content()
    expect(first.length).toBeGreaterThan(10)
    await flushPromises()
    await button(next).trigger('click')
    const second = content()
    await button(next).trigger('click')
    expect(new Set([first, second, content()]).size).toBe(3)
    expect(mocks.fetch).toHaveBeenCalledOnce()
  })

  it('星期四英文始终和当前中文成对，不调用旧翻译接口', async () => {
    const tool = openTool('kfc')
    const items = getBundledEditorialLibrary('kfc').items
    await button('查看英文版').trigger('click')
    const firstEnglish = tool.get('[lang="en"]').text()
    expect(firstEnglish).toBe(items.find(item => item.text === content())?.english)
    await button('换一条').trigger('click')
    const english = tool.get('[lang="en"]').text()
    expect(english).not.toBe(firstEnglish)
    expect(english).toBe(items.find(item => item.text === content())?.english)
    await button('复制英文').trigger('click')
    expect(mocks.copy).toHaveBeenCalledWith(english)
    expect(mocks.fetch).toHaveBeenCalledOnce()
  })

  it('诗词复制包含完整分行、作者和出处；剪贴板拒绝时不误报成功', async () => {
    openTool('daily-poem')
    const poem = getBundledEditorialLibrary('daily-poem').items.find(item => item.text === content())!
    expect(poem.text).toContain('\n')
    mocks.copy.mockResolvedValue(false)
    await button('复制诗词').trigger('click')
    expect(mocks.copy).toHaveBeenCalledWith(`${poem.title}\n${poem.dynasty} · ${poem.author}\n\n${poem.text}\n\n出处：${poem.from}`)
    expect(mocks.success).not.toHaveBeenCalled()
    expect(mocks.error).toHaveBeenCalledOnce()
  })

  it('朋友圈按场景换一轮，组内不提前重复也不会换到其他场景', async () => {
    openTool('moments')
    const inScene = getBundledEditorialLibrary('moments').items.filter(item => item.topic === '出游')
    await button('出游').trigger('click')
    expect(button('出游').attributes('aria-pressed')).toBe('true')
    const visited = new Set<string>()
    for (let index = 0; index < inScene.length; index++) {
      visited.add(content())
      await button('换一条').trigger('click')
    }
    expect(visited).toEqual(new Set(inScene.map(item => item.text)))
    expect(content()).toBe([...visited][0])
  })

  it('较新的同域内容可供下一次切换，迟到响应不覆盖用户已选文案', async () => {
    let respond!: (response: unknown) => void
    mocks.fetch.mockImplementation(() => new Promise(resolve => { respond = resolve }))
    openTool('dog-diary')
    await button('换一篇').trigger('click')
    const chosen = content()
    const items = [{ id: 'new-1', text: '新版日记第一篇' }, { id: 'new-2', text: '新版日记第二篇' }]
    respond({ ok: true, json: async () => ({ code: 200, data: { updatedAt: '2026-11-13', items } }) })
    await flushPromises()
    expect(content()).toBe(chosen)
    await button('换一篇').trigger('click')
    expect(content()).toBe(items[0].text)
  })

  it('页面跨北京时间午夜恢复显示时会更新今日精选', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-12T15:59:59Z'))
    const tool = openTool('daily-poem')
    const first = content()
    vi.setSystemTime(new Date('2026-11-12T16:00:01Z'))
    document.dispatchEvent(new Event('visibilitychange'))
    await tool.vm.$nextTick()
    expect(tool.get('.editorial-output time').attributes('datetime')).toBe('2026-11-13')
    expect(content()).not.toBe(first)
  })
})
