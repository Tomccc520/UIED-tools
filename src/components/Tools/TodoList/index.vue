<!--
 * @file TodoList.vue
 * @description 待办清单工具组件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-26
 * @license MIT
-->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-4 md:p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">待办清单</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">极简风格的待办事项清单，支持任务管理、优先级设置，数据本地存储。</p>
        </div>

        <div class="max-w-2xl mx-auto">
          <!-- 输入区域 -->
          <div class="flex flex-col md:flex-row gap-4 mb-8">
            <div class="flex-1">
              <input v-model="newTask" @keyup.enter="addTask" type="text" placeholder="输入待办事项，按回车添加..."
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
            </div>
            <button @click="addTask"
              class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center font-medium">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              添加
            </button>
          </div>

          <!-- 任务列表 -->
          <div class="space-y-3">
            <div v-if="tasks.length === 0" class="text-center py-12 text-gray-400 bg-gray-50 rounded-lg">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p>暂无待办事项，开始规划你的一天吧！</p>
            </div>

            <transition-group name="list">
              <div v-for="task in sortedTasks" :key="task.id"
                class="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all duration-200"
                :class="{ 'bg-gray-50': task.completed }">
                <div class="flex items-center flex-1 gap-3">
                  <button @click="toggleTask(task)"
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'">
                    <svg v-if="task.completed" class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <span class="text-lg transition-all"
                    :class="task.completed ? 'text-gray-400 line-through' : 'text-gray-700'">
                    {{ task.content }}
                  </span>
                </div>
                <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="deleteTask(task.id)" class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="删除">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </transition-group>
          </div>

          <!-- 统计信息 -->
          <div v-if="tasks.length > 0"
            class="mt-6 flex justify-between items-center text-sm text-gray-500 border-t pt-4">
            <span>{{ activeTasksCount }} 个未完成任务</span>
            <div class="space-x-4">
              <button @click="clearCompleted" class="hover:text-red-500 transition-colors"
                v-if="completedTasksCount > 0">
                清除已完成
              </button>
              <button @click="clearAll" class="hover:text-red-500 transition-colors">
                清空列表
              </button>
            </div>
          </div>
        </div>

        <!-- 使用说明 -->
        <UsageGuide :steps="guideSteps" :notes="guideNotes" />
      </div>
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import UsageGuide from '@/components/Common/UsageGuide.vue'

const route = useRoute()
const newTask = ref('')

interface Task {
  id: number
  content: string
  completed: boolean
  createdAt: number
}

const tasks = ref<Task[]>([])

// 从本地存储加载数据
onMounted(() => {
  const savedTasks = localStorage.getItem('todo-list')
  if (savedTasks) {
    try {
      tasks.value = JSON.parse(savedTasks)
    } catch (e) {
      console.error('Failed to load tasks', e)
    }
  }
})

// 监听变化保存到本地存储
watch(tasks, (newTasks) => {
  localStorage.setItem('todo-list', JSON.stringify(newTasks))
}, { deep: true })

const sortedTasks = computed(() => {
  return [...tasks.value].sort((a, b) => {
    // 未完成的排在前面
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // 同状态下按创建时间倒序
    return b.createdAt - a.createdAt
  })
})

const activeTasksCount = computed(() => tasks.value.filter(t => !t.completed).length)
const completedTasksCount = computed(() => tasks.value.filter(t => t.completed).length)

const addTask = () => {
  const content = newTask.value.trim()
  if (!content) return

  tasks.value.unshift({
    id: Date.now(),
    content,
    completed: false,
    createdAt: Date.now()
  })

  newTask.value = ''
  ElMessage.success('添加成功')
}

const toggleTask = (task: Task) => {
  task.completed = !task.completed
}

const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
  ElMessage.success('已删除')
}

const clearCompleted = () => {
  ElMessageBox.confirm('确定要清除所有已完成的任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tasks.value = tasks.value.filter(t => !t.completed)
    ElMessage.success('已清除')
  }).catch(() => { })
}

const clearAll = () => {
  ElMessageBox.confirm('确定要清空所有任务吗？此操作不可恢复。', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tasks.value = []
    ElMessage.success('已清空')
  }).catch(() => { })
}

const guideSteps = [
  { title: '添加任务', description: '在输入框中输入待办事项内容，按回车键或点击"添加"按钮即可创建新任务。' },
  { title: '管理任务', description: '点击任务左侧的圆圈可标记完成状态，点击右侧的删除图标可移除任务。' },
  { title: '清理数据', description: '底部工具栏支持一键清除已完成任务或清空所有任务列表。' }
]

const guideNotes = [
  '所有数据均保存在您的浏览器本地存储（LocalStorage）中。',
  '关闭浏览器或刷新页面后，数据依然存在。',
  '建议定期清理已完成的任务，保持列表整洁。',
  '清除浏览器缓存可能会导致数据丢失，请注意备份重要信息。'
]
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
