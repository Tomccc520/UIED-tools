<!--
 * @file TextEdit.vue
 * @description 富文本编辑器，支持HTML实时预览
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-22
 *
 * 功能特性：
 * 1. 支持富文本编辑
 * 2. 实时HTML预览
 * 3. 一键复制HTML
 * 4. 多种文本格式
 * 5. 所见即所得
-->

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, onMounted } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { copy } from '@/utils/string'

const route = useRoute()

// 组件配置信息
const info = {
  title: "富文本编辑器",
  subtitle: "在线文本编辑工具，支持HTML实时预览",
  mode: 'default'
}

// 编辑器实例
const editorRef = shallowRef()
const content = ref('')
const html = ref('')

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    "uploadImage",
    "group-video",
    "insertLink",
  ]
}

// 编辑器配置
const editorConfig = {
  placeholder: '请输入需要编辑的文本内容...'
}

// 编辑器创建完成
const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// 内容变化时更新HTML
const handleChange = (editor: any) => {
  html.value = editor.getHtml()
}

// 复制HTML
const copyHtml = async () => {
  await copy(html.value)
}

// 功能特点
const features = [
  {
    title: '所见即所得',
    desc: '实时编辑和预览，直观展示效果'
  },
  {
    title: '多种格式',
    desc: '支持加粗、斜体、列表等多种文本格式'
  },
  {
    title: 'HTML导出',
    desc: '一键复制HTML代码，方便使用'
  }
]

// 适用场景
const usageScenarios = [
  '内容编辑：编写格式化的文本内容',
  '网页制作：快速生成HTML代码',
  '文档编辑：制作美观的文档',
  '邮件编写：创作格式丰富的邮件'
]

// 常见问题
const faqs = [
  {
    question: '如何使用富文本编辑器？',
    answer: '直接在编辑区域输入文本，使用工具栏的按钮设置文本格式，编辑完成后可以在下方预览HTML代码并复制使用。'
  },
  {
    question: '支持哪些文本格式？',
    answer: '支持加粗、斜体、下划线、列表、对齐方式等常用的文本格式，工具栏上都有相应的按钮。'
  },
  {
    question: '如何获取HTML代码？',
    answer: '编辑完成后，HTML代码会自动显示在下方的预览区域，点击"复制HTML"按钮即可复制代码。'
  },
  {
    question: '可以直接编辑HTML代码吗？',
    answer: '为了确保代码的正确性，HTML代码区域是只读的，需要通过可视化编辑器来修改内容。'
  }
]

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

onMounted(() => {
  // 初始化操作（如果需要）
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 编辑器区域 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-medium text-gray-700">编辑区域</h3>
              <span class="text-sm text-gray-500">支持多种文本格式</span>
            </div>
          </div>

          <div class="border rounded-lg overflow-hidden shadow-sm">
            <Toolbar class="border-b" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="info.mode" />
            <Editor class="min-h-[300px]" v-model="content" :defaultConfig="editorConfig" :mode="info.mode"
              @onCreated="handleCreated" @onChange="handleChange" />
          </div>

          <!-- HTML预览 -->
          <div class="mt-8 border rounded-lg p-6 bg-gray-50">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <h3 class="text-base font-medium text-gray-700">HTML预览</h3>
                <span class="text-sm text-gray-500">自动生成的HTML代码</span>
              </div>
              <el-button type="primary" @click="copyHtml" :disabled="!html" class="px-6 h-10">复制HTML</el-button>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white shadow-sm">
              <el-input v-model="html" readonly type="textarea" :rows="6" placeholder="HTML代码将在这里显示..."
                class="w-full font-mono" />
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
              </div>
              <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div v-for="(item, index) in faqs" :key="index" class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.question }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.el-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1.5rem;
  border: none;
  background-color: #fff;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}

:deep(.w-e-text-container) {
  background-color: #fff;
}

:deep(.w-e-toolbar) {
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  padding: 0.5rem;
}

:deep(.w-e-bar-item) {
  border-radius: 0.375rem;
}

:deep(.w-e-bar-item:hover) {
  background-color: #f3f4f6;
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}
</style>
