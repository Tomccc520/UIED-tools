<!--
 * @file AIIconGenerator.vue
 * @description AI矢量图标生成器，基于DeepSeek AI实现智能图标生成
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-2-8
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 维护提示 -->
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              功能维护升级中，暂时无法使用。我们正在努力优化生成效果，请稍后再试。
            </p>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 opacity-50 pointer-events-none">
        <!-- 页面标题 -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-4 px-8 py-4">
            <div class="w-12 h-12 flex-shrink-0">
              <img src="@/assets/images/deepseek-copy.svg" alt="DeepSeek Logo" class="w-full h-full" />
            </div>
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-900">AI矢量图标生成器</h1>
              <p class="text-sm text-gray-500">基于 DeepSeek AI，快速生成高质量矢量图标</p>
              <div class="mt-2">
                <span class="inline-block px-3 py-1 text-xs text-red-500 bg-red-50 rounded-full">限时免费体验中</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成配置区域 -->
        <div class="bg-white p-6 rounded-xl border border-gray-100 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 左侧：图标描述和模型选择 -->
            <div class="space-y-6">
              <!-- 图标描述输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">图标描述</label>
                <el-input v-model="iconDescription" type="textarea" :rows="4"
                  placeholder="请详细描述您想要生成的图标，例如：一个简约风格的购物车图标，使用圆润的线条，突出购物和商务特征..." class="w-full" />
                <div class="mt-2">
                  <div class="text-xs text-gray-500">提示：描述越详细，生成的图标越符合需求</div>
                  <div class="mt-2 space-y-2">
                    <div class="text-xs text-gray-600 font-medium">示例描述：</div>
                    <div class="grid grid-cols-1 gap-2">
                      <div v-for="(example, index) in descriptionExamples" :key="index"
                        class="text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                        @click="iconDescription = example.content">
                        {{ example.content }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- AI模型选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">选择AI模型</label>
                <div class="grid grid-cols-1 gap-3">
                  <div v-for="model in aiModels" :key="model.value"
                    class="relative flex items-center p-4 border rounded-lg cursor-pointer transition-all" :class="[
                      selectedModel === model.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    ]" @click="selectedModel = model.value">
                    <div class="flex-1">
                      <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">{{ model.label }}</span>
                        <el-tag size="small" :type="model.type" class="ml-2">{{ model.tag }}</el-tag>
                      </div>
                      <p class="mt-1 text-xs text-gray-500">{{ model.description }}</p>
                    </div>
                    <div class="ml-4">
                      <span class="text-xs text-gray-500">消耗 {{ model.points }} 点</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：风格和外观设置 -->
            <div class="space-y-6">
              <!-- 风格选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">图标风格</label>
                <div class="grid grid-cols-3 gap-2">
                  <div v-for="style in iconStyles" :key="style.value"
                    class="relative p-3 border rounded-lg cursor-pointer text-center transition-all" :class="[
                      selectedStyle === style.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    ]" @click="selectedStyle = style.value">
                    <span class="text-sm">{{ style.label }}</span>
                  </div>
                </div>
              </div>

              <!-- 颜色选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">主色调</label>
                <div class="flex items-center space-x-4">
                  <el-color-picker v-model="selectedColor" show-alpha class="flex-shrink-0" />
                  <div class="flex-grow grid grid-cols-5 gap-2">
                    <div v-for="color in presetColors" :key="color"
                      class="w-8 h-8 rounded-lg cursor-pointer border transition-all"
                      :class="selectedColor === color ? 'border-blue-500 shadow-lg' : 'border-gray-200'"
                      :style="{ backgroundColor: color }" @click="selectedColor = color">
                    </div>
                  </div>
                </div>
              </div>

              <!-- 尺寸选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">图标尺寸</label>
                <el-slider v-model="selectedSize" :min="16" :max="512" :step="16" :marks="sizeMarks" />
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="flex justify-center mt-6">
            <el-button type="primary" :loading="loading" @click="generateIcon" size="large" class="px-8">
              {{ loading ? '正在生成...' : '生成图标' }}
              <template #suffix>
                <span class="ml-2 text-xs opacity-75">(消耗 {{aiModels.find((m: AIModel) => m.value ===
                  selectedModel)?.points}}
                  点)</span>
              </template>
            </el-button>
          </div>
        </div>

        <!-- 生成结果展示 -->
        <div v-if="generatedIcons.length > 0" class="space-y-6">
          <h3 class="text-lg font-medium text-gray-900">生成结果</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="icon in generatedIcons" :key="icon.id"
              class="relative group border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all">
              <div class="icon-preview" v-html="icon.svg"></div>
              <div
                class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <el-button type="primary" size="small" @click="editIconAnimation(icon)">编辑动画</el-button>
                <el-button type="success" size="small" @click="downloadIcon(icon)">下载</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 动画编辑对话框 -->
        <el-dialog v-model="isEditingAnimation" title="编辑图标动画" width="70%" :close-on-click-modal="false">
          <div v-if="selectedIcon" class="space-y-6">
            <div class="grid grid-cols-2 gap-8">
              <!-- 左侧预览 -->
              <div class="space-y-4">
                <h4 class="text-sm font-medium text-gray-700">预览效果</h4>
                <div class="border rounded-lg p-6 bg-gray-50">
                  <div class="icon-preview max-w-[200px] mx-auto" v-html="selectedIcon.svg"></div>
                </div>
                <div class="text-center text-sm text-gray-500">
                  当前动画: {{animationOptions.find((a: AnimationOption) => a.value === selectedAnimation)?.label || '无'}}
                </div>
              </div>

              <!-- 右侧控制面板 -->
              <div class="space-y-6">
                <!-- 动画类型选择 -->
                <div>
                  <h4 class="text-sm font-medium text-gray-700 mb-3">动画效果</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div v-for="animation in animationOptions" :key="animation.value"
                      class="relative p-3 border rounded-lg cursor-pointer transition-all" :class="[
                        selectedAnimation === animation.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      ]" @click="applyAnimation(animation.value)">
                      <div class="flex items-center">
                        <i :class="animation.icon" class="mr-2"></i>
                        <span class="text-sm">{{ animation.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 动画参数调整 -->
                <div v-if="selectedAnimation" class="space-y-4">
                  <h4 class="text-sm font-medium text-gray-700">动画参数</h4>
                  <div class="space-y-4">
                    <div>
                      <div class="flex justify-between mb-2">
                        <label class="text-xs text-gray-600">动画速度</label>
                        <span class="text-xs text-gray-500">{{ animationSpeed }}x</span>
                      </div>
                      <el-slider v-model="animationSpeed" :min="0.5" :max="3" :step="0.1" />
                    </div>
                    <div>
                      <div class="flex justify-between mb-2">
                        <label class="text-xs text-gray-600">动画强度</label>
                        <span class="text-xs text-gray-500">{{ animationIntensity }}</span>
                      </div>
                      <el-slider v-model="animationIntensity" :min="1" :max="10" :step="1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <template #footer>
            <div class="flex justify-between">
              <el-button @click="resetAnimation" :disabled="!selectedAnimation">重置动画</el-button>
              <div class="space-x-2">
                <el-button @click="isEditingAnimation = false">取消</el-button>
                <el-button type="primary" @click="saveAnimation" :disabled="!selectedAnimation">保存动画</el-button>
              </div>
            </div>
          </template>
        </el-dialog>
      </div>

      <!-- 功能介绍 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">功能特点</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(feature, index) in features" :key="index" class="space-y-2">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <i :class="feature.icon"></i>
              </div>
              <h4 class="font-medium text-gray-900">{{ feature.title }}</h4>
            </div>
            <p class="text-sm text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="bg-white rounded-xl p-8 mb-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">使用说明</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="(tip, index) in usageTips" :key="index" class="flex items-start space-x-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ tip.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ tip.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明部分后添加工具推荐 -->
      <div class="mt-4">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 图标风格选项
const iconStyles = [
  { label: '线性图标', value: 'line' },
  { label: '填充图标', value: 'filled' },
  { label: '双色图标', value: 'duotone' },
  { label: '渐变图标', value: 'gradient' },
  { label: '手绘风格', value: 'hand-drawn' },
  { label: '3D图标', value: '3d' }
]

// 图标尺寸选项
const iconSizes = [
  { label: '16x16', value: '16' },
  { label: '24x24', value: '24' },
  { label: '32x32', value: '32' },
  { label: '48x48', value: '48' },
  { label: '64x64', value: '64' },
  { label: '128x128', value: '128' }
]

// 使用说明
const usageTips = [
  {
    title: '描述图标',
    content: '详细描述您想要的图标样式、元素和用途'
  },
  {
    title: '选择风格',
    content: '选择合适的图标风格、颜色和尺寸'
  },
  {
    title: '下载使用',
    content: '生成后可预览并下载SVG格式的矢量图标'
  }
]

// 生成的SVG图标数据结构
interface GeneratedIcon {
  id: string
  svg: string
  animation?: string
  url?: string
}

// AI模型选项
interface AIModel {
  label: string
  value: string
  type: string
  tag: string
  description: string
  points: number
  temperature: number
  max_tokens: number
}

// 图标动画选项
interface AnimationOption {
  label: string
  value: 'rotate' | 'scale' | 'blink' | 'stroke' | 'bounce' | 'gradient'
  icon: string
}

const animationOptions: AnimationOption[] = [
  { label: '旋转', value: 'rotate', icon: 'el-icon-refresh-right' },
  { label: '缩放', value: 'scale', icon: 'el-icon-zoom-in' },
  { label: '闪烁', value: 'blink', icon: 'el-icon-view' },
  { label: '描边', value: 'stroke', icon: 'el-icon-edit' },
  { label: '弹跳', value: 'bounce', icon: 'el-icon-top' },
  { label: '渐变', value: 'gradient', icon: 'el-icon-magic-stick' }
]

// AI模型选项
const aiModels: AIModel[] = [
  {
    label: 'DeepSeek-7B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    type: 'success',
    tag: '基础版',
    description: '基础版图标生成模型，适合生成简单的图标',
    points: 1,
    temperature: 0.7,
    max_tokens: 2048
  },
  {
    label: 'DeepSeek-8B',
    value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B',
    type: 'warning',
    tag: '专业版',
    description: '专业版图标生成模型，可生成更复杂、精美的图标',
    points: 2,
    temperature: 0.7,
    max_tokens: 4096
  }
]

// 预设颜色
const presetColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#2c3e50', '#42b983', '#33a06f', '#8e44ad', '#16a085'
]

// 尺寸标记
const sizeMarks = {
  16: '16px',
  64: '64px',
  128: '128px',
  256: '256px',
  512: '512px'
}

// 状态变量
const iconDescription = ref('')
const selectedStyle = ref('line')
const selectedColor = ref('#409EFF')
const selectedSize = ref('64')
const generating = ref(false)
const loading = ref(false)
const generatedIcons = ref<GeneratedIcon[]>([])
const selectedIcon = ref<GeneratedIcon | null>(null)
const isEditingAnimation = ref(false)
const selectedModel = ref('deepseek-ai/DeepSeek-R1-Distill-Qwen-7B')
const selectedAnimation = ref('')
const animationSpeed = ref(1)
const animationIntensity = ref(5)

// 示例描述
const descriptionExamples = [
  {
    content: '一个简约的购物车图标，使用圆润的线条，突出购物和商务特征，适合电商场景使用'
  },
  {
    content: '一个现代风格的设置图标，采用齿轮造型，体现科技感和可配置性'
  },
  {
    content: '一个清新的树叶图标，强调环保理念，用简单的线条勾勒自然形态'
  },
  {
    content: '一个动感的音乐播放图标，结合音符和播放键元素，体现音乐和娱乐属性'
  }
]

// 功能特点
const features = [
  {
    title: '智能生成',
    icon: 'el-icon-magic-stick',
    description: '基于 DeepSeek AI 模型，快速生成高质量的SVG矢量图标，支持多种风格和自定义需求'
  },
  {
    title: '动画效果',
    icon: 'el-icon-video-play',
    description: '内置多种动画效果，包括旋转、缩放、闪烁等，让图标更具生命力'
  },
  {
    title: '一键导出',
    icon: 'el-icon-download',
    description: '支持SVG格式导出，保持图标的清晰度和可编辑性，适用于各种场景'
  },
  {
    title: '风格多样',
    icon: 'el-icon-picture',
    description: '提供线性、填充、双色等多种风格选择，满足不同设计需求'
  },
  {
    title: '颜色定制',
    icon: 'el-icon-brush',
    description: '支持自定义颜色，提供预设配色方案，轻松打造品牌专属图标'
  },
  {
    title: '尺寸灵活',
    icon: 'el-icon-full-screen',
    description: '支持16px到512px的尺寸调整，满足不同应用场景的需求'
  }
]

// 生成图标
const generateIcon = async () => {
  if (!iconDescription.value) {
    ElMessage.warning('请输入图标描述')
    return
  }

  loading.value = true
  try {
    // 生成4次不同风格的图标
    const styles = ['简约线条风格', '扁平化设计风格', '渐变立体风格', '手绘素描风格']
    const prompts = styles.map(style => `请生成一个SVG矢量图标，要求如下：
1. 图标描述：${iconDescription.value}
2. 风格要求：${style}，简洁、现代、专业
3. 颜色要求：使用 ${selectedColor.value} 作为主色
4. 大小要求：${selectedSize.value}x${selectedSize.value}
5. 设计要求：
   - 使用纯SVG代码，不要使用图片或外部资源
   - 确保SVG代码规范、整洁
   - 图标要简单易识别
   - 避免过于复杂的细节
   - 确保视觉平衡
6. 格式要求：
   - 必须以 <svg 开头，以 </svg> 结尾
   - 必须包含 xmlns="http://www.w3.org/2000/svg" 属性
   - 必须包含 viewBox 属性
   - 所有路径和形状必须正确闭合
请直接返回SVG代码，不要包含任何其他说明文字。`)

    // 获取 API Key
    const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY
    if (!apiKey) {
      throw new Error('API Key 未配置，请先配置 SiliconFlow API Key')
    }

    // 并行发送4个请求
    const requests = prompts.map(prompt =>
      fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel.value,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的图标设计师，擅长设计简洁、现代的SVG矢量图标。请只返回SVG代码，不需要其他解释。确保SVG代码完全符合规范。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: false
        })
      })
    )

    const responses = await Promise.all(requests)
    const results = await Promise.all(responses.map(async (response, index) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || errorData.message || '未知错误'
        throw new Error(`请求失败 (${response.status}): ${errorMessage}`)
      }
      return response.json()
    }))

    // 处理所有返回的SVG
    results.forEach(data => {
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('返回数据格式错误')
      }

      let svgCode = data.choices[0].message.content.trim()

      // 验证和清理 SVG 代码
      if (!svgCode.startsWith('<svg') || !svgCode.endsWith('</svg>')) {
        // 尝试提取 SVG 代码
        const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/i)
        if (svgMatch) {
          svgCode = svgMatch[0]
        } else {
          throw new Error('生成的SVG代码格式不正确')
        }
      }

      // 验证必要的属性
      if (!svgCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgCode = svgCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      }

      if (!svgCode.includes('viewBox')) {
        svgCode = svgCode.replace('<svg', '<svg viewBox="0 0 24 24"')
      }

      // 生成唯一ID
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // 添加到生成的图标列表
      generatedIcons.value.push({
        id,
        svg: svgCode
      })
    })

    ElMessage.success('生成成功')
  } catch (error) {
    console.error('生成失败:', error)
    ElMessage.error(error instanceof Error ? error.message : '生成失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 编辑图标动画
const editIconAnimation = (icon: GeneratedIcon) => {
  if (!icon.svg) {
    ElMessage.warning('请先生成图标')
    return
  }
  selectedIcon.value = icon
  isEditingAnimation.value = true
}

// 应用动画效果
const applyAnimation = (animationType: AnimationOption['value']) => {
  if (!selectedIcon.value) return

  const iconId = `icon-${selectedIcon.value.id}`
  const animations: Record<AnimationOption['value'], string> = {
    rotate: 'animation: rotate 2s linear infinite;',
    scale: 'animation: scale 1s ease-in-out infinite;',
    blink: 'animation: blink 1s ease-in-out infinite;',
    stroke: 'animation: stroke 2s linear infinite;',
    bounce: 'animation: bounce 1s ease-in-out infinite;',
    gradient: 'animation: gradient 2s linear infinite;'
  }

  const style = `<style>
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes stroke {
      0% { stroke-dashoffset: 100; }
      100% { stroke-dashoffset: 0; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes gradient {
      0% { stroke: ${selectedColor.value}; }
      50% { stroke: #ff0000; }
      100% { stroke: ${selectedColor.value}; }
    }
    .${iconId} path { ${animations[animationType]} }
  </style>`

  const svgWithClass = selectedIcon.value.svg.replace('<svg', `<svg class="${iconId}"`)
  selectedIcon.value.animation = style
  selectedIcon.value.svg = style + svgWithClass
  isEditingAnimation.value = false
}

// 下载图标
const downloadIcon = (icon: GeneratedIcon) => {
  const blob = new Blob([icon.svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `icon-${Date.now()}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('图标下载成功')
}

// 重置动画
const resetAnimation = () => {
  selectedAnimation.value = ''
  animationSpeed.value = 1
  animationIntensity.value = 5
}

// 保存动画
const saveAnimation = () => {
  if (!selectedIcon.value) return

  const animation = animationOptions.find(a => a.value === selectedAnimation.value)
  if (animation) {
    const style = `<style>
      @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes scale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes stroke {
        0% { stroke-dashoffset: 100; }
        100% { stroke-dashoffset: 0; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes gradient {
        0% { stroke: ${selectedColor.value}; }
        50% { stroke: #ff0000; }
        100% { stroke: ${selectedColor.value}; }
      }
      .${selectedIcon.value.id} path { ${animation.value} }
    </style>`

    const svgWithClass = selectedIcon.value.svg.replace('<svg', `<svg class="${selectedIcon.value.id}"`)
    selectedIcon.value.animation = style
    selectedIcon.value.svg = style + svgWithClass
    isEditingAnimation.value = false
  }
}
</script>

<style scoped>
.el-select {
  width: 100%;
}

.el-color-picker {
  width: 100%;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.icon-preview {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
}

.icon-preview svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.animation-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}
</style>
