<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->

<template>
  <div class="matting-hub min-h-screen space-y-4">
    <section class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div class="hero px-6 py-7 md:px-8 md:py-9">
        <div class="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <div class="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs text-sky-700">
              <span class="inline-block h-1.5 w-1.5 rounded-full bg-sky-500" />
              AI 抠图工作台
            </div>
            <h1 class="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">{{ $ensureFreeToolTitle(info.title) }}</h1>
            <p class="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">{{ info.subtitle }}</p>
            <div class="mt-5 flex flex-wrap gap-2 text-xs text-slate-600">
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1">人物抠图</span>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1">通用万物抠图</span>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1">输出透明 PNG</span>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1">本地上传即用</span>
            </div>
          </div>

          <div class="grid gap-3 rounded-lg border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
            <div class="rounded-md border border-slate-200 bg-white px-3 py-2">
              <p class="text-xs text-slate-400">当前模式</p>
              <p class="mt-1 font-medium text-slate-800">{{ activeMode.title }}</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-white px-3 py-2">
              <p class="text-xs text-slate-400">推荐输入</p>
              <p class="mt-1 font-medium text-slate-800">JPG / PNG / WebP（≤10MB）</p>
            </div>
            <div class="rounded-md border border-slate-200 bg-white px-3 py-2">
              <p class="text-xs text-slate-400">结果格式</p>
              <p class="mt-1 font-medium text-slate-800">透明背景 PNG</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <div class="space-y-4">
          <div
            class="upload-zone relative rounded-xl border border-dashed p-6"
            :class="isDragging ? 'upload-zone--drag' : ''"
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleFileInputChange"
            />
            <div class="absolute inset-0 z-10 cursor-pointer" @click="triggerFileInput"></div>

            <div class="relative z-0 text-center">
              <div class="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600">
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
                </svg>
              </div>
              <p class="text-sm font-medium text-slate-700">点击或拖拽上传图片</p>
              <p class="mt-2 text-xs leading-6 text-slate-500">支持 JPG / PNG / WebP；建议主体边缘清晰，抠图效果更稳定</p>
            </div>
          </div>

          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-800">选择抠图模式</h3>
              <span class="text-xs text-slate-500">可随时切换</span>
            </div>
            <div class="space-y-3">
              <button
                v-for="mode in modeOptions"
                :key="mode.id"
                type="button"
                class="mode-card w-full"
                :class="selectedModeId === mode.id ? 'mode-card--active' : ''"
                @click="selectMode(mode.id)"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="text-sm font-semibold text-slate-800">{{ mode.title }}</span>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{{ mode.modelId }}</span>
                </div>
                <p class="mt-2 text-xs leading-6 text-slate-600">{{ mode.desc }}</p>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            <el-button type="primary" class="!h-10" :loading="isProcessing" @click="startMatting">
              {{ isProcessing ? 'AI 抠图处理中...' : `开始${activeMode.shortTitle}` }}
            </el-button>
            <el-button class="!h-10" :disabled="!currentImage" @click="resetCurrentImage">清空</el-button>
            <el-button class="!h-10" :disabled="!processedImageUrl" @click="downloadResult">下载 PNG</el-button>
          </div>

          <p class="text-xs leading-6 text-slate-500">{{ activeMode.runtimeHint }}</p>
        </div>

        <div class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ processedImageUrl ? '抠图前后对比' : '抠图预览区' }}
            </h3>
            <span class="text-xs text-slate-500">
              {{ processedImageUrl ? '拖动中线查看效果' : '抠图完成后自动开启对比滑块' }}
            </span>
          </div>

          <div class="compare-wrap">
            <template v-if="currentImage && !processedImageUrl">
              <img :src="currentImage" class="compare-image" alt="待抠图原图" />
              <div class="compare-preview-tip">
                <p>图片已上传，点击“开始{{ activeMode.shortTitle }}”后可进入前后对比。</p>
              </div>
            </template>

            <template v-else-if="currentImage && processedImageUrl">
              <img :src="currentImage" class="compare-image" alt="抠图前原图" />

              <div class="compare-after" :style="{ width: `${compareRatio}%` }">
                <div class="checker-bg"></div>
                <img :src="processedImageUrl" class="compare-image" alt="抠图后图片" />
              </div>

              <div class="compare-line" :style="{ left: `${compareRatio}%` }">
                <div class="compare-dot">↔</div>
              </div>

              <input
                v-model.number="compareRatio"
                type="range"
                min="0"
                max="100"
                step="1"
                class="compare-range"
              />
            </template>

            <div v-else class="compare-empty">
              <p>上传图片后会先在这里展示原图，抠图完成后自动切换到对比模式。</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <h3 class="text-lg font-semibold text-slate-900">AI 抠图工具矩阵</h3>
      <p class="mt-2 text-sm text-slate-500">按场景选择对应工具，入口新窗口打开，便于并行使用。</p>
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <router-link class="entry-card" to="/tools/ai/portrait-matting" target="_blank">
          <div class="entry-title">AI 人像抠图</div>
          <p class="entry-desc">固定人物模型，适合证件照、头像、半身照，发丝边缘更稳定。</p>
        </router-link>

        <router-link class="entry-card" to="/tools/photo/background" target="_blank">
          <div class="entry-title">AI 证件照换底色</div>
          <p class="entry-desc">先抠图再换底色，一次抠图可反复切换白底、蓝底、红底。</p>
        </router-link>

        <button type="button" class="entry-card" @click="selectMode('universal')">
          <div class="entry-title">AI 抠物体（通用）</div>
          <p class="entry-desc">针对商品、人物、动物、植物、汽车等主体，端到端输出透明 PNG。</p>
        </button>
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <h3 class="text-lg font-semibold text-slate-900">使用流程</h3>
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div v-for="(step, index) in steps" :key="step.title" class="step-card">
          <div class="step-index">0{{ index + 1 }}</div>
          <div class="step-title">{{ step.title }}</div>
          <p class="step-desc">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      <h3 class="text-lg font-semibold text-slate-900">常见问题</h3>
      <div class="mt-4 space-y-4">
        <div v-for="(item, index) in faq" :key="index" class="faq-item">
          <h4 class="text-sm font-semibold text-slate-800">{{ item.q }}</h4>
          <p class="mt-2 text-sm leading-7 text-slate-600">{{ item.a }}</p>
        </div>
      </div>
    </section>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { requestMattingImage, warmupMattingModelId } from '@/services/matting'

interface MattingModeOption {
  id: 'portrait' | 'universal'
  title: string
  shortTitle: string
  desc: string
  runtimeHint: string
  modelId: 'iic/cv_unet_image-matting' | 'iic/cv_unet_universal-matting'
}

interface MattingStep {
  title: string
  desc: string
}

const info = reactive({
  title: '免费 AI 抠图聚合工具',
  subtitle: '一个页面覆盖 AI 人像抠图与通用万物抠图，输出透明背景 PNG，适用于证件照、电商主图、海报合成等高频场景。'
})

const modeOptions: MattingModeOption[] = [
  {
    id: 'universal',
    title: 'AI 抠物体（通用）',
    shortTitle: 'AI 通用抠图',
    desc: '支持商品、人物、动物、植物、汽车等主体，无需额外提示词。',
    runtimeHint: '当前使用通用抠图模型，覆盖更广场景，适合复杂主体与多类素材。',
    modelId: 'iic/cv_unet_universal-matting'
  },
  {
    id: 'portrait',
    title: 'AI 人像抠图',
    shortTitle: 'AI 人像抠图',
    desc: '适合头像、证件照和人物半身图，发丝与肩部边缘更稳定。',
    runtimeHint: '当前使用人物专用模型，适合证件照、人像设计与社媒头像场景。',
    modelId: 'iic/cv_unet_image-matting'
  }
]

const steps: MattingStep[] = [
  { title: '上传图片', desc: '点击或拖拽上传 JPG/PNG/WebP 图片，单图不超过 10MB。' },
  { title: '选择模式', desc: '按场景选择“人像抠图”或“通用抠图”，可随时切换。' },
  { title: '开始处理', desc: '点击开始按钮调用 AI 抠图服务，输出透明背景 PNG。' },
  { title: '预览与下载', desc: '通过滑块查看前后差异，确认效果后下载结果图。' }
]

const faq = [
  {
    q: '在线抠图会影响画质吗？',
    a: '工具以保留主体清晰度为目标，输出透明 PNG。复杂边缘场景建议使用高分辨率原图。'
  },
  {
    q: '支持哪些图片格式？',
    a: '支持 JPG、PNG、WebP。若原图过小或过度压缩，可能影响边缘质量。'
  },
  {
    q: '上传图片会长期保存吗？',
    a: '当前页面不做业务持久化，处理完成后直接下载即可。'
  },
  {
    q: '人像和通用模式怎么选？',
    a: '人物主体优先选人像模式；商品、宠物、植物、车辆等复杂主体优先选通用模式。'
  }
]

const route = useRoute()
const selectedModeId = ref<MattingModeOption['id']>('universal')
const currentImage = ref('')
const processedImageUrl = ref('')
const isProcessing = ref(false)
const isDragging = ref(false)
const compareRatio = ref(50)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const currentImageObjectUrl = ref('')
const processedImageObjectUrl = ref('')

const activeMode = computed(() => {
  return modeOptions.find((item) => item.id === selectedModeId.value) || modeOptions[0]
})

/**
 * 函数说明：释放对象 URL，避免多次上传后内存累积
 */
const revokeObjectUrl = (url: string) => {
  if (!url) {
    return
  }
  URL.revokeObjectURL(url)
}

/**
 * 函数说明：重置当前图片与抠图结果，恢复初始状态
 */
const resetCurrentImage = () => {
  revokeObjectUrl(currentImageObjectUrl.value)
  revokeObjectUrl(processedImageObjectUrl.value)
  currentImageObjectUrl.value = ''
  processedImageObjectUrl.value = ''
  currentImage.value = ''
  processedImageUrl.value = ''
  selectedFile.value = null
  compareRatio.value = 50
}

/**
 * 函数说明：读取路由 query.mode，支持外链直接指定默认模式
 */
const syncModeFromRouteQuery = () => {
  const queryMode = String(route.query.mode || '').toLowerCase()
  if (queryMode === 'portrait') {
    selectedModeId.value = 'portrait'
    return
  }
  if (queryMode === 'universal' || queryMode === 'object') {
    selectedModeId.value = 'universal'
  }
}

/**
 * 函数说明：切换抠图模式，不重置当前上传图
 */
const selectMode = (modeId: MattingModeOption['id']) => {
  selectedModeId.value = modeId
}

/**
 * 函数说明：触发系统文件选择器
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * 函数说明：上传文件校验并创建本地预览，清空旧结果
 */
const handleImageUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  selectedFile.value = file
  revokeObjectUrl(currentImageObjectUrl.value)
  currentImageObjectUrl.value = URL.createObjectURL(file)
  currentImage.value = currentImageObjectUrl.value

  revokeObjectUrl(processedImageObjectUrl.value)
  processedImageObjectUrl.value = ''
  processedImageUrl.value = ''
  compareRatio.value = 50
}

/**
 * 函数说明：处理 input 选择文件事件并复用统一上传逻辑
 */
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) {
    return
  }
  handleImageUpload(input.files[0])
  input.value = ''
}

/**
 * 函数说明：处理拖拽上传，提升多端上传交互效率
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) {
    return
  }
  handleImageUpload(file)
}

/**
 * 函数说明：按当前模式调用抠图接口并生成对比图
 */
const startMatting = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传图片')
    return
  }

  isProcessing.value = true
  try {
    const resultBlob = await requestMattingImage(selectedFile.value, {
      modelId: activeMode.value.modelId
    })

    revokeObjectUrl(processedImageObjectUrl.value)
    processedImageObjectUrl.value = URL.createObjectURL(resultBlob)
    processedImageUrl.value = processedImageObjectUrl.value
    compareRatio.value = 50
    ElMessage.success(`${activeMode.value.shortTitle}完成`)
  } catch (error) {
    const message = error instanceof Error ? error.message : '抠图失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    isProcessing.value = false
  }
}

/**
 * 函数说明：下载透明 PNG 结果图，按模式附加文件后缀
 */
const downloadResult = () => {
  if (!processedImageUrl.value) {
    return
  }
  const rawName = selectedFile.value?.name || 'matting-image'
  const baseName = rawName.replace(/\.[^.]+$/, '')
  const suffix = selectedModeId.value === 'portrait' ? 'portrait' : 'universal'
  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `${baseName}_${suffix}_matting.png`
  link.click()
}

watch(
  () => route.query.mode,
  () => {
    syncModeFromRouteQuery()
  }
)

onMounted(() => {
  syncModeFromRouteQuery()
  warmupMattingModelId()
})

onBeforeUnmount(() => {
  resetCurrentImage()
})
</script>

<style scoped>
.hero {
  background: linear-gradient(128deg, #ecf6ff 0%, #f6fbff 48%, #eefaf4 100%);
}

.upload-zone {
  min-height: 200px;
  border-color: #cbd5e1;
  background: #f8fafc;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.upload-zone--drag {
  border-color: #0284c7;
  background: #eff9ff;
}

.mode-card {
  text-align: left;
  border-radius: 10px;
  border: 1px solid #d7e0ea;
  background: #ffffff;
  padding: 12px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.mode-card:hover {
  border-color: #7dd3fc;
  background: #f8fdff;
}

.mode-card--active {
  border-color: #0ea5e9;
  background: #f0f9ff;
}

.compare-wrap {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid #d9e2ec;
  background: #ffffff;
}

.compare-image {
  width: 100%;
  height: min(66vh, 700px);
  display: block;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.compare-after {
  position: absolute;
  inset: 0 auto 0 0;
  overflow: hidden;
}

.checker-bg {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(45deg, #edf2f7 25%, transparent 25%),
    linear-gradient(-45deg, #edf2f7 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #edf2f7 75%),
    linear-gradient(-45deg, transparent 75%, #edf2f7 75%);
  background-size: 18px 18px;
  background-position: 0 0, 0 9px, 9px -9px, -9px 0;
}

.compare-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #0ea5e9;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 3;
}

.compare-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 34px;
  height: 34px;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background: #0ea5e9;
  color: #ffffff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.compare-range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: ew-resize;
  z-index: 6;
}

.compare-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
}

.compare-preview-tip {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border-radius: 8px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 10px 12px;
  font-size: 12px;
  color: #1e3a8a;
}

.entry-card {
  text-align: left;
  border-radius: 10px;
  border: 1px solid #d7e0ea;
  background: #ffffff;
  padding: 14px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.entry-card:hover {
  border-color: #38bdf8;
  background: #f8fdff;
}

.entry-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.entry-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
}

.step-card {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 14px;
}

.step-index {
  font-size: 11px;
  color: #0284c7;
  font-weight: 600;
}

.step-title {
  margin-top: 6px;
  font-size: 15px;
  color: #0f172a;
  font-weight: 600;
}

.step-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
}

.faq-item {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fafcff;
  padding: 14px;
}

@media (max-width: 960px) {
  .compare-image {
    height: 52vh;
  }
}
</style>
