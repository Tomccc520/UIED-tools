<!--
 * @file JsonToExcel.vue
 * @description JSON转Excel工具组件
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">JSON转Excel</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线将JSON数据转换为Excel文件，支持数组格式JSON，本地处理更安全。</p>
        </div>

        <div class="space-y-6">
          <div class="relative">
            <el-input v-model="jsonContent" type="textarea" :rows="15"
              placeholder="请输入JSON数组，例如：[{'name': 'Tom', 'age': 18}, {'name': 'Jerry', 'age': 20}]" />
            <div class="absolute top-2 right-2 space-x-2">
              <el-button type="primary" link @click="formatJson">格式化</el-button>
              <el-button type="primary" link @click="clearJson">清空</el-button>
            </div>
          </div>

          <div class="flex justify-center">
            <el-button type="primary" size="large" @click="convertAndDownload" :disabled="!jsonContent">
              转换并下载Excel
            </el-button>
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
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const jsonContent = ref('')

const guideSteps = [
  { title: '输入JSON', description: '在输入框中粘贴或输入JSON数组数据，例如 [{"name": "Tom", "age": 18}, ...]。' },
  { title: '格式化(可选)', description: '点击右上角的“格式化”按钮，美化JSON代码以便于阅读和检查。' },
  { title: '转换下载', description: '点击“转换并下载Excel”按钮，系统将自动生成并下载.xlsx文件。' }
]

const guideNotes = [
  '输入的JSON必须是数组格式（Array），每个元素是一个对象。',
  '对象的键（Key）将作为Excel的表头（Header）。',
  '支持嵌套对象，但建议使用扁平结构的JSON以获得最佳的Excel展示效果。',
  '所有处理均在本地完成，数据不会上传到服务器。'
]

const formatJson = () => {
  try {
    const obj = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(obj, null, 2)
  } catch (e) {
    ElMessage.error('JSON格式错误')
  }
}

const clearJson = () => {
  jsonContent.value = ''
}

const convertAndDownload = () => {
  try {
    const data = JSON.parse(jsonContent.value)
    if (!Array.isArray(data)) {
      ElMessage.error('JSON必须是数组格式')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, "data.xlsx")
    ElMessage.success('下载成功')
  } catch (e) {
    console.error(e)
    ElMessage.error('转换失败，请检查JSON格式')
  }
}
</script>
