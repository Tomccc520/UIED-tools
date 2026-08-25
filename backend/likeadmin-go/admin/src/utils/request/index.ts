import { merge } from 'lodash'
import configs from '@/config'
import { Axios } from './axios'
import { ContentTypeEnum, RequestCodeEnum, RequestMethodsEnum } from '@/enums/requestEnums'
import type { AxiosHooks } from './type'
import { clearAuthInfo, getToken } from '../auth'
import feedback from '../feedback'
import NProgress from 'nprogress'
import { AxiosError, type AxiosRequestConfig } from 'axios'
import router from '@/router'
import { PageEnum } from '@/enums/pageEnum'

/**
 * 函数说明：统一将网络异常转换为可读文案，避免浏览器直接显示 Network Error 影响排查。
 */
const resolveRequestErrorMessage = (error: AxiosError): string => {
    const originMessage = String(error?.message || '').trim()
    if (error.code === AxiosError.ERR_NETWORK || originMessage.includes('Network Error')) {
        const target = String(configs.baseUrl || '').replace(/\/$/, '')
        return target
            ? `后台接口不可达，请检查 API 服务与反向代理配置（${target}）`
            : '后台接口不可达，请检查 API 服务与反向代理配置'
    }
    return originMessage || '请求失败，请稍后重试'
}

interface BusinessRequestError extends Error {
    code: number
    data: unknown
    notified: boolean
}

/**
 * 函数说明：将后端业务错误转为保留错误码和文案的 Error，便于页面展示准确反馈。
 */
const createBusinessRequestError = (
    code: number,
    msg: string,
    data: unknown
): BusinessRequestError => {
    const error = new Error(
        String(msg || '').trim() || '请求失败，请稍后重试'
    ) as BusinessRequestError
    error.name = 'BusinessRequestError'
    error.code = code
    error.data = data
    error.notified = true
    return error
}

// 处理axios的钩子函数
const axiosHooks: AxiosHooks = {
    requestInterceptorsHook(config) {
        NProgress.start()
        const { withToken, isParamsToData } = config.requestOptions
        const params = config.params || {}
        const headers = config.headers || {}

        // 添加token
        if (withToken) {
            const token = getToken()
            headers.token = token
        }
        // POST请求下如果无data，则将params视为data
        if (
            isParamsToData &&
            !Reflect.has(config, 'data') &&
            config.method?.toUpperCase() === RequestMethodsEnum.POST
        ) {
            config.data = params
            config.params = {}
        }
        config.headers = headers
        return config
    },
    requestInterceptorsCatchHook(err) {
        NProgress.done()
        return err
    },
    async responseInterceptorsHook(response) {
        NProgress.done()
        const { isTransformResponse, isReturnDefaultResponse } = response.config.requestOptions

        //返回默认响应，当需要获取响应头及其他数据时可使用
        if (isReturnDefaultResponse) {
            return response
        }
        // 是否需要对数据进行处理
        if (!isTransformResponse) {
            return response.data
        }
        const { code, data, show, msg } = response.data
        switch (code) {
            case RequestCodeEnum.SUCCESS:
                if (show) {
                    msg && feedback.msgSuccess(msg)
                }
                return data

            case RequestCodeEnum.PARAMS_TYPE_ERROR:
            case RequestCodeEnum.PARAMS_VALID_ERROR:
            case RequestCodeEnum.REQUEST_METHOD_ERROR:
            case RequestCodeEnum.ASSERT_ARGUMENT_ERROR:
            case RequestCodeEnum.ASSERT_MYBATIS_ERROR:
            case RequestCodeEnum.LOGIN_ACCOUNT_ERROR:
            case RequestCodeEnum.LOGIN_DISABLE_ERROR:
            case RequestCodeEnum.LICENSE_INVALID:
            case RequestCodeEnum.NO_PERMISSTION:
            case RequestCodeEnum.FAILED:
            case RequestCodeEnum.SYSTEM_ERROR:
                msg && feedback.msgError(msg)
                return Promise.reject(createBusinessRequestError(code, msg, data))

            case RequestCodeEnum.TOKEN_INVALID:
            case RequestCodeEnum.TOKEN_EMPTY:
                clearAuthInfo()
                router.push(PageEnum.LOGIN)
                return Promise.reject()

            default:
                return data
        }
    },
    responseInterceptorsCatchHook(error) {
        NProgress.done()
        const businessError = error as Partial<BusinessRequestError>
        if (businessError.notified) {
            return error
        }
        /**
         * 函数说明：请求取消属于正常中断场景（如路由切换），这里直接吞掉，避免浏览器出现未处理异常。
         */
        if (error.code === AxiosError.ERR_CANCELED) {
            return error
        }
        feedback.msgError(resolveRequestErrorMessage(error))
        return error
    }
}

const defaultOptions: AxiosRequestConfig = {
    timeout: configs.timeout,
    // 基础接口地址
    baseURL: configs.baseUrl,
    headers: { 'Content-Type': ContentTypeEnum.JSON, version: configs.version },

    // 处理 axios的钩子函数
    axiosHooks: axiosHooks,
    // 每个接口可以单独配置
    requestOptions: {
        // 是否将params视为data参数，仅限post请求
        isParamsToData: true,
        //是否返回默认的响应
        isReturnDefaultResponse: false,
        // 需要对返回数据进行处理
        isTransformResponse: true,
        // 接口拼接地址
        urlPrefix: configs.urlPrefix,
        // 忽略重复请求
        ignoreCancelToken: false,
        // 是否携带token
        withToken: true,
        // 开启请求超时重新发起请求请求机制
        isOpenRetry: true,
        // 重新请求次数
        retryCount: 2
    }
}

function createAxios(opt?: Partial<AxiosRequestConfig>) {
    return new Axios(
        // 深度合并
        merge(defaultOptions, opt || {})
    )
}
const request = createAxios()
export default request
