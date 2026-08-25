<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-30
 */
-->
<script lang="ts" setup>
import { IconDelete, IconEdit } from '@arco-design/web-vue/es/icon'
import { useMenuOa } from './useMenuOa'
import oaMenuForm from './oa-menu-form.vue'
import oaMenuFormEdit from './oa-menu-form-edit.vue'

const menuRef = shallowRef()

const {
    menuList,
    menuIndex,
    handleAddSubMenu,
    handleEditSubMenu,
    handleDelMenu,
    handleDelSubMenu
} = useMenuOa(menuRef)
</script>

<template>
    <div v-if="menuList.length === 0" class="flex-1 oa-attr">
        <div class="text-base oa-attr-title">菜单配置</div>
        <div class="oa-attr-desc">左侧还没有一级菜单，请先新增一级菜单，再补齐网页或小程序跳转参数。</div>
        <a-empty class="mt-8" description="当前还没有公众号菜单" />
    </div>

    <!-- Attr -->
    <template v-for="(attrItem, attrIndex) in menuList" :key="attrIndex">
        <div class="flex-1 oa-attr" v-show="attrIndex === menuIndex">
            <div class="text-base oa-attr-title">菜单配置</div>
            <div class="oa-attr-desc">
                当前正在编辑“{{ attrItem.name || '未命名菜单' }}”，可切换菜单类型、补齐访问方式，并维护子菜单。
            </div>

            <del-wrap class="oa-attr__panel" @close="handleDelMenu(menuIndex)">
                <div class="flex items-center w-full p-4 mt-4 rounded bg-fill-light oa-attr__surface">
                    <oa-menu-form
                        ref="menuRef"
                        modular="master"
                        v-model:name="attrItem.name"
                        v-model:menuType="attrItem.menuType"
                        v-model:visitType="attrItem.visitType"
                        v-model:url="attrItem.url"
                        v-model:appId="attrItem.appId"
                        v-model:pagePath="attrItem.pagePath"
                    >
                        <div class="flex-1">
                            <!-- 编辑子菜单 -->
                            <ul>
                                <li
                                    class="flex"
                                    v-for="(subItem, subIndex) in attrItem.subButtons"
                                    :key="subIndex"
                                    style="padding: 8px"
                                >
                                    <span class="mr-auto">{{ subItem.name }}</span>
                                    <!-- 编辑子菜单 -->
                                    <oa-menu-form-edit
                                        modular="edit"
                                        :subItem="subItem"
                                        @edit="handleEditSubMenu($event, subIndex)"
                                    >
                                        <a-button type="text" class="!p-0 min-w-0">
                                            <IconEdit />
                                        </a-button>
                                    </oa-menu-form-edit>

                                    <!-- 删除子菜单 -->
                                    <a-popconfirm
                                        content="是否删除当前子菜单？"
                                        @ok="handleDelSubMenu(menuIndex, subIndex)"
                                    >
                                        <a-button
                                            type="text"
                                            status="danger"
                                            class="ml-5 !p-0 min-w-0"
                                        >
                                            <IconDelete />
                                        </a-button>
                                    </a-popconfirm>
                                </li>
                            </ul>

                            <!-- 新增子菜单 -->
                            <oa-menu-form-edit modular="add" @add="handleAddSubMenu">
                                <a-button type="text" :disabled="attrItem.subButtons.length >= 5">
                                    添加子菜单({{ attrItem.subButtons.length }}/5)
                                </a-button>
                            </oa-menu-form-edit>
                        </div>
                    </oa-menu-form>
                </div>
            </del-wrap>
        </div>
    </template>
</template>

<style lang="scss" scoped>
.oa-attr-title {
    font-size: 18px;
    font-weight: 700;
    color: #1d2129;
}

.oa-attr-desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.7;
    color: #86909c;
}

.oa-attr__panel {
    width: 100%;
}

.oa-attr__surface {
    align-items: flex-start;
    border: 1px solid #f2f3f5;
    border-radius: 16px;
    background: #f7f8fa;
}

:deep(.arco-popconfirm-popup-content) {
    line-height: 1.6;
}
</style>
