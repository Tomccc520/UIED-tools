<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */
-->
<template>
    <div class="website-sidebar-settings pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 菜单设置">
            <template #subtitle>
                维护前端品牌区、推荐入口、一级分类和底部菜单。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag :color="hasUnsavedChanges ? 'orange' : 'green'" bordered>
                            {{ hasUnsavedChanges ? '待发布' : '已同步' }}
                        </a-tag>
                    </div>
                    <a-button size="small" data-admin-smoke="sidebar-reload" @click="reloadSidebarData">重新加载</a-button>
                    <a-button size="small" data-admin-smoke="sidebar-preview" @click="openToolsPreview">前端预览</a-button>
                    <a-button size="small" data-admin-smoke="sidebar-health-check" @click="runSidebarHealthCheck">一键体检</a-button>
                    <a-button
                        v-perms="['setting:website:sidebar:save']"
                        data-admin-smoke="sidebar-save-top"
                        type="primary"
                        :loading="isSubmitting"
                        @click="handleSubmit"
                    >保存</a-button>
                </div>
            </template>
        </a-page-header>

        <a-alert
            v-if="saveResultText"
            class="save-result-alert"
            :type="saveResultType"
            :closable="false"
            show-icon
        >
            {{ saveResultText }}
        </a-alert>

        <a-card class="page-card pro-panel-card" :bordered="false">
            <div class="mode-toolbar">
                <a-space>
                    <a-switch v-model="simpleMode" data-admin-smoke="sidebar-mode-switch" type="round" />
                    <span class="mode-toolbar__label">{{
                        simpleMode ? '运营简版（推荐）' : '高级模式'
                    }}</span>
                </a-space>
            </div>

            <div v-if="!simpleMode" class="stats-grid mt-4">
                <div class="stat-card">
                    <div class="stat-label">底部入口</div>
                    <div class="stat-value">{{ sidebarBottomLinks.length }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">AI工具箱菜单</div>
                    <div class="stat-value">{{ aiToolboxSidebarMenus.length }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">解析状态</div>
                    <div
                        class="stat-value"
                        :class="{ 'is-danger': Boolean(sidebarMenuBlocksParseError) }"
                    >
                        {{ sidebarMenuBlocksParseError ? '异常' : '正常' }}
                    </div>
                </div>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>品牌文案</span>
                </div>
                <div class="form-tips mb-2">
                    控制左侧品牌区的 Logo、副标题、主文案与推荐分组标题。
                </div>
                <a-form
                    :model="formData"
                    :label-col-props="{ span: 5 }"
                    :wrapper-col-props="{ span: 19 }"
                    class="compact-form"
                >
                    <a-form-item label="品牌副标题">
                        <a-input
                            v-model="formData.toolsSiteSlogan"
                            maxlength="30"
                            show-word-limit
                            placeholder="如：免费在线工具集"
                        />
                    </a-form-item>
                    <a-form-item label="品牌Logo(SVG)">
                        <div class="menu-icon-editor">
                            <material-picker
                                :model-value="sidebarBrandLogoMaterialValue"
                                :limit="1"
                                size="40px"
                                file-size="90px"
                                @update:model-value="handleSidebarBrandLogoMaterialChange"
                            />
                            <a-textarea
                                v-model="formData.toolsSidebarBrandLogo"
                                :auto-size="{ minRows: 3, maxRows: 6 }"
                                placeholder="支持 /uploads/*.svg、http(s) 链接、纯 <svg>...</svg> 或包含 SVG 的 HTML"
                            />
                        </div>
                    </a-form-item>
                    <a-form-item label="品牌主文案">
                        <a-input
                            v-model="formData.toolsSidebarBrandText"
                            data-admin-smoke="sidebar-brand-text"
                            maxlength="30"
                            show-word-limit
                            placeholder="如：UIED Tools"
                        />
                    </a-form-item>
                    <a-form-item label="推荐分组标题">
                        <a-input
                            v-model="formData.toolsSidebarRecommendTitle"
                            maxlength="20"
                            show-word-limit
                            placeholder="如：推荐工具"
                        />
                    </a-form-item>
                </a-form>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>推荐链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSidebarRecommendLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">位于左栏“推荐工具”分组。支持站内路由、锚点和外链。</div>
                <div v-if="sidebarRecommendLinks.length === 0" class="form-tips">
                    推荐区还没开始配置，先补 1 条高频入口，左栏推荐区就能先展示。
                </div>
                <div
                    v-for="(item, index) in sidebarRecommendLinks"
                    :key="`sidebar-recommend-${index}`"
                    class="link-row"
                >
                    <a-input v-model="item.name" placeholder="名称，如：每日热榜" />
                    <a-input
                        v-model="item.link"
                        placeholder="链接，如：/tools/hot-ranking 或 #recommend-hot"
                    />
                    <div class="row-actions">
                        <a-button
                            type="text"
                            @click="moveLinkItem(sidebarRecommendLinks, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" @click="moveLinkItem(sidebarRecommendLinks, index, 1)"
                            >下移</a-button
                        >
                        <a-button
                            type="text"
                            status="danger"
                            @click="removeSidebarRecommendLink(index)"
                            >删除</a-button
                        >
                    </div>
                </div>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>前端一级菜单</span>
                    <div class="group-actions">
                        <a-button type="text" @click="goIconLibrary">图标库</a-button>
                        <a-button type="text" @click="addSidebarCategoryMenu">新增菜单</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    控制前端左栏第一层菜单按钮。支持自定义图标 URL（建议
                    SVG），如配置直达链接将优先跳转该链接。
                </div>
                <div v-if="sidebarCategoryMenus.length === 0" class="form-tips">
                    一级菜单还没开始配置，先补 1 个主分类，左栏结构就能先立起来。
                </div>
                <div
                    v-for="(item, index) in sidebarCategoryMenus"
                    :key="`sidebar-category-${index}`"
                    class="menu-row"
                >
                    <a-input v-model="item.key" placeholder="菜单key，如：ai" />
                    <a-input v-model="item.title" placeholder="菜单标题，如：AI工具箱" />
                    <div class="menu-icon-editor">
                        <material-picker
                            v-model="item.icon"
                            :limit="1"
                            size="40px"
                            file-size="90px"
                        />
                        <a-input v-model="item.icon" placeholder="图标 URL / 内联 SVG（可选）" />
                    </div>
                    <a-input v-model="item.cateTitle" placeholder="分类标题，如：AI工具箱" />
                    <a-input
                        v-model="item.link"
                        placeholder="直达链接（可选），如：/tools/ai/toolbox"
                    />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(sidebarCategoryMenus, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" @click="moveLinkItem(sidebarCategoryMenus, index, 1)"
                            >下移</a-button
                        >
                        <a-button
                            type="text"
                            status="danger"
                            @click="removeSidebarCategoryMenu(index)"
                            >删除</a-button
                        >
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>菜单样式模块</span>
                    <div class="group-actions">
                        <a-button type="text" data-admin-smoke="sidebar-format-blocks" @click="formatSidebarMenuBlocksEditor"
                            >格式化</a-button
                        >
                        <a-button type="text" status="danger" data-admin-smoke="sidebar-clear-blocks" @click="resetSidebarMenuBlocksEditor"
                            >清空为 []</a-button
                        >
                    </div>
                </div>
                <div class="form-tips mb-2">
                    支持 <code>dropdown</code>、<code>list</code>、<code>image</code>、<code
                        >category</code
                    >
                    四种模块类型。若为空数组，前端会回退为旧版分类菜单渲染。
                </div>
                <a-alert class="section-alert" type="warning" :closable="false" show-icon>
                    菜单样式模块用于更复杂的导航表达。建议优先维护分类菜单；只有需要特殊下拉/图片/分组导航时再启用这里。
                </a-alert>
                <a-textarea
                    v-model="sidebarMenuBlocksEditor"
                    :rows="16"
                    placeholder='请输入 JSON 数组，如：[{"key":"menu-dropdown","title":"下拉菜单","type":"dropdown","items":[{"name":"AI抠图","link":"/tools/photo/background"}]}]'
                />
                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered>模块 {{ sidebarMenuBlocksCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>条目 {{ sidebarMenuBlockItemCount }}</a-tag>
                </div>
                <div v-if="sidebarMenuBlocksParseError" class="catalog-error">
                    {{ sidebarMenuBlocksParseError }}
                </div>
            </div>

            <div class="layout-group mt-5">
                <div class="group-head">
                    <span>底部入口</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSidebarBottomLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    左栏底部固定入口，建议保留更新记录、意见反馈、关于我们等核心入口。
                </div>
                <div v-if="sidebarBottomLinks.length === 0" class="form-tips">
                    底部入口还没开始配置，先补 1 条常用入口，左栏底部就能先成型。
                </div>
                <div
                    v-for="(item, index) in sidebarBottomLinks"
                    :key="`sidebar-bottom-${index}`"
                    class="link-row"
                >
                    <a-input v-model="item.name" placeholder="名称，如：更新记录" />
                    <a-input
                        v-model="item.link"
                        placeholder="链接，如：/changelog 或 https://xxx"
                    />
                    <div class="row-actions">
                        <a-button type="text" @click="moveLinkItem(sidebarBottomLinks, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" @click="moveLinkItem(sidebarBottomLinks, index, 1)"
                            >下移</a-button
                        >
                        <a-button
                            type="text"
                            status="danger"
                            @click="removeSidebarBottomLink(index)"
                            >删除</a-button
                        >
                    </div>
                </div>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <div class="group-head">
                    <span>AI工具箱独立左栏</span>
                    <div class="group-actions">
                        <a-button type="text" data-admin-smoke="sidebar-add-ai-menu" @click="addAiToolboxSidebarMenu">新增菜单</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    仅用于
                    <code>/tools/ai/toolbox</code>
                    页面左栏固定入口，建议优先配置锚点或外链，避免和自动生成的 AI 分类导航重复。
                </div>
                <div v-if="aiToolboxSidebarMenus.length === 0" class="form-tips">
                    AI 工具箱左栏还没开始配置，先补 1 个主分组，工具箱页结构就能先跑起来。
                </div>
                <div
                    v-for="(item, index) in aiToolboxSidebarMenus"
                    :key="`ai-toolbox-sidebar-${index}`"
                    class="link-row"
                >
                    <a-input v-model="item.name" placeholder="名称，如：AI精选工具" />
                    <a-input
                        v-model="item.link"
                        placeholder="链接，如：#ai-highlight /tools/ai/chat"
                    />
                    <div class="row-actions">
                        <a-button
                            type="text"
                            @click="moveLinkItem(aiToolboxSidebarMenus, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" @click="moveLinkItem(aiToolboxSidebarMenus, index, 1)"
                            >下移</a-button
                        >
                        <a-button
                            type="text"
                            status="danger"
                            @click="removeAiToolboxSidebarMenu(index)"
                            >删除</a-button
                        >
                    </div>
                </div>
            </div>
        </a-card>

        <footer-btns :fixed="false" v-perms="['setting:website:sidebar:save']">
            <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="websiteSidebarSettings">
import { getWebsite, setWebsite } from '@/api/setting/website'
import type { WebsiteSettingPayload } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { useOperateSubmit } from './composables/use-operate-submit'

interface ToolsLinkItem {
    name: string
    link: string
    desc?: string
}

interface ToolsSidebarCategoryMenuItem {
    key: string
    title: string
    icon: string
    cateTitle: string
    link: string
}

interface ToolsSidebarMenuBlockItem {
    name: string
    link: string
    category?: string
    desc?: string
    icon?: string
    image?: string
}

interface ToolsSidebarMenuBlockEditor {
    key: string
    title: string
    type: string
    icon?: string
    items: ToolsSidebarMenuBlockItem[]
}

const appStore = useAppStore()
const router = useRouter()
const { isSubmitting, lastSavedAt, runSubmit } = useOperateSubmit('菜单设置已保存')
const baselineSnapshot = ref('')
const simpleMode = ref(true)
const saveResultText = ref('')
const saveResultType = ref<'success' | 'error'>('success')

const formData = reactive<Record<string, string>>({
    toolsSiteSlogan: '免费在线工具集',
    toolsSidebarBrandLogo: '',
    toolsSidebarBrandText: 'UIED-Tools',
    toolsSidebarRecommendTitle: '推荐工具'
})

const sidebarRecommendLinks = ref<ToolsLinkItem[]>([])
const sidebarCategoryMenus = ref<ToolsSidebarCategoryMenuItem[]>([])
const sidebarBottomLinks = ref<ToolsLinkItem[]>([])
const aiToolboxSidebarMenus = ref<ToolsLinkItem[]>([])
const sidebarMenuBlocksEditor = ref('[]')

/**
 * 函数说明：仅向素材选择器提供可加载的图片地址，避免内联 SVG 被浏览器误当成 URL 请求。
 */
const sidebarBrandLogoMaterialValue = computed<string>(() => {
    const value = String(formData.toolsSidebarBrandLogo || '').trim()
    if (/<(?:svg|g)\b[\s\S]*<\/(?:svg|g)>/i.test(value)) {
        return ''
    }
    return value
})

/**
 * 函数说明：接收素材库选择结果并同步到侧栏品牌 Logo 配置。
 */
const handleSidebarBrandLogoMaterialChange = (value: string | string[]) => {
    formData.toolsSidebarBrandLogo = Array.isArray(value) ? String(value[0] || '') : String(value || '')
}

/**
 * 函数说明：解析链接数组 JSON，异常时回退为空数组，避免运营页直接崩溃。
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
            desc: String(item?.desc || '')
        }))
    } catch {
        return []
    }
}

/**
 * 函数说明：解析前端一级菜单 JSON，确保字段齐全后再回填编辑表单。
 */
const parseSidebarCategoryMenus = (value: unknown): ToolsSidebarCategoryMenuItem[] => {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value || '[]') : value
        if (!Array.isArray(parsed)) {
            return []
        }
        return parsed.map((item) => ({
            key: String(item?.key || ''),
            title: String(item?.title || ''),
            icon: String(item?.icon || ''),
            cateTitle: String(item?.cateTitle || ''),
            link: String(item?.link || '')
        }))
    } catch {
        return []
    }
}

/**
 * 函数说明：解析菜单样式模块 JSON，用于体检和计数展示。
 */
const parseSidebarMenuBlocks = (
    value: string
): { items: ToolsSidebarMenuBlockEditor[]; error: string } => {
    try {
        const parsed = JSON.parse(value || '[]')
        if (!Array.isArray(parsed)) {
            return { items: [], error: '菜单样式模块必须是 JSON 数组。' }
        }
        const items = parsed.map((item) => ({
            key: String(item?.key || ''),
            title: String(item?.title || ''),
            type: String(item?.type || ''),
            icon: String(item?.icon || ''),
            items: Array.isArray(item?.items)
                ? item.items.map((child: ToolsSidebarMenuBlockItem) => ({
                      name: String(child?.name || ''),
                      link: String(child?.link || ''),
                      category: String(child?.category || ''),
                      desc: String(child?.desc || ''),
                      icon: String(child?.icon || ''),
                      image: String(child?.image || '')
                  }))
                : []
        }))
        return { items, error: '' }
    } catch (error) {
        return { items: [], error: `菜单样式模块解析失败：${(error as Error).message}` }
    }
}

/**
 * 函数说明：判断链接是否为允许格式，支持站内路径、锚点与 http(s) 外链。
 */
const isValidLinkValue = (link: string, allowHash = true): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return false
    }
    if (value.startsWith('/')) {
        return true
    }
    if (allowHash && value.startsWith('#')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：校验侧栏品牌 Logo 值，支持站内地址、外链地址、data URL 与内联 SVG。
 */
const isValidSidebarBrandLogo = (logoValue: string): boolean => {
    const value = String(logoValue || '').trim()
    if (!value) {
        return true
    }
    const lowerValue = value.toLowerCase()
    if (
        lowerValue.startsWith('<svg') ||
        lowerValue.startsWith('<g') ||
        /<svg[\s\S]*<\/svg>/i.test(value) ||
        /<g[\s\S]*<\/g>/i.test(value) ||
        lowerValue.startsWith('data:image/')
    ) {
        return true
    }
    if (value.startsWith('/')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：生成当前编辑状态快照，用于离开页面前判断是否存在未保存改动。
 */
const buildSidebarSnapshot = (): string => {
    return JSON.stringify({
        toolsSiteSlogan: formData.toolsSiteSlogan.trim(),
        toolsSidebarBrandLogo: formData.toolsSidebarBrandLogo.trim(),
        toolsSidebarBrandText: formData.toolsSidebarBrandText.trim(),
        toolsSidebarRecommendTitle: formData.toolsSidebarRecommendTitle.trim(),
        toolsSidebarRecommend: sidebarRecommendLinks.value,
        toolsSidebarCategoryMenus: sidebarCategoryMenus.value,
        toolsSidebarMenuBlocks: sidebarMenuBlocksEditor.value.trim(),
        toolsSidebarBottomLinks: sidebarBottomLinks.value,
        toolsAiToolboxSidebarMenus: aiToolboxSidebarMenus.value
    })
}

/**
 * 函数说明：更新基线快照，表示页面当前状态已与后端同步。
 */
const updateBaselineSnapshot = () => {
    baselineSnapshot.value = buildSidebarSnapshot()
}

/**
 * 函数说明：判断当前页面是否存在未保存变更，减少运营误操作。
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineSnapshot.value) {
        return false
    }
    return buildSidebarSnapshot() !== baselineSnapshot.value
})

const sidebarMenuBlocksParseResult = computed(() =>
    parseSidebarMenuBlocks(sidebarMenuBlocksEditor.value)
)
const sidebarMenuBlocksParseError = computed(() => sidebarMenuBlocksParseResult.value.error)
const sidebarMenuBlocksCount = computed(() => sidebarMenuBlocksParseResult.value.items.length)
const sidebarMenuBlockItemCount = computed(() => {
    return sidebarMenuBlocksParseResult.value.items.reduce(
        (count, item) => count + item.items.length,
        0
    )
})

/**
 * 函数说明：读取后端配置并回填页面表单，保持本页独立编辑且不覆盖其它官网设置。
 */
const applySidebarWebsiteData = (data: WebsiteSettingPayload) => {
    formData.toolsSiteSlogan = String(data.toolsSiteSlogan || formData.toolsSiteSlogan)
    formData.toolsSidebarBrandLogo = String(data.toolsSidebarBrandLogo || '')
    formData.toolsSidebarBrandText = String(
        data.toolsSidebarBrandText || formData.toolsSidebarBrandText
    )
    formData.toolsSidebarRecommendTitle = String(
        data.toolsSidebarRecommendTitle || formData.toolsSidebarRecommendTitle
    )
    sidebarRecommendLinks.value = parseLinkItems(data.toolsSidebarRecommend)
    sidebarCategoryMenus.value = parseSidebarCategoryMenus(data.toolsSidebarCategoryMenus)
    sidebarBottomLinks.value = parseLinkItems(data.toolsSidebarBottomLinks)
    aiToolboxSidebarMenus.value = parseLinkItems(data.toolsAiToolboxSidebarMenus)
    sidebarMenuBlocksEditor.value = String(data.toolsSidebarMenuBlocks || '[]').trim() || '[]'
    updateBaselineSnapshot()
}

/**
 * 函数说明：读取后端配置并回填页面表单，保持本页独立编辑且不覆盖其它官网设置。
 */
const getData = async () => {
    const data = await getWebsite()
    applySidebarWebsiteData(data)
}

/**
 * 函数说明：核对保存接口回传的关键文案，避免接口被拦截或未落库时仍显示保存成功。
 */
const assertSidebarSaveReadback = (
    payload: Record<string, string>,
    savedData: WebsiteSettingPayload
) => {
    const verifyKeys = Object.keys(payload)
    const mismatchKey = verifyKeys.find(
        (key) => String(savedData[key] || '').trim() !== String(payload[key] || '').trim()
    )
    if (mismatchKey) {
        throw new Error('服务端未确认菜单配置已保存，请检查授权策略或数据库写入状态。')
    }
}

/**
 * 函数说明：手动从后台重新拉取菜单设置，便于执行脚本导入后立即回显最新结果。
 */
const reloadSidebarData = async () => {
    await getData()
    feedback.msgSuccess('已重新加载后台菜单配置')
}

/**
 * 函数说明：统一确认侧栏高风险改动，避免运营误删配置内容。
 */
const confirmSidebarDangerAction = async (message: string) => {
    try {
        await feedback.confirm(message)
        return true
    } catch {
        return false
    }
}

/**
 * 函数说明：新增推荐链接条目，便于运营快速补充推荐区入口。
 */
const addSidebarRecommendLink = () => {
    sidebarRecommendLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定推荐链接条目。
 */
const removeSidebarRecommendLink = async (index: number) => {
    const currentItem = sidebarRecommendLinks.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmSidebarDangerAction(`确定删除推荐链接「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    sidebarRecommendLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增侧栏分类菜单条目。
 */
const addSidebarCategoryMenu = () => {
    sidebarCategoryMenus.value.push({ key: '', title: '', icon: '', cateTitle: '', link: '' })
}

/**
 * 函数说明：删除指定侧栏分类菜单条目。
 */
const removeSidebarCategoryMenu = async (index: number) => {
    const currentItem = sidebarCategoryMenus.value[index]
    const itemName =
        String(currentItem?.title || currentItem?.key || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmSidebarDangerAction(`确定删除分类菜单「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    sidebarCategoryMenus.value.splice(index, 1)
}

/**
 * 函数说明：新增底部入口条目。
 */
const addSidebarBottomLink = () => {
    sidebarBottomLinks.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定底部入口条目。
 */
const removeSidebarBottomLink = async (index: number) => {
    const currentItem = sidebarBottomLinks.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmSidebarDangerAction(`确定删除底部入口「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    sidebarBottomLinks.value.splice(index, 1)
}

/**
 * 函数说明：新增 AI 工具箱独立左栏菜单条目。
 */
const addAiToolboxSidebarMenu = () => {
    aiToolboxSidebarMenus.value.push({ name: '', link: '' })
}

/**
 * 函数说明：删除指定 AI 工具箱独立左栏菜单条目。
 */
const removeAiToolboxSidebarMenu = async (index: number) => {
    const currentItem = aiToolboxSidebarMenus.value[index]
    const itemName = String(currentItem?.name || '').trim() || `第 ${index + 1} 项`
    const confirmed = await confirmSidebarDangerAction(`确定删除 AI 工具箱菜单「${itemName}」吗？`)
    if (!confirmed) {
        return
    }
    aiToolboxSidebarMenus.value.splice(index, 1)
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
 * 函数说明：格式化菜单样式模块 JSON，减少运营手工排版成本。
 */
const formatSidebarMenuBlocksEditor = () => {
    const parsed = parseSidebarMenuBlocks(sidebarMenuBlocksEditor.value)
    if (parsed.error) {
        feedback.msgError(parsed.error)
        return
    }
    sidebarMenuBlocksEditor.value = JSON.stringify(parsed.items, null, 2)
}

/**
 * 函数说明：将菜单样式模块重置为空数组，方便回退旧版菜单结构。
 */
const resetSidebarMenuBlocksEditor = async () => {
    const confirmed = await confirmSidebarDangerAction(
        '确定清空菜单样式模块 JSON 吗？此操作会把内容重置为 []。'
    )
    if (!confirmed) {
        return
    }
    sidebarMenuBlocksEditor.value = '[]'
}

/**
 * 函数说明：执行页面级体检，提前发现缺失字段和非法链接。
 */
const runSidebarHealthCheck = () => {
    if (!validateBeforeSubmit(false)) {
        return
    }
    feedback.msgSuccess('菜单设置体检通过，可以保存发布。')
}

/**
 * 函数说明：打开前端首页预览，便于运营保存后立即核对展示结果。
 */
const openToolsPreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：跳转图标库，便于补充前端一级菜单图标。
 */
const goIconLibrary = () => {
    router.push('/material/icons')
}

/**
 * 函数说明：统一校验侧栏页面保存前的必填项和链接格式。
 */
const validateBeforeSubmit = (showMessage = true): boolean => {
    formData.toolsSiteSlogan = formData.toolsSiteSlogan.trim()
    formData.toolsSidebarBrandLogo = formData.toolsSidebarBrandLogo.trim()
    formData.toolsSidebarBrandText = formData.toolsSidebarBrandText.trim()
    formData.toolsSidebarRecommendTitle = formData.toolsSidebarRecommendTitle.trim()

    if (!formData.toolsSidebarBrandText) {
        showMessage && feedback.msgError('品牌主文案不能为空')
        return false
    }
    if (!formData.toolsSidebarRecommendTitle) {
        showMessage && feedback.msgError('推荐分组标题不能为空')
        return false
    }
    if (!isValidSidebarBrandLogo(formData.toolsSidebarBrandLogo)) {
        showMessage && feedback.msgError('品牌 Logo 需为 /、http(s)、data:image 或内联 SVG')
        return false
    }
    const invalidRecommend = sidebarRecommendLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidRecommend) {
        showMessage && feedback.msgError('推荐链接需同时填写名称与合法链接')
        return false
    }
    const invalidCategory = sidebarCategoryMenus.value.find((item) => {
        if (
            !String(item.key || '').trim() ||
            !String(item.title || '').trim() ||
            !String(item.cateTitle || '').trim()
        ) {
            return true
        }
        return item.link ? !isValidLinkValue(item.link, false) : false
    })
    if (invalidCategory) {
        showMessage &&
            feedback.msgError('前端一级菜单需填写 key、标题、分类标题；直达链接需为 / 或 http(s)')
        return false
    }
    const invalidBottom = sidebarBottomLinks.value.find(
        (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
    )
    if (invalidBottom) {
        showMessage && feedback.msgError('底部入口需同时填写名称与合法链接')
        return false
    }
    if (!simpleMode.value) {
        if (sidebarMenuBlocksParseError.value) {
            showMessage && feedback.msgError(sidebarMenuBlocksParseError.value)
            return false
        }
        const invalidAiSidebar = aiToolboxSidebarMenus.value.find(
            (item) => !String(item.name || '').trim() || !isValidLinkValue(item.link)
        )
        if (invalidAiSidebar) {
            showMessage && feedback.msgError('AI工具箱左栏菜单需同时填写名称与合法链接')
            return false
        }
    }
    return true
}

/**
 * 函数说明：按当前运营模式组装侧栏保存载荷，简版不提交隐藏的高级菜单配置。
 */
const buildSidebarPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {
        toolsSiteSlogan: formData.toolsSiteSlogan,
        toolsSidebarBrandLogo: formData.toolsSidebarBrandLogo,
        toolsSidebarBrandText: formData.toolsSidebarBrandText,
        toolsSidebarRecommendTitle: formData.toolsSidebarRecommendTitle,
        toolsSidebarRecommend: JSON.stringify(sidebarRecommendLinks.value),
        toolsSidebarCategoryMenus: JSON.stringify(sidebarCategoryMenus.value),
        toolsSidebarBottomLinks: JSON.stringify(sidebarBottomLinks.value)
    }
    if (!simpleMode.value) {
        Object.assign(payload, {
            toolsSidebarMenuBlocks: JSON.stringify(sidebarMenuBlocksParseResult.value.items),
            toolsAiToolboxSidebarMenus: JSON.stringify(aiToolboxSidebarMenus.value)
        })
    }
    return payload
}

/**
 * 函数说明：提交菜单设置，仅保存本页负责的字段，避免覆盖其它官网配置。
 */
const handleSubmit = async () => {
    if (!validateBeforeSubmit(true)) {
        return
    }

    saveResultText.value = ''
    const payload = buildSidebarPayload()
    try {
        const success = await runSubmit(async () => {
            const savedData = await setWebsite(payload)
            assertSidebarSaveReadback(payload, savedData)
            applySidebarWebsiteData(savedData)
        })
        if (!success) {
            return
        }
        saveResultType.value = 'success'
        saveResultText.value = `菜单设置已保存并完成服务端回读确认（${lastSavedAt.value}）`
    } catch (error) {
        const message = String((error as Error)?.message || '').trim() || '菜单设置保存失败，请稍后重试。'
        saveResultType.value = 'error'
        saveResultText.value = message
        if ((error as { notified?: boolean })?.notified !== true) {
            feedback.msgError(message)
        }
        return
    }
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

.save-result-alert {
    margin-bottom: 16px;
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

.page-entry-card__desc {
    margin-top: 8px;
    line-height: 1.7;
    font-size: 13px;
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
    color: var(--color-text-2);
    line-height: 1.9;
}

.stat-card {
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

.stat-value.is-danger,
.catalog-error {
    color: rgb(var(--red-6));
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
    padding: 12px 14px;
    border: 1px solid var(--color-border-2);
    border-radius: 12px;
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: 14px;
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
    border-radius: 10px;
    border: 1px dashed var(--color-border-2, #e5e6eb);
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3);
}

.menu-icon-editor {
    display: flex;
    align-items: center;
    gap: 12px;
}

.link-row {
    display: grid;
    grid-template-columns: minmax(180px, 220px) minmax(320px, 1fr) auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.menu-row {
    display: grid;
    grid-template-columns:
        minmax(120px, 160px) minmax(160px, 220px) minmax(200px, 1fr) minmax(160px, 220px)
        minmax(220px, 1fr) auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.link-row:first-of-type,
.menu-row:first-of-type {
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

.section-alert {
    margin-bottom: 16px;
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

@media (max-width: 1280px) {
    .menu-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 920px) {
    .page-entry-grid,
    .stats-grid,
    .link-row,
    .menu-row,
    .ops-workspace,
    .ops-workspace__meta,
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
