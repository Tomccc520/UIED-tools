/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { getDailyEditorialEntry, getEditorialDay, getNextEditorialEntry, type EditorialCopywritingKind } from '@/services/editorialCopywriting'
import kfcLibrary from '../../../../backend/likeadmin-go/server/admin/service/common/copywriting_library/kfc.json'
import poemLibrary from '../../../../backend/likeadmin-go/server/admin/service/common/copywriting_library/daily-poem.json'
import diaryLibrary from '../../../../backend/likeadmin-go/server/admin/service/common/copywriting_library/dog-diary.json'
import momentsLibrary from '../../../../backend/likeadmin-go/server/admin/service/common/copywriting_library/moments.json'
import EditorialCopywritingTool from './EditorialCopywritingTool.vue'

const bundledLibraries = {
  kfc: kfcLibrary,
  'daily-poem': poemLibrary,
  'dog-diary': diaryLibrary,
  moments: momentsLibrary
}

const mocks = vi.hoisted(() => ({ copy: vi.fn(), success: vi.fn(), error: vi.fn(), fetch: vi.fn() }))
vi.mock('@/utils/copy', () => ({ copy: mocks.copy }))
vi.mock('element-plus', () => ({ ElMessage: { success: mocks.success, error: mocks.error } }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/copywriting/test' }) }))

let view: VueWrapper | undefined

/** 挂载真实操作区和数据逻辑，隔离与测试无关的工具推荐区域。 */
function openTool(kind: EditorialCopywritingKind) {
  view = mount(EditorialCopywritingTool, {
    props: { kind, bundledLibrary: bundledLibraries[kind] },
    global: { stubs: { ToolsRecommend: true } }
  })
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
  ] as const)('%s 接口离线时首屏及连续切换均可使用内置内容', async (kind, next) => {
    openTool(kind)
    const first = content()
    expect(first.length).toBeGreaterThan(10)
    await flushPromises()
    await button(next).trigger('click')
    await flushPromises()
    const second = content()
    await button(next).trigger('click')
    await flushPromises()
    expect(new Set([first, second, content()]).size).toBe(3)
    expect(mocks.fetch).toHaveBeenCalledTimes(kind === 'kfc' || kind === 'dog-diary' ? 3 : 1)
  })

  it('星期四英文始终和当前中文成对，不调用旧翻译接口', async () => {
    const tool = openTool('kfc')
    const { items } = kfcLibrary
    await button('查看英文版').trigger('click')
    const firstEnglish = tool.get('[lang="en"]').text()
    expect(firstEnglish).toBe(items.find(item => item.text === content())?.english)
    await button('换一条').trigger('click')
    await flushPromises()
    const english = tool.get('[lang="en"]').text()
    expect(english).not.toBe(firstEnglish)
    expect(english).toBe(items.find(item => item.text === content())?.english)
    await button('复制英文').trigger('click')
    expect(mocks.copy).toHaveBeenCalledWith(english)
    expect(mocks.fetch.mock.calls.map(([url]) => url)).toEqual([
      '/api/common/copywriting/library/kfc', '/api/common/copywriting/kfc'
    ])
  })

  it('星期四直接展示正文，换条后不会显示上一次迟到的译文', async () => {
    let resolveFirstTranslation!: (response: unknown) => void
    let firstTranslationSignal: AbortSignal | undefined
    /** 模拟标准 Go 文案响应，保留调用方传入的来源字段。 */
    const response = (data: { text: string; source?: string; from?: string }) => ({
      ok: true,
      json: async () => ({ code: 200, data })
    })
    mocks.fetch
      .mockRejectedValueOnce(new Error('模拟内容库同步失败'))
      .mockResolvedValueOnce(response({ text: '网络文案第一条', source: 'upstream', from: '夏柔 API · v50' }))
      .mockImplementationOnce((_url, { signal }) => {
        firstTranslationSignal = signal
        return new Promise(resolve => { resolveFirstTranslation = resolve })
      })
      .mockResolvedValueOnce(response({ text: '网络文案第二条', source: 'upstream', from: '60s API' }))
      .mockResolvedValueOnce(response({ text: 'English for the second story' }))
      .mockResolvedValueOnce(response({ text: kfcLibrary.items[0].text, source: 'editorial' }))

    const tool = openTool('kfc')
    await button('换一条').trigger('click')
    await flushPromises()
    expect(content()).toBe('网络文案第一条')
    expect(tool.find('.standard-tool-header__meta, .editorial-output__meta').exists()).toBe(false)
    expect(mocks.fetch).toHaveBeenCalledTimes(2)

    await button('查看英文版').trigger('click')
    expect(tool.text()).toContain('正在翻译')
    await button('换一条').trigger('click')
    await flushPromises()
    expect(firstTranslationSignal?.aborted).toBe(true)
    expect(content()).toBe('网络文案第二条')
    resolveFirstTranslation(response({ text: 'Stale translation' }))
    await flushPromises()
    expect(tool.get('[lang="en"]').text()).toBe('English for the second story')
    await button('复制中文').trigger('click')
    expect(mocks.copy).toHaveBeenLastCalledWith('网络文案第二条')

    await button('换一条').trigger('click')
    await flushPromises()
    const local = kfcLibrary.items.find(item => item.text === content())
    expect(tool.get('[lang="en"]').text()).toBe(local?.english)
    expect(mocks.fetch).toHaveBeenCalledTimes(6)
  })

  it('诗词复制包含完整分行、作者和出处；剪贴板拒绝时不误报成功', async () => {
    openTool('daily-poem')
    const poem = poemLibrary.items.find(item => item.text === content())!
    expect(poem.text).toContain('\n')
    mocks.copy.mockResolvedValue(false)
    await button('复制诗词').trigger('click')
    expect(mocks.copy).toHaveBeenCalledWith(`${poem.title}\n${poem.dynasty} · ${poem.author}\n\n${poem.text}\n\n出处：${poem.from}`)
    expect(mocks.success).not.toHaveBeenCalled()
    expect(mocks.error).toHaveBeenCalledOnce()
  })

  it('换一篇显示夏柔日记的来源，复制网络日记正文', async () => {
    const text = '这是一篇模拟返回的网络日记。'
    mocks.fetch.mockRejectedValueOnce(new Error('模拟内容库同步失败')).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 200, data: { text, source: 'upstream', from: '夏柔 API' } })
    })
    const tool = openTool('dog-diary')
    await button('换一篇').trigger('click')
    await flushPromises()
    expect(mocks.fetch.mock.calls[1][0]).toBe('/api/common/copywriting/random/dog-diary')
    expect(content()).toBe(text)
    expect(tool.get('.editorial-output__meta a').attributes('href')).toBe('https://api.aa1.cn/doc/tiangou.html')
    await button('复制日记').trigger('click')
    expect(mocks.copy).toHaveBeenLastCalledWith(text)
  })

  it('朋友圈按场景换一轮，组内不提前重复也不会换到其他场景', async () => {
    openTool('moments')
    const inScene = momentsLibrary.items.filter(item => item.topic === '出游')
    await button('出游').trigger('click')
    expect(button('出游').attributes('aria-pressed')).toBe('true')
    expect(view!.get('.editorial-meta').text()).toContain('50 条')
    const visited = new Set<string>()
    for (let index = 0; index < inScene.length; index++) {
      visited.add(content())
      await button('换一条').trigger('click')
    }
    expect(visited).toEqual(new Set(inScene.map(item => item.text)))
    expect(content()).toBe([...visited][0])
  })

  it('新版页面遇到同日发布的旧 API 时保留完整内容库', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-11-12T12:00:00+08:00'))
    const { items, updatedAt } = kfcLibrary
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: { updatedAt, items: items.slice(0, 24) } })
    })
    openTool('kfc')
    await flushPromises()
    const today = getDailyEditorialEntry(items, getEditorialDay().index)
    expect(content()).toBe(today.text)
    await button('换一条').trigger('click')
    await flushPromises()
    expect(content()).toBe(getNextEditorialEntry(items, today.id).text)
  })

  it('较新的同域内容可供下一次切换，迟到响应不覆盖用户已选文案', async () => {
    let respond!: (response: unknown) => void
    mocks.fetch.mockImplementationOnce(() => new Promise(resolve => { respond = resolve }))
    openTool('dog-diary')
    await button('换一篇').trigger('click')
    await flushPromises()
    const chosen = content()
    const items = [{ id: 'new-1', text: '新版日记第一篇' }, { id: 'new-2', text: '新版日记第二篇' }]
    respond({ ok: true, json: async () => ({ code: 200, data: { updatedAt: '2026-11-13', items } }) })
    await flushPromises()
    expect(content()).toBe(chosen)
    await button('换一篇').trigger('click')
    await flushPromises()
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
