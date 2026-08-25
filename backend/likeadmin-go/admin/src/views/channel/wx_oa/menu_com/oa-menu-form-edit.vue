<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-30
 */
-->
<script lang="ts" setup>
import type { FormInstance } from '@arco-design/web-vue'
import oaMenuForm from './oa-menu-form.vue'

const emit = defineEmits<{
    (event: 'add', value: any): void
    (event: 'edit', value: any): void
}>()

const props = withDefaults(
    defineProps<{
        modular: string
        subItem?: any
    }>(),
    {
        modular: 'edit',
        subItem: {}
    }
)

const menuFormEditRef = shallowRef<{ menuFormRef?: FormInstance }>()
const visible = ref(false)

const form = reactive({
    name: '',
    visitType: 'view',
    url: '',
    appId: '',
    pagePath: ''
})

const modalTitle = computed(() => `${props.modular === 'add' ? '新增' : '编辑'}子菜单`)
const modalSummary = computed(() => {
    return props.modular === 'add'
        ? '补齐子菜单名称和访问方式后，即可把该入口挂到当前一级菜单下。'
        : '调整子菜单名称、网页地址或小程序参数后，记得保存并重新发布菜单。'
})

/**
 * 重置子菜单表单为默认值，避免新增时残留上次编辑内容
 */
const resetFormValues = () => {
    form.name = ''
    form.visitType = 'view'
    form.url = ''
    form.appId = ''
    form.pagePath = ''
}

/**
 * 根据传入子菜单同步编辑表单数据
 */
const syncFormBySubItem = () => {
    resetFormValues()
    if (!props.subItem || Object.keys(props.subItem).length === 0) {
        return
    }
    form.name = props.subItem.name ?? ''
    form.visitType = props.subItem.visitType ?? 'view'
    form.url = props.subItem.url ?? ''
    form.appId = props.subItem.appId ?? ''
    form.pagePath = props.subItem.pagePath ?? ''
}

/**
 * 打开弹窗前同步一次表单数据，确保编辑态和新增态数据正确
 */
const openModal = () => {
    syncFormBySubItem()
    visible.value = true
}

/**
 * 关闭弹窗并清空表单状态
 */
const closeModal = () => {
    visible.value = false
    menuFormEditRef.value?.menuFormRef?.resetFields?.()
}

const handleRules = async () => {
    const errors = await menuFormEditRef.value?.menuFormRef?.validate?.()
    if (errors && Object.keys(errors).length > 0) {
        return
    }
    if (props.modular === 'edit') {
        emit('edit', { ...form })
    } else {
        emit('add', { ...form })
    }
    closeModal()
}
</script>

<template>
    <div class="inline" @click.stop="openModal">
        <slot></slot>
    </div>
    <a-modal
        v-model:visible="visible"
        :title="modalTitle"
        :mask-closable="false"
        :closable="true"
        width="560px"
        @cancel="closeModal"
    >
        <div class="menu-form-edit__intro">
            <div class="menu-form-edit__intro-title">{{ modalTitle }}</div>
            <div class="menu-form-edit__intro-desc">{{ modalSummary }}</div>
        </div>
        <oa-menu-form
            ref="menuFormEditRef"
            modular="secondary"
            v-model:name="form.name"
            v-model:visitType="form.visitType"
            v-model:url="form.url"
            v-model:appId="form.appId"
            v-model:pagePath="form.pagePath"
        ></oa-menu-form>
        <template #footer>
            <div class="flex justify-end gap-3">
                <a-button @click="closeModal">取消</a-button>
                <a-button type="primary" @click="handleRules">确定</a-button>
            </div>
        </template>
    </a-modal>
</template>

<style lang="scss" scoped>
.menu-form-edit__intro {
    margin-bottom: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.menu-form-edit__intro-title {
    font-size: 15px;
    font-weight: 700;
    color: #1d2129;
}

.menu-form-edit__intro-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: #86909c;
}
</style>
