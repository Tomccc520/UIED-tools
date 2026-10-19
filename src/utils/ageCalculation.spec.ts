/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import { describe, expect, it } from 'vitest'
import { calculateAgeCalendar, getConstellation } from './ageCalculation'

/** 按本地日历构造日期，避免 ISO 纯日期字符串的 UTC 解析影响测试。 */
const localDate = (year: number, month: number, day: number, hour = 0) => new Date(year, month - 1, day, hour)

describe('年龄计算器日历边界', () => {
  const now = localDate(2026, 10, 19, 12)

  it.each([
    [2020, 12, 15, 5, 70],
    [2026, 9, 20, 0, 0],
    [2025, 10, 20, 0, 11],
    [2020, 10, 19, 6, 72],
    [2020, 10, 20, 5, 71],
    [2020, 10, 18, 6, 72],
    [2026, 10, 19, 0, 0],
  ])('%i/%i/%i 的周岁为 %i、累计满月为 %i', (year, month, day, age, totalMonths) => {
    expect(calculateAgeCalendar(localDate(year, month, day), now)).toMatchObject({ age, totalMonths })
  })

  it('生日当天全天均显示距离生日 0 天', () => {
    for (const hour of [0, 12, 23]) {
      expect(calculateAgeCalendar(localDate(2020, 10, 19), localDate(2026, 10, 19, hour)).nextBirthdayDays).toBe(0)
    }
  })

  it('同一日历日期的出生时刻和当前时刻不影响计算', () => {
    const expected = { age: 6, totalMonths: 72, nextBirthdayDays: 0 }
    for (const birthHour of [0, 12, 23]) {
      for (const currentHour of [0, 12, 23]) {
        expect(calculateAgeCalendar(localDate(2020, 10, 19, birthHour), localDate(2026, 10, 19, currentHour))).toEqual(expected)
      }
    }
  })

  it('跨年与生日次日的剩余天数按日历计算', () => {
    expect(calculateAgeCalendar(localDate(2000, 1, 1), localDate(2026, 12, 31, 23)).nextBirthdayDays).toBe(1)
    expect(calculateAgeCalendar(localDate(2000, 10, 18), now).nextBirthdayDays).toBe(364)
  })

  it('月末未达到出生日期时不计一个完整月', () => {
    expect(calculateAgeCalendar(localDate(2026, 1, 31), localDate(2026, 2, 28)).totalMonths).toBe(0)
    expect(calculateAgeCalendar(localDate(2026, 1, 31), localDate(2026, 3, 31)).totalMonths).toBe(2)
  })

  it('2 月 29 日生日在平年的 3 月 1 日满周岁', () => {
    expect(calculateAgeCalendar(localDate(2024, 2, 29), localDate(2025, 2, 28, 12))).toMatchObject({ age: 0, totalMonths: 11, nextBirthdayDays: 1 })
    expect(calculateAgeCalendar(localDate(2024, 2, 29), localDate(2025, 3, 1, 12))).toMatchObject({ age: 1, totalMonths: 12, nextBirthdayDays: 0 })
  })
})

describe('星座日期边界', () => {
  it.each<[number, number, string]>([
    [1, 19, '摩羯座'], [1, 20, '水瓶座'], [1, 25, '水瓶座'], [1, 31, '水瓶座'],
    [2, 18, '水瓶座'], [2, 19, '双鱼座'], [12, 21, '射手座'], [12, 22, '摩羯座'],
    [12, 31, '摩羯座'], [1, 1, '摩羯座'],
  ])('%i 月 %i 日为 %s', (month, day, expected) => {
    expect(getConstellation(month, day)).toBe(expected)
  })
})
