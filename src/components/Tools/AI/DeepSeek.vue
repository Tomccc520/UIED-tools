<!--
 * @file DeepSeek.vue
 * @description DeepSeek AI对话组件,基于最新DeepSeekChat API实现智能对话
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-2-6
 *
 * 功能特性：
 * 1. 支持与AI进行自然对话
 * 2. 支持上下文记忆功能
 * 3. 支持系统角色设定
 * 4. 支持对话记录保存
 * 5. 支持清空对话历史
 * 6. 响应式布局设计
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 刷新提示 -->
        <div class="mb-4 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          提示：页面刷新后对话记录将会消失，请注意及时保存重要内容。
        </div>

        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 对话区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 主对话区 -->
          <div class="bg-white border border-gray-200 rounded-lg">
            <div class="h-[600px] overflow-y-auto p-6" ref="chatContainer">
              <!-- 欢迎消息 -->
              <div v-if="messages.length === 1" class="text-center py-8">
                <h1
                  class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  欢迎使用 AI 助手
                </h1>
                <p class="mt-4 text-gray-500">您可以开始提问，或点击下方快捷提示开始对话</p>
              </div>

              <!-- 对话内容 -->
              <div class="space-y-6">
                <template v-for="(message, index) in messages" :key="index">
                  <div v-if="message.role !== 'system'" class="flex gap-4 animate-fade-in p-4 rounded-lg"
                    :class="[message.role === 'assistant' ? 'bg-gray-50' : '']">
                    <!-- 头像 -->
                    <div class="w-8 h-8 flex-shrink-0">
                      <div v-if="message.role === 'user'"
                        class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                        我
                      </div>
                      <div v-else
                        class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-medium">
                        AI
                      </div>
                    </div>

                    <!-- 消息内容 -->
                    <div class="flex-1 min-w-0">
                      <div class="prose max-w-none">
                        <div class="text-gray-700 whitespace-pre-wrap">{{ message.content }}</div>
                      </div>

                      <!-- 操作按钮 -->
                      <div class="flex items-center gap-4 mt-4 text-gray-400 text-xs">
                        <button class="flex items-center gap-1.5 hover:text-gray-600"
                          @click="copyMessage(message.content)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          复制
                        </button>
                        <button class="flex items-center gap-1.5 hover:text-gray-600" @click="deleteMessage(index)">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 加载动画 -->
                <div v-if="loading || isTyping" class="flex gap-4 bg-gray-50 p-4 rounded-lg animate-fade-in">
                  <div class="w-8 h-8 flex-shrink-0">
                    <div
                      class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-medium animate-pulse">
                      AI
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="flex gap-2">
                      <div class="typing-dot"></div>
                      <div class="typing-dot"></div>
                      <div class="typing-dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快捷提示词 -->
            <div class="px-6 py-4 border-t border-gray-100">
              <div class="flex flex-wrap gap-2">
                <button v-for="prompt in quickPrompts" :key="prompt"
                  class="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                  @click="useQuickPrompt(prompt)">
                  {{ prompt }}
                </button>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="border-t border-gray-100 p-6">
              <div class="relative">
                <textarea v-model="currentMessage" rows="1"
                  class="w-full resize-none rounded-xl bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400 p-4 pr-24 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  :style="{ height: textareaHeight + 'px' }" placeholder="输入消息，Enter 发送，Shift + Enter 换行..."
                  @input="adjustTextareaHeight" @keydown.enter.exact.prevent="handleSend"
                  :disabled="loading"></textarea>
                <div class="absolute right-2 bottom-2 flex items-center gap-2">
                  <button class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" @click="handleSend"
                    :disabled="loading || !currentMessage.trim()">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="mt-3 flex justify-between items-center text-xs text-gray-400">
                <div class="flex gap-4">
                  <button class="flex items-center gap-1.5 hover:text-gray-600" @click="clearChat" :disabled="loading">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    清空对话
                  </button>
                  <button class="flex items-center gap-1.5 hover:text-gray-600" @click="saveChat">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      '
                    </svg>
                    保存对话
                  </button>
                </div>
                <span>{{ currentMessage.length }}/2000</span>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    v-html="feature.icon"></svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="faq in faqItems" :key="faq.q" class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ faq.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "DeepSeek AI对话",
  subtitle: "基于最新DeepSeekChat API的智能对话工具，支持上下文记忆"
}

// 简化数据结构
const messages = ref<Array<{ role: string, content: string }>>([
  {
    role: 'system',
    content: 'You are a helpful assistant.'
  }
])

// 移除多对话相关的变量和函数
const chatContainer = ref<HTMLElement | null>(null)
const currentMessage = ref('')
const loading = ref(false)
const textareaHeight = ref(56)
const typingMessage = ref('')
const isTyping = ref(false)

// 功能特性
const features = [
  {
    title: '智能对话',
    desc: '基于最新AI模型，实现自然流畅的对话交互',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>'
  },
  {
    title: '上下文记忆',
    desc: '支持多轮对话，准确理解上下文语境',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>'
  },
  {
    title: '快捷提示',
    desc: '提供常用提示词，快速开启对话',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>'
  },
  {
    title: '对话保存',
    desc: '支持保存对话记录，方便后续查看',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>'
  }
]

// 常见问题
const faqItems = [
  {
    q: '如何开始对话？',
    a: '您可以直接在输入框中输入问题，或点击快捷提示词快速开始对话。支持Enter键发送消息，Shift+Enter换行。'
  },
  {
    q: '对话是否支持记忆功能？',
    a: '是的，AI助手能够记住对话上下文，您可以进行连续的多轮对话，它会根据上下文提供更准确的回答。'
  },
  {
    q: '如何保存对话记录？',
    a: '点击底部的"保存对话"按钮，系统会将当前的对话记录保存为文本文件供您下载。'
  },
  {
    q: '为什么有时候会回复失败？',
    a: '可能是网络问题或服务器压力大导致的。如果遇到这种情况，请稍等片刻后重试。'
  }
]

// 快捷提示词
const quickPrompts = [
  "帮我写一篇文章",
  "帮我润色一下文案",
  "充当代码助手",
  "帮我做数学题",
  "充当英语老师",
  "帮我写一首诗",
  "帮我写一个故事",
  "帮我分析一下问题"
]

// 调整文本框高度
const adjustTextareaHeight = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  textarea.style.height = '56px'
  textarea.style.height = textarea.scrollHeight + 'px'
  textareaHeight.value = textarea.scrollHeight
}

// 使用快捷提示词
const useQuickPrompt = (prompt: string) => {
  currentMessage.value = prompt
}

// 保存对话记录
const saveChat = () => {
  if (messages.value.length <= 1) {
    ElMessage.warning('当前没有对话内容可保存')
    return
  }

  const chatContent = messages.value
    .filter(msg => msg.role !== 'system')
    .map(msg => `${msg.role === 'user' ? '我' : 'AI'}：${msg.content}`)
    .join('\n\n')

  const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `对话记录_${new Date().toLocaleString()}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('对话记录已保存')
}

// 发送消息
const handleSend = async () => {
  if (!currentMessage.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  if (loading.value) return

  try {
    loading.value = true

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: currentMessage.value.trim()
    })

    // 滚动到底部
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }

    // 调用API
    const response = await axios.post('https://api.pearktrue.cn/api/deepseek/', {
      messages: messages.value
    })

    // 添加AI回复(使用打字机效果)
    if (response.data && response.data.code === 200 && response.data.message) {
      const aiMessage = response.data.message
      messages.value.push({
        role: 'assistant',
        content: ''
      })

      // 打字机效果
      isTyping.value = true
      const lastIndex = messages.value.length - 1
      const chars = aiMessage.split('')
      let index = 0

      const typeNextChar = () => {
        if (index < chars.length) {
          messages.value[lastIndex].content += chars[index]
          index++
          setTimeout(typeNextChar, 30) // 调整这个数值可以改变打字速度
        } else {
          isTyping.value = false
        }
      }

      typeNextChar()
    } else {
      console.error('API响应数据:', response.data)
      throw new Error('API返回数据格式不符合预期')
    }

    // 清空输入框
    currentMessage.value = ''

    // 滚动到底部
    await nextTick()
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }

  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败，请重试')
  } finally {
    loading.value = false
  }
}

// 清空对话
const clearChat = () => {
  messages.value = [{
    role: 'system',
    content: 'You are a helpful assistant.'
  }]
  currentMessage.value = ''
  ElMessage.success('对话已清空')
}

// 复制消息
const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 删除消息
const deleteMessage = (index: number) => {
  if (messages.value[index].role === 'system') return
  messages.value.splice(index, 1)
  ElMessage.success('消息已删除')
}

// 监听回车键
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keypress', handleKeyPress)
})

</script>

<style scoped>
/* 移除文本框聚焦时的轮廓 */
textarea:focus {
  outline: none !important;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 添加动画 */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 打字机动画点 */
.typing-dot {
  @apply w-2 h-2 rounded-full bg-emerald-500/50;
  animation: typingAnimation 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingAnimation {

  0%,
  60%,
  100% {
    transform: translateY(0);
  }

  30% {
    transform: translateY(-4px);
  }
}
</style>
