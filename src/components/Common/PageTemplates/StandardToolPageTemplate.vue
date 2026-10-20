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
  workspaceLabel?: string
  compact?: boolean
}>(), {
  eyebrow: '标准工具',
  workspaceLabel: '工作区',
  compact: false
})
</script>

<template>
  <article class="standard-tool-template" :class="{ 'standard-tool-template--compact': compact }">
    <header class="standard-tool-header">
      <div class="standard-tool-header__marker" aria-hidden="true">
        <span>01</span>
        <i></i>
        <small>{{ workspaceLabel }}</small>
      </div>

      <div class="standard-tool-header__content">
        <p class="standard-tool-header__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="standard-tool-header__description">{{ description }}</p>
        <div class="standard-tool-header__meta">
          <slot name="meta"></slot>
        </div>
      </div>

      <div class="standard-tool-header__stamp" aria-hidden="true">
        <strong>UIED</strong>
        <span>工具 / 3.x</span>
      </div>
    </header>

    <section class="standard-tool-workspace" :aria-label="`${title}操作区`">
      <div class="standard-tool-workspace__content">
        <slot></slot>
      </div>
      <footer v-if="!compact || $slots.actions" class="standard-tool-workspace__actions">
        <slot name="actions"></slot>
      </footer>
    </section>

    <section v-if="$slots.support" class="standard-tool-support">
      <slot name="support"></slot>
    </section>
  </article>
</template>

<style scoped>
.standard-tool-template {
  width: 100%;
  color: var(--uied-color-text);
  font-family: "Avenir Next", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.standard-tool-header {
  position: relative;
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) auto;
  gap: 26px;
  align-items: center;
  min-height: 230px;
  padding: clamp(28px, 4vw, 54px);
  overflow: hidden;
  border: 1px solid #dfe2ea;
  border-bottom: 0;
  border-radius: 18px 18px 0 0;
  background:
    linear-gradient(90deg, transparent 0 49.8%, rgb(17 24 39 / 3%) 50%, transparent 50.2%),
    #fbfbfd;
}

.standard-tool-header::after {
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 9px;
  content: "";
  background: var(--uied-color-primary);
}

.standard-tool-header__marker {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
  color: #8b91a1;
}

.standard-tool-header__marker span {
  color: var(--uied-color-primary);
  font-family: "DIN Alternate", "Avenir Next Condensed", sans-serif;
  font-size: 28px;
  font-weight: 700;
}

.standard-tool-header__marker i {
  flex: 1;
  width: 1px;
  min-height: 50px;
  background: #d8dbe5;
}

.standard-tool-header__marker small {
  font-size: 9px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0.14em;
  writing-mode: vertical-rl;
}

.standard-tool-header__eyebrow {
  margin: 0 0 12px;
  color: #70778a;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.16em;
}

.standard-tool-header h1 {
  margin: 0;
  color: #111827;
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 750;
  letter-spacing: -0.04em;
  line-height: 1.16;
}

.standard-tool-header__description {
  max-width: 700px;
  margin: 14px 0 0;
  color: var(--uied-color-text-secondary);
  font-size: 15px;
  line-height: 1.75;
}

.standard-tool-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
}

.standard-tool-header__stamp {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 13px 15px;
  border: 1px solid #d8dbe5;
  color: #8b91a1;
  transform: rotate(-2deg);
}

.standard-tool-header__stamp strong {
  color: #111827;
  font-size: 18px;
  letter-spacing: 0.12em;
}

.standard-tool-header__stamp span {
  margin-top: 2px;
  font-size: 8px;
  letter-spacing: 0.1em;
}

.standard-tool-workspace {
  position: relative;
  padding: clamp(22px, 4vw, 48px);
  border: 1px solid #dfe2ea;
  border-radius: 0 0 18px 18px;
  background: #fff;
  box-shadow: 0 22px 60px rgb(17 24 39 / 6%);
}

.standard-tool-workspace::before {
  position: absolute;
  top: 0;
  left: clamp(22px, 4vw, 48px);
  width: 42px;
  height: 3px;
  content: "";
  background: #111827;
}

.standard-tool-workspace__content {
  min-width: 0;
}

.standard-tool-workspace__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px dashed #d8dbe5;
}

.standard-tool-support {
  margin-top: 18px;
}

/* 紧凑工作区按页面启用，让上传和参数操作更早出现在首屏。 */
.standard-tool-template--compact .standard-tool-header {
  display: block;
  min-height: 0;
  padding: 24px;
  border-radius: 12px 12px 0 0;
  background: #fff;
}

.standard-tool-template--compact .standard-tool-header::after,
.standard-tool-template--compact .standard-tool-header__marker,
.standard-tool-template--compact .standard-tool-header__eyebrow,
.standard-tool-template--compact .standard-tool-header__stamp,
.standard-tool-template--compact .standard-tool-workspace::before {
  display: none;
}

.standard-tool-template--compact .standard-tool-header h1 {
  font-size: 28px;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.standard-tool-template--compact .standard-tool-header__description {
  margin-top: 8px;
  font-size: 14px;
}

.standard-tool-template--compact .standard-tool-header__meta {
  gap: 8px 16px;
  margin-top: 12px;
}

.standard-tool-template--compact .standard-tool-workspace {
  padding: 0 24px 24px;
  border-top: 0;
  border-radius: 0 0 12px 12px;
  box-shadow: none;
}

@media (max-width: 720px) {
  .standard-tool-template--compact .standard-tool-header {
    padding: 20px 16px;
  }

  .standard-tool-template--compact .standard-tool-header h1 {
    font-size: 24px;
  }

  .standard-tool-template--compact .standard-tool-workspace {
    padding: 0 16px 16px;
  }

  .standard-tool-header {
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 14px;
    min-height: 0;
    padding: 26px 18px 24px;
    border-radius: 14px 14px 0 0;
  }

  .standard-tool-header__marker span {
    font-size: 22px;
  }

  .standard-tool-header__stamp {
    display: none;
  }

  .standard-tool-header h1 {
    font-size: 28px;
  }

  .standard-tool-header__description {
    font-size: 14px;
  }

  .standard-tool-workspace {
    padding: 24px 16px 18px;
    border-radius: 0 0 14px 14px;
  }

  .standard-tool-workspace__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
}
</style>
