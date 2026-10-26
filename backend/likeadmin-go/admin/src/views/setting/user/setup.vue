<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="user-setup pro-page-shell">
        <admin-page-header title="用户默认头像" description="设置新注册用户的默认头像。" />
        <config-edit-frame :loading="isLoadingData" :ready="hasLoadedData" :error="loadErrorMessage" :save-error="submitError" :dirty="hasUnsavedChanges" :saving="isSubmitting" :saved-at="lastSavedAt" @retry="reloadUserSetup">
        <a-card class="!border-none" :bordered="false">
            <div class="font-medium mb-6">基本设置</div>
            <a-form :model="formData" layout="vertical">
                <a-form-item label="用户默认头像">
                    <material-picker v-model="formData.defaultAvatar" :limit="1" />
                </a-form-item>
                <a-form-item>
                    <div class="form-tips">
                        用户注册时给的默认头像，建议尺寸：400*400像素，支持jpg，jpeg，png格式
                    </div>
                </a-form-item>
            </a-form>
        </a-card>

        <template #actions>
            <a-button v-perms="['setting:user:save']" type="primary" :loading="isSubmitting" @click="handleSubmit">保存配置</a-button>
        </template>
        </config-edit-frame>
    </div>
</template>

<script lang="ts" setup name="userSetup">
import { getUserSetup, setUserSetup } from '@/api/setting/user'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave } from 'vue-router'
import AdminPageHeader from '@/components/page-header/index.vue'
import ConfigEditFrame from '@/components/config-edit-frame/index.vue'
import { useConfigLoad } from '@/composables/use-config-load'
import { useOperateSubmit } from '@/composables/use-operate-submit'

const formData = reactive({
    defaultAvatar: ''
})
const baselineSnapshot = ref('')
/** 从已确认的头像配置判断草稿变化，首次加载失败不把空头像视为已保存数据。 */
const hasUnsavedChanges = computed(() => Boolean(baselineSnapshot.value) && JSON.stringify(formData) !== baselineSnapshot.value)
const { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration } = useConfigLoad(hasUnsavedChanges)
const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit('用户默认头像已保存')

/**
 * 函数说明：获取用户基础设置并回填表单
 */
const getData = async () => loadConfiguration(async () => {
        const data = await getUserSetup()
        formData.defaultAvatar = data.defaultAvatar || ''
        baselineSnapshot.value = JSON.stringify(formData)
})

/** 重试读取前确认是否放弃头像草稿，失败时不报告成功。 */
const reloadUserSetup = async () => {
    if (isSubmitting.value) return false
    return reloadConfiguration(getData)
}

/**
 * 函数说明：保存用户基础设置
 */
const handleSubmit = async () => {
    if (isLoadingData.value || !hasLoadedData.value || loadErrorMessage.value || isSubmitting.value) return
    const payload = { defaultAvatar: formData.defaultAvatar }
    await runSubmit(async () => {
        await setUserSetup(payload)
        baselineSnapshot.value = JSON.stringify(payload)
    })
}

/** 离开页面前保护尚未保存的默认头像。 */
onBeforeRouteLeave(async () => {
    if (isSubmitting.value) return false
    if (!hasUnsavedChanges.value) return true
    try { await feedback.confirm('默认头像尚未保存，确定离开吗？'); return true } catch { return false }
})
void getData()
</script>

<style lang="scss" scoped></style>
