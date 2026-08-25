<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div>
        <a-card class="!border-none" :bordered="false">
            <div class="flex items-center gap-2">
                <a-button type="text" @click="router.back()">
                    <template #icon>
                        <icon-left />
                    </template>
                    返回
                </a-button>
                <span class="font-medium">{{ String(route.meta.title || '通知设置') }}</span>
            </div>
        </a-card>

        <a-spin :loading="loading" class="w-full">
            <a-form ref="formRef" :model="formData" :rules="rules" layout="vertical">
                <a-card class="!border-none mt-4" :bordered="false">
                    <div class="font-medium mb-4">通知名称</div>
                    <a-form-item label="通知名称">{{ formData.name }}</a-form-item>
                    <a-form-item label="通知类型">{{ formData.type }}</a-form-item>
                    <a-form-item label="通知业务">{{ formData.remarks }}</a-form-item>
                </a-card>

                <a-card class="!border-none mt-4" :bordered="false">
                    <div class="font-medium mb-4">短信通知</div>
                    <a-form-item label="开启状态" field="smsNotice.status" required>
                        <a-radio-group v-model="formData.smsNotice.status">
                            <a-radio :value="0">关闭</a-radio>
                            <a-radio :value="1">开启</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="模板ID" field="smsNotice.templateId">
                        <div class="w-80">
                            <a-input
                                v-model="formData.smsNotice.templateId"
                                placeholder="请输入模板ID"
                                allow-clear
                            />
                        </div>
                    </a-form-item>
                    <a-form-item label="短信内容" field="smsNotice.content">
                        <div class="flex-1">
                            <div class="w-full max-w-[320px]">
                                <a-input
                                    v-model="formData.smsNotice.content"
                                    type="textarea"
                                    :auto-size="{ minRows: 6, maxRows: 6 }"
                                />
                            </div>
                            <div class="form-tips">
                                <div v-for="(item, index) in formData.smsNotice.tips" :key="index">
                                    {{ item }}
                                </div>
                            </div>
                        </div>
                    </a-form-item>
                </a-card>
            </a-form>
        </a-spin>

        <footer-btns>
            <a-button type="primary" @click="handleSave">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="noticeEdit">
import { IconLeft } from '@arco-design/web-vue/es/icon'
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import feedback from '@/utils/feedback'
import { noticeDetail, setNoticeConfig } from '@/api/message'
import useMultipleTabs from '@/hooks/useMultipleTabs'

interface NoticeSms {
    status: number
    templateId: string
    content: string
    tips: string[]
}

interface NoticeFormData {
    id: string | number
    name: string
    type: string
    remarks: string
    smsNotice: NoticeSms
}

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formRef = shallowRef<FormInstance>()
const formData = reactive<NoticeFormData>({
    id: '',
    name: '',
    type: '',
    remarks: '',
    smsNotice: {
        status: 0,
        templateId: '',
        content: '',
        tips: []
    }
})

const rules: Record<string, FieldRule[]> = {
    'smsNotice.templateId': [
        {
            required: true,
            message: '请输入模板ID',
            trigger: 'blur'
        }
    ],
    'smsNotice.content': [
        {
            required: true,
            message: '请输入短信内容',
            trigger: 'blur'
        }
    ]
}

const { removeTab } = useMultipleTabs()

/**
 * 函数说明：根据通知场景 ID 拉取详情配置
 */
const getDetails = async () => {
    loading.value = true
    try {
        const data = await noticeDetail({
            id: route.query.id
        })
        Object.keys(data).forEach((key) => {
            // @ts-ignore
            formData[key] = data[key]
        })
    } finally {
        loading.value = false
    }
}

/**
 * 函数说明：校验并保存通知配置，保存后返回上一页并关闭多标签页
 */
const handleSave = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    await setNoticeConfig(formData)
    feedback.msgSuccess('操作成功')
    removeTab()
    router.back()
}

route.query.id && getDetails()
</script>
