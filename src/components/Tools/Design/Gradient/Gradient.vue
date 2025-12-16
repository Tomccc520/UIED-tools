<script setup lang="ts">
import { ref, computed } from 'vue';
import { CopyDocument, RefreshLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file Gradient.vue
 * @description CSS 渐变生成器
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const { toClipboard } = useClipboard();
const route = useRoute();

const type = ref('linear');
const angle = ref(90);
const color1 = ref('#4158D0');
const color2 = ref('#C850C0');
const color3 = ref('#FFCC70'); // Optional third color

const useThreeColors = ref(true);

const gradientCss = computed(() => {
  const direction = type.value === 'linear' ? `${angle.value}deg` : 'circle';
  const colors = useThreeColors.value 
    ? `${color1.value}, ${color2.value}, ${color3.value}`
    : `${color1.value}, ${color2.value}`;
  
  return `background-image: ${type.value}-gradient(${direction}, ${colors});`;
});

const copyCss = async () => {
  try {
    await toClipboard(gradientCss.value);
    ElMessage.success('CSS 代码已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};

const randomColor = () => {
  const r = () => Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
  return `#${r()}${r()}${r()}`;
};

const randomize = () => {
  color1.value = randomColor();
  color2.value = randomColor();
  if (useThreeColors.value) color3.value = randomColor();
  angle.value = Math.floor(Math.random() * 360);
};
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">CSS 渐变生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线生成精美的 CSS 线性渐变和径向渐变背景代码。</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <!-- Preview -->
          <div class="flex-1 rounded-xl overflow-hidden min-h-[400px] shadow-inner border border-gray-100 relative group transition-all duration-500"
            :style="gradientCss">
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg text-gray-800 font-mono text-sm">
                Preview
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="w-full lg:w-96 flex flex-col gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-800">参数设置</h3>
                <el-button link :icon="RefreshLeft" @click="randomize">随机颜色</el-button>
              </div>

              <div class="space-y-6">
                <!-- Type -->
                <div>
                  <label class="text-sm text-gray-600 block mb-2">类型 (Type)</label>
                  <el-radio-group v-model="type" size="small">
                    <el-radio-button label="linear">线性 (Linear)</el-radio-button>
                    <el-radio-button label="radial">径向 (Radial)</el-radio-button>
                  </el-radio-group>
                </div>

                <!-- Angle -->
                <div v-if="type === 'linear'">
                  <div class="flex justify-between mb-1">
                    <label class="text-sm text-gray-600">角度 (Angle)</label>
                    <span class="text-sm text-gray-400">{{ angle }}°</span>
                  </div>
                  <el-slider v-model="angle" :min="0" :max="360" size="small" />
                </div>

                <!-- Colors -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm text-gray-600">颜色节点</label>
                    <el-checkbox v-model="useThreeColors" label="使用三色" size="small" />
                  </div>
                  
                  <div class="flex gap-4">
                    <div class="flex-1">
                      <el-color-picker v-model="color1" show-alpha class="w-full" />
                      <div class="text-xs text-gray-400 mt-1 text-center">{{ color1 }}</div>
                    </div>
                    <div class="flex-1">
                      <el-color-picker v-model="color2" show-alpha class="w-full" />
                      <div class="text-xs text-gray-400 mt-1 text-center">{{ color2 }}</div>
                    </div>
                    <div class="flex-1" v-if="useThreeColors">
                      <el-color-picker v-model="color3" show-alpha class="w-full" />
                      <div class="text-xs text-gray-400 mt-1 text-center">{{ color3 }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <pre class="text-gray-300 font-mono text-sm overflow-x-auto p-4 pt-10 break-all whitespace-pre-wrap">{{ gradientCss }}</pre>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
:deep(.el-color-picker__trigger) {
  width: 100%;
  padding: 2px;
  border-radius: 8px;
}
</style>
