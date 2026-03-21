<!--
 * @file CarPrice.vue
 * @description 车辆价格查询工具
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
            <div class="w-64 h-64 bg-blue-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-cyan-400 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
            免费车辆价格查询
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">快速查询车辆指导价、经销商报价及配置信息</p>
        </div>

        <!-- 主要内容区域 -->
        <div class="max-w-4xl mx-auto">
          <!-- 查询表单 -->
          <div class="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-100 mb-8">
            <div class="flex flex-col sm:flex-row gap-4">
              <div class="flex-1">
                <el-input v-model="searchKeyword" placeholder="请输入具体车型，例如：法拉利296" size="large" class="custom-input"
                  @keyup.enter="searchCar" :prefix-icon="Search" />
              </div>
              <button @click="searchCar" :disabled="loading || !searchKeyword"
                class="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-[0.98] whitespace-nowrap">
                <el-icon class="mr-2" v-if="!loading">
                  <Search />
                </el-icon>
                <el-icon class="mr-2 is-loading" v-else>
                  <Loading />
                </el-icon>
                {{ loading ? '查询中...' : '查询价格' }}
              </button>
            </div>
            <p class="text-sm text-gray-400 mt-3 ml-1">提示：请输入具体型号以获取准确结果</p>
          </div>

          <!-- 查询结果 -->
          <div v-if="result" class="animate-fade-in">
            <div class="mb-4 text-gray-500 text-sm">
              共查询到 <span class="text-blue-600 font-bold">{{ result.count }}</span> 款车型
            </div>
            <div class="space-y-4">
              <div v-for="(item, index) in result.list" :key="index"
                class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="flex flex-col md:flex-row">
                  <!-- 车辆图片 -->
                  <div class="md:w-2/5 relative h-64 md:h-auto bg-gray-100 overflow-hidden group">
                    <img :src="item.cover_url || defaultImage" alt="车辆图片"
                      class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      @error="handleImageError" />
                    <div
                      class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    </div>
                  </div>

                  <!-- 车辆信息 -->
                  <div class="md:w-3/5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-800">{{ item.car_name }}</h3>
                        <span
                          class="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100 shrink-0 ml-2">{{
                            result.car || searchKeyword }}</span>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div class="text-sm text-gray-500 mb-1">厂商指导价</div>
                          <div class="text-lg font-bold text-gray-800">{{ item.price || '暂无数据' }}</div>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <div class="text-sm text-blue-500 mb-1">经销商报价</div>
                          <div class="text-xl font-bold text-red-600">{{ item.dealer_price || '暂无数据' }}</div>
                        </div>
                      </div>

                      <!-- 车辆标签 -->
                      <div v-if="item.tags && item.tags.length" class="mb-4">
                        <div class="text-sm text-gray-500 mb-2">配置亮点</div>
                        <div class="flex flex-wrap gap-2">
                          <span v-for="(tag, tagIndex) in item.tags" :key="tagIndex"
                            class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                            {{ tag }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="text-xs text-gray-400 mt-4 text-right">
                      数据仅供参考，实际价格请以当地经销商为准
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
            <p>未查询到相关车辆信息，请检查车型名称是否准确</p>
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
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Loading, Warning, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'

const route = useRoute()
const searchKeyword = ref('')
const loading = ref(false)
const searched = ref(false)
const result = ref<any>(null)
const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image'

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = defaultImage
}

const searchCar = async () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入车辆型号')
    return
  }

  loading.value = true
  searched.value = true
  result.value = null

  try {
    const response = await fetch(`https://api.pearktrue.cn/api/car/?search=${encodeURIComponent(searchKeyword.value.trim())}`)
    const data = await response.json()

    console.log('Car API Response:', data)

    if (data.code === 200) {
      // 检查 data.data 是否存在且有效
      if (data.data && Array.isArray(data.data)) {
        result.value = {
          list: data.data,
          car: data.car,
          count: data.count
        }
        ElMessage.success('查询成功')
      } else {
        ElMessage.warning('未查询到详细数据')
      }
    } else if (data.code === 201) {
      ElMessage.warning(data.msg || '暂无内容')
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
  box-shadow: 0 0 0 2px #0ea5e9 inset;
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
