<template>
  <!-- 搜索面板 -->
  <div v-if="visible" class="search-panel">
    <div class="search-mask" @click="handleClose"></div>
    <div class="search-wrapper">
      <!-- 标题栏 -->
      <div class="panel-header">
        <div class="header-left">
          <h2 class="panel-title">AI智能搜索</h2>
          <div class="header-subtitle">
            本服务由
            <a :href="searchProviderLink" target="_blank" class="provider-link">
              {{ searchProviderLabel }}
            </a>
            提供
          </div>
        </div>
        <el-button class="close-btn" @click="handleClose">
          <el-icon>
            <Close />
          </el-icon>
        </el-button>
      </div>

      <!-- 搜索区域 -->
      <div class="search-content">
        <!-- 对话内容区 -->
        <div class="chat-container" v-if="currentQuestion && aiResponse">
          <!-- 历史对话 -->
          <template v-for="(chat, index) in chatHistory" :key="index">
            <div class="chat-message user-message">
              <div class="message-avatar">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <div class="message-content">{{ chat.question }}</div>
            </div>
            <div class="chat-message ai-message">
              <div class="message-avatar">
                <div class="ai-avatar-wrapper">
                  <el-icon class="ai-icon">
                    <ChatDotRound />
                  </el-icon>
                </div>
              </div>
              <div class="message-content">
                <div class="final-answer">
                  <div class="answer-header">
                    <el-icon>
                      <Check />
                    </el-icon>
                    <span>回答</span>
                  </div>
                  <div class="answer-text" v-html="getHistoryAnswerHtml(chat.answer.content)"></div>
                </div>
              </div>
            </div>
          </template>

          <!-- 当前对话 -->
          <div v-if="aiResponse" class="chat-message user-message">
            <div class="message-avatar">
              <el-icon>
                <User />
              </el-icon>
            </div>
            <div class="message-content">{{ currentQuestion }}</div>
          </div>
          <div v-if="aiResponse" class="chat-message ai-message">
            <div class="message-avatar">
              <div class="ai-avatar-wrapper">
                <el-icon class="ai-icon">
                  <ChatDotRound />
                </el-icon>
              </div>
            </div>
            <div class="message-content">
              <!-- 最终答案 -->
              <div class="final-answer">
                <div class="answer-header">
                  <el-icon>
                    <Check />
                  </el-icon>
                  <span>回答</span>
                </div>
                <div class="answer-text" v-html="currentAnswerHtml"></div>
              </div>

              <!-- 工具推荐 -->
              <div v-if="aiResponse.suggestions?.length" class="suggested-tools">
                <div class="tools-grid">
                  <div
                    v-for="tool in aiResponse.suggestions"
                    :key="tool.url"
                    :class="['tool-card', { 'tool-card--disabled': isToolEntryDisabled(tool.url) }]"
                    @click="handleToolClick(tool.url, tool.title)"
                  >
                    <div v-if="isToolEntryDisabled(tool.url)" class="tool-disabled-tag">已停用</div>
                    <div class="tool-info">
                      <h3 class="tool-title">{{ tool.title }}</h3>
                      <p class="tool-desc">{{ tool.description }}</p>
                    </div>
                    <div class="tool-actions">
                      <el-button
                        type="primary"
                        size="small"
                        :disabled="isToolEntryDisabled(tool.url)"
                        @click.stop="handleToolClick(tool.url, tool.title)"
                      >
                        <el-icon>
                          <LinkIcon />
                        </el-icon>
                        打开工具
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷工具 -->
        <template v-if="!currentQuestion">
          <div class="welcome-section">
            <h3 class="welcome-title">AI智能助手</h3>
            <p class="welcome-desc">我可以帮您查找工具、解答问题或推荐解决方案。</p>
          </div>

          <div class="quick-access">
            <div class="section-title">快捷入口</div>
            <div class="quick-tools-grid">
              <div
                v-for="tool in quickTools"
                :key="tool.url"
                :class="['quick-tool-item', { 'quick-tool-item--disabled': isToolEntryDisabled(tool.url) }]"
                @click="handleToolClick(tool.url, tool.title)"
              >
                <div v-if="isToolEntryDisabled(tool.url)" class="tool-disabled-tag">已停用</div>
                <div class="quick-tool-content">
                  <span class="quick-tool-title">{{ tool.title }}</span>
                  <p class="quick-tool-desc">{{ tool.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索历史 -->
          <div v-if="searchHistory.length" class="search-history">
            <div class="history-header">
              <h3 class="section-title">搜索历史</h3>
              <button class="clear-history" @click="clearHistory">
                <el-icon>
                  <Delete />
                </el-icon>
                <span>清空历史</span>
              </button>
            </div>
            <div class="history-list">
              <div v-for="(item, index) in searchHistory" :key="index" class="history-item"
                @click="handleHistoryClick(item)">
                <div class="history-item-content">
                  <el-icon class="history-icon">
                    <Search />
                  </el-icon>
                  <span class="history-text">{{ item }}</span>
                </div>
                <el-button class="delete-btn" type="text" @click.stop="removeHistory(index)">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </template>

        <!-- 加载中状态 -->
        <div v-if="searchParam.loading" class="loading-state">
          <el-icon class="loading-icon" :size="24">
            <Loading />
          </el-icon>
          <span>AI正在思考中...</span>
        </div>
      </div>

      <!-- 底部搜索框 -->
      <div class="search-footer">
        <div class="search-input-wrapper">
          <el-input v-model="searchParam.title" placeholder="输入关键词搜索工具，或描述您的需求..." :prefix-icon="Search"
            class="search-input" @keyup.enter="handleEnterSearch" :loading="searchParam.loading"
            :disabled="searchParam.loading" />
          <div class="button-group">
            <button v-if="searchParam.title && !searchParam.loading" class="clear-btn" @click="handleClear">
              <el-icon>
                <Close />
              </el-icon>
            </button>
            <button class="send-btn" @click="handleSearch" :disabled="searchParam.loading">
              <span v-if="!searchParam.loading">发送</span>
              <el-icon v-else class="loading-icon">
                <Loading />
              </el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Search, Delete, Link as LinkIcon, Close, Loading, User, ChatDotRound, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { searchWithAI, type AISearchResponse } from '@/services/ai'
import { getDefaultSitePublicConfig, getSitePublicConfig, type SiteQuickToolItem } from '@/services/siteConfig'
import type { Tool, ToolCategory } from '@/types/tools'
import logoImg from '@/assets/uiedlogo.png'
import { ensureMarkedRuntime } from '@/utils/toolRuntimeLoaders'
import { debugLog, debugError, isDev } from '@/utils/debug'

// 测试logo是否正确加载 - 仅在开发环境
isDev && debugLog('Logo 路径:', logoImg)

type MarkedCore = typeof import('marked').marked
let markedCore: MarkedCore | null = null
let markedConfigured = false
const markedReady = ref(false)
const defaultSearchQuickTools = getDefaultSitePublicConfig().searchQuickTools
const quickTools = ref<SiteQuickToolItem[]>(defaultSearchQuickTools)
const searchProviderLabel = ref(getDefaultSitePublicConfig().searchProviderLabel)
const searchProviderLink = ref(getDefaultSitePublicConfig().searchProviderLink)
const toolRuntimeEntryMap = ref<Map<string, Tool>>(new Map())

/**
 * 按需加载并配置搜索面板 Markdown 渲染器
 * 首次使用时加载 marked，统一设置换行与外链行为
 */
const ensureSearchMarkedCore = async () => {
  if (!markedCore) {
    const runtime = await ensureMarkedRuntime()
    markedCore = runtime.marked
  }

  if (!markedConfigured && markedCore) {
    const renderer = new markedCore.Renderer()
    // @ts-ignore - 忽略TypeScript类型错误，运行时能正常工作
    renderer.link = function (href, title, text) {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    }

    markedCore.setOptions({
      breaks: true,
      gfm: true,
      renderer
    })
    markedConfigured = true
  }

  if (!markedReady.value) {
    markedReady.value = true
  }

  return markedCore
}

// 定义组件的props
const props = defineProps<{
  visible: boolean
}>()

// 定义组件的emit
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'select', url: string): void
}>()

// 搜索参数
const searchParam = reactive({
  title: '',
  loading: false,
})

// AI响应数据
const aiResponse = ref<AISearchResponse | null>(null)

// 搜索历史
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10

// 缓存的响应内容
const responseBuffer = reactive({
  content: ''
})

// 是否正在输出
const isTyping = ref(false)

// 对话历史
const chatHistory = ref<Array<{
  question: string
  answer: AISearchResponse
}>>([])
const currentQuestion = ref('')

const currentAnswerHtml = ref('')
const historyAnswerHtmlCache = new Map<string, string>()
const MAX_HISTORY_HTML_CACHE_SIZE = 120
let currentAnswerRenderTimer: ReturnType<typeof setTimeout> | null = null
let pendingResponseChunk = ''
let responseFlushRafId: number | null = null

/**
 * 同步解析 Markdown 文本
 * 统一处理解析器未就绪与异常场景，确保渲染流程始终可用
 * @param content Markdown 文本
 * @returns HTML 字符串
 */
const parseMarkdownContent = (content: string) => {
  if (!content) return ''

  const ready = markedReady.value
  if (!ready || !markedCore) {
    void ensureSearchMarkedCore()
    return content
  }

  try {
    return markedCore.parse(content) as string
  } catch (error) {
    debugError('Markdown 解析失败:', error)
    return content
  }
}

/**
 * 维护历史回答 HTML 缓存上限
 * 超出容量时移除最早缓存项，避免长会话造成内存持续增长
 * @param key 缓存键
 * @param html 缓存值
 */
const setHistoryAnswerHtmlCache = (key: string, html: string) => {
  if (historyAnswerHtmlCache.has(key)) return
  if (historyAnswerHtmlCache.size >= MAX_HISTORY_HTML_CACHE_SIZE) {
    const oldestKey = historyAnswerHtmlCache.keys().next().value
    if (oldestKey) {
      historyAnswerHtmlCache.delete(oldestKey)
    }
  }
  historyAnswerHtmlCache.set(key, html)
}

/**
 * 获取历史回答的渲染结果
 * 历史消息使用缓存复用解析结果，减少每次渲染重复执行 marked.parse
 * @param content 历史回答内容
 * @returns HTML 字符串
 */
const getHistoryAnswerHtml = (content: string) => {
  if (!content) return ''
  const cachedHtml = historyAnswerHtmlCache.get(content)
  if (cachedHtml) return cachedHtml

  const parsedHtml = parseMarkdownContent(content)
  setHistoryAnswerHtmlCache(content, parsedHtml)
  return parsedHtml
}

/**
 * 调度当前回答 HTML 渲染
 * 流式输出时采用短延时防抖，降低高频 chunk 更新对主线程的压力
 * @param content 当前回答 Markdown 文本
 * @param immediate 是否立即渲染
 */
const scheduleCurrentAnswerHtmlRender = (content: string, immediate = false) => {
  if (currentAnswerRenderTimer) {
    clearTimeout(currentAnswerRenderTimer)
    currentAnswerRenderTimer = null
  }

  const runRender = () => {
    currentAnswerHtml.value = parseMarkdownContent(content)
  }

  if (immediate) {
    runRender()
    return
  }

  currentAnswerRenderTimer = setTimeout(() => {
    runRender()
    currentAnswerRenderTimer = null
  }, 120)
}

/**
 * 刷新待输出的流式分片
 * 通过 requestAnimationFrame 合并多次 chunk 更新，减少响应式状态频繁写入
 */
const flushPendingResponseChunk = () => {
  responseFlushRafId = null
  if (!aiResponse.value || !pendingResponseChunk) return

  responseBuffer.content += pendingResponseChunk
  pendingResponseChunk = ''
  aiResponse.value.content = responseBuffer.content
  scheduleCurrentAnswerHtmlRender(aiResponse.value.content)
}

/**
 * 调度流式分片刷新
 * 同一帧内仅刷新一次内容，避免多次 chunk 到达时重复触发渲染
 */
const scheduleResponseFlush = () => {
  if (responseFlushRafId !== null) return
  responseFlushRafId = window.requestAnimationFrame(() => {
    flushPendingResponseChunk()
  })
}

/**
 * 接收流式响应分片
 * 将分片先放入缓冲区再分帧写入，平衡输出流畅度与 CPU 占用
 * @param data 分片数据
 */
const updateResponse = (data: { content?: string }) => {
  if (!aiResponse.value || !data.content) return
  isTyping.value = true
  pendingResponseChunk += data.content
  scheduleResponseFlush()
}

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史到localStorage
const saveHistory = (query: string) => {
  if (!query.trim()) return
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(query)
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 删除单个搜索历史
const removeHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

/**
 * 函数说明：读取后台搜索面板快捷入口配置，未配置时回退前端默认值。
 */
const loadSearchQuickTools = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true })
  quickTools.value = siteConfig.searchQuickTools.length
    ? siteConfig.searchQuickTools
    : defaultSearchQuickTools
  searchProviderLabel.value = siteConfig.searchProviderLabel || getDefaultSitePublicConfig().searchProviderLabel
  searchProviderLink.value = siteConfig.searchProviderLink || getDefaultSitePublicConfig().searchProviderLink
  toolRuntimeEntryMap.value = buildToolRuntimeEntryMap(siteConfig.toolCategories)
}

/**
 * 函数说明：将任意工具地址归一化为可用于匹配的键（去除 hash，保留 path/query）。
 * @param url 工具地址
 * @returns 归一化后的地址键
 */
const normalizeToolUrlKey = (url: string): string => {
  const raw = String(url || '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw, window.location.origin)
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    const search = parsed.search || ''
    const normalizedPath = `${pathname}${search}`
    if (parsed.origin === window.location.origin) {
      return normalizedPath
    }
    return `${parsed.origin}${normalizedPath}`
  } catch (_error) {
    return raw.replace(/#.*$/, '').replace(/\/+$/, '')
  }
}

/**
 * 函数说明：构建工具地址的多键匹配集合，兼容 path 与完整 URL 两种来源。
 * @param url 工具地址
 * @returns 地址键集合
 */
const buildToolUrlCandidateKeys = (url: string): string[] => {
  const keySet = new Set<string>()
  const raw = String(url || '').trim()
  if (!raw) return []
  const normalized = normalizeToolUrlKey(raw)
  if (normalized) keySet.add(normalized)
  try {
    const parsed = new URL(raw, window.location.origin)
    const pathname = (parsed.pathname || '').replace(/\/+$/, '') || '/'
    const pathWithSearch = `${pathname}${parsed.search || ''}`
    if (pathWithSearch) {
      keySet.add(pathWithSearch)
      keySet.add(pathname)
    }
  } catch (_error) {
    if (raw.startsWith('/')) {
      const pathOnly = raw.replace(/#.*$/, '').replace(/\/+$/, '') || '/'
      keySet.add(pathOnly)
    }
  }
  return Array.from(keySet).filter(Boolean)
}

/**
 * 函数说明：将后台工具分类树拍平为“地址 -> 运行态”映射，供搜索面板停用拦截复用。
 * @param categories 后台工具分类树
 * @returns 工具运行态映射
 */
const buildToolRuntimeEntryMap = (categories: ToolCategory[]): Map<string, Tool> => {
  const runtimeMap = new Map<string, Tool>()
  categories.forEach((category) => {
    category.list.forEach((subCategory) => {
      subCategory.list.forEach((tool) => {
        const candidateKeys = buildToolUrlCandidateKeys(tool.url)
        candidateKeys.forEach((key) => {
          if (!runtimeMap.has(key)) {
            runtimeMap.set(key, tool)
          }
        })
      })
    })
  })
  return runtimeMap
}

/**
 * 函数说明：根据工具地址查询后台运行态配置。
 * @param url 工具地址
 * @returns 匹配到的工具配置
 */
const findToolRuntimeEntry = (url: string): Tool | null => {
  const candidateKeys = buildToolUrlCandidateKeys(url)
  for (const key of candidateKeys) {
    const tool = toolRuntimeEntryMap.value.get(key)
    if (tool) return tool
  }
  return null
}

/**
 * 函数说明：判断搜索入口对应工具是否在后台被停用（status=0）。
 * @param url 工具地址
 * @returns 是否停用
 */
const isToolEntryDisabled = (url: string): boolean => {
  const matchedTool = findToolRuntimeEntry(url)
  return Number(matchedTool?.status ?? 1) === 0
}

/**
 * 函数说明：输出搜索入口停用提示文案，优先展示后台配置备注。
 * @param url 工具地址
 * @param fallbackTitle 兜底工具标题
 * @returns 停用提示文案
 */
const resolveToolDisabledMessage = (url: string, fallbackTitle = '该工具'): string => {
  const matchedTool = findToolRuntimeEntry(url)
  const toolTitle = String(matchedTool?.title || fallbackTitle).trim() || '该工具'
  const remark = String(matchedTool?.remark || '').trim()
  if (remark) {
    return `工具「${toolTitle}」已停用：${remark}`
  }
  return `工具「${toolTitle}」已在后台停用，请稍后再试。`
}

// 处理搜索
const handleSearch = async () => {
  const query = searchParam.title.trim()
  if (!query) return

  try {
    searchParam.loading = true
    isTyping.value = true

    // 重置当前回答的内容
    responseBuffer.content = ''
    pendingResponseChunk = ''
    currentAnswerHtml.value = ''

    if (responseFlushRafId !== null) {
      window.cancelAnimationFrame(responseFlushRafId)
      responseFlushRafId = null
    }

    // 创建新的回答
    const newResponse = {
      content: '',
      suggestions: []
    }

    // 如果已有对话，添加到历史
    const previousQuestion = currentQuestion.value.trim()
    if (aiResponse.value && previousQuestion && aiResponse.value.content?.trim()) {
      chatHistory.value.push({
        question: previousQuestion,
        answer: aiResponse.value
      })
    }

    // 锁定当前提问，避免输入框变化导致问题文案错位
    currentQuestion.value = query
    aiResponse.value = newResponse

    // 设置一个更长的超时计时器，超过45秒提示用户
    const timeoutTimer = setTimeout(() => {
      if (searchParam.loading) {
        // 仍在加载，但不中断请求，只提示用户
        ElMessage.warning('搜索需要较长时间，请耐心等待...')
      }
    }, 25000)

    try {
      const response = await searchWithAI(query, updateResponse)

      // 清除超时计时器
      clearTimeout(timeoutTimer)

      // 确保最后一次分片刷新完成
      flushPendingResponseChunk()

      aiResponse.value = response
      responseBuffer.content = response.content || ''
      scheduleCurrentAnswerHtmlRender(responseBuffer.content, true)
      saveHistory(query)
    } catch (error: any) {
      // 清除超时计时器
      clearTimeout(timeoutTimer)

      // 开发环境显示详细错误
      debugError('搜索失败:', error)

      // 创建更友好的错误响应
      if (error.message && error.message.includes('timeout')) {
        ElMessage.error('请求超时，您的问题可能过于复杂，请尝试简化问题或稍后重试')

        // 更新AI响应，告知用户超时情况
        if (aiResponse.value) {
          aiResponse.value.content = '抱歉，处理您的请求时发生超时。这可能是因为您的问题较为复杂或当前服务负载较高。\n\n请尝试：\n- 简化您的问题\n- 拆分为多个简单问题\n- 稍后再试'
          responseBuffer.content = aiResponse.value.content
          scheduleCurrentAnswerHtmlRender(responseBuffer.content, true)
        }
      } else {
        ElMessage.error('搜索失败，请稍后重试')

        // 更新AI响应，告知用户出错情况
        if (aiResponse.value) {
          aiResponse.value.content = '抱歉，处理您的请求时发生错误。请稍后再试。'
          responseBuffer.content = aiResponse.value.content
          scheduleCurrentAnswerHtmlRender(responseBuffer.content, true)
        }
      }
    }
  } catch (error: any) {
    debugError('搜索过程出错:', error)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    searchParam.loading = false
    isTyping.value = false

    if (responseFlushRafId !== null) {
      window.cancelAnimationFrame(responseFlushRafId)
      responseFlushRafId = null
    }

    if (currentAnswerRenderTimer) {
      clearTimeout(currentAnswerRenderTimer)
      currentAnswerRenderTimer = null
    }
  }
}

// 处理工具点击
const handleToolClick = (url: string, title = '') => {
  if (isToolEntryDisabled(url)) {
    ElMessage.warning(resolveToolDisabledMessage(url, title))
    return
  }
  window.open(url, '_blank')
}

// 处理历史记录点击
const handleHistoryClick = (query: string) => {
  searchParam.title = query
  handleSearch()
}

// 关闭搜索面板
const handleClose = () => {
  emit('update:visible', false)
  searchParam.title = ''
  currentQuestion.value = ''
  // 清除所有状态
  aiResponse.value = null
  chatHistory.value = []
  responseBuffer.content = ''
  currentAnswerHtml.value = ''
  pendingResponseChunk = ''
  historyAnswerHtmlCache.clear()

  if (responseFlushRafId !== null) {
    window.cancelAnimationFrame(responseFlushRafId)
    responseFlushRafId = null
  }

  if (currentAnswerRenderTimer) {
    clearTimeout(currentAnswerRenderTimer)
    currentAnswerRenderTimer = null
  }
}

// 清除搜索
const handleClear = () => {
  searchParam.title = ''
  // 不清除 aiResponse，保留对话历史
}

// 组件挂载时加载搜索历史
onMounted(() => {
  loadSearchHistory()
  loadSearchQuickTools()

  // 调试logo图片 - 仅在开发环境
  if (isDev) {
    debugLog('Logo 图片路径:', logoImg)
    const img = document.createElement('img')
    img.onerror = () => debugError('Logo 图片加载失败')
    img.onload = () => debugLog('Logo 图片加载成功')
    img.src = logoImg
  }
})

onBeforeUnmount(() => {
  if (responseFlushRafId !== null) {
    window.cancelAnimationFrame(responseFlushRafId)
    responseFlushRafId = null
  }

  if (currentAnswerRenderTimer) {
    clearTimeout(currentAnswerRenderTimer)
    currentAnswerRenderTimer = null
  }
})

// 处理回车搜索
const handleEnterSearch = () => {
  if (!searchParam.loading && searchParam.title.trim()) {
    handleSearch();
  }
}
</script>

<style scoped>
/* 简化搜索面板背景 */
.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
}

.search-wrapper {
  position: relative;
  background: white;
  border-radius: 1rem;
  width: 60rem;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem;
  box-shadow: 0 8px 30px rgba(108, 84, 255, 0.2);
  border: 1px solid rgba(108, 84, 255, 0.1);
}

/* 简化面板标题样式 */
.panel-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 0.0625rem solid #eee;
  margin: -1.5rem -1.5rem 0;
  background: white;
}

/* 简化加载动画 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #64748b;
  font-size: 0.9rem;
  min-height: 150px;
}

/* 简化快捷工具卡片 */
.quick-tool-item {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.quick-tool-item:hover {
  border-color: #6C54FF;
  box-shadow: 0 4px 12px rgba(108, 84, 255, 0.1);
  transform: translateY(-2px);
}

.quick-tool-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
  transition: color 0.2s ease;
}

.quick-tool-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.4;
}

.quick-tool-item:hover .quick-tool-title {
  color: #6C54FF;
}

/* 简化响应式样式 */
@media screen and (max-width: 768px) {
  .search-panel {
    padding: 0;
  }

  .search-wrapper {
    width: 100%;
    height: 100%;
    border-radius: 0;
    box-shadow: none;
  }
}

/* 简化AI头像样式 */
.ai-avatar {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  position: relative;
  z-index: 2;
  display: inline-block;
}

/* 在 style 标签内添加基础字体大小设置 */
:root {
  font-size: 16px;
}

.search-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem;
}

.search-wrapper {
  position: relative;
  background: white;
  border-radius: 1.25rem;
  width: 60rem;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 标题栏样式 */
.panel-title {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
  position: relative;
  display: inline-flex;
}

.panel-title::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #6C54FF;
  border-radius: 3px;
}

.header-subtitle {
  font-size: 0.8125rem;
  color: #64748b;
}

.provider-link {
  color: #6C54FF;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;
}

.provider-link:hover {
  opacity: 0.8;
  text-decoration: underline;
  color: #5846cc;
}

.close-btn {
  position: absolute;
  right: 20px;
  top: 20px;
  padding: 8px;
  border: none;
  background: rgba(241, 245, 249, 0.8);
  color: #64748b;
  transition: all 0.3s ease;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #1e293b;
  background: #e2e8f0;
  transform: rotate(90deg);
}

/* AI 头像样式修复 */
.ai-avatar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6C54FF;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.ai-icon {
  font-size: 1.25rem;
  color: white;
}

.message-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

.user-message .message-avatar {
  background: #6C54FF;
  color: white;
}

.ai-message .message-avatar {
  background: #f1f5f9;
  color: #64748b;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
}

.answer-header .el-icon {
  font-size: 14px;
  color: #6C54FF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

/* 搜索按钮样式 */
.send-btn {
  height: 2.75rem;
  padding: 0 1.5rem;
  font-size: 0.9375rem;
  border-radius: 0.75rem;
  background: #6C54FF;
  border: none;
  color: white;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(108, 84, 255, 0.3);
}

.send-btn:hover:not(:disabled) {
  background: #5846cc;
  box-shadow: 0 4px 12px rgba(108, 84, 255, 0.4);
}

.send-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(108, 84, 255, 0.3);
}

.send-btn:disabled {
  background: #b4a7ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 输入框样式 */
.search-input :deep(.el-input__wrapper) {
  background: #f8fafc;
  border: 1px solid rgba(203, 213, 225, 0.8) !important;
  box-shadow: none !important;
  border-radius: 0.75rem !important;
  padding: 0 1rem !important;
  transition: all 0.2s ease;
  height: 2.75rem;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #6C54FF !important;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(108, 84, 255, 0.1) !important;
}

.search-input :deep(.el-input__wrapper.is-disabled) {
  background: #f1f5f9 !important;
  opacity: 0.8;
  cursor: not-allowed;
}

.search-input :deep(.el-input__prefix) {
  color: #6C54FF;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #64748b;
  font-size: 0.9rem;
  min-height: 200px;
  position: relative;
}

.loading-state::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(108, 84, 255, 0.1) 0%, rgba(108, 84, 255, 0) 70%);
  border-radius: 50%;
  z-index: 0;
}

.loading-icon {
  animation: rotate 2s linear infinite;
  margin-bottom: 1rem;
  color: #6C54FF;
  font-size: 2rem;
  position: relative;
  z-index: 1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 工具卡片样式 */
.tool-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.tool-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: #cbd5e1;
  box-shadow: none;
}

.tool-card--disabled:hover {
  transform: none;
  border-color: #cbd5e1;
  box-shadow: none;
}

.tool-card:hover {
  border-color: #6C54FF;
  box-shadow: 0 4px 12px rgba(108, 84, 255, 0.15);
  z-index: 3;
}

.tool-card:hover .tool-title {
  color: #6C54FF;
}

.tool-title {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.tool-desc {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.tool-actions .el-button {
  background: #6C54FF;
  border-color: #6C54FF;
}

.tool-actions .el-button:hover {
  background: #5846cc;
  border-color: #5846cc;
}

/* 欢迎区域样式 */
.welcome-section {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}

.welcome-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.welcome-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.welcome-section::before,
.welcome-section::after {
  display: none;
}

.welcome-section h3 {
  font-size: 18px;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-section h3::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 20px;
  background: #6C54FF;
  border-radius: 4px;
}

.welcome-section p {
  color: #475569;
  margin: 0 0 12px 0;
}

.welcome-section ul {
  margin: 0;
  padding-left: 20px;
  color: #64748b;
}

.welcome-section li {
  margin: 8px 0;
  position: relative;
}

.welcome-section li::marker {
  color: #6C54FF;
}

/* 快捷工具样式 */
.quick-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.quick-tool-item {
  background: white;
  border: 2px solid #e2e8f0;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.quick-tool-item--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: #cbd5e1;
  box-shadow: none;
}

.quick-tool-item--disabled:hover {
  transform: none;
  border-color: #cbd5e1;
  box-shadow: none;
}

.quick-tool-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 0;
  background: #6C54FF;
  transition: height 0.3s ease;
}

.quick-tool-item:hover {
  border-color: #6C54FF;
  transform: none;
  box-shadow: 0 2px 8px rgba(108, 84, 255, 0.15);
}

.quick-tool-item:hover::before {
  height: 100%;
}

.quick-tool-item:hover .quick-tool-title {
  color: #6C54FF;
}

.tool-disabled-tag {
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  z-index: 2;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background: #6C54FF;
  border-radius: 2px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  :root {
    font-size: 14px;
  }

  .search-panel {
    padding: 0;
  }

  .search-wrapper {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .quick-tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chat-message {
    max-width: 95%;
  }
}

/* 响应式断点 */
@media screen and (max-width: 1440px) {
  :root {
    font-size: 15px;
  }
}

@media screen and (max-width: 1024px) {
  :root {
    font-size: 14px;
  }
}

/* 推理内容样式 */
.reasoning-content {
  margin-bottom: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border: 1px dashed #e6e6e6;
}

.reasoning-header,
.answer-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.875rem;
}

.reasoning-header .el-icon,
.answer-header .el-icon {
  font-size: 14px;
}

.reasoning-text {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.answer-text {
  font-size: 0.9375rem;
  color: #333;
  line-height: 1.6;
  margin: 0;
}

/* 快捷工具样式 */
.quick-tool-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.quick-tool-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* 调整历史对话的样式 */
.chat-message .reasoning-text {
  font-size: 12px;
  opacity: 0.85;
}

.chat-message .answer-text {
  font-size: 14px;
}

/* 打字机效果 */
@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.typing::after {
  content: '|';
  animation: blink 1s infinite;
  margin-left: 2px;
  color: #6C54FF;
}

/* 优化对话容器滚动 */
.chat-container {
  scroll-behavior: smooth;
  padding-bottom: 20px;
}

.chat-message {
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
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

/* 添加 Markdown 样式 */
:deep(.markdown-content) {
  line-height: 1.6;
}

:deep(.markdown-content p) {
  margin: 1em 0;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6) {
  margin: 1.5em 0 1em;
  font-weight: 600;
}

:deep(.markdown-content code) {
  padding: 0.2em 0.4em;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-size: 0.9em;
}

:deep(.markdown-content pre code) {
  padding: 1em;
  display: block;
  overflow-x: auto;
  background-color: #f6f8fa;
  border-radius: 6px;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 2em;
  margin: 1em 0;
}

:deep(.markdown-content blockquote) {
  margin: 1em 0;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

:deep(.markdown-content img) {
  max-width: 100%;
  border-radius: 6px;
}

:deep(.markdown-content a) {
  color: #6C54FF;
  text-decoration: none;
}

:deep(.markdown-content a:hover) {
  text-decoration: underline;
}

:deep(.markdown-content table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  padding: 0.5em;
  border: 1px solid #dfe2e5;
}

:deep(.markdown-content th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

/* 修复滚动区域的内容溢出问题 */
.message-content {
  max-width: 100%;
  overflow-x: visible;
  position: relative;
  z-index: 1;
}

/* 内容区样式 */
.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  margin: 0 -1.5rem;
  background: #fff;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
  will-change: transform;
}

/* 对话容器样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1rem;
  min-height: 200px;
  position: relative;
  z-index: 1;
}

/* 对话消息样式 */
.chat-message {
  display: flex;
  gap: 0.75rem;
  max-width: 88%;
  margin-bottom: 0.5rem;
}

.ai-avatar {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6px;
  background: #fff;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

/* 搜索历史样式 */
.search-history {
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.clear-history {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  background: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.clear-history:hover {
  background: rgba(108, 84, 255, 0.1);
  color: #475569;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: rgba(108, 84, 255, 0.1);
}

.history-item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.history-icon {
  color: #64748b;
  flex-shrink: 0;
}

.history-text {
  font-size: 14px;
  color: #334155;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  color: #94a3b8;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* 底部搜索框样式 */
.search-footer {
  position: sticky;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.95) 40%, #fff);
  padding: 1.5rem 1.5rem 1rem;
  margin: 0 -1.5rem -1.5rem;
  border-top: 1px solid rgba(203, 213, 225, 0.5);
  z-index: 10;
  backdrop-filter: blur(10px);
}

.search-input-wrapper {
  padding: 0.5rem;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(120deg, #f8fafc, #fff);
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.search-input {
  flex: 1;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.25rem;
}

.clear-btn {
  height: 2.75rem;
  padding: 0 1.25rem;
  color: #64748b;
  font-size: 0.9375rem;
  border: 1px solid rgba(203, 213, 225, 0.8);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.clear-btn:hover {
  color: #334155;
  border-color: #cbd5e1;
  background: rgba(255, 255, 255, 0.95);
}

/* 工具推荐区域 */
.suggested-tools {
  margin-top: 2rem;
  position: relative;
  z-index: 2;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.tool-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.tool-actions .el-button .el-icon {
  display: none;
}

/* 快捷工具 */
.quick-access {
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.quick-tool-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-tool-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.quick-tool-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}
</style>
