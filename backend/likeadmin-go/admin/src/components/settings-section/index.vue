<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
  <section class="settings-section">
    <header class="settings-section__header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="settings-section__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>
<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>
<style scoped lang="scss">
.settings-section {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--uied-admin-border);
  border-radius: var(--uied-admin-radius);
  background: var(--color-bg-2);
}
.settings-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.settings-section h2 {
  margin: 0;
  color: var(--color-text-1);
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
}
.settings-section p {
  margin: 6px 0 0;
  color: var(--color-text-3);
  font-size: 13px;
  line-height: 1.7;
}
.settings-section__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
@media (max-width: 600px) {
  .settings-section {
    padding: 16px;
  }
  .settings-section__actions {
    width: 100%;
  }
  .settings-section__actions :deep(button) {
    min-height: 44px;
  }
}
</style>
