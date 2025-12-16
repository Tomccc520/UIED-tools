<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-08
 */
-->
<template>
  <div class="mx-auto p-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span class="mr-2">🌡️</span> 温度转换器
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Celsius -->
        <div class="bg-blue-50 rounded-lg p-6 flex flex-col items-center">
          <div class="text-lg font-medium text-gray-700 mb-4">摄氏度 (°C)</div>
          <el-input-number v-model="celsius" :precision="2" class="w-full" @input="updateFromCelsius" />
          <div class="mt-4 text-sm text-gray-500 text-center">
            水的冰点: 0°C<br>水的沸点: 100°C
          </div>
        </div>

        <!-- Fahrenheit -->
        <div class="bg-orange-50 rounded-lg p-6 flex flex-col items-center">
          <div class="text-lg font-medium text-gray-700 mb-4">华氏度 (°F)</div>
          <el-input-number v-model="fahrenheit" :precision="2" class="w-full" @input="updateFromFahrenheit" />
          <div class="mt-4 text-sm text-gray-500 text-center">
            水的冰点: 32°F<br>水的沸点: 212°F
          </div>
        </div>

        <!-- Kelvin -->
        <div class="bg-purple-50 rounded-lg p-6 flex flex-col items-center">
          <div class="text-lg font-medium text-gray-700 mb-4">开尔文 (K)</div>
          <el-input-number v-model="kelvin" :precision="2" class="w-full" @input="updateFromKelvin" />
          <div class="mt-4 text-sm text-gray-500 text-center">
            绝对零度: 0 K<br>水的冰点: 273.15 K
          </div>
        </div>
      </div>

      <div class="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 class="font-medium text-gray-800 mb-2">换算公式</h3>
        <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>摄氏度 = (华氏度 - 32) / 1.8</li>
          <li>华氏度 = 摄氏度 * 1.8 + 32</li>
          <li>开尔文 = 摄氏度 + 273.15</li>
        </ul>
      </div>

      <!-- 工具介绍与使用方法 -->
      <div class="mt-8 border-t border-gray-100 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">工具介绍</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              温度转换器是一款简单实用的在线单位换算工具。支持摄氏度(°C)、华氏度(°F)和开尔文(K)三种国际常用温标之间的双向实时转换，适用于日常生活查询、科学研究计算及教学辅助等多种场景。
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">使用方法</h3>
            <ol class="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>输入数值：在任意一个温标的输入框中输入您已知数值。</li>
              <li>实时转换：其他两个输入框会自动显示转换后的对应数值。</li>
              <li>查看公式：底部提供详细的换算公式，方便学习和参考。</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具推荐 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const celsius = ref(25)
const fahrenheit = ref(77)
const kelvin = ref(298.15)

// 摄氏度更新
const updateFromCelsius = (val: number) => {
  if (val === null) return
  celsius.value = val
  fahrenheit.value = val * 1.8 + 32
  kelvin.value = val + 273.15
}

// 华氏度更新
const updateFromFahrenheit = (val: number) => {
  if (val === null) return
  fahrenheit.value = val
  celsius.value = (val - 32) / 1.8
  kelvin.value = (val - 32) / 1.8 + 273.15
}

// 开尔文更新
const updateFromKelvin = (val: number) => {
  if (val === null) return
  kelvin.value = val
  celsius.value = val - 273.15
  fahrenheit.value = (val - 273.15) * 1.8 + 32
}
</script>
