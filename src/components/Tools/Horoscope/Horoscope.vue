/**
* @file Horoscope.vue
* @description 星座运势工具，支持多时段运势查询和运势卡片生成
*
* @copyright Tomda (https://www.tomda.top)
* @copyright UIED技术团队 (https://fsuied.com)
* @copyright 2024-2025 All Rights Reserved.
*
* @author Tomda
* @createDate 2025-01-28
* @lastUpdate 2025-01-28 22:58
* @version Beta 1.0.9
* @toolsCount 当前工具总数：61个
*
* @features
* - 支持多时段运势查询（今日/明日/本周/本月）
* - 支持运势卡片生成与分享功能
* - 支持二维码快速访问
* - 优雅的响应式布局设计
* - 实时获取最新星座运势数据
* - 支持一键生成运势卡片
* - 支持复制和下载运势卡片
* - 优雅的动画和交互效果
*/

<template>
  <main class="min-h-screen bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-white">
    <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <!-- 主要内容区域 -->
      <article
        class="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-8 mb-6 sm:mb-8 border border-gray-100/80 shadow-sm">
        <!-- 标题区域优化 -->
        <header class="text-center mb-6 sm:mb-8 md:mb-10">
          <div
            class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl mb-3 sm:mb-4 transform hover:rotate-12 transition-transform duration-500 shadow-sm">
            <span class="text-2xl sm:text-3xl md:text-4xl filter drop-shadow-sm" role="img"
              aria-label="星座运势图标">🌟</span>
          </div>
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            {{ selectedZodiac }}座运势查询
          </h1>
          <p class="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">探索星座奥秘，掌握今日运程，了解命运指引</p>
        </header>

        <!-- 星座选择优化 -->
        <div class="relative mb-8 sm:mb-10">
          <div class="text-center mb-3 sm:mb-4 text-sm text-gray-500 font-medium">选择你的星座</div>
          <div ref="zodiacScroll" class="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
            <div v-for="zodiac in zodiacs" :key="zodiac.name" class="relative">
              <input type="radio" :id="zodiac.name" :value="zodiac.name" v-model="selectedZodiac" class="peer hidden" />
              <label :for="zodiac.name" class="block cursor-pointer select-none rounded-xl p-2 sm:p-3 md:p-4 text-center transition-all duration-300
                border border-transparent bg-gray-50/80 hover:bg-gray-100 hover:-translate-y-1
                peer-checked:bg-gradient-to-br peer-checked:from-indigo-50 peer-checked:to-purple-50 peer-checked:text-indigo-600 peer-checked:border-indigo-200/50
                peer-checked:scale-105 peer-checked:ring-1 peer-checked:ring-indigo-200/70 peer-checked:shadow-sm">
                <div class="flex flex-col items-center">
                  <div
                    class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center mb-1 sm:mb-2 transition-transform duration-300 group-hover:scale-110">
                    <span class="text-lg sm:text-xl md:text-2xl filter peer-checked:drop-shadow-sm">{{ zodiac.icon
                    }}</span>
                  </div>
                  <span class="text-xs md:text-sm font-medium">{{ zodiac.name }}座</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <button @click="getFortune" class="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-white font-medium bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500
            hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-sm
            flex items-center gap-2 group text-sm sm:text-base">
            <span v-if="loading"
              class="inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span v-else class="text-base md:text-lg group-hover:rotate-12 transition-transform duration-500">🔮</span>
            {{ loading ? '查询中...' : '查询运势' }}
          </button>
          <button @click="generatePreview" class="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl text-indigo-600 font-medium bg-gradient-to-r from-indigo-50 to-purple-50
            hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 shadow-sm border border-indigo-100/50
            flex items-center gap-2 group text-sm sm:text-base" :disabled="!fortune || isGenerating">
            <span v-if="isGenerating"
              class="inline-block w-4 h-4 md:w-5 md:h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span v-else class="text-base md:text-lg group-hover:rotate-12 transition-transform duration-500">✨</span>
            {{ isGenerating ? '生成中...' : '生成运势卡片' }}
          </button>
        </div>

        <!-- 预览弹窗优化 -->
        <el-dialog v-model="showPreview" title="星座运势卡片预览" width="90%" class="preview-dialog"
          :close-on-click-modal="false" :show-close="true" destroy-on-close :lock-scroll="false"
          :modal-append-to-body="false" :append-to-body="false">
          <div class="preview-container">
            <img v-if="previewImage" :src="previewImage" class="preview-image rounded-lg" alt="运势卡片预览" />
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showPreview = false">关闭</el-button>
              <el-button type="primary" @click="copyImage">
                <i class="el-icon-document-copy mr-1"></i> 复制图片
              </el-button>
              <el-button type="success" @click="downloadImage">
                <i class="el-icon-download mr-1"></i> 保存图片
              </el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 用于截图的容器 -->
        <div ref="captureRef" class="relative bg-white p-6 md:p-8 rounded-2xl max-w-3xl mx-auto border border-gray-100"
          :class="{ 'hidden': !showQRCode }">
          <!-- 二维码和标题 -->
          <div class="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <span class="text-2xl md:text-3xl">🌟</span>
              </div>
              <div class="text-center sm:text-left">
                <h3 class="text-lg md:text-xl font-bold text-gray-800">星座运势</h3>
                <p class="text-sm text-gray-500">扫码查看最新运势</p>
              </div>
            </div>
            <div v-show="showQRCode" class="bg-white p-2 rounded-lg border border-gray-100">
              <canvas ref="qrCodeRef" class="w-24 h-24"></canvas>
            </div>
          </div>

          <!-- 运势内容 -->
          <div v-if="fortune" class="space-y-6 md:space-y-8">
            <!-- 运势概览 -->
            <div class="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-5 md:p-6 border border-indigo-100">
              <div class="flex flex-col sm:flex-row items-center gap-5 md:gap-6 mb-5 md:mb-6">
                <div
                  class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
                  <span class="text-3xl md:text-4xl" role="img" :aria-label="`${selectedZodiac}座图标`">{{
                    selectedZodiacInfo?.icon
                  }}</span>
                </div>
                <div class="flex-1 text-center sm:text-left">
                  <h2 class="text-xl md:text-2xl font-bold text-gray-800 mb-1">{{ selectedZodiac }}座今日运势</h2>
                  <p class="text-sm text-gray-500">{{ selectedZodiacInfo?.dateRange }}</p>
                  <time class="text-sm text-indigo-500 mt-1" :datetime="new Date().toISOString().split('T')[0]">
                    今日运势
                  </time>
                </div>
                <div class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  <span class="text-3xl md:text-4xl font-bold text-indigo-600">{{ fortune.discuss }}</span>
                </div>
              </div>

              <p class="text-gray-600 mb-5 md:mb-6 text-center text-sm md:text-base">{{ fortune.shortcomment }}</p>

              <div class="space-y-3 md:space-y-4">
                <div class="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white border border-gray-50">
                  <div class="w-20 md:w-24 text-xs md:text-sm font-medium text-gray-700">综合运势</div>
                  <div class="flex-1 h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      :style="{ width: fortune.discuss }"></div>
                  </div>
                  <div class="w-20 md:w-24 text-xs md:text-sm text-indigo-600 text-right font-medium">{{ fortune.discuss
                    }}
                  </div>
                </div>
                <div class="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white border border-gray-50">
                  <div class="w-20 md:w-24 text-xs md:text-sm font-medium text-gray-700">健康指数</div>
                  <div class="flex-1 h-2 md:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                      :style="{ width: fortune.health }"></div>
                  </div>
                  <div class="w-20 md:w-24 text-xs md:text-sm text-indigo-600 text-right font-medium">{{ fortune.health
                    }}</div>
                </div>
              </div>
            </div>

            <!-- 运势详情卡片 -->
            <section class="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="运势详细信息">
              <article v-for="(type, key) in fortuneLabels" :key="key"
                class="bg-white rounded-xl p-4 md:p-5 border border-gray-100/80 shadow-sm hover:shadow transition-shadow duration-300">
                <h3 class="font-bold text-gray-800 mb-3 md:mb-4 flex items-center text-base md:text-lg">
                  <div class="w-8 h-8 flex items-center justify-center mr-2">
                    <span class="text-lg md:text-xl filter drop-shadow-sm" role="img" :aria-label="`${type}运势图标`">{{
                      fortuneIcons[key] }}</span>
                  </div>
                  {{ type }}运势
                </h3>
                <p class="text-gray-600 text-xs md:text-sm leading-relaxed">{{ fortune[`${key}text`] }}</p>
              </article>
            </section>

            <!-- 幸运指数面板 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div v-for="(item, index) in luckyItems" :key="index"
                class="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-100">
                <div class="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">{{ item.label }}</div>
                <div class="text-base md:text-lg font-medium text-indigo-600">{{ item.value }}</div>
              </div>
            </div>

            <!-- 健康建议 -->
            <div class="bg-emerald-50 rounded-2xl p-5 md:p-6 border border-emerald-100">
              <div class="text-center">
                <div class="text-sm md:text-base text-emerald-600 mb-2 md:mb-3 font-medium">健康建议</div>
                <div class="text-sm md:text-base text-emerald-700 font-medium">{{ fortune.healthtxt }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 实际显示的内容 -->
        <div v-show="!showQRCode">
          <!-- 运势展示优化 -->
          <div v-if="fortune" class="space-y-6 sm:space-y-8">
            <!-- 运势概览 -->
            <div
              class="bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-8 border border-indigo-100/50 shadow-sm">
              <div class="flex flex-col md:flex-row items-center gap-4 sm:gap-5 md:gap-6 mb-4 sm:mb-6 md:mb-8">
                <div
                  class="w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24 flex items-center justify-center bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl sm:rounded-2xl transform transition-transform duration-500 hover:rotate-12 shadow-sm">
                  <span class="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-sm">{{ selectedZodiacInfo?.icon
                  }}</span>
                </div>
                <div class="flex-1 text-center md:text-left">
                  <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">{{ selectedZodiac }}座
                  </h3>
                  <p class="text-xs sm:text-sm text-gray-500">{{ selectedZodiacInfo?.dateRange }}</p>
                  <p
                    class="inline-block mt-2 px-2 sm:px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs md:text-sm font-medium shadow-sm">
                    今日运势
                  </p>
                </div>
                <div
                  class="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent filter drop-shadow-sm">
                  {{ fortune.discuss }}
                </div>
              </div>

              <div
                class="max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8 border border-indigo-50 shadow-sm">
                <p class="text-gray-700 text-center text-sm sm:text-base md:text-lg font-medium">{{ fortune.shortcomment
                }}</p>
              </div>

              <div class="space-y-3 sm:space-y-4 md:space-y-5">
                <div
                  class="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-white/80 hover:bg-white transition-colors duration-300 border border-gray-50 shadow-sm">
                  <div class="w-16 sm:w-20 md:w-24 text-xs md:text-sm font-medium text-gray-700">综合运势</div>
                  <div class="flex-1 h-2 sm:h-2.5 md:h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-500 relative"
                      :style="{ width: fortune.discuss }">
                      <div class="absolute inset-0 bg-white/30 bg-opacity-25 overflow-hidden rounded-full">
                        <div class="h-full w-20 bg-white/20 skew-x-30 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div class="w-16 sm:w-20 md:w-24 text-xs md:text-sm text-indigo-600 text-right font-medium">{{
                    fortune.discuss
                  }}
                  </div>
                </div>
                <div
                  class="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-white/80 hover:bg-white transition-colors duration-300 border border-gray-50 shadow-sm">
                  <div class="w-16 sm:w-20 md:w-24 text-xs md:text-sm font-medium text-gray-700">健康指数</div>
                  <div class="flex-1 h-2 sm:h-2.5 md:h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-500 relative"
                      :style="{ width: fortune.health }">
                      <div class="absolute inset-0 bg-white/30 bg-opacity-25 overflow-hidden rounded-full">
                        <div class="h-full w-20 bg-white/20 skew-x-30 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div class="w-16 sm:w-20 md:w-24 text-xs md:text-sm text-indigo-600 text-right font-medium">{{
                    fortune.health
                  }}</div>
                </div>
              </div>
            </div>

            <!-- 运势详情卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div class="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:border-indigo-100
                transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
                <h4
                  class="font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center text-sm sm:text-base md:text-lg">
                  <div class="w-8 h-8 flex items-center justify-center mr-2">
                    <span
                      class="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">🌟</span>
                  </div>
                  综合运势
                </h4>
                <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">{{ fortune.alltext }}</p>
              </div>
              <div class="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:border-indigo-100
                transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
                <h4
                  class="font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center text-sm sm:text-base md:text-lg">
                  <div class="w-8 h-8 flex items-center justify-center mr-2">
                    <span
                      class="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">💝</span>
                  </div>
                  爱情运势
                </h4>
                <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">{{ fortune.lovetext }}</p>
              </div>
              <div class="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:border-indigo-100
                transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
                <h4
                  class="font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center text-sm sm:text-base md:text-lg">
                  <div class="w-8 h-8 flex items-center justify-center mr-2">
                    <span
                      class="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">💼</span>
                  </div>
                  事业运势
                </h4>
                <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">{{ fortune.worktext }}</p>
              </div>
              <div class="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-gray-100 hover:border-indigo-100
                transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow">
                <h4
                  class="font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center text-sm sm:text-base md:text-lg">
                  <div class="w-8 h-8 flex items-center justify-center mr-2">
                    <span
                      class="text-lg sm:text-xl md:text-2xl group-hover:scale-110 transition-transform duration-500 filter drop-shadow-sm">💰</span>
                  </div>
                  财运运势
                </h4>
                <p class="text-gray-600 text-xs sm:text-sm leading-relaxed">{{ fortune.moneytext }}</p>
              </div>
            </div>

            <!-- 幸运指数面板 -->
            <div
              class="bg-gradient-to-br from-white via-purple-50/20 to-purple-50/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-purple-100/50 shadow-sm">
              <h4 class="font-bold text-gray-800 mb-4 sm:mb-6 md:mb-8 text-center text-base sm:text-lg md:text-xl">
                今日幸运指数</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <div v-for="(item, index) in luckyItems" :key="index"
                  class="group bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:-translate-y-1 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow">
                  <div class="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">{{ item.label }}</div>
                  <div
                    class="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent filter drop-shadow-sm">
                    {{ item.value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 健康建议 -->
            <div
              class="bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-8 border border-emerald-100/50 shadow-sm">
              <div class="flex flex-col items-center">
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full mb-2 sm:mb-3 md:mb-4 shadow-sm">
                  <span class="text-lg sm:text-xl md:text-2xl filter drop-shadow-sm">💪</span>
                </div>
                <div class="text-sm sm:text-base md:text-lg text-emerald-600 mb-2 sm:mb-3 md:mb-4 font-medium">健康建议
                </div>
                <div
                  class="max-w-2xl mx-auto bg-white/90 backdrop-blur rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-emerald-50 shadow-sm">
                  <div class="text-sm sm:text-base md:text-lg text-emerald-700 font-medium text-center">{{
                    fortune.healthtxt }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 加载状态优化 -->
        <div v-if="loading" role="status" aria-label="加载中" class="py-10 sm:py-16 md:py-20 text-center">
          <div class="inline-block w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 relative">
            <div class="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></div>
            <div class="absolute inset-0 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent">
            </div>
          </div>
          <p class="mt-4 sm:mt-5 md:mt-6 text-gray-500 animate-pulse text-sm sm:text-base md:text-lg">正在获取星座运势...</p>
        </div>

        <!-- 错误状态优化 -->
        <div v-else-if="error" role="alert" class="py-10 sm:py-16 md:py-20 text-center">
          <div
            class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-rose-100 rounded-full mb-4 sm:mb-5 md:mb-6 shadow-sm">
            <span class="text-xl sm:text-2xl md:text-3xl filter drop-shadow-sm">⚠️</span>
          </div>
          <p class="text-rose-600 font-medium text-sm sm:text-base md:text-lg mb-3 sm:mb-4">{{ error }}</p>
          <button @click="getFortune"
            class="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-rose-50 to-rose-100 text-rose-600 rounded-lg hover:from-rose-100 hover:to-rose-200 transition-colors duration-300 border border-rose-100 text-sm sm:text-base shadow-sm">
            重新获取
          </button>
        </div>
      </article>

      <!-- 工具推荐 -->
      <aside>
        <ToolsRecommend :currentPath="route.path" />
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from '@vue/runtime-core'
import type { Ref } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import { ElMessage } from 'element-plus'
import axios, { AxiosError } from 'axios'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'

// 接口定义
interface Fortune {
  title: string
  time: string
  health: string
  discuss: string
  luckycolor: string
  luckynumber: string
  luckyconstellation: string
  shortcomment: string
  alltext: string
  lovetext: string
  worktext: string
  moneytext: string
  healthtxt: string
}

interface FortuneResponse {
  code: number
  msg: string
  xz: string
  data: Fortune
  api_source: string
}

// 星座数据
const zodiacs = [
  { name: '白羊', icon: '♈️', type: 'aries', dateRange: '3月21日-4月19日' },
  { name: '金牛', icon: '♉️', type: 'taurus', dateRange: '4月20日-5月20日' },
  { name: '双子', icon: '♊️', type: 'gemini', dateRange: '5月21日-6月21日' },
  { name: '巨蟹', icon: '♋️', type: 'cancer', dateRange: '6月22日-7月22日' },
  { name: '狮子', icon: '♌️', type: 'leo', dateRange: '7月23日-8月22日' },
  { name: '处女', icon: '♍️', type: 'virgo', dateRange: '8月23日-9月22日' },
  { name: '天秤', icon: '♎️', type: 'libra', dateRange: '9月23日-10月23日' },
  { name: '天蝎', icon: '♏️', type: 'scorpio', dateRange: '10月24日-11月22日' },
  { name: '射手', icon: '♐️', type: 'sagittarius', dateRange: '11月23日-12月21日' },
  { name: '摩羯', icon: '♑️', type: 'capricorn', dateRange: '12月22日-1月19日' },
  { name: '水瓶', icon: '♒️', type: 'aquarius', dateRange: '1月20日-2月18日' },
  { name: '双鱼', icon: '♓️', type: 'pisces', dateRange: '2月19日-3月20日' }
]

// 运势标签
const fortuneLabels = {
  all: '综合',
  love: '爱情',
  work: '事业',
  money: '财运',
  health: '健康'
}

// 状态管理
const selectedZodiac = ref('白羊')
const fortune: Ref<Fortune | null> = ref(null)
const loading = ref(false)
const error = ref('')
const route = useRoute()
const showQRCode = ref(false)
const showPreview = ref(false)
const previewImage = ref('')
const isGenerating = ref(false)

// 计算当前选中的星座信息
const selectedZodiacInfo = computed(() => {
  return zodiacs.find(z => z.name === selectedZodiac.value)
})

// 运势图标
const fortuneIcons = {
  all: '🌟',
  love: '💝',
  work: '💼',
  money: '💰',
  health: '💪'
}

// 幸运指数数据处理
const luckyItems = computed(() => {
  if (!fortune.value) return []
  return [
    { label: '幸运数字', value: fortune.value.luckynumber },
    { label: '幸运颜色', value: fortune.value.luckycolor },
    { label: '贵人星座', value: fortune.value.luckyconstellation },
    { label: '健康指数', value: fortune.value.health }
  ]
})

// 引用元素
const captureRef = ref<HTMLElement>()
const qrCodeRef = ref<HTMLCanvasElement>()

// 生成二维码
const generateQRCode = async () => {
  if (!qrCodeRef.value) return
  try {
    // 构建完整的 URL
    const fullUrl = new URL(window.location.pathname, window.location.origin)
    fullUrl.searchParams.set('zodiac', selectedZodiac.value)

    await QRCode.toCanvas(qrCodeRef.value, fullUrl.toString(), {
      width: 96,
      margin: 1,
      color: {
        dark: '#4F46E5',
        light: '#FFFFFF'
      }
    })
    return true
  } catch (err) {
    console.error('生成二维码失败:', err)
    return false
  }
}

// 生成预览图片
const generatePreview = async () => {
  if (!fortune.value) {
    ElMessage.warning('请先选择星座')
    return
  }

  try {
    isGenerating.value = true
    showQRCode.value = true

    // 等待 DOM 更新完成
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!captureRef.value) {
      throw new Error('截图容器未找到')
    }

    const qrGenerated = await generateQRCode()
    if (!qrGenerated) {
      throw new Error('二维码生成失败')
    }

    await new Promise(resolve => setTimeout(resolve, 200))

    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1
    const scale = Math.max(dpr, 2) // 确保至少2倍缩放

    const canvas = await html2canvas(captureRef.value, {
      scale: scale,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: captureRef.value.offsetWidth,
      height: captureRef.value.offsetHeight,
      // 优化渲染质量
      imageTimeout: 0,
      removeContainer: true,
      foreignObjectRendering: false
    })

    // 压缩图片质量
    const maxWidth = 1200 * scale
    if (canvas.width > maxWidth) {
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      const ratio = maxWidth / canvas.width
      tempCanvas.width = maxWidth
      tempCanvas.height = canvas.height * ratio
      ctx?.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height)
      previewImage.value = tempCanvas.toDataURL('image/png', 0.9)
    } else {
      previewImage.value = canvas.toDataURL('image/png', 0.9)
    }

    showPreview.value = true

  } catch (err) {
    console.error('生成预览失败:', err)
    ElMessage.error('生成预览失败，请稍后重试')
  } finally {
    showQRCode.value = false
    isGenerating.value = false
  }
}

// 复制图片到剪贴板
const copyImage = async () => {
  if (!previewImage.value) {
    ElMessage.warning('请先生成预览图片')
    return
  }

  try {
    // 从 base64 URL 创建 Blob
    const response = await fetch(previewImage.value)
    const blob = await response.blob()

    // 创建 ClipboardItem
    const item = new ClipboardItem({
      [blob.type]: blob
    })

    // 复制到剪贴板
    await navigator.clipboard.write([item])
    ElMessage.success('图片已复制到剪贴板')
  } catch (err) {
    console.error('复制图片失败:', err)
    ElMessage.error('复制图片失败，请尝试使用下载功能')
  }
}

// 下载图片
const downloadImage = () => {
  if (!previewImage.value) {
    ElMessage.warning('请先生成预览图片')
    return
  }

  const link = document.createElement('a')
  link.download = `${selectedZodiac.value}座-今日运势.png`
  link.href = previewImage.value
  link.click()

  ElMessage.success('运势卡片已保存')
  showPreview.value = false
}

// 获取运势数据
const getFortune = async () => {
  loading.value = true
  error.value = ''
  fortune.value = null

  try {
    const response = await axios.get(`https://api.pearktrue.cn/api/xzys/`, {
      params: {
        xz: selectedZodiac.value
      }
    })

    if (response.data.code === 200) {
      fortune.value = response.data.data
      // 添加小动效
      ElMessage({
        message: `已获取${selectedZodiac.value}座今日运势`,
        type: 'success',
        duration: 2000
      })
    } else {
      throw new Error(response.data.msg || '获取运势数据失败')
    }
  } catch (err) {
    const errorMessage = err instanceof AxiosError
      ? err.response?.data?.msg || err.message
      : '获取运势数据失败，请稍后重试'
    error.value = errorMessage
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 监听选择变化
watch(selectedZodiac, () => {
  getFortune()
})

// 组件加载时获取数据
onMounted(() => {
  getFortune()
})

// 不需要在路由变化时更新二维码
watch(() => route.fullPath, () => {
  // 移除自动生成二维码的逻辑
})

// 添加一些动画效果
const addAnimationClass = (value: string, className: string) => {
  const element = document.querySelector(value)
  if (element) {
    element.classList.add(className)
    setTimeout(() => {
      element.classList.remove(className)
    }, 1000)
  }
}

// SEO优化 - 计算页面标题和描述
const pageTitle = computed(() => {
  return `${selectedZodiac.value}座运势查询_今日运势详解_星座运程分析`
})

const pageDescription = computed(() => {
  if (fortune.value) {
    return `${selectedZodiac.value}座今日运势：${fortune.value.shortcomment}。提供${selectedZodiac.value}座的爱情、事业、财运、健康运势分析。`
  }
  return `免费在线查询${selectedZodiac.value}座今日运势，提供准确的运势预测、爱情运、事业运、财运、健康运势分析，星座运程每日更新。`
})

// SEO优化 - 结构化数据
const structuredData = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle.value,
    description: pageDescription.value,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntity: {
      '@type': 'Article',
      headline: `${selectedZodiac.value}座今日运势`,
      description: fortune.value?.shortcomment || `${selectedZodiac.value}座运势分析`,
      author: {
        '@type': 'Organization',
        name: 'Tomda'
      }
    }
  }
})

// SEO优化 - 动态更新头部信息
const updateHeadInfo = () => {
  useHead({
    title: pageTitle.value,
    meta: [
      { name: 'description', content: pageDescription.value },
      { name: 'keywords', content: `${selectedZodiac.value}座,星座运势,今日运势,运程预测,星座运程,爱情运势,事业运势,财运预测` }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(structuredData.value)
      }
    ],
    link: [
      {
        rel: 'canonical',
        href: `${window.location.origin}${route.path}`
      }
    ]
  })
}

// 监听运势数据变化，更新SEO信息
watch([selectedZodiac, fortune], () => {
  updateHeadInfo()
})
</script>

<style>
.preview-dialog :deep(.el-dialog) {
  margin: 3vh auto !important;
  border-radius: 12px;
  overflow: hidden;
  max-width: 95%;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}

@media (min-width: 640px) {
  .preview-dialog :deep(.el-dialog) {
    margin: 5vh auto !important;
    border-radius: 16px;
    max-width: 90%;
  }
}

.preview-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  background: linear-gradient(to right, #4f46e5, #8b5cf6);
  color: white;
  border-bottom: 1px solid #e4e4e7;
}

@media (min-width: 640px) {
  .preview-dialog :deep(.el-dialog__header) {
    padding: 20px 24px;
  }
}

.preview-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: bold;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@media (min-width: 640px) {
  .preview-dialog :deep(.el-dialog__title) {
    font-size: 18px;
  }
}

.preview-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 16px 20px;
  background-color: #f9fafb;
}

@media (min-width: 640px) {
  .preview-dialog :deep(.el-dialog__body) {
    padding: 20px 25px;
  }
}

.preview-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

@media (min-width: 640px) {
  .preview-container {
    max-height: 70vh;
  }
}

.preview-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.dialog-footer {
  padding: 12px 20px;
  text-align: right;
  border-top: 1px solid #e4e4e7;
  background-color: #fff;
}

@media (min-width: 640px) {
  .dialog-footer {
    padding: 16px 24px;
  }
}

/* 自定义滚动条样式 */
.preview-container::-webkit-scrollbar {
  width: 4px;
}

@media (min-width: 640px) {
  .preview-container::-webkit-scrollbar {
    width: 6px;
  }
}

.preview-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.preview-container::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  border-radius: 2px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #4f46e5, #7c3aed);
}

/* 添加动画 */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

/* 添加动效类 */
.scale-up {
  animation: scale-up 0.3s ease forwards;
}

@keyframes scale-up {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.05);
  }
}

.fade-in {
  animation: fade-in 0.5s ease-in-out forwards;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 640px) {
  .el-button {
    padding: 8px 15px;
    font-size: 14px;
    border-radius: 8px;
  }

  .el-button+.el-button {
    margin-left: 8px;
  }

  .el-button.is-round {
    border-radius: 16px;
  }
}

/* 优化按钮样式 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.06);
}
</style>
