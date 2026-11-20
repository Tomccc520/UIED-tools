<!--
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2024-1-9
-->

<script setup lang="ts">
import bundledLibrary from '../../../../backend/likeadmin-go/server/admin/service/common/copywriting_library/dog-diary.json'
import EditorialCopywritingTool from './EditorialCopywritingTool.vue'
</script>

<template>
  <EditorialCopywritingTool kind="dog-diary" :bundled-library="bundledLibrary" />
</template>
