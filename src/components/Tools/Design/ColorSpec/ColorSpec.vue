<!--
 * @file ColorSpec.vue
 * @description 色彩规范生成器，根据主色自动生成配色方案
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Download, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'
import TinyColor from 'tinycolor2'

const route = useRoute()
const { toClipboard } = useClipboard()

const primaryColor = ref('#3b82f6')
const showCssDialog = ref(false)

const generatePalette = (color: string) => {
  const base = new TinyColor(color)
  return [
    { name: '50', color: base.clone().lighten(52).toHexString() },
    { name: '100', color: base.clone().lighten(37).toHexString() },
    { name: '200', color: base.clone().lighten(26).toHexString() },
    { name: '300', color: base.clone().lighten(12).toHexString() },
    { name: '400', color: base.clone().lighten(6).toHexString() },
    { name: '500', color: base.toHexString() }, // Base
    { name: '600', color: base.clone().darken(6).toHexString() },
    { name: '700', color: base.clone().darken(12).toHexString() },
    { name: '800', color: base.clone().darken(18).toHexString() },
    { name: '900', color: base.clone().darken(24).toHexString() },
  ].map(swatch => {
    const isLight = new TinyColor(swatch.color).isLight()
    const contrastWhite = TinyColor.readability(swatch.color, '#ffffff')
    const contrastBlack = TinyColor.readability(swatch.color, '#000000')
    return {
      ...swatch,
      textColor: isLight ? '#000000' : '#ffffff',
      contrastWhite: contrastWhite.toFixed(2),
      contrastBlack: contrastBlack.toFixed(2)
    }
  })
}

const palette = computed(() => generatePalette(primaryColor.value))

const cssCode = computed(() => {
  return `:root {\n${palette.value.map(s => `  --color-primary-${s.name}: ${s.color};`).join('\n')}\n}`
})

const copyColor = async (color: string) => {
  try {
    await toClipboard(color)
    ElMessage.success(`已复制: ${color}`)
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const copyCssCode = async () => {
  try {
    await toClipboard(cssCode.value)
    ElMessage.success('CSS 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">色彩规范生成器</h2>
          <p class="text-gray-500 text-sm">输入品牌主色，自动生成完整的色阶板，并提供无障碍对比度检测</p>
        </div>

        <div class="max-w-6xl mx-auto">

          <div
            class="flex flex-col md:flex-row items-center justify-between mb-12 gap-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div class="flex items-center gap-6">
              <div class="flex flex-col">
                <span class="text-sm text-gray-500 mb-2">选择主色 (Primary Color)</span>
                <div class="flex items-center gap-4">
                  <el-color-picker v-model="primaryColor" size="large" />
                  <div class="text-2xl font-mono font-bold text-gray-700">{{ primaryColor }}</div>
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <el-button type="primary" plain :icon="Download" @click="showCssDialog = true">
                导出 CSS 变量
              </el-button>
            </div>
          </div>

          <!-- Palette Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4 mb-12">
            <div v-for="swatch in palette" :key="swatch.name"
              class="group relative aspect-[3/4] rounded-xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between overflow-hidden"
              :style="{ backgroundColor: swatch.color, color: swatch.textColor }" @click="copyColor(swatch.color)">
              <div class="p-3 text-xs opacity-50 font-mono">
                {{ swatch.name }}
              </div>

              <div class="p-3 flex flex-col gap-1">
                <div class="font-bold text-lg tracking-wider">{{ swatch.color }}</div>
                <div class="flex flex-col gap-1 text-[10px] opacity-70">
                  <div class="flex justify-between">
                    <span>White</span>
                    <span>{{ swatch.contrastWhite }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Black</span>
                    <span>{{ swatch.contrastBlack }}</span>
                  </div>
                </div>
              </div>

              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[1px]">
                <span class="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">复制 HEX</span>
              </div>
            </div>
          </div>

          <!-- Usage Examples & Accessibility -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="font-bold text-gray-800 mb-6 flex items-center gap-2">
                <el-icon>
                  <View />
                </el-icon>
                组件预览
              </h3>
              <div class="space-y-6">
                <!-- Buttons -->
                <div class="flex flex-wrap gap-4">
                  <button
                    class="px-6 py-2.5 rounded-lg text-white font-medium shadow-sm transition-opacity hover:opacity-90"
                    :style="{ backgroundColor: primaryColor }">
                    Primary Button
                  </button>
                  <button class="px-6 py-2.5 rounded-lg font-medium border shadow-sm bg-white hover:bg-gray-50"
                    :style="{ borderColor: primaryColor, color: primaryColor }">
                    Secondary Button
                  </button>
                </div>

                <!-- Alert -->
                <div class="p-4 rounded-lg border flex items-start gap-3"
                  :style="{ backgroundColor: palette[0].color, borderColor: palette[2].color }">
                  <div :style="{ color: palette[6].color }">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold mb-1" :style="{ color: palette[8].color }">Information</h4>
                    <p class="text-sm" :style="{ color: palette[7].color }">This is an alert component using the
                      generated color scale.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="font-bold text-gray-800 mb-6">无障碍指南 (WCAG)</h3>
              <div class="space-y-4 text-sm text-gray-600">
                <p>
                  <span class="font-bold text-gray-800">AA 标准:</span> 对比度至少 4.5:1 (大号文本 3:1)
                </p>
                <p>
                  <span class="font-bold text-gray-800">AAA 标准:</span> 对比度至少 7:1 (大号文本 4.5:1)
                </p>
                <div class="mt-4 p-4 bg-gray-50 rounded text-xs leading-relaxed">
                  色块上的数值分别表示该颜色与白色/黑色的对比度。数值越高，可读性越好。
                  <br>通常推荐 50-400 使用黑色文本，500-900 使用白色文本。
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="showCssDialog" title="导出 CSS 变量" width="500px">
    <div class="relative">
      <pre class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">{{ cssCode }}</pre>
      <div class="absolute top-2 right-2">
        <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCssCode">复制</el-button>
      </div>
    </div>
  </el-dialog>

  <ToolsRecommend :currentPath="route.path" />
</template>
