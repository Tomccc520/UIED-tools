<script setup lang="ts">
import { ref, computed } from 'vue';
import { UploadFilled, Delete, CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file ImageColor.vue
 * @description 图片主色调提取工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const { toClipboard } = useClipboard();
const route = useRoute();

interface ColorItem {
  hex: string;
  rgb: string;
  count: number;
  percent: string;
}

const fileList = ref<any[]>([]);
const imageUrl = ref('');
const colors = ref<ColorItem[]>([]);
const isAnalyzing = ref(false);
const showResult = ref(false);

const handleUpload = (file: any) => {
  const isImage = file.raw.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请上传图片文件');
    return false;
  }

  imageUrl.value = URL.createObjectURL(file.raw);
  fileList.value = [file];
  analyzeColors(imageUrl.value);
  return false; // 阻止自动上传
};

const handleRemove = () => {
  imageUrl.value = '';
  fileList.value = [];
  colors.value = [];
  showResult.value = false;
};

const analyzeColors = (src: string) => {
  isAnalyzing.value = true;
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.src = src;

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 缩放图片以加快处理速度
    const scale = Math.min(1, 200 / Math.max(img.width, img.height));
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    if (!ctx) {
      isAnalyzing.value = false;
      return;
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const colorCounts: Record<string, number> = {};
    const totalPixels = canvas.width * canvas.height;

    // 简单的色彩量化 (Quantization)
    const step = 4; // 采样步长
    for (let i = 0; i < imageData.length; i += 4 * step) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];

      if (a < 128) continue; // 忽略透明像素

      // 降低色彩精度以归类相似颜色 (例如每16个值归为一类)
      const bucketSize = 24;
      const rBin = Math.floor(r / bucketSize) * bucketSize;
      const gBin = Math.floor(g / bucketSize) * bucketSize;
      const bBin = Math.floor(b / bucketSize) * bucketSize;

      const key = `${rBin},${gBin},${bBin}`;
      colorCounts[key] = (colorCounts[key] || 0) + 1;
    }

    // 转换为数组并排序
    const sortedColors = Object.entries(colorCounts)
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        // 取每个bucket的中心值作为显示颜色
        const rFinal = Math.min(255, r + 12);
        const gFinal = Math.min(255, g + 12);
        const bFinal = Math.min(255, b + 12);
        const hex = rgbToHex(rFinal, gFinal, bFinal);
        return {
          hex,
          rgb: `rgb(${rFinal}, ${gFinal}, ${bFinal})`,
          count,
          percent: ''
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 12); // 取前12个主色

    // 计算百分比 (相对于采样点总数)
    const sampledTotal = Object.values(colorCounts).reduce((a, b) => a + b, 0);
    sortedColors.forEach(c => {
      c.percent = ((c.count / sampledTotal) * 100).toFixed(1) + '%';
    });

    colors.value = sortedColors;
    isAnalyzing.value = false;
    showResult.value = true;
  };

  img.onerror = () => {
    ElMessage.error('图片加载失败');
    isAnalyzing.value = false;
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

const copyColor = async (text: string) => {
  try {
    await toClipboard(text);
    ElMessage.success(`已复制: ${text}`);
  } catch (e) {
    ElMessage.error('复制失败');
  }
};
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">图片主色调提取</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">上传图片，自动分析并提取图片中的主要颜色，生成配色方案。</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="upload-area mb-8" v-if="!imageUrl">
            <el-upload drag action="#" :auto-upload="false" :on-change="handleUpload" :show-file-list="false"
              accept="image/*">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip text-center">
                  支持 JPG/PNG/WebP 格式，建议文件大小不超过 5MB
                </div>
              </template>
            </el-upload>
          </div>

          <div v-else class="preview-area flex flex-col md:flex-row gap-8">
            <div
              class="image-preview flex-1 relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 min-h-[300px]">
              <img :src="imageUrl" alt="Preview" class="max-w-full max-h-[500px] object-contain" />
              <div class="absolute top-2 right-2">
                <el-button type="danger" circle :icon="Delete" @click="handleRemove" title="重新上传"></el-button>
              </div>
            </div>

            <div class="colors-panel flex-1" v-if="showResult">
              <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>提取结果</span>
                <span class="text-sm text-gray-500 font-normal">点击颜色块复制 HEX</span>
              </h3>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div v-for="color in colors" :key="color.hex" class="color-card group cursor-pointer"
                  @click="copyColor(color.hex)">
                  <div
                    class="h-20 rounded-t-lg shadow-inner relative transition-transform transform group-hover:scale-105"
                    :style="{ backgroundColor: color.hex }">
                    <div
                      class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 text-white font-medium">
                      复制
                    </div>
                  </div>
                  <div class="bg-gray-50 p-3 rounded-b-lg border border-t-0 border-gray-100 text-sm">
                    <div class="font-bold text-gray-800 mb-1 flex justify-between">
                      <span>{{ color.hex }}</span>
                      <el-icon class="text-gray-400 group-hover:text-blue-500">
                        <CopyDocument />
                      </el-icon>
                    </div>
                    <div class="text-xs text-gray-500 mb-1">{{ color.rgb }}</div>
                    <div class="text-xs text-gray-400">占比: {{ color.percent }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="flex-1 flex items-center justify-center">
              <el-skeleton animated />
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
