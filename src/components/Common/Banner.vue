<script setup lang="ts">
/**
 * @file Banner.vue
 * @description 广告横幅组件，用于展示广告内容
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-03-21
 */

// 导入需要的组件和接口
import { ref } from 'vue'
import { Promotion } from '@element-plus/icons-vue'

// 广告数据
const bannerList = ref([
  {
    id: 1,
    link: 'https://fsuied.com/website-scmz.html',
    gradient: 'linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(224, 231, 255) 35%, rgb(237, 242, 255) 45%, rgb(139, 92, 246) 100%)',
    text: '无需代码 会打字就能轻松建网站',
    badge: '推荐'
  },
  {
    id: 2,
    link: 'https://nf.video/mbx1u6/?gid=18',
    gradient: 'linear-gradient(to right, rgb(236, 72, 153) 0%, rgb(251, 231, 239) 35%, rgb(253, 242, 248) 45%, rgb(244, 114, 182) 100%)',
    text: 'GPT-5.2重回巅峰 智能对话',
    badge: '热门'
  },
  {
    id: 3,
    link: 'https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied',
    gradient: 'linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(243, 232, 255) 35%, rgb(245, 243, 255) 45%, rgb(192, 132, 252) 100%)',
    text: '免费AI编程工具 Trae - 智能编码助手',
    badge: '新品'
  },
  {
    id: 4,
    link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047',
    gradient: 'linear-gradient(to right, rgb(16, 185, 129) 0%, rgb(209, 250, 229) 35%, rgb(236, 253, 245) 45%, rgb(52, 211, 153) 100%)',
    text: '免费AI生成PPT - 一键生成演示文稿',
    badge: '高效'
  },
  {
    id: 5,
    link: 'https://universalbus.cn/?s=lPLG02aydo',
    gradient: 'linear-gradient(to right, rgb(249, 115, 22) 0%, rgb(255, 237, 213) 35%, rgb(255, 247, 237) 45%, rgb(251, 146, 60) 100%)',
    text: 'Adobe 正版全家桶可用AI',
    badge: '特惠'
  },
  {
    id: 6,
    link: 'https://universalbus.cn/?s=lPLG02aydo',
    gradient: 'linear-gradient(to right, rgb(14, 165, 233) 0%, rgb(224, 242, 254) 35%, rgb(240, 249, 255) 45%, rgb(56, 189, 248) 100%)',
    text: 'Gemini3 可用 nanobanana',
    badge: '新品'
  }
])
</script>

<template>
  <div class="banner-wrapper">
    <div class="banner-container">
      <!-- 轮播广告 -->
      <el-carousel height="48px" :interval="4000" :arrow="false" indicator-position="none" class="banner-carousel">
        <el-carousel-item v-for="item in bannerList" :key="item.id">
          <a :href="item.link" target="_blank" class="banner-link" :style="{ backgroundImage: item.gradient }">
            <div class="banner-content">
              <span v-if="item.badge" class="banner-badge">{{ item.badge }}</span>
              <span class="banner-text">{{ item.text }}</span>
              <el-icon class="arrow-icon">
                <Promotion />
              </el-icon>
            </div>
          </a>
        </el-carousel-item>
      </el-carousel>
    </div>
  </div>
</template>

<style scoped>
.banner-wrapper {
  padding: 0 0 16px 0;
  width: 100%;
}

.banner-container {
  border-radius: 12px;
  overflow: hidden;
  height: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  transition: all 0.3s ease;
}

.banner-container:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.banner-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  position: relative;
  background-size: 200% 100%;
  animation: gradientMove 6s ease infinite;
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-badge {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  font-weight: bold;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.banner-text {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.5px;
}

.arrow-icon {
  font-size: 16px;
  color: #333;
  opacity: 0.9;
  margin-left: 4px;
}

/* 自定义轮播图样式 */
:deep(.el-carousel__item) {
  background: transparent;
}
</style>
