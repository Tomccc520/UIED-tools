<!--
 * @file Decision.vue
 * @description 决策助手工具，帮助用户快速做出选择
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 预设场景选择
 * 2. 自定义选项支持
 * 3. 动态决策效果
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
          <p class="text-gray-500 text-sm mt-4">选择困难症患者的福音！由我来帮你做决定，支持预设场景和自定义选项</p>
        </div>

        <div class="px-8 pb-8">
          <!-- 场景选择 -->
          <div class="bg-gray-50 rounded-xl p-8 mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">选择场景</h3>
            <el-radio-group v-model="info.checked" @change="changeCheckBox" class="flex flex-wrap gap-4">
              <el-radio label="0" size="large" class="!mr-0">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span>吃什么</span>
                </div>
              </el-radio>
              <el-radio label="1" size="large" class="!mr-0">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span>干什么</span>
                </div>
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 选项输入 -->
          <div class="bg-gray-50 rounded-xl p-8 mb-8">
            <h3 class="text-lg font-medium text-gray-800 mb-4">选项列表</h3>
            <div class="relative">
              <el-input type="textarea" v-model="info.scope" :rows="5" placeholder="请输入选项，多个选项用英文逗号分隔"
                class="!font-normal" />
              <p class="mt-2 text-sm text-gray-500">提示：多个选项请用英文逗号 "," 分隔</p>
            </div>
          </div>

          <!-- 结果展示 -->
          <div v-if="info.randomVal" class="mb-8 w-full py-12 bg-gray-50 rounded-xl shadow-sm">
            <div class="text-center">
              <span class="text-5xl font-medium text-gray-900">{{ info.randomVal }}</span>
              <p class="mt-4 text-sm text-gray-500">这是为您选择的结果</p>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-center space-x-4">
            <el-button @click="choose" type="primary" :disabled="chooseStatus" size="large"
              class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
              {{ chooseStatus ? '决定中...' : '帮我决定' }}
            </el-button>
            <el-button @click="clear" size="large"
              class="w-[140px] !h-[44px] shadow-sm hover:shadow-md transition-shadow duration-300">
              清空
            </el-button>
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
                  <p>1. 选择预设场景（吃什么/干什么）或自定义选项</p>
                  <p>2. 如需自定义，在文本框中输入选项，用英文逗号分隔</p>
                  <p>3. 点击"帮我决定"按钮，等待系统为您选择</p>
                </div>
              </div>
              <div class="bg-white rounded-lg p-6 shadow-sm">
                <h4 class="text-base font-medium text-gray-800 mb-3">注意事项</h4>
                <div class="text-sm text-gray-600 space-y-2">
                  <p>- 多个选项必须用英文逗号分隔</p>
                  <p>- 选项内容不能为空</p>
                  <p>- 决定过程中会有动画效果，请等待结果</p>
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
import { reactive, onMounted, ref } from '@vue/runtime-core'
import { useRoute } from "vue-router"
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

const info = reactive({
  title: "决策助手",
  scope: '', //多个用`,`隔开
  randomVal: '',
  checked: '0',
  food: '沙县,烧腊,小炒肉,兰州拉面,汤饭,黄焖鸡,卤肉饭,蛋炒饭,羊肉粉,螺蛳粉,猪脚饭,白切鸡,肯德基,火锅,烧烤,泡面,西北风,煎饼果子',
  subject: '电影,听音乐,游戏,逛街,看电视,睡觉,吃饭,清洁,锻炼,学习,发呆,散步,购物,回家,唱歌',
})

const chooseStatus = ref(false)

// 功能特点
const features = [
  {
    title: '场景预设',
    desc: '内置常用场景选项，快速开始决策'
  },
  {
    title: '自定义选项',
    desc: '支持自定义选项列表，满足个性化需求'
  },
  {
    title: '随机决策',
    desc: '采用随机算法，公平公正做出选择'
  }
]

// 适用场景
const usageScenarios = [
  '日常饮食：纠结今天吃什么',
  '休闲娱乐：不知道做什么消遣',
  '团队活动：集体决策难以统一',
  '个人规划：面对多个选择难以抉择'
]

const changeCheckBox = (val: string) => {
  switch (val) {
    case '0':
      info.scope = info.food
      break;
    case '1':
      info.scope = info.subject
      break;
    default:
      info.scope = ''
      break;
  }
}

const init = () => {
  changeCheckBox(info.checked)
}

//选择
const choose = () => {
  if (!info.scope.trim()) {
    ElMessage.warning('请先输入选项')
    return
  }

  chooseStatus.value = true
  let count = 0
  let scopeList = info.scope.split(',').filter(item => item.trim())

  if (scopeList.length === 0) {
    ElMessage.warning('请输入有效的选项')
    chooseStatus.value = false
    return
  }

  const chooseInterval = setInterval(() => {
    const randomNum = Math.floor(Math.random() * scopeList.length)
    info.randomVal = scopeList[randomNum]
    count++
    if (count > 10) {
      clearTimeout(chooseInterval)
      chooseStatus.value = false
    }
  }, 50)
}

//clear
const clear = () => {
  info.scope = ''
  info.checked = ''
  info.randomVal = ''
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.el-radio {
  --el-radio-text-color: #374151;
  --el-radio-font-weight: 500;
  --el-radio-input-border-color: #d1d5db;
}

.el-radio.is-checked {
  --el-radio-text-color: #3b82f6;
  --el-radio-input-border-color: #3b82f6;
}

.el-button--primary {
  --el-button-bg-color: #3b82f6;
  --el-button-border-color: #3b82f6;
  --el-button-hover-bg-color: #60a5fa;
  --el-button-hover-border-color: #60a5fa;
  --el-button-active-bg-color: #2563eb;
  --el-button-active-border-color: #2563eb;
}
</style>
