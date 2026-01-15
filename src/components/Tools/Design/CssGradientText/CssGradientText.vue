<!--
 * @file CssGradientText.vue
 * @description CSS 渐变文字生成器，利用 background-clip: text 实现文字渐变效果
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

const text = ref('Gradient Text')
const fontSize = ref(60)
const color1 = ref('#8EC5FC')
const color2 = ref('#E0C3FC')
const direction = ref(45) // deg

const gradientValue = computed(() => {
  return `linear-gradient(${direction.value}deg, ${color1.value} 0%, ${color2.value} 100%)`
})

const previewStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  fontWeight: 'bold',
  background: gradientValue.value,
  '-webkit-background-clip': 'text',
  'background-clip': 'text',
  '-webkit-text-fill-color': 'transparent',
  'color': 'transparent', // Fallback
  display: 'inline-block'
}))

const cssCode = computed(() => {
  return `background: ${gradientValue.value};
-webkit-background-clip: text;
background-clip: text;
color: transparent;`
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 渐变文字生成器</h2>
          <p class="text-gray-500 text-sm">利用 background-clip: text 属性，快速生成炫酷的渐变色文字效果</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          <!-- Preview -->
          <div class="flex-1 bg-gray-50 rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px] overflow-hidden">
             <div :style="previewStyle" class="text-center break-words max-w-full">
                {{ text }}
             </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">
            
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">设置</h3>
              
              <div class="space-y-4">
                 <div>
                  <div class="text-sm text-gray-600 mb-1">文本内容</div>
                  <el-input v-model="text" />
                </div>
                
                 <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>字体大小</span>
                    <span>{{ fontSize }}px</span>
                  </div>
                  <el-slider v-model="fontSize" :min="12" :max="120" />
                </div>

                <!-- Colors -->
                <div class="grid grid-cols-2 gap-4">
                   <div>
                      <div class="text-sm text-gray-600 mb-1">起始颜色</div>
                      <el-color-picker v-model="color1" />
                   </div>
                   <div>
                      <div class="text-sm text-gray-600 mb-1">结束颜色</div>
                      <el-color-picker v-model="color2" />
                   </div>
                </div>

                <!-- Direction -->
                <div>
                   <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>渐变角度</span>
                    <span>{{ direction }}deg</span>
                  </div>
                  <el-slider v-model="direction" :min="0" :max="360" />
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
