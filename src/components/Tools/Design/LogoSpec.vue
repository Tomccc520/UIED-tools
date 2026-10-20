<!--
 * @file LogoSpec.vue
 * @description Logo设计规范生成器，帮助设计师生成专业的Logo使用规范说明书
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 -->

<template>
  <div class="min-h-screen logo-spec-tool">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 标题区域优化 -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold mb-4 text-gray-900">免费 Logo设计规范生成器</h1>
        <p class="text-base text-gray-500">快速生成专业的Logo使用规范说明书，帮助品牌建立统一的视觉形象</p>
      </div>

      <!-- 温馨提示优化 -->
      <div class="bg-brand-soft rounded-lg p-6 mb-12">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-medium text-gray-900 mb-2">使用说明</h3>
            <p class="text-gray-700">本工具提供专业的Logo设计规范生成功能，可用于：</p>
            <ul class="mt-2 space-y-1 text-sm text-brand list-disc list-inside">
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
            <svg class="w-6 h-6 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-brand transition-colors"
                @drop.prevent="handleDrop" @dragover.prevent @dragenter.prevent>
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label for="file-upload"
                      class="relative cursor-pointer rounded-md font-medium text-brand hover:text-brand-hover focus-within:outline-none">
                      <span>上传文件</span>
                      <input id="file-upload" type="file" class="sr-only" accept="image/*" @change="handleFileChange">
                    </label>
                    <p class="pl-1">或拖放文件</p>
                  </div>
                  <p class="text-xs text-gray-500">支持PNG、JPG、SVG格式，文件大小不超过10MB</p>
                </div>
              </div>
              <div v-if="previewUrl || readingLogo" class="mt-4">
                <p v-if="readingLogo" role="status" class="text-sm text-gray-500 text-center">正在读取 Logo，请稍候...</p>
                <img v-if="previewUrl" :src="previewUrl" class="max-h-40 mx-auto" alt="Logo预览">
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
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
                  placeholder="请输入品牌名称">
              </div>
              <div>
                <label for="logoType" class="block text-sm font-medium text-gray-700">Logo类型</label>
                <select id="logoType" v-model="logoType"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm">
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
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm"
                  placeholder="请简要描述品牌理念和定位"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- 颜色规范设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            颜色规范设置
          </h3>
          <div class="space-y-6">
            <div v-for="(color, index) in colors" :key="index" class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-full border" :style="{ backgroundColor: color.hex }" />
              <div class="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">HEX</label>
                  <input type="text" v-model="color.hex" @input="updateColor(index, color.hex)"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm">
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
            <svg class="w-6 h-6 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm">
                </div>
                <div>
                  <label class="block text-xs text-gray-500">数字媒体 (px)</label>
                  <input type="number" v-model="minSizeDigital"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用规范设置 -->
        <div class="bg-gray-50 rounded-xl p-8">
          <h3 class="text-xl font-semibold mb-6 text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            使用规范设置
          </h3>
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">使用场景</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label v-for="(scenario, key) in scenarios" :key="key" class="flex items-center">
                  <input type="checkbox" v-model="selectedScenarios" :value="key"
                    class="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded">
                  <span class="ml-2 text-sm text-gray-700">{{ scenario }}</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">禁用规则</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label v-for="(rule, key) in rules" :key="key" class="flex items-center">
                  <input type="checkbox" v-model="selectedRules" :value="key"
                    class="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded">
                  <span class="ml-2 text-sm text-gray-700">{{ rule }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮优化 -->
        <div class="logo-spec-actions flex flex-wrap justify-center gap-3 pt-4">
          <el-button type="primary" size="large" class="px-8 py-3 text-base" :disabled="exporting || readingLogo" @click="generateSpec">
            生成规范文档
          </el-button>
          <el-button size="large" class="px-8 py-3 text-base" :disabled="exporting" @click="resetForm">
            重置
          </el-button>
        </div>
      </div>

      <!-- 功能说明区域优化 -->
      <div class="mt-16 mb-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-xl border border-brand-border">
            <div class="flex items-start space-x-4">
              <div class="bg-brand-soft rounded-lg p-3">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">专业规范</h3>
                <p class="text-gray-600 leading-relaxed">生成专业的Logo使用规范说明书，确保品牌形象统一</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-brand-border">
            <div class="flex items-start space-x-4">
              <div class="bg-brand-soft rounded-lg p-3">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">完整参数</h3>
                <p class="text-gray-600 leading-relaxed">包含颜色、尺寸、安全区域等详细参数</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-xl border border-brand-border">
            <div class="flex items-start space-x-4">
              <div class="bg-brand-soft rounded-lg p-3">
                <svg class="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <el-dialog
      v-model="showPreview"
      title="Logo 使用规范预览"
      width="min(920px, calc(100vw - 24px))"
      top="5vh"
      class="logo-spec-preview-dialog"
      :close-on-click-modal="!exporting"
      :close-on-press-escape="!exporting"
      :show-close="!exporting"
    >
      <div class="logo-spec-preview-scroll" :aria-busy="exporting">
        <article ref="previewElement" class="preview-content" data-logo-spec-document>
          <header class="spec-document-heading">
            <p class="spec-document-eyebrow">品牌视觉使用指南</p>
            <h2>{{ brandName.trim() }} Logo 使用规范</h2>
            <p v-if="brandDesc" class="spec-brand-description">{{ brandDesc }}</p>
            <p class="spec-logo-type">Logo 类型：{{ logoTypes[logoType] }}</p>
          </header>

          <section class="spec-document-section">
            <h3>01 / 标准 Logo 与安全区域</h3>
            <div class="spec-logo-safe" :style="{ padding: `${Number(safeArea) / 2}%` }">
              <img :src="previewUrl" :alt="`${brandName.trim()} 标准 Logo`" class="spec-logo-image">
            </div>
            <p>安全区域：{{ safeArea }}%。使用时请在 Logo 周围保留相应留白，避免其他文字或图形干扰。</p>
          </section>

          <section class="spec-document-section">
            <h3>02 / 品牌颜色</h3>
            <div v-if="colors.length" class="spec-color-list">
              <div v-for="(color, index) in colors" :key="index" class="spec-color-card">
                <div class="spec-color-swatch" :style="{ backgroundColor: color.hex }" aria-hidden="true"></div>
                <dl>
                  <div><dt>HEX</dt><dd>{{ color.hex }}</dd></div>
                  <div><dt>RGB</dt><dd>{{ color.rgb }}</dd></div>
                  <div><dt>CMYK</dt><dd>{{ color.cmyk }}</dd></div>
                </dl>
              </div>
            </div>
            <p v-else>未指定品牌颜色。</p>
            <p class="spec-document-note">CMYK 为近似转换值；印刷前请结合材质和色彩配置进行打样确认。</p>
          </section>

          <section class="spec-document-section">
            <h3>03 / 最小使用尺寸</h3>
            <dl class="spec-size-list">
              <div><dt>印刷品</dt><dd>{{ minSizePrint }} mm</dd></div>
              <div><dt>数字媒体</dt><dd>{{ minSizeDigital }} px</dd></div>
            </dl>
            <p>请保持 Logo 原始比例，缩小时确保图形和文字仍清晰可辨。</p>
          </section>

          <section class="spec-document-section">
            <h3>04 / 适用场景</h3>
            <ul v-if="selectedScenarios.length"><li v-for="key in selectedScenarios" :key="key">{{ scenarios[key] }}</li></ul>
            <p v-else>未指定使用场景。</p>
          </section>

          <section class="spec-document-section">
            <h3>05 / 禁用规则</h3>
            <ul v-if="selectedRules.length"><li v-for="key in selectedRules" :key="key">{{ rules[key] }}</li></ul>
            <p v-else>未指定禁用规则。</p>
          </section>
        </article>
      </div>
      <template #footer>
        <div class="logo-spec-preview-footer">
          <span role="status">{{ exporting ? '正在生成 PDF，请稍候…' : '确认规范后，可下载 PDF 保存或分享。' }}</span>
          <div>
            <el-button :disabled="exporting" @click="showPreview = false">继续编辑</el-button>
            <el-button type="primary" :loading="exporting" :disabled="exporting" @click="downloadSpec">
              {{ exporting ? '正在导出' : '下载 PDF' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { useHead } from '@vueuse/head'
import { ElMessage } from 'element-plus'
import { ensureHtml2canvasRuntime, ensureJsPdfRuntime } from '@/utils/toolRuntimeLoaders'

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

// 基础信息
const brandName = ref('')
const logoType = ref('wordmark')
const brandDesc = ref('')
const previewUrl = ref('')
const logoFile = ref<File | null>(null)
const readingLogo = ref(false)
let logoReadVersion = 0
let activeLogoReader: FileReader | null = null
let disposed = false

/** 使旧读取结果失效并取消未完成的读取，供换图、清空和卸载统一使用。 */
const cancelLogoRead = () => {
  logoReadVersion += 1
  const reader = activeLogoReader
  activeLogoReader = null
  readingLogo.value = false
  if (reader) {
    reader.onload = null
    reader.onerror = null
    reader.onabort = null
    if (reader.readyState === 1) reader.abort()
  }
}

// 文件上传处理
/** 读取选择框中的首个 Logo 文件，清空输入以支持重新选择同一文件。 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) validateAndProcessFile(file)
}

/** 读取拖放的首个文件，交给相同的格式与大小校验。 */
const handleDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    validateAndProcessFile(file)
  }
}

/** 校验 Logo 类型和大小后读取本地预览，不上传用户文件。 */
const validateAndProcessFile = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']

  if (!allowedTypes.includes(file.type)) {
    ElMessage.warning('请上传 PNG、JPG 或 SVG 格式的文件')
    return
  }

  if (file.size > maxSize) {
    ElMessage.warning('文件大小不能超过 10MB')
    return
  }

  cancelLogoRead()
  showPreview.value = false
  logoFile.value = null
  previewUrl.value = ''
  readingLogo.value = true
  const version = logoReadVersion
  const reader = new FileReader()
  activeLogoReader = reader
  /** 仅接受当前页面最近一次选择的读取结果，忽略已取消或排队到达的事件。 */
  const isCurrentRead = () => !disposed && version === logoReadVersion && activeLogoReader === reader
  /** 完成读取后解除事件和忙碌状态，防止同一次读取重复提交结果。 */
  const finishRead = () => {
    activeLogoReader = null
    readingLogo.value = false
    reader.onload = null
    reader.onerror = null
    reader.onabort = null
  }
  /** 当前文件读取失败时清空待用状态并保留重新选择同一文件的入口。 */
  const failRead = () => {
    if (!isCurrentRead()) return
    finishRead()
    ElMessage.error('Logo 读取失败，请重新选择文件')
  }
  reader.onload = (e) => {
    if (!isCurrentRead()) return
    const result = e.target?.result
    if (typeof result !== 'string' || !result.startsWith('data:image/')) {
      failRead()
      return
    }
    finishRead()
    logoFile.value = file
    previewUrl.value = result
  }
  reader.onerror = failRead
  reader.onabort = failRead
  try {
    reader.readAsDataURL(file)
  } catch {
    failRead()
  }
}

/** 移除当前 Logo 并清空选择框。 */
const removeLogo = () => {
  cancelLogoRead()
  showPreview.value = false
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

/** 增加一个可编辑的品牌颜色，默认保留黑色作品色值。 */
const addColor = () => {
  colors.push({ hex: '#000000', rgb: '0, 0, 0', cmyk: '0, 0, 0, 100' })
}

/** 按索引移除不需要的品牌颜色。 */
const removeColor = (index: number) => {
  colors.splice(index, 1)
}

/** 将六位 HEX 色值转换为 RGB 分量，非法输入返回空值。 */
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/** 将 RGB 转换为近似 CMYK 百分比供规范参考。 */
const rgbToCmyk = (r: number, g: number, b: number) => {
  let c = 1 - (r / 255)
  let m = 1 - (g / 255)
  let y = 1 - (b / 255)
  let k = Math.min(c, m, y)

  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

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

/** 同步合法 HEX 色值对应的 RGB 和 CMYK 文案。 */
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
const exporting = ref(false)
const previewElement = ref<HTMLElement | null>(null)
const logoTypes: Record<string, string> = {
  wordmark: '文字标志', pictorial: '图形标志', abstract: '抽象标志', mascot: '吉祥物标志', combination: '组合标志'
}

/** 生成前校验必要信息与颜色、尺寸参数，通过后打开可下载的规范预览。 */
const generateSpec = () => {
  if (readingLogo.value) {
    ElMessage.warning('Logo 尚未读取完成，请稍后重试')
    return
  }
  if (!logoFile.value || !brandName.value.trim()) {
    ElMessage.warning('请上传 Logo 并填写品牌名称')
    return
  }
  if (!previewUrl.value) {
    ElMessage.warning('Logo 尚未读取完成，请稍后重试')
    return
  }
  if (colors.some(color => !hexToRgb(color.hex))) {
    ElMessage.warning('请填写有效的六位 HEX 颜色，例如 #6C54FF')
    return
  }
  if (![Number(minSizePrint.value), Number(minSizeDigital.value)].every(value => Number.isFinite(value) && value > 0)) {
    ElMessage.warning('最小尺寸必须为大于 0 的数字')
    return
  }
  showPreview.value = true
}

/** 确认预览中的 Logo 已解码，避免导出没有 Logo 的空白规范。 */
const ensurePreviewLogo = async (element: HTMLElement) => {
  const image = element.querySelector('img')
  if (!image) throw new Error('规范缺少 Logo')
  if (image.decode) await image.decode()
  else if (!image.complete || !image.naturalWidth) throw new Error('Logo 尚未加载完成')
}

/** 按需加载导出运行时，将完整规范分页保存为 PDF；失败保留预览并允许重试。 */
const downloadSpec = async () => {
  if (exporting.value) return
  const element = previewElement.value
  if (!showPreview.value || !element) {
    ElMessage.error('预览内容不存在，请重新生成')
    return
  }
  const filename = `${brandName.value.trim().replace(/[\\/:*?"<>|]/g, '_')}_logo规范.pdf`
  exporting.value = true
  try {
    await ensurePreviewLogo(element)
    const [{ html2canvas }, { jsPDF }] = await Promise.all([
      ensureHtml2canvasRuntime(),
      ensureJsPdfRuntime()
    ])

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      // 导出时恢复文档完整宽高，不把手机预览的滚动容器截进 PDF。
      onclone: (_document, clonedElement) => {
        clonedElement.style.width = '760px'
        clonedElement.style.maxWidth = 'none'
        let parent = clonedElement.parentElement
        while (parent && !parent.classList.contains('el-dialog')) {
          parent.style.overflow = 'visible'
          parent.style.maxHeight = 'none'
          parent = parent.parentElement
        }
      }
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    })

    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    const pageHeight = pdf.internal.pageSize.getHeight()
    let position = 0
    let heightLeft = pdfHeight

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
    }
    await pdf.save(filename, { returnPromise: true })
    ElMessage.success('Logo 规范 PDF 已下载')
  } catch (error) {
    console.error('生成PDF时出错:', error)
    ElMessage.error('生成 PDF 时出错，请重试')
  } finally {
    exporting.value = false
  }
}

/** 恢复默认规范参数并关闭预览，导出过程中不清空正在生成的文档。 */
const resetForm = () => {
  if (exporting.value) return
  cancelLogoRead()
  showPreview.value = false
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
  colors.splice(0, colors.length, { hex: '#000000', rgb: '0, 0, 0', cmyk: '0, 0, 0, 100' })
}

/** 页面离开后取消本地读取，禁止迟到的文件事件恢复已卸载的界面。 */
onBeforeUnmount(() => {
  disposed = true
  cancelLogoRead()
})
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
  background-color: #fff;
}
.logo-spec-tool { min-width: 0; overflow-wrap: anywhere; }
.logo-spec-tool input, .logo-spec-tool select, .logo-spec-tool textarea { min-width: 0; max-width: 100%; }
.logo-spec-tool input[type='checkbox'], .logo-spec-tool input[type='range'] { accent-color: var(--uied-color-primary); }
.logo-spec-actions :deep(.el-button + .el-button) { margin-left: 0; }
.logo-spec-preview-scroll { max-height: min(65vh, calc(100dvh - 220px)); overflow: auto; overscroll-behavior: contain; border: 1px solid var(--uied-color-border); border-radius: var(--uied-radius-sm); }
.preview-content { box-sizing: border-box; width: 100%; max-width: 760px; margin: 0 auto; padding: 36px; color: #172033; background: #fff; overflow-wrap: anywhere; font-size: 14px; line-height: 1.7; }
.spec-document-heading { padding-bottom: 24px; border-bottom: 2px solid #172033; }
.spec-document-eyebrow { margin: 0 0 8px; color: #64748b; font-size: 12px; }
.spec-document-heading h2 { margin: 0; font-size: 28px; line-height: 1.4; font-weight: 700; }
.spec-brand-description { margin: 12px 0 0; white-space: pre-wrap; }
.spec-logo-type { margin: 8px 0 0; color: #64748b; }
.spec-document-section { margin-top: 28px; }
.spec-document-section h3 { margin: 0 0 14px; font-size: 17px; font-weight: 700; }
.spec-document-section p { margin: 12px 0 0; }
.spec-logo-safe { min-height: 140px; display: flex; align-items: center; justify-content: center; border: 1px dashed #94a3b8; background: #f8fafc; }
.spec-logo-image { display: block; max-width: 100%; max-height: 180px; object-fit: contain; }
.spec-color-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.spec-color-card { min-width: 0; border: 1px solid #e2e8f0; }
.spec-color-swatch { height: 56px; border-bottom: 1px solid #e2e8f0; }
.spec-color-card dl { margin: 0; padding: 12px; }
.spec-color-card dl > div { display: flex; flex-wrap: wrap; gap: 4px 10px; }
.spec-color-card dt { min-width: 44px; color: #64748b; }
.spec-color-card dd { margin: 0; }
.spec-document-note { color: #64748b; font-size: 12px; }
.spec-size-list { display: flex; flex-wrap: wrap; gap: 16px 48px; margin: 0; padding: 16px; background: #f8fafc; }
.spec-size-list dt { color: #64748b; }
.spec-size-list dd { margin: 4px 0 0; font-size: 18px; font-weight: 600; }
.spec-document-section ul { margin: 0; padding-left: 20px; list-style: disc; }
.logo-spec-preview-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; }
.logo-spec-preview-footer > span { color: var(--uied-color-text-secondary); font-size: 12px; }
.logo-spec-preview-footer > div { display: flex; flex-shrink: 0; gap: 8px; }
.logo-spec-preview-footer :deep(.el-button + .el-button) { margin-left: 0; }
@media (max-width: 640px) {
  .logo-spec-tool > .max-w-7xl { padding: 20px 12px; }
  .logo-spec-tool .p-8 { padding: 20px 16px; }
  .logo-spec-tool .mb-12 { margin-bottom: 28px; }
  .logo-spec-tool .space-y-12 > :not([hidden]) ~ :not([hidden]) { margin-top: 28px; }
  .logo-spec-tool label:has(input[type='checkbox']) { min-height: 44px; }
  .preview-content { padding: 20px 16px; }
  .spec-document-heading h2 { font-size: 22px; }
  .spec-color-list { grid-template-columns: minmax(0, 1fr); }
  .logo-spec-preview-footer { flex-direction: column; align-items: stretch; }
  .logo-spec-preview-footer > div { justify-content: flex-end; }
}
</style>
