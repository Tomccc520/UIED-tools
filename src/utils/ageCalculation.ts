/**
 * @description 年龄计算器的日历年龄、满月数与星座计算。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */

const constellations = [
  { name: '摩羯座', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: '水瓶座', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: '双鱼座', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: '白羊座', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: '金牛座', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: '双子座', startMonth: 5, startDay: 21, endMonth: 6, endDay: 21 },
  { name: '巨蟹座', startMonth: 6, startDay: 22, endMonth: 7, endDay: 22 },
  { name: '狮子座', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: '处女座', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: '天秤座', startMonth: 9, startDay: 23, endMonth: 10, endDay: 23 },
  { name: '天蝎座', startMonth: 10, startDay: 24, endMonth: 11, endDay: 22 },
  { name: '射手座', startMonth: 11, startDay: 23, endMonth: 12, endDay: 21 },
]

/** 根据公历月日返回星座名称，沿用页面现有日期边界。 */
export const getConstellation = (month: number, day: number): string => {
  const date = month * 100 + day
  const match = constellations.find((item) => {
    const start = item.startMonth * 100 + item.startDay
    const end = item.endMonth * 100 + item.endDay
    return start > end ? date >= start || date <= end : date >= start && date <= end
  })
  return match ? match.name : ''
}

/** 根据出生日期和当前日期返回周岁、累计满月数及下次生日的日历天数。 */
export const calculateAgeCalendar = (birth: Date, now: Date) => {
  const yearDifference = now.getFullYear() - birth.getFullYear()
  let age = yearDifference
  const monthDifference = now.getMonth() - birth.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && now.getDate() < birth.getDate())) age--

  const totalMonths = yearDifference * 12 + monthDifference + (now.getDate() < birth.getDate() ? -1 : 0)
  // 仅比较本地日历日期；使用 UTC 日序计算天数，避免当天时刻与夏令时改变结果。
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  let nextBirthday = Date.UTC(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (nextBirthday < today) nextBirthday = Date.UTC(now.getFullYear() + 1, birth.getMonth(), birth.getDate())
  const nextBirthdayDays = (nextBirthday - today) / 86_400_000
  return { age, totalMonths, nextBirthdayDays }
}
