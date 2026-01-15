<!--
 * @file MarkdownTable.vue
 * @description Markdown 表格生成器，可视化编辑表格并生成 Markdown 代码
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Delete, Plus, RefreshLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'

const route = useRoute()
const { toClipboard } = useClipboard()

const rows = ref(3)
const cols = ref(3)
const tableData = ref([
  ['Header 1', 'Header 2', 'Header 3'],
  ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
  ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
])
const alignments = ref(['left', 'left', 'left']) // left, center, right

const addRow = () => {
  rows.value++
  tableData.value.push(new Array(cols.value).fill(''))
}

const removeRow = (index: number) => {
  if (rows.value <= 2) return // Keep header + 1 row
  rows.value--
  tableData.value.splice(index, 1)
}

const addCol = () => {
  cols.value++
  alignments.value.push('left')
  tableData.value.forEach(row => row.push(''))
}

const removeCol = (index: number) => {
  if (cols.value <= 1) return
  cols.value--
  alignments.value.splice(index, 1)
  tableData.value.forEach(row => row.splice(index, 1))
}

const setAlignment = (colIndex: number, align: string) => {
  alignments.value[colIndex] = align
}

const markdownCode = computed(() => {
  let md = '| ' + tableData.value[0].join(' | ') + ' |\n'
  
  // Separator row
  md += '| ' + alignments.value.map(align => {
    if (align === 'center') return ':---:'
    if (align === 'right') return '---:'
    return ':---'
  }).join(' | ') + ' |\n'
  
  // Data rows
  for (let i = 1; i < rows.value; i++) {
    md += '| ' + tableData.value[i].join(' | ') + ' |\n'
  }
  
  return md
})

const copyCode = async () => {
  try {
    await toClipboard(markdownCode.value)
    ElMessage.success('Markdown 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const resetTable = () => {
  rows.value = 3
  cols.value = 3
  tableData.value = [
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
  ]
  alignments.value = ['left', 'left', 'left']
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">Markdown 表格生成器</h2>
          <p class="text-gray-500 text-sm">可视化编辑表格，自动生成 Markdown 格式代码</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          <!-- Editor -->
          <div class="flex-1 overflow-x-auto">
            <div class="mb-4 flex gap-2">
              <el-button type="primary" :icon="Plus" @click="addRow">添加行</el-button>
              <el-button type="primary" :icon="Plus" @click="addCol">添加列</el-button>
              <el-button type="info" :icon="RefreshLeft" @click="resetTable">重置</el-button>
            </div>

            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th v-for="(col, index) in cols" :key="index" class="p-2 border border-gray-300 bg-gray-50 min-w-[150px]">
                    <div class="flex flex-col gap-2">
                      <div class="flex justify-center gap-1 mb-1">
                        <button 
                          class="p-1 rounded hover:bg-gray-200" 
                          :class="{ 'text-blue-500 bg-blue-50': alignments[index] === 'left' }"
                          @click="setAlignment(index, 'left')"
                          title="Left Align"
                        >
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm0-4h12v-2H3v2zm0-4h18v-2H3v2zm0-4h12V7H3v2zm0-6v2h18V3H3z"/></svg>
                        </button>
                        <button 
                          class="p-1 rounded hover:bg-gray-200" 
                          :class="{ 'text-blue-500 bg-blue-50': alignments[index] === 'center' }"
                          @click="setAlignment(index, 'center')"
                          title="Center Align"
                        >
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm4-4h10v-2H7v2zm-4-4h18v-2H3v2zm4-4h10V7H7v2zM3 3v2h18V3H3z"/></svg>
                        </button>
                        <button 
                          class="p-1 rounded hover:bg-gray-200" 
                          :class="{ 'text-blue-500 bg-blue-50': alignments[index] === 'right' }"
                          @click="setAlignment(index, 'right')"
                          title="Right Align"
                        >
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
                        </button>
                        <button class="text-red-400 hover:text-red-600 ml-2" @click="removeCol(index)" v-if="cols > 1">
                          <el-icon><Delete /></el-icon>
                        </button>
                      </div>
                      <input 
                        v-model="tableData[0][index]" 
                        class="w-full p-1 text-center font-bold bg-transparent outline-none border-b border-transparent focus:border-blue-500" 
                        placeholder="Header"
                      />
                    </div>
                  </th>
                  <th class="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in rows - 1" :key="rowIndex">
                  <td v-for="(col, colIndex) in cols" :key="colIndex" class="p-2 border border-gray-300">
                    <input 
                      v-model="tableData[rowIndex + 1][colIndex]" 
                      class="w-full p-1 outline-none focus:bg-blue-50 rounded transition-colors"
                      :class="{
                        'text-left': alignments[colIndex] === 'left',
                        'text-center': alignments[colIndex] === 'center',
                        'text-right': alignments[colIndex] === 'right',
                      }"
                    />
                  </td>
                  <td class="p-2 text-center">
                    <button class="text-red-400 hover:text-red-600" @click="removeRow(rowIndex + 1)" v-if="rows > 2">
                      <el-icon><Delete /></el-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Preview & Code -->
          <div class="w-full lg:w-96 flex flex-col gap-4">
            <div class="bg-gray-50 rounded-xl border border-gray-100 p-4 sticky top-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-800">Markdown 代码</h3>
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCode">复制</el-button>
              </div>
              <textarea 
                class="w-full h-64 p-3 bg-white border border-gray-200 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
                readonly
                :value="markdownCode"
              ></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>