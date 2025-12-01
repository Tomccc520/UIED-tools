<!--
* @file DeepSeekPrompt.vue
* @description DeepSeek应用指令页面，提供常用的DeepSeek提示词和应用场景
* @author UIED技术团队
* @copyright UIED技术团队 (https://fsuied.com)
* @createDate 2024-3-20
-->

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
                <img src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-full h-full" />
              </div>
              <!-- 标题内容部分 -->
              <div class="w-full">
                <!-- 标题和移动端 Logo -->
                <div class="flex items-center justify-center">
                  <img src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-10 h-10 md:hidden mr-2" />
                  <h1
                    class="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    DeepSeek 提示词指南</h1>
                  <span class="px-2 py-0.5 text-xs bg-red-50 text-red-500 rounded-full ml-2">持续更新中</span>
                </div>
                <!-- 副标题 -->
                <p class="text-xs md:text-sm text-gray-500 mt-2">提供常用的 DeepSeek 提示词和应用场景，帮助你更好地使用 AI</p>
                <!-- 链接导航 -->
                <div class="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3">
                  <a @click="handleNavigation('https://uiedtool.com/tools/ai/deepseek-nav')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek导航</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://www.deepseek.com/')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek官网</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://xiaoyi.huawei.com/chat/')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">华为小艺助手接入DeepSeek！</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://www.wenxiaobai.com/?forceLogin=true&source=uied&ad_source=uied')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek-R1满血版</a>
                  <span class="text-gray-300 hidden md:inline">|</span>
                  <a @click="handleNavigation('https://uiedtool.com/tools/ai/deepseek-r1')"
                    class="text-xs md:text-sm text-blue-500 hover:text-blue-600 cursor-pointer">DeepSeek AI 智能助手</a>
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
                </div>
                <!-- 状态提示 -->
                <div class="flex flex-col md:flex-row justify-center items-center gap-2 mt-3">
                  <span class="px-2.5 py-1 text-sm bg-yellow-50 text-yellow-600 rounded-full text-center">
                    提示：点击右上角的复制按钮即可复制提示词模板，根据实际需求修改后使用更佳
                  </span>
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
                <input v-model="searchQuery" type="text" placeholder="搜索提示词..."
                  class="w-full px-4 py-3 pr-24 rounded-xl border-2 border-gray-200 group-hover:border-blue-400 focus:border-blue-500 outline-none transition-all duration-300" />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span v-if="searchQuery" @click="clearSearch"
                    class="p-1.5 rounded-full hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors">
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
              <!-- 搜索结果统计 -->
              <div v-if="searchQuery" class="absolute -bottom-6 left-0 text-sm text-gray-500">
                找到 {{ totalSearchResults }} 个相关提示词
              </div>
            </div>

            <!-- 职业分类筛选 -->
            <div class="flex flex-wrap gap-2">
              <button v-for="category in uniqueCategories" :key="category" @click="toggleCategory(category)"
                @mouseenter="hoveredCategory = category" @mouseleave="hoveredCategory = null" :class="[
                  'px-4 py-2 rounded-xl text-sm transition-all duration-300 relative overflow-hidden flex items-center justify-between',
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                    : hoveredCategory === category
                      ? 'bg-gray-100 text-blue-600 scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
                ]">
                <span class="relative z-10">{{ category }}</span>
                <span v-if="category !== '全部'" class="ml-2 px-1.5 py-0.5 text-xs rounded-full" :class="{
                  'bg-blue-400 text-white': selectedCategory === category,
                  'bg-gray-200 text-gray-600': selectedCategory !== category
                }">
                  {{ getCategoryCount(category) }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- 提示词展示区域 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <template v-for="category in filteredCategories" :key="category.name">
            <template v-for="prompt in filterPrompts(category.prompts)" :key="prompt.title">
              <div
                class="prompt-item bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-blue-500 transition-all duration-300">
                <!-- 卡片头部 -->
                <div class="p-4 border-b border-gray-100">
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h4 class="text-base font-semibold text-gray-900">{{ prompt.title }}</h4>
                        <span class="px-2 py-0.5 text-xs rounded-full" :class="{
                          'bg-green-50 text-green-600': prompt.difficulty === '入门',
                          'bg-yellow-50 text-yellow-600': prompt.difficulty === '进阶',
                          'bg-red-50 text-red-600': prompt.difficulty === '专业'
                        }">
                          {{ prompt.difficulty }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 mb-3">
                        <span class="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">{{ category.name
                          }}</span>
                        <div class="flex gap-1">
                          <span v-for="tag in prompt.tags" :key="tag"
                            class="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600">{{ prompt.description }}</p>
                    </div>
                    <button @click="copyPrompt(prompt.content)"
                      class="text-xs px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors flex items-center gap-1 flex-shrink-0">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制
                    </button>
                  </div>
                </div>
                <!-- 提示词内容 -->
                <div class="relative">
                  <div class="prompt-content text-sm text-gray-700 font-mono whitespace-pre-wrap">
                    {{ prompt.content }}
                  </div>
                </div>
              </div>
            </template>
          </template>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const router = useRouter()

// 添加组件加载状态
const isLoading = ref(true)

// 组件挂载时的处理
onMounted(async () => {
  try {
    await nextTick()
    isLoading.value = false
  } catch (error) {
    console.error('组件加载失败:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  }
})

// 页面跳转处理
const handleNavigation = (url: string) => {
  if (url.startsWith('http')) {
    window.open(url, '_blank')
  } else {
    window.location.href = url
  }
}

// 搜索和筛选状态
const searchQuery = ref('')
const selectedCategory = ref('全部')
const hoveredCategory = ref<string | null>(null)

// 获取所有唯一分类
const uniqueCategories = computed(() => {
  const categories = promptCategories.value.map(cat => cat.name)
  return ['全部', ...categories]
})

// 切换分类选择
const toggleCategory = (category: string) => {
  selectedCategory.value = category
}

// 过滤分类
const filteredCategories = computed(() => {
  if (selectedCategory.value === '全部') {
    return promptCategories.value
  }
  return promptCategories.value.filter(category =>
    category.name === selectedCategory.value
  )
})

// 过滤提示词
const filterPrompts = (prompts: any[]) => {
  if (!searchQuery.value) return prompts

  const query = searchQuery.value.toLowerCase()
  return prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(query) ||
    prompt.description.toLowerCase().includes(query) ||
    prompt.content.toLowerCase().includes(query)
  )
}

// 提示词分类数据
const promptCategories = ref([
  {
    name: '内容创作',
    description: '包含文案写作、短视频、直播、自媒体等内容创作相关提示词',
    icon: 'edit',
    prompts: [
      {
        title: '小红书爆款文案',
        description: '生成小红书风格的文案结构',
        content: '我需要你帮我写一篇小红书笔记，主题是[主题]。要求：\n1. 标题要真实有吸引力\n2. 开篇要用真实体验分享\n3. 内容要客观详实\n4. 配图建议要符合平台规范\n5. 最后要有正向互动引导\n\n注意：\n- 确保内容真实性\n- 避免虚假夸大\n- 遵守平台规范\n- 理性引导消费\n- 适当使用emoji增加趣味性',
        tags: ['文案', '小红书', '爆款'],
        difficulty: '入门'
      },
      {
        title: '抖音视频脚本',
        description: '生成抖音短视频文案',
        content: '请帮我写一个抖音视频脚本，主题是[主题]。要求：\n1. 开场要吸引人但不夸张\n2. 内容要真实有价值\n3. 转场要自然流畅\n4. 配乐要合规可用\n5. 结尾要有正向引导\n\n注意：\n- 遵守平台内容规范\n- 确保音乐版权\n- 不违反广告法\n- 保护用户权益\n- 时长控制在60秒内',
        tags: ['视频', '抖音', '脚本'],
        difficulty: '进阶'
      },
      {
        title: '微信公众号标题',
        description: '生成吸引人的公众号标题',
        content: '请帮我设计一个公众号文章标题，主题是[主题]。要求：\n1. 提供10个标题方案\n2. 每个标题都要有吸引力\n3. 符合微信算法推荐\n4. 避免标题党\n\n标题类型包括：\n- 疑问句式\n- 数字列表\n- 反转设计\n- 故事型\n- 干货型',
        tags: ['公众号', '标题', '写作'],
        difficulty: '入门'
      },
      {
        title: '知乎回答',
        description: '生成知乎专业回答',
        content: '请帮我写一个知乎回答，问题是[问题]。要求：\n1. 开篇要抓住读者痛点\n2. 论述要有理有据\n3. 举例要具体详实\n4. 结构要清晰易读\n5. 语气要专业客观\n\n包含要素：\n- 个人经验\n- 数据支持\n- 案例分析\n- 实操建议',
        tags: ['知乎', '回答', '专业'],
        difficulty: '进阶'
      },
      {
        title: 'B站视频脚本',
        description: '生成B站风格视频脚本',
        content: '请帮我写一个B站视频脚本，主题是[主题]。要求：\n1. 设计有趣的开场白\n2. 内容要专业但不枯燥\n3. 加入互动和梗\n4. 设计弹幕互动点\n5. 结尾要有高能\n\n注意：\n- 符合B站文化\n- 注意节奏把控\n- 设计互动环节',
        tags: ['B站', '视频', '脚本'],
        difficulty: '进阶'
      },
      {
        title: '微博热门文案',
        description: '生成微博爆款文案',
        content: '请帮我创作一条微博文案，主题是[主题]。要求：\n1. 开头要吸引眼球\n2. 内容要有话题度\n3. 设计互动话题\n4. 带入热点元素\n5. 设计转发理由\n\n注意：\n- 控制字数\n- 话题要自然\n- 易于传播',
        tags: ['微博', '文案', '热门'],
        difficulty: '入门'
      },
      {
        title: '直播带货话术',
        description: '生成直播销售话术',
        content: '请帮我设计直播带货话术，产品是[产品]。要求：\n1. 开场引流话术\n2. 产品介绍话术\n3. 互动引导话术\n4. 促单转化话术\n5. 挽留话术\n\n包含：\n- 优惠力度说明\n- 产品真实卖点\n- 合规证明展示\n- 理性购买引导\n\n注意事项：\n- 严格遵守直播带货相关法规\n- 不得夸大宣传效果\n- 如实展示产品信息\n- 保护消费者权益',
        tags: ['直播', '带货', '话术'],
        difficulty: '进阶'
      },
      {
        title: '短视频标题',
        description: '生成吸引人的短视频标题',
        content: '请帮我设计短视频标题，内容是[内容]。要求：\n1. 提供多个标题方案\n2. 符合平台特点\n3. 突出关键卖点\n4. 激发点击欲望\n\n适用平台：\n- 抖音\n- 快手\n- 视频号\n- 小红书',
        tags: ['短视频', '标题', '创意'],
        difficulty: '入门'
      },
      {
        title: '朋友圈文案',
        description: '生成高质量朋友圈文案',
        content: '请帮我写一条朋友圈文案，主题是[主题]。要求：\n1. 文案要有质感\n2. 突出个人调性\n3. 引发共鸣\n4. 配图建议\n\n风格可选：\n- 生活感悟\n- 美食分享\n- 旅行记录\n- 职场心得',
        tags: ['朋友圈', '文案', '社交'],
        difficulty: '入门'
      },
      {
        title: '视频号内容',
        description: '生成视频号内容方案',
        content: '请帮我策划视频号内容，主题是[主题]。要求：\n1. 内容规划\n2. 拍摄建议\n3. 剪辑思路\n4. 运营策略\n\n包含：\n- 选题建议\n- 拍摄手法\n- 剪辑技巧\n- 发布时间',
        tags: ['视频号', '内容', '策划'],
        difficulty: '进阶'
      },
      {
        title: '营销号文案',
        description: '生成营销号风格文案',
        content: '请帮我写一篇营销号文案，主题是[主题]。要求：\n1. 标题设计\n- 实事求是\n- 不夸大其词\n- 价值展示\n- 合规性检查\n\n2. 开场设计\n- 真实场景\n- 理性引导\n- 共鸣点\n- 合规开场\n\n3. 内容结构\n- 客观论述\n- 真实案例\n- 可信数据\n- 专业引用\n\n4. 互动设计\n- 理性引导\n- 合规话题\n- 正向互动\n- 价值分享\n\n5. 结尾处理\n- 客观总结\n- 理性建议\n- 合规引导\n- 品牌展示\n\n注意事项：\n- 确保内容真实性\n- 避免虚假宣传\n- 遵守广告法\n- 保护用户权益',
        tags: ['营销号', '文案', '写作'],
        difficulty: '进阶'
      },
      {
        title: '直播话术',
        description: '生成直播带货话术',
        content: '请帮我设计直播话术，产品是[产品名称]。要求：\n1. 开场引流\n- 人设展示\n- 氛围营造\n- 话题引入\n- 互动设计\n\n2. 产品介绍\n- 卖点提炼\n- 场景演示\n- 效果对比\n- 价值转化\n\n3. 互动话术\n- 问题回应\n- 粉丝互动\n- 礼物感谢\n- 氛围调节\n\n4. 促单话术\n- 优惠说明\n- 稀缺感营造\n- 决策推动\n- 转化引导\n\n5. 挽留话术\n- 犹豫处理\n- 异议化解\n- 补充权益\n- 情感共鸣',
        tags: ['直播', '话术', '带货'],
        difficulty: '专业'
      },
      {
        title: '知乎专业回答',
        description: '生成知乎专业回答文案',
        content: '请帮我写一个知乎专业回答，问题是[问题]。要求：\n1. 开篇设计\n- 观点明确\n- 专业定位\n- 经验引入\n- 可信度建立\n\n2. 论述展开\n- 逻辑框架\n- 案例分析\n- 数据支持\n- 专业术语\n\n3. 内容深度\n- 原理解析\n- 方法论述\n- 实践指导\n- 行业洞察\n\n4. 表达方式\n- 语言精炼\n- 结构清晰\n- 专业用语\n- 图文结合\n\n5. 互动设计\n- 开放讨论\n- 延伸阅读\n- 经验分享\n- 观点引导',
        tags: ['知乎', '回答', '专业'],
        difficulty: '专业'
      },
      {
        title: '抖音脚本创作',
        description: '生成抖音爆款短视频脚本',
        content: '请帮我创作一个抖音爆款短视频脚本，主题是[主题]。要求：\n1. 开场设计\n- 3秒内吸引注意\n- 制造好奇感\n- 明确价值承诺\n- 场景带入感\n\n2. 内容结构\n- 故事叙述法\n- 问题解决法\n- 对比反转法\n- 干货列表法\n\n3. 节奏控制\n- 15秒关键点\n- 30秒核心价值\n- 45秒深度内容\n- 结尾高能点\n\n4. 互动设计\n- 评论引导语\n- 点赞诱导点\n- 关注理由\n- 转发价值\n\n5. 特效建议\n- 文字强调\n- 转场技巧\n- 音效运用\n- 滤镜选择',
        tags: ['抖音', '短视频', '脚本'],
        difficulty: '专业'
      },
      {
        title: '产品文案优化',
        description: '生成高转化率产品推广文案',
        content: '请帮我优化产品推广文案，产品是[产品名称]。要求：\n1. 标题设计\n- 核心卖点提炼\n- 目标人群定位\n- 差异化亮点\n- 情感共鸣点\n\n2. 产品描述\n- 功能介绍\n- 场景应用\n- 痛点解决\n- 专业术语\n\n3. 价值论证\n- 数据支持\n- 用户见证\n- 专业背书\n- 对比优势\n\n4. 转化设计\n- 稀缺感营造\n- 社会认同\n- 行动指引\n- 风险消除\n\n5. 语言风格\n- 目标群体语言\n- 行业专业度\n- 情感色彩\n- 品牌调性',
        tags: ['产品', '文案', '转化'],
        difficulty: '进阶'
      },
      {
        title: '小说创作指南',
        description: '小说情节与人物创作提示',
        content: '请帮我构思一个小说故事，类型是[类型]。要求：\n1. 情节设计\n- 矛盾冲突设置\n- 情节推进节奏\n- 悬念与伏笔设计\n- 高潮与结局布局\n\n2. 人物塑造\n- 主角成长路线\n- 反派动机设计\n- 配角功能定位\n- 性格特点展现\n\n3. 世界观构建\n- 背景时代设定\n- 社会规则构建\n- 文化习俗描写\n- 环境氛围营造\n\n4. 叙事视角\n- 叙事视角选择\n- 语言风格定位\n- 节奏与节奏调整\n- 细节描写指导\n\n5. 情感表达\n- 人物情感发展\n- 冲突情感处理\n- 情感铺垫技巧\n- 共鸣点设计',
        tags: ['小说', '创作', '写作'],
        difficulty: '专业'
      },
      {
        title: '内容爆款分析',
        description: '热门内容分析与复制框架',
        content: '请帮我分析以下爆款内容，并提供类似内容创作框架。内容链接/摘要是[内容]。要求：\n1. 内容结构分析\n- 标题构成要素\n- 开场方式分析\n- 内容展开框架\n- 高潮设计方法\n- 结尾技巧分析\n\n2. 表达风格解析\n- 语言特点提取\n- 修辞手法总结\n- 互动设计分析\n- 情感营造技巧\n\n3. 传播要素提炼\n- 传播点分析\n- 共鸣要素识别\n- 争议点评估\n- 差异化特点\n\n4. 创作框架模板\n- 标题模板设计\n- 内容结构模板\n- 关键表达方式\n- 互动设计建议\n\n5. 优化建议\n- 差异化创新点\n- 改进优化方向\n- 规避风险提示\n- 长期发展建议',
        tags: ['分析', '爆款', '框架'],
        difficulty: '专业'
      },
      {
        title: '创意文案大师',
        description: '富有创意的广告文案生成',
        content: '请以创意文案大师的角色，为我创作一段广告文案，产品/服务是[产品]。要求：\n1. 创意概念\n- 核心创意概念\n- 独特卖点挖掘\n- 情感连接点\n- 记忆点设计\n\n2. 表达技巧\n- 开场方式设计\n- 节奏与韵律感\n- 修辞手法运用\n- 意象与象征\n\n3. 故事性设计\n- 微故事构建\n- 冲突与解决\n- 场景代入感\n- 品牌融入度\n\n4. 互动引导\n- 共鸣点触发\n- 行动指引设计\n- 参与感营造\n- 传播性考量\n\n5. 风格把控\n- 品牌调性呼应\n- 目标人群匹配\n- 时代感体现\n- 原创性保证',
        tags: ['创意', '广告', '文案'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '运营策划',
    description: '包含活动策划、营销方案、推广计划等运营相关提示词',
    icon: 'operation',
    prompts: [
      {
        title: '活动方案',
        description: '生成完整的营销活动方案',
        content: '请帮我策划一个活动方案，主题是[主题]。需要包含：\n1. 活动背景和目标\n- 市场环境分析\n- 合规性评估\n- 目标设定\n\n2. 活动形式和玩法设计\n- 合规玩法设计\n- 用户权益保障\n- 风险控制措施\n\n3. 奖品设置和预算规划\n- 合理奖品设置\n- 预算合规评估\n- 奖品发放机制\n\n4. 传播方案和声量预估\n- 合规传播渠道\n- 合规传播内容\n- 舆情监控预案\n\n5. 风险评估和应对措施\n- 法律风险评估\n- 舆情风险评估\n- 应急预案制定\n\n补充要求：\n- 活动合规审核流程\n- 用户信息保护方案\n- 客诉处理机制\n- 数据安全保障',
        tags: ['活动', '营销', '策划'],
        difficulty: '专业'
      },
      {
        title: '新品上线方案',
        description: '生成新品上线整体营销方案',
        content: '请帮我制定新品上线方案，产品是[产品名称]。要求：\n1. 市场分析\n- 合规性评估\n- 目标用户画像\n- 竞品分析\n\n2. 上线策略\n- 合规定价策略\n- 正规渠道策略\n- 合规推广方案\n\n3. 营销方案\n- 合规传播要点\n- 理性营销节点\n- 真实内容规划\n\n4. 投放计划\n- 合规预算分配\n- 正规渠道选择\n- 风控措施\n\n5. 效果评估\n- 合规KPI设定\n- 数据安全监测\n- 优化调整机制\n\n注意事项：\n- 确保产品合规性\n- 保护用户权益\n- 遵守广告法\n- 数据合规使用',
        tags: ['新品', '上线', '营销'],
        difficulty: '专业'
      },
      {
        title: '节日营销方案',
        description: '生成节日营销活动方案',
        content: '请帮我设计节日营销方案，节日是[节日名称]。要求：\n1. 营销主题\n- 主题设定\n- 创意亮点\n- 情感连接\n\n2. 活动设计\n- 活动形式\n- 参与机制\n- 奖励设置\n\n3. 传播计划\n- 传播渠道\n- 内容规划\n- KOL合作\n\n4. 预算规划\n- 预算分配\n- 资源调配\n- ROI预估\n\n5. 执行安排\n- 时间节点\n- 部门配合\n- 应急预案',
        tags: ['节日', '营销', '活动'],
        difficulty: '进阶'
      },
      {
        title: '社媒运营计划',
        description: '生成社交媒体运营方案',
        content: '请帮我制定社媒运营计划，平台是[平台名称]。要求：\n1. 账号定位\n- 账号调性\n- 目标人群\n- 内容方向\n\n2. 内容规划\n- 内容主题\n- 内容形式\n- 发布频率\n\n3. 互动策略\n- 粉丝运营\n- 话题互动\n- 危机处理\n\n4. 数据分析\n- 核心指标\n- 数据监测\n- 效果评估\n\n5. 资源规划\n- 人员配置\n- 预算分配\n- 工具使用',
        tags: ['社媒', '运营', '计划'],
        difficulty: '进阶'
      },
      {
        title: '用户增长方案',
        description: '生成用户增长策略方案',
        content: '请帮我设计用户增长方案，产品是[产品名称]。要求：\n1. 增长目标\n- 目标设定\n- 指标分解\n- 时间节点\n\n2. 获客策略\n- 获客渠道\n- 成本控制\n- 质量把控\n\n3. 转化优化\n- 转化路径\n- 关键节点\n- 优化方向\n\n4. 留存计划\n- 留存策略\n- 活跃度提升\n- 召回方案\n\n5. 数据分析\n- 数据监测\n- 效果评估\n- 优化建议',
        tags: ['增长', '用户', '策略'],
        difficulty: '专业'
      },
      {
        title: '品牌推广方案',
        description: '生成品牌推广整体方案',
        content: '请帮我制定品牌推广方案，品牌是[品牌名称]。要求：\n1. 品牌定位\n- 品牌价值\n- 目标用户\n- 核心优势\n\n2. 传播策略\n- 传播主题\n- 传播渠道\n- 传播重点\n\n3. 内容规划\n- 内容主题\n- 内容形式\n- 创意方向\n\n4. 资源配置\n- 预算分配\n- 渠道投放\n- 合作资源\n\n5. 效果评估\n- 评估指标\n- 监测方案\n- 优化建议',
        tags: ['品牌', '推广', '传播'],
        difficulty: '专业'
      },
      {
        title: '促销活动方案',
        description: '生成促销活动整体方案',
        content: '请帮我设计促销活动方案，产品是[产品名称]。要求：\n1. 活动策略\n- 促销力度\n- 活动机制\n- 参与门槛\n\n2. 传播计划\n- 宣传方式\n- 渠道选择\n- 物料准备\n\n3. 执行安排\n- 时间节点\n- 人员分工\n- 物流保障\n\n4. 预算规划\n- 成本核算\n- 利润预估\n- 资源分配\n\n5. 效果评估\n- 销售目标\n- 转化指标\n- 数据分析',
        tags: ['促销', '活动', '营销'],
        difficulty: '进阶'
      },
      {
        title: '内容营销方案',
        description: '生成内容营销策略方案',
        content: '请帮我制定内容营销方案，品牌是[品牌名称]。要求：\n1. 内容策略\n- 内容定位\n- 主题规划\n- 风格设定\n\n2. 渠道规划\n- 渠道选择\n- 平台特点\n- 发布策略\n\n3. 创作指南\n- 内容形式\n- 创作标准\n- 审核流程\n\n4. 运营计划\n- 发布频率\n- 互动管理\n- 效果追踪\n\n5. 数据分析\n- 核心指标\n- 数据监测\n- 优化方向',
        tags: ['内容', '营销', '策略'],
        difficulty: '进阶'
      },
      {
        title: '私域运营方案',
        description: '生成私域流量运营方案',
        content: '请帮我设计私域运营方案，场景是[场景描述]。要求：\n1. 获客策略\n- 引流渠道\n- 获客成本\n- 筛选标准\n\n2. 运营体系\n- 群组架构\n- 人员配置\n- 管理制度\n\n3. 内容体系\n- 内容规划\n- 互动机制\n- 活动设计\n\n4. 转化体系\n- 转化路径\n- 产品匹配\n- 成交策略\n\n5. 复购体系\n- 会员体系\n- 服务体系\n- 裂变机制',
        tags: ['私域', '运营', '转化'],
        difficulty: '专业'
      },
      {
        title: '社群运营方案',
        description: '生成社群运营整体方案',
        content: '请帮我制定社群运营方案，社群是[社群名称]。要求：\n1. 社群定位\n- 目标人群\n- 价值主张\n- 运营目标\n\n2. 内容体系\n- 内容主题\n- 形式设计\n- 互动机制\n\n3. 活动体系\n- 活动类型\n- 参与机制\n- 奖励设置\n\n4. 运营体系\n- 人员配置\n- 管理制度\n- 氛围营造\n\n5. 成长体系\n- 等级设计\n- 权益规划\n- 激励机制',
        tags: ['社群', '运营', '活动'],
        difficulty: '专业'
      },
      {
        title: '私域引流方案',
        description: '生成私域流量引流方案',
        content: '请帮我设计私域引流方案，场景是[场景描述]。要求：\n1. 引流策略\n- 场景设计\n- 触点布局\n- 利益点设计\n- 转化路径\n\n2. 内容策略\n- 内容规划\n- 话术设计\n- 素材制作\n- 权益设置\n\n3. 运营机制\n- 互动设计\n- 活动策划\n- 社群运营\n- 会员体系\n\n4. 转化体系\n- 转化链路\n- 触发机制\n- 成交策略\n- 复购设计\n\n5. 数据监控\n- 核心指标\n- 转化漏斗\n- 效果评估\n- 优化方向',
        tags: ['私域', '引流', '运营'],
        difficulty: '专业'
      },
      {
        title: '用户运营方案',
        description: '生成用户运营整体方案',
        content: '请帮我制定用户运营方案，产品是[产品名称]。要求：\n1. 用户分层\n- 分层维度\n- 分层标准\n- 特征画像\n- 价值评估\n\n2. 运营策略\n- 拉新策略\n- 促活策略\n- 留存策略\n- 转化策略\n\n3. 内容运营\n- 内容规划\n- 形式创新\n- 互动机制\n- 传播策略\n\n4. 用户关系\n- 会员体系\n- 权益设计\n- 社群运营\n- 品牌建设\n\n5. 数据运营\n- 指标体系\n- 行为分析\n- 效果评估\n- 优化方向',
        tags: ['用户', '运营', '策略'],
        difficulty: '专业'
      },
      {
        title: '增长黑客方案',
        description: '生成增长黑客策略方案',
        content: '请帮我设计增长黑客方案，目标是[目标描述]。要求：\n1. 增长模型\n- 北极星指标\n- AARRR模型\n- 增长公式\n- 关键路径\n\n2. 获客策略\n- 渠道创新\n- 场景挖掘\n- 病毒传播\n- 裂变设计\n\n3. 激活策略\n- 首次体验\n- 价值展示\n- 引导机制\n- 转化路径\n\n4. 留存策略\n- 习惯养成\n- 价值循环\n- 社交属性\n- 游戏化设计\n\n5. 数据驱动\n- 实验设计\n- 数据分析\n- 快速迭代\n- ROI优化',
        tags: ['增长', '策略', '运营'],
        difficulty: '专业'
      },
      {
        title: '品牌年度营销策略',
        description: '生成品牌全年营销策略规划',
        content: '请帮我制定品牌年度营销策略，品牌是[品牌名称]。要求：\n1. 品牌战略分析\n- 市场定位评估\n- 竞争格局分析\n- 消费者洞察\n- SWOT分析\n\n2. 年度营销目标\n- 品牌目标\n- 销售目标\n- 渠道目标\n- 传播目标\n\n3. 营销策略规划\n- 产品策略\n- 价格策略\n- 渠道策略\n- 传播策略\n\n4. 营销日历安排\n- 重点营销节点\n- 活动主题设计\n- 资源分配计划\n- 执行时间表\n\n5. 效果评估体系\n- KPI设定\n- 监测方法\n- 优化机制\n- ROI评估框架',
        tags: ['品牌', '年度', '策略'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '设计需求',
    description: '包含UI设计、平面设计、PS脚本等设计相关提示词',
    icon: 'design',
    prompts: [
      {
        title: 'UI设计需求',
        description: '生成UI设计需求文档',
        content: '请帮我写一份UI设计需求，项目是[项目名称]。要求：\n1. 设计目标\n- 用户目标\n- 业务目标\n- 体验目标\n\n2. 设计规范\n- 色彩规范\n- 字体规范\n- 组件规范\n- 布局规范\n\n3. 交互要求\n- 操作流程\n- 反馈机制\n- 动效设计\n- 适配要求\n\n4. 视觉风格\n- 设计风格\n- 视觉元素\n- 图标设计\n- 插画风格\n\n5. 输出规范\n- 文件规范\n- 标注要求\n- 切图规范\n- 交付清单',
        tags: ['UI', '设计', '规范'],
        difficulty: '专业'
      },
      {
        title: '品牌视觉设计',
        description: '生成品牌视觉设计需求',
        content: '请帮我制定品牌视觉设计需求，品牌是[品牌名称]。要求：\n1. 品牌调性\n- 品牌个性\n- 目标受众\n- 市场定位\n\n2. 核心视觉\n- LOGO设计\n- 色彩系统\n- 字体系统\n- 图形元素\n\n3. 应用系统\n- 名片设计\n- 办公用品\n- 宣传物料\n- 环境导视\n\n4. 数字媒体\n- 社媒头像\n- banner设计\n- H5设计\n- 视频包装\n\n5. 规范输出\n- 设计规范\n- 应用示例\n- 文件管理\n- 使用说明',
        tags: ['品牌', '视觉', '设计'],
        difficulty: '专业'
      },
      {
        title: '海报设计需求',
        description: '生成海报设计需求文档',
        content: '请帮我写一份海报设计需求，主题是[主题]。要求：\n1. 设计目标\n- 传播目的\n- 目标受众\n- 预期效果\n\n2. 视觉要素\n- 主视觉元素\n- 色彩方案\n- 字体选择\n- 构图要求\n\n3. 内容规划\n- 标题设计\n- 文案布局\n- 图片选用\n- 标识位置\n\n4. 规格要求\n- 尺寸规格\n- 输出格式\n- 印刷要求\n- 使用场景\n\n5. 设计参考\n- 风格参考\n- 禁忌事项\n- 时间节点\n- 修改流程',
        tags: ['海报', '平面', '设计'],
        difficulty: '进阶'
      },
      {
        title: '包装设计需求',
        description: '生成产品包装设计需求',
        content: '请帮我制定包装设计需求，产品是[产品名称]。要求：\n1. 设计目标\n- 产品定位\n- 目标人群\n- 销售渠道\n\n2. 包装规范\n- 包装形式\n- 材质要求\n- 尺寸规格\n- 印刷工艺\n\n3. 视觉设计\n- 主视觉\n- 色彩方案\n- 图形元素\n- 文字排版\n\n4. 功能要求\n- 开启方式\n- 防伪设计\n- 储存要求\n- 运输考虑\n\n5. 法规要求\n- 必要信息\n- 标签规范\n- 环保要求\n- 认证标准',
        tags: ['包装', '设计', '规范'],
        difficulty: '专业'
      },
      {
        title: '小程序设计需求',
        description: '生成小程序UI设计需求',
        content: '请帮我写一份小程序设计需求，项目是[项目名称]。要求：\n1. 产品定位\n- 功能定位\n- 用户群体\n- 使用场景\n\n2. 视觉规范\n- 主题风格\n- 色彩系统\n- 字体规范\n- 图标设计\n\n3. 页面规划\n- 信息架构\n- 导航系统\n- 布局规范\n- 模块设计\n\n4. 交互设计\n- 操作流程\n- 手势交互\n- 转场动效\n- 反馈机制\n\n5. 特殊要求\n- 平台规范\n- 性能优化\n- 适配要求\n- 无障碍设计',
        tags: ['小程序', 'UI', '设计'],
        difficulty: '专业'
      },
      {
        title: '落地页设计需求',
        description: '生成营销落地页设计需求',
        content: '请帮我制定落地页设计需求，产品是[产品名称]。要求：\n1. 页面目标\n- 转化目标\n- 用户行为\n- 性能要求\n\n2. 内容架构\n- 信息层级\n- 内容模块\n- 重点区域\n- CTA设计\n\n3. 视觉设计\n- 风格定位\n- 色彩方案\n- 图片风格\n- 动效设计\n\n4. 交互要求\n- 响应设计\n- 表单设计\n- 加载效果\n- 反馈机制\n\n5. 技术规范\n- 设备适配\n- 加载优化\n- 代码规范\n- 素材规范',
        tags: ['落地页', '设计', '转化'],
        difficulty: '进阶'
      },
      {
        title: 'Banner设计需求',
        description: '生成广告banner设计需求',
        content: '请帮我写一份banner设计需求，用途是[用途]。要求：\n1. 设计目标\n- 传播目的\n- 点击目标\n- 展示场景\n\n2. 规格要求\n- 尺寸规格\n- 文件格式\n- 大小限制\n- 设备适配\n\n3. 视觉设计\n- 主视觉\n- 色彩方案\n- 文案布局\n- 品牌元素\n\n4. 动效要求\n- 动画类型\n- 过渡效果\n- 循环设置\n- 交互方式\n\n5. 提交规范\n- 文件命名\n- 图层管理\n- 素材整理\n- 版本控制',
        tags: ['Banner', '广告', '设计'],
        difficulty: '进阶'
      },
      {
        title: 'H5设计需求',
        description: '生成H5页面设计需求',
        content: '请帮我制定H5设计需求，项目是[项目名称]。要求：\n1. 产品定位\n- 活动主题\n- 目标用户\n- 传播渠道\n\n2. 页面规划\n- 信息架构\n- 页面流程\n- 内容布局\n- 功能模块\n\n3. 视觉设计\n- 设计风格\n- 配色方案\n- 插画风格\n- 动效设计\n\n4. 交互要求\n- 手势操作\n- 页面切换\n- 分享设置\n- 加载效果\n\n5. 技术规范\n- 兼容要求\n- 性能优化\n- 素材规范\n- 代码要求',
        tags: ['H5', '设计', '移动端'],
        difficulty: '专业'
      },
      {
        title: '图标设计需求',
        description: '生成图标设计系统需求',
        content: '请帮我写一份图标设计需求，系统是[系统名称]。要求：\n1. 设计规范\n- 设计风格\n- 尺寸规格\n- 网格系统\n- 笔画粗细\n\n2. 视觉要素\n- 基础图形\n- 色彩规范\n- 投影效果\n- 细节处理\n\n3. 系统规划\n- 图标分类\n- 命名规则\n- 使用场景\n- 扩展原则\n\n4. 输出要求\n- 文件格式\n- 切图规范\n- 标注说明\n- 应用示例\n\n5. 维护更新\n- 版本管理\n- 更新流程\n- 审核标准\n- 文档维护',
        tags: ['图标', '系统', '设计'],
        difficulty: '专业'
      },
      {
        title: '动效设计需求',
        description: '生成界面动效设计需求',
        content: '请帮我制定动效设计需求，场景是[场景描述]。要求：\n1. 动效目标\n- 交互目的\n- 体验提升\n- 品牌强化\n\n2. 动效类型\n- 页面切换\n- 状态转换\n- 操作反馈\n- 引导动画\n\n3. 设计规范\n- 动效原则\n- 时间曲线\n- 过渡效果\n- 循环规则\n\n4. 技术实现\n- 实现方式\n- 性能要求\n- 兼容性\n- 代码规范\n\n5. 输出交付\n- 动效说明\n- 参考文件\n- 原型演示\n- 规范文档',
        tags: ['动效', '交互', '设计'],
        difficulty: '专业'
      },
      {
        title: '移动端设计规范',
        description: '生成移动端UI设计规范',
        content: '请帮我制定移动端设计规范，项目是[项目名称]。要求：\n1. 视觉规范\n- 色彩系统\n- 字体规范\n- 图标设计\n- 间距规则\n\n2. 组件规范\n- 基础组件\n- 业务组件\n- 交互规则\n- 状态定义\n\n3. 布局规范\n- 栅格系统\n- 响应式\n- 适配方案\n- 布局模板\n\n4. 交互规范\n- 手势操作\n- 动效规则\n- 反馈机制\n- 转场设计\n\n5. 设计资源\n- 组件库\n- 图标库\n- 设计模板\n- 标注规范',
        tags: ['移动端', 'UI', '规范'],
        difficulty: '专业'
      },
      {
        title: '数据可视化设计',
        description: '生成数据可视化设计方案',
        content: '请帮我设计数据可视化方案，场景是[场景描述]。要求：\n1. 设计策略\n- 信息架构\n- 数据分层\n- 视觉重点\n- 交互模式\n\n2. 图表设计\n- 图表类型\n- 配色方案\n- 布局规则\n- 标注系统\n\n3. 交互设计\n- 筛选控制\n- 数据钻取\n- 联动效果\n- 反馈机制\n\n4. 性能优化\n- 渲染策略\n- 动画控制\n- 数据加载\n- 交互优化\n\n5. 响应式设计\n- 布局适配\n- 内容重组\n- 交互调整\n- 性能兼顾',
        tags: ['可视化', '数据', '设计'],
        difficulty: '专业'
      },
      {
        title: '后台系统设计',
        description: '生成后台管理系统设计方案',
        content: '请帮我设计后台系统界面，系统是[系统名称]。要求：\n1. 框架设计\n- 导航结构\n- 布局系统\n- 功能分区\n- 交互模式\n\n2. 页面规范\n- 列表页面\n- 表单页面\n- 详情页面\n- 统计页面\n\n3. 组件设计\n- 数据展示\n- 操作控件\n- 反馈组件\n- 状态设计\n\n4. 交互优化\n- 批量操作\n- 快捷功能\n- 辅助工具\n- 异常处理\n\n5. 视觉优化\n- 信息层级\n- 操作引导\n- 状态反馈\n- 品牌融入',
        tags: ['后台', '系统', '设计'],
        difficulty: '专业'
      },
      {
        title: 'PS插件脚本',
        description: '生成PS插件脚本开发方案',
        content: '请帮我设计PS插件脚本，功能是[功能描述]。要求：\n1. 功能规划\n- 主要功能\n- 操作流程\n- 使用场景\n- 用户需求\n\n2. 技术实现\n- 开发语言\n- 核心API\n- 数据处理\n- 界面设计\n\n3. 交互设计\n- 操作步骤\n- 参数设置\n- 反馈机制\n- 异常处理\n\n4. 性能优化\n- 运行效率\n- 内存占用\n- 批处理能力\n- 兼容性要求\n\n5. 使用说明\n- 安装方法\n- 使用教程\n- 常见问题\n- 注意事项',
        tags: ['PS', '插件', '脚本'],
        difficulty: '专业'
      },
      {
        title: 'PS动作录制',
        description: '生成PS动作录制方案',
        content: '请帮我设计PS动作录制方案，处理场景是[场景描述]。要求：\n1. 前期准备\n- 素材规范\n- 参数设置\n- 工作区配置\n- 图层管理\n\n2. 录制步骤\n- 基础调整\n- 特效处理\n- 导出设置\n- 批量应用\n\n3. 优化方案\n- 动作精简\n- 参数优化\n- 通用性提升\n- 容错处理\n\n4. 使用指南\n- 使用方法\n- 参数调整\n- 注意事项\n- 常见问题\n\n5. 应用场景\n- 适用范围\n- 最佳实践\n- 效果预览\n- 案例分享',
        tags: ['PS', '动作', '自动化'],
        difficulty: '进阶'
      },
      {
        title: 'PS批处理',
        description: '生成PS批量处理方案',
        content: '请帮我设计PS批处理方案，处理任务是[任务描述]。要求：\n1. 流程设计\n- 处理步骤\n- 参数设置\n- 文件组织\n- 命名规则\n\n2. 优化方案\n- 性能优化\n- 质量控制\n- 错误处理\n- 中断恢复\n\n3. 自动化设置\n- 动作设计\n- 批处理配置\n- 输出设置\n- 日志记录\n\n4. 质量控制\n- 预览检查\n- 参数验证\n- 结果审核\n- 异常处理\n\n5. 使用说明\n- 操作流程\n- 参数说明\n- 注意事项\n- 故障排除',
        tags: ['PS', '批处理', '自动化'],
        difficulty: '专业'
      },
      {
        title: '电商视觉设计规范',
        description: '生成电商平台视觉设计规范',
        content: '请帮我制定电商视觉设计规范，平台是[平台名称]。要求：\n1. 品牌识别系统\n- Logo使用规范\n- 色彩系统定义\n- 字体系统规范\n- 图形元素库\n\n2. 页面设计规范\n- 首页设计标准\n- 列表页设计规范\n- 详情页设计规范\n- 购物流程设计\n\n3. 商品展示标准\n- 主图拍摄规范\n- 详情页制作标准\n- 视频展示规范\n- 型号展示方式\n\n4. 营销视觉规范\n- Banner设计规范\n- 活动页面规范\n- 促销标签系统\n- 会员视觉系统\n\n5. 设计资源库\n- 组件库管理\n- 模板系统建设\n- 图标库规范\n- 设计物料管理',
        tags: ['电商', '视觉', '规范'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '产品文档',
    description: '包含产品需求、项目方案、竞品分析等产品相关提示词',
    icon: 'document',
    prompts: [
      {
        title: 'PRD文档',
        description: '生成标准产品需求文档',
        content: '请帮我写一份产品需求文档(PRD)，产品功能是[功能]。需要包含：\n1. 产品背景和目标\n- 解决的问题和痛点\n- 目标用户群体\n- 核心价值主张\n\n2. 功能详细描述\n- 功能结构和框架\n- 用户使用流程\n- 界面交互说明\n\n3. 技术实现要求\n- 系统依赖关系\n- 接口需求说明\n- 性能要求指标\n\n4. 验收标准\n- 功能验收标准\n- 性能验收标准\n- 体验验收标准\n\n5. 项目规划\n- 开发排期建议\n- 资源需求评估\n- 风险识别分析',
        tags: ['产品', 'PRD', '文档'],
        difficulty: '专业'
      },
      {
        title: '产品规划文档',
        description: '生成产品规划方案',
        content: '请帮我制定产品规划文档，产品是[产品名称]。要求：\n1. 产品战略\n- 产品愿景\n- 市场定位\n- 核心价值\n- 发展目标\n\n2. 用户研究\n- 目标用户\n- 用户痛点\n- 使用场景\n- 需求分析\n\n3. 功能规划\n- 核心功能\n- 创新特性\n- 迭代计划\n- 优先级排序\n\n4. 商业模式\n- 盈利模式\n- 定价策略\n- 市场策略\n- 运营计划\n\n5. 资源规划\n- 团队配置\n- 技术架构\n- 成本预算\n- 风险控制',
        tags: ['产品', '规划', '战略'],
        difficulty: '专业'
      },
      {
        title: '竞品分析报告',
        description: '生成竞品分析文档',
        content: '请帮我写一份竞品分析报告，分析对象是[竞品名称]。要求：\n1. 市场分析\n- 市场规模\n- 市场格局\n- 发展趋势\n- 准入门槛\n\n2. 竞品分析\n- 产品定位\n- 核心功能\n- 商业模式\n- 技术架构\n\n3. 用户分析\n- 用户画像\n- 使用场景\n- 用户评价\n- 满意度分析\n\n4. 对比分析\n- 功能对比\n- 体验对比\n- 商业对比\n- 技术对比\n\n5. 建议策略\n- 差异化策略\n- 改进方向\n- 机会点\n- 风险提示',
        tags: ['竞品', '分析', '报告'],
        difficulty: '专业'
      },
      {
        title: '产品体验报告',
        description: '生成产品体验分析报告',
        content: '请帮我写一份产品体验报告，产品是[产品名称]。要求：\n1. 产品概述\n- 产品定位\n- 核心功能\n- 目标用户\n- 使用场景\n\n2. 体验评估\n- 功能完整性\n- 使用便利性\n- 性能稳定性\n- 视觉体验\n\n3. 问题发现\n- 功能问题\n- 交互问题\n- 视觉问题\n- 技术问题\n\n4. 用户反馈\n- 用户评价\n- 使用数据\n- 反馈渠道\n- 投诉分析\n\n5. 改进建议\n- 短期优化\n- 中期规划\n- 长期建议\n- 优先级排序',
        tags: ['体验', '分析', '报告'],
        difficulty: '进阶'
      },
      {
        title: '产品版本规划',
        description: '生成产品版本迭代规划',
        content: '请帮我制定产品版本规划，产品是[产品名称]。要求：\n1. 版本策略\n- 版本定义\n- 发布周期\n- 命名规则\n- 兼容策略\n\n2. 功能规划\n- 功能列表\n- 优先级\n- 依赖关系\n- 工作量评估\n\n3. 时间安排\n- 开发周期\n- 测试周期\n- 发布时间\n- 里程碑\n\n4. 资源配置\n- 人力需求\n- 技术储备\n- 测试资源\n- 运维支持\n\n5. 风险管理\n- 技术风险\n- 资源风险\n- 市场风险\n- 应对措施',
        tags: ['版本', '规划', '迭代'],
        difficulty: '专业'
      },
      {
        title: '产品数据分析',
        description: '生成产品数据分析报告',
        content: '请帮我写一份产品数据分析报告，分析维度是[维度]。要求：\n1. 核心指标\n- 用户指标\n- 行为指标\n- 业务指标\n- 技术指标\n\n2. 数据分析\n- 趋势分析\n- 对比分析\n- 归因分析\n- 预测分析\n\n3. 问题诊断\n- 异常识别\n- 原因分析\n- 影响评估\n- 优化建议\n\n4. 用户洞察\n- 用户画像\n- 行为路径\n- 转化漏斗\n- 留存分析\n\n5. 改进方向\n- 产品优化\n- 运营策略\n- 技术改进\n- 资源配置',
        tags: ['数据', '分析', '报告'],
        difficulty: '专业'
      },
      {
        title: '产品运营手册',
        description: '生成产品运营指导手册',
        content: '请帮我写一份产品运营手册，产品是[产品名称]。要求：\n1. 产品介绍\n- 产品定位\n- 核心功能\n- 目标用户\n- 价值主张\n\n2. 运营策略\n- 获客策略\n- 活跃策略\n- 转化策略\n- 留存策略\n\n3. 内容运营\n- 内容规划\n- 创作指南\n- 审核标准\n- 发布流程\n\n4. 用户运营\n- 用户分层\n- 权益体系\n- 激励机制\n- 社群运营\n\n5. 数据运营\n- 核心指标\n- 数据分析\n- 优化方向\n- 报告模板',
        tags: ['运营', '手册', '指南'],
        difficulty: '进阶'
      },
      {
        title: '产品测试方案',
        description: '生成产品测试计划文档',
        content: '请帮我制定产品测试方案，产品是[产品名称]。要求：\n1. 测试范围\n- 功能测试\n- 性能测试\n- 兼容测试\n- 安全测试\n\n2. 测试环境\n- 环境配置\n- 数据准备\n- 工具选择\n- 人员分工\n\n3. 测试用例\n- 功能用例\n- 性能用例\n- 异常用例\n- 边界用例\n\n4. 执行计划\n- 时间安排\n- 资源分配\n- 风险预估\n- 应急预案\n\n5. 验收标准\n- 通过标准\n- 验收流程\n- 问题等级\n- 报告模板',
        tags: ['测试', '方案', '质量'],
        difficulty: '专业'
      },
      {
        title: '产品技术文档',
        description: '生成产品技术架构文档',
        content: '请帮我写一份产品技术文档，项目是[项目名称]。要求：\n1. 系统架构\n- 架构设计\n- 技术选型\n- 模块划分\n- 接口设计\n\n2. 数据架构\n- 数据模型\n- 存储方案\n- 缓存策略\n- 安全方案\n\n3. 性能要求\n- 并发指标\n- 响应时间\n- 可用性\n- 扩展性\n\n4. 部署方案\n- 环境要求\n- 部署架构\n- 监控方案\n- 灾备方案\n\n5. 开发规范\n- 编码规范\n- 命名规范\n- 注释规范\n- 版本控制',
        tags: ['技术', '架构', '文档'],
        difficulty: '专业'
      },
      {
        title: '产品评审文档',
        description: '生成产品评审会议文档',
        content: '请帮我写一份产品评审文档，评审项目是[项目名称]。要求：\n1. 项目概述\n- 项目背景\n- 目标收益\n- 关键节点\n- 资源投入\n\n2. 评审重点\n- 产品定位\n- 功能设计\n- 技术方案\n- 运营计划\n\n3. 风险评估\n- 市场风险\n- 技术风险\n- 运营风险\n- 竞争风险\n\n4. 评审流程\n- 评审环节\n- 时间安排\n- 参与人员\n- 评审标准\n\n5. 输出文档\n- 评审结论\n- 修改建议\n- 后续计划\n- 跟进事项',
        tags: ['评审', '会议', '文档'],
        difficulty: '专业'
      },
      {
        title: '产品迭代方案',
        description: '生成产品迭代优化方案',
        content: '请帮我制定产品迭代方案，产品是[产品名称]。要求：\n1. 现状分析\n- 数据分析\n- 用户反馈\n- 问题梳理\n- 竞品对标\n\n2. 优化目标\n- 核心指标\n- 体验提升\n- 功能完善\n- 技术升级\n\n3. 迭代内容\n- 功能优化\n- 交互改进\n- 视觉升级\n- 性能提升\n\n4. 实施计划\n- 优先级排序\n- 资源评估\n- 时间节点\n- 风险控制\n\n5. 效果评估\n- 数据监控\n- 用户反馈\n- 目标达成\n- 持续优化',
        tags: ['迭代', '优化', '产品'],
        difficulty: '专业'
      },
      {
        title: '产品运营手册',
        description: '生成产品运营指导手册',
        content: '请帮我编写产品运营手册，产品是[产品名称]。要求：\n1. 产品定位\n- 目标用户\n- 核心价值\n- 竞争优势\n- 商业模式\n\n2. 运营策略\n- 获客策略\n- 活跃策略\n- 转化策略\n- 留存策略\n\n3. 数据运营\n- 核心指标\n- 数据分析\n- 异常处理\n- 优化方向\n\n4. 内容运营\n- 内容策略\n- 活动策划\n- 社群运营\n- 用户运营\n\n5. 团队协作\n- 职责分工\n- 协作流程\n- 资源调配\n- 应急预案',
        tags: ['运营', '手册', '产品'],
        difficulty: '专业'
      },
      {
        title: '产品路线图',
        description: '生成产品发展路线图',
        content: '请帮我规划产品路线图，产品是[产品名称]。要求：\n1. 战略目标\n- 市场定位\n- 业务目标\n- 技术方向\n- 竞争策略\n\n2. 阶段规划\n- 短期目标\n- 中期规划\n- 长期愿景\n- 里程碑\n\n3. 功能地图\n- 核心功能\n- 创新特性\n- 技术升级\n- 体验优化\n\n4. 资源规划\n- 团队配置\n- 技术储备\n- 预算评估\n- 合作伙伴\n\n5. 风险管理\n- 市场风险\n- 技术风险\n- 资源风险\n- 竞争风险',
        tags: ['路线图', '规划', '产品'],
        difficulty: '专业'
      },
      {
        title: '用户体验优化方案',
        description: '生成用户体验优化完整方案',
        content: '请帮我制定用户体验优化方案，产品是[产品名称]。要求：\n1. 用户研究\n- 用户画像分析\n- 行为数据分析\n- 访谈反馈整理\n- 痛点需求映射\n\n2. 问题诊断\n- 交互流程问题\n- 视觉设计问题\n- 内容组织问题\n- 响应速度问题\n\n3. 优化策略\n- 交互流程优化\n- 信息架构调整\n- 视觉系统更新\n- 内容策略改进\n\n4. 实施计划\n- 优先级排序\n- 资源评估\n- 时间规划\n- 部门协作\n\n5. 效果评估\n- 核心指标设定\n- 测试方法设计\n- 数据收集分析\n- 持续迭代机制',
        tags: ['体验', '优化', 'UX'],
        difficulty: '专业'
      },
      {
        title: '产品创新策略',
        description: '生成产品创新方法论与实施策略',
        content: '请帮我设计产品创新策略，领域是[行业领域]。要求：\n1. 创新定位\n- 创新类型界定\n- 市场机会识别\n- 用户痛点挖掘\n- 技术趋势评估\n\n2. 创新方法\n- 设计思维流程\n- 用户共创模式\n- 敏捷创新框架\n- 开放式创新\n\n3. 构思技术\n- 头脑风暴方法\n- SCAMPER技术\n- 创新工作坊\n- 跨界思维工具\n\n4. 验证方法\n- 最小可行产品\n- A/B测试框架\n- 用户反馈循环\n- 数据驱动决策\n\n5. 组织保障\n- 创新文化建设\n- 激励机制设计\n- 跨部门协作\n- 资源调配策略',
        tags: ['创新', '策略', '方法论'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '数据分析',
    description: '包含数据分析、数据可视化、分析报告等相关提示词',
    icon: 'chart',
    prompts: [
      {
        title: '数据分析报告',
        description: '生成数据分析报告模板',
        content: '请帮我生成数据分析报告，主题是[分析主题]。要求：\n1. 分析背景\n- 分析目的\n- 数据来源\n- 分析范围\n- 分析方法\n\n2. 数据概览\n- 数据结构\n- 数据质量\n- 基础统计\n- 异常识别\n\n3. 深度分析\n- 趋势分析\n- 相关性分析\n- 分布分析\n- 对比分析\n\n4. 结论发现\n- 关键发现\n- 原因分析\n- 影响评估\n- 预测展望\n\n5. 建议方案\n- 优化建议\n- 行动计划\n- 监控指标\n- 效果评估',
        tags: ['分析', '报告', '数据'],
        difficulty: '专业'
      },
      {
        title: '数据可视化方案',
        description: '生成数据可视化设计方案',
        content: '请帮我设计数据可视化方案，数据类型是[数据类型]。要求：\n1. 可视化目标\n- 展示目的\n- 目标受众\n- 使用场景\n- 交互需求\n\n2. 图表选择\n- 图表类型\n- 适用场景\n- 优缺点分析\n- 替代方案\n\n3. 设计规范\n- 配色方案\n- 布局设计\n- 标签设计\n- 交互设计\n\n4. 技术实现\n- 技术选型\n- 数据处理\n- 性能优化\n- 响应式设计\n\n5. 最佳实践\n- 设计原则\n- 常见问题\n- 优化建议\n- 案例参考',
        tags: ['可视化', '设计', '图表'],
        difficulty: '进阶'
      },
      {
        title: '数据指标体系',
        description: '生成数据指标体系设计',
        content: '请帮我设计数据指标体系，业务是[业务领域]。要求：\n1. 指标框架\n- 核心指标\n- 子级指标\n- 派生指标\n- 维度划分\n\n2. 指标定义\n- 指标口径\n- 计算方法\n- 数据来源\n- 更新周期\n\n3. 指标规范\n- 命名规范\n- 单位规范\n- 精度要求\n- 展示格式\n\n4. 监控预警\n- 阈值设定\n- 异常定义\n- 预警级别\n- 处理流程\n\n5. 应用场景\n- 分析场景\n- 决策支持\n- 报表展示\n- 绩效考核',
        tags: ['指标', '体系', '监控'],
        difficulty: '专业'
      },
      {
        title: '数据挖掘方案',
        description: '生成数据挖掘分析方案',
        content: '请帮我设计数据挖掘方案，目标是[挖掘目标]。要求：\n1. 业务理解\n- 业务目标\n- 数据资源\n- 约束条件\n- 成功标准\n\n2. 数据准备\n- 数据收集\n- 数据清洗\n- 特征工程\n- 数据变换\n\n3. 模型选择\n- 算法选择\n- 参数调优\n- 模型评估\n- 模型对比\n\n4. 结果分析\n- 模型解释\n- 规则提取\n- 价值评估\n- 可行性分析\n\n5. 部署应用\n- 系统集成\n- 监控方案\n- 更新策略\n- 效果评估',
        tags: ['挖掘', '分析', '模型'],
        difficulty: '专业'
      },
      {
        title: 'BI报表设计',
        description: '生成BI报表设计方案',
        content: '请帮我设计BI报表，场景是[应用场景]。要求：\n1. 需求分析\n- 用户需求\n- 业务目标\n- 使用场景\n- 功能要求\n\n2. 报表规划\n- 报表类型\n- 展示维度\n- 钻取层级\n- 刷新策略\n\n3. 页面设计\n- 布局规划\n- 组件选择\n- 交互设计\n- 样式规范\n\n4. 数据处理\n- 数据模型\n- 计算字段\n- 数据过滤\n- 权限控制\n\n5. 性能优化\n- 查询优化\n- 缓存策略\n- 并发处理\n- 响应优化',
        tags: ['BI', '报表', '设计'],
        difficulty: '进阶'
      },
      {
        title: '数据质量方案',
        description: '生成数据质量管理方案',
        content: '请帮我设计数据质量方案，数据是[数据类型]。要求：\n1. 质量标准\n- 完整性\n- 准确性\n- 一致性\n- 时效性\n\n2. 检测方案\n- 规则设计\n- 检测周期\n- 工具选择\n- 报警机制\n\n3. 处理流程\n- 问题分类\n- 处理优先级\n- 处理方法\n- 追踪机制\n\n4. 预防措施\n- 源头控制\n- 流程优化\n- 系统改进\n- 人员培训\n\n5. 评估体系\n- 评估指标\n- 评估方法\n- 改进计划\n- 效果跟踪',
        tags: ['质量', '管理', '数据'],
        difficulty: '专业'
      },
      {
        title: '数据分析方法',
        description: '生成数据分析方法指导',
        content: '请帮我提供数据分析方法，场景是[分析场景]。要求：\n1. 分析框架\n- 分析思路\n- 方法选择\n- 工具使用\n- 步骤规划\n\n2. 统计方法\n- 描述统计\n- 推断统计\n- 假设检验\n- 相关分析\n\n3. 高级分析\n- 回归分析\n- 聚类分析\n- 因子分析\n- 时间序列\n\n4. 可视化方法\n- 图表选择\n- 数据展示\n- 结果呈现\n- 洞察提取\n\n5. 实践建议\n- 注意事项\n- 常见问题\n- 优化方向\n- 案例分享',
        tags: ['方法', '分析', '统计'],
        difficulty: '进阶'
      },
      {
        title: '运营分析报告',
        description: '生成运营数据分析报告',
        content: '请帮我生成运营分析报告，主题是[分析主题]。要求：\n1. 运营概况\n- 核心指标\n- 整体趋势\n- 异常分析\n- 目标达成\n\n2. 用户分析\n- 用户画像\n- 行为分析\n- 转化漏斗\n- 留存分析\n\n3. 产品分析\n- 功能使用\n- 路径分析\n- 版本对比\n- 问题发现\n\n4. 活动分析\n- 活动效果\n- 投入产出\n- 用户反馈\n- 优化建议\n\n5. 策略建议\n- 问题诊断\n- 改进方向\n- 行动计划\n- 预期效果',
        tags: ['运营', '分析', '报告'],
        difficulty: '进阶'
      },
      {
        title: '机器学习模型评估',
        description: '生成机器学习模型评估报告',
        content: '请帮我编写机器学习模型评估报告，模型是[模型类型]。要求：\n1. 模型概述\n- 模型类型\n- 算法原理\n- 应用场景\n- 训练目标\n\n2. 数据评估\n- 训练数据分析\n- 特征工程评估\n- 数据质量检查\n- 数据分布特性\n\n3. 性能指标\n- 准确率/精确率/召回率\n- AUC/F1分数\n- 混淆矩阵分析\n- 学习曲线评估\n\n4. 模型解释\n- 特征重要性\n- 模型透明度\n- 决策路径分析\n- 异常预测分析\n\n5. 优化建议\n- 参数调优方向\n- 特征优化策略\n- 模型结构改进\n- 部署注意事项',
        tags: ['机器学习', '模型', '评估'],
        difficulty: '专业'
      },
      {
        title: '增长数据分析框架',
        description: '生成业务增长数据分析框架',
        content: '请帮我设计增长数据分析框架，业务是[业务类型]。要求：\n1. 指标体系\n- 北极星指标定义\n- AARRR漏斗指标\n- 驱动因子分解\n- 预警指标设计\n\n2. 分析维度\n- 用户维度设计\n- 渠道维度划分\n- 时间维度规划\n- 产品维度结构\n\n3. 分析方法\n- 同环比分析\n- 队列分析\n- 归因分析\n- 相关性分析\n\n4. 实验设计\n- A/B测试框架\n- 实验分组方法\n- 样本量计算\n- 结果显著性检验\n\n5. 数据应用\n- 策略优化闭环\n- 自动化决策\n- 预测模型应用\n- 数据产品化',
        tags: ['增长', '分析', '框架'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '社群运营',
    description: '包含社群管理、内容运营、用户运营等社群相关提示词',
    icon: 'group',
    prompts: [
      {
        title: '社群活动策划',
        description: '生成社群活动完整方案',
        content: '请帮我设计一个社群活动方案，主题是[主题]。要求：\n1. 活动定位\n- 活动目标\n- 目标群体\n- 预期效果\n- 活动亮点\n\n2. 活动设计\n- 活动形式\n- 参与规则\n- 时间安排\n- 奖励机制\n\n3. 运营策略\n- 预热方案\n- 引导策略\n- 互动机制\n- 氛围营造\n\n4. 执行计划\n- 人员分工\n- 资源准备\n- 风险预案\n- 应急处理\n\n5. 效果评估\n- 参与指标\n- 互动指标\n- 转化指标\n- 满意度评估',
        tags: ['活动', '社群', '策划'],
        difficulty: '进阶'
      },
      {
        title: '社群内容规划',
        description: '生成社群内容运营方案',
        content: '请帮我制定社群内容规划，社群是[社群名称]。要求：\n1. 内容策略\n- 内容定位\n- 内容主题\n- 内容形式\n- 风格调性\n\n2. 内容框架\n- 内容分类\n- 发布频率\n- 内容比例\n- 质量标准\n\n3. 创作指南\n- 选题方法\n- 创作规范\n- 互动设计\n- 品质要求\n\n4. 发布计划\n- 时间安排\n- 渠道选择\n- 发布流程\n- 权限管理\n\n5. 效果评估\n- 互动指标\n- 传播指标\n- 转化指标\n- 改进建议',
        tags: ['内容', '社群', '运营'],
        difficulty: '专业'
      },
      {
        title: '社群管理制度',
        description: '生成社群管理规范文档',
        content: '请帮我制定社群管理制度，社群是[社群名称]。要求：\n1. 基本规范\n- 入群要求\n- 行为准则\n- 权限设置\n- 奖惩制度\n\n2. 内容管理\n- 发言规范\n- 内容审核\n- 话题管理\n- 广告管理\n\n3. 运营规范\n- 日常运营\n- 活动管理\n- 危机处理\n- 数据统计\n\n4. 成员管理\n- 角色设置\n- 等级制度\n- 激励机制\n- 退群处理\n\n5. 更新维护\n- 制度更新\n- 反馈机制\n- 投诉处理\n- 改进优化',
        tags: ['社群', '管理', '制度'],
        difficulty: '专业'
      },
      {
        title: '社群公告',
        description: '生成社群公告文案',
        content: '请帮我写一个社群公告，内容是[内容]。要求：\n1. 开场语\n- 称呼设计\n- 情感基调\n- 开场引导\n- 注意力抓取\n\n2. 主要内容\n- 核心信息\n- 背景说明\n- 具体安排\n- 执行细节\n\n3. 规则说明\n- 参与规则\n- 注意事项\n- 时间节点\n- 相关要求\n\n4. 参与方式\n- 操作步骤\n- 参与渠道\n- 联系方式\n- 反馈途径\n\n5. 温馨提示\n- 特别说明\n- 常见问题\n- 帮助支持\n- 鼓励语',
        tags: ['公告', '文案', '社群'],
        difficulty: '入门'
      },
      {
        title: '社群运营日历',
        description: '生成社群运营排期计划',
        content: '请帮我制定社群运营日历，社群是[社群名称]。要求：\n1. 内容规划\n- 每日话题\n- 活动安排\n- 直播计划\n- 节日营销\n\n2. 互动设计\n- 打卡活动\n- 话题讨论\n- 问答互动\n- 投票征集\n\n3. 运营节奏\n- 发布时间\n- 互动时段\n- 活动周期\n- 复盘时间\n\n4. 人员安排\n- 值班排期\n- 责任分工\n- 审核机制\n- 应急处理\n\n5. 数据跟踪\n- 互动指标\n- 增长指标\n- 转化指标\n- 复盘总结',
        tags: ['运营', '社群', '规划'],
        difficulty: '进阶'
      },
      {
        title: '社群裂变方案',
        description: '生成社群裂变增长方案',
        content: '请帮我设计社群裂变方案，目标是[目标]。要求：\n1. 裂变机制\n- 裂变模式\n- 奖励机制\n- 参与门槛\n- 传播链路\n\n2. 活动设计\n- 活动主题\n- 参与方式\n- 奖品设置\n- 玩法说明\n\n3. 传播策略\n- 传播渠道\n- 素材准备\n- 话术设计\n- KOL合作\n\n4. 转化路径\n- 引导流程\n- 触达方式\n- 转化节点\n- 留存策略\n\n5. 风险控制\n- 数据监控\n- 舆情管理\n- 应急预案\n- 合规审核',
        tags: ['裂变', '增长', '社群'],
        difficulty: '专业'
      },
      {
        title: '社群激励体系',
        description: '生成社群成员激励方案',
        content: '请帮我设计社群激励体系，社群是[社群名称]。要求：\n1. 等级体系\n- 等级设置\n- 晋升规则\n- 等级权益\n- 降级机制\n\n2. 积分体系\n- 获取规则\n- 使用场景\n- 兑换机制\n- 清零规则\n\n3. 荣誉体系\n- 荣誉设置\n- 获取条件\n- 展示方式\n- 特权权益\n\n4. 任务体系\n- 任务类型\n- 奖励设置\n- 完成条件\n- 验证机制\n\n5. 激励策略\n- 物质奖励\n- 精神激励\n- 社交认可\n- 成长激励',
        tags: ['激励', '运营', '社群'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '客户服务',
    description: '包含售前咨询、售后服务、客诉处理等服务相关提示词',
    prompts: [
      {
        title: '售前咨询',
        description: '生成售前咨询话术',
        content: '请帮我设计售前咨询话术，产品是[产品名称]。要求：\n1. 开场白\n- 问候语设计\n- 身份介绍\n- 意向确认\n- 氛围营造\n\n2. 需求挖掘\n- 场景探索\n- 痛点挖掘\n- 预算了解\n- 决策因素\n\n3. 产品介绍\n- 核心价值\n- 功能特点\n- 竞品优势\n- 案例分享\n\n4. 异议处理\n- 常见异议\n- 处理技巧\n- 解决方案\n- 价值转化\n\n5. 邀约成交\n- 总结陈述\n- 促销信息\n- 达成共识\n- 后续跟进',
        tags: ['售前', '咨询', '话术'],
        difficulty: '进阶'
      },
      {
        title: '客诉处理',
        description: '生成客诉处理话术',
        content: '请帮我设计客诉处理话术，问题类型是[问题类型]。要求：\n1. 情绪安抚\n- 倾听技巧\n- 共情表达\n- 态度把控\n- 情绪疏导\n\n2. 问题确认\n- 信息收集\n- 问题复述\n- 原因分析\n- 责任界定\n\n3. 解决方案\n- 处理流程\n- 解决方案\n- 时效承诺\n- 进度反馈\n\n4. 补偿方案\n- 补偿标准\n- 方案选择\n- 诚意展示\n- 满意度确认\n\n5. 总结跟进\n- 处理总结\n- 预防措施\n- 回访计划\n- 改进建议',
        tags: ['客诉', '处理', '服务'],
        difficulty: '专业'
      },
      {
        title: '在线客服话术',
        description: '生成在线客服应对话术',
        content: '请帮我设计在线客服话术，服务场景是[场景]。要求：\n1. 基础话术\n- 问候语\n- 引导语\n- 等待提示\n- 结束语\n\n2. 业务咨询\n- 产品介绍\n- 服务说明\n- 价格政策\n- 活动规则\n\n3. 问题处理\n- 常见问题\n- 操作指导\n- 故障处理\n- 紧急情况\n\n4. 投诉应对\n- 情绪安抚\n- 解决方案\n- 补偿政策\n- 升级流程\n\n5. 服务技巧\n- 话术技巧\n- 效率提升\n- 服务标准\n- 质量控制',
        tags: ['客服', '话术', '在线'],
        difficulty: '进阶'
      },
      {
        title: '满意度回访',
        description: '生成客户满意度回访话术',
        content: '请帮我设计满意度回访话术，回访对象是[对象类型]。要求：\n1. 开场白\n- 身份介绍\n- 来意说明\n- 时间确认\n- 感谢语\n\n2. 满意度调研\n- 产品体验\n- 服务评价\n- 建议收集\n- 期望了解\n\n3. 问题跟进\n- 历史问题\n- 新增需求\n- 改进效果\n- 解决方案\n\n4. 关系维护\n- 关怀话术\n- 忠诚度提升\n- 活动推荐\n- 会员权益\n\n5. 结束语\n- 总结反馈\n- 后续安排\n- 联系方式\n- 感谢语',
        tags: ['回访', '满意度', '调研'],
        difficulty: '进阶'
      },
      {
        title: '会员服务指南',
        description: '生成会员服务指导手册',
        content: '请帮我制定会员服务指南，会员体系是[体系名称]。要求：\n1. 会员体系\n- 等级设置\n- 权益说明\n- 升级规则\n- 积分政策\n\n2. 服务标准\n- 基础服务\n- 特权服务\n- 专属服务\n- 增值服务\n\n3. 服务流程\n- 咨询服务\n- 问题处理\n- 投诉处理\n- 建议反馈\n\n4. 服务保障\n- 响应时效\n- 服务质量\n- 隐私保护\n- 安全保障\n\n5. 服务提升\n- 满意度管理\n- 服务创新\n- 体验优化\n- 持续改进',
        tags: ['会员', '服务', '指南'],
        difficulty: '专业'
      },
      {
        title: '服务质量评估',
        description: '生成服务质量评估方案',
        content: '请帮我设计服务质量评估方案，服务类型是[类型]。要求：\n1. 评估维度\n- 服务态度\n- 专业能力\n- 响应速度\n- 解决效率\n\n2. 评估方法\n- 客户反馈\n- 神秘访客\n- 数据分析\n- 同行对标\n\n3. 评估标准\n- 量化指标\n- 质量标准\n- 评分规则\n- 考核方式\n\n4. 改进机制\n- 问题识别\n- 原因分析\n- 改进方案\n- 跟踪验证\n\n5. 激励机制\n- 绩效考核\n- 奖惩制度\n- 培训计划\n- 晋升通道',
        tags: ['服务', '评估', '质量'],
        difficulty: '专业'
      },
      {
        title: '客户维系方案',
        description: '生成客户关系维护方案',
        content: '请帮我制定客户维系方案，客户群是[客户群体]。要求：\n1. 客户分层\n- 价值评估\n- 分层标准\n- 服务差异\n- 升级通道\n\n2. 维系策略\n- 沟通计划\n- 关怀政策\n- 权益设计\n- 活动安排\n\n3. 产品服务\n- 个性化方案\n- 增值服务\n- 专属权益\n- 创新服务\n\n4. 危机预防\n- 预警机制\n- 处理流程\n- 挽留方案\n- 补救措施\n\n5. 效果评估\n- 满意度调查\n- 忠诚度分析\n- 流失率监控\n- 价值贡献',
        tags: ['维系', '客户', '关系'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '开发工程师',
    description: '包含前端、后端、移动端等开发相关提示词',
    icon: 'code',
    prompts: [
      {
        title: '代码优化建议',
        description: '生成代码优化和重构建议',
        content: '请帮我优化以下代码，代码是[代码]。需要从以下方面分析：\n1. 代码质量\n- 代码可读性\n- 代码复杂度\n- 命名规范\n- 注释完整性\n\n2. 性能优化\n- 算法效率\n- 资源占用\n- 并发处理\n- 内存管理\n\n3. 架构改进\n- 设计模式应用\n- 模块解耦\n- 扩展性\n- 可维护性\n\n4. 安全性\n- 输入验证\n- 异常处理\n- 权限控制\n- 数据安全\n\n5. 测试建议\n- 单元测试\n- 集成测试\n- 边界测试',
        tags: ['代码优化', '重构', '性能'],
        difficulty: '专业'
      },
      {
        title: '技术方案设计',
        description: '生成技术架构设计方案',
        content: '请帮我设计技术方案，项目是[项目]。需要包含：\n1. 架构设计\n- 系统架构\n- 技术选型\n- 部署架构\n\n2. 核心模块\n- 模块划分\n- 接口设计\n- 数据流转\n\n3. 关键技术\n- 技术难点\n- 解决方案\n- 性能保障\n\n4. 安全方案\n- 安全架构\n- 加密方案\n- 风险控制\n\n5. 质量保障\n- 监控方案\n- 容灾方案\n- 测试策略',
        tags: ['架构设计', '技术方案', '系统设计'],
        difficulty: '专业'
      },
      {
        title: '架构设计评审',
        description: '生成架构设计评审要点',
        content: '请帮我制定架构设计评审要点，项目是[项目名称]。要求：\n1. 系统架构\n- 架构选型\n- 模块划分\n- 接口设计\n- 数据流转\n\n2. 技术选型\n- 技术栈评估\n- 性能要求\n- 扩展性\n- 维护成本\n\n3. 安全设计\n- 安全机制\n- 权限控制\n- 数据加密\n- 攻击防护\n\n4. 可用性设计\n- 容错机制\n- 灾备方案\n- 监控告警\n- 应急预案\n\n5. 评审重点\n- 技术风险\n- 性能瓶颈\n- 扩展难点\n- 优化空间',
        tags: ['架构', '评审', '设计'],
        difficulty: '专业'
      },
      {
        title: '研发规范指南',
        description: '生成研发团队规范文档',
        content: '请帮我制定研发规范指南，团队是[团队名称]。要求：\n1. 开发规范\n- 代码风格\n- 命名规范\n- 注释规范\n- 版本控制\n\n2. 流程规范\n- 需求管理\n- 开发流程\n- 测试流程\n- 发布流程\n\n3. 文档规范\n- 文档类型\n- 编写标准\n- 维护要求\n- 存储管理\n\n4. 协作规范\n- 任务分配\n- 进度管理\n- 评审机制\n- 沟通机制\n\n5. 质量管理\n- 代码审查\n- 测试要求\n- 性能标准\n- 安全规范',
        tags: ['规范', '研发', '团队'],
        difficulty: '专业'
      },
      {
        title: '技术债务评估',
        description: '生成技术债务评估报告',
        content: '请帮我编写技术债务评估报告，项目是[项目名称]。要求：\n1. 代码质量\n- 代码复杂度\n- 重复代码\n- 代码覆盖率\n- 潜在缺陷\n\n2. 架构评估\n- 架构合理性\n- 扩展性问题\n- 性能问题\n- 维护难度\n\n3. 技术栈\n- 版本老旧\n- 依赖风险\n- 升级成本\n- 替换难度\n\n4. 文档完整性\n- 文档覆盖\n- 文档准确性\n- 文档可用性\n- 维护状况\n\n5. 改进建议\n- 优先级排序\n- 解决方案\n- 资源估算\n- 风险评估',
        tags: ['技术债务', '评估', '优化'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '人力资源',
    description: '包含招聘、培训、绩效等人力资源相关提示词',
    icon: 'hr',
    prompts: [
      {
        title: '岗位说明书',
        description: '生成标准岗位说明书',
        content: '请帮我编写岗位说明书，职位是[职位]。需要包含：\n1. 岗位信息\n- 岗位名称\n- 部门归属\n- 汇报关系\n- 岗位级别\n\n2. 岗位职责\n- 工作内容\n- 关键职责\n- 业绩指标\n- 管理范围\n\n3. 任职要求\n- 教育背景\n- 工作经验\n- 专业技能\n- 个人素质\n\n4. 发展路径\n- 晋升通道\n- 发展方向\n- 培训计划\n\n5. 薪酬福利\n- 薪资范围\n- 福利待遇\n- 绩效奖金',
        tags: ['岗位说明书', 'JD', '招聘'],
        difficulty: '进阶'
      },
      {
        title: '面试评估',
        description: '生成面试评估报告',
        content: '请帮我写一份面试评估报告，候选人是[姓名]。需要包含：\n1. 基本评估\n- 专业能力\n- 工作经验\n- 学习能力\n- 沟通表达\n\n2. 能力维度\n- 专业技能\n- 管理能力\n- 团队协作\n- 问题解决\n\n3. 性格特征\n- 性格分析\n- 价值观\n- 职业规划\n- 稳定性\n\n4. 匹配度分析\n- 岗位匹配度\n- 团队匹配度\n- 文化匹配度\n\n5. 录用建议\n- 综合评价\n- 待遇建议\n- 风险提示',
        tags: ['面试', '评估', '招聘'],
        difficulty: '专业'
      },
      {
        title: '绩效考核方案',
        description: '生成绩效考核制度',
        content: '请帮我设计绩效考核方案，部门是[部门名称]。要求：\n1. 考核体系\n- 考核维度\n- 指标设置\n- 权重分配\n- 评分标准\n\n2. 考核流程\n- 目标制定\n- 过程跟踪\n- 结果评估\n- 反馈沟通\n\n3. 考核周期\n- 考核频率\n- 时间节点\n- 数据收集\n- 结果应用\n\n4. 激励机制\n- 奖金分配\n- 晋升机制\n- 培训发展\n- 淘汰机制\n\n5. 申诉机制\n- 申诉流程\n- 处理方式\n- 结果反馈\n- 改进机制',
        tags: ['绩效', '考核', '人力资源'],
        difficulty: '专业'
      },
      {
        title: '员工培训体系',
        description: '生成员工培训体系方案',
        content: '请帮我制定员工培训体系，企业是[企业名称]。要求：\n1. 培训架构\n- 培训类型\n- 课程体系\n- 讲师团队\n- 评估体系\n\n2. 培训计划\n- 年度规划\n- 课程安排\n- 预算分配\n- 资源配置\n\n3. 实施方案\n- 需求调研\n- 课程开发\n- 培训实施\n- 效果评估\n\n4. 激励机制\n- 学习积分\n- 认证体系\n- 发展通道\n- 应用转化\n\n5. 管理机制\n- 组织保障\n- 制度保障\n- 资源保障\n- 监督反馈',
        tags: ['培训', '发展', '人力资源'],
        difficulty: '专业'
      },
      {
        title: '人才发展规划',
        description: '生成人才发展规划方案',
        content: '请帮我制定人才发展规划，企业是[企业名称]。要求：\n1. 人才战略\n- 发展目标\n- 人才标准\n- 梯队建设\n- 储备计划\n\n2. 职业发展\n- 职级体系\n- 晋升通道\n- 轮岗机制\n- 导师制度\n\n3. 能力发展\n- 能力模型\n- 培养方案\n- 评估机制\n- 发展路径\n\n4. 激励保障\n- 薪酬体系\n- 福利政策\n- 认可机制\n- 留任计划\n\n5. 管理机制\n- 选拔标准\n- 考核方式\n- 退出机制\n- 动态调整',
        tags: ['人才', '发展', '规划'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '教育培训',
    description: '包含教学设计、课程开发、培训方案等教育相关提示词',
    icon: 'education',
    prompts: [
      {
        title: '课程设计方案',
        description: '生成课程设计整体方案',
        content: '请帮我设计课程方案，课程主题是[课程主题]。要求：\n1. 课程定位\n- 目标人群\n- 学习目标\n- 课程特色\n- 预期成果\n\n2. 课程内容\n- 知识体系\n- 课程大纲\n- 重点难点\n- 案例设计\n\n3. 教学设计\n- 教学方法\n- 互动设计\n- 作业设计\n- 评估方式\n\n4. 课程资源\n- 教材选择\n- 参考资料\n- 教具准备\n- 媒体资源\n\n5. 实施计划\n- 课时安排\n- 进度规划\n- 教学环节\n- 应急预案',
        tags: ['课程', '设计', '教学'],
        difficulty: '专业'
      },
      {
        title: '培训方案设计',
        description: '生成企业培训方案',
        content: '请帮我设计培训方案，培训主题是[培训主题]。要求：\n1. 培训需求\n- 培训目的\n- 培训对象\n- 能力要求\n- 预期效果\n\n2. 培训内容\n- 知识模块\n- 技能模块\n- 实践模块\n- 考核模块\n\n3. 培训形式\n- 授课方式\n- 互动环节\n- 实操演练\n- 案例研讨\n\n4. 资源配置\n- 师资配备\n- 场地安排\n- 设备需求\n- 材料准备\n\n5. 评估体系\n- 考核方式\n- 评估标准\n- 反馈机制\n- 效果跟踪',
        tags: ['培训', '方案', '企业'],
        difficulty: '进阶'
      },
      {
        title: '教学设计模板',
        description: '生成教学设计详细模板',
        content: '请帮我制作教学设计，课程是[课程名称]。要求：\n1. 教学目标\n- 知识目标\n- 能力目标\n- 素养目标\n- 情感目标\n\n2. 教学重难点\n- 重点内容\n- 难点分析\n- 突破方法\n- 教学策略\n\n3. 教学过程\n- 导入设计\n- 讲解设计\n- 互动设计\n- 总结设计\n\n4. 教学活动\n- 活动设计\n- 时间分配\n- 组织形式\n- 注意事项\n\n5. 教学评价\n- 评价方式\n- 评价标准\n- 反馈设计\n- 改进建议',
        tags: ['教学', '设计', '课程'],
        difficulty: '进阶'
      },
      {
        title: '微课设计方案',
        description: '生成微课制作方案',
        content: '请帮我设计微课方案，主题是[课程主题]。要求：\n1. 内容设计\n- 主题选择\n- 内容结构\n- 重点难点\n- 时长控制\n\n2. 课件制作\n- 版式设计\n- 文字处理\n- 图片使用\n- 动画设计\n\n3. 录制要求\n- 设备选择\n- 环境要求\n- 语音要求\n- 画面要求\n\n4. 后期制作\n- 视频剪辑\n- 特效添加\n- 字幕制作\n- 音频处理\n\n5. 质量控制\n- 内容审核\n- 技术检查\n- 效果测试\n- 意见收集',
        tags: ['微课', '设计', '制作'],
        difficulty: '进阶'
      },
      {
        title: '考试题库设计',
        description: '生成考试题库建设方案',
        content: '请帮我设计题库方案，科目是[科目名称]。要求：\n1. 题库框架\n- 知识点覆盖\n- 题型设置\n- 难度分布\n- 题量规划\n\n2. 题目设计\n- 题目类型\n- 考点设置\n- 答案设计\n- 解析编写\n\n3. 质量控制\n- 审核标准\n- 评审流程\n- 更新机制\n- 错误处理\n\n4. 使用管理\n- 权限设置\n- 抽题规则\n- 组卷方式\n- 使用统计\n\n5. 维护更新\n- 定期检查\n- 题目更新\n- 反馈处理\n- 版本管理',
        tags: ['题库', '考试', '设计'],
        difficulty: '专业'
      },
      {
        title: '在线课程设计',
        description: '生成在线课程开发方案',
        content: '请帮我设计在线课程，课程是[课程名称]。要求：\n1. 课程规划\n- 课程目标\n- 受众分析\n- 课程架构\n- 学习路径\n\n2. 内容设计\n- 课程模块\n- 知识点设计\n- 案例设计\n- 作业设计\n\n3. 交互设计\n- 学习活动\n- 互动方式\n- 反馈机制\n- 激励机制\n\n4. 技术实现\n- 平台选择\n- 功能需求\n- 界面设计\n- 兼容性要求\n\n5. 运营方案\n- 课程运营\n- 学习支持\n- 数据分析\n- 持续优化',
        tags: ['在线', '课程', '设计'],
        difficulty: '专业'
      },
      {
        title: '教学评估方案',
        description: '生成教学评估体系方案',
        content: '请帮我设计教学评估方案，评估对象是[评估对象]。要求：\n1. 评估框架\n- 评估维度\n- 评估指标\n- 评估标准\n- 权重设置\n\n2. 评估方法\n- 评估工具\n- 数据采集\n- 分析方法\n- 结果呈现\n\n3. 实施流程\n- 评估准备\n- 过程监控\n- 数据处理\n- 结果反馈\n\n4. 应用机制\n- 结果应用\n- 改进建议\n- 跟踪机制\n- 激励机制\n\n5. 保障措施\n- 组织保障\n- 制度保障\n- 资源保障\n- 技术支持',
        tags: ['评估', '教学', '方案'],
        difficulty: '专业'
      },
      {
        title: '学习资源设计',
        description: '生成学习资源开发方案',
        content: '请帮我设计学习资源，主题是[学习主题]。要求：\n1. 资源规划\n- 资源类型\n- 内容范围\n- 难度层次\n- 使用场景\n\n2. 内容设计\n- 知识点展现\n- 案例设计\n- 练习设计\n- 拓展资源\n\n3. 形式设计\n- 媒体选择\n- 交互设计\n- 界面设计\n- 导航设计\n\n4. 制作规范\n- 技术标准\n- 格式要求\n- 质量标准\n- 命名规范\n\n5. 应用建议\n- 使用指南\n- 教学建议\n- 常见问题\n- 更新维护',
        tags: ['资源', '学习', '设计'],
        difficulty: '进阶'
      }
    ]
  },
  {
    name: '财务会计',
    description: '包含财务分析、预算管理、税务筹划等财务相关提示词',
    icon: 'finance',
    prompts: [
      {
        title: '财务分析报告',
        description: '生成财务分析报告',
        content: '请帮我编写财务分析报告，分析对象是[对象]。需要包含：\n1. 财务状况\n- 资产负债\n- 现金流量\n- 盈利能力\n- 营运能力\n\n2. 比率分析\n- 偿债能力\n- 运营效率\n- 盈利水平\n- 发展能力\n\n3. 趋势分析\n- 历史对比\n- 行业对标\n- 发展趋势\n- 风险预警\n\n4. 问题诊断\n- 主要问题\n- 成因分析\n- 影响评估\n- 应对建议\n\n5. 改进建议\n- 优化方向\n- 具体措施\n- 预期效果\n- 实施计划',
        tags: ['财务分析', '报告', '诊断'],
        difficulty: '专业'
      },
      {
        title: '预算规划',
        description: '生成预算规划方案',
        content: '请帮我制定预算规划，部门/项目是[名称]。需要包含：\n1. 预算目标\n- 总体目标\n- 具体指标\n- 考核标准\n- 预期效益\n\n2. 收入预算\n- 收入来源\n- 金额预估\n- 实现计划\n- 风险评估\n\n3. 支出预算\n- 成本构成\n- 费用分类\n- 控制标准\n- 节约措施\n\n4. 资金计划\n- 资金需求\n- 筹措渠道\n- 使用计划\n- 监控方案\n\n5. 预算管理\n- 预算编制\n- 执行监控\n- 调整机制\n- 考核方案',
        tags: ['预算', '规划', '财务'],
        difficulty: '专业'
      },
      {
        title: '成本控制方案',
        description: '生成成本控制优化方案',
        content: '请帮我制定成本控制方案，业务是[业务类型]。要求：\n1. 成本分析\n- 成本构成\n- 成本动因\n- 成本趋势\n- 对标分析\n\n2. 控制目标\n- 总体目标\n- 分项目标\n- 考核指标\n- 时间节点\n\n3. 控制措施\n- 预算管理\n- 过程管控\n- 审批流程\n- 监督机制\n\n4. 优化方案\n- 流程优化\n- 资源整合\n- 供应链优化\n- 技术改造\n\n5. 保障机制\n- 组织保障\n- 制度保障\n- 考核激励\n- 持续改进',
        tags: ['成本', '控制', '优化'],
        difficulty: '专业'
      },
      {
        title: '税务筹划方案',
        description: '生成税务筹划建议方案',
        content: '请帮我设计税务筹划方案，企业是[企业名称]。要求：\n1. 现状分析\n- 税负情况\n- 业务模式\n- 纳税义务\n- 风险评估\n\n2. 筹划目标\n- 节税目标\n- 风险控制\n- 合规要求\n- 效益评估\n\n3. 筹划方案\n- 业务筹划\n- 财务筹划\n- 投资筹划\n- 融资筹划\n\n4. 实施计划\n- 方案论证\n- 流程设计\n- 文档准备\n- 人员培训\n\n5. 风险控制\n- 政策风险\n- 操作风险\n- 监控方案\n- 应急预案',
        tags: ['税务', '筹划', '财务'],
        difficulty: '专业'
      },
      {
        title: '内控体系设计',
        description: '生成财务内控体系方案',
        content: '请帮我设计内控体系，领域是[业务领域]。要求：\n1. 控制环境\n- 组织架构\n- 职责分工\n- 授权审批\n- 制度建设\n\n2. 业务流程\n- 关键环节\n- 控制点\n- 操作规范\n- 记录要求\n\n3. 风险评估\n- 风险识别\n- 风险分级\n- 应对措施\n- 预警机制\n\n4. 监督评价\n- 日常监督\n- 专项检查\n- 评价标准\n- 整改跟踪\n\n5. 信息沟通\n- 报告制度\n- 信息传递\n- 档案管理\n- 系统支持',
        tags: ['内控', '制度', '财务'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '法务专员',
    description: '包含合同审核、法律咨询、风险管理等法务相关提示词',
    icon: 'legal',
    prompts: [
      {
        title: '合同审核',
        description: '生成合同审核要点',
        content: '请帮我审核合同，合同类型是[类型]。需要包含：\n1. 基本要素\n- 主体资格\n- 权利义务\n- 合同期限\n- 违约责任\n\n2. 重点条款\n- 付款条件\n- 交付标准\n- 保密条款\n- 争议解决\n\n3. 风险评估\n- 法律风险\n- 商业风险\n- 履约风险\n- 终止风险\n\n4. 合规性\n- 法律法规\n- 行业规范\n- 公司制度\n- 监管要求\n\n5. 修改建议\n- 条款完善\n- 风险防范\n- 权益保护\n- 补充条款',
        tags: ['合同', '审核', '法务'],
        difficulty: '专业'
      },
      {
        title: '法律意见书',
        description: '生成法律意见书',
        content: '请帮我写一份法律意见书，事项是[事项]。需要包含：\n1. 基本情况\n- 事实描述\n- 相关主体\n- 法律关系\n- 争议焦点\n\n2. 法律分析\n- 适用法律\n- 法律依据\n- 案例参考\n- 争议分析\n\n3. 风险评估\n- 法律风险\n- 影响程度\n- 发展趋势\n- 应对措施\n\n4. 解决方案\n- 处理建议\n- 操作步骤\n- 注意事项\n- 替代方案\n\n5. 防范建议\n- 制度完善\n- 流程优化\n- 合规要求\n- 长效机制',
        tags: ['法律意见', '风险', '合规'],
        difficulty: '专业'
      },
      {
        title: '法律风险防范',
        description: '生成法律风险防范方案',
        content: '请帮我制定法律风险防范方案，领域是[业务领域]。要求：\n1. 风险识别\n- 合同风险\n- 经营风险\n- 合规风险\n- 知识产权风险\n\n2. 防范措施\n- 制度建设\n- 流程优化\n- 合同管理\n- 培训宣导\n\n3. 监控机制\n- 日常监控\n- 定期检查\n- 预警机制\n- 报告制度\n\n4. 应急处置\n- 应急预案\n- 处置流程\n- 善后措施\n- 复盘总结\n\n5. 持续改进\n- 评估机制\n- 更新完善\n- 案例积累\n- 经验总结',
        tags: ['风险', '防范', '法务'],
        difficulty: '专业'
      },
      {
        title: '知识产权保护',
        description: '生成知识产权保护方案',
        content: '请帮我设计知识产权保护方案，企业是[企业名称]。要求：\n1. 资产梳理\n- 专利资产\n- 商标资产\n- 著作权资产\n- 商业秘密\n\n2. 保护策略\n- 申请注册\n- 维权措施\n- 许可管理\n- 保密制度\n\n3. 风险防范\n- 侵权监控\n- 维权准备\n- 证据保全\n- 应对措施\n\n4. 管理机制\n- 部门职责\n- 审批流程\n- 奖惩制度\n- 培训计划\n\n5. 实施保障\n- 预算支持\n- 人员配置\n- 技术支持\n- 外部合作',
        tags: ['知识产权', '保护', '法务'],
        difficulty: '专业'
      },
      {
        title: '合规管理体系',
        description: '生成企业合规管理方案',
        content: '请帮我设计合规管理体系，企业是[企业名称]。要求：\n1. 合规框架\n- 组织架构\n- 制度体系\n- 职责分工\n- 工作流程\n\n2. 重点领域\n- 行业监管\n- 公司治理\n- 经营合规\n- 数据合规\n\n3. 管理措施\n- 风险评估\n- 制度建设\n- 流程优化\n- 培训教育\n\n4. 监督检查\n- 自查机制\n- 审计监督\n- 问责制度\n- 整改跟踪\n\n5. 评估优化\n- 效果评估\n- 问题分析\n- 改进建议\n- 持续优化',
        tags: ['合规', '管理', '法务'],
        difficulty: '专业'
      },
      {
        title: '劳动合同审核',
        description: '生成劳动合同审核要点',
        content: '请帮我审核劳动合同。需要包含：\n1. 基本要素审核\n- 劳动合同期限\n- 工作内容和地点\n- 工作时间和休息休假\n- 劳动报酬\n- 社会保险和福利待遇\n- 劳动保护和工作条件\n\n2. 特殊条款审核\n- 试用期条款\n- 培训协议\n- 竞业限制\n- 保密条款\n- 考核标准\n\n3. 合规性检查\n- 劳动法律法规\n- 地方政策规定\n- 行业特殊要求\n- 公司规章制度\n\n4. 风险评估\n- 劳动争议风险\n- 经济补偿风险\n- 违约责任风险\n- 终止风险\n\n5. 优化建议\n- 条款完善建议\n- 表述规范建议\n- 风险防范建议\n- 补充条款建议',
        tags: ['劳动合同', '审核', '法务'],
        difficulty: '专业'
      },
      {
        title: '股权协议审核',
        description: '生成股权协议审核要点',
        content: '请帮我审核股权协议。需要包含：\n1. 基本要素审核\n- 股权比例和估值\n- 出资方式和期限\n- 股东权利义务\n- 公司治理结构\n- 利润分配机制\n\n2. 特殊条款审核\n- 优先认购权\n- 反稀释条款\n- 优先清算权\n- 拖带权/跟随权\n- 回购条款\n\n3. 合规性检查\n- 公司法规定\n- 证券法要求\n- 行业监管要求\n- 公司章程一致性\n\n4. 风险评估\n- 股权变动风险\n- 控制权风险\n- 退出机制风险\n- 估值争议风险\n\n5. 优化建议\n- 条款完善建议\n- 权益保护建议\n- 争议解决建议\n- 补充条款建议',
        tags: ['股权', '协议', '法务'],
        difficulty: '专业'
      },
      {
        title: '商标注册咨询',
        description: '生成商标注册咨询要点',
        content: '请帮我提供商标注册咨询建议。需要包含：\n1. 注册前评估\n- 商标查重分析\n- 显著性分析\n- 注册类别建议\n- 使用范围规划\n\n2. 注册流程指导\n- 申请材料准备\n- 注册流程说明\n- 时间周期预估\n- 费用预算\n\n3. 风险防范建议\n- 驳回风险防范\n- 异议风险防范\n- 侵权风险防范\n- 无效风险防范\n\n4. 保护策略\n- 防御性注册建议\n- 商标监测方案\n- 维权准备建议\n- 许可使用建议\n\n5. 长期维护\n- 续展规划\n- 使用证据保存\n- 侵权监测方案\n- 品牌价值提升',
        tags: ['商标', '知识产权', '法务'],
        difficulty: '专业'
      },
      {
        title: '法律尽职调查',
        description: '生成法律尽职调查要点',
        content: '请帮我制定法律尽职调查方案。需要包含：\n1. 调查范围\n- 公司主体资格\n- 资产权属状况\n- 重大合同履行\n- 诉讼仲裁情况\n- 行政处罚记录\n\n2. 调查方法\n- 文件审查清单\n- 实地走访计划\n- 访谈提纲\n- 公开信息核查\n- 专项调查方案\n\n3. 重点领域\n- 股权结构梳理\n- 资质许可核查\n- 知识产权核查\n- 劳动用工核查\n- 合规运营核查\n\n4. 风险评估\n- 法律风险等级\n- 影响程度分析\n- 解决方案建议\n- 防范措施建议\n\n5. 报告输出\n- 调查报告框架\n- 问题清单整理\n- 整改建议\n- 后续跟进计划',
        tags: ['尽调', '法务', '风险'],
        difficulty: '专业'
      },
      {
        title: '企业合规培训',
        description: '生成企业合规培训方案',
        content: '请帮我设计企业合规培训方案。需要包含：\n1. 培训内容\n- 法律法规解读\n- 行业规范要求\n- 公司制度讲解\n- 案例分析\n- 实操演练\n\n2. 培训对象分类\n- 管理层培训\n- 业务部门培训\n- 新员工培训\n- 专项岗位培训\n\n3. 培训方式\n- 线上课程设计\n- 线下讲座安排\n- 研讨会组织\n- 考核评估方案\n\n4. 重点领域\n- 反商业贿赂\n- 数据合规\n- 知识产权保护\n- 劳动合规\n- 反垄断合规\n\n5. 效果评估\n- 考核标准制定\n- 效果追踪方案\n- 问题反馈机制\n- 持续改进计划',
        tags: ['合规', '培训', '法务'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '销售顾问',
    description: '包含销售技巧、客户开发、商务谈判等销售相关提示词',
    icon: 'sales',
    prompts: [
      {
        title: '销售方案',
        description: '生成销售策略方案',
        content: '请帮我制定销售方案，产品/服务是[名称]。需要包含：\n1. 市场分析\n- 目标市场\n- 客户画像\n- 竞品分析\n- 市场机会\n\n2. 销售策略\n- 价格策略\n- 渠道策略\n- 促销策略\n- 竞争策略\n\n3. 执行计划\n- 目标分解\n- 团队配置\n- 资源调配\n- 时间节点\n\n4. 客户管理\n- 开发计划\n- 维护方案\n- 服务标准\n- 关系建设\n\n5. 考核方案\n- 业绩指标\n- 过程管理\n- 激励机制\n- 调整机制',
        tags: ['销售', '策略', '方案'],
        difficulty: '专业'
      },
      {
        title: '商务谈判',
        description: '生成商务谈判话术',
        content: '请帮我准备商务谈判，谈判主题是[主题]。需要包含：\n1. 谈判准备\n- 目标设定\n- 对手分析\n- 谈判筹码\n- 底线确定\n\n2. 开场策略\n- 破冰技巧\n- 氛围营造\n- 议程设置\n- 立场表明\n\n3. 谈判技巧\n- 询问技巧\n- 说服技巧\n- 让步策略\n- 应对技巧\n\n4. 异议处理\n- 常见异议\n- 处理方法\n- 转化技巧\n- 化解方案\n\n5. 达成协议\n- 总结要点\n- 确认细节\n- 后续跟进\n- 关系维护',
        tags: ['谈判', '商务', '沟通'],
        difficulty: '专业'
      },
      {
        title: '客户开发计划',
        description: '生成客户开发策略方案',
        content: '请帮我制定客户开发计划，目标客户是[客户类型]。要求：\n1. 客户画像\n- 需求特征\n- 决策因素\n- 购买行为\n- 痛点分析\n\n2. 开发策略\n- 目标设定\n- 资源配置\n- 开发路径\n- 时间节点\n\n3. 接触方案\n- 接触渠道\n- 话术设计\n- 材料准备\n- 跟进节奏\n\n4. 转化流程\n- 意向培育\n- 需求挖掘\n- 方案匹配\n- 促单技巧\n\n5. 客情维护\n- 拜访计划\n- 关系建立\n- 信息收集\n- 长期经营',
        tags: ['开发', '客户', '销售'],
        difficulty: '专业'
      },
      {
        title: '销售团队管理',
        description: '生成销售团队管理方案',
        content: '请帮我设计销售团队管理方案，团队是[团队类型]。要求：\n1. 组织架构\n- 岗位设置\n- 职责划分\n- 汇报关系\n- 协作机制\n\n2. 目标管理\n- 目标设定\n- 任务分解\n- 过程管理\n- 结果考核\n\n3. 激励机制\n- 薪酬方案\n- 晋升通道\n- 绩效奖金\n- 团队激励\n\n4. 培训体系\n- 新人培训\n- 技能提升\n- 案例分享\n- 经验萃取\n\n5. 管理制度\n- 工作规范\n- 考勤制度\n- 例会制度\n- 奖惩制度',
        tags: ['团队', '管理', '销售'],
        difficulty: '专业'
      },
      {
        title: '竞品应对策略',
        description: '生成竞品销售应对方案',
        content: '请帮我制定竞品应对策略，竞品是[竞品名称]。要求：\n1. 竞品分析\n- 产品对比\n- 价格对比\n- 优劣势分析\n- 市场策略\n\n2. 应对策略\n- 差异化定位\n- 价值突出\n- 优势强化\n- 短板规避\n\n3. 话术设计\n- 优势阐述\n- 异议处理\n- 价值转化\n- 成功案例\n\n4. 客户引导\n- 需求挖掘\n- 方案匹配\n- 决策促进\n- 风险规避\n\n5. 持续优化\n- 效果跟踪\n- 反馈收集\n- 策略调整\n- 团队赋能',
        tags: ['竞品', '策略', '销售'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '项目管理',
    description: '包含项目规划、风险管理、团队协作等项目管理相关提示词',
    icon: 'project',
    prompts: [
      {
        title: '项目启动书',
        description: '生成项目启动文档',
        content: '请帮我编写项目启动书，项目是[项目名称]。需要包含：\n1. 项目概述\n- 项目背景\n- 项目目标\n- 项目范围\n- 关键干系人\n\n2. 项目组织\n- 组织架构\n- 角色职责\n- 沟通机制\n- 汇报路线\n\n3. 项目计划\n- 里程碑计划\n- 资源规划\n- 预算规划\n- 质量目标\n\n4. 风险管理\n- 风险识别\n- 应对策略\n- 监控方案\n- 应急预案\n\n5. 项目规范\n- 管理制度\n- 工作流程\n- 文档模板\n- 验收标准',
        tags: ['项目管理', '启动', '规划'],
        difficulty: '专业'
      },
      {
        title: '敏捷迭代计划',
        description: '生成敏捷开发迭代计划',
        content: '请帮我制定敏捷迭代计划，迭代周期是[周期]。需要包含：\n1. 迭代目标\n- 业务目标\n- 技术目标\n- 交付标准\n- 验收条件\n\n2. 需求规划\n- 用户故事\n- 优先级排序\n- 工作量评估\n- 任务分解\n\n3. 团队协作\n- 角色分工\n- 每日站会\n- 评审会议\n- 回顾会议\n\n4. 质量保障\n- 测试策略\n- 代码审查\n- 持续集成\n- 发布计划\n\n5. 改进措施\n- 效率提升\n- 问题跟踪\n- 经验总结\n- 持续改进',
        tags: ['敏捷', '迭代', '计划'],
        difficulty: '进阶'
      },
      {
        title: '项目质量管理',
        description: '生成项目质量管理方案',
        content: '请帮我制定项目质量管理方案，项目是[项目名称]。需要包含：\n1. 质量目标\n- 总体目标\n- 具体指标\n- 验收标准\n- 评估方法\n\n2. 质量保证\n- 组织架构\n- 职责分工\n- 管理制度\n- 工作流程\n\n3. 质量控制\n- 检查方法\n- 测试计划\n- 问题跟踪\n- 改进措施\n\n4. 风险管理\n- 风险识别\n- 评估方法\n- 应对措施\n- 监控方案\n\n5. 持续改进\n- 数据分析\n- 改进计划\n- 效果评估\n- 标准更新',
        tags: ['质量', '管理', '项目'],
        difficulty: '专业'
      },
      {
        title: '行业研究报告',
        description: '生成行业研究分析报告',
        content: '请帮我编写行业研究报告，行业是[行业名称]。需要包含：\n1. 行业概况\n- 市场规模\n- 发展阶段\n- 产业链分析\n- 商业模式\n\n2. 竞争格局\n- 市场份额\n- 主要玩家\n- 竞争策略\n- 进入壁垒\n\n3. 发展趋势\n- 技术趋势\n- 政策趋势\n- 消费趋势\n- 创新方向\n\n4. 机会挑战\n- 市场机会\n- 潜在风险\n- 发展瓶颈\n- 应对策略\n\n5. 投资建议\n- 投资价值\n- 投资方向\n- 风险提示\n- 发展建议',
        tags: ['研究', '分析', '报告'],
        difficulty: '专业'
      },
      {
        title: '用户调研方案',
        description: '生成用户研究调研方案',
        content: '请帮我设计用户调研方案，调研目标是[目标]。需要包含：\n1. 调研目的\n- 研究问题\n- 调研目标\n- 预期成果\n- 应用场景\n\n2. 调研方法\n- 定性研究\n- 定量研究\n- 样本设计\n- 工具选择\n\n3. 执行计划\n- 时间安排\n- 人员分工\n- 资源准备\n- 预算规划\n\n4. 分析框架\n- 数据处理\n- 分析方法\n- 评估标准\n- 结论形成\n\n5. 应用建议\n- 结果解读\n- 实施建议\n- 跟踪评估\n- 持续优化',
        tags: ['调研', '用户研究', '方案'],
        difficulty: '进阶'
      }
    ]
  },
  {
    name: '品牌营销',
    description: '包含品牌策划、营销推广、传播方案等品牌营销相关提示词',
    icon: 'brand',
    prompts: [
      {
        title: '品牌策略规划',
        description: '生成品牌策略规划方案',
        content: '请帮我制定品牌策略规划，品牌是[品牌名称]。需要包含：\n1. 品牌定位\n- 品牌愿景\n- 核心价值\n- 目标用户\n- 品牌个性\n\n2. 品牌策略\n- 差异化策略\n- 传播策略\n- 渠道策略\n- 产品策略\n\n3. 视觉系统\n- 品牌标识\n- 色彩系统\n- 视觉风格\n- 应用规范\n\n4. 传播执行\n- 传播主题\n- 内容策略\n- 媒体规划\n- 预算分配\n\n5. 效果评估\n- 品牌资产\n- 市场表现\n- 用户反馈\n- 优化方向',
        tags: ['品牌', '策略', '规划'],
        difficulty: '专业'
      },
      {
        title: '营销传播方案',
        description: '生成整合营销传播方案',
        content: '请帮我设计营销传播方案，产品/服务是[名称]。需要包含：\n1. 传播策略\n- 传播目标\n- 目标受众\n- 传播重点\n- 预期效果\n\n2. 内容规划\n- 核心信息\n- 创意策略\n- 内容形式\n- 话题设计\n\n3. 渠道选择\n- 主要渠道\n- 协同策略\n- 资源分配\n- 投放节奏\n\n4. 执行计划\n- 时间节点\n- 执行要点\n- 监测指标\n- 应急预案\n\n5. 效果评估\n- 数据分析\n- 效果评估\n- 优化建议\n- 经验总结',
        tags: ['营销', '传播', '方案'],
        difficulty: '专业'
      },
      {
        title: '社交媒体营销',
        description: '生成社交媒体营销方案',
        content: '请帮我设计社交媒体营销方案，产品/品牌是[名称]。需要包含：\n1. 平台策略\n- 平台选择\n- 账号定位\n- 内容风格\n- 运营节奏\n\n2. 内容规划\n- 内容主题\n- 内容形式\n- 互动策略\n- 话题设计\n\n3. 活动策划\n- 活动主题\n- 参与机制\n- 奖励设置\n- 传播路径\n\n4. 数据分析\n- 核心指标\n- 数据监测\n- 效果评估\n- 优化方向\n\n5. 危机管理\n- 风险预警\n- 应对流程\n- 舆情监控\n- 处理方案',
        tags: ['社媒', '营销', '运营'],
        difficulty: '专业'
      },
      {
        title: '品牌故事策划',
        description: '生成品牌故事策划方案',
        content: '请帮我创作品牌故事，品牌是[品牌名称]。需要包含：\n1. 故事框架\n- 品牌起源\n- 核心理念\n- 发展历程\n- 未来愿景\n\n2. 情感连接\n- 价值主张\n- 情感诉求\n- 共鸣点\n- 记忆点\n\n3. 表现形式\n- 叙事方式\n- 语言风格\n- 视觉元素\n- 传播载体\n\n4. 应用场景\n- 品牌推广\n- 产品包装\n- 营销传播\n- 内部文化\n\n5. 效果评估\n- 传播效果\n- 情感共鸣\n- 品牌认知\n- 调整优化',
        tags: ['品牌', '故事', '策划'],
        difficulty: '专业'
      },
      {
        title: '新媒体营销',
        description: '生成新媒体营销方案',
        content: '请帮我设计新媒体营销方案，产品/服务是[名称]。需要包含：\n1. 渠道布局\n- 渠道选择\n- 渠道定位\n- 资源配置\n- 协同策略\n\n2. 内容策略\n- 内容规划\n- 创意方向\n- 产出节奏\n- 质量标准\n\n3. 运营策略\n- 粉丝运营\n- 互动策略\n- 社群运营\n- KOL合作\n\n4. 推广方案\n- 付费推广\n- 自然传播\n- 活动策划\n- 转化路径\n\n5. 效果评估\n- 数据监测\n- 效果分析\n- ROI评估\n- 优化建议',
        tags: ['新媒体', '营销', '运营'],
        difficulty: '专业'
      },
      {
        title: '品牌活动策划',
        description: '生成品牌活动策划方案',
        content: '请帮我设计品牌活动方案，活动主题是[主题]。需要包含：\n1. 活动定位\n- 活动目标\n- 目标受众\n- 核心信息\n- 预期效果\n\n2. 活动策划\n- 活动主题\n- 活动形式\n- 时间地点\n- 流程设计\n\n3. 传播计划\n- 传播策略\n- 媒体选择\n- 话题设计\n- 物料制作\n\n4. 执行管理\n- 人员分工\n- 预算控制\n- 供应商管理\n- 风险控制\n\n5. 效果评估\n- 数据收集\n- 效果分析\n- 总结报告\n- 经验复盘',
        tags: ['活动', '策划', '品牌'],
        difficulty: '专业'
      },
      {
        title: '品牌视觉设计',
        description: '生成品牌视觉设计方案',
        content: '请帮我设计品牌视觉方案，品牌是[品牌名称]。需要包含：\n1. 视觉定位\n- 品牌调性\n- 目标受众\n- 视觉风格\n- 设计原则\n\n2. 基础系统\n- 品牌标志\n- 品牌色彩\n- 品牌字体\n- 图形元素\n\n3. 应用系统\n- 包装设计\n- 宣传物料\n- 环境导视\n- 数字媒体\n\n4. 规范制定\n- 使用规范\n- 尺寸规范\n- 色彩规范\n- 禁用规范\n\n5. 管理维护\n- 资产管理\n- 更新机制\n- 审核流程\n- 培训推广',
        tags: ['视觉', '设计', '品牌'],
        difficulty: '专业'
      },
      {
        title: '品牌危机公关',
        description: '生成品牌危机公关方案',
        content: '请帮我制定品牌危机公关方案，危机类型是[类型]。需要包含：\n1. 危机评估\n- 危机类型\n- 影响范围\n- 传播态势\n- 舆论倾向\n\n2. 应对策略\n- 回应原则\n- 说明口径\n- 传播渠道\n- 时间节点\n\n3. 执行方案\n- 组织分工\n- 信息发布\n- 舆情监控\n- 媒体沟通\n\n4. 善后处理\n- 补救措施\n- 关系修复\n- 形象重塑\n- 内部沟通\n\n5. 总结改进\n- 原因分析\n- 流程优化\n- 预案完善\n- 长效机制',
        tags: ['危机', '公关', '品牌'],
        difficulty: '专业'
      },
      {
        title: '短视频营销策略',
        description: '生成短视频平台营销方案',
        content: '请帮我制定短视频营销策略，产品/品牌是[名称]。需要包含：\n1. 平台选择\n- 平台特性分析\n- 目标受众匹配\n- 竞争环境评估\n- 资源配置建议\n\n2. 内容策略\n- 内容主题规划\n- 创意方向设定\n- 风格调性指导\n- 爆款内容模式\n\n3. 拍摄制作\n- 拍摄风格建议\n- 剪辑节奏设计\n- 特效应用指南\n- 音乐配乐选择\n\n4. 运营策略\n- 发布频率计划\n- 互动引导方案\n- 话题标签策略\n- 账号定位建议\n\n5. 投放与合作\n- KOL合作策略\n- 广告投放建议\n- 跨平台联动\n- 效果评估指标',
        tags: ['短视频', '营销', '策略'],
        difficulty: '专业'
      },
      {
        title: '品牌口碑营造',
        description: '生成品牌口碑建设方案',
        content: '请帮我设计品牌口碑营造方案，品牌是[品牌名称]。需要包含：\n1. 口碑基础构建\n- 产品质量保障\n- 服务体验设计\n- 核心价值传递\n- 客户期望管理\n\n2. 用户关系管理\n- 用户反馈机制\n- 社群运营策略\n- 忠诚度项目\n- 问题处理流程\n\n3. 内容口碑策略\n- UGC内容激励\n- 真实评价引导\n- 口碑故事挖掘\n- 专业评测合作\n\n4. 传播放大\n- 口碑传播渠道\n- 关键意见领袖\n- 话题设计策略\n- 二次传播机制\n\n5. 危机预防\n- 负面监测系统\n- 快速响应流程\n- 挽回机制设计\n- 口碑恢复策略',
        tags: ['口碑', '品牌', '传播'],
        difficulty: '专业'
      },
      {
        title: '国际营销策略',
        description: '生成跨国市场营销方案',
        content: '请帮我制定国际营销策略，产品/品牌是[名称]。需要包含：\n1. 市场选择\n- 目标市场分析\n- 进入顺序规划\n- 文化适应性评估\n- 法规环境研究\n\n2. 产品策略\n- 标准化与本地化平衡\n- 产品调整方案\n- 定位差异化设计\n- 包装与标签调整\n\n3. 营销传播\n- 跨文化沟通策略\n- 传播渠道选择\n- 品牌形象塑造\n- 营销内容调整\n\n4. 渠道与价格\n- 分销渠道设计\n- 价格策略制定\n- 合作伙伴选择\n- 供应链管理\n\n5. 团队与执行\n- 组织架构设计\n- 本地团队建设\n- 跨文化团队管理\n- 风险控制机制',
        tags: ['国际', '营销', '跨国'],
        difficulty: '专业'
      },
      {
        title: '内容营销矩阵',
        description: '生成多平台内容营销体系',
        content: '请帮我设计内容营销矩阵，品牌/产品是[名称]。需要包含：\n1. 平台矩阵规划\n- 核心平台确定\n- 辅助平台选择\n- 平台定位差异\n- 资源分配策略\n\n2. 内容体系设计\n- 内容主题架构\n- 内容形式规划\n- 风格调性统一\n- 差异化亮点\n\n3. 创作与生产\n- 内容创作指南\n- 生产流程优化\n- 质量控制体系\n- 创意来源拓展\n\n4. 发布与传播\n- 发布节奏策略\n- 平台间联动\n- 热点把握策略\n- 二次传播设计\n\n5. 数据与优化\n- 核心指标设定\n- 监测分析系统\n- 内容迭代机制\n- 资源调整方法',
        tags: ['内容', '矩阵', '多平台'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '商业分析',
    description: '包含商业计划、财务分析、投资决策等商业相关提示词',
    icon: 'business',
    prompts: [
      {
        title: '商业计划书',
        description: '生成商业计划书模板',
        content: '请帮我编写商业计划书，项目是[项目名称]。要求：\n1. 项目概述\n- 项目背景\n- 市场机会\n- 商业模式\n- 核心优势\n\n2. 市场分析\n- 市场规模\n- 目标客户\n- 竞争格局\n- 发展趋势\n\n3. 营销策略\n- 产品策略\n- 定价策略\n- 渠道策略\n- 推广策略\n\n4. 财务规划\n- 收入模型\n- 成本结构\n- 盈利预测\n- 融资需求\n\n5. 风险控制\n- 风险识别\n- 应对措施\n- 退出机制\n- 应急预案',
        tags: ['商业', '计划', '创业'],
        difficulty: '专业'
      },
      {
        title: '财务分析报告',
        description: '生成财务分析详细报告',
        content: '请帮我编写财务分析报告，分析对象是[企业/项目名称]。要求：\n1. 财务状况\n- 资产负债\n- 现金流量\n- 盈利能力\n- 运营效率\n\n2. 比率分析\n- 偿债能力\n- 营运能力\n- 盈利能力\n- 发展能力\n\n3. 趋势分析\n- 历史对比\n- 行业对标\n- 发展趋势\n- 预警指标\n\n4. 风险评估\n- 财务风险\n- 经营风险\n- 市场风险\n- 政策风险\n\n5. 改进建议\n- 成本控制\n- 效率提升\n- 结构优化\n- 风险防范',
        tags: ['财务', '分析', '报告'],
        difficulty: '专业'
      },
      {
        title: '投资分析报告',
        description: '生成投资项目分析报告',
        content: '请帮我编写投资分析报告，项目是[项目名称]。要求：\n1. 项目评估\n- 项目概况\n- 市场前景\n- 竞争优势\n- 团队实力\n\n2. 财务分析\n- 投资规模\n- 收益预测\n- 现金流量\n- 回报周期\n\n3. 风险分析\n- 市场风险\n- 经营风险\n- 财务风险\n- 政策风险\n\n4. 投资方案\n- 投资规模\n- 投资方式\n- 退出机制\n- 收益分配\n\n5. 建议决策\n- 投资建议\n- 风控措施\n- 监管要求\n- 退出策略',
        tags: ['投资', '分析', '决策'],
        difficulty: '专业'
      },
      {
        title: '战略规划方案',
        description: '生成企业战略规划方案',
        content: '请帮我制定战略规划方案，企业是[企业名称]。要求：\n1. 战略分析\n- 外部环境\n- 内部能力\n- 竞争态势\n- 发展机遇\n\n2. 战略定位\n- 愿景使命\n- 战略目标\n- 核心价值\n- 发展方向\n\n3. 战略举措\n- 业务布局\n- 资源配置\n- 能力建设\n- 组织保障\n\n4. 实施路径\n- 阶段目标\n- 重点任务\n- 时间节点\n- 责任分工\n\n5. 保障机制\n- 组织保障\n- 资源保障\n- 制度保障\n- 文化保障',
        tags: ['战略', '规划', '企业'],
        difficulty: '专业'
      },
      {
        title: '成本优化方案',
        description: '生成企业成本优化方案',
        content: '请帮我设计成本优化方案，领域是[业务领域]。要求：\n1. 成本分析\n- 成本结构\n- 成本构成\n- 成本动因\n- 浪费环节\n\n2. 优化目标\n- 总体目标\n- 分项目标\n- 时间节点\n- 考核指标\n\n3. 优化措施\n- 流程优化\n- 资源整合\n- 技术改造\n- 管理创新\n\n4. 实施计划\n- 优化步骤\n- 资源配置\n- 人员安排\n- 时间规划\n\n5. 效果评估\n- 节约指标\n- 效率指标\n- 质量指标\n- 满意度指标',
        tags: ['成本', '优化', '管理'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '技术开发',
    description: '包含编程开发、代码审查、技术文档等开发相关提示词',
    icon: 'code',
    prompts: [
      {
        title: '代码审查',
        description: '生成代码审查反馈意见',
        content: '请帮我进行代码审查，代码是[代码片段]。要求：\n1. 代码质量\n- 代码规范\n- 命名规范\n- 注释完整性\n- 代码复杂度\n\n2. 性能分析\n- 时间复杂度\n- 空间复杂度\n- 资源占用\n- 优化建议\n\n3. 安全检查\n- 安全漏洞\n- 数据验证\n- 异常处理\n- 权限控制\n\n4. 可维护性\n- 代码结构\n- 模块划分\n- 耦合程度\n- 扩展性\n\n5. 测试建议\n- 测试用例\n- 边界条件\n- 异常场景\n- 覆盖率要求',
        tags: ['代码优化', '重构', '性能'],
        difficulty: '专业'
      },
      {
        title: '技术方案设计',
        description: '生成技术架构设计方案',
        content: '请帮我设计技术方案，项目是[项目名称]。要求：\n1. 需求分析\n- 业务目标\n- 功能需求\n- 性能需求\n- 安全需求\n\n2. 架构设计\n- 系统架构\n- 技术选型\n- 数据流程\n- 接口设计\n\n3. 详细设计\n- 模块划分\n- 数据模型\n- 核心算法\n- 异常处理\n\n4. 实现计划\n- 开发规范\n- 任务分解\n- 时间节点\n- 风险控制\n\n5. 验收标准\n- 测试要求\n- 性能指标\n- 安全要求\n- 文档规范',
        tags: ['方案', '架构', '设计'],
        difficulty: '专业'
      },
      {
        title: 'API接口设计',
        description: '生成API接口设计文档',
        content: '请帮我设计API接口，功能是[功能描述]。要求：\n1. 接口规范\n- 请求方式\n- 接口地址\n- 参数格式\n- 响应格式\n\n2. 参数设计\n- 请求参数\n- 响应参数\n- 参数验证\n- 错误码\n\n3. 安全设计\n- 认证方式\n- 权限控制\n- 加密方案\n- 限流策略\n\n4. 性能考虑\n- 缓存策略\n- 并发处理\n- 超时处理\n- 性能优化\n\n5. 文档规范\n- 接口说明\n- 示例代码\n- 测试用例\n- 版本控制',
        tags: ['API', '接口', '设计'],
        difficulty: '专业'
      },
      {
        title: '数据库设计',
        description: '生成数据库设计方案',
        content: '请帮我设计数据库方案，业务是[业务描述]。要求：\n1. 需求分析\n- 业务需求\n- 数据规模\n- 性能要求\n- 安全要求\n\n2. 概念设计\n- 实体关系\n- 属性定义\n- 关系模型\n- 范式分析\n\n3. 物理设计\n- 表结构\n- 索引设计\n- 分区策略\n- 存储方案\n\n4. 优化方案\n- 查询优化\n- 性能优化\n- 备份策略\n- 扩展方案\n\n5. 安全方案\n- 访问控制\n- 数据加密\n- 审计日志\n- 容灾备份',
        tags: ['数据库', '设计', '优化'],
        difficulty: '专业'
      },
      {
        title: '测试用例设计',
        description: '生成测试用例设计文档',
        content: '请帮我设计测试用例，功能是[功能描述]。要求：\n1. 功能测试\n- 正常流程\n- 异常流程\n- 边界条件\n- 数据验证\n\n2. 性能测试\n- 负载测试\n- 压力测试\n- 并发测试\n- 稳定性测试\n\n3. 安全测试\n- 漏洞测试\n- 权限测试\n- 注入测试\n- 加密测试\n\n4. 兼容性测试\n- 平台兼容\n- 设备兼容\n- 版本兼容\n- 数据兼容\n\n5. 自动化测试\n- 测试框架\n- 测试脚本\n- 持续集成\n- 报告生成',
        tags: ['测试', '用例', '质量'],
        difficulty: '专业'
      },
      {
        title: '微服务架构设计',
        description: '生成微服务系统架构方案',
        content: '请帮我设计微服务架构方案，业务场景是[业务场景]。要求：\n1. 服务划分\n- 领域模型分析\n- 服务边界确定\n- 接口设计原则\n- 数据模型规划\n\n2. 技术架构\n- 技术栈选择\n- 中间件方案\n- 通信机制\n- 容器化策略\n\n3. 数据管理\n- 数据一致性方案\n- 分布式事务\n- 数据存储选型\n- 缓存策略\n\n4. 可靠性设计\n- 服务发现机制\n- 负载均衡策略\n- 熔断降级方案\n- 高可用架构\n\n5. 部署与监控\n- CI/CD流水线\n- 监控警报体系\n- 日志收集方案\n- 性能指标监测',
        tags: ['微服务', '架构', '设计'],
        difficulty: '专业'
      },
      {
        title: '算法设计与优化',
        description: '生成算法方案与性能优化建议',
        content: '请帮我设计并优化算法，解决问题是[问题描述]。要求：\n1. 算法设计\n- 问题分析\n- 算法选择\n- 数据结构设计\n- 伪代码实现\n\n2. 复杂度分析\n- 时间复杂度\n- 空间复杂度\n- 最坏情况分析\n- 平均性能评估\n\n3. 优化方向\n- 算法改进点\n- 数据结构优化\n- 空间时间权衡\n- 并行计算可能\n\n4. 实现注意点\n- 边界条件处理\n- 异常情况应对\n- 代码简洁性\n- 可读性与维护性\n\n5. 验证与测试\n- 正确性验证方法\n- 性能测试方案\n- 压力测试建议\n- 比较基准设计',
        tags: ['算法', '优化', '性能'],
        difficulty: '专业'
      },
      {
        title: '前端架构设计',
        description: '生成前端项目架构设计方案',
        content: '请帮我设计前端架构方案，项目是[项目描述]。要求：\n1. 技术选型\n- 框架评估\n- 状态管理方案\n- UI组件库选择\n- 构建工具链\n\n2. 项目结构\n- 目录组织\n- 模块划分\n- 路由设计\n- 组件结构\n\n3. 数据流设计\n- 状态管理模式\n- API交互方案\n- 数据缓存策略\n- 异步处理方案\n\n4. 性能优化\n- 加载性能策略\n- 渲染性能优化\n- 资源优化方案\n- 缓存利用\n\n5. 工程化实践\n- 代码规范制定\n- 测试策略\n- CI/CD配置\n- 文档生成方案',
        tags: ['前端', '架构', '设计'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '人工智能开发',
    description: '包含AI模型开发、训练、评估与部署等人工智能相关提示词',
    icon: 'ai-dev',
    prompts: [
      {
        title: '训练数据设计',
        description: '设计AI模型训练数据集方案',
        content: '请帮我设计AI训练数据方案，模型类型是[模型类型]。需要包含：\n\n1. 数据需求分析\n- 模型任务特征分析\n- 数据量需求估计\n- 数据分布要求\n- 质量标准确定\n\n2. 数据来源规划\n- 公开数据集评估\n- 自建数据方案\n- 合成数据可行性\n- 采集与标注策略\n\n3. 数据处理流程\n- 清洗流程设计\n- 标准化方法\n- 增强技术选择\n- 特征工程建议\n\n4. 数据质量控制\n- 多样性保障措施\n- 偏差识别与控制\n- 标注质量验证\n- 异常样本处理\n\n5. 数据分割与管理\n- 训练/验证/测试分割\n- 版本管理策略\n- 更新迭代机制\n- 数据安全保障\n\n请提供完整的训练数据方案，并说明如何确保数据的代表性和有效性。',
        tags: ['数据', '训练', 'AI'],
        difficulty: '专业'
      },
      {
        title: '模型评估方案',
        description: '设计AI模型全面评估框架',
        content: '请帮我设计AI模型评估方案，评估对象是[模型类型]。需要包含：\n\n1. 评估指标体系\n- 任务特定指标\n- 通用性能指标\n- 效率类指标\n- 对标模型选择\n\n2. 测试数据设计\n- 标准测试集选择\n- 特殊场景测试集\n- 对抗测试数据\n- 边缘案例设计\n\n3. 评估方法设计\n- 离线评估方法\n- 在线评估策略\n- A/B测试设计\n- 人机协作评估\n\n4. 偏见与公平性\n- 偏见检测维度\n- 公平性衡量方法\n- 群体表现差异分析\n- 减偏策略建议\n\n5. 可解释性分析\n- 特征重要性分析\n- 决策路径追踪\n- 反事实解释方法\n- 模型行为可视化\n\n请提供全面的模型评估方案，包括量化和质化评估方法，以及持续监控与优化建议。',
        tags: ['评估', '模型', '性能'],
        difficulty: '专业'
      },
      {
        title: '模型优化策略',
        description: '生成AI模型性能优化方案',
        content: '请帮我制定AI模型优化策略，模型是[模型描述]。需要包含：\n\n1. 性能瓶颈分析\n- 错误模式识别\n- 计算瓶颈定位\n- 推理速度分析\n- 资源消耗评估\n\n2. 数据优化方向\n- 数据增强策略\n- 样本权重调整\n- 难例挖掘方法\n- 数据清洗建议\n\n3. 模型结构优化\n- 架构改进建议\n- 参数规模调整\n- 模块替换选项\n- 集成方法考量\n\n4. 训练策略优化\n- 学习率调整策略\n- 正则化方法选择\n- 批次大小实验\n- 训练流程改进\n\n5. 部署优化方案\n- 量化压缩技术\n- 推理加速方法\n- 模型裁剪策略\n- 硬件适配优化\n\n请提供详细的优化路线图，包括短期可行的改进和长期研发方向，并分析每种优化方法的成本效益比。',
        tags: ['优化', 'AI', '性能'],
        difficulty: '专业'
      },
      {
        title: 'AI产品需求分析',
        description: '制定AI产品功能与技术需求',
        content: '请帮我进行AI产品需求分析，产品是[产品名称]。需要包含：\n\n1. 用户需求分析\n- 目标用户画像\n- 核心使用场景\n- 用户痛点提炼\n- 需求优先级排序\n\n2. 功能需求定义\n- 核心功能设计\n- 差异化能力规划\n- 功能界限划定\n- 扩展可能性评估\n\n3. 技术实现分析\n- 算法模型选择\n- 数据依赖评估\n- 性能需求界定\n- 技术风险识别\n\n4. 交互设计需求\n- 用户体验目标\n- 关键交互流程\n- 反馈机制设计\n- 界面呈现方式\n\n5. 非功能性需求\n- 响应时间要求\n- 可靠性标准\n- 安全与隐私规范\n- 可扩展性要求\n\n请提供全面的AI产品需求文档，包括明确的功能规格和技术路线建议，以及需求验证和迭代方法。',
        tags: ['需求', '产品', 'AI'],
        difficulty: '进阶'
      },
      {
        title: 'AI系统架构设计',
        description: '设计AI系统整体技术架构',
        content: '请帮我设计AI系统架构，系统是[系统名称]。需要包含：\n\n1. 系统整体架构\n- 架构设计原则\n- 系统层次划分\n- 模块关系设计\n- 扩展性考量\n\n2. 数据架构设计\n- 数据流程规划\n- 存储架构选择\n- 实时/离线处理\n- 数据安全策略\n\n3. 模型服务架构\n- 训练系统设计\n- 推理服务架构\n- 版本管理机制\n- 模型监控方案\n\n4. 交互层设计\n- API设计原则\n- 服务编排策略\n- 负载均衡方案\n- 错误处理机制\n\n5. 部署与运维架构\n- 部署策略设计\n- 资源分配方案\n- 监控系统规划\n- 灾备与高可用\n\n请提供详细的架构设计文档，包括关键技术选型理由、系统流程图、容量规划和可能的技术风险应对策略。',
        tags: ['架构', '系统', 'AI'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '润色文案',
    description: '包含文案润色、语言优化、风格转换等润色相关提示词',
    icon: 'edit',
    prompts: [
      {
        title: '文案润色',
        description: '优化提升文案表达效果',
        content: '请帮我润色以下文案，要求:\n1. 表达优化\n- 语言更生动\n- 逻辑更清晰\n- 重点更突出\n- 情感更真实\n\n2. 风格调整\n- 符合品牌调性\n- 适合目标受众\n- 体现专业性\n- 保持一致性\n\n3. 结构优化\n- 层次分明\n- 重点突出\n- 过渡自然\n- 首尾呼应\n\n原文:\n[在此粘贴原文]',
        tags: ['润色', '优化', '文案'],
        difficulty: '入门'
      },
      {
        title: '学术论文润色',
        description: '优化学术论文语言表达',
        content: '请帮我润色以下学术论文内容，要求:\n1. 专业性\n- 术语规范\n- 表达严谨\n- 逻辑严密\n- 引用规范\n\n2. 语言优化\n- 清晰准确\n- 简洁凝练\n- 连贯流畅\n- 避免重复\n\n3. 格式规范\n- 段落结构\n- 标点使用\n- 参考文献\n- 图表说明\n\n原文:\n[在此粘贴原文]',
        tags: ['论文', '学术', '润色'],
        difficulty: '专业'
      },
      {
        title: '商务文案润色',
        description: '优化商务沟通文案',
        content: '请帮我润色以下商务文案，要求:\n1. 专业性\n- 用语规范\n- 表达得体\n- 重点明确\n- 语气恰当\n\n2. 结构优化\n- 条理清晰\n- 重点突出\n- 层次分明\n- 格式规范\n\n3. 语言提升\n- 简洁精准\n- 礼貌专业\n- 积极正面\n- 有说服力\n\n原文:\n[在此粘贴原文]',
        tags: ['商务', '文案', '润色'],
        difficulty: '进阶'
      },
      {
        title: '营销文案润色',
        description: '优化提升营销文案转化效果',
        content: '请帮我润色以下营销文案，要求:\n1. 吸引力提升\n- 标题更吸睛\n- 开场更抓人\n- 卖点更突出\n- 情感共鸣更强\n\n2. 说服力增强\n- 价值主张更清晰\n- 证明元素更有力\n- 购买理由更充分\n- 风险消除更彻底\n\n3. 转化力优化\n- 行动指引更明确\n- 紧迫感更自然\n- 流程更简化\n- 结尾更有力\n\n4. 语言风格调整\n- 符合目标受众\n- 匹配营销渠道\n- 体现品牌调性\n- 差异化表达\n\n原文:\n[在此粘贴原文]',
        tags: ['营销', '转化', '润色'],
        difficulty: '进阶'
      },
      {
        title: '创意文案优化',
        description: '提升文案创意性和感染力',
        content: '请帮我优化以下创意文案，要求:\n1. 创意性提升\n- 概念更新颖\n- 角度更独特\n- 联想更丰富\n- 表现更创新\n\n2. 表达手法优化\n- 修辞更精彩\n- 节奏更韵律\n- 意象更鲜明\n- 对比更强烈\n\n3. 情感共鸣增强\n- 情感触发点更准\n- 故事性更强\n- 场景感更丰富\n- 代入感更强\n\n4. 记忆点打造\n- 核心语更精炼\n- 关键词更突出\n- 金句更易记\n- 整体更连贯\n\n原文:\n[在此粘贴原文]',
        tags: ['创意', '文案', '优化'],
        difficulty: '专业'
      },
      {
        title: '简历润色',
        description: '优化个人简历提升求职竞争力',
        content: '请帮我润色以下简历内容，要求:\n1. 专业度提升\n- 行业术语更准确\n- 成就描述更量化\n- 专业技能更突出\n- 职责描述更精准\n\n2. 成就展示优化\n- 结果导向更明确\n- 数据支持更有力\n- 成果呈现更突出\n- 贡献价值更清晰\n\n3. 表达方式改进\n- 动词选择更有力\n- 句式更简洁高效\n- 重复内容更精简\n- 逻辑结构更清晰\n\n4. 针对性增强\n- 与目标职位更匹配\n- 与职位要求更呼应\n- 差异化优势更突出\n- 核心竞争力更凸显\n\n原文:\n[在此粘贴原文]',
        tags: ['简历', '求职', '润色'],
        difficulty: '进阶'
      },
      {
        title: '品牌文案标准化',
        description: '统一优化品牌文案风格和表达',
        content: '请帮我将以下文案按照品牌标准进行优化，要求:\n1. 品牌语调统一\n- 语气风格一致\n- 价值观表达统一\n- 人格特质体现\n- 情感基调协调\n\n2. 专业术语规范\n- 产品名称标准化\n- 技术术语统一\n- 行业用语规范\n- 品牌词汇一致\n\n3. 表达方式标准化\n- 句式结构规范\n- 修辞手法统一\n- 标点使用规范\n- 格式布局一致\n\n4. 品牌形象强化\n- 核心价值突出\n- 品牌主张清晰\n- 差异化特点凸显\n- 品牌联想强化\n\n原文:\n[在此粘贴原文]',
        tags: ['品牌', '标准化', '文案'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: 'AI提示工程',
    description: '包含AI提示词优化、角色设定、思维链等提示工程相关提示词',
    icon: 'ai',
    prompts: [
      {
        title: '角色扮演提示',
        description: '生成特定专家角色的提示词',
        content: '我希望你扮演[领域]专家的角色。请以这个角色为我提供专业的指导和建议。\n\n你的背景：\n- 拥有[领域]多年研究和实践经验\n- 精通[领域]的核心理论和前沿发展\n- 曾解决过许多复杂的[领域]问题\n- 能够简明清晰地解释复杂概念\n\n你的回答应该：\n1. 保持专业性和准确性\n2. 提供有深度的分析和见解\n3. 根据当前最佳实践给出建议\n4. 在必要时引用相关理论或研究\n5. 考虑实际应用场景和限制条件\n\n我的第一个问题是：[问题]',
        tags: ['角色', '专家', '提示词'],
        difficulty: '入门'
      },
      {
        title: '思维链提示',
        description: '引导AI逐步思考解决问题',
        content: '请一步一步思考以下问题并给出详细的推理过程：[问题]\n\n请按照以下步骤进行思考：\n\n1. 首先，明确理解问题，确定我们需要解决什么\n2. 分析问题中的已知条件和限制\n3. 考虑解决此类问题的可能方法和策略\n4. 选择最适合的方法，并解释选择理由\n5. 应用选定的方法，逐步推导解决方案\n6. 验证解决方案的正确性\n7. 总结关键思路和结论\n\n在思考过程中，请确保：\n- 每一步推理都有清晰的逻辑\n- 考虑多种可能的情况\n- 使用准确的概念和术语\n- 在合适的地方使用公式或图表辅助说明\n- 指出可能的误区或陷阱',
        tags: ['思维链', '推理', '解决问题'],
        difficulty: '进阶'
      },
      {
        title: '提示词优化器',
        description: '改进现有提示词以获得更好结果',
        content: '请帮我优化以下提示词，使其能够从DeepSeek模型获得更好的回复效果：\n\n原始提示词：\n[原始提示词]\n\n请从以下几个方面优化提示词：\n\n1. 明确性和精确性\n- 清晰表述预期输出格式和内容\n- 消除模糊不清的表达\n- 使用精确的术语和概念\n\n2. 结构和组织\n- 优化指令的顺序和逻辑\n- 添加分步骤引导\n- 设计更合理的输出结构\n\n3. 深度和广度\n- 增加思考维度\n- 加入相关背景知识\n- 鼓励多角度分析\n\n4. 约束和指导\n- 添加适当限制条件\n- 设定明确的质量标准\n- 提供参考示例或模板\n\n5. 交互设计\n- 优化问答流程\n- 设计更好的提问策略\n- 增加反馈与迭代环节\n\n请提供优化后的完整提示词，并解释你做出的主要改进及其理由。',
        tags: ['优化', '提示词', '效果'],
        difficulty: '专业'
      },
      {
        title: '创建提示词模板',
        description: '为特定任务设计可复用的提示词模板',
        content: '请为[任务类型]创建一个通用且高效的提示词模板。这个模板应该：\n\n1. 模板结构\n- 清晰定义任务目标和范围\n- 设计具有逻辑顺序的指令部分\n- 包含必要的输入变量占位符\n- 提供输出格式和示例\n\n2. 核心元素\n- 角色设定（如适用）\n- 背景信息要求\n- 执行步骤指导\n- 质量标准和限制条件\n- 可选参数和调整选项\n\n3. 提示工程技巧\n- 运用思维链或分步思考\n- 设置合理的约束条件\n- 使用明确和精确的语言\n- 加入示例（少样本学习）\n- 预防常见错误和偏差\n\n4. 适应性和可扩展性\n- 设计可调整的难度级别\n- 添加可选指令块\n- 考虑不同使用场景的变体\n- 提供优化建议\n\n请提供完整的模板，并解释其设计原理和最佳使用方法。',
        tags: ['模板', '通用', '设计'],
        difficulty: '专业'
      },
      {
        title: 'AI反馈优化循环',
        description: '设计AI迭代改进流程',
        content: '请帮我为以下任务设计一个基于反馈的AI优化循环：[任务描述]\n\n请按照以下框架设计：\n\n1. 初始提示设计\n- 基础任务描述\n- 预期输出定义\n- 初始约束条件\n- 质量标准设定\n\n2. 输出评估机制\n- 关键评估维度\n- 评分标准\n- 常见问题识别\n- 评估反馈格式\n\n3. 反馈整合策略\n- 反馈分类方法\n- 优先级确定\n- 冲突处理\n- 改进指令格式\n\n4. 迭代优化流程\n- 迭代周期设计\n- 提示词进化规则\n- 性能跟踪方法\n- 终止条件\n\n5. 持续学习机制\n- 成功案例记录\n- 模式识别\n- 知识累积策略\n- 跨任务迁移方法\n\n请提供完整的优化循环设计，并附上一个简单的使用示例。',
        tags: ['反馈', '迭代', '优化'],
        difficulty: '专业'
      },
      {
        title: '多代理协作系统',
        description: '设计多个AI角色协作解决问题',
        content: '请帮我设计一个多代理协作系统，用于解决以下问题：[问题描述]\n\n请设计以下内容：\n\n1. 代理角色设计\n- 需要哪些专业角色\n- 每个角色的专业背景\n- 角色之间的关系结构\n- 沟通协议设计\n\n2. 工作流程设计\n- 问题分解策略\n- 任务分配机制\n- 协作流程步骤\n- 冲突解决机制\n- 决策汇总方法\n\n3. 系统管理\n- 协调者角色定义\n- 进度监控方式\n- 质量控制机制\n- 系统调整策略\n\n4. 提示词模板\n- 每个角色的基础提示\n- 角色间交互提示\n- 信息传递格式\n- 结果整合提示\n\n5. 使用指南\n- 系统启动方法\n- 用户交互方式\n- 结果解读指南\n- 系统调优建议\n\n请提供完整的系统设计，并解释如何有效地使用这个多代理系统。',
        tags: ['多代理', '协作', '系统'],
        difficulty: '专业'
      },
      {
        title: 'AI角色定义模板',
        description: '设计专业AI角色及其人格特征',
        content: '请帮我设计一个AI角色定义模板，角色领域是[领域]。需要包含：\n\n1. 角色基础属性\n- 专业背景和履历\n- 知识领域范围\n- 价值观和行事原则\n- 沟通风格和语气\n- 人格特质和偏好\n\n2. 专业能力框架\n- 核心专业技能\n- 跨领域知识储备\n- 方法论和思维模式\n- 专业术语库\n- 案例和经验储备\n\n3. 交互行为模式\n- 问题理解机制\n- 分析思考模式\n- 答案生成策略\n- 困难处理方法\n- 知识边界认知\n\n4. 输出规范\n- 表达风格指南\n- 结构化回答模板\n- 专业度控制机制\n- 定制化程度设置\n\n5. 角色限制和边界\n- 知识范围限制\n- 价值观边界\n- 行为约束条件\n- 角色偏差控制\n\n请提供完整的角色定义，并给出一段该角色的示范回答。',
        tags: ['角色', '定义', '设计'],
        difficulty: '专业'
      },
      {
        title: '语言风格转换器',
        description: '将文本转换为特定风格或语调',
        content: '请将以下文本转换为[目标风格]风格。原文：\n\n[原始文本]\n\n在转换过程中，请考虑以下方面：\n\n1. 词汇选择调整\n- 选择符合目标风格的词汇\n- 替换不符合风格的表达方式\n- 保留必要的专业术语\n- 添加风格特征词汇\n\n2. 句式结构转换\n- 调整句子长度和复杂度\n- 重组段落结构和层次\n- 应用适合的修辞手法\n- 保持逻辑连贯性\n\n3. 语气和调性变换\n- 转换情感基调\n- 调整正式程度\n- 匹配目标风格的语气\n- 保持内容的专业性\n\n4. 风格特征强化\n- 增加典型语言特征\n- 应用风格专属表达\n- 调整幽默或严肃程度\n- 融入特定文化元素\n\n请在转换的同时保持原文的核心信息和意图不变。',
        tags: ['风格', '转换', '语言'],
        difficulty: '进阶'
      },
      {
        title: '少样本学习模板',
        description: '通过示例引导AI学习特定模式',
        content: '我想让你学习以下几个示例，然后生成类似的[内容类型]。\n\n示例1：\n[示例1内容]\n\n示例2：\n[示例2内容]\n\n示例3：\n[示例3内容]\n\n请分析这些示例中的以下元素：\n\n1. 内容结构模式\n- 整体组织框架\n- 段落布局方式\n- 起承转合结构\n- 重复出现的部分\n\n2. 语言特征分析\n- 语调和语气特点\n- 句式和词汇选择\n- 修辞手法运用\n- 专业术语使用\n\n3. 隐含规则提取\n- 表达限制和禁忌\n- 内容深度要求\n- 适用场景界定\n- 特定格式要求\n\n请在理解这些模式后，为我生成一个新的[内容类型]，主题是[主题]，并确保它遵循相同的模式和风格。',
        tags: ['学习', '示例', '模式'],
        difficulty: '进阶'
      }
    ]
  },
  {
    name: '学术研究',
    description: '包含论文写作、研究方法、学术讨论等学术研究相关提示词',
    icon: 'research',
    prompts: [
      {
        title: '研究方法设计',
        description: '生成科学研究方法论设计',
        content: '请帮我设计研究方法，研究主题是[研究主题]。需要包含：\n\n1. 研究类型选择\n- 适合的研究类型分析\n- 各类型优缺点比较\n- 混合方法可能性\n- 理论基础分析\n\n2. 研究设计框架\n- 研究问题明确化\n- 变量定义与关系\n- 假设构建方法\n- 研究范围界定\n\n3. 数据收集方法\n- 抽样策略设计\n- 数据源选择\n- 收集工具选择\n- 测量指标设计\n\n4. 数据分析方法\n- 定量分析技术\n- 定性分析方法\n- 数据处理流程\n- 统计方法选择\n\n5. 质量控制措施\n- 效度保障措施\n- 信度保障策略\n- 偏差控制方法\n- 伦理考量因素\n\n请提供全面的研究方法设计，并说明每个选择背后的理由。',
        tags: ['研究', '方法', '学术'],
        difficulty: '专业'
      },
      {
        title: '文献综述撰写',
        description: '生成学术文献综述框架',
        content: '请帮我撰写关于[研究主题]的文献综述框架。需要包含：\n\n1. 综述范围界定\n- 研究问题明确化\n- 包含文献类型\n- 时间跨度确定\n- 学科边界划分\n\n2. 文献检索策略\n- 关键词确定方法\n- 数据库选择建议\n- 筛选标准制定\n- 文献质量评估\n\n3. 文献组织框架\n- 主题式组织方案\n- 时间演进式结构\n- 方法学分类框架\n- 争议与共识分类\n\n4. 理论分析视角\n- 主要理论流派\n- 概念框架比较\n- 理论演进脉络\n- 现有理论缺口\n\n5. 研究趋势分析\n- 研究热点识别\n- 方法论演变\n- 未来发展方向\n- 研究缺口总结\n\n请在框架中包含适当的引用规范和示例段落，以展示如何构建高质量的学术文献综述。',
        tags: ['文献', '综述', '学术'],
        difficulty: '专业'
      },
      {
        title: '学术论文修改',
        description: '优化学术论文结构与内容',
        content: '请帮我修改以下学术论文摘要，并提供改进建议。原文：\n\n[论文摘要]\n\n请从以下方面进行修改和建议：\n\n1. 结构完整性\n- 研究背景充分性\n- 研究目的明确度\n- 方法描述适当性\n- 结果表述清晰度\n- 结论相关性评估\n\n2. 学术语言规范\n- 术语使用准确性\n- 句式专业性调整\n- 表述客观性增强\n- 时态使用一致性\n- 逻辑连接改进\n\n3. 内容深度提升\n- 理论基础加强点\n- 创新性突出方式\n- 研究局限性说明\n- 研究意义强调\n- 与现有文献关联\n\n4. 格式与规范性\n- 引用格式检查\n- 学术写作规范\n- 摘要篇幅控制\n- 关键词适当性\n\n请提供修改后的摘要，并附上详细的修改说明和提升建议。',
        tags: ['论文', '修改', '学术'],
        difficulty: '专业'
      },
      {
        title: '学术辩论准备',
        description: '准备学术辩论论点与反驳',
        content: '请帮我准备关于[辩题]的学术辩论材料。需要包含：\n\n1. 正方论点构建\n- 核心主张陈述\n- 理论支持证据\n- 实证研究支持\n- 案例论证分析\n- 价值判断依据\n\n2. 反方论点预测\n- 可能的反对观点\n- 潜在批评角度\n- 对方理论依据\n- 证据质疑点预测\n\n3. 反驳策略设计\n- 证据有效性辩护\n- 逻辑漏洞应对\n- 价值冲突协调\n- 替代方案比较\n- 折中立场考量\n\n4. 关键概念澄清\n- 核心术语定义\n- 概念边界界定\n- 误解澄清准备\n- 定义争议预案\n\n5. 辩论技巧建议\n- 开场陈述要点\n- 证据引用策略\n- 问答环节准备\n- 总结陈词框架\n\n请提供全面的辩论准备材料，包括双方立场的关键论点和相应的反驳策略。',
        tags: ['辩论', '学术', '批判'],
        difficulty: '专业'
      },
      {
        title: '研究假设生成',
        description: '为研究课题生成科学假设',
        content: '请帮我为[研究主题]生成研究假设。需要包含：\n\n1. 假设理论基础\n- 相关理论梳理\n- 概念框架建立\n- 变量关系推导\n- 理论缺口识别\n\n2. 主要研究假设\n- 自变量与因变量关系\n- 调节变量效应\n- 中介作用机制\n- 边界条件界定\n\n3. 假设证伪可能性\n- 假设检验方法\n- 效应量预估\n- 统计显著性考量\n- 对立假设分析\n\n4. 创新与贡献点\n- 假设创新性分析\n- 理论贡献预期\n- 方法论贡献\n- 实践意义预测\n\n5. 研究局限性\n- 方法论局限\n- 外部效度考量\n- 伦理问题预判\n- 可行性分析\n\n请提供合理的研究假设，并详细说明其理论基础和验证方法。',
        tags: ['假设', '研究', '理论'],
        difficulty: '专业'
      },
      {
        title: '研究资金申请',
        description: '生成研究资金申请书框架',
        content: '请帮我制定[研究项目名称]的研究资金申请框架。需要包含：\n\n1. 项目概述\n- 研究背景简述\n- 研究目标明确化\n- 创新点突出\n- 预期贡献概述\n\n2. 文献基础与理论框架\n- 现有研究综述\n- 研究缺口识别\n- 理论框架构建\n- 研究问题定位\n\n3. 研究设计与方法\n- 研究类型选择\n- 数据收集计划\n- 分析方法详述\n- 质量控制措施\n\n4. 预期成果与影响\n- 学术贡献预期\n- 实践价值预测\n- 社会影响评估\n- 知识传播计划\n\n5. 资源需求与规划\n- 人员配置方案\n- 设备与材料需求\n- 时间进度规划\n- 预算详细分配\n- 风险管理策略\n\n请提供结构完整的资金申请框架，并突出项目的创新性、可行性和重要性。',
        tags: ['申请', '资金', '项目'],
        difficulty: '专业'
      }
    ]
  },
  {
    name: '办公助手',
    description: '包含日常办公、文档写作、会议管理等办公相关提示词',
    icon: 'office',
    prompts: [
      {
        title: '工作周报',
        description: '生成工作周报模板',
        content: '请帮我生成工作周报，部门是[部门名称]。需要包含：\n1. 本周工作总结\n- 重点工作进展\n- 常规工作完成情况\n- 工作成果和亮点\n- 存在的问题和困难\n\n2. 数据分析\n- 关键指标完成情况\n- 同比/环比分析\n- 偏差原因分析\n- 改进措施\n\n3. 重要事项沟通\n- 跨部门协作事项\n- 重要会议纪要\n- 重大决策事项\n- 风险预警信息\n\n4. 下周工作计划\n- 重点工作安排\n- 时间节点\n- 配合需求\n- 预期目标\n\n5. 建议与反馈\n- 工作建议\n- 资源需求\n- 流程优化建议\n- 其他反馈',
        tags: ['周报', '总结', '办公'],
        difficulty: '基础'
      },
      {
        title: '会议纪要',
        description: '生成会议纪要模板',
        content: '请帮我记录会议纪要，会议主题是[主题]。需要包含：\n1. 会议基本信息\n- 会议时间\n- 会议地点\n- 参会人员\n- 会议议程\n\n2. 会议内容记录\n- 议题讨论要点\n- 各方观点建议\n- 决策事项\n- 遗留问题\n\n3. 工作任务分配\n- 具体工作内容\n- 负责人\n- 完成时限\n- 考核标准\n\n4. 注意事项\n- 重要提醒\n- 风险提示\n- 配合要求\n- 保密要求\n\n5. 后续跟进\n- 跟进清单\n- 时间节点\n- 汇报要求\n- 下次会议安排',
        tags: ['会议', '纪要', '办公'],
        difficulty: '基础'
      },
      {
        title: '工作计划',
        description: '生成工作计划模板',
        content: '请帮我制定工作计划，时间周期是[周期]。需要包含：\n1. 目标设定\n- 总体目标\n- 具体指标\n- 考核标准\n- 预期成果\n\n2. 工作规划\n- 重点工作\n- 常规工作\n- 创新项目\n- 优先级排序\n\n3. 资源配置\n- 人员安排\n- 预算规划\n- 设备需求\n- 外部支持\n\n4. 时间安排\n- 时间节点\n- 里程碑\n- 关键路径\n- 缓冲时间\n\n5. 保障措施\n- 组织保障\n- 制度保障\n- 监督机制\n- 应急预案',
        tags: ['计划', '规划', '办公'],
        difficulty: '基础'
      },
      {
        title: '工作汇报',
        description: '生成工作汇报模板',
        content: '请帮我准备工作汇报，汇报主题是[主题]。需要包含：\n1. 工作总览\n- 整体进展\n- 主要成果\n- 存在问题\n- 解决方案\n\n2. 重点工作详述\n- 工作内容\n- 推进过程\n- 取得成效\n- 经验总结\n\n3. 数据分析\n- 核心指标\n- 达成情况\n- 差异分析\n- 改进措施\n\n4. 问题与建议\n- 面临挑战\n- 解决思路\n- 资源需求\n- 改进建议\n\n5. 下阶段计划\n- 工作重点\n- 具体安排\n- 预期目标\n- 支持需求',
        tags: ['汇报', '总结', '办公'],
        difficulty: '基础'
      },
      {
        title: '邮件写作',
        description: '生成商务邮件模板',
        content: '请帮我写一封商务邮件，邮件主题是[主题]。需要包含：\n1. 邮件格式\n- 称谓问候\n- 正文结构\n- 结束语\n- 签名落款\n\n2. 内容要点\n- 背景说明\n- 主要诉求\n- 具体内容\n- 期望回复\n\n3. 语言风格\n- 正式得体\n- 清晰简洁\n- 逻辑清晰\n- 重点突出\n\n4. 附件说明\n- 附件清单\n- 文件说明\n- 注意事项\n- 查阅建议\n\n5. 礼仪规范\n- 发送时间\n- 抄送对象\n- 紧急程度\n- 保密要求',
        tags: ['邮件', '写作', '办公'],
        difficulty: '基础'
      },
      {
        title: '述职报告',
        description: '生成述职报告模板',
        content: '请帮我写一份述职报告，述职周期是[周期]。需要包含：\n1. 工作职责履行\n- 岗位职责\n- 目标完成情况\n- 重点工作成果\n- 创新突破\n\n2. 能力提升\n- 专业能力\n- 管理能力\n- 团队协作\n- 问题解决\n\n3. 工作业绩\n- 量化指标\n- 质化成果\n- 荣誉表彰\n- 突出贡献\n\n4. 问题与不足\n- 工作短板\n- 能力欠缺\n- 改进计划\n- 提升方向\n\n5. 工作计划\n- 目标设定\n- 重点任务\n- 创新思路\n- 提升规划',
        tags: ['述职', '总结', '办公'],
        difficulty: '基础'
      },
      {
        title: '工作交接',
        description: '生成工作交接文档',
        content: '请帮我准备工作交接文档，岗位是[岗位名称]。需要包含：\n1. 工作概况\n- 岗位职责\n- 工作内容\n- 工作流程\n- 注意事项\n\n2. 项目交接\n- 进行中项目\n- 完成情况\n- 遗留问题\n- 后续安排\n\n3. 文档资料\n- 文件清单\n- 账号密码\n- 重要联系人\n- 使用说明\n\n4. 重点提醒\n- 工作要点\n- 常见问题\n- 处理方法\n- 注意事项\n\n5. 其他事项\n- 定期工作\n- 临时任务\n- 特殊情况\n- 建议事项',
        tags: ['交接', '文档', '办公'],
        difficulty: '基础'
      },
      {
        title: '项目管理文档',
        description: '生成项目管理文档模板',
        content: '请帮我创建项目管理文档，项目名称是[项目名称]。需要包含：\n1. 项目概述\n- 项目背景\n- 项目目标\n- 关键干系人\n- 预期成果\n\n2. 项目规划\n- 工作分解结构(WBS)\n- 时间里程碑\n- 资源分配\n- 成本预算\n\n3. 风险管理\n- 风险识别\n- 风险评估\n- 应对策略\n- 监控方案\n\n4. 质量管理\n- 质量标准\n- 质量保证措施\n- 验收标准\n- 质量控制点\n\n5. 沟通管理\n- 沟通计划\n- 汇报机制\n- 会议安排\n- 文档管理\n\n6. 项目变更与收尾\n- 变更管理流程\n- 成果移交计划\n- 经验教训总结\n- 项目评估标准',
        tags: ['项目', '管理', '文档'],
        difficulty: '进阶'
      },
      {
        title: '商业提案',
        description: '生成专业商业提案模板',
        content: '请帮我创建商业提案，提案主题是[主题]。需要包含：\n1. 执行摘要\n- 核心价值主张\n- 解决方案概述\n- 预期成果\n- 合作要点\n\n2. 背景分析\n- 市场环境\n- 客户痛点\n- 需求分析\n- 机会识别\n\n3. 解决方案\n- 方案框架\n- 核心服务/产品\n- 实施路径\n- 创新亮点\n\n4. 价值论证\n- 量化收益\n- 竞争优势\n- 案例支撑\n- ROI分析\n\n5. 实施计划\n- 时间节点\n- 团队配置\n- 资源投入\n- 配合需求\n\n6. 合作方案\n- 定价模式\n- 付款方式\n- 服务保障\n- 后续支持\n\n7. 附录\n- 公司/团队介绍\n- 相关案例\n- 资质证明\n- 支持材料',
        tags: ['提案', '商务', '营销'],
        difficulty: '进阶'
      },
      {
        title: '绩效评估报告',
        description: '生成员工绩效评估报告',
        content: '请帮我创建绩效评估报告，评估对象是[职位/部门/团队]。需要包含：\n1. 评估概述\n- 评估目的\n- 评估周期\n- 评估方法\n- 评估维度\n\n2. 业绩表现\n- KPI完成情况\n- 工作质量评估\n- 工作效率分析\n- 创新成果\n\n3. 能力评估\n- 专业技能\n- 团队协作\n- 沟通能力\n- 解决问题能力\n\n4. 态度评价\n- 责任心\n- 主动性\n- 学习意愿\n- 企业文化契合度\n\n5. 综合评定\n- 优势分析\n- 不足之处\n- 综合评级\n- 评语总结\n\n6. 发展建议\n- 能力提升方向\n- 培训需求\n- 职业发展路径\n- 绩效改进计划',
        tags: ['绩效', '评估', '人事'],
        difficulty: '进阶'
      },
      {
        title: '团队建设方案',
        description: '生成团队建设与凝聚力提升方案',
        content: '请帮我制定团队建设方案，团队类型是[团队类型]。需要包含：\n1. 团队现状分析\n- 团队结构\n- 优势与不足\n- 团队氛围\n- 核心挑战\n\n2. 团队目标设定\n- 业务目标\n- 能力目标\n- 文化目标\n- 发展目标\n\n3. 团队建设内容\n- 团队角色定位\n- 工作流程优化\n- 沟通机制建立\n- 激励机制设计\n\n4. 团队活动规划\n- 团建活动设计\n- 技能培训计划\n- 文化融合活动\n- 团队仪式感建设\n\n5. 冲突管理与解决\n- 冲突识别机制\n- 问题解决流程\n- 情绪管理方法\n- 意见反馈渠道\n\n6. 效果评估\n- 团队氛围指标\n- 协作效率指标\n- 满意度调查\n- 改进机制',
        tags: ['团队', '建设', '管理'],
        difficulty: '进阶'
      }
    ]
  }
])

// 复制提示词功能
const copyPrompt = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage({
      message: '提示词已复制',
      type: 'success',
      duration: 2000
    })
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage({
      message: '复制失败，请手动复制',
      type: 'error',
      duration: 2000
    })
  }
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 获取分类数量
const getCategoryCount = (categoryName: string) => {
  const category = promptCategories.value.find(cat => cat.name === categoryName)
  return category ? category.prompts.length : 0
}

// 计算搜索结果总数
const totalSearchResults = computed(() => {
  return filteredCategories.value.reduce((total, category) => {
    return total + filterPrompts(category.prompts).length
  }, 0)
})

// 展开/收起状态管理
const expandedPrompts = ref<{ [key: string]: boolean }>({})

// 切换提示词展开状态
const togglePrompt = (promptTitle: string) => {
  expandedPrompts.value[promptTitle] = !expandedPrompts.value[promptTitle]
}

// SEO基础标签
const updateSEOTags = () => {
  // 标题
  document.title = `DeepSeek提示词指南 - AI提示词优化与应用场景`

  // 描述
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', 'DeepSeek提示词指南为您提供专业的AI提示词优化建议和常用场景示例，帮助您更好地使用DeepSeek模型，提高AI对话效果。')

  // 关键词
  let metaKeywords = document.querySelector('meta[name="keywords"]')
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta')
    metaKeywords.setAttribute('name', 'keywords')
    document.head.appendChild(metaKeywords)
  }
  metaKeywords.setAttribute('content', 'DeepSeek提示词,AI提示词,Prompt优化,DeepSeek教程,AI对话指南')
}

onMounted(() => {
  try {
    // 初始化SEO标签
    updateSEOTags()
  } catch (error) {
    console.error('SEO标签设置失败:', error)
  }
})
</script>

<style scoped>
.deepseek-prompt-container {
  padding: 1.25rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.prompt-content {
  height: 15rem;
  overflow-y: auto;
  padding: 1rem;
}

/* 标签响应式布局 */
.flex.items-center.gap-2.mb-3 {
  flex-wrap: wrap;
  gap: 0.375rem !important;
}

.flex.items-center.gap-2.mb-3 span {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
}

/* 添加响应式样式 */
@media (max-width: 768px) {
  .deepseek-prompt-container {
    padding: 0.625rem;
  }

  .prompt-content {
    height: 12.5rem;
  }
}

/* 移除原有的阴影和背景相关样式 */
.prompt-item {
  transition: all 0.3s ease;
  border-width: 0.0625rem;
}

.prompt-item:hover {
  border-color: rgb(59, 130, 246);
  transform: none;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 0.375rem;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 0.1875rem;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 搜索框聚焦动画 */
input:focus {
  transform: translateY(-0.0625rem);
}

/* 提示词卡片样式优化 */
.prompt-item {
  box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.05);
}
</style>
