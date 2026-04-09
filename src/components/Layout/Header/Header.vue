<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from '@vue/runtime-core'
import { Search, Delete, ArrowRight, Close, Expand, Fold, Refresh } from '@element-plus/icons-vue';
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

// 添加 JSONP 工具函数
const jsonp = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_' + Date.now() + Math.floor(Math.random() * 1000);
    const script = document.createElement('script');

    // 创建全局回调函数
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    // 清理函数
    const cleanup = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      clearTimeout(timeoutId);
    };

    // 设置超时
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP 请求超时'));
    }, 5000);

    // 处理错误
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP 请求失败'));
    };

    // 构建URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

const getDailyWord = async () => {
  try {
    console.log('开始获取一言...')
    const response = await fetch('https://api.pearktrue.cn/api/hitokoto/')
    const text = await response.text()

    if (text) {
      dailyWord.value = {
        id: 0,
        content: text,
        form: '一言'
      }
      console.log('一言获取成功:', dailyWord.value)
      return
    }
    throw new Error('获取数据失败')
  } catch (error) {
    console.error('一言获取失败:', error)
    // 使用本地的随机名言
    const fallbackQuotes = [
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
    dailyWord.value = {
      id: 0,
      content: fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)],
      form: '本地一言'
    }
  }
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
 * 函数说明：读取后台站点配置并更新顶部展示名称
 */
const loadSiteConfig = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true })
  siteConfigState.value = siteConfig
  headerToolRuntimeEntryMap.value = buildToolRuntimeEntryMap(siteConfig)
  if (siteConfig.webName) {
    siteName.value = siteConfig.webName
  }
  headerLinks.value = mergeHeaderLinksWithAuthEntries(siteConfig)
}

// const isNavDrawer = ref(false)
const loading = ref(false)
const options = ref<Tool[]>([])
//store
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
const siteName = ref('UIED-Tools')
const defaultHeaderLinks: SiteLinkItem[] = [
  { name: '个人网站', link: 'https://tomda.top/' }
]
const siteConfigState = ref<Awaited<ReturnType<typeof getSitePublicConfig>> | null>(null)
const headerLinks = ref<SiteLinkItem[]>(defaultHeaderLinks)
const displayHeaderLinks = computed(() => (headerLinks.value.length ? headerLinks.value : defaultHeaderLinks))
const headerToolRuntimeEntryMap = ref<Map<string, Tool>>(new Map())
const loginDialogVisible = ref(false)
const loginDialogLoading = ref(false)
const loginDialogReason = ref('')
const loginDialogRedirectPath = ref('/user/center')
const loginDialogForm = reactive({
  nickname: '',
  password: ''
})
const loginDialogSiteConfig = computed(() => siteConfigState.value ?? getDefaultSitePublicConfig())

/**
 * 函数说明：合并后台基础头部链接与登录入口链接，并去重保证渲染稳定。
 */
const mergeHeaderLinksWithAuthEntries = (
  siteConfig: Awaited<ReturnType<typeof getSitePublicConfig>>
): SiteLinkItem[] => {
  const mergedLinks: SiteLinkItem[] = siteConfig.headerLinks.length
    ? [...siteConfig.headerLinks]
    : [...defaultHeaderLinks]

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
    if (url.startsWith('http')) {
      window.open(url, '_blank')
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
  return url.startsWith('http://') || url.startsWith('https://')
}

/**
 * 函数说明：判断头部点击是否属于登录页路由，兼容携带 query 的登录地址。
 */
const isLoginRouteLink = (url: string): boolean => {
  const targetUrl = String(url || '').trim()
  return targetUrl === '/user/login' || targetUrl.startsWith('/user/login?')
}

/**
 * 函数说明：打开头部登录弹窗并记录登录成功后回跳地址。
 */
const openLoginDialog = (payload: FrontendUserLoginPromptPayload = {}) => {
  const redirectPath = String(payload.redirectPath || '/user/center').trim() || '/user/center'
  const reason = String(payload.reason || '').trim()
  loginDialogReason.value = reason
  loginDialogRedirectPath.value = redirectPath
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
    source: String(payload.source || '').trim()
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
  <header class="h-14 sm:h-16 w-full flex items-center bg-white border-b border-gray-200 rounded-b-xl">
    <div class="flex items-center">
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

    <div class="container mx-auto px-0 md:px-4">
      <div class="flex justify-end items-center w-full">
        <div class="flex items-center gap-4">
          <div class="flex items-center space-x-2.5 pr-4 md:pr-0">
            <!-- 搜索按钮 -->
            <div class="menu-icon-btn" @click="toggleSearch">
              <el-icon class="text-gray-500 hover:text-blue-500">
                <Search />
              </el-icon>
            </div>

            <router-link to="/about" class="menu-icon-btn hover:text-blue-500">
              <el-tooltip :content="`关于${siteName}`">
                <svg class="w-5 h-5" viewBox="0 0 1024 1024">
                  <path
                    d="M511.899716 948.506609c-241.310951 0-437.636339-196.318224-437.636339-437.636339 0-241.323231 196.325387-437.639408 437.636339-437.639408s437.636339 196.316178 437.636339 437.639408C949.536055 752.188384 753.210667 948.506609 511.899716 948.506609zM511.899716 113.944122c-218.866776 0-396.926148 178.064488-396.926148 396.926148 0 218.856543 178.059372 396.926148 396.926148 396.926148 218.868823 0 396.926148-178.069605 396.926148-396.926148C908.825864 292.00861 730.768539 113.944122 511.899716 113.944122zM561.15656 335.324138c-29.853935 0-54.03773-24.189935-54.03773-54.047963 0-29.855982 24.184819-54.047963 54.03773-54.047963 29.838585 0 54.0408 24.191982 54.0408 54.047963C615.19736 311.134203 590.995145 335.324138 561.15656 335.324138zM424.962691 430.321746c0-4.394077 0-8.806573 0-13.19758 42.878576-17.016559 108.943224-10.793834 153.201218-26.418696 1.75804 0 3.510964 0 5.27719 0-21.329794 108.134813-66.391083 206.496028-76.599585 316.955792 2.425236 1.850138 2.086521 1.473561 5.287423 2.623757 33.247218 11.155061 52.320623-66.110697 73.948199-60.727083 21.644973 5.38873-13.548574 43.733037-18.47784 50.193169-19.400862 25.362644-56.465013 68.439742-100.376105 68.657706-31.008224 0.181125-63.159482-19.378349-58.101279-71.301929 5.056156-51.981908 34.219359-124.319423 50.172703-182.263114C472.184179 468.050022 488.801648 429.049776 424.962691 430.321746z"
                    fill="currentColor"></path>
                </svg>
              </el-tooltip>
            </router-link>

            <a
              v-for="(item, index) in displayHeaderLinks"
              :key="`${item.name}-${item.link}-${index}`"
              :href="item.link"
              :target="isExternalLink(item.link) ? '_blank' : '_self'"
              :rel="isExternalLink(item.link) ? 'noopener noreferrer' : undefined"
              @click="handleHeaderLinkClick($event, item.link, item.name)"
              :class="['hidden md:flex items-center text-sm transition-colors header-link-item', { 'header-link--disabled': isHeaderLinkDisabled(item.link) }]"
            >
              <el-tooltip :content="item.name">
                <span>{{ item.name }}</span>
              </el-tooltip>
            </a>

            <el-button type="primary" @click="addToBookmark" class="hidden md:flex ml-2.5">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="currentColor" />
                </svg>
                收藏到书签
              </span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索组件 -->
    <SearchPanel v-model:visible="showSearch" @select="handleSearchSelect" />

    <el-dialog
      v-model="loginDialogVisible"
      width="580px"
      align-center
      destroy-on-close
      :close-on-click-modal="false"
      class="frontend-login-dialog"
    >
      <template #header>
        <div class="login-dialog-header">
          <div class="login-dialog-kicker">账号登录</div>
          <h3>登录用户中心</h3>
          <p>{{ loginDialogReason || '登录后可进入个人中心，查看每日积分并绑定 QQ 邮箱。' }}</p>
        </div>
      </template>

      <div class="login-dialog-shell">
        <aside class="login-dialog-side">
          <div class="login-dialog-side-title">登录权益</div>
          <div class="login-dialog-points">
            <div class="points-chip">
              每日赠送 +{{ loginDialogSiteConfig.loginDailyGiftPoints }}
            </div>
            <div class="points-chip">
              每次工具消耗 -{{ loginDialogSiteConfig.loginToolConsumePoints }}
            </div>
            <div class="points-chip" v-if="loginDialogSiteConfig.loginMemberEnabled && loginDialogSiteConfig.loginMemberTrialDays > 0">
              新用户会员试用 {{ loginDialogSiteConfig.loginMemberTrialDays }} 天
            </div>
          </div>
          <ul class="login-dialog-side-list">
            <li><span>●</span> 登录后可直接进入个人中心</li>
            <li><span>●</span> 支持绑定 QQ 邮箱，便于通知提醒</li>
            <li><span>●</span> 会员与积分权益实时到账</li>
          </ul>
        </aside>

        <section class="login-dialog-main">
          <el-form label-position="top" @submit.prevent>
            <el-form-item label="昵称">
              <el-input v-model="loginDialogForm.nickname" placeholder="请输入昵称" maxlength="24" clearable />
            </el-form-item>
            <el-form-item label="密码">
              <el-input
                v-model="loginDialogForm.password"
                type="password"
                show-password
                placeholder="请输入密码（6位以上）"
                maxlength="32"
                clearable
              />
            </el-form-item>
          </el-form>

          <div class="login-dialog-auth-actions">
            <el-button
              v-if="loginDialogSiteConfig.loginOpenOtherAuth && loginDialogSiteConfig.loginOpenWechatAuth"
              plain
              class="login-auth-button"
              @click="handleOpenAuth(loginDialogSiteConfig.loginWechatAuthorizeUrl)"
            >
              微信登录
            </el-button>
            <el-button
              v-if="loginDialogSiteConfig.loginOpenOtherAuth && loginDialogSiteConfig.loginOpenQqAuth"
              plain
              class="login-auth-button"
              @click="handleOpenAuth(loginDialogSiteConfig.loginQqAuthorizeUrl)"
            >
              QQ登录
            </el-button>
          </div>

          <div class="login-dialog-footer">
            <el-button @click="loginDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="loginDialogLoading" @click="handleLoginFromDialog">
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
.daily-word-outer {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex: 1;
  min-width: 200px;
  max-width: fit-content;
}

.daily-word-outer:hover {
  background: #f0edff;
}

.daily-word-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
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
  display: inline;
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
  .daily-word-outer {
    max-width: 800px;
  }
}

@media screen and (max-width: 1200px) {
  .daily-word-outer {
    max-width: 600px;
  }
}

@media screen and (max-width: 992px) {
  .daily-word-outer {
    max-width: 400px;
  }
}

/* 统一图标按钮样式 */
.menu-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #515151;
  border-radius: 8px;
}

.menu-icon-btn:hover {
  color: #6C54FF;
  background-color: #f0edff;
  transform: translateY(-1px);
}

.menu-icon-btn .el-icon {
  font-size: 20px;
}

.header-link-item {
  color: #6b7280;
}

.header-link-item:hover {
  color: #3b82f6;
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

.login-dialog-header h3 {
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 700;
  color: #222743;
}

.login-dialog-header p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6f768a;
  line-height: 1.6;
}

.login-dialog-kicker {
  width: fit-content;
  border-radius: 999px;
  border: 1px solid #dbd3ff;
  background: #f4f1ff;
  color: #5d48d6;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
}

.login-dialog-shell {
  display: grid;
  grid-template-columns: 214px 1fr;
  gap: 12px;
}

.login-dialog-side {
  border: 1px solid #e7e0ff;
  background: linear-gradient(165deg, #f7f4ff 0%, #f2f8ff 100%);
  border-radius: 12px;
  padding: 12px 12px 10px;
}

.login-dialog-side-title {
  font-size: 14px;
  font-weight: 700;
  color: #272c49;
  margin-bottom: 10px;
}

.login-dialog-points {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.points-chip {
  border: 1px solid #ddd6ff;
  background: #f7f4ff;
  color: #5240c8;
  border-radius: 999px;
  font-size: 12px;
  padding: 4px 9px;
  line-height: 1.4;
}

.login-dialog-side-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  color: #656d82;
  font-size: 12px;
  line-height: 1.6;
}

.login-dialog-side-list li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.login-dialog-side-list li span {
  color: #6c54ff;
}

.login-dialog-main {
  display: flex;
  flex-direction: column;
  border: 1px solid #eceff6;
  border-radius: 12px;
  background: #ffffff;
  padding: 12px;
}

.login-dialog-auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.login-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.login-auth-button {
  border-color: #d8dcf3;
  color: #3d4664;
}

:deep(.frontend-login-dialog .el-dialog) {
  border-radius: 16px;
  border: 1px solid #e8ebf4;
  padding: 4px 4px 2px;
}

:deep(.frontend-login-dialog .el-dialog__header) {
  margin-right: 0;
  padding-bottom: 8px;
}

:deep(.frontend-login-dialog .el-dialog__body) {
  padding-top: 0;
}

:deep(.frontend-login-dialog .el-form-item__label) {
  color: #364057;
  font-weight: 600;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .daily-word-outer {
    display: none;
  }

  .login-dialog-shell {
    grid-template-columns: 1fr;
  }

  .login-dialog-main {
    padding: 10px;
  }
}
</style>
