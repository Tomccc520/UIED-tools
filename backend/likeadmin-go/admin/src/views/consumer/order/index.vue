<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-30
 */
-->
<template>
    <div class="consumer-order-page pro-page pro-page-shell">
        <a-page-header
            class="pro-page-header"
            title="订单管理"
            subtitle="支持按状态和类型筛选订单，并提供导出、补单、关闭等运营操作。"
        >
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>总订单 {{ pager.count }}</a-tag>
                    <a-tag color="purple" bordered>当前页 {{ pager.lists.length }}</a-tag>
                    <a-button @click="handleRefresh">刷新</a-button>
                    <a-button @click="handleResetFilters">重置筛选</a-button>
                    <a-button type="outline" :loading="exporting" @click="handleExport"
                        >导出CSV</a-button
                    >
                </a-space>
            </template>
        </a-page-header>

        <a-space direction="vertical" fill :size="16">
            <a-card
                v-if="licenseRepairContext.isActive"
                class="!border-none pro-card"
                :bordered="false"
            >
                <div class="repair-context-block">
                    <div class="repair-context-block__main">
                        <div class="repair-context-block__eyebrow">授权联动修复上下文</div>
                        <div class="repair-context-block__title">
                            {{
                                licenseRepairContext.orderSn
                                    ? `当前正在处理订单 ${licenseRepairContext.orderSn}`
                                    : '当前正在处理授权联动异常'
                            }}
                        </div>
                        <div class="repair-context-block__desc">
                            已从授权管理页带回当前修复上下文。订单列表已按订单号和域名自动收窄，便于你直接定位问题订单并继续补资料。
                        </div>
                        <div class="repair-context-block__meta">
                            <div class="repair-context-block__meta-item">
                                <span>订单号</span>
                                <strong>{{ licenseRepairContext.orderSn || '-' }}</strong>
                            </div>
                            <div class="repair-context-block__meta-item">
                                <span>订单域名</span>
                                <strong>{{ licenseRepairContext.domain || '-' }}</strong>
                            </div>
                            <div class="repair-context-block__meta-item">
                                <span>联动状态</span>
                                <strong>{{
                                    licenseRepairContext.deliveryCheckText || '未指定'
                                }}</strong>
                            </div>
                            <div class="repair-context-block__meta-item">
                                <span>系统授权</span>
                                <strong>{{ licenseRepairContext.licenseStatusText || '-' }}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="repair-context-block__aside">
                        <div class="repair-context-block__aside-title">当前建议</div>
                        <div class="repair-context-block__aside-text">
                            先核对当前订单的交付资料是否完整，再根据提示跳回授权管理页修复系统授权。
                        </div>
                        <a-space direction="vertical" fill>
                            <a-button
                                v-if="licenseRepairContext.orderSn"
                                type="primary"
                                @click="handleGoBackToLicense"
                            >
                                返回授权页继续处理
                            </a-button>
                            <a-button @click="handleClearRepairContext">清除上下文</a-button>
                        </a-space>
                    </div>
                </div>
            </a-card>

            <a-card class="!border-none pro-card" :bordered="false">
                <div class="linkage-summary-grid">
                    <button
                        class="linkage-summary-card"
                        type="button"
                        @click="handleQuickFilterDelivery('')"
                    >
                        <div class="linkage-summary-card__label">源码交付订单</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.sourceOrderCount }}
                        </div>
                        <div class="linkage-summary-card__desc">当前参与授权联动的订单总数</div>
                    </button>
                    <button
                        class="linkage-summary-card linkage-summary-card--danger"
                        type="button"
                        @click="handleQuickFilterDelivery('abnormal')"
                    >
                        <div class="linkage-summary-card__label">异常待处理</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.abnormalCount }}
                        </div>
                        <div class="linkage-summary-card__desc">授权、域名或下载链路存在问题</div>
                    </button>
                    <button
                        class="linkage-summary-card"
                        type="button"
                        @click="handleQuickFilterDelivery('license_inactive')"
                    >
                        <div class="linkage-summary-card__label">授权未激活</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.licenseInactiveCount }}
                        </div>
                        <div class="linkage-summary-card__desc">
                            已交付但系统授权还没进入可用状态
                        </div>
                    </button>
                    <button
                        class="linkage-summary-card"
                        type="button"
                        @click="handleQuickFilterDelivery('domain_mismatch')"
                    >
                        <div class="linkage-summary-card__label">域名不匹配</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.domainMismatchCount }}
                        </div>
                        <div class="linkage-summary-card__desc">
                            订单绑定域名和系统授权域名不一致
                        </div>
                    </button>
                    <button
                        class="linkage-summary-card"
                        type="button"
                        @click="handleQuickFilterDelivery('download_invalid')"
                    >
                        <div class="linkage-summary-card__label">下载异常</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.downloadInvalidCount }}
                        </div>
                        <div class="linkage-summary-card__desc">下载链接无效或最近检测失败</div>
                    </button>
                    <button
                        class="linkage-summary-card"
                        type="button"
                        @click="handleQuickFilterDelivery('delivery_incomplete')"
                    >
                        <div class="linkage-summary-card__label">资料待补充</div>
                        <div class="linkage-summary-card__value">
                            {{ linkageSummary.deliveryIncompleteCount }}
                        </div>
                        <div class="linkage-summary-card__desc">域名、授权码或下载入口仍缺字段</div>
                    </button>
                </div>
            </a-card>

            <a-card class="!border-none pro-card" :bordered="false">
                <a-form class="mb-[-16px]" :model="queryParams" layout="inline">
                    <a-form-item label="关键字">
                        <a-input
                            v-model="queryParams.keyword"
                            class="w-[300px]"
                            placeholder="订单号/商品名称/用户昵称/手机"
                            allow-clear
                            @press-enter="resetPage"
                        />
                    </a-form-item>

                    <a-form-item label="订单状态">
                        <a-select v-model="queryParams.status" class="w-[180px]" allow-clear>
                            <a-option value="">全部状态</a-option>
                            <a-option value="0">待支付</a-option>
                            <a-option value="1">已支付</a-option>
                            <a-option value="2">已关闭</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="回调状态">
                        <a-select
                            v-model="queryParams.callbackStatus"
                            class="w-[180px]"
                            allow-clear
                        >
                            <a-option value="">全部回调</a-option>
                            <a-option value="0">未回调</a-option>
                            <a-option value="3">支付处理中</a-option>
                            <a-option value="1">回调成功</a-option>
                            <a-option value="2">回调失败</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="交付状态">
                        <a-select
                            v-model="queryParams.deliveryStatus"
                            class="w-[180px]"
                            allow-clear
                        >
                            <a-option value="">全部交付</a-option>
                            <a-option value="0">未交付</a-option>
                            <a-option value="1">已交付</a-option>
                            <a-option value="2">待补充</a-option>
                            <a-option value="3">已失效</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="联动状态">
                        <a-select
                            v-model="queryParams.deliveryCheckStatus"
                            class="w-[200px]"
                            allow-clear
                        >
                            <a-option value="">全部联动</a-option>
                            <a-option value="abnormal">异常待处理</a-option>
                            <a-option value="pending_delivery">待交付</a-option>
                            <a-option value="license_inactive">授权未激活</a-option>
                            <a-option value="domain_mismatch">域名不匹配</a-option>
                            <a-option value="download_invalid">下载异常</a-option>
                            <a-option value="delivery_incomplete">资料不完整</a-option>
                            <a-option value="expired">已失效</a-option>
                            <a-option value="ok">资料完整</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="绑定域名">
                        <a-input
                            v-model="queryParams.boundDomain"
                            class="w-[220px]"
                            placeholder="筛选订单绑定域名"
                            allow-clear
                            @press-enter="resetPage"
                        />
                    </a-form-item>

                    <a-form-item label="商品类型">
                        <a-select v-model="queryParams.productType" class="w-[200px]" allow-clear>
                            <a-option value="">全部类型</a-option>
                            <a-option value="member_plan">会员套餐</a-option>
                            <a-option value="points_pack">积分包</a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="创建时间">
                        <daterange-picker
                            v-model:startTime="queryParams.startTime"
                            v-model:endTime="queryParams.endTime"
                        />
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" @click="handleSearch">查询</a-button>
                        <a-button class="ml-2" @click="handleResetFilters">重置</a-button>
                    </a-form-item>
                </a-form>
                <div class="filter-result">
                    筛选条件：{{ activeFilterCount }} 项 | 当前加载 {{ pager.lists.length }} 条
                </div>
            </a-card>

            <a-card class="!border-none pro-card" :bordered="false">
                <a-table
                    :data="pager.lists"
                    :loading="pager.loading"
                    :pagination="false"
                    :bordered="false"
                    :columns="orderColumns"
                    :scroll="orderTableScroll"
                    row-key="id"
                >
                    <template #status="{ record }">
                        <a-tag :color="resolveStatusColor(record.status)" bordered>{{
                            record.statusText
                        }}</a-tag>
                    </template>

                    <template #callbackStatus="{ record }">
                        <a-tag :color="resolveCallbackStatusColor(record.callbackStatus)" bordered>
                            {{ record.callbackStatusText || '未回调' }}
                        </a-tag>
                    </template>

                    <template #amount="{ record }"
                        >¥{{ Number(record.amount || 0).toFixed(2) }}</template
                    >

                    <template #callbackError="{ record }">
                        <a-typography-text
                            v-if="record.callbackError"
                            type="danger"
                            :ellipsis="{ rows: 1, showTooltip: true }"
                        >
                            {{ record.callbackError }}
                        </a-typography-text>
                        <span v-else>-</span>
                    </template>

                    <template #deliveryStatus="{ record }">
                        <a-tag :color="resolveDeliveryStatusColor(record.deliveryStatus)" bordered>
                            {{ record.deliveryStatusText || '未交付' }}
                        </a-tag>
                    </template>

                    <template #deliveryInfo="{ record }">
                        <div class="delivery-info">
                            <div>域名：{{ record.licenseBoundDomain || '-' }}</div>
                            <div>授权码：{{ record.licenseKeyMasked || '-' }}</div>
                            <div>
                                下载：
                                <a
                                    v-if="record.downloadUrl"
                                    :href="record.downloadUrl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    >打开链接</a
                                >
                                <span v-else>-</span>
                            </div>
                            <div>下载检测：{{ record.downloadCheckStatusText || '未检测' }}</div>
                            <div>交付时间：{{ record.deliveredTime || '-' }}</div>
                        </div>
                    </template>

                    <template #deliveryCheck="{ record }">
                        <div
                            v-if="record.isSourceDeliveryOrder"
                            class="delivery-check-block"
                            :class="resolveDeliveryCheckBlockClass(record)"
                        >
                            <div class="delivery-check-block__head">
                                <a-tag :color="resolveDeliveryCheckColor(record)" bordered>
                                    {{ resolveDeliveryCheckText(record) }}
                                </a-tag>
                                <span class="delivery-check-block__meta-text"
                                    >系统授权：{{ record.systemLicenseStatusText || '-' }}</span
                                >
                            </div>
                            <div class="delivery-check-block__meta">
                                <div>
                                    <span>系统域名</span>
                                    <strong>{{ record.systemLicenseBoundDomain || '-' }}</strong>
                                </div>
                                <div>
                                    <span>下载检测</span>
                                    <strong>{{
                                        record.downloadCheckStatusText || '未检测'
                                    }}</strong>
                                </div>
                            </div>
                            <div
                                v-if="record.downloadCheckTime || record.downloadCheckMessage"
                                class="delivery-check-block__detail"
                            >
                                <div v-if="record.downloadCheckTime">
                                    最近检测：{{ record.downloadCheckTime }}
                                </div>
                                <div v-if="record.downloadCheckMessage">
                                    检测结果：{{ record.downloadCheckMessage }}
                                </div>
                            </div>
                            <div
                                v-if="collectDeliveryIssues(record).length > 0"
                                class="delivery-check-block__issues"
                            >
                                <div
                                    v-for="issue in collectDeliveryIssues(record)"
                                    :key="issue"
                                    class="delivery-check-block__issue"
                                >
                                    {{ issue }}
                                </div>
                            </div>
                        </div>
                        <a-tag v-else color="gray" bordered>不参与</a-tag>
                    </template>

                    <template #action="{ record }">
                        <a-space size="mini">
                            <a-button
                                v-perms="['order:delivery']"
                                type="text"
                                status="warning"
                                @click="handleOpenDelivery(record)"
                            >
                                交付
                            </a-button>
                            <a-button
                                v-if="record.isSourceDeliveryOrder"
                                v-perms="['setting:license:detail']"
                                type="text"
                                @click="handleGoLicense(record)"
                            >
                                去授权管理
                            </a-button>
                            <a-button
                                v-if="record.isSourceDeliveryOrder"
                                v-perms="['order:check_download']"
                                type="text"
                                status="primary"
                                :loading="isRowActionLoading(record.orderSn, 'check_download')"
                                @click="handleCheckDownload(record)"
                            >
                                检测下载
                            </a-button>
                            <a-button
                                v-if="Number(record.status) !== 1"
                                v-perms="['order:reissue']"
                                type="text"
                                status="success"
                                @click="handleOpenReissue(record.orderSn)"
                            >
                                补单
                            </a-button>
                            <a-button
                                v-if="Number(record.status) === 0"
                                v-perms="['order:close']"
                                type="text"
                                status="danger"
                                :loading="isRowActionLoading(record.orderSn, 'close')"
                                @click="handleCloseOrder(record.orderSn)"
                            >
                                关闭
                            </a-button>
                        </a-space>
                    </template>
                </a-table>
                <a-empty
                    v-if="!pager.loading && pager.lists.length === 0"
                    description="暂无订单数据"
                />

                <div class="flex justify-end mt-4">
                    <pagination v-model="pager" @change="getLists" />
                </div>
            </a-card>
        </a-space>

        <a-modal
            v-model:visible="reissueModal.visible"
            title="订单补单"
            :ok-loading="reissueSubmitting"
            @ok="handleSubmitReissue"
        >
            <a-form :model="reissueModal" layout="vertical">
                <a-form-item label="订单号">
                    <a-input :model-value="reissueModal.orderSn" disabled />
                </a-form-item>
                <a-form-item label="交易号（可选）">
                    <a-input
                        v-model="reissueModal.tradeNo"
                        placeholder="可选，不填将自动使用 admin_manual_订单号"
                        allow-clear
                    />
                </a-form-item>
                <a-form-item label="支付渠道">
                    <a-select v-model="reissueModal.payChannel" placeholder="请选择补单支付渠道">
                        <a-option value="admin_manual">后台人工（admin_manual）</a-option>
                        <a-option value="wechat_h5">微信H5（wechat_h5）</a-option>
                        <a-option value="alipay_h5">支付宝H5（alipay_h5）</a-option>
                        <a-option value="mock">开发模拟（mock）</a-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="补单备注（可选）">
                    <a-input
                        v-model="reissueModal.remark"
                        placeholder="可选，例如：人工核验到账后补单"
                        allow-clear
                    />
                </a-form-item>
            </a-form>
        </a-modal>

        <a-modal
            v-model:visible="deliveryModal.visible"
            title="订单交付信息"
            :width="860"
            :ok-loading="deliverySubmitting"
            @ok="handleSubmitDelivery"
        >
            <div class="delivery-workspace">
                <div class="delivery-workspace__main">
                    <div class="delivery-workspace__eyebrow">源码交付工作台</div>
                    <div class="delivery-workspace__title">
                        {{
                            deliveryModal.orderSn
                                ? `当前正在维护订单 ${deliveryModal.orderSn}`
                                : '当前正在维护源码交付信息'
                        }}
                    </div>
                    <div class="delivery-workspace__desc">
                        先补齐域名、授权码和下载入口，再根据系统授权状态判断是否需要跳到授权管理页继续修复。
                    </div>
                    <div class="delivery-workspace__meta">
                        <div class="delivery-workspace__meta-item">
                            <span>交付状态</span>
                            <strong>{{ deliveryModal.deliveryStatusText }}</strong>
                        </div>
                        <div class="delivery-workspace__meta-item">
                            <span>交付校验</span>
                            <strong>{{ deliveryModal.deliveryCheckText }}</strong>
                        </div>
                        <div class="delivery-workspace__meta-item">
                            <span>系统授权</span>
                            <strong>{{ deliveryModal.systemLicenseStatusText || '-' }}</strong>
                        </div>
                        <div class="delivery-workspace__meta-item">
                            <span>系统域名</span>
                            <strong>{{ deliveryModal.systemLicenseBoundDomain || '-' }}</strong>
                        </div>
                    </div>
                </div>
                <div class="delivery-workspace__aside">
                    <div class="delivery-workspace__aside-title">当前动作建议</div>
                    <div class="delivery-workspace__aside-text">
                        {{ deliveryModalActionSummary }}
                    </div>
                    <a-space direction="vertical" fill>
                        <a-button
                            v-if="deliveryModal.id > 0"
                            type="primary"
                            @click="handleGoLicenseFromDelivery"
                        >
                            去授权管理继续修复
                        </a-button>
                        <a-button
                            v-if="deliveryModal.systemLicenseBoundDomain"
                            @click="handleApplySystemDomainToDelivery"
                        >
                            使用系统授权域名
                        </a-button>
                        <a-button
                            type="outline"
                            :loading="isRowActionLoading(deliveryModal.orderSn, 'check_download')"
                            :disabled="!String(deliveryModal.downloadUrl || '').trim()"
                            @click="handleCheckDownload(deliveryModal)"
                        >
                            检测下载链接
                        </a-button>
                    </a-space>
                </div>
            </div>

            <div class="delivery-workspace-checklist">
                <div
                    v-for="item in deliveryModalChecklist"
                    :key="item.label"
                    class="delivery-workspace-checklist__item"
                    :class="item.className"
                >
                    <div class="delivery-workspace-checklist__label">{{ item.label }}</div>
                    <div class="delivery-workspace-checklist__value">{{ item.value }}</div>
                    <div class="delivery-workspace-checklist__desc">{{ item.desc }}</div>
                </div>
            </div>

            <a-form :model="deliveryModal" layout="vertical">
                <a-form-item label="订单号">
                    <a-input :model-value="deliveryModal.orderSn" disabled />
                </a-form-item>
                <a-form-item label="交付状态">
                    <a-select v-model="deliveryModal.deliveryStatus">
                        <a-option :value="0">未交付</a-option>
                        <a-option :value="1">已交付</a-option>
                        <a-option :value="2">待补充</a-option>
                        <a-option :value="3">已失效</a-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="绑定域名">
                    <a-input
                        v-model="deliveryModal.licenseBoundDomain"
                        allow-clear
                        placeholder="如：uiedtool.com"
                    />
                </a-form-item>
                <a-form-item label="授权码">
                    <a-input
                        v-model="deliveryModal.licenseKey"
                        allow-clear
                        placeholder="可记录发给客户的授权码"
                    />
                </a-form-item>
                <a-form-item label="下载链接">
                    <a-input
                        v-model="deliveryModal.downloadUrl"
                        allow-clear
                        placeholder="源码包或交付文档下载地址"
                    />
                </a-form-item>
                <a-form-item label="下载检测">
                    <div class="delivery-check-inline">
                        <a-tag
                            :color="resolveDownloadCheckTagColor(deliveryModal.downloadCheckStatus)"
                            bordered
                        >
                            {{ deliveryModal.downloadCheckStatusText || '未检测' }}
                        </a-tag>
                        <span
                            v-if="deliveryModal.downloadCheckTime"
                            class="delivery-check-inline__text"
                        >
                            最近检测：{{ deliveryModal.downloadCheckTime }}
                        </span>
                    </div>
                    <div
                        v-if="deliveryModal.downloadCheckMessage"
                        class="delivery-check-inline__text mt-2"
                    >
                        {{ deliveryModal.downloadCheckMessage }}
                    </div>
                </a-form-item>
                <a-form-item label="交付时间（Unix 秒，可选）">
                    <a-input-number
                        v-model="deliveryModal.deliveredTime"
                        :min="0"
                        :step="3600"
                        mode="button"
                        class="w-full"
                    />
                </a-form-item>
                <a-form-item label="交付备注">
                    <a-textarea
                        v-model="deliveryModal.deliveryNote"
                        :auto-size="{ minRows: 2, maxRows: 4 }"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts" name="consumerOrderList">
import type { TableColumnData } from '@arco-design/web-vue'
import {
    checkOrderDownload,
    closeOrder,
    exportOrderList,
    getOrderLinkageSummary,
    getOrderList,
    reissueOrder,
    saveOrderDelivery
} from '@/api/consumer'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'

const queryParams = reactive({
    keyword: '',
    status: '',
    callbackStatus: '',
    deliveryStatus: '',
    deliveryCheckStatus: '',
    boundDomain: '',
    productType: '',
    startTime: '',
    endTime: ''
})
const reissueSubmitting = ref(false)
const deliverySubmitting = ref(false)
const exporting = ref(false)
const route = useRoute()
const router = useRouter()
const rowActionLoadingMap = reactive<Record<string, boolean>>({})
const linkageSummary = ref({
    sourceOrderCount: 0,
    abnormalCount: 0,
    okCount: 0,
    pendingDeliveryCount: 0,
    licenseInactiveCount: 0,
    domainMismatchCount: 0,
    downloadInvalidCount: 0,
    deliveryIncompleteCount: 0,
    expiredCount: 0
})
const reissueModal = reactive({
    visible: false,
    orderSn: '',
    tradeNo: '',
    payChannel: 'admin_manual',
    remark: ''
})
const deliveryModal = reactive({
    id: 0,
    visible: false,
    orderSn: '',
    deliveryStatus: 0,
    deliveryStatusText: '未交付',
    licenseBoundDomain: '',
    licenseKey: '',
    downloadUrl: '',
    deliveryCheckStatus: '',
    deliveryCheckText: '资料完整',
    systemLicenseStatusText: '',
    systemLicenseBoundDomain: '',
    downloadCheckStatus: 0,
    downloadCheckStatusText: '未检测',
    downloadCheckTime: '',
    downloadCheckMessage: '',
    deliveryNote: '',
    deliveredTime: 0
})

/**
 * 函数说明：规范化订单号，统一作为行级动作 loading 的定位 key。
 */
const normalizeOrderSn = (value: unknown) => {
    return String(value || '').trim()
}

/**
 * 函数说明：生成行级动作 loading key，避免单个订单操作冻结整张表。
 */
const getRowActionKey = (orderSn: string, action: string) => {
    return `${String(action || '').trim()}:${normalizeOrderSn(orderSn)}`
}

/**
 * 函数说明：设置指定订单行的动作 loading 状态。
 */
const setRowActionLoading = (orderSn: string, action: string, loading: boolean) => {
    const key = getRowActionKey(orderSn, action)
    if (loading) {
        rowActionLoadingMap[key] = true
        return
    }
    delete rowActionLoadingMap[key]
}

/**
 * 函数说明：判断指定订单行的动作是否处于 loading 状态。
 */
const isRowActionLoading = (orderSn: string, action: string) => {
    return Boolean(rowActionLoadingMap[getRowActionKey(orderSn, action)])
}

/**
 * 函数说明：汇总交付弹窗顶部的动作建议，让运营先知道当前这单优先修什么。
 */
const deliveryModalActionSummary = computed(() => {
    if (deliveryModal.deliveryCheckStatus === 'license_inactive') {
        return '当前订单的主要问题是授权未激活，建议先跳到授权管理页完成校验。'
    }
    if (deliveryModal.deliveryCheckStatus === 'domain_mismatch') {
        return '当前订单的主要问题是域名不匹配，建议优先核对订单域名与系统授权域名。'
    }
    if (deliveryModal.deliveryCheckStatus === 'download_invalid') {
        return '当前订单的下载链路异常，建议先检测并替换下载链接，再决定是否交付。'
    }
    if (deliveryModal.deliveryCheckStatus === 'delivery_incomplete') {
        return '当前订单资料还不完整，优先补齐域名、授权码和下载入口。'
    }
    if (deliveryModal.deliveryCheckStatus === 'expired') {
        return '当前订单已标记为失效，处理前请先确认是否需要重新交付或更换授权。'
    }
    return '当前交付资料已基本齐全，可以复核下载链路后完成保存。'
})

/**
 * 函数说明：生成交付弹窗里的资料清单块，统一展示当前这单缺哪些材料。
 */
const deliveryModalChecklist = computed(() => {
    const hasDomain = Boolean(String(deliveryModal.licenseBoundDomain || '').trim())
    const hasLicenseKey = Boolean(String(deliveryModal.licenseKey || '').trim())
    const hasDownloadUrl = Boolean(String(deliveryModal.downloadUrl || '').trim())
    return [
        {
            label: '域名资料',
            value: hasDomain ? '已填写' : '待补充',
            desc: hasDomain
                ? `当前域名：${deliveryModal.licenseBoundDomain}`
                : '源码交付通常需要绑定客户最终使用域名。',
            className: hasDomain ? 'is-ok' : 'is-warning'
        },
        {
            label: '授权码资料',
            value: hasLicenseKey ? '已填写' : '待补充',
            desc: hasLicenseKey
                ? '订单已记录授权码，可用于客户交付。'
                : '授权码为空时，客户无法直接完成授权激活。',
            className: hasLicenseKey ? 'is-ok' : 'is-warning'
        },
        {
            label: '下载链路',
            value:
                deliveryModal.downloadCheckStatus === 1
                    ? '可下载'
                    : hasDownloadUrl
                    ? '待确认'
                    : '缺下载入口',
            desc:
                deliveryModal.downloadCheckMessage ||
                (hasDownloadUrl
                    ? '建议交付前手动做一次下载检测。'
                    : '源码包或交付文档下载链接尚未填写。'),
            className:
                deliveryModal.downloadCheckStatus === 1
                    ? 'is-ok'
                    : hasDownloadUrl
                    ? ''
                    : 'is-danger'
        },
        {
            label: '系统授权',
            value: deliveryModal.systemLicenseStatusText || '未记录',
            desc: deliveryModal.systemLicenseBoundDomain
                ? `系统域名：${deliveryModal.systemLicenseBoundDomain}`
                : '当前没有读取到系统授权绑定域名。',
            className:
                deliveryModal.deliveryCheckStatus === 'license_inactive' ||
                deliveryModal.deliveryCheckStatus === 'domain_mismatch'
                    ? 'is-danger'
                    : ''
        }
    ]
})

/**
 * 函数说明：解析从授权页返回时带上的修单上下文，便于订单页直接告诉运营当前在修哪一单。
 */
const licenseRepairContext = computed(() => ({
    from: String(route.query.from || '').trim(),
    orderSn: String(route.query.orderSn || '').trim(),
    domain: String(route.query.boundDomain || route.query.domain || '').trim(),
    deliveryCheckStatus: String(route.query.deliveryCheckStatus || '').trim(),
    deliveryCheckText: String(route.query.deliveryCheckText || '').trim(),
    licenseStatusText: String(route.query.licenseStatusText || '').trim(),
    isActive:
        String(route.query.from || '').trim() === 'license' &&
        Boolean(
            String(route.query.orderSn || '').trim() ||
                String(route.query.boundDomain || route.query.domain || '').trim() ||
                String(route.query.deliveryCheckStatus || '').trim()
        )
}))

/**
 * 函数说明：统计当前已启用的筛选条件数量，用于筛选提示展示。
 */
const activeFilterCount = computed(() => {
    return [
        queryParams.keyword,
        queryParams.status,
        queryParams.callbackStatus,
        queryParams.deliveryStatus,
        queryParams.deliveryCheckStatus,
        queryParams.boundDomain,
        queryParams.productType,
        queryParams.startTime,
        queryParams.endTime
    ].reduce((count, value) => count + (String(value || '').trim() ? 1 : 0), 0)
})

/**
 * 函数说明：订单列表表格列定义，统一输出运营核心字段。
 */
const orderColumns: TableColumnData[] = [
    { title: '订单号', dataIndex: 'orderSn', width: 210 },
    { title: '用户ID', dataIndex: 'userId', width: 90 },
    { title: '用户昵称', dataIndex: 'userNickname', width: 130, ellipsis: true, tooltip: true },
    { title: '手机号', dataIndex: 'userMobile', width: 140 },
    { title: '商品类型', dataIndex: 'productTypeText', width: 110 },
    { title: '商品名称', dataIndex: 'productName', width: 150, ellipsis: true, tooltip: true },
    { title: '金额', dataIndex: 'amount', width: 100, slotName: 'amount' },
    { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
    { title: '回调状态', dataIndex: 'callbackStatus', width: 110, slotName: 'callbackStatus' },
    { title: '交易号', dataIndex: 'tradeNo', width: 190, ellipsis: true, tooltip: true },
    { title: '回调时间', dataIndex: 'callbackTime', width: 170 },
    { title: '回调错误', dataIndex: 'callbackError', width: 220, slotName: 'callbackError' },
    { title: '交付状态', dataIndex: 'deliveryStatus', width: 110, slotName: 'deliveryStatus' },
    { title: '交付校验', dataIndex: 'deliveryCheck', width: 320, slotName: 'deliveryCheck' },
    { title: '交付信息', dataIndex: 'deliveryInfo', width: 280, slotName: 'deliveryInfo' },
    { title: '会员天数', dataIndex: 'memberDays', width: 100 },
    { title: '基础积分', dataIndex: 'points', width: 100 },
    { title: '赠送积分', dataIndex: 'giftPoints', width: 100 },
    { title: '支付渠道', dataIndex: 'payChannel', width: 120 },
    { title: '支付时间', dataIndex: 'paidTime', width: 170 },
    { title: '创建时间', dataIndex: 'createTime', width: 170 },
    { title: '操作', dataIndex: 'action', width: 280, fixed: 'right', slotName: 'action' }
]

/**
 * 函数说明：为订单高密度表格提供横向滚动宽度，避免列被压缩后影响运营识别与点击。
 */
const orderTableScroll = computed(() => ({
    x: 4200
}))

/**
 * 函数说明：订单状态颜色映射，便于运营快速识别处理优先级。
 */
const resolveStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'gray'
    }
    return 'orange'
}

/**
 * 函数说明：回调状态颜色映射，便于运营快速识别回调异常订单。
 */
const resolveCallbackStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'red'
    }
    return 'orange'
}

/**
 * 函数说明：交付状态颜色映射，便于运营快速识别源码交付进度。
 */
const resolveDeliveryStatusColor = (status: number | string) => {
    const value = Number(status)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'orange'
    }
    if (value === 3) {
        return 'red'
    }
    return 'gray'
}

/**
 * 函数说明：收集订单交付链路缺失项，便于后台快速识别“已交付但资料不完整”的异常。
 */
const collectDeliveryIssues = (record: Record<string, any>) => {
    const issues = Array.isArray(record.deliveryIssues) ? record.deliveryIssues : []
    return issues.map((item) => String(item || '').trim()).filter(Boolean)
}

/**
 * 函数说明：输出后台订单交付校验标签颜色，统一运营对交付完整性的识别方式。
 */
const resolveDeliveryCheckColor = (record: Record<string, any>) => {
    const status = String(record.deliveryCheckStatus || '').trim()
    if (!status) {
        return 'gray'
    }
    if (status === 'ok') {
        return 'green'
    }
    if (status === 'expired' || status === 'license_inactive' || status === 'download_invalid') {
        return 'red'
    }
    return 'orange'
}

/**
 * 函数说明：输出后台订单交付校验文案，直接提示当前记录还缺哪一步。
 */
const resolveDeliveryCheckText = (record: Record<string, any>) => {
    if (!record.isSourceDeliveryOrder) {
        return '不参与'
    }
    return String(record.deliveryCheckText || '资料完整')
}

/**
 * 函数说明：为交付联动状态块输出卡片样式类，便于在表格中直接形成可扫读的运营块。
 */
const resolveDeliveryCheckBlockClass = (record: Record<string, any>) => {
    const status = String(record.deliveryCheckStatus || '').trim()
    if (status === 'ok') {
        return 'is-ok'
    }
    if (status === 'expired' || status === 'license_inactive' || status === 'download_invalid') {
        return 'is-danger'
    }
    return 'is-warning'
}

/**
 * 函数说明：输出下载检测标签颜色，便于运营在弹窗内直接识别链接健康度。
 */
const resolveDownloadCheckTagColor = (status: number | string) => {
    const value = Number(status || 0)
    if (value === 1) {
        return 'green'
    }
    if (value === 2) {
        return 'red'
    }
    return 'gray'
}

/**
 * 函数说明：生成 CSV 并触发浏览器下载，支持 UTF-8 BOM 防止中文乱码。
 */
const downloadAsCsv = (filename: string, rows: Array<Record<string, any>>) => {
    const headers = [
        '订单号',
        '用户ID',
        '用户昵称',
        '手机号',
        '商品类型',
        '商品名称',
        '金额',
        '状态',
        '回调状态',
        '交付状态',
        '交付校验',
        '绑定域名',
        '授权码',
        '下载链接',
        '交付时间',
        '交易号',
        '回调时间',
        '回调错误',
        '支付渠道',
        '支付时间',
        '创建时间'
    ]
    const lines = rows.map((item) => {
        return [
            item.orderSn,
            item.userId,
            item.userNickname,
            item.userMobile,
            item.productTypeText,
            item.productName,
            item.amount,
            item.statusText,
            item.callbackStatusText || '未回调',
            item.deliveryStatusText || '未交付',
            item.isSourceDeliveryOrder ? resolveDeliveryCheckText(item) : '不参与',
            item.licenseBoundDomain,
            item.licenseKeyMasked,
            item.downloadUrl,
            item.deliveredTime,
            item.tradeNo,
            item.callbackTime,
            item.callbackError,
            item.payChannel,
            item.paidTime,
            item.createTime
        ]
            .map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`)
            .join(',')
    })
    const csvText = ['\uFEFF' + headers.join(','), ...lines].join('\n')
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
}

/**
 * 函数说明：初始化订单分页查询。
 */
const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getOrderList,
    params: queryParams
})

/**
 * 函数说明：加载交付联动汇总数据，供筛选区上方运营总览卡直接显示。
 */
const loadLinkageSummary = async () => {
    try {
        const data: any = await getOrderLinkageSummary()
        linkageSummary.value = {
            sourceOrderCount: Number(data?.sourceOrderCount || 0),
            abnormalCount: Number(data?.abnormalCount || 0),
            okCount: Number(data?.okCount || 0),
            pendingDeliveryCount: Number(data?.pendingDeliveryCount || 0),
            licenseInactiveCount: Number(data?.licenseInactiveCount || 0),
            domainMismatchCount: Number(data?.domainMismatchCount || 0),
            downloadInvalidCount: Number(data?.downloadInvalidCount || 0),
            deliveryIncompleteCount: Number(data?.deliveryIncompleteCount || 0),
            expiredCount: Number(data?.expiredCount || 0)
        }
    } catch (error) {
        console.error('[consumer-order] 加载交付联动汇总失败', error)
    }
}

/**
 * 函数说明：统一刷新订单列表和联动汇总，避免页面不同区域数据不同步。
 */
const refreshOrderPage = async () => {
    await Promise.all([getLists(), loadLinkageSummary()])
}

/**
 * 函数说明：把路由里的联动筛选参数回填到订单页筛选表单，支持从授权页反向跳转。
 */
const syncFiltersFromRoute = () => {
    queryParams.keyword = String(route.query.orderSn || '').trim()
    queryParams.deliveryCheckStatus = String(route.query.deliveryCheckStatus || '').trim()
    queryParams.boundDomain = String(route.query.boundDomain || route.query.domain || '').trim()
}

/**
 * 函数说明：清理当前路由里的联动筛选参数，避免重置筛选后 URL 仍保留旧上下文。
 */
const clearRouteFilters = async () => {
    if (
        !route.query.orderSn &&
        !route.query.deliveryCheckStatus &&
        !route.query.boundDomain &&
        !route.query.domain &&
        !route.query.licenseStatusText &&
        !route.query.deliveryCheckText &&
        !route.query.from
    ) {
        return
    }
    await router.replace({
        path: route.path,
        query: {}
    })
}

/**
 * 函数说明：执行订单筛选查询。
 */
const handleSearch = async () => {
    await Promise.all([resetPage(), loadLinkageSummary()])
    feedback.msgSuccess('订单筛选条件已生效')
}

/**
 * 函数说明：重置订单筛选条件并刷新列表。
 */
const handleResetFilters = async () => {
    await clearRouteFilters()
    await Promise.all([resetParams(), loadLinkageSummary()])
    feedback.msgSuccess('订单筛选条件已重置')
}

/**
 * 函数说明：刷新当前订单列表。
 */
const handleRefresh = async () => {
    await refreshOrderPage()
    feedback.msgSuccess('订单列表已刷新')
}

/**
 * 函数说明：从联动总览卡快速带入联动状态筛选，减少运营在筛选区重复操作。
 */
const handleQuickFilterDelivery = async (status: string) => {
    queryParams.deliveryCheckStatus = String(status || '').trim()
    await Promise.all([resetPage(), loadLinkageSummary()])
}

/**
 * 函数说明：清除从授权页带回的修单上下文，恢复订单页的普通运营视图。
 */
const handleClearRepairContext = async () => {
    await clearRouteFilters()
    await Promise.all([resetParams(), loadLinkageSummary()])
    feedback.msgSuccess('已退出授权联动修复上下文')
}

/**
 * 函数说明：触发后台补单，补发会员权益或积分。
 */
const handleOpenReissue = (orderSn: string) => {
    const targetOrderSn = String(orderSn || '').trim()
    if (!targetOrderSn) {
        return
    }
    reissueModal.visible = true
    reissueModal.orderSn = targetOrderSn
    reissueModal.tradeNo = ''
    reissueModal.payChannel = 'admin_manual'
    reissueModal.remark = ''
}

/**
 * 函数说明：打开订单交付弹窗，回填当前交付状态与授权信息。
 */
const handleOpenDelivery = (record: Record<string, any>) => {
    deliveryModal.visible = true
    deliveryModal.id = Number(record.id || 0)
    deliveryModal.orderSn = String(record.orderSn || '').trim()
    deliveryModal.deliveryStatus = Number(record.deliveryStatus || 0)
    deliveryModal.deliveryStatusText = String(record.deliveryStatusText || '未交付')
    deliveryModal.licenseBoundDomain = String(record.licenseBoundDomain || '').trim()
    deliveryModal.licenseKey = String(record.licenseKey || '').trim()
    deliveryModal.downloadUrl = String(record.downloadUrl || '').trim()
    deliveryModal.deliveryCheckStatus = String(record.deliveryCheckStatus || '').trim()
    deliveryModal.deliveryCheckText = resolveDeliveryCheckText(record)
    deliveryModal.systemLicenseStatusText = String(record.systemLicenseStatusText || '').trim()
    deliveryModal.systemLicenseBoundDomain = String(record.systemLicenseBoundDomain || '').trim()
    deliveryModal.downloadCheckStatus = Number(record.downloadCheckStatus || 0)
    deliveryModal.downloadCheckStatusText = String(record.downloadCheckStatusText || '未检测')
    deliveryModal.downloadCheckTime = String(record.downloadCheckTime || '')
    deliveryModal.downloadCheckMessage = String(record.downloadCheckMessage || '')
    deliveryModal.deliveryNote = String(record.deliveryNote || '').trim()
    deliveryModal.deliveredTime = Number(record.deliveredTimeValue || 0)
}

/**
 * 函数说明：确认提交订单补单，支持补充交易号与备注，便于后续审计。
 */
const handleSubmitReissue = async () => {
    const targetOrderSn = String(reissueModal.orderSn || '').trim()
    if (!targetOrderSn) {
        feedback.msgWarning('订单号不能为空')
        return
    }
    reissueSubmitting.value = true
    try {
        await reissueOrder({
            orderSn: targetOrderSn,
            tradeNo: String(reissueModal.tradeNo || '').trim(),
            payChannel: String(reissueModal.payChannel || '').trim() || 'admin_manual',
            remark: String(reissueModal.remark || '').trim()
        })
        reissueModal.visible = false
        feedback.msgSuccess('补单成功，权益已补发')
        await refreshOrderPage()
    } finally {
        reissueSubmitting.value = false
    }
}

/**
 * 函数说明：保存订单交付信息，统一记录源码交付状态、绑定域名和下载链接。
 */
const handleSubmitDelivery = async () => {
    const targetOrderSn = String(deliveryModal.orderSn || '').trim()
    if (!targetOrderSn) {
        feedback.msgWarning('订单号不能为空')
        return
    }
    deliverySubmitting.value = true
    try {
        await saveOrderDelivery({
            orderSn: targetOrderSn,
            deliveryStatus: Number(deliveryModal.deliveryStatus || 0),
            licenseBoundDomain: String(deliveryModal.licenseBoundDomain || '').trim(),
            licenseKey: String(deliveryModal.licenseKey || '').trim(),
            downloadUrl: String(deliveryModal.downloadUrl || '').trim(),
            deliveryNote: String(deliveryModal.deliveryNote || '').trim(),
            deliveredTime: Number(deliveryModal.deliveredTime || 0)
        })
        deliveryModal.visible = false
        feedback.msgSuccess('订单交付信息已保存')
        await refreshOrderPage()
    } finally {
        deliverySubmitting.value = false
    }
}

/**
 * 函数说明：手动检测订单下载链接可访问性，并刷新列表和弹窗状态。
 */
const handleCheckDownload = async (record: Record<string, any>) => {
    const targetId = Number(record.id || deliveryModal.id || 0)
    const targetOrderSn = normalizeOrderSn(record.orderSn || deliveryModal.orderSn)
    if (targetId <= 0) {
        feedback.msgWarning('订单ID无效，无法检测下载链接')
        return
    }
    if (!targetOrderSn) {
        feedback.msgWarning('订单号无效，无法检测下载链接')
        return
    }
    setRowActionLoading(targetOrderSn, 'check_download', true)
    try {
        const data: any = await checkOrderDownload({ id: targetId })
        const latestOrder = data?.order || {}
        deliveryModal.downloadCheckStatus = Number(latestOrder.downloadCheckStatus || 0)
        deliveryModal.downloadCheckStatusText = String(
            latestOrder.downloadCheckStatusText || '未检测'
        )
        deliveryModal.downloadCheckTime = String(latestOrder.downloadCheckTime || '')
        deliveryModal.downloadCheckMessage = String(latestOrder.downloadCheckMessage || '')
        deliveryModal.deliveryCheckStatus = String(
            latestOrder.deliveryCheckStatus || deliveryModal.deliveryCheckStatus || ''
        ).trim()
        deliveryModal.deliveryCheckText = String(
            latestOrder.deliveryCheckText || deliveryModal.deliveryCheckText || '资料完整'
        )
        feedback.msgSuccess(
            deliveryModal.downloadCheckStatus === 1 ? '下载链接检测通过' : '下载链接检测已完成'
        )
        await refreshOrderPage()
    } finally {
        setRowActionLoading(targetOrderSn, 'check_download', false)
    }
}

/**
 * 函数说明：将系统授权域名快速回填到交付弹窗，减少运营在域名对齐场景下的重复录入。
 */
const handleApplySystemDomainToDelivery = () => {
    if (!deliveryModal.systemLicenseBoundDomain) {
        feedback.msgWarning('当前没有可用的系统授权域名')
        return
    }
    deliveryModal.licenseBoundDomain = deliveryModal.systemLicenseBoundDomain
    feedback.msgSuccess('已回填系统授权域名，请保存订单交付信息')
}

/**
 * 函数说明：从订单页跳转到授权管理页，并带上当前订单上下文用于快速修复授权。
 */
const handleGoLicense = async (record: Record<string, any>) => {
    await router.push({
        path: '/official_site/license',
        query: {
            from: 'order-delivery',
            orderSn: String(record.orderSn || '').trim(),
            domain: String(record.licenseBoundDomain || '').trim(),
            licenseKey: String(record.licenseKeyMasked || '').trim(),
            deliveryCheckStatus: String(record.deliveryCheckStatus || '').trim(),
            deliveryCheckText: resolveDeliveryCheckText(record),
            licenseStatusText: String(record.systemLicenseStatusText || '').trim()
        }
    })
}

/**
 * 函数说明：从订单页返回授权页，并保留当前修单上下文，避免运营在两个页面来回切换时丢失目标订单。
 */
const handleGoBackToLicense = async () => {
    if (!licenseRepairContext.value.isActive) {
        return
    }
    await router.push({
        path: '/official_site/license',
        query: {
            from: 'order-delivery',
            orderSn: licenseRepairContext.value.orderSn,
            domain: licenseRepairContext.value.domain,
            deliveryCheckStatus: licenseRepairContext.value.deliveryCheckStatus,
            deliveryCheckText: licenseRepairContext.value.deliveryCheckText,
            licenseStatusText: licenseRepairContext.value.licenseStatusText
        }
    })
}

/**
 * 函数说明：在交付弹窗内直接跳转到授权管理页，保留当前订单修复上下文。
 */
const handleGoLicenseFromDelivery = async () => {
    await router.push({
        path: '/official_site/license',
        query: {
            from: 'order-delivery',
            orderSn: String(deliveryModal.orderSn || '').trim(),
            domain: String(deliveryModal.licenseBoundDomain || '').trim(),
            licenseKey: String(deliveryModal.licenseKey || '').trim(),
            deliveryCheckStatus: String(deliveryModal.deliveryCheckStatus || '').trim(),
            deliveryCheckText: String(deliveryModal.deliveryCheckText || '').trim(),
            licenseStatusText: String(deliveryModal.systemLicenseStatusText || '').trim()
        }
    })
}

/**
 * 函数说明：关闭待支付订单，防止重复支付或脏订单积压。
 */
const handleCloseOrder = async (orderSn: string) => {
    const targetOrderSn = String(orderSn || '').trim()
    if (!targetOrderSn) {
        return
    }
    try {
        await feedback.confirm(
            `确定关闭订单「${targetOrderSn}」吗？关闭后该订单将无法继续支付，请先确认当前状态是否正确。`
        )
    } catch {
        return
    }
    setRowActionLoading(targetOrderSn, 'close', true)
    try {
        await closeOrder({ orderSn: targetOrderSn })
        feedback.msgSuccess('订单已关闭')
        await refreshOrderPage()
    } finally {
        setRowActionLoading(targetOrderSn, 'close', false)
    }
}

/**
 * 函数说明：按当前筛选条件导出订单 CSV。
 */
const handleExport = async () => {
    exporting.value = true
    try {
        const data = await exportOrderList(queryParams)
        const lists = Array.isArray(data?.lists) ? data.lists : []
        if (lists.length === 0) {
            feedback.msgWarning('暂无可导出的订单数据')
            return
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        downloadAsCsv(`uiedtool-orders-${timestamp}.csv`, lists)
        feedback.msgSuccess(`已导出 ${lists.length} 条订单`)
    } finally {
        exporting.value = false
    }
}

onActivated(() => {
    refreshOrderPage()
})

watch(
    () => route.fullPath,
    async () => {
        syncFiltersFromRoute()
        await refreshOrderPage()
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
.pro-page {
    display: flex;
    flex-direction: column;
}

.pro-page-header {
    padding: 0 0 10px;
}

.pro-card {
    border-radius: 12px;
}

.filter-result {
    margin-top: 10px;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.linkage-summary-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
}

.repair-context-block {
    display: grid;
    grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.85fr);
    gap: 16px;
}

.repair-context-block__main,
.repair-context-block__aside {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 18px;
}

.repair-context-block__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid #d8d2ff;
    background: #f3efff;
    color: #5b47d6;
    font-size: 12px;
    font-weight: 700;
}

.repair-context-block__title {
    margin-top: 12px;
    font-size: 22px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.repair-context-block__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.repair-context-block__meta {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.repair-context-block__meta-item {
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--color-fill-1, #f7f8fa);
}

.repair-context-block__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.repair-context-block__meta-item strong {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.repair-context-block__aside-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.repair-context-block__aside-text {
    margin-top: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.linkage-summary-card {
    appearance: none;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 16px;
    text-align: left;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.linkage-summary-card:hover {
    border-color: rgb(var(--primary-6));
    background: var(--color-fill-1, #f7f8fa);
}

.linkage-summary-card--danger {
    border-color: #f3d0d0;
    background: #fff8f8;
}

.linkage-summary-card__label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.linkage-summary-card__value {
    margin-top: 8px;
    font-size: 24px;
    line-height: 1;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.linkage-summary-card__desc {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.delivery-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-3, #86909c);
}

.delivery-check-popover {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-width: 320px;
    font-size: 12px;
    color: var(--color-text-2, #4e5969);
}

.delivery-check-issues {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.delivery-check-inline {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.delivery-check-inline__text {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.delivery-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(260px, 0.85fr);
    gap: 16px;
    margin-bottom: 16px;
}

.delivery-workspace__main,
.delivery-workspace__aside {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 18px;
}

.delivery-workspace__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    border: 1px solid #d8d2ff;
    background: #f3efff;
    color: #5b47d6;
    font-size: 12px;
    font-weight: 700;
}

.delivery-workspace__title {
    margin-top: 12px;
    font-size: 22px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.delivery-workspace__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.delivery-workspace__meta {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.delivery-workspace__meta-item {
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--color-fill-1, #f7f8fa);
}

.delivery-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.delivery-workspace__meta-item strong {
    display: block;
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.delivery-workspace__aside-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.delivery-workspace__aside-text {
    margin-top: 8px;
    margin-bottom: 16px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.delivery-workspace-checklist {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
}

.delivery-workspace-checklist__item {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 14px;
}

.delivery-workspace-checklist__item.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.delivery-workspace-checklist__item.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.delivery-workspace-checklist__item.is-danger {
    border-color: #f0c8c8;
    background: #fff7f7;
}

.delivery-workspace-checklist__label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.delivery-workspace-checklist__value {
    margin-top: 8px;
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.delivery-workspace-checklist__desc {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.delivery-check-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: 14px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: #fff;
}

.delivery-check-block.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.delivery-check-block.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.delivery-check-block.is-danger {
    border-color: #f0c8c8;
    background: #fff7f7;
}

.delivery-check-block__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
}

.delivery-check-block__meta-text {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.delivery-check-block__meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.delivery-check-block__meta > div,
.delivery-check-block__detail {
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.82);
}

.delivery-check-block__meta span {
    display: block;
    font-size: 11px;
    color: var(--color-text-3, #86909c);
}

.delivery-check-block__meta strong {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.delivery-check-block__detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2, #4e5969);
}

.delivery-check-block__issues {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.delivery-check-block__issue {
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid rgba(240, 170, 45, 0.18);
    background: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2, #4e5969);
}

@media (max-width: 1440px) {
    .linkage-summary-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .delivery-workspace-checklist {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 960px) {
    .linkage-summary-grid,
    .delivery-check-block__meta,
    .delivery-workspace,
    .delivery-workspace__meta,
    .delivery-workspace-checklist {
        grid-template-columns: 1fr;
    }
}
</style>
