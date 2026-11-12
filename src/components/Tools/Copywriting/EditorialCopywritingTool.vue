<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
-->

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { DocumentCopy, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import {
  fetchEditorialLibrary, getBundledEditorialLibrary, getDailyEditorialEntry, getEditorialDay, getNextEditorialEntry,
  type EditorialCopywritingKind
} from '@/services/editorialCopywriting'
import { copy } from '@/utils/copy'

const props = defineProps<{ kind: EditorialCopywritingKind }>()
const route = useRoute()
const definitions = {
  kfc: {
    title: '疯狂星期四文案', description: '原创星期四段子，支持查看英文版和一键复制。', next: '换一条', copy: '复制中文',
    about: '原创玩梗文案，仅供分享娱乐，不代表肯德基官方活动或优惠。英文版与每条中文文案配套维护。'
  },
  'daily-poem': {
    title: '今日诗词', description: '每天读一首古诗，保留完整原文、作者和出处。', next: '换一首', copy: '复制诗词',
    about: '原文选自古籍通行版本。复制诗词会带上篇名、作者和出处。'
  },
  'dog-diary': {
    title: '舔狗日记', description: '读一篇原创的自嘲小日记，随时换一篇。', next: '换一篇', copy: '复制日记',
    about: '日记是原创虚构段子，供娱乐与分享。'
  },
  moments: {
    title: '朋友圈文案', description: '按日常、出游、工作或松弛场景，挑一条适合今天的原创文案。', next: '换一条', copy: '复制文案',
    about: '可按场景筛选。切换时先看完该场景的一轮，再回到第一条。'
  }
}
const tool = definitions[props.kind]
const library = shallowRef(getBundledEditorialLibrary(props.kind))
const day = shallowRef(getEditorialDay())
const topic = ref('')
const showEnglish = ref(false)
const topics = computed(() => [...new Set(library.value.items.flatMap(item => item.topic ? [item.topic] : []))])
const visibleItems = computed(() => topic.value && topics.value.includes(topic.value)
  ? library.value.items.filter(item => item.topic === topic.value)
  : library.value.items)
const dailyEntry = computed(() => getDailyEditorialEntry(visibleItems.value, day.value.index))
const entry = shallowRef(dailyEntry.value)
const isDaily = computed(() => entry.value.id === dailyEntry.value.id)
const controller = new AbortController()
let dayTimer: number | undefined
let hasInteracted = false

/** 换内容不发请求；英文如已展开，也会立刻切到新文案的对应版本。 */
function nextEntry() {
  hasInteracted = true
  entry.value = getNextEditorialEntry(visibleItems.value, entry.value.id)
}

/** 切换朋友圈场景后，从该场景当天的精选开始浏览。 */
function selectTopic(value: string) {
  if (value === topic.value) return
  hasInteracted = true
  topic.value = value
  entry.value = dailyEntry.value
}

/** 展开或收起随内容发布的英文版，不等待翻译接口。 */
function toggleEnglish() {
  hasInteracted = true
  showEnglish.value = !showEnglish.value
}

/** 复制当前所见版本；诗词同时保留原来的分行、作者与出处。 */
async function copyCurrent(language: 'zh' | 'en' = 'zh') {
  hasInteracted = true
  const { text, english, title, dynasty, author, from } = entry.value
  const content = language === 'en' ? english
    : props.kind === 'daily-poem' ? `${title}\n${dynasty} · ${author}\n\n${text}\n\n出处：${from}` : text
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

/** 安静同步更新过的站内库，不覆盖用户已点选的条目。 */
async function syncLibrary() {
  const result = await fetchEditorialLibrary(props.kind, controller.signal)
  if (!result || controller.signal.aborted || result.updatedAt < library.value.updatedAt) return
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
  if (dayTimer !== undefined) window.clearTimeout(dayTimer)
  document.removeEventListener('visibilitychange', updateDay)
})
</script>

<template>
  <div class="editorial-copywriting-page">
    <StandardToolPageTemplate compact :title="tool.title" :description="tool.description" workspace-label="文案工作区">
      <template #meta>
        <span class="editorial-meta">{{ kind === 'daily-poem' ? '古籍精选' : '站内原创' }}</span>
        <span class="editorial-meta">内容库更新于 <time :datetime="library.updatedAt">{{ library.updatedAt }}</time></span>
      </template>

      <div v-if="topics.length" class="editorial-topics" role="group" aria-label="文案场景">
        <button type="button" :aria-pressed="topic === ''" @click="selectTopic('')">全部</button>
        <button v-for="name in topics" :key="name" type="button" :aria-pressed="topic === name" @click="selectTopic(name)">
          {{ name }}
        </button>
      </div>

      <div class="editorial-output" :class="{ 'editorial-output--poem': kind === 'daily-poem' }" aria-live="polite" aria-atomic="true">
        <div class="editorial-output__meta">
          <span>{{ isDaily ? '今日精选' : (entry.topic || '站内精选') }}</span>
          <time v-if="isDaily" :datetime="day.date">{{ day.date }}</time>
        </div>
        <h2 v-if="entry.title" class="editorial-title">{{ entry.title }}</h2>
        <p v-if="entry.author" class="editorial-author">{{ entry.dynasty }} · {{ entry.author }}</p>
        <p class="editorial-text" data-copywriting-content>{{ entry.text }}</p>
        <p v-if="entry.from" class="editorial-source">出处：{{ entry.from }}</p>

        <section v-if="kind === 'kfc'" v-show="showEnglish" id="editorial-english" class="editorial-translation" aria-label="英文版">
          <h2>英文版</h2>
          <p lang="en">{{ entry.english }}</p>
        </section>
      </div>

      <template #actions>
        <button type="button" class="editorial-action editorial-action--primary" @click="nextEntry">
          <Refresh aria-hidden="true" />{{ tool.next }}
        </button>
        <button type="button" class="editorial-action" @click="copyCurrent('zh')">
          <DocumentCopy aria-hidden="true" />{{ tool.copy }}
        </button>
        <button v-if="kind === 'kfc'" type="button" class="editorial-action" aria-controls="editorial-english"
          :aria-expanded="showEnglish" @click="toggleEnglish">
          {{ showEnglish ? '收起英文版' : '查看英文版' }}
        </button>
        <button v-if="showEnglish" type="button" class="editorial-action" @click="copyCurrent('en')">
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

.editorial-output__meta { justify-content: space-between; margin-bottom: 12px; }
.editorial-title { font-size: 21px; line-height: 1.4; font-weight: 700; overflow-wrap: anywhere; }
.editorial-author { margin-top: 5px; }
.editorial-source { margin-top: 14px; }
.editorial-text { white-space: pre-wrap; overflow-wrap: anywhere; font-size: clamp(16px, 1.7vw, 19px); line-height: 1.8; }
.editorial-output--poem .editorial-text { margin-top: 12px; font-family: 'Songti SC', 'SimSun', serif; line-height: 1.95; }
.editorial-translation { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--uied-color-border); }
.editorial-translation h2, .editorial-help h2 { font-size: 14px; font-weight: 650; }
.editorial-translation p, .editorial-help p { margin-top: 6px; line-height: 1.65; overflow-wrap: anywhere; }
.editorial-help { padding: 14px 16px; border: 1px solid var(--uied-color-border); border-radius: 8px; background: var(--uied-color-surface); }
.editorial-help p { color: var(--uied-color-text-secondary); font-size: 13px; }

@media (max-width: 720px) {
  .editorial-action { padding-inline: 8px; }
}
</style>
