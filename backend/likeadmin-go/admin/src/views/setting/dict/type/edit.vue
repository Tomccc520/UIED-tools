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
                    content="字典类型建议使用稳定且语义清晰的英文 key，避免频繁改动。"
                />
                <a-form-item label="字典名称" field="dictName">
                    <a-input v-model="formData.dictName" placeholder="请输入字典名称" allow-clear />
                </a-form-item>
                <a-form-item label="字典类型" field="dictType">
                    <a-input v-model="formData.dictType" placeholder="请输入字典类型" allow-clear />
                </a-form-item>
                <a-form-item label="字典状态" field="dictStatus" required>
                    <a-radio-group v-model="formData.dictStatus">
                        <a-radio :value="1">正常</a-radio>
                        <a-radio :value="0">停用</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="备注" field="dictRemark">
                    <a-input
                        v-model="formData.dictRemark"
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
import { dictTypeAdd, dictTypeEdit } from '@/api/setting/dict'
import feedback from '@/utils/feedback'

interface DictTypeFormData {
    id: string | number
    dictName: string
    dictType: string
    dictStatus: number
    dictRemark: string
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑字典类型' : '新增字典类型'
})

/**
 * 函数说明：创建字典类型默认表单，避免新增和编辑数据互相污染
 */
const createDefaultFormData = (): DictTypeFormData => ({
    id: '',
    dictName: '',
    dictType: '',
    dictStatus: 1,
    dictRemark: ''
})

const formData = reactive<DictTypeFormData>(createDefaultFormData())

const rules: Record<string, FieldRule[]> = {
    dictName: [
        {
            required: true,
            message: '请输入字典名称',
            trigger: ['blur']
        }
    ],
    dictType: [
        {
            required: true,
            message: '请输入字典类型',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：提交字典类型新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    mode.value == 'edit' ? await dictTypeEdit(formData) : await dictTypeAdd(formData)
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
 * 函数说明：打开弹窗并设置当前模式，同时重置默认值
 */
const open = (type = 'add') => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：回填编辑数据
 */
const setFormData = (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
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
