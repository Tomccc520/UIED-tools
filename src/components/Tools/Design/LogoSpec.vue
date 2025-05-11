<!--
 * @file LogoSpec.vue
 * @description Logo设计规范生成器，帮助设计师生成专业的Logo使用规范说明书
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 -->

<template>
  <div class="min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 开发提示 -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">功能开发中</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Logo设计规范生成器正在开发中，即将为您提供以下功能：</p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>Logo文件上传与预览</li>
                <li>品牌基础信息设置</li>
                <li>Logo颜色规范定义</li>
                <li>尺寸与安全区域设置</li>
                <li>使用场景与规范说明</li>
                <li>一键生成PDF规范文档</li>
              </ul>
              <p class="mt-2">我们正在努力完善这些功能，敬请期待！</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 标题区域优化 -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4 text-gray-900">Logo设计规范生成器</h2>
        <p class="text-base text-gray-500">快速生成专业的Logo使用规范说明书，帮助品牌建立统一的视觉形象</p>
      </div>

      <!-- 温馨提示优化 -->
      <div class="bg-blue-50 rounded-lg p-6 mb-12">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-blue-900 mb-2">使用说明</h3>
            <p class="text-blue-700">本工具提供专业的Logo设计规范生成功能，可用于：</p>
            <ul class="mt-2 space-y-1 text-sm text-blue-600 list-disc list-inside">
              <li>品牌设计规范制定</li>
              <li>VI设计系统建立</li>
              <li>品牌视觉统一管理</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Logo规范生成区域优化 -->
      <div class="space-y-12">
        <!-- 基础信息设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            基础信息设置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Logo上传部分 -->
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700 mb-2">Logo文件</label>
              <div
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors"
                @drop.prevent="handleDrop" @dragover.prevent @dragenter.prevent>
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload"
                      class="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>上传文件</span>
                      <input id="file-upload" type="file" class="sr-only" accept="image/*" @change="handleFileChange">
                    </label>
                    <p class="pl-1">或拖放文件</p>
                  </div>
                  <p class="text-xs text-gray-500">支持PNG、JPG、SVG格式，文件大小不超过10MB</p>
                </div>
              </div>
              <div v-if="previewUrl" class="mt-4">
                <img :src="previewUrl" class="max-h-40 mx-auto" alt="Logo预览">
                <button @click="removeLogo"
                  class="mt-2 w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 focus:outline-none">
                  移除Logo
                </button>
              </div>
            </div>
            <!-- 品牌信息部分 -->
            <div class="form-group space-y-4">
              <div>
                <label for="brandName" class="block text-sm font-medium text-gray-700">品牌名称</label>
                <input type="text" id="brandName" v-model="brandName"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="请输入品牌名称">
              </div>
              <div>
                <label for="logoType" class="block text-sm font-medium text-gray-700">Logo类型</label>
                <select id="logoType" v-model="logoType"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                  <option value="wordmark">文字标志</option>
                  <option value="pictorial">图形标志</option>
                  <option value="abstract">抽象标志</option>
                  <option value="mascot">吉祥物标志</option>
                  <option value="combination">组合标志</option>
                </select>
              </div>
              <div>
                <label for="brandDesc" class="block text-sm font-medium text-gray-700">品牌描述</label>
                <textarea id="brandDesc" v-model="brandDesc" rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="请简要描述品牌理念和定位"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 颜色规范设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            颜色规范设置
          </h3>
          <div class="space-y-6">
            <div v-for="(color, index) in colors" :key="index" class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full border" :style="{ backgroundColor: color.hex }" />
              <div class="flex-1 grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">HEX</label>
                  <input type="text" v-model="color.hex" @input="updateColor(index, color.hex)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">RGB</label>
                  <input type="text" :value="color.rgb" readonly
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">CMYK</label>
                  <input type="text" :value="color.cmyk" readonly
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm">
                </div>
                <div class="flex items-end">
                  <button @click="removeColor(index)" class="text-red-600 hover:text-red-700">删除</button>
                </div>
              </div>
            </div>
            <button @click="addColor"
              class="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              添加颜色
            </button>
          </div>
        </div>

        <!-- 尺寸规范设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            尺寸规范设置
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">安全区域</label>
              <div class="mt-2">
                <input type="range" v-model="safeArea" min="0" max="100" step="5" class="w-full">
                <div class="text-sm text-gray-500 mt-1">安全区域: {{ safeArea }}%</div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">最小尺寸</label>
              <div class="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label class="block text-xs text-gray-500">印刷品 (mm)</label>
                  <input type="number" v-model="minSizePrint"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-xs text-gray-500">数字媒体 (px)</label>
                  <input type="number" v-model="minSizeDigital"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用规范设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            使用规范设置
          </h3>
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">使用场景</label>
              <div class="grid grid-cols-2 gap-4">
                <label v-for="(scenario, key) in scenarios" :key="key" class="flex items-center">
                  <input type="checkbox" v-model="selectedScenarios" :value="key"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <span class="ml-2 text-sm text-gray-700">{{ scenario }}</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">禁用规则</label>
              <div class="grid grid-cols-2 gap-4">
                <label v-for="(rule, key) in rules" :key="key" class="flex items-center">
                  <input type="checkbox" v-model="selectedRules" :value="key"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                  <span class="ml-2 text-sm text-gray-700">{{ rule }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮优化 -->
        <div class="flex justify-center space-x-6 pt-4">
          <el-button type="primary" size="large" class="px-8 py-3 text-base" @click="generateSpec">
            生成规范文档
          </el-button>
          <el-button size="large" class="px-8 py-3 text-base" @click="resetForm">
            重置
          </el-button>
        </div>
      </div>

      <!-- 功能说明区域优化 -->
      <div class="mt-16 mb-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
            <div class="flex items-start space-x-4">
              <div class="bg-blue-100 rounded-lg p-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">专业规范</h3>
                <p class="text-gray-600 leading-relaxed">生成专业的Logo使用规范说明书，确保品牌形象统一</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
            <div class="flex items-start space-x-4">
              <div class="bg-blue-100 rounded-lg p-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">完整参数</h3>
                <p class="text-gray-600 leading-relaxed">包含颜色、尺寸、安全区域等详细参数</p>
              </div>
            </div>
          </div>
          <div class="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
            <div class="flex items-start space-x-4">
              <div class="bg-blue-100 rounded-lg p-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">便于使用</h3>
                <p class="text-gray-600 leading-relaxed">简单直观的操作界面，快速生成规范</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const route = useRoute()

// SEO 配置
useHead({
  title: 'Logo设计规范生成器 - 在线生成Logo使用规范说明书',
  meta: [
    {
      name: 'description',
      content: '在线生成专业的Logo设计规范说明书，包含使用场景和注意事项，帮助品牌建立统一的视觉形象。提供Logo颜色规范、尺寸规范、安全区域等专业参数设置。'
    },
    {
      name: 'keywords',
      content: 'Logo设计规范,品牌Logo规范,Logo使用指南,Logo设计指南,Logo规范生成器,品牌视觉规范'
    },
    // Open Graph 标签
    {
      property: 'og:title',
      content: 'Logo设计规范生成器 - 在线生成Logo使用规范说明书'
    },
    {
      property: 'og:description',
      content: '在线生成专业的Logo设计规范说明书，包含使用场景和注意事项，帮助品牌建立统一的视觉形象。'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://www.uiedtool.com/tools/design/logo-spec'
    }
  ]
})

interface Step {
  id: number
  title: string
  icon: string
}

interface Color {
  hex: string
  rgb: string
  cmyk: string
}

interface Scenarios {
  [key: string]: string
}

interface Rules {
  [key: string]: string
}

// 步骤配置
const currentStep = ref(1)
const steps: Step[] = [
  {
    id: 1,
    title: '基础信息',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
  },
  {
    id: 2,
    title: '颜色规范',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
  },
  {
    id: 3,
    title: '尺寸规范',
    icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
  },
  {
    id: 4,
    title: '使用规范',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
  }
]

// 基础信息
const brandName = ref('')
const logoType = ref('wordmark')
const brandDesc = ref('')
const previewUrl = ref('')
const logoFile = ref<File | null>(null)

// 文件上传处理
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    validateAndProcessFile(input.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

const validateAndProcessFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']

  if (!allowedTypes.includes(file.type)) {
    alert('请上传PNG、JPG或SVG格式的文件')
    return
  }

  if (file.size > maxSize) {
    alert('文件大小不超过10MB')
    return
  }

  logoFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeLogo = () => {
  logoFile.value = null
  previewUrl.value = ''
  const input = document.getElementById('file-upload') as HTMLInputElement
  if (input) {
    input.value = ''
  }
}

// 颜色规范
const colors = reactive<Color[]>([
  { hex: '#000000', rgb: '0, 0, 0', cmyk: '0, 0, 0, 100' }
])

const addColor = () => {
  colors.push({ hex: '#000000', rgb: '0, 0, 0', cmyk: '0, 0, 0, 100' })
}

const removeColor = (index: number) => {
  colors.splice(index, 1)
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToCmyk = (r: number, g: number, b: number) => {
  let c = 1 - (r / 255)
  let m = 1 - (g / 255)
  let y = 1 - (b / 255)
  let k = Math.min(c, m, y)

  c = (c - k) / (1 - k)
  m = (m - k) / (1 - k)
  y = (y - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  }
}

const updateColor = (index: number, hex: string) => {
  const rgb = hexToRgb(hex)
  if (rgb) {
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b)
    colors[index].rgb = `${rgb.r}, ${rgb.g}, ${rgb.b}`
    colors[index].cmyk = `${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`
  }
}

watch(colors, () => {
  colors.forEach((color, index) => {
    updateColor(index, color.hex)
  })
})

// 尺寸规范
const safeArea = ref(20)
const minSizePrint = ref(20)
const minSizeDigital = ref(60)

// 使用规范
const scenarios: Scenarios = {
  print: '印刷品',
  digital: '数字媒体',
  signage: '标识系统',
  promotional: '推广物料'
}

const rules: Rules = {
  deform: '禁止变形',
  recolor: '禁止改色',
  rotate: '禁止旋转',
  effect: '禁止特效'
}

const selectedScenarios = ref<string[]>([])
const selectedRules = ref<string[]>([])

// 预览和下载
const showPreview = ref(false)

const generateSpec = async () => {
  if (!logoFile.value || !brandName.value) {
    alert('请上传Logo并填写品牌名称')
    return
  }
  showPreview.value = true
}

const downloadSpec = async () => {
  try {
    const element = document.querySelector('.preview-content') as HTMLElement
    if (!element) {
      alert('预览内容不存在')
      return
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${brandName.value}_logo规范.pdf`)
  } catch (error) {
    console.error('生成PDF时出错:', error)
    alert('生成PDF时出错，请重试')
  }
}

const resetForm = () => {
  // 重置表单
  brandName.value = ''
  logoType.value = 'wordmark'
  brandDesc.value = ''
  previewUrl.value = ''
  logoFile.value = null
  safeArea.value = 20
  minSizePrint.value = 20
  minSizeDigital.value = 60
  selectedScenarios.value = []
  selectedRules.value = []
  colors.forEach((color, index) => {
    color.hex = '#000000'
    color.rgb = '0, 0, 0'
    color.cmyk = '0, 0, 0, 100'
  })
}
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
  background-color: #fff;
}
</style>
