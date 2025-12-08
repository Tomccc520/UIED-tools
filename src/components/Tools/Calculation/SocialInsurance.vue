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
        <span class="mr-2">🛡️</span> 五险一金计算器 (2025版)
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">税前月薪 (元)</label>
            <el-input-number v-model="salary" :min="0" :step="100" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">社保缴纳基数 (元)</label>
            <el-input-number v-model="socialBase" :min="0" :step="100" class="w-full" />
            <div class="text-xs text-gray-400 mt-1">如果不确定，通常为税前月薪</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公积金缴纳基数 (元)</label>
            <el-input-number v-model="fundBase" :min="0" :step="100" class="w-full" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">公积金比例 (%)</label>
            <el-input-number v-model="fundRate" :min="5" :max="12" :step="1" class="w-full" />
          </div>

          <div class="pt-4">
            <el-button type="primary" class="w-full" @click="calculate">开始计算</el-button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-800 mb-4">计算结果</h3>

          <div class="space-y-3 text-sm">
            <div class="flex justify-between items-center font-bold">
              <span class="text-gray-700">个人应缴总额:</span>
              <span class="text-red-500">{{ result.totalPersonal }} 元</span>
            </div>
            <div class="flex justify-between items-center pl-4">
              <span class="text-gray-500">养老保险 (8%):</span>
              <span>{{ result.pension }} 元</span>
            </div>
            <div class="flex justify-between items-center pl-4">
              <span class="text-gray-500">医疗保险 (2%):</span>
              <span>{{ result.medical }} 元</span>
            </div>
            <div class="flex justify-between items-center pl-4">
              <span class="text-gray-500">失业保险 (0.5%):</span>
              <span>{{ result.unemployment }} 元</span>
            </div>
            <div class="flex justify-between items-center pl-4">
              <span class="text-gray-500">住房公积金 ({{ fundRate }}%):</span>
              <span>{{ result.fund }} 元</span>
            </div>

            <div class="border-t border-gray-200 my-2"></div>

            <div class="flex justify-between items-center font-bold text-lg">
              <span class="text-gray-800">税后月薪 (预估):</span>
              <span class="text-green-600">{{ result.netSalary }} 元</span>
            </div>
            <div class="text-xs text-gray-400 text-right mt-1">*未扣除个税，仅扣除五险一金</div>
          </div>
        </div>
      </div>

      <div class="mt-8 text-sm text-gray-500">
        <p>说明：计算比例基于一般城市标准（养老8%，医疗2%，失业0.5%），各地政策可能略有差异，结果仅供参考。</p>
      </div>

      <!-- 工具介绍与使用方法 -->
      <div class="mt-8 border-t border-gray-100 pt-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">工具介绍</h3>
            <p class="text-gray-600 leading-relaxed text-sm">
              五险一金计算器（2025版）依据最新社保政策设计，帮助您快速计算个人应缴纳的养老、医疗、失业保险及住房公积金金额。通过精准的税前税后薪资换算，让您清晰掌握每月的实际到手收入，是职场人士薪资管理的必备工具。
            </p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-800 mb-4">使用方法</h3>
            <ol class="list-decimal list-inside text-gray-600 space-y-2 text-sm">
              <li>输入税前月薪：填写您的月度税前工资（单位：元）。</li>
              <li>调整社保基数：默认自动同步税前月薪，可根据实际缴纳基数手动调整。</li>
              <li>调整公积金基数：同样默认同步税前月薪，支持自定义调整。</li>
              <li>设置公积金比例：根据您所在单位的缴纳比例进行设置（5%-12%）。</li>
              <li>点击"开始计算"，即可查看各项保险扣除明细及预计税后月薪。</li>
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
import { ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const salary = ref(10000)
const socialBase = ref(10000)
const fundBase = ref(10000)
const fundRate = ref(12)

// 薪资与基数同步
watch(salary, (newVal) => {
  if (socialBase.value === 0 || socialBase.value === newVal) socialBase.value = newVal
  if (fundBase.value === 0 || fundBase.value === newVal) fundBase.value = newVal
})

const result = reactive({
  pension: '0',
  medical: '0',
  unemployment: '0',
  fund: '0',
  totalPersonal: '0',
  netSalary: '0'
})

const calculate = () => {
  const pension = socialBase.value * 0.08
  const medical = socialBase.value * 0.02
  const unemployment = socialBase.value * 0.005
  const fund = fundBase.value * (fundRate.value / 100)

  const total = pension + medical + unemployment + fund

  result.pension = pension.toFixed(2)
  result.medical = medical.toFixed(2)
  result.unemployment = unemployment.toFixed(2)
  result.fund = fund.toFixed(2)
  result.totalPersonal = total.toFixed(2)
  result.netSalary = (salary.value - total).toFixed(2)
}

// 初始化计算
calculate()
</script>
