<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">Cron表达式生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">可视化生成和解析 Cron 表达式，定时任务配置好帮手。</p>
        </div>

        <!-- 结果展示区 -->
        <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex-1 w-full">
              <label class="block text-sm font-medium text-gray-500 mb-2">Cron 表达式</label>
              <div class="flex gap-2">
                <input type="text" v-model="cronExpression" readonly
                       class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-lg text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button @click="copyCron" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                  复制
                </button>
              </div>
            </div>
          </div>
          <div class="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span>最近运行时间预览：</span>
            <span class="font-mono">{{ nextRuns.join(', ') }}</span>
          </div>
        </div>

        <!-- 配置选项卡 -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div class="flex border-b overflow-x-auto">
            <button v-for="tab in tabs" :key="tab.key"
                    @click="currentTab = tab.key"
                    class="px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
                    :class="currentTab === tab.key ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'">
              {{ tab.name }}
            </button>
          </div>

          <div class="p-6">
            <!-- 秒 -->
            <div v-if="currentTab === 'second'" class="space-y-4">
              <RadioGroup v-model="second.type" :options="typeOptions" />
              <div v-if="second.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="second.rangeStart" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" v-model="second.rangeEnd" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>秒</span>
              </div>
              <div v-if="second.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="second.loopStart" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>秒开始，每</span>
                <input type="number" v-model="second.loopStep" min="1" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>秒执行一次</span>
              </div>
              <div v-if="second.type === 'specific'" class="mt-2">
                <CheckboxGroup v-model="second.specific" :count="60" />
              </div>
            </div>

            <!-- 分 -->
            <div v-if="currentTab === 'minute'" class="space-y-4">
              <RadioGroup v-model="minute.type" :options="typeOptions" />
              <div v-if="minute.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="minute.rangeStart" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" v-model="minute.rangeEnd" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>分</span>
              </div>
              <div v-if="minute.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="minute.loopStart" min="0" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>分开始，每</span>
                <input type="number" v-model="minute.loopStep" min="1" max="59" class="w-20 px-2 py-1 border rounded" />
                <span>分执行一次</span>
              </div>
              <div v-if="minute.type === 'specific'" class="mt-2">
                <CheckboxGroup v-model="minute.specific" :count="60" />
              </div>
            </div>

            <!-- 时 -->
            <div v-if="currentTab === 'hour'" class="space-y-4">
              <RadioGroup v-model="hour.type" :options="typeOptions" />
              <div v-if="hour.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="hour.rangeStart" min="0" max="23" class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" v-model="hour.rangeEnd" min="0" max="23" class="w-20 px-2 py-1 border rounded" />
                <span>时</span>
              </div>
              <div v-if="hour.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="hour.loopStart" min="0" max="23" class="w-20 px-2 py-1 border rounded" />
                <span>时开始，每</span>
                <input type="number" v-model="hour.loopStep" min="1" max="23" class="w-20 px-2 py-1 border rounded" />
                <span>小时执行一次</span>
              </div>
              <div v-if="hour.type === 'specific'" class="mt-2">
                <CheckboxGroup v-model="hour.specific" :count="24" />
              </div>
            </div>

            <!-- 日 -->
            <div v-if="currentTab === 'day'" class="space-y-4">
              <RadioGroup v-model="day.type" :options="dayTypeOptions" />
              <div v-if="day.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="day.rangeStart" min="1" max="31" class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" v-model="day.rangeEnd" min="1" max="31" class="w-20 px-2 py-1 border rounded" />
                <span>日</span>
              </div>
              <div v-if="day.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="day.loopStart" min="1" max="31" class="w-20 px-2 py-1 border rounded" />
                <span>日开始，每</span>
                <input type="number" v-model="day.loopStep" min="1" max="31" class="w-20 px-2 py-1 border rounded" />
                <span>天执行一次</span>
              </div>
              <div v-if="day.type === 'specific'" class="mt-2">
                <CheckboxGroup v-model="day.specific" :count="31" :start="1" />
              </div>
            </div>

            <!-- 月 -->
            <div v-if="currentTab === 'month'" class="space-y-4">
              <RadioGroup v-model="month.type" :options="typeOptions" />
              <div v-if="month.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="month.rangeStart" min="1" max="12" class="w-20 px-2 py-1 border rounded" />
                <span>-</span>
                <input type="number" v-model="month.rangeEnd" min="1" max="12" class="w-20 px-2 py-1 border rounded" />
                <span>月</span>
              </div>
              <div v-if="month.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <input type="number" v-model="month.loopStart" min="1" max="12" class="w-20 px-2 py-1 border rounded" />
                <span>月开始，每</span>
                <input type="number" v-model="month.loopStep" min="1" max="12" class="w-20 px-2 py-1 border rounded" />
                <span>月执行一次</span>
              </div>
              <div v-if="month.type === 'specific'" class="mt-2">
                <CheckboxGroup v-model="month.specific" :count="12" :start="1" />
              </div>
            </div>

            <!-- 周 -->
            <div v-if="currentTab === 'week'" class="space-y-4">
              <RadioGroup v-model="week.type" :options="weekTypeOptions" />
              <div v-if="week.type === 'range'" class="flex items-center gap-2 mt-2">
                <span>从</span>
                <select v-model="week.rangeStart" class="px-2 py-1 border rounded">
                  <option v-for="(n, i) in weekNames" :key="i" :value="i + 1">{{ n }}</option>
                </select>
                <span>-</span>
                <select v-model="week.rangeEnd" class="px-2 py-1 border rounded">
                  <option v-for="(n, i) in weekNames" :key="i" :value="i + 1">{{ n }}</option>
                </select>
              </div>
              <div v-if="week.type === 'loop'" class="flex items-center gap-2 mt-2">
                <span>第</span>
                <input type="number" v-model="week.loopStart" min="1" max="4" class="w-20 px-2 py-1 border rounded" />
                <span>周的</span>
                <select v-model="week.loopStep" class="px-2 py-1 border rounded">
                  <option v-for="(n, i) in weekNames" :key="i" :value="i + 1">{{ n }}</option>
                </select>
              </div>
              <div v-if="week.type === 'last'" class="flex items-center gap-2 mt-2">
                <span>本月最后一个</span>
                <select v-model="week.last" class="px-2 py-1 border rounded">
                  <option v-for="(n, i) in weekNames" :key="i" :value="i + 1">{{ n }}</option>
                </select>
              </div>
              <div v-if="week.type === 'specific'" class="mt-2">
                <div class="grid grid-cols-7 gap-2">
                  <label v-for="(n, i) in weekNames" :key="i" class="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" :value="i + 1" v-model="week.specific" class="rounded text-blue-600 focus:ring-blue-500" />
                    <span>{{ n }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-09-22
 */
import { ref, computed, watch, h, defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 简单组件：单选组
const RadioGroup = defineComponent({
  props: ['modelValue', 'options'],
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('div', { class: 'space-y-2' }, props.options.map((opt: any) => 
      h('label', { class: 'flex items-center gap-2 cursor-pointer' }, [
        h('input', {
          type: 'radio',
          name: 'radio-group-' + Math.random(), // 简单处理
          checked: props.modelValue === opt.value,
          class: 'text-blue-600 focus:ring-blue-500',
          onChange: () => emit('update:modelValue', opt.value)
        }),
        h('span', opt.label)
      ])
    ))
  }
})

// 简单组件：多选组
const CheckboxGroup = defineComponent({
  props: {
    modelValue: Array,
    count: Number,
    start: { type: Number, default: 0 }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const handleChange = (val: number, checked: boolean) => {
      const newVal = [...(props.modelValue as number[])]
      if (checked) {
        newVal.push(val)
      } else {
        const idx = newVal.indexOf(val)
        if (idx > -1) newVal.splice(idx, 1)
      }
      newVal.sort((a, b) => a - b)
      emit('update:modelValue', newVal)
    }

    return () => h('div', { class: 'grid grid-cols-10 gap-2' }, 
      Array.from({ length: props.count as number }, (_, i) => i + props.start).map(val => 
        h('label', { class: 'flex items-center gap-1 cursor-pointer text-sm' }, [
          h('input', {
            type: 'checkbox',
            checked: (props.modelValue as number[]).includes(val),
            class: 'rounded text-blue-600 focus:ring-blue-500',
            onChange: (e: any) => handleChange(val, e.target.checked)
          }),
          h('span', val)
        ])
      )
    )
  }
})

// 状态
const currentTab = ref('second')
const tabs = [
  { key: 'second', name: '秒' },
  { key: 'minute', name: '分' },
  { key: 'hour', name: '时' },
  { key: 'day', name: '日' },
  { key: 'month', name: '月' },
  { key: 'week', name: '周' },
]

const typeOptions = [
  { label: '每（*）', value: 'every' },
  { label: '周期', value: 'range' },
  { label: '从...开始，每...', value: 'loop' },
  { label: '指定', value: 'specific' },
]

const dayTypeOptions = [
  { label: '每（*）', value: 'every' },
  { label: '不指定（?）', value: 'none' },
  { label: '周期', value: 'range' },
  { label: '从...开始，每...', value: 'loop' },
  { label: '工作日', value: 'workday' },
  { label: '最后一天', value: 'last' },
  { label: '指定', value: 'specific' },
]

const weekTypeOptions = [
  { label: '每（*）', value: 'every' },
  { label: '不指定（?）', value: 'none' },
  { label: '周期', value: 'range' },
  { label: '第几周的星期几', value: 'loop' },
  { label: '本月最后一个星期几', value: 'last' },
  { label: '指定', value: 'specific' },
]

const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

// 数据模型
const second = ref({ type: 'every', rangeStart: 1, rangeEnd: 2, loopStart: 0, loopStep: 1, specific: [] as number[] })
const minute = ref({ type: 'every', rangeStart: 1, rangeEnd: 2, loopStart: 0, loopStep: 1, specific: [] as number[] })
const hour = ref({ type: 'every', rangeStart: 0, rangeEnd: 1, loopStart: 0, loopStep: 1, specific: [] as number[] })
const day = ref({ type: 'every', rangeStart: 1, rangeEnd: 2, loopStart: 1, loopStep: 1, workDay: 1, specific: [] as number[] })
const month = ref({ type: 'every', rangeStart: 1, rangeEnd: 2, loopStart: 1, loopStep: 1, specific: [] as number[] })
const week = ref({ type: 'none', rangeStart: 1, rangeEnd: 2, loopStart: 1, loopStep: 1, last: 1, specific: [] as number[] })

// 互斥处理：日和周
watch(() => day.value.type, (val) => {
  if (val !== 'none' && week.value.type !== 'none') {
    week.value.type = 'none'
  }
})
watch(() => week.value.type, (val) => {
  if (val !== 'none' && day.value.type !== 'none') {
    day.value.type = 'none'
  }
})

// 生成表达式
const getCronPart = (obj: any, min: number, max: number) => {
  switch (obj.type) {
    case 'every': return '*'
    case 'none': return '?'
    case 'range': return `${obj.rangeStart}-${obj.rangeEnd}`
    case 'loop': return `${obj.loopStart}/${obj.loopStep}`
    case 'workday': return `${obj.workDay}W`
    case 'last': return obj.type === 'week' ? `${obj.last}L` : 'L'
    case 'specific': return obj.specific.length > 0 ? obj.specific.join(',') : '*'
    default: return '*'
  }
}

const cronExpression = computed(() => {
  return [
    getCronPart(second.value, 0, 59),
    getCronPart(minute.value, 0, 59),
    getCronPart(hour.value, 0, 23),
    getCronPart(day.value, 1, 31),
    getCronPart(month.value, 1, 12),
    getCronPart(week.value, 1, 7)
  ].join(' ')
})

const nextRuns = ref<string[]>([])

// 简单预测（实际应该用专门的库如 cron-parser，这里简化模拟当前时间后的几次）
watch(cronExpression, () => {
  // 这里的预测仅作展示，真实解析很复杂
  nextRuns.value = ['计算逻辑较复杂，建议后端校验', '此处仅展示表达式生成']
})

const copyCron = () => {
  navigator.clipboard.writeText(cronExpression.value).then(() => {
    ElNotification({
      title: '成功',
      message: 'Cron 表达式已复制',
      type: 'success'
    })
  })
}

</script>
