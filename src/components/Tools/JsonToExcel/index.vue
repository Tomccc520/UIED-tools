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
          <h1 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">JSON转Excel</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">在线将JSON数据转换为Excel文件，支持数组格式JSON，本地处理更安全。</p>
        </div>

        <div class="space-y-6">
          <div class="relative">
            <el-input v-model="jsonContent" type="textarea" :rows="15" aria-label="JSON 数组"
              placeholder='请输入 JSON 对象数组，例如：[{"name":"Tom","age":18}]' />
            <div class="absolute top-2 right-2 space-x-2">
              <el-button type="primary" link :disabled="isConverting" @click="formatJson">格式化</el-button>
              <el-button type="primary" link @click="clearJson">清空</el-button>
            </div>
          </div>

          <p class="text-sm text-gray-500">长数字或高精度数值请加双引号，作为文本保留。嵌套对象和数组会作为 JSON 文本写入单元格。</p>
          <p v-if="errorMessage" role="alert" class="text-sm text-red-600">{{ errorMessage }}</p>
          <div class="flex justify-center">
            <el-button type="primary" size="large" @click="convertAndDownload" :loading="isConverting" :disabled="isConverting || !jsonContent.trim()">
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
import { onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ensureXlsxRuntime } from '@/utils/toolRuntimeLoaders'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'
import { formatJsonLosslessly } from '@/utils/losslessJson'
import { prepareJsonSpreadsheet } from './jsonSpreadsheet'

const route = useRoute()
const jsonContent = ref('')
const isConverting = ref(false)
const errorMessage = ref('')
let conversionVersion = 0
let disposed = false

/** 输入修改或清空时使迟到的转换失效，保留新内容并恢复当前操作入口。 */
watch(jsonContent, () => {
  conversionVersion += 1
  isConverting.value = false
  errorMessage.value = ''
}, { flush: 'sync' })

/** 离开工具后使未完成的运行时加载失效，不再下载或提示旧结果。 */
onUnmounted(() => { disposed = true; conversionVersion += 1 })

const guideSteps = [
  { title: '输入JSON', description: '在输入框中粘贴或输入JSON数组数据，例如 [{"name": "Tom", "age": 18}, ...]。' },
  { title: '格式化(可选)', description: '点击右上角的“格式化”按钮，美化JSON代码以便于阅读和检查。' },
  { title: '转换下载', description: '点击“转换并下载Excel”按钮，系统将自动生成并下载.xlsx文件。' }
]

const guideNotes = [
  '输入的JSON必须是数组格式（Array），每个元素是一个对象。',
  '对象的键（Key）将作为Excel的表头（Header）。',
  '嵌套对象和数组按 JSON 文本写入单元格；null 对应空单元格。',
  '超出安全范围的长数字或高精度数值请加双引号，作为文本导出。',
  '所有处理均在本地完成，数据不会上传到服务器。'
]

/**
 * 格式化 JSON 文本，方便用户校验内容结构
 */
const formatJson = () => {
  try {
    jsonContent.value = formatJsonLosslessly(jsonContent.value)
    errorMessage.value = ''
  } catch (e) {
    errorMessage.value = 'JSON 格式错误，请检查输入内容。'
    ElMessage.error('JSON格式错误')
  }
}

/**
 * 清空输入的 JSON 内容
 */
const clearJson = () => {
  jsonContent.value = ''
}

/**
 * 将 JSON 数组转换为 Excel 并下载
 * 在点击转换时按需加载 xlsx，避免页面初始加载大依赖
 */
const convertAndDownload = async () => {
  if (isConverting.value || !jsonContent.value.trim()) return
  const source = jsonContent.value
  const version = ++conversionVersion
  isConverting.value = true
  errorMessage.value = ''
  try {
    let data: ReturnType<typeof prepareJsonSpreadsheet>
    try { data = prepareJsonSpreadsheet(source) }
    catch (error) {
      errorMessage.value = error instanceof SyntaxError ? 'JSON 格式错误，请检查输入内容。' : (error as Error).message
      ElMessage.error(errorMessage.value)
      return
    }
    const { XLSX } = await ensureXlsxRuntime()
    if (disposed || version !== conversionVersion) return

    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")
    XLSX.writeFile(workbook, "data.xlsx")
    ElMessage.success('下载成功')
  } catch (e) {
    if (disposed || version !== conversionVersion) return
    console.error('[JsonToExcel] 导出失败', e)
    errorMessage.value = '转换失败，请重试。'
    ElMessage.error(errorMessage.value)
  } finally {
    if (!disposed && version === conversionVersion) isConverting.value = false
  }
}
</script>
