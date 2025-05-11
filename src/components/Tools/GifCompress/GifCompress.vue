<!--
 * @file GifCompress.vue
 * @description GIF压缩工具组件，支持在线压缩GIF图片（功能开发中）
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-01-05
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
              class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-gray-50 hover:bg-gray-100"
              :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
              <div class="text-center px-4">
                <div class="w-8 h-8 mb-2 mx-auto">
                  <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="text-sm font-medium text-gray-600 mb-1">功能开发中</div>
                <p class="text-xs text-gray-400 mb-1">我们正在努力开发更好的 GIF 压缩功能</p>
                <p class="text-xs text-gray-400">敬请期待</p>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">批量处理</h4>
                  <p class="text-sm text-gray-600 mt-1">即将支持批量上传和处理多个GIF文件，提高工作效率</p>
                </div>
              </div>

              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">压缩质量</h4>
                  <p class="text-sm text-gray-600 mt-1">将提供多种压缩强度选择，可根据需求调整压缩效果</p>
                </div>
              </div>

              <div class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">打包下载</h4>
                  <p class="text-sm text-gray-600 mt-1">将支持压缩后的GIF文件单个下载或打包下载</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 开发进度 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">开发进度说明</div>
            <div class="space-y-6">
              <div class="border-b border-gray-200 pb-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">目前进度</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  我们正在开发更高效、更稳定的 GIF 压缩功能。目前正在解决动画帧保持和文件大小优化的问题，预计将很快与大家见面。
                </p>
              </div>
              <div>
                <h4 class="text-base font-medium text-gray-900 mb-3">即将推出</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  新版本将支持批量处理、自定义压缩参数、保持动画效果等功能，敬请期待。
                </p>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div class="pb-6 border-b border-gray-200">
                <h4 class="text-base font-medium text-gray-900 mb-3">支持哪些GIF格式？</h4>
                <p class="text-sm text-gray-600 leading-relaxed">支持所有标准的GIF动图格式，包括各种尺寸和帧数的GIF文件。</p>
              </div>
              <div class="pb-6 border-b border-gray-200">
                <h4 class="text-base font-medium text-gray-900 mb-3">压缩后的GIF质量如何？</h4>
                <p class="text-sm text-gray-600 leading-relaxed">我们采用智能压缩算法，在保证动画效果的同时最大程度减小文件体积。</p>
              </div>
              <div class="pb-6 border-b border-gray-200">
                <h4 class="text-base font-medium text-gray-900 mb-3">是否支持批量处理？</h4>
                <p class="text-sm text-gray-600 leading-relaxed">即将支持批量上传和处理多个GIF文件，提高工作效率。</p>
              </div>
              <div>
                <h4 class="text-base font-medium text-gray-900 mb-3">压缩是否安全？</h4>
                <p class="text-sm text-gray-600 leading-relaxed">所有处理都在本地完成，不会上传到服务器，确保您的文件安全。</p>
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
import { useRoute } from 'vue-router'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 获取当前路由
const route = useRoute()

// 组件配置信息
const info = {
  title: "免费在线 GIF 动图压缩工具",
  subtitle: "批量压缩降低 GIF 动图体积，同时保持动画效果（功能开发中）"
}

// 状态管理
const isDragging = ref(false)
</script>
