/**
* @file DesignIcon.vue
* @description 设计师图标工具，提供常用设计图标下载和预览
* @copyright Tomda (https://www.tomda.top)
*/

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-6 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4 text-gray-900">免费图标下载</h2>
          <p class="text-base text-gray-500">提供常用图标下载和预览，支持多种格式</p>
        </div>

        <!-- 温馨提示 -->
        <div class="bg-yellow-50 rounded-lg p-4 mb-12 max-w-4xl mx-auto">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-600">本工具收集互联网开源图标，所有图标均基于开源协议，可免费用于个人和商业项目，无需署名。内容持续增加，部分图标有损坏正在修复</p>
          </div>
        </div>

        <!-- 搜索和分类区域 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div class="flex flex-col md:flex-row items-start gap-6">
            <!-- 搜索框 -->
            <div class="w-full md:w-64">
              <el-input v-model="searchText" placeholder="搜索图标..." prefix-icon="Search" clearable class="!w-full"
                @input="handleSearch">
                <template #prefix>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </el-input>
            </div>
            <!-- 分类选择 -->
            <div class="flex-1">
              <el-radio-group v-model="currentCategory" @change="handleCategoryChange" class="flex flex-wrap gap-2">
                <el-radio-button v-for="category in categories" :key="category.value" :label="category.value"
                  class="!rounded-lg">
                  {{ category.label }}
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>

        <!-- 图标展示区域 -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
              <h3 class="text-lg font-medium text-gray-900">图标列表</h3>
              <span v-if="selectedIcons.length > 0" class="text-sm text-gray-500">
                已选择 {{ selectedIcons.length }} 个
              </span>
            </div>
            <el-button type="primary" @click="handleBatchDownload" :disabled="selectedIcons.length === 0">
              批量下载
            </el-button>
          </div>
          <!-- 图标列表内容 -->
          <div v-if="filteredIcons.length === 0" class="flex justify-center items-center min-h-[200px]">
            <el-empty description="暂无图标" />
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            <!-- 图标卡片 -->
            <div v-for="icon in paginatedIcons" :key="icon.id"
              class="border rounded-lg p-3 cursor-pointer transition-all duration-300 hover:border-blue-500 relative group"
              @click="handleIconClick(icon)">
              <el-checkbox v-model="selectedIcons" :label="icon.id" @click.stop
                class="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div class="flex flex-col items-center gap-2">
                <div class="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg" :id="'icon-' + icon.id">
                  <div class="svg-container" v-html="icon.svg"></div>
                </div>
                <div class="text-center">
                  <div class="text-xs font-medium text-gray-700 truncate w-full">{{ icon.name }}</div>
                  <div class="text-[10px] text-gray-500">{{ getSourceInfo(icon.source).label }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="mt-8 flex justify-center">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="filteredIcons.length"
              :page-sizes="[50, 100, 200, 300]" layout="sizes, prev, pager, next, jumper, total"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">SVG格式</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持SVG矢量格式，可自由缩放不失真</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">分类齐全</h3>
                <p class="text-sm text-gray-500 leading-relaxed">提供多种类型的设计图标，满足不同场景需求</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">便捷使用</h3>
                <p class="text-sm text-gray-500 leading-relaxed">支持一键下载和代码复制，使用更便捷</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mb-6" />
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="图标预览" width="720px" :close-on-click-modal="true"
      class="icon-preview-dialog">
      <div class="preview-content">
        <!-- 左侧预览 -->
        <div class="preview-left">
          <div class="preview-svg bg-gradient-to-br from-gray-50 to-white" v-html="currentIcon?.svg"></div>
          <!-- 调整选项 -->
          <div class="preview-options mt-6 space-y-4">
            <!-- 尺寸选择 -->
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500 whitespace-nowrap w-16">尺寸</span>
              <el-select v-model="previewSize" @change="updatePreviewSize" class="flex-1">
                <el-option label="16px" :value="16" />
                <el-option label="24px" :value="24" />
                <el-option label="32px" :value="32" />
                <el-option label="48px" :value="48" />
                <el-option label="64px" :value="64" />
                <el-option label="96px" :value="96" />
                <el-option label="128px" :value="128" />
                <el-option label="240px" :value="240" />
              </el-select>
            </div>
            <!-- 颜色选择 -->
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500 whitespace-nowrap w-16">颜色</span>
              <div class="flex-1 h-[32px]">
                <el-color-picker v-model="previewColor" @change="updatePreviewColor" class="!w-full !h-[32px]" />
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="preview-right">
          <div class="preview-info">
            <div class="preview-name">
              <div class="name">{{ currentIcon?.name }}</div>
              <div class="english">{{ currentIcon?.english }}</div>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">分类</span>
                <span class="text-sm text-gray-900">{{ getCategoryName(currentIcon?.category) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500">来源</span>
                <a :href="getSourceInfo(currentIcon?.source || '').url" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                  {{ getSourceInfo(currentIcon?.source || '').label }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部操作按钮 -->
      <template #footer>
        <div class="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <div class="flex gap-2">
            <el-button @click="copyIconUrl(currentIcon)">
              <i class="ri-file-copy-line mr-1"></i>复制代码
            </el-button>
            <el-button @click="() => downloadIcon(currentIcon, 'png')">下载 PNG</el-button>
            <el-button type="primary" @click="() => downloadIcon(currentIcon, 'svg')">下载 SVG</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 批量下载弹窗 -->
    <el-dialog v-model="batchDownloadVisible" title="批量下载" width="480px" :close-on-click-modal="true"
      class="icon-preview-dialog">
      <div class="p-6">
        <!-- 选择数量提示 -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">已选择 {{ selectedIcons.length }} 个图标</span>
          </div>
          <div class="flex items-center gap-2">
            <el-button-group>
              <el-button plain size="small" @click="clearSelection">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </template>
              </el-button>
              <el-button plain size="small" @click="expandSelection">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </template>
              </el-button>
            </el-button-group>
          </div>
        </div>

        <!-- 选中的图标预览 -->
        <div class="mb-6 bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-6 gap-2">
            <div v-for="iconId in selectedIcons" :key="iconId" class="relative group">
              <div class="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-100"
                :style="{ color: batchIconColor }">
                <div class="svg-container" v-html="getIconById(iconId)?.svg"></div>
              </div>
              <!-- 删除按钮 -->
              <button @click="removeSelectedIcon(iconId)"
                class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 下载选项 -->
        <div class="space-y-5">
          <!-- 格式选择 -->
          <div class="flex items-start gap-3">
            <div class="w-5 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700 mb-3">选择导出格式</p>
              <el-radio-group v-model="batchDownloadFormat" class="flex gap-4">
                <el-radio label="svg" class="!flex items-center !p-3 !border !rounded-lg !m-0 flex-1">
                  <div class="flex flex-col">
                    <span class="text-sm">SVG 格式</span>
                  </div>
                </el-radio>
                <el-radio label="png" class="!flex items-center !p-3 !border !rounded-lg !m-0 flex-1">
                  <div class="flex flex-col">
                    <span class="text-sm">PNG 格式</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>
          </div>

          <!-- 颜色选择 -->
          <div class="flex items-start gap-3">
            <div class="w-5 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700 mb-3">选择图标颜色</p>
              <el-color-picker v-model="batchIconColor" @change="updateBatchIconColor" class="!w-10 !h-10" />
            </div>
          </div>

          <!-- 尺寸选择 -->
          <div v-if="batchDownloadFormat === 'png'" class="flex items-start gap-3">
            <div class="w-5 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 8v8a4 4 0 004 4h8a4 4 0 004-4V8m-4 0V6a2 2 0 00-2-2H8a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700 mb-3">选择导出尺寸</p>
              <el-select v-model="batchDownloadSize" class="!w-28">
                <el-option v-for="size in [16, 24, 32, 48, 64, 96, 128, 240]" :key="size" :label="`${size}px`"
                  :value="size" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 px-6 py-4 bg-gray-50">
          <el-button @click="batchDownloadVisible = false">取消</el-button>
          <el-button type="primary" @click="startBatchDownload" :loading="batchDownloading">
            下载图标
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import { Picture, Download, CopyDocument, View } from '@element-plus/icons-vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { IconItem, allIcons, categories, sources } from './iconData'
import JSZip from 'jszip'

const route = useRoute()

// 状态
const searchText = ref('')
const currentCategory = ref('all')
const currentSource = ref('')
const currentPage = ref(1)
const pageSize = ref(100)
const currentIcon = ref<IconItem | null>(null)
const previewVisible = ref(false)
const iconColors = ref<Record<number, string>>({})
const iconSizes = ref<Record<number, number>>({})
const icons = ref<IconItem[]>(allIcons)

// 计算属性
const filteredIcons = computed(() => {
  let result = icons.value

  // 搜索过滤
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter((icon: IconItem) => {
      return icon.name.toLowerCase().includes(searchLower) ||
        icon.english.toLowerCase().includes(searchLower) ||
        icon.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
    })
  }

  // 分类过滤
  if (currentCategory.value && currentCategory.value !== 'all') {
    result = result.filter((icon: IconItem) => icon.category === currentCategory.value)
  }

  // 来源过滤
  if (currentSource.value) {
    result = result.filter((icon: IconItem) => icon.source === currentSource.value)
  }

  return result
})

// 分页数据
const paginatedIcons = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredIcons.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredIcons.value.length / pageSize.value))

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const handleTagClick = (tag: string) => {
  searchText.value = tag
  currentPage.value = 1
}

const previewIcon = (icon: IconItem) => {
  currentIcon.value = icon
  previewVisible.value = true
}

const downloadIcon = async (icon: IconItem, format: 'svg' | 'png' = 'svg') => {
  if (!icon) return
  try {
    if (format === 'svg') {
      const svgBlob = new Blob([icon.svg], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = svgUrl
      link.download = `${icon.name}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(svgUrl)
      ElMessage.success('开始下载 SVG 图标')
    } else {
      // 使用当前预览的尺寸和颜色
      const pngBlob = await convertSvgToPng(icon.svg, previewSize.value, previewColor.value)
      const pngUrl = URL.createObjectURL(pngBlob)
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `${icon.name}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(pngUrl)
      ElMessage.success('开始下载 PNG 图标')
    }
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

const copyIconUrl = async (icon: IconItem | null) => {
  if (!icon) return
  try {
    await navigator.clipboard.writeText(icon.svg)
    ElMessage.success('已复制SVG代码')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 更新图标颜色
const updateIconColor = (iconId: number, color: string) => {
  iconColors.value[iconId] = color
  // 更新SVG颜色
  const iconElement = document.querySelector(`#icon-${iconId} svg`) as HTMLElement
  if (iconElement) {
    iconElement.style.color = color
  }
}

// 更新图标尺寸
const updateIconSize = (iconId: number, size: number) => {
  iconSizes.value[iconId] = size
  // 更新SVG尺寸
  const iconElement = document.querySelector(`#icon-${iconId} svg`) as HTMLElement
  if (iconElement) {
    iconElement.style.width = `${size}px`
    iconElement.style.height = `${size}px`
  }
}

// 批量下载相关
const selectedIcons = ref<number[]>([])
const batchDownloadVisible = ref(false)
const batchDownloadFormat = ref<'svg' | 'png'>('svg')
const batchDownloadSize = ref(48)
const batchDownloading = ref(false)
const batchIconColor = ref('#000000')

const handleBatchDownload = () => {
  if (selectedIcons.value.length === 0) {
    ElMessage.warning('请先选择要下载的图标')
    return
  }
  batchDownloadVisible.value = true
}

// 更新批量图标颜色
const updateBatchIconColor = (color: string) => {
  const iconElements = document.querySelectorAll('.batch-preview .svg-container svg') as NodeListOf<HTMLElement>
  iconElements.forEach(element => {
    element.style.color = color
  })
}

// 根据ID获取图标
const getIconById = (id: number): IconItem | undefined => {
  return icons.value.find((icon: IconItem) => icon.id === id)
}

// 获取分类名称
const getCategoryName = (category: string | undefined): string => {
  const found = categories.find(c => c.value === category)
  return found ? found.label : '未分类'
}

// 获取来源信息
const getSourceInfo = (source: string): { label: string; url: string } => {
  const found = sources.find(s => s.value === source)
  return found || { label: source, url: '#' }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const previewColor = ref('#000000')
const previewSize = ref(48)

// 更新预览颜色
const updatePreviewColor = (color: string) => {
  const previewSvg = document.querySelector('.preview-svg svg') as HTMLElement
  if (previewSvg) {
    previewSvg.style.color = color
  }
}

// 更新预览尺寸
const updatePreviewSize = (size: number) => {
  const previewSvg = document.querySelector('.preview-svg svg') as HTMLElement
  if (previewSvg) {
    previewSvg.style.width = `${size}px`
    previewSvg.style.height = `${size}px`
  }
}

// 修改 handleIconClick 方法
const handleIconClick = (icon: IconItem) => {
  currentIcon.value = icon
  previewVisible.value = true
  // 重置预览设置
  previewColor.value = '#000000'
  previewSize.value = 48
  // 延迟一下更新预览设置，确保 DOM 已经渲染
  setTimeout(() => {
    updatePreviewColor(previewColor.value)
    updatePreviewSize(previewSize.value)
  }, 100)
}

const clearSelection = () => {
  selectedIcons.value = []
  batchDownloadVisible.value = false
}

const expandSelection = () => {
  // 这里可以添加展开预览的逻辑
  ElMessage.info('展开预览功能开发中')
}

// 移除单个选中的图标
const removeSelectedIcon = (iconId: number) => {
  selectedIcons.value = selectedIcons.value.filter((id: number) => id !== iconId)
  if (selectedIcons.value.length === 0) {
    batchDownloadVisible.value = false
  }
}

// 修改 startBatchDownload 方法
const startBatchDownload = async () => {
  if (selectedIcons.value.length === 0) return

  batchDownloading.value = true
  try {
    const zip = new JSZip()
    const selectedIconsData = icons.value.filter((icon: IconItem) => selectedIcons.value.includes(icon.id))

    for (const icon of selectedIconsData) {
      if (batchDownloadFormat.value === 'svg') {
        // 修改 SVG 颜色
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = icon.svg || ''
        const svgElement = tempDiv.querySelector('svg')
        if (svgElement) {
          svgElement.style.color = batchIconColor.value
          zip.file(`${icon.name}.svg`, tempDiv.innerHTML)
        }
      } else {
        // PNG 转换时使用选择的颜色和尺寸，保持透明背景
        const pngBlob = await convertSvgToPng(icon.svg || '', batchDownloadSize.value, batchIconColor.value)
        zip.file(`${icon.name}.png`, pngBlob)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const link = document.createElement('a')
    link.href = url
    link.download = `icons-${batchDownloadFormat.value}-${new Date().getTime()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('批量下载成功')
    batchDownloadVisible.value = false
    selectedIcons.value = []
  } catch (error) {
    console.error('批量下载失败:', error)
    ElMessage.error('批量下载失败，请重试')
  } finally {
    batchDownloading.value = false
  }
}

// 修改 convertSvgToPng 方法
const convertSvgToPng = async (svgContent: string, size: number, color: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = svgContent
    const svgElement = tempDiv.querySelector('svg')

    if (!svgElement) {
      reject(new Error('SVG 元素不存在'))
      return
    }

    svgElement.setAttribute('width', size.toString())
    svgElement.setAttribute('height', size.toString())
    svgElement.style.color = color

    const svgBlob = new Blob([tempDiv.innerHTML], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { alpha: true }) // 启用 alpha 通道

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      // 清除画布，确保透明背景
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, size, size)

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('PNG 转换失败'))
        }
      }, 'image/png')

      URL.revokeObjectURL(svgUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      reject(new Error('图片加载失败'))
    }

    img.src = svgUrl
  })
}
</script>

<style scoped>
.svg-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.svg-container :deep(svg) {
  width: 16px;
  height: 16px;
  color: #666;
  transition: all 0.3s ease;
}

.preview-svg {
  width: 240px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  padding: 24px;
  flex-shrink: 0;
}

.preview-svg :deep(svg) {
  width: 48px;
  height: 48px;
  color: #000;
  transition: all 0.3s ease;
}

.preview-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  padding: 24px;
}

.preview-left {
  display: flex;
  flex-direction: column;
}

.preview-right {
  display: flex;
  flex-direction: column;
}

.preview-info {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-info h4 {
  margin: 0 0 8px;
  color: #333;
  font-size: 18px;
}

.preview-info p {
  margin: 4px 0;
  color: #666;
}

.preview-options {
  margin-top: 16px;
}

.preview-actions {
  margin-top: auto;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .preview-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .preview-svg {
    aspect-ratio: 1;
  }
}

/* 弹窗样式优化 */
:deep(.icon-preview-dialog .el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.icon-preview-dialog .el-dialog__header) {
  margin: 0;
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

:deep(.icon-preview-dialog .el-dialog__body) {
  padding: 0;
}

:deep(.icon-preview-dialog .el-dialog__footer) {
  margin: 0;
  padding: 0;
}

:deep(.icon-preview-dialog .el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

:deep(.icon-preview-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 20px;
}

/* 优化复选框样式 */
:deep(.el-checkbox) {
  margin-right: 0;
  height: auto;
  z-index: 1;
}

:deep(.el-checkbox__inner) {
  width: 14px;
  height: 14px;
  background-color: rgba(255, 255, 255, 0.9);
  border-color: #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}

.group:hover .opacity-0 {
  opacity: 1;
}

/* Radio Button 样式 */
:deep(.el-radio-button__inner) {
  border: 1px solid #dcdfe6;
  background-color: #fff;
  color: #606266;
  padding: 8px 16px;
  height: auto;
  line-height: 1.2;
  border-radius: 8px !important;
  margin: 0 4px;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  border-color: #409eff;
  color: #409eff;
  background-color: #fff;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px !important;
}

.icon-info {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.icon-name {
  font-weight: 500;
  color: #333;
}

.icon-english {
  font-size: 11px;
  color: #999;
}

.preview-name {
  margin-bottom: 16px;
}

.preview-name .name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.preview-name .english {
  font-size: 14px;
  color: #666;
}
</style>
