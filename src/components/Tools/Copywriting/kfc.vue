<!--
* @file KFC.vue
* @description 肯德基疯狂星期四文案生成器
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-9
*
* 功能特性：
* 1. 自动获取最新KFC文案
* 2. 一键复制功能
* 3. 优雅的动画效果
* 4. 响应式布局
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-12 shadow-sm min-h-[600px]">
        <div class="text-center mb-12">
          <h2 class="text-[32px] font-bold mb-3">疯狂星期四文案生成器</h2>
          <p class="text-gray-500">生成疯狂星期四文案</p>
        </div>

        <!-- 中文文案区域 -->
        <div class="bg-gray-50 rounded-lg p-8 mb-6 min-h-[200px]">
          <div class="text-sm text-gray-500 mb-4">中文文案：</div>
          <div class="text-gray-700 leading-relaxed text-[1.1rem] typing-text" ref="textContainer">
            {{ state.typingText }}
          </div>
        </div>

        <!-- 英文翻译区域 -->
        <div v-if="state.translatedText" class="bg-gray-50 rounded-lg p-8 mb-6 min-h-[200px]">
          <div class="text-sm text-gray-500 mb-4">英文翻译：</div>
          <div class="text-gray-700 leading-relaxed text-[1.1rem]">
            {{ state.translatedText }}
          </div>
        </div>

        <!-- 按钮区域 -->
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <button @click="generate" :disabled="state.isTyping"
            class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>
            {{ state.isTyping ? '生成中...' : '生成文案' }}
          </button>
          <button @click="translateText" :disabled="!state.displayText || state.isTranslating"
            class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
            <el-icon class="mr-1">
              <Document />
            </el-icon>
            {{ state.isTranslating ? '翻译中...' : '翻译文案' }}
          </button>
          <button @click="() => copyText('chinese')"
            class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center">
            <el-icon class="mr-1">
              <Document />
            </el-icon>
            复制中文
          </button>
          <button v-if="state.translatedText" @click="() => copyText('english')"
            class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center">
            <el-icon class="mr-1">
              <Document />
            </el-icon>
            复制英文
          </button>
        </div>
      </div>

      <!-- 工具推荐区域 -->
      <div class="mt-4">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from '@vue/runtime-core'
import { Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { copy } from '@/utils/copy'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const textContainer = ref<HTMLElement>()
const typingSpeed = 50 // 打字速度（毫秒/字）

const state = reactive({
  displayText: '',
  translatedText: '',
  isTranslating: false,
  typingText: '',
  isTyping: false
})

// 打字机效果
async function typeText(text: string) {
  state.isTyping = true
  state.typingText = ''
  for (let i = 0; i < text.length; i++) {
    state.typingText += text[i]
    await new Promise(resolve => setTimeout(resolve, typingSpeed))
  }
  state.isTyping = false
}

// 生成文案
async function generate(retryCount = 0) {
  try {
    // 检查是否是生产环境
    const isProd = import.meta.env.PROD
    const apiUrl = isProd
      ? 'https://tools.mgtv100.com/external/v1/pear/kfc'  // 生产环境直接访问
      : '/api/kfc'  // 开发环境使用代理

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Origin': 'https://tools.mgtv100.com',
        'Referer': 'https://tools.mgtv100.com/',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      mode: isProd ? 'cors' : 'same-origin',
      credentials: isProd ? 'omit' : 'same-origin'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 检查内容类型
    const contentType = response.headers.get('content-type')
    console.log('Response content type:', contentType)

    const text = await response.text()
    console.log('Raw response:', text)

    // 检查是否返回了 HTML
    if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
      console.error('Received HTML instead of JSON')
      if (retryCount < 3) {
        console.log(`Retrying due to HTML response... (${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return generate(retryCount + 1)
      }
      throw new Error('服务器配置错误，请联系管理员')
    }

    // 尝试清理响应文本
    const cleanText = text.trim().replace(/^\uFEFF/, '')

    let data
    try {
      data = JSON.parse(cleanText)
    } catch (e) {
      console.error('JSON parse error:', e)
      if (retryCount < 3) {
        console.log(`Retrying... (${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 2000))
        return generate(retryCount + 1)
      }
      throw new Error('返回数据格式错误')
    }

    console.log('KFC API response:', data)

    if (data.code === 200 && data.data) {
      state.displayText = data.data
      // 启动打字机效果
      typeText(data.data)
      // 清空之前的翻译
      state.translatedText = ''
      ElMessage.success('生成成功')
    } else {
      throw new Error(data.msg || '获取文案失败')
    }
  } catch (error: any) { // 显式类型标注
    console.error('KFC API error:', error)

    if (retryCount < 3 && !error.message?.includes('服务器配置错误')) {
      console.log(`Retrying due to error... (${retryCount + 1}/3)`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      return generate(retryCount + 1)
    }

    ElMessage.error(`获取文案失败: ${error instanceof Error ? error.message : '服务异常'}`)
  }
}

// 翻译文本
async function translateText() {
  try {
    state.isTranslating = true
    const response = await fetch(
      `https://suapi.net/api/text/translate?to=en&text[]=${encodeURIComponent(state.displayText)}`
    )
    const data = await response.json()
    console.log('Translation response:', data)
    if (data.code === 200 && data.data?.[0]?.translations?.[0]?.text) {
      state.translatedText = data.data[0].translations[0].text
      ElMessage.success('翻译成功')
    } else {
      ElMessage.error('翻译失败')
    }
  } catch (error) {
    console.error('Translation error:', error)
    ElMessage.error('翻译服务异常')
  } finally {
    state.isTranslating = false
  }
}

// 复制文本
function copyText(type: 'chinese' | 'english') {
  const text = type === 'chinese' ? state.displayText : state.translatedText
  copy(text).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 初始生成一条文案
generate()
</script>

<style scoped>
.typing-text {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 24px;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.typing-text::after {
  content: '|';
  animation: blink 1s infinite;
  margin-left: 2px;
}

.typing-text:not(.is-typing)::after {
  display: none;
}
</style>
