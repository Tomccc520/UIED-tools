<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
  <settings-section title="分类与工具数据" description="批量调整分类、分组和工具字段。修改保留在草稿，检查后统一保存。">
    <template #actions>
      <a-tag v-if="previewCards.length > 3" bordered>
        预览前 3 / {{ previewCards.length }} 个分类
      </a-tag>
      <a-button
        type="text"
        data-admin-smoke="tools-catalog-format-json"
        @click="$emit('format')"
        >格式化</a-button
      >
      <a-button
        type="text"
        status="danger"
        data-admin-smoke="tools-catalog-clear-json"
        @click="$emit('clear')"
        >清空为 []</a-button
      >
    </template>
    <details class="catalog-json-help"><summary>数据结构说明</summary>
    <div class="form-tips mb-2">
      最小结构要求：一级分类 <code>title/list</code>、二级分类
      <code>title/list</code>、工具条目 <code>title/url</code>。 工具条目还支持
      <code>releaseDate</code
      >、<code>tags</code>、<code>isNew</code>、<code>seoTitle</code>、<code>seoKeywords</code>、<code>seoDescription</code>、<code>seoImage</code>、<code>geoSummary</code>、<code>geoQuestions</code>、
      <code>toolKey</code
      >、<code>consumePoints</code>、<code>memberFree</code>、<code>status</code>、<code>sort</code>、<code>remark</code>。
    </div>
    </details>
    <details v-if="previewCards.length" class="catalog-json-help"><summary>目录预览</summary>
    <div class="catalog-overview-grid" v-if="previewCards.length > 0">
      <div
        v-for="(item, index) in previewCards.slice(0, 3)"
        :key="`catalog-overview-${index}`"
        class="catalog-overview-card"
      >
        <div class="catalog-overview-title">{{ item.title }}</div>
        <div class="catalog-overview-meta">
          {{ item.groupCount }}个分组 · {{ item.toolCount }}个工具
        </div>
        <div
          class="catalog-overview-samples"
          v-if="item.sampleTools.length > 0"
        >
          {{ item.sampleTools.join(" / ") }}
        </div>
      </div>
    </div>

    </details>

    <a-textarea
      class="catalog-json-editor"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      :textarea-attrs="{ 'aria-label': '工具分类树 JSON' }"
      :auto-size="{ minRows: 14, maxRows: 24 }"
      placeholder='请输入 JSON 数组，如：[{"title":"AI工具箱","list":[{"title":"AI对话","list":[{"title":"DeepSeek R1","url":"/tools/ai/deepseek-r1","toolKey":"ai-deepseek-r1","consumePoints":2,"memberFree":true,"status":1,"desc":"...","seoTitle":"DeepSeek R1 免费对话","seoKeywords":"DeepSeek R1,AI对话","seoDescription":"...","geoSummary":"DeepSeek R1 适合进行长文本对话与推理。","geoQuestions":"DeepSeek R1是什么？；DeepSeek R1怎么用？"}]}]}]'
    />

    <div class="catalog-stat-row">
      <span>{{ counts.categories }} 个分类 · {{ counts.groups }} 个分组 · {{ counts.tools }} 个工具</span>
    </div>

    <div v-if="error" class="catalog-error">
      {{ error }}
    </div>
  </settings-section>
</template>
<script setup lang="ts">
import SettingsSection from "@/components/settings-section/index.vue";
import type { ToolsCatalogPreviewCard } from "../composables/tool-catalog-domain";
defineProps<{
  modelValue: string;
  previewCards: ToolsCatalogPreviewCard[];
  counts: { categories: number; groups: number; tools: number };
  error: string;
}>();
defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "format"): void;
  (event: "clear"): void;
}>();
</script>
<style scoped lang="scss">
.catalog-json-help { margin-bottom: 16px; font-size: 13px; color: var(--color-text-3); line-height: 1.7; }
.catalog-json-help summary { cursor: pointer; width: fit-content; padding: 4px 0; }
.catalog-json-help summary:focus-visible { outline: 2px solid rgb(var(--primary-6)); outline-offset: 2px; }
.catalog-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.catalog-overview-card {
  padding: 12px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
}
.catalog-overview-title {
  font-size: 14px;
  font-weight: 600;
}
.catalog-overview-meta,
.catalog-overview-samples {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--color-text-3);
  overflow-wrap: anywhere;
}
.catalog-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.catalog-error {
  margin-top: 12px;
  color: rgb(var(--danger-6));
  font-size: 13px;
  line-height: 1.7;
}
@media (max-width: 900px) {
  .catalog-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
