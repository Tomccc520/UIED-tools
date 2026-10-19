/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import SqlFormat from './SqlFormat.vue'

vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/dev/sql-format' }) }))
vi.mock('element-plus', () => ({ ElMessage: { success: vi.fn(), error: vi.fn() } }))

let wrapper: VueWrapper | undefined
afterEach(() => wrapper?.unmount())

/** 挂载实际 SQL 页面表单，验证用户点击操作后的输出和错误状态。 */
function mountTool() {
  wrapper = mount(SqlFormat, { global: { stubs: { ToolsRecommend: true } } })
  return wrapper
}

describe('SQL 页面结果与错误保护', () => {
  it.each(['格式化 SQL', '压缩 SQL'])('%s 失败时保留输入和上次成功结果', async (buttonName) => {
    const view = mountTool()
    const button = view.findAll('button').find((item) => item.text() === buttonName)!
    await view.get('#sql-input').setValue("SELECT 'a--b' AS value;")
    await button.trigger('click')
    const success = view.get<HTMLTextAreaElement>('#sql-output').element.value
    expect(success).toContain("'a--b'")
    const invalid = "SELECT 'unterminated"
    await view.get('#sql-input').setValue(invalid)
    await button.trigger('click')
    expect(view.get<HTMLTextAreaElement>('#sql-input').element.value).toBe(invalid)
    expect(view.get<HTMLTextAreaElement>('#sql-output').element.value).toBe(success)
    expect(view.get('[role="alert"]').text()).toContain('引号未闭合')
    await view.get('#sql-input').setValue("SELECT 'a  b' AS value;")
    await button.trigger('click')
    expect(view.find('[role="alert"]').exists()).toBe(false)
    expect(view.get<HTMLTextAreaElement>('#sql-output').element.value).toContain("'a  b'")
  })

  it('空输入显示明确反馈，保留已有输出', async () => {
    const view = mountTool()
    const button = view.findAll('button').find((item) => item.text() === '压缩 SQL')!
    await view.get('#sql-input').setValue('SELECT 1;')
    await button.trigger('click')
    await view.get('#sql-input').setValue('   ')
    await button.trigger('click')
    expect(view.get('[role="alert"]').text()).toBe('请先输入 SQL。')
    expect(view.get<HTMLTextAreaElement>('#sql-output').element.value).toBe('SELECT 1;')
  })

  it.each([
    '/* sql-formatter-disable */ SELECT $$a  b$$;',
    "SELECT q'[a '   b ' c]' FROM dual;",
    "SELECT '''a '   b ' c''';"
  ])('拒绝有方言歧义的输入并保留上次结果 %j', async (source) => {
    const view = mountTool()
    const buttons = view.findAll('button').filter((item) => ['格式化 SQL', '压缩 SQL'].includes(item.text()))
    await view.get('#sql-input').setValue('SELECT 1;')
    await buttons[1].trigger('click')
    for (const button of buttons) {
      await view.get('#sql-input').setValue(source)
      await button.trigger('click')
      expect(view.get<HTMLTextAreaElement>('#sql-input').element.value).toBe(source)
      expect(view.get<HTMLTextAreaElement>('#sql-output').element.value).toBe('SELECT 1;')
      expect(view.get('[role="alert"]').text()).toContain('SQL')
    }
  })
})
