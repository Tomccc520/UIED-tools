# 创建新文件
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type ComponentPublicInstance } from 'vue';

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
 * @lastUpdate 2025-12-03 16:00
 * @version Beta 2.3.3
 * @toolsCount 当前工具总数：90个
 */

const tocItems = ref<{ id: string; version: string; date: string; title: string }[]>([]);
const activeId = ref('');
const showMobileToc = ref(false);
const showBackToTop = ref(false);
const tocListRef = ref<HTMLElement | null>(null);
const tocItemRefs = ref<Record<string, HTMLElement>>({});

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

    // Scroll to center the item
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

const initObserver = () => {
  const options = {
    root: null,
    // Detect when the element is in the top half of the viewport
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
    if (observer) observer.observe(section);
  });
};

onMounted(() => {
  // Generate TOC from DOM
  const items = document.querySelectorAll('.timeline-item');
  const newToc: typeof tocItems.value = [];

  items.forEach((item, index) => {
    const versionEl = item.querySelector('.version');
    const dateEl = item.querySelector('.date');
    const titleEl = item.querySelector('.card-header .text-gray-700');

    if (versionEl) {
      const version = versionEl.textContent?.trim() || `v-${index}`;
      const date = dateEl?.textContent?.trim() || '';
      const title = titleEl?.textContent?.trim() || '版本更新';

      // Create valid ID
      const id = `version-${version.replace(/[^\w-]/g, '-')}`;
      item.id = id;
      newToc.push({ id, version, date, title });
    }
  });

  tocItems.value = newToc;

  // Initialize scroll spy
  setTimeout(() => {
    initObserver();
  }, 100);

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
          由 <a href="https://tomda.top/" target="_blank" rel="noopener noreferrer"
            class="text-blue-500 hover:text-blue-600">Tomda</a> 开发（AI协助）并记录
          UIED-Tools 的开发历程和功能更新。公众号：Tomda
        </div>
        <div class="flex items-center space-x-4 mt-2 text-gray-500 text-sm">
          <a href="https://github.com/Tomccc520/UIED-tools" target="_blank" rel="noopener noreferrer"
            class="flex items-center hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub 仓库
          </a>
          <a href="https://gitee.com/tomdac/uied-tools" target="_blank" rel="noopener noreferrer"
            class="flex items-center hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z" />
            </svg>
            Gitee 仓库
          </a>
          <a href="https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343" target="_blank" rel="noopener noreferrer"
            class="flex items-center hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5 mr-1" viewBox="0 0 1024 1024" fill="currentColor">
              <path d="M0 0h1024v1024H0z" fill="#FF6633"></path>
              <path
                d="M698.9824 42.3936c-158.8736-32.5632-289.536 31.2832-324.9152 48.5888-94.72 46.2848-147.712 108.288-174.4896 140.288-25.9584 31.0272-82.7392 105.9328-108.288 215.8592-21.6576 93.1328-10.752 167.7824-6.0416 194.2528 11.4688 64.3072 33.28 186.88 150.4256 275.2 132.5056 99.8912 293.4784 85.5552 342.9888 80.9472 107.264-10.0352 289.4848-57.2928 300.8512-145.7152 5.1712-39.936-24.4224-89.4464-66.2016-102.5024-65.6384-20.5312-108.3392 63.5392-228.6592 80.9472-8.5504 1.2288-126.5664 16.6912-216.6272-48.5888-105.8816-76.6976-98.9696-211.3024-96.256-264.3968 1.536-30.5664 5.5808-93.5424 48.128-161.8944 14.7968-23.7568 60.3136-94.5664 156.4672-134.912 25.2928-10.5984 76.8512-31.5904 144.4352-26.9824 70.0416 4.7616 120.9856 34.5088 144.4352 48.5888 75.8272 45.4144 86.528 90.0608 120.3712 86.3232 35.8912-3.9424 69.9904-59.2896 66.2016-107.9296-7.424-93.7984-155.5968-158.1056-252.8256-178.0736z"
                fill="#FFFFFF"></path>
            </svg>
            CSDN 博客
          </a>
          <a href="https://fsuied.com/" target="_blank" rel="noopener noreferrer"
            class="flex items-center hover:text-blue-600 transition-colors">
            <svg class="w-5 h-5 mr-1" viewBox="0 0 500 500" fill="currentColor">
              <g id="520" stroke="none" stroke-width="1" fill-rule="evenodd">
                <g id="uied">
                  <path
                    d="M50,0 L450,0 C477.614237,-5.07265313e-15 500,22.3857625 500,50 L500,450 C500,477.614237 477.614237,500 450,500 L50,500 C22.3857625,500 1.69088438e-15,477.614237 0,450 L0,50 C-3.38176876e-15,22.3857625 22.3857625,3.38176876e-15 50,0 Z M212.021661,187 L196.281588,299.620652 C195.703971,303.602926 193.947052,306.881017 191.01083,309.454926 C188.074609,312.028835 184.632972,313.315789 180.685921,313.315789 L167.400722,313.315789 L183.429603,198.655436 C183.910951,195.255934 185.427196,192.463486 187.978339,190.278091 C190.529483,188.092697 193.489771,187 196.859206,187 L212.021661,187 Z M87.1119134,187 L77.1480144,257.515389 C76.8592058,259.846476 76.7148014,262.03187 76.7148014,264.071572 C76.7148014,272.618892 79.3140794,279.077946 84.5126354,283.448734 C89.6149218,287.819523 96.3056558,290.004917 104.584838,290.004917 C113.056558,290.004917 120.036101,287.67383 125.523466,283.011655 C131.01083,278.252352 134.33213,271.356219 135.487365,262.323256 L144.151625,200.695137 C144.729242,196.712863 146.486161,193.434772 149.422383,190.860863 C152.358604,188.286954 155.752106,187 159.602888,187 L172.166065,187 L161.33574,264.508651 C156.907341,296.852486 137.990373,313.024404 104.584838,313.024404 C87.0637786,313.024404 73.5860409,309.04213 64.1516245,301.077581 C54.7172082,293.015905 50,281.894676 50,267.713895 C50,264.508651 50.2406739,261.206277 50.7220217,257.806775 L58.9530686,200.549445 C59.6269555,196.567171 61.4079422,193.313361 64.2960289,190.788017 C67.1841155,188.262672 70.5535499,187 74.4043321,187 L87.1119134,187 Z M326.534296,187 L325.234657,196.178656 C324.849579,198.704 323.742479,200.767984 321.913357,202.370606 C320.084236,203.973229 317.966306,204.77454 315.559567,204.77454 L258.519856,204.77454 L254.043321,237.409761 L312.238267,237.409761 L309.350181,258.098161 L251.155235,258.098161 L245.812274,292.773083 L311.805054,292.773083 L311.083032,299.912038 C310.505415,303.797183 308.820698,307.002428 306.028881,309.527773 C303.237064,312.053117 299.963899,313.315789 296.209386,313.315789 L216.209386,313.315789 L231.516245,204.337461 C232.286402,199.286772 234.524669,195.134523 238.231047,191.880714 C241.937425,188.626905 246.293622,187 251.299639,187 L326.534296,187 Z M385.451264,187.145693 C406.341757,187.145693 422.322503,192.827718 433.393502,204.191768 C444.464501,215.652947 450,230.4165 450,248.482426 C450,267.033995 444.320096,282.477448 432.960289,294.812785 C421.696751,307.050993 407.689531,313.170097 390.938628,313.170097 L326.534296,313.170097 L341.98556,200.986523 L342.06209,200.552325 C342.789822,196.670463 344.569366,193.48854 347.400722,191.006556 C350.336943,188.432647 353.77858,187.145693 357.725632,187.145693 Z M380.397112,208.271171 L367.545126,208.271171 L355.99278,292.190311 L380.974729,292.190311 C393.971119,292.190311 404.127557,288.062344 411.444043,279.80641 C418.856799,271.550477 422.563177,261.01202 422.563177,248.19104 C422.563177,236.341346 418.760529,226.725612 411.155235,219.343835 C403.54994,211.962059 393.297232,208.271171 380.397112,208.271171 Z">
                  </path>
                </g>
              </g>
            </svg>
            UIED技术团队
          </a>
        </div>
        <div class="text-gray-400 text-xs mt-2">
          当前工具总数：90个 | 最后更新：2025-12-03 16:00
        </div>
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

          <!-- Version 2.3.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.3.3</span>
              <span class="date">2025-12-03 16:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">更新</el-tag>
                <span class="text-gray-700">AI对话助手与DeepSeek R1重大更新</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">
                      <router-link to="/tools/ai/chat"
                        class="hover:text-blue-600 transition-colors flex items-center gap-2 group" target="_blank">
                        AI对话助手 (AIChat) 界面重构
                        <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </router-link>
                    </div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>界面升级</strong>：采用 Ant Design X 极简风格，优化输入框圆角与阴影，提升视觉体验。</li>
                        <li><strong>交互优化</strong>：办公智能体移至主对话区“快速提示词”，新增代码解释、周报生成等8种常用场景。</li>
                        <li><strong>功能增强</strong>：新增系统提示词与温度设置功能；顶部增加AI知识库等实用导航链接（新窗口打开）。</li>
                        <li><strong>细节打磨</strong>：模型选择增加SVG图标，消息气泡样式微调，响应式布局优化。</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">
                      <router-link to="/tools/ai/deepseek-r1"
                        class="hover:text-blue-600 transition-colors flex items-center gap-2 group" target="_blank">
                        DeepSeek R1 修复与优化
                        <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none"
                          stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      </router-link>
                    </div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>修复 CSS 构建错误，优化思考动画与代码块样式。</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.3.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.3.2</span>
              <span class="date">2025-12-03 10:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">免费在线文本配音工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">文本转语音功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种角色声音选择（少女音、阳光男声、成熟女声等）</li>
                        <li>提供丰富的情感风格（愉快、悲伤、严肃等）</li>
                        <li>一键生成自然流畅的语音，支持在线试听与下载</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/text-to-speech"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li><strong>图片提示词反推工具</strong>：优化UI设计，精简模型选择，提升反推体验</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.3.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.3.1</span>
              <span class="date">2025-12-02 16:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">新增</el-tag>
                <span class="text-gray-700">免费图片提示词反推工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">核心功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持图片上传与URL输入反推提示词</li>
                        <li>通用模型精准识别，中文结果输出</li>
                        <li>一键复制反推结果，便捷高效</li>
                      </ul>
                    </div>
                  </li>
                  <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/prompt-reverse"
                    class="text-blue-500 hover:text-blue-600 inline-block mt-1">立即体验 →</router-link>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.3.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.3.0</span>
              <span class="date">2025-12-02 15:30</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="danger" class="mr-2">重磅</el-tag>
                <span class="text-gray-700">星座运势工具全新升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">视觉与交互重构</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>全新 <strong>深空主题UI</strong>，融合毛玻璃拟态设计，沉浸感十足</li>
                        <li>新增 <strong>横向滚动星座选择器</strong>，配合流畅动效，切换更丝滑</li>
                        <li>重构 <strong>响应式网格布局</strong>，完美适配移动端与桌面端显示</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能与体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>新增 <strong>文案完整性智能检测</strong>，自动处理截断问题，确保内容完整</li>
                        <li>优化 <strong>分享卡片生成算法</strong>，支持动态高度与高清渲染</li>
                        <li>集成 <strong>SEO 结构化数据</strong> 与语义化文件名，提升搜索可见性</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/horoscope"
                          class="text-blue-500 hover:text-blue-600 inline-block mt-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.9</span>
              <span class="date">2025-12-02 11:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="danger" class="mr-2">重磅</el-tag>
                <span class="text-gray-700">免费应用图标生成器全新升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">核心功能增强</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持 <strong>多格式导出 (PNG/SVG/ICO)</strong>，满足全平台开发需求</li>
                        <li>新增 <strong>自定义尺寸设置</strong> (16x16 至 1024x1024)，灵活适配各种场景</li>
                        <li>支持 <strong>实时预览</strong> 与 <strong>多图层编辑</strong>，设计效果所见即所得</li>
                        <li>内置 <strong>多平台预设</strong> (iOS/Android/Web)，一键生成标准图标包</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/icon-generator"
                          class="text-blue-500 hover:text-blue-600 inline-block mt-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">性能与体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>采用 <strong>异步渲染引擎</strong> 与 <strong>智能缓存机制</strong>，操作流畅无卡顿</li>
                        <li>全新 <strong>响应式布局</strong>，完美适配移动端与桌面端操作</li>
                        <li>纯前端处理，<strong>数据不上传</strong>，完全保护用户隐私</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.8</span>
              <span class="date">2025-12-01 14:30</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">PDF 压缩工具全新升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">核心压缩算法重构</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>引入 <strong>DPI 智能光栅化技术</strong>，完美升级压缩策略，平衡体积与清晰度</li>
                        <li>新增 <strong>灰度模式 (Grayscale)</strong>，去除冗余色彩信息，极致压缩文档体积</li>
                        <li>支持 <strong>自定义图片质量 (0-100%)</strong>，精准控制压缩比率</li>
                        <li>优化文件大小限制，支持最大 <strong>100MB</strong> 单文件处理</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-compress"
                          class="text-blue-500 hover:text-blue-600 inline-block mt-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>全新 <strong>简洁扁平化设计</strong>，去除多余阴影，视觉更清爽</li>
                        <li><strong>高级设置</strong> 默认展开，参数调整更直观便捷</li>
                        <li>新增 <strong>重新压缩</strong> 功能，参数不满意可随时调整重试</li>
                        <li>实时显示 <strong>压缩进度</strong> 与 <strong>体积对比</strong>，效果一目了然</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.7</span>
              <span class="date">2025-12-01 10:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">GIF 压缩工具体验升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">核心功能升级</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>新增 <strong>Dithering (抖动算法)</strong> 选项，有效提升低色彩模式下的画质表现，减少色彩断层</li>
                        <li>新增 <strong>自定义尺寸</strong> 输入功能，支持宽高比例自动锁定与智能调整</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/gif-compress"
                          class="text-blue-500 hover:text-blue-600 inline-block mt-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互与视觉优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>重构界面布局，将 <strong>效果对比</strong> 直接整合至预览区域，对比效果一目了然</li>
                        <li>优化 <strong>使用说明</strong> 模块，拆分为功能特性与常见问题 (FAQ) 两个板块，阅读体验更佳</li>
                        <li>统一全站设计风格，去除多余阴影，视觉体验更加清爽简洁</li>
                        <li>修复部分 TypeScript 类型定义问题，提升代码稳定性与运行效率</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.6 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.6</span>
              <span class="date">2025-09-25 16:30</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">国庆专属头像工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">国庆专属头像生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持上传个人头像，一键生成国庆主题头像</li>
                        <li>支持JPG、PNG格式图片上传，最大文件大小5MB</li>
                        <li>实时预览效果，所见即所得的编辑体验</li>
                        <li>一键下载生成的国庆头像，方便社交媒体使用</li>
                        <li>移动端优化设计，完美适配手机操作</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/avatar/national-day"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>使用Canvas技术进行高质量图像处理和合成</li>
                        <li>参考移动端原生应用设计，提供流畅的用户体验</li>
                        <li>圆形头像预览区域，符合现代UI设计趋势</li>
                        <li>大按钮设计，便于移动端触摸操作</li>
                        <li>渐变背景和阴影效果，提升视觉层次感</li>
                        <li>完整的错误处理和用户提示系统</li>
                        <li>本地处理，保护用户隐私安全</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">技术实现亮点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>Vue 3 Composition API架构，代码结构清晰</li>
                        <li>TypeScript类型安全，提升开发效率</li>
                        <li>响应式布局设计，适配各种屏幕尺寸</li>
                        <li>集成到工具列表和路由系统，无缝融入平台</li>
                        <li>添加版权信息和开发团队标识</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.5</span>
              <span class="date">2025-05-11 10:39</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI简历生成器工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI简历生成器功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种专业简历模板，提供简约、现代、清新、极简、扁平等风格</li>
                        <li>集成AI内容生成功能，智能创建个人简介和工作经历描述</li>
                        <li>提供快速模板填充，包含前端、后端、全栈、产品、设计等多种职业预设</li>
                        <li>支持实时预览和一键导出PDF</li>
                        <li>本地存储功能，确保数据不丢失</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/resume"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>响应式设计，适配桌面和移动设备</li>
                        <li>支持头像上传和编辑功能</li>
                        <li>教育背景和工作经验可动态添加删除</li>
                        <li>技能标签智能展示，支持逗号分隔输入</li>
                        <li>高质量PDF导出，排版清晰专业</li>
                        <li>内置职业化指导建议，帮助求职者更好地展示自己</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.4</span>
              <span class="date">2025-05-05 19:20</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">摸头GIF生成器工具优化上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">摸头GIF生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持上传图片生成可爱的摸头GIF动画</li>
                        <li>支持JPG/PNG格式，文件大小不超过10MB</li>
                        <li>提供多种参数调整：尺寸(15%-200%)、形变度(0%-150%)、速度(0.5x-5x)</li>
                        <li>支持图片翻转和实时预览功能</li>
                        <li>支持透明背景导出，更好地与各种背景融合</li>
                        <li>支持通过URL添加图片，方便远程图片处理</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/avatar/rua"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>使用Canvas实现高质量动画预览</li>
                        <li>采用精灵图(sprite sheet)处理手部动画，效果更自然</li>
                        <li>提供播放/暂停控制，优化预览体验</li>
                        <li>优雅的UI设计，左侧预览右侧控制的布局</li>
                        <li>全局响应式设计，适配移动端和桌面端</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.3</span>
              <span class="date">2025-05-05 15:45</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">摸鱼日历工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">摸鱼日历功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>展示工资发放倒计时、距离周末天数等摸鱼信息</li>
                        <li>提供丰富的节日倒计时（12个最近节日）</li>
                        <li>显示每日摸鱼名言和小贴士</li>
                        <li>支持一键复制为图片分享</li>
                        <li>本地处理，无需联网获取数据</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/fish-calendar"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优雅的卡片设计和布局</li>
                        <li>日期和工作日信息展示</li>
                        <li>薪资发放日期倒计时</li>
                        <li>年度重要节日倒计时</li>
                        <li>响应式设计，完美适配移动设备</li>
                        <li>简洁直观的图片复制分享功能</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.2</span>
              <span class="date">2025-03-18 17:08</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">图片转SVG矢量图工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">图片转SVG功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持JPG、PNG、GIF等格式图片转换为SVG矢量图</li>
                        <li>提供多种转换参数设置，包括颜色提取、曲线优化等</li>
                        <li>支持实时预览和对比效果</li>
                        <li>本地处理，无需上传服务器，保护隐私</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/image-to-svg"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持彩色和黑白SVG转换模式</li>
                        <li>提供专业的参数调节面板</li>
                        <li>支持SVG代码复制和下载</li>
                        <li>优化的转换算法，确保最佳效果</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.1</span>
              <span class="date">2025-03-13 19:57</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">搜索功能全面升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI搜索体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>修复推理过程图标显示问题，优化视觉体验</li>
                        <li>重新设计AI头像显示方案，提高跨平台兼容性</li>
                        <li>解决回车键搜索响应问题，提升使用便捷性</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">错误处理机制优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>增强API超时智能处理，长时间请求提供友好提示</li>
                        <li>完善网络错误反馈机制，提供更清晰的解决建议</li>
                        <li>优化加载状态显示，减少用户等待焦虑</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">界面交互体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>简化快捷入口UI视觉效果，采用轻量级描边设计</li>
                        <li>调整搜索面板配色与响应式布局，提升整体视觉协调性</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.2.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.2.0</span>
              <span class="date">2025-03-13 18:06</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">图片格式转换工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">图片格式转换功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持JPG、PNG、WebP、BMP等多种格式互相转换</li>
                        <li>支持批量处理多张图片并打包下载</li>
                        <li>提供多种质量选项和专业参数设置</li>
                        <li>本地处理，无需上传服务器，保护隐私</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/image-to-webp"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">技术优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化图片处理工具集性能</li>
                        <li>改进批量处理文件下载体验</li>
                        <li>完善各类图片格式的兼容性</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.1.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.1.0</span>
              <span class="date">2024-02-27 23:41</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI 资讯聚合工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI 资讯聚合功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多个 AI 资讯平台Rss内容聚合（机器之心、量子位等）</li>
                        <li>实时更新的 AI 相关新闻和动态</li>
                        <li>智能的新闻分类和筛选功能</li>
                        <li>已读状态记录和持久化存储</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai-news"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">技术优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化数据加载和缓存策略</li>
                        <li>优化移动端适配和触摸体验</li>
                        <li>完善错误处理和重试机制</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- Version 2.0.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.9</span>
              <span class="date">2025-02-27 14:30</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">星系运动查看工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">沉浸式星系运动查看工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>可视化模拟宇宙中星系、行星、恒星等天体的运动轨迹</li>
                        <li>支持太阳系、银河系、仙女座等多种天体模型展示</li>
                        <li>支持调整速度、缩放比例和视角，实现沉浸式体验</li>
                        <li>提供多种天体系统选择，包括银河系、半人马座α星系、蟹状星云等</li>
                        <li>优化的WebGL渲染，确保流畅的动画效果</li>
                        <li>支持显示/隐藏轨道和天体名称</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/galaxy-motion"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>响应式设计，支持桌面和移动设备</li>
                        <li>可折叠控制面板，提供更大的观察空间</li>
                        <li>智能自适应缩放功能，根据屏幕尺寸优化显示效果</li>
                        <li>全面的SEO优化，提供更好的可访问性</li>
                        <li>优化的语义化HTML结构，提升屏幕阅读器兼容性</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.8</span>
              <span class="date">2025-02-26 00:55</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">DeepSeek AI 功能优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">功能优化与增强</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化"进阶提示"和"DeepSeek导航"按钮，支持新窗口打开</li>
                        <li>改进代码复制功能，修复复制成功提示问题</li>
                        <li>优化深度思考模式的切换逻辑</li>
                        <li>完善用户交互体验和界面响应</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-r1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">用户体验提升</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化按钮跳转逻辑，提供更好的导航体验</li>
                        <li>改进功能提示信息的展示方式</li>
                        <li>增强系统响应的及时性和准确性</li>
                        <li>提升整体操作流畅度</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.7</span>
              <span class="date">2025-02-25 12:14</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI智能搜索工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI智能站内搜索</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>基于大语言模型的智能搜索功能</li>
                        <li>支持自然语言理解和语义匹配</li>
                        <li>智能推荐相关工具和功能</li>
                        <li>新增背景图片上传功能，支持jpg、png、webp格式</li>
                        <li>优化图片滤镜效果，支持调节亮度、对比度、饱和度等</li>
                        <li>新增多种装饰元素，包括霓虹光效、故障效果等</li>
                        <li>优化预览框大小，采用固定尺寸以提供更稳定的预览体验</li>
                        <li>增加背景类型选择，可在渐变背景和图片背景间切换</li>
                        <li>完善文件格式限制，提供更清晰的上传提示</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai-design-cover"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">用户体验提升</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化图片上传和预览交互流程</li>
                        <li>增加更多提示信息，提升操作引导性</li>
                        <li>改进预览缩放比例，提供更好的视觉体验</li>
                        <li>优化移动端适配效果</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.5</span>
              <span class="date">2025-02-23 20:03</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">DeepSeek专栏上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">DeepSeek专栏功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>新增DeepSeek专栏导航页面，提供一站式DeepSeek资源导航</li>
                        <li>新增AI深度对话功能，支持多轮对话和上下文理解</li>
                        <li>新增DeepSeek学习教程，包含基础入门到高级应用</li>
                        <li>新增提示词工程指南，提供专业的Prompt编写建议</li>
                        <li>支持多种场景应用案例展示</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-nav"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>专业的DeepSeek模型调用和参数配置</li>
                        <li>丰富的应用场景示例和最佳实践</li>
                        <li>完整的学习路径和进阶指南</li>
                        <li>优雅的界面设计和交互体验</li>
                        <li>完善的移动端适配</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.4</span>
              <span class="date">2025-02-21 18:02</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">DeepSeek提示词指南工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">DeepSeek提示词指南</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>提供专业的DeepSeek提示词模板和应用场景</li>
                        <li>支持多种场景分类，包括投资分析、融资计划等</li>
                        <li>提供详细的提示词使用说明和最佳实践</li>
                        <li>优化的响应式布局和交互体验</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.3</span>
              <span class="date">2025-02-18 20:44</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI产品榜单工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI产品榜单工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>实时展示热门AI工具和产品排名</li>
                        <li>支持多维度排序（热度、评分、更新时间等）</li>
                        <li>提供详细的工具介绍和使用说明</li>
                        <li>支持一键访问目标工具</li>
                        <li>优雅的响应式布局设计</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai-ranking"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>智能排序算法，确保榜单数据准确性</li>
                        <li>实时数据更新，保持信息时效性</li>
                        <li>简洁直观的用户界面</li>
                        <li>完善的移动端适配</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.2</span>
              <span class="date">2025-02-16 16:06</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI外包报价生成器上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">AI外包报价生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种项目类型（程序开发、短视频制作、设计等）</li>
                        <li>智能分析项目需求，生成合理的工作量和成本预算</li>
                        <li>支持自定义公司信息和模板管理</li>
                        <li>提供PDF和图片两种导出格式</li>
                        <li>支持税费、折扣等商务条款的灵活配置</li>
                        <li>内置保密协议和水印功能</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai-outsource-quote"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持免费API和自定义API切换</li>
                        <li>提供多个AI模型选择</li>
                        <li>专业的报价单布局和样式</li>
                        <li>自动保存功能，防止数据丢失</li>
                        <li>完善的表单验证和错误提示</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.1</span>
              <span class="date">2025-02-16 13:50</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI设计封面生成工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增AI设计封面生成工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种封面风格和布局选择</li>
                        <li>内置20种精美渐变背景效果</li>
                        <li>提供12种装饰元素（渐变边框、角标装饰、波浪线等）</li>
                        <li>支持10种字体预设样式</li>
                        <li>支持4种预设尺寸（小红书、微信公众号、知乎、通用海报）</li>
                        <li>实时预览和一键下载功能</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai-design-cover"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">核心功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>专业的字体排版系统，支持自定义字间距和描边效果</li>
                        <li>智能文本布局，自动调整字体大小和位置</li>
                        <li>高度可定制的装饰元素系统</li>
                        <li>支持高清PNG格式导出</li>
                        <li>完全本地处理，保护创作隐私</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 2.0.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">2.0.0</span>
              <span class="date">2025-02-15 18:57</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">表情包制作工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">表情包制作工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持自定义文字内容和样式</li>
                        <li>提供多种预设文字效果（简约黑体、粉色可爱、白底黑边等）</li>
                        <li>支持自定义Logo和大小调整</li>
                        <li>一键导出高清表情包</li>
                        <li>本地处理，保护隐私安全</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/emoji-maker"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>简洁直观的用户界面</li>
                        <li>实时预览编辑效果</li>
                        <li>支持字体大小和颜色自定义</li>
                        <li>内置多种文字样式模板</li>
                        <li>完善的移动端适配</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.9</span>
              <span class="date">2025-02-15 14:29</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700"> DeepSeek AI 移动端 UI 适配优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title"> 页面移动端用户体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化移动端字体大小，采用 rem 单位实现响应式文字</li>
                        <li>改进移动端间距和布局，提升紧凑型布局体验</li>
                        <li>优化移动端按钮和输入框尺寸，提高操作友好度</li>
                        <li>完善移动端代码块展示，优化滚动和复制功能</li>
                        <li>改进移动端功能区域布局，优化特性和问答展示</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-r1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.8</span>
              <span class="date">2025-02-14 19:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">更新</el-tag>
                <span class="text-gray-700">AI提示词编辑器重大更新</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">功能增强</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>新增双模型支持：同时支持 Midjourney 和 Stable Diffusion 提示词生成</li>
                        <li>优化标签系统：新增艺术风格、质量提升、光照效果等12个专业分类</li>
                        <li>添加权重调整功能：支持精确的提示词权重控制</li>
                        <li>集成智能翻译：支持中英文精准互译，提升使用体验</li>
                        <li>改进用户界面：新增一键复制功能，优化标签展示效果</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/aiprompteditor"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.7</span>
              <span class="date">2025-02-14 14:05</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">DeepSeek AI 对话工具界面优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">DeepSeek R1 对话工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化复制按钮样式，采用简洁的图标设计</li>
                        <li>改进代码块样式，提供更好的阅读体验</li>
                        <li>优化界面布局和交互细节</li>
                        <li>提升整体视觉效果和用户体验</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-r1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.6 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.6</span>
              <span class="date">2025-02-13 12:32</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">DeepSeek AI 对话工具重大升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">DeepSeek R1 对话工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>新增深度思考功能，实时展示 AI 的推理过程，帮助用户更好地理解 AI 的思考方式</li>
                        <li>优化模型选择区域，提供更清晰的模型说明和性能特点</li>
                        <li>改进界面交互体验，提升视觉效果</li>
                        <li>增强系统稳定性和响应速度</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-r1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.5</span>
              <span class="date">2025-02-12 16:37</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">DeepSeek AI 对话工具升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">DeepSeek R1 对话工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化用户界面设计，提升视觉体验</li>
                        <li>支持多种模型选择（7B-70B）</li>
                        <li>增强代码显示和语法高亮</li>
                        <li>改进对话记录保存功能</li>
                        <li>新增快捷提示词功能</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek-r1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">DeepSeek 对话工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>全新的界面设计和交互体验</li>
                        <li>优化打字机效果显示</li>
                        <li>改进消息保存和复制功能</li>
                        <li>新增常见问题解答</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.4</span>
              <span class="date">2025-02-08 21:48</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">新增小红书风格图片生成工具</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">小红书风格图片生成工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>基于 DeepSeek 大模型的智能文案生成</li>
                        <li>支持多种文案风格和模板选择</li>
                        <li>提供丰富的图片尺寸和样式设置</li>
                        <li>支持自定义字体、颜色和排版</li>
                        <li>一键生成精美的小红书风格图片</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/xiaohongshu"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持免费模式和自定义API双模式</li>
                        <li>提供多种AI模型选择，满足不同需求</li>
                        <li>实时预览和编辑功能</li>
                        <li>支持一键导出和分享</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.3</span>
              <span class="date">2025-02-07 03:55</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">新增 OCR 识别工具和讯飞星火工具</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">OCR 识别工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持图像文字识别，提供高效的文字提取功能</li>
                        <li>支持多种语言识别</li>
                        <li>支持批量处理和导出</li>
                        <li>本地处理，保护隐私安全</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/ocr"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">讯飞星火工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>基于讯飞星火大模型的智能对话工具</li>
                        <li>支持多轮对话和上下文理解</li>
                        <li>提供多种对话场景</li>
                        <li>实时响应，高效准确</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/xunfei-spark"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.2</span>
              <span class="date">2025-02-06 17:58</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI工具扩展与首页优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增四个AI工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          DeepSeek AI对话工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持自然语言对话和问答</li>
                            <li>提供多种对话场景和专业领域支持</li>
                            <li>实时响应，高效准确</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseek"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          AI二维码生成工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持自定义二维码样式和内容</li>
                            <li>AI智能优化二维码设计</li>
                            <li>提供多种艺术风格选择</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/qrcode"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          Stable Diffusion绘画工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持文本生成图像</li>
                            <li>提供多种艺术风格和参数调节</li>
                            <li>高质量图像生成</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/stable-diffusion"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          图像增强工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>AI智能提升图像质量</li>
                            <li>支持多种增强模式</li>
                            <li>批量处理功能</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/image-enhance"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">标签样式优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>简化标签设计，采用更轻量的视觉效果</li>
                        <li>优化标签间距和排版，最多显示2个标签</li>
                        <li>超出标签数使用"+n"形式展示</li>
                        <li>改进标签在不同设备下的适配效果</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验提升</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化卡片悬停效果</li>
                        <li>改进分类标签的展示方式</li>
                        <li>提升整体页面的流畅度</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.1</span>
              <span class="date">2025-02-05 15:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">照片工具集扩展</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增四个照片处理工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          证件照排版打印工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持多种纸张规格（A4、6寸、5寸、7寸相纸）</li>
                            <li>智能排版算法，自动计算最佳布局</li>
                            <li>支持自定义边距和照片间距</li>
                            <li>提供多种预设方案（标准、护照、简历等）</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/photo/layout"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          证件照裁剪工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持多种证件照尺寸</li>
                            <li>智能人像识别和裁剪</li>
                            <li>支持自定义裁剪区域</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/photo/crop"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          证件照背景色修改工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>支持一键更换背景色</li>
                            <li>提供标准证件照背景色</li>
                            <li>支持自定义背景颜色</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/photo/background"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          证件照背景透明工具
                          <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                            <li>智能抠图技术</li>
                            <li>支持导出透明背景图片</li>
                            <li>保持图片边缘清晰度</li>
                          </ul>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/photo/transparent"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>所有处理均在本地完成，保护隐私安全</li>
                        <li>支持批量处理和一键导出</li>
                        <li>优雅的界面设计和交互体验</li>
                        <li>完善的移动端适配</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.0</span>
              <span class="date">2025-01-28 00:50</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">新年文案生成器上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增新年文案生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>使用 DeepSeek AI 生成走心的新年朋友圈文案</li>
                        <li>支持个性化定制，可输入关键词生成更符合需求的文案</li>
                        <li>支持一键复制功能和历史记录保存</li>
                        <li>优雅的打字机展示效果和动画交互</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/newyear"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>响应式布局设计，完美适配各种设备</li>
                        <li>优雅的动画效果和交互体验</li>
                        <li>支持历史记录管理和一键复制分享</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.9</span>
              <span class="date">2025-01-28 22:58</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">星座运势工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增星座运势工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多时段运势查询（今日/明日/本周/本月）</li>
                        <li>支持运势卡片生成与分享功能</li>
                        <li>支持二维码快速访问</li>
                        <li>优雅的响应式布局设计</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/horoscope"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>实时获取最新星座运势数据</li>
                        <li>支持一键生成运势卡片</li>
                        <li>支持复制和下载运势卡片</li>
                        <li>优雅的动画和交互效果</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.8</span>
              <span class="date">2025-01-25 17:41</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">左侧菜单锚点跳转优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">优化锚点跳转功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化左侧菜单锚点跳转逻辑，支持直接跳转到对应位置</li>
                        <li>当在首页时直接滚动到锚点位置</li>
                        <li>当不在首页时通过路由参数跳转到对应位置</li>
                        <li>提升用户导航体验和交互效率</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.7</span>
              <span class="date">2025-01-24 00:18</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">新增三个实用工具</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增今日热榜工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>聚合各大平台热点内容</li>
                        <li>支持实时更新和自动刷新</li>
                        <li>优雅的动画效果和骨架屏</li>
                        <li>响应式布局设计</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/hot-ranking"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">新增爱情公寓一言工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>自动获取爱情公寓经典台词</li>
                        <li>优雅的打字机展示效果</li>
                        <li>一键复制分享功能</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/love-apartment"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验 →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.6 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.6</span>
              <span class="date">2025-01-22 16:50</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">摸鱼工具扩展</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增三个摸鱼工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          随机动漫壁纸
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/wallpaper/anime"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          随机柴郡表情包
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/emoji/cheshire"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          随机表情包
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/emoji/random"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持一键获取随机壁纸和表情包</li>
                        <li>优雅的加载动画效果</li>
                        <li>一键下载功能</li>
                        <li>响应式布局设计</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.5</span>
              <span class="date">2025-01-22 15:16</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">随机文案工具扩展</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增三个随机文案工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          网易云热评生成器
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/cloud-music"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验 →</router-link>
                        </li>
                        <li>
                          暖心安慰文案生成器
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/comfort"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          毒鸡汤文案生成器
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/poison-soup"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验 →</router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持实时获取最新文案内容</li>
                        <li>优雅的打字机展示效果</li>
                        <li>一键复制分享功能</li>
                        <li>响应式布局设计</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.4</span>
              <span class="date">2025-01-22 11:04</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">应用图标生成器上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增应用图标生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多平台图标生成(iOS、Android、Web App等)</li>
                        <li>支持自定义圆角和实时预览</li>
                        <li>支持一键生成所有尺寸图标</li>
                        <li>自动优化小尺寸图标清晰度</li>
                        <li>支持批量打包下载</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/icon-generator"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.3</span>
              <span class="date">2025-01-21 22:05</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">免费图标下载工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增免费图标下载工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种图标分类和搜索功能</li>
                        <li>支持SVG和PNG格式下载</li>
                        <li>支持自定义图标颜色和尺寸</li>
                        <li>支持批量下载和打包导出</li>
                        <li>所有图标均基于开源协议，可免费商用</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/icon"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.2</span>
              <span class="date">2025-01-18 16:17</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">栅格计算工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增栅格计算工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持自定义容器宽度、列数、间距等参数</li>
                        <li>提供桌面端、平板、移动端等常用布局预设</li>
                        <li>支持实时预览栅格布局效果</li>
                        <li>支持导出 Figma/Sketch 配置和 CSS 代码</li>
                        <li>支持响应式布局预览和设备切换</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/grid"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化栅格预览区域的视觉效果</li>
                        <li>添加参考线和列宽标注功能</li>
                        <li>支持设备框架预览效果</li>
                        <li>优化布局预设的展示和切换</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 即将更新 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">即将更新</span>
              <span class="date">预计 2025-02</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="info" class="mr-2">预告</el-tag>
                <span class="text-gray-700">新功能预告</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">设计规范工具扩展</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/logo-spec"
                            class="text-blue-500 hover:text-blue-600">Logo设计规范</router-link>
                          - 提供专业的Logo设计规范生成工具，包含使用场景和注意事项
                        </li>
                        <li>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/brand-spec"
                            class="text-blue-500 hover:text-blue-600">品牌设计规范</router-link>
                          - 生成完整的品牌设计规范，包含VI系统和应用场景
                        </li>
                        <li>
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/contract"
                            class="text-blue-500 hover:text-blue-600">设计合同生成器</router-link>
                          - 快速生成设计项目合同，包含条款和版权说明
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.1</span>
              <span class="date">2025-01-17 23:36</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">设计规范工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">设计尺寸规范工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持 iOS 和 Android 平台的设计规范查询</li>
                        <li>包含字体、图标、分辨率等详细参数</li>
                        <li>提供完整的设计规范参考指南</li>
                        <li>支持快速切换平台查看不同规范</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/spec"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">屏幕尺寸大全</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>提供全面的手机屏幕尺寸参数查询</li>
                        <li>包含主流品牌机型的详细参数</li>
                        <li>支持按品牌和尺寸快速筛选</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/screen"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.0.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.0.0</span>
              <span class="date">2025-01-17 16:18</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="danger" class="mr-2">正式版</el-tag>
                <span class="text-gray-700">UIED-Tools 正式版发布</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">🎉 正式版发布说明</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>经过多轮测试和优化，UIED-Tools 正式发布 1.0.0 版本</li>
                        <li>全新的设计工具模块上线，提供专业的设计辅助功能</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">设计报价单生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种设计类型报价(UI设计、平面设计、品牌设计等)</li>
                        <li>支持自定义项目明细和价格</li>
                        <li>支持导出PDF和图片格式</li>
                        <li>内置多个专业报价模板</li>
                        <li>支持添加公司信息和水印</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/DesignQuote"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">配色方案生成器</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种配色方案生成(单色、互补色、三色、类比色等)</li>
                        <li>支持自定义主色调和配色规则</li>
                        <li>内置多个经典配色模板</li>
                        <li>支持一键复制颜色代码</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/design/color"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.2.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.2.2</span>
              <span class="date">2025-01-16 17:15</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">界面布局优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">页面间距优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化主内容区域与顶部导航栏的间距</li>
                        <li>调整工具页面整体布局的视觉层次</li>
                        <li>改进页面内容的呈现效果</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">搜索功能优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>修复工具搜索结果的跳转问题</li>
                        <li>优化搜索结果的展示效果</li>
                        <li>改进搜索交互体验</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.2.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.2.1</span>
              <span class="date">2025-01-16 13:40</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">新增办公工具分类</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增办公工具分类</div>
                    <div class="feature-desc">新增办公工具一级分类，整合现有PDF相关工具</div>
                  </li>
                  <li>
                    <div class="feature-title">PDF工具集成</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>
                          图片转PDF工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/img-to-pdf"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF转图片工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-to-images"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF合并工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-merge"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF分割工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-split"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF页面旋转工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-rotate"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF页面删除工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-delete"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                        <li>
                          PDF压缩工具
                          <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-compress"
                            class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                            →</router-link>
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">界面优化</div>
                    <div class="feature-desc">优化左侧菜单结构，调整工具展示顺序，提升用户体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.2.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.2.0</span>
              <span class="date">2025-01-16 03:25</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">工具页面全面设计优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">统一设计风格</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化所有工具页面的整体布局和视觉层次</li>
                        <li>统一标题区域样式，采用新的标题展示效果</li>
                        <li>改进功能区域的布局和间距</li>
                        <li>优化按钮和输入框的样式与交互效果</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能展示优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>采用卡片式设计展示功能特点</li>
                        <li>优化功能说明和使用场景的展示方式</li>
                        <li>改进FAQ展示效果，提升可读性</li>
                        <li>增加图标和背景效果，提升视觉体验</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验提升</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>增加按钮和卡片的悬停效果</li>
                        <li>优化输入框和操作区域的反馈效果</li>
                        <li>改进移动端适配效果</li>
                        <li>提升整体页面的流畅度和响应性</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.9</span>
              <span class="date">2025-01-15 16:17</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">KFC 文案生成器上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增 KFC 文案生成器</div>
                    <div class="feature-desc">
                      支持生成肯德基疯狂星期四文案，让你的朋友圈充满诱惑
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/copywriting/kfc"
                        class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                        →</router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">主要功能</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>自动获取最新 KFC 文案</li>
                        <li>支持中英文翻译功能</li>
                        <li>优雅的打字机展示效果</li>
                        <li>一键复制中英文内容</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验</div>
                    <div class="feature-desc">优化界面设计，添加加载状态和操作反馈，支持响应式布局</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.8</span>
              <span class="date">2025-01-15 01:09</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">工具页面布局优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">右侧边栏优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化右侧边栏的展示效果，调整工具推荐的布局和样式</li>
                        <li>改进相关工具和随机推荐的展示方式，增加推荐数量至12个</li>
                        <li>优化工具卡片的悬停效果和交互体验</li>
                        <li>调整边栏的固定定位和滚动行为</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">页面布局调整</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化工具页面的整体布局，采用新的布局组件结构</li>
                        <li>调整内容区域和边栏的间距，优化页面的视觉层次</li>
                        <li>统一工具页面的标题和描述样式</li>
                        <li>改进页面的留白和对齐方式</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">响应式优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>完善工具页面在不同设备下的显示效果</li>
                        <li>优化边栏的显示与隐藏逻辑，仅在工具页面显示</li>
                        <li>调整移动端下的布局和间距</li>
                        <li>优化页面在不同尺寸下的适配效果</li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">代码结构优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>重构工具页面的路由配置，统一使用布局组件</li>
                        <li>优化组件的导入方式和依赖管理</li>
                        <li>规范化组件的注释和文档</li>
                        <li>清理冗余代码，提升代码质量</li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.7</span>
              <span class="date">2025-01-14 17:59</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">图片水印工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增图片水印工具</div>
                    <div class="feature-desc">
                      支持批量给图片添加文字或图片水印
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/img-watermark"
                        class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                        →</router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">主要功能</div>
                    <div class="feature-desc">支持文字水印和图片水印、自定义位置和透明度、全局铺满模式、水印密度调节等功能</div>
                  </li>
                  <li>
                    <div class="feature-title">批量处理</div>
                    <div class="feature-desc">支持批量上传图片，一键添加水印，支持批量打包下载</div>
                  </li>
                  <li>
                    <div class="feature-title">本地处理</div>
                    <div class="feature-desc">所有处理在浏览器本地完成，保护图片隐私安全</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.6 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.6</span>
              <span class="date">2025-01-14 16:27</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">更新日志组件优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">更新日志组件优化</div>
                    <div class="feature-desc">优化更新日志的展示效果，改进时间线样式和内容布局</div>
                  </li>
                  <li>
                    <div class="feature-title">移动端适配优化</div>
                    <div class="feature-desc">完善移动端下的显示效果，优化时间线和卡片布局</div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验改进</div>
                    <div class="feature-desc">优化版本标签和更新内容的展示方式，提升用户阅读体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.5</span>
              <span class="date">2025-01-14 14:09</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">工具功能与界面优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">随机密码生成器优化</div>
                    <div class="feature-desc">优化界面设计，添加安全提示和免责声明，完善功能说明和使用场景描述</div>
                  </li>
                  <li>
                    <div class="feature-title">文本编辑器优化</div>
                    <div class="feature-desc">改进富文本编辑器界面，优化工具说明和使用场景介绍</div>
                  </li>
                  <li>
                    <div class="feature-title">界面交互优化</div>
                    <div class="feature-desc">统一工具页面的设计风格，改进功能区域布局，提升用户体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.4</span>
              <span class="date">2025-01-14 10:57</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">导航菜单与工具展示优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">导航菜单优化</div>
                    <div class="feature-desc">优化左侧菜单栏的推荐工具展示，调整随机工具和热门工具的展示方式</div>
                  </li>
                  <li>
                    <div class="feature-title">首页展示优化</div>
                    <div class="feature-desc">调整首页热门工具的展示效果，提升用户浏览体验</div>
                  </li>
                  <li>
                    <div class="feature-title">功能修复</div>
                    <div class="feature-desc">修复工具跳转链接，确保导航准确性</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.3</span>
              <span class="date">2025-01-13 22:10</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">PDF压缩工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增PDF压缩工具</div>
                    <div class="feature-desc">
                      支持在线压缩PDF文件，减小文件体积
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/pdf-compress"
                        class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                        →</router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">主要功能</div>
                    <div class="feature-desc">支持批量处理、本地压缩、多种压缩质量选择、图片质量调节等功能</div>
                  </li>
                  <li>
                    <div class="feature-title">安全可靠</div>
                    <div class="feature-desc">所有处理在浏览器本地完成，无需上传服务器，确保文件安全</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.2</span>
              <span class="date">2025-01-13 18:22</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">图片格式转换工具优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">预览功能优化</div>
                    <div class="feature-desc">
                      优化图片预览交互，简化预览界面，提升用户体验
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/img-format"
                        class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                        →</router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能说明优化</div>
                    <div class="feature-desc">重新编写功能特点和使用场景说明，使描述更专业和准确</div>
                  </li>
                  <li>
                    <div class="feature-title">界面交互改进</div>
                    <div class="feature-desc">统一按钮文案，优化功能区域布局，提升整体视觉体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.1</span>
              <span class="date">2025-01-12 22:18</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">PDF工具全面优化升级</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">PDF删除工具优化</div>
                    <div class="feature-desc">新增文件清除功能，优化页面预览网格布局，改进拖拽排序体验，增强页面选择和批量操作功能</div>
                  </li>
                  <li>
                    <div class="feature-title">PDF旋转工具改进</div>
                    <div class="feature-desc">优化旋转控制按钮布局，新增文件清除功能，完善页面预览效果，提升批量旋转操作的便捷性</div>
                  </li>
                  <li>
                    <div class="feature-title">PDF合并工具升级</div>
                    <div class="feature-desc">改进文件列表展示，优化拖拽排序交互，新增文件清除功能，提供更清晰的合并状态提示</div>
                  </li>
                  <li>
                    <div class="feature-title">PDF拆分工具增强</div>
                    <div class="feature-desc">优化页面范围选择界面，新增文件清除功能，改进拆分预览效果，提供更直观的操作反馈</div>
                  </li>
                  <li>
                    <div class="feature-title">上传交互优化</div>
                    <div class="feature-desc">统一优化拖拽上传区域样式，增加文件类型和大小限制提示，优化上传反馈效果</div>
                  </li>
                  <li>
                    <div class="feature-title">操作按钮改进</div>
                    <div class="feature-desc">统一按钮样式和布局，优化图标和文字搭配，增强按钮状态反馈，改进移动端适配</div>
                  </li>
                  <li>
                    <div class="feature-title">功能说明优化</div>
                    <div class="feature-desc">完善工具特点和常见问题说明，新增更多使用提示和注意事项，提供更详细的操作指引</div>
                  </li>
                  <li>
                    <div class="feature-title">相关工具推荐</div>
                    <div class="feature-desc">优化工具推荐模块的展示效果，提供更智能的工具关联推荐，方便用户发现相关功能</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.1.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.1.0</span>
              <span class="date">2025-01-12 19:42</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">工具功能优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">文本转图片工具优化</div>
                    <div class="feature-desc">优化工具界面布局，改进移动端适配，提升用户体验</div>
                  </li>
                  <li>
                    <div class="feature-title">二维码生成工具优化</div>
                    <div class="feature-desc">新增二维码样式自定义功能，支持调整点样式和角样式</div>
                  </li>
                  <li>
                    <div class="feature-title">工具推荐功能</div>
                    <div class="feature-desc">新增相关工具推荐功能，方便用户发现更多实用工具</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.9 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.9</span>
              <span class="date">2025-01-12 15:29</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">功能优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">工具分类优化</div>
                    <div class="feature-desc">优化图片处理和文案工具分类结构，采用三级分类展示</div>
                  </li>
                  <li>
                    <div class="feature-title">界面交互优化</div>
                    <div class="feature-desc">优化工具展示结构和导航菜单，提升用户体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.8 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.8</span>
              <span class="date">2025-01-12 13:00</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="warning" class="mr-2">维护更新</el-tag>
                <span class="text-gray-700">功能优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">摸头GIF生成工具维护</div>
                    <div class="feature-desc">工具暂时进入维护状态，正在进行功能优化</div>
                  </li>
                  <li>
                    <div class="feature-title">用户体验优化</div>
                    <div class="feature-desc">添加功能维护提示，优化界面交互效果</div>
                  </li>
                  <li>
                    <div class="feature-title">预期恢复时间</div>
                    <div class="feature-desc">预计近期完成优化并恢复服务</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.7</span>
              <span class="date">2025-01-12 02:07</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">摸头GIF生成工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增摸头GIF生成工具</div>
                    <div class="feature-desc">
                      支持上传图片生成摸头GIF动画效果
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/avatar/rua"
                        class="text-blue-500 hover:text-blue-600 ml-1">
                        立即体验 →
                      </router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">优化用户体验</div>
                    <div class="feature-desc">优化图片上传和预览功能，添加实时预览和加载动画</div>
                  </li>
                  <li>
                    <div class="feature-title">界面美化</div>
                    <div class="feature-desc">采用新的界面设计，优化布局和交互效果</div>
                  </li>
                  <li>
                    <div class="feature-title">移动端适配</div>
                    <div class="feature-desc">完善移动端响应式布局，提供更好的移动端体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.6 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.6</span>
              <span class="date">2025-01-12 01:01</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">动漫头像转换工具和随机头像工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增动漫头像转换工具</div>
                    <div class="feature-desc">
                      支持将照片转换为动漫风格头像
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/avatar/anime"
                        class="text-blue-500 hover:text-blue-600 ml-1">
                        立即体验 →
                      </router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">新增随机头像工具</div>
                    <div class="feature-desc">
                      支持生成随机头像，提供多种风格选择
                      <router-link target="_blank" rel="noopener noreferrer" to="/tools/avatar/random"
                        class="text-blue-500 hover:text-blue-600 ml-1">
                        立即体验 →
                      </router-link>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">图片格式限制</div>
                    <div class="feature-desc">支持JPG/PNG格式，文件大小限制10MB</div>
                  </li>
                  <li>
                    <div class="feature-title">用户体验优化</div>
                    <div class="feature-desc">添加温馨提示，优化加载状态和错误提示</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.5 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.5</span>
              <span class="date">2025-01-11 23:01</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">随机工具推荐功能优化，热门工具展示优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">优化随机工具推荐功能</div>
                    <div class="feature-desc">支持分类筛选和热门工具展示</div>
                  </li>
                  <li>
                    <div class="feature-title">改进工具卡片</div>
                    <div class="feature-desc">改进了工具卡片的视觉效果和交互体验</div>
                  </li>
                  <li>
                    <div class="feature-title">优化分类功能</div>
                    <div class="feature-desc">优化了工具分类和筛选逻辑</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.4</span>
              <span class="date">2025-01-10 22:33</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">页面底部优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">优化底部布局</div>
                    <div class="feature-desc">重新设计页面底部布局，采用左右两栏布局，减少空白区域</div>
                  </li>
                  <li>
                    <div class="feature-title">工具快捷入口分类</div>
                    <div class="feature-desc">将工具快捷入口分为图像和文案两大类，提升用户查找效率</div>
                  </li>
                  <li>
                    <div class="feature-title">移动端适配优化</div>
                    <div class="feature-desc">优化移动端下的显示效果，自动调整为单列布局</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.3 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.3</span>
              <span class="date">2025-01-10 21:14</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">界面优化更新</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">优化 Logo 设计</div>
                    <div class="feature-desc">重新设计 Logo 样式，优化 UIED 图标与 Tools 文字的视觉平衡</div>
                  </li>
                  <li>
                    <div class="feature-title">改进动画效果</div>
                    <div class="feature-desc">优化 Logo 描边动画和 Tools 文字的渐入效果</div>
                  </li>
                  <li>
                    <div class="feature-title">统一主题色调</div>
                    <div class="feature-desc">统一使用蓝色(#409EFF)作为主色调，提升品牌识别度</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.2 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.2</span>
              <span class="date">2025-01-10</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">随机工具推荐功能优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">优化随机工具推荐</div>
                    <div class="feature-desc">重新设计工具卡片布局，添加渐变背景和悬停效果</div>
                  </li>
                  <li>
                    <div class="feature-title">改进分类筛选</div>
                    <div class="feature-desc">新增分类标签，支持按分类随机推荐工具</div>
                  </li>
                  <li>
                    <div class="feature-title">交互体验优化</div>
                    <div class="feature-desc">优化按钮和卡片动画效果，提升用户体验</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.1 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.1</span>
              <span class="date">2025-01-09</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="warning" class="mr-2">测试版</el-tag>
                <span class="text-gray-700">功能扩展更新</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增舔狗日记功能</div>
                    <div class="feature-desc">每次刷新获取一条有趣的舔狗日记，为用户带来欢乐</div>
                  </li>
                  <li>
                    <div class="feature-title">修复已知问题</div>
                    <div class="feature-desc">修复左侧菜单中更新日志按钮点击后保持高亮的问题</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Beta 1.0.0 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">Beta 1.0.0</span>
              <span class="date">2025-01-08</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="warning" class="mr-2">测试版</el-tag>
                <span class="text-gray-700">首次发布</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">UIED-Tools 测试版发布</div>
                    <div class="feature-desc">一站式在线工具平台，提供丰富的工具集合（测试阶段）</div>
                  </li>
                  <li>
                    <div class="feature-title">图片处理工具集</div>
                    <div class="feature-desc">支持图片压缩、格式转换、批量处理等功能</div>
                  </li>
                  <li>
                    <div class="feature-title">文本处理工具集</div>
                    <div class="feature-desc">支持随机文案、今日诗词等文本工具</div>
                  </li>
                  <li>
                    <div class="feature-title">开发工具集</div>
                    <div class="feature-desc">为开发者提供实用的在线开发辅助工具</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.7 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.8</span>
              <span class="date">2025-02-15 14:29</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="success" class="mr-2">优化</el-tag>
                <span class="text-gray-700">移动端 UI 适配优化</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">移动端用户体验优化</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>优化移动端字体大小，采用 rem 单位实现响应式文字</li>
                        <li>改进移动端间距和布局，提升紧凑型布局体验</li>
                        <li>优化移动端按钮和输入框尺寸，提高操作友好度</li>
                        <li>完善移动端代码块展示，优化滚动和复制功能</li>
                        <li>改进移动端功能区域布局，优化特性和问答展示</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/deepseekr1"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Version 1.1.4 -->
          <div class="timeline-item">
            <div class="version-tag">
              <span class="version">1.1.4</span>
              <span class="date">2025-02-16 13:50</span>
            </div>
            <div class="content-card">
              <div class="card-header">
                <el-tag size="small" type="primary" class="mr-2">新增</el-tag>
                <span class="text-gray-700">AI设计封面生成工具上线</span>
              </div>
              <div class="card-content">
                <ul class="feature-list">
                  <li>
                    <div class="feature-title">新增AI设计封面生成工具</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种封面风格和布局选择</li>
                        <li>支持自定义字体、颜色和装饰元素</li>
                        <li>内置多种渐变背景和装饰效果</li>
                        <li>支持实时预览和一键下载</li>
                        <li>优雅的响应式布局设计</li>
                        <router-link target="_blank" rel="noopener noreferrer" to="/tools/ai/design-cover"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <div class="feature-title">功能特点</div>
                    <div class="feature-desc">
                      <ul class="list-disc list-inside text-sm text-gray-600 space-y-1">
                        <li>支持多种预设尺寸（小红书、微信公众号等）</li>
                        <li>丰富的字体预设和装饰元素</li>
                        <li>高清图片导出功能</li>
                        <li>专业的设计参数调节</li>
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
</style>

/* Transitions */
.fade-enter-active,
.fade-leave-active {
transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
opacity: 0;
}
