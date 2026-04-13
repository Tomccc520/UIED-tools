/**
 * @file useToolRankingTracker.ts
 * @description 工具排行榜访问埋点组合式函数，统一监听工具页路由并上报 visit 事件
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-13
 */

import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { trackToolVisitByRoute } from '@/services/toolRanking'

/**
 * 函数说明：挂载工具页访问埋点监听，仅对 /tools/* 路由生效。
 */
export const useToolRankingTracker = () => {
  const route = useRoute()

  /**
   * 函数说明：在工具页切换时上报 visit 事件；接口失败时静默跳过，避免影响主流程。
   */
  const syncToolRankingVisit = async (routePath: string) => {
    const normalizedPath = String(routePath || '').trim()
    if (!normalizedPath.startsWith('/tools/')) {
      return
    }
    try {
      await trackToolVisitByRoute(normalizedPath, 'app-route-watch')
    } catch {
      // 函数说明：排行榜埋点属于非阻断能力，失败时不影响页面渲染与工具使用。
    }
  }

  watch(
    () => route.path,
    (currentPath) => {
      void syncToolRankingVisit(currentPath)
    },
    { immediate: true }
  )
}
