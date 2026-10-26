<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
  <a-collapse
    :active-key="activeKeys"
    @update:active-key="$emit('update:activeKeys', $event)"
    class="catalog-health-collapse mt-4"
    :bordered="false"
    data-admin-smoke="tools-catalog-health-summary"
  >
    <a-collapse-item key="member-core-health">
      <template #header>
        <div class="catalog-health-collapse__header">
          <span>20 个会员核心工具体检</span>
          <a-tag :color="warnings.length > 0 ? 'orange' : 'green'" bordered>
            {{ warnings.length > 0 ? `待完善 ${warnings.length}` : "已通过" }}
          </a-tag>
        </div>
      </template>
      <section class="member-core-health">
        <div class="member-core-health__head">
          <div>
            <div class="member-core-health__title">{{ summary.title }}</div>
            <div class="member-core-health__desc">{{ summary.desc }}</div>
          </div>
        </div>
        <div class="member-core-health__grid">
          <div
            v-for="item in metrics"
            :key="item.key"
            class="member-core-health__metric"
            :class="item.className"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <p>{{ item.desc }}</p>
          </div>
        </div>
        <div v-if="warnings.length > 0" class="member-core-health__warnings">
          <div class="member-core-health__warnings-title">待补配置</div>
          <div class="member-core-health__warning-list">
            <a-tag
              v-for="warning in warnings"
              :key="warning"
              color="orange"
              bordered
            >
              {{ warning }}
            </a-tag>
          </div>
        </div>
      </section>
    </a-collapse-item>
  </a-collapse>
</template>
<script setup lang="ts">
defineProps<{
  activeKeys: (string | number)[];
  summary: { title: string; desc: string };
  metrics: {
    key: string;
    label: string;
    value: string | number;
    desc: string;
    className: string;
  }[];
  warnings: string[];
}>();
defineEmits<{
  (event: "update:activeKeys", value: (string | number)[]): void;
}>();
</script>
<style scoped lang="scss">
.catalog-health-collapse {
  border: 1px solid var(--uied-admin-border);
  border-radius: var(--uied-admin-radius);
  overflow: hidden;
}
.catalog-health-collapse :deep(.arco-collapse-item-header) {
  min-height: 44px;
  padding: 8px 12px;
  background: var(--color-fill-1);
}
.catalog-health-collapse__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  font-weight: 600;
}
.member-core-health__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1);
}
.member-core-health__desc,
.member-core-health__metric p {
  color: var(--color-text-3);
  font-size: 12px;
  line-height: 1.7;
  margin: 4px 0 0;
}
.member-core-health__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}
.member-core-health__metric {
  padding: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-bg-2);
}
.member-core-health__metric span {
  font-size: 12px;
  color: var(--color-text-3);
}
.member-core-health__metric strong {
  display: block;
  margin-top: 8px;
  font-size: 20px;
}
.member-core-health__metric.is-ok strong {
  color: rgb(var(--success-6));
}
.member-core-health__metric.is-warning strong {
  color: rgb(var(--warning-6));
}
.member-core-health__warnings {
  margin-top: 16px;
}
.member-core-health__warnings-title {
  font-size: 12px;
  color: var(--color-text-2);
}
.member-core-health__warning-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
@media (max-width: 900px) {
  .member-core-health__grid {
    grid-template-columns: 1fr;
  }
}
</style>
