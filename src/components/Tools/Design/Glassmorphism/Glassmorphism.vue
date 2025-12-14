<script setup lang="ts">
import { ref, computed } from 'vue';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file Glassmorphism.vue
 * @description CSS 玻璃拟态生成器
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const route = useRoute();

const blur = ref(10);
const transparency = ref(0.2);
const saturation = ref(180); // 饱和度背景调整
const color = ref('#ffffff');
const outline = ref(true);

const bgUrl = ref('https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80');

// 计算 rgba 颜色
const rgbaColor = computed(() => {
  const r = parseInt(color.value.slice(1, 3), 16);
  const g = parseInt(color.value.slice(3, 5), 16);
  const b = parseInt(color.value.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${transparency.value})`;
});

const glassStyle = computed(() => {
  return {
    background: rgbaColor.value,
    backdropFilter: `blur(${blur.value}px)`,
    WebkitBackdropFilter: `blur(${blur.value}px)`,
    border: outline.value ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };
});

const cssCode = computed(() => {
  return `background: ${rgbaColor.value};
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
backdrop-filter: blur(${blur.value}px);
-webkit-backdrop-filter: blur(${blur.value}px);
border-radius: 10px;
${outline.value ? 'border: 1px solid rgba(255, 255, 255, 0.18);' : ''}`;
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(cssCode.value);
    ElMessage.success('CSS 代码已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">CSS 玻璃拟态生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线生成 Glassmorphism 风格 CSS 代码，支持自定义模糊度、透明度等参数。</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <!-- 预览区 -->
          <div
            class="flex-1 bg-cover bg-center rounded-xl overflow-hidden min-h-[400px] flex items-center justify-center p-8 relative"
            :style="{ backgroundImage: `url(${bgUrl})` }">

            <div class="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-600/30"
              :style="{ filter: `saturate(${saturation}%)` }"></div>

            <!-- Glass Card -->
            <div class="relative z-10 w-full max-w-md p-8 rounded-xl text-white" :style="glassStyle">
              <h3 class="text-2xl font-bold mb-4">Glassmorphism</h3>
              <p class="mb-6 opacity-90">
                玻璃拟态（Glassmorphism）是一种设计风格，它通过背景模糊、半透明层和漂浮效果来模拟磨砂玻璃的质感。
              </p>
              <button
                class="px-6 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg font-medium border border-white/30 backdrop-blur-sm">
                Button
              </button>
            </div>
          </div>

          <!-- 控制区 -->
          <div class="w-full lg:w-96 flex flex-col gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">参数设置</h3>

              <div class="space-y-4">
                <div>
                  <div class="flex justify-between mb-1">
                    <label class="text-sm text-gray-600">模糊度 (Blur)</label>
                    <span class="text-sm text-gray-400">{{ blur }}px</span>
                  </div>
                  <el-slider v-model="blur" :min="0" :max="20" :step="0.5" size="small" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <label class="text-sm text-gray-600">透明度 (Opacity)</label>
                    <span class="text-sm text-gray-400">{{ transparency }}</span>
                  </div>
                  <el-slider v-model="transparency" :min="0" :max="1" :step="0.01" size="small" />
                </div>

                <div>
                  <div class="flex justify-between mb-1">
                    <label class="text-sm text-gray-600">背景色 (Color)</label>
                  </div>
                  <el-color-picker v-model="color" show-alpha />
                </div>

                <div class="flex items-center justify-between">
                  <label class="text-sm text-gray-600">边框 (Outline)</label>
                  <el-switch v-model="outline" />
                </div>
              </div>
            </div>

            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCode">复制 CSS</el-button>
              </div>
              <pre class="text-gray-300 font-mono text-sm overflow-x-auto p-4 pt-10">{{ cssCode }}</pre>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
}
</style>
