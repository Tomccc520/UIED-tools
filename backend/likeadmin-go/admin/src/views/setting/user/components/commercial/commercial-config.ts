/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import type { LoginSetup } from '@/api/setting/user'

export interface MemberPlanFormItem {
    code: string
    name: string
    price: number
    memberDays: number
    giftPoints: number
    sort: number
    status: number
    badge: string
}

export interface PointsPackFormItem {
    code: string
    name: string
    price: number
    points: number
    giftPoints: number
    sort: number
    status: number
}

export interface ToolConsumeRuleFormItem {
    toolKey: string
    name: string
    consumePoints: number
    memberFree: number
    status: number
    sort: number
    remark: string
}

export interface ConsumeRiskRulesForm {
    perMinute: number
    perHour: number
    perDay: number
}

export interface ToolConsumeRulePresetOption {
    value: string
    label: string
    defaultName: string
    consumePoints: number
    memberFree: number
    remark: string
}

export interface ToolConsumeRuleRenderItem {
    index: number
    rule: ToolConsumeRuleFormItem
}

/**
 * 函数说明：创建一个默认会员套餐项，便于运营快速新增配置。
 */
export const createDefaultMemberPlan = (): MemberPlanFormItem => ({
    code: '',
    name: '',
    price: 0,
    memberDays: 30,
    giftPoints: 0,
    sort: 0,
    status: 1,
    badge: ''
})

/**
 * 函数说明：创建一个默认积分包项，便于运营快速新增配置。
 */
export const createDefaultPointsPack = (): PointsPackFormItem => ({
    code: '',
    name: '',
    price: 0,
    points: 100,
    giftPoints: 0,
    sort: 0,
    status: 1
})

/**
 * 函数说明：创建默认工具计费规则项，便于运营快速按 toolKey 配置扣分策略。
 */
export const createDefaultToolConsumeRule = (): ToolConsumeRuleFormItem => ({
    toolKey: '',
    name: '',
    consumePoints: 1,
    memberFree: 1,
    status: 1,
    sort: 0,
    remark: ''
})

export const defaultMemberPlans: MemberPlanFormItem[] = [
    {
        code: 'vip_month',
        name: 'VIP月卡',
        price: 29,
        memberDays: 30,
        giftPoints: 80,
        sort: 1,
        status: 1,
        badge: '热卖'
    },
    {
        code: 'vip_quarter',
        name: 'VIP季卡',
        price: 79,
        memberDays: 90,
        giftPoints: 300,
        sort: 2,
        status: 1,
        badge: '推荐'
    },
    {
        code: 'vip_year',
        name: 'VIP年卡',
        price: 299,
        memberDays: 365,
        giftPoints: 1500,
        sort: 3,
        status: 1,
        badge: '省钱'
    }
]

export const defaultPointsPacks: PointsPackFormItem[] = [
    {
        code: 'points_100',
        name: '100积分包',
        price: 9.9,
        points: 100,
        giftPoints: 0,
        sort: 1,
        status: 1
    },
    {
        code: 'points_500',
        name: '500积分包',
        price: 39.9,
        points: 500,
        giftPoints: 50,
        sort: 2,
        status: 1
    },
    {
        code: 'points_1000',
        name: '1000积分包',
        price: 69.9,
        points: 1000,
        giftPoints: 200,
        sort: 3,
        status: 1
    }
]

export const defaultToolConsumeRules: ToolConsumeRuleFormItem[] = []
export const defaultConsumeRiskRules: ConsumeRiskRulesForm = {
    perMinute: 30,
    perHour: 600,
    perDay: 3000
}

export const toolConsumeRulePresetOptions: ToolConsumeRulePresetOption[] = [
    {
        value: 'video-compress',
        label: 'video-compress（视频压缩）',
        defaultName: '视频压缩',
        consumePoints: 0,
        memberFree: 1,
        remark: '普通视频压缩免费使用'
    },
    {
        value: 'video-compress-large',
        label: 'video-compress-large（视频压缩-大文件）',
        defaultName: '视频压缩-大文件',
        consumePoints: 5,
        memberFree: 0,
        remark: '超过 220MB 的视频按次扣积分，会员可单独配置免扣'
    },
    {
        value: 'gif-compress',
        label: 'gif-compress（GIF压缩）',
        defaultName: 'GIF压缩',
        consumePoints: 2,
        memberFree: 1,
        remark: 'GIF 编解码较重，建议按次扣 2 分'
    },
    {
        value: 'photo-background',
        label: 'photo-background（AI抠图）',
        defaultName: 'AI抠图',
        consumePoints: 3,
        memberFree: 1,
        remark: '抠图模型调用较重，可适当提高扣分'
    },
    {
        value: 'pdf-compress',
        label: 'pdf-compress（PDF压缩）',
        defaultName: 'PDF压缩',
        consumePoints: 2,
        memberFree: 1,
        remark: 'PDF 压缩包含重型处理链路'
    },
    {
        value: 'video-format-convert',
        label: 'video-format-convert（视频格式转换）',
        defaultName: '视频格式转换',
        consumePoints: 2,
        memberFree: 1,
        remark: '转码链路建议统一按 2 分'
    }
]

/**
 * 函数说明：统一规范 toolKey 文本，便于搜索、去重和预设匹配复用。
 */
export const normalizeToolKeyText = (value: unknown): string => {
    return String(value || '')
        .trim()
        .toLowerCase()
}

/**
 * 函数说明：将后端配置值解析为数组，兼容字符串 JSON 与数组对象。
 */
export function parseArrayConfig<T>(value: unknown, fallback: T[]): T[] {
    if (Array.isArray(value)) {
        return value as T[]
    }
    if (typeof value === 'string') {
        const text = value.trim()
        if (!text) {
            return fallback
        }
        try {
            const parsed = JSON.parse(text)
            return Array.isArray(parsed) ? (parsed as T[]) : fallback
        } catch {
            return fallback
        }
    }
    return fallback
}

/**
 * 函数说明：清洗会员套餐配置，过滤掉关键字段为空的无效项。
 */
export const sanitizeMemberPlans = (value: unknown): MemberPlanFormItem[] => {
    const list = parseArrayConfig<MemberPlanFormItem>(value, defaultMemberPlans)
    return list
        .map((item, index) => ({
            code: String(item.code || '').trim(),
            name: String(item.name || '').trim(),
            price: Math.max(0, Number(item.price || 0)),
            memberDays: Math.max(1, Number(item.memberDays || 1)),
            giftPoints: Math.max(0, Number(item.giftPoints || 0)),
            sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
            status: Number(item.status ?? 1) === 0 ? 0 : 1,
            badge: String(item.badge || '').trim()
        }))
        .filter((item) => item.code && item.name)
}

/**
 * 函数说明：清洗积分包配置，过滤掉关键字段为空的无效项。
 */
export const sanitizePointsPacks = (value: unknown): PointsPackFormItem[] => {
    const list = parseArrayConfig<PointsPackFormItem>(value, defaultPointsPacks)
    return list
        .map((item, index) => ({
            code: String(item.code || '').trim(),
            name: String(item.name || '').trim(),
            price: Math.max(0, Number(item.price || 0)),
            points: Math.max(1, Number(item.points || 1)),
            giftPoints: Math.max(0, Number(item.giftPoints || 0)),
            sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
            status: Number(item.status ?? 1) === 0 ? 0 : 1
        }))
        .filter((item) => item.code && item.name)
}

/**
 * 函数说明：清洗工具计费规则，过滤无效 toolKey 并统一字段范围。
 */
export const sanitizeToolConsumeRules = (value: unknown): ToolConsumeRuleFormItem[] => {
    const list = parseArrayConfig<ToolConsumeRuleFormItem>(value, defaultToolConsumeRules)
    const seenToolKey = new Set<string>()
    return list
        .map((item, index) => {
            const toolKey = normalizeToolKeyText(item.toolKey)
            return {
                toolKey,
                name: String(item.name || '').trim(),
                consumePoints: Math.max(0, Number(item.consumePoints ?? 1)),
                memberFree: Number(item.memberFree ?? 1) === 0 ? 0 : 1,
                status: Number(item.status ?? 1) === 0 ? 0 : 1,
                sort: Number.isFinite(Number(item.sort))
                    ? Math.max(0, Number(item.sort))
                    : index + 1,
                remark: String(item.remark || '').trim()
            }
        })
        .filter((item) => {
            if (!item.toolKey || seenToolKey.has(item.toolKey)) {
                return false
            }
            seenToolKey.add(item.toolKey)
            return true
        })
}

/**
 * 函数说明：检测 toolKey 重复配置，避免保存后被清洗逻辑静默去重。
 */
export const detectDuplicatedToolKeys = (value: ToolConsumeRuleFormItem[]): string[] => {
    const duplicatedList: string[] = []
    const seenToolKey = new Set<string>()
    ;(value || []).forEach((item) => {
        const toolKey = normalizeToolKeyText(item.toolKey)
        if (!toolKey) {
            return
        }
        if (seenToolKey.has(toolKey)) {
            duplicatedList.push(toolKey)
            return
        }
        seenToolKey.add(toolKey)
    })
    return Array.from(new Set(duplicatedList))
}

/**
 * 函数说明：清洗工具调用风控规则，避免负值配置导致风控失效。
 */
export const sanitizeConsumeRiskRules = (value: unknown): ConsumeRiskRulesForm => {
    if (typeof value === 'string') {
        try {
            return sanitizeConsumeRiskRules(JSON.parse(value))
        } catch {
            return { ...defaultConsumeRiskRules }
        }
    }
    if (!value || typeof value !== 'object') {
        return { ...defaultConsumeRiskRules }
    }
    const source = value as Partial<ConsumeRiskRulesForm>
    return {
        perMinute: Math.max(0, Number(source.perMinute ?? defaultConsumeRiskRules.perMinute)),
        perHour: Math.max(0, Number(source.perHour ?? defaultConsumeRiskRules.perHour)),
        perDay: Math.max(0, Number(source.perDay ?? defaultConsumeRiskRules.perDay))
    }
}

/** 后台只持有已解析的草稿，API 的历史字符串兼容由读取和提交边界处理。 */
export interface CommercialDraft
    extends Omit<
        LoginSetup,
        | 'memberPlans'
        | 'pointsPacks'
        | 'toolConsumeRules'
        | 'consumeRiskRules'
        | 'loginWay'
        | 'autoLoginAuth'
        | 'paymentChannels'
    > {
    memberPlans: MemberPlanFormItem[]
    pointsPacks: PointsPackFormItem[]
    toolConsumeRules: ToolConsumeRuleFormItem[]
    consumeRiskRules: ConsumeRiskRulesForm
    loginWay: number[]
    autoLoginAuth: number[]
    paymentChannels: string[]
}

/** 为每个设置页创建独立默认草稿，套餐对象不与模块模板或其它实例共享。 */
export const createCommercialDraft = (): CommercialDraft => ({
    frontendLoginEnabled: 0,
    loginWay: [],
    forceBindMobile: 0,
    openAgreement: 0,
    openOtherAuth: 0,
    autoLoginAuth: [1],
    openWechatAuth: 1,
    openQqAuth: 0,
    wechatAppId: '',
    wechatAppSecret: '',
    wechatRedirectUrl: '',
    qqAppId: '',
    qqAppKey: '',
    qqRedirectUrl: '',
    userCenterEnabled: 0,
    userCenterTitle: '用户中心',
    userCenterLink: '',
    dailyGiftPoints: 50,
    toolConsumePoints: 1,
    toolConsumeRules: [...defaultToolConsumeRules],
    consumeRiskRules: { ...defaultConsumeRiskRules },
    memberEnabled: 0,
    memberTrialDays: 0,
    memberPlans: defaultMemberPlans.map((item) => ({ ...item })),
    pointsPacks: defaultPointsPacks.map((item) => ({ ...item })),
    memberRightsIntro:
        '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。',
    paymentChannels: ['mock'],
    paymentWechatUrl: '',
    paymentWechatCreateApi: '',
    paymentWechatMchId: '',
    paymentWechatAppId: '',
    paymentWechatSerialNo: '',
    paymentWechatApiV3Key: '',
    paymentWechatPrivateKey: '',
    paymentWechatPlatformCert: '',
    paymentWechatPlatformSerialNo: '',
    paymentWechatPlatformEffectiveTime: '',
    paymentWechatPlatformExpireTime: '',
    paymentWechatPlatformSyncedAt: 0,
    paymentWechatNotifyUrl: '',
    paymentAlipayUrl: '',
    paymentAlipayCreateApi: '',
    paymentCallbackSecret: '',
    paymentRequestSecret: '',
    paymentRequestAuthType: 'none',
    paymentRequestHeader: 'X-Payment-Token',
    paymentRequestToken: '',
    paymentRequestTimeout: 12,
    adminLoginCaptchaOn: 1,
    adminLoginFailLimit: 5,
    adminLoginFailWindow: 900
})
