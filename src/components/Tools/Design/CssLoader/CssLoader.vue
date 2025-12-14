<!--
 * @file CssLoader.vue
 * @description CSS 加载动画生成器，生成纯 CSS 实现的 Loading 动画
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

const size = ref(48)
const width = ref(5)
const color = ref('#3b82f6')
const speed = ref(1)

// Computed CSS for the preview
const loaderStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
  border: `${width.value}px solid ${color.value}33`, // 20% opacity for bg
  borderBottomColor: color.value,
  borderRadius: '50%',
  display: 'inline-block',
  boxSizing: 'border-box' as const,
  animation: `rotation ${speed.value}s linear infinite`
}))

const keyframesStyle = `
@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`

const cssCode = computed(() => {
  return `.loader {
  width: ${size.value}px;
  height: ${size.value}px;
  border: ${width.value}px solid ${color.value}33;
  border-bottom-color: ${color.value};
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation ${speed.value}s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}`
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 加载动画生成器</h2>
          <p class="text-gray-500 text-sm">生成纯 CSS 实现的 Loading 旋转动画，可自定义大小、颜色和速度</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Preview -->
          <div
            class="flex-1 bg-gray-50 rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px]">
            <!-- Inline styles for keyframes injection -->
            <component is="style">{{ keyframesStyle }}</component>
            <div :style="loaderStyle"></div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">参数设置</h3>

              <div class="space-y-4">
                <!-- Size -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>大小 (Size)</span>
                    <span>{{ size }}px</span>
                  </div>
                  <el-slider v-model="size" :min="16" :max="200" />
                </div>

                <!-- Stroke Width -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>线宽 (Stroke)</span>
                    <span>{{ width }}px</span>
                  </div>
                  <el-slider v-model="width" :min="1" :max="20" />
                </div>

                <!-- Color -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>颜色</span>
                    <span>{{ color }}</span>
                  </div>
                  <el-color-picker v-model="color" />
                </div>

                <!-- Speed -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>动画时长 (秒)</span>
                    <span>{{ speed }}s</span>
                  </div>
                  <el-slider v-model="speed" :min="0.1" :max="5" :step="0.1" />
                </div>
              </div>
            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <div class="text-gray-400 text-xs mb-2">CSS Code</div>
              <pre
                class="text-blue-300 font-mono text-sm overflow-x-auto break-all whitespace-pre-wrap">{{ cssCode }}</pre>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
