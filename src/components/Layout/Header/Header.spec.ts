/**
 * @description 主站导航断点与抽屉状态回归。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { shallowMount, flushPromises, type VueWrapper } from '@vue/test-utils'
import Header from './Header.vue'

interface NavigationStore {
  leftCom: boolean
  leftComDrawer: boolean
  setLeftComStatus: (status: boolean) => void
  setleftComDrawerStatus: (status: boolean) => void
}

const shared = vi.hoisted(() => ({ store: undefined as unknown as NavigationStore }))
vi.mock('@/store/modules/component', () => ({ useComponentStore: () => shared.store }))
vi.mock('@/store/modules/tools', () => ({ useToolsStore: () => ({ getAllTools: () => [] }) }))
vi.mock('@/components/Search/Search.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/router', () => ({ default: { currentRoute: { value: { fullPath: '/' } }, push: vi.fn() } }))
vi.mock('@/services/siteConfig', () => ({
  getDefaultSitePublicConfig: () => ({ headerLinks: [], toolCategories: [], loginEnabled: false }),
  getSitePublicConfig: async () => ({ headerLinks: [], toolCategories: [], loginEnabled: false })
}))
vi.mock('@/services/frontendUser', () => ({
  FRONTEND_USER_AUTH_EVENT: 'test-auth',
  FRONTEND_USER_LOGIN_PROMPT_EVENT: 'test-login',
  loginFrontendUser: vi.fn(),
  getFrontendUserProfile: () => null,
  isFrontendUserLoggedIn: () => false
}))

let wrapper: VueWrapper | undefined
const originalWidth = window.innerWidth

/** 函数说明：设置窗口宽度并派发真实 resize 事件，验证导航跨断点的行为。 */
const resizeWindow = async (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  window.dispatchEvent(new Event('resize'))
  await nextTick()
}

/** 函数说明：挂载真实头部逻辑，仅替换与导航无关的组件和远程依赖。 */
const mountHeader = async () => {
  wrapper = shallowMount(Header, {
    global: { stubs: {
      RouterLink: true,
      ElIcon: true,
      ElTooltip: true,
      ElDialog: true,
      ElForm: true,
      ElFormItem: true,
      ElInput: true,
      ElButton: true
    } }
  })
  await flushPromises()
  return wrapper
}

beforeEach(() => {
  shared.store = reactive({
    leftCom: false,
    leftComDrawer: false,
    setLeftComStatus: vi.fn((status: boolean) => { shared.store.leftCom = status }),
    setleftComDrawerStatus: vi.fn((status: boolean) => { shared.store.leftComDrawer = status })
  })
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
})

describe('头部菜单断点', () => {
  it.each([320, 768, 820, 991])('%dpx 使用抽屉并保持桌面折叠偏好不变', async (width) => {
    await resizeWindow(width)
    const header = await mountHeader()
    const button = header.get('.menu-toggle')
    expect(button.attributes('aria-expanded')).toBe('false')
    await button.trigger('click')
    expect(shared.store.leftComDrawer).toBe(true)
    expect(shared.store.leftCom).toBe(false)
    expect(button.attributes('aria-expanded')).toBe('true')
  })

  it('992px 使用固定侧栏，不打开抽屉', async () => {
    await resizeWindow(992)
    const header = await mountHeader()
    const button = header.get('.menu-toggle')
    expect(button.attributes('aria-expanded')).toBe('true')
    await button.trigger('click')
    expect(shared.store.leftCom).toBe(true)
    expect(shared.store.leftComDrawer).toBe(false)
    expect(button.attributes('aria-expanded')).toBe('false')
  })

  it('进入桌面立即关闭抽屉，返回平板不会恢复旧遮罩', async () => {
    await resizeWindow(991)
    const header = await mountHeader()
    await header.get('.menu-toggle').trigger('click')
    expect(shared.store.leftComDrawer).toBe(true)
    await resizeWindow(992)
    expect(shared.store.leftComDrawer).toBe(false)
    expect(header.get('.menu-toggle').attributes('aria-expanded')).toBe('true')
    await resizeWindow(820)
    expect(shared.store.leftComDrawer).toBe(false)
    expect(header.get('.menu-toggle').attributes('aria-expanded')).toBe('false')
  })

  it('抽屉通过遮罩或关闭键关闭后，菜单按钮同步显示展开状态', async () => {
    await resizeWindow(820)
    const header = await mountHeader()
    await header.get('.menu-toggle').trigger('click')
    shared.store.leftComDrawer = false
    await nextTick()
    expect(header.get('.menu-toggle').attributes('aria-expanded')).toBe('false')
    expect(header.get('.menu-toggle').attributes('aria-label')).toBe('展开侧边栏')
  })

  it('抽屉模式内旋转屏幕或调整宽度不会关闭已经打开的导航', async () => {
    await resizeWindow(375)
    const header = await mountHeader()
    await header.get('.menu-toggle').trigger('click')
    await resizeWindow(820)
    expect(shared.store.leftComDrawer).toBe(true)
    expect(header.get('.menu-toggle').attributes('aria-expanded')).toBe('true')
    await resizeWindow(991)
    expect(shared.store.leftComDrawer).toBe(true)
  })

  it('切换抽屉导航并返回桌面后保留原有桌面折叠偏好', async () => {
    await resizeWindow(1440)
    const header = await mountHeader()
    await header.get('.menu-toggle').trigger('click')
    expect(shared.store.leftCom).toBe(true)
    await resizeWindow(768)
    await header.get('.menu-toggle').trigger('click')
    expect(shared.store.leftComDrawer).toBe(true)
    expect(shared.store.leftCom).toBe(true)
    await resizeWindow(992)
    expect(shared.store.leftComDrawer).toBe(false)
    expect(shared.store.leftCom).toBe(true)
    expect(header.get('.menu-toggle').attributes('aria-expanded')).toBe('false')
  })
})
