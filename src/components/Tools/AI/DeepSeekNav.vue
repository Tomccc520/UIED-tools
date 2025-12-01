<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <!-- 页面标题 -->
        <div class="mb-6">
          <div class="max-w-4xl mx-auto">
            <div class="flex flex-col items-center text-center">
              <!-- Logo -->
              <div class="w-12 h-12 mb-4 hidden md:block">
                <img :src="deepseekLogo" alt="DeepSeek Logo" class="w-full h-full" />
              </div>
              <!-- 标题内容部分 -->
              <div class="w-full">
                <!-- 标题和移动端 Logo -->
                <div class="flex items-center justify-center">
                  <img :src="deepseekLogo" alt="DeepSeek Logo" class="w-10 h-10 md:hidden mr-2" />
                  <h1
                    class="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    DeepSeek 导航
                  </h1>
                  <span class="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded-full ml-2">持续更新中</span>
                </div>
                <!-- 副标题 -->
                <p class="text-xs md:text-sm text-gray-500 mt-2">发现免费好用的 DeepSeek 模型服务，让您快速找到合适的AI工具</p>

                <!-- 导航链接 -->
                <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3">

                  <a @click="handleNavigation('https://www.uied.cn/circle/84503.html')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek本地部署</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://www.uied.cn/collection/deepseek')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek学习教程</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://www.uied.cn/circle/deepseek')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek常见问题</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://www.uied.cn/circle/84986.html')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek交流群</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('/changelog')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek更新记录</a>
                  <a @click="handleNavigation('https://www.uied.cn/circle/85520.html')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">免费领取清华北大
                    Deepseek学习手册</a>
                  <a @click="handleNavigation('https://uiedtool.com/tools/ai/deepseek-prompt')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek 提示词指南</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="mb-8">
          <div class="flex flex-col gap-6">
            <!-- 搜索框 -->
            <div class="w-full relative group">
              <div class="relative">
                <input v-model="searchText" type="text" placeholder="搜索模型名称或描述..."
                  class="w-full px-4 py-3 pr-24 rounded-xl border-2 border-gray-200 group-hover:border-blue-400 focus:border-blue-500 outline-none transition-colors duration-200" />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span v-if="searchText" @click="searchText = ''"
                    class="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span class="p-1.5 rounded-full bg-gray-50 text-gray-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <!-- 分类筛选 -->
            <div class="flex flex-wrap gap-2">
              <button v-for="filter in ['全部', '官方', '多轮对话', '联网', '搜索', '大厂', '本地部署', '知识库', '编程开发', '企业级', '深度思考']"
                :key="filter" @click="currentFilter = filter" :class="[
                  'px-4 py-2 rounded-xl text-sm transition-transform duration-200',
                  currentFilter === filter
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
                ]">
                {{ filter }}
              </button>
            </div>
          </div>
        </div>

        <!-- 模型展示区域 -->
        <div class="space-y-8">
          <!-- 官方部署 -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">官方网址</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="item in filteredOfficialItems" :key="item.id"
                class="group bg-white rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer will-change-transform hover:-translate-y-1"
                @click="handleNavigation(item.url)">
                <div class="p-4">
                  <div class="flex items-start gap-3">
                    <img :src="item.logo" :alt="item.title"
                      class="w-10 h-10 rounded-lg transition-transform duration-200 will-change-transform group-hover:scale-110" />
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3
                          class="text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                          {{
                            item.title }}</h3>
                        <span v-if="item.online"
                          class="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full">在线</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-3 transition-colors duration-200 group-hover:text-gray-900">{{
                        item.description }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="tag in item.tags" :key="tag"
                          class="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-full transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                          {{ tag }}
                        </span>
                      </div>
                      <!-- 访问按钮 -->
                      <div
                        class="mt-3 flex justify-end opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                        <button class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <span>访问</span>
                          <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 推荐使用 -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">推荐使用</h2>
            <div class="flex items-center gap-2 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm font-medium text-blue-700">官网服务繁忙时使用 - 以下均为可靠的替代方案</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="item in filteredRecommendedItems" :key="item.id"
                class="group bg-white rounded-xl overflow-hidden border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                @click="handleNavigation(item.url)">
                <div class="p-4">
                  <div class="flex items-start gap-3">
                    <img :src="item.logo" :alt="item.title"
                      class="w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-300" />
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{{
                          item.title }}</h3>
                        <span v-if="item.online"
                          class="px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-full">在线</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-3 group-hover:text-gray-900 transition-colors">{{
                        item.description }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="tag in item.tags" :key="tag"
                          class="px-2 py-0.5 text-xs bg-gray-50 text-gray-600 rounded-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {{ tag }}
                        </span>
                      </div>
                      <!-- 访问按钮 -->
                      <div class="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                          <span>访问</span>
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 工具推荐组件 -->
  <div class="mt-4">
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

// 导入图片资源
import deepseekLogo from '@/assets/images/deepseek-copy.svg'
import wenxiaobaiLogo from '@/assets/images/wenxiaobai.webp'
import marscodelogo from '@/assets/images/MarsCode.png'
import uiedLogo from '@/assets/uiedlogo.png'
import logo360 from '@/assets/images/360.png'
import metasoLogo from '@/assets/images/metaso.png'
import dingtalkLogo from '@/assets/images/dingtalk.png'
import siliconflowLogo from '@/assets/images/siliconflow.png'
import tiangongLogo from '@/assets/images/tiangong.webp'
import huaweiLogo from '@/assets/images/huawei.webp'
import scnetLogo from '@/assets/images/scnet.png'
import yuanbaoLogo from '@/assets/images/yuanbao.png'
import zhihuLogo from '@/assets/images/zhihu.png'
import imaLogo from '@/assets/images/ima.png'
import tencentLogo from '@/assets/images/tencent.png'
import xunfeiLogo from '@/assets/images/xunfei.png'
import askmanyLogo from '@/assets/images/askmany.svg'
import wpsLogo from '@/assets/images/wps.png'
import qqBrowserLogo from '@/assets/images/qq-browser.png'
import youdaoLogo from '@/assets/images/youdao.png'
import alipayLogo from '@/assets/images/alipay.png'
import yuewenLogo from '@/assets/images/yuewen.png'
import baiduLogo from '@/assets/images/baidu.png'

const route = useRoute()
const router = useRouter()

// SEO基础标签
const updateSEOTags = () => {
  // 标题
  document.title = `DeepSeek导航 - 免费好用的AI模型服务`

  // 描述
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', 'DeepSeek导航为您提供最新最全的DeepSeek模型服务和AI工具导航，包括官方部署、教程、常见问题等资源。发现免费好用的AI工具，让您快速找到合适的DeepSeek应用。')

  // 关键词
  let metaKeywords = document.querySelector('meta[name="keywords"]')
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta')
    metaKeywords.setAttribute('name', 'keywords')
    document.head.appendChild(metaKeywords)
  }
  metaKeywords.setAttribute('content', 'DeepSeek,AI模型,人工智能,DeepSeek导航,AI工具,DeepSeek教程')
}

onMounted(() => {
  try {
    // 初始化SEO标签
    updateSEOTags()
  } catch (error) {
    console.error('SEO标签设置失败:', error)
  }
})

// 添加组件加载状态
const isLoading = ref(true)

// 搜索和筛选状态
const searchText = ref('')
const currentFilter = ref('全部')

interface NavItem {
  id: number
  title: string
  logo: string
  description: string
  tags: string[]
  online: boolean
  speed: 'fast' | 'medium' | 'slow'
  releaseDate: string
  url: string
}

// 示例数据
const officialItems = ref<NavItem[]>([
  {
    id: 1,
    title: 'DeepSeek官网',
    logo: deepseekLogo,
    description: 'DeepSeek 官方网站，了解最新的产品动态和技术进展',
    tags: ['官方', '产品介绍', '技术博客'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-01',
    url: 'https://www.deepseek.com/'
  },
  {
    id: 2,
    title: 'Api开放平台',
    logo: deepseekLogo,
    description: 'DeepSeek API开放平台，为开发者提供强大的AI能力',
    tags: ['官方', 'API', '开发者'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-10',
    url: 'https://platform.deepseek.com/'
  },
  {
    id: 3,
    title: 'DeepSeek服务状态',
    logo: deepseekLogo,
    description: '实时查看 DeepSeek 各项服务的运行状态和性能表现',
    tags: ['官方', '服务监控', '状态页面'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-15',
    url: 'https://status.deepseek.com/'
  },
  {
    id: 4,
    title: 'DeepSeek Github',
    logo: deepseekLogo,
    description: 'DeepSeek 开源项目仓库，获取最新的模型和代码',
    tags: ['官方', '开源', '代码仓库'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-18',
    url: 'https://github.com/deepseek-ai'
  },
  {
    id: 5,
    title: 'DeepSeek官方提示库',
    logo: deepseekLogo,
    description: '官方提供的提示词库，帮助您更好地使用 DeepSeek 模型',
    tags: ['官方', '提示词', '使用指南'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-20',
    url: 'https://api-docs.deepseek.com/zh-cn/prompt-library/'
  }
])

const recommendedItems = ref<NavItem[]>([

  {
    id: 117,
    title: 'AskManyAl',
    logo: askmanyLogo,
    description: '免费使用满血版DeepSeek-R1，支持联网搜索、图片文档对话，体验接近官网',
    tags: ['免费', '联网', '多模态'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-28',
    url: 'https://askmany.cn/login?i=bd8ce9a1'
  },
  {
    id: 102,
    title: '豆包MarsCode',
    logo: marscodelogo,
    description: '豆包MarsCode，基于DeepSeek模型的智能编程助手',
    tags: ['编程开发', '代码', '开发助手'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-02-15',
    url: 'https://www.marscode.cn/?utm_source=advertising&utm_medium=uied.cn_ug_cpa&utm_term=hw_marscode_uied&utm_content=home'
  },
  {
    id: 103,
    title: 'DeepSeek AI 智能助手',
    logo: uiedLogo,
    description: '基于 DeepSeek R1 模型的智能对话助手，支持多轮对话和深度思考',
    tags: ['官方', '智能对话', '深度思考'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-02-20',
    url: '/tools/ai/deepseek-r1'
  },
  {
    id: 104,
    title: '360纳米AI搜索',
    logo: logo360,
    description: '360集团打造，基于华为昇腾服务器，集成DeepSeek全系列模型，支持多模态搜索',
    tags: ['搜索', '多模态', '大厂'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-02-25',
    url: 'https://www.n.cn/'
  },
  {
    id: 105,
    title: '秘塔AI搜索',
    logo: metasoLogo,
    description: '集成DeepSeek R1满血版，支持联网+长思考模式，中文优化，文献阅读与信息整合的理想选择',
    tags: ['搜索', '联网', '长思考'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-01',
    url: 'https://metaso.cn/'
  },
  {
    id: 106,
    title: '钉钉AI助理',
    logo: dingtalkLogo,
    description: '阿里系办公平台，集成DeepSeek R1/V3模型，企业级解决方案，支持PC+移动多端协同',
    tags: ['办公', '企业级', '多端协同'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-05',
    url: 'https://page.dingtalk.com/wow/dingtalk/default/dingtalk/AIzhuli'
  },
  {
    id: 107,
    title: '硅基流动+Cherry Studio',
    logo: siliconflowLogo,
    description: '注册即送14元额度，享受多模型一站式体验！搭配Cherry Studio客户端，轻松保存聊天记录、创建知识库',
    tags: ['多模型', '知识库', '客户端'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-08',
    url: 'https://www.uied.cn/84831.html'
  },
  {
    id: 108,
    title: '天工AI',
    logo: tiangongLogo,
    description: '昆仑万维天工AI重磅升级，新增深度思考R1模式，基于DeepSeek-R1底座模型',
    tags: ['搜索', 'AI助手', '深度思考'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-10',
    url: 'https://www.tiangong.cn/'
  },
  {
    id: 109,
    title: '华为小艺助手',
    logo: huaweiLogo,
    description: '华为官方AI助手，已接入DeepSeek模型，提供稳定可靠的对话服务',
    tags: ['大厂', '稳定', '可靠'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-12',
    url: 'https://xiaoyi.huawei.com/chat/'
  },
  {
    id: 110,
    title: '国家超算互联网平台',
    logo: scnetLogo,
    description: '支持DeepSeek-R1，提供7B、32B、70b和671b版本，免费体验',
    tags: ['超算', '免费', '多版本'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-15',
    url: 'https://chat.scnet.cn/'
  },
  {
    id: 111,
    title: 'DeepSeek本地部署+Cherry Studio',
    logo: uiedLogo,
    description: '支持本地化部署，数据安全有保障，搭配Cherry Studio使用更便捷',
    tags: ['本地部署', '安全', '客户端'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-18',
    url: 'https://www.uied.cn/circle/84503.html'
  },
  {
    id: 112,
    title: '腾讯元宝',
    logo: yuanbaoLogo,
    description: '腾讯出品的AI助手，集成DeepSeek模型，提供专业的AI服务',
    tags: ['大厂', 'AI助手', '专业'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-20',
    url: 'https://yuanbao.tencent.com/'
  },
  {
    id: 113,
    title: '知乎直达',
    logo: zhihuLogo,
    description: '知乎官方AI助手，集成DeepSeek模型，提供智能问答服务',
    tags: ['问答', '社区', '专业'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-22',
    url: 'https://zhida.zhihu.com/'
  },
  {
    id: 114,
    title: '腾讯IMA',
    logo: imaLogo,
    description: '会思考的知识库，开启搜读写新体验，支持 DeepSeek R1 满血版',
    tags: ['知识库', '搜索', '写作'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-25',
    url: 'https://ima.qq.com/'
  },
  {
    id: 115,
    title: '腾讯AI文档助手',
    logo: tencentLogo,
    description: '腾讯文档AI文档助手正式接入DeepSeek-R1模型满血版，提供智能文档处理服务',
    tags: ['大厂', '文档处理', '企业级'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-26',
    url: 'https://docs.qq.com/ai'
  },
  {
    id: 116,
    title: '科大讯飞开放平台',
    logo: xunfeiLogo,
    description: 'DeepSeek全系上线讯飞开放平台，可免费使用，在线速度快',
    tags: ['大厂', '免费', '高速'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-27',
    url: 'https://training.xfyun.cn/modelSquare'
  },
  {
    id: 118,
    title: 'WPS灵犀',
    logo: wpsLogo,
    description: 'WPS官方已接入DeepSeek R1，提供智能、高效的办公体验',
    tags: ['大厂', '办公', '企业级'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-29',
    url: 'https://lingxi.wps.cn/'
  },
  {
    id: 119,
    title: 'QQ浏览器 DeepSeek',
    logo: qqBrowserLogo,
    description: '用户在QQ浏览器App或电脑端搜"DeepSeek"，点击DeepSeek模型QQ浏览器专线版，登陆即可免费使用。',
    tags: ['大厂', '搜索', '多端'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-30',
    url: 'https://browser.qq.com'
  },
  {
    id: 120,
    title: '有道翻译 DeepSeek',
    logo: youdaoLogo,
    description: '免费、免登录体验DeepSeek，速度快但不支持联网',
    tags: ['翻译', '免费', '免登录'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-03-31',
    url: 'https://fanyi.youdao.com'
  },
  {
    id: 121,
    title: '支付宝百宝箱',
    logo: alipayLogo,
    description: '支付宝官方接入DeepSeek，免费使用，需要登录账号',
    tags: ['大厂', '免费', '需登录'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-04-01',
    url: 'https://tbox.alipay.com/about'
  },
  {
    id: 122,
    title: '跃问',
    logo: yuewenLogo,
    description: '免费体验DeepSeek模型，需要登录账号，响应速度快',
    tags: ['免费', '需登录', '高速'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-04-02',
    url: 'https://yuewen.cn/chats/new'
  },
  {
    id: 123,
    title: '百度搜索AI',
    logo: baiduLogo,
    description: '百度搜索AI标签页，已接入满血版DeepSeek-R1模型',
    tags: ['大厂', '搜索', '满血版'],
    online: true,
    speed: 'fast',
    releaseDate: '2024-04-03',
    url: 'https://chat.baidu.com/search'
  },
  {
    id: 101,
    title: '问小白DeepSeek满血版',
    logo: wenxiaobaiLogo,
    description: '问小白接入 DeepSeek R1 满血版，支持多轮对话、免费、高速、无限制',
    tags: ['多轮对话', '联网', '深度思考'],
    online: true,
    speed: 'fast',
    releaseDate: '2025-02-23',
    url: 'https://www.wenxiaobai.com/?forceLogin=true&source=uied&ad_source=uied'
  }
])

// 过滤后的数据
const filteredOfficialItems = computed(() => {
  return filterItems(officialItems.value)
})

const filteredRecommendedItems = computed(() => {
  return filterItems(recommendedItems.value)
})

// 过滤函数
function filterItems(items: NavItem[]) {
  return items.filter(item => {
    const matchSearch = !searchText.value ||
      item.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.value.toLowerCase())

    const matchFilter = currentFilter.value === '全部' ||
      item.tags.includes(currentFilter.value)

    return matchSearch && matchFilter
  })
}

// 组件挂载时的处理
onMounted(() => {
  try {
    // 初始化SEO标签
    updateSEOTags()
  } catch (error) {
    console.error('组件加载失败:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  }
})

// 组件卸载时处理
onUnmounted(() => {
  // 清理状态
  isLoading.value = false
  searchText.value = ''
  currentFilter.value = '全部'
  officialItems.value = []
  recommendedItems.value = []
})

// 处理链接跳转
const handleNavigation = (url: string) => {
  try {
    // AI相关页面使用新窗口打开
    if (url.includes('/tools/ai/')) {
      window.open(url, '_blank')
    } else if (url.startsWith('/')) {
      router.push(url)
    } else {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('导航失败:', error)
    ElMessage.error('页面跳转失败，请重试')
  }
}
</script>

<style scoped>
.deepseek-nav {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-header {
  text-align: center;
  margin-bottom: 40px;
}

.nav-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.nav-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.nav-search {
  max-width: 600px;
  margin: 0 auto 20px;
}

.nav-filters {
  margin-bottom: 30px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin: 30px 0 20px;
  color: #333;
}

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.nav-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background: #fff;
  transition: all 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.card-logo {
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 8px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
}

.card-status {
  display: flex;
  gap: 8px;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}

.card-footer {
  font-size: 12px;
  color: #999;
}

.release-date {
  font-style: italic;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

:deep(.el-radio-button__inner) {
  border-radius: 20px;
}
</style>
