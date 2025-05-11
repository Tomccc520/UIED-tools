<!--
 * @file UiSpec.vue
 * @description 屏幕尺寸规范，帮助设计师了解各种设备的屏幕参数
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">屏幕尺寸大全</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Screen Size</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">本工具提供各种设备的屏幕参数规范，帮助设计师快速了解不同设备的尺寸特点。</p>
            </div>
          </div>
        </div>

        <!-- 设备类型选择 -->
        <div class="device-type-selector">
          <div v-for="type in deviceTypes" :key="type.key" class="type-item"
            :class="{ active: selectedDeviceType === type.key }" @click="switchDeviceType(type.key as DeviceType)">
            <div class="icon-wrapper">
              <!-- iPhone -->
              <svg v-if="type.key === 'phone'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="7" y="4" width="10" height="16" rx="2" stroke-width="2" />
                <circle cx="12" cy="17" r="1" />
              </svg>
              <!-- Android -->
              <svg v-if="type.key === 'android'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 16V7c0-3 3-5 7-5s7 2 7 5v9" stroke-width="2" />
                <circle cx="7" cy="16" r="2" stroke-width="2" />
                <circle cx="17" cy="16" r="2" stroke-width="2" />
                <path d="M7 7h10M12 2v3" stroke-width="2" />
              </svg>
              <!-- HUAWEI -->
              <svg v-if="type.key === 'huawei'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
                <path d="M10 18h4M12 15v3" stroke-width="2" />
                <path d="M8 6h8M8 9h8" stroke-width="2" />
              </svg>
              <!-- Xiaomi -->
              <svg v-if="type.key === 'xiaomi'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="3" width="12" height="18" rx="2" stroke-width="2" />
                <path d="M9 6h6M9 9h6" stroke-width="2" />
                <circle cx="12" cy="17" r="1" />
              </svg>
              <!-- Samsung -->
              <svg v-if="type.key === 'samsung'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="2" width="12" height="20" rx="2" stroke-width="2" />
                <path d="M9 5h6M9 19h6" stroke-width="2" />
                <circle cx="12" cy="17" r="1" />
              </svg>
              <!-- iPad -->
              <svg v-if="type.key === 'pad'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke-width="2" />
                <circle cx="12" cy="18" r="1" />
              </svg>
              <!-- Watch -->
              <svg v-if="type.key === 'watch'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="7" stroke-width="2" />
                <path d="M12 7v5l3 3" stroke-width="2" />
                <path d="M9 3h6M9 21h6" stroke-width="2" />
              </svg>
              <!-- Desktop -->
              <svg v-if="type.key === 'desktop'" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="2" y="4" width="20" height="12" rx="1" stroke-width="2" />
                <path d="M8 20h8M12 16v4" stroke-width="2" />
              </svg>
            </div>
            <span>{{ type.name }}</span>
          </div>
        </div>

        <!-- 尺寸说明 -->
        <div class="size-description">
          <div class="desc-item">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
              <h3>尺寸说明</h3>
              <div class="flex flex-wrap gap-2">
                <button @click="showDesignSpec = true"
                  class="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  设计规范
                </button>
                <button @click="showDesignTips = true"
                  class="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  设计要点
                </button>
                <button @click="showDesignGuide = true"
                  class="w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                  设计指南
                </button>
              </div>
            </div>
            <p>1. 物理尺寸：设备屏幕的对角线长度，单位为英寸(in)</p>
            <p>2. PPI (Pixels Per Inch)：每英寸包含的像素数，数值越高显示效果越清晰</p>
            <p>3. 纵横比：屏幕宽高比例，影响内容布局和展示</p>
            <p>4. dp (Density-independent Pixels)：密度无关像素，用于确保界面在不同分辨率下的一致性</p>
            <p>5. px (Pixels)：实际像素分辨率，建议准备多套分辨率的图片资源</p>
            <p>6. dpi (Dots Per Inch)：每英寸点数，用于表示密度，影响图片和文字的清晰度</p>

            <div class="data-source">
              <p class="text-xs text-gray-500 mt-4">* 数据来源：互联网公开数据整理，仅供参考。如有错误，欢迎指出。</p>
            </div>
          </div>
        </div>

        <!-- 设计规范速查表弹窗 -->
        <div v-if="showDesignSpec"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg md:text-xl font-medium">设计规范速查表</h3>
              <button @click="showDesignSpec = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <!-- 组件尺寸 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                  </svg>
                  组件尺寸
                </h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 按钮高度：32/36/40/44px</li>
                  <li>• 输入框高度：32/40/48px</li>
                  <li>• 图标尺寸：16/20/24/32px</li>
                  <li>• 头像尺寸：24/32/40/48px</li>
                  <li>• 表格行高：44/52/60px</li>
                </ul>
              </div>

              <!-- 间距规范 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12M8 12h12M8 17h12" />
                  </svg>
                  间距规范
                </h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 组件内间距：8/12/16px</li>
                  <li>• 组件间距：16/24/32px</li>
                  <li>• 区块间距：24/32/48px</li>
                  <li>• 页面边距：16/24px</li>
                  <li>• 栅格间距：16/24px</li>
                </ul>
              </div>

              <!-- 字体规范 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  字体规范
                </h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 主标题：20/24px</li>
                  <li>• 次标题：16/18px</li>
                  <li>• 正文：14/16px</li>
                  <li>• 辅助文字：12/13px</li>
                  <li>• 行高：1.5/1.75</li>
                </ul>
              </div>

              <!-- 颜色规范 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  颜色规范
                </h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 主要文字：#1F2937</li>
                  <li>• 次要文字：#4B5563</li>
                  <li>• 提示文字：#9CA3AF</li>
                  <li>• 边框颜色：#E5E7EB</li>
                  <li>• 背景颜色：#F9FAFB</li>
                </ul>
              </div>
            </div>

            <!-- 数据来源说明 -->
            <div class="mt-6 md:mt-8 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-500">* 数据来源：互联网公开数据整理，仅供参考。如有错误，欢迎指出。</p>
            </div>
          </div>
        </div>

        <!-- 设计要点弹窗 -->
        <div v-if="showDesignTips"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg md:text-xl font-medium">UI 设计要点</h3>
              <button @click="showDesignTips = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <!-- 触控区域设计 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  触控区域设计
                </h4>
                <p class="text-gray-600 mb-4">合理的触控区域大小能提升用户的操作体验。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 点击区域最小尺寸：48dp x 48dp</li>
                  <li>• 图标最小尺寸：24dp x 24dp</li>
                  <li>• 元素间最小间距：8dp</li>
                </ul>
              </div>

              <!-- 文字排版 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  文字排版
                </h4>
                <p class="text-gray-600 mb-4">良好的文字排版能提升内容的可读性。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 正文最小字号：14sp</li>
                  <li>• 标题推荐字号：16-24sp</li>
                  <li>• 行高建议：1.4-1.6倍</li>
                </ul>
              </div>

              <!-- 响应式布局 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  响应式布局
                </h4>
                <p class="text-gray-600 mb-4">合理的布局策略确保内容在不同尺寸设备上的展示。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 使用弹性布局（Flexbox）</li>
                  <li>• 设置最大最小宽度限制</li>
                  <li>• 考虑横竖屏切换场景</li>
                </ul>
              </div>

              <!-- 图片适配 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  图片适配
                </h4>
                <p class="text-gray-600 mb-4">合适的图片处理方案能兼顾显示效果和性能。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• @2x、@3x 倍图设计</li>
                  <li>• SVG 用于图标和简单图形</li>
                  <li>• WebP 格式提升加载性能</li>
                </ul>
              </div>
            </div>

            <!-- 数据来源说明 -->
            <div class="mt-6 md:mt-8 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-500">* 数据来源：互联网公开数据整理，仅供参考。如有错误，欢迎指出。</p>
            </div>
          </div>
        </div>

        <!-- 设计指南弹窗 -->
        <div v-if="showDesignGuide"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg p-4 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-lg md:text-xl font-medium">设备适配设计指南</h3>
              <button @click="showDesignGuide = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <!-- 屏幕尺寸部分 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 21H5a2 2 0 01-2-2v-4m6 6h10a2 2 0 002-2v-4" />
                  </svg>
                  屏幕尺寸
                </h4>
                <p class="text-gray-600 mb-4">物理尺寸是指设备屏幕对角线的长度，单位为英寸(in)。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 大屏幕（>6.5英寸）可以显示更多内容，但要注意单手操作的可达性</li>
                  <li>• 中等屏幕（5-6.5英寸）是最常见的尺寸，需要平衡内容展示和操作便利性</li>
                  <li>• 小屏幕（&lt;5英寸）要注意精简内容，确保重要信息优先展示</li>
                </ul>
              </div>

              <!-- PPI部分 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  PPI（像素密度）
                </h4>
                <p class="text-gray-600 mb-4">PPI表示每英寸包含的像素数量，数值越高，显示效果越清晰。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 高PPI（>400）设备需要提供高清图片资源</li>
                  <li>• 中等PPI（300-400）设备是最常见的配置</li>
                  <li>• 低PPI（&lt;300）设备要注意图片和文字的清晰度</li>
                </ul>
              </div>

              <!-- 分辨率适配部分 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 8v8m0 0h8m-8 0l6-6m4-3h6m0 0v8m0-8l-6 6" />
                  </svg>
                  分辨率适配
                </h4>
                <p class="text-gray-600 mb-4">设备分辨率指的是屏幕的像素数量，通常以宽x高表示。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 使用相对单位（dp）来确保界面在不同分辨率下的一致性</li>
                  <li>• 准备多套分辨率的图片资源</li>
                  <li>• 使用响应式设计原则适配不同分辨率</li>
                </ul>
              </div>

              <!-- 设计建议 -->
              <div class="bg-white p-6 rounded-lg border border-gray-100">
                <h4 class="font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  设计建议
                </h4>
                <p class="text-gray-600 mb-4">在进行设备适配设计时的关键建议。</p>
                <ul class="space-y-2 text-sm text-gray-600">
                  <li>• 优先考虑主流设备的适配</li>
                  <li>• 采用弹性布局方案</li>
                  <li>• 设置合适的断点值</li>
                  <li>• 测试不同设备的显示效果</li>
                </ul>
              </div>
            </div>

            <!-- 数据来源说明 -->
            <div class="mt-6 md:mt-8 pt-4 border-t border-gray-200">
              <p class="text-xs text-gray-500">* 数据来源：互联网公开数据整理，仅供参考。如有错误，欢迎指出。</p>
            </div>
          </div>
        </div>

        <!-- 尺寸表格 -->
        <div class="screen-table">
          <table>
            <thead>
              <tr>
                <th>设备名称</th>
                <th>操作系统</th>
                <th>尺寸 in</th>
                <th>PPI</th>
                <th>纵横比</th>
                <th>宽 × 高 dp</th>
                <th>宽 × 高 px</th>
                <th>密度 dpi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="device in currentDevices" :key="device.name">
                <td>{{ device.name }}</td>
                <td>{{ device.os }}</td>
                <td>{{ device.size }}</td>
                <td>{{ device.ppi }}</td>
                <td>{{ device.ratio }}</td>
                <td>{{ device.dp }}</td>
                <td>{{ device.px }}</td>
                <td>{{ device.dpi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 功能说明区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <!-- 功能点 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">全面覆盖</h3>
                <p class="text-sm text-gray-500 leading-relaxed">涵盖各类主流设备的屏幕参数规范</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">详细参数</h3>
                <p class="text-sm text-gray-500 leading-relaxed">提供完整的尺寸、分辨率等技术参数</p>
              </div>
            </div>
          </div>
          <div class="bg-white p-4 rounded-lg border border-gray-100">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 class="font-medium text-gray-900 mb-1">便于查阅</h3>
                <p class="text-sm text-gray-500 leading-relaxed">分类清晰，快速找到需要的设备规格</p>
              </div>
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
import { ref, computed } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()

// SEO 配置
useHead({
  title: '屏幕尺寸大全 - 设备屏幕参数规范查询工具',
  meta: [
    {
      name: 'description',
      content: '提供全面的设备屏幕参数规范查询,包括iOS、Android、PC等主流设备的屏幕尺寸、分辨率、PPI等参数。帮助设计师和开发者快速了解不同设备的屏幕规格。'
    },
    {
      name: 'keywords',
      content: '屏幕尺寸,设备分辨率,PPI,屏幕参数,iOS屏幕,Android屏幕,设计规范,UI设计'
    },
    // Open Graph 标签
    {
      property: 'og:title',
      content: '屏幕尺寸大全 - 设备屏幕参数规范查询工具'
    },
    {
      property: 'og:description',
      content: '提供全面的设备屏幕参数规范查询,包括iOS、Android、PC等主流设备的屏幕尺寸、分辨率、PPI等参数。'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:url',
      content: 'https://www.uiedtool.com/tools/design/ui-spec'
    },
    // Twitter Card 标签
    {
      name: 'twitter:card',
      content: 'summary'
    },
    {
      name: 'twitter:title',
      content: '屏幕尺寸大全 - 设备屏幕参数规范查询工具'
    },
    {
      name: 'twitter:description',
      content: '提供全面的设备屏幕参数规范查询,包括iOS、Android、PC等主流设备的屏幕尺寸、分辨率、PPI等参数。'
    }
  ],
  // JSON-LD 结构化数据
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '屏幕尺寸大全',
        description: '提供全面的设备屏幕参数规范查询',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: '首页',
              item: 'https://www.uiedtool.com'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: '设计工具',
              item: 'https://www.uiedtool.com/tools/design'
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: '屏幕尺寸大全',
              item: 'https://www.uiedtool.com/tools/design/ui-spec'
            }
          ]
        },
        // 添加工具特性结构化数据
        about: {
          '@type': 'Thing',
          name: '屏幕尺寸查询工具',
          description: '为设计师和开发者提供设备屏幕参数规范查询服务',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.uiedtool.com/tools/design/ui-spec?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        }
      })
    }
  ]
})

// 设备类型
type DeviceType = 'watch' | 'phone' | 'pad' | 'desktop' | 'android' | 'huawei' | 'xiaomi' | 'samsung'

// 当前选中的设备类型
const selectedDeviceType = ref<DeviceType>('phone')

// 显示设计指南弹窗
const showDesignGuide = ref(false)

// 显示设计要点弹窗
const showDesignTips = ref(false)

// 显示设计规范速查表弹窗
const showDesignSpec = ref(false)

// 设备类型列表
const deviceTypes = [
  { key: 'phone', name: 'iPhone' },
  { key: 'android', name: 'Android' },
  { key: 'huawei', name: 'HUAWEI' },
  { key: 'xiaomi', name: 'Xiaomi' },
  { key: 'samsung', name: 'Samsung' },
  { key: 'pad', name: 'iPad' },
  { key: 'desktop', name: 'Mac' },
  { key: 'watch', name: 'Watch' }
]

// 设备数据
const deviceData = {
  watch: [
    {
      name: 'Apple Watch Series 6 (44mm)',
      os: 'watch OS',
      size: '1.78',
      ppi: '326',
      ratio: '23 : 28',
      dp: '368 x 448',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Apple Watch Series 6 (40mm)',
      os: 'watch OS',
      size: '1.57',
      ppi: '326',
      ratio: '162 : 197',
      dp: '324 x 394',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Apple Watch 44mm',
      os: 'watch OS',
      size: '2.3',
      ppi: '326',
      ratio: '-',
      dp: '-',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Apple Watch 40mm',
      os: 'watch OS',
      size: '2',
      ppi: '326',
      ratio: '-',
      dp: '-',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Apple Watch 38mm',
      os: 'watch OS',
      size: '1.5',
      ppi: '326',
      ratio: '5 : 4',
      dp: '136 x 170',
      px: '272 x 340',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Apple Watch 42mm',
      os: 'watch OS',
      size: '1.7',
      ppi: '326',
      ratio: '5 : 4',
      dp: '156 x 195',
      px: '312 x 390',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Xiaomi Mi Watch (Color 运动版)',
      os: 'MIUI For Watch',
      size: '1.39',
      ppi: '326',
      ratio: '1 : 1',
      dp: '454 x 454',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Xiaomi Mi Watch',
      os: 'MIUI For Watch',
      size: '1.39',
      ppi: '326',
      ratio: '1 : 1',
      dp: '454 x 454',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Huawei Watch GT 2 Pro',
      os: 'Huawei Lite OS',
      size: '1.39',
      ppi: '326',
      ratio: '1 : 1',
      dp: '454 x 454',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Huawei Watch GT 2e',
      os: 'Huawei Lite OS',
      size: '1.39',
      ppi: '326',
      ratio: '1 : 1',
      dp: '454 x 454',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Huawei Watch Fit',
      os: 'Huawei wearable platform',
      size: '1.64',
      ppi: '326',
      ratio: '35 : 57',
      dp: '280 x 456',
      px: '-',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Moto 360',
      os: 'Android',
      size: '1.6',
      ppi: '205',
      ratio: '32 : 29',
      dp: '241 x 218',
      px: '320 x 290',
      dpi: '1.3 tvdpi'
    },
    {
      name: 'Moto 360 v2 42mm',
      os: 'Android',
      size: '1.4',
      ppi: '263',
      ratio: '65 : 64',
      dp: '241 x 244',
      px: '320 x 325',
      dpi: '1.3 tvdpi'
    },
    {
      name: 'Moto 360 v2 46mm',
      os: 'Android',
      size: '1.6',
      ppi: '263',
      ratio: '33 : 32',
      dp: '241 x 248',
      px: '320 x 330',
      dpi: '1.3 tvdpi'
    }
  ],
  phone: [
    {
      name: 'iPhone 16 Pro Max',
      os: 'iOS',
      size: '6.7',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '430 x 932',
      px: '1290 x 2796',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 16 Pro',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '393 x 852',
      px: '1179 x 2556',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 16 Plus',
      os: 'iOS',
      size: '6.7',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '428 x 926',
      px: '1284 x 2778',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 16',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 15 Pro Max',
      os: 'iOS',
      size: '6.7',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '430 x 932',
      px: '1290 x 2796',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 15 Pro',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '393 x 852',
      px: '1179 x 2556',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 15 Plus',
      os: 'iOS',
      size: '6.7',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '428 x 926',
      px: '1284 x 2778',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 15',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 14 Pro Max',
      os: 'iOS',
      size: '6.7',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '430 x 932',
      px: '1290 x 2796',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 14 Pro',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '393 x 852',
      px: '1179 x 2556',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 14 Plus',
      os: 'iOS',
      size: '6.7',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '428 x 926',
      px: '1284 x 2778',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 14',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 13 Pro Max',
      os: 'iOS',
      size: '6.7',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '428 x 926',
      px: '1284 x 2778',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 13 Pro',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 13',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 13 mini',
      os: 'iOS',
      size: '5.4',
      ppi: '476',
      ratio: '19.5 : 9',
      dp: '375 x 812',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 12 Pro Max',
      os: 'iOS',
      size: '6.7',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '428 x 926',
      px: '1284 x 2778',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 12 Pro',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 12',
      os: 'iOS',
      size: '6.1',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '390 x 844',
      px: '1170 x 2532',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 12 Mini',
      os: 'iOS',
      size: '5.4',
      ppi: '476',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 11 Pro Max',
      os: 'iOS',
      size: '6.5',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '414 x 896',
      px: '1242 x 2688',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 11 Pro',
      os: 'iOS',
      size: '5.8',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '375 x 812',
      px: '1125 x 2436',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 11',
      os: 'iOS',
      size: '6.1',
      ppi: '326',
      ratio: '19.5 : 9',
      dp: '414 x 896',
      px: '828 x 1792',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPhone XS Max',
      os: 'iOS',
      size: '6.5',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '414 x 896',
      px: '1242 x 2688',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone XS',
      os: 'iOS',
      size: '5.8',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '375 x 812',
      px: '1125 x 2436',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone XR',
      os: 'iOS',
      size: '6.1',
      ppi: '326',
      ratio: '19.5 : 9',
      dp: '414 x 896',
      px: '828 x 1792',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPhone X',
      os: 'iOS',
      size: '5.8',
      ppi: '458',
      ratio: '19.5 : 9',
      dp: '375 x 812',
      px: '1125 x 2436',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 8 Plus',
      os: 'iOS',
      size: '5.5',
      ppi: '401',
      ratio: '16 : 9',
      dp: '414 x 736',
      px: '1242 x 2208',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'iPhone 8',
      os: 'iOS',
      size: '4.7',
      ppi: '326',
      ratio: '16 : 9',
      dp: '375 x 667',
      px: '750 x 1334',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPhone SE (2nd)',
      os: 'iOS',
      size: '4.7',
      ppi: '326',
      ratio: '16 : 9',
      dp: '375 x 667',
      px: '750 x 1334',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPhone SE (1st)',
      os: 'iOS',
      size: '4.0',
      ppi: '326',
      ratio: '16 : 9',
      dp: '320 x 568',
      px: '640 x 1136',
      dpi: '2.0 xhdpi'
    }
  ],
  android: [
    {
      name: 'Google Pixel 8 Pro',
      os: 'Android',
      size: '6.7',
      ppi: '489',
      ratio: '20 : 9',
      dp: '412 x 915',
      px: '1344 x 2992',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Google Pixel 8',
      os: 'Android',
      size: '6.2',
      ppi: '428',
      ratio: '20 : 9',
      dp: '412 x 915',
      px: '1080 x 2400',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Google Pixel Fold',
      os: 'Android',
      size: '7.6',
      ppi: '380',
      ratio: '6 : 5',
      dp: '412 x 915',
      px: '2208 x 1840',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Google Pixel 7 Pro',
      os: 'Android',
      size: '6.7',
      ppi: '512',
      ratio: '19.5 : 9',
      dp: '412 x 915',
      px: '1440 x 3120',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S23 Ultra',
      os: 'Android',
      size: '6.8',
      ppi: '500',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1440 x 3088',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'OnePlus 7 Pro',
      os: 'Android',
      size: '6.67',
      ppi: '516',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1440 x 3120',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: 'Huawei P30 Pro',
      os: 'Android',
      size: '6.47',
      ppi: '408',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Xiaomi Mi 9',
      os: 'Android',
      size: '6.39',
      ppi: '403',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'OPPO Find X',
      os: 'Android',
      size: '6.42',
      ppi: '401',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Vivo X27',
      os: 'Android',
      size: '6.39',
      ppi: '394',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    }
  ],
  huawei: [
    {
      name: 'HUAWEI Mate 60 Pro+',
      os: 'HarmonyOS',
      size: '6.82',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1260 x 2720',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'HUAWEI Mate 60 Pro',
      os: 'HarmonyOS',
      size: '6.82',
      ppi: '460',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1260 x 2720',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'HUAWEI Mate X5',
      os: 'HarmonyOS',
      size: '7.85',
      ppi: '426',
      ratio: '8 : 7.7',
      dp: '360 x 780',
      px: '2496 x 2224',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'HUAWEI P60 Pro',
      os: 'Android',
      size: '6.67',
      ppi: '550',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1440 x 3120',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: 'HUAWEI Mate X3',
      os: 'Android',
      size: '7.85',
      ppi: '426',
      ratio: '8 : 7.7',
      dp: '360 x 780',
      px: '2496 x 2224',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'HUAWEI P30 Pro',
      os: 'Android',
      size: '6.47',
      ppi: '408',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'HUAWEI Mate30 Pro',
      os: 'Android',
      size: '6.53',
      ppi: '409',
      ratio: '-',
      dp: '392 x 800',
      px: '1176 x 2400',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'HUAWEI Mate20 Pro',
      os: 'Android',
      size: '6.39',
      ppi: '538',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1440 x 3120',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: 'HUAWEI P20 Pro',
      os: 'Android',
      size: '6.1',
      ppi: '408',
      ratio: '-',
      dp: '360 x 748',
      px: '1080 x 2240',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'HUAWEI P10 Plus',
      os: 'Android',
      size: '5.5',
      ppi: '540',
      ratio: '16 : 9',
      dp: '360 x 640',
      px: '1440 x 2560',
      dpi: '4.0 xxxhdpi'
    }
  ],
  xiaomi: [
    {
      name: '小米14 Ultra',
      os: 'Android',
      size: '6.73',
      ppi: '522',
      ratio: '20 : 9',
      dp: '360 x 780',
      px: '1440 x 3200',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: '小米Mix Fold 4',
      os: 'Android',
      size: '8.03',
      ppi: '380',
      ratio: '4 : 3.55',
      dp: '360 x 780',
      px: '2160 x 1916',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Redmi K70 Pro',
      os: 'Android',
      size: '6.67',
      ppi: '446',
      ratio: '20 : 9',
      dp: '360 x 780',
      px: '1440 x 3200',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: '小米14 Pro',
      os: 'Android',
      size: '6.73',
      ppi: '522',
      ratio: '20 : 9',
      dp: '360 x 780',
      px: '1440 x 3200',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: '小米13 Ultra',
      os: 'Android',
      size: '6.73',
      ppi: '522',
      ratio: '20 : 9',
      dp: '360 x 780',
      px: '1440 x 3200',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: '小米MIX Fold 3',
      os: 'Android',
      size: '8.03',
      ppi: '380',
      ratio: '4 : 3.55',
      dp: '360 x 780',
      px: '2160 x 1916',
      dpi: '3.0 xxhdpi'
    },
    {
      name: '小米9',
      os: 'Android',
      size: '6.39',
      ppi: '403',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: '小米MIX3',
      os: 'Android',
      size: '6.39',
      ppi: '403',
      ratio: '19.5 : 9',
      dp: '360 x 780',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: '小米MIX2',
      os: 'Android',
      size: '5.99',
      ppi: '403',
      ratio: '2 : 1',
      dp: '360 x 720',
      px: '1080 x 2160',
      dpi: '3.0 xxhdpi'
    },
    {
      name: '小米6',
      os: 'Android',
      size: '5.15',
      ppi: '428',
      ratio: '16 : 9',
      dp: '360 x 640',
      px: '1080 x 1920',
      dpi: '3.0 xxhdpi'
    }
  ],
  samsung: [
    {
      name: 'Samsung Galaxy S24 Ultra',
      os: 'Android',
      size: '6.8',
      ppi: '505',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1440 x 3120',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S24+',
      os: 'Android',
      size: '6.7',
      ppi: '513',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1440 x 3120',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S24',
      os: 'Android',
      size: '6.2',
      ppi: '416',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy S23 Ultra',
      os: 'Android',
      size: '6.8',
      ppi: '500',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1440 x 3088',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S23+',
      os: 'Android',
      size: '6.6',
      ppi: '393',
      ratio: '19.5 : 9',
      dp: '412 x 915',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy S23',
      os: 'Android',
      size: '6.1',
      ppi: '425',
      ratio: '19.5 : 9',
      dp: '412 x 915',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy Z Fold5',
      os: 'Android',
      size: '7.6',
      ppi: '374',
      ratio: '21.6 : 18',
      dp: '412 x 915',
      px: '1812 x 2176',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy Z Fold4',
      os: 'Android',
      size: '7.6',
      ppi: '374',
      ratio: '21.6 : 18',
      dp: '412 x 915',
      px: '1812 x 2176',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy Z Flip5',
      os: 'Android',
      size: '6.7',
      ppi: '425',
      ratio: '22 : 9',
      dp: '412 x 915',
      px: '1080 x 2640',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy Z Flip4',
      os: 'Android',
      size: '6.7',
      ppi: '425',
      ratio: '22 : 9',
      dp: '412 x 915',
      px: '1080 x 2640',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy Note20 Ultra',
      os: 'Android',
      size: '6.9',
      ppi: '496',
      ratio: '19.3 : 9',
      dp: '412 x 915',
      px: '1440 x 3088',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy Note20',
      os: 'Android',
      size: '6.7',
      ppi: '393',
      ratio: '20 : 9',
      dp: '412 x 915',
      px: '1080 x 2400',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy Note10+',
      os: 'Android',
      size: '6.8',
      ppi: '498',
      ratio: '19 : 9',
      dp: '412 x 869',
      px: '1440 x 3040',
      dpi: '3.5 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy A54 5G',
      os: 'Android',
      size: '6.4',
      ppi: '403',
      ratio: '20 : 9',
      dp: '412 x 915',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy A34 5G',
      os: 'Android',
      size: '6.6',
      ppi: '390',
      ratio: '20 : 9',
      dp: '412 x 915',
      px: '1080 x 2340',
      dpi: '3.0 xxhdpi'
    },
    {
      name: 'Samsung Galaxy Tab S9 Ultra',
      os: 'Android',
      size: '14.6',
      ppi: '287',
      ratio: '16 : 10',
      dp: '1848 x 2960',
      px: '2960 x 1848',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Samsung Galaxy Tab S9+',
      os: 'Android',
      size: '12.4',
      ppi: '287',
      ratio: '16 : 10',
      dp: '1600 x 2560',
      px: '2800 x 1752',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Samsung Galaxy Tab S9',
      os: 'Android',
      size: '11',
      ppi: '287',
      ratio: '16 : 10',
      dp: '1600 x 2560',
      px: '2560 x 1600',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Samsung Galaxy S10+',
      os: 'Android',
      size: '6.4',
      ppi: '526',
      ratio: '19 : 9',
      dp: '360 x 760',
      px: '1440 x 3040',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S9+',
      os: 'Android',
      size: '6.2',
      ppi: '531',
      ratio: '18.5 : 9',
      dp: '360 x 740',
      px: '1440 x 2960',
      dpi: '4.0 xxxhdpi'
    },
    {
      name: 'Samsung Galaxy S8',
      os: 'Android',
      size: '5.8',
      ppi: '570',
      ratio: '18.5 : 9',
      dp: '360 x 740',
      px: '1440 x 2960',
      dpi: '4.0 xxxhdpi'
    }
  ],
  pad: [
    {
      name: 'iPad Pro 12.9" (M3)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 11" (M3)',
      os: 'iPadOS',
      size: '11',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '834 x 1194',
      px: '1668 x 2388',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 12.9" (M2)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 11" (M2)',
      os: 'iPadOS',
      size: '11',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '834 x 1194',
      px: '1668 x 2388',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 12.9" (M1)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 11" (M1)',
      os: 'iPadOS',
      size: '11',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '834 x 1194',
      px: '1668 x 2388',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Air (6th)',
      os: 'iPadOS',
      size: '10.9',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '820 x 1180',
      px: '1640 x 2360',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Air (5th)',
      os: 'iPadOS',
      size: '10.9',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '820 x 1180',
      px: '1640 x 2360',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Air (4th)',
      os: 'iPadOS',
      size: '10.9',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '820 x 1180',
      px: '1640 x 2360',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad (10th)',
      os: 'iPadOS',
      size: '10.9',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '820 x 1180',
      px: '1640 x 2360',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad (9th)',
      os: 'iPadOS',
      size: '10.2',
      ppi: '264',
      ratio: '4 : 3',
      dp: '810 x 1080',
      px: '1620 x 2160',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad (8th)',
      os: 'iPadOS',
      size: '10.2',
      ppi: '264',
      ratio: '4 : 3',
      dp: '810 x 1080',
      px: '1620 x 2160',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad mini (6th)',
      os: 'iPadOS',
      size: '8.3',
      ppi: '326',
      ratio: '1.43 : 1',
      dp: '744 x 1133',
      px: '1488 x 2266',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad mini (5th)',
      os: 'iPadOS',
      size: '7.9',
      ppi: '326',
      ratio: '4 : 3',
      dp: '768 x 1024',
      px: '1536 x 2048',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 12.9" (4th)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 11" (2nd)',
      os: 'iPadOS',
      size: '11',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '834 x 1194',
      px: '1668 x 2388',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 12.9" (3rd)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 11" (1st)',
      os: 'iPadOS',
      size: '11',
      ppi: '264',
      ratio: '1.43 : 1',
      dp: '834 x 1194',
      px: '1668 x 2388',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 12.9" (2nd)',
      os: 'iPadOS',
      size: '12.9',
      ppi: '264',
      ratio: '4 : 3',
      dp: '1024 x 1366',
      px: '2048 x 2732',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 10.5"',
      os: 'iPadOS',
      size: '10.5',
      ppi: '264',
      ratio: '4 : 3',
      dp: '834 x 1112',
      px: '1668 x 2224',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iPad Pro 9.7"',
      os: 'iPadOS',
      size: '9.7',
      ppi: '264',
      ratio: '4 : 3',
      dp: '768 x 1024',
      px: '1536 x 2048',
      dpi: '2.0 xhdpi'
    }
  ],
  desktop: [
    {
      name: 'iMac 24" (M3)',
      os: 'macOS',
      size: '23.5',
      ppi: '218',
      ratio: '16 : 9',
      dp: '1920 x 1080',
      px: '4480 x 2520',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iMac 24" (M1)',
      os: 'macOS',
      size: '23.5',
      ppi: '218',
      ratio: '16 : 9',
      dp: '1920 x 1080',
      px: '4480 x 2520',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iMac 27" 5K',
      os: 'macOS',
      size: '27',
      ppi: '218',
      ratio: '16 : 9',
      dp: '2560 x 1440',
      px: '5120 x 2880',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'iMac 21.5" 4K',
      os: 'macOS',
      size: '21.5',
      ppi: '219',
      ratio: '16 : 9',
      dp: '2048 x 1152',
      px: '4096 x 2304',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 16" (M3 Max)',
      os: 'macOS',
      size: '16.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1728 x 1117',
      px: '3456 x 2234',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 16" (M3 Pro)',
      os: 'macOS',
      size: '16.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1728 x 1117',
      px: '3456 x 2234',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 16" (M2 Max)',
      os: 'macOS',
      size: '16.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1728 x 1117',
      px: '3456 x 2234',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 16" (M1 Pro)',
      os: 'macOS',
      size: '16.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1728 x 1117',
      px: '3456 x 2234',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 14" (M3 Max)',
      os: 'macOS',
      size: '14.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1512 x 982',
      px: '3024 x 1964',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 14" (M3 Pro)',
      os: 'macOS',
      size: '14.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1512 x 982',
      px: '3024 x 1964',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 14" (M2 Pro)',
      os: 'macOS',
      size: '14.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1512 x 982',
      px: '3024 x 1964',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 14" (M1 Pro)',
      os: 'macOS',
      size: '14.2',
      ppi: '254',
      ratio: '16 : 10',
      dp: '1512 x 982',
      px: '3024 x 1964',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 13" (M2)',
      os: 'macOS',
      size: '13.3',
      ppi: '227',
      ratio: '16 : 10',
      dp: '1280 x 800',
      px: '2560 x 1600',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Pro 13" (M1)',
      os: 'macOS',
      size: '13.3',
      ppi: '227',
      ratio: '16 : 10',
      dp: '1280 x 800',
      px: '2560 x 1600',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Air 15" (M2)',
      os: 'macOS',
      size: '15.3',
      ppi: '224',
      ratio: '16 : 10',
      dp: '1710 x 1112',
      px: '2880 x 1864',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Air 13.6" (M2)',
      os: 'macOS',
      size: '13.6',
      ppi: '224',
      ratio: '16 : 10',
      dp: '1470 x 956',
      px: '2560 x 1664',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'MacBook Air 13" (M1)',
      os: 'macOS',
      size: '13.3',
      ppi: '227',
      ratio: '16 : 10',
      dp: '1280 x 800',
      px: '2560 x 1600',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Pro Display XDR',
      os: 'macOS',
      size: '32',
      ppi: '218',
      ratio: '16 : 9',
      dp: '3008 x 1692',
      px: '6016 x 3384',
      dpi: '2.0 xhdpi'
    },
    {
      name: 'Studio Display',
      os: 'macOS',
      size: '27',
      ppi: '218',
      ratio: '16 : 9',
      dp: '2560 x 1440',
      px: '5120 x 2880',
      dpi: '2.0 xhdpi'
    }
  ]
}

// 当前设备列表
const currentDevices = computed(() => deviceData[selectedDeviceType.value])

// 切换设备类型
const switchDeviceType = (type: DeviceType) => {
  selectedDeviceType.value = type
}
</script>

<style scoped>
.design-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.design-header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.version-tag {
  background-color: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #4b5563;
}

.design-main {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.design-content {
  background-color: #fff;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.device-icons {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 2rem 0;
}

.icon {
  width: 48px;
  height: 48px;
}

.screen-table {
  overflow-x: auto;
  margin: 2rem 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

td {
  color: #4b5563;
}

tr:hover {
  background-color: #f9fafb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .design-main {
    padding: 1rem;
  }

  .design-content {
    padding: 1rem;
  }

  .screen-table {
    margin: 1rem -1rem;
    border-radius: 0;
  }

  th,
  td {
    padding: 8px 12px;
  }
}

/* 设备类型选择器样式优化 */
.device-type-selector {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 1rem;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.type-item:hover {
  background-color: #e5e7eb;
  transform: translateY(-2px);
}

.type-item.active {
  background-color: #e5e7eb;
  font-weight: 500;
  color: #3b82f6;
}

.type-item.active .icon {
  color: #3b82f6;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.icon {
  width: 24px;
  height: 24px;
  color: #6b7280;
  transition: color 0.2s ease;
}

.type-item span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .device-type-selector {
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
  }

  .type-item {
    padding: 0.75rem 1rem;
    min-width: 70px;
  }

  .icon-wrapper {
    width: 32px;
    height: 32px;
  }

  .icon {
    width: 20px;
    height: 20px;
  }
}

/* 尺寸说明样式 */
.size-description {
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

.desc-item h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.desc-item p {
  margin-bottom: 0.5rem;
  color: #4b5563;
  line-height: 1.5;
}

@media (max-width: 1440px) {
  .design-main {
    max-width: 1200px;
  }
}

@media (max-width: 1200px) {
  .design-main {
    max-width: 100%;
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .design-main {
    padding: 1rem;
  }

  .design-content {
    padding: 1rem;
  }

  .size-description {
    padding: 1rem;
    margin: 1rem 0;
  }
}

/* 弹窗内容样式优化 */
.bg-white p-6 {
  @apply p-4 md:p-6;
}

/* 弹窗内卡片样式 */
.bg-white.rounded-lg.border {
  @apply p-4 md:p-6;
}

/* 弹窗内标题样式 */
.font-medium.text-gray-900 {
  @apply text-base md:text-lg;
}

/* 弹窗内列表样式 */
.space-y-2 {
  @apply text-sm;
}

/* 弹窗内数据来源说明样式 */
.mt-6.md\:mt-8.pt-4.border-t {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

@media (min-width: 768px) {
  .mt-6.md\:mt-8.pt-4.border-t {
    margin-top: 2rem;
  }
}
</style>
