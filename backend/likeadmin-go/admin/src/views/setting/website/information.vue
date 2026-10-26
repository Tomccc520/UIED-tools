<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="website-information pro-page-shell basic-config-page">
        <admin-page-header title="后台品牌与基础资料" description="维护管理后台的名称、图标、登录视觉和商城资料。">
            <template #extra><div class="basic-config-page__actions"><a-button :disabled="isSubmitting" :loading="isLoadingData" @click="reloadData">重新加载</a-button><a-button @click="goFrontendLayout">前台菜单与品牌</a-button></div></template>
        </admin-page-header>
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadData">
            <a-alert v-if="refreshWarning" type="warning" class="basic-config-page__notice" :closable="false">{{ refreshWarning }}<template #action><a-button :loading="isRefreshingConfig" size="small" @click="refreshConfig">重试刷新</a-button></template></a-alert>
            <fieldset :disabled="!canEdit" :inert="!canEdit ? '' : undefined" class="basic-config-page__fields">
                <a-card :bordered="false" class="pro-panel-card basic-config-page__card">
                    <div class="basic-config-page__heading"><h2>后台品牌</h2><p>用于后台界面、浏览器标签和登录页。</p></div>
                    <a-form :model="formData" layout="vertical" class="basic-config-page__form">
                        <a-form-item label="网站名称" field="name" required><a-input v-model="formData.name" placeholder="请输入网站名称" :max-length="30" allow-clear show-word-limit /></a-form-item>
                        <div class="basic-config-page__grid">
                            <a-form-item label="网站图标" field="favicon" required><div><material-picker v-model="formData.favicon" :limit="1" /><p class="basic-config-page__hint">建议 100 × 100 像素，支持 JPG、JPEG、PNG。</p></div></a-form-item>
                            <a-form-item label="网站 LOGO" field="logo" required><div><material-picker v-model="formData.logo" :limit="1" /><p class="basic-config-page__hint">建议 200 × 200 像素。</p></div></a-form-item>
                            <a-form-item label="登录页广告图" field="backdrop" required><div><material-picker v-model="formData.backdrop" :limit="1" /><p class="basic-config-page__hint">建议 400 × 400 像素。</p></div></a-form-item>
                        </div>
                    </a-form>
                </a-card>
                <a-card :bordered="false" class="pro-panel-card basic-config-page__card">
                    <div class="basic-config-page__heading"><h2>商城资料</h2><p>主站侧栏、页头与页脚在各自配置页维护。</p></div>
                    <a-form :model="formData" layout="vertical" class="basic-config-page__form">
                        <a-form-item label="商城名称" field="shopName" required><a-input v-model="formData.shopName" placeholder="请输入商城名称" :max-length="30" allow-clear show-word-limit /></a-form-item>
                        <a-form-item label="商城 LOGO" field="shopLogo" required><div><material-picker v-model="formData.shopLogo" :limit="1" /><p class="basic-config-page__hint">建议 100 × 100 像素。</p></div></a-form-item>
                    </a-form>
                </a-card>
            </fieldset>
            <template #actions><a-button v-perms="['setting:website:save']" type="primary" :loading="isSubmitting" :disabled="!canEdit || !hasUnsavedChanges" data-admin-smoke="website-information-save" @click="handleSubmit">保存配置</a-button></template>
        </config-edit-frame>
    </div>
</template>
<script setup lang="ts" name="webInformation">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import AdminPageHeader from '@/components/page-header/index.vue'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'
import ConfigEditFrame from './components/config-edit-frame.vue'
import { useConfigLoad } from './composables/use-config-load'
import { useOperateSubmit } from './composables/use-operate-submit'
import { useRouter } from 'vue-router'
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'

const router = useRouter()
const { getConfig } = useAppStore()
const formData = reactive({ name: '', favicon: '', logo: '', backdrop: '', shopName: '', shopLogo: '' })
const userStore = useUserStore()
/** 根据当前权限控制编辑与保存，脚本调用同样遵守按钮权限。 */
const canEdit = computed(() => userStore.perms.some(permission => permission === '*' || permission === 'setting:website:save'))
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('网站信息已保存')
const baselineSnapshot = ref('')
/** 按完整编辑值比较草稿，不忽略有意义的正文和空白改动。 */
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && buildSnapshot() !== baselineSnapshot.value)
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
/** 统一检查加载、权限与并发状态，读取失败后不能发布默认表单。 */
const canOperate = () => canEdit.value && hasLoadedData.value && !isLoadingData.value && !isSubmitting.value && !loadErrorMessage.value

/** 只组装本页负责的六个字段，禁止回写目录、菜单或其它运营配置。 */
const buildWebsiteBasePayload = (): Record<string, string> => ({ name: formData.name, favicon: formData.favicon, logo: formData.logo, backdrop: formData.backdrop, shopName: formData.shopName, shopLogo: formData.shopLogo })
/** 生成当前六字段快照，供离开保护和保存基线使用。 */
const buildSnapshot = () => JSON.stringify(buildWebsiteBasePayload())
/** 只在结构完整的读取结果成功后回填；失败保留编辑和基线。 */
const getData = async () => {
    if (isSubmitting.value) return false
    return loadConfiguration(async () => {
        const data = await getWebsite()
        const keys = Object.keys(formData) as (keyof typeof formData)[]
        if (!data || keys.some(key => typeof data[key] !== 'string')) throw new Error('网站基础资料响应不完整')
        keys.forEach(key => { formData[key] = data[key] as string })
        baselineSnapshot.value = buildSnapshot()
        submitError.value = ''
    })
}
const refreshWarning = ref('')
const isRefreshingConfig = ref(false)
let refreshVersion = 0
let refreshPromise: Promise<boolean> | null = null
/** 独立刷新后台展示配置，连续保存时排队读取最新版本，不改写表单或保存结果。 */
const refreshConfig = async (): Promise<boolean> => {
    refreshVersion++
    if (refreshPromise) return refreshPromise
    isRefreshingConfig.value = true
    /** 顺序处理最新刷新需求，旧请求不得覆盖新版本的刷新反馈。 */
    const drainRefresh = async () => {
        let version = 0
        let refreshed = false
        try {
            do {
                version = refreshVersion
                try { await getConfig(); refreshed = true } catch { refreshed = false }
                if (version === refreshVersion) refreshWarning.value = refreshed ? '' : '基础资料已保存，但后台展示刷新失败，可重试刷新。'
            } while (version !== refreshVersion)
            return refreshed
        } finally { isRefreshingConfig.value = false; refreshPromise = null }
    }
    refreshPromise = Promise.resolve().then(drainRefresh)
    return refreshPromise
}
/** 校验并保存本页字段；写入成功即记录提交快照，不因后续读取失败误报失败。 */
const handleSubmit = async () => {
    if (!canOperate() || !hasUnsavedChanges.value) return false
    const payload = buildWebsiteBasePayload()
    const labels: Record<string, string> = { name: '网站名称', favicon: '网站图标', logo: '网站 LOGO', backdrop: '登录页广告图', shopName: '商城名称', shopLogo: '商城 LOGO' }
    const missing = Object.keys(payload).find(key => !payload[key].trim())
    if (missing) { feedback.msgError(`请填写${labels[missing]}`); return false }
    const snapshot = JSON.stringify(payload)
    const saved = await runSubmit(async () => { await setWebsite(payload); baselineSnapshot.value = snapshot })
    if (saved) await refreshConfig()
    return saved
}
/** 跳转主站菜单与品牌配置，与后台品牌资料区分。 */
const goFrontendLayout = () => router.push('/official_site/sidebar')
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
</style>
