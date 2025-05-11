<!--
 * @file AIPromptEditor.vue
 * @description AIGC 提示词可视化编辑器组件，用于生成和编辑 AI 绘图提示词
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-2-14
 *
 * 功能特性：
 * 1. 提示词可视化编辑
 * 2. 提示词模板库
 * 3. 提示词历史记录
 * 4. 提示词导出分享
 * 5. 多语言翻译支持
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <!-- 页面标题 -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-4 px-8 py-4">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">免费在线AIGC 提示词编辑器</h1>
              <p class="text-sm text-gray-500 mb-2">专业的 AI 绘图提示词编辑工具，支持可视化编辑和智能优化</p>
              <div class="flex items-center justify-center space-x-4 mb-2">
                <a href="https://www.uied.cn/collection/midjourney-study" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600">Midjourney教程</a>
                <span class="text-gray-300">|</span>
                <a href="https://nf.video/czybtp/?gid=26" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600">Midjourney</a>
                <span class="text-gray-300">|</span>
                <a href="https://www.uied.cn/circle/midjourney" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600">Midjourney学习圈子</a>
                <span class="text-gray-300">|</span>
                <a href="https://www.uied.cn/collection/stablediffusion-study" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600">Stable Diffusion教程</a>
                <span class="text-gray-300">|</span>
                <a href="https://www.uied.cn/wechat" target="_blank"
                  class="text-sm text-blue-500 hover:text-blue-600">AIGC交流群</a>
              </div>
              <div class="mt-2">
                <span class="inline-block px-3 py-1 text-xs text-red-500 bg-red-50 rounded-full mb-2">免费使用</span>
                <!-- 将模型选择移到这里 -->
                <div class="mt-3 flex justify-center">
                  <div class="inline-flex p-1 bg-gray-100 rounded-lg">
                    <button v-for="model in ['midjourney', 'stable_diffusion']" :key="model"
                      @click="handleModelChange(model)" :class="[
                        'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                        currentModel === model
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      ]">
                      {{ model === 'midjourney' ? 'Midjourney' : 'Stable Diffusion' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑器主体 -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- 左侧编辑区域 - 3列 -->
          <div class="lg:col-span-3 space-y-6">
            <!-- 提示词分类选择 -->
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">提示词编辑</h3>
              </div>

              <!-- 标签系统 -->
              <div class="flex flex-wrap gap-2 mb-4 min-h-[120px] p-4 bg-gray-50 rounded-lg border border-gray-200">
                <template v-for="(tag, index) in activeTags" :key="index">
                  <div :class="[
                    'flex items-center px-2 py-1 rounded-md transition-colors cursor-pointer hover:shadow-sm',
                    getTagColorClass(tag.type)
                  ]">
                    <span class="text-sm">{{ tag.text }}</span>
                    <span v-if="tag.weight && tag.weight !== 1" class="text-xs ml-1 opacity-75">({{ tag.weight
                      }})</span>
                    <button @click="removeTag(index)"
                      class="ml-1.5 p-0.5 rounded-full hover:bg-gray-200 focus:outline-none">
                      <i class="el-icon-close text-xs"></i>
                    </button>
                  </div>
                </template>
                <div v-if="activeTags.length === 0" class="text-gray-400 text-sm">
                  从下方选择标签或直接输入提示词
                </div>
              </div>

              <!-- 提示词编辑器 -->
              <div class="space-y-4">
                <!-- 主要提示词 -->
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-medium text-gray-700">主要提示词</label>
                    <div class="flex items-center space-x-2">
                      <el-button size="small" @click="translateToEnglish" :loading="translating">
                        <i class="el-icon-position mr-1"></i>翻译为英文
                      </el-button>
                      <el-button size="small" @click="translateToChinese" :loading="translating">
                        <i class="el-icon-position mr-1"></i>翻译为中文
                      </el-button>
                    </div>
                  </div>
                  <el-input v-model="prompt.main" type="textarea" :rows="4" placeholder="描述你想要创建的主要内容，可以直接输入或从下方选择标签"
                    :disabled="translating" />
                </div>

                <!-- 风格提示词 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">风格标签</label>
                  <el-tabs type="border-card" class="custom-tabs">
                    <el-tab-pane v-for="category in tagCategories" :key="category.id" :label="category.name">
                      <div class="flex flex-wrap gap-2">
                        <div v-for="tag in getTagsByCategory(category.id)" :key="tag.en" class="custom-tag"
                          :class="getTagColorClass(tag.type)" @click="addTag(tag.en, tag.type)">
                          <span class="text-sm">{{ tag.zh }}</span>
                          <span class="text-xs ml-1 opacity-75">({{ tag.en }})</span>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>

              <!-- 权重调整器 -->
              <div class="mt-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <h3 class="text-base font-semibold text-gray-900 mb-4">权重调整</h3>
                <div class="space-y-4">
                  <div v-for="(weight, index) in prompt.weights" :key="index"
                    class="flex items-center space-x-2 bg-white p-2 rounded-lg">
                    <el-input v-model="weight.keyword" placeholder="关键词" class="flex-1" />
                    <el-slider v-model="weight.value" :min="0" :max="2" :step="0.1" class="w-32 mx-4"
                      :format-tooltip="(val) => val.toFixed(1)" />
                    <span class="text-sm text-gray-500 w-12">{{ weight.value.toFixed(1) }}</span>
                    <button @click="removeWeight(index)" class="text-red-500 hover:text-red-600 focus:outline-none">
                      <i class="el-icon-delete"></i>
                    </button>
                  </div>
                  <button @click="addWeight" class="text-blue-500 hover:text-blue-600 text-sm focus:outline-none">
                    <i class="el-icon-plus mr-1"></i>添加权重
                  </button>
                </div>
              </div>
            </div>

            <!-- 添加历史记录部分 -->
            <!-- 删除 <div class="mt-6"> 历史记录相关代码 -->
          </div>

          <!-- 右侧预览区域 - 2列 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 预览结果 -->
            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900">提示词预览</h3>
              </div>

              <!-- 提示词预览 -->
              <div class="preview-content bg-gray-50 p-4 rounded-lg mb-4">
                <div class="mb-2 flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-600">生成的提示词:</span>
                  <el-button type="primary" size="small" @click="copyToClipboard">
                    <i class="el-icon-document-copy mr-1"></i>复制提示词
                  </el-button>
                </div>
                <pre
                  class="whitespace-pre-wrap text-sm font-mono bg-white p-4 rounded border border-gray-200 shadow-sm">{{
                    generatedPrompt }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能说明 -->
    <div class="bg-white border border-gray-200 rounded-lg p-8 mt-8">
      <div class="mb-6 flex items-center space-x-2">
        <div class="w-1 h-6 bg-blue-500 rounded-full"></div>
        <div class="text-lg font-bold text-gray-800">使用说明</div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="feature in features" :key="feature.title"
          class="flex items-start gap-4 p-6 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
          <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0"
            v-html="feature.icon">
          </div>
          <div>
            <h4 class="text-base font-bold text-gray-900 mb-2">{{ feature.title }}</h4>
            <p class="text-sm text-gray-600 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具推荐 -->
    <div class="mt-4">
      <ToolsRecommend :currentPath="$route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import CryptoJS from 'crypto-js'

// 更新标签颜色映射
const getTagColorClass = (type?: string) => {
  const colorMap: Record<string, string> = {
    subject: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
    style: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200',
    quality: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
    negative: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200',
    artist: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200',
    lighting: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200',
    color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200',
    composition: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200',
    material: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200',
    time: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200',
    render: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200',
    photo: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200',
    trending: 'bg-lime-50 text-lime-700 hover:bg-lime-100 border border-lime-200',
    default: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
  }
  return type ? colorMap[type] || colorMap.default : colorMap.default
}

// 更新提示词分类选择内容
const promptCategories = [
  {
    id: 'subject',
    name: '主体内容',
    description: '描述要生成的主要内容和场景',
    color: 'blue'
  },
  {
    id: 'quality',
    name: '图像质量',
    description: '设置生成图像的质量和细节',
    color: 'green'
  },
  {
    id: 'style',
    name: '艺术风格',
    description: '设置图像的整体艺术风格',
    color: 'purple'
  },
  {
    id: 'lighting',
    name: '光照效果',
    description: '设置图像的光照和氛围',
    color: 'orange'
  },
  {
    id: 'camera',
    name: '相机视角',
    description: '设置拍摄角度和镜头效果',
    color: 'indigo'
  },
  {
    id: 'midjourney',
    name: 'Midjourney 标签',
    description: '添加 Midjourney 特有的标签',
    color: 'purple'
  }
]

// 添加获取类型名称的方法
const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    quality: '图像质量',
    style: '艺术风格',
    lighting: '光照效果',
    camera: '相机视角'
  }
  return typeMap[type] || type
}

// AI模型相关
const currentModel = ref('midjourney')

// 模型切换处理
const handleModelChange = (model: string) => {
  currentModel.value = model // 先更新模型
  activeTags.value = [] // 清空当前标签
  prompt.value.main = '' // 清空主提示词
  loadModelPrompts(model) // 加载对应模型的提示词
}

// 根据不同模型加载提示词
const loadModelPrompts = (model: string) => {
  if (model === 'midjourney') {
    stylePrompts.value = [
      ...mjStylePrompts,
      ...additionalMjTags,
      ...cameraPrompts,
      ...colorPrompts,
      ...compositionPrompts,
      ...renderPrompts,
      ...photoPrompts
    ]
  } else {
    stylePrompts.value = [
      ...sdStylePrompts,
      ...cameraPrompts,
      ...colorPrompts,
      ...compositionPrompts,
      ...renderPrompts,
      ...photoPrompts
    ]
  }
}

// Midjourney 风格标签
const mjStylePrompts = [
  // 艺术风格
  { en: 'digital art', zh: '数字艺术', type: 'style' },
  { en: 'concept art', zh: '概念艺术', type: 'style' },
  { en: 'illustration', zh: '插画风格', type: 'style' },
  { en: 'oil painting', zh: '油画风格', type: 'style' },
  { en: 'watercolor', zh: '水彩风格', type: 'style' },
  { en: 'ink painting', zh: '水墨画', type: 'style' },
  { en: 'pencil drawing', zh: '铅笔画', type: 'style' },
  { en: 'sketch', zh: '素描', type: 'style' },
  { en: 'line art', zh: '线条艺术', type: 'style' },
  { en: '3d render', zh: '3D渲染', type: 'style' },
  { en: 'realistic', zh: '写实风格', type: 'style' },
  { en: 'photorealistic', zh: '照片级写实', type: 'style' },
  { en: 'hyperrealistic', zh: '超写实', type: 'style' },
  { en: 'surrealism', zh: '超现实主义', type: 'style' },
  { en: 'minimalism', zh: '极简主义', type: 'style' },

  // 质量提升
  { en: 'best quality', zh: '最佳质量', type: 'quality' },
  { en: 'high quality', zh: '高质量', type: 'quality' },
  { en: 'masterpiece', zh: '杰作', type: 'quality' },
  { en: 'highly detailed', zh: '高细节', type: 'quality' },
  { en: 'ultra detailed', zh: '超细节', type: 'quality' },
  { en: '8k uhd', zh: '8K超高清', type: 'quality' },
  { en: 'hdr', zh: 'HDR', type: 'quality' },
  { en: 'studio quality', zh: '工作室品质', type: 'quality' },
  { en: 'professional', zh: '专业级', type: 'quality' },

  // 光照效果
  { en: 'cinematic lighting', zh: '电影级打光', type: 'lighting' },
  { en: 'volumetric lighting', zh: '体积光', type: 'lighting' },
  { en: 'rim light', zh: '边缘光', type: 'lighting' },
  { en: 'dramatic lighting', zh: '戏剧性光照', type: 'lighting' },
  { en: 'studio lighting', zh: '工作室灯光', type: 'lighting' },
  { en: 'soft lighting', zh: '柔和光照', type: 'lighting' },
  { en: 'natural lighting', zh: '自然光照', type: 'lighting' },
  { en: 'sunlight', zh: '阳光', type: 'lighting' },
  { en: 'moonlight', zh: '月光', type: 'lighting' },
  { en: 'backlight', zh: '背光', type: 'lighting' },
  { en: 'spotlight', zh: '聚光灯', type: 'lighting' },
  { en: 'ambient light', zh: '环境光', type: 'lighting' }
]

// Stable Diffusion 风格标签
const sdStylePrompts = [
  // 基础质量
  { en: 'masterpiece', zh: '杰作', type: 'quality' },
  { en: 'best quality', zh: '最佳质量', type: 'quality' },
  { en: 'high quality', zh: '高质量', type: 'quality' },
  { en: 'highly detailed', zh: '高细节', type: 'quality' },
  { en: 'ultra-detailed', zh: '超细节', type: 'quality' },
  { en: 'sharp focus', zh: '清晰对焦', type: 'quality' },
  { en: '8k uhd', zh: '8K超高清', type: 'quality' },
  { en: 'hdr', zh: 'HDR', type: 'quality' },
  { en: 'highres', zh: '高分辨率', type: 'quality' },

  // 艺术风格
  { en: 'digital art', zh: '数字艺术', type: 'style' },
  { en: 'concept art', zh: '概念艺术', type: 'style' },
  { en: 'illustration', zh: '插画', type: 'style' },
  { en: 'anime style', zh: '动漫风格', type: 'style' },
  { en: 'manga style', zh: '漫画风格', type: 'style' },
  { en: 'oil painting', zh: '油画', type: 'style' },
  { en: 'watercolor', zh: '水彩', type: 'style' },
  { en: 'pencil drawing', zh: '铅笔画', type: 'style' },
  { en: 'realistic', zh: '写实', type: 'style' },
  { en: 'photorealistic', zh: '照片级写实', type: 'style' },
  { en: 'hyperrealistic', zh: '超写实', type: 'style' },
  { en: 'octane render', zh: 'Octane渲染', type: 'style' },
  { en: 'unreal engine', zh: '虚幻引擎', type: 'style' },

  // 摄影风格
  { en: 'RAW photo', zh: 'RAW照片', type: 'photo' },
  { en: 'analog photo', zh: '模拟照片', type: 'photo' },
  { en: 'cinematic', zh: '电影感', type: 'photo' },
  { en: 'bokeh', zh: '背景虚化', type: 'photo' },
  { en: 'depth of field', zh: '景深', type: 'photo' },
  { en: 'film grain', zh: '胶片颗粒', type: 'photo' },
  { en: 'polaroid', zh: '宝丽来', type: 'photo' },
  { en: 'lomography', zh: 'LOMO', type: 'photo' },

  // 光照
  { en: 'studio lighting', zh: '工作室灯光', type: 'lighting' },
  { en: 'soft lighting', zh: '柔和光照', type: 'lighting' },
  { en: 'dramatic lighting', zh: '戏剧性光照', type: 'lighting' },
  { en: 'cinematic lighting', zh: '电影级打光', type: 'lighting' },
  { en: 'volumetric lighting', zh: '体积光', type: 'lighting' },
  { en: 'rim light', zh: '边缘光', type: 'lighting' },
  { en: 'natural lighting', zh: '自然光照', type: 'lighting' },
  { en: 'golden hour', zh: '黄金时段', type: 'lighting' },
  { en: 'blue hour', zh: '蓝调时分', type: 'lighting' },

  // 平台热门
  { en: 'artstation', zh: 'ArtStation', type: 'trending' },
  { en: 'trending on pixiv', zh: 'Pixiv热门', type: 'trending' },
  { en: 'award winning', zh: '获奖作品', type: 'trending' },
  { en: 'featured on cgsociety', zh: 'CGSociety精选', type: 'trending' }
]

const stylePrompts = ref(mjStylePrompts)

// 状态管理
const selectedCategory = ref('')
const showTranslation = ref(false)
const translating = ref(false)
const loading = ref(false)

// 提示词数据
const prompt = ref({
  main: '',
  style: '',
  quality: '',
  negative: '',
  weights: [] as { keyword: string; value: number }[]
})

// 标签相关
interface Tag {
  text: string
  weight?: number
  type?: string
}

const activeTags = ref<Tag[]>([])

const addTag = (text: string, type?: string, weight: number = 1) => {
  const tag: Tag = {
    text,
    type,
    weight
  }
  activeTags.value.push(tag)
  updatePrompt()
}

const removeTag = (index: number) => {
  activeTags.value.splice(index, 1)
  updatePrompt()
}

const updatePrompt = () => {
  prompt.value.main = activeTags.value
    .map(tag => tag.weight && tag.weight !== 1 ?
      `(${tag.text}:${tag.weight})` : tag.text)
    .join(', ')
}

// 添加权重相关方法
const addWeight = () => {
  if (prompt.value.weights.length < 5) { // 限制最多5个权重
    prompt.value.weights.push({ keyword: '', value: 1.0 })
  } else {
    ElMessage.warning('最多添加5个权重调整')
  }
}

const removeWeight = (index: number) => {
  prompt.value.weights.splice(index, 1)
}

// 计算属性
const generatedPrompt = computed(() => {
  let result = prompt.value.main || ''
  prompt.value.weights.forEach(w => {
    if (w.keyword && w.value !== 1) {
      result += ` (${w.keyword}:${w.value.toFixed(1)})`
    }
  })
  return result
})

const translatedPrompt = computed(() => {
  // 这里可以添加翻译逻辑
  return prompt.value.main || ''
})

// 保存为图片
const saveAsImage = async () => {
  loading.value = true
  try {
    const element = document.querySelector('.preview-content') as HTMLElement
    if (!element) {
      throw new Error('预览内容不存在')
    }
    const canvas = await html2canvas(element)
    const link = document.createElement('a')
    link.download = 'prompt.png'
    link.href = canvas.toDataURL()
    link.click()
    ElMessage.success('图片已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 翻译功能
const translateToEnglish = async () => {
  translating.value = true
  try {
    const query = prompt.value.main
    if (!query) {
      throw new Error('请输入要翻译的内容')
    }

    const res = await fetch(`https://api.pearktrue.cn/api/translate/?text=${encodeURIComponent(query)}&type=ZH_CN2EN`)
    const data = await res.json()

    if (data.code === 200 && data.data) {
      prompt.value.main = data.data.translate
      ElMessage.success('翻译完成')
    } else {
      throw new Error(data.msg || '翻译失败')
    }
  } catch (error: any) {
    ElMessage.error('翻译失败: ' + (error.message || '未知错误'))
  } finally {
    translating.value = false
  }
}

const translateToChinese = async () => {
  translating.value = true
  try {
    const query = prompt.value.main
    if (!query) {
      throw new Error('请输入要翻译的内容')
    }

    const res = await fetch(`https://api.pearktrue.cn/api/translate/?text=${encodeURIComponent(query)}&type=EN2ZH_CN`)
    const data = await res.json()

    if (data.code === 200 && data.data) {
      prompt.value.main = data.data.translate
      ElMessage.success('翻译完成')
    } else {
      throw new Error(data.msg || '翻译失败')
    }
  } catch (error: any) {
    ElMessage.error('翻译失败: ' + (error.message || '未知错误'))
  } finally {
    translating.value = false
  }
}

// 功能说明数据
const features = [
  {
    title: '双模型支持',
    desc: '支持 Midjourney 和 Stable Diffusion 两大主流 AI 绘画模型的提示词生成',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>'
  },
  {
    title: '可视化编辑',
    desc: '通过分类标签系统,轻松组合专业的提示词,支持权重精确调整',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"></path></svg>'
  },
  {
    title: '智能翻译',
    desc: '内置专业翻译引擎,支持中英文精准互译,告别机器翻译的尴尬',
    icon: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>'
  }
]

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    portrait: '人物肖像',
    landscape: '风景照片',
    concept: '概念艺术'
  }
  return labels[category] || category
}

// 添加标签分类定义
const tagCategories = [
  { id: 'style', name: '艺术风格' },
  { id: 'quality', name: '质量提升' },
  { id: 'lighting', name: '光照效果' },
  { id: 'camera', name: '相机视角' },
  { id: 'color', name: '色彩效果' },
  { id: 'composition', name: '构图布局' },
  { id: 'material', name: '材质效果' },
  { id: 'time', name: '时间氛围' },
  { id: 'render', name: '渲染引擎' },
  { id: 'photo', name: '摄影风格' }
]

// 根据分类获取标签
const getTagsByCategory = (category: string) => {
  return stylePrompts.value.filter(tag => tag.type === category)
}

// 添加更多标签
const additionalMjTags = [
  // 场景风格
  { en: 'cyberpunk', zh: '赛博朋克', type: 'style' },
  { en: 'steampunk', zh: '蒸汽朋克', type: 'style' },
  { en: 'fantasy', zh: '奇幻风格', type: 'style' },
  { en: 'sci-fi', zh: '科幻风格', type: 'style' },
  { en: 'gothic', zh: '哥特风格', type: 'style' },
  { en: 'baroque', zh: '巴洛克', type: 'style' },
  { en: 'art nouveau', zh: '新艺术风格', type: 'style' },
  { en: 'art deco', zh: '装饰艺术', type: 'style' },
  { en: 'retro', zh: '复古风格', type: 'style' },
  { en: 'vintage', zh: '古典风格', type: 'style' },
  { en: 'modern', zh: '现代风格', type: 'style' },
  { en: 'abstract', zh: '抽象风格', type: 'style' },
  { en: 'pop art', zh: '波普艺术', type: 'style' },
  { en: 'impressionism', zh: '印象派', type: 'style' },
  { en: 'expressionism', zh: '表现主义', type: 'style' },
  { en: 'minimalist', zh: '极简主义', type: 'style' },

  // 材质效果
  { en: 'glass', zh: '玻璃材质', type: 'material' },
  { en: 'metallic', zh: '金属材质', type: 'material' },
  { en: 'marble', zh: '大理石', type: 'material' },
  { en: 'wooden', zh: '木质', type: 'material' },
  { en: 'ceramic', zh: '陶瓷', type: 'material' },
  { en: 'fabric', zh: '织物', type: 'material' },
  { en: 'leather', zh: '皮革', type: 'material' },
  { en: 'crystal', zh: '水晶', type: 'material' },
  { en: 'paper', zh: '纸张', type: 'material' },
  { en: 'plastic', zh: '塑料', type: 'material' },
  { en: 'rubber', zh: '橡胶', type: 'material' },
  { en: 'concrete', zh: '混凝土', type: 'material' },
  { en: 'ice', zh: '冰晶', type: 'material' },
  { en: 'sand', zh: '沙质', type: 'material' },
  { en: 'water', zh: '水面', type: 'material' },
  { en: 'smoke', zh: '烟雾', type: 'material' },

  // 时间氛围
  { en: 'morning', zh: '清晨', type: 'time' },
  { en: 'sunset', zh: '日落', type: 'time' },
  { en: 'night', zh: '夜晚', type: 'time' },
  { en: 'dawn', zh: '黎明', type: 'time' },
  { en: 'dusk', zh: '黄昏', type: 'time' },
  { en: 'midnight', zh: '午夜', type: 'time' },
  { en: 'foggy', zh: '雾气', type: 'time' },
  { en: 'rainy', zh: '雨天', type: 'time' },
  { en: 'snowy', zh: '雪天', type: 'time' },
  { en: 'stormy', zh: '暴风雨', type: 'time' },
  { en: 'cloudy', zh: '多云', type: 'time' },
  { en: 'sunny', zh: '晴朗', type: 'time' },
  { en: 'spring', zh: '春季', type: 'time' },
  { en: 'summer', zh: '夏季', type: 'time' },
  { en: 'autumn', zh: '秋季', type: 'time' },
  { en: 'winter', zh: '冬季', type: 'time' }
]

// 补充相机视角标签
const cameraPrompts = [
  { en: 'close-up shot', zh: '特写镜头', type: 'camera' },
  { en: 'wide shot', zh: '广角镜头', type: 'camera' },
  { en: 'aerial view', zh: '俯视角度', type: 'camera' },
  { en: 'low angle', zh: '低角度', type: 'camera' },
  { en: 'dutch angle', zh: '倾斜角度', type: 'camera' },
  { en: 'telephoto', zh: '长焦镜头', type: 'camera' },
  { en: 'macro shot', zh: '微距拍摄', type: 'camera' },
  { en: 'front view', zh: '正面视角', type: 'camera' },
  { en: 'side view', zh: '侧面视角', type: 'camera' },
  { en: 'back view', zh: '背面视角', type: 'camera' },
  { en: 'birds eye view', zh: '鸟瞰视角', type: 'camera' },
  { en: 'worms eye view', zh: '蚯蚓视角', type: 'camera' }
]

// 补充色彩效果标签
const colorPrompts = [
  { en: 'vibrant colors', zh: '鲜艳色彩', type: 'color' },
  { en: 'pastel colors', zh: '柔和色调', type: 'color' },
  { en: 'monochromatic', zh: '单色调', type: 'color' },
  { en: 'high contrast', zh: '高对比度', type: 'color' },
  { en: 'muted colors', zh: '柔和色彩', type: 'color' },
  { en: 'warm colors', zh: '暖色调', type: 'color' },
  { en: 'cool colors', zh: '冷色调', type: 'color' },
  { en: 'complementary colors', zh: '互补色', type: 'color' },
  { en: 'analogous colors', zh: '邻近色', type: 'color' },
  { en: 'triadic colors', zh: '三色配色', type: 'color' },
  { en: 'sepia tone', zh: '褐色调', type: 'color' },
  { en: 'black and white', zh: '黑白', type: 'color' }
]

// 补充构图布局标签
const compositionPrompts = [
  { en: 'rule of thirds', zh: '三分法则', type: 'composition' },
  { en: 'symmetrical', zh: '对称构图', type: 'composition' },
  { en: 'centered composition', zh: '中心构图', type: 'composition' },
  { en: 'golden ratio', zh: '黄金比例', type: 'composition' },
  { en: 'dynamic composition', zh: '动态构图', type: 'composition' },
  { en: 'minimalist composition', zh: '极简构图', type: 'composition' },
  { en: 'diagonal composition', zh: '对角线构图', type: 'composition' },
  { en: 'frame within frame', zh: '框中框构图', type: 'composition' },
  { en: 'leading lines', zh: '引导线构图', type: 'composition' },
  { en: 'triangular composition', zh: '三角构图', type: 'composition' },
  { en: 'circular composition', zh: '圆形构图', type: 'composition' },
  { en: 'spiral composition', zh: '螺旋构图', type: 'composition' }
]

// 补充渲染引擎标签
const renderPrompts = [
  { en: 'octane render', zh: 'Octane渲染', type: 'render' },
  { en: 'cycles render', zh: 'Cycles渲染', type: 'render' },
  { en: 'vray render', zh: 'V-Ray渲染', type: 'render' },
  { en: 'arnold render', zh: 'Arnold渲染', type: 'render' },
  { en: 'redshift render', zh: 'Redshift渲染', type: 'render' },
  { en: 'eevee render', zh: 'Eevee渲染', type: 'render' },
  { en: 'real-time render', zh: '实时渲染', type: 'render' },
  { en: 'path tracing', zh: '路径追踪', type: 'render' }
]

// 补充摄影风格标签
const photoPrompts = [
  { en: 'professional photography', zh: '专业摄影', type: 'photo' },
  { en: 'portrait photography', zh: '人像摄影', type: 'photo' },
  { en: 'landscape photography', zh: '风景摄影', type: 'photo' },
  { en: 'street photography', zh: '街拍', type: 'photo' },
  { en: 'architectural photography', zh: '建筑摄影', type: 'photo' },
  { en: 'fashion photography', zh: '时尚摄影', type: 'photo' },
  { en: 'documentary photography', zh: '纪实摄影', type: 'photo' },
  { en: 'still life photography', zh: '静物摄影', type: 'photo' },
  { en: 'macro photography', zh: '微距摄影', type: 'photo' },
  { en: 'aerial photography', zh: '航拍', type: 'photo' }
]

// 添加复制到剪贴板的方法
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value)
    ElMessage.success('提示词已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 在组件挂载时加载数据
onMounted(() => {
  // 设置默认分类
  selectedCategory.value = 'subject'
})
</script>

<style scoped>
.custom-tag {
  @apply px-3 py-1.5 rounded-md cursor-pointer transition-all duration-200;
}

.preview-content {
  @apply bg-white p-6 rounded-lg shadow-sm;
}

.custom-tabs :deep(.el-tabs__content) {
  padding: 15px;
  background: #f9fafb;
  border-radius: 0 0 8px 8px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.custom-tabs :deep(.el-tabs__nav) {
  border-radius: 8px 8px 0 0;
}

.custom-tabs :deep(.el-tabs__item) {
  padding: 8px 16px;
  height: auto;
  font-size: 14px;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

.preview-content pre {
  max-height: 200px;
  overflow-y: auto;
}

.preview-content pre::-webkit-scrollbar {
  width: 6px;
}

.preview-content pre::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.preview-content pre::-webkit-scrollbar-track {
  background-color: #f7fafc;
}
</style>
