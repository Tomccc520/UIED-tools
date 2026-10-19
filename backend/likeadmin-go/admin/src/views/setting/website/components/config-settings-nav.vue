<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
-->
<template>
    <nav class="config-settings-nav" aria-label="官网配置导航" v-if="groups.length">
        <label for="config-settings-navigation">配置位置</label>
        <div class="config-settings-nav__select"><a-select id="config-settings-navigation" aria-label="选择配置页面" :model-value="currentPath" @change="navigate">
            <a-optgroup v-for="group in groups" :key="group.title" :label="group.title">
                <a-option v-for="item in group.items" :key="item.path" :value="item.path">{{ item.label }}</a-option>
            </a-optgroup>
        </a-select></div>
        <span>{{ descriptions[currentKey] || '按用途选择配置页面，保存后生效。' }}</span>
    </nav>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useUserStore from '@/stores/modules/user'
import { flattenAdminNavigation } from '@/utils/admin-navigation'
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const catalog = [
    { title: '工具与内容', keys: ['tools_catalog', 'frontend_layout', 'tool_ranking_config', 'tool_ranking_manage'] },
    { title: '导航与外观', keys: ['sidebar', 'header', 'footer'] },
    { title: '站点与收录', keys: ['seo', 'information', 'filing', 'protocol'] }
]
const labels: Record<string, string> = { tools_catalog: '工具管理 · 信息 / SEO / GEO', frontend_layout: '首页内容与更新记录', tool_ranking_config: '工具榜单规则', tool_ranking_manage: '工具榜单数据', sidebar: '前台菜单', header: '顶部与搜索推荐', footer: '页脚与友情链接', seo: '全站与固定页面 SEO', information: '品牌基础信息', filing: '备案与版权', protocol: '政策与协议' }
const descriptions: Record<string, string> = { tools_catalog: '单个工具的信息、SEO 与 GEO 在这里维护。', seo: '全站默认及固定页面的 SEO；单个工具请到工具管理。', frontend_layout: '每日学习与更新记录；广告请到运营管理。', sidebar: '前台网站的菜单与入口，不影响后台权限菜单。', header: '顶部链接、搜索快捷入口及 AI 页推荐。', footer: '页脚分组、友情链接及媒体入口。', information: '后台品牌与商城资料；前台品牌文案在前台菜单中维护。' }
const currentKey = computed(() => route.path.split('/').pop() || '')
/** 按用途组织当前账号真实可访问的配置菜单，不补造或绕过权限入口。 */
const groups = computed(() => {
    const entries = flattenAdminNavigation(userStore.routes).filter(item => item.path.startsWith('/official_site/'))
    return catalog.map(group => ({ title: group.title, items: group.keys.flatMap(key => entries.filter(item => item.path.split('?')[0] === `/official_site/${key}`).map(item => ({ ...item, label: labels[key] || item.title }))) })).filter(group => group.items.length)
})
const currentPath = computed(() => groups.value.flatMap(group => group.items).find(item => item.path.split('?')[0] === route.path)?.path)
/** 通过已注册的真实路由切换配置，现有未保存离开确认仍由页面处理。 */
const navigate = (path: unknown) => { if (typeof path === 'string' && path !== currentPath.value) void router.push(path) }
</script>
<style scoped lang="scss">
.config-settings-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border-2); font-size: 13px;
    label { color: var(--color-text-2); }
    > span { color: var(--color-text-3); line-height: 1.6; }
}
.config-settings-nav__select { flex: 0 0 240px; min-width: 0; }
@media (max-width: 600px) { .config-settings-nav__select { flex: 1; min-width: 180px; } }
</style>
