<!--
 * @file JWT.vue
 * @description JWT解析工具，支持JWT Token的解析和验证
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持JWT Token解析
 * 2. 显示Header和Payload信息
 * 3. Token格式验证
 * 4. 实时解析预览
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
          <p class="text-gray-500 text-sm mt-6">专业的JWT Token解析工具，快速查看Token的Header和Payload信息</p>
        </div>

        <div class="space-y-6">
          <!-- Token输入区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">JWT Token</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <el-input v-model="info.token" :rows="5" type="textarea" placeholder="请输入JWT Token..." @change="parser" />
            </div>
            <div v-if="invalidToken" class="mt-2 text-red-500 text-sm">无效的Token格式</div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex flex-wrap gap-3">
            <el-button type="primary" @click="parser" class="px-6 h-10">解析Token</el-button>
            <el-button @click="clear" class="px-6 h-10">清空输入</el-button>
          </div>

          <!-- 解析结果 -->
          <div v-if="decodeHeader || decodePayload" class="space-y-6">
            <!-- Header部分 -->
            <div v-if="decodeHeader" class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-medium text-gray-700">Header (头部)</h3>
              </div>
              <div class="border rounded-lg overflow-hidden bg-white p-4">
                <el-input v-model="decodeHeader" type="textarea" :rows="4" readonly class="font-mono" />
              </div>
            </div>

            <!-- Payload部分 -->
            <div v-if="decodePayload" class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-medium text-gray-700">Payload (载荷)</h3>
              </div>
              <div class="border rounded-lg overflow-hidden bg-white p-4">
                <el-input v-model="decodePayload" type="textarea" :rows="6" readonly class="font-mono" />
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

        <!-- JWT说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">JWT说明</h3>
          <div class="space-y-6">
            <div class="border-b border-gray-100 pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">什么是JWT？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                JWT (JSON Web Token) 是一个开放标准 (RFC 7519)，用于在各方之间安全地传输信息。每个JWT由Header、Payload和Signature三部分组成。
              </p>
            </div>
            <div class="pb-6">
              <h4 class="text-base font-medium text-gray-800 mb-3">JWT的组成部分</h4>
              <div class="text-sm text-gray-600 space-y-4">
                <div>
                  <p class="font-medium mb-2">1. Header (头部)</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>typ: 声明token的类型，通常为JWT</li>
                    <li>alg: 声明签名算法，如HMAC SHA256或RSA</li>
                  </ul>
                </div>
                <div>
                  <p class="font-medium mb-2">2. Payload (载荷)</p>
                  <ul class="list-disc pl-5 space-y-1">
                    <li>iss (Issuer): 签发者</li>
                    <li>sub (Subject): 主题</li>
                    <li>aud (Audience): 接收者</li>
                    <li>exp (Expiration Time): 过期时间</li>
                    <li>nbf (Not Before): 生效时间</li>
                    <li>iat (Issued At): 签发时间</li>
                    <li>jti (JWT ID): 编号</li>
                  </ul>
                </div>
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
import { ref, reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import { ElMessage } from 'element-plus'

const route = useRoute()

const info = reactive({
  title: "JWT解析工具",
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0b29scy5yYW5ibG9ncy5jb20iLCJzdWIiOiJhcnlhIiwiYXVkIjoidGFvcmFuIiwiaWF0IjoxNzE3MDM2MzMzLCJleHAiOjE3MTcwMzY5MzN9.9v_eDdsPnvcY7qZatNnKvN9VEf7t7o72OgwhLS6gy6w'
})

const decodeHeader = ref('')
const decodePayload = ref('')
const invalidToken = ref(false)

// 功能特点
const features = [
  {
    title: 'Token解析',
    desc: '支持解析任意有效的JWT Token'
  },
  {
    title: '结构化展示',
    desc: '清晰展示Header和Payload部分'
  },
  {
    title: '格式验证',
    desc: '自动验证Token格式的正确性'
  }
]

// 适用场景
const usageScenarios = [
  'API调试：快速查看Token内容',
  '开发测试：验证Token的有效性',
  '问题排查：分析Token结构',
  '安全审计：检查Token信息'
]

// 解析Token
const parser = () => {
  try {
    invalidToken.value = false
    decodePayload.value = JSON.stringify(jwtDecode(info.token), null, 2)
    decodeHeader.value = JSON.stringify(jwtDecode(info.token, { header: true }), null, 2)
    ElMessage({
      message: "解析成功",
      type: "success",
      duration: 1500
    })
  } catch (e) {
    console.log('Invalid token', e)
    invalidToken.value = true
    decodeHeader.value = ''
    decodePayload.value = ''
    ElMessage({
      message: "无效的Token格式",
      type: "error",
      duration: 1500
    })
  }
}

// 清空输入
const clear = () => {
  info.token = ''
  decodeHeader.value = ''
  decodePayload.value = ''
  invalidToken.value = false
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

.el-input.is-disabled .el-input__wrapper {
  background-color: #f9fafb;
}

.el-textarea.is-disabled .el-textarea__inner {
  background-color: #f9fafb;
}
</style>
