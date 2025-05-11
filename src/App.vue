<script setup lang="ts">
/**
 * @file App.vue
 * @description 应用程序根组件，提供整体布局框架和响应式设计
 * @author UIED技术团队
 * @createDate 2025-1-8
 */

import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

// 导入布局相关组件
import Header from '@/components/Layout/Header/Header.vue'  // 顶部导航栏
import Left from '@/components/Layout/Left/Left.vue'        // 左侧菜单栏
import Floor from '@/components/Layout/Floor/Floor.vue'     // 底部信息栏
import Right from '@/components/Layout/Right/Right.vue'     // 右侧边栏
import Banner from '@/components/Common/Banner.vue'         // 广告横幅组件

// 导入状态管理
import { useComponentStore } from '@/store/modules/component'

// 初始化组件状态管理
const componentStore = useComponentStore()

// 获取当前路由
const route = useRoute()

// Banner组件ref
const banner = ref(null)

// 判断是否为工具页面
const isToolPage = computed(() => {
  return route.path.includes('/tools/')
})
</script>

<template>
  <!-- 使用 Element Plus 的容器组件布局 -->
  <el-container>
    <!-- 左侧边栏区域 -->
    <!-- 桌面端显示固定侧边栏，移动端隐藏 -->
    <el-aside class="fixed top-0 left-0 h-full z-10 c-md:block c-sm:hidden c-xs:hidden" width="15rem"
      v-show="!componentStore.leftCom">
      <Left></Left>
    </el-aside>

    <!-- 移动端抽屉菜单 -->
    <el-drawer show-close size="15rem" :with-header="false" v-model="componentStore.leftComDrawer" direction="ltr">
      <Left></Left>
    </el-drawer>

    <!-- 右侧主体内容区域 -->
    <!-- 根据左侧菜单状态调整左边距 -->
    <el-container :class="!componentStore.leftCom ? 'c-md:ml-[15rem]' : ''">
      <!-- 顶部导航栏 -->
      <el-header class="!h-16 !px-4">
        <Header />
      </el-header>

      <!-- 广告横幅区域 -->
      <div class="px-4 mt-2">
        <Banner ref="banner" />
      </div>

      <!-- 主内容和右侧边栏容器 -->
      <div class="flex gap-0 px-4 relative">
        <!-- 主内容区域 -->
        <el-main class="!pt-4"
          :class="{ 'flex-1': isToolPage && !route.meta.hideToolsRecommend, 'w-full': !isToolPage || route.meta.hideToolsRecommend }">
          <!-- 路由视图，使用过渡动画 -->
          <transition name="animation" mode="out-in">
            <router-view :key="route.path" />
          </transition>
        </el-main>

        <!-- 右侧边栏 - 仅在工具页面且未禁用工具推荐时显示 -->
        <el-aside v-show="isToolPage && !route.meta.hideToolsRecommend" width="14rem"
          class="c-md:block c-sm:hidden c-xs:hidden pt-4">
          <div class="sticky top-4">
            <Right />
          </div>
        </el-aside>
      </div>

      <!-- 底部信息区域 -->
      <el-footer class="!px-4 !py-4 sm:!py-4">
        <Floor />
      </el-footer>
    </el-container>

  </el-container>
</template>

<style scoped>
/**
 * 页面切换动画样式
 * 1. enter-from: 进入前的起始状态
 * 2. enter-to: 进入后的最终状态
 * 3. leave-from: 离开前的起始状态
 * 4. leave-to: 离开后的最终状态
 */

/* 覆盖 el-main 的默认内边距 */
:deep(.el-main) {
  --el-main-padding: 0px;
}

/* 覆盖 el-footer 的内边距 */
:deep(.el-footer) {
  padding: 0.5rem 1rem !important;
  margin-top: 1rem !important;
}

@media (min-width: 640px) {
  :deep(.el-footer) {
    padding: 0.5rem 1rem !important;
    margin-top: 1rem !important;
  }
}

.animation-enter-from,
.animation-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.animation-enter-to,
.animation-leave-from {
  opacity: 1;
}

/* 进入动画时间和效果 */
.animation-enter-active {
  transition: all 0.7s ease;
}

/* 离开动画时间和效果 */
.animation-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.6, 0.6, 1);
}

/* 右侧边栏样式 */
:deep(.el-aside) {
  overflow: visible;
  padding-left: 0 !important;
}

/* 调整主内容区域右边距 */
.el-main {
  padding-right: 1rem !important;
}

@media (max-width: 768px) {
  .el-main {
    padding-right: 0 !important;
  }
}
</style>

<style>
:root {
  font-size: 16px;
}

@media screen and (max-width: 1440px) {
  :root {
    font-size: 15px;
  }
}

@media screen and (max-width: 1024px) {
  :root {
    font-size: 14px;
  }
}

@media screen and (max-width: 768px) {
  :root {
    font-size: 13px;
  }
}

@media screen and (max-width: 480px) {
  :root {
    font-size: 12px;
  }
}
</style>
