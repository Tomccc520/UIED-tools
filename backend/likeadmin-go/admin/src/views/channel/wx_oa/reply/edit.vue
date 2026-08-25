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
            width="500px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <div class="reply-edit__intro">
                <div class="reply-edit__intro-title">{{ popupTitle }}</div>
                <div class="reply-edit__intro-desc">{{ popupSummary }}</div>
            </div>
            <a-form
                ref="formRef"
                :model="formData"
                :rules="formRules"
                class="reply-edit__form"
                layout="vertical"
            >
                <div class="reply-edit__section">
                    <div class="reply-edit__section-title">规则信息</div>
                    <div class="reply-edit__section-desc">用于管理规则名称、关键词与匹配方式。</div>
                </div>
                <a-form-item label="规则名称" field="name">
                    <div class="w-full">
                        <a-input v-model="formData.name" placeholder="请输入规则名称" allow-clear />
                        <div class="form-tips">方便通过名称管理关注回复内容</div>
                    </div>
                </a-form-item>

                <a-form-item v-if="formData.type == 'keyword'" label="关键词" field="keyword">
                    <div class="w-full">
                        <a-input
                            v-model="formData.keyword"
                            placeholder="请输入关键词"
                            allow-clear
                        />
                        <div class="form-tips">方便通过名称管理关键词回复内容</div>
                    </div>
                </a-form-item>

                <a-form-item
                    v-if="formData.type == 'keyword'"
                    label="匹配方式"
                    field="matchingType"
                >
                    <div class="w-full">
                        <a-radio-group v-model="formData.matchingType">
                            <a-radio :value="1">全匹配</a-radio>
                            <a-radio :value="2">模糊匹配</a-radio>
                        </a-radio-group>
                        <div class="form-tips">
                            模糊匹配时，关键词部分匹配用户输入内容即可触发回复
                        </div>
                    </div>
                </a-form-item>

                <div class="reply-edit__section">
                    <div class="reply-edit__section-title">回复设置</div>
                    <div class="reply-edit__section-desc">目前仅支持文本回复，建议控制在 200 字以内。</div>
                </div>
                <a-form-item label="回复类型" field="contentType">
                    <div class="w-full">
                        <a-radio-group v-model="formData.contentType">
                            <a-radio :value="1">文本</a-radio>
                        </a-radio-group>
                        <div class="form-tips">暂时只支持文本类型</div>
                    </div>
                </a-form-item>

                <a-form-item label="回复内容" field="content">
                    <div class="w-full">
                        <a-input
                            v-model="formData.content"
                            :auto-size="{ minRows: 4, maxRows: 4 }"
                            type="textarea"
                            :max-length="200"
                            show-word-limit
                            placeholder="请输入回复内容"
                            allow-clear
                        />
                    </div>
                </a-form-item>

                <div class="reply-edit__section">
                    <div class="reply-edit__section-title">排序与状态</div>
                    <div class="reply-edit__section-desc">排序值越小优先级越高，启用后才会正式生效。</div>
                </div>
                <a-form-item label="排序">
                    <div class="w-full">
                        <a-input-number v-model="formData.sort" :min="0" :max="9999" />
                    </div>
                </a-form-item>

                <a-form-item label="启用状态">
                    <a-switch v-model="formData.status" :checked-value="1" :unchecked-value="0" />
                </a-form-item>
            </a-form>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { getOaReplyDetail, oaReplyAdd, oaReplyEdit } from '@/api/channel/wx_oa'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'

interface OaReplyFormData {
    id: string | number
    name: string
    type: string
    contentType: number
    keyword: string
    content: string
    matchingType: number
    status: number
    sort: number
}

const emit = defineEmits(['success', 'close'])

const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value === 'edit' ? '编辑回复规则' : '新增回复规则'
})
const popupSummary = computed(() => {
    if (formData.type === 'keyword') {
        return '关键词回复适合处理高频问题或品牌词，建议同时检查匹配方式和排序优先级。'
    }
    if (formData.type === 'follow') {
        return '关注回复会在粉丝首次关注时触发，建议只保留一条正式启用的欢迎消息。'
    }
    return '默认回复会在用户消息未命中关键词时触发，建议作为统一兜底反馈使用。'
})

/**
 * 函数说明：创建回复规则表单默认值
 */
const createDefaultFormData = (): OaReplyFormData => ({
    id: '',
    name: '',
    type: '',
    contentType: 1,
    keyword: '',
    content: '',
    matchingType: 1,
    status: 1,
    sort: 0
})

const formData = reactive<OaReplyFormData>(createDefaultFormData())

const formRules: Record<string, FieldRule[]> = {
    name: [
        {
            required: true,
            message: '请输入规则名称',
            trigger: ['blur']
        }
    ],
    contentType: [
        {
            required: true,
            message: '请选择回复类型',
            trigger: ['change']
        }
    ],
    content: [
        {
            required: true,
            message: '请输入回复内容',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：重置回复规则表单
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：校验关键词回复的专属字段
 */
const validateKeywordFields = (): boolean => {
    if (formData.type !== 'keyword') {
        return true
    }
    if (!String(formData.keyword || '').trim()) {
        feedback.msgError('请输入关键词')
        return false
    }
    if (![1, 2].includes(Number(formData.matchingType))) {
        feedback.msgError('请选择匹配方式')
        return false
    }
    return true
}

/**
 * 函数说明：提交回复规则新增/编辑请求
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    if (!validateKeywordFields()) {
        return
    }

    mode.value === 'edit' ? await oaReplyEdit(formData) : await oaReplyAdd(formData)
    feedback.msgSuccess('操作成功')
    popupRef.value?.close()
    emit('success')
}

/**
 * 函数说明：打开弹窗并设置当前回复类型
 */
const open = (modes = 'add', type = '') => {
    resetFormData()
    mode.value = modes
    formData.type = type
    popupRef.value?.open()
}

/**
 * 函数说明：批量回填回复规则表单
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
 * 函数说明：获取回复规则详情并回填弹窗
 */
const getDetail = async (row: Record<string, any>) => {
    const data = await getOaReplyDetail({
        id: row.id,
        type: formData.type
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

<style lang="scss" scoped>
.reply-edit__intro {
    margin-bottom: 16px;
    padding: 14px 16px;
    border-radius: 14px;
    background: #f7f8fa;
}

.reply-edit__intro-title {
    font-size: 15px;
    font-weight: 700;
    color: #1d2129;
}

.reply-edit__intro-desc {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: #86909c;
}

.reply-edit__form {
    padding-right: 4px;
}

.reply-edit__section {
    margin-bottom: 12px;
}

.reply-edit__section-title {
    font-size: 14px;
    font-weight: 700;
    color: #1d2129;
}

.reply-edit__section-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.7;
    color: #86909c;
}

.form-tips {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.7;
    color: #86909c;
}
</style>
