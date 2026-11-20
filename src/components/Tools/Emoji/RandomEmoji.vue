<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-01-22
 */
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { Download, Refresh } from '@element-plus/icons-vue'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { fetchRandomEmoji } from '@/services/randomEmoji'

const route = useRoute()
const preview = shallowRef<{ url: string; extension: string; source: string | null } | null>(null)
const sources = new Map([
  ['ruseo', { name: '澄曜 API', url: 'https://api.ruseo.cn/api-doc/bqb' }],
  ['capybara', { name: '水豚动图（备用）', url: 'https://api3.mhimg.cn/doc/Api_stdd.html' }]
])
const source = computed(() => sources.get(preview.value?.source ?? ''))
const loading = ref(false)
const error = ref('')
let request: AbortController | undefined

/** 取回并解码新图，成功后再替换预览。请求失败时保留当前图片。 */
async function getNewEmoji() {
  if (request) return
  const controller = new AbortController()
  request = controller
  loading.value = true
  error.value = ''
  const timer = window.setTimeout(() => controller.abort(), 7000)
  let nextUrl = ''

  try {
    const result = await fetchRandomEmoji(controller.signal)
    nextUrl = URL.createObjectURL(result.blob)
    const image = new Image()
    image.src = nextUrl
    await image.decode()
    if (controller.signal.aborted) throw new Error('获取表情包超时')

    const previousUrl = preview.value?.url
    preview.value = { url: nextUrl, extension: result.extension, source: result.source }
    nextUrl = ''
    if (previousUrl) URL.revokeObjectURL(previousUrl)
  } catch {
    if (request === controller) {
      error.value = preview.value ? '暂时无法换图，已保留当前表情。' : '暂时无法获取表情包，请重试。'
    }
  } finally {
    window.clearTimeout(timer)
    if (nextUrl) URL.revokeObjectURL(nextUrl)
    if (request === controller) {
      request = undefined
      loading.value = false
    }
  }
}

/** 下载当前预览的原图，使用实际格式命名文件。 */
function downloadEmoji() {
  const current = preview.value
  if (!current) return
  const link = document.createElement('a')
  link.href = current.url
  link.download = `表情包_${Date.now()}.${current.extension}`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

onMounted(getNewEmoji)

/** 离开页面时取消在途请求，并释放已显示图片的地址。 */
onBeforeUnmount(() => {
  request?.abort()
  request = undefined
  if (preview.value) URL.revokeObjectURL(preview.value.url)
})
</script>

<template>
  <div>
    <StandardToolPageTemplate
      compact
      title="随机表情包"
      description="随机抽取聊天表情，支持静态图和 GIF 动图的原格式下载。"
    >
      <div class="emoji-preview">
        <img v-if="preview" :src="preview.url" alt="随机抽取的聊天表情" />
        <p v-else role="status" :class="{ 'emoji-error': error }">{{ error || '正在获取表情包…' }}</p>
      </div>

      <p v-if="source" class="emoji-note">
        来源 <a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.name }}</a>
      </p>
      <p v-if="preview && error" role="status" class="emoji-note emoji-error">{{ error }}</p>

      <template #actions>
        <button type="button" class="emoji-action emoji-action--primary"
          :aria-busy="loading" :aria-disabled="loading" @click="getNewEmoji">
          <Refresh aria-hidden="true" />
          {{ loading ? '获取中…' : !preview && error ? '重试' : '换一张' }}
        </button>
        <button type="button" class="emoji-action" :disabled="!preview" @click="downloadEmoji">
          <Download aria-hidden="true" />下载表情
        </button>
      </template>
    </StandardToolPageTemplate>

    <div class="mt-4">
      <ToolsRecommend :current-path="route.path" />
    </div>
  </div>
</template>

<style scoped>
.emoji-preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-height: clamp(180px, 30vw, 300px);
  place-items: center;
  padding: 16px;
  border: 1px solid var(--uied-color-border);
  border-radius: 8px;
  background: var(--uied-color-page);
  color: var(--uied-color-text-secondary);
  text-align: center;
}

.emoji-preview img {
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
}

.emoji-note {
  margin-top: 8px;
  color: var(--uied-color-text-secondary);
  font-size: 13px;
}

.emoji-note a { color: var(--uied-color-primary-hover); text-decoration: underline; }
.emoji-error { color: var(--uied-color-danger); }

.emoji-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 8px 14px;
  border: 1px solid var(--uied-color-border);
  border-radius: 8px;
  background: var(--uied-color-surface);
  color: var(--uied-color-text);
  font-weight: 600;
}

.emoji-action svg { width: 16px; height: 16px; }
.emoji-action:hover { border-color: var(--uied-color-primary-border); color: var(--uied-color-primary-hover); }
.emoji-action--primary { background: var(--uied-color-primary); border-color: var(--uied-color-primary); color: #fff; }
.emoji-action--primary:hover { background: var(--uied-color-primary-hover); border-color: var(--uied-color-primary-hover); color: #fff; }
.emoji-action:disabled, .emoji-action[aria-disabled='true'] { opacity: .65; }
.emoji-action[aria-disabled='true'] { cursor: wait; }
</style>
