<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="login-register pro-page-shell">
        <admin-page-header class="layout-page-header" title="用户登录与商业化">
            <template #subtitle>统一管理前台登录、工具积分、会员权益和支付渠道。</template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag
                            :color="formData.frontendLoginEnabled === 1 ? 'green' : 'orange'"
                            bordered
                        >
                            {{ formData.frontendLoginEnabled === 1 ? '登录已开启' : '免登录模式' }}
                        </a-tag>
                        <a-tag :color="formData.memberEnabled === 1 ? 'green' : 'gray'" bordered>
                            {{ formData.memberEnabled === 1 ? '会员已开启' : '会员未开启' }}
                        </a-tag>
                    </div>
                    <a-button
                        size="small"
                        data-admin-smoke="login-register-reload"
                        :disabled="isSubmitting || isLoadingData || syncWechatCertLoading"
                        @click="reloadLoginConfig"
                    >
                        重新加载
                    </a-button>
                </div>
            </template>
        </admin-page-header>

        <config-edit-frame
            :loading="isLoadingData"
            :ready="hasLoadedData"
            :error="loadErrorMessage"
            :save-error="submitError"
            :dirty="hasUnsavedChanges"
            :saving="isSubmitting"
            :saved-at="lastSavedAt"
            @retry="reloadLoginConfig"
        >
            <a-card class="login-section-nav page-card pro-panel-card" :bordered="false">
                <a-tabs v-model:active-key="activeSection" type="rounded">
                    <a-tab-pane key="access" title="访问与登录" />
                    <a-tab-pane key="billing" title="积分与会员" />
                    <a-tab-pane key="payment" title="支付接入" />
                </a-tabs>
                <div class="login-section-nav__tip">
                    {{ activeSectionTip }}
                </div>
            </a-card>

            <a-form :model="formData" layout="vertical">
                <access-settings-panel v-if="activeSection === 'access'" :form-data="formData" />
                <billing-settings-panel
                    v-else-if="activeSection === 'billing'"
                    :form-data="formData"
                />
                <payment-settings-panel
                    v-else
                    :form-data="formData"
                    :syncing="syncWechatCertLoading"
                    :sync-error="certSyncError"
                    @sync-certificate="handleSyncWechatPlatformCert"
                />
            </a-form>

            <template #actions>
                <a-button
                    v-perms="['setting:login:save']"
                    data-admin-smoke="login-register-save"
                    type="primary"
                    :loading="isSubmitting"
                    :disabled="syncWechatCertLoading"
                    @click="handleSubmit"
                >
                    保存配置
                </a-button>
            </template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="loginRegister">
import AccessSettingsPanel from './components/commercial/access-settings-panel.vue'
import BillingSettingsPanel from './components/commercial/billing-settings-panel.vue'
import PaymentSettingsPanel from './components/commercial/payment-settings-panel.vue'
import {
    createCommercialDraft,
    sanitizeMemberPlans,
    sanitizePointsPacks,
    sanitizeToolConsumeRules,
    sanitizeConsumeRiskRules,
    detectDuplicatedToolKeys,
    type ToolConsumeRuleFormItem
} from './components/commercial/commercial-config'
import { getLogin, setLogin, syncWechatPlatformCert } from '@/api/setting/user'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useConfigLoad } from '@/composables/use-config-load'
import { useOperateSubmit } from '@/composables/use-operate-submit'

const formData = reactive(createCommercialDraft())

const baselineSnapshot = ref('')
/** 比较已确认读取或保存的完整表单快照，保留账号、会员和凭据的原始编辑值。 */
const hasUnsavedChanges = computed(
    () => Boolean(baselineSnapshot.value) && JSON.stringify(formData) !== baselineSnapshot.value
)
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } =
    useConfigLoad(hasUnsavedChanges)
const { isSubmitting, lastSavedAt, submitError, runSubmit } =
    useOperateSubmit('登录与商业化配置已保存')

const syncWechatCertLoading = ref(false)
const certSyncError = ref('')
const activeSection = ref<'access' | 'billing' | 'payment'>('access')

/**
 * 函数说明：根据当前页签给出简短操作提示，避免把所有说明长期展开。
 */
const activeSectionTip = computed(() => {
    const tips = {
        access: '设置前台登录开关、第三方授权和用户中心入口。',
        billing: '设置工具扣分、风控上限、会员套餐和积分包。',
        payment: '设置微信、支付宝与网关鉴权，上线前请关闭测试支付。'
    }
    return tips[activeSection.value]
})

/**
 * 函数说明：判断当前是否启用了微信登录渠道。
 */
const isWechatAuthEnabled = computed<boolean>(() => {
    return Array.isArray(formData.autoLoginAuth) && formData.autoLoginAuth.includes(1)
})

/**
 * 函数说明：判断当前是否启用了 QQ 登录渠道。
 */
const isQqAuthEnabled = computed<boolean>(() => {
    return Array.isArray(formData.autoLoginAuth) && formData.autoLoginAuth.includes(2)
})

/**
 * 函数说明：将后端返回的多选值标准化为数字数组，兼容字符串和数组格式
 */
const normalizeMultiValue = (value: unknown): number[] => {
    if (Array.isArray(value)) {
        return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item))
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item))
    }
    if (typeof value === 'number') {
        return [value]
    }
    return []
}

/**
 * 函数说明：将多选数组序列化为逗号分隔字符串，统一提交参数格式
 */
const serializeMultiValue = (value: unknown): string => {
    const list = normalizeMultiValue(value)
    return list.join(',')
}

/**
 * 函数说明：将多选字符串值标准化为字符串数组（用于支付渠道配置）。
 */
const normalizeStringMultiValue = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter((item) => item.length > 0)
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
    }
    return []
}

/**
 * 函数说明：将字符串数组序列化为逗号分隔字符串，供后端保存。
 */
const serializeStringMultiValue = (value: unknown): string => {
    const list = normalizeStringMultiValue(value)
    return list.join(',')
}

/**
 * 函数说明：判断微信支付 V3 关键参数是否完整，用于支付渠道保存前校验。
 */
const hasCompleteWechatV3Config = (): boolean => {
    return Boolean(
        String(formData.paymentWechatMchId || '').trim() &&
            String(formData.paymentWechatAppId || '').trim() &&
            String(formData.paymentWechatSerialNo || '').trim() &&
            String(formData.paymentWechatApiV3Key || '').trim() &&
            String(formData.paymentWechatPrivateKey || '').trim() &&
            String(formData.paymentWechatNotifyUrl || '').trim()
    )
}

/**
 * 函数说明：获取登录注册配置并回填页面表单
 */
const getData = async () => {
    if (isSubmitting.value || syncWechatCertLoading.value) return false
    return loadConfiguration(async () => {
        const data = await getLogin()
        formData.frontendLoginEnabled = Number(data.frontendLoginEnabled ?? 0) === 1 ? 1 : 0
        formData.loginWay = normalizeMultiValue(data.loginWay)
        formData.forceBindMobile = Number(data.forceBindMobile ?? 0)
        formData.openAgreement = Number(data.openAgreement ?? 0)
        formData.openOtherAuth = Number(data.openOtherAuth ?? 0)
        formData.autoLoginAuth = normalizeMultiValue(data.autoLoginAuth)
        formData.openWechatAuth = Number(data.openWechatAuth ?? 0)
        formData.openQqAuth = Number(data.openQqAuth ?? 0)
        formData.wechatAppId = String(data.wechatAppId || '')
        formData.wechatAppSecret = String(data.wechatAppSecret || '')
        formData.wechatRedirectUrl = String(data.wechatRedirectUrl || '')
        formData.qqAppId = String(data.qqAppId || '')
        formData.qqAppKey = String(data.qqAppKey || '')
        formData.qqRedirectUrl = String(data.qqRedirectUrl || '')
        formData.userCenterEnabled = Number(data.userCenterEnabled ?? 0)
        formData.userCenterTitle = String(data.userCenterTitle || '用户中心')
        formData.userCenterLink = String(data.userCenterLink || '')
        formData.dailyGiftPoints = Math.max(0, Number(data.dailyGiftPoints ?? 50))
        formData.toolConsumePoints = Math.max(1, Number(data.toolConsumePoints ?? 1))
        formData.toolConsumeRules = sanitizeToolConsumeRules(data.toolConsumeRules)
        formData.consumeRiskRules = sanitizeConsumeRiskRules(data.consumeRiskRules)
        formData.memberEnabled = Number(data.memberEnabled ?? 0) === 1 ? 1 : 0
        formData.memberTrialDays = Math.max(0, Number(data.memberTrialDays ?? 0))
        formData.memberPlans = sanitizeMemberPlans(data.memberPlans)
        formData.pointsPacks = sanitizePointsPacks(data.pointsPacks)
        formData.memberRightsIntro =
            String(data.memberRightsIntro || '').trim() ||
            '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。'
        formData.paymentChannels = normalizeStringMultiValue(data.paymentChannels)
        if (!formData.paymentChannels.length) {
            formData.paymentChannels = ['mock']
        }
        formData.paymentWechatUrl = String(data.paymentWechatUrl || '').trim()
        formData.paymentWechatCreateApi = String(data.paymentWechatCreateApi || '').trim()
        formData.paymentWechatMchId = String(data.paymentWechatMchId || '').trim()
        formData.paymentWechatAppId = String(data.paymentWechatAppId || '').trim()
        formData.paymentWechatSerialNo = String(data.paymentWechatSerialNo || '').trim()
        formData.paymentWechatApiV3Key = String(data.paymentWechatApiV3Key || '').trim()
        formData.paymentWechatPrivateKey = String(data.paymentWechatPrivateKey || '').trim()
        formData.paymentWechatPlatformCert = String(data.paymentWechatPlatformCert || '').trim()
        formData.paymentWechatPlatformSerialNo = String(
            data.paymentWechatPlatformSerialNo || ''
        ).trim()
        formData.paymentWechatPlatformEffectiveTime = String(
            data.paymentWechatPlatformEffectiveTime || ''
        ).trim()
        formData.paymentWechatPlatformExpireTime = String(
            data.paymentWechatPlatformExpireTime || ''
        ).trim()
        formData.paymentWechatPlatformSyncedAt = Math.max(
            0,
            Number(data.paymentWechatPlatformSyncedAt || 0)
        )
        formData.paymentWechatNotifyUrl = String(data.paymentWechatNotifyUrl || '').trim()
        formData.paymentAlipayUrl = String(data.paymentAlipayUrl || '').trim()
        formData.paymentAlipayCreateApi = String(data.paymentAlipayCreateApi || '').trim()
        formData.paymentCallbackSecret = String(data.paymentCallbackSecret || '')
        formData.paymentRequestSecret = String(data.paymentRequestSecret || '')
        formData.paymentRequestAuthType = ['none', 'bearer', 'header'].includes(
            String(data.paymentRequestAuthType || '').trim()
        )
            ? String(data.paymentRequestAuthType || '').trim()
            : 'none'
        formData.paymentRequestHeader =
            String(data.paymentRequestHeader || 'X-Payment-Token').trim() || 'X-Payment-Token'
        formData.paymentRequestToken = String(data.paymentRequestToken || '').trim()
        formData.paymentRequestTimeout = Math.min(
            60,
            Math.max(3, Number(data.paymentRequestTimeout ?? 12))
        )
        formData.adminLoginCaptchaOn = Number(data.adminLoginCaptchaOn ?? 1) === 1 ? 1 : 0
        formData.adminLoginFailLimit = Math.min(
            20,
            Math.max(3, Number(data.adminLoginFailLimit ?? 5))
        )
        formData.adminLoginFailWindow = Math.min(
            86400,
            Math.max(60, Number(data.adminLoginFailWindow ?? 900))
        )
        if (!formData.autoLoginAuth.length) {
            if (formData.openWechatAuth === 1) {
                formData.autoLoginAuth.push(1)
            }
            if (formData.openQqAuth === 1) {
                formData.autoLoginAuth.push(2)
            }
        }
        baselineSnapshot.value = JSON.stringify(formData)
        certSyncError.value = ''
    })
}

/**
 * 函数说明：重新读取登录与商业化配置，用于多人编辑后快速同步最新值。
 */
const reloadLoginConfig = async () => {
    if (isSubmitting.value || syncWechatCertLoading.value || !(await reloadConfiguration(getData)))
        return
    feedback.msgSuccess('已重新加载登录与商业化配置')
}

/**
 * 函数说明：按已保存微信参数同步证书，保留同步过程中继续编辑的草稿。
 */
const handleSyncWechatPlatformCert = async () => {
    if (
        syncWechatCertLoading.value ||
        isSubmitting.value ||
        isLoadingData.value ||
        !hasLoadedData.value ||
        loadErrorMessage.value
    )
        return
    const sourceFields = [
        'paymentWechatMchId',
        'paymentWechatSerialNo',
        'paymentWechatApiV3Key',
        'paymentWechatPrivateKey'
    ] as const
    const certificateFields = [
        'paymentWechatPlatformCert',
        'paymentWechatPlatformSerialNo',
        'paymentWechatPlatformEffectiveTime',
        'paymentWechatPlatformExpireTime',
        'paymentWechatPlatformSyncedAt'
    ] as const
    const saved = JSON.parse(baselineSnapshot.value)
    if ([...sourceFields, ...certificateFields].some((key) => formData[key] !== saved[key])) {
        certSyncError.value = '微信支付参数或证书有未保存更改，请先保存配置，再拉取平台证书。'
        activeSection.value = 'payment'
        feedback.msgError(certSyncError.value)
        return
    }
    if (
        !String(formData.paymentWechatMchId || '').trim() ||
        !String(formData.paymentWechatSerialNo || '').trim() ||
        !String(formData.paymentWechatApiV3Key || '').trim() ||
        !String(formData.paymentWechatPrivateKey || '').trim()
    ) {
        certSyncError.value =
            '请先填写并保存商户号、证书序列号、APIv3 密钥和商户私钥，再拉取平台证书。'
        feedback.msgError(certSyncError.value)
        return
    }
    const sourceSnapshot = JSON.stringify(sourceFields.map((key) => formData[key]))
    const certificateSnapshot = JSON.stringify(certificateFields.map((key) => formData[key]))
    certSyncError.value = ''
    syncWechatCertLoading.value = true
    try {
        const result = await syncWechatPlatformCert()
        const certPem = String(result?.platformCertPem || '').trim()
        const serialNo = String(result?.platformSerialNo || '').trim()
        const syncedAt = Number(result?.syncedAt)
        if (!certPem || !serialNo || !Number.isFinite(syncedAt) || syncedAt <= 0)
            throw new Error('invalid certificate response')
        const certificate = {
            paymentWechatPlatformCert: certPem,
            paymentWechatPlatformSerialNo: serialNo,
            paymentWechatPlatformEffectiveTime: String(result?.effectiveTime || '').trim(),
            paymentWechatPlatformExpireTime: String(result?.expireTime || '').trim(),
            paymentWechatPlatformSyncedAt: syncedAt
        }
        // 同步接口已持久化证书，只更新对应服务器基线，不把其它未保存修改标成已保存。
        baselineSnapshot.value = JSON.stringify({
            ...JSON.parse(baselineSnapshot.value),
            ...certificate
        })
        if (
            sourceSnapshot !== JSON.stringify(sourceFields.map((key) => formData[key])) ||
            certificateSnapshot !== JSON.stringify(certificateFields.map((key) => formData[key]))
        ) {
            certSyncError.value =
                '平台证书已同步到后台，当前微信参数或证书草稿有新修改，未覆盖您的编辑；可重新加载核对。'
            feedback.msgWarning(certSyncError.value)
            return
        }
        Object.assign(formData, certificate)
        feedback.msgSuccess('平台证书同步成功')
    } catch (error) {
        certSyncError.value = '平台证书同步失败，请检查已保存的微信支付参数后重试。'
        if (!(error as { notified?: boolean })?.notified) feedback.msgError(certSyncError.value)
    } finally {
        syncWechatCertLoading.value = false
    }
}

/**
 * 函数说明：保存登录注册配置，提交前做必要字段校验
 */
const handleSubmit = async () => {
    if (
        isLoadingData.value ||
        !hasLoadedData.value ||
        loadErrorMessage.value ||
        isSubmitting.value ||
        syncWechatCertLoading.value
    )
        return
    if (
        formData.frontendLoginEnabled === 1 &&
        (!Array.isArray(formData.loginWay) || formData.loginWay.length === 0)
    ) {
        feedback.msgError('登录方式至少选择一项！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        formData.openOtherAuth === 1 &&
        (!Array.isArray(formData.autoLoginAuth) || formData.autoLoginAuth.length === 0)
    ) {
        feedback.msgError('开启第三方登录时，至少选择一个授权渠道！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        isWechatAuthEnabled.value &&
        (!formData.wechatAppId.trim() || !formData.wechatRedirectUrl.trim())
    ) {
        feedback.msgError('微信登录至少需要配置 AppID 与回调地址！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        isQqAuthEnabled.value &&
        (!formData.qqAppId.trim() || !formData.qqRedirectUrl.trim())
    ) {
        feedback.msgError('QQ 登录至少需要配置 AppID 与回调地址！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        formData.userCenterEnabled === 1 &&
        !formData.userCenterLink.trim()
    ) {
        feedback.msgError('请填写用户中心入口链接！')
        return
    }
    if (formData.dailyGiftPoints < 0) {
        feedback.msgError('每日赠送积分不能小于 0')
        return
    }
    if (formData.toolConsumePoints < 1) {
        feedback.msgError('单次工具消耗积分至少为 1')
        return
    }
    if (formData.adminLoginFailLimit < 3 || formData.adminLoginFailLimit > 20) {
        feedback.msgError('后台登录失败锁定阈值需在 3~20 次之间')
        return
    }
    if (formData.adminLoginFailWindow < 60 || formData.adminLoginFailWindow > 86400) {
        feedback.msgError('后台登录锁定窗口需在 60~86400 秒之间')
        return
    }
    const duplicatedToolKeys = detectDuplicatedToolKeys(
        formData.toolConsumeRules as ToolConsumeRuleFormItem[]
    )
    if (duplicatedToolKeys.length > 0) {
        feedback.msgError(`按工具计费规则存在重复 toolKey：${duplicatedToolKeys.join('、')}`)
        return
    }
    const normalizedToolConsumeRules = sanitizeToolConsumeRules(formData.toolConsumeRules)
    const normalizedConsumeRiskRules = sanitizeConsumeRiskRules(formData.consumeRiskRules)
    if (
        normalizedConsumeRiskRules.perHour > 0 &&
        normalizedConsumeRiskRules.perMinute > normalizedConsumeRiskRules.perHour
    ) {
        feedback.msgError('风控规则异常：每小时上限不能小于每分钟上限')
        return
    }
    if (
        normalizedConsumeRiskRules.perDay > 0 &&
        normalizedConsumeRiskRules.perHour > normalizedConsumeRiskRules.perDay
    ) {
        feedback.msgError('风控规则异常：每日上限不能小于每小时上限')
        return
    }
    if (formData.memberEnabled === 1 && formData.memberTrialDays < 0) {
        feedback.msgError('会员试用天数不能小于 0')
        return
    }

    const normalizedMemberPlans = sanitizeMemberPlans(formData.memberPlans)
    const normalizedPointsPacks = sanitizePointsPacks(formData.pointsPacks)
    if (normalizedMemberPlans.length === 0) {
        feedback.msgError('请至少保留一个有效会员套餐（需填写编码与名称）')
        return
    }
    if (normalizedPointsPacks.length === 0) {
        feedback.msgError('请至少保留一个有效积分包（需填写编码与名称）')
        return
    }
    const paymentChannels = normalizeStringMultiValue(formData.paymentChannels)
    if (!paymentChannels.length) {
        feedback.msgError('请至少保留一个支付渠道')
        return
    }
    const hasWechatPayUrl = Boolean(String(formData.paymentWechatUrl || '').trim())
    const hasWechatCreateApi = Boolean(String(formData.paymentWechatCreateApi || '').trim())
    const hasWechatV3Config = hasCompleteWechatV3Config()
    if (
        paymentChannels.includes('wechat_h5') &&
        !hasWechatPayUrl &&
        !hasWechatCreateApi &&
        !hasWechatV3Config
    ) {
        feedback.msgError(
            '启用微信支付时，请配置微信支付跳转地址、微信下单接口地址或完整的微信支付V3参数'
        )
        return
    }
    const hasWechatV3PartialInput = Boolean(
        String(formData.paymentWechatMchId || '').trim() ||
            String(formData.paymentWechatAppId || '').trim() ||
            String(formData.paymentWechatSerialNo || '').trim() ||
            String(formData.paymentWechatApiV3Key || '').trim() ||
            String(formData.paymentWechatPrivateKey || '').trim() ||
            String(formData.paymentWechatNotifyUrl || '').trim()
    )
    if (paymentChannels.includes('wechat_h5') && hasWechatV3PartialInput && !hasWechatV3Config) {
        feedback.msgError(
            '微信支付V3参数未配置完整，请至少补齐商户号/AppID/证书序列号/APIv3密钥/商户私钥/回调地址'
        )
        return
    }
    const hasAlipayPayUrl = Boolean(String(formData.paymentAlipayUrl || '').trim())
    const hasAlipayCreateApi = Boolean(String(formData.paymentAlipayCreateApi || '').trim())
    if (paymentChannels.includes('alipay_h5') && !hasAlipayPayUrl && !hasAlipayCreateApi) {
        feedback.msgError('启用支付宝时，请至少配置支付宝跳转地址或支付宝下单接口地址')
        return
    }
    const paymentRequestAuthType = ['none', 'bearer', 'header'].includes(
        String(formData.paymentRequestAuthType || 'none')
    )
        ? String(formData.paymentRequestAuthType || 'none')
        : 'none'
    const paymentRequestHeader = String(formData.paymentRequestHeader || '').trim()
    const paymentRequestToken = String(formData.paymentRequestToken || '').trim()
    if (paymentRequestAuthType !== 'none' && !paymentRequestToken) {
        feedback.msgError('启用支付网关鉴权后，请填写鉴权令牌')
        return
    }
    if (paymentRequestAuthType === 'header' && !paymentRequestHeader) {
        feedback.msgError('自定义 Header 模式下，请填写鉴权 Header 名称')
        return
    }
    if (formData.paymentRequestTimeout < 3 || formData.paymentRequestTimeout > 60) {
        feedback.msgError('支付网关下单超时需在 3~60 秒之间')
        return
    }

    await runSubmit(async () => {
        formData.openWechatAuth = isWechatAuthEnabled.value ? 1 : 0
        formData.openQqAuth = isQqAuthEnabled.value ? 1 : 0
        const submittedSnapshot = JSON.stringify(formData)
        await setLogin({
            ...formData,
            loginWay: serializeMultiValue(formData.loginWay),
            autoLoginAuth: serializeMultiValue(formData.autoLoginAuth),
            toolConsumeRules: normalizedToolConsumeRules,
            consumeRiskRules: normalizedConsumeRiskRules,
            memberPlans: normalizedMemberPlans,
            pointsPacks: normalizedPointsPacks,
            memberRightsIntro: String(formData.memberRightsIntro || '').trim(),
            paymentChannels: serializeStringMultiValue(paymentChannels),
            paymentWechatUrl: String(formData.paymentWechatUrl || '').trim(),
            paymentWechatCreateApi: String(formData.paymentWechatCreateApi || '').trim(),
            paymentWechatMchId: String(formData.paymentWechatMchId || '').trim(),
            paymentWechatAppId: String(formData.paymentWechatAppId || '').trim(),
            paymentWechatSerialNo: String(formData.paymentWechatSerialNo || '').trim(),
            paymentWechatApiV3Key: String(formData.paymentWechatApiV3Key || '').trim(),
            paymentWechatPrivateKey: String(formData.paymentWechatPrivateKey || '').trim(),
            paymentWechatPlatformCert: String(formData.paymentWechatPlatformCert || '').trim(),
            paymentWechatNotifyUrl: String(formData.paymentWechatNotifyUrl || '').trim(),
            paymentAlipayUrl: String(formData.paymentAlipayUrl || '').trim(),
            paymentAlipayCreateApi: String(formData.paymentAlipayCreateApi || '').trim(),
            paymentCallbackSecret: String(formData.paymentCallbackSecret || '').trim(),
            paymentRequestSecret: String(formData.paymentRequestSecret || '').trim(),
            paymentRequestAuthType,
            paymentRequestHeader,
            paymentRequestToken,
            paymentRequestTimeout: Math.min(
                60,
                Math.max(3, Number(formData.paymentRequestTimeout || 12))
            )
        })
        baselineSnapshot.value = submittedSnapshot
        certSyncError.value = ''
    })
}

/** 页面离开前保护未保存的商业化配置，取消时保留当前编辑。 */
onBeforeRouteLeave(async () => {
    if (isSubmitting.value || syncWechatCertLoading.value) return false
    if (!hasUnsavedChanges.value) return true
    try {
        await feedback.confirm('当前配置尚未保存，确定离开吗？')
        return true
    } catch {
        return false
    }
})
/** 浏览器关闭或刷新前提示未保存的账号、会员和支付设置。 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value && !isSubmitting.value && !syncWechatCertLoading.value) return
    event.preventDefault()
    event.returnValue = ''
}
window.addEventListener('beforeunload', handleBeforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
void getData()
</script>

<style lang="scss" scoped>
.login-section-nav {
    margin-bottom: 16px;
}
.login-section-nav :deep(.arco-tabs-content) {
    display: none;
}
.login-section-nav__tip {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border-2);
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.7;
}
.layout-page-actions,
.layout-status-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}
@media (max-width: 768px) {
    .layout-page-actions {
        justify-content: flex-start;
    }
}
</style>
