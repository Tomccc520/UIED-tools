<!--
 * @file RandomPassword.vue
 * @description 随机密码生成器，支持自定义字符组合和批量生成
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2025-0114
 *
 * 功能特性：
 * 1. 支持数字、大小写字母、特殊符号组合
 * 2. 自定义密码长度和生成数量
 * 3. 批量生成和一键复制
 * 4. 实时预览生成结果
-->

<script setup lang="ts">
import { reactive, onMounted } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import { copy, genRandomStrByChars } from '@/utils/string'
import { ElMessage } from 'element-plus'

const route = useRoute()

const info = reactive({
  title: "随机密码生成",
  char: '',
  pwLen: 10,
  pwNum: 5,
  resStr: '',
  autosize: {
    minRows: 5
  },
  checkedUpper: true,
  checkedLower: true,
  checkedNum: true,
  checkedSign: false,
  charNum: '0123456789',
  charUpper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  charLower: 'abcdefghijklmnopqrstuvwxyz',
  cahrSign: '~!@#$%^&*()_+',
})

// 功能特点
const features = [
  {
    title: '多种组合',
    desc: '支持数字、大小写字母、特殊符号等多种组合方式'
  },
  {
    title: '批量生成',
    desc: '一次可生成多个不同的密码，提高效率'
  },
  {
    title: '安全可靠',
    desc: '使用随机算法生成，确保密码安全性'
  }
]

// 适用场景
const usageScenarios = [
  '账号注册：生成安全的注册密码',
  '密码更新：定期更换更安全的密码',
  '开发测试：快速生成测试账号密码',
  '安全管理：为不同平台生成独立密码'
]

//生成密码
const gen = () => {
  //包含字符验证
  if (info.char == '') {
    ElMessage({
      message: "包含字符不能为空",
      type: "warning",
      duration: 1500
    })
    return
  }

  //生成长度验证
  if (info.pwLen > 100) {
    ElMessage({
      message: "生成长度范围在1~100",
      type: "warning",
      duration: 1500
    })
    return
  }

  //生成数量验证
  if (info.pwNum > 100) {
    ElMessage({
      message: "生成数量范围在1~100",
      type: "warning",
      duration: 1500
    })
    return
  }

  //清空旧数据
  info.resStr = ''

  //按数量生成密码
  for (let i = 1; i <= info.pwNum; i++) {
    let ext = '\n'
    if (i == info.pwNum) {
      ext = ''
    }
    info.resStr += genRandomStrByChars(info.char, info.pwLen) + ext
  }
}

const changeCheckBox = (val: any, type: number) => {
  switch (type) {
    case 0:
      //设置数字字符
      setChar(val, /\d+/g, info.charNum)
      break;
    case 1:
      //设置小写字母字符
      setChar(val, /[a-z]/g, info.charLower)
      break;
    case 2:
      //设置大写字母字符
      setChar(val, /[A-Z]/g, info.charUpper)
      break;
    case 3:
      //设置特殊符号字符
      setChar(val, /[~!@#$%^&*()_+]/g, info.cahrSign)
      break;
    default:
      info.char = ''
      break;
  }
}

//设置字符
const setChar = (val: boolean, reg: RegExp, charType: string) => {
  if (val == true) {
    //添加
    info.char += charType
  } else {
    //清除
    info.char = info.char.replace(reg, "")
  }
}

//copy
const copyRes = async (resStr: string) => {
  copy(resStr)
}

onMounted(() => {
  //设置初始字符
  changeCheckBox(info.checkedNum, 0)
  changeCheckBox(info.checkedLower, 1)
  changeCheckBox(info.checkedUpper, 2)
  changeCheckBox(info.checkedSign, 3)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 标题区域 -->
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">安全可靠的密码生成工具，支持多种字符组合</p>
        </div>

        <!-- 密码配置区域 -->
        <div class="space-y-6">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-base font-medium text-gray-700 mb-4">密码组合</h3>
            <div class="space-y-4">
              <div class="flex flex-wrap gap-4">
                <el-checkbox v-model="info.checkedNum" label="数字 (0-9)"
                  @change="(val: any) => (changeCheckBox(val, 0))" />
                <el-checkbox v-model="info.checkedLower" label="小写字母 (a-z)"
                  @change="(val: any) => (changeCheckBox(val, 1))" />
                <el-checkbox v-model="info.checkedUpper" label="大写字母 (A-Z)"
                  @change="(val: any) => (changeCheckBox(val, 2))" />
                <el-checkbox v-model="info.checkedSign" label="特殊符号 (~!@#$%^&*+)"
                  @change="(val: any) => (changeCheckBox(val, 3))" />
              </div>
              <el-input v-model="info.char" readonly class="bg-white">
                <template #prepend>已选字符</template>
              </el-input>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <el-input v-model="info.pwLen" placeholder="范围1~100" type="number" class="shadow-sm">
              <template #prepend>密码长度</template>
            </el-input>
            <el-input v-model="info.pwNum" placeholder="范围1~100" type="number" class="shadow-sm">
              <template #prepend>生成数量</template>
            </el-input>
          </div>

          <div class="flex space-x-4">
            <el-button type="primary" @click="gen" class="px-6 h-10">生成密码</el-button>
            <el-button type="primary" plain @click="copyRes(info.resStr)" class="px-6 h-10">复制全部</el-button>
          </div>

          <!-- 结果显示 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">生成结果</h3>
              <span class="text-sm text-gray-500">每行一个密码</span>
            </div>
            <el-input v-model="info.resStr" type="textarea" :autosize="info.autosize" readonly
              placeholder="生成的密码将显示在这里..." class="font-mono bg-white" />
          </div>
        </div>

        <!-- 功能说明区域 -->
        <div class="mt-12 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="(feature, index) in features" :key="index" class="border border-gray-100 rounded-lg p-6">
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
        </div>

        <!-- 适用场景说明 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">适用场景</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(text, index) in usageScenarios" :key="index" class="flex items-start space-x-3">
              <div class="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p class="text-sm text-gray-600">{{ text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.el-input :deep(.el-input__inner) {
  border-color: #e5e7eb;
}

.el-input :deep(.el-input__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-textarea :deep(.el-textarea__inner) {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 1rem;
  border-color: #e5e7eb;
}

.el-textarea :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.el-button {
  font-weight: 500;
  transition: all 0.2s;
}

.el-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.el-checkbox {
  margin-right: 0;
}
</style>
