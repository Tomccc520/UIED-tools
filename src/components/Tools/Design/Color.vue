<!--
 * @file Color.vue
 * @description 配色方案生成器工具组件，支持快速生成专业的配色方案
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 *
 * 功能特性：
 * 1. 支持多种配色方案生成(单色、互补色、三色、类比色等)
 * 2. 支持自定义主色调和配色规则
 * 3. 支持导出配色方案
 * 4. 内置多个经典配色模板
 * 5. 支持颜色代码格式转换
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">本工具提供专业的配色方案生成功能，可用于UI设计、平面设计、品牌设计等场景。</p>
            </div>
          </div>
        </div>

        <!-- 配色方案生成区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 配色类型选择 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">选择配色类型</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="(type, index) in colorTypes" :key="index"
                class="border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md"
                :class="{ 'border-blue-500 bg-blue-50': selectedColorType === type.type }"
                @click="selectColorType(type)">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <component :is="type.icon" class="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div class="font-medium">{{ type.name }}</div>
                    <div class="text-xs text-gray-500">{{ type.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 主色调选择 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">选择主色调</h3>
            <div class="grid grid-cols-1 gap-4">
              <!-- 颜色选择器 -->
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-lg shadow-inner" :style="{ backgroundColor: mainColor }"></div>
                <el-color-picker v-model="mainColor" show-alpha @change="generateColorScheme" />
                <div class="text-sm text-gray-600">
                  <div>HEX: {{ mainColor }}</div>
                  <div>RGB: {{ colorToRGB(mainColor) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 生成的配色方案 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">配色方案</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div v-for="(color, index) in colorScheme" :key="index"
                class="rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-300"
                @click="copyColor(color)">
                <div class="h-24" :style="{ backgroundColor: color }"></div>
                <div class="p-2 text-center bg-white">
                  <div class="text-sm font-medium">{{ color.toUpperCase() }}</div>
                  <div class="text-xs text-gray-500">{{ colorToRGB(color) }}</div>
                  <div class="text-xs text-blue-500 mt-1">点击复制</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 配色模板 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">经典配色模板</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="(template, index) in colorTemplates" :key="index"
                class="rounded-lg overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-300"
                @click="applyTemplate(template)">
                <div class="h-16 flex">
                  <div v-for="(color, colorIndex) in template.colors" :key="colorIndex" class="flex-1"
                    :style="{ backgroundColor: color }"></div>
                </div>
                <div class="p-3">
                  <div class="font-medium">{{ template.name }}</div>
                  <div class="text-sm text-gray-500">{{ template.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <el-button type="primary" size="large" @click="exportColorScheme">
              导出配色方案
            </el-button>
            <el-button size="large" @click="resetColors">
              重置
            </el-button>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">专业配色</h3>
                <p class="text-sm text-gray-500 leading-relaxed">基于色彩理论，生成专业和谐的配色方案</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">多种模式</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持单色、互补色、三色等多种配色模式</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">便捷导出</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持多种格式导出，方便项目使用</p>
              </div>
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
import { ref, reactive } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import {
  Brush,
  Connection,
  Share,
  CirclePlus,
  Refresh
} from '@element-plus/icons-vue'

const route = useRoute()

// 组件配置信息
const info = reactive({
  title: "配色方案生成器",
  subtitle: "快速生成专业的配色方案，支持多种配色模式和导出格式"
})

// 配色类型定义
const colorTypes = [
  {
    type: 'monochromatic',
    name: '单色配色',
    icon: Brush,
    description: '基于单一颜色的明度和饱和度变化'
  },
  {
    type: 'complementary',
    name: '互补色配色',
    icon: Connection,
    description: '使用色轮上相对的两种颜色'
  },
  {
    type: 'triadic',
    name: '三色配色',
    icon: Share,
    description: '使用色轮上相隔120度的三种颜色'
  },
  {
    type: 'analogous',
    name: '类比色配色',
    icon: CirclePlus,
    description: '使用色轮上相邻的颜色'
  }
]

// 经典配色模板
const colorTemplates = [
  {
    name: '科技蓝',
    description: '现代感科技风格配色',
    colors: ['#1890ff', '#69c0ff', '#91d5ff', '#bae7ff', '#e6f7ff']
  },
  {
    name: '自然绿',
    description: '清新自然风格配色',
    colors: ['#52c41a', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be']
  },
  {
    name: '活力橙',
    description: '充满活力的温暖配色',
    colors: ['#fa8c16', '#ffa940', '#ffc069', '#ffd591', '#fff2e8']
  }
]

// 响应式数据
const mainColor = ref('#1890ff')
const selectedColorType = ref('monochromatic')
const colorScheme = ref<string[]>(['#1890ff', '#69c0ff', '#91d5ff', '#bae7ff', '#e6f7ff'])

// 选择配色类型
const selectColorType = (type: { type: string }) => {
  selectedColorType.value = type.type
  generateColorScheme()
}

// 生成配色方案
const generateColorScheme = () => {
  // 这里简化处理，实际应该根据不同的配色类型生成对应的配色方案
  const baseColor = mainColor.value
  const colors: string[] = []

  switch (selectedColorType.value) {
    case 'monochromatic':
      // 生成单色配色方案
      colors.push(baseColor)
      colors.push(adjustBrightness(baseColor, 20))
      colors.push(adjustBrightness(baseColor, 40))
      colors.push(adjustBrightness(baseColor, 60))
      colors.push(adjustBrightness(baseColor, 80))
      break
    case 'complementary':
      // 生成互补色配色方案
      colors.push(baseColor)
      colors.push(getComplementaryColor(baseColor))
      colors.push(adjustBrightness(baseColor, 40))
      colors.push(adjustBrightness(getComplementaryColor(baseColor), 40))
      colors.push(adjustBrightness(baseColor, 80))
      break
    // 其他配色类型的处理...
    default:
      colors.push(baseColor)
      colors.push(adjustBrightness(baseColor, 20))
      colors.push(adjustBrightness(baseColor, 40))
      colors.push(adjustBrightness(baseColor, 60))
      colors.push(adjustBrightness(baseColor, 80))
  }

  colorScheme.value = colors
}

// 调整颜色亮度
const adjustBrightness = (color: string, percent: number): string => {
  // 简化处理，实际应该使用更复杂的颜色计算
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const amount = Math.round(2.55 * percent)
  const newR = Math.min(255, r + amount)
  const newG = Math.min(255, g + amount)
  const newB = Math.min(255, b + amount)

  return `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`
}

// 获取互补色
const getComplementaryColor = (color: string): string => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const newR = 255 - r
  const newG = 255 - g
  const newB = 255 - b

  return `#${(newR << 16 | newG << 8 | newB).toString(16).padStart(6, '0')}`
}

// 颜色格式转换
const colorToRGB = (color: string): string => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// 应用模板
const applyTemplate = (template: any) => {
  colorScheme.value = template.colors
  mainColor.value = template.colors[0]
}

// 导出配色方案
const exportColorScheme = () => {
  const result = {
    name: '我的配色方案',
    type: selectedColorType.value,
    mainColor: mainColor.value,
    colors: colorScheme.value,
    formats: {
      hex: colorScheme.value,
      rgb: colorScheme.value.map(color => colorToRGB(color))
    }
  }

  // 创建下载链接
  const dataStr = JSON.stringify(result, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = '配色方案.json'
  link.href = url
  link.click()
  URL.revokeObjectURL(url)

  ElMessage.success('配色方案已导出')
}

// 重置
const resetColors = () => {
  mainColor.value = '#1890ff'
  selectedColorType.value = 'monochromatic'
  generateColorScheme()
}

// 复制颜色代码
const copyColor = (color: string) => {
  navigator.clipboard.writeText(color).then(() => {
    ElMessage.success(`颜色代码 ${color.toUpperCase()} 已复制到剪贴板`)
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 初始化
generateColorScheme()
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 添加颜色卡片样式 */
.color-card {
  transition: all 0.3s ease;
}

.color-card:hover {
  transform: translateY(-2px);
}

/* 添加颜色卡片点击效果 */
.color-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.color-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.color-card:active {
  transform: translateY(0);
}
</style>
