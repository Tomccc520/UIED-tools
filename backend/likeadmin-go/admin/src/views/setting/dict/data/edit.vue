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
            width="550px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form ref="formRef" :rules="rules" :model="formData" layout="vertical">
                <a-alert
                    class="mb-4"
                    type="info"
                    :closable="false"
                    show-icon
                    content="数据值建议保持唯一且稳定，避免业务侧联动字段错配。"
                />
                <a-form-item label="字典类型">
                    <a-input
                        :model-value="formData.typeValue"
                        placeholder="请输入字典类型"
                        disabled
                    />
                </a-form-item>
                <a-form-item label="数据名称" field="name">
                    <a-input v-model="formData.name" placeholder="请输入数据名称" allow-clear />
                </a-form-item>
                <a-form-item label="数据值" field="value">
                    <a-input v-model="formData.value" placeholder="请输入数据值" allow-clear />
                </a-form-item>
                <a-form-item label="排序" field="sort">
                    <div>
                        <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                        <div class="form-tips">数值越大越排前</div>
                    </div>
                </a-form-item>
                <a-form-item label="状态" field="status" required>
                    <a-radio-group v-model="formData.status">
                        <a-radio :value="1">正常</a-radio>
                        <a-radio :value="0">停用</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="备注" field="remark">
                    <a-input
                        v-model="formData.remark"
                        type="textarea"
                        :auto-size="{ minRows: 4, maxRows: 6 }"
                        allow-clear
                        :max-length="200"
                        show-word-limit
                    />
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>
<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import Popup from '@/components/popup/index.vue'
import { dictDataAdd, dictDataEdit } from '@/api/setting/dict'
import feedback from '@/utils/feedback'

interface DictDataFormData {
    id: string | number
    typeValue: string
    name: string
    value: string
    sort: number
    status: number
    remark: string
    typeId: number
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑字典数据' : '新增字典数据'
})

/**
 * 函数说明：创建字典数据默认值，避免新增/编辑切换产生数据残留
 */
const createDefaultFormData = (): DictDataFormData => ({
    id: '',
    typeValue: '',
    name: '',
    value: '',
    sort: 0,
    status: 1,
    remark: '',
    typeId: 0
})

const formData = reactive<DictDataFormData>(createDefaultFormData())

const rules: Record<string, FieldRule[]> = {
    name: [
        {
            required: true,
            message: '请输入数据名称',
            trigger: ['blur']
        }
    ],
    value: [
        {
            required: true,
            message: '请输入数据值',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：重置字典数据表单
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：提交字典数据新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    mode.value == 'edit' ? await dictDataEdit(formData) : await dictDataAdd(formData)
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
 * 函数说明：打开字典数据弹窗并按模式重置表单
 */
const open = (type = 'add') => {
    resetFormData()
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：回填字典数据表单字段
 */
const setFormData = (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] !== null && data[key] !== undefined) {
            // @ts-ignore
            formData[key] = data[key]
        }
    }
}

defineExpose({
    open,
    setFormData
})
</script>
