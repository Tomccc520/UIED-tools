<!--
* @file HotRanking.vue
* @description 每日热榜工具，汇聚各大平台热点内容
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @author UIED技术团队
* @createDate 2025-1-22
*
* 功能特性：
* 1. 聚合多平台热榜
* 2. 实时更新
* 3. 优雅的动画效果
* 4. 响应式布局
-->

<template>
  <div class="hot-search-container" role="region" aria-label="热门内容榜单">
    <!-- SEO 元数据 -->
    <div itemscope itemtype="https://schema.org/WebPage" style="display:none">
      <meta itemprop="name" content="今日热榜 - 汇聚全网热点" />
      <meta itemprop="description" content="实时更新各大平台热门内容，包括社交媒体、新闻资讯、专业设计和AI创意等多个领域的热门话题。" />
      <meta itemprop="keywords" content="热榜,热搜,热点,今日热点,设计热榜,AIGC,AI教程,热门话题" />
    </div>

    <div class="hot-search-wrapper">
      <div class="hot-search-header">
        <div class="header-left">
          <img src="@/assets/hot.svg" alt="hot" class="header-icon">
          <span class="header-title">今日热榜</span>
          <span class="header-subtitle">汇聚全网热点，热门尽览无余</span>
        </div>
        <div class="header-right">
          <span class="header-time">{{ currentTime }}</span>
          <div class="header-actions">
            <el-icon :class="['action-icon', { refreshing: loading }]" @click="refreshList">
              <Refresh />
            </el-icon>
          </div>
        </div>
      </div>

      <div class="hot-search-content">
        <!-- 分类标题和内容 -->
        <template v-for="category in categories" :key="category.id">
          <div class="category-section">
            <div class="category-header">
              <div class="category-info">
                <el-icon class="category-icon">
                  <component :is="category.icon" />
                </el-icon>
                <h2 class="category-title">{{ category.name }}</h2>
                <span class="category-description">{{ category.description }}</span>
              </div>
            </div>

            <div class="category-content">
              <div v-for="platform in getPlatformsByCategory(category.name)" :key="platform.id"
                class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img :src="platform.icon" class="platform-icon" :alt="platform.name">
                    <span class="platform-name">{{ platform.name }}</span>
                    <span class="platform-type"
                      :style="category.name === '设计热榜' ? 'color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;' : ''">{{
                        platform.type }}</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div :id="platform.id" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <!-- 新增设计标签热榜 -->
              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">DeepSeek教程</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">最近爆火</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="design_tag_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <!-- 新增 Midjourney 教程热榜 -->
              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">Midjourney教程</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">AI绘画</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="midjourney_tag_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <!-- 新增 Stable Diffusion 教程热榜 -->
              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">Stable Diffusion教程</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">AI绘画</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="sd_tag_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>
              <!-- 新增 UIED 资讯热榜 -->
              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">即梦AI教程</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">AI教程</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="dream_ai_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">Nano-Banana教程</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">AI教程</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="nano_banana_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">AI工具</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">AI工具</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="ai_tools_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

              <div v-if="category.name === '设计热榜'" class="hot-list-section">
                <div class="section-header">
                  <div class="platform-info">
                    <img src="@/assets/uiedlogo.png" class="platform-icon" alt="UIED">
                    <span class="platform-name">开源项目</span>
                    <span class="platform-type"
                      style="color: #ef4444; background: #fef2f2; border: 1px solid #fee2e2;">开源资源</span>
                  </div>
                </div>
                <div class="hot-list-container">
                  <template v-if="loading">
                    <div class="skeleton-list">
                      <div v-for="i in 10" :key="i" class="skeleton-item" :style="{ animationDelay: `${i * 0.05}s` }">
                        <div class="skeleton-index" :class="[i <= 3 ? `skeleton-index-${i}` : '', 'skeleton-pulse']">
                        </div>
                        <div class="skeleton-content">
                          <div class="skeleton-title skeleton-pulse"></div>
                          <div class="skeleton-hot skeleton-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div id="opensource_hot" class="io-hot-list"></div>
                  </template>
                </div>
              </div>

            </div>
          </div>
        </template>


      </div>

      <!-- 版权提示 -->
      <div class="mt-8 text-sm text-gray-500">
        <p class="text-center">温馨提示</p>
        <p class="text-center mt-2">本热榜所有内容均来源于互联网，仅供参考。如有侵权请联系我们删除。</p>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="showToast"
      class="fixed top-4 right-4 px-4 py-2 rounded-lg text-sm text-white transition-all duration-300"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { HotRankingAPI } from '@/api/hot-ranking'
import { officialAPIs, categories } from '@/api/platforms'

interface HotSection {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface HotListItem {
  title: string;
  url?: string;
  hot?: string | number;
  [key: string]: any;
}

interface PlatformData {
  name: string;
  data: HotListItem[];
}

interface PlatformInfo {
  name: string;
  subtitle: string;
}

interface CacheData {
  id: string;
  data: any;
  timestamp: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PlatformInfoMap {
  [key: string]: PlatformInfo;
}

interface CacheStore extends IDBObjectStore {
  put(value: CacheData): IDBRequest<IDBValidKey>;
  get(key: string): IDBRequest<CacheData>;
}

interface CacheTransaction extends IDBTransaction {
  objectStore(name: string): CacheStore;
  oncomplete: ((this: IDBTransaction, ev: Event) => any) | null;
}

interface DBSchema extends IDBDatabase {
  objectStoreNames: DOMStringList;
  createObjectStore(name: string, options?: IDBObjectStoreParameters): IDBObjectStore;
}

interface ProcessedPlatformData {
  containerId: string;
  data: HotListItem[];
}

interface HotItem {
  title?: string;
  name?: string;
  url?: string;
  link?: string;
  hot?: string | number;
  views?: string | number;
  num?: string | number;
}

interface Platform {
  name: string;
  data: HotItem[];
}

// 常量定义
const API_TIMEOUT = 10000
const MAX_RETRY_COUNT = 3
const RETRY_DELAY = 1000

// 平台信息
const platformInfo = ref<PlatformInfoMap>({
  weibo: { name: '微博', subtitle: '热搜榜' },
  zhihu: { name: '知乎热榜', subtitle: '热度' },
  baidu: { name: '百度热点', subtitle: '指数' },
  bilibili: { name: '哔哩哔哩', subtitle: '全站日榜' },
  douyin: { name: '抖音', subtitle: '热点榜' },
  pengpai: { name: '澎湃新闻', subtitle: '时事' },
  '36kr': { name: '36氪', subtitle: '24小时热榜' },
  toutiao: { name: '今日头条', subtitle: '热点' },
  ithome: { name: 'IT之家', subtitle: '最新资讯' },
  huxiu: { name: '虎嗅', subtitle: '最新资讯' },
  douban: { name: '豆瓣小组', subtitle: '讨论精选' },
  woshipm: { name: 'woShiPm', subtitle: '热榜' }
})

// 修改计算属性：第三方平台热榜数据
const thirdPartySections = ref(officialAPIs.map(api => ({
  id: api.id,
  name: api.name,
  type: api.type,
  icon: api.icon
})))

// 状态变量
const route = useRoute()
const loading = ref(false)
const currentTime = ref('')
const autoRefresh = ref(false)
const nextRefreshTime = ref(300)
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// 添加获取分类平台的方法
const getPlatformsByCategory = (categoryName: string) => {
  return officialAPIs.filter(platform => platform.category === categoryName);
}

// 修改渲染函数，使用虚拟列表优化
const renderHotList = async (containerId: string, data: HotListItem[]) => {
  const container = document.getElementById(containerId)
  if (!container) {
    console.warn('找不到容器:', containerId)
    return
  }

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-500 py-4" role="status">暂无数据</div>'
    return
  }

  try {
    // 创建文档片段，减少DOM操作
    const fragment = document.createDocumentFragment()

    // 处理数据
    data.forEach((item, index) => {
      const itemElement = document.createElement('a')
      itemElement.className = 'io-hot-item'
      itemElement.href = item.url || '#'
      itemElement.target = '_blank'
      itemElement.rel = 'noopener noreferrer'
      itemElement.setAttribute('role', 'listitem')
      itemElement.setAttribute('itemprop', 'itemListElement')
      itemElement.setAttribute('itemscope', '')
      itemElement.setAttribute('itemtype', 'https://schema.org/ListItem')

      // 添加位置元数据
      const positionMeta = document.createElement('meta')
      positionMeta.setAttribute('itemprop', 'position')
      positionMeta.setAttribute('content', (index + 1).toString())
      itemElement.appendChild(positionMeta)

      const indexClass = index < 3 ? `io-hot-index io-hot-index-${index + 1}` : 'io-hot-index'
      const indexStyle = index >= 3 ? ' style="background: #f4f4f5; color: #909399;"' : ''

      // 创建标题元素，使用itemprop
      const titleSpan = document.createElement('span')
      titleSpan.className = 'io-hot-title'
      titleSpan.setAttribute('itemprop', 'name')
      titleSpan.textContent = item.title || '暂无标题'

      // 创建索引元素
      const indexDiv = document.createElement('div')
      indexDiv.className = indexClass
      if (index >= 3) {
        indexDiv.style.background = '#f4f4f5'
        indexDiv.style.color = '#909399'
      }
      indexDiv.textContent = (index + 1).toString()

      // 创建热度元素
      const hotSpan = document.createElement('span')
      hotSpan.className = 'io-hot-num'
      hotSpan.textContent = item.hot ? item.hot.toString().replace('热度', '') : '-'

      // 添加URL元数据
      const urlMeta = document.createElement('meta')
      urlMeta.setAttribute('itemprop', 'url')
      urlMeta.setAttribute('content', item.url || '#')

      // 组装元素
      itemElement.appendChild(indexDiv)
      itemElement.appendChild(titleSpan)
      itemElement.appendChild(hotSpan)
      itemElement.appendChild(urlMeta)

      fragment.appendChild(itemElement)
    })

    // 一次性更新DOM
    container.innerHTML = ''
    container.appendChild(fragment)

  } catch (error) {
    console.error('渲染热榜失败:', error)
    container.innerHTML = '<div class="text-center text-gray-500 py-4" role="alert">加载失败，请稍后重试</div>'
  }
}

// 缓存相关优化
const CACHE_KEY = 'hot_ranking_cache'
const CACHE_EXPIRY = 15 * 60 * 1000
const BACKGROUND_REFRESH_INTERVAL = 8 * 60 * 1000
const REFRESH_COOLDOWN = 30 * 1000
const lastRefreshTime = ref(0)

// 使用 IndexedDB 存储缓存
const saveToIndexedDB = async (data: any) => {
  try {
    const db = await openDB()
    const tx = db.transaction('hotRankingCache', 'readwrite') as CacheTransaction
    const store = tx.objectStore('hotRankingCache')

    await new Promise<void>((resolve, reject) => {
      const request = store.put({
        id: CACHE_KEY,
        data,
        timestamp: Date.now()
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve()
    })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('IndexedDB存储失败:', error)
    }
  }
}

/**
 * 从 IndexedDB 读取完整缓存记录
 * @returns 缓存记录
 */
const getCacheRecordFromIndexedDB = async (): Promise<CacheData | null> => {
  try {
    const db = await openDB()
    const tx = db.transaction('hotRankingCache', 'readonly') as CacheTransaction
    const store = tx.objectStore('hotRankingCache')

    const result = await new Promise<CacheData | null>((resolve, reject) => {
      const request = store.get(CACHE_KEY)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    return result || null
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('IndexedDB读取失败:', error)
    }
    return null
  }
}

/**
 * 从 IndexedDB 读取有效缓存数据
 * @returns 未过期缓存数据
 */
const getFromIndexedDB = async () => {
  const cacheRecord = await getCacheRecordFromIndexedDB()
  if (!cacheRecord) return null

  if (Date.now() - cacheRecord.timestamp < CACHE_EXPIRY) {
    return cacheRecord.data
  }

  return null
}

// IndexedDB 相关函数
const openDB = (): Promise<DBSchema> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hotRankingDB', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result as DBSchema)

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result as DBSchema
      if (!db.objectStoreNames.contains('hotRankingCache')) {
        db.createObjectStore('hotRankingCache', { keyPath: 'id' })
      }
    }
  })
}

// 修改第三方平台数据获取函数
const fetchThirdPartyData = async (signal: AbortSignal) => {
  try {
    const api = HotRankingAPI.getInstance();
    const data = await api.getAllPlatformsData();

    return {
      success: true,
      data: data.map(platform => ({
        name: platform.name,
        data: platform.data
      }))
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('获取热榜数据失败:', error);
    }
    return {
      success: false,
      data: []
    };
  }
}

// 修改 UIED 数据获取函数
const fetchUiedData = async (signal: AbortSignal) => {
  const uiedRequests = [
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        categories_exclude: '337,388'
      },
      key: '337,388'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/circle',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc'
      },
      key: 'circle'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        categories: '319'
      },
      key: '319'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        categories: '417'
      },
      key: '417'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '452'
      },
      key: '452'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '3842'
      },
      key: 'design_tag'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '419'
      },
      key: 'midjourney_tag'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '428'
      },
      key: 'sd_tag'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '12110'
      },
      key: 'dream_ai_hot'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        tags: '13220'
      },
      key: 'nano_banana_hot'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        categories: '3351'
      },
      key: 'ai_tools_hot'
    },
    {
      url: 'https://www.uied.cn/wp-json/wp/v2/posts',
      params: {
        _fields: 'title,link,date',
        per_page: '50',
        orderby: 'date',
        order: 'desc',
        categories: '12066'
      },
      key: 'opensource_hot'
    }
  ]

  const fetchWithRetry = async (request: typeof uiedRequests[0], retryCount = 0): Promise<any> => {
    try {
      const validParams = Object.fromEntries(
        Object.entries(request.params).filter(([_, value]) => value !== undefined)
      ) as Record<string, string>

      const response = await fetch(request.url + '?' + new URLSearchParams(validParams), {
        signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const posts = await response.json()

      return {
        key: request.key,
        data: posts.map((post: any) => ({
          title: post.title.rendered.replace(/&#8211;/g, '-'),
          url: post.link,
          hot: Math.floor(Math.random() * 5000 + 1000)
        }))
      }
    } catch (error) {
      if (retryCount < MAX_RETRY_COUNT) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        return fetchWithRetry(request, retryCount + 1)
      }
      console.error(`获取UIED数据失败 (${request.key}):`, error)
      return {
        key: request.key,
        data: [
          { title: '暂无数据', url: '#', hot: '-' }
        ]
      }
    }
  }

  try {
    const batchSize = 3
    const batchDelay = 200
    const results = []

    // 分批请求数据
    for (let i = 0; i < uiedRequests.length; i += batchSize) {
      const batch = uiedRequests.slice(i, i + batchSize)
      const batchResults = await Promise.allSettled(
        batch.map(req => fetchWithRetry(req))
      );

      results.push(...batchResults);

      if (i + batchSize < uiedRequests.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    const uiedData: Record<string, any> = {}
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        uiedData[uiedRequests[index].key] = result.value.data
      } else {
        uiedData[uiedRequests[index].key] = [
          { title: '暂无数据', url: '#', hot: '-' }
        ]
      }
    })

    return uiedData
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('获取UIED数据失败:', error)
    }
    return {}
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

const handleAutoRefreshChange = (value: boolean) => {
  if (value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const startAutoRefresh = () => {
  if (autoRefreshTimer || countdownTimer) {
    return
  }

  nextRefreshTime.value = 300
  autoRefreshTimer = setInterval(() => {
    fetchHotList(false)
    nextRefreshTime.value = 300
  }, 300000) // 5分钟刷新一次

  countdownTimer = setInterval(() => {
    if (nextRefreshTime.value > 0) {
      nextRefreshTime.value--
    }
  }, 1000)
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 优化消息提示函数
const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
  ElMessage({
    message,
    type,
    duration: 3000
  })
}

// 智能刷新函数
const refreshList = () => {
  if (loading.value) {
    showMessage('正在加载中，请稍候...', 'error')
    return
  }

  const now = Date.now()
  if (now - lastRefreshTime.value < REFRESH_COOLDOWN) {
    const remainingCooldown = Math.ceil((REFRESH_COOLDOWN - (now - lastRefreshTime.value)) / 1000)
    showMessage(`刷新太频繁，请${remainingCooldown}秒后再试`, 'error')
    return
  }

  lastRefreshTime.value = now
  fetchHotList(true)
}

// 修改数据获取和渲染函数
const fetchHotList = async (forceRefresh = false) => {
  if (loading.value) return

  loading.value = true

  try {
    // 优先展示缓存
    const cacheRecord = await getCacheRecordFromIndexedDB()
    const cacheAge = cacheRecord ? Date.now() - cacheRecord.timestamp : Number.POSITIVE_INFINITY
    const hasFreshCache = Boolean(cacheRecord && cacheAge < CACHE_EXPIRY)
    const cachedData = hasFreshCache ? cacheRecord?.data : null

    if (cachedData) {
      loading.value = false
      await nextTick()
      await renderAllData(cachedData)

      // 缓存仍较新且非强刷时，直接使用缓存，跳过后台网络请求
      if (!forceRefresh && cacheAge < BACKGROUND_REFRESH_INTERVAL) {
        return
      }
    }

    // 后台更新数据
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const [thirdPartyData, uiedData] = await Promise.all([
      fetchThirdPartyData(controller.signal),
      fetchUiedData(controller.signal)
    ])

    clearTimeout(timeoutId)

    const allData = { thirdPartyData, uiedData }
    await saveToIndexedDB(allData)

    // 如果没有缓存数据，才需要设置 loading 为 false
    if (!cachedData) {
      loading.value = false
      await nextTick()
      await renderAllData(allData)
    } else {
      // 有缓存数据的情况下，静默更新
      await renderAllData(allData)
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('获取数据失败:', error)
    }
    loading.value = false
  }
}

// 修改渲染数据函数
const renderAllData = async (data: { thirdPartyData: any, uiedData: any }) => {
  const { thirdPartyData, uiedData } = data

  try {
    // 渲染第三方平台数据
    if (thirdPartyData?.success && Array.isArray(thirdPartyData.data)) {
      for (const platform of thirdPartyData.data) {
        const containerId = officialAPIs.find(api => api.name === platform.name)?.id || '';
        if (containerId) {
          await renderHotList(containerId, platform.data);
        }
      }
    }

    // 渲染 UIED 数据
    if (Object.keys(uiedData).length > 0) {
      if (uiedData['337,388']) await renderHotList('learn_hot', uiedData['337,388'])
      if (uiedData.circle) await renderHotList('relax_hot', uiedData.circle)
      if (uiedData['319']) await renderHotList('font_hot', uiedData['319'])
      if (uiedData['417']) await renderHotList('aigc_hot', uiedData['417'])
      if (uiedData['452']) await renderHotList('design_hot', uiedData['452'])
      if (uiedData.design_tag) await renderHotList('design_tag_hot', uiedData.design_tag)
      if (uiedData.midjourney_tag) await renderHotList('midjourney_tag_hot', uiedData.midjourney_tag)
      if (uiedData.sd_tag) await renderHotList('sd_tag_hot', uiedData.sd_tag)
      if (uiedData.dream_ai_hot) await renderHotList('dream_ai_hot', uiedData.dream_ai_hot)
      if (uiedData.nano_banana_hot) await renderHotList('nano_banana_hot', uiedData.nano_banana_hot)
      if (uiedData.ai_tools_hot) await renderHotList('ai_tools_hot', uiedData.ai_tools_hot)
      if (uiedData.opensource_hot) await renderHotList('opensource_hot', uiedData.opensource_hot)
    }

    // 渲染结束后一次性补充高亮类，避免定时轮询
    await nextTick()
    enhanceListItems()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('渲染数据失败:', error)
    }
    showMessage('渲染数据失败，请刷新重试', 'error')
  }
}

/**
 * 强化前三项样式
 */
const enhanceListItems = () => {
  const lists = document.querySelectorAll('.io-hot-list')
  lists.forEach(list => {
    const items = list.querySelectorAll('.io-hot-item')
    items.forEach((item, index) => {
      if (index < 3) {
        item.classList.add(`io-hot-item-top-${index + 1}`)
      }
    })
  })
}

// 添加计算样式的方法
const computeStyle = (index: number) => {
  return {
    'animation-delay': index * 100 + 'ms',
    'opacity': loading.value ? '0' : '1'
  }
}

// 添加获取骨架屏类名的方法
const getSkeletonClass = (index: number) => {
  return index <= 3 ? 'skeleton-index-' + index : ''
}

// 修改渲染第三方平台数据的部分
const renderThirdPartyData = async (thirdPartyData: any) => {
  if (!thirdPartyData?.success || !Array.isArray(thirdPartyData.data)) {
    console.warn('第三方平台数据格式不正确:', thirdPartyData)
    return
  }

  const platformMap: Record<string, string> = {
    '微博热搜': 'weibo_hot',
    '知乎热榜': 'zhihu_hot',
    '百度热点': 'baidu_hot',
    '哔哩哔哩热榜': 'bilibili_hot',
    '抖音热榜': 'douyin_hot',
    '头条热榜': 'toutiao_hot',
    'IT之家热榜': 'ithome_hot',
    '虎嗅热榜': 'huxiu_hot',
    '36氪热榜': '36kr_hot',
    '澎湃新闻热榜': 'pengpai_hot',
    '豆瓣小组热榜': 'douban_hot',
    '人人都是产品经理热榜': 'woshipm_hot',
    '虫部落热榜': 'chongbuluo_hot'
  }

  // 预处理数据，减少渲染时的计算
  const processedData: ProcessedPlatformData[] = thirdPartyData.data
    .filter((platform: PlatformData) => platform?.name && Array.isArray(platform.data))
    .map((platform: PlatformData) => ({
      containerId: platformMap[platform.name],
      data: platform.data
        .filter((item: HotListItem) => item.title && item.title.trim() !== '')
        .slice(0, 50)
        .map((item: HotListItem) => ({
          title: item.title || '暂无标题',
          url: item.url || '#',
          hot: item.hot || '-'
        }))
    }))
    .filter((item: ProcessedPlatformData) => item.containerId && item.data.length > 0)

  // 一次性渲染所有数据
  await Promise.all(processedData.map(({ containerId, data }) => renderHotList(containerId, data)))
}

// 清理定时器和事件监听
let timeoutIds: number[] = []
const clearTimeouts = () => {
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds = []
}

let timeUpdateInterval: ReturnType<typeof setInterval> | null = null

// 添加滚动处理函数在组件外部
const handleScroll = () => {
  const header = document.querySelector('.hot-search-header')
  if (window.scrollY > 10) {
    header?.classList.add('is-sticky')
  } else {
    header?.classList.remove('is-sticky')
  }
}

/**
 * 页面可见性变化处理
 * 页面隐藏时停止自动刷新，恢复可见时重启并按需刷新
 */
const handleVisibilityChange = () => {
  if (typeof document === 'undefined') return

  if (document.visibilityState === 'hidden') {
    stopAutoRefresh()
    return
  }

  startAutoRefresh()

  if (Date.now() - lastRefreshTime.value > CACHE_EXPIRY) {
    fetchHotList(false)
  }
}

onMounted(async () => {
  // 添加粘性头部效果
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  await nextTick()
  fetchHotList(false)
  updateTime()
  timeUpdateInterval = setInterval(updateTime, 1000)
  if (document.visibilityState === 'visible') {
    startAutoRefresh()
  }
})

onBeforeUnmount(() => {
  stopAutoRefresh()
  clearTimeouts()
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }

  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
@import '@/assets/io-hot.css';

/* 优化容器性能 */
.hot-search-container {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  /* 更柔和的背景色 */
  padding: 1.5rem;
  contain: content;
  animation: fadeIn 0.6s ease-out;
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

.hot-search-wrapper {
  width: 100%;
  max-width: 112.5rem;
  /* 1800px */
  margin: 0 auto;
  padding: 0;
  border-radius: 1rem;
  overflow: hidden;
  background: transparent;
}

.hot-search-header {
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 1rem;
  z-index: 5;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.hot-search-header.is-sticky {
  background: rgba(255, 255, 255, 0.95);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 1.75rem;
  height: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(255, 77, 79, 0.2));
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-left: 0.5rem;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-time {
  font-size: 0.875rem;
  color: #64748b;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 20px;
}

.action-icon {
  font-size: 18px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.action-icon:hover {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
  transform: translateY(-1px);
}

.action-icon.refreshing {
  animation: rotate 1s linear infinite;
  color: #3b82f6;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.hot-search-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 0.5rem 0;
}

.category-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.category-header {
  padding: 0 0.5rem;
  background: transparent;
  border: none;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-icon {
  font-size: 24px;
  color: #3b82f6;
  background: #eff6ff;
  padding: 6px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.category-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-left: 8px;
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
}

.category-content {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

/* 优化热榜卡片样式 */
.hot-list-section {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  height: 480px;
  min-width: 0;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  contain: content;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hot-list-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
  border-color: #e2e8f0;
}

.hot-list-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
  z-index: 1;
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
}

.platform-info {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  padding: 2px 0;
}

.platform-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.platform-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  position: relative;
  z-index: 1;
}

.platform-type {
  font-size: 11px;
  color: #3b82f6;
  padding: 2px 8px;
  background: #eff6ff;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  font-weight: 500;
}

/* 添加热榜列表容器基本样式 */
.hot-list-container {
  height: calc(100% - 60px);
  overflow-y: auto;
  padding: 12px 0;
  position: relative;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  contain: content;
  scroll-padding: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.hot-list-container::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.hot-list-container::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: rgba(148, 163, 184, 0.3);
}

.hot-list-container::-webkit-scrollbar-track {
  background: transparent;
}

/* 基本的列表项样式 */
:deep(.io-hot-item) {
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-start;
  contain: content;
  margin-bottom: 0;
  min-height: auto;
  border-radius: 8px;
  margin: 0 8px 2px;
  border-bottom: none;
  transition: all 0.2s ease;
  position: relative;
}

:deep(.io-hot-item:hover) {
  background-color: #f8fafc;
}

:deep(.io-hot-index) {
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #94a3b8;
  background: #f1f5f9;
  transition: all 0.2s ease;
}

:deep(.io-hot-index-1) {
  background: #fee2e2;
  color: #ef4444;
}

:deep(.io-hot-index-2) {
  background: #ffedd5;
  color: #f97316;
}

:deep(.io-hot-index-3) {
  background: #fef3c7;
  color: #f59e0b;
}

:deep(.io-hot-title) {
  font-size: 14px;
  color: #475569;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
  margin-right: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 3em;
  transition: color 0.2s ease;
  font-weight: 400;
}

/* 添加标题悬停效果 */
:deep(.io-hot-item:hover .io-hot-title) {
  color: #3b82f6;
}

:deep(.io-hot-num) {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  min-width: 50px;
  text-align: right;
  margin-top: 2px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  font-variant-numeric: tabular-nums;
}

/* 响应式布局样式 */
@media screen and (max-width: 1920px) {
  .category-content {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 1536px) {
  .category-content {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 1024px) {
  .category-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .hot-search-container {
    padding: 1rem;
  }
}

@media screen and (max-width: 640px) {
  .category-content {
    grid-template-columns: 1fr;
  }

  .hot-search-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}

/* 骨架屏动画效果 */
.skeleton-list {
  padding: 8px 12px;
}

.skeleton-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  animation: skeletonFadeIn 0.5s ease-in-out forwards;
  opacity: 0;
}

.skeleton-index {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  margin-right: 8px;
  flex-shrink: 0;
}

.skeleton-index-1 {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
}

.skeleton-index-2 {
  background: linear-gradient(90deg, #ff7a45 0%, #ffa940 100%);
}

.skeleton-index-3 {
  background: linear-gradient(90deg, #ffc53d 0%, #ffd666 100%);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 16px;
  border-radius: 4px;
  width: 85%;
}

.skeleton-hot {
  height: 14px;
  border-radius: 4px;
  width: 45px;
  align-self: flex-end;
}

.skeleton-pulse {
  background: linear-gradient(90deg, #f5f5f5 25%, #e8e8e8 37%, #f5f5f5 63%);
  background-size: 400% 100%;
  animation: skeletonLoading 1.4s ease infinite;
}

@keyframes skeletonLoading {
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
}

@keyframes skeletonFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 优化骨架屏容器样式 */
.skeleton-list {
  contain: content;
  height: 100%;
  overflow-y: auto;
}

/* 添加骨架屏交错动画 */
.skeleton-item {
  animation-delay: calc(var(--skeleton-index) * 0.05s);
}

/* 添加骨架屏渐变效果 */
.skeleton-pulse {
  position: relative;
  overflow: hidden;
  transform: translateZ(0);
}

.skeleton-pulse::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent);
  animation: shimmer 2s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* 优化现有动画效果 */
.refreshing {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
