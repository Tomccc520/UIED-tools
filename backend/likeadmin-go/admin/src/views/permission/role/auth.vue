<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="edit-popup">
        <popup
            ref="popupRef"
            title="权限设置"
            :async="true"
            width="680px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form :model="formData" layout="vertical">
                <a-alert
                    class="mb-4"
                    type="info"
                    :closable="false"
                    show-icon
                    :content="`当前正在维护角色「${formData.name || '未命名角色'}」的菜单权限，建议先确认是否需要父子联动，再批量勾选。`"
                />
                <section class="form-section">
                    <div class="form-section__title">权限树操作</div>
                    <div class="form-section__desc">展开、全选和父子联动会影响整棵菜单树的勾选结果，建议先确认策略后再批量处理。</div>
                    <div class="tree-ops">
                        <a-checkbox @change="handleExpand">展开 / 折叠</a-checkbox>
                        <a-checkbox @change="handleSelectAll">全选 / 不全选</a-checkbox>
                        <a-checkbox v-model="checkStrictly">父子联动</a-checkbox>
                    </div>
                </section>
                <section class="form-section">
                    <div class="form-section__title">菜单权限</div>
                    <div class="form-section__desc">提交时会自动合并全选和半选节点，避免父节点缺失导致权限树不完整。</div>
                    <a-scrollbar class="permission-tree-scroll">
                        <a-form-item label="权限" field="menus" class="!mb-0">
                            <a-tree
                                ref="treeRef"
                                :data="menuTree"
                                :field-names="{
                                    key: 'id',
                                    title: 'menuName',
                                    children: 'children'
                                }"
                                :check-strictly="!checkStrictly"
                                checkable
                                v-model:checked-keys="checkedKeys"
                                v-model:half-checked-keys="halfCheckedKeys"
                            />
                        </a-form-item>
                    </a-scrollbar>
                </section>
            </a-form>
        </popup>
    </div>
</template>
<script lang="ts" setup>
import { roleDetail, roleEdit } from '@/api/perms/role'
import { menuLists } from '@/api/perms/menu'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
const emit = defineEmits(['success', 'close'])
const treeRef = shallowRef<any>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const checkStrictly = ref(true)
const checkedKeys = ref<Array<string | number>>([])
const halfCheckedKeys = ref<Array<string | number>>([])
const menuTree = ref<any[]>([])
const formData = reactive({
    id: '',
    name: '',
    remark: '',
    sort: 0,
    isDisable: 0,
    menus: [] as any[]
})

/**
 * 函数说明：加载权限菜单树，供角色权限勾选使用
 */
const getOptions = async () => {
    const data = await menuLists()
    menuTree.value = data
}

/**
 * 函数说明：汇总“全选 + 半选”节点，保证父子联动时权限提交完整
 */
const getDeptAllCheckedKeys = () => {
    return Array.from(new Set([...checkedKeys.value, ...halfCheckedKeys.value]))
}

/**
 * 函数说明：根据角色已选菜单回填树勾选状态
 */
const setDeptAllCheckedKeys = () => {
    checkedKeys.value = formData.menus.map((id) =>
        typeof id === 'string' || typeof id === 'number' ? id : String(id)
    )
    halfCheckedKeys.value = []
}

/**
 * 函数说明：批量展开/折叠菜单树
 */
const handleExpand = (check: boolean) => {
    treeRef.value?.expandAll(Boolean(check))
}

/**
 * 函数说明：批量全选/取消全选菜单节点
 */
const handleSelectAll = (check: boolean) => {
    treeRef.value?.checkAll(Boolean(check))
    if (!check) {
        checkedKeys.value = []
        halfCheckedKeys.value = []
    }
}

/**
 * 函数说明：提交角色权限配置
 */
const handleSubmit = async () => {
    formData.menus = getDeptAllCheckedKeys() as any[]
    await roleEdit({ ...formData, menuIds: formData.menus.join() })
    popupRef.value?.close()
    feedback.msgSuccess('操作成功')
    emit('success')
}

/**
 * 函数说明：弹窗关闭时通知父组件
 */
const handleClose = () => {
    emit('close')
}

/**
 * 函数说明：打开权限设置弹窗
 */
const open = () => {
    popupRef.value?.open()
}

/**
 * 函数说明：读取角色详情并回填权限树选中状态
 */
const setFormData = async (row: Record<any, any>) => {
    await getOptions()
    const data = await roleDetail({
        id: row.id
    })
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            formData[key] = data[key]
        }
    }
    nextTick(() => {
        setDeptAllCheckedKeys()
    })
}

defineExpose({
    open,
    setFormData
})
</script>

<style scoped lang="scss">
.form-section {
    padding: 16px 18px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);

    & + & {
        margin-top: 14px;
    }
}

.form-section__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.form-section__desc {
    margin-top: 6px;
    margin-bottom: 14px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.tree-ops {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
}

.permission-tree-scroll {
    height: 420px;
}
</style>
