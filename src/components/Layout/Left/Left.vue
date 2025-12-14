<!--
* @file Left.vue
* @description 左侧菜单组件，提供工具分类导航和快速访问功能
* @author UIED技术团队
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
import { ref, onMounted, nextTick } from '@vue/runtime-core'
import { useToolsStore } from '@/store/modules/tools'
import { useRouter, useRoute } from 'vue-router'
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Category {
  id: number
  title: string
  icon?: string
  list: Array<{
    id: number
    title: string
    url?: string
    cateId?: number
    cate?: string
    list?: Array<any> // Allow nested list for tool categories
  }>
}

interface ToolCategory {
  id: number
  title: string
  list: Array<{
    id: number
    title: string
    url: string
  }>
}

// 路由实例
const router: Router = useRouter()
const route: RouteLocationNormalizedLoaded = useRoute()

// 应用信息配置
const appName = ref('UIED-Tools')
const appNet = ref('免费在线工具集')

// 菜单状态配置
const defaultActive = ref('')
const defaultOpeneds: string[] = ['recommend'] // 默认展开推荐工具菜单

// store实例
const toolsStore = useToolsStore()

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
 * 关于页面跳转
 * @description 跳转到关于页面
 */
const gotoAbout = () => {
  router.push('about')
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
  getToolCates()
  toolsStore.getRecommends()  // 获取推荐工具数据
})
</script>

<template>
  <el-scrollbar class="h-screen flex flex-col">
    <!-- Logo区域 -->
    <div class="flex justify-center py-6">
      <router-link class="logo-container group" to="/">
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
          <div class="tools-text font-bold ml-2">Tools</div>
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
            <span class="ml-2">推荐工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="recommend-hot" @click="handleMenuClick('recommend-hot')">热门工具</el-menu-item>
            <el-menu-item index="recommend-random" @click="handleMenuClick('recommend-random')">随机推荐</el-menu-item>
            <el-menu-item index="recommend-hot-ranking"
              @click="handleMenuClick('recommend-hot-ranking')">每日热榜</el-menu-item>
            <el-menu-item index="recommend-daily-article"
              @click="openExternalLink('https://hot.uied.cn/')">每日文章</el-menu-item>
            <el-menu-item index="recommend-ai-news" @click="gotoTool('/tools/ai-news')">实时资讯</el-menu-item>
            <el-menu-item index="recommend-ai-ranking" @click="gotoTool('/tools/ai-ranking')">AI产品榜</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- AI工具箱 -->
        <el-sub-menu index="ai">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M5 3a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2 1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M19 3a2 2 0 0 1 2 2v2c0 1.1-.9 2-2 2-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M5 15a2 2 0 0 0-2 2v2c0 1.1.9 2 2 2 1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M19 15a2 2 0 0 1 2 2v2c0 1.1-.9 2-2 2-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2z" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">AI工具箱</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === 'AI工具箱')?.list"
              :key="category.id" :index="`ai-${category.id}`" @click="handleMenuClick(`ai-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 设计工具菜单 -->
        <el-sub-menu index="design">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M2 2l7.586 7.586" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <circle cx="11" cy="11" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">设计工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '设计工具')?.list"
              :key="category.id" :index="`design-${category.id}`" @click="handleMenuClick(`design-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 图片处理菜单 -->
        <el-sub-menu index="image">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">图片处理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '图片处理')?.list"
              :key="category.id" :index="`image-${category.id}`" @click="handleMenuClick(`image-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 办公工具菜单 -->
        <el-sub-menu index="office">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8.342C20 8.07556 19.9467 7.81181 19.8433 7.56624C19.7399 7.32068 19.5885 7.09824 19.398 6.912L14.958 2.57C14.5844 2.20466 14.0826 2 13.56 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M8 13H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M8 17H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">办公工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '办公工具')?.list"
              :key="category.id" :index="`office-${category.id}`" @click="handleMenuClick(`office-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 生活常用菜单 -->
        <el-sub-menu index="daily">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M2 12h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">生活常用</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '生活常用')?.list"
              :key="category.id" :index="`daily-${category.id}`" @click="handleMenuClick(`daily-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 文案工具 -->
        <el-sub-menu index="copywriting">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 5L19 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">文案工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '文案工具')?.list"
              :key="category.id" :index="`copywriting-${category.id}`"
              @click="handleMenuClick(`copywriting-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 潜能测试菜单 -->
        <el-sub-menu index="psychology">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">潜能测试</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '潜能测试')?.list"
              :key="category.id" :index="`psychology-${category.id}`"
              @click="handleMenuClick(`psychology-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 剪辑工具菜单 -->
        <el-sub-menu index="video">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">剪辑工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '剪辑工具')?.list"
              :key="category.id" :index="`video-${category.id}`" @click="handleMenuClick(`video-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 开发工具菜单 -->
        <el-sub-menu index="dev">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 3H7C5.89543 3 5 3.89543 5 5V7C5 8.10457 5.89543 9 7 9H8C9.10457 9 10 8.10457 10 7V5C10 3.89543 9.10457 3 8 3Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M17 3H16C14.8954 3 14 3.89543 14 5V7C14 8.10457 14.8954 9 16 9H17C18.1046 9 19 8.10457 19 7V5C19 3.89543 18.1046 3 17 3Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M8 15H7C5.89543 15 5 15.8954 5 17V19C5 20.1046 5.89543 21 7 21H8C9.10457 21 10 20.1046 10 19V17C10 15.8954 9.10457 15 8 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M17 15H16C14.8954 15 14 15.8954 14 17V19C14 20.1046 14.8954 21 16 21H17C18.1046 21 19 20.1046 19 19V17C19 15.8954 18.1046 15 17 15Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">开发工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '开发工具')?.list"
              :key="category.id" :index="`dev-${category.id}`" @click="handleMenuClick(`dev-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 摸鱼工具菜单 -->
        <el-sub-menu index="slacking">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8c4-2 7-2 10 0s6 2 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 16c4-2 7-2 10 0s6 2 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M3 12c4-2 7-2 10 0s6 2 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <circle cx="16" cy="9" r="1" fill="currentColor" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">摸鱼工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '摸鱼工具')?.list"
              :key="category.id" :index="`slacking-${category.id}`" @click="handleMenuClick(`slacking-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <!-- 效率工具菜单 -->
        <el-sub-menu index="efficiency">
          <template #title>
            <div class="relative">
              <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
            </div>
            <span class="ml-2">效率工具</span>
          </template>
          <el-menu-item-group>
            <el-menu-item v-for="category in toolsStore.cates.find((cate: Category) => cate.title === '效率工具')?.list"
              :key="category.id" :index="`efficiency-${category.id}`"
              @click="handleMenuClick(`efficiency-${category.id}`)">
              {{ category.title }}
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>



        <!-- 更新记录 -->
        <el-menu-item index="changelog" @click="handleMenuClick('changelog')">
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
          <span class="ml-2">更新记录</span>
        </el-menu-item>

        <!-- Bug反馈 -->
        <el-menu-item index="bug-report" @click="openExternalLink('https://www.uied.cn/circle/uiedtool')">
          <div class="relative">
            <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
          </div>
          <span class="ml-2">Bug反馈</span>
        </el-menu-item>

        <!-- 关于我们 -->
        <el-menu-item index="about" @click="gotoAbout">
          <div class="relative">
            <svg class="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 16V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            <div class="absolute w-2.5 h-2.5 bg-[#6C54FF] rounded-full opacity-40 -bottom-1 -right-1"></div>
          </div>
          <span class="ml-2">关于我们</span>
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
