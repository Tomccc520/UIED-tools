<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="website-information pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 基础信息">
            <template #subtitle>
                统一维护站点品牌、登录视觉和商城基础资料，保存后前后台页面立即生效。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag color="arcoblue" bordered>基础配置</a-tag>
                        <a-tag color="green" bordered>实时生效</a-tag>
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button size="small" @click="getData">刷新配置</a-button>
                    <a-button size="small" @click="goFrontendLayout">前端布局</a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="page-card pro-panel-card" :bordered="false">


            <operate-collapse
                v-model="operationCollapseKeys"
                :validation-tips="validationTips"
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
                            ? '简版聚焦基础信息填写；跨页面快捷跳转与统计卡片已收进高级模式。'
                            : '高级模式会展示更多统计与跨页入口，便于联动维护。'
                    }}
                </span>
            </div>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">后台站点名</div>
                    <div class="stat-value">{{ formData.name ? '已配置' : '未配置' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">登录背景图</div>
                    <div class="stat-value">{{ formData.backdrop ? '已配置' : '未配置' }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">商城品牌</div>
                    <div class="stat-value">{{ isShopBaseReady ? '完整' : '待完善' }}</div>
                </div>
            </div>

            <a-collapse
                v-model:active-key="sectionCollapseKeys"
                class="section-collapse mt-5"
                :bordered="false"
            >
                <a-collapse-item key="admin_base" header="后台设置">
                    <a-form :model="formData" layout="vertical" class="setting-form">
                        <a-form-item field="name" label="网站名称">
                            <a-input
                                v-model="formData.name"
                                placeholder="请输入网站名称"
                                :max-length="30"
                                allow-clear
                                show-word-limit
                            />
                        </a-form-item>
                        <a-form-item field="favicon" label="网站图标">
                            <div class="picker-wrap">
                                <material-picker v-model="formData.favicon" :limit="1" />
                                <div class="form-tips">
                                    建议尺寸：100 x 100 像素，支持 jpg / jpeg / png
                                </div>
                            </div>
                        </a-form-item>
                        <a-form-item field="logo" label="网站LOGO">
                            <div class="picker-wrap">
                                <material-picker v-model="formData.logo" :limit="1" />
                                <div class="form-tips">
                                    建议尺寸：200 x 200 像素，支持 jpg / jpeg / png
                                </div>
                            </div>
                        </a-form-item>
                        <a-form-item field="backdrop" label="登录页广告图">
                            <div class="picker-wrap">
                                <material-picker v-model="formData.backdrop" :limit="1" />
                                <div class="form-tips">
                                    建议尺寸：400 x 400 像素，支持 jpg / jpeg / png
                                </div>
                            </div>
                        </a-form-item>
                    </a-form>
                </a-collapse-item>

                <a-collapse-item key="shop_base" header="前台设置">
                    <a-alert class="mb-4" type="info" show-icon>
                        侧边栏 / 头部 / 页脚 / SEO
                        已拆分到“官网设置”对应页面，这里只维护商城基础信息。
                    </a-alert>
                    <a-form :model="formData" layout="vertical" class="setting-form">
                        <a-form-item field="shopName" label="商城名称">
                            <a-input
                                v-model="formData.shopName"
                                placeholder="请输入商城名称"
                                :max-length="30"
                                allow-clear
                                show-word-limit
                            />
                        </a-form-item>
                        <a-form-item field="shopLogo" label="商城LOGO">
                            <div class="picker-wrap">
                                <material-picker v-model="formData.shopLogo" :limit="1" />
                                <div class="form-tips">
                                    建议尺寸：100 x 100 像素，支持 jpg / jpeg / png
                                </div>
                            </div>
                        </a-form-item>
                    </a-form>
                </a-collapse-item>
            </a-collapse>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="webInformation">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import OperateCollapse from './components/operate-collapse.vue'
import { useOperateSubmit } from './composables/use-operate-submit'

interface FocusItem {
    label: string
    value: string
    desc: string
    className: 'is-ok' | 'is-warning' | 'is-danger'
}

const router = useRouter()
const { getConfig } = useAppStore()
const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('网站信息已保存')
/**
 * 函数说明：控制基础信息页运营模式。简版聚焦必填字段，高级模式显示跨页跳转与统计扩展。
 */
const simpleMode = ref(true)
const baselineSnapshot = ref('')
const operationCollapseKeys = ref<(string | number)[]>([
    'quick_actions',
    'validation_tips',
    'operation_guide'
])
const sectionCollapseKeys = ref<(string | number)[]>(['admin_base', 'shop_base'])
const guideItems = [
    '先完善后台品牌信息（站点名称、图标、LOGO、登录背景）。',
    '再维护商城名称和商城 LOGO，确保前后台视觉统一。',
    '保存后去前端和后台登录页分别核对实际展示效果。'
]

// 表单数据：保留 tools 布局相关字段，避免保存网站信息时覆盖已有运营配置
const formData = reactive({
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
    toolsHotTools: '[]',
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

/**
 * 函数说明：构建基础信息页的快照文本，用于判断是否存在未保存改动。
 */
const buildSnapshot = (): string =>
    JSON.stringify({
        name: String(formData.name || '').trim(),
        favicon: String(formData.favicon || '').trim(),
        logo: String(formData.logo || '').trim(),
        backdrop: String(formData.backdrop || '').trim(),
        shopName: String(formData.shopName || '').trim(),
        shopLogo: String(formData.shopLogo || '').trim()
    })

/**
 * 函数说明：记录当前页面基线快照，作为“是否有未保存变更”的对照值。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSnapshot()
}/**
 * 函数说明：判断后台品牌配置是否完整。
 */
const isAdminBaseReady = computed(() =>
    [formData.name, formData.favicon, formData.logo, formData.backdrop].every((item) =>
        String(item || '').trim()
    )
)

/**
 * 函数说明：判断商城配置是否完整。
 */
const isShopBaseReady = computed(() =>
    [formData.shopName, formData.shopLogo].every((item) => String(item || '').trim())
)

/**
 * 函数说明：返回基础信息页未保存状态，用于顶部标记与离开提醒。
 */
const hasUnsavedChanges = computed(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSnapshot() !== baselineSnapshot.value
})

/**
 * 函数说明：收集网站基础信息校验提示，统一给运营侧展示完整问题列表。
 */
const collectWebsiteValidationTips = (): string[] => {
    const tips: string[] = []
    if (!String(formData.name || '').trim()) {
        tips.push('请输入网站名称。')
    }
    if (!String(formData.favicon || '').trim()) {
        tips.push('请选择网站图标。')
    }
    if (!String(formData.logo || '').trim()) {
        tips.push('请选择网站 LOGO。')
    }
    if (!String(formData.backdrop || '').trim()) {
        tips.push('请选择登录页广告图。')
    }
    if (!String(formData.shopName || '').trim()) {
        tips.push('请输入店铺/商城名称。')
    }
    if (!String(formData.shopLogo || '').trim()) {
        tips.push('请选择商城 LOGO。')
    }
    return tips
}

const validationTips = computed(() => collectWebsiteValidationTips())

/**
 * 函数说明：读取网站配置并回填表单，避免保存时丢失其它配置字段。
 */
const getData = async () => {
    try {
        const data = await getWebsite()
        for (const key in formData) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                // @ts-ignore
                formData[key] = data[key] ?? ''
            }
        }
        updateBaselineSnapshot()
    } catch {
        feedback.msgError('读取网站配置失败，请检查接口或登录状态')
    }
}

/**
 * 函数说明：校验网站基础配置必填项，避免运营保存空值导致前后台展示异常。
 */
const validateWebsiteBaseFields = (): boolean => {
    if (validationTips.value.length > 0) {
        feedback.msgError(validationTips.value[0])
        return false
    }
    return true
}/**
 * 函数说明：跳转到前端布局配置页，便于运营串联配置流程。
 */
const goFrontendLayout = () => {
    router.push('/official_site/frontend_layout')
}

/**
 * 函数说明：仅组装基础信息页负责的配置字段，避免保存时覆盖其他官网运营页的最新配置。
 */
const buildWebsiteBasePayload = (): Record<string, string> => ({
    name: formData.name,
    favicon: formData.favicon,
    logo: formData.logo,
    backdrop: formData.backdrop,
    shopName: formData.shopName,
    shopLogo: formData.shopLogo
})

/**
 * 函数说明：校验并保存网站基础信息。
 */
const handleSubmit = async () => {
    if (!validateWebsiteBaseFields()) {
        return
    }
    const success = await runSubmit(async () => {
        await setWebsite(buildWebsiteBasePayload())
        await getConfig()
        await getData()
    })
    if (!success) {
        return
    }
    updateBaselineSnapshot()
}

/**
 * 函数说明：浏览器刷新或关闭前提示未保存变更，减少误操作导致的数据丢失。
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提醒运营确认离开，防止未保存内容被意外丢弃。
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
    grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.9fr);
    gap: 12px;
    margin-bottom: 14px;
}

.page-entry-card {
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid var(--color-border-2);
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
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

.mode-alert {
    margin-bottom: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.section-collapse {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
    overflow: hidden;
}

.setting-form {
    max-width: 820px;
}

.picker-wrap {
    width: 100%;
}

.form-tips {
    background: var(--color-fill-1, #f7f8fa);
    border-radius: 10px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

@media (max-width: 920px) {
    .page-entry-grid,
    .stats-grid,
    .ops-workspace,
    .ops-workspace__meta {
        grid-template-columns: 1fr;
    }
}
</style>
