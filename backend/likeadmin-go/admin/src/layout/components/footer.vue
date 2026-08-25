<template>
    <footer class="layout-footer">
        <div class="layout-footer__links">
            <a
                class="layout-footer__link"
                :href="item.link"
                target="_blank"
                v-for="item in copyright"
                :key="item.name"
            >
                {{ item.name }}
            </a>
        </div>
    </footer>
</template>

<script setup lang="ts">
import useAppStore from '@/stores/modules/app'

const appStore = useAppStore()
const copyright = computed(() => appStore.config.copyright || [])
</script>

<style scoped lang="scss">
.layout-footer {
    padding: 8px 12px;
}

.layout-footer__links {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.layout-footer__link {
    margin: 0 4px;
    color: inherit;
    &:hover {
        color: var(--color-primary-6, #6c54ff);
        text-decoration: underline;
    }
}
</style>
