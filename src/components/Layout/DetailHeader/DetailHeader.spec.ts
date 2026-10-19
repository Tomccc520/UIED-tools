/**
 * @description 工具标题路由隔离回归，防止旧详情或迟到目录覆盖当前页。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive, nextTick } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import type { Tool, ToolCategory } from '@/types/tools'
import DetailHeader from './DetailHeader.vue'

const shared = vi.hoisted(() => ({} as {
  route: { path: string; fullPath: string }
  store: { cates: ToolCategory[]; toolInfo: Tool | null; getToolCate: () => Promise<void> }
}))
vi.mock('vue-router', () => ({ useRoute: () => shared.route }))
vi.mock('@/store/modules/tools', () => ({ useToolsStore: () => shared.store }))
vi.mock('vue-clipboard3', () => ({ default: () => ({ toClipboard: vi.fn() }) }))

/** 函数说明：构造两个独立工具及同路径的会员工具入口，验证实际目录匹配行为。 */
const createCategories = (): ToolCategory[] => [{
  id: 1, title: '开发工具', list: [{ id: 2, title: '工具', list: [
    { id: 1, title: '工具甲', desc: '甲简介', url: '/tools/a', logo: '' },
    { id: 2, title: '工具乙', desc: '乙简介', url: '/tools/b', logo: '' },
    { id: 3, title: '专业工具乙', desc: '专业版简介', url: '/tools/b?mode=pro', logo: '' }
  ] }]
}]

let wrapper: VueWrapper | undefined
beforeEach(() => {
  shared.route = reactive({ path: '/tools/a', fullPath: '/tools/a' })
  shared.store = reactive({ cates: createCategories(), toolInfo: null as Tool | null, getToolCate: vi.fn(async () => {}) })
})
afterEach(() => wrapper?.unmount())

describe('当前工具页标题', () => {
  it('忽略旧页面留在共享详情中的标题，切换路由立即显示当前工具', async () => {
    shared.store.toolInfo = createCategories()[0].list[0].list[0]
    shared.route.path = '/tools/b'
    shared.route.fullPath = '/tools/b'
    wrapper = mount(DetailHeader, { props: { title: '备用标题' } })
    expect(wrapper.text()).toContain('工具乙')
    expect(wrapper.text()).not.toContain('工具甲')
    shared.route.path = '/tools/a'
    shared.route.fullPath = '/tools/a'
    await nextTick()
    expect(wrapper.text()).toContain('甲简介')
    expect(wrapper.text()).not.toContain('乙简介')
  })

  it('目录请求迟到时仍按最新路由匹配，未加载期间展示本页备用文案', async () => {
    shared.store.cates = []
    let finish!: () => void
    shared.store.getToolCate = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
    wrapper = mount(DetailHeader, { props: { title: '备用标题', subtitle: '备用简介' } })
    expect(wrapper.text()).toContain('备用标题')
    shared.route.path = '/tools/b'
    shared.route.fullPath = '/tools/b'
    shared.store.cates = createCategories()
    finish()
    await flushPromises()
    expect(wrapper.text()).toContain('工具乙')
    expect(wrapper.text()).toContain('乙简介')
    expect(wrapper.text()).not.toContain('工具甲')
  })

  it('同路径不同功能的标题保留查询参数匹配', () => {
    shared.route.path = '/tools/b'
    shared.route.fullPath = '/tools/b?mode=pro'
    wrapper = mount(DetailHeader, { props: { title: '备用标题' } })
    expect(wrapper.text()).toContain('专业工具乙')
    expect(wrapper.text()).toContain('专业版简介')
  })
})
