<!--
 * @file UUID.vue
 * @description UUID生成器，支持批量生成UUID
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持批量生成UUID
 * 2. 支持一键复制
 * 3. 自定义生成数量
-->

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
          <p class="text-gray-500 text-sm mt-6">快速便捷的UUID生成工具，支持批量生成</p>
        </div>

        <div class="space-y-6">
          <!-- 生成设置 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">生成设置</h3>
            </div>
            <el-input v-model="info.pwNum" placeholder="请输入生成数量（1-100）" class="!w-64 shadow-sm" max="100" type="number">
              <template #prepend>数量</template>
            </el-input>
          </div>

          <div class="flex space-x-4">
            <el-button type="primary" @click="gen" class="px-6 h-10">生成UUID</el-button>
            <el-button type="primary" plain @click="copyRes(info.resStr)" class="px-6 h-10">复制全部</el-button>
          </div>

          <!-- 结果显示 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">生成结果</h3>
              <span class="text-sm text-gray-500">每行一个UUID</span>
            </div>
            <el-input type="textarea" :autosize="info.autosize" v-model="info.resStr" class="font-mono bg-white"
              readonly />
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
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是UUID？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">UUID（通用唯一识别码）是一个128位的标识符，用于在分布式系统中唯一标识信息，不依赖中央注册。</p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">UUID的应用场景有哪些？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">UUID常用于数据库主键、分布式系统中的唯一标识、文件命名等场景，能有效避免重复和冲突。</p>
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
import { reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { copy } from '@/utils/string'
import { ElMessage } from 'element-plus'
import * as uuid from 'uuid'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "UUID生成器",
  resStr: '',
  pwNum: 1,
  autosize: {
    minRows: 5
  },
})

// 功能特点
const features = [
  {
    title: '批量生成',
    desc: '支持一次生成多个UUID，提高效率'
  },
  {
    title: '标准格式',
    desc: '生成符合RFC 4122标准的UUID'
  },
  {
    title: '便捷操作',
    desc: '支持一键复制，方便使用'
  }
]

// 适用场景
const usageScenarios = [
  '数据库：生成唯一主键',
  '分布式系统：生成唯一标识',
  '文件系统：生成唯一文件名',
  '应用开发：生成唯一会话ID'
]

//生成
const gen = () => {
  //生成数量验证
  if (info.pwNum > 100) {
    ElMessage({
      message: "生成数量范围在1~100",
      type: "warning",
      duration: 1500
    })
    return
  }
  //清空旧数据
  info.resStr = ''

  //按数量生成UUID
  for (let i = 1; i <= info.pwNum; i++) {
    let ext = '\n'
    if (i == info.pwNum) {
      ext = ''
    }
    info.resStr += uuid.v4() + ext
  }
}

//copy
const copyRes = async (resStr: string) => {
  if (!resStr) {
    ElMessage({
      message: "没有可复制的内容",
      type: "warning",
      duration: 1500
    })
    return
  }
  copy(resStr)
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1500
  })
}
</script>

<style scoped>
.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1rem;
  border-color: #e5e7eb;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.el-input {
  width: auto;
}
</style>
