<!--
 * @file VideoWorkspaceIntro.vue
 * @description 视频工具工作区统一标题、参数摘要和处理说明
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-20
-->

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  specs: string[]
  notices: string[]
}>()
</script>

<template>
  <header class="video-workspace-intro">
    <div class="video-workspace-intro__top">
      <div class="video-workspace-intro__copy">
        <h2>{{ title }}</h2>
        <p>{{ description }}</p>
      </div>
      <div class="video-workspace-intro__specs" aria-label="工具参数摘要">
        <span v-for="item in specs" :key="item">{{ item }}</span>
      </div>
    </div>
    <div class="video-workspace-intro__notices">
      <span v-for="item in notices" :key="item">{{ item }}</span>
    </div>
  </header>
</template>

<style scoped>
.video-workspace-intro__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.video-workspace-intro__copy {
  min-width: 0;
}

.video-workspace-intro h2 {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
  font-weight: 750;
  line-height: 1.3;
  letter-spacing: 0;
}

.video-workspace-intro p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
}

.video-workspace-intro__specs {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.video-workspace-intro__specs span {
  border: 1px solid #dbe3ee;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  font-weight: 650;
  line-height: 1;
  padding: 8px 10px;
}

.video-workspace-intro__notices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 18px;
  border-top: 1px solid #edf2f7;
  padding-top: 14px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.video-workspace-intro__notices span {
  position: relative;
  padding-left: 13px;
}

.video-workspace-intro__notices span::before {
  position: absolute;
  top: 0.62em;
  left: 0;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #22c55e;
  content: '';
}

@media (max-width: 900px) {
  .video-workspace-intro__top {
    flex-direction: column;
    gap: 14px;
  }

  .video-workspace-intro__specs {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .video-workspace-intro h2 {
    font-size: 22px;
  }

  .video-workspace-intro__specs {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .video-workspace-intro__specs span {
    min-width: 0;
    padding: 8px 5px;
    text-align: center;
  }

  .video-workspace-intro__notices {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
