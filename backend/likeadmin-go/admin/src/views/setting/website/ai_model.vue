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

        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadAiModel">
        <a-card class="page-card pro-panel-card" :bordered="false">

            <div v-if="showMattingSection" class="section-block">
                <div class="section-header">
                    <div>
                        <h3>服务商与密钥</h3>
                        <p>保存后，抠图工具使用这里的默认服务商。</p>
                    </div>
                    <a-tag
                        :color="
                            currentMattingProviderForm &&
                            isMattingProviderReady(currentMattingProviderForm)
                                ? 'green'
                                : 'orange'
                        "
                        bordered
                    >
                        {{
                            currentMattingProviderForm &&
                            isMattingProviderReady(currentMattingProviderForm)
                                ? '可调用'
                                : '待配置'
                        }}
                    </a-tag>
                </div>

                <div class="section-switcher">
                    <div class="section-switcher__main">
                        <div class="section-switcher__label">当前服务商</div>
                        <a-select v-model="formData.modelId" placeholder="请选择抠图服务商">
                            <a-option
                                v-for="item in formData.mattingProviders"
                                :key="item.provider"
                                :value="item.provider"
                            >
                                {{ item.label }}
                            </a-option>
                        </a-select>
                    </div>
                    <div v-if="currentMattingProviderForm" class="section-switcher__meta">
                        <a-tag bordered>{{ currentMattingProviderForm.provider }}</a-tag>
                        <span class="matting-provider-desc">
                            {{ currentMattingProviderForm.description }}
                        </span>
                    </div>
                </div>

                <a-alert type="info" :closable="false" show-icon>
                    密钥仅保存于管理后台并由服务端内部读取，不会返回给官网浏览器。
                </a-alert>

                <a-card
                    v-if="currentMattingProviderForm"
                    class="single-config-card matting-config-card"
                    :bordered="false"
                >
                    <a-form layout="vertical" :model="currentMattingProviderForm">
                        <a-row :gutter="16">
                            <template v-if="currentMattingProviderForm.provider === 'koukoutu'">
                                <a-col :xs="24">
                                    <a-form-item label="API 地址">
                                        <a-input
                                            v-model="currentMattingProviderForm.apiUrl"
                                            placeholder="https://sync.koukoutu.com/v1/create"
                                        />
                                    </a-form-item>
                                </a-col>
                                <a-col :xs="24">
                                    <a-form-item label="API Key">
                                        <a-input-password
                                            v-model="currentMattingProviderForm.apiKey"
                                            autocomplete="off"
                                            placeholder="请输入抠抠图 X-API-Key"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-col>
                            </template>
                            <template v-else>
                                <a-col :xs="24" :lg="12">
                                    <a-form-item label="AccessKey ID">
                                        <a-input-password
                                            v-model="currentMattingProviderForm.accessKeyId"
                                            autocomplete="off"
                                            placeholder="请输入阿里云 AccessKey ID"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-col>
                                <a-col :xs="24" :lg="12">
                                    <a-form-item label="AccessKey Secret">
                                        <a-input-password
                                            v-model="currentMattingProviderForm.accessKeySecret"
                                            autocomplete="off"
                                            placeholder="请输入阿里云 AccessKey Secret"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-col>
                                <a-col :xs="24">
                                    <a-form-item label="Endpoint">
                                        <a-input
                                            v-model="currentMattingProviderForm.endpoint"
                                            placeholder="imageseg.cn-shanghai.aliyuncs.com"
                                        />
                                    </a-form-item>
                                </a-col>
                            </template>
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="请求超时（秒）">
                                    <a-input-number
                                        v-model="currentMattingProviderForm.timeoutSeconds"
                                        :min="10"
                                        :max="300"
                                        class="w-full"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-form>
                </a-card>
            </div>

            <div v-if="showProviderSection" class="section-block">
                <div class="section-header">
                    <div>
                        <h3>服务商连接</h3>
                        <p>
                            选择服务商，设置连接地址、默认模型与启用状态。
                        </p>
                    </div>
                </div>

                <div class="section-switcher">
                    <div class="section-switcher__main">
                        <div class="section-switcher__label">选择 Provider</div>
                        <a-select
                            v-model="selectedProviderKey"
                            placeholder="请选择要维护的 Provider"
                        >
                            <a-option
                                v-for="provider in formData.providers"
                                :key="provider.provider"
                                :value="provider.provider"
                            >
                                {{ provider.label || provider.provider }}
                            </a-option>
                        </a-select>
                    </div>
                    <div v-if="currentProviderForm" class="section-switcher__meta">
                        <a-tag bordered>{{ currentProviderForm.provider }}</a-tag>
                        <a-tag v-if="currentProviderForm.isDefault" color="green" bordered
                            >默认</a-tag
                        >
                        <a-tag v-if="isProviderReady(currentProviderForm)" color="arcoblue" bordered
                            >可调用</a-tag
                        >
                    </div>
                </div>

                <a-card v-if="currentProviderForm" class="single-config-card" :bordered="false">
                    <template #title>
                        <div class="provider-card__title">
                            <div class="provider-card__meta">
                                <span class="provider-name">{{
                                    currentProviderForm.label || currentProviderForm.provider
                                }}</span>
                                <a-tag size="small" bordered>{{
                                    currentProviderForm.provider
                                }}</a-tag>
                            </div>
                            <div class="provider-card__actions">
                                <a-switch
                                    v-model="currentProviderForm.enabled"
                                    checked-text="启用"
                                    unchecked-text="停用"
                                />
                                <a-button
                                    size="small"
                                    type="outline"
                                    :disabled="!currentProviderForm.enabled"
                                    @click="setCurrentProviderAsDefault"
                                >
                                    设为默认
                                </a-button>
                            </div>
                        </div>
                    </template>

                    <div class="provider-card__desc">
                        {{ currentProviderForm.description || '未填写 Provider 描述。' }}
                    </div>

                    <a-form layout="vertical" :model="currentProviderForm">
                        <a-row :gutter="16">
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="Provider 名称">
                                    <a-input
                                        v-model="currentProviderForm.label"
                                        placeholder="请输入展示名称"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="默认模型">
                                    <a-select
                                        v-model="currentProviderForm.defaultModel"
                                        allow-search
                                        allow-create
                                        placeholder="获取模型后选择，或输入自定义模型 ID"
                                    >
                                        <a-option
                                            v-for="model in currentProviderForm.models || []"
                                            :key="model.value"
                                            :value="model.value"
                                        >
                                            {{ model.label || model.value }}
                                        </a-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="Base URL">
                                    <a-input
                                        v-model="currentProviderForm.baseUrl"
                                        placeholder="请输入兼容 Chat Completions 的基础地址"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="API Key">
                                    <div class="provider-key-row">
                                        <a-input-password
                                            v-model="currentProviderForm.apiKey"
                                            autocomplete="off"
                                            placeholder="请输入 API Key，模型获取与前端调用均由后端代理"
                                            allow-clear
                                        />
                                        <a-button
                                            type="primary"
                                            :loading="fetchingProviderKey === currentProviderForm.provider"
                                            :disabled="
                                                !currentProviderForm.baseUrl?.trim() ||
                                                !currentProviderForm.apiKey?.trim()
                                            "
                                            @click="handleFetchProviderModels"
                                        >
                                            获取模型
                                        </a-button>
                                    </div>
                                    <div class="field-help">
                                        Key 只提交给本站 Go 服务端，由服务端请求 Provider 的 /models 接口，不会直接暴露给官网前端。
                                    </div>
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="Provider 说明">
                                    <a-textarea
                                        v-model="currentProviderForm.description"
                                        :auto-size="{ minRows: 2, maxRows: 3 }"
                                        placeholder="补充这个 Provider 的适用场景或模型说明"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-form>

                    <div class="model-tip-block">
                        <div class="model-tip-header">
                            <div class="model-tip-title">当前模型库</div>
                            <a-tag v-if="currentProviderForm.models?.length" color="green" bordered>
                                已获取 {{ currentProviderForm.models.length }} 个
                            </a-tag>
                        </div>
                        <div v-if="currentProviderForm.models?.length" class="model-tags">
                            <a-tag
                                v-for="model in displayedProviderModels"
                                :key="`${currentProviderForm.provider}-${model.value}`"
                                color="arcoblue"
                                bordered
                                class="model-tag-select"
                                @click="currentProviderForm.defaultModel = model.value"
                            >
                                {{ model.label }}
                            </a-tag>
                            <a-tag v-if="currentProviderForm.models.length > displayedProviderModels.length" bordered>
                                另有 {{ currentProviderForm.models.length - displayedProviderModels.length }} 个，请在默认模型中搜索
                            </a-tag>
                        </div>
                        <a-empty
                            v-else
                            description="填写 Base URL 和 API Key 后点击“获取模型”。"
                        />
                    </div>
                </a-card>
            </div>

            <div v-if="showAbilitySection" class="section-block">
                <div class="section-header">
                    <div>
                        <h3>AI 工具能力代理管理</h3>
                        <p>
                            统一管理 PromptReverse、StableDiffusion、AI
                            二维码、OCR、图像增强、文本配音等工具页的上游能力地址，前端统一走后端代理。
                        </p>
                    </div>
                </div>

                <div class="section-switcher">
                    <div class="section-switcher__main">
                        <div class="section-switcher__label">选择工具能力</div>
                        <a-select v-model="selectedAbilityKey" placeholder="请选择要维护的工具能力">
                            <a-option
                                v-for="ability in formData.imageAbilities"
                                :key="ability.ability"
                                :value="ability.ability"
                            >
                                {{ ability.label || ability.ability }}
                            </a-option>
                        </a-select>
                    </div>
                    <div v-if="currentAbilityForm" class="section-switcher__meta">
                        <a-tag bordered>{{ currentAbilityForm.ability }}</a-tag>
                        <a-tag
                            v-if="isImageAbilityReady(currentAbilityForm)"
                            color="arcoblue"
                            bordered
                            >可调用</a-tag
                        >
                    </div>
                </div>

                <a-card v-if="currentAbilityForm" class="single-config-card" :bordered="false">
                    <template #title>
                        <div class="provider-card__title">
                            <div class="provider-card__meta">
                                <span class="provider-name">{{
                                    currentAbilityForm.label || currentAbilityForm.ability
                                }}</span>
                                <a-tag size="small" bordered>{{
                                    currentAbilityForm.ability
                                }}</a-tag>
                            </div>
                            <div class="provider-card__actions">
                                <a-switch
                                    v-model="currentAbilityForm.enabled"
                                    checked-text="启用"
                                    unchecked-text="停用"
                                />
                            </div>
                        </div>
                    </template>

                    <div class="provider-card__desc">
                        {{ currentAbilityForm.description || '未填写能力说明。' }}
                    </div>

                    <a-form layout="vertical" :model="currentAbilityForm">
                        <a-row :gutter="16">
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="能力名称">
                                    <a-input
                                        v-model="currentAbilityForm.label"
                                        placeholder="请输入能力名称"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="请求方法">
                                    <a-select
                                        v-model="currentAbilityForm.method"
                                        placeholder="请选择请求方法"
                                    >
                                        <a-option value="GET">GET</a-option>
                                        <a-option value="POST">POST</a-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="上游地址">
                                    <a-input
                                        v-model="currentAbilityForm.upstreamUrl"
                                        placeholder="请输入上游接口完整地址"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="API Key 请求头">
                                    <a-input
                                        v-model="currentAbilityForm.apiKeyHeader"
                                        placeholder="例如 Authorization / X-API-Key"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24" :lg="12">
                                <a-form-item label="超时时间（秒）">
                                    <a-input-number
                                        v-model="currentAbilityForm.timeoutSeconds"
                                        :min="10"
                                        :max="300"
                                        class="w-full"
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="API Key">
                                    <a-input-password
                                        v-model="currentAbilityForm.apiKey"
                                        autocomplete="off"
                                        placeholder="如上游需要鉴权，可在这里填写 API Key"
                                        allow-clear
                                    />
                                </a-form-item>
                            </a-col>
                            <a-col :xs="24">
                                <a-form-item label="能力说明">
                                    <a-textarea
                                        v-model="currentAbilityForm.description"
                                        :auto-size="{ minRows: 2, maxRows: 3 }"
                                        placeholder="补充这个图片 AI 能力的适用工具页或限制说明"
                                    />
                                </a-form-item>
                            </a-col>
                        </a-row>
                    </a-form>
                </a-card>
            </div>
        </a-card>

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
import {
    fetchAiProviderModels,
    getAiModelDetail,
    saveAiModel,
    type AiModelOption,
    type AiMattingProviderConfig,
    type AiImageAbilityConfig,
    type AiProviderConfig,
    type AiProviderCurrent,
    type AiModelSavePayload
} from '@/api/setting/ai_model'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import ConfigEditFrame from './components/config-edit-frame.vue'
import { useOperateSubmit } from './composables/use-operate-submit'
import { useConfigLoad } from './composables/use-config-load'
import { useRoute } from 'vue-router'

type AiModelPageMode = 'matting' | 'provider' | 'ability' | 'all'

const route = useRoute()

const formData = reactive<{
    modelId: string
    supported: AiModelOption[]
    currentModelName: string
    mattingProviders: AiMattingProviderConfig[]
    providers: AiProviderConfig[]
    imageAbilities: AiImageAbilityConfig[]
    providerCurrent: AiProviderCurrent | null
}>({
    modelId: '',
    supported: [],
    currentModelName: '',
    mattingProviders: [],
    providers: [],
    imageAbilities: [],
    providerCurrent: null
})

/**
 * 函数说明：控制 AI 模型页运营模式。简版聚焦当前模块配置，高级模式展示全局统计视图。
 */
const baselineSnapshot = ref('')
const selectedProviderKey = ref('')
const selectedAbilityKey = ref('')
const fetchingProviderKey = ref('')
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('当前 AI 配置已保存')

const pageMetaMap: Record<
    AiModelPageMode,
    { title: string; subtitle: string; tag: string; items: string[] }
> = {
    all: {
        title: 'AI 模型管理',
        subtitle:
            '统一管理抠图 API、文本 AI Provider 与图片 AI 能力，前端工具统一走这里的后台配置。',
        tag: '综合视图',
        items: ['统一查看 AI 抠图、文本 Provider、工具能力三条链路。', '适合做发布前总检查与统一保存。']
    },
    matting: {
        title: 'AI 抠图 API',
        subtitle:
            '这里只维护阿里云与抠抠图 API 的默认服务商，密钥保存在后台服务端，不会暴露给前端。',
        tag: '抠图 API',
        items: ['切换当前生效的抠图 API Provider。', '保存后证件照换底色、AI 抠图页即时生效。']
    },
    provider: {
        title: 'AI Provider 管理',
        subtitle:
            '统一管理豆包、Kimi、DeepSeek、OpenAI 等文本能力 Provider，前端聊天/写作/搜索都从这里读取。',
        tag: '文本 Provider',
        items: ['维护 Provider 基础地址、Key 和默认模型。', '前端聊天/写作/搜索统一走后端代理，不再暴露前端 Key。']
    },
    ability: {
        title: 'AI 工具能力代理',
        subtitle:
            '统一管理 PromptReverse、StableDiffusion、AI 二维码、OCR、图像增强、文本配音等工具页的上游能力。',
        tag: '图片与工具能力',
        items: ['维护图片类与工具类上游能力地址、请求方式和超时。', '保存后 OCR、图像增强、二维码等页面统一读取。']
    }
}

/**
 * 函数说明：根据当前路由路径识别 AI 模型页面模式，支持同一组件在多个后台菜单下复用。
 */
const pageMode = computed<AiModelPageMode>(() => {
    if (route.path.endsWith('/ai_provider')) {
        return 'provider'
    }
    if (route.path.endsWith('/ai_ability')) {
        return 'ability'
    }
    if (route.path.endsWith('/ai_model')) {
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
 * 函数说明：限制模型标签首屏数量，大模型库通过默认模型搜索框完成选择。
 */
const displayedProviderModels = computed(() => {
    return (currentProviderForm.value?.models || []).slice(0, 12)
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

/** 按当前菜单构造补丁载荷，隐藏模块的旧快照不会随当前页一起写回。 */
const buildSavePayload = (): AiModelSavePayload => {
    if (pageMode.value === 'matting') return {
        scope: 'matting', modelId: formData.modelId,
        mattingProviders: formData.mattingProviders.map(item => ({ ...item }))
    }
    if (pageMode.value === 'provider') return {
        scope: 'provider', providers: formData.providers.map(item => ({ ...item, models: item.models.map(model => ({ ...model })) }))
    }
    if (pageMode.value === 'ability') return {
        scope: 'ability', imageAbilities: formData.imageAbilities.map(item => ({ ...item }))
    }
    return {
        modelId: formData.modelId,
        mattingProviders: formData.mattingProviders.map(item => ({ ...item })),
        providers: formData.providers.map(item => ({ ...item, models: item.models.map(model => ({ ...model })) })),
        imageAbilities: formData.imageAbilities.map(item => ({ ...item }))
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
        ...collectAbilityValidationTips()
    ]
})

/**
 * 函数说明：设置默认 Provider，并保证同一时间只有一个默认项。
 */
const setDefaultProvider = (targetIndex: number) => {
    formData.providers = formData.providers.map((item, index) => ({
        ...item,
        isDefault: item.enabled ? index === targetIndex : false
    }))
}

/**
 * 函数说明：将当前下拉选中的 Provider 设置为默认项，保持后台操作聚焦在当前选择对象。
 */
const setCurrentProviderAsDefault = () => {
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
    if (isLoadingData.value || !hasLoadedData.value || loadErrorMessage.value || isSubmitting.value || fetchingProviderKey.value) return
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
            apiKey: requestApiKey
        })
        if (!formData.providers.includes(provider) || provider.baseUrl.trim() !== requestBaseUrl || provider.apiKey.trim() !== requestApiKey) {
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
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
/** 读取完整详情供当前模块编辑，接口失败时保留原草稿与基线。 */
const getData = async () => loadConfiguration(async () => {
    const data = await getAiModelDetail()
    formData.modelId = data.currentModelId || ''
    formData.supported = data.supported || []
    formData.currentModelName = data.current?.modelName || ''
    formData.mattingProviders = (data.mattingProviders || []).map(item => ({ ...item }))
    formData.providers = (data.providers || []).map(item => ({ ...item, models: item.models || [] }))
    formData.imageAbilities = (data.imageAbilities || []).map(item => ({ ...item }))
    formData.providerCurrent = data.providerCurrent || null
    selectedProviderKey.value = formData.providers[0]?.provider || ''
    selectedAbilityKey.value = formData.imageAbilities[0]?.ability || ''
    baselineSnapshot.value = buildSnapshot()
})

/** 重新加载前保护当前模块草稿，保存或获取模型过程中不覆盖编辑内容。 */
const reloadAiModel = async () => {
    if (isSubmitting.value || fetchingProviderKey.value) return false
    return reloadConfiguration(getData)
}

/** 保存当前模块的明确补丁，持久化成功即更新基线，不依赖二次读取确认。 */
const handleSave = async () => {
    if (isLoadingData.value || !hasLoadedData.value || loadErrorMessage.value || isSubmitting.value || fetchingProviderKey.value) return
    if (validationTips.value.length > 0) {
        feedback.msgError(validationTips.value[0])
        return
    }
    const payload = buildSavePayload()
    const submittedSnapshot = JSON.stringify(payload)
    await runSubmit(async () => {
        await saveAiModel(payload)
        baselineSnapshot.value = submittedSnapshot
    })
}

/**
 * 函数说明：浏览器刷新或关闭前提醒未保存变更，减少误操作。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
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

onMounted(() => {
    void getData()
    window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style lang="scss" scoped>
.setting-ai-model {
    .layout-page-actions {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
    }

    .section-switcher {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--color-border-2);
        background: var(--color-fill-1);
    }

    .section-switcher__main {
        flex: 1;
        max-width: 420px;
    }

    .section-switcher__label {
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-2);
    }

    .section-switcher__meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .section-block {
        margin-top: 16px;
        padding: 14px;
        border: 1px solid var(--color-border-2);
        border-radius: 12px;
        background: #fff;
    }

    .section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
    }

    .section-header h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-1);
    }

    .section-header p {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--color-text-3);
    }

    .matting-provider-desc {
        max-width: 520px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3);
    }

    .matting-config-card {
        margin-top: 16px;
    }

    .single-config-card {
        border: 1px solid var(--color-border-2);
        border-radius: 14px;
        background: linear-gradient(180deg, #fff, var(--color-fill-1));
    }

    .provider-card__title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }

    .provider-card__meta {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .provider-name {
        font-weight: 600;
        color: var(--color-text-1);
    }

    .provider-card__actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .provider-key-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        width: 100%;
    }

    .field-help {
        margin-top: 7px;
        color: var(--color-text-3);
        font-size: 12px;
        line-height: 1.65;
    }

    .provider-card__desc {
        margin-bottom: 14px;
        font-size: 13px;
        color: var(--color-text-3);
        line-height: 1.7;
    }

    .model-tip-block {
        margin-top: 4px;
        padding-top: 12px;
        border-top: 1px dashed var(--color-border-2);
    }

    .model-tip-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-2);
    }

    .model-tip-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 10px;
    }

    .model-tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
    }

    .model-tag-select {
        cursor: pointer;
    }
}

@media (max-width: 768px) {
    .setting-ai-model {

        .section-switcher,
        .provider-card__title {
            flex-direction: column;
            align-items: stretch;
        }

        .provider-key-row {
            grid-template-columns: 1fr;
        }
    }
}
</style>
