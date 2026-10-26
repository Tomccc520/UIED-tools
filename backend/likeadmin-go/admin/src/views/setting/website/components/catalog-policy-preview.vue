<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
  <settings-section title="发布计费规则" description="将目录中的计费草稿发布为实际规则。请先保存目录更改，再执行同步。">
    <template #actions>
      <a-radio-group
        :model-value="mode"
        @update:model-value="updateMode"
        type="button"
        size="small"
      >
        <a-radio value="append">仅新增不覆盖</a-radio>
        <a-radio value="overwrite">全量覆盖</a-radio>
      </a-radio-group>
      <a-button
        type="primary"
        data-admin-smoke="tools-catalog-policy-sync"
        @click="$emit('sync')"
        >同步计费规则</a-button
      >
      <a-button
        data-admin-smoke="tools-catalog-policy-settings-advanced"
        @click="$emit('open-settings')"
        >查看计费设置</a-button
      >
    </template>
    <a-alert class="catalog-alert" type="info" :closable="false" show-icon>
      当前同步模式：<strong>{{
        mode === "append" ? "仅新增不覆盖" : "全量覆盖"
      }}</strong
      >。
      {{
        mode === "append"
          ? "只新增规则，已有计费设置保持不变。"
          : "按当前目录重建规则，未包含的旧规则将被移除。"
      }}
    </a-alert>
    <div class="catalog-stat-row">
      <a-tag color="arcoblue" bordered>规则 {{ rules.length }} 条</a-tag>
      <a-tag color="green" bordered>自定义计费 {{ overrideCount }} 项</a-tag>
      <a-tag :color="conflicts.length > 0 ? 'orangered' : 'green'" bordered
        >标识冲突 {{ conflicts.length }} 项</a-tag
      >
    </div>
    <a-table
      class="mt-3"
      :data="rules.slice(0, 12)"
      :pagination="false"
      :scroll="{ x: 800 }"
      size="small"
      row-key="toolKey"
    >
      <template #columns>
        <a-table-column title="工具标识" data-index="toolKey" />
        <a-table-column title="规则名称" data-index="name" />
        <a-table-column title="扣分" data-index="consumePoints" />
        <a-table-column title="会员免扣" data-index="memberFree">
          <template #cell="{ record }">
            <a-tag
              :color="record.memberFree === 0 ? 'orangered' : 'green'"
              bordered
            >
              {{ record.memberFree === 0 ? "否" : "是" }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="启用" data-index="status">
          <template #cell="{ record }">
            <a-tag :color="record.status === 0 ? 'gray' : 'arcoblue'" bordered>
              {{ record.status === 0 ? "停用" : "启用" }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column
          title="工具链接"
          data-index="path"
          :ellipsis="true"
          :tooltip="true"
        />
      </template>
    </a-table>
    <a-alert
      v-if="conflicts.length > 0"
      class="catalog-alert mt-3"
      type="warning"
      :closable="false"
      show-icon
    >
      工具标识存在冲突，请先修正再同步。
    </a-alert>
    <a-table
      v-if="conflicts.length > 0"
      class="mt-3"
      :data="conflicts"
      :pagination="false"
      :scroll="{ x: 800 }"
      size="small"
      row-key="toolKey"
    >
      <template #columns>
        <a-table-column title="冲突标识" data-index="toolKey" />
        <a-table-column title="出现次数" data-index="count" width="110" />
        <a-table-column title="冲突位置">
          <template #cell="{ record }">
            <div class="tool-conflict-positions">
              <div
                v-for="(position, index) in record.positions"
                :key="`${record.toolKey}-${index}`"
                class="tool-conflict-position"
              >
                {{ index + 1 }}. {{ position }}
              </div>
            </div>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </settings-section>
</template>
<script setup lang="ts">
import SettingsSection from "@/components/settings-section/index.vue";
import type {
  ToolPolicyPreviewRow,
  ToolKeyConflictRow,
} from "../composables/tool-catalog-domain";
defineProps<{
  mode: "append" | "overwrite";
  rules: ToolPolicyPreviewRow[];
  overrideCount: number;
  conflicts: ToolKeyConflictRow[];
}>();
const emit = defineEmits<{
  (event: "update:mode", value: "append" | "overwrite"): void;
  (event: "sync"): void;
  (event: "open-settings"): void;
}>();
/** 只切换允许的同步模式，实际配置写入仍由父页确认并执行。 */
const updateMode = (value: unknown) => {
  if (value === "append" || value === "overwrite") emit("update:mode", value);
};
</script>
<style scoped lang="scss">
.catalog-stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.tool-conflict-positions {
  display: grid;
  gap: 4px;
}
.tool-conflict-position {
  overflow-wrap: anywhere;
  font-size: 12px;
  line-height: 1.6;
}
.catalog-alert {
  margin-top: 12px;
}
:deep(.arco-table) {
  max-width: 100%;
}
</style>
