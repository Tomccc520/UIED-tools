<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">BMR 基础代谢计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">计算您的基础代谢率(BMR)和每日热量消耗(TDEE)，科学管理身材。</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- 输入表单 -->
            <div class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">性别</label>
                  <div class="flex space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" v-model="form.gender" value="male" class="w-4 h-4 text-blue-600">
                      <span>男</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" v-model="form.gender" value="female" class="w-4 h-4 text-blue-600">
                      <span>女</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                  <input type="number" v-model.number="form.age"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例如：25">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
                  <input type="number" v-model.number="form.height"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例如：175">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
                  <input type="number" v-model.number="form.weight"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例如：65">
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">活动水平</label>
                  <select v-model="form.activity"
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option v-for="level in activityLevels" :key="level.value" :value="level.value">
                      {{ level.label }}
                    </option>
                  </select>
                </div>
              </div>

              <button @click="calculate"
                class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                计算结果
              </button>
            </div>

            <!-- 结果展示 -->
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">计算结果</h3>

              <div v-if="result.bmr" class="space-y-6">
                <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div class="text-sm text-gray-500 mb-1">基础代谢率 (BMR)</div>
                  <div class="text-3xl font-bold text-blue-600">{{ Math.round(result.bmr) }} <span
                      class="text-sm font-normal text-gray-500">大卡/天</span></div>
                  <p class="text-xs text-gray-400 mt-2">身体维持基本生命活动所需热量</p>
                </div>

                <div class="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div class="text-sm text-gray-500 mb-1">每日总消耗 (TDEE)</div>
                  <div class="text-3xl font-bold text-green-600">{{ Math.round(result.tdee) }} <span
                      class="text-sm font-normal text-gray-500">大卡/天</span></div>
                  <p class="text-xs text-gray-400 mt-2">维持当前体重所需的每日热量摄入</p>
                </div>

                <div class="space-y-2">
                  <h4 class="font-medium text-gray-700 text-sm">热量摄入建议：</h4>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">减脂 (减少20%)</span>
                    <span class="font-medium text-orange-600">{{ Math.round(result.tdee * 0.8) }} 大卡</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">增肌 (增加10%)</span>
                    <span class="font-medium text-blue-600">{{ Math.round(result.tdee * 1.1) }} 大卡</span>
                  </div>
                </div>
              </div>

              <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2 opacity-50" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p>输入数据后点击计算</p>
              </div>
            </div>
          </div>

          <!-- 科普信息 -->
          <div class="mt-12 space-y-6">
            <div class="bg-blue-50 p-6 rounded-lg">
              <h3 class="font-bold text-blue-800 mb-2">什么是 BMR 和 TDEE？</h3>
              <p class="text-sm text-blue-800/80 leading-relaxed">
                <strong>BMR (Basal Metabolic
                  Rate)</strong>：基础代谢率，指人体在清醒而又极端安静的状态下，不受肌肉活动、环境温度、食物及精神紧张等影响时的能量代谢率。<br><br>
                <strong>TDEE (Total Daily Energy Expenditure)</strong>：每日总能量消耗，是维持你当前体重每天需要消耗的热量。它包括基础代谢、活动消耗和食物热效应。
              </p>
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
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const form = reactive({
  gender: 'male',
  age: 25,
  height: 175,
  weight: 65,
  activity: 1.2
})

const result = reactive({
  bmr: 0,
  tdee: 0
})

const activityLevels = [
  { value: 1.2, label: '久坐不动 (几乎不运动)' },
  { value: 1.375, label: '轻度活动 (每周运动1-3次)' },
  { value: 1.55, label: '中度活动 (每周运动3-5次)' },
  { value: 1.725, label: '高度活动 (每周运动6-7次)' },
  { value: 1.9, label: '超高活动 (每天剧烈运动/体力工作)' }
]

const calculate = () => {
  // Mifflin-St Jeor 公式
  let bmr = (10 * form.weight) + (6.25 * form.height) - (5 * form.age)

  if (form.gender === 'male') {
    bmr += 5
  } else {
    bmr -= 161
  }

  result.bmr = bmr
  result.tdee = bmr * form.activity
}
</script>
