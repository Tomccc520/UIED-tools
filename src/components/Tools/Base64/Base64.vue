<template>
  <div class="base64-converter">
    <div class="bg-white rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Base64 转换工具</h2>
        <p class="text-gray-500">支持文本/图片与Base64编码之间的相互转换</p>
      </div>

      <div class="bg-gray-50 p-1 rounded-lg flex mb-6 w-fit mx-auto">
        <button v-for="tab in tabs" :key="tab.value" @click="currentTab = tab.value"
          class="px-6 py-2 rounded-md text-sm font-medium transition-all"
          :class="currentTab === tab.value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ tab.label }}
        </button>
      </div>

      <!-- 文本转换 -->
      <div v-if="currentTab === 'text'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">原文</label>
              <button @click="clearText" class="text-sm text-gray-500 hover:text-blue-600">清空</button>
            </div>
            <textarea v-model="inputText" placeholder="请输入要转换的文本..."
              class="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"></textarea>
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Base64 编码</label>
              <button @click="copyResult" class="text-sm text-blue-600 hover:text-blue-700">复制结果</button>
            </div>
            <textarea v-model="outputText" readonly placeholder="转换结果将显示在这里..."
              class="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none font-mono text-sm text-gray-600"></textarea>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button @click="encodeText"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            编码 (Encode)
          </button>
          <button @click="decodeText"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            解码 (Decode)
          </button>
        </div>
      </div>

      <!-- 图片转换 -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">上传图片</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors relative">
              <input type="file" accept="image/*" @change="handleFileChange"
                class="absolute inset-0 opacity-0 cursor-pointer">
              <div v-if="previewImage" class="w-full h-full p-2">
                <img :src="previewImage" class="w-full h-full object-contain">
              </div>
              <div v-else class="text-center text-gray-500">
                <svg class="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>点击或拖拽上传图片</p>
              </div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Base64 编码</label>
              <button @click="copyImageBase64" class="text-sm text-blue-600 hover:text-blue-700">复制结果</button>
            </div>
            <textarea v-model="imageBase64" placeholder="上传图片后自动生成Base64，或在此粘贴Base64还原图片..."
              class="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-lg resize-none font-mono text-sm text-gray-600 break-all"></textarea>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button @click="convertBase64ToImage"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Base64 转图片
          </button>
          <button @click="clearImage"
            class="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            清空
          </button>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-12 border-t pt-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">使用说明</h3>
        <ul class="list-disc list-inside text-gray-600 space-y-2 text-sm">
          <li><strong>文本转换</strong>：支持 UTF-8 字符集，中文不会乱码。</li>
          <li><strong>图片转换</strong>：支持 JPG, PNG, GIF, SVG 等常见图片格式。</li>
          <li><strong>Base64还原</strong>：粘贴 Base64 编码（包含 data:image/... 前缀）点击“Base64 转图片”即可预览。</li>
          <li>数据仅在本地浏览器处理，不会上传到服务器，保障您的隐私安全。</li>
        </ul>
      </div>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const currentTab = ref('text')
const tabs = [
  { label: '文本转换', value: 'text' },
  { label: '图片转换', value: 'image' }
]

// 文本转换逻辑
const inputText = ref('')
const outputText = ref('')

const encodeText = () => {
  try {
    // 使用 encodeURIComponent 处理中文
    outputText.value = btoa(encodeURIComponent(inputText.value).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(parseInt(p1, 16))
      }))
  } catch (e) {
    ElMessage.error('编码失败')
  }
}

const decodeText = () => {
  try {
    outputText.value = decodeURIComponent(atob(inputText.value).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  } catch (e) {
    ElMessage.error('解码失败，请检查输入格式')
  }
}

const clearText = () => {
  inputText.value = ''
  outputText.value = ''
}

const copyResult = async () => {
  if (!outputText.value) return
  try {
    await navigator.clipboard.writeText(outputText.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

// 图片转换逻辑
const imageBase64 = ref('')
const previewImage = ref('')

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小建议不超过 5MB')
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    imageBase64.value = result
    previewImage.value = result
  }
  reader.readAsDataURL(file)
}

const convertBase64ToImage = () => {
  if (!imageBase64.value) {
    ElMessage.warning('请输入 Base64 编码')
    return
  }
  previewImage.value = imageBase64.value
}

const copyImageBase64 = async () => {
  if (!imageBase64.value) return
  try {
    await navigator.clipboard.writeText(imageBase64.value)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const clearImage = () => {
  imageBase64.value = ''
  previewImage.value = ''
}
</script>

<style scoped>
.base64-converter {
  min-height: calc(100vh - 64px);
}
</style>
