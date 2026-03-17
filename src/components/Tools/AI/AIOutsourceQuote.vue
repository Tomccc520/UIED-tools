<!--
 * @file AIOutsourceQuote.vue
 * @description AI外包报价生成器组件
 * @author AI Assistant
 * @createDate 2024-03-20
 *
 * 功能特性：
 * 1. 支持输入项目需求生成专业报价单
 * 2. 支持多种项目类型（程序开发、短视频制作、设计等）
 * 3. 支持自定义API和免费API切换
 * 4. 支持报价单导出和分享
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
              <div class="absolute -top-1 right-0 transform translate-x-full">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  功能持续更新完善中
                </span>
              </div>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">{{ info.subtitle }}</p>
          <!-- 温馨提示 -->
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-yellow-600 text-sm">
              温馨提示：输入您的项目需求，AI将为您生成专业的外包报价方案。
            </p>
          </div>
        </div>

        <!-- 功能介绍 -->
        <div class="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div v-for="feature in features" :key="feature.title" class="flex items-center gap-3 text-gray-600">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg v-if="feature.icon === 'Project'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <svg v-else-if="feature.icon === 'AI'" class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <svg v-else-if="feature.icon === 'Price'" class="w-5 h-5 text-blue-500" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else-if="feature.icon === 'Export'" class="w-5 h-5 text-blue-500" fill="none"
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
                      :class="apiType === 'custom' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30' : 'border-gray-200 hover:border-blue-200'"
                      @click="apiType = 'custom'">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div class="flex-1">
                          <div class="font-medium text-gray-900">自定义API</div>
                          <div class="text-xs text-gray-500 mt-1">适用于高频使用场景</div>
                          <div class="mt-2 inline-flex items-center gap-1 text-xs text-blue-600">
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

              <!-- AI模型选择 -->
              <div>
                <label class="block text-base font-medium text-gray-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>AI模型选择</span>
                  <div class="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                    <span class="text-xs text-blue-500">{{ modelType === 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' ?
                      '推荐模型' : ''
                    }}</span>
                  </div>
                </label>
                <div class="space-y-4">
                  <el-select v-model="modelType" class="w-full">
                    <el-option v-for="item in modelOptions" :key="item.value" :label="item.label" :value="item.value">
                      <div class="flex items-center gap-2">
                        <span>{{ item.label }}</span>
                        <span v-if="item.isRecommend" class="text-xs text-blue-500">(推荐)</span>
                      </div>
                    </el-option>
                  </el-select>
                </div>
              </div>

              <!-- 项目类型选择优化 -->
              <div class="space-y-6">
                <div v-for="category in projectTypeOptions" :key="category.category" class="space-y-4">
                  <h3 class="text-lg font-medium text-gray-900">{{ category.category }}</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="type in category.items" :key="type.value"
                      class="relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200" :class="[
                        projectType === type.value
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/30'
                          : 'border-gray-200 hover:border-blue-200'
                      ]" @click="projectType = type.value">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <component :is="type.icon" class="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">{{ type.label }}</h4>
                          <p class="text-sm text-gray-500">{{ type.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 需求输入优化 -->
              <div class="mt-6 space-y-4">
                <div class="relative">
                  <el-input v-model="requirements" type="textarea" :rows="6" :placeholder="getPlaceholder()"
                    class="w-full !text-base" @input="updateSuggestions" />

                  <!-- 智能提示 -->
                  <div v-if="suggestions.length > 0"
                    class="absolute left-0 right-0 bottom-full mb-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div class="text-sm text-gray-500 mb-2">💡 建议补充以下信息：</div>
                    <div class="space-y-2">
                      <div v-for="(suggestion, index) in suggestions" :key="index"
                        class="text-sm text-blue-600 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors duration-200"
                        @click="appendRequirement(suggestion)">
                        {{ suggestion }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 快速选择标签 -->
                <div class="flex flex-wrap gap-2">
                  <span v-for="(tag, index) in getQuickTags" :key="index"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    @click="appendRequirement(`需要${tag}`)">
                    {{ tag }}
                  </span>
                </div>

                <!-- 字数统计 -->
                <div class="flex justify-between text-sm text-gray-500">
                  <span>{{ requirements ? requirements.length : 0 }}/2000 字</span>
                  <span v-if="requirements" class="text-blue-500 cursor-pointer hover:text-blue-600"
                    @click="requirements = ''">
                    清空内容
                  </span>
                </div>
              </div>

              <!-- 报价偏好 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">报价偏好</label>
                <el-select v-model="pricePreference" class="w-full">
                  <el-option v-for="item in pricePreferenceOptions" :key="item.value" :label="item.label"
                    :value="item.value" />
                </el-select>
              </div>

              <!-- 生成按钮优化 -->
              <div class="flex justify-center mt-6 space-x-4">
                <el-button type="primary" :loading="generating" size="large" class="!px-8 !h-12 !text-base"
                  @click="generate">
                  {{ generating ? '正在生成专业报价方案...' : '开始生成' }}
                  <span v-if="!generating" class="ml-2">✨</span>
                </el-button>
                <el-button v-if="generating" type="danger" size="large" class="!px-8 !h-12 !text-base"
                  @click="cancelGenerate">
                  取消生成
                </el-button>
              </div>

              <!-- AI思考过程 -->
              <div v-if="generating || (messages.length > 0 && messages[messages.length - 1]?.reasoning_content)"
                class="mt-8">
                <div
                  class="relative p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 transform transition-all duration-500">
                  <!-- 思考图标 -->
                  <div class="absolute -top-4 left-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>

                  <!-- 推理过程内容 -->
                  <div class="space-y-4">
                    <div class="mb-4">
                      <h3 class="text-lg font-medium text-blue-700 flex items-center gap-2">
                        <span>AI 专业分析</span>
                        <span v-if="generating" class="text-sm font-normal text-blue-500">(分析中...)</span>
                      </h3>
                      <p class="text-sm text-blue-600">正在为您进行专业的项目评估与报价分析</p>
                    </div>

                    <div class="space-y-3">
                      <template
                        v-for="(step, index) in parseReasoningSteps(messages[messages.length - 1]?.reasoning_content)"
                        :key="index">
                        <div
                          class="flex items-start gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/70 transition-colors duration-200">
                          <div class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-sm text-blue-600">{{ Number(index) + 1 }}</span>
                          </div>
                          <div class="flex-1">
                            <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ step }}</p>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 报价结果优化 -->
              <div v-if="quoteResult" class="mt-8">
                <div class="quote-result bg-white border border-gray-200 rounded-lg p-8">
                  <!-- 基本信息编辑区域 -->
                  <div class="mb-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <!-- 公司信息 -->
                      <div class="space-y-4">
                        <h4 class="text-lg font-medium flex items-center gap-2">
                          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          公司信息
                        </h4>
                        <div class="grid gap-4">
                          <div class="relative">
                            <el-input v-model="companyInfo.name" placeholder="公司名称">
                              <template #prefix>
                                <i class="el-icon-office-building text-gray-400"></i>
                              </template>
                            </el-input>
                          </div>
                          <div class="relative">
                            <el-input v-model="companyInfo.contact" placeholder="联系人">
                              <template #prefix>
                                <i class="el-icon-user text-gray-400"></i>
                              </template>
                            </el-input>
                          </div>
                          <div class="relative">
                            <el-input v-model="companyInfo.phone" placeholder="联系电话">
                              <template #prefix>
                                <i class="el-icon-phone text-gray-400"></i>
                              </template>
                            </el-input>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <el-button type="primary" link @click="saveCompanyTemplate" class="!px-4 !py-2">
                            <i class="el-icon-plus mr-1"></i>保存为模板
                          </el-button>
                          <el-button type="primary" link @click="showCompanyTemplates" class="!px-4 !py-2">
                            <i class="el-icon-files mr-1"></i>选择模板
                          </el-button>
                        </div>
                      </div>

                      <!-- 项目信息 -->
                      <div class="space-y-4">
                        <h4 class="text-lg font-medium flex items-center gap-2">
                          <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          项目信息
                        </h4>
                        <div class="grid gap-4">
                          <div class="relative">
                            <el-input v-model="quoteResult.projectName" placeholder="项目名称">
                              <template #prefix>
                                <i class="el-icon-document text-gray-400"></i>
                              </template>
                            </el-input>
                          </div>
                          <div class="relative">
                            <el-date-picker v-model="quoteResult.date" type="date" placeholder="报价日期"
                              style="width: 100%">
                              <template #prefix>
                                <i class="el-icon-date text-gray-400"></i>
                              </template>
                            </el-date-picker>
                          </div>
                          <div class="relative">
                            <el-input v-model="quoteResult.validDays" placeholder="报价有效期(天)">
                              <template #prefix>
                                <i class="el-icon-time text-gray-400"></i>
                              </template>
                            </el-input>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 报价明细编辑 -->
                  <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                      <h4 class="text-lg font-medium flex items-center gap-2">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        报价明细
                      </h4>
                      <el-button type="primary" @click="addCostItem" class="!px-4 !py-2">
                        <i class="el-icon-plus mr-1"></i>添加明细
                      </el-button>
                    </div>
                    <div class="space-y-4">
                      <div v-for="(item, index) in quoteResult.costs" :key="index"
                        class="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <el-input v-model="item.name" placeholder="项目名称">
                          <template #prefix>
                            <i class="el-icon-document text-gray-400"></i>
                          </template>
                        </el-input>
                        <el-input v-model="item.desc" placeholder="描述">
                          <template #prefix>
                            <i class="el-icon-document-copy text-gray-400"></i>
                          </template>
                        </el-input>
                        <el-input-number v-model="item.amount" :min="0" placeholder="金额" class="w-full" />
                        <div class="flex items-center justify-end">
                          <el-button type="danger" circle @click="removeCostItem(index)">
                            <el-icon>
                              <Delete />
                            </el-icon>
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 其他选项 -->
                  <div class="mb-8">
                    <h4 class="text-lg font-medium mb-4 flex items-center gap-2">
                      <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      其他选项
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div class="space-y-4">
                        <div class="flex items-center gap-4">
                          <el-checkbox v-model="quoteOptions.includeTax" class="!m-0">
                            <span class="text-gray-700">包含税费</span>
                          </el-checkbox>
                          <el-checkbox v-model="quoteOptions.includeNDA" class="!m-0">
                            <span class="text-gray-700">包含保密协议</span>
                          </el-checkbox>
                        </div>
                        <div v-if="quoteOptions.includeTax" class="flex items-center gap-2">
                          <span class="text-sm text-gray-600">税率：</span>
                          <el-select v-model="quoteOptions.taxRate" placeholder="选择税率" class="w-32">
                            <el-option label="3%" value="0.03" />
                            <el-option label="6%" value="0.06" />
                            <el-option label="9%" value="0.09" />
                            <el-option label="13%" value="0.13" />
                          </el-select>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm text-gray-600">折扣：</span>
                          <el-input-number v-model="quoteOptions.discount" :min="0" :max="100" :step="5" class="w-32" />
                          <span class="text-sm text-gray-600">%</span>
                        </div>
                      </div>
                      <div class="space-y-4">
                        <el-input type="textarea" v-model="quoteOptions.notes" placeholder="备注说明" :rows="3" />
                        <div v-if="quoteOptions.includeNDA">
                          <el-input type="textarea" v-model="quoteOptions.ndaContent" placeholder="保密协议内容" :rows="3" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 费用汇总 -->
                  <div class="mb-8">
                    <div class="flex justify-end">
                      <div class="w-80 bg-gray-50 rounded-lg p-4">
                        <table class="w-full text-right">
                          <tr>
                            <td class="py-1 text-gray-600">项目总计：</td>
                            <td class="py-1 pl-4 font-medium">¥{{ calculateSubtotal().toFixed(2) }}</td>
                          </tr>
                          <tr v-if="quoteOptions.discount > 0">
                            <td class="py-1 text-gray-600">折扣({{ quoteOptions.discount }}%)：</td>
                            <td class="py-1 pl-4 text-blue-600 font-medium">-¥{{ calculateDiscount().toFixed(2) }}</td>
                          </tr>
                          <tr v-if="quoteOptions.includeTax">
                            <td class="py-1 text-gray-600">税费({{ Number(quoteOptions.taxRate) * 100 }}%)：</td>
                            <td class="py-1 pl-4 text-orange-600 font-medium">+¥{{ calculateTax().toFixed(2) }}</td>
                          </tr>
                          <tr class="border-t border-gray-200">
                            <td class="py-2 font-medium">最终总计：</td>
                            <td class="py-2 pl-4 text-xl font-bold text-blue-600">¥{{ calculateTotal().toFixed(2) }}
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </div>

                  <!-- 导出按钮 -->
                  <div class="flex justify-center gap-4">
                    <el-button type="primary" @click="showPreview('pdf')" size="large" class="!px-8">
                      <i class="el-icon-document mr-2"></i>导出PDF
                    </el-button>
                    <el-button type="primary" @click="showPreview('image')" size="large" class="!px-8">
                      <i class="el-icon-picture mr-2"></i>导出图片
                    </el-button>
                    <el-button @click="resetQuote" size="large" class="!px-8">
                      <i class="el-icon-refresh mr-2"></i>重置报价
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 预览对话框 -->
  <el-dialog v-model="previewVisible" title="报价单预览" width="80%" :before-close="handlePreviewClose"
    class="preview-dialog">
    <div class="preview-container bg-white p-8 mx-auto" ref="previewRef" style="width: 794px;">
      <!-- 报价单头部 -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold mb-2">{{ selectedType?.label }}项目报价单</h2>
        <div class="text-sm text-gray-500">报价日期：{{ new Date().toLocaleDateString() }}</div>
      </div>

      <!-- 基本信息 -->
      <div class="mb-6 text-sm">
        <table class="w-full border-collapse">
          <tr>
            <td class="py-2 w-1/4">公司名称：</td>
            <td class="py-2 w-1/4 font-medium">{{ companyInfo.name }}</td>
            <td class="py-2 w-1/4">项目名称：</td>
            <td class="py-2 w-1/4 font-medium">{{ quoteResult?.projectName }}</td>
          </tr>
          <tr>
            <td class="py-2">联系人：</td>
            <td class="py-2 font-medium">{{ companyInfo.contact }}</td>
            <td class="py-2">联系电话：</td>
            <td class="py-2 font-medium">{{ formatPhone(companyInfo.phone) }}</td>
          </tr>
        </table>
      </div>

      <!-- 项目概述 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">项目概述</h3>
        <p class="text-gray-700">{{ quoteResult?.summary }}</p>
      </div>

      <!-- 工作范围 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">工作范围</h3>
        <ul class="list-disc list-inside space-y-2">
          <li v-for="(item, index) in quoteResult?.scope" :key="index" class="text-gray-700">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- 报价明细 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">报价明细</h3>
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="py-2 px-4 text-left">项目名称</th>
              <th class="py-2 px-4 text-left">描述</th>
              <th class="py-2 px-4 text-right">金额(¥)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in quoteResult?.costs" :key="index" class="border-b">
              <td class="py-2 px-4">{{ item.name }}</td>
              <td class="py-2 px-4 text-gray-600">{{ item.desc }}</td>
              <td class="py-2 px-4 text-right">{{ item.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 费用汇总 -->
      <div class="mb-6">
        <div class="flex justify-end">
          <table class="w-64 text-right">
            <tr>
              <td class="py-1">税前总计：</td>
              <td class="py-1 pl-4 font-medium">¥{{ calculateSubtotal().toFixed(2) }}</td>
            </tr>
            <template v-if="quoteOptions.includeTax">
              <tr>
                <td class="py-1">税费({{ Number(quoteOptions.taxRate) * 100 }}%)：</td>
                <td class="py-1 pl-4 font-medium">¥{{ calculateTax().toFixed(2) }}</td>
              </tr>
            </template>
            <tr class="border-t border-gray-200">
              <td class="py-2">总计金额：</td>
              <td class="py-2 pl-4 font-bold">¥{{ calculateTotal().toFixed(2) }}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- 其他说明 -->
      <div class="mb-6 text-sm">
        <div v-if="quoteOptions.notes" class="mb-4">
          <div class="font-medium mb-2">备注说明：</div>
          <div class="text-gray-600">{{ quoteOptions.notes }}</div>
        </div>
        <div class="text-gray-500">* 本报价单有效期{{ quoteResult?.validDays || 30 }}天</div>
      </div>

      <!-- 保密协议 -->
      <div v-if="quoteOptions.includeNDA" class="mb-8 text-sm">
        <div class="font-medium mb-2">保密协议：</div>
        <div class="text-gray-600">{{ quoteOptions.ndaContent }}</div>
      </div>

      <!-- 签字区域 -->
      <div class="grid grid-cols-2 gap-32 text-sm mt-12">
        <div>
          <div class="mb-8">报价方（签章）：</div>
          <div>日期：</div>
        </div>
        <div>
          <div class="mb-8">客户方（签章）：</div>
          <div>日期：</div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer flex justify-end gap-4">
        <el-button @click="previewVisible = false">关闭预览</el-button>
        <el-button type="primary" @click="handleExport" :loading="exporting">
          {{ exportType === 'pdf' ? '导出PDF' : '导出图片' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, h, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'
import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import { debounce } from 'lodash-es'
import { useRouter, useRoute } from 'vue-router'
import type { CascaderOption } from 'element-plus'
import { ElCascader } from 'element-plus'

// 初始化路由
const router = useRouter()
const route = useRoute()

// 添加 previewLoading 的定义
const previewLoading = ref(false)

// 修复类型定义
interface Message {
  role: string
  content: string
  reasoning_content?: string
}

interface CostItem {
  name: string
  desc: string
  amount: number
}

interface QuoteResult {
  projectName: string
  date: string
  validDays: number
  summary: string
  scope: string[]
  costs: CostItem[]
  total: number
  timeEstimate?: string
}

interface CompanyInfo {
  name: string
  contact: string
  phone: string
}

interface QuoteOptions {
  includeTax: boolean
  includeNDA: boolean
  taxRate: string
  discount: number
  notes: string
  ndaContent: string
  includeWatermark: boolean
}

interface CompanyTemplate {
  id: number
  name: string
  contact: string
  phone: string
  isCustom?: boolean
}

// 预设的公司模板
const companyTemplates = ref<CompanyTemplate[]>([
  {
    id: 1,
    name: '创意设计工作室',
    contact: '张先生',
    phone: '13800138000'
  },
  {
    id: 2,
    name: '品牌设计公司',
    contact: '李小姐',
    phone: '13900139000'
  }
])

// 选中的公司模板ID
const selectedCompanyTemplate = ref<number | null>(null)

// 组件配置信息
const info = reactive({
  title: 'AI外包报价生成器',
  subtitle: '智能生成专业的外包项目报价单，支持多种项目类型'
})

// 功能特性
const features = [
  {
    icon: 'Project',
    title: '多项目类型',
    desc: '支持程序开发、短视频制作、设计等多种项目类型'
  },
  {
    icon: 'AI',
    title: 'AI智能分析',
    desc: '智能分析项目需求，生成合理的工作量和成本预算'
  },
  {
    icon: 'Price',
    title: '灵活报价',
    desc: '根据市场行情和项目复杂度，生成合理的报价方案'
  },
  {
    icon: 'Export',
    title: '导出分享',
    desc: '支持导出专业的报价单文档，方便分享和存档'
  }
]

// API类型
const apiType = ref('free')
const customApiKey = ref('')

// API配置
const apiKey = ref(import.meta.env.VITE_SILICONFLOW_API_KEY || '')

// 检查API Key
const checkApiKey = computed(() => {
  return apiKey.value.length > 0
})

// AI模型选择
const modelType = ref('deepseek-ai/DeepSeek-R1-Distill-Qwen-7B')
const modelOptions = [
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B', label: 'DeepSeek R1 7B', desc: '推荐使用', maxTokens: 8000, isRecommend: true },
  { value: 'deepseek-ai/DeepSeek-R1', label: 'DeepSeek R1', desc: '华为云昇腾云服务版', maxTokens: 8000 },
  { value: 'Pro/deepseek-ai/DeepSeek-R1', label: 'Pro DeepSeek R1', desc: '专业版', maxTokens: 8000 },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B', label: 'DeepSeek R1 70B', desc: '大规模模型', maxTokens: 8000 },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B', label: 'DeepSeek R1 32B', desc: '中等规模', maxTokens: 8000 },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B', label: 'DeepSeek R1 14B', desc: '平衡型', maxTokens: 8000 },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Llama-8B', label: 'DeepSeek R1 8B', desc: '轻量级', maxTokens: 8000 },
  { value: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', label: 'DeepSeek R1 1.5B', desc: '超轻量级', maxTokens: 4000 }
]

interface ProjectTypeOption extends CascaderOption {
  value: string
  label: string
  description?: string
  children?: ProjectTypeOption[]
}

// 项目类型选项
const projectTypeOptions = [
  {
    category: '开发类',
    items: [
      {
        value: 'web',
        label: 'Web开发',
        icon: 'WebIcon',
        description: '网站、管理系统等开发',
        commonRequirements: ['用户系统', '支付功能', '数据统计', '移动端适配']
      },
      {
        value: 'app',
        label: 'App开发',
        icon: 'MobileIcon',
        description: '原生应用、混合开发',
        commonRequirements: ['iOS开发', 'Android开发', '推送通知', '应用内购']
      },
      {
        value: 'miniprogram',
        label: '小程序开发',
        icon: 'WechatIcon',
        description: '微信、支付宝等小程序',
        commonRequirements: ['微信登录', '微信支付', '数据分析', '分享功能']
      },
      {
        value: 'saas',
        label: 'SaaS平台',
        icon: 'CloudIcon',
        description: '软件即服务平台开发',
        commonRequirements: ['多租户', '权限管理', '数据分析', '自动化工作流']
      }
    ]
  },
  {
    category: '短视频与新媒体',
    items: [
      {
        value: 'shortVideo',
        label: '短视频制作',
        icon: 'VideoIcon',
        description: '抖音、快手等平台内容',
        commonRequirements: ['脚本策划', '拍摄制作', '后期剪辑', '特效包装']
      },
      {
        value: 'videoEdit',
        label: '视频剪辑',
        icon: 'EditIcon',
        description: '视频编辑与后期制作',
        commonRequirements: ['画面剪辑', '音频处理', '特效制作', '调色']
      },
      {
        value: 'liveStreaming',
        label: '直播运营',
        icon: 'LiveIcon',
        description: '直播内容策划与执行',
        commonRequirements: ['内容策划', '场景布置', '直播执行', '数据分析']
      },
      {
        value: 'mediaOperation',
        label: '新媒体运营',
        icon: 'MediaIcon',
        description: '新媒体账号运营',
        commonRequirements: ['内容创作', '粉丝运营', '活动策划', '数据分析']
      }
    ]
  },
  {
    category: '设计类',
    items: [
      {
        value: 'uiDesign',
        label: 'UI设计',
        icon: 'DesignIcon',
        description: '界面设计、交互设计',
        commonRequirements: ['界面设计', '交互设计', '原型设计', '设计规范']
      },
      {
        value: 'visualDesign',
        label: '视觉设计',
        icon: 'ArtIcon',
        description: '平面、品牌视觉设计',
        commonRequirements: ['品牌设计', '广告设计', '包装设计', '印刷设计']
      },
      {
        value: 'motionDesign',
        label: '动效设计',
        icon: 'AnimationIcon',
        description: '动画效果、转场设计',
        commonRequirements: ['动画设计', '转场设计', '视觉特效', '交互动效']
      },
      {
        value: 'industrialDesign',
        label: '工业设计',
        icon: 'IndustryIcon',
        description: '产品外观与结构设计',
        commonRequirements: ['外观设计', '结构设计', '材料选择', '工艺优化']
      }
    ]
  }
]

// 项目类型选择
const projectType = ref('')

// 监听项目类型变化
watch(projectType, (newType) => {
  requirementExamples.value = getRequirementExamples(newType)
})

// 获取选中的项目类型
const selectedType = computed(() => {
  if (!projectType.value) return null
  for (const category of projectTypeOptions) {
    const found = category.items.find(item => item.value === projectType.value)
    if (found) return found
  }
  return null
})

// 获取需求示例
const getRequirementExamples = (type) => {
  const baseText = '请描述您的具体需求：\n\n'
  const selectedType = projectTypeOptions
    .flatMap(category => category.items)
    .find(item => item.value === type)

  if (!selectedType) return baseText

  return `${baseText}1. 项目类型：${selectedType.label}\n2. 主要功能：${selectedType.commonRequirements.join('、')}\n3. 其他要求：性能、安全性、维护等`
}

const requirements = ref('')
const requirementExamples = ref(getRequirementExamples('web'))

// 报价偏好
const pricePreferenceOptions = [
  { value: 'economic', label: '经济实惠型' },
  { value: 'balanced', label: '性价比均衡型' },
  { value: 'quality', label: '品质优先型' }
]
const pricePreference = ref('balanced')

// 状态变量
const messages = ref<Message[]>([])
const generating = ref(false)
const currentThought = ref('')
const quoteResult = ref<QuoteResult | null>(null)

// 创建新的 AbortController
const controller = ref<AbortController | null>(null)

// 修改生成报价函数
const generate = async () => {
  if (!checkApiKey.value) {
    ElMessage.warning('请先配置 API Key')
    return
  }

  if (!requirements.value) {
    ElMessage.warning('请输入项目需求')
    return
  }

  generating.value = true
  currentThought.value = '正在分析项目需求和市场情况...'

  try {
    const response = await fetch('/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.value}`
      },
      body: JSON.stringify({
        model: modelType.value,
        messages: [
          {
            role: 'system',
            content: `你是一个专业的软件开发外包顾问。请根据用户的需求生成一份详细的报价方案，包含以下内容：
1. 项目名称
2. 项目概述
3. 工作范围(用数组返回)
4. 时间估算
5. 费用明细(包含具体费用项及金额)
6. 总报价

请用JSON格式返回,格式如下:
{
  "projectName": "项目名称",
  "summary": "项目概述",
  "scope": ["工作范围1", "工作范围2"],
  "timeEstimate": "时间估算",
  "costs": [
    {"name": "费用项", "desc": "费用说明", "amount": 1000}
  ],
  "total": 10000
}`
          },
          {
            role: 'user',
            content: `项目类型: ${selectedType.value?.label}\n项目需求: ${requirements.value}\n报价偏好: ${pricePreferenceOptions.find(item => item.value === pricePreference.value)?.label}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'API请求失败')
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    let responseText = ''
    let reasoningText = ''

    messages.value.push({
      role: 'assistant',
      content: '',
      reasoning_content: ''
    })

    const currentIndex = messages.value.length - 1

    while (true) {
      const { done, value } = await reader!.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonData = line.slice(6).trim()
          if (!jsonData || jsonData === '[DONE]') continue

          try {
            const data = JSON.parse(jsonData)
            const choice = data.choices[0]

            if (choice.delta?.reasoning_content) {
              reasoningText += choice.delta.reasoning_content
              messages.value[currentIndex].reasoning_content = reasoningText
            }

            if (choice.delta?.content) {
              responseText += choice.delta.content
              messages.value[currentIndex].content = responseText
            }
          } catch (error) {
            console.error('解析响应数据失败:', error)
          }
        }
      }
    }

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('返回格式不正确');
      }
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);

      // 验证必要字段
      if (!result.projectName || !result.summary || !result.scope || !result.timeEstimate || !result.costs || !result.total) {
        throw new Error('返回数据不完整');
      }

      // 设置报价结果
      quoteResult.value = {
        projectName: result.projectName,
        date: new Date().toLocaleDateString(),
        validDays: 30,
        summary: result.summary,
        scope: result.scope,
        timeEstimate: result.timeEstimate,
        costs: result.costs.map((item: any) => ({
          name: item.name,
          desc: item.desc || '',
          amount: Number(item.amount)
        })),
        total: Number(result.total)
      }

      // 初始化公司信息（如果为空）
      if (!companyInfo.value.name) {
        companyInfo.value = {
          name: '',
          contact: '',
          phone: ''
        }
      }

      // 初始化报价选项
      quoteOptions.value = {
        includeTax: false,
        includeNDA: false,
        taxRate: '0.13',
        discount: 0,
        notes: '',
        ndaContent: '本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。',
        includeWatermark: false
      }

      ElMessage.success('报价生成成功')
    } catch (error: any) {
      console.error('解析报价结果失败:', error)
      throw new Error('生成报价失败: ' + error.message)
    }

  } catch (error: any) {
    ElMessage.error(`生成报价失败: ${error.message}`)
  } finally {
    generating.value = false
    currentThought.value = ''
  }
}

// 取消生成
const cancelGenerate = () => {
  generating.value = false
  currentThought.value = ''
}

// 修改导出报价单函数
const exportToPDF = async () => {
  if (!validateForm()) return

  try {
    exporting.value = true
    const element = previewRef.value
    if (!element) {
      throw new Error('未找到预览元素')
    }

    await nextTick()

    // 生成文件名
    const fileName = `${companyInfo.value.name}-${quoteResult.value?.projectName}-报价单-${new Date().getTime()}`

    // 如果启用了水印，添加水印
    if (quoteOptions.value.includeWatermark) {
      const watermarkText = companyInfo.value.name
      const watermarkDiv = document.createElement('div')
      watermarkDiv.style.position = 'absolute'
      watermarkDiv.style.top = '0'
      watermarkDiv.style.left = '0'
      watermarkDiv.style.width = '100%'
      watermarkDiv.style.height = '100%'
      watermarkDiv.style.pointerEvents = 'none'
      watermarkDiv.style.zIndex = '1000'

      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.rotate(-20 * Math.PI / 180)
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
        ctx.fillText(watermarkText, 0, 100)
      }

      watermarkDiv.style.background = `url(${canvas.toDataURL()}) repeat`
      element.appendChild(watermarkDiv)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    // 如果添加了水印，在导出后移除水印元素
    if (quoteOptions.value.includeWatermark && element.lastChild) {
      element.removeChild(element.lastChild)
    }

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${fileName}.pdf`)

    ElMessage.success('PDF导出成功')
    previewVisible.value = false
  } catch (error) {
    console.error('PDF导出失败:', error)
    ElMessage.error('PDF导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 修改导出图片函数
const exporting = ref(false)

const exportToImage = async () => {
  if (!validateForm()) return

  try {
    exporting.value = true
    const element = previewRef.value
    if (!element) {
      throw new Error('未找到预览元素')
    }

    // 等待DOM更新完成
    await nextTick()

    // 生成文件名
    const fileName = `${companyInfo.value.name}-${quoteResult.value?.projectName}-报价单-${new Date().getTime()}`

    // 如果启用了水印，添加水印
    if (quoteOptions.value.includeWatermark) {
      const watermarkText = companyInfo.value.name
      const watermarkDiv = document.createElement('div')
      watermarkDiv.style.position = 'absolute'
      watermarkDiv.style.top = '0'
      watermarkDiv.style.left = '0'
      watermarkDiv.style.width = '100%'
      watermarkDiv.style.height = '100%'
      watermarkDiv.style.pointerEvents = 'none'
      watermarkDiv.style.zIndex = '1000'

      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.rotate(-20 * Math.PI / 180)
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
        ctx.fillText(watermarkText, 0, 100)
      }

      watermarkDiv.style.background = `url(${canvas.toDataURL()}) repeat`
      element.appendChild(watermarkDiv)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    // 如果添加了水印，在导出后移除水印元素
    if (quoteOptions.value.includeWatermark && element.lastChild) {
      element.removeChild(element.lastChild)
    }

    // 创建下载链接
    const dataUrl = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `${fileName}.png`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('图片导出成功')
    previewVisible.value = false // 导出成功后关闭预览
  } catch (error) {
    console.error('图片导出失败:', error)
    ElMessage.error('图片导出失败，请重试')
  } finally {
    exporting.value = false
  }
}

// 分享报价
const shareQuote = () => {
  ElMessage.success('分享链接已复制')
}

const updateThought = (thought: string) => {
  currentThought.value = thought
}

// 预览对话框相关
const previewVisible = ref(false)
const previewRef = ref<HTMLElement | null>(null)
const companyInfo = ref<CompanyInfo>({
  name: '',
  contact: '',
  phone: ''
})
const quoteOptions = ref<QuoteOptions>({
  includeTax: false,
  includeNDA: false,
  taxRate: '0.13',
  discount: 0,
  notes: '',
  ndaContent: '本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。',
  includeWatermark: false
})

const calculateSubtotal = () => {
  return quoteResult.value?.costs.reduce((total, item) => total + item.amount, 0) || 0
}

const calculateDiscount = () => {
  const subtotal = calculateSubtotal()
  return subtotal * (quoteOptions.value.discount / 100)
}

const calculateTax = () => {
  const subtotal = calculateSubtotal()
  const taxRate = Number(quoteOptions.value.taxRate)
  return subtotal * taxRate
}

const calculateTotal = () => {
  const subtotal = calculateSubtotal()
  const discount = calculateDiscount()
  const tax = calculateTax()
  return subtotal - discount + tax
}

// 修改导出相关的变量
const exportType = ref<'pdf' | 'image'>('pdf')

// 显示预览
const showPreview = async (type: 'pdf' | 'image') => {
  if (!validateForm()) return
  exportType.value = type
  previewVisible.value = true
}

// 处理导出
const handleExport = async () => {
  if (!validateForm()) return

  try {
    exporting.value = true
    const element = previewRef.value
    if (!element) {
      throw new Error('未找到预览元素')
    }

    // 等待DOM更新完成
    await nextTick()

    // 等待一小段时间确保内容完全渲染
    await new Promise(resolve => setTimeout(resolve, 300))

    // 生成文件名
    const fileName = `${companyInfo.value.name}-${quoteResult.value?.projectName}-报价单-${new Date().getTime()}`

    // 如果启用了水印，添加水印
    if (quoteOptions.value.includeWatermark) {
      const watermarkText = companyInfo.value.name
      const watermarkDiv = document.createElement('div')
      watermarkDiv.style.position = 'absolute'
      watermarkDiv.style.top = '0'
      watermarkDiv.style.left = '0'
      watermarkDiv.style.width = '100%'
      watermarkDiv.style.height = '100%'
      watermarkDiv.style.pointerEvents = 'none'
      watermarkDiv.style.zIndex = '1000'

      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.rotate(-20 * Math.PI / 180)
        ctx.font = '16px Arial'
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)'
        ctx.fillText(watermarkText, 0, 100)
      }

      watermarkDiv.style.background = `url(${canvas.toDataURL()}) repeat`
      element.appendChild(watermarkDiv)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    })

    // 如果添加了水印，在导出后移除水印元素
    if (quoteOptions.value.includeWatermark && element.lastChild) {
      element.removeChild(element.lastChild)
    }

    if (exportType.value === 'pdf') {
      // 导出为PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${fileName}.pdf`)
      ElMessage.success('PDF导出成功')
    } else {
      // 导出为图片
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${fileName}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('图片导出成功')
    }

    previewVisible.value = false
  } catch (error: any) {
    console.error('导出失败:', error)
    ElMessage.error(`导出失败: ${error?.message || '未知错误'}`)
  } finally {
    exporting.value = false
  }
}

// 处理预览对话框关闭
const handlePreviewClose = () => {
  if (exporting.value) {
    ElMessageBox.confirm(
      '正在导出中,确定要关闭预览吗?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      previewVisible.value = false
      exporting.value = false
    }).catch(() => {
      // 取消关闭
    })
  } else {
    previewVisible.value = false
  }
}

// 监听报价选项变化
watch([() => quoteOptions.value.includeTax, () => quoteOptions.value.taxRate, () => quoteOptions.value.discount], () => {
  if (quoteResult.value) {
    quoteResult.value.total = calculateTotal()
  }
})

// 保存公司模板
const saveCompanyTemplate = async () => {
  if (!validateForm()) return

  try {
    const newTemplate: CompanyTemplate = {
      id: Date.now(),
      name: companyInfo.value.name,
      contact: companyInfo.value.contact,
      phone: companyInfo.value.phone,
      isCustom: true
    }
    companyTemplates.value.push(newTemplate)
    ElMessage.success('模板保存成功')
  } catch (error: any) {
    ElMessage.error(`保存失败: ${error?.message || '未知错误'}`)
  }
}

// 显示公司模板选择
const showCompanyTemplates = () => {
  // 这里可以使用 Element Plus 的 Dialog 组件显示模板列表
  ElMessageBox.confirm(
    h('div', { class: 'company-templates' }, [
      h('h3', { class: 'mb-4 font-medium' }, '选择公司模板'),
      h('div', { class: 'grid gap-4' }, companyTemplates.value.map(template =>
        h('div', {
          class: 'border rounded-lg p-4 cursor-pointer hover:bg-gray-50',
          onClick: () => applyCompanyTemplate(template)
        }, [
          h('div', { class: 'font-medium' }, template.name),
          h('div', { class: 'text-sm text-gray-600 mt-1' }, [
            `联系人：${template.contact}`,
            h('br'),
            `电话：${formatPhone(template.phone)}`
          ])
        ])
      ))
    ]),
    '选择模板',
    {
      confirmButtonText: '关闭',
      showCancelButton: false,
      customClass: 'company-template-dialog'
    }
  )
}

// 应用公司模板
const applyCompanyTemplate = (template: CompanyTemplate) => {
  companyInfo.value.name = template.name
  companyInfo.value.contact = template.contact
  companyInfo.value.phone = template.phone
  selectedCompanyTemplate.value = template.id
  ElMessage.success('已应用模板')
}

// 添加报价明细
const addCostItem = () => {
  if (!quoteResult.value) return

  quoteResult.value.costs.push({
    name: '',
    desc: '',
    amount: 0
  })
}

// 移除报价明细
const removeCostItem = (index: number) => {
  if (!quoteResult.value) return

  quoteResult.value.costs.splice(index, 1)
  ElMessage.success('已移除明细项')
}

// 重置报价
const resetQuote = () => {
  // 重置公司信息
  companyInfo.value = {
    name: '',
    contact: '',
    phone: ''
  }

  // 重置报价选项
  quoteOptions.value = {
    includeTax: false,
    includeNDA: false,
    taxRate: '0.13',
    discount: 0,
    notes: '',
    ndaContent: '本报价单（或订单）所涉之全部报价金额均属于保密信息，一方未经另一方事先书面许可，不得将该等金额透露给任何第三方。',
    includeWatermark: false
  }

  // 重置选中的模板
  selectedCompanyTemplate.value = null

  ElMessage.success('已重置报价单')
}

// 格式化电话号码
const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone // 直接返回原始号码，不做打码处理
}

// 添加表单验证
const validateForm = () => {
  if (!companyInfo.value.name) {
    ElMessage.warning('请填写公司名称')
    return false
  }
  if (!companyInfo.value.contact) {
    ElMessage.warning('请填写联系人')
    return false
  }
  if (!companyInfo.value.phone) {
    ElMessage.warning('请填写联系电话')
    return false
  }
  if (!quoteResult.value?.projectName) {
    ElMessage.warning('请填写项目名称')
    return false
  }
  return true
}

// 添加自动保存功能
const autoSave = debounce(() => {
  localStorage.setItem('quoteData', JSON.stringify({
    companyInfo: companyInfo.value,
    quoteResult: quoteResult.value,
    quoteOptions: quoteOptions.value
  }))
}, 1000)

// 监听数据变化自动保存
watch([companyInfo, quoteResult, quoteOptions], () => {
  autoSave()
}, { deep: true })

// 页面加载时恢复数据
onMounted(() => {
  const savedData = localStorage.getItem('quoteData')
  if (savedData) {
    try {
      const { companyInfo: savedCompanyInfo, quoteResult: savedQuoteResult, quoteOptions: savedQuoteOptions } = JSON.parse(savedData)
      companyInfo.value = savedCompanyInfo
      quoteResult.value = savedQuoteResult
      quoteOptions.value = savedQuoteOptions
    } catch (error) {
      console.error('恢复数据失败:', error)
    }
  }
})
// 添加路由离开前的处理
const unwatch = router.beforeEach(async (to: any, from: any, next: any) => {
  // 如果是从当前页面离开且有未保存的报价数据
  if (from.path === route.path && quoteResult.value && generating.value) {
    try {
      await ElMessageBox.confirm(
        '当前有正在生成的报价单,确定要离开吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      // 用户确认离开,清理状态并刷新页面
      handlePageLeave()
      next()
    } catch {
      // 用户取消,停留在当前页面
      next(false)
    }
  } else {
    // 其他情况,清理状态并刷新页面
    handlePageLeave()
    next()
  }
})

// 组件卸载时清理路由守卫
onUnmounted(() => {
  unwatch()
})

// 添加页面离开时的清理函数
const handlePageLeave = () => {
  // 停止所有正在进行的请求
  if (controller.value) {
    controller.value.abort()
    controller.value = null
  }

  // 清理状态
  generating.value = false
  currentThought.value = ''

  // 添加一个延时刷新,确保路由跳转完成后再刷新
  setTimeout(() => {
    window.location.reload()
  }, 100)
}

// ... existing code ...
const parseReasoningSteps = (content) => {
  if (!content) return []
  // 将推理内容按段落或数字列表分割成步骤
  return content.split(/\n(?=\d+[\.\)]|\n)/)
    .filter(step => step.trim())
    .map(step => step.trim())
}

const getQuickTags = computed(() => {
  const current = selectedType.value
  return current?.commonRequirements || []
})

const getPlaceholder = () => {
  const baseText = '请详细描述您的项目需求，例如：\n'
  const current = selectedType.value
  if (!current) return baseText
  return `${baseText}1. 项目类型：${current.label}\n2. 主要功能：${current.commonRequirements.join('、')}\n3. 其他要求：性能、安全性、维护等`
}

const suggestions = ref<string[]>([])
const updateSuggestions = (input: string) => {
  if (!input) {
    suggestions.value = []
    return
  }
  if (!selectedType.value) return

  const missingInfo: string[] = []
  if (!input.includes('预算')) {
    missingInfo.push('💰 项目预算范围')
  }
  if (!input.includes('时间') && !input.includes('周期')) {
    missingInfo.push('⏱️ 项目开发周期')
  }
  if (!input.includes('维护')) {
    missingInfo.push('🔧 后期维护需求')
  }
  suggestions.value = missingInfo
}

// 添加建议到需求
const appendRequirement = (suggestion) => {
  requirements.value += `\n${suggestion}：`
}
// ... existing code ...
</script>

<style scoped>
.el-input {
  --el-input-border-color: #e5e7eb;
  --el-input-hover-border-color: #93c5fd;
  --el-input-focus-border-color: #3b82f6;
}

.el-select {
  width: 100%;
}

.el-textarea__inner {
  min-height: 120px !important;
}

/* 优化按钮样式 */
.el-button {
  box-shadow: none !important;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  border: none;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #4338ca 0%, #2563eb 100%);
  transform: translateY(-1px);
}

.el-button--success {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border: none;
}

/* 优化预览对话框样式 */
.preview-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 20px 24px;
  margin: 0;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.preview-container {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 优化表格样式 */
.preview-container table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.preview-container th,
.preview-container td {
  border: 1px solid #e5e7eb;
  padding: 12px;
}

.preview-container thead th {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  font-weight: 600;
}

/* 优化输入框样式 */
.el-input :deep(.el-input__inner) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.el-input :deep(.el-input__inner:focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 优化选择框样式 */
.el-select :deep(.el-input__wrapper) {
  border-radius: 8px;
}

/* 优化复选框样式 */
.el-checkbox :deep(.el-checkbox__inner) {
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* 优化卡片样式 */
.cost-item {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cost-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 优化动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quote-result {
  animation: fadeIn 0.5s ease-out;
}

/* 打印样式优化 */
@media print {
  .preview-container {
    box-shadow: none;
  }

  .preview-container table {
    page-break-inside: avoid;
  }

  .preview-container thead {
    display: table-header-group;
  }

  .preview-container tbody {
    display: table-row-group;
  }
}

.ai-outsource-quote {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.el-cascader {
  width: 100%;
}

:deep(.el-cascader-panel) {
  max-height: 300px;
}
</style>
