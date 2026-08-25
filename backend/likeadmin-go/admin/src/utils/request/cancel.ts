import axios, { type AxiosRequestConfig, type Canceler } from 'axios'

const cancelerMap = new Map<string, Canceler>()

/**
 * 函数说明：对对象键做稳定排序，确保同一请求参数生成一致签名。
 */
const sortObject = (value: any): any => {
    if (Array.isArray(value)) {
        return value.map(sortObject)
    }
    if (value && typeof value === 'object') {
        return Object.keys(value)
            .sort()
            .reduce((acc: Record<string, any>, key) => {
                acc[key] = sortObject(value[key])
                return acc
            }, {})
    }
    return value
}

/**
 * 函数说明：安全序列化请求参数，避免循环引用导致中断。
 */
const serializeValue = (value: unknown): string => {
    if (value === undefined || value === null) {
        return ''
    }
    if (typeof value === 'string') {
        return value
    }
    try {
        return JSON.stringify(sortObject(value))
    } catch (_error) {
        return String(value)
    }
}

/**
 * 函数说明：生成请求唯一键（method + url + params + data），避免不同参数请求互相取消。
 */
const getRequestKey = (config: AxiosRequestConfig): string => {
    const method = (config.method || 'GET').toUpperCase()
    const url = config.url || ''
    const params = serializeValue(config.params)
    const data = serializeValue(config.data)
    return [method, url, params, data].join('&')
}

export class AxiosCancel {
    private static instance?: AxiosCancel

    static createInstance() {
        return this.instance ?? (this.instance = new AxiosCancel())
    }
    add(config: AxiosRequestConfig) {
        const requestKey = getRequestKey(config)
        this.remove(config)
        config.cancelToken = new axios.CancelToken((cancel) => {
            if (!cancelerMap.has(requestKey)) {
                cancelerMap.set(requestKey, cancel)
            }
        })
    }
    remove(configOrKey: AxiosRequestConfig | string) {
        const requestKey =
            typeof configOrKey === 'string' ? configOrKey : getRequestKey(configOrKey)
        if (cancelerMap.has(requestKey)) {
            const cancel = cancelerMap.get(requestKey)
            cancel && cancel(requestKey)
            cancelerMap.delete(requestKey)
        }
    }
}

const axiosCancel = AxiosCancel.createInstance()

export default axiosCancel
