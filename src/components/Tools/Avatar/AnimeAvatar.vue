/**
* @file AnimeAvatar.vue
* @description 动漫头像转换工具，支持将照片转换为动漫风格
*
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @copyright 2024-2025 All Rights Reserved.
*
* @author Tomda
* @createDate 2025-01-12
* @lastUpdate 2025-01-12
* @version Beta 1.0.0
*
* 功能特性：
* 1. 上传照片转换为动漫风格
* 2. 一键下载功能
* 3. 优雅的动画效果
* 4. 响应式布局
*/

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const originalUrl = ref('')  // 原图预览URL
const avatarUrl = ref('')    // 转换后的图片URL
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const loading = ref(false)
const uploadRef = ref<HTMLInputElement | null>(null)

const showMessage = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 检查文件格式是否合法
const isValidImageFile = (file: File): boolean => {
  // 检查文件类型,只允许 jpg 和 png
  const validTypes = ['image/jpeg', 'image/png']
  if (!validTypes.includes(file.type)) {
    showMessage('请上传 JPG 或 PNG 格式的图片', 'error')
    return false
  }

  // 检查文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    showMessage('图片大小不能超过10MB', 'error')
    return false
  }

  return true
}

// 处理文件上传
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  // 验证文件格式
  if (!isValidImageFile(file)) {
    return
  }

  try {
    loading.value = true

    // 将文件转换为 base64
    const reader = new FileReader()
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = (e) => {
        originalUrl.value = e.target?.result as string
        resolve(e.target?.result)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const base64Data = await base64Promise
    if (!base64Data) {
      throw new Error('图片读取失败')
    }

    // 使用 base64 数据作为 url 参数
    const response = await fetch(`https://api.52vmy.cn/api/avath/painting?url=${encodeURIComponent(base64Data as string)}`)

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const data = await response.json()
    console.log('API响应:', data)

    if (data.code === 200) {
      avatarUrl.value = data.imgurl || data.url || data.data
      showMessage('转换成功', 'success')
    } else {
      throw new Error(data.msg || '转换失败')
    }
  } catch (error) {
    console.error('转换失败:', error)
    showMessage('转换失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

const downloadAvatar = async () => {
  if (!avatarUrl.value) {
    showMessage('请先转换头像', 'error')
    return
  }

  try {
    const response = await fetch(avatarUrl.value)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `anime-avatar-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    showMessage('下载成功', 'success')
  } catch (error) {
    console.error('下载失败:', error)
    showMessage('下载失败，请重试', 'error')
  }
}

const handleTitleClick = () => {
  uploadRef.value?.click()

  // 播放点击波纹动画
  const ripple = document.createElement('div')
  ripple.className = 'absolute bg-blue-500/20 rounded-full animate-ripple'
  ripple.style.width = '100px'
  ripple.style.height = '100px'
  ripple.style.left = '50%'
  ripple.style.top = '50%'
  ripple.style.transform = 'translate(-50%, -50%)'

  const title = document.querySelector('.group')
  if (title) {
    title.appendChild(ripple)
    setTimeout(() => ripple.remove(), 1000)
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">动漫头像转换</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">上传照片，一键转换为动漫风格头像</p>
          <p class="text-gray-400 text-xs mt-2">支持 JPG/PNG 格式，文件大小不超过 10MB</p>
        </div>

        <!-- 维护提示 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="flex items-center p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  该工具正在维护中，我们正在努力修复相关问题。请稍后再试！
                </p>
              </div>
            </div>
          </div>

          <!-- 隐藏的文件上传输入框 -->
          <input ref="uploadRef" type="file" accept="image/jpeg,image/png" class="hidden" @change="handleFileUpload" />
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
  </div>
</template>

<style scoped>
.avatar-preview {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

@keyframes ripple {
  from {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }

  to {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 1s ease-out forwards;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .avatar-preview {
    width: 150px;
    height: 150px;
  }
}
</style>
