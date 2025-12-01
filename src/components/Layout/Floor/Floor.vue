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
              <div class="space-y-4">
                <!-- AI相关链接 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">AI：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="https://www.uied.cn/category/aigc/ai" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      AI文章
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://hot.uied.cn/ai-realtime" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      AI资讯
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://hao.uied.cn/ai" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      AI工具
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://www.uied.cn/wechat" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      AI交流
                    </a>
                  </div>
                </div>

                <!-- 设计相关链接 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">设计：</span>
                  <div class="flex flex-wrap gap-3">
                    <a href="https://www.uied.cn/category/wenzhang/ui-wenzhang" target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      设计文章
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://hao.uied.cn/" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      设计导航
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://uiedtool.com/" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      设计工具
                    </a>
                    <span class="text-gray-300">·</span>
                    <a href="https://hot.uied.cn/" target="_blank" rel="noopener noreferrer"
                      class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                      设计资讯
                    </a>
                  </div>
                </div>

                <!-- 其他友情链接 -->
                <div class="flex items-center gap-4">
                  <span class="text-sm text-gray-400 shrink-0">其他：</span>
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
                </div>
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
                <span class="text-gray-300">·</span>
                <a href="https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83" target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  小红书
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://weibo.com/u/7542146005" target="_blank" rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  微博
                </a>
                <span class="text-gray-300">·</span>
                <a href="https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0" target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-gray-600 hover:text-[#6C54FF] transition-colors whitespace-nowrap">
                  B站
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
