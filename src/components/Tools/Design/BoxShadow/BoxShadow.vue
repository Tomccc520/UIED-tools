<script setup lang="ts">
/**
 * @file BoxShadow.vue
 * @description CSS 阴影生成器，可视化调节 box-shadow 属性并生成代码
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { ref, computed } from 'vue'
import { CopyDocument, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 阴影属性
const shiftRight = ref(0)
const shiftDown = ref(4)
const blur = ref(10)
const spread = ref(0)
const opacity = ref(0.2)
const inset = ref(false)

// 颜色设置
const shadowColor = ref('#000000')
const boxColor = ref('#FFFFFF')
const bgColor = ref('#F3F4F6')

// 生成 CSS 代码
const cssCode = computed(() => {
  const rgba = hexToRgba(shadowColor.value, opacity.value)
  const insetStr = inset.value ? 'inset ' : ''
  return `box-shadow: ${insetStr}${shiftRight.value}px ${shiftDown.value}px ${blur.value}px ${spread.value}px ${rgba};`
})

// 样式对象
const boxStyle = computed(() => {
  const rgba = hexToRgba(shadowColor.value, opacity.value)
  const insetStr = inset.value ? 'inset ' : ''
  return {
    backgroundColor: boxColor.value,
    boxShadow: `${insetStr}${shiftRight.value}px ${shiftDown.value}px ${blur.value}px ${spread.value}px ${rgba}`
  }
})

// Hex 转 RGBA
const hexToRgba = (hex: string, alpha: number) => {
  let r = 0, g = 0, b = 0
  if (hex.length === 4) {
    r = parseInt('0x' + hex[1] + hex[1])
    g = parseInt('0x' + hex[2] + hex[2])
    b = parseInt('0x' + hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = parseInt('0x' + hex[1] + hex[2])
    g = parseInt('0x' + hex[3] + hex[4])
    b = parseInt('0x' + hex[5] + hex[6])
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`
}

// 复制 CSS
const copyCss = () => {
  navigator.clipboard.writeText(cssCode.value).then(() => {
    ElMessage.success('CSS 代码已复制')
  })
}

// 重置
const reset = () => {
  shiftRight.value = 0
  shiftDown.value = 4
  blur.value = 10
  spread.value = 0
  opacity.value = 0.2
  inset.value = false
  shadowColor.value = '#000000'
  boxColor.value = '#FFFFFF'
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">CSS 阴影生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">可视化调节 Box Shadow 属性，快速生成精美的 CSS 阴影效果</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 控制面板 -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-gray-700">参数设置</h3>
                <el-button link type="primary" @click="reset">
                  <el-icon class="mr-1">
                    <RefreshLeft />
                  </el-icon> 重置
                </el-button>
              </div>

              <div class="space-y-6">
                <!-- 水平位移 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">水平位移 (X)</span>
                    <span class="text-sm font-mono text-blue-600">{{ shiftRight }}px</span>
                  </div>
                  <el-slider v-model="shiftRight" :min="-50" :max="50" />
                </div>

                <!-- 垂直位移 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">垂直位移 (Y)</span>
                    <span class="text-sm font-mono text-blue-600">{{ shiftDown }}px</span>
                  </div>
                  <el-slider v-model="shiftDown" :min="-50" :max="50" />
                </div>

                <!-- 模糊半径 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">模糊半径 (Blur)</span>
                    <span class="text-sm font-mono text-blue-600">{{ blur }}px</span>
                  </div>
                  <el-slider v-model="blur" :min="0" :max="100" />
                </div>

                <!-- 扩展半径 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">扩展半径 (Spread)</span>
                    <span class="text-sm font-mono text-blue-600">{{ spread }}px</span>
                  </div>
                  <el-slider v-model="spread" :min="-50" :max="50" />
                </div>

                <!-- 透明度 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">阴影透明度 (Opacity)</span>
                    <span class="text-sm font-mono text-blue-600">{{ opacity }}</span>
                  </div>
                  <el-slider v-model="opacity" :min="0" :max="1" :step="0.01" />
                </div>

                <!-- 内阴影开关 -->
                <div class="flex items-center justify-between pt-2">
                  <span class="text-sm text-gray-600">内阴影 (Inset)</span>
                  <el-switch v-model="inset" />
                </div>
              </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4">颜色设置</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">阴影颜色</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 font-mono">{{ shadowColor }}</span>
                    <el-color-picker v-model="shadowColor" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">盒子颜色</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 font-mono">{{ boxColor }}</span>
                    <el-color-picker v-model="boxColor" />
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">背景颜色</span>
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 font-mono">{{ bgColor }}</span>
                    <el-color-picker v-model="bgColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 预览与代码 -->
          <div class="lg:col-span-7 space-y-6">
            <!-- 预览区域 -->
            <div
              class="preview-area h-[400px] rounded-xl flex items-center justify-center transition-colors duration-300 border border-gray-200"
              :style="{ backgroundColor: bgColor }">
              <div class="w-48 h-48 rounded-2xl flex items-center justify-center transition-all duration-300"
                :style="boxStyle">
                <span class="text-sm font-medium opacity-50 select-none">Preview</span>
              </div>
            </div>

            <!-- 代码区域 -->
            <div class="bg-gray-800 rounded-xl p-6 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" @click="copyCss">
                  <el-icon class="mr-1">
                    <CopyDocument />
                  </el-icon> 复制
                </el-button>
              </div>
              <h3 class="text-gray-400 text-sm mb-3">CSS Code</h3>
              <pre
                class="font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap break-all">{{ cssCode }}</pre>
              <pre class="font-mono text-sm text-gray-500 mt-2">/* WebKit Support */
-webkit-box-shadow: {{ cssCode.replace('box-shadow: ', '').replace(';', '') }};</pre>
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
.el-slider {
  --el-slider-main-bg-color: #3b82f6;
}
</style>
