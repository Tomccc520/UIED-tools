<!--
 * @file ImgFormat.vue
 * @description 图片格式转换工具，支持多种格式互转
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持多种常见图片格式转换（JPEG、PNG、GIF、BMP、WebP等）
 * 2. 支持批量上传和处理
 * 3. 支持质量和大小调整
 * 4. 本地处理，保护图片隐私
 * 5. 支持实时预览和下载
-->

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import JSZip from 'jszip'

// Get current route
const route = useRoute()

// 组件配置信息
const info = reactive({
  title: "免费图片格式转换",
  subtitle: "适合摄影师、设计师、市场运营、白领文员等各类职业使用的图片格式转换工具。批量上传图片，将图片从 PNG、WebP、TIFF 格式转换为 JPG 格式，降低图片大小，适用更多场景。"
})

// 转换配置
const config = reactive({
  width: 0,
  height: 0,
  quality: 90,
  keepRatio: true,
  keepTransparency: false,
  outputFormat: 'jpg'
})

// 在 script setup 顶部添加类型定义
interface UploadFile {
  status: string;
  name: string;
  size: number;
  uid: string;
  url?: string;
  raw?: File;
}

// 修改 fileList 的类型声明
const fileList = ref<UploadFile[]>([])

// 状态管理
const uploadedFiles = new Set() // 用于跟踪已上传的文件
const isProcessing = ref(false) // 处理状态
const isDragging = ref(false) // 拖拽状态
const dataFileRef = ref() // 上传组件引用
const processedFiles = ref<Map<string, { blob: Blob, url: string }>>(new Map()) // 处理后的文件

// 支持的格式
const supportedFormats = {
  input: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'],
  output: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff']
}

// 功能特点
const features = [
  {
    title: '多格式转换',
    desc: '支持 PNG、WebP、TIFF、GIF 等多种格式互转，满足各类场景需求',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
  },
  {
    title: '批量处理',
    desc: '一键批量转换多个图片，智能处理，高效便捷',
    icon: 'M4 5a2 2 0 012-2h4.586A2 2 0 0112 3.586L15.414 7A2 2 0 0116 8.414V19a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm12 6a1 1 0 10-2 0v3a1 1 0 102 0v-3z'
  },
  {
    title: '本地处理',
    desc: '纯浏览器本地处理，无需上传服务器，确保文件安全',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    title: '专业调节',
    desc: '支持调整图片质量、尺寸、透明度等参数，输出最佳效果',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4'
  },
  {
    title: '智能压缩',
    desc: '先进压缩算法，平衡图片质量与文件大小',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    title: '一键导出',
    desc: '支持单个下载和批量打包，快速获取处理结果',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
  }
]

// 使用场景
const usageScenarios = [
  '摄影后期：将 RAW、TIFF 等专业格式转换为社交媒体适用的格式',
  '设计交付：快速转换设计稿格式，满足不同客户的交付要求',
  '内容创作：批量处理素材图片，优化尺寸和大小，提升发布效率',
  '文档处理：优化文档中的图片格式，减小文件体积，提升传输效率'
]

// 常见问题
const faqs = [
  {
    question: '支持哪些图片格式？',
    answer: '支持主流图片格式互转，包括 JPEG、PNG、WebP、GIF、BMP、TIFF 等，满足各类专业需求。'
  },
  {
    question: '如何保证转换质量？',
    answer: '提供 1-100 的精确质量调节，可根据需求平衡图片质量与文件大小，智能优化转换效果。'
  },
  {
    question: '如何保持透明效果？',
    answer: '转换为 PNG、WebP 等支持透明通道的格式时，可开启"保持透明度"选项，完美保留原图透明效果。'
  },
  {
    question: '对文件大小有限制吗？',
    answer: '单个文件建议不超过 20MB，以确保最佳转换效果。如需处理更大文件，建议先进行压缩。'
  }
]

/**
 * 处理文件变更
 * @param uploadFile 上传的文件对象
 * @param uploadFiles 所有上传的文件列表
 */
const handleChange = async (uploadFile: any, uploadFiles: any[]) => {
  try {
    // 如果文件已经在处理中，直接返回
    if (uploadFile.status !== 'ready') {
      return
    }

    // 确保获取到正确的文件对象
    const file = uploadFile.raw
    if (!file || !(file instanceof File)) {
      console.error('无效的文件对象:', file)
      return
    }

    // 验证文件
    if (!validateFile(file)) {
      const index = uploadFiles.findIndex(f => f.uid === uploadFile.uid)
      if (index !== -1) {
        uploadFiles.splice(index, 1)
      }
      return
    }

    // 设置文件状态
    uploadFile.status = 'ready'
    uploadFile.url = URL.createObjectURL(file)

  } catch (error) {
    console.error('文件上传失败:', error)
    ElMessage.error('文件上传失败，请重试')
  }
}

/**
 * 处理拖拽上传
 * @param e 拖拽事件
 */
const handleDrop = (e: DragEvent) => {
  console.log('处理拖拽上传事件')
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    console.log('拖拽的文件数量:', files.length)
    Array.from(files).forEach(file => {
      console.log('处理拖拽文件:', file.name)
      if (file.type.startsWith('image/')) {
        handleChange({ raw: file, status: 'ready' }, fileList.value)
      }
    })
  }
}

/**
 * 处理文件移除
 */
const handleRemove = (file: any) => {
  const index = fileList.value.findIndex(item => item.uid === file.uid)
  if (index !== -1) {
    // 从已上传文件集合中移除
    const fileId = `${file.name}-${file.size}`
    uploadedFiles.delete(fileId)

    // 从文件列表中移除
    fileList.value.splice(index, 1)
  }
}

/**
 * 转换图片格式
 */
const convertFormat = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传图片')
    return
  }

  isProcessing.value = true

  try {
    // 获取所有需要转换的文件
    const filesToProcess = fileList.value.filter(file =>
      file.status === 'ready' || file.status === 'error'
    )

    if (filesToProcess.length === 0) {
      ElMessage.warning('没有需要转换的文件')
      isProcessing.value = false
      return
    }

    // 设置状态为处理中
    filesToProcess.forEach(file => {
      file.status = 'processing'
    })

    // 逐个处理文件，避免并发导致的问题
    for (const file of filesToProcess) {
      try {
        const sourceFile = file.raw || file
        const result = await convertImage(sourceFile)
        processedFiles.value.set(file.uid, result)
        file.status = 'success'
      } catch (error) {
        console.error(`处理文件失败: ${file.name}`, error)
        file.status = 'error'
        ElMessage.error(`处理文件 ${file.name} 失败`)
      }
    }

    // 检查处理结果
    const successCount = filesToProcess.filter(f => f.status === 'success').length
    if (successCount > 0) {
      ElMessage.success(`成功转换 ${successCount} 个文件`)
    }

  } catch (error) {
    console.error('批量处理失败:', error)
    ElMessage.error('批量处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/**
 * 下载单个文件
 * @param file 文件信息
 */
const downloadFile = async (file: any) => {
  try {
    const processed = processedFiles.value.get(file.uid)
    if (!processed) {
      ElMessage.error('文件未转换或转换失败')
      return
    }

    const { blob } = processed
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name.split('.')[0]}.${config.outputFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请重试')
  }
}

/**
 * 下载所有转换后的图片
 */
const downloadAllImages = async () => {
  try {
    isProcessing.value = true

    // 检查是否有文件需要下载
    const successFiles = fileList.value.filter(file => file.status === 'success')
    if (successFiles.length === 0) {
      ElMessage.warning('没有可下载的文件')
      return
    }

    // 如果只有一个文件，直接下载
    if (successFiles.length === 1) {
      await downloadFile(successFiles[0])
      return
    }

    // 多个文件打包下载
    const zip = new JSZip()
    const folder = zip.folder('converted_images')

    // 添加进度提示
    ElMessage.info('正在打包文件，请稍候...')

    // 使用Promise.all并行处理所有文件
    await Promise.all(successFiles.map(async (file) => {
      const processed = processedFiles.value.get(file.uid)
      if (processed) {
        const { blob } = processed
        const fileName = `${file.name.split('.')[0]}.${config.outputFormat}`
        folder?.file(fileName, blob)
      }
    }))

    // 生成zip文件
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // 下载zip文件
    const link = document.createElement('a')
    const url = URL.createObjectURL(content)
    link.href = url
    link.download = `converted_images_${new Date().getTime()}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理URL
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)

    ElMessage.success('文件打包下载成功')
  } catch (error) {
    console.error('打包下载失败:', error)
    ElMessage.error('打包下载失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/**
 * 清除所有图片
 */
const clearAll = () => {
  // 清除文件列表前先移除监听器
  const unwatchFileList = watch(fileList, () => {}, { deep: true })

  try {
    // 清除文件列表
    fileList.value = []

    // 清除已处理的文件
    processedFiles.value.forEach(({ url }) => {
      URL.revokeObjectURL(url)
    })
    processedFiles.value.clear()

    // 重置状态
    isProcessing.value = false

    // 重置上传组件
    if (dataFileRef.value) {
      dataFileRef.value.clearFiles()
    }
  } finally {
    // 恢复监听器
    unwatchFileList()
  }
}

/**
 * 格式化文件大小
 * @param size 文件大小（字节）
 */
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
  }
}

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'danger'
    case 'processing':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '已完成'
    case 'error':
      return '失败'
    case 'processing':
      return '转换中'
    default:
      return '待转换'
  }
}

// 修改 convertImage 函数
const convertImage = async (file: any): Promise<{ blob: Blob, url: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const handleLoad = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('无法创建Canvas上下文')
        }

        // 设置输出尺寸
        let outputWidth = config.width || img.naturalWidth
        let outputHeight = config.height || img.naturalHeight

        // 如果需要保持比例
        if (config.keepRatio && (config.width || config.height)) {
          const ratio = img.naturalWidth / img.naturalHeight
          if (config.width && !config.height) {
            outputHeight = outputWidth / ratio
          } else if (!config.width && config.height) {
            outputWidth = outputHeight * ratio
          } else {
            const newRatio = outputWidth / outputHeight
            if (newRatio > ratio) {
              outputWidth = outputHeight * ratio
            } else {
              outputHeight = outputWidth / ratio
            }
          }
        }

        canvas.width = outputWidth
        canvas.height = outputHeight

        // 如果是PNG转JPG/JPEG，先填充白色背景
        if (config.outputFormat === 'jpg' || config.outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, outputWidth, outputHeight)
        }

        // 绘制图片
        ctx.drawImage(img, 0, 0, outputWidth, outputHeight)

        // 根据输出格式和透明度设置调整质量
        let mimeType = `image/${config.outputFormat}`
        let quality = config.quality / 100

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('转换失败'))
              return
            }
            const url = URL.createObjectURL(blob)
            resolve({ blob, url })
          },
          mimeType,
          quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onload = handleLoad
    img.onerror = () => reject(new Error('图片加载失败'))

    // 修改文件处理逻辑
    try {
      let imageUrl: string
      if (file instanceof File) {
        imageUrl = URL.createObjectURL(file)
      } else if (file.raw instanceof File) {
        imageUrl = URL.createObjectURL(file.raw)
      } else if (file.url) {
        imageUrl = file.url
      } else {
        throw new Error('无效的文件格式')
      }

      img.src = imageUrl

      // 在图片加载完成后清理 URL
      const originalOnload = img.onload
      img.onload = (event) => {
        if (file instanceof File || file.raw instanceof File) {
          URL.revokeObjectURL(imageUrl)
        }
        if (originalOnload && typeof originalOnload === 'function') {
          originalOnload.call(img, event)
        }
      }
    } catch (error) {
      reject(error)
    }
  })
}

// 计算图片复杂度的辅助函数
const calculateImageComplexity = (imageData: ImageData): number => {
  const data = imageData.data
  let complexity = 0
  let lastPixel = 0

  // 采样计算图片的复杂度（颜色变化程度）
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const pixel = (r + g + b) / 3

    // 计算与上一个像素的差异
    complexity += Math.abs(pixel - lastPixel)
    lastPixel = pixel
  }

  // 归一化复杂度值到0-1范围
  return Math.min(complexity / (data.length / 4), 1)
}

// 获取处理后的文件大小
const getProcessedFileSize = (uid: string) => {
  const processed = processedFiles.value.get(uid)
  return processed ? formatFileSize(processed.blob.size) : '-'
}

// 监听输出格式变化
watch(() => config.outputFormat, () => {
  fileList.value.forEach(file => {
    if (file.status === 'success') {
      file.status = 'ready'
      const oldResult = processedFiles.value.get(file.uid)
      if (oldResult) {
        URL.revokeObjectURL(oldResult.url)
        processedFiles.value.delete(file.uid)
      }
    }
  })
})

// 修改文件列表监听
const unwatchFileList = watch(fileList, (newFiles) => {
  // 避免递归调用
  if (newFiles.length === 0 && processedFiles.value.size > 0) {
    // 只在有处理过的文件时才清理
    processedFiles.value.forEach(({ url }) => {
      URL.revokeObjectURL(url)
    })
    processedFiles.value.clear()

    // 重置状态
    isProcessing.value = false
  }
}, { deep: true })

// 组件卸载时清理
onUnmounted(() => {
  unwatchFileList()
  // 清理所有 URL
  processedFiles.value.forEach(({ url }) => {
    URL.revokeObjectURL(url)
  })
})

// 添加文件验证函数
const validateFile = (file: File): boolean => {
  // 检查文件大小
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过20MB')
    return false
  }

  // 检查文件格式
  const format = file.name.split('.').pop()?.toLowerCase()
  if (!format || !supportedFormats.input.includes(format)) {
    ElMessage.error('不支持的文件格式')
    return false
  }

  return true
}

// 添加获取预览URL的函数
const getPreviewUrl = (file: any): string => {
  if (file.status === 'success') {
    const processed = processedFiles.value.get(file.uid)
    return processed?.url || file.url
  }
  return file.url
}
</script>

<template>
  <div class="min-h-screen py-8 bg-gray-50">
    <div class="max-w-[1440px] mx-auto px-4">
      <!-- 标题区域 - 替换原来的 DetailHeader -->
      <div class="text-center mb-8">
        <h1 class="text-[32px] font-medium text-gray-900 mb-3">{{ info.title }}</h1>
        <p class="text-base text-gray-500">{{ info.subtitle }}</p>
      </div>

      <!-- 主要内容区域 - 添加新的卡片样式 -->
      <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <!-- 上传区域 - 保持原有功能，修改样式 -->
        <div class="relative border-2 border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center bg-gray-50"
          :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false">
          <el-upload
            v-model:file-list="fileList"
            class="upload-area"
            ref="dataFileRef"
            accept="image/*"
            :auto-upload="false"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :limit="30"
            :disabled="fileList.length > 0"
            :show-file-list="false"
            multiple
            drag>
            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">
                {{ fileList.length > 0 ? '请先清除当前文件' : '点击或拖拽图片到这里' }}
              </div>
              <p class="text-xs text-gray-400">支持JPG、PNG、WebP等格式，单个文件不超过20MB</p>
              <p class="text-xs text-gray-400 mt-1">最多可上传30张图片</p>
            </div>
          </el-upload>
        </div>

        <!-- 转换设置 - 调整样式 -->
        <div v-if="fileList.length > 0" class="bg-gray-50 rounded-lg p-6 mt-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-medium text-gray-700">转换设置</h3>
              <span class="text-xs text-gray-400">设置输出参数</span>
            </div>
            <div class="flex items-center space-x-3">
              <el-button type="primary" @click="convertFormat" :loading="isProcessing" :disabled="isProcessing">
                开始转换
              </el-button>
              <el-button @click="clearAll" :disabled="isProcessing">
                清除全部
              </el-button>
            </div>
          </div>

          <!-- 设置选项 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 格式选择 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">输出格式</label>
              <el-select v-model="config.outputFormat" class="w-full">
                <el-option v-for="format in supportedFormats.output"
                          :key="format"
                          :label="format.toUpperCase()"
                          :value="format" />
              </el-select>
            </div>

            <!-- 质量设置 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">输出质量</label>
              <el-slider v-model="config.quality" :min="1" :max="100" :step="1" show-input />
            </div>

            <!-- 尺寸设置 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">输出尺寸</label>
              <div class="flex items-center space-x-2">
                <el-input-number v-model="config.width" :min="0" :step="1" placeholder="宽度" class="flex-1" />
                <span class="text-gray-400">×</span>
                <el-input-number v-model="config.height" :min="0" :step="1" placeholder="高度" class="flex-1" />
                <el-checkbox v-model="config.keepRatio">保持比例</el-checkbox>
              </div>
            </div>

            <!-- 其他选项 -->
            <div class="space-y-2">
              <label class="text-sm text-gray-600">其他选项</label>
              <div class="space-y-2">
                <el-checkbox v-model="config.keepTransparency">保持透明度</el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件列表 - 调整样式 -->
        <div v-if="fileList.length > 0" class="bg-white rounded-lg p-6 border mt-6">
          <!-- 列表标题和批量下载 -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-700">文件列表</h3>
            <el-button type="primary"
                      @click="downloadAllImages"
                      :disabled="!fileList.some(file => file.status === 'success')">
              全部下载
            </el-button>
          </div>

          <!-- 文件表格 -->
          <el-table :data="fileList" style="width: 100%">
            <el-table-column prop="name" label="文件名" />
            <el-table-column label="原始格式" width="100">
              <template #default="scope">
                {{ scope.row.name.split('.').pop()?.toUpperCase() }}
              </template>
            </el-table-column>
            <el-table-column label="转换格式" width="100">
              <template #default="scope">
                {{ scope.row.status === 'success' ? config.outputFormat.toUpperCase() : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="原始大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="转换后大小" width="120">
              <template #default="scope">
                {{ getProcessedFileSize(scope.row.uid) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag size="small" :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="预览" width="80">
              <template #default="scope">
                <el-image
                  :src="getPreviewUrl(scope.row)"
                  :preview-src-list="[getPreviewUrl(scope.row)]"
                  fit="cover"
                  class="w-8 h-8 rounded cursor-pointer"
                  :preview-teleported="true"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="downloadFile(scope.row)"
                  :disabled="scope.row.status !== 'success'">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h2 class="text-xl font-medium text-gray-900 mb-6">功能特点</h2>
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(feature, index) in features"
               :key="index"
               class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24">
                <path :d="feature.icon"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">{{ feature.title }}</h3>
                <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 适用场景 -->
      <div class="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <h2 class="text-xl font-medium text-gray-900 mb-6">适用场景</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="(text, index) in usageScenarios"
               :key="index"
               class="flex items-start space-x-2">
            <svg class="w-4 h-4 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <p class="text-sm text-gray-600">{{ text }}</p>
          </div>
        </div>
      </div>

      <!-- 常见问题 -->
      <div class="mt-8 bg-white rounded-lg p-6 border">
        <h2 class="text-xl font-medium text-gray-900 mb-6">常见问题解答</h2>
        <div class="space-y-6">
          <div v-for="(item, index) in faqs"
               :key="index"
               class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 class="text-lg font-medium text-gray-800 mb-2">{{ item.question }}</h3>
            <p class="text-gray-600">{{ item.answer }}</p>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" class="mt-8" />
    </div>
  </div>
</template>

<style scoped>
/* 上传组件样式 */
.upload-area {
  width: 100%;
  height: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
}

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-border: 1px solid var(--el-table-border-color);
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background-color: var(--el-fill-color-light);
}

/* 预览图片样式 */
:deep(.el-image) {
  border-radius: 4px;
  overflow: hidden;
}
</style>
