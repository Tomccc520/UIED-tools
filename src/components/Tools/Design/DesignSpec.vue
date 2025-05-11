<!--
 * @file DesignSpec.vue
 * @description 设计尺寸规范，包含 iOS 和 Android 的设计规范
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 -->

<template>
  <div class="min-h-screen">
    <!-- 主要内容区域 -->
    <div class="bg-white rounded-xl p-6 lg:p-8 mb-4 shadow-sm relative">
      <div class="text-center mb-8 relative">
        <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
          <div class="relative px-12">
            <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">设计尺寸规范</span>
          </div>
        </h2>
        <p class="text-gray-500 text-sm mt-6">Design Guidelines</p>

        <!-- 温馨提示 -->
        <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-gray-600">
              <p class="mb-1">本工具提供 iOS 和 Android 平台的设计规范参考，帮助设计师快速了解不同平台的设计要求。</p>
              <p class="text-gray-500">内容来源于互联网公开资料整理，仅供参考。如有侵权请联系我们删除。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 平台选择 -->
      <div class="platform-selector mb-8">
        <div class="flex justify-center gap-4">
          <button @click="currentPlatform = 'ios'" :class="['px-6 py-3 rounded-lg transition-all duration-300',
            currentPlatform === 'ios'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            iOS 规范
          </button>
          <button @click="currentPlatform = 'android'" :class="['px-6 py-3 rounded-lg transition-all duration-300',
            currentPlatform === 'android'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
            Android 规范
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex">
        <!-- 左侧目录 -->
        <aside class="w-48 flex-shrink-0 hidden lg:block">
          <div class="sticky top-8">
            <nav class="overflow-y-auto pr-4" style="height: calc(100vh - 200px);">
              <!-- iOS 目录 -->
              <div v-show="currentPlatform === 'ios'" class="space-y-1">
                <div class="font-medium text-gray-800 mb-3 text-base">iOS 设计规范</div>
                <ul class="space-y-2.5">
                  <li>
                    <a href="#ios-typography" class="text-gray-600 hover:text-blue-600">字体规范</a>
                  </li>
                  <li>
                    <a href="#ios-points" class="text-gray-600 hover:text-blue-600">点和像素</a>
                  </li>
                  <li>
                    <a href="#ios-icons" class="text-gray-600 hover:text-blue-600">图标规范</a>
                  </li>
                  <li>
                    <a href="#ios-resolution" class="text-gray-600 hover:text-blue-600">分辨率规范</a>
                  </li>
                  <li>
                    <a href="#ios-colors" class="text-gray-600 hover:text-blue-600">配色</a>
                  </li>
                  <li>
                    <a href="#ios-layout" class="text-gray-600 hover:text-blue-600">UI组件布局</a>
                  </li>
                </ul>
              </div>

              <!-- Android 目录 -->
              <div v-show="currentPlatform === 'android'" class="space-y-1">
                <div class="font-medium text-gray-800 mb-3 text-base">Android 设计规范</div>
                <ul class="space-y-2.5">
                  <li>
                    <a href="#android-typography" class="text-gray-600 hover:text-blue-600">字体规范</a>
                  </li>
                  <li>
                    <a href="#android-icons" class="text-gray-600 hover:text-blue-600">图标规范</a>
                  </li>
                  <li>
                    <a href="#android-units" class="text-gray-600 hover:text-blue-600">单位和度量</a>
                  </li>
                  <li>
                    <a href="#android-layout" class="text-gray-600 hover:text-blue-600">UI组件布局</a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </aside>

        <!-- 主内容 -->
        <div class="flex-grow mt-8">
          <!-- iOS 规范内容 -->
          <div v-if="currentPlatform === 'ios'" class="space-y-8">
            <!-- 字体规范 -->
            <section id="ios-typography" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">字体规范</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="mb-4">
                  <p class="text-gray-700">中文字体：PingFang SC</p>
                  <p class="text-gray-700">英文字体：SF UI Text（小于19pt）、SF UI Display（大于20pt）</p>
                </div>
                <table class="w-full mb-6">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">元素</th>
                      <th class="p-3 text-left">字重</th>
                      <th class="p-3 text-left">字号(pt)</th>
                      <th class="p-3 text-left">行距</th>
                      <th class="p-3 text-left">字间距</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in iosTypography" :key="item.element" class="border-b">
                      <td class="p-3">{{ item.element }}</td>
                      <td class="p-3">{{ item.weight }}</td>
                      <td class="p-3">{{ item.size }}</td>
                      <td class="p-3">{{ item.lineHeight }}</td>
                      <td class="p-3">{{ item.letterSpacing }}</td>
                    </tr>
                  </tbody>
                </table>
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">UI元素</th>
                      <th class="p-3 text-left">字号(pt)</th>
                      <th class="p-3 text-left">字重</th>
                      <th class="p-3 text-left">字间距</th>
                      <th class="p-3 text-left">类型</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in iosUITypography" :key="item.element" class="border-b">
                      <td class="p-3">{{ item.element }}</td>
                      <td class="p-3">{{ item.size }}</td>
                      <td class="p-3">{{ item.weight }}</td>
                      <td class="p-3">{{ item.letterSpacing }}</td>
                      <td class="p-3">{{ item.type }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 点和像素 -->
            <section id="ios-points" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">点和像素</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <img src="/images/specification/iosPic01.jpg" alt="Points and Pixels" class="w-full max-w-md mx-auto">
              </div>
            </section>

            <!-- 图标规范 -->
            <section id="ios-icons" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">图标规范</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <h4 class="font-medium mb-4">应用图标</h4>
                <img src="/images/specification/iosPic02.jpg" alt="App Icons" class="w-full max-w-md mx-auto mb-6">
                <table class="w-full mb-8">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">设备名称</th>
                      <th class="p-3 text-left">应用图标</th>
                      <th class="p-3 text-left">App Store图标</th>
                      <th class="p-3 text-left">Spotlight图标</th>
                      <th class="p-3 text-left">设置图标</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in iosIcons" :key="item.device" class="border-b">
                      <td class="p-3">{{ item.device }}</td>
                      <td class="p-3">{{ item.appIcon }}</td>
                      <td class="p-3">{{ item.appStore }}</td>
                      <td class="p-3">{{ item.spotlight }}</td>
                      <td class="p-3">{{ item.settings }}</td>
                    </tr>
                  </tbody>
                </table>
                <h4 class="font-medium mb-4">自定义图标</h4>
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">设备名称</th>
                      <th class="p-3 text-left">导航栏和工具栏图标</th>
                      <th class="p-3 text-left">标签栏图标</th>
                      <th class="p-3 text-left">最大标签栏图标</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in iosCustomIcons" :key="item.device" class="border-b">
                      <td class="p-3">{{ item.device }}</td>
                      <td class="p-3">{{ item.navBarIcon }}</td>
                      <td class="p-3">{{ item.tabBarIcon }}</td>
                      <td class="p-3">{{ item.maxTabBarIcon }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- iOS 分辨率规范 -->
            <section id="ios-resolution" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">分辨率和显示规格</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">设备名称</th>
                      <th class="p-3 text-left">屏幕尺寸</th>
                      <th class="p-3 text-left">PPI</th>
                      <th class="p-3 text-left">Asset</th>
                      <th class="p-3 text-left">竖屏点(point)</th>
                      <th class="p-3 text-left">竖屏分辨率(px)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in iosResolutions" :key="item.device" class="border-b">
                      <td class="p-3">{{ item.device }}</td>
                      <td class="p-3">{{ item.size }}</td>
                      <td class="p-3">{{ item.ppi }}</td>
                      <td class="p-3">{{ item.asset }}</td>
                      <td class="p-3">{{ item.pointResolution }}</td>
                      <td class="p-3">{{ item.pixelResolution }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- iOS 配色 -->
            <section id="ios-colors" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">配色</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <img src="/images/specification/iosPic15.jpg" alt="iOS Color Palette" class="w-full max-w-md mx-auto">
              </div>
            </section>

            <!-- iOS UI组件布局 -->
            <section id="ios-layout" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">UI组件布局</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <div v-for="layout in iosUILayouts" :key="layout.type" class="mb-8 last:mb-0">
                  <h4 :id="'ios-' + layout.type.toLowerCase().replace(/[\s\u4e00-\u9fa5]/g, '-')"
                    class="font-medium mb-4">
                    {{ layout.type }}
                  </h4>
                  <div class="bg-white p-4 rounded-lg shadow-sm">
                    <img :src="`/images/specification/${layout.image}`" :alt="layout.type"
                      class="w-full max-w-md mx-auto">
                  </div>
                  <p class="mt-2 text-sm text-gray-600">{{ layout.description }}</p>
                </div>
              </div>
            </section>
          </div>

          <!-- Android 规范内容 -->
          <div v-if="currentPlatform === 'android'" class="space-y-8">
            <!-- 字体规范 -->
            <section id="android-typography" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">字体规范</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="mb-4">
                  <p class="text-gray-700">中文字体：Source Han Sans / Noto</p>
                  <p class="text-gray-700">英文字体：Roboto</p>
                </div>
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">元素</th>
                      <th class="p-3 text-left">字重</th>
                      <th class="p-3 text-left">字号</th>
                      <th class="p-3 text-left">行距</th>
                      <th class="p-3 text-left">字间距</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in androidTypography" :key="item.element" class="border-b">
                      <td class="p-3">{{ item.element }}</td>
                      <td class="p-3">{{ item.weight }}</td>
                      <td class="p-3">{{ item.size }}</td>
                      <td class="p-3">{{ item.lineHeight }}</td>
                      <td class="p-3">{{ item.letterSpacing }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- 图标规范 -->
            <section id="android-icons" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">图标规范</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <table class="w-full mb-8">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">图标用途</th>
                      <th class="p-3 text-left">mdpi (160dpi)</th>
                      <th class="p-3 text-left">hdpi (240dpi)</th>
                      <th class="p-3 text-left">xhdpi (320dpi)</th>
                      <th class="p-3 text-left">xxhdpi (480dpi)</th>
                      <th class="p-3 text-left">xxxhdpi (640dpi)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in androidIcons" :key="item.type" class="border-b">
                      <td class="p-3">{{ item.type }}</td>
                      <td class="p-3">{{ item.mdpi }}</td>
                      <td class="p-3">{{ item.hdpi }}</td>
                      <td class="p-3">{{ item.xhdpi }}</td>
                      <td class="p-3">{{ item.xxhdpi }}</td>
                      <td class="p-3">{{ item.xxxhdpi }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- 应用图标 -->
                <h4 class="font-medium mb-4">应用图标 Product icons</h4>
                <div class="grid grid-cols-4 gap-6 mb-8">
                  <div v-for="icon in productIcons" :key="icon.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic01-${icon.image}.jpg`" :alt="icon.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ icon.type }}</p>
                    <p class="text-sm text-gray-600">{{ icon.size }}</p>
                  </div>
                </div>

                <!-- 系统图标 -->
                <h4 class="font-medium mb-4">系统图标 System icons</h4>
                <div class="grid grid-cols-4 gap-6 mb-8">
                  <div v-for="icon in systemIcons" :key="icon.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic01-${icon.image}.jpg`" :alt="icon.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ icon.type }}</p>
                    <p class="text-sm text-gray-600">{{ icon.size }}</p>
                  </div>
                </div>

                <!-- 快捷图标 -->
                <h4 class="font-medium mb-4">快捷图标 Shortcut icon</h4>
                <div class="grid grid-cols-4 gap-6">
                  <div v-for="icon in shortcutIcons" :key="icon.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic06-${icon.image}.jpg`" :alt="icon.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ icon.type }}</p>
                    <p class="text-sm text-gray-600" v-html="icon.size"></p>
                  </div>
                </div>
              </div>
            </section>

            <!-- 单位和度量 -->
            <section id="android-units" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">单位和度量</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <div class="mb-6 text-gray-700">
                  <p>dpi = 屏幕宽度（或高度）像素 / 屏幕宽度（或高度）英寸</p>
                  <p>dp = (宽度像素 x 160) / dpi</p>
                </div>
                <table class="w-full">
                  <thead>
                    <tr class="bg-gray-100">
                      <th class="p-3 text-left">名称</th>
                      <th class="p-3 text-left">分辨率 px</th>
                      <th class="p-3 text-left">dpi</th>
                      <th class="p-3 text-left">像素比</th>
                      <th class="p-3 text-left">示例 dp</th>
                      <th class="p-3 text-left">对应像素</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in androidDensities" :key="item.name" class="border-b">
                      <td class="p-3">{{ item.name }}</td>
                      <td class="p-3">{{ item.resolution }}</td>
                      <td class="p-3">{{ item.dpi }}</td>
                      <td class="p-3">{{ item.ratio }}</td>
                      <td class="p-3">{{ item.example }}</td>
                      <td class="p-3">{{ item.pixels }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- UI组件布局 -->
            <section id="android-layout" class="spec-section">
              <h3 class="text-xl font-semibold mb-4">UI组件布局</h3>
              <div class="bg-gray-50 p-6 rounded-lg">
                <!-- 列表 -->
                <h4 class="font-medium mb-4">列表 List</h4>
                <div class="grid grid-cols-4 gap-6 mb-8">
                  <div v-for="layout in listLayouts" :key="layout.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic02-${layout.image}.jpg`" :alt="layout.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ layout.type }}</p>
                    <p class="text-sm text-gray-600" v-html="layout.description"></p>
                  </div>
                </div>

                <!-- 详情视图 -->
                <h4 class="font-medium mb-4">详情视图 Detail view</h4>
                <div class="grid grid-cols-4 gap-6 mb-8">
                  <div v-for="detail in detailLayouts" :key="detail.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic03-${detail.image}.jpg`" :alt="detail.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ detail.type }}</p>
                    <p class="text-sm text-gray-600" v-html="detail.description"></p>
                  </div>
                </div>

                <!-- 触控区域尺寸 -->
                <h4 class="font-medium mb-4">触控区域尺寸 Touch target size</h4>
                <div class="grid grid-cols-4 gap-6 mb-8">
                  <div v-for="touch in touchTargets" :key="touch.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic04-${touch.image}.jpg`" :alt="touch.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ touch.type }}</p>
                    <p class="text-sm text-gray-600" v-html="touch.description"></p>
                  </div>
                </div>

                <!-- 应用栏 -->
                <h4 class="font-medium mb-4">应用栏 App bar</h4>
                <div class="grid grid-cols-3 gap-6">
                  <div v-for="bar in appBars" :key="bar.type" class="text-center">
                    <div class="bg-white p-4 rounded-lg shadow-sm mb-2">
                      <img :src="`/images/specification/pic05-${bar.image}.jpg`" :alt="bar.type"
                        class="mx-auto max-w-full">
                    </div>
                    <p class="font-medium">{{ bar.type }}</p>
                    <p class="text-sm text-gray-600" v-html="bar.description"></p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具推荐 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from '@vue/runtime-core'
import { useRoute } from 'vue-router'
import { useHead } from '@vueuse/head'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const currentPlatform = ref('ios')

// SEO 配置
useHead({
  title: '设计尺寸规范 - iOS/Android 设计规范查询工具',
  meta: [
    {
      name: 'description',
      content: '提供 iOS 和 Android 平台的设计规范参考，包括字体、图标、分辨率等详细参数。帮助设计师和开发者快速了解不同平台的设计要求。'
    },
    {
      name: 'keywords',
      content: 'iOS设计规范,Android设计规范,移动端设计规范,UI设计规范,设计尺寸,字体规范,图标规范'
    }
  ]
})

// iOS 字体规范数据
const iosTypography = [
  { element: 'Title 1', weight: 'Light', size: '28', lineHeight: '34', letterSpacing: '13' },
  { element: 'Title 2', weight: 'Regular', size: '22', lineHeight: '28', letterSpacing: '16' },
  { element: 'Title 3', weight: 'Regular', size: '20', lineHeight: '24', letterSpacing: '19' },
  { element: 'Headline', weight: 'Semi-Bold', size: '17', lineHeight: '22', letterSpacing: '-24' },
  { element: 'Body', weight: 'Regular', size: '17', lineHeight: '22', letterSpacing: '-24' },
  { element: 'Callout', weight: 'Regular', size: '16', lineHeight: '21', letterSpacing: '-20' },
  { element: 'Subhead', weight: 'Regular', size: '15', lineHeight: '20', letterSpacing: '-16' },
  { element: 'Footnote', weight: 'Regular', size: '13', lineHeight: '18', letterSpacing: '-6' },
  { element: 'Caption 1', weight: 'Regular', size: '12', lineHeight: '16', letterSpacing: '0' },
  { element: 'Caption 2', weight: 'Regular', size: '11', lineHeight: '13', letterSpacing: '6' }
]

// iOS UI 元素字体规范
const iosUITypography = [
  { element: 'Nav Bar Title', size: '17', weight: 'Medium', letterSpacing: '0.5', type: 'Display' },
  { element: 'Nav Bar Button', size: '17', weight: 'Regular', letterSpacing: '0.5', type: 'Display' },
  { element: 'Search Bar', size: '13.5', weight: 'Regular', letterSpacing: '0', type: 'Text' },
  { element: 'Tab Bar Button', size: '10', weight: 'Regular', letterSpacing: '0.1', type: 'Text' },
  { element: 'Table Header', size: '12.5', weight: 'Regular', letterSpacing: '0.25', type: 'Text' },
  { element: 'Table Row', size: '16.5', weight: 'Regular', letterSpacing: '0', type: 'Text' },
  { element: 'Table Row Subline', size: '12', weight: 'Regular', letterSpacing: '0', type: 'Text' },
  { element: 'Table Footer', size: '12.5', weight: 'Regular', letterSpacing: '0.2', type: 'Text' },
  { element: 'Action Sheets', size: '20', weight: 'Regular / Medium', letterSpacing: '0.5', type: 'Display' }
]

// iOS 图标规范数据
const iosIcons = [
  { device: 'iPhone X, 8+, 7+, 6s+, 6s', appIcon: '180 x 180', appStore: '1024 x 1024', spotlight: '120 x 120', settings: '87 x 87' },
  { device: 'iPhone X, 8, 7, 6s, 6, SE，5s, 5c, 5, 4s, 4', appIcon: '120 x 120', appStore: '1024 x 1024', spotlight: '80 x 80', settings: '58 x 58' },
  { device: 'iPhone 1, 3G, 3GS', appIcon: '57 x 57', appStore: '1024 x 1024', spotlight: '29 x 29', settings: '29 x 29' },
  { device: 'iPad Pro 12.9, 10.5', appIcon: '167 x 167', appStore: '1024 x 1024', spotlight: '80 x 80', settings: '58 x 58' },
  { device: 'iPad Air 1 & 2, Mini 2 & 4, 3 & 4', appIcon: '152 x 152', appStore: '1024 x 1024', spotlight: '80 x 80', settings: '58 x 58' },
  { device: 'iPad 1, 2, Mini 1', appIcon: '76 x 76', appStore: '1024 x 1024', spotlight: '40 x 40', settings: '29 x 29' }
]

// iOS 自定义图标规范
const iosCustomIcons = [
  { device: 'iPhone 8+, 7+, 6+, 6s+', navBarIcon: '66 x 66', tabBarIcon: '75 x 75', maxTabBarIcon: '144 x 96' },
  { device: 'iPhone 8, 7, 6s, 6, SE', navBarIcon: '44 x 44', tabBarIcon: '50 x 50', maxTabBarIcon: '96 x 64' },
  { device: 'iPad Pro, iPad, iPad mini', navBarIcon: '44 x 44', tabBarIcon: '50 x 50', maxTabBarIcon: '96 x 64' }
]

// iOS 分辨率规范数据
const iosResolutions = [
  { device: 'iPhone X', size: '5.8"', ppi: '458', asset: '@3x', pointResolution: '375 x 812', pixelResolution: '1125 x 2436' },
  { device: 'iPhone 8+, 7+, 6s+, 6+', size: '5.5"', ppi: '401', asset: '@3x', pointResolution: '414 x 736', pixelResolution: '1242 x 2208' },
  { device: 'iPhone 8, 7, 6s, 6', size: '4.7"', ppi: '326', asset: '@2x', pointResolution: '375 x 667', pixelResolution: '750 x 1334' },
  { device: 'iPhone SE, 5, 5S, 5C', size: '4.0"', ppi: '326', asset: '@2x', pointResolution: '320 x 568', pixelResolution: '640 x 1136' },
  { device: 'iPad Pro 12.9', size: '12.9"', ppi: '264', asset: '@2x', pointResolution: '1024 x 1366', pixelResolution: '2048 x 2732' },
  { device: 'iPad Pro 10.5', size: '10.5"', ppi: '264', asset: '@2x', pointResolution: '834 x 1112', pixelResolution: '1668 x 2224' }
]

// iOS UI 组件布局数据
const iosUILayouts = [
  {
    type: '状态栏',
    image: 'iosPic03.jpg',
    description: '状态栏高度：20pt'
  },
  {
    type: '导航栏',
    image: 'iosPic04.jpg',
    description: '导航栏高度：44pt，总高度（含状态栏）：64pt'
  },
  {
    type: '搜索栏',
    image: 'iosPic05.jpg',
    description: '搜索栏高度：44pt，内边距：8pt'
  },
  {
    type: '标签栏',
    image: 'iosPic06.jpg',
    description: '标签栏高度：49pt'
  },
  {
    type: '列表视图',
    image: 'iosPic07.jpg',
    description: '标准行高：44pt，分组间距：35pt，水平边距：15pt'
  },
  {
    type: '模态视图',
    image: 'iosPic08.jpg',
    description: '建议高度：占屏幕高度的 85%，圆角：10pt'
  },
  {
    type: '操作表',
    image: 'iosPic09.jpg',
    description: '操作按钮高度：44pt，取消按钮高度：44pt，按钮间距：8pt'
  },
  {
    type: '提示框',
    image: 'iosPic10.jpg',
    description: '提示框宽度：270pt，按钮高度：44pt，内容边距：16pt'
  },
  {
    type: '分段控件',
    image: 'iosPic11.jpg',
    description: '分段控件高度：29pt，最小宽度：280pt'
  },
  {
    type: '滑动条',
    image: 'iosPic12.jpg',
    description: '滑块尺寸：28x28pt，轨道高度：2pt'
  },
  {
    type: '切换按钮',
    image: 'iosPic13.jpg',
    description: '开关尺寸：51x31pt，圆形滑块直径：29pt'
  },
  {
    type: '计步器',
    image: 'iosPic14.jpg',
    description: '计步器尺寸：94x29pt，按钮宽度：47pt'
  }
]

// Android 字体规范数据
const androidTypography = [
  { element: 'App bar', weight: 'Medium', size: '20sp', lineHeight: '-', letterSpacing: '-' },
  { element: 'Buttons', weight: 'Medium', size: '15sp', lineHeight: '-', letterSpacing: '10' },
  { element: 'Headline', weight: 'Regular', size: '24sp', lineHeight: '34dp', letterSpacing: '0' },
  { element: 'Title', weight: 'Medium', size: '21sp', lineHeight: '-', letterSpacing: '5' },
  { element: 'Subheading', weight: 'Regular', size: '17sp', lineHeight: '30dp', letterSpacing: '10' },
  { element: 'Body 1', weight: 'Regular', size: '15sp', lineHeight: '23dp', letterSpacing: '10' },
  { element: 'Body 2', weight: 'Bold', size: '15sp', lineHeight: '26dp', letterSpacing: '10' },
  { element: 'Caption', weight: 'Regular', size: '13sp', lineHeight: '-', letterSpacing: '20' }
]

// Android 图标规范数据
const androidIcons = [
  { type: '应用图标', mdpi: '48 x 48 px', hdpi: '72 x 72 px', xhdpi: '96 x 96 px', xxhdpi: '144 x 144 px', xxxhdpi: '192 x 192 px' },
  { type: '系统图标', mdpi: '24 x 24 px', hdpi: '36 x 36 px', xhdpi: '48 x 48 px', xxhdpi: '72 x 72 px', xxxhdpi: '196 x 196 px' }
]

// 产品图标数据
const productIcons = [
  { type: '方形', size: '高度：152dp 宽度：152dp', image: 'a' },
  { type: '圆形', size: '直径：176dp', image: 'b' },
  { type: '垂直长方形', size: '高度：176dp 宽度：128dp', image: 'c' },
  { type: '水平长方形', size: '高度：128dp 宽度：176dp', image: 'd' }
]

// 系统图标数据
const systemIcons = [
  { type: '方形', size: '高度：18dp 宽度：18dp', image: 'a' },
  { type: '圆形', size: '直径：20dp', image: 'b' },
  { type: '垂直长方形', size: '高度：20dp 宽度：16dp', image: 'c' },
  { type: '水平长方形', size: '高度：16dp 宽度：20dp', image: 'd' }
]

// 快捷图标数据
const shortcutIcons = [
  { type: '实际面积', size: '高度：44dp 宽度：44dp', image: 'a' },
  { type: '总面积', size: '高度：48dp 宽度：48dp', image: 'b' },
  { type: '系统图标尺寸', size: '高度：24dp 宽度：24dp', image: 'c' },
  { type: '实际面积位置', size: '剩余高度：24dp<br>剩余宽度：24dp', image: 'd' }
]

// Android 密度规范数据
const androidDensities = [
  { name: 'xxxhdpi', resolution: '2160 x 3840', dpi: '640', ratio: '4.0', example: '48dp', pixels: '192px' },
  { name: 'xxhdpi', resolution: '1080 x 1920', dpi: '480', ratio: '3.0', example: '48dp', pixels: '144px' },
  { name: 'xhdpi', resolution: '720 x 1280', dpi: '320', ratio: '2.0', example: '48dp', pixels: '96px' },
  { name: 'hdpi', resolution: '480 x 800', dpi: '240', ratio: '1.5', example: '48dp', pixels: '72px' },
  { name: 'mdpi', resolution: '320 x 480', dpi: '160', ratio: '1.0', example: '48dp', pixels: '48px' }
]

// 列表布局数据
const listLayouts = [
  { type: '垂直边框和水平外边距', description: '边框左右外边距各16dp<br>带有图标或者头像的内容有 72dp 的左边距', image: 'a' },
  { type: '垂直边距', description: '1. 状态栏：24dp<br>2. 工具栏：56dp<br>3. 子标题：48dp<br>4. 列表项：72dp', image: 'b' },
  { type: '垂直边框和水平外边距', description: '边框左右外边距各16dp<br>带有图标或者头像的内容有 72dp 的左边距', image: 'c' },
  { type: '垂直边距', description: '1. 状态栏：24dp<br>2. 工具栏：56dp<br>3. 标题和列表项：48dp<br>4. 子标题：48dp<br>5. 内容区域间的距离：8dp', image: 'd' }
]

// 详情视图数据
const detailLayouts = [
  { type: '垂直边框和水平外边距', description: '边框左右外边距各16dp<br>带有图标或者头像的内容有 72dp 的左边距<br>右边图标的右边距为32dp', image: 'a' },
  { type: '垂直边距', description: '1. 状态栏：24dp<br>2. 工具栏：56dp<br>3. 内容区域间的距离：8dp<br>4. 列表项：72dp', image: 'b' },
  { type: '垂直边框和水平外边距', description: '边框左右外边距各16dp<br>带有图标或者头像的内容有 72dp 的左边距<br>弹出菜单与右边框的距离为56dp', image: 'c' },
  { type: '垂直边距', description: '1. 列表项：48dp<br>2. 内容区域间的距离：8dp<br>3. 导航右边距：56dp', image: 'd' }
]

// 触控区域尺寸数据
const touchTargets = [
  { type: '基础尺寸', description: '头像：40dp<br>图标：24dp<br>触控区：48dp', image: 'a' },
  { type: '实例', description: '实例展示', image: 'b' },
  { type: '按钮尺寸', description: '触控区域高度：48dp<br>按钮高度：36dp', image: 'c' },
  { type: '实例', description: '实例展示', image: 'd' }
]

// 应用栏数据
const appBars = [
  { type: '基础应用栏', description: '应用栏高度：56dp<br>应用栏左右内边距：16dp<br>应用栏图标上、下、左内边距：16dp<br>应用栏标题左内边距：72dp<br>应用栏标题下内边距：20dp', image: 'a' },
  { type: '扩展应用栏', description: '应用栏高度：128dp', image: 'b' },
  { type: '多层应用栏', description: '操作栏高度：56dp<br>标题栏高度：80dp<br>标题栏底部内边距：8dp<br>描述区域高度：72dp<br>描述区底部内边距：16dp', image: 'c' }
]

// 修改锚点滚动处理
const handleAnchorClick = (e: Event) => {
  const target = e.target as HTMLAnchorElement
  if (!target.hash) return

  e.preventDefault()
  const element = document.querySelector(target.hash)
  if (!element) return

  const offset = 120 // 增加偏移量
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
  window.scrollTo({
    top: elementPosition - offset,
    behavior: 'smooth'
  })
}

// 修改滚动监听处理
const handleScroll = () => {
  const sections = document.querySelectorAll('.spec-section')
  const scrollPosition = window.scrollY + 180 // 增加判断偏移量

  sections.forEach(section => {
    const id = section.getAttribute('id')
    if (!id) return

    const link = document.querySelector(`a[href="#${id}"]`)
    if (!link) return

    const sectionTop = (section as HTMLElement).offsetTop
    const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('active')
      })
      link.classList.add('active')
    }
  })
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 为所有锚点链接添加点击事件
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', handleAnchorClick)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.removeEventListener('click', handleAnchorClick)
  })
})
</script>

<style scoped>
.spec-section {
  @apply bg-white rounded-lg overflow-hidden;
}

table {
  @apply border-collapse w-full text-sm;
}

th,
td {
  @apply text-left p-2 border-b border-gray-200;
}

th {
  @apply font-semibold text-gray-700 bg-gray-50;
}

td {
  @apply text-gray-600;
}

tr:hover {
  @apply bg-gray-50;
}

.platform-selector button {
  @apply font-medium;
}

@media (max-width: 768px) {
  .spec-section {
    @apply overflow-x-auto;
  }

  table {
    @apply min-w-[600px];
  }
}

/* 添加响应式布局样式 */
@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
  }
}

/* 调整表格样式 */
table {
  @apply border-collapse w-full text-sm;
}

th,
td {
  @apply text-left p-2 border-b border-gray-200;
}

/* 调整图片容器样式 */
.spec-section img {
  @apply max-w-md mx-auto rounded-lg shadow-sm;
}

/* 调整内容区块样式 */
.bg-gray-50 {
  @apply p-4 lg:p-6;
}

/* 目录样式优化 */
nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  -webkit-overflow-scrolling: touch;
  overflow-y: auto;
}

nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

/* 目录链接样式 */
nav a {
  display: block;
  padding: 0.25rem 0;
  transition: all 0.15s ease-in-out;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

nav a:hover {
  color: #2563eb;
  padding-left: 0.5rem;
  background-color: rgba(37, 99, 235, 0.05);
}

nav a.active {
  color: #2563eb;
  font-weight: 500;
  background-color: rgba(37, 99, 235, 0.08);
  padding-left: 0.5rem;
}

/* 子目录样式优化 */
nav ul ul {
  border-left: 1px solid rgba(209, 213, 219, 0.5);
  margin-left: 0.5rem !important;
  padding-left: 0.5rem;
}

nav ul ul a {
  font-size: 13px;
  padding: 0.2rem 0.5rem;
}

nav ul ul a:hover {
  padding-left: 0.75rem;
}

/* 优化锚点定位 */
.spec-section {
  scroll-margin-top: 8rem;
}
</style>
