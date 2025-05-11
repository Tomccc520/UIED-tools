<!--
 * @file XiaoHongShu.vue
 * @description 小红书风格图片生成工具组件
 * @author AI Assistant
 * @createDate 2024-02-07
 *
 * 功能特性：
 * 1. 支持输入主题生成小红书风格文案
 * 2. 支持选择不同的模板样式
 * 3. 支持自定义背景颜色和字体
 * 4. 支持图片预览和下载
 -->
<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">{{ info.title }}</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
          <!-- 温馨提示 -->
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-600 text-sm">
              温馨提示：输入你想要生成的主题内容，AI将帮你生成吸引人的小红书风格文案。
            </p>
          </div>
        </div>

        <!-- 功能介绍 -->
        <div class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
              <div class="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <svg v-if="feature.icon === 'Prompt'" class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <svg v-else-if="feature.icon === 'AI'" class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="feature.icon === 'Size'" class="w-5 h-5 text-pink-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="feature.icon === 'Download'" class="w-5 h-5 text-pink-500" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h4 class="text-base font-medium text-gray-900">{{ feature.title }}</h4>
                <p class="text-sm text-gray-600 mt-1">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <div class="space-y-6">
              <!-- API设置 -->
              <div>
                <label class="block text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>API设置</span>
                  <div class="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                    <span class="text-xs text-blue-500">{{ apiType === 'free' ? '使用免费API' : '使用自定义API' }}</span>
                  </div>
                </label>
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
                      :class="apiType === 'free' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30' : 'border-gray-200 hover:border-blue-200'"
                      @click="apiType = 'free'">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-gray-900">免费API</div>
                          <div class="text-xs text-gray-500 mt-1">适用于测试和轻度使用</div>
                          <div class="mt-2 inline-flex items-center gap-1 text-xs text-blue-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>限时免费中</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
                      :class="apiType === 'custom' ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-500/30' : 'border-gray-200 hover:border-pink-200'"
                      @click="apiType = 'custom'">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                          <svg class="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-gray-900">自定义API</div>
                          <div class="text-xs text-gray-500 mt-1">适用于高频使用场景</div>
                          <div class="mt-2 inline-flex items-center gap-1 text-xs text-pink-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>推荐个人常用</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 自定义API配置 -->
                  <div v-if="apiType === 'custom'" class="space-y-2">
                    <el-input v-model="customApiKey" placeholder="请输入你的API Key">
                      <template #prepend>
                        <div class="px-3 py-1 text-gray-600 whitespace-nowrap">API Key</div>
                      </template>
                    </el-input>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>如何获取API Key?</span>
                      <a href="https://cloud.siliconflow.cn/i/AZywGNhl" target="_blank"
                        class="text-blue-500 hover:text-blue-600 hover:underline">点击这里申请</a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 主题输入 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">主题内容</label>
                <el-input v-model="topic" type="textarea" :rows="3" :placeholder="topicPlaceholder" class="w-full" />
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(example, index) in topicExamples" :key="index"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    @click="topic = example">
                    {{ example }}
                  </span>
                </div>
              </div>

              <!-- 风格选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">文案风格</label>
                <el-select v-model="style" class="w-full">
                  <el-option v-for="item in styleOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </div>

              <!-- 模型选择 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>选择模型</span>
                </label>
                <el-select v-model="model" class="w-full">
                  <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value">
                    <div class="flex flex-col">
                      <span class="text-gray-900">{{ item.label.split('(')[0] }}</span>
                      <span class="text-xs text-gray-500">{{ item.label.match(/\((.*?)\)/)?.[1] || '' }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>

              <!-- 生成按钮 -->
              <div class="flex justify-center mt-4 space-x-4">
                <el-button type="primary" :loading="generating" @click="generate">
                  {{ generating ? '生成中...' : '开始生成' }}
                </el-button>
                <el-button v-if="generating" type="danger" @click="cancelGenerate">
                  取消生成
                </el-button>
              </div>

              <!-- AI思考过程优化 -->
              <div v-if="thinking" class="mt-8">
                <div
                  class="relative p-6 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 transform transition-all duration-500">
                  <div class="flex items-center gap-3">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                        <svg class="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-3">
                        <span
                          class="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">深度思考</span>
                        <div class="flex gap-1.5">
                          <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"
                            style="animation-delay: 0ms; animation-duration: 1s">
                          </div>
                          <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"
                            style="animation-delay: 150ms; animation-duration: 1s">
                          </div>
                          <div class="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"
                            style="animation-delay: 300ms; animation-duration: 1s">
                          </div>
                        </div>
                      </div>
                      <div
                        class="text-gray-600 text-base leading-relaxed transition-all duration-300 transform hover:scale-[1.01]">
                        {{ currentThought }}
                      </div>
                    </div>
                  </div>
                  <!-- 装饰性背景元素 -->
                  <div
                    class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl opacity-50">
                  </div>
                  <div
                    class="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-full blur-3xl opacity-50">
                  </div>
                </div>
              </div>

              <!-- 生成的文案展示优化 -->
              <div v-if="title && content" class="space-y-6 mt-8">
                <div class="border-t pt-6">
                  <div class="bg-white rounded-lg">
                    <!-- 标题部分 -->
                    <div class="mb-6">
                      <label class="block text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-400" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>生成的标题（点击编辑）</span>
                        <div class="ml-2 px-2 py-1 bg-pink-50 rounded-full">
                          <span class="text-xs text-pink-500">可编辑</span>
                        </div>
                      </label>
                      <div class="p-6 bg-gradient-to-r from-pink-50/50 to-rose-50/50 rounded-lg">
                        <el-input v-model="title" type="textarea" :rows="2" resize="none"
                          class="!bg-transparent hover:!bg-white/50" />
                      </div>
                    </div>

                    <!-- 正文部分 -->
                    <div>
                      <label class="block text-base font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span>生成的正文（点击编辑）</span>
                        <div class="ml-2 px-2 py-1 bg-purple-50 rounded-full">
                          <span class="text-xs text-purple-500">可编辑</span>
                        </div>
                      </label>
                      <div class="p-6 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-lg">
                        <el-input v-model="content" type="textarea" :rows="8" resize="none"
                          class="!bg-transparent hover:!bg-white/50">
                          <template #prepend>
                            <div class="bg-purple-50 px-3 py-1 text-purple-600 text-sm">正文内容</div>
                          </template>
                        </el-input>
                        <div class="mt-4 flex flex-wrap gap-2">
                          <span v-for="tag in content.match(/#[^\s#]+/g) || []" :key="tag"
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模板选择样式优化 -->
              <div v-if="title && content">
                <label class="block text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>选择模板样式</span>
                  <div class="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                    <span class="text-xs text-blue-500">持续增加模板中</span>
                  </div>
                </label>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div v-for="template in templates" :key="template.id"
                    class="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300" :class="[
                      selectedTemplate === template.id
                        ? 'ring-2 ring-pink-500 bg-pink-50'
                        : 'border border-gray-200 hover:border-pink-300 hover:bg-pink-50/30'
                    ]" @click="selectedTemplate = template.id">
                    <div class="h-32 p-4 bg-gradient-to-br" :class="template.gradient">
                      <div class="h-full flex flex-col justify-between">
                        <div class="text-sm font-medium text-gray-800">{{ template.name }}</div>
                        <div class="text-xs text-gray-600">{{ template.preview }}</div>
                      </div>
                    </div>
                    <div v-if="selectedTemplate === template.id"
                      class="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 图片尺寸选择优化 -->
              <div v-if="title && content">
                <label class="block text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span>选择图片尺寸</span>
                </label>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div v-for="size in imageSizeOptions" :key="size.value"
                    class="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300" :class="[
                      selectedImageSize === size.value
                        ? 'ring-2 ring-purple-500 bg-purple-50/50 shadow-md scale-[1.02]'
                        : 'border border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 hover:scale-[1.02]'
                    ]" @click="selectedImageSize = size.value">
                    <div class="p-4">
                      <div class="flex items-center gap-4">
                        <!-- 尺寸预览 -->
                        <div class="relative w-16 h-16 bg-purple-100/50 rounded-lg flex items-center justify-center">
                          <div class="bg-purple-200/50 rounded" :style="size.style"></div>
                        </div>
                        <!-- 尺寸信息 -->
                        <div class="flex-1">
                          <div class="font-medium text-gray-800 mb-1">{{ size.label }}</div>
                          <div class="text-xs text-gray-500">{{ size.desc }}</div>
                        </div>
                        <!-- 选中标记 -->
                        <div v-if="selectedImageSize === size.value"
                          class="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 样式设置 -->
              <div v-if="title && content" class="space-y-6">
                <!-- 原有的样式设置 -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- 背景颜色 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
                    <el-color-picker v-model="backgroundColor" show-alpha class="w-full" />
                  </div>
                  <!-- 字体选择 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">字体样式</label>
                    <el-select v-model="fontFamily" class="w-full">
                      <el-option v-for="font in fonts" :key="font.value" :label="font.label" :value="font.value" />
                    </el-select>
                  </div>
                </div>
              </div>

              <!-- 文字样式设置（仅在生成内容后显示） -->
              <div v-if="title && content" class="mt-8">
                <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <!-- 文字样式设置头部 -->
                  <div class="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                    @click="showTextStyles = !showTextStyles">
                    <div class="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <h3 class="text-lg font-medium text-gray-800">文字样式设置</h3>
                    </div>
                    <div class="flex items-center gap-4">
                      <button class="p-2 rounded-lg hover:bg-gray-200 transition-colors" @click.stop="scaleTextDown">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="text-sm text-gray-600">收缩</span>
                      <button class="p-2 rounded-lg hover:bg-gray-200 transition-colors" @click.stop="scaleTextUp">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                          viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 transition-transform"
                        :class="showTextStyles ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <!-- 文字样式设置内容区域 -->
                  <div v-show="showTextStyles" class="p-6 space-y-8">
                    <!-- 原有的文字样式设置内容 -->
                    <div class="space-y-8">
                      <!-- 标题样式 -->
                      <div class="bg-white p-6 rounded-lg border border-gray-100">
                        <div class="flex items-center justify-between mb-6">
                          <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                              viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <h3 class="text-lg font-medium text-gray-800">文字样式设置</h3>
                          </div>
                          <!-- 缩放控制 -->
                          <div class="flex items-center gap-4">
                            <button class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                              @click.stop="scaleTextDown">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                              </svg>
                            </button>
                            <span class="text-sm text-gray-600">收缩</span>
                            <button class="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                              @click.stop="scaleTextUp">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div class="space-y-8">
                          <!-- 标题样式 -->
                          <div class="bg-white p-6 rounded-lg">
                            <h4 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                              <span class="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                              标题样式
                            </h4>
                            <div class="grid grid-cols-2 gap-6">
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">标题字号</label>
                                <el-input-number v-model="textStyles.titleSize" :min="16" :max="48" :step="1"
                                  class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">标题颜色</label>
                                <el-color-picker v-model="textStyles.titleColor" show-alpha class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">标题粗细</label>
                                <el-select v-model="textStyles.titleWeight" class="w-full">
                                  <el-option label="细体" value="300" />
                                  <el-option label="常规" value="400" />
                                  <el-option label="中等" value="500" />
                                  <el-option label="粗体" value="600" />
                                </el-select>
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">标题对齐</label>
                                <el-select v-model="textStyles.titleAlign" class="w-full">
                                  <el-option label="居左" value="left" />
                                  <el-option label="居中" value="center" />
                                  <el-option label="居右" value="right" />
                                </el-select>
                              </div>
                            </div>
                          </div>

                          <!-- 正文样式 -->
                          <div class="bg-white p-6 rounded-lg">
                            <h4 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                              <span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                              正文样式
                            </h4>
                            <div class="grid grid-cols-2 gap-6">
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">正文字号</label>
                                <el-input-number v-model="textStyles.contentSize" :min="12" :max="32" :step="1"
                                  class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">正文颜色</label>
                                <el-color-picker v-model="textStyles.contentColor" show-alpha class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">正文粗细</label>
                                <el-select v-model="textStyles.contentWeight" class="w-full">
                                  <el-option label="细体" value="300" />
                                  <el-option label="常规" value="400" />
                                  <el-option label="中等" value="500" />
                                  <el-option label="粗体" value="600" />
                                </el-select>
                              </div>
                            </div>
                          </div>

                          <!-- 底部文案设置 -->
                          <div class="bg-white p-6 rounded-lg">
                            <h4 class="text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                              <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              底部文案设置
                            </h4>
                            <div class="grid grid-cols-2 gap-6">
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">左侧文案</label>
                                <el-input v-model="textStyles.footerLeft" placeholder="请输入左侧文案" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">右侧文案</label>
                                <el-input v-model="textStyles.footerRight" placeholder="请输入右侧文案" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">底部字号</label>
                                <el-input-number v-model="textStyles.footerSize" :min="10" :max="24" :step="1"
                                  class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">底部颜色</label>
                                <el-color-picker v-model="textStyles.footerColor" show-alpha class="w-full" />
                              </div>
                              <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">底部粗细</label>
                                <el-select v-model="textStyles.footerWeight" class="w-full">
                                  <el-option label="细体" value="300" />
                                  <el-option label="常规" value="400" />
                                  <el-option label="中等" value="500" />
                                  <el-option label="粗体" value="600" />
                                </el-select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 生成图片按钮 -->
              <div v-if="title && content" class="flex justify-center space-x-4">
                <el-button type="primary" :loading="generatingImage"
                  class="!w-48 !h-12 !text-base !font-medium !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600 !border-0 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 !shadow-lg hover:!shadow-xl"
                  @click="generateImage">
                  <template v-if="!generatingImage">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>生成图片</span>
                  </template>
                  <template v-else>
                    <span>生成中...</span>
                  </template>
                </el-button>

                <el-button type="default"
                  class="!w-48 !h-12 !text-base !font-medium hover:!bg-gray-50 flex items-center justify-center gap-2"
                  @click="copyContent">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>复制文案</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览区域优化 -->
          <div v-if="generatedImageUrl" class="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <div class="mb-4">
              <span class="text-lg font-medium text-gray-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                生成结果
              </span>
            </div>
            <div
              class="border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex flex-col items-center justify-center min-h-[300px]">
              <div class="relative w-full h-full flex justify-center">
                <img :src="generatedImageUrl" class="max-w-full max-h-[500px] object-contain" alt="生成的图片"
                  @error="ElMessage.error('图片加载失败，请重试')" />
              </div>
              <div class="mt-6 flex gap-4 items-center justify-center w-full">
                <el-button type="primary"
                  class="!px-8 !py-3 flex items-center gap-2 !bg-gradient-to-r !from-pink-500 !to-rose-500 hover:!from-pink-600 hover:!to-rose-600 !border-0 !text-base"
                  @click="downloadImage">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>下载图片</span>
                </el-button>
                <el-button type="default" @click="openImage"
                  class="!px-8 !py-3 flex items-center gap-2 hover:!bg-gray-50 !text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>查看大图</span>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 常见问题间距优化 -->
      <div class="mt-4 mb-4 bg-white rounded-xl p-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">常见问题</h3>
        <div class="space-y-6">
          <div v-for="(item, index) in faqItems" :key="index"
            class="pb-6 border-b border-gray-200 last:pb-0 last:border-0">
            <h4 class="text-base font-medium text-gray-900 mb-3">{{ item.q }}</h4>
            <p class="text-sm text-gray-600 leading-relaxed">{{ item.a }}</p>
          </div>
        </div>
      </div>

      <!-- 工具推荐组件间距优化 -->
      <div class="mb-8">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import html2canvas from 'html2canvas'
import type { Ref } from 'vue'
import { useRoute } from 'vue-router'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// 页面信息
const info = {
  title: '小红书风格文案生成图片',
  subtitle: '基于 DeepSeek 大模型的智能文案生成工具，一键生成吸引人的小红书风格文案'
}

// 功能特性
const features = [
  {
    title: '智能创作',
    desc: '基于 DeepSeek 大模型，智能生成小红书风格文案',
    icon: 'Prompt'
  },
  {
    title: '多种风格',
    desc: '支持多种文案风格，满足不同场景需求',
    icon: 'AI'
  },
  {
    title: '图片生成',
    desc: '一键生成精美的小红书风格图片',
    icon: 'Size'
  },
  {
    title: '自定义样式',
    desc: '支持自定义字体、颜色、大小等样式',
    icon: 'Download'
  }
]

// 常见问题
const faqItems = [
  {
    q: '如何使用这个工具？',
    a: '只需输入你想要生成的主题内容，选择合适的风格，点击生成按钮即可。AI会帮你分析主题，设计内容结构，最后生成完整的小红书风格文案。'
  },
  {
    q: '支持哪些文案风格？',
    a: '目前支持默认风格、清新文艺、种草安利、生活记录、美食探店等多种风格，每种风格都有其独特的表达方式和情感基调。'
  },
  {
    q: '生成的内容质量如何？',
    a: '我们使用先进的 DeepSeek 大模型，通过深度学习和优化，生成的内容更贴近小红书平台的风格，更容易引起共鸣和传播。'
  },
  {
    q: '为什么有时候生成较慢？',
    a: '生成速度主要受选择的模型大小影响。建议使用推荐的 7B 模型，它能在保证质量的同时提供更快的生成速度。如果追求更高质量，可以选择较大的模型，但会相应增加生成时间。'
  }
]

// 表单数据
const topic = ref('')
const style = ref('default')
const model = ref('deepseek-ai/DeepSeek-R1-Distill-Qwen-7B')
const title = ref('')
const content = ref('')
const selectedTemplate = ref(1)
const backgroundColor = ref('#ffffff')
const fontFamily = ref('default')
const generating = ref(false)
const generatingImage = ref(false)
const generatedImageUrl = ref('')
const thinking = ref(false)
const currentThought = ref('')

// API 配置
const apiType = ref('free') // 默认使用免费API
const customApiKey = ref('')

// 预设的免费API key
const FREE_API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY // 使用环境变量中的 API Key

// 风格选项
const styleOptions = [
  { label: '默认风格', value: 'default' },
  { label: '清新文艺', value: 'literary' },
  { label: '种草安利', value: 'recommend' },
  { label: '生活记录', value: 'life' },
  { label: '美食探店', value: 'food' }
]

// 主题内容提示词
const topicPlaceholder = '请输入你想要生成的主题内容,例如:美食探店、旅行日记、穿搭分享等'
const topicExamples = [
  '探店‖这家藏在巷子里的面馆,竟然有米其林的水准!',
  '分享‖春季穿搭灵感,这些单品让你时尚感翻倍',
  '记录‖周末带娃好去处,这个亲子乐园也太好玩了',
  '测评‖百元以内的国货护肤品,这几款性价比超高',
  '攻略‖三亚旅行必打卡,这些景点不容错过',
  '经验‖新手养猫必看,铲屎官必备知识都在这'
]

// 模型选项
const modelOptions = [
  // DeepSeek 系列
  { label: 'DeepSeek R1 Distill Qwen 32B (高性能)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', desc: '基于 DeepSeek-R1 的 32B 蒸馏模型，适合需要高质量输出的场景。' },
  { label: 'DeepSeek R1 Distill Qwen 14B (均衡)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B', desc: '基于 DeepSeek-R1 的 14B 蒸馏模型，在性能和速度上取得平衡。' },
  { label: 'DeepSeek R1 Distill Qwen 8B (推荐)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-8B', desc: '基于 DeepSeek-R1 的 8B 蒸馏模型，适合大多数场景使用。' },
  { label: 'DeepSeek R1 Distill Qwen 7B (推荐)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', desc: '基于 DeepSeek-R1 的 7B 蒸馏模型，适合日常对话和内容生成。' },
  { label: 'DeepSeek R1 Distill Qwen 1.5B (轻量)', value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', desc: '基于 DeepSeek-R1 的 1.5B 蒸馏模型，适合对速度要求较高的场景。' },
  { label: 'DeepSeek R1', value: 'deepseek-ai/DeepSeek-R1', desc: '基于强化学习和指令微调的模型，解决了重复和幻觉问题。' },
  { label: 'DeepSeek V3', value: 'deepseek-ai/DeepSeek-V3', desc: '专家系统语言模型，采用多头注意力和 DeepSeekMoE 架构。' },
  { label: 'DeepSeek V2.5', value: 'deepseek-ai/DeepSeek-V2.5', desc: '通用大语言模型，在多个能力方面都有显著提升。' },

  // Qwen 系列 (免费)
  { label: 'Qwen 2.5 7B (免费)', value: 'Qwen/Qwen2.5-7B-Instruct', desc: '通义千问2.5 7B 模型，轻量级通用语言模型，适合快速响应场景。' },
  { label: 'Qwen 2 1.5B (轻量免费)', value: 'Qwen/Qwen2-1.5B-Instruct', desc: '超轻量级通用语言模型，适合对速度要求较高的场景。' },

  // Yi 系列 (免费)
  { label: 'Yi 1.5 6B (免费)', value: 'Yi/Yi-1.5-6B-Instruct', desc: '零一万物1.5 6B 模型，轻量级模型，适合快速响应场景。' },

  // InternLM 系列 (免费)
  { label: 'InternLM 2.5 7B (免费)', value: 'InternLM/InternLM2-Chat-7B', desc: '书生浦语2.5 7B 模型，适合通用对话和内容生成。' },
  { label: 'InternLM 2.5 1.8B (轻量免费)', value: 'InternLM/InternLM2-Chat-1.8B', desc: '书生浦语2.5 1.8B 模型，超轻量级模型，适合快速响应。' },

  // GLM 系列 (免费)
  { label: 'GLM4 6B (免费)', value: 'THUDM/GLM4-6B', desc: '清华大学开源的GLM系列模型，适合通用对话和内容生成。' },

  // Gemma 系列 (免费)
  { label: 'Gemma 2 7B (免费)', value: 'Google/Gemma-7B-it', desc: 'Google开源的Gemma系列模型，适合通用对话和内容生成。' },
  { label: 'Gemma 2 2B (轻量免费)', value: 'Google/Gemma-2B-it', desc: 'Google开源的轻量级模型，适合快速响应场景。' }
]

// 模板数据
const templates = [
  {
    id: 1,
    name: '简约渐变',
    gradient: 'from-rose-50/90 via-pink-50/90 to-purple-50/90',
    preview: '清新简约的渐变背景，突出内容的表现力',
    contentBg: 'bg-white/95',
    decorations: [
      'bg-gradient-to-br from-pink-100/20 to-purple-100/20',
      'bg-gradient-to-br from-rose-100/20 to-pink-100/20'
    ],
    shadowColor: 'hover:shadow-pink-100/50'
  },
  {
    id: 2,
    name: '暖色系',
    gradient: 'from-amber-50/90 via-orange-50/90 to-rose-50/90',
    preview: '温暖柔和的色调，适合美食、生活类内容',
    contentBg: 'bg-white/95',
    decorations: [
      'bg-gradient-to-br from-orange-100/20 to-rose-100/20',
      'bg-gradient-to-br from-amber-100/20 to-orange-100/20'
    ],
    shadowColor: 'hover:shadow-orange-100/50'
  },
  {
    id: 3,
    name: '清新自然',
    gradient: 'from-emerald-50/90 via-teal-50/90 to-cyan-50/90',
    preview: '自然清新的配色，适合旅行、户外类内容',
    contentBg: 'bg-white/95',
    decorations: [
      'bg-gradient-to-br from-teal-100/20 to-cyan-100/20',
      'bg-gradient-to-br from-emerald-100/20 to-teal-100/20'
    ],
    shadowColor: 'hover:shadow-emerald-100/50'
  },
  {
    id: 4,
    name: '梦幻紫',
    gradient: 'from-violet-50/90 via-purple-50/90 to-fuchsia-50/90',
    preview: '梦幻浪漫的紫色调，适合种草、安利类内容',
    contentBg: 'bg-white/95',
    decorations: [
      'bg-gradient-to-br from-purple-100/20 to-fuchsia-100/20',
      'bg-gradient-to-br from-violet-100/20 to-purple-100/20'
    ],
    shadowColor: 'hover:shadow-purple-100/50'
  }
]

// 字体选项
const fonts = [
  { label: '默认字体', value: 'default' },
  { label: '思源黑体', value: '"Source Han Sans CN", sans-serif', cdn: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap' },
  { label: '阿里巴巴普惠体', value: '"Alibaba PuHuiTi", sans-serif', cdn: 'https://cdn.jsdelivr.net/npm/@alifd/font-alibaba-puhuiti@1.0.0/index.css' },
  { label: '站酷高端黑', value: '"ZCOOL KuHei", sans-serif', cdn: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuHei&display=swap' }
]

// 添加新的响应式变量
const streamOutput = ref('')
const isTyping = ref(false)
const typingSpeed = ref(50) // 打字速度(ms)

// 添加打字机效果函数
const typeWriter = async (text: string, target: Ref<string>, speed: number = 50) => {
  target.value = ''
  for (let i = 0; i < text.length; i++) {
    target.value += text[i]
    await new Promise(resolve => setTimeout(resolve, speed))
  }
}

// 定义可用的函数
const availableFunctions = {
  generate_title: {
    name: 'generate_title',
    description: '生成小红书风格的标题',
    parameters: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '生成的标题内容'
        },
        emoji: {
          type: 'string',
          description: '使用的emoji表情'
        }
      },
      required: ['title', 'emoji']
    }
  },
  generate_content: {
    name: 'generate_content',
    description: '生成小红书风格的正文内容',
    parameters: {
      type: 'object',
      properties: {
        paragraphs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: '段落内容'
              },
              emoji: {
                type: 'string',
                description: '段落使用的emoji'
              }
            }
          },
          description: '文章段落内容'
        }
      },
      required: ['paragraphs']
    }
  }
}

// 处理函数调用结果
const handleFunctionCall = (functionCall: any) => {
  const functionName = functionCall.name
  const functionArgs = JSON.parse(functionCall.arguments)

  console.log('处理函数调用:', functionName, functionArgs) // 添加调试日志

  switch (functionName) {
    case 'generate_title':
      return `${functionArgs.emoji} ${functionArgs.title}`
    case 'generate_content':
      return functionArgs.paragraphs
        .map((p: any) => `${p.emoji} ${p.content}`)
        .join('\n\n')
    default:
      throw new Error(`未知的函数: ${functionName}`)
  }
}

// 优化重试机制
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  let lastError
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000) // 缩短超时时间到20秒

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      lastError = error
      console.error(`第 ${i + 1} 次请求失败:`, error.message)

      if (error.name === 'AbortError') {
        throw new Error('请求超时，请尝试使用较小的模型')
      }

      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw new Error(lastError?.message || '请求失败，建议使用较小的模型重试')
}

// 修改思考步骤的展示样式
const template = `
<div class="bg-white rounded-xl p-8 shadow-sm">
  <!-- 思考过程展示区域 -->
  <div v-if="thinking || thoughtProcess.length > 0" class="mb-8">
    <div class="border-b pb-4 mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">深度思考过程</h3>
      <div class="space-y-4">
        <div v-for="(thought, index) in thoughtProcess" :key="index"
          class="p-6 rounded-lg transition-all duration-300"
          :class="[thought.color, 'hover:shadow-md']">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-2">{{ thought.type }}</h4>
              <p class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{{ thought.text }}</p>
            </div>
          </div>
        </div>

        <!-- 思考中状态 -->
        <div v-if="thinking"
          class="p-6 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 animate-pulse">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p class="text-gray-600">深入分析中...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 生成的内容展示区域 -->
  <div v-if="title && content" class="space-y-6">
    <!-- 标题部分 -->
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">内容标题</h3>
      <div class="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <p class="text-gray-800 text-xl font-medium">{{ title }}</p>
      </div>
    </div>

    <!-- 正文部分 -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">内容详情</h3>
      <div class="p-6 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <div class="prose prose-indigo max-w-none">
          <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">{{ content }}</p>
        </div>
      </div>
    </div>
  </div>
</div>
`

// 优化解析内容的函数
const parseContent = (text: string) => {
  try {
    // 初始化结果对象
    const result: Record<string, string> = {}

    // 1. 提取标题
    const titleMatch = text.match(/\[标题\]([\s\S]*?)(?=\[|$)/) ||
      text.match(/.*?[\u{1F300}-\u{1F9FF}].*?\n/u) ||
      text.match(/.*?[✨|🌟|⭐️|💫|✅].*?\n/)

    if (titleMatch) {
      result['标题'] = titleMatch[0].replace('[标题]', '').trim()
    }

    // 2. 提取正文
    const contentMatch = text.match(/\[正文\]([\s\S]*?)(?=\[|$)/)
    if (contentMatch) {
      // 优化正文格式
      const paragraphs = contentMatch[1]
        .trim()
        .split('\n')
        .filter(p => p.trim())
        .map(p => {
          // 确保每段都有emoji
          if (!p.match(/[\u{1F300}-\u{1F9FF}]/u)) {
            return '✨ ' + p.trim()
          }
          return p.trim()
        })
      result['正文'] = paragraphs.join('\n\n')
    } else {
      // 如果没有[正文]标记，尝试提取所有带emoji的段落
      const paragraphs = text.match(/[^\n]*?[\u{1F300}-\u{1F9FF}][^\n]*/gu) || []
      if (paragraphs.length > 0) {
        // 排除已经作为标题的段落
        const contentParagraphs = paragraphs
          .filter(p => p !== result['标题'])
          .map(p => p.trim())
        if (contentParagraphs.length > 0) {
          result['正文'] = contentParagraphs.join('\n\n')
        }
      }
    }

    // 3. 提取标签
    const tagsMatch = text.match(/\[标签\]([\s\S]*?)(?=\[|$)/) ||
      text.match(/#[\w\u4e00-\u9fa5]+/g)
    if (tagsMatch) {
      const tags = Array.isArray(tagsMatch)
        ? tagsMatch
        : tagsMatch[1].trim().split(/\s+/)

      result['标签'] = tags
        .filter(tag => tag.trim())
        .map(tag => tag.startsWith('#') ? tag : '#' + tag)
        .join(' ')
    }

    // 4. 确保内容完整性
    if (!result['标题']) {
      result['标题'] = '✨ ' + (topic.value || '精彩内容')
    }

    if (!result['正文']) {
      throw new Error('未能生成有效的正文内容，请重试')
    }

    // 5. 确保标题包含emoji
    if (!result['标题'].match(/[\u{1F300}-\u{1F9FF}]|[✨|🌟|⭐️|💫|✅]/u)) {
      result['标题'] = '✨ ' + result['标题']
    }

    // 6. 格式化正文段落
    result['正文'] = result['正文']
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p)
      .join('\n\n')

    return result
  } catch (error) {
    console.error('解析内容失败:', error, '\n原始内容:', text)
    throw new Error(`内容生成格式不正确，正在重试...`)
  }
}

// 添加取消生成的变量
const abortController = ref<AbortController | null>(null)

// 取消生成函数
const cancelGenerate = () => {
  if (abortController.value) {
    abortController.value.abort()
    abortController.value = null
  }
  generating.value = false
  thinking.value = false
  currentThought.value = ''
  ElMessage.info('已取消生成')
}

// 修改代理函数
const callAIAPI = async (requestBody: any) => {
  try {
    // 使用 vite 代理地址
    const apiUrl = '/api/v1/chat/completions'

    // 使用 AbortController 控制请求超时
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SILICONFLOW_API_KEY}`
      },
      body: JSON.stringify({
        model: requestBody.model,
        messages: [
          { role: 'system', content: '你是一个专业的小红书文案写作专家。' },
          { role: 'user', content: requestBody.prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'API响应错误')
    }

    const result = await response.json()

    // 验证响应格式
    if (!result?.choices?.[0]?.message?.content) {
      throw new Error('API响应格式错误')
    }

    return result.choices[0].message.content
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时,请重试')
    }
    console.error('API调用失败:', error)
    throw new Error(error.message || '生成失败,请稍后重试')
  }
}

// 修改生成函数
const generate = async () => {
  if (!topic.value) {
    ElMessage.warning('请输入主题')
    return
  }

  generating.value = true
  thinking.value = true
  title.value = ''
  content.value = ''
  currentThought.value = ''

  // 创建新的 AbortController
  abortController.value = new AbortController()

  let retryCount = 0
  const maxRetries = 2

  while (retryCount <= maxRetries) {
    try {
      currentThought.value = retryCount > 0 ? '正在重新生成内容...' : '正在生成内容...'

      const prompt = `请帮我生成一篇小红书风格的文案，主题是"${topic.value}"，风格是${styleOptions.find(item => item.value === style.value)?.label}。

要求：
1. 文案必须包含吸引人的标题（带emoji表情）
2. 正文必须包含3段内容，每段都要以emoji开头
3. 最后加上4-6个相关的标签，每个标签都要带#号

参考格式：
[标题]
✨ 超吸引人的标题

[正文]
🌟 第一段内容...
💫 第二段内容...
⭐️ 第三段内容...

[标签]
#标签1 #标签2 #标签3 #标签4`

      const requestBody = {
        model: model.value,
        prompt: prompt,
        style: style.value
      }

      // 调用代理函数
      const aiResponse = await callAIAPI(requestBody)
      const parsedContent = parseContent(aiResponse)

      // 更新思考过程
      currentThought.value = '正在整理生成的内容...'
      await new Promise(resolve => setTimeout(resolve, 800))

      // 设置标题和内容
      currentThought.value = '正在设置标题...'
      await typeWriter(parsedContent['标题'], title, 50)

      currentThought.value = '正在设置正文...'
      let finalContent = parsedContent['正文']
      if (parsedContent['标签']) {
        finalContent += '\n\n' + parsedContent['标签']
      }
      await typeWriter(finalContent, content, 50)

      ElMessage.success('文案生成成功！')
      break
    } catch (error: any) {
      retryCount++
      if (retryCount > maxRetries) {
        console.error('生成失败:', error)
        ElMessage.error('生成失败，请重试')
        break
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  generating.value = false
  thinking.value = false
}

// 图片尺寸选项
const imageSizeOptions = [
  {
    label: '小红书标准封面',
    value: 'standard',
    desc: '1080×1440像素 (3:4)',
    width: 1080,
    height: 1440,
    style: 'width: 45px; height: 60px;'
  },
  {
    label: '方形封面',
    value: 'square',
    desc: '1080×1080像素 (1:1)',
    width: 1080,
    height: 1080,
    style: 'width: 60px; height: 60px;'
  },
  {
    label: '长图',
    value: 'long',
    desc: '1080×1920像素 (9:16)',
    width: 1080,
    height: 1920,
    style: 'width: 34px; height: 60px;'
  }
]

// 选中的图片尺寸
const selectedImageSize = ref('standard')

// 修改文字样式配置
const textStyles = ref({
  titleSize: 32,
  contentSize: 20, // 修改默认值为20
  titleColor: '#333333',
  contentColor: '#666666',
  titleWeight: '600',
  contentWeight: '400',
  footerSize: 12,
  footerColor: '#999999',
  footerWeight: '400',
  titleAlign: 'center',
  footerLeft: 'UIEDTools免费在线工具',
  footerRight: 'by Tomda'
})

// 添加字体加载函数
const loadFont = (font: any) => {
  if (font.cdn && font.value !== 'default') {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = font.cdn
    document.head.appendChild(link)
  }
}

// 监听字体变化
watch(fontFamily, (newFont) => {
  const selectedFont = fonts.find(f => f.value === newFont)
  if (selectedFont) {
    loadFont(selectedFont)
  }
})

// 修改生成图片函数
const generateImage = async () => {
  if (!title.value || !content.value) {
    ElMessage.warning('请先生成文案')
    return
  }

  generatingImage.value = true
  try {
    const selectedTemplateData = templates.find(t => t.id === selectedTemplate.value)
    const gradientClass = selectedTemplateData?.gradient || 'from-blue-50 via-purple-50 to-pink-50'

    // 获取选中的尺寸配置
    const sizeConfig = imageSizeOptions.find(s => s.value === selectedImageSize.value)

    // 获取选中的字体
    const selectedFont = fonts.find(f => f.value === fontFamily.value)
    const fontFamilyValue = selectedFont ? selectedFont.value : 'system-ui, -apple-system, sans-serif'

    const element = document.createElement('div')
    element.style.width = `${sizeConfig?.width}px`
    element.style.height = `${sizeConfig?.height}px`
    element.style.padding = '40px'
    element.className = `bg-gradient-to-br ${gradientClass} flex flex-col`
    element.style.fontFamily = fontFamilyValue
    element.innerHTML = `
      <div class="flex-1 p-6 rounded-xl ${selectedTemplateData?.contentBg || 'bg-white/95'} backdrop-blur-sm flex flex-col relative overflow-hidden">
        <!-- 装饰元素 -->
        <div class="absolute -top-20 -right-20 w-40 h-40 ${selectedTemplateData?.decorations[0]} rounded-full blur-2xl opacity-60"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 ${selectedTemplateData?.decorations[1]} rounded-full blur-2xl opacity-60"></div>

        <!-- 内容区域 -->
        <div class="flex-1 flex flex-col relative z-10">
          <!-- 标题区域 -->
          <div class="mb-6" style="
            text-align: ${textStyles.value.titleAlign};
            padding: 0 16px;
          ">
            <h1 style="
              font-size: ${textStyles.value.titleSize}px;
              color: ${textStyles.value.titleColor};
              font-weight: ${textStyles.value.titleWeight};
              margin: 0;
              padding: 0;
              line-height: 1.4;
            ">
              ${title.value}
            </h1>
          </div>

          <!-- 正文区域 -->
          <div class="flex-1" style="
            font-size: ${textStyles.value.contentSize}px;
            color: ${textStyles.value.contentColor};
            font-weight: ${textStyles.value.contentWeight};
            line-height: 1.8;
            padding: 20px 24px;
            white-space: pre-wrap;
            overflow-y: auto;
            text-align: justify;
            letter-spacing: 0.5px;
          ">
            ${content.value.split('\n\n').map(paragraph =>
      `<div style="margin-bottom: 16px;">${paragraph}</div>`
    ).join('')}
          </div>

          <!-- 底部信息 -->
          <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between" style="
            font-size: ${textStyles.value.footerSize}px;
            color: ${textStyles.value.footerColor};
            font-weight: ${textStyles.value.footerWeight};
            padding: 16px 24px 0;
          ">
            <div>${textStyles.value.footerLeft}</div>
            <div>${textStyles.value.footerRight}</div>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(element)

    const canvas = await html2canvas(element, {
      scale: 2, // 提高清晰度
      useCORS: true, // 允许跨域图片
      allowTaint: true, // 允许跨域图片
      backgroundColor: null, // 透明背景
      logging: false, // 关闭日志
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector('div')
        if (clonedElement) {
          clonedElement.style.display = 'block'
          clonedElement.style.position = 'absolute'
          clonedElement.style.top = '0'
          clonedElement.style.left = '0'
        }
      }
    })

    document.body.removeChild(element)
    const dataUrl = canvas.toDataURL('image/png')
    generatedImageUrl.value = dataUrl
    ElMessage.success('图片生成成功！')
  } catch (error: any) {
    console.error('生成图片失败:', error)
    ElMessage.error('生成图片失败，请重试')
  } finally {
    generatingImage.value = false
  }
}

// 复制文案到剪贴板
const copyContent = () => {
  const textToCopy = `${title.value}\n\n${content.value}`
  navigator.clipboard.writeText(textToCopy)
  ElMessage.success('文案已复制到剪贴板')
}

// 打开生成的图片
const openImage = () => {
  window.open(generatedImageUrl.value, '_blank')
}

// 下载生成的图片
const downloadImage = () => {
  const link = document.createElement('a')
  link.href = generatedImageUrl.value
  link.download = `${title.value.replace(/[^\w\s]/g, '')}_${new Date().toISOString().split('T')[0]}.png`
  link.click()
  link.remove()
  ElMessage.success('图片已下载到本地')
}

// 文字缩放函数
const scaleTextUp = () => {
  textStyles.value.titleSize = Math.min(textStyles.value.titleSize + 2, 48)
  textStyles.value.contentSize = Math.min(textStyles.value.contentSize + 2, 32)
  textStyles.value.footerSize = Math.min(textStyles.value.footerSize + 1, 24)
}

const scaleTextDown = () => {
  textStyles.value.titleSize = Math.max(textStyles.value.titleSize - 2, 16)
  textStyles.value.contentSize = Math.max(textStyles.value.contentSize - 2, 12)
  textStyles.value.footerSize = Math.max(textStyles.value.footerSize - 1, 10)
}

// 添加响应式变量
const showTextStyles = ref(false)
</script>

<style scoped>
/* 添加一些自定义样式 */
</style>
