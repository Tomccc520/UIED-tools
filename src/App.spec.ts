/**
 * @description 使用真实应用路由出口回归热榜前后导航及手机 Teleport 清理，避免离场动画导致主内容空白。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, Teleport } from 'vue'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'

vi.mock('@/components/Layout/Header/Header.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/Layout/Left/Left.vue', () => ({ default: { template: '<nav />' } }))
vi.mock('@/components/Layout/Floor/Floor.vue', () => ({ default: { template: '<footer />' } }))
vi.mock('@/components/Layout/Right/Right.vue', () => ({ default: { template: '<aside />' } }))
vi.mock('@/components/Common/Banner.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/composables/useGlobalToolConsumeGuard', () => ({ useGlobalToolConsumeGuard: vi.fn() }))
vi.mock('@/composables/useToolRankingTracker', () => ({ useToolRankingTracker: vi.fn() }))
vi.mock('@/config/memberCoreTools', () => ({ resolveMemberCoreToolExperience: () => null }))
vi.mock('@/services/siteConfig', () => ({ getSitePublicConfig: async () => ({ toolCategories: [] }) }))
vi.mock('@/services/toolCatalog', () => ({ findToolByUrl: () => null }))
vi.mock('@/store/modules/component', () => ({ useComponentStore: () => ({ leftCom: false, leftComDrawer: false }) }))

let wrapper: VueWrapper | undefined
let host: HTMLDivElement | undefined
const originalWidth = window.innerWidth

/** 函数说明：构造包含真实 Teleport 的图片工作区，用于验证路由离开后手机操作栏被完整清理。 */
const createImagePage = () => defineComponent({
  setup() {
    const hasFiles = ref(false)
    return () => h('section', { 'data-route-page': 'image' }, [
      h('h1', '图片压缩'),
      h('button', { type: 'button', onClick: () => { hasFiles.value = true } }, '选择测试图片'),
      hasFiles.value
        ? h(Teleport, { to: 'body', disabled: window.innerWidth > 640 }, h('footer', { 'data-mobile-download': '' }, '压缩并下载'))
        : null
    ])
  }
})

/** 函数说明：挂载真实 App.vue 与内存路由，只替换外壳的远程数据和无关组件，不替换路由出口及 Vue Transition。 */
const mountApplication = async (width: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/tools/image-compress', component: createImagePage() },
      { path: '/tools/hot-ranking', component: { render: () => h('section', { 'data-route-page': 'ranking' }, '工具排行榜') } },
      { path: '/tools/json', component: { render: () => h('section', { 'data-route-page': 'json' }, 'JSON 工具') } }
    ]
  })
  await router.push('/tools/image-compress')
  await router.isReady()
  host = document.createElement('div')
  document.body.append(host)
  const errors: unknown[] = []
  wrapper = mount(App, {
    attachTo: host,
    global: {
      plugins: [router],
      config: { errorHandler: (error) => { errors.push(error) } },
      stubs: {
        transition: false,
        'transition-group': false,
        ElContainer: { template: '<div><slot /></div>' },
        ElHeader: { template: '<div><slot /></div>' },
        ElMain: { template: '<main><slot /></main>' },
        ElAside: { template: '<aside><slot /></aside>' },
        ElFooter: { template: '<div><slot /></div>' },
        ElDrawer: true,
        ElAlert: true
      }
    }
  })
  await flushPromises()
  return { router, errors, view: wrapper }
}

afterEach(() => {
  try { wrapper?.unmount() } finally {
    wrapper = undefined
    host?.remove()
    host = undefined
    document.querySelectorAll('[data-mobile-download]').forEach((element) => element.remove())
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth })
  }
})

describe('应用热榜路由导航', () => {
  it.each([
    { width: 375, hasFiles: false },
    { width: 375, hasFiles: true },
    { width: 820, hasFiles: true },
    { width: 1440, hasFiles: true }
  ])('$width px 文件状态 $hasFiles 离开图片页后热榜正常显示，返回时不残留下载栏', async ({ width, hasFiles }) => {
    const { router, errors, view } = await mountApplication(width)
    if (hasFiles) {
      await view.get('[data-route-page="image"] button').trigger('click')
      expect(document.querySelector('[data-mobile-download]')).not.toBeNull()
    }
    await router.push('/tools/hot-ranking')
    await flushPromises()
    expect(view.get('main').text()).toContain('工具排行榜')
    expect(document.querySelector('[data-mobile-download]')).toBeNull()
    await router.push('/tools/image-compress')
    await flushPromises()
    expect(view.get('main').text()).toContain('图片压缩')
    expect(document.querySelector('[data-mobile-download]')).toBeNull()
    expect(errors).toEqual([])
  })

  it('手机快速连续切换热榜、工具和同页查询参数时始终保留当前路由内容', async () => {
    const { router, errors, view } = await mountApplication(375)
    await view.get('[data-route-page="image"] button').trigger('click')
    for (const path of ['/tools/hot-ranking', '/tools/json', '/tools/hot-ranking', '/tools/image-compress', '/tools/image-compress?mode=retry']) {
      await router.push(path)
      await nextTick()
      expect(view.get('main').text()).not.toBe('')
    }
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/tools/image-compress?mode=retry')
    expect(view.find('[data-route-page="image"]').exists()).toBe(true)
    expect(document.querySelector('[data-mobile-download]')).toBeNull()
    expect(errors).toEqual([])
  })
})
