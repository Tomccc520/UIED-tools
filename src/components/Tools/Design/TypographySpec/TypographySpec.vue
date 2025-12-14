<!--
 * @file TypographySpec.vue
 * @description 字体排版规范工具，展示常用的字体大小阶梯和行高设置
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'

const route = useRoute()
const { toClipboard } = useClipboard()

const baseSize = ref(16)
const scaleRatio = ref(1.25) // Major Third
const fontFamily = ref('system')
const showCssDialog = ref(false)

const scales = [
  { name: 'Minor Second', value: 1.067 },
  { name: 'Major Second', value: 1.125 },
  { name: 'Minor Third', value: 1.200 },
  { name: 'Major Third', value: 1.250 },
  { name: 'Perfect Fourth', value: 1.333 },
  { name: 'Augmented Fourth', value: 1.414 },
  { name: 'Perfect Fifth', value: 1.500 },
  { name: 'Golden Ratio', value: 1.618 },
]

const fonts = [
  { label: '系统默认 (System UI)', value: 'system', css: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
  { label: '无衬线 (Sans Serif)', value: 'sans', css: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: '衬线体 (Serif)', value: 'serif', css: '"Merriweather", "Georgia", serif' },
  { label: '等宽字体 (Monospace)', value: 'mono', css: '"Fira Code", "Menlo", monospace' },
]

const previewText = ref('The quick brown fox jumps over the lazy dog')

const currentFontCss = computed(() => {
  return fonts.find(f => f.value === fontFamily.value)?.css || ''
})

const getFontSize = (level: number) => {
  // level 0 is base, positive goes up
  return baseSize.value * Math.pow(scaleRatio.value, level)
}

const copyCss = async (size: number, lineHeight: number) => {
  const css = `font-family: ${currentFontCss.value};\nfont-size: ${size.toFixed(2)}px;\nline-height: ${lineHeight};`
  try {
    await toClipboard(css)
    ElMessage.success('CSS 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const generateFullCss = computed(() => {
  let css = `:root {\n  /* Font Family */\n  --font-family-base: ${currentFontCss.value};\n\n  /* Type Scale */\n`
  // Generate base
  css += `  --text-base: ${baseSize.value}px;\n`
  // Generate headers h1-h6
  for (let i = 1; i <= 6; i++) {
    const size = getFontSize(i)
    css += `  --text-xl-${i}: ${size.toFixed(2)}px;\n`
  }
  // Generate small
  css += `  --text-sm: ${getFontSize(-1).toFixed(2)}px;\n`
  css += `}`
  return css
})

const copyFullCss = async () => {
  try {
    await toClipboard(generateFullCss.value)
    ElMessage.success('完整 CSS 变量已复制')
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
          <h2 class="text-4xl font-bold mb-3 text-gray-800">字体排版规范</h2>
          <p class="text-gray-500 text-sm">基于模块化比例生成字体排版系统，支持多种字体预览与导出</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Controls -->
          <div class="w-full lg:w-80 flex flex-col gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-4">
              <h3 class="font-bold text-gray-800 mb-4">设置</h3>

              <div class="space-y-6">
                <!-- Base Size -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>基准字号 (Base Size)</span>
                    <span>{{ baseSize }}px</span>
                  </div>
                  <el-slider v-model="baseSize" :min="12" :max="24" />
                </div>

                <!-- Scale -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">比例因子 (Scale)</div>
                  <el-select v-model="scaleRatio" class="w-full">
                    <el-option v-for="scale in scales" :key="scale.name" :label="`${scale.name} (${scale.value})`"
                      :value="scale.value" />
                  </el-select>
                </div>

                <!-- Font Family -->
                <div>
                  <div class="text-sm text-gray-600 mb-2">字体 (Font Family)</div>
                  <el-select v-model="fontFamily" class="w-full">
                    <el-option v-for="font in fonts" :key="font.value" :label="font.label" :value="font.value" />
                  </el-select>
                </div>

                <!-- Preview Text -->
                <div>
                  <div class="text-sm text-gray-600 mb-1">预览文本</div>
                  <el-input v-model="previewText" type="textarea" :rows="3" />
                </div>

                <!-- Export -->
                <el-button type="primary" class="w-full" :icon="Download" @click="showCssDialog = true">
                  导出 CSS 变量
                </el-button>
              </div>
            </div>
          </div>

          <!-- Preview List -->
          <div class="flex-1 space-y-8" :style="{ fontFamily: currentFontCss }">
            <div v-for="i in 6" :key="i" class="border-b border-gray-100 pb-6 last:border-0">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">H{{ 7 - i }}</span>
                <div class="text-xs text-gray-500 font-mono">
                  {{ getFontSize(7 - i - 1).toFixed(2) }}px
                  <el-button link type="primary" size="small" :icon="CopyDocument"
                    @click="copyCss(getFontSize(7 - i - 1), 1.2)">
                    Copy CSS
                  </el-button>
                </div>
              </div>
              <div class="text-gray-800 font-bold leading-tight transition-all duration-300"
                :style="{ fontSize: `${getFontSize(7 - i - 1)}px` }">
                {{ previewText }}
              </div>
            </div>

            <!-- Base -->
            <div class="pt-2">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs font-bold text-blue-500 uppercase tracking-wider">Base (Body)</span>
                <div class="text-xs text-gray-500 font-mono">
                  {{ baseSize.toFixed(2) }}px
                  <el-button link type="primary" size="small" :icon="CopyDocument" @click="copyCss(baseSize, 1.6)">
                    Copy CSS
                  </el-button>
                </div>
              </div>
              <div class="text-gray-600 leading-relaxed transition-all duration-300"
                :style="{ fontSize: `${baseSize}px` }">
                {{ previewText }}. This is the body text size, used for paragraphs and general content. It should be
                comfortable to read for long periods.
              </div>
            </div>

            <!-- Small -->
            <div class="pt-6 border-t border-gray-100">
              <div class="flex justify-between items-end mb-2">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Small (Caption)</span>
                <div class="text-xs text-gray-500 font-mono">
                  {{ getFontSize(-1).toFixed(2) }}px
                  <el-button link type="primary" size="small" :icon="CopyDocument"
                    @click="copyCss(getFontSize(-1), 1.4)">
                    Copy CSS
                  </el-button>
                </div>
              </div>
              <div class="text-gray-500 leading-normal transition-all duration-300"
                :style="{ fontSize: `${getFontSize(-1)}px` }">
                {{ previewText }}. Used for captions, helpers, and secondary text.
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>

  <el-dialog v-model="showCssDialog" title="导出 CSS 变量" width="500px">
    <div class="relative">
      <pre
        class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">{{ generateFullCss }}</pre>
      <div class="absolute top-2 right-2">
        <el-button type="primary" size="small" :icon="CopyDocument" @click="copyFullCss">复制</el-button>
      </div>
    </div>
  </el-dialog>

  <ToolsRecommend :currentPath="route.path" />
</template>
