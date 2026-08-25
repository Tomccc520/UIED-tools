<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <a-card
        class="general-card"
        title="快捷操作"
        :header-style="{ paddingBottom: '0' }"
        :body-style="{ padding: '24px 20px 0 20px' }"
    >
        <template #extra>
            <router-link class="module-link" to="/official_site/frontend_layout">管理</router-link>
        </template>
        <a-row :gutter="8">
            <a-col
                v-for="item in menuList"
                :key="item.url"
                :xs="12"
                :sm="8"
                :md="8"
                :lg="8"
                :xl="8"
                :xxl="8"
                class="wrapper"
            >
                <router-link
                    :to="item.url"
                    class="wrapper-link"
                    :title="item.desc"
                    data-admin-smoke="workbench-quick-operation"
                >
                    <div class="icon">
                        <img class="quick-icon" :src="item.image" :alt="item.name" />
                    </div>
                    <a-typography-paragraph class="text">
                        {{ item.name }}
                    </a-typography-paragraph>
                </router-link>
            </a-col>
        </a-row>
        <a-divider class="split-line" style="margin: 0" />
    </a-card>
</template>

<script lang="ts" setup>
interface QuickMenuCard {
    name: string
    image: string
    url: string
    desc: string
}

const props = defineProps<{
    menuList: QuickMenuCard[]
}>()
</script>

<style lang="scss" scoped>
.general-card {
    border-radius: 4px;
}

.module-link {
    color: rgb(var(--arcoblue-6));
    text-decoration: none;
    font-size: 13px;
}

.wrapper {
    margin-bottom: 16px;
}

.wrapper-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    cursor: pointer;
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: 0 auto 4px;
    color: rgb(var(--dark-gray-1));
    line-height: 32px;
    background-color: rgb(var(--gray-1));
    border-radius: 4px;
    transition: all 0.2s ease;
}

.quick-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.text {
    font-size: 13px;
    line-height: 1.5;
    text-align: center;
    color: rgb(var(--gray-8));
    margin-bottom: 0 !important;
}

.wrapper-link:hover {
    .icon {
        color: rgb(var(--arcoblue-6));
        background-color: #e8f3ff;
    }

    .text {
        color: rgb(var(--arcoblue-6));
    }
}

@media (max-width: 1440px) {
    .wrapper {
        margin-bottom: 12px;
    }
}

@media (max-width: 768px) {
    .general-card {
        border-radius: 4px;
    }

    .icon {
        width: 36px;
        height: 36px;
    }
}
</style>
