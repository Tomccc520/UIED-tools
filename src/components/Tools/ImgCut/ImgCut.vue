<!--
 * @file ImgCut.vue
 * @description 图片切割工具组件，支持自定义行列数的九宫格切图
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传图片
 * 2. 支持自定义行列数（1-10）的切割
 * 3. 支持JPG、PNG、WebP等主流格式
 * 4. 本地处理，保护图片隐私
 * 5. 支持批量下载切割后的图片（支持打包下载）
-->

<script setup lang="ts">
import type { UploadProps, UploadRawFile, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { genFileId } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import JSZip from 'jszip'
import { ref, computed, watch, onMounted } from '@vue/runtime-core'

const route = useRoute()

// 组件配置信息
const info = {
  title: "免费九宫格图片切割",
  subtitle: "专业的在线图片切割工具，支持自定义行列数的九宫格切图"
}

// 状态管理
const fileList = ref<UploadFile[]>([]) // 上传的文件列表
const lineNum = ref(3) // 切割的行列数
const image = ref({} as any) // 当前处理的图片
const cutImg = ref<string[]>([]) // 切割后的图片列表
const dataFileRef = ref() // 上传组件引用
const isDragging = ref(false) // 拖拽状态
const isProcessing = ref(false) // 处理状态

// 功能特点
const features = [
  {
    title: '自定义切割',
    desc: '支持1-10行列的自定义切割，满足不同场景需求'
  },
  {
    title: '高清切割',
    desc: '保持原图质量，确保切割后的图片清晰度不会降低'
  },
  {
    title: '便捷操作',
    desc: '简单直观的操作界面，一键生成所需的切割效果'
  }
]

// 适用场景
const usageScenarios = [
  '社交媒体：制作朋友圈九宫格、微博组图',
  '电商运营：制作商品展示组图',
  '设计创作：将大图分割成小图组合',
  '日常应用：制作照片墙、拼图素材'
]

// 常见问题
const faqs = [
  {
    question: '为什么我的图片无法上传？',
    answer: '请确保您的图片格式为JPG、PNG或WebP，且文件大小不超过20MB。如果仍然无法上传，请尝试刷新页面后重试。'
  },
  {
    question: '切割后的图片质量会降低吗？',
    answer: '不会。我们采用高保真切割技术，确保切割后的图片保持原图质量，不会造成清晰度损失'
  },
  {
    question: '支持批量处理图片吗？',
    answer: '目前仅支持单张图片处理。建议您一次处理一张图片，以确保最佳切割效果。'
  },
  {
    question: '如何选择合适的切割行列数？',
    answer: '根据您的使用场景选择：九宫格选择3x3，朋友圈组图可选择2x2或3x3，商品展示可根据需要自定义1-10的任意行列数。'
  }
]

/**
 * 处理图片上传
 * @param params 上传参数
 */
const updateDataFile = async (params: { file: File }) => {
  try {
    isProcessing.value = true
    let reader = new FileReader()
    reader.readAsDataURL(params.file)
    reader.addEventListener(
      'load',
      async () => {
        const imageTmp = new Image()
        imageTmp.onload = () => {
          image.value = imageTmp
          cut()
          isProcessing.value = false
        }
        imageTmp.src = reader.result as string
      },
      false
    )
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
    isProcessing.value = false
  }
}

/**
 * 处理超出上传限制
 * @param files 超出限制的文件列表
 */
const handleExceed: UploadProps['onExceed'] = (files: File[]) => {
  dataFileRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  dataFileRef.value!.handleStart(file)
  dataFileRef.value!.submit()
}

/**
 * 处理拖拽上传
 * @param e 拖拽事件
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    const uploadParams = { file }
    updateDataFile(uploadParams)
  }
}

/**
 * 处理文件输入改变
 */
const handleFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    updateDataFile({ file: input.files[0] })
  }
  input.value = ''
}

/**
 * 触发文件选择
 */
const triggerFileInput = () => {
  dataFileRef.value?.click()
}

/**
 * 切割图片
 * 将图片按照设定的行列数进行等分切割
 */
const cut = () => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = image.value

    // 计算每个切片的宽高
    const wpiece = Math.floor(img.naturalWidth / lineNum.value)
    const hpiece = Math.floor(img.naturalHeight / lineNum.value)
    const results: string[] = []

    canvas.width = wpiece
    canvas.height = hpiece

    // 按行列进行切割
    for (let r = 0; r < lineNum.value; r++) {
      for (let c = 0; c < lineNum.value; c++) {
        ctx?.drawImage(
          img,
          c * wpiece,
          r * hpiece,
          wpiece,
          hpiece,
          0,
          0,
          wpiece,
          hpiece
        )
        results.push(canvas.toDataURL('image/png', 0.9))
      }
    }
    cutImg.value = results
  } catch (error) {
    console.error('图片切割失败:', error)
    ElMessage.error('图片切割失败，请重试')
  }
}

/**
 * 计算切割预览的样式
 */
const cutImgStyle = computed(() => {
  // 限制最大宽度为600px或窗口宽度的70%
  const maxWidth = Math.min(600, window.innerWidth * 0.7)
  // 使用图片原始宽度和最大宽度的较小值
  const width = `width: ${Math.min(image.value.naturalWidth || maxWidth, maxWidth)}px`
  const grid = `grid: repeat(${lineNum.value}, 1fr) / repeat(${lineNum.value}, 1fr)`
  return `${width}; ${grid}`
})

/**
 * 清除图片
 */
const clearImage = () => {
  image.value = {}
  cutImg.value = []
  fileList.value = []
}

/**
 * 下载切割后的图片（打包下载）
 */
const downloadImages = async () => {
  try {
    isProcessing.value = true
    const zip = new JSZip()
    const folder = zip.folder('uied_cut_images')

    // 添加图片到压缩包
    for (let i = 0; i < cutImg.value.length; i++) {
      const imgData = cutImg.value[i].split('base64,')[1]
      folder?.file(`uied_cut_${i + 1}.png`, imgData, { base64: true })
    }

    // 生成压缩包
    const content = await zip.generateAsync({ type: 'blob' })

    // 下载压缩包
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = 'uied_cut_images.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('图片打包下载成功')
  } catch (error) {
    console.error('图片下载失败:', error)
    ElMessage.error('图片打包下载失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 监听切割样式变化，重新进行切割
watch(lineNum, () => {
  if (image.value.src) {
    cut()
  }
})

// 组件挂载完成
onMounted(() => {
  // 初始化操作（如果需要）
})
</script>

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

        <div class="grid grid-cols-1 gap-8">
          <!-- 上传区域 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div
              class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
              @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
              <input ref="dataFileRef" type="file" class="hidden" accept="image/*" @change="handleFileInputChange" />
              <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>
              <div class="text-center px-4">
                <div class="w-8 h-8 mb-2 mx-auto">
                  <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
                <p class="text-xs text-gray-400 mb-1">支持 JPG、PNG、WebP 等格式</p>
                <p class="text-xs text-gray-400">建议上传清晰的图片以获得更好的切割效果</p>
              </div>
            </div>
          </div>

          <!-- 切割设置 -->
          <div v-if="image.src" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">切割设置</div>
            <div class="flex items-center gap-4">
              <div class="flex-1">
                <label class="text-sm font-medium text-gray-700 mb-2 block">切割行列数</label>
                <el-slider v-model="lineNum" :min="1" :max="10" :step="1" show-stops class="!max-w-md" />
              </div>
              <div class="flex items-center gap-3">
                <el-button type="default" class="!h-10" @click="clearImage">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>清除</span>
                  </div>
                </el-button>
                <el-button type="primary" class="!h-10 !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300"
                  :loading="isProcessing" @click="downloadImages">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>下载</span>
                  </div>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 切割预览 -->
          <div v-if="cutImg.length" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">切割预览</div>
            <div class="flex justify-center">
              <div class="grid gap-1 bg-gray-50 p-2 rounded-lg" :style="cutImgStyle">
                <div v-for="(item, index) in cutImg" :key="index" class="aspect-square overflow-hidden">
                  <img :src="item" class="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 适用场景 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">适用场景</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(scenario, index) in usageScenarios" :key="index"
                class="flex items-center gap-3 text-gray-600">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <p class="text-sm">{{ scenario }}</p>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="faq in faqs" :key="faq.question"
                class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ faq.question }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ faq.answer }}</p>
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

/* 预览图片样式 */
img {
  max-width: 100%;
  height: auto;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

/* 切割预览网格样式 */
.cut-grid {
  gap: 2px;
  padding: 2px;
  border-radius: 0.5rem;
  margin: 0 auto;
  display: grid;
}
</style>
