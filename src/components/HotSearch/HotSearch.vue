/**
 * @file HotSearch.vue
 * @description 热榜组件，展示 UIED 网站的热门文章、圈子、DeepSeek 教程和 AIGC 学习内容
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
            <el-icon :class="['action-icon', { refreshing: isRefreshing }]" @click="refreshList(true)">
              <Refresh />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="hot-search-content">
        <div
          v-for="section in hotSections"
          :key="section.key"
          class="hot-list-section"
        >
          <div class="section-header">
            <div class="platform-info">
              <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
              <span class="platform-name">{{ section.platformName }}</span>
              <span v-if="section.platformType" class="platform-type">{{ section.platformType }}</span>
            </div>
          </div>

          <div :id="section.domId" class="hot-list-container">
            <div v-if="loading && section.items.length === 0" class="loading-container">
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

            <div v-else-if="section.items.length > 0" class="io-hot-list">
              <a
                v-for="(item, index) in section.items"
                :key="`${section.key}-${item.url}-${index}`"
                class="io-hot-item"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div :class="['io-hot-index', index < 3 ? `io-hot-index-${index + 1}` : '']">
                  {{ index + 1 }}
                </div>
                <span class="io-hot-title">{{ item.title }}</span>
                <span class="io-hot-num">{{ item.hot }}</span>
              </a>
            </div>

            <div v-else class="hot-empty">
              <span>当前暂无热榜数据</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { Refresh, ArrowRight } from '@element-plus/icons-vue'
import {
  getDefaultHomepageLearningConfig,
  getHomepageLearningFeed,
  type HomepageLearningFeedConfig,
  type HomepageLearningFeedItem,
  type HomepageLearningFeedResult
} from '@/services/homepageLearning'
import '@/assets/io-hot.css'

interface Article {
  title: string
  url: string
  date: string
  hot: number
}

interface HotSectionConfig {
  key: 'learn' | 'relax' | 'deepseek' | 'aigc'
  domId: string
  platformName: string
  platformType?: string
}

interface HotSearchCacheData {
  sections: Record<string, Article[]>
  learningConfig: HomepageLearningFeedConfig
}

const loading = ref(false)
const currentTime = ref('')
const isRefreshing = ref(false)
const lastRefreshTime = ref(0)
const timeTimer = ref<ReturnType<typeof setInterval> | null>(null)
const autoRefreshTimer = ref<ReturnType<typeof setInterval> | null>(null)
const learningConfig = ref<HomepageLearningFeedConfig>(getDefaultHomepageLearningConfig())

const CACHE_KEY = 'hot_search_cache_v3'
const CACHE_EXPIRY = 10 * 60 * 1000
const REFRESH_COOLDOWN = 30 * 1000

const sectionConfigs: HotSectionConfig[] = [
  {
    key: 'learn',
    domId: 'learn_hot',
    platformName: '每日学习'
  },
  {
    key: 'relax',
    domId: 'relax_hot',
    platformName: '累了摸鱼'
  },
  {
    key: 'deepseek',
    domId: 'font_hot',
    platformName: 'DeepSeek教程',
    platformType: '最近爆火'
  },
  {
    key: 'aigc',
    domId: 'aigc_hot',
    platformName: 'AIGC学习'
  }
]

const sectionArticles = reactive<Record<string, Article[]>>(
  sectionConfigs.reduce<Record<string, Article[]>>((result, item) => {
    result[item.key] = []
    return result
  }, {})
)

const hotSections = computed(() =>
  sectionConfigs
    .filter((item) => {
      if (item.key === 'learn') {
        return learningConfig.value.enabled
      }
      return loading.value || (sectionArticles[item.key] || []).length > 0
    })
    .map((item) => ({
      ...item,
      platformName: item.key === 'learn' ? learningConfig.value.title : item.platformName,
      items: sectionArticles[item.key] || []
    }))
)

/**
 * 函数说明：读取热榜缓存，命中有效缓存时直接回填响应式列表，避免刷新阶段再次触发 DOM 竞争。
 */
const getCache = (): HotSearchCacheData | null => {
  try {
    const cache = localStorage.getItem(CACHE_KEY)
    if (!cache) {
      return null
    }
    const { data, timestamp } = JSON.parse(cache)
    const remainingTime = CACHE_EXPIRY - (Date.now() - timestamp)
    if (remainingTime <= 0) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    if (!data || typeof data !== 'object') {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    const cacheData = data as Partial<HotSearchCacheData>
    if (!cacheData.sections || typeof cacheData.sections !== 'object') {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return {
      sections: cacheData.sections,
      learningConfig: cacheData.learningConfig || getDefaultHomepageLearningConfig()
    }
  } catch (error) {
    console.error('读取热榜缓存失败:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

/**
 * 函数说明：缓存热榜接口结果，降低首页多次刷新时的请求压力。
 */
const setCache = (data: HotSearchCacheData) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        timestamp: Date.now()
      })
    )
  } catch (error) {
    console.error('写入热榜缓存失败:', error)
  }
}

/**
 * 函数说明：更新头部当前时间显示。
 */
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

/**
 * 函数说明：将后端解析后的文章条目转换为首页热榜统一结构。
 */
const normalizeLearningArticles = (items: HomepageLearningFeedItem[]): Article[] => {
  return items.map((item, index) => ({
    title: item.title,
    url: item.url,
    date: item.publishedAt,
    hot: Math.max(1000, 5200 - index * 97)
  }))
}

/**
 * 函数说明：将缓存或接口数据写入响应式列表，确保由 Vue 自己完成节点更新。
 */
const applySectionArticles = (data: Record<string, Article[]>) => {
  sectionConfigs.forEach((item) => {
    sectionArticles[item.key] = Array.isArray(data[item.key]) ? data[item.key] : []
  })
}

/**
 * 函数说明：将后端一次返回的四个首页栏目数据映射为热榜列表，避免浏览器跨域请求旧接口。
 */
const normalizeHomepageSections = (result: HomepageLearningFeedResult): Record<string, Article[]> => {
  learningConfig.value = result.config
  return {
    learn: normalizeLearningArticles(result.items),
    relax: normalizeLearningArticles(result.sections.relax),
    deepseek: normalizeLearningArticles(result.sections.deepseek),
    aigc: normalizeLearningArticles(result.sections.aigc)
  }
}

/**
 * 函数说明：刷新热榜数据，自动刷新优先使用缓存，手动刷新则绕过缓存便于验收后台配置。
 */
const refreshList = async (forceRefresh = false) => {
  if (loading.value) {
    return
  }

  const now = Date.now()
  if (!forceRefresh && now - lastRefreshTime.value < REFRESH_COOLDOWN) {
    return
  }

  loading.value = true
  isRefreshing.value = true
  lastRefreshTime.value = now

  try {
    const cachedData = forceRefresh ? null : getCache()
    if (cachedData) {
      learningConfig.value = cachedData.learningConfig
      applySectionArticles(cachedData.sections)
      return
    }

    const nextData = normalizeHomepageSections(await getHomepageLearningFeed())

    applySectionArticles(nextData)
    if (Object.values(nextData).some((items) => items.length > 0)) {
      setCache({
        sections: nextData,
        learningConfig: learningConfig.value
      })
    }
  } catch (error) {
    console.error('刷新热榜失败:', error)
  } finally {
    loading.value = false
    isRefreshing.value = false
  }
}

onMounted(() => {
  void refreshList()
  updateTime()
  timeTimer.value = setInterval(updateTime, 1000)
  autoRefreshTimer.value = setInterval(() => {
    void refreshList()
  }, CACHE_EXPIRY)
})

onUnmounted(() => {
  if (timeTimer.value) {
    clearInterval(timeTimer.value)
  }
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
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
  box-shadow: none;
}

.hot-search-header {
  padding: 0.375rem 0.5rem;
  border-bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1.25rem;
  padding: 0.5rem;
}

.hot-list-section {
  background: transparent;
  border-radius: 0.5rem;
  border: 0;
  display: flex;
  flex-direction: column;
  height: 26.25rem;
  transition: background-color 0.2s ease;
  min-width: 0;
  position: relative;
  box-shadow: none;
}

.hot-list-section:hover {
  box-shadow: none;
  transform: none;
}

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
  border-bottom: 0;
  flex-shrink: 0;
  background: #f6f7f9;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
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
  padding: 6px 0;
  height: calc(100% - 50px);
  position: relative;
}

.io-hot-item {
  border-bottom: 0;
}

.io-hot-index-1,
.io-hot-index-2,
.io-hot-index-3 {
  box-shadow: none;
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

.hot-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 13px;
}

@media screen and (max-width: 75rem) {
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
    padding: 0.5rem 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .header-left {
    flex-wrap: wrap;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .header-subtitle {
    display: none;
  }
}

@media screen and (max-width: 48rem) {
  .hot-list-section {
    width: calc(100vw - 2.5rem) !important;
    min-width: 18rem !important;
  }

  .header-time {
    display: none;
  }
}
</style>
