<!--
 * @file StableDiffusion.vue
 * @description StableDiffusion AI绘画工具组件
 * @author UIED技术团队
 * @createDate 2024-01-27
 *
 * 功能特性：
 * 1. 支持输入提示词进行AI绘画
 * 2. 支持选择不同的绘画尺寸
 * 3. 支持图片预览和下载
 * 4. 提供详细的使用说明
 -->
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
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
          <!-- 温馨提示 -->
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-600 text-sm">
              温馨提示：该功能正在优化中，如遇到问题请稍后再试。生成图片可能需要一些时间，请耐心等待。
            </p>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="space-y-6">
              <!-- 提示词输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">提示词 (Prompt)</label>
                <el-input v-model="prompt" type="textarea" :rows="3"
                  placeholder="请输入提示词，例如：a cute cat, digital art style" class="w-full" />

                <!-- 基础提示词选择 -->
                <div class="mt-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="text-sm font-medium text-gray-700">快速添加提示词</div>
                    <el-button type="primary" link size="small" @click="clearPrompt">
                      <span class="text-xs">清空提示词</span>
                    </el-button>
                  </div>

                  <!-- 提示词分类标签页 -->
                  <el-tabs>
                    <!-- 主题内容 -->
                    <el-tab-pane label="主题内容">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="item in subjectStyles" :key="item.text" size="small"
                          :type="isPromptSelected(item.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(item.prompt)">
                          {{ item.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 艺术风格 -->
                    <el-tab-pane label="艺术风格">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="style in artStyles" :key="style.text" size="small"
                          :type="isPromptSelected(style.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(style.prompt)">
                          {{ style.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 材质效果 -->
                    <el-tab-pane label="材质效果">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="material in materialStyles" :key="material.text" size="small"
                          :type="isPromptSelected(material.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(material.prompt)">
                          {{ material.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 色彩方案 -->
                    <el-tab-pane label="色彩方案">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="color in colorStyles" :key="color.text" size="small"
                          :type="isPromptSelected(color.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(color.prompt)">
                          {{ color.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 光照效果 -->
                    <el-tab-pane label="光照效果">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="light in lightingStyles" :key="light.text" size="small"
                          :type="isPromptSelected(light.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(light.prompt)">
                          {{ light.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 场景氛围 -->
                    <el-tab-pane label="场景氛围">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="scene in sceneStyles" :key="scene.text" size="small"
                          :type="isPromptSelected(scene.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(scene.prompt)">
                          {{ scene.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 情感氛围 -->
                    <el-tab-pane label="情感氛围">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="mood in moodStyles" :key="mood.text" size="small"
                          :type="isPromptSelected(mood.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(mood.prompt)">
                          {{ mood.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>

                    <!-- 画质提升 -->
                    <el-tab-pane label="画质提升">
                      <div class="flex flex-wrap gap-2">
                        <el-button v-for="quality in qualityStyles" :key="quality.text" size="small"
                          :type="isPromptSelected(quality.prompt) ? 'primary' : 'default'"
                          class="!text-xs !px-3 !py-1 !rounded-full hover:!bg-blue-50"
                          @click="appendPrompt(quality.prompt)">
                          {{ quality.text }}
                        </el-button>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
                <div class="mt-4 flex items-center gap-2">
                  <div class="text-xs text-gray-500">当前提示词：</div>
                  <div class="text-xs text-blue-500 flex-1">{{ prompt || '暂无提示词' }}</div>
                </div>
              </div>

              <!-- 尺寸选择 -->
              <div class="flex items-center gap-4">
                <label class="text-sm font-medium text-gray-700 whitespace-nowrap">图片尺寸：</label>
                <div class="flex gap-3">
                  <div v-for="option in sizeOptions" :key="option.value"
                    class="border rounded-lg p-2 cursor-pointer transition-all duration-200 flex items-center gap-2"
                    :class="model === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'"
                    @click="model = option.value">
                    <div class="bg-gray-200 rounded" :style="option.style"></div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ option.label }}</div>
                      <div class="text-xs text-gray-500">{{ option.desc }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 生成按钮 -->
              <div class="flex justify-center">
                <el-button type="primary" :loading="generating"
                  class="!w-48 !h-12 !text-base !font-medium !bg-blue-500 hover:!bg-blue-600 transition-colors duration-300 flex items-center justify-center gap-2"
                  @click="generateImage">
                  <template v-if="!generating">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>开始生成</span>
                  </template>
                  <template v-else>
                    <span>生成中...</span>
                  </template>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div v-if="generatedImageUrl" class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 flex justify-between items-center">
              <span class="text-gray-700 font-medium">生成结果</span>
              <span class="text-xs text-gray-500">右键图片另存为即可保存</span>
            </div>
            <div class="border rounded-lg bg-gray-50 p-4 flex flex-col items-center justify-center min-h-[300px]">
              <div class="relative w-full h-full flex justify-center">
                <img :src="generatedImageUrl"
                  class="max-w-full max-h-[500px] object-contain cursor-pointer hover:opacity-90 transition-opacity duration-200"
                  alt="生成的图片" @error="ElMessage.error('图片加载失败，请重试')" @click="openImage" />
              </div>
              <div class="mt-4 flex gap-2 items-center justify-center w-full">
                <el-button type="primary"
                  class="!px-8 !py-3 flex items-center gap-2 !bg-blue-500 hover:!bg-blue-600 !text-base"
                  @click="openImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>打开图片</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 功能说明 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4 text-gray-700 font-medium">功能说明</div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg v-if="feature.icon === 'Prompt'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <svg v-else-if="feature.icon === 'AI'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Size'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <svg v-else-if="feature.icon === 'Download'" class="w-5 h-5 text-blue-500" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 常见问题 -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
            <div class="space-y-6">
              <div v-for="faq in faqItems" :key="faq.q" class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
                <h4 class="text-base font-medium text-gray-900 mb-3">{{ faq.q }}</h4>
                <p class="text-sm text-gray-600 leading-relaxed">{{ faq.a }}</p>
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

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElButton, ElInput } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

// 组件配置信息
const info = {
  title: "StableDiffusion AI绘画",
  subtitle: "使用AI技术，将文字描述转换为精美图片"
}

// 常见问题
const faqItems = [
  {
    q: '如何写出好的提示词？',
    a: '建议使用英文描述，包含具体的场景、风格、氛围等要素。例如：a cute cat sitting on a window sill, digital art style, soft lighting, cozy atmosphere。'
  },
  {
    q: '为什么生成的图片效果不理想？',
    a: '图片效果与提示词的质量密切相关。建议添加更多细节描述，比如光照、材质、风格等。同时，可以尝试不同的尺寸选项。'
  },
  {
    q: '生成图片需要多长时间？',
    a: '通常需要10-30秒不等，取决于服务器负载情况。如果等待时间过长，可以刷新页面重试。'
  },
  {
    q: '生成的图片可以商用吗？',
    a: '生成的图片版权归属需要遵循相关规定。建议在商业用途前仔细阅读使用条款，必要时寻求法律建议。'
  },
  {
    q: '为什么有时会生成失败？',
    a: '可能是由于网络问题、服务器负载过高或提示词不当等原因。建议检查网络连接，稍后重试或修改提示词。'
  }
]

// 功能特点
const features = [
  {
    title: '提示词生成',
    desc: '通过文字描述创作图像',
    icon: 'Prompt'
  },
  {
    title: 'AI技术',
    desc: '使用先进的AI模型绘画',
    icon: 'AI'
  },
  {
    title: '多种尺寸',
    desc: '支持不同图片尺寸比例',
    icon: 'Size'
  },
  {
    title: '便捷保存',
    desc: '生成图片可直接下载',
    icon: 'Download'
  }
]

// 尺寸选项
const sizeOptions = [
  {
    label: '方形',
    value: 'normal',
    desc: '1:1比例',
    iconClass: 'h-20',
    style: 'width: 60px; height: 60px;'
  },
  {
    label: '竖形',
    value: 'vertical',
    desc: '2:3比例',
    iconClass: 'h-24',
    style: 'width: 40px; height: 60px;'
  },
  {
    label: '横形',
    value: 'horizontal',
    desc: '3:2比例',
    iconClass: 'h-16',
    style: 'width: 60px; height: 40px;'
  }
]

// 状态管理
const prompt = ref('')
const model = ref('normal')
const generating = ref(false)
const generatedImageUrl = ref('')

// 获取当前路由
const route = useRoute()

// 更新主题内容选项
const subjectStyles = [
  { text: '猫咪', prompt: 'cute cat' },
  { text: '狗狗', prompt: 'lovely dog' },
  { text: '风景', prompt: 'landscape' },
  { text: '人物', prompt: 'portrait' },
  { text: '建筑', prompt: 'architecture' },
  { text: '花卉', prompt: 'flowers' },
  { text: '美食', prompt: 'food' },
  { text: '机械', prompt: 'mechanical' },
  { text: '科幻', prompt: 'sci-fi' },
  { text: '抽象', prompt: 'abstract' },
  { text: '动物', prompt: 'animal' },
  { text: '汽车', prompt: 'car' },
  { text: '太空', prompt: 'space' },
  { text: '机器人', prompt: 'robot' },
  { text: '城市', prompt: 'city' }
]

// 更新艺术风格选项
const artStyles = [
  { text: '油画', prompt: 'oil painting style' },
  { text: '水彩', prompt: 'watercolor style' },
  { text: '素描', prompt: 'pencil sketch style' },
  { text: '动漫', prompt: 'anime style' },
  { text: '赛博朋克', prompt: 'cyberpunk style' },
  { text: '写实', prompt: 'photorealistic style' },
  { text: '梦幻', prompt: 'dreamy style' },
  { text: '复古', prompt: 'vintage style' },
  { text: '印象派', prompt: 'impressionist style' },
  { text: '极简', prompt: 'minimalist style' },
  { text: '像素', prompt: 'pixel art style' },
  { text: '3D渲染', prompt: '3D rendering style' },
  { text: '插画', prompt: 'illustration style' },
  { text: '概念艺术', prompt: 'concept art style' },
  { text: '波普艺术', prompt: 'pop art style' },
  { text: '未来主义', prompt: 'futuristic style' },
  { text: '蒸汽朋克', prompt: 'steampunk style' },
  { text: '超现实', prompt: 'surreal style' }
]

// 更新光照效果选项
const lightingStyles = [
  { text: '柔和光', prompt: 'soft lighting' },
  { text: '自然光', prompt: 'natural lighting' },
  { text: '暖光', prompt: 'warm lighting' },
  { text: '冷光', prompt: 'cold lighting' },
  { text: '逆光', prompt: 'backlight' },
  { text: '聚光', prompt: 'spotlight' },
  { text: '霓虹', prompt: 'neon lighting' },
  { text: '黄昏', prompt: 'golden hour lighting' },
  { text: '戏剧光', prompt: 'dramatic lighting' },
  { text: '环境光', prompt: 'ambient lighting' },
  { text: '体积光', prompt: 'volumetric lighting' },
  { text: '彩色光', prompt: 'colorful lighting' },
  { text: '月光', prompt: 'moonlight' },
  { text: '阳光', prompt: 'sunlight' }
]

// 更新场景氛围选项
const sceneStyles = [
  { text: '日落', prompt: 'sunset scene' },
  { text: '森林', prompt: 'forest scene' },
  { text: '城市', prompt: 'cityscape' },
  { text: '海边', prompt: 'beach scene' },
  { text: '雨天', prompt: 'rainy scene' },
  { text: '星空', prompt: 'starry night' },
  { text: '雾霾', prompt: 'misty scene' },
  { text: '雪景', prompt: 'snowy scene' },
  { text: '沙漠', prompt: 'desert scene' },
  { text: '山脉', prompt: 'mountain scene' },
  { text: '室内', prompt: 'indoor scene' },
  { text: '太空', prompt: 'space scene' },
  { text: '地下城', prompt: 'dungeon scene' },
  { text: '热带', prompt: 'tropical scene' },
  { text: '极地', prompt: 'arctic scene' },
  { text: '火山', prompt: 'volcano scene' }
]

// 更新画质提升选项
const qualityStyles = [
  { text: '高清', prompt: 'high quality' },
  { text: '4K', prompt: '4k resolution' },
  { text: '细节丰富', prompt: 'detailed' },
  { text: '锐利', prompt: 'sharp' },
  { text: '专业', prompt: 'professional' },
  { text: '完美构图', prompt: 'perfect composition' },
  { text: '高对比度', prompt: 'high contrast' },
  { text: '色彩鲜艳', prompt: 'vibrant colors' },
  { text: '超现实', prompt: 'hyper-realistic' },
  { text: '电影感', prompt: 'cinematic' },
  { text: '8K', prompt: '8k resolution' },
  { text: 'HDR', prompt: 'HDR quality' }
]

// 添加材质效果选项
const materialStyles = [
  { text: '金属', prompt: 'metallic texture' },
  { text: '玻璃', prompt: 'glass texture' },
  { text: '木质', prompt: 'wooden texture' },
  { text: '大理石', prompt: 'marble texture' },
  { text: '皮革', prompt: 'leather texture' },
  { text: '丝绸', prompt: 'silk texture' },
  { text: '毛绒', prompt: 'fluffy texture' },
  { text: '水晶', prompt: 'crystal texture' },
  { text: '陶瓷', prompt: 'ceramic texture' },
  { text: '塑料', prompt: 'plastic texture' }
]

// 添加色彩方案选项
const colorStyles = [
  { text: '单色调', prompt: 'monochromatic' },
  { text: '暖色系', prompt: 'warm colors' },
  { text: '冷色系', prompt: 'cool colors' },
  { text: '柔和色', prompt: 'pastel colors' },
  { text: '霓虹色', prompt: 'neon colors' },
  { text: '复古色', prompt: 'vintage colors' },
  { text: '彩虹色', prompt: 'rainbow colors' },
  { text: '金属色', prompt: 'metallic colors' },
  { text: '渐变色', prompt: 'gradient colors' },
  { text: '高饱和', prompt: 'saturated colors' }
]

// 添加情感氛围选项
const moodStyles = [
  { text: '欢快', prompt: 'cheerful mood' },
  { text: '神秘', prompt: 'mysterious mood' },
  { text: '浪漫', prompt: 'romantic mood' },
  { text: '恐怖', prompt: 'horror mood' },
  { text: '平静', prompt: 'peaceful mood' },
  { text: '忧郁', prompt: 'melancholic mood' },
  { text: '史诗', prompt: 'epic mood' },
  { text: '童话', prompt: 'fairy tale mood' },
  { text: '科幻', prompt: 'sci-fi mood' },
  { text: '魔幻', prompt: 'magical mood' }
]

// 检查提示词是否已选择
const isPromptSelected = (checkPrompt: string) => {
  return prompt.value.includes(checkPrompt)
}

// 清空提示词
const clearPrompt = () => {
  prompt.value = ''
}

// 添加提示词方法
const appendPrompt = (newPrompt: string) => {
  if (!prompt.value) {
    prompt.value = newPrompt
  } else {
    prompt.value = `${prompt.value}, ${newPrompt}`
  }
}

// 生成图片
const generateImage = async () => {
  if (!prompt.value.trim()) {
    ElMessage.error('请输入提示词')
    return
  }

  try {
    generating.value = true
    const params = {
      prompt: prompt.value.trim(),
      model: model.value
    }

    const result = await axios.get('https://api.pearktrue.cn/api/stablediffusion/', { params })

    if (result.data.code === 200) {
      generatedImageUrl.value = result.data.imgurl
      ElMessage.success('图片生成成功')
    } else {
      ElMessage.error(result.data.msg || '生成失败，请重试')
    }
  } catch (error: any) {
    console.error('生成图片时出错:', error)
    ElMessage.error('生成失败，请重试')
  } finally {
    generating.value = false
  }
}

// 打开图片
const openImage = () => {
  if (!generatedImageUrl.value) return
  window.open(generatedImageUrl.value, '_blank')
}
</script>

<style scoped>
/* 禁用图片拖动 */
img {
  user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* 自定义输入框样式 */
:deep(.el-textarea__inner) {
  min-height: 80px !important;
}
</style>
