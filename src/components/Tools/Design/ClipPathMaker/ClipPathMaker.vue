<!--
 * @file ClipPathMaker.vue
 * @description CSS Clip-path 生成器，支持可视化拖拽编辑多边形
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 -->

<!--
 * @file ClipPathMaker.vue
 * @description CSS Clip-path 生成器，在线可视化生成 CSS clip-path 代码，支持拖拽调整多边形顶点
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-13
 * @license MIT
-->

<template>
  <div class="clip-path-page">
    <div class="mx-auto">
      <div class="clip-path-card bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold mb-3 text-gray-800">免费 CSS Clip-path 生成器</h1>
          <p class="text-gray-500 text-sm">在线可视化生成 CSS clip-path 代码，支持拖拽调整多边形顶点，提供多种常用形状预设</p>
        </div>

        <div class="clip-path-layout max-w-6xl mx-auto flex flex-col gap-8">
          <!-- Preview Area -->
          <div
            class="clip-path-preview flex-1 bg-gray-50 rounded-xl p-8 border border-gray-100 flex items-center justify-center min-h-[500px]">
            <div class="clip-path-board relative bg-white shadow-lg select-none group"
              ref="previewRef"
              :style="{ backgroundImage: showImage ? `url(${demoImage})` : 'none', backgroundSize: 'cover' }">
              <!-- The Clipped Element -->
              <div class="absolute inset-0 transition-all duration-75 ease-linear"
                :class="{ 'bg-blue-500': !showImage, 'bg-black/50': showImage }" :style="{ clipPath: cssClipPath }">
              </div>

              <!-- Handles -->
              <div v-for="(point, index) in points" :key="index"
                class="clip-path-point absolute cursor-move z-10"
                :class="{ 'is-active': activeIndex === index }"
                :style="{ left: point.x + '%', top: point.y + '%' }" @mousedown.stop="startDrag(index, $event)"
                @touchstart.stop.prevent="startTouch(index, $event)">
                <!-- Delete button on hover (optional, maybe overkill for now) -->
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="clip-path-controls w-full flex flex-col gap-6">

            <!-- Presets -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 class="font-bold text-gray-800 mb-4">形状预设</h3>
              <div class="grid grid-cols-4 gap-2">
                <button v-for="preset in presets" :key="preset.name" type="button"
                  class="aspect-square bg-white border border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center p-2"
                  @click="applyPreset(preset.points)" :title="preset.name" :aria-label="preset.name">
                  <div class="w-full h-full bg-gray-800" :style="{ clipPath: getPolygonCss(preset.points) }"></div>
                </button>
              </div>
            </div>

            <!-- Settings -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-800">设置</h3>
                <el-switch v-model="showImage" active-text="显示背景图" />
              </div>

              <div class="space-y-4">
                <div class="flex justify-between text-sm text-gray-600">
                  <span>顶点数量: {{ points.length }}</span>
                  <span class="text-xs text-gray-400">点击预设可重置</span>
                </div>
                <!-- Future: Manual point input list? -->
              </div>
            </div>

            <!-- Code -->
            <div class="bg-gray-900 rounded-xl p-4 relative group">
              <div class="clip-path-code-heading flex flex-wrap items-center justify-between gap-2 mb-3">
                <span class="text-gray-400 text-xs">CSS 代码</span>
                <el-button type="primary" size="small" :icon="CopyDocument" @click="copyCss">复制 CSS</el-button>
              </div>
              <pre
                class="text-blue-300 font-mono text-sm overflow-x-auto break-all whitespace-pre-wrap">clip-path: {{ cssClipPath }};</pre>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  <ToolsRecommend :currentPath="route.path" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import useClipboard from 'vue-clipboard3';
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue';

const route = useRoute();
const { toClipboard } = useClipboard();

interface Point {
  x: number;
  y: number;
}

const showImage = ref(false);
const demoImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

// State
const points = ref<Point[]>([
  { x: 50, y: 0 },
  { x: 0, y: 100 },
  { x: 100, y: 100 }
]);
const activeIndex = ref<number | null>(null);
const previewRef = ref<HTMLElement | null>(null);

// Presets
const presets = [
  { name: 'Triangle', points: [{ x: 50, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }] },
  { name: 'Trapezoid', points: [{ x: 20, y: 0 }, { x: 80, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] },
  { name: 'Parallelogram', points: [{ x: 25, y: 0 }, { x: 100, y: 0 }, { x: 75, y: 100 }, { x: 0, y: 100 }] },
  { name: 'Rhombus', points: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }] },
  { name: 'Pentagon', points: [{ x: 50, y: 0 }, { x: 100, y: 38 }, { x: 82, y: 100 }, { x: 18, y: 100 }, { x: 0, y: 38 }] },
  { name: 'Hexagon', points: [{ x: 50, y: 0 }, { x: 100, y: 25 }, { x: 100, y: 75 }, { x: 50, y: 100 }, { x: 0, y: 75 }, { x: 0, y: 25 }] },
  { name: 'Heptagon', points: [{ x: 50, y: 0 }, { x: 90, y: 20 }, { x: 100, y: 60 }, { x: 75, y: 100 }, { x: 25, y: 100 }, { x: 0, y: 60 }, { x: 10, y: 20 }] },
  { name: 'Octagon', points: [{ x: 30, y: 0 }, { x: 70, y: 0 }, { x: 100, y: 30 }, { x: 100, y: 70 }, { x: 70, y: 100 }, { x: 30, y: 100 }, { x: 0, y: 70 }, { x: 0, y: 30 }] },
  { name: 'Star', points: [{ x: 50, y: 0 }, { x: 61, y: 35 }, { x: 98, y: 35 }, { x: 68, y: 57 }, { x: 79, y: 91 }, { x: 50, y: 70 }, { x: 21, y: 91 }, { x: 32, y: 57 }, { x: 2, y: 35 }, { x: 39, y: 35 }] },
  { name: 'Cross', points: [{ x: 10, y: 35 }, { x: 35, y: 35 }, { x: 35, y: 10 }, { x: 65, y: 10 }, { x: 65, y: 35 }, { x: 90, y: 35 }, { x: 90, y: 65 }, { x: 65, y: 65 }, { x: 65, y: 90 }, { x: 35, y: 90 }, { x: 35, y: 65 }, { x: 10, y: 65 }] },
  { name: 'Left Arrow', points: [{ x: 40, y: 0 }, { x: 40, y: 20 }, { x: 100, y: 20 }, { x: 100, y: 80 }, { x: 40, y: 80 }, { x: 40, y: 100 }, { x: 0, y: 50 }] },
  { name: 'Right Arrow', points: [{ x: 0, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 0 }, { x: 100, y: 50 }, { x: 60, y: 100 }, { x: 60, y: 80 }, { x: 0, y: 80 }] },
  { name: 'Message', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 75 }, { x: 75, y: 75 }, { x: 75, y: 100 }, { x: 50, y: 75 }, { x: 0, y: 75 }] },
  { name: 'Close', points: [{ x: 20, y: 0 }, { x: 0, y: 20 }, { x: 30, y: 50 }, { x: 0, y: 80 }, { x: 20, y: 100 }, { x: 50, y: 70 }, { x: 80, y: 100 }, { x: 100, y: 80 }, { x: 70, y: 50 }, { x: 100, y: 20 }, { x: 80, y: 0 }, { x: 50, y: 30 }] },
  { name: 'Frame', points: [{ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 25, y: 100 }, { x: 25, y: 25 }, { x: 75, y: 25 }, { x: 75, y: 75 }, { x: 25, y: 75 }, { x: 25, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }] },
];

const getPolygonCss = (pts: Point[]) => {
  return `polygon(${pts.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
};

const cssClipPath = computed(() => getPolygonCss(points.value));

const applyPreset = (newPoints: Point[]) => {
  points.value = JSON.parse(JSON.stringify(newPoints));
};

const copyCss = async () => {
  try {
    await toClipboard(`clip-path: ${cssClipPath.value};`);
    ElMessage.success('CSS 代码已复制');
  } catch (e) {
    ElMessage.error('复制失败');
  }
};

// Drag Logic
const startDrag = (index: number, event: MouseEvent) => {
  activeIndex.value = index;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const startTouch = (index: number, event: TouchEvent) => {
  activeIndex.value = index;
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  document.addEventListener('touchend', onTouchEnd);
};

const movePoint = (clientX: number, clientY: number) => {
  if (activeIndex.value === null || !previewRef.value) return;

  const rect = previewRef.value.getBoundingClientRect();
  let x = ((clientX - rect.left) / rect.width) * 100;
  let y = ((clientY - rect.top) / rect.height) * 100;

  // Clamp
  x = Math.max(0, Math.min(100, x));
  y = Math.max(0, Math.min(100, y));

  // Snap to grid (optional, maybe every 1% or 5%)
  x = Math.round(x);
  y = Math.round(y);

  points.value[activeIndex.value] = { x, y };
};

const onMouseMove = (event: MouseEvent) => {
  movePoint(event.clientX, event.clientY);
};

const onMouseUp = () => {
  activeIndex.value = null;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

const onTouchMove = (event: TouchEvent) => {
  event.preventDefault(); // Prevent scrolling while dragging
  const touch = event.touches[0];
  movePoint(touch.clientX, touch.clientY);
};

const onTouchEnd = () => {
  activeIndex.value = null;
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
};

</script>

<style scoped>

.clip-path-page { container-type: inline-size; container-name: clip-path; min-width: 0; }
.clip-path-layout, .clip-path-preview, .clip-path-controls { min-width: 0; }
.clip-path-board { width: 300px; max-width: 100%; aspect-ratio: 1; flex-shrink: 0; }
/* 视觉顶点保持 16px，拖拽命中区域扩大到 44px；坐标仍以画板实际边界计算。 */
.clip-path-point { width: 44px; height: 44px; margin: -22px 0 0 -22px; touch-action: none; }
.clip-path-point::before {
  content: "";
  position: absolute;
  inset: 14px;
  border: 2px solid #2563eb;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}
.clip-path-point.is-active::before { background: #2563eb; box-shadow: 0 0 0 3px #bfdbfe; }
.clip-path-controls button:focus-visible { outline: 2px solid var(--uied-color-primary); outline-offset: 3px; }
@media (min-width: 768px) {
  .clip-path-board { width: 400px; }
}
@container clip-path (min-width: 900px) {
  .clip-path-layout { flex-direction: row; }
  .clip-path-controls { width: 384px; flex-shrink: 0; }
}
@container clip-path (max-width: 600px) {
  .clip-path-card { padding: 20px 12px; }
  .clip-path-card h1 { font-size: 26px; line-height: 1.3; }
  .clip-path-layout { gap: 16px; }
  .clip-path-preview { min-height: 0; padding: 24px; }
  .clip-path-controls > div { padding: 16px 12px; }
  .clip-path-controls .grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .clip-path-controls .grid button { min-height: 44px; min-width: 0; }
  .clip-path-controls .el-button { min-height: 44px; }
  .clip-path-controls .flex.justify-between { flex-wrap: wrap; gap: 8px; }
}

</style>
