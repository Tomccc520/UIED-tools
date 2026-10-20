<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 -->
<template>
  <div class="gif-mobile-page min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="gif-mobile-workspace bg-white rounded-xl p-6 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h1 class="text-3xl md:text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <span class="relative px-4 md:px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ $ensureFreeToolTitle(info.title) }}</span>
            </span>
          </h1>
          <p class="gif-desktop-description text-gray-500 text-sm mt-4 max-w-2xl mx-auto">{{ info.subtitle }}</p>
          <router-link to="/tools/video/gif" class="inline-flex mt-3 text-sm text-brand hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">需要把视频转成 GIF？前往视频转 GIF</router-link>
        </div>

        <!-- 主要操作区域 -->
        <div class="space-y-8">
          <!-- 上传区域 -->
          <transition name="fade" mode="out-in">
            <div v-if="!file"
              class="gif-upload relative border-2 border-dashed rounded-xl min-h-[320px] flex flex-col items-center justify-center transition-all duration-300 bg-gray-50/50 group cursor-pointer hover:border-brand hover:bg-brand-soft/30 hover:shadow-md"
              :class="isDragging ? 'border-brand bg-brand-soft scale-[1.01]' : 'border-gray-300'"
              @click="triggerFileInput" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop" role="button" tabindex="0" aria-label="上传GIF文件区域，点击或拖拽文件至此"
              @keydown.enter="triggerFileInput" @keydown.space.prevent="triggerFileInput">
              <input type="file" ref="fileInput" class="hidden" accept="image/gif" @change="handleFileChange" />
              <div class="text-center px-4 transform transition-transform duration-300 group-hover:scale-105">
                <div
                  class="w-24 h-24 mb-6 mx-auto bg-white rounded-full shadow-sm flex items-center justify-center text-brand group-hover:text-brand-hover transition-colors">
                  <el-icon :size="48">
                    <UploadFilled />
                  </el-icon>
                </div>
                <h3 class="text-xl md:text-2xl font-bold text-gray-800 mb-3">点击或拖拽 GIF 文件到这里</h3>
                <p class="text-gray-500 text-sm mb-2">支持最大 50MB 的 GIF 文件</p>
                <div class="flex items-center justify-center gap-2 text-gray-400 text-xs mt-4">
                  <el-icon>
                    <Lock />
                  </el-icon>
                  <span>所有处理均在本地完成，保护您的隐私安全</span>
                </div>
              </div>
            </div>

            <!-- 编辑预览区域 -->
            <div v-else class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <!-- 顶部工具栏 -->
              <div
                class="gif-toolbar flex flex-wrap items-center justify-between gap-4 p-4 md:p-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
                <div class="gif-toolbar__source flex items-center gap-4 flex-1 min-w-0">
                  <el-button @click="reset" :disabled="isProcessing" size="large"
                    class="!h-10 !px-4 md:!px-6 hover:!scale-105 transition-transform" icon="ArrowLeft"
                    plain>重新上传</el-button>
                  <div
                    class="gif-toolbar__file flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm hidden md:flex">
                    <el-icon class="text-brand">
                      <Document />
                    </el-icon>
                    <span class="font-medium max-w-[200px] truncate" :title="file.name">{{ file.name }}</span>
                  </div>
                </div>
                <div class="gif-toolbar__actions flex items-center gap-3">
                  <el-button type="primary" size="large" class="!h-10 !px-6 md:!px-8 shadow-sm transition-all"
                    @click="startCompression" :loading="isProcessing" :disabled="isProcessing || isLoadingFile">
                    {{ isProcessing ? '正在压缩...' : '开始压缩' }}
                  </el-button>
                  <el-button v-if="compressedSrc && !isProcessing" type="success" size="large"
                    class="!h-10 !px-6 shadow-sm transition-all animate-fade-in" @click="downloadFile" icon="Download">
                    {{ keptOriginal ? '下载原图' : '下载' }}
                  </el-button>
                  <el-button v-if="isProcessing" plain @click="cancelCompression">取消压缩</el-button>
                </div>
              </div>

              <div class="p-4 md:p-8">
                <div class="gif-mobile-editor grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <!-- 左侧：设置面板 -->
                  <div class="lg:col-span-4 space-y-6">
                    <div class="gif-settings bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm" :class="{ 'gif-settings--expanded': mobileSettingsExpanded }">
                      <h3
                        class="gif-settings-heading font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg border-b border-gray-200 pb-4">
                        <span class="gif-settings-desktop-title"><el-icon class="text-brand"><Setting /></el-icon> 压缩参数设置</span>
                        <button type="button" class="gif-settings-toggle" :aria-expanded="mobileSettingsExpanded" aria-controls="gif-settings-controls" @click="mobileSettingsExpanded = !mobileSettingsExpanded">
                          <span>压缩参数设置</span><span>{{ mobileSettingsExpanded ? '收起' : '展开' }} <span aria-hidden="true">{{ mobileSettingsExpanded ? '⌃' : '⌄' }}</span></span>
                        </button>
                      </h3>
                      <p class="gif-settings-summary"><span>GIF · {{ preserveQuality ? '画质优先，非无损编码' : '自定义压缩' }}</span><span>{{ options.scale === 1 ? '保持原尺寸' : `尺寸 ${Math.round(options.scale * 100)}%` }} · {{ options.fpsReduction === 1 ? '保留全帧' : `每 ${options.fpsReduction} 帧取一帧` }} · {{ options.colors }} 色</span></p>
                      <div id="gif-settings-controls" class="gif-settings-body">

                      <!-- 画质保护模式 -->
                      <div class="gif-quality-card mb-6 rounded-xl border border-brand-border bg-gradient-to-r from-brand-soft via-white to-brand-soft p-4">
                        <div class="gif-quality-card__header flex items-start justify-between gap-3">
                          <div class="gif-quality-card__copy">
                            <p class="text-sm font-semibold text-gray-900">画质保护模式</p>
                            <p class="gif-quality-card__description text-xs text-gray-500 mt-1">开启后默认保留原尺寸和全帧并合并重复画面；重新编码可能改变颜色，不代表无损。</p>
                          </div>
                          <el-switch class="gif-quality-card__switch" v-model="preserveQuality" :disabled="isProcessing" @change="handlePreserveQualityChange" />
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                          <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                            :class="preserveQuality ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                            {{ preserveQuality ? '当前：画质优先' : '当前：自定义压缩' }}
                          </span>
                          <span class="px-2.5 py-1 rounded-full text-xs text-brand-hover bg-brand/10">建议先尝试画质优先，再按需降低参数</span>
                        </div>
                      </div>

                      <!-- 压缩预设 -->
                      <div class="gif-settings-group mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">压缩策略预设</span>
                          <span class="text-xs text-gray-400">可在下方继续微调</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <button
                            v-for="(preset, key) in compressionPresets"
                            :key="key"
                            type="button"
                            :disabled="isProcessing"
                            class="rounded-lg px-3 py-2 text-left transition-all border"
                            :class="activePreset === key
                              ? 'bg-brand text-white border-brand shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-border hover:text-brand'"
                            @click="applyCompressionPreset(key)"
                          >
                            <p class="text-sm font-medium leading-none">{{ preset.label }}</p>
                            <p class="text-[11px] mt-1 opacity-80">{{ preset.desc }}</p>
                          </button>
                        </div>
                      </div>

                      <!-- 尺寸设置 (Scale & Input) -->
                      <div class="gif-settings-group mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium flex items-center gap-1">
                            尺寸调整
                            <el-tooltip content="缩小尺寸能显著减少文件体积" placement="top">
                              <el-icon class="text-gray-400 cursor-help text-xs">
                                <InfoFilled />
                              </el-icon>
                            </el-tooltip>
                          </span>
                          <span class="text-brand font-bold bg-brand-soft px-2 py-0.5 rounded text-xs">{{
                            Math.round(options.scale * 100) }}%</span>
                        </div>
                        <el-slider v-model="options.scale" :min="0.1" :max="1" :step="0.05" show-stops
                          @input="handleScaleChange" :disabled="preserveQuality || isProcessing" />

                        <div class="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">宽度 (px)</label>
                            <el-input-number v-model="customDimensions.width" :min="1" :max="Math.max(originalDimensions.width, 1)"
                              size="small" class="!w-full" @change="handleDimensionChange('width')" :controls="false"
                              :disabled="preserveQuality || isProcessing" />
                          </div>
                          <div>
                            <label class="text-xs text-gray-500 mb-1 block">高度 (px)</label>
                            <el-input-number v-model="customDimensions.height" :min="1" :max="Math.max(originalDimensions.height, 1)"
                              size="small" class="!w-full" @change="handleDimensionChange('height')"
                              :controls="false" :disabled="preserveQuality || isProcessing" />
                          </div>
                        </div>
                        <p v-if="preserveQuality" class="text-xs text-green-600 mt-2">画质保护模式下已锁定为原始尺寸。</p>
                      </div>

                      <!-- 色彩与抖动 -->
                      <div class="gif-settings-group mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">色彩与画质</span>
                        </div>
                        <div class="space-y-4">
                          <div>
                            <div class="text-xs text-gray-500 mb-1.5">色彩数量</div>
                            <el-select v-model="options.colors" class="w-full" :disabled="preserveQuality || isProcessing">
                              <el-option label="256 色（颜色优先）" :value="256" />
                              <el-option label="128 色" :value="128" />
                              <el-option label="64 色" :value="64" />
                              <el-option label="32 色" :value="32" />
                              <el-option label="16 色" :value="16" />
                              <el-option label="8 色" :value="8" />
                            </el-select>
                          </div>

                          <div>
                            <div class="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                              抖动算法 (Dithering)
                              <el-tooltip content="抖动可以平滑色彩过渡，但可能会增加噪点和文件体积" placement="top">
                                <el-icon class="text-gray-400 cursor-help text-xs">
                                  <InfoFilled />
                                </el-icon>
                              </el-tooltip>
                            </div>
                            <el-select v-model="options.dither" class="w-full" :disabled="preserveQuality || isProcessing">
                              <el-option label="无抖动 (文件最小)" :value="false" />
                              <el-option label="Floyd-Steinberg" value="FloydSteinberg" />
                              <el-option label="False Floyd-Steinberg" value="FalseFloydSteinberg" />
                              <el-option label="Stucki" value="Stucki" />
                              <el-option label="Atkinson" value="Atkinson" />
                            </el-select>
                          </div>
                        </div>
                      </div>

                      <!-- 帧率优化 -->
                      <div class="gif-settings-group mb-8">
                        <div class="flex justify-between items-center mb-3">
                          <span class="text-gray-700 font-medium">抽帧处理</span>
                          <span class="text-brand font-bold text-xs bg-brand-soft px-2 py-0.5 rounded">
                            {{ options.fpsReduction === 1 ? '保留全帧' : `1/${options.fpsReduction} 帧` }}
                          </span>
                        </div>
                        <el-slider v-model="options.fpsReduction" :min="1" :max="5" :step="1" show-stops
                          :marks="{ 1: '原', 3: '中', 5: '高' }" :disabled="preserveQuality || isProcessing" />
                        <div class="text-xs text-gray-400 mt-2">值越高丢弃的帧越多，体积越小但动画越卡顿</div>
                        <div v-if="preserveQuality" class="text-xs text-green-600 mt-2">画质保护模式下已锁定全帧输出。</div>
                      </div>

                      <!-- 质量参数 -->
                      <div class="gif-settings-group mb-2">
                        <div class="flex justify-between items-center mb-2">
                          <span class="text-gray-700 font-medium">压缩质量 (Quality)</span>
                          <span class="text-brand font-bold">{{ options.quality }}</span>
                        </div>
                        <el-slider v-model="options.quality" :min="1" :max="30" :step="1" :disabled="preserveQuality || isProcessing" />
                        <div class="text-xs text-gray-400 mt-1">1 (最佳画质/最慢) - 30 (最低画质/最快)</div>
                      </div>
                      <p class="gif-settings-note">修改参数后需要重新压缩。透明背景 GIF 暂保留原图，不应用自定义参数。</p>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧：预览区域 -->
                  <div class="gif-preview-section lg:col-span-8">
                    <div class="gif-preview-tabs" role="group" aria-label="GIF 预览对比">
                      <button type="button" :aria-pressed="mobilePreviewSide === 'original'" @click="mobilePreviewSide = 'original'">原图</button>
                      <button type="button" :aria-pressed="mobilePreviewSide === 'compressed'" :disabled="!compressedSrc || isProcessing" @click="mobilePreviewSide = 'compressed'">压缩后</button>
                    </div>
                    <div v-if="isProcessing" class="gif-mobile-progress" role="status" aria-live="polite"><strong>正在压缩 {{ progress }}%</strong><progress :value="progress" max="100" aria-label="GIF 压缩进度"></progress><span>{{ processingStage || '正在准备压缩…' }}</span></div>
                    <div class="gif-mobile-previews grid grid-cols-1 md:grid-cols-2 gap-6 h-full" :class="`gif-mobile-previews--${mobilePreviewSide}`">
                      <!-- 原始图片 -->
                      <div class="gif-preview-original flex flex-col h-full">
                        <div
                          class="text-sm font-medium text-gray-500 text-center mb-3 flex flex-col items-center justify-center gap-1">
                          <div>原始图片</div>
                          <div class="gif-mobile-preview-meta flex items-center gap-2 text-xs">
                            <span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{ originalDimensions.width
                            }}x{{ originalDimensions.height }}</span>
                            <span v-if="originalSize > 0" class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{{
                              formatSize(originalSize) }}</span>
                          </div>
                        </div>
                        <div
                          class="gif-mobile-preview-canvas bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center flex-1 min-h-[300px] relative group p-4">
                          <div class="absolute inset-0 opacity-10 pointer-events-none"
                            style="background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px;">
                          </div> <!-- 透明背景纹理 -->
                          <el-image :src="originalSrc" class="max-w-full max-h-[400px] rounded-lg z-0"
                            :preview-src-list="[originalSrc]" preview-teleported :alt="`原图 ${file.name}`" fit="contain">
                            <template #error>
                              <div class="flex flex-col items-center justify-center text-gray-400">
                                <el-icon :size="30">
                                  <Picture />
                                </el-icon>
                                <span class="mt-2 text-xs">加载失败</span>
                              </div>
                            </template>
                          </el-image>
                        </div>
                      </div>

                      <!-- 压缩后图片 -->
                      <div class="gif-preview-compressed flex flex-col h-full">
                        <div
                          class="text-sm font-medium text-gray-500 text-center mb-3 flex flex-col items-center justify-center gap-1">
                          <div>压缩预览</div>
                          <div class="gif-mobile-preview-meta flex items-center gap-2 text-xs" v-if="compressedSrc">
                            <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">{{
                              outputDimensions.width
                            }}x{{ outputDimensions.height }}</span>
                            <span class="bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">{{
                              formatSize(compressedSize)
                            }}</span>
                            <span class="bg-green-500 text-white px-2 py-0.5 rounded font-bold">{{ keptOriginal ? '保留原图' : `节省 ${calculateReduction()}%` }}</span>
                            <span class="bg-brand-soft text-brand px-2 py-0.5 rounded border border-brand-border">帧 {{
                              compressionStats.encodedFrames
                            }}/{{ compressionStats.decodedFrames }}</span>
                          </div>
                        </div>
                        <div
                          class="gif-mobile-preview-canvas bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center flex-1 min-h-[300px] relative p-4"
                          :class="{ 'bg-brand-soft/30 border-brand-border': isProcessing, 'border-green-200 bg-green-50/10': compressedSrc }">

                          <!-- 加载状态 -->
                          <div v-if="isProcessing" class="flex flex-col items-center justify-center w-full h-full z-10">
                            <div class="relative">
                              <el-progress type="circle" :percentage="progress" :width="80" :stroke-width="6"
                                color="var(--uied-color-primary)" />
                              <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-xs font-bold text-brand">{{ progress }}%</span>
                              </div>
                            </div>
                            <p class="text-brand mt-4 text-sm font-medium animate-pulse">{{ processingStage || '正在智能压缩每一帧...' }}</p>
                            <p class="text-gray-400 text-xs mt-1">大文件可能需要几秒钟，请耐心等待</p>
                          </div>

                          <!-- 结果展示 -->
                          <template v-else-if="compressedSrc">
                            <el-image :src="compressedSrc"
                              class="max-w-full max-h-[400px] rounded-lg z-0 cursor-zoom-in"
                              :preview-src-list="[compressedSrc]" preview-teleported :alt="`压缩后 ${file.name}`" fit="contain" />
                          </template>

                          <!-- 空状态 -->
                          <div v-else class="text-center">
                            <div
                              class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                              <el-icon :size="32">
                                <MagicStick />
                              </el-icon>
                            </div>
                            <p class="text-gray-400 text-sm">点击"开始压缩"查看效果</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-if="errorMessage" role="alert" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{{ errorMessage }}，可调整参数后重新压缩或重新上传。</p>
                <p v-if="resultMessage" role="status" class="mt-4 rounded-lg border border-brand-border bg-brand-soft p-3 text-sm text-brand-hover">{{ resultMessage }}</p>
                <div v-if="compressionStats.decodedFrames > 0"
                  class="mt-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">解析帧数：{{ compressionStats.decodedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">输出帧数：{{ compressionStats.encodedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">合并重复帧：{{ compressionStats.mergedFrames }}</span>
                  <span class="px-2 py-1 rounded bg-white border border-gray-200">模式：{{ compressionStats.modeLabel || '未开始' }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <details class="gif-help" :open="!isMobileViewport">
          <summary>使用说明与常见问题<span aria-hidden="true">⌄</span></summary>
        <!-- 功能说明 -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div v-for="(feature, index) in features" :key="index"
            class="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 border border-gray-100">
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand font-bold">
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="font-bold text-gray-900 mb-1">{{ feature.title }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-8 bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-4">常见问题</h3>
          <div class="space-y-4">
            <div v-for="(item, index) in faq" :key="index"
              class="pb-4 last:pb-0 border-b border-gray-200 last:border-0">
              <h4 class="font-medium text-gray-900 mb-2">{{ item.q }}</h4>
              <p class="text-sm text-gray-600">{{ item.a }}</p>
            </div>
          </div>
        </div>
        </details>

        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
    <MobileToolActions v-if="file" aria-label="GIF 压缩操作" :title="mobileActionTitle" :description="mobileActionDescription"
      :action-label="isProcessing ? '正在压缩…' : compressedSrc ? (keptOriginal ? '下载原图' : '下载 GIF') : '开始压缩'"
      :disabled="isLoadingFile || (!compressedSrc && (!customDimensions.width || !customDimensions.height))"
      :busy="isProcessing" cancel-label="取消" @action="handleMobileAction" @cancel="cancelCompression" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch, onUnmounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { UploadFilled, Setting, ArrowLeft, Download, Document, Picture, MagicStick, InfoFilled, Lock } from '@element-plus/icons-vue'
import {
  ElMessage,
  ElIcon,
  ElButton,
  ElTooltip,
  ElSwitch,
  ElSlider,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElProgress,
  ElImage
} from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import MobileToolActions from '@/components/Common/MobileToolActions.vue'
import { ensureGifRuntime } from '@/utils/toolRuntimeLoaders'
import {
  appendGifTimelineFrame, createGifFrameComposer, disposeGifEncoder, getGifRepeat,
  renderGifWithTimeout, splitGifTimelineDelays, validateGifMemoryBudget,
  GIF_ENCODING_TIMEOUT_MS, type GifFrame, type GifMetadata, type GifTimelineFrame
} from '@/utils/gifCompression'

const route = useRoute()
const info = {
  title: "免费在线 GIF 动图压缩工具",
  subtitle: "专业级 GIF 压缩方案，支持帧率调整、色彩优化与尺寸缩放，纯本地处理保护隐私"
}

const features = [
  { title: '画质优先模式', desc: '默认保留原尺寸和全帧；重新编码并非逐像素无损' },
  { title: '逐帧智能压缩', desc: '支持帧合成与 disposal 还原，并自动合并重复帧减少体积' },
  { title: '灵活参数调节', desc: '支持自定义尺寸、色彩数量、抖动算法和抽帧策略' },
  { title: '安全本地处理', desc: '所有压缩过程在浏览器本地完成，保护数据安全' }
]

const faq = [
  { q: '为什么压缩后变模糊了？', a: '减少色彩数量、尺寸或抽帧都会带来画质损失。建议先开启“画质保护模式”再压缩。' },
  { q: '支持多大的文件？', a: '单个 GIF 不超过 50MB；为保护浏览器内存，画布宽×高×帧数不超过 3200 万。透明背景 GIF 暂保留原图，不应用自定义压缩参数。' },
  { q: '压缩需要多久？', a: '取决于文件大小和电脑性能，通常只需几秒钟。' },
  { q: '为什么有时“压缩后更大”？', a: '某些原图已经高度优化，重复编码可能变大。工具会自动保留原图，避免负优化。' }
]

// 状态变量
const file = ref<File | null>(null)
const originalSrc = ref('')
const compressedSrc = ref('')
const isDragging = ref(false)
const isProcessing = ref(false)
const progress = ref(0)
const fileInput = ref<HTMLInputElement | null>(null)
const originalSize = ref(0)
const compressedSize = ref(0)
const originalDimensions = reactive({ width: 0, height: 0 })
const customDimensions = reactive({ width: 0, height: 0 })
const MAX_GIF_FILE_SIZE = 50 * 1024 * 1024
const isLoadingFile = ref(false)
const errorMessage = ref('')
const resultMessage = ref('')
const keptOriginal = ref(false)
const outputDimensions = reactive({ width: 0, height: 0 })
const isMobileViewport = useMediaQuery('(max-width: 640px)')
const mobileSettingsExpanded = ref(false)
const mobilePreviewSide = ref<'original' | 'compressed'>('original')
let disposed = false
let previewGeneration = 0
let previewImage: HTMLImageElement | null = null
let taskController: AbortController | null = null

// 压缩选项
const options = reactive({
  scale: 1,
  colors: 256,
  fpsReduction: 1,
  quality: 1,
  dither: false as boolean | string
})

const compressionPresets = {
  quality: {
    label: '画质优先',
    desc: '保画质',
    scale: 1,
    colors: 256,
    fpsReduction: 1,
    quality: 1,
    dither: false as boolean | string,
    preserveQuality: true
  },
  balanced: {
    label: '平衡',
    desc: '体积/画质',
    scale: 1,
    colors: 128,
    fpsReduction: 1,
    quality: 8,
    dither: 'FalseFloydSteinberg' as boolean | string,
    preserveQuality: false
  },
  strong: {
    label: '高压缩',
    desc: '明显减小',
    scale: 0.85,
    colors: 64,
    fpsReduction: 2,
    quality: 12,
    dither: false as boolean | string,
    preserveQuality: false
  },
  extreme: {
    label: '极限',
    desc: '体积优先',
    scale: 0.7,
    colors: 32,
    fpsReduction: 3,
    quality: 18,
    dither: false as boolean | string,
    preserveQuality: false
  }
} as const

const activePreset = ref<keyof typeof compressionPresets>('quality')
const preserveQuality = ref(true)
const processingStage = ref('')

const compressionStats = reactive({
  decodedFrames: 0,
  encodedFrames: 0,
  mergedFrames: 0,
  modeLabel: ''
})

/** 底部操作栏只显示当前任务状态，不把透明回退或原图保留描述成成功压缩。 */
const mobileActionTitle = computed(() => isProcessing.value ? `正在压缩 ${progress.value}%`
  : errorMessage.value ? '压缩未完成' : compressedSrc.value ? (keptOriginal.value ? '已保留原图' : '压缩完成') : 'GIF 已选择')

/** 用真实文件体积和当前阶段提供简短操作提示，避免手机操作栏被长文案撑高。 */
const mobileActionDescription = computed(() => isProcessing.value ? processingStage.value
  : isLoadingFile.value ? '正在读取图片信息' : compressedSrc.value ? `${formatSize(originalSize.value)} → ${formatSize(compressedSize.value)}`
    : errorMessage.value ? '请调整参数后重试，或重新上传' : '在本地压缩，不上传文件')

/** 新结果完成时选择压缩后大图，重置或失败后回到原图，保持单一预览状态。 */
watch(compressedSrc, (url) => { mobilePreviewSide.value = url ? 'compressed' : 'original' })

/** 重新选择文件时收起手机参数，并从原图开始查看。 */
watch(file, () => { mobileSettingsExpanded.value = false; mobilePreviewSide.value = 'original' })

/** 参数变化后撤销旧结果，防止手机底部直接下载到未应用新设置的 GIF。 */
watch(() => [options.scale, options.colors, options.fpsReduction, options.quality, options.dither,
  preserveQuality.value, customDimensions.width, customDimensions.height], () => {
  if (isProcessing.value || !compressedSrc.value) return
  if (compressedSrc.value !== originalSrc.value) revokeObjectUrl(compressedSrc.value)
  compressedSrc.value = ''
  compressedSize.value = 0
  keptOriginal.value = false
  outputDimensions.width = outputDimensions.height = 0
  compressionStats.decodedFrames = compressionStats.encodedFrames = compressionStats.mergedFrames = 0
  compressionStats.modeLabel = ''
  resultMessage.value = '参数已修改，请重新压缩后预览和下载。'
})

/** 手机主操作复用已有压缩和下载流程，有可用结果时下载，否则开始压缩。 */
const handleMobileAction = async () => {
  if (isProcessing.value || isLoadingFile.value) return
  if (compressedSrc.value) downloadFile()
  else await startCompression()
}

/**
 * 按缩放比例更新尺寸
 * @description 统一维护 scale 与自定义宽高，避免多处重复计算
 * @param scale 缩放比例
 */
const updateDimensionsByScale = (scale: number) => {
  options.scale = Number(scale.toFixed(2))
  if (!originalDimensions.width || !originalDimensions.height) return
  customDimensions.width = Math.max(1, Math.round(originalDimensions.width * options.scale))
  customDimensions.height = Math.max(1, Math.round(originalDimensions.height * options.scale))
}

/**
 * 应用压缩预设
 * @description 一键切换压缩参数组合，用户仍可继续手动微调
 * @param preset 预设名称
 */
const applyCompressionPreset = (preset: keyof typeof compressionPresets | string) => {
  if (isProcessing.value) return
  const normalizedPreset = (preset in compressionPresets ? preset : 'balanced') as keyof typeof compressionPresets
  activePreset.value = normalizedPreset
  const target = compressionPresets[normalizedPreset]
  preserveQuality.value = target.preserveQuality
  updateDimensionsByScale(target.scale)
  options.colors = target.colors
  options.fpsReduction = target.fpsReduction
  options.quality = target.quality
  options.dither = target.dither
}

/**
 * 处理画质保护模式切换
 * @description 开启后切换到画质优先方案；关闭后切回平衡方案便于继续调参
 * @param enabled 是否启用画质保护
 */
const handlePreserveQualityChange = (enabled: boolean) => {
  applyCompressionPreset(enabled ? 'quality' : 'balanced')
}

// 默认应用画质优先，优先保证观感一致性
applyCompressionPreset(activePreset.value)

/**
 * 释放 blob URL 资源
 * @description 统一回收 URL.createObjectURL 创建的临时地址，避免内存泄漏
 * @param objectUrl blob URL
 */
const revokeObjectUrl = (objectUrl: string) => {
  if (objectUrl && objectUrl.startsWith('blob:')) {
    URL.revokeObjectURL(objectUrl)
  }
}

/**
 * 校验 GIF 文件
 * @description 校验文件格式与大小，防止不可用输入触发后续压缩异常
 * @param inputFile 用户上传文件
 * @returns 错误信息，空字符串表示校验通过
 */
const getGifFileError = (inputFile: File) => {
  if (inputFile.type !== 'image/gif' && !inputFile.name.toLowerCase().endsWith('.gif')) {
    return '请上传 GIF 格式文件'
  }
  if (inputFile.size > MAX_GIF_FILE_SIZE) {
    return 'GIF 文件不能超过 50MB'
  }
  return ''
}

/**
 * 获取 GIF 编码 worker 数量
 * @description 根据设备并发能力动态分配 worker，兼顾性能与资源占用
 * @returns worker 数量
 */
const getGifWorkerCount = () => {
  const concurrency = navigator.hardwareConcurrency || 4
  return Math.min(4, Math.max(2, Math.floor(concurrency / 2)))
}

/**
 * 计算 RGB 三通道的量化位数
 * @description 将目标颜色数映射为 r/g/b 位深组合，确保总颜色数不超过用户设置
 * @param maxColors 目标最大颜色数
 * @returns RGB 三通道量化位数
 */
const getRgbQuantizeBits = (maxColors: number) => {
  const safeColors = Math.min(256, Math.max(8, Math.round(maxColors)))
  const totalBits = Math.max(3, Math.floor(Math.log2(safeColors)))
  const baseBits = Math.floor(totalBits / 3)
  const remainder = totalBits % 3
  return {
    rBits: baseBits + (remainder > 0 ? 1 : 0),
    gBits: baseBits + (remainder > 1 ? 1 : 0),
    bBits: baseBits
  }
}

/**
 * 将单通道值映射到指定位深
 * @description 通过均匀量化压缩颜色空间，降低编码复杂度与最终体积
 * @param value 原始通道值
 * @param bits 通道位深
 * @returns 量化后的通道值
 */
const quantizeColorChannel = (value: number, bits: number) => {
  if (bits >= 8) return value
  const levels = (1 << bits) - 1
  const normalized = Math.round((value / 255) * levels)
  return Math.round((normalized / levels) * 255)
}

/**
 * 对当前画布进行颜色量化
 * @description 真正消费“色彩数量”参数，按帧降色后再进入 GIF 编码
 * @param ctx 目标画布上下文
 * @param width 画布宽度
 * @param height 画布高度
 * @param maxColors 目标最大颜色数
 */
const applyColorQuantization = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  maxColors: number
) => {
  if (maxColors >= 256 || width <= 0 || height <= 0) return
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const { rBits, gBits, bBits } = getRgbQuantizeBits(maxColors)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = quantizeColorChannel(data[i], rBits)
    data[i + 1] = quantizeColorChannel(data[i + 1], gBits)
    data[i + 2] = quantizeColorChannel(data[i + 2], bBits)
  }
  ctx.putImageData(imageData, 0, 0)
}

/**
 * 主线程让渡
 * @description 分帧处理时主动让出控制权，减少长任务造成的页面卡顿
 */
const yieldToMainThread = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

/**
 * 处理缩放比例变化
 * @param val 新的缩放比例 (0-1)
 */
const handleScaleChange = (val: any) => {
  if (isProcessing.value) return
  updateDimensionsByScale(Number(val))
}

/**
 * 处理自定义尺寸输入变化
 * 根据输入的一边自动计算另一边，保持宽高比，并更新 scale 值
 * @param type 变化的维度 'width' | 'height'
 */
const handleDimensionChange = (type: 'width' | 'height') => {
  if (isProcessing.value) return
  if (originalDimensions.width === 0 || originalDimensions.height === 0) return

  if (type === 'width') {
    const ratio = customDimensions.width / originalDimensions.width
    options.scale = Number(ratio.toFixed(2))
    customDimensions.height = Math.max(1, Math.round(originalDimensions.height * ratio))
  } else {
    const ratio = customDimensions.height / originalDimensions.height
    options.scale = Number(ratio.toFixed(2))
    customDimensions.width = Math.max(1, Math.round(originalDimensions.width * ratio))
  }
}

/**
 * 触发隐藏的文件输入框点击事件
 */
const triggerFileInput = () => {
  if (isProcessing.value) return
  fileInput.value?.click()
}

/**
 * 处理文件拖拽上传
 * @param e 拖拽事件对象
 */
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFile = e.dataTransfer?.files[0]
  if (droppedFile) {
    processFile(droppedFile)
  } else {
    ElMessage.warning('请上传 GIF 格式的文件')
  }
}

/**
 * 处理文件输入框变更事件
 * @param e 事件对象
 */
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    processFile(input.files[0])
  }
  input.value = ''
}

/**
 * 处理文件加载与初始化
 * 读取文件信息，加载预览图，获取原始尺寸
 * @param f 上传的文件对象
 */
const processFile = (f: File) => {
  if (isProcessing.value || disposed) return
  const error = getGifFileError(f)
  if (error) {
    ElMessage.warning(error)
    return
  }

  // 释放上一次处理残留的 URL，避免频繁上传造成内存占用增长
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }

  const generation = ++previewGeneration
  isLoadingFile.value = true
  errorMessage.value = ''
  resultMessage.value = ''
  keptOriginal.value = false
  originalDimensions.width = originalDimensions.height = 0
  customDimensions.width = customDimensions.height = 0
  file.value = f
  originalSize.value = f.size
  originalSrc.value = URL.createObjectURL(f)
  compressedSrc.value = ''
  compressedSize.value = 0
  processingStage.value = ''
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = ''

  // 获取图片尺寸
  const img = new Image()
  previewImage = img
  img.onload = () => {
    if (disposed || generation !== previewGeneration) return
    isLoadingFile.value = false
    originalDimensions.width = img.width
    originalDimensions.height = img.height
    // 根据当前模式初始化参数，确保首次压缩行为可预期
    applyCompressionPreset(activePreset.value)
  }
  img.onerror = () => {
    if (disposed || generation !== previewGeneration) return
    isLoadingFile.value = false
    errorMessage.value = 'GIF 预览加载失败，文件可能损坏，请重新上传'
  }
  img.src = originalSrc.value
}

/**
 * 格式化文件大小显示
 * @param bytes 字节数
 * @returns 格式化后的字符串 (e.g. "1.5 MB")
 */
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 计算压缩体积减少百分比
 * @returns 减少的百分比整数
 */
const calculateReduction = () => {
  if (!originalSize.value || !compressedSize.value) return 0
  return Math.round(((originalSize.value - compressedSize.value) / originalSize.value) * 100)
}

/**
 * 重置所有状态，准备重新上传
 */
const reset = () => {
  if (isProcessing.value) return
  previewGeneration += 1
  if (previewImage) { previewImage.onload = null; previewImage.onerror = null; previewImage.src = '' }
  isLoadingFile.value = false
  errorMessage.value = ''
  resultMessage.value = ''
  keptOriginal.value = false
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }

  file.value = null
  originalSrc.value = ''
  compressedSrc.value = ''
  compressedSize.value = 0
  originalSize.value = 0
  originalDimensions.width = 0
  originalDimensions.height = 0
  customDimensions.width = 0
  customDimensions.height = 0
  processingStage.value = ''
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = ''
  applyCompressionPreset('quality')
  options.scale = 1
  isProcessing.value = false
  progress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

/**
 * 下载压缩后的 GIF 文件
 */
const downloadFile = () => {
  if (!compressedSrc.value || isProcessing.value) return
  const link = document.createElement('a')
  link.href = compressedSrc.value
  const sourceName = file.value?.name || 'image.gif'
  const safeName = sourceName.toLowerCase().endsWith('.gif') ? sourceName : `${sourceName}.gif`
  link.download = `uiedtool_${safeName}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** 取消当前压缩任务并停止 Worker，保留当前文件供用户重新调整。 */
const cancelCompression = () => {
  taskController?.abort()
}

/**
 * 开始 GIF 合成、时间轴优化与本地编码；所有选项在开始时快照，过期结果不写回页面。
 */
const startCompression = async () => {
  if (!file.value || isProcessing.value || isLoadingFile.value) return
  if (!customDimensions.width || !customDimensions.height) {
    ElMessage.warning('请等待 GIF 预览加载完成后再压缩')
    return
  }
  const sourceFile = file.value
  const sourceUrl = originalSrc.value
  const settings = { ...options, preserveQuality: preserveQuality.value,
    width: customDimensions.width, height: customDimensions.height }
  const controller = new AbortController()
  taskController = controller
  let gifEncoder: Parameters<typeof renderGifWithTimeout>[0] | null = null
  let timedOut = false
  const deadline = setTimeout(() => { timedOut = true; controller.abort() }, GIF_ENCODING_TIMEOUT_MS)
  const canvases: HTMLCanvasElement[] = []
  isProcessing.value = true
  progress.value = 0
  errorMessage.value = ''
  resultMessage.value = ''
  keptOriginal.value = false
  if (compressedSrc.value && compressedSrc.value !== sourceUrl) revokeObjectUrl(compressedSrc.value)
  compressedSrc.value = ''
  compressedSize.value = 0
  processingStage.value = '正在解析 GIF 帧...'
  compressionStats.decodedFrames = 0
  compressionStats.encodedFrames = 0
  compressionStats.mergedFrames = 0
  compressionStats.modeLabel = settings.preserveQuality ? '画质优先' : '自定义压缩'

  /** 页面离开或取消时阻止后续解析、合成及结果写回。 */
  const checkTask = () => {
    if (disposed || controller.signal.aborted) throw new Error('GIF 压缩已取消')
  }

  /** 等待依赖或文件读取时响应取消，避免网络依赖卡住后仍无限显示压缩中。 */
  const awaitOperation = <T,>(operation: Promise<T>): Promise<T> => new Promise((resolve, reject) => {
    /** 将取消信号转换为可结算的 Promise 失败。 */
    const abort = () => { controller.signal.removeEventListener('abort', abort); reject(new Error('GIF 压缩已取消')) }
    if (controller.signal.aborted) { abort(); return }
    controller.signal.addEventListener('abort', abort, { once: true })
    operation.then((value) => { controller.signal.removeEventListener('abort', abort); resolve(value) },
      (error) => { controller.signal.removeEventListener('abort', abort); reject(error) })
  })

  /** 明确标注原图回退，不把未应用的自定义尺寸和帧数显示成压缩结果。 */
  const preserveSource = (message: string, frameCount: number) => {
    checkTask()
    compressedSrc.value = sourceUrl
    compressedSize.value = sourceFile.size
    keptOriginal.value = true
    outputDimensions.width = originalDimensions.width
    outputDimensions.height = originalDimensions.height
    compressionStats.encodedFrames = frameCount
    compressionStats.mergedFrames = 0
    progress.value = 100
    processingStage.value = '已保留原图，未应用压缩参数'
    resultMessage.value = message
    ElMessage.warning(message)
  }

  try {
    const { GIF: GIFEncoder, parseGIF, decompressFrames } = await awaitOperation(ensureGifRuntime())
    checkTask()
    const arrayBuffer = await awaitOperation(sourceFile.arrayBuffer())
    checkTask()
    const signature = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, Math.min(6, arrayBuffer.byteLength)))
    if (!['GIF87a', 'GIF89a'].includes(signature)) throw new Error('文件不是有效 GIF，请重新选择文件')
    let gif: GifMetadata
    let frames: GifFrame[]
    try { gif = parseGIF(arrayBuffer) as unknown as GifMetadata }
    catch { throw new Error('GIF 解析失败，文件可能已损坏，请重新选择文件') }
    validateGifMemoryBudget(gif)
    try { frames = decompressFrames(gif as any, true) as GifFrame[] }
    catch { throw new Error('GIF 动画帧解析失败，文件可能不完整，请重新上传') }
    if (!frames.length) throw new Error('未解析到可用 GIF 帧，请重新上传')
    compressionStats.decodedFrames = frames.length
    const composer = createGifFrameComposer(gif, frames[0])
    const timeline: GifTimelineFrame[] = []
    const canvas = document.createElement('canvas')
    const scaleCanvas = document.createElement('canvas')
    canvases.push(canvas, scaleCanvas)
    canvas.width = gif.lsd.width
    canvas.height = gif.lsd.height
    scaleCanvas.width = settings.width
    scaleCanvas.height = settings.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const scaleCtx = scaleCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx || !scaleCtx) throw new Error('当前浏览器不支持 GIF 画布，请使用新版浏览器')
    let mergedFrameCount = 0
    processingStage.value = '正在逐帧合成与分析...'

    for (let index = 0; index < frames.length; index++) {
      checkTask()
      const frame = frames[index]
      const pixels = composer.compose(frame)
      // gif.js 现有编码器会丢失 alpha；保留源文件，避免透明背景静默变黑或破坏动画。
      let hasTransparency = false
      for (let offset = 3; offset < pixels.length; offset += 4) {
        if (pixels[offset] < 255) { hasTransparency = true; break }
      }
      if (hasTransparency) {
        preserveSource('此 GIF 含透明背景，当前编码器暂不支持安全压缩；已保留原图，未应用自定义参数。', frames.length)
        return
      }
      if (index % settings.fpsReduction === 0) {
        ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels), canvas.width, canvas.height), 0, 0)
        scaleCtx.clearRect(0, 0, scaleCanvas.width, scaleCanvas.height)
        scaleCtx.drawImage(canvas, 0, 0, scaleCanvas.width, scaleCanvas.height)
        if (!settings.preserveQuality) applyColorQuantization(scaleCtx, scaleCanvas.width, scaleCanvas.height, settings.colors)
        const outputPixels = scaleCtx.getImageData(0, 0, scaleCanvas.width, scaleCanvas.height).data
        if (appendGifTimelineFrame(timeline, new Uint8ClampedArray(outputPixels), frame.delay, settings.preserveQuality)) mergedFrameCount++
      } else {
        appendGifTimelineFrame(timeline, null, frame.delay, false)
      }
      progress.value = Math.round(((index + 1) / frames.length) * 45)
      if (index % 3 === 0) await yieldToMainThread()
    }
    checkTask()
    const outputFrames = splitGifTimelineDelays(timeline)
    if (!outputFrames.length) throw new Error('没有可编码的 GIF 帧，请重新上传')
    const encoderOptions = {
      workers: getGifWorkerCount(), quality: settings.quality, width: settings.width, height: settings.height,
      workerScript: '/workers/gif.worker.js', dither: settings.dither, repeat: getGifRepeat(gif)
    }
    const encoder = new GIFEncoder(encoderOptions)
    gifEncoder = encoder
    for (const frame of outputFrames) {
      encoder.addFrame(new ImageData(new Uint8ClampedArray(frame.pixels), settings.width, settings.height), { delay: frame.delay })
    }
    compressionStats.encodedFrames = outputFrames.length
    compressionStats.mergedFrames = mergedFrameCount
    processingStage.value = '正在编码输出 GIF...'
    encoder.on('progress', (value: number) => {
      if (!disposed && !controller.signal.aborted) progress.value = 45 + Math.round(value * 55)
    })
    const resultBlob = await renderGifWithTimeout(encoder, controller.signal)
    checkTask()
    if (resultBlob.size >= sourceFile.size) {
      preserveSource('当前参数未减小体积，已保留原图，未应用自定义参数。可降低尺寸或色彩数量后重新压缩。', frames.length)
      return
    }
    compressedSrc.value = URL.createObjectURL(resultBlob)
    compressedSize.value = resultBlob.size
    outputDimensions.width = settings.width
    outputDimensions.height = settings.height
    progress.value = 100
    processingStage.value = '压缩完成'
    resultMessage.value = '压缩完成，已保留原动画总时长和循环次数。'
    ElMessage.success('压缩完成！')
  } catch (error) {
    if (!disposed) {
      if (timedOut) {
        errorMessage.value = 'GIF 压缩超时，请减小尺寸或缩短动画后重试'
        ElMessage.error(errorMessage.value)
      } else if (controller.signal.aborted) {
        resultMessage.value = '已取消压缩，可调整参数后重新开始。'
      } else {
        const message = error instanceof Error ? error.message : 'GIF 压缩失败，请重新上传文件后重试'
        console.error('[GIF 压缩] 处理失败', message)
        errorMessage.value = message
        ElMessage.error(message)
      }
      processingStage.value = ''
    }
  } finally {
    clearTimeout(deadline)
    if (gifEncoder) disposeGifEncoder(gifEncoder)
    for (const canvas of canvases) { canvas.width = 0; canvas.height = 0 }
    if (taskController === controller) taskController = null
    if (!disposed) isProcessing.value = false
  }
}

onUnmounted(() => {
  disposed = true
  previewGeneration += 1
  taskController?.abort()
  if (previewImage) { previewImage.onload = null; previewImage.onerror = null; previewImage.src = '' }
  if (compressedSrc.value && compressedSrc.value !== originalSrc.value) {
    revokeObjectUrl(compressedSrc.value)
  }
  if (originalSrc.value) {
    revokeObjectUrl(originalSrc.value)
  }
})
</script>

<style scoped>
.gif-settings-toggle,
.gif-settings-summary,
.gif-preview-tabs,
.gif-mobile-progress,
.gif-help > summary {
  display: none;
}

.gif-settings-desktop-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.gif-settings-note {
  margin-top: 16px;
  color: var(--uied-color-text-secondary, #667085);
  font-size: 12px;
  line-height: 1.7;
}

.gif-mobile-page {
  container: gif-mobile / inline-size;
  min-width: 0;
}

.gif-mobile-editor > * {
  min-width: 0;
}

@container gif-mobile (max-width: 780px) {
  .gif-mobile-editor {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .gif-mobile-editor > * {
    grid-column: 1 / -1;
  }
}

@container gif-mobile (max-width: 600px) {
  .gif-mobile-workspace {
    padding: 20px 12px;
  }

  .gif-mobile-workspace h1 {
    font-size: 24px;
    line-height: 1.4;
  }

  .gif-mobile-previews {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .gif-mobile-preview-meta {
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  .gif-mobile-preview-canvas {
    min-height: 180px;
    padding: 8px;
  }

  .gif-mobile-workspace :deep(.el-input__wrapper),
  .gif-mobile-workspace :deep(.el-select__wrapper) {
    min-height: 44px;
  }

  .gif-mobile-workspace :deep(.el-input-number) {
    height: 44px;
  }

  .gif-mobile-workspace a,
  .gif-mobile-workspace button {
    min-height: 44px;
    align-content: center;
  }
}

/* 小屏操作独占一行，避免按钮最小宽度与 Element Plus 默认相邻间距被父容器裁切。 */
@media (max-width: 767px) {
  .gif-toolbar {
    align-items: stretch;
  }

  .gif-toolbar__source,
  .gif-toolbar__actions {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
    align-items: stretch;
    min-width: 0;
    width: 100%;
    gap: 8px;
  }

  .gif-toolbar__source :deep(.el-button),
  .gif-toolbar__actions :deep(.el-button) {
    min-width: 0;
    width: 100%;
    height: 44px !important;
    margin-left: 0;
    padding-right: 12px !important;
    padding-left: 12px !important;
  }

  .gif-toolbar__file {
    display: flex;
    min-width: 0;
  }

  .gif-toolbar__file :deep(.el-icon) {
    flex-shrink: 0;
  }

  .gif-toolbar__file > span {
    max-width: 100%;
    white-space: normal;
    overflow-wrap: anywhere;
    overflow: visible;
  }

  .gif-settings,
  .gif-quality-card {
    padding: 12px;
  }

  .gif-quality-card__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }

  .gif-quality-card__copy {
    display: contents;
  }

  .gif-quality-card__description {
    grid-column: 1 / -1;
    grid-row: 2;
    margin-top: 0;
    line-height: 1.6;
  }

  .gif-quality-card__switch {
    grid-column: 2;
    grid-row: 1;
    flex-shrink: 0;
  }
}

/* 手机沿用图片压缩页的单张大图、参数摘要和底部主操作。 */
@media (max-width: 640px) {
  .gif-mobile-workspace {
    padding: 20px 12px;
  }

  .gif-desktop-description {
    display: none;
  }

  .gif-upload {
    min-height: 204px;
    padding: 16px 8px;
  }

  .gif-upload .w-24 {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }

  .gif-upload :deep(.el-icon) {
    font-size: 30px;
  }

  .gif-upload h3 {
    font-size: 18px;
    line-height: 1.5;
  }

  .gif-upload .text-xs {
    display: none;
  }

  .gif-toolbar {
    position: static;
    padding: 12px;
  }

  .gif-toolbar__source {
    flex-direction: row;
    gap: 8px;
  }

  .gif-toolbar__source :deep(.el-button) {
    width: auto;
    flex: 0 0 auto;
    padding-inline: 12px !important;
    font-size: 13px;
  }

  .gif-toolbar__file {
    flex: 1;
    padding: 8px;
  }

  .gif-toolbar__file > span {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 12px;
    line-height: 1.6;
  }

  .gif-toolbar__actions {
    display: none;
  }

  .gif-mobile-editor {
    gap: 16px;
  }

  .gif-settings {
    padding: 8px 12px 12px;
  }

  .gif-settings-heading {
    display: block;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .gif-settings-desktop-title {
    display: none;
  }

  .gif-settings-toggle {
    display: flex;
    min-height: 44px;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 0;
    background: transparent;
    color: var(--uied-color-text, #172033);
    font-size: 15px;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
  }

  .gif-settings-toggle > span:last-child {
    flex-shrink: 0;
    color: var(--uied-color-text-secondary, #667085);
    font-size: 12px;
    font-weight: 400;
  }

  .gif-settings-summary {
    display: grid;
    gap: 4px;
    margin-top: 4px;
    color: var(--uied-color-text-secondary, #667085);
    font-size: 13px;
    line-height: 1.7;
  }

  .gif-settings-body {
    display: none;
    margin-top: 16px;
    padding-top: 20px;
    border-top: 1px solid var(--uied-color-border, #e4e7ec);
  }

  .gif-settings--expanded .gif-settings-body {
    display: block;
  }

  .gif-settings-group + .gif-settings-group {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid var(--uied-color-border, #e4e7ec);
  }

  .gif-settings-group > .flex:first-child {
    flex-wrap: wrap;
    gap: 8px;
  }

  .gif-settings :deep(.el-slider) {
    --el-slider-button-size: 20px;
    --el-slider-button-wrapper-size: 44px;
    height: 44px;
  }

  .gif-settings :deep(.el-input__inner) {
    font-size: 16px;
  }

  .gif-preview-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
    margin-bottom: 12px;
    padding: 4px;
    border-radius: 8px;
    background: var(--uied-color-page, #f6f7fb);
  }

  .gif-preview-tabs button {
    min-height: 44px;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--uied-color-text-secondary, #667085);
    font-size: 14px;
    cursor: pointer;
  }

  .gif-preview-tabs button[aria-pressed='true'] {
    border-color: var(--uied-color-border, #e4e7ec);
    background: var(--uied-color-surface, #fff);
    color: var(--uied-color-primary);
    font-weight: 600;
  }

  .gif-preview-tabs button:disabled {
    opacity: .5;
    cursor: not-allowed;
  }

  .gif-mobile-previews {
    display: block;
    height: auto;
  }

  .gif-preview-original,
  .gif-preview-compressed {
    display: none;
  }

  .gif-mobile-previews--original .gif-preview-original,
  .gif-mobile-previews--compressed .gif-preview-compressed {
    display: flex;
  }

  .gif-mobile-preview-canvas {
    min-height: 0;
    height: clamp(180px, 64cqi, 280px);
    flex: 0 0 auto;
    padding: 12px;
  }

  .gif-mobile-preview-canvas :deep(.el-image) {
    width: 100%;
    height: 100%;
  }

  .gif-mobile-preview-canvas :deep(.el-image__inner) {
    object-fit: contain;
  }

  .gif-mobile-progress {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--uied-color-primary-soft);
    color: var(--uied-color-text-secondary, #667085);
    font-size: 13px;
    line-height: 1.6;
  }

  .gif-mobile-progress progress {
    width: 100%;
    height: 8px;
    accent-color: var(--uied-color-primary);
  }

  .gif-help {
    margin-top: 20px;
    border-top: 1px solid var(--uied-color-border, #e4e7ec);
  }

  .gif-help > summary {
    display: flex;
    min-height: 52px;
    align-items: center;
    justify-content: space-between;
    list-style: none;
    color: var(--uied-color-text, #172033);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .gif-help > summary::-webkit-details-marker {
    display: none;
  }

  .gif-help > .mt-8 {
    margin-top: 16px;
  }

  .gif-help > .p-6 {
    padding: 16px 12px;
  }

  .gif-settings-toggle:focus-visible,
  .gif-preview-tabs button:focus-visible,
  .gif-help > summary:focus-visible {
    outline: 2px solid var(--uied-color-primary);
    outline-offset: 3px;
  }
}

:deep(.el-slider__runway) {
  margin: 16px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
