<template>
  <main
    class="min-h-screen bg-[#0f172a] relative overflow-hidden font-sans text-slate-200 selection:bg-indigo-500 selection:text-white">
    <!-- Background Effects -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse-slow">
      </div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse-slow"
        style="animation-delay: 2s;"></div>
      <div class="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[80px]"></div>
      <div class="stars-bg absolute inset-0 opacity-30"></div>
    </div>

    <div class="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
      <!-- Header -->
      <header class="text-center mb-10 md:mb-16">
        <div
          class="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 backdrop-blur-md shadow-2xl shadow-indigo-500/10 animate-float">
          <span class="text-4xl filter drop-shadow-[0_0_15px_rgba(167,139,250,0.5)]">🔮</span>
        </div>
        <h1
          class="text-3xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-purple-200 tracking-tight">
          {{ selectedZodiac }}座运势查询
        </h1>
        <p class="text-slate-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          探索星象奥秘，解锁今日运程，让好运伴随每一天
        </p>
      </header>

      <!-- Zodiac Selector (Horizontal Scroll) -->
      <nav class="mb-12 relative group">
        <div
          class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0f172a] to-transparent z-10 pointer-events-none md:hidden">
        </div>
        <div
          class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0f172a] to-transparent z-10 pointer-events-none md:hidden">
        </div>

        <div ref="zodiacScroll"
          class="flex overflow-x-auto pb-6 pt-2 gap-3 md:gap-4 px-4 md:justify-center scrollbar-hide snap-x">
          <button v-for="zodiac in zodiacs" :key="zodiac.name" @click="selectedZodiac = zodiac.name"
            class="flex-shrink-0 snap-center flex flex-col items-center justify-center w-20 h-28 rounded-2xl transition-all duration-300 border backdrop-blur-md group/item relative overflow-hidden"
            :class="[
              selectedZodiac === zodiac.name
                ? 'bg-indigo-600/20 border-indigo-400/50 shadow-[0_0_25px_rgba(79,70,229,0.25)] scale-105 translate-y-[-4px]'
                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1'
            ]">
            <div
              class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-900/20 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
            </div>
            <span
              class="text-3xl mb-3 filter drop-shadow-md transition-transform duration-300 group-hover/item:scale-110 relative z-10">{{
                zodiac.icon }}</span>
            <span class="text-xs font-medium relative z-10"
              :class="selectedZodiac === zodiac.name ? 'text-indigo-200' : 'text-slate-500 group-hover/item:text-slate-300'">{{
                zodiac.name }}座</span>
          </button>
        </div>
      </nav>

      <!-- Main Content Area -->
      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Left Column: Info & Actions (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Selected Zodiac Info Card -->
          <div
            class="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
            <div
              class="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-500">
            </div>

            <div class="flex flex-col items-center text-center mb-8 relative z-10">
              <div
                class="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-inner mb-4 ring-1 ring-white/20">
                <span class="text-5xl filter drop-shadow-lg">{{ selectedZodiacInfo?.icon }}</span>
              </div>
              <h2 class="text-3xl font-bold text-white mb-1">{{ selectedZodiac }}座</h2>
              <p class="text-indigo-300/80 font-medium">{{ selectedZodiacInfo?.dateRange }}</p>
            </div>

            <div class="space-y-3 relative z-10">
              <div
                class="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <span class="text-slate-400 text-sm flex items-center gap-2">📅 今日日期</span>
                <span class="text-slate-200 font-mono">{{ new Date().toLocaleDateString() }}</span>
              </div>
              <div
                class="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
                <span class="text-slate-400 text-sm flex items-center gap-2">⭐ 综合指数</span>
                <span class="text-indigo-400 font-bold text-lg">{{ fortune?.discuss || '--' }}</span>
              </div>
            </div>

            <div class="mt-8 flex gap-3 relative z-10">
              <button @click="getFortune" :disabled="loading"
                class="flex-1 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span :class="{ 'animate-spin': loading }" class="text-lg">{{ loading ? '⏳' : '🔄' }}</span>
                {{ loading ? '加载中' : '刷新运势' }}
              </button>
              <button @click="generatePreview" :disabled="!fortune || isGenerating"
                class="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-medium transition-all duration-200 border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <span :class="{ 'animate-spin': isGenerating }" class="text-lg">{{ isGenerating ? '⚙️' : '📤' }}</span>
                分享卡片
              </button>
            </div>
          </div>

          <!-- Tools Recommend (Desktop Sidebar) -->
          <div class="hidden lg:block">
            <!-- Optional space for ads or related tools -->
          </div>
        </div>

        <!-- Right Column: Fortune Details (8 cols) -->
        <div class="lg:col-span-8">
          <!-- Loading State -->
          <div v-if="loading" class="space-y-6 animate-pulse">
            <div class="h-40 bg-white/5 rounded-[2rem]"></div>
            <div class="grid sm:grid-cols-2 gap-5">
              <div class="h-48 bg-white/5 rounded-[2rem]"></div>
              <div class="h-48 bg-white/5 rounded-[2rem]"></div>
              <div class="h-48 bg-white/5 rounded-[2rem]"></div>
              <div class="h-48 bg-white/5 rounded-[2rem]"></div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="error"
            class="h-full flex flex-col items-center justify-center bg-red-500/5 border border-red-500/10 rounded-[2rem] p-12 text-center">
            <div
              class="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-4xl mb-6 animate-bounce">
              ⚠️</div>
            <h3 class="text-red-200 font-bold text-xl mb-2">获取运势失败</h3>
            <p class="text-red-200/60 mb-8 max-w-md">{{ error }}</p>
            <button @click="getFortune"
              class="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg shadow-red-600/20">重试一下</button>
          </div>

          <!-- Content State -->
          <div v-else-if="fortune" class="space-y-6 animate-fade-in-up">
            <!-- Summary Card -->
            <div
              class="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-indigo-500/20 shadow-xl relative overflow-hidden group">
              <div
                class="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-30">
              </div>
              <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl"></div>

              <h3
                class="text-lg font-bold text-indigo-200 mb-4 flex items-center gap-2 uppercase tracking-wider text-xs">
                <span class="text-xl">✨</span> 今日运势概述
              </h3>
              <p class="text-slate-100 leading-loose text-lg font-light tracking-wide">
                {{ fortune.shortcomment }}
              </p>
            </div>

            <!-- Detail Grid -->
            <div class="grid sm:grid-cols-2 gap-5">
              <div v-for="card in displayCards" :key="card.key"
                class="bg-white/5 backdrop-blur-lg rounded-[1.5rem] p-6 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-1 group flex flex-col"
                :class="{ 'col-span-full sm:col-span-2': card.key === 'all' }">
                <div v-if="card.key !== 'all'" class="flex-1">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {{ card.icon }}</div>
                      <span class="font-bold text-slate-200">{{ card.label }}</span>
                    </div>
                    <span v-if="card.score"
                      class="text-emerald-400 font-bold bg-emerald-400/10 px-2 py-1 rounded-lg text-sm">{{ card.score
                      }}</span>
                  </div>
                  <p class="text-slate-400 text-sm leading-relaxed">
                    {{ card.text }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Lucky Items -->
            <div class="bg-white/5 backdrop-blur-lg rounded-[2rem] p-8 border border-white/5">
              <h3 class="text-slate-200 font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-xs">
                <span class="text-xl">🍀</span> 幸运指南
              </h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div v-for="(item, index) in luckyItems" :key="index"
                  class="bg-black/20 rounded-2xl p-4 text-center border border-white/5 hover:border-white/10 transition-colors">
                  <div class="text-slate-500 text-xs mb-2">{{ item.label }}</div>
                  <div class="text-indigo-300 font-bold text-lg truncate">{{ item.value }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 lg:hidden">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>

    <!-- Capture Container (Hidden from view, used for generation) -->
    <div class="fixed left-[-9999px] top-0 z-[-1]">
      <div ref="captureRef" class="w-[375px] bg-[#0f172a] text-white p-0 relative overflow-hidden font-sans">
        <!-- Background for capture -->
        <div class="absolute inset-0 z-0 bg-[#0f172a]">
          <div class="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-purple-900/20 blur-[80px]"></div>
          <div class="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-900/20 blur-[80px]">
          </div>
        </div>

        <div class="relative z-10 p-8">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-white/10 shadow-lg">
                <span class="text-2xl">🔮</span>
              </div>
              <div>
                <div class="text-lg font-bold text-white">星座运势</div>
                <div class="text-xs text-indigo-200/60">{{ new Date().toLocaleDateString() }}</div>
              </div>
            </div>
            <div class="bg-white p-1.5 rounded-xl shadow-lg">
              <canvas ref="qrCodeRef" class="w-14 h-14 block"></canvas>
            </div>
          </div>

          <div v-if="fortune" class="space-y-5">
            <!-- Header -->
            <div class="text-center py-8 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50"></div>
              <div class="relative z-10">
                <div class="text-6xl mb-3 filter drop-shadow-xl">{{ selectedZodiacInfo?.icon }}</div>
                <h2 class="text-3xl font-bold mb-1 text-white">{{ selectedZodiac }}座</h2>
                <div
                  class="inline-block px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300 text-xs mt-2 font-medium border border-indigo-500/20">
                  综合运势 {{ fortune.discuss }}
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="bg-indigo-900/30 p-5 rounded-2xl border border-indigo-500/20">
              <p class="text-sm text-indigo-100 leading-relaxed text-center italic">"{{ fortune.shortcomment }}"</p>
            </div>

            <!-- Grid -->
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div class="text-xs text-slate-400 mb-1 flex items-center gap-1"><span>💝</span> 爱情</div>
                <div class="text-xs text-slate-200 leading-relaxed text-justify">{{ fortune.lovetext }}</div>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div class="text-xs text-slate-400 mb-1 flex items-center gap-1"><span>💼</span> 事业</div>
                <div class="text-xs text-slate-200 leading-relaxed text-justify">{{ fortune.worktext }}</div>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div class="text-xs text-slate-400 mb-1 flex items-center gap-1"><span>💰</span> 财运</div>
                <div class="text-xs text-slate-200 leading-relaxed text-justify">{{ fortune.moneytext }}</div>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <div class="text-xs text-slate-400 mb-1 flex items-center gap-1"><span>🍀</span> 幸运色</div>
                <div class="text-sm font-bold text-indigo-300 mt-1">{{ fortune.luckycolor }}</div>
              </div>
            </div>

            <div class="text-center pt-4 border-t border-white/5">
              <div class="text-[10px] text-slate-500 uppercase tracking-widest">Powered by UIED Tools</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <el-dialog v-model="showPreview" title="运势卡片已生成" width="90%" class="glass-dialog" align-center :show-close="true">
      <div class="flex flex-col items-center gap-6 py-4">
        <div class="relative group cursor-pointer" @click="downloadImage">
          <img v-if="previewImage" :src="previewImage" :alt="`${selectedZodiac}座今日运势分析卡片 - 包含综合、爱情、事业、财运及幸运指南`"
            class="w-full max-w-[320px] rounded-2xl shadow-2xl border border-white/10 transition-transform duration-300 group-hover:scale-[1.02]" />
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-2xl">
            <span class="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">点击保存</span>
          </div>
        </div>
        <div class="flex gap-4 w-full max-w-[320px]">
          <button
            class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-600/20"
            @click="downloadImage">
            保存图片
          </button>
          <button
            class="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/10"
            @click="copyImage">
            复制
          </button>
        </div>
      </div>
    </el-dialog>

  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from '@vue/runtime-core'
import type { Ref } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { ElMessage } from 'element-plus'
import axios, { AxiosError } from 'axios'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

// 接口定义
interface Fortune {
  title: string
  time: string
  health: string
  discuss: string
  luckycolor: string
  luckynumber: string
  luckyconstellation: string
  shortcomment: string
  alltext: string
  lovetext: string
  worktext: string
  moneytext: string
  healthtxt: string
}

// 星座数据
const zodiacs = [
  { name: '白羊', icon: '♈️', type: 'aries', dateRange: '3.21-4.19' },
  { name: '金牛', icon: '♉️', type: 'taurus', dateRange: '4.20-5.20' },
  { name: '双子', icon: '♊️', type: 'gemini', dateRange: '5.21-6.21' },
  { name: '巨蟹', icon: '♋️', type: 'cancer', dateRange: '6.22-7.22' },
  { name: '狮子', icon: '♌️', type: 'leo', dateRange: '7.23-8.22' },
  { name: '处女', icon: '♍️', type: 'virgo', dateRange: '8.23-9.22' },
  { name: '天秤', icon: '♎️', type: 'libra', dateRange: '9.23-10.23' },
  { name: '天蝎', icon: '♏️', type: 'scorpio', dateRange: '10.24-11.22' },
  { name: '射手', icon: '♐️', type: 'sagittarius', dateRange: '11.23-12.21' },
  { name: '摩羯', icon: '♑️', type: 'capricorn', dateRange: '12.22-1.19' },
  { name: '水瓶', icon: '♒️', type: 'aquarius', dateRange: '1.20-2.18' },
  { name: '双鱼', icon: '♓️', type: 'pisces', dateRange: '2.19-3.20' }
]

// 状态管理
const selectedZodiac = ref('白羊')
const fortune: Ref<Fortune | null> = ref(null)
const loading = ref(false)
const error = ref('')
const route = useRoute()
const showPreview = ref(false)
const previewImage = ref('')
const isGenerating = ref(false)
const captureRef = ref<HTMLElement>()
const qrCodeRef = ref<HTMLCanvasElement>()
const zodiacScroll = ref<HTMLElement>()

// 计算当前选中的星座信息
const selectedZodiacInfo = computed(() => {
  return zodiacs.find(z => z.name === selectedZodiac.value)
})

// 显示卡片数据处理
const displayCards = computed(() => {
  if (!fortune.value) return []
  return [
    // 过滤掉综合运势，因为它已经单独显示了，或者保留但换个样式
    { key: 'love', label: '爱情运势', icon: '💝', text: fortune.value.lovetext },
    { key: 'work', label: '事业运势', icon: '💼', text: fortune.value.worktext },
    { key: 'money', label: '财运运势', icon: '💰', text: fortune.value.moneytext },
    { key: 'health', label: '健康运势', icon: '💪', text: fortune.value.healthtxt, score: fortune.value.health }
  ]
})

// 幸运指数数据处理
const luckyItems = computed(() => {
  if (!fortune.value) return []
  return [
    { label: '幸运数字', value: fortune.value.luckynumber },
    { label: '幸运颜色', value: fortune.value.luckycolor },
    { label: '贵人星座', value: fortune.value.luckyconstellation },
    { label: '健康指数', value: fortune.value.health }
  ]
})

// 生成二维码
const generateQRCode = async () => {
  if (!qrCodeRef.value) return
  try {
    const fullUrl = new URL(window.location.pathname, window.location.origin)
    fullUrl.searchParams.set('zodiac', selectedZodiac.value)

    await QRCode.toCanvas(qrCodeRef.value, fullUrl.toString(), {
      width: 100,
      margin: 0,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return true
  } catch (err) {
    console.error('生成二维码失败:', err)
    return false
  }
}

// 生成预览图片
const generatePreview = async () => {
  if (!fortune.value) {
    ElMessage.warning('请先选择星座')
    return
  }

  try {
    isGenerating.value = true

    await nextTick()
    // 等待图片和字体加载
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!captureRef.value) {
      throw new Error('截图容器未找到')
    }

    const qrGenerated = await generateQRCode()
    if (!qrGenerated) {
      throw new Error('二维码生成失败')
    }

    // 确保二维码渲染完成
    await new Promise(resolve => setTimeout(resolve, 100))

    const dpr = window.devicePixelRatio || 2

    // 检查文案完整性
    if (fortune.value.lovetext.length > 300 || fortune.value.worktext.length > 300) {
      ElMessage.warning('文案较长，生成图片可能较大')
    }

    const canvas = await html2canvas(captureRef.value, {
      scale: dpr,
      backgroundColor: '#0f172a', // 强制背景色
      logging: false,
      useCORS: true,
      allowTaint: true,
      imageTimeout: 0,
      // 确保高度自适应
      height: captureRef.value.offsetHeight,
      windowHeight: captureRef.value.scrollHeight
    })

    previewImage.value = canvas.toDataURL('image/png', 1.0)

    // 简单的完整性检查：如果生成失败或为空
    if (previewImage.value.length < 1000) {
      throw new Error('生成图片异常，请重试')
    }

    showPreview.value = true

  } catch (err) {
    console.error('生成预览失败:', err)
    ElMessage.error('生成预览失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

// 复制图片到剪贴板
const copyImage = async () => {
  if (!previewImage.value) return
  try {
    const response = await fetch(previewImage.value)
    const blob = await response.blob()
    const item = new ClipboardItem({ [blob.type]: blob })
    await navigator.clipboard.write([item])
    ElMessage.success('图片已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请尝试保存图片')
  }
}

// 下载图片
const downloadImage = () => {
  if (!previewImage.value) return
  const link = document.createElement('a')
  const dateStr = new Date().toISOString().split('T')[0]
  // 语义化命名：产品名称-功能-规格(时间).png
  link.download = `UIED工具-星座运势-${selectedZodiac.value}-${dateStr}.png`
  link.href = previewImage.value
  link.click()
  ElMessage.success('图片已开始下载')
}

// 获取运势数据
const getFortune = async () => {
  loading.value = true
  error.value = ''
  // fortune.value = null // 不清空旧数据，避免闪烁

  try {
    const response = await axios.get(`https://api.pearktrue.cn/api/xzys/`, {
      params: { xz: selectedZodiac.value }
    })

    if (response.data.code === 200) {
      fortune.value = response.data.data
    } else {
      throw new Error(response.data.msg || '获取运势数据失败')
    }
  } catch (err) {
    const errorMessage = err instanceof AxiosError
      ? err.response?.data?.msg || err.message
      : '获取运势数据失败，请稍后重试'
    error.value = errorMessage
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 监听选择变化
watch(selectedZodiac, () => {
  getFortune()
})

// 组件加载时
onMounted(() => {
  // 检查 URL 参数
  const urlParams = new URLSearchParams(window.location.search)
  const zodiacParam = urlParams.get('zodiac')
  if (zodiacParam && zodiacs.some(z => z.name === zodiacParam)) {
    selectedZodiac.value = zodiacParam
  }

  getFortune()
})

// SEO优化
const pageTitle = computed(() => `${selectedZodiac.value}座今日运势查询 - 星座运程详解`)
const pageDescription = computed(() => {
  if (fortune.value) {
    return `${selectedZodiac.value}座今日运势：${fortune.value.shortcomment}。提供爱情、事业、财运、健康全方位解析。`
  }
  return `免费在线查询${selectedZodiac.value}座今日运势，提供准确的运势预测。`
})

watch([selectedZodiac, fortune], () => {
  useHead({
    title: pageTitle.value,
    meta: [
      { name: 'description', content: pageDescription.value },
      { name: 'keywords', content: `${selectedZodiac.value}座,星座运势,今日运势,运程预测,UIED工具,免费星座查询` }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          'name': `${selectedZodiac.value}座运势查询工具`,
          'applicationCategory': 'LifestyleApplication',
          'operatingSystem': 'Any',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'CNY'
          },
          'description': pageDescription.value,
          'mainEntity': {
            '@type': 'Article',
            'headline': `${selectedZodiac.value}座今日运势分析`,
            'image': `https://www.uiedtool.com/assets/zodiac/${selectedZodiac.value}.png`, // 示例路径
            'datePublished': new Date().toISOString(),
            'author': {
              '@type': 'Organization',
              'name': 'UIED Tools'
            }
          }
        })
      }
    ]
  })
})
</script>

<style scoped>
/* Custom Scrollbar Hide */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Animations */
@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-slow {

  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(1.1);
  }
}

.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stars-bg {
  background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 50px 160px, #ddd, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
    radial-gradient(2px 2px at 160px 120px, #ddd, rgba(0, 0, 0, 0));
  background-repeat: repeat;
  background-size: 200px 200px;
}

/* Glass Dialog Override */
:deep(.glass-dialog) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.glass-dialog .el-dialog__header) {
  display: none;
}

:deep(.glass-dialog .el-dialog__body) {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>
