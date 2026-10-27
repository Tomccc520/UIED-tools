<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="setting-ai-model pro-page-shell">
        <admin-page-header class="layout-page-header" :title="currentPageMeta.title">
            <template #subtitle>
                {{ currentPageMeta.subtitle }}
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <a-button
                        size="small"
                        data-admin-smoke="ai-matting-reload"
                        :disabled="isSubmitting || isLoadingData || Boolean(fetchingProviderKey)"
                        @click="reloadAiModel"
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
            @retry="reloadAiModel"
        >
            <div class="ai-config-panels">
                <ai-matting-panel
                    v-if="showMattingSection"
                    v-model="formData.modelId"
                    :providers="formData.mattingProviders"
                    :current-provider="currentMattingProviderForm"
                    :ready="
                        Boolean(
                            currentMattingProviderForm &&
                                isMattingProviderReady(currentMattingProviderForm)
                        )
                    "
                    @patch="patchMattingProvider"
                />
                <ai-provider-panel
                    v-if="showProviderSection"
                    v-model="selectedProviderKey"
                    :providers="formData.providers"
                    :current-provider="currentProviderForm"
                    :ready="Boolean(currentProviderForm && isProviderReady(currentProviderForm))"
                    :fetching-provider-key="fetchingProviderKey"
                    @patch="patchTextProvider"
                    @set-default="setCurrentProviderAsDefault"
                    @fetch-models="handleFetchProviderModels"
                />
                <ai-ability-panel
                    v-if="showAbilitySection"
                    v-model="selectedAbilityKey"
                    :abilities="formData.imageAbilities"
                    :current-ability="currentAbilityForm"
                    :ready="Boolean(currentAbilityForm && isImageAbilityReady(currentAbilityForm))"
                    @patch="patchToolAbility"
                />
            </div>

            <template #actions>
                <a-button
                    v-perms="['setting:ai:model:save']"
                    type="primary"
                    data-admin-smoke="ai-matting-save"
                    :loading="isSubmitting"
                    :disabled="Boolean(fetchingProviderKey)"
                    @click="handleSave"
                >
                    保存当前配置
                </a-button>
            </template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="settingAiModel">
import AdminPageHeader from '@/components/page-header/index.vue'
import AiMattingPanel from './components/ai-matting-panel.vue'
import AiProviderPanel from './components/ai-provider-panel.vue'
import AiAbilityPanel from './components/ai-ability-panel.vue'
import {
    fetchAiProviderModels,
    getAiModelDetail,
    saveAiModel,
    type AiMattingProviderConfig,
    type AiImageAbilityConfig,
    type AiProviderConfig,
    type AiModelDetail,
    type AiModelSavePayload,
} from '@/api/setting/ai_model'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useOperateSubmit } from '@/composables/use-operate-submit'
import { useConfigLoad } from '@/composables/use-config-load'
import { useRoute } from 'vue-router'

type AiModelPageMode = 'matting' | 'provider' | 'ability' | 'all'

const route = useRoute()
// 后台按 fullPath 缓存独立实例；保存职责固定为本实例创建时的菜单，不跟随其他活动标签变化。
const instanceRoutePath = route.path
let isPageActive = true
let isPageDisposed = false
let unloadAttached = false

const formData = reactive<{
    modelId: string
    mattingProviders: AiMattingProviderConfig[]
    providers: AiProviderConfig[]
    imageAbilities: AiImageAbilityConfig[]
}>({
    modelId: '',
    mattingProviders: [],
    providers: [],
    imageAbilities: [],
})

/**
 * 函数说明：按当前菜单维护独立基线，选择状态不参与持久化。
 */
const baselineSnapshot = ref('')
const selectedProviderKey = ref('')
const selectedAbilityKey = ref('')
const fetchingProviderKey = ref('')
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('当前 AI 配置已保存')

const pageMetaMap: Record<AiModelPageMode, { title: string; subtitle: string }> = {
    all: {
        title: 'AI 模型管理',
        subtitle: '统一管理抠图 API、文本 AI 服务商与工具能力，前端工具通过后端代理调用。',
    },
    matting: {
        title: 'AI 抠图 API',
        subtitle: '维护阿里云与抠抠图的默认服务商，密钥保存在后台服务端。',
    },
    provider: {
        title: 'AI Provider 管理',
        subtitle: '维护文本服务商的连接、密钥和默认模型，供聊天、写作与搜索使用。',
    },
    ability: {
        title: 'AI 工具能力代理',
        subtitle: '维护二维码、OCR、图像增强与配音等工具的上游能力。',
    },
}

/**
 * 函数说明：按实例所属菜单识别配置范围，缓存失活后不跟随全局路由切换写入职责。
 */
const pageMode = computed<AiModelPageMode>(() => {
    if (instanceRoutePath.endsWith('/ai_provider')) {
        return 'provider'
    }
    if (instanceRoutePath.endsWith('/ai_ability')) {
        return 'ability'
    }
    if (instanceRoutePath.endsWith('/ai_model')) {
        return 'matting'
    }
    return 'all'
})

/**
 * 函数说明：输出当前页面标题、副标题与标签，保证不同后台菜单进入时文案一致。
 */
const currentPageMeta = computed(() => pageMetaMap[pageMode.value])

/**
 * 函数说明：控制抠图 API 模块显隐，使对应菜单只聚焦 Provider 选择。
 */
const showMattingSection = computed(() => ['matting', 'all'].includes(pageMode.value))

/**
 * 函数说明：控制文本 Provider 模块显隐，使“AI Provider 管理”菜单只展示对应内容。
 */
const showProviderSection = computed(() => ['provider', 'all'].includes(pageMode.value))

/**
 * 函数说明：控制图片 AI 能力模块显隐，使“AI工具能力”菜单不再混入其他配置。
 */
const showAbilitySection = computed(() => ['ability', 'all'].includes(pageMode.value))

/**
 * 函数说明：统计启用的 Provider 数量，便于快速判断是否已经接入多个候选供应商。
 */
const enabledProviderCount = computed(() => {
    return formData.providers.filter((item) => item.enabled).length
})

/**
 * 函数说明：根据当前选中的抠图服务商返回可编辑配置，页面始终只展示一组密钥。
 */
const currentMattingProviderForm = computed(() => {
    return (
        formData.mattingProviders.find((item) => item.provider === formData.modelId) ||
        formData.mattingProviders[0] ||
        null
    )
})

/**
 * 函数说明：根据当前下拉选中的 Provider 返回可编辑对象，确保页面一次只维护一个 Provider。
 */
const currentProviderForm = computed(() => {
    return (
        formData.providers.find((item) => item.provider === selectedProviderKey.value) ||
        formData.providers[0] ||
        null
    )
})

/**
 * 函数说明：根据当前下拉选中的工具能力返回可编辑对象，避免后台同时渲染全部能力卡片。
 */
const currentAbilityForm = computed(() => {
    return (
        formData.imageAbilities.find((item) => item.ability === selectedAbilityKey.value) ||
        formData.imageAbilities[0] ||
        null
    )
})

/**
 * 函数说明：判断当前 Provider 是否具备可调用条件，保持前后端的判断口径一致。
 */
const isProviderReady = (provider: AiProviderConfig) => {
    return Boolean(
        provider.enabled &&
            provider.baseUrl?.trim() &&
            provider.apiKey?.trim() &&
            provider.defaultModel?.trim()
    )
}

/**
 * 函数说明：判断抠图服务商配置是否完整，与 Go 服务端的可用状态判断保持一致。
 */
const isMattingProviderReady = (provider: AiMattingProviderConfig) => {
    if (provider.provider === 'aliyun') {
        return Boolean(
            provider.accessKeyId?.trim() &&
                provider.accessKeySecret?.trim() &&
                provider.endpoint?.trim()
        )
    }
    return Boolean(provider.apiUrl?.trim() && provider.apiKey?.trim())
}

/**
 * 函数说明：判断图片 AI 能力是否具备代理调用条件，保持后台保存校验与后端判断一致。
 */
const isImageAbilityReady = (ability: AiImageAbilityConfig) => {
    return Boolean(
        ability.enabled &&
            ability.upstreamUrl?.trim() &&
            ['GET', 'POST'].includes((ability.method || '').toUpperCase())
    )
}

/** 只在配置已完整加载且未提交时接受面板草稿；获取模型期间仍允许修正连接地址。 */
const canEditAiDraft = () =>
    isPageActive &&
    !isPageDisposed &&
    hasLoadedData.value &&
    !isLoadingData.value &&
    !isSubmitting.value &&
    !loadErrorMessage.value

/** 按显式字段白名单更新父级对象，子面板不能改标识、模型库或另一个模块。 */
const applyAiDraftPatch = <T extends object>(
    target: T | undefined,
    patch: Partial<T>,
    fields: (keyof T)[]
) => {
    if (!target || !canEditAiDraft() || !patch || typeof patch !== 'object' || Array.isArray(patch))
        return
    for (const field of fields)
        if (Object.prototype.hasOwnProperty.call(patch, field))
            target[field] = patch[field] as T[keyof T]
}

/** 根据抠图服务商标识合并草稿，未知服务商及隐藏模块的回调不修改数据。 */
const patchMattingProvider = (provider: string, patch: Partial<AiMattingProviderConfig>) => {
    if (!showMattingSection.value) return
    applyAiDraftPatch(
        formData.mattingProviders.find((item) => item.provider === provider),
        patch,
        ['apiUrl', 'apiKey', 'accessKeyId', 'accessKeySecret', 'endpoint', 'timeoutSeconds']
    )
}

/** 根据文本服务商标识编辑连接字段，默认项和模型库仍由父级专用动作维护。 */
const patchTextProvider = (provider: string, patch: Partial<AiProviderConfig>) => {
    if (!showProviderSection.value) return
    applyAiDraftPatch(
        formData.providers.find((item) => item.provider === provider),
        patch,
        ['label', 'description', 'enabled', 'baseUrl', 'apiKey', 'defaultModel']
    )
}

/** 根据工具能力标识合并草稿，能力切换不会把迟到回调套给新选项。 */
const patchToolAbility = (ability: string, patch: Partial<AiImageAbilityConfig>) => {
    if (!showAbilitySection.value) return
    applyAiDraftPatch(
        formData.imageAbilities.find((item) => item.ability === ability),
        patch,
        [
            'label',
            'description',
            'enabled',
            'method',
            'upstreamUrl',
            'apiKeyHeader',
            'apiKey',
            'timeoutSeconds',
        ]
    )
}

/** 按当前菜单构造补丁载荷，隐藏模块的旧快照不会随当前页一起写回。 */
const buildSavePayload = (): AiModelSavePayload => {
    if (pageMode.value === 'matting')
        return {
            scope: 'matting',
            modelId: formData.modelId,
            mattingProviders: formData.mattingProviders.map((item) => ({ ...item })),
        }
    if (pageMode.value === 'provider')
        return {
            scope: 'provider',
            providers: formData.providers.map((item) => ({
                ...item,
                models: item.models.map((model) => ({ ...model })),
            })),
        }
    if (pageMode.value === 'ability')
        return {
            scope: 'ability',
            imageAbilities: formData.imageAbilities.map((item) => ({ ...item })),
        }
    return {
        modelId: formData.modelId,
        mattingProviders: formData.mattingProviders.map((item) => ({ ...item })),
        providers: formData.providers.map((item) => ({
            ...item,
            models: item.models.map((model) => ({ ...model })),
        })),
        imageAbilities: formData.imageAbilities.map((item) => ({ ...item })),
    }
}

/** 仅序列化当前菜单负责的配置，以独立基线标识未保存草稿。 */
const buildSnapshot = () => JSON.stringify(buildSavePayload())

/**
 * 函数说明：判断页面是否存在未保存变更，避免切页丢失后台填写的 Key。
 */
const hasUnsavedChanges = computed(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：收集抠图 API 模块的校验提示，避免切到其他菜单时出现不相关报错。
 */
const collectMattingValidationTips = () => {
    const tips: string[] = []
    if (!formData.modelId) {
        tips.push('请先选择一个抠图 API Provider。')
        return tips
    }
    const provider = currentMattingProviderForm.value
    if (!provider) {
        tips.push('后台尚未返回抠图 Provider 配置。')
    } else if (!isMattingProviderReady(provider)) {
        tips.push(
            provider.provider === 'aliyun'
                ? '请填写阿里云 AccessKey ID、AccessKey Secret 和 Endpoint。'
                : '请填写抠抠图 API 地址和 API Key。'
        )
    }
    return tips
}

/**
 * 函数说明：收集文本 Provider 模块的校验提示，统一用于顶部折叠区与保存前拦截。
 */
const collectProviderValidationTips = () => {
    const tips: string[] = []
    if (enabledProviderCount.value === 0) {
        tips.push('请至少启用一个文本 AI Provider。')
    }
    if (!formData.providers.some((item) => item.enabled && item.isDefault)) {
        tips.push('启用中的 Provider 需要指定一个默认项。')
    }

    formData.providers.forEach((provider) => {
        if (!provider.enabled) {
            return
        }
        const missingFields: string[] = []
        if (!provider.baseUrl?.trim()) {
            missingFields.push('Base URL')
        }
        if (!provider.apiKey?.trim()) {
            missingFields.push('API Key')
        }
        if (!provider.defaultModel?.trim()) {
            missingFields.push('默认模型')
        }
        if (missingFields.length > 0) {
            tips.push(`${provider.label || provider.provider} 缺少：${missingFields.join('、')}`)
        }
    })
    return tips
}

/**
 * 函数说明：收集图片 AI 能力模块的校验提示，避免图片工具上游地址遗漏后直接保存。
 */
const collectAbilityValidationTips = () => {
    const tips: string[] = []
    formData.imageAbilities.forEach((ability) => {
        if (!ability.enabled) {
            return
        }
        const missingFields: string[] = []
        if (!ability.upstreamUrl?.trim()) {
            missingFields.push('上游地址')
        }
        if (!ability.method?.trim()) {
            missingFields.push('请求方法')
        }
        if (missingFields.length > 0) {
            tips.push(`${ability.label || ability.ability} 缺少：${missingFields.join('、')}`)
        }
    })
    return tips
}

/**
 * 函数说明：收集运营侧配置校验提示，统一在顶部折叠区展示。
 */
const validationTips = computed(() => {
    if (pageMode.value === 'matting') {
        return collectMattingValidationTips()
    }
    if (pageMode.value === 'provider') {
        return collectProviderValidationTips()
    }
    if (pageMode.value === 'ability') {
        return collectAbilityValidationTips()
    }
    return [
        ...collectMattingValidationTips(),
        ...collectProviderValidationTips(),
        ...collectAbilityValidationTips(),
    ]
})

/**
 * 函数说明：设置默认 Provider，并保证同一时间只有一个默认项。
 */
const setDefaultProvider = (targetIndex: number) => {
    formData.providers = formData.providers.map((item, index) => ({
        ...item,
        isDefault: item.enabled ? index === targetIndex : false,
    }))
}

/**
 * 函数说明：将当前下拉选中的 Provider 设置为默认项，保持后台操作聚焦在当前选择对象。
 */
const setCurrentProviderAsDefault = () => {
    if (!canEditAiDraft() || !showProviderSection.value) return
    const currentIndex = formData.providers.findIndex(
        (item) => item.provider === selectedProviderKey.value
    )
    if (currentIndex < 0) {
        return
    }
    setDefaultProvider(currentIndex)
}

/**
 * 函数说明：通过后端代理请求当前 Provider 模型接口，并将真实模型列表写入待保存配置。
 */
const handleFetchProviderModels = async () => {
    if (
        !canEditAiDraft() ||
        !showProviderSection.value ||
        fetchingProviderKey.value
    )
        return
    const provider = currentProviderForm.value
    if (!provider) {
        feedback.msgError('请先选择 Provider')
        return
    }
    if (!provider.baseUrl?.trim()) {
        feedback.msgError('请先填写 Provider Base URL')
        return
    }
    if (!provider.apiKey?.trim()) {
        feedback.msgError('请先填写 Provider API Key')
        return
    }

    const requestBaseUrl = provider.baseUrl.trim()
    const requestApiKey = provider.apiKey.trim()
    fetchingProviderKey.value = provider.provider
    try {
        const data = await fetchAiProviderModels({
            provider: provider.provider,
            baseUrl: requestBaseUrl,
            apiKey: requestApiKey,
        })
        if (
            isPageDisposed ||
            !formData.providers.includes(provider) ||
            provider.baseUrl.trim() !== requestBaseUrl ||
            provider.apiKey.trim() !== requestApiKey
        ) {
            feedback.msgWarning('服务商连接配置已变化，请重新获取模型。')
            return
        }
        provider.models = Array.isArray(data.models) ? data.models : []
        if (!provider.defaultModel?.trim() && provider.models.length > 0) {
            provider.defaultModel = provider.models[0].value
        }
        feedback.msgSuccess(`已获取 ${provider.models.length} 个可用模型，请选择默认模型后保存`)
    } finally {
        fetchingProviderKey.value = ''
    }
}

/**
 * 函数说明：读取后端 AI 模型详情并回填表单。
 */
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } =
    useConfigLoad(hasUnsavedChanges)

/** 检查配置列表及其唯一标识字段，缺失或畸形列表不能被当作合法空配置。 */
const isAiConfigList = (value: unknown, identifier: string) =>
    Array.isArray(value) && value.every((item) =>
        item && typeof item === 'object' && !Array.isArray(item) &&
        typeof item[identifier] === 'string' && Boolean(item[identifier].trim())
    )

/** 校验完整详情后构造独立草稿，任一模块错误均在回填前失败，保留原表单与基线。 */
const createDraftFromAiDetail = (data: AiModelDetail) => {
    if (
        !data || typeof data !== 'object' || Array.isArray(data) ||
        typeof data.currentModelId !== 'string' ||
        !isAiConfigList(data.mattingProviders, 'provider') ||
        !isAiConfigList(data.providers, 'provider') ||
        !isAiConfigList(data.imageAbilities, 'ability') ||
        !data.providers.every((item) => item.models == null || isAiConfigList(item.models, 'value'))
    ) throw new Error('invalid AI configuration response')
    return {
        modelId: data.currentModelId,
        mattingProviders: data.mattingProviders.map((item) => ({ ...item })),
        providers: data.providers.map((item) => ({
            ...item,
            models: (item.models || []).map((model) => ({ ...model })),
        })),
        imageAbilities: data.imageAbilities.map((item) => ({ ...item })),
    }
}

/** 读取完整详情供当前模块编辑，接口失败时保留原草稿与基线。 */
const getData = async () => {
    if (!isPageActive || isPageDisposed || isSubmitting.value || fetchingProviderKey.value)
        return false
    return loadConfiguration(async () => {
        const data = await getAiModelDetail()
        if (isPageDisposed) return
        const nextDraft = createDraftFromAiDetail(data)
        Object.assign(formData, nextDraft)
        selectedProviderKey.value = formData.providers[0]?.provider || ''
        selectedAbilityKey.value = formData.imageAbilities[0]?.ability || ''
        baselineSnapshot.value = buildSnapshot()
    })
}

/** 重新加载前保护当前模块草稿，保存或获取模型过程中不覆盖编辑内容。 */
const reloadAiModel = async () => {
    if (!isPageActive || isPageDisposed || isSubmitting.value || fetchingProviderKey.value)
        return false
    return reloadConfiguration(getData)
}

/** 保存当前模块的明确补丁，持久化成功即更新基线，不依赖二次读取确认。 */
const handleSave = async () => {
    if (
        !canEditAiDraft() ||
        fetchingProviderKey.value
    )
        return
    if (validationTips.value.length > 0) {
        feedback.msgError(validationTips.value[0])
        return
    }
    const payload = buildSavePayload()
    const submittedSnapshot = JSON.stringify(payload)
    await runSubmit(async () => {
        await saveAiModel(payload)
        if (!isPageDisposed) baselineSnapshot.value = submittedSnapshot
    })
}

/**
 * 函数说明：浏览器刷新或关闭前提醒未保存变更，减少误操作。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!isPageActive || isPageDisposed || !hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提醒未保存变更，避免运营编辑的 Provider Key 丢失。
 */
onBeforeRouteLeave(async () => {
    if (isSubmitting.value || fetchingProviderKey.value) return false
    if (!hasUnsavedChanges.value) {
        return true
    }
    try {
        await feedback.confirm('当前页面存在未保存变更，确定离开吗？')
        return true
    } catch {
        return false
    }
})

/** 激活缓存页时恢复刷新保护，不重新读取或覆盖已有草稿。 */
const activatePage = () => {
    if (isPageDisposed) return
    isPageActive = true
    if (!unloadAttached) {
        window.addEventListener('beforeunload', handleBeforeUnload)
        unloadAttached = true
    }
}

/** 缓存页失活时释放全局监听，避免未保存草稿影响其他标签的刷新。 */
const deactivatePage = () => {
    isPageActive = false
    if (unloadAttached) {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        unloadAttached = false
    }
}

onMounted(() => {
    activatePage()
    void getData()
})
onActivated(activatePage)
onDeactivated(deactivatePage)
onBeforeUnmount(() => {
    isPageDisposed = true
    deactivatePage()
})
</script>

<style lang="scss" scoped>
.layout-page-actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.ai-config-panels {
    display: grid;
    gap: 16px;
}
</style>
