<!--
 * @file Dice.vue
 * @description 投骰子工具，提供随机骰子点数生成功能
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持1-6个骰子同时投掷
 * 2. 真实的骰子旋转动画
 * 3. 完全随机的点数生成
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
          <p class="text-gray-500 text-sm mt-4">需要随机决定？让骰子来帮你做选择！</p>
        </div>

        <div class="px-8 pb-8">
          <!-- 骰子区域 -->
          <div class="flex flex-col items-center justify-center">
            <div
              class="flex flex-wrap justify-center items-center min-h-[320px] w-full max-w-2xl mx-auto bg-gray-50 rounded-xl p-6">
              <DiceCore ref="diceRef" v-for="i in diceNum" :key="resetDiceKey" :class="[
                diceNum == 1 ? 'dice_full' : '',
                diceNum == 3 && i == 1 ? 'dice_full' : 'dice_default',
                diceNum == 5 && i == 3 ? 'dice_full' : 'dice_default'
              ]" />
            </div>

            <!-- 骰子数量控制 -->
            <div class="w-full max-w-xl mx-auto mt-8 bg-gray-50 rounded-xl p-6">
              <div class="flex items-center justify-center space-x-4">
                <span class="text-gray-700 font-medium">骰子数量：</span>
                <el-slider v-model="diceNum" :min="1" :max="6" :step="1" blockSize="18" :showValue="true"
                  class="flex-1" />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-center space-x-4 mt-8">
              <el-button @click="shake" type="primary" :disabled="genStatus" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
                {{ genStatus ? '投掷中...' : '投骰子' }}
              </el-button>
              <el-button @click="resetDice" type="default" size="large"
                class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
                重置
              </el-button>
            </div>
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="px-8 pb-12">
          <!-- 功能点 -->
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

          <!-- 适用场景说明 -->
          <div class="mt-8">
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

          <!-- 使用说明 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 mb-6">使用说明</h3>
            <div class="space-y-6">
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">如何使用？</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>1. 使用滑块选择需要的骰子数量（1-6个）</p>
                  <p>2. 点击"投骰子"按钮开始投掷</p>
                  <p>3. 等待动画结束，查看结果</p>
                  <p>4. 需要重新开始可以点击"重置"按钮</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 每次投掷都是完全随机的</p>
                  <p>- 投掷过程中请等待动画结束</p>
                  <p>- 支持同时投掷多个骰子</p>
                </div>
              </div>
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
import { ref, reactive } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import DiceCore from "@/components/Tools/Dice/DiceCore.vue"
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "骰子决策器",
})

const diceNum = ref(1)
const genStatus = ref(false)
const diceRef = ref()
const resetDiceKey = ref(0)

// 功能特点
const features = [
  {
    title: '多骰子支持',
    desc: '支持1-6个骰子同时投掷，满足不同场景需求'
  },
  {
    title: '真实动画',
    desc: '逼真的骰子旋转效果，提供沉浸式体验'
  },
  {
    title: '随机公平',
    desc: '采用随机算法，确保每个点数概率相等'
  }
]

// 适用场景
const usageScenarios = [
  '游戏：需要随机决定点数或顺序',
  '教学：概率和统计的实际演示',
  '团队：需要随机分配任务或角色',
  '娱乐：增添趣味性的随机选择工具'
]

const shake = async () => {
  genStatus.value = true

  let res = await new Promise((resolve) => {
    for (let i = 0; i < diceNum.value; i++) {
      diceRef.value[i].throwDice()
    }
    resolve(true)
  })

  setTimeout(() => {
    console.log(res)
    genStatus.value = false
  }, 1200)
}

const resetDice = () => {
  resetDiceKey.value++
}
</script>

<style scoped>
.dice_default {
  flex: 0 0 50%;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.dice_full {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
}

.el-slider :deep(.el-slider__button) {
  border-color: #3b82f6;
}

.el-slider :deep(.el-slider__bar) {
  background-color: #3b82f6;
}
</style>
