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
                <a-form-item label="栏目名称" field="name">
                    <a-input v-model="formData.name" placeholder="请输入栏目名称" allow-clear />
                </a-form-item>
                <a-form-item label="排序" field="sort">
                    <div>
                        <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                        <div class="form-tips">默认为0，数值越大越排前</div>
                    </div>
                </a-form-item>
                <a-form-item label="状态" field="isShow">
                    <a-switch v-model="formData.isShow" :checked-value="1" :unchecked-value="0" />
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>
<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { articleCateEdit, articleCateAdd, articleCateDetail } from '@/api/article'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

interface ArticleColumnFormData {
    id: string | number
    name: string
    sort: number
    isShow: number
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑栏目' : '新增栏目'
})

/**
 * 函数说明：创建栏目表单默认值，避免新增与编辑状态污染
 */
const createDefaultFormData = (): ArticleColumnFormData => ({
    id: '',
    name: '',
    sort: 0,
    isShow: 1
})

const formData = reactive<ArticleColumnFormData>(createDefaultFormData())

const formRules: Record<string, FieldRule[]> = {
    name: [
        {
            required: true,
            message: '请输入栏目名称',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：重置栏目表单
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：提交栏目新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    mode.value == 'edit' ? await articleCateEdit(formData) : await articleCateAdd(formData)
    feedback.msgSuccess('操作成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：打开栏目弹窗并设置模式
 */
const open = (type = 'add') => {
    resetFormData()
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：回填栏目表单字段
 */
const setFormData = (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            // @ts-ignore
            formData[key] = data[key]
        }
    }
}

/**
 * 函数说明：获取栏目详情并回填弹窗
 */
const getDetail = async (row: Record<string, any>) => {
    const data = await articleCateDetail({
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
