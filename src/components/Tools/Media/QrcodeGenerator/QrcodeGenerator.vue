<!--
 * @file QrcodeGenerator.vue
 * @description 二维码生成器，支持自定义颜色、大小、容错率
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Download, Refresh } from '@element-plus/icons-vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'

const content = ref('')
const qrcodeUrl = ref('')
const size = ref(200)
const margin = ref(1)
const colorDark = ref('#000000')
const colorLight = ref('#ffffff')
const errorCorrectionLevel = ref('M') // L, M, Q, H

const generateQrcode = async () => {
  if (!content.value) {
    qrcodeUrl.value = ''
    return
  }
  
  try {
    qrcodeUrl.value = await QRCode.toDataURL(content.value, {
      width: size.value,
      margin: margin.value,
      color: {
        dark: colorDark.value,
        light: colorLight.value
      },
      errorCorrectionLevel: errorCorrectionLevel.value as any
    })
  } catch (err) {
    console.error(err)
    ElMessage.error('生成二维码失败')
  }
}

watch([content, size, margin, colorDark, colorLight, errorCorrectionLevel], () => {
  generateQrcode()
})

const downloadQrcode = () => {
  if (!qrcodeUrl.value) return
  
  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrcodeUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const reset = () => {
  content.value = ''
  qrcodeUrl.value = ''
  size.value = 200
  margin.value = 1
  colorDark.value = '#000000'
  colorLight.value = '#ffffff'
  errorCorrectionLevel.value = 'M'
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm">
        <div class="text-center py-8 px-4">
          <h2 class="text-3xl font-bold mb-3 text-gray-800">二维码生成器</h2>
          <p class="text-gray-500 text-sm mt-4">在线生成自定义二维码，支持颜色、大小设置</p>
        </div>

        <div class="px-8 pb-8">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Settings -->
            <div class="flex-1 space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <el-input
                  v-model="content"
                  type="textarea"
                  :rows="4"
                  placeholder="输入文本或网址..."
                  resize="none"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                 <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">尺寸 (px)</label>
                  <el-input-number v-model="size" :min="100" :max="1000" :step="10" class="w-full" />
                </div>
                 <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">边距</label>
                  <el-input-number v-model="margin" :min="0" :max="10" class="w-full" />
                </div>
              </div>

               <div class="grid grid-cols-2 gap-4">
                 <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">前景色</label>
                  <el-color-picker v-model="colorDark" />
                </div>
                 <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">背景色</label>
                  <el-color-picker v-model="colorLight" />
                </div>
              </div>
              
               <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">容错率</label>
                  <el-radio-group v-model="errorCorrectionLevel">
                    <el-radio-button label="L">低 (7%)</el-radio-button>
                    <el-radio-button label="M">中 (15%)</el-radio-button>
                    <el-radio-button label="Q">高 (25%)</el-radio-button>
                    <el-radio-button label="H">极高 (30%)</el-radio-button>
                  </el-radio-group>
                </div>
                
                <div class="pt-4">
                   <el-button @click="reset">
                    <el-icon class="mr-1"><Refresh /></el-icon>重置
                  </el-button>
                </div>
            </div>

            <!-- Preview -->
            <div class="w-full md:w-1/3 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="bg-white p-2 shadow-sm mb-6" v-if="qrcodeUrl">
                <img :src="qrcodeUrl" alt="QR Code" class="max-w-full h-auto" />
              </div>
               <div v-else class="text-gray-400 text-center mb-6 py-12">
                输入内容后生成二维码
              </div>
              
              <el-button type="primary" size="large" @click="downloadQrcode" :disabled="!qrcodeUrl">
                <el-icon class="mr-1"><Download /></el-icon>下载图片
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend />
  </div>
</template>
