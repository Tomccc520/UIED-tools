<!--
 * @file DeepSeekR1.vue
 * @description DeepSeek R1 AI对话组件,基于 SiliconFlow 平台的 DeepSeek R1 模型实现智能对话
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-5-19
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
      <div class="bg-white rounded-xl p-8 mb-4 shadow-none border border-gray-100">
        <!-- 页面标题 -->
        <div class="mb-6">
          <div class="max-w-6xl mx-auto">
            <div class="flex flex-col items-center text-center">
              <!-- Logo -->
              <div class="w-12 h-12 mb-4 hidden md:block">
                <img src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-full h-full" />
              </div>
              <!-- 标题内容部分 -->
              <div class="w-full">
                <!-- 标题和移动端 Logo -->
                <div class="flex items-center justify-center">
                  <img src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-10 h-10 md:hidden mr-2" />
                  <h1 class="text-lg md:text-xl font-bold text-gray-900">DeepSeek AI 智能助手</h1>
                  <span class="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded-full ml-2">限时免费体验中</span>
                </div>
                <!-- 副标题 -->
                <p class="text-xs md:text-sm text-gray-500 mt-2">基于 <a href="https://cloud.siliconflow.cn/i/AZywGNhl"
                    target="_blank" class="text-blue-500 hover:text-blue-600">硅基流动x华为云联合SiliconFlow</a> 平台，支持多模型智能对话</p>
                <!-- 链接导航 -->
                <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3">
                  <a href="https://www.uied.cn/" target="_blank"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600">AI学习平台</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a href="https://uiedtool.com/" target="_blank"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600">AI免费工具</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a href="https://hot.uied.cn/" target="_blank"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600">AI资讯热榜</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a href="https://hao.uied.cn/ai" target="_blank"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600">AI工具导航</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a href="https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink" target="_blank"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600">AI交流群</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a href="https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600" target="_blank">AI知识库</a>
                </div>
                <!-- 状态提示 -->
                <div class="flex flex-col md:flex-row justify-center items-center gap-2 mt-3">
                  <span
                    class="px-2.5 py-1 text-sm bg-yellow-50 text-yellow-600 rounded-full text-center">提示：对话数据不会保存，刷新页面后将消失，请及时保存！功能持续优化中</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 对话区域 -->
        <div class="flex flex-col space-y-4 mb-6">
          <!-- 模型选择 -->
          <div class="bg-white p-4 rounded-xl border border-gray-100">
            <div class="flex flex-col space-y-3">
              <div class="text-sm font-medium text-gray-700">选择模型</div>
              <div class="flex items-center">
                <el-select v-model="currentModel" class="w-full md:w-80" placeholder="请选择模型"
                  popper-class="model-select-dropdown">
                  <el-option v-for="model in modelOptions" :key="model.value" :label="model.label" :value="model.value">
                    <div class="flex items-center justify-between py-1.5">
                      <span class="text-sm text-gray-900">{{ model.label }}</span>
                      <span class="text-xs px-2 py-0.5 rounded-full" :class="[
                        model.value.includes('70B') ? 'bg-purple-50 text-purple-600' :
                          model.value.includes('32B') ? 'bg-blue-50 text-blue-600' :
                            model.value.includes('14B') ? 'bg-green-50 text-green-600' :
                              model.value.includes('7B') ? 'bg-yellow-50 text-yellow-600' :
                                'bg-gray-50 text-gray-600'
                      ]">{{ model.desc }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>

          <div ref="chatContainer"
            class="h-[calc(100vh-300px)] md:h-[700px] overflow-y-auto p-4 space-y-6 bg-white rounded-xl border border-gray-100 scroll-smooth">
            <!-- 对话消息 -->
            <template v-for="(message, index) in messages" :key="index">
              <div v-if="message.role !== 'system'" class="message-container max-w-6xl mx-auto"
                :class="[message.role === 'user' ? 'user' : 'assistant']">
                <!-- 头像 -->
                <div class="flex-shrink-0" :class="message.role === 'user' ? 'ml-4' : 'mr-4'">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                    :class="message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white border-2 border-blue-500'">
                    <svg v-if="message.role === 'user'" class="w-6 h-6" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <img v-else src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-6 h-6" />
                  </div>
                </div>

                <!-- 消息内容 -->
                <div class="flex-1 min-w-0 max-w-full">
                  <!-- 推理内容 -->
                  <div v-if="message.reasoning_content" class="reasoning-content">
                    <div class="reasoning-header" @click="toggleReasoning(index)">
                      <svg class="w-4 h-4 text-blue-500 transform transition-transform"
                        :class="{ 'rotate-180': !reasoningVisible[index] }" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-blue-500" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M168.64 168.64C263.424 73.792 494.08 150.72 683.712 340.288c189.632 189.696 266.56 420.288 171.712 515.136-94.848 94.848-325.44 17.92-515.136-171.712C150.656 494.08 73.792 263.424 168.64 168.64z m469.824 216.96C470.592 217.728 275.2 152.576 213.888 213.888c-61.312 61.312 3.84 256.704 171.712 424.576 167.872 167.872 363.264 232.96 424.576 171.712 61.312-61.312-3.84-256.704-171.712-424.576z"
                            fill="currentColor" />
                          <path
                            d="M340.288 340.288C529.984 150.656 760.576 73.792 855.424 168.64c94.848 94.784 17.92 325.44-171.712 515.072S263.424 950.272 168.64 855.424C73.792 760.576 150.72 529.92 340.288 340.288z m469.888-126.4c-61.312-61.312-256.704 3.84-424.576 171.712C217.728 553.472 152.576 748.8 213.888 810.176c61.312 61.312 256.704-3.84 424.576-171.712 167.872-167.872 232.96-363.264 171.712-424.576z"
                            fill="currentColor" />
                          <path d="M512 512m-69.376 0a69.376 69.376 0 1 0 138.752 0 69.376 69.376 0 1 0-138.752 0Z"
                            fill="currentColor" />
                        </svg>
                        <span class="mr-2">深度思考</span>
                        <span class="text-xs text-gray-500">(思考用时: {{ message.thinking_time || '0.5' }}s)</span>
                      </span>
                    </div>
                    <div v-show="reasoningVisible[index]" class="text-sm text-gray-600 leading-relaxed mt-2">
                      {{ message.reasoning_content }}
                    </div>
                  </div>

                  <!-- 主要消息内容 -->
                  <div class="prose prose-sm max-w-none">
                    <div class="markdown-body" v-html="renderMarkdown(message.content)"></div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="flex items-center gap-4 mt-4 text-gray-400 text-xs">
                    <button class="flex items-center gap-1.5 hover:text-gray-600"
                      @click="copyFormattedMessage(message.content)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      复制
                    </button>
                    <button v-if="message.role === 'assistant'" class="flex items-center gap-1.5 hover:text-gray-600"
                      @click="regenerateMessage(index)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      重新生成
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <!-- 打字机效果 -->
            <div v-if="isTyping" class="flex items-center space-x-2 ml-12">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="relative bg-white rounded-xl border border-gray-100 p-3 md:p-4 max-w-6xl mx-auto">
          <div class="flex items-start space-x-2 md:space-x-4">
            <div class="flex-shrink-0 hidden md:block">
              <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <textarea v-model="currentMessage" @input="adjustTextareaHeight" @keydown.enter.prevent="handleKeyPress"
                class="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-600 bg-gray-50 rounded-lg resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-y-auto"
                :style="{ height: '80px', maxHeight: '120px' }"
                :placeholder="loading ? '正在生成回复...' : '输入你的问题，按Enter发送，Shift+Enter换行'" :disabled="loading">
      </textarea>
              <div class="flex flex-col md:flex-row items-center justify-between mt-2 md:mt-3 space-y-2 md:space-y-0">
                <div class="flex items-center space-x-2 w-full md:w-auto order-2 md:order-1">
                  <el-popover placement="top" :width="320" v-model:visible="showPrompts" trigger="click"
                    popper-class="prompt-popover">
                    <template #reference>
                      <button
                        class="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                        <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        快捷提示
                      </button>
                    </template>
                    <div class="p-4">
                      <div class="mb-4">
                        <h3 class="text-base font-medium text-gray-900 mb-2">常用提示词</h3>
                        <p class="text-sm text-gray-500">选择合适的提示词，帮助你更好地表达需求</p>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div v-for="category in quickPrompts" :key="category.category" class="space-y-3">
                          <div class="flex items-center space-x-2">
                            <div class="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <h4 class="text-sm font-medium text-gray-900">{{ category.category }}</h4>
                          </div>
                          <div class="space-y-2">
                            <button v-for="prompt in category.prompts" :key="prompt"
                              @click="useQuickPrompt(prompt); showPrompts = false"
                              class="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                              {{ prompt }}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-popover>
                  <button @click="handleReasoningToggle"
                    class="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border rounded-lg transition-colors flex items-center whitespace-nowrap"
                    :class="[
                      showReasoning
                        ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    ]">
                    <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {{ showReasoning ? '关闭思考' : '深度思考' }}
                  </button>

                  <!-- 添加进阶提示按钮 -->
                  <button @click="gotoPrompt"
                    class="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border rounded-lg transition-colors flex items-center whitespace-nowrap bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
                    <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    进阶提示
                  </button>
                  <button @click="gotoNav"
                    class="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border rounded-lg transition-colors flex items-center whitespace-nowrap bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100">
                    <svg class="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    DeepSeek导航
                  </button>
                </div>
                <div class="flex items-center space-x-2 md:space-x-3 w-full md:w-auto justify-end order-1 md:order-2">
                  <button @click="clearChat"
                    class="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button @click="saveChat" title="下载对话记录"
                    class="p-1.5 md:p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  <button v-if="loading" @click="stopGeneration"
                    class="p-1.5 md:p-2 text-red-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                    <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <button @click="handleSend" :disabled="loading || !currentMessage.trim()"
                    class="px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能特性和常见问题区域 -->
        <div class="bg-gradient-to-b from-white to-gray-50 rounded-xl p-4 md:p-6 mt-6 md:mt-8">
          <!-- 功能特性 -->
          <div class="mb-8">
            <h3 class="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div class="w-1 h-4 md:h-5 bg-blue-500 rounded-full mr-2"></div>
              功能特性
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div v-for="feature in features" :key="feature.title"
                class="flex items-start p-3 md:p-4 rounded-lg bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all duration-300">
                <div
                  class="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0 mr-3 md:mr-4"
                  v-html="feature.icon">
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm md:text-base font-medium text-gray-900 mb-1">{{ feature.title }}</h4>
                  <p class="text-xs md:text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div>
            <h3 class="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center">
              <div class="w-1 h-4 md:h-5 bg-blue-500 rounded-full mr-2"></div>
              常见问题
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div v-for="faq in faqItems" :key="faq.q"
                class="p-3 md:p-4 rounded-lg bg-white border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all duration-300">
                <h4 class="text-sm md:text-base font-medium text-gray-900 mb-2 flex items-start">
                  <svg class="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="flex-1">{{ faq.q }}</span>
                </h4>
                <p class="text-xs md:text-sm text-gray-600 leading-relaxed ml-6">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 使用说明部分后添加工具推荐 -->
  <div class="mt-4">
    <ToolsRecommend :currentPath="route.path" />
  </div>

  <!-- 验证弹窗 -->
  <el-dialog v-model="showVerifyDialog" title="继续使用" width="400px" :show-close="false">
    <div class="text-center">
      <div class="mb-6">
        <img src="@/assets/images/qrcode.jpg" alt="公众号二维码" class="w-32 h-32 mx-auto mb-4">
        <p class="text-gray-600 text-sm">您已达到免费使用次数限制，为了避免频繁使用或者攻击</p>
        <p class="text-gray-600 text-sm">请关注我们的公众号回复"密码"获取验证密码。</p>
        <p class="text-gray-600 text-sm">密码获取后也是免费使用。</p>
      </div>
      <el-input v-model="verifyPassword" placeholder="请输入验证密码" class="mb-4" />
    </div>
    <template #footer>
      <div class="flex justify-end space-x-4">
        <el-button @click="showVerifyDialog = false">取消</el-button>
        <el-button type="primary" @click="verifyAccess">验证</el-button>
      </div>
    </template>
  </el-dialog>
</template>


<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch, onUnmounted, onBeforeUnmount } from '@vue/runtime-core'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'
import axios from 'axios'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useRoute, useRouter } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import html2canvas from 'html2canvas'
import { useHead } from '@vueuse/head'

// SEO Meta Tags
useHead({
  title: 'DeepSeek R1 AI助手 - UIED免费AI工具',
  meta: [
    { name: 'description', content: '免费使用DeepSeek R1 AI助手，基于SiliconFlow平台，支持多模型智能对话、代码生成、文章写作等功能。UIED技术团队开发。' },
    { name: 'keywords', content: 'DeepSeek R1,AI对话,免费AI工具,AI助手,代码生成,智能写作,UIED' },
    { name: 'author', content: 'UIED技术团队' },
    { name: 'copyright', content: 'UIED技术团队 (https://fsuied.com)' }
  ]
})

// 组件配置信息
const info = {
  title: "DeepSeek R1 对话",
  subtitle: "基于 SiliconFlow 平台的 DeepSeek R1 模型，支持上下文记忆，最大输出长度2000 tokens"
}

// 定义接口
interface Message {
  role: string
  content: string
  reasoning_content?: string
  thinking_time?: string
}

// 系统提示和欢迎消息
const systemPrompt = `你是一个专业、友好的中文 AI 助手。请遵循以下原则：

1. 使用地道的中文表达
2. 回答要简洁、准确、专业
3. 对于专业问题，给出详细的解释和示例
4. 保持对话的连贯性和上下文理解
5. 适当使用emoji表情，让对话更生动
6. 如果不确定的内容，坦诚告知并给出建议`

const welcomeMessage = `你好！我是 DeepSeek AI 助手，很高兴为你服务。

我可以帮助你：
• 解决编程问题，优化代码质量
• 创作文章内容，提供写作思路
• 回答专业问题，分析解决方案`

// 状态变量
const messages = ref<Message[]>([
  {
    role: 'system',
    content: systemPrompt
  },
  {
    role: 'assistant',
    content: welcomeMessage
  }
])
const chatContainer = ref<HTMLElement | null>(null)
const currentMessage = ref('')
const loading = ref(false)
const isThinking = ref(false)
const textareaHeight = ref(56)
const isTyping = ref(false)
const accessToken = ref('')
const enableTyping = ref(false)
const showPrompts = ref(false)
const reasoningContent = ref('')
const showReasoning = ref(localStorage.getItem('deepseek-reasoning') !== 'false') // 默认开启思考模式

// 添加推理内容显示状态
const reasoningVisible = ref<{ [key: number]: boolean }>({})

// 功能特性
const features = [
  {
    title: '智能对话',
    desc: '基于先进的大语言模型，支持多轮对话，深入理解上下文，提供准确专业的回答。支持代码分析、文章创作、方案设计等多种场景。',
    icon: '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>'
  },
  {
    title: '多模型支持',
    desc: '提供从 1.5B 到 70B 不同规模的模型选择，满足不同场景需求。大模型推理能力强，小模型响应速度快，可根据任务特点灵活选择。',
    icon: '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/></svg>'
  },
  {
    title: '代码助手',
    desc: '专业的代码分析和优化能力，支持多种主流编程语言，提供代码解释、bug修复、性能优化、单元测试等全方位协助。',
    icon: '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>'
  },
  {
    title: '创意助手',
    desc: '强大的文本创作和优化能力，可用于文章写作、内容创作、文案优化等场景。支持多种写作风格，帮助激发创意灵感。',
    icon: '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>'
  }
]

// 常见问题
const faqItems = [
  {
    q: '如何选择合适的模型？',
    a: '建议根据具体场景选择：日常对话使用 7B/8B 模型，响应速度快；复杂分析任务选择 32B/70B 模型，推理能力强；需要平衡性能和速度时，可以选择 14B 模型。'
  },
  {
    q: '对话支持哪些功能？',
    a: '支持多种高级功能：代码开发与优化、算法设计与分析、文章创作与润色、知识问答与解析、方案设计与评估。支持多轮对话，理解上下文，可以通过追问深入探讨问题。'
  },
  {
    q: '如何提高回答质量？',
    a: '1. 提供清晰具体的问题描述和背景信息；2. 选择合适的模型规格；3. 善用多轮对话，通过追问获取更详细的答案；4. 开启深度思考模式，获得更深入的分析；5. 及时反馈，帮助模型调整回答方向。'
  },
  {
    q: '遇到问题怎么办？',
    a: '如遇到响应慢或失败的情况：1. 尝试切换到较小的模型提高响应速度；2. 将复杂问题拆分为多个简单问题；3. 清空历史记录重新开始对话；4. 检查网络连接是否正常；5. 如持续失败，可以稍后重试或联系技术支持。'
  }
]

// 定义模型类型
interface ModelOption {
  label: string
  value: string
  desc: string
  maxTokens: number
}

// 模型配置
const modelOptions: ModelOption[] = [
  {
    label: 'DeepSeek R1',
    value: 'deepseek-ai/DeepSeek-R1',
    desc: '华为云昇腾云服务 - 满血版',
    maxTokens: 8000
  },
  {
    label: 'Pro DeepSeek R1',
    value: 'Pro/deepseek-ai/DeepSeek-R1',
    desc: '华为云昇腾云服务 - 满血版',
    maxTokens: 8000
  },
  {
    label: 'DeepSeek R1 70B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    desc: '70B超大模型，推理能力最强',
    maxTokens: 16000
  },
  {
    label: 'DeepSeek R1 32B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    desc: '32B大模型，性能均衡',
    maxTokens: 16000
  },
  {
    label: 'DeepSeek R1 14B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
    desc: '14B中型模型，日常对话',
    maxTokens: 16000
  },
  {
    label: 'DeepSeek R1 8B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    desc: '8B轻量模型，速度快',
    maxTokens: 16000
  },
  {
    label: 'DeepSeek R1 7B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    desc: '7B入门模型，适合简单对话',
    maxTokens: 16000
  },
  {
    label: 'DeepSeek R1 1.5B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    desc: '1.5B超轻量模型，速度最快',
    maxTokens: 16000
  }
]

// 当前选择的模型 - 默认使用 R1 模型
const currentModel = ref('deepseek-ai/DeepSeek-R1-Distill-Qwen-7B')

// 获取当前选择模型的配置
const getCurrentModelConfig = computed(() => {
  return modelOptions.find(model => model.value === currentModel.value) || modelOptions[0]
})

// 在 script setup 中添加新的响应式变量
const usageCount = ref(Number(localStorage.getItem('deepseek_usage_count')) || 0)
const isVerified = ref(Boolean(localStorage.getItem('deepseek_verified')))
const showVerifyDialog = ref(false)
const verifyPassword = ref('')
const maxFreeUsage = ref(10)  // 修改为10次免费使用机会
const route = useRoute()
const router = useRouter()

// 添加验证密码的方法
const verifyAccess = () => {
  // 这里可以根据实际需求修改密码
  if (verifyPassword.value.toLowerCase() === 'uied2025') {
    isVerified.value = true
    localStorage.setItem('deepseek_verified', 'true')
    showVerifyDialog.value = false
    ElMessage.success('验证成功，您可以继续使用了')
  } else {
    ElMessage.error('密码错误，请关注公众号获取正确的密码')
  }
}

// 切换推理内容显示状态
const toggleReasoning = (index: number) => {
  reasoningVisible.value[index] = !reasoningVisible.value[index]
}

// 重新生成消息
const regenerateMessage = async (index: number) => {
  if (loading.value) return

  // 获取上一个用户消息
  const userMessageIndex = index - 1
  if (userMessageIndex < 0) return

  // 删除当前及之后的消息
  messages.value.splice(index)

  // 重新发送请求
  await handleSend()
}

// 格式化并复制消息
const copyFormattedMessage = (content: string) => {
  copyMessage(content)
}

// 跳转到提示词页面
const gotoPrompt = () => {
  router.push('/tools/ai/deepseek-prompt')
}

// 跳转到导航页面
const gotoNav = () => {
  router.push('/tools/ai/deepseek-nav')
}

// 处理思考开关切换
const handleReasoningToggle = () => {
  showReasoning.value = !showReasoning.value
  localStorage.setItem('deepseek-reasoning', String(showReasoning.value))
}

// 快捷提示词
const quickPrompts = [
  {
    category: '代码开发',
    prompts: [
      '帮我写一个Vue3的倒计时组件',
      '解释这段代码的运行原理',
      '优化这个SQL查询语句',
      '如何解决跨域请求问题？'
    ]
  },
  {
    category: '内容创作',
    prompts: [
      '帮我写一篇关于AI发展的文章大纲',
      '优化这段文案，使其更具吸引力',
      '写一个产品发布会的开场白',
      '给这个项目起几个好听的名字'
    ]
  },
  {
    category: '知识问答',
    prompts: [
      '解释一下量子纠缠',
      '介绍一下深度学习的发展历史',
      '如何制定个人理财计划？',
      '分析一下当前AI行业的发展趋势'
    ]
  }
]

// 修改发送消息函数
const handleSend = async () => {
  if (!currentMessage.value.trim() || loading.value) return

  // 检查使用次数限制
  if (!isVerified.value && usageCount.value >= maxFreeUsage.value) {
    showVerifyDialog.value = true
    return
  }

  try {
    loading.value = true
    isThinking.value = true
    reasoningContent.value = ''

    // 增加使用次数
    if (!isVerified.value) {
      usageCount.value++
      localStorage.setItem('deepseek_usage_count', usageCount.value.toString())
    }

    // 创建新的 AbortController
    controller.value = new AbortController()

    // 添加用户消息
    const userMessage = currentMessage.value.trim()
    messages.value.push({
      role: 'user',
      content: userMessage
    })

    currentMessage.value = ''

    // 获取 API Key
    const apiKey = getAccessToken()
    if (!apiKey) throw new Error('API Key 未配置')

    // 优化请求参数
    const requestData = {
      model: currentModel.value,
      messages: messages.value.slice(-4),
      temperature: 0.1,
      max_tokens: getCurrentModelConfig.value.maxTokens,
      stream: true,
      presence_penalty: 0,
      frequency_penalty: 0,
      extra_options: {
        show_reasoning: showReasoning.value, // 使用深度思考开关状态
        reasoning_type: showReasoning.value ? 'detailed' : 'none' // 根据开关状态设置推理类型
      }
    }

    // 创建响应容器
    let responseText = ''
    let reasoningText = ''

    // 记录思考开始时间
    const startTime = Date.now()

    // 添加助手消息占位
    messages.value.push({
      role: 'assistant',
      content: '',
      reasoning_content: '',
      thinking_time: '0.0'
    })

    const currentIndex = messages.value.length - 1

    // 添加自动滚动函数
    const scrollToBottom = () => {
      if (chatContainer.value) {
        const container = chatContainer.value
        container.scrollTop = container.scrollHeight
      }
    }

    // 发送请求
    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Origin': 'https://api.siliconflow.cn',
        'Referer': 'https://api.siliconflow.cn/',
        'Host': 'api.siliconflow.cn'
      },
      body: JSON.stringify(requestData),
      signal: controller.value.signal
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'API请求失败')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.slice(6).trim()
          // 跳过空行或结束标记
          if (!jsonData || jsonData === '[DONE]') continue

          try {
            // 预处理JSON数据
            const cleanedData = jsonData.replace(/^\uFEFF/, '') // 移除BOM
              .replace(/[\u0000-\u001F]/g, '') // 移除控制字符
              .trim()

            // 尝试解析JSON数据
            const data = JSON.parse(cleanedData)

            // 验证数据结构
            if (!data || !data.choices || !Array.isArray(data.choices) || !data.choices[0]) {
              console.warn('无效的响应数据结构:', data)
              continue
            }

            const choice = data.choices[0]

            // 处理推理内容
            if (showReasoning.value && choice.delta?.reasoning_content) {
              reasoningText += choice.delta.reasoning_content
              reasoningContent.value = reasoningText
              messages.value[currentIndex].reasoning_content = reasoningText

              // 更新思考时间
              const thinkingTime = ((Date.now() - startTime) / 1000).toFixed(1)
              messages.value[currentIndex].thinking_time = thinkingTime
            }

            // 处理回复内容
            if (choice.delta?.content) {
              // 确保内容是字符串
              let contentToAdd = '';

              if (choice.delta.content === null || choice.delta.content === undefined) {
                contentToAdd = '';
              } else if (typeof choice.delta.content === 'string') {
                contentToAdd = choice.delta.content;
              } else if (typeof choice.delta.content === 'object') {
                try {
                  // 对象类型转为 JSON 字符串
                  contentToAdd = JSON.stringify(choice.delta.content, null, 2);
                  console.warn('收到对象类型的内容:', choice.delta.content);
                } catch (e) {
                  contentToAdd = '[复杂数据]';
                  console.error('无法序列化对象:', e);
                }
              } else {
                // 其他类型转为字符串
                contentToAdd = String(choice.delta.content);
              }

              responseText += contentToAdd;

              // 确保消息内容始终是字符串
              if (typeof messages.value[currentIndex].content !== 'string') {
                messages.value[currentIndex].content = '';
              }

              messages.value[currentIndex].content = responseText;

              // 添加代码块自动滚动
              await nextTick();
              const codeContainers = document.querySelectorAll('.code-scroll-container');
              codeContainers.forEach(container => {
                container.scrollTop = container.scrollHeight;
              });
            }

            // 更新UI
            await nextTick()
            scrollToBottom()
          } catch (e) {
            console.error('JSON解析错误:', e, '原始数据:', jsonData)
            continue
          }
        }
      }
    }

    // 保存最终的推理内容
    if (reasoningText) {
      messages.value[currentIndex].reasoning_content = reasoningText
    }

  } catch (error: any) {
    console.error('请求出错:', error)
    if (error.name === 'AbortError') {
      messages.value[messages.value.length - 1].content += '\n\n[生成已终止]'
    } else {
      messages.value.pop()
      ElMessage.error(error.message || '请求失败，请重试')
    }
  } finally {
    loading.value = false
    isThinking.value = false
    controller.value = null
  }
}

// 获取 SiliconFlow API 的 access token
const getAccessToken = () => {
  return import.meta.env.VITE_SILICONFLOW_API_KEY
}

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

  try {
    // 添加来源网站信息
    const header = 'UIED在线免费工具：@https://uiedtool.com/tools/ai/deepseek-r1\n\n---\n\n'
    const chatContent = messages.value
      .filter(msg => msg.role !== 'system')
      .map(msg => {
        // 确保内容是字符串
        let content = msg.content
        if (typeof content !== 'string') {
          if (content === null || content === undefined) {
            content = ''
          } else if (typeof content === 'object') {
            try {
              content = JSON.stringify(content, null, 2)
            } catch (e) {
              content = String(content)
            }
          } else {
            content = String(content)
          }
        }

        // 添加推理内容（如果存在）
        let fullContent = content
        if (msg.reasoning_content) {
          fullContent = `推理过程：\n${msg.reasoning_content}\n\n回答：\n${content}`
        }

        return `${msg.role === 'user' ? '我' : 'AI'}：\n${fullContent}\n\n---\n`
      })
      .join('\n')

    // 创建并下载文件，添加header
    const blob = new Blob([header + chatContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `对话记录_${new Date().toLocaleString()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('对话记录已保存')
  } catch (error) {
    console.error('保存对话失败:', error)
    ElMessage.error('保存对话失败，请重试')
  }
}

// 添加暂停生成的控制器
const controller = ref<AbortController | null>(null)

// 停止生成函数
const stopGeneration = () => {
  if (controller.value) {
    controller.value.abort()
    controller.value = null
    loading.value = false
    ElMessage.info('已停止生成')
  }
}

// 清空对话
const clearChat = () => {
  messages.value = [{
    role: 'system',
    content: systemPrompt
  },
  {
    role: 'assistant',
    content: '👋 对话已清空，让我们重新开始吧！有什么我可以帮你的？'
  }]
  currentMessage.value = ''
  ElMessage.success('对话已清空 ✨')
}

// 复制消息
const copyMessage = async (content: any) => {
  try {
    // 确保内容是字符串
    let contentStr = '';

    if (content === null || content === undefined) {
      contentStr = '';
    } else if (typeof content === 'string') {
      contentStr = content;
    } else if (typeof content === 'object') {
      try {
        contentStr = JSON.stringify(content, null, 2);
      } catch (e) {
        console.error('JSON 序列化失败:', e);
        contentStr = '[复杂数据]';
      }
    } else {
      contentStr = String(content);
    }

    const tempElement = document.createElement('div');
    tempElement.innerHTML = await marked(contentStr);
    const plainText = tempElement.textContent || tempElement.innerText || contentStr;

    await navigator.clipboard.writeText(plainText);
    ElMessage({
      message: '内容已复制到剪贴板',
      type: 'success',
      duration: 2000
    });
  } catch (err) {
    console.error('复制失败:', err);
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000
    });
  }
};

// 删除消息
const deleteMessage = (index: number) => {
  if (messages.value[index].role === 'system') return
  messages.value.splice(index, 1)
  ElMessage.success('消息已删除 🗑️')
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
  // 在 onMounted 中初始化所有推理内容为展开状态
  messages.value.forEach((_, index) => {
    reasoningVisible.value[index] = true
  })

  // 初始化代码高亮
  hljs.configure({
    ignoreUnescapedHTML: true,
    cssSelector: 'pre code',
    languages: ['javascript', 'typescript', 'python', 'java', 'html', 'css', 'bash', 'json']
  })

  // 使用兼容的方式设置代码高亮
  const markedOptions = {
    breaks: true,
    gfm: true,
    langPrefix: 'hljs language-',
    highlight: function (code: string, lang?: string) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      try {
        return hljs.highlight(code, { language }).value;
      } catch (err) {
        console.error('代码高亮错误:', err);
        return code;
      }
    }
  };

  // 配置自定义渲染器
  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string, lang?: string }) {
    const code = text
    const language = lang || 'plaintext';
    const id = 'code-block-' + Math.random().toString(36).substr(2, 9);

    try {
      const highlighted = lang && hljs.getLanguage(lang)
        ? hljs.highlight(code, { language }).value
        : code;

      // 添加行号
      const lines = highlighted.split('\n');
      const lineNumbers = lines.map((_, i) => `<span class="line-number">${i + 1}</span>`).join('\n');

      return `<div class="code-block-wrapper">
        <div class="code-header">
          <span class="code-lang">${language}</span>
          <button class="copy-btn" onclick="copyCode('${id}')">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            复制
          </button>
        </div>
        <div class="code-content">
          <div class="line-numbers" aria-hidden="true">${lineNumbers}</div>
          <pre><code class="hljs language-${language}" id="${id}">${highlighted}</code></pre>
        </div>
      </div>`;
    } catch (e) {
      return `<pre><code class="hljs language-${language}">${code}</code></pre>`;
    }
  };

  marked.use({ renderer });

  // 全局暴露复制函数
  (window as any).copyCode = (id: string) => {
    const codeElement = document.getElementById(id);
    if (codeElement) {
      const code = codeElement.textContent || '';
      navigator.clipboard.writeText(code).then(() => {
        ElMessage.success('代码已复制');
      }).catch(() => {
        ElMessage.error('复制失败');
      });
    }
  };
})

const renderMarkdown = (content: string) => {
  try {
    return marked(content || '')
  } catch (e) {
    console.error('Markdown渲染错误:', e)
    return content
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keypress', handleKeyPress)
  // 清理全局函数
  delete (window as any).copyCode
})
</script>

<style scoped>
/* 隐藏滚动条但保留滚动功能 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 消息动画 */
.message-container {
  @apply flex w-full opacity-0 translate-y-4 animate-fade-in-up;
}

.message-container.user {
  @apply flex-row-reverse;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

/* 思考过程样式 */
.reasoning-content {
  @apply mb-3 bg-blue-50/50 rounded-lg border border-blue-100 overflow-hidden;
}

.reasoning-header {
  @apply flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors select-none;
}

/* 打字机光标效果 */
.typing-cursor::after {
  content: '|';
  animation: blink 1s infinite;
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

/* 深度思考加载动画 */
.thinking-dots {
  display: flex;
  column-gap: 0.25rem;
}

.thinking-dot {
  width: 0.375rem;
  height: 0.375rem;
  background-color: #60a5fa;
  border-radius: 9999px;
  animation: bounce 1s infinite;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }

  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

.thinking-dot:nth-child(2) {
  animation-delay: 0.1s;
}

.thinking-dot:nth-child(3) {
  animation-delay: 0.2s;
}

/* 打字机加载动画 */
.typing-dot {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #9ca3af;
  border-radius: 9999px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
</style>

<style>
/* Markdown 内容样式 */
.markdown-body {
  @apply text-gray-800 text-base leading-relaxed break-words;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.markdown-body p {
  @apply mb-3 last:mb-0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4 {
  @apply font-bold text-gray-900 mt-6 mb-3 first:mt-0;
}

.markdown-body h1 {
  @apply text-2xl border-b border-gray-200 pb-2;
}

.markdown-body h2 {
  @apply text-xl border-b border-gray-200 pb-2;
}

.markdown-body h3 {
  @apply text-lg;
}

.markdown-body ul,
.markdown-body ol {
  @apply pl-6 mb-4;
}

.markdown-body ul {
  @apply list-disc;
}

.markdown-body ol {
  @apply list-decimal;
}

.markdown-body li {
  @apply mb-1;
}

.markdown-body blockquote {
  @apply border-l-4 border-blue-200 bg-blue-50 py-2 px-4 my-4 rounded-r text-gray-600 italic;
}

.markdown-body code {
  @apply bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600;
}

.markdown-body pre {
  @apply bg-[#282c34] rounded-lg my-4 overflow-hidden shadow-sm border border-gray-200 p-0 !important;
}

.markdown-body pre code {
  @apply bg-transparent p-0 text-gray-100 block overflow-x-auto text-sm font-mono leading-relaxed;
}

.markdown-body a {
  @apply text-blue-600 hover:text-blue-800 hover:underline transition-colors;
}

.markdown-body table {
  @apply w-full border-collapse my-4 text-sm;
}

.markdown-body th,
.markdown-body td {
  @apply border border-gray-200 px-4 py-2;
}

.markdown-body th {
  @apply bg-gray-50 font-bold text-gray-700;
}

.markdown-body hr {
  @apply my-6 border-gray-200;
}

/* 代码块样式优化 */
.code-block-wrapper {
  @apply my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#282c34] shadow-md;
}

.code-header {
  @apply flex justify-between items-center px-4 py-2 bg-[#21252b] border-b border-gray-700 text-xs text-gray-400 select-none;
}

.code-lang {
  @apply font-mono uppercase font-bold tracking-wider text-blue-400;
}

.copy-btn {
  @apply flex items-center gap-1 text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none;
}

.code-content {
  position: relative;
  display: flex;
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
  background-color: #282c34;
  scrollbar-width: thin;
  scrollbar-color: #4b5563 transparent;
}

.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: transparent;
}

.code-content::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 4px;
}

.line-numbers {
  @apply hidden md:flex flex-col text-right px-3 py-4 text-gray-500 border-r border-gray-700 bg-[#282c34] select-none font-mono text-sm leading-relaxed sticky left-0 z-10 min-w-[3rem];
}

.line-number {
  @apply block h-6 leading-6;
}

.markdown-body pre {
  @apply m-0 p-4 !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  flex: 1;
  overflow: visible !important;
}

.markdown-body pre code {
  @apply p-0 bg-transparent text-gray-200 font-mono text-sm leading-6 whitespace-pre;
  tab-size: 2;
}

/* 滚动条样式 */
.code-content::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: #282c34;
}

.code-content::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .line-numbers {
    display: none;
  }

  .markdown-body pre {
    padding: 1rem !important;
  }
}

/* 提示词弹窗样式 */
.prompt-popover {
  @apply rounded-xl shadow-xl border border-gray-100 !important;
}

/* 模型选择下拉框样式 */
.model-select-dropdown {
  @apply rounded-xl shadow-xl border border-gray-100 !important;
}

.el-select-dropdown__item {
  @apply px-3 py-2 !important;
}

.el-select-dropdown__item.selected {
  @apply text-blue-600 font-medium bg-blue-50 !important;
}
</style>
