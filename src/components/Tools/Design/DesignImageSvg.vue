/**
* @file DesignImageSvg.vue
* @description 图片转SVG工具，支持将JPG、PNG、GIF等格式图片转换为SVG矢量图
* @copyright Tomda (https://www.tomda.top)
*/

<template>
  <div class="min-h-screen theme-vars">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-6">
          <h2 class="text-3xl font-bold mb-2 text-gray-900">免费图片转SVG矢量图工具</h2>
          <p class="text-base text-gray-500">完全免费的在线图片转换工具，将JPG、PNG、GIF等格式图片转换为SVG矢量图</p>
        </div>

        <!-- 顶部工具栏 -->
        <div class="flex flex-wrap gap-2 mb-4 border-b pb-4">
          <el-button class="theme-button-outline" @click="triggerFileInput">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </template>
            上传图像
          </el-button>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileChange" />

          <el-button class="theme-button-outline" :disabled="!svgResult" @click="downloadSvg">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </template>
            保存SVG
          </el-button>

          <el-button class="theme-button-outline" :disabled="!svgResult" @click="copySvgCode">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </template>
            复制SVG
          </el-button>

          <el-button class="theme-button-outline" :disabled="!svgResult">
            <template #icon>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </template>
            分享SVG
          </el-button>
        </div>

        <!-- 主工作区 - 左侧控制面板，右侧显示区域 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- 左侧：控制面板 - 保留基本设置 -->
          <div class="col-span-1 bg-gray-50 rounded-lg p-4">
            <!-- 滑块控制组 - 基本设置 -->
            <div class="space-y-6">
              <!-- 彩色SVG选项 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">彩色SVG</label>
                  <el-switch v-model="params.extractcolors" size="small" />
                </div>
                <p class="text-xs text-gray-500 mb-2">开启后保留原图颜色，关闭则生成黑白轮廓</p>
              </div>

              <!-- 抖动阈值 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">抖动阈值 ({{ params.turdsize }})</label>
                  <el-button size="small" @click="params.turdsize = 2">重置</el-button>
                </div>
                <el-slider v-model="params.turdsize" :min="0" :max="100" :step="1" />
                <p class="text-xs text-gray-500">控制忽略的小区域大小，值越大细节越少</p>
              </div>

              <!-- 边角阈值 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">边角阈值 ({{ params.alphamax }})</label>
                  <el-button size="small" @click="params.alphamax = 1">重置</el-button>
                </div>
                <el-slider v-model="params.alphamax" :min="0" :max="1.5" :step="0.1" />
                <p class="text-xs text-gray-500">控制曲线拐角平滑程度，值越小拐角越尖锐</p>
              </div>

              <!-- 优化曲线 -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">优化曲线</label>
                  <el-switch v-model="params.opticurve" size="small" />
                </div>
                <p class="text-xs text-gray-500 mb-2">开启后生成更平滑的曲线，可能会增加处理时间</p>

                <div v-if="params.opticurve">
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-sm font-medium text-gray-700">优化容差 ({{ params.opttolerance }})</label>
                    <el-button size="small" @click="params.opttolerance = 0.2">重置</el-button>
                  </div>
                  <el-slider v-model="params.opttolerance" :min="0" :max="1" :step="0.01" />
                  <p class="text-xs text-gray-500">值越低精度越高，值越高简化程度越高</p>
                </div>
              </div>

              <!-- 颜色级别 - 仅在彩色模式下显示 -->
              <div v-if="params.extractcolors">
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">颜色级别 ({{ params.posterizelevel }})</label>
                  <el-button size="small" @click="params.posterizelevel = 10">重置</el-button>
                </div>
                <el-slider v-model="params.posterizelevel" :min="1" :max="255" :step="1" />
                <p class="text-xs text-gray-500">数值越低，颜色越少，文件越小；数值越高，颜色越丰富</p>
              </div>

              <!-- 转换按钮 -->
              <div class="mt-6">
                <el-button type="primary" class="!w-full theme-button" :disabled="!imageUrl" @click="convertToSvg"
                  :loading="converting">
                  <template v-if="!converting">转换为SVG</template>
                  <template v-else>正在转换中...</template>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧：显示区域和高级设置 -->
          <div class="col-span-2 space-y-4">
            <!-- 无图片上传时的提示 -->
            <div v-if="!imageUrl"
              class="h-[480px] bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-theme transition-colors cursor-pointer"
              @click="triggerFileInput" @dragover.prevent="dragover = true" @dragleave.prevent="dragover = false"
              @drop.prevent="onDrop" :class="{ 'border-theme bg-theme-50': dragover }">
              <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-lg text-gray-600 mb-2">点击或拖拽图片到此处上传</p>
              <p class="text-sm text-gray-500">支持 JPG、PNG、GIF、WebP 等格式</p>
            </div>

            <!-- 有图片上传后的显示区域 -->
            <div v-else class="bg-[#f0f0f0] rounded-lg p-2 h-[480px] flex flex-col">
              <!-- 结果标签切换 -->
              <div class="bg-white rounded-t-lg border-b px-4 py-2 flex space-x-4">
                <button class="text-sm font-medium py-1 px-2"
                  :class="activeTab === 'svg' ? 'text-theme border-b-2 border-theme' : 'text-gray-500'"
                  @click="activeTab = 'svg'">SVG 预览</button>
                <button class="text-sm font-medium py-1 px-2"
                  :class="activeTab === 'image' ? 'text-theme border-b-2 border-theme' : 'text-gray-500'"
                  @click="activeTab = 'image'">原始图片</button>
                <button class="text-sm font-medium py-1 px-2"
                  :class="activeTab === 'code' ? 'text-theme border-b-2 border-theme' : 'text-gray-500'"
                  @click="activeTab = 'code'">SVG 代码</button>
              </div>

              <!-- 显示内容区域 -->
              <div class="flex-1 overflow-auto flex items-center justify-center relative bg-[#f5f5f5]">
                <!-- 棋盘格背景 -->
                <div class="absolute inset-0 bg-repeat"
                  style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMGYwZjAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg=='); background-size: 20px 20px;">
                </div>

                <!-- SVG预览 -->
                <div v-if="activeTab === 'svg' && svgResult"
                  class="preview-svg relative z-10 w-full h-full flex items-center justify-center" v-html="svgResult">
                </div>

                <!-- 原始图片预览 -->
                <div v-if="activeTab === 'image' && imageUrl"
                  class="relative z-10 flex items-center justify-center h-full">
                  <img :src="imageUrl" alt="原始图片" class="max-w-full max-h-[450px] object-contain" />
                </div>

                <!-- SVG代码预览 -->
                <div v-if="activeTab === 'code' && svgResult"
                  class="relative z-10 w-full h-full bg-white p-4 overflow-auto">
                  <pre class="text-xs text-gray-800 whitespace-pre-wrap"><code>{{ svgResult }}</code></pre>
                </div>

                <!-- 转换中提示 -->
                <div v-if="converting"
                  class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
                  <div class="bg-white p-4 rounded-lg shadow-lg">
                    <div class="flex items-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-theme mr-3"></div>
                      <div class="text-gray-700">正在转换中，请稍候...</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 底部信息 -->
              <div class="bg-white rounded-b-lg px-4 py-2 flex justify-between text-xs text-gray-500">
                <div>
                  <span>原始: {{ imageInfo.width }}×{{ imageInfo.height }}px ({{ formatFileSize(imageInfo.size) }})</span>
                </div>
                <div v-if="svgResult">
                  <span>SVG: {{ formatFileSize(svgSize) }} | 节点: {{ nodeCount }} | 颜色: {{ colorCount }}</span>
                </div>
              </div>
            </div>

            <!-- 高级设置区域 - 移到预览下方 -->
            <div v-if="imageUrl" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-700 mb-3">高级设置</h3>

              <!-- 线条粗细 -->
              <div class="mb-3" v-if="!params.extractcolors">
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm font-medium text-gray-700">线条粗细 (4像素)</label>
                  <el-button size="small">重置</el-button>
                </div>
                <el-slider :min="0" :max="10" :step="0.5" :value="4" />
                <p class="text-xs text-gray-500">控制轮廓线条粗细，仅在黑白模式下有效</p>
              </div>

              <!-- 颜色选项 -->
              <div v-if="params.extractcolors">
                <h4 class="text-sm font-medium text-gray-700 mb-2">颜色处理</h4>

                <!-- 颜色通道控制 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- 红色通道 -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-xs font-medium text-gray-700">红 (50%)</label>
                      <el-button size="small">重置</el-button>
                    </div>
                    <el-slider :min="0" :max="100" :step="1" :value="50" />
                  </div>

                  <!-- 绿色通道 -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-xs font-medium text-gray-700">绿 (50%)</label>
                      <el-button size="small">重置</el-button>
                    </div>
                    <el-slider :min="0" :max="100" :step="1" :value="50" />
                  </div>

                  <!-- 蓝色通道 -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-xs font-medium text-gray-700">蓝 (50%)</label>
                      <el-button size="small">重置</el-button>
                    </div>
                    <el-slider :min="0" :max="100" :step="1" :value="50" />
                  </div>

                  <!-- Alpha通道 -->
                  <div>
                    <div class="flex justify-between items-center mb-1">
                      <label class="text-xs font-medium text-gray-700">Alpha (100%)</label>
                      <el-button size="small">重置</el-button>
                    </div>
                    <el-slider :min="0" :max="100" :step="1" :value="100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部信息 -->
        <div class="mt-6 text-center text-xs text-gray-500">
          <p>提示: 若转换效果不理想，可调整参数后重新转换，或使用更简单的图片</p>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mb-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { potrace, init as initPotrace } from 'esm-potrace-wasm'
import { optimize } from 'svgo'

const route = useRoute()

// 状态变量
const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref<string | null>(null)
const imageInfo = reactive({
  width: 0,
  height: 0,
  size: 0,
  type: ''
})
const svgResult = ref<string>('')
const converting = ref(false)
const dragover = ref(false)
const activeTab = ref('svg') // 默认显示SVG预览

// SVG参数设置
const params = reactive({
  turdsize: 2, // 噪点阈值，忽略小于此值的区域
  turnpolicy: 4, // 转向策略
  alphamax: 1, // 拐角阈值
  opticurve: true, // 是否优化曲线
  opttolerance: 0.2, // 曲线优化容差
  extractcolors: true, // 是否提取颜色
  colorsampling: 2, // 颜色采样算法：2表示更精确的采样
  posterizelevel: 10, // 颜色级别提高 [1-255]
  posterizationalgorithm: 1 // 使用插值算法以获得更平滑的颜色过渡
})

// 计算属性
const svgSize = computed(() => {
  return svgResult.value ? new Blob([svgResult.value], { type: 'image/svg+xml' }).size : 0
})

const nodeCount = computed(() => {
  if (!svgResult.value) return 0
  const match = svgResult.value.match(/<path/g)
  return match ? match.length : 0
})

const colorCount = computed(() => {
  if (!svgResult.value || !params.extractcolors) return 0
  const matches = svgResult.value.match(/fill="[^"]+"/g)
  if (!matches) return 0
  // 使用Set去重
  const uniqueColors = new Set(matches)
  return uniqueColors.size
})

// 方法
const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    processFile(file)
  }
}

const onDrop = (event: DragEvent) => {
  dragover.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file.type.startsWith('image/')) {
      processFile(file)
    } else {
      ElMessage.error('请上传图片文件')
    }
  }
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }

  // 更新图片信息
  imageInfo.size = file.size
  imageInfo.type = file.type

  // 创建图片URL
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      imageUrl.value = e.target.result as string

      // 获取图片尺寸
      const img = new Image()
      img.onload = () => {
        imageInfo.width = img.width
        imageInfo.height = img.height

        // 自动转换为SVG
        convertToSvg()
      }
      img.src = e.target.result as string
    }
  }
  reader.readAsDataURL(file)

  // 重置SVG结果
  svgResult.value = ''
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 转换SVG
const convertToSvg = async () => {
  if (!imageUrl.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  converting.value = true
  try {
    console.log('开始转换SVG...')

    // 加载图片
    const img = new Image()
    img.crossOrigin = 'anonymous' // 解决可能的跨域问题

    await new Promise((resolve, reject) => {
      img.onload = () => {
        console.log('图片加载成功，准备转换:', img.width, 'x', img.height)
        resolve(null)
      }
      img.onerror = (err) => {
        console.error('图片加载失败:', err)
        reject(new Error('图片加载失败'))
      }
      if (imageUrl.value) {
        img.src = imageUrl.value
      } else {
        reject(new Error('没有图片URL'))
      }
    })

    console.log('调用potrace开始转换...')
    // 转换为SVG
    const svg = await potrace(img, params)
    console.log('potrace转换完成，优化SVG...')

    // 优化SVG
    const optimizedSvg = optimize(svg, {
      plugins: [
        'preset-default',
        'removeDimensions',
        {
          name: 'removeViewBox',
          active: false
        }
      ]
    })

    console.log('SVG优化完成，更新结果')
    svgResult.value = optimizedSvg.data
    activeTab.value = 'svg' // 确保转换后显示SVG预览标签

    console.log('SVG结果:', svgResult.value.substring(0, 100) + '...')
    ElMessage.success('转换成功')
  } catch (error) {
    console.error('转换失败:', error)
    ElMessage.error('转换失败，请重试或使用更简单的图片')
  } finally {
    converting.value = false
  }
}

// 下载SVG
const downloadSvg = () => {
  if (!svgResult.value) return

  const blob = new Blob([svgResult.value], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `uiedtool_${Date.now()}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  ElMessage.success('SVG下载成功')
}

// 复制SVG代码
const copySvgCode = async () => {
  if (!svgResult.value) return

  try {
    await navigator.clipboard.writeText(svgResult.value)
    ElMessage.success('SVG代码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 初始化Potrace
onMounted(async () => {
  try {
    await initPotrace()
    console.log('Potrace初始化成功')

    // 加载默认图片 - UIED Logo
    loadDefaultLogo()
  } catch (error) {
    console.error('Potrace初始化失败:', error)
    ElMessage.error('工具初始化失败，请刷新页面重试')
  }
})

// 加载默认Logo
const loadDefaultLogo = () => {
  // 使用assets目录下的uiedlogo.png
  const logoUrl = new URL('@/assets/uiedlogo.png', import.meta.url).href
  console.log('默认Logo路径:', logoUrl)

  // 创建图片对象
  const img = new Image()
  img.onload = () => {
    console.log('Logo加载成功:', img.width, 'x', img.height)
    // 更新图片信息
    imageUrl.value = logoUrl
    imageInfo.width = img.width
    imageInfo.height = img.height
    imageInfo.size = 0 // 由于是本地资源，先设为0
    imageInfo.type = 'image/png'

    // 获取文件大小（可选）
    fetch(logoUrl)
      .then(response => response.blob())
      .then(blob => {
        imageInfo.size = blob.size
        console.log('Logo文件大小:', blob.size)

        // 自动转换默认Logo为SVG
        convertToSvg()
      })
      .catch(err => {
        console.error('获取logo大小失败:', err)
      })
  }
  img.onerror = (err) => {
    console.error('加载默认logo失败:', err)
    ElMessage.warning('默认示例图片加载失败，请手动上传图片')
  }
  img.src = logoUrl
}
</script>

<style scoped>
/* 主题色变量 - 使用:root没有生效，改用.theme-vars */
.theme-vars {
  --theme-color: #6C54FF;
  --theme-hover: #5a46d8;
  --theme-active: #4c39c7;
  --theme-light: rgba(108, 84, 255, 0.1);
  --theme-lighter: rgba(108, 84, 255, 0.05);
}

/* 全局主题色类 */
.text-theme {
  color: #6C54FF;
}

.border-theme {
  border-color: #6C54FF;
}

.bg-theme {
  background-color: #6C54FF;
}

.bg-theme-50 {
  background-color: rgba(108, 84, 255, 0.05);
}

.hover\:border-theme:hover {
  border-color: #6C54FF;
}

.preview-svg {
  max-width: 100%;
  max-height: 100%;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.preview-svg :deep(svg) {
  max-width: 90%;
  max-height: 90%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

/* 主题色按钮样式 */
:deep(.theme-button.el-button--primary) {
  --el-button-bg-color: #6C54FF !important;
  --el-button-border-color: #6C54FF !important;
  --el-button-hover-bg-color: #5a46d8 !important;
  --el-button-hover-border-color: #5a46d8 !important;
  --el-button-active-bg-color: #4c39c7 !important;
}

:deep(.theme-button.el-button--success) {
  --el-button-bg-color: #6C54FF !important;
  --el-button-border-color: #6C54FF !important;
  --el-button-hover-bg-color: #5a46d8 !important;
  --el-button-hover-border-color: #5a46d8 !important;
  --el-button-active-bg-color: #4c39c7 !important;
}

:deep(.theme-button-outline) {
  --el-button-text-color: #6C54FF !important;
  --el-button-border-color: #6C54FF !important;
  --el-button-hover-text-color: #5a46d8 !important;
  --el-button-hover-border-color: #5a46d8 !important;
}

:deep(.el-slider__runway) {
  margin: 10px 0;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-switch__label) {
  font-size: 12px;
}

:deep(.el-slider .el-slider__button) {
  border: 2px solid #6C54FF;
}

:deep(.el-slider__bar) {
  background-color: #6C54FF;
}

/* 拖拽区域样式 */
.border-dashed.border-theme {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {

  0%,
  100% {
    background-color: rgba(108, 84, 255, 0.05);
  }

  50% {
    background-color: rgba(108, 84, 255, 0.1);
  }
}
</style>
