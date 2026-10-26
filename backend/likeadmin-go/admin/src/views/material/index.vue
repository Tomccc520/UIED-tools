<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="material-index pro-page-shell">
        <admin-page-header title="素材中心" description="上传和管理图片、视频，按分组查找素材并编辑附件详情。" />
        <a-card class="material-main-card" :bordered="false">
            <a-tabs v-model:active-key="activeTab" destroy-on-hide lazy-load>
                <a-tab-pane v-for="item in tabsMap" :key="item.type" :title="item.name">
                    <material :type="item.type" mode="page" file-size="120px" :limit="-1" :page-size="20" />
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script lang="ts" setup name="materialCenter">
import AdminPageHeader from '@/components/page-header/index.vue'
const tabsMap = [{ type: 'image', name: '图片' }, { type: 'video', name: '视频' }]
const activeTab = ref('image')
</script>

<style lang="scss" scoped>
.material-index { min-width: 0; padding: 20px 24px; }
.material-main-card { border: 1px solid var(--uied-admin-border); border-radius: var(--uied-admin-radius); }
:deep(.material) { min-height: 480px; }
:deep(.arco-tabs-tab) { min-height: 44px; }
@media (max-width: 768px) {
    .material-index { padding: 16px 12px; }
    :deep(.arco-card-body) { padding: 12px; }
    :deep(.material-loading-wrap), :deep(.material), :deep(.arco-spin-children) { height: auto; min-height: 0; }
}
</style>
