<!--
 * @file ImgWatermark.vue
 * @description 图片批量水印工具组件，支持自定义文字、图片水印
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持拖拽和点击批量上传图片
 * 2. 支持文字水印和图片水印
 * 3. 支持自定义水印位置、透明度、大小
 * 4. 支持JPG、PNG、WebP等主流格式
 * 5. 本地处理，保护图片隐私
 * 6. 支持批量下载处理后的图片
-->

<script setup lang="ts">
import type { UploadProps, UploadRawFile, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { genFileId } from 'element-plus'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import * as JSZip from 'jszip'
import { ref, computed, watch, onMounted } from '@vue/runtime-core'

const route = useRoute()

// 组件配置信息
const info = {
  title: "免费批量添加图片水印",
  subtitle: "专业的在线图片水印工具，支持批量添加文字或图片水印"
}

// 状态管理
const fileList = ref<UploadFile[]>([]) // 上传的文件列表
const watermarkText = ref('') // 水印文字
const watermarkImage = ref<File | null>(null) // 水印图片
const watermarkPosition = ref('bottomRight') // 水印位置
const watermarkOpacity = ref(0.5) // 水印透明度
const watermarkSize = ref(30) // 水印大小
const processedImages = ref<string[]>([]) // 处理后的图片列表
const dataFileRef = ref() // 上传组件引用
const isDragging = ref(false) // 拖拽状态
const isProcessing = ref(false) // 处理状态
const watermarkType = ref('text') // 水印类型：text/image
const watermarkDensity = ref(1.5) // 水印密度，默认1.5
const watermarkImagePreview = ref('')

// 水印位置选项
const positionOptions = [
  { label: '左上角', value: 'topLeft' },
  { label: '右上角', value: 'topRight' },
  { label: '左下角', value: 'bottomLeft' },
  { label: '右下角', value: 'bottomRight' },
  { label: '居中', value: 'center' },
  { label: '全局铺满', value: 'tile' }
]

// 功能特点
const features = [
  {
    title: '批量处理',
    desc: '支持多张图片同时添加水印，提高工作效率'
  },
  {
    title: '多样水印',
    desc: '支持文字水印和图片水印，满足不同场景需求'
  },
  {
    title: '自定义设置',
    desc: '可调节水印位置、透明度、大小等参数'
  }
]

// 适用场景
const usageScenarios = [
  '摄影作品：为照片添加版权保护',
  '电商运营：为商品图片添加品牌标识',
  '设计创作：为设计作品添加作者签名',
  '营销推广：为宣传图片添加品牌logo'
]

// 常见问题
const faqs = [
  {
    question: '支持哪些图片格式？',
    answer: '支持JPG、PNG、WebP等主流图片格式，单个文件大小不超过20MB。'
  },
  {
    question: '水印会影响原图质量吗？',
    answer: '不会。我们采用高质量的图片处理技术，确保添加水印后图片质量不会明显降低。'
  },
  {
    question: '有批量处理数量限制吗？',
    answer: '为了确保处理效率，建议单次上传不超过50张图片。如需处理更多图片，可分批进行。'
  },
  {
    question: '如何选择合适的水印设置？',
    answer: '建议根据图片用途选择：版权保护选择半透明文字水印，品牌推广选择logo图片水印，注意调整大小和位置以不影响主体内容。'
  }
]

/**
 * 处理图片上传
 * @param params 上传参数
 */
const handleFileUpload = async (params: { file: File }) => {
  try {
    const file = params.file
    if (!file || !file.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件')
      return
    }
    fileList.value.push({
      name: file.name,
      raw: file,
      uid: genFileId()
    } as UploadFile)
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
  }
}

/**
 * 处理超出上传限制
 */
const handleExceed: UploadProps['onExceed'] = (files: File[], uploadFiles: UploadFile[]) => {
  ElMessage.warning(`单次最多上传50张图片`)
}

/**
 * 处理拖拽上传
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        handleFileUpload({ file: file as Blob as File })
      }
    })
  }
}

/**
 * 添加水印到图片
 * @param image 原始图片
 * @returns Promise<string> 处理后的图片base64
 */
const addWatermark = (image: HTMLImageElement): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      resolve(canvas.toDataURL('image/png', 0.9))
      return
    }

    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    // 绘制原图
    ctx.drawImage(image, 0, 0)

    if (watermarkType.value === 'text' && watermarkText.value) {
      // 设置文字样式
      ctx.font = `${watermarkSize.value}px Arial`
      ctx.fillStyle = `rgba(0, 0, 0, ${watermarkOpacity.value})`
      ctx.globalAlpha = 1

      const textWidth = ctx.measureText(watermarkText.value).width
      const textHeight = watermarkSize.value

      if (watermarkPosition.value === 'tile') {
        // 保存当前上下文状态
        ctx.save()

        // 设置旋转角度（45度）
        const angle = Math.PI / 4

        // 使用密度参数计算间距
        const spacing = Math.max(textWidth, textHeight) * watermarkDensity.value

        // 计算需要重复的次数（增加覆盖范围）
        const repeatX = Math.ceil(canvas.width * 2 / spacing)
        const repeatY = Math.ceil(canvas.height * 2 / spacing)

        // 调整起始偏移，使边缘也能覆盖到
        const offsetX = -spacing / 2
        const offsetY = -spacing / 2

        // 循环绘制水印
        for (let i = 0; i < repeatX; i++) {
          for (let j = 0; j < repeatY; j++) {
            const x = offsetX + i * spacing
            const y = offsetY + j * spacing

            ctx.translate(x, y)
            ctx.rotate(angle)
            ctx.fillText(watermarkText.value, 0, 0)
            ctx.rotate(-angle)
            ctx.translate(-x, -y)
          }
        }

        // 恢复上下文状态
        ctx.restore()
      } else {
        // 单个水印位置逻辑
        let x = 0, y = 0
        const padding = 20

        switch (watermarkPosition.value) {
          case 'topLeft':
            x = padding
            y = padding + watermarkSize.value
            break
          case 'topRight':
            x = canvas.width - textWidth - padding
            y = padding + watermarkSize.value
            break
          case 'bottomLeft':
            x = padding
            y = canvas.height - padding
            break
          case 'bottomRight':
            x = canvas.width - textWidth - padding
            y = canvas.height - padding
            break
          case 'center':
            x = (canvas.width - textWidth) / 2
            y = canvas.height / 2
            break
        }

        ctx.fillText(watermarkText.value, x, y)
      }
      resolve(canvas.toDataURL('image/png', 0.9))
    } else if (watermarkType.value === 'image' && watermarkImage.value) {
      // 创建水印图片对象
      const watermarkImg = new Image()
      watermarkImg.onload = () => {
        // 计算水印图片的大小
        const maxSize = watermarkSize.value
        const scale = Math.min(maxSize / watermarkImg.width, maxSize / watermarkImg.height)
        const width = watermarkImg.width * scale
        const height = watermarkImg.height * scale

        ctx.globalAlpha = watermarkOpacity.value

        if (watermarkPosition.value === 'tile') {
          // 保存当前上下文状态
          ctx.save()

          // 设置旋转角度（45度）
          const angle = Math.PI / 4

          // 使用密度参数计算间距
          const spacing = Math.max(width, height) * watermarkDensity.value

          // 计算需要重复的次数
          const repeatX = Math.ceil(canvas.width * 2 / spacing)
          const repeatY = Math.ceil(canvas.height * 2 / spacing)

          // 调整起始偏移
          const offsetX = -spacing / 2
          const offsetY = -spacing / 2

          // 循环绘制水印
          for (let i = 0; i < repeatX; i++) {
            for (let j = 0; j < repeatY; j++) {
              const x = offsetX + i * spacing
              const y = offsetY + j * spacing

              ctx.translate(x, y)
              ctx.rotate(angle)
              ctx.drawImage(watermarkImg, -width / 2, -height / 2, width, height)
              ctx.rotate(-angle)
              ctx.translate(-x, -y)
            }
          }

          // 恢复上下文状态
          ctx.restore()
        } else {
          // 单个水印位置逻辑
          let x = 0, y = 0
          const padding = 20

          switch (watermarkPosition.value) {
            case 'topLeft':
              x = padding
              y = padding
              break
            case 'topRight':
              x = canvas.width - width - padding
              y = padding
              break
            case 'bottomLeft':
              x = padding
              y = canvas.height - height - padding
              break
            case 'bottomRight':
              x = canvas.width - width - padding
              y = canvas.height - height - padding
              break
            case 'center':
              x = (canvas.width - width) / 2
              y = (canvas.height - height) / 2
              break
          }

          ctx.drawImage(watermarkImg, x, y, width, height)
        }

        resolve(canvas.toDataURL('image/png', 0.9))
      }

      watermarkImg.src = URL.createObjectURL(watermarkImage.value)
      watermarkImg.onerror = () => {
        console.error('水印图片加载失败')
        resolve(canvas.toDataURL('image/png', 0.9))
      }
    } else {
      resolve(canvas.toDataURL('image/png', 0.9))
    }
  })
}

/**
 * 处理所有图片
 */
const processImages = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传图片')
    return
  }

  if (watermarkType.value === 'text' && !watermarkText.value) {
    ElMessage.warning('请输入水印文字')
    return
  }

  try {
    isProcessing.value = true
    processedImages.value = []

    for (const file of fileList.value) {
      if (file.raw) {
        const reader = new FileReader()
        await new Promise((resolve) => {
          reader.onload = async (e) => {
            const img = new Image()
            img.onload = async () => {
              const processedImage = await addWatermark(img)
              processedImages.value.push(processedImage)
              resolve(null)
            }
            img.src = e.target?.result as string
          }
          reader.readAsDataURL(file.raw as Blob)
        })
      }
    }

    ElMessage.success('图片处理完成')
  } catch (error) {
    console.error('图片处理失败:', error)
    ElMessage.error('图片处理失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

/**
 * 下载处理后的图片
 */
const downloadImages = async () => {
  if (processedImages.value.length === 0) {
    ElMessage.warning('请先处理图片')
    return
  }

  try {
    isProcessing.value = true
    const zip = new JSZip()
    const folder = zip.folder('watermarked_images')

    processedImages.value.forEach((imgData, index) => {
      const data = imgData.split('base64,')[1]
      folder?.file(`watermarked_${index + 1}.png`, data, { base64: true })
    })

    const content = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = 'watermarked_images.zip'
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

/**
 * 清除图片
 */
const clearImages = () => {
  fileList.value = []
  processedImages.value = []
}

/**
 * 处理水印图片上传
 * @param params 上传参数
 */
const handleWatermarkImageUpload = (params: { file: File }) => {
  try {
    const file = params.file
    if (!file || !file.type.startsWith('image/')) {
      ElMessage.error('请上传图片文件')
      return
    }
    watermarkImage.value = file
    watermarkImagePreview.value = URL.createObjectURL(file)
    ElMessage.success('水印图片上传成功')
  } catch (error) {
    console.error('水印图片上传失败:', error)
    ElMessage.error('水印图片上传失败，请重试')
  }
}

// 组件挂载完成
onMounted(() => {
  // 初始化操作（如果需要）
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 标题区域 -->
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
              <el-upload v-model:file-list="fileList" class="upload-area" ref="dataFileRef" accept="image/*"
                :auto-upload="false"
                :on-change="(uploadFile: UploadFile) => handleFileUpload({ file: uploadFile.raw as File })"
                :on-exceed="handleExceed" :limit="50" multiple drag>
                <div class="text-center px-4">
                  <div class="w-8 h-8 mb-2 mx-auto">
                    <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片到这里</div>
                  <p class="text-xs text-gray-400">支持批量上传，单次最多50张图片</p>
                </div>
              </el-upload>
            </div>
          </div>

          <!-- 水印设置区域 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">水印设置</h3>
              <div class="flex space-x-3">
                <el-button type="primary" @click="processImages" :loading="isProcessing"
                  class="!bg-blue-500 hover:!bg-blue-600 transition-colors duration-300">
                  添加水印
                </el-button>
                <el-button @click="downloadImages" :disabled="processedImages.length === 0 || isProcessing">
                  打包下载
                </el-button>
                <el-button @click="clearImages" :disabled="isProcessing">
                  清除图片
                </el-button>
              </div>
            </div>

            <div class="space-y-6">
              <!-- 水印类型选择 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印类型</label>
                  <el-radio-group v-model="watermarkType" class="flex space-x-4">
                    <el-radio :value="'text'">文字水印</el-radio>
                    <el-radio :value="'image'">图片水印</el-radio>
                  </el-radio-group>
                </div>
              </div>

              <!-- 水印内容设置 -->
              <div v-if="watermarkType === 'text'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印文字</label>
                  <el-input v-model="watermarkText" placeholder="请输入水印文字" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">文字大小</label>
                  <el-slider v-model="watermarkSize" :min="12" :max="72" />
                </div>
              </div>
              <div v-else class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印图片</label>
                  <div class="space-y-2">
                    <el-upload class="w-full" accept="image/*" :auto-upload="false" :show-file-list="false"
                      :on-change="(uploadFile: UploadFile) => handleWatermarkImageUpload({ file: uploadFile.raw as File })">
                      <el-button type="primary"
                        class="w-full !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300">选择水印图片</el-button>
                    </el-upload>
                    <div v-if="watermarkImagePreview" class="relative w-20 h-20 border rounded-lg overflow-hidden">
                      <img :src="watermarkImagePreview" class="w-full h-full object-contain" />
                      <div
                        class="absolute top-0 right-0 p-1 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-bl-lg"
                        @click="() => {
                          watermarkImage = null;
                          watermarkImagePreview = '';
                        }">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印大小</label>
                  <el-slider v-model="watermarkSize" :min="30" :max="300" />
                </div>
              </div>

              <!-- 通用设置 -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印位置</label>
                  <el-select v-model="watermarkPosition" class="w-full">
                    <el-option v-for="option in positionOptions" :key="option.value" :label="option.label"
                      :value="option.value" />
                  </el-select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">透明度</label>
                  <el-slider v-model="watermarkOpacity" :min="0.1" :max="1" :step="0.1" />
                </div>
              </div>

              <!-- 密度控制 -->
              <div v-if="watermarkPosition === 'tile'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">水印密度</label>
                  <el-slider v-model="watermarkDensity" :min="0.5" :max="3" :step="0.1" :marks="{
                    0.5: '密集',
                    1.5: '适中',
                    3: '稀疏'
                  }" />
                </div>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div v-if="processedImages.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
            <h4 class="text-base font-medium text-gray-700 mb-4">处理结果预览</h4>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div v-for="(img, index) in processedImages" :key="index" class="relative aspect-square">
                <img :src="img" class="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
          </div>

          <!-- 功能说明区域 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div v-for="(feature, index) in features" :key="index" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-medium text-gray-900">{{ feature.title }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>

            <!-- 适用场景说明 -->
            <div class="mt-8">
              <h2 class="text-lg font-medium text-gray-900 mb-4">适用场景</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p class="text-sm text-gray-600">{{ text }}</p>
                </div>
              </div>
            </div>

            <!-- 常见问题解答 -->
            <div class="mt-8">
              <h2 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h2>
              <div class="space-y-6">
                <div v-for="(item, index) in faqs" :key="index"
                  class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                  <h3 class="text-base font-medium text-gray-900 mb-3">{{ item.question }}</h3>
                  <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
                </div>
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
</style>
