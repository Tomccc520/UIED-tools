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
        <admin-page-header class="layout-page-header" title="前台菜单与品牌">
            <template #subtitle>
                维护前端品牌区、推荐入口、一级分类和底部菜单。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <a-button size="small" data-admin-smoke="sidebar-reload" :disabled="isSubmitting || isLoadingData" @click="reloadSidebarData">重新加载</a-button>
                    <a-button size="small" data-admin-smoke="sidebar-preview" @click="openToolsPreview">预览已保存内容</a-button>
                    <a-button size="small" data-admin-smoke="sidebar-health-check" @click="runSidebarHealthCheck">一键体检</a-button>
                    <a-button data-admin-smoke="sidebar-mode-switch" :aria-expanded="!simpleMode" @click="simpleMode = !simpleMode">{{ simpleMode ? '高级菜单维护' : '收起高级维护' }}</a-button>
                </div>
            </template>
        </admin-page-header>

        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadSidebarData">
        <a-alert v-if="!canEdit" class="section-alert" type="info" :closable="false">当前为只读权限，可以查看配置，不能修改或保存。</a-alert>
        <a-alert v-if="errorDefinitions.length || sidebarMenuBlocksParseError" class="section-alert" type="warning" :closable="false">
            部分菜单数据格式异常，原文已保留，其他配置仍可单独保存。
            <template #action><a-button @click="focusSidebarField(errorDefinitions[0]?.key || 'toolsSidebarMenuBlocks')">查看待修项</a-button></template>
        </a-alert>
        <a-card class="page-card pro-panel-card" :bordered="false">
            <a-radio-group v-model="activeSidebarSection" type="button" class="sidebar-section-tabs" aria-label="菜单配置分组">
                <a-radio value="brand">品牌文案</a-radio><a-radio value="recommend">推荐链接</a-radio><a-radio value="categories">一级菜单</a-radio><a-radio value="bottom">底部入口</a-radio>
            </a-radio-group>
            <template v-for="definition in errorDefinitions" :key="definition.key">
                <section v-if="definition.section !== 'advanced' && activeSidebarSection === definition.section" class="sidebar-repair">
                    <a-alert type="error" :closable="false">{{ fieldErrors[definition.key] }}</a-alert>
                    <a-textarea v-model="repairDrafts[definition.key]" :readonly="!canEdit" :textarea-attrs="{ 'aria-label': `${definition.label}原始 JSON` }" :auto-size="{ minRows: 5, maxRows: 12 }" />
                    <a-space wrap><a-button :disabled="!canEdit" @click="applySidebarFieldRepair(definition.key)">应用修复草稿</a-button><a-button :disabled="!canEdit" @click="restoreSidebarFieldRepair(definition.key)">还原原文</a-button></a-space>
                </section>
            </template>
            <div v-show="activeSidebarSection === 'brand'" class="layout-group mt-5">
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction" :inert="!canEdit || confirmingArrayAction ? '' : undefined">
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
                    <a-form-item label="品牌标识">
                        <div class="menu-icon-editor">
                            <material-picker
                                :model-value="sidebarBrandLogoMaterialValue"
                                :limit="1"
                                size="40px"
                                file-size="90px"
                                @update:model-value="handleSidebarBrandLogoMaterialChange"
                            />
                            <details class="brand-logo-source">
                                <summary>使用图片链接或 SVG 代码</summary>
                                <a-textarea
                                    v-model="formData.toolsSidebarBrandLogo"
                                    :auto-size="{ minRows: 3, maxRows: 6 }"
                                    aria-label="品牌标识链接或 SVG 代码"
                                    placeholder="支持 /uploads/*.svg、https:// 链接或 SVG 代码"
                                />
                            </details>
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
                </fieldset>
            </div>

            <div v-show="activeSidebarSection === 'recommend'" class="layout-group mt-5">
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarRecommend)" :inert="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarRecommend) ? '' : undefined">
                <div class="group-head">
                    <span>推荐链接</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSidebarRecommendLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">位于左栏“推荐工具”分组。支持站内路由、锚点和外链。</div>
                <div v-if="!fieldErrors.toolsSidebarRecommend && sidebarRecommendLinks.length === 0" class="form-tips">
                    暂无自定义推荐链接，当前沿用主站默认入口。
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
                            :disabled="index === 0" @click="moveLinkItem(sidebarRecommendLinks, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" :disabled="index === sidebarRecommendLinks.length - 1" @click="moveLinkItem(sidebarRecommendLinks, index, 1)"
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
                </fieldset>
            </div>

            <div v-show="activeSidebarSection === 'categories'" class="layout-group mt-5">
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarCategoryMenus)" :inert="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarCategoryMenus) ? '' : undefined">
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
                <div v-if="!fieldErrors.toolsSidebarCategoryMenus && sidebarCategoryMenus.length === 0" class="form-tips">
                    暂无自定义一级菜单，当前沿用主站默认分类。
                </div>
                <div
                    v-for="(item, index) in sidebarCategoryMenus"
                    :key="`sidebar-category-${index}`"
                    class="menu-row"
                >
                    <a-input v-model="item.key" :input-attrs="{ 'aria-label': `第${index + 1}个菜单的标识` }" placeholder="菜单标识，如：ai" />
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
                        <a-button type="text" :disabled="index === 0" @click="moveLinkItem(sidebarCategoryMenus, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" :disabled="index === sidebarCategoryMenus.length - 1" @click="moveLinkItem(sidebarCategoryMenus, index, 1)"
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
                </fieldset>
            </div>

            <div v-show="activeSidebarSection === 'bottom'" class="layout-group mt-5">
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarBottomLinks)" :inert="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsSidebarBottomLinks) ? '' : undefined">
                <div class="group-head">
                    <span>底部入口</span>
                    <div class="group-actions">
                        <a-button type="text" @click="addSidebarBottomLink">新增链接</a-button>
                    </div>
                </div>
                <div class="form-tips mb-2">
                    左栏底部固定入口，建议保留更新记录、意见反馈、关于我们等核心入口。
                </div>
                <div v-if="!fieldErrors.toolsSidebarBottomLinks && sidebarBottomLinks.length === 0" class="form-tips">
                    暂无自定义底部入口，当前沿用主站默认入口。
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
                        <a-button type="text" :disabled="index === 0" @click="moveLinkItem(sidebarBottomLinks, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" :disabled="index === sidebarBottomLinks.length - 1" @click="moveLinkItem(sidebarBottomLinks, index, 1)"
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
                </fieldset>
            </div>

        </a-card>
        <section v-if="!simpleMode" class="sidebar-advanced" aria-label="高级菜单维护"><h2>高级菜单维护</h2><p>特殊导航模块和 AI 工具箱菜单，检查后统一保存。</p>
            <div v-if="!simpleMode" class="layout-group mt-5">
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction" :inert="!canEdit || confirmingArrayAction ? '' : undefined">
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
                    :rows="12"
                    :textarea-attrs="{ 'aria-label': '菜单样式模块 JSON' }"
                    placeholder='请输入 JSON 数组，如：[{"key":"menu-dropdown","title":"下拉菜单","type":"dropdown","items":[{"name":"AI抠图","link":"/tools/photo/background"}]}]'
                />
                <div class="catalog-stat-row">
                    <a-tag color="arcoblue" bordered>模块 {{ sidebarMenuBlocksCount }}</a-tag>
                    <a-tag color="arcoblue" bordered>条目 {{ sidebarMenuBlockItemCount }}</a-tag>
                </div>
                <div v-if="sidebarMenuBlocksParseError" class="catalog-error">
                    {{ sidebarMenuBlocksParseError }}
                </div>
                </fieldset>
            </div>

            <div v-if="!simpleMode" class="layout-group mt-5">
                <section v-if="fieldErrors.toolsAiToolboxSidebarMenus" class="sidebar-repair">
                    <a-alert type="error" :closable="false">{{ fieldErrors.toolsAiToolboxSidebarMenus }}</a-alert>
                    <a-textarea v-model="repairDrafts.toolsAiToolboxSidebarMenus" :readonly="!canEdit" :textarea-attrs="{ 'aria-label': 'AI 工具箱独立左栏原始 JSON' }" :auto-size="{ minRows: 5, maxRows: 12 }" />
                    <a-space wrap><a-button :disabled="!canEdit" @click="applySidebarFieldRepair('toolsAiToolboxSidebarMenus')">应用修复草稿</a-button><a-button :disabled="!canEdit" @click="restoreSidebarFieldRepair('toolsAiToolboxSidebarMenus')">还原原文</a-button></a-space>
                </section>
                <fieldset class="sidebar-editable" :disabled="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsAiToolboxSidebarMenus)" :inert="!canEdit || confirmingArrayAction || Boolean(fieldErrors.toolsAiToolboxSidebarMenus) ? '' : undefined">
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
                <div v-if="!fieldErrors.toolsAiToolboxSidebarMenus && aiToolboxSidebarMenus.length === 0" class="form-tips">
                    暂无自定义 AI 工具箱菜单，当前沿用主站默认入口。
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
                            :disabled="index === 0" @click="moveLinkItem(aiToolboxSidebarMenus, index, -1)"
                            >上移</a-button
                        >
                        <a-button type="text" :disabled="index === aiToolboxSidebarMenus.length - 1" @click="moveLinkItem(aiToolboxSidebarMenus, index, 1)"
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
                </fieldset>
            </div>
        </section>

            <template #actions>
                <a-button v-perms="['setting:website:sidebar:save']" data-admin-smoke="sidebar-save-top" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges || confirmingArrayAction" @click="handleSubmit">保存前台菜单</a-button>
            </template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="websiteSidebarSettings">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useConfigEditor } from '@/composables/use-config-editor'
import { getWebsite, setWebsite, type WebsiteSettingPayload } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import { readConfigObjectArray, readConfigLinks, buildConfigFieldPatch } from './composables/config-links'

interface ToolsLinkItem extends Record<string, unknown> { name: string; link: string; desc?: string }
interface ToolsSidebarCategoryMenuItem extends Record<string, unknown> { key: string; title: string; icon: string; cateTitle: string; link: string }
interface ToolsSidebarMenuBlockEditor extends Record<string, unknown> { key?: string; title?: string; type?: string; items?: Record<string, unknown>[] }
type SidebarArrayKey = 'toolsSidebarRecommend' | 'toolsSidebarCategoryMenus' | 'toolsSidebarBottomLinks' | 'toolsAiToolboxSidebarMenus'
type SidebarSection = 'brand' | 'recommend' | 'categories' | 'bottom'
const arrayDefinitions: { key: SidebarArrayKey; label: string; section: SidebarSection | 'advanced' }[] = [
    { key: 'toolsSidebarRecommend', label: '推荐链接', section: 'recommend' },
    { key: 'toolsSidebarCategoryMenus', label: '一级菜单', section: 'categories' },
    { key: 'toolsSidebarBottomLinks', label: '底部入口', section: 'bottom' },
    { key: 'toolsAiToolboxSidebarMenus', label: 'AI 工具箱独立左栏', section: 'advanced' }
]
const appStore = useAppStore()
const userStore = useUserStore()
const router = useRouter()
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:website:sidebar:save'))
const simpleMode = ref(true)
const activeSidebarSection = ref<SidebarSection>('brand')
const confirmingArrayAction = ref(false)
const baselinePayload = ref<Record<string, string>>({})
/** 创建本页展示默认值，未修改的缺省字段不会顺带提交。 */
const createSidebarDefaults = (): Record<string, string> => ({ toolsSiteSlogan: '免费在线工具集', toolsSidebarBrandLogo: '', toolsSidebarBrandText: 'UIED-Tools', toolsSidebarRecommendTitle: '推荐工具' })
const formData = reactive(createSidebarDefaults())
const sidebarRecommendLinks = ref<ToolsLinkItem[]>([])
const sidebarCategoryMenus = ref<ToolsSidebarCategoryMenuItem[]>([])
const sidebarBottomLinks = ref<ToolsLinkItem[]>([])
const aiToolboxSidebarMenus = ref<ToolsLinkItem[]>([])
const sidebarMenuBlocksEditor = ref('[]')
const rawArrayFields = reactive<Record<string, string>>({})
const repairDrafts = reactive<Record<string, string>>({})
const fieldErrors = reactive<Record<string, string>>({})
const collectionModels = { toolsSidebarRecommend: sidebarRecommendLinks, toolsSidebarCategoryMenus: sidebarCategoryMenus, toolsSidebarBottomLinks: sidebarBottomLinks, toolsAiToolboxSidebarMenus: aiToolboxSidebarMenus }
/** 获取当前字段的中文名称，用于错误与修复反馈。 */
const collectionLabel = (key: SidebarArrayKey) => arrayDefinitions.find(item => item.key === key)!.label
/** 保留可视化菜单的未知字段，只为可编辑文字字段补齐合法草稿形态。 */
const parseSidebarCategoryMenus = (value: unknown): ToolsSidebarCategoryMenuItem[] => readConfigObjectArray(value, '一级菜单').map((item, index) => {
    for (const key of ['key', 'title', 'icon', 'cateTitle', 'link']) if (item[key] !== undefined && typeof item[key] !== 'string') throw new Error(`一级菜单第 ${index + 1} 项的${key}应为文字，原文已保留。`)
    return { ...item, key: item.key ?? '', title: item.title ?? '', icon: item.icon ?? '', cateTitle: item.cateTitle ?? '', link: item.link ?? '' } as ToolsSidebarCategoryMenuItem
})
/** 严格读取链接，解析错误交由字段错误反馈处理，不能默默转换为空列表。 */
const parseLinkItems = (value: unknown, label = '链接列表'): ToolsLinkItem[] => readConfigLinks(value, label) as ToolsLinkItem[]
/** 根据所属字段读取真实数据，未知扩展字段继续保留。 */
const readSidebarCollection = (key: SidebarArrayKey, value: unknown) => key === 'toolsSidebarCategoryMenus' ? parseSidebarCategoryMenus(value) : parseLinkItems(value, collectionLabel(key))
/** 原始配置按字符串保留，显式 null 和非数组数据由修复入口说明错误。 */
const rawConfigText = (value: unknown): string => typeof value === 'string' ? value : value === undefined ? '[]' : JSON.stringify(value)
/** 读取原始模块数组用于校验和格式化，不剥离模块或条目的未知字段。 */
const parseSidebarMenuBlocks = (value: string): { items: ToolsSidebarMenuBlockEditor[]; error: string } => {
    try {
        const items = readConfigObjectArray(value, '菜单样式模块')
        items.forEach((item, index) => { if (item.items !== undefined) readConfigObjectArray(item.items, `第 ${index + 1} 个模块条目`) })
        return { items: items as ToolsSidebarMenuBlockEditor[], error: '' }
    } catch (error) { return { items: [], error: error instanceof Error ? error.message : '菜单样式模块格式错误，原文已保留。' } }
}
const sidebarMenuBlocksParseResult = computed(() => parseSidebarMenuBlocks(sidebarMenuBlocksEditor.value))
const sidebarMenuBlocksParseError = computed(() => sidebarMenuBlocksParseResult.value.error)
const sidebarMenuBlocksCount = computed(() => sidebarMenuBlocksParseResult.value.items.length)
const sidebarMenuBlockItemCount = computed(() => sidebarMenuBlocksParseResult.value.items.reduce((count, item) => count + (Array.isArray(item.items) ? item.items.length : 0), 0))
const errorDefinitions = computed(() => arrayDefinitions.filter(item => Boolean(fieldErrors[item.key])))
/** 组装本页完整语义状态，损坏字段保留原始文本，不能由展示空数组代替。 */
const buildSidebarPayload = (): Record<string, string> => {
    const result: Record<string, string> = { ...formData }
    for (const item of arrayDefinitions) result[item.key] = fieldErrors[item.key] ? repairDrafts[item.key] : JSON.stringify(collectionModels[item.key].value)
    const blocks = sidebarMenuBlocksParseResult.value
    result.toolsSidebarMenuBlocks = blocks.error ? sidebarMenuBlocksEditor.value : JSON.stringify(blocks.items)
    return result
}
/** 使用完整语义状态保护草稿，原文修复尚未应用时也属于未保存输入。 */
const buildSidebarSnapshot = () => JSON.stringify(buildSidebarPayload())
const { isLoadingData, hasLoadedData, loadErrorMessage, isSubmitting, lastSavedAt, submitError, hasUnsavedChanges, canOperate, loadConfiguration, reloadConfiguration, submitConfiguration } = useConfigEditor({ canEdit, snapshot: buildSidebarSnapshot, successText: '前台菜单已保存' })
/** 保留可加载的图片地址，内联 SVG 不作为 URL 交给素材选择器。 */
const sidebarBrandLogoMaterialValue = computed(() => /<(?:svg|g)\b[\s\S]*<\/(?:svg|g)>/i.test(formData.toolsSidebarBrandLogo) ? '' : formData.toolsSidebarBrandLogo)
/** 仅接受活动且可编辑页面的素材选择事件，迟到回调不能修改只读草稿。 */
const handleSidebarBrandLogoMaterialChange = (value: string | string[]) => { if (canOperate()) formData.toolsSidebarBrandLogo = Array.isArray(value) ? String(value[0] || '') : String(value || '') }
/** 将错误切到对应分组，高级错误同时展开维护区。 */
const focusSidebarField = (key: string) => {
    const definition = arrayDefinitions.find(item => item.key === key)
    if (key === 'toolsSidebarMenuBlocks' || definition?.section === 'advanced') simpleMode.value = false
    else activeSidebarSection.value = definition?.section as SidebarSection || 'brand'
}
/** 应用经过严格校验的修复草稿；失败保留原文及用户输入供继续修正。 */
const applySidebarFieldRepair = (key: SidebarArrayKey): boolean => {
    if (!canOperate() || confirmingArrayAction.value) return false
    try {
        const next = readSidebarCollection(key, repairDrafts[key])
        ;(collectionModels[key].value as Record<string, unknown>[]) = next
        delete fieldErrors[key]
        return true
    } catch (error) { fieldErrors[key] = error instanceof Error ? error.message : `${collectionLabel(key)}格式错误，原文已保留。`; focusSidebarField(key); return false }
}
/** 放弃尚未应用的修复文本，不改变服务端原始配置。 */
const restoreSidebarFieldRepair = (key: SidebarArrayKey) => { if (canOperate()) repairDrafts[key] = rawArrayFields[key] }
/** 只在响应结构可用时整体回填，字段解析异常单独留原文，其他配置仍可编辑。 */
const applySidebarWebsiteData = (data: WebsiteSettingPayload) => {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('前台菜单配置响应无效')
    const nextForm = createSidebarDefaults()
    for (const key of Object.keys(nextForm)) if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key]
        if (typeof value !== 'string') throw new Error('前台菜单文字配置响应无效')
        nextForm[key] = value
    }
    const nextCollections: Record<string, { raw: string; items: Record<string, unknown>[]; error: string }> = {}
    for (const item of arrayDefinitions) {
        const raw = rawConfigText(data[item.key])
        try { nextCollections[item.key] = { raw, items: readSidebarCollection(item.key, raw), error: '' } }
        catch (error) { nextCollections[item.key] = { raw, items: [], error: error instanceof Error ? error.message : `${item.label}格式错误，原文已保留。` } }
    }
    Object.assign(formData, nextForm)
    for (const item of arrayDefinitions) {
        const next = nextCollections[item.key]
        rawArrayFields[item.key] = next.raw
        repairDrafts[item.key] = next.raw
        if (next.error) fieldErrors[item.key] = next.error
        else delete fieldErrors[item.key]
        ;(collectionModels[item.key].value as Record<string, unknown>[]) = next.items
    }
    sidebarMenuBlocksEditor.value = rawConfigText(data.toolsSidebarMenuBlocks)
    baselinePayload.value = buildSidebarPayload()
}
/** 读取当前页配置，失败保留已存在的草稿；公共编辑器管理读写互斥与基线。 */
const getData = () => loadConfiguration(async () => { applySidebarWebsiteData(await getWebsite()) })
/** 明确确认后重载；取消不覆盖草稿，提交时不允许重读。 */
const reloadSidebarData = () => reloadConfiguration(getData)
/** 判断用户是否可以编辑指定列表，损坏列表先修复原始数据。 */
const canEditCollection = (key: SidebarArrayKey) => canOperate() && !confirmingArrayAction.value && !fieldErrors[key]
/** 创建推荐链接草稿，不立即写入服务端。 */
const addSidebarRecommendLink = () => { if (canEditCollection('toolsSidebarRecommend')) sidebarRecommendLinks.value.push({ name: '', link: '' }) }
/** 创建分类菜单草稿，不修改其他菜单或扩展字段。 */
const addSidebarCategoryMenu = () => { if (canEditCollection('toolsSidebarCategoryMenus')) sidebarCategoryMenus.value.push({ key: '', title: '', icon: '', cateTitle: '', link: '' }) }
/** 创建底部入口草稿。 */
const addSidebarBottomLink = () => { if (canEditCollection('toolsSidebarBottomLinks')) sidebarBottomLinks.value.push({ name: '', link: '' }) }
/** 创建 AI 工具箱独立左栏草稿。 */
const addAiToolboxSidebarMenu = () => { if (canEditCollection('toolsAiToolboxSidebarMenus')) aiToolboxSidebarMenus.value.push({ name: '', link: '' }) }
/** 确认后删除同一条草稿；确认期间重读或条目更换时不删除其他数据。 */
const removeCollectionItem = async (key: SidebarArrayKey, index: number) => {
    if (!canEditCollection(key)) return
    const list = collectionModels[key].value
    const item = list[index]
    if (!item) return
    confirmingArrayAction.value = true
    try {
        await feedback.confirm(`确定删除${collectionLabel(key)}「${String(item.name || item.title || `第 ${index + 1} 项`)}」吗？保存配置后才生效。`)
        if (!canOperate() || collectionModels[key].value !== list) return
        const currentIndex = list.indexOf(item as never)
        if (currentIndex >= 0) list.splice(currentIndex, 1)
    } catch { /* 取消确认保留原草稿。 */ }
    finally { confirmingArrayAction.value = false }
}
/** 删除推荐链接的本地草稿。 */
const removeSidebarRecommendLink = (index: number) => removeCollectionItem('toolsSidebarRecommend', index)
/** 删除一级菜单的本地草稿。 */
const removeSidebarCategoryMenu = (index: number) => removeCollectionItem('toolsSidebarCategoryMenus', index)
/** 删除底部链接的本地草稿。 */
const removeSidebarBottomLink = (index: number) => removeCollectionItem('toolsSidebarBottomLinks', index)
/** 删除 AI 左栏入口的本地草稿。 */
const removeAiToolboxSidebarMenu = (index: number) => removeCollectionItem('toolsAiToolboxSidebarMenus', index)
/** 调整本地数组顺序；只读、非活动页与越界操作不更改数据。 */
function moveLinkItem<T>(list: T[], index: number, step: -1 | 1) {
    if (!canOperate() || confirmingArrayAction.value || !Number.isInteger(index)) return
    const targetIndex = index + step
    if (index < 0 || index >= list.length || targetIndex < 0 || targetIndex >= list.length) return
    ;[list[index], list[targetIndex]] = [list[targetIndex], list[index]]
}
/** 只格式化合法原始模块，不清洗未知字段，也不把异常输入替换成默认数据。 */
const formatSidebarMenuBlocksEditor = () => {
    if (!canOperate()) return
    const parsed = parseSidebarMenuBlocks(sidebarMenuBlocksEditor.value)
    if (parsed.error) { feedback.msgError(parsed.error); return }
    sidebarMenuBlocksEditor.value = JSON.stringify(parsed.items, null, 2)
}
/** 显式确认后清空模块草稿，允许恢复分类菜单渲染。 */
const resetSidebarMenuBlocksEditor = async () => {
    if (!canOperate() || confirmingArrayAction.value) return
    confirmingArrayAction.value = true
    try { await feedback.confirm('确定清空菜单样式模块吗？统一保存后生效。'); if (canOperate()) sidebarMenuBlocksEditor.value = '[]' }
    catch { /* 取消时保留原始配置。 */ }
    finally { confirmingArrayAction.value = false }
}
/** 允许站内路径、锚点和 HTTP(S) 链接，校验不改写原始输入。 */
const isValidLinkValue = (link: string, allowHash = true): boolean => { const value = String(link || '').trim(); return Boolean(value && (value.startsWith('/') || (allowHash && value.startsWith('#')) || /^https?:\/\//i.test(value))) }
/** 保持已有品牌标识格式契约，允许图片地址和内联 SVG。 */
const isValidSidebarBrandLogo = (value: string): boolean => !value.trim() || /^(?:\/|https?:\/\/|data:image\/|\s*<(?:svg|g)\b)/i.test(value) || /<(?:svg|g)\b[\s\S]*<\/(?:svg|g)>/i.test(value)
/** 校验本次实际变化字段；历史坏配置不会阻断其他分组的正常保存。 */
const validateBeforeSubmit = (showMessage = true, patch: Record<string, string> = buildSidebarPayload()): boolean => {
    /** 定位相关分组并反馈错误，错误不会留在不可见标签或高级区。 */
    const reject = (key: string, message: string) => { focusSidebarField(key); if (showMessage) feedback.msgError(message); return false }
    if ('toolsSidebarBrandText' in patch && !formData.toolsSidebarBrandText.trim()) return reject('brand', '品牌主文案不能为空')
    if ('toolsSidebarRecommendTitle' in patch && !formData.toolsSidebarRecommendTitle.trim()) return reject('brand', '推荐分组标题不能为空')
    if ('toolsSidebarBrandLogo' in patch && !isValidSidebarBrandLogo(formData.toolsSidebarBrandLogo)) return reject('brand', '品牌标识需为图片地址或内联 SVG')
    for (const item of arrayDefinitions) {
        if (!(item.key in patch)) continue
        if (fieldErrors[item.key]) return reject(item.key, `${item.label}原文尚未修复，请先应用修复草稿或还原原文。`)
        const list = collectionModels[item.key].value
        if (item.key === 'toolsSidebarCategoryMenus') {
            if ((list as ToolsSidebarCategoryMenuItem[]).some(entry => !entry.key.trim() || !entry.title.trim() || !entry.cateTitle.trim() || (entry.link && !isValidLinkValue(entry.link, false)))) return reject(item.key, '一级菜单需填写标识、菜单标题和分类标题；直达链接需为站内或 HTTP(S) 地址。')
        } else if ((list as ToolsLinkItem[]).some(entry => !entry.name.trim() || !isValidLinkValue(entry.link))) return reject(item.key, `${item.label}需同时填写名称和有效地址。`)
    }
    if ('toolsSidebarMenuBlocks' in patch && sidebarMenuBlocksParseError.value) return reject('toolsSidebarMenuBlocks', sidebarMenuBlocksParseError.value)
    return true
}
/** 显式运行完整检查，不修改数据；读取未完成时不对展示默认值作成功结论。 */
const runSidebarHealthCheck = () => { if (!hasLoadedData.value || isLoadingData.value || loadErrorMessage.value) return; if (validateBeforeSubmit(true)) feedback.msgSuccess('前台菜单检查通过') }
/** 预览已保存的主站内容，不把本地草稿误表示为线上效果。 */
const openToolsPreview = () => { window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer') }
/** 跳转已有图标库，仍遵守当前账号授权菜单与路由守卫。 */
const goIconLibrary = () => { void router.push('/material/icons') }
/** 仅提交本次字段差异；成功只记录已提交快照，不回填整包覆盖保存期间的新草稿。 */
const handleSubmit = async (): Promise<boolean> => {
    if (!canOperate() || confirmingArrayAction.value || !hasUnsavedChanges.value) return false
    const payload = buildSidebarPayload()
    const patch = buildConfigFieldPatch(payload, baselinePayload.value) as Record<string, string>
    if (!Object.keys(patch).length || !validateBeforeSubmit(true, patch)) return false
    const snapshot = JSON.stringify(payload)
    return submitConfiguration(async () => { await setWebsite(patch); baselinePayload.value = payload }, snapshot)
}
/** 挂载只读取当前页，公共控制器处理缓存激活、离开与刷新保护。 */
onMounted(() => { void getData() })
</script>

<style lang="scss" scoped>
.sidebar-editable { min-width: 0; border: 0; margin: 0; padding: 0; }
.sidebar-repair { display: grid; gap: 12px; margin-top: 16px; }
.sidebar-advanced { margin-top: 24px; }
.sidebar-advanced > h2 { margin: 0; font-size: 16px; line-height: 1.5; }
.sidebar-advanced > p { margin: 6px 0 16px; color: var(--color-text-3); font-size: 13px; line-height: 1.7; }

.sidebar-section-tabs { margin-top: 0; display: flex; flex-wrap: wrap; }
.sidebar-section-tabs :deep(.arco-radio-button-content) { white-space: nowrap; }
.pro-page-shell {
    padding-bottom: 24px;
}

.layout-page-header {
    margin-bottom: 16px;
    padding: 0 4px;
}

.layout-page-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.layout-page-actions {
    justify-content: flex-end;
    gap: 10px;
}

.page-card {
    border-radius: var(--uied-admin-radius);
}

.layout-group {
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    padding: 16px;
    background: var(--color-bg-2);
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

.brand-logo-source {
    width: 100%;
    summary { padding: 8px 0; color: var(--color-text-3); cursor: pointer; font-size: 12px; }
    summary:focus-visible { outline: 2px solid var(--uied-admin-accent); outline-offset: 2px; }
}

.menu-icon-editor {
    display: flex;
    align-items: center;
    gap: 12px;
}

.link-row {
    display: grid;
    grid-template-columns: minmax(0, 220px) minmax(0, 1fr) auto;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.menu-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    align-items: flex-start;
    padding: 12px 0;
    border-top: 1px solid var(--color-border-2);
}

.menu-row > .menu-icon-editor,
.menu-row > .row-actions { grid-column: 1 / -1; }
.menu-row > * { min-width: 0; }

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
    color: rgb(var(--red-6));
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.7;
}

@media (max-width: 920px) {
    .link-row,
    .menu-row {
        grid-template-columns: 1fr;
    }

    .menu-icon-editor {
        flex-direction: column;
        align-items: stretch;
    }

}
@media (max-width: 600px) {
    .website-sidebar-settings :deep(button), .sidebar-section-tabs :deep(.arco-radio-button) { min-height: 44px; }
}
</style>
