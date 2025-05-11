<!--
 * @file ColorPicker.vue
 * @description 颜色选择器工具，支持多种颜色格式转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
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
          <p class="text-gray-500 text-sm mt-4">多格式颜色转换工具，轻松获取各种颜色代码</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="px-8 pb-8">
          <div class="max-w-3xl mx-auto">
            <!-- 颜色选择区域 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex flex-col items-center space-y-8">
                <!-- 颜色选择器 -->
                <div class="flex items-center justify-center">
                  <el-color-picker v-model="color" size="large" :predefine="predefineColors" show-alpha @change="change"
                    class="!w-[280px] !h-[40px]" />
                </div>

                <!-- 颜色预览 -->
                <div class="w-full">
                  <div class="h-24 rounded-lg shadow-sm transition-colors duration-200"
                    :style="{ backgroundColor: color }">
                  </div>
                </div>

                <!-- 颜色格式列表 -->
                <div class="w-full grid grid-cols-1 gap-4">
                  <!-- HEX -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">HEX</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ hex }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(hex, 'HEX')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- RGB -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">RGB</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ rgb }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(rgb, 'RGB')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- HSL -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">HSL</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ hsl }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(hsl, 'HSL')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- HSV -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">HSV</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ formatHsv(hsv) }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(formatHsv(hsv), 'HSV')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- HWB -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">HWB</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ hwb }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(hwb, 'HWB')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- CMYK -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">CMYK</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ cmyk }}</span>
                      <el-button :icon="CopyDocument" text @click="copyColor(cmyk, 'CMYK')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>

                  <!-- 颜色名称 -->
                  <div class="flex items-center space-x-4">
                    <span class="w-24 text-sm font-medium text-gray-700">名称</span>
                    <div class="flex-1 flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">
                      <span class="font-mono text-gray-900">{{ name || '无对应的颜色名称' }}</span>
                      <el-button v-if="name" :icon="CopyDocument" text @click="copyColor(name, '颜色名称')"
                        class="!text-gray-500 hover:!text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
          <!-- 功能点 -->
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

          <!-- 适用场景说明 -->
          <div class="mt-8">
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

          <!-- 使用说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
            <div class="space-y-6">
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">如何使用？</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>1. 使用颜色选择器选择所需颜色</p>
                  <p>2. 实时查看不同格式的颜色代码</p>
                  <p>3. 点击复制按钮复制对应格式的代码</p>
                  <p>4. 支持透明度调节和预设颜色选择</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">支持的格式</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- HEX：网页常用的十六进制颜色代码</p>
                  <p>- RGB：红绿蓝三原色表示法</p>
                  <p>- HSL：色相、饱和度、亮度表示法</p>
                  <p>- HSV：色相、饱和度、明度表示法</p>
                  <p>- HWB：色相、白度、黑度表示法</p>
                  <p>- CMYK：印刷四色模式</p>
                </div>
              </div>
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
import { reactive, ref, onMounted } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { colord, extend } from 'colord'
import cmykPlugin from 'colord/plugins/cmyk'
import hwbPlugin from 'colord/plugins/hwb'
import namesPlugin from 'colord/plugins/names'
import lchPlugin from 'colord/plugins/lch'
import labPlugin from 'colord/plugins/lab'

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin, labPlugin])

const route = useRoute()

const info = reactive({
  title: "颜色转换工具",
})

// 预设颜色
const predefineColors = [
  '#ff4500',
  '#ff8c00',
  '#ffd700',
  '#90ee90',
  '#00ced1',
  '#1e90ff',
  '#c71585',
  '#ff69b4',
]

const color = ref('#409EFF')
const hex = ref('')
const rgb = ref('')
const hsl = ref('')
const hsv = ref<{ h: number; s: number; v: number }>()
const hwb = ref('')
const lab = ref<{ l: number; a: number; b: number }>()
const lch = ref('')
const cmyk = ref('')
const name = ref<string>('')

// 功能特点
const features = [
  {
    title: '多格式支持',
    desc: '支持HEX、RGB、HSL等多种颜色格式的转换'
  },
  {
    title: '实时预览',
    desc: '颜色选择后即时查看效果和各种格式代码'
  },
  {
    title: '便捷复制',
    desc: '一键复制任意格式的颜色代码'
  }
]

// 适用场景
const usageScenarios = [
  'UI设计：获取和转换界面设计所需的颜色代码',
  '前端开发：在不同场景使用不同格式的颜色表示',
  '平面设计：获取印刷设计所需的CMYK颜色值',
  '品牌设计：确保品牌色彩在不同环境下的一致性'
]

const change = () => {
  const colorObj = colord(color.value)
  hex.value = colorObj.toHex()
  rgb.value = colorObj.toRgbString()
  hsl.value = colorObj.toHslString()
  hsv.value = colorObj.toHsv()
  hwb.value = colorObj.toHwbString()
  lab.value = colorObj.toLab()
  lch.value = colorObj.toLchString()
  cmyk.value = colorObj.toCmykString()
  name.value = colorObj.toName({ closest: true })
}

const formatHsv = (hsv: { h: number; s: number; v: number } | undefined): string => {
  if (!hsv) return ''
  return `hsv(${Math.round(hsv.h)}deg ${Math.round(hsv.s * 100)}% ${Math.round(hsv.v * 100)}%)`
}

const copyColor = async (value: string, format: string) => {
  if (!value) return
  await copy(value)
  ElMessage.success(`${format}格式颜色代码已复制到剪贴板`)
}

onMounted(() => {
  change()
})
</script>

<style scoped>
.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
}

.el-color-picker {
  --el-color-picker-color: var(--el-color-primary);
}
</style>
