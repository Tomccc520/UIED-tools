/**
* @file HotSearch.vue
* @description 热榜组件，展示UIED网站的热门文章、圈子、DeepSeek教程和AIGC学习内容
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @author UIED技术团队
* @createDate 2025-01-05
*/

<template>
  <div class="hot-search-container">
    <div class="hot-search-wrapper">
      <div class="hot-search-header">
        <div class="header-left">
          <img src="@/assets/hot.svg" alt="hot" class="header-icon">
          <span class="header-title">今日热榜</span>
          <span class="header-subtitle">汇聚每日热点，热门尽览无余</span>
        </div>
        <div class="header-right">
          <router-link to="/tools/hot-ranking" class="view-all-btn">
            <span>查看全部</span>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </router-link>
          <span class="header-time">{{ currentTime }}</span>
          <div class="header-actions">
            <el-icon :class="['action-icon', { refreshing: isRefreshing }]" @click="refreshList">
              <Refresh />
            </el-icon>
          </div>
        </div>
      </div>
      <div class="hot-search-content">
        <!-- UIED热榜 -->
        <div class="hot-list-section">
          <div class="section-header">
            <div class="platform-info">
              <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
              <span class="platform-name">每日学习</span>
            </div>
          </div>
          <div id="learn_hot" class="hot-list-container">
            <div v-if="loading" class="loading-container">
              <div class="skeleton-list">
                <div v-for="i in 10" :key="i" class="skeleton-item">
                  <div class="skeleton-index" :class="i <= 3 ? `skeleton-index-${i}` : ''"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-hot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- UIED圈子热榜 -->
        <div class="hot-list-section">
          <div class="section-header">
            <div class="platform-info">
              <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
              <span class="platform-name">累了摸鱼</span>
            </div>
          </div>
          <div id="relax_hot" class="hot-list-container">
            <div v-if="loading" class="loading-container">
              <div class="skeleton-list">
                <div v-for="i in 10" :key="i" class="skeleton-item">
                  <div class="skeleton-index" :class="i <= 3 ? `skeleton-index-${i}` : ''"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-hot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 字体素材热榜 -->
        <div class="hot-list-section">
          <div class="section-header">
            <div class="platform-info">
              <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
              <span class="platform-name">DeepSeek教程</span>
              <span class="platform-type">最近爆火</span>
            </div>
          </div>
          <div id="font_hot" class="hot-list-container">
            <div v-if="loading" class="loading-container">
              <div class="skeleton-list">
                <div v-for="i in 10" :key="i" class="skeleton-item">
                  <div class="skeleton-index" :class="i <= 3 ? `skeleton-index-${i}` : ''"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-hot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AIGC学习文章热榜 -->
        <div class="hot-list-section">
          <div class="section-header">
            <div class="platform-info">
              <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
              <span class="platform-name">AIGC学习</span>
            </div>
          </div>
          <div id="aigc_hot" class="hot-list-container">
            <div v-if="loading" class="loading-container">
              <div class="skeleton-list">
                <div v-for="i in 10" :key="i" class="skeleton-item">
                  <div class="skeleton-index" :class="i <= 3 ? `skeleton-index-${i}` : ''"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-hot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from '@vue/runtime-core'
import { Refresh, ArrowRight } from '@element-plus/icons-vue'
import '@/assets/io-hot.css'

const loading = ref(false)
const currentTime = ref('')
const isRefreshing = ref(false)
const lastRefreshTime = ref(0)       // 添加上次刷新时间记录

// 缓存相关
const CACHE_KEY = 'hot_search_cache'
const CACHE_EXPIRY = 10 * 60 * 1000  // 增加到10分钟缓存
const REFRESH_COOLDOWN = 30 * 1000    // 30秒刷新冷却时间

// 获取缓存数据
const getCache = () => {
  try {
    const cache = localStorage.getItem(CACHE_KEY)
    if (cache) {
      const { data, timestamp } = JSON.parse(cache)
      const remainingTime = CACHE_EXPIRY - (Date.now() - timestamp)
      // 检查缓存是否在有效期内
      if (remainingTime > 0) {
        console.log('使用缓存数据，剩余有效期：', Math.floor(remainingTime / 1000), '秒')
        return data
      } else {
        console.log('缓存已过期，重新获取数据')
        localStorage.removeItem(CACHE_KEY)
      }
    }
  } catch (error) {
    console.error('读取缓存失败')
    localStorage.removeItem(CACHE_KEY)
  }
  return null
}

// 设置缓存数据
const setCache = (data: any) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
    console.log('数据已缓存，将在10分钟后过期')
  } catch (error) {
    console.error('写入缓存失败:', error)
  }
}

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 类型定义
interface Article {
  title: string;
  url: string;
  date: string;
}

interface RequestParams {
  [key: string]: string | undefined;  // 添加索引签名
  _fields: string;
  per_page: string;
  orderby: string;
  order: string;
  categories_exclude?: string;
  categories?: string;
  tags?: string;
}

interface RequestConfig {
  url: string;
  params: RequestParams;
  key: string;
  render: (articles: Article[]) => void;
}

// 渲染函数
const renderArticles = (articles: Article[]): void => {
  const container = document.getElementById('learn_hot')
  if (!container) {
    console.warn('找不到容器: learn_hot')
    return
  }

  const html = `
    <div class="io-hot-list">
      ${articles.map((item, index) => `
        <a class="io-hot-item" href="${item.url}" target="_blank">
          <div class="io-hot-index${index < 3 ? ` io-hot-index-${index + 1}` : ''}">${index + 1}</div>
          <span class="io-hot-title">${item.title}</span>
          <span class="io-hot-num">${Math.floor(Math.random() * 5000 + 1000)}</span>
        </a>
      `).join('')}
    </div>
  `
  container.innerHTML = html
}

const renderCircle = (articles: Article[]): void => {
  const container = document.getElementById('relax_hot')
  if (!container) {
    console.warn('找不到容器: relax_hot')
    return
  }

  const html = `
    <div class="io-hot-list">
      ${articles.map((item, index) => `
        <a class="io-hot-item" href="${item.url}" target="_blank">
          <div class="io-hot-index${index < 3 ? ` io-hot-index-${index + 1}` : ''}">${index + 1}</div>
          <span class="io-hot-title">${item.title}</span>
          <span class="io-hot-num">${Math.floor(Math.random() * 5000 + 1000)}</span>
        </a>
      `).join('')}
    </div>
  `
  container.innerHTML = html
}

const renderSucai = (articles: Article[]): void => {
  const container = document.getElementById('font_hot')
  if (!container) {
    console.warn('找不到容器: font_hot')
    return
  }

  const html = `
    <div class="io-hot-list">
      ${articles.map((item, index) => `
        <a class="io-hot-item" href="${item.url}" target="_blank">
          <div class="io-hot-index${index < 3 ? ` io-hot-index-${index + 1}` : ''}">${index + 1}</div>
          <span class="io-hot-title">${item.title}</span>
          <span class="io-hot-num">${Math.floor(Math.random() * 5000 + 1000)}</span>
        </a>
      `).join('')}
    </div>
  `
  container.innerHTML = html
}

const renderAigc = (articles: Article[]): void => {
  const container = document.getElementById('aigc_hot')
  if (!container) {
    console.warn('找不到容器: aigc_hot')
    return
  }

  const html = `
    <div class="io-hot-list">
      ${articles.map((item, index) => `
        <a class="io-hot-item" href="${item.url}" target="_blank">
          <div class="io-hot-index${index < 3 ? ` io-hot-index-${index + 1}` : ''}">${index + 1}</div>
          <span class="io-hot-title">${item.title}</span>
          <span class="io-hot-num">${Math.floor(Math.random() * 5000 + 1000)}</span>
        </a>
      `).join('')}
    </div>
  `
  container.innerHTML = html
}

// 修改 fetchWithRetry 函数
const fetchWithRetry = async (url: string, params: RequestParams, retryCount = 0): Promise<any> => {
  const retryLimit = 2
  const retryDelay = 500
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 6000)

  try {
    // 过滤掉 undefined 的参数
    const validParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    ) as Record<string, string>

    const response = await fetch(url + '?' + new URLSearchParams(validParams), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    return await response.json()
  } catch (error) {
    if (retryCount < retryLimit) {
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      return fetchWithRetry(url, params, retryCount + 1)
    }
    throw error
  }
}

// 修改请求配置
const requests: RequestConfig[] = [
  {
    url: 'https://www.uied.cn/wp-json/wp/v2/posts',
    params: {
      _fields: 'title,link,date',
      per_page: '30',
      orderby: 'date',
      order: 'desc',
      categories_exclude: '337,388'
    },
    key: '337,388',  // 添加明确的key
    render: renderArticles
  },
  {
    url: 'https://www.uied.cn/wp-json/wp/v2/circle',
    params: {
      _fields: 'title,link,date',
      per_page: '30',
      orderby: 'date',
      order: 'desc'
    },
    key: 'circle',  // 添加明确的key
    render: renderCircle
  },
  {
    url: 'https://www.uied.cn/wp-json/wp/v2/posts',
    params: {
      _fields: 'title,link,date',
      per_page: '30',
      orderby: 'date',
      order: 'desc',
      tags: '3842'  // DeepSeek教程标签ID
    },
    key: '3842',  // 使用标签ID作为key
    render: renderSucai
  },
  {
    url: 'https://www.uied.cn/wp-json/wp/v2/posts',
    params: {
      _fields: 'title,link,date',
      per_page: '30',
      orderby: 'date',
      order: 'desc',
      categories: '417'
    },
    key: '417',  // 添加明确的key
    render: renderAigc
  }
]

// 修改刷新列表函数
const refreshList = async () => {
  if (loading.value) {
    console.log('正在加载中，请稍候...')
    return
  }

  const now = Date.now()
  if (now - lastRefreshTime.value < REFRESH_COOLDOWN) {
    const remainingCooldown = Math.ceil((REFRESH_COOLDOWN - (now - lastRefreshTime.value)) / 1000)
    console.log(`刷新太频繁，请${remainingCooldown}秒后再试`)
    return
  }

  loading.value = true
  isRefreshing.value = true
  lastRefreshTime.value = now

  try {
    const cachedData = getCache()
    if (cachedData) {
      console.log('使用缓存数据')
      // 修改缓存数据的映射关系，使用正确的键名
      if (cachedData['337,388']) renderArticles(cachedData['337,388'])
      if (cachedData.circle) renderCircle(cachedData.circle)
      if (cachedData['3842']) renderSucai(cachedData['3842'])  // 使用标签ID作为key
      if (cachedData['417']) renderAigc(cachedData['417'])
      loading.value = false
      isRefreshing.value = false
      return
    }

    const batchSize = 3
    const batchDelay = 200
    const data: Record<string, Article[]> = {}

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(async (req) => {
          try {
            console.log('发起请求:', req.url)
            const posts = await fetchWithRetry(req.url, req.params)
            const articles: Article[] = posts.map((post: any) => ({
              title: post.title.rendered.replace(/&#8211;/g, '-'),
              url: post.link,
              date: post.date
            }))
            req.render(articles)
            // 使用显式定义的key
            return { type: req.key, data: articles }
          } catch (error) {
            console.error('获取数据失败:', error)
            return { type: req.key, data: [] }
          }
        })
      )

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          data[result.value.type] = result.value.data
        }
      })

      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay))
      }
    }

    // 打印获取到的数据
    console.log('获取到的所有数据键值:', Object.keys(data))

    if (Object.values(data).some(arr => arr.length > 0)) {
      setCache(data)
    }

  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

// 添加自动刷新
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  refreshList()
  updateTime()
  setInterval(updateTime, 1000)

  // 每10分钟自动刷新一次
  autoRefreshTimer = setInterval(() => {
    refreshList()
  }, CACHE_EXPIRY)
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
.hot-search-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

.hot-search-wrapper {
  background-color: #fff;
  border-radius: 0.75rem;
  padding: 1rem;
  margin: 0 auto;
  box-shadow: 0 0.0625rem 0.125rem 0 rgba(0, 0, 0, 0.05);
}

.hot-search-header {
  padding: 0.375rem 0.5rem;
  border-bottom: 0.0625rem solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.header-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.header-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
}

.header-subtitle {
  font-size: 0.75rem;
  color: #999;
  margin-left: 0.25rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-time {
  font-size: 13px;
  color: #666;
}

.action-icon {
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.action-icon:hover {
  color: #1890ff;
  transform: rotate(180deg);
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.action-icon.refreshing {
  animation: rotate 1s linear infinite;
  color: #1890ff;
}

.hot-search-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0.75rem 0.5rem;
}

.hot-list-section {
  background: #ffffff;
  border-radius: 0.75rem;
  border: 0.0625rem solid #ebeef5;
  display: flex;
  flex-direction: column;
  height: 26.25rem;
  transition: all 0.3s;
  min-width: 0;
  position: relative;
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05);
}

.hot-list-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-color: #e0e0e0;
  transform: translateY(-2px);
}

/* 为每个热榜容器设置不同的动画延迟 */
.hot-list-section:nth-child(1) {
  animation-delay: 0s;
}

.hot-list-section:nth-child(2) {
  animation-delay: 0.2s;
}

.hot-list-section:nth-child(3) {
  animation-delay: 0.4s;
}

.hot-list-section:nth-child(4) {
  animation-delay: 0.6s;
}

.hot-list-section:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes sectionFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
  background: #fafafa;
  border-radius: 12px 12px 0 0;
  transition: all 0.3s ease;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.platform-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.platform-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #333;
  text-shadow: none;
  white-space: nowrap;
}

.platform-type {
  font-size: 12px;
  color: #666;
  padding: 2px 6px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  margin-left: 4px;
}

.hot-list-container {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
  padding: 8px 0;
  height: calc(100% - 50px);
  position: relative;
}

.hot-list-container::-webkit-scrollbar {
  width: 4px;
}

.hot-list-container::-webkit-scrollbar-track {
  background: transparent;
}

.hot-list-container::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.hot-list-container::-webkit-scrollbar-thumb:hover {
  background-color: #ccc;
}

.hot-list-section:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  z-index: 1;
  border-radius: 0 0 8px 8px;
}

@media screen and (max-width: 75rem) {

  /* 1200px */
  .hot-search-wrapper {
    padding: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .hot-search-wrapper::-webkit-scrollbar {
    display: none;
  }

  .hot-search-content {
    display: flex !important;
    flex-wrap: nowrap !important;
    grid-template-columns: none !important;
    gap: 0.5rem;
    padding: 0.5rem 0.5rem;
    width: max-content !important;
  }

  .hot-list-section {
    width: calc((100vw - 4rem) / 4) !important;
    min-width: 16.5rem !important;
    flex: 0 0 auto !important;
    margin-right: 0.25rem;
    height: 26.25rem;
  }

  .hot-list-section:last-child {
    margin-right: 0.5rem;
  }

  .hot-search-container {
    padding: 0.5rem 0;
    margin: 0.5rem 0;
    overflow: hidden;
  }

  .hot-search-header {
    padding: 0.5rem 1rem;
    margin: 0 0.5rem;
  }

  .header-subtitle {
    display: none;
  }
}

@media screen and (max-width: 48rem) {

  /* 768px */
  .hot-list-section {
    width: calc(100vw - 3rem) !important;
    max-width: 26.25rem !important;
    min-width: 23.75rem !important;
  }
}

/* 骨架屏样式 */
.skeleton-list {
  padding: 8px 0;
}

.skeleton-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f4f4f5;
  margin-right: 12px;
  flex-shrink: 0;
}

.skeleton-index-1 {
  background: rgba(255, 77, 79, 0.2);
}

.skeleton-index-2 {
  background: rgba(255, 122, 69, 0.2);
}

.skeleton-index-3 {
  background: rgba(255, 197, 61, 0.2);
}

.skeleton-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.skeleton-title {
  height: 16px;
  background: #f4f4f5;
  border-radius: 4px;
  flex: 1;
}

.skeleton-hot {
  width: 45px;
  height: 16px;
  background: #f4f4f5;
  border-radius: 4px;
  flex-shrink: 0;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

/* 添加淡入动画 */
.fade-in {
  opacity: 0;
  animation: fadeIn 0.5s ease forwards;
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

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.3s ease;
  background: #f5f5f5;
}

.view-all-btn:hover {
  color: #1890ff;
  background: #e6f7ff;
}

.view-all-btn .el-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.view-all-btn:hover .el-icon {
  transform: translateX(2px);
}

@media screen and (max-width: 767px) {
  .header-right {
    gap: 8px;
  }

  .view-all-btn {
    padding: 2px 6px;
    font-size: 12px;
  }
}

/* 热榜标题样式 - 支持显示3行 */
.hot-search-container :deep(.io-hot-title) {
  display: -webkit-box;
  -webkit-line-clamp: 3 !important;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.35;
  max-height: 4.05em;
  margin-right: 4px;
  margin-left: 6px;
  font-size: 14px;
  transition: color 0.2s ease;
}

/* 调整热榜项目布局 */
.hot-search-container :deep(.io-hot-item) {
  padding: 8px 12px;
  min-height: 68px;
  align-items: flex-start;
}

/* 调整热度数字位置 */
.hot-search-container :deep(.io-hot-num) {
  align-self: flex-start;
  margin-top: 2px;
  font-size: 11px;
  padding: 1px 4px;
}

/* 调整索引编号样式 */
.hot-search-container :deep(.io-hot-index) {
  margin-right: 4px;
  width: 22px;
}

/* 优化热榜列表容器内边距 */
.hot-search-container :deep(.io-hot-list) {
  padding: 0 8px;
}

/* 增加全局样式声明 */
.hot-list-container .io-hot-title {
  -webkit-line-clamp: 3 !important;
  max-height: 4.05em !important;
}
</style>
