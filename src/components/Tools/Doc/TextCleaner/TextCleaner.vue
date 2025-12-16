<!--
 * @file TextCleaner.vue
 * @description 文本清洗工具，提供去重、去空行、去除HTML标签、大小写转换等功能
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Delete, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'

const route = useRoute()
const { toClipboard } = useClipboard()

const inputText = ref('')
const outputText = ref('')

// Options
const options = ref({
  removeEmptyLines: true,
  removeDuplicateLines: false,
  trimLines: true,
  removeHtmlTags: false,
  removePunctuation: false,
  toLowerCase: false,
  toUpperCase: false,
  replace: {
    enabled: false,
    from: '',
    to: ''
  }
})

const processText = () => {
  let text = inputText.value

  if (!text) {
    outputText.value = ''
    return
  }

  // Split into lines for line-based operations
  let lines = text.split('\n')

  if (options.value.trimLines) {
    lines = lines.map(line => line.trim())
  }

  if (options.value.removeEmptyLines) {
    lines = lines.filter(line => line.length > 0)
  }

  if (options.value.removeDuplicateLines) {
    lines = [...new Set(lines)]
  }

  text = lines.join('\n')

  // Global operations
  if (options.value.removeHtmlTags) {
    text = text.replace(/<[^>]*>?/gm, '')
  }

  if (options.value.removePunctuation) {
    text = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    text = text.replace(/[。，、？；：‘’“”【】（）《》——……]/g, '')
  }

  if (options.value.toLowerCase) {
    text = text.toLowerCase()
  } else if (options.value.toUpperCase) {
    text = text.toUpperCase()
  }

  if (options.value.replace.enabled && options.value.replace.from) {
    // Escape regex characters if needed, or use simple replaceAll
    text = text.split(options.value.replace.from).join(options.value.replace.to)
  }

  outputText.value = text
  ElMessage.success('处理完成')
}

const copyResult = async () => {
  try {
    await toClipboard(outputText.value)
    ElMessage.success('结果已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const clearAll = () => {
  inputText.value = ''
  outputText.value = ''
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">文本清洗工具</h2>
          <p class="text-gray-500 text-sm">一键去除空行、重复行、HTML标签，支持大小写转换和文本替换</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          
          <!-- Options Panel -->
          <div class="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-4">
              <h3 class="font-bold text-gray-800 mb-4">清洗选项</h3>
              
              <div class="space-y-4">
                <el-checkbox v-model="options.removeEmptyLines" label="去除空行" />
                <el-checkbox v-model="options.removeDuplicateLines" label="去除重复行" />
                <el-checkbox v-model="options.trimLines" label="去除首尾空格" />
                <el-checkbox v-model="options.removeHtmlTags" label="去除 HTML 标签" />
                <el-checkbox v-model="options.removePunctuation" label="去除标点符号" />
                
                <div class="border-t border-gray-200 pt-4">
                  <div class="text-sm font-medium mb-2">大小写转换</div>
                  <el-radio-group v-model="options.toLowerCase">
                    <el-radio :label="false">不转换</el-radio>
                    <el-radio :label="true" @change="options.toUpperCase = false">转小写</el-radio>
                  </el-radio-group>
                  <el-radio-group v-model="options.toUpperCase" class="mt-2">
                    <el-radio :label="true" @change="options.toLowerCase = false">转大写</el-radio>
                  </el-radio-group>
                </div>

                <div class="border-t border-gray-200 pt-4">
                  <el-checkbox v-model="options.replace.enabled" label="查找替换" />
                  <div v-if="options.replace.enabled" class="mt-2 space-y-2">
                    <el-input v-model="options.replace.from" placeholder="查找内容" size="small" />
                    <el-input v-model="options.replace.to" placeholder="替换为" size="small" />
                  </div>
                </div>

                <el-button type="primary" class="w-full mt-4" :icon="MagicStick" @click="processText">开始清洗</el-button>
              </div>
            </div>
          </div>

          <!-- Text Areas -->
          <div class="flex-1 flex flex-col gap-6 order-1 lg:order-2">
            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-bold text-gray-600">输入文本</span>
                <el-button type="danger" link :icon="Delete" @click="clearAll">清空</el-button>
              </div>
              <textarea 
                v-model="inputText" 
                class="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-y focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="在此粘贴需要处理的文本..."
              ></textarea>
            </div>

            <div class="flex-1 flex flex-col">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-bold text-gray-600">处理结果</span>
                <el-button type="primary" link :icon="CopyDocument" @click="copyResult">复制结果</el-button>
              </div>
              <textarea 
                v-model="outputText" 
                readonly
                class="w-full h-64 p-4 bg-white border border-gray-200 rounded-lg resize-y focus:outline-none focus:border-blue-500"
                placeholder="处理结果将显示在这里..."
              ></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>