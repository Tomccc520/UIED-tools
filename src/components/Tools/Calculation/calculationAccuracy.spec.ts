/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Temperature from '../Unit/Temperature.vue'
import Mortgage from './Mortgage.vue'
import MortgageRate from './MortgageRate.vue'
import { calculateMortgage } from '@/utils/mortgage'

const message = vi.hoisted(() => ({ error: vi.fn() }))
vi.mock('element-plus', () => ({ ElMessage: message }))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/tools/calculation/mortgage' }) }))
vi.mock('@/components/Common/ToolsRecommend.vue', () => ({ default: { template: '<div />' } }))

const stubs = {
  ElInput: {
    props: ['modelValue'], emits: ['update:modelValue'],
    template: '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><slot name="append" /></div>'
  },
  ElInputNumber: {
    props: ['modelValue'], emits: ['update:modelValue'],
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value === \'\' ? null : Number($event.target.value))" />'
  },
  ElButton: { template: '<button><slot /></button>' },
  ElDivider: { template: '<div><slot /></div>' },
  ElText: { template: '<span><slot /></span>' },
  ElRadioGroup: { props: ['modelValue'], emits: ['update:modelValue'], template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>' },
  ElRadio: { props: ['label'], template: '<option :value="label"><slot /></option>' }
}
const views: VueWrapper[] = []
afterEach(() => {
  for (const view of views.splice(0)) view.unmount()
  message.error.mockClear()
})

/** 挂载待测计算页面，保留真实输入、按钮和选择事件。 */
function mountTool(component: typeof Temperature | typeof Mortgage | typeof MortgageRate) {
  const view = mount(component, { global: { stubs } })
  views.push(view)
  return view
}

/** 读取房贷结果区的金额，供数值和有限值断言使用。 */
function mortgageAmounts(view: VueWrapper) {
  return view.findAll('.bg-gray-50 span.font-bold').map((span) => Number(span.text().replace(/\s*元$/, '')))
}

describe('温度带偏移量换算', () => {
  it.each([
    [1, '32', 0], [1, '212', 100], [2, '273.15', 0],
    [2, '0', -273.15], [1, '-40', -40], [4, '491.67', 0],
    [4, '0', -273.15]
  ])('输入位置 %s 的 %s 应转换为 %s 摄氏度', async (index, input, expected) => {
    const view = mountTool(Temperature)
    await view.findAll('input')[index].setValue(input)
    await view.findAll('button')[index].trigger('click')
    expect(Number(view.findAll('input')[0].element.value)).toBeCloseTo(expected, 9)
  })

  it('五种单位转换往返后保持温度一致', async () => {
    const view = mountTool(Temperature)
    await view.findAll('input')[0].setValue('37.5')
    await view.findAll('button')[0].trigger('click')
    for (let index = 1; index <= 4; index++) {
      await view.findAll('button')[index].trigger('click')
      expect(Number(view.findAll('input')[0].element.value)).toBeCloseTo(37.5, 9)
    }
  })

  it.each(['', '32abc', 'Infinity'])('无效输入 %j 不写入 NaN 或部分解析结果', async (input) => {
    const view = mountTool(Temperature)
    await view.findAll('input')[1].setValue(input)
    await view.findAll('button')[1].trigger('click')
    expect(view.findAll('input')[0].element.value).toBe('')
    expect(message.error).toHaveBeenCalled()
  })
})

describe('零利率与房贷输入边界', () => {
  it('清空房贷金额时不把 null 当作零本金计算', async () => {
    const view = mountTool(Mortgage)
    const before = mortgageAmounts(view).filter((_, index) => index !== 1)
    await view.findAll('input')[0].setValue('')
    await view.get('button').trigger('click')
    expect(mortgageAmounts(view).filter((_, index) => index !== 1)).toEqual(before)
    expect(message.error).toHaveBeenCalledWith(expect.stringContaining('贷款金额'))
  })

  it.each(['principalInterest', 'principal'])('%s 在 120 万元、10 年、零利率时本金均摊', async (type) => {
    const view = mountTool(Mortgage)
    await view.get('select').setValue(type)
    const inputs = view.findAll('input')
    await inputs[0].setValue('120')
    await inputs[1].setValue('10')
    await inputs[2].setValue('0')
    await view.get('button').trigger('click')
    expect(mortgageAmounts(view)).toEqual([10000, 1200000, 0, 1200000])
    if (type === 'principal') expect(view.text()).toContain('每月递减: 0.00 元')
  })

  it.each(['', '0', '-1', 'Infinity'])('期限 %j 非法时保留原结果并提示', async (years) => {
    const view = mountTool(Mortgage)
    const before = mortgageAmounts(view)
    await view.findAll('input')[1].setValue(years)
    await view.get('button').trigger('click')
    expect(mortgageAmounts(view).filter((_, index) => index !== 1)).toEqual(before.filter((_, index) => index !== 1))
    expect(message.error).toHaveBeenCalled()
  })

  it.each([[0, 0], [0, 3], [3, 0]])('原利率 %s、新利率 %s 的对比结果有效', async (oldRate, newRate) => {
    const view = mountTool(MortgageRate)
    const inputs = view.findAll('input')
    await inputs[0].setValue('120')
    await inputs[1].setValue('10')
    await inputs[2].setValue(String(oldRate))
    await inputs[3].setValue(String(newRate))
    await view.get('button').trigger('click')
    const [oldMonthly, newMonthly, monthlySave, totalSave] = mortgageAmounts(view)
    expect([oldMonthly, newMonthly, monthlySave, totalSave].every(Number.isFinite)).toBe(true)
    if (oldRate === 0) expect(oldMonthly).toBe(10000)
    if (newRate === 0) expect(newMonthly).toBe(10000)
    if (oldRate === newRate) expect([monthlySave, totalSave]).toEqual([0, 0])
    else expect(Math.sign(monthlySave)).toBe(Math.sign(oldRate - newRate))
  })

  it.each([[0, ''], [1, '0'], [2, '-1'], [3, 'Infinity']])('利率对比输入 %s 非法时不覆盖结果', async (index, input) => {
    const view = mountTool(MortgageRate)
    const before = mortgageAmounts(view)
    await view.findAll('input')[index].setValue(input)
    await view.get('button').trigger('click')
    expect(mortgageAmounts(view)).toEqual(before)
    expect(message.error).toHaveBeenCalled()
  })

  it('非零利率的月供能逐月还清本金，且还款总额与利息一致', () => {
    const result = calculateMortgage(1200000, 120, 3)
    let outstanding = 1200000
    for (let month = 0; month < 120; month++) outstanding = outstanding * (1 + 0.03 / 12) - result.monthlyPayment
    expect(outstanding).toBeCloseTo(0, 5)
    expect(result.totalRepayment - result.totalInterest).toBeCloseTo(1200000, 8)
  })

  it('极低非零利率不因相减消去产生无限值，零本金仍返回零', () => {
    expect(calculateMortgage(1200000, 120, 1e-12).monthlyPayment).toBeCloseTo(10000, 6)
    expect(calculateMortgage(0, 120, 3)).toEqual({ monthlyPayment: 0, monthlyDecrease: 0, totalInterest: 0, totalRepayment: 0 })
  })

  it.each([0, -1, 1.5, Infinity, NaN])('期数 %s 必须是有限正整数', (months) => {
    expect(() => calculateMortgage(1200000, months, 3)).toThrow(/期数必须为正整数/)
  })
})
