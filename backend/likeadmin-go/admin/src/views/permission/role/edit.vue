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
            :title="popupTitle"
            :async="true"
            width="620px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form ref="formRef" :rules="rules" :model="formData" layout="vertical">
                <a-alert
                    class="mb-4"
                    type="info"
                    :closable="false"
                    show-icon
                    content="角色名称建议与业务职责一致，便于权限排查和账号审计。"
                />
                <section class="form-section">
                    <div class="form-section__title">角色基础信息</div>
                    <div class="form-section__desc">角色名称将出现在管理员资料、授权页和操作日志中，建议直接对应业务职责。</div>
                    <a-form-item label="名称" field="name">
                        <a-input v-model="formData.name" placeholder="请输入名称" allow-clear />
                    </a-form-item>
                    <a-form-item label="备注" field="remark">
                        <a-input
                            v-model="formData.remark"
                            type="textarea"
                            :auto-size="{ minRows: 4, maxRows: 6 }"
                            placeholder="请输入备注"
                            :max-length="200"
                            show-word-limit
                        />
                    </a-form-item>
                </section>

                <section class="form-section">
                    <div class="form-section__title">排序与状态</div>
                    <div class="form-section__desc">排序决定角色在后台列表中的展示优先级，停用后不会影响历史数据，但会限制新的权限分配。</div>
                    <a-form-item label="排序" field="sort">
                        <a-input-number v-model="formData.sort" />
                    </a-form-item>
                    <a-form-item label="状态" field="isDisable">
                        <a-radio-group v-model="formData.isDisable">
                            <a-radio :value="0">正常</a-radio>
                            <a-radio :value="1">停用</a-radio>
                        </a-radio-group>
                    </a-form-item>
                </section>
            </a-form>
        </popup>
    </div>
</template>
<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { roleAdd, roleDetail, roleEdit } from '@/api/perms/role'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑角色' : '新增角色'
})

const formData = reactive({
    id: '',
    name: '',
    remark: '',
    sort: 0,
    isDisable: 0,
    menus: []
})

const rules: Record<string, FieldRule[]> = {
    name: [
        {
            required: true,
            message: '请输入名称',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：提交角色新增/编辑请求，先做表单校验再调用接口
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    const params = { ...formData, menuIds: formData.menus.join() }
    mode.value == 'edit' ? await roleEdit(params) : await roleAdd(params)
    popupRef.value?.close()
    feedback.msgSuccess('操作成功')
    emit('success')
}

/**
 * 函数说明：弹窗关闭时通知父组件同步状态
 */
const handleClose = () => {
    emit('close')
}

/**
 * 函数说明：打开弹窗并设置当前操作模式
 */
const open = (type = 'add') => {
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：按角色 ID 获取详情并填充编辑表单
 */
const setFormData = async (row: Record<any, any>) => {
    const data = await roleDetail({
        id: row.id
    })
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            formData[key] = data[key]
        }
    }
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
</style>
