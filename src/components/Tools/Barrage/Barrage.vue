<!--
 * @file Barrage.vue
 * @description 手持弹幕工具，提供实时弹幕展示功能
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持自定义弹幕内容
 * 2. 可调整播放速度和样式
 * 3. 支持全屏播放模式
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center py-8 px-4 relative">
          <h2 class="text-3xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-4">创建你的专属弹幕，让互动更加生动有趣！</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="px-8 pb-8">
          <!-- 弹幕预览区域 -->
          <div class="mb-8 relative h-[240px] bg-gray-900 rounded-xl overflow-hidden shadow-lg">
            <!-- 预览模式弹幕 -->
            <vue-danmaku ref="previewRef" v-model:danmus="info.barrage" loop :autoplay="false" :speeds="info.speed"
              :channels="info.channels" :extraStyle='info.extraStyle' class="w-full h-full">
              <template v-slot:dm="{ danmu }">
                <div class="" :style="info.extraStyle">
                  <span>{{ danmu }}</span>
                </div>
              </template>
            </vue-danmaku>

            <!-- 全屏模式弹幕 -->
            <vue-danmaku ref="fullscreenRef" v-model:danmus="info.barrage" loop :autoplay="false" :speeds="info.speed"
              :channels="info.channels" :extraStyle='info.extraStyle' :style="info.danmakuFullStyle"
              @dblclick="exitFullscreen">
              <template v-slot:dm="{ danmu }">
                <div class="" :style="info.extraStyle">
                  <span>{{ danmu }}</span>
                </div>
              </template>
            </vue-danmaku>
          </div>

          <!-- 控制面板 -->
          <div class="max-w-2xl mx-auto bg-gray-50 rounded-xl p-6">
            <!-- 弹幕内容输入 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">弹幕内容</label>
              <el-input v-model="info.content" type="textarea" :rows="3" placeholder="请输入弹幕内容" resize="none"
                class="!bg-white shadow-sm hover:shadow transition-shadow duration-300" />
            </div>

            <!-- 播放速度控制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">播放速度</label>
              <el-slider v-model="info.speed" :min="1" :max="500" :format-tooltip="(val: number) => `${val}px/s`"
                class="!mx-2" />
            </div>

            <!-- 文字大小控制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">文字大小</label>
              <el-slider v-model="info.textSize" :min="12" :max="1000" :format-tooltip="(val: number) => `${val}px`"
                class="!mx-2" />
            </div>

            <!-- 颜色控制 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">文字颜色</label>
                <el-color-picker v-model="info.textColor" size="large" @change="setExtraStyle()" class="!w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
                <el-color-picker v-model="info.bgColor" size="large" @change="setExtraStyle()" class="!w-full" />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center justify-center space-x-4">
              <el-button @click="togglePreview" type="primary" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
                {{ info.isPlaying ? '暂停' : '预览' }}
              </el-button>
              <el-button @click="enterFullscreen" type="default" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300"
                :disabled="!info.content">
                全屏播放
              </el-button>
            </div>
            <p class="text-sm text-gray-500 text-center mt-2">全屏模式下双击可退出</p>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
          <!-- 功能点 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index"
              class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
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

          <!-- 适用场景说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(text, index) in usageScenarios" :key="index"
                class="flex items-start space-x-3 bg-white rounded-lg p-4 shadow-sm">
                <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p class="text-sm text-gray-600">{{ text }}</p>
              </div>
            </div>
          </div>

          <!-- 使用说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
            <div class="space-y-6">
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">如何使用？</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>1. 在输入框中输入弹幕内容</p>
                  <p>2. 调整播放速度和文字大小</p>
                  <p>3. 选择合适的文字和背景颜色</p>
                  <p>4. 点击"预览"按钮查看效果</p>
                  <p>5. 点击"全屏播放"进入全屏模式</p>
                  <p>6. 全屏模式下双击可退出</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 建议选择合适的文字大小和速度</p>
                  <p>- 文字颜色应与背景形成对比</p>
                  <p>- 全屏模式下双击可退出</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <div class="mt-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, reactive, ref } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import vueDanmaku from 'vue3-danmaku'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()

const info = reactive({
  title: "手持弹幕",
  content: '',
  barrage: [] as string[],
  speed: 200,
  textSize: 500,
  textColor: '#FFFFFF',
  bgColor: '#000000',
  channels: 1,
  extraStyle: '',
  danmakuFullStyle: "",
  isPlaying: false,
  isFullscreen: false,
  danmakuFullHeight: '100%',
  danmakuFullWidth: '100%',
})

// 功能特点
const features = [
  {
    title: '实时预览',
    desc: '所见即所得的弹幕效果，支持实时调整和预览'
  },
  {
    title: '高度自定义',
    desc: '可自由调整文字大小、颜色、速度等多个参数'
  },
  {
    title: '全屏模式',
    desc: '支持全屏展示，适合各种场景使用'
  }
]

// 适用场景
const usageScenarios = [
  '活动：现场互动、演出、嘉年华等场合',
  '教育：课堂互动、演讲反馈等场景',
  '娱乐：派对、游戏、直播等互动环节',
  '展示：产品发布、展会等展示场合'
]

const previewRef = ref(null) as any
const fullscreenRef = ref(null) as any

// 切换预览状态
const togglePreview = () => {
  if (!info.content) {
    ElMessage.warning('请先输入弹幕内容')
    return
  }

  if (info.isPlaying) {
    previewRef.value.stop()
    info.isPlaying = false
  } else {
    formatBarrage()
    previewRef.value.play()
    info.isPlaying = true
  }
}

// 进入全屏模式
const enterFullscreen = () => {
  if (!info.content) {
    ElMessage.warning('请先输入弹幕内容')
    return
  }

  setExtraStyle()
  formatBarrage()
  fullscreenRef.value.resize()
  fullscreenRef.value.play()
  info.isFullscreen = true
}

// 退出全屏模式
const exitFullscreen = () => {
  setExtraStyle('visibility: hidden;')
  fullscreenRef.value.resize()
  fullscreenRef.value.stop()
  info.isFullscreen = false
}

const setExtraStyle = (danmakuStyleExt: string = '') => {
  info.extraStyle = "color: " + info.textColor + ";font-size: " + info.textSize + "px"
  info.danmakuFullStyle = "z-index: 99; position: fixed; top: 0px; left: 0px; height:" + info.danmakuFullHeight + "; width:" + info.danmakuFullWidth + "; background-color:" + info.bgColor + ";" + danmakuStyleExt
}

const formatBarrage = () => {
  info.barrage[0] = info.content
}

onBeforeMount(() => {
  setExtraStyle('visibility: hidden;')
})
</script>

<style scoped>
.vue-danmaku .danmus .dm {
  top: 50% !important;
}

.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
}

.el-input :deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

.el-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 2px #bfdbfe;
}

.el-slider :deep(.el-slider__runway) {
  margin: 0;
}
</style>
