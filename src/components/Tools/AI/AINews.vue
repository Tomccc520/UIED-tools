<!--
* @file AINews.vue
* @description AI实时快讯页面，展示最新科技资讯
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @author UIED技术团队
* @createDate 2024-03-20
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { rssNewsService, type NewsItem, NEWS_CATEGORIES, type NewsCategory } from '@/services/rss-news'

const loading = ref(false)
const newsList = ref<NewsItem[]>([])
const lastUpdate = ref(dayjs().format('HH:mm'))
const currentCategory = ref<NewsCategory>('全部')
const lastError = ref<string | null>(null)
const refreshing = ref(false)

// 获取新闻数据
const fetchNews = async (forceRefresh = false) => {
  if (loading.value && !forceRefresh) return

  loading.value = true
  lastError.value = null

  try {
    refreshing.value = true
    const category = currentCategory.value === '全部' ? undefined : currentCategory.value
    const newsPromise = rssNewsService.getNews(category, 1, 50, forceRefresh)

    // 添加超时处理
    const result = await Promise.race([
      newsPromise,
      new Promise<NewsItem[]>((_, reject) => {
        setTimeout(() => reject(new Error('请求超时，请检查网络连接')), 30000)
      })
    ])

    if (result.length > 0) {
      newsList.value = result
      lastUpdate.value = dayjs().format('HH:mm')
      lastError.value = null
    } else {
      throw new Error('暂无新闻数据，请稍后重试')
    }
  } catch (error: any) {
    // 生产环境下不打印错误详情
    if (import.meta.env.DEV) {
      console.error('获取新闻失败:', error)
    }

    lastError.value = error.message
    ElMessage.error({
      message: error instanceof Error && error.message === '请求超时'
        ? '网络请求超时，请检查网络连接'
        : `获取新闻失败: ${error.message || '未知错误'}`,
      duration: 5000,
      showClose: true
    })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 切换分类
const handleCategoryChange = (category: NewsCategory) => {
  if (currentCategory.value === category) return
  currentCategory.value = category
  newsList.value = []
  fetchNews()
}

// 处理图片加载失败
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  const container = img.parentElement;

  // 如果已经是默认图片，则隐藏图片容器
  if (img.src.includes('data:image/svg+xml;base64')) {
    if (container) {
      container.style.display = 'none';
    }
    return;
  }

  // 使用更美观的占位图
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MzE4RkY7c3RvcC1vcGFjaXR5OjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzlGNTNGRjtzdG9wLW9wYWNpdHk6MC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxMjgiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzQzMThGRiI+5Zu+54mH5peg5rOV5pi+56S6PC90ZXh0Pjwvc3ZnPg==';
  img.onerror = null; // 防止循环加载
};

// 添加结构化数据
const addStructuredData = () => {
  // 移除旧的结构化数据
  const existingStructuredData = document.querySelector('script[type="application/ld+json"]')
  if (existingStructuredData) {
    existingStructuredData.remove()
  }

  // 生成新闻列表结构化数据
  const newsItems = newsList.value.map((news, index) => ({
    "@type": "NewsArticle",
    "position": index + 1,
    "name": news.title,
    "description": news.description || "",
    "datePublished": new Date(news.date).toISOString(),
    "url": news.url,
    "publisher": {
      "@type": "Organization",
      "name": news.source
    }
  }))

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI科技快讯",
    "description": "精选全球AI技术创新、产品发布、行业动态",
    "publisher": {
      "@type": "Organization",
      "name": "UIED技术团队",
      "url": "https://fsuied.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": newsItems,
      "numberOfItems": newsItems.length,
      "dateModified": new Date().toISOString()
    }
  }

  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.text = JSON.stringify(structuredData)
  document.head.appendChild(script)
}

// 在新闻列表更新时更新结构化数据
watch(newsList, () => {
  if (newsList.value.length > 0) {
    addStructuredData()
  }
})

// 组件卸载时清理结构化数据
onUnmounted(() => {
  const structuredData = document.querySelector('script[type="application/ld+json"]')
  if (structuredData) {
    structuredData.remove()
  }
})

// 添加已读状态记录
const readNews = ref<Set<string>>(new Set())
const isLoadingMore = ref(false)

const markAsRead = (newsId: string) => {
  readNews.value.add(newsId)
  try {
    localStorage.setItem('readNews', JSON.stringify([...readNews.value]))
  } catch (e) {
    console.warn('Failed to save read status:', e)
  }
}

// 添加无限滚动
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement
  if (isLoadingMore.value) return

  if (target.scrollHeight - target.scrollTop < target.clientHeight + 100) {
    isLoadingMore.value = true
    try {
      // 加载更多逻辑
      await fetchNews()
    } finally {
      isLoadingMore.value = false
    }
  }
}

// 优化错误处理
const showError = (error: Error) => {
  lastError.value = error.message
  ElMessage({
    type: 'error',
    message: error.message,
    duration: 5000,
    showClose: true
  })
}

// 组件挂载时初始化
onMounted(async () => {
  // 初始化已读状态
  try {
    const savedReadNews = localStorage.getItem('readNews')
    if (savedReadNews) {
      readNews.value = new Set(JSON.parse(savedReadNews))
    }
  } catch (e) {
    console.warn('Failed to load read status:', e)
  }

  // 获取新闻数据
  await fetchNews()
})
</script>

<template>
  <div class="h-full">
    <!-- SEO优化 -->
    <div v-once class="hidden">
      <h1>AI科技快讯 - 实时掌握AI发展动态</h1>
      <meta name="description" content="精选全球AI技术创新、产品发布、行业动态，涵盖36氪、IT之家、少数派、机器之心等权威媒体的最新AI资讯。">
      <meta name="keywords" content="AI新闻,科技快讯,人工智能,技术创新,AI发展,科技资讯">
    </div>

    <!-- 内容区域 -->
    <div class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full relative">
      <!-- 渐变装饰背景 - 只在头部 -->
      <div
        class="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#4318FF]/5 via-[#9F53FF]/3 to-transparent pointer-events-none">
      </div>

      <!-- 头部区域 -->
      <div class="px-4 sm:px-8 pt-4 sm:pt-8 pb-2 sm:pb-6 flex-shrink-0 border-b border-gray-50/80 relative">
        <!-- 移动端头部 -->
        <div class="sm:hidden">
          <div class="flex items-center justify-between">
            <div class="text-lg font-medium text-gray-900">今日快讯</div>
            <div class="text-sm text-gray-500">更新于 {{ lastUpdate }}</div>
          </div>
          <!-- 移动端分类选择器 -->
          <div class="mt-3 -mx-4 px-4">
            <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div v-for="category in NEWS_CATEGORIES" :key="category" @click="handleCategoryChange(category)"
                class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap"
                :class="[
                  currentCategory === category
                    ? 'bg-[#4318FF] text-white'
                    : 'bg-gray-100 text-gray-600'
                ]">
                {{ category }}
              </div>
            </div>
          </div>
        </div>

        <!-- PC端头部 -->
        <div class="hidden sm:block">
          <!-- 原有的PC端头部内容 -->
          <div class="flex items-center justify-between mb-4">
            <div class="relative">
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <div class="flex items-center relative">
                  <span
                    class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#4318FF] to-[#9F53FF] bg-clip-text text-transparent relative z-10">
                    News
                  </span>
                  <span class="text-2xl sm:text-3xl font-bold text-gray-800 ml-2 relative z-10">实时快讯</span>
                  <!-- 装饰圆点 -->
                  <div
                    class="absolute -left-3 -top-3 w-12 h-12 bg-gradient-to-r from-[#4318FF]/10 to-[#9F53FF]/10 rounded-full blur-lg">
                  </div>
                </div>
                <div class="flex items-center gap-2 ml-0 sm:ml-3 mt-2 sm:mt-0 flex-wrap">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECE8FF] text-[#4318FF] shadow-sm">
                    <span class="w-1 h-1 bg-[#4318FF] rounded-full mr-1 animate-pulse"></span>
                    实时更新
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#4318FF] to-[#9F53FF] text-white shadow-sm">
                    AI 领域
                  </span>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-[#4318FF] to-[#9F53FF] text-white shadow-sm">
                    科技领域
                  </span>
                </div>
              </div>
              <p class="text-gray-500 text-xs sm:text-sm relative z-10">精选全球AI技术创新、产品发布、行业动态，实时掌握AI发展脉搏</p>
            </div>
          </div>
          <!-- 原有的PC端分类选择器 -->
          <div class="flex items-center gap-2 mt-4 overflow-x-auto pb-2 relative scrollbar-hide">
            <div v-for="category in NEWS_CATEGORIES" :key="category" @click="handleCategoryChange(category)"
              class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-200 whitespace-nowrap hover:shadow-md"
              :class="[
                currentCategory === category
                  ? 'bg-gradient-to-r from-[#4318FF] to-[#9F53FF] text-white shadow-sm hover:shadow-[#4318FF]/20'
                  : 'bg-white/80 text-gray-600 hover:bg-gray-50 border border-gray-100/80 backdrop-blur-sm'
              ]">
              {{ category }}
            </div>
          </div>
        </div>
      </div>

      <!-- 新闻列表 -->
      <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-auto px-4 sm:px-8">
          <div v-if="loading" class="py-8 sm:py-16">
            <div v-for="i in 3" :key="i" class="mb-8 animate-pulse">
              <div class="flex items-start gap-4">
                <div class="w-24 h-8 bg-gray-200 rounded"></div>
                <div class="flex-1">
                  <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
          <template v-else>
            <!-- 移动端新闻列表 -->
            <div class="sm:hidden divide-y divide-gray-100">
              <div v-for="(news, index) in newsList" :key="index" class="py-3">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-14 pt-1">
                    <div class="text-sm font-medium text-[#4318FF]">{{ news.time }}</div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <a :href="news.url" target="_blank" rel="nofollow noopener" class="block">
                      <div class="flex items-start gap-3">
                        <div class="flex-1 min-w-0">
                          <h3 class="text-[15px] leading-[1.4] text-gray-900 line-clamp-2 mb-1.5">{{ news.title }}</h3>
                          <div class="flex items-center">
                            <span class="text-xs text-gray-400">{{ news.source }}</span>
                          </div>
                        </div>
                        <div v-if="news.cover" class="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-gray-100">
                          <img :src="news.cover" :alt="news.title" @error="handleImageError" loading="lazy"
                            class="w-full h-full object-cover" referrerpolicy="no-referrer" crossorigin="anonymous">
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- PC端新闻列表 -->
            <div class="hidden sm:block divide-y divide-gray-50" @scroll="handleScroll">
              <div v-for="(news, index) in newsList" :key="news.url + index"
                class="group hover:bg-gray-50/50 transition-all duration-200 relative" @click="markAsRead(news.url)">
                <!-- 添加已读标记 -->
                <div v-if="readNews.has(news.url)" class="absolute right-2 top-2 text-xs text-gray-400">
                  已读
                </div>
                <!-- 日期分割线 - 重新设计 -->
                <div
                  v-if="index === 0 || dayjs(news.date).format('YYYY-MM-DD') !== dayjs(newsList[index - 1].date).format('YYYY-MM-DD')"
                  class="sticky top-0 z-10 -mx-8 px-8 py-3 backdrop-blur-sm border-b border-gray-100/80 relative">
                  <div class="absolute inset-0 bg-gradient-to-r from-[#4318FF]/3 to-transparent opacity-30"></div>
                  <div class="flex items-center justify-between relative z-10">
                    <div class="flex items-center gap-2">
                      <div class="w-1 h-5 bg-gradient-to-b from-[#4318FF] to-[#9F53FF] rounded-sm shadow-sm"></div>
                      <div class="flex items-center">
                        <template v-if="dayjs(news.date).isSame(dayjs(), 'day')">
                          <span class="text-base font-medium text-[#4318FF]">今日快讯</span>
                          <span class="ml-2 text-sm text-gray-400">{{ dayjs(news.date).format('MM月DD日') }}</span>
                        </template>
                        <template v-else>
                          <span class="text-base font-medium text-gray-900">{{ dayjs(news.date).format('MM月DD日')
                          }}</span>
                          <span class="ml-2 text-sm text-gray-400">{{ dayjs(news.date).format('dddd') }}</span>
                        </template>
                      </div>
                    </div>

                    <!-- 将时间显示移到这里 -->
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-gray-500">更新于</span>
                      <span class="text-base font-medium text-gray-800">{{ lastUpdate }}</span>
                    </div>
                  </div>
                </div>

                <!-- 时间线设计 -->
                <div class="py-6 sm:py-8 px-2 relative group">
                  <!-- PC端时间线 -->
                  <div
                    class="hidden sm:block absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#4318FF]/10 to-[#9F53FF]/10 group-hover:from-[#4318FF]/20 group-hover:to-[#9F53FF]/20 transition-colors duration-300">
                    <div
                      class="absolute left-[-4px] top-[40px] w-[10px] h-[10px] rounded-full border-2 border-[#4318FF] bg-white group-hover:scale-110 transition-transform duration-300">
                    </div>
                  </div>

                  <!-- 移动端布局 -->
                  <div class="sm:hidden flex items-start gap-4">
                    <div class="flex-shrink-0 w-12">
                      <div class="text-sm text-[#4318FF] font-medium">{{ news.time }}</div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <a :href="news.url" target="_blank" rel="nofollow noopener" class="block">
                        <div class="flex items-start gap-3">
                          <div class="flex-1 min-w-0">
                            <h3 class="text-sm text-gray-900 leading-normal line-clamp-2">{{ news.title }}</h3>
                            <div class="mt-1">
                              <span class="text-xs text-gray-400">{{ news.source }}</span>
                            </div>
                          </div>
                          <div v-if="news.cover" class="flex-shrink-0 w-20 h-20 overflow-hidden rounded-lg bg-gray-100">
                            <img :src="news.cover" :alt="news.title" @error="handleImageError" loading="lazy"
                              class="w-full h-full object-cover" referrerpolicy="no-referrer" crossorigin="anonymous">
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  <!-- PC端布局 -->
                  <div class="hidden sm:flex sm:flex-row sm:items-start gap-4 sm:gap-8 pl-8">
                    <!-- 原有的PC端时间显示 -->
                    <div class="flex-shrink-0 sm:w-24 order-2 sm:order-1">
                      <div class="text-center py-1 sm:py-2 px-2 sm:px-4 bg-gradient-to-r from-[#4318FF]/10 to-[#9F53FF]/10 text-[#4318FF] text-xs sm:text-sm font-medium
                        rounded-lg shadow-sm relative overflow-hidden group-hover:from-[#4318FF] group-hover:to-[#9F53FF] group-hover:text-white
                        transition-all duration-300">
                        <div class="relative z-10">{{ news.time }}</div>
                      </div>
                    </div>

                    <!-- 原有的PC端新闻内容 -->
                    <div class="flex-1 order-1 sm:order-2">
                      <a :href="news.url" target="_blank" rel="nofollow noopener" class="block group">
                        <div class="flex gap-8">
                          <div class="flex-1">
                            <h3
                              class="text-gray-900 text-lg font-medium leading-relaxed mb-3 group-hover:text-[#4318FF] transition-all duration-300">
                              {{ news.title }}
                            </h3>
                            <p v-if="news.description"
                              class="text-gray-500 text-sm mt-2 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                              {{ news.description }}
                            </p>
                            <div class="flex items-center gap-3 mt-3">
                              <span
                                class="text-sm text-gray-400 flex items-center gap-1 group-hover:text-[#4318FF]/70 transition-colors duration-300">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 6h14v2H5V6zm0 4h3v2H5v-2zm0 4h3v2H5v-2zm14 4H5v-2h14v2zm0-4h-8v-2h8v2zm0-4h-8V8h8v2z"
                                    fill="currentColor" />
                                </svg>
                                来源：{{ news.source }}
                              </span>
                            </div>
                          </div>
                          <div v-if="news.cover"
                            class="flex-shrink-0 w-48 h-32 overflow-hidden rounded-xl shadow-sm bg-gradient-to-r from-[#4318FF]/5 to-[#9F53FF]/5 relative group">
                            <div
                              class="absolute inset-0 bg-gradient-to-br from-[#4318FF]/10 to-[#9F53FF]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                            </div>
                            <img :src="news.cover" :alt="news.title" @error="handleImageError" loading="lazy"
                              class="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500 ease-out relative z-0"
                              referrerpolicy="no-referrer" crossorigin="anonymous">
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 加载更多提示 -->
            <div v-if="isLoadingMore" class="py-4 text-center text-gray-500">
              <div class="loading-circle mx-auto"></div>
              <div class="mt-2">加载更多...</div>
            </div>
          </template>

          <!-- 添加错误提示 -->
          <div v-if="lastError" class="mt-4 p-4 bg-red-50 rounded-lg">
            <div class="flex items-center">
              <svg class="w-5 h-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <span class="text-red-700">{{ lastError }}</span>
            </div>
            <button @click="fetchNews(true)" class="mt-2 text-red-600 hover:text-red-800 text-sm font-medium">
              点击重试
            </button>
          </div>

          <!-- 空状态 -->
          <div v-if="!loading && newsList.length === 0" class="py-8 sm:py-16">
            <div class="text-center">
              <div
                class="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-[#4318FF]/10 to-[#9F53FF]/10 flex items-center justify-center relative group">
                <div
                  class="absolute inset-0 rounded-full bg-gradient-to-br from-[#4318FF]/5 to-[#9F53FF]/5 blur-lg group-hover:blur-xl transition-all duration-500">
                </div>
                <svg
                  class="h-12 w-12 text-[#4318FF] relative z-10 transform group-hover:scale-110 transition-transform duration-500"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 class="mt-4 text-lg font-medium text-gray-900">暂无相关资讯</h3>
              <p class="mt-2 text-sm text-gray-500">请稍后刷新重试</p>
              <div class="mt-6">
                <button @click="fetchNews(true)" type="button"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-[#4318FF] to-[#9F53FF] hover:from-[#3311DD] hover:to-[#8E42EE] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4318FF] shadow-sm hover:shadow-lg hover:shadow-[#4318FF]/20">
                  <svg class="-ml-1 mr-3 h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clip-rule="evenodd" />
                  </svg>
                  重新加载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.border-3 {
  border-width: 3px;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  position: relative;
  background: linear-gradient(to right, #4318FF, #9F53FF);
  animation: rotate 1s linear infinite;
}

.loading-circle::after {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: white;
}

.loading-text {
  color: #4318FF;
  font-size: 0.875rem;
  font-weight: 500;
  background: linear-gradient(to right, #4318FF, #9F53FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 隐藏滚动条但保持功能 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 添加时间线相关样式 */
.timeline-dot {
  position: absolute;
  left: -4px;
  top: 40px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #4318FF;
  background-color: white;
  z-index: 1;
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, rgba(67, 24, 255, 0.1), rgba(159, 83, 255, 0.1));
}

/* 移动端优化样式 */
@media (max-width: 640px) {
  .scrollbar-hide {
    -webkit-overflow-scrolling: touch;
  }

  /* 移动端新闻列表基础样式 */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }

  /* 移动端分类选择器样式 */
  .category-scroll {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }

  .category-item {
    scroll-snap-align: start;
  }

  /* 移动端新闻项样式 */
  .news-item {
    padding: 12px 0;
    display: flex;
    gap: 12px;
  }

  /* 移动端标题样式 */
  .news-title {
    font-size: 15px;
    line-height: 1.4;
    color: #333;
    margin-right: 12px;
  }

  /* 移动端来源样式 */
  .news-source {
    font-size: 12px;
    color: #999;
  }

  /* 移动端图片样式 */
  .news-image {
    border-radius: 8px;
    background-color: #f5f5f5;
    width: 120px;
    height: 120px;
  }

  /* 移动端头部样式 */
  .mobile-header {
    padding: 12px 16px;
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }
}

/* 添加响应式间距类 */
.gap-responsive {
  gap: 0.5rem;
}

@media (min-width: 640px) {
  .gap-responsive {
    gap: 1rem;
  }
}

/* 优化移动端触摸体验 */
@media (hover: none) {
  .hover\:shadow-md:hover {
    box-shadow: none;
  }

  .group-hover\:scale-105:hover {
    transform: none;
  }
}

/* 优化滚动性能 */
.news-list {
  will-change: transform;
  contain: content;
  content-visibility: auto;
}

/* 优化动画性能 */
.group {
  will-change: opacity, transform;
  backface-visibility: hidden;
}

/* 优化骨架屏动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

.animate-pulse {
  background: linear-gradient(90deg,
      rgba(156, 163, 175, 0.1) 25%,
      rgba(156, 163, 175, 0.2) 37%,
      rgba(156, 163, 175, 0.1) 63%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

/* 优化图片加载 */
img {
  content-visibility: auto;
}

/* 优化滚动条样式 */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(67, 24, 255, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(67, 24, 255, 0.3);
  border-radius: 3px;
}

/* 优化移动端触摸体验 */
@media (hover: none) {
  .news-list {
    -webkit-overflow-scrolling: touch;
  }
}

/* 减少重绘区域 */
.news-item {
  transform: translateZ(0);
}
</style>
