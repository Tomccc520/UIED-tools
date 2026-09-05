<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-30
 */
-->

<script setup lang="ts">
withDefaults(defineProps<{
  eyebrow?: string
  title: string
  description: string
  inputTitle?: string
  resultTitle?: string
  isBusy?: boolean
  hasResult?: boolean
}>(), {
  eyebrow: 'AI 分析工作台',
  inputTitle: '输入上下文',
  resultTitle: '生成结果',
  isBusy: false,
  hasResult: false
})
</script>

<template>
  <article class="ai-tool-template">
    <header class="ai-tool-header">
      <div class="ai-tool-header__brand" aria-hidden="true">
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="ai-tool-header__copy">
        <p>{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <div>{{ description }}</div>
      </div>
      <div class="ai-tool-header__state" :class="{ 'is-busy': isBusy }">
        <span></span>
        {{ isBusy ? '模型处理中' : '工作台就绪' }}
      </div>
    </header>

    <div class="ai-tool-workspace">
      <aside class="ai-input-panel" aria-labelledby="ai-input-panel-title">
        <header class="ai-panel-heading">
          <span>01</span>
          <div>
            <small>上下文</small>
            <h2 id="ai-input-panel-title">{{ inputTitle }}</h2>
          </div>
        </header>

        <div class="ai-input-panel__body">
          <slot name="input"></slot>
        </div>

        <div class="ai-input-panel__action">
          <slot name="primary-action"></slot>
        </div>
      </aside>

      <section class="ai-result-panel" aria-labelledby="ai-result-panel-title" :aria-busy="isBusy">
        <header class="ai-result-panel__header">
          <div class="ai-panel-heading">
            <span>02</span>
            <div>
              <small>结果</small>
              <h2 id="ai-result-panel-title">{{ resultTitle }}</h2>
            </div>
          </div>
          <div class="ai-result-panel__status" :class="{ 'has-result': hasResult }">
            {{ isBusy ? '生成中' : (hasResult ? '已生成' : '等待输入') }}
          </div>
        </header>

        <div v-if="$slots['result-actions']" class="ai-result-panel__actions">
          <slot name="result-actions"></slot>
        </div>

        <div v-if="$slots['assist-actions']" class="ai-result-panel__assist">
          <span>下一步操作</span>
          <div><slot name="assist-actions"></slot></div>
        </div>

        <div class="ai-result-panel__body">
          <slot name="result"></slot>
        </div>
      </section>
    </div>

    <section v-if="$slots.guide" class="ai-tool-guide">
      <div class="ai-tool-guide__label">使用指南 / 03</div>
      <div class="ai-tool-guide__content">
        <slot name="guide"></slot>
      </div>
    </section>
  </article>
</template>

<style scoped>
.ai-tool-template {
  --ai-ink: #101828;
  --ai-panel: #f9fafb;
  width: 100%;
  color: var(--ai-ink);
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.ai-tool-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 22px;
  align-items: center;
  padding: clamp(26px, 4vw, 46px);
  border: 1px solid #252b38;
  border-radius: 18px 18px 0 0;
  color: #fff;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px),
    #151a24;
  background-size: 32px 100%;
}

.ai-tool-header__brand {
  display: grid;
  grid-template-columns: repeat(2, 12px);
  gap: 4px;
  padding: 13px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 12px;
}

.ai-tool-header__brand span {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #fff;
}

.ai-tool-header__brand span:nth-child(2),
.ai-tool-header__brand span:nth-child(3) {
  background: var(--uied-color-primary);
}

.ai-tool-header__copy p {
  margin: 0 0 9px;
  color: #aeb5c3;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.18em;
}

.ai-tool-header__copy h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 720;
  letter-spacing: -0.04em;
  line-height: 1.15;
}

.ai-tool-header__copy div {
  max-width: 760px;
  margin-top: 10px;
  color: #b9c0cd;
  font-size: 14px;
  line-height: 1.7;
}

.ai-tool-header__state {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 999px;
  color: #d2d6df;
  font-size: 11px;
  white-space: nowrap;
}

.ai-tool-header__state span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #44c38b;
  box-shadow: 0 0 0 4px rgb(68 195 139 / 13%);
}

.ai-tool-header__state.is-busy span {
  background: #f6c75b;
  box-shadow: 0 0 0 4px rgb(246 199 91 / 14%);
  animation: ai-state-pulse 1.4s ease-in-out infinite;
}

.ai-tool-workspace {
  display: grid;
  grid-template-columns: minmax(270px, 0.33fr) minmax(0, 0.67fr);
  gap: 1px;
  overflow: hidden;
  border: 1px solid #dfe2ea;
  border-top: 0;
  border-radius: 0 0 18px 18px;
  background: #dfe2ea;
  box-shadow: 0 24px 64px rgb(17 24 39 / 7%);
}

.ai-input-panel,
.ai-result-panel {
  min-width: 0;
  background: #fff;
}

.ai-input-panel {
  align-self: start;
  padding: clamp(22px, 3vw, 32px);
  background:
    linear-gradient(rgb(17 24 39 / 3%) 1px, transparent 1px),
    var(--ai-panel);
  background-size: 100% 30px;
}

.ai-panel-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-panel-heading > span {
  color: var(--uied-color-primary);
  font-family: "DIN Alternate", "Avenir Next Condensed", sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.ai-panel-heading small {
  display: block;
  color: #8b91a1;
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

.ai-panel-heading h2 {
  margin: 3px 0 0;
  color: var(--ai-ink);
  font-size: 16px;
  font-weight: 700;
}

.ai-input-panel__body {
  margin-top: 28px;
}

.ai-input-panel__action {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed #cfd3dc;
}

.ai-result-panel {
  display: flex;
  flex-direction: column;
  min-height: clamp(650px, 72vh, 860px);
}

.ai-result-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 78px;
  padding: 18px 22px;
  border-bottom: 1px solid #e8eaf0;
}

.ai-result-panel__status {
  padding: 6px 10px;
  border: 1px solid #e2e5eb;
  border-radius: 999px;
  color: #7b8292;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.ai-result-panel__status.has-result {
  border-color: rgb(22 132 91 / 24%);
  color: var(--uied-color-success);
  background: rgb(22 132 91 / 7%);
}

.ai-result-panel__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  min-height: 48px;
  padding: 8px 14px;
  border-bottom: 1px solid #eceef3;
  background: #fbfbfc;
}

.ai-result-panel__assist {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 14px;
  border-bottom: 1px solid #eceef3;
  background: #f4f3ff;
}

.ai-result-panel__assist > span {
  color: var(--uied-color-primary);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.ai-result-panel__assist > div {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ai-result-panel__body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: #fff;
}

.ai-tool-guide {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 22px;
  margin-top: 18px;
  padding: 24px;
  border: 1px solid #dfe2ea;
  border-radius: 14px;
  background: #fff;
}

.ai-tool-guide__label {
  color: #8b91a1;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.ai-tool-guide__content {
  min-width: 0;
}

@keyframes ai-state-pulse {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 960px) {
  .ai-tool-workspace {
    grid-template-columns: 1fr;
  }

  .ai-input-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .ai-tool-header {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
    padding: 24px 18px;
    border-radius: 14px 14px 0 0;
  }

  .ai-tool-header__brand {
    grid-template-columns: repeat(2, 9px);
    padding: 10px;
  }

  .ai-tool-header__brand span {
    width: 9px;
    height: 9px;
  }

  .ai-tool-header__copy h1 {
    font-size: 27px;
  }

  .ai-tool-header__state {
    grid-column: 1 / -1;
    width: fit-content;
  }

  .ai-tool-workspace {
    border-radius: 0 0 14px 14px;
  }

  .ai-input-panel {
    padding: 22px 16px;
  }

  .ai-result-panel {
    min-height: 620px;
  }

  .ai-result-panel__header {
    padding: 16px;
  }

  .ai-result-panel__actions {
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .ai-result-panel__assist {
    align-items: flex-start;
    flex-direction: column;
  }

  .ai-tool-guide {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 20px 16px;
  }
}
</style>
