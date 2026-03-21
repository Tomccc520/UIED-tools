<!--
 * @file DeviceSelectorPanel.vue
 * @description 移动端设备选择器子组件，负责机型切换和焦点预览展示
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <div class="mobile-device-selector mb-6">
    <div class="mobile-device-selector-header">
      <div>
        <h5 class="mobile-device-selector-title">{{ title }}</h5>
        <p class="mobile-device-selector-desc">{{ description }}</p>
      </div>
      <span class="mobile-device-selector-badge">{{ badgeText }}</span>
    </div>

    <div class="mobile-device-selector-body">
      <div class="mobile-device-gallery">
        <button
          v-for="device in devices"
          :key="device.id"
          class="mobile-device-card"
          :class="{ 'mobile-device-card--active': selectedId === device.id }"
          type="button"
          @click="handleSelect(device.id)"
        >
          <div class="mobile-device-visual">
            <div
              class="mobile-device-outline"
              :class="{ 'mobile-device-outline--android': !isIosPlatform }"
              :style="getDeviceThumbnailStyle(device)"
            >
              <div class="mobile-device-notch" v-if="isIosPlatform && hasHomeIndicator(device)"></div>
              <div class="mobile-device-shell-screen">
                <div
                  class="mobile-device-shell-status"
                  :class="{ 'mobile-device-shell-status--android': !isIosPlatform }"
                ></div>
                <div class="mobile-device-shell-content">
                  <span class="mobile-device-shell-block"></span>
                  <span class="mobile-device-shell-block"></span>
                </div>
                <div class="mobile-device-home-indicator" v-if="isIosPlatform && hasHomeIndicator(device)"></div>
                <div class="mobile-device-bottom-navbar" v-if="!isIosPlatform"></div>
              </div>
            </div>
          </div>
          <div class="mobile-device-info">
            <div class="mobile-device-name">{{ device.name }}</div>
            <div class="mobile-device-specs">{{ device.width }} × {{ device.height }} {{ unit }}</div>
          </div>
          <div class="mobile-device-check" v-if="selectedId === device.id">
            <svg viewBox="0 0 24 24" class="mobile-device-check-icon" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      <div class="mobile-device-focus" :class="{ 'mobile-device-focus--android': !isIosPlatform }">
        <div class="mobile-device-focus-head">
          <span class="mobile-device-focus-chip">当前设备</span>
          <h6>{{ currentDevice.name }}</h6>
          <p>{{ heroDescription }}</p>
        </div>
        <div class="mobile-device-focus-preview">
          <div
            class="mobile-device-outline mobile-device-outline--hero"
            :class="{ 'mobile-device-outline--android': !isIosPlatform }"
            :style="heroStyle"
          >
            <div class="mobile-device-notch" v-if="isIosPlatform && hasHomeIndicator(currentDevice)"></div>
            <div class="mobile-device-shell-screen">
              <div
                class="mobile-device-shell-status"
                :class="{ 'mobile-device-shell-status--android': !isIosPlatform }"
              ></div>
              <div class="mobile-device-shell-content">
                <span class="mobile-device-shell-block"></span>
                <span class="mobile-device-shell-block"></span>
                <span class="mobile-device-shell-block"></span>
              </div>
              <div class="mobile-device-home-indicator" v-if="isIosPlatform && hasHomeIndicator(currentDevice)"></div>
              <div class="mobile-device-bottom-navbar" v-if="!isIosPlatform"></div>
            </div>
          </div>
        </div>
        <p class="mobile-device-focus-note">{{ note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface DeviceOption {
  id: string
  name: string
  width: number
  height: number
  statusBar: number
  navBar: number
  homeIndicator?: number
  appBar?: number
}

type PlatformType = 'ios' | 'android'

const props = defineProps<{
  platform: PlatformType
  title: string
  description: string
  unit: string
  devices: DeviceOption[]
  selectedId: string
  currentDevice: DeviceOption
  heroStyle: Record<string, string>
  note: string
  getDeviceThumbnailStyle: (device: DeviceOption) => Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'update:selectedId', deviceId: string): void
}>()

/**
 * 计算是否为 iOS 平台
 * 用于模板分支渲染灵动岛、Home 指示器等 iOS 专属结构
 */
const isIosPlatform = computed(() => props.platform === 'ios')

/**
 * 计算设备数量徽标文案
 * 统一展示“xx 款机型”，避免父组件重复拼接
 */
const badgeText = computed(() => `${props.devices.length} 款机型`)

/**
 * 计算右侧焦点预览描述
 * iOS 与 Android 分别展示状态栏/导航栏或应用栏等关键尺寸
 */
const heroDescription = computed(() => {
  if (isIosPlatform.value) {
    return `${props.currentDevice.width} × ${props.currentDevice.height}${props.unit} · 状态栏 ${props.currentDevice.statusBar}${props.unit} · 导航栏 ${props.currentDevice.navBar}${props.unit}`
  }

  return `${props.currentDevice.width} × ${props.currentDevice.height}${props.unit} · 状态栏 ${props.currentDevice.statusBar}${props.unit} · 应用栏 ${props.currentDevice.appBar || 0}${props.unit}`
})

/**
 * 判断设备是否有 Home 指示器
 * 仅 iOS 机型使用该结构，Android 机型默认不展示
 */
const hasHomeIndicator = (device: DeviceOption) => {
  return Number(device.homeIndicator || 0) > 0
}

/**
 * 处理机型切换
 * 将点击结果透传给父组件，保持单一数据源
 */
const handleSelect = (deviceId: string) => {
  emit('update:selectedId', deviceId)
}
</script>

<style scoped>
.mobile-device-selector {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.mobile-device-selector-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.mobile-device-selector-title {
  margin: 0;
  font-size: 1rem;
  line-height: 1.45;
  color: #111827;
  font-weight: 700;
}

.mobile-device-selector-desc {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #6b7280;
}

.mobile-device-selector-badge {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.75rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.74rem;
  font-weight: 600;
}

.mobile-device-selector-body {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
  gap: 0.9rem;
}

.mobile-device-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 0.7rem;
}

.mobile-device-card {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  min-height: 152px;
  padding: 0.65rem 0.6rem;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.mobile-device-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.mobile-device-card--active {
  border-color: #6C54FF;
  background: linear-gradient(180deg, #f4f1ff 0%, #ffffff 100%);
  box-shadow: 0 0 0 1px rgba(108, 84, 255, 0.2);
}

.mobile-device-visual {
  height: 94px;
  margin-bottom: 0.45rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-device-outline {
  position: relative;
  overflow: hidden;
  border: 1.5px solid #374151;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 3px 8px rgba(15, 23, 42, 0.12);
}

.mobile-device-outline--android {
  border-radius: 10px;
  border-color: #334155;
}

.mobile-device-outline--hero {
  border-width: 2.5px;
}

.mobile-device-notch {
  position: absolute;
  top: 0;
  left: 50%;
  width: 36%;
  height: 5%;
  transform: translateX(-50%);
  border-radius: 0 0 10px 10px;
  background: #111827;
  z-index: 2;
}

.mobile-device-shell-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-device-shell-status {
  flex: 0 0 10%;
  min-height: 6px;
  border-bottom: 1px solid #edf2f7;
  background: #f8fafc;
}

.mobile-device-shell-status--android {
  flex-basis: 11%;
  background: #f1f5f9;
}

.mobile-device-shell-content {
  flex: 1;
  padding: 8% 10%;
  display: flex;
  flex-direction: column;
  gap: 8%;
  background: #ffffff;
}

.mobile-device-shell-block {
  display: block;
  width: 100%;
  height: 10%;
  min-height: 3px;
  border-radius: 999px;
  background: #dbeafe;
}

.mobile-device-home-indicator {
  flex: 0 0 6%;
  width: 32%;
  min-height: 3px;
  margin: 0 auto 3%;
  border-radius: 999px;
  background: #111827;
}

.mobile-device-bottom-navbar {
  flex: 0 0 9%;
  position: relative;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.mobile-device-bottom-navbar::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 34%;
  height: 2px;
  border-radius: 999px;
  transform: translate(-50%, -50%);
  background: #475569;
}

.mobile-device-info {
  margin-top: auto;
}

.mobile-device-name {
  font-size: 0.7rem;
  line-height: 1.35;
  color: #111827;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.mobile-device-specs {
  margin-top: 0.1rem;
  font-size: 0.62rem;
  line-height: 1.35;
  color: #6b7280;
}

.mobile-device-check {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  background: #6C54FF;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-device-check-icon {
  width: 12px;
  height: 12px;
}

.mobile-device-focus {
  border-radius: 12px;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.mobile-device-focus--android {
  border-color: #d1fae5;
  background: #ecfdf5;
}

.mobile-device-focus-head h6 {
  margin: 0.28rem 0 0.15rem;
  font-size: 0.95rem;
  color: #111827;
  line-height: 1.4;
}

.mobile-device-focus-head p {
  margin: 0;
  font-size: 0.75rem;
  color: #4b5563;
  line-height: 1.55;
}

.mobile-device-focus-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.35rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  border: 1px solid #bfdbfe;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 0.68rem;
  font-weight: 600;
}

.mobile-device-focus--android .mobile-device-focus-chip {
  border-color: #86efac;
  color: #047857;
}

.mobile-device-focus-preview {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-device-focus-note {
  margin: 0;
  font-size: 0.73rem;
  line-height: 1.6;
  color: #475569;
}

@media (max-width: 768px) {
  .mobile-device-selector-header {
    flex-direction: column;
    margin-bottom: 0.75rem;
  }

  .mobile-device-selector-body {
    grid-template-columns: 1fr;
  }

  .mobile-device-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .mobile-device-focus-preview {
    min-height: 160px;
  }
}
</style>
