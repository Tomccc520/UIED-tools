<!--
* @file Left.vue
* @description 左侧菜单组件，提供工具分类导航和快速访问功能
* @author UIED技术团队
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-8
*
* 功能特性：
* 1. Logo和站点信息展示
* 2. 推荐工具快速访问（默认展开）
* 3. 工具分类导航（支持多级菜单）
* 4. 页面内锚点定位功能
* 5. 统一的图标样式（线性图标+绿点装饰）
* 6. 响应式布局适配
-->

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from '@vue/runtime-core'
import { useToolsStore } from '@/store/modules/tools'
import { useRouter, useRoute } from 'vue-router'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToolsCate } from '@/components/Tools/tools'
import type { ToolCategory, ToolSubCategory } from '@/types/tools'
import {
  getSitePublicConfig,
  type SiteLinkItem,
  type SiteSidebarCategoryMenu,
  type SiteSidebarMenuBlock,
  type SiteSidebarMenuBlockItem,
  type SiteSidebarMenuBlockType
} from '@/services/siteConfig'

// 路由实例
const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

// 应用信息配置
const appName = ref('UIED-Tools')
const appNet = ref('免费在线工具集')
const sidebarBrandLogo = ref('')
const recommendTitle = ref('推荐工具')
const defaultRecommendLinks: SiteLinkItem[] = [
  { name: '热门工具', link: '#recommend-hot' },
  { name: '随机推荐', link: '/tools/random-tools' },
  { name: '每日热榜', link: '/tools/hot-ranking' },
  { name: '每日文章', link: 'https://hot.uied.cn/' },
  { name: '实时资讯', link: '/tools/ai-news' },
  { name: 'AI产品榜', link: 'https://hao.uied.cn/' }
]
const recommendLinks = ref<SiteLinkItem[]>(defaultRecommendLinks)
const defaultSidebarCategoryMenus: SiteSidebarCategoryMenu[] = [
  { key: 'ai', title: 'AI工具箱', cateTitle: 'AI工具箱', link: '/tools/ai/toolbox' },
  { key: 'design', title: '设计工具', cateTitle: '设计工具' },
  { key: 'image', title: '图片处理', cateTitle: '图片处理' },
  { key: 'office', title: '办公工具', cateTitle: '办公工具' },
  { key: 'daily', title: '生活常用', cateTitle: '生活常用' },
  { key: 'copywriting', title: '文案工具', cateTitle: '文案工具' },
  { key: 'psychology', title: '潜能测试', cateTitle: '潜能测试' },
  { key: 'video', title: '剪辑工具', cateTitle: '剪辑工具' },
  { key: 'dev', title: '开发工具', cateTitle: '开发工具' },
  { key: 'slacking', title: '摸鱼工具', cateTitle: '摸鱼工具' },
  { key: 'efficiency', title: '效率工具', cateTitle: '效率工具' }
]
const defaultSidebarMenuBlocks: SiteSidebarMenuBlock[] = []
const defaultSidebarBottomLinks: SiteLinkItem[] = [
  { name: '更新记录', link: '/changelog' },
  { name: '意见反馈', link: 'https://uiedtool.com/' },
  { name: '关于我们', link: '/about' }
]
const defaultAiToolboxSidebarMenus: SiteLinkItem[] = [
  { name: 'AI精选工具', link: '#ai-highlight' },
  { name: 'AI分组总览', link: '#ai-groups' }
]
const sidebarCategoryMenus = ref<SiteSidebarCategoryMenu[]>(defaultSidebarCategoryMenus)
const sidebarMenuBlocks = ref<SiteSidebarMenuBlock[]>(defaultSidebarMenuBlocks)
const sidebarBottomLinks = ref<SiteLinkItem[]>(defaultSidebarBottomLinks)
const aiToolboxSidebarMenus = ref<SiteLinkItem[]>(defaultAiToolboxSidebarMenus)

type SidebarBrandLogoMode = 'default' | 'image' | 'inline-svg'

/**
 * 函数说明：解码常见 HTML 实体，兼容后台文本域保存后的转义内容。
 */
const decodeHtmlEntities = (rawValue: string): string => {
  return String(rawValue || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&amp;/g, '&')
}

/**
 * 函数说明：安全尝试 URL 解码，兼容历史上被错误编码成 `%3Csvg...` 的值。
 */
const safeDecodeURIComponent = (rawValue: string): string => {
  try {
    return decodeURIComponent(rawValue)
  } catch {
    return rawValue
  }
}

/**
 * 函数说明：规范化内联 SVG 字符串，兼容完整 <svg>、仅 <g> 片段，以及包含外层 div / 编码内容的整段 HTML。
 */
const normalizeInlineSvgLogo = (logoValue: string): string => {
  const rawValue = String(logoValue || '').trim()
  if (!rawValue) {
    return ''
  }

  const candidateList = [
    rawValue,
    decodeHtmlEntities(rawValue),
    safeDecodeURIComponent(rawValue),
    decodeHtmlEntities(safeDecodeURIComponent(rawValue))
  ]

  for (const candidate of candidateList) {
    const normalizedCandidate = String(candidate || '').trim()
    if (!normalizedCandidate) {
      continue
    }
    const svgMatched = normalizedCandidate.match(/<svg[\s\S]*<\/svg>/i)
    if (svgMatched?.[0]) {
      return svgMatched[0]
    }
    const groupMatched = normalizedCandidate.match(/<g[\s\S]*<\/g>/i)
    if (groupMatched?.[0]) {
      return `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${groupMatched[0]}</svg>`
    }
  }
  return ''
}

/**
 * 函数说明：解析品牌 Logo 渲染模式，支持默认图形、图片链接和内联 SVG 三种方式。
 */
const sidebarBrandLogoMode = computed<SidebarBrandLogoMode>(() => {
  const logoValue = String(sidebarBrandLogo.value || '').trim()
  const normalizedInlineSvg = normalizeInlineSvgLogo(logoValue)
  if (!logoValue) {
    return 'default'
  }
  if (normalizedInlineSvg) {
    return 'inline-svg'
  }
  return 'image'
})

/**
 * 函数说明：输出品牌 Logo 的内联 SVG 内容，仅在后端配置内联 SVG 时使用。
 */
const sidebarBrandInlineSvg = computed(() => {
  return sidebarBrandLogoMode.value === 'inline-svg'
    ? normalizeInlineSvgLogo(String(sidebarBrandLogo.value || ''))
    : ''
})

/**
 * 函数说明：输出品牌 Logo 图片地址，兼容绝对链接、站内路径和 data URL。
 */
const sidebarBrandLogoSrc = computed(() => {
  const logoValue = String(sidebarBrandLogo.value || '').trim()
  if (!logoValue || sidebarBrandLogoMode.value !== 'image') {
    return ''
  }
  if (/^(https?:)?\/\//i.test(logoValue) || logoValue.startsWith('data:')) {
    return logoValue
  }
  return logoValue
})

// 菜单状态配置
const defaultActive = ref('')

/**
 * 函数说明：标准化路由路径，统一去除查询、哈希与尾部斜杠，避免同一路径在不同写法下匹配失败。
 */
const normalizeRoutePath = (rawPath: string): string => {
  const normalized = String(rawPath || '').trim().replace(/[?#].*$/, '')
  if (!normalized) {
    return '/'
  }
  if (normalized.length === 1) {
    return normalized
  }
  return normalized.replace(/\/+$/, '')
}

const aiToolboxHomePath = '/tools/ai/toolbox'
const normalizedAiToolboxHomePath = normalizeRoutePath(aiToolboxHomePath)
const sidebarBuiltinToolCategories = getToolsCate()

/**
 * 函数说明：判断链接是否为站内路由链接。
 */
const isInternalMenuLink = (link: string): boolean => {
  return String(link || '').trim().startsWith('/')
}

/**
 * 函数说明：提取 AI 工具箱分类下的工具路由集合，用于在 AI 工具页保留 AI 侧栏菜单。
 */
const aiToolRouteSet = computed<Set<string>>(() => {
  const pathSet = new Set<string>([normalizedAiToolboxHomePath])
  const aiCategory = sidebarBuiltinToolCategories.find((cate: ToolCategory) => cate.title === 'AI工具箱')
  const aiRoutes = (aiCategory?.list || [])
    .flatMap((group) => (Array.isArray(group.list) ? group.list : []))
    .map((tool) => String(tool.url || '').trim())
    .filter((toolPath) => toolPath.startsWith('/'))
  aiRoutes.forEach((toolPath) => {
    pathSet.add(normalizeRoutePath(toolPath))
  })
  return pathSet
})
const isAiToolboxHomeRoute = computed<boolean>(() => normalizeRoutePath(route.path) === normalizedAiToolboxHomePath)
const isAiToolboxRoute = computed<boolean>(() => aiToolRouteSet.value.has(normalizeRoutePath(route.path)))
const defaultOpeneds = computed<string[]>(() => {
  return ['recommend']
})

// store实例
const toolsStore = useToolsStore()

interface DisplaySidebarCategoryMenu extends SiteSidebarCategoryMenu {
  list: ToolSubCategory[]
  isDirectLink: boolean
  resolvedLink: string
  resolvedIcon: string
}

interface AiToolboxSidebarMenuItem extends SiteLinkItem {
  icon: string
}

interface DisplaySidebarMenuBlockItem extends SiteSidebarMenuBlockItem {
  icon: string
  image: string
}

interface DisplaySidebarMenuBlock extends SiteSidebarMenuBlock {
  key: string
  type: SiteSidebarMenuBlockType
  title: string
  icon: string
  items: DisplaySidebarMenuBlockItem[]
}

const defaultSidebarMenuIconMap: Record<string, string> = {
  ai: '/icons/sidebar/ai.svg',
  design: '/icons/sidebar/design.svg',
  image: '/icons/sidebar/image.svg',
  office: '/icons/sidebar/office.svg',
  daily: '/icons/sidebar/daily.svg',
  copywriting: '/icons/sidebar/copywriting.svg',
  psychology: '/icons/sidebar/psychology.svg',
  video: '/icons/sidebar/video.svg',
  dev: '/icons/sidebar/dev.svg',
  slacking: '/icons/sidebar/slacking.svg',
  efficiency: '/icons/sidebar/efficiency.svg'
}

/**
 * 函数说明：解析侧边栏菜单图标地址，优先使用后台配置图标，未配置时回退内置 SVG 图标
 */
const resolveCategoryIcon = (menu: SiteSidebarCategoryMenu): string => {
  const customIcon = String(menu.icon || '').trim()
  if (customIcon) {
    return customIcon
  }
  return defaultSidebarMenuIconMap[menu.key] || '/icons/sidebar/default.svg'
}

/**
 * 函数说明：标准化侧栏菜单模块类型，兜底为列表菜单避免运行时渲染异常。
 */
const normalizeSidebarMenuBlockType = (input: string): SiteSidebarMenuBlockType => {
  const type = String(input || '').trim().toLowerCase()
  if (type === 'dropdown' || type === 'list' || type === 'image' || type === 'category') {
    return type
  }
  return 'list'
}

/**
 * 函数说明：输出侧栏菜单模块图标，优先条目图标，再回退到模块图标与默认图标。
 */
const resolveSidebarMenuBlockIcon = (blockIcon: string, itemIcon: string): string => {
  const itemIconValue = String(itemIcon || '').trim()
  if (itemIconValue) {
    return itemIconValue
  }
  const blockIconValue = String(blockIcon || '').trim()
  if (blockIconValue) {
    return blockIconValue
  }
  return '/icons/sidebar/default.svg'
}

/**
 * 函数说明：输出侧栏菜单图片卡片资源，未配置时自动回退到条目图标。
 */
const resolveSidebarMenuBlockImage = (image: string, icon: string): string => {
  const imageValue = String(image || '').trim()
  if (imageValue) {
    return imageValue
  }
  return resolveSidebarMenuBlockIcon('', icon)
}

/**
 * 函数说明：根据配置中的分类标题匹配工具分类列表，匹配不到时返回空数组
 */
const resolveCategoryList = (cateTitle: string): ToolSubCategory[] => {
  return sidebarBuiltinToolCategories.find((cate: ToolCategory) => cate.title === cateTitle)?.list || []
}

/**
 * 函数说明：解析分类菜单的直达链接，优先使用后台配置，AI工具箱默认跳聚合页
 */
const resolveCategoryDirectLink = (menu: SiteSidebarCategoryMenu): string => {
  const rawLink = String(menu.link || '').trim()
  if (rawLink) {
    return rawLink
  }
  if (menu.key === 'ai' || menu.cateTitle === 'AI工具箱') {
    return '/tools/ai/toolbox'
  }
  return ''
}

/**
 * 函数说明：判断当前分类菜单是否为 AI 工具箱入口，兼容后台自定义 key 与标题
 */
const isAiToolboxCategoryMenu = (menu: DisplaySidebarCategoryMenu): boolean => {
  return menu.key === 'ai' || menu.cateTitle === 'AI工具箱' || menu.resolvedLink === '/tools/ai/toolbox'
}

/**
 * 函数说明：构建可渲染的侧边栏分类菜单，过滤掉未匹配到工具分类的分组
 */
const displaySidebarCategoryMenus = computed<DisplaySidebarCategoryMenu[]>(() => {
  const source = sidebarCategoryMenus.value.length ? sidebarCategoryMenus.value : defaultSidebarCategoryMenus
  return source
    .map((menu) => {
      const resolvedLink = resolveCategoryDirectLink(menu)
      return {
        ...menu,
        list: resolveCategoryList(menu.cateTitle),
        resolvedLink,
        isDirectLink: Boolean(resolvedLink),
        resolvedIcon: resolveCategoryIcon(menu)
      }
    })
    .filter((menu) => menu.isDirectLink || menu.list.length > 0)
})

/**
 * 函数说明：构建可渲染的侧栏菜单样式模块，支持下拉/列表/图片/分类四种样式。
 */
const displaySidebarMenuBlocks = computed<DisplaySidebarMenuBlock[]>(() => {
  const source = sidebarMenuBlocks.value.length ? sidebarMenuBlocks.value : defaultSidebarMenuBlocks
  return source
    .map((block, blockIndex) => {
      const key = String(block.key || '').trim() || `menu-block-${blockIndex + 1}`
      const title = String(block.title || '').trim()
      const type = normalizeSidebarMenuBlockType(String(block.type || ''))
      const icon = String(block.icon || '').trim()
      const items = Array.isArray(block.items)
        ? block.items
            .map((item) => {
              const name = String(item.name || '').trim()
              const link = String(item.link || '').trim()
              if (!name || !link) {
                return null
              }
              const itemIcon = String(item.icon || '').trim()
              const itemImage = String(item.image || '').trim()
              const desc = String(item.desc || '').trim()
              const category = String(item.category || '').trim()
              const resolvedIcon = resolveSidebarMenuBlockIcon(icon, itemIcon)
              return {
                name,
                link,
                icon: resolvedIcon,
                image: resolveSidebarMenuBlockImage(itemImage, resolvedIcon),
                ...(desc ? { desc } : {}),
                ...(category ? { category } : {})
              } as DisplaySidebarMenuBlockItem
            })
            .filter((item): item is DisplaySidebarMenuBlockItem => Boolean(item))
        : []

      if (!title || items.length === 0) {
        return null
      }
      return {
        key,
        title,
        type,
        icon: resolveSidebarMenuBlockIcon(icon, ''),
        items
      } as DisplaySidebarMenuBlock
    })
    .filter((block): block is DisplaySidebarMenuBlock => Boolean(block))
})

/**
 * 函数说明：判断侧栏菜单样式模块是否可用；可用时优先渲染该模块以替代旧分类菜单。
 */
const hasSidebarMenuBlocks = computed<boolean>(() => displaySidebarMenuBlocks.value.length > 0)

/**
 * 函数说明：获取最终用于渲染的侧栏底部链接列表，空配置时回退默认值
 */
const displaySidebarBottomLinks = computed<SiteLinkItem[]>(() => {
  return sidebarBottomLinks.value.length ? sidebarBottomLinks.value : defaultSidebarBottomLinks
})

/**
 * 函数说明：获取 AI 工具箱独立侧栏菜单，优先后台配置，未配置时回退默认值
 */
const displayAiToolboxSidebarMenus = computed<SiteLinkItem[]>(() => {
  const source = aiToolboxSidebarMenus.value.length ? aiToolboxSidebarMenus.value : defaultAiToolboxSidebarMenus
  const fixedMenus: SiteLinkItem[] = []

  source.forEach((item) => {
    const name = String(item.name || '').trim()
    const link = String(item.link || '').trim()
    if (!name || !link) {
      return
    }
    if (!isExternalMenuLink(link) && !isAnchorMenuLink(link) && !isInternalMenuLink(link)) {
      return
    }
    fixedMenus.push({ name, link })
  })

  if (!fixedMenus.length) {
    fixedMenus.push(
      { name: 'AI精选工具', link: '#ai-highlight' },
      { name: 'AI分组总览', link: '#ai-groups' }
    )
  }

  const aiGroups = resolveCategoryList('AI工具箱')
  const categoryAnchorMenus = aiGroups
    .map((group, index) => {
      const title = String(group.title || '').trim()
      if (!title) {
        return null
      }
      const groupId = String(group.id || '').trim() || String(index + 1)
      return {
        name: title,
        link: `#ai-group-${groupId}`
      } as SiteLinkItem
    })
    .filter((item): item is SiteLinkItem => Boolean(item))

  const mergedMenus = [...fixedMenus, ...categoryAnchorMenus]
  const uniqueMenus: SiteLinkItem[] = []
  const seenKey = new Set<string>()

  mergedMenus.forEach((item) => {
    const key = `${item.name}__${item.link}`
    if (seenKey.has(key)) {
      return
    }
    seenKey.add(key)
    uniqueMenus.push(item)
  })

  return uniqueMenus
})

/**
 * 函数说明：判断 AI 工具箱菜单链接是否为外部链接
 */
const isExternalMenuLink = (link: string): boolean => {
  return link.startsWith('http://') || link.startsWith('https://')
}

/**
 * 函数说明：从 AI 工具箱菜单链接中提取锚点，兼容 #anchor 与 /tools/ai/toolbox?value=anchor 历史格式
 */
const resolveAiToolboxAnchor = (link: string): string => {
  const target = String(link || '').trim()
  if (!target) {
    return ''
  }
  if (target.startsWith('#')) {
    return target.slice(1).trim()
  }
  if (!target.startsWith('/')) {
    return ''
  }

  try {
    const parsedUrl = new URL(target, window.location.origin)
    if (normalizeRoutePath(parsedUrl.pathname) !== normalizedAiToolboxHomePath) {
      return ''
    }
    const queryAnchor = String(parsedUrl.searchParams.get('value') || parsedUrl.searchParams.get('anchor') || '').trim()
    if (queryAnchor) {
      return queryAnchor
    }
    const hashAnchor = String(parsedUrl.hash || '').replace(/^#/, '').trim()
    return hashAnchor || 'ai-highlight'
  } catch {
    const queryPart = target.split('?')[1] || ''
    const searchParams = new URLSearchParams(queryPart)
    const queryAnchor = String(searchParams.get('value') || searchParams.get('anchor') || '').trim()
    if (queryAnchor) {
      return queryAnchor
    }
    const hashPart = target.split('#')[1] || ''
    return hashPart.trim() || 'ai-highlight'
  }
}

/**
 * 函数说明：判断 AI 工具箱菜单链接是否属于页面内导航
 */
const isAnchorMenuLink = (link: string): boolean => {
  return Boolean(resolveAiToolboxAnchor(link))
}

/**
 * 函数说明：根据菜单文案关键词匹配图标，确保 AI 工具箱左栏不同入口有差异化图标
 */
const resolveAiToolboxMenuIconByName = (name: string): string => {
  const normalizedName = String(name || '').toLowerCase()
  if (normalizedName.includes('抠图') || normalizedName.includes('图像') || normalizedName.includes('图片')) {
    return '/icons/sidebar/image.svg'
  }
  if (normalizedName.includes('视频') || normalizedName.includes('音频')) {
    return '/icons/sidebar/video.svg'
  }
  if (normalizedName.includes('写作') || normalizedName.includes('文案')) {
    return '/icons/sidebar/copywriting.svg'
  }
  if (normalizedName.includes('办公') || normalizedName.includes('效率')) {
    return '/icons/sidebar/office.svg'
  }
  if (normalizedName.includes('开发') || normalizedName.includes('代码')) {
    return '/icons/sidebar/dev.svg'
  }
  if (normalizedName.includes('设计') || normalizedName.includes('绘图') || normalizedName.includes('logo')) {
    return '/icons/sidebar/design.svg'
  }
  return '/icons/sidebar/ai.svg'
}

/**
 * 函数说明：按 AI 菜单类型匹配侧栏图标，固定入口、自动分组、外链入口分别使用不同图标
 */
const resolveAiToolboxMenuIcon = (item: SiteLinkItem): string => {
  const lowerLink = String(item.link || '').trim().toLowerCase()
  const anchor = resolveAiToolboxAnchor(lowerLink).toLowerCase()

  if (anchor === 'ai-highlight') {
    return '/icons/sidebar/ai.svg'
  }
  if (anchor === 'ai-groups') {
    return '/icons/sidebar/office.svg'
  }
  if (anchor.startsWith('ai-group-')) {
    return resolveAiToolboxMenuIconByName(item.name)
  }

  if (lowerLink.includes('matting') || lowerLink.includes('background') || lowerLink.includes('remove-watermark')) {
    return '/icons/sidebar/image.svg'
  }
  if (lowerLink.includes('video') || lowerLink.includes('audio')) {
    return '/icons/sidebar/video.svg'
  }
  if (lowerLink.includes('chat') || lowerLink.includes('deepseek')) {
    return '/icons/sidebar/ai.svg'
  }
  if (isExternalMenuLink(lowerLink)) {
    return '/icons/sidebar/efficiency.svg'
  }
  return '/icons/sidebar/dev.svg'
}

/**
 * 函数说明：构建 AI 工具箱左侧菜单显示数据，补齐每项图标配置
 */
const displayAiToolboxSidebarMenuItems = computed<AiToolboxSidebarMenuItem[]>(() => {
  return displayAiToolboxSidebarMenus.value.map((item) => ({
    ...item,
    icon: resolveAiToolboxMenuIcon(item)
  }))
})

/**
 * 获取工具分类数据
 * @description 从服务器获取工具分类列表
*/
const getToolCates = async () => {
  try {
    await toolsStore.getToolCate()
  } catch (error) {
    console.log('获取工具分类失败:', error)
  }
}

/**
 * 函数说明：读取后台站点基础配置并更新侧栏品牌信息
 */
const loadSiteConfig = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true })
  if (siteConfig.webName) {
    appName.value = siteConfig.webName
  }
  if (siteConfig.sidebarBrandText) {
    appName.value = siteConfig.sidebarBrandText
  }
  if (siteConfig.siteSlogan) {
    appNet.value = siteConfig.siteSlogan
  }
  sidebarBrandLogo.value = siteConfig.sidebarBrandLogo || ''

  /**
   * 函数说明：左侧菜单恢复为前端内置默认数据，不再受后台同名配置覆盖。
   * 仅保留品牌名称、标语与 Logo 由后台配置。
   */
  recommendTitle.value = '推荐工具'
  recommendLinks.value = defaultRecommendLinks
  sidebarCategoryMenus.value = defaultSidebarCategoryMenus
  sidebarMenuBlocks.value = []
  sidebarBottomLinks.value = defaultSidebarBottomLinks
  aiToolboxSidebarMenus.value = defaultAiToolboxSidebarMenus
}

// 菜单事件处理
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}

/**
 * 锚点跳转功能
 * @description 实现页面内锚点平滑滚动和跨页面锚点跳转
 * @param id 目标锚点ID
 */
const gotoAnchor = async (id: string) => {
  const targetId = String(id || '').trim()
  if (!targetId) {
    return
  }

  // 如果当前路由不是首页，先带锚点参数跳回首页，再由首页逻辑滚动定位
  if (route.path !== '/') {
    await router.push({ path: '/', query: { value: targetId } })
    return
  }

  // 当前就在首页时，直接执行平滑滚动
  gotoCurrentPageAnchor(targetId)
}

/**
 * 函数说明：当前页面锚点跳转，不切换路由，仅滚动到当前文档指定位置
 */
const gotoCurrentPageAnchor = (id: string) => {
  nextTick(() => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

/**
 * 工具页面跳转
 * @description 跳转到指定的工具页面
 * @param url 目标页面路由
 */
const gotoTool = (url: string) => {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    return
  }

  /**
   * 函数说明：统一解析站内跳转链接，避免把 ?query 当成 path 字面量导致路由命中失败。
   */
  const resolvedRoute = router.resolve(targetUrl)
  const hasExplicitQueryOrHash = targetUrl.includes('?') || targetUrl.includes('#')

  // 仅在“目标链接未显式携带 query/hash”时清理当前 URL 中的 value 参数
  if (route.query.value && !hasExplicitQueryOrHash) {
    router.replace({
      path: resolvedRoute.path,
      query: {},
      hash: ''
    })
    return
  }

  router.push({
    path: resolvedRoute.path,
    query: resolvedRoute.query,
    hash: resolvedRoute.hash || ''
  })
}

/**
 * 外部链接跳转
 * @description 在新标签页打开外部链接
 * @param url 目标链接
 */
const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * 函数说明：处理推荐工具菜单点击，按链接类型执行路由跳转、锚点滚动或外链打开
 */
const handleRecommendItemClick = (link: SiteLinkItem) => {
  const targetLink = link.link.trim()
  if (!targetLink) {
    return
  }
  if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
    openExternalLink(targetLink)
    return
  }
  if (targetLink.startsWith('#')) {
    gotoAnchor(targetLink.slice(1))
    return
  }
  gotoTool(targetLink)
}

/**
 * 函数说明：处理侧栏底部链接点击，自动判断内链、外链和锚点跳转
 */
const handleBottomLinkItemClick = (link: SiteLinkItem) => {
  const targetLink = link.link.trim()
  if (!targetLink) {
    return
  }
  if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
    openExternalLink(targetLink)
    return
  }
  if (targetLink.startsWith('#')) {
    gotoAnchor(targetLink.slice(1))
    return
  }
  gotoTool(targetLink)
}

/**
 * 函数说明：处理 AI 工具箱独立侧栏菜单点击，支持锚点/内链/外链三种跳转
 */
const handleAiToolboxSidebarItemClick = (link: SiteLinkItem) => {
  const targetLink = link.link.trim()
  if (!targetLink) {
    return
  }
  if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
    openExternalLink(targetLink)
    return
  }
  const anchor = resolveAiToolboxAnchor(targetLink)
  if (anchor) {
    if (isAiToolboxHomeRoute.value) {
      gotoCurrentPageAnchor(anchor)
      return
    }
    router.push({ path: aiToolboxHomePath, query: { value: anchor } })
    return
  }

  if (targetLink.startsWith('/')) {
    gotoTool(targetLink)
    return
  }

  gotoTool(targetLink)
}

/**
 * 函数说明：处理分类菜单点击，支持直达聚合页或外链
 */
const handleCategoryMenuClick = (menu: DisplaySidebarCategoryMenu) => {
  const targetLink = menu.resolvedLink.trim()
  if (!targetLink) {
    return
  }
  if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
    openExternalLink(targetLink)
    return
  }
  if (targetLink.startsWith('#')) {
    gotoAnchor(targetLink.slice(1))
    return
  }
  gotoTool(targetLink)
}

/**
 * 函数说明：处理侧栏菜单样式模块点击，统一支持内链、锚点和外链跳转。
 */
const handleSidebarMenuBlockItemClick = (item: DisplaySidebarMenuBlockItem) => {
  const targetLink = String(item.link || '').trim()
  if (!targetLink) {
    return
  }
  if (targetLink.startsWith('http://') || targetLink.startsWith('https://')) {
    openExternalLink(targetLink)
    return
  }
  if (targetLink.startsWith('#')) {
    gotoAnchor(targetLink.slice(1))
    return
  }
  gotoTool(targetLink)
}

/**
 * 菜单项点击处理
 * @description 处理菜单项点击事件，清理 URL 参数并进行跳转
 * @param key 菜单项的唯一标识
 */
const handleMenuClick = async (key: string) => {
  try {
    // 清理 URL 参数
    if (route.query.value) {
      await router.replace({
        path: route.path,
        query: {}
      })
    }

    await nextTick()

    // 处理特殊路由
    if (key === 'recommend-hot-ranking') {
      router.push('/tools/hot-ranking')
    } else if (key === 'recommend-random') {
      router.push('/tools/random-tools')
    } else if (key.includes('-')) {
      const [section, id] = key.split('-')
      gotoAnchor(`${section}-${id}`)
    } else if (key === 'changelog') {
      router.push('/changelog')
    } else {
      router.push(`/${key}`)
    }
  } catch (err) {
    console.error('菜单跳转失败:', err)
    ElMessage.error('页面跳转失败，请重试')
  }
}

// 生命周期钩子
onMounted(() => {
  void loadSiteConfig()
  getToolCates()
  toolsStore.getRecommends()  // 获取推荐工具数据
})
</script>

<template>
  <el-scrollbar class="h-screen flex flex-col">
    <!-- Logo区域 -->
    <div class="flex justify-center py-6">
      <router-link class="logo-container group" to="/" :title="`${appName} 首页`">
        <div class="flex items-center">
          <div class="logo-wrapper flex items-center">
            <div
              v-if="sidebarBrandLogoMode === 'inline-svg'"
              class="logo-inline-svg"
              v-html="sidebarBrandInlineSvg"
            ></div>
            <img
              v-else-if="sidebarBrandLogoMode === 'image'"
              class="logo-image"
              :src="sidebarBrandLogoSrc"
              :alt="`${appName} logo`"
            />
            <svg v-else width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-svg">
              <title>logo-3</title>
              <defs>
                <polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon>
              </defs>

              <g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="logo-3">
                  <!-- 背景填充 -->
                  <rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect>

                  <!-- 新Logo 使用从左到右的描边和填充动画 -->
                  <g id="logo-copy" transform="translate(19, 24)">
                    <path
                      d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z"
                      class="svg-elem"></path>

                    <g id="group">
                      <mask id="mask-9z3bcfbp2n-2" fill="white">
                        <use xlink:href="#path-9z3bcfbp2n-1"></use>
                      </mask>
                      <g id="Clip-4"></g>
                      <path
                        d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0"
                        class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path>
                    </g>

                    <path
                      d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z"
                      class="svg-elem"></path>

                    <polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon>

                    <polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div class="tools-text font-bold ml-2">{{ appName }}</div>
        </div>
        <div class="text-xs text-gray-400 mt-2 text-center">{{ appNet }}</div>
      </router-link>
    </div>

    <!-- 菜单区域 -->
    <div class="flex-1 pl-8 pr-8">
      <el-menu class="w-[200px]" :class="{ 'is-ai-toolbox-menu': isAiToolboxRoute }" :default-active="defaultActive" :default-openeds="defaultOpeneds"
        background-color="transparent" @open="handleOpen" @close="handleClose">
        <!-- 推荐工具（固定保留） -->
        <el-sub-menu index="recommend">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="menu-text">{{ recommendTitle }}</span>
          </template>
          <el-menu-item-group>
            <el-menu-item
              v-for="(item, index) in recommendLinks"
              :key="`${item.name}-${item.link}-${index}`"
              :index="`recommend-${index}`"
              @click="handleRecommendItemClick(item)"
            >
              {{ item.name }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <template v-if="isAiToolboxRoute">
          <el-menu-item
            v-for="(item, index) in displayAiToolboxSidebarMenuItems"
            :key="`${item.name}-${item.link}-${index}`"
            :class="['menu-top-item', 'menu-ai-toolbox-item', { 'menu-ai-toolbox-first': index === 0 }]"
            :index="`ai-toolbox-menu-${index}`"
            @click="handleAiToolboxSidebarItemClick(item)"
          >
            <div class="relative menu-icon-wrap">
              <img class="menu-image-icon" :src="item.icon" :alt="`${item.name} 图标`" />
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="menu-text">{{ item.name }}</span>
          </el-menu-item>
        </template>

        <template v-else>
          <template v-if="hasSidebarMenuBlocks">
            <template v-for="block in displaySidebarMenuBlocks" :key="`menu-block-${block.key}`">
              <el-sub-menu
                v-if="block.type === 'dropdown' || block.type === 'category'"
                :index="`menu-block-${block.key}`"
              >
                <template #title>
                  <div class="relative menu-icon-wrap">
                    <img class="menu-image-icon" :src="block.icon" :alt="`${block.title} 图标`" />
                    <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
                  </div>
                  <span class="menu-text">{{ block.title }}</span>
                </template>
                <el-menu-item-group>
                  <el-menu-item
                    v-for="(item, index) in block.items"
                    :key="`menu-block-item-${block.key}-${index}`"
                    :index="`menu-block-item-${block.key}-${index}`"
                    :class="{ 'menu-category-item': block.type === 'category' }"
                    @click="handleSidebarMenuBlockItemClick(item)"
                  >
                    <span class="menu-category-item-name">{{ item.name }}</span>
                    <span
                      v-if="block.type === 'category' && (item.category || item.desc)"
                      class="menu-category-item-meta"
                    >
                      {{ item.category || item.desc }}
                    </span>
                  </el-menu-item>
                </el-menu-item-group>
              </el-sub-menu>

              <template v-else-if="block.type === 'list'">
                <el-menu-item
                  v-for="(item, index) in block.items"
                  :key="`menu-block-list-${block.key}-${index}`"
                  class="menu-top-item menu-block-list-item"
                  :index="`menu-block-list-${block.key}-${index}`"
                  @click="handleSidebarMenuBlockItemClick(item)"
                >
                  <div class="relative menu-icon-wrap">
                    <img class="menu-image-icon" :src="item.icon" :alt="`${item.name} 图标`" />
                    <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
                  </div>
                  <span class="menu-text">{{ item.name }}</span>
                </el-menu-item>
              </template>

              <template v-else-if="block.type === 'image'">
                <el-menu-item
                  v-for="(item, index) in block.items"
                  :key="`menu-block-image-${block.key}-${index}`"
                  class="menu-top-item menu-block-image-item"
                  :index="`menu-block-image-${block.key}-${index}`"
                  @click="handleSidebarMenuBlockItemClick(item)"
                >
                  <div class="menu-block-image-thumb">
                    <img class="menu-block-image-thumb__img" :src="item.image" :alt="`${item.name} 预览图`" />
                  </div>
                  <span class="menu-block-image-title">{{ item.name }}</span>
                </el-menu-item>
              </template>
            </template>
          </template>

          <!-- 分类菜单（兼容旧配置） -->
          <template v-else>
            <template v-for="menu in displaySidebarCategoryMenus" :key="`category-${menu.key}`">
              <el-menu-item
                v-if="menu.isDirectLink"
                class="menu-top-item"
                :index="`category-link-${menu.key}`"
                @click="handleCategoryMenuClick(menu)"
              >
                <div class="relative menu-icon-wrap">
                  <img class="menu-image-icon" :src="menu.resolvedIcon" :alt="`${menu.title} 图标`" />
                  <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
                </div>
                <span class="menu-text">{{ menu.title }}</span>
              </el-menu-item>

              <el-sub-menu v-else :index="menu.key">
                <template #title>
                  <div class="relative menu-icon-wrap">
                    <img class="menu-image-icon" :src="menu.resolvedIcon" :alt="`${menu.title} 图标`" />
                    <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
                  </div>
                  <span class="menu-text">{{ menu.title }}</span>
                </template>
                <el-menu-item-group>
                  <el-menu-item
                    v-for="category in menu.list"
                    :key="category.id"
                    :index="`${menu.key}-${category.id}`"
                    @click="handleMenuClick(`${menu.key}-${category.id}`)"
                  >
                    {{ category.title }}
                  </el-menu-item>
                </el-menu-item-group>
              </el-sub-menu>
            </template>
          </template>
          <!-- 侧栏底部链接（后台可配置） -->
          <el-menu-item
            v-for="(item, index) in displaySidebarBottomLinks"
            :key="`${item.name}-${item.link}-${index}`"
            :index="`bottom-${index}`"
            @click="handleBottomLinkItemClick(item)"
          >
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="menu-text">{{ item.name }}</span>
          </el-menu-item>
        </template>

      </el-menu>
    </div>
  </el-scrollbar>
</template>

<style scoped>
/**
 * CSS 变量定义
 */
.el-menu {
  /* 布局变量 */
  --menu-item-height: 36px;
  /* 减小菜单项高度 */
  --menu-item-margin: 2px 0;
  /* 减小垂直间距 */
  --submenu-padding: 6px 0;
  /* 减小子菜单内边距 */
  --menu-border-radius: 0.75rem;
  --menu-icon-size: 18px;

  /* 颜色变量 */
  --menu-text-color: #333;
  --menu-hover-color: #fff;
  --menu-hover-bg: #6C54FF;
  --menu-active-bg: #6C54FF;
  --menu-dot-color: #6C54FF;

  /* 动画变量 */
  --menu-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --menu-hover-transform: translateX(4px);
  --icon-hover-transform: scale(1.15);

  /* 基础样式 */
  border: none !important;
  padding: 0 !important;
  margin-top: 0.5rem;
  background-color: transparent !important;
}

/* 图标基础样式 */
.menu-icon {
  width: var(--menu-icon-size);
  height: var(--menu-icon-size);
  color: var(--menu-text-color);
  transition: var(--menu-transition);
}

.menu-icon-wrap {
  width: var(--menu-icon-size);
  height: var(--menu-icon-size);
}

.menu-image-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: none;
  transition: var(--menu-transition);
}

.menu-text {
  margin-left: 14px;
}

/* 子菜单样式 */
.el-sub-menu {
  margin: 2px 0 !important;
  /* 减小子菜单组间距 */
  padding: var(--submenu-padding) !important;
}

/* 子菜单内容区域 */
.el-sub-menu :deep(.el-menu) {
  margin: 2px 0 0 4px !important;
  /* 减小子菜单和标题之间的间距 */
  padding: 2px 0 !important;
  /* 减小内边距 */
}

/* 子菜单标题 */
.el-sub-menu :deep(.el-sub-menu__title) {
  font-size: 0.95rem;
  font-weight: 500;
  height: var(--menu-item-height) !important;
  line-height: var(--menu-item-height) !important;
  margin: var(--menu-item-margin);
  padding: 0 20px !important;
  border-radius: var(--menu-border-radius);
  transition: var(--menu-transition);
  color: var(--menu-text-color);
}

/* 菜单项样式 */
.el-menu-item {
  font-size: 0.9rem;
  height: var(--menu-item-height) !important;
  line-height: var(--menu-item-height) !important;
  margin: var(--menu-item-margin);
  padding: 0 20px 0 40px !important;
  /* 增加左侧缩进 */
  border-radius: var(--menu-border-radius);
  transition: var(--menu-transition);
  color: var(--menu-text-color);
}

/* 顶级直达菜单（如 AI 工具箱聚合页） */
.menu-top-item {
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0 20px !important;
}

.menu-ai-toolbox-item {
  margin: 2px 0 !important;
}

.menu-ai-toolbox-first {
  margin-top: 2px !important;
}

.menu-block-list-item {
  margin: 2px 0 !important;
}

.menu-block-image-item {
  display: flex !important;
  align-items: center;
  gap: 10px;
  height: auto !important;
  min-height: var(--menu-item-height);
  line-height: 1.4 !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.menu-block-image-thumb {
  width: 36px;
  height: 24px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(108, 84, 255, 0.2);
  background: #fff;
  flex-shrink: 0;
}

.menu-block-image-thumb__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-block-image-title {
  margin-left: 0;
  font-size: 0.9rem;
}

.menu-category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.menu-category-item-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-category-item-meta {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
}

/* 菜单组标题 */
.el-menu-item-group :deep(.el-menu-item-group__title) {
  padding: 0 20px !important;
  height: 24px !important;
  /* 减小组标题高度 */
  line-height: 24px !important;
  font-size: 0.8rem;
  color: #666;
  opacity: 0.8;
}

/* 图标和文字间距 */
.menu-icon + .menu-text,
.menu-icon-wrap + .menu-text,
.el-sub-menu :deep(.el-sub-menu__title) .menu-text {
  margin-left: 14px !important;
}

.is-ai-toolbox-menu {
  --menu-item-height: 36px;
  --menu-item-margin: 2px 0;
}

/* 悬停和激活状态 */
.el-menu-item:hover,
.el-menu-item.is-active,
.el-sub-menu :deep(.el-sub-menu__title:hover) {
  color: var(--menu-hover-color);
  background-color: var(--menu-hover-bg);
  transform: var(--menu-hover-transform);
}

.el-menu-item:hover .menu-icon,
.el-menu-item.is-active .menu-icon,
.el-sub-menu :deep(.el-sub-menu__title:hover) .menu-icon {
  color: var(--menu-hover-color);
  transform: var(--icon-hover-transform);
}

.el-menu-item:hover .menu-image-icon,
.el-menu-item.is-active .menu-image-icon,
.el-sub-menu :deep(.el-sub-menu__title:hover) .menu-image-icon {
  filter: brightness(0) invert(1);
  transform: var(--icon-hover-transform);
}

/* 装饰点样式 */
.relative .absolute {
  width: 8px;
  height: 8px;
  background-color: var(--menu-dot-color);
  opacity: 0.4;
  transition: var(--menu-transition);
  right: -2px;
  bottom: -2px;
}

/* Logo区域样式优化 */
.logo-container {
  padding: 1.5rem 0;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* 滚动条容器样式 */
.el-scrollbar {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #fff;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

/* Logo 文字样式 */
.logo-text {
  font-size: 2.5rem;
  font-weight: 900;
  position: relative;
  color: var(--menu-hover-bg);
  letter-spacing: 2px;
  text-transform: uppercase;
  animation: stroke-animation 4s infinite;
}

@keyframes stroke-animation {
  0% {
    color: #6C54FF;
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }

  50% {
    color: #00CE3F;
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }

  100% {
    color: #6C54FF;
    text-shadow:
      -1px -1px 0 #fff,
      1px -1px 0 #fff,
      -1px 1px 0 #fff,
      1px 1px 0 #fff;
  }
}

/* 添加悬停效果 */
.logo-text:hover {
  animation: stroke-animation 2s infinite;
}

/* 移除之前的样式 */
.logo-text::after {
  display: none;
}

/* SVG Logo 动画样式 */
.logo-svg {
  margin: 0 auto;
}

.logo-wrapper :deep(.svg-elem) {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke-width: 1;
  fill: transparent;
  stroke: #fff;
  stroke-linejoin: round;
  stroke-linecap: round;
  animation: draw 2s linear forwards, fill-color 2s linear forwards;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1000;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fill-color {
  0% {
    fill: transparent;
  }

  100% {
    fill: #fff;
  }
}

#矩形 {
  fill: #6C54FF;
}

/* 新Logo样式 */
.logo-wrapper :deep(.svg-elem) {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke-width: 1;
  fill: transparent;
  stroke: #fff;
  stroke-linejoin: round;
  stroke-linecap: round;
  animation: draw 2s linear forwards, fill-color 2s linear forwards;
}

.logo-wrapper :deep(#background-rect) {
  fill: #6C54FF;
}

/* Tools 文字样式 */
.tools-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6C54FF;
  opacity: 0;
  animation: fade-in 0.3s ease-out 1s forwards;
  letter-spacing: 0.5px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Logo 容器样式 */
.logo-wrapper {
  background: #6C54FF;
  border-radius: 6px;
  padding: 1px;
  box-shadow: 0 4px 6px -1px rgba(108, 84, 255, 0.1), 0 2px 4px -1px rgba(108, 84, 255, 0.06);
  transition: all 0.3s ease;
  height: 32px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-wrapper:hover {
  box-shadow: 0 10px 15px -3px rgba(108, 84, 255, 0.2), 0 4px 6px -2px rgba(108, 84, 255, 0.1);
}

.logo-svg {
  transform: scale(1.1);
  margin: 0 auto;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.logo-inline-svg {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-inline-svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
