<!--
 * @file WordCount.vue
 * @description 文本字数统计工具，支持多维度统计分析
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2025-01-14
 *
 * 功能特性：
 * 1. 支持实时字数统计
 * 2. 多维度分析（汉字、字母、数字等）
 * 3. 支持标点符号统计
 * 4. 区分全角半角字符
 * 5. 支持空白字符统计
-->

<script setup lang="ts">
import { ref } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 组件配置信息
const info = {
  title: "文本字数统计",
  subtitle: "智能文本分析工具，多维度统计文本信息"
}

const content = ref('')
const stats = ref({
  chinaCharNum: 0,
  letterNum: 0,
  punctuationHalfNum: 0,
  punctuationFullNum: 0,
  numberNum: 0,
  emptyNum: 0,
  sum: 0,
})

//内容发生变化，重新统计
const changeContent = () => {
  //汉字
  stats.value.chinaCharNum = (content.value.match(/[\u4e00-\u9fa5]/g) || []).length;
  //字母
  stats.value.letterNum = (content.value.match(/[a-zA-Z]/g) || []).length;
  //符号 - 半角
  stats.value.punctuationHalfNum = (content.value.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g) || []).length;
  //符号 - 全角
  stats.value.punctuationFullNum = (content.value.match(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/g) || []).length;
  //数字
  stats.value.numberNum = (content.value.match(/[\d+]/g) || []).length;
  //空白字符
  stats.value.emptyNum = (content.value.match(/[\s*]/g) || []).length;
  //合计
  stats.value.sum = stats.value.chinaCharNum + stats.value.letterNum + stats.value.punctuationHalfNum + stats.value.punctuationFullNum + stats.value.numberNum + stats.value.emptyNum;
}

// 功能特点
const features = [
  {
    title: '实时统计',
    desc: '输入即统计，实时展示各项数据'
  },
  {
    title: '多维分析',
    desc: '分别统计汉字、字母、数字、标点等'
  },
  {
    title: '精确计数',
    desc: '区分全角半角，准确识别各类字符'
  }
]

// 适用场景
const usageScenarios = [
  '写作检查：统计文章字数和字符构成',
  '内容审核：分析文本结构和组成',
  '数据分析：了解文本字符分布情况',
  '文案优化：评估标点符号使用情况'
]

// 常见问题
const faqs = [
  {
    question: '统计的字数准确吗？',
    answer: '是的，我们采用精确的字符识别算法，能准确区分汉字、字母、数字、标点符号（全角/半角）以及空白字符，确保统计结果的准确性。'
  },
  {
    question: '为什么要区分全角和半角？',
    answer: '全角和半角符号在排版和显示上有差异，区分统计可以帮助您检查文本规范性，确保标点符号使用的一致性。'
  },
  {
    question: '支持统计哪些字符？',
    answer: '支持统计汉字、英文字母、数字、标点符号（全角/半角）、空白字符等，覆盖常见的文本字符类型。'
  },
  {
    question: '如何使用统计结果？',
    answer: '您可以根据统计结果检查文本长度是否符合要求，分析标点使用是否合理，评估文本结构是否均衡等。'
  }
]
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
        </div>

        <!-- 编辑器区域 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-medium text-gray-700">文本输入</h3>
              <span class="text-sm text-gray-500">输入或粘贴需要统计的文本</span>
            </div>
          </div>

          <div class="border rounded-lg overflow-hidden shadow-sm">
            <el-input type="textarea" :rows="12" v-model="content" @input="changeContent" placeholder="在此输入或粘贴文本内容..."
              class="w-full" />
          </div>

          <!-- 统计结果 -->
          <div class="mt-8 border rounded-lg p-6 bg-gray-50">
            <h4 class="text-base font-medium text-gray-700 mb-6">统计结果</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">总字数</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.sum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">汉字</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.chinaCharNum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">字母</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.letterNum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">数字</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.numberNum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">标点符号(半角)</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.punctuationHalfNum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">标点符号(全角)</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.punctuationFullNum }}</div>
              </div>
              <div
                class="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div class="text-sm text-gray-600">空白字符</div>
                <div class="text-2xl font-semibold text-gray-900 mt-2">{{ stats.emptyNum }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
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
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div v-for="(item, index) in faqs" :key="index" class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.question }}</h4>
              <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
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
.el-textarea :deep(.el-textarea__inner) {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  padding: 1.5rem;
  border: none;
  background-color: #fff;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: none;
}
</style>
