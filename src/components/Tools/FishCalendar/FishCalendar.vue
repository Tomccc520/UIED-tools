<template>
  <div class="min-h-screen bg-gray-50 py-6">
    <div class="max-w-4xl mx-auto px-4 sm:px-6">
      <!-- 标题区，参考ImageToPdf.vue风格 -->
      <div class="text-center mb-8">
        <h2 class="text-4xl font-bold mb-2 text-gray-900">摸鱼日历</h2>
        <p class="text-base text-gray-500">Fish Calendar Reminder</p>
      </div>
      <!-- 摸鱼卡片区块（可导出图片） -->
      <div ref="cardRef"
        class="fish-card-moyu bg-white rounded-2xl border-2 border-gray-900 shadow-lg mx-auto p-0 max-w-2xl relative overflow-hidden">
        <!-- 顶部哲学语录和公众号 -->
        <div class="flex justify-between items-center px-6 py-2 border-b-2 border-gray-900 bg-gray-50">
          <span class="text-base font-medium text-gray-700 flex items-center">
            <span class="mr-2">😅</span> 摸鱼哲学：「摸鱼不是放纵，是实力的积蓄」
          </span>
          <span class="text-sm text-gray-500">公众号：Tomda</span>
        </div>
        <!-- 日期/标题/周末角标 -->
        <div class="flex items-center px-6 py-4 border-b-2 border-gray-900 relative">
          <div class="flex flex-col items-center mr-6">
            <span class="text-3xl font-bold text-gray-900">{{ month }}</span>
            <span class="text-lg font-bold text-gray-900">/</span>
            <span class="text-4xl font-bold text-gray-900">{{ day }}</span>
          </div>
          <div class="flex-1">
            <div class="text-2xl font-bold text-gray-900 mb-1">摸鱼日历 提醒您</div>
            <div class="text-gray-700 text-base flex items-center">
              <span class="inline-block bg-gray-200 rounded px-2 py-0.5 mr-2 text-sm">周{{ weekZh }}</span>
              <span class="font-mono">{{ weekSlogan }}</span>
            </div>
          </div>
          <!-- 距离周末角标 -->
          <div
            class="absolute right-6 top-1/2 -translate-y-1/2 bg-white border-2 border-gray-900 rounded-full px-4 py-2 flex flex-col items-center shadow">
            <span class="text-xs text-gray-500">距周末</span>
            <span class="text-2xl font-bold text-blue-600">{{ calendarData?.daysToWeekend }}<span
                class="text-base">天</span></span>
          </div>
        </div>
        <!-- 工资倒计时区块 -->
        <div class="px-6 py-4 border-b-2 border-gray-900">
          <div class="grid grid-cols-2 gap-2">
            <div v-for="item in calendarData?.salaryCountdowns" :key="item.name"
              class="flex justify-between items-center text-gray-800">
              <span>距离【{{ item.name }}发工资】</span>
              <span class="font-bold">{{ item.days }}天</span>
            </div>
          </div>
        </div>
        <!-- 历史上的今天/摸鱼语录区块 -->
        <div class="px-6 py-4 border-b-2 border-gray-900 flex items-center">
          <div class="bg-gray-900 text-white rounded-lg px-3 py-2 text-sm font-bold mr-4">历史上的今天</div>
          <div class="text-gray-800 text-base">{{ calendarData?.quote }}</div>
        </div>
        <!-- 节日倒计时区块 -->
        <div class="px-6 py-4 flex flex-wrap gap-2">
          <div v-for="item in displayedHolidays" :key="item.name"
            class="border-2 border-gray-900 rounded-lg px-4 py-2 text-gray-900 font-bold bg-white flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>距离「{{ item.name }}」{{ item.days }}天</span>
          </div>
        </div>
        <!-- 今日小贴士区块 -->
        <div class="px-6 py-4 border-t-2 border-gray-100 bg-gray-50 text-center text-gray-500 text-sm">
          <span class="inline-flex items-center">
            <svg class="w-4 h-4 mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ tips }}
          </span>
        </div>
      </div>

      <!-- 复制按钮区域 -->
      <div class="mt-6 mb-10 flex justify-center">
        <button @click="copyCardImage" :disabled="copying"
          class="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2.5 transition-colors duration-300 min-w-40 font-medium"
          :class="{ 'opacity-70 cursor-not-allowed': copying }">
          <!-- 复制图标 -->
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {{ copying ? '复制中...' : '复制卡片为图片' }}
        </button>
      </div>

      <!-- 日历使用说明 -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          摸鱼日历小贴士
        </h3>
        <div class="text-gray-600 space-y-3 text-sm">
          <p>✅ <span class="font-medium">每日更新：</span>摸鱼日历会显示当天的节日、倒计时和摸鱼语录，每天都有新内容</p>
          <p>✅ <span class="font-medium">复制图片：</span>点击"复制卡片为图片"按钮可将日历复制为图片，方便分享到社交媒体</p>
          <p>✅ <span class="font-medium">摸鱼乐趣：</span>包含多种摸鱼数据，让您在工作之余也能享受小确幸</p>
          <p>✅ <span class="font-medium">节日提醒：</span>显示即将到来的12个节日倒计时，不错过任何重要日子</p>
        </div>
      </div>

      <!-- 工具推荐 -->
      <aside>
        <ToolsRecommend :currentPath="route.path" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'
import { holidays } from '@/components/Tools/FishCalendar/data/holidays'
import { quotes } from '@/components/Tools/FishCalendar/data/quotes'
import html2canvas from 'html2canvas'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 获取当前路由
const route = useRoute()

// 为quotes添加索引签名，避免类型报错
interface Quotes {
  [key: string]: string
}
const quotesMap: Quotes = quotes

// 状态变量
const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const calendarData = ref<any>(null)
const loading = ref(false)
const errorMsg = ref('')
const copying = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const tipsList = [
  '摸鱼虽好，可不要被老板发现哦~',
  '多喝水，少加班，摸鱼也要注意身体！',
  '摸鱼一时爽，一直摸鱼一直爽。',
  '摸鱼不是放纵，是实力的积蓄。',
  '摸鱼时别忘了偶尔看看工作群。',
  '摸鱼有风险，摸前需谨慎。',
  '摸鱼使人快乐，摸鱼使人进步。',
  '摸鱼要有度，摸完记得补觉。',
  '摸鱼时光，珍惜当下。',
  '摸鱼不误正事，效率更高哦！',
]
const tips = ref('')

// 展示用日期
const year = computed(() => dayjs(selectedDate.value).format('YYYY'))
const month = computed(() => dayjs(selectedDate.value).format('MM'))
const day = computed(() => dayjs(selectedDate.value).format('DD'))
const weekZh = computed(() => {
  const weekMap = ['日', '一', '二', '三', '四', '五', '六']
  return weekMap[dayjs(selectedDate.value).day()]
})
const weekSlogan = computed(() => {
  const arr = [
    '周日躺平修整日',
    '周一假装很忙',
    '周二摸鱼进行时',
    '周三已经过半啦',
    '周四星期五前夜',
    '周五开心放空日',
    '周六快乐不上班'
  ]
  return arr[dayjs(selectedDate.value).day()]
})

// 禁用未来日期
const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

// 计算距离下一个周末（周六）
function getDaysToWeekend(dateStr: string) {
  const date = dayjs(dateStr)
  const day = date.day()
  let days = 6 - day
  if (days < 0) days += 7
  return days === 0 ? 7 : days
}

// 计算距离所有节日（按距离排序，包含常见纪念日）
function getAllHolidayCountdowns(dateStr: string) {
  const date = dayjs(dateStr)
  // 计算距离
  const arr = holidays.map(h => ({
    name: h.name,
    days: dayjs(h.date).diff(date, 'day'),
    date: h.date
  })).filter(h => h.days >= 0)
  // 按距离排序
  arr.sort((a, b) => a.days - b.days)
  return arr
}

// 计算距离发工资（10/15/20/25/月底）
function getSalaryCountdowns(dateStr: string) {
  const date = dayjs(dateStr)
  const year = date.year()
  const month = date.month() + 1
  const salaryDays = [10, 15, 20, 25, dayjs(date).daysInMonth()]
  const result = []
  for (const d of salaryDays) {
    let salaryDate = dayjs(`${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`)
    if (salaryDate.isBefore(date, 'day')) {
      let nextMonth = month + 1
      let nextYear = year
      if (nextMonth > 12) {
        nextMonth = 1
        nextYear += 1
      }
      salaryDate = dayjs(`${nextYear}-${nextMonth.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`)
    }
    result.push({
      name: d === dayjs(date).daysInMonth() ? '月底' : d + '号',
      days: salaryDate.diff(date, 'day'),
      description: `${salaryDate.format('YYYY年M月D日')}`
    })
  }
  return result
}

// 获取历史上的今天/摸鱼语录
function getQuote(dateStr: string) {
  const d = dayjs(dateStr)
  const key = d.format('MM-DD')
  return quotesMap[key] || '摸鱼使人快乐，今天也要加油摸鱼！'
}

// 显示更多节日（最多12个）
const displayedHolidays = computed(() => {
  if (!calendarData.value?.holidayCountdowns) return []
  return calendarData.value.holidayCountdowns.slice(0, 12)
})

// 获取日历数据（本地实现）
const fetchCalendarData = async () => {
  if (!selectedDate.value) return
  loading.value = true
  errorMsg.value = ''
  calendarData.value = null
  try {
    const date = selectedDate.value
    const daysToWeekend = getDaysToWeekend(date)
    const salaryCountdowns = getSalaryCountdowns(date)
    const holidayCountdowns = getAllHolidayCountdowns(date)
    const quote = getQuote(date)
    calendarData.value = {
      date,
      daysToWeekend,
      salaryCountdowns,
      holidayCountdowns,
      quote
    }
  } catch (error: any) {
    console.error('获取日历失败:', error)
    errorMsg.value = error.message || '获取日历失败，请稍后重试'
    ElMessage.error(errorMsg.value)
  } finally {
    loading.value = false
  }
}

// 复制卡片为图片
const copyCardImage = async () => {
  if (!cardRef.value) return
  copying.value = true
  try {
    // 确保白色背景
    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#ffffff',
      useCORS: true,
      scale: 2, // 提高分辨率
      logging: false,
      onclone: (clonedDoc) => {
        // 修复克隆元素的文字对齐问题
        const clonedCard = clonedDoc.querySelector('.fish-card-moyu') as HTMLElement
        if (clonedCard) {
          const textElements = clonedCard.querySelectorAll('.text-gray-800')
          textElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.textAlign = 'justify'
              el.style.lineHeight = '1.5'
            }
          })
        }
        return clonedDoc
      }
    })

    canvas.toBlob(async (blob) => {
      if (!blob) return
      try {
        await navigator.clipboard.write([
          new window.ClipboardItem({ 'image/png': blob })
        ])
        ElMessage.success('卡片图片已复制到剪贴板！')
      } catch {
        // 兼容不支持clipboard的浏览器，自动下载
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = '摸鱼日历.png'
        a.click()
        URL.revokeObjectURL(url)
        ElMessage.success('已自动下载卡片图片')
      }
    }, 'image/png')
  } catch (e) {
    ElMessage.error('复制图片失败，请重试')
  } finally {
    copying.value = false
  }
}

onMounted(() => {
  fetchCalendarData()
  // 随机选一条小贴士
  tips.value = tipsList[Math.floor(Math.random() * tipsList.length)]
})
</script>

<style lang="scss" scoped>
.fish-card-moyu {
  min-width: 340px;
  min-height: 600px;
  margin-bottom: 0;
  margin-top: 0;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #ffffff !important;
  /* 强制背景为白色 */
}

/* 文字对齐和间距 */
.text-gray-800 {
  text-align: justify;
  line-height: 1.5;
}
</style>
