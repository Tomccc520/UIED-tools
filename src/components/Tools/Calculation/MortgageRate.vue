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
        <span class="mr-2">📊</span> 房贷利率调整计算器
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">贷款总额 (万元)</label>
            <el-input-number v-model="loanAmount" :min="0" :step="10" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">剩余期限 (年)</label>
            <el-input-number v-model="years" :min="1" :max="30" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">原利率 (%)</label>
            <el-input-number v-model="oldRate" :min="0" :step="0.1" :precision="2" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">新利率 (%)</label>
            <el-input-number v-model="newRate" :min="0" :step="0.1" :precision="2" class="w-full" />
          </div>

          <div class="pt-4">
            <el-button type="primary" class="w-full" @click="calculate">开始计算</el-button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">计算结果</h3>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">原月供:</span>
              <span class="font-bold text-gray-800">{{ result.oldMonthlyPayment }} 元</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">新月供:</span>
              <span class="font-bold text-green-600">{{ result.newMonthlyPayment }} 元</span>
            </div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">每月少还:</span>
              <span class="font-bold text-red-500">{{ result.monthlySave }} 元</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">累计节省利息:</span>
              <span class="font-bold text-red-500">{{ result.totalSave }} 元</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-sm text-gray-500">
        <p>说明：计算结果仅供参考，实际执行以银行审批为准。默认采用等额本息还款方式计算。</p>
      </div>

      <!-- 工具介绍与使用方法 -->
      <div class="mt-8 border-t border-gray-100 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">工具介绍</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              房贷利率调整计算器帮助您快速计算房贷利率调整前后的月供变化。通过对比原利率和新利率下的月供金额和总利息支出，直观展示利率下调带来的实惠，助您更清晰地了解房贷调整的影响。
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">使用方法</h3>
            <ol class="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>输入贷款总额：填写您当前的剩余贷款本金（单位：万元）。</li>
              <li>设置剩余期限：输入您剩余的还款年限。</li>
              <li>输入原利率：填写调整前的贷款年利率（%）。</li>
              <li>输入新利率：填写调整后的贷款年利率（%）。</li>
              <li>点击"开始计算"，即可查看月供变化和累计节省的利息。</li>
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
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { calculateMortgage } from '@/utils/mortgage'

const route = useRoute()

const loanAmount = ref(100) // 万元
const years = ref(20)
const oldRate = ref(4.2)
const newRate = ref(3.3)

const result = reactive({
  oldMonthlyPayment: '0',
  newMonthlyPayment: '0',
  monthlySave: '0',
  totalSave: '0'
})

/** 对比新旧年利率的等额本息月供；任一输入无效时保留原结果并提示。 */
const calculate = () => {
  try {
    if (!Number.isFinite(loanAmount.value)) throw new Error('请输入有效的贷款金额')
    if (!Number.isFinite(years.value)) throw new Error('请输入有效的贷款期限')
    const principal = loanAmount.value * 10000
    const months = years.value * 12
    const oldLoan = calculateMortgage(principal, months, oldRate.value)
    const newLoan = calculateMortgage(principal, months, newRate.value)
    result.oldMonthlyPayment = oldLoan.monthlyPayment.toFixed(2)
    result.newMonthlyPayment = newLoan.monthlyPayment.toFixed(2)
    result.monthlySave = (oldLoan.monthlyPayment - newLoan.monthlyPayment).toFixed(2)
    result.totalSave = (oldLoan.totalRepayment - newLoan.totalRepayment).toFixed(2)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '计算失败，请检查输入后重试')
  }
}

// 初始化计算
calculate()
</script>
