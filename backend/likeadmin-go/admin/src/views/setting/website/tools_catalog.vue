<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-tools-catalog pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 工具主数据">
            <template #subtitle>
                维护工具分类树、基础信息、SEO 和计费策略字段。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <a-button size="small" data-admin-smoke="tools-catalog-reload" @click="reloadCatalogData">重新加载</a-button>
                    <a-button
                        size="small"
                        data-admin-smoke="tools-catalog-health-check-quick"
                        @click="runCatalogHealthCheck"
                    >
                        一键体检
                    </a-button>
                    <a-button
                        v-perms="['setting:website:catalog:save']"
                        data-admin-smoke="tools-catalog-save"
                        type="primary"
                        size="small"
                        :loading="isSubmitting"
                        @click="handleSubmit"
                    >
                        保存
                    </a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card general-card" title="工具主数据配置" :bordered="false">
            <section class="catalog-command-bar">
                <div class="catalog-command-bar__status">
                    <a-tag color="arcoblue" bordered>一级分类 {{ toolsCategoryCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>二级分类 {{ toolsSubCategoryCount }}</a-tag>
                    <a-tag color="green" bordered>工具 {{ toolsTotalCount }}</a-tag>
                    <a-tag :color="toolKeyConflictCount > 0 ? 'orangered' : 'green'" bordered>
                        toolKey 冲突 {{ toolKeyConflictCount }}
                    </a-tag>
                </div>
                <div class="catalog-command-bar__actions">
                    <a-radio-group v-model="simpleMode" type="button" size="small">
                        <a-radio :value="true">简版</a-radio>
                        <a-radio :value="false" data-admin-smoke="tools-catalog-mode-switch">高级</a-radio>
                    </a-radio-group>
                    <a-checkbox
                        v-model="syncToolConsumeRulesOnSeed"
                        data-admin-smoke="tools-catalog-policy-switch"
                    >
                        种子同步计费策略
                    </a-checkbox>
                    <a-button @click="goMenuSettings">菜单设置</a-button>
                </div>
            </section>

            <a-collapse
                v-model:active-key="catalogHealthCollapseKeys"
                class="catalog-health-collapse mt-4"
                :bordered="false"
                data-admin-smoke="tools-catalog-health-summary"
            >
                <a-collapse-item key="member-core-health">
                    <template #header>
                        <div class="catalog-health-collapse__header">
                            <span>20 个会员核心工具体检</span>
                            <a-tag
                                :color="memberCoreHealthWarnings.length > 0 ? 'orange' : 'green'"
                                bordered
                            >
                                {{
                                    memberCoreHealthWarnings.length > 0
                                        ? `待完善 ${memberCoreHealthWarnings.length}`
                                        : '已通过'
                                }}
                            </a-tag>
                        </div>
                    </template>
                    <section class="member-core-health">
                        <div class="member-core-health__head">
                            <div>
                                <div class="member-core-health__title">{{ memberCoreHealthSummary.title }}</div>
                                <div class="member-core-health__desc">{{ memberCoreHealthSummary.desc }}</div>
                            </div>
                        </div>
                        <div class="member-core-health__grid">
                            <div
                                v-for="item in memberCoreHealthMetrics"
                                :key="item.key"
                                class="member-core-health__metric"
                                :class="item.className"
                            >
                                <span>{{ item.label }}</span>
                                <strong>{{ item.value }}</strong>
                                <p>{{ item.desc }}</p>
                            </div>
                        </div>
                        <div v-if="memberCoreHealthWarnings.length > 0" class="member-core-health__warnings">
                            <div class="member-core-health__warnings-title">待补配置</div>
                            <div class="member-core-health__warning-list">
                                <a-tag
                                    v-for="warning in memberCoreHealthWarnings"
                                    :key="warning"
                                    color="orange"
                                    bordered
                                >
                                    {{ warning }}
                                </a-tag>
                            </div>
                        </div>
                    </section>
                </a-collapse-item>
            </a-collapse>

            <a-alert
                v-if="catalogValidationTips.length > 0"
                class="catalog-alert mt-4"
                type="warning"
                :closable="false"
                show-icon
            >
                {{ catalogValidationTips[0] }}
                <span v-if="catalogValidationTips.length > 1">
                    ，另有 {{ catalogValidationTips.length - 1 }} 项待处理。
                </span>
            </a-alert>

            <section v-if="simpleMode" class="catalog-simple-workspace mt-4">
                <div class="catalog-simple-workspace__main">
                    <div>
                        <div class="catalog-simple-workspace__title">工具运营中心</div>
                        <div class="catalog-simple-workspace__desc">
                            日常运营优先使用同步、体检、策略同步和前端预览。只有需要调整分类树或单个工具字段时，再进入高级模式编辑 JSON。
                        </div>
                    </div>
                    <a-button type="outline" @click="simpleMode = false">进入高级编辑</a-button>
                </div>
                <div class="catalog-simple-workspace__actions">
                    <a-button
                        status="success"
                        data-admin-smoke="tools-catalog-seed-sync-quick"
                        @click="syncFrontendToolCatalogSeed"
                    >
                        同步高频工具
                    </a-button>
                    <a-button
                        data-admin-smoke="tools-catalog-policy-sync"
                        @click="syncToolPoliciesToLoginConfig"
                    >
                        同步计费策略
                    </a-button>
                    <a-button
                        data-admin-smoke="tools-catalog-preview-quick"
                        @click="openToolsPreview"
                    >
                        查看前端效果
                    </a-button>
                </div>
                <div class="catalog-simple-workspace__metrics">
                    <div>
                        <span>数据规模</span>
                        <strong>{{ toolsTotalCount }} 个工具</strong>
                    </div>
                    <div>
                        <span>会员核心</span>
                        <strong>{{ memberCoreHealthWarnings.length > 0 ? '待完善' : '20 个已通过' }}</strong>
                    </div>
                    <div>
                        <span>toolKey 冲突</span>
                        <strong :class="{ 'is-danger': toolKeyConflictCount > 0 }">{{ toolKeyConflictCount }} 项</strong>
                    </div>
                </div>
            </section>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">预览分类卡片</div>
                    <div class="stat-value">{{ toolsCatalogPreviewCards.length }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">解析状态</div>
                    <div
                        class="stat-value"
                        :class="{ 'is-danger': Boolean(toolsCategoryTreeParseError) }"
                    >
                        {{ toolsCategoryTreeParseError ? '异常' : '正常' }}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">回退模式</div>
                    <div class="stat-value">
                        {{ toolsCategoryCount === 0 ? '已启用' : '未启用' }}
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>工具执行策略同步</span>
                    <div class="group-actions">
                        <a-radio-group v-model="toolPolicySyncMode" type="button" size="small">
                            <a-radio value="append">仅新增不覆盖</a-radio>
                            <a-radio value="overwrite">全量覆盖</a-radio>
                        </a-radio-group>
                        <a-button
                            type="primary"
                            status="success"
                            data-admin-smoke="tools-catalog-policy-sync-advanced"
                            @click="syncToolPoliciesToLoginConfig"
                            >同步到登录策略</a-button
                        >
                        <a-button data-admin-smoke="tools-catalog-policy-settings-advanced" @click="goToolPolicySettings">前往登录与积分策略</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    本区会基于“工具分类树”自动生成 <code>toolKey</code> 规则（优先读取工具项中的
                    <code>toolKey</code> 字段），并合并写入“登录与积分策略”的
                    <code>toolConsumeRules</code>。用于统一“工具主数据中心 + 执行策略中心”。
                </div>
                <a-alert class="catalog-alert" type="info" :closable="false" show-icon>
                    当前同步模式：<strong>{{
                        toolPolicySyncMode === 'append' ? '仅新增不覆盖' : '全量覆盖'
                    }}</strong
                    >。
                    {{
                        toolPolicySyncMode === 'append'
                            ? '仅补充新 toolKey，已有策略保持不变。'
                            : '按当前工具主数据重建规则，未包含的旧 toolKey 将被移除。'
                    }}
                </a-alert>
                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered
                        >策略种子 {{ toolPolicySeedRules.length }} 条</a-tag
                    >
                    <a-tag color="green" bordered
                        >工具覆盖字段 {{ toolPolicyOverrideCount }} 条</a-tag
                    >
                    <a-tag :color="toolKeyConflictCount > 0 ? 'orangered' : 'green'" bordered
                        >toolKey 冲突 {{ toolKeyConflictCount }} 项</a-tag
                    >
                </div>
                <a-table
                    class="mt-3"
                    :data="toolPolicySeedRules.slice(0, 12)"
                    :pagination="false"
                    size="small"
                    row-key="toolKey"
                >
                    <template #columns>
                        <a-table-column title="toolKey" data-index="toolKey" />
                        <a-table-column title="规则名称" data-index="name" />
                        <a-table-column title="扣分" data-index="consumePoints" />
                        <a-table-column title="会员免扣" data-index="memberFree">
                            <template #cell="{ record }">
                                <a-tag
                                    :color="record.memberFree === 0 ? 'orangered' : 'green'"
                                    bordered
                                >
                                    {{ record.memberFree === 0 ? '否' : '是' }}
                                </a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column title="启用" data-index="status">
                            <template #cell="{ record }">
                                <a-tag :color="record.status === 0 ? 'gray' : 'arcoblue'" bordered>
                                    {{ record.status === 0 ? '停用' : '启用' }}
                                </a-tag>
                            </template>
                        </a-table-column>
                        <a-table-column
                            title="工具链接"
                            data-index="path"
                            :ellipsis="true"
                            :tooltip="true"
                        />
                    </template>
                </a-table>
                <a-alert
                    v-if="toolKeyConflictCount > 0"
                    class="catalog-alert mt-3"
                    type="warning"
                    :closable="false"
                    show-icon
                >
                    当前存在 toolKey 冲突，同步前请先修正，避免策略覆盖异常。
                </a-alert>
                <a-table
                    v-if="toolKeyConflictCount > 0"
                    class="mt-3"
                    :data="toolKeyConflictRows"
                    :pagination="false"
                    size="small"
                    row-key="toolKey"
                >
                    <template #columns>
                        <a-table-column title="冲突 toolKey" data-index="toolKey" />
                        <a-table-column title="出现次数" data-index="count" width="110" />
                        <a-table-column title="冲突位置">
                            <template #cell="{ record }">
                                <div class="tool-conflict-positions">
                                    <div
                                        v-for="(position, index) in record.positions"
                                        :key="`${record.toolKey}-${index}`"
                                        class="tool-conflict-position"
                                    >
                                        {{ index + 1 }}. {{ position }}
                                    </div>
                                </div>
                            </template>
                        </a-table-column>
                    </template>
                </a-table>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>工具分类树 JSON</span>
                    <div class="group-actions">
                        <a-tag v-if="toolsCatalogPreviewCards.length > 3" bordered>
                            预览前 3 / {{ toolsCatalogPreviewCards.length }} 个分类
                        </a-tag>
                        <a-button type="text" data-admin-smoke="tools-catalog-format-json" @click="formatToolsCategoryTreeEditor"
                            >格式化</a-button
                        >
                        <a-button type="text" status="danger" data-admin-smoke="tools-catalog-clear-json" @click="resetToolsCategoryTreeEditor"
                            >清空为 []</a-button
                        >
                    </div>
                </div>
                <div class="form-tips mb-2">
                    最小结构要求：一级分类 <code>title/list</code>、二级分类
                    <code>title/list</code>、工具条目 <code>title/url</code>。 工具条目还支持
                    <code>releaseDate</code
                    >、<code>tags</code>、<code>isNew</code>、<code>seoTitle</code>、<code>seoKeywords</code>、<code>seoDescription</code>、<code>seoImage</code>、
                    <code>toolKey</code
                    >、<code>consumePoints</code>、<code>memberFree</code>、<code>status</code>、<code>sort</code>、<code>remark</code>。
                </div>
                <div class="catalog-overview-grid" v-if="toolsCatalogPreviewCards.length > 0">
                    <div
                        v-for="(item, index) in toolsCatalogPreviewCards.slice(0, 3)"
                        :key="`catalog-overview-${index}`"
                        class="catalog-overview-card"
                    >
                        <div class="catalog-overview-title">{{ item.title }}</div>
                        <div class="catalog-overview-meta">
                            {{ item.groupCount }}个分组 · {{ item.toolCount }}个工具
                        </div>
                        <div class="catalog-overview-samples" v-if="item.sampleTools.length > 0">
                            {{ item.sampleTools.join(' / ') }}
                        </div>
                    </div>
                </div>

                <a-textarea
                    class="catalog-json-editor"
                    v-model="toolsCategoryTreeEditor"
                    :auto-size="{ minRows: 18, maxRows: 28 }"
                    placeholder='请输入 JSON 数组，如：[{"title":"AI工具箱","list":[{"title":"AI对话","list":[{"title":"DeepSeek R1","url":"/tools/ai/deepseek-r1","toolKey":"ai-deepseek-r1","consumePoints":2,"memberFree":true,"status":1,"desc":"...","seoTitle":"DeepSeek R1 免费对话","seoKeywords":"DeepSeek R1,AI对话","seoDescription":"..."}]}]}]'
                />

                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered>一级分类 {{ toolsCategoryCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>二级分类 {{ toolsSubCategoryCount }}</a-tag>
                    <a-tag color="green" bordered>工具总数 {{ toolsTotalCount }}</a-tag>
                </div>

                <div v-if="toolsCategoryTreeParseError" class="catalog-error">
                    {{ toolsCategoryTreeParseError }}
                </div>
            </div>
        </a-card>

        <footer-btns v-if="!simpleMode" :fixed="false" v-perms="['setting:website:catalog:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteToolsCatalog">
import {
    getWebsite,
    setWebsite,
    syncWebsiteCatalogSeed,
    type WebsiteCatalogSyncResult
} from '@/api/setting/website'
import { getLogin, setLogin, type LoginSetup } from '@/api/setting/user'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'

interface ToolsCatalogToolItem {
    id?: number
    title: string
    url: string
    desc?: string
    logo?: unknown
    releaseDate?: string
    tags?: string[]
    icon?: string
    isNew?: boolean
    gradient?: string
    badge?: string
    text?: string
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
    seoImage?: string
    toolKey?: string
    consumePoints?: number
    memberFree?: boolean
    memberCore?: boolean
    status?: number
    sort?: number
    remark?: string
}

interface ToolsCatalogSubCategoryItem {
    id?: number
    title: string
    list: ToolsCatalogToolItem[]
}

interface ToolsCatalogCategoryItem {
    id?: number
    title: string
    icon?: string
    list: ToolsCatalogSubCategoryItem[]
}

interface ToolsCategoryTreeParseResult {
    items: ToolsCatalogCategoryItem[]
    error: string
}

interface ToolsCatalogPreviewCard {
    title: string
    groupCount: number
    toolCount: number
    sampleTools: string[]
}

interface ToolConsumeRuleItem {
    toolKey: string
    name: string
    consumePoints: number
    memberFree: number
    status: number
    sort: number
    remark: string
}

interface ToolPolicyPreviewRow extends ToolConsumeRuleItem {
    path: string
}

interface ToolKeyConflictRow {
    toolKey: string
    count: number
    positions: string[]
}

interface MemberCoreToolPreset {
    route: string
    toolKey: string
    title: string
}

interface FlattenedCatalogTool {
    tool: ToolsCatalogToolItem
    routeKey: string
    toolKey: string
    position: string
}

interface MemberCoreHealthIssue {
    key: string
    label: string
    count: number
    titles: string[]
    desc: string
}

const defaultToolsCategoryTreeJson = '[]'
const memberCoreToolPresets: MemberCoreToolPreset[] = [
    { route: '/tools/photo/background', toolKey: 'photo-background', title: '证件照换底色' },
    { route: '/tools/photo/transparent', toolKey: 'photo-transparent', title: '证件照免冠处理' },
    { route: '/tools/photo/crop', toolKey: 'photo-crop', title: '证件照尺寸裁剪' },
    { route: '/tools/photo/layout', toolKey: 'photo-layout', title: '证件照排版打印' },
    { route: '/tools/ai/deepseek-r1', toolKey: 'ai-deepseek-r1', title: 'DeepSeek R1 对话' },
    { route: '/tools/ai/deepseek', toolKey: 'ai-deepseek', title: 'DeepSeek AI 对话' },
    { route: '/tools/ai/ocr', toolKey: 'ai-ocr', title: 'AI OCR 识别' },
    { route: '/tools/ai/image-enhance', toolKey: 'ai-image-enhance', title: 'AI 图片变清晰' },
    { route: '/tools/ai/remove-watermark', toolKey: 'ai-remove-watermark', title: 'AI 智能去水印' },
    { route: '/tools/ai/work-summary', toolKey: 'ai-work-summary', title: '工作总结' },
    { route: '/tools/ai/work-summary?type=annual', toolKey: 'ai-work-summary-annual', title: '年度工作总结' },
    { route: '/tools/ai/office/custom-summary', toolKey: 'ai-office-custom-summary', title: '自定义总结' },
    { route: '/tools/ai/office/resume-creation', toolKey: 'ai-office-resume-creation', title: '简历制作' },
    { route: '/tools/ai/office/meeting-minutes', toolKey: 'ai-office-meeting-minutes', title: '润色会议纪要' },
    { route: '/tools/ai/analysis/research-report', toolKey: 'ai-analysis-research-report', title: '研究报告' },
    { route: '/tools/ai/analysis/business-plan', toolKey: 'ai-analysis-business-plan', title: '商业计划书写作' },
    { route: '/tools/ai/article-generator', toolKey: 'ai-article-generator', title: 'AI 文章生成' },
    { route: '/tools/ai/xiaohongshu-note', toolKey: 'ai-xiaohongshu-note', title: '小红书笔记生成' },
    { route: '/tools/video/compress', toolKey: 'video-compress', title: '视频压缩' },
    { route: '/tools/video/convert', toolKey: 'video-format-convert', title: '视频格式转换' }
]

const appStore = useAppStore()
const { getConfig } = appStore
const router = useRouter()
const pageTab = ref<
    'hot_tools' | 'frontend_layout' | 'sidebar' | 'header' | 'footer' | 'tools_catalog' | 'seo'
>('tools_catalog')
const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('工具主数据配置已保存')
/**
 * 函数说明：控制工具主数据页运营模式。简版仅保留核心 JSON 维护，高级模式显示策略与冲突排查面板。
 */
const simpleMode = ref(true)
const toolPolicySyncMode = ref<'append' | 'overwrite'>('append')
const syncToolConsumeRulesOnSeed = ref(true)
const baselineSnapshot = ref('')
const catalogHealthCollapseKeys = ref<(string | number)[]>([])

const formData = reactive<Record<string, string>>({
    toolsCategoryTree: defaultToolsCategoryTreeJson
})

const toolsCategoryTreeEditor = ref(defaultToolsCategoryTreeJson)

/**
 * 函数说明：处理官网设置标签切换，跳转到对应配置页面。
 */
const handlePageTabChange = (tabName: string | number) => {
    if (tabName === 'hot_tools') {
        router.push('/official_site/hot_tools')
        return
    }
    if (tabName === 'frontend_layout') {
        router.push('/official_site/frontend_layout')
        return
    }
    if (tabName === 'sidebar') {
        router.push('/official_site/sidebar')
        return
    }
    if (tabName === 'header') {
        router.push('/official_site/header')
        return
    }
    if (tabName === 'footer') {
        router.push('/official_site/footer')
        return
    }
    if (tabName === 'seo') {
        router.push('/official_site/seo')
    }
}

/**
 * 函数说明：跳转菜单设置页面，便于继续维护左侧一级菜单与固定入口。
 */
const goMenuSettings = () => {
    router.push('/official_site/sidebar')
}

/**
 * 函数说明：跳转到“登录与积分策略”页面，便于继续调整会员、风控和支付配置。
 */
const goToolPolicySettings = () => {
    router.push('/consumer/login_commerce')
}

/**
 * 函数说明：根据当前编辑态构建快照，便于判断是否存在未保存变更。
 */
const buildCatalogSnapshot = (): string => {
    return JSON.stringify({
        toolsCategoryTree: toolsCategoryTreeEditor.value.trim()
    })
}

/**
 * 函数说明：更新基线快照，表示当前编辑状态已保存。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildCatalogSnapshot()
}

/**
 * 函数说明：判断页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildCatalogSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：判断链接是否为允许格式，工具链接仅支持站内路径或 http(s) 链接。
 */
const isValidLinkValue = (link: string): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return false
    }
    if (value.startsWith('/')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：标准化 toolKey 文本，统一小写并移除首尾空格。
 */
const normalizeToolKeyText = (value: unknown): string => {
    const normalizedKey = String(value || '')
        .trim()
        .toLowerCase()
    const aliasMap: Record<string, string> = {
        'ai-work-summary-type-annual': 'ai-work-summary-annual',
        'video-convert': 'video-format-convert'
    }
    return aliasMap[normalizedKey] || normalizedKey
}

/**
 * 函数说明：标准化工具完整匹配路径，保留 query 用于区分同一路由下的细分工具。
 */
const normalizeToolRouteMatchKey = (toolUrl: string): string => {
    const rawValue = String(toolUrl || '').trim().split('#')[0]
    if (!rawValue) {
        return ''
    }
    const [rawPath, rawQuery = ''] = rawValue.split('?')
    const normalizedPath = rawPath === '/' ? '/' : rawPath.replace(/\/+$/g, '')
    const query = rawQuery.trim()
    return query ? `${normalizedPath}?${query}` : normalizedPath
}

/**
 * 函数说明：根据工具链接推导 toolKey，保留 query 并归并历史别名，保持与前台运行时门禁一致。
 */
const deriveToolKeyByUrl = (toolUrl: string): string => {
    const [rawPath, rawQuery = ''] = normalizeToolRouteMatchKey(toolUrl).split('?')
    const routeKey = rawPath
        .replace(/^\/tools\//, '')
        .replace(/^\/+|\/+$/g, '')
        .replace(/[/_]+/g, '-')
    const queryKey = Array.from(new URLSearchParams(rawQuery).entries())
        .map(([key, value]) => `${key}-${value}`)
        .join('-')
    return normalizeToolKeyText(
        [routeKey, queryKey]
            .filter(Boolean)
            .join('-')
            .replace(/[^a-z0-9]+/gi, '-')
    )
}

/**
 * 函数说明：生成工具在分类树中的定位路径，便于冲突提示和运营排查。
 */
const buildToolPositionPath = (
    categoryTitle: string,
    subCategoryTitle: string,
    toolTitle: string,
    toolUrl: string
): string => {
    const safeCategoryTitle = String(categoryTitle || '').trim() || '未命名分类'
    const safeSubCategoryTitle = String(subCategoryTitle || '').trim() || '未命名分组'
    const safeToolTitle = String(toolTitle || '').trim() || '未命名工具'
    const safeToolUrl = String(toolUrl || '').trim()
    return safeToolUrl
        ? `${safeCategoryTitle} / ${safeSubCategoryTitle} / ${safeToolTitle}（${safeToolUrl}）`
        : `${safeCategoryTitle} / ${safeSubCategoryTitle} / ${safeToolTitle}`
}

/**
 * 函数说明：解析工具分类树 JSON，返回结构化结果与错误信息。
 */
function parseToolsCategoryTreeImpl(jsonText: string): ToolsCategoryTreeParseResult {
    const trimmed = String(jsonText || '').trim()
    if (!trimmed) {
        return {
            items: [],
            error: ''
        }
    }

    try {
        const parsed = JSON.parse(trimmed)
        if (!Array.isArray(parsed)) {
            return {
                items: [],
                error: '工具分类配置必须是 JSON 数组'
            }
        }

        const categories = parsed
            .map((category) => {
                if (!category || typeof category !== 'object') {
                    return null
                }
                const categoryRecord = category as Record<string, unknown>
                const categoryTitle = String(categoryRecord.title || '').trim()
                const categoryIcon = String(categoryRecord.icon || '').trim()
                const categoryIdRaw = Number(categoryRecord.id)
                const categoryId =
                    Number.isFinite(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : undefined

                const subCategories = Array.isArray(categoryRecord.list)
                    ? categoryRecord.list
                          .map((subCategory) => {
                              if (!subCategory || typeof subCategory !== 'object') {
                                  return null
                              }
                              const subCategoryRecord = subCategory as Record<string, unknown>
                              const subCategoryTitle = String(subCategoryRecord.title || '').trim()
                              const subCategoryIdRaw = Number(subCategoryRecord.id)
                              const subCategoryId =
                                  Number.isFinite(subCategoryIdRaw) && subCategoryIdRaw > 0
                                      ? subCategoryIdRaw
                                      : undefined

                              const tools = Array.isArray(subCategoryRecord.list)
                                  ? subCategoryRecord.list
                                        .map((tool) => {
                                            if (!tool || typeof tool !== 'object') {
                                                return null
                                            }
                                            const toolRecord = tool as Record<string, unknown>
                                            const title = String(toolRecord.title || '').trim()
                                            const url = String(toolRecord.url || '').trim()
                                            const desc = String(toolRecord.desc || '').trim()
                                            const logo = toolRecord.logo
                                            const releaseDate = String(
                                                toolRecord.releaseDate || ''
                                            ).trim()
                                            const icon = String(toolRecord.icon || '').trim()
                                            const gradient = String(
                                                toolRecord.gradient || ''
                                            ).trim()
                                            const badge = String(toolRecord.badge || '').trim()
                                            const text = String(toolRecord.text || '').trim()
                                            const seoTitle = String(
                                                toolRecord.seoTitle || ''
                                            ).trim()
                                            const seoKeywords = String(
                                                toolRecord.seoKeywords || ''
                                            ).trim()
                                            const seoDescription = String(
                                                toolRecord.seoDescription || ''
                                            ).trim()
                                            const seoImage = String(
                                                toolRecord.seoImage || ''
                                            ).trim()
                                            const toolKey = String(toolRecord.toolKey || '')
                                                .trim()
                                                .toLowerCase()
                                            const consumePointsRaw = Number(
                                                toolRecord.consumePoints
                                            )
                                            const consumePoints =
                                                Number.isFinite(consumePointsRaw) &&
                                                consumePointsRaw >= 0
                                                    ? Math.floor(consumePointsRaw)
                                                    : undefined
                                            const memberFree =
                                                typeof toolRecord.memberFree === 'boolean'
                                                    ? toolRecord.memberFree
                                                    : undefined
                                            const memberCore =
                                                typeof toolRecord.memberCore === 'boolean'
                                                    ? toolRecord.memberCore
                                                    : undefined
                                            const statusRaw = Number(toolRecord.status)
                                            const status = Number.isFinite(statusRaw)
                                                ? statusRaw === 0
                                                    ? 0
                                                    : 1
                                                : undefined
                                            const sortRaw = Number(toolRecord.sort)
                                            const sort = Number.isFinite(sortRaw)
                                                ? Math.max(0, Math.floor(sortRaw))
                                                : undefined
                                            const remark = String(toolRecord.remark || '').trim()
                                            const tags = Array.isArray(toolRecord.tags)
                                                ? toolRecord.tags
                                                      .map((tag) => String(tag || '').trim())
                                                      .filter(Boolean)
                                                : []
                                            const isNew = Boolean(toolRecord.isNew)
                                            const toolIdRaw = Number(toolRecord.id)
                                            const toolId =
                                                Number.isFinite(toolIdRaw) && toolIdRaw > 0
                                                    ? toolIdRaw
                                                    : undefined
                                            if (
                                                !title &&
                                                !url &&
                                                !desc &&
                                                !logo &&
                                                !toolId &&
                                                !seoTitle &&
                                                !seoDescription &&
                                                !toolKey
                                            ) {
                                                return null
                                            }
                                            return {
                                                ...(toolId ? { id: toolId } : {}),
                                                title,
                                                url,
                                                ...(desc ? { desc } : {}),
                                                ...(logo ? { logo } : {}),
                                                ...(releaseDate ? { releaseDate } : {}),
                                                ...(tags.length > 0 ? { tags } : {}),
                                                ...(icon ? { icon } : {}),
                                                ...(isNew ? { isNew } : {}),
                                                ...(gradient ? { gradient } : {}),
                                                ...(badge ? { badge } : {}),
                                                ...(text ? { text } : {}),
                                                ...(seoTitle ? { seoTitle } : {}),
                                                ...(seoKeywords ? { seoKeywords } : {}),
                                                ...(seoDescription ? { seoDescription } : {}),
                                                ...(seoImage ? { seoImage } : {}),
                                                ...(toolKey ? { toolKey } : {}),
                                                ...(consumePoints !== undefined
                                                    ? { consumePoints }
                                                    : {}),
                                                ...(memberFree !== undefined ? { memberFree } : {}),
                                                ...(memberCore !== undefined ? { memberCore } : {}),
                                                ...(status !== undefined ? { status } : {}),
                                                ...(sort !== undefined ? { sort } : {}),
                                                ...(remark ? { remark } : {})
                                            } as ToolsCatalogToolItem
                                        })
                                        .filter((tool): tool is ToolsCatalogToolItem =>
                                            Boolean(tool)
                                        )
                                  : []

                              if (!subCategoryTitle && tools.length === 0 && !subCategoryId) {
                                  return null
                              }
                              return {
                                  ...(subCategoryId ? { id: subCategoryId } : {}),
                                  title: subCategoryTitle,
                                  list: tools
                              } as ToolsCatalogSubCategoryItem
                          })
                          .filter((subCategory): subCategory is ToolsCatalogSubCategoryItem =>
                              Boolean(subCategory)
                          )
                    : []

                if (!categoryTitle && subCategories.length === 0 && !categoryId && !categoryIcon) {
                    return null
                }
                return {
                    ...(categoryId ? { id: categoryId } : {}),
                    title: categoryTitle,
                    ...(categoryIcon ? { icon: categoryIcon } : {}),
                    list: subCategories
                } as ToolsCatalogCategoryItem
            })
            .filter((category): category is ToolsCatalogCategoryItem => Boolean(category))

        return {
            items: categories,
            error: ''
        }
    } catch (error) {
        return {
            items: [],
            error: `工具分类 JSON 解析失败：${(error as Error).message}`
        }
    }
}

/**
 * 函数说明：工具分类树解析统一入口，提前建立可调用引用，规避初始化顺序导致的运行时报错。
 */
const parseToolsCategoryTree = (jsonText: string): ToolsCategoryTreeParseResult => {
    return parseToolsCategoryTreeImpl(jsonText)
}

/**
 * 函数说明：实时解析工具分类树编辑内容，输出可用于统计和校验的结构化数据。
 */
const toolsCategoryTreeParseResult = computed<ToolsCategoryTreeParseResult>(() => {
    return parseToolsCategoryTree(toolsCategoryTreeEditor.value)
})

/**
 * 函数说明：提取工具分类树解析错误，供页面即时提示。
 */
const toolsCategoryTreeParseError = computed<string>(() => toolsCategoryTreeParseResult.value.error)

/**
 * 函数说明：统计工具一级分类数量。
 */
const toolsCategoryCount = computed<number>(() => toolsCategoryTreeParseResult.value.items.length)

/**
 * 函数说明：统计工具二级分类数量。
 */
const toolsSubCategoryCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce(
        (count, category) => count + category.list.length,
        0
    )
})

/**
 * 函数说明：统计工具总数，便于运营确认配置规模。
 */
const toolsTotalCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce((toolCount, category) => {
        return (
            toolCount +
            category.list.reduce(
                (subToolCount, subCategory) => subToolCount + subCategory.list.length,
                0
            )
        )
    }, 0)
})

/**
 * 函数说明：生成工具分类树摘要卡片，帮助运营不用阅读 JSON 也能理解当前结构。
 */
const toolsCatalogPreviewCards = computed<ToolsCatalogPreviewCard[]>(() => {
    return toolsCategoryTreeParseResult.value.items.map((category) => {
        const sampleTools = category.list
            .flatMap((subCategory) =>
                subCategory.list.map((tool) => String(tool.title || '').trim()).filter(Boolean)
            )
            .slice(0, 3)
        return {
            title: category.title.trim() || '未命名分类',
            groupCount: category.list.length,
            toolCount: category.list.reduce(
                (count, subCategory) => count + subCategory.list.length,
                0
            ),
            sampleTools
        }
    })
})

/**
 * 函数说明：统计已补充 SEO 字段的工具数量，帮助运营快速判断当前主数据的 SEO 完整度。
 */
const toolsSeoConfiguredCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce((count, category) => {
        return (
            count +
            category.list.reduce((subCount, subCategory) => {
                return (
                    subCount +
                    subCategory.list.filter((tool) => {
                        return Boolean(
                            String(tool.seoTitle || '').trim() ||
                                String(tool.seoKeywords || '').trim() ||
                                String(tool.seoDescription || '').trim() ||
                                String(tool.seoImage || '').trim()
                        )
                    }).length
                )
            }, 0)
        )
    }, 0)
})

/**
 * 函数说明：检查工具分类树中是否存在重复工具 URL，避免路由与统计冲突。
 */
const collectDuplicateToolUrlWarnings = (categories: ToolsCatalogCategoryItem[]): string[] => {
    const warningMessages: string[] = []
    const urlPathMap = new Map<string, string[]>()
    categories.forEach((category) => {
        category.list.forEach((subCategory) => {
            subCategory.list.forEach((tool, toolIndex) => {
                const url = String(tool.url || '').trim()
                if (!url) {
                    return
                }
                const path = `${category.title || '未命名分类'} / ${
                    subCategory.title || '未命名分组'
                } / ${tool.title || `第${toolIndex + 1}个工具`}`
                const paths = urlPathMap.get(url) || []
                paths.push(path)
                urlPathMap.set(url, paths)
            })
        })
    })
    urlPathMap.forEach((paths, url) => {
        if (paths.length > 1) {
            warningMessages.push(`工具链接重复：${url}（${paths.join('；')}）`)
        }
    })
    return warningMessages
}

/**
 * 函数说明：收集工具分类树中的 toolKey 冲突明细，定位到分类/分组/工具，便于策略同步前排查。
 */
const collectToolKeyConflicts = (categories: ToolsCatalogCategoryItem[]): ToolKeyConflictRow[] => {
    const toolKeyPositionMap = new Map<string, string[]>()
    categories.forEach((category) => {
        category.list.forEach((subCategory) => {
            subCategory.list.forEach((tool) => {
                const toolUrl = String(tool.url || '').trim()
                const resolvedToolKey = normalizeToolKeyText(
                    tool.toolKey || deriveToolKeyByUrl(toolUrl)
                )
                if (!resolvedToolKey) {
                    return
                }
                const position = buildToolPositionPath(
                    category.title,
                    subCategory.title,
                    tool.title,
                    toolUrl
                )
                const positions = toolKeyPositionMap.get(resolvedToolKey) || []
                positions.push(position)
                toolKeyPositionMap.set(resolvedToolKey, positions)
            })
        })
    })
    return Array.from(toolKeyPositionMap.entries())
        .filter(([, positions]) => positions.length > 1)
        .map(([toolKey, positions]) => ({
            toolKey,
            count: positions.length,
            positions
        }))
        .sort(
            (currentItem, nextItem) =>
                nextItem.count - currentItem.count ||
                currentItem.toolKey.localeCompare(nextItem.toolKey)
        )
}

/**
 * 函数说明：收集工具分类页校验提示，供统一运营提示与体检使用。
 */
const collectCatalogValidationTips = (): string[] => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        return [result.error]
    }
    const toolUrlWarnings = collectDuplicateToolUrlWarnings(result.items)
    const toolKeyWarnings = collectToolKeyConflicts(result.items).map((item) => {
        return `toolKey 冲突：${item.toolKey}（共 ${item.count} 处）`
    })
    const memberCoreWarnings = collectMemberCoreHealthIssues().map((item) => {
        return `${item.label}：${item.count} 个（${item.desc}）`
    })
    return [...toolUrlWarnings, ...toolKeyWarnings, ...memberCoreWarnings].slice(0, 12)
}

const catalogValidationTips = computed<string[]>(() => collectCatalogValidationTips())
const duplicateToolUrlWarningCount = computed<number>(
    () => collectDuplicateToolUrlWarnings(toolsCategoryTreeParseResult.value.items).length
)
const toolKeyConflictRows = computed<ToolKeyConflictRow[]>(() =>
    collectToolKeyConflicts(toolsCategoryTreeParseResult.value.items)
)
const toolKeyConflictCount = computed<number>(() => toolKeyConflictRows.value.length)

/**
 * 函数说明：根据工具分类树生成“工具执行策略”种子规则，支持从工具项覆盖 consumePoints/memberFree/status。
 */
const toolPolicySeedRules = computed<ToolPolicyPreviewRow[]>(() => {
    const rows: ToolPolicyPreviewRow[] = []
    toolsCategoryTreeParseResult.value.items.forEach((category, categoryIndex) => {
        category.list.forEach((subCategory, subCategoryIndex) => {
            subCategory.list.forEach((tool, toolIndex) => {
                const toolUrl = String(tool.url || '').trim()
                const derivedToolKey = normalizeToolKeyText(
                    tool.toolKey || deriveToolKeyByUrl(toolUrl)
                )
                if (!derivedToolKey) {
                    return
                }
                const consumePointsRaw = Number(tool.consumePoints)
                const consumePoints = Number.isFinite(consumePointsRaw)
                    ? Math.max(0, Math.floor(consumePointsRaw))
                    : 1
                const memberFree = tool.memberFree === false ? 0 : 1
                const statusRaw = Number(tool.status)
                const status = Number.isFinite(statusRaw) ? (statusRaw === 0 ? 0 : 1) : 1
                const sortRaw = Number(tool.sort)
                const sort = Number.isFinite(sortRaw)
                    ? Math.max(0, Math.floor(sortRaw))
                    : categoryIndex * 10000 + subCategoryIndex * 100 + toolIndex + 1
                rows.push({
                    toolKey: derivedToolKey,
                    name: String(tool.title || '').trim() || derivedToolKey,
                    consumePoints,
                    memberFree,
                    status,
                    sort,
                    remark: String(tool.remark || '').trim(),
                    path: toolUrl
                })
            })
        })
    })
    return rows
})

/**
 * 函数说明：扁平化工具分类树，输出每个工具的路由、toolKey 和运营定位，供会员核心体检复用。
 */
const flattenCatalogTools = (categories: ToolsCatalogCategoryItem[]): FlattenedCatalogTool[] => {
    return categories.flatMap((category) => {
        return category.list.flatMap((subCategory) => {
            return subCategory.list.map((tool) => {
                const toolUrl = String(tool.url || '').trim()
                return {
                    tool,
                    routeKey: normalizeToolRouteMatchKey(toolUrl),
                    toolKey: normalizeToolKeyText(tool.toolKey || deriveToolKeyByUrl(toolUrl)),
                    position: buildToolPositionPath(
                        category.title,
                        subCategory.title,
                        tool.title,
                        toolUrl
                    )
                }
            })
        })
    })
}

const flattenedCatalogTools = computed<FlattenedCatalogTool[]>(() =>
    flattenCatalogTools(toolsCategoryTreeParseResult.value.items)
)

/**
 * 函数说明：按路由或 toolKey 查找会员核心工具主数据，兼容 query 路由与历史路径别名。
 */
const findMemberCoreCatalogTool = (
    preset: MemberCoreToolPreset,
    tools: FlattenedCatalogTool[]
): FlattenedCatalogTool | undefined => {
    const presetRouteKey = normalizeToolRouteMatchKey(preset.route)
    const presetToolKey = normalizeToolKeyText(preset.toolKey)
    return tools.find((item) => item.routeKey === presetRouteKey || item.toolKey === presetToolKey)
}

/**
 * 函数说明：判断工具是否补齐前台卖点配置，后台主数据页以简介或 SEO 描述作为可展示卖点来源。
 */
const hasCatalogSellingPoint = (tool: ToolsCatalogToolItem): boolean => {
    return Boolean(
        String(tool.desc || '').trim() ||
            String(tool.text || '').trim() ||
            String(tool.seoDescription || '').trim()
    )
}

/**
 * 函数说明：收集 20 个会员核心工具的只读体检问题，不自动改动主数据或计费策略。
 */
const collectMemberCoreHealthIssues = (): MemberCoreHealthIssue[] => {
    const tools = flattenedCatalogTools.value
    const issueMap = new Map<string, MemberCoreHealthIssue>()

    const pushIssue = (key: string, label: string, title: string, desc: string) => {
        const currentItem = issueMap.get(key) || {
            key,
            label,
            count: 0,
            titles: [],
            desc
        }
        currentItem.count += 1
        if (currentItem.titles.length < 6) {
            currentItem.titles.push(title)
        }
        issueMap.set(key, currentItem)
    }

    memberCoreToolPresets.forEach((preset) => {
        const catalogTool = findMemberCoreCatalogTool(preset, tools)
        if (!catalogTool) {
            pushIssue('missing-entry', '缺前台入口', preset.title, '核心工具没有命中工具主数据入口')
            return
        }
        const { tool } = catalogTool
        if (!String(tool.toolKey || '').trim()) {
            pushIssue('missing-tool-key', '缺 toolKey', preset.title, '建议显式配置 toolKey，避免后续推导变动')
        }
        if (!Number.isFinite(Number(tool.consumePoints))) {
            pushIssue('missing-consume-points', '缺 consumePoints', preset.title, '建议显式配置运行扣分')
        }
        if (tool.memberCore !== true) {
            pushIssue('missing-member-core', '缺 memberCore', preset.title, '建议标记 memberCore=true，便于前台运营识别')
        }
        if (!hasCatalogSellingPoint(tool)) {
            pushIssue('missing-selling-point', '缺卖点配置', preset.title, '建议补充 desc/text/seoDescription')
        }
    })

    return Array.from(issueMap.values())
}

const memberCoreHealthIssues = computed<MemberCoreHealthIssue[]>(() => collectMemberCoreHealthIssues())

const memberCoreReadyCount = computed<number>(() => {
    const tools = flattenedCatalogTools.value
    return memberCoreToolPresets.filter((preset) => {
        const catalogTool = findMemberCoreCatalogTool(preset, tools)
        if (!catalogTool) {
            return false
        }
        return (
            String(catalogTool.tool.toolKey || '').trim() &&
            Number.isFinite(Number(catalogTool.tool.consumePoints)) &&
            catalogTool.tool.memberCore === true &&
            hasCatalogSellingPoint(catalogTool.tool)
        )
    }).length
})

/**
 * 函数说明：生成会员核心工具体检总览文案，用于运营判断是否可以进入前台体验打磨。
 */
const memberCoreHealthSummary = computed(() => {
    if (toolsCategoryTreeParseError.value) {
        return {
            title: '先修复 JSON 解析异常',
            desc: '工具分类树解析失败，暂时无法计算 20 个会员核心工具体检摘要。'
        }
    }
    if (memberCoreHealthIssues.value.length === 0) {
        return {
            title: '20 个会员核心工具主数据已收口',
            desc: '入口、显式 toolKey、扣分、memberCore 标记和卖点配置均已覆盖，可继续打磨页面体验。'
        }
    }
    return {
        title: `${memberCoreReadyCount.value} / ${memberCoreToolPresets.length} 个核心工具配置完整`,
        desc: '下方只提示缺失项，不自动改策略；建议先补主数据，再同步计费策略并前端预览。'
    }
})

/**
 * 函数说明：生成会员核心工具体检指标卡，控制文案长度，避免后台工作区被长列表撑开。
 */
const memberCoreHealthMetrics = computed(() => {
    const issueCountMap = new Map(memberCoreHealthIssues.value.map((item) => [item.key, item.count]))
    const buildMetric = (key: string, label: string, desc: string) => {
        const count = issueCountMap.get(key) || 0
        return {
            key,
            label,
            value: count > 0 ? `${count} 个` : '已覆盖',
            desc,
            className: count > 0 ? 'is-warning' : 'is-ok'
        }
    }
    return [
        {
            key: 'ready',
            label: '完整工具',
            value: `${memberCoreReadyCount.value} / ${memberCoreToolPresets.length}`,
            desc: '同时具备入口、toolKey、扣分、核心标记和卖点。',
            className:
                memberCoreReadyCount.value === memberCoreToolPresets.length ? 'is-ok' : 'is-warning'
        },
        buildMetric('missing-entry', '缺前台入口', '未在工具主数据中命中对应路由或 toolKey。'),
        buildMetric('missing-tool-key', '缺 toolKey', '缺显式 toolKey 会影响策略和统计稳定性。'),
        buildMetric('missing-consume-points', '缺扣分', '建议在主数据中显式写入 consumePoints。'),
        buildMetric('missing-member-core', '缺核心标记', '建议补 memberCore=true 作为运营识别字段。'),
        buildMetric('missing-selling-point', '缺卖点', '建议补 desc/text/seoDescription。')
    ]
})

const memberCoreHealthWarnings = computed<string[]>(() => {
    return memberCoreHealthIssues.value.flatMap((issue) => {
        const titleText = issue.titles.join('、')
        return titleText ? [`${issue.label}：${titleText}`] : []
    }).slice(0, 8)
})

/**
 * 函数说明：统计工具主数据中带有策略覆盖字段的工具数量，便于运营评估覆盖度。
 */
const toolPolicyOverrideCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce((count, category) => {
        return (
            count +
            category.list.reduce((subCount, subCategory) => {
                return (
                    subCount +
                    subCategory.list.filter((tool) => {
                        return (
                            String(tool.toolKey || '').trim() !== '' ||
                            Number.isFinite(Number(tool.consumePoints)) ||
                            typeof tool.memberFree === 'boolean' ||
                            Number.isFinite(Number(tool.status)) ||
                            Number.isFinite(Number(tool.sort)) ||
                            String(tool.remark || '').trim() !== ''
                        )
                    }).length
                )
            }, 0)
        )
    }, 0)
})

/**
 * 函数说明：校验工具分类树配置，确保分类/分组/工具的核心字段完整。
 */
const validateToolsCategoryTree = (): boolean => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        feedback.msgError(result.error)
        return false
    }

    for (let categoryIndex = 0; categoryIndex < result.items.length; categoryIndex++) {
        const category = result.items[categoryIndex]
        if (!category.title.trim()) {
            feedback.msgError(`工具分类 第${categoryIndex + 1}项：分类标题不能为空`)
            return false
        }
        if (!Array.isArray(category.list) || category.list.length === 0) {
            feedback.msgError(`工具分类「${category.title}」至少需要 1 个二级分组`)
            return false
        }
        for (
            let subCategoryIndex = 0;
            subCategoryIndex < category.list.length;
            subCategoryIndex++
        ) {
            const subCategory = category.list[subCategoryIndex]
            if (!subCategory.title.trim()) {
                feedback.msgError(
                    `工具分类「${category.title}」第${subCategoryIndex + 1}个分组：标题不能为空`
                )
                return false
            }
            if (!Array.isArray(subCategory.list) || subCategory.list.length === 0) {
                feedback.msgError(
                    `工具分组「${category.title} / ${subCategory.title}」至少需要 1 个工具`
                )
                return false
            }
            for (let toolIndex = 0; toolIndex < subCategory.list.length; toolIndex++) {
                const tool = subCategory.list[toolIndex]
                if (!tool.title.trim()) {
                    feedback.msgError(
                        `工具分组「${category.title} / ${subCategory.title}」第${
                            toolIndex + 1
                        }个工具：标题不能为空`
                    )
                    return false
                }
                const url = String(tool.url || '').trim()
                if (!url) {
                    feedback.msgError(`工具「${tool.title}」链接不能为空`)
                    return false
                }
                if (!isValidLinkValue(url)) {
                    feedback.msgError(`工具「${tool.title}」链接需为 / 或 http(s) 开头`)
                    return false
                }
                const toolKey = normalizeToolKeyText(tool.toolKey || '')
                if (tool.toolKey && !toolKey) {
                    feedback.msgError(
                        `工具「${tool.title}」toolKey 格式无效，请仅使用字母、数字、-、_ 组合`
                    )
                    return false
                }
                const consumePointsRaw = Number(tool.consumePoints)
                if (
                    tool.consumePoints !== undefined &&
                    (!Number.isFinite(consumePointsRaw) || consumePointsRaw < 0)
                ) {
                    feedback.msgError(`工具「${tool.title}」consumePoints 需为大于等于 0 的数字`)
                    return false
                }
                const seoImage = String(tool.seoImage || '').trim()
                if (seoImage && !seoImage.startsWith('/') && !/^https?:\/\//i.test(seoImage)) {
                    feedback.msgError(`工具「${tool.title}」SEO 分享图需为 / 或 http(s) 开头`)
                    return false
                }
            }
        }
    }
    return true
}

/**
 * 函数说明：格式化工具分类树 JSON，便于运营编辑与排查。
 */
const formatToolsCategoryTreeEditor = () => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        feedback.msgError(result.error)
        return
    }
    toolsCategoryTreeEditor.value = JSON.stringify(result.items, null, 2)
}

/**
 * 函数说明：重置工具分类树编辑器内容为空数组，触发前端回退内置工具库。
 */
const resetToolsCategoryTreeEditor = () => {
    toolsCategoryTreeEditor.value = defaultToolsCategoryTreeJson
}

/**
 * 函数说明：读取网站配置并回填工具分类树编辑区。
 */
const getData = async () => {
    const data = await getWebsite()
    formData.toolsCategoryTree = String(data.toolsCategoryTree || defaultToolsCategoryTreeJson)
    toolsCategoryTreeEditor.value =
        formData.toolsCategoryTree.trim() || defaultToolsCategoryTreeJson
    updateBaselineSnapshot()
}

/**
 * 函数说明：重新读取后台工具主数据配置，方便脚本导入或多人协作后立即回显最新数据。
 */
const reloadCatalogData = async () => {
    await getData()
    feedback.msgSuccess('已重新加载后台工具主数据配置')
}

/**
 * 函数说明：打开 tools 前端首页预览，便于运营保存后立即回归。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：从后台工具主数据页直接触发前端高频工具批量同步，避免后续继续依赖命令行脚本。
 */
const syncFrontendToolCatalogSeed = async () => {
    await feedback.confirm(
        syncToolConsumeRulesOnSeed.value
            ? '将按当前前端默认工具树批量同步高频工具主数据，并把策略字段写入登录与积分策略，是否继续？'
            : '将按当前前端默认工具树批量同步高频工具主数据，本次不写入登录与积分策略，是否继续？'
    )
    let successText = '高频工具主数据同步完成'
    await runSubmit(
        async () => {
            const syncResult = (await syncWebsiteCatalogSeed({
                force: 1,
                syncToolConsumeRules: syncToolConsumeRulesOnSeed.value ? 1 : 0
            })) as WebsiteCatalogSyncResult
            await getConfig()
            await getData()
            successText = `批量同步完成：${syncResult.categoryCount} 个一级分类，${
                syncResult.toolCount
            } 个工具，${syncResult.explicitToolKeyCount} 个显式 toolKey，${
                syncResult.strategyFieldToolCount
            } 个策略字段工具，${syncResult.toolConsumeRuleCount || 0} 条积分策略`
        },
        { successText: () => successText }
    )
}

/**
 * 函数说明：执行工具分类配置体检，输出首条异常或成功反馈。
 */
const runCatalogHealthCheck = () => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        feedback.alertWarning(`配置体检未通过：${result.error}`)
        return
    }
    const duplicateWarnings = collectDuplicateToolUrlWarnings(result.items)
    if (duplicateWarnings.length > 0) {
        feedback.alertWarning(`配置体检未通过：${duplicateWarnings[0]}`)
        return
    }
    const toolKeyConflicts = collectToolKeyConflicts(result.items)
    if (toolKeyConflicts.length > 0) {
        feedback.alertWarning(
            `配置体检未通过：toolKey 冲突 ${toolKeyConflicts[0].toolKey}（${toolKeyConflicts[0].count}处）`
        )
        return
    }
    const memberCoreIssues = collectMemberCoreHealthIssues()
    if (memberCoreIssues.length > 0) {
        const firstIssue = memberCoreIssues[0]
        feedback.alertWarning(
            `核心工具体检提示：${firstIssue.label} ${firstIssue.count} 个。${firstIssue.desc}。本提示只做导向，不会自动改策略。`
        )
        return
    }
    if (result.items.length === 0) {
        feedback.msgSuccess('当前工具分类树为 []，前端会自动回退到内置工具库')
        return
    }
    feedback.msgSuccess('配置体检通过：工具分类结构、工具链接和 20 个会员核心工具主数据正常')
}

/**
 * 函数说明：将登录配置中的工具计费规则统一清洗为数组结构，兼容字符串 JSON 与对象数组。
 */
const parseToolConsumeRulesConfig = (value: unknown): ToolConsumeRuleItem[] => {
    let sourceList: unknown[] = []
    if (Array.isArray(value)) {
        sourceList = value
    } else if (typeof value === 'string') {
        const text = value.trim()
        if (text) {
            try {
                const parsed = JSON.parse(text)
                if (Array.isArray(parsed)) {
                    sourceList = parsed
                }
            } catch {
                sourceList = []
            }
        }
    }
    const dedupe = new Set<string>()
    const result: ToolConsumeRuleItem[] = []
    sourceList.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            return
        }
        const record = item as Record<string, unknown>
        const toolKey = normalizeToolKeyText(record.toolKey)
        if (!toolKey || dedupe.has(toolKey)) {
            return
        }
        dedupe.add(toolKey)
        const consumePointsRaw = Number(record.consumePoints)
        const sortRaw = Number(record.sort)
        result.push({
            toolKey,
            name: String(record.name || '').trim() || toolKey,
            consumePoints: Number.isFinite(consumePointsRaw)
                ? Math.max(0, Math.floor(consumePointsRaw))
                : 1,
            memberFree: Number(record.memberFree ?? 1) === 0 ? 0 : 1,
            status: Number(record.status ?? 1) === 0 ? 0 : 1,
            sort: Number.isFinite(sortRaw) ? Math.max(0, Math.floor(sortRaw)) : index + 1,
            remark: String(record.remark || '').trim()
        })
    })
    return result
}

/**
 * 函数说明：按“全量覆盖”模式重建工具执行策略；当前工具主数据中的 toolKey 为主，旧规则会被淘汰。
 */
const buildOverwriteToolPolicyRules = (
    seedRules: ToolPolicyPreviewRow[],
    existingRules: ToolConsumeRuleItem[]
): ToolConsumeRuleItem[] => {
    const existingMap = new Map<string, ToolConsumeRuleItem>()
    existingRules.forEach((item) => {
        existingMap.set(item.toolKey, item)
    })
    const mergedRules: ToolConsumeRuleItem[] = []
    const dedupe = new Set<string>()
    seedRules.forEach((seedRule, index) => {
        if (!seedRule.toolKey || dedupe.has(seedRule.toolKey)) {
            return
        }
        dedupe.add(seedRule.toolKey)
        const existed = existingMap.get(seedRule.toolKey)
        mergedRules.push({
            toolKey: seedRule.toolKey,
            name: seedRule.name || existed?.name || seedRule.toolKey,
            consumePoints: Number.isFinite(Number(seedRule.consumePoints))
                ? Math.max(0, Math.floor(Number(seedRule.consumePoints)))
                : Number.isFinite(Number(existed?.consumePoints))
                ? Math.max(0, Math.floor(Number(existed?.consumePoints)))
                : 1,
            memberFree: seedRule.memberFree === 0 ? 0 : existed?.memberFree === 0 ? 0 : 1,
            status: seedRule.status === 0 ? 0 : existed?.status === 0 ? 0 : 1,
            sort: Number.isFinite(Number(seedRule.sort))
                ? Math.max(0, Math.floor(Number(seedRule.sort)))
                : Number.isFinite(Number(existed?.sort))
                ? Math.max(0, Math.floor(Number(existed?.sort)))
                : index + 1,
            remark: seedRule.remark || existed?.remark || ''
        })
    })
    return mergedRules
}

/**
 * 函数说明：按“仅新增不覆盖”模式补齐工具执行策略；已有 toolKey 保持原配置，仅追加缺失规则。
 */
const buildAppendToolPolicyRules = (
    seedRules: ToolPolicyPreviewRow[],
    existingRules: ToolConsumeRuleItem[]
): ToolConsumeRuleItem[] => {
    const existingMap = new Map<string, ToolConsumeRuleItem>()
    existingRules.forEach((item) => {
        existingMap.set(item.toolKey, item)
    })
    const result: ToolConsumeRuleItem[] = existingRules.map((item) => ({ ...item }))
    seedRules.forEach((seedRule, index) => {
        if (!seedRule.toolKey || existingMap.has(seedRule.toolKey)) {
            return
        }
        result.push({
            toolKey: seedRule.toolKey,
            name: seedRule.name || seedRule.toolKey,
            consumePoints: Math.max(0, Math.floor(Number(seedRule.consumePoints || 1))),
            memberFree: seedRule.memberFree === 0 ? 0 : 1,
            status: seedRule.status === 0 ? 0 : 1,
            sort: Number.isFinite(Number(seedRule.sort))
                ? Math.max(0, Math.floor(Number(seedRule.sort)))
                : existingRules.length + index + 1,
            remark: seedRule.remark || ''
        })
    })
    return result
}

/**
 * 函数说明：一键将“工具主数据”同步为“登录与积分策略”的工具规则，减少运营双维护成本。
 */
const syncToolPoliciesToLoginConfig = async () => {
    if (!validateToolsCategoryTree()) {
        return
    }
    if (!toolPolicySeedRules.value.length) {
        feedback.msgWarning('当前工具主数据未生成可同步的 toolKey 规则，请先补齐工具链接')
        return
    }
    if (toolKeyConflictCount.value > 0) {
        feedback.msgError(`检测到 ${toolKeyConflictCount.value} 项 toolKey 冲突，请先修正后再同步`)
        return
    }
    let successText = '工具执行策略同步完成'
    await runSubmit(
        async () => {
            const loginConfig = await getLogin()
            const existingRules = parseToolConsumeRulesConfig(
                (loginConfig as Record<string, unknown>).toolConsumeRules
            )
            const mergedRules =
                toolPolicySyncMode.value === 'overwrite'
                    ? buildOverwriteToolPolicyRules(toolPolicySeedRules.value, existingRules)
                    : buildAppendToolPolicyRules(toolPolicySeedRules.value, existingRules)
            const payload: LoginSetup = {
                ...(loginConfig as LoginSetup),
                toolConsumeRules: mergedRules
            }
            await setLogin(payload)
            await getConfig()
            if (toolPolicySyncMode.value === 'overwrite') {
                successText = `已按全量覆盖模式同步 ${mergedRules.length} 条工具执行策略`
                return
            }
            const addedCount = Math.max(0, mergedRules.length - existingRules.length)
            successText = `已按仅新增模式补充 ${addedCount} 条工具执行策略（当前共 ${mergedRules.length} 条）`
        },
        { successText: () => successText }
    )
}

/**
 * 函数说明：保存工具分类树配置到网站配置项，仅提交当前页面相关字段。
 */
const handleSubmit = async () => {
    if (!validateToolsCategoryTree()) {
        return
    }
    await runSubmit(async () => {
        await setWebsite({
            toolsCategoryTree: JSON.stringify(
                parseToolsCategoryTree(toolsCategoryTreeEditor.value).items
            )
        })
        await getConfig()
        await getData()
    })
}

/**
 * 函数说明：浏览器刷新或关闭前提醒未保存变更，减少运营误操作。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提示未保存变更，防止编辑中断。
 */
onBeforeRouteLeave(async () => {
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
.pro-page-shell {
    padding-bottom: 24px;
}

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

.page-card {
    border-radius: 8px;
}

.catalog-command-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 8px;
    background: var(--color-fill-1, #f7f8fa);
}

.catalog-command-bar__status,
.catalog-command-bar__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.catalog-command-bar__actions {
    justify-content: flex-end;
}

.catalog-simple-workspace {
    padding: 16px 0;
    border-top: 1px solid var(--color-border-2);
    border-bottom: 1px solid var(--color-border-2);
}

.catalog-simple-workspace__main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.catalog-simple-workspace__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
}

.catalog-simple-workspace__desc {
    max-width: 760px;
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.catalog-simple-workspace__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
}

.catalog-simple-workspace__metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    margin-top: 14px;
    border: 1px solid var(--color-border-2);
    background: var(--color-border-2);
}

.catalog-simple-workspace__metrics > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    padding: 10px 12px;
    background: var(--color-bg-2);
    font-size: 12px;
    color: var(--color-text-3);
}

.catalog-simple-workspace__metrics strong {
    color: var(--color-text-1);
}

.catalog-simple-workspace__metrics strong.is-danger {
    color: rgb(var(--red-6));
}

.catalog-health-collapse {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 8px;
    overflow: hidden;

    :deep(.arco-collapse-item-header) {
        min-height: 42px;
        padding: 8px 12px;
        background: var(--color-fill-1, #f7f8fa);
    }

    :deep(.arco-collapse-item-content-box) {
        padding: 12px;
    }
}

.catalog-health-collapse__header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-weight: 600;
    color: var(--color-text-1, #1d2129);
}

.catalog-json-editor {
    margin-top: 12px;
}

.page-entry-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
}

.page-entry-card {
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid var(--color-border-2);
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.page-entry-card--summary {
    background: linear-gradient(135deg, #f8faff 0%, #ffffff 58%, #f3f7ff 100%);
}

.page-entry-card__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    background: rgba(var(--primary-1), 0.9);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.page-entry-card__title {
    margin-top: 0;
    font-size: 16px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1);
}

.page-entry-card__eyebrow + .page-entry-card__title {
    margin-top: 12px;
}

.page-entry-card__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2);
}

.page-entry-card__meta {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.page-entry-card__meta-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid rgba(var(--primary-2), 0.5);
}

.page-entry-card__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.page-entry-card__meta-item strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--color-text-1);
    word-break: break-all;
}

.catalog-core-actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    margin-bottom: 16px;
    padding: 14px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
}

.catalog-core-actions__main {
    min-width: 0;
}

.catalog-core-actions__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(var(--primary-1), 0.72);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.catalog-core-actions__title {
    margin-top: 8px;
    font-size: 16px;
    line-height: 1.45;
    font-weight: 700;
    color: var(--color-text-1);
}

.catalog-core-actions__desc {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3);
}

.catalog-core-actions__buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    max-width: 520px;
}

.page-entry-card__actions {
    margin-top: 14px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.page-entry-list {
    margin: 12px 0 0;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.9;
    color: var(--color-text-2);
}

.ops-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
    gap: 12px;
}

.ops-workspace__main,
.ops-workspace__aside {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    background: #fff;
    padding: 16px;
}

.ops-workspace__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    border: 1px solid rgba(var(--primary-2), 0.6);
    background: rgba(var(--primary-1), 0.6);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.ops-workspace__title {
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3);
}

.ops-workspace__meta {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.ops-workspace__meta-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.ops-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__meta-item strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1);
    word-break: break-all;
}

.ops-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist {
    margin-top: 10px;
    display: grid;
    gap: 8px;
}

.ops-workspace__checklist-item {
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
    padding: 10px 12px;
}

.ops-workspace__checklist-item.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.ops-workspace__checklist-item.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.ops-workspace__checklist-item.is-danger {
    border-color: #f0c8c8;
    background: #fff7f7;
}

.ops-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.ops-workspace__checklist-value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1);
}

.ops-workspace__checklist-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-3);
}

.ops-workspace__actions {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.member-core-health {
    padding: 16px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
}

.member-core-health__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
}

.member-core-health__eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(var(--primary-1), 0.72);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.member-core-health__title {
    margin-top: 8px;
    font-size: 16px;
    line-height: 1.45;
    font-weight: 700;
    color: var(--color-text-1);
}

.member-core-health__desc {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3);
}

.member-core-health__grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
}

.member-core-health__metric {
    padding: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.member-core-health__metric.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.member-core-health__metric.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.member-core-health__metric span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3);
}

.member-core-health__metric strong {
    display: block;
    margin-top: 5px;
    font-size: 17px;
    line-height: 1.3;
    color: var(--color-text-1);
}

.member-core-health__metric p {
    margin: 5px 0 0;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-3);
}

.member-core-health__warnings {
    margin-top: 12px;
    padding: 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.member-core-health__warnings-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-2);
}

.member-core-health__warning-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
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

.stat-card,
.catalog-overview-card {
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid var(--color-border-2);
    background: #fff;
}

.stat-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.stat-value {
    margin-top: 10px;
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
    color: var(--color-text-1);
}

.stat-value.is-warning {
    color: rgb(var(--orange-6));
}

.stat-value.is-danger {
    color: rgb(var(--red-6));
}

.stats-grid,
.catalog-overview-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    padding: 18px;
    background: #fff;
}

.group-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
    flex-wrap: wrap;
}

.group-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.group-actions :deep(.arco-btn) {
    height: 30px;
    padding: 0 10px;
    border-radius: 8px;
}

.group-actions :deep(.arco-btn.arco-btn-text) {
    background: var(--color-fill-1, #f7f8fa);
}

.form-tips {
    padding: 10px 12px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.catalog-alert {
    margin-bottom: 16px;
}

.catalog-overview-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1);
}

.catalog-overview-meta {
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-3);
}

.catalog-overview-samples {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-2);
}

.catalog-stat-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.catalog-error {
    margin-top: 12px;
    color: rgb(var(--red-6));
    font-size: 13px;
    line-height: 1.7;
}

.tool-conflict-positions {
    display: grid;
    gap: 4px;
}

.tool-conflict-position {
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-2);
    word-break: break-all;
}

@media (max-width: 920px) {
    .catalog-core-actions,
    .page-entry-grid,
    .page-entry-card__meta,
    .ops-workspace,
    .ops-workspace__meta,
    .member-core-health__grid,
    .stats-grid,
    .catalog-overview-grid {
        grid-template-columns: 1fr;
    }

    .catalog-core-actions__buttons {
        justify-content: flex-start;
        max-width: none;
    }

    .catalog-simple-workspace__main {
        flex-direction: column;
    }

    .catalog-simple-workspace__metrics {
        grid-template-columns: 1fr;
    }
}
</style>
