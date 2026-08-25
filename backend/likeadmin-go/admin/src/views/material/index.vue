<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="material-index pro-page-shell">
        <a-page-header class="material-page-header" title="素材中心">
            <template #subtitle>
                统一管理图片与视频素材。可按分组、绑定对象、压缩策略和附件参数做运营维护。
            </template>
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>当前：{{ activeTabMeta.name }}</a-tag>
                    <a-tag color="green" bordered>{{ activeTabMeta.tip }}</a-tag>
                </a-space>
            </template>
        </a-page-header>

        <div class="material-workspace">
            <div class="material-workspace__main">
                <div class="material-workspace__eyebrow">素材运营工作区</div>
                <div class="material-workspace__title">{{ activeTabMeta.title }}</div>
                <div class="material-workspace__desc">{{ activeTabMeta.desc }}</div>
            </div>
            <div class="material-workspace__aside">
                <div class="material-workspace__aside-title">当前建议操作</div>
                <ul class="material-workspace__checklist">
                    <li v-for="item in activeTabMeta.checklist" :key="item">{{ item }}</li>
                </ul>
            </div>
        </div>

        <a-card class="material-main-card !border-none" :bordered="false">
            <a-tabs v-model:active-key="activeTab" destroy-on-hide lazy-load>
                <a-tab-pane v-for="item in tabsMap" :key="item.type" :title="item.name">
                    <material
                        :type="item.type"
                        mode="page"
                        file-size="120px"
                        :limit="-1"
                        :page-size="20"
                    />
                </a-tab-pane>
            </a-tabs>
        </a-card>
    </div>
</template>

<script lang="ts" setup name="materialCenter">
const tabsMap = [
    {
        type: 'image',
        name: '图片',
        title: '当前图片素材池支持附件详情、业务对象绑定与自动压缩策略',
        desc: '适合维护文章配图、工具页分享图、SEO 图与活动素材。建议优先补齐替代文本、标题和业务对象绑定信息。',
        tip: '支持附件参数',
        checklist: [
            '先选择分组，再上传或筛选绑定对象。',
            '上传后可在右侧补齐替代文本、标题与业务对象信息。',
            '如需减轻上传体积，可在页面内打开“压缩设置”。'
        ]
    },
    {
        type: 'video',
        name: '视频',
        title: '当前视频素材池适合统一维护封面视频、案例演示和营销视频',
        desc: '视频页同样支持分组、绑定筛选和附件详情维护。建议优先补齐标题与业务对象标题，便于后续检索。',
        tip: '支持绑定筛选',
        checklist: [
            '先按分组归类，再补齐视频标题和业务对象信息。',
            '如列表为空，优先确认当前分组和绑定筛选条件。',
            '上传完成后建议在右侧详情区补齐文件用途说明。'
        ]
    }
]
const activeTab = ref('image')

/**
 * 函数说明：输出当前素材页签的工作区元信息，统一驱动顶部摘要和操作建议。
 */
const activeTabMeta = computed(() => {
    return tabsMap.find((item) => item.type === activeTab.value) || tabsMap[0]
})
</script>

<style lang="scss" scoped>
.material-index {
    min-width: 700px;
    padding-bottom: 16px;

    .material-page-header {
        margin-bottom: 12px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 14px;
        background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
    }

    .material-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
        gap: 12px;
        margin-bottom: 12px;
    }

    .material-workspace__main,
    .material-workspace__aside {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 14px;
        background: #fff;
        padding: 16px;
    }

    .material-workspace__eyebrow {
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

    .material-workspace__title {
        margin-top: 10px;
        font-size: 20px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .material-workspace__desc {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.65;
        color: var(--color-text-3, #86909c);
    }

    .material-workspace__aside-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .material-workspace__checklist {
        margin: 10px 0 0;
        padding-left: 18px;
        font-size: 12px;
        line-height: 1.9;
        color: var(--color-text-3, #86909c);
    }

    .material-main-card {
        border-radius: 14px;
    }

    :deep(.arco-tabs) {
        height: calc(100vh - 180px);
        display: flex;
        flex-direction: column;
        .arco-tabs-nav {
            margin-bottom: 0 !important;
        }
        .arco-tabs-content {
            min-height: 0;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .arco-tabs-content-list {
            width: 100%;
            flex: 1;
            display: block;
        }
        .arco-tabs-content-item {
            min-height: 0;
            flex: none;
            width: 100%;
        }
        .arco-tabs-content-item:not(.arco-tabs-content-item-active) {
            display: none;
        }
        .arco-tabs-content-item-active {
            display: flex;
            flex-direction: column;
            flex: 1;
            width: 100%;
        }
    }

    @media (max-width: 920px) {
        .material-workspace {
            grid-template-columns: 1fr;
        }
    }
}
</style>
