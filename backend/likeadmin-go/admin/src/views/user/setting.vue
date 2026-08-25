<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <div class="user-setting-pro">
        <a-card class="profile-header" :bordered="false">
            <div class="profile-header__content">
                <div>
                    <a-typography-title :heading="5" class="!mb-1">个人设置</a-typography-title>
                    <a-typography-text type="secondary">
                        管理你的头像、昵称与登录密码，保存后将同步到当前账号。
                    </a-typography-text>
                </div>
                <a-space>
                    <a-button @click="resetPasswordFields">清空密码项</a-button>
                    <a-button type="primary" :loading="submitting" @click="handleSubmit"
                        >保存更改</a-button
                    >
                </a-space>
            </div>
        </a-card>

        <a-grid :cols="{ xs: 1, lg: 24 }" :col-gap="16" :row-gap="16">
            <a-grid-item :span="{ xs: 1, lg: 16 }">
                <a-space direction="vertical" fill :size="16">
                    <a-card title="基础资料" :bordered="false">
                        <a-form :model="formData" layout="vertical">
                            <a-form-item label="头像">
                                <material-picker v-model="formData.avatar" :limit="1" />
                            </a-form-item>

                            <a-grid :cols="{ xs: 1, md: 2 }" :col-gap="12">
                                <a-grid-item>
                                    <a-form-item label="账号">
                                        <a-input v-model="formData.username" disabled />
                                    </a-form-item>
                                </a-grid-item>
                                <a-grid-item>
                                    <a-form-item label="名称">
                                        <a-input
                                            v-model="formData.nickname"
                                            placeholder="请输入名称"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-grid-item>
                            </a-grid>
                        </a-form>
                    </a-card>

                    <a-card title="安全设置" :bordered="false">
                        <a-alert
                            class="mb-4"
                            type="warning"
                            show-icon
                            :closable="false"
                            content="仅在需要修改密码时填写下方三项；如不修改密码，请保持为空。"
                        />
                        <a-form :model="formData" layout="vertical">
                            <a-grid :cols="{ xs: 1, md: 3 }" :col-gap="12">
                                <a-grid-item>
                                    <a-form-item label="当前密码">
                                        <a-input-password
                                            v-model="formData.currPassword"
                                            placeholder="请输入当前密码"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-grid-item>
                                <a-grid-item>
                                    <a-form-item label="新密码">
                                        <a-input-password
                                            v-model="formData.password"
                                            placeholder="请输入新密码"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-grid-item>
                                <a-grid-item>
                                    <a-form-item label="确认新密码">
                                        <a-input-password
                                            v-model="formData.passwordConfirm"
                                            placeholder="请再次输入新密码"
                                            allow-clear
                                        />
                                    </a-form-item>
                                </a-grid-item>
                            </a-grid>
                        </a-form>
                    </a-card>
                </a-space>
            </a-grid-item>

            <a-grid-item :span="{ xs: 1, lg: 8 }">
                <a-card title="账户概览" :bordered="false" class="profile-side-card">
                    <div class="profile-side-card__user">
                        <a-avatar :size="72" :image-url="formData.avatar || userInfo.avatar" />
                        <div class="profile-side-card__meta">
                            <a-typography-title :heading="6" class="!mb-0">
                                {{ formData.nickname || userInfo.nickname || '未设置昵称' }}
                            </a-typography-title>
                            <a-typography-text type="secondary">
                                {{ formData.username || userInfo.username || '-' }}
                            </a-typography-text>
                        </div>
                    </div>

                    <a-descriptions :column="1" :label-style="{ width: '92px' }" size="large">
                        <a-descriptions-item label="角色">
                            {{ userRoleText }}
                        </a-descriptions-item>
                        <a-descriptions-item label="邮箱">
                            {{ userInfo.email || '-' }}
                        </a-descriptions-item>
                        <a-descriptions-item label="手机">
                            {{ userInfo.mobile || '-' }}
                        </a-descriptions-item>
                    </a-descriptions>
                </a-card>
            </a-grid-item>
        </a-grid>
    </div>
</template>

<script setup lang="ts" name="userSetting">
import { setUserInfo } from '@/api/user'
import { PageEnum } from '@/enums/pageEnum'
import router from '@/router'
import useUserStore from '@/stores/modules/user'
import { clearAuthInfo } from '@/utils/auth'
import feedback from '@/utils/feedback'

const userStore = useUserStore()
const submitting = ref(false)
const userInfo = computed(() => userStore.userInfo || {})
const userRoleText = computed(() => {
    const roleList = userInfo.value?.roles
    if (Array.isArray(roleList) && roleList.length) {
        return roleList
            .map((item: any) => item.roleName || item.name)
            .filter(Boolean)
            .join('、')
    }
    return userInfo.value?.roleName || '-'
})

const formData = reactive({
    avatar: '',
    username: '',
    nickname: '',
    currPassword: '',
    password: '',
    passwordConfirm: ''
})

/**
 * 函数说明：读取当前登录用户信息并回填个人资料表单
 */
const getUser = async () => {
    const userInfo = userStore.userInfo || {}
    formData.avatar = userInfo.avatar || ''
    formData.username = userInfo.username || ''
    formData.nickname = userInfo.nickname || ''
    formData.currPassword = ''
    formData.password = ''
    formData.passwordConfirm = ''
}

/**
 * 函数说明：仅清理密码相关输入，便于用户快速撤销密码修改操作。
 */
const resetPasswordFields = () => {
    formData.currPassword = ''
    formData.password = ''
    formData.passwordConfirm = ''
}

/**
 * 函数说明：密码修改成功后执行重新登录流程；若退出接口异常，则本地清理登录态并强制跳转登录页。
 */
const redirectToLoginAfterPasswordChanged = async () => {
    try {
        await userStore.logout()
    } catch {
        userStore.resetState()
        clearAuthInfo()
        await router.replace(PageEnum.LOGIN)
    }
}

/**
 * 函数说明：校验个人资料提交参数，避免密码字段组合错误
 */
const validateFormData = (): boolean => {
    if (!formData.avatar) {
        feedback.msgError('头像不能为空')
        return false
    }
    if (!String(formData.nickname || '').trim()) {
        feedback.msgError('请输入名称')
        return false
    }
    if (formData.password && !formData.currPassword) {
        feedback.msgError('请输入当前密码')
        return false
    }
    if (formData.currPassword && !formData.password) {
        feedback.msgError('请输入新的密码')
        return false
    }
    if (formData.password && !formData.passwordConfirm) {
        feedback.msgError('请再次输入密码')
        return false
    }
    if (formData.password && formData.passwordConfirm !== formData.password) {
        feedback.msgError('两次输入密码不一致!')
        return false
    }
    return true
}

/**
 * 函数说明：提交个人资料并刷新用户信息缓存
 */
const setUser = async () => {
    const passwordChanged = Boolean(String(formData.password || '').trim())
    const result = await setUserInfo(formData)
    if (passwordChanged) {
        if (!result?.passwordChanged) {
            feedback.msgError('服务端未确认密码已修改，请刷新页面后重试')
            return
        }
        feedback.alertSuccess('密码修改成功，请使用新密码重新登录，系统将跳转登录页。')
        resetPasswordFields()
        await redirectToLoginAfterPasswordChanged()
        return
    }
    feedback.msgSuccess('保存成功')
    await userStore.getUserInfo()
    resetPasswordFields()
}

/**
 * 函数说明：提交入口，先校验再调用保存
 */
const handleSubmit = async () => {
    if (!validateFormData()) {
        return
    }
    try {
        submitting.value = true
        await setUser()
    } finally {
        submitting.value = false
    }
}

getUser()
</script>

<style lang="scss" scoped>
.user-setting-pro {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.profile-header {
    .profile-header__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }
}

.profile-side-card {
    .profile-side-card__user {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
    }

    .profile-side-card__meta {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
}
</style>
