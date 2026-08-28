<!--
/**
 * @file NinePatch.vue
 * @description Android .9.png 可视化制作工具，支持拉伸区、内容区、实时预览与标准资源导出
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-28
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  calculateNinePatchSliceAxis,
  createNinePatchRange,
  mapNinePatchCoordinate,
  normalizeNinePatchRange,
  type NinePatchRange
} from '@/utils/ninePatch'

type RangeKey = 'stretchX' | 'stretchY' | 'paddingX' | 'paddingY'
type RangeBoundary = 'start' | 'end'

interface NinePatchRanges {
  stretchX: NinePatchRange
  stretchY: NinePatchRange
  paddingX: NinePatchRange
  paddingY: NinePatchRange
}

interface RailDragState {
  key: RangeKey
  axis: 'x' | 'y'
  start: number
  rect: DOMRect
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)
const sourceImage = ref<HTMLImageElement | null>(null)
const sourceUrl = ref('')
const sourceName = ref('nine-patch')
const sourceWidth = ref(0)
const sourceHeight = ref(0)
const isDraggingFile = ref(false)
const isExporting = ref(false)
const editorZoom = ref(100)
const editMode = ref<'stretch' | 'content'>('stretch')
const previewWidth = ref(320)
const previewHeight = ref(140)
let railDragState: RailDragState | null = null

const ranges = reactive<NinePatchRanges>({
  stretchX: { start: 0, end: 0 },
  stretchY: { start: 0, end: 0 },
  paddingX: { start: 0, end: 0 },
  paddingY: { start: 0, end: 0 }
})

const previewPresets = [
  { label: '横向按钮', width: 320, height: 96 },
  { label: '信息卡片', width: 360, height: 180 },
  { label: '方形气泡', width: 220, height: 220 }
]

const rangeControls: Array<{
  key: RangeKey
  title: string
  axis: string
  color: string
}> = [
  { key: 'stretchX', title: '水平拉伸区', axis: '顶部黑线', color: 'blue' },
  { key: 'stretchY', title: '垂直拉伸区', axis: '左侧黑线', color: 'blue' },
  { key: 'paddingX', title: '水平内容区', axis: '底部黑线', color: 'orange' },
  { key: 'paddingY', title: '垂直内容区', axis: '右侧黑线', color: 'orange' }
]

const hasImage = computed(() => Boolean(sourceImage.value && sourceWidth.value && sourceHeight.value))

const baseEditorScale = computed(() => {
  if (!hasImage.value) return 1
  return Math.min(1, 560 / sourceWidth.value, 460 / sourceHeight.value)
})

const editorScale = computed(() => baseEditorScale.value * (editorZoom.value / 100))
const displayWidth = computed(() => Math.max(1, Math.round(sourceWidth.value * editorScale.value)))
const displayHeight = computed(() => Math.max(1, Math.round(sourceHeight.value * editorScale.value)))
const minimumPreviewWidth = computed(() => {
  if (!hasImage.value) return 24
  const range = normalizeNinePatchRange(ranges.stretchX, sourceWidth.value)
  return Math.max(24, range.start + sourceWidth.value - range.end - 1)
})
const minimumPreviewHeight = computed(() => {
  if (!hasImage.value) return 24
  const range = normalizeNinePatchRange(ranges.stretchY, sourceHeight.value)
  return Math.max(24, range.start + sourceHeight.value - range.end - 1)
})
const previewIsUndersized = computed(() => previewWidth.value < minimumPreviewWidth.value || previewHeight.value < minimumPreviewHeight.value)

const frameStyle = computed(() => ({
  width: `${displayWidth.value + 48}px`,
  height: `${displayHeight.value + 48}px`
}))

const imageStyle = computed(() => ({
  width: `${displayWidth.value}px`,
  height: `${displayHeight.value}px`
}))

const outputName = computed(() => {
  const normalized = sourceName.value.replace(/\.9\.png$/i, '').replace(/\.[^.]+$/, '').trim()
  return `${normalized || 'nine-patch'}.9.png`
})

/**
 * 函数说明：根据当前图片尺寸初始化拉伸区与内容安全区。
 */
const resetRanges = (): void => {
  if (!sourceWidth.value || !sourceHeight.value) return
  Object.assign(ranges.stretchX, createNinePatchRange(sourceWidth.value, 0.25, 0.75))
  Object.assign(ranges.stretchY, createNinePatchRange(sourceHeight.value, 0.25, 0.75))
  Object.assign(ranges.paddingX, createNinePatchRange(sourceWidth.value, 0.12, 0.88))
  Object.assign(ranges.paddingY, createNinePatchRange(sourceHeight.value, 0.12, 0.88))
}

/**
 * 函数说明：释放上一次上传图片生成的本地对象地址。
 */
const revokeSourceUrl = (): void => {
  if (sourceUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(sourceUrl.value)
  }
}

/**
 * 函数说明：载入图片地址并刷新编辑器尺寸与默认区间。
 */
const loadImageUrl = (url: string, name: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = async () => {
      revokeSourceUrl()
      sourceUrl.value = url
      sourceName.value = name
      sourceImage.value = image
      sourceWidth.value = image.naturalWidth
      sourceHeight.value = image.naturalHeight
      resetRanges()
      await nextTick()
      renderPreview()
      resolve()
    }
    image.onerror = () => reject(new Error('图片解码失败'))
    image.src = url
  })
}

/**
 * 函数说明：校验并读取用户选择的源图片，所有处理均保留在浏览器本地。
 */
const handleSourceFile = async (file: File): Promise<void> => {
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请选择 PNG、JPG 或 WebP 图片')
    return
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.warning('图片不能超过 20MB')
    return
  }

  const url = URL.createObjectURL(file)
  try {
    await loadImageUrl(url, file.name)
    if (sourceWidth.value > 4096 || sourceHeight.value > 4096) {
      clearImage()
      ElMessage.warning('为保证浏览器稳定，图片宽高请勿超过 4096px')
      return
    }
    ElMessage.success('图片已载入，可拖动四边标记区间')
  } catch {
    URL.revokeObjectURL(url)
    ElMessage.error('图片读取失败，请更换文件重试')
  }
}

/**
 * 函数说明：响应原生文件选择控件变化。
 */
const handleFileChange = (event: Event): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) void handleSourceFile(file)
  input.value = ''
}

/**
 * 函数说明：响应图片拖放并交由统一载入流程处理。
 */
const handleDrop = (event: DragEvent): void => {
  isDraggingFile.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) void handleSourceFile(file)
}

/**
 * 函数说明：打开系统文件选择窗口。
 */
const triggerFileInput = (): void => {
  fileInputRef.value?.click()
}

/**
 * 函数说明：清空当前图片和预览画布并释放浏览器资源。
 */
const clearImage = (): void => {
  revokeSourceUrl()
  sourceUrl.value = ''
  sourceImage.value = null
  sourceWidth.value = 0
  sourceHeight.value = 0
  previewCanvasRef.value?.getContext('2d')?.clearRect(0, 0, previewWidth.value, previewHeight.value)
}

/**
 * 函数说明：返回指定区间对应的图片轴尺寸。
 */
const getRangeSize = (key: RangeKey): number => (key.endsWith('X') ? sourceWidth.value : sourceHeight.value)

/**
 * 函数说明：根据区间生成四边标记线的百分比定位样式。
 */
const getRangeStyle = (key: RangeKey): Record<string, string> => {
  const size = Math.max(1, getRangeSize(key))
  const range = normalizeNinePatchRange(ranges[key], size)
  const start = `${(range.start / size) * 100}%`
  const length = `${((range.end - range.start + 1) / size) * 100}%`
  return key.endsWith('X') ? { left: start, width: length } : { top: start, height: length }
}

/**
 * 函数说明：把指针位置换算成对应轴上的原图像素坐标。
 */
const resolveRailPixel = (clientX: number, clientY: number, drag: RailDragState): number => {
  const coordinate = drag.axis === 'x' ? clientX - drag.rect.left : clientY - drag.rect.top
  const trackSize = drag.axis === 'x' ? drag.rect.width : drag.rect.height
  const imageSize = getRangeSize(drag.key)
  return Math.min(imageSize - 1, Math.max(0, Math.floor((coordinate / Math.max(1, trackSize)) * imageSize)))
}

/**
 * 函数说明：在拖动过程中实时更新当前边的像素标记区间。
 */
const handleRailPointerMove = (event: PointerEvent): void => {
  if (!railDragState) return
  const current = resolveRailPixel(event.clientX, event.clientY, railDragState)
  Object.assign(
    ranges[railDragState.key],
    normalizeNinePatchRange({ start: railDragState.start, end: current }, getRangeSize(railDragState.key))
  )
}

/**
 * 函数说明：结束边缘区间拖动并移除全局指针监听。
 */
const stopRailDrag = (): void => {
  railDragState = null
  window.removeEventListener('pointermove', handleRailPointerMove)
  window.removeEventListener('pointerup', stopRailDrag)
}

/**
 * 函数说明：开始在顶部、左侧、底部或右侧轨道上绘制连续标记区间。
 */
const startRailDrag = (key: RangeKey, axis: 'x' | 'y', event: PointerEvent): void => {
  event.preventDefault()
  stopRailDrag()
  editMode.value = key.startsWith('stretch') ? 'stretch' : 'content'
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const initialState: RailDragState = { key, axis, start: 0, rect }
  initialState.start = resolveRailPixel(event.clientX, event.clientY, initialState)
  railDragState = initialState
  Object.assign(ranges[key], { start: initialState.start, end: initialState.start })
  window.addEventListener('pointermove', handleRailPointerMove)
  window.addEventListener('pointerup', stopRailDrag, { once: true })
}

/**
 * 函数说明：响应像素输入框并规范化对应区间。
 */
const updateRangeValue = (key: RangeKey, boundary: RangeBoundary, event: Event): void => {
  const value = Number((event.target as HTMLInputElement).value)
  Object.assign(
    ranges[key],
    normalizeNinePatchRange({ ...ranges[key], [boundary]: value }, getRangeSize(key))
  )
}

/**
 * 函数说明：快速使用居中拉伸和内缩内容区，适合按钮、气泡等常用素材。
 */
const applyAutomaticRanges = (): void => {
  resetRanges()
  ElMessage.success('已自动生成居中拉伸区和内容安全区')
}

/**
 * 函数说明：读取图片非透明像素边界，返回可见内容的包围盒。
 */
const detectOpaqueBounds = (): { left: number; top: number; right: number; bottom: number } | null => {
  const image = sourceImage.value
  if (!image) return null
  const canvas = document.createElement('canvas')
  canvas.width = sourceWidth.value
  canvas.height = sourceHeight.value
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null
  context.drawImage(image, 0, 0)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
  let left = canvas.width
  let top = canvas.height
  let right = -1
  let bottom = -1
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (pixels[(y * canvas.width + x) * 4 + 3] === 0) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  return right >= left && bottom >= top ? { left, top, right, bottom } : null
}

/**
 * 函数说明：依据非透明内容范围自动收紧拉伸区，减少透明像素参与缩放。
 */
const fitRangesToOpaqueContent = (): void => {
  const bounds = detectOpaqueBounds()
  if (!bounds) {
    ElMessage.warning('没有检测到可见像素')
    return
  }
  const horizontalInset = Math.floor((bounds.right - bounds.left + 1) * 0.25)
  const verticalInset = Math.floor((bounds.bottom - bounds.top + 1) * 0.25)
  Object.assign(
    ranges.stretchX,
    normalizeNinePatchRange(
      { start: bounds.left + horizontalInset, end: bounds.right - horizontalInset },
      sourceWidth.value
    )
  )
  Object.assign(
    ranges.stretchY,
    normalizeNinePatchRange(
      { start: bounds.top + verticalInset, end: bounds.bottom - verticalInset },
      sourceHeight.value
    )
  )
  ElMessage.success('拉伸区已避开透明边缘')
}

/**
 * 函数说明：裁去图片四周完全透明的像素，并重新生成默认标记区间。
 */
const trimTransparentEdges = async (): Promise<void> => {
  const image = sourceImage.value
  const bounds = detectOpaqueBounds()
  if (!image || !bounds) {
    ElMessage.warning('当前图片没有可裁剪的透明边缘')
    return
  }
  if (
    bounds.left === 0 &&
    bounds.top === 0 &&
    bounds.right === sourceWidth.value - 1 &&
    bounds.bottom === sourceHeight.value - 1
  ) {
    ElMessage.info('图片四周没有透明边缘')
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = bounds.right - bounds.left + 1
  canvas.height = bounds.bottom - bounds.top + 1
  canvas.getContext('2d')?.drawImage(
    image,
    bounds.left,
    bounds.top,
    canvas.width,
    canvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  )
  await loadImageUrl(canvas.toDataURL('image/png'), sourceName.value)
  ElMessage.success(`已裁去透明边缘，当前尺寸 ${canvas.width} × ${canvas.height}`)
}

/**
 * 函数说明：绘制九宫格缩放预览，固定四角并仅拉伸用户标记的中心区域。
 */
const renderPreview = (): void => {
  const image = sourceImage.value
  const canvas = previewCanvasRef.value
  if (!image || !canvas) return
  const targetWidth = Math.max(24, Math.min(1024, Math.round(previewWidth.value)))
  const targetHeight = Math.max(24, Math.min(1024, Math.round(previewHeight.value)))
  canvas.width = targetWidth
  canvas.height = targetHeight
  const context = canvas.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, targetWidth, targetHeight)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  const xAxis = calculateNinePatchSliceAxis(sourceWidth.value, ranges.stretchX, targetWidth)
  const yAxis = calculateNinePatchSliceAxis(sourceHeight.value, ranges.stretchY, targetHeight)
  const sourceX = [0, xAxis.source[0], xAxis.source[0] + xAxis.source[1]]
  const sourceY = [0, yAxis.source[0], yAxis.source[0] + yAxis.source[1]]
  const targetX = [0, xAxis.target[0], xAxis.target[0] + xAxis.target[1]]
  const targetY = [0, yAxis.target[0], yAxis.target[0] + yAxis.target[1]]

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const sourceCellWidth = xAxis.source[column]
      const sourceCellHeight = yAxis.source[row]
      const targetCellWidth = xAxis.target[column]
      const targetCellHeight = yAxis.target[row]
      if (!sourceCellWidth || !sourceCellHeight || !targetCellWidth || !targetCellHeight) continue
      context.drawImage(
        image,
        sourceX[column],
        sourceY[row],
        sourceCellWidth,
        sourceCellHeight,
        targetX[column],
        targetY[row],
        targetCellWidth,
        targetCellHeight
      )
    }
  }
}

const previewContentStyle = computed(() => {
  if (!hasImage.value) return {}
  const left = mapNinePatchCoordinate(ranges.paddingX.start, sourceWidth.value, ranges.stretchX, previewWidth.value)
  const right = mapNinePatchCoordinate(ranges.paddingX.end + 1, sourceWidth.value, ranges.stretchX, previewWidth.value)
  const top = mapNinePatchCoordinate(ranges.paddingY.start, sourceHeight.value, ranges.stretchY, previewHeight.value)
  const bottom = mapNinePatchCoordinate(ranges.paddingY.end + 1, sourceHeight.value, ranges.stretchY, previewHeight.value)
  return {
    left: `${Math.max(0, (left / previewWidth.value) * 100)}%`,
    top: `${Math.max(0, (top / previewHeight.value) * 100)}%`,
    width: `${Math.max(0, ((right - left) / previewWidth.value) * 100)}%`,
    height: `${Math.max(0, ((bottom - top) / previewHeight.value) * 100)}%`
  }
})

/**
 * 函数说明：应用常用预览尺寸并立即重绘九宫格效果。
 */
const applyPreviewPreset = (width: number, height: number): void => {
  previewWidth.value = width
  previewHeight.value = height
  void nextTick(renderPreview)
}

/**
 * 函数说明：把预览尺寸调整到固定边能够保持原比例的最小尺寸，避免九宫格固定区域被压缩。
 */
const fitPreviewToMinimum = (): void => {
  previewWidth.value = minimumPreviewWidth.value
  previewHeight.value = minimumPreviewHeight.value
  void nextTick(renderPreview)
}

/**
 * 函数说明：生成带 1px 透明边框及四边黑色标记的 Android 标准 .9.png 文件。
 */
const downloadNinePatch = (): void => {
  const image = sourceImage.value
  if (!image || isExporting.value) return
  isExporting.value = true
  const canvas = document.createElement('canvas')
  canvas.width = sourceWidth.value + 2
  canvas.height = sourceHeight.value + 2
  const context = canvas.getContext('2d')
  if (!context) {
    isExporting.value = false
    ElMessage.error('浏览器无法创建导出画布')
    return
  }
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, 1, 1)
  context.fillStyle = '#000000'

  const stretchX = normalizeNinePatchRange(ranges.stretchX, sourceWidth.value)
  const stretchY = normalizeNinePatchRange(ranges.stretchY, sourceHeight.value)
  const paddingX = normalizeNinePatchRange(ranges.paddingX, sourceWidth.value)
  const paddingY = normalizeNinePatchRange(ranges.paddingY, sourceHeight.value)
  context.fillRect(stretchX.start + 1, 0, stretchX.end - stretchX.start + 1, 1)
  context.fillRect(0, stretchY.start + 1, 1, stretchY.end - stretchY.start + 1)
  context.fillRect(paddingX.start + 1, sourceHeight.value + 1, paddingX.end - paddingX.start + 1, 1)
  context.fillRect(sourceWidth.value + 1, paddingY.start + 1, 1, paddingY.end - paddingY.start + 1)

  canvas.toBlob((blob) => {
    isExporting.value = false
    if (!blob) {
      ElMessage.error('图片导出失败，请重试')
      return
    }
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = outputName.value
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    ElMessage.success(`${outputName.value} 已生成`)
  }, 'image/png')
}

watch(
  () => [
    ranges.stretchX.start,
    ranges.stretchX.end,
    ranges.stretchY.start,
    ranges.stretchY.end,
    previewWidth.value,
    previewHeight.value
  ],
  () => void nextTick(renderPreview)
)

onBeforeUnmount(() => {
  stopRailDrag()
  revokeSourceUrl()
})
</script>

<template>
  <div class="nine-patch-page">
    <header class="tool-hero">
      <div class="tool-hero__mark" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div>
        <div class="tool-kicker">ANDROID ASSET LAB · LOCAL PROCESSING</div>
        <h1>免费在线 .9 图生成器</h1>
        <p>可视化标记拉伸区域和内容安全区，实时验证不同尺寸效果，导出 Android 标准 Nine-patch PNG。</p>
      </div>
      <div class="privacy-chip"><i></i> 图片不上传服务器</div>
    </header>

    <section v-if="!hasImage" class="upload-panel">
      <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="handleFileChange" />
      <button
        type="button"
        class="upload-dropzone"
        :class="{ 'is-dragging': isDraggingFile }"
        @click="triggerFileInput"
        @dragenter.prevent="isDraggingFile = true"
        @dragover.prevent="isDraggingFile = true"
        @dragleave.prevent="isDraggingFile = false"
        @drop.prevent="handleDrop"
      >
        <span class="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
        <strong>拖入图片，开始制作 .9.png</strong>
        <small>支持 PNG、JPG、WebP · 最大 20MB · 建议使用带透明通道的 PNG</small>
        <span class="upload-action">选择源图片</span>
      </button>
      <div class="workflow-strip">
        <span><b>01</b> 上传素材</span>
        <i></i>
        <span><b>02</b> 标记四边</span>
        <i></i>
        <span><b>03</b> 拉伸验收</span>
        <i></i>
        <span><b>04</b> 导出资源</span>
      </div>
    </section>

    <template v-else>
      <section class="asset-toolbar">
        <div class="asset-identity">
          <span class="asset-identity__dot"></span>
          <div>
            <strong>{{ sourceName }}</strong>
            <small>{{ sourceWidth }} × {{ sourceHeight }} px → {{ outputName }}</small>
          </div>
        </div>
        <div class="toolbar-actions">
          <button type="button" @click="triggerFileInput">更换图片</button>
          <button type="button" @click="trimTransparentEdges">修剪透明边缘</button>
          <button type="button" @click="fitRangesToOpaqueContent">收紧拉伸区</button>
          <button type="button" class="toolbar-actions__danger" @click="clearImage">清空</button>
        </div>
        <input ref="fileInputRef" type="file" accept="image/png,image/jpeg,image/webp" hidden @change="handleFileChange" />
      </section>

      <section class="workspace-grid">
        <article class="editor-card">
          <div class="panel-heading">
            <div>
              <span>EDGE MAP</span>
              <h2>四边标记编辑器</h2>
            </div>
            <div class="mode-switch" role="tablist" aria-label="编辑模式">
              <button type="button" :class="{ 'is-active': editMode === 'stretch' }" @click="editMode = 'stretch'">拉伸区域</button>
              <button type="button" :class="{ 'is-active': editMode === 'content' }" @click="editMode = 'content'">内容填充</button>
            </div>
          </div>

          <div class="editor-note">
            <span :class="editMode === 'stretch' ? 'is-blue' : 'is-orange'"></span>
            {{ editMode === 'stretch' ? '拖动顶部和左侧轨道，定义允许被缩放的像素区域。' : '拖动底部和右侧轨道，定义文字与图标可以放置的安全区域。' }}
          </div>

          <div class="stage-scroller">
            <div class="nine-patch-frame" :style="frameStyle">
              <div class="corner corner--top-left"></div>
              <div class="corner corner--top-right"></div>
              <div class="corner corner--bottom-left"></div>
              <div class="corner corner--bottom-right"></div>
              <div class="rail rail--top" :class="{ 'is-muted': editMode !== 'stretch' }" @pointerdown="startRailDrag('stretchX', 'x', $event)">
                <span class="rail__segment rail__segment--blue" :style="getRangeStyle('stretchX')"></span>
              </div>
              <div class="rail rail--left" :class="{ 'is-muted': editMode !== 'stretch' }" @pointerdown="startRailDrag('stretchY', 'y', $event)">
                <span class="rail__segment rail__segment--blue" :style="getRangeStyle('stretchY')"></span>
              </div>
              <div class="rail rail--bottom" :class="{ 'is-muted': editMode !== 'content' }" @pointerdown="startRailDrag('paddingX', 'x', $event)">
                <span class="rail__segment rail__segment--orange" :style="getRangeStyle('paddingX')"></span>
              </div>
              <div class="rail rail--right" :class="{ 'is-muted': editMode !== 'content' }" @pointerdown="startRailDrag('paddingY', 'y', $event)">
                <span class="rail__segment rail__segment--orange" :style="getRangeStyle('paddingY')"></span>
              </div>
              <div class="asset-image-wrap" :style="imageStyle">
                <img :src="sourceUrl" :alt="sourceName" draggable="false" />
                <span class="guide guide--x" :style="getRangeStyle('stretchX')"></span>
                <span class="guide guide--y" :style="getRangeStyle('stretchY')"></span>
              </div>
            </div>
          </div>

          <div class="zoom-row">
            <span>编辑缩放</span>
            <input v-model.number="editorZoom" type="range" min="50" max="200" step="10" />
            <b>{{ editorZoom }}%</b>
          </div>

          <div class="range-grid">
            <div v-for="control in rangeControls" :key="control.key" class="range-control" :class="`range-control--${control.color}`">
              <div class="range-control__title">
                <span></span>
                <strong>{{ control.title }}</strong>
                <small>{{ control.axis }}</small>
              </div>
              <label>
                起点
                <input
                  type="number"
                  :min="0"
                  :max="getRangeSize(control.key) - 1"
                  :value="ranges[control.key].start"
                  @change="updateRangeValue(control.key, 'start', $event)"
                />
              </label>
              <label>
                终点
                <input
                  type="number"
                  :min="0"
                  :max="getRangeSize(control.key) - 1"
                  :value="ranges[control.key].end"
                  @change="updateRangeValue(control.key, 'end', $event)"
                />
              </label>
            </div>
          </div>

          <button type="button" class="auto-button" @click="applyAutomaticRanges">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3l1.15 3.1L16 7.5l-2.85 1.4L12 12l-1.15-3.1L8 7.5l2.85-1.4L12 3ZM5.5 13l.8 2.2 2.2.8-2.2.8L5.5 19l-.8-2.2-2.2-.8 2.2-.8.8-2.2Zm12.5-1 .95 2.55L21.5 15.5l-2.55.95L18 19l-.95-2.55-2.55-.95 2.55-.95L18 12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
            自动生成推荐标记
          </button>
        </article>

        <aside class="preview-card">
          <div class="panel-heading">
            <div>
              <span>LIVE STRETCH TEST</span>
              <h2>实时拉伸预览</h2>
            </div>
            <span class="preview-status"><i></i> LIVE</span>
          </div>

          <div class="preview-presets">
            <button
              v-for="preset in previewPresets"
              :key="preset.label"
              type="button"
              :class="{ 'is-active': previewWidth === preset.width && previewHeight === preset.height }"
              @click="applyPreviewPreset(preset.width, preset.height)"
            >
              {{ preset.label }}
              <small>{{ preset.width }}×{{ preset.height }}</small>
            </button>
          </div>

          <div class="preview-size-fields">
            <label>宽度 <input v-model.number="previewWidth" type="number" min="24" max="1024" /></label>
            <span>×</span>
            <label>高度 <input v-model.number="previewHeight" type="number" min="24" max="1024" /></label>
          </div>
          <div class="preview-size-hint" :class="{ 'is-warning': previewIsUndersized }">
            <span v-if="previewIsUndersized">当前尺寸会压缩固定边，</span>
            <span v-else>固定边比例正常，</span>
            最小无压缩尺寸 {{ minimumPreviewWidth }} × {{ minimumPreviewHeight }} px
            <button v-if="previewIsUndersized" type="button" @click="fitPreviewToMinimum">采用最小尺寸</button>
          </div>

          <div class="preview-viewport">
            <div class="preview-asset" :style="{ aspectRatio: `${previewWidth} / ${previewHeight}` }">
              <canvas ref="previewCanvasRef"></canvas>
              <div class="content-safe-area" :style="previewContentStyle"><span>CONTENT SAFE AREA</span></div>
            </div>
          </div>

          <div class="legend-row">
            <span><i class="legend-blue"></i> 拉伸轴线</span>
            <span><i class="legend-orange"></i> 内容安全区</span>
          </div>

          <div class="export-summary">
            <div>
              <span>OUTPUT</span>
              <strong>{{ outputName }}</strong>
              <small>{{ sourceWidth + 2 }} × {{ sourceHeight + 2 }} px · PNG · 1px border</small>
            </div>
            <button type="button" :disabled="isExporting" @click="downloadNinePatch">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
              {{ isExporting ? '生成中…' : '下载 .9.png' }}
            </button>
          </div>
        </aside>
      </section>
    </template>

    <section class="knowledge-grid">
      <article>
        <span class="knowledge-index">01</span>
        <h3>什么是 .9 图？</h3>
        <p>Android Nine-patch 在普通 PNG 四周增加 1px 标记边，告诉系统哪些像素可以拉伸、内容应该放在哪里。</p>
      </article>
      <article>
        <span class="knowledge-index">02</span>
        <h3>四条边分别做什么？</h3>
        <p>顶部与左侧控制横纵拉伸区域；底部与右侧控制内容填充范围，四个角像素必须保持透明。</p>
      </article>
      <article>
        <span class="knowledge-index">03</span>
        <h3>如何放进 Android 项目？</h3>
        <p>下载后保留 <code>.9.png</code> 文件名，放入 <code>res/drawable</code> 或对应 density 目录，再像普通 Drawable 一样引用。</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.nine-patch-page {
  --np-ink: #101828;
  --np-muted: #667085;
  --np-line: #dfe3e8;
  --np-blue: #2167f3;
  --np-orange: #f26b38;
  min-height: 100vh;
  container: nine-patch / inline-size;
  padding: 26px;
  color: var(--np-ink);
  font-family: "Avenir Next", "PingFang SC", sans-serif;
  background:
    linear-gradient(rgba(26, 35, 50, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(26, 35, 50, 0.035) 1px, transparent 1px),
    #f4f6f8;
  background-size: 24px 24px;
}

button,
input { font: inherit; }

.tool-hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  padding: 28px 30px;
  border: 1px solid #d9dee5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
}

.tool-hero__mark {
  display: grid;
  grid-template-columns: repeat(3, 13px);
  gap: 4px;
  padding: 13px;
  border: 1px solid #1c2736;
}

.tool-hero__mark span { width: 13px; height: 13px; background: #1c2736; }
.tool-hero__mark span:nth-child(2), .tool-hero__mark span:nth-child(4), .tool-hero__mark span:nth-child(6), .tool-hero__mark span:nth-child(8) { background: #dce6ff; }

.tool-kicker,
.panel-heading span,
.export-summary span {
  color: var(--np-blue);
  font-family: "DIN Alternate", "Avenir Next", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.tool-hero h1 { margin: 5px 0 7px; font-size: clamp(26px, 3vw, 40px); line-height: 1.1; letter-spacing: -0.04em; }
.tool-hero p { margin: 0; color: var(--np-muted); font-size: 14px; }
.privacy-chip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #b8e1c7; color: #176b3a; background: #effaf3; font-size: 12px; font-weight: 600; }
.privacy-chip i, .preview-status i { width: 7px; height: 7px; border-radius: 50%; background: #24a35a; box-shadow: 0 0 0 4px rgba(36, 163, 90, 0.12); }

.upload-panel { margin-top: 16px; padding: 22px; border: 1px solid var(--np-line); border-radius: 8px; background: #fff; }
.upload-dropzone { width: 100%; min-height: 390px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #aeb6c2; border-radius: 6px; color: var(--np-ink); background: #fafbfc; cursor: pointer; transition: 180ms ease; }
.upload-dropzone:hover, .upload-dropzone.is-dragging { border-color: var(--np-blue); background: #f3f7ff; }
.upload-icon { width: 58px; height: 58px; display: grid; place-items: center; margin-bottom: 20px; border: 1px solid #c8d6f8; background: #eaf0ff; color: var(--np-blue); }
.upload-icon svg { width: 26px; }
.upload-dropzone strong { font-size: 21px; }
.upload-dropzone small { margin-top: 8px; color: #7c8592; }
.upload-action { margin-top: 22px; padding: 10px 22px; color: #fff; background: var(--np-blue); font-size: 13px; font-weight: 700; }
.workflow-strip { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 22px; color: #596273; font-size: 12px; }
.workflow-strip span { display: flex; align-items: center; gap: 7px; }
.workflow-strip b { color: var(--np-blue); font-family: "DIN Alternate", sans-serif; }
.workflow-strip i { width: 42px; height: 1px; background: #d9dee5; }

.asset-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin-top: 16px; padding: 13px 16px; border: 1px solid var(--np-line); border-radius: 8px; background: #fff; }
.asset-identity { min-width: 0; display: flex; align-items: center; gap: 11px; }
.asset-identity__dot { width: 10px; height: 10px; flex: 0 0 auto; background: var(--np-blue); }
.asset-identity div { min-width: 0; display: flex; flex-direction: column; }
.asset-identity strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.asset-identity small { color: #7d8694; font-size: 11px; }
.toolbar-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.toolbar-actions button { padding: 7px 10px; border: 1px solid #d8dde4; color: #46505e; background: #fff; font-size: 11px; cursor: pointer; }
.toolbar-actions button:hover { border-color: var(--np-blue); color: var(--np-blue); }
.toolbar-actions .toolbar-actions__danger:hover { border-color: #e15555; color: #c93636; }

.workspace-grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.65fr); gap: 16px; margin-top: 16px; }
.editor-card, .preview-card { min-width: 0; padding: 20px; border: 1px solid var(--np-line); border-radius: 8px; background: #fff; }
.panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.panel-heading h2 { margin: 3px 0 0; font-size: 19px; letter-spacing: -0.02em; }
.mode-switch { display: flex; border: 1px solid #d7dce3; padding: 3px; background: #f6f7f9; }
.mode-switch button { padding: 7px 10px; border: 0; color: #667085; background: transparent; font-size: 11px; cursor: pointer; }
.mode-switch button.is-active { color: #fff; background: #1c2736; }
.editor-note { display: flex; align-items: center; gap: 9px; margin-top: 14px; padding: 10px 12px; color: #667085; background: #f7f8fa; font-size: 12px; }
.editor-note span { width: 18px; height: 3px; }
.editor-note .is-blue { background: var(--np-blue); }
.editor-note .is-orange { background: var(--np-orange); }

.stage-scroller { min-height: 330px; display: grid; place-items: center; margin-top: 14px; padding: 24px; overflow: auto; border: 1px solid #dde1e6; background-color: #eef1f4; background-image: linear-gradient(45deg, #dde2e7 25%, transparent 25%), linear-gradient(-45deg, #dde2e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #dde2e7 75%), linear-gradient(-45deg, transparent 75%, #dde2e7 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; }
.nine-patch-frame { position: relative; flex: 0 0 auto; background: #fff; box-shadow: 0 8px 30px rgba(22, 31, 44, 0.14); }
.asset-image-wrap { position: absolute; left: 24px; top: 24px; overflow: hidden; user-select: none; }
.asset-image-wrap img { width: 100%; height: 100%; display: block; object-fit: fill; image-rendering: auto; }
.rail { position: absolute; z-index: 3; background: rgba(255, 255, 255, 0.94); cursor: crosshair; touch-action: none; }
.rail::after { content: ""; position: absolute; inset: 50% 0 auto; height: 1px; background: #b7bec8; }
.rail--top, .rail--bottom { left: 24px; width: calc(100% - 48px); height: 18px; }
.rail--top { top: 3px; }
.rail--bottom { bottom: 3px; }
.rail--left, .rail--right { top: 24px; height: calc(100% - 48px); width: 18px; }
.rail--left { left: 3px; }
.rail--right { right: 3px; }
.rail--left::after, .rail--right::after { inset: 0 auto 0 50%; width: 1px; height: auto; }
.rail.is-muted { opacity: 0.38; }
.rail__segment { position: absolute; z-index: 2; display: block; }
.rail--top .rail__segment, .rail--bottom .rail__segment { top: 5px; height: 8px; }
.rail--left .rail__segment, .rail--right .rail__segment { left: 5px; width: 8px; }
.rail__segment--blue { background: var(--np-blue); }
.rail__segment--orange { background: var(--np-orange); }
.corner { position: absolute; z-index: 4; width: 18px; height: 18px; background: #fff; }
.corner::before { content: ""; position: absolute; inset: 7px; background: #1a2430; }
.corner--top-left { left: 3px; top: 3px; }
.corner--top-right { right: 3px; top: 3px; }
.corner--bottom-left { left: 3px; bottom: 3px; }
.corner--bottom-right { right: 3px; bottom: 3px; }
.guide { position: absolute; pointer-events: none; opacity: 0.14; background: var(--np-blue); }
.guide--x { top: 0; bottom: 0; }
.guide--y { left: 0; right: 0; }
.zoom-row { display: grid; grid-template-columns: auto minmax(0, 1fr) 45px; align-items: center; gap: 12px; margin-top: 14px; color: #697382; font-size: 11px; }
.zoom-row input { width: 100%; accent-color: var(--np-blue); }
.zoom-row b { text-align: right; color: #283243; }

.range-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.range-control { display: grid; grid-template-columns: minmax(0, 1fr) 78px 78px; gap: 8px; align-items: center; padding: 10px; border: 1px solid #e0e4e9; }
.range-control__title { min-width: 0; display: grid; grid-template-columns: 5px minmax(0, 1fr); column-gap: 8px; }
.range-control__title span { grid-row: 1 / 3; width: 5px; height: 100%; background: var(--np-blue); }
.range-control--orange .range-control__title span { background: var(--np-orange); }
.range-control__title strong { font-size: 11px; }
.range-control__title small { color: #8a93a0; font-size: 9px; }
.range-control label { color: #7a8492; font-size: 9px; }
.range-control input { width: 100%; margin-top: 3px; padding: 5px 6px; border: 1px solid #d9dee5; color: #263142; background: #fafbfc; font-size: 11px; box-sizing: border-box; }
.auto-button { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; padding: 10px; border: 1px solid #bfcdf1; color: #1e58c7; background: #f3f7ff; font-size: 12px; font-weight: 700; cursor: pointer; }
.auto-button svg { width: 16px; }

.preview-status { display: flex; align-items: center; gap: 7px; color: #21874b !important; font-size: 10px !important; }
.preview-presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 16px; }
.preview-presets button { padding: 9px 5px; border: 1px solid #dde2e8; color: #4b5564; background: #fff; font-size: 10px; cursor: pointer; }
.preview-presets button small { display: block; margin-top: 2px; color: #929aa5; font-size: 8px; }
.preview-presets button.is-active { border-color: #2d68e6; color: #174ebc; background: #f0f5ff; }
.preview-size-fields { display: flex; align-items: end; justify-content: center; gap: 8px; margin-top: 12px; color: #89919d; }
.preview-size-fields label { color: #7a8492; font-size: 9px; }
.preview-size-fields input { width: 76px; display: block; margin-top: 3px; padding: 6px; border: 1px solid #d9dee5; box-sizing: border-box; }
.preview-size-hint { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px; margin-top: 8px; color: #7a8492; font-size: 10px; line-height: 1.5; text-align: center; }
.preview-size-hint.is-warning { color: #b45309; }
.preview-size-hint button { padding: 2px 6px; border: 1px solid #f0c48a; color: #9a4d05; background: #fff8eb; font-size: 10px; cursor: pointer; }
.preview-size-hint button:hover { border-color: #d97706; color: #7c3d04; }
.preview-viewport { min-height: 330px; display: grid; place-items: center; margin-top: 12px; padding: 22px; border: 1px solid #dce1e7; overflow: auto; background: #1b222c; }
.preview-asset { position: relative; width: 100%; max-width: 440px; max-height: 420px; background-color: #eef1f4; background-image: linear-gradient(45deg, #d7dce2 25%, transparent 25%), linear-gradient(-45deg, #d7dce2 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d7dce2 75%), linear-gradient(-45deg, transparent 75%, #d7dce2 75%); background-size: 18px 18px; background-position: 0 0, 0 9px, 9px -9px, -9px 0; box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35); }
.preview-asset canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.content-safe-area { position: absolute; border: 1px dashed var(--np-orange); background: rgba(242, 107, 56, 0.08); pointer-events: none; }
.content-safe-area span { position: absolute; left: 4px; top: 3px; color: #b6421a; font-family: "DIN Alternate", sans-serif; font-size: 7px; letter-spacing: 0.08em; }
.legend-row { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 10px; color: #7d8693; font-size: 9px; }
.legend-row span { display: flex; align-items: center; gap: 5px; }
.legend-row i { width: 14px; height: 3px; }
.legend-blue { background: var(--np-blue); }
.legend-orange { background: var(--np-orange); }
.export-summary { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding-top: 16px; border-top: 1px solid #e0e4e9; }
.export-summary div { min-width: 0; display: flex; flex-direction: column; }
.export-summary strong { margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.export-summary small { color: #89919d; font-size: 9px; }
.export-summary button { flex: 0 0 auto; display: flex; align-items: center; gap: 7px; padding: 11px 13px; border: 0; color: #fff; background: var(--np-blue); font-size: 11px; font-weight: 700; cursor: pointer; }
.export-summary button:disabled { opacity: 0.6; cursor: wait; }
.export-summary button svg { width: 16px; }

.knowledge-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
.knowledge-grid article { position: relative; min-height: 135px; padding: 20px; overflow: hidden; border: 1px solid var(--np-line); border-radius: 8px; background: #fff; }
.knowledge-index { position: absolute; right: 14px; top: 6px; color: #edf0f4; font-family: "DIN Alternate", sans-serif; font-size: 52px; font-weight: 800; }
.knowledge-grid h3 { position: relative; margin: 0 0 10px; font-size: 14px; }
.knowledge-grid p { position: relative; margin: 0; color: #697382; font-size: 12px; line-height: 1.75; }
.knowledge-grid code { padding: 2px 4px; color: #174ebc; background: #edf3ff; }

@media (max-width: 1100px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .preview-viewport { min-height: 280px; }
}

/* 主站侧栏会压缩工具实际容器，按容器宽度切换布局，避免控件标题被挤成竖排。 */
@container nine-patch (max-width: 900px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .preview-viewport { min-height: 280px; }
}

@media (max-width: 720px) {
  .nine-patch-page { padding: 12px; }
  .tool-hero { grid-template-columns: auto 1fr; padding: 20px; }
  .privacy-chip { grid-column: 1 / -1; justify-self: start; }
  .tool-hero p { line-height: 1.6; }
  .upload-dropzone { min-height: 300px; padding: 24px; }
  .workflow-strip { flex-wrap: wrap; }
  .workflow-strip i { display: none; }
  .asset-toolbar { align-items: flex-start; flex-direction: column; }
  .toolbar-actions { justify-content: flex-start; }
  .editor-card, .preview-card { padding: 14px; }
  .panel-heading { align-items: flex-start; flex-direction: column; }
  .range-grid, .knowledge-grid { grid-template-columns: 1fr; }
  .range-control { grid-template-columns: minmax(0, 1fr) 72px 72px; }
  .stage-scroller { min-height: 280px; padding: 14px; }
  .preview-presets { grid-template-columns: 1fr; }
  .export-summary { align-items: flex-start; flex-direction: column; }
  .export-summary button { width: 100%; justify-content: center; }
}
</style>
