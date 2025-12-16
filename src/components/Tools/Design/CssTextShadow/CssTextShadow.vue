<!--
 * @file CssTextShadow.vue
 * @description CSS 文本阴影生成器，可视化生成 text-shadow 属性
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'

const route = useRoute()
const { toClipboard } = useClipboard()

const text = ref('Hello World')
const fontSize = ref(60)
const textColor = ref('#333333')
const bgColor = ref('#f3f4f6')

const shiftRight = ref(2)
const shiftDown = ref(2)
const blur = ref(4)
const shadowColor = ref('#000000')
const opacity = ref(0.2)

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
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const shadowValue = computed(() => {
  return `${shiftRight.value}px ${shiftDown.value}px ${blur.value}px ${hexToRgba(shadowColor.value, opacity.value)}`
})

const previewStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  color: textColor.value,
  textShadow: shadowValue.value,
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
}))

const cssCode = computed(() => {
  return `text-shadow: ${shadowValue.value};`
})

const copyCss = async () => {
  try {
    await toClipboard(cssCode.value)
    ElMessage.success('CSS 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 文本阴影生成器</h2>
          <p class="text-gray-500 text-sm">在线可视化生成 CSS text-shadow 代码，支持偏移、模糊和颜色透明度调节</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          <!-- Preview -->
          <div 
            class="flex-1 rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px] overflow-hidden"
            :style="{ backgroundColor: bgColor }"
          >
             <div :style="previewStyle" class="text-center break-words max-w-full">
                {{ text }}
             </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">
            
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">文本设置</h3>
              
              <div class="space-y-4">
                 <div>
                  <div class="text-sm text-gray-600 mb-1">预览文本</div>
                  <el-input v-model="text" />
                </div>
                
                 <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>字体大小</span>
                    <span>{{ fontSize }}px</span>
                  </div>
                  <el-slider v-model="fontSize" :min="12" :max="120" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                   <div>
                      <div class="text-sm text-gray-600 mb-1">文字颜色</div>
                      <el-color-picker v-model="textColor" />
                   </div>
                   <div>
                      <div class="text-sm text-gray-600 mb-1">背景颜色</div>
                      <el-color-picker v-model="bgColor" />
                   </div>
                </div>
              </div>

              <h3 class="font-bold text-gray-800 mt-6 mb-4">阴影设置</h3>
              <div class="space-y-4">
                <!-- Shift Right -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>水平偏移 (X)</span>
                    <span>{{ shiftRight }}px</span>
                  </div>
                  <el-slider v-model="shiftRight" :min="-50" :max="50" />
                </div>

                <!-- Shift Down -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>垂直偏移 (Y)</span>
                    <span>{{ shiftDown }}px</span>
                  </div>
                  <el-slider v-model="shiftDown" :min="-50" :max="50" />
                </div>

                <!-- Blur -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>模糊半径 (Blur)</span>
                    <span>{{ blur }}px</span>
                  </div>
                  <el-slider v-model="blur" :min="0" :max="50" />
                </div>

                <!-- Opacity -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>不透明度</span>
                    <span>{{ opacity }}</span>
                  </div>
                  <el-slider v-model="opacity" :min="0" :max="1" :step="0.01" />
                </div>

                <!-- Color -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>阴影颜色</span>
                    <span>{{ shadowColor }}</span>
                  </div>
                  <el-color-picker v-model="shadowColor" />
                </div>
              </div>

            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <div class="text-gray-400 text-xs mb-2">CSS Code</div>
              <pre class="text-blue-300 font-mono text-sm overflow-x-auto break-all whitespace-pre-wrap">{{ cssCode }}</pre>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
