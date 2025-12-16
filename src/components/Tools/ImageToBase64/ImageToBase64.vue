<script setup lang="ts">
import { ref } from 'vue';
import { UploadFilled, Delete, CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file ImageToBase64.vue
 * @description 图片转 Base64 工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const { toClipboard } = useClipboard();
const route = useRoute();

const imageUrl = ref('');
const base64String = ref('');
const fileInfo = ref<{ name: string; size: string; type: string } | null>(null);

const handleUpload = (file: any) => {
  const isImage = file.raw.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('请上传图片文件');
    return false;
  }

  // File reader to get base64
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    base64String.value = reader.result as string;
    imageUrl.value = base64String.value;
    
    fileInfo.value = {
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.raw.type
    };
  };
  
  return false;
};

const handleRemove = () => {
  imageUrl.value = '';
  base64String.value = '';
  fileInfo.value = null;
};

const copyBase64 = async () => {
  if (!base64String.value) return;
  try {
    await toClipboard(base64String.value);
    ElMessage.success('Base64 编码已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};

const copyImgTag = async () => {
  if (!base64String.value) return;
  const tag = `<img src="${base64String.value}" alt="${fileInfo.value?.name || 'image'}" />`;
  try {
    await toClipboard(tag);
    ElMessage.success('<img> 标签已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};

const copyCssBg = async () => {
  if (!base64String.value) return;
  const css = `background-image: url('${base64String.value}');`;
  try {
    await toClipboard(css);
    ElMessage.success('CSS 背景代码已复制');
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">图片转 Base64</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">在线将图片转换为 Base64 编码，支持一键复制 HTML 标签和 CSS 代码。</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- 上传区 -->
          <div class="upload-area mb-8" v-if="!imageUrl">
            <el-upload
              drag
              action="#"
              :auto-upload="false"
              :on-change="handleUpload"
              :show-file-list="false"
              accept="image/*"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                拖拽图片到此处或 <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip text-center">
                  支持所有常见图片格式，建议文件大小不超过 2MB 以免生成的字符串过长
                </div>
              </template>
            </el-upload>
          </div>

          <!-- 结果区 -->
          <div v-else class="flex flex-col md:flex-row gap-8">
            <!-- 左侧预览 -->
            <div class="w-full md:w-1/3 flex flex-col gap-4">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-center min-h-[200px] relative">
                <img :src="imageUrl" alt="Preview" class="max-w-full max-h-[300px] object-contain" />
                <div class="absolute top-2 right-2">
                  <el-button type="danger" circle size="small" :icon="Delete" @click="handleRemove" title="清除"></el-button>
                </div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600 space-y-2" v-if="fileInfo">
                <div class="flex justify-between">
                  <span>文件名:</span>
                  <span class="font-medium text-gray-800 truncate max-w-[150px]">{{ fileInfo.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span>大小:</span>
                  <span class="font-medium text-gray-800">{{ fileInfo.size }}</span>
                </div>
                <div class="flex justify-between">
                  <span>类型:</span>
                  <span class="font-medium text-gray-800">{{ fileInfo.type }}</span>
                </div>
              </div>
            </div>

            <!-- 右侧代码 -->
            <div class="w-full md:w-2/3 flex flex-col gap-4">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex-1 flex flex-col">
                <div class="flex justify-between items-center mb-2">
                  <h3 class="font-bold text-gray-700">Base64 字符串</h3>
                  <div class="flex gap-2">
                    <el-button type="primary" link size="small" @click="copyImgTag">复制 &lt;img&gt;</el-button>
                    <el-button type="primary" link size="small" @click="copyCssBg">复制 CSS</el-button>
                    <el-button type="primary" size="small" :icon="CopyDocument" @click="copyBase64">复制 Base64</el-button>
                  </div>
                </div>
                <textarea 
                  readonly 
                  v-model="base64String"
                  class="w-full flex-1 p-3 text-xs font-mono text-gray-500 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500"
                ></textarea>
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
.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
