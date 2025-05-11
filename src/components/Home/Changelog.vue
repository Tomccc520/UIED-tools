# 创建新文件
<script setup lang="ts">
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
 * @lastUpdate 2025-03-18 18:15
 * @version Beta 2.2.3
 * @toolsCount 当前工具总数：84个
 *
 * @notes
 * - 使用时间线形式展示更新历史
 * - 每个版本包含版本号、更新日期、更新类型和具体更新内容
 * - 支持响应式布局，适配移动端显示
 *
 * @todo
 * - [ ] 添加更新内容搜索功能
 * - [ ] 支持按版本类型筛选
 * - [ ] 添加更新订阅功能
 */
</script>

<template>
  <div class="changelog-container md:mr-6 c-xs:mr-0">
    <div class="flex flex-col">
      <!-- Logo区域 -->
      <div class="flex justify-center py-6">
        <router-link class="logo-container group" to="/">
          <div class="flex items-center">
            <div class="logo-wrapper flex items-center">
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
            <div class="tools-text font-bold ml-2">Tools</div>
          </div>
          <div class="text-xs text-gray-400 mt-2 text-center">在线免费工具集</div>
        </router-link>
      </div>

      <!-- 标题区域 -->
      <div class="header-section mb-8">
        <h1 class="text-2xl font-bold mb-4">更新日志</h1>
        <div class="text-gray-500 text-sm">
          由 <a href="https://tomda.top/" target="_blank" class="text-blue-500 hover:text-blue-600">Tomda</a> 开发（AI协助）并记录
          UIED-Tools 的开发历程和功能更新。公众号：Tomda
        </div>
        <div class="text-gray-400 text-xs mt-2">
          当前工具总数：86个 | 最后更新：2025-05-11 10:39
        </div>
      </div>

      <!-- 时间线区域 -->
      <div class="timeline-container">

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
                      <router-link to="/tools/ai/resume" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/avatar/rua" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/fish-calendar" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/image-to-svg" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/image-to-webp" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai-news" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/galaxy-motion" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-r1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai-design-cover" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-nav" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai-ranking" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai-outsource-quote" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai-design-cover" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/emoji-maker" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-r1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/aiprompteditor" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-r1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-r1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek-r1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/deepseek" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/xiaohongshu" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/ocr" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/xunfei-spark" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                        <router-link to="/tools/ai/deepseek" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        AI二维码生成工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>支持自定义二维码样式和内容</li>
                          <li>AI智能优化二维码设计</li>
                          <li>提供多种艺术风格选择</li>
                        </ul>
                        <router-link to="/tools/ai/qrcode" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        Stable Diffusion绘画工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>支持文本生成图像</li>
                          <li>提供多种艺术风格和参数调节</li>
                          <li>高质量图像生成</li>
                        </ul>
                        <router-link to="/tools/ai/stable-diffusion" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        图像增强工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>AI智能提升图像质量</li>
                          <li>支持多种增强模式</li>
                          <li>批量处理功能</li>
                        </ul>
                        <router-link to="/tools/ai/image-enhance" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                        <router-link to="/tools/photo/layout" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        证件照裁剪工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>支持多种证件照尺寸</li>
                          <li>智能人像识别和裁剪</li>
                          <li>支持自定义裁剪区域</li>
                        </ul>
                        <router-link to="/tools/photo/crop" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        证件照背景色修改工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>支持一键更换背景色</li>
                          <li>提供标准证件照背景色</li>
                          <li>支持自定义背景颜色</li>
                        </ul>
                        <router-link to="/tools/photo/background" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        证件照背景透明工具
                        <ul class="list-disc list-inside ml-4 text-sm text-gray-600 space-y-1">
                          <li>智能抠图技术</li>
                          <li>支持导出透明背景图片</li>
                          <li>保持图片边缘清晰度</li>
                        </ul>
                        <router-link to="/tools/photo/transparent" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/copywriting/newyear" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/horoscope" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/hot-ranking" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/copywriting/love-apartment"
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
                        <router-link to="/tools/wallpaper/anime" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        随机柴郡表情包
                        <router-link to="/tools/emoji/cheshire" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        随机表情包
                        <router-link to="/tools/emoji/random" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                        <router-link to="/tools/copywriting/cloud-music"
                          class="text-blue-500 hover:text-blue-600 ml-1">立即体验 →</router-link>
                      </li>
                      <li>
                        暖心安慰文案生成器
                        <router-link to="/tools/copywriting/comfort" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        毒鸡汤文案生成器
                        <router-link to="/tools/copywriting/poison-soup"
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
                      <router-link to="/tools/design/icon-generator" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/icon" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/grid" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                        <router-link to="/tools/design/logo-spec"
                          class="text-blue-500 hover:text-blue-600">Logo设计规范</router-link>
                        - 提供专业的Logo设计规范生成工具，包含使用场景和注意事项
                      </li>
                      <li>
                        <router-link to="/tools/design/brand-spec"
                          class="text-blue-500 hover:text-blue-600">品牌设计规范</router-link>
                        - 生成完整的品牌设计规范，包含VI系统和应用场景
                      </li>
                      <li>
                        <router-link to="/tools/design/contract"
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
                      <router-link to="/tools/design/spec" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/screen" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/DesignQuote" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/design/color" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                        <router-link to="/tools/img-to-pdf" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF转图片工具
                        <router-link to="/tools/pdf-to-images" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF合并工具
                        <router-link to="/tools/pdf-merge" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF分割工具
                        <router-link to="/tools/pdf-split" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF页面旋转工具
                        <router-link to="/tools/pdf-rotate" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF页面删除工具
                        <router-link to="/tools/pdf-delete" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
                          →</router-link>
                      </li>
                      <li>
                        PDF压缩工具
                        <router-link to="/tools/pdf-compress" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                    <router-link to="/tools/copywriting/kfc" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                    <router-link to="/tools/img-watermark" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                    <router-link to="/tools/pdf-compress" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                    <router-link to="/tools/img-format" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                    <router-link to="/tools/avatar/rua" class="text-blue-500 hover:text-blue-600 ml-1">
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
                    <router-link to="/tools/avatar/anime" class="text-blue-500 hover:text-blue-600 ml-1">
                      立即体验 →
                    </router-link>
                  </div>
                </li>
                <li>
                  <div class="feature-title">新增随机头像工具</div>
                  <div class="feature-desc">
                    支持生成随机头像，提供多种风格选择
                    <router-link to="/tools/avatar/random" class="text-blue-500 hover:text-blue-600 ml-1">
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
                      <router-link to="/tools/ai/deepseekr1" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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
                      <router-link to="/tools/ai/design-cover" class="text-blue-500 hover:text-blue-600 ml-1">立即体验
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

      <!-- 页脚说明 -->
      <div class="footer-section mt-8">
        <div class="text-sm text-gray-500">
          <el-icon class="mr-1">
            <InfoFilled />
          </el-icon>
          本更新日志记录了 UIED-Tools 的主要功能更新和版本变更信息
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Logo 相关样式 */
/* 移除字体声明 */
.changelog-container {
  max-width: 800px;
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
  box-shadow: 0 4px 6px -1px rgba(108, 84, 255, 0.1), 0 2px 4px -1px rgba(108, 84, 255, 0.06);
  transition: all 0.3s ease;
  height: 32px;
  width: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo-wrapper:hover {
  box-shadow: 0 10px 15px -3px rgba(108, 84, 255, 0.2), 0 4px 6px -2px rgba(108, 84, 255, 0.1);
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
</style>
