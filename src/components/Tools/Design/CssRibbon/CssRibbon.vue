<!--
 * @file CssRibbon.vue
 * @description CSS 丝带生成器，生成常见的丝带形状 CSS 代码
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

const ribbonWidth = ref(150)
const color = ref('#cc3333')
const textColor = ref('#ffffff')
const text = ref('Ribbon')
const position = ref<'left' | 'right'>('left') // simplified to simple badge ribbon

// Computed Styles for Preview
const containerStyle = computed(() => ({
  position: 'relative' as const,
  width: '300px',
  height: '300px',
  background: '#f3f4f6',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  borderRadius: '0.5rem'
}))

const ribbonStyle = computed(() => {
  const base = {
    position: 'absolute' as const,
    top: '25px',
    width: `${ribbonWidth.value}px`,
    background: color.value,
    color: textColor.value,
    textAlign: 'center' as const,
    lineHeight: '2.5rem',
    letterSpacing: '1px',
    fontWeight: 'bold',
    boxShadow: '0 2px 3px rgba(0,0,0,0.5)',
    transform: position.value === 'left' ? 'rotate(-45deg)' : 'rotate(45deg)',
  }

  if (position.value === 'left') {
    return { ...base, left: '-50px' }
  } else {
    return { ...base, right: '-50px' }
  }
})

const cssCode = computed(() => {
  const transform = position.value === 'left' ? 'rotate(-45deg)' : 'rotate(45deg)'
  const pos = position.value === 'left' ? 'left: -50px;' : 'right: -50px;'

  return `.ribbon-container {
  position: relative;
  overflow: hidden;
  /* Parent container needs these */
}

.ribbon {
  position: absolute;
  top: 25px;
  ${pos}
  width: ${ribbonWidth.value}px;
  background-color: ${color.value};
  color: ${textColor.value};
  text-align: center;
  line-height: 2.5rem;
  letter-spacing: 1px;
  font-weight: bold;
  box-shadow: 0 2px 3px rgba(0,0,0,0.5);
  transform: ${transform};
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 丝带生成器</h2>
          <p class="text-gray-500 text-sm">快速生成常见的角落丝带（Ribbon）样式，常用于标记“热门”、“新品”等状态</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Preview -->
          <div
            class="flex-1 bg-white rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div :style="containerStyle">
              <div class="w-full h-full flex items-center justify-center text-gray-400">
                Content Area
              </div>
              <div :style="ribbonStyle">{{ text }}</div>
            </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">参数设置</h3>

              <div class="space-y-4">
                <!-- Text -->
                <div>
                  <div class="text-sm text-gray-600 mb-1">文字内容</div>
                  <el-input v-model="text" />
                </div>

                <!-- Position -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">位置</div>
                  <el-radio-group v-model="position">
                    <el-radio-button label="left">左上角</el-radio-button>
                    <el-radio-button label="right">右上角</el-radio-button>
                  </el-radio-group>
                </div>

                <!-- Colors -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-600 mb-1">背景色</div>
                    <el-color-picker v-model="color" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-600 mb-1">文字颜色</div>
                    <el-color-picker v-model="textColor" />
                  </div>
                </div>

                <!-- Width -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>宽度</span>
                    <span>{{ ribbonWidth }}px</span>
                  </div>
                  <el-slider v-model="ribbonWidth" :min="100" :max="300" />
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
