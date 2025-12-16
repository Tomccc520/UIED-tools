<template>
  <div class="md5-encrypt-tool">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">MD5 加密工具</h1>
      <p class="text-gray-600">在线 MD5 加密工具，支持 32 位和 16 位加密，大小写可选。</p>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Input Area -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold text-gray-700">输入内容</h2>
          <el-button type="primary" link @click="clearInput">清空</el-button>
        </div>
        <el-input
          v-model="input"
          type="textarea"
          :rows="12"
          placeholder="请输入需要加密的文本内容..."
          resize="none"
          class="font-mono"
        />
      </div>

      <!-- Output Area -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold text-gray-700">加密结果</h2>
        </div>
        
        <div class="space-y-4">
          <!-- 32位 小写 -->
          <div>
            <div class="text-sm text-gray-600 mb-1">32位 (小写)</div>
            <el-input v-model="result32Lower" readonly>
              <template #append>
                <el-button @click="copy(result32Lower)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>

          <!-- 32位 大写 -->
          <div>
            <div class="text-sm text-gray-600 mb-1">32位 (大写)</div>
            <el-input v-model="result32Upper" readonly>
              <template #append>
                <el-button @click="copy(result32Upper)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>

          <!-- 16位 小写 -->
          <div>
            <div class="text-sm text-gray-600 mb-1">16位 (小写)</div>
            <el-input v-model="result16Lower" readonly>
              <template #append>
                <el-button @click="copy(result16Lower)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>

          <!-- 16位 大写 -->
          <div>
            <div class="text-sm text-gray-600 mb-1">16位 (大写)</div>
            <el-input v-model="result16Upper" readonly>
              <template #append>
                <el-button @click="copy(result16Upper)">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-9-22
 */
import { ref, watch } from 'vue'
import CryptoJS from 'crypto-js'
import useClipboard from 'vue-clipboard3'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'

const { toClipboard } = useClipboard()

const input = ref('')
const result32Lower = ref('')
const result32Upper = ref('')
const result16Lower = ref('')
const result16Upper = ref('')

/**
 * 监听输入变化并计算 MD5
 */
watch(input, (newVal) => {
  if (!newVal) {
    result32Lower.value = ''
    result32Upper.value = ''
    result16Lower.value = ''
    result16Upper.value = ''
    return
  }

  // 计算 32 位 MD5
  const md5 = CryptoJS.MD5(newVal).toString()
  
  // 设置 32 位结果
  result32Lower.value = md5
  result32Upper.value = md5.toUpperCase()
  
  // 计算 16 位 MD5 (取 32 位的中间 16 位，即第 9 到 24 位)
  const md5_16 = md5.substring(8, 24)
  result16Lower.value = md5_16
  result16Upper.value = md5_16.toUpperCase()
})

/**
 * 清空输入
 */
const clearInput = () => {
  input.value = ''
}

/**
 * 复制文本
 * @param text 要复制的文本
 */
const copy = async (text: string) => {
  if (!text) return
  try {
    await toClipboard(text)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.md5-encrypt-tool {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
