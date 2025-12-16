<!--
 * @file DocSpec.vue
 * @description 常用文档规范指南，提供公文写作、文档排版的尺寸、字体和布局规范
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref } from 'vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeTab = ref('layout')

const specs = {
  layout: {
    title: '页面设置 (Page Setup)',
    items: [
      { label: 'A4纸张尺寸', value: '210mm × 297mm' },
      { label: '页边距 (上/下)', value: '3.7cm / 3.5cm' },
      { label: '页边距 (左/右)', value: '2.8cm / 2.6cm' },
      { label: '版心尺寸', value: '156mm × 225mm' },
    ]
  },
  typography: {
    title: '字体规范 (Typography)',
    items: [
      { label: '主标题 (Title)', value: '方正小标宋简体 二号' },
      { label: '一级标题 (H1)', value: '黑体 三号' },
      { label: '二级标题 (H2)', value: '楷体_GB2312 三号' },
      { label: '正文 (Body)', value: '仿宋_GB2312 三号' },
      { label: '行距 (Line Height)', value: '固定值 28磅' },
    ]
  },
  components: {
    title: '版式规范 (Layout Rules)',
    items: [
      { label: '页码位置', value: '外侧 / 居中' },
      { label: '页码字体', value: '宋体 四号' },
      { label: '行数/每页', value: '22行' },
      { label: '字数/每行', value: '28字' },
    ]
  }
}

// 常用字号对照表 (号数 -> 磅 -> 毫米)
const fontSizes = [
  { name: '初号', pt: 42, mm: 14.82 },
  { name: '小初', pt: 36, mm: 12.70 },
  { name: '一号', pt: 26, mm: 9.17 },
  { name: '小一', pt: 24, mm: 8.47 },
  { name: '二号', pt: 22, mm: 7.76 },
  { name: '小二', pt: 18, mm: 6.35 },
  { name: '三号', pt: 16, mm: 5.64 },
  { name: '小三', pt: 15, mm: 5.29 },
  { name: '四号', pt: 14, mm: 4.94 },
  { name: '小四', pt: 12, mm: 4.23 },
  { name: '五号', pt: 10.5, mm: 3.70 },
]
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">常用文档规范</h2>
          <p class="text-gray-500 text-sm">公文写作与文档排版的标准规范参考，助你打造专业的办公文档</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Tabs -->
          <div class="flex justify-center mb-8 border-b border-gray-200">
            <button v-for="(spec, key) in specs" :key="key"
              class="px-6 py-3 text-sm font-medium transition-colors relative"
              :class="activeTab === key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
              @click="activeTab = key">
              {{ spec.title }}
              <div v-if="activeTab === key" class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
            </button>
          </div>

          <!-- Content -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div v-for="(item, index) in specs[activeTab as keyof typeof specs].items" :key="index"
              class="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
              <div class="text-gray-500 text-sm mb-2">{{ item.label }}</div>
              <div class="text-gray-800 text-xl font-bold">{{ item.value }}</div>
            </div>
          </div>

          <!-- Font Size Table (Only show on Typography tab) -->
          <div v-if="activeTab === 'typography'" class="mb-12">
            <h3 class="font-bold text-gray-800 mb-6">字号对照表 (Font Size Scale)</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left text-gray-500">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3">字号</th>
                    <th scope="col" class="px-6 py-3">磅值 (pt)</th>
                    <th scope="col" class="px-6 py-3">毫米 (mm)</th>
                    <th scope="col" class="px-6 py-3">示例</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="font in fontSizes" :key="font.name" class="bg-white border-b hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ font.name }}</td>
                    <td class="px-6 py-4">{{ font.pt }}</td>
                    <td class="px-6 py-4">{{ font.mm }}</td>
                    <td class="px-6 py-4" :style="{ fontSize: `${font.pt}pt`, lineHeight: 1.2 }">
                      文档规范
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Visual Guide (Simple representation) -->
          <div v-if="activeTab === 'layout'" class="p-8 bg-gray-100 rounded-xl border border-gray-200 text-center relative overflow-hidden">
            <div class="text-gray-400 text-sm mb-4">版心示意图 (Page Layout)</div>

            <div class="relative h-[400px] w-full flex items-center justify-center">
              <!-- A4 Paper -->
              <div class="bg-white shadow-lg w-[210px] h-[297px] relative flex flex-col items-center justify-between p-4" style="border: 1px solid #e5e7eb;">
                <div class="absolute top-0 left-0 w-full h-[37px] border-b border-red-200 bg-red-50/30 flex items-center justify-center text-[10px] text-red-400">
                  上页边距 37mm
                </div>
                <div class="absolute bottom-0 left-0 w-full h-[35px] border-t border-red-200 bg-red-50/30 flex items-center justify-center text-[10px] text-red-400">
                  下页边距 35mm
                </div>
                <div class="absolute top-0 left-0 h-full w-[28px] border-r border-red-200 bg-red-50/30 flex items-center justify-center text-[10px] text-red-400 writing-vertical">
                  左页边距 28mm
                </div>
                <div class="absolute top-0 right-0 h-full w-[26px] border-l border-red-200 bg-red-50/30 flex items-center justify-center text-[10px] text-red-400 writing-vertical">
                  右页边距 26mm
                </div>
                
                <!-- Content Area -->
                <div class="w-full h-full border border-dashed border-gray-300 flex items-center justify-center mt-[20px] mb-[20px] ml-[15px] mr-[15px]">
                  <span class="text-gray-300 text-xs">版心区域<br>156mm × 225mm</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>

<style scoped>
.writing-vertical {
  writing-mode: vertical-lr;
}
</style>
