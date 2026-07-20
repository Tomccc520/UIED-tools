<!--
 * @file MemberCoreToolTips.vue
 * @description 会员核心工具页内体验提示，统一展示结果质量、失败兜底和会员价值说明
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
-->

<template>
  <section class="member-core-tool-tips" :data-member-core-tool-key="toolKey">
    <div class="member-core-tool-tips__head">
      <span class="member-core-tool-tips__eyebrow">{{ eyebrow || '会员核心体验' }}</span>
      <strong>{{ title }}</strong>
    </div>
    <div class="member-core-tool-tips__grid">
      <div v-for="item in normalizedItems" :key="item.label" class="member-core-tool-tips__item">
        <span>{{ item.label }}</span>
        <p>{{ item.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MemberCoreTipItem {
  label: string
  text: string
}

const props = defineProps<{
  toolKey: string
  title?: string
  eyebrow?: string
  items: MemberCoreTipItem[]
}>()

/**
 * 函数说明：过滤空提示项，避免页面出现无内容的会员核心体验卡片。
 */
const normalizedItems = computed(() => {
  return props.items.filter((item) => String(item.label || '').trim() && String(item.text || '').trim())
})
</script>

<style scoped>
.member-core-tool-tips {
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
  padding: 14px;
}

.member-core-tool-tips__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #111827;
  font-size: 14px;
}

.member-core-tool-tips__eyebrow {
  border-radius: 6px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 6px 8px;
}

.member-core-tool-tips__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.member-core-tool-tips__item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
}

.member-core-tool-tips__item span {
  display: block;
  color: #111827;
  font-size: 12px;
  font-weight: 700;
}

.member-core-tool-tips__item p {
  margin: 5px 0 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .member-core-tool-tips__grid {
    grid-template-columns: 1fr;
  }
}
</style>
