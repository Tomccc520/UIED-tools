<script setup lang="ts">
import { ref, reactive, watch, nextTick } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import QRCodeVue3 from 'qrcode-vue3'
import { Delete, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, type UploadFile } from 'element-plus'
import Compressor from 'compressorjs'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "免费二维码生成",
  content: '',
  width: 200,
  height: 200,
  size: '200',
  margin: 1,
  fileList: <string[]>[],
  fileUrl: '',
  preColor: '#000000',
  qrKey: 0,
  errorCorrectionLevel: 'Q',
  mode: 'url',  // url, text
  dotStyle: 'square', // square, dots, rounded
  cornerSquareStyle: 'square', // square, dot, extra-rounded
  cornerDotStyle: 'square', // square, dot
  backgroundColor: '#FFFFFF',
})

const uploadLogo = ref()

//上传达到上限触发
const handleExceed = () => {
  ElMessage({
    message: '上传数量已达上限，请清除后重新上传',
    type: 'warning',
  })
}

//设置尺寸
const setQRSize = () => {
  info.width = parseInt(info.size)
  info.height = parseInt(info.size)
}

const handleChange = (file: UploadFile) => {
  info.fileList.push(file.url as string)
  info.fileUrl = info.fileList[0] ?? ''
}

const handleRemove = (file: UploadFile) => {
  info.fileList = uploadLogo.value.handleRemove(file)
}

// 验证URL是否合法
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 处理URL格式
const formatUrl = (url: string) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

// 处理图片上传
const handleImageUpload = (file: UploadFile) => {
  // 检查文件大小
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size && file.size > maxSize) {
    ElMessage({
      message: '图片大小不能超过5MB',
      type: 'warning',
    })
    return false
  }

  // 使用 Compressor.js 压缩图片
  new Compressor(file.raw as Blob, {
    quality: 0.6,
    maxWidth: 800,
    maxHeight: 800,
    success(result) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          // 暂时使用本地预览URL
          const objectUrl = URL.createObjectURL(result)
          info.content = objectUrl
          info.qrKey = Date.now()
        }
      }
      reader.readAsDataURL(result)
    },
    error(err) {
      ElMessage({
        message: '图片处理失败，请重试',
        type: 'error',
      })
      console.error(err)
    },
  })
  return false
}

//生成二维码
const gen = () => {
  if (info.mode === 'url') {
    // 处理URL模式
    let url = info.content.trim()
    url = formatUrl(url)
    if (!isValidUrl(url)) {
      ElMessage({
        message: '请输入有效的网址',
        type: 'warning',
      })
      return
    }
    info.content = url
  } else if (info.mode === 'text') {
    // 文本模式下检测中文
    if (/[\u4e00-\u9fa5]/.test(info.content)) {
      ElMessage({
        message: '暂不支持中文内容，请使用英文、数字或符号',
        type: 'warning',
      })
      return
    }
  }

  //设置尺寸
  setQRSize()
  info.qrKey = Date.now()
}

// 修改下载函数
const downloadQRCode = () => {
  if (!info.content) {
    ElMessage({
      message: '请先输入内容并生成二维码',
      type: 'warning',
    })
    return
  }

  try {
    // 直接获取二维码图片元素
    const qrCodeImg = document.querySelector('.qrcode-container img') as HTMLImageElement
    if (!qrCodeImg) {
      ElMessage({
        message: '未找到二维码图片',
        type: 'warning',
      })
      return
    }

    // 创建一个 canvas 元素
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      ElMessage({
        message: '浏览器不支持canvas',
        type: 'error',
      })
      return
    }

    // 设置 canvas 大小与图片一致
    canvas.width = qrCodeImg.width
    canvas.height = qrCodeImg.height

    // 将图片绘制到 canvas
    ctx.drawImage(qrCodeImg, 0, 0)

    // 创建下载链接
    const link = document.createElement('a')
    const prefix = info.mode === 'url' ? 'url' : 'text'
    link.download = `${prefix}-code-${Date.now()}.png`

    // 将 canvas 转换为 blob
    canvas.toBlob((blob) => {
      if (!blob) {
        ElMessage({
          message: '图片转换失败',
          type: 'error',
        })
        return
      }

      // 创建临时URL
      const url = URL.createObjectURL(blob)
      link.href = url

      // 触发下载
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 清理临时URL
      URL.revokeObjectURL(url)

      ElMessage({
        message: '保存成功',
        type: 'success',
      })
    }, 'image/png')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage({
      message: '保存失败，请重试',
      type: 'error',
    })
  }
}
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
          <p class="text-gray-500 text-sm mt-6">生成精美的二维码，支持自定义样式和内容</p>
        </div>

        <!-- 配置区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- 左侧配置区域 -->
          <div class="space-y-6">
            <!-- 类型选择 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">类型</div>
              <el-radio-group v-model="info.mode" class="flex flex-wrap gap-4">
                <el-radio label="url" class="!mr-0">网址</el-radio>
                <el-radio label="text" class="!mr-0">文本</el-radio>
              </el-radio-group>
            </div>

            <!-- 内容输入区域 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">内容</div>
              <el-input v-model="info.content" type="textarea" rows="3" class="w-full"
                :placeholder="info.mode === 'url' ? '请输入网址，如：www.example.com' : '请输入英文、数字或符号，暂不支持中文'">
              </el-input>
            </div>

            <!-- 样式配置区域 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="mb-4 text-gray-700 font-medium">样式设置</div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 尺寸选择 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">尺寸</div>
                  <el-select v-model="info.size" class="w-full">
                    <el-option label="常规 200px" value="200" />
                    <el-option label="常规 300px" value="300" />
                    <el-option label="适中 350px" value="350" />
                    <el-option label="较大 500px" value="500" />
                  </el-select>
                </div>

                <!-- 纠错级别 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">纠错级别</div>
                  <el-select v-model="info.errorCorrectionLevel" class="w-full">
                    <el-option label="L 可遮挡 7%" value="L" />
                    <el-option label="M 可遮挡 15%" value="M" />
                    <el-option label="Q 可遮挡 25%" value="Q" />
                    <el-option label="H 可遮挡 30%" value="H" />
                  </el-select>
                </div>

                <!-- 点的样式 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">点的样式</div>
                  <el-select v-model="info.dotStyle" class="w-full">
                    <el-option label="方形" value="square" />
                    <el-option label="圆点" value="dots" />
                    <el-option label="圆角" value="rounded" />
                  </el-select>
                </div>

                <!-- 角标样式 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">角标样式</div>
                  <el-select v-model="info.cornerSquareStyle" class="w-full">
                    <el-option label="方形" value="square" />
                    <el-option label="圆点" value="dot" />
                    <el-option label="圆角" value="extra-rounded" />
                  </el-select>
                </div>

                <!-- 角点样式 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">角点样式</div>
                  <el-select v-model="info.cornerDotStyle" class="w-full">
                    <el-option label="方形" value="square" />
                    <el-option label="圆点" value="dot" />
                  </el-select>
                </div>

                <!-- 前景色 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">前景色</div>
                  <el-color-picker v-model="info.preColor" class="!w-full" :show-alpha="false" show-as="hex"
                    :show-as-rgba="false" />
                </div>

                <!-- 背景色 -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">背景色</div>
                  <el-color-picker v-model="info.backgroundColor" class="!w-full" :show-alpha="false" show-as="hex"
                    :show-as-rgba="false" />
                </div>
              </div>
            </div>
          </div>

          <!-- 预览和设置区域 -->
          <div class="w-full">
            <!-- 预览区域 -->
            <div class="bg-gray-50 rounded-lg p-6 sm:p-8">
              <div class="mb-6">
                <h3 class="text-lg font-medium text-gray-800 mb-2">预览效果</h3>
                <p class="text-sm text-gray-500">实时预览生成的二维码效果</p>
              </div>
              <div
                class="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div class="qrcode-container mb-6">
                  <QRCodeVue3 :key="info.qrKey" :value="info.content" :width="info.width" :height="info.height"
                    :margin="info.margin" :dots-options="{
                      type: info.dotStyle as any,
                      color: info.preColor
                    }" :corners-square-options="{
                      type: info.cornerSquareStyle as any,
                      color: info.preColor
                    }" :corners-dot-options="{
                      type: info.cornerDotStyle as any,
                      color: info.preColor
                    }" :background-options="{
                      color: info.backgroundColor
                    }" :level="info.errorCorrectionLevel" render-as="svg" />
                </div>
                <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button @click="gen"
                    class="w-full sm:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 flex items-center justify-center">
                    <el-icon class="mr-1">
                      <Plus />
                    </el-icon>
                    生成二维码
                  </button>
                  <button @click="downloadQRCode"
                    class="w-full sm:w-auto px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-300 flex items-center justify-center">
                    <el-icon class="mr-1">
                      <Download />
                    </el-icon>
                    下载二维码
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐区域 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.el-radio {
  --el-radio-font-size: 0.875rem;
}

.el-radio.is-bordered {
  @apply border-gray-200 hover:border-blue-500;
}

.el-input,
.el-select {
  --el-input-height: 36px;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  @apply bg-white;
}

:deep(.el-textarea__inner) {
  @apply bg-white;
}

:deep(.el-color-picker__trigger) {
  @apply w-full border-gray-200;
}

/* 添加统一的按钮样式 */
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
