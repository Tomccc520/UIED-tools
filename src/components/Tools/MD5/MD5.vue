<!--
 * @file MD5.vue
 * @description MD5在线加密工具，支持32位和16位加密
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持32位和16位MD5加密
 * 2. 支持大小写输出
 * 3. 一键复制加密结果
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
          <p class="text-gray-500 text-sm mt-6">快速便捷的MD5加密工具，支持多种格式输出</p>
        </div>

        <div class="space-y-6">
          <!-- 输入区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">输入内容</h3>
            </div>
            <el-input v-model="info.encryptStr" :rows="5" type="textarea" placeholder="请输入需要加密的内容" class="bg-white" />
          </div>

          <!-- 操作按钮 -->
          <div class="flex space-x-4">
            <el-button type="primary" @click="encrypt()" class="px-6 h-10">加密</el-button>
            <el-button type="danger" plain @click="clear()" class="px-6 h-10">清空内容</el-button>
          </div>

          <!-- 结果显示 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">加密结果</h3>
            </div>
            <div class="space-y-4">
              <el-input :value="info.encryptUpper32" readonly class="shadow-sm">
                <template #prepend>
                  <span class="min-w-20">32位大写</span>
                </template>
                <template #append>
                  <el-button @click="copyRes(info.encryptUpper32)" class="hover:bg-gray-50">复制</el-button>
                </template>
              </el-input>

              <el-input :value="info.encryptLower32" readonly class="shadow-sm">
                <template #prepend>
                  <span class="min-w-20">32位小写</span>
                </template>
                <template #append>
                  <el-button @click="copyRes(info.encryptLower32)" class="hover:bg-gray-50">复制</el-button>
                </template>
              </el-input>

              <el-input :value="info.encryptUpper16" readonly class="shadow-sm">
                <template #prepend>
                  <span class="min-w-20">16位大写</span>
                </template>
                <template #append>
                  <el-button @click="copyRes(info.encryptUpper16)" class="hover:bg-gray-50">复制</el-button>
                </template>
              </el-input>

              <el-input :value="info.encryptLower16" readonly class="shadow-sm">
                <template #prepend>
                  <span class="min-w-20">16位小写</span>
                </template>
                <template #append>
                  <el-button @click="copyRes(info.encryptLower16)" class="hover:bg-gray-50">复制</el-button>
                </template>
              </el-input>
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
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是MD5加密？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                MD5是一种常用的哈希算法，可以将任意长度的数据转换为固定长度（128位/32字符）的字符串，通常用于数据完整性校验和密码加密。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">16位和32位MD5有什么区别？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                32位MD5是完整的MD5值，16位MD5是32位MD5值的中间16位。16位MD5相对32位来说，加密强度较低但运算速度更快。
              </p>
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
import { ref, reactive } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { ElMessage } from 'element-plus'
import { Md5 } from 'ts-md5'
import { copy } from '@/utils/string'

const route = useRoute()

const info = reactive({
  title: 'MD5在线加密工具',
  encryptStr: '',
  encryptUpper32: '',
  encryptLower32: '',
  encryptUpper16: '',
  encryptLower16: ''
})

const features = [
  {
    title: '多种格式支持',
    desc: '支持32位和16位MD5加密，同时提供大小写两种格式输出'
  },
  {
    title: '实时加密',
    desc: '输入内容后一键加密，结果立即显示，操作简单快捷'
  },
  {
    title: '一键复制',
    desc: '加密结果支持一键复制，方便快速使用'
  }
]

const usageScenarios = [
  '密码加密：用于用户密码的加密存储，提高数据安全性',
  '文件校验：计算文件的MD5值，验证文件完整性',
  '数据验证：确保数据在传输过程中未被篡改',
  '身份认证：作为身份验证的一种方式'
]

const encrypt = () => {
  if (!info.encryptStr) {
    ElMessage.warning('请输入需要加密的内容')
    return
  }

  const md5Value = Md5.hashStr(info.encryptStr)
  info.encryptUpper32 = md5Value.toString().toUpperCase()
  info.encryptLower32 = md5Value.toString().toLowerCase()
  info.encryptUpper16 = md5Value.toString().substr(8, 16).toUpperCase()
  info.encryptLower16 = md5Value.toString().substr(8, 16).toLowerCase()
}

const clear = () => {
  info.encryptStr = ''
  info.encryptUpper32 = ''
  info.encryptLower32 = ''
  info.encryptUpper16 = ''
  info.encryptLower16 = ''
}

const copyRes = async (text: string) => {
  if (!text) {
    ElMessage.warning('请先进行加密')
    return
  }
  await copy(text)
  ElMessage.success('复制成功')
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

.el-input :deep(.el-input-group__append) {
  padding: 0;
}

.el-input :deep(.el-input-group__append .el-button) {
  border: none;
  margin: 0;
  height: 100%;
  padding: 0 1rem;
}
</style>
