<script setup lang="ts">
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author Tomda
 * @createDate 2024-12-22
 * @lastUpdate 2025-01-10 21:14
 * @description UIED-Tools 在线工具箱 - 提供图片处理、格式转换、开发工具等在线服务
 * @keywords 在线工具,图片处理,格式转换,开发工具,在线服务,免费工具
 */

// 动态设置页面标题
document.title = 'UIED-Tools - 关于我们'
// 动态设置页面描述
const metaDescription = document.querySelector('meta[name="description"]')
if (metaDescription) {
  metaDescription.setAttribute('content', 'UIED-Tools 是一款专注于图片处理的在线工具箱，提供图片压缩、格式转换、批量处理等功能，为设计师和开发者提供专业、高效的图片处理解决方案。')
}
// 动态设置页面关键词
const metaKeywords = document.querySelector('meta[name="keywords"]')
if (metaKeywords) {
  metaKeywords.setAttribute('content', '在线工具,图片处理,格式转换,开发工具,在线服务,免费工具,UIED-Tools')
}

// 工具特点数据
const features = [
  {
    icon: 'Picture',
    title: '创意设计',
    description: '为互联网设计师提供专业的图片处理工具，让设计工作更加高效便捷'
  },
  {
    icon: 'Monitor',
    title: '研发工具',
    description: '为程序员和开发团队提供常用开发工具，提升日常编码和调试效率'
  },
  {
    icon: 'Document',
    title: '办公助手',
    description: '为职场人士提供文档转换、格式处理等效率工具，让办公更加便利'
  },
  {
    icon: 'Magic',
    title: '内容创作',
    description: '为新媒体团队提供文案、排版等创意工具，提升内容创作效率'
  }
]

// 核心价值数据
const values = [
  {
    title: '简单易用',
    description: '界面直观，操作简单，无需复杂设置即可快速上手使用'
  },
  {
    title: '安全可靠',
    description: '重视数据安全，大部分功能采用本地处理，确保用户隐私'
  },
  {
    title: '持续更新',
    description: '定期更新维护，不断优化功能和用户体验'
  },
  {
    title: '免费开放',
    description: '所有工具完全免费，为用户提供优质的在线服务'
  }
]
</script>

<template>
  <div class="about-container md:mr-6 c-xs:mr-0">
    <div class="flex flex-col">
      <!-- 标题区域 -->
      <div class="header-section mb-8">
        <h1 class="text-2xl font-bold mb-4 text-gradient">关于 UIED-Tools</h1>
        <div class="text-gray-500 text-sm">
          为白领和互联网从业者打造的在线工具平台
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-section">
        <!-- 项目介绍 -->
        <div class="description-card mb-8">
          <h2 class="text-lg font-bold mb-4">项目介绍</h2>
          <el-text class="text-base leading-relaxed">
            <el-link href="https://fsuied.com" target="_blank" type="primary" class="font-medium">UIED-Tools</el-link>
            是一个专注于服务白领和互联网从业者的在线工具平台。我们深知现代职场人士的工作需求，精心打造了一系列提升工作效率的实用工具，所有工具完全免费，涵盖设计创作、开发编程、文档处理、新媒体运营等多个领域，致力于让每位职场人的工作更轻松、更高效。
          </el-text>
        </div>

        <!-- 工具特点 -->
        <div class="features-section mb-8">
          <h2 class="text-lg font-bold mb-4">工具特点</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="(feature, index) in features" :key="index" class="feature-card">
              <el-icon class="text-2xl text-primary mb-2">
                <component :is="feature.icon"></component>
              </el-icon>
              <h3 class="text-base font-bold mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <!-- 核心价值 -->
        <div class="values-section card mb-8">
          <h2 class="text-lg font-bold mb-4">核心价值</h2>
          <div class="grid md:grid-cols-2 gap-4">
            <div v-for="(value, index) in values" :key="index" class="value-item">
              <h3 class="text-base font-bold mb-2 text-primary">{{ value.title }}</h3>
              <p class="text-sm text-gray-600">{{ value.description }}</p>
            </div>
          </div>
        </div>

        <!-- 技术支持 -->
        <div class="card support-section mb-8">
          <h2 class="text-lg font-bold mb-4">技术支持</h2>
          <div class="flex flex-col space-y-4">
            <div class="flex items-center space-x-2 text-gray-600">
              <el-icon class="text-primary">
                <User />
              </el-icon>
              <span class="text-sm">开发团队：</span>
              <el-link href="https://www.tomda.top/" target="_blank" type="primary">Tomda</el-link>
              <span class="text-gray-300">|</span>
              <el-link href="https://fsuied.com" target="_blank" type="primary">UIED技术团队</el-link>
            </div>
            <div class="flex items-center space-x-2 text-gray-600">
              <el-icon class="text-primary">
                <Message />
              </el-icon>
              <span class="text-sm">联系我们：</span>
              <el-link href="https://fsuied.com/contact.html" target="_blank"
                type="primary">https://fsuied.com/contact.html</el-link>
            </div>
          </div>
        </div>
        <!-- 免责声明 -->
        <div class="card disclaimer-section mb-8">
          <h2 class="text-lg font-bold mb-4">免责声明</h2>
          <div class="disclaimer-content text-gray-600">
            <p class="mb-4 text-sm">使用本站工具，即表示您已阅读并同意以下声明：</p>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start">
                <span class="mr-2 text-primary">1.</span>
                <span>本站提供的工具和服务仅供学习和参考。如因使用不当造成任何直接或间接损失，本站不承担任何责任。</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-primary">2.</span>
                <span>本站工具使用的算法及相关资源均来源于网络，如有侵权，请及时联系我们处理。</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-primary">3.</span>
                <span>工具处理的数据结果仅供参考，请您在使用前进行必要的验证和核实。</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-primary">4.</span>
                <span>本站不对用户上传的内容负责，请确保您具有相关内容的使用权限。</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- 版权信息 -->
        <div class="copyright-section pt-6 border-t border-gray-100">
          <div class="text-sm text-gray-400">
            <p class="mb-2">© 2024-2025 UIED-Tools. All Rights Reserved.</p>
            <p>本站内容未经授权，禁止转载或用于其他商业用途</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.text-gradient {
  background: linear-gradient(120deg, #6C54FF, #00CE3F);
  -webkit-background-clip: text;
  color: transparent;
}

.description-card {
  line-height: 1.8;
  color: var(--el-text-color-regular);
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.text-primary {
  color: #6C54FF;
}

.el-link {
  font-weight: 500;
}

.feature-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.value-item {
  padding: 1rem;
  border-radius: 8px;
}

.support-section {
  background: #fff;
}

.disclaimer-section {
  background: #fff;
}

.disclaimer-content {
  line-height: 1.6;
}

.copyright-section {
  line-height: 1.6;
}

@media (max-width: 640px) {
  .about-container {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .feature-card {
    padding: 1rem;
  }
}
</style>
