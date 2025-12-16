<!--
 * @file NumberToChinese.vue
 * @description 数字转中文大写工具，支持金额转换
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持数字转中文大写
 * 2. 支持金额格式化
 * 3. 一键复制转换结果
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
          <p class="text-gray-500 text-sm mt-4">轻松将阿拉伯数字转换为中文大写格式</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="px-8 pb-8">
          <!-- 输入区域 -->
          <div class="max-w-2xl mx-auto bg-gray-50 rounded-xl p-6">
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">数字输入</label>
              <el-input type="number" v-model="info.content" placeholder="请输入数字，最高13位数字" size="large"
                class="!text-lg !bg-white shadow-sm hover:shadow transition-shadow duration-300" />
            </div>

            <!-- 操作按钮 -->
            <div class="flex flex-wrap justify-center gap-4 mb-6">
              <el-button type="primary" @click="tran" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
                转换
              </el-button>
              <el-button type="default" @click="copyRes(info.tranRes)" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300"
                :disabled="!info.tranRes">
                复制结果
              </el-button>
              <el-button type="danger" @click="clear" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300"
                :disabled="!info.content && !info.tranRes">
                清空
              </el-button>
            </div>

            <!-- 结果展示 -->
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h3 class="text-base font-medium text-gray-800 mb-3">转换结果</h3>
              <el-input type="textarea" :rows="4" v-model="info.tranRes" placeholder="转换结果将在这里显示" readonly resize="none"
                class="!bg-gray-50" />
            </div>
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
                  <p>1. 在输入框中输入需要转换的数字（最多13位）</p>
                  <p>2. 点击"转换"按钮进行转换</p>
                  <p>3. 转换结果会显示在下方文本框中</p>
                  <p>4. 可以点击"复制结果"按钮复制转换结果</p>
                  <p>5. 需要重新开始可以点击"清空"按钮</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 仅支持数字输入，最多13位</p>
                  <p>- 支持正整数的转换</p>
                  <p>- 转换结果自动格式化为标准中文大写格式</p>
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
import { reactive } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import { copy, numberToChinese } from '@/utils/string'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "数字转中文大写",
  content: '',
  tranRes: '',
})

// 功能特点
const features = [
  {
    title: '精确转换',
    desc: '支持最多13位数字的精确转换，确保转换结果准确无误'
  },
  {
    title: '标准格式',
    desc: '转换结果符合中文大写金额书写规范，适用于正式场合'
  },
  {
    title: '便捷操作',
    desc: '一键转换、复制功能，提高工作效率'
  }
]

// 适用场景
const usageScenarios = [
  '财务：合同、发票等文件中的金额大写转换',
  '文案：需要将数字转换为中文大写的场景',
  '教学：中文数字书写规范的学习和演示',
  '办公：各类正式文件中的数字大写转换'
]

const tran = () => {
  if (!info.content) {
    ElMessage.warning('请输入需要转换的数字')
    return
  }
  info.tranRes = numberToChinese(parseInt(info.content))
}

const clear = () => {
  info.content = ''
  info.tranRes = ''
}

const copyRes = async (resStr: string) => {
  if (!resStr) {
    ElMessage.warning('暂无内容可复制')
    return
  }
  copy(resStr)
  ElMessage.success('复制成功')
}
</script>

<style scoped>
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
</style>
