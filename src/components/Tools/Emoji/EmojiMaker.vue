<!--
* @file EmojiMaker.vue
* @description 表情包制作组件
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2025-2-15
*
* 功能特性：
* 1. 上传本地图片
* 2. 添加/编辑文字
* 3. 调整文字样式
* 4. 一键导出
* 5. 响应式布局
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">免费表情包制作</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">简单几步，制作专属表情包</p>
          <p class="text-red-500 text-sm mt-2">更多表情包类型和功能持续增加中...</p>
        </div>

        <!-- 表情包编辑区域 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- 左侧预览区域 -->
          <div class="bg-gray-50 rounded-lg p-6 relative flex justify-center items-center" style="min-height: 400px;">
            <div class="relative w-full h-full">
              <div ref="canvasContainer" class="relative w-full h-full flex items-center justify-center">
                <canvas ref="canvas" class="max-w-full max-h-[400px] rounded-lg shadow-md"></canvas>
              </div>
            </div>
          </div>

          <!-- 右侧控制面板 -->
          <div class="space-y-6">
            <!-- 配置区域 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-medium mb-4">表情配置</h3>
              <div class="space-y-4">
                <!-- 文字输入 -->
                <div>
                  <label class="block text-sm text-gray-600 mb-2">底部文字</label>
                  <input v-model="text"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="输入要显示的文字..." />
                </div>
                <!-- 文字样式控制 -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-2">字体大小</label>
                    <input type="range" v-model="fontSize" min="12" max="72" class="w-full" />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-2">字体颜色</label>
                    <input type="color" v-model="textColor"
                      class="w-full h-10 p-1 border border-gray-200 rounded-lg cursor-pointer" />
                  </div>
                </div>
                <!-- 样式选择区域 -->
                <div>
                  <label class="block text-sm text-gray-600 mb-2">选择样式</label>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <button v-for="(style, type) in styleTypes" :key="type"
                      class="px-4 py-2 rounded-lg text-center transition-colors" :class="{
                        'bg-red-50 text-red-600 border-red-500': currentType === type,
                        'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100': currentType !== type
                      }" @click="selectType(type)">
                      {{ style.name }}
                    </button>
                  </div>
                </div>
                <!-- Logo上传 -->
                <div>
                  <label class="block text-sm text-gray-600 mb-2">右上角Logo</label>
                  <div class="flex items-center space-x-4">
                    <input type="file" id="logoUpload" class="hidden" accept="image/*" @change="handleLogoUpload" />
                    <label for="logoUpload"
                      class="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                      更换Logo
                    </label>
                    <button @click="resetLogo"
                      class="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                      恢复默认
                    </button>
                  </div>
                </div>
                <!-- Logo大小控制 -->
                <div>
                  <label class="block text-sm text-gray-600 mb-2">Logo大小</label>
                  <input type="range" v-model="logoSize" min="10" max="40" class="w-full" />
                </div>
              </div>
            </div>

            <!-- 操作按钮区域 -->
            <div class="flex flex-wrap gap-4">
              <button @click="updateCanvas"
                class="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-base transition-colors">
                预览效果
              </button>
              <button @click="downloadImage"
                class="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors">
                导出表情
              </button>
            </div>

            <!-- 提示说明 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h4 class="text-base font-medium text-gray-900 mb-3">使用说明</h4>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>1. 上传本地图片作为底图</li>
                <li>2. 在文本框中输入要添加的文字</li>
                <li>3. 调整文字大小和颜色</li>
                <li>4. 点击预览查看效果</li>
                <li>5. 满意后点击导出保存</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">本地上传</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                支持从本地上传图片，方便快捷
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">文字编辑</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                自由添加文字，调整样式
              </p>
            </div>

            <div class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">一键导出</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">
                快速导出制作好的表情包
              </p>
            </div>
          </div>
        </div>

        <!-- 版权提示 -->
        <div class="mt-8 text-sm text-gray-500">
          <p class="text-center">温馨提示</p>
          <p class="text-center mt-2">本工具仅供个人娱乐使用，请勿用于商业用途。使用本工具时请遵守相关法律法规。</p>
        </div>
      </div>
    </div>

    <!-- 工具推荐区域 -->
    <ToolsRecommend :currentPath="route.path" />

    <!-- 提示信息 -->
    <div v-if="showToast"
      class="fixed top-4 right-4 px-4 py-2 rounded-lg text-sm text-white shadow-lg transition-all duration-300"
      :class="toastType === 'success' ? 'bg-green-500' : 'bg-red-500'">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import no1Template from '@/assets/templates/no1.png'
import defaultLogo from '@/assets/uiedlogo.png'

// 定义表情类型
interface StyleType {
  name: string
  fontSize: number
  fontFamily: string
  textColor: string
  strokeWidth: number
  strokeColor: string
  textY: number
}

const styleTypes: Record<string, StyleType> = {
  type1: {
    name: '简约黑体',
    fontSize: 32,
    fontFamily: '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    textColor: '#000000',
    strokeWidth: 0,
    strokeColor: 'transparent',
    textY: 30
  },
  type2: {
    name: '粉色可爱',
    fontSize: 36,
    fontFamily: '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    textColor: '#FF6B6B',
    strokeWidth: 4,
    strokeColor: '#FFFFFF',
    textY: 40
  },
  type3: {
    name: '白底黑边',
    fontSize: 40,
    fontFamily: '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    textColor: '#FFFFFF',
    strokeWidth: 5,
    strokeColor: '#000000',
    textY: 50
  },
  type4: {
    name: '金色霸气',
    fontSize: 42,
    fontFamily: '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    textColor: '#FFD700',
    strokeWidth: 4,
    strokeColor: '#000000',
    textY: 45
  },
  type5: {
    name: '中国红',
    fontSize: 38,
    fontFamily: '"Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    textColor: '#FF2400',
    strokeWidth: 3,
    strokeColor: '#FFFFFF',
    textY: 35
  }
}

// 状态变量
const route = useRoute()
const canvas = ref<HTMLCanvasElement | null>(null)
const canvasContainer = ref<HTMLElement | null>(null)
const text = ref('天下第一')
const fontSize = ref(32)
const textColor = ref('#000000')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
const logoUrl = ref(defaultLogo)
const logoSize = ref(25)
const currentType = ref<string>('type1')

// 在组件挂载时加载默认图片
onMounted(() => {
  // 加载默认底图
  const img = new Image()
  img.onload = () => {
    if (canvas.value && canvasContainer.value) {
      // 设置画布大小
      const maxWidth = canvasContainer.value.clientWidth
      const maxHeight = 400
      let width = img.width
      let height = img.height

      // 保持宽高比例缩放
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.value.width = width
      canvas.value.height = height

      // 绘制图片
      const ctx = canvas.value.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        updateCanvas()
      }
    }
  }
  img.src = no1Template
})

// 重置为默认logo
const resetLogo = () => {
  logoUrl.value = defaultLogo
  updateCanvas()
}

// 处理Logo上传
const handleLogoUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    logoUrl.value = URL.createObjectURL(file)
    updateCanvas()
  }
}

// 选择类型
const selectType = (type: string) => {
  currentType.value = type
  const style = styleTypes[type]
  textColor.value = style.textColor
  // 确保立即更新画布
  nextTick(() => {
    updateCanvas()
  })
}

// 更新画布
const updateCanvas = () => {
  const ctx = canvas.value?.getContext('2d')
  if (!ctx || !canvas.value) return

  // 清空画布
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制基础图片
  const img = new Image()
  img.onload = () => {
    if (!canvas.value) return

    // 设置画布大小
    const maxWidth = canvasContainer.value?.clientWidth || 800
    const maxHeight = 400
    let width = img.width
    let height = img.height

    // 保持宽高比例缩放
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    canvas.value.width = width
    canvas.value.height = height

    // 绘制图片
    ctx.drawImage(img, 0, 0, width, height)

    // 设置文字样式
    ctx.font = `${fontSize.value}px "Source Han Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif`
    ctx.fillStyle = textColor.value
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'

    // 绘制文字
    if (text.value) {
      const textX = canvas.value.width / 2
      const textY = canvas.value.height - 30  // 固定距离底部30px

      // 获取当前样式
      const style = styleTypes[currentType.value]
      // 如果选择了样式且样式有描边
      if (style && style.strokeWidth > 0) {
        ctx.strokeStyle = style.strokeColor
        ctx.lineWidth = style.strokeWidth
        ctx.strokeText(text.value, textX, textY)
      }

      ctx.fillText(text.value, textX, textY)
    }

    // 如果有Logo，绘制Logo
    if (logoUrl.value) {
      const logo = new Image()
      logo.onload = () => {
        if (!canvas.value) return
        const logoWidth = canvas.value.width * (logoSize.value / 100)
        const logoHeight = logoWidth
        const logoX = canvas.value.width - logoWidth - 20
        const logoY = 20
        ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
      }
      logo.src = logoUrl.value
    }
  }
  img.src = no1Template
}

// 下载图片
const downloadImage = () => {
  if (!canvas.value) {
    showMessage('请先上传图片并添加文字', 'error')
    return
  }

  try {
    const link = document.createElement('a')
    link.download = '表情包_' + new Date().getTime() + '.png'
    link.href = canvas.value.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMessage('下载成功', 'success')
  } catch (error) {
    showMessage('下载失败，请稍后重试', 'error')
    console.error('下载错误:', error)
  }
}

// 显示提示信息
const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 修改监听器
watch([text, fontSize, textColor, logoSize, currentType], () => {
  nextTick(() => {
    updateCanvas()
  })
}, { deep: true })
</script>

<style scoped>
/* 保持与RandomEmoji.vue相同的动画和样式 */
.emoji-display {
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 输入框聚焦效果 */
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

/* 范围滑块样式 */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #ef4444;
  border-radius: 50%;
  cursor: pointer;
}

/* 颜色选择器样式 */
input[type="color"] {
  -webkit-appearance: none;
  padding: 0;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.template-item {
  transition: background-color 0.2s ease;
}

.template-item:hover {
  transform: translateY(-2px);
}
</style>
