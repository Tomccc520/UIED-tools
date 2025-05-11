<script setup lang="ts">
import { ref, reactive } from '@vue/runtime-core'
import SignImageCore from './SignImageCore.vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import { UploadProps, UploadInstance, UploadRawFile, genFileId, UploadFile } from 'element-plus'
import { autoDown } from '@/utils/file'
import { Jh_getTimeStamp } from '@/utils/time'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 图片处理
const info = reactive({
  title: "在线编辑图片",
  //图片地址
  previewsImgUrl: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
  //获取处理完的图片
  getNewImg: (url: string) => {
    //下载
    autoDown(url, Jh_getTimeStamp() + '.png')
  },
  //用于刷新组件视图
  cKey: 1,
})

//使用 upload ref
const upload = ref<UploadInstance>()
//使用 SignImageCore ref
const refSignImageCore = ref<any>()

//上传文件发生变化
const uploadChange: UploadProps['onChange'] = (file: UploadFile) => {
  //UploadFile转换url
  info.previewsImgUrl = URL.createObjectURL(file.raw!)
  // 更新组件
  info.cKey++
}

//钩子 - 文件上传超出限制
const uploadExceed: UploadProps['onExceed'] = (files: UploadRawFile[]) => {
  upload.value!.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

//保存图片
const saveImg = () => {
  refSignImageCore.value!.save()
}

const route = useRoute()

// 常见问题
const faq = [
  {
    q: '支持哪些图片格式？',
    a: '支持上传JPG、PNG、WebP等常见图片格式，编辑后可以选择导出为相同格式，保持原图质量。'
  },
  {
    q: '支持哪些编辑功能？',
    a: '支持图片裁剪、添加标注、滤镜效果、尺寸调整等多种编辑功能，满足基础的图片编辑需求。'
  },
  {
    q: '编辑后的图片质量如何？',
    a: '我们采用高质量的图片处理技术，确保编辑后的图片清晰度不会降低，可以放心使用。'
  },
  {
    q: '图片会上传到服务器吗？',
    a: '所有图片编辑过程都在浏览器本地完成，不会上传到服务器，保证您的图片安全和隐私。'
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
          <p class="text-gray-500 text-sm mt-6">在线图片编辑工具，支持裁剪、标注、滤镜等多种功能</p>
        </div>

        <!-- 配置区域 -->
        <div class="grid grid-cols-1 gap-8">
          <!-- 工具栏 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">操作</div>
            <div class="flex gap-4">
              <el-upload ref="upload" :limit="1" @exceed="uploadExceed" accept="image/*" @change="uploadChange"
                :auto-upload="false" :show-file-list="false">
                <template #trigger>
                  <button class="btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    选择图片
                  </button>
                </template>
              </el-upload>
              <button class="btn-secondary" @click="saveImg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                保存图片
              </button>
            </div>
          </div>

          <!-- 图片编辑区域 -->
          <div class="bg-gray-50 rounded-lg p-6" style="height: 600px;">
            <SignImageCore ref="refSignImageCore" :key="info.cKey" :dialogVisible.sync="true" :title="info.title"
              :imgUrl="info.previewsImgUrl" @getNewImg="info.getNewImg"></SignImageCore>
          </div>

          <!-- 功能说明 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>图片裁剪</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>图片标注</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span>滤镜效果</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>尺寸调整</span>
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

      <!-- 工具推荐区域 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
/* 统一的按钮样式 */
.btn-primary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-base transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-base transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
