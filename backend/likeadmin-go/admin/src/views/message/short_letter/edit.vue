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
            title="设置存储"
            :async="true"
            width="550px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-form-item label="短信渠道">
                    <div>{{ formData.name }}</div>
                </a-form-item>

                <a-form-item label="短信签名" field="sign">
                    <a-input v-model="formData.sign" placeholder="请输入短信签名" allow-clear />
                </a-form-item>

                <a-form-item v-if="formData.alias == 'aliyun'" label="APP_KEY" field="appKey">
                    <a-input v-model="formData.appKey" placeholder="请输入APP_KEY" allow-clear />
                </a-form-item>

                <a-form-item v-if="formData.alias == 'tencent'" label="APP_ID" field="appId">
                    <a-input v-model="formData.appId" placeholder="请输入APP_ID" allow-clear />
                </a-form-item>

                <a-form-item v-if="formData.alias == 'tencent'" label="SECRET_ID" field="secretId">
                    <a-input
                        v-model="formData.secretId"
                        placeholder="请输入SECRET_ID"
                        allow-clear
                    />
                </a-form-item>

                <a-form-item label="SECRET_KEY" field="secretKey">
                    <a-input
                        v-model="formData.secretKey"
                        placeholder="请输入SECRET_KEY"
                        allow-clear
                    />
                </a-form-item>

                <a-form-item label="状态" field="status">
                    <a-radio-group v-model="formData.status">
                        <a-radio :value="0">关闭</a-radio>
                        <a-radio :value="1">开启</a-radio>
                    </a-radio-group>
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { setSmsConfig, smsDetail } from '@/api/message'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

interface SmsFormData {
    name: string
    alias: string
    sign: string
    appKey: string
    appId: string
    secretKey: string
    secretId: string
    status: number
}

const emit = defineEmits(['success'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()

/**
 * 函数说明：创建短信渠道默认表单数据
 */
const createDefaultFormData = (): SmsFormData => ({
    name: '',
    alias: '',
    sign: '',
    appKey: '',
    appId: '',
    secretKey: '',
    secretId: '',
    status: 0
})

const formData = reactive<SmsFormData>(createDefaultFormData())

const formRules: Record<string, FieldRule[]> = {
    sign: [
        {
            required: true,
            message: '请输入短信签名',
            trigger: 'blur'
        }
    ],
    appId: [
        {
            required: true,
            message: '请输入APP_ID',
            trigger: 'blur'
        }
    ],
    appKey: [
        {
            required: true,
            message: '请输入APP_KEY',
            trigger: 'blur'
        }
    ],
    secretKey: [
        {
            required: true,
            message: '请输入SECRET_KEY',
            trigger: 'blur'
        }
    ],
    secretId: [
        {
            required: true,
            message: '请输入SECRET_ID',
            trigger: 'blur'
        }
    ]
}

/**
 * 函数说明：提交短信渠道配置并刷新列表
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    await setSmsConfig(formData)
    feedback.msgSuccess('操作成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：根据渠道别名读取短信配置详情
 */
const getDetail = async () => {
    const data = await smsDetail({
        alias: formData.alias
    })
    for (const key in data) {
        // @ts-ignore
        formData[key] = data[key]
    }
}

/**
 * 函数说明：打开配置弹窗并按渠道加载详情
 */
const open = async (type: string) => {
    formData.alias = type
    popupRef.value?.open()
    await getDetail()
}

/**
 * 函数说明：关闭弹窗时重置短信配置表单
 */
const handleClose = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

defineExpose({
    open
})
</script>
