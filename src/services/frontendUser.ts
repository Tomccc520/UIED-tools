/**
 * @file frontendUser.ts
 * @description 前台用户中心服务，负责前后端登录态同步与 QQ 邮箱绑定持久化
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-28
 */

export interface FrontendUserProfile {
  uid: string
  nickname: string
  qqEmail: string
  avatar: string
  pointsBalance: number
  pointsDailyGiftPoints: number
  pointsToolConsumePoints: number
  pointsDailyGrantDate: string
  memberLevel: string
  memberExpireTime: number
  memberActive: boolean
  memberDisplayName: string
  createdAt: number
  updatedAt: number
}

interface FrontendUserApiResponse<T> {
  code?: number
  msg?: string
  data?: T
}

interface FrontendUserApiError extends Error {
  code?: number
}

interface FrontendUserProfileSavePayload {
  nickname: string
  qqEmail: string
}

export interface FrontendUserPointsConsumeResult {
  toolKey: string
  action: string
  consumePoints: number
  remainPoints: number
  dailyGiftApplied: boolean
  profile: FrontendUserProfile
}

export interface FrontendUserMemberPlan {
  code: string
  name: string
  price: number
  memberDays: number
  giftPoints: number
  sort: number
  status: number
  badge?: string
}

export interface FrontendUserPointsPack {
  code: string
  name: string
  price: number
  points: number
  giftPoints: number
  sort: number
  status: number
}

export interface FrontendUserCommerceProducts {
  memberEnabled: boolean
  memberPlans: FrontendUserMemberPlan[]
  pointsPacks: FrontendUserPointsPack[]
  memberRightsIntro: string
  dailyGiftPoints: number
  toolConsumePoints: number
  paymentChannels: FrontendUserPaymentChannel[]
}

export interface FrontendUserPaymentChannel {
  code: string
  name: string
  description: string
  payUrl: string
  configured: boolean
}

export interface FrontendUserPaymentPayload {
  mode: string
  modeText: string
  description: string
  configured: boolean
  orderSn: string
  callbackApi: string
  payUrl: string
  tradeNo?: string
}

export interface FrontendUserOrderItem {
  id: number
  orderSn: string
  productType: string
  productTypeText: string
  productCode: string
  productName: string
  amount: number
  currency: string
  status: number
  statusText: string
  payChannel: string
  tradeNo: string
  callbackStatus: number
  callbackStatusText: string
  callbackTime: number
  callbackError: string
  memberDays: number
  points: number
  giftPoints: number
  deliveryStatus: number
  deliveryStatusText: string
  licenseBoundDomain: string
  licenseKeyMasked: string
  downloadUrl: string
  deliveryNote: string
  deliveredTime: number
  remark: string
  paidTime: number
  createdAt: number
  payment?: FrontendUserPaymentPayload | null
}

export interface FrontendUserPointsLogItem {
  id: number
  changeType: string
  changeTypeText: string
  changeAmount: number
  balanceAfter: number
  toolKey: string
  action: string
  orderSn: string
  remark: string
  createdAt: number
}

export interface FrontendUserLoginPromptPayload {
  reason?: string
  redirectPath?: string
  source?: string
  timestamp?: number
}

const FRONTEND_USER_TOKEN_KEY = 'uiedtool.frontend.user.token'
const FRONTEND_USER_PROFILE_KEY = 'uiedtool.frontend.user.profile'
export const FRONTEND_USER_AUTH_EVENT = 'uiedtool:frontend-user-auth-changed'
export const FRONTEND_USER_LOGIN_PROMPT_EVENT = 'uiedtool:frontend-user-login-prompt'

const FRONTEND_USER_LOGIN_ENDPOINT = '/api/common/frontend-user/login'
const FRONTEND_USER_PROFILE_ENDPOINT = '/api/common/frontend-user/profile'
const FRONTEND_USER_PROFILE_SAVE_ENDPOINT = '/api/common/frontend-user/profile/save'
const FRONTEND_USER_POINTS_CONSUME_ENDPOINT = '/api/common/frontend-user/points/consume'
const FRONTEND_USER_PRODUCTS_ENDPOINT = '/api/common/frontend-user/products'
const FRONTEND_USER_PURCHASE_ENDPOINT = '/api/common/frontend-user/purchase'
const FRONTEND_USER_PURCHASE_PAY_ENDPOINT = '/api/common/frontend-user/purchase/pay'
const FRONTEND_USER_PURCHASE_CALLBACK_ENDPOINT = '/api/common/frontend-user/purchase/callback'
const FRONTEND_USER_PURCHASE_CLOSE_ENDPOINT = '/api/common/frontend-user/purchase/close'
const FRONTEND_USER_ORDERS_ENDPOINT = '/api/common/frontend-user/orders'
const FRONTEND_USER_POINTS_LOGS_ENDPOINT = '/api/common/frontend-user/points/logs'
const FRONTEND_USER_LOGOUT_ENDPOINT = '/api/common/frontend-user/logout'
const FRONTEND_USER_API_TIMEOUT_MS = 12000

/**
 * 函数说明：标准化支付引导数据，统一解析 payUrl/tradeNo 等字段，避免页面分散解析逻辑。
 */
const normalizePaymentPayload = (payload: unknown): FrontendUserPaymentPayload | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  const source = payload as Record<string, unknown>
  return {
    mode: String(source.mode || '').trim(),
    modeText: String(source.modeText || '').trim(),
    description: String(source.description || '').trim(),
    configured: normalizeBooleanFlag(source.configured),
    orderSn: String(source.orderSn || '').trim(),
    callbackApi: String(source.callbackApi || '').trim(),
    payUrl: String(source.payUrl || '').trim(),
    tradeNo: String(source.tradeNo || '').trim() || undefined
  }
}

/**
 * 函数说明：将后端或本地缓存中的布尔标记统一转换为 boolean。
 */
const normalizeBooleanFlag = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === '1' || normalized === 'true'
  }
  return false
}

/**
 * 函数说明：校验是否为合法 QQ 邮箱地址。
 */
export const isValidQqEmail = (email: string): boolean => {
  return /^[1-9]\d{4,10}@qq\.com$/i.test(String(email || '').trim())
}

/**
 * 函数说明：读取本地前端用户 token，用于判断是否登录。
 */
export const getFrontendUserToken = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }
  return String(window.localStorage.getItem(FRONTEND_USER_TOKEN_KEY) || '').trim()
}

/**
 * 函数说明：判断前端用户是否已登录。
 */
export const isFrontendUserLoggedIn = (): boolean => {
  return Boolean(getFrontendUserToken())
}

/**
 * 函数说明：读取前端用户资料，异常数据会自动清空并返回 null。
 */
export const getFrontendUserProfile = (): FrontendUserProfile | null => {
  if (typeof window === 'undefined') {
    return null
  }
  const rawText = window.localStorage.getItem(FRONTEND_USER_PROFILE_KEY)
  if (!rawText) {
    return null
  }
  try {
    const parsed = JSON.parse(rawText) as Partial<FrontendUserProfile>
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    const profile: FrontendUserProfile = {
      uid: String(parsed.uid || '').trim(),
      nickname: String(parsed.nickname || '').trim() || '用户',
      qqEmail: String(parsed.qqEmail || '').trim(),
      avatar: String(parsed.avatar || '').trim(),
      pointsBalance: Number(parsed.pointsBalance || 0),
      pointsDailyGiftPoints: Number(parsed.pointsDailyGiftPoints || 50),
      pointsToolConsumePoints: Number(parsed.pointsToolConsumePoints || 0),
      pointsDailyGrantDate: String(parsed.pointsDailyGrantDate || '').trim(),
      memberLevel: String(parsed.memberLevel || 'free').trim() || 'free',
      memberExpireTime: Number(parsed.memberExpireTime || 0),
      memberActive: normalizeBooleanFlag(parsed.memberActive),
      memberDisplayName: String(parsed.memberDisplayName || '普通用户').trim() || '普通用户',
      createdAt: Number(parsed.createdAt || Date.now()),
      updatedAt: Number(parsed.updatedAt || Date.now())
    }
    if (!profile.uid) {
      return null
    }
    return profile
  } catch {
    window.localStorage.removeItem(FRONTEND_USER_PROFILE_KEY)
    return null
  }
}

/**
 * 函数说明：触发登录态变更事件，通知头部等组件刷新用户入口。
 */
const dispatchFrontendUserAuthChanged = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new CustomEvent(FRONTEND_USER_AUTH_EVENT))
}

/**
 * 函数说明：派发“前端用户登录弹窗”事件，用于工具动作触发时按需拉起登录。
 */
export const dispatchFrontendUserLoginPrompt = (payload: FrontendUserLoginPromptPayload = {}) => {
  if (typeof window === 'undefined') {
    return
  }
  const eventPayload: FrontendUserLoginPromptPayload = {
    reason: String(payload.reason || '').trim(),
    redirectPath: String(payload.redirectPath || '').trim(),
    source: String(payload.source || '').trim(),
    timestamp: Number(payload.timestamp || Date.now())
  }
  window.dispatchEvent(new CustomEvent(FRONTEND_USER_LOGIN_PROMPT_EVENT, { detail: eventPayload }))
}

/**
 * 函数说明：本地持久化前端用户资料并返回标准化对象。
 */
const saveFrontendUserProfileToLocal = (profile: FrontendUserProfile): FrontendUserProfile => {
  const normalizedProfile: FrontendUserProfile = {
    ...profile,
    uid: String(profile.uid || '').trim(),
    nickname: String(profile.nickname || '').trim() || '用户',
    qqEmail: String(profile.qqEmail || '').trim(),
    avatar: String(profile.avatar || '').trim(),
    pointsBalance: Math.max(0, Number(profile.pointsBalance || 0)),
    pointsDailyGiftPoints: Math.max(0, Number(profile.pointsDailyGiftPoints || 50)),
    pointsToolConsumePoints: Math.max(0, Number(profile.pointsToolConsumePoints || 0)),
    pointsDailyGrantDate: String(profile.pointsDailyGrantDate || '').trim(),
    memberLevel: String(profile.memberLevel || 'free').trim() || 'free',
    memberExpireTime: Math.max(0, Number(profile.memberExpireTime || 0)),
    memberActive: normalizeBooleanFlag(profile.memberActive),
    memberDisplayName: String(profile.memberDisplayName || '普通用户').trim() || '普通用户',
    createdAt: Number(profile.createdAt || Date.now()),
    updatedAt: Number(profile.updatedAt || Date.now())
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FRONTEND_USER_PROFILE_KEY, JSON.stringify(normalizedProfile))
  }
  return normalizedProfile
}

/**
 * 函数说明：兼容旧调用方，保留“保存本地资料”导出方法。
 */
export const saveFrontendUserProfile = (profile: FrontendUserProfile): FrontendUserProfile => {
  const nextProfile = saveFrontendUserProfileToLocal(profile)
  dispatchFrontendUserAuthChanged()
  return nextProfile
}

/**
 * 函数说明：清理本地登录态缓存（token + profile）。
 */
const clearFrontendUserLocalAuth = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.removeItem(FRONTEND_USER_TOKEN_KEY)
  window.localStorage.removeItem(FRONTEND_USER_PROFILE_KEY)
}

/**
 * 函数说明：将接口返回资料对象清洗为前端统一结构。
 */
const normalizeFrontendUserProfile = (payload: unknown): FrontendUserProfile => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const createdAtRaw = Number(record.createdAt || Date.now())
  const updatedAtRaw = Number(record.updatedAt || Date.now())
  const createdAt = createdAtRaw > 0 && createdAtRaw < 1e12 ? createdAtRaw * 1000 : createdAtRaw
  const updatedAt = updatedAtRaw > 0 && updatedAtRaw < 1e12 ? updatedAtRaw * 1000 : updatedAtRaw

  return {
    uid: String(record.uid || '').trim(),
    nickname: String(record.nickname || '').trim() || '用户',
    qqEmail: String(record.qqEmail || '').trim(),
    avatar: String(record.avatar || '').trim(),
    pointsBalance: Math.max(0, Number(record.pointsBalance || 0)),
    pointsDailyGiftPoints: Math.max(0, Number(record.dailyGiftPoints || 50)),
    pointsToolConsumePoints: Math.max(0, Number(record.toolConsumePoints || 0)),
    pointsDailyGrantDate: String(record.pointsDailyGrantDate || '').trim(),
    memberLevel: String(record.memberLevel || 'free').trim() || 'free',
    memberExpireTime: Math.max(0, Number(record.memberExpireTime || 0)),
    memberActive: normalizeBooleanFlag(record.memberActive),
    memberDisplayName: String(record.memberDisplayName || '普通用户').trim() || '普通用户',
    createdAt,
    updatedAt
  }
}

/**
 * 函数说明：将接口返回的套餐与积分包配置规范化为前端可直接渲染结构。
 */
const normalizeCommerceProducts = (payload: unknown): FrontendUserCommerceProducts => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const memberPlansRaw = Array.isArray(record.memberPlans) ? (record.memberPlans as Record<string, unknown>[]) : []
  const pointsPacksRaw = Array.isArray(record.pointsPacks) ? (record.pointsPacks as Record<string, unknown>[]) : []
  const paymentChannelsRaw = Array.isArray(record.paymentChannels) ? (record.paymentChannels as Record<string, unknown>[]) : []
  return {
    memberEnabled: normalizeBooleanFlag(record.memberEnabled),
    memberPlans: memberPlansRaw.map((item, index) => ({
      code: String(item.code || '').trim(),
      name: String(item.name || '').trim(),
      price: Math.max(0, Number(item.price || 0)),
      memberDays: Math.max(1, Number(item.memberDays || 1)),
      giftPoints: Math.max(0, Number(item.giftPoints || 0)),
      sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
      status: Number(item.status ?? 1) === 0 ? 0 : 1,
      badge: String(item.badge || '').trim()
    })).filter((item) => item.code && item.name && item.status === 1),
    pointsPacks: pointsPacksRaw.map((item, index) => ({
      code: String(item.code || '').trim(),
      name: String(item.name || '').trim(),
      price: Math.max(0, Number(item.price || 0)),
      points: Math.max(1, Number(item.points || 1)),
      giftPoints: Math.max(0, Number(item.giftPoints || 0)),
      sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
      status: Number(item.status ?? 1) === 0 ? 0 : 1
    })).filter((item) => item.code && item.name && item.status === 1),
    memberRightsIntro: String(record.memberRightsIntro || '').trim(),
    dailyGiftPoints: Math.max(0, Number(record.dailyGiftPoints || 0)),
    toolConsumePoints: Math.max(0, Number(record.toolConsumePoints || 0)),
    paymentChannels: paymentChannelsRaw.map((item) => ({
      code: String(item.code || '').trim(),
      name: String(item.name || '').trim(),
      description: String(item.description || '').trim(),
      payUrl: String(item.payUrl || '').trim(),
      configured: normalizeBooleanFlag(item.configured)
    })).filter((item) => item.code && item.name)
  }
}

/**
 * 函数说明：将订单状态编码映射为前端可读文案，兼容后端未返回 statusText 的场景。
 */
const resolveOrderStatusText = (status: number, fallbackText: unknown): string => {
  const text = String(fallbackText || '').trim()
  if (text) {
    return text
  }
  if (status === 1) {
    return '已支付'
  }
  if (status === 2) {
    return '已关闭'
  }
  return '待支付'
}

/**
 * 函数说明：将订单回调状态编码映射为前端可读文案，兼容后端未返回 callbackStatusText 的场景。
 */
const resolveOrderCallbackStatusText = (status: number, fallbackText: unknown): string => {
  const text = String(fallbackText || '').trim()
  if (text) {
    return text
  }
  if (status === 3) {
    return '支付处理中'
  }
  if (status === 1) {
    return '回调成功'
  }
  if (status === 2) {
    return '回调失败'
  }
  return '未回调'
}

/**
 * 函数说明：将订单交付状态编码映射为前端可读文案，兼容后端未返回 deliveryStatusText 的场景。
 */
const resolveOrderDeliveryStatusText = (status: number, fallbackText: unknown): string => {
  const text = String(fallbackText || '').trim()
  if (text) {
    return text
  }
  if (status === 1) {
    return '已交付'
  }
  if (status === 2) {
    return '待补充'
  }
  if (status === 3) {
    return '已失效'
  }
  return '未交付'
}

/**
 * 函数说明：将接口返回的购买记录转换为统一结构，兼容字段缺失场景。
 */
const normalizeFrontendUserOrders = (payload: unknown): FrontendUserOrderItem[] => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const lists = Array.isArray(record.lists) ? (record.lists as Record<string, unknown>[]) : []
  return lists.map((item) => {
    const status = Number(item.status || 0)
    return {
      id: Number(item.id || 0),
      orderSn: String(item.orderSn || '').trim(),
      productType: String(item.productType || '').trim(),
      productTypeText: String(item.productTypeText || '').trim(),
      productCode: String(item.productCode || '').trim(),
      productName: String(item.productName || '').trim(),
      amount: Math.max(0, Number(item.amount || 0)),
      currency: String(item.currency || 'CNY').trim() || 'CNY',
      status,
      statusText: resolveOrderStatusText(status, item.statusText),
      payChannel: String(item.payChannel || '').trim(),
      tradeNo: String(item.tradeNo || '').trim(),
      callbackStatus: Math.max(0, Number(item.callbackStatus || 0)),
      callbackStatusText: resolveOrderCallbackStatusText(Number(item.callbackStatus || 0), item.callbackStatusText),
      callbackTime: Math.max(0, Number(item.callbackTime || 0)),
      callbackError: String(item.callbackError || '').trim(),
      memberDays: Math.max(0, Number(item.memberDays || 0)),
      points: Math.max(0, Number(item.points || 0)),
      giftPoints: Math.max(0, Number(item.giftPoints || 0)),
      deliveryStatus: Math.max(0, Number(item.deliveryStatus || 0)),
      deliveryStatusText: resolveOrderDeliveryStatusText(Number(item.deliveryStatus || 0), item.deliveryStatusText),
      licenseBoundDomain: String(item.licenseBoundDomain || '').trim(),
      licenseKeyMasked: String(item.licenseKeyMasked || '').trim(),
      downloadUrl: String(item.downloadUrl || '').trim(),
      deliveryNote: String(item.deliveryNote || '').trim(),
      deliveredTime: Math.max(0, Number(item.deliveredTime || 0)),
      remark: String(item.remark || '').trim(),
      paidTime: Math.max(0, Number(item.paidTime || 0)),
      createdAt: Math.max(0, Number(item.createdAt || 0)),
      payment: normalizePaymentPayload(item.payment)
    }
  })
}

/**
 * 函数说明：将接口返回的积分流水转换为统一结构，便于用户中心直接渲染。
 */
const normalizeFrontendUserPointsLogs = (payload: unknown): FrontendUserPointsLogItem[] => {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {}
  const lists = Array.isArray(record.lists) ? (record.lists as Record<string, unknown>[]) : []
  return lists.map((item) => ({
    id: Number(item.id || 0),
    changeType: String(item.changeType || '').trim(),
    changeTypeText: String(item.changeTypeText || '').trim(),
    changeAmount: Number(item.changeAmount || 0),
    balanceAfter: Math.max(0, Number(item.balanceAfter || 0)),
    toolKey: String(item.toolKey || '').trim(),
    action: String(item.action || '').trim(),
    orderSn: String(item.orderSn || '').trim(),
    remark: String(item.remark || '').trim(),
    createdAt: Math.max(0, Number(item.createdAt || 0))
  }))
}

/**
 * 函数说明：构造统一 API 错误对象，便于上层识别 token 失效等业务错误。
 */
const buildFrontendUserApiError = (message: string, code?: number): FrontendUserApiError => {
  const error = new Error(message) as FrontendUserApiError
  if (typeof code === 'number') {
    error.code = code
  }
  return error
}

/**
 * 函数说明：解析后端通用响应结构（code/msg/data），非 200 时抛出业务错误。
 */
const parseFrontendUserApiResponse = <T>(payload: unknown): T => {
  const responsePayload = (payload || {}) as FrontendUserApiResponse<T>
  const code = Number(responsePayload.code || 0)
  if (code !== 200) {
    throw buildFrontendUserApiError(String(responsePayload.msg || '请求失败，请稍后重试'), code)
  }
  return (responsePayload.data || ({} as T)) as T
}

/**
 * 函数说明：请求前台用户中心接口，统一处理超时、错误与 frontend-token 头。
 */
const requestFrontendUserApi = async <T>(
  endpoint: string,
  init: RequestInit,
  frontendToken?: string
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), FRONTEND_USER_API_TIMEOUT_MS)
  try {
    const headers = new Headers(init.headers || {})
    headers.set('Content-Type', 'application/json')
    if (frontendToken) {
      headers.set('frontend-token', frontendToken)
    }

    const response = await fetch(endpoint, {
      ...init,
      headers,
      signal: controller.signal
    })

    if (!response.ok) {
      throw buildFrontendUserApiError(`请求失败（HTTP ${response.status}）`)
    }

    const payload = await response.json()
    return parseFrontendUserApiResponse<T>(payload)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw buildFrontendUserApiError('请求超时，请稍后重试')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

/**
 * 函数说明：执行登录并同步后端会话，返回最新用户资料。
 */
export const loginFrontendUser = async (nickname: string, password: string): Promise<FrontendUserProfile> => {
  const data = await requestFrontendUserApi<{ token?: string; profile?: unknown }>(FRONTEND_USER_LOGIN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ nickname: String(nickname || '').trim(), password: String(password || '').trim() })
  })

  const token = String(data.token || '').trim()
  if (!token) {
    throw buildFrontendUserApiError('登录失败：未返回有效 token')
  }

  const profile = normalizeFrontendUserProfile(data.profile)
  if (!profile.uid) {
    throw buildFrontendUserApiError('登录失败：未返回有效用户信息')
  }

  window.localStorage.setItem(FRONTEND_USER_TOKEN_KEY, token)
  saveFrontendUserProfileToLocal(profile)
  dispatchFrontendUserAuthChanged()
  return profile
}

/**
 * 函数说明：从后端读取个人中心资料并刷新本地缓存。
 */
export const syncFrontendUserProfile = async (): Promise<FrontendUserProfile | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }
  try {
    const data = await requestFrontendUserApi<unknown>(FRONTEND_USER_PROFILE_ENDPOINT, { method: 'GET' }, frontendToken)
    const profile = normalizeFrontendUserProfile(data)
    if (!profile.uid) {
      throw buildFrontendUserApiError('用户信息缺失，请重新登录')
    }
    saveFrontendUserProfileToLocal(profile)
    dispatchFrontendUserAuthChanged()
    return profile
  } catch (error) {
    const apiError = error as FrontendUserApiError
    if (apiError?.code === 333 || apiError?.code === 332) {
      clearFrontendUserLocalAuth()
      dispatchFrontendUserAuthChanged()
      return null
    }
    throw error
  }
}

/**
 * 函数说明：将昵称与 QQ 邮箱绑定信息保存到后端并回写本地缓存。
 */
export const saveFrontendUserProfileToServer = async (
  payload: FrontendUserProfileSavePayload
): Promise<FrontendUserProfile | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }

  const data = await requestFrontendUserApi<unknown>(
    FRONTEND_USER_PROFILE_SAVE_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify({
        nickname: String(payload.nickname || '').trim(),
        qqEmail: String(payload.qqEmail || '').trim()
      })
    },
    frontendToken
  )

  const profile = normalizeFrontendUserProfile(data)
  if (!profile.uid) {
    return null
  }
  saveFrontendUserProfileToLocal(profile)
  dispatchFrontendUserAuthChanged()
  return profile
}

/**
 * 函数说明：执行一次工具积分扣减，后端会自动处理每日赠送积分并返回最新资料。
 */
export const consumeFrontendUserPoints = async (
  toolKey: string,
  action = 'use'
): Promise<FrontendUserPointsConsumeResult | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }

  try {
    const data = await requestFrontendUserApi<{
      toolKey?: string
      action?: string
      consumePoints?: number
      remainPoints?: number
      dailyGiftApplied?: boolean
      profile?: unknown
    }>(
      FRONTEND_USER_POINTS_CONSUME_ENDPOINT,
      {
        method: 'POST',
        body: JSON.stringify({
          toolKey: String(toolKey || '').trim(),
          action: String(action || '').trim() || 'use'
        })
      },
      frontendToken
    )

    const profile = normalizeFrontendUserProfile(data.profile)
    if (!profile.uid) {
      return null
    }
    saveFrontendUserProfileToLocal(profile)
    dispatchFrontendUserAuthChanged()
    return {
      toolKey: String(data.toolKey || toolKey).trim(),
      action: String(data.action || action).trim(),
      consumePoints: Math.max(0, Number(data.consumePoints ?? profile.pointsToolConsumePoints ?? 0)),
      remainPoints: Math.max(0, Number(data.remainPoints ?? profile.pointsBalance ?? 0)),
      dailyGiftApplied: Boolean(data.dailyGiftApplied),
      profile
    }
  } catch (error) {
    const apiError = error as FrontendUserApiError
    if (apiError?.code === 333 || apiError?.code === 332) {
      clearFrontendUserLocalAuth()
      dispatchFrontendUserAuthChanged()
      return null
    }
    throw error
  }
}

/**
 * 函数说明：更新前端用户 QQ 邮箱绑定（后端持久化）。
 */
export const bindFrontendUserQqEmail = async (qqEmail: string): Promise<FrontendUserProfile | null> => {
  const profile = getFrontendUserProfile()
  if (!profile) {
    return null
  }
  return saveFrontendUserProfileToServer({
    nickname: profile.nickname,
    qqEmail
  })
}

/**
 * 函数说明：更新前端用户昵称（后端持久化）。
 */
export const updateFrontendUserNickname = async (nickname: string): Promise<FrontendUserProfile | null> => {
  const profile = getFrontendUserProfile()
  if (!profile) {
    return null
  }
  return saveFrontendUserProfileToServer({
    nickname,
    qqEmail: profile.qqEmail
  })
}

/**
 * 函数说明：读取当前会员套餐与积分包配置，用于用户中心购买区展示。
 */
export const fetchFrontendUserCommerceProducts = async (): Promise<FrontendUserCommerceProducts> => {
  const data = await requestFrontendUserApi<unknown>(FRONTEND_USER_PRODUCTS_ENDPOINT, { method: 'GET' })
  return normalizeCommerceProducts(data)
}

/**
 * 函数说明：提交一次套餐/积分包购买请求（当前后端为 mock 即时到账流程）。
 */
export const purchaseFrontendUserProduct = async (
  productType: 'member_plan' | 'points_pack',
  productCode: string,
  payChannel = 'mock'
): Promise<{ order: FrontendUserOrderItem; profile: FrontendUserProfile; payment: FrontendUserPaymentPayload | null } | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }

  const data = await requestFrontendUserApi<{ order?: unknown; payment?: unknown }>(
    FRONTEND_USER_PURCHASE_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify({
        productType,
        productCode: String(productCode || '').trim(),
        payChannel: String(payChannel || '').trim() || 'mock'
      })
    },
    frontendToken
  )

  const orderList = normalizeFrontendUserOrders({ lists: [data.order || {}] })
  const normalizedPayment = normalizePaymentPayload(data.payment)
  let currentOrder = orderList[0] || {
    id: 0,
    orderSn: '',
    productType,
    productTypeText: productType === 'member_plan' ? '会员套餐' : '积分包',
    productCode: String(productCode || '').trim(),
    productName: '',
    amount: 0,
    currency: 'CNY',
    status: 0,
    statusText: '待支付',
    payChannel: String(payChannel || 'mock').trim() || 'mock',
    tradeNo: '',
    callbackStatus: 0,
    callbackStatusText: '未回调',
    callbackTime: 0,
    callbackError: '',
    memberDays: 0,
    points: 0,
    giftPoints: 0,
    deliveryStatus: 0,
    deliveryStatusText: '未交付',
    licenseBoundDomain: '',
    licenseKeyMasked: '',
    downloadUrl: '',
    deliveryNote: '',
    deliveredTime: 0,
    remark: '',
    paidTime: 0,
    createdAt: Date.now(),
    payment: normalizedPayment
  }
  if (!currentOrder.payment && normalizedPayment) {
    currentOrder.payment = normalizedPayment
  }

  // mock 支付链路：创建待支付订单后，立即走一次回调，模拟三方支付完成。
  if (currentOrder.orderSn && currentOrder.status === 0 && String(payChannel || '').trim().toLowerCase() === 'mock') {
    const callbackData = await requestFrontendUserApi<{ order?: unknown }>(
      FRONTEND_USER_PURCHASE_CALLBACK_ENDPOINT,
      {
        method: 'POST',
        body: JSON.stringify({
          orderSn: currentOrder.orderSn,
          payChannel: 'mock'
        })
      }
    )
    const callbackOrders = normalizeFrontendUserOrders({ lists: [callbackData.order || {}] })
    if (callbackOrders[0]) {
      currentOrder = callbackOrders[0]
    }
  }

  const latestProfile = await syncFrontendUserProfile()
  if (!latestProfile) {
    return null
  }
  return {
    order: currentOrder,
    profile: latestProfile,
    payment: normalizedPayment || currentOrder.payment || null
  }
}

/**
 * 函数说明：为待支付订单重新拉起支付，返回最新订单和支付参数（payUrl/tradeNo）。
 */
export const relaunchFrontendUserOrderPayment = async (
  orderSn: string,
  payChannel = ''
): Promise<{ order: FrontendUserOrderItem; payment: FrontendUserPaymentPayload | null } | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn) {
    return null
  }
  const data = await requestFrontendUserApi<{ order?: unknown; payment?: unknown }>(
    FRONTEND_USER_PURCHASE_PAY_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify({
        orderSn: targetOrderSn,
        payChannel: String(payChannel || '').trim()
      })
    },
    frontendToken
  )

  const orders = normalizeFrontendUserOrders({ lists: [data.order || {}] })
  const order = orders[0] || null
  if (!order) {
    return null
  }
  const payment = normalizePaymentPayload(data.payment) || order.payment || null
  if (payment && !order.payment) {
    order.payment = payment
  }
  return { order, payment }
}

/**
 * 函数说明：关闭当前登录用户的待支付订单。
 */
export const closeFrontendUserOrder = async (orderSn: string): Promise<FrontendUserOrderItem | null> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return null
  }
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn) {
    return null
  }
  const data = await requestFrontendUserApi<{ order?: unknown }>(
    FRONTEND_USER_PURCHASE_CLOSE_ENDPOINT,
    {
      method: 'POST',
      body: JSON.stringify({ orderSn: targetOrderSn })
    },
    frontendToken
  )
  const orders = normalizeFrontendUserOrders({ lists: [data.order || {}] })
  return orders[0] || null
}

/**
 * 函数说明：读取当前登录用户的购买记录列表。
 */
export const fetchFrontendUserOrders = async (pageNo = 1, pageSize = 10): Promise<FrontendUserOrderItem[]> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return []
  }
  const query = `?pageNo=${encodeURIComponent(String(pageNo))}&pageSize=${encodeURIComponent(String(pageSize))}`
  const data = await requestFrontendUserApi<unknown>(`${FRONTEND_USER_ORDERS_ENDPOINT}${query}`, { method: 'GET' }, frontendToken)
  return normalizeFrontendUserOrders(data)
}

/**
 * 函数说明：读取当前登录用户的积分流水列表。
 */
export const fetchFrontendUserPointsLogs = async (pageNo = 1, pageSize = 10): Promise<FrontendUserPointsLogItem[]> => {
  const frontendToken = getFrontendUserToken()
  if (!frontendToken) {
    return []
  }
  const query = `?pageNo=${encodeURIComponent(String(pageNo))}&pageSize=${encodeURIComponent(String(pageSize))}`
  const data = await requestFrontendUserApi<unknown>(`${FRONTEND_USER_POINTS_LOGS_ENDPOINT}${query}`, { method: 'GET' }, frontendToken)
  return normalizeFrontendUserPointsLogs(data)
}

/**
 * 函数说明：退出前端登录并清理本地资料，可选回传后端注销会话。
 */
export const logoutFrontendUser = async (syncServer = true): Promise<void> => {
  const frontendToken = getFrontendUserToken()
  if (syncServer && frontendToken) {
    try {
      await requestFrontendUserApi(FRONTEND_USER_LOGOUT_ENDPOINT, { method: 'POST' }, frontendToken)
    } catch {
      // 退出场景不阻断本地清理，忽略后端异常。
    }
  }
  clearFrontendUserLocalAuth()
  dispatchFrontendUserAuthChanged()
}
