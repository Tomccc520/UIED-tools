/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-20
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import ToolRankingBoard from './ToolRankingBoard.vue'
import type { ToolRankingListItem, ToolRankingListResult, ToolRankingPeriod } from '@/services/toolRanking'
import type { Tool } from '@/types/tools'

const rankingMocks = vi.hoisted(() => ({
  getToolRankingList: vi.fn(),
  buildFallbackToolRankingItems: vi.fn(),
  openToolEntry: vi.fn()
}))

vi.mock('@/services/toolRanking', () => ({
  getToolRankingList: rankingMocks.getToolRankingList,
  buildFallbackToolRankingItems: rankingMocks.buildFallbackToolRankingItems
}))
vi.mock('@/composables/useToolRuntimeGate', () => ({
  /** 返回可观察的门禁入口，组件本身仍执行真实的点击转换逻辑。 */
  useToolRuntimeGate: () => ({ openToolEntry: rankingMocks.openToolEntry })
}))

const wrappers: VueWrapper[] = []
type BoardProps = InstanceType<typeof ToolRankingBoard>['$props']

/** 根据编号和覆盖字段创建完整榜单项，让状态、备注及点击量可以独立验证。 */
function rankingItem(index: number, overrides: Partial<ToolRankingListItem> = {}): ToolRankingListItem {
  return {
    rank: index,
    toolKey: `ranking-${index}`,
    toolTitle: `测试工具${index}`,
    toolUrl: `/tools/ranking-${index}`,
    cateTitle: '开发工具',
    viewCount: 100 - index,
    startCount: 0,
    successCount: 0,
    downloadCount: 0,
    score: 100 - index,
    status: 1,
    remark: '',
    ...overrides
  }
}

/** 将指定榜单与周期封装为服务真实返回结构，避免组件测试省略接口字段。 */
function rankingResult(list: ToolRankingListItem[], period: ToolRankingPeriod = 'week'): ToolRankingListResult {
  return {
    period,
    sortBy: 'view',
    limit: list.length,
    startDate: '2026-10-19',
    endDate: '2026-10-20',
    updatedAt: 1792454400,
    list
  }
}

/** 创建可手动完成的请求，用于精确控制加载中、请求乱序和失败重试的时机。 */
function pendingRanking() {
  let resolve!: (value: ToolRankingListResult) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<ToolRankingListResult>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

/** 挂载真实榜单并登记清理；默认采用独立榜单配置，允许各用例覆盖属性。 */
function mountBoard(props: Partial<BoardProps> = {}) {
  const wrapper = mount(ToolRankingBoard, {
    props: { flat: true, useFallbackOnError: false, showRetry: true, ...props }
  })
  wrappers.push(wrapper)
  return wrapper
}

beforeEach(() => {
  rankingMocks.getToolRankingList.mockReset()
  rankingMocks.buildFallbackToolRankingItems.mockReset().mockReturnValue([])
  rankingMocks.openToolEntry.mockReset().mockResolvedValue(true)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  vi.restoreAllMocks()
})

describe('ToolRankingBoard 统一榜单与入口契约', () => {
  it.each([1, 3, 8])('%i 条结果按顺序完整出现在同一个可访问列表中', async (count) => {
    const items = Array.from({ length: count }, (_, index) => rankingItem(index + 1))
    rankingMocks.getToolRankingList.mockResolvedValue(rankingResult(items))
    const wrapper = mountBoard({ title: '每周热门工具', limit: 8 })
    await flushPromises()

    expect(rankingMocks.getToolRankingList).toHaveBeenCalledExactlyOnceWith({ period: 'week', limit: 8, sortBy: 'view' })
    expect(wrapper.findAll('ol')).toHaveLength(1)
    const rows = wrapper.get('ol[aria-label="每周热门工具列表"]').findAll('li')
    expect(rows).toHaveLength(count)
    for (const [index, row] of rows.entries()) {
      const button = row.get('button')
      expect(button.attributes('type')).toBe('button')
      expect(button.text()).toContain(`第 ${String(index + 1).padStart(2, '0')} 名`)
      expect(button.text()).toContain(items[index].toolTitle)
      expect(button.text().replace(/\s/g, '')).toContain(`${items[index].viewCount}次点击`)
      expect(row.findAll('button')).toHaveLength(1)
    }
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })

  it.each([0, 1])('点击 status=%i 的工具仍将状态、备注和来源交给统一门禁', async (status) => {
    const item = rankingItem(1, { status, remark: status === 0 ? '维护中，请稍后重试' : '会员工具说明' })
    rankingMocks.getToolRankingList.mockResolvedValue(rankingResult([item]))
    const wrapper = mountBoard()
    await flushPromises()
    await wrapper.get('ol li button').trigger('click')

    expect(rankingMocks.openToolEntry).toHaveBeenCalledExactlyOnceWith({
      title: item.toolTitle,
      url: item.toolUrl,
      toolKey: item.toolKey,
      status,
      remark: item.remark
    }, { target: 'current', action: 'open', source: 'tool-ranking' })
  })

  it('成功返回空数据时展示空态，不留下榜单或重试入口', async () => {
    rankingMocks.getToolRankingList.mockResolvedValue(rankingResult([]))
    const wrapper = mountBoard({ emptyText: '本周还没有点击记录' })
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toBe('本周还没有点击记录')
    expect(wrapper.find('ol').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })

  it('加载失败后可重试，重试期间显示加载状态，成功后恢复真实榜单', async () => {
    const retry = pendingRanking()
    rankingMocks.getToolRankingList
      .mockRejectedValueOnce(new Error('服务暂时不可用'))
      .mockReturnValueOnce(retry.promise)
    const wrapper = mountBoard({ errorText: '暂时无法读取热榜' })
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toContain('暂时无法读取热榜')
    expect(wrapper.get('[role="status"] button').text()).toBe('重试')

    await wrapper.get('[role="status"] button').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('工具热榜加载中...')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    retry.resolve(rankingResult([rankingItem(1)]))
    await flushPromises()

    expect(rankingMocks.getToolRankingList).toHaveBeenCalledTimes(2)
    expect(wrapper.get('ol').text()).toContain('测试工具1')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('暂时无法读取热榜')
    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(console.error).toHaveBeenCalledTimes(1)
  })

  it('切换周期等待新请求时隐藏旧榜单，不能在日榜标题下展示周榜结果', async () => {
    const nextPeriod = pendingRanking()
    rankingMocks.getToolRankingList
      .mockResolvedValueOnce(rankingResult([rankingItem(1, { toolTitle: '周榜旧工具' })]))
      .mockReturnValueOnce(nextPeriod.promise)
    const wrapper = mountBoard()
    await flushPromises()
    expect(wrapper.get('ol').text()).toContain('周榜旧工具')

    await wrapper.setProps({ period: 'day' })
    expect(rankingMocks.getToolRankingList).toHaveBeenLastCalledWith({ period: 'day', limit: 8, sortBy: 'view' })
    expect(wrapper.text()).toContain('日榜')
    expect(wrapper.text()).not.toContain('周榜旧工具')
    expect(wrapper.find('ol').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toBe('工具热榜加载中...')
    expect(wrapper.attributes('aria-busy')).toBe('true')

    nextPeriod.resolve(rankingResult([rankingItem(2, { toolTitle: '日榜新工具' })], 'day'))
    await flushPromises()
    expect(wrapper.get('ol').text()).toContain('日榜新工具')
    expect(wrapper.text()).not.toContain('周榜旧工具')
    expect(wrapper.attributes('aria-busy')).toBe('false')
  })

  it.each(['success', 'error'] as const)('旧请求最后以 %s 结束时，不覆盖新周期结果或触发错误提示', async (outcome) => {
    const oldRequest = pendingRanking()
    const newRequest = pendingRanking()
    rankingMocks.getToolRankingList
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise)
    const wrapper = mountBoard()
    await wrapper.setProps({ period: 'month' })
    newRequest.resolve(rankingResult([rankingItem(2, { toolTitle: '月榜新工具' })], 'month'))
    await flushPromises()

    if (outcome === 'success') {
      oldRequest.resolve(rankingResult([rankingItem(1, { toolTitle: '周榜旧工具' })]))
    } else {
      oldRequest.reject(new Error('旧请求超时'))
    }
    await flushPromises()

    expect(wrapper.get('ol').findAll('li')).toHaveLength(1)
    expect(wrapper.get('ol').text()).toContain('月榜新工具')
    expect(wrapper.text()).not.toContain('周榜旧工具')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(console.error).not.toHaveBeenCalled()
  })

  it('旧请求先结束时不能提前清除仍在等待的新周期加载状态', async () => {
    const oldRequest = pendingRanking()
    const newRequest = pendingRanking()
    rankingMocks.getToolRankingList
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise)
    const wrapper = mountBoard()
    await wrapper.setProps({ period: 'day' })
    oldRequest.resolve(rankingResult([rankingItem(1)]))
    await flushPromises()

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('ol').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toBe('工具热榜加载中...')
    newRequest.resolve(rankingResult([rankingItem(2)], 'day'))
    await flushPromises()
    expect(wrapper.attributes('aria-busy')).toBe('false')
    expect(wrapper.get('ol').text()).toContain('测试工具2')
    expect(wrapper.get('ol').text()).not.toContain('测试工具1')
  })

  it('紧凑侧栏在请求中和失败后保留可点击的兜底工具及执行统计', async () => {
    const request = pendingRanking()
    const fallbackTools: Tool[] = [{
      id: 1, title: '备用工具', logo: '', desc: '兜底推荐', url: '/tools/fallback', status: 0, remark: '暂停开放'
    }]
    const fallback = rankingItem(1, {
      toolTitle: '备用工具', toolUrl: '/tools/fallback', status: 0, remark: '暂停开放', startCount: 8, successCount: 6
    })
    rankingMocks.buildFallbackToolRankingItems.mockReturnValue([fallback])
    rankingMocks.getToolRankingList.mockReturnValue(request.promise)
    const wrapper = mountBoard({ flat: false, compact: true, fallbackTools, useFallbackOnError: true })
    await flushPromises()

    expect(wrapper.get('ol').text()).toContain('备用工具')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    request.reject(new Error('榜单服务不可用'))
    await flushPromises()

    expect(rankingMocks.buildFallbackToolRankingItems).toHaveBeenLastCalledWith(fallbackTools)
    expect(wrapper.get('ol').findAll('li')).toHaveLength(1)
    expect(wrapper.get('ol').text()).toContain('开始 8 · 成功 6')
    expect(wrapper.find('[role="status"]').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBe('false')
    await wrapper.get('ol button').trigger('click')
    expect(rankingMocks.openToolEntry).toHaveBeenCalledWith({
      title: '备用工具', url: '/tools/fallback', toolKey: fallback.toolKey, status: 0, remark: '暂停开放'
    }, { target: 'current', action: 'open', source: 'tool-ranking' })
  })

  it('真实榜单优先于兜底，去重补足后仍遵守展示数量且连续编号', async () => {
    rankingMocks.getToolRankingList.mockResolvedValue(rankingResult([rankingItem(1)]))
    rankingMocks.buildFallbackToolRankingItems.mockReturnValue([
      rankingItem(1, { toolKey: ' RANKING-1 ', toolTitle: '不应显示的重复推荐' }),
      rankingItem(2),
      rankingItem(3),
      rankingItem(4)
    ])
    const wrapper = mountBoard({ limit: 3 })
    await flushPromises()

    const rows = wrapper.get('ol').findAll('li')
    expect(rows).toHaveLength(3)
    expect(rows.map(row => row.text().match(/测试工具\d/)?.[0])).toEqual(['测试工具1', '测试工具2', '测试工具3'])
    expect(rows.map(row => row.text().match(/第 (\d+) 名/)?.[1])).toEqual(['01', '02', '03'])
    expect(wrapper.text()).not.toContain('不应显示的重复推荐')
    expect(wrapper.text()).not.toContain('测试工具4')
  })
})
