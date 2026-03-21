<script setup lang="ts">
import { ref, computed } from 'vue';
import { CopyDocument, Picture } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import { useRoute } from 'vue-router';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

/**
 * @file MetaTags.vue
 * @description Meta 标签生成器
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 */

const { toClipboard } = useClipboard();
const route = useRoute();

const title = ref('My Awesome Page Title');
const description = ref('This is a description of my page content. It should be concise and engaging to attract clicks.');
const imageUrl = ref('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80');
const url = ref('https://example.com/page');
const siteName = ref('My Website');

const previewType = ref<'facebook' | 'twitter'>('facebook');

const metaTags = computed(() => {
  return `<!-- Primary Meta Tags -->
<title>${title.value}</title>
<meta name="title" content="${title.value}">
<meta name="description" content="${description.value}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url.value}">
<meta property="og:title" content="${title.value}">
<meta property="og:description" content="${description.value}">
<meta property="og:image" content="${imageUrl.value}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url.value}">
<meta property="twitter:title" content="${title.value}">
<meta property="twitter:description" content="${description.value}">
<meta property="twitter:image" content="${imageUrl.value}">`;
});

const copyCode = async () => {
  try {
    await toClipboard(metaTags.value);
    ElMessage.success('Meta 标签代码已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};
const getHostname = (u: string) => {
  try {
    return new URL(u).hostname;
  } catch (e) {
    return 'example.com';
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
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">Meta 标签生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">生成网页 SEO 及社交媒体分享所需的 Meta 标签，并实时预览分享效果。</p>
        </div>

        <div class="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          <!-- Inputs -->
          <div class="w-full lg:w-1/2 flex flex-col gap-6">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <h3 class="font-bold text-gray-800 mb-2">网页信息</h3>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">网页标题 (Title)</label>
                <el-input v-model="title" placeholder="输入标题" />
                <div class="text-xs text-gray-400 mt-1 text-right">{{ title.length }}/60 建议</div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">网页描述 (Description)</label>
                <el-input v-model="description" type="textarea" :rows="3" placeholder="输入描述" resize="none" />
                <div class="text-xs text-gray-400 mt-1 text-right">{{ description.length }}/160 建议</div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">封面图片 URL (Image)</label>
                <el-input v-model="imageUrl" placeholder="https://example.com/image.jpg">
                  <template #prefix><el-icon>
                      <Picture />
                    </el-icon></template>
                </el-input>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">网页 URL</label>
                  <el-input v-model="url" placeholder="https://example.com" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">网站名称</label>
                  <el-input v-model="siteName" placeholder="My Website" />
                </div>
              </div>
            </div>

            <!-- Code Block -->
            <div class="bg-gray-900 rounded-xl p-4 relative group flex-1 min-h-[200px]">
              <div class="absolute top-4 right-4">
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCode">复制 HTML</el-button>
              </div>
              <pre class="text-gray-300 font-mono text-xs overflow-x-auto p-4 pt-10 h-full">{{ metaTags }}</pre>
            </div>
          </div>

          <!-- Preview -->
          <div class="w-full lg:w-1/2">
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 h-full">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-bold text-gray-800">社交媒体预览</h3>
                <el-radio-group v-model="previewType" size="small">
                  <el-radio-button label="facebook">Facebook / LinkedIn</el-radio-button>
                  <el-radio-button label="twitter">Twitter</el-radio-button>
                </el-radio-group>
              </div>

              <div
                class="flex items-center justify-center min-h-[300px] bg-white rounded-lg border border-gray-200 p-8">

                <!-- Facebook Card Style -->
                <div v-if="previewType === 'facebook'" class="w-full max-w-md bg-[#F0F2F5] p-4 rounded-lg">
                  <div class="bg-white border border-gray-300 rounded overflow-hidden">
                    <div class="h-48 bg-gray-200 bg-cover bg-center" :style="{ backgroundImage: `url(${imageUrl})` }">
                    </div>
                    <div class="p-3 bg-[#F2F3F5] border-t border-gray-200">
                      <div class="text-xs text-gray-500 uppercase truncate mb-1">{{ getHostname(url) }}
                      </div>
                      <div class="font-bold text-gray-900 leading-tight mb-1 truncate">{{ title }}</div>
                      <div class="text-sm text-gray-600 line-clamp-1">{{ description }}</div>
                    </div>
                  </div>
                </div>

                <!-- Twitter Card Style -->
                <div v-else class="w-full max-w-md">
                  <div
                    class="bg-white border border-gray-200 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors cursor-pointer">
                    <div class="h-48 bg-gray-200 bg-cover bg-center" :style="{ backgroundImage: `url(${imageUrl})` }">
                    </div>
                    <div class="p-3">
                      <div class="font-bold text-gray-900 leading-tight mb-1">{{ title }}</div>
                      <div class="text-sm text-gray-600 line-clamp-2 mb-1">{{ description }}</div>
                      <div class="text-sm text-gray-500 flex items-center gap-1">
                        <span class="text-gray-400">🔗</span> {{ getHostname(url) }}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>
