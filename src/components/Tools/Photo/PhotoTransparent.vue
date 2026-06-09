<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-21
 */
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 border border-gray-100">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3">
            <span class="text-gray-800">{{ $ensureFreeToolTitle(info.title) }}</span>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <div class="grid grid-cols-1 gap-8">
          <div class="relative border border-dashed rounded-lg min-h-[200px] flex flex-col items-center justify-center transition-colors duration-200 bg-white"
            :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'" @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false">
            <input ref="fileInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              @change="handleFileInputChange" />

            <div class="absolute inset-0 cursor-pointer z-10" @click="triggerFileInput"></div>

            <div class="text-center px-4">
              <div class="w-8 h-8 mb-2 mx-auto">
                <svg class="w-full h-full text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div class="text-sm font-medium text-gray-600 mb-1">点击或拖拽照片到这里</div>
              <p class="text-xs text-gray-400 mb-1">支持 JPG、PNG、WebP 格式，文件大小不超过 10MB</p>
              <p class="text-xs text-gray-400">建议上传正面免冠照片，抠图效果更稳定</p>
            </div>
          </div>

          <MemberCoreToolTips
            v-if="currentMemberCoreExperience"
            :tool-key="currentMemberCoreExperience.toolKey"
            :title="memberCoreTipsTitle"
            :items="memberCoreTipsItems"
          />

          <div v-if="currentImage" class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">选择证件类型（用于后续裁剪参考）</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button v-for="type in documentTypes" :key="type.id" class="p-4 rounded-lg border transition-all duration-200"
                :class="selectedType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'"
                @click="selectType(type.id)">
                <div class="text-sm text-gray-700 text-center">{{ type.name }}</div>
                <div class="text-xs text-gray-400 text-center mt-1">{{ type.size }}</div>
              </button>
            </div>

            <div class="flex flex-wrap gap-3 mt-6">
              <el-button type="primary" size="large" :loading="isProcessing" @click="processImage" class="!h-10">
                {{ isProcessing ? 'AI抠图处理中...' : '开始AI抠图' }}
              </el-button>
              <el-button size="large" @click="triggerFileInput" class="!h-10">
                上传其他照片
              </el-button>
              <el-button v-if="processedImageUrl" type="success" size="large" @click="downloadImage" class="!h-10">
                下载透明图
              </el-button>
            </div>
          </div>

          <div v-if="currentImage || processedImageUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">原始照片</div>
              <div class="relative aspect-[3/4] bg-white rounded-lg overflow-hidden">
                <img v-if="currentImage" :src="currentImage" class="w-full h-full object-contain" />
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm text-gray-600 mb-3">透明背景效果</div>
              <div class="relative aspect-[3/4] transparent-bg rounded-lg overflow-hidden">
                <img v-if="processedImageUrl" :src="processedImageUrl" class="w-full h-full object-contain" />
                <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400">
                  等待处理...
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">ModelScope 抠图模型</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  支持后台切换人物抠像与通用抠像模型，前端会自动读取当前配置并生效。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">透明 PNG 直接下载</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  输出标准透明 PNG，可直接用于证件照换底色、排版打印和后续编辑。
                </p>
              </div>
              <div class="border border-gray-100 rounded-lg p-6">
                <h4 class="text-base font-medium text-gray-900 mb-3">可接入配额管理</h4>
                <p class="text-sm text-gray-600 leading-relaxed">
                  当前接口已独立为 `/api/matting/*`，后续可以无缝接 likeadmin-go 会员与次数控制。
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index" class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import MemberCoreToolTips from '@/components/Common/MemberCoreToolTips.vue'
import { requestMattingImage, warmupMattingModelId } from '@/services/matting'
import { useToolConsume } from '@/composables/useToolConsume'
import { useMemberCoreToolExperienceTips } from '@/composables/useMemberCoreToolExperienceTips'

const info = reactive({
  title: '证件照透明背景工具',
  subtitle: '上传照片后调用 AI 抠图模型，输出透明 PNG 图片'
})

const documentTypes = [
  { id: 1, name: '一寸照片', size: '25×35mm' },
  { id: 2, name: '二寸照片', size: '35×49mm' },
  { id: 3, name: '小二寸', size: '35×45mm' },
  { id: 4, name: '大一寸', size: '33×48mm' },
  { id: 5, name: '护照照片', size: '33×48mm' },
  { id: 6, name: '签证照片', size: '33×48mm' },
  { id: 7, name: '身份证照片', size: '26×32mm' },
  { id: 8, name: '驾驶证照片', size: '21×26mm' }
]

const currentImage = ref('')
const processedImageUrl = ref('')
const selectedType = ref(1)
const isProcessing = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const processedObjectUrl = ref('')
const route = useRoute()
const { ensureToolConsume } = useToolConsume()
const {
  currentMemberCoreExperience,
  memberCoreTipsTitle,
  memberCoreTipsItems
} = useMemberCoreToolExperienceTips(route)

const faq = [
  {
    q: '支持哪些照片格式？',
    a: '支持 JPG、PNG、WebP 等常见图片格式，建议上传清晰正面照。'
  },
  {
    q: '生成的照片是什么格式？',
    a: '处理后为透明 PNG，可直接用于换底色和证件照排版。'
  },
  {
    q: '照片会长期保存吗？',
    a: '不会，接口仅用于实时推理，不做业务存储。后续可由你后台配置审计策略。'
  },
  {
    q: '如果抠图失败怎么办？',
    a: '可尝试更清晰的人像图片，或更换背景更干净的原图后重试。'
  }
]

/**
 * 函数说明：释放旧的对象 URL，避免浏览器内存泄漏
 */
const cleanupProcessedObjectUrl = () => {
  if (!processedObjectUrl.value) return
  URL.revokeObjectURL(processedObjectUrl.value)
  processedObjectUrl.value = ''
}

/**
 * 函数说明：处理文件选择事件并完成基础校验
 */
const handleFileInputChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]
  handleImageUpload(file)
  input.value = ''
}

/**
 * 函数说明：处理拖拽上传并复用统一上传逻辑
 */
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files?.length) return

  const file = files[0]
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  handleImageUpload(file)
}

/**
 * 函数说明：触发原生文件选择器
 */
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

/**
 * 函数说明：读取本地图片用于预览，并保存原始文件对象
 */
const handleImageUpload = (file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过 10MB')
    return
  }

  selectedFile.value = file
  if (currentImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImage.value)
  }
  currentImage.value = URL.createObjectURL(file)
  cleanupProcessedObjectUrl()
  processedImageUrl.value = ''
}

/**
 * 函数说明：记录证件类型选择，便于后续联动裁剪能力
 */
const selectType = (typeId: number) => {
  selectedType.value = typeId
}

/**
 * 函数说明：调用后端 AI 抠图接口并更新透明图预览
 */
const processImage = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先上传照片')
    return
  }
  const canConsume = await ensureToolConsume({
    toolKey: 'photo-transparent',
    action: 'matting',
    loginWarningText: '请先登录后再使用透明背景抠图',
    showConsumeSuccessToast: true
  })
  if (!canConsume) {
    return
  }

  isProcessing.value = true
  try {
    const resultBlob = await requestMattingImage(selectedFile.value)
    cleanupProcessedObjectUrl()
    const objectUrl = URL.createObjectURL(resultBlob)
    processedObjectUrl.value = objectUrl
    processedImageUrl.value = objectUrl
    ElMessage.success('AI 抠图完成')
  } catch (error) {
    const message = error instanceof Error ? error.message : '抠图失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    isProcessing.value = false
  }
}

/**
 * 函数说明：下载透明背景 PNG 结果图
 */
const downloadImage = async () => {
  if (!processedImageUrl.value) return
  const canDownload = await ensureToolConsume({
    toolKey: 'photo-transparent',
    action: 'download',
    mode: 'check-login',
    loginWarningText: '请先登录后再下载透明背景图片'
  })
  if (!canDownload) {
    return
  }

  const name = selectedFile.value?.name || 'photo'
  const baseName = name.replace(/\.[^.]+$/, '')
  const link = document.createElement('a')
  link.href = processedImageUrl.value
  link.download = `${baseName}_transparent.png`
  link.click()
}

onBeforeUnmount(() => {
  if (currentImage.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentImage.value)
  }
  cleanupProcessedObjectUrl()
})

onMounted(() => {
  warmupMattingModelId()
})
</script>

<style scoped>
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.transparent-bg {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  background-color: #ffffff;
}
</style>
