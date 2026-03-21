<script setup lang="ts">
/**
 * @file GoldenRatio.vue
 * @description 黄金比例计算器，用于计算设计的黄金分割比
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

// 黄金比例常数
const GOLDEN_RATIO = 1.61803398875

// 当前输入模式
const activeInput = ref<'total' | 'long' | 'short'>('total')
const baseValue = ref<number>(1000)

// 计算结果
const results = computed(() => {
  let total = 0, long = 0, short = 0
  const val = baseValue.value || 0

  switch (activeInput.value) {
    case 'total':
      total = val
      long = val / GOLDEN_RATIO
      short = val - long
      break
    case 'long':
      long = val
      total = val * GOLDEN_RATIO
      short = total - long
      break
    case 'short':
      short = val
      long = val * GOLDEN_RATIO
      total = long + short
      break
  }

  return {
    total: Math.round(total * 100) / 100,
    long: Math.round(long * 100) / 100,
    short: Math.round(short * 100) / 100
  }
})

// 更新数值
const updateValue = (type: 'total' | 'long' | 'short', value: number) => {
  activeInput.value = type
  baseValue.value = value
}

// 复制数值
const copyValue = (val: number) => {
  navigator.clipboard.writeText(val.toString()).then(() => {
    ElMessage.success(`已复制数值: ${val}`)
  })
}

// 重置
const reset = () => {
  activeInput.value = 'total'
  baseValue.value = 1000
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">黄金比例计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">快速计算黄金分割数值，让设计更具美感 (1 : 1.618)</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 计算输入区 -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-gray-700">数值计算</h3>
              <el-button link type="primary" @click="reset">
                <el-icon class="mr-1">
                  <RefreshLeft />
                </el-icon> 重置
              </el-button>
            </div>

            <div class="space-y-6">
              <!-- 总宽度 (A + B) -->
              <div :class="{ 'opacity-100': activeInput === 'total', 'opacity-70': activeInput !== 'total' }"
                class="transition-opacity">
                <label class="block text-sm font-medium text-gray-600 mb-2">总宽度 (A + B)</label>
                <div class="flex items-center gap-2">
                  <el-input-number :model-value="activeInput === 'total' ? baseValue : results.total"
                    @update:model-value="(val: number) => updateValue('total', val)" class="w-full" :min="0" />
                  <el-button @click="copyValue(results.total)">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 长边 (A) -->
              <div :class="{ 'opacity-100': activeInput === 'long', 'opacity-70': activeInput !== 'long' }"
                class="transition-opacity">
                <label class="block text-sm font-medium text-gray-600 mb-2">长边 (A) - 61.8%</label>
                <div class="flex items-center gap-2">
                  <el-input-number :model-value="activeInput === 'long' ? baseValue : results.long"
                    @update:model-value="(val: number) => updateValue('long', val)" class="w-full" :min="0" />
                  <el-button @click="copyValue(results.long)">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 短边 (B) -->
              <div :class="{ 'opacity-100': activeInput === 'short', 'opacity-70': activeInput !== 'short' }"
                class="transition-opacity">
                <label class="block text-sm font-medium text-gray-600 mb-2">短边 (B) - 38.2%</label>
                <div class="flex items-center gap-2">
                  <el-input-number :model-value="activeInput === 'short' ? baseValue : results.short"
                    @update:model-value="(val: number) => updateValue('short', val)" class="w-full" :min="0" />
                  <el-button @click="copyValue(results.short)">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 可视化演示 -->
          <div
            class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
            <h3 class="font-bold text-gray-700 mb-6 w-full">可视化演示</h3>

            <div
              class="w-full aspect-[1.618/1] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative flex">
              <!-- 长边部分 -->
              <div class="h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold relative group"
                style="width: 61.8%">
                <span class="group-hover:hidden">A</span>
                <span class="hidden group-hover:block">{{ results.long }}</span>
                <div class="absolute bottom-2 text-xs opacity-50">61.8%</div>
              </div>

              <!-- 短边部分 -->
              <div class="h-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold relative group"
                style="width: 38.2%">
                <span class="group-hover:hidden">B</span>
                <span class="hidden group-hover:block">{{ results.short }}</span>
                <div class="absolute bottom-2 text-xs opacity-50">38.2%</div>
              </div>
            </div>

            <div class="mt-8 text-center text-gray-500 text-sm">
              <p>黄金比例 (φ) ≈ 1.618</p>
              <p class="mt-1">A / B = (A + B) / A = φ</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />

</template>


<style scoped>
:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
