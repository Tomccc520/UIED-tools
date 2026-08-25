<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="user-setup">
        <a-card class="!border-none" :bordered="false">
            <div class="font-medium mb-6">基本设置</div>
            <a-form :model="formData" layout="vertical">
                <a-form-item label="用户默认头像">
                    <material-picker v-model="formData.defaultAvatar" :limit="1" />
                </a-form-item>
                <a-form-item>
                    <div class="form-tips">
                        用户注册时给的默认头像，建议尺寸：400*400像素，支持jpg，jpeg，png格式
                    </div>
                </a-form-item>
            </a-form>
        </a-card>

        <footer-btns v-perms="['setting:user:save']">
            <a-button type="primary" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="userSetup">
import { getUserSetup, setUserSetup } from '@/api/setting/user'
import feedback from '@/utils/feedback'

const formData = reactive({
    defaultAvatar: ''
})

/**
 * 函数说明：获取用户基础设置并回填表单
 */
const getData = async () => {
    try {
        const data = await getUserSetup()
        formData.defaultAvatar = data.defaultAvatar || ''
    } catch (error) {
        console.log('获取=>', error)
    }
}

/**
 * 函数说明：保存用户基础设置
 */
const handleSubmit = async () => {
    try {
        await setUserSetup(formData)
        feedback.msgSuccess('操作成功')
        getData()
    } catch (error) {
        console.log('保存=>', error)
    }
}

getData()
</script>

<style lang="scss" scoped></style>
