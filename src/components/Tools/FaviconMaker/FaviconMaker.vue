<!--
 * @file FaviconMaker.vue
 * @description Favicon在线制作工具组件，支持多种尺寸和格式的网站图标制作
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传图片
 * 2. 支持多种尺寸的图标生成
 * 3. 支持PNG和ICO格式输出
 * 4. 支持图片裁剪和预览
 * 5. 本地处理，无需上传服务器
 *
 * 主要组件：
 * - 文件上传区域
 * - 图片裁剪工具
 * - 预览效果展示
 * - 格式和尺寸选择
 * - 常见问题解答
 -->
<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 上传区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div
              class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
              <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>
              <div class="text-center px-4">
                <div class="w-8 h-8 mb-2 mx-auto">
                  <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
                <p class="text-xs text-gray-400 mb-1">支持 PNG、JPG、JPEG、GIF 格式</p>
                <p class="text-xs text-gray-400">建议上传正方形图片，最佳尺寸 1024x1024</p>
              </div>
            </div>
          </div>

          <!-- 编辑区域 -->
          <div v-if="imageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 左侧：裁剪区域 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">图片编辑</div>
              <div class="border rounded-lg bg-gray-50 p-4">
                <VueCropper ref="cropperRef" :src="imageUrl" :aspect-ratio="1" :view-mode="1" :auto-crop-area="1"
                  :background="true" :movable="true" :zoomable="true" :guides="true" :center="true" :highlight="true"
                  :crop-box-movable="true" :crop-box-resizable="true" :responsive="true" :restore="true" />
              </div>
            </div>

            <!-- 右侧：预览和设置 -->
            <div class="space-y-6">
              <!-- 预览效果 -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="mb-4 text-gray-700 font-medium">预览效果</div>
                <div class="grid grid-cols-3 gap-6">
                  <div v-for="size in previewSizes" :key="size" class="text-center flex flex-col items-center">
                    <div class="mb-2 border rounded-lg bg-white flex-shrink-0 overflow-hidden relative shadow-sm"
                      :style="{
                        width: `${Math.min(size, 64)}px`,
                        height: `${Math.min(size, 64)}px`,
                      }">
                      <div v-if="previewUrl" class="absolute inset-0" :style="{
                        backgroundImage: `url(${previewUrl})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }"></div>
                      <div v-else class="absolute inset-0 flex items-center justify-center">
                        <span class="text-xs text-gray-400">暂无</span>
                      </div>
                    </div>
                    <span class="text-xs font-medium text-gray-600">{{ size }}x{{ size }}</span>
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-4 text-center">预览效果仅供参考，实际效果可能略有差异</p>
              </div>

              <!-- 生成设置 -->
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="mb-4 text-gray-700 font-medium">生成设置</div>
                <!-- 输出格式 -->
                <div class="mb-6">
                  <label class="text-sm font-medium text-gray-700 mb-2 block">输出格式</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="relative">
                      <input type="radio" id="format-png" value="png" v-model="outputFormat" class="peer hidden" />
                      <label for="format-png"
                        class="block cursor-pointer select-none rounded-lg border border-gray-200 p-3 text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 hover:border-blue-500/30 transition-colors">
                        <span class="text-sm font-medium">PNG格式</span>
                      </label>
                    </div>
                    <div class="relative">
                      <input type="radio" id="format-ico" value="ico" v-model="outputFormat" class="peer hidden" />
                      <label for="format-ico"
                        class="block cursor-pointer select-none rounded-lg border border-gray-200 p-3 text-center peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-600 hover:border-blue-500/30 transition-colors">
                        <span class="text-sm font-medium">ICO格式</span>
                      </label>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    {{ outputFormat === 'png' ? 'PNG格式兼容性好，但需要额外HTML标签' : 'ICO格式是传统favicon格式，兼容性最佳' }}
                  </p>
                </div>

                <!-- 输出尺寸 -->
                <div>
                  <label class="text-sm font-medium text-gray-700 mb-2 block">输出尺寸</label>
                  <div class="grid grid-cols-3 gap-3">
                    <el-checkbox-group v-model="selectedSizes" class="w-full">
                      <el-checkbox v-for="size in availableSizes" :key="size" :label="size" class="flex-1 mb-2">
                        {{ size }}x{{ size }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    建议选择多个尺寸以适配不同设备，ICO格式建议不超过4个尺寸
                  </p>
                </div>
              </div>

              <!-- 生成按钮 -->
              <el-button type="primary" size="large"
                class="w-full h-12 text-base font-medium !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300"
                :loading="generating" @click="generateFavicon">
                {{ generating ? '生成中...' : '生成Favicon' }}
              </el-button>

              <!-- 下载区域 -->
              <div v-if="downloadUrl" class="bg-white border border-gray-200 rounded-lg p-6">
                <div class="flex items-center justify-between mb-3">
                  <label class="text-sm font-medium text-gray-700">下载文件</label>
                  <el-button type="success" class="h-10 px-6 text-base" @click="downloadFavicon">
                    <div class="flex items-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>下载Favicon</span>
                    </div>
                  </el-button>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p class="text-xs text-gray-600">使用说明：</p>
                  <p class="text-xs text-gray-600">1. 下载后将文件重命名为 favicon.{{ outputFormat === 'png' ? 'png' : 'ico'
                    }}，放到网站根目录</p>
                  <p class="text-xs text-gray-600">2. 在HTML中添加以下代码：</p>
                  <pre class="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                    <code v-if="outputFormat === 'ico'">&lt;link rel="shortcut icon" href="/favicon.ico" type="image/x-icon"&gt;</code>
                    <code v-else>&lt;link rel="icon" type="image/png" href="/favicon.png"&gt;</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg v-if="feature.icon === 'Format'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Size'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 8v8a4 4 0 004 4h8m4-16v8a4 4 0 01-4 4H8m16-16l-4 4m0 0l4-4m-4 4h3m-3 8l4 4m0 0l-4-4m4 4v-3" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Lock'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Easy'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="faq in faqItems" :key="faq.q" class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ faq.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElButton, ElCheckbox, ElCheckboxGroup } from 'element-plus'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
import JSZip from 'jszip'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

// 组件配置信息
const info = {
  title: "免费在线Favicon制作工具",
  subtitle: "快速制作网站图标，支持多种尺寸和格式"
}

// 常见问题
const faqItems = [
  {
    q: 'Favicon是什么？',
    a: 'Favicon是显示在浏览器标签栏、书签栏和地址栏等位置的小图标，它能让用户更容易识别和记住您的网站。'
  },
  {
    q: '支持哪些图片格式？',
    a: '支持上传PNG、JPG、JPEG、GIF等常见图片格式，输出支持PNG和ICO格式。建议上传清晰的正方形图片，最佳尺寸为1024x1024像素。'
  },
  {
    q: '如何使用生成的Favicon？',
    a: '下载生成的文件后，将其重命名为favicon.ico（或favicon.png），放到网站根目录，并在HTML的<head>标签中添加相应的链接标签。具体代码在下载区域有提供。'
  },
  {
    q: '为什么要选择多个尺寸？',
    a: '不同设备和浏览器可能需要不同尺寸的图标。例如，16x16用于标签栏，32x32用于高分屏，而更大的尺寸如192x192用于移动设备添加到主屏幕时的图标。'
  },
  {
    q: 'PNG和ICO格式有什么区别？',
    a: 'ICO是传统的favicon格式，兼容性最好，可以包含多个尺寸。PNG格式更现代，文件更小，但需要在HTML中明确指定。建议根据实际需求选择合适的格式。'
  },
  {
    q: '生成的图标在某些浏览器中看不到怎么办？',
    a: '可能是浏览器缓存导致，请尝试清除浏览器缓存或使用Ctrl+F5强制刷新页面。如果问题仍然存在，请检查HTML代码是否正确添加。'
  }
]

// 状态管理
const fileInputRef = ref<HTMLInputElement | null>(null)
const cropperRef = ref<any>(null)
const isDragging = ref(false)
const imageUrl = ref('')
const previewUrl = ref('')
const downloadUrl = ref('')
const generating = ref(false)
const outputFormat = ref('ico')
const selectedSizes = ref<Array<number>>([])

// 可用尺寸
const availableSizes = [16, 32, 48, 64, 128, 256]
const previewSizes = [16, 24, 32, 48, 64, 128]

// 文件处理
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  // 检查文件大小限制
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    ElMessage.error('图片大小不能超过5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    // 重置其他状态
    downloadUrl.value = ''
    previewUrl.value = ''
    // 默认选择所有尺寸
    selectedSizes.value = [...availableSizes]
  }
  reader.readAsDataURL(file)
}

// 拖拽处理
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }

  const input = fileInputRef.value
  if (input) {
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    input.files = dataTransfer.files
    handleFileChange({ target: input } as unknown as Event)
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 创建 ICO 文件
function createIcoBlob(canvas: HTMLCanvasElement, size: number): Blob {
  // 创建指定尺寸的画布
  const resizedCanvas = document.createElement('canvas')
  resizedCanvas.width = size
  resizedCanvas.height = size
  const ctx = resizedCanvas.getContext('2d')
  if (!ctx) {
    throw new Error('无法创建画布上下文')
  }
  // 将图像绘制到指定尺寸
  ctx.drawImage(canvas, 0, 0, size, size)

  // 获取PNG数据
  const pngData = atob(resizedCanvas.toDataURL('image/png').split(',')[1]);
  const pngArray = new Uint8Array(pngData.length);
  for (let i = 0; i < pngData.length; i++) {
    pngArray[i] = pngData.charCodeAt(i);
  }

  // ICO文件头
  const iconDir = new Uint8Array([
    0, 0,             // Reserved (0)
    1, 0,             // Image type (1 = ICO)
    1, 0,             // Number of images
    size,             // Width
    size,             // Height
    0,                // Color palette
    0,                // Reserved
    1, 0,             // Color planes
    32, 0,            // Bits per pixel
    pngArray.length & 0xFF,               // Image size (low byte)
    (pngArray.length >> 8) & 0xFF,        // Image size
    (pngArray.length >> 16) & 0xFF,       // Image size
    (pngArray.length >> 24) & 0xFF,       // Image size (high byte)
    22, 0, 0, 0      // Offset to image data
  ]);

  // 合并ICO头和PNG数据
  const icoData = new Uint8Array(iconDir.length + pngArray.length);
  icoData.set(iconDir, 0);
  icoData.set(pngArray, iconDir.length);

  return new Blob([icoData], { type: 'image/x-icon' });
}

// 生成favicon
const generateFavicon = async () => {
  if (!cropperRef.value) {
    ElMessage.error('请先上传图片')
    return
  }

  if (selectedSizes.value.length === 0) {
    ElMessage.error('请至少选择一个输出尺寸')
    return
  }

  try {
    generating.value = true

    // 获取裁剪后的图片数据
    const canvas = cropperRef.value.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })

    // 更新预览
    previewUrl.value = canvas.toDataURL('image/png')

    if (outputFormat.value === 'png') {
      // 直接下载PNG
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b: Blob | null) => resolve(b!), 'image/png', 1)
      })
      downloadUrl.value = URL.createObjectURL(blob)
      ElMessage.success('PNG格式Favicon生成成功')
    } else {
      // 创建ZIP文件
      const zip = new JSZip()

      // 为每个选择的尺寸生成ICO文件
      for (const size of selectedSizes.value) {
        const icoBlob = createIcoBlob(canvas, size)
        zip.file(`favicon-${size}x${size}.ico`, icoBlob)
      }

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadUrl.value = URL.createObjectURL(zipBlob)
      ElMessage.success('多尺寸ICO文件生成成功')
    }
  } catch (error) {
    console.error('生成Favicon失败:', error)
    ElMessage.error('生成Favicon失败，请重试')
  } finally {
    generating.value = false
  }
}

// 下载favicon
const downloadFavicon = () => {
  if (!downloadUrl.value) return

  const link = document.createElement('a')
  link.href = downloadUrl.value
  const extension = outputFormat.value === 'png' ? 'png' : 'zip'
  link.download = outputFormat.value === 'png' ? 'favicon.png' : 'favicons.zip'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 清理 Blob URL
  URL.revokeObjectURL(downloadUrl.value)
  downloadUrl.value = ''
}

// 在 script setup 部分添加数据
const features = [
  {
    title: '多格式支持',
    desc: '支持PNG和ICO格式输出，满足不同场景需求',
    icon: 'Format'
  },
  {
    title: '多尺寸生成',
    desc: '支持生成多种尺寸的图标，适配各种设备显示',
    icon: 'Size'
  },
  {
    title: '本地处理',
    desc: '所有处理在浏览器本地完成，保护隐私安全',
    icon: 'Lock'
  },
  {
    title: '简单易用',
    desc: '直观的界面设计，一键生成所需图标',
    icon: 'Easy'
  }
]

// Get current route
const route = useRoute()
</script>

<style scoped>
.cropper-container {
  width: 100%;
  height: 400px;
}

/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
</style>
