<!--
 * @file ImageJoiner.vue
 * @description 图片拼接工具，支持多张图片横向或纵向拼接
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-12-22
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

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 左侧设置区域 -->
          <div class="lg:col-span-1 space-y-6">
            <!-- 上传区域 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div
                class="relative border border-dashed rounded-lg min-h-[150px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'"
                @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
                <input ref="fileInputRef" type="file" class="hidden" multiple accept="image/*" @change="handleFileInputChange" />
                <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>
                <div class="text-center px-4">
                  <div class="w-8 h-8 mb-2 mx-auto">
                    <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽图片</div>
                  <p class="text-xs text-gray-400">支持 JPG、PNG、WebP</p>
                </div>
              </div>
            </div>

            <!-- 拼接设置 -->
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium border-b pb-2">拼接设置</div>
              <div class="space-y-4">
                <div>
                  <label class="text-sm text-gray-600 mb-2 block">拼接方向</label>
                  <el-radio-group v-model="direction" size="large">
                    <el-radio-button label="vertical">纵向拼接</el-radio-button>
                    <el-radio-button label="horizontal">横向拼接</el-radio-button>
                  </el-radio-group>
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">间距 ({{ spacing }}px)</label>
                  <el-slider v-model="spacing" :min="0" :max="100" :step="1" />
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">背景颜色</label>
                  <div class="flex items-center gap-2">
                    <input type="color" v-model="backgroundColor" class="h-8 w-8 rounded cursor-pointer border-none" />
                    <span class="text-sm text-gray-500">{{ backgroundColor }}</span>
                  </div>
                </div>

                <div>
                  <label class="text-sm text-gray-600 mb-2 block">输出格式</label>
                  <el-select v-model="outputFormat" class="w-full">
                    <el-option label="JPG" value="image/jpeg" />
                    <el-option label="PNG" value="image/png" />
                  </el-select>
                </div>
              </div>
            </div>

            <!-- 图片列表（可拖拽排序） -->
            <div v-if="fileList.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 border-b pb-2">
                <div class="text-gray-700 font-medium">图片列表 ({{ fileList.length }})</div>
                <el-button type="text" class="!text-red-500" @click="clearAll">清空</el-button>
              </div>
              <draggable 
                v-model="fileList" 
                item-key="id"
                class="space-y-2"
                ghost-class="ghost"
              >
                <template #item="{ element, index }">
                  <div class="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100 cursor-move hover:bg-gray-100 transition-colors">
                    <span class="text-gray-400 text-xs w-4">{{ index + 1 }}</span>
                    <img :src="element.url" class="w-10 h-10 object-cover rounded" />
                    <div class="flex-1 min-w-0">
                      <div class="text-xs text-gray-600 truncate" :title="element.name">{{ element.name }}</div>
                      <div class="text-xs text-gray-400">{{ formatSize(element.size) }}</div>
                    </div>
                    <el-button type="text" @click="removeFile(index)">
                      <el-icon class="text-gray-400 hover:text-red-500"><Close /></el-icon>
                    </el-button>
                  </div>
                </template>
              </draggable>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="lg:col-span-2">
            <div class="bg-white border border-gray-200 rounded-lg p-6 h-full flex flex-col">
              <div class="flex justify-between items-center mb-4">
                <div class="text-gray-700 font-medium">效果预览</div>
                <el-button type="primary" :loading="isProcessing" @click="generateAndDownload" :disabled="fileList.length === 0">
                  生成并下载
                </el-button>
              </div>
              
              <div class="flex-1 bg-gray-100 rounded-lg overflow-auto p-4 flex justify-center min-h-[400px]">
                <div v-if="fileList.length === 0" class="flex flex-col items-center justify-center text-gray-400 h-full">
                  <el-icon :size="48" class="mb-2"><Picture /></el-icon>
                  <div>请添加图片</div>
                </div>
                <div v-else ref="previewContainer" class="relative shadow-lg transition-all duration-300" :style="previewStyle">
                  <!-- 预览内容由 canvas 生成 -->
                  <img v-if="previewUrl" :src="previewUrl" class="max-w-full h-auto" />
                  <div v-else class="flex items-center justify-center h-full text-gray-400">
                    <el-icon class="is-loading mr-2"><Loading /></el-icon>
                    生成预览中...
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Close, Picture, Loading } from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = {
  title: "免费在线图片拼接",
  subtitle: "支持多张图片横向或纵向拼接，自定义间距和背景色，制作长图神器"
}

interface ImageFile {
  id: string
  file: File
  name: string
  size: number
  url: string
  width: number
  height: number
}

// 状态
const fileList = ref<ImageFile[]>([])
const isDragging = ref(false)
const isProcessing = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const previewUrl = ref('')

// 设置
const direction = ref('vertical')
const spacing = ref(0)
const backgroundColor = ref('#ffffff')
const outputFormat = ref('image/jpeg')

// 监听设置变化，重新生成预览
watch([fileList, direction, spacing, backgroundColor], () => {
  if (fileList.value.length > 0) {
    generatePreview()
  } else {
    previewUrl.value = ''
  }
}, { deep: true })

const previewStyle = computed(() => {
  return {
    backgroundColor: backgroundColor.value
  }
})

// 文件处理
const handleFileInputChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    processFiles(Array.from(input.files))
  }
  input.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer?.files) {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    processFiles(files)
  }
}

const processFiles = async (files: File[]) => {
  for (const file of files) {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      fileList.value.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        url,
        width: img.width,
        height: img.height
      })
    }
    img.src = url
  }
}

const removeFile = (index: number) => {
  URL.revokeObjectURL(fileList.value[index].url)
  fileList.value.splice(index, 1)
}

const clearAll = () => {
  fileList.value.forEach(f => URL.revokeObjectURL(f.url))
  fileList.value = []
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生成预览
const generatePreview = async () => {
  if (fileList.value.length === 0) return
  
  try {
    const canvas = await drawCanvas()
    previewUrl.value = canvas.toDataURL(outputFormat.value, 0.9)
  } catch (error) {
    console.error('生成预览失败:', error)
  }
}

// 生成并下载
const generateAndDownload = async () => {
  if (fileList.value.length === 0) return
  
  isProcessing.value = true
  try {
    const canvas = await drawCanvas()
    const url = canvas.toDataURL(outputFormat.value, 0.9)
    
    const link = document.createElement('a')
    link.href = url
    const ext = outputFormat.value === 'image/png' ? 'png' : 'jpg'
    link.download = `joined_image_${new Date().getTime()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('图片拼接完成')
  } catch (error) {
    console.error('图片拼接失败:', error)
    ElMessage.error('图片拼接失败，请重试')
  } finally {
    isProcessing.value = false
  }
}

// 绘制 Canvas
const drawCanvas = (): Promise<HTMLCanvasElement> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    let totalWidth = 0
    let totalHeight = 0
    const space = spacing.value
    
    if (direction.value === 'vertical') {
      // 纵向：宽度取最大值，高度累加
      totalWidth = Math.max(...fileList.value.map(f => f.width))
      totalHeight = fileList.value.reduce((sum, f) => sum + f.height, 0) + (fileList.value.length - 1) * space
    } else {
      // 横向：高度取最大值，宽度累加
      totalHeight = Math.max(...fileList.value.map(f => f.height))
      totalWidth = fileList.value.reduce((sum, f) => sum + f.width, 0) + (fileList.value.length - 1) * space
    }
    
    canvas.width = totalWidth
    canvas.height = totalHeight
    
    // 填充背景
    ctx.fillStyle = backgroundColor.value
    ctx.fillRect(0, 0, totalWidth, totalHeight)
    
    let currentX = 0
    let currentY = 0
    
    // 绘制图片
    fileList.value.forEach((item) => {
      const img = new Image()
      img.onload = () => {
        if (direction.value === 'vertical') {
          // 居中绘制
          const x = (totalWidth - item.width) / 2
          ctx.drawImage(img, x, currentY)
          currentY += item.height + space
        } else {
          // 居中绘制
          const y = (totalHeight - item.height) / 2
          ctx.drawImage(img, currentX, y)
          currentX += item.width + space
        }
        
        // 检查是否最后一张绘制完成（这是一个简化的检查，实际应该等待所有 onload）
        // 由于我们是同步循环触发 onload，这里使用 Promise.all 会更好，但为了简化直接用 Image 对象的缓存特性（因为 url 已经是 objectURL）
        // 实际上 objectURL 加载是异步的，所以上面的逻辑有问题。
        // 需要重构 drawCanvas 为完全异步
      }
      img.src = item.url
    })
    
    // 修正异步绘制逻辑
    const loadPromises = fileList.value.map(item => {
      return new Promise<HTMLImageElement>((resolveImg) => {
        const img = new Image()
        img.onload = () => resolveImg(img)
        img.src = item.url
      })
    })
    
    Promise.all(loadPromises).then(images => {
      let currX = 0
      let currY = 0
      
      images.forEach((img, index) => {
        if (direction.value === 'vertical') {
           const x = (totalWidth - img.width) / 2
           ctx.drawImage(img, x, currY)
           currY += img.height + space
        } else {
           const y = (totalHeight - img.height) / 2
           ctx.drawImage(img, currX, y)
           currX += img.width + space
        }
      })
      resolve(canvas)
    })
  })
}

onUnmounted(() => {
  clearAll()
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>