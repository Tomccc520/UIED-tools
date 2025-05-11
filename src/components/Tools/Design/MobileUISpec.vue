<!--
 * @file MobileUISpec.vue
 * @description 移动端UI设计规范，包含iOS和Android平台的界面设计规范和尺寸
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-13
 * @lastUpdate 2025-03-27 优化多尺寸设备展示和设计规范说明
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">移动端UI设计规范</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">Mobile UI Design Guidelines</p>

          <!-- 开发中提示 -->
          <div class="mt-4 inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
            <span class="flex items-center">
              <svg class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.75V6.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round"></path>
                <path d="M17.1266 6.87347L16.0659 7.93413" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M19.25 12L17.75 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round"></path>
                <path d="M17.1266 17.1265L16.0659 16.0659" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M12 19.25V17.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round"></path>
                <path d="M7.9342 16.0659L6.87354 17.1265" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M6.25 12L4.75 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round"></path>
                <path d="M7.9342 7.93413L6.87354 6.87347" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
              正在开发内容中，敬请期待！目前页面还有错乱！
            </span>
          </div>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">本工具提供 iOS 和 Android 平台的详细UI设计规范，帮助设计师快速掌握不同平台的设计标准。</p>
            </div>
          </div>
        </div>

        <!-- 平台选择 -->
        <div class="platform-selector mb-8">
          <div class="flex flex-wrap justify-center gap-4">
            <button @click="selectedPlatform = 'ios'" class="platform-btn"
              :class="selectedPlatform === 'ios' ? 'active-platform' : ''">
              <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.05 20.28C16.07 21.23 15 21.08 13.99 20.68C12.91 20.28 11.95 20.25 10.81 20.68C9.4 21.23 8.61 21.04 7.75 20.28C4.31 16.68 4.81 11.11 8.68 10.87C9.84 10.93 10.63 11.5 11.28 11.53C12.26 11.33 13.19 10.74 14.27 10.82C15.57 10.93 16.53 11.45 17.14 12.42C14.28 14.02 14.87 17.8 17.5 18.67C17.11 19.27 16.61 19.82 17.05 20.28ZM11.14 10.71C10.97 8.33 12.96 6.4 15.21 6.21C15.42 8.9 12.83 10.95 11.14 10.71Z"
                  fill="currentColor" />
              </svg>
              iOS 规范
            </button>
            <button @click="selectedPlatform = 'android'" class="platform-btn"
              :class="selectedPlatform === 'android' ? 'active-platform' : ''">
              <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.6 9.48L19.44 7.64C19.6 7.48 19.6 7.24 19.44 7.08C19.28 6.92 19.04 6.92 18.88 7.08L16.96 9C15.92 8.28 14.64 7.8 13.2 7.8C11.76 7.8 10.48 8.28 9.44 9L7.52 7.08C7.36 6.92 7.12 6.92 6.96 7.08C6.8 7.24 6.8 7.48 6.96 7.64L8.8 9.48C7.12 10.84 6 12.96 6 15.4V16H20.4V15.4C20.4 12.96 19.28 10.84 17.6 9.48ZM9.6 14C9.04 14 8.6 13.56 8.6 13C8.6 12.44 9.04 12 9.6 12C10.16 12 10.6 12.44 10.6 13C10.6 13.56 10.16 14 9.6 14ZM16.8 14C16.24 14 15.8 13.56 15.8 13C15.8 12.44 16.24 12 16.8 12C17.36 12 17.8 12.44 17.8 13C17.8 13.56 17.36 14 16.8 14Z"
                  fill="currentColor" />
                <path d="M7 17H17V22H7V17Z" fill="currentColor" />
              </svg>
              Android 规范
            </button>
            <button @click="selectedPlatform = 'apple-hig'" class="platform-btn"
              :class="selectedPlatform === 'apple-hig' ? 'active-platform' : ''">
              <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.05 20.28C16.07 21.23 15 21.08 13.99 20.68C12.91 20.28 11.95 20.25 10.81 20.68C9.4 21.23 8.61 21.04 7.75 20.28C4.31 16.68 4.81 11.11 8.68 10.87C9.84 10.93 10.63 11.5 11.28 11.53C12.26 11.33 13.19 10.74 14.27 10.82C15.57 10.93 16.53 11.45 17.14 12.42C14.28 14.02 14.87 17.8 17.5 18.67C17.11 19.27 16.61 19.82 17.05 20.28ZM11.14 10.71C10.97 8.33 12.96 6.4 15.21 6.21C15.42 8.9 12.83 10.95 11.14 10.71Z"
                  fill="currentColor" />
              </svg>
              Apple HIG
            </button>
          </div>
        </div>

        <!-- iOS 设计规范 -->
        <div v-if="selectedPlatform === 'ios'" class="design-spec-content">
          <div class="spec-section">
            <h3 class="section-title">iOS 设计准则</h3>

            <!-- 新增的iOS介绍头部 -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 14C10.34 14 9 15.34 9 17C9 18.66 10.34 20 12 20C13.66 20 15 18.66 15 17C15 15.34 13.66 14 12 14Z"
                      fill="currentColor" />
                  </svg>
                </div>
                <div class="ml-4">
                  <h4 class="text-lg font-semibold text-gray-800">iOS 设计准则</h4>
                  <p class="text-gray-600">iOS 设计准则是 Apple 提供的一系列设计指南和最佳实践，旨在帮助设计师创建符合 iOS 平台风格和用户期望的应用。</p>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>视觉设计原则</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="principle-card">
                    <div class="principle-icon">
                      <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 14C10.34 14 9 15.34 9 17C9 18.66 10.34 20 12 20C13.66 20 15 18.66 15 17C15 15.34 13.66 14 12 14Z"
                          fill="currentColor" />
                      </svg>
                    </div>
                    <div class="principle-title">一致性</div>
                    <div class="principle-desc">保持设计风格一致，使用相同的图标、颜色和排版风格。</div>
                  </div>

                  <div class="principle-card">
                    <div class="principle-icon">
                      <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 14C10.34 14 9 15.34 9 17C9 18.66 10.34 20 12 20C13.66 20 15 18.66 15 17C15 15.34 13.66 14 12 14Z"
                          fill="currentColor" />
                      </svg>
                    </div>
                    <div class="principle-title">简洁性</div>
                    <div class="principle-desc">保持设计简洁，避免过多的装饰和不必要的元素。</div>
                  </div>

                  <div class="principle-card">
                    <div class="principle-icon">
                      <svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 14C10.34 14 9 15.34 9 17C9 18.66 10.34 20 12 20C13.66 20 15 18.66 15 17C15 15.34 13.66 14 12 14Z"
                          fill="currentColor" />
                      </svg>
                    </div>
                    <div class="principle-title">直观性</div>
                    <div class="principle-desc">设计应该直观易懂，用户能够快速理解和使用。</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加设计风格和设计内容规范卡片 -->
            <div class="spec-card">
              <div class="card-header">
                <h4>设计风格与内容</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">设计风格</h5>
                    <p class="mb-4">设计风格包含了应用视觉表现的关键元素，如颜色体系、排版风格和基础形状风格，它们共同构成应用的视觉识别系统。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mb-4">
                      <p class="text-sm text-gray-700 mb-2"><strong>核心要素：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 品牌色彩：主色调和辅助色彩体系</li>
                        <li>• 字体系统：字体家族、字重和尺寸规范</li>
                        <li>• 形状风格：圆角半径、边框和阴影样式</li>
                        <li>• 间距规则：元素间距和对齐准则</li>
                      </ul>
                    </div>

                    <div class="mt-4 mb-6">
                      <div class="style-example flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm">
                        <div class="color-palette flex space-x-2">
                          <div class="w-6 h-6 rounded-full" style="background-color: #007AFF;"></div>
                          <div class="w-6 h-6 rounded-full" style="background-color: #34C759;"></div>
                          <div class="w-6 h-6 rounded-full" style="background-color: #FF3B30;"></div>
                        </div>
                        <div class="font-sample">
                          <span class="text-sm font-normal">Aa</span>
                          <span class="text-sm font-medium ml-1">Aa</span>
                          <span class="text-sm font-semibold ml-1">Aa</span>
                        </div>
                        <div class="shape-sample flex space-x-2">
                          <div class="w-6 h-6 rounded-md border border-gray-300"></div>
                          <div class="w-6 h-6 rounded-xl border border-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 class="text-lg font-medium mb-2">设计内容</h5>
                    <p class="mb-4">设计内容指应用中展示给用户的实际信息和交互元素，它们以组织良好的方式呈现，引导用户完成特定任务。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mb-4">
                      <p class="text-sm text-gray-700 mb-2"><strong>核心要素：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 信息层级：主要信息、次要信息的视觉区分</li>
                        <li>• 内容组织：列表、网格、卡片等内容布局方式</li>
                        <li>• 交互元素：按钮、输入框、选择器等交互组件</li>
                        <li>• 空白空间：内容周围的留白，增强可读性</li>
                      </ul>
                    </div>

                    <div class="mt-4">
                      <div class="content-example p-3 bg-white rounded-lg shadow-sm">
                        <div class="content-sample space-y-3">
                          <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-full bg-blue-100"></div>
                            <div>
                              <div class="h-4 w-36 bg-gray-200 rounded"></div>
                              <div class="h-3 w-24 bg-gray-100 rounded mt-1"></div>
                            </div>
                          </div>
                          <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 rounded-full bg-green-100"></div>
                            <div>
                              <div class="h-4 w-32 bg-gray-200 rounded"></div>
                              <div class="h-3 w-28 bg-gray-100 rounded mt-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header flex items-center">
                <h4>尺寸规范</h4>
                <span class="text-xs ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full">iPhone尺寸规范</span>
              </div>
              <div class="card-content">
                <!-- 设备尺寸选择器 -->
                <div class="device-selector mb-6">
                  <h5 class="text-lg font-medium mb-3">选择设备型号</h5>

                  <!-- 设备选择器改进版 -->
                  <div class="devices-gallery">
                    <div v-for="device in iosDevices" :key="device.id" @click="selectedDeviceSize = device.id"
                      class="device-card" :class="{ 'active-device-card': selectedDeviceSize === device.id }">

                      <!-- 设备图形表示 -->
                      <div class="device-visual">
                        <div class="device-outline" :style="{
                          width: `${80}px`,
                          height: `${80 * (device.height / device.width)}px`
                        }">
                          <div class="device-notch" v-if="device.homeIndicator > 0"></div>
                          <div class="device-screen">
                            <div class="device-status-bar"></div>
                            <div class="device-content">
                              <div class="content-blocks">
                                <div class="mini-block"></div>
                                <div class="mini-block"></div>
                              </div>
                            </div>
                            <div class="device-home-indicator" v-if="device.homeIndicator > 0"></div>
                          </div>
                        </div>
                      </div>

                      <!-- 设备信息 -->
                      <div class="device-info">
                        <div class="device-name">{{ device.name }}</div>
                        <div class="device-specs">{{ device.width }} × {{ device.height }}pt</div>
                      </div>

                      <!-- 选中标识 -->
                      <div class="selection-indicator" v-if="selectedDeviceSize === device.id">
                        <svg viewBox="0 0 24 24" class="check-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- 设备详情展示 -->
                  <div class="selected-device-info mt-4 p-4 bg-blue-50 rounded-lg">
                    <div class="flex items-center mb-2">
                      <svg class="w-4 h-4 text-blue-500 mr-2" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span class="text-sm font-medium text-blue-700">当前选择: {{ currentDevice.name }}</span>
                    </div>
                    <div class="text-xs text-blue-600">
                      根据所选设备，下方的规范和尺寸会自动更新。点击其他设备可切换查看对应规范。
                    </div>
                  </div>
                </div>

                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-1">
                    <div class="w-full rounded-lg border border-gray-200 mb-4 ios-diagram-container">
                      <div class="w-full relative mx-auto py-8 px-4">
                        <div class="ios-spec-diagram flex flex-col items-center">
                          <!-- 使用设备图形表示的屏幕尺寸框架 -->
                          <div class="device-spec-display mb-4">
                            <!-- 设备外观 -->
                            <div class="device-large-preview" :style="{
                              width: `${260}px`,
                              height: `${260 * (currentDevice.height / currentDevice.width)}px`
                            }">
                              <!-- 设备边框 -->
                              <div class="device-frame">
                                <!-- 设备notch -->
                                <div class="device-notch" v-if="currentDevice.homeIndicator > 0"></div>

                                <!-- 设备屏幕 -->
                                <div class="device-screen">
                                  <!-- 状态栏区域 -->
                                  <div class="area status-bar" data-label="状态栏: {{currentDevice.statusBar}}pt">
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M13.8 8.4C13.5 8.7 13.3 9 13.1 9.3C13 9.5 12.9 9.7 12.9 10M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 导航栏区域 -->
                                  <div class="area nav-bar" data-label="导航栏: {{currentDevice.navBar}}pt">
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"
                                          stroke-linecap="round" stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 内容区域 -->
                                  <div class="area content-area" data-label="内容区域">
                                    <div class="content-blocks">
                                      <div class="content-block"></div>
                                      <div class="content-block"></div>
                                      <div class="content-block"></div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M4 21V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H14L20 9V21C20 21.5304 19.7893 22.0391 19.4142 22.4142C19.0391 22.7893 18.5304 23 18 23H6C5.46957 23 4.96086 22.7893 4.58579 22.4142C4.21071 22.0391 4 21.5304 4 21Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 设计风格区域 -->
                                  <div class="area design-style-area" data-label="设计风格">
                                    <div class="design-style-items">
                                      <div class="design-style">
                                        <div class="style-color" style="background-color: #007AFF;"></div>
                                        <div class="style-name">品牌色</div>
                                      </div>
                                      <div class="design-style">
                                        <div class="style-typography">Aa</div>
                                        <div class="style-name">字体</div>
                                      </div>
                                      <div class="design-style">
                                        <div class="style-radius"></div>
                                        <div class="style-name">圆角</div>
                                      </div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M12 19V19C15.866 19 19 15.866 19 12V12C19 8.13401 15.866 5 12 5V5C8.13401 5 5 8.13401 5 12V12C5 15.866 8.13401 19 12 19Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                        <path
                                          d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
                                          fill="currentColor" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 设计内容区域 -->
                                  <div class="area design-content-area" data-label="设计内容">
                                    <div class="design-content-elements">
                                      <div class="content-element">
                                        <div class="element-icon"></div>
                                        <div class="element-text">
                                          <div class="element-title"></div>
                                          <div class="element-desc"></div>
                                        </div>
                                      </div>
                                      <div class="content-element">
                                        <div class="element-icon"></div>
                                        <div class="element-text">
                                          <div class="element-title"></div>
                                          <div class="element-desc"></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 标签栏区域 -->
                                  <div class="area tab-bar" data-label="标签栏: {{currentDevice.tabBar}}pt">
                                    <div class="tab-icons">
                                      <div class="tab-icon"></div>
                                      <div class="tab-icon"></div>
                                      <div class="tab-icon"></div>
                                      <div class="tab-icon"></div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M4 19H20C20.5523 19 21 18.5523 21 18V6C21 5.44772 20.5523 5 20 5H4C3.44772 5 3 5.44772 3 6V18C3 18.5523 3.44772 19 4 19Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- Home指示器 -->
                                  <div v-if="currentDevice.homeIndicator > 0" class="area home-indicator"
                                    data-label="主屏指示器: {{currentDevice.homeIndicator}}pt">
                                    <div class="home-indicator-bar"></div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M12 5V19" stroke="currentColor" stroke-width="2"
                                          stroke-linecap="round" stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- 边距标识 -->
                              <div class="margin-indicators">
                                <div class="margin-indicator left" data-label="{{currentDevice.margin}}pt"></div>
                                <div class="margin-indicator right" data-label="{{currentDevice.margin}}pt"></div>
                              </div>

                              <!-- 屏幕尺寸标识 -->
                              <div class="screen-dimensions">
                                <div class="dimension width" data-label="宽度: {{currentDevice.width}}pt"></div>
                                <div class="dimension height" data-label="高度: {{currentDevice.height}}pt"></div>
                              </div>
                            </div>
                          </div>

                          <!-- 设备信息 -->
                          <div class="device-specs text-center mt-3">
                            <div class="text-lg font-medium text-gray-800">{{ currentDevice.name }}</div>
                            <div class="text-sm text-gray-600">{{ currentDevice.width }} × {{ currentDevice.height }}pt
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex-1">
                    <!-- 设备信息表格 -->
                    <div class="mb-6">
                      <h5 class="text-lg font-medium mb-3 pb-1 border-b border-gray-100">设备尺寸规范</h5>
                      <div class="device-spec-table">
                        <div class="device-spec-row">
                          <div class="spec-label">屏幕尺寸</div>
                          <div class="spec-value">{{ currentDevice.width }} × {{ currentDevice.height }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">状态栏高度</div>
                          <div class="spec-value">{{ currentDevice.statusBar }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">导航栏高度</div>
                          <div class="spec-value">{{ currentDevice.navBar }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">标签栏高度</div>
                          <div class="spec-value">{{ currentDevice.tabBar }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">主屏指示器高度</div>
                          <div class="spec-value">{{ currentDevice.homeIndicator }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">页面边距</div>
                          <div class="spec-value">{{ currentDevice.margin }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">设计风格高度</div>
                          <div class="spec-value">60pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">设计内容高度</div>
                          <div class="spec-value">80pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">内容区域高度</div>
                          <div class="spec-value">{{ currentDevice.height - currentDevice.statusBar -
                            currentDevice.navBar - currentDevice.tabBar - currentDevice.homeIndicator - 140 }}pt</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">标签栏图标尺寸</div>
                          <div class="spec-value">24 × 24pt</div>
                        </div>
                      </div>
                    </div>

                    <!-- 其他规范信息可以保留，或者按需扩展 -->
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header flex items-center">
                <h4>常用组件尺寸</h4>
                <span class="text-xs ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full">符合iOS HIG标准</span>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div class="component-size-card">
                    <div class="component-preview nav-button-preview">
                      <div class="nav-btn-back"></div>
                    </div>
                    <div class="component-details">
                      <div class="component-name">导航栏按钮</div>
                      <div class="component-size">44 × 44pt</div>
                      <div class="component-note">最小可点击区域</div>
                    </div>
                  </div>

                  <div class="component-size-card">
                    <div class="component-preview tab-icon-preview">
                      <div class="tab-icon-sample"></div>
                      <div class="tab-label-sample"></div>
                    </div>
                    <div class="component-details">
                      <div class="component-name">标签栏图标</div>
                      <div class="component-size">24 × 24pt</div>
                      <div class="component-note">居中显示</div>
                    </div>
                  </div>

                  <div class="component-size-card">
                    <div class="component-preview list-preview">
                      <div class="list-icon"></div>
                      <div class="list-content">
                        <div class="list-title"></div>
                        <div class="list-subtitle"></div>
                      </div>
                    </div>
                    <div class="component-details">
                      <div class="component-name">列表项</div>
                      <div class="component-size">44pt高</div>
                      <div class="component-note">标准高度</div>
                    </div>
                  </div>

                  <div class="component-size-card">
                    <div class="component-preview button-preview">
                      <div class="button-sample"></div>
                    </div>
                    <div class="component-details">
                      <div class="component-name">按钮</div>
                      <div class="component-size">44pt高</div>
                      <div class="component-note">圆角10pt</div>
                    </div>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="py-3 px-4 font-semibold text-gray-700">组件</th>
                        <th class="py-3 px-4 font-semibold text-gray-700">尺寸规格</th>
                        <th class="py-3 px-4 font-semibold text-gray-700">备注说明</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">导航栏标题</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">17pt</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">SF Pro Medium</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">标签栏文本</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">10pt</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">SF Pro Regular</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">搜索框</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">36pt高</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">内边距8pt</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">开关控件</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">51 × 31pt</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">标准尺寸</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">分割线</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">1px / 0.5pt</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">左侧缩进16pt</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">弹窗</td>
                        <td class="py-3 px-4 border-t border-gray-100"><code
                            class="text-xs bg-gray-100 px-2 py-1 rounded">270pt宽</code></td>
                        <td class="py-3 px-4 border-t border-gray-100">圆角14pt</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="spec-section">
            <h3 class="section-title">iOS 设计准则</h3>

            <!-- 新增的iOS介绍头部 -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div class="flex items-start">
                <div class="flex-shrink-0 mr-4">
                  <svg class="w-12 h-12 text-blue-500" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                      stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M12 16V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M12 8H12.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-xl font-semibold text-gray-800 mb-2">苹果人机界面指南简介</h4>
                  <p class="text-gray-700 mb-4">
                    iOS设计准则是苹果公司为iOS平台应用开发者提供的官方设计指南，旨在确保应用具有一致、直观且符合平台特性的用户体验。遵循这些准则可以帮助开发者创建既美观又易用的应用，让用户在iOS生态系统中获得熟悉而舒适的体验。
                  </p>
                  <div class="flex flex-wrap gap-3">
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">清晰</span>
                    <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">尊重</span>
                    <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">深度</span>
                    <span class="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">一致性</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>视觉设计原则</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">清晰</h5>
                    <p class="mb-4">文本在任何尺寸下都应该清晰易读，图标应精确且清晰，装饰应恰到好处，设计应专注于功能。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mb-4">
                      <p class="text-sm text-gray-700 mb-2"><strong>实践建议：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 确保文本对比度符合WCAG 2.0 AA标准</li>
                        <li>• 使用SF Pro字体，确保字号不小于12pt</li>
                        <li>• 避免背景过于复杂影响文本可读性</li>
                      </ul>
                    </div>

                    <h5 class="text-lg font-medium mb-2">尊重</h5>
                    <p>流畅的动画和清晰的界面帮助用户理解和交互，内容通常填满整个屏幕，半透明和模糊效果暗示更多内容。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mt-2">
                      <p class="text-sm text-gray-700 mb-2"><strong>实践建议：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 动画时长应保持在0.25-0.35秒</li>
                        <li>• 在元素过渡时使用系统标准动画曲线</li>
                        <li>• 合理使用半透明背景提示层次感</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">深度</h5>
                    <p class="mb-4">视觉层次和真实动作给界面带来活力和增强了用户理解，触摸和可发现性帮助用户与内容互动。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mb-4">
                      <p class="text-sm text-gray-700 mb-2"><strong>实践建议：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 使用视觉线索引导用户注意力</li>
                        <li>• 不同层级内容应有明确的视觉区分</li>
                        <li>• 交互元素应提供适当的触摸反馈</li>
                      </ul>
                    </div>

                    <h5 class="text-lg font-medium mb-2">视觉一致性</h5>
                    <p>使用系统提供的UI元素、字体、图标和标准化的颜色来保持应用与iOS生态系统的一致性。</p>
                    <div class="principle-example bg-blue-50 p-3 rounded-lg mt-2">
                      <p class="text-sm text-gray-700 mb-2"><strong>实践建议：</strong></p>
                      <ul class="text-sm text-gray-700 space-y-1">
                        <li>• 遵循iOS标准导航模式和交互模式</li>
                        <li>• 使用系统预设颜色，如tintColor和labelColor</li>
                        <li>• 保持应用内各功能区域的视觉语言统一</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>常见UI元素样式</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">字体</h5>
                    <p class="mb-2">系统字体：SF Pro</p>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 标题：20-34pt, Medium/Semibold</li>
                      <li>• 正文：17pt, Regular</li>
                      <li>• 辅助文本：15pt, Regular</li>
                      <li>• 标注：13pt, Regular</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">颜色</h5>
                    <p class="mb-2">系统颜色支持亮色和暗色模式</p>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 主要蓝色：#007AFF</li>
                      <li>• 红色：#FF3B30</li>
                      <li>• 绿色：#34C759</li>
                      <li>• 文本：#000000 (亮) / #FFFFFF (暗)</li>
                      <li>• 次要文本：#8E8E93</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">圆角与阴影</h5>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 卡片圆角：8-12pt</li>
                      <li>• 按钮圆角：6-10pt</li>
                      <li>• 阴影很少使用</li>
                      <li>• 使用半透明和模糊效果代替阴影</li>
                      <li>• 强调层次感而非阴影</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- 新增卡片：UI元素可视化示例 -->
            <div class="spec-card">
              <div class="card-header flex items-center">
                <h4>UI元素可视化示例</h4>
                <span class="text-xs ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full">常用控件参考</span>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-3">交互控件</h5>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <div class="ui-element-demo mb-6">
                        <div class="element-name mb-2">按钮样式</div>
                        <div class="element-showcase">
                          <div
                            class="ios-button-filled mb-2 w-full py-3 text-center text-white bg-blue-500 rounded-lg font-medium">
                            填充按钮</div>
                          <div
                            class="ios-button-outlined mb-2 w-full py-3 text-center text-blue-500 border border-blue-500 rounded-lg font-medium">
                            描边按钮</div>
                          <div class="ios-button-plain w-full py-3 text-center text-blue-500 font-medium">文本按钮</div>
                        </div>
                      </div>

                      <div class="ui-element-demo mb-6">
                        <div class="element-name mb-2">表单控件</div>
                        <div class="element-showcase space-y-3">
                          <div
                            class="ios-text-field px-3 py-2 bg-white border border-gray-300 rounded-lg w-full text-gray-700">
                            文本输入框</div>
                          <div class="ios-switch-demo flex items-center justify-between">
                            <span class="text-gray-700">开关控件</span>
                            <div class="ios-switch w-12 h-6 bg-green-400 rounded-full relative">
                              <div
                                class="switch-knob absolute w-5 h-5 bg-white rounded-full top-0.5 right-0.5 shadow-md">
                              </div>
                            </div>
                          </div>
                          <div class="ios-slider-demo">
                            <input type="range" class="w-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 class="text-lg font-medium mb-3">信息展示</h5>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <div class="ui-element-demo mb-6">
                        <div class="element-name mb-2">列表单元格</div>
                        <div class="element-showcase">
                          <div class="ios-list-cell flex items-center p-3 bg-white rounded-lg mb-2">
                            <div
                              class="cell-icon mr-3 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                            </div>
                            <div class="cell-content flex-1">
                              <div class="text-gray-900 font-medium">列表主标题</div>
                              <div class="text-gray-500 text-sm">列表副标题文本</div>
                            </div>
                            <div class="cell-accessory text-gray-400">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                              </svg>
                            </div>
                          </div>
                          <div class="ios-list-cell flex items-center p-3 bg-white rounded-lg">
                            <div
                              class="cell-icon mr-3 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-500">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            </div>
                            <div class="cell-content flex-1">
                              <div class="text-gray-900 font-medium">另一个列表项</div>
                              <div class="text-gray-500 text-sm">带有说明性描述信息</div>
                            </div>
                            <div class="cell-accessory text-gray-400">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="ui-element-demo">
                        <div class="element-name mb-2">提示与通知</div>
                        <div class="element-showcase space-y-3">
                          <div class="ios-alert p-4 bg-white rounded-lg shadow-md">
                            <div class="alert-title font-semibold text-gray-900 mb-2">提示标题</div>
                            <div class="alert-message text-gray-700 mb-3">这是一个提示信息，告知用户重要内容。</div>
                            <div class="alert-actions flex border-t border-gray-200 pt-3">
                              <div class="flex-1 text-center text-gray-500 font-medium">取消</div>
                              <div class="flex-1 text-center text-blue-500 font-medium">确认</div>
                            </div>
                          </div>

                          <div
                            class="ios-toast py-2 px-4 bg-gray-800 bg-opacity-90 text-white text-sm rounded-lg inline-block">
                            操作已完成
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-sm text-gray-500">以上UI元素为常见iOS界面控件的样式参考，实际设计应结合应用需求和品牌调性进行适当调整。</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 在iOS设计规范部分添加UI开发框架信息卡片 -->
          <div class="spec-card">
            <div class="card-header flex items-center">
              <h4>移动UI开发框架</h4>
              <span class="text-xs ml-2 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">设计与开发参考</span>
            </div>
            <div class="card-content">
              <div class="device-framework-info">
                <div class="framework-ios">
                  <div class="framework-title">iOS UI 框架</div>
                  <div class="framework-logo">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.05 20.28C16.07 21.23 15 21.08 13.99 20.68C12.91 20.28 11.95 20.25 10.81 20.68C9.4 21.23 8.61 21.04 7.75 20.28C4.31 16.68 4.81 11.11 8.68 10.87C9.84 10.93 10.63 11.5 11.28 11.53C12.26 11.33 13.19 10.74 14.27 10.82C15.57 10.93 16.53 11.45 17.14 12.42C14.28 14.02 14.87 17.8 17.5 18.67C17.11 19.27 16.61 19.82 17.05 20.28ZM11.14 10.71C10.97 8.33 12.96 6.4 15.21 6.21C15.42 8.9 12.83 10.95 11.14 10.71Z"
                        fill="#007AFF" />
                    </svg>
                  </div>
                  <div class="framework-desc">
                    <p>SwiftUI是Apple的现代UI框架，通过声明式语法构建iOS应用界面，简化了UI开发流程。</p>
                  </div>
                </div>
                <div class="framework-android">
                  <div class="framework-title">Android UI 框架</div>
                  <div class="framework-logo">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.6 9.48L19.44 7.64C19.6 7.48 19.6 7.24 19.44 7.08C19.28 6.92 19.04 6.92 18.88 7.08L16.96 9C15.92 8.28 14.64 7.8 13.2 7.8C11.76 7.8 10.48 8.28 9.44 9L7.52 7.08C7.36 6.92 7.12 6.92 6.96 7.08C6.8 7.24 6.8 7.48 6.96 7.64L8.8 9.48C7.12 10.84 6 12.96 6 15.4V16H20.4V15.4C20.4 12.96 19.28 10.84 17.6 9.48ZM9.6 14C9.04 14 8.6 13.56 8.6 13C8.6 12.44 9.04 12 9.6 12C10.16 12 10.6 12.44 10.6 13C10.6 13.56 10.16 14 9.6 14ZM16.8 14C16.24 14 15.8 13.56 15.8 13C15.8 12.44 16.24 12 16.8 12C17.36 12 17.8 12.44 17.8 13C17.8 13.56 17.36 14 16.8 14Z"
                        fill="#3DDC84" />
                      <path d="M7 17H17V22H7V17Z" fill="#3DDC84" />
                    </svg>
                  </div>
                  <div class="framework-desc">
                    <p>Jetpack Compose是Google的现代Android UI工具包，采用声明式编程模型，简化并加速Android UI开发。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- UI元素可视化示例卡片 -->

          <!-- 新增卡片：常见交互模式 -->
          <div class="spec-card">
            <div class="card-header flex items-center">
              <h4>常见交互模式</h4>
              <span class="text-xs ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-full">iOS设计规范</span>
            </div>
            <div class="card-content">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="interaction-pattern">
                  <h5 class="text-lg font-medium mb-3">导航模式</h5>
                  <div class="pattern-showcase bg-gray-50 rounded-lg p-4 mb-3">
                    <div class="pattern-example flex space-x-4">
                      <div class="nav-example w-1/2">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">层级导航</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2">
                          <div class="ios-navbar h-8 border-b border-gray-200 flex items-center mb-2">
                            <div class="text-blue-500 text-sm mr-auto">&lt; 返回</div>
                            <div class="font-medium text-sm">详情</div>
                            <div className="ml-auto w-10"></div>
                          </div>
                          <div class="sample-content space-y-2">
                            <div class="h-3 bg-gray-100 rounded w-3/4"></div>
                            <div class="h-3 bg-gray-100 rounded w-full"></div>
                            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                      <div class="nav-example w-1/2">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">标签栏导航</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2">
                          <div class="sample-content mb-2 space-y-2">
                            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
                            <div class="h-3 bg-gray-100 rounded w-full"></div>
                            <div class="h-3 bg-gray-100 rounded w-3/4"></div>
                          </div>
                          <div class="ios-tabbar h-8 border-t border-gray-200 flex items-center justify-around">
                            <div class="tab-item flex flex-col items-center">
                              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <div class="text-xs text-blue-500">首页</div>
                            </div>
                            <div class="tab-item flex flex-col items-center">
                              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <div class="text-xs text-gray-400">搜索</div>
                            </div>
                            <div class="tab-item flex flex-col items-center">
                              <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <div class="text-xs text-gray-400">设置</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pattern-description text-sm text-gray-700">
                    <p>iOS的导航模式主要有两种：层级导航（从列表到详情）和标签栏导航（平行切换不同功能）。顶部的导航栏通常提供返回按钮和页面标题，底部的标签栏支持快速切换主要功能。</p>
                  </div>
                </div>

                <div class="interaction-pattern">
                  <h5 class="text-lg font-medium mb-3">手势交互</h5>
                  <div class="pattern-showcase bg-gray-50 rounded-lg p-4 mb-3">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="gesture-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">返回手势</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 relative">
                          <div
                            class="swipe-indicator absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center">
                            <div class="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M15 19l-7-7 7-7"></path>
                              </svg>
                            </div>
                            <div class="ml-1 h-px w-10 bg-blue-200 relative">
                              <div class="absolute right-0 w-2 h-2 rounded-full bg-blue-200"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="gesture-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">下拉刷新</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 relative">
                          <div
                            class="pull-indicator absolute left-1/2 top-2 transform -translate-x-1/2 flex flex-col items-center">
                            <div
                              class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1">
                            </div>
                            <div class="text-xs text-blue-500">刷新中...</div>
                          </div>
                          <div class="absolute bottom-2 left-2 right-2">
                            <div class="h-2 bg-gray-100 rounded w-full mb-1"></div>
                            <div class="h-2 bg-gray-100 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pattern-description text-sm text-gray-700">
                    <p>iOS平台广泛使用手势操作增强交互体验。常见手势包括：从左侧边缘向右滑动返回上一页面、下拉刷新列表、捏合缩放内容、长按显示操作菜单等。设计师应善用这些直观的交互方式提升用户体验。</p>
                  </div>
                </div>

                <div class="interaction-pattern">
                  <h5 class="text-lg font-medium mb-3">模态表现</h5>
                  <div class="pattern-showcase bg-gray-50 rounded-lg p-4 mb-3">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="modal-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">全屏模态</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 relative">
                          <div class="ios-navbar h-6 border-b border-gray-200 flex items-center mb-2">
                            <div class="text-blue-500 text-xs">取消</div>
                            <div class="font-medium text-xs mx-auto">新建项目</div>
                            <div class="text-blue-500 text-xs">完成</div>
                          </div>
                          <div class="sample-form space-y-2">
                            <div class="h-3 bg-gray-100 rounded w-full"></div>
                            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
                          </div>
                        </div>
                      </div>
                      <div class="modal-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">底部弹出</div>
                        <div class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 relative overflow-hidden">
                          <div class="bottom-sheet absolute left-0 right-0 bottom-0 bg-gray-50 rounded-t-lg p-2">
                            <div class="sheet-indicator mx-auto w-10 h-1 bg-gray-300 rounded-full mb-2"></div>
                            <div class="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div class="h-2 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div class="overlay absolute inset-0 bg-black bg-opacity-20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pattern-description text-sm text-gray-700">
                    <p>
                      iOS中常见的模态交互方式包括：全屏模态视图（如创建和编辑场景）、底部弹出（Sheet，适用于操作选择）、弹窗提示（Alert，用于重要信息确认）。模态视图应提供明确的取消和确认操作，并遵循自下而上的动画过渡效果。
                    </p>
                  </div>
                </div>

                <div class="interaction-pattern">
                  <h5 class="text-lg font-medium mb-3">操作反馈</h5>
                  <div class="pattern-showcase bg-gray-50 rounded-lg p-4 mb-3">
                    <div class="grid grid-cols-2 gap-4">
                      <div class="feedback-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">加载状态</div>
                        <div
                          class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 flex items-center justify-center">
                          <div class="loading-state text-center">
                            <div
                              class="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-1">
                            </div>
                            <div class="text-xs text-gray-500">加载中...</div>
                          </div>
                        </div>
                      </div>
                      <div class="feedback-example">
                        <div class="example-title text-sm text-gray-500 mb-2 text-center">成功状态</div>
                        <div
                          class="example-visual bg-white rounded-lg shadow-sm p-2 h-24 flex items-center justify-center">
                          <div class="success-state text-center">
                            <div
                              class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                              <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M5 13l4 4L19 7"></path>
                              </svg>
                            </div>
                            <div class="text-xs text-gray-700">操作成功</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="pattern-description text-sm text-gray-700">
                    <p>即时反馈是iOS交互设计的重要原则。常见的反馈类型包括：加载状态指示器（Activity Indicator）、操作结果提示（成功/失败）、轻触动画（点击时的亮度变化）和震动反馈（Haptic
                      Feedback）。设计合理的反馈机制让用户能够明确了解操作的状态和结果。</p>
                  </div>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-gray-200">
                <div class="bg-yellow-50 p-4 rounded-lg">
                  <h5 class="font-medium text-yellow-800 mb-2">设计建议</h5>
                  <p class="text-sm text-yellow-700">
                    在设计iOS应用时，应遵循系统标准交互模式，保持界面交互的一致性与可预期性。不熟悉的交互方式会增加用户学习成本，降低使用体验。同时，对于常见交互模式可以进行适度创新，但需确保操作逻辑符合用户预期并提供足够的视觉提示。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Android 设计规范 -->
        <div v-if="selectedPlatform === 'android'" class="design-spec-content">
          <div class="spec-section">
            <h3 class="section-title">尺寸规范</h3>

            <div class="spec-card">
              <div class="card-header">
                <h4>设计尺寸</h4>
              </div>
              <div class="card-content">
                <!-- Android 设备选择器 -->
                <div class="device-selector mb-6">
                  <h5 class="text-lg font-medium mb-3">选择Android设备型号</h5>

                  <!-- 设备选择器改进版 - Android -->
                  <div class="devices-gallery">
                    <div v-for="device in androidDevices" :key="device.id" @click="selectedDeviceSize = device.id"
                      class="device-card" :class="{ 'active-device-card': selectedDeviceSize === device.id }">

                      <!-- 设备图形表示 -->
                      <div class="device-visual">
                        <div class="device-outline android" :style="{
                          width: `${80}px`,
                          height: `${80 * (device.height / device.width)}px`
                        }">
                          <div class="device-screen">
                            <div class="device-status-bar android"></div>
                            <div class="device-content">
                              <div class="content-blocks">
                                <div class="mini-block"></div>
                                <div class="mini-block"></div>
                              </div>
                            </div>
                            <div class="android-navbar"></div>
                          </div>
                        </div>
                      </div>

                      <!-- 设备信息 -->
                      <div class="device-info">
                        <div class="device-name">{{ device.name }}</div>
                        <div class="device-specs">{{ device.width }} × {{ device.height }}dp</div>
                      </div>

                      <!-- 选中标识 -->
                      <div class="selection-indicator" v-if="selectedDeviceSize === device.id">
                        <svg viewBox="0 0 24 24" class="check-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- 设备详情展示 -->
                  <div class="selected-device-info mt-4 p-4 bg-green-50 rounded-lg">
                    <div class="flex items-center mb-2">
                      <svg class="w-4 h-4 text-green-500 mr-2" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span class="text-sm font-medium text-green-700">当前选择: {{ currentAndroidDevice.name }}</span>
                    </div>
                    <div class="text-xs text-green-600">
                      Android设备使用dp为单位，不同于iOS的pt单位。1dp在标准160dpi屏幕上等于1px。
                    </div>
                  </div>
                </div>

                <div class="flex flex-col md:flex-row gap-6">
                  <div class="flex-1">
                    <div class="w-full rounded-lg shadow-md mb-4 android-diagram-container">
                      <!-- Android设计规范图示 SVG - 线框图 -->
                      <div class="w-full relative mx-auto py-8 px-4">
                        <div class="android-spec-diagram flex flex-col items-center">
                          <!-- 使用设备图形表示的屏幕尺寸框架 -->
                          <div class="device-spec-display mb-4">
                            <!-- 设备外观 -->
                            <div class="device-large-preview" :style="{
                              width: `${260}px`,
                              height: `${260 * (currentAndroidDevice.height / currentAndroidDevice.width)}px`
                            }">
                              <!-- 设备边框 -->
                              <div class="device-frame android">
                                <!-- 设备屏幕 -->
                                <div class="device-screen">
                                  <!-- 状态栏区域 -->
                                  <div class="area status-bar" data-label="状态栏: {{currentAndroidDevice.statusBar}}dp">
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 应用栏区域 -->
                                  <div class="area app-bar" data-label="应用栏: {{currentAndroidDevice.appBar}}dp">
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 5H21" stroke="currentColor" stroke-width="2"
                                          stroke-linecap="round" />
                                        <path d="M3 12H21" stroke="currentColor" stroke-width="2"
                                          stroke-linecap="round" />
                                        <path d="M3 19H21" stroke="currentColor" stroke-width="2"
                                          stroke-linecap="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 内容区域 -->
                                  <div class="area content-area" data-label="内容区域">
                                    <div class="content-blocks">
                                      <div class="content-block"></div>
                                      <div class="content-block"></div>
                                      <div class="content-block"></div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M4 21V5C4 4.46957 4.21071 3.96086 4.58579 3.58579C4.96086 3.21071 5.46957 3 6 3H14L20 9V21C20 21.5304 19.7893 22.0391 19.4142 22.4142C19.0391 22.7893 18.5304 23 18 23H6C5.46957 23 4.96086 22.7893 4.58579 22.4142C4.21071 22.0391 4 21.5304 4 21Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 设计风格区域 -->
                                  <div class="area design-style-area" data-label="设计风格">
                                    <div class="design-style-items">
                                      <div class="design-style">
                                        <div class="style-color" style="background-color: #007AFF;"></div>
                                        <div class="style-name">品牌色</div>
                                      </div>
                                      <div class="design-style">
                                        <div class="style-typography">Aa</div>
                                        <div class="style-name">字体</div>
                                      </div>
                                      <div class="design-style">
                                        <div class="style-radius"></div>
                                        <div class="style-name">圆角</div>
                                      </div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                          d="M12 19V19C15.866 19 19 15.866 19 12V12C19 8.13401 15.866 5 12 5V5C8.13401 5 5 8.13401 5 12V12C5 15.866 8.13401 19 12 19Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                        <path
                                          d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
                                          fill="currentColor" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 设计内容区域 -->
                                  <div class="area design-content-area" data-label="设计内容">
                                    <div class="design-content-elements">
                                      <div class="content-element">
                                        <div class="element-icon"></div>
                                        <div class="element-text">
                                          <div class="element-title"></div>
                                          <div class="element-desc"></div>
                                        </div>
                                      </div>
                                      <div class="content-element">
                                        <div class="element-icon"></div>
                                        <div class="element-text">
                                          <div class="element-title"></div>
                                          <div class="element-desc"></div>
                                        </div>
                                      </div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>

                                  <!-- 导航栏区域 -->
                                  <div class="area nav-bar" data-label="导航栏: {{currentAndroidDevice.navBar}}dp">
                                    <div class="nav-buttons">
                                      <div class="nav-button"></div>
                                      <div class="nav-button"></div>
                                      <div class="nav-button"></div>
                                    </div>
                                    <div class="area-icon">
                                      <svg class="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                          stroke-linejoin="round" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <!-- 边距标识 -->
                              <div class="margin-indicators">
                                <div class="margin-indicator left" data-label="{{currentAndroidDevice.margin}}dp"></div>
                                <div class="margin-indicator right" data-label="{{currentAndroidDevice.margin}}dp">
                                </div>
                              </div>

                              <!-- 屏幕尺寸标识 -->
                              <div class="screen-dimensions">
                                <div class="dimension width" data-label="宽度: {{currentAndroidDevice.width}}dp"></div>
                                <div class="dimension height" data-label="高度: {{currentAndroidDevice.height}}dp"></div>
                              </div>
                            </div>
                          </div>

                          <!-- 设备信息 -->
                          <div class="device-specs text-center mt-3">
                            <div class="text-lg font-medium text-gray-800">{{ currentAndroidDevice.name }}</div>
                            <div class="text-sm text-gray-600">{{ currentAndroidDevice.width }} × {{
                              currentAndroidDevice.height }}dp</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex-1">
                    <div class="mb-6">
                      <h5 class="text-lg font-medium mb-3 pb-1 border-b border-gray-100">关键尺寸指南</h5>
                      <div class="dimensions-diagram mt-4 p-4 bg-gray-50 rounded-lg">
                        <div class="dimensions-visual relative">
                          <div class="device-outline-schema">
                            <!-- 设备示意轮廓 -->
                            <svg width="200" height="360" viewBox="0 0 200 360" class="mx-auto">
                              <!-- 设备外框 -->
                              <rect x="10" y="10" width="180" height="340" rx="20" stroke="#6C54FF" stroke-width="2"
                                fill="none" />

                              <!-- 状态栏区域 -->
                              <rect x="10" y="10" width="180" height="47" rx="20" stroke="#6C54FF" stroke-width="1"
                                stroke-dasharray="4 2" fill="rgba(108, 84, 255, 0.1)" />
                              <text x="100" y="40" text-anchor="middle" font-size="10" fill="#6C54FF">状态栏 ({{
                                currentAndroidDevice.statusBar }}dp)</text>

                              <!-- 导航栏区域 -->
                              <rect x="10" y="57" width="180" height="44" stroke="#6C54FF" stroke-width="1"
                                stroke-dasharray="4 2" fill="rgba(108, 84, 255, 0.1)" />
                              <text x="100" y="85" text-anchor="middle" font-size="10" fill="#6C54FF">导航栏 ({{
                                currentAndroidDevice.appBar }}dp)</text>

                              <!-- 内容区域 -->
                              <rect x="10" y="101" width="180" height="199" stroke="#6C54FF" stroke-width="1"
                                stroke-dasharray="4 2" fill="rgba(108, 84, 255, 0.05)" />
                              <text x="100" y="200" text-anchor="middle" font-size="10" fill="#6C54FF">内容区域</text>

                              <!-- 标签栏区域 -->
                              <rect x="10" y="300" width="180" height="50" stroke="#6C54FF" stroke-width="1"
                                stroke-dasharray="4 2" fill="rgba(108, 84, 255, 0.1)" />
                              <text x="100" y="330" text-anchor="middle" font-size="10" fill="#6C54FF">标签栏 ({{
                                currentAndroidDevice.navBar }}dp)</text>

                              <!-- 尺寸线 - 宽度 -->
                              <line x1="0" y1="5" x2="200" y2="5" stroke="#FF4D6D" stroke-width="1"
                                stroke-dasharray="4 2" />
                              <line x1="0" y1="3" x2="0" y2="7" stroke="#FF4D6D" stroke-width="1" />
                              <line x1="200" y1="3" x2="200" y2="7" stroke="#FF4D6D" stroke-width="1" />
                              <text x="100" y="15" text-anchor="middle" font-size="10" fill="#FF4D6D"
                                font-weight="bold">{{ currentAndroidDevice.width }}dp</text>

                              <!-- 尺寸线 - 高度 -->
                              <line x1="195" y1="10" x2="195" y2="350" stroke="#FF4D6D" stroke-width="1"
                                stroke-dasharray="4 2" />
                              <line x1="193" y1="10" x2="197" y2="10" stroke="#FF4D6D" stroke-width="1" />
                              <line x1="193" y1="350" x2="197" y2="350" stroke="#FF4D6D" stroke-width="1" />
                              <text x="205" y="180" text-anchor="middle" font-size="10" fill="#FF4D6D"
                                font-weight="bold" transform="rotate(90,205,180)">{{ currentAndroidDevice.height
                                }}dp</text>

                              <!-- 安全区域边距 -->
                              <line x1="26" y1="120" x2="26" y2="280" stroke="#00A3FF" stroke-width="1"
                                stroke-dasharray="4 2" />
                              <line x1="24" y1="120" x2="28" y2="120" stroke="#00A3FF" stroke-width="1" />
                              <line x1="24" y1="280" x2="28" y2="280" stroke="#00A3FF" stroke-width="1" />
                              <text x="42" y="200" text-anchor="middle" font-size="10" fill="#00A3FF" font-weight="bold"
                                transform="rotate(90,42,200)">安全区域</text>

                              <!-- 边距指示 -->
                              <line x1="10" y1="120" x2="26" y2="120" stroke="#00A3FF" stroke-width="1"
                                stroke-dasharray="4 2" />
                              <text x="18" y="110" text-anchor="middle" font-size="10" fill="#00A3FF">{{
                                currentAndroidDevice.margin }}dp</text>
                            </svg>
                          </div>

                          <div class="dimensions-legend mt-4 grid grid-cols-3 gap-2">
                            <div class="flex items-center">
                              <div class="w-4 h-0 border-t-2 border-dashed border-purple-500 mr-2"></div>
                              <span class="text-xs text-gray-700">UI元素边界</span>
                            </div>
                            <div class="flex items-center">
                              <div class="w-4 h-0 border-t-2 border-dashed border-red-400 mr-2"></div>
                              <span class="text-xs text-gray-700">主要尺寸</span>
                            </div>
                            <div class="flex items-center">
                              <div class="w-4 h-0 border-t-2 border-dashed border-blue-400 mr-2"></div>
                              <span class="text-xs text-gray-700">安全区域</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="mb-6">
                      <h5 class="text-lg font-medium mb-3 pb-1 border-b border-gray-100">设备信息</h5>
                      <div class="device-spec-table">
                        <div class="device-spec-row">
                          <div class="spec-label">设备名称</div>
                          <div class="spec-value">{{ currentAndroidDevice.name }}</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">屏幕尺寸</div>
                          <div class="spec-value">{{ currentAndroidDevice.width }} × {{ currentAndroidDevice.height }}dp
                          </div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">状态栏高度</div>
                          <div class="spec-value">{{ currentAndroidDevice.statusBar }}dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">应用栏高度</div>
                          <div class="spec-value">{{ currentAndroidDevice.appBar }}dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">导航栏高度</div>
                          <div class="spec-value">{{ currentAndroidDevice.navBar }}dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">页面边距</div>
                          <div class="spec-value">{{ currentAndroidDevice.margin }}dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">设计风格高度</div>
                          <div class="spec-value">60dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">设计内容高度</div>
                          <div class="spec-value">80dp</div>
                        </div>
                        <div class="device-spec-row">
                          <div class="spec-label">内容区域高度</div>
                          <div class="spec-value">{{ currentAndroidDevice.height - currentAndroidDevice.statusBar -
                            currentAndroidDevice.appBar - currentAndroidDevice.navBar - 140 }}dp</div>
                        </div>
                      </div>
                    </div>
                    <div class="mb-6">
                      <h5 class="text-lg font-medium mb-2">设计单位</h5>
                      <p>Android使用密度无关像素（dp）作为标准单位，1dp等于在160dpi屏幕上的1物理像素。文本使用可缩放像素（sp）。</p>
                    </div>
                    <div class="mb-4">
                      <h5 class="text-lg font-medium mb-2">设计建议</h5>
                      <ul class="space-y-1 text-gray-700 bg-green-50 p-4 rounded-lg">
                        <li class="flex items-start">
                          <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                          </svg>
                          <span>使用Material Design指南，保持与Android设计语言一致</span>
                        </li>
                        <li class="flex items-start">
                          <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                          </svg>
                          <span>遵循8dp网格系统，确保布局对齐与一致</span>
                        </li>
                        <li class="flex items-start">
                          <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                          </svg>
                          <span>保持足够的点击区域（至少48×48dp），提升用户操作体验</span>
                        </li>
                        <li class="flex items-start">
                          <svg class="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7">
                            </path>
                          </svg>
                          <span>考虑不同屏幕尺寸和密度，确保界面在各种设备上都能良好展示</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>常用组件尺寸</h4>
              </div>
              <div class="card-content">
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr>
                        <th class="pb-2">组件</th>
                        <th class="pb-2">尺寸</th>
                        <th class="pb-2">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>应用栏</td>
                        <td>56dp高</td>
                        <td>手机标准高度</td>
                      </tr>
                      <tr>
                        <td>应用栏图标</td>
                        <td>24 × 24dp</td>
                        <td>可点击区域为48×48dp</td>
                      </tr>
                      <tr>
                        <td>列表项</td>
                        <td>72dp高</td>
                        <td>单行列表项</td>
                      </tr>
                      <tr>
                        <td>底部导航栏</td>
                        <td>56dp高</td>
                        <td>手机标准高度</td>
                      </tr>
                      <tr>
                        <td>浮动操作按钮</td>
                        <td>56 × 56dp</td>
                        <td>标准尺寸</td>
                      </tr>
                      <tr>
                        <td>按钮</td>
                        <td>36dp高</td>
                        <td>标准按钮高度</td>
                      </tr>
                      <tr>
                        <td>对话框</td>
                        <td>280dp宽</td>
                        <td>标准宽度</td>
                      </tr>
                      <tr>
                        <td>卡片</td>
                        <td>8dp圆角</td>
                        <td>标准卡片圆角</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="spec-section">
            <h3 class="section-title">Android 设计准则</h3>

            <div class="spec-card">
              <div class="card-header">
                <h4>Material Design 原则</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">材料隐喻</h5>
                    <p class="mb-4">基于纸张和墨水的理念，但技术更先进。表面和边缘提供视觉提示，熟悉的触感使用户能快速理解可用性。</p>

                    <h5 class="text-lg font-medium mb-2">大胆、图形化、有意图</h5>
                    <p>基础元素中的视觉处理、大尺寸排版、有意的留白创造了大胆、图形化的界面，强调用户行为的重要性。</p>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">有意义的动效</h5>
                    <p class="mb-4">动效强调并体现了用户作为主要移动力量的角色。主要用户行为是转变UI的初始点，而细微的连贯动画则有助于连接体验。</p>

                    <h5 class="text-lg font-medium mb-2">自适应设计</h5>
                    <p>Material Design适用于不同平台和屏幕尺寸。其灵活的网格系统、响应式布局和组件可以优雅地适应各种显示环境。</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>常见UI元素样式</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">字体</h5>
                    <p class="mb-2">系统字体：Roboto</p>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 大标题：24sp, Regular/Medium</li>
                      <li>• 标题：20sp, Medium</li>
                      <li>• 副标题：16sp, Regular/Medium</li>
                      <li>• 正文：14sp, Regular</li>
                      <li>• 说明文字：12sp, Regular</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">颜色</h5>
                    <p class="mb-2">Material调色板</p>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 主要颜色：#6200EE</li>
                      <li>• 次要颜色：#03DAC6</li>
                      <li>• 错误颜色：#B00020</li>
                      <li>• 高强度文本：87%黑</li>
                      <li>• 中强度文本：60%黑</li>
                      <li>• 低强度文本：38%黑</li>
                    </ul>
                  </div>
                  <div>
                    <h5 class="text-lg font-medium mb-2">阴影与高度</h5>
                    <ul class="space-y-1 text-gray-700 text-sm">
                      <li>• 组件阴影表示高度</li>
                      <li>• 高度级别：0-24dp</li>
                      <li>• 对话框：24dp</li>
                      <li>• 导航抽屉：16dp</li>
                      <li>• 应用栏：4dp</li>
                      <li>• 卡片：1-8dp</li>
                      <li>• 浮动按钮：6dp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Apple Human Interface Guidelines 内容 -->
        <div v-if="selectedPlatform === 'apple-hig'" class="design-spec-content">
          <div class="spec-section">
            <h3 class="section-title">Apple Human Interface Guidelines</h3>

            <div class="spec-card mb-6">
              <div class="card-header">
                <h4>设计原则</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div class="design-principle">
                    <h5 class="text-lg font-medium mb-2">设计美学</h5>
                    <div class="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
                        </path>
                      </svg>
                    </div>
                    <p class="text-gray-700">强调美学的完整性、一致性和清晰度。设计应该交流功能，与品牌融合，提供愉悦的体验。</p>
                  </div>

                  <div class="design-principle">
                    <h5 class="text-lg font-medium mb-2">直接操作</h5>
                    <div class="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11">
                        </path>
                      </svg>
                    </div>
                    <p class="text-gray-700">通过触摸和手势直接操作屏幕内容，提供即时响应，为用户提供更直观的体验。</p>
                  </div>

                  <div class="design-principle">
                    <h5 class="text-lg font-medium mb-2">反馈</h5>
                    <div class="h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
                        </path>
                      </svg>
                    </div>
                    <p class="text-gray-700">通过视觉反馈确认用户操作，通过动画和声音增强用户体验，提供持续的状态更新。</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card mb-6">
              <div class="card-header">
                <h4>界面核心要素</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">色彩系统</h5>
                    <div class="mb-4">
                      <div class="flex flex-wrap gap-2 mb-2">
                        <div class="color-swatch" style="background-color: #007AFF;">
                          <span class="color-label">蓝色</span>
                        </div>
                        <div class="color-swatch" style="background-color: #34C759;">
                          <span class="color-label">绿色</span>
                        </div>
                        <div class="color-swatch" style="background-color: #FF3B30;">
                          <span class="color-label">红色</span>
                        </div>
                        <div class="color-swatch" style="background-color: #FF9500;">
                          <span class="color-label">橙色</span>
                        </div>
                        <div class="color-swatch" style="background-color: #AF52DE;">
                          <span class="color-label">紫色</span>
                        </div>
                      </div>
                      <p class="text-gray-700 text-sm">iOS设计系统提供了十种色彩，每种都有亮色和暗色模式变体。使用系统颜色可确保与iOS系统视觉语言保持一致。</p>
                    </div>

                    <h5 class="text-lg font-medium mb-2">排版</h5>
                    <div class="mb-4">
                      <div class="typography-sample mb-1 text-2xl font-medium">标题文本</div>
                      <div class="typography-sample mb-1 text-lg">副标题文本</div>
                      <div class="typography-sample mb-1">正文文本</div>
                      <div class="typography-sample text-sm text-gray-500">说明文本</div>
                      <p class="text-gray-700 text-sm mt-2">San Francisco 字体家族是为 Apple 平台设计的系统字体，具有优异的可读性和清晰度。</p>
                    </div>
                  </div>

                  <div>
                    <h5 class="text-lg font-medium mb-2">布局与空间</h5>
                    <div class="mb-4">
                      <div class="layout-example bg-gray-100 rounded-lg p-4 mb-2 h-40 flex flex-col">
                        <div class="layout-header bg-gray-300 rounded h-8 mb-2"></div>
                        <div class="layout-content flex-1 flex gap-2">
                          <div class="layout-sidebar bg-gray-200 rounded w-1/3"></div>
                          <div class="layout-main bg-gray-300 rounded flex-1 flex flex-col p-1">
                            <div class="bg-gray-400 rounded h-1/3 mb-1"></div>
                            <div class="bg-gray-400 rounded h-1/3 mb-1"></div>
                            <div class="bg-gray-400 rounded h-1/3"></div>
                          </div>
                        </div>
                      </div>
                      <p class="text-gray-700 text-sm">HIG鼓励使用一致的边距、对齐和网格系统，以创建视觉上平衡和易于理解的界面。</p>
                    </div>

                    <h5 class="text-lg font-medium mb-2">深色模式</h5>
                    <div class="flex space-x-2 mb-2">
                      <div class="w-1/2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
                        <div class="h-4 w-3/4 bg-gray-800 mb-2 rounded"></div>
                        <div class="h-3 w-full bg-gray-300 mb-1 rounded"></div>
                        <div class="h-3 w-full bg-gray-300 mb-1 rounded"></div>
                        <div class="h-3 w-1/2 bg-gray-300 rounded"></div>
                      </div>
                      <div class="w-1/2 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-sm">
                        <div class="h-4 w-3/4 bg-gray-100 mb-2 rounded"></div>
                        <div class="h-3 w-full bg-gray-700 mb-1 rounded"></div>
                        <div class="h-3 w-full bg-gray-700 mb-1 rounded"></div>
                        <div class="h-3 w-1/2 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">深色模式不仅节省电量，还减少明亮环境中的眼睛疲劳，所有iOS应用都应支持亮色和暗色模式。</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="spec-card">
              <div class="card-header">
                <h4>交互模式</h4>
              </div>
              <div class="card-content">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h5 class="text-lg font-medium mb-2">导航模式</h5>
                    <div class="nav-example bg-gray-100 rounded-lg p-3 mb-3 h-40 flex flex-col">
                      <div class="nav-header bg-gray-200 rounded h-6 mb-2 flex justify-between items-center px-2">
                        <div class="h-2 w-5 bg-gray-400 rounded"></div>
                        <div class="h-2 w-16 bg-gray-400 rounded"></div>
                        <div class="h-2 w-5 bg-gray-400 rounded"></div>
                      </div>
                      <div class="nav-content flex-1 bg-white rounded mb-2"></div>
                      <div class="nav-tabs h-8 bg-gray-200 rounded flex justify-around items-center px-2">
                        <div class="h-4 w-4 bg-gray-400 rounded-full"></div>
                        <div class="h-4 w-4 bg-gray-400 rounded-full"></div>
                        <div class="h-4 w-4 bg-gray-400 rounded-full"></div>
                        <div class="h-4 w-4 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">iOS支持平面导航、层次导航和内容驱动导航，选择适合您应用内容结构的模式。</p>
                  </div>

                  <div>
                    <h5 class="text-lg font-medium mb-2">手势</h5>
                    <div class="gesture-example bg-gray-100 rounded-lg p-3 mb-3 h-40 flex justify-center items-center">
                      <div class="gestures flex flex-col items-center">
                        <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11">
                          </path>
                        </svg>
                        <div class="gesture-arrows flex space-x-3 mt-1">
                          <div class="arrow left"></div>
                          <div class="arrow right"></div>
                        </div>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">使用系统标准手势如轻点、滑动、捏合来保持交互一致性，需要时才创建自定义手势。</p>
                  </div>

                  <div>
                    <h5 class="text-lg font-medium mb-2">动效</h5>
                    <div
                      class="animation-example bg-gray-100 rounded-lg p-3 mb-3 h-40 flex justify-center items-center">
                      <div class="animation-diagram relative">
                        <div class="w-16 h-16 rounded-lg bg-gray-300 opacity-30 absolute"></div>
                        <div class="w-16 h-16 rounded-lg bg-gray-300 opacity-60 absolute"
                          style="transform: translate(8px, 8px);"></div>
                        <div class="w-16 h-16 rounded-lg bg-gray-300 absolute"
                          style="transform: translate(16px, 16px);"></div>
                        <svg class="w-8 h-8 text-gray-500 absolute" style="transform: translate(20px, 20px);"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                    </div>
                    <p class="text-gray-700 text-sm">动效应该目的明确，提供上下文并帮助用户理解。iOS使用基于物理的动画系统模拟真实世界。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center flex-wrap">
              <p class="text-sm text-gray-500 mb-2">资料来源：<a
                  href="https://developer.apple.com/design/human-interface-guidelines/" target="_blank"
                  class="text-blue-500 hover:underline">Apple Human Interface Guidelines</a></p>
              <a href="https://developer.apple.com/design/human-interface-guidelines/" target="_blank"
                class="inline-flex items-center text-blue-600 font-medium hover:underline">
                查看完整指南
                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- 在Android设计规范末尾添加平台比较部分 -->
        <div class="spec-section" v-if="selectedPlatform === 'ios' || selectedPlatform === 'android'">
          <h3 class="section-title">平台设计比较</h3>

          <div class="spec-card">
            <div class="card-header">
              <h4>iOS 与 Android 设计差异</h4>
            </div>
            <div class="card-content">
              <div class="platform-comparison">
                <div class="comparison-table">
                  <table class="w-full">
                    <thead>
                      <tr class="bg-gray-50">
                        <th class="py-3 px-4 text-left">特性</th>
                        <th class="py-3 px-4 text-center">iOS (Apple)</th>
                        <th class="py-3 px-4 text-center">Android (Google)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">设计语言</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">人机界面指南 (HIG)</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">Material Design</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">设计单位</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">点 (pt)</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">密度无关像素 (dp)</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">标准字体</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">San Francisco (SF Pro)</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">Roboto</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">导航模式</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">标签栏底部、侧边栏</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">底部导航栏、抽屉导航</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">标准点击区域</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">44×44pt</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">48×48dp</td>
                      </tr>
                      <tr>
                        <td class="py-3 px-4 border-t border-gray-100">设计特点</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">扁平、简洁、轻量化</td>
                        <td class="py-3 px-4 border-t border-gray-100 text-center">材质感、层次感、动效</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="comparison-note mt-6 bg-gray-50 p-4 rounded-lg">
                  <h5 class="text-lg font-medium mb-2">跨平台设计建议</h5>
                  <p class="text-gray-700 mb-4">在进行跨平台设计时，应注意iOS和Android的设计差异，特别是在以下几个方面：</p>
                  <ul class="space-y-2">
                    <li class="flex items-start">
                      <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                      <span>导航模式的差异：iOS通常使用标签栏，Android则使用抽屉式导航和底部导航</span>
                    </li>
                    <li class="flex items-start">
                      <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                      <span>交互模式：iOS注重手势，Android强调按钮和明确的视觉提示</span>
                    </li>
                    <li class="flex items-start">
                      <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                      <span>视觉风格：iOS趋向于轻量和扁平，Android则强调立体和层次</span>
                    </li>
                    <li class="flex items-start">
                      <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                      <span>尊重平台特性：以平台原生体验为基础，避免简单的跨平台复制</span>
                    </li>
                  </ul>
                </div>

                <div class="platform-visuals mt-6">
                  <h5 class="text-lg font-medium mb-3">视觉比较</h5>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="platform-visual-card p-4 border border-blue-100 rounded-lg bg-blue-50">
                      <h6 class="font-medium text-blue-800 mb-2">iOS 设计特点</h6>
                      <ul class="space-y-1 text-sm">
                        <li>• 强调简洁与轻量感</li>
                        <li>• 使用毛玻璃效果</li>
                        <li>• 丰富的手势操作</li>
                        <li>• 顶部返回按钮</li>
                        <li>• 底部标签栏导航</li>
                        <li>• 强调字体层次感</li>
                        <li>• 轻微的阴影效果</li>
                      </ul>
                    </div>
                    <div class="platform-visual-card p-4 border border-green-100 rounded-lg bg-green-50">
                      <h6 class="font-medium text-green-800 mb-2">Android 设计特点</h6>
                      <ul class="space-y-1 text-sm">
                        <li>• 强调材质与层次</li>
                        <li>• 使用卡片式UI元素</li>
                        <li>• 重视动效和状态转换</li>
                        <li>• 顶部应用栏和抽屉导航</li>
                        <li>• 悬浮操作按钮（FAB）</li>
                        <li>• 更丰富的色彩应用</li>
                        <li>• 明显的阴影效果</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部信息和数据来源 -->
        <div class="mt-10 border-t border-gray-200 pt-6">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <p class="text-sm text-gray-500 mb-2 md:mb-0">数据来源：互联网公开资料整理，仅供参考。如有侵权，请联系我们删除。</p>
            <div class="flex space-x-4">
              <a href="https://developer.apple.com/design/human-interface-guidelines/" target="_blank"
                class="external-link">
                iOS官方指南
              </a>
              <a href="https://material.io/design" target="_blank" class="external-link">
                Android官方指南
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 平台选择状态
const selectedPlatform = ref('ios')

// 设备尺寸选择
const selectedDeviceSize = ref('iphone14pro')

// iOS设备尺寸数据
const iosDevices = ref([
  {
    id: 'iphone14pro',
    name: 'iPhone 14 Pro',
    width: 390,
    height: 844,
    statusBar: 47,
    navBar: 44,
    tabBar: 50,
    homeIndicator: 34,
    margin: 16,
    iconSize: 24
  },
  {
    id: 'iphone14',
    name: 'iPhone 14/13',
    width: 390,
    height: 844,
    statusBar: 47,
    navBar: 44,
    tabBar: 49,
    homeIndicator: 34,
    margin: 16,
    iconSize: 24
  },
  {
    id: 'iphone14promax',
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    statusBar: 47,
    navBar: 44,
    tabBar: 50,
    homeIndicator: 34,
    margin: 16,
    iconSize: 24
  },
  {
    id: 'iphonese',
    name: 'iPhone SE',
    width: 375,
    height: 667,
    statusBar: 20,
    navBar: 44,
    tabBar: 49,
    homeIndicator: 0,
    margin: 16,
    iconSize: 24
  },
  {
    id: 'iphone8',
    name: 'iPhone 8',
    width: 375,
    height: 667,
    statusBar: 20,
    navBar: 44,
    tabBar: 49,
    homeIndicator: 0,
    margin: 16,
    iconSize: 24
  }
])

// 获取当前选择的设备数据
const currentDevice = computed(() => {
  return iosDevices.value.find(d => d.id === selectedDeviceSize.value) || iosDevices.value[0]
})

// Android设备尺寸数据
const androidDevices = ref([
  {
    id: 'pixel6',
    name: 'Pixel 6',
    width: 393,
    height: 830,
    statusBar: 24,
    appBar: 56,
    navBar: 56,
    margin: 16
  },
  {
    id: 'pixel7',
    name: 'Pixel 7',
    width: 412,
    height: 915,
    statusBar: 24,
    appBar: 56,
    navBar: 56,
    margin: 16
  },
  {
    id: 'samsungs22',
    name: 'Samsung S22',
    width: 360,
    height: 780,
    statusBar: 24,
    appBar: 56,
    navBar: 56,
    margin: 16
  }
])

// 获取当前选择的Android设备数据
const currentAndroidDevice = computed(() => {
  return androidDevices.value.find(d => d.id === selectedDeviceSize.value) || androidDevices.value[0]
})

// 计算设备实际缩放比例，使其符合真实尺寸比例
const deviceDimensions = computed(() => {
  const isIOS = selectedPlatform.value === 'ios';
  const device = isIOS ? currentDevice.value : currentAndroidDevice.value;

  // 基准宽度（在展示容器中的最大宽度）
  const baseWidth = 240;
  // 计算高度，保持真实宽高比
  const height = (baseWidth / device.width) * device.height;

  return {
    width: baseWidth,
    height: height
  };
});

// 设置设备外框样式
const deviceStyle = computed(() => {
  return {
    width: `${deviceDimensions.value.width}px`,
    height: `${deviceDimensions.value.height}px`
  };
});

// 重置设备选择当平台切换时
watch(selectedPlatform, () => {
  if (selectedPlatform.value === 'ios') {
    selectedDeviceSize.value = 'iphone14pro';
  } else if (selectedPlatform.value === 'android') {
    selectedDeviceSize.value = 'pixel6';
  }
})
</script>

<style scoped>
/* 基础容器样式 */
.design-spec-content {
  margin-bottom: 2rem;
}

/* 平台选择按钮 */
.platform-btn {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s;
}

.platform-btn:hover {
  background-color: #e5e7eb;
}

.active-platform {
  background-color: #6C54FF;
  color: white;
}

/* 部分标题 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #6C54FF;
  display: inline-block;
}

/* 规范卡片 */
.spec-card {
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: #f9fafb;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
}

table th {
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 1rem 0.75rem 0;
}

table td {
  padding: 0.75rem 1rem 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
}

table tr:last-child td {
  border-bottom: none;
}

/* 外部链接 */
.external-link {
  color: #6C54FF;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}

.external-link:hover {
  color: #5842cc;
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-content {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  table th,
  table td {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
}

/* 新增 - iPhone和Android线框图样式 */
.iphone-outline {
  width: 240px;
  height: 480px;
  border: 2px solid #777;
  border-radius: 32px;
  position: relative;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.iphone-statusbar {
  height: 47px;
  background-color: #f4f4f4;
  position: relative;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.notch {
  width: 60px;
  height: 20px;
  background-color: #777;
  border-radius: 0 0 12px 12px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.status-icons {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.icon {
  width: 16px;
  height: 16px;
  background-color: #aaa;
  border-radius: 4px;
}

.iphone-navbar {
  height: 44px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-btn {
  width: 22px;
  height: 22px;
  border-left: 2px solid #777;
  border-bottom: 2px solid #777;
  transform: rotate(45deg);
}

.title {
  font-weight: 500;
  color: #333;
}

.actions {
  width: 22px;
  height: 22px;
}

.iphone-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-block {
  height: 48px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.content-text {
  margin-top: 8px;
}

.text-line {
  height: 10px;
  background-color: #e0e0e0;
  margin-bottom: 8px;
  border-radius: 4px;
}

.iphone-tabbar {
  height: 50px;
  background-color: #f4f4f4;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  background-color: #aaa;
  border-radius: 6px;
}

.tab-label {
  width: 24px;
  height: 6px;
  background-color: #aaa;
  border-radius: 3px;
}

.dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dimension {
  position: absolute;
  color: #6C54FF;
  font-size: 12px;
  font-weight: 500;
}

.dim-line {
  background-color: #6C54FF;
  height: 2px;
  width: 30px;
  position: relative;
}

.dim-line:before,
.dim-line:after {
  content: "";
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #6C54FF;
}

.dim-line:before {
  left: -3px;
}

.dim-line:after {
  right: -3px;
}

.dim-text {
  margin-left: 8px;
  background-color: rgba(108, 84, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  color: #6C54FF;
}

.dim-width {
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.dim-height {
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
}

.dim-height .dim-line {
  width: 30px;
  transform: rotate(90deg);
  margin-right: 10px;
}

.dim-status {
  left: -40px;
  top: 24px;
}

.dim-navbar {
  left: -40px;
  top: 70px;
}

.dim-tabbar {
  left: -40px;
  bottom: 24px;
}

/* iOS 尺寸项目 */
.ios-size-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.ios-size-item:hover {
  background-color: #f0f4ff;
}

.size-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #e2e6ff;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.status-icon:after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  height: 4px;
  background-color: #6C54FF;
  border-radius: 2px;
}

.navbar-icon:after {
  content: "";
  position: absolute;
  top: 14px;
  left: 10px;
  right: 10px;
  height: 12px;
  background-color: #6C54FF;
  border-radius: 3px;
}

.margin-icon:after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 10px;
  width: 4px;
  background-color: #6C54FF;
  border-radius: 2px;
}

.tabbar-icon:after {
  content: "";
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  height: 12px;
  background-color: #6C54FF;
  border-radius: 3px;
}

.size-info {
  display: flex;
  flex-direction: column;
}

.size-value {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.size-name {
  font-size: 12px;
  color: #666;
}

/* 组件尺寸卡片 */
.component-size-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.component-size-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.component-preview {
  height: 100px;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  position: relative;
}

.nav-button-preview {
  background-color: #f0f4ff;
}

.nav-btn-back {
  width: 44px;
  height: 44px;
  background-color: rgba(108, 84, 255, 0.1);
  border-radius: 22px;
  position: relative;
}

.nav-btn-back:after {
  content: "";
  width: 12px;
  height: 12px;
  border-left: 2px solid #6C54FF;
  border-bottom: 2px solid #6C54FF;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-25%, -50%) rotate(45deg);
}

.tab-icon-preview {
  background-color: #f0f4ff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-icon-sample {
  width: 24px;
  height: 24px;
  background-color: #6C54FF;
  border-radius: 6px;
  margin-bottom: 4px;
}

.tab-label-sample {
  width: 24px;
  height: 4px;
  background-color: #6C54FF;
  border-radius: 2px;
}

.list-preview {
  background-color: #f0f4ff;
  height: 44px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.list-icon {
  width: 24px;
  height: 24px;
  background-color: #6C54FF;
  border-radius: 6px;
  margin-right: 12px;
}

.list-content {
  flex: 1;
}

.list-title {
  height: 8px;
  width: 70%;
  background-color: #6C54FF;
  border-radius: 4px;
  margin-bottom: 6px;
}

.list-subtitle {
  height: 6px;
  width: 40%;
  background-color: rgba(108, 84, 255, 0.4);
  border-radius: 3px;
}

.button-preview {
  background-color: #f0f4ff;
}

.button-sample {
  width: 160px;
  height: 44px;
  background-color: #6C54FF;
  border-radius: 10px;
}

.component-details {
  padding: 12px;
}

.component-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.component-size {
  font-size: 14px;
  color: #6C54FF;
  font-weight: 500;
  margin-bottom: 2px;
}

.component-note {
  font-size: 12px;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {

  .iphone-outline,
  .android-outline {
    width: 180px;
    height: 360px;
  }

  .card-content {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  table th,
  table td {
    padding: 0.5rem 0.5rem 0.5rem 0;
  }
}

/* 优化的iOS线框图样式 */
.ios-diagram-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1rem;
}

/* 尺寸线条和标注 */
.dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dimension-line {
  position: absolute;
  color: #6C54FF;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

/* Android 设计规范线框图 */
.android-outline {
  width: 240px;
  height: 480px;
  border: 2px solid #8bc34a;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.android-statusbar {
  height: 24px;
  background-color: #8bc34a;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 12px;
}

.android-appbar {
  height: 56px;
  background-color: #8bc34a;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
}

.menu-btn {
  width: 18px;
  height: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-btn:before,
.menu-btn:after {
  content: "";
  display: block;
  width: 18px;
  height: 2px;
  background-color: white;
}

.menu-btn span {
  width: 18px;
  height: 2px;
  background-color: white;
}

.actions {
  display: flex;
  gap: 16px;
  margin-left: auto;
}

.action-icon {
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.android-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.material-card {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.card-header {
  height: 24px;
  background-color: #f5f5f5;
}

.fab {
  width: 56px;
  height: 56px;
  background-color: #f44336;
  border-radius: 50%;
  position: absolute;
  bottom: 16px;
  right: 16px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.android-navbar {
  height: 56px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e0e0e0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  background-color: #9e9e9e;
  border-radius: 50%;
}

.nav-label {
  width: 32px;
  height: 8px;
  background-color: #9e9e9e;
  border-radius: 4px;
}

/* Apple HIG 专有样式 */
.color-swatch {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.color-label {
  font-size: 10px;
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
  width: 100%;
  text-align: center;
  padding: 2px 0;
}

.typography-sample {
  line-height: 1.4;
}

.arrow {
  width: 20px;
  height: 2px;
  background-color: #aaa;
  position: relative;
}

.arrow:before,
.arrow:after {
  content: "";
  width: 8px;
  height: 2px;
  background-color: #aaa;
  position: absolute;
}

.arrow.left:before {
  transform: rotate(45deg);
  left: 0;
  top: -3px;
}

.arrow.left:after {
  transform: rotate(-45deg);
  left: 0;
  top: 3px;
}

.arrow.right:before {
  transform: rotate(-45deg);
  right: 0;
  top: -3px;
}

.arrow.right:after {
  transform: rotate(45deg);
  right: 0;
  top: 3px;
}

/* 设备选择器样式 */
.device-selector-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.device-selector-btn:hover {
  background-color: #e5e7eb;
}

.active-device {
  background-color: #6C54FF;
  color: white;
}

/* 设备规格表样式 */
.device-spec-table {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.device-spec-row {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.device-spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  font-weight: 500;
  color: #374151;
  width: 40%;
  border-right: 1px solid #e5e7eb;
}

.spec-value {
  padding: 0.75rem 1rem;
  color: #4b5563;
  width: 60%;
}

/* 优化圆角显示 */
.device-spec-table .device-spec-row:first-child .spec-label {
  border-top-left-radius: 0.5rem;
}

.device-spec-table .device-spec-row:first-child .spec-value {
  border-top-right-radius: 0.5rem;
}

.device-spec-table .device-spec-row:last-child .spec-label {
  border-bottom-left-radius: 0.5rem;
}

.device-spec-table .device-spec-row:last-child .spec-value {
  border-bottom-right-radius: 0.5rem;
}

/* Android设计规范样式 */
.android-diagram-container {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.android-outline {
  width: 240px;
  height: 480px;
  border: 2px solid #8bc34a;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.android-statusbar {
  height: 24px;
  background-color: #8bc34a;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 12px;
}

.android-appbar {
  height: 56px;
  background-color: #8bc34a;
  display: flex;
  align-items: center;
  padding: 0 16px;
  color: white;
}

.menu-btn {
  width: 18px;
  height: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-btn:before,
.menu-btn:after {
  content: "";
  display: block;
  width: 18px;
  height: 2px;
  background-color: white;
}

.menu-btn span {
  width: 18px;
  height: 2px;
  background-color: white;
}

.actions {
  display: flex;
  gap: 16px;
  margin-left: auto;
}

.action-icon {
  width: 24px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.android-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.material-card {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.card-header {
  height: 24px;
  background-color: #f5f5f5;
}

.fab {
  width: 56px;
  height: 56px;
  background-color: #f44336;
  border-radius: 50%;
  position: absolute;
  bottom: 16px;
  right: 16px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.2);
}

.android-navbar {
  height: 56px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #e0e0e0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  background-color: #9e9e9e;
  border-radius: 50%;
}

.nav-label {
  font-size: 10px;
  color: #666;
}

/* 标注尺寸样式 */
.dim-appbar {
  right: -90px;
  top: 52px;
}

.dim-appbar .dimension-line {
  position: absolute;
  right: 55px;
  width: 35px;
}

.dim-appbar .dimension-label {
  right: -45px;
  top: 0;
}

/* 设备预览缩放提示信息 */
.device-scale-info {
  font-style: italic;
  opacity: 0.8;
}

/* 平台比较表格样式 */
.comparison-table {
  overflow-x: auto;
}

.comparison-table table {
  border-collapse: collapse;
  width: 100%;
}

.comparison-table th {
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-table td {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

.comparison-table tr:last-child td {
  border-bottom: 1px solid #e5e7eb;
}

.comparison-table tr:hover {
  background-color: #f9fafb;
}

/* iOS状态栏样式优化 */
.iphone-statusbar {
  height: 47px;
  background-color: #ffdddd;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.status-time {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-left: 16px;
  z-index: 10;
}

.status-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
}

.status-icons {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-right: 16px;
  z-index: 10;
}

/* 导航栏样式优化 */
.iphone-navbar {
  height: 44px;
  background-color: #ffdddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.back-btn {
  color: #333;
  display: flex;
  align-items: center;
}

.title {
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.actions {
  color: #333;
  display: flex;
  align-items: center;
}

/* 内容区域样式优化 */
.iphone-content {
  flex: 1;
  background-color: #e6f2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

/* 标签栏样式优化 */
.iphone-tabbar {
  height: 50px;
  background-color: #ffdddd;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  color: #666;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab-label {
  font-size: 10px;
  color: #666;
}

.active-tab {
  color: #6C54FF;
}

.active-tab .tab-icon {
  color: #6C54FF;
}

.active-tab .tab-label {
  color: #6C54FF;
  font-weight: 500;
}

/* 关键尺寸虚线图解样式 */
.dimensions-diagram {
  border: 1px dashed #e5e7eb;
}

.dimensions-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-outline-schema {
  margin-bottom: 1rem;
}

/* 扩展设备框架样式 */
.device-framework-info {
  display: flex;
  gap: 24px;
}

.framework-ios,
.framework-android {
  flex: 1;
  border-radius: 8px;
  padding: 16px;
}

.framework-ios {
  background-color: #f0f7ff;
  border: 1px solid #e1effe;
}

.framework-android {
  background-color: #f0fdf4;
  border: 1px solid #dcfce7;
}

.framework-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 12px;
  color: #374151;
  text-align: center;
}

.framework-logo {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

.framework-desc {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
}

/* 优化尺寸标注样式，使其更接近官方风格 */
.dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dimension-tag {
  position: absolute;
  display: flex;
  align-items: center;
}

.dimension-line {
  width: 30px;
  height: 4px;
}

.dimension-line.vertical {
  width: 4px;
  height: 30px;
}

.dimension-tag span {
  background-color: #ff4d6d;
  color: white;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* 标注位置调整 */
.dim-width {
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
}

.dim-height {
  right: -45px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.dim-status {
  right: -60px;
  top: 23px;
}

.dim-navbar {
  right: -60px;
  top: 70px;
}

.dim-margin {
  left: -50px;
  top: 50%;
  transform: translateY(-50%);
}

.dim-tabbar {
  right: -60px;
  bottom: 54px;
}

.dim-icon {
  left: -50px;
  bottom: 70px;
}

.dim-indicator {
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
}

/* 针对边距和图标的标注使用不同颜色 */
.dim-margin span,
.dim-icon span,
.dim-indicator span {
  background-color: #00A3FF;
}

/* 移除阴影效果，采用更贴近苹果设计风格的样式 */
.ios-diagram-container {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 1rem;
}

/* iPhone外框样式 */
.iphone-outline {
  background-color: #f9f9f9;
  border-radius: 36px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e0e0e0;
  background-color: #fff;
}

/* 状态栏样式 */
.iphone-statusbar {
  height: 47px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  position: relative;
  color: #000;
}

.status-time {
  font-weight: 600;
  font-size: 0.8rem;
}

.status-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.status-icons {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #000;
}

/* 导航栏样式 */
.iphone-navbar {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  color: #000;
}

.iphone-navbar .title {
  font-weight: 600;
  font-size: 0.9rem;
}

.back-btn,
.actions {
  display: flex;
  align-items: center;
  color: #007AFF;
}

/* 内容区域样式 - 优化为iOS规范 */
.iphone-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
  background-color: #F2F2F7;
}

/* iOS搜索栏 */
.ios-searchbar {
  margin: 0 16px 12px;
  height: 36px;
  background-color: #E9E9EB;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.search-icon {
  margin-right: 5px;
}

.search-text {
  color: #8E8E93;
  font-size: 0.8rem;
}

/* iOS分组列表 */
.ios-list-group {
  margin-bottom: 16px;
}

.list-header {
  font-size: 0.7rem;
  color: #8E8E93;
  text-transform: uppercase;
  padding: 0 16px;
  margin-bottom: 5px;
  font-weight: 500;
}

.ios-list {
  background-color: #ffffff;
}

.ios-list-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #E0E0E3;
}

.ios-list-item:last-child {
  border-bottom: none;
}

.list-item-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.list-item-icon.blue {
  background-color: #E9F4FF;
}

.list-item-icon.green {
  background-color: #E6F7ED;
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  font-size: 0.85rem;
  color: #000;
  margin-bottom: 2px;
}

.list-item-subtitle {
  font-size: 0.7rem;
  color: #8E8E93;
}

.list-item-accessory {
  color: #C7C7CC;
}

/* iOS卡片 */
.ios-card {
  margin: 0 16px;
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  height: 150px;
}

.card-title {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 12px 16px;
  border-bottom: 1px solid #E0E0E3;
}

.card-content {
  padding: 16px;
}

.card-image {
  height: 60px;
  background-color: #E9E9EB;
  border-radius: 6px;
  margin-bottom: 10px;
}

.card-text {
  font-size: 0.8rem;
  color: #3A3A3C;
}

/* 标签栏样式 */
.iphone-tabbar {
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #F9F9F9;
  border-top: 1px solid #E0E0E0;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  color: #8E8E93;
  padding: 6px 0;
}

.tab-icon {
  margin-bottom: 2px;
}

.tab-label {
  font-size: 0.65rem;
}

.active-tab {
  color: #007AFF;
}

/* Home指示器 */
.home-indicator {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F9F9F9;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background-color: #000;
  border-radius: 2.5px;
}

/* 优化尺寸标注样式，保持简洁风格 */
.dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dimension-tag {
  position: absolute;
  display: flex;
  align-items: center;
}

.dimension-line {
  width: 30px;
  height: 4px;
}

.dimension-line.vertical {
  width: 4px;
  height: 30px;
}

.dimension-tag span {
  background-color: #ff4d6d;
  color: white;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
}

/* 标注位置调整 */
.dim-width {
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
}

.dim-height {
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.dim-status {
  right: -45px;
  top: 23px;
}

.dim-navbar {
  right: -45px;
  top: 70px;
}

.dim-margin {
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
}

.dim-tabbar {
  right: -45px;
  bottom: 54px;
}

.dim-icon {
  left: -40px;
  bottom: 70px;
}

.dim-indicator {
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  flex-direction: column;
}

/* 针对边距和图标的标注使用不同颜色 */
.dim-margin span,
.dim-icon span,
.dim-indicator span {
  background-color: #00A3FF;
}

/* 规范表格样式优化，符合苹果风格 */
.device-spec-table {
  border: 1px solid #E0E0E3;
  border-radius: 8px;
  overflow: hidden;
}

.device-spec-row {
  display: flex;
  border-bottom: 1px solid #E0E0E3;
  font-size: 0.9rem;
}

.device-spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  width: 40%;
  padding: 10px 16px;
  background-color: #F9F9F9;
  color: #3A3A3C;
  font-weight: 500;
}

.spec-value {
  width: 60%;
  padding: 10px 16px;
  color: #000;
}

/* 内容区域样式 - 简化为空白区域，仅显示左右页边距 */
.iphone-content {
  flex: 1;
  background-color: #ffffff;
  position: relative;
}

.content-margin-guides {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.left-margin-guide,
.right-margin-guide {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  border-left: 1px dashed #00A3FF;
  opacity: 0.7;
}

.left-margin-guide {
  left: 16px;
}

.right-margin-guide {
  right: 16px;
}

.margin-label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 163, 255, 0.1);
  color: #00A3FF;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

.left-margin-guide .margin-label {
  left: -25px;
}

.right-margin-guide .margin-label {
  right: -25px;
}

/* 简洁的尺寸标记 */
.measurement-labels {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.measurement-labels>div {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 77, 109, 0.1);
  color: #FF4D6D;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 2px;
  text-align: center;
}

.status-bar-height {
  top: 23px;
}

.nav-bar-height {
  top: 75px;
}

.tab-bar-height {
  bottom: 25px;
}

.home-indicator-height {
  bottom: 8px;
}

.content-area-height {
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 重新设计的手机规范图样式 */
.phone-spec-container {
  position: relative;
  width: 100%;
  height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.iphone-wireframe {
  width: 280px;
  border-radius: 40px;
  overflow: hidden;
  position: relative;
  border: 3px solid #000;
  background-color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* 状态栏样式 */
.iphone-statusbar {
  height: 47px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 77, 109, 0.15);
  position: relative;
  color: #000;
}

.status-time {
  font-weight: 600;
  font-size: 0.8rem;
}

.status-icons {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #000;
}

/* 导航栏样式 */
.iphone-navbar {
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 77, 109, 0.15);
  color: #000;
}

.iphone-navbar .title {
  font-weight: 600;
  font-size: 0.9rem;
}

/* 内容区域样式 */
.iphone-content {
  flex: 1;
  background-color: rgba(0, 123, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #555;
}

.content-text {
  font-size: 18px;
  color: #666;
}

/* 标签栏样式 */
.iphone-tabbar {
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(255, 77, 109, 0.15);
  padding: 0 8px;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  color: #8E8E93;
}

.tab-icon {
  margin-bottom: 2px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-label {
  font-size: 10px;
}

.active-tab {
  color: #007AFF;
}

/* Home指示器 */
.home-indicator {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background-color: #000;
  border-radius: 2.5px;
}

/* 标注样式 */
.dimension-value {
  background-color: #FF4D6D;
  color: white;
  font-weight: bold;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  text-align: center;
}

.dimension-text {
  position: absolute;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.dimension-arrow {
  position: relative;
}

.dimension-arrow.horizontal {
  width: 60px;
  height: 1px;
}

.dimension-arrow.vertical {
  width: 1px;
  height: 100px;
}

.arrow-line {
  position: absolute;
  background-color: #FF4D6D;
}

.arrow-line.left,
.arrow-line.right {
  height: 1px;
  top: 0;
}

.arrow-line.top,
.arrow-line.bottom {
  width: 1px;
  left: 0;
}

/* 宽度标注 */
.width-label {
  position: absolute;
  top: -40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.width-label .dimension-arrow {
  width: 280px;
}

.width-label .arrow-line.left {
  left: 0;
  width: 50%;
  height: 2px;
}

.width-label .arrow-line.right {
  right: 0;
  width: 50%;
  height: 2px;
}

/* 高度标注 */
.height-label {
  position: absolute;
  left: -40px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.height-label .dimension-arrow {
  height: 520px;
}

.height-label .arrow-line.top {
  top: 0;
  height: 50%;
  width: 2px;
}

.height-label .arrow-line.bottom {
  bottom: 0;
  height: 50%;
  width: 2px;
}

.height-label .dimension-value {
  transform: rotate(-90deg);
  margin-left: -10px;
}

/* 页边距标注 */
.margin-label {
  position: absolute;
  left: -80px;
  top: 50%;
  display: flex;
  align-items: center;
  gap: 6px;
}

.margin-label .dimension-text {
  left: -60px;
  top: 0;
}

/* 图标尺寸标注 */
.icon-size-label {
  position: absolute;
  left: -80px;
  bottom: 150px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-size-label .dimension-text {
  left: -60px;
  top: 0;
}

/* 状态栏标注 */
.statusbar-label {
  position: absolute;
  right: -80px;
  top: 23px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.statusbar-label .dimension-text {
  right: -30px;
  top: -20px;
}

.status-arrow .status-line {
  width: 60px;
  height: 2px;
}

/* 导航栏标注 */
.navbar-label {
  position: absolute;
  right: -80px;
  top: 75px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.navbar-label .dimension-text {
  right: -30px;
  top: -20px;
}

.nav-arrow .nav-line {
  width: 60px;
  height: 2px;
}

/* 标签栏标注 */
.tabbar-label {
  position: absolute;
  right: -80px;
  bottom: 60px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tabbar-label .dimension-text {
  right: -30px;
  top: -20px;
}

.tab-arrow .tab-line {
  width: 60px;
  height: 2px;
}

/* 指示器标注 */
.indicator-label {
  position: absolute;
  left: -80px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.indicator-label .dimension-text {
  left: -80px;
  top: 0;
}

.indicator-arrow .indicator-line {
  width: 60px;
  height: 2px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2px;
}

.tab-icon svg {
  width: 24px;
  height: 24px;
}

.tab-label {
  font-size: 10px;
  text-align: center;
  white-space: nowrap;
}

/* 标注文本说明 */
.dimension-text {
  font-weight: 500;
  font-size: 11px;
  margin-bottom: 2px;
  color: #222;
}

.dimension-value {
  background-color: #ff4d6d;
  color: white;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
}

.dimension-desc {
  font-size: 9px;
  margin-top: 2px;
  color: #666;
  max-width: 100px;
  text-align: center;
}

/* 调整图标尺寸标注位置 */
.icon-size-label {
  position: absolute;
  left: -80px;
  bottom: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-arrow {
  width: 40px;
  height: 1px;
  background-color: #00A3FF;
  margin: 4px 0;
}

/* 确保所有标注箭头指向正确的元素 */
.statusbar-label {
  position: absolute;
  right: -100px;
  top: 23px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.navbar-label {
  position: absolute;
  right: -100px;
  top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tabbar-label {
  position: absolute;
  right: -100px;
  bottom: 54px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.indicator-label {
  position: absolute;
  bottom: 17px;
  right: -100px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* iPhone SVG线框图样式调整 */
.phone-spec-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.iphone-wireframe {
  width: 240px;
  height: 480px;
  border: 2px solid #333;
  border-radius: 36px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
  position: relative;
}

/* 状态栏样式优化，符合iOS标准 */
.iphone-statusbar {
  height: 47px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

.status-time {
  font-weight: 600;
  font-size: 14px;
  color: #000;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #000;
}

.signal-icon,
.wifi-icon,
.battery-icon {
  display: flex;
  align-items: center;
}

/* 导航栏样式 */
.iphone-navbar {
  height: 44px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
}

.title {
  font-weight: 600;
  font-size: 17px;
  color: #000;
}

/* 内容区域样式 */
.iphone-content {
  flex: 1;
  background-color: rgba(0, 163, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-text {
  font-weight: 500;
  font-size: 16px;
  color: #007AFF;
}

/* 标签栏样式 */
.iphone-tabbar {
  height: 50px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

/* 标注位置校正 */
.width-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.height-label {
  position: absolute;
  right: -70px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.margin-label-left {
  position: absolute;
  left: -70px;
  top: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.margin-label-right {
  position: absolute;
  right: -70px;
  top: 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.statusbar-label {
  position: absolute;
  left: -70px;
  top: 23px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.navbar-label {
  position: absolute;
  left: -70px;
  top: 70px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.tabbar-label {
  position: absolute;
  left: -70px;
  bottom: 75px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.icon-size-label {
  position: absolute;
  right: -90px;
  bottom: 75px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.indicator-label {
  position: absolute;
  bottom: 17px;
  left: -70px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* 箭头样式 */
.dimension-arrow {
  position: relative;
  width: 40px;
  height: 2px;
  background-color: #ff4d6d;
  margin: 4px 0;
}

.dimension-arrow.vertical {
  width: 2px;
  height: 40px;
}

.dimension-arrow .arrow-line {
  position: absolute;
  width: 6px;
  height: 2px;
  background-color: #ff4d6d;
}

.arrow-line.left {
  left: 0;
  top: 0;
  transform: rotate(45deg);
}

.arrow-line.right {
  right: 0;
  top: 0;
  transform: rotate(-45deg);
}

.arrow-line.top {
  left: 0;
  top: 0;
  transform: rotate(-45deg);
}

.arrow-line.bottom {
  left: 0;
  bottom: 0;
  transform: rotate(45deg);
}

/* Home指示器样式 */
.home-indicator {
  height: 34px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background-color: #000;
  border-radius: 2.5px;
}

/* 设计规范图样式 */
.ios-diagram-container {
  padding: 20px;
  position: relative;
}

.iphone-design-spec {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

/* iPhone框架样式 */
.iphone-frame {
  width: 280px;
  height: 600px;
  border: 2px solid #ffb6c1;
  border-radius: 40px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 状态栏样式 */
.iphone-statusbar {
  height: 47px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.status-time {
  font-weight: 600;
  font-size: 14px;
  color: #000;
}

.status-icons {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #000;
}

/* 导航栏样式 */
.iphone-navbar {
  height: 44px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-weight: 600;
  font-size: 17px;
  color: #000;
}

/* 内容区域样式 */
.iphone-content {
  flex: 1;
  background-color: rgba(0, 163, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-text {
  font-weight: 500;
  font-size: 16px;
  color: #007AFF;
}

/* 标签栏样式 */
.iphone-tabbar {
  height: 49px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 0;
  color: #8E8E93;
}

.tab-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-label {
  font-size: 10px;
  text-align: center;
}

.active-tab {
  color: #007AFF;
}

/* Home指示器样式 */
.home-indicator {
  height: 34px;
  background-color: rgba(255, 77, 109, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-bar {
  width: 134px;
  height: 5px;
  background-color: #000;
  border-radius: 2.5px;
}

/* 标注样式 */
.dimension-tag {
  background-color: #ff4d6d;
  color: white;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.dimension-line {
  background-color: #ff4d6d;
  position: absolute;
}

/* 宽度标注 */
.width-dimension {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.width-dimension .dimension-line {
  width: 240px;
  height: 2px;
  margin-bottom: 5px;
}

.width-dimension .dimension-line:before,
.width-dimension .dimension-line:after {
  content: '';
  position: absolute;
  width: 2px;
  height: 6px;
  background-color: #ff4d6d;
}

.width-dimension .dimension-line:before {
  left: 0;
  top: -2px;
}

.width-dimension .dimension-line:after {
  right: 0;
  top: -2px;
}

/* 高度标注 */
.height-dimension {
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}

.height-dimension .dimension-line {
  width: 2px;
  height: 540px;
  margin-right: 5px;
}

.height-dimension .dimension-line:before,
.height-dimension .dimension-line:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 2px;
  background-color: #ff4d6d;
}

.height-dimension .dimension-line:before {
  left: -2px;
  top: 0;
}

.height-dimension .dimension-line:after {
  left: -2px;
  bottom: 0;
}

/* 状态栏标注 */
.statusbar-dimension {
  position: absolute;
  left: -40px;
  top: 83px;
  display: flex;
  align-items: center;
}

.statusbar-dimension .dimension-line {
  width: 30px;
  height: 2px;
  margin-right: 5px;
}

/* 导航栏标注 */
.navbar-dimension {
  position: absolute;
  left: -40px;
  top: 130px;
  display: flex;
  align-items: center;
}

.navbar-dimension .dimension-line {
  width: 30px;
  height: 2px;
  margin-right: 5px;
}

/* 左边距标注 */
.margin-dimension-left {
  position: absolute;
  left: 55px;
  top: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.margin-dimension-left .dimension-line {
  width: 2px;
  height: 30px;
  margin-bottom: 5px;
}

/* 右边距标注 */
.margin-dimension-right {
  position: absolute;
  right: 55px;
  top: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.margin-dimension-right .dimension-line {
  width: 2px;
  height: 30px;
  margin-bottom: 5px;
}

/* 标签栏标注 */
.tabbar-dimension {
  position: absolute;
  left: -40px;
  bottom: 92px;
  display: flex;
  align-items: center;
}

.tabbar-dimension .dimension-line {
  width: 30px;
  height: 2px;
  margin-right: 5px;
}

/* 图标尺寸标注 */
.icon-dimension {
  position: absolute;
  right: 15px;
  bottom: 92px;
  display: flex;
  align-items: center;
}

.icon-dimension .dimension-line {
  width: 30px;
  height: 2px;
  margin-right: 5px;
}

/* Home指示器标注 */
.home-indicator-dimension {
  position: absolute;
  left: -40px;
  bottom: 17px;
  display: flex;
  align-items: center;
}

.home-indicator-dimension .dimension-line {
  width: 30px;
  height: 2px;
  margin-right: 5px;
}

/* 设备选择器按钮样式 */
.device-selector-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f3f4f6;
  color: #374151;
  transition: all 0.2s;
}

.device-selector-btn:hover {
  background-color: #e5e7eb;
}

.active-device {
  background-color: #6C54FF;
  color: white;
}

/* 新的iOS规范设计图样式 */
.ios-spec-diagram {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.iphone-spec-frame {
  position: relative;
  width: 300px;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  overflow: hidden;
}

/* 状态栏样式 */
.status-bar-area {
  height: 53px;
  background-color: rgba(170, 120, 240, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-bar-notch {
  width: 130px;
  height: 22px;
  background-color: rgba(224, 224, 224, 0.7);
  border-radius: 0 0 12px 12px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

/* 导航栏样式 */
.navigation-bar-area {
  height: 97px;
  background-color: rgba(170, 120, 240, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  height: 366px;
  background-color: rgba(255, 255, 255, 1);
}

/* 标签栏样式 */
.tab-bar-area {
  height: 50px;
  background-color: rgba(170, 120, 240, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-icons {
  display: flex;
  justify-content: space-around;
  width: 80%;
  position: absolute;
  bottom: 8px;
}

.tab-icon {
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

/* Home指示器样式 */
.home-indicator-area {
  height: 34px;
  background-color: rgba(100, 180, 250, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.home-indicator {
  width: 134px;
  height: 5px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2.5px;
}

/* 组件标签样式 */
.component-label {
  background-color: rgba(255, 51, 102, 0.85);
  color: white;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
  line-height: 1.3;
  z-index: 10;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
  font-weight: 500;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* 组件虚线边框 */
.dimension-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px dashed rgba(255, 51, 102, 0.6);
  pointer-events: none;
}

/* 设备规范表样式 */
.device-spec-table {
  background-color: #FCFCFC;
  border-radius: 10px;
  overflow: hidden;
  font-size: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.device-spec-row {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
  line-height: 1.5;
}

.device-spec-row:last-child {
  border-bottom: none;
}

.spec-label {
  flex: 1;
  padding: 10px 12px;
  color: #333;
  font-weight: 500;
  background-color: #F8F8F8;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
}

.spec-value {
  flex: 1;
  padding: 10px 12px;
  color: #666;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
}

/* 边距标注 */
.margin-label {
  position: absolute;
}

.margin-line {
  position: absolute;
  background-color: #33cc33;
}

.margin-text {
  color: #33cc33;
  font-size: 10px;
  white-space: nowrap;
  text-align: center;
  background-color: rgba(51, 204, 51, 0.15);
  padding: 3px 6px;
  border-radius: 4px;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
}

.top-margin {
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
}

.top-margin .margin-line {
  width: 1px;
  height: 20px;
  left: 50%;
  transform: translateX(-50%);
  top: -20px;
}

.right-margin {
  right: 16px;
  top: 300px;
}

.right-margin .margin-line {
  width: 20px;
  height: 1px;
  right: -20px;
}

/* 组件虚线边框 */
.dimension-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px dashed rgba(255, 51, 102, 0.7);
  pointer-events: none;
}

/* 屏幕尺寸标注 */
.screen-width-label {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
}

.width-line {
  position: absolute;
  width: 280px;
  height: 1px;
  background-color: #666;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
}

.width-line:before,
.width-line:after {
  content: '';
  position: absolute;
  width: 1px;
  height: 6px;
  background-color: #666;
}

.width-line:before {
  left: 0;
  bottom: 0;
}

.width-line:after {
  right: 0;
  bottom: 0;
}

.width-text {
  color: #333;
  font-size: 12px;
  text-align: center;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
}

.screen-height-label {
  position: absolute;
  left: -40px;
  top: 50%;
  transform: translateY(-50%);
}

.height-line {
  position: absolute;
  width: 1px;
  height: 580px;
  background-color: #666;
  top: 50%;
  transform: translateY(-50%);
  left: 25px;
}

.height-line:before,
.height-line:after {
  content: '';
  position: absolute;
  width: 6px;
  height: 1px;
  background-color: #666;
  left: -2px;
}

.height-line:before {
  top: 0;
}

.height-line:after {
  bottom: 0;
}

.height-text {
  color: #333;
  font-size: 12px;
  transform: rotate(-90deg);
  white-space: nowrap;
  position: absolute;
  top: 50%;
  left: -20px;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
}

/* 设备选择器样式 */
.device-selector-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  background-color: #f3f4f6;
  color: #374151;
  transition: all 0.2s;
}

.device-selector-btn:hover {
  background-color: #e5e7eb;
}

.active-device {
  background-color: #6C54FF;
  color: white;
}

/* iOS设计规范标题样式 */
.ios-spec-title {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f7f7f7;
  border: 1px solid #e6e6e6;
  color: #333333;
  font-size: 13px;
  font-weight: 500;
  font-family: -apple-system, 'SF Pro Text', sans-serif;
  border-radius: 6px;
  letter-spacing: -0.1px;
}

.principle-example {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.principle-example p {
  margin-bottom: 5px;
}

.principle-example ul {
  list-style-type: disc;
  padding-left: 20px;
}

/* 新增设备选择器相关样式 */
.devices-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.device-card {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.device-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.07);
  transform: translateY(-2px);
}

.active-device-card {
  background-color: #f0f4ff;
  border-color: #6C54FF;
  box-shadow: 0 2px 8px rgba(108, 84, 255, 0.15);
}

.device-visual {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.device-outline {
  border: 2px solid #333;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  background-color: #fff;
}

.device-notch {
  width: 20px;
  height: 6px;
  background-color: #333;
  border-radius: 0 0 5px 5px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.device-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-status-bar {
  height: 8px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.device-content {
  flex: 1;
  padding: 4px;
}

.content-blocks {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mini-block {
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 1px;
}

.device-home-indicator {
  height: 2px;
  width: 20px;
  background-color: #333;
  border-radius: 1px;
  margin: 2px auto;
}

.device-info {
  width: 100%;
}

.device-name {
  font-weight: 500;
  font-size: 0.875rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.device-specs {
  font-size: 0.75rem;
  color: #6b7280;
}

.selection-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background-color: #6C54FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 2px solid white;
}

.check-icon {
  width: 14px;
  height: 14px;
}

.selected-device-info {
  border-left: 3px solid #6C54FF;
}

/* 响应式样式调整 */
@media (max-width: 640px) {
  .devices-gallery {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.75rem;
  }

  .device-card {
    padding: 0.75rem;
  }

  .device-outline {
    width: 60px !important;
    height: 120px !important;
  }
}

/* Android设备特有样式 */
.device-outline.android {
  border-radius: 8px;
  border-color: #444;
}

.device-status-bar.android {
  height: 10px;
  background-color: #f0f0f0;
  display: flex;
  justify-content: flex-end;
  padding-right: 3px;
}

.device-status-bar.android:before {
  content: "";
  width: 4px;
  height: 4px;
  background-color: #666;
  border-radius: 50%;
  align-self: center;
}

.android-navbar {
  height: 6px;
  background-color: #f0f0f0;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
}

.android-navbar:before {
  content: "";
  width: 20px;
  height: 3px;
  background-color: #555;
  border-radius: 2px;
  align-self: center;
}

.selected-device-info {
  border-left-width: 3px;
}

/* iOS设备的选择标识使用蓝色 */
.selected-device-info.bg-blue-50 {
  border-left-color: #6C54FF;
}

/* Android设备的选择标识使用绿色 */
.selected-device-info.bg-green-50 {
  border-left-color: #22C55E;
}

/* 设备规范展示样式 */
.device-spec-display {
  position: relative;
}

.device-large-preview {
  position: relative;
  margin: 0 auto;
  max-width: 100%;
}

.device-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 3px solid #333;
  border-radius: 24px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.device-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.device-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20%;
  height: 3%;
  background-color: #333;
  border-radius: 0 0 10px 10px;
  z-index: 10;
}

.area {
  position: relative;
  border: 1px dashed #e5e7eb;
  margin: 4px;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.area::before {
  content: attr(data-label);
  position: absolute;
  right: -120px;
  background-color: rgba(108, 84, 255, 0.1);
  color: #6C54FF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.area::after {
  content: '';
  position: absolute;
  right: -24px;
  width: 24px;
  height: 1px;
  background-color: rgba(108, 84, 255, 0.4);
}

.area-icon {
  position: absolute;
  top: 50%;
  left: -20px;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.status-bar {
  height: 6%;
  background-color: #f5f5f7;
}

.nav-bar {
  height: 8%;
  background-color: #f5f5f7;
}

.content-area {
  flex: 1;
  padding: 8px;
  background-color: #fafafa;
}

.content-blocks {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-block {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 2px;
}

.tab-bar {
  height: 10%;
  background-color: #f5f5f7;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.tab-icons {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.tab-icon {
  width: 5px;
  height: 5px;
  background-color: #6C54FF;
  border-radius: 50%;
}

.home-indicator {
  height: 5%;
  background-color: #f5f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-indicator-bar {
  width: 25%;
  height: 3px;
  background-color: #333;
  border-radius: 2px;
}

.margin-indicators {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.margin-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 80%;
  background-color: rgba(108, 84, 255, 0.4);
}

.margin-indicator::before {
  content: attr(data-label);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(108, 84, 255, 0.1);
  color: #6C54FF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.margin-indicator.left {
  left: 8%;
}

.margin-indicator.left::before {
  left: -40px;
}

.margin-indicator.right {
  right: 8%;
}

.margin-indicator.right::before {
  right: -40px;
}

.screen-dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.dimension {
  position: absolute;
  background-color: rgba(108, 84, 255, 0.2);
}

.dimension::before {
  content: attr(data-label);
  position: absolute;
  background-color: rgba(108, 84, 255, 0.1);
  color: #6C54FF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.dimension.width {
  top: -20px;
  left: 0;
  width: 100%;
  height: 1px;
}

.dimension.width::before {
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.dimension.height {
  top: 0;
  right: -20px;
  width: 1px;
  height: 100%;
}

.dimension.height::before {
  right: -20px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: right center;
}

/* 预览设备组件样式 */
.device-outline-preview {
  border: 2px solid #333;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.device-notch-preview {
  width: 30px;
  height: 8px;
  background-color: #333;
  border-radius: 0 0 8px 8px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.device-screen-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.device-status-bar-preview {
  height: 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #eee;
}

.device-content-preview {
  flex: 1;
  padding: 6px;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.preview-block {
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 2px;
}

.device-home-indicator-preview {
  height: 4px;
  margin: 4px auto;
  width: 30%;
  background-color: #333;
  border-radius: 2px;
}

.device-dimensions {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.dimension-width,
.dimension-height {
  font-size: 10px;
  background-color: rgba(108, 84, 255, 0.1);
  color: #6C54FF;
  padding: 1px 4px;
  border-radius: 3px;
  position: absolute;
}

.dimension-width {
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
}

.dimension-height {
  right: 5px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: right center;
}

/* Android特殊样式 */
.device-outline-preview.android {
  border-radius: 12px;
}

.device-status-bar-preview.android {
  height: 14px;
}

.android-navbar-preview {
  height: 14px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  align-items: center;
}

.android-navbar-preview:after {
  content: '';
  width: 40%;
  height: 2px;
  background-color: #333;
  border-radius: 1px;
}

@media (max-width: 768px) {
  .device-large-preview {
    width: 180px !important;
    height: auto !important;
  }

  .area::before {
    right: -100px;
    font-size: 10px;
  }
}

/* Android 设备规范展示特有样式 */
.device-frame.android {
  border-radius: 16px;
}

.app-bar {
  height: 10%;
  background-color: #f5f5f7;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.nav-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  width: 100%;
}

.nav-button {
  width: 6px;
  height: 6px;
  background-color: #22C55E;
  border-radius: 50%;
}

/* 绿色主题 Android */
.android-spec-diagram .area::before {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.android-spec-diagram .area::after {
  background-color: rgba(34, 197, 94, 0.4);
}

.android-spec-diagram .margin-indicator {
  background-color: rgba(34, 197, 94, 0.4);
}

.android-spec-diagram .margin-indicator::before {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

.android-spec-diagram .dimension {
  background-color: rgba(34, 197, 94, 0.2);
}

.android-spec-diagram .dimension::before {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22C55E;
}

/* 设计风格区域样式 */
.design-style-area {
  background-color: #f3f8ff;
  min-height: 60px;
}

.design-style-items {
  display: flex;
  justify-content: space-around;
  width: 100%;
  padding: 4px;
}

.design-style {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.style-color {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.style-typography {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.style-radius {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid #666;
  background-color: transparent;
}

.style-name {
  font-size: 10px;
  color: #666;
}

/* 设计内容区域样式 */
.design-content-area {
  background-color: #f5f5fa;
  min-height: 80px;
}

.design-content-elements {
  width: 100%;
  padding: 4px;
}

.content-element {
  display: flex;
  align-items: center;
  padding: 6px;
  margin-bottom: 6px;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
}

.element-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: #e0e0ff;
  margin-right: 8px;
  flex-shrink: 0;
}

.element-text {
  flex: 1;
}

.element-title {
  height: 8px;
  width: 70%;
  background-color: #d0d0e0;
  border-radius: 4px;
  margin-bottom: 4px;
}

.element-desc {
  height: 6px;
  width: 90%;
  background-color: #e0e0e0;
  border-radius: 3px;
}

/* 继续已有样式 */
/* ... existing code */
</style>
