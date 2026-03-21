<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">SQL 格式化工具</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线 SQL 代码美化、压缩和格式化工具。</p>
        </div>

        <div class="max-w-5xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 输入区 -->
            <div class="flex flex-col h-[500px]">
              <div class="flex justify-between items-center mb-2">
                <label class="text-gray-700 font-medium">输入 SQL</label>
                <button @click="inputSql = ''" class="text-xs text-gray-500 hover:text-red-500">清空</button>
              </div>
              <textarea
                v-model="inputSql"
                class="flex-1 p-4 bg-gray-50 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="SELECT * FROM table WHERE id = 1..."
              ></textarea>
            </div>

            <!-- 输出区 -->
            <div class="flex flex-col h-[500px]">
              <div class="flex justify-between items-center mb-2">
                <label class="text-gray-700 font-medium">格式化结果</label>
                <button @click="copyResult" class="text-xs text-blue-600 hover:text-blue-700">复制结果</button>
              </div>
              <textarea
                readonly
                v-model="outputSql"
                class="flex-1 p-4 bg-gray-900 text-green-400 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>
          </div>

          <!-- 操作栏 -->
          <div class="flex justify-center gap-4 mt-8">
            <button @click="formatSql" class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              格式化 SQL
            </button>
            <button @click="compressSql" class="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              压缩 SQL
            </button>
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

const route = useRoute()
const inputSql = ref('')
const outputSql = ref('')

const keywords = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'INNER JOIN', 'OUTER JOIN', 'ON', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'Create TABLE', 'DROP TABLE', 'ALTER TABLE', 'ADD',
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'NOT NULL', 'NULL', 'DEFAULT', 'AUTO_INCREMENT'
]

const formatSql = () => {
  if (!inputSql.value) return
  
  let sql = inputSql.value
    // Remove comments
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Normalize spaces
    .replace(/\s+/g, ' ')
    .trim()

  // Capitalize keywords
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi')
    sql = sql.replace(regex, kw)
  })

  // Add newlines and indentation
  sql = sql
    .replace(/\s+(SELECT|FROM|WHERE|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM|(?:LEFT |RIGHT |INNER |OUTER )?JOIN)\s+/g, '\n$1 ')
    .replace(/\s+(ON)\s+/g, '\n  $1 ')
    .replace(/\(/g, ' (\n  ')
    .replace(/\)/g, '\n)')
    .replace(/,\s+/g, ',\n  ')
    
  // Fix indentation for nested parens (simple fix)
  const lines = sql.split('\n')
  let indentLevel = 0
  outputSql.value = lines.map(line => {
    line = line.trim()
    if (line.startsWith(')')) indentLevel = Math.max(0, indentLevel - 1)
    const indent = '  '.repeat(indentLevel)
    if (line.endsWith('(')) indentLevel++
    return indent + line
  }).join('\n')
}

const compressSql = () => {
  if (!inputSql.value) return
  outputSql.value = inputSql.value
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const copyResult = () => {
  if (!outputSql.value) return
  navigator.clipboard.writeText(outputSql.value).then(() => {
    ElMessage.success('复制成功')
  })
}
</script>