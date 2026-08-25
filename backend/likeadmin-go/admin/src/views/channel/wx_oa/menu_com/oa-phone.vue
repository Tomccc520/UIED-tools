<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-30
 */
-->
<script lang="ts" setup>
import { IconApps, IconPlus } from '@arco-design/web-vue/es/icon'
import { useMenuOa } from './useMenuOa'
import useSettingStore from '@/stores/modules/setting'

// 菜单颜色（这里采用全局颜色）
const settingStore = useSettingStore()
const themeColor = computed(() => settingStore.theme || '#6C54FF')

const { menuList, menuIndex, handleAddMenu } = useMenuOa(undefined)
</script>

<template>
    <!-- Phone -->
    <div class="oa-phone mr-[35px]">
        <div class="oa-phone-topbar">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="oa-phone-content">
            <div class="oa-phone-empty">
                <div class="oa-phone-empty__title">公众号菜单预览</div>
                <div class="oa-phone-empty__desc">点击底部一级菜单，可在右侧切换对应配置区。</div>
            </div>
        </div>

        <div class="flex oa-phone-menu">
            <div class="flex items-center justify-center oa-phone-menu-switch">
                <IconApps />
            </div>

            <template v-for="(menuItem, i) in menuList" :key="i">
                <div class="relative flex-1" @click="menuIndex = i">
                    <!-- 一级菜单 -->
                    <div
                        class="flex items-center justify-center flex-1 text-sm oa-phone-menu-item"
                        :class="{ 'active-menu': menuIndex === i }"
                    >
                        {{ menuItem.name }}
                    </div>

                    <!-- 二级菜单 -->
                    <div
                        class="oa-phone-menu-subitem"
                        v-show="menuItem.subButtons.length && menuItem.menuType != 1"
                    >
                        <template v-for="(subItem, index2) in menuItem.subButtons" :key="index2">
                            <div class="oa-phone-menu-subitem-title">
                                {{ subItem.name }}
                            </div>
                        </template>
                    </div>
                </div>
            </template>
            <!-- 新增菜单 -->
            <template v-if="menuList.length <= 2">
                <div class="flex items-center justify-center flex-1 h-full" @click="handleAddMenu">
                    <IconPlus />
                </div>
            </template>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.oa-phone {
    width: 260px;
    height: 461px;
    overflow: hidden;
    border: 1px solid #e5e6eb;
    border-radius: 24px;
    background: #f7f8fa;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);

    &-topbar {
        display: flex;
        justify-content: center;
        gap: 6px;
        padding: 14px 0 10px;

        span {
            width: 6px;
            height: 6px;
            border-radius: 999px;
            background: #c9cdd4;
        }
    }

    &-content {
        height: 395px;
        border-top: 1px solid rgba(229, 230, 235, 0.6);
        border-bottom: 1px solid #e5e6eb;
        background: linear-gradient(180deg, #fbfcfe 0%, #f7f8fa 100%);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    &-empty {
        width: calc(100% - 36px);
        padding: 18px 16px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.92);
        border: 1px dashed #d4d8df;
        text-align: center;

        &__title {
            font-size: 14px;
            font-weight: 700;
            color: #1d2129;
        }

        &__desc {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.7;
            color: #86909c;
        }
    }

    &-menu {
        height: 50px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.96);

        &-switch {
            width: 40px;
            height: 100%;
            border-right: 1px solid #e5e6eb;
            color: #4e5969;
        }

        // 一级菜单
        &-item {
            height: 100%;
            border-right: 1px solid #e5e6eb;
            color: #4e5969;
            transition: all 0.2s ease;
        }

        &-item:nth-child(4) {
            border-right: none;
        }

        .active-menu {
            position: relative;
        }

        .active-menu::after {
            content: '';
            width: 100%;
            height: 51px;
            top: -1px;
            position: absolute;
            border: 1px solid v-bind(themeColor);
            border-radius: 12px 12px 0 0;
            background: color-mix(in srgb, v-bind(themeColor) 8%, white);
        }

        // 二级菜单
        &-subitem {
            width: 98%;
            left: 2px;
            bottom: calc(100% + 12px);
            position: absolute;
            overflow: hidden;
            border: 1px solid #e5e6eb;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(15, 35, 95, 0.08);

            &-title {
                height: 38px;
                line-height: 38px;
                text-align: center;
                background: #fff;
                border-top: 1px solid #e5e6eb;
                font-size: 12px;
                color: #4e5969;
            }
        }
    }
}
</style>
