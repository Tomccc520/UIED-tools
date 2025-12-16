/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">折扣计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">快速计算商品打折后的价格和节省金额。</p>
        </div>

        <div class="max-w-xl mx-auto">
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">原价</label>
                <div class="relative">
                  <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input type="number" v-model.number="originalPrice" class="w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg" placeholder="0.00">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">折扣</label>
                <div class="grid grid-cols-2 gap-4">
                  <div class="relative">
                    <input type="number" v-model.number="discount" class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg" placeholder="8.5">
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">{{ discountMode === 'percent' ? '折' : '%' }}</span>
                  </div>
                  <select v-model="discountMode" class="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="percent">折扣 (如 8.5折)</option>
                    <option value="off">减免 (如 15%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- 结果展示 -->
          <div class="grid grid-cols-2 gap-6">
            <div class="bg-blue-50 p-6 rounded-xl text-center">
              <div class="text-sm text-blue-600 mb-1">折后价</div>
              <div class="text-3xl font-bold text-blue-700">¥ {{ finalPrice }}</div>
            </div>
            <div class="bg-green-50 p-6 rounded-xl text-center">
              <div class="text-sm text-green-600 mb-1">节省</div>
              <div class="text-3xl font-bold text-green-700">¥ {{ savedAmount }}</div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const originalPrice = ref<number | null>(null)
const discount = ref<number | null>(null)
const discountMode = ref<'percent' | 'off'>('percent')

const finalPrice = computed(() => {
  if (!originalPrice.value || !discount.value) return '0.00'
  
  let price = 0
  if (discountMode.value === 'percent') {
    // 8.5折 = 85%
    price = originalPrice.value * (discount.value / 10)
  } else {
    // 15% off
    price = originalPrice.value * (1 - discount.value / 100)
  }
  return price.toFixed(2)
})

const savedAmount = computed(() => {
  if (!originalPrice.value) return '0.00'
  const final = parseFloat(finalPrice.value)
  return (originalPrice.value - final).toFixed(2)
})
</script>