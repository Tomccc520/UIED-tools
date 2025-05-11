<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-12-22
 */
</script>

<template>
  <footer class="bg-white border-t border-gray-100 rounded-xl" role="contentinfo" aria-label="页面底部">
    <div class="max-w-7xl mx-auto py-2 sm:py-4 px-2 sm:px-3">
      <div class="flex flex-col items-center justify-center space-y-3">
        <!-- Logo和标题 -->
        <router-link class="logo-container group" to="/" aria-label="返回首页">
          <div class="flex items-center">
            <div class="logo-wrapper flex items-center" aria-hidden="true">
              <svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-svg">
                <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g id="logo-3">
                    <rect id="矩形" x="0" y="0" width="204" height="96" rx="48"></rect>
                    <g id="UIED" transform="translate(26, 24)">
                      <path
                        d="M46.4231047,0 L46.4231047,0 L41.6490975,0 C40.1858002,0 38.8962696,0.489042676 37.7805054,1.46712803 C36.6647413,2.44521338 35.9971119,3.69088812 35.7776173,5.20415225 L32.4851986,28.6228374 C32.0462094,32.0553633 30.7841155,34.6758939 28.698917,36.4844291 C26.6137184,38.2560554 23.9614922,39.1418685 20.7422383,39.1418685 C17.5961492,39.1418685 15.0536703,38.3114187 13.1148014,36.650519 C11.1393502,34.9896194 10.1516245,32.5351788 10.1516245,29.2871972 C10.1516245,28.5121107 10.2064982,27.6816609 10.3162455,26.7958478 L14.1025271,0 L9.27364621,0 C7.81034898,0 6.5299639,0.479815456 5.43249097,1.43944637 C4.33501805,2.39907728 3.65824308,3.6355248 3.40216606,5.14878893 L0.274368231,26.9065744 C0.091456077,28.1983852 0,29.4532872 0,30.6712803 C0,36.0599769 1.79253911,40.2860438 5.37761733,43.349481 C8.96269555,46.3760092 14.0842359,47.8892734 20.7422383,47.8892734 C33.4363418,47.8892734 40.6247894,41.7439446 42.3075812,29.4532872 L46.4231047,0 Z"
                        class="svg-elem"></path>
                      <path
                        d="M44.6122744,48 L44.6122744,48 L50.7032491,4.42906574 C50.8861613,3.1372549 51.4623345,2.07612457 52.431769,1.24567474 C53.4012034,0.415224913 54.5261131,0 55.8064982,0 L61.568231,0 C61.568231,0 61.568231,0 61.568231,0 C61.568231,0 61.568231,0 61.568231,0 L55.5870036,42.7958478 C55.367509,44.3091119 54.6998797,45.5547866 53.5841155,46.532872 C52.4683514,47.5109573 51.1605295,48 49.6606498,48 L44.6122744,48 Z"
                        class="svg-elem"></path>
                      <path
                        d="M63.1595668,48 L63.1595668,48 L68.9761733,6.58823529 C69.2688327,4.66897347 70.1193742,3.0911188 71.5277978,1.85467128 C72.9362214,0.61822376 74.5915764,0 76.4938628,0 L105.083032,0 L104.58917,3.48788927 C104.44284,4.44752018 104.022142,5.23183391 103.327076,5.84083045 C102.63201,6.44982699 101.827196,6.75432526 100.912635,6.75432526 L79.2375451,6.75432526 L77.5364621,19.1557093 L99.6505415,19.1557093 L98.5530686,27.017301 L76.4389892,27.017301 L74.4086643,40.1937716 L99.4859206,40.1937716 L99.2115523,42.9065744 C98.9920578,44.3829296 98.3518652,45.6009227 97.2909747,46.5605536 C96.2300842,47.5201845 94.9862816,48 93.5595668,48 L63.1595668,48 Z"
                        class="svg-elem"></path>
                      <path
                        d="M110.954513,5.31487889 L110.954513,5.31487889 L105.083032,47.9446367 L129.556679,47.9446367 C135.922022,47.9446367 141.244765,45.6193772 145.52491,40.9688581 C149.841637,36.2814302 152,30.4129181 152,23.3633218 C152,16.4982699 149.89651,10.88812 145.689531,6.53287197 C141.482551,2.21453287 135.409868,0.0553633218 127.47148,0.0553633218 L116.93574,0.0553633218 C115.43586,0.0553633218 114.128039,0.544405998 113.012274,1.52249135 C111.89651,2.5005767 111.21059,3.76470588 110.954513,5.31487889 Z M120.667148,8.08304498 L120.667148,8.08304498 L125.550903,8.08304498 C130.452948,8.08304498 134.348977,9.48558247 137.238989,12.2906574 C140.129001,15.0957324 141.574007,18.7497116 141.574007,23.2525952 C141.574007,28.1245675 140.165584,32.1291811 137.348736,35.266436 C134.568472,38.4036909 130.709025,39.9723183 125.770397,39.9723183 L116.277256,39.9723183 L120.667148,8.08304498 Z"
                        class="svg-elem"></path>
                    </g>
                  </g>
                </g>
              </svg>
            </div>
            <div class="tools-text font-bold ml-2" aria-label="UIED Tools">Tools</div>
          </div>
        </router-link>

        <!-- 主要内容区域 -->
        <div class="w-full max-w-5xl mx-auto grid grid-cols-1 gap-6">
          <!-- 快捷链接区域 -->
          <nav class="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="底部导航">
            <!-- 工具快捷入口 -->
            <section class="w-full" aria-labelledby="quick-tools">
              <h2 id="quick-tools" class="text-base font-medium text-gray-600 mb-4">
                工具快捷入口
              </h2>
              <div class="flex flex-col space-y-3">
                <!-- 图像工具 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">图像：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="/tools/image-compress"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      图片压缩
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/qrcode"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      二维码生成
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/img-cut"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      图片切割
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/signimage"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      图片处理
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/gif-compress"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      GIF压缩
                    </a>
                  </div>
                </div>

                <!-- PDF工具 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">PDF：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="/tools/img-to-pdf"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      图片转PDF
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/pdf-to-images"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      PDF转图片
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/pdf-merge"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      PDF合并
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/pdf-split"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      PDF分割
                    </a>
                  </div>
                </div>

                <!-- 文本工具 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">文本：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="/tools/diff"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      文本对比
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/markdown"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      Markdown编辑
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/wordcount"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      字数统计
                    </a>
                  </div>
                </div>

                <!-- 开发工具 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">开发：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="/tools/json"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      JSON转换
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/reg"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      正则测试
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/timetran"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      时间戳
                    </a>
                  </div>
                </div>

                <!-- 文案工具 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">文案：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="/tools/copywriting/kfc"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      疯狂星期四
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/copywriting/daily-poem"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      今日诗词
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/copywriting/dog-diary"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      舔狗日记
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="/tools/copywriting/moments"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      朋友圈文案
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <!-- 友情链接 -->
            <section class="w-full" aria-labelledby="friend-links">
              <h2 id="friend-links" class="text-base font-medium text-gray-600 mb-4">
                友情链接
              </h2>
              <div class="flex flex-wrap gap-3">
                <a href="https://uied.cn" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  AIGC学习网站
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  UIED技术团队
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://www.88sheji.cn/" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-blue-500 transition-colors whitespace-nowrap">
                  拜拜导航
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://www.tomda.top/" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-blue-500 transition-colors whitespace-nowrap">
                  Tomda
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://fsuied.com/contact.html" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-blue-500 transition-colors whitespace-nowrap">
                  申请友链
                </a>
              </div>
            </section>

            <!-- 官方媒体 -->
            <section class="w-full" aria-labelledby="official-media">
              <h2 id="official-media" class="text-base font-medium text-gray-600 mb-4">
                官方媒体
              </h2>
              <div class="flex flex-wrap gap-3">
                <a href="https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi" target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  知乎
                </a>
              </div>
            </section>
          </nav>
        </div>

        <!-- 底部信息 -->
        <div class="w-full flex flex-col items-center text-sm text-gray-500 border-t border-gray-100 pt-6 space-y-3">
          <div class="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <!-- 左侧信息 -->
            <div class="flex flex-col space-y-2 text-center sm:text-left">
              <div>
                <span itemprop="name">UIED-Tools</span>是由
                <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                  class="text-[#6C54FF] hover:text-[#5842cc] transition-colors font-medium" itemprop="creator">
                  UIED技术团队
                </a>
                设计开发的在线工具平台
              </div>
              <div class="flex items-center justify-center sm:justify-start gap-1">
                <span>技术支持：</span>
                <a href="https://www.tomda.top/" target="_blank" rel="noopener noreferrer"
                  class="text-[#6C54FF] hover:text-[#5842cc] transition-colors font-medium">
                  Tomda
                </a>
                <span>&</span>
                <a href="https://fsuied.com" target="_blank" rel="noopener noreferrer"
                  class="text-[#6C54FF] hover:text-[#5842cc] transition-colors font-medium">
                  UIED技术团队
                </a>
              </div>
            </div>

            <!-- 右侧信息 -->
            <div class="flex flex-col items-center sm:items-end space-y-2">
              <div class="text-gray-400" itemprop="copyrightNotice">© 2025 UIED-Tools. All rights reserved.</div>
              <div class="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
                <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"
                  class="hover:text-blue-600 transition-colors whitespace-nowrap">
                  粤ICP备2022056875号
                </a>
                <span class="text-gray-300">·</span>
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer"
                  class="hover:text-blue-600 transition-colors whitespace-nowrap">
                  网站地图
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

/* Logo 相关样式 */
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
