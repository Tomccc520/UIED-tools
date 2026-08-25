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
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-form-item label="岗位名称" field="name">
                    <a-input
                        v-model="formData.name"
                        placeholder="请输入岗位名称"
                        allow-clear
                        :max-length="100"
                    />
                </a-form-item>
                <a-form-item label="岗位编码" field="code">
                    <a-input v-model="formData.code" placeholder="请输入岗位编码" allow-clear />
                </a-form-item>
                <a-form-item label="排序" field="sort">
                    <div>
                        <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                        <div class="form-tips">默认为0，数值越大越排前</div>
                    </div>
                </a-form-item>
                <a-form-item label="备注" field="remarks">
                    <a-input
                        v-model="formData.remarks"
                        placeholder="请输入备注"
                        type="textarea"
                        :auto-size="{ minRows: 4, maxRows: 6 }"
                        :max-length="200"
                        show-word-limit
                    />
                </a-form-item>
                <a-form-item label="岗位状态" field="isStop">
                    <a-switch v-model="formData.isStop" :checked-value="0" :unchecked-value="1" />
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { postEdit, postAdd, postDetail } from '@/api/org/post'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

interface PostFormData {
    id: string | number
    name: string
    code: string
    sort: number
    remarks: string
    isStop: number
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑岗位' : '新增岗位'
})

/**
 * 函数说明：创建岗位表单默认值，供弹窗打开前重置
 */
const createDefaultFormData = (): PostFormData => ({
    id: '',
    name: '',
    code: '',
    sort: 0,
    remarks: '',
    isStop: 0
})

const formData = reactive<PostFormData>(createDefaultFormData())

const formRules: Record<string, FieldRule[]> = {
    code: [
        {
            required: true,
            message: '请输入岗位编码',
            trigger: ['blur']
        }
    ],
    name: [
        {
            required: true,
            message: '请输入岗位名称',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：重置岗位表单，避免新增和编辑状态互相污染
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：提交岗位新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    mode.value == 'edit' ? await postEdit(formData) : await postAdd(formData)
    feedback.msgSuccess('操作成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：打开弹窗并设置当前模式
 */
const open = (type = 'add') => {
    resetFormData()
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：回填岗位数据，兼容后端 is_stop 字段
 */
const setFormData = (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] !== null && data[key] !== undefined) {
            // @ts-ignore
            formData[key] = data[key]
            continue
        }
        if (key === 'isStop' && data.is_stop !== null && data.is_stop !== undefined) {
            formData.isStop = Number(data.is_stop)
        }
    }
}

/**
 * 函数说明：读取岗位详情并回填表单
 */
const getDetail = async (row: Record<string, any>) => {
    const data = await postDetail({
        id: row.id
    })
    setFormData(data)
}

/**
 * 函数说明：弹窗关闭时通知父组件
 */
const handleClose = () => {
    emit('close')
}

defineExpose({
    open,
    setFormData,
    getDetail
})
</script>
