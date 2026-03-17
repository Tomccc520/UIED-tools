<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Timer, Calendar, Refresh, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const loading = ref(false)
const result = ref<any>(null)
const currentTime = ref('')

// 获取倒数日数据
const fetchData = async () => {
  loading.value = true
  try {
    // 优先使用代理路径，生产环境使用完整路径
    const api = import.meta.env.DEV ? '/api/countdownday' : 'https://api.pearktrue.cn/api/countdownday/'
    const response = await fetch(api)
    const data = await response.json()

    if (data.code === 200) {
      result.value = data
      currentTime.value = data.time
    } else {
      ElMessage.warning(data.msg || '获取数据失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('服务暂时不可用，请稍后重试')
  } finally {
    loading.value = false
  }
}

const copyText = async () => {
  if (!result.value?.data) return
  try {
    await navigator.clipboard.writeText(result.value.data)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm min-h-[500px]">
        <!-- 头部区域 -->
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-orange-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-yellow-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
            摸鱼倒数日
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">工作再忙，也别忘了期待假期</p>
        </div>

        <!-- 内容区域 -->
        <div class="max-w-2xl mx-auto">
          <div v-if="loading && !result" class="py-20 text-center">
            <el-icon class="is-loading text-4xl text-orange-400">
              <Timer />
            </el-icon>
            <p class="mt-4 text-gray-500">正在计算假期距离...</p>
          </div>

          <div v-else-if="result" class="animate-fade-in">
            <!-- 当前时间卡片 -->
            <div
              class="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100 mb-8 text-center relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-orange-200 rounded-full -mr-12 -mt-12 opacity-20"></div>
              <div class="text-sm text-gray-500 mb-2">当前时间</div>
              <div class="text-2xl font-bold text-gray-800 font-mono">{{ currentTime }}</div>
            </div>

            <!-- 倒数日内容 -->
            <div
              class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 relative overflow-hidden hover:shadow-md transition-shadow text-center">
              <div class="whitespace-pre-wrap text-xl leading-loose text-gray-800 font-medium font-sans tracking-wide">
                {{ result.data }}
              </div>

              <!-- 装饰图标 -->
              <el-icon class="absolute bottom-4 right-4 text-9xl text-gray-50 opacity-10 rotate-12 pointer-events-none">
                <Calendar />
              </el-icon>
            </div>

            <!-- 操作按钮 -->
            <div class="mt-8 flex justify-center gap-4">
              <button @click="copyText" :disabled="loading"
                class="px-8 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                <el-icon>
                  <CopyDocument />
                </el-icon>
                <span class="font-medium">一键复制文案</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <ToolsRecommend :currentPath="route.path" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
