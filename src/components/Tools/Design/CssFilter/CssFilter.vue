<!--
 * @file CssFilter.vue
 * @description CSS 滤镜生成器，在线调节 CSS Filter 属性：模糊、亮度、对比度等，实时预览图片效果
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CopyDocument, Upload } from '@element-plus/icons-vue'
import { ElMessage, UploadFile } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'
import useClipboard from 'vue-clipboard3'

const route = useRoute()
const { toClipboard } = useClipboard()

const imageUrl = ref('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')

// Filters
const blur = ref(0) // px
const brightness = ref(100) // %
const contrast = ref(100) // %
const grayscale = ref(0) // %
const hueRotate = ref(0) // deg
const invert = ref(0) // %
const opacity = ref(100) // %
const saturate = ref(100) // %
const sepia = ref(0) // %

const filterCss = computed(() => {
  const filters = []
  if (blur.value > 0) filters.push(`blur(${blur.value}px)`)
  if (brightness.value !== 100) filters.push(`brightness(${brightness.value}%)`)
  if (contrast.value !== 100) filters.push(`contrast(${contrast.value}%)`)
  if (grayscale.value > 0) filters.push(`grayscale(${grayscale.value}%)`)
  if (hueRotate.value > 0) filters.push(`hue-rotate(${hueRotate.value}deg)`)
  if (invert.value > 0) filters.push(`invert(${invert.value}%)`)
  if (opacity.value < 100) filters.push(`opacity(${opacity.value}%)`)
  if (saturate.value !== 100) filters.push(`saturate(${saturate.value}%)`)
  if (sepia.value > 0) filters.push(`sepia(${sepia.value}%)`)

  if (filters.length === 0) return 'none'
  return filters.join(' ')
})

const copyCss = async () => {
  try {
    await toClipboard(`filter: ${filterCss.value};`)
    ElMessage.success('CSS 代码已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

const reset = () => {
  blur.value = 0
  brightness.value = 100
  contrast.value = 100
  grayscale.value = 0
  hueRotate.value = 0
  invert.value = 0
  opacity.value = 100
  saturate.value = 100
  sepia.value = 0
}

// Handle Image Upload
const handleUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      imageUrl.value = e.target.result as string
    }
  }
  reader.readAsDataURL(file.raw)
}
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h2 class="text-4xl font-bold mb-3 text-gray-800">CSS 滤镜生成器</h2>
          <p class="text-gray-500 text-sm">在线调节 CSS Filter 属性：模糊、亮度、对比度等，实时预览图片效果。</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

          <!-- Preview -->
          <div
            class="flex-1 bg-gray-50 rounded-xl p-4 md:p-8 border border-gray-100 flex flex-col items-center justify-center min-h-[500px]">
            <div class="relative max-w-full overflow-hidden rounded-lg shadow-lg">
              <img :src="imageUrl" alt="Preview"
                class="max-w-full max-h-[600px] object-contain transition-all duration-200"
                :style="{ filter: filterCss }" />
            </div>

            <div class="mt-4">
              <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleUpload"
                accept="image/*">
                <el-button :icon="Upload">上传图片预览</el-button>
              </el-upload>
            </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">

            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 h-[600px] overflow-y-auto custom-scrollbar">
              <div class="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 z-10 py-2 border-b">
                <h3 class="font-bold text-gray-800">滤镜设置</h3>
                <el-button size="small" link @click="reset">重置</el-button>
              </div>

              <div class="space-y-6">
                <!-- Blur -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Blur (模糊)</span>
                    <span>{{ blur }}px</span>
                  </div>
                  <el-slider v-model="blur" :min="0" :max="50" size="small" />
                </div>

                <!-- Brightness -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Brightness (亮度)</span>
                    <span>{{ brightness }}%</span>
                  </div>
                  <el-slider v-model="brightness" :min="0" :max="200" size="small" />
                </div>

                <!-- Contrast -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Contrast (对比度)</span>
                    <span>{{ contrast }}%</span>
                  </div>
                  <el-slider v-model="contrast" :min="0" :max="200" size="small" />
                </div>

                <!-- Grayscale -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Grayscale (灰度)</span>
                    <span>{{ grayscale }}%</span>
                  </div>
                  <el-slider v-model="grayscale" :min="0" :max="100" size="small" />
                </div>

                <!-- Hue Rotate -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Hue Rotate (色相旋转)</span>
                    <span>{{ hueRotate }}deg</span>
                  </div>
                  <el-slider v-model="hueRotate" :min="0" :max="360" size="small" />
                </div>

                <!-- Invert -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Invert (反转)</span>
                    <span>{{ invert }}%</span>
                  </div>
                  <el-slider v-model="invert" :min="0" :max="100" size="small" />
                </div>

                <!-- Opacity -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Opacity (不透明度)</span>
                    <span>{{ opacity }}%</span>
                  </div>
                  <el-slider v-model="opacity" :min="0" :max="100" size="small" />
                </div>

                <!-- Saturate -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Saturate (饱和度)</span>
                    <span>{{ saturate }}%</span>
                  </div>
                  <el-slider v-model="saturate" :min="0" :max="200" size="small" />
                </div>

                <!-- Sepia -->
                <div>
                  <div class="flex justify-between text-sm mb-1 text-gray-600">
                    <span>Sepia (褐色)</span>
                    <span>{{ sepia }}%</span>
                  </div>
                  <el-slider v-model="sepia" :min="0" :max="100" size="small" />
                </div>
              </div>

            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <div class="text-gray-400 text-xs mb-2">CSS Code</div>
              <pre
                class="text-blue-300 font-mono text-sm overflow-x-auto break-all whitespace-pre-wrap">filter: {{ filterCss }};</pre>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}
</style>
