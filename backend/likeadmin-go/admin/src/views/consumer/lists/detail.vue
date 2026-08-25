<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-02
 */
-->
<template>
    <div class="detail-redirect-page">
        <a-spin :loading="true" tip="正在跳转到弹窗详情..." />
    </div>
</template>

<script lang="ts" setup name="consumerDetailRedirect">
import { getRoutePath } from '@/router'

const route = useRoute()
const router = useRouter()

/**
 * 函数说明：兼容历史详情页链接，统一回跳到列表页并透传 detailId，用于拉起详情弹窗。
 */
const redirectToListPopup = async () => {
    const fallbackPath = '/consumer/lists'
    const listPath = getRoutePath('user:list') || fallbackPath
    const detailId = String(route.query.id || '').trim()
    const nextQuery = {
        ...route.query
    } as Record<string, any>
    delete nextQuery.id
    if (detailId) {
        nextQuery.detailId = detailId
    }
    await router.replace({
        path: listPath,
        query: nextQuery
    })
}

redirectToListPopup()
</script>

<style lang="scss" scoped>
.detail-redirect-page {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
