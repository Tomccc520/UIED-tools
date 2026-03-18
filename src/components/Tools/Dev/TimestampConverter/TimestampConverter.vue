<!--
 * @file TimestampConverter.vue
 * @description 时间戳转换工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CopyDocument, Refresh, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import dayjs from 'dayjs'
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

// Current Time
const now = ref(dayjs())
const isPaused = ref(false)
let timer: any = null

// Converter
const timestampInput = ref('')
const dateOutput = ref('')
const dateInput = ref('')
const timestampOutput = ref('')
const unit = ref<'s' | 'ms'>('s')

const updateNow = () => {
  if (!isPaused.value) {
    now.value = dayjs()
  }
}

const togglePause = () => {
  isPaused.value = !isPaused.value
}

const convertTimestamp = () => {
  if (!timestampInput.value) {
    dateOutput.value = ''
    return
  }
  
  let ts = parseInt(timestampInput.value)
  if (isNaN(ts)) {
    dateOutput.value = '无效的时间戳'
    return
  }
  
  // Auto detect unit if not specified (rough guess)
  // If > 10 digits, assume ms, else s
  if (timestampInput.value.length > 10 && unit.value === 's') {
    // User might have pasted ms but unit is s
    // Let's respect unit selector primarily, but maybe show warning?
    // For now, simple logic based on unit selector
  }
  
  if (unit.value === 's') {
    ts *= 1000
  }
  
  dateOutput.value = dayjs(ts).format('YYYY-MM-DD HH:mm:ss')
}

const convertDate = () => {
  if (!dateInput.value) {
    timestampOutput.value = ''
    return
  }
  
  const d = dayjs(dateInput.value)
  if (!d.isValid()) {
    timestampOutput.value = '无效的日期格式'
    return
  }
  
  let ts = d.valueOf()
  if (unit.value === 's') {
    ts = Math.floor(ts / 1000)
  }
  
  timestampOutput.value = ts.toString()
}

const copyText = async (text: string) => {
  if (!text) return
  try {
    await toClipboard(text)
    ElMessage.success('复制成功')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  timer = setInterval(updateNow, 1000)
  // Init inputs
  timestampInput.value = Math.floor(Date.now() / 1000).toString()
  convertTimestamp()
  dateInput.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  convertDate()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="">
    <div class="mx-auto">
      <div class="bg-white rounded-xl shadow-sm">
        <div class="text-center py-8 px-4">
          <h2 class="text-3xl font-bold mb-3 text-gray-800">免费时间戳转换</h2>
          <p class="text-gray-500 text-sm mt-4">在线 Unix 时间戳与北京时间相互转换工具</p>
        </div>

        <div class="px-8 pb-8">
          <!-- Current Time -->
          <div class="bg-blue-50 rounded-lg p-6 mb-8 text-center">
            <div class="text-sm text-gray-600 mb-2">当前时间</div>
            <div class="text-3xl font-mono font-bold text-blue-600 mb-2">
              {{ now.unix() }}
            </div>
            <div class="text-lg text-gray-700 mb-4">
              {{ now.format('YYYY-MM-DD HH:mm:ss') }}
            </div>
            <el-button :type="isPaused ? 'warning' : 'primary'" size="small" @click="togglePause">
              <el-icon class="mr-1">
                <component :is="isPaused ? VideoPlay : VideoPause" />
              </el-icon>
              {{ isPaused ? '继续' : '暂停' }}
            </el-button>
          </div>

          <div class="flex flex-col gap-8">
            <!-- Timestamp to Date -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="w-1 h-4 bg-blue-500 rounded mr-2"></span>
                时间戳转日期
              </h3>
              <div class="flex flex-col md:flex-row gap-4 items-center">
                <div class="flex-1 flex gap-2">
                  <el-input v-model="timestampInput" placeholder="请输入时间戳" @input="convertTimestamp">
                    <template #append>
                      <el-select v-model="unit" placeholder="单位" style="width: 80px" @change="convertTimestamp">
                        <el-option label="秒(s)" value="s" />
                        <el-option label="毫秒(ms)" value="ms" />
                      </el-select>
                    </template>
                  </el-input>
                </div>
                <div class="text-gray-400 hidden md:block">👉</div>
                <div class="flex-1 flex gap-2">
                  <el-input v-model="dateOutput" readonly placeholder="转换结果" />
                  <el-button @click="copyText(dateOutput)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- Date to Timestamp -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="font-bold text-gray-800 mb-4 flex items-center">
                <span class="w-1 h-4 bg-green-500 rounded mr-2"></span>
                日期转时间戳
              </h3>
              <div class="flex flex-col md:flex-row gap-4 items-center">
                <div class="flex-1">
                  <el-input v-model="dateInput" placeholder="YYYY-MM-DD HH:mm:ss" @input="convertDate" />
                </div>
                <div class="text-gray-400 hidden md:block">👉</div>
                <div class="flex-1 flex gap-2">
                  <el-input v-model="timestampOutput" readonly placeholder="转换结果">
                     <template #append>
                      <span class="text-gray-500 text-xs">{{ unit === 's' ? '秒' : '毫秒' }}</span>
                    </template>
                  </el-input>
                  <el-button @click="copyText(timestampOutput)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ToolsRecommend />
  </div>
</template>
