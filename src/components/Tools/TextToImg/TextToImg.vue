<script setup lang="ts">
import { reactive, ref, shallowRef, onBeforeUnmount } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import html2canvas from "html2canvas";
import '@wangeditor/editor/dist/css/style.css' // 引入富文本 css
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'  //富文本组件
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
// import { copy } from '@/utils/string'
const info = reactive({
  title: "文本转图片",
  mode: 'default',
  convasWidth: 860,
  convasBackgroundColor: '#fff',
  downExt: '.png',
  downExts: [
    {
      value: '.png',
      label: '.png'
    },
    {
      value: '.jpg',
      label: '.jpg'
    },
  ]
})
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(`文字转图片演示😀
拥有丰富的样式选择
可自由调整宽度背景色
支持一键导出为长图
`)

// 绑定  需要把那个内容生成图片
const poster = ref();

// 工具栏配置
const toolbarConfig = {
  excludeKeys: [
    "uploadImage",
    "group-video",
    "insertLink",
  ]
}

//编辑器配置
const editorConfig = { placeholder: '请输入内容...' }

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const goDown = () => {
  html2canvas(poster.value, {
    backgroundColor: info.convasBackgroundColor,//海报的背景颜色
    useCORS: true, // 允许跨域
    width: info.convasWidth, //生成海报的w
  }).then(canvas => {
    // canvas 其实就是我们所讲的res 的意思 返回报文的意思
    let baseImg = canvas.toDataURL("image/png");
    if (info.downExt == '.jpg') {
      baseImg = canvas.toDataURL("image/jpg");
    }
    //创建a标签
    let save = document.createElement('a');
    // <a href=''></a>
    save.href = baseImg;
    // 下载的名字
    save.download = 'yz'
    // 直接回调a的点击事件
    save.click()
  })
}

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

//copy
// const copyRes = async (resStr: string) => {
//   copy(resStr)
// }

const route = useRoute()

// 常见问题
const faq = [
  {
    q: '支持哪些图片格式？',
    a: '支持导出为JPG、PNG、WebP等常见图片格式，您可以根据需要选择合适的格式。'
  },
  {
    q: '文字图片的清晰度如何？',
    a: '我们采用高清渲染技术，确保生成的文字图片清晰度高，文字边缘平滑，适合各种场景使用。'
  },
  {
    q: '可以自定义样式吗？',
    a: '支持自定义文字大小、颜色、字体、背景色等多种样式，还可以调整图片尺寸，满足个性化需求。'
  },
  {
    q: '生成的图片有水印吗？',
    a: '生成的图片完全免费，无任何水印。所有处理都在本地完成，保证您的创作隐私。'
  }
]
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">把文本转换成图片，生成长图，富文本自定义文字排版，可导出png，jpeg格式</p>
        </div>

        <!-- 配置区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 基础设置 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">基础设置</div>
            <div class="grid grid-cols-1 gap-6">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div class="flex items-center">
                  <el-text class="w-16 text-gray-600">宽度：</el-text>
                  <div class="w-[300px]">
                    <el-slider v-model="info.convasWidth" show-input :min="260" :max="1920" size="default" />
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <el-select v-model="info.downExt" class="!w-28" size="default" placeholder="选择格式">
                    <el-option v-for="item in info.downExts" :key="item.value" :label="item.label"
                      :value="item.value" />
                  </el-select>
                  <button class="btn-primary" @click="goDown">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    保存
                  </button>
                </div>
              </div>
              <div class="flex items-center">
                <el-text class="w-16 text-gray-600">背景：</el-text>
                <el-color-picker v-model="info.convasBackgroundColor" size="default" />
              </div>
            </div>
          </div>

          <!-- 编辑器区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">编辑内容</div>
            <div class="border bg-white rounded-lg overflow-hidden">
              <Toolbar class="border-b" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="info.mode" />
              <Editor v-model="valueHtml" :defaultConfig="editorConfig" :mode="info.mode" @onCreated="handleCreated"
                class="min-h-[300px]" />
              <div ref="poster" class="absolute top-0 -z-10" v-html="valueHtml"></div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>富文本编辑</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>导出图片</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>自定义样式</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>多种格式</span>
              </div>
            </div>
          </div>

          <!-- 常见问题解答 -->
          <div class="bg-white rounded-xl p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in faq" :key="index"
                class="pb-6 last:pb-0 border-b border-gray-200 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
              </div>
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
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}

:deep(.el-slider) {
  @apply flex-1;
}
</style>
