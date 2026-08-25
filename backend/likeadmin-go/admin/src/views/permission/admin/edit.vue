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
            width="640px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-alert
                    class="mb-4"
                    type="info"
                    :closable="false"
                    show-icon
                    content="管理员账号会影响后台登录与权限继承，建议先确定角色和部门归属，再处理密码与启停状态。"
                />

                <section class="form-section">
                    <div class="form-section__title">基础信息</div>
                    <div class="form-section__desc">维护登录账号、显示名称和头像，用于后台导航、日志和操作记录展示。</div>
                    <a-form-item label="账号" field="username">
                        <a-input
                            v-model="formData.username"
                            :disabled="isRoot"
                            placeholder="请输入账号"
                            allow-clear
                        />
                    </a-form-item>

                    <a-form-item label="名称" field="nickname">
                        <a-input v-model="formData.nickname" placeholder="请输入名称" allow-clear />
                    </a-form-item>

                    <a-form-item label="头像">
                        <div>
                            <div>
                                <material-picker v-model="formData.avatar" :limit="1" />
                            </div>
                            <div class="form-tips">建议尺寸：100×100 px，支持 jpg、jpeg、png。</div>
                        </div>
                    </a-form-item>
                </section>

                <section class="form-section">
                    <div class="form-section__title">组织与权限</div>
                    <div class="form-section__desc">为管理员指定部门、岗位和角色，后续功能访问将按角色与菜单权限联动生效。</div>
                    <a-form-item label="归属部门" field="deptId">
                        <a-tree-select
                            class="flex-1"
                            v-model="formData.deptId"
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

                    <a-form-item label="岗位" field="postId">
                        <a-select
                            v-model="formData.postId"
                            class="flex-1"
                            allow-clear
                            placeholder="请选择岗位"
                        >
                            <a-option
                                v-for="(item, index) in optionsData.post"
                                :key="index"
                                :value="item.id"
                            >
                                {{ item.name }}
                            </a-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="角色" field="role">
                        <a-select
                            v-model="formData.role"
                            :disabled="isRoot"
                            class="flex-1"
                            allow-clear
                            placeholder="请选择角色"
                        >
                            <a-option v-if="isRoot" :value="0">系统管理员</a-option>
                            <a-option
                                v-for="(item, index) in optionsData.role"
                                :key="index"
                                :value="item.id"
                            >
                                {{ item.name }}
                            </a-option>
                        </a-select>
                    </a-form-item>
                </section>

                <section class="form-section">
                    <div class="form-section__title">安全与状态</div>
                    <div class="form-section__desc">密码仅在新增或主动修改时生效；停用状态会影响登录权限，多处登录用于控制会话并发。</div>
                    <a-form-item label="密码" field="password">
                        <a-input
                            v-model.trim="formData.password"
                            type="password"
                            allow-clear
                            placeholder="请输入密码"
                        />
                    </a-form-item>

                    <a-form-item label="确认密码" field="passwordConfirm">
                        <a-input
                            v-model.trim="formData.passwordConfirm"
                            type="password"
                            allow-clear
                            placeholder="请输入确认密码"
                        />
                    </a-form-item>

                    <a-form-item v-if="!isRoot" label="管理员状态">
                        <div>
                            <a-switch
                                v-model="formData.isDisable"
                                :checked-value="0"
                                :unchecked-value="1"
                            />
                            <div class="form-tips">停用后该管理员将无法继续登录后台。</div>
                        </div>
                    </a-form-item>

                    <a-form-item label="多处登录">
                        <div>
                            <a-switch
                                v-model="formData.isMultipoint"
                                :checked-value="1"
                                :unchecked-value="0"
                            />
                            <div class="form-tips">开启后允许同一账号在多个终端同时在线。</div>
                        </div>
                    </a-form-item>
                </section>
            </a-form>
        </popup>
    </div>
</template>

<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import Popup from '@/components/popup/index.vue'
import { adminAdd, adminEdit, adminDetail } from '@/api/perms/admin'
import { useDictOptions } from '@/hooks/useDictOptions'
import { roleAll } from '@/api/perms/role'
import { postAll } from '@/api/org/post'
import { deptLists } from '@/api/org/department'
import feedback from '@/utils/feedback'

type SingleValue = string | number
interface AdminFormData {
    id: string
    username: string
    nickname: string
    deptId: string | number
    postId: SingleValue
    role: SingleValue
    avatar: string
    password: string
    passwordConfirm: string
    isDisable: number
    isMultipoint: number
    sort: number
}

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')

const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑管理员' : '新增管理员'
})

/**
 * 函数说明：创建管理员表单默认值，避免新增/编辑切换时残留历史状态
 */
const createDefaultFormData = (): AdminFormData => ({
    id: '',
    username: '',
    nickname: '',
    deptId: '',
    postId: '',
    role: '',
    avatar: '',
    password: '',
    passwordConfirm: '',
    isDisable: 0,
    isMultipoint: 1,
    // 服务端为必传参数，先给默认值
    sort: 1
})

const formData = reactive<AdminFormData>(createDefaultFormData())

const isRoot = computed(() => {
    return String(formData.role) === '0'
})

const formRules: Record<string, FieldRule[]> = reactive({
    username: [
        {
            required: true,
            message: '请输入账号',
            trigger: ['blur']
        }
    ],
    nickname: [
        {
            required: true,
            message: '请输入名称',
            trigger: ['blur']
        }
    ],
    role: [
        {
            required: true,
            message: '请选择角色',
            trigger: ['change']
        }
    ],
    deptId: [
        {
            required: true,
            message: '请选择归属部门',
            trigger: ['change']
        }
    ],
    postId: [
        {
            required: true,
            message: '请选择岗位',
            trigger: ['change']
        }
    ]
})

const { optionsData } = useDictOptions<{
    role: any[]
    post: any[]
    dept: any[]
}>({
    role: {
        api: roleAll
    },
    post: {
        api: postAll
    },
    dept: {
        api: deptLists
    }
})

/**
 * 函数说明：将历史数组或逗号字符串统一转换为单值，保持与 Go 接口标量契约一致。
 */
const normalizeSingleValue = (value: unknown): SingleValue => {
    if (Array.isArray(value)) {
        const firstValue = value.find((item) => item !== null && item !== undefined && item !== '')
        return (firstValue ?? '') as SingleValue
    }
    if (value === null || value === undefined || value === '') {
        return ''
    }
    if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map((item) => item.trim()).find(Boolean) || ''
    }
    return value as SingleValue
}

/**
 * 函数说明：递归标准化部门树节点，为停用节点补充 disabled 标记
 */
const mapDeptOptions = (list: any[]): any[] => {
    return list.map((node) => ({
        ...node,
        disabled: Boolean(node.isStop),
        children: Array.isArray(node.children) ? mapDeptOptions(node.children) : []
    }))
}

const deptOptions = computed(() => {
    return mapDeptOptions(optionsData.dept || [])
})

/**
 * 函数说明：将表单恢复到默认状态，避免弹窗二次打开时数据污染
 */
const resetFormData = () => {
    const defaults = createDefaultFormData()
    for (const key in defaults) {
        // @ts-ignore
        formData[key] = defaults[key]
    }
}

/**
 * 函数说明：校验密码字段，保持新增必填、编辑可选、两次输入一致
 */
const validatePasswordFields = (): boolean => {
    if (mode.value === 'add' && !String(formData.password || '').trim()) {
        feedback.msgError('请输入密码')
        return false
    }
    if (mode.value === 'add' && !String(formData.passwordConfirm || '').trim()) {
        feedback.msgError('请再次输入密码')
        return false
    }
    if (formData.password || formData.passwordConfirm) {
        if (formData.password !== formData.passwordConfirm) {
            feedback.msgError('两次输入密码不一致')
            return false
        }
    }
    return true
}

/**
 * 函数说明：提交管理员新增/编辑请求，校验通过后再调用后端接口
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    if (!validatePasswordFields()) {
        return
    }
    const passwordChanged = Boolean(String(formData.password || '').trim())
    const payload = {
        ...formData,
        deptId: Number(formData.deptId),
        postId: Number(normalizeSingleValue(formData.postId)),
        role: Number(normalizeSingleValue(formData.role))
    }
    const result = mode.value == 'edit' ? await adminEdit(payload) : await adminAdd(payload)
    if (mode.value == 'edit' && passwordChanged && !result?.passwordChanged) {
        feedback.msgError('服务端未确认密码已修改，请刷新页面后重试')
        return
    }
    popupRef.value?.close()
    feedback.msgSuccess(passwordChanged ? '密码已修改，目标账号旧会话已失效' : '操作成功')
    emit('success')
}

/**
 * 函数说明：打开弹窗并切换当前操作模式
 */
const open = (type = 'add') => {
    resetFormData()
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：读取管理员详情并标准化回填表单
 */
const setFormData = async (row: any) => {
    resetFormData()
    const data = await adminDetail({
        id: row.id
    })

    for (const key in formData) {
        if (data[key] === null || data[key] === undefined) {
            continue
        }
        if (key === 'role' || key === 'postId') {
            // @ts-ignore
            formData[key] = normalizeSingleValue(data[key])
            continue
        }
        // @ts-ignore
        formData[key] = data[key]
    }

    Number(formData.deptId) == 0 && (formData.deptId = '')
    formData.postId = normalizeSingleValue(formData.postId)
    formData.role = normalizeSingleValue(formData.role)
}

/**
 * 函数说明：弹窗关闭时通知父组件同步状态
 */
const handleClose = () => {
    emit('close')
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

.form-tips {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}
</style>
