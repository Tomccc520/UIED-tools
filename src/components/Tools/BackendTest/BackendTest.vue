<!--
 * @file BackendTest.vue
 * @description 测试后端API对接的页面
 * @createDate 2024-03-22
 -->
<template>
  <div class="backend-test">
    <h1 class="text-2xl font-bold mb-6">后端 API 对接测试</h1>

    <!-- 接口测试面板 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- GET请求测试 -->
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-medium mb-4 flex items-center">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">GET</span>
          <span>获取数据测试</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">请求参数</label>
            <el-input
              v-model="getParams"
              placeholder="参数格式：key1=value1&key2=value2"
              class="w-full"
            />
          </div>

          <div class="flex justify-end">
            <el-button
              type="primary"
              :loading="getLoading"
              @click="handleGetTest"
            >
              发送GET请求
            </el-button>
          </div>

          <div v-if="getResult" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">响应结果</label>
            <div class="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
              <pre class="text-sm">{{ JSON.stringify(getResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- POST请求测试 -->
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-medium mb-4 flex items-center">
          <span class="bg-green-100 text-green-800 px-2 py-1 rounded-md mr-2">POST</span>
          <span>提交数据测试</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">请求体 (JSON)</label>
            <el-input
              v-model="postData"
              type="textarea"
              :rows="5"
              placeholder='{"key": "value"}'
              class="w-full"
            />
          </div>

          <div class="flex justify-end">
            <el-button
              type="success"
              :loading="postLoading"
              @click="handlePostTest"
            >
              发送POST请求
            </el-button>
          </div>

          <div v-if="postResult" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">响应结果</label>
            <div class="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
              <pre class="text-sm">{{ JSON.stringify(postResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- PUT请求测试 -->
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-medium mb-4 flex items-center">
          <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md mr-2">PUT</span>
          <span>更新数据测试</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">资源ID</label>
            <el-input
              v-model="putId"
              placeholder="请输入要更新的资源ID"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">请求体 (JSON)</label>
            <el-input
              v-model="putData"
              type="textarea"
              :rows="3"
              placeholder='{"key": "value"}'
              class="w-full"
            />
          </div>

          <div class="flex justify-end">
            <el-button
              type="warning"
              :loading="putLoading"
              @click="handlePutTest"
            >
              发送PUT请求
            </el-button>
          </div>

          <div v-if="putResult" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">响应结果</label>
            <div class="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
              <pre class="text-sm">{{ JSON.stringify(putResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- DELETE请求测试 -->
      <div class="border rounded-lg p-6 bg-white shadow-sm">
        <h3 class="text-lg font-medium mb-4 flex items-center">
          <span class="bg-red-100 text-red-800 px-2 py-1 rounded-md mr-2">DELETE</span>
          <span>删除数据测试</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">资源ID</label>
            <el-input
              v-model="deleteId"
              placeholder="请输入要删除的资源ID"
              class="w-full"
            />
          </div>

          <div class="flex justify-end">
            <el-button
              type="danger"
              :loading="deleteLoading"
              @click="handleDeleteTest"
            >
              发送DELETE请求
            </el-button>
          </div>

          <div v-if="deleteResult" class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">响应结果</label>
            <div class="bg-gray-50 p-4 rounded-md overflow-auto max-h-60">
              <pre class="text-sm">{{ JSON.stringify(deleteResult, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 接口说明 -->
    <div class="mt-8 p-6 border rounded-lg bg-blue-50">
      <h3 class="text-lg font-medium mb-4">接口说明</h3>
      <ul class="list-disc pl-5 space-y-2 text-gray-700">
        <li><strong>GET 请求</strong>：从后端获取数据，参数拼接在URL中</li>
        <li><strong>POST 请求</strong>：向后端提交数据，数据包含在请求体中</li>
        <li><strong>PUT 请求</strong>：更新后端指定ID的资源，数据包含在请求体中</li>
        <li><strong>DELETE 请求</strong>：删除后端指定ID的资源</li>
      </ul>
      <div class="mt-4 text-sm bg-yellow-100 p-4 rounded-md">
        <p class="font-medium text-yellow-800">注意:</p>
        <p class="mt-1 text-yellow-700">这个测试页面仅用于验证前后端通信是否正常。实际项目中应该根据具体API接口定义来设计相应的请求模块。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import apiTest from '@/api/backend-test'

// GET请求相关
const getParams = ref('')
const getLoading = ref(false)
const getResult = ref<any>(null)

// POST请求相关
const postData = ref('{\n  "name": "测试",\n  "age": 25\n}')
const postLoading = ref(false)
const postResult = ref<any>(null)

// PUT请求相关
const putId = ref('')
const putData = ref('{\n  "name": "更新的测试",\n  "age": 26\n}')
const putLoading = ref(false)
const putResult = ref<any>(null)

// DELETE请求相关
const deleteId = ref('')
const deleteLoading = ref(false)
const deleteResult = ref<any>(null)

// 处理GET请求测试
async function handleGetTest() {
  if (getLoading.value) return

  getLoading.value = true
  getResult.value = null

  try {
    // 解析URL参数
    const params: Record<string, string> = {}
    if (getParams.value) {
      getParams.value.split('&').forEach(param => {
        const [key, value] = param.split('=')
        if (key && value) {
          params[key] = value
        }
      })
    }

    const result = await apiTest.getTest(params)
    getResult.value = result
    ElMessage.success('GET请求成功')
  } catch (error: any) {
    ElMessage.error(`GET请求失败: ${error.message || '未知错误'}`)
    console.error('GET请求错误:', error)
  } finally {
    getLoading.value = false
  }
}

// 处理POST请求测试
async function handlePostTest() {
  if (postLoading.value) return

  postLoading.value = true
  postResult.value = null

  try {
    // 解析JSON数据
    let data = {}
    try {
      data = JSON.parse(postData.value)
    } catch (e) {
      throw new Error('JSON格式错误')
    }

    const result = await apiTest.postTest(data)
    postResult.value = result
    ElMessage.success('POST请求成功')
  } catch (error: any) {
    ElMessage.error(`POST请求失败: ${error.message || '未知错误'}`)
    console.error('POST请求错误:', error)
  } finally {
    postLoading.value = false
  }
}

// 处理PUT请求测试
async function handlePutTest() {
  if (putLoading.value) return
  if (!putId.value) {
    ElMessage.warning('请输入资源ID')
    return
  }

  putLoading.value = true
  putResult.value = null

  try {
    // 解析JSON数据
    let data = {}
    try {
      data = JSON.parse(putData.value)
    } catch (e) {
      throw new Error('JSON格式错误')
    }

    const result = await apiTest.putTest(putId.value, data)
    putResult.value = result
    ElMessage.success('PUT请求成功')
  } catch (error: any) {
    ElMessage.error(`PUT请求失败: ${error.message || '未知错误'}`)
    console.error('PUT请求错误:', error)
  } finally {
    putLoading.value = false
  }
}

// 处理DELETE请求测试
async function handleDeleteTest() {
  if (deleteLoading.value) return
  if (!deleteId.value) {
    ElMessage.warning('请输入资源ID')
    return
  }

  deleteLoading.value = true
  deleteResult.value = null

  try {
    const result = await apiTest.deleteTest(deleteId.value)
    deleteResult.value = result
    ElMessage.success('DELETE请求成功')
  } catch (error: any) {
    ElMessage.error(`DELETE请求失败: ${error.message || '未知错误'}`)
    console.error('DELETE请求错误:', error)
  } finally {
    deleteLoading.value = false
  }
}
</script>

<style scoped>
.backend-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>