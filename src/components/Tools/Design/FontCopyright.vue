<!--
 * @file FontCopyright.vue
 * @description 字体版权查询工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-20
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[600px]">
        <!-- 头部区域 -->
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-purple-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-pink-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            字体版权查询
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">快速查询字体版权信息，避免商用侵权风险</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="max-w-3xl mx-auto">
          <!-- 查询表单 -->
          <div class="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-100 mb-8">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <el-input v-model="fontName" placeholder="请输入字体名称，例如：微软雅黑" size="large" class="custom-input"
                  @keyup.enter="searchCopyright" :prefix-icon="Search" />
              </div>
              <button @click="searchCopyright" :disabled="loading || !fontName"
                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transform active:scale-[0.98] whitespace-nowrap">
                <el-icon class="mr-2" v-if="!loading">
                  <Search />
                </el-icon>
                <el-icon class="mr-2 is-loading" v-else>
                  <Loading />
                </el-icon>
                {{ loading ? '查询中...' : '查询版权' }}
              </button>
            </div>
            <p class="text-sm text-gray-400 mt-3 ml-1">提示：请输入准确的字体名称以获取更精确的结果</p>
          </div>

          <!-- 查询结果 -->
          <div v-if="result" class="animate-fade-in">
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div class="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 class="font-semibold text-gray-800 flex items-center">
                  <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                    <el-icon>
                      <InfoFilled />
                    </el-icon>
                  </span>
                  查询结果
                </h3>
                <span class="text-sm text-gray-500">{{ formatDate(new Date()) }}</span>
              </div>

              <div class="p-6 sm:p-8">
                <div class="space-y-6">
                  <!-- 字体名称 -->
                  <div class="flex items-center gap-4">
                    <div
                      class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xl shrink-0">
                      Aa
                    </div>
                    <div>
                      <div class="text-sm text-gray-500 mb-1">查询字体</div>
                      <div class="text-xl font-bold text-gray-800">{{ result.font || fontName }}</div>
                    </div>
                  </div>

                  <!-- 分割线 -->
                  <div class="h-px bg-gray-100"></div>

                  <!-- 版权详情 -->
                  <div>
                    <div class="flex items-center gap-2 mb-3">
                      <el-icon class="text-gray-400">
                        <InfoFilled />
                      </el-icon>
                      <span class="text-sm font-medium text-gray-700">版权信息详情</span>
                    </div>

                    <!-- 解析后的列表展示 -->
                    <div v-if="parsedData && parsedData.length > 0" class="space-y-3">
                      <div v-for="(item, index) in parsedData" :key="index"
                        class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div>
                            <div class="font-bold text-gray-800 text-lg">{{ item.cn_name }}</div>
                            <div class="text-sm text-gray-500 font-mono">{{ item.en_name }}</div>
                          </div>
                          <div class="shrink-0">
                            <span :class="[
                              'px-3 py-1 rounded-full text-xs font-medium',
                              item.is_pay.includes('免费') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            ]">
                              {{ item.is_pay }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 原始文本展示 (兼容旧格式或解析失败) -->
                    <div v-else
                      class="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100 shadow-sm relative overflow-hidden group">
                      <div
                        class="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-bl-full -mr-10 -mt-10 opacity-20 group-hover:opacity-30 transition-opacity">
                      </div>
                      {{ result.data || result.msg || '暂无详细版权信息' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态或错误提示 -->
          <div v-else-if="searched && !result"
            class="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <el-icon class="text-4xl mb-3 text-gray-300">
              <Warning />
            </el-icon>
            <p>未查询到相关信息，请尝试更换关键词</p>
          </div>

          <!-- 使用说明 -->
          <div class="mt-8 bg-white rounded-xl border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <el-icon class="mr-2 text-blue-500">
                <QuestionFilled />
              </el-icon>
              使用说明
            </h3>
            <ul class="space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>本工具用于查询字体是否可以免费商用。</li>
              <li>请输入准确的字体名称（如：微软雅黑、思源黑体）。</li>
              <li>查询结果仅供参考，具体授权情况请以字体官方声明为准。</li>
              <li>"商用需授权"表示该字体在商业使用时需要购买授权。</li>
              <li>数据来源于互联网，不保证100%准确，请谨慎使用。</li>
            </ul>
          </div>

        </div>
      </div>

      <div class="mt-4">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Loading, InfoFilled, Warning, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const fontName = ref('')
const loading = ref(false)
const searched = ref(false)
const result = ref<any>(null)

const parsedData = computed(() => {
  if (!result.value || !result.value.data) return []

  // 如果是字符串，尝试解析
  if (typeof result.value.data === 'string') {
    try {
      // 尝试解析 JSON 字符串
      const parsed = JSON.parse(result.value.data)
      if (Array.isArray(parsed)) return parsed
      return []
    } catch (e) {
      // 解析失败，可能就是普通字符串
      return []
    }
  }

  // 如果已经是数组
  if (Array.isArray(result.value.data)) {
    return result.value.data
  }

  return []
})

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const searchCopyright = async () => {
  if (!fontName.value.trim()) {
    ElMessage.warning('请输入字体名称')
    return
  }

  loading.value = true
  searched.value = true
  result.value = null

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/font/copyright.php?font=${encodeURIComponent(fontName.value.trim())}`)
    const data = await response.json()

    console.log('Font API Response:', data)

    if (data.code === '200' || data.code === 200) {
      result.value = data
      ElMessage.success('查询成功')
    } else {
      ElMessage.warning(data.msg || '未查询到相关结果')
    }
  } catch (error) {
    console.error('Search error:', error)
    ElMessage.error('查询服务异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  padding: 8px 12px;
  border-radius: 0.75rem;
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #d946ef inset;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
