<!--
 * @file ASCII.vue
 * @description ASCII码转换工具
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
          <p class="text-gray-500 text-sm mt-4">支持字符与ASCII码的双向转换，包括十进制、十六进制和二进制</p>
        </div>

        <!-- 转换区域 -->
        <div class="px-8 pb-8">
          <div class="bg-gray-50 rounded-lg p-6">
            <!-- 字符转ASCII -->
            <div class="mb-8">
              <h3 class="text-lg font-medium text-gray-900 mb-4">字符转ASCII</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">输入字符</label>
                  <div class="flex space-x-4">
                    <el-input v-model="info.charInput" placeholder="请输入要转换的字符" class="flex-1" />
                    <el-button @click="charToAscii" class="px-6 h-10">转换</el-button>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">转换结果</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div class="text-xs text-gray-500 mb-1">十进制</div>
                      <el-input v-model="info.charToDec" readonly class="w-full" />
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 mb-1">十六进制</div>
                      <el-input v-model="info.charToHex" readonly class="w-full" />
                    </div>
                    <div>
                      <div class="text-xs text-gray-500 mb-1">二进制</div>
                      <el-input v-model="info.charToBin" readonly class="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ASCII转字符 -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">ASCII转字符</h3>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">十进制</label>
                    <div class="flex space-x-2">
                      <el-input v-model="info.decInput" placeholder="请输入十进制ASCII码" class="flex-1" />
                      <el-button @click="decToChar" class="px-4 h-10">转换</el-button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">十六进制</label>
                    <div class="flex space-x-2">
                      <el-input v-model="info.hexInput" placeholder="请输入十六进制ASCII码" class="flex-1" />
                      <el-button @click="hexToChar" class="px-4 h-10">转换</el-button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">二进制</label>
                    <div class="flex space-x-2">
                      <el-input v-model="info.binInput" placeholder="请输入二进制ASCII码" class="flex-1" />
                      <el-button @click="binToChar" class="px-4 h-10">转换</el-button>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">转换结果</label>
                  <el-input v-model="info.asciiToChar" readonly class="w-full" />
                </div>
              </div>
            </div>

            <!-- 清空按钮 -->
            <div class="flex justify-center mt-8">
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
              <h4 class="text-base font-medium text-gray-800 mb-3">什么是ASCII码？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                ASCII码是一种字符编码标准，用于表示文本数据。它将每个字符映射到一个特定的数值，包括字母、数字和特殊字符。
              </p>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <h4 class="text-base font-medium text-gray-800 mb-3">为什么需要ASCII码转换？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                在计算机编程、数据通信和字符处理等领域，经常需要在字符和ASCII码之间进行转换，本工具可以快速完成这个过程。
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
  title: 'ASCII码转换工具',
  charInput: '',
  charToDec: '',
  charToHex: '',
  charToBin: '',
  decInput: '',
  hexInput: '',
  binInput: '',
  asciiToChar: ''
})

//功能特点
const features = [
  {
    title: '双向转换',
    desc: '支持字符到ASCII码和ASCII码到字符的双向转换'
  },
  {
    title: '多进制支持',
    desc: '支持十进制、十六进制和二进制ASCII码的转换'
  },
  {
    title: '实时转换',
    desc: '输入后即可一键转换，结果清晰直观'
  }
]

//适用场景
const usageScenarios = [
  '程序开发：处理字符编码和转换',
  '数据通信：分析和处理ASCII数据',
  '教育教学：学习字符编码原理',
  '文本处理：字符和ASCII码的快速转换'
]

//字符转ASCII
const charToAscii = () => {
  if (!info.charInput) {
    return
  }
  const code = info.charInput.charCodeAt(0)
  info.charToDec = code.toString()
  info.charToHex = code.toString(16).toUpperCase()
  info.charToBin = code.toString(2)
}

//十进制ASCII转字符
const decToChar = () => {
  if (!info.decInput) {
    return
  }
  info.asciiToChar = String.fromCharCode(parseInt(info.decInput))
}

//十六进制ASCII转字符
const hexToChar = () => {
  if (!info.hexInput) {
    return
  }
  info.asciiToChar = String.fromCharCode(parseInt(info.hexInput, 16))
}

//二进制ASCII转字符
const binToChar = () => {
  if (!info.binInput) {
    return
  }
  info.asciiToChar = String.fromCharCode(parseInt(info.binInput, 2))
}

//清空
const clear = () => {
  info.charInput = ''
  info.charToDec = ''
  info.charToHex = ''
  info.charToBin = ''
  info.decInput = ''
  info.hexInput = ''
  info.binInput = ''
  info.asciiToChar = ''
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
</style>
