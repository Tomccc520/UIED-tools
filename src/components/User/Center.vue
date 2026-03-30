<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-30
 */
-->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
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
  saveFrontendUserProfileToServer,
  syncFrontendUserProfile,
  type FrontendUserCommerceProducts,
  type FrontendUserOrderItem,
  type FrontendUserPointsLogItem,
  type FrontendUserProfile
} from '@/services/frontendUser'

const router = useRouter()
const route = useRoute()
const siteConfig = ref(getDefaultSitePublicConfig())
const profile = ref<FrontendUserProfile | null>(null)
const saving = ref(false)
const activeTab = ref<'products' | 'orders' | 'logs'>('products')
const productsLoading = ref(false)
const ordersLoading = ref(false)
const pointsLogsLoading = ref(false)
const buyingKey = ref('')
const closingOrderSn = ref('')

const commerceProducts = ref<FrontendUserCommerceProducts>({
  memberEnabled: false,
  memberPlans: [],
  pointsPacks: [],
  memberRightsIntro: '',
  dailyGiftPoints: 50,
  toolConsumePoints: 1
})
const orderList = ref<FrontendUserOrderItem[]>([])
const pointsLogList = ref<FrontendUserPointsLogItem[]>([])

const profileForm = reactive({
  nickname: '',
  qqEmail: ''
})

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
  } catch (error) {
    const message = error instanceof Error ? error.message : '套餐配置加载失败'
    ElMessage.error(message)
  } finally {
    productsLoading.value = false
  }
}

/**
 * 函数说明：加载当前用户的购买记录。
 */
const loadOrders = async () => {
  ordersLoading.value = true
  try {
    orderList.value = await fetchFrontendUserOrders(1, 20)
  } catch (error) {
    const message = error instanceof Error ? error.message : '购买记录加载失败'
    ElMessage.error(message)
  } finally {
    ordersLoading.value = false
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
    const message = error instanceof Error ? error.message : '积分流水加载失败'
    ElMessage.error(message)
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
 * 函数说明：保存用户昵称和 QQ 邮箱绑定信息。
 */
const handleSaveProfile = async () => {
  const nickname = String(profileForm.nickname || '').trim()
  const qqEmail = String(profileForm.qqEmail || '').trim()

  if (nickname.length < 2) {
    ElMessage.warning('昵称至少 2 个字符')
    return
  }
  if (qqEmail && !isValidQqEmail(qqEmail)) {
    ElMessage.warning('请输入正确的 QQ 邮箱，例如 123456@qq.com')
    return
  }

  saving.value = true
  try {
    const nextProfile = await saveFrontendUserProfileToServer({ nickname, qqEmail })
    if (!nextProfile) {
      ElMessage.error('当前登录态已失效，请重新登录')
      await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    loadProfile()
    ElMessage.success('个人中心信息已保存')
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    saving.value = false
  }
}

/**
 * 函数说明：购买会员套餐或积分包，当前采用后端 mock 支付链路即时到账。
 */
const handleBuyProduct = async (productType: 'member_plan' | 'points_pack', productCode: string) => {
  const purchaseKey = `${productType}:${productCode}`
  if (!productCode || buyingKey.value === purchaseKey) {
    return
  }
  buyingKey.value = purchaseKey
  try {
    const result = await purchaseFrontendUserProduct(productType, productCode, 'mock')
    if (!result) {
      ElMessage.error('购买失败，请先重新登录后重试')
      await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }
    loadProfile()
    await Promise.all([loadOrders(), loadPointsLogs()])
    if (result.order.status === 1) {
      ElMessage.success('支付完成，权益已实时生效')
    } else {
      ElMessage.success('订单已创建，当前状态：待支付')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '购买失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    buyingKey.value = ''
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
      ElMessage.warning('订单关闭失败，请稍后重试')
      return
    }
    ElMessage.success('订单已关闭')
    await loadOrders()
  } catch (error) {
    const message = error instanceof Error ? error.message : '订单关闭失败'
    ElMessage.error(message)
  } finally {
    closingOrderSn.value = ''
  }
}

/**
 * 函数说明：退出前端登录并返回官网登录页。
 */
const handleLogout = async () => {
  await logoutFrontendUser()
  ElMessage.success('已退出登录')
  await router.replace('/user/login')
}

onMounted(async () => {
  if (!isFrontendUserLoggedIn()) {
    await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  const syncedProfile = await syncFrontendUserProfile()
  if (!syncedProfile) {
    ElMessage.warning('登录状态已失效，请重新登录')
    await router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  loadProfile()
  await Promise.all([loadSiteConfig(), loadCenterBusinessData()])
})
</script>

<template>
  <section class="user-center-page">
    <div class="center-shell">
      <div class="center-header">
        <h1>{{ siteConfig.userCenterTitle || '个人中心' }}</h1>
        <p>维护资料、购买会员套餐与积分包，并查看购买记录和积分流水。</p>
      </div>

      <div class="center-meta">
        <el-tag type="success">登录用户：{{ profile?.nickname || '-' }}</el-tag>
        <el-tag :type="profileForm.qqEmail ? 'success' : 'info'">QQ邮箱：{{ qqBindStatusLabel }}</el-tag>
        <el-tag type="warning">当前积分：{{ profile?.pointsBalance ?? 0 }}</el-tag>
        <el-tag :type="profile?.memberActive ? 'danger' : 'info'">
          会员状态：{{ profile?.memberDisplayName || '普通用户' }}
        </el-tag>
      </div>

      <div class="points-panel">
        <div class="points-item">
          <div class="points-label">每日赠送</div>
          <div class="points-value">+{{ profile?.pointsDailyGiftPoints ?? siteConfig.loginDailyGiftPoints ?? 50 }}</div>
        </div>
        <div class="points-item">
          <div class="points-label">单次工具消耗</div>
          <div class="points-value">-{{ profile?.pointsToolConsumePoints ?? siteConfig.loginToolConsumePoints ?? 1 }}</div>
        </div>
        <div class="points-item">
          <div class="points-label">最近发放日期</div>
          <div class="points-value points-value--small">{{ profile?.pointsDailyGrantDate || '今日尚未发放' }}</div>
        </div>
        <div class="points-item">
          <div class="points-label">会员有效期</div>
          <div class="points-value points-value--small">{{ memberExpireText }}</div>
        </div>
      </div>

      <el-form label-position="top" class="center-form" @submit.prevent>
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

      <el-tabs v-model="activeTab" class="center-tabs">
        <el-tab-pane label="会员套餐/积分包" name="products">
          <div v-loading="productsLoading" class="commerce-block">
            <div class="rights-intro">{{ commerceProducts.memberRightsIntro || '会员权益说明暂未配置' }}</div>

            <div class="sub-title">会员套餐</div>
            <div class="product-grid" v-if="commerceProducts.memberPlans.length > 0">
              <div class="product-card" v-for="plan in commerceProducts.memberPlans" :key="plan.code">
                <div class="product-name">{{ plan.name }}</div>
                <div class="product-price">¥{{ plan.price }}</div>
                <div class="product-meta">有效期：{{ plan.memberDays }} 天</div>
                <div class="product-meta">赠送积分：{{ plan.giftPoints }}</div>
                <div class="product-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="buyingKey === `member_plan:${plan.code}`"
                    @click="handleBuyProduct('member_plan', plan.code)"
                  >立即开通</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无可购买会员套餐" />

            <div class="sub-title">积分包</div>
            <div class="product-grid" v-if="commerceProducts.pointsPacks.length > 0">
              <div class="product-card" v-for="pack in commerceProducts.pointsPacks" :key="pack.code">
                <div class="product-name">{{ pack.name }}</div>
                <div class="product-price">¥{{ pack.price }}</div>
                <div class="product-meta">基础积分：{{ pack.points }}</div>
                <div class="product-meta">赠送积分：{{ pack.giftPoints }}</div>
                <div class="product-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :loading="buyingKey === `points_pack:${pack.code}`"
                    @click="handleBuyProduct('points_pack', pack.code)"
                  >立即购买</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无可购买积分包" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="购买记录" name="orders">
          <div v-loading="ordersLoading">
            <el-table :data="orderList" border stripe empty-text="暂无购买记录">
              <el-table-column prop="orderSn" label="订单号" min-width="200" />
              <el-table-column prop="productTypeText" label="类型" width="110" />
              <el-table-column prop="productName" label="商品" min-width="150" />
              <el-table-column prop="amount" label="金额" width="90" />
              <el-table-column label="状态" width="96">
                <template #default="scope">
                  <el-tag v-if="scope.row.status === 1" type="success">{{ scope.row.statusText }}</el-tag>
                  <el-tag v-else-if="scope.row.status === 2" type="info">{{ scope.row.statusText }}</el-tag>
                  <el-tag v-else type="warning">{{ scope.row.statusText }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="购买时间" min-width="170">
                <template #default="scope">
                  {{ scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString('zh-CN', { hour12: false }) : '-' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="110" fixed="right">
                <template #default="scope">
                  <el-button
                    v-if="scope.row.status === 0"
                    text
                    type="danger"
                    size="small"
                    :loading="closingOrderSn === scope.row.orderSn"
                    @click="handleClosePendingOrder(scope.row.orderSn)"
                  >
                    关闭订单
                  </el-button>
                  <span v-else>-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="积分流水" name="logs">
          <div v-loading="pointsLogsLoading">
            <el-table :data="pointsLogList" border stripe empty-text="暂无积分流水">
              <el-table-column prop="changeTypeText" label="类型" width="120" />
              <el-table-column label="变动" width="90">
                <template #default="scope">
                  <span :class="scope.row.changeAmount >= 0 ? 'text-plus' : 'text-minus'">
                    {{ scope.row.changeAmount >= 0 ? '+' : '' }}{{ scope.row.changeAmount }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="balanceAfter" label="变动后余额" width="110" />
              <el-table-column prop="remark" label="说明" min-width="180" />
              <el-table-column label="时间" min-width="170">
                <template #default="scope">
                  {{ scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString('zh-CN', { hour12: false }) : '-' }}
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
  min-height: 66vh;
  padding: 18px 0;
}

.center-shell {
  width: min(920px, 100%);
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 16px;
  padding: 24px;
}

.center-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  color: #111827;
}

.center-header p {
  margin: 10px 0 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.7;
}

.center-meta {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.center-form {
  margin-top: 18px;
}

.points-panel {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.points-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  background: #f8f9ff;
}

.points-label {
  font-size: 12px;
  color: #6b7280;
}

.points-value {
  margin-top: 6px;
  font-size: 18px;
  font-weight: 700;
  color: #6c54ff;
}

.points-value--small {
  font-size: 14px;
  font-weight: 600;
}

.field-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.center-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.center-tabs {
  margin-top: 20px;
}

.commerce-block {
  min-height: 220px;
}

.rights-intro {
  padding: 10px 12px;
  border: 1px solid #e9e6ff;
  border-radius: 10px;
  background: #f7f5ff;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.6;
}

.sub-title {
  margin: 16px 0 10px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.product-card {
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 12px;
  background: #ffffff;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.product-price {
  margin-top: 8px;
  font-size: 20px;
  color: #6c54ff;
  font-weight: 800;
}

.product-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.product-actions {
  margin-top: 12px;
}

.text-plus {
  color: #16a34a;
  font-weight: 700;
}

.text-minus {
  color: #dc2626;
  font-weight: 700;
}

@media (max-width: 768px) {
  .center-shell {
    padding: 18px;
  }

  .points-panel {
    grid-template-columns: 1fr;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
