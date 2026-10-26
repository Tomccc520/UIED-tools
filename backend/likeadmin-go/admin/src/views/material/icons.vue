<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="material-icons-page pro-page-shell">
        <admin-page-header title="图标库" description="上传 SVG 或 PNG 图标，在前台菜单和品牌入口中复用。" />
        <a-card class="material-icons-card" :bordered="false">
            <material type="image" :album-type="30" mode="page" file-size="120px" :limit="-1" :page-size="20" />
        </a-card>
    </div>
</template>

<script lang="ts" setup name="materialIconsLibrary">
import AdminPageHeader from '@/components/page-header/index.vue'
</script>

<style lang="scss" scoped>
.material-icons-page { min-width: 0; padding: 20px 24px; }
.material-icons-card { border: 1px solid var(--uied-admin-border); border-radius: var(--uied-admin-radius); }
:deep(.material) { min-height: 480px; }
@media (max-width: 768px) {
    .material-icons-page { padding: 16px 12px; }
    :deep(.arco-card-body) { padding: 12px; }
    :deep(.material-loading-wrap), :deep(.material), :deep(.arco-spin-children) { height: auto; min-height: 0; }
}
</style>
