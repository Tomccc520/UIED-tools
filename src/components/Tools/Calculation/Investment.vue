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
        <span class="mr-2">📈</span> 投资收益计算器
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">初始本金 (元)</label>
            <el-input-number v-model="principal" :min="0" :step="1000" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">定期定投 (元/月)</label>
            <el-input-number v-model="monthlyContribution" :min="0" :step="100" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">年化收益率 (%)</label>
            <el-input-number v-model="rate" :min="0" :step="0.1" :precision="2" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">投资年限 (年)</label>
            <el-input-number v-model="years" :min="1" :max="50" class="w-full" />
          </div>

          <div class="pt-4">
            <el-button type="primary" class="w-full" @click="calculate">开始计算</el-button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">计算结果</h3>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">总投入本金:</span>
              <span class="font-bold text-gray-800">{{ result.totalPrincipal }} 元</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">累计收益:</span>
              <span class="font-bold text-green-600">{{ result.totalInterest }} 元</span>
            </div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">期末总资产:</span>
              <span class="font-bold text-blue-600 text-xl">{{ result.totalAmount }} 元</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-sm text-gray-500">
        <p>说明：计算结果基于复利公式，假设收益率固定且利息再投资。实际收益可能因市场波动而有所不同。</p>
      </div>

      <!-- 工具介绍与使用方法 -->
      <div class="mt-8 border-t border-gray-100 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">工具介绍</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              投资收益计算器是一款基于复利原理的理财规划工具。支持一次性投资和定期定投两种模式的组合计算，帮助您预测在不同收益率和时间跨度下的资产增值情况，让您更直观地感受"时间的玫瑰"，辅助您制定合理的长期理财目标。
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">使用方法</h3>
            <ol class="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>输入初始本金：填写您目前已有的投资金额（单位：元）。</li>
              <li>设置定期定投：填写您计划每月固定投入的金额（单位：元/月）。</li>
              <li>输入年化收益率：填写预期的年化投资回报率（%）。</li>
              <li>设置投资年限：填写您计划坚持投资的年数。</li>
              <li>点击"开始计算"，即可查看总投入、累计收益及期末总资产。</li>
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

const principal = ref(10000)
const monthlyContribution = ref(1000)
const rate = ref(5)
const years = ref(10)

const result = reactive({
  totalPrincipal: '0',
  totalInterest: '0',
  totalAmount: '0'
})

const calculate = () => {
  const r = rate.value / 100 / 12
  const n = years.value * 12

  // 本金终值
  const fvPrincipal = principal.value * Math.pow(1 + r, n)

  // 定投终值
  let fvSeries = 0
  if (r > 0) {
    fvSeries = monthlyContribution.value * ((Math.pow(1 + r, n) - 1) / r)
  } else {
    fvSeries = monthlyContribution.value * n
  }

  const totalVal = fvPrincipal + fvSeries
  const totalPrin = principal.value + (monthlyContribution.value * n)

  result.totalPrincipal = totalPrin.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  result.totalAmount = totalVal.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  result.totalInterest = (totalVal - totalPrin).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// Initial calculation
calculate()
</script>
