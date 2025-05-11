<!--
 * @file Grid.vue
 * @description 栅格计算工具组件，支持快速计算和预览网页栅格布局
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 *
 * 功能特性：
 * 1. 支持自定义容器宽度、列数、间距等参数
 * 2. 实时计算和预览栅格布局
 * 3. 支持响应式布局预览
 * 4. 提供常用布局预设
 * 5. 支持导出栅格配置
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3">栅格计算器</h2>
          <p class="text-gray-500 text-sm">快速计算和预览网页栅格布局</p>
        </div>

        <!-- 添加温馨提示 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <el-icon class="text-blue-500 mt-0.5">
                <InfoFilled />
              </el-icon>
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-medium text-blue-900 mb-1">设计师使用指南</h4>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• 选择布局预设快速开始：桌面端(1200px)、平板(768px)、移动端(375px)</li>
                <li>• 支持导出 Figma/Sketch 配置，包含详细的布局参数和操作步骤</li>
                <li>• 切换设备预览查看不同终端下的栅格效果</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 栅格参数设置区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 布局预设 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-medium mb-4">布局预设</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div v-for="preset in layoutPresets" :key="preset.name"
                class="preset-card border rounded-lg p-4 cursor-pointer transition-all duration-300" :class="{
                  'border-blue-500 bg-blue-50': currentPreset === preset.name,
                  'border-gray-200 hover:border-blue-300': currentPreset !== preset.name
                }" @click="applyPreset(preset)">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <component :is="preset.icon" class="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div class="font-medium">{{ preset.name }}</div>
                    <div class="text-xs text-gray-500">{{ preset.description }}</div>
                    <div class="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs" :class="{
                      'bg-blue-100 text-blue-800': preset.type === 'desktop',
                      'bg-green-100 text-green-800': preset.type === 'tablet',
                      'bg-purple-100 text-purple-800': preset.type === 'mobile'
                    }">
                      {{ preset.type }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 栅格参数设置 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">栅格参数设置</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">容器宽度</label>
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="containerWidth" :min="0" :step="10" controls-position="right" />
                  <span class="text-gray-500">px</span>
                </div>
              </div>
              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">列数</label>
                <el-input-number v-model="columns" :min="1" :max="24" controls-position="right" />
              </div>
              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">列间距</label>
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="gutterWidth" :min="0" :step="2" controls-position="right" />
                  <span class="text-gray-500">px</span>
                </div>
              </div>
              <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">边距</label>
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="margin" :min="0" :step="2" controls-position="right" />
                  <span class="text-gray-500">px</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 计算结果 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">计算结果</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500 mb-1">单列宽度</div>
                <div class="font-medium">{{ columnWidth.toFixed(2) }}px</div>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500 mb-1">内容区域宽度</div>
                <div class="font-medium">{{ contentWidth }}px</div>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500 mb-1">总间距宽度</div>
                <div class="font-medium">{{ totalGutterWidth }}px</div>
              </div>
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-500 mb-1">总边距宽度</div>
                <div class="font-medium">{{ totalMarginWidth }}px</div>
              </div>
            </div>
          </div>

          <!-- 栅格预览 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">栅格预览</h3>
              <div class="flex items-center space-x-4">
                <!-- 设备切换 -->
                <div class="device-switcher flex space-x-2">
                  <el-tooltip content="手机视图 375px" placement="top">
                    <div class="device-button" :class="{ active: currentDevice === 'mobile' }"
                      @click="switchDevice('mobile')">
                      <el-icon>
                        <Iphone />
                      </el-icon>
                    </div>
                  </el-tooltip>
                  <el-tooltip content="平板视图 768px" placement="top">
                    <div class="device-button" :class="{ active: currentDevice === 'tablet' }"
                      @click="switchDevice('tablet')">
                      <el-icon>
                        <Notebook />
                      </el-icon>
                    </div>
                  </el-tooltip>
                  <el-tooltip content="桌面视图" placement="top">
                    <div class="device-button" :class="{ active: currentDevice === 'desktop' }"
                      @click="switchDevice('desktop')">
                      <el-icon>
                        <Monitor />
                      </el-icon>
                    </div>
                  </el-tooltip>
                </div>
                <!-- 显示选项 -->
                <div class="view-options flex space-x-2">
                  <el-tooltip content="显示参考线" placement="top">
                    <el-switch v-model="showGuides" size="small" />
                  </el-tooltip>
                  <el-tooltip content="显示列宽" placement="top">
                    <el-switch v-model="showColumnWidth" size="small" />
                  </el-tooltip>
                </div>
              </div>
            </div>

            <div class="relative overflow-hidden bg-gray-50 rounded-lg">
              <!-- 背景网格 -->
              <div v-if="showGuides" class="absolute inset-0">
                <!-- 垂直参考线 -->
                <div class="absolute inset-0 grid-lines-vertical" :style="{
                  backgroundSize: `${(containerWidth.value - totalMarginWidth.value) / columns.value + gutterWidth.value}px 100%`,
                  backgroundPosition: `${margin.value}px 0`,
                  opacity: 0.1
                }">
                </div>
                <!-- 水平参考线 -->
                <div class="absolute inset-0 grid-lines-horizontal"></div>
                <!-- 外边距参考线 -->
                <div class="absolute inset-y-0 left-0 margin-line" :style="{ left: `${margin.value}px` }"></div>
                <div class="absolute inset-y-0 right-0 margin-line" :style="{ right: `${margin.value}px` }"></div>
              </div>

              <!-- 预览区域 -->
              <div class="overflow-x-auto py-8">
                <div class="grid-preview mx-auto" :style="previewStyles">
                  <template v-for="n in (currentDevice === 'desktop' ? columns : previewColumns)" :key="n">
                    <div class="column-preview relative" :class="{ 'hover:bg-blue-600': !isResizing }"
                      :style="columnStyle" @mousedown="startColumnResize(n, $event)">
                      <!-- 列宽标注 -->
                      <div v-if="showColumnWidth"
                        class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                        {{ previewColumnWidth.toFixed(0) }}px
                      </div>
                      <div class="text-white">{{ n }}</div>
                      <!-- 拖拽手柄 -->
                      <div class="resize-handle"></div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 设备框架 -->
              <div v-if="currentDevice !== 'desktop'" class="device-frame" :class="currentDevice"></div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <el-dropdown @command="handleExport" trigger="click">
              <el-button type="primary" size="large">
                导出配置
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="figma">导出 Figma 配置</el-dropdown-item>
                  <el-dropdown-item command="sketch">导出 Sketch 配置</el-dropdown-item>
                  <el-dropdown-item command="css">导出 CSS 代码</el-dropdown-item>
                  <el-dropdown-item command="json">导出 JSON 配置</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button size="large" @click="resetConfig">重置</el-button>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import {
  Grid,
  Monitor,
  Iphone,
  Notebook,
  ArrowDown,
  InfoFilled
} from '@element-plus/icons-vue'

// 路由实例
const route = useRoute()

// 响应式数据
const containerWidth = ref(1200)
const columns = ref(12)
const gutterWidth = ref(20)
const margin = ref(30)

// 当前预设
const currentPreset = ref('桌面端布局')

// 布局预设
const layoutPresets = [
  {
    name: '桌面端布局',
    description: '常用于PC端网站 1200px',
    icon: Monitor,
    type: 'desktop',
    config: {
      containerWidth: 1200,
      columns: 12,
      gutterWidth: 20,
      margin: 30
    }
  },
  {
    name: '宽屏布局',
    description: '适用于大屏显示器 1440px',
    icon: Monitor,
    type: 'desktop',
    config: {
      containerWidth: 1440,
      columns: 24,
      gutterWidth: 24,
      margin: 40
    }
  },
  {
    name: '平板布局',
    description: '适用于iPad等平板设备 768px',
    icon: Notebook,
    type: 'tablet',
    config: {
      containerWidth: 768,
      columns: 8,
      gutterWidth: 16,
      margin: 24
    }
  },
  {
    name: '移动端布局',
    description: '适用于手机设备 375px',
    icon: Iphone,
    type: 'mobile',
    config: {
      containerWidth: 375,
      columns: 4,
      gutterWidth: 12,
      margin: 16
    }
  }
]

// 计算属性
const totalGutterWidth = computed(() => gutterWidth.value * (columns.value - 1))
const totalMarginWidth = computed(() => margin.value * 2)
const contentWidth = computed(() => containerWidth.value - totalMarginWidth.value)
const columnWidth = computed(() => (contentWidth.value - totalGutterWidth.value) / columns.value)

// 设备预览相关
const currentDevice = ref('desktop')
const showGuides = ref(true)
const showColumnWidth = ref(true)
const isResizing = ref(false)

// 添加预览尺寸数据
const previewWidth = ref(0)
const previewColumns = ref(0)

// 修改设备配置
const devices = {
  mobile: { width: 375, columns: 4 },
  tablet: { width: 768, columns: 8 },
  desktop: { width: 0, columns: 0 } // 桌面模式使用实际配置
}

// 修改切换设备方法
const switchDevice = (device: string) => {
  currentDevice.value = device
  if (device !== 'desktop') {
    const deviceConfig = devices[device as keyof typeof devices]
    previewWidth.value = deviceConfig.width
    previewColumns.value = deviceConfig.columns
  } else {
    // 桌面模式使用实际配置
    previewWidth.value = containerWidth.value
    previewColumns.value = columns.value
  }
}

// 监听实际配置变化，在桌面模式下同步更新预览
watch([columns, gutterWidth], ([newColumns, newGutterWidth]) => {
  // 如果在桌面模式下，更新预览
  if (currentDevice.value === 'desktop') {
    previewWidth.value = containerWidth.value
    previewColumns.value = newColumns
  }
})

// 修改预览样式计算属性
const previewStyles = computed(() => ({
  width: (currentDevice.value === 'desktop' ? containerWidth.value : previewWidth.value) + 'px',
  padding: `0 ${margin.value}px`,
  display: 'grid',
  gridTemplateColumns: `repeat(${currentDevice.value === 'desktop' ? columns.value : previewColumns.value}, 1fr)`,
  gap: `${gutterWidth.value}px`,
  backgroundColor: '#f3f4f6',
  border: '1px solid #e5e7eb',
  borderRadius: '0.5rem',
  minHeight: '200px',
  margin: '0 auto',
  transition: isResizing.value ? 'none' : 'all 0.3s ease'
}))

// 修改列宽计算
const previewColumnWidth = computed(() => {
  const previewContentWidth = (currentDevice.value === 'desktop' ? containerWidth.value : previewWidth.value) - totalMarginWidth.value
  const previewTotalGutterWidth = gutterWidth.value * ((currentDevice.value === 'desktop' ? columns.value : previewColumns.value) - 1)
  return (previewContentWidth - previewTotalGutterWidth) / (currentDevice.value === 'desktop' ? columns.value : previewColumns.value)
})

// 列宽拖拽调整
const startColumnResize = (columnIndex: number, e: MouseEvent) => {
  if (e.target instanceof HTMLElement && e.target.classList.contains('resize-handle')) {
    isResizing.value = true
    const startX = e.clientX
    const startColumns = columns.value

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX
      const newColumns = Math.max(1, Math.min(24, startColumns + Math.round(diff / 50)))
      if (newColumns !== columns.value) {
        columns.value = newColumns
      }
    }

    const handleMouseUp = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }
}

// 应用预设
const applyPreset = (preset: any) => {
  currentPreset.value = preset.name
  containerWidth.value = preset.config.containerWidth
  columns.value = preset.config.columns
  gutterWidth.value = preset.config.gutterWidth
  margin.value = preset.config.margin

  // 自动切换到对应的设备预览
  switchDevice(preset.type)

  ElMessage({
    message: `已应用${preset.name}预设`,
    type: 'success',
    duration: 2000
  })
}

// 重置配置
const resetConfig = () => {
  // 重置为桌面端布局预设
  const defaultPreset = layoutPresets.find(p => p.name === '桌面端布局')
  if (defaultPreset) {
    applyPreset(defaultPreset)
  } else {
    containerWidth.value = 1200
    columns.value = 12
    gutterWidth.value = 20
    margin.value = 30
    currentPreset.value = '桌面端布局'
    switchDevice('desktop')
  }

  ElMessage({
    message: '已重置为默认配置',
    type: 'success',
    duration: 2000
  })
}

// 导出配置
const handleExport = (type: string) => {
  switch (type) {
    case 'figma':
      exportFigmaConfig()
      break
    case 'sketch':
      exportSketchConfig()
      break
    case 'css':
      exportCSSConfig()
      break
    case 'json':
      exportJSONConfig()
      break
  }
}

// 导出 Figma 配置
const exportFigmaConfig = () => {
  // 计算列宽和位置
  const columnWidth = (containerWidth.value - totalMarginWidth.value - totalGutterWidth.value) / columns.value
  let figmaCode = `// Figma 栅格布局指南
1. 创建画板: ${containerWidth.value}px × 800px

2. 添加布局网格 (Layout Grid):
- 类型: Columns
- 宽度: ${containerWidth.value}px
- 列数: ${columns.value}
- 外边距: ${margin.value}px
- 列间距: ${gutterWidth.value}px
- 对齐方式: Stretch
- 颜色: 蓝色 10% 透明度

3. 列宽计算:
- 单列宽度: ${columnWidth.toFixed(2)}px
- 列间距: ${gutterWidth.value}px
- 外边距: ${margin.value}px

4. 快捷操作:
- 按 Shift + 2 显示布局网格
- 按 Alt + 拖动 复制元素
- 使用自动布局(Auto Layout)设置间距: ${gutterWidth.value}px`

  copyToClipboard(figmaCode, 'Figma')

  ElMessage({
    message: '已复制 Figma 布局指南，请按步骤在 Figma 中设置',
    type: 'success',
    duration: 3000
  })
}

// 导出 Sketch 配置
const exportSketchConfig = () => {
  // 计算列宽和位置
  const columnWidth = (containerWidth.value - totalMarginWidth.value - totalGutterWidth.value) / columns.value
  let sketchCode = `// Sketch 栅格布局指南
1. 创建画板: ${containerWidth.value}px × 800px

2. 设置布局 (Layout Settings):
- 总宽度: ${containerWidth.value}px
- 列数: ${columns.value}
- 外边距: ${margin.value}px
- 列间距: ${gutterWidth.value}px

3. 列宽计算:
- 单列宽度: ${columnWidth.toFixed(2)}px
- 列间距: ${gutterWidth.value}px
- 外边距: ${margin.value}px

4. 响应式布局参考:
Desktop: ${containerWidth.value}px (${columns.value}列)
Tablet: 768px (8列)
Mobile: 375px (4列)

5. 快捷操作:
- Command + L 显示布局
- 按住 Option 显示间距
- 使用 Smart Layout 设置间距: ${gutterWidth.value}px`

  copyToClipboard(sketchCode, 'Sketch')

  ElMessage({
    message: '已复制 Sketch 布局指南，请按步骤在 Sketch 中设置',
    type: 'success',
    duration: 3000
  })
}

// 导出 CSS 配置
const exportCSSConfig = () => {
  const config = `.container {
  width: ${containerWidth.value}px;
  padding: 0 ${margin.value}px;
  margin: 0 auto;
}

.row {
  display: grid;
  grid-template-columns: repeat(${columns.value}, 1fr);
  gap: ${gutterWidth.value}px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 0 ${Math.floor(margin.value / 2)}px;
  }

  .row {
    gap: ${Math.floor(gutterWidth.value / 2)}px;
  }
}`

  copyToClipboard(config, 'CSS')
}

// 导出 JSON 配置
const exportJSONConfig = () => {
  const config = {
    containerWidth: containerWidth.value,
    columns: columns.value,
    gutterWidth: gutterWidth.value,
    margin: margin.value,
    computed: {
      columnWidth: columnWidth.value,
      contentWidth: contentWidth.value,
      totalGutterWidth: totalGutterWidth.value,
      totalMarginWidth: totalMarginWidth.value
    }
  }

  const dataStr = JSON.stringify(config, null, 2)
  copyToClipboard(dataStr, 'JSON')
}

// 复制到剪贴板
const copyToClipboard = (content: string, type: string) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage({
      message: `${type}配置已复制到剪贴板`,
      type: 'success',
      duration: 2000
    })
  }).catch(() => {
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000
    })
  })
}
</script>

<style scoped>
.grid-preview {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.grid-preview::-webkit-scrollbar {
  height: 6px;
}

.grid-preview::-webkit-scrollbar-track {
  background: transparent;
}

.grid-preview::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

/* 预设卡片样式 */
.preset-card {
  position: relative;
  overflow: hidden;
}

.preset-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.preset-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preset-card:hover::before {
  opacity: 1;
}

/* 设备切换按钮 */
.device-button {
  @apply w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300;
  @apply text-gray-400 hover:text-blue-500 hover:bg-blue-50;
}

.device-button.active {
  @apply text-blue-500 bg-blue-50 shadow-sm;
}

/* 预览区域增强 */
.bg-grid {
  background-image:
    linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 列拖拽手柄 */
.resize-handle {
  @apply absolute right-0 top-0 bottom-0 w-1 cursor-col-resize opacity-0 transition-opacity duration-200;
  @apply bg-blue-300 hover:opacity-100;
}

.column-preview:hover .resize-handle {
  @apply opacity-50;
}

/* 设备框架 */
.device-frame {
  @apply absolute inset-0 pointer-events-none;
  border: 12px solid rgba(17, 24, 39, 0.15);
  border-radius: 2rem;
  box-shadow:
    inset 0 0 0 1px rgba(17, 24, 39, 0.1),
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.device-frame.mobile {
  @apply mx-auto w-[375px];
}

.device-frame.tablet {
  @apply mx-auto w-[768px];
}

/* 参考线样式优化 */
.grid-lines-vertical {
  background-image: repeating-linear-gradient(to right,
      rgba(59, 130, 246, 0.15),
      rgba(59, 130, 246, 0.15) 1px,
      transparent 1px,
      transparent calc(100% / v-bind(columns)));
}

.grid-lines-horizontal {
  background-image: repeating-linear-gradient(to bottom,
      rgba(59, 130, 246, 0.1) 1px,
      transparent 1px);
  background-size: 100% 20px;
}

.margin-line {
  @apply absolute w-px h-full;
  background-color: rgba(59, 130, 246, 0.3);
}

/* 修改列预览样式 */
.column-preview {
  @apply relative transition-all duration-200;
  background-color: rgba(96, 165, 250, 0.2);
  border: 1px solid rgba(96, 165, 250, 0.3);
  backdrop-filter: blur(4px);
}

.column-preview:hover {
  background-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-1px);
}

/* 添加栅格标注 */
.grid-annotation {
  @apply absolute -top-8 left-0 right-0 flex justify-between text-xs text-gray-400;
  padding: 0 v-bind(margin) + 'px';
}

.grid-annotation::before,
.grid-annotation::after {
  content: '';
  @apply absolute bottom-2 w-px h-2 bg-gray-300;
}

.grid-annotation::before {
  left: v-bind(margin) + 'px';
}

.grid-annotation::after {
  right: v-bind(margin) + 'px';
}

/* 组件示例样式 */
.component-preview {
  @apply transition-all duration-300;
}

.area-preview {
  @apply rounded-lg flex items-center justify-center text-sm text-gray-600 transition-colors duration-300;
}

.area-preview:hover {
  @apply bg-blue-200;
}

/* 优化滚动条样式 */
.grid-preview::-webkit-scrollbar {
  height: 6px;
}

.grid-preview::-webkit-scrollbar-track {
  background: transparent;
}

.grid-preview::-webkit-scrollbar-thumb {
  background-color: rgba(96, 165, 250, 0.3);
  border-radius: 3px;
}

.grid-preview::-webkit-scrollbar-thumb:hover {
  background-color: rgba(96, 165, 250, 0.5);
}
</style>
