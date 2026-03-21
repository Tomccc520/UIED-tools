<!--
 * @file PlatformComparisonSection.vue
 * @description 移动端平台设计比较子组件，集中维护 iOS 与 Android 差异说明
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->
<template>
  <div class="spec-section">
    <h3 id="platform-comparison" class="section-title">平台设计比较</h3>

    <div class="spec-card">
      <div class="card-header">
        <h4>iOS 与 Android 设计差异</h4>
      </div>
      <div class="card-content">
        <div class="platform-comparison">
          <div class="comparison-table">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="py-3 px-4 text-left">特性</th>
                  <th class="py-3 px-4 text-center">iOS (Apple)</th>
                  <th class="py-3 px-4 text-center">Android (Google)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">设计语言</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">人机界面指南 (HIG)</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">Material Design</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">设计单位</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">点 (pt)</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">密度无关像素 (dp)</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">标准字体</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">San Francisco (SF Pro)</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">Roboto</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">导航模式</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">标签栏底部、侧边栏</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">底部导航栏、抽屉导航</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">标准点击区域</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">44×44pt</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">48×48dp</td>
                </tr>
                <tr>
                  <td class="py-3 px-4 border-t border-gray-100">设计特点</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">扁平、简洁、轻量化</td>
                  <td class="py-3 px-4 border-t border-gray-100 text-center">材质感、层次感、动效</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="comparison-note mt-6 bg-gray-50 p-4 rounded-lg">
            <h5 class="text-lg font-medium mb-2">跨平台设计建议</h5>
            <p class="text-gray-700 mb-4">在进行跨平台设计时，应注意iOS和Android的设计差异，特别是在以下几个方面：</p>
            <ul class="space-y-2">
              <li class="flex items-start">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                <span>导航模式的差异：iOS通常使用标签栏，Android则使用抽屉式导航和底部导航</span>
              </li>
              <li class="flex items-start">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                <span>交互模式：iOS注重手势，Android强调按钮和明确的视觉提示</span>
              </li>
              <li class="flex items-start">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                <span>视觉风格：iOS趋向于轻量和扁平，Android则强调立体和层次</span>
              </li>
              <li class="flex items-start">
                <span class="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                <span>尊重平台特性：以平台原生体验为基础，避免简单的跨平台复制</span>
              </li>
            </ul>
          </div>

          <div class="platform-visuals mt-6">
            <h5 class="text-lg font-medium mb-3">视觉比较</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="platform-visual-card p-4 border border-blue-100 rounded-lg bg-blue-50">
                <h6 class="font-medium text-blue-800 mb-2">iOS 设计特点</h6>
                <ul class="space-y-1 text-sm">
                  <li>• 强调简洁与轻量感</li>
                  <li>• 使用毛玻璃效果</li>
                  <li>• 丰富的手势操作</li>
                  <li>• 顶部返回按钮</li>
                  <li>• 底部标签栏导航</li>
                  <li>• 强调字体层次感</li>
                  <li>• 轻微的阴影效果</li>
                </ul>
              </div>
              <div class="platform-visual-card p-4 border border-green-100 rounded-lg bg-green-50">
                <h6 class="font-medium text-green-800 mb-2">Android 设计特点</h6>
                <ul class="space-y-1 text-sm">
                  <li>• 强调材质与层次</li>
                  <li>• 使用卡片式UI元素</li>
                  <li>• 重视动效和状态转换</li>
                  <li>• 顶部应用栏和抽屉导航</li>
                  <li>• 悬浮操作按钮（FAB）</li>
                  <li>• 更丰富的色彩应用</li>
                  <li>• 明显的阴影效果</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #6C54FF;
  display: inline-block;
}

.spec-card {
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: #f9fafb;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

.comparison-table {
  overflow-x: auto;
}

.comparison-table table {
  border-collapse: collapse;
  width: 100%;
}

.comparison-table th {
  font-weight: 600;
  text-align: left;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.comparison-table td {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

.comparison-table tr:last-child td {
  border-bottom: 1px solid #e5e7eb;
}

.comparison-table tr:hover {
  background-color: #f9fafb;
}
</style>
