<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-seo pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · SEO设置">
            <template #subtitle>
                维护全站默认 SEO、页面级 SEO 和默认分享图。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag v-if="seoPages.length > 0" color="orange" bordered>页面 {{ seoPages.length }} 条</a-tag>
                    </div>
                    <a-button data-admin-smoke="website-seo-reload" size="small" @click="reloadSeoData"
                        >重新加载</a-button
                    >
                    <a-button data-admin-smoke="website-seo-preview" size="small" @click="openToolsPreview"
                        >前端预览</a-button
                    >
                    <a-button data-admin-smoke="website-seo-health" size="small" @click="runSeoHealthCheck"
                        >一键体检</a-button
                    >
                    <a-button
                        v-perms="['setting:website:seo:save']"
                        data-admin-smoke="website-seo-save"
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

        <a-card class="page-card pro-panel-card" :bordered="false">
            <config-overview-collapse
                v-model="overviewCollapseKeys"
                :summary="seoActionSummary"
                :pending-count="seoValidationTips.length"
                :items="seoFocusItems"
            />

            <div class="mode-toolbar">
                <a-space>
                    <a-switch v-model="simpleMode" type="round" />
                    <span class="mode-toolbar__label">{{ simpleMode ? '运营简版（推荐）' : '高级模式' }}</span>
                </a-space>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>全站默认 SEO</span>
                    <div class="group-actions">
                        <a-button type="text" @click="restoreDefaultSeo">恢复默认</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    默认标题允许留空，前端会按“页面标题 - 站点名”自动生成。关键词、描述和分享图建议保持完整。
                </div>

                <a-form
                    :model="formData"
                    :label-col-props="{ span: 5 }"
                    :wrapper-col-props="{ span: 19 }"
                    class="compact-form seo-default-form"
                >
                    <a-form-item label="默认标题">
                        <a-input
                            v-model="formData.toolsSeoDefaultTitle"
                            maxlength="80"
                            show-word-limit
                            placeholder="留空时按“页面标题 - 站点名”自动生成"
                        />
                    </a-form-item>
                    <a-form-item label="默认关键词">
                        <a-textarea
                            v-model="formData.toolsSeoDefaultKeywords"
                            :auto-size="{ minRows: 2, maxRows: 4 }"
                            maxlength="220"
                            show-word-limit
                            placeholder="例如：免费在线工具,UIED,AI工具箱"
                        />
                    </a-form-item>
                    <a-form-item label="默认描述">
                        <a-textarea
                            v-model="formData.toolsSeoDefaultDescription"
                            :auto-size="{ minRows: 3, maxRows: 5 }"
                            maxlength="220"
                            show-word-limit
                            placeholder="用于未单独配置页面的描述"
                        />
                    </a-form-item>
                    <a-form-item label="默认分享图">
                        <div class="menu-icon-editor">
                            <material-picker
                                v-model="formData.toolsSeoDefaultImage"
                                :limit="1"
                                size="40px"
                                file-size="90px"
                            />
                            <a-input
                                v-model="formData.toolsSeoDefaultImage"
                                placeholder="支持 /uploads/*、/favicon.ico 或 http(s) 链接"
                            />
                        </div>
                    </a-form-item>
                </a-form>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>页面级 SEO</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSeoPage">新增页面</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    用于覆盖首页、更新页、登录页、用户中心等固定页面 SEO。路径建议填写完整站内路径，如
                    <code>/changelog</code>。
                </div>

                <div v-if="seoPages.length === 0" class="form-tips">
                    页面级 SEO 还没开始配置，先补首页、更新页或登录页中的 1 条高频页面。
                </div>
                <div
                    v-for="(item, index) in seoPages"
                    :key="`seo-page-${index}`"
                    class="seo-page-row"
                    :class="{ 'is-simple': simpleMode }"
                >
                    <a-input v-model="item.path" placeholder="页面路径，如：/changelog" />
                    <a-input v-model="item.title" placeholder="页面标题，如：更新日志" />
                    <a-input
                        v-if="!simpleMode"
                        v-model="item.image"
                        placeholder="分享图，如：/favicon.ico 或 https://..."
                    />
                    <a-textarea
                        v-if="!simpleMode"
                        v-model="item.keywords"
                        :auto-size="{ minRows: 2, maxRows: 3 }"
                        placeholder="关键词，使用英文逗号分隔"
                    />
                    <a-textarea
                        v-model="item.description"
                        :auto-size="{ minRows: 2, maxRows: 4 }"
                        placeholder="页面描述"
                    />
                    <div class="row-actions">
                        <a-button type="text" @click="moveSeoPage(index, -1)">上移</a-button>
                        <a-button type="text" @click="moveSeoPage(index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeSeoPage(index)">删除</a-button>
                    </div>
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:seo:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteSeo">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import ConfigOverviewCollapse from './components/config-overview-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'
import { OFFICIAL_SITE_DEFAULT_SEO } from './defaults/officialSite'

interface ToolsSeoPageItem {
    path: string
    title: string
    keywords: string
    description: string
    image: string
}

const defaultToolsSeoDefaultTitle = OFFICIAL_SITE_DEFAULT_SEO.defaultTitle
const defaultToolsSeoDefaultKeywords = OFFICIAL_SITE_DEFAULT_SEO.defaultKeywords
const defaultToolsSeoDefaultDescription = OFFICIAL_SITE_DEFAULT_SEO.defaultDescription
const defaultToolsSeoDefaultImage = OFFICIAL_SITE_DEFAULT_SEO.defaultImage
const defaultSeoPages: ToolsSeoPageItem[] = OFFICIAL_SITE_DEFAULT_SEO.pages.map((item) => ({
    ...item,
}))

const appStore = useAppStore()
const { isSubmitting, runSubmit } = useOperateSubmit('SEO配置已保存')
const baselineSnapshot = ref('')
const simpleMode = ref(true)
const overviewCollapseKeys = ref<(string | number)[]>([])

const formData = reactive<Record<string, string>>({
    toolsSeoDefaultTitle: defaultToolsSeoDefaultTitle,
    toolsSeoDefaultKeywords: defaultToolsSeoDefaultKeywords,
    toolsSeoDefaultDescription: defaultToolsSeoDefaultDescription,
    toolsSeoDefaultImage: defaultToolsSeoDefaultImage,
    toolsSeoPages: JSON.stringify(defaultSeoPages),
})

const seoPages = ref<ToolsSeoPageItem[]>([])

/**
 * 函数说明：克隆默认页面 SEO 数组，避免响应式引用污染默认模板。
 */
const cloneSeoPages = (items: ToolsSeoPageItem[]): ToolsSeoPageItem[] => {
    return items.map((item) => ({ ...item }))
}

/**
 * 函数说明：创建空页面 SEO 条目，统一新增时的默认值。
 */
const createEmptySeoPage = (): ToolsSeoPageItem => ({
    path: '',
    title: '',
    keywords: '',
    description: '',
    image: '',
})

/**
 * 函数说明：判断 SEO 图片地址是否合法，支持站内路径与 http(s) 链接。
 */
const isValidSeoImage = (value: string): boolean => {
    const text = value.trim()
    if (!text) {
        return true
    }
    return text.startsWith('/') || /^https?:\/\//i.test(text)
}

/**
 * 函数说明：将历史版本中已失效的 logo.png 地址回退为实际存在的站点图标。
 */
const normalizeLegacySeoImage = (value: unknown): string => {
    const image = String(value || '').trim()
    if (
        !image ||
        image === '/logo.png' ||
        image === '/api/logo.png' ||
        image === '/uploads/logo.png' ||
        image === '/api/uploads/logo.png' ||
        /\/api\/uploads\/logo\.png$/i.test(image)
    ) {
        return defaultToolsSeoDefaultImage
    }
    return image
}

/**
 * 函数说明：根据当前编辑态构建快照，便于判断是否存在未保存变更。
 */
const buildSeoSnapshot = (): string => {
    return JSON.stringify({
        toolsSeoDefaultTitle: formData.toolsSeoDefaultTitle.trim(),
        toolsSeoDefaultKeywords: formData.toolsSeoDefaultKeywords.trim(),
        toolsSeoDefaultDescription: formData.toolsSeoDefaultDescription.trim(),
        toolsSeoDefaultImage: formData.toolsSeoDefaultImage.trim(),
        seoPages: seoPages.value.map((item) => ({
            path: item.path.trim(),
            title: item.title.trim(),
            keywords: item.keywords.trim(),
            description: item.description.trim(),
            image: item.image.trim(),
        })),
    })
}

/**
 * 函数说明：更新基线快照，表示当前编辑状态已保存。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSeoSnapshot()
}

/**
 * 函数说明：判断页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSeoSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：统计已填写标题的页面数量，辅助运营判断完成度。
 */
const configuredTitleCount = computed<number>(() => {
    return seoPages.value.filter((item) => Boolean(item.title.trim())).length
})

/**
 * 函数说明：统计已填写分享图的页面数量，用于观察分享图覆盖率。
 */
const configuredImageCount = computed<number>(() => {
    return seoPages.value.filter((item) => Boolean(item.image.trim())).length
})

/**
 * 函数说明：统计页面 SEO 中的异常项数量，作为顶部指标展示。
 */
const invalidSeoCount = computed<number>(() => {
    return collectSeoValidationTips(seoPages.value, false).length
})

/**
 * 函数说明：生成 SEO 设置页动作摘要，帮助运营先识别当前是默认 SEO 缺失还是页面覆盖不足。
 */
const seoActionSummary = computed(() => {
    if (!formData.toolsSeoDefaultKeywords.trim() || !formData.toolsSeoDefaultDescription.trim()) {
        return '默认关键词或默认描述还未补齐，建议先完善全站默认 SEO，再继续维护页面级覆盖。'
    }
    if (invalidSeoCount.value > 0) {
        return `当前仍有 ${invalidSeoCount.value} 项页面 SEO 异常，建议先体检并修正路径、标题和描述。`
    }
    return '当前 SEO 结构整体稳定，建议优先补齐分享图和关键页面标题，提高搜索与分享表现。'
})

/**
 * 函数说明：生成 SEO 设置页重点检查项，统一展示默认 SEO、异常项和页面覆盖情况。
 */
const seoFocusItems = computed(() => {
    return [
        {
            label: '默认 SEO',
            value:
                formData.toolsSeoDefaultKeywords.trim() && formData.toolsSeoDefaultDescription.trim()
                    ? '已完整'
                    : '待补充',
            desc:
                formData.toolsSeoDefaultKeywords.trim() && formData.toolsSeoDefaultDescription.trim()
                    ? '默认关键词和描述已配置，未覆盖页面也能正常回退。'
                    : '默认关键词或描述为空会导致未覆盖页面 SEO 质量下降。',
            className:
                formData.toolsSeoDefaultKeywords.trim() && formData.toolsSeoDefaultDescription.trim()
                    ? 'is-ok'
                    : 'is-danger',
        },
        {
            label: '异常项',
            value: `${invalidSeoCount.value} 项`,
            desc:
                invalidSeoCount.value > 0
                    ? '当前页面配置中仍有路径、标题、描述或分享图异常。'
                    : '当前页面 SEO 结构校验正常。',
            className: invalidSeoCount.value > 0 ? 'is-warning' : 'is-ok',
        },
        {
            label: '页面覆盖',
            value: `${configuredTitleCount.value}/${seoPages.value.length}`,
            desc: '表示当前已填写标题的页面数量，建议关键页面都补齐独立标题。',
            className: configuredTitleCount.value === seoPages.value.length && seoPages.value.length > 0 ? 'is-ok' : '',
        },
    ]
})

/**
 * 函数说明：清洗未知对象为页面 SEO 结构，非法数据返回 null。
 */
const normalizeSeoPageItem = (source: unknown): ToolsSeoPageItem | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const path = String(record.path || '').trim()
    const title = String(record.title || '').trim()
    const keywords = String(record.keywords || '').trim()
    const description = String(record.description || '').trim()
    const image = normalizeLegacySeoImage(record.image)
    if (!path && !title && !keywords && !description && !image) {
        return null
    }
    return { path, title, keywords, description, image }
}

/**
 * 函数说明：解析页面 SEO JSON；为空或异常时回退到默认页面模板。
 */
const parseSeoPages = (jsonText: string): ToolsSeoPageItem[] => {
    const trimmed = String(jsonText || '').trim()
    if (!trimmed) {
        return cloneSeoPages(defaultSeoPages)
    }
    try {
        const parsed = JSON.parse(trimmed)
        if (!Array.isArray(parsed)) {
            return cloneSeoPages(defaultSeoPages)
        }
        const normalized = parsed
            .map((item) => normalizeSeoPageItem(item))
            .filter((item): item is ToolsSeoPageItem => Boolean(item))
        return normalized.length > 0 ? normalized : cloneSeoPages(defaultSeoPages)
    } catch {
        return cloneSeoPages(defaultSeoPages)
    }
}

/**
 * 函数说明：收集 SEO 配置校验提示，支持仅校验页面项或同时校验默认值。
 */
const collectSeoValidationTips = (items: ToolsSeoPageItem[], includeDefaults = true): string[] => {
    const tips: string[] = []
    const duplicatePaths = new Set<string>()

    if (includeDefaults) {
        if (!formData.toolsSeoDefaultKeywords.trim()) {
            tips.push('默认 SEO 关键词不能为空。')
        }
        if (!formData.toolsSeoDefaultDescription.trim()) {
            tips.push('默认 SEO 描述不能为空。')
        }
        if (!isValidSeoImage(formData.toolsSeoDefaultImage)) {
            tips.push('默认 SEO 分享图需为 / 或 http(s) 开头。')
        }
    }

    if (items.length === 0) {
        tips.push('页面级 SEO 至少需要配置 1 项。')
        return tips
    }

    items.forEach((item, index) => {
        const path = item.path.trim()
        const title = item.title.trim()
        const description = item.description.trim()
        const image = item.image.trim()

        if (!path) {
            tips.push(`第 ${index + 1} 项页面路径不能为空。`)
        } else {
            if (!path.startsWith('/')) {
                tips.push(`第 ${index + 1} 项页面路径需以 / 开头。`)
            }
            const normalizedPath = path.toLowerCase()
            if (duplicatePaths.has(normalizedPath)) {
                tips.push(`第 ${index + 1} 项页面路径重复，请调整后再保存。`)
            }
            duplicatePaths.add(normalizedPath)
        }

        if (!title) {
            tips.push(`第 ${index + 1} 项页面标题不能为空。`)
        }
        if (!description) {
            tips.push(`第 ${index + 1} 项页面描述不能为空。`)
        }
        if (image && !isValidSeoImage(image)) {
            tips.push(`第 ${index + 1} 项分享图需为 / 或 http(s) 开头。`)
        }
    })

    return tips.slice(0, 10)
}

const seoValidationTips = computed(() => collectSeoValidationTips(seoPages.value))

/**
 * 函数说明：校验 SEO 配置并给出首条错误提示。
 */
const validateSeoConfig = (): boolean => {
    const tips = collectSeoValidationTips(seoPages.value)
    if (tips.length > 0) {
        feedback.msgError(tips[0])
        return false
    }
    return true
}

/**
 * 函数说明：读取网站配置并回填 SEO 编辑区。
 */
const getData = async () => {
    const data = await getWebsite()
    formData.toolsSeoDefaultTitle = String(data.toolsSeoDefaultTitle || defaultToolsSeoDefaultTitle)
    formData.toolsSeoDefaultKeywords = String(data.toolsSeoDefaultKeywords || defaultToolsSeoDefaultKeywords)
    formData.toolsSeoDefaultDescription = String(data.toolsSeoDefaultDescription || defaultToolsSeoDefaultDescription)
    formData.toolsSeoDefaultImage = normalizeLegacySeoImage(data.toolsSeoDefaultImage)
    formData.toolsSeoPages = String(data.toolsSeoPages || JSON.stringify(defaultSeoPages))
    seoPages.value = parseSeoPages(formData.toolsSeoPages)
    updateBaselineSnapshot()
}

/**
 * 函数说明：重新读取后台 SEO 配置，方便脚本导入或多人协作后立即回显最新数据。
 */
const reloadSeoData = async () => {
    await getData()
    feedback.msgSuccess('已重新加载后台 SEO 配置')
}

/**
 * 函数说明：新增页面 SEO 条目。
 */
const addSeoPage = () => {
    seoPages.value.push(createEmptySeoPage())
}

/**
 * 函数说明：删除页面 SEO 条目。
 */
const removeSeoPage = (index: number) => {
    seoPages.value.splice(index, 1)
}

/**
 * 函数说明：调整页面 SEO 顺序，支持上移和下移。
 */
const moveSeoPage = (index: number, step: -1 | 1) => {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= seoPages.value.length) {
        return
    }
    const current = seoPages.value[index]
    seoPages.value[index] = seoPages.value[targetIndex]
    seoPages.value[targetIndex] = current
}

/**
 * 函数说明：恢复 SEO 默认模板，便于快速回退到推荐配置。
 */
const restoreDefaultSeo = () => {
    formData.toolsSeoDefaultTitle = defaultToolsSeoDefaultTitle
    formData.toolsSeoDefaultKeywords = defaultToolsSeoDefaultKeywords
    formData.toolsSeoDefaultDescription = defaultToolsSeoDefaultDescription
    formData.toolsSeoDefaultImage = defaultToolsSeoDefaultImage
    seoPages.value = cloneSeoPages(defaultSeoPages)
    feedback.msgSuccess('已恢复默认 SEO 配置模板')
}

/**
 * 函数说明：打开 tools 前端首页预览，便于运营保存后立即回归。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：执行 SEO 配置体检，统一输出首条异常或成功反馈。
 */
const runSeoHealthCheck = () => {
    const tips = collectSeoValidationTips(seoPages.value)
    if (tips.length > 0) {
        feedback.alertWarning(`配置体检未通过：${tips[0]}`)
        return
    }
    feedback.msgSuccess('配置体检通过：默认 SEO 与页面 SEO 结构正常')
}

/**
 * 函数说明：保存 SEO 配置到网站配置项，仅提交当前页面相关字段。
 */
const handleSubmit = async () => {
    if (!validateSeoConfig()) {
        return
    }
    await runSubmit(async () => {
        await setWebsite({
            toolsSeoDefaultTitle: formData.toolsSeoDefaultTitle.trim(),
            toolsSeoDefaultKeywords: formData.toolsSeoDefaultKeywords.trim(),
            toolsSeoDefaultDescription: formData.toolsSeoDefaultDescription.trim(),
            toolsSeoDefaultImage: formData.toolsSeoDefaultImage.trim(),
            toolsSeoPages: JSON.stringify(
                seoPages.value.map((item) => ({
                    path: item.path.trim(),
                    title: item.title.trim(),
                    keywords: item.keywords.trim(),
                    description: item.description.trim(),
                    image: item.image.trim(),
                }))
            ),
        })
        await appStore.getConfig()
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

.mode-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    background: var(--color-fill-1, #f7f8fa);
}

.mode-toolbar__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
}

.mode-toolbar__tip {
    font-size: 12px;
    color: var(--color-text-3);
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 8px;
    padding: 16px;
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
    flex-wrap: wrap;
    gap: 6px;
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
    background: var(--color-fill-1, #f7f8fa);
    border-radius: 8px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.seo-default-form {
    margin-top: 8px;
}

.menu-icon-editor {
    display: flex;
    align-items: center;
    gap: 12px;
}

.seo-page-row {
    display: grid;
    grid-template-columns: 1.1fr 1.1fr 1fr 1.2fr 1.4fr auto;
    gap: 12px;
    align-items: flex-start;
    padding: 14px 0;
    border-top: 1px solid var(--color-border-2);
}

.seo-page-row.is-simple {
    grid-template-columns: 1.1fr 1.1fr 1.8fr auto;
}

.seo-page-row:first-of-type {
    border-top: 0;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-height: 32px;
    justify-content: flex-end;
}

.row-actions :deep(.arco-btn) {
    padding: 0 8px;
    border-radius: 8px;
}

@media (max-width: 1280px) {
    .seo-page-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 920px) {
    .seo-page-row,
    .mode-toolbar {
        grid-template-columns: 1fr;
    }

    .menu-icon-editor {
        flex-direction: column;
        align-items: stretch;
    }

    .mode-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
