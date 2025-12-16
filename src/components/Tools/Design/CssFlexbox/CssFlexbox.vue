<!--
 * @file CssFlexbox.vue
 * @description CSS Flexbox 布局生成器，可视化调整 Flex 容器和项目属性
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

// Container Properties
const flexDirection = ref('row')
const flexWrap = ref('nowrap')
const justifyContent = ref('flex-start')
const alignItems = ref('stretch')
const alignContent = ref('stretch')
const gap = ref(10)

// Items
const itemCount = ref(4)

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: flexDirection.value as any,
  flexWrap: flexWrap.value as any,
  justifyContent: justifyContent.value as any,
  alignItems: alignItems.value as any,
  alignContent: alignContent.value as any,
  gap: `${gap.value}px`,
  width: '100%',
  minHeight: '300px',
  backgroundColor: '#f3f4f6',
  padding: '20px',
  borderRadius: '8px',
  border: '1px dashed #d1d5db'
}))

const itemStyle = {
  width: '80px',
  height: '80px',
  backgroundColor: '#3b82f6',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '4px',
  fontSize: '24px',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}

const cssCode = computed(() => {
  return `.container {
  display: flex;
  flex-direction: ${flexDirection.value};
  flex-wrap: ${flexWrap.value};
  justify-content: ${justifyContent.value};
  align-items: ${alignItems.value};
  align-content: ${alignContent.value};
  gap: ${gap.value}px;
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS Flexbox 生成器</h2>
          <p class="text-gray-500 text-sm">可视化调整 CSS Flexbox 布局属性，实时预览布局效果并生成代码</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Preview -->
          <div class="flex-1">
            <div class="bg-white rounded-xl border border-gray-100 p-4 min-h-[400px]">
              <div :style="containerStyle">
                <div v-for="n in itemCount" :key="n" :style="itemStyle">
                  {{ n }}
                </div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <span class="text-sm text-gray-600">子元素数量: {{ itemCount }}</span>
              <div class="space-x-2">
                <el-button size="small" @click="itemCount = Math.max(1, itemCount - 1)"
                  :disabled="itemCount <= 1">-</el-button>
                <el-button size="small" @click="itemCount = Math.min(20, itemCount + 1)"
                  :disabled="itemCount >= 20">+</el-button>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 h-[500px] overflow-y-auto custom-scrollbar">
              <h3 class="font-bold text-gray-800 mb-4 sticky top-0 bg-gray-50 py-2">容器属性</h3>

              <div class="space-y-4">
                <!-- flex-direction -->
                <div>
                  <div class="text-xs font-bold text-gray-500 mb-2">flex-direction</div>
                  <el-radio-group v-model="flexDirection" size="small">
                    <el-radio-button label="row">row</el-radio-button>
                    <el-radio-button label="row-reverse">row-rev</el-radio-button>
                    <el-radio-button label="column">col</el-radio-button>
                    <el-radio-button label="column-reverse">col-rev</el-radio-button>
                  </el-radio-group>
                </div>

                <!-- flex-wrap -->
                <div>
                  <div class="text-xs font-bold text-gray-500 mb-2">flex-wrap</div>
                  <el-radio-group v-model="flexWrap" size="small">
                    <el-radio-button label="nowrap">nowrap</el-radio-button>
                    <el-radio-button label="wrap">wrap</el-radio-button>
                    <el-radio-button label="wrap-reverse">wrap-rev</el-radio-button>
                  </el-radio-group>
                </div>

                <!-- justify-content -->
                <div>
                  <div class="text-xs font-bold text-gray-500 mb-2">justify-content</div>
                  <el-select v-model="justifyContent" size="small" class="w-full">
                    <el-option value="flex-start" label="flex-start" />
                    <el-option value="flex-end" label="flex-end" />
                    <el-option value="center" label="center" />
                    <el-option value="space-between" label="space-between" />
                    <el-option value="space-around" label="space-around" />
                    <el-option value="space-evenly" label="space-evenly" />
                  </el-select>
                </div>

                <!-- align-items -->
                <div>
                  <div class="text-xs font-bold text-gray-500 mb-2">align-items</div>
                  <el-select v-model="alignItems" size="small" class="w-full">
                    <el-option value="stretch" label="stretch" />
                    <el-option value="flex-start" label="flex-start" />
                    <el-option value="flex-end" label="flex-end" />
                    <el-option value="center" label="center" />
                    <el-option value="baseline" label="baseline" />
                  </el-select>
                </div>

                <!-- align-content -->
                <div>
                  <div class="text-xs font-bold text-gray-500 mb-2">align-content (Multi-line)</div>
                  <el-select v-model="alignContent" size="small" class="w-full">
                    <el-option value="stretch" label="stretch" />
                    <el-option value="flex-start" label="flex-start" />
                    <el-option value="flex-end" label="flex-end" />
                    <el-option value="center" label="center" />
                    <el-option value="space-between" label="space-between" />
                    <el-option value="space-around" label="space-around" />
                  </el-select>
                </div>

                <!-- gap -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>gap</span>
                    <span>{{ gap }}px</span>
                  </div>
                  <el-slider v-model="gap" :min="0" :max="50" />
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

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
