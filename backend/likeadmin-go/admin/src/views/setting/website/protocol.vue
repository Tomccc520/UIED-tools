<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-23
 */
-->
<template>
    <div class="website-protocol-page pro-page-shell basic-config-page">
        <admin-page-header title="服务协议与隐私政策" description="正文默认只读，点击编辑正文后修改；两份协议统一保存。">
            <template #extra><a-button :disabled="isSubmitting" :loading="isLoadingData" @click="reloadData">重新加载</a-button></template>
        </admin-page-header>
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadData">
            <fieldset :disabled="!canEdit" :inert="!canEdit ? '' : undefined" class="basic-config-page__fields">
                <a-card :bordered="false" class="pro-panel-card basic-config-page__card">
                    <a-tabs v-model:active-key="activeProtocol">
                        <a-tab-pane v-for="item in protocolTypes" :key="item.key" :title="item.title" :destroy-on-hide="false">
                            <div v-if="hasLoadedData" class="protocol-editor">
                                <a-form :model="formData[item.key]" layout="vertical"><a-form-item label="协议名称" required><a-input v-model="formData[item.key].name" :input-attrs="{ 'aria-label': `${item.title}名称` }" :placeholder="`请输入${item.title}标题`" /></a-form-item></a-form>
                                <div class="protocol-editor__label"><div><strong>协议正文</strong><span>{{ getPlainTextLength(formData[item.key].content) }} 字</span></div><a-button v-if="!editingBodies[item.key]" v-perms="['setting:protocol:save']" size="small" :aria-label="`编辑${item.title}正文`" @click="startBodyEditing(item.key)">编辑正文</a-button><a-tag v-else size="small">正在编辑正文</a-tag></div>
                                <editor :model-value="formData[item.key].content" :readonly="!editingBodies[item.key] || !canEdit || isLoadingData || isSubmitting || Boolean(loadErrorMessage)" height="480" @update:model-value="updateProtocolBody(item.key, $event)" />
                            </div>
                        </a-tab-pane>
                    </a-tabs>
                </a-card>
            </fieldset>
            <template #actions><a-button v-perms="['setting:protocol:save']" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges" data-admin-smoke="website-protocol-save" @click="handleSave">保存配置</a-button></template>
        </config-edit-frame>
    </div>
</template>
<script setup lang="ts" name="webProtocol">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import AdminPageHeader from '@/components/page-header/index.vue'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import ConfigEditFrame from './components/config-edit-frame.vue'
import { useConfigLoad } from './composables/use-config-load'
import { useOperateSubmit } from './composables/use-operate-submit'
import { getProtocol, setProtocol } from '@/api/setting/website'

interface ProtocolDetail { name: string; content: string }
interface ProtocolFormData { service: ProtocolDetail; privacy: ProtocolDetail }
const formData = ref<ProtocolFormData>({ service: { name: '', content: '' }, privacy: { name: '', content: '' } })
const activeProtocol = ref<'service' | 'privacy'>('service')
const editingBodies = reactive<Record<keyof ProtocolFormData, boolean>>({ service: false, privacy: false })
const protocolTypes: { key: keyof ProtocolFormData; title: string }[] = [{ key: 'service', title: '服务协议' }, { key: 'privacy', title: '隐私政策' }]
const userStore = useUserStore()
/** 根据当前权限控制编辑与保存，脚本调用同样遵守按钮权限。 */
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:protocol:save'))
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('协议配置已保存')
const baselineSnapshot = ref('')
/** 按完整编辑值比较草稿，不忽略有意义的正文和空白改动。 */
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && buildSnapshot() !== baselineSnapshot.value)
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
/** 统一检查加载、权限与并发状态，读取失败后不能发布默认表单。 */
const canOperate = () => canEdit.value && hasLoadedData.value && !isLoadingData.value && !isSubmitting.value && !loadErrorMessage.value

/** 只有用户明确开启正文编辑后才接受编辑器输出，初始化归一化不得改写法务原文。 */
const updateProtocolBody = (key: keyof ProtocolFormData, value: string) => {
    if (!canOperate() || !editingBodies[key] || typeof value !== 'string') return
    formData.value[key].content = value
}
/** 开启指定正文的编辑权限，不主动格式化或替换现有 HTML。 */
const startBodyEditing = (key: keyof ProtocolFormData) => {
    if (!canOperate()) return
    editingBodies[key] = true
}

/** 统计展示用纯文本字数，不改写存储或提交的协议 HTML。 */
const getPlainTextLength = (html: string) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
/** 克隆两份完整协议，标题、正文和空白均按用户输入原样保留。 */
const buildPayload = (): ProtocolFormData => ({ service: { name: formData.value.service.name, content: formData.value.service.content }, privacy: { name: formData.value.privacy.name, content: formData.value.privacy.content } })
/** 使用原始协议内容生成快照，不把正文前后空白变更误判为已保存。 */
const buildSnapshot = () => JSON.stringify(buildPayload())
/** 只接受完整协议响应；加载失败时禁止默认空正文覆盖服务端内容。 */
const getData = async () => {
    if (isSubmitting.value) return false
    return loadConfiguration(async () => {
        const data = await getProtocol()
        if (!data || protocolTypes.some(item => typeof data[item.key]?.name !== 'string' || typeof data[item.key]?.content !== 'string')) throw new Error('协议配置响应不完整')
        editingBodies.service = false
        editingBodies.privacy = false
        formData.value = { service: { name: data.service.name, content: data.service.content }, privacy: { name: data.privacy.name, content: data.privacy.content } }
        baselineSnapshot.value = buildSnapshot()
        submitError.value = ''
    })
}
/** 保存两份协议的独立快照；不生成、修订或格式化法务正文，也不重复读回。 */
const handleSave = async () => {
    if (!canOperate() || !hasUnsavedChanges.value) return false
    const payload = buildPayload()
    const invalid = protocolTypes.find(item => !payload[item.key].name.trim() || getPlainTextLength(payload[item.key].content) === 0)
    if (invalid) { feedback.msgError(`请填写${invalid.title}名称和正文`); return false }
    const snapshot = JSON.stringify(payload)
    return runSubmit(async () => { await setProtocol(payload); baselineSnapshot.value = snapshot })
}
/** 重新加载前确认放弃草稿；保存中不允许重读覆盖表单。 */
const reloadData = async () => {
    if (isSubmitting.value) return false
    return reloadConfiguration(getData)
}
/** 刷新或关闭浏览器时保护尚未保存的编辑。 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (hasUnsavedChanges.value || isSubmitting.value) { event.preventDefault(); event.returnValue = '' }
}
/** 路由离开时确认草稿；提交未结束时阻止跳转，避免误判保存结果。 */
const confirmLeave = async () => {
    if (isSubmitting.value) return false
    if (!hasUnsavedChanges.value) return true
    try { await feedback.confirm('当前页面存在未保存更改，确定离开吗？'); return true } catch { return false }
}
onBeforeRouteLeave(confirmLeave)
onMounted(() => { void getData(); window.addEventListener('beforeunload', handleBeforeUnload) })
onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload))
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
.protocol-editor { min-width: 0; padding-top: 12px; }
.protocol-editor__label { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin: 0 0 10px; color: var(--color-text-2); font-size: 13px; }
.protocol-editor__label > div { display: flex; align-items: center; gap: 12px; }
.protocol-editor__label span { color: var(--color-text-3); }
@media (max-width: 600px) { .protocol-editor__label button { min-height: 44px; } }
.protocol-editor :deep(.w-e-bar) { flex-wrap: wrap; }
.protocol-editor :deep(.w-e-bar-item) { padding: 4px; }
</style>
