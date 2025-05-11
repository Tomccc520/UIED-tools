<!--
 * @file RegTest.vue
 * @description 正则表达式在线测试工具，支持常用正则匹配和自定义正则测试
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持常用正则表达式快速使用
 * 2. 支持自定义正则表达式测试
 * 3. 支持全局搜索和大小写匹配
 * 4. 实时显示匹配结果
-->

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
          <p class="text-gray-500 text-sm mt-6">专业的正则表达式测试工具，支持多种常用正则和自定义正则测试</p>
        </div>

        <div class="space-y-6">
          <!-- 测试文本区域 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">测试文本</h3>
            </div>
            <div class="border rounded-lg overflow-hidden bg-white">
              <codemirror v-model="info.content" placeholder="在此输入需要测试的文本内容..." :style="{ height: '300px' }"
                :autofocus="true" :indent-with-tab="true" :tabSize="2" />
            </div>
          </div>

          <!-- 常用正则选择 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-base font-medium text-gray-700 mb-4">常用正则</h3>
            <div class="flex flex-wrap gap-2">
              <el-button v-for="(item, index) in info.regList" :key="index" size="small"
                :type="info.reg === item.reg ? 'primary' : 'default'" @click="useReg(item.reg)"
                class="hover:shadow-sm transition-all duration-200">
                {{ item.title }}
              </el-button>
            </div>
          </div>

          <!-- 正则输入和选项 -->
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <el-input v-model="info.reg" class="flex-1" placeholder="输入或选择上方的正则表达式">
                <template #prepend>
                  <span class="whitespace-nowrap">正则表达式</span>
                </template>
              </el-input>
              <el-button type="primary" @click="execMatch" class="px-6 h-10">测试匹配</el-button>
            </div>

            <div class="flex items-center gap-4">
              <el-checkbox v-model="info.isAll" size="large" class="text-gray-700">全局搜索</el-checkbox>
              <el-checkbox v-model="info.isCase" size="large" class="text-gray-700">忽略大小写</el-checkbox>
            </div>
          </div>

          <!-- 匹配结果 -->
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-medium text-gray-700">匹配结果</h3>
              <span class="text-sm text-gray-500">共找到 {{ info.matchNum }} 处匹配</span>
            </div>
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <el-input v-model="info.matchRes" type="textarea" :rows="4" readonly placeholder="匹配结果将在这里显示" />
            </div>
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

        <!-- 常见问题解答 -->
        <div class="mt-12">
          <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
          <div class="space-y-6">
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">什么是正则表达式？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                正则表达式是一种用于匹配字符串中字符组合的模式。它可以用来检查一个字符串是否含有某种子串、将匹配的子串替换或者从某个字符串中取出符合某个条件的子串等。
              </p>
            </div>
            <div class="pb-6 border-b border-gray-200 last:border-0">
              <h4 class="text-base font-medium text-gray-900 mb-3">如何使用全局搜索和忽略大小写？</h4>
              <p class="text-sm text-gray-600 leading-relaxed">
                勾选"全局搜索"选项可以查找所有匹配项，否则只返回第一个匹配项。勾选"忽略大小写"选项可以在匹配时忽略字母的大小写差异。
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 工具推荐 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from '@vue/runtime-core'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { Codemirror } from "vue-codemirror"
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()

const info = reactive({
  title: "正则表达式测试",
  reg: '',
  content: `一些测试实例:
邮箱1：demo@163.com
邮箱2：demo2@163.com
手机号：13012341234
url: https://www.uied.cn/ https://uiedtool.com/
IP: 192.168.0.1
时间：2025-01-14
`,
  matchRes: '',
  matchNum: 0,
  isAll: true,
  isCase: false,
  isParseErr: false,
  parseErr: '',
  regList: [
    {
      id: 1,
      title: '匹配手机号',
      reg: '(13\\d|14[579]|15[^4\\D]|17[^49\\D]|18\\d)\\d{8}'
    },
    {
      id: 2,
      title: '匹配网址URL',
      reg: '(http|ftp|https):\\\/\\\/[\\w\\-_]+(\\.[\\w\\-_]+)+([\\w\\-\\.,@?^=%&:/~\\+#]*[\\w\\-\\@?^=%&/~\\+#])?'
    },
    {
      id: 3,
      title: '匹配Email',
      reg: `\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}`
    },
    {
      id: 4,
      title: '匹配中文字符',
      reg: "[\u4e00-\u9fa5]"
    },
    {
      id: 5,
      title: '匹配双字节字符',
      reg: "[^\x00-\xff]+"
    },
    {
      id: 6,
      title: '匹配身份证号',
      reg: "\\d{17}[0-9Xx]|\\d{15}"
    },
    {
      id: 7,
      title: '匹配整数',
      reg: "[1-9]\\d*"
    },
    {
      id: 8,
      title: '匹配IP(IPV4)',
      reg: "\\d{0,3}\\.\\d{0,3}\\.\\d{0,3}\\.\\d{0,3}"
    },
    {
      id: 9,
      title: '匹配日期',
      reg: "(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)"
    }
  ]
})

// 功能特点
const features = [
  {
    title: '常用正则',
    desc: '内置多种常用正则表达式，一键使用'
  },
  {
    title: '实时测试',
    desc: '支持自定义正则表达式，实时查看匹配结果'
  },
  {
    title: '灵活配置',
    desc: '支持全局搜索和忽略大小写等匹配选项'
  }
]

// 适用场景
const usageScenarios = [
  '表单验证：验证用户输入的邮箱、手机号等',
  '数据提取：从文本中提取特定格式的内容',
  '字符串处理：替换或匹配特定模式的文本',
  '开发调试：测试和验证正则表达式的正确性'
]

//使用正则
const useReg = (reg: string) => {
  info.reg = reg
  ElMessage({
    message: "已选择正则表达式，点击测试匹配查看结果",
    type: "success",
    duration: 1500
  })
}

const clearOldRes = () => {
  info.matchNum = 0
  info.matchRes = ''
}

//测试匹配(执行匹配)
const execMatch = () => {
  //清除旧结果
  clearOldRes()

  //check
  if (!info.reg.trim()) {
    ElMessage({
      message: "请输入或选择正则表达式",
      type: "warning",
      duration: 1500
    })
    return
  }

  if (!info.content.trim()) {
    ElMessage({
      message: "请输入需要测试的文本内容",
      type: "warning",
      duration: 1500
    })
    return
  }

  try {
    let rule = ''
    //是否全局
    rule = info.isAll === true ? 'g' : ''
    //是否区分大小写
    rule += info.isCase === true ? 'i' : ''

    let pattern = new RegExp(info.reg, rule)
    let matchArr = info.content.match(pattern)

    if (info.isAll === true) {
      if (matchArr?.length) {
        info.matchNum = matchArr?.length
        for (let index in matchArr) {
          info.matchRes += matchArr[index] + `\n`
        }
        ElMessage({
          message: `找到 ${info.matchNum} 处匹配`,
          type: "success",
          duration: 1500
        })
      } else {
        ElMessage({
          message: "未找到匹配内容",
          type: "info",
          duration: 1500
        })
      }
    } else {
      if (matchArr?.[0]) {
        info.matchRes = matchArr[0]
        info.matchNum = 1
        ElMessage({
          message: "找到 1 处匹配",
          type: "success",
          duration: 1500
        })
      } else {
        ElMessage({
          message: "未找到匹配内容",
          type: "info",
          duration: 1500
        })
      }
    }
  } catch (error) {
    ElMessage({
      message: "正则表达式语法错误，请检查",
      type: "error",
      duration: 1500
    })
  }
}
</script>

<style scoped>
.cm-editor {
  height: 100%;
}

.cm-editor.cm-focused {
  outline: none;
}

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

.el-input {
  width: auto;
}

.el-input :deep(.el-input-group__append) {
  padding: 0;
}

.el-input :deep(.el-input-group__append .el-button) {
  border: none;
  margin: 0;
  height: 100%;
  padding: 0 1rem;
}

.el-checkbox {
  --el-checkbox-checked-text-color: #374151;
}
</style>
