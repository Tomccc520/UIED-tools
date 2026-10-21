<!--
 * @file CsvToExcel.vue
 * @description CSV转Excel工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">CSV转Excel</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线将CSV文件转换为Excel (.xlsx)格式，自动处理编码问题，本地处理更安全。</p>
        </div>

        <div v-if="!file">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-green-400"
            :class="isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept=".csv"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽CSV文件到这里</div>
              <p class="text-xs text-gray-400">支持 .csv 格式</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span class="text-gray-700 font-medium">{{ file.name }}</span>
            <div class="space-x-4">
              <el-button type="danger" link @click="clearFile">重新上传</el-button>
              <el-button type="primary" :disabled="isReading || !workbook" @click="downloadExcel">下载Excel</el-button>
            </div>
          </div>

          <p v-if="isReading" role="status" class="text-sm text-gray-500">正在读取并解析文件，请稍候…</p>
          <p v-else-if="readError" role="alert" class="text-sm text-red-600">{{ readError }}</p>

          <!-- 预览前10行 -->
          <div class="overflow-x-auto border rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="(header, index) in previewHeaders" :key="index"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex"
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="totalRows > 10" class="p-3 text-center text-sm text-gray-400 bg-gray-50">
              仅显示前10行预览，共 {{ totalRows }} 行
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />

      <!-- 使用说明 -->
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import type { WorkBook } from 'xlsx'
import { ElMessage } from 'element-plus'
import { ensureXlsxRuntime } from '@/utils/toolRuntimeLoaders'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import { useSpreadsheetRead } from '../Spreadsheet/useSpreadsheetRead'

const route = useRoute()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const previewHeaders = ref<string[]>([])
const previewRows = ref<any[]>([])
const totalRows = ref(0)
const workbook = ref<WorkBook | null>(null)

const guideSteps = [
  { title: '上传CSV文件', description: '点击上传区域或直接拖拽CSV文件（.csv）到指定区域。' },
  { title: '预览数据', description: '系统将自动解析CSV文件并显示前10行数据供您预览检查。' },
  { title: '下载Excel', description: '点击“下载Excel”按钮，系统将自动转换并下载.xlsx文件。' }
]

const guideNotes = [
  '支持标准的CSV格式文件（逗号分隔）。',
  '自动识别并处理中文编码，避免乱码问题。',
  '预览仅显示前10行，下载时将包含所有数据。',
  '所有处理均在本地完成，数据不会上传到服务器。'
]

/** 接收拖拽的表格文件，复用当前文件读取入口。 */
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile)
    } else {
      ElMessage.error('请上传CSV文件')
    }
  }
}

/** 接收文件选择并立即清空输入值，允许失败后重选同一文件。 */
const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    processFile(target.files[0])
    target.value = ''
  }
}

/** 清除当前表格预览和导出产物，避免新文件读取期间保留旧数据。 */
const resetResult = () => {
  previewHeaders.value = []
  previewRows.value = []
  totalRows.value = 0
  workbook.value = null
}

const { isReading, readError, readFile, cancelRead } = useSpreadsheetRead({
  mode: 'binary',
  /** 纯解析文件数据，异步加载后不直接写入页面状态。 */
  async parse(data) {
    const { XLSX } = await ensureXlsxRuntime()
    const parsedWorkbook = XLSX.read(data, { type: 'binary' })
    const firstSheetName = parsedWorkbook.SheetNames[0]
    if (!firstSheetName) throw new Error('Workbook has no worksheet')
    const jsonData = XLSX.utils.sheet_to_json<string[]>(parsedWorkbook.Sheets[firstSheetName], { header: 1 })
    return { parsedWorkbook, jsonData }
  },
  /** 读取器确认版本有效后，一次性提交当前文件的工作簿和预览。 */
  onSuccess({ parsedWorkbook, jsonData }) {
    workbook.value = parsedWorkbook
    previewHeaders.value = jsonData[0] ?? []
    previewRows.value = jsonData.slice(1, 11)
    totalRows.value = jsonData.length
    ElMessage.success('解析成功')
  },
  reset: resetResult
})

/** 选择新文件时设置其名称，取消旧任务并开始独立读取。 */
const processFile = (selectedFile: File) => {
  file.value = selectedFile
  readFile(selectedFile)
}

/** 清空文件、产物及读取版本，阻止已经排队的旧回调恢复内容。 */
const clearFile = () => {
  cancelRead()
  file.value = null
  resetResult()
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * 下载转换后的 Excel 文件
 */
const downloadExcel = async () => {
  if (isReading.value || !workbook.value || !file.value) return
  const selectedFile = file.value
  const selectedWorkbook = workbook.value
  try {
    const { XLSX } = await ensureXlsxRuntime()
    if (isReading.value || file.value !== selectedFile || workbook.value !== selectedWorkbook) return
    XLSX.writeFile(selectedWorkbook, `${selectedFile.name.replace(/\.[^.]+$/, '')}.xlsx`)
    ElMessage.success('下载成功')
  } catch (error) {
    if (isReading.value || file.value !== selectedFile || workbook.value !== selectedWorkbook) return
    console.error('[CsvToExcel] 导出失败', error)
    ElMessage.error('文件导出失败，请重试')
  }
}
</script>
