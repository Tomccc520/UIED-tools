/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-22
 */

import { describe, expect, it } from 'vitest'
import type { ToolCategory } from '@/types/tools'
import {
  filterToolCategoriesForRelease,
  isAiResumeToolEntry,
  isReleaseHiddenToolEntry
} from './standaloneTools'

const categories: ToolCategory[] = [
  {
    id: 1,
    title: 'AI工具箱',
    list: [
      {
        id: 1,
        title: 'AI文档工具',
        list: [
          {
            id: 1,
            title: 'AI简历工作台',
            logo: { type: 'svg', name: 'resume' },
            desc: '简历工具',
            url: '/tools/ai-resume',
            toolKey: 'ai-resume'
          },
          {
            id: 2,
            title: 'AI写作',
            logo: { type: 'svg', name: 'writing' },
            desc: '写作工具',
            url: '/tools/ai/article-generator',
            toolKey: 'ai-article-generator'
          },
          {
            id: 3,
            title: '品牌设计规范',
            logo: { type: 'svg', name: 'brand' },
            desc: '尚未完成的工具',
            url: '/tools/design/brand-spec',
            toolKey: 'design-brand-spec'
          }
        ]
      }
    ]
  }
]

describe('独立工具发布过滤', () => {
  it('兼容 toolKey、新路由和历史路由识别 AI 简历入口', () => {
    expect(isAiResumeToolEntry({ toolKey: 'ai-resume', url: '' })).toBe(true)
    expect(isAiResumeToolEntry({ url: '/tools/ai-resume/editor' })).toBe(true)
    expect(isAiResumeToolEntry({ url: '/tools/ai/resume' })).toBe(true)
    expect(isAiResumeToolEntry({ toolKey: 'ai-article-generator', url: '/tools/ai/article-generator' })).toBe(false)
  })

  it('关闭发布开关时只移除 AI 简历，保留同分组其他工具', () => {
    const filteredCategories = filterToolCategoriesForRelease(categories, false)
    const tools = filteredCategories[0].list[0].list

    expect(tools).toHaveLength(1)
    expect(tools[0].toolKey).toBe('ai-article-generator')
  })

  it('无论独立工具开关如何都隐藏未达到交付标准的工具', () => {
    expect(isReleaseHiddenToolEntry({ url: '/tools/design/brand-spec' })).toBe(true)
    const tools = filterToolCategoriesForRelease(categories, true)[0].list[0].list

    expect(tools.map((tool) => tool.toolKey)).toEqual(['ai-resume', 'ai-article-generator'])
  })
})
