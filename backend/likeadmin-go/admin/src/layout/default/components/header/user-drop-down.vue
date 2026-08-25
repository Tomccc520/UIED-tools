<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <a-dropdown trigger="click" @select="handleCommand">
        <div class="user-trigger">
            <a-avatar :size="32" class="user-avatar">
                <img alt="avatar" :src="avatarUrl" />
            </a-avatar>
            <icon-down class="user-arrow" />
        </div>
        <template #content>
            <div class="user-panel-head">
                <div class="user-panel-name">{{ displayName }}</div>
                <div class="user-panel-role">{{ displayRole }}</div>
            </div>
            <a-doption value="profile">
                <a-space>
                    <icon-user />
                    <span>个人设置</span>
                </a-space>
            </a-doption>
            <a-doption value="logout">
                <a-space>
                    <icon-export />
                    <span>退出登录</span>
                </a-space>
            </a-doption>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { IconDown, IconExport, IconUser } from '@arco-design/web-vue/es/icon'
import useUserStore from '@/stores/modules/user'
import feedback from '@/utils/feedback'

const userStore = useUserStore()
const router = useRouter()

const userInfo = computed(() => userStore.userInfo || {})
const defaultAvatar =
    '//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp'

/**
 * 函数说明：统一输出头像地址，缺省时回退默认头像，保证顶部交互稳定。
 */
const avatarUrl = computed(() => {
    return String(userInfo.value.avatar || defaultAvatar)
})

/**
 * 函数说明：提取顶部用户显示名称，优先使用昵称，其次回退管理员账号。
 */
const displayName = computed(() => {
    return String(userInfo.value.nickname || userInfo.value.name || userInfo.value.account || '管理员')
})

/**
 * 函数说明：提取顶部角色文案，缺省时回退统一的管理员身份描述。
 */
const displayRole = computed(() => {
    return String(userInfo.value.role_name || userInfo.value.roleName || '超级管理员')
})

/**
 * 函数说明：处理用户下拉菜单操作，支持个人设置与退出登录。
 */
const handleCommand = async (command: string | number) => {
    switch (command) {
        case 'profile':
            router.push('/user/setting')
            break
        case 'logout':
            await feedback.confirm('确定退出登录吗？')
            userStore.logout()
            break
    }
}
</script>

<style scoped lang="scss">
.user-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0 2px 2px;
    cursor: pointer;
}

.user-avatar {
    flex-shrink: 0;
}

.user-arrow {
    color: var(--color-text-3, #86909c);
    font-size: 14px;
}

.user-panel-head {
    padding: 10px 12px 8px;
    border-bottom: 1px solid var(--color-border-2, #e5e6eb);
}

.user-panel-name {
    color: var(--color-text-1, #1d2129);
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
}

.user-panel-role {
    color: var(--color-text-3, #86909c);
    font-size: 12px;
    line-height: 16px;
    margin-top: 2px;
}
</style>
