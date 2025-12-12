<template>
  <div class="relationship-calculator">
    <div class="bg-white rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">亲戚称呼计算器</h2>
        <p class="text-gray-500">中国亲戚关系称呼查询，支持互查，逢年过节必备神器</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 输入区域 -->
        <div class="input-section">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">我的性别</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="sex" :value="1" class="w-4 h-4 text-blue-600">
                <span class="ml-2">男</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="sex" :value="0" class="w-4 h-4 text-blue-600">
                <span class="ml-2">女</span>
              </label>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">称呼方式</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="reverse" :value="false" class="w-4 h-4 text-blue-600">
                <span class="ml-2">我称呼对方</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input type="radio" v-model="reverse" :value="true" class="w-4 h-4 text-blue-600">
                <span class="ml-2">对方称呼我</span>
              </label>
            </div>
          </div>

          <div class="mb-6">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium text-gray-700">关系路径</label>
              <button @click="reset" class="text-sm text-gray-500 hover:text-blue-600">重置</button>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg min-h-[60px] text-lg font-medium text-gray-800 break-words">
              {{ pathText ? '我 的 ' + pathText.split('的').join(' 的 ') : '我' }}
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <button v-for="btn in buttons" :key="btn.value" @click="addRelation(btn.value)"
              class="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors shadow-sm text-gray-700">
              {{ btn.label }}
            </button>
            <button @click="undo"
              class="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
              回退
            </button>
          </div>
        </div>

        <!-- 结果区域 -->
        <div class="result-section">
          <div class="bg-blue-50 rounded-xl p-6 h-full">
            <h3 class="text-lg font-bold text-blue-800 mb-4">计算结果</h3>

            <div v-if="results.length > 0">
              <div class="text-3xl font-bold text-blue-600 mb-4">{{ results[0] }}</div>

              <div v-if="results.length > 1" class="space-y-2">
                <p class="text-sm text-gray-500">其他可能的称呼：</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(res, index) in results.slice(1)" :key="index"
                    class="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-gray-100">
                    {{ res }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg class="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>点击左侧按钮开始计算</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用说明 -->
      <div class="mt-12 border-t pt-8">
        <h3 class="text-lg font-bold text-gray-800 mb-4">使用说明</h3>
        <ul class="list-disc list-inside text-gray-600 space-y-2 text-sm">
          <li>选择您的性别（男/女）。</li>
          <li>选择称呼方式：默认为"我称呼对方"，也可切换为"对方称呼我"。</li>
          <li>依次点击关系按钮，构建亲戚关系路径。例如：爸爸 + 的 + 妈妈 = 奶奶。</li>
          <li>点击"回退"可撤销上一步操作，点击"重置"清空所有输入。</li>
          <li>由于各地风俗不同，计算结果仅供参考。</li>
        </ul>
      </div>
    </div>

    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import relationship from 'relationship.js'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const sex = ref(1) // 1男 0女
const reverse = ref(false)
const selectors = ref<string[]>([])

const buttons = [
  { label: '父', value: '爸爸' },
  { label: '母', value: '妈妈' },
  { label: '夫', value: '老公' },
  { label: '妻', value: '老婆' },
  { label: '子', value: '儿子' },
  { label: '女', value: '女儿' },
  { label: '兄', value: '哥哥' },
  { label: '弟', value: '弟弟' },
  { label: '姐', value: '姐姐' },
  { label: '妹', value: '妹妹' }
]

const pathText = computed(() => {
  if (selectors.value.length === 0) return ''
  return selectors.value.join('的')
})

const results = ref<string[]>([])

const calculate = () => {
  if (selectors.value.length === 0) {
    results.value = []
    return
  }

  const options = {
    text: pathText.value,
    sex: sex.value,
    type: 'default',
    reverse: reverse.value
  }

  try {
    const res = relationship(options)
    if (res && res.length > 0) {
      results.value = res
    } else {
      results.value = ['太复杂了，我也不知道叫什么']
    }
  } catch (e) {
    results.value = ['计算出错']
  }
}

const addRelation = (val: string) => {
  selectors.value.push(val)
  calculate()
}

const undo = () => {
  selectors.value.pop()
  calculate()
}

const reset = () => {
  selectors.value = []
  results.value = []
}

watch([sex, reverse], () => {
  calculate()
})
</script>

<style scoped>
.relationship-calculator {
  min-height: calc(100vh - 64px);
}
</style>
