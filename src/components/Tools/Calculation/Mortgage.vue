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
        <span class="mr-2">🏠</span> 房贷计算器
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">还款方式</label>
            <el-radio-group v-model="type">
              <el-radio label="principalInterest">等额本息</el-radio>
              <el-radio label="principal">等额本金</el-radio>
            </el-radio-group>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">贷款金额 (万元)</label>
            <el-input-number v-model="amount" :min="0" :step="10" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">贷款期限 (年)</label>
            <el-input-number v-model="years" :min="1" :max="30" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">年利率 (%)</label>
            <el-input-number v-model="rate" :min="0" :step="0.1" :precision="2" class="w-full" />
          </div>

          <div class="pt-4">
            <el-button type="primary" class="w-full" @click="calculate">开始计算</el-button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">计算结果</h3>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">首月月供:</span>
              <span class="font-bold text-green-600 text-xl">{{ result.monthlyPayment }} 元</span>
            </div>
            <div v-if="type === 'principal'" class="text-xs text-gray-500 text-right">
              每月递减: {{ result.monthlyDecrease }} 元
            </div>

            <div class="border-t border-gray-200 my-2"></div>

            <div class="flex justify-between items-center">
              <span class="text-gray-600">贷款总额:</span>
              <span class="font-bold text-gray-800">{{ amount * 10000 }} 元</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">支付利息:</span>
              <span class="font-bold text-red-500">{{ result.totalInterest }} 元</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">还款总额:</span>
              <span class="font-bold text-gray-800">{{ result.totalRepayment }} 元</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-sm text-gray-500">
        <p>说明：等额本息：每月还款额固定，利息逐月减少，本金逐月增加。等额本金：每月还本金固定，利息逐月减少，首月还款最多。</p>
      </div>

      <!-- 工具介绍与使用方法 -->
      <div class="mt-8 border-t border-gray-100 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">工具介绍</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              房贷计算器是一款专业的房贷计算工具，旨在帮助用户快速计算商业贷款、公积金贷款及组合贷款的月供详情。支持等额本息和等额本金两种主流还款方式的对比，能够清晰展示每月还款金额、利息总额及还款总额，是您购房贷款规划的得力助手。
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">使用方法</h3>
            <ol class="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>选择还款方式：等额本息（每月还款额固定）或等额本金（首月还款最多，逐月递减）。</li>
              <li>输入贷款金额：填写您的计划贷款总额（单位：万元）。</li>
              <li>设置贷款期限：选择您的贷款年限（1-30年）。</li>
              <li>输入年利率：填写当前的贷款年利率（%）。</li>
              <li>点击"开始计算"按钮，即可查看详细的月供及利息支出情况。</li>
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
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const type = ref('principalInterest')
const amount = ref(100) // 万元
const years = ref(30)
const rate = ref(3.25)

const result = reactive({
  monthlyPayment: '0',
  monthlyDecrease: '0',
  totalInterest: '0',
  totalRepayment: '0'
})

const calculate = () => {
  const principal = amount.value * 10000
  const months = years.value * 12
  const monthlyRate = rate.value / 100 / 12

  if (type.value === 'principalInterest') {
    // 等额本息
    const x = Math.pow(1 + monthlyRate, months)
    const monthly = (principal * monthlyRate * x) / (x - 1)
    const total = monthly * months

    result.monthlyPayment = monthly.toFixed(2)
    result.monthlyDecrease = '0'
    result.totalRepayment = total.toFixed(2)
    result.totalInterest = (total - principal).toFixed(2)
  } else {
    // 等额本金
    const monthlyPrincipal = principal / months
    const firstMonthInterest = principal * monthlyRate
    const firstMonthTotal = monthlyPrincipal + firstMonthInterest

    const secondMonthInterest = (principal - monthlyPrincipal) * monthlyRate
    const secondMonthTotal = monthlyPrincipal + secondMonthInterest

    const decrease = firstMonthTotal - secondMonthTotal

    const totalInterest = (months + 1) * principal * monthlyRate / 2
    const total = principal + totalInterest

    result.monthlyPayment = firstMonthTotal.toFixed(2)
    result.monthlyDecrease = decrease.toFixed(2)
    result.totalRepayment = total.toFixed(2)
    result.totalInterest = totalInterest.toFixed(2)
  }
}

// 初始化计算
calculate()
</script>
