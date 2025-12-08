<!--
* @file Home.vue
* @description 首页组件，展示工具分类和推荐工具
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
import { onMounted, ref, computed } from '@vue/runtime-core'
import { useRouter } from "vue-router"
import { useToolsStore } from '@/store/modules/tools'
import { useRoute } from "vue-router"
import HotSearch from '@/components/HotSearch/HotSearch.vue'
import ToolIcon from '@/components/Tools/ToolIcon.vue'
import { Tool, ToolCategory } from '@/store/modules/tools'

// 初始化 store 和路由
const toolsStore = useToolsStore()
const route = useRoute()
const router = useRouter()

// 获取工具分类数据
const getToolsCate = async () => {
  try {
    await toolsStore.getToolCate()
  } catch (error: any) {
    console.error('Failed to get tool categories:', error)
  }
}

// 处理工具点击事件
const handleToolClick = (item: Tool) => {
  if (item.isExternal) {
    window.open(item.url, '_blank')
  } else {
    window.open(`${window.location.origin}${item.url}`, '_blank')
  }
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

// 组件挂载时初始化数据和滚动位置
onMounted(() => {
  getToolsCate()
  toolsStore.getRecommends()

  // 根据路由参数滚动到指定位置
  if (route.query && route.query.value) {
    document?.querySelector('#' + `${route.query.value}`)?.scrollIntoView();
  } else {
    document?.querySelector('#collect')?.scrollIntoView()
  }
})
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
            <div v-for="(item, index) in toolsStore.recommends.filter((tool: Tool) =>
              tool.cate === '热门工具')" :key="index" class="tool-card-container" @mousemove="handleMouseMove"
              @mouseleave="handleMouseLeave">
              <div
                class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- AI工具箱区域 -->
        <div id="ai">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">AI工具箱</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === 'AI工具箱')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`ai-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 设计工具区域 -->
        <div id="design">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">设计工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '设计工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`design-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 图片处理区域 -->
        <div id="image-processing">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">图片处理</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '图片处理')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`image-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 办公工具区域 -->
        <div id="office">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">办公工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '办公工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`office-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 文案工具区域 -->
        <div id="copywriting">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">文案工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '文案工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`copywriting-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 潜能测试区域 -->
        <div id="psychology">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">潜能测试</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '潜能测试')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`psychology-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 开发工具区域 -->
        <div id="dev">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">开发工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '开发工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`dev-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 摸鱼工具区域 -->
        <div id="slacking">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">摸鱼工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '摸鱼工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`slacking-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 效率工具区域 -->
        <div id="efficiency">
          <!-- 主标题样式 -->
          <div class="section-title">
            <div class="title-text">效率工具</div>
            <div class="title-line"></div>
          </div>
          <div v-for="category in toolsStore.cates.find((cate: ToolCategory) => cate.title === '效率工具')?.list"
            :key="category.id">
            <!-- 子标题样式 -->
            <div :id="`efficiency-${category.id}`" class="sub-title">
              <div class="sub-title-indicator"></div>
              <div class="sub-title-text">{{ category.title }}</div>
            </div>
            <div class="grid gap-4">
              <div v-for="item in category.list" :key="item.id" :id="`tool-${item.id}`" class="tool-card-container"
                @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
                <div
                  class="tool-card flex flex-col border-solid rounded-2xl border-gray p-5 bg-white hover:shadow-md hover:-translate-y-2 duration-300 cursor-pointer"
                  :style="getCardStyle" @click="handleToolClick(item)">
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

        <!-- 返回顶部 -->
        <el-backtop :right="10" :bottom="50" />
      </div>
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

/* 移动端样式优化 */
@media screen and (max-width: 768px) {
  .tool-card {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }

  .tool-card .flex.items-center {
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .tool-card .font-semibold.text-lg {
    font-size: 1.5rem;
    line-height: 1.5;
    word-break: break-word;
    white-space: normal;
  }

  .tool-card .text-sm {
    font-size: 1.125rem;
  }

  .card-arrow {
    display: none;
  }

  .section-title {
    margin: 1.5rem 0 0.75rem;
    font-size: 1.5rem;
  }

  .sub-title {
    margin: 1rem 0 0.75rem;
  }

  .scroll-container {
    padding: 0 0.75rem;
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
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
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
</style>
