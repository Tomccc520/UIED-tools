<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-footer-settings pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 页脚设置">
            <template #subtitle>
                维护页脚文案、备案版权、链接分组和官方媒体入口。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button data-admin-smoke="website-footer-reload" size="small" @click="reloadFooterData"
                        >重新加载</a-button
                    >
                    <a-button data-admin-smoke="website-footer-preview" size="small" @click="openToolsPreview"
                        >前端预览</a-button
                    >
                    <a-button data-admin-smoke="website-footer-health" size="small" @click="runFooterHealthCheck"
                        >一键体检</a-button
                    >
                    <a-button
                        v-perms="['setting:website:footer:save']"
                        data-admin-smoke="website-footer-save"
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
                :summary="footerActionSummary"
                :pending-count="footerValidationTips.length"
                :items="footerFocusItems"
            />

            <div class="mode-toolbar">
                <a-space>
                    <a-switch v-model="simpleMode" type="round" />
                    <span class="mode-toolbar__label">{{ simpleMode ? '运营简版（推荐）' : '高级模式' }}</span>
                </a-space>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>基础文案</span>
                </div>
                <div class="form-tips mb-2">介绍文案支持 <code>{webName}</code> 占位符，用于自动插入站点名。</div>
                <a-form
                    :model="formData"
                    :label-col-props="{ span: 6 }"
                    :wrapper-col-props="{ span: 18 }"
                    class="compact-form"
                >
                    <a-form-item label="介绍文案">
                        <a-input
                            v-model="formData.toolsFooterIntro"
                            maxlength="120"
                            show-word-limit
                            placeholder="支持 {webName} 占位符"
                        />
                    </a-form-item>
                    <a-form-item label="快捷入口标题">
                        <a-input v-model="formData.toolsFooterQuickTitle" maxlength="20" show-word-limit />
                    </a-form-item>
                    <a-form-item label="友情链接标题">
                        <a-input v-model="formData.toolsFooterFriendTitle" maxlength="20" show-word-limit />
                    </a-form-item>
                    <a-form-item label="官方媒体标题">
                        <a-input v-model="formData.toolsOfficialMediaTitle" maxlength="20" show-word-limit />
                    </a-form-item>
                    <a-form-item label="技术支持标签">
                        <a-input v-model="formData.toolsFooterSupportLabel" maxlength="20" show-word-limit />
                    </a-form-item>
                </a-form>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>技术支持链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addFooterSupportLink">新增链接</a-button>
                    </div>
                </div>
                <div v-if="footerSupportLinks.length === 0" class="form-tips">
                    技术支持这一组还没开始配置，先补 1 条官方支持入口即可。
                </div>
                <div v-for="(item, index) in footerSupportLinks" :key="`footer-support-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：技术支持" />
                    <a-input v-model="item.link" placeholder="链接，如：https://fsuied.com" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(footerSupportLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(footerSupportLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeFooterSupportLink(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>备案与版权链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addFooterRecordLink">新增链接</a-button>
                    </div>
                </div>
                <div v-if="footerRecordLinks.length === 0" class="form-tips">
                    备案与版权链接还没开始配置，先补 1 条备案入口即可。
                </div>
                <div v-for="(item, index) in footerRecordLinks" :key="`footer-record-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：粤ICP备2022056875号" />
                    <a-input v-model="item.link" placeholder="链接，如：https://beian.miit.gov.cn/" />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(footerRecordLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(footerRecordLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeFooterRecordLink(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>官方媒体</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addOfficialMediaLink">新增链接</a-button>
                    </div>
                </div>
                <div v-if="officialMediaLinks.length === 0" class="form-tips">
                    官方媒体还没开始配置，先补 1 条主阵地链接即可。
                </div>
                <div v-for="(item, index) in officialMediaLinks" :key="`official-media-${index}`" class="link-row">
                    <a-input v-model="item.name" placeholder="名称，如：知乎" />
                    <a-input v-model="item.link" placeholder="链接，如：https://www.zhihu.com/..." />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(officialMediaLinks, index, -1)">上移</a-button>
                        <a-button type="text" @click="moveLinkItem(officialMediaLinks, index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeOfficialMediaLink(index)">删除</a-button>
                    </div>
                </div>
            </div>

            <section v-if="simpleMode" class="footer-section-summary mt-5">
                <div class="footer-section-summary__main">
                    <div>
                        <div class="footer-section-summary__title">链接分组保持收起</div>
                        <div class="footer-section-summary__desc">
                            快捷入口和友情链接结构当前可正常读取。仅在需要调整分组结构时进入高级模式，避免日常运营误改 JSON。
                        </div>
                    </div>
                    <a-button size="small" @click="simpleMode = false">进入高级模式</a-button>
                </div>
                <div class="footer-section-summary__metrics">
                    <div class="footer-section-summary__metric">
                        <span>快捷入口</span>
                        <strong>{{ footerQuickSectionCount }} 组 / {{ footerQuickLinkCount }} 条</strong>
                    </div>
                    <div class="footer-section-summary__metric">
                        <span>友情链接</span>
                        <strong>{{ footerFriendSectionCount }} 组 / {{ footerFriendLinkCount }} 条</strong>
                    </div>
                    <div class="footer-section-summary__metric">
                        <span>解析状态</span>
                        <strong :class="{ 'is-danger': footerSectionParseErrorCount > 0 }">
                            {{ footerSectionParseErrorCount > 0 ? `${footerSectionParseErrorCount} 项异常` : '正常' }}
                        </strong>
                    </div>
                </div>
            </section>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>快捷入口分组</span>
                    <div class="group-actions">
                        <a-button type="text" @click="formatFooterQuickSectionsEditor">格式化</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    结构为
                    <code>[{ title, items: [{ name, link }] }]</code>，适合设计、图像、PDF、文本等主题化分组。
                </div>
                <a-textarea
                    v-model="footerQuickSectionsEditor"
                    :rows="12"
                    placeholder='请输入 JSON 数组，如：[{"title":"设计","items":[{"name":"色彩对比度","link":"/tools/design/contrast-checker"}]}]'
                />
                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered>分组 {{ footerQuickSectionCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>链接 {{ footerQuickLinkCount }}</a-tag>
                </div>
                <div v-if="footerQuickSectionsParseError" class="catalog-error">
                    {{ footerQuickSectionsParseError }}
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>友情链接分组</span>
                    <div class="group-actions">
                        <a-button type="text" @click="formatFooterFriendSectionsEditor">格式化</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">结构同上，适合配置官方入口、社区内容、合作链接等长期稳定入口。</div>
                <a-textarea
                    v-model="footerFriendSectionsEditor"
                    :rows="12"
                    placeholder='请输入 JSON 数组，如：[{"title":"官方入口","items":[{"name":"官网首页","link":"https://uiedtool.com/"}]}]'
                />
                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered>分组 {{ footerFriendSectionCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>链接 {{ footerFriendLinkCount }}</a-tag>
                </div>
                <div v-if="footerFriendSectionsParseError" class="catalog-error">
                    {{ footerFriendSectionsParseError }}
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:footer:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteFooterSettings">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import ConfigOverviewCollapse from './components/config-overview-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'
import { OFFICIAL_SITE_DEFAULT_FOOTER } from './defaults/officialSite'

interface ToolsLinkItem {
    name: string
    link: string
}

interface ToolsLinkSection {
    title: string
    items: ToolsLinkItem[]
}

const appStore = useAppStore()
const { isSubmitting, runSubmit } = useOperateSubmit('页脚设置已保存')
const baselineSnapshot = ref('')
const simpleMode = ref(true)
const overviewCollapseKeys = ref<(string | number)[]>([])

const formData = reactive<Record<string, string>>({
    toolsFooterIntro: '',
    toolsFooterQuickTitle: '',
    toolsFooterFriendTitle: '',
    toolsOfficialMediaTitle: '',
    toolsFooterSupportLabel: '',
})

const footerSupportLinks = ref<ToolsLinkItem[]>([])
const footerRecordLinks = ref<ToolsLinkItem[]>([])
const officialMediaLinks = ref<ToolsLinkItem[]>([])
const footerQuickSectionsEditor = ref('[]')
const footerFriendSectionsEditor = ref('[]')

/**
 * 函数说明：深拷贝简单链接数组，避免默认值对象被编辑态污染。
 */
const cloneLinkItems = (items: ToolsLinkItem[]): ToolsLinkItem[] => {
    return items.map((item) => ({
        name: String(item.name || ''),
        link: String(item.link || ''),
    }))
}

/**
 * 函数说明：解析简单链接数组 JSON，异常时回退为空数组。
 */
const parseLinkItems = (value: unknown): ToolsLinkItem[] => {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value || '[]') : value
        if (!Array.isArray(parsed)) {
            return []
        }
        return parsed.map((item) => ({
            name: String(item?.name || ''),
            link: String(item?.link || ''),
        }))
    } catch {
        return []
    }
}

/**
 * 函数说明：解析链接分组 JSON，用于预览和保存前校验。
 */
const parseLinkSections = (value: string): { items: ToolsLinkSection[]; error: string } => {
    try {
        const parsed = JSON.parse(value || '[]')
        if (!Array.isArray(parsed)) {
            return { items: [], error: '分组 JSON 必须是数组。' }
        }
        const items = parsed.map((section) => ({
            title: String(section?.title || ''),
            items: Array.isArray(section?.items)
                ? section.items.map((item: ToolsLinkItem) => ({
                      name: String(item?.name || ''),
                      link: String(item?.link || ''),
                  }))
                : [],
        }))
        return { items, error: '' }
    } catch (error) {
        return {
            items: [],
            error: `分组 JSON 解析失败：${(error as Error).message}`,
        }
    }
}

/**
 * 函数说明：判断链接是否为允许格式，支持站内路径、锚点与 http(s) 外链。
 */
const isValidLinkValue = (link: string): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return false
    }
    if (value.startsWith('/')) {
        return true
    }
    if (value.startsWith('#')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：生成当前编辑状态快照，用于离开页面前判断是否存在未保存改动。
 */
const buildFooterSnapshot = (): string => {
    return JSON.stringify({
        toolsFooterIntro: formData.toolsFooterIntro.trim(),
        toolsFooterQuickTitle: formData.toolsFooterQuickTitle.trim(),
        toolsFooterFriendTitle: formData.toolsFooterFriendTitle.trim(),
        toolsOfficialMediaTitle: formData.toolsOfficialMediaTitle.trim(),
        toolsFooterSupportLabel: formData.toolsFooterSupportLabel.trim(),
        toolsFooterSupportLinks: footerSupportLinks.value,
        toolsFooterRecordLinks: footerRecordLinks.value,
        toolsOfficialMediaLinks: officialMediaLinks.value,
        toolsFooterQuickSections: footerQuickSectionsEditor.value.trim(),
        toolsFooterFriendSections: footerFriendSectionsEditor.value.trim(),
    })
}

/**
 * 函数说明：更新基线快照，表示页面当前状态已与后端同步。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildFooterSnapshot()
}

/**
 * 函数说明：判断当前页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildFooterSnapshot() !== baselineSnapshot.value
})

const footerQuickSectionsParseResult = computed(() => parseLinkSections(footerQuickSectionsEditor.value))
const footerQuickSectionsParseError = computed(() => footerQuickSectionsParseResult.value.error)
const footerQuickSectionCount = computed(() => footerQuickSectionsParseResult.value.items.length)
const footerQuickLinkCount = computed(() =>
    footerQuickSectionsParseResult.value.items.reduce((count, section) => count + section.items.length, 0)
)

const footerFriendSectionsParseResult = computed(() => parseLinkSections(footerFriendSectionsEditor.value))
const footerFriendSectionsParseError = computed(() => footerFriendSectionsParseResult.value.error)
const footerFriendSectionCount = computed(() => footerFriendSectionsParseResult.value.items.length)
const footerFriendLinkCount = computed(() =>
    footerFriendSectionsParseResult.value.items.reduce((count, section) => count + section.items.length, 0)
)

/**
 * 函数说明：统计页脚分组 JSON 的解析异常数，供运营简版快速判断是否需要进入高级模式。
 */
const footerSectionParseErrorCount = computed(
    () => Number(Boolean(footerQuickSectionsParseError.value)) + Number(Boolean(footerFriendSectionsParseError.value))
)

/**
 * 函数说明：生成页脚设置页动作摘要，帮助运营先明确当前应优先处理文案、分组还是链接异常。
 */
const footerActionSummary = computed(() => {
    if (footerQuickSectionsParseError.value || footerFriendSectionsParseError.value) {
        return '页脚分组 JSON 当前存在解析异常，建议先格式化并修正分组结构，再继续维护分组内容。'
    }
    if (!formData.toolsFooterIntro.trim()) {
        return '页脚介绍文案还未配置，建议先补齐基础文案和标题，再维护分组和链接。'
    }
    return '建议先确认基础文案、技术支持和备案链接都完整，再继续维护快捷分组与友情链接分组。'
})

/**
 * 函数说明：生成页脚设置页重点检查项，统一展示文案、解析状态与分组规模。
 */
const footerFocusItems = computed(() => {
    return [
        {
            label: '基础文案',
            value: formData.toolsFooterIntro.trim() ? '已配置' : '待补充',
            desc: formData.toolsFooterIntro.trim()
                ? '介绍文案和标题已可用于前端底部展示。'
                : '页脚介绍文案为空会直接影响官网底部完整度。',
            className: formData.toolsFooterIntro.trim() ? 'is-ok' : 'is-danger',
        },
        {
            label: '技术支持与备案',
            value: `${footerSupportLinks.value.length + footerRecordLinks.value.length} 条`,
            desc: '技术支持和备案版权链接建议至少各保留 1 条。',
            className:
                footerSupportLinks.value.length > 0 && footerRecordLinks.value.length > 0 ? 'is-ok' : 'is-warning',
        },
        {
            label: '分组解析',
            value: footerQuickSectionsParseError.value || footerFriendSectionsParseError.value ? '存在异常' : '正常',
            desc:
                footerQuickSectionsParseError.value ||
                footerFriendSectionsParseError.value ||
                '快捷分组和友情链接分组结构当前可正常解析。',
            className:
                footerQuickSectionsParseError.value || footerFriendSectionsParseError.value ? 'is-danger' : 'is-ok',
        },
    ]
})

const footerValidationTips = computed(() => {
    const tips: string[] = []
    if (footerQuickSectionsParseError.value) {
        tips.push(footerQuickSectionsParseError.value)
    }
    if (footerFriendSectionsParseError.value) {
        tips.push(footerFriendSectionsParseError.value)
    }
    return tips
})

/**
 * 函数说明：读取后端配置并回填页面表单，保持本页独立编辑且不覆盖其它官网设置。
 */
const getData = async () => {
    const data = await getWebsite()
    formData.toolsFooterIntro = String(data.toolsFooterIntro || '')
    formData.toolsFooterQuickTitle = String(data.toolsFooterQuickTitle || '')
    formData.toolsFooterFriendTitle = String(data.toolsFooterFriendTitle || '')
    formData.toolsOfficialMediaTitle = String(data.toolsOfficialMediaTitle || '')
    formData.toolsFooterSupportLabel = String(data.toolsFooterSupportLabel || '')
    footerSupportLinks.value = parseLinkItems(data.toolsFooterSupportLinks)
    footerRecordLinks.value = parseLinkItems(data.toolsFooterRecordLinks)
    officialMediaLinks.value = parseLinkItems(data.toolsOfficialMediaLinks)
    footerQuickSectionsEditor.value = String(data.toolsFooterQuickSections || '[]').trim() || '[]'
    footerFriendSectionsEditor.value = String(data.toolsFooterFriendSections || '[]').trim() || '[]'
    updateBaselineSnapshot()
}

/**
 * 函数说明：重新读取后台页脚配置，方便脚本导入后立即回显最新数据。
 */
const reloadFooterData = async () => {
    await getData()
    feedback.msgSuccess('已重新加载后台页脚配置')
}

/**
 * 函数说明：将当前表单恢复为前端默认页脚配置，便于后台一键回填后再保存。
 */
const restoreFooterDefaults = () => {
    formData.toolsFooterIntro = OFFICIAL_SITE_DEFAULT_FOOTER.intro
    formData.toolsFooterQuickTitle = OFFICIAL_SITE_DEFAULT_FOOTER.quickTitle
    formData.toolsFooterFriendTitle = OFFICIAL_SITE_DEFAULT_FOOTER.friendTitle
    formData.toolsOfficialMediaTitle = OFFICIAL_SITE_DEFAULT_FOOTER.officialMediaTitle
    formData.toolsFooterSupportLabel = OFFICIAL_SITE_DEFAULT_FOOTER.supportLabel
    footerSupportLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_FOOTER.supportLinks)
    footerRecordLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_FOOTER.recordLinks)
    officialMediaLinks.value = cloneLinkItems(OFFICIAL_SITE_DEFAULT_FOOTER.officialMediaLinks)
    footerQuickSectionsEditor.value = JSON.stringify(OFFICIAL_SITE_DEFAULT_FOOTER.quickSections, null, 2)
    footerFriendSectionsEditor.value = JSON.stringify(OFFICIAL_SITE_DEFAULT_FOOTER.friendSections, null, 2)
    feedback.msgSuccess('已回填前端默认页脚配置，请确认后保存')
}

/**
 * 函数说明：新增技术支持链接条目。
 */
const addFooterSupportLink = () => {
    footerSupportLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定技术支持链接条目。
 */
const removeFooterSupportLink = (index: number) => {
    footerSupportLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增备案版权链接条目。
 */
const addFooterRecordLink = () => {
    footerRecordLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定备案版权链接条目。
 */
const removeFooterRecordLink = (index: number) => {
    footerRecordLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增官方媒体链接条目。
 */
const addOfficialMediaLink = () => {
    officialMediaLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定官方媒体链接条目。
 */
const removeOfficialMediaLink = (index: number) => {
    officialMediaLinks.value.splice(index, 1)
}

/**
 * 函数说明：通用数组排序方法，支持上移和下移。
 */
function moveLinkItem<T>(list: T[], index: number, step: -1 | 1) {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= list.length) {
        return
    }
    const current = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = current
}

/**
 * 函数说明：格式化快捷入口分组 JSON，减少运营手工排版成本。
 */
const formatFooterQuickSectionsEditor = () => {
    if (footerQuickSectionsParseError.value) {
        feedback.msgError(footerQuickSectionsParseError.value)
        return
    }
    footerQuickSectionsEditor.value = JSON.stringify(footerQuickSectionsParseResult.value.items, null, 2)
}

/**
 * 函数说明：格式化友情链接分组 JSON，减少运营手工排版成本。
 */
const formatFooterFriendSectionsEditor = () => {
    if (footerFriendSectionsParseError.value) {
        feedback.msgError(footerFriendSectionsParseError.value)
        return
    }
    footerFriendSectionsEditor.value = JSON.stringify(footerFriendSectionsParseResult.value.items, null, 2)
}

/**
 * 函数说明：统一格式化页脚两类分组 JSON。
 */
const formatFooterSectionEditors = () => {
    formatFooterQuickSectionsEditor()
    formatFooterFriendSectionsEditor()
}

/**
 * 函数说明：执行页面级体检，提前发现缺失字段和非法链接。
 */
const runFooterHealthCheck = () => {
    if (!validateBeforeSubmit(false)) {
        return
    }
    feedback.msgSuccess('页脚设置体检通过，可以保存发布。')
}

/**
 * 函数说明：打开前端首页预览，便于运营保存后立即核对展示结果。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：统一校验页脚页面保存前的必填项和链接格式。
 */
const validateBeforeSubmit = (showMessage = true): boolean => {
    formData.toolsFooterIntro = formData.toolsFooterIntro.trim()
    formData.toolsFooterQuickTitle = formData.toolsFooterQuickTitle.trim()
    formData.toolsFooterFriendTitle = formData.toolsFooterFriendTitle.trim()
    formData.toolsOfficialMediaTitle = formData.toolsOfficialMediaTitle.trim()
    formData.toolsFooterSupportLabel = formData.toolsFooterSupportLabel.trim()

    if (!formData.toolsFooterIntro) {
        showMessage && feedback.msgError('页脚介绍文案不能为空')
        return false
    }
    if (
        !formData.toolsFooterQuickTitle ||
        !formData.toolsFooterFriendTitle ||
        !formData.toolsOfficialMediaTitle ||
        !formData.toolsFooterSupportLabel
    ) {
        showMessage && feedback.msgError('页脚基础标题与技术支持标签不能为空')
        return false
    }
    const invalidSupport = footerSupportLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidSupport) {
        showMessage && feedback.msgError('技术支持链接需同时填写名称与合法链接')
        return false
    }
    const invalidRecord = footerRecordLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidRecord) {
        showMessage && feedback.msgError('备案版权链接需同时填写名称与合法链接')
        return false
    }
    const invalidMedia = officialMediaLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidMedia) {
        showMessage && feedback.msgError('官方媒体链接需同时填写名称与合法链接')
        return false
    }
    if (footerQuickSectionsParseError.value) {
        showMessage && feedback.msgError(footerQuickSectionsParseError.value)
        return false
    }
    if (footerFriendSectionsParseError.value) {
        showMessage && feedback.msgError(footerFriendSectionsParseError.value)
        return false
    }
    const invalidQuickSection = footerQuickSectionsParseResult.value.items.find(
        (section) =>
            !String(section.title || '').trim() ||
            section.items.some((item) => !String(item.name || '').trim() || !isValidLinkValue(item.link))
    )
    if (invalidQuickSection) {
        showMessage && feedback.msgError('快捷入口分组需填写分组标题，且组内每个链接都要有名称和合法地址')
        return false
    }
    const invalidFriendSection = footerFriendSectionsParseResult.value.items.find(
        (section) =>
            !String(section.title || '').trim() ||
            section.items.some((item) => !String(item.name || '').trim() || !isValidLinkValue(item.link))
    )
    if (invalidFriendSection) {
        showMessage && feedback.msgError('友情链接分组需填写分组标题，且组内每个链接都要有名称和合法地址')
        return false
    }
    return true
}

/**
 * 函数说明：提交页脚设置，仅保存本页负责的字段，避免覆盖其它官网配置。
 */
const handleSubmit = async () => {
    if (!validateBeforeSubmit(true)) {
        return
    }

    const payload: Record<string, string> = {
        toolsFooterIntro: formData.toolsFooterIntro,
        toolsFooterQuickTitle: formData.toolsFooterQuickTitle,
        toolsFooterFriendTitle: formData.toolsFooterFriendTitle,
        toolsOfficialMediaTitle: formData.toolsOfficialMediaTitle,
        toolsFooterSupportLabel: formData.toolsFooterSupportLabel,
        toolsFooterSupportLinks: JSON.stringify(footerSupportLinks.value),
        toolsFooterRecordLinks: JSON.stringify(footerRecordLinks.value),
        toolsOfficialMediaLinks: JSON.stringify(officialMediaLinks.value),
        toolsFooterQuickSections: JSON.stringify(footerQuickSectionsParseResult.value.items),
        toolsFooterFriendSections: JSON.stringify(footerFriendSectionsParseResult.value.items),
    }

    const success = await runSubmit(async () => {
        await setWebsite(payload)
    })
    if (!success) {
        return
    }
    updateBaselineSnapshot()
}

/**
 * 函数说明：页面刷新或关闭前提示未保存变更，避免运营误关闭标签页。
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

.catalog-error {
    color: rgb(var(--red-6));
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

.link-row {
    display: grid;
    grid-template-columns: minmax(180px, 240px) minmax(320px, 1fr) auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.link-row:first-of-type {
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

.catalog-stat-row {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.catalog-error {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.7;
}

.footer-section-summary {
    border-top: 1px solid var(--color-border-2);
    border-bottom: 1px solid var(--color-border-2);
    padding: 16px 0;
}

.footer-section-summary__main {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.footer-section-summary__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1);
}

.footer-section-summary__desc {
    max-width: 760px;
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.footer-section-summary__metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    margin-top: 14px;
    background: var(--color-border-2);
    border: 1px solid var(--color-border-2);
}

.footer-section-summary__metric {
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

.footer-section-summary__metric strong {
    color: var(--color-text-1);
}

.footer-section-summary__metric strong.is-danger {
    color: rgb(var(--red-6));
}

@media (max-width: 920px) {
    .link-row,
    .mode-toolbar {
        grid-template-columns: 1fr;
    }

    .mode-toolbar {
        align-items: flex-start;
        flex-direction: column;
    }

    .footer-section-summary__main {
        flex-direction: column;
    }

    .footer-section-summary__metrics {
        grid-template-columns: 1fr;
    }
}
</style>
