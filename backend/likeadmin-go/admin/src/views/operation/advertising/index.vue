<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-25
 */
-->
<template>
    <div class="advertising-page pro-page-shell">
        <admin-page-header title="广告与推荐">
            <template #subtitle>维护顶部广告和首页热门工具，保存后在前台预览效果。</template>
            <template #extra>
                <div class="header-actions">
                    <a-button data-admin-smoke="advertising-reload" :loading="isLoading" :disabled="isSubmitting" @click="retryLoadAdvertising">重新加载</a-button>
                    <a-button :disabled="isLoading || isSubmitting || !hasLoadedData || Boolean(loadError)" @click="restoreActiveDefaults">恢复当前默认</a-button>
                    <a-button data-admin-smoke="advertising-preview" @click="openFrontendPreview">前端预览</a-button>
                    <a-button data-admin-smoke="advertising-health-check" :disabled="isLoading || isSubmitting || !hasLoadedData || Boolean(loadError)" @click="runHealthCheck">一键体检</a-button>
                </div>
            </template>
        </admin-page-header>

        <a-alert v-if="previewRefreshWarning" class="advertising-refresh-warning" type="warning" :closable="false" show-icon>
            {{ previewRefreshWarning }}
            <template #action><a-button size="small" :loading="isRefreshingPreview" :disabled="isSubmitting" @click="refreshSavedPreview">重试刷新</a-button></template>
        </a-alert>
        <config-edit-frame
            :loading="isLoading"
            :ready="hasLoadedData"
            :error="loadError"
            :save-error="submitError"
            :dirty="hasUnsavedChanges"
            :saving="isSubmitting"
            :saved-at="lastSavedAt"
            @retry="retryLoadAdvertising"
        >
            <template v-if="hasLoadedData">
            <div class="placement-switch mt-4" role="tablist" aria-label="广告位类型">
                <button
                    type="button"
                    role="tab"
                    :aria-selected="activePlacement === 'top-banner'"
                    :class="{ 'is-active': activePlacement === 'top-banner' }"
                    @click="activePlacement = 'top-banner'"
                >
                    <span>顶部广告</span>
                    <small>图片 / HTML · {{ advertisingItems.length }} 条</small>
                </button>
                <button
                    type="button"
                    role="tab"
                    :aria-selected="activePlacement === 'hot-tools'"
                    :class="{ 'is-active': activePlacement === 'hot-tools' }"
                    @click="activePlacement = 'hot-tools'"
                >
                    <span>热门工具原生广告</span>
                    <small>融合工具卡片 · {{ hotTools.length }} 条</small>
                </button>
            </div>

            <a-card v-if="activePlacement === 'top-banner'" class="preview-card mt-4" :bordered="false">
                <template #title>当前首屏预览</template>
                <div v-if="previewItem" class="banner-preview" :style="getBannerStyle(previewItem)">
                    <img
                        v-if="previewItem.renderMode === 'image' && previewItem.image"
                        :src="previewItem.image"
                        :alt="previewItem.text || '广告图'"
                    />
                    <div
                        v-else-if="previewItem.renderMode === 'html' && previewItem.htmlCode"
                        class="html-ad-preview"
                        v-html="sanitizeAdvertisingHtml(previewItem.htmlCode)"
                    />
                    <span v-else>{{ previewItem.renderMode === 'image' ? '请选择图片素材' : '请填写 HTML 代码' }}</span>
                </div>
                <div v-else class="empty-preview">暂无广告内容</div>
                <div v-if="advertisingItems.length > 1" class="preview-dots">
                    <button
                        v-for="(_, index) in advertisingItems"
                        :key="`preview-dot-${index}`"
                        type="button"
                        :class="{ 'is-active': previewIndex === index }"
                        :aria-label="`预览第 ${index + 1} 条广告`"
                        @click="previewIndex = index"
                    />
                </div>
            </a-card>

            <a-card v-if="activePlacement === 'top-banner'" class="editor-card mt-4" :bordered="false">
                <template #title>
                    <div class="editor-title">
                        <div>
                            <strong>广告内容</strong>
                            <span>图片广告支持素材库和跳转链接，HTML 广告支持安全代码片段</span>
                        </div>
                        <a-button data-admin-smoke="advertising-banner-add" type="primary" size="small" @click="addAdvertisingItem">新增广告</a-button>
                    </div>
                </template>

                <a-alert v-if="bannerValidationTips.length" class="mb-4" type="warning" :closable="false" show-icon>
                    {{ bannerValidationTips[0] }}
                </a-alert>

                <div v-if="advertisingItems.length === 0" class="empty-editor">
                    <span>广告列表为空</span>
                    <p>新增至少一条首页广告后才能保存发布。</p>
                    <a-button type="primary" @click="addAdvertisingItem">新增第一条广告</a-button>
                </div>

                <a-collapse v-else v-model:active-key="expandedKeys" :bordered="false" class="advertising-collapse">
                    <a-collapse-item
                        v-for="(item, index) in advertisingItems"
                        :key="String(index)"
                        :name="String(index)"
                    >
                        <template #header>
                            <div class="advertising-summary">
                                <span class="advertising-summary__order">{{ String(index + 1).padStart(2, '0') }}</span>
                                <a-tag :color="item.renderMode === 'html' ? 'purple' : 'arcoblue'" bordered>
                                    {{ item.renderMode === 'html' ? 'HTML 广告' : '图片广告' }}
                                </a-tag>
                                <strong>{{ item.text || '未填写广告名称' }}</strong>
                                <span class="advertising-summary__link">{{ getAdvertisingSourceSummary(item) }}</span>
                            </div>
                        </template>

                        <div class="advertising-editor-grid">
                            <div class="field-block field-block--wide">
                                <label>广告类型</label>
                                <a-radio-group v-model="item.renderMode" type="button">
                                    <a-radio value="image">图片广告</a-radio>
                                    <a-radio value="html">HTML 广告</a-radio>
                                </a-radio-group>
                            </div>
                            <div class="field-block field-block--wide">
                                <label>广告名称</label>
                                <a-input v-model="item.text" maxlength="120" show-word-limit placeholder="用于后台识别和图片 Alt 文本" />
                            </div>
                            <div class="field-block">
                                <label>广告高度（px）</label>
                                <a-input-number v-model="item.height" :min="32" :max="600" :step="1" mode="button" />
                            </div>
                            <template v-if="item.renderMode === 'image'">
                                <div class="field-block field-block--wide">
                                    <label>广告图片</label>
                                    <material-picker v-model="item.image" :limit="1" />
                                    <a-input v-model="item.image" placeholder="也可直接填写 /uploads/... 或 https://..." />
                                </div>
                                <div class="field-block field-block--wide">
                                    <label>跳转链接（可选）</label>
                                    <a-input v-model="item.link" placeholder="支持 /、# 或 http(s) 链接" />
                                </div>
                                <div class="field-block">
                                    <label>打开方式</label>
                                    <a-select v-model="item.target">
                                        <a-option value="_blank">新窗口</a-option>
                                        <a-option value="_self">当前窗口</a-option>
                                    </a-select>
                                </div>
                            </template>
                            <div v-else class="field-block field-block--full">
                                <label>HTML 广告代码</label>
                                <a-textarea
                                    v-model="item.htmlCode"
                                    :max-length="50000"
                                    :auto-size="{ minRows: 7, maxRows: 18 }"
                                    placeholder="支持 div、a、img、iframe 等 HTML 片段；请在代码内设置样式和链接"
                                />
                                <small>为保证安全，脚本、事件属性、srcdoc 和危险协议会被拦截。</small>
                            </div>
                            <div class="item-preview" :style="getBannerStyle(item)">
                                <img
                                    v-if="item.renderMode === 'image' && item.image"
                                    :src="item.image"
                                    :alt="item.text || '广告图'"
                                />
                                <div
                                    v-else-if="item.renderMode === 'html' && item.htmlCode"
                                    class="html-ad-preview"
                                    v-html="sanitizeAdvertisingHtml(item.htmlCode)"
                                />
                                <span v-else>{{ item.renderMode === 'image' ? '图片广告预览' : 'HTML 广告预览' }}</span>
                            </div>
                            <div class="row-actions">
                                <a-button type="text" :disabled="index === 0" @click="moveAdvertisingItem(index, -1)">上移</a-button>
                                <a-button
                                    type="text"
                                    :disabled="index === advertisingItems.length - 1"
                                    @click="moveAdvertisingItem(index, 1)"
                                    >下移</a-button
                                >
                                <a-button type="text" @click="previewIndex = index">设为预览</a-button>
                                <a-button type="text" status="danger" @click="removeAdvertisingItem(index)">删除</a-button>
                            </div>
                        </div>
                    </a-collapse-item>
                </a-collapse>
            </a-card>

            <a-card v-if="activePlacement === 'hot-tools'" class="preview-card mt-4" :bordered="false">
                <template #title>首页融合效果预览</template>
                <div v-if="hotTools.length" class="native-preview-grid">
                    <a
                        v-for="(item, index) in hotTools.slice(0, 8)"
                        :key="`hot-preview-${index}`"
                        class="native-preview-card"
                        :href="item.link || undefined"
                        @click.prevent
                    >
                        <span class="native-preview-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
                        <strong>{{ item.title || '待填写标题' }}</strong>
                        <small>{{ item.desc || '待填写简介' }}</small>
                    </a>
                </div>
                <div v-else class="empty-preview">暂无热门工具原生广告</div>
            </a-card>

            <a-card v-if="activePlacement === 'hot-tools'" class="editor-card mt-4" :bordered="false">
                <template #title>
                    <div class="editor-title">
                        <div>
                            <strong>热门工具原生广告</strong>
                            <span>按列表顺序展示在首页热门工具区，建议控制在 8 条以内</span>
                        </div>
                        <a-button type="primary" size="small" @click="addHotTool">新增原生广告</a-button>
                    </div>
                </template>

                <a-alert v-if="hotToolValidationTips.length" class="mb-4" type="warning" :closable="false" show-icon>
                    {{ hotToolValidationTips[0] }}
                </a-alert>

                <div v-if="hotTools.length === 0" class="empty-editor">
                    <span>热门工具原生广告为空</span>
                    <p>新增至少一条内容后才能保存发布。</p>
                    <a-button type="primary" @click="addHotTool">新增第一条原生广告</a-button>
                </div>

                <div v-else class="hot-tool-editor-list">
                    <article v-for="(item, index) in hotTools" :key="`hot-tool-${index}`" class="hot-tool-editor-row">
                        <span class="hot-tool-editor-row__order">{{ String(index + 1).padStart(2, '0') }}</span>
                        <div class="field-block">
                            <label>展示标题</label>
                            <a-input v-model="item.title" :max-length="120" show-word-limit placeholder="例如：免费 AI 生成 PPT" />
                        </div>
                        <div class="field-block">
                            <label>简短简介</label>
                            <a-input v-model="item.desc" :max-length="240" show-word-limit placeholder="说明工具卖点或活动内容" />
                        </div>
                        <div class="field-block hot-tool-editor-row__link">
                            <label>落地链接</label>
                            <a-input v-model="item.link" :max-length="500" placeholder="支持 /、# 或 http(s) 链接" />
                        </div>
                        <div class="row-actions hot-tool-editor-row__actions">
                            <a-button type="text" :disabled="index === 0" @click="moveHotTool(index, -1)">上移</a-button>
                            <a-button type="text" :disabled="index === hotTools.length - 1" @click="moveHotTool(index, 1)">下移</a-button>
                            <a-button type="text" status="danger" @click="removeHotTool(index)">删除</a-button>
                        </div>
                    </article>
                </div>
            </a-card>
            </template>

            <template #actions>
                <a-button
                    v-perms="['operation:advertising:save']"
                    data-admin-smoke="advertising-save"
                    type="primary"
                    :loading="isSubmitting"
                    :disabled="isLoading || isRefreshingPreview || !hasLoadedData || Boolean(loadError)"
                    @click="handleSubmit"
                    >保存并发布</a-button
                >
            </template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="operationAdvertising">
import {
    getAdvertisingDetail,
    saveAdvertising,
    type AdvertisingHotToolItem,
    type AdvertisingItem
} from '@/api/operation/advertising'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { resolveToolsPreviewUrl } from '../../setting/website/composables/use-preview-url'

const siteConfigRefreshStorageKey = 'uied_site_config_updated_at'

const defaultAdvertisingItems: AdvertisingItem[] = [
    {
        renderMode: 'html',
        text: '一人企业 Vibe Coding 社区！',
        image: '',
        htmlCode:
            '<a href="https://fsuied.com" target="_blank" rel="noopener noreferrer" style="display:flex;height:100%;align-items:center;justify-content:center;gap:8px;color:#111827;text-decoration:none;background:linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"><span style="padding:2px 8px;background:rgba(255,255,255,.55);font-size:12px;font-weight:700">推荐</span><strong>一人企业 Vibe Coding 社区！</strong></a>',
        link: '',
        target: '_blank',
        height: 48
    },
    {
        renderMode: 'html',
        text: 'GPT-5.4 重回巅峰 智能对话',
        image: '',
        htmlCode:
            '<a href="https://nf.video/mbx1u6/?gid=18" target="_blank" rel="noopener noreferrer" style="display:flex;height:100%;align-items:center;justify-content:center;gap:8px;color:#111827;text-decoration:none;background:linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)"><span style="padding:2px 8px;background:rgba(255,255,255,.55);font-size:12px;font-weight:700">热门</span><strong>GPT-5.4 重回巅峰 智能对话</strong></a>',
        link: '',
        target: '_blank',
        height: 48
    },
    {
        renderMode: 'html',
        text: '免费 AI 编程工具 Trae',
        image: '',
        htmlCode:
            '<a href="https://www.trae.com.cn/" target="_blank" rel="noopener noreferrer" style="display:flex;height:100%;align-items:center;justify-content:center;gap:8px;color:#111827;text-decoration:none;background:linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)"><span style="padding:2px 8px;background:rgba(255,255,255,.55);font-size:12px;font-weight:700">新品</span><strong>免费 AI 编程工具 Trae</strong></a>',
        link: '',
        target: '_blank',
        height: 48
    }
]

const defaultHotTools: AdvertisingHotToolItem[] = [
    { title: 'Adobe 正版全家桶可用AI', desc: 'Adobe 正版全家桶可用AI', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'Gemini3 可用 nanobanana', desc: 'Gemini3 可用 nanobanana', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'AI学习网站', desc: '每天逛一逛', link: 'https://www.uied.cn/category/aigc/ai' },
    {
        title: '免费AI生成PPT',
        desc: 'AI智能生成PPT',
        link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047'
    },
    { title: 'AIGC学习网站', desc: 'UIED技术团队官网', link: 'https://uied.cn/' },
    { title: 'AIGC工具', desc: 'AI智能工具集合', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'Midjourney绘画', desc: 'AI绘画生成工具', link: 'https://nf.video/czybtp/?gid=26' },
    { title: 'GPT-5.2', desc: '最新版GPT-5.2智能对话工具', link: 'https://nf.video/oemcwv/?gid=18' },
    {
        title: 'ChatExcel表格',
        desc: 'AI Excel 数据分析辅助工具',
        link: 'https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6'
    }
]

const appStore = useAppStore()
const route = useRoute()
const advertisingItems = ref<AdvertisingItem[]>([])
const hotTools = ref<AdvertisingHotToolItem[]>([])
const activePlacement = ref<'top-banner' | 'hot-tools'>(route.query.section === 'hot-tools' ? 'hot-tools' : 'top-banner')
const expandedKeys = ref<(string | number)[]>(['0'])
const previewIndex = ref(0)
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const hasLoadedData = ref(false)
const submitError = ref('')
const previewRefreshWarning = ref('')
const isRefreshingPreview = ref(false)
const lastSavedAt = ref('')
const baselineSnapshot = ref('')

/**
 * 函数说明：深拷贝广告列表，避免默认模板被响应式表单修改。
 */
const cloneAdvertisingItems = (items: AdvertisingItem[]): AdvertisingItem[] =>
    items.map((item) => normalizeAdvertisingItem(item))

/**
 * 函数说明：深拷贝并清洗热门工具原生广告，兼容历史 name/url/description 字段。
 */
const cloneHotTools = (items: AdvertisingHotToolItem[]): AdvertisingHotToolItem[] =>
    items
        .map((item) => {
            const record = item as AdvertisingHotToolItem & { name?: string; description?: string; url?: string }
            return {
                title: String(record.title || record.name || '').trim(),
                desc: String(record.desc || record.description || '').trim(),
                link: String(record.link || record.url || '').trim()
            }
        })
        .filter((item) => item.title || item.desc || item.link)

/**
 * 函数说明：统一广告编辑数据，兼容旧接口可能缺失的新字段。
 */
const normalizeAdvertisingItem = (item: AdvertisingItem): AdvertisingItem => ({
    renderMode: item.renderMode === 'image' ? 'image' : 'html',
    text: String(item.text || ''),
    image: String(item.image || ''),
    htmlCode: String(item.htmlCode || ''),
    link: String(item.link || ''),
    target: item.target === '_self' ? '_self' : '_blank',
    height: Number.isFinite(Number(item.height)) && Number(item.height) >= 32 ? Number(item.height) : 48
})

/**
 * 函数说明：创建默认图片广告项，并补齐模式切换所需字段。
 */
const createAdvertisingItem = (): AdvertisingItem => ({
    renderMode: 'image',
    text: '',
    image: '',
    htmlCode: '',
    link: '',
    target: '_blank',
    height: 96
})

/**
 * 函数说明：判断广告链接是否为允许的站内、锚点或 HTTP(S) 地址。
 */
const isValidAdvertisingLink = (link: string): boolean => {
    const normalized = String(link || '').trim()
    return normalized.startsWith('/') || normalized.startsWith('#') || /^https?:\/\//i.test(normalized)
}

/**
 * 函数说明：汇总广告配置问题，用于体检和保存前拦截。
 */
const collectValidationTips = (items: AdvertisingItem[]): string[] => {
    const tips: string[] = []
    if (items.length === 0) {
        return ['请至少配置 1 条广告。']
    }
    if (items.length > 20) {
        tips.push('广告数量不能超过 20 条。')
    }
    items.forEach((item, index) => {
        const prefix = `第 ${index + 1} 条广告`
        if (!item.text.trim()) tips.push(`${prefix}缺少广告名称。`)
        if (item.height < 32 || item.height > 600) tips.push(`${prefix}高度需在 32–600px 之间。`)
        if (item.renderMode === 'image') {
            if (!/^(?:\/|https?:\/\/)/i.test(item.image.trim())) tips.push(`${prefix}图片地址不正确。`)
            if (item.link.trim() && !isValidAdvertisingLink(item.link)) tips.push(`${prefix}跳转链接格式不正确。`)
        } else {
            if (!item.htmlCode.trim()) tips.push(`${prefix}缺少 HTML 代码。`)
            if (containsUnsafeAdvertisingHtml(item.htmlCode)) tips.push(`${prefix} HTML 含有不安全内容。`)
        }
    })
    return tips.slice(0, 8)
}

/**
 * 函数说明：汇总热门工具原生广告问题，保存前校验展示字段与落地链接。
 */
const collectHotToolValidationTips = (items: AdvertisingHotToolItem[]): string[] => {
    const tips: string[] = []
    if (items.length === 0) return ['请至少配置 1 条热门工具原生广告。']
    if (items.length > 20) tips.push('热门工具原生广告不能超过 20 条。')
    items.forEach((item, index) => {
        const prefix = `第 ${index + 1} 条原生广告`
        if (!item.title.trim()) tips.push(`${prefix}缺少展示标题。`)
        if (!item.desc.trim()) tips.push(`${prefix}缺少简短简介。`)
        if (!isValidAdvertisingLink(item.link)) tips.push(`${prefix}落地链接格式不正确。`)
    })
    return tips.slice(0, 8)
}

const bannerValidationTips = computed(() => collectValidationTips(advertisingItems.value))
const hotToolValidationTips = computed(() => collectHotToolValidationTips(hotTools.value))
const validationTips = computed(() => [...bannerValidationTips.value, ...hotToolValidationTips.value].slice(0, 8))
const previewItem = computed(() => advertisingItems.value[previewIndex.value] || advertisingItems.value[0] || null)
const currentSnapshot = computed(() => JSON.stringify({ items: advertisingItems.value, hotTools: hotTools.value }))
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && baselineSnapshot.value !== currentSnapshot.value)

/**
 * 函数说明：生成广告预览高度，并在配置异常时回退默认值。
 */
const getBannerStyle = (item: AdvertisingItem): Record<string, string> => ({
    height: `${Math.min(600, Math.max(32, Number(item.height) || 48))}px`
})

/**
 * 函数说明：判断 HTML 广告是否含有脚本、事件属性或危险协议。
 */
const containsUnsafeAdvertisingHtml = (source: string): boolean => {
    const html = String(source || '')
    return [
        /<\s*(?:script|object|embed)\b/i,
        /\s+on[a-z]+\s*=/i,
        /\s+srcdoc\s*=/i,
        /(?:href|src|action|xlink:href)\s*=\s*["']?\s*(?:javascript|vbscript|file|blob|data)\s*:/i,
        /(?:url|@import)\s*\(?\s*["']?\s*(?:javascript|vbscript|file|blob|data)\s*:/i
    ].some((pattern) => pattern.test(html))
}

/**
 * 函数说明：清洗管理端 HTML 预览内的链接地址，危险或非常规协议直接移除。
 */
const normalizeSafePreviewUrl = (value: string): string => {
    const url = String(value || '').trim()
    const compact = url.replace(/[\u0000-\u001f\u007f\s]+/g, '')
    if (!url || /^(?:javascript|data|vbscript|file|blob):/i.test(compact)) return ''
    if (
        url.startsWith('/') ||
        url.startsWith('#') ||
        url.startsWith('?') ||
        /^(?:https?:)?\/\//i.test(url) ||
        /^mailto:/i.test(url) ||
        /^tel:/i.test(url)
    ) {
        return url
    }
    return ''
}

/**
 * 函数说明：清理预览 HTML 中的可执行内容，后端仍会在保存时再次校验。
 */
const sanitizeAdvertisingHtml = (source: string): string =>
    String(source || '')
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        .replace(/<object\b[\s\S]*?<\/object>/gi, '')
        .replace(/<embed\b[\s\S]*?>/gi, '')
        .replace(/\s+on[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '')
        .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
        .replace(/\s+srcdoc\s*=\s*(["'])[\s\S]*?\1/gi, '')
        .replace(/\s+srcdoc\s*=\s*[^\s>]+/gi, '')
        .replace(
            /\s+style\s*=\s*(["'])[^"']*(?:javascript|vbscript|file|blob|data)\s*:[^"']*\1/gi,
            ''
        )
        .replace(
            /\s+(href|src|action|xlink:href)\s*=\s*(["'])\s*([^"']*?)\s*\2/gi,
            (_matched, attributeName: string, quote: string, rawUrl: string) => {
                const safeUrl = normalizeSafePreviewUrl(rawUrl)
                return safeUrl ? ` ${attributeName}=${quote}${safeUrl}${quote}` : ''
            }
        )
        .replace(
            /\s+(href|src|action|xlink:href)\s*=\s*(?!["'])([^\s>]+)/gi,
            (_matched, attributeName: string, rawUrl: string) => {
                const safeUrl = normalizeSafePreviewUrl(rawUrl)
                return safeUrl ? ` ${attributeName}="${safeUrl}"` : ''
            }
        )

/**
 * 函数说明：生成折叠标题中的广告素材摘要。
 */
const getAdvertisingSourceSummary = (item: AdvertisingItem): string => {
    if (item.renderMode === 'image') {
        return item.image || '未设置图片'
    }
    return item.htmlCode ? item.htmlCode.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || 'HTML 代码' : '未设置 HTML'
}

/**
 * 函数说明：记录当前广告列表为已保存基线。
 */
const updateBaseline = (): void => {
    baselineSnapshot.value = currentSnapshot.value
}

/**
 * 函数说明：读取广告配置，仅在接口结构完整时回填并确认基线；失败保留原草稿，不生成默认广告。
 */
const loadAdvertising = async (): Promise<void> => {
    if (isLoading.value || isSubmitting.value) return
    isLoading.value = true
    loadError.value = ''
    try {
        const data = await getAdvertisingDetail()
        if (!Array.isArray(data?.items) || !Array.isArray(data?.hotTools)) {
            throw new Error('广告配置结构不完整')
        }
        advertisingItems.value = cloneAdvertisingItems(data.items)
        hotTools.value = cloneHotTools(data.hotTools)
        previewIndex.value = 0
        expandedKeys.value = advertisingItems.value.length ? ['0'] : []
        updateBaseline()
        hasLoadedData.value = true
        submitError.value = ''
    } catch (error) {
        loadError.value = '广告配置加载失败，当前内容已保留，请重新加载后再发布。'
        if (!(error as { notified?: boolean })?.notified) feedback.msgError(loadError.value)
    } finally {
        isLoading.value = false
    }
}

/**
 * 函数说明：重新加载前确认是否放弃草稿，取消时不发请求，读取失败仍保留当前编辑内容。
 */
const retryLoadAdvertising = async (): Promise<void> => {
    if (isLoading.value || isSubmitting.value) return
    if (hasUnsavedChanges.value) {
        try { await feedback.confirm('重新加载会放弃当前未保存广告，确定继续吗？') }
        catch { return }
    }
    await loadAdvertising()
}

/**
 * 函数说明：新增广告并自动展开、切换到新条目预览。
 */
const addAdvertisingItem = (): void => {
    advertisingItems.value.push(createAdvertisingItem())
    const index = advertisingItems.value.length - 1
    expandedKeys.value = [String(index)]
    previewIndex.value = index
}

/**
 * 函数说明：删除指定广告并修正预览索引。
 */
const removeAdvertisingItem = (index: number): void => {
    advertisingItems.value.splice(index, 1)
    previewIndex.value = Math.max(0, Math.min(previewIndex.value, advertisingItems.value.length - 1))
    expandedKeys.value = advertisingItems.value.length ? [String(Math.min(index, advertisingItems.value.length - 1))] : []
}

/**
 * 函数说明：调整广告轮播顺序并保持当前编辑项展开。
 */
const moveAdvertisingItem = (index: number, step: -1 | 1): void => {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= advertisingItems.value.length) return
    const current = advertisingItems.value[index]
    advertisingItems.value[index] = advertisingItems.value[targetIndex]
    advertisingItems.value[targetIndex] = current
    previewIndex.value = targetIndex
    expandedKeys.value = [String(targetIndex)]
}

/**
 * 函数说明：新增一条热门工具原生广告编辑项。
 */
const addHotTool = (): void => {
    hotTools.value.push({ title: '', desc: '', link: '' })
}

/**
 * 函数说明：调整热门工具原生广告顺序，前台按此顺序展示。
 */
const moveHotTool = (index: number, step: -1 | 1): void => {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= hotTools.value.length) return
    const current = hotTools.value[index]
    hotTools.value[index] = hotTools.value[targetIndex]
    hotTools.value[targetIndex] = current
}

/**
 * 函数说明：删除指定热门工具原生广告。
 */
const removeHotTool = (index: number): void => {
    hotTools.value.splice(index, 1)
}

/**
 * 函数说明：恢复推荐广告模板，仅修改编辑态且不会自动发布。
 */
const restoreDefaultAdvertising = async (): Promise<void> => {
    try {
        await feedback.confirm('确定恢复默认广告模板吗？恢复后仍需点击“保存并发布”。')
    } catch {
        return
    }
    advertisingItems.value = cloneAdvertisingItems(defaultAdvertisingItems)
    previewIndex.value = 0
    expandedKeys.value = ['0']
    feedback.msgSuccess('已恢复默认模板，请检查后保存')
}

/**
 * 函数说明：恢复热门工具原生广告默认模板，仅修改编辑态。
 */
const restoreDefaultHotTools = async (): Promise<void> => {
    try {
        await feedback.confirm('确定恢复默认热门工具原生广告吗？恢复后仍需点击“保存并发布”。')
    } catch {
        return
    }
    hotTools.value = cloneHotTools(defaultHotTools)
    feedback.msgSuccess('已恢复默认原生广告，请检查后保存')
}

/**
 * 函数说明：根据当前广告位恢复对应默认模板，避免误改另一区域。
 */
const restoreActiveDefaults = async (): Promise<void> => {
    if (activePlacement.value === 'hot-tools') {
        await restoreDefaultHotTools()
        return
    }
    await restoreDefaultAdvertising()
}

/**
 * 函数说明：执行广告配置体检并反馈首个问题。
 */
const runHealthCheck = (): void => {
    if (validationTips.value.length) {
        feedback.msgWarning(validationTips.value[0])
        return
    }
    feedback.msgSuccess(`广告配置正常：顶部 ${advertisingItems.value.length} 条，原生 ${hotTools.value.length} 条`)
}

/**
 * 函数说明：打开前台首页用于核对广告真实展示效果。
 */
const openFrontendPreview = (): void => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer')
}

/**
 * 函数说明：格式化最近保存时间。
 */
const formatSavedAt = (): string => {
    const date = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 函数说明：向同源前台标签页发送公共配置更新通知，存储不可用时不影响保存主流程。
 */
const notifyFrontendSiteConfigRefresh = (): void => {
    try {
        window.localStorage.setItem(siteConfigRefreshStorageKey, String(Date.now()))
    } catch {
        // 浏览器隐私模式或存储配额异常时，由前台焦点刷新机制兜底。
    }
}

/**
 * 函数说明：创建提交时的广告内容快照，保留广告类型、目标窗口和高度，只规范化现有文本字段。
 * 返回值：广告位与热门工具原生广告的独立数组。
 */
const buildAdvertisingPayload = (): { items: AdvertisingItem[]; hotTools: AdvertisingHotToolItem[] } => ({
    items: advertisingItems.value.map((item) => ({
        renderMode: item.renderMode,
        text: item.text.trim(),
        image: item.image.trim(),
        htmlCode: item.htmlCode.trim(),
        link: item.link.trim(),
        target: item.target,
        height: Math.round(item.height)
    })),
    hotTools: hotTools.value.map((item) => ({ title: item.title.trim(), desc: item.desc.trim(), link: item.link.trim() }))
})

/**
 * 函数说明：独立刷新已发布内容的全局配置；失败只提示刷新警告，不重复发布或改写保存基线。
 * 返回值：本次刷新完成返回 true，失败或已有刷新请求返回 false。
 */
const refreshSavedPreview = async (): Promise<boolean> => {
    if (isRefreshingPreview.value) return false
    isRefreshingPreview.value = true
    try {
        await appStore.getConfig()
        previewRefreshWarning.value = ''
        return true
    } catch {
        previewRefreshWarning.value = '广告已保存，前台配置刷新未完成，可重试刷新。'
        feedback.msgWarning(previewRefreshWarning.value)
        return false
    } finally {
        isRefreshingPreview.value = false
    }
}

/**
 * 函数说明：校验并发布广告快照，写入确认后立即更新基线；失败留稿，前台缓存刷新单独重试。
 */
const handleSubmit = async (): Promise<void> => {
    if (isSubmitting.value || isLoading.value || isRefreshingPreview.value || !hasLoadedData.value || loadError.value) return
    if (validationTips.value.length) {
        feedback.msgError(validationTips.value[0])
        return
    }
    const payload = buildAdvertisingPayload()
    const draftSnapshot = currentSnapshot.value
    isSubmitting.value = true
    submitError.value = ''
    try {
        try {
            await saveAdvertising(payload.items, payload.hotTools)
        } catch (error) {
            submitError.value = '广告保存失败，您的修改已保留，请重试。'
            if (!(error as { notified?: boolean })?.notified) feedback.msgError(submitError.value)
            return
        }
        if (currentSnapshot.value === draftSnapshot) {
            advertisingItems.value = cloneAdvertisingItems(payload.items)
            hotTools.value = cloneHotTools(payload.hotTools)
        }
        baselineSnapshot.value = JSON.stringify(payload)
        lastSavedAt.value = formatSavedAt()
        notifyFrontendSiteConfigRefresh()
        if (await refreshSavedPreview()) feedback.msgSuccess('广告内容已保存并发布')
    } finally {
        isSubmitting.value = false
    }
}

/** 函数说明：刷新或关闭浏览器前提醒尚未发布的广告草稿，已确认的保存不会再次提示。 */
const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    if (!hasUnsavedChanges.value) return
    event.preventDefault()
    event.returnValue = ''
}

onBeforeRouteLeave(async () => {
    if (!hasUnsavedChanges.value) return true
    try {
        await feedback.confirm('当前广告配置尚未保存，确定离开吗？')
        return true
    } catch {
        return false
    }
})

onMounted(() => {
    void loadAdvertising()
    window.addEventListener('beforeunload', handleBeforeUnload)
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
</script>

<style scoped lang="scss">
.advertising-page {
    --campaign-ink: var(--uied-admin-ink);
    --campaign-blue: var(--uied-admin-accent);
    --campaign-line: var(--uied-admin-border);
    min-width: 0;
}

.advertising-refresh-warning { margin-bottom: 16px; }

.header-actions,
.editor-title,
.advertising-summary,
.row-actions {
    display: flex;
    align-items: center;
}

.header-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
}

.placement-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 6px;
    border: 1px solid var(--campaign-line);
    border-radius: 8px;
    background: #f4f7fb;
}

.placement-switch button {
    display: grid;
    gap: 3px;
    padding: 13px 16px;
    border: 1px solid transparent;
    border-radius: 6px;
    color: #526174;
    text-align: left;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease;
}

.placement-switch button span {
    font-size: 14px;
    font-weight: 700;
}

.placement-switch button small {
    color: #8793a3;
}

.placement-switch button.is-active {
    border-color: var(--uied-admin-accent-border);
    color: var(--campaign-blue);
    background: var(--uied-admin-accent-soft);
}

.preview-card,
.editor-card {
    border: 1px solid var(--campaign-line);
    border-radius: 8px;
}

.banner-preview,
.item-preview {
    position: relative;
    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 32px;
    border: 1px solid rgba(20, 33, 61, 0.08);
    border-radius: 8px;
    color: #172033;
    background: #f8fafc;
}

.banner-preview > span,
.item-preview > span {
    padding: 3px 9px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 700;
}

.banner-preview > img,
.item-preview > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.html-ad-preview {
    width: 100%;
    height: 100%;
}

.html-ad-preview :deep(> *) {
    max-width: 100%;
}

.preview-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
}

.preview-dots button {
    width: 20px;
    height: 4px;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: #cbd5e1;
    cursor: pointer;
}

.preview-dots button.is-active {
    background: var(--campaign-blue);
}

.empty-preview,
.empty-editor {
    padding: 36px 20px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    color: #718096;
    text-align: center;
}

.empty-editor p {
    margin: 6px 0 16px;
}

.editor-title {
    justify-content: space-between;
    gap: 16px;
}

.editor-title > div {
    display: grid;
    gap: 4px;
}

.editor-title span {
    color: #7a8798;
    font-size: 12px;
    font-weight: 400;
}

.advertising-collapse :deep(.arco-collapse-item) {
    margin-bottom: 10px;
    overflow: hidden;
    border: 1px solid #e1e6ed;
    border-radius: 8px;
}

.advertising-collapse :deep(.arco-collapse-item-header) {
    background: #f8fafc;
}

.advertising-summary {
    min-width: 0;
    gap: 10px;
}

.advertising-summary__order {
    color: var(--campaign-blue);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
}

.advertising-summary strong {
    overflow: hidden;
    color: #273449;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.advertising-summary__link {
    overflow: hidden;
    color: #8793a3;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.advertising-editor-grid {
    display: grid;
    grid-template-columns: minmax(160px, 0.7fr) minmax(260px, 1.3fr);
    gap: 16px;
    padding: 8px 4px 4px;
}

.field-block {
    display: grid;
    align-content: start;
    gap: 7px;
}

.field-block label {
    color: #526174;
    font-size: 12px;
    font-weight: 600;
}

.field-block--wide {
    min-width: 0;
}

.field-block--full {
    grid-column: 1 / -1;
}

.field-block small {
    color: #8793a3;
    line-height: 1.6;
}

.item-preview {
    grid-column: 1 / -1;
}

.row-actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
    gap: 4px;
    border-top: 1px solid #edf0f4;
    padding-top: 8px;
}

.native-preview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
}

.native-preview-card {
    position: relative;
    display: grid;
    min-width: 0;
    gap: 6px;
    padding: 16px;
    overflow: hidden;
    border: 1px solid #dfe5ec;
    border-radius: 8px;
    color: #273449;
    text-decoration: none;
    background: #fff;
}

.native-preview-card::after {
    position: absolute;
    right: -18px;
    bottom: -22px;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--uied-admin-accent-soft);
    content: '';
}

.native-preview-card__index {
    color: var(--campaign-blue);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 11px;
    font-weight: 700;
}

.native-preview-card strong,
.native-preview-card small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.native-preview-card small {
    color: #7a8798;
}

.hot-tool-editor-list {
    display: grid;
    gap: 10px;
}

.hot-tool-editor-row {
    display: grid;
    grid-template-columns: 34px minmax(160px, 0.7fr) minmax(200px, 1fr) minmax(260px, 1.2fr) auto;
    align-items: end;
    gap: 12px;
    padding: 14px;
    border: 1px solid #e1e6ed;
    border-radius: 8px;
    background: #fbfcfe;
}

.hot-tool-editor-row__order {
    align-self: center;
    color: var(--campaign-blue);
    font-family: 'SFMono-Regular', Consolas, monospace;
    font-size: 12px;
    font-weight: 700;
}

.hot-tool-editor-row__actions {
    grid-column: auto;
    align-self: end;
    border-top: 0;
    padding-top: 0;
    white-space: nowrap;
}

@media (max-width: 900px) {
    .advertising-editor-grid {
        grid-template-columns: 1fr;
    }

    .native-preview-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .hot-tool-editor-row {
        grid-template-columns: 28px minmax(0, 1fr) minmax(0, 1fr);
    }

    .hot-tool-editor-row__link,
    .hot-tool-editor-row__actions {
        grid-column: 2 / -1;
    }
}

@media (max-width: 640px) {
    .header-actions {
        justify-content: flex-start;
    }

    .placement-switch,
    .native-preview-grid {
        grid-template-columns: 1fr;
    }

    .hot-tool-editor-row {
        grid-template-columns: 1fr;
    }

    .hot-tool-editor-row__order,
    .hot-tool-editor-row__link,
    .hot-tool-editor-row__actions {
        grid-column: 1;
    }

    .advertising-summary__link {
        display: none;
    }

    .row-actions {
        flex-wrap: wrap;
        justify-content: flex-start;
    }
}
</style>
