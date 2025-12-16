<script setup lang="ts">
/**
 * @file BlobMaker.vue
 * @description Blob 形状生成器，生成随机的流体形状 SVG
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

import { ref, computed, onMounted } from 'vue'
import { CopyDocument, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 参数
const complexity = ref(10) // 点的数量
const contrast = ref(5) // 随机程度 (变异系数)
const size = ref(400) // 尺寸
const color = ref('#3B82F6')
const seed = ref(Date.now())

// 生成 Blob 路径
const pathD = computed(() => {
  // 简单的 Blob 生成算法
  // 使用 seed 确保响应式更新
  const _seed = seed.value
  const pointCount = complexity.value
  const randomness = contrast.value

  const angleStep = (Math.PI * 2) / pointCount
  const points: { x: number; y: number }[] = []

  const r = size.value / 2
  const center = size.value / 2

  for (let i = 0; i < pointCount; i++) {
    // 伪随机生成
    const random = Math.sin(_seed + i * 123.45) * 0.5 + 0.5
    const variation = (random * randomness) / 20 // 调整变异幅度
    const radius = r * (0.8 + variation * 0.4) // 基础半径 + 变异

    const angle = i * angleStep
    points.push({
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius
    })
  }

  // 使用贝塞尔曲线连接点
  if (points.length === 0) return ''

  let d = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length; i++) {
    const p0 = points[i]
    const p1 = points[(i + 1) % points.length]

    // 简单的控制点计算 (中点)
    // 更平滑的曲线可以使用 Catmull-Rom spline 转换，这里用简化的二次贝塞尔
    const mx = (p0.x + p1.x) / 2
    const my = (p0.y + p1.y) / 2

    // 这里使用三次贝塞尔会让它更圆滑，但需要计算控制点
    // 简化方案：使用圆滑连接
    // 为了更好的效果，我们可以使用 spline 算法，但为了代码简洁，
    // 这里我们使用一种近似平滑的方法：取中点作为路径点，原点作为控制点
    // 修正：上面的循环方式生成的形状可能不够圆滑。
    // 让我们换一种方式：Catmull-Rom spline to Bezier
  }

  // 重新实现：更平滑的算法
  return generateBlobPath(points)
})

// Catmull-Rom to Cubic Bezier conversion helper
function generateBlobPath(points: { x: number; y: number }[]) {
  const len = points.length
  if (len < 3) return ''

  let d = ''

  for (let i = 0; i < len; i++) {
    const p0 = points[(i - 1 + len) % len]
    const p1 = points[i]
    const p2 = points[(i + 1) % len]
    const p3 = points[(i + 2) % len]

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    if (i === 0) {
      d += `M ${p1.x} ${p1.y}`
    }

    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`
  }

  d += ' Z'
  return d
}

// 刷新形状
const regenerate = () => {
  seed.value = Date.now() + Math.random()
}

// 复制代码
const copySvg = () => {
  const svg = `<svg width="${size.value}" height="${size.value}" viewBox="0 0 ${size.value} ${size.value}" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathD.value}" fill="${color.value}" />
</svg>`
  navigator.clipboard.writeText(svg).then(() => {
    ElMessage.success('SVG 代码已复制')
  })
}

const copyPath = () => {
  navigator.clipboard.writeText(pathD.value).then(() => {
    ElMessage.success('Path 数据已复制')
  })
}

// 下载 SVG
const downloadSvg = () => {
  const svg = `<svg width="${size.value}" height="${size.value}" viewBox="0 0 ${size.value} ${size.value}" xmlns="http://www.w3.org/2000/svg">
  <path d="${pathD.value}" fill="${color.value}" />
</svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `blob-${Date.now()}.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  regenerate()
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <!-- 主要内容区域 -->
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8 relative">
          <h2 class="text-4xl font-bold mb-3 relative inline-flex flex-col items-center">
            <div class="relative px-12">
              <span class="text-gray-800 hover:text-gray-600 transition-colors duration-300">Blob 形状生成器</span>
            </div>
          </h2>
          <p class="text-gray-500 text-sm mt-6">生成独一无二的流体有机形状，支持 SVG 导出</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- 控制面板 -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-gray-700">参数设置</h3>
                <el-button type="primary" circle @click="regenerate">
                  <el-icon>
                    <Refresh />
                  </el-icon>
                </el-button>
              </div>

              <div class="space-y-6">
                <!-- 复杂度 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">复杂度 (Complexity)</span>
                    <span class="text-sm font-mono text-blue-600">{{ complexity }}</span>
                  </div>
                  <el-slider v-model="complexity" :min="3" :max="20" @input="regenerate" />
                </div>

                <!-- 对比度/随机性 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">随机性 (Contrast)</span>
                    <span class="text-sm font-mono text-blue-600">{{ contrast }}</span>
                  </div>
                  <el-slider v-model="contrast" :min="0" :max="10" @input="regenerate" />
                </div>

                <!-- 颜色 -->
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm text-gray-600">颜色 (Color)</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <el-color-picker v-model="color" />
                    <span class="text-sm text-gray-500">{{ color }}</span>
                  </div>
                </div>
              </div>

              <div class="mt-8 grid grid-cols-2 gap-3">
                <el-button type="primary" plain @click="copySvg">
                  <el-icon class="mr-1">
                    <CopyDocument />
                  </el-icon> 复制 SVG
                </el-button>
                <el-button type="success" plain @click="downloadSvg">
                  <el-icon class="mr-1">
                    <Download />
                  </el-icon> 下载 SVG
                </el-button>
                <el-button class="col-span-2" @click="copyPath">
                  <el-icon class="mr-1">
                    <CopyDocument />
                  </el-icon> 仅复制 Path 数据
                </el-button>
              </div>
            </div>
          </div>

          <!-- 预览区域 -->
          <div class="lg:col-span-8">
            <div
              class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-full min-h-[500px] flex items-center justify-center relative overflow-hidden bg-grid-pattern">
              <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`"
                class="transition-all duration-500 ease-in-out drop-shadow-xl">
                <path :d="pathD" :fill="color" class="transition-all duration-500 ease-in-out" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐工具 -->
      <ToolsRecommend :currentPath="route.path" />
    </div>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
