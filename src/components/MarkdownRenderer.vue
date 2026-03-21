<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="vuepress-markdown-body">
    <v-md-preview :text="content" />
  </div>
</template>

<style scoped>
.vuepress-markdown-body {
  width: 100%;
}
</style>

