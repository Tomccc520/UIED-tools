/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import { reactive, toRaw } from 'vue'

interface Options {
    page?: number
    size?: number
    fetchFun: (_arg: any) => Promise<any>
    params?: Record<any, any>
    firstLoading?: boolean
}

/** 提供共用分页状态；保留请求参数和拒绝契约，避免过期响应覆盖当前查询。 */
export function usePaging(options: Options) {
    const { page = 1, size = 15, fetchFun, params = {}, firstLoading = false } = options
    const paramsInit: Record<any, any> = Object.assign({}, toRaw(params))
    const pager = reactive({
        page,
        size,
        loading: firstLoading,
        loaded: false,
        error: '',
        count: 0,
        lists: [] as any[]
    })
    let requestSerial = 0

    /** 清理查询字符串首尾空格，保持其它筛选值和参数名不变。 */
    const normalizeRequestParams = () =>
        Object.keys(params).reduce<Record<string, any>>((result, key) => {
            const value = params[key]
            result[key] = typeof value === 'string' ? value.trim() : value
            return result
        }, {})

    /** 兼容既有分页数据字段和字典式列表，不改变调用方的数据格式。 */
    const normalizeListData = (res: any): any[] => {
        const listValue = res?.lists ?? res?.list ?? res?.rows ?? res?.items ?? []
        if (Array.isArray(listValue)) return listValue
        if (listValue && typeof listValue === 'object') return Object.values(listValue)
        return []
    }

    /** 兼容总数字段，并把无效或负数总数收口为零。 */
    const normalizeCount = (res: any): number => {
        const count = Number(res?.count ?? res?.total ?? res?.totalCount ?? 0)
        return Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0
    }

    /** 读取一个查询快照；空的超出页最多补查一次，失败时保留最后成功的数据。 */
    const getLists = async (): Promise<any> => {
        const currentRequestSerial = ++requestSerial
        const requestParams = { pageNo: pager.page, pageSize: pager.size, ...normalizeRequestParams() }
        pager.loading = true
        pager.error = ''
        try {
            let res = await fetchFun(requestParams)
            if (currentRequestSerial !== requestSerial) return res
            let count = normalizeCount(res)
            let lists = normalizeListData(res)
            let correctedPage: number | undefined
            const pageSize = Math.max(1, Number(requestParams.pageSize) || 15)
            const maxPage = Math.max(1, Math.ceil(count / pageSize))
            if (lists.length === 0 && Number(requestParams.pageNo) > maxPage) {
                correctedPage = maxPage
                if (count > 0) {
                    res = await fetchFun({ ...requestParams, pageNo: correctedPage })
                    if (currentRequestSerial !== requestSerial) return res
                    count = normalizeCount(res)
                    lists = normalizeListData(res)
                    correctedPage = Math.min(correctedPage, Math.max(1, Math.ceil(count / pageSize)))
                }
            }
            pager.count = count
            pager.lists = lists
            if (correctedPage !== undefined) pager.page = correctedPage
            pager.loaded = true
            return res
        } catch (error) {
            // 被新查询替代的失败不再冒泡；活跃失败继续拒绝供原有调用方处理。
            if (currentRequestSerial !== requestSerial) return undefined
            pager.error = '列表加载失败，请重试'
            throw error
        } finally {
            if (currentRequestSerial === requestSerial) pager.loading = false
        }
    }

    /** 查询条件变化时回第一页，再按当前条件重新读取。 */
    const resetPage = () => {
        pager.page = 1
        return getLists()
    }

    /** 恢复初始筛选并回第一页，避免重置后仍停留在不存在的高页码。 */
    const resetParams = () => {
        Object.keys(paramsInit).forEach(key => { params[key] = paramsInit[key] })
        return resetPage()
    }
    return { pager, getLists, resetParams, resetPage }
}
