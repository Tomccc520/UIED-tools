<!--
 * @file 404.vue
 * @description 站点统一 404 页面，明确反馈路径不存在并提供恢复入口
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-04
 -->

<template>
  <main class="not-found-page" aria-labelledby="not-found-title">
    <section class="not-found-card">
      <div class="not-found-code" aria-hidden="true">404</div>
      <p class="not-found-kicker">页面状态</p>
      <h1 id="not-found-title">页面不存在</h1>
      <p class="not-found-description">
        你访问的地址可能已经失效，或者页面还没有发布。可以返回首页重新搜索工具。
      </p>
      <div class="not-found-actions">
        <router-link class="not-found-primary" to="/">返回首页</router-link>
        <router-link class="not-found-secondary" to="/tools/ai/toolbox">浏览工具分类</router-link>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.not-found-page {
  display: grid;
  min-height: min(560px, calc(100vh - 12rem));
  place-items: center;
  padding: 2rem 1rem;
}

.not-found-card {
  width: min(620px, 100%);
  padding: clamp(2rem, 6vw, 4.5rem);
  text-align: center;
  background: #fff;
  border: 1px solid #e4e7ec;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(30, 36, 50, 0.08);
}

.not-found-code {
  color: #6757ff;
  font-size: clamp(4.5rem, 16vw, 8rem);
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.08em;
}

.not-found-kicker {
  margin: 1.25rem 0 0.5rem;
  color: #6e7480;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.not-found-card h1 {
  margin: 0;
  color: #17191d;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
}

.not-found-description {
  max-width: 30rem;
  margin: 1rem auto 0;
  color: #707784;
  font-size: 0.95rem;
  line-height: 1.8;
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.not-found-actions a {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.not-found-actions a:hover {
  transform: translateY(-1px);
}

.not-found-primary {
  color: #fff;
  background: #6757ff;
  box-shadow: 0 8px 18px rgba(103, 87, 255, 0.22);
}

.not-found-secondary {
  color: #303642;
  background: #f4f5f8;
  border: 1px solid #e0e3e9;
}

@media (max-width: 480px) {
  .not-found-page {
    min-height: calc(100vh - 10rem);
  }

  .not-found-actions {
    flex-direction: column;
  }

  .not-found-actions a {
    width: 100%;
  }
}
</style>
