<template>
  <div class="ai-chat-container w-full h-[calc(100vh-60px)] flex flex-col bg-white font-sans">
    <div class="flex-1 flex overflow-hidden">
      <!-- Mobile Sidebar Backdrop -->
      <div v-if="isMobileSidebarOpen"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity"
        @click="isMobileSidebarOpen = false">
      </div>

      <!-- Sidebar / Chat History -->
      <div :class="['w-[280px] bg-gray-50/50 border-r border-gray-100 flex flex-col flex-shrink-0 transition-transform duration-300 z-40',
        'fixed inset-y-0 left-0 md:relative md:translate-x-0',
        isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none']">
        <!-- Sidebar Header -->
        <div class="p-5 space-y-4">
          <button @click="createNewChat"
            class="w-full py-3 px-4 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-700 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md group">
            <div class="bg-blue-50 p-1 rounded-lg group-hover:bg-blue-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span class="font-semibold text-sm">开启新对话</span>
          </button>
        </div>

        <!-- History List -->
        <div class="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <div v-if="history.length === 0" class="flex flex-col items-center justify-center h-20 text-gray-400">
            <p class="text-xs">暂无历史记录</p>
          </div>

          <div v-else class="mb-2 px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">历史记录</div>

          <div v-for="session in history" :key="session.id" @click="switchSession(session.id)"
            class="group relative px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent"
            :class="currentSessionId === session.id ? 'bg-white border-gray-100 shadow-sm' : 'hover:bg-gray-100'">
            <div class="flex items-start space-x-3">
              <div class="flex-1 min-w-0">
                <h3 class="text-sm text-gray-700 truncate pr-6 transition-colors"
                  :class="currentSessionId === session.id ? 'font-semibold text-gray-900' : 'group-hover:text-gray-900'">
                  {{ session.title || '新对话' }}
                </h3>
                <div class="flex items-center mt-1 space-x-2">
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 group-hover:bg-white transition-colors">
                    {{ session.model?.split('/').pop()?.replace(/-/g, ' ') || 'AI' }}
                  </span>
                  <span class="text-[10px] text-gray-400">
                    {{ formatTime(session.updatedAt) }}
                  </span>
                </div>
              </div>

              <!-- Delete Button -->
              <button @click.stop="deleteSession(session.id)"
                class="absolute right-2 top-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="删除对话">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-gray-100 bg-white">
          <button @click="clearAllHistory"
            class="w-full flex items-center justify-center space-x-2 text-xs text-gray-500 hover:text-red-600 transition-colors py-2.5 rounded-lg hover:bg-red-50 group">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
            <span>清空所有记录</span>
          </button>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex flex-col bg-white relative min-w-0">
        <!-- Chat Header -->
        <div
          class="h-16 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div class="flex items-center space-x-3 md:space-x-4 flex-1">
            <!-- Mobile Menu Button -->
            <button @click="isMobileSidebarOpen = !isMobileSidebarOpen"
              class="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              class="flex items-center bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg p-1 border border-gray-200">
              <div class="pl-2 pr-1">
                <svg v-if="!currentModel" class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z">
                  </path>
                </svg>
                <span v-else v-html="getModelIcon(currentModel)"
                  class="flex items-center justify-center w-4 h-4"></span>
              </div>
              <el-select v-model="currentModel" placeholder="选择模型" size="small" class="!w-48 !border-none"
                :loading="loadingModels" @change="handleModelChange">
                <el-option v-for="model in models" :key="model" :label="model" :value="model">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center space-x-2">
                      <span v-html="getModelIcon(model)" class="w-4 h-4 flex items-center text-gray-500"></span>
                      <span>{{ model }}</span>
                    </div>
                    <span v-if="model === currentModel" class="text-blue-500 text-xs">当前</span>
                  </div>
                </el-option>
              </el-select>
            </div>

            <div class="hidden md:block h-4 w-px bg-gray-200"></div>

            <!-- Header Links -->
            <div class="hidden md:flex items-center space-x-4">
              <a v-for="link in headerLinks" :key="link.name" :href="link.url" target="_blank" rel="noopener noreferrer"
                class="text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium">
                {{ link.name }}
              </a>
            </div>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center space-x-2">
            <button @click="showSettings = true"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="设置">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                </path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth" ref="messagesContainer">
          <div v-if="!currentSession || currentSession.messages.length === 0"
            class="h-full flex flex-col items-center justify-center text-gray-400 space-y-8 -mt-10">
            <div class="relative">
              <div
                class="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-float">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M16 10h.01" />
                </svg>
              </div>
              <div class="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div class="text-center space-y-3 max-w-md mx-auto">
              <h2 class="text-2xl font-bold text-gray-900">有什么可以帮你的？</h2>
              <p class="text-gray-500 text-sm leading-relaxed">我是你的 AI 智能助手，可以帮你写代码、解答问题、提供创意灵感。请在下方输入问题开始对话。</p>
            </div>

            <!-- Quick Suggestions -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl px-4">
              <div v-for="agent in quickPrompts" :key="agent.name" @click="useAgent(agent)"
                class="p-3 md:p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-300 flex items-center justify-between group">
                <div class="flex items-center space-x-2 md:space-x-3">
                  <span class="text-lg md:text-xl">{{ agent.icon }}</span>
                  <span
                    class="text-xs md:text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{{
                      agent.name }}</span>
                </div>
                <div
                  class="hidden md:flex w-6 h-6 rounded-full bg-gray-50 group-hover:bg-blue-50 items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg"
                    class="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div v-for="(msg, index) in currentSession?.messages" :key="index"
            :class="['flex w-full max-w-5xl mx-auto animate-fade-in', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div
              :class="['flex items-start gap-3 md:gap-4 max-w-[95%] sm:max-w-[90%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
              <!-- Avatar -->
              <div class="flex-shrink-0 mt-1">
                <div v-if="msg.role === 'user'"
                  class="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-md">
                  <span class="text-white text-xs font-bold">ME</span>
                </div>
                <div v-else
                  class="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm p-0.5">
                  <img :src="uiedLogo" alt="AI" class="w-full h-full object-contain" />
                </div>
              </div>

              <!-- Bubble -->
              <div class="flex flex-col gap-1.5 min-w-0">
                <div class="flex items-center space-x-2 px-1"
                  :class="msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''">
                  <span class="text-xs font-medium text-gray-900">{{ msg.role === 'user' ? '我' : 'AI 助手' }}</span>
                  <span class="text-[10px] text-gray-400">{{ msg.time }}</span>
                </div>

                <div :class="[
                  'px-5 py-4 rounded-2xl text-[15px] leading-7 shadow-sm break-words border',
                  msg.role === 'user'
                    ? 'bg-[#f3f4f6] text-gray-900 border-transparent rounded-tr-sm'
                    : 'bg-white border-gray-100 text-gray-800 rounded-tl-sm'
                ]">
                  <!-- Reasoning Content (Thinking) -->
                  <div v-if="msg.reasoning_content"
                    class="mb-4 rounded-xl bg-gray-50/80 border border-gray-200 overflow-hidden">
                    <div
                      class="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-100/50 transition-colors select-none"
                      @click="msg.showReasoning = !msg.showReasoning">
                      <div class="flex items-center text-xs font-medium text-gray-600">
                        <svg class="w-3.5 h-3.5 mr-2 text-blue-500" fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
                          </path>
                        </svg>
                        深度思考过程
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 text-gray-400 transition-transform duration-300"
                        :class="msg.showReasoning ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                    <div v-show="msg.showReasoning"
                      class="px-4 pb-4 pt-1 border-t border-gray-100/50 text-xs text-gray-600 leading-relaxed italic">
                      {{ msg.reasoning_content }}
                    </div>
                  </div>

                  <!-- Main Content -->
                  <div v-if="msg.content" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
                  <div v-else class="flex items-center space-x-1 h-7 px-2">
                    <div class="typing-dot"></div>
                    <div class="typing-dot" style="animation-delay: 0.2s"></div>
                    <div class="typing-dot" style="animation-delay: 0.4s"></div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-3 px-1 mt-1"
                  :class="msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'">
                  <button v-if="msg.role === 'assistant' && msg.content" @click="copyToClipboard(msg.content)"
                    class="flex items-center text-[10px] text-gray-400 hover:text-blue-600 transition-colors group"
                    title="复制内容">
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 mr-1 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    复制
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 md:p-6 pt-2">
          <div class="max-w-5xl mx-auto relative">
            <div
              class="relative bg-white rounded-3xl border border-gray-100 shadow-md shadow-gray-100/50 focus-within:border-gray-200 focus-within:shadow-lg focus-within:shadow-gray-200/50 transition-all duration-300 overflow-hidden">
              <textarea v-model="inputText" @keydown.enter.prevent="handleEnter" rows="1" ref="textareaRef"
                placeholder="输入您的问题，Shift + Enter 换行..."
                class="w-full pl-6 pr-20 py-5 bg-transparent border-none focus:ring-0 outline-none resize-none max-h-60 min-h-[72px] text-gray-700 text-base leading-relaxed placeholder-gray-400"
                style="height: 72px;"></textarea>

              <div class="absolute right-4 bottom-3.5 flex items-center space-x-2">
                <button @click="sendMessage" :disabled="loading || !inputText.trim()" :class="[
                  'p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center group',
                  loading || !inputText.trim()
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-sm'
                ]">
                  <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                    viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-center mt-3 flex items-center justify-center space-x-4">
              <p class="text-xs text-gray-400">内容由 AI 生成，可能存在错误，请仔细甄别。</p>
              <p class="text-xs text-gray-400">对话数据存储在浏览器，本网站不保留记录。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="mt-8">
    <ToolsRecommend :currentPath="route.path" />
  </div>

  <!-- Settings Dialog -->
  <el-dialog v-model="showSettings" title="对话设置" width="500px" :close-on-click-modal="false">
    <div class="space-y-6 py-2">
      <!-- System Prompt -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 flex items-center">
          系统提示词 (System Prompt)
          <el-tooltip content="设置 AI 的角色设定或行为准则" placement="top">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 text-gray-400 cursor-help" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </el-tooltip>
        </label>
        <el-input v-model="settings.systemPrompt" type="textarea" :rows="4"
          placeholder="例如：你是一个专业的 Python 程序员，请用简洁的代码回答我的问题。" class="w-full" />
      </div>

      <!-- Temperature -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <label class="text-sm font-medium text-gray-700">随机性 (Temperature)</label>
          <span class="text-xs text-gray-500">{{ settings.temperature }}</span>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-xs text-gray-400">严谨</span>
          <el-slider v-model="settings.temperature" :min="0" :max="1" :step="0.1" class="flex-1"
            :show-tooltip="false" />
          <span class="text-xs text-gray-400">创意</span>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <button @click="showSettings = false"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mr-2">
          取消
        </button>
        <button @click="saveSettings"
          class="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          保存设置
        </button>
      </span>
    </template>
  </el-dialog>

  <!-- Verify Dialog -->
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
      <div class="flex justify-end">
        <button @click="showVerifyDialog = false"
          class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mr-2">
          取消
        </button>
        <button @click="verifyAccess"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          验证
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { ElMessage, ElSelect, ElOption, ElMessageBox, ElDialog, ElSwitch, ElInput, ElSlider, ElTooltip } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import uiedLogo from '@/assets/uiedlogo.png'

// Types
interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
  reasoning_content?: string
  showReasoning?: boolean
}

interface ChatSession {
  id: string
  title: string
  model: string
  messages: Message[]
  updatedAt: number
}

interface Agent {
  name: string
  icon: string
  prompt: string
}

// Setup Route
const route = useRoute()

// State
const models = ref<string[]>([])
const loadingModels = ref(false)
const currentModel = ref('')
const history = ref<ChatSession[]>([])
const currentSessionId = ref<string>('')
const inputText = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLElement | null>(null)
const isMobileSidebarOpen = ref(false)

// Usage Limit State
const usageCount = ref(Number(localStorage.getItem('aichat_usage_count')) || 0)
const isVerified = ref(Boolean(localStorage.getItem('aichat_verified')))
const showVerifyDialog = ref(false)
const verifyPassword = ref('')
const maxFreeUsage = ref(5)

const verifyAccess = () => {
  if (verifyPassword.value.toLowerCase() === 'uied2025') {
    isVerified.value = true
    localStorage.setItem('aichat_verified', 'true')
    showVerifyDialog.value = false
    ElMessage.success('验证成功，您可以继续使用了')
  } else {
    ElMessage.error('密码错误，请关注公众号获取正确的密码')
  }
}

// Settings State
const showSettings = ref(false)
const settings = ref({
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000
})

// Office Agents Data
const quickPrompts: Agent[] = [
  { name: '周报生成', icon: '📝', prompt: '请帮我生成一份周报，包含以下工作内容：\n1. \n2. \n3. \n\n以及下周计划和遇到的问题。' },
  { name: '邮件润色', icon: '📧', prompt: '请帮我润色以下邮件内容，使其更加专业得体：\n' },
  { name: '代码优化', icon: '💻', prompt: '请帮我优化这段代码，提高性能和可读性：\n' },
  { name: '头脑风暴', icon: '💡', prompt: '我需要关于以下主题的创意点子：\n' },
  { name: '文章摘要', icon: '📄', prompt: '请帮我总结这篇文章的核心内容：\n' },
  { name: '翻译助手', icon: '🌍', prompt: '请帮我将以下内容翻译成英文（或中文）：\n' },
  { name: '会议纪要', icon: '📊', prompt: '请根据以下会议记录整理一份会议纪要：\n' },
  { name: '代码解释', icon: '🧐', prompt: '请解释这段代码的功能和逻辑：\n' }
]

// Header Links
const headerLinks = [
  { name: 'AI学习平台', url: 'https://www.uied.cn/' },
  { name: 'AI免费工具', url: 'https://uiedtool.com' },
  { name: 'AI资讯热榜', url: 'https://hot.uied.cn' },
  { name: 'AI工具导航', url: 'https://hao.uied.cn/ai' },
  { name: 'AI交流群', url: 'https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink' },
  { name: 'AI知识库', url: 'https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink' }
]

// Computed
const currentSession = computed(() => {
  return history.value.find(h => h.id === currentSessionId.value)
})

// LocalStorage Keys
const STORAGE_KEY = 'ai_chat_history'
const LAST_SESSION_KEY = 'ai_chat_last_session_id'
const SETTINGS_KEY = 'ai_chat_settings'

// Methods
const getModelIcon = (modelName: string) => {
  if (!modelName) return ''
  const name = modelName.toLowerCase()

  if (name.includes('deepseek')) {
    // DeepSeek (Blue Whale / D)
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#4d6bfe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke-width="1.5"/>
      <path d="M8.5 9.5c0-1.1 1.34-2 3-2s3 .9 3 2c0 1.1-.9 1.5-1.5 2-.6.5-1.5 1-1.5 2.5v.5" />
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
    </svg>`
  } else if (name.includes('gpt') || name.includes('openai')) {
    // OpenAI (GPT)
    return `<svg viewBox="0 0 24 24" fill="currentColor" class="text-green-600">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.06 6.06 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.98 5.98 0 0 0 10.28-2.1 6.05 6.05 0 0 0 .75-7.1v.02zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1l.14-.08 4.78-2.76a.8.8 0 0 0 .39-.68v-6.74l2.02 1.17a1.54 1.54 0 0 1 .83 1.32v5.64a4.52 4.52 0 0 1-5.28 3.13zM6.66 10.2a4.52 4.52 0 0 1 .7-5.22l1.91 1.1a1.54 1.54 0 0 1 .53 1.66l-2.02 5.61-2.6-1.5a4.48 4.48 0 0 1 1.48-1.65zm1.5 9.05a4.48 4.48 0 0 1-2.22-4.13l2.59 1.5a.8.8 0 0 0 .8 0l5.84-3.37-.14 2.33a1.54 1.54 0 0 1-1.04 1.35l-5.82 2.32zm11.14-4.22l-2.59-1.5a.8.8 0 0 0-.8 0l-5.83 3.37.13-2.33a1.54 1.54 0 0 1 1.05-1.35l5.82-2.32a4.52 4.52 0 0 1 2.22 4.13zm-1.4-7.21a4.52 4.52 0 0 1-.69 5.22l-1.91-1.1a1.54 1.54 0 0 1-.53-1.66l2.03-5.61 2.6 1.5a4.48 4.48 0 0 1 1.49 1.65zM7.39 13.1l4.78 2.76a.8.8 0 0 0 .39.68v6.74l-2.02-1.17a1.54 1.54 0 0 1-.83-1.32v-5.64a4.48 4.48 0 0 1-2.32-2.05z"/>
    </svg>`
  } else if (name.includes('claude')) {
    // Claude (Anthropic) - Stylized A/C
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#d97757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke-width="1.5"/>
      <path d="M8 16l4-8 4 8M10 13h4"/>
    </svg>`
  } else if (name.includes('gemini')) {
    // Gemini (Sparkle)
    return `<svg viewBox="0 0 24 24" fill="none" stroke="url(#gemini-gradient)" stroke-width="0">
      <defs>
        <linearGradient id="gemini-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4285f4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#db4437;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#4285f4"/>
    </svg>`
  }

  // Default generic AI icon
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><path d="M8 15h8"/></svg>`
}

const useAgent = (agent: Agent) => {
  // Start new chat or use current empty chat
  if (!currentSession.value || currentSession.value.messages.length > 0) {
    createNewChat()
  }

  inputText.value = agent.prompt
  // Don't auto send, let user fill in details
  nextTick(() => {
    textareaRef.value?.focus()
    autoResizeTextarea()
  })
}

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      settings.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load settings', e)
  }
}

const saveSettings = () => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
    showSettings.value = false
    ElMessage.success('设置已保存')
  } catch (e) {
    console.error('Failed to save settings', e)
  }
}

const formatTime = (timestamp: number) => {
  return dayjs(timestamp).format('MM-DD HH:mm')
}

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
    const lastId = localStorage.getItem(LAST_SESSION_KEY)
    if (lastId && history.value.some(h => h.id === lastId)) {
      currentSessionId.value = lastId
    } else if (history.value.length > 0) {
      currentSessionId.value = history.value[0].id
    } else {
      createNewChat()
    }
  } catch (e) {
    console.error('Failed to load history', e)
    createNewChat()
  }
}

const saveHistory = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
    localStorage.setItem(LAST_SESSION_KEY, currentSessionId.value)
  } catch (e) {
    console.error('Failed to save history', e)
  }
}

const createNewChat = () => {
  const newSession: ChatSession = {
    id: uuidv4(),
    title: '新对话',
    model: currentModel.value || models.value[0] || 'deepseek-v3',
    messages: [],
    updatedAt: Date.now()
  }
  history.value.unshift(newSession)
  currentSessionId.value = newSession.id
  saveHistory()

  // Focus textarea
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const deleteSession = (id: string) => {
  ElMessageBox.confirm(
    '确定要删除这条对话记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      const index = history.value.findIndex(h => h.id === id)
      if (index > -1) {
        history.value.splice(index, 1)
        if (currentSessionId.value === id) {
          if (history.value.length > 0) {
            currentSessionId.value = history.value[0].id
          } else {
            createNewChat()
          }
        }
        saveHistory()
        ElMessage.success('已删除')
      }
    })
    .catch(() => { })
}

const clearAllHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有对话记录吗？此操作不可恢复。',
    '警告',
    {
      confirmButtonText: '清空',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      history.value = []
      localStorage.removeItem(STORAGE_KEY)
      createNewChat()
      ElMessage.success('已清空所有记录')
    })
    .catch(() => { })
}

const switchSession = (id: string) => {
  currentSessionId.value = id
  currentModel.value = currentSession.value?.model || currentModel.value
  saveHistory() // update last session id
  scrollToBottom()
}

const handleModelChange = (val: string) => {
  if (currentSession.value) {
    currentSession.value.model = val
    saveHistory()
  }
}

const fetchModels = async () => {
  loadingModels.value = true
  try {
    const res = await axios.get('https://api.pearktrue.cn/api/aichat/')
    console.log('Models API Response:', res.data)

    let fetchedModels: string[] = []
    if (Array.isArray(res.data)) {
      fetchedModels = res.data
    } else if (res.data.data && Array.isArray(res.data.data)) {
      fetchedModels = res.data.data
    } else if (res.data.models && Array.isArray(res.data.models)) {
      fetchedModels = res.data.models
    } else {
      // Fallback
      fetchedModels = ['deepseek-v3', 'gpt-4o', 'claude-3-5-sonnet']
    }

    models.value = fetchedModels

    // If current session has no model set (newly created before models loaded), set it
    if (currentSession.value && !currentSession.value.model && models.value.length > 0) {
      currentSession.value.model = models.value[0]
      currentModel.value = models.value[0]
    } else if (currentSession.value) {
      currentModel.value = currentSession.value.model
    }

  } catch (error) {
    console.error('Failed to fetch models:', error)
    ElMessage.error('获取模型列表失败')
    models.value = ['deepseek-v3']
    currentModel.value = 'deepseek-v3'
  } finally {
    loadingModels.value = false
  }
}

const handleEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return
  sendMessage()
}

const autoResizeTextarea = () => {
  const el = textareaRef.value
  if (el) {
    el.style.height = '56px'
    el.style.height = `${Math.min(el.scrollHeight, 192)}px`
  }
}

watch(inputText, () => {
  nextTick(autoResizeTextarea)
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const renderMarkdown = (content: string) => {
  try {
    return marked.parse(content)
  } catch (e) {
    return content
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const sendMessage = async () => {
  if (!inputText.value.trim() || loading.value) return

  // Check usage limit
  if (!isVerified.value && usageCount.value >= maxFreeUsage.value) {
    showVerifyDialog.value = true
    return
  }

  if (!currentModel.value) {
    if (models.value.length > 0) {
      currentModel.value = models.value[0]
    } else {
      ElMessage.warning('模型列表加载中，请稍候...')
      return
    }
  }

  const prompt = inputText.value

  // Update session title if it's the first message or title is default
  if (currentSession.value) {
    if (currentSession.value.messages.length === 0 || currentSession.value.title === '新对话') {
      currentSession.value.title = prompt.slice(0, 10) + (prompt.length > 10 ? '...' : '')
    }
    currentSession.value.updatedAt = Date.now()
  }

  const userMsg: Message = {
    role: 'user',
    content: prompt,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Push to current session
  if (currentSession.value) {
    currentSession.value.messages.push(userMsg)
  }

  inputText.value = ''
  autoResizeTextarea()
  scrollToBottom()
  saveHistory() // Save user message

  loading.value = true

  // Increment usage count
  if (!isVerified.value) {
    usageCount.value++
    localStorage.setItem('aichat_usage_count', usageCount.value.toString())
  }

  // Prepare AI placeholder
  const aiMsg: Message = {
    role: 'assistant',
    content: '',
    time: 'Thinking...',
    reasoning_content: '',
    showReasoning: true
  }

  if (currentSession.value) {
    currentSession.value.messages.push(aiMsg)
  }

  try {
    // Prepare history context (limit to last 10 messages to avoid token limits)
    const historyContext = currentSession.value
      ? currentSession.value.messages.slice(0, -2).slice(-10).map(m => ({ role: m.role, content: m.content }))
      : []

    const messagesToSend = []

    // Add System Prompt if exists
    if (settings.value.systemPrompt) {
      messagesToSend.push({ role: 'system', content: settings.value.systemPrompt })
    }

    messagesToSend.push(...historyContext)
    messagesToSend.push({ role: 'user', content: prompt })

    // 使用 axios 获取完整响应，然后模拟流式输出
    const response = await axios.post('https://api.pearktrue.cn/api/aichat/', {
      model: currentModel.value,
      messages: messagesToSend,
      stream: false,
      temperature: settings.value.temperature
    })

    const data = response.data
    console.log('Chat API Response:', data)

    if (currentSession.value) {
      const targetMsg = currentSession.value.messages[currentSession.value.messages.length - 1]

      if (data.code === 200) {
        const content = data.content || data.data?.content || ''
        const reasoning = data.reasoning_content || data.data?.reasoning_content || ''

        targetMsg.content = '' // 清空加载状态
        targetMsg.reasoning_content = reasoning

        // 模拟打字机效果
        const chars = content.split('')
        let index = 0

        const typeNextChar = () => {
          if (index < chars.length) {
            targetMsg.content += chars[index]
            index++
            scrollToBottom()

            // 根据内容调整打字速度
            // 代码块稍微快一点
            const delay = chars[index] === '`' ? 10 : 30

            requestAnimationFrame(() => {
              setTimeout(typeNextChar, delay)
            })
          } else {
            // 打字结束
            targetMsg.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            saveHistory()

            // Highlight code blocks
            nextTick(() => {
              document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement)
              })
            })
          }
        }

        typeNextChar()

      } else {
        targetMsg.content = `Error: ${data.msg || 'Unknown error'}`
        saveHistory()
      }

      // Sort history by updated time
      const current = currentSession.value
      const idx = history.value.findIndex(h => h.id === current.id)
      if (idx > 0) {
        history.value.splice(idx, 1)
        history.value.unshift(current)
      }
    }

  } catch (error) {
    console.error('Chat failed:', error)
    if (currentSession.value) {
      const targetMsg = currentSession.value.messages[currentSession.value.messages.length - 1]
      targetMsg.content = '抱歉，发生了一些错误，请稍后重试。'
      saveHistory()
    }
  } finally {
    loading.value = false
  }
}

// Initialize
const renderer = new marked.Renderer()
renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
  try {
    const highlighted = hljs.highlight(text, { language }).value
    return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
  } catch {
    return `<pre><code class="hljs language-${language}">${text}</code></pre>`
  }
}

marked.use({
  renderer,
  breaks: true
})

onMounted(async () => {
  loadHistory()
  loadSettings()
  await fetchModels()
})
</script>

<style scoped>
.typing-dot {
  width: 6px;
  height: 6px;
  background-color: #9ca3af;
  /* gray-400 */
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.2);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.4);
}

/* Markdown Styles - Scoped to avoid global pollution, but we use deep selector */
:deep(.markdown-body) {
  font-size: 0.95rem;
  line-height: 1.75;
  color: inherit;
}

:deep(.markdown-body p) {
  margin-bottom: 0.75em;
}

:deep(.markdown-body p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-body pre) {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  margin: 1rem 0;
  border: 1px solid #e2e8f0;
}

:deep(.markdown-body code) {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 0.85em;
  background-color: rgba(175, 184, 193, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

:deep(.markdown-body pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 1.5em;
  margin-bottom: 0.75em;
  list-style-type: disc;
}

:deep(.markdown-body ol) {
  list-style-type: decimal;
}

:deep(.markdown-body a) {
  color: #3b82f6;
  text-decoration: none;
}

:deep(.markdown-body a:hover) {
  text-decoration: underline;
}

:deep(.markdown-body blockquote) {
  border-left: 4px solid #e2e8f0;
  padding-left: 1em;
  color: #64748b;
  margin: 1em 0;
}

:deep(.el-select .el-input__wrapper) {
  box-shadow: none !important;
  background-color: transparent !important;
}

:deep(.el-select .el-input__inner) {
  font-weight: 500;
  color: #374151;
}
</style>
