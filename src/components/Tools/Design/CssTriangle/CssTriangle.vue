<!--
 * @file CssTriangle.vue
 * @description CSS 三角形生成器，通过 border 属性生成各种方向的三角形
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

type Direction = 'top' | 'top-right' | 'right' | 'bottom-right' | 'bottom' | 'bottom-left' | 'left' | 'top-left'

const direction = ref<Direction>('top')
const width = ref(100)
const height = ref(100)
const color = ref('#3b82f6')
const rotate = ref(0)

const triangleStyle = computed(() => {
  const styles: Record<string, string> = {
    width: '0',
    height: '0',
    borderStyle: 'solid',
    transform: `rotate(${rotate.value}deg)`,
  }

  const w = width.value
  const h = height.value
  const c = color.value
  const t = 'transparent'

  switch (direction.value) {
    case 'top':
      styles.borderWidth = `0 ${w / 2}px ${h}px ${w / 2}px`
      styles.borderColor = `${t} ${t} ${c} ${t}`
      break
    case 'bottom':
      styles.borderWidth = `${h}px ${w / 2}px 0 ${w / 2}px`
      styles.borderColor = `${c} ${t} ${t} ${t}`
      break
    case 'left':
      styles.borderWidth = `${h / 2}px ${w}px ${h / 2}px 0`
      styles.borderColor = `${t} ${c} ${t} ${t}`
      break
    case 'right':
      styles.borderWidth = `${h / 2}px 0 ${h / 2}px ${w}px`
      styles.borderColor = `${t} ${t} ${t} ${c}`
      break
    case 'top-left':
      styles.borderWidth = `${h}px ${w}px 0 0`
      styles.borderColor = `${c} ${t} ${t} ${t}`
      break
    case 'top-right':
      styles.borderWidth = `0 ${w}px ${h}px 0`
      styles.borderColor = `${t} ${c} ${t} ${t}`
      break
    case 'bottom-left':
      styles.borderWidth = `${h}px 0 0 ${w}px`
      styles.borderColor = `${t} ${t} ${t} ${c}`
      break
    case 'bottom-right':
      styles.borderWidth = `0 0 ${h}px ${w}px`
      styles.borderColor = `${t} ${t} ${c} ${t}`
      break
  }

  return styles
})

const cssCode = computed(() => {
  const s = triangleStyle.value
  let code = `width: 0;
height: 0;
border-style: solid;
border-width: ${s.borderWidth};
border-color: ${s.borderColor};`

  if (rotate.value !== 0) {
    code += `\ntransform: rotate(${rotate.value}deg);`
  }
  return code
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 三角形生成器</h2>
          <p class="text-gray-500 text-sm">利用 CSS border 属性特性，快速生成各种方向和尺寸的三角形代码</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Preview -->
          <div
            class="flex-1 bg-gray-50 rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div :style="triangleStyle" class="transition-all duration-300"></div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">参数设置</h3>

              <div class="space-y-4">
                <!-- Direction -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">方向</div>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="d in ['top-left', 'top', 'top-right', 'left', 'right', 'bottom-left', 'bottom', 'bottom-right']"
                      :key="d"
                      class="p-2 border rounded hover:bg-blue-50 hover:border-blue-500 transition-colors text-xs flex items-center justify-center"
                      :class="{ 'bg-blue-500 text-white border-blue-500': direction === d, 'bg-white border-gray-200': direction !== d }"
                      @click="direction = d as Direction">
                      {{ d }}
                    </button>
                  </div>
                </div>

                <!-- Color -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>颜色</span>
                    <span>{{ color }}</span>
                  </div>
                  <el-color-picker v-model="color" />
                </div>

                <!-- Width -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>宽度</span>
                    <span>{{ width }}px</span>
                  </div>
                  <el-slider v-model="width" :min="0" :max="300" />
                </div>

                <!-- Height -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>高度</span>
                    <span>{{ height }}px</span>
                  </div>
                  <el-slider v-model="height" :min="0" :max="300" />
                </div>

                <!-- Rotate -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>旋转</span>
                    <span>{{ rotate }}deg</span>
                  </div>
                  <el-slider v-model="rotate" :min="0" :max="360" />
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
