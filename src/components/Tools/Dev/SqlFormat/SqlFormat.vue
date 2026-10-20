<template>
  <div class="min-h-screen sql-format-page">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h1 class="text-2xl sm:text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-4 sm:px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">SQL 格式化工具</span>
            </div>
          </h1>
          <p class="text-gray-500 text-sm mt-6">在线 SQL 代码美化、压缩和格式化工具。</p>
        </div>

        <div class="max-w-5xl mx-auto">
          <div class="sql-workspace">
            <!-- 输入区 -->
            <div class="sql-pane sql-pane--input flex flex-col min-w-0 h-[500px]">
              <div class="flex justify-between items-center mb-2">
                <label for="sql-input" class="text-gray-700 font-medium">输入 SQL</label>
                <button type="button" @click="inputSql = ''" class="text-xs text-gray-500 hover:text-red-500">清空</button>
              </div>
              <textarea
                id="sql-input"
                v-model="inputSql"
                class="flex-1 min-w-0 w-full p-4 bg-gray-50 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                :aria-describedby="errorMessage ? 'sql-error' : undefined"
                placeholder="SELECT * FROM table WHERE id = 1..."
              ></textarea>
            </div>

            <!-- 操作栏 -->
            <p v-if="errorMessage" id="sql-error" role="alert" class="sql-error mt-4 text-sm text-red-600">{{ errorMessage }}</p>
            <div class="sql-actions flex flex-wrap justify-center gap-4 mt-8">
              <button type="button" @click="formatSql" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                格式化 SQL
              </button>
              <button type="button" @click="compressSql" class="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                压缩 SQL
              </button>
            </div>

            <!-- 输出区 -->
            <div class="sql-pane sql-pane--result flex flex-col min-w-0 h-[500px]">
              <div class="flex justify-between items-center mb-2">
                <label for="sql-output" class="text-gray-700 font-medium">格式化结果</label>
                <button type="button" @click="copyResult" :disabled="!outputSql" class="text-xs text-blue-600 hover:text-blue-700">复制结果</button>
              </div>
              <textarea
                id="sql-output"
                readonly
                v-model="outputSql"
                class="flex-1 min-w-0 w-full p-4 bg-gray-900 text-green-400 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { compressSqlText, formatSqlText } from '@/utils/sqlFormatting'

const route = useRoute()
const inputSql = ref('')
const outputSql = ref('')
const errorMessage = ref('')

/** 格式化输入 SQL，成功后才替换输出；错误时保留输入和已有结果。 */
const formatSql = () => {
  processSql(formatSqlText)
}

/** 压缩输入 SQL 的语法空白，保留引号内容和注释语义。 */
const compressSql = () => {
  processSql(compressSqlText)
}

/** 执行指定 SQL 转换函数并展示中文错误，转换失败时不覆盖原文或上次结果。 */
const processSql = (transform: (source: string) => string) => {
  errorMessage.value = ''
  if (!inputSql.value.trim()) {
    errorMessage.value = '请先输入 SQL。'
    return
  }
  try {
    const result = transform(inputSql.value)
    outputSql.value = result
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'SQL 处理失败，请检查输入。'
  }
}

/** 复制当前结果到剪贴板；复制被浏览器拒绝时显示可理解的错误。 */
const copyResult = () => {
  if (!outputSql.value) return
  navigator.clipboard.writeText(outputSql.value).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败，请手动选择并复制结果')
  })
}
</script>

<style scoped>
.sql-format-page { container-type: inline-size; container-name: sql-format; min-width: 0; }
.sql-workspace {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-areas: "input result" "error error" "actions actions";
  gap: 0 24px;
}
.sql-pane--input { grid-area: input; }
.sql-pane--result { grid-area: result; }
.sql-actions { grid-area: actions; }
.sql-error { grid-area: error; overflow-wrap: anywhere; }
.sql-pane textarea { max-width: 100%; overflow: auto; }
.sql-pane button { min-height: 44px; padding: 8px; }
.sql-actions button { min-height: 44px; justify-content: center; }
.sql-format-page button:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 3px; }
.sql-pane button:disabled { cursor: not-allowed; opacity: .45; }
@container sql-format (max-width: 720px) {
  .sql-workspace { grid-template-columns: minmax(0, 1fr); grid-template-areas: "input" "actions" "error" "result"; gap: 16px; }
  .sql-pane { height: 320px; }
  .sql-pane textarea { padding: 12px; font-size: 16px; }
  .sql-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 0; }
  .sql-actions button { min-width: 0; padding-inline: 8px; font-size: 13px; }
  .sql-actions svg { display: none; }
  .sql-error { margin-top: 0; }
  .sql-format-page h1 { font-size: 26px; line-height: 1.3; }
  .sql-format-page h1 > div { padding-inline: 0; }
}
</style>
