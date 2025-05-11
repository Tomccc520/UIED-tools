<!--
 * @file TimeTran.vue
 * @description 时间戳转换工具，支持时间戳和日期时间的双向转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 实时显示当前时间戳
 * 2. 支持时间戳和日期时间双向转换
 * 3. 支持毫秒和秒两种时间戳格式
 * 4. 一键复制时间戳
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">快速便捷的时间戳转换工具，支持多种格式转换</p>
        </div>

        <!-- 主要功能区域 -->
        <div class="space-y-6">
          <!-- 当前时间戳 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">当前时间戳</h3>
            </div>
            <div class="flex items-center space-x-4">
              <el-button class="text-lg px-6 h-10" type="primary" plain @click="copyRes()">
                {{ info.nowTime }}
                <el-icon class="ml-2">
                  <CopyDocument />
                </el-icon>
              </el-button>
              <el-button v-if="info.isPlay" type="danger" @click="isPlayChange()" class="px-6 h-10">
                <el-icon class="mr-1" size="16">
                  <VideoPlay />
                </el-icon>停止
              </el-button>
              <el-button v-else type="primary" @click="isPlayChange()" class="px-6 h-10">
                <el-icon class="mr-1" size="16">
                  <VideoPause />
                </el-icon>开始
              </el-button>
            </div>
          </div>

          <!-- 时间戳转日期 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">时间戳转日期</h3>
            </div>
            <div class="flex items-center space-x-4">
              <el-input v-model="info.waitTimeStamp" class="!w-64 shadow-sm" placeholder="请输入时间戳（毫秒/秒）" />
              <el-button type="primary" @click="timeTran('toDate')" class="px-6 h-10">转换</el-button>
              <el-input v-model="info.tranDate" class="!w-64 shadow-sm" placeholder="转换结果（北京时间）" readonly />
            </div>
          </div>

          <!-- 日期转时间戳 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">日期转时间戳</h3>
            </div>
            <div class="flex items-center space-x-4">
              <el-input v-model="info.waitDate" class="!w-64 shadow-sm" placeholder="请输入日期时间" />
              <el-button type="primary" @click="timeTran('toStamp')" class="px-6 h-10">转换</el-button>
              <el-input v-model="info.tranTimeStamp" :value="info.tranTimeStamp == 0 ? '' : info.tranTimeStamp"
                class="!w-64 shadow-sm" placeholder="转换结果">
                <template #prepend>
                  <el-select v-model="info.chooseTranStampOption" class="!w-24">
                    <el-option v-for="item in info.tranOptions" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                </template>
              </el-input>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是时间戳？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">时间戳是从1970年1月1日（UTC/GMT的午夜）开始所经过的秒数，用于精确表示一个时间点。</p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">为什么有毫秒和秒两种格式？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">不同系统可能使用不同的时间戳格式，毫秒精确到千分之一秒，而秒则是最基本的时间单位，本工具支持两种格式的互相转换。
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from '@vue/runtime-core'
import { VideoPause, VideoPlay, CopyDocument } from '@element-plus/icons-vue'
import { Jh_getTimeStamp, Jh_timeStampToTime, Jh_convertTimeStamp } from '@/utils/time'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "时间戳转换",
  nowTime: Jh_getTimeStamp(),
  isPlay: true,
  waitTimeStamp: Jh_getTimeStamp(),
  tranTimeStamp: 0,
  waitDate: Jh_timeStampToTime(Jh_getTimeStamp(), '{y}-{m}-{d} {h}:{i}:{s}'),
  tranDate: '',
  chooseTranStampOption: '0',
  chooseTranDateOption: '0',
  tranOptions: [
    {
      value: '0',
      label: '毫秒(ms)'
    },
    {
      value: '1',
      label: '秒(s)'
    }
  ]
})

// 功能特点
const features = [
  {
    title: '实时更新',
    desc: '实时显示当前时间戳，支持暂停/继续'
  },
  {
    title: '双向转换',
    desc: '支持时间戳转日期和日期转时间戳'
  },
  {
    title: '多种格式',
    desc: '支持毫秒和秒两种时间戳格式'
  }
]

// 适用场景
const usageScenarios = [
  '开发调试：快速验证时间戳',
  '日志分析：转换日志中的时间戳',
  '数据处理：处理含时间戳的数据',
  '接口测试：验证时间相关接口'
]

let timer: any

//开始定时任务
const start = () => {
  if (!timer) {
    timer = setInterval(() => {
      info.nowTime = Jh_getTimeStamp()
    }, 1000)
  }
}

//停止定时任务
const stop = () => {
  clearInterval(timer)
  timer = null
}

//进入
onMounted(() => {
  start()
})

//消亡
onUnmounted(() => {
  stop()
})

const isPlayChange = () => {
  if (info.isPlay == true) {
    info.isPlay = false
    stop()
  } else {
    info.isPlay = true
    start()
  }
}

//时间日期相互转换
const timeTran = (type: string) => {
  if (type == 'toStamp') {
    if (!info.waitDate) {
      ElMessage({
        message: "请输入需要转换的时间",
        type: "warning",
        duration: 1500
      })
      return
    }
    info.tranTimeStamp = info.chooseTranStampOption == '0' ? Jh_convertTimeStamp(info.waitDate) : Jh_convertTimeStamp(info.waitDate) / 1000
  } else {
    if (!info.waitTimeStamp) {
      ElMessage({
        message: "请输入需要转换的时间戳",
        type: "warning",
        duration: 1500
      })
      return
    }
    //转换number类型
    if (typeof (info.waitTimeStamp) === 'string') info.waitTimeStamp = parseInt(info.waitTimeStamp as string)
    info.tranDate = Jh_timeStampToTime(info.waitTimeStamp, '{y}-{m}-{d} {h}:{i}:{s}')
  }
}

//复制时间戳
const copyRes = async () => {
  copy('' + info.nowTime)
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1500
  })
}
</script>

<style scoped>
.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1rem;
  border-color: #e5e7eb;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.el-input {
  width: auto;
}

.el-select :deep(.el-input__wrapper) {
  box-shadow: none;
  border-right: 1px solid #e5e7eb;
}
</style>
