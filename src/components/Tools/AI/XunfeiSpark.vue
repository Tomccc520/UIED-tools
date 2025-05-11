<!--
 * @file XunfeiSpark.vue
 * @description 讯飞星火 Lite1.5 AI对话组件,基于讯飞星火认知大模型实现智能对话
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-2-8
 *
 * 功能特性：
 * 1. 支持与AI进行自然对话
 * 2. 支持上下文记忆功能
 * 3. 支持对话记录保存
 * 4. 支持清空对话历史
 * 5. 响应式布局设计
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
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3">{{ info.title }}</h2>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <!-- 对话区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- 左侧对话区 -->
          <div class="lg:col-span-3 flex flex-col">
            <div class="bg-white border border-gray-200 rounded-lg flex-1">
              <!-- 对话历史 -->
              <div class="h-full overflow-y-auto p-6 flex flex-col" ref="chatContainer">
                <!-- 欢迎消息 -->
                <div v-if="messages.length === 0" class="text-center py-8">
                  <div class="mb-4">
                    <div
                      class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-white" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                  </div>
                  <h1
                    class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    欢迎使用 AI 助手
                  </h1>
                  <p class="mt-4 text-gray-500">开始对话，或从右侧选择一个预设角色</p>
                </div>

                <!-- 对话内容 -->
                <div class="space-y-6 flex-1">
                  <template v-for="(message, index) in messages" :key="index">
                    <div class="flex gap-4 animate-fade-in p-4 rounded-lg"
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
                          <button class="flex items-center gap-1.5 hover:text-gray-600"
                            @click="regenerateMessage(index)" v-if="message.role === 'assistant'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                              stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            重新生成
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

                <!-- 输入区域 -->
                <div class="border-t border-gray-100 p-6">
                  <div class="relative">
                    <textarea v-model="currentMessage" rows="1"
                      class="w-full resize-none rounded-xl bg-gray-50 border border-gray-200 text-gray-700 placeholder-gray-400 p-4 pr-24 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      :style="{ height: textareaHeight + 'px' }" placeholder="输入消息，Enter 发送，Shift + Enter 换行..."
                      @input="adjustTextareaHeight" @keydown.enter.exact.prevent="handleSend"
                      :disabled="loading"></textarea>
                    <div class="absolute right-2 bottom-2 flex items-center gap-2">
                      <button class="p-2 text-gray-400 hover:text-gray-600" @click="handleSend"
                        :disabled="loading || !currentMessage.trim()">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 flex justify-between items-center text-xs text-gray-400">
                    <div class="flex gap-4">
                      <button class="flex items-center gap-1.5 hover:text-gray-600" @click="clearChat"
                        :disabled="loading">
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
                        </svg>
                        保存对话
                      </button>
                    </div>
                    <span>{{ currentMessage.length }}/2000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧角色选择 -->
          <div class="lg:col-span-1 flex flex-col">
            <div class="bg-white border border-gray-200 rounded-lg p-6 flex-1">
              <h3 class="text-lg font-medium text-gray-900 mb-4">预设角色</h3>
              <div class="space-y-3">
                <button v-for="role in presetRoles" :key="role.name"
                  class="w-full p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  :class="{ 'border-blue-500 bg-blue-50': currentRole === role.name }" @click="selectRole(role)">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br" :class="role.gradient">
                      <span class="flex items-center justify-center h-full text-white text-sm">
                        {{ role.icon }}
                      </span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
                      <div class="text-xs text-gray-500">{{ role.description }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能说明 -->
        <div class="mt-8 bg-white border border-gray-200 rounded-lg p-6">
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
        <div class="mt-8 bg-white border border-gray-200 rounded-lg p-6">
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
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "讯飞星火 Lite1.5",
  subtitle: "基于讯飞星火认知大模型的智能对话工具，支持多轮对话"
}

// 数据结构
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const currentMessage = ref('')
const loading = ref(false)
const textareaHeight = ref(56)
const isTyping = ref(false)

// 功能特性
const features = [
  {
    title: '智能对话',
    desc: '基于讯飞星火大模型，实现自然对话',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>'
  },
  {
    title: '多轮对话',
    desc: '支持连续对话，实现流畅交互',
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
    a: '是的，星火助手能够记住对话上下文，您可以进行连续的多轮对话。'
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

// 预设角色
const presetRoles = [
  {
    name: '通用助手',
    description: '全能型AI助手，可以回答各类问题',
    icon: '💡',
    gradient: 'from-blue-500 to-blue-600',
    prompt: '你是一个全能的AI助手，可以回答各种问题。'
  },
  {
    name: '小红书写手',
    description: '擅长写小红书爆款笔记和标题',
    icon: '📱',
    gradient: 'from-pink-500 to-rose-600',
    prompt: '你是一个专业的小红书写手，擅长写爆款笔记，文风活泼、吸引人，懂得使用emoji表情，擅长写标题和文案。'
  },
  {
    name: '代码专家',
    description: '专注于编程相关问题的解答',
    icon: '💻',
    gradient: 'from-green-500 to-green-600',
    prompt: '你是一个专业的程序员，精通各种编程语言，可以帮助解决编程问题，提供代码示例和最佳实践。'
  },
  {
    name: '文案创作',
    description: '帮助优化和创作各类文案',
    icon: '✍️',
    gradient: 'from-purple-500 to-purple-600',
    prompt: '你是一个专业的文案创作者，擅长写各类营销文案、广告语、slogan等，文字富有感染力和说服力。'
  },
  {
    name: '英语教师',
    description: '帮助学习和提高英语水平',
    icon: '🎓',
    gradient: 'from-yellow-500 to-yellow-600',
    prompt: '你是一个专业的英语教师，可以帮助学习英语，纠正语法错误，提供地道的英语表达，解释英语中的词汇和短语用法。'
  },
  {
    name: '数学导师',
    description: '解答数学问题，讲解解题思路',
    icon: '🔢',
    gradient: 'from-red-500 to-red-600',
    prompt: '你是一个专业的数学老师，可以帮助解答数学题目，讲解解题思路，让数学概念更容易理解。'
  },
  {
    name: '营销策划',
    description: '帮助制定营销方案和活动策划',
    icon: '📊',
    gradient: 'from-orange-500 to-amber-600',
    prompt: '你是一个专业的营销策划专家，擅长制定营销方案，策划推广活动，分析市场趋势，提供营销建议。'
  },
  {
    name: '心理咨询',
    description: '提供心理疏导和情感建议',
    icon: '🫂',
    gradient: 'from-teal-500 to-cyan-600',
    prompt: '你是一个专业的心理咨询师，擅长倾听、共情，可以提供心理疏导和情感建议，帮助人们解决心理困扰。'
  },
  {
    name: '美食达人',
    description: '分享美食食谱和烹饪技巧',
    icon: '🍳',
    gradient: 'from-lime-500 to-green-600',
    prompt: '你是一个美食达人，精通各种菜系的烹饪方法，可以分享详细的食谱和烹饪技巧，让美食制作变得简单。'
  },
  {
    name: '旅行规划',
    description: '帮助规划旅行路线和攻略',
    icon: '✈️',
    gradient: 'from-sky-500 to-blue-600',
    prompt: '你是一个专业的旅行规划师，熟悉各地旅游资源，可以提供详细的旅行建议，规划路线，推荐景点和美食。'
  }
]

// 当前选择的角色
const currentRole = ref('通用助手')

// 选择角色
const selectRole = (role: any) => {
  currentRole.value = role.name
  messages.value = [{
    role: 'assistant',
    content: `已切换至${role.name}模式。\n\n${role.prompt}\n\n开始对话吧！`
  }]
  ElMessage.success(`已切换至${role.name}模式`)
}

// 监听回车键
const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 重新生成回复
const regenerateMessage = async (index: number) => {
  if (loading.value) return

  try {
    loading.value = true
    // 移除当前回复
    messages.value.splice(index, 1)
    // 重新调用API获取回复
    await handleSend()
  } catch (error) {
    console.error('重新生成失败:', error)
    ElMessage.error('重新生成失败，请重试')
  } finally {
    loading.value = false
  }
}

// 调整文本框高度
const adjustTextareaHeight = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement
  textarea.style.height = '56px'
  textarea.style.height = textarea.scrollHeight + 'px'
  textareaHeight.value = textarea.scrollHeight
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
    console.log('开始发送消息...')

    // 获取当前角色的prompt
    const currentRolePrompt = presetRoles.find(role => role.name === currentRole.value)?.prompt || ''
    console.log('当前角色prompt:', currentRolePrompt)

    // 构建发送的消息
    const messageToSend = currentRolePrompt ?
      `${currentRolePrompt}\n用户消息: ${currentMessage.value.trim()}` :
      currentMessage.value.trim()
    console.log('待发送的消息:', messageToSend)

    // 添加用户消息
    messages.value.push({
      role: 'user',
      content: currentMessage.value.trim()
    })
    console.log('已添加用户消息')

    // 调用API
    console.log('正在调用API...')
    const response = await axios.get('https://api.pearktrue.cn/api/xfai/', {
      params: {
        message: messageToSend
      }
    })
    console.log('API响应:', response.data)

    // 处理API响应
    if (response.data && response.data.code === 200) {
      const aiMessage = response.data.answer || ''
      if (!aiMessage) {
        throw new Error('API返回的消息内容为空')
      }
      console.log('AI回复:', aiMessage)

      // 添加AI回复
      messages.value.push({
        role: 'assistant',
        content: '' // 初始化为空，准备打字机效果
      })
      console.log('已添加AI回复')

      // 打字机效果
      isTyping.value = true
      const lastIndex = messages.value.length - 1
      const chars = aiMessage.split('')
      let index = 0

      const typeNextChar = () => {
        if (index < chars.length) {
          messages.value[lastIndex].content += chars[index]
          index++
          setTimeout(typeNextChar, 50) // 每50ms显示一个字符
        } else {
          isTyping.value = false
          ElMessage.success('发送成功')
        }
      }

      typeNextChar()

      // 清空输入框
      currentMessage.value = ''
    } else {
      throw new Error(response.data?.msg || 'API返回数据格式不符合预期')
    }

  } catch (error: any) {
    console.error('发送消息失败:', error)
    ElMessage.error(error.message || '发送消息失败，请重试')
    // 移除失败的用户消息
    messages.value.pop()
  } finally {
    loading.value = false
    console.log('消息处理完成')
  }
}

// 清空对话
const clearChat = () => {
  messages.value = []
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
  messages.value.splice(index, 1)
  ElMessage.success('消息已删除')
}

onMounted(() => {
  // 添加键盘事件监听
  document.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keypress', handleKeyPress)
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
