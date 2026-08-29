<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="pro-page">
        <a-page-header
            class="pro-page-header"
            title="用户列表"
            subtitle="支持按注册来源与注册时间筛选，快速定位用户数据。"
        >
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>总用户 {{ pager.count }}</a-tag>
                    <a-tag color="green" bordered>当前页 {{ pager.lists.length }}</a-tag>
                    <a-button data-admin-smoke="consumer-user-refresh" @click="handleRefresh">刷新</a-button>
                    <a-button data-admin-smoke="consumer-user-reset-header" @click="handleResetFilters">
                        重置筛选
                    </a-button>
                </a-space>
            </template>
        </a-page-header>
        <a-space direction="vertical" fill :size="16">
            <a-card class="!border-none pro-card" :bordered="false">
                <a-form class="mb-[-16px]" :model="queryParams" layout="inline">
                    <a-form-item label="用户信息">
                        <a-input
                            v-model="queryParams.keyword"
                            class="w-[280px]"
                            placeholder="用户编号/昵称/手机号码"
                            allow-clear
                            @press-enter="resetPage"
                            @clear="resetPage"
                        />
                    </a-form-item>

                    <a-form-item label="注册时间">
                        <daterange-picker
                            v-model:startTime="queryParams.startTime"
                            v-model:endTime="queryParams.endTime"
                        />
                    </a-form-item>

                    <a-form-item label="注册来源">
                        <a-select v-model="queryParams.channel" class="w-[280px]" allow-clear>
                            <a-option
                                v-for="item in clientOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </a-select>
                    </a-form-item>

                    <a-form-item>
                        <a-button data-admin-smoke="consumer-user-query" type="primary" @click="handleSearch">
                            查询
                        </a-button>
                        <a-button
                            data-admin-smoke="consumer-user-reset"
                            class="ml-2"
                            @click="handleResetFilters"
                        >
                            重置
                        </a-button>
                    </a-form-item>
                </a-form>
                <div class="filter-result">
                    筛选条件：{{ activeFilterCount }} 项 | 当前加载 {{ pager.lists.length }} 条
                </div>
            </a-card>

            <a-card class="!border-none pro-card" :bordered="false">
                <a-table
                    :data="pager.lists"
                    :loading="pager.loading"
                    :pagination="false"
                    :bordered="false"
                    :columns="userColumns"
                    row-key="id"
                >
                    <template #avatar="{ record }">
                        <a-avatar :size="50">
                            <img
                                :src="resolveUserAvatar(record.avatar)"
                                alt="avatar"
                                @error="handleAvatarLoadError"
                            />
                        </a-avatar>
                    </template>
                    <template #action="{ record }">
                        <a-button
                            v-perms="['user:detail']"
                            type="text"
                            @click="openDetail(record.id)"
                            >详情</a-button
                        >
                    </template>
                </a-table>
                <a-empty
                    v-if="!pager.loading && pager.lists.length === 0"
                    description="暂无用户数据"
                />

                <div class="flex justify-end mt-4">
                    <pagination v-model="pager" @change="getLists" />
                </div>
            </a-card>
        </a-space>
        <detail-popup v-if="showDetailPopup" ref="detailRef" @close="handleDetailClose" />
    </div>
</template>

<script lang="ts" setup name="consumerLists">
import type { TableColumnData } from '@arco-design/web-vue'
import { getUserList } from '@/api/consumer'
import { ClientMap } from '@/enums/appEnums'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import defaultAvatar from '@/views/decoration/component/widgets/user-info/images/default_avatar.png'
import DetailPopup from './detail-popup.vue'

const queryParams = reactive({
    keyword: '',
    channel: '',
    startTime: '',
    endTime: ''
})
const route = useRoute()
const router = useRouter()
const showDetailPopup = ref(false)
const detailRef = shallowRef<InstanceType<typeof DetailPopup>>()

/**
 * 函数说明：标准化详情 ID 入参，避免路由 query 为空或数组时出现异常。
 */
const normalizeDetailId = (value: unknown): string => {
    if (Array.isArray(value)) {
        return String(value[0] || '').trim()
    }
    return String(value || '').trim()
}

/**
 * 函数说明：将注册来源映射转换为可渲染的下拉选项列表
 */
const clientOptions = computed(() => {
    return Object.entries(ClientMap as Record<string, string>).map(([value, label]) => ({
        value,
        label
    }))
})
const activeFilterCount = computed(() => {
    return [
        queryParams.keyword,
        queryParams.channel,
        queryParams.startTime,
        queryParams.endTime
    ].reduce((count, value) => count + (String(value || '').trim() ? 1 : 0), 0)
})

/**
 * 函数说明：统一解析用户头像地址，头像为空时回退到内置默认头像，避免请求无效静态地址。
 */
const resolveUserAvatar = (avatar?: string): string => {
    const avatarUrl = String(avatar || '').trim()
    return avatarUrl || defaultAvatar
}

/**
 * 函数说明：头像加载失败时兜底为本地默认头像，避免列表出现破图。
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
 * 函数说明：用户列表表格列定义，统一使用 Arco columns 渲染，避免列插槽失效导致空表。
 */
const userColumns: TableColumnData[] = [
    { title: '用户编号', dataIndex: 'sn', width: 120 },
    { title: '头像', dataIndex: 'avatar', width: 100, slotName: 'avatar' },
    { title: '昵称', dataIndex: 'nickname', width: 140, ellipsis: true, tooltip: true },
    { title: '账号', dataIndex: 'username', width: 160, ellipsis: true, tooltip: true },
    { title: '会员等级', dataIndex: 'memberLevel', width: 120 },
    { title: '会员到期', dataIndex: 'memberExpireTime', width: 180 },
    { title: '积分余额', dataIndex: 'pointsBalance', width: 120 },
    { title: '手机号码', dataIndex: 'mobile', width: 140 },
    { title: '性别', dataIndex: 'sex', width: 100 },
    { title: '注册来源', dataIndex: 'channel', width: 140 },
    { title: '注册时间', dataIndex: 'createTime', width: 180 },
    { title: '操作', dataIndex: 'action', width: 100, slotName: 'action', fixed: 'right' }
]

/**
 * 函数说明：初始化用户列表分页查询，保持原接口参数不变
 */
const { pager, getLists, resetPage, resetParams } = usePaging({
    fetchFun: getUserList,
    params: queryParams
})

/**
 * 函数说明：执行用户列表查询并反馈当前筛选结果。
 */
const handleSearch = async () => {
    await resetPage()
    feedback.msgSuccess('查询条件已生效')
}

/**
 * 函数说明：重置用户筛选条件并刷新列表。
 */
const handleResetFilters = async () => {
    await resetParams()
    feedback.msgSuccess('筛选条件已重置')
}

/**
 * 函数说明：刷新用户列表，保持现有筛选条件不变。
 */
const handleRefresh = async () => {
    await getLists()
    feedback.msgSuccess('用户列表已刷新')
}

/**
 * 函数说明：打开用户详情弹窗并同步当前路由查询参数，便于刷新后保持详情态。
 */
const openDetail = async (userId: string | number) => {
    const detailId = normalizeDetailId(userId)
    if (!detailId) {
        return
    }
    if (normalizeDetailId(route.query.detailId) !== detailId) {
        await router.replace({
            path: route.path,
            query: {
                ...route.query,
                detailId
            }
        })
    }
    showDetailPopup.value = true
    await nextTick()
    await detailRef.value?.open(detailId)
}

/**
 * 函数说明：关闭详情弹窗时清理路由中的 detailId，避免列表刷新后重复打开。
 */
const handleDetailClose = async () => {
    showDetailPopup.value = false
    if (!route.query.detailId) {
        return
    }
    const nextQuery = {
        ...route.query
    }
    delete nextQuery.detailId
    await router.replace({
        path: route.path,
        query: nextQuery
    })
}

/**
 * 函数说明：当路由携带 detailId 时自动拉起详情弹窗，兼容旧链接与回跳场景。
 */
const syncDetailPopupByRoute = async () => {
    const detailId = normalizeDetailId(route.query.detailId)
    if (!detailId) {
        return
    }
    showDetailPopup.value = true
    await nextTick()
    await detailRef.value?.open(detailId)
}

onActivated(() => {
    getLists()
    syncDetailPopupByRoute()
})

watch(
    () => route.query.detailId,
    () => {
        syncDetailPopupByRoute()
    },
    { immediate: true }
)

getLists()
</script>

<style lang="scss" scoped>
.pro-page {
    display: flex;
    flex-direction: column;
}

.pro-page-header {
    padding: 0 0 10px;
}

.pro-card {
    border-radius: 12px;
}

.filter-result {
    margin-top: 10px;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}
</style>
