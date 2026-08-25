<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <div class="login-form-wrapper">
        <div class="login-form-head">
            <div class="login-form-title">欢迎登录</div>
            <div class="login-form-sub-title">{{ brandTitle }} 管理后台</div>
        </div>

        <div class="login-form-error-msg" :class="{ 'is-empty': !errorMessage }">{{ errorMessage || ' ' }}</div>

        <a-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="login-form"
            layout="vertical"
            size="large"
        >
            <a-form-item field="account">
                <a-input
                    v-model.trim="formData.account"
                    placeholder="请输入管理员账号"
                    allow-clear
                    autocomplete="username"
                    @press-enter="handleEnter"
                >
                    <template #prefix>
                        <icon-user />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item field="password">
                <a-input-password
                    ref="passwordRef"
                    v-model="formData.password"
                    placeholder="请输入密码"
                    allow-clear
                    autocomplete="current-password"
                    @press-enter="handleLogin"
                >
                    <template #prefix>
                        <icon-lock />
                    </template>
                </a-input-password>
            </a-form-item>
            <a-form-item v-if="isCaptchaEnabled" field="captchaCode">
                <div class="captcha-field-row">
                    <a-input
                        v-model.trim="formData.captchaCode"
                        placeholder="请输入图形验证码"
                        allow-clear
                        autocomplete="one-time-code"
                        @press-enter="handleLogin"
                    >
                        <template #prefix>
                            <icon-safe />
                        </template>
                    </a-input>
                    <button
                        class="captcha-image-btn"
                        type="button"
                        :disabled="isCaptchaLoading"
                        @click="loadLoginCaptcha"
                    >
                        <img
                            v-if="captchaImage"
                            :src="captchaImage"
                            alt="图形验证码"
                            class="captcha-image"
                        />
                        <span v-else>{{ isCaptchaLoading ? '加载中...' : '点击获取' }}</span>
                    </button>
                </div>
            </a-form-item>
        </a-form>

        <div class="login-form-password-actions">
            <a-checkbox v-model="remAccount">记住账号</a-checkbox>
        </div>

        <a-button type="primary" long size="large" :loading="isLock" @click="lockLogin"
            >登录后台</a-button
        >

        <div class="login-form-help-links">
            <a
                v-for="item in helpLinks"
                :key="item.title"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
            >
                {{ item.title }}
            </a>
        </div>

        <div class="login-form-meta">登录即表示你已阅读并同意平台管理规范。</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue'
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { IconLock, IconSafe, IconUser } from '@arco-design/web-vue/es/icon'
import useUserStore from '@/stores/modules/user'
import { getLoginCaptcha } from '@/api/user'
import cache from '@/utils/cache'
import feedback from '@/utils/feedback'
import { ACCOUNT_KEY } from '@/enums/cacheEnums'
import { PageEnum } from '@/enums/pageEnum'
import { useLockFn } from '@/hooks/useLockFn'

defineProps({
    brandTitle: {
        type: String,
        default: 'UIED-Tools'
    }
})

const formRef = shallowRef<FormInstance>()
const passwordRef = shallowRef<{ focus?: () => void }>()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const remAccount = ref(false)
const errorMessage = ref('')
const isCaptchaEnabled = ref(true)
const captchaImage = ref('')
const isCaptchaLoading = ref(false)
const helpLinks = [
    { title: '更新记录', url: 'https://uiedtool.com/changelog' },
    { title: '商业版咨询', url: 'https://fsuied.com' }
]

const formData = reactive({
    account: '',
    password: '',
    captchaKey: '',
    captchaCode: ''
})

const rules: Record<string, FieldRule[]> = {
    account: [
        {
            required: true,
            message: '请输入账号',
            trigger: ['blur']
        }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: ['blur']
        }
    ]
}

/**
 * 函数说明：账号输入框回车时，若未填密码则聚焦密码框，否则直接尝试登录。
 */
const handleEnter = () => {
    if (!formData.password) {
        passwordRef.value?.focus?.()
        return
    }
    handleLogin()
}

/**
 * 函数说明：获取后台登录图形验证码，并同步刷新验证码键值与图片内容。
 */
const loadLoginCaptcha = async () => {
    if (isCaptchaLoading.value) {
        return
    }
    isCaptchaLoading.value = true
    try {
        const data = await getLoginCaptcha()
        isCaptchaEnabled.value = Number(data?.captchaOn ?? 1) === 1
        if (!isCaptchaEnabled.value) {
            formData.captchaKey = ''
            formData.captchaCode = ''
            captchaImage.value = ''
            return
        }
        formData.captchaKey = String(data?.captchaKey || '').trim()
        formData.captchaCode = ''
        captchaImage.value = String(data?.captchaImage || '').trim()
    } catch (error) {
        formData.captchaKey = ''
        captchaImage.value = ''
    } finally {
        isCaptchaLoading.value = false
    }
}

/**
 * 函数说明：执行后台登录，并处理验证码、记住账号和登录后的跳转逻辑。
 */
const handleLogin = async () => {
    errorMessage.value = ''
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    if (isCaptchaEnabled.value) {
        if (!String(formData.captchaCode || '').trim()) {
            errorMessage.value = '请输入图形验证码'
            feedback.msgError(errorMessage.value)
            return
        }
        if (!String(formData.captchaKey || '').trim()) {
            await loadLoginCaptcha()
            errorMessage.value = '验证码已刷新，请重新输入'
            feedback.msgError(errorMessage.value)
            return
        }
    }

    cache.set(ACCOUNT_KEY, {
        remember: remAccount.value,
        account: remAccount.value ? formData.account : ''
    })

    try {
        await userStore.login(formData)
        const {
            query: { redirect }
        } = route
        const targetPath = typeof redirect === 'string' ? redirect : PageEnum.INDEX
        router.push(targetPath)
    } catch (error: any) {
        const message = String(error?.message || '').trim()
        if (message.includes('Network Error') || message.includes('ERR_NETWORK')) {
            errorMessage.value = '后台接口不可达，请检查 API 服务与反向代理配置'
        } else {
            errorMessage.value = message || '登录失败，请稍后重试'
        }
        if (!error?.notified) {
            feedback.msgError(errorMessage.value)
        }
        if (isCaptchaEnabled.value) {
            await loadLoginCaptcha()
        }
    }
}

const { isLock, lockFn: lockLogin } = useLockFn(handleLogin)

/**
 * 函数说明：初始化登录页的缓存账号和验证码。
 */
onMounted(() => {
    const accountCache = cache.get(ACCOUNT_KEY)
    if (accountCache?.remember) {
        remAccount.value = accountCache.remember
        formData.account = accountCache.account
    }
    loadLoginCaptcha()
})
</script>

<style lang="scss" scoped>
.login-form-wrapper {
    width: 420px;
    box-sizing: border-box;
    padding: 36px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: #fff;
}

.login-form-head {
    margin-bottom: 10px;
}

.login-form-title {
    color: var(--color-text-1);
    font-weight: 600;
    font-size: 26px;
    line-height: 36px;
}

.login-form-sub-title {
    margin-top: 6px;
    color: var(--color-text-3);
    font-size: 14px;
    line-height: 24px;
}

.login-form-error-msg {
    min-height: 24px;
    color: rgb(var(--red-6));
    font-size: 13px;
    line-height: 24px;

    &.is-empty {
        min-height: 8px;
        line-height: 8px;
    }
}

.login-form {
    :deep(.arco-form-item-label-col) {
        display: none;
    }

    :deep(.arco-form-item) {
        margin-bottom: 16px;
    }

    :deep(.arco-input-wrapper),
    :deep(.arco-input-password) {
        border-radius: 10px;
        min-height: 48px;
        background: var(--color-fill-1, #f7f8fa);
    }
}

.captcha-field-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 132px;
    gap: 12px;
    width: 100%;
}

.captcha-image-btn {
    height: 48px;
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    background: var(--color-bg-2);
    color: var(--color-text-2);
    overflow: hidden;
    cursor: pointer;
    transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

    &:hover:not(:disabled) {
        border-color: rgb(var(--primary-5));
        box-shadow: 0 0 0 3px rgba(var(--primary-1), 0.6);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.68;
    }
}

.captcha-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.login-form-password-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

:deep(.arco-btn.arco-btn-size-large) {
    min-height: 48px;
    border-radius: 8px;
    font-weight: 600;
}

.login-form-help-links {
    display: flex;
    gap: 14px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-1, #f2f3f5);
    font-size: 13px;
}

.login-form-meta {
    margin-top: 14px;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 20px;
}

@media (max-width: 992px) {
    .login-form-wrapper {
        width: min(100%, 420px);
        padding: 32px;
    }
}

@media (max-width: 480px) {
    .login-form-wrapper {
        padding: 24px;
        border: 0;
        border-radius: 0;
    }
}
</style>
