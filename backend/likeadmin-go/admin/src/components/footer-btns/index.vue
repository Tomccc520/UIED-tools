<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <div class="footer-btns" :class="{ 'is-fixed': fixed }">
        <div class="footer-btns__content">
            <a-space :size="8" wrap align="center">
                <slot></slot>
            </a-space>
        </div>
    </div>
</template>

<script lang="ts" setup>
defineProps({
    fixed: {
        type: Boolean,
        default: true
    }
})
</script>

<style scoped lang="scss">
.footer-btns {
    margin-top: 20px;
}

.footer-btns__content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 100%;
    min-height: 0;
    padding: 16px 0 0;
    border-top: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 0;
    background: transparent;
}

.footer-btns.is-fixed {
    height: 76px;
}

.footer-btns.is-fixed .footer-btns__content {
    position: fixed;
    left: 20px;
    right: 20px;
    box-sizing: border-box;
    width: auto;
    bottom: 16px;
    z-index: 90;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(8px);
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

@media (max-width: 960px) {
    .footer-btns.is-fixed .footer-btns__content {
        left: 12px;
        right: 12px;
        bottom: 12px;
        padding: 10px 12px;

        :deep(.arco-space) {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
        }

        :deep(.arco-space-item) {
            flex: 1 1 140px;
        }

        :deep(.arco-btn) {
            width: 100%;
        }
    }
}
</style>
