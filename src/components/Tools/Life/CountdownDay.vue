<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 -->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/copy'
import { getHolidayCountdown, holidayScheduleSources } from '@/utils/holidayCountdown'

const route = useRoute()
const now = ref(new Date())
const countdown = computed(() => getHolidayCountdown(now.value))
const nextHoliday = computed(() => countdown.value.holidays[0])
const weekendLabel = computed(() => countdown.value.weekendDays === 0
  ? '今天是周末'
  : '还有 ' + countdown.value.weekendDays + ' 天到周末')
let clock: number | undefined

/** 按当前北京时间复制周末和下一次假期信息。 */
const copyCountdown = async () => {
  now.value = new Date()
  const next = nextHoliday.value
  const summary = [
    countdown.value.today + '（北京时间）',
    weekendLabel.value,
    next ? (next.days === 0 ? next.name + '假期中' : '还有 ' + next.days + ' 天到' + next.name) : '后续放假安排待公布'
  ].join('\n')
  if (await copy(summary)) ElMessage.success('已复制倒数日')
  else ElMessage.error('复制失败，请手动复制')
}

/** 定时同步本机时钟，让跨零点打开的页面刷新倒数。 */
onMounted(() => {
  clock = window.setInterval(() => { now.value = new Date() }, 30_000)
})

/** 离开工具页后释放日期计时器。 */
onUnmounted(() => window.clearInterval(clock))
</script>

<template>
  <StandardToolPageTemplate compact title="摸鱼倒数日" description="查看周末和已公布的节假日安排，按北京时间计算。">
    <div class="mx-auto max-w-2xl space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-soft p-4">
        <div>
          <p class="text-sm text-gray-600">
            北京时间 <time :datetime="countdown.today">{{ countdown.today }}</time>
          </p>
          <p class="mt-1 text-xl font-semibold text-brand">{{ weekendLabel }}</p>
        </div>
        <el-button :icon="CopyDocument" @click="copyCountdown">复制倒数日</el-button>
      </div>

      <section aria-labelledby="countdown-holidays">
        <h2 id="countdown-holidays" class="mb-2 text-base font-semibold">节假日倒数</h2>
        <ul v-if="nextHoliday" class="divide-y divide-gray-100">
          <li v-for="holiday in countdown.holidays" :key="holiday.start" class="flex items-center justify-between gap-3 py-3">
            <div>
              <p class="font-medium">{{ holiday.name }}</p>
              <p class="text-sm text-gray-600">
                <time :datetime="holiday.start">{{ holiday.start }}</time>
                <template v-if="holiday.end !== holiday.start">
                  至 <time :datetime="holiday.end">{{ holiday.end }}</time>
                </template>
              </p>
            </div>
            <span class="shrink-0 text-sm font-medium text-brand">
              {{ holiday.days === 0 ? '假期中' : holiday.days + ' 天' }}
            </span>
          </li>
        </ul>
        <p v-else class="py-3 text-sm text-gray-600">后续放假安排待公布。</p>
      </section>

      <p class="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
        <span>已公布的补班日会从周末倒数中跳过。</span>
        <a v-for="source in holidayScheduleSources" :key="source.year" :href="source.url"
          target="_blank" rel="noopener noreferrer" class="text-brand underline underline-offset-2">
          {{ source.year }} 年官方安排
        </a>
      </p>
    </div>
  </StandardToolPageTemplate>
  <ToolsRecommend :current-path="route.path" />
</template>
