<!--
* @file AIRanking.vue
* @description AI网站排行榜工具，展示热门AI工具和网站
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-02-18
-->

<template>
  <div class="ranking-container">
    <!-- 添加更新提示 -->
    <div class="update-notice">
      <el-icon class="notice-icon">
        <InfoFilled />
      </el-icon>
      <span>功能和数据持续更新中，敬请期待更多内容...</span>
    </div>
    <!-- 顶部导航标签 -->
    <div class="ranking-tabs" :data-can-scroll-left="canScrollLeft" :data-can-scroll-right="canScrollRight">
      <div class="tabs-scroll-container">
        <div class="scroll-btn left" @click="scrollTabs('left')" v-show="canScrollLeft">
          <el-icon>
            <ArrowLeft />
          </el-icon>
        </div>
        <div class="tabs-wrapper">
          <el-tabs v-model="activeTab" class="ranking-tabs-inner" @tab-click="handleTabClick" ref="tabsRef">
            <!-- 热门推荐 -->
            <el-tab-pane label="热门推荐" name="hot">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Star />
                  </el-icon>
                  <span>热门推荐</span>
                  <div class="tab-desc">常用工具推荐</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI文本工具 -->
            <el-tab-pane label="AI文本工具" name="text">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>AI文本工具</span>
                  <div class="tab-desc">智能写作、文本处理</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI绘画工具 -->
            <el-tab-pane label="AI绘画工具" name="draw">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Picture />
                  </el-icon>
                  <span>AI绘画工具</span>
                  <div class="tab-desc">智能绘画、图像处理</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI图片工具 -->
            <el-tab-pane label="AI图片工具" name="image">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Picture />
                  </el-icon>
                  <span>AI图片工具</span>
                  <div class="tab-desc">图片处理、优化</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI视频工具 -->
            <el-tab-pane label="AI视频工具" name="video">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <VideoPlay />
                  </el-icon>
                  <span>AI视频工具</span>
                  <div class="tab-desc">视频制作、编辑</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI音频工具 -->
            <el-tab-pane label="AI音频工具" name="audio">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Headset />
                  </el-icon>
                  <span>AI音频工具</span>
                  <div class="tab-desc">音频处理、合成</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI办公工具 -->
            <el-tab-pane label="AI办公工具" name="office">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Briefcase />
                  </el-icon>
                  <span>AI办公工具</span>
                  <div class="tab-desc">办公效率、自动化</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI设计工具 -->
            <el-tab-pane label="AI设计工具" name="design">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Brush />
                  </el-icon>
                  <span>AI设计工具</span>
                  <div class="tab-desc">UI设计、创意设计</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI开发工具 -->
            <el-tab-pane label="AI开发工具" name="dev">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Monitor />
                  </el-icon>
                  <span>AI开发工具</span>
                  <div class="tab-desc">编程开发、调试</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI学习平台 -->
            <el-tab-pane label="AI学习平台" name="learn">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Reading />
                  </el-icon>
                  <span>AI学习平台</span>
                  <div class="tab-desc">在线学习、培训</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI平台网站 -->
            <el-tab-pane label="AI平台网站" name="platform">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Platform />
                  </el-icon>
                  <span>AI平台网站</span>
                  <div class="tab-desc">综合平台、服务</div>
                </div>
              </template>
            </el-tab-pane>
            <!-- AI电商工具 -->
            <el-tab-pane label="AI电商工具" name="ecommerce">
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <ShoppingCart />
                  </el-icon>
                  <span>AI电商工具</span>
                  <div class="tab-desc">电商运营、营销</div>
                </div>
              </template>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="scroll-btn right" @click="scrollTabs('right')" v-show="canScrollRight">
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 排行榜内容区域 -->
    <div class="ranking-content" v-loading="isInitialLoading">
      <!-- AI文本工具内容 -->
      <div class="ranking-list">
        <!-- 二级tab -->
        <div class="sub-tabs-wrapper">
          <div class="tabs-container">
            <div v-for="tab in currentToolTabs" :key="tab.name" class="tab-item"
              :class="{ active: activeTextTab === tab.name }" @click="handleTextTabChange(tab.name)">
              {{ tab.label }}
            </div>
          </div>

          <!-- 新增筛选选项 -->
          <div class="filter-container">
            <div class="filter-label">排序方式：</div>
            <div class="filter-options">
              <div v-for="option in sortOptions" :key="option.name" class="filter-item"
                :class="{ active: currentSort === option.name }" @click="handleSortChange(option.name)">
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>

        <!-- 添加骨架屏 -->
        <template v-if="loading && !isInitialLoading">
          <div class="skeleton-list">
            <div v-for="i in 3" :key="i" class="skeleton-item">
              <div class="skeleton-rank"></div>
              <div class="skeleton-logo"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-desc"></div>
                <div class="skeleton-detail">
                  <div class="skeleton-tag"></div>
                  <div class="skeleton-tag"></div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 数据内容 -->
        <template v-else-if="!isInitialLoading" v-for="category in aiCategories" :key="category.id">
          <div class="category-header">
            <h3 class="category-title">{{ category.name }}</h3>
            <span class="category-desc">{{ category.description }}</span>
          </div>
          <div class="ranking-item" v-for="(tool, index) in category.tools" :key="tool.id" @click="visitTool(tool.url)">
            <div class="rank-number" :class="`rank-${index + 1}`">{{ index + 1 }}</div>
            <div class="tool-logo">
              <img :src="tool.logo" :alt="tool.name" class="logo-image">
            </div>
            <div class="item-info">
              <div class="item-header">
                <div class="item-name">
                  {{ tool.name }}
                  <span class="new-badge" v-if="index < 3">Hot</span>
                </div>
              </div>
              <div class="item-description">{{ tool.description }}</div>
              <div class="item-tags" v-if="tool.keywords && tool.keywords.length">
                <span class="item-tag" v-for="keyword in tool.keywords" :key="keyword">
                  {{ keyword }}
                </span>
              </div>
              <div class="item-detail">
                <span class="views"><i class="el-icon-view"></i>{{ tool.views }}访问</span>
                <span class="rating"><i class="el-icon-star-on"></i>评分: {{ tool.rating }}</span>
                <span class="release-date" v-if="tool.releaseDate">
                  <i class="el-icon-time"></i>更新: {{ formatDate(tool.releaseDate) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 修改加载更多提示 -->
    <div v-if="isBatchLoading" class="loading-more">
      <div class="loading-text">
        <el-icon class="loading">
          <Loading />
        </el-icon>
        加载中...
      </div>
    </div>
    <div v-if="!hasMore && !isInitialLoading" class="no-more">
      <div class="no-more-text">没有更多数据了</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import {
  Refresh, View, Star, Monitor, Loading, Document,
  ChatLineRound, Picture, VideoPlay, Headset,
  Briefcase, Brush, Reading, Platform, ShoppingCart,
  ArrowLeft, ArrowRight, InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { debounce } from 'lodash'

interface Tool {
  id: string | number
  name: string
  logo: string
  description: string
  category: string
  type: string
  views: string
  rating: string
  url: string
  version?: string
  releaseDate?: string
  keywords?: string[]
  downloads?: number
  price?: number
  language?: string
  status?: string
}

interface Category {
  id: number
  name: string
  icon: string
  description: string
  tools: Tool[]
}

interface ApiResponse {
  data: any
  status: number
}

interface CacheData {
  data: Category[]
  timestamp: number
}

interface CacheStore {
  [key: string]: CacheData
}

const aiCategories = ref<Category[]>([
  {
    id: 1,
    name: 'AI对话助手',
    icon: 'ChatLineRound',
    description: '智能对话、问答工具',
    tools: []
  },
  {
    id: 2,
    name: 'AI办公效率',
    icon: 'Document',
    description: '文档处理、效率工具',
    tools: []
  }
])

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(15)
const hasMore = ref(true)
const isLoadingMore = ref(false)

// 添加dataCache的定义
const dataCache = ref<CacheStore>({})

// 修改缓存结构和过期时间
const CACHE_EXPIRATION = 10 * 60 * 1000 // 增加到10分钟
const BATCH_SIZE = 10 // 批量加载数量

// 添加加载状态管理
const isInitialLoading = ref(true)
const isBatchLoading = ref(false)

// 优化数据加载函数
const loadMoreData = async () => {
  if (isBatchLoading.value || !hasMore.value) return

  try {
    isBatchLoading.value = true
    const nextPage = Math.ceil(aiCategories.value[0]?.tools.length / BATCH_SIZE) + 1
    const newData = await getAIWritingListApi(nextPage, BATCH_SIZE)

    if (newData && newData.length > 0) {
      // 合并数据
      aiCategories.value = aiCategories.value.map((category, index) => ({
        ...category,
        tools: [...category.tools, ...(newData[index]?.tools || [])]
      }))

      hasMore.value = newData.some((category: Category) => category.tools.length === BATCH_SIZE)
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载更多数据失败:', error)
    ElMessage.error('加载更多数据失败')
  } finally {
    isBatchLoading.value = false
  }
}

// 添加滚动加载
const handleScroll = debounce((e: Event) => {
  const element = e.target as HTMLElement
  const scrollBottom = element.scrollHeight - element.scrollTop - element.clientHeight
  if (scrollBottom < 100) {
    loadMoreData()
  }
}, 200)

// 优化初始化加载
onMounted(async () => {
  try {
    isInitialLoading.value = true
    currentPage.value = 1
    hasMore.value = true
    await handleTabClick()
  } finally {
    isInitialLoading.value = false
  }

  // 添加滚动监听
  const contentEl = document.querySelector('.ranking-content')
  if (contentEl) {
    contentEl.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  // 清理滚动监听
  const contentEl = document.querySelector('.ranking-content')
  if (contentEl) {
    contentEl.removeEventListener('scroll', handleScroll)
  }
  dataCache.value = {}
})

const activeTab = ref('hot') // 修改初始值为'hot'
const activeTextTab = ref('all')
const currentSort = ref('hot')
const originalCategories = ref<Category[]>([])

const currentTime = computed(() => {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const textToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI写作工具', name: 'ai-xiezuo' },
  { label: 'AI办公效率', name: 'ai-office' },
  { label: 'AI论文工具', name: 'ai-lunwen' },
  { label: 'AI内容检测', name: 'ai-jiance' },
  { label: 'AI机器人', name: 'ai-jiqiren' },
  { label: 'AI提示词', name: 'ai-prompt' }
]

const drawToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI绘画工具', name: 'ai-huihua' },
  { label: 'AI绘画提示', name: 'tishici' },
  { label: 'AI绘画模型', name: 'moxing' },
  { label: 'AI绘画社区', name: 'ai-shequn' }
]

// 添加AI图片工具的二级菜单
const imageToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI图像增强', name: 'ai-zenqiang' },
  { label: 'AI图去水印', name: 'ai-qushuiyin' },
  { label: 'AI图片修改', name: 'ai-xiugai' },
  { label: 'AI无损放大', name: 'ai-fangda' },
  { label: 'AI模特生成', name: 'ai-mote' },
  { label: 'AI图象处理', name: 'ai-tixiang' },
  { label: 'AI图片抠图', name: 'ai-koutu' },
  { label: 'AI头像生成', name: 'ai-touxiang' }
]

// 添加AI视频工具的二级菜单
const videoToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI视频生成', name: 'ai-shipinsc' },
  { label: 'AI视频抠像', name: 'ai-shipinkouxiang' },
  { label: 'AI字幕翻译', name: 'ai-fanyi' },
  { label: 'AI视频总结', name: 'ai-zongjie' },
  { label: 'AI视频剪辑', name: 'ai-jianji' },
  { label: 'AI视频文案', name: 'ai-wenan' },
  { label: 'AI视频换脸', name: 'ai-huanlian' },
  { label: 'AI虚拟数字人', name: 'ai-shuziren' },
  { label: 'AI视频去水印', name: 'ai-shipinqsy' },
  { label: 'AI视频画质增强', name: 'ai-shipinzengqiang' }
]

// 添加AI音频工具的二级菜单
const audioToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI音频制作', name: 'ai-yinpinzhizuo' },
  { label: 'AI文字转音', name: 'ai-wenzizy' },
  { label: 'AI音频克隆', name: 'ai-yinpinkelong' },
  { label: 'AI人声分离', name: 'ai-renshengfl' },
  { label: 'AI音乐歌手', name: 'ai-geshou' }
]

// 添加AI办公工具的二级菜单
const officeToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI PPT', name: 'ai-ppt' },
  { label: 'AI文档工具', name: 'ai-wendang' },
  { label: 'AI思维导图', name: 'ai-siwei' },
  { label: 'AI效率工具', name: 'ai-xiaolv' },
  { label: 'AI表格处理', name: 'ai-biaoge' },
  { label: 'AI会议工具', name: 'ai-huiyi' }
]

// 添加AI设计工具的二级菜单
const designToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI Logo', name: 'ai-logo' },
  { label: 'AI设计工具', name: 'ai-design1' },
  { label: 'AI 3D建模', name: 'ai-3djianmo' },
  { label: 'AI界面工具', name: 'ai-uidesign' },
  { label: 'AI头像生成', name: 'ai-touxiang' },
  { label: 'AI模特生成', name: 'ai-mote' },
  { label: 'AI室内生成', name: 'ai-shinei' },
  { label: 'AI建筑设计', name: 'ai-jianzhu' }
]

// 添加AI开发工具的二级菜单
const devToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI低代码', name: 'ai-daima' },
  { label: 'AI编程工具', name: 'ai-biancheng' }
]

// 添加AI学习平台的二级菜单
const learnToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI学习网站', name: 'ai-xuexiwangzhan' },
  { label: 'AI学习指南', name: 'ai-zhinan' }
]

// 添加AI平台网站的二级菜单
const platformToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI大模型', name: 'ai-damoxing' },
  { label: 'AI元宇宙', name: 'ai-yuzhou' },
  { label: 'AI开放平台', name: 'ai-open' },
  { label: 'AI算力平台', name: 'ai-suanli' },
  { label: 'AI管理机构', name: 'ai-guanli' }
]

// 添加AI电商工具的二级菜单
const ecommerceToolTabs = [
  { label: '全部', name: 'all' },
  { label: 'AI商品工具', name: 'ai-shangpin' },
  { label: 'AI模特生成', name: 'ai-mote' }
]

const sortOptions = [
  { label: '热门推荐', name: 'hot' },
  { label: '最新发布', name: 'newest' },
  { label: '评分最高', name: 'rating' },
  { label: '访问最多', name: 'views' },
  { label: '最受欢迎', name: 'popular' }
]

const hotToolTabs = [
  { label: '全部', name: 'all' },
  { label: '常用推荐', name: 'changyongtuijian' }
]

const currentToolTabs = computed(() => {
  return activeTab.value === 'hot' ? hotToolTabs :
    activeTab.value === 'text' ? textToolTabs :
      activeTab.value === 'draw' ? drawToolTabs :
        activeTab.value === 'image' ? imageToolTabs :
          activeTab.value === 'video' ? videoToolTabs :
            activeTab.value === 'audio' ? audioToolTabs :
              activeTab.value === 'office' ? officeToolTabs :
                activeTab.value === 'design' ? designToolTabs :
                  activeTab.value === 'dev' ? devToolTabs :
                    activeTab.value === 'learn' ? learnToolTabs :
                      activeTab.value === 'platform' ? platformToolTabs :
                        activeTab.value === 'ecommerce' ? ecommerceToolTabs :
                          []
})

const handleTabClick = () => {
  activeTextTab.value = 'all' // 切换主标签时重置二级标签为"全部"
  refreshList()
}

const handleTextTabChange = (tab: string) => {
  activeTextTab.value = tab
  currentPage.value = 1

  // 如果是"全部"分类，每个分类显示前20个
  if (tab === 'all') {
    const limitedCategories = originalCategories.value.map((category: Category) => {
      const sortedTools = [...category.tools].sort((a, b) => {
        const aScore = Number(a.rating) * 0.4 + Number(a.views.replace('万', '')) * 0.4
        const bScore = Number(b.rating) * 0.4 + Number(b.views.replace('万', '')) * 0.4
        return bScore - aScore
      })
      return {
        ...category,
        tools: sortedTools.slice(0, 20)
      }
    })
    aiCategories.value = limitedCategories
    return
  }

  // 根据选中的tab筛选对应分类的数据
  const selectedTab = tab.replace('ai-', '').replace('tishici', 'tishici').replace('moxing', 'moxing').replace('shequn', 'shequn')
  const filteredTools = originalCategories.value.flatMap(category =>
    category.tools.filter(tool => {
      // 如果是热门推荐标签，不需要过滤category
      if (activeTab.value === 'hot') {
        return true
      }
      return tool.category.toLowerCase() === selectedTab
    })
  )

  if (filteredTools.length > 0) {
    const currentTabs = activeTab.value === 'hot' ? hotToolTabs :
      activeTab.value === 'text' ? textToolTabs :
        activeTab.value === 'draw' ? drawToolTabs : []

    aiCategories.value = [{
      id: 1,
      name: currentTabs.find(t => t.name === tab)?.label || '分类工具',
      icon: activeTab.value === 'hot' ? 'Star' :
        activeTab.value === 'text' ? 'Document' :
          activeTab.value === 'draw' ? 'Brush' : 'Star',
      description: activeTab.value === 'hot' ? '常用AI工具推荐' : '分类工具列表',
      tools: filteredTools
    }]
  } else {
    aiCategories.value = []
  }
}

const handleSortChange = (sortType: string) => {
  currentSort.value = sortType

  // 根据不同排序方式处理数据
  const categories = JSON.parse(JSON.stringify(originalCategories.value))
  categories.forEach((category: Category) => {
    switch (sortType) {
      case 'hot':
        // 热门排序：综合考虑访问量、评分和时间
        category.tools.sort((a: Tool, b: Tool) => {
          const aScore = Number(a.rating) * 0.4 +
            Number(a.views.replace('万', '')) * 0.4 +
            (new Date(a.releaseDate || '').getTime()) * 0.2
          const bScore = Number(b.rating) * 0.4 +
            Number(b.views.replace('万', '')) * 0.4 +
            (new Date(b.releaseDate || '').getTime()) * 0.2
          return bScore - aScore
        })
        break
      case 'newest':
        // 最新排序
        category.tools.sort((a: Tool, b: Tool) => {
          return new Date(b.releaseDate || '').getTime() - new Date(a.releaseDate || '').getTime()
        })
        break
      case 'rating':
        // 评分排序
        category.tools.sort((a: Tool, b: Tool) => Number(b.rating) - Number(a.rating))
        break
      case 'views':
        // 访问量排序
        category.tools.sort((a: Tool, b: Tool) => {
          return Number(b.views.replace('万', '')) - Number(a.views.replace('万', ''))
        })
        break
      case 'popular':
        // 最受欢迎：综合评分和访问量
        category.tools.sort((a: Tool, b: Tool) => {
          const aScore = Number(a.rating) * 0.5 + Number(a.views.replace('万', '')) * 0.5
          const bScore = Number(b.rating) * 0.5 + Number(b.views.replace('万', '')) * 0.5
          return bScore - aScore
        })
        break
    }
  })

  aiCategories.value = categories
  refreshList()
}

const refreshList = async () => {
  if (loading.value) return

  loading.value = true
  currentPage.value = 1

  try {
    // 清理过期缓存
    cleanExpiredCache()

    const newCategories = await getAIWritingListApi(currentPage.value, pageSize.value)
    if (newCategories && newCategories.length > 0) {
      // 保存原始数据
      originalCategories.value = JSON.parse(JSON.stringify(newCategories))

      // 如果是"全部"分类，需要限制每个分类的数量
      if (activeTextTab.value === 'all') {
        const limitedCategories = newCategories.map(category => ({
          ...category,
          tools: category.tools.slice(0, 20)
        }))
        aiCategories.value = limitedCategories
      } else {
        // 如果是特定分类，调用handleTextTabChange进行筛选
        handleTextTabChange(activeTextTab.value)
      }

      hasMore.value = false
      ElMessage.success('数据更新成功')
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const visitTool = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer')
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return ''
    }
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 30) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  } catch (error) {
    console.error('日期格式化错误:', error)
    return ''
  }
}

const getAIWritingListApi = async (page = 1, limit = 15) => {
  try {
    isInitialLoading.value = true;

    const config = {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Referer': 'https://www.88sheji.cn/',
        'Origin': 'https://www.88sheji.cn'
      },
      timeout: 15000,
      withCredentials: true
    };

    let requests: Promise<any>[] = [];

    if (activeTab.value === 'hot') {
      requests = [
        axios.get('/api/favorites/changyongtuijian', config)
      ]
    } else if (activeTab.value === 'text') {
      requests = [
        axios.get('/api/favorites/ai-xiezuo', config),
        axios.get('/api/favorites/ai-office', config),
        axios.get('/api/favorites/ai-lunwen', config),
        axios.get('/api/favorites/ai-jiance', config),
        axios.get('/api/favorites/ai-jiqiren', config),
        axios.get('/api/favorites/ai-prompt', config)
      ]
    } else if (activeTab.value === 'draw') {
      requests = [
        axios.get('/api/favorites/ai-huihua', config),
        axios.get('/api/favorites/tishici', config),
        axios.get('/api/favorites/moxing', config),
        axios.get('/api/favorites/ai-shequn', config)
      ]
    } else if (activeTab.value === 'image') {
      requests = [
        axios.get('/api/favorites/ai-zenqiang', config),
        axios.get('/api/favorites/ai-qushuiyin', config),
        axios.get('/api/favorites/ai-xiugai', config),
        axios.get('/api/favorites/ai-fangda', config),
        axios.get('/api/favorites/ai-mote', config),
        axios.get('/api/favorites/ai-tixiang', config),
        axios.get('/api/favorites/ai-koutu', config),
        axios.get('/api/favorites/ai-touxiang', config)
      ]
    } else if (activeTab.value === 'video') {
      requests = [
        axios.get('/api/favorites/ai-shipinsc', config),
        axios.get('/api/favorites/ai-shipinkouxiang', config),
        axios.get('/api/favorites/ai-fanyi', config),
        axios.get('/api/favorites/ai-zongjie', config),
        axios.get('/api/favorites/ai-jianji', config),
        axios.get('/api/favorites/ai-wenan', config),
        axios.get('/api/favorites/ai-huanlian', config),
        axios.get('/api/favorites/ai-shuziren', config),
        axios.get('/api/favorites/ai-shipinqsy', config),
        axios.get('/api/favorites/ai-shipinzengqiang', config)
      ]
    } else if (activeTab.value === 'audio') {
      requests = [
        axios.get('/api/favorites/ai-yinpinzhizuo', config),
        axios.get('/api/favorites/ai-wenzizy', config),
        axios.get('/api/favorites/ai-yinpinkelong', config),
        axios.get('/api/favorites/ai-renshengfl', config),
        axios.get('/api/favorites/ai-geshou', config)
      ]
    } else if (activeTab.value === 'office') {
      requests = [
        axios.get('/api/favorites/ai-ppt', config),
        axios.get('/api/favorites/ai-wendang', config),
        axios.get('/api/favorites/ai-siwei', config),
        axios.get('/api/favorites/ai-xiaolv', config),
        axios.get('/api/favorites/ai-biaoge', config),
        axios.get('/api/favorites/ai-huiyi', config)
      ]
    } else if (activeTab.value === 'design') {
      requests = [
        axios.get('/api/favorites/ai-logo', config),
        axios.get('/api/favorites/ai-design1', config),
        axios.get('/api/favorites/ai-3djianmo', config),
        axios.get('/api/favorites/ai-uidesign', config),
        axios.get('/api/favorites/ai-touxiang', config),
        axios.get('/api/favorites/ai-mote', config),
        axios.get('/api/favorites/ai-shinei', config),
        axios.get('/api/favorites/ai-jianzhu', config)
      ]
    } else if (activeTab.value === 'dev') {
      requests = [
        axios.get('/api/favorites/ai-daima', config),
        axios.get('/api/favorites/ai-biancheng', config)
      ]
    } else if (activeTab.value === 'learn') {
      requests = [
        axios.get('/api/favorites/ai-xuexiwangzhan', config),
        axios.get('/api/favorites/ai-zhinan', config)
      ]
    } else if (activeTab.value === 'platform') {
      requests = [
        axios.get('/api/favorites/ai-damoxing', config),
        axios.get('/api/favorites/ai-yuzhou', config),
        axios.get('/api/favorites/ai-open', config),
        axios.get('/api/favorites/ai-suanli', config),
        axios.get('/api/favorites/ai-guanli', config)
      ]
    } else if (activeTab.value === 'ecommerce') {
      requests = [
        axios.get('/api/favorites/ai-shangpin', config),
        axios.get('/api/favorites/ai-mote', config)
      ]
    }

    const responses = await Promise.all(requests);

    // 检查响应数据
    if (!responses.some(res => res.data)) {
      throw new Error('获取页面数据失败');
    }

    // 修改parseToolsData函数
    const parseToolsData = (html: any, category: string) => {
      if (!html) return [];

      try {
        // 如果返回的是 JSON 数据
        if (typeof html === 'object' && html !== null) {
          const data = html.data || [];
          return Array.isArray(data) ? data : [];
        }

        // 如果返回的是 HTML
        const $ = cheerio.load(html);
        return $('.z-siteitems-hover').map((i, card) => {
          try {
            const $card = $(card);

            const title = $card.find('.z-siteitems-sitename').text().trim().replace('N', '') ||
              $card.find('a').attr('title') ||
              '未知工具'

            const description = $card.find('.z-siteitems-siteinc').text().trim() ||
              '暂无描述'

            const logo = $card.find('img').data('src') ||
              $card.find('img').attr('src') ||
              'https://cdn.fsuied.com/tools/default-logo.png'

            const url = $card.find('a').attr('href') || '#'

            const rating = $card.find('.z-siteitems-ranknum').text().trim().replace('分', '') || '4.5'

            const views = Math.floor(Math.random() * 500 + 1)

            // 修改发布时间的提取逻辑
            let releaseDate = ''
            const timeText = $card.find('.d-none.d-lg-block').text().trim()
            const dateMatch = timeText.match(/发布时间：(\d{4}-\d{2}-\d{2})/)
            if (dateMatch && dateMatch[1]) {
              releaseDate = dateMatch[1]
            }

            return {
              id: `${category}-${Date.now()}-${i}`,
              name: title,
              description: description,
              category: category,
              type: 'primary',
              views: `${views}万`,
              rating: rating,
              url: url,
              version: '1.0',
              releaseDate: releaseDate,
              logo: logo as string,
              keywords: [],
              downloads: 0
            }
          } catch (err) {
            console.error('解析工具数据失败:', err)
            return null
          }
        }).get().filter(Boolean)
      } catch (error) {
        console.error('解析数据失败:', error)
        return []
      }
    };

    let result: Category[] = [];
    if (activeTab.value === 'hot') {
      result = [{
        id: 1,
        name: '热门推荐',
        icon: 'Star',
        description: '常用AI工具推荐',
        tools: parseToolsData(responses[0].data, 'hot')
      }]
    } else if (activeTab.value === 'text') {
      result = [
        {
          id: 1,
          name: 'AI写作工具',
          icon: 'Document',
          description: '智能写作、文本生成',
          tools: parseToolsData(responses[0].data, 'xiezuo')
        },
        {
          id: 2,
          name: 'AI办公效率',
          icon: 'Briefcase',
          description: '文档处理、效率工具',
          tools: parseToolsData(responses[1].data, 'office')
        },
        {
          id: 3,
          name: 'AI论文工具',
          icon: 'Document',
          description: '论文写作、润色、查重',
          tools: parseToolsData(responses[2].data, 'lunwen')
        },
        {
          id: 4,
          name: 'AI内容检测',
          icon: 'Search',
          description: '文本检测、内容审核',
          tools: parseToolsData(responses[3].data, 'jiance')
        },
        {
          id: 5,
          name: 'AI机器人',
          icon: 'ChatLineRound',
          description: '智能对话、自动回复',
          tools: parseToolsData(responses[4].data, 'jiqiren')
        },
        {
          id: 6,
          name: 'AI提示词',
          icon: 'ChatDotRound',
          description: 'Prompt提示词、优化',
          tools: parseToolsData(responses[5].data, 'prompt')
        }
      ]
    } else if (activeTab.value === 'draw') {
      result = [
        {
          id: 1,
          name: 'AI绘画工具',
          icon: 'Brush',
          description: 'AI绘画、图像生成',
          tools: parseToolsData(responses[0].data, 'huihua')
        },
        {
          id: 2,
          name: 'AI绘画提示',
          icon: 'ChatDotRound',
          description: '绘画提示词、模板',
          tools: parseToolsData(responses[1].data, 'tishici')
        },
        {
          id: 3,
          name: 'AI绘画模型',
          icon: 'Monitor',
          description: '绘画模型、预设',
          tools: parseToolsData(responses[2].data, 'moxing')
        },
        {
          id: 4,
          name: 'AI绘画社区',
          icon: 'User',
          description: '绘画社区、资源',
          tools: parseToolsData(responses[3].data, 'shequn')
        }
      ]
    } else if (activeTab.value === 'image') {
      result = [
        {
          id: 1,
          name: 'AI图像增强',
          icon: 'Picture',
          description: '图片增强、优化',
          tools: parseToolsData(responses[0].data, 'zenqiang')
        },
        {
          id: 2,
          name: 'AI图去水印',
          icon: 'Picture',
          description: '去除图片水印',
          tools: parseToolsData(responses[1].data, 'qushuiyin')
        },
        {
          id: 3,
          name: 'AI图片修改',
          icon: 'Picture',
          description: '图片编辑、修改',
          tools: parseToolsData(responses[2].data, 'xiugai')
        },
        {
          id: 4,
          name: 'AI无损放大',
          icon: 'ZoomIn',
          description: '图片无损放大',
          tools: parseToolsData(responses[3].data, 'fangda')
        },
        {
          id: 5,
          name: 'AI模特生成',
          icon: 'User',
          description: '虚拟模特生成',
          tools: parseToolsData(responses[4].data, 'mote')
        },
        {
          id: 6,
          name: 'AI图象处理',
          icon: 'Picture',
          description: '图片智能处理',
          tools: parseToolsData(responses[5].data, 'tixiang')
        },
        {
          id: 7,
          name: 'AI图片抠图',
          icon: 'Crop',
          description: '智能抠图、背景移除',
          tools: parseToolsData(responses[6].data, 'koutu')
        },
        {
          id: 8,
          name: 'AI头像生成',
          icon: 'User',
          description: '智能头像生成',
          tools: parseToolsData(responses[7].data, 'touxiang')
        }
      ]
    } else if (activeTab.value === 'video') {
      result = [
        {
          id: 1,
          name: 'AI视频生成',
          icon: 'VideoPlay',
          description: '智能视频生成',
          tools: parseToolsData(responses[0].data, 'shipinsc')
        },
        {
          id: 2,
          name: 'AI视频抠像',
          icon: 'VideoPlay',
          description: '视频抠像处理',
          tools: parseToolsData(responses[1].data, 'shipinkouxiang')
        },
        {
          id: 3,
          name: 'AI字幕翻译',
          icon: 'Document',
          description: '视频字幕翻译',
          tools: parseToolsData(responses[2].data, 'fanyi')
        },
        {
          id: 4,
          name: 'AI视频总结',
          icon: 'Document',
          description: '视频内容总结',
          tools: parseToolsData(responses[3].data, 'zongjie')
        },
        {
          id: 5,
          name: 'AI视频剪辑',
          icon: 'Scissors',
          description: '智能视频剪辑',
          tools: parseToolsData(responses[4].data, 'jianji')
        },
        {
          id: 6,
          name: 'AI视频文案',
          icon: 'Document',
          description: '视频文案生成',
          tools: parseToolsData(responses[5].data, 'wenan')
        },
        {
          id: 7,
          name: 'AI视频换脸',
          icon: 'User',
          description: '视频人物换脸',
          tools: parseToolsData(responses[6].data, 'huanlian')
        },
        {
          id: 8,
          name: 'AI虚拟数字人',
          icon: 'User',
          description: '虚拟人物生成',
          tools: parseToolsData(responses[7].data, 'shuziren')
        },
        {
          id: 9,
          name: 'AI视频去水印',
          icon: 'Picture',
          description: '视频水印去除',
          tools: parseToolsData(responses[8].data, 'shipinqsy')
        },
        {
          id: 10,
          name: 'AI视频画质增强',
          icon: 'Picture',
          description: '视频画质优化',
          tools: parseToolsData(responses[9].data, 'shipinzengqiang')
        }
      ]
    } else if (activeTab.value === 'audio') {
      result = [
        {
          id: 1,
          name: 'AI音频制作',
          icon: 'Headset',
          description: '智能音频制作',
          tools: parseToolsData(responses[0].data, 'yinpinzhizuo')
        },
        {
          id: 2,
          name: 'AI文字转音',
          icon: 'Document',
          description: '文字转语音',
          tools: parseToolsData(responses[1].data, 'wenzizy')
        },
        {
          id: 3,
          name: 'AI音频克隆',
          icon: 'CopyDocument',
          description: '音频声音克隆',
          tools: parseToolsData(responses[2].data, 'yinpinkelong')
        },
        {
          id: 4,
          name: 'AI人声分离',
          icon: 'Switch',
          description: '人声背景分离',
          tools: parseToolsData(responses[3].data, 'renshengfl')
        },
        {
          id: 5,
          name: 'AI音乐歌手',
          icon: 'Microphone',
          description: 'AI歌手生成',
          tools: parseToolsData(responses[4].data, 'geshou')
        }
      ]
    } else if (activeTab.value === 'office') {
      result = [
        {
          id: 1,
          name: 'AI PPT',
          icon: 'Document',
          description: '智能PPT制作',
          tools: parseToolsData(responses[0].data, 'ppt')
        },
        {
          id: 2,
          name: 'AI文档工具',
          icon: 'Document',
          description: '智能文档处理',
          tools: parseToolsData(responses[1].data, 'wendang')
        },
        {
          id: 3,
          name: 'AI思维导图',
          icon: 'Connection',
          description: '智能思维导图',
          tools: parseToolsData(responses[2].data, 'siwei')
        },
        {
          id: 4,
          name: 'AI效率工具',
          icon: 'Timer',
          description: '办公效率提升',
          tools: parseToolsData(responses[3].data, 'xiaolv')
        },
        {
          id: 5,
          name: 'AI表格处理',
          icon: 'Grid',
          description: '智能表格处理',
          tools: parseToolsData(responses[4].data, 'biaoge')
        },
        {
          id: 6,
          name: 'AI会议工具',
          icon: 'VideoCamera',
          description: '智能会议助手',
          tools: parseToolsData(responses[5].data, 'huiyi')
        }
      ]
    } else if (activeTab.value === 'design') {
      result = [
        {
          id: 1,
          name: 'AI Logo',
          icon: 'Picture',
          description: '智能Logo设计',
          tools: parseToolsData(responses[0].data, 'logo')
        },
        {
          id: 2,
          name: 'AI设计工具',
          icon: 'Brush',
          description: '智能设计助手',
          tools: parseToolsData(responses[1].data, 'design1')
        },
        {
          id: 3,
          name: 'AI 3D建模',
          icon: 'Box',
          description: '3D模型生成',
          tools: parseToolsData(responses[2].data, '3djianmo')
        },
        {
          id: 4,
          name: 'AI界面工具',
          icon: 'Monitor',
          description: 'UI界面设计',
          tools: parseToolsData(responses[3].data, 'uidesign')
        },
        {
          id: 5,
          name: 'AI头像生成',
          icon: 'User',
          description: '智能头像制作',
          tools: parseToolsData(responses[4].data, 'touxiang')
        },
        {
          id: 6,
          name: 'AI模特生成',
          icon: 'User',
          description: '虚拟模特生成',
          tools: parseToolsData(responses[5].data, 'mote')
        },
        {
          id: 7,
          name: 'AI室内生成',
          icon: 'House',
          description: '室内场景设计',
          tools: parseToolsData(responses[6].data, 'shinei')
        },
        {
          id: 8,
          name: 'AI建筑设计',
          icon: 'OfficeBuilding',
          description: '建筑设计生成',
          tools: parseToolsData(responses[7].data, 'jianzhu')
        }
      ]
    } else if (activeTab.value === 'dev') {
      result = [
        {
          id: 1,
          name: 'AI低代码',
          icon: 'Monitor',
          description: '智能低代码开发',
          tools: parseToolsData(responses[0].data, 'daima')
        },
        {
          id: 2,
          name: 'AI编程工具',
          icon: 'Terminal',
          description: '智能编程助手',
          tools: parseToolsData(responses[1].data, 'biancheng')
        }
      ]
    } else if (activeTab.value === 'learn') {
      result = [
        {
          id: 1,
          name: 'AI学习网站',
          icon: 'Reading',
          description: 'AI在线学习平台',
          tools: parseToolsData(responses[0].data, 'xuexiwangzhan')
        },
        {
          id: 2,
          name: 'AI学习指南',
          icon: 'Document',
          description: 'AI学习教程指南',
          tools: parseToolsData(responses[1].data, 'zhinan')
        }
      ]
    } else if (activeTab.value === 'platform') {
      result = [
        {
          id: 1,
          name: 'AI大模型',
          icon: 'Monitor',
          description: '大规模语言模型',
          tools: parseToolsData(responses[0].data, 'damoxing')
        },
        {
          id: 2,
          name: 'AI元宇宙',
          icon: 'Connection',
          description: '虚拟世界平台',
          tools: parseToolsData(responses[1].data, 'yuzhou')
        },
        {
          id: 3,
          name: 'AI开放平台',
          icon: 'Platform',
          description: 'AI开放能力平台',
          tools: parseToolsData(responses[2].data, 'open')
        },
        {
          id: 4,
          name: 'AI算力平台',
          icon: 'CPU',
          description: 'AI计算资源平台',
          tools: parseToolsData(responses[3].data, 'suanli')
        },
        {
          id: 5,
          name: 'AI管理机构',
          icon: 'OfficeBuilding',
          description: 'AI监管与管理',
          tools: parseToolsData(responses[4].data, 'guanli')
        }
      ]
    } else if (activeTab.value === 'ecommerce') {
      result = [
        {
          id: 1,
          name: 'AI商品工具',
          icon: 'ShoppingCart',
          description: '智能商品处理',
          tools: parseToolsData(responses[0].data, 'shangpin')
        },
        {
          id: 2,
          name: 'AI模特生成',
          icon: 'User',
          description: '虚拟模特生成',
          tools: parseToolsData(responses[1].data, 'mote')
        }
      ]
    }

    // 存入缓存
    dataCache.value[`${activeTab.value}-${activeTextTab.value}-${currentSort.value}`] = {
      data: result,
      timestamp: Date.now()
    }
    console.log('数据已缓存:', `${activeTab.value}-${activeTextTab.value}-${currentSort.value}`)

    return result
  } catch (error: any) {
    console.error('获取数据失败:', error)

    if (error.response) {
      console.error('Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error('Error Request:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }

    ElMessage.error(
      error.code === 'ECONNABORTED' ? '请求超时，请检查网络连接' :
        error.response?.status === 404 ? '接口不存在，请检查API配置' :
          error.response?.status === 403 ? '没有访问权限，请检查接口认证' :
            error.message || '获取数据失败'
    );

    return []
  } finally {
    isInitialLoading.value = false;
  }
}

const parseToolsData = (html: string, category: string) => {
  if (!html) return []

  try {
    // 如果返回的是 JSON 数据
    if (typeof html === 'object' && html !== null) {
      return html.data || []
    }

    // 如果返回的是 HTML
    const $ = cheerio.load(html)
    return $('.z-siteitems-hover').map((i, card) => {
      try {
        const $card = $(card)

        const title = $card.find('.z-siteitems-sitename').text().trim().replace('N', '') ||
          $card.find('a').attr('title') ||
          '未知工具'

        const description = $card.find('.z-siteitems-siteinc').text().trim() ||
          '暂无描述'

        const logo = $card.find('img').data('src') ||
          $card.find('img').attr('src') ||
          'https://cdn.fsuied.com/tools/default-logo.png'

        const url = $card.find('a').attr('href') || '#'

        const rating = $card.find('.z-siteitems-ranknum').text().trim().replace('分', '') || '4.5'

        const views = Math.floor(Math.random() * 500 + 1)

        // 修改发布时间的提取逻辑
        let releaseDate = ''
        const timeText = $card.find('.d-none.d-lg-block').text().trim()
        const dateMatch = timeText.match(/发布时间：(\d{4}-\d{2}-\d{2})/)
        if (dateMatch && dateMatch[1]) {
          releaseDate = dateMatch[1]
        }

        return {
          id: `${category}-${Date.now()}-${i}`,
          name: title,
          description: description,
          category: category,
          type: 'primary',
          views: `${views}万`,
          rating: rating,
          url: url,
          version: '1.0',
          releaseDate: releaseDate,
          logo: logo as string,
          keywords: [],
          downloads: 0
        }
      } catch (err) {
        console.error('解析工具数据失败:', err)
        return null
      }
    }).get().filter(Boolean)
  } catch (error) {
    console.error('解析数据失败:', error)
    return []
  }
}

// 检查缓存是否过期
const isCacheExpired = (timestamp: number) => {
  return Date.now() - timestamp > CACHE_EXPIRATION
}

// 清理过期缓存
const cleanExpiredCache = () => {
  Object.keys(dataCache.value).forEach(key => {
    if (isCacheExpired(dataCache.value[key].timestamp)) {
      delete dataCache.value[key]
    }
  })
}

const tabsRef = ref()
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// 检查是否可以滚动
const checkScroll = () => {
  if (!tabsRef.value?.$el) return
  const navScroll = tabsRef.value.$el.querySelector('.el-tabs__nav-scroll')
  if (!navScroll) return

  const { scrollLeft, scrollWidth, clientWidth } = navScroll
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth
}

// 修改滚动实现
const scrollTabs = (direction: 'left' | 'right') => {
  const navScroll = tabsRef.value.$el.querySelector('.el-tabs__nav-scroll')
  if (!navScroll) return

  const scrollAmount = navScroll.clientWidth * 0.8
  const currentScroll = navScroll.scrollLeft
  const targetScroll = direction === 'left'
    ? Math.max(0, currentScroll - scrollAmount)
    : currentScroll + scrollAmount

  navScroll.scrollTo({
    left: targetScroll,
    behavior: 'smooth'
  })

  setTimeout(checkScroll, 300)
}

// 修改触摸滑动实现
const handleTouchStart = (e: TouchEvent) => {
  const navScroll = tabsRef.value.$el.querySelector('.el-tabs__nav-scroll')
  if (!navScroll) return

  const touch = e.touches[0]
  const startX = touch.clientX
  const scrollLeft = navScroll.scrollLeft

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    const x = touch.clientX
    const walk = (startX - x) * 2
    navScroll.scrollLeft = scrollLeft + walk
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    navScroll.removeEventListener('touchmove', handleTouchMove)
    navScroll.removeEventListener('touchend', handleTouchEnd)
    checkScroll()
  }

  navScroll.addEventListener('touchmove', handleTouchMove)
  navScroll.addEventListener('touchend', handleTouchEnd)
}

// 修改事件监听
onMounted(() => {
  const navScroll = tabsRef.value?.$el.querySelector('.el-tabs__nav-scroll')
  if (navScroll) {
    navScroll.addEventListener('scroll', debounce(checkScroll, 100))
    navScroll.addEventListener('touchstart', handleTouchStart, { passive: false })
  }
  checkScroll()
  window.addEventListener('resize', debounce(checkScroll, 100))
})

onUnmounted(() => {
  const navScroll = tabsRef.value?.$el.querySelector('.el-tabs__nav-scroll')
  if (navScroll) {
    navScroll.removeEventListener('scroll', checkScroll)
    navScroll.removeEventListener('touchstart', handleTouchStart)
  }
  window.removeEventListener('resize', checkScroll)
})

// 监听标签变化
watch(activeTab, () => {
  nextTick(() => {
    checkScroll()
  })
})
</script>

<style scoped>
.ranking-container {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 0.75rem;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.ranking-tabs {
  flex-shrink: 0;
  margin-bottom: 1.25rem;
  position: relative;
  width: 100%;
}

.tabs-scroll-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.tabs-wrapper {
  flex: 1;
  overflow: hidden;
  margin: 0 40px;
  position: relative;
}

.ranking-tabs-inner {
  width: 100%;
}

.scroll-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.scroll-btn.left {
  left: 0;
}

.scroll-btn.right {
  right: 0;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 0 !important;
}

:deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

:deep(.el-tabs__nav-scroll::-webkit-scrollbar) {
  display: none;
}

:deep(.el-tabs__nav) {
  display: flex;
  white-space: nowrap;
  position: relative;
  transition: transform 0.3s;
  float: none;
}

:deep(.el-tabs__item) {
  flex-shrink: 0;
  padding: 0 1.5rem;
  height: 48px;
  line-height: 48px;
}

.tab-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
}

.tab-label .el-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: #3b82f6;
}

.tab-label span {
  font-size: 0.875rem;
  color: #64748b;
  transition: color 0.3s ease;
}

.tab-desc {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.125rem;
  transition: all 0.3s ease;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .ranking-container {
    padding: 0.75rem;
  }

  .tabs-wrapper {
    margin: 0 32px;
  }

  .scroll-btn {
    width: 28px;
    height: 28px;
  }

  :deep(.el-tabs__item) {
    padding: 0.5rem;
    height: auto;
    line-height: 1.2;
    font-size: 0.875rem;
  }

  .tab-label {
    padding: 0.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 60px;
  }

  .tab-label .el-icon {
    font-size: 1.125rem;
    margin-bottom: 0.25rem;
  }

  .tab-label span {
    font-size: 0.75rem;
    white-space: normal;
    word-break: break-word;
    line-height: 1.2;
  }

  .tab-desc {
    display: none;
  }

  /* 二级菜单移动端适配 */
  .sub-tabs-wrapper {
    padding: 0.5rem 0;
  }

  .tabs-container {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }

  .tab-item {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    white-space: nowrap;
  }

  .filter-container {
    flex-wrap: wrap;
    padding: 0.5rem;
    gap: 0.5rem;
  }

  .filter-label {
    width: 100%;
    margin-bottom: 0.25rem;
  }

  .filter-options {
    flex-wrap: wrap;
    width: 100%;
  }

  .filter-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}

@media screen and (max-width: 480px) {
  .ranking-container {
    padding: 0.5rem;
  }

  .tabs-wrapper {
    margin: 0 28px;
  }

  .scroll-btn {
    width: 24px;
    height: 24px;
  }

  :deep(.el-tabs__item) {
    padding: 0.375rem;
  }

  .tab-label {
    min-width: 50px;
  }

  .tab-label .el-icon {
    font-size: 1rem;
    margin-bottom: 0.125rem;
  }

  .tab-label span {
    font-size: 0.7rem;
  }

  /* 更小屏幕下的二级菜单适配 */
  .sub-tabs-wrapper {
    padding: 0.375rem 0;
  }

  .tabs-container {
    gap: 0.375rem;
  }

  .tab-item {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }

  .filter-container {
    padding: 0.375rem;
  }

  .filter-item {
    padding: 0.25rem 0.375rem;
    font-size: 0.7rem;
  }
}

/* 优化滚动体验 */
:deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 4px;
}

:deep(.el-tabs__nav-scroll::-webkit-scrollbar) {
  display: none;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__nav) {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  transition: transform 0.3s;
  float: none;
}

:deep(.el-tabs__active-bar) {
  height: 2px;
  border-radius: 1px;
  bottom: 0;
}

/* 滚动阴影效果 */
.ranking-tabs::before,
.ranking-tabs::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.ranking-tabs::before {
  left: 0;
  background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.ranking-tabs::after {
  right: 0;
  background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
}

.ranking-tabs[data-can-scroll-left="true"]::before {
  opacity: 1;
}

.ranking-tabs[data-can-scroll-right="true"]::after {
  opacity: 1;
}

/* 修改滚动检测逻辑 */
:deep(.el-tabs__nav-scroll) {
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

:deep(.el-tabs__nav) {
  display: flex;
  white-space: nowrap;
  position: relative;
  transition: transform 0.3s;
  float: none;
}

.ranking-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  position: relative;
  min-height: 200px;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  /* 修改为center以垂直居中对齐 */
  padding: 1.25rem;
  background: #fff;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  position: relative;
}

.ranking-item:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
}

.rank-number {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  margin-right: 1rem;
  /* 减小右边距 */
  position: relative;
  z-index: 1;
  align-self: center;
  /* 确保自身垂直居中 */
}

.rank-number::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: inherit;
  border-radius: inherit;
  filter: blur(4px);
  opacity: 0.4;
  z-index: -1;
}

.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: #fff;
}

.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
  color: #fff;
}

.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #b36a23 100%);
  color: #fff;
}

.rank-4,
.rank-5,
.rank-6 {
  background: linear-gradient(135deg, #4B79A1 0%, #283E51 100%);
  color: #fff;
  box-shadow: 0 4px 10px rgba(75, 121, 161, 0.2);
}

.rank-7,
.rank-8,
.rank-9,
.rank-10 {
  background: linear-gradient(135deg, #606c88 0%, #3f4c6b 100%);
  color: #fff;
  box-shadow: 0 4px 10px rgba(96, 108, 136, 0.2);
}

.tool-logo {
  width: 3rem;
  height: 3rem;
  margin-right: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  /* 确保自身垂直居中 */
}

.item-info {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-badges {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-description {
  font-size: 0.9375rem;
  color: #475569;
  margin-bottom: 0.75rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.item-tag {
  padding: 0.25rem 0.625rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 1rem;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.item-tag:hover {
  background: #e2e8f0;
  color: #3b82f6;
}

.item-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  align-items: center;
}

.item-detail>span {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.item-detail i {
  font-size: 1rem;
  color: #94a3b8;
}

.views,
.rating {
  color: #3b82f6;
  font-weight: 500;
}

.release-date {
  color: #64748b;
}

.price-tag,
.lang-tag,
.status-tag,
.status-tag.online,
.status-tag.maintenance,
.status-tag.offline {
  display: none;
}

.item-name {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.item-detail {
  font-size: 0.875rem;
  color: #64748b;
  display: flex;
  gap: 1rem;
}

.worth,
.score {
  color: #3b82f6;
  font-weight: 500;
}

.company {
  color: #64748b;
}

/* 添加动画效果 */
.ranking-item {
  animation: slideIn 0.3s ease-out forwards;
}

.ranking-item:nth-child(1) {
  animation-delay: 0.1s;
}

.ranking-item:nth-child(2) {
  animation-delay: 0.15s;
}

.ranking-item:nth-child(3) {
  animation-delay: 0.2s;
}

.ranking-item:nth-child(4) {
  animation-delay: 0.25s;
}

.ranking-item:nth-child(5) {
  animation-delay: 0.3s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.views,
.rating {
  color: #3b82f6;
  font-weight: 500;
}

.release-date {
  color: #64748b;
}

/* 确保AI产品榜的样式与其他榜单一致 */
.ranking-item .item-detail {
  display: flex;
  gap: 12px;
  font-size: 14px;
  color: #64748b;
}

/* 优化tab样式 */
:deep(.el-tabs__item) {
  font-size: 15px;
  color: #64748b;
  padding: 0 24px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s ease;
}

:deep(.el-tabs__item:hover) {
  color: #3b82f6;
}

:deep(.el-tabs__item.is-active) {
  color: #3b82f6;
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #3b82f6;
  height: 3px;
  border-radius: 3px;
}

.country {
  font-size: 12px;
  color: #64748b;
  margin-left: 8px;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
}

.change {
  font-weight: 500;
}

.change.up {
  color: #10b981;
}

.change.down {
  color: #ef4444;
}

.type {
  font-size: 12px;
  color: #64748b;
  margin-left: 8px;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 4px;
}

.category-header {
  margin: 1.25rem 0 0.75rem;
  padding-left: 0.5rem;
  border-left: 0.25rem solid #3B82F6;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.category-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
  display: block;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.item-description {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 1.5;
}

.version-tag {
  font-size: 12px;
  color: #3B82F6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.item-badges {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.type-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.type-badge.success {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
}

.type-badge.primary {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.type-badge.warning {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}

.type-badge.danger {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

.new-badge {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.1);
  border: 0.0625rem solid rgba(244, 63, 94, 0.2);
  padding: 0.125rem 0.625rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.75rem;
  display: inline-flex;
  align-items: center;
  height: 1.375rem;
}

.item-detail {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #64748b;
  align-items: center;
}

.item-detail i {
  margin-right: 4px;
}

.views,
.rating {
  display: flex;
  align-items: center;
  color: #6366f1;
}

.release-date {
  display: flex;
  align-items: center;
  color: #71717a;
}

/* 优化动画效果 */
.ranking-item {
  animation: slideIn 0.3s ease-out forwards;
  border: 1px solid #e4e4e7;
}

.ranking-item:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 二级tab样式优化 */
.sub-tabs-wrapper {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1.25rem;
}

.tabs-container {
  display: flex;
  gap: 8px;
}

.tab-item {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #64748b;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.tab-item.active {
  color: #3b82f6;
  background: #fff;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 筛选选项样式 */
.filter-container {
  margin-top: 0.75rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  border-top: 0.0625rem solid #e5e7eb;
}

.filter-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-right: 0.75rem;
}

.filter-options {
  display: flex;
  gap: 8px;
}

.filter-item {
  padding: 0.25rem 0.75rem;
  font-size: 0.8125rem;
  color: #64748b;
  background: transparent;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-item:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.filter-item.active {
  color: #3b82f6;
  background: #fff;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tool-logo {
  width: 3rem;
  height: 3rem;
  margin-right: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

/* 添加骨架屏样式 */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  animation: pulse 1s infinite;
}

.skeleton-rank {
  width: 1.75rem;
  height: 1.75rem;
  background: #e2e8f0;
  border-radius: 0.375rem;
  margin-right: 1rem;
}

.skeleton-logo {
  width: 3rem;
  height: 3rem;
  background: #e2e8f0;
  border-radius: 0.5rem;
  margin-right: 1rem;
}

.skeleton-content {
  flex: 1;
}

.skeleton-title {
  width: 12.5rem;
  height: 1.25rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-desc {
  width: 80%;
  height: 1rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-detail {
  display: flex;
  gap: 12px;
}

.skeleton-tag {
  width: 5rem;
  height: 0.875rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }

  100% {
    opacity: 1;
  }
}

.loading-more {
  padding: 16px;
  text-align: center;
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 16px;
}

.loading-text {
  color: #3b82f6;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  .loading {
    animation: rotate 1s linear infinite;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.no-more {
  text-align: center;
  padding: 1rem;
  color: #94a3b8;
}

.no-more-text {
  font-size: 0.875rem;
}

/* 添加顶部标签样式 */
.tab-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0;
}

.tab-label .el-icon {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: #3b82f6;
}

.tab-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
}

:deep(.el-tabs__item) {
  height: auto;
  line-height: 1.5;
  padding: 0 2rem;
}

/* 修改滚动条样式 */
.ranking-content::-webkit-scrollbar {
  width: 0.5rem;
}

.ranking-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 0.25rem;
}

.ranking-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 0.25rem;
}

.ranking-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 添加新的加载状态样式 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.el-loading-spinner) {
  .circular {
    width: 32px;
    height: 32px;
  }

  .el-loading-text {
    color: #3b82f6;
    font-size: 14px;
    margin-top: 8px;
  }
}

/* 优化加载动画 */
.skeleton-item {
  animation: shimmer 1.5s infinite linear;
  background: linear-gradient(90deg,
      #f0f0f0 0%,
      #f8f8f8 50%,
      #f0f0f0 100%);
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }

  100% {
    background-position: 200% 0;
  }
}

/* 优化移动端响应式 */
@media screen and (max-width: 768px) {
  .ranking-item {
    padding: 1rem;
  }

  .tool-logo {
    width: 2.5rem;
    height: 2.5rem;
  }

  .item-name {
    font-size: 0.875rem;
  }

  .item-description {
    font-size: 0.75rem;
    -webkit-line-clamp: 2;
  }

  .item-detail {
    font-size: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}

/* 优化过渡动画 */
.ranking-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 优化加载状态 */
.loading-more {
  padding: 1rem;
  text-align: center;
  background: linear-gradient(to right,
      transparent,
      rgba(59, 130, 246, 0.1),
      transparent);
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
}

.loading-text .loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 优化错误状态 */
.error-state {
  text-align: center;
  padding: 2rem;
  color: #ef4444;
}

.error-state .retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-state .retry-button:hover {
  background: #dc2626;
}

/* 优化滚动条 */
.ranking-content::-webkit-scrollbar {
  width: 6px;
}

.ranking-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.ranking-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.ranking-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 优化工具卡片 */
.tool-logo img {
  transition: transform 0.3s ease;
}

.ranking-item:hover .tool-logo img {
  transform: scale(1.05);
}

/* 优化标签样式 */
.item-tag {
  transition: all 0.2s ease;
}

.item-tag:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

/* 添加内容为空的状态 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
}

.empty-state-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-state-text {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.empty-state-subtext {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* 添加更新提示样式 */
.update-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  color: #3b82f6;
  font-size: 0.875rem;
}

.notice-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

@media screen and (max-width: 768px) {
  .update-notice {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
