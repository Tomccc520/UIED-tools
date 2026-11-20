<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { DocumentCopy, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import type { CopywritingTextResult } from '@/services/copywriting'
import {
  fetchEditorialLibrary, fetchOnlineEditorialEntry, fetchOnlineKFCEnglish, getDailyEditorialEntry, getEditorialDay, getNextEditorialEntry,
  type EditorialCopywritingKind, type EditorialCopywritingLibrary
} from '@/services/editorialCopywriting'
import { copy } from '@/utils/copy'

const props = defineProps<{ kind: EditorialCopywritingKind; bundledLibrary: EditorialCopywritingLibrary }>()
const route = useRoute()
const definitions = {
  kfc: {
    title: '疯狂星期四文案', description: '星期四段子，支持查看英文版和一键复制。', next: '换一条', copy: '复制中文',
    about: '换条时优先获取网络文案，接口不可用时继续浏览站内原创。网络文案的英文由机器翻译，所有段子仅供娱乐。'
  },
  'daily-poem': {
    title: '今日诗词', description: '每天读一首古诗，保留完整原文、作者和出处。', next: '换一首', copy: '复制诗词',
    about: '原文选自古籍通行版本。复制诗词会带上篇名、作者和出处。'
  },
  'dog-diary': {
    title: '舔狗日记', description: '读一篇自嘲小日记，随时换一篇或一键复制。', next: '换一篇', copy: '复制日记',
    about: '换篇时从夏柔 API 获取日记，接口不可用时继续浏览站内原创。'
  },
  moments: {
    title: '朋友圈文案', description: '按日常、出游、工作或松弛场景，挑一条适合今天的原创文案。', next: '换一条', copy: '复制文案',
    about: '可按场景筛选。切换时先看完该场景的一轮，再回到第一条。'
  }
}
const tool = definitions[props.kind]
const library = shallowRef(props.bundledLibrary)
const itemUnit = props.kind === 'daily-poem' ? '首' : props.kind === 'dog-diary' ? '篇' : '条'
const day = shallowRef(getEditorialDay())
const topic = ref('')
const showEnglish = ref(false)
const topics = computed(() => [...new Set(library.value.items.flatMap(item => item.topic ? [item.topic] : []))])
const visibleItems = computed(() => topic.value && topics.value.includes(topic.value)
  ? library.value.items.filter(item => item.topic === topic.value)
  : library.value.items)
const dailyEntry = computed(() => getDailyEditorialEntry(visibleItems.value, day.value.index))
const entry = shallowRef(dailyEntry.value)
const onlineEntry = shallowRef<CopywritingTextResult | null>(null)
const loadingNext = ref(false)
const onlineEnglish = ref('')
const translating = ref(false)
const currentText = computed(() => onlineEntry.value?.text ?? entry.value.text)
const currentEnglish = computed(() => onlineEntry.value ? onlineEnglish.value : entry.value.english)
const isDaily = computed(() => !onlineEntry.value && entry.value.id === dailyEntry.value.id)
const controller = new AbortController()
let translationRequest: AbortController | undefined
let dayTimer: number | undefined
let hasInteracted = false

/** 支持网络来源的工具优先获取网络文案，接口不可用或返回同一条时继续浏览站内内容。 */
async function nextEntry() {
  if (loadingNext.value) return
  hasInteracted = true
  if (props.kind === 'kfc' || props.kind === 'dog-diary') {
    loadingNext.value = true
    const result = await fetchOnlineEditorialEntry(props.kind, controller.signal)
    if (controller.signal.aborted) return
    loadingNext.value = false
    if (result && result.text !== currentText.value) {
      onlineEntry.value = result
      return
    }
    onlineEntry.value = null
  }
  entry.value = getNextEditorialEntry(visibleItems.value, entry.value.id)
}

/** 切换朋友圈场景后，从该场景当天的精选开始浏览。 */
function selectTopic(value: string) {
  if (value === topic.value) return
  hasInteracted = true
  topic.value = value
  entry.value = dailyEntry.value
}

/** 展开或收起英文版，首次查看网络文案时请求翻译。 */
function toggleEnglish() {
  hasInteracted = true
  showEnglish.value = !showEnglish.value
  if (showEnglish.value) void translateOnlineEntry()
}

/** 获取当前网络文案的英文，换条或离页后忽略已取消的结果。 */
async function translateOnlineEntry() {
  if (!onlineEntry.value || onlineEnglish.value || translating.value) return
  const request = new AbortController()
  translationRequest = request
  translating.value = true
  const result = await fetchOnlineKFCEnglish(onlineEntry.value.text, request.signal)
  if (request.signal.aborted) return
  onlineEnglish.value = result ?? ''
  translating.value = false
}

/** 网络文案切换时清除旧译文，英文面板已展开时继续翻译当前内容。 */
watch(onlineEntry, () => {
  translationRequest?.abort()
  onlineEnglish.value = ''
  translating.value = false
  if (showEnglish.value) void translateOnlineEntry()
})

/** 复制当前所见版本；诗词同时保留原来的分行、作者与出处。 */
async function copyCurrent(language: 'zh' | 'en' = 'zh') {
  hasInteracted = true
  const { text, title, dynasty, author, from } = entry.value
  const content = language === 'en' ? currentEnglish.value
    : props.kind === 'daily-poem' ? `${title}\n${dynasty} · ${author}\n\n${text}\n\n出处：${from}` : currentText.value
  if (!content) return
  if (await copy(content)) ElMessage.success('已复制')
  else ElMessage.error('复制失败，请选中文案手动复制')
}

/** 换日时只更新正在读的今日精选，保留用户手动挑选的内容。 */
function updateDay() {
  if (dayTimer !== undefined) window.clearTimeout(dayTimer)
  const now = Date.now()
  const nextDay = getEditorialDay(now)
  if (nextDay.date !== day.value.date) {
    const followsToday = isDaily.value
    day.value = nextDay
    if (followsToday) entry.value = dailyEntry.value
  }
  dayTimer = window.setTimeout(updateDay, nextDay.nextAt - now + 50)
}

/** 同步同域内容，兼容前后端分批升级，保留用户已点选的条目。 */
async function syncLibrary() {
  const result = await fetchEditorialLibrary(props.kind, controller.signal)
  if (!result || controller.signal.aborted || result.updatedAt < library.value.updatedAt) return
  if (result.updatedAt === library.value.updatedAt && result.items.length < library.value.items.length) return
  library.value = result
  if (topic.value && !topics.value.includes(topic.value)) topic.value = ''
  if (!hasInteracted) entry.value = dailyEntry.value
}

onMounted(() => {
  updateDay()
  document.addEventListener('visibilitychange', updateDay)
  void syncLibrary()
})

onBeforeUnmount(() => {
  controller.abort()
  translationRequest?.abort()
  if (dayTimer !== undefined) window.clearTimeout(dayTimer)
  document.removeEventListener('visibilitychange', updateDay)
})
</script>

<template>
  <div class="editorial-copywriting-page">
    <StandardToolPageTemplate compact :title="tool.title" :description="tool.description" workspace-label="文案工作区">
      <template v-if="kind !== 'kfc'" #meta>
        <span class="editorial-meta">{{ kind === 'daily-poem' ? '古籍精选' : '站内原创' }} · {{ visibleItems.length }} {{ itemUnit }}</span>
        <span class="editorial-meta">内容库更新于 <time :datetime="library.updatedAt">{{ library.updatedAt }}</time></span>
      </template>

      <div v-if="topics.length" class="editorial-topics" role="group" aria-label="文案场景">
        <button type="button" :aria-pressed="topic === ''" @click="selectTopic('')">全部</button>
        <button v-for="name in topics" :key="name" type="button" :aria-pressed="topic === name" @click="selectTopic(name)">
          {{ name }}
        </button>
      </div>

      <div class="editorial-output" :class="{ 'editorial-output--poem': kind === 'daily-poem', 'editorial-output--kfc': kind === 'kfc' }"
        aria-live="polite" aria-atomic="true">
        <div v-if="kind !== 'kfc'" class="editorial-output__meta">
          <span v-if="onlineEntry">
            来源：<a v-if="onlineEntry.from === '夏柔 API'" href="https://api.aa1.cn/doc/tiangou.html"
              target="_blank" rel="noopener noreferrer">{{ onlineEntry.from }}</a>
            <template v-else>{{ onlineEntry.from || '网络文案' }}</template>
          </span>
          <span v-else>{{ isDaily ? '今日精选' : (entry.topic || '站内精选') }}</span>
          <time v-if="isDaily" :datetime="day.date">{{ day.date }}</time>
        </div>
        <h2 v-if="entry.title" class="editorial-title">{{ entry.title }}</h2>
        <p v-if="entry.author" class="editorial-author">{{ entry.dynasty }} · {{ entry.author }}</p>
        <p class="editorial-text" data-copywriting-content>{{ currentText }}</p>
        <p v-if="kind !== 'kfc' && entry.from" class="editorial-source">出处：{{ entry.from }}</p>

        <section v-if="kind === 'kfc'" v-show="showEnglish" id="editorial-english" class="editorial-translation" aria-label="英文版">
          <h2>英文版</h2>
          <p v-if="currentEnglish" lang="en">{{ currentEnglish }}</p>
          <p v-else-if="translating">正在翻译…</p>
          <div v-else-if="onlineEntry" class="editorial-translation-retry">
            <p>暂时无法获取英文版。</p>
            <button type="button" class="editorial-action" @click="translateOnlineEntry">重试翻译</button>
          </div>
        </section>
      </div>

      <template #actions>
        <button type="button" class="editorial-action editorial-action--primary" :aria-disabled="loadingNext" :aria-busy="loadingNext" @click="nextEntry">
          <Refresh aria-hidden="true" />{{ loadingNext ? '获取中…' : tool.next }}
        </button>
        <button type="button" class="editorial-action" @click="copyCurrent('zh')">
          <DocumentCopy aria-hidden="true" />{{ tool.copy }}
        </button>
        <button v-if="kind === 'kfc'" type="button" class="editorial-action" aria-controls="editorial-english"
          :aria-expanded="showEnglish" @click="toggleEnglish">
          {{ showEnglish ? '收起英文版' : '查看英文版' }}
        </button>
        <button v-if="showEnglish && currentEnglish" type="button" class="editorial-action" @click="copyCurrent('en')">
          <DocumentCopy aria-hidden="true" />复制英文
        </button>
      </template>

      <template #support>
        <div class="editorial-help">
          <h2>内容说明</h2>
          <p>今日精选按北京时间每天轮换，点击“{{ tool.next }}”可继续浏览。{{ tool.about }}</p>
        </div>
      </template>
    </StandardToolPageTemplate>

    <div class="mt-4">
      <ToolsRecommend :current-path="route.path" />
    </div>
  </div>
</template>

<style scoped>
.editorial-copywriting-page { min-width: 0; }

.editorial-meta,
.editorial-output__meta,
.editorial-author,
.editorial-source {
  color: var(--uied-color-text-secondary);
  font-size: 13px;
}

.editorial-topics,
.editorial-output__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.editorial-topics { margin-bottom: 12px; }

.editorial-topics button,
.editorial-action {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  min-width: 0;
  min-height: 44px;
  padding: 7px 13px;
  border: 1px solid var(--uied-color-border);
  border-radius: 8px;
  background: var(--uied-color-surface);
  color: var(--uied-color-text);
  font-size: 14px;
  font-weight: 600;
}

.editorial-action svg { width: 16px; height: 16px; flex: none; }
.editorial-topics button:hover,
.editorial-topics button[aria-pressed='true'],
.editorial-action:hover { border-color: var(--uied-color-primary-border); color: var(--uied-color-primary-hover); }
.editorial-topics button[aria-pressed='true'] { background: var(--uied-color-primary-soft); }
.editorial-action--primary { background: var(--uied-color-primary); border-color: var(--uied-color-primary); color: #fff; }
.editorial-action--primary:hover { background: var(--uied-color-primary-hover); border-color: var(--uied-color-primary-hover); color: #fff; }

.editorial-output {
  min-width: 0;
  min-height: 136px;
  padding: clamp(16px, 3vw, 28px);
  border: 1px solid var(--uied-color-border);
  border-radius: 10px;
  background: var(--uied-color-surface-subtle);
}

.editorial-output--kfc { min-height: 0; }
.editorial-output__meta { justify-content: space-between; margin-bottom: 12px; }
.editorial-output__meta a { color: var(--uied-color-primary-hover); text-decoration: underline; text-underline-offset: 2px; }
.editorial-title { font-size: 21px; line-height: 1.4; font-weight: 700; overflow-wrap: anywhere; }
.editorial-author { margin-top: 5px; }
.editorial-source { margin-top: 14px; }
.editorial-text { white-space: pre-wrap; overflow-wrap: anywhere; font-size: clamp(16px, 1.7vw, 19px); line-height: 1.8; }
.editorial-output--poem .editorial-text { margin-top: 12px; font-family: 'Songti SC', 'SimSun', serif; line-height: 1.95; }
.editorial-translation { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--uied-color-border); }
.editorial-translation h2, .editorial-help h2 { font-size: 14px; font-weight: 650; }
.editorial-translation p, .editorial-help p { margin-top: 6px; line-height: 1.65; overflow-wrap: anywhere; }
.editorial-translation-retry { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.editorial-action[aria-disabled='true'] { opacity: .7; cursor: wait; }
.editorial-help { padding: 14px 16px; border: 1px solid var(--uied-color-border); border-radius: 8px; background: var(--uied-color-surface); }
.editorial-help p { color: var(--uied-color-text-secondary); font-size: 13px; }

@media (max-width: 720px) {
  .editorial-action { padding-inline: 8px; }
}
</style>
