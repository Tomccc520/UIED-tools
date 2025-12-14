<script setup lang="ts">
/**
 * @file ContrastChecker.vue
 * @description 色彩对比度检测工具，用于检查前景色和背景色的对比度是否符合 WCAG 标准
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { ref, computed, watch } from 'vue'
import { CopyDocument, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 颜色状态
const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')

// 预设配色方案
const presets = [
  { fg: '#000000', bg: '#FFFFFF', name: '黑白' },
  { fg: '#FFFFFF', bg: '#000000', name: '白黑' },
  { fg: '#1F2937', bg: '#F3F4F6', name: '深灰/浅灰' },
  { fg: '#2563EB', bg: '#EFF6FF', name: '蓝/浅蓝' },
  { fg: '#FFFFFF', bg: '#4F46E5', name: '白/紫' },
  { fg: '#065F46', bg: '#D1FAE5', name: '深绿/浅绿' },
]

// 交换颜色
const swapColors = () => {
  const temp = foregroundColor.value
  foregroundColor.value = backgroundColor.value
  backgroundColor.value = temp
}

// 应用预设
const applyPreset = (preset: { fg: string; bg: string }) => {
  foregroundColor.value = preset.fg
  backgroundColor.value = preset.bg
}

// 计算相对亮度
const getLuminance = (hex: string) => {
  const rgb = hexToRgb(hex)
  const [r, g, b] = rgb.map(val => {
    val /= 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// HEX 转 RGB
const hexToRgb = (hex: string) => {
  let c: any = hex.substring(1).split('')
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
  }
  c = '0x' + c.join('')
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255]
}

// 计算对比度
const contrastRatio = computed(() => {
  const l1 = getLuminance(foregroundColor.value)
  const l2 = getLuminance(backgroundColor.value)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2)
})

// 评分等级
const rating = computed(() => {
  const ratio = parseFloat(contrastRatio.value)
  if (ratio >= 7) return { label: 'AAA (完美)', color: 'text-green-600', bg: 'bg-green-100' }
  if (ratio >= 4.5) return { label: 'AA (优秀)', color: 'text-blue-600', bg: 'bg-blue-100' }
  if (ratio >= 3) return { label: 'AA 大字 (良好)', color: 'text-yellow-600', bg: 'bg-yellow-100' }
  return { label: 'Fail (不合格)', color: 'text-red-600', bg: 'bg-red-100' }
})

// WCAG 标准检查
const wcagResults = computed(() => {
  const ratio = parseFloat(contrastRatio.value)
  return {
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5
  }
})

// 复制颜色代码
const copyColor = (color: string) => {
  navigator.clipboard.writeText(color).then(() => {
    ElMessage.success(`已复制颜色: ${color}`)
  })
}
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">色彩对比度检测</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">检查前景色和背景色的对比度，确保符合 WCAG 可访问性标准</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 颜色选择区 -->
          <div class="space-y-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-gray-700">颜色设置</h3>
                <el-button link type="primary" @click="swapColors">
                  <el-icon class="mr-1">
                    <Refresh />
                  </el-icon> 交换颜色
                </el-button>
              </div>

              <div class="space-y-4">
                <!-- 前景色 -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">文字颜色 (Foreground)</label>
                  <div class="flex items-center gap-3">
                    <el-color-picker v-model="foregroundColor" />
                    <el-input v-model="foregroundColor" class="flex-1">
                      <template #append>
                        <el-button @click="copyColor(foregroundColor)">
                          <el-icon>
                            <CopyDocument />
                          </el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>

                <!-- 背景色 -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">背景颜色 (Background)</label>
                  <div class="flex items-center gap-3">
                    <el-color-picker v-model="backgroundColor" />
                    <el-input v-model="backgroundColor" class="flex-1">
                      <template #append>
                        <el-button @click="copyColor(backgroundColor)">
                          <el-icon>
                            <CopyDocument />
                          </el-icon>
                        </el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>
            </div>

            <!-- 预设方案 -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4">常用配色</h3>
              <div class="grid grid-cols-3 gap-3">
                <button v-for="preset in presets" :key="preset.name"
                  class="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all hover:shadow-sm"
                  @click="applyPreset(preset)">
                  <div class="w-8 h-8 rounded-full border border-gray-200 shadow-sm mb-2"
                    :style="{ background: preset.bg, border: '1px solid rgba(0,0,0,0.1)' }">
                    <div class="w-1/2 h-full rounded-l-full" :style="{ background: preset.fg }"></div>
                  </div>
                  <span class="text-xs text-gray-500">{{ preset.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 预览与结果区 -->
          <div class="space-y-6">
            <!-- 评分卡片 -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div class="text-sm text-gray-500 mb-1">对比度比率</div>
              <div class="text-5xl font-black text-gray-800 mb-2">{{ contrastRatio }} : 1</div>
              <div class="inline-block px-4 py-1.5 rounded-full text-sm font-bold" :class="[rating.color, rating.bg]">
                {{ rating.label }}
              </div>
            </div>

            <!-- 预览卡片 -->
            <div
              class="p-8 rounded-xl shadow-inner transition-colors duration-300 min-h-[200px] flex flex-col justify-center gap-4"
              :style="{ backgroundColor: backgroundColor, color: foregroundColor }">
              <div>
                <p class="text-sm opacity-80 mb-1">小号文本 (14px)</p>
                <p class="text-sm">这就好比是为了让每一个人都能平等地获取信息，无论他们的视力如何。</p>
              </div>
              <div>
                <p class="text-base opacity-80 mb-1">常规文本 (16px)</p>
                <p class="text-base">良好的色彩对比度能显著提升文本的可读性。</p>
              </div>
              <div>
                <p class="text-sm opacity-80 mb-1">大号文本 (18px Bold / 24px)</p>
                <p class="text-2xl font-bold">设计不仅要好看，更要好用。</p>
              </div>
            </div>

            <!-- WCAG 检查列表 -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div class="text-xs text-gray-500 mb-2">WCAG AA 标准</div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">常规文本</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded"
                      :class="wcagResults.aaNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ wcagResults.aaNormal ? '通过' : '失败' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm">大号文本</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded"
                      :class="wcagResults.aaLarge ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ wcagResults.aaLarge ? '通过' : '失败' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div class="text-xs text-gray-500 mb-2">WCAG AAA 标准</div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm">常规文本</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded"
                      :class="wcagResults.aaaNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ wcagResults.aaaNormal ? '通过' : '失败' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-sm">大号文本</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded"
                      :class="wcagResults.aaaLarge ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ wcagResults.aaaLarge ? '通过' : '失败' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐工具 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.el-color-picker :deep(.el-color-picker__trigger) {
  width: 100%;
  padding: 2px;
}
</style>
