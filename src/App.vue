<script setup lang="ts">
/**
 * @file App.vue
 * @description 应用程序根组件，提供整体布局框架和响应式设计
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-09
 */

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGlobalToolConsumeGuard } from '@/composables/useGlobalToolConsumeGuard'
import { useToolRankingTracker } from '@/composables/useToolRankingTracker'
import { resolveMemberCoreToolExperience, type MemberCoreToolExperience } from '@/config/memberCoreTools'
import { getSitePublicConfig } from '@/services/siteConfig'
import type { Tool } from '@/types/tools'

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

interface ToolRuntimeBannerState {
  disabled: boolean
  title: string
  remark: string
  consumePoints: number
  memberFree: boolean
  memberCore: boolean
  commercialTier: string
  experience: MemberCoreToolExperience | null
  tool: Tool | null
}

const toolRuntimeBannerState = ref<ToolRuntimeBannerState>({
  disabled: false,
  title: '',
  remark: '',
  consumePoints: 0,
  memberFree: true,
  memberCore: false,
  commercialTier: 'free',
  experience: null,
  tool: null
})

const isCurrentToolDisabled = computed(() => {
  return Boolean(isToolPage.value && toolRuntimeBannerState.value.disabled)
})

const currentToolDisabledText = computed(() => {
  const title = String(toolRuntimeBannerState.value.title || '').trim() || '当前工具'
  const remark = String(toolRuntimeBannerState.value.remark || '').trim()
  if (remark) {
    return `当前工具「${title}」已在后台停用：${remark}`
  }
  return `当前工具「${title}」已在后台停用，请在后台启用后再使用。`
})

const currentToolDisabledRemark = computed(() => {
  return String(toolRuntimeBannerState.value.remark || '').trim() || '后台已临时关闭该工具，恢复后即可继续使用。'
})

const currentToolConsumeText = computed(() => {
  if (!isToolPage.value || isCurrentToolDisabled.value) {
    return ''
  }
  const consumePoints = Math.max(0, Number(toolRuntimeBannerState.value.consumePoints || 0))
  const memberFree = Boolean(toolRuntimeBannerState.value.memberFree)
  if (consumePoints <= 0) {
    return '当前工具无需消耗积分。'
  }
  return memberFree
    ? `当前工具每次消耗 ${consumePoints} 积分（会员可免积分）。`
    : `当前工具每次消耗 ${consumePoints} 积分。`
})

const currentMemberCoreExperience = computed(() => {
  return toolRuntimeBannerState.value.experience
})

const shouldShowMemberCorePanel = computed(() => {
  return Boolean(isToolPage.value && !isCurrentToolDisabled.value && currentMemberCoreExperience.value)
})

const currentToolRuntimeBadges = computed(() => {
  const badges: string[] = []
  if (toolRuntimeBannerState.value.memberCore || currentMemberCoreExperience.value) {
    badges.push('会员核心工具')
  }
  if (toolRuntimeBannerState.value.commercialTier === 'premium') {
    badges.push('Premium')
  }
  const consumePoints = Math.max(0, Number(toolRuntimeBannerState.value.consumePoints || 0))
  if (consumePoints > 0) {
    badges.push(`每次 ${consumePoints} 积分`)
  } else {
    badges.push('免积分')
  }
  if (toolRuntimeBannerState.value.memberFree && consumePoints > 0) {
    badges.push('会员免积分')
  }
  return badges
})

/**
 * 函数说明：标准化工具路由路径，统一去除 query/hash 与尾斜杠，便于和后台配置比对。
 */
const normalizeToolRoutePath = (path: unknown): string => {
  const normalizedPath = String(path || '')
    .trim()
    .split('?')[0]
    .split('#')[0]
  if (!normalizedPath) {
    return ''
  }
  if (normalizedPath === '/') {
    return '/'
  }
  return normalizedPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：标准化工具完整路由匹配键，保留 query 区分同一路径下的细分会员核心工具。
 */
const normalizeToolRouteMatchKey = (path: unknown): string => {
  const rawValue = String(path || '').trim().split('#')[0]
  if (!rawValue) {
    return ''
  }
  const [rawPath, rawQuery = ''] = rawValue.split('?')
  const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/g, '')
  const query = rawQuery.trim()
  return query ? `${normalizedPath}?${query}` : normalizedPath
}

/**
 * 函数说明：按当前路由在后台工具分类树中查找工具配置项。
 */
const findToolByRoutePath = async (routePath: string): Promise<Tool | null> => {
  const normalizedPath = normalizeToolRoutePath(routePath)
  const normalizedMatchKey = normalizeToolRouteMatchKey(routePath)
  if (!normalizedPath.startsWith('/tools/')) {
    return null
  }
  try {
    const siteConfig = await getSitePublicConfig()
    const categoryList = Array.isArray(siteConfig.toolCategories) ? siteConfig.toolCategories : []
    for (const category of categoryList) {
      const subList = Array.isArray(category.list) ? category.list : []
      for (const subCategory of subList) {
        const toolList = Array.isArray(subCategory.list) ? subCategory.list : []
        const matchedExactTool = toolList.find((tool) => normalizeToolRouteMatchKey(tool.url) === normalizedMatchKey)
        const matchedTool = matchedExactTool || toolList.find((tool) => {
          return normalizeToolRoutePath(tool.url) === normalizedPath
        })
        if (matchedTool) {
          return matchedTool
        }
      }
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * 函数说明：根据当前路由刷新工具运行态提示信息（停用状态与积分策略）。
 */
const syncToolRuntimeBannerState = async () => {
  if (!isToolPage.value) {
    toolRuntimeBannerState.value = {
      disabled: false,
      title: '',
      remark: '',
      consumePoints: 0,
      memberFree: true,
      memberCore: false,
      commercialTier: 'free',
      experience: null,
      tool: null
    }
    return
  }
  const matchedTool = await findToolByRoutePath(route.fullPath)
  if (!matchedTool) {
    const fallbackExperience = resolveMemberCoreToolExperience(route.fullPath)
    toolRuntimeBannerState.value = {
      disabled: false,
      title: fallbackExperience?.title || '',
      remark: '',
      consumePoints: Math.max(0, Number(fallbackExperience?.consumePoints || 0)),
      memberFree: true,
      memberCore: Boolean(fallbackExperience),
      commercialTier: fallbackExperience ? 'premium' : 'free',
      experience: fallbackExperience,
      tool: null
    }
    return
  }

  const experience = resolveMemberCoreToolExperience(matchedTool.url || route.fullPath)

  toolRuntimeBannerState.value = {
    disabled: Number(matchedTool.status ?? 1) === 0,
    title: String(matchedTool.title || '').trim(),
    remark: String(matchedTool.remark || '').trim(),
    consumePoints: Math.max(0, Number(matchedTool.consumePoints ?? 0)),
    memberFree: Boolean(matchedTool.memberFree ?? true),
    memberCore: Boolean(matchedTool.memberCore || experience),
    commercialTier: String(matchedTool.commercialTier || (experience ? 'premium' : 'free')).trim(),
    experience,
    tool: matchedTool
  }
}

watch(
  () => route.fullPath,
  () => {
    void syncToolRuntimeBannerState()
  },
  { immediate: true }
)

/**
 * 函数说明：挂载全工具动作拦截层，统一补齐登录与积分扣减校验。
 */
useGlobalToolConsumeGuard()

/**
 * 函数说明：挂载工具页访问埋点监听，统一补齐工具排行榜 visit 统计。
 */
useToolRankingTracker()
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
          <section v-if="isCurrentToolDisabled" class="tool-disabled-placeholder">
            <el-alert
              class="tool-runtime-alert tool-runtime-alert--warning"
              type="warning"
              :closable="false"
              show-icon
              :title="currentToolDisabledText"
            />
            <div class="tool-disabled-card">
              <div class="tool-disabled-card__eyebrow">工具维护中</div>
              <h1>{{ toolRuntimeBannerState.title || '当前工具' }}</h1>
              <p>{{ currentToolDisabledRemark }}</p>
              <div class="tool-disabled-card__meta">
                <span>状态：后台停用</span>
                <span v-if="toolRuntimeBannerState.consumePoints > 0">原消耗：{{ toolRuntimeBannerState.consumePoints }} 积分</span>
                <span v-if="toolRuntimeBannerState.memberFree">会员策略：会员免积分</span>
              </div>
            </div>
          </section>
          <el-alert
            v-else-if="currentToolConsumeText"
            class="tool-runtime-alert tool-runtime-alert--info"
            type="info"
            :closable="false"
            show-icon
            :title="currentToolConsumeText"
          />
          <section v-if="shouldShowMemberCorePanel && currentMemberCoreExperience" class="member-core-runtime-panel">
            <div class="member-core-runtime-panel__main">
              <div class="member-core-runtime-panel__eyebrow">会员核心卖点</div>
              <h1>{{ currentMemberCoreExperience.title }}</h1>
              <p>{{ currentMemberCoreExperience.valuePoint }}</p>
              <div class="member-core-runtime-panel__badges">
                <span v-for="badge in currentToolRuntimeBadges" :key="badge">{{ badge }}</span>
              </div>
            </div>
            <div class="member-core-runtime-panel__grid">
              <div>
                <strong>输入要求</strong>
                <span>{{ currentMemberCoreExperience.inputHint }}</span>
              </div>
              <div>
                <strong>输出结果</strong>
                <span>{{ currentMemberCoreExperience.outputHint }}</span>
              </div>
              <div>
                <strong>失败兜底</strong>
                <span>{{ currentMemberCoreExperience.failureHint }}</span>
              </div>
            </div>
          </section>
          <!-- 路由视图，使用过渡动画 -->
          <router-view v-if="!isCurrentToolDisabled" v-slot="{ Component }">
            <transition name="animation" mode="out-in">
              <component :is="Component" :key="route.fullPath" />
            </transition>
          </router-view>
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

.tool-runtime-alert {
  margin-bottom: 1rem;
  border-radius: 0.75rem;
}

.tool-disabled-placeholder {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-disabled-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 28px;
}

.tool-disabled-card__eyebrow {
  width: fit-content;
  border-radius: 6px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 6px 8px;
}

.tool-disabled-card h1 {
  margin: 14px 0 0;
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
}

.tool-disabled-card p {
  margin: 10px 0 0;
  max-width: 640px;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
}

.tool-disabled-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.tool-disabled-card__meta span {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f9fafb;
  color: #374151;
  font-size: 12px;
  line-height: 1;
  padding: 7px 8px;
}

.tool-runtime-alert--warning {
  border-color: #f59e0b;
}

.tool-runtime-alert--info {
  border-color: #60a5fa;
}

.member-core-runtime-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 0.95fr);
  gap: 16px;
  margin-bottom: 16px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 18px;
}

.member-core-runtime-panel__eyebrow {
  width: fit-content;
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 6px 8px;
}

.member-core-runtime-panel h1 {
  margin: 12px 0 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 0;
}

.member-core-runtime-panel p {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.7;
}

.member-core-runtime-panel__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.member-core-runtime-panel__badges span {
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: #ffffff;
  color: #1e40af;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 7px 8px;
}

.member-core-runtime-panel__grid {
  display: grid;
  gap: 10px;
}

.member-core-runtime-panel__grid div {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px;
}

.member-core-runtime-panel__grid strong {
  display: block;
  color: #111827;
  font-size: 13px;
  line-height: 1.4;
}

.member-core-runtime-panel__grid span {
  display: block;
  margin-top: 5px;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.65;
}

@media (max-width: 768px) {
  .el-main {
    padding-right: 0 !important;
  }

  .tool-disabled-card {
    padding: 20px;
  }

  .tool-disabled-card h1 {
    font-size: 20px;
  }

  .member-core-runtime-panel {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .member-core-runtime-panel h1 {
    font-size: 18px;
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
