<!--
 * @file AIDesignCover.vue
 * @description AI设计封面生成工具组件
 * @author AI Assistant
 * @createDate 2025-02-16
 *
 * 功能特性：
 * 1. 支持输入主题生成多种风格封面
 * 2. 支持选择不同的模板样式
 * 3. 支持自定义颜色和字体
 * 4. 支持图片预览和下载
 -->
<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
          <!-- 温馨提示 -->
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-600 text-sm">
              温馨提示：输入你想要生成的封面主题，AI将帮你生成精美的设计封面。
            </p>
          </div>
        </div>

        <!-- 左右布局容器 -->
        <div class="flex flex-col lg:flex-row gap-8">
          <!-- 左侧控制面板 -->
          <div class="lg:w-1/2 space-y-6">
            <!-- 功能介绍 -->
            <div class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
              <div class="grid grid-cols-2 gap-6">
                <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                  <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg v-if="feature.icon === 'AI'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <svg v-else-if="feature.icon === 'Style'" class="w-5 h-5 text-blue-500" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <svg v-else-if="feature.icon === 'Template'" class="w-5 h-5 text-blue-500" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <svg v-else-if="feature.icon === 'Download'" class="w-5 h-5 text-blue-500" fill="none"
                      stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="space-y-6">
              <!-- 主题输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">封面主题</label>
                <el-input v-model="topic" type="textarea" :rows="3" :placeholder="topicPlaceholder" class="w-full"
                  @input="handleInput" resize="both" />
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(example, index) in topicExamples" :key="index"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    @click="topic = example">
                    {{ example }}
                  </span>
                </div>
              </div>

              <!-- 风格选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">背景类型</label>
                <el-radio-group v-model="backgroundType" class="w-full" @change="updatePreview">
                  <el-radio label="gradient">渐变背景</el-radio>
                  <el-radio label="image">图片背景</el-radio>
                </el-radio-group>
              </div>

              <div v-if="backgroundType === 'gradient'">
                <label class="block text-sm font-medium text-gray-700 mb-2">封面风格</label>
                <el-select v-model="style" class="w-full">
                  <el-option v-for="item in styleOptions" :key="item.value" :label="item.label" :value="item.value">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg" :class="item.previewClass"></div>
                      <div>
                        <div class="font-medium">{{ item.label }}</div>
                        <div class="text-xs text-gray-500">{{ item.desc }}</div>
                      </div>
                    </div>
                  </el-option>
                </el-select>
              </div>

              <!-- 布局选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">布局选择</label>
                <div class="flex flex-wrap gap-2">
                  <div v-for="layout in layoutOptions" :key="layout.value"
                    class="relative p-2 border rounded-lg cursor-pointer hover:border-primary-500 transition-all duration-300"
                    :class="{ 'border-primary-500 bg-primary-50': selectedLayout === layout.value }"
                    @click="handleLayoutChange(layout.value)">
                    <component :is="layout.icon" class="w-4 h-4" />
                    <span class="text-xs ml-1">{{ layout.label }}</span>
                  </div>
                </div>
              </div>

              <!-- 尺寸设置 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">封面尺寸</label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-gray-500">宽度 (px)</label>
                    <el-input-number v-model="coverWidth" :min="400" :max="2000" :step="50" class="w-full"
                      @change="updatePreview" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">高度 (px)</label>
                    <el-input-number v-model="coverHeight" :min="300" :max="2000" :step="50" class="w-full"
                      @change="updatePreview" />
                  </div>
                </div>
                <!-- 预设尺寸 -->
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="preset in sizePresets" :key="preset.name"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer" :class="[
                      isCurrentPreset(preset)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]" @click="applyPreset(preset)">
                    {{ preset.name }}
                  </span>
                </div>
              </div>

              <!-- 字体设置 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">字体设置</label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-gray-500">字体大小</label>
                    <el-input-number v-model="fontSize" :min="12" :max="100" :step="2" class="w-full"
                      @change="updatePreview" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">字体选择</label>
                    <el-select v-model="fontFamily" class="w-full" @change="updatePreview">
                      <el-option v-for="font in fontFamilies" :key="font.value" :label="font.label" :value="font.value"
                        :style="{ fontFamily: font.value }" />
                    </el-select>
                  </div>
                </div>

                <!-- 字体粗细选择 -->
                <div class="mt-4">
                  <label class="text-xs text-gray-500">字体粗细</label>
                  <el-select v-model="fontWeight" class="w-full" @change="updatePreview">
                    <el-option label="常规" value="normal" />
                    <el-option label="加粗" value="bold" />
                    <el-option label="特粗" value="900" />
                  </el-select>
                </div>

                <!-- 字体颜色设置 -->
                <div class="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-gray-500">字体颜色</label>
                    <el-color-picker v-model="fontColor" show-alpha class="w-full" @change="updatePreview" />
                  </div>
                  <div>
                    <label class="text-xs text-gray-500">描边颜色</label>
                    <el-color-picker v-model="fontStrokeColor" show-alpha class="w-full" @change="updatePreview" />
                  </div>
                </div>

                <!-- 描边宽度 -->
                <div class="mt-4">
                  <label class="text-xs text-gray-500">描边宽度</label>
                  <el-slider v-model="fontStrokeWidth" :min="0" :max="10" :step="0.5" @change="updatePreview" />
                </div>
              </div>

              <!-- 装饰元素 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">装饰元素</label>
                <div class="flex flex-wrap gap-2">
                  <div v-for="element in decorativeElements" :key="element.value"
                    class="relative p-2 border rounded-lg cursor-pointer hover:border-primary-500 transition-all duration-300"
                    :class="{ 'border-primary-500 bg-primary-50': selectedElements.includes(element.value) }"
                    @click="toggleElement(element.value)">
                    <component :is="element.icon" class="w-4 h-4" />
                    <span class="text-xs ml-1">{{ element.label }}</span>
                  </div>
                </div>
              </div>

              <!-- 字体预设 -->
              <div class="mt-4">
                <label class="text-xs text-gray-500">字体预设</label>
                <div class="flex flex-wrap gap-2 mt-2">
                  <div v-for="preset in fontPresets" :key="preset.name"
                    class="px-3 py-1 rounded-full text-xs font-medium cursor-pointer" :class="[
                      'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    ]" @click="applyFontPreset(preset)">
                    {{ preset.name }}
                  </div>
                </div>
              </div>

              <!-- 下载按钮 -->
              <div class="flex justify-center mt-4 space-x-4">
                <el-button type="primary"
                  class="!px-8 !py-3 flex items-center gap-2 !bg-gradient-to-r !from-blue-500 !to-indigo-500 !border-0 !text-base"
                  @click="downloadImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载封面</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 右侧预览区域 -->
          <div class="lg:w-1/2">
            <div class="sticky top-8">
              <div class="bg-white border border-gray-200 rounded-lg p-6">
                <!-- 添加背景图片控制面板 -->
                <div class="mb-4 border-b border-gray-200 pb-4">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">背景图片</span>
                    <div class="flex gap-2">
                      <el-button size="small" @click="removeBackgroundImage" v-if="backgroundImage">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>移除</span>
                      </el-button>
                      <el-upload class="upload-demo" :show-file-list="false" :before-upload="handleImageUpload"
                        accept=".jpg,.jpeg,.png,.webp" :on-error="() => ElMessage.error('仅支持上传jpg、png、webp格式的图片')">
                        <el-button size="small" type="primary">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>上传图片</span>
                        </el-button>
                      </el-upload>
                    </div>
                  </div>
                  <!-- 图片控制选项 -->
                  <div class="space-y-4" v-if="backgroundImage">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">不透明度</label>
                      <el-slider v-model="imageOpacity" :min="0" :max="100" @change="updatePreview" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">模糊程度</label>
                      <el-slider v-model="imageBlur" :min="0" :max="20" @change="updatePreview" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">亮度调节</label>
                      <el-slider v-model="imageBrightness" :min="0" :max="200" @change="updatePreview" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">对比度</label>
                      <el-slider v-model="imageContrast" :min="0" :max="200" @change="updatePreview" />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">饱和度</label>
                      <el-slider v-model="imageSaturation" :min="0" :max="200" @change="updatePreview" />
                    </div>
                    <div class="flex gap-4">
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">缩放</label>
                        <el-slider v-model="imageScale" :min="50" :max="200" @change="updatePreview" />
                      </div>
                      <div class="flex-1">
                        <label class="block text-xs text-gray-500 mb-1">旋转</label>
                        <el-slider v-model="imageRotation" :min="0" :max="360" @change="updatePreview" />
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 原有的预览标题部分 -->
                <div class="mb-4 flex items-center justify-between">
                  <span class="text-lg font-medium text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    实时预览
                    <span class="text-sm font-normal text-orange-500 ml-2">(点击预览按钮查看实际效果)</span>
                  </span>
                  <div class="flex gap-2">
                    <el-button type="default" @click="handlePreview"
                      class="!px-4 !py-2 flex items-center gap-1 hover:!bg-gray-50 !text-sm !border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>预览</span>
                    </el-button>
                    <el-button type="primary"
                      class="!px-4 !py-2 flex items-center gap-1 !bg-gradient-to-r !from-blue-500 !to-indigo-500 !border-0 !text-sm"
                      @click="downloadImage">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>下载</span>
                    </el-button>
                  </div>
                </div>
                <div class="border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-auto relative"
                  style="max-height: 80vh;">
                  <div class="relative flex justify-center items-center min-h-[300px]">
                    <div class="preview-container" :style="{
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'center center'
                    }">
                      <canvas ref="canvasRef" :width="coverWidth" :height="coverHeight" :style="{
                        width: '100%',
                        height: '100%'
                      }">
                      </canvas>
                      <div
                        class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center text-sm py-2">
                        此处为缩略图，点击"预览"按钮查看实际效果
                      </div>
                    </div>
                    <div v-if="!generatedImageUrl"
                      class="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <span class="text-gray-400">预览区域</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="mt-12 bg-white rounded-xl p-8">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div v-for="(item, index) in faqItems" :key="index"
              class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- 工具推荐 -->
      <div class="mt-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>

    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const canvasRef = ref<HTMLCanvasElement | null>(null)

// SEO配置 - 使用useHead来配置页面的元信息
useHead({
  // 配置页面标题 - 显示在浏览器标签页上的文字
  title: '免费AI生成设计封面 - 智能封面设计工具',

  // meta标签配置数组 - 用于设置页面的元信息
  meta: [
    {
      // description标签 - 用于搜索引擎显示的页面描述
      name: 'description',
      content: '使用AI技术智能生成精美的设计封面，支持多种风格和布局，包括小红书、微信公众号等多平台封面。提供丰富的模板和装饰元素，一键生成专业级封面设计。'
    },
    {
      // keywords标签 - 页面关键词，帮助搜索引擎理解页面内容
      name: 'keywords',
      content: 'AI设计封面,封面生成器,智能封面设计,小红书封面,公众号封面,封面制作工具,AI封面生成'
    }
  ],

  // 结构化数据 - 帮助搜索引擎更好地理解网页内容的JSON-LD格式数据
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        // 声明使用Schema.org词汇表
        '@context': 'https://schema.org',
        // 声明这是一个Web应用
        '@type': 'WebApplication',
        // 应用名称
        name: '免费AI设计封面生成器',
        // 应用描述
        description: '使用AI技术智能生成精美的设计封面，支持多种风格和布局',
        // 应用类别
        applicationCategory: 'DesignApplication',
        // 运行环境
        operatingSystem: 'Web',
        // 价格信息
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY'
        },
        // 功能列表
        featureList: [
          'AI智能设计',
          '多种风格模板',
          '自定义布局',
          '一键下载'
        ],
        // 浏览器要求
        browserRequirements: '支持现代浏览器',
        // 需要的权限
        permissions: '需要访问浏览器剪贴板和文件系统权限',
        // 应用URL
        url: 'https://www.uiedtool.com/tools/ai-design-cover'
      })
    }
  ]
})

// 页面信息
const info = {
  title: '免费AI生成新媒体运营封面',
  subtitle: '基于 AI 技术的智能封面设计工具，一键生成精美的设计封面'
}

// 功能特性
const features = [
  {
    title: 'AI智能设计',
    desc: '智能分析主题，生成专业设计封面',
    icon: 'AI'
  },
  {
    title: '多种风格',
    desc: '支持多种设计风格和布局模式',
    icon: 'Style'
  },
  {
    title: '丰富模板',
    desc: '内置多种精美模板和装饰元素',
    icon: 'Template'
  },
  {
    title: '一键下载',
    desc: '支持高清图片导出和分享',
    icon: 'Download'
  }
]

// 常见问题
const faqItems = [
  {
    q: '如何使用这个工具？',
    a: '只需输入你想要的封面主题，选择喜欢的风格和布局，添加合适的装饰元素，点击生成按钮即可。AI 会根据你的选择自动生成精美的封面设计。'
  },
  {
    q: '支持哪些封面风格？',
    a: '目前支持简约商务、科技感、艺术创意、自然清新等多种风格，每种风格都有其独特的设计语言和视觉效果。'
  },
  {
    q: '生成的封面质量如何？',
    a: '我们使用先进的 AI 设计算法，结合专业设计师的审美标准，确保生成的封面具有专业的设计水准和视觉效果。'
  },
  {
    q: '可以自定义封面元素吗？',
    a: '可以。你可以选择不同的布局方式，添加或移除装饰元素，调整颜色风格等，实现个性化的封面设计。'
  }
]

// 表单数据
const topic = ref('UIEDTools在线免费工具')
const style = ref('xiaohongshu-1')
const selectedLayout = ref('center')
const selectedElements = ref<string[]>(['texture'])
const generating = ref(false)
const generatedImageUrl = ref('')

// 主题示例
const topicPlaceholder = '请输入你想要生成的封面主题，例如：产品介绍、活动宣传、个人作品集等'
const topicExamples = [
  'UIEDTools在线免费工具',
  '2025年度工作总结报告',
  '互联网产品设计指南3.0',
  '人工智能技术白皮书',
  '创意摄影作品集Vol.2',
  '企业品牌升级方案',
  '科技创新研究报告',
  '艺术展览邀请函',
  '数字化转型实践指南',
  '可持续发展倡议书',
  '新品发布会主视觉',
  '年度营销策略方案',
  '创业项目商业计划'
]

// 字体设置
const fontFamilies = [
  {
    label: '思源黑体',
    value: 'Noto Sans CJK SC',
    fallback: 'sans-serif'
  }
]

// 风格选项
const styleOptions = [
  {
    label: '小红书风格1',
    value: 'xiaohongshu-1',
    gradient: {
      colors: ['#ff6b6b', '#ff8787'],
      type: 'linear'
    },
    desc: '活力粉红渐变风格',
    previewClass: 'bg-gradient-to-r from-red-400 to-pink-400'
  },
  {
    label: '小红书风格2',
    value: 'xiaohongshu-2',
    gradient: {
      colors: ['#845EC2', '#D65DB1'],
      type: 'linear'
    },
    desc: '梦幻紫粉渐变',
    previewClass: 'bg-gradient-to-r from-purple-500 to-pink-500'
  },
  {
    label: '小红书风格3',
    value: 'xiaohongshu-3',
    gradient: {
      colors: ['#FF9671', '#FFC75F'],
      type: 'linear'
    },
    desc: '温暖橙黄渐变',
    previewClass: 'bg-gradient-to-r from-orange-400 to-yellow-400'
  },
  {
    label: '小红书风格4',
    value: 'xiaohongshu-4',
    gradient: {
      colors: ['#00C9A7', '#4D8076'],
      type: 'linear'
    },
    desc: '清新绿色渐变',
    previewClass: 'bg-gradient-to-r from-teal-400 to-green-600'
  },
  {
    label: '小红书风格5',
    value: 'xiaohongshu-5',
    gradient: {
      colors: ['#FF4B91', '#FF7676'],
      type: 'linear'
    },
    desc: '甜美粉红渐变',
    previewClass: 'bg-gradient-to-r from-pink-500 to-red-400'
  },
  {
    label: '小红书风格6',
    value: 'xiaohongshu-6',
    gradient: {
      colors: ['#FF8066', '#FF5F6D'],
      type: 'linear'
    },
    desc: '珊瑚红渐变',
    previewClass: 'bg-gradient-to-r from-red-300 to-red-500'
  },
  {
    label: '现代简约',
    value: 'modern',
    gradient: {
      colors: ['#ffffff', '#f3f4f6'],
      type: 'linear'
    },
    desc: '简洁大方的现代风格',
    previewClass: 'bg-gradient-to-r from-white to-gray-100'
  },
  {
    label: '霓虹科技',
    value: 'neon-tech',
    gradient: {
      colors: ['#0beef9', '#ff3c9e'],
      type: 'linear'
    },
    desc: '充满未来感的霓虹效果',
    previewClass: 'bg-gradient-to-r from-cyan-400 to-pink-500'
  },
  {
    label: '自然渐变',
    value: 'nature',
    gradient: {
      colors: ['#a8ff78', '#78ffd6'],
      type: 'linear'
    },
    desc: '舒适自然的渐变效果',
    previewClass: 'bg-gradient-to-r from-green-300 to-teal-200'
  },
  {
    label: '深海渐变',
    value: 'deep-ocean',
    gradient: {
      colors: ['#2C3E50', '#3498DB'],
      type: 'radial'
    },
    desc: '深邃神秘的海洋风格',
    previewClass: 'bg-gradient-to-r from-slate-800 to-blue-500'
  },
  {
    label: '渐变紫金',
    value: 'gradient-purple-gold',
    gradient: {
      colors: ['#DA22FF', '#9733EE', '#FF8C00'],
      type: 'linear'
    },
    desc: '高贵典雅的紫金渐变',
    previewClass: 'bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-500'
  },
  {
    label: '极光蓝绿',
    value: 'aurora',
    gradient: {
      colors: ['#00F5A0', '#00D9F5'],
      type: 'linear'
    },
    desc: '清新淡雅的极光色调',
    previewClass: 'bg-gradient-to-r from-green-400 to-cyan-400'
  },
  {
    label: '日落橙红',
    value: 'sunset',
    gradient: {
      colors: ['#FF512F', '#F09819'],
      type: 'linear'
    },
    desc: '温暖活力的日落色彩',
    previewClass: 'bg-gradient-to-r from-red-500 to-yellow-500'
  },
  {
    label: '星空蓝紫',
    value: 'starry-night',
    gradient: {
      colors: ['#1A2980', '#26D0CE'],
      type: 'linear'
    },
    desc: '深邃神秘的星空色调',
    previewClass: 'bg-gradient-to-r from-blue-900 to-cyan-400'
  },
  {
    label: '科技蓝紫',
    value: 'tech-blue-purple',
    gradient: {
      colors: ['#4A00E0', '#8E2DE2'],
      type: 'linear'
    },
    desc: '未来科技感的蓝紫渐变',
    previewClass: 'bg-gradient-to-r from-indigo-600 to-purple-600'
  },
  {
    label: '薄暮渐变',
    value: 'sunset-gradient',
    gradient: {
      colors: ['#FF416C', '#FF4B2B'],
      type: 'linear'
    },
    desc: '充满活力的红橙渐变',
    previewClass: 'bg-gradient-to-r from-red-500 to-orange-500'
  },
  {
    label: '青柠薄荷',
    value: 'lime-mint',
    gradient: {
      colors: ['#00F260', '#0575E6'],
      type: 'linear'
    },
    desc: '清新自然的绿蓝渐变',
    previewClass: 'bg-gradient-to-r from-green-400 to-blue-500'
  },
  {
    label: '莓果奶昔',
    value: 'berry-smoothie',
    gradient: {
      colors: ['#E8CBC0', '#636FA4'],
      type: 'linear'
    },
    desc: '柔和的粉紫渐变',
    previewClass: 'bg-gradient-to-r from-pink-200 to-purple-400'
  },
  {
    label: '金秋落叶',
    value: 'autumn-leaves',
    gradient: {
      colors: ['#DAA520', '#D35400'],
      type: 'linear'
    },
    desc: '温暖的金橙渐变',
    previewClass: 'bg-gradient-to-r from-yellow-600 to-orange-700'
  },
  {
    label: '赛博朋克',
    value: 'cyberpunk',
    gradient: {
      colors: ['#FF00FF', '#00FFFF', '#FF00FF'],
      type: 'linear'
    },
    desc: '未来科技感的霓虹效果',
    previewClass: 'bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-fuchsia-500'
  },
  {
    label: '暗黑金属',
    value: 'dark-metal',
    gradient: {
      colors: ['#1a1a1a', '#4a4a4a', '#1a1a1a'],
      type: 'linear'
    },
    desc: '金属质感的暗黑风格',
    previewClass: 'bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900'
  },
  {
    label: '梦幻极光',
    value: 'aurora-dream',
    gradient: {
      colors: ['#97D9E1', '#D9AFD9', '#97D9E1'],
      type: 'linear'
    },
    desc: '柔和梦幻的极光效果',
    previewClass: 'bg-gradient-to-r from-cyan-200 via-pink-200 to-cyan-200'
  },
  {
    label: '热带风情',
    value: 'tropical',
    gradient: {
      colors: ['#FF9A9E', '#FAD0C4', '#FFD1FF'],
      type: 'linear'
    },
    desc: '充满活力的热带色彩',
    previewClass: 'bg-gradient-to-r from-red-300 via-orange-200 to-pink-200'
  },
  {
    label: '深海探秘',
    value: 'deep-sea',
    gradient: {
      colors: ['#000428', '#004e92', '#000428'],
      type: 'linear'
    },
    desc: '神秘深邃的海洋风格',
    previewClass: 'bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900'
  },
  {
    label: '森林晨露',
    value: 'forest-dawn',
    gradient: {
      colors: ['#76b852', '#8DC26F', '#76b852'],
      type: 'linear'
    },
    desc: '清新自然的森林气息',
    previewClass: 'bg-gradient-to-r from-green-600 via-green-500 to-green-600'
  },
  {
    label: '沙漠日落',
    value: 'desert-sunset',
    gradient: {
      colors: ['#FFB75E', '#ED8F03', '#FFB75E'],
      type: 'linear'
    },
    desc: '温暖壮丽的沙漠景色',
    previewClass: 'bg-gradient-to-r from-amber-400 via-orange-600 to-amber-400'
  },
  {
    label: '樱花飞舞',
    value: 'sakura',
    gradient: {
      colors: ['#FF758C', '#FF7EB3', '#FF758C'],
      type: 'linear'
    },
    desc: '浪漫唯美的樱花风格',
    previewClass: 'bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400'
  },
  {
    label: '电音律动',
    value: 'electronic',
    gradient: {
      colors: ['#4776E6', '#8E54E9', '#4776E6'],
      type: 'linear'
    },
    desc: '充满动感的电音风格',
    previewClass: 'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500'
  },
  {
    label: '复古胶片',
    value: 'vintage-film',
    gradient: {
      colors: ['#A8CABA', '#5D4157', '#A8CABA'],
      type: 'linear'
    },
    desc: '怀旧复古的胶片质感',
    previewClass: 'bg-gradient-to-r from-green-200 via-purple-800 to-green-200'
  },
  {
    label: '冰雪奇缘',
    value: 'frozen',
    gradient: {
      colors: ['#E0EAFC', '#CFDEF3', '#E0EAFC'],
      type: 'linear'
    },
    desc: '清冷透明的冰雪效果',
    previewClass: 'bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100'
  },
  {
    label: '糖果色彩',
    value: 'candy',
    gradient: {
      colors: ['#FF61D2', '#FE9090', '#FF61D2'],
      type: 'linear'
    },
    desc: '甜美可爱的糖果色调',
    previewClass: 'bg-gradient-to-r from-pink-500 via-red-300 to-pink-500'
  },
  {
    label: '水墨丹青',
    value: 'ink-painting',
    gradient: {
      colors: ['#2c3e50', '#3498db', '#2c3e50'],
      type: 'linear'
    },
    desc: '中国传统水墨风格',
    previewClass: 'bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800'
  },
  {
    label: '星空璀璨',
    value: 'starry-sky',
    gradient: {
      colors: ['#16222A', '#3A6073', '#16222A'],
      type: 'linear'
    },
    desc: '璀璨迷人的星空效果',
    previewClass: 'bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900'
  },
  {
    label: '都市霓虹',
    value: 'city-neon',
    gradient: {
      colors: ['#D585FF', '#00FFEE', '#D585FF'],
      type: 'linear'
    },
    desc: '城市夜景的霓虹效果',
    previewClass: 'bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400'
  },
  {
    label: '翡翠玉石',
    value: 'jade',
    gradient: {
      colors: ['#00A86B', '#004B49', '#00A86B'],
      type: 'linear'
    },
    desc: '高贵典雅的玉石质感',
    previewClass: 'bg-gradient-to-r from-green-600 via-teal-800 to-green-600'
  },
  {
    label: '火山熔岩',
    value: 'volcano-lava',
    gradient: {
      colors: ['#F83600', '#FE8C00', '#F83600'],
      type: 'linear'
    },
    desc: '炽热奔放的熔岩效果',
    previewClass: 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600'
  },
  {
    label: '薰衣草田',
    value: 'lavender',
    gradient: {
      colors: ['#8E2DE2', '#B06AB3', '#8E2DE2'],
      type: 'linear'
    },
    desc: '浪漫梦幻的薰衣草色',
    previewClass: 'bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600'
  },
  {
    label: '孔雀翎羽',
    value: 'peacock',
    gradient: {
      colors: ['#2193b0', '#6dd5ed', '#2193b0'],
      type: 'linear'
    },
    desc: '绚丽多彩的孔雀色调',
    previewClass: 'bg-gradient-to-r from-cyan-600 via-cyan-300 to-cyan-600'
  },
  {
    label: '红酒醇香',
    value: 'wine',
    gradient: {
      colors: ['#6A1B9A', '#4A148C', '#6A1B9A'],
      type: 'linear'
    },
    desc: '深邃醇厚的酒红色调',
    previewClass: 'bg-gradient-to-r from-purple-800 via-purple-900 to-purple-800'
  },
  {
    label: '山川云雾',
    value: 'mountain-mist',
    gradient: {
      colors: ['#757F9A', '#D7DDE8', '#757F9A'],
      type: 'linear'
    },
    desc: '空灵淡雅的云雾效果',
    previewClass: 'bg-gradient-to-r from-gray-600 via-gray-300 to-gray-600'
  },
  {
    label: '珊瑚海岸',
    value: 'coral-coast',
    gradient: {
      colors: ['#ff9a9e', '#fad0c4', '#ff9a9e'],
      type: 'linear'
    },
    desc: '温柔细腻的珊瑚粉',
    previewClass: 'bg-gradient-to-r from-red-300 via-pink-200 to-red-300'
  },
  {
    label: '青铜古韵',
    value: 'bronze',
    gradient: {
      colors: ['#B79891', '#94716B', '#B79891'],
      type: 'linear'
    },
    desc: '古朴厚重的青铜质感',
    previewClass: 'bg-gradient-to-r from-stone-400 via-stone-600 to-stone-400'
  },
  {
    label: '极地光晕',
    value: 'polar-aura',
    gradient: {
      colors: ['#4facfe', '#00f2fe', '#4facfe'],
      type: 'linear'
    },
    desc: '清澈透亮的极地光效',
    previewClass: 'bg-gradient-to-r from-blue-500 via-cyan-300 to-blue-500'
  },
  {
    label: '翠竹清影',
    value: 'bamboo',
    gradient: {
      colors: ['#50A684', '#88D3CE', '#50A684'],
      type: 'linear'
    },
    desc: '清新淡雅的竹林意境',
    previewClass: 'bg-gradient-to-r from-green-600 via-emerald-300 to-green-600'
  },
  {
    label: '琥珀时光',
    value: 'amber-time',
    gradient: {
      colors: ['#c79081', '#dfa579', '#c79081'],
      type: 'linear'
    },
    desc: '温润通透的琥珀色泽',
    previewClass: 'bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400'
  },
  {
    label: '玫瑰花语',
    value: 'rose-poem',
    gradient: {
      colors: ['#ee9ca7', '#ffdde1', '#ee9ca7'],
      type: 'linear'
    },
    desc: '浪漫温柔的玫瑰粉红',
    previewClass: 'bg-gradient-to-r from-rose-400 via-pink-200 to-rose-400'
  },
  {
    label: '静谧月光',
    value: 'moonlight',
    gradient: {
      colors: ['#141E30', '#243B55', '#141E30'],
      type: 'linear'
    },
    desc: '深邃静谧的月夜氛围',
    previewClass: 'bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900'
  },
  {
    label: '彩虹糖果',
    value: 'rainbow-candy',
    gradient: {
      colors: ['#FF61D2', '#FE9090', '#FFC837', '#FF61D2'],
      type: 'linear'
    },
    desc: '缤纷绚丽的彩虹色彩',
    previewClass: 'bg-gradient-to-r from-pink-500 via-red-300 to-yellow-400'
  }
]

// 布局选项
const layoutOptions = [
  {
    label: '居中布局',
    value: 'center',
    icon: 'IconLayoutCenter',
    desc: '文字居中显示'
  }
]

// 装饰元素
const decorativeElements = [
  {
    label: '渐变边框',
    value: 'gradient-border',
    icon: 'IconBorder',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      gradient.addColorStop(0, '#ff3cac')
      gradient.addColorStop(0.5, '#784ba0')
      gradient.addColorStop(1, '#2b86c5')
      ctx.strokeStyle = gradient
      ctx.lineWidth = 8
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    }
  },
  {
    label: '角标装饰',
    value: 'corner-decoration',
    icon: 'IconCorner',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const size = 30
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      // 左上角
      ctx.beginPath()
      ctx.moveTo(0, size)
      ctx.lineTo(0, 0)
      ctx.lineTo(size, 0)
      ctx.stroke()
      // 右上角
      ctx.beginPath()
      ctx.moveTo(canvas.width - size, 0)
      ctx.lineTo(canvas.width, 0)
      ctx.lineTo(canvas.width, size)
      ctx.stroke()
      // 左下角
      ctx.beginPath()
      ctx.moveTo(0, canvas.height - size)
      ctx.lineTo(0, canvas.height)
      ctx.lineTo(size, canvas.height)
      ctx.stroke()
      // 右下角
      ctx.beginPath()
      ctx.moveTo(canvas.width - size, canvas.height)
      ctx.lineTo(canvas.width, canvas.height)
      ctx.lineTo(canvas.width, canvas.height - size)
      ctx.stroke()
    }
  },
  {
    label: '波浪线',
    value: 'wave-line',
    icon: 'IconWave',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      const amplitude = 20
      const frequency = 0.02
      for (let x = 0; x < canvas.width; x++) {
        const y = amplitude * Math.sin(frequency * x) + canvas.height - 40
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }
  },
  {
    label: '光晕效果',
    value: 'glow',
    icon: 'IconGlow',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  },
  {
    label: '纹理背景',
    value: 'texture',
    icon: 'IconTexture',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const size = 20
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += size) {
        for (let y = 0; y < canvas.height; y += size) {
          ctx.strokeRect(x, y, size, size)
        }
      }
    }
  },
  {
    label: '虚线框',
    value: 'dashed-border',
    icon: 'IconDashed',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
      ctx.setLineDash([])
    }
  },
  {
    label: '几何图形',
    value: 'geometric',
    icon: 'IconGeometric',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      // 绘制各种几何图形
      // 圆形
      ctx.beginPath()
      ctx.arc(50, 50, 30, 0, Math.PI * 2)
      ctx.stroke()
      // 正方形
      ctx.strokeRect(canvas.width - 80, 50, 60, 60)
      // 三角形
      ctx.beginPath()
      ctx.moveTo(50, canvas.height - 50)
      ctx.lineTo(80, canvas.height - 80)
      ctx.lineTo(110, canvas.height - 50)
      ctx.closePath()
      ctx.stroke()
    }
  },
  {
    label: '粒子效果',
    value: 'particles',
    icon: 'IconParticles',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1
      }))

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      particles.forEach(particle => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }
  },
  {
    label: '星星点缀',
    value: 'stars',
    icon: 'IconStar',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 3 + 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  {
    label: '圆形装饰',
    value: 'circles',
    icon: 'IconCircle',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 30 + 10
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  },
  {
    label: '动感线条',
    value: 'dynamic-lines',
    icon: 'IconLine',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const startX = Math.random() * canvas.width
        const startY = Math.random() * canvas.height
        const endX = startX + (Math.random() - 0.5) * 100
        const endY = startY + (Math.random() - 0.5) * 100
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    }
  },
  {
    label: '光点效果',
    value: 'light-dots',
    icon: 'IconDot',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 2 + 1
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  {
    label: '网格背景',
    value: 'grid-pattern',
    icon: 'IconGrid',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      const gridSize = 40
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.strokeRect(x, y, gridSize, gridSize)
        }
      }
    }
  },
  {
    label: '霓虹光效',
    value: 'neon-glow',
    icon: 'IconNeon',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)')
      gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)')
      gradient.addColorStop(1, 'rgba(255, 0, 255, 0.2)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 添加光晕效果
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const glow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, canvas.width * 0.5
      )
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      glow.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
      glow.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  },
  {
    label: '故障效果',
    value: 'glitch',
    icon: 'IconGlitch',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const numGlitches = 5
      const glitchHeight = canvas.height / 30

      for (let i = 0; i < numGlitches; i++) {
        const y = Math.random() * canvas.height
        const x = Math.random() * canvas.width * 0.2

        ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.2})`
        ctx.fillRect(x, y, canvas.width - x * 2, glitchHeight)

        ctx.fillStyle = `rgba(255, 0, 255, ${Math.random() * 0.2})`
        ctx.fillRect(x + 5, y + 5, canvas.width - x * 2, glitchHeight)
      }
    }
  },
  {
    label: '渐变描边',
    value: 'gradient-stroke',
    icon: 'IconStroke',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#ff3cac')
      gradient.addColorStop(0.5, '#784ba0')
      gradient.addColorStop(1, '#2b86c5')

      ctx.strokeStyle = gradient
      ctx.lineWidth = 10
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

      // 内层描边
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 2
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
    }
  },
  {
    label: '动态线条',
    value: 'dynamic-stripes',
    icon: 'IconStripes',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const numStripes = 8
      const stripeWidth = canvas.width / numStripes

      for (let i = 0; i < numStripes; i++) {
        const x = i * stripeWidth
        const gradient = ctx.createLinearGradient(x, 0, x + stripeWidth, canvas.height)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.05 + (i / numStripes) * 0.1})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(x, 0, stripeWidth, canvas.height)
      }
    }
  },
  {
    label: '光斑效果',
    value: 'light-spots',
    icon: 'IconSpots',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const numSpots = 5
      for (let i = 0; i < numSpots; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 100 + 50

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)')
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  {
    label: '纸张纹理',
    value: 'paper-texture',
    icon: 'IconPaper',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      const size = 4
      for (let x = 0; x < canvas.width; x += size) {
        for (let y = 0; y < canvas.height; y += size) {
          const opacity = Math.random() * 0.05
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fillRect(x, y, size, size)
        }
      }
    }
  },
  {
    label: '3D效果',
    value: '3d-effect',
    icon: 'Icon3D',
    render: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
      // 绘制主要边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 2
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

      // 绘制3D效果线条
      ctx.beginPath()
      ctx.moveTo(30, 30)
      ctx.lineTo(60, 60)
      ctx.moveTo(canvas.width - 30, 30)
      ctx.lineTo(canvas.width - 60, 60)
      ctx.moveTo(30, canvas.height - 30)
      ctx.lineTo(60, canvas.height - 60)
      ctx.moveTo(canvas.width - 30, canvas.height - 30)
      ctx.lineTo(canvas.width - 60, canvas.height - 60)
      ctx.stroke()

      // 绘制内部边框
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120)
    }
  }
]

// 切换装饰元素
const toggleElement = (value: string) => {
  const index = selectedElements.value.indexOf(value)
  if (index === -1) {
    selectedElements.value.push(value)
  } else {
    selectedElements.value.splice(index, 1)
  }
  updatePreview()
}

// 封面尺寸
const coverWidth = ref(800)
const coverHeight = ref(600)

// 预览相关的计算属性
const previewWidth = computed(() => coverWidth.value)
const previewHeight = computed(() => coverHeight.value)
const previewScale = computed(() => {
  // 获取预览容器的最大宽度（考虑padding）
  const containerWidth = window.innerWidth * 0.8 - 32 // 80vh - 2 * padding
  const containerHeight = window.innerHeight * 0.8 - 32

  // 计算缩放比例，确保预览图片完全显示在容器内
  const scaleX = containerWidth / coverWidth.value
  const scaleY = containerHeight / coverHeight.value
  return Math.min(scaleX, scaleY, 1) // 最大不超过原始尺寸
})

// 监听尺寸变化
watch([coverWidth, coverHeight], () => {
  // 重新渲染画布
  nextTick(() => {
    updatePreview()
  })
}, { deep: true })

// 预设尺寸
const sizePresets = [
  { name: '小红书封面', width: 800, height: 600 },
  { name: '微信公众号封面', width: 900, height: 500 },
  { name: '知乎封面', width: 1200, height: 600 },
  { name: '通用海报', width: 1080, height: 1920 }
]

// 字体设置
const fontSize = ref(48)
const fontFamily = ref('Noto Sans CJK SC')
const fontColor = ref('#ffffff')
const fontStrokeColor = ref('#000000')
const fontStrokeWidth = ref(0)
const fontWeight = ref('bold')

// 判断当前是否为预设尺寸
const isCurrentPreset = (preset: typeof sizePresets[0]) => {
  return coverWidth.value === preset.width && coverHeight.value === preset.height
}

// 应用预设尺寸
const applyPreset = (preset: typeof sizePresets[0]) => {
  coverWidth.value = preset.width
  coverHeight.value = preset.height
  updatePreview()
}

// 布局选择
const handleLayoutChange = (layout: string) => {
  selectedLayout.value = layout
  updatePreview()
}

// 背景图片相关状态
const backgroundImage = ref<HTMLImageElement | null>(null)
const imageOpacity = ref(100)
const imageBlur = ref(0)
const imageBrightness = ref(100)
const imageContrast = ref(100)
const imageSaturation = ref(100)
const imageScale = ref(100)
const imageRotation = ref(0)

// 处理图片上传
const handleImageUpload = (file: File) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    ElMessage.error('仅支持上传jpg、png、webp格式的图片')
    return false
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      backgroundImage.value = img
      updatePreview()
    }
    img.src = e.target?.result as string
  }
  reader.readAsDataURL(file)
  return false // 阻止自动上传
}

// 移除背景图片
const removeBackgroundImage = () => {
  backgroundImage.value = null
  updatePreview()
}

// 更新预览
const updatePreview = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置画布尺寸
  canvas.width = coverWidth.value
  canvas.height = coverHeight.value

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 根据背景类型选择渲染方式
  if (backgroundType.value === 'image' && backgroundImage.value) {
    // 创建临时canvas用于应用滤镜
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height

    // 在临时canvas上绘制图片
    const img = backgroundImage.value
    const imgWidth = img.width
    const imgHeight = img.height
    const ratio = Math.max(canvas.width / imgWidth, canvas.height / imgHeight)
    const drawWidth = imgWidth * ratio
    const drawHeight = imgHeight * ratio

    // 计算居中位置
    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2

    // 应用变换
    tempCtx.save()
    tempCtx.translate(canvas.width / 2, canvas.height / 2)
    tempCtx.rotate((imageRotation.value * Math.PI) / 180)
    tempCtx.scale(imageScale.value / 100, imageScale.value / 100)
    tempCtx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
    tempCtx.restore()

    // 创建滤镜效果的canvas
    const filterCanvas = document.createElement('canvas')
    const filterCtx = filterCanvas.getContext('2d')
    if (!filterCtx) return

    filterCanvas.width = canvas.width
    filterCanvas.height = canvas.height

    // 应用滤镜
    filterCtx.filter = `
      blur(${imageBlur.value}px)
      brightness(${imageBrightness.value}%)
      contrast(${imageContrast.value}%)
      saturate(${imageSaturation.value}%)
    `
    filterCtx.drawImage(tempCanvas, 0, 0)

    // 将处理后的图片绘制到主canvas
    ctx.globalAlpha = imageOpacity.value / 100
    ctx.drawImage(filterCanvas, 0, 0)
    ctx.globalAlpha = 1.0
  } else {
    // 渲染渐变背景
    const selectedStyle = styleOptions.find(s => s.value === style.value)
    if (selectedStyle) {
      const { gradient } = selectedStyle
      let gradientObj = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.colors.forEach((color, index) => {
        gradientObj.addColorStop(index / (gradient.colors.length - 1), color)
      })
      ctx.fillStyle = gradientObj
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  // 计算基准尺寸和自适应字体大小
  const calculateFontSize = () => {
    const baseDimension = Math.min(canvas.width, canvas.height)
    const maxWidth = canvas.width * 0.8 // 文本区域宽度
    const maxHeight = canvas.height * 0.8 // 文本区域高度

    // 初始字体大小
    let calculatedSize = Math.min(
      fontSize.value,
      baseDimension * 0.15,
      maxWidth / Math.max(topic.value.split('\n')[0].length, 4)
    )

    // 最小字体大小限制
    const minSize = Math.max(
      24,
      Math.min(canvas.width, canvas.height) * 0.04
    )

    // 二分法查找合适的字体大小
    let low = minSize
    let high = calculatedSize
    let bestSize = low
    const maxIterations = 10

    for (let i = 0; i < maxIterations; i++) {
      const mid = (low + high) / 2
      ctx.font = `${fontWeight.value} ${mid}px "${fontFamily.value}"`

      // 计算当前字体大小下的文本布局
      const lines = []
      // 首先按照用户输入的换行符分割文本
      const userLines = topic.value.split('\n')

      // 处理每一行用户输入的文本
      userLines.forEach(userLine => {
        let currentLine = ''
        // 对每一行再进行字符分割和宽度计算
        const words = userLine.split('')

        for (const word of words) {
          const testLine = currentLine + word
          const metrics = ctx.measureText(testLine)
          const testWidth = metrics.width + (testLine.length - 1) * (mid * 0.1)

          if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            currentLine += word
          }
        }

        if (currentLine) {
          lines.push(currentLine)
        }
      })

      const lineSpacing = mid * 1.5
      // 计算总高度
      const totalHeight = (lines.length - 1) * lineSpacing + mid

      // 检查是否符合限制
      if (totalHeight <= maxHeight && lines.length > 0) {
        bestSize = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return bestSize
  }

  const adaptiveFontSize = calculateFontSize()
  const letterSpacing = adaptiveFontSize * (canvas.width > 1000 ? 0.15 : 0.1)
  const lineHeight = adaptiveFontSize * (canvas.height > canvas.width ? 1.5 : 1.8)

  // 文本区域计算
  const textAreaWidth = canvas.width * 0.8
  const textAreaHeight = canvas.height * 0.8

  // 分割文本为多行
  const lines = []
  let currentLine = ''
  // 首先按照用户输入的换行符分割文本
  const userLines = topic.value.split('\n')

  ctx.font = `${fontWeight.value} ${adaptiveFontSize}px "${fontFamily.value}"`

  // 处理每一行用户输入的文本
  userLines.forEach(userLine => {
    // 如果是空行，直接添加一个空行
    if (!userLine.trim()) {
      lines.push('')
      return
    }

    // 对每一行再进行字符分割和宽度计算
    const words = userLine.split('')
    currentLine = ''

    for (const word of words) {
      const testLine = currentLine + word
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width + (testLine.length - 1) * letterSpacing

      if (testWidth > textAreaWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine += word
      }
    }

    if (currentLine) {
      lines.push(currentLine)
    }
  })

  // 计算文本总高度和垂直位置
  const singleLineHeight = adaptiveFontSize
  const totalHeight = (lines.length - 1) * lineHeight + singleLineHeight
  const startY = (canvas.height - totalHeight) / 2 + singleLineHeight / 2

  // 渲染文字函数
  const renderText = (text: string, x: number, y: number) => {
    if (!text.trim()) return

    const chars = text.split('')
    const spacing = letterSpacing
    const charWidths = chars.map(char => Math.ceil(ctx.measureText(char).width))
    const totalTextWidth = charWidths.reduce((sum, width) => sum + width, 0) +
      (chars.length - 1) * spacing

    // 确保文字水平居中且不超出边界
    const startX = Math.max(
      spacing * 2,
      Math.round(x - totalTextWidth / 2)
    )
    let currentX = startX

    chars.forEach((char, index) => {
      if (fontStrokeWidth.value > 0) {
        ctx.save()
        ctx.strokeStyle = fontStrokeColor.value
        ctx.lineWidth = fontStrokeWidth.value
        ctx.lineJoin = 'round'
        ctx.miterLimit = 2
        ctx.strokeText(char, currentX, y)
        ctx.restore()
      }

      ctx.save()
      ctx.fillStyle = fontColor.value
      ctx.fillText(char, currentX, y)
      ctx.restore()

      currentX = Math.min(
        currentX + charWidths[index] + spacing,
        canvas.width - spacing * 2
      )
    })
  }

  // 绘制装饰元素
  selectedElements.value.forEach(elementValue => {
    const element = decorativeElements.find(e => e.value === elementValue)
    if (element?.render) {
      ctx.save()
      element.render(ctx, canvas)
      ctx.restore()
    }
  })

  // 根据布局渲染文字
  switch (selectedLayout.value) {
    case 'center': {
      lines.forEach((line: string, index: number) => {
        const lineY = Math.round(startY + index * lineHeight)
        renderText(line.trim(), canvas.width / 2, lineY)
      })
      break
    }
    case 'split': {
      const halfWidth = canvas.width / 2
      lines.forEach((line: string, index: number) => {
        const x = index % 2 === 0 ? halfWidth / 2 : halfWidth * 1.5
        const y = startY + (index - lines.length / 2) * lineHeight
        renderText(line.trim(), x, y)
      })
      break
    }
    case 'diagonal': {
      lines.forEach((line: string, index: number) => {
        const progress = index / (lines.length - 1)
        const x = canvas.width * 0.2 + progress * canvas.width * 0.6
        const y = canvas.height * 0.2 + progress * canvas.height * 0.6
        renderText(line.trim(), x, y)
      })
      break
    }
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(lines.length))
      const rows = Math.ceil(lines.length / cols)
      const cellWidth = canvas.width / cols
      const cellHeight = canvas.height / rows
      lines.forEach((line: string, index: number) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const x = cellWidth * (col + 0.5)
        const y = cellHeight * (row + 0.5)
        renderText(line.trim(), x, y)
      })
      break
    }
    case 'circular': {
      const radius = Math.min(canvas.width, canvas.height) * 0.3
      lines.forEach((line: string, index: number) => {
        const angle = (index / lines.length) * Math.PI * 2
        const x = canvas.width / 2 + Math.cos(angle) * radius
        const y = canvas.height / 2 + Math.sin(angle) * radius
        renderText(line.trim(), x, y)
      })
      break
    }
    case 'steps': {
      lines.forEach((line: string, index: number) => {
        const x = canvas.width * 0.2 + (index / (lines.length - 1)) * canvas.width * 0.6
        const y = canvas.height * 0.2 + (index / (lines.length - 1)) * canvas.height * 0.6
        renderText(line.trim(), x, y)
      })
      break
    }
    case 'wave': {
      lines.forEach((line: string, index: number) => {
        const progress = index / (lines.length - 1)
        const x = canvas.width * 0.2 + progress * canvas.width * 0.6
        const y = startY + Math.sin(progress * Math.PI * 2) * 50
        renderText(line.trim(), x, y)
      })
      break
    }
  }

  // 生成预览图
  try {
    const dataUrl = canvas.toDataURL('image/png')
    generatedImageUrl.value = dataUrl
  } catch (error) {
    console.error('预览图片生成失败:', error)
    ElMessage.error('预览图片生成失败，请重试')
  }
}

// 下载图片
const downloadImage = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cover-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, 'image/png')
}

// 查看大图
const handlePreview = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const dataUrl = canvas.toDataURL('image/png')

  // 创建弹窗元素
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    cursor: pointer;
  `

  // 创建图片元素
  const img = document.createElement('img')
  img.src = dataUrl
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
  `

  modal.appendChild(img)
  document.body.appendChild(modal)

  // 点击关闭弹窗
  modal.onclick = () => {
    document.body.removeChild(modal)
  }
}

// 处理输入
const handleInput = () => {
  // 确保换行符被保留
  topic.value = topic.value.replace(/\r\n/g, '\n')
  updatePreview()
}

// 加载字体
const loadFonts = () => {
  // 使用本地字体，无需加载外部资源
  console.log('使用本地字体')
}

// 文字样式预设
const textPresets = [
  {
    name: '标题样式',
    fontSize: 48,
    fontFamily: 'Noto Sans CJK SC',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center'
  },
  {
    name: '副标题样式',
    fontSize: 32,
    fontFamily: 'Noto Sans CJK SC',
    fontWeight: 'normal',
    color: '#ffffff',
    textAlign: 'center'
  },
  {
    name: '正文样式',
    fontSize: 24,
    fontFamily: 'Noto Serif CJK SC',
    fontWeight: 'normal',
    color: '#ffffff',
    textAlign: 'left'
  },
  {
    name: '装饰文字',
    fontSize: 36,
    fontFamily: 'Noto Serif CJK SC',
    fontWeight: 'bold',
    color: '#ffeb3b',
    textAlign: 'center'
  }
]

// 字体预设
const fontPresets = [
  {
    name: '默认样式',
    fontSize: 56,
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#000000',
    fontStrokeWidth: 0,
    fontWeight: 'bold'
  },
  {
    name: '小红书风格',
    fontSize: 72,  // 更大的字号
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#000000',
    fontStrokeWidth: 4,
    fontWeight: 'bold'
  },
  {
    name: '描边效果',
    fontSize: 48,  // 较小的字号
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#000000',
    fontStrokeWidth: 2,
    fontWeight: 'bold'
  },
  {
    name: '霓虹效果',
    fontSize: 64,  // 中等偏大的字号
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#ff00ff',
    fontStrokeWidth: 1,
    fontWeight: 'bold'
  },
  {
    name: '浮雕效果',
    fontSize: 52,  // 中等字号
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#000000',
    fontStrokeWidth: 1,
    fontWeight: 'bold'
  },
  {
    name: '大气标题',
    fontSize: 80,
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: 'rgba(0, 0, 0, 0.5)',
    fontStrokeWidth: 3,
    fontWeight: '900'
  },
  {
    name: '优雅艺术',
    fontSize: 60,
    fontFamily: 'Noto Serif CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#000000',
    fontStrokeWidth: 1,
    fontWeight: 'normal'
  },
  {
    name: '科技感',
    fontSize: 68,
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#00ffff',
    fontStrokeWidth: 2,
    fontWeight: 'bold'
  },
  {
    name: '复古风',
    fontSize: 56,
    fontFamily: 'Noto Serif CJK SC',
    fontColor: '#f5deb3',
    fontStrokeColor: '#8b4513',
    fontStrokeWidth: 2,
    fontWeight: 'bold'
  },
  {
    name: '童趣风',
    fontSize: 64,
    fontFamily: 'Noto Sans CJK SC',
    fontColor: '#ffffff',
    fontStrokeColor: '#ff69b4',
    fontStrokeWidth: 3,
    fontWeight: 'bold'
  }
]

// 应用字体预设
const applyFontPreset = (preset: typeof fontPresets[0]) => {
  fontSize.value = preset.fontSize
  fontFamily.value = preset.fontFamily
  fontColor.value = preset.fontColor
  fontStrokeColor.value = preset.fontStrokeColor
  fontStrokeWidth.value = preset.fontStrokeWidth
  fontWeight.value = preset.fontWeight
  updatePreview()
}

// 在组件挂载时初始化编辑器
onMounted(() => {
  loadFonts()
  updatePreview()
})

// 在组件卸载时销毁编辑器
onUnmounted(() => {
  if (canvasRef.value) {
    // 销毁编辑器相关资源
  }
})

// 监听相关变量变化
watch([
  topic,
  style,
  selectedLayout,
  selectedElements,
  fontSize,
  fontFamily,
  fontColor,
  fontStrokeColor,
  fontStrokeWidth,
  coverWidth,
  coverHeight,
  // 添加图片相关的监听
  imageOpacity,
  imageBlur,
  imageBrightness,
  imageContrast,
  imageSaturation,
  imageScale,
  imageRotation
], () => {
  updatePreview()
})

// 在script部分添加状态变量
const backgroundType = ref('gradient')
</script>

<style scoped>
.el-select-dropdown__item {
  height: auto !important;
  padding: 8px 12px !important;
}

.el-input-number {
  width: 100% !important;
}

.el-select {
  width: 100% !important;
}

.border-primary-500 {
  border-color: #3b82f6;
}

.bg-primary-50 {
  background-color: #eff6ff;
}

.hover\:border-primary-500:hover {
  border-color: #3b82f6;
}

.preview-container {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.el-button {
  box-shadow: none !important;
  border-radius: 8px !important;
}

.el-button:hover {
  transform: translateY(-1px);
  transition: all 0.2s;
}

.preview-button {
  @apply flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200;
}

.preview-button:hover {
  @apply transform -translate-y-0.5;
}
</style>
