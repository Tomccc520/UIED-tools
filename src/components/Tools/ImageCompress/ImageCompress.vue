<!--
 * @file ImageCompress.vue
 * @description 图片压缩工具组件，支持JPG、PNG、WebP格式的图片压缩
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-22
 *
 * 功能特性：
 * 1. 支持拖拽和点击上传图片
 * 2. 支持批量压缩和打包下载
 * 3. 支持压缩质量调节
 * 4. 支持JPG、PNG、WebP格式
 * 5. 本地压缩，无需上传服务器
 *
 * 主要组件：
 * - 文件上传区域
 * - 压缩质量控制
 * - 文件列表展示
 * - 压缩效果示例
 * - 常见问题解答
 -->

<template>
  <div class="image-compress-page" :class="{ 'image-compress-page--has-files': fileList.length }">
    <StandardToolPageTemplate
      compact
      title="免费在线图片压缩工具"
      description="支持 JPG、PNG、WebP 批量压缩，自定义质量与尺寸，本地处理保护图片隐私。"
    >
      <template #meta>
        <span class="image-meta image-meta--local">浏览器本地处理，不上传图片</span>
        <span class="image-meta">最多 {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 张 · 单张 {{ IMAGE_COMPRESS_MAX_FILE_SIZE_MB }}MB</span>
      </template>

      <div class="image-workflow">
        <div
          class="image-upload"
          :class="{ 'image-upload--dragging': isDragging, 'image-upload--busy': isBusy, 'image-upload--filled': fileList.length }"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = !isBusy"
          @dragleave.prevent="isDragging = false"
        >
          <input ref="fileInputRef" type="file" multiple accept="image/jpeg,image/png,image/webp" class="hidden"
            :disabled="isBusy" @change="handleFileInputChange" />
          <button v-if="!fileList.length" type="button" class="image-upload__trigger" aria-label="选择图片" :disabled="isBusy" @click="triggerFileInput">
            <span class="image-upload__badge">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M12 16V4m-4 4 4-4 4 4M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <strong class="image-upload__desktop-copy">点击或拖拽图片到这里</strong>
            <strong class="image-upload__mobile-copy">点击选择图片</strong>
            <span>支持 {{ IMAGE_COMPRESS_SUPPORTED_FORMATS }}，最多 {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 张，单张 {{ IMAGE_COMPRESS_MAX_FILE_SIZE_MB }}MB</span>
            <span class="image-upload__privacy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4" /></svg>所有图片均在本地处理，不上传服务器</span>
            <span class="image-upload__select">选择图片 · 支持多选</span>
          </button>
          <template v-else>
            <div class="image-upload__copy">
              <h2>已选择 {{ fileList.length }} / {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 张图片</h2>
              <p>{{ fileList.length >= IMAGE_COMPRESS_MAX_FILE_COUNT ? '已达到批量上限，需要添加时请先移除图片。' : '可以继续多选添加，完成后统一打包下载。' }}</p>
            </div>
            <div class="image-toolbar-actions">
              <button type="button" class="image-action" :disabled="isBusy" @click="triggerFileInput">添加图片</button>
              <button type="button" data-smoke="image-compress-start" class="image-action" :class="{ 'image-action--primary': fileList.length && !compressedCount }"
              :disabled="isBusy || !fileList.length" @click="compressedCount ? recompress() : compressAll()">
              {{ isCompressing ? '压缩中…' : compressedCount ? '重新压缩' : '开始压缩' }}
            </button>
            </div>
          </template>
        </div>

        <div v-if="fileList.length" class="image-editor">
        <section class="image-settings" :class="{ 'image-settings--expanded': mobileSettingsExpanded }" aria-labelledby="image-settings-title">
          <h2 id="image-settings-title" class="image-settings__title">
            <span class="image-settings__desktop-title">压缩参数设置</span>
            <button type="button" class="image-settings__toggle" :aria-expanded="mobileSettingsExpanded" aria-controls="image-settings-controls" @click="mobileSettingsExpanded = !mobileSettingsExpanded">
              <span>压缩参数设置</span>
              <span class="image-settings__toggle-label">{{ mobileSettingsExpanded ? '收起' : '展开' }}<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
            </button>
          </h2>
          <p class="image-settings__mobile-summary"><span>JPG / WebP：{{ quality }}%</span><span>{{ preserveDimensions ? '保持原尺寸' : '最长边 4096px' }} · PNG {{ pngMode === 'lossless' ? '无损' : `${pngColors} 色减色` }}</span></p>
          <div id="image-settings-controls" class="image-settings__body">
          <div class="image-settings__control">
            <div class="image-settings__label">
              <h3 id="image-quality-label">JPG / WebP 质量</h3>
              <output aria-live="polite">{{ quality }}%</output>
            </div>
            <el-slider v-model="quality" :min="1" :max="100" :step="1" :disabled="isBusy" aria-label="压缩质量" />
            <p class="image-hint">质量越高越清晰，体积取决于原图。</p>
            <label class="image-option image-option--dimensions">
              <input v-model="preserveDimensions" type="checkbox" :disabled="isBusy" />
              <span>保持原尺寸</span>
            </label>
            <p class="image-hint">{{ preserveDimensions ? 'JPG / WebP 不主动缩小像素尺寸。' : 'JPG / WebP 最长边缩小至 4096 像素，不放大小图。' }}</p>
          </div>
          <fieldset class="image-png-options" :disabled="isBusy">
            <legend>PNG 压缩方式</legend>
            <div class="image-png-options__choices">
              <label class="image-option"><input v-model="pngMode" type="radio" name="png-mode" value="lossless" /><span>无损压缩</span></label>
              <label class="image-option"><input v-model="pngMode" type="radio" name="png-mode" value="quantized" /><span>减色压缩</span></label>
              <label v-if="pngMode === 'quantized'" class="image-color-limit">颜色上限
                <select v-model.number="pngColors" aria-label="PNG 颜色上限"><option :value="256">256 色</option><option :value="128">128 色</option><option :value="64">64 色</option><option :value="32">32 色</option></select>
              </label>
            </div>
            <p class="image-hint">{{ pngMode === 'lossless' ? '默认保留每个像素及透明度，体积可能变化不大。' : '减少颜色以缩小体积，可能改变颜色及半透明细节，请下载后检查。' }} PNG 始终保持原尺寸。</p>
          </fieldset>
          <p class="image-hint image-settings__note">修改设置后需重新压缩。PNG 在后台线程处理；大图耗时取决于像素数量和设备。</p>
          </div>
        </section>

        <div class="image-output">
          <section v-if="activePreviewFile" ref="previewSection" class="image-preview" aria-labelledby="image-preview-title">
            <div class="image-preview__heading"><h2 id="image-preview-title">效果预览</h2><span :title="activePreviewFile.name">{{ activePreviewFile.name }}</span></div>
            <div class="image-preview__mobile-tabs" role="group" aria-label="预览对比">
              <button type="button" :aria-pressed="mobilePreviewSide === 'original'" @click="mobilePreviewSide = 'original'">原图</button>
              <button type="button" :aria-pressed="mobilePreviewSide === 'compressed'" :disabled="!activePreviewFile.compressedUrl || isBusy" @click="mobilePreviewSide = 'compressed'">压缩后</button>
            </div>
            <div class="image-preview__grid" :class="`image-preview__grid--${mobilePreviewSide}`">
              <figure class="image-preview__original">
                <figcaption><h3>原始图片</h3><span>{{ formatFileSize(activePreviewFile.size) }}</span></figcaption>
                <div class="image-preview__canvas"><el-image :src="activePreviewFile.previewUrl" :alt="`原图 ${activePreviewFile.name}`" :preview-src-list="[activePreviewFile.previewUrl]" preview-teleported fit="contain" /></div>
              </figure>
              <figure class="image-preview__compressed">
                <figcaption><h3>压缩预览</h3><span>{{ activePreviewFile.compressedBlob ? formatFileSize(activePreviewFile.compressedSize || 0) : '处理后显示' }}</span></figcaption>
                <div class="image-preview__canvas">
                  <el-image v-if="activePreviewFile.compressedUrl && !isBusy" :src="activePreviewFile.compressedUrl" :alt="`压缩后 ${activePreviewFile.name}`" :preview-src-list="[activePreviewFile.compressedUrl]" preview-teleported fit="contain" />
                  <p v-else class="image-preview__placeholder">{{ isBusy ? '正在处理图片，请稍候…' : activePreviewFile.error ? '这张图片处理失败，可在下方重试' : '点击开始压缩，查看处理效果' }}</p>
                </div>
              </figure>
            </div>
            <p class="image-hint">点击列表中的图片名称切换预览，点击预览图可放大查看。</p>
          </section>

        <div v-if="isBusy" class="image-batch-progress" data-smoke="image-compress-progress" role="status" aria-live="polite" aria-atomic="true">
          <template v-if="isCompressing">
            <div class="image-batch-progress__label">
              <strong>批量压缩中</strong>
              <span>已处理 {{ batchProgress.completed }} / {{ batchProgress.total }} 张</span>
            </div>
            <progress :value="batchProgress.completed" :max="batchProgress.total || 1" aria-label="批量压缩进度"></progress>
            <p v-if="processingIndex >= 0">正在处理：{{ fileList[processingIndex]?.name }}</p>
          </template>
          <template v-else>
            <div class="image-batch-progress__label">
              <strong>正在打包 {{ compressedCount }} 张图片</strong>
              <span>{{ Math.floor(packagingProgress) }}%</span>
            </div>
            <progress :value="packagingProgress" max="100" aria-label="打包进度"></progress>
            <p>请稍候，完成后会自动开始下载。</p>
          </template>
        </div>

        <section v-if="fileList.length" class="image-results" aria-labelledby="image-results-title" :aria-busy="isBusy">
          <div class="image-results__heading">
            <h2 id="image-results-title">图片列表 <span>{{ fileList.length }}</span></h2>
            <div class="image-results__actions">
              <button v-if="failedCount" type="button" class="image-text-action image-text-action--retry" :disabled="isBusy"
                data-smoke="image-compress-retry" :aria-label="`重新压缩 ${failedCount} 张失败图片`" @click="retryFailed">重试压缩 ({{ failedCount }})</button>
              <button type="button" class="image-text-action" :disabled="isBusy" @click="clearFiles">清空文件列表</button>
            </div>
          </div>
          <div class="image-results__status" role="status" aria-live="polite" aria-atomic="true">
            <span>已完成: {{ compressedCount }}</span>
            <span v-if="pendingCount">待处理: {{ pendingCount }}</span>
            <span v-if="failedCount" class="image-error">失败: {{ failedCount }}，可单独重试，成功结果会保留</span>
          </div>
          <div class="image-files__columns" aria-hidden="true">
            <span>图片名称</span><span>原图 → 压缩后</span><span>操作</span>
          </div>
          <div class="image-files" role="region" aria-label="待压缩图片与结果列表" tabindex="0">
            <div v-for="(file, index) in fileList" :key="file.previewUrl" class="image-file" data-smoke="image-compress-file">
              <el-image v-if="file.previewUrl" class="image-file__preview" :src="file.previewUrl"
                :preview-src-list="[file.previewUrl]" :alt="file.name" preview-teleported fit="cover" hide-on-click-modal />
              <div class="image-file__info">
                <button type="button" class="image-file__name" :title="file.name" :aria-label="`预览 ${file.name}`" :aria-pressed="activePreviewFile === file" @click="selectPreview(file)">{{ file.name }}</button>
                <div class="image-file__sizes">
                  <span>{{ formatFileSize(file.size) }}</span>
                  <template v-if="file.compressedBlob">
                    <span aria-hidden="true">→</span>
                    <strong>{{ formatFileSize(file.compressedSize || 0) }}</strong>
                    <span v-if="file.compressionRatio && file.compressionRatio > 0" class="image-saving">减小 {{ Math.min(file.compressionRatio, 99.9).toFixed(1) }}%</span>
                    <span v-else-if="file.keptOriginal">保留原图</span>
                    <span v-else>已按设置重新编码</span>
                  </template>
                  <span v-else-if="!file.error">{{ processingIndex === index ? '正在压缩…' : '等待压缩' }}</span>
                </div>
                <p v-if="file.error" class="image-file__error" role="alert">{{ file.error }}</p>
              </div>
              <div class="image-file__actions">
                <a v-if="file.compressedUrl && !isBusy" :href="file.compressedUrl" :download="downloadNames[index]"
                  :aria-label="`下载 ${file.name}`" class="image-file__download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5" stroke-linecap="round" stroke-linejoin="round" /></svg>
                  下载
                </a>
                <button type="button" :aria-label="`移除 ${file.name}`" :disabled="isBusy" class="image-remove" @click="removeFile(index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" stroke-linecap="round" /></svg>
                  <span class="image-remove__label">移除</span>
                </button>
              </div>
            </div>
          </div>
          <Teleport to="body" :disabled="!isMobileViewport">
          <div class="image-results__footer" :class="{ 'image-results__footer--docked': isMobileViewport }" role="region" aria-label="批量下载操作">
            <div class="image-summary" data-smoke="image-compress-summary">
              <template v-if="compressedCount">
                <strong>共节省 {{ formatFileSize(compressionSummary.saved) }}</strong>
                <span class="image-summary__sizes">已完成图片 {{ formatFileSize(compressionSummary.original) }} → {{ formatFileSize(compressionSummary.result) }}</span>
              </template>
              <strong v-else>已选择 {{ fileList.length }} 张图片</strong>
              <span v-if="isCompressing">正在处理 {{ batchProgress.completed }} / {{ batchProgress.total }} 张</span>
              <span v-else-if="isPackaging">正在打包 {{ Math.floor(packagingProgress) }}%</span>
              <span v-else-if="pendingCount && compressedCount">打包时会先处理剩余图片。</span>
              <span v-else-if="pendingCount">{{ pendingCount }} 张待处理，下载前自动压缩</span>
              <span v-else-if="failedCount" class="image-error">{{ failedCount }} 张失败，仅下载成功图片</span>
            </div>
            <button type="button" data-smoke="image-compress-download" class="image-action image-action--primary" :disabled="isBusy" @click="downloadAll">
              {{ isPackaging ? '打包中…' : isCompressing ? '压缩中…' : pendingCount || !compressedCount ? '压缩并下载' : '打包下载' }}
            </button>
          </div>
          </Teleport>
        </section>
        </div>
        </div>
      </div>

      <template #support>
        <details class="image-help" :open="!isMobileViewport" aria-labelledby="image-help-title">
          <summary class="image-help__heading">
            <div>
              <h2 id="image-help-title">使用指南与常见问题</h2>
              <p>三个步骤，完成图片压缩与下载。</p>
            </div>
            <span class="image-help__local">图片本地处理</span>
            <svg class="image-help__toggle-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </summary>
          <ol class="image-help__steps" aria-label="图片压缩操作步骤">
            <li>
              <span class="image-help__number" aria-hidden="true">1</span>
              <div><h3>添加图片</h3><p>一次多选或分批添加，最多 {{ IMAGE_COMPRESS_MAX_FILE_COUNT }} 张，单张不超过 {{ IMAGE_COMPRESS_MAX_FILE_SIZE_MB }}MB。</p></div>
            </li>
            <li>
              <span class="image-help__number" aria-hidden="true">2</span>
              <div><h3>调整参数</h3><p>JPG / WebP 可调质量与尺寸；PNG 默认无损，按需选择减色压缩。</p></div>
            </li>
            <li>
              <span class="image-help__number" aria-hidden="true">3</span>
              <div><h3>预览并下载</h3><p>检查画质与体积，单张下载或统一打包。失败图片可单独重试。</p></div>
            </li>
          </ol>
          <div class="image-help__questions" aria-labelledby="image-faq-title">
            <h3 id="image-faq-title">常见问题</h3>
            <details class="image-help__item" open>
              <summary>
                <span class="image-help__question">为什么压缩后体积没有变小？</span>
                <svg class="image-help__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </summary>
              <p>原图可能已优化，或当前质量设置较高。未要求缩小尺寸且结果更大时，会保留原图；要求缩小时则保留实际缩小的结果。JPG / WebP 的 100% 质量不代表无损。</p>
            </details>
            <details v-for="item in faq" :key="item.q" class="image-help__item">
              <summary>
                <span class="image-help__question">{{ item.q }}</span>
                <svg class="image-help__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" /></svg>
              </summary>
              <p>{{ item.a }}</p>
            </details>
          </div>
          <div class="image-help__notes">
            <p><strong>尺寸与格式：</strong>JPG / WebP 默认保持原尺寸，取消勾选后最长边限制为 4096 像素，不放大小图。PNG 始终保持原尺寸，单张最多 {{ PNG_COMPRESSION_MAX_PIXELS / 10000 }} 万像素，暂不支持动画 PNG；16 位、低位灰度及交错 PNG 在无损模式下保留原文件。</p>
            <p><strong>处理与重试：</strong>PNG 在后台线程处理，不支持的浏览器会明确提示。每张图片处理超时会显示错误，可单独重试；修改设置后，点击“重新压缩”按当前全部参数处理。</p>
          </div>
        </details>
      </template>
    </StandardToolPageTemplate>
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
/**
 * 组件依赖导入
 */
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { UploadRawFile } from 'element-plus'
import { autoDown } from '@/utils/file'
import { ElMessage } from 'element-plus'
import { compressPngInWorker, PngCompressionError, PNG_COMPRESSION_MAX_PIXELS, type PngCompressionMode } from '@/utils/pngCompression'
import { compressBrowserImage, BrowserImageCompressionError } from '@/utils/browserImageCompression'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import { useRoute } from 'vue-router'
import JSZip from 'jszip'
import { createImageArchiveEntries, createImageArchiveNames } from '@/utils/imageCompressionArchive'
import {
  IMAGE_COMPRESS_MAX_FILE_COUNT,
  IMAGE_COMPRESS_MAX_FILE_SIZE_MB,
  IMAGE_COMPRESS_SUPPORTED_FORMATS
} from '@/constants/imageCompress'

// 仅手机视口启用底部操作栏；桌面窄容器仍保留原有行内操作和完整指南。
const isMobileViewport = useMediaQuery('(max-width: 640px)')

/**
 * 工具函数：URL对象管理
 */
const createObjectURL = (file: Blob): string => {
  return window.URL.createObjectURL(file)
}

/**
 * 延迟释放打包下载地址，确保浏览器已经开始读取文件后再回收 Blob URL。
 */
const DOWNLOAD_URL_REVOKE_DELAY_MS = 1000

/** 释放预览或下载使用的对象地址。 */
const revokeObjectURL = (url: string) => {
  window.URL.revokeObjectURL(url)
}

/**
 * 类型定义
 */
interface CompressedFile {
  source: File
  name: string
  type: string
  size: number
  compressedSize?: number
  compressedUrl?: string
  compressionRatio?: number
  originalSize?: number
  previewUrl?: string
  compressedBlob?: Blob
  keptOriginal?: boolean
  error?: string
}

/**
 * 常见问题
 */
const faq = [
  {
    q: '支持哪些图片格式？',
    a: '支持 JPG、PNG 和 WebP，压缩结果保持原图格式，打包下载不会转换图片格式。'
  },
  {
    q: '压缩后的图片质量如何？',
    a: 'PNG 默认无损，减色模式会改变颜色；JPG / WebP 可调整质量来平衡体积与清晰度。压缩率取决于原图，建议下载后检查清晰度。'
  },
  {
    q: '如何保持图片透明背景？',
    a: 'PNG 默认无损模式保留原始像素和透明度。减色模式保留透明通道，但可能改变半透明像素的颜色和透明级别。'
  },
  {
    q: '有文件大小限制吗？',
    a: `单个文件不能超过${IMAGE_COMPRESS_MAX_FILE_SIZE_MB}MB，如果需要压缩更大的图片，建议先裁剪或调整分辨率。`
  }
]

/**
 * 状态管理
 */
const fileList = ref<CompressedFile[]>([])
const selectedPreviewSource = ref<File | null>(null)
/** 保存窄屏参数区的展开状态；宽屏始终显示同一组参数控件，不复制压缩配置。 */
const mobileSettingsExpanded = ref(false)
const mobilePreviewSide = ref<'original' | 'compressed'>('original')
const previewSection = ref<HTMLElement | null>(null)

/** 从当前队列选择对比图片；被移除后自动回到队列第一张，返回可预览的文件条目。 */
const activePreviewFile = computed(() => fileList.value.find(file => file.source === selectedPreviewSource.value) || fileList.value[0])

/** 当前图片完成压缩后展示结果；切换到未处理或失败图片时恢复原图，避免沿用另一张的对比状态。 */
watch(() => activePreviewFile.value?.compressedUrl, (url) => {
  mobilePreviewSide.value = url ? 'compressed' : 'original'
})

/** 按原始文件身份切换对比，手机滚回大图区域，避免切换后看不到预览反馈。 */
const selectPreview = (file: CompressedFile) => {
  selectedPreviewSource.value = file.source
  if (isMobileViewport.value) previewSection.value?.scrollIntoView({ block: 'start', behavior: 'auto' })
}
const downloadNames = computed(() => createImageArchiveNames(fileList.value))
const quality = ref(80)
const preserveDimensions = ref(true)
const pngMode = ref<PngCompressionMode>('lossless')
const pngColors = ref<32 | 64 | 128 | 256>(256)
const compressionController = new AbortController()

/** 固定一批图片使用的全部设置，避免异步任务读取到下一次修改的配置。 */
interface BatchCompressionSettings {
  quality: number
  preserveDimensions: boolean
  pngMode: PngCompressionMode
  pngColors: 32 | 64 | 128 | 256
}
const isCompressing = ref(false)
const isPackaging = ref(false)
const isBusy = computed(() => isCompressing.value || isPackaging.value)
let disposed = false
const isDragging = ref(false)
const processingIndex = ref(-1)
const batchProgress = ref({ completed: 0, total: 0 })
const packagingProgress = ref(0)

/**
 * 根据 MIME 类型和文件后缀解析图片格式，兼容拖拽文件没有正确 MIME 的浏览器场景。
 * @param file 待校验的文件对象
 * @returns 统一后的图片 MIME 类型，不支持时返回 null
 */
const resolveImageMimeType = (file: Pick<File, 'type' | 'name'>): 'image/jpeg' | 'image/png' | 'image/webp' | null => {
  const mimeType = file.type.toLowerCase()
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return 'image/jpeg'
  if (mimeType === 'image/png') return 'image/png'
  if (mimeType === 'image/webp') return 'image/webp'

  const extension = file.name.toLowerCase().split('.').pop() || ''
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
  if (extension === 'png') return 'image/png'
  if (extension === 'webp') return 'image/webp'
  return null
}

/**
 * 计算已压缩文件数量
 */
const compressedCount = computed(() => {
  return fileList.value.filter((file: CompressedFile) => file.compressedSize).length
})

/** 统计失败与待处理文件，分别反馈批次状态，失败项不计入待处理数量。 */
const failedCount = computed(() => fileList.value.filter((file) => file.error).length)
const pendingCount = computed(() => fileList.value.filter((file) => !file.compressedBlob && !file.error).length)

/** 仅汇总已成功输出图片的前后体积，避免把待处理或失败文件误算成节省空间。 */
const compressionSummary = computed(() => {
  const totals = fileList.value.reduce((sum, file) => {
    if (file.compressedBlob) {
      sum.original += file.size
      sum.result += file.compressedBlob.size
    }
    return sum
  }, { original: 0, result: 0 })
  return { ...totals, saved: Math.max(0, totals.original - totals.result) }
})

/**
 * 处理文件上传
 */
const handleUpload = (file: UploadRawFile) => {
  if (isBusy.value) {
    ElMessage.info('图片正在处理，请稍候')
    return false
  }

  if (!file) {
    return false
  }

  if (!resolveImageMimeType(file)) {
    ElMessage.warning(`仅支持${IMAGE_COMPRESS_SUPPORTED_FORMATS}格式图片`)
    return false
  }

  if (file.size > IMAGE_COMPRESS_MAX_FILE_SIZE_MB * 1024 * 1024) {
    ElMessage.warning(`文件 ${file.name} 超过${IMAGE_COMPRESS_MAX_FILE_SIZE_MB}MB，请选择更小的文件`)
    return false
  }

  if (fileList.value.length >= IMAGE_COMPRESS_MAX_FILE_COUNT) {
    ElMessage.warning(`最多只能上传${IMAGE_COMPRESS_MAX_FILE_COUNT}个文件`)
    return false
  }

  try {
    // 使用普通响应式条目保存状态，File 的自定义属性不会被 Vue 追踪。
    fileList.value.push({ source: file, name: file.name, type: file.type, size: file.size, previewUrl: createObjectURL(file) })
    return false
  } catch (error) {
    console.error('Error handling file upload:', error)
    ElMessage.error('文件上传失败，请重试')
    return false
  }
}

/**
 * 处理文件拖放
 */
const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  if (isBusy.value) return

  const files = e.dataTransfer?.files
  if (!files) {
    return
  }

  Array.from(files).forEach((file: File) => {
    handleUpload(file as UploadRawFile)
  })
}

/**
 * 移除文件
 */
const removeFile = (index: number) => {
  if (isBusy.value) return
  const file = fileList.value[index]
  if (selectedPreviewSource.value === file.source) selectedPreviewSource.value = null
  if (file.previewUrl) {
    revokeObjectURL(file.previewUrl)
  }
  if (file.compressedUrl) {
    revokeObjectURL(file.compressedUrl)
  }
  fileList.value.splice(index, 1)
}

/**
 * 清空文件列表
 */
const clearFiles = () => {
  if (isBusy.value) return
  fileList.value.forEach((file: CompressedFile) => {
    if (file.previewUrl) {
      revokeObjectURL(file.previewUrl)
    }
    if (file.compressedUrl) {
      revokeObjectURL(file.compressedUrl)
    }
  })
  fileList.value = []
  selectedPreviewSource.value = null
}

/**
 * 压缩单个文件
 */
const compressFile = async (file: CompressedFile, settings: BatchCompressionSettings): Promise<boolean> => {
  const fileIndex = fileList.value.indexOf(file)
  if (fileIndex < 0) return false
  processingIndex.value = fileIndex
  file.error = undefined

  try {
    let result: Blob
    const mimeType = resolveImageMimeType(file)
    if (!mimeType) {
      throw new Error('不支持的图片格式')
    }

    // 根据文件类型选择压缩方法
    switch (mimeType) {
      case 'image/png':
        result = await compressPngInWorker(file.source, {
          mode: settings.pngMode,
          colors: settings.pngColors,
          signal: compressionController.signal
        })
        break
      case 'image/jpeg':
      case 'image/webp':
        result = await compressBrowserImage(file.source, mimeType, {
          quality: settings.quality,
          preserveDimensions: settings.preserveDimensions,
          signal: compressionController.signal
        })
        break
      default:
        throw new Error('不支持的图片格式')
    }

    if (disposed) return false

    // PNG 不缩小尺寸，结果增大时可安全保留原图；JPG/WebP 交由编码器区分缩小尺寸与原图回退。
    if (mimeType === 'image/png' && result.size >= file.size) result = file.source
    const keptOriginal = result === file.source || (settings.preserveDimensions && result.size === file.size)

    // 更新文件状态
    const compressedFile = fileList.value.find((item) => item === file)
    if (!compressedFile) {
      throw new Error('文件不存在')
    }

    // 更新压缩信息
    compressedFile.compressedBlob = result
    compressedFile.keptOriginal = keptOriginal
    compressedFile.compressedSize = result.size
    compressedFile.originalSize = file.size
    compressedFile.compressionRatio = ((file.size - result.size) / file.size) * 100

    // 更新压缩后的URL
    if (compressedFile.compressedUrl) {
      revokeObjectURL(compressedFile.compressedUrl)
    }
    compressedFile.compressedUrl = createObjectURL(result)
    return true
  } catch (error) {
    if (disposed) return false
    console.error('[图片压缩] 文件处理失败', error instanceof Error ? error.message : '未知错误')
    clearCompressedResult(file)
    file.error = error instanceof PngCompressionError || error instanceof BrowserImageCompressionError
      ? error.message
      : '压缩失败，图片可能已损坏，请移除后重新选择或重试'
    ElMessage.error(`文件 ${file.name} 压缩失败，请重试`)
    return false
  } finally {
    processingIndex.value = -1
  }
}

/** 清理单张图片的旧结果，避免重试失败后仍下载上次结果。 */
const clearCompressedResult = (file: CompressedFile) => {
  if (file.compressedUrl) revokeObjectURL(file.compressedUrl)
  file.compressedUrl = undefined
  file.compressedBlob = undefined
  file.compressedSize = undefined
  file.compressionRatio = undefined
  file.keptOriginal = undefined
}

/** 按顺序压缩给定图片并快照全部设置，避免同批输出使用不同的尺寸或 PNG 模式。 */
const compressBatch = async (files: CompressedFile[]) => {
  batchProgress.value = { completed: 0, total: files.length }
  isCompressing.value = true
  const settings: BatchCompressionSettings = {
    quality: quality.value,
    preserveDimensions: preserveDimensions.value,
    pngMode: pngMode.value,
    pngColors: pngColors.value
  }
  let failedCount = 0
  try {
    for (const file of files) {
      if (disposed) break
      if (!(await compressFile(file, settings))) failedCount += 1
      if (!disposed) batchProgress.value.completed += 1
    }
  } finally {
    isCompressing.value = false
    processingIndex.value = -1
  }
  return failedCount
}

/** 只重试当前失败图片，沿用当前质量，保留其他成功结果及其下载地址；返回重试结束的异步任务。 */
const retryFailed = async () => {
  if (isBusy.value) return
  const failedFiles = fileList.value.filter((file) => file.error)
  if (!failedFiles.length) return
  const remainingFailures = await compressBatch(failedFiles)
  if (disposed) return
  if (remainingFailures) ElMessage.warning(`重试完成，仍有 ${remainingFailures} 张图片失败，请检查文件`)
  else ElMessage.success(`已重新压缩 ${failedFiles.length} 张图片，其他成功结果保持不变`)
}

/** 根据 ZIP 回调的 percent（0–100）更新实际编码进度，忽略非有限值和卸载后的回调。 */
const updatePackagingProgress = (metadata: { percent: number }) => {
  if (disposed || !Number.isFinite(metadata.percent)) return
  packagingProgress.value = Math.min(100, Math.max(0, metadata.percent))
}

/** 按顺序压缩全部图片；单张失败不会阻止后续图片，并保留可重试的错误状态。 */
const compressAll = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }
  const failedCount = await compressBatch([...fileList.value])
  if (disposed) return
  if (failedCount > 0) ElMessage.warning(`压缩完成，${failedCount} 个文件失败，请重试`)
  else ElMessage.success('所有图片压缩完成')
}

/** 打包全部有效结果；先压缩新增图片，并锁定文件列表直到下载文件生成完毕。 */
const downloadAll = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择要压缩的图片')
    return
  }
  packagingProgress.value = 0
  isPackaging.value = true
  try {
    const pendingFiles = fileList.value.filter((file) => !file.compressedBlob)
    if (pendingFiles.length > 0) await compressBatch(pendingFiles)
    if (disposed) return
    const compressedFiles = fileList.value.filter((file) => file.compressedBlob)
    if (compressedFiles.length === 0) {
      ElMessage.warning('没有可下载的压缩文件，请检查图片后重试')
      return
    }
    const zip = new JSZip()
    for (const entry of createImageArchiveEntries(fileList.value)) {
      zip.file(entry.name, entry.blob)
    }
    const content = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      updatePackagingProgress
    )
    if (disposed) return
    const zipUrl = URL.createObjectURL(content)
    autoDown(zipUrl, 'uied_compressed_images.zip')
    window.setTimeout(() => revokeObjectURL(zipUrl), DOWNLOAD_URL_REVOKE_DELAY_MS)
    const failedCount = fileList.value.length - compressedFiles.length
    if (failedCount > 0) ElMessage.warning(`已下载 ${compressedFiles.length} 张图片，${failedCount} 张失败未打包，请检查列表后重试`)
    else ElMessage.success('打包下载成功')
  } catch (error) {
    if (disposed) return
    console.error('[图片压缩] 打包失败', error instanceof Error ? error.message : '未知错误')
    ElMessage.error('打包下载失败，请重试')
  } finally {
    isPackaging.value = false
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 添加新的文件上传处理方法
 */
const fileInputRef = ref<HTMLInputElement | null>(null)

/** 打开文件选择器，处理任务期间禁止修改批次。 */
const triggerFileInput = () => {
  if (isBusy.value) return
  fileInputRef.value?.click()
}

/** 接收整批选择并重置 input，使移除后可以再次选择同一图片。 */
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  Array.from(input.files).forEach((file: File) => {
    handleUpload(file as UploadRawFile)
  })

  // 清空 input 值，允许重复选择同一文件
  input.value = ''
}

/**
 * 添加重新压缩功能
 */
const recompress = async () => {
  if (isBusy.value) return
  if (fileList.value.length === 0) {
    ElMessage.warning('没有可压缩的图片')
    return
  }

  // 清除之前的压缩结果。
  fileList.value.forEach(clearCompressedResult)

  // 重新压缩
  await compressAll()
}

/** 页面卸载时释放预览及结果地址，并阻止未完成任务回写和继续处理下一张。 */
onBeforeUnmount(() => {
  disposed = true
  compressionController.abort()
  for (const file of fileList.value) {
    if (file.previewUrl) revokeObjectURL(file.previewUrl)
    clearCompressedResult(file)
  }
})

const route = useRoute()
</script>

<style scoped>
.image-compress-page { min-width: 0; container: image-compress / inline-size; }
.image-compress-page :deep(.standard-tool-header) { padding: 32px 32px 28px; text-align: center; border-color: var(--uied-color-border); }
.image-compress-page :deep(.standard-tool-header h1) { font-size: 36px; font-weight: 700; letter-spacing: -.03em; }
.image-compress-page :deep(.standard-tool-header__description) { margin: 16px auto 0; font-size: 14px; }
.image-compress-page :deep(.standard-tool-header__meta) { justify-content: center; margin-top: 12px; }
.image-compress-page :deep(.standard-tool-workspace) { padding: 0 32px 32px; border-color: var(--uied-color-border); }
.image-meta { color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; }
.image-meta--local { display: inline-flex; align-items: center; gap: 6px; }
.image-meta--local::before { width: 6px; height: 6px; border-radius: 50%; background: var(--uied-color-success); content: ''; }
.image-workflow { display: grid; gap: 24px; container-type: inline-size; container-name: image-workflow; }
.image-upload { border: 2px dashed var(--uied-color-border); border-radius: 12px; background: color-mix(in srgb, var(--uied-color-page) 65%, white); transition: border-color 160ms ease, background-color 160ms ease; }
.image-upload:hover:not(.image-upload--filled), .image-upload--dragging { border-color: var(--uied-color-primary); background: var(--uied-color-primary-soft); }
.image-upload--busy { opacity: .6; }
.image-upload__trigger { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; width: 100%; min-height: 320px; padding: 32px 20px; border: 0; border-radius: 10px; background: transparent; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.7; text-align: center; cursor: pointer; }
.image-upload__trigger strong { color: var(--uied-color-text); font-size: 22px; font-weight: 700; }
.image-upload__trigger .image-upload__mobile-copy { display: none; }
.image-upload__badge { display: inline-flex; align-items: center; justify-content: center; width: 96px; height: 96px; margin-bottom: 8px; border-radius: 50%; background: var(--uied-color-surface); color: var(--uied-color-primary); box-shadow: 0 2px 8px rgb(16 24 40 / 5%); }
.image-upload__privacy { display: inline-flex; align-items: center; justify-content: center; gap: 6px; color: var(--uied-color-text-secondary); font-size: 12px; }
.image-upload__privacy svg { flex-shrink: 0; }
.image-upload__select { color: var(--uied-color-primary); font-size: 13px; font-weight: 600; }
.image-upload--filled { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border: 1px solid var(--uied-color-border); border-radius: 12px; background: var(--uied-color-page); }
.image-upload__copy { min-width: 0; }
.image-upload__copy h2 { margin: 0; color: var(--uied-color-text); font-size: 15px; font-weight: 600; line-height: 1.5; }
.image-upload__copy p { margin: 5px 0 0; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; }
.image-toolbar-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.image-action { display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 20px; border: 1px solid var(--uied-color-border); border-radius: 8px; background: var(--uied-color-surface); color: var(--uied-color-text); font-size: 14px; font-weight: 600; cursor: pointer; transition: border-color 160ms ease, background-color 160ms ease; }
.image-action:hover:not(:disabled) { border-color: var(--uied-color-primary); background: var(--uied-color-primary-soft); }
.image-action:disabled, .image-text-action:disabled, .image-remove:disabled { opacity: .5; cursor: not-allowed; }
.image-action--primary { border-color: var(--uied-color-primary); color: #fff; background: var(--uied-color-primary); }
.image-action--primary:hover:not(:disabled) { background: var(--uied-color-primary-hover); }
.image-editor { display: grid; gap: 24px; min-width: 0; align-items: start; }
.image-settings { display: grid; align-items: start; gap: 24px; min-width: 0; padding: 24px; border: 1px solid var(--uied-color-border); border-radius: 12px; background: var(--uied-color-page); }
.image-settings__title { margin: 0; padding-bottom: 16px; border-bottom: 1px solid var(--uied-color-border); color: var(--uied-color-text); font-size: 18px; font-weight: 700; }
.image-settings__toggle, .image-settings__mobile-summary { display: none; }
.image-settings__body { display: grid; gap: 24px; min-width: 0; }
.image-settings__control { min-width: 0; }
.image-settings__label { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; }
.image-settings__label h3 { margin: 0; font-size: 14px; font-weight: 600; }
.image-settings__label output { color: var(--uied-color-primary); font-size: 16px; font-weight: 600; font-variant-numeric: tabular-nums; }
.image-settings :deep(.el-slider) { --el-slider-main-bg-color: var(--uied-color-primary); --el-slider-button-size: 14px; --el-slider-height: 4px; margin: 8px 0; }
.image-option { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; color: var(--uied-color-text); font-size: 13px; cursor: pointer; }
.image-option input { flex: 0 0 auto; width: 16px; height: 16px; margin: 0; accent-color: var(--uied-color-primary); }
.image-option:has(input:disabled) { cursor: not-allowed; opacity: .6; }
.image-option--dimensions { margin-top: 8px; }
.image-png-options { min-width: 0; margin: 0; padding: 12px 0 0; border: 0; border-top: 1px solid var(--uied-color-border); }
.image-png-options legend { padding: 0 12px 0 0; color: var(--uied-color-text); font-size: 14px; font-weight: 600; }
.image-png-options__choices { display: flex; flex-wrap: wrap; align-items: center; gap: 0 16px; }
.image-color-limit { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px; min-height: 44px; color: var(--uied-color-text-secondary); font-size: 12px; }
.image-color-limit select { min-height: 44px; padding: 0 8px; border: 1px solid var(--uied-color-border); border-radius: 6px; background: var(--uied-color-surface); color: var(--uied-color-text); font-size: 13px; }
.image-hint { margin: 0; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.7; }
.image-output { display: grid; gap: 24px; min-width: 0; container-type: inline-size; container-name: image-output; }
.image-preview { min-width: 0; }
.image-preview__mobile-tabs, .image-remove__label { display: none; }
.image-preview__heading { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 8px 16px; margin-bottom: 16px; }
.image-preview__heading h2 { margin: 0; font-size: 18px; font-weight: 600; }
.image-preview__heading > span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--uied-color-text-secondary); font-size: 12px; }
.image-preview__grid { display: grid; gap: 16px; margin-bottom: 12px; }
.image-preview figure { min-width: 0; margin: 0; }
.image-preview figcaption { display: flex; flex-wrap: wrap; justify-content: center; align-items: baseline; gap: 4px 8px; min-height: 36px; margin-bottom: 8px; color: var(--uied-color-text-secondary); text-align: center; font-size: 12px; }
.image-preview figcaption h3 { margin: 0; color: var(--uied-color-text); font-size: 14px; font-weight: 500; }
.image-preview__canvas { display: flex; align-items: center; justify-content: center; min-height: 240px; padding: 12px; overflow: hidden; border: 1px solid var(--uied-color-border); border-radius: 12px; background: conic-gradient(#f0f1f4 25%, #fff 0 50%, #f0f1f4 0 75%, #fff 0) 0 0 / 20px 20px; }
.image-preview__canvas :deep(.el-image) { display: block; max-width: 100%; width: 100%; height: 216px; }
.image-preview__canvas :deep(.el-image__inner) { max-height: 100%; object-fit: contain; }
.image-preview__placeholder { max-width: 200px; margin: 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.8; text-align: center; }
.image-results { min-width: 0; container-type: inline-size; container-name: image-results; }
.image-results__heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 16px; }
.image-results__heading h2 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 18px; font-weight: 600; }
.image-results__heading h2 span { color: var(--uied-color-text-secondary); font-size: 13px; font-weight: 500; }
.image-results__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 16px; }
.image-text-action { min-height: 44px; border: 0; padding: 0; color: var(--uied-color-text-secondary); background: transparent; font-size: 13px; cursor: pointer; }
.image-text-action:hover:not(:disabled), .image-text-action--retry { color: var(--uied-color-primary); }
.image-results__status { display: flex; flex-wrap: wrap; gap: 4px 16px; padding: 0 0 16px; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; }
.image-files__columns { display: none; }
.image-files { max-height: min(440px, 55vh); border-top: 1px solid var(--uied-color-border); border-bottom: 1px solid var(--uied-color-border); overflow-y: auto; overscroll-behavior: contain; }
.image-file { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px 12px; padding: 12px 0; }
.image-file + .image-file { border-top: 1px solid var(--uied-color-border); }
.image-file__preview { flex: 0 0 44px; width: 44px; height: 44px; margin-top: 4px; border-radius: 6px; background: var(--uied-color-page); }
.image-file__info { flex: 1; min-width: 0; }
.image-file__name { display: block; width: 100%; min-height: 44px; padding: 0; border: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: transparent; color: var(--uied-color-text); text-align: left; font-size: 14px; font-weight: 500; line-height: 1.6; cursor: pointer; }
.image-file__name:hover, .image-file__name[aria-pressed="true"] { color: var(--uied-color-primary); }
.image-file__sizes { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin-top: 4px; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums; }
.image-file__sizes strong { color: var(--uied-color-text); font-weight: 600; }
.image-file__sizes .image-saving { padding: 2px 6px; border-radius: 4px; background: color-mix(in srgb, var(--uied-color-success) 8%, transparent); color: var(--uied-color-success); font-size: 12px; }
.image-file__error, .image-error { color: var(--uied-color-danger); }
.image-file__error { margin: 6px 0 0; font-size: 12px; line-height: 1.6; overflow-wrap: anywhere; }
.image-file__actions { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; margin-left: auto; }
.image-file__download { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; color: var(--uied-color-primary); font-size: 13px; text-decoration: none; }
.image-file__download:hover { text-decoration: underline; text-underline-offset: 4px; }
.image-remove { display: inline-flex; align-items: center; justify-content: center; width: 44px; min-height: 44px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--uied-color-text-secondary); cursor: pointer; }
.image-remove:hover:not(:disabled) { color: var(--uied-color-danger); background: color-mix(in srgb, var(--uied-color-danger) 6%, transparent); }
.image-results__footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding-top: 24px; }
.image-summary { display: grid; gap: 6px; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; }
.image-summary strong { color: var(--uied-color-text); font-size: 20px; font-weight: 600; letter-spacing: -.02em; }
.image-results__footer .image-action { min-width: 132px; }
.image-batch-progress { padding: 16px 20px; border-left: 2px solid var(--uied-color-primary); background: var(--uied-color-primary-soft); }
.image-batch-progress__label { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 16px; font-size: 13px; line-height: 1.6; }
.image-batch-progress__label strong { font-weight: 600; }
.image-batch-progress__label span { color: var(--uied-color-text-secondary); font-variant-numeric: tabular-nums; }
.image-batch-progress progress { display: block; width: 100%; height: 4px; margin: 10px 0; border: 0; border-radius: 4px; overflow: hidden; appearance: none; background: var(--uied-color-border); accent-color: var(--uied-color-primary); }
.image-batch-progress progress::-webkit-progress-bar { border-radius: 4px; background: var(--uied-color-border); }
.image-batch-progress progress::-webkit-progress-value { border-radius: 4px; background: var(--uied-color-primary); }
.image-batch-progress progress::-moz-progress-bar { border-radius: 4px; background: var(--uied-color-primary); }
.image-batch-progress p { margin: 0; overflow-wrap: anywhere; color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.6; }
.image-help { min-width: 0; padding: 24px; border: 1px solid var(--uied-color-border); border-radius: 12px; background: var(--uied-color-surface); container: image-help / inline-size; }
.image-help__heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 48px; list-style: none; cursor: pointer; }
.image-help__heading::-webkit-details-marker { display: none; }
.image-help__heading:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 4px; }
.image-help[open] > .image-help__heading { margin-bottom: 24px; }
.image-help__toggle-icon { flex-shrink: 0; color: var(--uied-color-text-secondary); }
.image-help[open] > .image-help__heading .image-help__toggle-icon { transform: rotate(180deg); }
.image-help__heading h2 { margin: 0 0 6px; color: var(--uied-color-text); font-size: 20px; font-weight: 600; line-height: 1.4; }
.image-help__heading p { margin: 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.7; }
.image-help__local { display: inline-flex; align-items: center; gap: 6px; min-height: 28px; padding: 2px 8px; border: 1px solid var(--uied-color-border); border-radius: 6px; color: var(--uied-color-text-secondary); font-size: 12px; white-space: nowrap; }
.image-help__local::before { width: 5px; height: 5px; border-radius: 50%; background: var(--uied-color-success); content: ''; }
.image-help__steps { display: grid; gap: 20px; margin: 0 0 24px; padding: 0 0 24px; border-bottom: 1px solid var(--uied-color-border); list-style: none; }
.image-help__steps li { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.image-help__number { display: inline-flex; flex: 0 0 28px; align-items: center; justify-content: center; height: 28px; border: 1px solid var(--uied-color-border); border-radius: 6px; color: var(--uied-color-text-secondary); font-size: 13px; font-variant-numeric: tabular-nums; }
.image-help__steps h3 { margin: 2px 0 6px; color: var(--uied-color-text); font-size: 14px; font-weight: 600; line-height: 1.6; }
.image-help__steps p { margin: 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.8; }
.image-help__questions > h3 { margin: 0 0 8px; color: var(--uied-color-text); font-size: 16px; font-weight: 600; }
.image-help__item { border-bottom: 1px solid var(--uied-color-border); }
.image-help__item summary { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 52px; padding: 14px 0; border-radius: 4px; list-style: none; color: var(--uied-color-text); cursor: pointer; }
.image-help__item summary::-webkit-details-marker { display: none; }
.image-help__item summary:hover { color: var(--uied-color-primary); }
.image-help__item summary:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 4px; }
.image-help__question { font-size: 14px; font-weight: 500; line-height: 1.7; }
.image-help__chevron { flex-shrink: 0; color: var(--uied-color-text-secondary); }
.image-help__item[open] .image-help__chevron { transform: rotate(180deg); }
.image-help__item p { margin: 0; padding: 0 32px 16px 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.9; }
.image-help__notes { display: grid; gap: 8px; margin-top: 20px; padding: 16px; border-radius: 8px; background: var(--uied-color-page); color: var(--uied-color-text-secondary); font-size: 12px; line-height: 1.8; overflow-wrap: anywhere; }
.image-help__notes p { margin: 0; }
.image-help__notes strong { font-weight: 500; }
@container image-help (min-width: 640px) {
  .image-help__steps { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
}
@container image-workflow (min-width: 780px) {
  .image-editor { grid-template-columns: 260px minmax(0, 1fr); gap: 24px; }
}
@container image-output (min-width: 420px) {
  .image-preview__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container image-results (min-width: 720px) {
  .image-files__columns { display: grid; grid-template-columns: minmax(0, 1fr) 250px 108px; gap: 16px; padding: 12px 16px 12px 0; color: var(--uied-color-text-secondary); font-size: 12px; }
  .image-files__columns span:last-child { text-align: center; }
  .image-file { display: grid; grid-template-columns: 44px minmax(0, 1fr) 250px 108px; gap: 16px; align-items: center; }
  .image-file__info { display: contents; }
  .image-file__preview, .image-file__name, .image-file__sizes, .image-file__actions { grid-row: 1; }
  .image-file__sizes { margin-top: 0; }
  .image-file__error { grid-column: 2 / 4; margin: 0; }
}
@container image-workflow (max-width: 600px) {
  .image-upload__trigger { min-height: 300px; padding: 24px 16px; }
  .image-upload__trigger strong { font-size: 20px; }
  .image-upload--filled { padding: 16px; }
  .image-toolbar-actions { width: 100%; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .image-toolbar-actions .image-action { padding-inline: 8px; }
  .image-settings { gap: 20px; padding: 20px; }
  .image-file__info { flex-basis: calc(100% - 56px); }
  .image-results__footer { flex-direction: column; align-items: stretch; padding-top: 20px; }
}
@container image-compress (max-width: 600px) {
  .image-compress-page :deep(.standard-tool-header) { padding: 16px 12px 12px; }
  .image-compress-page :deep(.standard-tool-header h1) { font-size: 24px; line-height: 1.4; }
  .image-compress-page :deep(.standard-tool-header__description) { display: none; }
  .image-compress-page :deep(.standard-tool-header__meta) { gap: 4px 12px; margin-top: 8px; }
  .image-compress-page :deep(.standard-tool-workspace) { padding: 0 12px 20px; }
  .image-workflow, .image-editor, .image-output { gap: 16px; }
  .image-upload__trigger { min-height: 184px; gap: 8px; padding: 16px 12px; }
  .image-upload__trigger .image-upload__desktop-copy { display: none; }
  .image-upload__trigger .image-upload__mobile-copy { display: block; font-size: 20px; }
  .image-upload__badge { width: 48px; height: 48px; margin-bottom: 0; }
  .image-upload__badge svg { width: 32px; height: 32px; }
  .image-upload--filled { gap: 12px; padding: 12px; }
  .image-upload__copy p, .image-upload__privacy { display: none; }
  .image-upload__copy h2 { font-size: 14px; }
  .image-toolbar-actions .image-action { min-height: 44px; }
  .image-toolbar-actions .image-action--primary { background: var(--uied-color-surface); border-color: var(--uied-color-border); color: var(--uied-color-text); }
  .image-settings { gap: 0; padding: 8px 12px 12px; border-radius: 8px; }
  .image-settings__title { padding: 0; border: 0; }
  .image-settings__desktop-title { display: none; }
  .image-settings__toggle { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; min-height: 44px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: var(--uied-color-text); text-align: left; font-size: 15px; font-weight: 600; cursor: pointer; }
  .image-settings__toggle-label { display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0; color: var(--uied-color-text-secondary); font-size: 12px; font-weight: 400; }
  .image-settings--expanded .image-settings__toggle svg { transform: rotate(180deg); }
  .image-settings__mobile-summary { display: flex; flex-direction: column; gap: 2px; margin: 4px 0 0; color: var(--uied-color-text-secondary); font-size: 13px; line-height: 1.7; }
  .image-settings__body { display: none; gap: 24px; margin-top: 16px; padding-top: 20px; border-top: 1px solid var(--uied-color-border); }
  .image-settings--expanded .image-settings__body { display: grid; }
  .image-settings--expanded { padding-inline: 16px; }
  .image-settings__label h3, .image-png-options legend { font-size: 15px; }
  .image-settings .image-hint, .image-settings .image-option { font-size: 13px; line-height: 1.7; }
  .image-png-options { padding-top: 20px; }
  .image-png-options__choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-block: 8px; }
  .image-settings :deep(.el-slider) { --el-slider-button-size: 20px; --el-slider-button-wrapper-size: 44px; height: 44px; margin: 4px 0; }
  .image-color-limit { width: 100%; justify-content: space-between; }
  .image-color-limit select { min-width: 100px; font-size: 16px; }
  .image-preview__heading { gap: 4px 8px; margin-bottom: 12px; }
  .image-preview__heading h2, .image-results__heading h2 { font-size: 16px; }
  .image-preview { scroll-margin-top: 12px; }
  .image-preview__mobile-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; margin-bottom: 12px; border-radius: 8px; background: var(--uied-color-page); }
  .image-preview__mobile-tabs button { min-height: 44px; border: 1px solid transparent; border-radius: 6px; background: transparent; color: var(--uied-color-text-secondary); font-size: 14px; cursor: pointer; }
  .image-preview__mobile-tabs button[aria-pressed='true'] { border-color: var(--uied-color-border); background: var(--uied-color-surface); color: var(--uied-color-primary); font-weight: 600; }
  .image-preview__mobile-tabs button:disabled { opacity: .5; cursor: not-allowed; }
  .image-preview__grid { display: block; }
  .image-preview__grid figure { display: none; }
  .image-preview__grid--original .image-preview__original,
  .image-preview__grid--compressed .image-preview__compressed { display: block; }
  .image-preview figcaption { gap: 8px; min-height: 24px; margin-bottom: 8px; flex-direction: row; justify-content: space-between; align-items: baseline; font-size: 13px; }
  .image-preview figcaption h3 { font-size: 12px; }
  .image-preview__canvas { min-height: 0; height: clamp(180px, 64cqi, 260px); padding: 12px; border-radius: 8px; }
  .image-preview__canvas :deep(.el-image) { height: 100%; }
  .image-preview__placeholder { font-size: 12px; line-height: 1.6; }
  .image-results__actions { gap: 8px; }
  .image-text-action { padding-inline: 4px; font-size: 12px; }
  .image-files { max-height: none; overflow: visible; scroll-padding-block: 8px; }
  .image-files { display: grid; gap: 12px; border: 0; }
  .image-file { display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 12px; align-items: start; padding: 12px; border: 1px solid var(--uied-color-border); border-radius: 8px; }
  .image-file__preview { grid-column: 1; grid-row: 1; width: 48px; height: 48px; margin-top: 0; }
  .image-file__info { grid-column: 2; grid-row: 1; }
  .image-file__name { display: -webkit-box; min-height: 44px; overflow: hidden; white-space: normal; overflow-wrap: anywhere; -webkit-box-orient: vertical; -webkit-line-clamp: 2; font-size: 14px; line-height: 1.65; }
  .image-file__sizes { font-size: 13px; gap: 6px 8px; }
  .image-file__actions { display: flex; grid-column: 1 / -1; grid-row: 2; justify-content: flex-end; gap: 12px; margin-left: 0; padding-top: 4px; }
  .image-file__download { justify-content: center; min-width: 88px; padding: 0 12px; border: 1px solid var(--uied-color-border); border-radius: 6px; }
  .image-file__download:active { background: var(--uied-color-primary-soft); }
  .image-remove { gap: 6px; width: auto; min-width: 76px; padding-inline: 10px; background: var(--uied-color-page); }
  .image-remove__label { display: inline; font-size: 13px; }
  .image-results__footer { gap: 12px; padding-top: 16px; padding-bottom: env(safe-area-inset-bottom, 0px); }
  .image-results__footer .image-action { width: 100%; min-height: 48px; }
  .image-summary strong { font-size: 18px; }
  .image-batch-progress { padding: 12px; }
  .image-help { padding: 20px 16px; }
  .image-help__heading h2 { font-size: 18px; }
  .image-help__local { display: none; }
  .image-help__item p { padding-right: 0; }
  .image-help__notes { padding: 12px; }
}

@media (max-width: 640px) {
  /* Teleport 将手机操作栏移出容器查询的定位上下文，避免固定栏只固定在结果区域。 */
  .image-results__footer--docked {
    position: fixed; z-index: 50; inset: auto 0 0;
    display: flex; flex-direction: row; align-items: center; flex-wrap: nowrap; gap: 12px;
    padding: 12px max(12px, env(safe-area-inset-right, 0px)) calc(12px + env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px));
    border-top: 1px solid var(--uied-color-border); background: var(--uied-color-surface);
    box-shadow: 0 -4px 20px rgb(16 24 40 / 5%);
  }
  .image-results__footer--docked .image-summary { flex: 1; min-width: 0; gap: 2px; font-size: 11px; }
  .image-results__footer--docked .image-summary strong { font-size: 15px; }
  .image-results__footer--docked .image-summary__sizes { display: none; }
  .image-results__footer--docked .image-action { width: auto; min-width: 124px; min-height: 48px; padding-inline: 16px; }
  :global(body:has(.image-results__footer--docked)) { padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px)); }
  :global(body:has(.el-image-viewer__wrapper) .image-results__footer--docked) { visibility: hidden; }
}
</style>
