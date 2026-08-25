<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <div class="tab-bar-container">
        <div class="tab-bar-box">
            <div class="tab-bar-scroll">
                <div class="tags-wrap">
                    <a-tag
                        v-for="item in tabsLists"
                        :key="item.fullPath"
                        :color="item.fullPath === currentTab ? 'arcoblue' : 'gray'"
                        :closable="tabsLists.length > 1"
                        @close="handleDelete(item.fullPath)"
                        @click="handleChange(item.fullPath)"
                    >
                        {{ item.title }}
                    </a-tag>
                </div>
            </div>

            <div class="tag-bar-operation">
                <a-dropdown @select="handleCommand">
                    <a-button type="text" size="small">
                        <template #icon>
                            <icon-down :size="16" />
                        </template>
                    </a-button>
                    <template #content>
                        <a-doption value="closeCurrent">关闭当前</a-doption>
                        <a-doption value="closeOther">关闭其他</a-doption>
                        <a-doption value="closeAll">关闭全部</a-doption>
                    </template>
                </a-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconDown } from '@arco-design/web-vue/es/icon'
import useMultipleTabs from '@/hooks/useMultipleTabs'
import { useWatchRoute } from '@/hooks/useWatchRoute'
import useTabsStore, { getRouteParams } from '@/stores/modules/multipleTabs'

const router = useRouter()
const tabsStore = useTabsStore()
const { removeOtherTab, addTab, removeAllTab, removeTab, tabsLists, currentTab } = useMultipleTabs()

useWatchRoute(() => {
    addTab()
})

/**
 * 切换顶部标签页，并同步路由状态。
 */
const handleChange = (fullPath: string) => {
    if (fullPath === currentTab.value) {
        return
    }
    const tabItem = tabsStore.tasMap[fullPath]
    if (!tabItem) {
        return
    }
    router.push(getRouteParams(tabItem))
}

/**
 * 关闭指定标签页，保持历史交互行为一致。
 */
const handleDelete = (fullPath: string) => {
    removeTab(fullPath)
}

/**
 * 处理批量标签页命令（关闭当前/其他/全部）。
 */
const handleCommand = (command: string | number) => {
    switch (command) {
        case 'closeCurrent':
            removeTab()
            break
        case 'closeOther':
            removeOtherTab()
            break
        case 'closeAll':
            removeAllTab()
            break
    }
}
</script>

<style scoped lang="scss">
.tab-bar-container {
    position: relative;
    background-color: var(--color-fill-2, #f7f8fa);
    border-bottom: 1px solid var(--color-border, #e5e6eb);
}

.tab-bar-box {
    display: flex;
    min-height: 32px;
    padding: 0 0 0 16px;
    background-color: var(--color-bg-2, #fff);
}

.tab-bar-scroll {
    flex: 1;
    height: 32px;
    overflow: hidden;
}

.tags-wrap {
    padding: 4px 0;
    height: 32px;
    white-space: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
}

.tags-wrap :deep(.arco-tag) {
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
    height: 24px;
    line-height: 22px;
    border-color: transparent;
    background: var(--color-fill-2, #f2f3f5);
    color: var(--color-text-2, #4e5969);
}

.tags-wrap :deep(.arco-tag.arco-tag-arcoblue) {
    background: rgba(64, 128, 255, 0.12);
    color: rgb(var(--arcoblue-6));
}

.tags-wrap :deep(.arco-tag):first-child .arco-tag-close-btn {
    display: none;
}

.tag-bar-operation {
    width: 44px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1px solid var(--color-border, #e5e6eb);
}

.tag-bar-operation :deep(.arco-btn) {
    border-radius: 6px;
}
</style>
