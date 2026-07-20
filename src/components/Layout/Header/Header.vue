<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from '@vue/runtime-core'
import {
  Search,
  Delete,
  ArrowRight,
  Close,
  Expand,
  Fold,
  Refresh,
  User,
  Lock,
  House,
  CollectionTag,
  TopRight
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { useToolsStore } from '@/store/modules/tools'
import { useComponentStore } from '@/store/modules/component'
import 'element-plus/theme-chalk/display.css'
import type { Tool } from '@/types/tools'
import axios from 'axios'
import quotes from '@/assets/designer_quotes_api.json'
import SearchPanel from '@/components/Search/Search.vue'
import router from '@/router';
import { getDefaultSitePublicConfig, getSitePublicConfig, type SiteLinkItem } from '@/services/siteConfig'
import {
  FRONTEND_USER_AUTH_EVENT,
  FRONTEND_USER_LOGIN_PROMPT_EVENT,
  loginFrontendUser,
  getFrontendUserProfile,
  isFrontendUserLoggedIn,
  type FrontendUserLoginPromptPayload
} from '@/services/frontendUser'

// 每日一言数据结构
interface DailyWord {
  id: number;
  content: string;
  form: string;
}

// 每日一言
const dailyWord = ref<DailyWord>({
  id: 0,
  content: '',
  form: ''
})

// 添加定时器引用
let dailyWordTimer: ReturnType<typeof setInterval> | null = null

const fallbackDailyWords = [
  '生活明朗, 万物可爱',
  '道阻且长，行则将至',
  '心之所向，素履以往',
  '生命不息，奋斗不止',
  '保持热爱，奔赴山海',
  '山水一程，三生有幸',
  '愿你眼中有光，心中有爱',
  '不负韶华，不负自己',
  '既见君子，云胡不喜',
  '明月装饰了你的窗子，你装饰了别人的梦'
]

const localDailyWordCandidates = (
  quotes as Array<{ id?: number; quote?: string; author?: string }>
)
  .map((item) => ({
    id: Number(item.id || 0),
    content: String(item.quote || '').replace(/\s+/g, ' ').trim(),
    form: String(item.author || '设计一言').trim()
  }))
  .filter((item) => item.content && item.content.length <= 80)

/**
 * 函数说明：从项目内置设计语录中随机选择每日一言，语录资源异常时再使用基础短句兜底。
 */
const useLocalDailyWord = () => {
  const candidate = localDailyWordCandidates[Math.floor(Math.random() * localDailyWordCandidates.length)]
  if (candidate) {
    dailyWord.value = candidate
    return
  }

  dailyWord.value = {
    id: 0,
    content: fallbackDailyWords[Math.floor(Math.random() * fallbackDailyWords.length)],
    form: '本地一言'
  }
}

/**
 * 函数说明：刷新每日一言，避免公共接口故障拖慢首页或持续产生控制台错误。
 */
const getDailyWord = () => {
  useLocalDailyWord()
}

// 初始化每日一言
const initDailyWord = () => {
  getDailyWord() // 立即获取一次
  // 设置每小时自动刷新一次
  dailyWordTimer = setInterval(() => {
    getDailyWord()
  }, 60 * 60 * 1000) // 60分钟 * 60秒 * 1000毫秒
}

/**
 * 函数说明：读取后台站点配置并同步头部入口和工具运行策略。
 */
const loadSiteConfig = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true })
  siteConfigState.value = siteConfig
  headerToolRuntimeEntryMap.value = buildToolRuntimeEntryMap(siteConfig)
  headerLinks.value = mergeHeaderLinksWithAuthEntries(siteConfig)
}

// const isNavDrawer = ref(false)
const loading = ref(false)
const options = ref<Tool[]>([])
//store
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
const siteConfigState = ref<Awaited<ReturnType<typeof getSitePublicConfig>> | null>(null)
const headerLinks = ref<SiteLinkItem[]>([])
const displayHeaderLinks = computed(() => headerLinks.value)
const headerToolRuntimeEntryMap = ref<Map<string, Tool>>(new Map())
const loginDialogVisible = ref(false)
const loginDialogLoading = ref(false)
const loginDialogReason = ref('')
const loginDialogRedirectPath = ref('/user/center')
const loginDialogToolConsumePoints = ref<number | null>(null)
const loginDialogToolMemberFree = ref<boolean | null>(null)
const loginDialogForm = reactive({
  nickname: '',
  password: ''
})
const loginDialogSiteConfig = computed(() => siteConfigState.value ?? getDefaultSitePublicConfig())

/**
 * 函数说明：解析登录弹窗中的工具消耗积分，缺少工具级策略时兼容使用全局配置。
 */
const loginDialogConsumePoints = computed(() => {
  if (loginDialogToolConsumePoints.value !== null) {
    return loginDialogToolConsumePoints.value
  }
  return Math.max(0, Number(loginDialogSiteConfig.value.loginToolConsumePoints || 0))
})

/**
 * 函数说明：识别仅在页脚保留的个人网站入口，避免后台旧配置再次注入顶部区域。
 */
const isFooterOnlyPersonalWebsiteLink = (item: SiteLinkItem): boolean => {
  const name = String(item.name || '').trim()
  const link = String(item.link || '').trim().replace(/\/+$/, '').toLowerCase()
  return name === '个人网站' || link === 'https://tomda.top' || link === 'https://www.tomda.top'
}

/**
 * 函数说明：合并后台基础头部链接与登录入口链接，并去重保证渲染稳定。
 */
const mergeHeaderLinksWithAuthEntries = (
  siteConfig: Awaited<ReturnType<typeof getSitePublicConfig>>
): SiteLinkItem[] => {
  const mergedLinks: SiteLinkItem[] = siteConfig.headerLinks.filter(
    (item) => !isFooterOnlyPersonalWebsiteLink(item)
  )

  if (siteConfig.loginEnabled) {
    if (isFrontendUserLoggedIn()) {
      const userProfile = getFrontendUserProfile()
      const userCenterLink = siteConfig.userCenterEnabled && siteConfig.userCenterLink
        ? siteConfig.userCenterLink
        : '/user/center'
      mergedLinks.push({
        name: userProfile?.nickname ? `${userProfile.nickname}·${siteConfig.userCenterTitle || '个人中心'}` : (siteConfig.userCenterTitle || '个人中心'),
        link: userCenterLink
      })
    } else {
      mergedLinks.push({
        name: '登录',
        link: '/user/login'
      })
    }
    if (siteConfig.loginOpenOtherAuth && siteConfig.loginOpenWechatAuth && siteConfig.loginWechatAuthorizeUrl) {
      mergedLinks.push({ name: '微信登录', link: siteConfig.loginWechatAuthorizeUrl })
    }
    if (siteConfig.loginOpenOtherAuth && siteConfig.loginOpenQqAuth && siteConfig.loginQqAuthorizeUrl) {
      mergedLinks.push({ name: 'QQ登录', link: siteConfig.loginQqAuthorizeUrl })
    }
  }

  const seen = new Set<string>()
  const uniqueLinks: SiteLinkItem[] = []
  mergedLinks.forEach((item) => {
    const name = String(item.name || '').trim()
    const link = String(item.link || '').trim()
    if (!name || !link) {
      return
    }
    const key = `${name}|${link}`
    if (seen.has(key)) {
      return
    }
    seen.add(key)
    uniqueLinks.push({ name, link })
  })

  return uniqueLinks
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
 * 函数说明：将后台工具分类树拍平为“地址 -> 运行态”映射，供头部入口拦截复用。
 * @param siteConfig 站点配置对象
 * @returns 工具运行态映射
 */
const buildToolRuntimeEntryMap = (
  siteConfig: Awaited<ReturnType<typeof getSitePublicConfig>>
): Map<string, Tool> => {
  const runtimeMap = new Map<string, Tool>()
  siteConfig.toolCategories.forEach((category) => {
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
 * 函数说明：根据链接地址查询后台工具运行态配置。
 * @param url 目标链接
 * @returns 匹配到的工具配置
 */
const findToolRuntimeEntryByUrl = (url: string): Tool | null => {
  const candidateKeys = buildToolUrlCandidateKeys(url)
  for (const key of candidateKeys) {
    const tool = headerToolRuntimeEntryMap.value.get(key)
    if (tool) return tool
  }
  return null
}

/**
 * 函数说明：判断头部链接对应工具是否在后台被停用（status=0）。
 * @param url 目标链接
 * @returns 是否停用
 */
const isHeaderLinkDisabled = (url: string): boolean => {
  const matchedTool = findToolRuntimeEntryByUrl(url)
  return Number(matchedTool?.status ?? 1) === 0
}

/**
 * 函数说明：输出头部工具入口停用提示文案，优先展示后台备注。
 * @param url 目标链接
 * @param fallbackName 兜底名称
 * @returns 停用提示文案
 */
const resolveHeaderLinkDisabledMessage = (url: string, fallbackName = '该工具'): string => {
  const matchedTool = findToolRuntimeEntryByUrl(url)
  const toolTitle = String(matchedTool?.title || fallbackName).trim() || '该工具'
  const remark = String(matchedTool?.remark || '').trim()
  if (remark) {
    return `工具「${toolTitle}」已停用：${remark}`
  }
  return `工具「${toolTitle}」已在后台停用，请稍后再试。`
}

/**
 * 函数说明：站点登录态变化时，基于已加载配置刷新头部菜单入口。
 */
const handleFrontendAuthChanged = () => {
  if (!siteConfigState.value) {
    return
  }
  headerLinks.value = mergeHeaderLinksWithAuthEntries(siteConfigState.value)
}
//查询参数
const searchParam = reactive({
  cateId: 0,
  title: '',
  route: '',
})

// 搜索历史
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史到localStorage
const saveSearchHistory = (query: string) => {
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
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 删除单个搜索历史
const removeSearchHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 搜索建议
const searchSuggestions = computed(() => {
  const query = searchParam.title.toLowerCase().trim()
  console.log('搜索关键词:', query)

  if (!query) return []

  // 获取所有工具并打印详细信息
  const allTools = toolsStore.getAllTools()
  console.log('搜索时的工具数据:', {
    totalTools: allTools.length,
    sampleTool: allTools[0],
    allTools
  })

  const filteredTools = allTools.filter((tool: Tool) => {
    const toolTitle = tool?.title?.toLowerCase() || ''
    const toolDesc = tool?.desc?.toLowerCase() || ''
    const matched = toolTitle.includes(query) || toolDesc.includes(query)

    // 打印匹配过程
    console.log('工具匹配检查:', {
      tool: tool.title,
      query,
      titleMatch: toolTitle.includes(query),
      descMatch: toolDesc.includes(query),
      matched
    })

    return matched
  })

  console.log('过滤后的工具:', filteredTools)
  return filteredTools.slice(0, 10)
})

//搜索工具
const searchTools = async (query: string) => {
  loading.value = true
  console.log('执行搜索，关键词:', query)

  try {
    if (query) {
      searchParam.title = query
      const allTools = toolsStore.getAllTools()

      options.value = allTools.filter((tool: Tool) => {
        const toolTitle = tool?.title?.toLowerCase() || ''
        const toolDesc = tool?.desc?.toLowerCase() || ''

        return toolTitle.includes(query.toLowerCase()) ||
          toolDesc.includes(query.toLowerCase())
      })

      saveSearchHistory(query)
    } else {
      options.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    options.value = []
  } finally {
    loading.value = false
  }
}

// 选择搜索历史或建议
const selectSearchItem = (query: string) => {
  searchParam.title = query
  searchTools(query)
}

// 搜索面板控制
const showSearch = ref(false)

// 处理搜索选择
const handleSearchSelect = (url: string) => {
  if (!url) {
    console.warn('点击的链接为空')
    return
  }

  console.log('准备跳转到:', url)

  try {
    if (isHeaderLinkDisabled(url)) {
      ElMessage.warning(resolveHeaderLinkDisabledMessage(url))
      return
    }
    // 检查是否是外部链接
    if (isExternalLink(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      // 使用 router.push 的 catch 来处理导航失败
      router.push(url).catch(err => {
        console.error('路由跳转失败:', err)
        ElMessage.error('页面不存在')
      })
    }
  } catch (error) {
    console.error('导航错误:', error)
    ElMessage.error('导航失败，请稍后重试')
  }
}

/**
 * 函数说明：判断链接是否为外部地址，用于顶部快捷入口跳转策略
 */
const isExternalLink = (url: string) => {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(String(url || '').trim())
}

/**
 * 函数说明：判断头部点击是否属于登录页路由，兼容携带 query 的登录地址。
 */
const isLoginRouteLink = (url: string): boolean => {
  const targetUrl = String(url || '').trim()
  return targetUrl === '/user/login' || targetUrl.startsWith('/user/login?')
}

/**
 * 函数说明：判断头部链接是否为账号入口，用于统一登录和个人中心的主操作视觉。
 */
const isAccountHeaderLink = (url: string): boolean => {
  const targetUrl = String(url || '').trim()
  return isLoginRouteLink(targetUrl) || targetUrl === '/user/center' || targetUrl.startsWith('/user/center?')
}

/**
 * 函数说明：打开头部登录弹窗并记录登录成功后回跳地址。
 */
const openLoginDialog = (payload: FrontendUserLoginPromptPayload = {}) => {
  if (!loginDialogSiteConfig.value.loginEnabled) {
    return
  }
  const redirectPath = String(payload.redirectPath || '/user/center').trim() || '/user/center'
  const reason = String(payload.reason || '').trim()
  loginDialogReason.value = reason
  loginDialogRedirectPath.value = redirectPath
  const consumePoints = Number(payload.consumePoints)
  loginDialogToolConsumePoints.value = Number.isFinite(consumePoints)
    ? Math.max(0, Math.floor(consumePoints))
    : null
  loginDialogToolMemberFree.value = typeof payload.memberFree === 'boolean' ? payload.memberFree : null
  loginDialogVisible.value = true
  loginDialogLoading.value = false
  loginDialogForm.nickname = ''
  loginDialogForm.password = ''
}

/**
 * 函数说明：执行头部登录弹窗登录逻辑，成功后按来源回跳并刷新头部入口。
 */
const handleLoginFromDialog = async () => {
  const nickname = String(loginDialogForm.nickname || '').trim()
  const password = String(loginDialogForm.password || '').trim()
  if (nickname.length < 2) {
    ElMessage.warning('请输入至少 2 个字符的昵称')
    return
  }
  if (password.length < 6) {
    ElMessage.warning('请输入至少 6 位密码')
    return
  }
  loginDialogLoading.value = true
  try {
    await loginFrontendUser(nickname, password)
    loginDialogVisible.value = false
    handleFrontendAuthChanged()
    const nextPath = String(loginDialogRedirectPath.value || '/user/center').trim() || '/user/center'
    await router.push(nextPath)
    if (nextPath.startsWith('/user/center')) {
      ElMessage.success('登录成功，已进入个人中心')
    } else {
      ElMessage.success('登录成功，已继续当前操作')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    loginDialogLoading.value = false
  }
}

/**
 * 函数说明：统一处理第三方登录授权地址打开行为，复用弹窗内微信/QQ登录入口。
 */
const handleOpenAuth = (url: string) => {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    ElMessage.warning('当前未配置授权地址，请先在后台登录配置中设置')
    return
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer')
}

/**
 * 函数说明：处理头部链接跳转，站内地址走路由跳转，站外地址保持新窗口行为。
 */
const handleHeaderLinkClick = async (event: MouseEvent, url: string, name = '') => {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    event.preventDefault()
    return
  }
  if (isHeaderLinkDisabled(targetUrl)) {
    event.preventDefault()
    ElMessage.warning(resolveHeaderLinkDisabledMessage(targetUrl, name))
    return
  }
  if (isExternalLink(targetUrl)) {
    return
  }
  event.preventDefault()
  if (isLoginRouteLink(targetUrl)) {
    openLoginDialog({
      reason: '登录后可进入个人中心，查看积分与会员权益',
      redirectPath: '/user/center',
      source: 'header-login-link'
    })
    return
  }
  try {
    await router.push(targetUrl)
  } catch (error) {
    console.error('头部菜单跳转失败:', error)
    ElMessage.error('页面不存在或跳转失败')
  }
}

/**
 * 函数说明：响应工具页动作触发的登录请求，统一拉起头部登录弹窗。
 */
const handleFrontendLoginPromptEvent = (event: Event) => {
  const customEvent = event as CustomEvent<FrontendUserLoginPromptPayload>
  const payload = customEvent.detail || {}
  openLoginDialog({
    reason: String(payload.reason || '').trim() || '请先登录后继续操作',
    redirectPath: String(payload.redirectPath || router.currentRoute.value.fullPath || '/').trim() || '/',
    source: String(payload.source || '').trim(),
    consumePoints: payload.consumePoints,
    memberFree: payload.memberFree
  })
}

// 切换搜索面板
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// 添加点击外部关闭搜索
const handleClickOutside = (event: MouseEvent) => {
  const searchPanel = document.querySelector('.search-panel')
  const searchButton = document.querySelector('.search-trigger-btn')
  const target = event.target as HTMLElement

  // 检查点击的目标是否在搜索面板或搜索按钮内
  if (showSearch.value &&
    searchPanel &&
    searchButton &&
    !searchPanel.contains(target) &&
    !searchButton.contains(target) &&
    !target.closest('.el-select-dropdown')) { // 排除下拉菜单
    showSearch.value = false
    searchParam.title = ''
  }
}

const addToBookmark = () => {
  try {
    // 使用当前页面标题
    const title = document.title
    // 现代浏览器
    if ('sidebar' in window && 'addPanel' in (window as any).sidebar) { // Firefox
      (window as any).sidebar.addPanel(title, window.location.href, '');
    } else if ('external' in window && 'AddFavorite' in (window as any).external) { // IE
      (window as any).external.AddFavorite(window.location.href, title);
    } else { // Chrome, Safari, Opera, etc.
      alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 将本页添加到书签。');
    }
  } catch (e) {
    alert('您的浏览器不支持此操作，请手动添加书签。');
  }
}

// 添加左侧菜单控制
const isCollapse = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  const newIsMobile = window.innerWidth <= 768
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile
    // 在设备类型改变时重置菜单状态
    if (newIsMobile) {
      isCollapse.value = componentStore.leftComDrawer
    } else {
      isCollapse.value = componentStore.leftCom
    }
  }
}

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  // 判断是否为移动端
  if (isMobile.value) {
    componentStore.setleftComDrawerStatus(!componentStore.leftComDrawer)
  } else {
    componentStore.setLeftComStatus(isCollapse.value)
  }
}

onMounted(() => {
  void loadSiteConfig()
  initDailyWord()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener(FRONTEND_USER_AUTH_EVENT, handleFrontendAuthChanged as EventListener)
  window.addEventListener(FRONTEND_USER_LOGIN_PROMPT_EVENT, handleFrontendLoginPromptEvent as EventListener)

  // 初始化菜单状态，根据设备类型设置不同的初始值
  if (isMobile.value) {
    isCollapse.value = componentStore.leftComDrawer
  } else {
    isCollapse.value = componentStore.leftCom
  }
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener(FRONTEND_USER_AUTH_EVENT, handleFrontendAuthChanged as EventListener)
  window.removeEventListener(FRONTEND_USER_LOGIN_PROMPT_EVENT, handleFrontendLoginPromptEvent as EventListener)
  // 清理定时器
  if (dailyWordTimer) {
    clearInterval(dailyWordTimer)
    dailyWordTimer = null
  }
})
</script>

<template>
  <header class="h-14 sm:h-16 w-full flex items-center bg-white border-b border-gray-200 rounded-b-xl overflow-hidden">
    <div class="header-left-zone flex items-center min-w-0">
      <!-- 菜单折叠按钮 -->
      <div class="menu-toggle cursor-pointer pl-4" @click="toggleSidebar">
        <el-icon class="text-gray-500 hover:text-blue-500 text-xl">
          <Expand v-if="isCollapse" />
          <Fold v-else />
        </el-icon>
      </div>

      <!-- 左侧一言 - 仅在 PC 端显示 -->
      <div class="daily-word-outer hidden md:block" @click.stop="getDailyWord">
        <div class="daily-word-wrapper">
          <span class="daily-word-prefix">每日一言：</span>
          <div class="daily-word-content">
            <div>
              <span class="daily-word-text">{{ dailyWord.content }}</span>
              <span class="daily-word-translation" v-if="dailyWord.form">
                —— {{ dailyWord.form }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="header-right-zone px-0 md:px-4">
      <div class="flex justify-end items-center w-full">
        <div class="flex items-center gap-4">
          <div class="header-action-cluster pr-4 md:pr-0">
            <!-- 搜索按钮 -->
            <button type="button" class="menu-icon-btn" aria-label="搜索工具" @click="toggleSearch">
              <el-icon>
                <Search />
              </el-icon>
            </button>

            <span class="header-action-divider hidden md:block" aria-hidden="true"></span>

            <div class="header-link-group hidden md:flex">
              <a
                v-for="(item, index) in displayHeaderLinks"
                :key="`${item.name}-${item.link}-${index}`"
                :href="item.link"
                :target="isExternalLink(item.link) ? '_blank' : '_self'"
                :rel="isExternalLink(item.link) ? 'noopener noreferrer' : undefined"
                @click="handleHeaderLinkClick($event, item.link, item.name)"
                :class="[
                  'header-link-item',
                  {
                    'header-link-item--account': isAccountHeaderLink(item.link),
                    'header-link--disabled': isHeaderLinkDisabled(item.link)
                  }
                ]"
              >
                <el-icon v-if="!isAccountHeaderLink(item.link)" class="header-link-icon">
                  <House />
                </el-icon>
                <span>{{ item.name }}</span>
                <el-icon v-if="isExternalLink(item.link)" class="header-link-external">
                  <TopRight />
                </el-icon>
              </a>
            </div>

            <el-tooltip content="收藏到书签" placement="bottom">
              <button
                type="button"
                class="header-bookmark-action hidden md:inline-flex"
                aria-label="收藏到书签"
                @click="addToBookmark"
              >
                <el-icon><CollectionTag /></el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索组件 -->
    <SearchPanel v-model:visible="showSearch" @select="handleSearchSelect" />

    <el-dialog
      v-model="loginDialogVisible"
      width="min(540px, calc(100vw - 24px))"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      class="frontend-login-dialog"
    >
      <template #header>
        <div class="login-dialog-header">
          <div class="login-dialog-kicker">UIED ACCOUNT</div>
          <h3>登录用户中心</h3>
          <p>{{ loginDialogReason || '登录后可进入个人中心，查看每日积分并绑定 QQ 邮箱。' }}</p>
        </div>
      </template>

      <div class="login-dialog-shell">
        <aside class="login-dialog-side">
          <div class="login-dialog-side-head">
            <div class="login-dialog-side-title">账户权益</div>
            <span>登录后自动生效</span>
          </div>
          <div class="login-dialog-points">
            <div class="points-chip">
              <span>每日赠送</span>
              <strong>+{{ loginDialogSiteConfig.loginDailyGiftPoints }}</strong>
            </div>
            <div class="points-chip">
              <span>单次工具消耗</span>
              <strong>-{{ loginDialogConsumePoints }}</strong>
            </div>
            <div class="points-chip" v-if="loginDialogToolMemberFree !== null">
              <span>会员策略</span>
              <strong>{{ loginDialogToolMemberFree ? '会员免扣' : '规则扣费' }}</strong>
            </div>
            <div class="points-chip" v-if="loginDialogSiteConfig.loginMemberEnabled && loginDialogSiteConfig.loginMemberTrialDays > 0">
              <span>新用户试用</span>
              <strong>{{ loginDialogSiteConfig.loginMemberTrialDays }} 天</strong>
            </div>
          </div>
          <div class="login-dialog-side-note">
            <span>积分与会员状态实时同步</span>
            <span>支持绑定 QQ 邮箱</span>
          </div>
        </aside>

        <section class="login-dialog-main">
          <el-form label-position="top" class="login-dialog-form" @submit.prevent>
            <el-form-item label="昵称">
              <el-input
                v-model="loginDialogForm.nickname"
                placeholder="请输入昵称"
                maxlength="24"
                clearable
                autofocus
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginDialogForm.password"
                type="password"
                show-password
                placeholder="请输入密码（6位以上）"
                maxlength="32"
                clearable
                @keyup.enter="handleLoginFromDialog"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>

          <div
            v-if="loginDialogSiteConfig.loginOpenOtherAuth && (loginDialogSiteConfig.loginOpenWechatAuth || loginDialogSiteConfig.loginOpenQqAuth)"
            class="login-dialog-auth"
          >
            <div class="login-dialog-auth-label">其他登录方式</div>
            <div class="login-dialog-auth-actions">
              <el-button
                v-if="loginDialogSiteConfig.loginOpenWechatAuth"
                plain
                class="login-auth-button"
                @click="handleOpenAuth(loginDialogSiteConfig.loginWechatAuthorizeUrl)"
              >
                微信登录
              </el-button>
              <el-button
                v-if="loginDialogSiteConfig.loginOpenQqAuth"
                plain
                class="login-auth-button"
                @click="handleOpenAuth(loginDialogSiteConfig.loginQqAuthorizeUrl)"
              >
                QQ登录
              </el-button>
            </div>
          </div>

          <div class="login-dialog-footer">
            <el-button class="login-dialog-cancel" @click="loginDialogVisible = false">取消</el-button>
            <el-button class="login-dialog-submit" type="primary" :loading="loginDialogLoading" @click="handleLoginFromDialog">
              登录并继续
            </el-button>
          </div>
        </section>
      </div>
    </el-dialog>
  </header>
</template>
<style scoped>
.fold-enter-active {
  transition: all 1s ease-out;
}

.fold-enter-from,
.fold-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

:deep(.el-select__wrapper) {
  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
  cursor: default;
  @apply md:w-full;
}

.el-select :deep(.el-select__wrapper) {
  background-color: rgb(255, 255, 255);
}

/* 一言样式 */
.header-left-zone {
  flex: 1 1 auto;
  max-width: calc(100% - 320px);
}

.header-right-zone {
  flex: 0 0 auto;
  margin-left: auto;
  min-width: 0;
}

.daily-word-outer {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.daily-word-outer:hover {
  background: #f0edff;
}

.daily-word-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.daily-word-prefix {
  color: #6C54FF;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

.daily-word-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.daily-word-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  display: inline-block;
  max-width: 100%;
  vertical-align: bottom;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.daily-word-translation {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: inline;
  margin-left: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

@media screen and (max-width: 1400px) {
  .header-left-zone {
    max-width: calc(100% - 300px);
  }
}

@media screen and (max-width: 1200px) {
  .header-left-zone {
    max-width: calc(100% - 280px);
  }
}

@media screen and (max-width: 992px) {
  .header-left-zone {
    max-width: calc(100% - 220px);
  }
}

/* 统一图标按钮样式 */
.header-action-cluster {
  display: flex;
  align-items: center;
  gap: 6px;
}

.menu-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #515151;
  border: 0;
  border-radius: 8px;
  background: transparent;
}

.menu-icon-btn:hover {
  color: #6C54FF;
  background-color: #f0edff;
}

.menu-icon-btn .el-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.header-action-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: #e4e7ed;
}

.header-link-group {
  align-items: center;
  gap: 4px;
}

.header-link-item {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 9px;
  color: #5f6673;
  font-size: 13px;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.header-link-item:hover {
  color: #292d36;
  background: #f4f5f7;
}

.header-link-item--account {
  color: #ffffff;
  border-color: #5b54e8;
  background: #5b54e8;
}

.header-link-item--account:hover {
  color: #ffffff;
  border-color: #4d47d0;
  background: #4d47d0;
}

.header-link-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.header-link-external {
  color: #9aa0aa;
  font-size: 11px;
}

.header-link-item--account .header-link-external {
  color: rgba(255, 255, 255, 0.72);
}

.header-bookmark-action {
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  color: #5b54e8;
  border: 1px solid #dedcfb;
  border-radius: 6px;
  background: #f4f3ff;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.header-bookmark-action:hover {
  color: #ffffff;
  border-color: #5b54e8;
  background: #5b54e8;
}

.header-bookmark-action .el-icon {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.header-link--disabled {
  color: #94a3b8 !important;
  cursor: not-allowed;
}

.header-link--disabled:hover {
  color: #94a3b8 !important;
}

/* 修改菜单折叠按钮悬停颜色 */
.menu-toggle .el-icon {
  transition: all 0.3s ease;
}

.menu-toggle:hover .el-icon {
  color: #6C54FF !important;
}

/* 修改收藏到书签按钮样式 */
.el-button.el-button--primary {
  background-color: #6C54FF !important;
  border-color: #6C54FF !important;
  color: #fff !important;
  transition: all 0.3s ease;
}

.el-button.el-button--primary:hover {
  background-color: #5842cc !important;
  border-color: #5842cc !important;
}

.login-dialog-header {
  padding-right: 38px;
}

.login-dialog-header h3 {
  margin: 7px 0 0;
  color: #17191f;
  font-size: 22px;
  line-height: 1.35;
  font-weight: 800;
}

.login-dialog-header p {
  max-width: 430px;
  margin: 5px 0 0;
  color: #697180;
  font-size: 13px;
  line-height: 1.55;
}

.login-dialog-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #5b54e8;
  font-size: 10px;
  line-height: 1;
  font-weight: 900;
}

.login-dialog-kicker::before {
  content: '';
  width: 22px;
  height: 3px;
  background: #5b54e8;
}

.login-dialog-shell {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.login-dialog-side {
  padding: 13px;
  border-radius: 6px;
  background: #f3f5f8;
}

.login-dialog-side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.login-dialog-side-title {
  color: #262a33;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 800;
}

.login-dialog-side-head > span {
  color: #7a8290;
  font-size: 11px;
}

.login-dialog-points {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.points-chip {
  min-width: 0;
  min-height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-left: 3px solid #5b54e8;
  border-radius: 4px;
  background: #ffffff;
}

.points-chip:nth-child(1) {
  border-left-color: #18845d;
}

.points-chip:nth-child(2) {
  border-left-color: #d15c36;
}

.points-chip span {
  overflow: hidden;
  color: #707887;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.points-chip strong {
  flex-shrink: 0;
  color: #242832;
  font-size: 14px;
  line-height: 1;
  font-weight: 900;
}

.login-dialog-side-note {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-top: 9px;
  color: #6d7583;
  font-size: 11px;
}

.login-dialog-side-note span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.login-dialog-side-note span::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #5b54e8;
}

.login-dialog-main {
  display: flex;
  flex-direction: column;
  padding-top: 15px;
}

.login-dialog-form {
  width: 100%;
}

.login-dialog-auth {
  padding-top: 12px;
  border-top: 1px solid #eceef2;
}

.login-dialog-auth-label {
  margin-bottom: 8px;
  color: #7b8290;
  font-size: 11px;
}

.login-dialog-auth-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.login-dialog-footer {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 8px;
  margin-top: 14px;
}

.login-dialog-footer :deep(.el-button) {
  width: 100%;
  min-height: 42px;
  margin-left: 0;
  border-radius: 5px;
  font-weight: 700;
}

.login-auth-button {
  width: 100%;
  margin-left: 0 !important;
  border-color: #dfe2e8;
  color: #3d4350;
}

:deep(.frontend-login-dialog.el-dialog),
:deep(.frontend-login-dialog .el-dialog) {
  overflow: hidden;
  padding: 0;
  border: 1px solid #dfe2e8;
  border-radius: 8px;
  box-shadow: none;
}

:deep(.frontend-login-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 20px 20px 12px;
}

:deep(.frontend-login-dialog .el-dialog__headerbtn) {
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
}

:deep(.frontend-login-dialog .el-dialog__body) {
  padding: 0 20px 20px;
}

:deep(.frontend-login-dialog .el-form-item) {
  margin-bottom: 13px;
}

:deep(.frontend-login-dialog .el-form-item__label) {
  height: auto;
  margin-bottom: 5px;
  color: #343a46;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 700;
}

:deep(.frontend-login-dialog .el-input__wrapper) {
  min-height: 43px;
  border-radius: 5px;
  box-shadow: 0 0 0 1px #dfe2e8 inset;
}

:deep(.frontend-login-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #5b54e8 inset;
}

:deep(.frontend-login-dialog .el-input__prefix) {
  color: #8a91a0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .daily-word-outer {
    display: none;
  }

  :deep(.frontend-login-dialog.el-dialog),
  :deep(.frontend-login-dialog .el-dialog) {
    width: calc(100vw - 24px) !important;
    max-width: 366px;
    padding: 0;
    border-radius: 8px;
  }

  :deep(.frontend-login-dialog .el-dialog__header) {
    padding: 16px 16px 11px;
  }

  :deep(.frontend-login-dialog .el-dialog__headerbtn) {
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
  }

  :deep(.frontend-login-dialog .el-dialog__body) {
    max-height: calc(100vh - 120px);
    padding: 0 16px 16px;
    overflow-y: auto;
  }

  .login-dialog-header {
    padding-right: 30px;
  }

  .login-dialog-kicker {
    font-size: 9px;
  }

  .login-dialog-header h3 {
    margin-top: 7px;
    font-size: 19px;
    line-height: 1.35;
  }

  .login-dialog-header p {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.55;
  }

  .login-dialog-shell {
    gap: 0;
  }

  .login-dialog-side {
    padding: 10px;
  }

  .login-dialog-points {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .points-chip {
    min-height: 43px;
    padding: 7px 8px;
  }

  .points-chip span {
    font-size: 10px;
  }

  .points-chip strong {
    font-size: 13px;
  }

  .login-dialog-side-note {
    gap: 4px 12px;
    font-size: 10px;
  }

  .login-dialog-main {
    padding-top: 13px;
  }

  :deep(.frontend-login-dialog .el-form-item) {
    margin-bottom: 12px;
  }

  :deep(.frontend-login-dialog .el-input__wrapper) {
    min-height: 40px;
  }

  .login-dialog-auth-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .login-auth-button {
    width: 100%;
    margin-left: 0 !important;
  }

  .login-dialog-footer {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .login-dialog-footer :deep(.el-button) {
    width: 100%;
    min-height: 40px;
    margin-left: 0 !important;
  }
}

@media screen and (max-width: 360px) {
  .points-chip {
    padding-right: 6px;
    padding-left: 6px;
  }

  .points-chip span {
    max-width: 72px;
  }
}
</style>
