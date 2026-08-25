<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="material-icons-page pro-page-shell">
        <a-page-header class="material-icons-header" title="素材管理 · 图标库">
            <template #subtitle>
                上传 SVG/PNG 图标后，可在官网设置 - 菜单设置里直接选择用于侧边栏菜单和品牌入口。
            </template>
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>独立素材池</a-tag>
                    <a-tag color="green" bordered>推荐 SVG</a-tag>
                </a-space>
            </template>
        </a-page-header>

        <section class="icons-workspace">
            <div class="icons-workspace__main">
                <div class="icons-workspace__eyebrow">图标库工作区</div>
                <div class="icons-workspace__title">当前图标库用于官网菜单、品牌区与导航入口</div>
                <div class="icons-workspace__desc">
                    建议优先维护透明底 SVG 图标，尺寸推荐 24x24 或 32x32。上传后可直接在官网设置里选择复用。
                </div>
            </div>
            <div class="icons-workspace__aside">
                <div class="icons-workspace__aside-title">当前建议操作</div>
                <ul class="icons-workspace__checklist">
                    <li>优先上传透明底 SVG，避免在浅色或深色背景上出现锯齿。</li>
                    <li>命名建议与前端菜单 key 对齐，方便运营检索。</li>
                    <li>图标库与图片、视频素材池独立，不会混用。</li>
                </ul>
            </div>
        </section>

        <a-card class="material-icons-card !border-none" :bordered="false">

            <a-alert
                type="info"
                :closable="false"
                show-icon
                title="图标库使用独立素材池（type=30），与素材中心图片/视频互不影响。建议统一使用透明底 SVG 图标，尺寸推荐 24x24 或 32x32。"
                class="mb-3"
            />

            <material
                type="image"
                :album-type="30"
                mode="page"
                file-size="120px"
                :limit="-1"
                :page-size="20"
            />
        </a-card>
    </div>
</template>

<script lang="ts" setup name="materialIconsLibrary"></script>

<style lang="scss" scoped>
.material-icons-page {
    min-width: 700px;

    .material-icons-header {
        margin-bottom: 12px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 14px;
        background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
    }

    .icons-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
        gap: 12px;
        margin-bottom: 12px;
    }

    .icons-workspace__main,
    .icons-workspace__aside {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 14px;
        background: #fff;
        padding: 16px;
    }

    .icons-workspace__eyebrow {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 9px;
        border-radius: 999px;
        border: 1px solid rgba(var(--primary-2), 0.6);
        background: rgba(var(--primary-1), 0.6);
        color: rgb(var(--primary-6));
        font-size: 12px;
        font-weight: 700;
    }

    .icons-workspace__title {
        margin-top: 10px;
        font-size: 20px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .icons-workspace__desc {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.65;
        color: var(--color-text-3, #86909c);
    }

    .icons-workspace__aside-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .icons-workspace__checklist {
        margin: 10px 0 0;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.9;
        color: var(--color-text-3, #86909c);
    }

    .material-icons-card {
        border-radius: 14px;
    }

    :deep(.material) {
        height: calc(100vh - 250px);
    }

    @media (max-width: 920px) {
        .icons-workspace {
            grid-template-columns: 1fr;
        }
    }
}
</style>
