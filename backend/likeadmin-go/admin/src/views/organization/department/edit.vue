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
                <a-form-item v-if="formData.pid !== 0" label="上级部门" field="pid">
                    <a-tree-select
                        class="flex-1"
                        v-model="formData.pid"
                        :data="deptOptions"
                        :field-names="{
                            key: 'id',
                            title: 'name',
                            children: 'children'
                        }"
                        allow-clear
                        allow-search
                        :tree-props="{ defaultExpandAll: true }"
                        placeholder="请选择上级部门"
                    />
                </a-form-item>

                <a-form-item label="部门名称" field="name">
                    <a-input
                        v-model="formData.name"
                        placeholder="请输入部门名称"
                        allow-clear
                        :max-length="100"
                    />
                </a-form-item>

                <a-form-item label="负责人" field="duty">
                    <a-input
                        v-model="formData.duty"
                        placeholder="请输入负责人姓名"
                        allow-clear
                        :max-length="30"
                    />
                </a-form-item>

                <a-form-item label="联系电话" field="mobile">
                    <a-input v-model="formData.mobile" placeholder="请输入联系电话" allow-clear />
                </a-form-item>

                <a-form-item label="排序" field="sort">
                    <div>
                        <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                        <div class="form-tips">默认为0，数值越大越排前</div>
                    </div>
                </a-form-item>

                <a-form-item label="部门状态" field="isStop">
                    <a-switch v-model="formData.isStop" :checked-value="0" :unchecked-value="1" />
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { deptLists, deptEdit, deptAdd, deptDetail } from '@/api/org/department'
import Popup from '@/components/popup/index.vue'
import { useDictOptions } from '@/hooks/useDictOptions'
import feedback from '@/utils/feedback'

interface DepartmentFormData {
    id: string | number
    pid: string | number
    name: string
    duty: string
    mobile: string
    sort: number
    isStop: number
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑部门' : '新增部门'
})

/**
 * 函数说明：创建部门表单默认值，供新增/编辑切换时复位
 */
const createDefaultFormData = (): DepartmentFormData => ({
    id: '',
    pid: '',
    name: '',
    duty: '',
    mobile: '',
    sort: 0,
    isStop: 0
})

const formData = reactive<DepartmentFormData>(createDefaultFormData())

const formRules: Record<string, FieldRule[]> = {
    pid: [
        {
            required: true,
            message: '请选择上级部门',
            trigger: ['change']
        }
    ],
    name: [
        {
            required: true,
            message: '请输入部门名称',
            trigger: ['blur']
        }
    ],
    duty: [
        {
            required: true,
            message: '请输入负责人姓名',
            trigger: ['blur']
        }
    ],
    mobile: [
        {
            required: true,
            message: '请输入联系电话',
            trigger: ['blur']
        }
    ]
}

const { optionsData } = useDictOptions<{
    dept: any[]
}>({
    dept: {
        api: deptLists
    }
})

/**
 * 函数说明：对部门树数据做 disabled 标记，停用部门不可选
 */
const mapDeptOptions = (list: any[]): any[] => {
    return list.map((item) => ({
        ...item,
        disabled: Boolean(item.isStop),
        children: Array.isArray(item.children) ? mapDeptOptions(item.children) : []
    }))
}

const deptOptions = computed(() => {
    return mapDeptOptions(optionsData.dept || [])
})

/**
 * 函数说明：重置部门表单，避免弹窗二次打开数据污染
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：手机号格式校验，保障部门联系人字段可用性
 */
const validateMobile = (): boolean => {
    const value = String(formData.mobile || '').trim()
    const mobileReg = /^[1][3-9][0-9]{9}$/
    if (!mobileReg.test(value)) {
        feedback.msgError('请输入正确的手机号')
        return false
    }
    return true
}

/**
 * 函数说明：提交部门新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    if (!validateMobile()) {
        return
    }
    mode.value == 'edit' ? await deptEdit(formData) : await deptAdd(formData)
    popupRef.value?.close()
    feedback.msgSuccess('操作成功')
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
 * 函数说明：批量回填部门表单，兼容后端下划线字段
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
 * 函数说明：获取部门详情并回填编辑数据
 */
const getDetail = async (row: Record<string, any>) => {
    const data = await deptDetail({
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
