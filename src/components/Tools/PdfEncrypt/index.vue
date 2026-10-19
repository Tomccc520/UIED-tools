<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">{{ $ensureFreeToolTitle(info.title) }}</h2>
          <p class="text-gray-500 text-sm">{{ info.subtitle }}</p>
        </div>

        <div v-if="!file">
          <div
            class="relative border-2 border-dashed rounded-xl min-h-[240px] flex flex-col items-center justify-center transition-all duration-300"
            :class="isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'"
            @drop.prevent="handleDrop" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept=".pdf,application/pdf"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" @change="handleFileInputChange" />

            <div class="text-center px-4">
              <div class="w-16 h-16 mb-4 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
                <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div class="text-lg font-medium text-gray-700 mb-2">点击或拖拽PDF文件到这里</div>
              <p class="text-sm text-gray-400">单个文件最大 100MB</p>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col lg:flex-row gap-8">
          <div
            class="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            <div v-if="rendering" class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <div class="relative shadow-lg max-w-full bg-white">
              <canvas ref="pdfPreviewCanvas" class="max-w-full h-auto block"></canvas>
            </div>
            <div class="mt-4 text-center">
              <p class="text-gray-700 font-medium">{{ file.name }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
              <p v-if="previewError" role="alert" class="text-sm text-red-600 mt-2">{{ previewError }}</p>
            </div>
          </div>

          <div class="w-full lg:w-96 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">打开密码 (用户密码)</label>
              <el-input v-model="userPassword" :disabled="processing" type="password" show-password placeholder="请输入打开文件所需的密码" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">权限密码 (所有者密码)</label>
              <el-input v-model="ownerPassword" :disabled="processing" type="password" show-password placeholder="不填写时自动生成随机权限密码" />
              <p class="text-xs text-gray-500 mt-2">只设置权限密码时，打开文件无需密码；如需保护内容，请填写打开密码。</p>
            </div>

            <div class="pt-4 space-y-3">
              <el-button type="primary" class="w-full" :loading="processing" @click="encryptPdf"
                :disabled="!previewReady || (!userPassword && !ownerPassword)">
                加密并下载
              </el-button>
              <el-button class="w-full" :disabled="processing" @click="clearFile">
                重新上传
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能特点 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="feature in features" :key="feature.title"
            class="bg-gray-50 p-6 rounded-xl hover:shadow-sm transition-shadow">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
              <svg v-if="feature.icon === 'Lock'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <svg v-else-if="feature.icon === 'Key'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <svg v-else-if="feature.icon === 'Shield'" class="w-6 h-6" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>

        <!-- 常见问题 -->
        <div class="mt-12">
          <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg class="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            常见问题
          </h3>
          <div class="space-y-4">
            <div v-for="(faq, index) in faqs" :key="index" class="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h4 class="font-bold text-gray-800 mb-2">{{ faq.question }}</h4>
              <p class="text-sm text-gray-600">{{ faq.answer }}</p>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPdfFileError, ensurePdfjsRuntime } from '@/utils/pdf'
import { encryptPdfLocally } from '@/services/pdfEncryption'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()

const info = reactive({
  title: "PDF加密",
  subtitle: "在线为PDF文件设置密码保护，支持用户密码和所有者密码，本地处理更安全。"
})

const features = [
  {
    icon: 'Lock',
    title: '强力加密',
    desc: '使用 AES-256 加密保护原始 PDF，保留页面、文本和文档内容'
  },
  {
    icon: 'Key',
    title: '双重密码',
    desc: '支持设置打开密码（用户密码）和权限密码（所有者密码），满足不同场景的安全需求'
  },
  {
    icon: 'Shield',
    title: '权限控制',
    desc: '允许打印，限制复制、编辑、批注和表单修改；权限限制取决于阅读器是否遵守'
  },
  {
    icon: 'Safety',
    title: '本地处理',
    desc: '所有加密过程均在浏览器本地完成，文件无需上传服务器，绝对保障文档隐私'
  }
]

const faqs = [
  {
    question: '如果忘记密码怎么办？',
    answer: '很抱歉，由于加密过程是在本地进行的且采用了强加密算法，一旦忘记密码将无法找回，请务必妥善保管您的密码。'
  },
  {
    question: '打开密码和权限密码有什么区别？',
    answer: '打开密码是浏览文档时必须输入的密码；权限密码是修改文档安全设置或进行限制操作（如打印、复制）时需要的密码。'
  },
  {
    question: '加密后的文件安全吗？',
    answer: '设置打开密码后，阅读器需要正确密码才能查看内容；仅设置权限密码时可以直接打开文件。请使用较长且难以猜测的密码。'
  }
]

const maxFileSizeMB = 100
const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const processing = ref(false)
const rendering = ref(false)
const pdfPreviewCanvas = ref<HTMLCanvasElement | null>(null)
const userPassword = ref('')
const ownerPassword = ref('')
const previewReady = ref(false)
const previewError = ref('')
let previewTask: PDFDocumentLoadingTask | null = null
let previewDocument: PDFDocumentProxy | null = null
let previewRequestId = 0
let encryptionController: AbortController | null = null

/**
 * 加载PDF预览缩略图
 * @param f 选择的PDF文件
 */
const loadPdfPreview = async (f: File) => {
  const requestId = ++previewRequestId
  rendering.value = true
  previewReady.value = false
  previewError.value = ''
  try {
    await previewTask?.destroy()
    await previewDocument?.destroy()
    previewTask = null
    previewDocument = null
    const pdfjsLib = await ensurePdfjsRuntime()
    if (requestId !== previewRequestId) return
    const arrayBuffer = await f.arrayBuffer()
    if (requestId !== previewRequestId) return
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    // 已有加密文件必须明确终止密码等待，避免预览一直转圈。
    loadingTask.onPassword = () => {
      if (requestId !== previewRequestId) return
      previewError.value = '此 PDF 已有打开密码，请先解密后再加密'
      rendering.value = false
      void loadingTask.destroy()
    }
    previewTask = loadingTask
    const pdf = await loadingTask.promise
    if (requestId !== previewRequestId) {
      await pdf.destroy()
      return
    }
    previewDocument = pdf
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.0 })

    // Calculate scale to fit container (max width 600px)
    const maxWidth = 600
    const scale = maxWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

    await nextTick()
    if (requestId !== previewRequestId) return
    if (pdfPreviewCanvas.value) {
      pdfPreviewCanvas.value.width = scaledViewport.width
      pdfPreviewCanvas.value.height = scaledViewport.height
      const context = pdfPreviewCanvas.value.getContext('2d')

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: scaledViewport
        }).promise
      }
    }
    if (requestId === previewRequestId) previewReady.value = true
  } catch (error) {
    if (requestId === previewRequestId) {
      console.error('[pdf-encrypt] preview failed')
      previewError.value ||= '无法读取此 PDF，请确认文件未损坏且没有打开密码'
      ElMessage.error(previewError.value)
    }
  } finally {
    if (requestId === previewRequestId) rendering.value = false
  }
}

watch(file, (newFile) => {
  if (newFile) {
    loadPdfPreview(newFile)
  }
})

const guideSteps = [
  { title: '上传PDF文件', description: '点击上传区域或直接拖拽PDF文件到指定区域，文件大小限制为100MB。' },
  { title: '设置密码', description: '输入打开密码（用户密码）和权限密码（所有者密码）。打开密码用于浏览文件，权限密码用于修改安全设置。' },
  { title: '加密并下载', description: '点击“加密并下载”按钮，系统将自动加密文件并在完成后下载。' }
]

const guideNotes = [
  '请务必记住您设置的密码，一旦丢失将无法找回。',
  '未填写权限密码时会自动生成随机所有者密码，打开文件请使用您设置的打开密码。',
  '只设置权限密码时不限制打开文件，复制和编辑限制由阅读器执行。'
]

/** 函数说明：校验拖入的 PDF 文件，并启动本地预览。 */
const handleDrop = (e: DragEvent) => {
  if (processing.value) return
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    const err = getPdfFileError(droppedFile, maxFileSizeMB)
    if (err) {
      ElMessage.error(err)
      return
    }
    file.value = droppedFile
  }
}

/** 函数说明：读取文件选择器中的 PDF，清空选择器以允许重新选择同名文件。 */
const handleFileInputChange = (e: Event) => {
  if (processing.value) return
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const pickedFile = target.files[0]
    const err = getPdfFileError(pickedFile, maxFileSizeMB)
    if (err) {
      ElMessage.error(err)
    } else {
      file.value = pickedFile
    }
    target.value = ''
  }
}

/**
 * 清空当前文件与输入状态
 */
const clearFile = () => {
  if (processing.value) return
  previewRequestId += 1
  void previewTask?.destroy()
  void previewDocument?.destroy()
  previewTask = null
  previewDocument = null
  previewReady.value = false
  previewError.value = ''
  rendering.value = false
  file.value = null
  userPassword.value = ''
  ownerPassword.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

/**
 * 执行PDF加密并下载
 */
const encryptPdf = async () => {
  if (!file.value || processing.value) return
  if (!previewReady.value) {
    ElMessage.warning(previewError.value || '请等待 PDF 读取完成')
    return
  }

  const currentFile = file.value
  const controller = new AbortController()
  encryptionController = controller
  processing.value = true
  try {
    const blob = await encryptPdfLocally(currentFile, {
      userPassword: userPassword.value,
      ownerPassword: ownerPassword.value
    }, controller.signal)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `encrypted_${currentFile.name}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)

    ElMessage.success('加密成功')
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error('[pdf-encrypt] encryption failed')
      ElMessage.error(error instanceof Error ? error.message : '加密失败，请重试')
    }
  } finally {
    processing.value = false
    if (encryptionController === controller) encryptionController = null
  }
}

/** 函数说明：离开页面时取消加密并销毁 PDF.js 预览，释放文档和密码所在内存。 */
onUnmounted(() => {
  previewRequestId += 1
  encryptionController?.abort()
  void previewTask?.destroy()
  void previewDocument?.destroy()
})
</script>
