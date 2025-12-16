<!--
 * @file BorderRadius.vue
 * @description CSS 圆角生成器，在线可视化生成 CSS border-radius 代码，支持 8 个值的复杂圆角设置
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

// State
const simpleMode = ref(false) // 默认为高级模式(8值)

// 8 values for fancy border radius
// Horizontal: top-left, top-right, bottom-right, bottom-left
const h1 = ref(30)
const h2 = ref(70)
const h3 = ref(70)
const h4 = ref(30)

// Vertical: top-left, top-right, bottom-right, bottom-left
const v1 = ref(30)
const v2 = ref(30)
const v3 = ref(70)
const v4 = ref(70)

// Simple mode single value
const radius = ref(10)

// Computed CSS
const borderRadiusCss = computed(() => {
  if (simpleMode.value) {
    return `${radius.value}px`
  }
  return `${h1.value}% ${h2.value}% ${h3.value}% ${h4.value}% / ${v1.value}% ${v2.value}% ${v3.value}% ${v4.value}%`
})

const boxStyle = computed(() => {
  return {
    borderRadius: borderRadiusCss.value
  }
})

// Copy
const copyCss = async () => {
  try {
    await toClipboard(`border-radius: ${borderRadiusCss.value};`)
    ElMessage.success('CSS 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// Randomize
const randomize = () => {
  if (simpleMode.value) {
    radius.value = Math.floor(Math.random() * 50)
  } else {
    h1.value = Math.floor(Math.random() * 100)
    h2.value = Math.floor(Math.random() * 100)
    h3.value = Math.floor(Math.random() * 100)
    h4.value = Math.floor(Math.random() * 100)
    v1.value = Math.floor(Math.random() * 100)
    v2.value = Math.floor(Math.random() * 100)
    v3.value = Math.floor(Math.random() * 100)
    v4.value = Math.floor(Math.random() * 100)
  }
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 圆角生成器</h2>
          <p class="text-gray-500 text-sm">在线可视化生成 CSS border-radius 代码，支持 8 个值的复杂圆角设置，轻松制作有机形状</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-center justify-center">

          <!-- Preview -->
          <div
            class="flex-1 w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 min-h-[500px] p-8">
            <div
              class="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-400 to-purple-500 shadow-xl transition-all duration-300 ease-in-out"
              :style="boxStyle"></div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-gray-800">设置</h3>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600">简单模式</span>
                  <el-switch v-model="simpleMode" />
                </div>
              </div>

              <div v-if="simpleMode" class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>圆角大小 (px)</span>
                    <span>{{ radius }}px</span>
                  </div>
                  <el-slider v-model="radius" :min="0" :max="150" />
                </div>
              </div>

              <div v-else class="space-y-6">
                <!-- Horizontal -->
                <div>
                  <div class="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Horizontal Radius (水平半径)
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-xs text-gray-500">Top-Left</span>
                      <el-slider v-model="h1" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Top-Right</span>
                      <el-slider v-model="h2" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Bottom-Right</span>
                      <el-slider v-model="h3" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Bottom-Left</span>
                      <el-slider v-model="h4" :min="0" :max="100" size="small" />
                    </div>
                  </div>
                </div>

                <!-- Vertical -->
                <div>
                  <div class="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Vertical Radius (垂直半径)
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <span class="text-xs text-gray-500">Top-Left</span>
                      <el-slider v-model="v1" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Top-Right</span>
                      <el-slider v-model="v2" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Bottom-Right</span>
                      <el-slider v-model="v3" :min="0" :max="100" size="small" />
                    </div>
                    <div>
                      <span class="text-xs text-gray-500">Bottom-Left</span>
                      <el-slider v-model="v4" :min="0" :max="100" size="small" />
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <el-button @click="randomize" class="w-full">随机形状</el-button>
              </div>

            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <div class="text-gray-400 text-xs mb-2">CSS Code</div>
              <pre
                class="text-blue-300 font-mono text-sm overflow-x-auto break-all whitespace-pre-wrap">border-radius: {{ borderRadiusCss }};</pre>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>
