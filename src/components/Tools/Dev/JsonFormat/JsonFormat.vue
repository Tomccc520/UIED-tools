<!--
 * @file JsonFormat.vue
 * @description JSON 格式化工具，支持压缩、格式化、错误检查
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Delete, DocumentChecked, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const jsonInput = ref('')
const jsonOutput = ref('')
const errorMsg = ref('')
const indentSize = ref(2)

const formatJson = () => {
  errorMsg.value = ''
  if (!jsonInput.value) {
    jsonOutput.value = ''
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed, null, indentSize.value)
    ElMessage.success('格式化成功')
  } catch (e: any) {
    errorMsg.value = '无效的 JSON: ' + e.message
    ElMessage.error('格式化失败，请检查 JSON 格式')
  }
}

const compressJson = () => {
  errorMsg.value = ''
  if (!jsonInput.value) {
    jsonOutput.value = ''
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonOutput.value = JSON.stringify(parsed)
    ElMessage.success('压缩成功')
  } catch (e: any) {
    errorMsg.value = '无效的 JSON: ' + e.message
    ElMessage.error('压缩失败，请检查 JSON 格式')
  }
}

const copyResult = async () => {
  if (!jsonOutput.value) return
  try {
    await toClipboard(jsonOutput.value)
    ElMessage.success('结果已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const clearAll = () => {
  jsonInput.value = ''
  jsonOutput.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm">
        <div class="text-center py-8 px-4">
          <h2 class="text-3xl font-bold mb-3 text-gray-800">JSON 格式化工具</h2>
          <p class="text-gray-500 text-sm mt-4">在线 JSON 代码格式化、验证、压缩工具</p>
        </div>

        <div class="px-8 pb-8">
          <div class="flex flex-col lg:flex-row gap-6 h-[600px]">
            <!-- Input -->
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-gray-700">输入 JSON</label>
                <div class="flex gap-2">
                  <el-button type="danger" link @click="clearAll" size="small">
                    <el-icon class="mr-1">
                      <Delete />
                    </el-icon>清空
                  </el-button>
                </div>
              </div>
              <el-input v-model="jsonInput" type="textarea" class="flex-1 !h-full"
                :input-style="{ height: '100%', fontFamily: 'monospace' }" placeholder="在此粘贴 JSON 代码..."
                resize="none" />
            </div>

            <!-- Controls -->
            <div class="flex lg:flex-col justify-center gap-4 items-center">
              <el-select v-model="indentSize" class="w-32" placeholder="缩进">
                <el-option label="2 空格缩进" :value="2" />
                <el-option label="4 空格缩进" :value="4" />
                <el-option label="Tab 缩进" :value="'\t'" />
              </el-select>
              <el-button type="primary" @click="formatJson">
                <el-icon class="mr-1">
                  <MagicStick />
                </el-icon>格式化
              </el-button>
              <el-button type="success" @click="compressJson">
                <el-icon class="mr-1">
                  <DocumentChecked />
                </el-icon>压缩
              </el-button>
            </div>

            <!-- Output -->
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-gray-700">结果</label>
                <el-button type="primary" link @click="copyResult" :disabled="!jsonOutput">
                  <el-icon class="mr-1">
                    <CopyDocument />
                  </el-icon>复制
                </el-button>
              </div>
              <div class="flex-1 relative border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                <textarea v-model="jsonOutput"
                  class="w-full h-full p-3 font-mono text-sm bg-transparent outline-none resize-none" readonly
                  placeholder="格式化结果将显示在这里..."></textarea>
                <div v-if="errorMsg"
                  class="absolute bottom-0 left-0 right-0 bg-red-100 text-red-600 p-2 text-xs border-t border-red-200">
                  {{ errorMsg }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend />
  </div>
</template>
