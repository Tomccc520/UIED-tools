<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026.1.27
 */
-->
<script setup lang="ts">
import { ref, watch } from 'vue'
import defaultQrcode from '@/assets/images/qrcode.jpg'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  tips?: string[]
  qrcodeSrc?: string
  inputPlaceholder?: string
  confirmText?: string
  cancelText?: string
}>(), {
  title: '继续使用',
  tips: () => [
    '您已达到免费使用次数限制，为了避免频繁使用或者攻击',
    '请关注我们的公众号回复"密码"获取验证密码。',
    '密码获取后也是免费使用。'
  ],
  qrcodeSrc: defaultQrcode,
  inputPlaceholder: '请输入验证密码',
  confirmText: '验证',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', value: string): void
}>()

const password = ref('')

watch(() => props.modelValue, (value) => {
  if (value) {
    password.value = ''
  }
})

const handleConfirm = () => {
  emit('confirm', password.value)
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleDialogUpdate = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <el-dialog :model-value="modelValue" :title="title" width="400px" :show-close="false"
    @update:model-value="handleDialogUpdate">
    <div class="text-center">
      <div class="mb-6">
        <img :src="qrcodeSrc" alt="公众号二维码" class="w-32 h-32 mx-auto mb-4">
        <p v-for="(tip, index) in tips" :key="index" class="text-gray-600 text-sm">{{ tip }}</p>
      </div>
      <el-input v-model="password" :placeholder="inputPlaceholder" class="mb-4" />
    </div>
    <template #footer>
      <div class="flex justify-end space-x-4">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button type="primary" @click="handleConfirm">{{ confirmText }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>
