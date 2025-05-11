/**
* @file RuaAvatar.vue
* @description 摸头GIF生成工具，支持上传图片生成摸头GIF
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-1-12
* @lastEditor UIED技术团队
* @lastEditTime 2025-1-12 01:01
*
* 功能特性：
* 1. 支持图片上传生成摸头GIF
* 2. 图片格式限制：支持JPG/PNG格式，文件大小不超过10MB
* 3. 实时预览功能
* 4. 一键下载生成的GIF
* 5. 可调整GIF参数：尺寸、速度、形变度等
* 6. 支持图片翻转
* 7. 响应式布局适配
*
* 参考：https://benisland.neocities.org/petpet/
* 使用 gif.js 生成GIF动画
*/

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">摸头GIF生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">上传图片即可生成可爱的摸头GIF</p>
          <p class="text-gray-400 text-xs mt-2">支持 JPG/PNG 格式，文件大小不超过 10MB</p>
        </div>

        <!-- 主要内容区域：预览和参数调整 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <!-- 左侧：Canvas预览 -->
          <section class="preview-section bg-white border border-gray-200 rounded-lg p-6">
            <div class="content-heading mb-4 text-gray-700 font-medium">预览</div>

            <div class="preview-canvas flex flex-col items-center">
              <div class="canvas-wrapper" v-loading="loading">
                <canvas ref="previewCanvas" class="canvas rounded-lg" width="250" height="250"
                  v-if="originalImage"></canvas>
                <template v-else>
                  <div class="placeholder rounded-lg">
                    <el-icon class="text-5xl text-gray-300">
                      <Picture />
                    </el-icon>
                    <div class="text-gray-400 mt-2">请上传图片开始预览</div>
                  </div>
                </template>
              </div>

              <!-- 播放控制按钮 -->
              <div class="preview-playback mt-4 bg-gray-100 rounded-lg w-64 overflow-hidden">
                <div class="flex">
                  <button id="prev"
                    class="flex-1 py-2 px-4 text-gray-700 hover:bg-gray-200 border-r border-gray-200 control-grouped-left">
                    <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                  </button>

                  <button @click="togglePreviewPlayback" id="play"
                    class="flex-1 py-2 px-4 text-gray-700 hover:bg-gray-200 border-r border-gray-200 control-grouped-center">
                    <svg v-if="!isPreviewPaused" class="w-4 h-4 mx-auto btn-playback-pause" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"></path>
                    </svg>
                    <svg v-else class="w-4 h-4 mx-auto btn-playback-play" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </button>

                  <button id="next" class="flex-1 py-2 px-4 text-gray-700 hover:bg-gray-200 control-grouped-right">
                    <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 控制区域：尺寸、形变、速度 -->
            <div class="preview-controls mt-6">
              <div class="export-row space-y-3">
                <button @click="generateAndDownloadGif" :disabled="loading" id="export"
                  class="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed btn btn-export">
                  <svg class="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {{ loading ? '生成中...' : '导出' }}
                </button>

                <button @click="resetSettings" id="reset"
                  class="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300 btn btn-reset">
                  <svg class="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10"></polyline>
                    <polyline points="23 20 23 14 17 14"></polyline>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                  </svg>
                  重置
                </button>
              </div>
            </div>
          </section>

          <!-- 右侧：上传和参数调整 -->
          <div class="controls-section bg-white border border-gray-200 rounded-lg p-6">
            <!-- 上传区域 -->
            <div class="mb-6">
              <div class="flex justify-between items-center mb-2">
                <label class="text-sm font-medium text-gray-700">图片上传</label>
              </div>

              <div class="flex flex-col space-y-4">
                <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png" class="hidden" @change="handleFileUpload">

                <!-- 上传按钮和缩略图 -->
                <div class="flex items-center">
                  <button @click="triggerFileInput"
                    class="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300">
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    选择图片
                  </button>

                  <!-- 图片缩略图 -->
                  <div class="ml-4" v-if="originalUrl">
                    <img :src="originalUrl" class="h-12 w-12 object-cover rounded"
                      :class="{ 'flip-horizontal': isFlipped }" alt="原图预览" />
                  </div>
                </div>

                <!-- URL输入框 -->
                <div class="flex flex-col">
                  <div class="text-xs text-gray-500 mb-1">或者输入图片URL</div>
                  <div class="flex">
                    <input v-model="imageUrl" type="text"
                      class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入图片URL..." />
                    <button @click="loadImageFromUrl"
                      class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors duration-300">
                      加载
                    </button>
                  </div>
                  <div class="text-xs text-gray-400 mt-1">温馨提示：上传图片URL不一定有效，因为有些网站做了跨域限制</div>
                </div>
              </div>
            </div>

            <!-- 参数调整 -->
            <div class="preview-controls bg-gray-50 p-5 rounded-lg">
              <div class="text-sm font-medium text-gray-700 mb-4">参数调整</div>

              <div class="row control-group mb-4">
                <div class="flex justify-between items-center">
                  <label for="toggleFlip" class="control-group-l text-sm font-medium text-gray-700">翻转</label>
                  <label for="toggleFlip" class="toggle-switch sm">
                    <el-switch v-model="isFlipped" id="toggleFlip" class="toggle-switch-input" />
                  </label>
                </div>
              </div>

              <div class="row control-group mb-4">
                <div class="flex justify-between items-center mb-1">
                  <label for="scale" class="control-label control-group-s text-sm font-medium text-gray-700">尺寸</label>
                  <span class="text-xs text-gray-500">{{ size }}%</span>
                </div>
                <el-slider v-model="size" id="scale" :min="15" :max="200" :step="5"
                  class="control-range control-group-l" />
              </div>

              <div class="row control-group mb-4">
                <div class="flex justify-between items-center mb-1">
                  <label for="squish"
                    class="control-label control-group-s text-sm font-medium text-gray-700">形变度</label>
                  <span class="text-xs text-gray-500">{{ squish }}%</span>
                </div>
                <el-slider v-model="squish" id="squish" :min="0" :max="150" :step="5"
                  class="control-range control-group-l" />
              </div>

              <div class="row control-group mb-4">
                <div class="flex justify-between items-center mb-1">
                  <label for="fps" class="control-label control-group-s text-sm font-medium text-gray-700">速度</label>
                  <span class="text-xs text-gray-500">{{ speed }}x</span>
                </div>
                <el-slider v-model="speed" id="fps" :min="0.5" :max="5" :step="0.1" class="control-range" />
              </div>

              <!-- 新增背景类型选择 -->
              <div class="row control-group mb-4">
                <div class="flex justify-between items-center mb-1">
                  <label class="control-label control-group-s text-sm font-medium text-gray-700">背景类型</label>
                </div>
                <div class="flex space-x-4">
                  <div class="flex items-center">
                    <input type="radio" id="transparent" value="transparent" v-model="backgroundType"
                      class="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out" />
                    <label for="transparent" class="ml-2 block text-sm text-gray-700">
                      透明背景
                    </label>
                  </div>
                  <div class="flex items-center">
                    <input type="radio" id="white" value="white" v-model="backgroundType"
                      class="form-radio h-4 w-4 text-blue-500 transition duration-150 ease-in-out" />
                    <label for="white" class="ml-2 block text-sm text-gray-700">
                      白色背景
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 技术说明 -->
        <div class="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
          v1 | templates: gif, sprite | gifs 由 gif.js 生成
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />

      <!-- 提示信息 -->
      <div v-if="showToast"
        class="fixed top-4 right-4 px-4 py-2 rounded-lg text-sm text-white shadow-lg transition-all duration-300"
        :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
        {{ toastMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { Picture } from '@element-plus/icons-vue'

// 使用any类型导入GIF.js
// @ts-ignore
import GIF from 'gif.js'

// 路由
const route = useRoute()

// 文件和预览相关
const fileInput = ref<HTMLInputElement | null>(null)
const originalUrl = ref('')
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const originalImage = ref<HTMLImageElement | null>(null)
const loading = ref(false)
const previewAnimationId = ref<number | null>(null)

// 参数设置
const isFlipped = ref(false)
const size = ref(65)
const squish = ref(75)  // 形变度默认值改为75%
const speed = ref(2)    // 速度默认值改为2x
const backgroundType = ref('white') // 新增：背景类型选择，默认白色

// 手部精灵图
const handSpritesheet = ref<HTMLImageElement | null>(null)
const handSprites = ref({
  frameCount: 5,
  width: 0,
  height: 0
})

// 提示信息
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// 添加新的变量和方法
const isPreviewPaused = ref(false)
const imageUrl = ref('');

// 显示消息
const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 初始化和清理
onMounted(() => {
  // 加载手部精灵图
  loadHandSpritesheet()

  // 加载默认logo作为预览图
  loadDefaultLogo()
})

onUnmounted(() => {
  // 确保组件卸载时停止动画
  stopPreviewAnimation()
})

// 加载手部精灵图
const loadHandSpritesheet = async () => {
  const image = new Image()
  image.src = '/images/hand.png'

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
    })

    handSpritesheet.value = image
    handSprites.value = {
      frameCount: 5,
      width: image.width / 5,
      height: image.height
    }

    console.log('手部精灵图加载成功:', handSprites.value)
  } catch (error) {
    console.error('手部精灵图加载失败:', error)
  }
}

// 加载默认logo图片
const loadDefaultLogo = () => {
  try {
    const image = new Image()
    image.src = '/favicon.ico'

    image.onload = () => {
      console.log('默认Logo加载成功')
      originalImage.value = image
      originalUrl.value = '/favicon.ico'

      // 添加延迟确保所有内容都已渲染
      setTimeout(() => {
        // 确保手部精灵图也加载完成后再开始动画
        if (handSpritesheet.value && previewCanvas.value) {
          console.log('准备开始预览动画')
          // 立即绘制第一帧，确保图片显示
          drawPreviewFrame(0)
          // 然后开始动画
          startPreviewAnimation()
        } else {
          console.log('等待资源加载完成...')
          // 如果手部精灵图还没加载完，添加一个延迟再试
          setTimeout(() => {
            if (handSpritesheet.value && previewCanvas.value) {
              console.log('再次尝试开始预览动画')
              drawPreviewFrame(0)
              startPreviewAnimation()
            } else {
              console.error('资源加载失败，无法显示预览')
            }
          }, 1000)
        }
      }, 500)
    }

    image.onerror = (err) => {
      console.error('默认Logo加载失败:', err)
    }
  } catch (error) {
    console.error('加载默认Logo时出错:', error)
  }
}

// 验证文件格式和大小
const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    showMessage('请上传 JPG 或 PNG 格式的图片', 'error')
    return false
  }

  if (file.size > maxSize) {
    showMessage('图片大小不能超过 10MB', 'error')
    return false
  }

  return true
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file || !isValidImageFile(file)) return

  // 清除之前的图像
  if (originalUrl.value) {
    URL.revokeObjectURL(originalUrl.value)
  }

  // 停止之前的预览动画
  stopPreviewAnimation()

  // 显示原图预览
  originalUrl.value = URL.createObjectURL(file)

  // 加载原图用于后续处理
  originalImage.value = new Image()
  originalImage.value.src = originalUrl.value
  originalImage.value.onload = () => {
    showMessage('图片上传成功', 'success')
    startPreviewAnimation() // 开始预览动画
  }

  input.value = ''
}

// 定义摸头动画的关键帧数据
const animationFrames = [
  { spriteIndex: 0, head: { x: 0.0, y: 0.0, squish: 0.0 } },  // 初始位置，手放在上方
  { spriteIndex: 1, head: { x: 0.03, y: 0.03, squish: 0.05 } }, // 手开始下移
  { spriteIndex: 2, head: { x: 0.06, y: 0.06, squish: 0.1 } },  // 手继续下移，头开始变形
  { spriteIndex: 3, head: { x: 0.08, y: 0.08, squish: 0.15 } }, // 手到达最低点，头部最大变形
  { spriteIndex: 4, head: { x: 0.08, y: 0.08, squish: 0.15 } }, // 保持最低点一帧
  { spriteIndex: 3, head: { x: 0.06, y: 0.06, squish: 0.1 } },  // 手开始上移，头部开始恢复
  { spriteIndex: 2, head: { x: 0.03, y: 0.03, squish: 0.05 } },  // 手继续上移，头部继续恢复
  { spriteIndex: 1, head: { x: 0.0, y: 0.0, squish: 0.02 } },  // 接近初始位置
  { spriteIndex: 0, head: { x: 0.0, y: 0.0, squish: 0.0 } },   // 回到初始位置
  { spriteIndex: 0, head: { x: 0.0, y: 0.0, squish: 0.0 } }    // 保持初始位置一帧
]

// 开始预览动画
const startPreviewAnimation = () => {
  if (!originalImage.value || !handSpritesheet.value || !previewCanvas.value || isPreviewPaused.value) return

  let frameIndex = 0
  const frameCount = animationFrames.length
  const frameDelay = 100 / speed.value
  let lastFrameTime = 0

  // 停止现有动画
  stopPreviewAnimation()

  // 动画函数
  const animate = (timestamp: number) => {
    if (!lastFrameTime) lastFrameTime = timestamp

    const elapsed = timestamp - lastFrameTime

    if (elapsed > frameDelay) {
      lastFrameTime = timestamp

      // 绘制当前帧
      drawPreviewFrame(frameIndex % frameCount)

      // 递增帧序号
      frameIndex++
    }

    // 继续动画循环
    previewAnimationId.value = requestAnimationFrame(animate)
  }

  // 开始动画
  previewAnimationId.value = requestAnimationFrame(animate)
}

// 停止预览动画
const stopPreviewAnimation = () => {
  if (previewAnimationId.value !== null) {
    cancelAnimationFrame(previewAnimationId.value)
    previewAnimationId.value = null
  }
}

// 绘制预览帧
const drawPreviewFrame = (frameIndex: number) => {
  if (!originalImage.value || !handSpritesheet.value || !previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 获取当前帧数据
  const frameInfo = animationFrames[frameIndex]

  // 计算头像变形量
  const squishAmount = (squish.value / 100) * frameInfo.head.squish

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // ------------------ 绘制头像 ------------------
  // 保存当前状态
  ctx.save()

  // 应用翻转
  if (isFlipped.value) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }

  // 计算头像位置和尺寸
  const headWidth = canvas.width * (size.value / 100)
  const headHeight = headWidth * (1 - squishAmount)
  const headX = (canvas.width - headWidth) / 2 + (canvas.width * frameInfo.head.x)
  const headY = canvas.height * frameInfo.head.y + (canvas.height - headHeight) / 2

  // 绘制头像（带变形效果）
  if (originalImage.value) {
    ctx.drawImage(
      originalImage.value,
      0, 0,
      originalImage.value.width,
      originalImage.value.height,
      headX,
      headY,
      headWidth,
      headHeight
    )
  }

  // 恢复状态
  ctx.restore()

  // ------------------ 绘制手部精灵图 ------------------
  // 保存当前状态
  ctx.save()

  // 应用翻转
  if (isFlipped.value) {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  }

  // 从精灵图中选择当前帧对应的手部图像
  const spriteIndex = frameInfo.spriteIndex
  const spriteX = spriteIndex * handSprites.value.width
  const spriteY = 0

  // 计算手部尺寸和位置
  const handScale = 1.0 * (size.value / 100)  // 调整手部大小与头像一致
  const handWidth = canvas.width * handScale
  const handHeight = (handSprites.value.height / handSprites.value.width) * handWidth
  const handX = canvas.width / 2 - handWidth / 2  // 居中
  const handY = 0  // 顶部

  // 绘制手部精灵
  if (handSpritesheet.value) {
    ctx.drawImage(
      handSpritesheet.value,
      spriteX, spriteY,                            // 精灵图中的源位置
      handSprites.value.width, handSprites.value.height, // 精灵图中的源尺寸
      handX,                                        // 目标位置X
      handY,                                        // 目标位置Y
      handWidth, handHeight                        // 目标尺寸
    )
  }

  // 恢复状态
  ctx.restore()
}

// 监听参数变化，更新预览
watch([isFlipped, size, squish, speed], () => {
  // 如果有预览画布，调整动画速度
  if (previewAnimationId.value !== null) {
    // 停止当前动画并重启，应用新的速度设置
    stopPreviewAnimation()
    startPreviewAnimation()
  }
})

// 生成并下载GIF
const generateAndDownloadGif = async () => {
  if (!originalImage.value || !handSpritesheet.value) {
    showMessage('请先上传图片', 'error')
    return
  }

  loading.value = true

  try {
    // GIF配置
    const gifConfig: any = {
      workers: 2,
      quality: 10,
      width: originalImage.value.width * (size.value / 100),
      height: originalImage.value.height * (size.value / 100),
      workerScript: '/js/gif.worker.js'
    }

    // 如果选择透明背景
    if (backgroundType.value === 'transparent') {
      gifConfig.transparent = 'rgba(0,0,0,0)'
    }

    // 创建GIF编码器
    const gif = new GIF(gifConfig)

    // 创建 canvas 用于绘制帧
    const canvas = document.createElement('canvas')
    canvas.width = originalImage.value.width * (size.value / 100)
    canvas.height = originalImage.value.height * (size.value / 100)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('无法创建画布上下文')

    // 定义摸头动画的关键帧数据
    const frames = 10  // 总帧数

    // 生成每一帧
    for (let i = 0; i < frames; i++) {
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 设置背景颜色
      if (backgroundType.value === 'white') {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      // 透明背景不需要额外操作，默认就是透明的

      // 获取当前帧数据
      const frameInfo = animationFrames[i]

      // 计算头像变形量
      const squishAmount = (squish.value / 100) * frameInfo.head.squish

      // ------------------ 绘制头像 ------------------
      // 保存当前状态
      ctx.save()

      // 应用翻转
      if (isFlipped.value) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      // 计算头像位置和尺寸
      const headWidth = canvas.width * (size.value / 100)
      const headHeight = headWidth * (1 - squishAmount)
      const headX = (canvas.width - headWidth) / 2 + (canvas.width * frameInfo.head.x)
      const headY = canvas.height * frameInfo.head.y + (canvas.height - headHeight) / 2

      // 绘制头像（带变形效果）
      ctx.drawImage(
        originalImage.value,
        0, 0,
        originalImage.value.width,
        originalImage.value.height,
        headX,
        headY,
        headWidth,
        headHeight
      )

      // 恢复状态
      ctx.restore()

      // ------------------ 绘制手部精灵图 ------------------
      // 保存当前状态
      ctx.save()

      // 应用翻转
      if (isFlipped.value) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      // 从精灵图中选择当前帧对应的手部图像
      const spriteIndex = frameInfo.spriteIndex
      const spriteX = spriteIndex * handSprites.value.width
      const spriteY = 0

      // 计算手部尺寸和位置
      const handScale = 1.0 * (size.value / 100)  // 调整手部大小与头像一致
      const handWidth = canvas.width * handScale
      const handHeight = (handSprites.value.height / handSprites.value.width) * handWidth
      const handX = canvas.width / 2 - handWidth / 2  // 居中
      const handY = 0  // 顶部

      // 绘制手部精灵
      ctx.drawImage(
        handSpritesheet.value,
        spriteX, spriteY,                            // 精灵图中的源位置
        handSprites.value.width, handSprites.value.height, // 精灵图中的源尺寸
        handX,                                        // 目标位置X
        handY,                                        // 目标位置Y
        handWidth, handHeight                        // 目标尺寸
      )

      // 恢复状态
      ctx.restore()

      // 添加帧到GIF
      gif.addFrame(canvas, { delay: 100 / speed.value, copy: true })
    }

    // 将GIF渲染完成后的回调
    gif.on('finished', (blob: Blob) => {
      downloadGif(blob)
      loading.value = false
      showMessage('GIF生成成功', 'success')
    })

    // 开始渲染GIF
    gif.render()

  } catch (error) {
    console.error('Error:', error)
    showMessage(error instanceof Error ? error.message : '生成失败，请重试', 'error')
    loading.value = false
  }
}

// 下载GIF
const downloadGif = (blob: Blob) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'petpet.gif'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 重置设置
const resetSettings = () => {
  isFlipped.value = false
  size.value = 65
  squish.value = 75  // 重置形变度为75%
  speed.value = 2    // 重置速度为2x
  backgroundType.value = 'white' // 重置背景类型为白色

  // 如果有预览，更新预览
  if (previewAnimationId.value !== null) {
    stopPreviewAnimation()
    startPreviewAnimation()
  }

  showMessage('设置已重置', 'success')
}

// 切换预览播放状态
const togglePreviewPlayback = () => {
  if (isPreviewPaused.value) {
    // 恢复播放
    isPreviewPaused.value = false
    startPreviewAnimation()
  } else {
    // 暂停播放
    isPreviewPaused.value = true
    stopPreviewAnimation()
  }
}

// 从URL加载图片
const loadImageFromUrl = () => {
  if (!imageUrl.value) {
    showMessage('请输入图片URL', 'error');
    return;
  }

  // 清除之前的图像
  if (originalUrl.value) {
    URL.revokeObjectURL(originalUrl.value);
  }

  // 停止之前的预览动画
  stopPreviewAnimation();

  // 加载图片
  const img = new Image();
  img.crossOrigin = 'anonymous'; // 尝试解决跨域问题
  img.onload = () => {
    originalImage.value = img;
    originalUrl.value = imageUrl.value;
    showMessage('图片加载成功', 'success');
    startPreviewAnimation();
  };
  img.onerror = () => {
    showMessage('图片加载失败，可能是跨域限制导致', 'error');
  };
  img.src = imageUrl.value;
};
</script>

<style scoped>
.preview-section,
.controls-section {
  display: flex;
  flex-direction: column;
}

.preview-canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-wrapper {
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
}

.canvas {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  border: 2px solid #e2e8f0;
}

.canvas:hover {
  transform: scale(1.05);
}

.preview-playback {
  width: 250px;
}

.flip-horizontal {
  transform: scaleX(-1);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  width: 250px;
  border: 2px dashed #e5e7eb;
  background-color: rgba(243, 244, 246, 0.3);
}

.control-group {
  width: 100%;
}

.row {
  margin-bottom: 15px;
}

.export-row {
  margin-top: 15px;
}

/* 添加按钮组样式 */
.control-grouped-left {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.control-grouped-center {
  border-radius: 0;
}

.control-grouped-right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .canvas-wrapper {
    width: 200px;
    height: 200px;
  }

  .placeholder {
    width: 200px;
    height: 200px;
  }

  .preview-playback {
    width: 200px;
  }
}
</style>
