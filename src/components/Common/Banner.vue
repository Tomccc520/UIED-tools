<script setup lang="ts">
/**
 * @file Banner.vue
 * @description 广告横幅组件，用于展示广告内容
 * @createDate 2025-03-21
 */

// 导入需要的组件和接口
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'  // 导入Close图标

// 广告数据
const bannerList = ref([
  {
    id: 1,
    link: 'https://fsuied.com/website-scmz.html',
    gradient: 'linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(224, 231, 255) 35%, rgb(237, 242, 255) 45%, rgb(139, 92, 246) 100%)',
    text: '无需代码 会打字就能轻松建网站 →'
  },
  {
    id: 2,
    link: 'https://nf.video/mbx1u6/?gid=18',
    gradient: 'linear-gradient(to right, rgb(236, 72, 153) 0%, rgb(251, 231, 239) 35%, rgb(253, 242, 248) 45%, rgb(244, 114, 182) 100%)',
    text: 'GPT-4o重回巅峰可生成逼真图文 →'
  }
])

// 是否显示广告
const showBanner = ref(true)

// 关闭广告
const closeBanner = () => {
  showBanner.value = false
}
</script>

<template>
  <div v-if="showBanner" class="banner-container w-full relative">
    <!-- 轮播广告 -->
    <el-carousel height="50px" :interval="5000" :arrow="false" indicator-position="none" class="w-full">
      <el-carousel-item v-for="item in bannerList" :key="item.id">
        <a :href="item.link" target="_blank" class="banner-link" :style="{ background: item.gradient }">
          <span class="banner-text">{{ item.text }}</span>
        </a>
      </el-carousel-item>
    </el-carousel>

    <!-- 关闭按钮 -->
    <el-button class="close-btn !absolute !right-1 !top-1" circle size="small" @click="closeBanner">
      <el-icon class="close-icon">
        <Close />
      </el-icon>
    </el-button>
  </div>
</template>

<style scoped>
.banner-container {
  border-radius: 8px;
  overflow: hidden;
  height: 50px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.banner-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.banner-text {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  letter-spacing: 0.5px;
}

/* 自定义轮播图样式 */
:deep(.el-carousel__item) {
  background: transparent;
}

.close-btn {
  z-index: 10;
  opacity: 0.8;
  background-color: rgba(255, 255, 255, 0.8);
  width: 20px !important;
  height: 20px !important;
  padding: 0 !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  right: 4px !important;
}

.close-icon {
  font-size: 12px;
}
</style>
