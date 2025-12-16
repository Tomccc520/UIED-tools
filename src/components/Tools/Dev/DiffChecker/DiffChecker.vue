<!--
 * @file DiffChecker.vue
 * @description 文本对比工具，比较两段文本的差异
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete, Refresh } from '@element-plus/icons-vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { diffLines } from 'diff'

const oldText = ref('')
const newText = ref('')
const diffResult = ref<any[]>([])

const compareText = () => {
  if (!oldText.value && !newText.value) {
    diffResult.value = []
    return
  }
  
  const diff = diffLines(oldText.value, newText.value)
  diffResult.value = diff
}

watch([oldText, newText], () => {
  compareText()
})

const clearAll = () => {
  oldText.value = ''
  newText.value = ''
  diffResult.value = []
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm">
        <div class="text-center py-8 px-4">
          <h2 class="text-3xl font-bold mb-3 text-gray-800">文本对比工具</h2>
          <p class="text-gray-500 text-sm mt-4">在线比较两段文本的差异，高亮显示新增和删除的内容</p>
        </div>

        <div class="px-8 pb-8">
          <div class="flex justify-end mb-4">
             <el-button type="danger" link @click="clearAll">
              <el-icon class="mr-1"><Delete /></el-icon>清空所有
            </el-button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Left Input -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-2">原始文本</label>
              <el-input
                v-model="oldText"
                type="textarea"
                :rows="10"
                placeholder="在此输入原始文本..."
                resize="none"
              />
            </div>

            <!-- Right Input -->
            <div class="flex flex-col">
              <label class="text-sm font-medium text-gray-700 mb-2">新文本</label>
              <el-input
                v-model="newText"
                type="textarea"
                :rows="10"
                placeholder="在此输入新文本..."
                resize="none"
              />
            </div>
          </div>

          <!-- Result -->
          <div class="border border-gray-200 rounded-lg overflow-hidden" v-if="diffResult.length > 0">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">
              对比结果
            </div>
            <div class="p-4 bg-white font-mono text-sm whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              <span
                v-for="(part, index) in diffResult"
                :key="index"
                :class="{
                  'bg-green-100 text-green-800': part.added,
                  'bg-red-100 text-red-800': part.removed,
                  'text-gray-800': !part.added && !part.removed
                }"
              >{{ part.value }}</span>
            </div>
          </div>
          
           <div v-else class="text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            输入文本后自动开始对比
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend />
  </div>
</template>
