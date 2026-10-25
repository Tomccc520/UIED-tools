<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
-->
<template>
    <section v-if="groups.length" class="config-settings-nav" aria-label="网站配置工作区" data-admin-smoke="config-task-navigation">
        <div class="config-settings-nav__top">
            <span class="config-settings-nav__label">网站管理</span>
            <div class="config-settings-nav__groups" role="group" aria-label="配置用途">
                <button v-for="group in groups" :key="group.key" type="button" :aria-pressed="selectedGroup?.key === group.key" @click="browsedGroup = group.key">{{ group.title }}</button>
            </div>
        </div>
        <nav class="config-settings-nav__links" :aria-label="`${selectedGroup?.title || ''}页面`">
            <router-link v-for="item in selectedGroup?.items || []" :key="item.path" :to="item.path" :aria-current="currentEntry === item ? 'page' : undefined">{{ item.label }}</router-link>
        </nav>
        <p v-if="currentEntry && currentGroup?.key === selectedGroup?.key" class="config-settings-nav__hint">{{ currentEntry.description }}</p>
    </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import useUserStore from '@/stores/modules/user'
import { flattenAdminNavigation } from '@/utils/admin-navigation'
import { buildConfigurationGroups, findConfigurationEntry } from '@/utils/site-configuration'
const userStore = useUserStore()
const route = useRoute()
const browsedGroup = ref('')
/** 菜单变化时只展示账号真实可访问的任务入口。 */
const groups = computed(() => buildConfigurationGroups(flattenAdminNavigation(userStore.routes)))
const currentEntry = computed(() => findConfigurationEntry(groups.value, route.fullPath))
const currentGroup = computed(() => groups.value.find(group => group.items.some(item => item === currentEntry.value)))
const selectedGroup = computed(() => groups.value.find(group => group.key === browsedGroup.value) || currentGroup.value || groups.value[0])
/** 路由真正切换后跟随目标任务组；浏览分组不跳转，也不放弃表单草稿。 */
watch(() => route.fullPath, () => { browsedGroup.value = '' })
</script>
<style scoped lang="scss">
.config-settings-nav { margin-bottom: 24px; padding: 0 0 16px; border-bottom: 1px solid var(--uied-admin-border); }
.config-settings-nav__top { display: flex; align-items: center; flex-wrap: wrap; gap: 16px; }
.config-settings-nav__label { color: var(--color-text-3); font-size: 12px; white-space: nowrap; }
.config-settings-nav__groups { display: flex; flex-wrap: wrap; gap: 4px; }
.config-settings-nav__groups button { border: 0; border-radius: 6px; padding: 7px 12px; color: var(--color-text-2); background: transparent; font: inherit; font-size: 13px; cursor: pointer; }
.config-settings-nav__groups button[aria-pressed='true'] { color: var(--uied-admin-accent); background: var(--uied-admin-accent-soft); font-weight: 600; }
.config-settings-nav__links { display: flex; flex-wrap: wrap; gap: 6px 20px; margin-top: 12px; }
.config-settings-nav__links a { display: block; padding: 6px 0; color: var(--color-text-2); font-size: 14px; line-height: 1.4; text-decoration: none; border-bottom: 2px solid transparent; }
.config-settings-nav__links a[aria-current='page'] { color: var(--uied-admin-accent); font-weight: 600; border-bottom-color: var(--uied-admin-accent); }
.config-settings-nav__links a:hover, .config-settings-nav__groups button:hover { color: var(--uied-admin-accent); }
.config-settings-nav__links a:focus-visible, .config-settings-nav__groups button:focus-visible { outline: 2px solid var(--uied-admin-accent); outline-offset: 3px; }
.config-settings-nav__hint { margin: 8px 0 0; font-size: 12px; line-height: 1.6; color: var(--color-text-3); }
@media (max-width: 600px) { .config-settings-nav { margin-bottom: 20px; } .config-settings-nav__top { gap: 6px; } .config-settings-nav__label { width: 100%; } .config-settings-nav__groups button { min-height: 44px; padding-inline: 10px; } .config-settings-nav__links { column-gap: 18px; margin-top: 8px; } .config-settings-nav__links a { padding-block: 10px; } }
</style>
