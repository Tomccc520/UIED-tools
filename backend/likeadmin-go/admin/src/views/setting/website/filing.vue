<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-23
 */
-->
<template>
    <div class="website-filing-page pro-page-shell basic-config-page">
        <admin-page-header title="备案与版权" description="维护页脚显示内容、可选链接与展示顺序。">
            <template #extra><div class="basic-config-page__actions"><a-button :disabled="isSubmitting" :loading="isLoadingData" @click="reloadData">重新加载</a-button><a-button @click="openToolsPreview">前台预览</a-button></div></template>
        </admin-page-header>
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadData">
            <fieldset :disabled="!canEdit" :inert="!canEdit ? '' : undefined" class="basic-config-page__fields">
                <a-card :bordered="false" class="pro-panel-card basic-config-page__card">
                    <div class="filing-toolbar"><div><h2>页脚条目</h2><p class="basic-config-page__hint">{{ formData.length }} 条；无跳转链接时只显示文字。</p></div><a-button v-perms="['setting:copyright:save']" :disabled="!canOperate()" data-admin-smoke="website-filing-add" @click="addItem">新增条目</a-button></div>
                    <a-empty v-if="hasLoadedData && !formData.length" description="暂无备案信息，请新增条目后填写" />
                    <a-form v-else :model="formData" layout="vertical">
                        <section v-for="(item, index) in formData" :key="index" class="filing-row" :aria-label="`备案条目 ${index + 1}`">
                            <div class="filing-row__header"><h3>条目 {{ index + 1 }}</h3><div class="basic-config-page__actions"><a-button type="text" :disabled="index === 0" :aria-label="`上移条目 ${index + 1}`" @click="moveItem(index, -1)">上移</a-button><a-button type="text" :disabled="index === formData.length - 1" :aria-label="`下移条目 ${index + 1}`" @click="moveItem(index, 1)">下移</a-button><a-button type="text" status="danger" :disabled="formData.length <= 1" :aria-label="`删除条目 ${index + 1}`" @click="handleDelete(index)">删除</a-button></div></div>
                            <div class="filing-row__fields"><a-form-item label="显示内容" required><a-input v-model="item.name" :input-attrs="{ 'aria-label': `条目 ${index + 1} 显示内容` }" placeholder="例如：粤ICP备2022056875号" /></a-form-item><a-form-item label="跳转链接"><a-input v-model="item.link" :input-attrs="{ 'aria-label': `条目 ${index + 1} 跳转链接` }" placeholder="可留空，例如：https://beian.miit.gov.cn/" /></a-form-item></div>
                        </section>
                    </a-form>
                </a-card>
            </fieldset>
            <template #actions><a-button v-perms="['setting:copyright:save']" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges" data-admin-smoke="website-filing-save" @click="handleSubmit">保存配置</a-button></template>
        </config-edit-frame>
    </div>
</template>
<script setup lang="ts" name="webFilling">
import { computed, onMounted, reactive, ref } from 'vue'
import AdminPageHeader from '@/components/page-header/index.vue'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useConfigEditor } from '@/composables/use-config-editor'
import { getCopyright, setCopyright } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'

interface FilingItem { name: string; link: string }
const appStore = useAppStore()
const formData = ref<FilingItem[]>([])
const userStore = useUserStore()
/** 根据当前权限控制编辑与保存，脚本调用同样遵守按钮权限。 */
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:copyright:save'))
/** 克隆本页条目字段，防止异步保存引用仍会变化的响应式列表。 */
const buildPayload = (): FilingItem[] => formData.value.map(item => ({ name: item.name, link: item.link }))
/** 保留文字与链接的完整值，顺序变化同样视为未保存。 */
const buildSnapshot = () => JSON.stringify(buildPayload())
/** 公共编辑器维护读写状态和草稿保护，页面继续负责字段与接口。 */
const { isLoadingData, hasLoadedData, loadErrorMessage, isSubmitting, lastSavedAt, submitError, hasUnsavedChanges, canOperate, loadConfiguration, reloadConfiguration, submitConfiguration } = useConfigEditor({ canEdit, snapshot: buildSnapshot, successText: '备案与版权配置已保存' })
/** 读取真实列表；非法响应视为失败，不用默认空列表覆盖既有内容。 */
const getData = () => loadConfiguration(async () => {
    const data = await getCopyright()
    if (!Array.isArray(data) || data.some(item => !item || typeof item.name !== 'string' || typeof item.link !== 'string')) throw new Error('备案配置响应不完整')
    formData.value = data.map(item => ({ name: item.name, link: item.link }))
})
/** 在已就绪且有权限时新增空白条目，保存前仍需填写显示内容。 */
const addItem = () => { if (canOperate()) formData.value.push({ name: '', link: '' }) }
/** 删除指定条目，至少保留一条，禁止非法索引误删列表末项。 */
const handleDelete = (index: number) => { if (canOperate() && formData.value.length > 1 && Number.isInteger(index) && index >= 0 && index < formData.value.length) formData.value.splice(index, 1) }
/** 调整合法条目的显示顺序，不改变显示内容与链接。 */
const moveItem = (index: number, step: -1 | 1) => {
    if (!canOperate() || !Number.isInteger(index) || index < 0 || index >= formData.value.length) return
    const target = index + step
    if (target < 0 || target >= formData.value.length) return
    const current = formData.value[index]
    formData.value[index] = formData.value[target]
    formData.value[target] = current
}
/** 校验可选链接，拒绝脚本协议；支持原有站内地址、锚点与 HTTP(S)。 */
const isValidFilingLink = (link: string) => {
    const value = link.trim()
    return !value || value.startsWith('/') || value.startsWith('#') || /^https?:\/\//i.test(value)
}
/** 保存独立列表快照，成功后直接建立基线，不再用重复 GET 决定保存结果。 */
const handleSubmit = async () => {
    if (!canOperate() || !hasUnsavedChanges.value) return false
    const payload = buildPayload()
    if (!payload.length) { feedback.msgError('至少保留一条备案信息'); return false }
    const invalid = payload.findIndex(item => !item.name.trim() || !isValidFilingLink(item.link))
    if (invalid >= 0) { feedback.msgError(`请检查第 ${invalid + 1} 条的显示内容和链接格式`); return false }
    const snapshot = JSON.stringify(payload)
    return submitConfiguration(() => setCopyright(payload), snapshot)
}
/** 安全打开主站预览，不传递后台登录信息。 */
const openToolsPreview = () => window.open(resolveToolsPreviewUrl(appStore.config), '_blank', 'noopener,noreferrer')
/** 重新读取前由公共编辑器确认草稿，提交期间不启动读取。 */
const reloadData = () => reloadConfiguration(getData)
/** 页面挂载后读取本页业务数据，公共编辑器自行清理离开守卫。 */
onMounted(() => { void getData() })
</script>
<style scoped lang="scss">
.basic-config-page { min-width: 0; }
.basic-config-page__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.basic-config-page__fields { min-width: 0; padding: 0; margin: 0; border: 0; }
.basic-config-page__card + .basic-config-page__card { margin-top: 16px; }
.basic-config-page__heading { margin-bottom: 20px; }
.basic-config-page__heading h2 { margin: 0; font-size: 16px; line-height: 1.5; font-weight: 600; color: var(--color-text-1); }
.basic-config-page__heading p, .basic-config-page__hint { margin: 6px 0 0; color: var(--color-text-3); font-size: 12px; line-height: 1.7; }
.basic-config-page__notice { margin-bottom: 16px; }
.basic-config-page__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.basic-config-page__form { max-width: 920px; }
.basic-config-page__form :deep(.arco-input-wrapper) { min-width: 0; }
@media (max-width: 600px) {
    .basic-config-page__grid { grid-template-columns: 1fr; }
    .basic-config-page__card :deep(.arco-card-body) { padding: 16px; }
    .basic-config-page__actions button { min-height: 44px; }
}
.filing-toolbar, .filing-row__header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.filing-toolbar { margin-bottom: 20px; }
.filing-toolbar h2, .filing-row h3 { margin: 0; color: var(--color-text-1); font-size: 15px; font-weight: 600; }
.filing-row + .filing-row { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--color-border-2); }
.filing-row__header { margin-bottom: 12px; }
.filing-row__fields { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 16px; }
@media (max-width: 700px) { .filing-row__fields { grid-template-columns: 1fr; gap: 0; } }
</style>
