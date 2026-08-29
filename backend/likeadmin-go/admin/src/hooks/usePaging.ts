import { reactive, toRaw } from 'vue'

// 分页钩子函数
interface Options {
    page?: number
    size?: number
    fetchFun: (_arg: any) => Promise<any>
    params?: Record<any, any>
    firstLoading?: boolean
}

export function usePaging(options: Options) {
    const { page = 1, size = 15, fetchFun, params = {}, firstLoading = false } = options
    // 记录分页初始参数
    const paramsInit: Record<any, any> = Object.assign({}, toRaw(params))
    // 分页数据
    const pager = reactive({
        page,
        size,
        loading: firstLoading,
        count: 0,
        lists: [] as any[]
    })
    // 请求序号用于丢弃较早返回的搜索结果，避免快速连续查询时旧数据覆盖新数据。
    let requestSerial = 0

    /**
     * 函数说明：清理列表查询参数中的首尾空格，统一后台各列表搜索行为。
     */
    const normalizeRequestParams = () =>
        Object.keys(params).reduce<Record<string, any>>((result, key) => {
            const value = params[key]
            result[key] = typeof value === 'string' ? value.trim() : value
            return result
        }, {})

    /**
     * 函数说明：兼容后端不同分页字段命名，统一提取列表数据数组。
     */
    const normalizeListData = (res: any): any[] => {
        const listValue = res?.lists ?? res?.list ?? res?.rows ?? res?.items ?? []
        if (Array.isArray(listValue)) {
            return listValue
        }
        if (listValue && typeof listValue === 'object') {
            return Object.values(listValue)
        }
        return []
    }

    /**
     * 函数说明：兼容后端 count/total/totalCount 字段差异，统一提取总数。
     */
    const normalizeCount = (res: any): number => {
        const rawCount = res?.count ?? res?.total ?? res?.totalCount ?? 0
        const count = Number(rawCount)
        return Number.isFinite(count) ? count : 0
    }

    // 请求分页接口
    const getLists = () => {
        const currentRequestSerial = ++requestSerial
        pager.loading = true
        return fetchFun({
            pageNo: pager.page,
            pageSize: pager.size,
            ...normalizeRequestParams()
        })
            .then((res: any) => {
                if (currentRequestSerial !== requestSerial) {
                    return res
                }
                pager.count = normalizeCount(res)
                pager.lists = normalizeListData(res)
                return Promise.resolve(res)
            })
            .catch((err: any) => {
                // 已被更新请求取代的失败结果不再向页面冒泡，避免快速搜索时出现误报。
                if (currentRequestSerial !== requestSerial) {
                    return undefined
                }
                return Promise.reject(err)
            })
            .finally(() => {
                if (currentRequestSerial === requestSerial) {
                    pager.loading = false
                }
            })
    }
    // 重置为第一页
    const resetPage = () => {
        pager.page = 1
        return getLists()
    }
    // 重置参数
    const resetParams = () => {
        Object.keys(paramsInit).forEach((item) => {
            params[item] = paramsInit[item]
        })
        return getLists()
    }
    return {
        pager,
        getLists,
        resetParams,
        resetPage
    }
}
