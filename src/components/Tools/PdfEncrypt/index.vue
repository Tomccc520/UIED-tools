<!--
 * @file PdfEncrypt.vue
 * @description PDF加密工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">{{ info.title }}</h2>
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
            </div>
          </div>

          <div class="w-full lg:w-96 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">打开密码 (用户密码)</label>
              <el-input v-model="userPassword" type="password" show-password placeholder="请输入打开文件所需的密码" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">权限密码 (所有者密码)</label>
              <el-input v-model="ownerPassword" type="password" show-password placeholder="请输入修改权限所需的密码" />
            </div>

            <div class="pt-4 space-y-3">
              <el-button type="primary" class="w-full" :loading="processing" @click="encryptPdf"
                :disabled="!userPassword && !ownerPassword">
                加密并下载
              </el-button>
              <el-button class="w-full" @click="clearFile">
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
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { PDFDocument } from 'pdf-lib'
import { ElMessage } from 'element-plus'
import * as pdfjsLib from 'pdfjs-dist'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

// 设置 PDF.js worker
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const route = useRoute()

const info = reactive({
  title: "PDF加密",
  subtitle: "在线为PDF文件设置密码保护，支持用户密码和所有者密码，本地处理更安全。"
})

const features = [
  {
    icon: 'Lock',
    title: '强力加密',
    desc: '采用标准的PDF加密算法，有效防止未经授权的访问，保护文档内容安全'
  },
  {
    icon: 'Key',
    title: '双重密码',
    desc: '支持设置打开密码（用户密码）和权限密码（所有者密码），满足不同场景的安全需求'
  },
  {
    icon: 'Shield',
    title: '权限控制',
    desc: '通过设置权限密码，可以限制文档的打印、复制、编辑等操作，防止内容被滥用'
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
    answer: '是的，加密后的文件需要密码才能打开，即使被他人获取，没有密码也无法查看内容。'
  }
]

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const file = ref<File | null>(null)
const processing = ref(false)
const rendering = ref(false)
const pdfPreviewCanvas = ref<HTMLCanvasElement | null>(null)
const userPassword = ref('')
const ownerPassword = ref('')

const loadPdfPreview = async (f: File) => {
  rendering.value = true
  try {
    const arrayBuffer = await f.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument(arrayBuffer)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.0 })

    // Calculate scale to fit container (max width 600px)
    const maxWidth = 600
    const scale = maxWidth / viewport.width
    const scaledViewport = page.getViewport({ scale })

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
  } catch (error) {
    console.error(error)
    ElMessage.error('预览生成失败，可能是加密文件')
  } finally {
    rendering.value = false
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
  '如果只设置了用户密码，所有者密码将默认与用户密码相同。'
]

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const droppedFiles = e.dataTransfer?.files
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0]
    if (droppedFile.type === 'application/pdf') {
      file.value = droppedFile
    } else {
      ElMessage.error('请上传PDF文件')
    }
  }
}

const handleFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    file.value = target.files[0]
  }
}

const clearFile = () => {
  file.value = null
  userPassword.value = ''
  ownerPassword.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const encryptPdf = async () => {
  if (!file.value) return

  processing.value = true
  try {
    const arrayBuffer = await file.value.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)

    // pdf-lib encrypt method
    // @ts-ignore
    pdfDoc.encrypt({
      userPassword: userPassword.value,
      ownerPassword: ownerPassword.value || userPassword.value, // Fallback owner password to user password if not set
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: false,
        documentAssembly: false,
      }
    })

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `encrypted_${file.value.name}`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('加密成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('加密失败，请重试')
  } finally {
    processing.value = false
  }
}
</script>
