<!--
* @file Home.vue
* @description 首页组件，展示工具分类和推荐工具
 * @copyright Tomda (https://www.tomda.top)
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-1-8
*
* 功能特性：
* 1. 热搜榜展示
* 2. 推荐工具展示（图片工具、文档工具、开发工具）
* 3. 文案工具展示（每日一言、随机文案）
* 4. 其他工具分类展示
* 5. 统一的卡片样式和交互效果
* 6. 响应式布局适配（支持多种屏幕尺寸）
* 7. 返回顶部功能
-->

<script setup lang="ts">
import { onMounted, ref, computed, nextTick, watch } from '@vue/runtime-core'
import { useToolsStore } from '@/store/modules/tools'
import { useRoute } from "vue-router"
import HotSearch from '@/components/HotSearch/HotSearch.vue'
import ToolIcon from '@/components/Tools/ToolIcon.vue'
import { getSitePublicConfig, type SitePublicConfig, type SiteSidebarCategoryMenu } from '@/services/siteConfig'
import { useToolRuntimeGate } from '@/composables/useToolRuntimeGate'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

// 初始化 store 和路由
const toolsStore = useToolsStore()
const route = useRoute()
const sidebarCategoryMenus = ref<SiteSidebarCategoryMenu[]>([])
const siteConfig = ref<SitePublicConfig | null>(null)
const { isToolDisabled, openToolEntry } = useToolRuntimeGate()
const defaultHomeSectionKeyMap: Record<string, string> = {
  'AI工具箱': 'ai',
  '设计工具': 'design',
  '图片处理': 'image',
  '办公工具': 'office',
  '生活常用': 'daily',
  '文案工具': 'copywriting',
  '潜能测试': 'psychology',
  '剪辑工具': 'video',
  '开发工具': 'dev',
  '摸鱼工具': 'slacking',
  '效率工具': 'efficiency'
}

interface HomeCategorySection {
  id: number | string
  title: string
  sectionKey: string
  list: ToolSubCategory[]
}

/**
 * 函数说明：获取工具分类数据，优先读取后台配置化工具分类
 */
const getToolsCate = async () => {
  try {
    await toolsStore.getToolCate()
  } catch (error: any) {
    console.error('Failed to get tool categories:', error)
  }
}

/**
 * 函数说明：读取后台侧栏分类菜单配置，用于同步首页分类区锚点 key
 */
const loadHomeSiteConfig = async () => {
  try {
    const config = await getSitePublicConfig({ forceRefresh: true })
    siteConfig.value = config
    sidebarCategoryMenus.value = config.sidebarCategoryMenus
  } catch (error) {
    console.error('Failed to get home site config:', error)
    siteConfig.value = null
    sidebarCategoryMenus.value = []
  }
}

/**
 * 函数说明：根据分类标题解析首页区块 key，优先与后台侧栏菜单 key 对齐，保证菜单锚点一致
 */
const resolveHomeSectionKey = (categoryTitle: string): string => {
  const normalizedTitle = String(categoryTitle || '').trim()
  const matchedMenu = sidebarCategoryMenus.value.find((menu) => String(menu.cateTitle || '').trim() === normalizedTitle)
  if (matchedMenu?.key) {
    return String(matchedMenu.key).trim()
  }
  if (defaultHomeSectionKeyMap[normalizedTitle]) {
    return defaultHomeSectionKeyMap[normalizedTitle]
  }
  return normalizedTitle
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'tools'
}

/**
 * 函数说明：提取首页热门工具列表，保持推荐区与后台热门工具配置一致
 */
const hotRecommendTools = computed<Tool[]>(() => {
  return toolsStore.recommends.filter((tool: Tool) => tool.cate === '热门工具')
})

/**
 * 函数说明：按后台工具分类动态构建首页分类区，避免前端模板写死分类顺序和名称
 */
const homeCategorySections = computed<HomeCategorySection[]>(() => {
  return toolsStore.cates
    .map((category: ToolCategory, index: number) => ({
      id: category.id || index + 1,
      title: category.title,
      sectionKey: resolveHomeSectionKey(category.title),
      list: Array.isArray(category.list) ? category.list : []
    }))
    .filter((section) => section.list.length > 0)
})

/**
 * 函数说明：处理工具点击事件，外链新开页，站内工具保留当前“新窗口使用”的原有行为
 */
const handleToolClick = async (item: Tool) => {
  await openToolEntry(item, {
    target: 'blank',
    action: 'open',
    source: 'home-tool-card'
  })
}

// 3D 效果状态
const mouseX = ref('50%')
const mouseY = ref('50%')

// 处理鼠标移动，实现 3D 效果
const handleMouseMove = (e: MouseEvent) => {
  const card = e.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  mouseX.value = `${x}px`
  mouseY.value = `${y}px`
}

// 处理鼠标离开，重置 3D 效果
const handleMouseLeave = () => {
  mouseX.value = '50%'
  mouseY.value = '50%'
}

// 获取卡片样式，用于 3D 效果
const getCardStyle = computed(() => {
  return {
    '--mouse-x': mouseX.value,
    '--mouse-y': mouseY.value
  }
})

/**
 * 函数说明：仅在路由明确指定 value 锚点时滚动，普通访问首页保持页面顶部。
 */
const scrollToRouteAnchor = async () => {
  const queryValue = route.query?.value
  const anchorId = typeof queryValue === 'string' ? queryValue.trim() : ''
  if (!anchorId) {
    return
  }
  await nextTick()
  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * 函数说明：首页初始化时加载工具分类、热门工具与后台菜单配置，并完成锚点定位
 */
const initHomePage = async () => {
  await Promise.all([
    getToolsCate(),
    toolsStore.getRecommends(),
    loadHomeSiteConfig()
  ])
  await scrollToRouteAnchor()
}

onMounted(() => {
  void initHomePage()
})

watch(
  () => [route.query?.value, toolsStore.cates.length, sidebarCategoryMenus.value.length],
  () => {
    void scrollToRouteAnchor()
  }
)
</script>

<template>
  <div class="home-container">
    <div class="scroll-container">
      <!-- 热搜榜 -->
      <div class="mt-4 mb-6">
        <HotSearch />
      </div>

      <!-- 推荐工具 -->
      <div id="recommend">
        <!-- 热门工具 -->
        <div id="recommend-hot">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">热门工具</div>
            <div class="title-line"></div>
          </div>
          <div class="grid gap-4">
            <div
              v-for="(item, index) in hotRecommendTools"
              :key="index"
              class="tool-card-container"
              @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave"
            >
              <div
                :class="[
                  'tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer',
                  { 'tool-card--disabled': isToolDisabled(item) }
                ]"
                :style="getCardStyle"
                @click="handleToolClick(item)"
              >
                <div v-if="isToolDisabled(item)" class="tool-disabled-tag">已停用</div>
                <div class="flex items-center border-b pb-2 relative z-10">
                  <ToolIcon :icon="item.logo" />
                  <div class="flex flex-col ml-2 w-full">
                    <div class="flex flex-col">
                      <div class="font-semibold text-lg truncate mb-1">{{ item.title }}</div>
                    </div>
                    <div class="flex justify-between mt-1">
                      <el-text size="small" class="truncate">{{ item.cate }}</el-text>
                    </div>
                  </div>
                </div>
                <div class="flex mt-2 relative z-10">
                  <el-text class="truncate text-[14px] text-[#666] w-full">{{ item.desc }}</el-text>
                </div>
                <!-- 卡片光效 -->
                <div class="card-shine"></div>
                <!-- 添加箭头元素 -->
                <div class="card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

        <section
          v-for="section in homeCategorySections"
          :key="section.sectionKey"
          :id="section.sectionKey"
        >
          <div class="section-title">
            <div class="title-text">{{ section.title }}</div>
            <div class="title-line"></div>
          </div>
          <div
            v-for="(category, categoryIndex) in section.list"
            :key="category.id || `${section.sectionKey}-${categoryIndex}`"
          >
            <div :id="`${section.sectionKey}-${category.id || categoryIndex + 1}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div
                v-for="item in category.list"
                :key="item.id"
                :id="`tool-${item.id}`"
                class="tool-card-container"
                @mousemove="handleMouseMove"
                @mouseleave="handleMouseLeave"
              >
                <div
                  :class="[
                    'tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer',
                    { 'tool-card--disabled': isToolDisabled(item) }
                  ]"
                  :style="getCardStyle"
                  @click="handleToolClick(item)"
                >
                  <div v-if="isToolDisabled(item)" class="tool-disabled-tag">已停用</div>
                  <div class="flex items-center border-b pb-2 relative z-10">
                    <ToolIcon v-if="item.logo" :icon="item.logo" />
                    <div class="flex flex-col ml-2 w-full">
                      <div class="flex flex-col">
                        <div class="font-semibold text-lg truncate mb-1">{{ item.title }}</div>
                      </div>
                      <div class="flex justify-between mt-1">
                        <el-text size="small" class="truncate">{{ item.cate }}</el-text>
                      </div>
                    </div>
                  </div>
                  <div class="flex mt-2 relative z-10">
                    <el-text class="truncate text-[14px] text-[#666] w-full">{{ item.desc }}</el-text>
                  </div>
                  <div class="card-shine"></div>
                  <div class="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <!-- 返回顶部 -->
        <el-backtop :right="10" :bottom="50" />
      </div>
    </div>
</template>

<style scoped>
.tool-card-container {
  position: relative;
}

.tool-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 1rem;
}

.tool-card:hover {
  transform: translateY(-8px) scale(1.01);
  border-color: #6C54FF;
  box-shadow: 0 10px 20px rgba(108, 84, 255, 0.1);
}

.tool-card--disabled {
  opacity: 0.62;
  cursor: not-allowed;
  filter: grayscale(0.18);
}

.tool-card--disabled:hover {
  transform: none;
  border-color: #e5e7eb;
  box-shadow: none;
}

.tool-disabled-tag {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  z-index: 12;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

/* 移动端样式优化 */
@media screen and (max-width: 768px) {
  .home-container {
    padding: 0 0 1.5rem;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .tool-card {
    padding: 0.75rem;
    margin-bottom: 0;
    border-radius: 0.875rem;
  }

  .tool-card .flex.items-center {
    align-items: flex-start;
    padding-bottom: 0.45rem;
    margin-bottom: 0.45rem;
  }

  .tool-card .font-semibold.text-lg {
    width: 100%;
    min-height: 2.3em;
    font-size: 0.92rem;
    line-height: 1.25;
    word-break: break-word;
    white-space: normal;
  }

  .tool-card :deep(.tool-icon) {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;
    min-height: 2rem;
  }

  .tool-card :deep(.icon-wrapper),
  .tool-card :deep(.icon-image),
  .tool-card :deep(.icon-placeholder) {
    width: 1.15rem;
    height: 1.15rem;
  }

  .tool-card .ml-2 {
    margin-left: 0.45rem;
  }

  .tool-card .el-text {
    line-height: 1.35;
  }

  .tool-card .flex.mt-2 {
    margin-top: 0.45rem;
  }

  .tool-card .flex.mt-2 .el-text {
    display: -webkit-box;
    min-height: 2.55em;
    overflow: hidden;
    font-size: 0.76rem;
    white-space: normal;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .tool-card .text-sm {
    font-size: 0.75rem;
  }

  .card-arrow {
    display: none;
  }

  .section-title {
    margin: 1.5rem 0 0.75rem;
    font-size: 1.05rem;
  }

  .sub-title {
    margin: 1rem 0 0.75rem;
  }

  .scroll-container {
    padding: 0;
  }
}

/* 平板端样式优化 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .tool-card {
    padding: 1rem;
  }

  .tool-card .flex.items-center {
    padding-bottom: 0.625rem;
    margin-bottom: 0.625rem;
  }

  .tool-card .font-semibold.text-lg {
    font-size: 1.25rem;
    line-height: 1.5;
    word-break: break-word;
    white-space: normal;
  }

  .tool-card .text-sm {
    font-size: 1.125rem;
  }
}

/* 桌面端样式优化 */
@media screen and (min-width: 1025px) {
  .tool-card {
    padding: 1.25rem;
  }

  .tool-card .flex.items-center {
    padding-bottom: 0.625rem;
    margin-bottom: 0.625rem;
  }

  .tool-card .font-semibold.text-lg {
    font-size: 1.125rem;
    line-height: 1.5;
    word-break: break-word;
    white-space: normal;
  }

  .tool-card .text-sm {
    font-size: 1rem;
  }
}

/* 调整网格布局的响应式断点 */
.grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* 调整标题布局，预留箭头空间 */
.tool-card .flex.items-center {
  padding-right: 0.2rem;
}

.tool-card .font-semibold.text-lg {
  width: calc(100% - 0.75rem);
  min-height: 1.5em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-card .flex.justify-between {
  margin-top: auto;
}

/* 标题样式优化 */
.section-title {
  display: flex;
  align-items: center;
  margin: 2rem 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.title-text {
  position: relative;
  z-index: 1;
  padding-right: 1rem;
  background: #f5f7fa;
}

.title-line {
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.sub-title {
  display: flex;
  align-items: center;
  margin: 1.5rem 0 1rem;
  padding-left: 0.5rem;
}

.sub-title-indicator {
  width: 4px;
  height: 16px;
  background: #6C54FF;
  border-radius: 2px;
  margin-right: 0.5rem;
}

.sub-title-text {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
}

.home-container {
  padding: 0 1rem 2rem;
}

/* 推荐区域样式 */
#recommend {
  scroll-margin-top: 2rem;
}

/* 卡片光效动画 */
.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at var(--mouse-x) var(--mouse-y),
      rgba(108, 84, 255, 0.08),
      transparent 40%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 1;
}

.tool-card:hover .card-shine {
  opacity: 1;
}

/* 箭头样式 */
.card-arrow {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  color: #999;
  opacity: 0;
  transform: translate(-10px, 10px);
  transition: all 0.3s ease;
}

.tool-card:hover .card-arrow {
  opacity: 1;
  transform: translate(0, 0);
  color: #6C54FF;
}

/* 滚动条容器样式 */
.scroll-container {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 隐藏滚动条但保持功能 */
.scroll-container::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}

@media screen and (max-width: 768px) {
  .home-container {
    padding-left: 0;
    padding-right: 0;
  }

  .scroll-container {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
