<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<script setup lang="ts" name="wxOaMenu">
import { IconRefresh } from '@arco-design/web-vue/es/icon'
import OaPhone from './menu_com/oa-phone.vue'
import OaAttr from './menu_com/oa-attr.vue'
import { useMenuOa } from './menu_com/useMenuOa'
import type { Menu } from '@/api/channel/wx_oa'

const {
    menuList,
    menuIndex,
    getOaMenuFunc,
    handleSave,
    handlePublish,
    isMenuLoading,
    isMenuSaving,
    isMenuPublishing
} = useMenuOa(undefined)

/**
 * 函数说明：初始化公众号菜单编辑页数据
 */
const initOaMenu = async () => {
    await getOaMenuFunc()
}

/**
 * 函数说明：判断菜单入口是否已经补齐访问方式与目标地址。
 */
const isMenuEntryConfigured = (menuItem: Record<string, any>) => {
    const menuName = String(menuItem?.name || '').trim()
    if (!menuName) {
        return false
    }
    if (Number(menuItem?.menuType) === 2) {
        return Array.isArray(menuItem?.subButtons) && menuItem.subButtons.length > 0
    }
    if (menuItem?.visitType === 'miniprogram') {
        return Boolean(
            String(menuItem?.url || '').trim() &&
                String(menuItem?.appId || '').trim() &&
                String(menuItem?.pagePath || '').trim()
        )
    }
    return Boolean(String(menuItem?.url || '').trim())
}

/**
 * 函数说明：重新拉取公众号菜单配置，供运营回滚到最新服务端状态。
 */
const handleReload = async () => {
    await getOaMenuFunc()
}

const totalSubMenuCount = computed(() =>
    menuList.value.reduce((total: number, item: Menu) => total + (item.subButtons?.length || 0), 0)
)
const totalEntryCount = computed(() =>
    menuList.value.reduce((total: number, item: Menu) => {
        if (Number(item.menuType) === 2) {
            return total + (item.subButtons?.length || 0)
        }
        return total + 1
    }, 0)
)
const configuredEntryCount = computed(() => {
    return menuList.value.reduce((total: number, item: Menu) => {
        if (Number(item.menuType) === 2) {
            return (
                total +
                (item.subButtons || []).filter((subItem: Menu) => isMenuEntryConfigured(subItem)).length
            )
        }
        return total + (isMenuEntryConfigured(item) ? 1 : 0)
    }, 0)
})
const currentMenuLabel = computed(() => {
    const currentMenu = menuList.value[menuIndex.value]
    return String(currentMenu?.name || '').trim() || '未选中菜单'
})
const remainingMenuSlots = computed(() => Math.max(3 - menuList.value.length, 0))
const pendingEntryCount = computed(() =>
    Math.max(totalEntryCount.value - configuredEntryCount.value, 0)
)

initOaMenu()
</script>

<template>
    <div class="channel-page">
        <a-page-header title="公众号菜单设置" subtitle="维护公众号一级菜单、子菜单和跳转方式，统一运营预览与发布流程。">
            <template #extra>
                <a-space>
                    <a-tag color="arcoblue" bordered>
                        {{ configuredEntryCount }}/{{ totalEntryCount || 0 }} 已补齐
                    </a-tag>
                    <a-button
                        data-admin-smoke="channel-oa-menu-reload"
                        :disabled="isMenuLoading || isMenuSaving || isMenuPublishing"
                        @click="handleReload"
                    >
                        <template #icon>
                            <icon-refresh />
                        </template>
                        重新拉取
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="channel-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">一级菜单</div>
                    <div class="metric-value">{{ menuList.length }}/3</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">子菜单</div>
                    <div class="metric-value">{{ totalSubMenuCount }}/15</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">入口补齐</div>
                    <div class="metric-value">{{ configuredEntryCount }}/{{ totalEntryCount || 0 }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">当前焦点</div>
                    <div class="metric-value metric-value--small">{{ currentMenuLabel }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="!border-none channel-card channel-card--notice" :bordered="false">
            <a-alert
                type="warning"
                title="保存会写入后台配置，发布才会同步到微信公众平台。发布前请先确认所有菜单都已补齐访问参数。"
                :closable="false"
                show-icon
                banner
            />
        </a-card>

        <a-spin :loading="isMenuLoading" tip="正在加载公众号菜单配置..." class="w-full">
            <div class="menu-editor-layout">
                <div class="menu-editor-layout__main">
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">手机预览</div>
                        <div class="section-desc">左侧模拟公众号菜单效果，点击一级菜单即可切换右侧配置区。</div>
                        <div class="menu-editor-layout__phone">
                            <oa-phone />
                        </div>
                    </a-card>

                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">菜单配置</div>
                        <div class="section-desc">右侧配置当前选中的一级菜单，可新增子菜单、切换网页/小程序跳转方式。</div>
                        <oa-attr />
                    </a-card>
                </div>

                <div class="menu-editor-layout__side">
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">发布前检查</div>
                        <div class="tips-list">
                            <div class="tips-item">一级菜单最多 3 个，子菜单最多 5 个/组，超出不会同步到微信端。</div>
                            <div class="tips-item">小程序跳转必须同时补齐网页地址、AppId 和页面路径。</div>
                            <div class="tips-item">如菜单结构改动较大，建议先保存，再由运营确认后执行发布。</div>
                        </div>
                    </a-card>
                    <a-card class="!border-none channel-card" :bordered="false">
                        <div class="section-title">当前摘要</div>
                        <div class="audit-list">
                            <div class="audit-item">
                                <span>当前焦点</span>
                                <strong>{{ currentMenuLabel }}</strong>
                            </div>
                            <div class="audit-item">
                                <span>待补齐入口</span>
                                <strong>{{ pendingEntryCount }}</strong>
                            </div>
                            <div class="audit-item">
                                <span>剩余一级菜单</span>
                                <strong>{{ remainingMenuSlots }}</strong>
                            </div>
                        </div>
                    </a-card>
                </div>
            </div>
        </a-spin>

        <footer-btns>
            <a-button
                data-admin-smoke="channel-oa-menu-save"
                type="primary"
                :loading="isMenuSaving"
                :disabled="isMenuLoading || isMenuPublishing"
                @click="handleSave"
                v-perms="['channel:oaMenu:save']"
            >
                保存
            </a-button>
            <a-button
                data-admin-smoke="channel-oa-menu-publish"
                type="primary"
                :loading="isMenuPublishing"
                :disabled="isMenuLoading || isMenuSaving"
                @click="handlePublish"
                v-perms="['channel:oaMenu:publish']"
            >
                发布
            </a-button>
        </footer-btns>
    </div>
</template>

<style lang="scss" scoped>
.channel-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.channel-metrics {
    width: 100%;
}

.metric-card,
.channel-card {
    border-radius: 16px;
}

.metric-label {
    font-size: 12px;
    color: #86909c;
}

.metric-value {
    margin-top: 8px;
    font-size: 28px;
    font-weight: 700;
    color: #1d2129;
}

.metric-value--small {
    font-size: 20px;
}

.channel-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(280px, 0.9fr);
    gap: 16px;
}

.channel-workspace__main,
.channel-workspace__aside {
    padding: 20px 22px;
    border-radius: 16px;
    background: #fff;
}

.channel-workspace__eyebrow {
    font-size: 12px;
    font-weight: 600;
    color: #4e5969;
}

.channel-workspace__title {
    margin-top: 10px;
    font-size: 22px;
    line-height: 1.4;
    font-weight: 700;
    color: #1d2129;
}

.channel-workspace__desc {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.75;
    color: #4e5969;
}

.channel-workspace__meta {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-top: 18px;
}

.channel-workspace__meta-item {
    padding: 12px 14px;
    border-radius: 14px;
    background: #f7f8fa;
}

.channel-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: #86909c;
}

.channel-workspace__meta-item strong {
    display: block;
    margin-top: 8px;
    font-size: 16px;
    line-height: 1.5;
    color: #1d2129;
}

.channel-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.channel-workspace__checklist {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 14px;
}

.channel-workspace__checklist-item {
    padding: 14px;
    border-radius: 14px;
    background: #f7f8fa;
}

.channel-workspace__checklist-item.is-ready {
    background: #f2f9f5;
}

.channel-workspace__checklist-item.is-warning {
    background: #fff7e8;
}

.channel-workspace__checklist-label {
    font-size: 12px;
    color: #86909c;
}

.channel-workspace__checklist-value {
    margin-top: 6px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
    color: #1d2129;
}

.channel-workspace__checklist-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: #4e5969;
}

.menu-editor-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.75fr) minmax(280px, 0.85fr);
    gap: 16px;
}

.menu-editor-layout__main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.menu-editor-layout__side {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.menu-editor-layout__phone {
    display: flex;
    justify-content: center;
    padding: 12px 0 4px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
}

.section-desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: #86909c;
}

.tips-list,
.audit-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 16px;
}

.tips-item,
.audit-item {
    padding: 12px 14px;
    border-radius: 14px;
    background: #f7f8fa;
    font-size: 13px;
    line-height: 1.7;
    color: #4e5969;
}

.audit-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.audit-item strong {
    font-size: 15px;
    color: #1d2129;
}

.channel-card--notice {
    padding: 0;
}

:deep(.oa-phone) {
    margin-right: 0 !important;
}

:deep(.oa-attr) {
    min-height: 360px;
}

@media (max-width: 1180px) {
    .channel-workspace,
    .menu-editor-layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .channel-workspace__meta {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
</style>
