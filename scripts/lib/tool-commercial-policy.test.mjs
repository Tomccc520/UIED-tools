/**
 * @file tool-commercial-policy.test.mjs
 * @description 工具商业策略收口测试，覆盖 toolKey、计费字段和会员核心工具清单
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-29
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MEMBER_CORE_TOOL_PRESETS,
  buildToolConsumeRulesFromCategories,
  countCommercialPolicyTools,
  deriveToolKeyByUrl,
  enrichToolCategoriesWithCommercialPolicy,
  normalizeToolRouteMatchKey
} from './tool-commercial-policy.mjs'

const createFixtureCategories = () => [
  {
    id: 1,
    title: 'AI工具箱',
    list: [
      {
        id: 11,
        title: 'AI办公工具',
        list: [
          {
            id: 101,
            title: '工作总结',
            desc: '生成工作总结',
            url: '/tools/ai/work-summary',
            logo: { type: 'svg', name: 'aiArticle' }
          },
          {
            id: 102,
            title: '年度工作总结',
            desc: '生成年度工作总结',
            url: '/tools/ai/work-summary?type=annual',
            logo: { type: 'svg', name: 'aiArticle' }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '开发工具',
    list: [
      {
        id: 21,
        title: '格式化',
        list: [
          {
            id: 201,
            title: 'JSON格式化',
            desc: '格式化 JSON',
            url: '/tools/dev/json-format',
            logo: { type: 'svg', name: 'json' }
          }
        ]
      }
    ]
  }
]

test('normalizeToolRouteMatchKey 保留 query 并清理 hash 和尾斜杠', () => {
  assert.equal(normalizeToolRouteMatchKey('/tools/ai/work-summary/?type=annual#top'), '/tools/ai/work-summary?type=annual')
})

test('deriveToolKeyByUrl 为 query 工具生成稳定唯一 key', () => {
  assert.equal(deriveToolKeyByUrl('/tools/ai/work-summary?type=annual'), 'ai-work-summary-type-annual')
  assert.equal(deriveToolKeyByUrl('/tools/unit?active=length'), 'unit-active-length')
})

test('MEMBER_CORE_TOOL_PRESETS 固定为 20 个会员核心工具', () => {
  assert.equal(MEMBER_CORE_TOOL_PRESETS.length, 20)
  assert.ok(MEMBER_CORE_TOOL_PRESETS.some((item) => item.toolKey === 'ai-work-summary'))
  assert.ok(MEMBER_CORE_TOOL_PRESETS.some((item) => item.toolKey === 'photo-background'))
  assert.ok(MEMBER_CORE_TOOL_PRESETS.every((item) => Number(item.consumePoints) > 0))
})

test('enrichToolCategoriesWithCommercialPolicy 为所有工具补齐商业策略字段', () => {
  const enriched = enrichToolCategoriesWithCommercialPolicy(createFixtureCategories())
  const aiWorkSummary = enriched[0].list[0].list[0]
  const annualSummary = enriched[0].list[0].list[1]
  const jsonFormat = enriched[1].list[0].list[0]

  assert.equal(aiWorkSummary.toolKey, 'ai-work-summary')
  assert.equal(aiWorkSummary.memberCore, true)
  assert.equal(aiWorkSummary.commercialTier, 'premium')
  assert.equal(aiWorkSummary.needLogin, true)
  assert.equal(aiWorkSummary.consumePoints, 2)
  assert.equal(aiWorkSummary.memberFree, true)
  assert.equal(aiWorkSummary.status, 1)

  assert.equal(annualSummary.toolKey, 'ai-work-summary-annual')
  assert.equal(annualSummary.memberCore, true)
  assert.equal(annualSummary.consumePoints, 2)

  assert.equal(jsonFormat.toolKey, 'dev-json-format')
  assert.equal(jsonFormat.memberCore, false)
  assert.equal(jsonFormat.commercialTier, 'free')
  assert.equal(jsonFormat.needLogin, false)
  assert.equal(jsonFormat.consumePoints, 0)
})

test('会员核心工具会覆盖旧阶段预设的低扣分值', () => {
  const enriched = enrichToolCategoriesWithCommercialPolicy([
    {
      id: 1,
      title: '图片处理',
      list: [
        {
          id: 11,
          title: '证件照',
          list: [
            {
              id: 101,
              title: '证件照换底色',
              desc: '旧阶段预设曾写入 1 分',
              url: '/tools/photo/background',
              toolKey: 'photo-background',
              consumePoints: 1,
              memberFree: true,
              status: 1,
              logo: { type: 'svg', name: 'photo' }
            }
          ]
        }
      ]
    }
  ])

  const photoBackground = enriched[0].list[0].list[0]
  assert.equal(photoBackground.memberCore, true)
  assert.equal(photoBackground.consumePoints, 3)
})

test('countCommercialPolicyTools 统计策略覆盖和会员核心数量', () => {
  const summary = countCommercialPolicyTools(enrichToolCategoriesWithCommercialPolicy(createFixtureCategories()))
  assert.deepEqual(summary, {
    toolCount: 3,
    explicitToolKeyCount: 3,
    strategyFieldToolCount: 3,
    memberCoreToolCount: 2,
    freeToolCount: 1,
    standardToolCount: 0,
    premiumToolCount: 2
  })
})

test('buildToolConsumeRulesFromCategories 生成后台计费策略规则', () => {
  const rules = buildToolConsumeRulesFromCategories(enrichToolCategoriesWithCommercialPolicy(createFixtureCategories()))
  assert.equal(rules.length, 3)
  assert.deepEqual(
    rules.map((item) => item.toolKey),
    ['ai-work-summary', 'ai-work-summary-annual', 'dev-json-format']
  )
  assert.equal(rules[0].consumePoints, 2)
  assert.equal(rules[0].memberFree, 1)
  assert.equal(rules[2].consumePoints, 0)
  assert.equal(rules[2].needLogin, 0)
})
