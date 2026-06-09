/**
 * @file useMemberCoreToolExperienceTips.ts
 * @description 会员核心工具页内体验提示组合函数，复用统一体验主数据生成结果提示卡片
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-09
 */

import { computed } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { resolveMemberCoreToolExperience } from '@/config/memberCoreTools'

interface MemberCoreToolTipItem {
  label: string
  text: string
}

/**
 * 函数说明：将当前路由匹配到的会员核心体验主数据转换为页内提示卡片状态。
 */
export const useMemberCoreToolExperienceTips = (route: RouteLocationNormalizedLoaded) => {
  const currentMemberCoreExperience = computed(() => resolveMemberCoreToolExperience(route.fullPath))

  const memberCoreTipsTitle = computed(() => {
    if (!currentMemberCoreExperience.value) {
      return '结果交付建议'
    }
    return `${currentMemberCoreExperience.value.title}结果交付建议`
  })

  const memberCoreTipsItems = computed<MemberCoreToolTipItem[]>(() => {
    const experience = currentMemberCoreExperience.value
    if (!experience) {
      return []
    }

    return [
      {
        label: '输入模板',
        text: `${experience.inputHint} 示例：${experience.sampleInput}`
      },
      {
        label: '结果校对',
        text: `${experience.deliverableExample} ${experience.qualityHint}`
      },
      {
        label: '失败兜底',
        text: `${experience.failureHint} 运行前会显式提示消耗 ${experience.consumePoints} 积分，会员可免积分使用。`
      }
    ]
  })

  return {
    currentMemberCoreExperience,
    memberCoreTipsTitle,
    memberCoreTipsItems
  }
}
