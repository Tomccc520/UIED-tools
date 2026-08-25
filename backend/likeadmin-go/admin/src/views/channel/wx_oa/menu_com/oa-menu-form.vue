<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-30
 */
-->
<template>
    <a-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="rules"
        layout="vertical"
        class="oa-menu-form"
    >
        <!-- 菜单名称 -->
        <a-form-item :label="modular === 'master' ? '主菜单名称' : '子菜单名称'" field="name">
            <div class="w-full">
                <a-input v-model="menuForm.name" :placeholder="modular === 'master' ? '请输入主菜单名称' : '请输入子菜单名称'" allow-clear />
                <div class="form-tips">菜单名称建议简洁明确，便于粉丝在公众号底部快速识别入口。</div>
            </div>
        </a-form-item>

        <!-- 菜单类型 -->
        <a-form-item label="主菜单类型" field="menuType" v-if="modular === 'master'">
            <div class="w-full">
                <a-radio-group v-model="menuForm.menuType">
                    <a-radio :value="1">不配置子菜单</a-radio>
                    <a-radio :value="2">配置子菜单</a-radio>
                </a-radio-group>
                <div class="form-tips">若启用子菜单，则主菜单本身不再直接跳转，仅作为容器展示。</div>
            </div>
        </a-form-item>
        <a-form-item label="" v-if="menuForm.menuType === 2 && modular === 'master'">
            <slot></slot>
        </a-form-item>

        <template v-if="menuForm.menuType === 1">
            <!-- 跳转链接 -->
            <a-form-item label="跳转链接" field="visitType">
                <div class="w-full">
                    <a-radio-group v-model="menuForm.visitType">
                        <a-radio value="view">网页</a-radio>
                        <a-radio value="miniprogram">小程序</a-radio>
                    </a-radio-group>
                    <div class="form-tips">网页适合营销页或工具页，小程序适合跳转到对应的小程序功能页。</div>
                </div>
            </a-form-item>

            <!-- 网址 -->
            <a-form-item label="网址" field="url">
                <div class="w-full">
                    <a-input v-model="menuForm.url" placeholder="请输入完整的网页地址" allow-clear />
                    <div class="form-tips">网页地址需以 http:// 或 https:// 开头，发布前建议先访问确认。</div>
                </div>
            </a-form-item>

            <template v-if="menuForm.visitType == 'miniprogram'">
                <!-- AppId -->
                <a-form-item label="AppId" field="appId">
                    <div class="w-full">
                        <a-input v-model="menuForm.appId" placeholder="请输入目标小程序 AppId" allow-clear />
                        <div class="form-tips">目标小程序需与公众号具备跳转权限，建议直接复制微信公众平台中的 AppId。</div>
                    </div>
                </a-form-item>

                <!-- 路径 -->
                <a-form-item label="路径" field="pagePath">
                    <div class="w-full">
                        <a-input v-model="menuForm.pagePath" placeholder="请输入小程序页面路径" allow-clear />
                        <div class="form-tips">路径应为小程序内真实可访问页面，如 pages/home/index。</div>
                    </div>
                </a-form-item>
            </template>
        </template>
    </a-form>
</template>

<script lang="ts" setup>
import { rules } from './useMenuOa'
import type { FormInstance } from '@arco-design/web-vue'

const emit = defineEmits([
    'update:name',
    'update:menuType',
    'update:visitType',
    'update:url',
    'update:appId',
    'update:pagePath'
])

const props = withDefaults(
    defineProps<{
        modular?: string
        name?: string
        menuType?: number
        visitType?: string
        url?: string
        appId?: string
        pagePath?: string
    }>(),
    {
        modular: 'master',
        name: '',
        menuType: 1,
        visitType: 'view',
        url: '',
        appId: '',
        pagePath: ''
    }
)

const menuFormRef = shallowRef<FormInstance>()
// 表单数据
const menuForm = ref({ ...props })

watch(
    () => props,
    (value) => {
        menuForm.value = { ...value }
    },
    { immediate: true }
)

watchEffect(() => {
    if (props.modular === 'master') {
        emit('update:menuType', menuForm.value.menuType)
    }
    emit('update:name', menuForm.value.name)
    emit('update:visitType', menuForm.value.visitType)
    emit('update:url', menuForm.value.url)
    emit('update:appId', menuForm.value.appId)
    emit('update:pagePath', menuForm.value.pagePath)
})

defineExpose({
    menuFormRef
})
</script>

<style lang="scss" scoped>
.oa-menu-form {
    width: 100%;
}

.form-tips {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: #86909c;
}
</style>
