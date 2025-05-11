<!--
 * @file Unit.vue
 * @description 单位转换工具，支持多种单位的互相转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持长度、面积、重量等多种单位转换
 * 2. 实时转换结果
 * 3. 专业精确的换算公式
 * 4. 便捷的单位选择
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center py-8 px-4 relative">
          <h2 class="text-3xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-4">专业的单位换算工具，支持多种单位的互相转换</p>
        </div>

        <!-- 单位转换区域 -->
        <div class="bg-gray-50 p-6">
          <el-tabs v-model="info.activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="长度" name="lengthTab">
              <Length />
            </el-tab-pane>
            <el-tab-pane label="面积" name="areaTab">
              <Area />
            </el-tab-pane>
            <el-tab-pane label="重量" name="weightTab">
              <Weight />
            </el-tab-pane>
            <el-tab-pane label="时间" name="timeTab">
              <Time />
            </el-tab-pane>
            <el-tab-pane label="温度" name="temperatureTab">
              <Temperature />
            </el-tab-pane>
            <el-tab-pane label="压力" name="pressureTab">
              <Pressure />
            </el-tab-pane>
            <el-tab-pane label="热量" name="heatTab">
              <Heat />
            </el-tab-pane>
            <el-tab-pane label="功率" name="powerTab">
              <Power />
            </el-tab-pane>
          </el-tabs>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 py-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index"
              class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
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
        <div class="px-8 pb-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index"
              class="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm">
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
        <div class="px-8 pb-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题解答</h3>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">为什么需要单位转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                在日常生活、工程设计、科学研究等领域经常需要进行不同单位之间的转换，本工具提供精确的换算结果。
              </p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">转换结果准确吗？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                本工具采用标准的换算公式和高精度计算，确保转换结果的准确性。
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <div class="mt-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import { VideoPause, VideoPlay, CopyDocument } from '@element-plus/icons-vue'
import Length from './Length.vue'
import Area from './Area.vue'
import Heat from './Heat.vue'
import Power from './Power.vue'
import Pressure from './Pressure.vue'
import Temperature from './Temperature.vue'
import Time from './Time.vue'
import Weight from './Weight.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "单位转换工具",
  activeName: 'lengthTab',
  isPlay: true,
})

let timer: any

//开始定时任务
const start = () => {
  if (!timer) {
    timer = setInterval(() => {
      // 可以在这里添加需要定时执行的任务
    }, 1000)
  }
}

//停止定时任务
const stop = () => {
  clearInterval(timer)
  timer = null
}

//功能特点
const features = [
  {
    title: '多种单位',
    desc: '支持长度、面积、重量等多种单位的转换'
  },
  {
    title: '实时转换',
    desc: '输入即可获得实时转换结果'
  },
  {
    title: '精确计算',
    desc: '采用标准换算公式，确保结果准确'
  }
]

//适用场景
const usageScenarios = [
  '工程设计：不同单位制之间的转换',
  '科学研究：数据单位的标准化处理',
  '日常生活：常用单位快速换算',
  '教育教学：单位换算教学辅助'
]

const handleClick = () => {
  //Tab切换处理
}

onMounted(() => {
  start()
  if (route.query.active) {
    switch (route.query.active) {
      case 'area':
        info.activeName = 'areaTab'
        break;
      case 'weight':
        info.activeName = 'weightTab'
        break;
      case 'time':
        info.activeName = 'timeTab'
        break;
      case 'temperature':
        info.activeName = 'temperatureTab'
        break;
      case 'pressure':
        info.activeName = 'pressureTab'
        break;
      case 'heat':
        info.activeName = 'heatTab'
        break;
      case 'power':
        info.activeName = 'powerTab'
        break
      default:
        info.activeName = 'lengthTab'
        break;
    }
  }
})

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
</script>

<style scoped>
.el-input {
  width: auto;
}

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

.el-tabs__content {
  padding: 20px 0;
}

.el-tabs__nav {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.el-tabs__item {
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.el-tabs__item.is-active {
  color: #3b82f6;
}

.el-tabs__active-bar {
  background-color: #3b82f6;
}
</style>
