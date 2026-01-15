<!--
 * @file UrlEncoder.vue
 * @description URL 编码/解码工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Delete, Refresh, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const input = ref('')
const output = ref('')
const mode = ref<'encode' | 'decode'>('encode')

const process = () => {
  if (!input.value) {
    output.value = ''
    return
  }
  
  try {
    if (mode.value === 'encode') {
      output.value = encodeURIComponent(input.value)
    } else {
      output.value = decodeURIComponent(input.value)
    }
    ElMessage.success(mode.value === 'encode' ? '编码成功' : '解码成功')
  } catch (e) {
    ElMessage.error('处理失败，请检查输入内容')
  }
}

const switchMode = () => {
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
  // Swap input/output if output exists
  if (output.value) {
    input.value = output.value
    process()
  }
}

const copyResult = async () => {
  if (!output.value) return
  try {
    await toClipboard(output.value)
    ElMessage.success('结果已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const clearAll = () => {
  input.value = ''
  output.value = ''
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm">
        <div class="text-center py-8 px-4">
          <h2 class="text-3xl font-bold mb-3 text-gray-800">URL 编码/解码</h2>
          <p class="text-gray-500 text-sm mt-4">在线 URL Encode / Decode 工具，支持 UTF-8 编码</p>
        </div>

        <div class="px-8 pb-8">
          <div class="flex flex-col gap-6">
            <!-- Controls -->
            <div class="flex justify-center gap-4">
              <el-radio-group v-model="mode" @change="process">
                <el-radio-button label="encode">URL 编码</el-radio-button>
                <el-radio-button label="decode">URL 解码</el-radio-button>
              </el-radio-group>
              <el-button @click="switchMode">
                <el-icon class="mr-1"><Switch /></el-icon>交换模式
              </el-button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Input -->
              <div class="flex flex-col">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-gray-700">输入</label>
                  <el-button type="danger" link @click="clearAll" size="small">
                    <el-icon class="mr-1"><Delete /></el-icon>清空
                  </el-button>
                </div>
                <el-input
                  v-model="input"
                  type="textarea"
                  :rows="8"
                  placeholder="在此输入内容..."
                  resize="none"
                  @input="process"
                />
              </div>

              <!-- Output -->
              <div class="flex flex-col">
                <div class="flex justify-between items-center mb-2">
                  <label class="text-sm font-medium text-gray-700">结果</label>
                  <el-button type="primary" link @click="copyResult" :disabled="!output">
                    <el-icon class="mr-1"><CopyDocument /></el-icon>复制
                  </el-button>
                </div>
                <el-input
                  v-model="output"
                  type="textarea"
                  :rows="8"
                  readonly
                  placeholder="处理结果将显示在这里..."
                  resize="none"
                  class="bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend />
  </div>
</template>
