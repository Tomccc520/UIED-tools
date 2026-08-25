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
        <a-page-header class="advertising-header" title="运营管理 · 广告管理">
            <template #subtitle>
                独立维护首页顶部广告内容。保存后前台公共配置实时生效，不再与官网布局混合编辑。
            </template>
            <template #extra>
                <div class="header-actions">
                    <a-tag color="arcoblue" bordered>独立运营模块</a-tag>
                    <a-tag :color="validationTips.length ? 'orange' : 'green'" bordered>
                        {{ validationTips.length ? `${validationTips.length} 项待处理` : '配置健康' }}
                    </a-tag>
                    <a-button size="small" @click="restoreDefaultAdvertising">恢复默认</a-button>
                    <a-button size="small" @click="openFrontendPreview">前端预览</a-button>
                    <a-button size="small" @click="runHealthCheck">一键体检</a-button>
                </div>
            </template>
        </a-page-header>

        <a-spin :loading="isLoading" class="advertising-loading">
            <section class="campaign-overview">
                <div class="campaign-overview__copy">
                    <span class="campaign-overview__eyebrow">CAMPAIGN CONTROL</span>
                    <h2>首页广告投放台</h2>
                    <p>按列表顺序自动轮播。建议控制在 3–8 条，并使用清晰角标和有辨识度的背景色彩。</p>
                </div>
                <div class="campaign-metrics">
                    <div>
                        <span>广告数量</span>
                        <strong>{{ advertisingItems.length }}</strong>
                    </div>
                    <div>
                        <span>外部链接</span>
                        <strong>{{ externalLinkCount }}</strong>
                    </div>
                    <div>
                        <span>待处理</span>
                        <strong :class="{ 'is-warning': validationTips.length > 0 }">{{ validationTips.length }}</strong>
                    </div>
                </div>
            </section>

            <a-alert v-if="loadError" class="mt-4" type="error" :closable="false" show-icon>
                {{ loadError }}
                <template #action><a-button size="mini" @click="loadAdvertising">重新加载</a-button></template>
            </a-alert>

            <a-card class="preview-card mt-4" :bordered="false">
                <template #title>当前首屏预览</template>
                <div v-if="previewItem" class="banner-preview" :style="getBannerStyle(previewItem)">
                    <span>{{ previewItem.badge || '角标' }}</span>
                    <strong>{{ previewItem.text || '请填写广告文案' }}</strong>
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

            <a-card class="editor-card mt-4" :bordered="false">
                <template #title>
                    <div class="editor-title">
                        <div>
                            <strong>广告内容</strong>
                            <span>角标、文案、跳转链接和背景渐变为必填项</span>
                        </div>
                        <a-button type="primary" size="small" @click="addAdvertisingItem">新增广告</a-button>
                    </div>
                </template>

                <a-alert v-if="validationTips.length" class="mb-4" type="warning" :closable="false" show-icon>
                    {{ validationTips[0] }}
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
                                <a-tag bordered>{{ item.badge || '未设置角标' }}</a-tag>
                                <strong>{{ item.text || '未填写广告文案' }}</strong>
                                <span class="advertising-summary__link">{{ item.link || '未设置链接' }}</span>
                            </div>
                        </template>

                        <div class="advertising-editor-grid">
                            <div class="field-block">
                                <label>广告角标</label>
                                <a-input v-model="item.badge" maxlength="20" show-word-limit placeholder="如：推荐、热门、新品" />
                            </div>
                            <div class="field-block field-block--wide">
                                <label>广告文案</label>
                                <a-input v-model="item.text" maxlength="120" show-word-limit placeholder="建议 8–24 个字" />
                            </div>
                            <div class="field-block field-block--wide">
                                <label>跳转链接</label>
                                <a-input v-model="item.link" placeholder="支持 /、# 或 http(s) 链接" />
                            </div>
                            <div class="field-block field-block--wide">
                                <label>背景渐变</label>
                                <a-input v-model="item.gradient" placeholder="linear-gradient(to right,#6366f1,#e0e7ff)" />
                                <div class="gradient-presets">
                                    <button
                                        v-for="preset in gradientPresets"
                                        :key="preset"
                                        type="button"
                                        :style="{ backgroundImage: preset }"
                                        aria-label="应用背景渐变"
                                        @click="item.gradient = preset"
                                    />
                                </div>
                            </div>
                            <div class="item-preview" :style="getBannerStyle(item)">
                                <span>{{ item.badge || '角标' }}</span>
                                <strong>{{ item.text || '广告文案预览' }}</strong>
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

            <footer-btns :fixed="false" v-perms="['operation:advertising:save']">
                <span v-if="lastSavedAt" class="saved-at">最近保存：{{ lastSavedAt }}</span>
                <a-button type="primary" :loading="isSubmitting" @click="handleSubmit">保存并发布</a-button>
            </footer-btns>
        </a-spin>
    </div>
</template>

<script lang="ts" setup name="operationAdvertising">
import {
    getAdvertisingDetail,
    saveAdvertising,
    type AdvertisingItem
} from '@/api/operation/advertising'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { computed, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { resolveToolsPreviewUrl } from '../../setting/website/composables/use-preview-url'

const defaultAdvertisingItems: AdvertisingItem[] = [
    {
        badge: '推荐',
        text: '一人企业 Vibe Coding 社区！',
        link: 'https://fsuied.com',
        gradient: 'linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)'
    },
    {
        badge: '热门',
        text: 'GPT-5.4 重回巅峰 智能对话',
        link: 'https://nf.video/mbx1u6/?gid=18',
        gradient: 'linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)'
    },
    {
        badge: '新品',
        text: '免费 AI 编程工具 Trae',
        link: 'https://www.trae.com.cn/',
        gradient: 'linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)'
    }
]

const gradientPresets = [
    'linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)',
    'linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)',
    'linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)',
    'linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)',
    'linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)'
]

const appStore = useAppStore()
const advertisingItems = ref<AdvertisingItem[]>([])
const expandedKeys = ref<(string | number)[]>(['0'])
const previewIndex = ref(0)
const isLoading = ref(false)
const isSubmitting = ref(false)
const loadError = ref('')
const lastSavedAt = ref('')
const baselineSnapshot = ref('')

/**
 * 函数说明：深拷贝广告列表，避免默认模板被响应式表单修改。
 */
const cloneAdvertisingItems = (items: AdvertisingItem[]): AdvertisingItem[] => items.map((item) => ({ ...item }))

/**
 * 函数说明：创建空广告项并提供可直接预览的默认渐变。
 */
const createAdvertisingItem = (): AdvertisingItem => ({
    badge: '',
    text: '',
    link: '',
    gradient: gradientPresets[advertisingItems.value.length % gradientPresets.length]
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
        if (!item.badge.trim()) tips.push(`${prefix}缺少角标。`)
        if (!item.text.trim()) tips.push(`${prefix}缺少文案。`)
        if (!isValidAdvertisingLink(item.link)) tips.push(`${prefix}链接格式不正确。`)
        if (!/^linear-gradient\(/i.test(item.gradient.trim())) tips.push(`${prefix}背景需使用 linear-gradient(...)。`)
    })
    return tips.slice(0, 8)
}

const validationTips = computed(() => collectValidationTips(advertisingItems.value))
const externalLinkCount = computed(() => advertisingItems.value.filter((item) => /^https?:\/\//i.test(item.link.trim())).length)
const previewItem = computed(() => advertisingItems.value[previewIndex.value] || advertisingItems.value[0] || null)
const currentSnapshot = computed(() => JSON.stringify(advertisingItems.value))
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && baselineSnapshot.value !== currentSnapshot.value)

/**
 * 函数说明：生成广告背景预览样式，空值时回退为中性背景。
 */
const getBannerStyle = (item: AdvertisingItem): Record<string, string> => ({
    backgroundImage: /^linear-gradient\(/i.test(item.gradient.trim())
        ? item.gradient.trim()
        : 'linear-gradient(to right,#e5e7eb,#f8fafc)'
})

/**
 * 函数说明：记录当前广告列表为已保存基线。
 */
const updateBaseline = (): void => {
    baselineSnapshot.value = currentSnapshot.value
}

/**
 * 函数说明：读取运营广告配置并兼容现有首页 Banner 数据。
 */
const loadAdvertising = async (): Promise<void> => {
    isLoading.value = true
    loadError.value = ''
    try {
        const data = await getAdvertisingDetail()
        advertisingItems.value = cloneAdvertisingItems(Array.isArray(data.items) ? data.items : defaultAdvertisingItems)
        previewIndex.value = 0
        expandedKeys.value = advertisingItems.value.length ? ['0'] : []
        updateBaseline()
    } catch {
        loadError.value = '广告配置加载失败，请检查接口或登录状态。'
        advertisingItems.value = cloneAdvertisingItems(defaultAdvertisingItems)
        updateBaseline()
    } finally {
        isLoading.value = false
    }
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
 * 函数说明：执行广告配置体检并反馈首个问题。
 */
const runHealthCheck = (): void => {
    if (validationTips.value.length) {
        feedback.msgWarning(validationTips.value[0])
        return
    }
    feedback.msgSuccess(`广告配置正常，共 ${advertisingItems.value.length} 条，可保存发布`)
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
 * 函数说明：校验并发布广告列表，成功后更新本地基线。
 */
const handleSubmit = async (): Promise<void> => {
    if (isSubmitting.value) return
    if (validationTips.value.length) {
        feedback.msgError(validationTips.value[0])
        return
    }
    isSubmitting.value = true
    try {
        const normalized = advertisingItems.value.map((item) => ({
            badge: item.badge.trim(),
            text: item.text.trim(),
            link: item.link.trim(),
            gradient: item.gradient.trim()
        }))
        const data = await saveAdvertising(normalized)
        advertisingItems.value = cloneAdvertisingItems(data.items)
        lastSavedAt.value = formatSavedAt()
        updateBaseline()
        feedback.msgSuccess('广告内容已保存并发布')
    } finally {
        isSubmitting.value = false
    }
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
})
</script>

<style scoped lang="scss">
.advertising-page {
    --campaign-ink: #14213d;
    --campaign-blue: #1769e0;
    --campaign-line: #dfe5ec;
    min-width: 0;
}

.advertising-header {
    padding: 4px 0 18px;
}

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

.advertising-loading {
    display: block;
    min-height: 360px;
}

.campaign-overview {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 32px;
    padding: 24px;
    border: 1px solid #cad8e8;
    border-radius: 8px;
    background:
        linear-gradient(115deg, rgba(23, 105, 224, 0.08), transparent 48%),
        repeating-linear-gradient(90deg, transparent 0, transparent 31px, rgba(20, 33, 61, 0.035) 32px),
        #f8fbff;
}

.campaign-overview__eyebrow {
    color: var(--campaign-blue);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
}

.campaign-overview h2 {
    margin: 8px 0 6px;
    color: var(--campaign-ink);
    font-size: 24px;
}

.campaign-overview p {
    max-width: 680px;
    margin: 0;
    color: #607086;
    line-height: 1.7;
}

.campaign-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(90px, 1fr));
    gap: 1px;
    overflow: hidden;
    border: 1px solid #d8e1ec;
    border-radius: 8px;
    background: #d8e1ec;
}

.campaign-metrics > div {
    min-width: 96px;
    padding: 14px;
    background: rgba(255, 255, 255, 0.92);
}

.campaign-metrics span,
.campaign-metrics strong {
    display: block;
}

.campaign-metrics span {
    color: #718096;
    font-size: 12px;
}

.campaign-metrics strong {
    margin-top: 5px;
    color: var(--campaign-ink);
    font-size: 22px;
}

.campaign-metrics strong.is-warning {
    color: #d46b08;
}

.preview-card,
.editor-card {
    border: 1px solid var(--campaign-line);
    border-radius: 8px;
}

.banner-preview,
.item-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 54px;
    border: 1px solid rgba(20, 33, 61, 0.08);
    border-radius: 8px;
    color: #172033;
    background-size: cover;
}

.banner-preview span,
.item-preview span {
    padding: 3px 9px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.58);
    font-size: 12px;
    font-weight: 700;
}

.banner-preview strong,
.item-preview strong {
    font-size: 15px;
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

.gradient-presets {
    display: flex;
    gap: 7px;
}

.gradient-presets button {
    width: 28px;
    height: 18px;
    padding: 0;
    border: 1px solid rgba(20, 33, 61, 0.12);
    border-radius: 4px;
    cursor: pointer;
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

.saved-at {
    margin-right: 12px;
    color: #7a8798;
    font-size: 12px;
}

@media (max-width: 900px) {
    .campaign-overview {
        grid-template-columns: 1fr;
    }

    .advertising-editor-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .header-actions {
        justify-content: flex-start;
    }

    .campaign-overview {
        padding: 18px;
    }

    .campaign-metrics {
        grid-template-columns: 1fr;
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
