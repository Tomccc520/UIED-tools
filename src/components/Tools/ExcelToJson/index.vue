<!--
 * @file ExcelToJson.vue
 * @description Excel转JSON工具组件
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">Excel转JSON</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线将Excel文件转换为JSON格式，支持.xlsx, .xls格式，本地处理更安全。</p>
        </div>

        <div v-if="!file">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-green-400"
            :class="isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept=".xlsx, .xls"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽Excel文件到这里</div>
              <p class="text-xs text-gray-400">支持 .xlsx, .xls 格式</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div class="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
            <span class="text-gray-700 font-medium">{{ file.name }}</span>
            <div class="space-x-4">
              <el-button type="danger" link @click="clearFile">重新上传</el-button>
              <el-button type="primary" @click="downloadJson">下载JSON</el-button>
            </div>
          </div>

          <div class="relative">
            <el-input v-model="jsonContent" type="textarea" :rows="20" readonly placeholder="转换结果将显示在这里" />
            <el-button class="absolute top-2 right-2" type="primary" link @click="copyJson">复制</el-button>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
      <UsageGuide :steps="guideSteps" :notes="guideNotes" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'
import useClipboard from 'vue-clipboard3'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const { toClipboard } = useClipboard()
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const jsonContent = ref('')

const guideSteps = [
  { title: '上传Excel文件', description: '点击上传区域或直接拖拽Excel文件（.xlsx或.xls）到指定区域。' },
  { title: '查看JSON结果', description: '系统将自动解析Excel文件并在下方显示转换后的JSON数据。' },
  { title: '下载或复制', description: '点击“下载JSON”保存文件，或点击“复制”按钮将内容复制到剪贴板。' }
]

const guideNotes = [
  '支持 .xlsx 和 .xls 格式的Excel文件。',
  '默认读取第一个工作表（Sheet1）的数据。',
  '第一行将被作为JSON对象的键（Key）。',
  '所有处理均在本地完成，数据不会上传到服务器。'
]

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls')) {
      file.value = droppedFile
      processFile(droppedFile)
    } else {
      ElMessage.error('请上传Excel文件')
    }
  }
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
    processFile(target.files[0])
  }
}

const processFile = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)
      jsonContent.value = JSON.stringify(jsonData, null, 2)
      ElMessage.success('转换成功')
    } catch (error) {
      console.error(error)
      ElMessage.error('文件解析失败')
    }
  }
  reader.readAsArrayBuffer(file)
}

const clearFile = () => {
  file.value = null
  jsonContent.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const downloadJson = () => {
  if (!jsonContent.value) return
  const blob = new Blob([jsonContent.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.value ? `${file.value.name.split('.')[0]}.json` : 'data.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const copyJson = async () => {
  if (!jsonContent.value) return
  try {
    await toClipboard(jsonContent.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>
