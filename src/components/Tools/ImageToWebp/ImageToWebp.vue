<!--
  @file ImageToWebp.vue
  @description 图片格式转换工具组件，支持多种格式图片互相转换
  @copyright UIED技术团队 (https://fsuied.com)
  @author UIED技术团队
  @createDate 2024-12-22

  功能特性：
  1. 支持拖拽和点击上传图片
  2. 支持JPG、PNG、WebP、GIF等常见格式互相转换
  3. 支持调整图片质量和压缩率
  4. 支持批量转换多张图片
  5. 本地处理，无需上传服务器
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

        <!-- 文件上传区域 -->
        <div v-if="images.length === 0">
          <div
            class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white hover:border-blue-400"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/*" multiple
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileChange" />

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
              <p class="text-xs text-gray-400">支持 JPG、PNG、WebP、BMP、GIF 等常见格式</p>
              <p class="text-xs text-gray-400 mt-1">支持批量上传多张图片</p>
            </div>
          </div>
        </div>

        <!-- 图片转换工具区域 -->
        <div v-else class="space-y-4">
          <div class="border rounded-lg p-6 bg-white">
            <!-- 顶部工具栏 -->
            <div class="mb-6 flex flex-col space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <h3 class="text-sm font-medium text-gray-700">图片格式转换工具</h3>
                  <span class="text-xs text-gray-400">{{ images.length }}张图片</span>
                </div>
                <div class="flex items-center space-x-3">
                  <!-- 下载所有按钮 -->
                  <button v-if="hasConvertedImages" @click="downloadAllImages"
                    class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载全部</span>
                  </button>
                </div>
              </div>

              <!-- 转换设置 -->
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-700 mb-3">转换设置</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 输出格式选择 -->
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">输出格式</label>
                    <div class="mt-1">
                      <div class="flex flex-wrap gap-2">
                        <button v-for="format in outputFormats" :key="format" @click="selectedFormat = format" :class="[
                          'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                          selectedFormat === format
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        ]">
                          {{ format }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 质量设置 -->
                  <div>
                    <label class="text-sm text-gray-600 mb-1 block">质量 ({{ quality }}%)</label>
                    <div class="flex items-center space-x-2">
                      <input type="range" v-model="quality" min="10" max="100" step="1"
                        class="flex-1 accent-blue-500" />
                      <span class="text-xs text-gray-500 w-8 text-right">{{ quality }}%</span>
                    </div>
                    <p class="text-xs text-gray-400 mt-1">质量越高，文件体积越大</p>
                  </div>

                  <!-- 特殊选项 -->
                  <div>
                    <div v-if="selectedFormat === 'WEBP'" class="flex items-center mt-5">
                      <input id="lossless" type="checkbox" v-model="lossless" class="accent-blue-500 mr-2" />
                      <label for="lossless" class="text-sm text-gray-600">使用无损压缩</label>
                    </div>
                    <div v-if="selectedFormat === 'PNG'" class="flex items-center mt-5">
                      <input id="transparent" type="checkbox" v-model="transparent" class="accent-blue-500 mr-2" />
                      <label for="transparent" class="text-sm text-gray-600">保留透明度</label>
                    </div>
                    <div v-if="selectedFormat === 'JPG'" class="flex items-center mt-5">
                      <input id="progressive" type="checkbox" v-model="progressive" class="accent-blue-500 mr-2" />
                      <label for="progressive" class="text-sm text-gray-600">使用渐进式JPEG</label>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <button @click="convertAllImages" :disabled="isConverting"
                    class="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                    <span>{{ isConverting ? '转换中...' : '开始转换' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 图片预览区域 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(image, index) in images" :key="index"
                class="border rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
                <div class="relative">
                  <div class="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img :src="image.previewUrl" class="max-w-full max-h-full object-contain" />
                  </div>
                  <!-- 图像上方标签 -->
                  <div class="absolute top-2 left-2 flex space-x-2">
                    <span class="bg-gray-800/80 text-white text-xs rounded px-2 py-1">
                      {{ image.file.name.split('.').pop()?.toUpperCase() }}
                    </span>
                    <span class="bg-gray-800/80 text-white text-xs rounded px-2 py-1">
                      {{ formatFileSize(image.file.size) }}
                    </span>
                  </div>
                  <span v-if="image.convertedUrl"
                    class="absolute top-2 right-2 bg-green-500/90 text-white text-xs rounded px-2 py-1">
                    已转换
                  </span>
                </div>

                <div class="p-3 flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-medium text-gray-700 truncate" :title="image.file.name">
                      {{ image.file.name }}
                    </h5>
                  </div>

                  <!-- 转换结果 -->
                  <div v-if="image.convertedUrl" class="mt-2">
                    <div class="flex items-center justify-between text-xs text-gray-500">
                      <span>原始大小: {{ formatFileSize(image.file.size) }}</span>
                      <span>转换后: {{ formatFileSize(image.convertedSize) }}</span>
                      <span :class="image.convertedSize < image.file.size ? 'text-green-500' : 'text-orange-500'">
                        {{ image.convertedSize < image.file.size ? '节省' : '增加' }}: {{ calcSavings(image.file.size,
                          image.convertedSize) }} </span>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="mt-3 flex justify-between">
                    <button @click="removeImage(index)"
                      class="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center space-x-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>移除</span>
                    </button>
                    <button v-if="image.convertedUrl" @click="downloadImage(image)"
                      class="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center space-x-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>下载</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 操作提示 -->
            <div class="mt-4 flex justify-between items-center px-2">
              <button @click="clearImages"
                class="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>清除全部</span>
              </button>
              <div class="text-xs text-gray-400">
                <span>💡 全部转换完成后，可下载单张或全部转换后的图片</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8">
        <div class="space-y-6">
          <!-- 功能点展示 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">多格式转换</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">支持JPG、PNG、WebP、BMP等格式互相转换，满足不同场景需求，灵活切换图片格式</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">批量转换</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">一次性转换多张图片，提高工作效率，节省宝贵时间，支持打包下载</p>
            </div>

            <div class="bg-white border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">本地处理</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">所有图片在浏览器本地处理，无需上传服务器，保护隐私，提升速度</p>
            </div>
          </div>

          <!-- 常见问题解答 -->
          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index"
                class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mt-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import JSZip from 'jszip'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 获取当前路由
const route = useRoute()

// 组件配置信息
const info = reactive({
  title: "免费在线图片格式转换工具",
  subtitle: "支持JPG、PNG、WebP等多种格式互相转换，批量处理高效便捷"
})

// 转换格式选项
const outputFormats = ['JPG', 'PNG', 'WEBP', 'BMP']
const selectedFormat = ref('WEBP')

// 图片质量设置
const quality = ref(80)
const lossless = ref(false)
const transparent = ref(true)
const progressive = ref(false)
const isConverting = ref(false)

// 状态管理
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 图片数据结构
interface ImageItem {
  file: File;
  previewUrl: string;
  convertedUrl?: string;
  convertedSize?: number;
}

// 图片列表
const images = ref<ImageItem[]>([])

// 计算属性：是否有转换后的图片
const hasConvertedImages = computed(() => {
  return images.value.some(img => !!img.convertedUrl)
})

// 文件处理方法
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return

  addFiles(Array.from(input.files))
  // 重置文件输入，允许选择相同的文件
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  if (e.dataTransfer?.files.length) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

const addFiles = (files: File[]) => {
  // 过滤出图片文件
  const imageFiles = files.filter(file => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    ElMessage.warning('请只选择图片文件')
    return
  }

  // 添加到图片列表
  imageFiles.forEach(file => {
    const previewUrl = URL.createObjectURL(file)
    images.value.push({
      file,
      previewUrl
    })
  })
}

// 转换图片
const convertAllImages = async () => {
  if (images.value.length === 0 || isConverting.value) return

  isConverting.value = true

  try {
    // 一个个转换，避免浏览器卡顿
    for (let i = 0; i < images.value.length; i++) {
      const image = images.value[i]
      // 如果已经转换过则跳过
      if (image.convertedUrl) {
        // 释放之前的URL
        URL.revokeObjectURL(image.convertedUrl)
        image.convertedUrl = undefined
        image.convertedSize = undefined
      }

      await convertImage(image, i)
    }

    ElMessage.success('图片转换完成')
  } catch (error) {
    console.error('转换失败:', error)
    ElMessage.error('图片转换失败，请重试')
  } finally {
    isConverting.value = false
  }
}

const convertImage = (imageItem: ImageItem, index: number) => {
  return new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => {
      // 创建canvas
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')

      if (ctx) {
        // 绘制图像到canvas
        ctx.drawImage(img, 0, 0)

        // 根据选择的格式转换图片
        let mimeType: string;
        let qualityValue = quality.value / 100; // 0到1之间

        switch (selectedFormat.value) {
          case 'WEBP':
            mimeType = 'image/webp';
            break;
          case 'JPG':
            mimeType = 'image/jpeg';
            break;
          case 'PNG':
            mimeType = 'image/png';
            qualityValue = 1; // PNG不使用质量参数
            break;
          case 'BMP':
            mimeType = 'image/bmp';
            qualityValue = 1; // BMP不使用质量参数
            break;
          default:
            mimeType = 'image/webp';
        }

        // 特殊选项处理
        const options: any = {};
        if (selectedFormat.value === 'WEBP') {
          options.lossless = lossless.value;
        }

        canvas.toBlob((blob) => {
          if (blob) {
            // 创建预览URL
            const convertedUrl = URL.createObjectURL(blob)

            // 更新图片对象
            images.value[index] = {
              ...images.value[index],
              convertedUrl,
              convertedSize: blob.size
            }
          }
          resolve()
        }, mimeType, qualityValue)
      } else {
        resolve()
      }
    }

    img.onerror = () => {
      console.error('图片加载失败')
      ElMessage.error('图片加载失败')
      resolve()
    }

    img.src = imageItem.previewUrl
  })
}

// 下载转换后的图片
const downloadImage = (image: ImageItem) => {
  if (!image.convertedUrl) return

  const link = document.createElement('a')
  link.href = image.convertedUrl

  // 获取文件扩展名
  const fileExt = selectedFormat.value.toLowerCase()

  // 生成文件名：原文件名.新扩展名
  const fileName = image.file.name.split('.').slice(0, -1).join('.') || image.file.name
  link.download = `${fileName}.${fileExt}`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 下载所有已转换的图片
const downloadAllImages = async () => {
  const convertedImages = images.value.filter(img => !!img.convertedUrl)

  if (convertedImages.length === 0) return

  // 如果只有一张图片，直接下载
  if (convertedImages.length === 1) {
    downloadImage(convertedImages[0])
    return
  }

  try {
    // 添加提示信息
    ElMessage.info('正在打包文件，请稍候...')

    // 创建一个zip文件
    const zip = new JSZip()
    const folder = zip.folder('converted_images')

    // 获取文件扩展名
    const fileExt = selectedFormat.value.toLowerCase()

    // 添加所有转换后的图片到zip
    for (const image of convertedImages) {
      if (image.convertedUrl) {
        try {
          // 获取Blob数据
          const response = await fetch(image.convertedUrl)
          const blob = await response.blob()

          // 生成文件名：原文件名.新扩展名
          const fileName = image.file.name.split('.').slice(0, -1).join('.') || image.file.name
          folder?.file(`${fileName}.${fileExt}`, blob, { binary: true })
        } catch (error) {
          console.error('添加文件到压缩包失败:', error)
          continue
        }
      }
    }

    // 生成压缩包
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // 下载压缩包
    const link = document.createElement('a')
    const url = URL.createObjectURL(content)
    link.href = url
    link.download = `converted_images_${new Date().getTime()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 释放URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)

    ElMessage.success('图片打包下载成功')
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
  }
}

// 移除指定图片
const removeImage = (index: number) => {
  // 释放URL对象，避免内存泄漏
  URL.revokeObjectURL(images.value[index].previewUrl)
  if (images.value[index].convertedUrl) {
    URL.revokeObjectURL(images.value[index].convertedUrl)
  }

  // 从数组中移除
  images.value.splice(index, 1)
}

// 清除所有图片
const clearImages = () => {
  // 释放所有URL对象
  images.value.forEach(image => {
    URL.revokeObjectURL(image.previewUrl)
    if (image.convertedUrl) {
      URL.revokeObjectURL(image.convertedUrl)
    }
  })

  // 清空数组
  images.value = []
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 计算节省的百分比
const calcSavings = (originalSize: number, newSize: number): string => {
  const percent = Math.abs(((originalSize - newSize) / originalSize) * 100).toFixed(1)
  return percent + '%'
}

// 常见问题
const faq = [
  {
    q: '为什么需要图片格式转换？',
    a: '不同图片格式各有优势，如WebP提供高压缩率保持图像质量，PNG支持透明背景，JPG适合照片。根据使用场景选择合适格式可以平衡质量和文件大小。'
  },
  {
    q: '如何选择合适的图片格式？',
    a: 'WebP：适合网站图片，体积小且支持透明度；JPG：适合照片和色彩丰富的图像；PNG：适合需要透明背景的图像和图标；BMP：无损但体积大，适合需要高质量原始数据的场景。'
  },
  {
    q: '如何选择最佳质量设置？',
    a: '一般建议从80%的质量开始测试，对于大多数图像，这个设置可以在保持良好质量的同时显著减小文件大小。如果需要无损转换WebP，请启用"无损压缩"选项。'
  },
  {
    q: '有文件大小或数量限制吗？',
    a: '为了保证处理性能，建议每次上传不超过20张图片，单个图片大小不超过10MB。所有处理都在您的浏览器本地完成，不会上传到服务器。'
  },
  {
    q: '转换后的图片会有质量损失吗？',
    a: '这取决于所选格式和质量设置。使用高质量设置或无损选项可以最小化质量损失，但可能导致文件体积较大。不同格式之间的转换可能会有一些细微的质量变化。'
  }
]
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
