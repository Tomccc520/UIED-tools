<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-31
 */
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDefaultSitePublicConfig, getSitePublicConfig } from '@/services/siteConfig'
import {
  closeFrontendUserOrder,
  fetchFrontendUserCommerceProducts,
  fetchFrontendUserOrders,
  fetchFrontendUserPointsLogs,
  getFrontendUserProfile,
  isFrontendUserLoggedIn,
  isValidQqEmail,
  logoutFrontendUser,
  purchaseFrontendUserProduct,
  relaunchFrontendUserOrderPayment,
  saveFrontendUserProfileToServer,
  syncFrontendUserProfile,
  type FrontendUserCommerceProducts,
  type FrontendUserOrderItem,
  type FrontendUserPointsLogItem,
  type FrontendUserProfile
} from '@/services/frontendUser'

const router = useRouter()
const route = useRoute()

const PAYMENT_POLL_INTERVAL_MS = 3000
const PAYMENT_POLL_MAX_ATTEMPTS = 24

type CenterMessageType = 'success' | 'warning' | 'info' | 'error'
type OrderCheckStatus = 'paid' | 'closed' | 'pending' | 'missing'

const ORDER_CHECK_NOTICE_MAP: Record<OrderCheckStatus, { type: 'success' | 'warning' | 'info'; message: string }> = {
  paid: { type: 'success', message: '支付成功，会员与积分已自动到账' },
  closed: { type: 'warning', message: '该订单已关闭，请重新下单' },
  pending: { type: 'info', message: '订单仍是待支付状态，请完成支付后再刷新' },
  missing: { type: 'warning', message: '订单暂未同步，请稍后重试' }
}

const siteConfig = ref(getDefaultSitePublicConfig())
const profile = ref<FrontendUserProfile | null>(null)
const saving = ref(false)
const activeTab = ref<'products' | 'orders' | 'delivery' | 'logs'>('products')
const productsLoading = ref(false)
const ordersLoading = ref(false)
const pointsLogsLoading = ref(false)
const buyingKey = ref('')
const closingOrderSn = ref('')
const goPayOrderSn = ref('')
const selectedPayChannel = ref('mock')
const manualPaymentChecking = ref(false)
const paymentPolling = ref(false)
const paymentPollingOrderSn = ref('')
const paymentPollingAttemptsLeft = ref(0)
const paymentPollingNotice = ref('')
const paymentPollingTimer = ref<number | null>(null)

const commerceProducts = ref<FrontendUserCommerceProducts>({
  memberEnabled: false,
  memberPlans: [],
  pointsPacks: [],
  memberRightsIntro: '',
  dailyGiftPoints: 50,
  toolConsumePoints: 1,
  paymentChannels: []
})
const orderList = ref<FrontendUserOrderItem[]>([])
const pointsLogList = ref<FrontendUserPointsLogItem[]>([])

const profileForm = reactive({
  nickname: '',
  qqEmail: ''
})

/**
 * 函数说明：统一页面消息提示入口，避免同类提示在不同流程文案不一致。
 */
const showCenterMessage = (type: CenterMessageType, message: string) => {
  const text = String(message || '').trim()
  if (!text) {
    return
  }
  ElMessage[type](text)
}

/**
 * 函数说明：统一解析运行时错误文本，优先透传后端返回文案并回退默认提示。
 */
const resolveRuntimeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    const message = String(error.message || '').trim()
    if (message) {
      return message
    }
  }
  return fallback
}

/**
 * 函数说明：按订单状态输出列表标签类型，统一订单区视觉反馈。
 */
const resolveOrderStatusTagType = (status: number): 'success' | 'info' | 'warning' => {
  if (Number(status) === 1) {
    return 'success'
  }
  if (Number(status) === 2) {
    return 'info'
  }
  return 'warning'
}

/**
 * 函数说明：按支付检查结果输出统一提示文案，减少重复分支文案维护成本。
 */
const notifyOrderCheckStatus = (status: OrderCheckStatus) => {
  const notice = ORDER_CHECK_NOTICE_MAP[status]
  if (!notice) {
    return
  }
  showCenterMessage(notice.type, notice.message)
}

/**
 * 函数说明：返回当前可用支付渠道列表，若后台未配置则回退到 mock 渠道。
 */
const availablePaymentChannels = computed(() => {
  if (commerceProducts.value.paymentChannels.length > 0) {
    return commerceProducts.value.paymentChannels
  }
  return [{
    code: 'mock',
    name: '测试支付',
    description: '开发环境即时到账',
    payUrl: '',
    configured: true
  }]
})

/**
 * 函数说明：获取当前选中的支付渠道对象，便于展示描述信息和配置状态。
 */
const currentPaymentChannel = computed(() => {
  return availablePaymentChannels.value.find((item) => item.code === selectedPayChannel.value) || null
})

/**
 * 函数说明：提取用户显示名称首字母，用于账户头像占位。
 */
const profileInitial = computed(() => {
  const nickname = String(profile.value?.nickname || '').trim()
  if (!nickname) {
    return 'U'
  }
  return nickname.slice(0, 1).toUpperCase()
})

/**
 * 函数说明：判断当前用户是否已绑定 QQ 邮箱。
 */
const qqBindStatusLabel = computed(() => {
  return profileForm.qqEmail ? '已绑定' : '未绑定'
})

/**
 * 函数说明：将会员到期时间戳格式化为可读时间，未开通或无到期时输出默认文案。
 */
const memberExpireText = computed(() => {
  const expireTime = Number(profile.value?.memberExpireTime || 0)
  if (expireTime <= 0) {
    return '未开通会员'
  }
  const date = new Date(expireTime)
  if (Number.isNaN(date.getTime())) {
    return '未开通会员'
  }
  return date.toLocaleString('zh-CN', { hour12: false })
})

/**
 * 函数说明：统计当前待支付订单数量，用于顶部支付跟踪提醒。
 */
const pendingOrderCount = computed(() => {
  return orderList.value.filter((item) => item.status === 0).length
})

/**
 * 函数说明：聚合需要用户关注的源码交付订单，用于“源码交付”专区统一展示。
 */
const deliveryOrderList = computed(() => {
  return orderList.value.filter((item) => {
    return Number(item.status) === 1
      || Number(item.deliveryStatus) > 0
      || Boolean(String(item.downloadUrl || '').trim())
      || Boolean(String(item.licenseBoundDomain || '').trim())
      || Boolean(String(item.licenseKeyMasked || '').trim())
  })
})

/**
 * 函数说明：统计已交付的源码订单数量，便于在交付专区展示当前完成进度。
 */
const deliveredOrderCount = computed(() => {
  return deliveryOrderList.value.filter((item) => Number(item.deliveryStatus) === 1).length
})

/**
 * 函数说明：统计待交付或待补充的源码订单数量，便于用户快速判断是否需要继续跟进。
 */
const pendingDeliveryOrderCount = computed(() => {
  return deliveryOrderList.value.filter((item) => Number(item.deliveryStatus) === 0 || Number(item.deliveryStatus) === 2).length
})

/**
 * 函数说明：统计已失效的交付订单数量，便于用户关注需要重新处理的记录。
 */
const invalidDeliveryOrderCount = computed(() => {
  return deliveryOrderList.value.filter((item) => Number(item.deliveryStatus) === 3).length
})

/**
 * 函数说明：读取当前轮询订单，便于在页面中实时展示状态。
 */
const currentPollingOrder = computed(() => {
  const currentOrderSn = String(paymentPollingOrderSn.value || '').trim()
  if (!currentOrderSn) {
    return null
  }
  return orderList.value.find((item) => item.orderSn === currentOrderSn) || null
})

/**
 * 函数说明：格式化时间戳为本地时间字符串，兼容秒/毫秒时间戳。
 */
const formatDateTime = (value: number): string => {
  const raw = Number(value || 0)
  if (!raw) {
    return '-'
  }
  const timestamp = raw < 1e12 ? raw * 1000 : raw
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleString('zh-CN', { hour12: false })
}

/**
 * 函数说明：将回调状态映射为标签类型，便于在订单表中快速识别异常回调。
 */
const resolveCallbackTagType = (status: number): 'success' | 'danger' | 'warning' => {
  if (Number(status) === 1) {
    return 'success'
  }
  if (Number(status) === 2) {
    return 'danger'
  }
  return 'warning'
}

/**
 * 函数说明：将源码交付状态映射为标签类型，便于在订单表中快速识别当前交付进度。
 */
const resolveDeliveryTagType = (status: number): 'success' | 'warning' | 'info' | 'danger' => {
  if (Number(status) === 1) {
    return 'success'
  }
  if (Number(status) === 2) {
    return 'warning'
  }
  if (Number(status) === 3) {
    return 'danger'
  }
  return 'info'
}

/**
 * 函数说明：将源码交付状态映射为更具体的专区说明文案，便于用户理解当前处理阶段。
 */
const resolveDeliverySummaryText = (order: FrontendUserOrderItem): string => {
  const deliveryStatus = Number(order.deliveryStatus || 0)
  if (deliveryStatus === 1) {
    return order.downloadUrl ? '源码与授权信息已准备完成，可直接查看交付资料。' : '授权信息已准备完成，等待补充下载入口。'
  }
  if (deliveryStatus === 2) {
    return '交付资料仍在补充，请等待运营或技术同学更新。'
  }
  if (deliveryStatus === 3) {
    return '当前交付资料已失效，请联系运营重新分配授权或下载包。'
  }
  if (Number(order.status) === 1) {
    return '订单已支付，交付资料尚未发放。'
  }
  return '订单尚未完成支付，支付成功后才会进入源码交付流程。'
}

/**
 * 函数说明：复制源码绑定域名，方便用户在授权交付流程中直接复用。
 */
const handleCopyDeliveryDomain = async (domain: string) => {
  const value = String(domain || '').trim()
  if (!value) {
    showCenterMessage('warning', '当前订单还没有绑定域名')
    return
  }
  if (!navigator?.clipboard?.writeText) {
    showCenterMessage('warning', '当前浏览器不支持一键复制，请手动复制')
    return
  }
  await navigator.clipboard.writeText(value)
  showCenterMessage('success', '绑定域名已复制')
}

/**
 * 函数说明：打开源码交付下载链接，统一处理空链接兜底，避免模板里直接访问 window。
 */
const handleOpenDeliveryDownload = (downloadUrl: string) => {
  const targetUrl = String(downloadUrl || '').trim()
  if (!targetUrl) {
    showCenterMessage('warning', '当前订单还没有可用的源码下载链接')
    return
  }
  window.open(targetUrl, '_blank', 'noopener')
}

/**
 * 函数说明：清理支付轮询计时器，防止重复轮询和内存泄漏。
 */
const clearPaymentPollingTimer = () => {
  if (paymentPollingTimer.value !== null) {
    window.clearTimeout(paymentPollingTimer.value)
    paymentPollingTimer.value = null
  }
}

/**
 * 函数说明：停止支付状态轮询，可按需保留提示文案。
 */
const stopPaymentStatusPolling = (clearNotice = true) => {
  paymentPolling.value = false
  paymentPollingOrderSn.value = ''
  paymentPollingAttemptsLeft.value = 0
  clearPaymentPollingTimer()
  if (clearNotice) {
    paymentPollingNotice.value = ''
  }
}

/**
 * 函数说明：加载前端用户资料并回填表单。
 */
const loadProfile = () => {
  profile.value = getFrontendUserProfile()
  profileForm.nickname = profile.value?.nickname || ''
  profileForm.qqEmail = profile.value?.qqEmail || ''
}

/**
 * 函数说明：读取后台配置，用于动态显示页面标题文案。
 */
const loadSiteConfig = async () => {
  siteConfig.value = await getSitePublicConfig({ forceRefresh: true })
}

/**
 * 函数说明：加载会员套餐与积分包配置。
 */
const loadCommerceProducts = async () => {
  productsLoading.value = true
  try {
    commerceProducts.value = await fetchFrontendUserCommerceProducts()
    const hasCurrent = availablePaymentChannels.value.some((item) => item.code === selectedPayChannel.value)
    if (!hasCurrent) {
      selectedPayChannel.value = availablePaymentChannels.value[0]?.code || 'mock'
    }
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '套餐配置加载失败'))
  } finally {
    productsLoading.value = false
  }
}

/**
 * 函数说明：加载当前用户的购买记录，可按需静默刷新（用于支付轮询）。
 */
const loadOrders = async (options: { withLoading?: boolean; silent?: boolean; pageSize?: number } = {}) => {
  const withLoading = options.withLoading !== false
  const silent = options.silent === true
  const pageSize = Number(options.pageSize || 50)
  if (withLoading) {
    ordersLoading.value = true
  }
  try {
    orderList.value = await fetchFrontendUserOrders(1, pageSize)
  } catch (error) {
    if (!silent) {
      showCenterMessage('error', resolveRuntimeErrorMessage(error, '购买记录加载失败'))
    }
  } finally {
    if (withLoading) {
      ordersLoading.value = false
    }
  }
}

/**
 * 函数说明：加载当前用户的积分流水记录。
 */
const loadPointsLogs = async () => {
  pointsLogsLoading.value = true
  try {
    pointsLogList.value = await fetchFrontendUserPointsLogs(1, 20)
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '积分流水加载失败'))
  } finally {
    pointsLogsLoading.value = false
  }
}

/**
 * 函数说明：并行刷新用户中心附加数据（套餐、记录、流水）。
 */
const loadCenterBusinessData = async () => {
  await Promise.all([loadCommerceProducts(), loadOrders(), loadPointsLogs()])
}

/**
 * 函数说明：新开支付页面，若被浏览器拦截则提示用户手动放行弹窗。
 */
const openPaymentWindow = (payUrl: string): boolean => {
  const targetUrl = String(payUrl || '').trim()
  if (!targetUrl) {
    return false
  }
  const popup = window.open(targetUrl, '_blank', 'noopener,noreferrer')
  if (!popup) {
    showCenterMessage('warning', '浏览器拦截了支付窗口，请允许弹窗后重试')
    return false
  }
  return true
}

/**
 * 函数说明：检查指定订单的支付状态，并在支付成功后刷新资料/积分流水。
 */
const checkSingleOrderPaymentStatus = async (
  orderSn: string,
  showPendingTip: boolean
): Promise<OrderCheckStatus> => {
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn) {
    return 'missing'
  }
  const latestOrders = await fetchFrontendUserOrders(1, 50)
  orderList.value = latestOrders
  const currentOrder = latestOrders.find((item) => item.orderSn === targetOrderSn)
  if (!currentOrder) {
    if (showPendingTip) {
      notifyOrderCheckStatus('missing')
    }
    return 'missing'
  }
  if (currentOrder.status === 1) {
    const syncedProfile = await syncFrontendUserProfile()
    if (syncedProfile) {
      loadProfile()
    }
    await loadPointsLogs()
    stopPaymentStatusPolling()
    notifyOrderCheckStatus('paid')
    return 'paid'
  }
  if (currentOrder.status === 2) {
    stopPaymentStatusPolling()
    notifyOrderCheckStatus('closed')
    return 'closed'
  }
  if (showPendingTip) {
    notifyOrderCheckStatus('pending')
  }
  return 'pending'
}

/**
 * 函数说明：执行一次支付状态轮询任务，未完成时自动递归下一次检查。
 */
const runPaymentStatusPolling = async (orderSn: string) => {
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn || !paymentPolling.value || paymentPollingOrderSn.value !== targetOrderSn) {
    return
  }
  paymentPollingAttemptsLeft.value = Math.max(0, paymentPollingAttemptsLeft.value - 1)
  try {
    const status = await checkSingleOrderPaymentStatus(targetOrderSn, false)
    if (status === 'paid' || status === 'closed') {
      return
    }
  } catch {
    paymentPollingNotice.value = '支付状态查询短暂失败，系统会自动重试'
  }

  if (!paymentPolling.value || paymentPollingOrderSn.value !== targetOrderSn) {
    return
  }
  if (paymentPollingAttemptsLeft.value <= 0) {
    stopPaymentStatusPolling()
    showCenterMessage('info', '自动检测已结束，可点击“我已支付，刷新状态”继续确认')
    return
  }
  paymentPollingNotice.value = `正在自动检测支付结果，剩余 ${paymentPollingAttemptsLeft.value} 次`
  clearPaymentPollingTimer()
  paymentPollingTimer.value = window.setTimeout(() => {
    void runPaymentStatusPolling(targetOrderSn)
  }, PAYMENT_POLL_INTERVAL_MS)
}

/**
 * 函数说明：启动支付状态轮询，常用于“下单后/继续支付后”自动回拉订单状态。
 */
const startPaymentStatusPolling = (orderSn: string, options: { silent?: boolean } = {}) => {
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn) {
    return
  }
  stopPaymentStatusPolling()
  paymentPolling.value = true
  paymentPollingOrderSn.value = targetOrderSn
  paymentPollingAttemptsLeft.value = PAYMENT_POLL_MAX_ATTEMPTS
  paymentPollingNotice.value = '已开启支付状态检测，完成支付后会自动刷新权益'
  if (!options.silent) {
    showCenterMessage('info', '已开启支付状态自动检测')
  }
  void runPaymentStatusPolling(targetOrderSn)
}

/**
 * 函数说明：手动刷新支付状态，适用于用户完成支付后主动确认到账。
 */
const handleManualRefreshPayment = async () => {
  const fallbackPendingOrderSn = orderList.value.find((item) => item.status === 0)?.orderSn || ''
  const targetOrderSn = String(paymentPollingOrderSn.value || fallbackPendingOrderSn).trim()
  if (!targetOrderSn) {
    showCenterMessage('info', '当前没有待支付订单')
    return
  }
  manualPaymentChecking.value = true
  try {
    const status = await checkSingleOrderPaymentStatus(targetOrderSn, true)
    if (status === 'pending' && !paymentPolling.value) {
      startPaymentStatusPolling(targetOrderSn, { silent: true })
    }
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '支付状态刷新失败'))
  } finally {
    manualPaymentChecking.value = false
  }
}

/**
 * 函数说明：保存用户昵称和 QQ 邮箱绑定信息。
 */
const handleSaveProfile = async () => {
  const nickname = String(profileForm.nickname || '').trim()
  const qqEmail = String(profileForm.qqEmail || '').trim()

  if (nickname.length < 2) {
    showCenterMessage('warning', '昵称至少 2 个字符')
    return
  }
  if (qqEmail && !isValidQqEmail(qqEmail)) {
    showCenterMessage('warning', '请输入正确的 QQ 邮箱，例如 123456@qq.com')
    return
  }

  saving.value = true
  try {
    const nextProfile = await saveFrontendUserProfileToServer({ nickname, qqEmail })
    if (!nextProfile) {
      showCenterMessage('error', '当前登录态已失效，请重新登录')
      await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    loadProfile()
    showCenterMessage('success', '个人中心信息已保存')
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '保存失败，请稍后重试'))
  } finally {
    saving.value = false
  }
}

/**
 * 函数说明：购买会员套餐或积分包，按当前选择支付渠道发起订单并自动追踪支付状态。
 */
const handleBuyProduct = async (productType: 'member_plan' | 'points_pack', productCode: string) => {
  const purchaseKey = `${productType}:${productCode}`
  if (!productCode || buyingKey.value === purchaseKey) {
    return
  }
  const selectedChannel = availablePaymentChannels.value.find((item) => item.code === selectedPayChannel.value)
  if (!selectedChannel) {
    showCenterMessage('warning', '当前未找到可用支付渠道，请刷新后重试')
    return
  }
  if (!selectedChannel.configured) {
    showCenterMessage('warning', '当前支付渠道未配置完成，请切换其他渠道或联系管理员')
    return
  }
  buyingKey.value = purchaseKey
  try {
    const result = await purchaseFrontendUserProduct(productType, productCode, selectedChannel.code)
    if (!result) {
      showCenterMessage('error', '购买失败，请先重新登录后重试')
      await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    loadProfile()
    await Promise.all([loadOrders({ withLoading: false, silent: true }), loadPointsLogs()])
    if (result.order.status === 1) {
      stopPaymentStatusPolling()
      showCenterMessage('success', '支付完成，权益已实时生效')
      return
    }

    activeTab.value = 'orders'
    startPaymentStatusPolling(result.order.orderSn)
    if (result.payment?.payUrl) {
      const opened = openPaymentWindow(result.payment.payUrl)
      if (opened) {
        showCenterMessage('success', '订单已创建，请在新窗口完成支付，系统将自动刷新到账状态')
      }
    } else {
      showCenterMessage('info', '订单已创建，等待支付回调，可在“购买记录”中手动刷新')
    }
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '购买失败，请稍后重试'))
  } finally {
    buyingKey.value = ''
  }
}

/**
 * 函数说明：继续支付待支付订单，跳转到订单对应支付页并恢复状态轮询。
 */
const handleGoPay = async (order: FrontendUserOrderItem) => {
  const targetOrderSn = String(order.orderSn || '').trim()
  if (!targetOrderSn || goPayOrderSn.value === targetOrderSn) {
    return
  }
  goPayOrderSn.value = targetOrderSn
  try {
    const result = await relaunchFrontendUserOrderPayment(targetOrderSn, order.payChannel || selectedPayChannel.value)
    if (!result) {
      showCenterMessage('warning', '订单拉起失败，请重新登录后重试')
      await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    const payUrl = String(result.payment?.payUrl || '').trim()
    if (!payUrl) {
      showCenterMessage('warning', '支付链接暂不可用，请联系管理员检查支付网关配置')
      await loadOrders({ withLoading: false, silent: true })
      return
    }
    const opened = openPaymentWindow(payUrl)
    startPaymentStatusPolling(result.order.orderSn, { silent: !opened })
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '拉起支付失败，请稍后重试'))
  } finally {
    goPayOrderSn.value = ''
  }
}

/**
 * 函数说明：关闭待支付订单，避免无效订单长期占用购买列表。
 */
const handleClosePendingOrder = async (orderSn: string) => {
  const targetOrderSn = String(orderSn || '').trim()
  if (!targetOrderSn || closingOrderSn.value === targetOrderSn) {
    return
  }
  closingOrderSn.value = targetOrderSn
  try {
    const result = await closeFrontendUserOrder(targetOrderSn)
    if (!result) {
      showCenterMessage('warning', '订单关闭失败，请稍后重试')
      return
    }
    if (paymentPollingOrderSn.value === targetOrderSn) {
      stopPaymentStatusPolling()
    }
    showCenterMessage('success', '订单已关闭')
    await loadOrders({ withLoading: false, silent: true })
  } catch (error) {
    showCenterMessage('error', resolveRuntimeErrorMessage(error, '订单关闭失败'))
  } finally {
    closingOrderSn.value = ''
  }
}

/**
 * 函数说明：退出前端登录并返回官网登录页。
 */
const handleLogout = async () => {
  stopPaymentStatusPolling()
  await logoutFrontendUser()
  showCenterMessage('success', '已退出登录')
  await router.replace('/user/login')
}

onMounted(async () => {
  if (!isFrontendUserLoggedIn()) {
    await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  const syncedProfile = await syncFrontendUserProfile()
  if (!syncedProfile) {
    showCenterMessage('warning', '登录状态已失效，请重新登录')
    await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  loadProfile()
  await Promise.all([loadSiteConfig(), loadCenterBusinessData()])
  const latestPendingOrder = orderList.value.find((item) => item.status === 0)
  if (latestPendingOrder) {
    startPaymentStatusPolling(latestPendingOrder.orderSn, { silent: true })
  }
})

onBeforeUnmount(() => {
  stopPaymentStatusPolling()
})
</script>

<template>
  <section class="user-center-page">
    <div class="center-shell">
      <header class="center-hero">
        <div class="hero-main">
          <div class="profile-avatar">{{ profileInitial }}</div>
          <div class="hero-main-text">
            <div class="center-header-badge">账户中心</div>
            <h1>{{ siteConfig.userCenterTitle || '个人中心' }}</h1>
            <p>维护资料、购买会员套餐与积分包，订单支付后系统会自动检测到账状态。</p>
            <div class="center-meta">
              <el-tag type="success">登录用户：{{ profile?.nickname || '-' }}</el-tag>
              <el-tag :type="profileForm.qqEmail ? 'success' : 'info'">QQ邮箱：{{ qqBindStatusLabel }}</el-tag>
              <el-tag type="warning">当前积分：{{ profile?.pointsBalance ?? 0 }}</el-tag>
              <el-tag :type="profile?.memberActive ? 'danger' : 'info'">
                会员状态：{{ profile?.memberDisplayName || '普通用户' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="hero-kpi-grid">
          <div class="hero-kpi-item">
            <div class="hero-kpi-label">每日赠送</div>
            <div class="hero-kpi-value">+{{ profile?.pointsDailyGiftPoints ?? siteConfig.loginDailyGiftPoints ?? 50 }}</div>
          </div>
          <div class="hero-kpi-item">
            <div class="hero-kpi-label">单次工具消耗</div>
            <div class="hero-kpi-value">-{{ profile?.pointsToolConsumePoints ?? siteConfig.loginToolConsumePoints ?? 1 }}</div>
          </div>
          <div class="hero-kpi-item">
            <div class="hero-kpi-label">会员有效期</div>
            <div class="hero-kpi-value hero-kpi-value--small">{{ memberExpireText }}</div>
          </div>
          <div class="hero-kpi-item">
            <div class="hero-kpi-label">待支付订单</div>
            <div class="hero-kpi-value">{{ pendingOrderCount }}</div>
          </div>
        </div>
      </header>

      <div class="profile-section-grid">
        <el-form label-position="top" class="center-form" @submit.prevent>
          <div class="section-title">资料设置</div>
          <el-form-item label="昵称">
            <el-input v-model="profileForm.nickname" maxlength="24" clearable placeholder="请输入昵称" />
          </el-form-item>
          <el-form-item label="QQ邮箱绑定">
            <el-input v-model="profileForm.qqEmail" clearable placeholder="请输入QQ邮箱，例如 123456@qq.com" />
            <div class="field-tip">绑定后可用于后续会员通知、订单提醒与账号找回。</div>
          </el-form-item>
          <div class="center-actions">
            <el-button type="primary" :loading="saving" @click="handleSaveProfile">保存资料</el-button>
            <el-button @click="handleLogout">退出登录</el-button>
          </div>
        </el-form>

        <div class="guide-panel">
          <div class="section-title">支付与积分说明</div>
          <ul class="guide-list">
            <li>开通会员后，会员有效期内工具消耗积分将自动减免。</li>
            <li>积分包到账后可立即用于工具处理与导出操作。</li>
            <li>第三方支付完成后，系统会自动轮询订单状态并刷新权益。</li>
            <li>如支付状态未及时回调，可在订单区点击“我已支付，刷新状态”。</li>
          </ul>
          <div class="guide-footnote">最近发放日期：{{ profile?.pointsDailyGrantDate || '今日尚未发放' }}</div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="center-tabs">
        <el-tab-pane label="会员套餐/积分包" name="products">
          <div v-loading="productsLoading" class="commerce-block">
            <div class="rights-intro">{{ commerceProducts.memberRightsIntro || '会员权益说明暂未配置' }}</div>

            <div class="pay-channel-panel">
              <div class="pay-channel-title">支付渠道</div>
              <el-radio-group v-model="selectedPayChannel">
                <el-radio-button
                  v-for="item in availablePaymentChannels"
                  :key="item.code"
                  :label="item.code"
                  :disabled="!item.configured"
                >
                  {{ item.name }}
                </el-radio-button>
              </el-radio-group>
              <div class="pay-channel-tip">
                {{ currentPaymentChannel?.description || '请选择支付渠道' }}
              </div>
            </div>

            <div v-if="paymentPollingOrderSn" class="payment-watch-bar">
              <div class="payment-watch-main">
                <div class="payment-watch-title">订单跟踪：{{ paymentPollingOrderSn }}</div>
                <div class="payment-watch-desc">
                  {{ paymentPollingNotice || '等待支付渠道回调中' }}
                </div>
                <div class="payment-watch-order">
                  当前状态：{{ currentPollingOrder?.statusText || '待同步' }}
                </div>
              </div>
              <div class="payment-watch-actions">
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :loading="manualPaymentChecking"
                  @click="handleManualRefreshPayment"
                >
                  我已支付，刷新状态
                </el-button>
                <el-button
                  size="small"
                  @click="stopPaymentStatusPolling()"
                >
                  停止自动检测
                </el-button>
              </div>
            </div>

            <div class="sub-title">会员套餐</div>
            <div v-if="commerceProducts.memberPlans.length > 0" class="product-grid">
              <div v-for="plan in commerceProducts.memberPlans" :key="plan.code" class="product-card">
                <div class="product-head">
                  <div class="product-name">{{ plan.name }}</div>
                  <el-tag v-if="plan.badge" type="danger" size="small" effect="light">{{ plan.badge }}</el-tag>
                </div>
                <div class="product-price">¥{{ plan.price }}</div>
                <div class="product-meta">有效期：{{ plan.memberDays }} 天</div>
                <div class="product-meta">赠送积分：{{ plan.giftPoints }}</div>
                <div class="product-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="buyingKey === `member_plan:${plan.code}`"
                    @click="handleBuyProduct('member_plan', plan.code)"
                  >
                    立即开通
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无可购买会员套餐" />

            <div class="sub-title">积分包</div>
            <div v-if="commerceProducts.pointsPacks.length > 0" class="product-grid">
              <div v-for="pack in commerceProducts.pointsPacks" :key="pack.code" class="product-card">
                <div class="product-head">
                  <div class="product-name">{{ pack.name }}</div>
                  <el-tag type="success" size="small" effect="light">积分补充</el-tag>
                </div>
                <div class="product-price">¥{{ pack.price }}</div>
                <div class="product-meta">基础积分：{{ pack.points }}</div>
                <div class="product-meta">赠送积分：{{ pack.giftPoints }}</div>
                <div class="product-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="buyingKey === `points_pack:${pack.code}`"
                    @click="handleBuyProduct('points_pack', pack.code)"
                  >
                    立即购买
                  </el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无可购买积分包" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="购买记录" name="orders">
          <div class="orders-block" v-loading="ordersLoading">
            <div class="orders-toolbar">
              <div class="orders-toolbar-left">
                <div class="orders-toolbar-title">订单列表</div>
                <div class="orders-toolbar-desc">支付成功后会员与积分会自动到账，回调失败会在列表里显示具体原因。</div>
              </div>
              <div class="orders-toolbar-actions">
                <el-button size="small" @click="loadOrders">刷新订单</el-button>
                <el-button
                  v-if="paymentPollingOrderSn"
                  size="small"
                  type="primary"
                  plain
                  :loading="manualPaymentChecking"
                  @click="handleManualRefreshPayment"
                >
                  我已支付，刷新状态
                </el-button>
              </div>
            </div>

            <el-table :data="orderList" border stripe empty-text="暂无购买记录">
              <el-table-column prop="orderSn" label="订单号" min-width="220" />
              <el-table-column prop="productTypeText" label="类型" width="110" />
              <el-table-column prop="productName" label="商品" min-width="160" />
              <el-table-column prop="amount" label="金额" width="96" />
              <el-table-column label="状态" width="112">
                <template #default="scope">
                  <el-tag :type="resolveOrderStatusTagType(scope.row.status)">
                    {{ scope.row.statusText }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="回调状态" width="120">
                <template #default="scope">
                  <el-tag :type="resolveCallbackTagType(scope.row.callbackStatus)">
                    {{ scope.row.callbackStatusText || '未回调' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="交易号" min-width="180">
                <template #default="scope">
                  {{ scope.row.tradeNo || '-' }}
                </template>
              </el-table-column>
              <el-table-column label="回调时间" min-width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.callbackTime) }}
                </template>
              </el-table-column>
              <el-table-column label="回调信息" min-width="190">
                <template #default="scope">
                  <span :class="scope.row.callbackStatus === 2 ? 'text-minus' : ''">
                    {{ scope.row.callbackError || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="源码交付" min-width="260">
                <template #default="scope">
                  <div class="delivery-cell">
                    <el-tag :type="resolveDeliveryTagType(scope.row.deliveryStatus)">
                      {{ scope.row.deliveryStatusText || '未交付' }}
                    </el-tag>
                    <div class="delivery-cell-meta">
                      <div>域名：{{ scope.row.licenseBoundDomain || '-' }}</div>
                      <div>授权码：{{ scope.row.licenseKeyMasked || '-' }}</div>
                      <div>
                        下载：
                        <a v-if="scope.row.downloadUrl" :href="scope.row.downloadUrl" target="_blank" rel="noopener noreferrer">打开交付链接</a>
                        <span v-else>-</span>
                      </div>
                      <div>交付时间：{{ formatDateTime(scope.row.deliveredTime) }}</div>
                      <div>备注：{{ scope.row.deliveryNote || '-' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="购买时间" min-width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="210" fixed="right">
                <template #default="scope">
                  <template v-if="scope.row.status === 0">
                    <el-button
                      text
                      type="primary"
                      size="small"
                      :loading="goPayOrderSn === scope.row.orderSn"
                      @click="handleGoPay(scope.row)"
                    >
                      去支付
                    </el-button>
                    <el-button
                      text
                      type="danger"
                      size="small"
                      :loading="closingOrderSn === scope.row.orderSn"
                      @click="handleClosePendingOrder(scope.row.orderSn)"
                    >
                      关闭订单
                    </el-button>
                  </template>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="源码交付" name="delivery">
          <div class="delivery-board" v-loading="ordersLoading">
            <div class="delivery-board-hero">
              <div>
                <div class="delivery-board-title">源码交付专区</div>
                <div class="delivery-board-desc">集中查看源码包、绑定域名、授权码与交付备注，避免在订单表里逐条翻找。</div>
              </div>
              <div class="delivery-board-actions">
                <el-button size="small" @click="loadOrders">刷新交付状态</el-button>
                <el-button size="small" type="primary" plain @click="activeTab = 'orders'">查看完整订单</el-button>
              </div>
            </div>

            <div class="delivery-kpi-grid">
              <div class="delivery-kpi-card">
                <div class="delivery-kpi-label">可交付订单</div>
                <div class="delivery-kpi-value">{{ deliveryOrderList.length }}</div>
              </div>
              <div class="delivery-kpi-card">
                <div class="delivery-kpi-label">已交付</div>
                <div class="delivery-kpi-value">{{ deliveredOrderCount }}</div>
              </div>
              <div class="delivery-kpi-card">
                <div class="delivery-kpi-label">待补充/待交付</div>
                <div class="delivery-kpi-value">{{ pendingDeliveryOrderCount }}</div>
              </div>
              <div class="delivery-kpi-card">
                <div class="delivery-kpi-label">已失效</div>
                <div class="delivery-kpi-value">{{ invalidDeliveryOrderCount }}</div>
              </div>
            </div>

            <div v-if="deliveryOrderList.length > 0" class="delivery-card-grid">
              <article v-for="item in deliveryOrderList" :key="`${item.orderSn}-delivery`" class="delivery-card">
                <div class="delivery-card-head">
                  <div>
                    <div class="delivery-card-title">{{ item.productName || '源码交付订单' }}</div>
                    <div class="delivery-card-sn">订单号：{{ item.orderSn }}</div>
                  </div>
                  <el-tag :type="resolveDeliveryTagType(item.deliveryStatus)">
                    {{ item.deliveryStatusText || '未交付' }}
                  </el-tag>
                </div>
                <div class="delivery-card-desc">{{ resolveDeliverySummaryText(item) }}</div>
                <div class="delivery-card-info">
                  <div><span>绑定域名</span><strong>{{ item.licenseBoundDomain || '-' }}</strong></div>
                  <div><span>授权码</span><strong>{{ item.licenseKeyMasked || '-' }}</strong></div>
                  <div><span>交付时间</span><strong>{{ formatDateTime(item.deliveredTime) }}</strong></div>
                  <div><span>备注</span><strong>{{ item.deliveryNote || '-' }}</strong></div>
                </div>
                <div class="delivery-card-actions">
                  <el-button size="small" @click="handleCopyDeliveryDomain(item.licenseBoundDomain)">复制域名</el-button>
                  <el-button
                    v-if="item.downloadUrl"
                    size="small"
                    type="primary"
                    plain
                    @click="handleOpenDeliveryDownload(item.downloadUrl)"
                  >
                    打开源码包
                  </el-button>
                </div>
              </article>
            </div>
            <el-empty v-else description="暂无需要关注的源码交付记录" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="积分流水" name="logs">
          <div v-loading="pointsLogsLoading">
            <el-table :data="pointsLogList" border stripe empty-text="暂无积分流水">
              <el-table-column prop="changeTypeText" label="类型" width="120" />
              <el-table-column label="变动" width="100">
                <template #default="scope">
                  <span :class="scope.row.changeAmount >= 0 ? 'text-plus' : 'text-minus'">
                    {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ scope.row.changeAmount }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="balanceAfter" label="变动后余额" width="120" />
              <el-table-column prop="remark" label="说明" min-width="200" />
              <el-table-column label="时间" min-width="180">
                <template #default="scope">
                  {{ formatDateTime(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<style scoped>
.user-center-page {
  min-height: 70vh;
  padding: 24px clamp(12px, 3vw, 40px) 28px;
  background:
    radial-gradient(circle at 8% 0%, rgba(108, 84, 255, 0.12) 0%, transparent 34%),
    radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 42%),
    #f6f7fb;
}

.center-shell {
  width: min(1160px, 100%);
  margin: 0 auto;
  border: 1px solid #e4e7f0;
  border-radius: 20px;
  background: #ffffff;
  padding: clamp(18px, 2.4vw, 28px);
}

.center-hero {
  border: 1px solid #dfe4f2;
  border-radius: 16px;
  background: linear-gradient(140deg, #f7f4ff 0%, #ffffff 56%, #f5f9ff 100%);
  padding: 18px;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 16px;
}

.hero-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  border: 1px solid #cec6ff;
  background: linear-gradient(160deg, #6c54ff 0%, #4d4cf5 100%);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-main-text h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.2;
  color: #1f2442;
  letter-spacing: 0.3px;
}

.hero-main-text p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #68728a;
}

.center-header-badge {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #d9d2ff;
  background: #f0ecff;
  color: #5942d8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 10px;
}

.center-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.hero-kpi-item {
  border: 1px solid #e0e4f1;
  border-radius: 12px;
  background: #ffffff;
  padding: 10px 12px;
  min-height: 74px;
}

.hero-kpi-label {
  font-size: 12px;
  color: #788199;
}

.hero-kpi-value {
  margin-top: 6px;
  color: #4f3fc4;
  font-size: 19px;
  font-weight: 700;
}

.hero-kpi-value--small {
  font-size: 13px;
  line-height: 1.45;
}

.profile-section-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #2c3350;
}

.center-form {
  border: 1px solid #e8ebf4;
  border-radius: 14px;
  padding: 14px 14px 8px;
  background: linear-gradient(180deg, #ffffff 0%, #fcfcff 100%);
}

.field-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #8891a9;
}

.center-actions {
  display: flex;
  gap: 10px;
}

.guide-panel {
  border: 1px solid #e8ebf4;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  padding: 14px;
}

.guide-list {
  margin: 0;
  padding-left: 16px;
  color: #5e677d;
  font-size: 13px;
  line-height: 1.75;
}

.guide-footnote {
  margin-top: 10px;
  color: #6a7390;
  font-size: 12px;
}

.center-tabs {
  margin-top: 18px;
}

.commerce-block {
  border: 1px solid #e8ebf4;
  border-radius: 14px;
  padding: 14px;
  background: #ffffff;
}

.rights-intro {
  padding: 10px 12px;
  border: 1px solid #e4defe;
  border-radius: 10px;
  background: linear-gradient(120deg, #f5f2ff 0%, #f8f9ff 100%);
  color: #4f5670;
  font-size: 13px;
  line-height: 1.6;
}

.pay-channel-panel {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e7eaf4;
  border-radius: 10px;
  background: #fbfcff;
}

.pay-channel-title {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #3b4260;
}

.pay-channel-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #727b90;
}

.payment-watch-bar {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #dcd4ff;
  border-radius: 10px;
  background: #f7f4ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.payment-watch-main {
  min-width: 0;
}

.payment-watch-title {
  font-size: 13px;
  font-weight: 700;
  color: #4a3bb7;
}

.payment-watch-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #5f6780;
}

.payment-watch-order {
  margin-top: 2px;
  font-size: 12px;
  color: #76809a;
}

.payment-watch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.sub-title {
  margin: 18px 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #2b3048;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.product-card {
  border: 1px solid #e7ebf4;
  border-radius: 12px;
  padding: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.product-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #1f243c;
}

.product-price {
  margin-top: 8px;
  font-size: 20px;
  color: #5a45d9;
  font-weight: 800;
}

.product-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #71798d;
}

.product-actions {
  margin-top: 12px;
}

.orders-block {
  border: 1px solid #e8ebf4;
  border-radius: 14px;
  padding: 12px;
  background: #ffffff;
}

.orders-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.orders-toolbar-title {
  font-size: 14px;
  font-weight: 700;
  color: #2d3550;
}

.orders-toolbar-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #7a839b;
}

.orders-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.delivery-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.delivery-cell-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}

.delivery-board {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delivery-board-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid #e6e8f2;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(108, 84, 255, 0.08), rgba(44, 182, 125, 0.08));
}

.delivery-board-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.delivery-board-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #5b6476;
}

.delivery-board-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.delivery-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.delivery-kpi-card {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid #e4e7f0;
  background: #ffffff;
}

.delivery-kpi-label {
  font-size: 12px;
  color: #6b7280;
}

.delivery-kpi-value {
  margin-top: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.delivery-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.delivery-card {
  padding: 18px;
  border-radius: 20px;
  border: 1px solid #e4e7f0;
  background: #ffffff;
}

.delivery-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.delivery-card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.delivery-card-sn {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.delivery-card-desc {
  margin-top: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
}

.delivery-card-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  margin-top: 14px;
}

.delivery-card-info > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f7f8fb;
}

.delivery-card-info span {
  font-size: 12px;
  color: #6b7280;
}

.delivery-card-info strong {
  font-size: 13px;
  line-height: 1.5;
  color: #111827;
  word-break: break-all;
}

.delivery-card-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.text-plus {
  color: #16a34a;
  font-weight: 700;
}

.text-minus {
  color: #dc2626;
  font-weight: 700;
}

:deep(.center-meta .el-tag) {
  border-radius: 999px;
  font-weight: 600;
}

:deep(.center-form .el-form-item__label) {
  color: #364057;
  font-weight: 600;
}

:deep(.center-tabs .el-tabs__header) {
  margin: 0 0 12px;
}

:deep(.center-tabs .el-tabs__item) {
  font-weight: 600;
}

:deep(.center-tabs .el-tabs__item.is-active) {
  color: #5b47d6;
}

:deep(.center-tabs .el-tabs__active-bar) {
  background: #5b47d6;
}

:deep(.center-tabs .el-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.center-tabs .el-table th.el-table__cell) {
  background: #f8f9fd;
  color: #4b5570;
}

@media (max-width: 1024px) {
  .user-center-page {
    padding: 18px clamp(10px, 2.4vw, 20px) 20px;
  }

  .center-shell {
    padding: 16px;
  }

  .center-hero {
    grid-template-columns: 1fr;
  }

  .profile-section-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-center-page {
    padding: 14px 10px 18px;
  }

  .center-shell {
    border-radius: 14px;
    padding: 14px;
  }

  .hero-main-text h1 {
    font-size: 24px;
  }

  .hero-kpi-grid {
    grid-template-columns: 1fr;
  }

  .payment-watch-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .payment-watch-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }

  .orders-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .orders-toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .center-actions {
    flex-wrap: wrap;
  }

  .delivery-board-hero {
    flex-direction: column;
  }

  .delivery-board-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .delivery-kpi-grid,
  .delivery-card-grid,
  .delivery-card-info {
    grid-template-columns: 1fr;
  }
}
</style>
