import { describe, expect, it } from 'vitest'
import { getHolidayCountdown } from './holidayCountdown'

describe('北京时间节假日倒数', () => {
  it('北京时间跨年时从距元旦一天切换到假期中', () => {
    const before = getHolidayCountdown(new Date('2026-12-31T15:59:59Z'))
    const after = getHolidayCountdown(new Date('2026-12-31T16:00:00Z'))
    expect(before.today).toBe('2026-12-31')
    expect(before.holidays[0]).toMatchObject({ name: '元旦', days: 1 })
    expect(after.today).toBe('2027-01-01')
    expect(after.holidays[0]).toMatchObject({ name: '元旦', days: 0 })
  })

  it('跳过国务院公布的周六补班日', () => {
    const result = getHolidayCountdown(new Date('2027-05-07T13:00:00+08:00'))
    expect(result.weekendDays).toBe(2)
  })

  it('假期最后一天仍在假期中，次日只保留后续节假日', () => {
    const last = getHolidayCountdown(new Date('2027-02-13T13:00:00+08:00'))
    const next = getHolidayCountdown(new Date('2027-02-14T13:00:00+08:00'))
    expect(last.holidays[0]).toMatchObject({ name: '春节', days: 0 })
    expect(next.holidays[0]?.name).toBe('清明节')
  })

  it('未公布放假安排时仍能计算周末', () => {
    const result = getHolidayCountdown(new Date('2028-01-01T13:00:00+08:00'))
    expect(result.weekendDays).toBe(0)
    expect(result.holidays).toEqual([])
  })
})
