<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed, type ComponentPublicInstance } from 'vue';
import { InfoFilled } from '@element-plus/icons-vue';
import {
  getDefaultSitePublicConfig,
  getSitePublicConfig,
  type SiteChangelogTimelineItem,
  type SiteLinkItem
} from '@/services/siteConfig';

/**
 * @file Changelog.vue
 * @description 更新日志组件，用于展示 UIED-Tools 的版本更新历史
 *
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @copyright 2024-2025 All Rights Reserved.
 *
 * @author Tomda
 * @createDate 2025-01-09
 * @lastUpdate 2026-08-25 14:17
 * @version 3.0.1
 * @toolsCount 当前工具总数：334个
 */

const activeId = ref('');
const showMobileToc = ref(false);
const showBackToTop = ref(false);
const tocListRef = ref<HTMLElement | null>(null);
const tocItemRefs = ref<Record<string, HTMLElement>>({});

const defaultHeaderLinks: SiteLinkItem[] = [
  { name: 'AI学习平台', link: 'https://www.uied.cn/' },
  { name: 'AI免费工具', link: 'https://uiedtool.com' },
  { name: 'AI资讯热榜', link: 'https://hot.uied.cn' },
  { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' },
  { name: 'AI交流群', link: 'https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink' },
  { name: 'AI知识库', link: 'https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink' }
];
const headerLinks = ref<SiteLinkItem[]>(defaultHeaderLinks);
const defaultMetaLinks: SiteLinkItem[] = [
  { name: 'GitHub 源码仓库', link: 'https://github.com/Tomccc520/UIED-tools' },
  { name: '提交问题', link: 'https://github.com/Tomccc520/UIED-tools/issues' },
  { name: 'CSDN 博客', link: 'https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343' },
  { name: 'UIED技术团队', link: 'https://fsuied.com/' }
];
const changelogIntroText = ref('UIED-Tools 现已开放主站、Go API 与管理后台源码，持续以免费工具、内容与社区共建获取长期流量。');
const changelogMetaLinks = ref<SiteLinkItem[]>(defaultMetaLinks);
const changelogSplitTitle = ref('3.0.1 全栈开源说明');
const changelogSplitDesc = ref('本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。商业授权默认关闭，项目优先服务免费使用、SEO 内容和社区贡献。');
const changelogSplitLink = ref('https://github.com/Tomccc520/UIED-tools');
const changelogSplitLinkText = ref('查看完整源码与部署说明');
const changelogStatsText = ref('当前版本：3.0.1 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-08-25 14:17');
const timelineEntries = ref<SiteChangelogTimelineItem[]>(
  getDefaultSitePublicConfig().changelogTimeline.map((item) => ({
    ...item,
    features: item.features.map((feature) => ({
      title: feature.title,
      points: [...feature.points]
    }))
  }))
);

/**
 * 函数说明：判断链接是否为外部地址，用于资料链接决定是否新开标签页
 */
const isExternalLink = (link: string) => /^https?:\/\//i.test(String(link || '').trim());

/**
 * 函数说明：为更新时间线条目生成稳定的 DOM ID，供目录导航与滚动定位复用。
 */
const buildTimelineItemId = (item: SiteChangelogTimelineItem, index: number) => {
  const candidate = String(item.id || item.version || `timeline-${index + 1}`).trim();
  if (candidate) {
    return (
      candidate
        .replace(/[^\w-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || `timeline-${index + 1}`
    );
  }
  return `timeline-${index + 1}`;
};

/**
 * 函数说明：将历史 router-link 文本转换为普通锚点，保证后台时间线 HTML 片段可直接渲染。
 */
const normalizeTimelinePointHtml = (html: string) => {
  return String(html || '')
    .replace(/<router-link\b([^>]*?)\bto="([^"]+)"([^>]*)>/gi, (_match, beforeAttrs, to, afterAttrs) => {
      let anchorAttrs = `${String(beforeAttrs || '').trim()} ${String(afterAttrs || '').trim()}`
        .replace(/\s+/g, ' ')
        .trim();
      if (!/\btarget=/.test(anchorAttrs) && isExternalLink(to)) {
        anchorAttrs = `${anchorAttrs} target="_blank"`.trim();
      }
      if (/\btarget=/.test(anchorAttrs) && !/\brel=/.test(anchorAttrs)) {
        anchorAttrs = `${anchorAttrs} rel="noopener noreferrer"`.trim();
      }
      return `<a href="${to}"${anchorAttrs ? ` ${anchorAttrs}` : ''}>`;
    })
    .replace(/<\/router-link>/gi, '</a>');
};

/**
 * 函数说明：根据当前时间线列表生成目录项，避免再从 DOM 反向解析目录数据。
 */
const tocItems = computed(() =>
  timelineEntries.value.map((item, index) => ({
    id: buildTimelineItemId(item, index),
    version: item.version,
    date: item.date,
    title: item.title
  }))
);

/**
 * 函数说明：读取后台公共配置并更新更新记录页顶部说明、资料入口、开源说明和正文时间线。
 */
const loadSiteConfig = async () => {
  const siteConfig = await getSitePublicConfig({ forceRefresh: true });
  if (siteConfig.changelogHeaderLinks.length) {
    headerLinks.value = siteConfig.changelogHeaderLinks;
  }
  if (siteConfig.changelogIntroText) {
    changelogIntroText.value = siteConfig.changelogIntroText;
  }
  if (siteConfig.changelogMetaLinks.length) {
    changelogMetaLinks.value = siteConfig.changelogMetaLinks;
  }
  if (siteConfig.changelogSplitTitle) {
    changelogSplitTitle.value = siteConfig.changelogSplitTitle;
  }
  if (siteConfig.changelogSplitDesc) {
    changelogSplitDesc.value = siteConfig.changelogSplitDesc;
  }
  if (siteConfig.changelogSplitLink) {
    changelogSplitLink.value = siteConfig.changelogSplitLink;
  }
  if (siteConfig.changelogSplitLinkText) {
    changelogSplitLinkText.value = siteConfig.changelogSplitLinkText;
  }
  if (siteConfig.changelogStatsText) {
    changelogStatsText.value = siteConfig.changelogStatsText;
  }
  if (siteConfig.changelogTimeline.length) {
    timelineEntries.value = siteConfig.changelogTimeline.map((item) => ({
      ...item,
      features: item.features.map((feature) => ({
        title: feature.title,
        points: [...feature.points]
      }))
    }));
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

const setTocItemRef = (el: Element | ComponentPublicInstance | null, id: string) => {
  if (el) {
    tocItemRefs.value[id] = el as HTMLElement;
  }
};

watch(activeId, (newId) => {
  if (!newId || !tocListRef.value) return;

  const activeItem = tocItemRefs.value[newId];
  if (activeItem) {
    const container = tocListRef.value;
    const itemTop = activeItem.offsetTop;
    const itemHeight = activeItem.offsetHeight;
    const containerHeight = container.offsetHeight;

    container.scrollTo({
      top: itemTop - containerHeight / 2 + itemHeight / 2,
      behavior: 'smooth'
    });
  }
});

const scrollToVersion = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const headerOffset = 100;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    activeId.value = id;
    showMobileToc.value = false;
  }
};

let observer: IntersectionObserver | null = null;

/**
 * 函数说明：根据当前渲染后的时间线节点重建滚动观察器，保持目录高亮与后台数据同步。
 */
const initObserver = async () => {
  await nextTick();
  if (observer) {
    observer.disconnect();
  }

  const options = {
    root: null,
    rootMargin: '-100px 0px -70% 0px',
    threshold: 0
  };

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeId.value = entry.target.id;
      }
    });
  }, options);

  document.querySelectorAll('.timeline-item').forEach((section) => {
    observer?.observe(section);
  });
};

watch(
  tocItems,
  async (items) => {
    tocItemRefs.value = {};
    if (items.length === 0) {
      activeId.value = '';
      if (observer) {
        observer.disconnect();
      }
      return;
    }
    if (!items.some((item) => item.id === activeId.value)) {
      activeId.value = items[0].id;
    }
    await initObserver();
  },
  { immediate: true }
);

onMounted(() => {
  void loadSiteConfig();
  handleScroll();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
  window.removeEventListener('scroll', handleScroll);
});
</script>


<template>
  <div class="changelog-container md:mr-6 c-xs:mr-0">
    <div class="flex flex-col">
      <!-- Logo区域 -->
      <div class="flex justify-center py-6">
        <router-link class="logo-container group" to="/" target="_blank" rel="noopener noreferrer">
          <div class="flex items-center">
            <div class="logo-wrapper flex items-center">
              <svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-svg">
                <title>logo-3</title>
                <defs>
                  <polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon>
                </defs>

                <g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="logo-3">
                    <!-- 背景填充 -->
                    <rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect>

                    <!-- 新Logo 使用从左到右的描边和填充动画 -->
                    <g id="logo-copy" transform="translate(19, 24)">
                      <path
                        d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z"
                        class="svg-elem"></path>

                      <g id="group">
                        <mask id="mask-9z3bcfbp2n-2" fill="white">
                          <use xlink:href="#path-9z3bcfbp2n-1"></use>
                        </mask>
                        <g id="Clip-4"></g>
                        <path
                          d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0"
                          class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path>
                      </g>

                      <path
                        d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z"
                        class="svg-elem"></path>

                      <polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon>

                      <polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div class="tools-text font-bold ml-2">Tools</div>
          </div>
          <div class="text-xs text-gray-400 mt-2 text-center">在线免费工具集</div>
        </router-link>
      </div>

      <!-- 标题区域 -->
      <div class="header-section mb-8">
        <h1 class="text-2xl font-bold mb-4">更新日志</h1>
        <div class="text-gray-500 text-sm">
          {{ changelogIntroText }}
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-gray-500 text-sm">
          <a v-for="link in changelogMetaLinks" :key="link.name" :href="link.link"
            :target="isExternalLink(link.link) ? '_blank' : undefined" rel="noopener noreferrer"
            class="flex items-center hover:text-blue-600 transition-colors">
            <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 11-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 115.656 5.656l-1.5 1.5" />
            </svg>
            {{ link.name }}
          </a>
        </div>

        <!-- 快捷导航链接 -->
        <div class="flex flex-wrap items-center gap-3 mt-4">
          <a v-for="link in headerLinks" :key="link.name" :href="link.link"
            :target="isExternalLink(link.link) ? '_blank' : undefined" rel="noopener noreferrer"
            class="flex items-center text-gray-600 hover:text-blue-600 transition-all bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm text-sm group">
            <span class="font-medium">{{ link.name }}</span>
            <svg
              class="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1 group-hover:translate-x-0"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <div class="version-split-alert mt-4">
          <div class="split-alert-title">{{ changelogSplitTitle }}</div>
          <div class="split-alert-desc">{{ changelogSplitDesc }}</div>
          <a :href="changelogSplitLink" :target="isExternalLink(changelogSplitLink) ? '_blank' : undefined"
            rel="noopener noreferrer" class="split-alert-link">
            {{ changelogSplitLinkText }}
          </a>
        </div>

        <div class="text-gray-400 text-xs mt-4">{{ changelogStatsText }}</div>
      </div>

      <!-- 主要内容区域：时间线 + 目录 -->
      <div class="flex flex-col lg:flex-row gap-8 relative">

        <!-- Sidebar TOC -->
        <aside class="toc-sidebar hidden lg:block w-64 shrink-0 relative">
          <div class="sticky top-24 p-4 bg-white rounded-lg border border-gray-100">
            <h3 class="font-bold text-gray-800 mb-4 flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">
                </path>
              </svg>
              目录导航
            </h3>
            <div ref="tocListRef" class="toc-list max-h-[calc(100vh-200px)] overflow-y-auto relative">
              <div v-for="item in tocItems" :key="item.id" :ref="(el) => setTocItemRef(el, item.id)"
                class="toc-item cursor-pointer py-2 px-3 text-sm rounded-md transition-all duration-200 border-l-2 hover:bg-gray-50 mb-1"
                :class="[activeId === item.id ? 'border-blue-500 text-blue-600 bg-blue-50 font-medium' : 'border-transparent text-gray-500 hover:text-gray-700']"
                @click="scrollToVersion(item.id)">
                <div class="flex flex-col gap-0.5">
                  <span class="font-medium truncate" :title="item.title">{{ item.title }}</span>
                  <div class="flex justify-between items-center text-xs opacity-75">
                    <span>{{ item.version }}</span>
                    <span>{{ item.date.split(' ')[0] }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 时间线区域 -->
        <div class="timeline-container flex-1 w-full">
          <div
            v-for="(entry, entryIndex) in timelineEntries"
            :id="buildTimelineItemId(entry, entryIndex)"
            :key="buildTimelineItemId(entry, entryIndex)"
            class="timeline-item"
          >
            <div class="version-tag">
              <span class="version">{{ entry.version }}</span>
              <span class="date">{{ entry.date }}</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag v-if="entry.badgeText" size="small" :type="entry.badgeType || 'info'" class="mr-2">{{ entry.badgeText }}</el-tag>
                <span class="text-gray-700">{{ entry.title }}</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li
                    v-for="(feature, featureIndex) in entry.features"
                    :key="`${buildTimelineItemId(entry, entryIndex)}-feature-${featureIndex}`"
                  >
                    <div class="feature-title">{{ feature.title }}</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li
                          v-for="(point, pointIndex) in feature.points"
                          :key="`${buildTimelineItemId(entry, entryIndex)}-feature-${featureIndex}-point-${pointIndex}`"
                          v-html="normalizeTimelinePointHtml(point)"
                        ></li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Mobile TOC Trigger -->
      <div class="lg:hidden fixed bottom-6 right-6 z-50">
        <button @click="showMobileToc = !showMobileToc"
          class="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center w-12 h-12">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile TOC Drawer -->
      <transition name="fade">
        <div v-if="showMobileToc" class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          @click="showMobileToc = false">
          <div class="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 overflow-y-auto" @click.stop>
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-lg">目录导航</h3>
              <button @click="showMobileToc = false" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-1">
              <div v-for="item in tocItems" :key="item.id" class="py-3 px-4 rounded-lg text-sm transition-colors"
                :class="[activeId === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50']"
                @click="scrollToVersion(item.id)">
                <div class="flex justify-between">
                  <span>{{ item.title }}</span>
                  <span class="text-xs text-gray-400">{{ item.date.split(' ')[0] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 页脚说明 -->
      <div class="footer-section mt-8">
        <div class="text-sm text-gray-500">
          <el-icon class="mr-1">
            <InfoFilled />
          </el-icon>
          本更新日志记录了 UIED-Tools 的主要功能更新和版本变更信息
        </div>
      </div>

      <!-- 返回顶部 -->
      <el-backtop :right="40" :bottom="40" />
    </div>
  </div>
</template>

<style scoped>
/* Logo 相关样式 */
/* 移除字体声明 */
.changelog-container {
  margin: 0 auto;
  padding: 2rem;
}

/* 标题使用系统字体 */
.header-section h1 {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.version-split-alert {
  border: 1px solid #b7d8c3;
  background: #f2faf5;
  border-radius: 8px;
  padding: 14px 16px;
}

.split-alert-title {
  font-size: 14px;
  font-weight: 700;
  color: #17633a;
}

.split-alert-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #315b45;
}

.split-alert-link {
  margin-top: 8px;
  display: inline-flex;
  font-size: 13px;
  color: #1d4ed8;
  text-decoration: none;
}

.split-alert-link:hover {
  color: #1e40af;
}

.version {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 600;
  color: #6C54FF;
  font-size: 1.1rem;
}

.feature-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 0.25rem;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--el-border-color-light);
}

.timeline-item {
  position: relative;
  margin-bottom: 3rem;
  scroll-margin-top: 120px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -2.4rem;
  top: 0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #6C54FF;
  border: 2px solid white;
  z-index: 1;
}

.version-tag {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

.content-card {
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.card-header {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {

  padding-left: 1.5rem;
  position: relative;
}

.feature-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-success);
}

.feature-desc {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 1rem;
  display: flex;
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .changelog-container {
    padding: 1rem;
  }

  .timeline-container {
    padding-left: 1.5rem;
  }

  .timeline-item::before {
    left: -1.9rem;
  }

  .content-card {
    padding: 1rem;
  }
}

/* Logo 相关样式 */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

/* 自定义 el-tag 样式 */
:deep(.el-tag--primary) {
  --el-color-primary: #6C54FF;
  --el-color-primary-light-3: #8A72FF;
  --el-color-primary-light-5: #A590FF;
  --el-color-primary-light-7: #C0AEFF;
  --el-color-primary-light-8: #CEBEFF;
  --el-color-primary-light-9: #DCD1FF;
  --el-color-primary-dark-2: #5842CC;
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

.logo-wrapper {
  background: #6C54FF;
  border-radius: 6px;
  padding: 1px;
  transition: all 0.3s ease;
  height: 32px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-wrapper:hover {
  transform: translateY(-1px);
}

.logo-svg {
  transform: scale(1.1);
  margin: 0 auto;
}

/* SVG Logo 动画样式 */
.svg-elem {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  stroke-width: 1;
  fill: transparent;
  stroke: #fff;
  stroke-linejoin: round;
  stroke-linecap: round;
  animation: draw 2s linear forwards, fill-color 2s linear forwards;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1000;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fill-color {
  0% {
    fill: transparent;
  }

  100% {
    fill: #fff;
  }
}

#矩形 {
  fill: #6C54FF;
}

/* Tools 文字样式 */
.tools-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6C54FF;
  opacity: 0;
  animation: fade-in 0.3s ease-out 1s forwards;
  letter-spacing: 0.5px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 替换所有的 router-link 链接颜色 */
router-link,
a {
  color: #6C54FF;
}

router-link:hover,
a:hover {
  color: #5842cc;
}

/* Hide scrollbar for Chrome, Safari and Opera */
::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
html,
body {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.toc-list::-webkit-scrollbar {
  display: none;
}

.toc-list {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  -webkit-overflow-scrolling: touch;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
