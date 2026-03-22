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
import type { ToolCategory, ToolSubCategory } from '@/types/tools'
import { getSitePublicConfig, type SiteLinkItem, type SiteSidebarCategoryMenu } from '@/services/siteConfig'

// 路由实例
const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

// 应用信息配置
const appName = ref('UIED-Tools')
const appNet = ref('免费在线工具集')
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
const defaultSidebarBottomLinks: SiteLinkItem[] = [
  { name: '更新记录', link: '/changelog' },
  { name: '意见反馈', link: 'https://uiedtool.com/' },
  { name: '关于我们', link: '/about' }
]
const sidebarCategoryMenus = ref<SiteSidebarCategoryMenu[]>(defaultSidebarCategoryMenus)
const sidebarBottomLinks = ref<SiteLinkItem[]>(defaultSidebarBottomLinks)

// 菜单状态配置
const defaultActive = ref('')
const defaultOpeneds: string[] = ['recommend'] // 默认展开推荐工具菜单

// store实例
const toolsStore = useToolsStore()

interface DisplaySidebarCategoryMenu extends SiteSidebarCategoryMenu {
  list: ToolSubCategory[]
  isDirectLink: boolean
  resolvedLink: string
}

/**
 * 函数说明：根据配置中的分类标题匹配工具分类列表，匹配不到时返回空数组
 */
const resolveCategoryList = (cateTitle: string): ToolSubCategory[] => {
  return toolsStore.cates.find((cate: ToolCategory) => cate.title === cateTitle)?.list || []
}

/**
 * 函数说明：解析分类菜单的直达链接，优先使用后台配置，AI工具箱默认跳聚合页
 */
const resolveCategoryDirectLink = (menu: SiteSidebarCategoryMenu): string => {
  const rawLink = String(menu.link || '').trim()
  if (rawLink) {
    return rawLink
  }
  if (menu.key === 'ai') {
    return '/tools/ai/toolbox'
  }
  return ''
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
        isDirectLink: Boolean(resolvedLink)
      }
    })
    .filter((menu) => menu.isDirectLink || menu.list.length > 0)
})

/**
 * 函数说明：获取最终用于渲染的侧栏底部链接列表，空配置时回退默认值
 */
const displaySidebarBottomLinks = computed<SiteLinkItem[]>(() => {
  return sidebarBottomLinks.value.length ? sidebarBottomLinks.value : defaultSidebarBottomLinks
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
  const siteConfig = await getSitePublicConfig()
  if (siteConfig.webName) {
    appName.value = siteConfig.webName
  }
  if (siteConfig.siteSlogan) {
    appNet.value = siteConfig.siteSlogan
  }
  if (siteConfig.sidebarRecommendTitle) {
    recommendTitle.value = siteConfig.sidebarRecommendTitle
  }
  if (siteConfig.sidebarRecommendLinks.length) {
    recommendLinks.value = siteConfig.sidebarRecommendLinks
  }
  if (siteConfig.sidebarCategoryMenus.length) {
    sidebarCategoryMenus.value = siteConfig.sidebarCategoryMenus
  }
  if (siteConfig.sidebarBottomLinks.length) {
    sidebarBottomLinks.value = siteConfig.sidebarBottomLinks
  }
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
const gotoAnchor = (id: string) => {
  // 如果当前路由不是首页，先跳转到首页
  if (route.path !== '/') {
    router.push('/')
  }

  // 等待 DOM 更新
  nextTick(() => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

/**
 * 工具页面跳转
 * @description 跳转到指定的工具页面
 * @param url 目标页面路由
 */
const gotoTool = (url: string) => {
  // 清除 URL 中的 value 参数
  if (route.query.value) {
    router.replace({ path: url, query: {} })
  } else {
    router.push(url)
  }
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
            <svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
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
      <el-menu class="w-[200px]" :default-active="defaultActive" :default-openeds="defaultOpeneds"
        background-color="transparent" @open="handleOpen" @close="handleClose">
        <!-- 推荐工具 -->
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
            <span class="ml-2">{{ recommendTitle }}</span>
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

        <!-- 分类菜单（后台可配置） -->
        <template v-for="menu in displaySidebarCategoryMenus" :key="`category-${menu.key}`">
          <el-menu-item
            v-if="menu.isDirectLink"
            class="menu-top-item"
            :index="`category-link-${menu.key}`"
            @click="handleCategoryMenuClick(menu)"
          >
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 5C4 3.89543 4.89543 3 6 3H10C11.1046 3 12 3.89543 12 5V9C12 10.1046 11.1046 11 10 11H6C4.89543 11 4 10.1046 4 9V5Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M12 15C12 13.8954 12.8954 13 14 13H18C19.1046 13 20 13.8954 20 15V19C20 20.1046 19.1046 21 18 21H14C12.8954 21 12 20.1046 12 19V15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M4 15C4 13.8954 4.89543 13 6 13H10C11.1046 13 12 13.8954 12 15V19C12 20.1046 11.1046 21 10 21H6C4.89543 21 4 20.1046 4 19V15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M12 5C12 3.89543 12.8954 3 14 3H18C19.1046 3 20 3.89543 20 5V9C20 10.1046 19.1046 11 18 11H14C12.8954 11 12 10.1046 12 9V5Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">{{ menu.title }}</span>
          </el-menu-item>

          <el-sub-menu v-else :index="menu.key">
            <template #title>
              <div class="relative">
                <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 5C4 3.89543 4.89543 3 6 3H10C11.1046 3 12 3.89543 12 5V9C12 10.1046 11.1046 11 10 11H6C4.89543 11 4 10.1046 4 9V5Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M12 15C12 13.8954 12.8954 13 14 13H18C19.1046 13 20 13.8954 20 15V19C20 20.1046 19.1046 21 18 21H14C12.8954 21 12 20.1046 12 19V15Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M4 15C4 13.8954 4.89543 13 6 13H10C11.1046 13 12 13.8954 12 15V19C12 20.1046 11.1046 21 10 21H6C4.89543 21 4 20.1046 4 19V15Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M12 5C12 3.89543 12.8954 3 14 3H18C19.1046 3 20 3.89543 20 5V9C20 10.1046 19.1046 11 18 11H14C12.8954 11 12 10.1046 12 9V5Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
              </div>
              <span class="ml-2">{{ menu.title }}</span>
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
          <span class="ml-2">{{ item.name }}</span>
        </el-menu-item>

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
.menu-icon+span,
.el-sub-menu :deep(.el-sub-menu__title) span {
  margin-left: 14px !important;
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

.svg-elem {
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
.svg-elem {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke-width: 1;
  fill: transparent;
  stroke: #fff;
  stroke-linejoin: round;
  stroke-linecap: round;
  animation: draw 2s linear forwards, fill-color 2s linear forwards;
}

#background-rect {
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
</style>
