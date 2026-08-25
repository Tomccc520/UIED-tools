<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
-->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getDefaultSitePublicConfig, getSitePublicConfig, normalizeChangelogTimeline, type SiteChangelogTimelineItem, type SiteLinkItem } from '@/services/siteConfig'

type ChangelogScope = 'recent' | 'all'

const RECENT_VERSION_LIMIT = 12
const defaultSiteConfig = getDefaultSitePublicConfig()
const changelogIntroText = ref(defaultSiteConfig.changelogIntroText)
const changelogMetaLinks = ref<SiteLinkItem[]>(defaultSiteConfig.changelogMetaLinks)
const changelogSplitTitle = ref(defaultSiteConfig.changelogSplitTitle)
const changelogSplitDesc = ref(defaultSiteConfig.changelogSplitDesc)
const changelogSplitLink = ref(defaultSiteConfig.changelogSplitLink)
const changelogSplitLinkText = ref(defaultSiteConfig.changelogSplitLinkText)
const changelogStatsText = ref(defaultSiteConfig.changelogStatsText)
const timelineEntries = ref<SiteChangelogTimelineItem[]>(normalizeChangelogTimeline(defaultSiteConfig.changelogTimeline))
const activeScope = ref<ChangelogScope>('recent')
const searchKeyword = ref('')
const isLoading = ref(false)

/**
 * 函数说明：判断链接是否为外部地址，外链在新标签页打开。
 */
const isExternalLink = (link: string): boolean => /^https?:\/\//i.test(String(link || '').trim())

/**
 * 函数说明：将版本信息转换为稳定 DOM ID，便于锚点定位和自动化检查。
 */
const buildTimelineItemId = (item: SiteChangelogTimelineItem, index: number): string => {
  const candidate = String(item.id || item.version || `timeline-${index + 1}`).trim()
  return (
    candidate
      .replace(/[^\w-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || `timeline-${index + 1}`
  )
}

/**
 * 函数说明：为数字版本补充 v 前缀，测试版与“即将更新”等文本版本保持原样。
 */
const formatVersionLabel = (version: string): string => {
  const normalizedVersion = String(version || '').trim()
  return /^v/i.test(normalizedVersion) || !/^\d/.test(normalizedVersion)
    ? normalizedVersion
    : `v${normalizedVersion}`
}

/**
 * 函数说明：将后台历史 router-link 片段转换为标准锚点，兼容旧更新时间线内容。
 */
const normalizeTimelinePointHtml = (html: string): string => {
  return String(html || '')
    .replace(/<router-link\b([^>]*?)\bto="([^"]+)"([^>]*)>/gi, (_match, beforeAttrs, to, afterAttrs) => {
      let anchorAttrs = `${String(beforeAttrs || '').trim()} ${String(afterAttrs || '').trim()}`.replace(/\s+/g, ' ').trim()
      if (!/\btarget=/.test(anchorAttrs) && isExternalLink(to)) {
        anchorAttrs = `${anchorAttrs} target="_blank"`.trim()
      }
      if (/\btarget=/.test(anchorAttrs) && !/\brel=/.test(anchorAttrs)) {
        anchorAttrs = `${anchorAttrs} rel="noopener noreferrer"`.trim()
      }
      return `<a href="${to}"${anchorAttrs ? ` ${anchorAttrs}` : ''}>`
    })
    .replace(/<\/router-link>/gi, '</a>')
}

/**
 * 函数说明：提取可搜索纯文本，覆盖版本、日期、标题、功能块和功能描述。
 */
const buildTimelineSearchText = (item: SiteChangelogTimelineItem): string => {
  const featureText = item.features
    .flatMap((feature) => [feature.title, ...feature.points])
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
  return [item.version, item.date, item.badgeText, item.title, featureText].join(' ').replace(/\s+/g, ' ').toLowerCase()
}

/**
 * 函数说明：根据“最近更新/全部版本”和搜索词生成当前可见版本列表。
 */
const visibleTimelineEntries = computed<SiteChangelogTimelineItem[]>(() => {
  const scopedEntries = activeScope.value === 'recent' ? timelineEntries.value.slice(0, RECENT_VERSION_LIMIT) : timelineEntries.value
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) {
    return scopedEntries
  }
  return scopedEntries.filter((item) => buildTimelineSearchText(item).includes(keyword))
})

const resultSummary = computed(() => {
  const scopeCount = activeScope.value === 'recent' ? Math.min(RECENT_VERSION_LIMIT, timelineEntries.value.length) : timelineEntries.value.length
  if (searchKeyword.value.trim()) {
    return `找到 ${visibleTimelineEntries.value.length} 个匹配版本`
  }
  return activeScope.value === 'recent' ? `展示最近 ${scopeCount} 个版本` : `共 ${scopeCount} 个版本`
})

/**
 * 函数说明：清空搜索条件并切换到全部版本，供空结果状态快速恢复。
 */
const showAllVersions = (): void => {
  searchKeyword.value = ''
  activeScope.value = 'all'
}

/**
 * 函数说明：读取站点公共配置，统一更新开源说明、统计文案和去重后的版本时间线。
 */
const loadSiteConfig = async (): Promise<void> => {
  isLoading.value = true
  try {
    const siteConfig = await getSitePublicConfig({ forceRefresh: true })
    changelogIntroText.value = siteConfig.changelogIntroText || defaultSiteConfig.changelogIntroText
    changelogMetaLinks.value = siteConfig.changelogMetaLinks.length ? siteConfig.changelogMetaLinks : defaultSiteConfig.changelogMetaLinks
    changelogSplitTitle.value = siteConfig.changelogSplitTitle || defaultSiteConfig.changelogSplitTitle
    changelogSplitDesc.value = siteConfig.changelogSplitDesc || defaultSiteConfig.changelogSplitDesc
    changelogSplitLink.value = siteConfig.changelogSplitLink || defaultSiteConfig.changelogSplitLink
    changelogSplitLinkText.value = siteConfig.changelogSplitLinkText || defaultSiteConfig.changelogSplitLinkText
    changelogStatsText.value = (siteConfig.changelogStatsText || defaultSiteConfig.changelogStatsText).replace(/当前工具总数：334个/g, '当前工具总数：333个')
    timelineEntries.value = normalizeChangelogTimeline(siteConfig.changelogTimeline)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadSiteConfig()
})
</script>

<template>
  <main class="changelog-page">
    <section class="changelog-hero" aria-labelledby="changelog-title">
      <div class="changelog-hero__copy">
        <div class="changelog-kicker">UIED-Tools 3.0.1</div>
        <h1 id="changelog-title">更新记录</h1>
        <p>{{ changelogIntroText }}</p>
      </div>

      <div class="changelog-meta-links" aria-label="项目资料">
        <a
          v-for="link in changelogMetaLinks"
          :key="`${link.name}-${link.link}`"
          :href="link.link"
          :target="isExternalLink(link.link) ? '_blank' : undefined"
          :rel="isExternalLink(link.link) ? 'noopener noreferrer' : undefined"
        >
          {{ link.name }}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="open-source-notice">
        <div>
          <h2>{{ changelogSplitTitle }}</h2>
          <p>{{ changelogSplitDesc }}</p>
        </div>
        <a
          :href="changelogSplitLink"
          :target="isExternalLink(changelogSplitLink) ? '_blank' : undefined"
          :rel="isExternalLink(changelogSplitLink) ? 'noopener noreferrer' : undefined"
          class="open-source-notice__link"
        >
          {{ changelogSplitLinkText }}
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <p class="changelog-stats">{{ changelogStatsText }}</p>
    </section>

    <section class="changelog-toolbar" aria-label="更新记录筛选">
      <div class="scope-switch" role="group" aria-label="版本范围">
        <button type="button" :class="{ 'is-active': activeScope === 'recent' }" :aria-pressed="activeScope === 'recent'" @click="activeScope = 'recent'">最近更新</button>
        <button type="button" :class="{ 'is-active': activeScope === 'all' }" :aria-pressed="activeScope === 'all'" @click="activeScope = 'all'">全部版本</button>
      </div>

      <el-input v-model="searchKeyword" class="changelog-search" clearable :prefix-icon="Search" placeholder="搜索版本、日期或功能" aria-label="搜索版本、日期或功能" />

      <span class="result-summary" aria-live="polite">{{ resultSummary }}</span>
    </section>

    <section v-loading="isLoading" class="changelog-list" aria-live="polite">
      <article v-for="(entry, entryIndex) in visibleTimelineEntries" :id="buildTimelineItemId(entry, entryIndex)" :key="`${entry.version}-${entry.id}`" class="release-card">
        <header class="release-card__header">
          <div class="release-version">
            <span class="release-version__number">{{ formatVersionLabel(entry.version) }}</span>
            <el-tag v-if="entry.badgeText" size="small" :type="entry.badgeType || 'info'">
              {{ entry.badgeText }}
            </el-tag>
          </div>
          <time :datetime="entry.date.replace(' ', 'T')">{{ entry.date }}</time>
        </header>

        <h2>{{ entry.title }}</h2>

        <div class="feature-grid">
          <section v-for="(feature, featureIndex) in entry.features" :key="`${entry.id}-feature-${featureIndex}-${feature.title}`" class="feature-block">
            <h3>{{ feature.title }}</h3>
            <ul>
              <li v-for="(point, pointIndex) in feature.points" :key="`${entry.id}-point-${featureIndex}-${pointIndex}`" v-html="normalizeTimelinePointHtml(point)"></li>
            </ul>
          </section>
        </div>
      </article>

      <div v-if="!isLoading && visibleTimelineEntries.length === 0" class="empty-result">
        <div class="empty-result__icon">⌕</div>
        <h2>没有找到匹配的更新记录</h2>
        <p>可以更换关键词，或切换到“全部版本”继续搜索。</p>
        <button type="button" @click="showAllVersions">查看全部版本</button>
      </div>
    </section>

    <el-backtop :right="24" :bottom="24" />
  </main>
</template>

<style scoped>
.changelog-page {
  width: min(1120px, 100%);
  margin: 0 auto;
  color: #1f2937;
}

.changelog-hero {
  padding: 22px 0 20px;
  border-bottom: 1px solid #e5e7eb;
}

.changelog-kicker {
  margin-bottom: 8px;
  color: #6c54ff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.changelog-hero h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.2;
}

.changelog-hero__copy > p {
  max-width: 760px;
  margin: 12px 0 0;
  color: #5f6775;
  font-size: 15px;
  line-height: 1.8;
}

.changelog-meta-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.changelog-meta-links a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  border: 1px solid #dfe3eb;
  border-radius: 8px;
  color: #4b5563;
  font-size: 13px;
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease;
}

.changelog-meta-links a:hover {
  border-color: #b9afff;
  background: #f7f5ff;
  color: #5c45e6;
}

.open-source-notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-top: 20px;
  padding: 16px 18px;
  border: 1px solid #b9dec7;
  border-radius: 8px;
  background: #f3faf6;
}

.open-source-notice h2 {
  margin: 0;
  color: #185c37;
  font-size: 15px;
}

.open-source-notice p {
  margin: 6px 0 0;
  color: #3f6750;
  font-size: 13px;
  line-height: 1.7;
}

.open-source-notice__link {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 8px;
  background: #216e45;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.open-source-notice__link:hover {
  background: #185c37;
  color: #ffffff;
}

.changelog-stats {
  margin: 14px 0 0;
  color: #8a93a3;
  font-size: 12px;
}

.changelog-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: auto minmax(220px, 360px) 1fr;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  background: rgba(255, 255, 255, 0.96);
  border-bottom: 1px solid #edf0f4;
}

.scope-switch {
  display: inline-flex;
  padding: 3px;
  border: 1px solid #dfe3eb;
  border-radius: 8px;
  background: #f7f8fa;
}

.scope-switch button {
  padding: 7px 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
}

.scope-switch button.is-active {
  background: #6c54ff;
  color: #ffffff;
}

.changelog-search :deep(.el-input__wrapper) {
  border: 1px solid #dfe3eb;
  border-radius: 8px;
  box-shadow: none !important;
}

.changelog-search :deep(.el-input__wrapper.is-focus) {
  border-color: #6c54ff;
  box-shadow: none !important;
}

.result-summary {
  justify-self: end;
  color: #8a93a3;
  font-size: 12px;
}

.changelog-list {
  min-height: 240px;
  padding-top: 18px;
}

.release-card {
  margin-bottom: 16px;
  padding: 20px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  background: #ffffff;
  scroll-margin-top: 84px;
}

.release-card__header,
.release-version {
  display: flex;
  align-items: center;
}

.release-card__header {
  justify-content: space-between;
  gap: 16px;
}

.release-version {
  flex-wrap: wrap;
  gap: 8px;
}

.release-version__number {
  color: #6c54ff;
  font-size: 17px;
  font-weight: 750;
}

.release-card time {
  flex: none;
  color: #8a93a3;
  font-size: 12px;
}

.release-card > h2 {
  margin: 12px 0 16px;
  color: #222936;
  font-size: 19px;
  line-height: 1.45;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.feature-block {
  padding: 14px 15px;
  border: 1px solid #edf0f4;
  border-radius: 8px;
  background: #fafbfc;
}

.feature-block h3 {
  margin: 0 0 8px;
  color: #374151;
  font-size: 14px;
}

.feature-block ul {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-block li {
  position: relative;
  padding-left: 13px;
  color: #626b79;
  font-size: 13px;
  line-height: 1.65;
}

.feature-block li::before {
  position: absolute;
  top: 0.68em;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #8d7aff;
  content: '';
}

.feature-block :deep(a) {
  color: #5c45e6;
  text-decoration: none;
}

.feature-block :deep(a:hover) {
  text-decoration: underline;
}

.feature-block :deep(code) {
  padding: 1px 5px;
  border-radius: 4px;
  background: #ece9ff;
  color: #5842cc;
  font-size: 0.92em;
}

.empty-result {
  padding: 58px 20px;
  border: 1px dashed #d8dde6;
  border-radius: 8px;
  text-align: center;
}

.empty-result__icon {
  color: #8d7aff;
  font-size: 32px;
}

.empty-result h2 {
  margin: 10px 0 6px;
  font-size: 17px;
}

.empty-result p {
  margin: 0;
  color: #7b8493;
  font-size: 13px;
}

.empty-result button {
  margin-top: 16px;
  padding: 8px 14px;
  border: 1px solid #6c54ff;
  border-radius: 8px;
  background: #ffffff;
  color: #5c45e6;
  cursor: pointer;
}

@media (max-width: 820px) {
  .open-source-notice {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .changelog-toolbar {
    grid-template-columns: 1fr auto;
  }

  .changelog-search {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .changelog-hero {
    padding-top: 10px;
  }

  .changelog-meta-links {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .changelog-meta-links a {
    justify-content: space-between;
  }

  .changelog-toolbar {
    top: 0;
    gap: 10px;
  }

  .scope-switch button {
    padding: 7px 10px;
  }

  .result-summary {
    text-align: right;
  }

  .release-card {
    padding: 16px;
  }

  .release-card__header {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .release-card > h2 {
    font-size: 17px;
  }

  .feature-block {
    padding: 12px;
  }
}

@media (max-width: 390px) {
  .changelog-meta-links {
    grid-template-columns: 1fr;
  }
}
</style>
