<!--
 * @file Font.vue
 * @description 字体搭配助手工具组件，帮助设计师快速找到合适的字体组合
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-17
 *
 * 功能特性：
 * 1. 支持多种字体类型选择（标题、正文、展示、装饰）
 * 2. 实时预览字体效果，支持自定义预览文本
 * 3. 智能推荐中英文字体组合
 * 4. 内置多个经典字体搭配模板
 * 5. 支持一键复制字体名称
 -->

<script setup lang="ts">
import { ref, reactive, computed, Ref, ComputedRef, watch } from '@vue/runtime-core'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import {
  Brush,
  Connection,
  Share,
  CirclePlus,
  Refresh
} from '@element-plus/icons-vue'

// 类型定义
type FontStyle = 'modern' | 'classic' | 'creative' | 'business'

interface FontType {
  value: string
  label: string
  size: string
  weight: string
}

interface FontInfo {
  name: string
  style: FontStyle
  family: string
  cdn?: string
  weight?: string
  fallback: string
}

interface FontPair extends FontInfo {
  preview: string
  styleLabel: string
  css: string
}

// 类型定义
interface FontState {
  fontTypes: FontType[]
  fontStyle: FontStyle[]
  fontInfo: FontInfo
  fontLibrary: Record<string, FontInfo[]>
  generateCSS: (font: FontInfo) => string
  generateFontCode: (font: FontInfo) => string
  copyFontCode: (font: FontInfo) => void
  previewFont: (font: FontInfo) => void
  selectedFontType: Ref<string>
  currentTypeStyle: ComputedRef<{ size: string; weight: string }>
  sampleText: Ref<string>
  subText: Ref<string>
  recommendedFonts: ComputedRef<FontInfo[]>
  fontPairs: ComputedRef<FontPair[]>
  fontStyles: { value: FontStyle; label: string }[]
  getStyleLabel: (style: FontStyle) => string
  getPreviewText: (style: FontStyle) => string
  copyFontName: (font: string) => void
  applyTemplate: (template: any) => void
  getTypeDescription: (type: string) => string
}

// 获取路由实例
const route = useRoute()

// 组件配置信息
const info = reactive<FontState>({
  // 字体类型选项
  fontTypes: [
    { value: 'heading', label: '标题字体', size: 'text-4xl', weight: 'font-bold' },
    { value: 'body', label: '正文字体', size: 'text-base', weight: 'font-normal' },
    { value: 'display', label: '展示字体', size: 'text-5xl', weight: 'font-extrabold' },
    { value: 'decorative', label: '装饰字体', size: 'text-3xl', weight: 'font-medium' }
  ],
  // 字体风格类型
  fontStyle: ['modern', 'classic', 'creative', 'business'] as FontStyle[],
  // 字体信息接口
  fontInfo: {
    name: '',
    style: 'modern',
    family: '', // CSS font-family
    cdn: '',   // 字体CDN链接
    weight: '', // 字体粗细
    fallback: '' // 后备字体
  },
  // 字体库
  fontLibrary: {
    heading: [
      {
        name: 'PingFang SC',
        style: 'modern',
        family: 'PingFang SC',
        fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      {
        name: 'Source Han Serif',
        style: 'classic',
        family: 'Source Han Serif SC',
        cdn: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap',
        fallback: 'serif'
      },
      {
        name: 'ZCOOL KuaiLe',
        style: 'creative',
        family: 'ZCOOL KuaiLe',
        cdn: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap',
        fallback: 'cursive'
      },
      {
        name: 'Microsoft YaHei',
        style: 'business',
        family: 'Microsoft YaHei',
        fallback: 'system-ui, -apple-system, sans-serif'
      }
    ],
    body: [
      {
        name: 'SF Pro Text',
        style: 'modern',
        family: '-apple-system',
        fallback: 'system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      },
      {
        name: 'Noto Serif SC',
        style: 'classic',
        family: 'Noto Serif SC',
        cdn: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC&display=swap',
        fallback: 'serif'
      },
      {
        name: 'ZCOOL XiaoWei',
        style: 'creative',
        family: 'ZCOOL XiaoWei',
        cdn: 'https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap',
        fallback: 'serif'
      },
      {
        name: 'SimSun',
        style: 'business',
        family: 'SimSun',
        fallback: 'serif'
      }
    ],
    display: [
      {
        name: 'Impact',
        style: 'modern',
        family: 'Impact',
        fallback: 'Arial Black, sans-serif'
      },
      {
        name: 'Playfair Display SC',
        style: 'classic',
        family: 'Playfair Display SC',
        cdn: 'https://fonts.googleapis.com/css2?family=Playfair+Display+SC:wght@400;700&display=swap',
        fallback: 'serif'
      },
      {
        name: 'Pacifico',
        style: 'creative',
        family: 'Pacifico',
        cdn: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
        fallback: 'cursive'
      },
      {
        name: 'Roboto Condensed',
        style: 'business',
        family: 'Roboto Condensed',
        cdn: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap',
        fallback: 'sans-serif'
      }
    ],
    decorative: [
      {
        name: 'Brush Script MT',
        style: 'modern',
        family: 'Brush Script MT',
        fallback: 'cursive'
      },
      {
        name: 'Copperplate',
        style: 'classic',
        family: 'Copperplate',
        fallback: 'serif'
      },
      {
        name: 'Comic Sans MS',
        style: 'creative',
        family: 'Comic Sans MS',
        fallback: 'cursive'
      },
      {
        name: 'Arial Black',
        style: 'business',
        family: 'Arial Black',
        fallback: 'sans-serif'
      }
    ]
  },
  // 生成CSS代码
  generateCSS: (font: FontInfo): string => {
    let css = `font-family: ${font.family}, ${font.fallback};`
    if (font.weight) {
      css += `\nfont-weight: ${font.weight};`
    }
    return css
  },
  // 生成完整的字体引用代码
  generateFontCode: (font: FontInfo): string => {
    let code = ''

    // 如果有CDN链接，添加@import语句
    if (font.cdn) {
      code += `@import url('${font.cdn}');\n\n`
    }

    // 添加CSS规则
    code += `.font-${font.name.toLowerCase().replace(/\s+/g, '-')} {\n`
    code += `  ${info.generateCSS(font)}\n`
    code += `}`

    return code
  },
  // 复制字体代码
  copyFontCode: (font: FontInfo) => {
    const code = info.generateFontCode(font)
    navigator.clipboard.writeText(code).then(() => {
      ElMessage.success('字体代码已复制到剪贴板')
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
  },
  // 预览字体效果
  previewFont: (font: FontInfo) => {
    // 如果有CDN链接，动态加载字体
    if (font.cdn && !document.querySelector(`link[href="${font.cdn}"]`)) {
      const link = document.createElement('link')
      link.href = font.cdn
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  },
  // 当前选中的字体类型
  selectedFontType: ref('heading'),
  // 根据字体类型获取样式
  currentTypeStyle: computed((): { size: string; weight: string } => {
    const type = info.fontTypes.find(t => t.value === info.selectedFontType)
    return {
      size: type?.size || 'text-base',
      weight: type?.weight || 'font-normal'
    }
  }),
  // 示例文本
  sampleText: ref('设计是一门关于美的科学'),
  subText: ref('字体搭配是设计中的重要环节，优秀的字体组合能让设计作品更具美感和专业性。'),
  // 根据当前类型获取推荐字体
  recommendedFonts: computed((): FontInfo[] => {
    const fonts = info.fontLibrary[info.selectedFontType] || []
    fonts.forEach(info.previewFont)
    return fonts
  }),
  // 推荐字体组合
  fontPairs: computed((): FontPair[] => {
    const fonts = info.recommendedFonts || []
    return fonts.map((font: FontInfo) => ({
      ...font,
      preview: info.getPreviewText(font.style),
      styleLabel: info.getStyleLabel(font.style),
      css: info.generateCSS(font)
    }))
  }),
  // 字体风格选项
  fontStyles: [
    { value: 'modern' as FontStyle, label: '现代简约' },
    { value: 'classic' as FontStyle, label: '经典优雅' },
    { value: 'creative' as FontStyle, label: '创意活力' },
    { value: 'business' as FontStyle, label: '商务专业' }
  ] as const,
  // 获取字体风格标签
  getStyleLabel: (style: FontStyle): string => {
    const styleOption = info.fontStyles.find((s: { value: FontStyle; label: string }) => s.value === style)
    return styleOption?.label || ''
  },
  // 获取预览文本
  getPreviewText: (style: FontStyle): string => {
    const texts: Record<FontStyle, string> = {
      modern: '无界',
      classic: '优雅',
      creative: '活力',
      business: '专业'
    }
    return texts[style]
  },
  // 复制字体名称
  copyFontName: (font: string) => {
    navigator.clipboard.writeText(font).then(() => {
      ElMessage.success(`字体名称 ${font} 已复制到剪贴板`)
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
  },
  // 应用字体模板
  applyTemplate: (template: any) => {
    const font = template[info.selectedFontType]
    if (font) {
      ElMessage.success(`已应用 ${template.name} 模板的${info.fontTypes.find(t => t.value === info.selectedFontType)?.label}：${font}`)
    }
  },
  getTypeDescription: (type: string): string => {
    const descriptions: Record<string, string> = {
      heading: '用于标题和重要文本',
      body: '适合正文和段落文本',
      display: '用于大型展示文本',
      decorative: '适合装饰性文本'
    }
    return descriptions[type] || ''
  }
})

// 监听字体类型变化
watch(() => info.selectedFontType, (newType) => {
  // 预加载新类型的字体
  const fonts = info.fontLibrary[newType] || []
  fonts.forEach(info.previewFont)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">字体搭配助手</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">快速找到完美的字体组合，提升设计作品的专业性和美感</p>

          <!-- 温馨提示 -->
          <div class="mt-6 bg-yellow-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-sm text-gray-600">本工具提供专业的字体搭配推荐，可用于UI设计、平面设计、品牌设计等场景。</p>
            </div>
          </div>

          <!-- 功能更新提示 -->
          <div class="mt-4 bg-blue-50 rounded-lg p-4 max-w-2xl mx-auto">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div class="flex-1">
                <p class="text-sm text-blue-700 font-medium mb-1">功能持续优化中</p>
                <p class="text-sm text-blue-600">我们正在添加更多实用功能：</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 字体类型选择 -->
        <div class="grid grid-cols-1 gap-8">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">选择字体类型</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div v-for="type in info.fontTypes" :key="type.value"
                class="border rounded-lg p-4 cursor-pointer transition-all duration-300"
                :class="{ 'border-blue-500 bg-blue-50': info.selectedFontType === type.value, 'border-gray-200 hover:border-blue-300': info.selectedFontType !== type.value }"
                @click="info.selectedFontType = type.value">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium">{{ type.label }}</div>
                    <div class="text-xs text-gray-500">{{ info.getTypeDescription(type.value) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">字体预览</h3>
            <div class="space-y-6">
              <div class="text-center">
                <div :class="[info.currentTypeStyle.size, info.currentTypeStyle.weight]" contenteditable="true"
                  v-text="info.sampleText"></div>
                <div class="text-gray-600 mt-4" contenteditable="true" v-text="info.subText"></div>
              </div>
            </div>
          </div>

          <!-- 推荐字体组合 -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-medium mb-4">推荐字体</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(pair, index) in info.fontPairs" :key="index"
                class="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-300 bg-gray-50">
                <div class="mb-2">
                  <span :class="[info.currentTypeStyle.size, info.currentTypeStyle.weight]"
                    :style="{ fontFamily: pair.family + ', ' + pair.fallback }">
                    {{ pair.preview }}
                  </span>
                  <span class="text-sm text-gray-500 ml-2">{{ pair.name }}</span>
                  <div class="flex space-x-2 mt-2">
                    <el-button type="text" size="small" @click="info.copyFontName(pair.name)">复制名称</el-button>
                    <el-button type="text" size="small" @click="info.copyFontCode(pair)">复制代码</el-button>
                    <el-button v-if="pair.cdn" type="text" size="small"
                      @click="window.open(pair.cdn, '_blank')">获取字体</el-button>
                  </div>
                </div>
                <div class="text-sm text-gray-500">适合{{ pair.styleLabel }}风格</div>
                <div class="mt-2 text-xs bg-white p-2 rounded border border-gray-100">
                  <pre class="whitespace-pre-wrap">{{ pair.css }}</pre>
                </div>
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

<style scoped>
.container {
  min-height: calc(100vh - 200px);
}

/* 添加卡片悬停效果 */
.bg-white {
  transition: all 0.3s ease;
}

/* 添加字体卡片样式 */
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
}

[contenteditable="true"] {
  outline: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

[contenteditable="true"]:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

[contenteditable="true"]:focus {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>
