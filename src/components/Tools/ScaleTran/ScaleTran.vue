<!--
 * @file ScaleTran.vue
 * @description 进制转换工具
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
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
          <p class="text-gray-500 text-sm mt-4">支持二进制、八进制、十进制、十六进制之间的相互转换</p>
        </div>

        <!-- 转换区域 -->
        <div class="px-8 pb-8">
          <div class="bg-gray-50 rounded-lg p-6">
            <!-- 二进制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">二进制</label>
              <div class="flex space-x-4">
                <el-input v-model="info.bin" placeholder="请输入二进制数" class="flex-1">
                  <template #append>
                    <el-button @click="tran('bin')" class="px-4 h-[32px]">转换</el-button>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 八进制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">八进制</label>
              <div class="flex space-x-4">
                <el-input v-model="info.oct" placeholder="请输入八进制数" class="flex-1">
                  <template #append>
                    <el-button @click="tran('oct')" class="px-4 h-[32px]">转换</el-button>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 十进制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">十进制</label>
              <div class="flex space-x-4">
                <el-input v-model="info.dec" placeholder="请输入十进制数" class="flex-1">
                  <template #append>
                    <el-button @click="tran('dec')" class="px-4 h-[32px]">转换</el-button>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 十六进制 -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">十六进制</label>
              <div class="flex space-x-4">
                <el-input v-model="info.hex" placeholder="请输入十六进制数" class="flex-1">
                  <template #append>
                    <el-button @click="tran('hex')" class="px-4 h-[32px]">转换</el-button>
                  </template>
                </el-input>
              </div>
            </div>

            <!-- 清空按钮 -->
            <div class="flex justify-center">
              <el-button @click="clear" class="px-6 h-10">清空所有</el-button>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
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
        </div>

        <!-- 适用场景说明 -->
        <div class="px-8 pb-12">
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

        <!-- 常见问题解答 -->
        <div class="px-8 pb-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题解答</h3>
          <div class="space-y-6">
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">什么是进制转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                进制转换是在不同进位制之间转换数值表示方式的过程。常见的有二进制、八进制、十进制和十六进制。
              </p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">为什么需要进制转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                在计算机科学、数字电路设计等领域经常需要在不同进制之间转换，本工具可以快速准确地完成转换。
              </p>
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
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: '进制转换工具',
  bin: '',
  oct: '',
  dec: '',
  hex: ''
})

//功能特点
const features = [
  {
    title: '多进制支持',
    desc: '支持二进制、八进制、十进制、十六进制之间的相互转换'
  },
  {
    title: '实时转换',
    desc: '输入数值后即可一键转换到其他进制'
  },
  {
    title: '准确可靠',
    desc: '采用标准算法确保转换结果的准确性'
  }
]

//适用场景
const usageScenarios = [
  '程序开发：在不同进制之间转换数值',
  '数字电路：设计和调试数字电路',
  '教育教学：进制转换教学演示',
  '日常计算：快速进行进制转换'
]

const tran = (type: string) => {
  let val = info[type]
  if (val === '') {
    return
  }
  switch (type) {
    case 'bin':
      info.oct = parseInt(val, 2).toString(8)
      info.dec = parseInt(val, 2).toString(10)
      info.hex = parseInt(val, 2).toString(16)
      break;
    case 'oct':
      info.bin = parseInt(val, 8).toString(2)
      info.dec = parseInt(val, 8).toString(10)
      info.hex = parseInt(val, 8).toString(16)
      break;
    case 'dec':
      info.bin = parseInt(val, 10).toString(2)
      info.oct = parseInt(val, 10).toString(8)
      info.hex = parseInt(val, 10).toString(16)
      break;
    case 'hex':
      info.bin = parseInt(val, 16).toString(2)
      info.oct = parseInt(val, 16).toString(8)
      info.dec = parseInt(val, 16).toString(10)
      break;
    default:
      break;
  }
}

const clear = () => {
  info.bin = ''
  info.oct = ''
  info.dec = ''
  info.hex = ''
}
</script>

<style scoped>
.el-input {
  width: auto;
}

.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
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

.el-input-group__append {
  background-color: #fff;
  border-color: #e5e7eb;
  color: #374151;
}

.el-input-group__append:hover {
  color: #3b82f6;
  border-color: #3b82f6;
  background-color: #fff;
}
</style>
