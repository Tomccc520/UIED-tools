<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
import { computed, onMounted, ref } from 'vue'
import {
  getDefaultSitePublicConfig,
  getSitePublicConfig,
  type SiteLinkItem,
  type SiteLinkSection,
  type SitePublicConfig
} from '@/services/siteConfig'

const siteConfig = ref<SitePublicConfig>(getDefaultSitePublicConfig())

const defaultFooterLinks = [
  { name: '粤ICP备2022056875号', link: 'https://beian.miit.gov.cn/' },
  { name: '网站地图', link: '/sitemap.xml' }
]

const defaultQuickSections: SiteLinkSection[] = [
  {
    title: '设计',
    items: [
      { name: '色彩对比度', link: '/tools/design/contrast-checker' },
      { name: 'CSS阴影', link: '/tools/design/box-shadow' },
      { name: '黄金比例', link: '/tools/design/golden-ratio' },
      { name: 'Blob生成器', link: '/tools/design/blob-maker' },
      { name: '玻璃拟态', link: '/tools/design/glassmorphism' }
    ]
  },
  {
    title: '图像',
    items: [
      { name: '图片压缩', link: '/tools/image-compress' },
      { name: '二维码生成', link: '/tools/qrcode' },
      { name: '图片切割', link: '/tools/img-cut' },
      { name: '图片处理', link: '/tools/signimage' },
      { name: 'GIF压缩', link: '/tools/gif-compress' }
    ]
  },
  {
    title: 'PDF',
    items: [
      { name: '图片转PDF', link: '/tools/img-to-pdf' },
      { name: 'PDF转图片', link: '/tools/pdf-to-images' },
      { name: 'PDF合并', link: '/tools/pdf-merge' },
      { name: 'PDF分割', link: '/tools/pdf-split' }
    ]
  },
  {
    title: '文本',
    items: [
      { name: '文本对比', link: '/tools/diff' },
      { name: 'Markdown编辑', link: '/tools/markdown' },
      { name: '字数统计', link: '/tools/wordcount' }
    ]
  },
  {
    title: '开发',
    items: [
      { name: 'JSON转换', link: '/tools/json' },
      { name: '正则测试', link: '/tools/reg' },
      { name: '时间戳', link: '/tools/timetran' }
    ]
  },
  {
    title: '文案',
    items: [
      { name: '疯狂星期四', link: '/tools/copywriting/kfc' },
      { name: '今日诗词', link: '/tools/copywriting/daily-poem' },
      { name: '舔狗日记', link: '/tools/copywriting/dog-diary' },
      { name: '朋友圈文案', link: '/tools/copywriting/moments' }
    ]
  }
]

const defaultFriendSections: SiteLinkSection[] = [
  {
    title: 'AI',
    items: [
      { name: 'AI文章', link: 'https://www.uied.cn/category/aigc/ai' },
      { name: 'AI资讯', link: 'https://hot.uied.cn/ai-realtime' },
      { name: 'AI工具', link: 'https://hao.uied.cn/ai' },
      { name: 'AI知识库', link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink' },
      { name: 'AI交流群', link: 'https://www.uied.cn/wechat' }
    ]
  },
  {
    title: '教程',
    items: [
      { name: 'UI文章', link: 'https://www.uied.cn/category/wenzhang/ui-wenzhang' },
      { name: '平面文章', link: 'https://www.uied.cn/category/wenzhang/pingmian-wenzhang' },
      { name: '设计干货', link: 'https://www.uied.cn/category/wenzhang/ganhuo' },
      { name: '效率工具', link: 'https://www.uied.cn/category/wenzhang/tool' },
      { name: 'AI文章', link: 'https://www.uied.cn/category/aigc/ai' },
      { name: '开源项目', link: 'https://www.uied.cn/category/code/kaiyuan' }
    ]
  },
  {
    title: '设计',
    items: [
      { name: '设计文章', link: 'https://www.uied.cn/category/wenzhang/ui-wenzhang' },
      { name: '设计导航', link: 'https://hao.uied.cn/' },
      { name: '设计工具', link: 'https://uiedtool.com/' },
      { name: '设计资讯', link: 'https://hot.uied.cn/' }
    ]
  },
  {
    title: '其他',
    items: [
      { name: 'AIGC学习网站', link: 'https://uied.cn' },
      { name: 'UIED技术团队', link: 'https://fsuied.com' },
      { name: '拜拜导航', link: 'https://www.88sheji.cn/' },
      { name: 'Tomda', link: 'https://www.tomda.top/' },
      { name: '申请友链', link: 'https://fsuied.com/contact.html' }
    ]
  }
]

const defaultOfficialMediaLinks: SiteLinkItem[] = [
  { name: '知乎', link: 'https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi' },
  { name: '小红书', link: 'https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83' },
  { name: '微博', link: 'https://weibo.com/u/7542146005' },
  { name: 'B站', link: 'https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0' }
]

const defaultFooterIntro = '{webName} 是由 UIED技术团队 设计开发的在线工具平台'
const defaultFooterQuickTitle = '工具快捷入口'
const defaultFooterFriendTitle = '友情链接'
const defaultOfficialMediaTitle = '官方媒体'
const defaultFooterSupportLabel = '技术支持'
const defaultFooterSupportLinks: SiteLinkItem[] = [
  { name: 'Tomda', link: 'https://www.tomda.top/' },
  { name: 'UIED技术团队', link: 'https://fsuied.com' }
]

const displayWebName = computed(() => siteConfig.value.webName || 'UIED-Tools')
const footerIntroText = computed(() => {
  const introText = (siteConfig.value.footerIntro || defaultFooterIntro).trim() || defaultFooterIntro
  return introText.replace(/\{webName\}/g, displayWebName.value)
})
const footerQuickTitle = computed(() => {
  return (siteConfig.value.footerQuickTitle || defaultFooterQuickTitle).trim() || defaultFooterQuickTitle
})
const footerFriendTitle = computed(() => {
  return (siteConfig.value.footerFriendTitle || defaultFooterFriendTitle).trim() || defaultFooterFriendTitle
})
const officialMediaTitle = computed(() => {
  return (siteConfig.value.officialMediaTitle || defaultOfficialMediaTitle).trim() || defaultOfficialMediaTitle
})
const footerSupportLabel = computed(() => {
  return (siteConfig.value.footerSupportLabel || defaultFooterSupportLabel).trim() || defaultFooterSupportLabel
})
const footerLinks = computed(() => {
  return siteConfig.value.copyright.length ? siteConfig.value.copyright : defaultFooterLinks
})
const quickSections = computed(() => {
  return siteConfig.value.footerQuickSections.length ? siteConfig.value.footerQuickSections : defaultQuickSections
})
const friendSections = computed(() => {
  return siteConfig.value.footerFriendSections.length ? siteConfig.value.footerFriendSections : defaultFriendSections
})
const officialMediaLinks = computed(() => {
  return siteConfig.value.officialMediaLinks.length ? siteConfig.value.officialMediaLinks : defaultOfficialMediaLinks
})
const footerSupportLinks = computed(() => {
  return siteConfig.value.footerSupportLinks.length ? siteConfig.value.footerSupportLinks : defaultFooterSupportLinks
})
const currentYear = computed(() => String(new Date().getFullYear()))

/**
 * 函数说明：判断链接是否为外部地址，用于控制跳转目标
 */
const isExternalLink = (link: string) => link.startsWith('http://') || link.startsWith('https://')

/**
 * 函数说明：加载后台公共站点配置并更新页脚展示内容
 */
const loadSiteConfig = async () => {
  siteConfig.value = await getSitePublicConfig()
}

onMounted(() => {
  void loadSiteConfig()
})
</script>

<template>
  <footer class="bg-white border-t border-gray-100 rounded-xl" role="contentinfo" aria-label="页面底部" itemscope
    itemtype="http://schema.org/WPFooter">
    <div class="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
      <div class="flex flex-col items-center justify-center space-y-6">
        <router-link class="logo-container group" to="/" aria-label="返回首页" :title="`${displayWebName} 首页`">
          <div class="flex items-center gap-3">
            <div class="logo-wrapper flex items-center" aria-hidden="true">
              <svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-svg">
                <title>UIED Tools Logo</title>
                <defs>
                  <polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon>
                </defs>

                <g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="logo-3">
                    <rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect>
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
            <div class="tools-text font-bold" aria-label="UIED Tools">Tools</div>
          </div>
        </router-link>

        <div class="w-full max-w-6xl mx-auto grid grid-cols-1 gap-6">
          <nav class="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="底部导航">
            <section class="w-full" aria-labelledby="quick-tools">
              <h2 id="quick-tools" class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span class="w-1 h-5 bg-[#6C54FF] rounded-full"></span>
                {{ footerQuickTitle }}
              </h2>
              <div class="flex flex-col space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4" v-for="section in quickSections"
                  :key="`quick-${section.title}`">
                  <span class="text-sm font-medium text-gray-900 shrink-0">{{ section.title }}：</span>
                  <div class="flex flex-wrap gap-x-4 gap-y-2">
                    <a v-for="item in section.items" :key="`${section.title}-${item.name}-${item.link}`" :href="item.link"
                      :target="isExternalLink(item.link) ? '_blank' : '_self'"
                      :rel="isExternalLink(item.link) ? 'noopener noreferrer' : undefined"
                      class="text-sm text-gray-500 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      {{ item.name }}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section class="w-full" aria-labelledby="friend-links">
              <h2 id="friend-links" class="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span class="w-1 h-5 bg-[#6C54FF] rounded-full"></span>
                {{ footerFriendTitle }}
              </h2>
              <div class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4" v-for="section in friendSections"
                  :key="`friend-${section.title}`">
                  <span class="text-sm font-medium text-gray-900 shrink-0 mt-1">{{ section.title }}：</span>
                  <div class="flex flex-wrap gap-x-4 gap-y-2">
                    <a v-for="item in section.items" :key="`${section.title}-${item.name}-${item.link}`" :href="item.link"
                      target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-500 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      {{ item.name }}
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <section class="w-full md:col-span-2" aria-labelledby="official-media">
              <h2 id="official-media" class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span class="w-1 h-5 bg-[#6C54FF] rounded-full"></span>
                {{ officialMediaTitle }}
              </h2>
              <div class="flex flex-wrap gap-x-6 gap-y-3">
                <a v-for="item in officialMediaLinks" :key="`${item.name}-${item.link}`" :href="item.link" target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-sm text-gray-500 hover:text-[#6C54FF] transition-colors whitespace-nowrap group">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[#6C54FF] transition-colors"></span>
                  {{ item.name }}
                </a>
              </div>
            </section>
          </nav>
        </div>

        <div class="w-full flex flex-col items-center text-sm text-gray-500 border-t border-gray-100 pt-8 space-y-4">
          <div class="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex flex-col space-y-3 text-center md:text-left">
              <div class="leading-relaxed">
                {{ footerIntroText }}
              </div>
              <div class="flex items-center justify-center md:justify-start gap-2 text-gray-400 flex-wrap">
                <span>{{ footerSupportLabel }}：</span>
                <a
                  v-for="(item, index) in footerSupportLinks"
                  :key="`${item.name}-${item.link}`"
                  :href="item.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-gray-500 hover:text-[#6C54FF] transition-colors"
                >
                  {{ item.name }}
                </a>
              </div>
            </div>

            <div class="flex flex-col items-center md:items-end space-y-3">
              <div class="text-gray-400" itemprop="copyrightNotice">
                <meta itemprop="copyrightYear" :content="currentYear">
                © {{ currentYear }} {{ displayWebName }}. All rights reserved.
              </div>
              <div class="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                <a v-for="link in footerLinks" :key="`${link.name}-${link.link}`" :href="link.link || '#'"
                  :target="isExternalLink(link.link) ? '_blank' : '_self'"
                  :rel="isExternalLink(link.link) ? 'noopener noreferrer' : undefined"
                  class="hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  {{ link.name }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media (max-width: 640px) {
  .gap-4 {
    gap: 0.75rem;
  }

  .px-6 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .space-x-4>*+* {
    margin-left: 0.75rem;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .justify-center {
    justify-content: center;
  }

  .text-center {
    text-align: center;
  }
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.logo-wrapper {
  background: #6C54FF;
  border-radius: 6px;
  padding: 1px;
  box-shadow: 0 4px 6px -1px rgba(108, 84, 255, 0.1), 0 2px 4px -1px rgba(108, 84, 255, 0.06);
  height: 32px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-svg {
  transform: scale(1.1);
  margin: 0 auto;
}

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

.tools-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6C54FF;
  letter-spacing: 0.5px;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
}
</style>
