<script setup lang="ts">
import { ref, computed } from 'vue';
import { CopyDocument, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file Percentage.vue
 * @description 百分比计算器
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const { toClipboard } = useClipboard();
const route = useRoute();

// 1. X 是 Y 的百分之多少？
const calc1 = ref({ val1: undefined as number | undefined, val2: undefined as number | undefined });
const result1 = computed(() => {
  const { val1, val2 } = calc1.value;
  if (val1 === undefined || val2 === undefined || val2 === 0) return '';
  return ((val1 / val2) * 100).toFixed(2) + '%';
});

// 2. Y 的 X% 是多少？
const calc2 = ref({ val1: undefined as number | undefined, val2: undefined as number | undefined });
const result2 = computed(() => {
  const { val1, val2 } = calc2.value; // val1 is %, val2 is total
  if (val1 === undefined || val2 === undefined) return '';
  return ((val2 * val1) / 100).toFixed(2);
});

// 3. X 增加/减少 Y% 是多少？
const calc3 = ref({ val1: undefined as number | undefined, val2: undefined as number | undefined, type: 'increase' });
const result3 = computed(() => {
  const { val1, val2, type } = calc3.value;
  if (val1 === undefined || val2 === undefined) return '';
  const factor = type === 'increase' ? (1 + val2 / 100) : (1 - val2 / 100);
  return (val1 * factor).toFixed(2);
});

// 4. 从 X 到 Y 的变化率是多少？
const calc4 = ref({ val1: undefined as number | undefined, val2: undefined as number | undefined });
const result4 = computed(() => {
  const { val1, val2 } = calc4.value;
  if (val1 === undefined || val2 === undefined || val1 === 0) return '';
  const change = val2 - val1;
  const percent = (change / val1) * 100;
  return (percent > 0 ? '+' : '') + percent.toFixed(2) + '%';
});

const copyResult = async (text: string) => {
  if (!text) return;
  try {
    await toClipboard(text);
    ElMessage.success('复制成功');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};

const clearAll = () => {
  calc1.value = { val1: undefined, val2: undefined };
  calc2.value = { val1: undefined, val2: undefined };
  calc3.value = { val1: undefined, val2: undefined, type: 'increase' };
  calc4.value = { val1: undefined, val2: undefined };
};
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">百分比计算器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">常用的百分比计算工具，解决各类百分比换算问题。</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="flex justify-end mb-6">
            <el-button type="info" plain :icon="RefreshRight" @click="clearAll">清空所有</el-button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Card 1 -->
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center">
                <span
                  class="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
                百分比占比
              </h3>
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <el-input-number v-model="calc1.val1" :controls="false" placeholder="数值 A" class="w-24" />
                <span class="text-gray-500">是</span>
                <el-input-number v-model="calc1.val2" :controls="false" placeholder="数值 B" class="w-24" />
                <span class="text-gray-500">的百分之多少？</span>
              </div>
              <div class="result-box">
                <span class="label">结果：</span>
                <span class="value text-blue-600">{{ result1 || '--' }}</span>
                <el-button v-if="result1" link :icon="CopyDocument" @click="copyResult(result1)"
                  class="ml-2"></el-button>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center">
                <span
                  class="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                数值计算
              </h3>
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <el-input-number v-model="calc2.val2" :controls="false" placeholder="数值" class="w-24" />
                <span class="text-gray-500">的</span>
                <el-input-number v-model="calc2.val1" :controls="false" placeholder="百分比" class="w-20" />
                <span class="text-gray-500">% 是多少？</span>
              </div>
              <div class="result-box">
                <span class="label">结果：</span>
                <span class="value text-green-600">{{ result2 || '--' }}</span>
                <el-button v-if="result2" link :icon="CopyDocument" @click="copyResult(result2)"
                  class="ml-2"></el-button>
              </div>
            </div>

            <!-- Card 3 -->
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center">
                <span
                  class="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                增长/减少量
              </h3>
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <el-input-number v-model="calc3.val1" :controls="false" placeholder="数值" class="w-24" />
                <el-select v-model="calc3.type" class="w-24">
                  <el-option label="增加" value="increase" />
                  <el-option label="减少" value="decrease" />
                </el-select>
                <el-input-number v-model="calc3.val2" :controls="false" placeholder="百分比" class="w-20" />
                <span class="text-gray-500">% 后是？</span>
              </div>
              <div class="result-box">
                <span class="label">结果：</span>
                <span class="value text-purple-600">{{ result3 || '--' }}</span>
                <el-button v-if="result3" link :icon="CopyDocument" @click="copyResult(result3)"
                  class="ml-2"></el-button>
              </div>
            </div>

            <!-- Card 4 -->
            <div class="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <h3 class="font-bold text-gray-700 mb-4 flex items-center">
                <span
                  class="bg-orange-100 text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">4</span>
                变化率
              </h3>
              <div class="flex items-center gap-2 mb-4 flex-wrap">
                <span class="text-gray-500">从</span>
                <el-input-number v-model="calc4.val1" :controls="false" placeholder="数值 A" class="w-24" />
                <span class="text-gray-500">变成</span>
                <el-input-number v-model="calc4.val2" :controls="false" placeholder="数值 B" class="w-24" />
                <span class="text-gray-500">变化了多少？</span>
              </div>
              <div class="result-box">
                <span class="label">结果：</span>
                <span class="value text-orange-600">{{ result4 || '--' }}</span>
                <el-button v-if="result4" link :icon="CopyDocument" @click="copyResult(result4)"
                  class="ml-2"></el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.result-box {
  @apply bg-white p-3 rounded border border-gray-200 flex items-center;
}

.result-box .label {
  @apply text-gray-500 text-sm mr-2;
}

.result-box .value {
  @apply text-xl font-bold font-mono;
}
</style>
