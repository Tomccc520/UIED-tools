/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */

import { describe, expect, it } from 'vitest'
import defaultChangelogTimeline from '@/constants/changelogTimeline'
import { normalizeChangelogTimeline } from './siteConfig'

describe('normalizeChangelogTimeline', () => {
  it('合并重复版本、同名功能块和重复描述', () => {
    const result = normalizeChangelogTimeline([
      {
        id: 'v1',
        version: '1.0.0',
        date: '2026-08-25',
        badgeText: '发布',
        badgeType: 'success',
        title: '首次发布',
        features: [
          {
            title: '功能更新',
            points: ['新增 <strong>搜索</strong>', '移动端适配']
          }
        ]
      },
      {
        id: 'v1-duplicate',
        version: '1.0.0',
        date: '2026-08-26',
        badgeText: '优化',
        badgeType: 'info',
        title: '重复版本',
        features: [
          {
            title: '功能更新',
            points: ['新增 搜索', '增加版本筛选']
          },
          {
            title: '体验优化</div><div class="legacy">旧结构',
            points: ['移动端适配', '无阴影卡片']
          }
        ]
      }
    ])

    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('首次发布')
    expect(result[0].features).toEqual([
      {
        title: '功能更新',
        points: ['新增 <strong>搜索</strong>', '移动端适配', '增加版本筛选']
      },
      {
        title: '体验优化',
        points: ['无阴影卡片']
      }
    ])
  })

  it('默认时间线不再返回重复版本', () => {
    const result = normalizeChangelogTimeline(defaultChangelogTimeline)
    const versions = result.map((item) => item.version.toLowerCase())
    expect(new Set(versions).size).toBe(versions.length)
    expect(versions.filter((version) => version === '1.1.8')).toHaveLength(1)
    expect(versions.filter((version) => version === '1.1.4')).toHaveLength(1)
  })
})
