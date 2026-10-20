<!--
 * @file JsonFormat.vue
 * @description JSON 格式化工具，支持压缩、格式化、错误检查
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-14
 * @license MIT
-->

<script setup lang="ts">
import { ref } from 'vue'
import { CopyDocument, Delete, DocumentChecked, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import StandardToolPageTemplate from '@/components/Common/PageTemplates/StandardToolPageTemplate.vue'
import useClipboard from 'vue-clipboard3'
import { formatJsonLosslessly, minifyJsonLosslessly } from '@/utils/losslessJson'

const { toClipboard } = useClipboard()

const jsonInput = ref('')
const jsonOutput = ref('')
const errorMsg = ref('')
const indentSize = ref(2)

/** 格式化输入 JSON 并写入结果区。 */
const formatJson = () => {
  errorMsg.value = ''
  if (!jsonInput.value) {
    jsonOutput.value = ''
    return
  }
  try {
    jsonOutput.value = formatJsonLosslessly(jsonInput.value, indentSize.value)
    ElMessage.success('格式化成功')
  } catch (e) {
    jsonOutput.value = ''
    errorMsg.value = '无效的 JSON: ' + (e instanceof Error ? e.message : '请检查语法，原文已保留')
    ElMessage.error('格式化失败，请检查 JSON 格式')
  }
}

/** 压缩输入 JSON 并写入结果区。 */
const compressJson = () => {
  errorMsg.value = ''
  if (!jsonInput.value) {
    jsonOutput.value = ''
    return
  }
  try {
    jsonOutput.value = minifyJsonLosslessly(jsonInput.value)
    ElMessage.success('压缩成功')
  } catch (e) {
    jsonOutput.value = ''
    errorMsg.value = '无效的 JSON: ' + (e instanceof Error ? e.message : '请检查语法，原文已保留')
    ElMessage.error('压缩失败，请检查 JSON 格式')
  }
}

/** 将结果区内容复制到系统剪贴板。 */
const copyResult = async () => {
  if (!jsonOutput.value) return
  try {
    await toClipboard(jsonOutput.value)
    ElMessage.success('结果已复制')
  } catch (e) {
    ElMessage.error('复制失败')
  }
}

/** 清空输入、结果和错误状态。 */
const clearAll = () => {
  jsonInput.value = ''
  jsonOutput.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <div class="json-format-page">
    <StandardToolPageTemplate
      eyebrow="DEVELOPER UTILITY"
      title="JSON 格式化"
      description="在线校验、格式化和压缩 JSON，结果可直接复制到开发工具或接口文档。"
      workspace-label="JSON / 01"
    >
      <template #meta>
        <span class="json-meta">本地处理</span>
        <span class="json-meta">支持 2 / 4 空格与 Tab</span>
        <span class="json-meta">实时错误提示</span>
      </template>

      <div class="json-workspace">
        <section class="json-pane">
          <header class="json-pane__header">
            <div>
              <span class="json-pane__index">01</span>
              <h2>输入 JSON</h2>
            </div>
            <el-button type="danger" link @click="clearAll" size="small">
              <el-icon class="mr-1"><Delete /></el-icon>清空
            </el-button>
          </header>
          <el-input
            v-model="jsonInput"
            type="textarea"
            class="json-editor"
            aria-label="输入 JSON"
            :input-style="{ height: '100%', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }"
            placeholder="在此粘贴 JSON 代码..."
            resize="none"
          />
        </section>

        <section class="json-pane json-pane--result">
          <header class="json-pane__header">
            <div>
              <span class="json-pane__index">02</span>
              <h2>结果</h2>
            </div>
            <el-button type="primary" link @click="copyResult" :disabled="!jsonOutput">
              <el-icon class="mr-1"><CopyDocument /></el-icon>复制
            </el-button>
          </header>
          <div class="json-result">
            <textarea v-model="jsonOutput" class="json-result__textarea" aria-label="JSON 处理结果" readonly placeholder="格式化结果将显示在这里..."></textarea>
            <div v-if="errorMsg" class="json-result__error" role="alert">{{ errorMsg }}</div>
          </div>
        </section>
      </div>

      <template #actions>
        <el-select v-model="indentSize" class="json-indent" placeholder="缩进">
          <el-option label="2 空格缩进" :value="2" />
          <el-option label="4 空格缩进" :value="4" />
          <el-option label="Tab 缩进" :value="'\t'" />
        </el-select>
        <el-button type="primary" @click="formatJson">
          <el-icon class="mr-1"><MagicStick /></el-icon>格式化
        </el-button>
        <el-button @click="compressJson">
          <el-icon class="mr-1"><DocumentChecked /></el-icon>压缩
        </el-button>
      </template>

      <template #support>
        <div class="json-support">
          <strong>使用提示</strong>
          <span>输入必须是合法 JSON；对象和数组会按当前缩进设置输出，错误信息会保留在结果区底部。</span>
        </div>
      </template>
    </StandardToolPageTemplate>
    <ToolsRecommend />
  </div>
</template>

<style scoped>
.json-format-page { container-type: inline-size; container-name: json-format; min-width: 0; }
.json-editor, .json-result, .json-result__textarea { max-width: 100%; min-width: 0; }
.json-result__textarea { overflow: auto; }
.json-result__error { overflow-wrap: anywhere; }

.json-meta { padding: 5px 9px; border: 1px solid #dfe2ea; color: #687083; font-size: 11px; }
.json-workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; min-height: 520px; }
.json-pane { display: flex; flex-direction: column; min-width: 0; padding: 16px; border: 1px solid #e5e7ed; background: #fbfbfc; }
.json-pane--result { background: #fff; }
.json-pane__header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.json-pane__header > div { display: flex; align-items: center; gap: 10px; }
.json-pane__index { color: var(--uied-color-primary); font-family: "DIN Alternate", sans-serif; font-size: 20px; font-weight: 700; }
.json-pane h2 { margin: 0; color: #182033; font-size: 15px; }
.json-editor { flex: 1; min-height: 420px; }
.json-editor :deep(.el-textarea__inner) { height: 100%; min-height: 420px; border-color: #dfe2ea; border-radius: 0; background: #fff; box-shadow: none; }
.json-result { position: relative; flex: 1; min-height: 420px; border: 1px solid #dfe2ea; background: #f7f8fa; }
.json-result__textarea { width: 100%; height: 100%; min-height: 420px; padding: 14px; border: 0; outline: 0; resize: none; color: #273044; background: transparent; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; line-height: 1.65; }
.json-result__error { position: absolute; right: 0; bottom: 0; left: 0; padding: 9px 12px; border-top: 1px solid #f2b8b5; color: #b42318; background: #fff1f0; font-size: 12px; }
.json-indent { width: 150px; }
.json-support { display: flex; gap: 12px; padding: 14px 16px; border-left: 3px solid var(--uied-color-primary); background: var(--uied-color-primary-soft); color: #5d6373; font-size: 13px; line-height: 1.6; }
.json-support strong { color: #242035; white-space: nowrap; }
@container json-format (max-width: 720px) {
  .json-workspace { grid-template-columns: 1fr; min-height: 0; }
  .json-editor, .json-editor :deep(.el-textarea__inner), .json-result, .json-result__textarea { min-height: 240px; }
  .json-pane { padding: 12px; }
  .json-pane__header { gap: 8px; }
  .json-pane__header :deep(.el-button) { min-height: 44px; padding: 8px; }
  .json-editor :deep(.el-textarea__inner), .json-result__textarea { font-size: 16px; }
  .json-indent { width: 100%; }
  .json-format-page :deep(.standard-tool-workspace__actions) { min-width: 0; }
  .json-format-page :deep(.standard-tool-workspace__actions .el-button) { min-height: 44px; margin-left: 0; }
  .json-format-page :deep(.standard-tool-workspace__actions .el-select__wrapper) { min-height: 44px; }
  .json-support { display: block; }
  .json-support strong { display: block; margin-bottom: 4px; }
}
</style>
