<!--
 * @file Diff.vue
 * @description 文本对比工具组件，支持中英文和代码的精确对比
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2025-01-14
 *
 * 功能特性：
 * 1. 支持中文、英文、代码等多种文本格式对比
 * 2. 精确到字符级别的差异展示
 * 3. 实时对比，即时显示修改内容
 * 4. 支持空格、换行等特殊字符的对比
 * 5. 清晰的删除和新增内容标注
-->

<script setup lang="ts">
import { ref } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { CodeDiff } from 'v-code-diff'
import { useRoute } from 'vue-router'

const route = useRoute()

// 组件配置信息
const info = {
  title: "文本对比工具",
  subtitle: "在线文本差异比对工具，支持中文、英文、代码比对"
}

const leftTxt = ref('旧文本')
const rightTxt = ref('新文本')

// 功能特点
const features = [
  {
    title: '多语言支持',
    desc: '支持中文、英文、代码等多种文本格式的对比'
  },
  {
    title: '实时对比',
    desc: '即时显示文本差异，清晰展示修改、删除和新增内容'
  },
  {
    title: '无限制对比',
    desc: '不限制字数，支持长文本的差异比对'
  }
]

// 适用场景
const usageScenarios = [
  '文档修订：对比文档修改前后的差异，快速查看修改内容',
  '合同审核：比对合同版本变化，确保重要条款无误',
  '邮件核对：检查邮件内容修改，避免发送错误',
  '会议纪要：对比会议记录的多个版本，确保内容准确'
]

// 常见问题
const faqs = [
  {
    question: '支持对比多长的文本？',
    answer: '本工具支持任意长度的文本对比，但为了获得最佳的对比效果和加载速度，建议单次对比的文本不超过10万字。'
  },
  {
    question: '对比结果如何理解？',
    answer: '红色标记表示删除的内容，绿色标记表示新增的内容，下划线标记表示修改的内容。对比结果会清晰展示文本的所有变化。'
  },
  {
    question: '适合对比哪些类型的文本？',
    answer: '适合对比各种类型的文本，如工作报告、文档修改、合同版本、邮件内容等。无论是中文还是英文都能精确识别差异。'
  },
  {
    question: '如何导出对比结果？',
    answer: '您可以直接选中需要的文本进行复制，也可以使用浏览器的打印功能将对比结果保存为PDF文件，方便存档和分享。'
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

        <!-- 文本输入区域 -->
        <div class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-2">
              <h3 class="text-base font-medium text-gray-700">文本对比</h3>
              <span class="text-sm text-gray-500">输入或粘贴需要对比的文本</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm text-gray-600">旧文本</label>
              <el-input type="textarea" :rows="12" v-model="leftTxt" placeholder="请输入旧文本" class="w-full" />
            </div>
            <div class="space-y-2">
              <label class="text-sm text-gray-600">新文本</label>
              <el-input type="textarea" :rows="12" v-model="rightTxt" placeholder="请输入新文本" class="w-full" />
            </div>
          </div>

          <!-- 对比结果 -->
          <div class="mt-8 border rounded-lg p-6 bg-gray-50">
            <h4 class="text-base font-medium text-gray-700 mb-4">对比结果</h4>
            <code-diff :old-string="leftTxt" :new-string="rightTxt" output-format="side-by-side"
              :show-line-numbers="true" :diff-style="'char'" :trim-space="false" :show-space="true" />
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
:deep(.v-code-diff) {
  border-radius: 0.5rem;
  overflow: hidden;
}

:deep(.v-code-diff pre) {
  margin: 0;
  padding: 1rem;
  font-size: 16px;
  line-height: 2;
}

:deep(.v-code-diff .line) {
  min-height: 2rem;
  line-height: 2rem;
}

:deep(.v-code-diff .deletion) {
  background-color: #ffd7d7 !important;
  text-decoration: line-through;
}

:deep(.v-code-diff .addition) {
  background-color: #c8ffc8 !important;
}

:deep(.v-code-diff .deletion, .v-code-diff .addition) {
  border-radius: 3px;
  margin: 0 2px;
  padding: 2px 4px;
}

:deep(.v-code-diff .char-change) {
  font-weight: bold;
  border-bottom: 2px solid #ff6b6b;
}
</style>
