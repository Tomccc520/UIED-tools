<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-02
 */
-->
<template>
    <popup
        ref="popupRef"
        title="用户详情"
        width="980px"
        :confirm-button-text="false"
        :cancel-button-text="false"
        :click-modal-close="true"
        @close="handlePopupClose"
    >
        <a-alert v-if="detailError" type="error" :closable="false" class="mb-4" role="alert">
            {{ detailError }}
            <template #action>
                <a-button :disabled="detailLoading || editLoading" @click="retryDetails">重试</a-button>
            </template>
        </a-alert>
        <a-spin :loading="detailLoading || editLoading" :tip="editLoading ? '正在保存用户资料...' : '正在加载用户详情...'">
            <a-card :key="currentUserId" class="!border-none pro-card" :bordered="false">
                <div class="font-medium mb-6">基本资料</div>

                <div class="detail-avatar-card">
                    <div class="detail-avatar-title">用户头像</div>
                    <a-avatar :size="58">
                        <img :src="detailAvatarUrl" alt="avatar" @error="handleAvatarLoadError" />
                    </a-avatar>
                </div>

                <div class="detail-grid">
                    <div class="detail-row">
                        <div class="detail-label">用户编号：</div>
                        <div class="detail-value">{{ formData.sn || '-' }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">用户昵称：</div>
                        <div class="detail-value">{{ formData.nickname || '-' }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">账号：</div>
                        <div class="detail-value">
                            {{ formData.username || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                :limit="32"
                                @confirm="handleEdit($event, 'username')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">
                                    <template #icon>
                                        <icon-edit />
                                    </template>
                                </a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">真实姓名：</div>
                        <div class="detail-value">
                            {{ formData.realName || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                :limit="32"
                                @confirm="handleEdit($event, 'realName')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">
                                    <template #icon>
                                        <icon-edit />
                                    </template>
                                </a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">性别：</div>
                        <div class="detail-value">
                            {{ formData.sex || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                type="select"
                                :options="sexOptions"
                                @confirm="handleEdit($event, 'sex')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">
                                    <template #icon>
                                        <icon-edit />
                                    </template>
                                </a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">联系电话：</div>
                        <div class="detail-value">
                            {{ formData.mobile || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                type="number"
                                @confirm="handleEdit($event, 'mobile')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">
                                    <template #icon>
                                        <icon-edit />
                                    </template>
                                </a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">会员等级：</div>
                        <div class="detail-value">
                            {{ formData.memberLevel || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                type="select"
                                :options="memberLevelOptions"
                                @confirm="handleEdit($event, 'memberLevel')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">
                                    <template #icon>
                                        <icon-edit />
                                    </template>
                                </a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">会员到期：</div>
                        <div class="detail-value">
                            {{ formData.memberExpireTime || '-' }}
                            <popover-input
                                :disabled="!canEditUser"
                                class="ml-[10px]"
                                type="number"
                                @confirm="handleEdit($event, 'memberExpireDays')"
                            >
                                <a-button type="text" :disabled="!canEditUser" v-perms="['user:edit']">设置天数</a-button>
                            </popover-input>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">积分余额：</div>
                        <div class="detail-value">{{ formData.pointsBalance ?? 0 }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">注册来源：</div>
                        <div class="detail-value">{{ formData.channel || '-' }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">注册时间：</div>
                        <div class="detail-value">{{ formData.createTime || '-' }}</div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-label">最近登录时间：</div>
                        <div class="detail-value">{{ formData.lastLoginTime || '-' }}</div>
                    </div>
                </div>
            </a-card>
        </a-spin>
    </popup>
</template>

<script lang="ts" setup name="consumerDetailPopup">
import { IconEdit } from '@arco-design/web-vue/es/icon'
import Popup from '@/components/popup/index.vue'
import { getUserDetail, userEdit } from '@/api/consumer'
import feedback from '@/utils/feedback'
import defaultAvatar from '@/views/decoration/component/widgets/user-info/images/default_avatar.png'

const emit = defineEmits<{
    (event: 'close'): void
}>()

const popupRef = shallowRef<InstanceType<typeof Popup>>()
const detailLoading = ref(false)
const detailError = ref('')
const editLoading = ref(false)
const currentUserId = ref<string>('')
const loadedUserId = ref('')
let detailRequestSerial = 0

/** 创建空用户资料；切换用户时清理上一用户内容，不复用其字段或编辑弹层。 */
const createEmptyUserDetail = () => ({
    avatar: '',
    channel: '',
    createTime: '',
    lastLoginIp: '',
    lastLoginTime: '',
    memberExpireTime: '',
    memberExpireTimestamp: 0,
    memberLevel: '',
    memberLevelValue: '',
    mobile: '',
    nickname: '',
    pointsBalance: 0,
    realName: '',
    sex: '',
    sn: '',
    username: ''
})
const formData = reactive(createEmptyUserDetail())

/** 只允许编辑已成功读取的当前用户，加载、失败和保存期间均禁止提交。 */
const canEditUser = computed(() => Boolean(
    currentUserId.value && loadedUserId.value === currentUserId.value &&
    !detailLoading.value && !detailError.value && !editLoading.value
))

const sexOptions = ref([
    {
        label: '未知',
        value: 0
    },
    {
        label: '男',
        value: 1
    },
    {
        label: '女',
        value: 2
    }
])

const memberLevelOptions = ref([
    {
        label: '普通用户',
        value: 'free'
    },
    {
        label: 'VIP会员',
        value: 'vip'
    }
])

/**
 * 函数说明：详情头像统一做默认兜底，保证弹窗内不会出现空头像。
 */
const detailAvatarUrl = computed(() => {
    const avatarUrl = String(formData.avatar || '').trim()
    return avatarUrl || defaultAvatar
})

/**
 * 函数说明：头像加载失败时强制回落默认头像，避免破图影响运营查看。
 */
const handleAvatarLoadError = (event: Event) => {
    const target = event.target as HTMLImageElement | null
    if (!target) {
        return
    }
    if (target.dataset.fallbackApplied === '1') {
        return
    }
    target.dataset.fallbackApplied = '1'
    target.src = defaultAvatar
}

/**
 * 函数说明：按用户 ID 读取详情，只接收当前请求与当前用户的完整响应，返回读取是否成功。
 */
const getDetails = async (userId: string) => {
    if (!userId || userId !== currentUserId.value) {
        return false
    }
    const serial = ++detailRequestSerial
    detailLoading.value = true
    detailError.value = ''
    loadedUserId.value = ''
    try {
        const data = await getUserDetail({ id: userId })
        if (serial !== detailRequestSerial || userId !== currentUserId.value) return false
        if (!data || typeof data !== 'object' || Array.isArray(data) || String(data.id) !== userId)
            throw new Error('invalid user detail response')
        Object.assign(formData, Object.fromEntries(
            Object.entries(createEmptyUserDetail()).map(([key, fallback]) => [key, data[key] ?? fallback])
        ))
        loadedUserId.value = userId
        return true
    } catch (error) {
        if (serial !== detailRequestSerial || userId !== currentUserId.value) return false
        detailError.value = '用户详情加载失败，请重试后再编辑。'
        if (!(error as { notified?: boolean })?.notified) feedback.msgError(detailError.value)
        return false
    } finally {
        if (serial === detailRequestSerial) detailLoading.value = false
    }
}

/** 重试当前用户详情；保存进行中不发起额外读取或替换表单。 */
const retryDetails = () => {
    if (detailLoading.value || editLoading.value) return
    return getDetails(currentUserId.value)
}

/**
 * 函数说明：固定当前用户 ID 提交单字段，阻止重复写入；只有仍停留在该用户时才重新读取。
 */
const handleEdit = async (value: string | number, field: string) => {
    if (!canEditUser.value || value === undefined || value === null || String(value) === '') {
        return false
    }
    const userId = currentUserId.value
    editLoading.value = true
    try {
        await userEdit({
            id: userId,
            field,
            value
        })
        feedback.msgSuccess('编辑成功')
        if (currentUserId.value === userId) await getDetails(userId)
        return true
    } catch (error) {
        if (!(error as { notified?: boolean })?.notified) feedback.msgError('编辑失败，请稍后重试')
        return false
    } finally {
        editLoading.value = false
    }
}

/**
 * 函数说明：对外暴露打开弹窗能力，支持列表页按 ID 直接拉起详情。
 */
const open = async (id: string | number) => {
    const userId = String(id || '').trim()
    if (!userId) return false
    if (editLoading.value && currentUserId.value === userId) return false
    if (currentUserId.value !== userId) {
        Object.assign(formData, createEmptyUserDetail())
        loadedUserId.value = ''
    }
    currentUserId.value = userId
    popupRef.value?.open()
    return getDetails(userId)
}

/** 清理当前用户及加载状态，使关闭或卸载后的详情响应失效。 */
const invalidateDetails = () => {
    detailRequestSerial++
    currentUserId.value = ''
    loadedUserId.value = ''
    detailLoading.value = false
    detailError.value = ''
}

/** 接收弹窗关闭事件，清理详情并通知外层列表同步路由。 */
const handlePopupClose = () => {
    invalidateDetails()
    emit('close')
}

/**
 * 函数说明：对外暴露关闭弹窗方法，便于外层统一控制。
 */
const close = () => {
    invalidateDetails()
    popupRef.value?.close()
}

defineExpose({
    open,
    close
})
</script>

<style lang="scss" scoped>
.pro-card {
    border-radius: 12px;
}

.detail-avatar-card {
    padding: 20px 24px;
    margin-bottom: 24px;
    border-radius: 12px;
    background: var(--color-fill-1, #f7f8fa);
}

.detail-avatar-title {
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--color-text-3, #86909c);
}

.detail-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.detail-row {
    display: flex;
    align-items: flex-start;
}

.detail-label {
    width: 120px;
    color: var(--color-text-3);
    flex-shrink: 0;
}

.detail-value {
    display: flex;
    align-items: center;
    min-height: 24px;
}
</style>
