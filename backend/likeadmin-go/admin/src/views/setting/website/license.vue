<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-03
 */
-->
<template>
    <div class="website-license pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 源码授权">
            <template #subtitle>
                管理 UIED-Tools 商业源码授权、绑定域名与 FSUIED
                授权中心激活配置。授权拦截仅作用于后台受保护接口，不影响前台工具页面与静态访问。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag :color="statusTagColor" bordered>{{ statusText }}</a-tag>
                        <a-tag :color="formData.enforce === 1 ? 'orange' : 'green'" bordered>
                            {{ formData.enforce === 1 ? '已开启强制拦截' : '未开启拦截' }}
                        </a-tag>
                    </div>
                    <a-button size="small" @click="getData">刷新配置</a-button>
                    <a-button size="small" :loading="isVerifying" @click="handleVerify()"
                        >立即校验</a-button
                    >
                </div>
            </template>
        </a-page-header>

        <a-card class="setting-card pro-panel-card" :bordered="false">

            <a-alert
                v-if="sourceOrderContext.isActive"
                class="mt-4 source-order-alert"
                type="info"
                show-icon
            >
                <template #title>
                    {{
                        sourceOrderContext.orderSn
                            ? `当前正在修复订单 ${sourceOrderContext.orderSn}`
                            : '来自订单交付页的修复上下文'
                    }}
                </template>
                <div class="source-context-panel">
                    <div class="source-context-panel__meta">
                        <div class="source-context-panel__item">
                            <span>订单域名</span>
                            <strong>{{ sourceOrderContext.domain || '-' }}</strong>
                        </div>
                        <div class="source-context-panel__item">
                            <span>订单授权码</span>
                            <strong>{{ sourceOrderContext.licenseKey || '-' }}</strong>
                        </div>
                        <div class="source-context-panel__item">
                            <span>联动状态</span>
                            <strong>{{ sourceOrderContext.deliveryCheckText || '未指定' }}</strong>
                        </div>
                        <div class="source-context-panel__item">
                            <span>系统授权状态</span>
                            <strong>{{
                                sourceOrderContext.licenseStatusText || statusText
                            }}</strong>
                        </div>
                    </div>
                    <div class="source-context-panel__tips">
                        <div
                            v-for="tip in sourceOrderActionTips"
                            :key="tip"
                            class="source-context-panel__tip"
                        >
                            {{ tip }}
                        </div>
                    </div>
                </div>
                <template #action>
                    <a-space direction="vertical" fill>
                        <a-button
                            v-if="sourceOrderContext.domain"
                            size="mini"
                            type="primary"
                            @click="handleApplySourceDomain"
                        >
                            使用订单域名
                        </a-button>
                        <a-button size="mini" type="outline" @click="handleBackToOrders()"
                            >返回订单页</a-button
                        >
                        <a-button size="mini" @click="handleClearSourceOrderContext"
                            >清除上下文</a-button
                        >
                    </a-space>
                </template>
            </a-alert>


            <operate-collapse
                v-model="operationCollapseKeys"
                :validation-tips="licenseValidationTips"
                :guide-items="guideItems"
                :last-saved-at="lastSavedAt"
                :show-quick-actions="false"
            />

            <div class="mode-toolbar mt-4">
                <div class="mode-toolbar__left">
                    <a-switch v-model="simpleMode" type="round" />
                    <span class="mode-toolbar__label">{{
                        simpleMode ? '运营简版（推荐）' : '高级模式'
                    }}</span>
                </div>
                <span class="mode-toolbar__tip">
                    {{
                        simpleMode
                            ? '简版聚焦授权录入与校验。状态明细面板和交付异常快捷卡已收进高级模式。'
                            : '高级模式会展示授权状态明细、交付异常分组与更完整的联动排查信息。'
                    }}
                </span>
            </div>

            <a-alert class="mt-4" type="warning" show-icon>
                开启“强制授权拦截”后，仅会拦截后台受保护接口，不影响前台页面访问。请先完成授权校验并确认状态为“已授权”，再决定是否开启。
            </a-alert>

            <div v-if="!simpleMode" class="license-stat-grid mt-4">
                <div
                    v-for="item in licenseOverviewCards"
                    :key="item.label"
                    class="license-stat-card"
                >
                    <div class="license-stat-card__label">{{ item.label }}</div>
                    <div
                        class="license-stat-card__value"
                        :class="{ 'license-stat-card__value--small': item.compact }"
                    >
                        {{ item.value }}
                    </div>
                    <div class="license-stat-card__desc">{{ item.desc }}</div>
                </div>
            </div>

            <a-card v-if="!simpleMode" class="setting-card mt-4" :bordered="false">
                <div class="quick-links-header">
                    <div>
                        <div class="section-title section-title--small">交付联动修复入口</div>
                        <div class="section-subtitle">
                            直接按异常类型进入订单页处理，不用在列表里重复组合筛选。
                        </div>
                    </div>
                </div>
                <div class="license-action-grid mt-4">
                    <button
                        v-for="item in licenseQuickActionCards"
                        :key="item.key"
                        type="button"
                        class="license-action-card"
                        :class="item.className"
                        @click="handleGoOrdersByStatus(item.status)"
                    >
                        <div class="license-action-card__label">{{ item.label }}</div>
                        <div class="license-action-card__value">{{ item.count }}</div>
                        <div class="license-action-card__desc">{{ item.desc }}</div>
                    </button>
                </div>
            </a-card>

            <a-collapse
                v-model:active-key="sectionCollapseKeys"
                class="section-collapse mt-4"
                :bordered="false"
            >
                <a-collapse-item key="license_base" header="授权信息">
                    <a-form :model="formData" layout="vertical" class="setting-form">
                        <a-form-item field="licenseKey" label="授权码">
                            <a-input
                                v-model="formData.licenseKey"
                                allow-clear
                                placeholder="请输入 fsuied 下发的商业授权码"
                                :max-length="255"
                            />
                        </a-form-item>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item field="productCode" label="产品编码">
                                    <a-input
                                        v-model="formData.productCode"
                                        allow-clear
                                        placeholder="默认 uied-tools"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item field="customerName" label="客户名称">
                                    <a-input
                                        v-model="formData.customerName"
                                        allow-clear
                                        placeholder="如：某某科技有限公司"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="8">
                                <a-form-item field="contactName" label="联系人">
                                    <a-input
                                        v-model="formData.contactName"
                                        allow-clear
                                        placeholder="联系人姓名"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="8">
                                <a-form-item field="contactMobile" label="联系电话">
                                    <a-input
                                        v-model="formData.contactMobile"
                                        allow-clear
                                        placeholder="手机号/座机"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="8">
                                <a-form-item field="contactEmail" label="联系邮箱">
                                    <a-input
                                        v-model="formData.contactEmail"
                                        allow-clear
                                        placeholder="xxx@example.com"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item field="boundDomain" label="绑定域名（必填）">
                                    <a-input
                                        v-model="formData.boundDomain"
                                        allow-clear
                                        placeholder="如：uiedtool.com"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item field="machineCode" label="机器码">
                                    <a-input
                                        v-model="formData.machineCode"
                                        allow-clear
                                        placeholder="服务器机器标识（可选）"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-form-item field="expireTime" label="授权到期时间（Unix 秒）">
                            <div class="expire-row">
                                <a-input-number
                                    v-model="formData.expireTime"
                                    :min="0"
                                    :step="3600"
                                    mode="button"
                                    placeholder="0 表示长期有效"
                                    class="expire-input"
                                />
                                <a-space>
                                    <a-button size="small" @click="setExpireDays(30)"
                                        >+30天</a-button
                                    >
                                    <a-button size="small" @click="setExpireDays(90)"
                                        >+90天</a-button
                                    >
                                    <a-button size="small" @click="setExpireDays(365)"
                                        >+365天</a-button
                                    >
                                    <a-button size="small" @click="setExpireDays(0)">长期</a-button>
                                </a-space>
                            </div>
                            <div class="form-tips">到期时间：{{ expireTimeText }}</div>
                        </a-form-item>
                        <a-form-item field="remark" label="备注">
                            <a-textarea
                                v-model="formData.remark"
                                :auto-size="{ minRows: 2, maxRows: 5 }"
                                placeholder="可记录授权来源、合同编号等内部备注"
                            />
                        </a-form-item>
                    </a-form>
                </a-collapse-item>

                <a-collapse-item key="license_verify" header="校验与拦截">
                    <a-form :model="formData" layout="vertical" class="setting-form">
                        <a-form-item field="enforce" label="强制授权拦截">
                            <a-switch
                                :model-value="formData.enforce === 1"
                                checked-text="开启"
                                unchecked-text="关闭"
                                @change="handleEnforceChange"
                            />
                            <div class="form-tips">
                                关闭：仅记录授权状态，不拦截接口。开启：未授权时仅拦截后台受保护接口，前台站点仍可访问。
                            </div>
                        </a-form-item>
                        <a-form-item field="verifyApiUrl" label="授权中心激活地址">
                            <a-input
                                v-model="formData.verifyApiUrl"
                                allow-clear
                                placeholder="如：https://fsuied.com/api/license/detail"
                            />
                        </a-form-item>
                        <a-row :gutter="16">
                            <a-col :span="12">
                                <a-form-item field="verifyApiMethod" label="授权中心调用方法">
                                    <a-select
                                        v-model="formData.verifyApiMethod"
                                        :options="verifyMethodOptions"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :span="12">
                                <a-form-item field="verifyApiTimeout" label="授权中心超时（毫秒）">
                                    <a-input-number
                                        v-model="formData.verifyApiTimeout"
                                        :min="1000"
                                        :max="60000"
                                        :step="1000"
                                        mode="button"
                                        class="expire-input"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                        <a-form-item field="verifyApiAllowInsecureTls" label="允许跳过 TLS 校验">
                            <a-switch
                                :model-value="formData.verifyApiAllowInsecureTls === 1"
                                checked-text="开启"
                                unchecked-text="关闭"
                                @change="handleVerifyApiAllowInsecureTlsChange"
                            />
                            <div class="form-tips">
                                仅建议本地联调临时开启。生产环境应保持关闭。
                            </div>
                        </a-form-item>
                        <a-form-item field="verifyApiToken" label="授权中心 Bearer Token">
                            <a-input-password
                                v-model="formData.verifyApiToken"
                                allow-clear
                                placeholder="用于请求 FSUIED 授权中心（可选）"
                            />
                        </a-form-item>
                        <a-form-item field="apiSignSecret" label="接口签名密钥">
                            <a-input-password
                                v-model="formData.apiSignSecret"
                                allow-clear
                                placeholder="用于生成 x-license-signature（建议配置）"
                            />
                        </a-form-item>
                    </a-form>
                </a-collapse-item>

                <a-collapse-item v-if="!simpleMode" key="license_status" header="当前状态">
                    <a-descriptions :column="2" bordered size="large">
                        <a-descriptions-item label="授权状态">
                            <a-tag :color="statusTagColor" bordered>{{ statusText }}</a-tag>
                        </a-descriptions-item>
                        <a-descriptions-item label="最近校验时间">{{
                            lastVerifyTimeText
                        }}</a-descriptions-item>
                        <a-descriptions-item label="授权到期时间">{{
                            expireTimeText
                        }}</a-descriptions-item>
                        <a-descriptions-item label="授权码（脱敏）">{{
                            licenseKeyMasked || '-'
                        }}</a-descriptions-item>
                        <a-descriptions-item label="授权版本">{{
                            licenseEditionText
                        }}</a-descriptions-item>
                        <a-descriptions-item label="项目编码">{{
                            formData.productCode || '-'
                        }}</a-descriptions-item>
                        <a-descriptions-item label="签名状态">
                            <a-tag :color="isSignatureValid ? 'green' : 'red'" bordered>
                                {{ isSignatureValid ? '签名有效' : '签名未确认' }}
                            </a-tag>
                        </a-descriptions-item>
                    </a-descriptions>
                    <a-form-item class="mt-4" label="最近校验结果">
                        <a-textarea
                            v-model="lastVerifyMessage"
                            readonly
                            :auto-size="{ minRows: 2, maxRows: 4 }"
                            placeholder="-"
                        />
                    </a-form-item>
                    <a-form-item label="最近校验原始载荷">
                        <a-textarea
                            v-model="lastVerifyPayload"
                            readonly
                            :auto-size="{ minRows: 4, maxRows: 10 }"
                            placeholder="-"
                        />
                    </a-form-item>
                </a-collapse-item>
            </a-collapse>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:license:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteLicense">
import { getOrderLinkageSummary } from '@/api/consumer'
import {
    getLicenseDetail,
    saveLicenseDetail,
    verifyLicense,
    type LicenseSettingPayload
} from '@/api/setting/license'
import feedback from '@/utils/feedback'
import OperateCollapse from './components/operate-collapse.vue'
import { useOperateSubmit } from './composables/use-operate-submit'

const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('授权配置已保存')
const isVerifying = ref(false)
const isSignatureValid = ref(false)
const licenseEdition = ref('free')
/**
 * 函数说明：控制授权管理页运营模式。简版聚焦授权录入与校验，高级模式展示交付联动排查。
 */
const simpleMode = ref(true)
const route = useRoute()
const router = useRouter()
const verifyMethodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' }
]
const operationCollapseKeys = ref<(string | number)[]>([
    'quick_actions',
    'validation_tips',
    'operation_guide'
])
const sectionCollapseKeys = ref<(string | number)[]>(['license_base', 'license_verify'])
const simpleSectionCollapseKeys: (string | number)[] = ['license_base', 'license_verify']
const advancedSectionCollapseKeys: (string | number)[] = [
    'license_base',
    'license_verify',
    'license_status'
]

const guideItems = [
    '先录入授权码、项目编码、绑定域名，再保存配置。',
    '如果授权中心启用了请求签名，请同步填写接口签名密钥；如有 Bearer Token，也一并填写。',
    '点击“立即校验”确认授权状态，状态显示“已授权”后再考虑开启强制拦截。',
    '确认无误后再开启“强制授权拦截”，避免误拦截线上请求。'
]

const formData = reactive<LicenseSettingPayload>({
    licenseKey: '',
    customerName: '',
    contactName: '',
    contactMobile: '',
    contactEmail: '',
    productCode: 'uied-tools',
    boundDomain: '',
    machineCode: '',
    expireTime: 0,
    remark: '',
    enforce: 0,
    verifyApiUrl: 'https://fsuied.com/api/license/detail',
    verifyApiToken: '',
    verifyApiMethod: 'GET',
    verifyApiTimeout: 10000,
    verifyApiAllowInsecureTls: 0,
    apiSignSecret: ''
})

const licenseStatus = ref(0)
const statusText = ref('未激活')
const licenseKeyMasked = ref('')
const lastVerifyTimeText = ref('-')
const lastVerifyMessage = ref('')
const lastVerifyPayload = ref('')
const deliveryStats = reactive({
    sourceOrderCount: 0,
    abnormalCount: 0,
    licenseInactiveCount: 0,
    domainMismatchCount: 0,
    downloadInvalidCount: 0
})

/**
 * 函数说明：读取路由里的订单上下文，便于从订单交付页跳转后快速修复授权。
 */
const sourceOrderContext = computed(() => ({
    from: String(route.query.from || '').trim(),
    orderSn: String(route.query.orderSn || '').trim(),
    domain: String(route.query.domain || '').trim(),
    licenseKey: String(route.query.licenseKey || '').trim(),
    deliveryCheckStatus: String(route.query.deliveryCheckStatus || '').trim(),
    deliveryCheckText: String(route.query.deliveryCheckText || '').trim(),
    licenseStatusText: String(route.query.licenseStatusText || '').trim(),
    isActive:
        String(route.query.from || '').trim() === 'order-delivery' &&
        Boolean(
            String(route.query.orderSn || '').trim() ||
                String(route.query.domain || '').trim() ||
                String(route.query.deliveryCheckStatus || '').trim()
        )
}))

/**
 * 函数说明：运营模式切换时同步授权分组展开项，避免简版保留高级分组 key。
 */
watch(
    () => simpleMode.value,
    (isSimpleMode) => {
        sectionCollapseKeys.value = isSimpleMode
            ? [...simpleSectionCollapseKeys]
            : [...advancedSectionCollapseKeys]
    },
    { immediate: true }
)

/**
 * 函数说明：生成订单来源修复提示，帮助运营明确当前进入授权页后优先该做什么。
 */
const sourceOrderActionTips = computed(() => {
    const tips: string[] = []
    if (sourceOrderContext.value.domain) {
        tips.push('先核对订单绑定域名和系统授权绑定域名是否一致。')
    }
    if (sourceOrderContext.value.deliveryCheckStatus === 'license_inactive') {
        tips.push('当前订单问题是“已交付但授权未激活”，请先执行一次授权校验。')
    }
    if (sourceOrderContext.value.deliveryCheckStatus === 'domain_mismatch') {
        tips.push('当前订单问题是“域名不匹配”，优先检查绑定域名填写是否正确。')
    }
    if (sourceOrderContext.value.deliveryCheckStatus === 'download_invalid') {
        tips.push('当前订单还有下载异常，授权校验完成后请回订单页重新检测下载链接。')
    }
    if (tips.length === 0) {
        tips.push('先确认授权码、绑定域名和当前系统授权状态，再决定是否开启后台拦截。')
    }
    return tips
})

/**
 * 函数说明：输出授权版本可读文案，避免后台直接展示底层枚举值。
 */
const licenseEditionText = computed(() => {
    switch (
        String(licenseEdition.value || '')
            .trim()
            .toLowerCase()
    ) {
        case 'enterprise':
            return '企业版'
        case 'pro':
            return '专业版'
        default:
            return '免费版'
    }
})

/**
 * 函数说明：计算授权到期可读时间，便于运营快速确认授权时效。
 */
const expireTimeText = computed(() => {
    if (!formData.expireTime || formData.expireTime <= 0) {
        return '长期有效'
    }
    const date = new Date(formData.expireTime * 1000)
    if (Number.isNaN(date.getTime())) {
        return '-'
    }
    return date.toLocaleString('zh-CN', { hour12: false })
})

/**
 * 函数说明：根据授权状态输出标签颜色，统一状态反馈样式。
 */
const statusTagColor = computed(() => {
    switch (licenseStatus.value) {
        case 1:
            return 'green'
        case 2:
            return 'orange'
        case 3:
            return 'red'
        default:
            return 'gray'
    }
})/**
 * 函数说明：生成授权页总览卡片数据，统一展示授权状态、域名、校验时间与交付异常。
 */
const licenseOverviewCards = computed(() => {
    return [
        {
            label: '当前授权状态',
            value: statusText.value,
            desc:
                licenseStatus.value === 1
                    ? '系统已允许后台受保护接口继续访问'
                    : '未授权时仅建议保留为记录模式',
            compact: false
        },
        {
            label: '绑定域名',
            value: formData.boundDomain || '-',
            desc: '运行时会按当前访问域名和这里的绑定域名做比对',
            compact: true
        },
        {
            label: '最近校验时间',
            value: lastVerifyTimeText.value,
            desc: '最近一次人工触发或强制远程校验的时间',
            compact: true
        },
        {
            label: '交付异常订单',
            value: String(deliveryStats.abnormalCount),
            desc: `共 ${deliveryStats.sourceOrderCount} 条源码交付订单参与授权联动`,
            compact: false
        }
    ]
})

/**
 * 函数说明：生成授权页异常订单快捷入口卡片，统一输出计数与说明文案。
 */
const licenseQuickActionCards = computed(() => {
    return [
        {
            key: 'abnormal',
            status: 'abnormal',
            label: '全部异常订单',
            count: deliveryStats.abnormalCount,
            desc: '先集中看所有需要人工处理的源码交付订单。',
            className: 'is-danger'
        },
        {
            key: 'license_inactive',
            status: 'license_inactive',
            label: '已交付但未激活',
            count: deliveryStats.licenseInactiveCount,
            desc: '源码已交付，但系统授权还没进入可用状态。',
            className: ''
        },
        {
            key: 'domain_mismatch',
            status: 'domain_mismatch',
            label: '域名不匹配',
            count: deliveryStats.domainMismatchCount,
            desc: '订单域名和当前系统绑定域名不一致。',
            className: ''
        },
        {
            key: 'download_invalid',
            status: 'download_invalid',
            label: '下载异常',
            count: deliveryStats.downloadInvalidCount,
            desc: '下载链接最近检测失败，需要重新生成或替换。',
            className: ''
        }
    ]
})/**
 * 函数说明：授权配置表单校验提示，减少无效保存与误开启拦截风险。
 */
const licenseValidationTips = computed<string[]>(() => {
    const tips: string[] = []
    if (!String(formData.licenseKey || '').trim()) {
        tips.push('请先填写授权码。')
    }
    if (!String(formData.productCode || '').trim()) {
        tips.push('请填写项目编码（默认 uied-tools）。')
    }
    if (!String(formData.boundDomain || '').trim()) {
        tips.push('请填写绑定域名，商业授权按域名绑定校验。')
    }
    if (!String(formData.apiSignSecret || '').trim()) {
        tips.push('如授权中心已开启 HMAC 机器签名，请填写接口签名密钥。')
    }
    if (formData.enforce === 1 && licenseStatus.value !== 1) {
        tips.push('当前状态不是“已授权”，不建议开启强制拦截。')
    }
    return tips
})

/**
 * 函数说明：切换强制拦截开关并同步到数值字段。
 */
const handleEnforceChange = (checked: string | number | boolean) => {
    formData.enforce = checked ? 1 : 0
}

/**
 * 函数说明：切换“允许跳过 TLS 校验”开关并同步到数值字段。
 */
const handleVerifyApiAllowInsecureTlsChange = (value: string | number | boolean) => {
    formData.verifyApiAllowInsecureTls = value ? 1 : 0
}

/**
 * 函数说明：快捷设置授权时长（天），用于快速生成到期时间。
 */
const setExpireDays = (days: number) => {
    if (days <= 0) {
        formData.expireTime = 0
        return
    }
    formData.expireTime = Math.floor(Date.now() / 1000) + days * 24 * 60 * 60
}

/**
 * 函数说明：当授权配置尚未填写绑定域名时，自动借用来源订单域名预填，减少运营重复录入。
 */
const applySourceDomainIfNeeded = () => {
    if (!sourceOrderContext.value.domain || String(formData.boundDomain || '').trim()) {
        return
    }
    formData.boundDomain = sourceOrderContext.value.domain
}

/**
 * 函数说明：读取授权详情并回填表单和状态信息。
 */
const getData = async () => {
    const data: any = await getLicenseDetail()
    formData.licenseKey = String(data?.licenseKey || '')
    formData.customerName = String(data?.customerName || '')
    formData.contactName = String(data?.contactName || '')
    formData.contactMobile = String(data?.contactMobile || '')
    formData.contactEmail = String(data?.contactEmail || '')
    formData.productCode = String(data?.productCode || 'uied-tools')
    formData.boundDomain = String(data?.boundDomain || '')
    formData.machineCode = String(data?.machineCode || '')
    formData.expireTime = Number(data?.expireTime || 0)
    formData.remark = String(data?.remark || '')
    formData.enforce = Number(data?.enforce || 0) === 1 ? 1 : 0
    formData.verifyApiUrl = String(data?.verifyApiUrl || 'https://fsuied.com/api/license/detail')
    formData.verifyApiToken = String(data?.verifyApiToken || '')
    formData.verifyApiMethod = String(data?.verifyApiMethod || 'GET')
    formData.verifyApiTimeout = Number(data?.verifyApiTimeout || 10000)
    formData.verifyApiAllowInsecureTls = Number(data?.verifyApiAllowInsecureTls || 0) === 1 ? 1 : 0
    formData.apiSignSecret = String(data?.apiSignSecret || '')

    licenseStatus.value = Number(data?.status || 0)
    statusText.value = String(data?.statusText || '未激活')
    licenseKeyMasked.value = String(data?.licenseKeyMasked || '')
    licenseEdition.value = String(data?.edition || 'free')
    isSignatureValid.value = Boolean(data?.isSignatureValid)
    lastVerifyTimeText.value = String(data?.lastVerifyTimeText || '-')
    lastVerifyMessage.value = String(data?.lastVerifyMessage || '')
    lastVerifyPayload.value = String(data?.lastVerifyPayload || '')
    applySourceDomainIfNeeded()
    await loadDeliveryStats()
}

/**
 * 函数说明：读取订单交付联动统计，供授权页顶部状态卡与快捷入口展示。
 */
const loadDeliveryStats = async () => {
    try {
        const data: any = await getOrderLinkageSummary()
        deliveryStats.sourceOrderCount = Number(data?.sourceOrderCount || 0)
        deliveryStats.abnormalCount = Number(data?.abnormalCount || 0)
        deliveryStats.licenseInactiveCount = Number(data?.licenseInactiveCount || 0)
        deliveryStats.domainMismatchCount = Number(data?.domainMismatchCount || 0)
        deliveryStats.downloadInvalidCount = Number(data?.downloadInvalidCount || 0)
    } catch (error) {
        console.warn('[license] load delivery stats failed', error)
    }
}

/**
 * 函数说明：保存授权配置，保存后自动刷新页面状态。
 */
const handleSubmit = async () => {
    if (formData.licenseKey.trim() && !formData.boundDomain.trim()) {
        feedback.msgError('请先填写绑定域名后再保存授权配置')
        return
    }
    await runSubmit(async () => {
        await saveLicenseDetail({ ...formData })
        await getData()
    })
}

/**
 * 函数说明：执行授权校验（普通/强制远程）并刷新状态。
 */
const handleVerify = async (forceRemote = 0) => {
    if (isVerifying.value) {
        return
    }
    if (!formData.licenseKey.trim()) {
        feedback.msgError('请先填写授权码后再执行校验')
        return
    }
    if (!formData.boundDomain.trim()) {
        feedback.msgError('请先填写绑定域名后再执行校验')
        return
    }
    isVerifying.value = true
    try {
        const data: any = await verifyLicense({ forceRemote })
        feedback.msgSuccess(String(data?.message || '授权校验完成'))
        await getData()
    } finally {
        isVerifying.value = false
    }
}

/**
 * 函数说明：使用来源订单的域名覆盖当前表单绑定域名，便于直接修复“域名不匹配”问题。
 */
const handleApplySourceDomain = () => {
    if (!sourceOrderContext.value.domain) {
        feedback.msgWarning('当前订单没有携带绑定域名')
        return
    }
    formData.boundDomain = sourceOrderContext.value.domain
    feedback.msgSuccess('已将订单域名带入当前授权表单，请保存后再执行校验')
}

/**
 * 函数说明：跳转到订单管理页，并带上联动筛选条件，便于从授权页直接修复异常订单。
 */
const handleGoOrdersByStatus = async (deliveryCheckStatus: string) => {
    await router.push({
        path: '/consumer/order',
        query: {
            from: 'license',
            deliveryCheckStatus,
            boundDomain: String(formData.boundDomain || '').trim()
        }
    })
}

/**
 * 函数说明：从授权页返回订单管理页，保留来源订单的域名信息用于继续修复。
 */
const handleBackToOrders = async () => {
    await router.push({
        path: '/consumer/order',
        query: {
            from: 'license',
            orderSn: sourceOrderContext.value.orderSn,
            boundDomain:
                sourceOrderContext.value.domain || String(formData.boundDomain || '').trim(),
            deliveryCheckStatus: sourceOrderContext.value.deliveryCheckStatus || 'abnormal',
            deliveryCheckText: sourceOrderContext.value.deliveryCheckText,
            licenseStatusText: statusText.value
        }
    })
}

/**
 * 函数说明：清理来源订单上下文，恢复授权页普通配置视图。
 */
const handleClearSourceOrderContext = async () => {
    await router.replace({
        path: route.path,
        query: {}
    })
    feedback.msgSuccess('已清除订单修复上下文')
}

void getData()
</script>

<style lang="scss" scoped>
.website-license {
    padding-bottom: 24px;

    .layout-page-header {
        margin-bottom: 16px;
        padding: 0 4px;
    }

    .layout-page-actions,
    .layout-status-tags {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .layout-page-actions {
        justify-content: flex-end;
        gap: 10px;
    }

    .layout-status-tags {
        gap: 8px;
    }

    .setting-card {
        border: 1px solid var(--color-border-2);
        border-radius: 16px;
    }

    .source-order-alert {
        border-radius: 12px;
    }

    .context-lines {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: var(--color-text-2);
    }

    .source-context-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .source-context-panel__meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .source-context-panel__item {
        padding: 12px;
        border-radius: 12px;
        background: rgba(var(--primary-1), 0.35);
    }

    .source-context-panel__item span {
        display: block;
        font-size: 12px;
        color: var(--color-text-3);
    }

    .source-context-panel__item strong {
        display: block;
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-1);
        word-break: break-all;
    }

    .source-context-panel__tips {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .source-context-panel__tip {
        padding: 10px 12px;
        border-radius: 10px;
        background: #fff;
        border: 1px dashed #c9d8ff;
        color: var(--color-text-2);
        font-size: 13px;
        line-height: 1.6;
    }

    .license-overview,
    .ops-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.85fr);
        gap: 12px;
    }

    .license-overview__main,
    .license-overview__aside,
    .ops-workspace__main,
    .ops-workspace__aside {
        border: 1px solid var(--color-border-2);
        border-radius: 14px;
        background: #fff;
        padding: 16px;
    }

    .license-overview__eyebrow,
    .ops-workspace__eyebrow {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 9px;
        border-radius: 999px;
        border: 1px solid #d8d2ff;
        background: #f3efff;
        color: #5b47d6;
        font-size: 12px;
        font-weight: 700;
    }

    .license-overview__title,
    .ops-workspace__title {
        margin-top: 10px;
        font-size: 20px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--color-text-1);
    }

    .license-overview__desc,
    .ops-workspace__desc {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.65;
        color: var(--color-text-3);
    }

    .license-overview__meta,
    .ops-workspace__meta {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }

    .license-overview__meta-item,
    .ops-workspace__meta-item {
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--color-fill-1, #f7f8fa);
    }

    .license-overview__meta-item span,
    .ops-workspace__meta-item span {
        display: block;
        font-size: 12px;
        color: var(--color-text-3);
    }

    .license-overview__meta-item strong,
    .ops-workspace__meta-item strong {
        display: block;
        margin-top: 4px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--color-text-1);
        word-break: break-all;
    }

    .license-overview__aside-title,
    .ops-workspace__aside-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-1);
    }

    .license-overview__aside-text {
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-text-3);
    }

    .license-overview__checklist,
    .ops-workspace__checklist {
        margin-top: 14px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;
    }

    .license-overview__checklist-item,
    .ops-workspace__checklist-item {
        border: 1px solid var(--color-border-2);
        border-radius: 10px;
        background: var(--color-fill-1, #f7f8fa);
        padding: 10px 12px;
    }

    .license-overview__checklist-item.is-ok {
        border-color: #d7ebde;
        background: #f7fcf8;
    }

    .license-overview__checklist-item.is-warning {
        border-color: #f0dfb0;
        background: #fffaf0;
    }

    .license-overview__checklist-item.is-danger {
        border-color: #f0c8c8;
        background: #fff7f7;
    }

    .license-overview__checklist-label,
    .ops-workspace__checklist-label {
        font-size: 12px;
        color: var(--color-text-3);
    }

    .license-overview__checklist-value,
    .ops-workspace__checklist-value {
        margin-top: 4px;
        font-size: 15px;
        line-height: 1.4;
        font-weight: 700;
        color: var(--color-text-1);
        word-break: break-all;
    }

    .license-overview__checklist-desc,
    .ops-workspace__checklist-desc {
        margin-top: 4px;
        font-size: 12px;
        line-height: 1.55;
        color: var(--color-text-3);
    }

    .license-overview__actions,
    .ops-workspace__actions {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .mode-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 10px 12px;
        border: 1px dashed var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: var(--color-fill-1, #f7f8fa);
    }

    .mode-toolbar__left {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .mode-toolbar__label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .mode-toolbar__tip {
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .mode-alert {
        margin-bottom: 0;
    }

    .license-stat-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
    }

    .license-stat-card {
        border: 1px solid var(--color-border-2);
        border-radius: 10px;
    }

    .license-stat-card__label {
        font-size: 12px;
        color: var(--color-text-3);
    }

    .license-stat-card__value {
        margin-top: 8px;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-text-1);
        line-height: 1.4;
        word-break: break-all;
    }

    .license-stat-card__value--small {
        font-size: 14px;
    }

    .license-stat-card__desc {
        margin-top: 8px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3);
    }

    .quick-links-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
    }

    .section-title--small {
        font-size: 16px;
    }

    .license-action-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
    }

    .license-action-card {
        appearance: none;
        border: 1px solid var(--color-border-2);
        border-radius: 14px;
        background: #fff;
        padding: 16px;
        text-align: left;
        cursor: pointer;
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }

    .license-action-card:hover {
        border-color: rgb(var(--primary-6));
        background: var(--color-fill-1, #f7f8fa);
    }

    .license-action-card.is-danger {
        border-color: #f3d0d0;
        background: #fff8f8;
    }

    .license-action-card__label {
        font-size: 12px;
        color: var(--color-text-3);
    }

    .license-action-card__value {
        margin-top: 8px;
        font-size: 24px;
        line-height: 1;
        font-weight: 700;
        color: var(--color-text-1);
    }

    .license-action-card__desc {
        margin-top: 8px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3);
    }

    .expire-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .expire-input {
        width: 280px;
        min-width: 220px;
    }

    .form-tips {
        background: var(--color-fill-1, #f7f8fa);
        border-radius: 10px;
        border: 1px dashed var(--color-border-2, #e5e6eb);
        padding: 10px 12px;
        margin-top: 6px;
        color: var(--color-text-3);
        font-size: 12px;
    }

    @media (max-width: 960px) {
        .license-overview,
        .license-action-grid,
        .ops-workspace,
        .license-overview__meta,
        .ops-workspace__meta {
            grid-template-columns: 1fr;
        }

        .license-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
}
</style>
