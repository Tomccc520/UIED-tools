<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-03
 -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElButton, ElInput, ElSelect, ElOption } from 'element-plus'
import { useRoute } from 'vue-router'
import axios from 'axios'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = {
  title: "免费在线文本配音生成工具",
  subtitle: "输入文本，选择喜欢的角色和风格，一键生成自然流畅的语音配音"
}

const text = ref('')
const loading = ref(false)
const audioUrl = ref('')
const roles = ref<any[]>([])
const styles = ref<any[]>([])

const params = reactive({
  text: '',
  role: 'zh-CN-XiaoyiNeural',
  style: 'cheerful'
})

// Hardcoded defaults based on example, in case fetch fails or structure is complex
const defaultRoles = [
  { label: '晓伊 (Xiaoyi) - 少女音', value: 'zh-CN-XiaoyiNeural' },
  { label: '云希 (Yunxi) - 阳光男声', value: 'zh-CN-YunxiNeural' },
  { label: '云野 (Yunye) - 沉稳男声', value: 'zh-CN-YunyeNeural' },
  { label: '晓墨 (Xiaomo) - 知性女声', value: 'zh-CN-XiaomoNeural' },
  { label: '晓睿 (Xiaorui) - 成熟女声', value: 'zh-CN-XiaoruiNeural' },
  { label: '晓双 (Xiaoshuang) - 活泼女声', value: 'zh-CN-XiaoshuangNeural' },
]

const defaultStyles = [
  { label: '愉快 (Cheerful)', value: 'cheerful' },
  { label: '悲伤 (Sad)', value: 'sad' },
  { label: '愤怒 (Angry)', value: 'angry' },
  { label: '恐惧 (Fearful)', value: 'fearful' },
  { label: '冷静 (Calm)', value: 'calm' },
  { label: '严肃 (Serious)', value: 'serious' },
  { label: '深情 (Affectionate)', value: 'affectionate' },
  { label: '温和 (Gentle)', value: 'gentle' },
]

const generateAudio = async () => {
  if (!params.text.trim()) {
    ElMessage.warning('请输入要配音的文本')
    return
  }

  loading.value = true
  audioUrl.value = ''

  try {
    const res = await axios.get('https://api.pearktrue.cn/api/freedub', {
      params: {
        text: params.text,
        role: params.role,
        style: params.style
      }
    })

    if (res.data.code === 200) {
      audioUrl.value = res.data.data.audio_url
      ElMessage.success('配音生成成功')
    } else {
      ElMessage.error(res.data.msg || '生成失败，请重试')
    }
  } catch (error) {
    console.error('Generate error:', error)
    ElMessage.error('生成出错，请稍后重试')
  } finally {
    loading.value = false
  }
}

// Initialize with defaults
roles.value = defaultRoles
styles.value = defaultStyles

onMounted(() => {
  // Future: fetchOptions() if API supports dynamic listing
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 头部区域 -->
      <div class="bg-white rounded-xl p-8 mb-6 shadow-sm relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>

        <div class="relative z-10">
          <div class="text-center mb-8">
            <h1
              class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
              {{ info.title }}
            </h1>
            <p class="text-gray-500">{{ info.subtitle }}</p>
          </div>

          <!-- 推荐链接 -->
          <div class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <a href="https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              每日免费分享最新AI资讯
            </a>
            <a href="https://www.uied.cn/" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI学习平台
            </a>
            <a href="https://uiedtool.com" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI免费工具uiedtool.com
            </a>
            <a href="https://hot.uied.cn" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI资讯热榜hot.uied.cn
            </a>
            <a href="https://hao.uied.cn/ai" target="_blank"
              class="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1">
              AI工具导航
            </a>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- 左侧设置区 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 参数设置 -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <span class="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
              配音设置
            </h3>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">选择角色</label>
                <el-select v-model="params.role" class="w-full" placeholder="请选择配音角色" size="large">
                  <el-option v-for="item in roles" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">情感风格</label>
                <el-select v-model="params.style" class="w-full" placeholder="请选择情感风格" size="large">
                  <el-option v-for="item in styles" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 使用说明 -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span class="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
              使用说明
            </h3>
            <div class="text-sm text-gray-600 space-y-3 leading-relaxed">
              <p class="flex items-start gap-2">
                <span
                  class="bg-indigo-50 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                <span>在右侧文本框输入需要配音的文字内容。</span>
              </p>
              <p class="flex items-start gap-2">
                <span
                  class="bg-indigo-50 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                <span>选择合适的配音角色和情感风格。</span>
              </p>
              <p class="flex items-start gap-2">
                <span
                  class="bg-indigo-50 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                <span>点击"开始生成"按钮，等待AI处理。</span>
              </p>
              <p class="flex items-start gap-2">
                <span
                  class="bg-indigo-50 text-indigo-600 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                <span>生成完成后可直接试听或下载音频。</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 右侧操作区 -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 文本输入 -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div class="mb-4 flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-2">配音文本</label>
              <el-input v-model="params.text" type="textarea" :rows="12" placeholder="请输入需要配音的文本内容..." maxlength="500"
                show-word-limit resize="none" class="!text-base" input-style="font-size: 16px; line-height: 1.6;" />
            </div>

            <div class="flex justify-end pt-4 border-t border-gray-50">
              <el-button type="primary" size="large" @click="generateAudio" :loading="loading"
                class="!px-10 !h-12 !text-base !rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-shadow">
                {{ loading ? '正在生成语音...' : '开始生成语音' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 生成结果 (Full Width) -->
      <div v-if="audioUrl" class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 animate-fade-in mb-8">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <div class="flex-shrink-0 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <div class="flex-1 w-full">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">生成成功！</h3>
            <p class="text-gray-500 text-sm mb-4">您的语音已准备就绪，请试听或下载。</p>
            <div class="flex flex-col md:flex-row gap-4 items-center">
              <audio controls class="w-full md:w-auto flex-1 h-10">
                <source :src="audioUrl" type="audio/mpeg">
                您的浏览器不支持音频播放。
              </audio>
              <a :href="audioUrl" target="_blank" download="generated_audio.mp3"
                class="el-button el-button--success is-plain !px-6 !h-10 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下载音频
              </a>
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
