/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import MobileToolActions from './MobileToolActions.vue'

let view: VueWrapper | undefined
let mobile = true

beforeEach(() => {
  mobile = true
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: mobile, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })))
})
afterEach(() => { view?.unmount(); view = undefined; vi.unstubAllGlobals() })

/** 挂载真实手机操作栏并等待媒体查询，保留原生按钮与 Teleport 行为。 */
async function mountActions() {
  view = mount(MobileToolActions, { props: { title: '已选择文件', actionLabel: '开始处理' } })
  await flushPromises()
  return view
}

describe('手机工具共用操作栏', () => {
  it('只在手机挂到 body，点击主操作仅发出一次事件，隐藏和卸载会清理', async () => {
    await mountActions()
    const dock = document.body.querySelector('.mobile-tool-actions')!
    expect(dock.parentElement).toBe(document.body)
    dock.querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!.click()
    expect(view!.emitted('action')).toHaveLength(1)
    await view!.setProps({ hidden: true })
    expect(document.body.querySelector('.mobile-tool-actions')).toBeNull()
    await view!.setProps({ hidden: false })
    view!.unmount()
    view = undefined
    expect(document.body.querySelector('.mobile-tool-actions')).toBeNull()
  })

  it('处理中主操作禁用，取消仍可点击；恢复后按当前状态继续操作', async () => {
    await mountActions()
    await view!.setProps({ busy: true, cancelLabel: '取消', actionLabel: '处理中…' })
    const main = document.body.querySelector<HTMLButtonElement>('.mobile-tool-actions__primary')!
    expect(main.disabled).toBe(true)
    main.click()
    expect(view!.emitted('action')).toBeUndefined()
    document.body.querySelector<HTMLButtonElement>('.mobile-tool-actions__cancel')!.click()
    expect(view!.emitted('cancel')).toHaveLength(1)
    await view!.setProps({ busy: false, actionLabel: '下载文件' })
    expect(main.disabled).toBe(false)
    expect(main.textContent).toBe('下载文件')
    expect(document.body.querySelector('.mobile-tool-actions__cancel')).toBeNull()
  })

  it('桌面不生成第二套操作入口', async () => {
    mobile = false
    await mountActions()
    expect(document.body.querySelector('.mobile-tool-actions')).toBeNull()
  })
})
