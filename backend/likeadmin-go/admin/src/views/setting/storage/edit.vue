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
            <a-form ref="formRef" :model="formData" layout="vertical">
                <a-form-item label="存储方式">
                    <div>
                        <a-input :model-value="getStorageInfo?.name || ''" disabled />
                        <div class="form-tips">{{ getStorageInfo?.tips }}</div>
                    </div>
                </a-form-item>

                <template v-if="formData.alias !== StorageEnum.LOCAL">
                    <a-form-item label="存储空间名称">
                        <a-input
                            v-model="formData.bucket"
                            placeholder="请输入存储空间名称(Bucket)"
                            allow-clear
                        />
                    </a-form-item>
                    <a-form-item label="ACCESS_KEY">
                        <a-input
                            v-model="formData.accessKey"
                            placeholder="请输入ACCESS_KEY(AK)"
                            allow-clear
                        />
                    </a-form-item>
                    <a-form-item label="SECRET_KEY">
                        <a-input
                            v-model="formData.secretKey"
                            placeholder="请输入SECRET_KEY(SK)"
                            allow-clear
                        />
                    </a-form-item>
                    <a-form-item label="空间域名">
                        <div class="w-full">
                            <a-input
                                v-model="formData.domain"
                                placeholder="请输入空间域名(Domain)"
                                allow-clear
                            />
                            <div class="form-tips">
                                请补全http://或https://，例如https://static.cloud.com
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item v-if="formData.alias == StorageEnum.QCLOUD" label="REGION">
                        <a-input v-model="formData.region" placeholder="请输入region" allow-clear />
                    </a-form-item>
                </template>

                <a-form-item label="状态">
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
import Popup from '@/components/popup/index.vue'
import { storageDetail, storageSetup } from '@/api/setting/storage'
import feedback from '@/utils/feedback'

enum StorageEnum {
    LOCAL = 'local',
    QINIU = 'qiniu',
    ALIYUN = 'aliyun',
    QCLOUD = 'qcloud'
}

interface StorageFormData {
    alias: string
    bucket: string
    accessKey: string
    secretKey: string
    domain: string
    region: string
    status: number
}

const emit = defineEmits(['success'])
const popupRef = shallowRef<InstanceType<typeof Popup>>()

const storageArr = [
    {
        name: '本地存储',
        type: StorageEnum.LOCAL,
        tips: '本地存储方式不需要配置其他参数'
    },
    {
        name: '七牛云存储',
        type: StorageEnum.QINIU,
        tips: '切换七牛云存储后，素材库需要重新上传至七牛云'
    },
    {
        name: '阿里云OSS',
        type: StorageEnum.ALIYUN,
        tips: '切换阿里云OSS后，素材库需要重新上传至阿里云OSS'
    },
    {
        name: '腾讯云OSS',
        type: StorageEnum.QCLOUD,
        tips: '切换腾讯云OSS后，素材库需要重新上传至腾讯云OSS'
    }
]

/**
 * 函数说明：生成存储配置默认值，确保弹窗每次打开状态一致
 */
const createDefaultFormData = (): StorageFormData => ({
    alias: '',
    bucket: '',
    accessKey: '',
    secretKey: '',
    domain: '',
    region: '',
    status: 0
})

const formData = reactive<StorageFormData>(createDefaultFormData())

const getStorageInfo = computed(() => {
    return storageArr.find((item) => item.type == formData.alias)
})

/**
 * 函数说明：重置存储配置表单，避免不同引擎之间字段串值
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：校验当前存储引擎所需字段
 */
const validateStorageForm = (): boolean => {
    if (formData.alias === StorageEnum.LOCAL) {
        return true
    }
    if (!formData.bucket.trim()) {
        feedback.msgError('请输入存储空间名称')
        return false
    }
    if (!formData.accessKey.trim()) {
        feedback.msgError('请输入ACCESS_KEY')
        return false
    }
    if (!formData.secretKey.trim()) {
        feedback.msgError('请输入SECRET_KEY')
        return false
    }
    if (!formData.domain.trim()) {
        feedback.msgError('请输入空间域名')
        return false
    }
    if (!/^https?:\/\//i.test(formData.domain.trim())) {
        feedback.msgError('空间域名需以 http:// 或 https:// 开头')
        return false
    }
    if (formData.alias === StorageEnum.QCLOUD && !formData.region.trim()) {
        feedback.msgError('请输入REGION')
        return false
    }
    return true
}

/**
 * 函数说明：提交存储引擎配置
 */
const handleSubmit = async () => {
    if (!validateStorageForm()) {
        return
    }
    await storageSetup(formData)
    feedback.msgSuccess('操作成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：读取当前引擎详情并回填表单
 */
const getDetail = async () => {
    const data = await storageDetail({
        alias: formData.alias
    })
    for (const key in formData) {
        if (data[key] !== null && data[key] !== undefined) {
            // @ts-ignore
            formData[key] = data[key]
        }
    }
}

/**
 * 函数说明：打开存储配置弹窗并加载详情数据
 */
const open = async (type: string) => {
    resetFormData()
    formData.alias = type
    popupRef.value?.open()
    await getDetail()
}

/**
 * 函数说明：弹窗关闭时重置表单
 */
const handleClose = () => {
    resetFormData()
}

defineExpose({
    open
})
</script>
