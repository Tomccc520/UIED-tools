<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="website-hot-tools pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 热门工具">
            <template #subtitle>
                配置首页热门推荐区，支持标题、简介、链接和排序。其它官网设置项请直接通过左侧菜单切换，不再在页面里二次跳转。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag color="arcoblue" bordered>运营配置</a-tag>
                        <a-tag color="green" bordered>实时生效</a-tag>
                        <a-tag v-if="hotTools.length > 0" color="orange" bordered
                            >已配置 {{ hotTools.length }} 条</a-tag
                        >
                    </div>
                    <a-button size="small" @click="restoreDefaultHotTools">恢复默认</a-button>
                    <a-button size="small" @click="openToolsPreview">前端预览</a-button>
                    <a-button size="small" @click="runHotToolsHealthCheck">一键体检</a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">


            <operate-collapse
                v-model="operationCollapseKeys"
                :validation-tips="hotToolValidationTips"
                :guide-items="hotToolGuideItems"
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
                            ? '简版聚焦热门工具列表维护。统计卡片已收进高级模式。'
                            : '高级模式会显示更多统计卡片用于运营排查。'
                    }}
                </span>
            </div>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">外部链接</div>
                    <div class="stat-value">{{ externalHotTools }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">无效项</div>
                    <div class="stat-value" :class="{ 'is-danger': invalidHotToolsCount > 0 }">
                        {{ invalidHotToolsCount }}
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">空配置项</div>
                    <div class="stat-value">{{ emptyHotToolsCount }}</div>
                </div>
            </div>

            <div class="mt-5 layout-group">
                <div class="group-head">
                    <span>支持配置标题、简介与跳转链接（建议 6~12 条）</span>
                    <div class="group-actions">
                        <a-button type="text" @click="restoreDefaultHotTools">恢复默认</a-button>
                        <a-button type="text" @click="addHotTool">新增热门工具</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    支持三类链接：内部路由（/tools/...）、外链（https://...）、锚点（#xxx）。
                </div>

                <div v-if="hotTools.length === 0" class="form-tips">
                    热门推荐区还没开始配置，先补 1 条高频工具，首页区块就能先展示。
                </div>
                <div
                    v-for="(item, index) in hotTools"
                    :key="`hot-tool-${index}`"
                    class="hot-tool-row"
                >
                    <a-input v-model="item.title" placeholder="标题，如：免费AI编程工具" />
                    <a-input v-model="item.desc" placeholder="简介，如：支持多模型智能对话" />
                    <a-input
                        v-model="item.link"
                        placeholder="链接，如：https://example.com 或 /tools/hot-ranking"
                    />
                    <div class="row-actions">
                        <a-button type="text" @click="moveHotTool(index, -1)">上移</a-button>
                        <a-button type="text" @click="moveHotTool(index, 1)">下移</a-button>
                        <a-button type="text" status="danger" @click="removeHotTool(index)"
                            >删除</a-button
                        >
                    </div>
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:hottools:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteHotTools">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import OperateCollapse from './components/operate-collapse.vue'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'

interface ToolsHotToolItem {
    title: string
    desc: string
    link: string
}

const defaultHotTools: ToolsHotToolItem[] = [
    {
        title: 'Adobe 正版全家桶可用AI',
        desc: 'Adobe 正版全家桶可用AI',
        link: 'https://universalbus.cn/?s=lPLG02aydo'
    },
    {
        title: 'Gemini3 可用 nanobanana',
        desc: 'Gemini3 可用 nanobanana',
        link: 'https://universalbus.cn/?s=lPLG02aydo'
    },
    {
        title: 'AI学习网站',
        desc: '每天逛一逛',
        link: 'https://www.uied.cn/category/aigc/ai'
    },
    {
        title: '免费AI生成PPT',
        desc: 'AI智能生成PPT',
        link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047'
    },
    {
        title: 'AIGC学习网站',
        desc: 'UIED技术团队官网',
        link: 'https://uied.cn/'
    },
    {
        title: 'AIGC工具',
        desc: 'AI智能工具集合',
        link: 'https://universalbus.cn/?s=lPLG02aydo'
    },
    {
        title: 'Midjourney绘画',
        desc: 'AI绘画生成工具',
        link: 'https://nf.video/czybtp/?gid=26'
    },
    {
        title: 'GPT-5.2',
        desc: '最新版GPT-5.2智能对话工具',
        link: 'https://nf.video/oemcwv/?gid=18'
    },
    {
        title: 'ChatExcel表格',
        desc: 'AI Excel 数据分析辅助工具',
        link: 'https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6'
    }
]

const appStore = useAppStore()
const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('热门工具配置已保存')
/**
 * 函数说明：控制热门工具页运营模式。简版仅保留高频列表编辑，高级模式展示统计卡片。
 */
const simpleMode = ref(true)
const baselineSnapshot = ref('')
const operationCollapseKeys = ref<(string | number)[]>([
    'quick_actions',
    'validation_tips',
    'operation_guide'
])
const hotToolGuideItems = [
    '先补齐标题、简介、链接，确保每条信息完整。',
    '点“一键体检”检查链接格式和重复项。',
    '确认后点击“保存配置”，再到前端首页检查展示。'
]

// 复用网站配置对象，避免调用 website/save 时覆盖其它字段
const formData = reactive<Record<string, string>>({
    name: '',
    favicon: '',
    logo: '',
    backdrop: '',
    shopName: '',
    shopLogo: '',
    toolsSiteSlogan: '免费在线工具集',
    toolsSidebarRecommendTitle: '推荐工具',
    toolsFooterIntro: '{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台',
    toolsFooterQuickTitle: '工具快捷入口',
    toolsFooterFriendTitle: '友情链接',
    toolsOfficialMediaTitle: '官方媒体',
    toolsFooterSupportLabel: '技术支持',
    toolsFooterSupportLinks: '[]',
    toolsFooterRecordLinks: '[]',
    toolsHotTools: JSON.stringify(defaultHotTools),
    toolsBannerSlides: '[]',
    toolsHeaderLinks: '[]',
    toolsSidebarRecommend: '[]',
    toolsSidebarCategoryMenus: '[]',
    toolsCategoryTree: '[]',
    toolsSidebarBottomLinks: '[]',
    toolsAiToolboxSidebarMenus: '[]',
    toolsFooterQuickSections: '[]',
    toolsFooterFriendSections: '[]',
    toolsOfficialMediaLinks: '[]'
})

const hotTools = ref<ToolsHotToolItem[]>([])

/**
 * 函数说明：统计当前热门工具总数，便于运营判断是否达到推荐数量
 */
const totalHotTools = computed(() => hotTools.value.length)

/**
 * 函数说明：统计站内链接数量，便于控制导流与站内分发比例
 */
const internalHotTools = computed(() => {
    return hotTools.value.filter((item) => {
        const link = item.link.trim()
        return Boolean(link) && !/^https?:\/\//i.test(link)
    }).length
})

/**
 * 函数说明：统计外链数量，便于评估站外合作位投放占比
 */
const externalHotTools = computed(() => {
    return hotTools.value.filter((item) => /^https?:\/\//i.test(item.link.trim())).length
})

/**
 * 函数说明：统计空配置项数量，帮助运营快速定位需补充内容的条目
 */
const emptyHotToolsCount = computed(() => {
    return hotTools.value.filter((item) => {
        return !item.title.trim() && !item.desc.trim() && !item.link.trim()
    }).length
})

/**
 * 函数说明：统计无效条目数量（字段缺失或链接格式不合法）
 */
const invalidHotToolsCount = computed(() => {
    return hotTools.value.filter((item) => {
        const hasMissing = !item.title.trim() || !item.desc.trim() || !item.link.trim()
        if (hasMissing) {
            return true
        }
        return !isValidHotToolLink(item.link)
    }).length
})

/**
 * 函数说明：将热门工具编辑状态序列化为快照，用于未保存变更判断
 */
const buildHotToolsSnapshot = (): string => {
    return JSON.stringify(hotTools.value)
}

/**
 * 函数说明：更新基线快照，表示当前编辑状态已保存
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildHotToolsSnapshot()
}

/**
 * 函数说明：判断是否存在未保存变更，配合离开提醒减少误操作
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildHotToolsSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：克隆默认热门工具，避免响应式引用污染常量
 */
const cloneDefaultHotTools = (): ToolsHotToolItem[] => {
    return defaultHotTools.map((item) => ({ ...item }))
}

/**
 * 函数说明：创建空热门工具项，统一新增条目默认值
 */
const createEmptyHotToolItem = (): ToolsHotToolItem => ({
    title: '',
    desc: '',
    link: ''
})

/**
 * 函数说明：解析热门工具 JSON，异常或空值时返回默认数据
 */
const parseHotTools = (jsonText: string): ToolsHotToolItem[] => {
    const trimmed = (jsonText || '').trim()
    if (!trimmed) {
        return cloneDefaultHotTools()
    }

    try {
        const parsed = JSON.parse(trimmed)
        if (!Array.isArray(parsed)) {
            return cloneDefaultHotTools()
        }

        const normalized = parsed
            .map((item) => {
                if (!item || typeof item !== 'object') {
                    return null
                }
                const record = item as Record<string, unknown>
                return {
                    title: String(record.title || record.name || '').trim(),
                    desc: String(record.desc || record.description || '').trim(),
                    link: String(record.link || record.url || '').trim()
                }
            })
            .filter((item): item is ToolsHotToolItem => Boolean(item))
            .filter((item) => item.title || item.desc || item.link)

        return normalized.length > 0 ? normalized : cloneDefaultHotTools()
    } catch {
        return cloneDefaultHotTools()
    }
}

/**
 * 函数说明：校验热门工具链接格式，支持 /、#、http(s) 三种入口
 */
const isValidHotToolLink = (link: string): boolean => {
    const value = link.trim()
    return value.startsWith('/') || value.startsWith('#') || /^https?:\/\//i.test(value)
}

/**
 * 函数说明：收集热门工具配置校验提示，用于统一展示校验结果。
 */
const collectHotToolValidationTips = (items: ToolsHotToolItem[]): string[] => {
    const tips: string[] = []

    if (items.length === 0) {
        tips.push('热门工具至少需要配置 1 项。')
        return tips
    }

    const duplicateLinks = new Set<string>()
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        if (!item.title.trim()) {
            tips.push(`第 ${index + 1} 项标题不能为空。`)
        }
        if (!item.desc.trim()) {
            tips.push(`第 ${index + 1} 项简介不能为空。`)
        }
        if (!item.link.trim()) {
            tips.push(`第 ${index + 1} 项链接不能为空。`)
        } else if (!isValidHotToolLink(item.link)) {
            tips.push(`第 ${index + 1} 项链接需以 /、# 或 http(s) 开头。`)
        }

        const normalizedLink = item.link.trim().toLowerCase()
        if (normalizedLink) {
            if (duplicateLinks.has(normalizedLink)) {
                tips.push(`第 ${index + 1} 项链接重复，请调整后再保存。`)
            }
            duplicateLinks.add(normalizedLink)
        }
    }

    return tips.slice(0, 8)
}

const hotToolValidationTips = computed(() => collectHotToolValidationTips(hotTools.value))

/**
 * 函数说明：校验热门工具配置，确保标题、简介、链接完整。
 */
const validateHotTools = (items: ToolsHotToolItem[]): boolean => {
    const tips = collectHotToolValidationTips(items)
    if (tips.length > 0) {
        feedback.msgError(tips[0])
        return false
    }
    return true
}

/**
 * 函数说明：读取网站配置并回填热门工具编辑区
 */
const getData = async () => {
    const data = await getWebsite()
    for (const key in formData) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            formData[key] = (data[key] ?? '') as string
        }
    }
    hotTools.value = parseHotTools(formData.toolsHotTools)
    updateBaselineSnapshot()
}

/**
 * 函数说明：新增热门工具条目
 */
const addHotTool = () => {
    hotTools.value.push(createEmptyHotToolItem())
}

/**
 * 函数说明：恢复热门工具默认模板，方便运营快速回退到推荐配置
 */
const restoreDefaultHotTools = () => {
    hotTools.value = cloneDefaultHotTools()
    feedback.msgSuccess('已恢复默认热门工具模板')
}

/**
 * 函数说明：调整热门工具顺序，支持上移和下移
 */
const moveHotTool = (index: number, step: -1 | 1) => {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= hotTools.value.length) {
        return
    }
    const current = hotTools.value[index]
    hotTools.value[index] = hotTools.value[targetIndex]
    hotTools.value[targetIndex] = current
}

/**
 * 函数说明：删除热门工具条目
 */
const removeHotTool = (index: number) => {
    hotTools.value.splice(index, 1)
}

/**
 * 函数说明：打开 tools 前端首页预览，便于运营校验展示效果
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：执行热门工具配置体检，输出可执行问题提示
 */
const runHotToolsHealthCheck = () => {
    const tips = collectHotToolValidationTips(hotTools.value)
    if (tips.length > 0) {
        feedback.alertWarning(`配置体检未通过：${tips[0]}`)
        return
    }
    feedback.msgSuccess('配置体检通过：热门工具项结构与链接格式正常')
}

/**
 * 函数说明：校验并保存热门工具配置到网站配置项
 */
const handleSubmit = async () => {
    if (!validateHotTools(hotTools.value)) {
        return
    }
    await runSubmit(async () => {
        formData.toolsHotTools = JSON.stringify(hotTools.value)
        await setWebsite(formData)
        await appStore.getConfig()
        await getData()
    })
}

/**
 * 函数说明：浏览器刷新或关闭前提醒未保存变更，减少运营误操作
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提示未保存变更，防止编辑中断
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
    border-radius: 16px;
}

.page-entry-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
}

.page-entry-card {
    padding: 16px 18px;
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.page-entry-card__title {
    margin-top: 0;
    font-size: 16px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1);
}

.page-entry-card__desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2);
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
    border: 1px solid #d8d2ff;
    background: #f3efff;
    color: #5b47d6;
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

.catalog-alert {
    margin-bottom: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.stat-card {
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    background: #fff;
    padding: 10px 12px;
}

.stat-label {
    font-size: 12px;
    color: var(--color-text-3);
}

.stat-value {
    margin-top: 4px;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-1);
}

.stat-value.is-danger {
    color: var(--color-danger-6, #f53f3f);
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    background: #fff;
    padding: 18px;
}

.official-tabs {
    margin-bottom: 10px;
}

.group-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-1);
    gap: 12px;
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
    line-height: 1.75;
    color: var(--color-text-3);
}

.hot-tool-row {
    display: grid;
    grid-template-columns: minmax(160px, 220px) minmax(220px, 1fr) minmax(320px, 1fr) auto;
    gap: 12px;
    margin-bottom: 10px;
    align-items: start;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: #fafbff;
    padding: 10px;
}

.row-actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    min-height: 32px;
}

.row-actions :deep(.arco-btn) {
    padding: 0 8px;
    border-radius: 8px;
}

@media (max-width: 920px) {
    .page-entry-grid,
    .ops-workspace,
    .ops-workspace__meta,
    .stats-grid {
        grid-template-columns: 1fr;
    }

    .group-head {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .hot-tool-row {
        grid-template-columns: 1fr;
    }
}
</style>
