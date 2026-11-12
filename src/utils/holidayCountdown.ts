/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */

const DAY_MS = 24 * 60 * 60 * 1000
const chinaDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
})

export const holidayScheduleSources = [
  { year: 2026, url: 'https://www.gov.cn/zhengce/zhengceku/202511/content_7047091.htm' },
  { year: 2027, url: 'https://www.gov.cn/zhengce/content/202611/content_7085101.htm' }
]

// 国办发明电〔2025〕7号、〔2026〕10号。起止日期均包含当天。
const holidays = [
  { name: '元旦', start: '2026-01-01', end: '2026-01-03' },
  { name: '春节', start: '2026-02-15', end: '2026-02-23' },
  { name: '清明节', start: '2026-04-04', end: '2026-04-06' },
  { name: '劳动节', start: '2026-05-01', end: '2026-05-05' },
  { name: '端午节', start: '2026-06-19', end: '2026-06-21' },
  { name: '中秋节', start: '2026-09-25', end: '2026-09-27' },
  { name: '国庆节', start: '2026-10-01', end: '2026-10-07' },
  { name: '元旦', start: '2027-01-01', end: '2027-01-03' },
  { name: '春节', start: '2027-02-05', end: '2027-02-13' },
  { name: '清明节', start: '2027-04-03', end: '2027-04-05' },
  { name: '劳动节', start: '2027-05-01', end: '2027-05-05' },
  { name: '端午节', start: '2027-06-09', end: '2027-06-09' },
  { name: '中秋节', start: '2027-09-15', end: '2027-09-15' },
  { name: '国庆节', start: '2027-10-01', end: '2027-10-07' }
]

const adjustedWorkdays = new Set([
  '2026-01-04', '2026-02-14', '2026-02-28', '2026-05-09', '2026-09-20', '2026-10-10',
  '2027-01-31', '2027-02-14', '2027-05-08', '2027-09-26', '2027-10-09'
])

/** 将传入时刻换算为北京时间的日历日，返回周末和已公布假期的倒数天数。 */
export const getHolidayCountdown = (now: Date) => {
  const today = chinaDateFormatter.format(now)
  const todayMs = Date.parse(today)
  let weekendMs = todayMs
  while (true) {
    const date = new Date(weekendMs)
    const day = date.getUTCDay()
    if ((day === 6 || day === 0) && !adjustedWorkdays.has(date.toISOString().slice(0, 10))) break
    weekendMs += DAY_MS
  }

  return {
    today,
    weekendDays: (weekendMs - todayMs) / DAY_MS,
    holidays: holidays.filter(holiday => holiday.end >= today).map(holiday => ({
      ...holiday,
      days: Math.max(0, (Date.parse(holiday.start) - todayMs) / DAY_MS)
    }))
  }
}
