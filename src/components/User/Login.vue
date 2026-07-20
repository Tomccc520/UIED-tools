<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-28
 */
-->
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDefaultSitePublicConfig, getSitePublicConfig } from '@/services/siteConfig'
import { isFrontendUserLoggedIn, loginFrontendUser } from '@/services/frontendUser'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const siteConfig = ref(getDefaultSitePublicConfig())

const formData = reactive({
  nickname: '',
  password: ''
})

/**
 * 函数说明：解析登录成功后的跳转地址，优先使用 redirect 参数。
 */
const redirectPath = computed(() => {
  const redirectValue = String(route.query.redirect || '').trim()
  if (redirectValue.startsWith('/')) {
    return redirectValue
  }
  return '/user/center'
})

/**
 * 函数说明：登录关闭时解析安全回跳地址，避免默认跳入个人中心形成循环。
 */
const loginDisabledRedirectPath = computed(() => {
  const redirectValue = String(route.query.redirect || '').trim()
  if (redirectValue.startsWith('/') && !redirectValue.startsWith('/user/')) {
    return redirectValue
  }
  return '/'
})

/**
 * 函数说明：读取后台公共配置，决定第三方登录入口是否展示。
 */
const loadSiteConfig = async () => {
  siteConfig.value = await getSitePublicConfig({ forceRefresh: true })
}

/**
 * 函数说明：执行前端本地登录，建立个人中心会话。
 */
const handleLogin = async () => {
  const nickname = String(formData.nickname || '').trim()
  const password = String(formData.password || '').trim()
  if (nickname.length < 2) {
    ElMessage.warning('请输入至少 2 个字符的昵称')
    return
  }
  if (password.length < 6) {
    ElMessage.warning('请输入至少 6 位密码')
    return
  }
  loading.value = true
  try {
    await loginFrontendUser(nickname, password)
    ElMessage.success('登录成功，已进入个人中心')
    await router.push(redirectPath.value)
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败，请稍后重试'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}

/**
 * 函数说明：打开第三方登录授权地址。
 */
const handleOpenAuth = (url: string) => {
  const targetUrl = String(url || '').trim()
  if (!targetUrl) {
    ElMessage.warning('当前未配置授权地址，请先在后台登录配置中设置')
    return
  }
  window.open(targetUrl, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  await loadSiteConfig()
  if (!siteConfig.value.loginEnabled) {
    ElMessage.info('当前站点未开启登录，工具可直接免登录使用')
    await router.replace(loginDisabledRedirectPath.value)
    return
  }
  if (isFrontendUserLoggedIn()) {
    await router.replace(redirectPath.value)
  }
})
</script>

<template>
  <section class="user-login-page">
    <div class="user-login-page__bg"></div>
    <div class="auth-shell">
      <div class="auth-side">
        <div class="auth-brand">UIED-Tools</div>
        <h1>官网用户登录</h1>
        <p>登录后可进入个人中心，查看每日积分、工具消耗规则并维护 QQ 邮箱绑定信息。</p>
        <div class="auth-side-tips">
          <div class="tip-item">
            <span class="tip-label">每日赠送</span>
            <span class="tip-value">+{{ siteConfig.loginDailyGiftPoints }}</span>
          </div>
          <div class="tip-item">
            <span class="tip-label">单次消耗</span>
            <span class="tip-value">-{{ siteConfig.loginToolConsumePoints }}</span>
          </div>
          <div class="tip-item" v-if="siteConfig.loginMemberEnabled && siteConfig.loginMemberTrialDays > 0">
            <span class="tip-label">新用户会员试用</span>
            <span class="tip-value">{{ siteConfig.loginMemberTrialDays }}天</span>
          </div>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-header">
          <div class="auth-header-kicker">账号登录</div>
          <h2>欢迎回来</h2>
          <p>请输入昵称和密码进入用户中心。</p>
        </div>

        <el-form label-position="top" class="auth-form" @submit.prevent>
          <el-form-item label="昵称">
            <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="24" clearable />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="formData.password"
              type="password"
              show-password
              placeholder="请输入密码（6位以上）"
              maxlength="32"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="auth-submit-wrap">
            <el-button type="primary" :loading="loading" class="w-full auth-submit-btn" @click="handleLogin">
              登录并进入个人中心
            </el-button>
            <div class="auth-submit-tip">登录即表示你同意网站相关协议与隐私规则。</div>
          </div>
        </el-form>

        <div class="auth-divider">或使用第三方登录</div>
        <div class="auth-actions">
          <el-button
            v-if="siteConfig.loginOpenOtherAuth && siteConfig.loginOpenWechatAuth"
            plain
            @click="handleOpenAuth(siteConfig.loginWechatAuthorizeUrl)"
          >
            微信登录
          </el-button>
          <el-button
            v-if="siteConfig.loginOpenOtherAuth && siteConfig.loginOpenQqAuth"
            plain
            @click="handleOpenAuth(siteConfig.loginQqAuthorizeUrl)"
          >
            QQ登录
          </el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.user-login-page {
  position: relative;
  overflow: hidden;
  min-height: 66vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
}

.user-login-page__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 18%, rgba(108, 84, 255, 0.2) 0%, rgba(108, 84, 255, 0) 38%),
    radial-gradient(circle at 90% 20%, rgba(78, 127, 255, 0.16) 0%, rgba(78, 127, 255, 0) 32%),
    linear-gradient(145deg, #f5f4ff 0%, #f7f9ff 100%);
}

.auth-shell {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  background: #ffffff;
  border: 1px solid #e7e9f3;
  border-radius: 18px;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(360px, 1.2fr);
  overflow: hidden;
}

.auth-side {
  padding: 26px 22px;
  background: linear-gradient(162deg, #6c54ff 0%, #755dff 48%, #5d47ea 100%);
  color: #fff;
}

.auth-brand {
  width: fit-content;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 5px 10px;
  margin-bottom: 12px;
}

.auth-side h1 {
  margin: 0;
  font-size: 31px;
  font-weight: 700;
  color: #fff;
  line-height: 1.18;
}

.auth-side p {
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 14px;
  line-height: 1.7;
}

.auth-side-tips {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.tip-item {
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 10px;
  padding: 11px 12px;
  background: rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tip-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
}

.tip-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.auth-panel {
  padding: 24px;
  background:
    linear-gradient(180deg, #ffffff 0%, #fbfcff 100%),
    #ffffff;
}

.auth-header-kicker {
  width: fit-content;
  border-radius: 999px;
  border: 1px solid #dcd4ff;
  background: #f4f1ff;
  color: #5d48d6;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 10px;
  margin-bottom: 10px;
}

.auth-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #212742;
}

.auth-header p {
  margin: 8px 0 0;
  color: #6e768a;
  font-size: 14px;
  line-height: 1.7;
}

.auth-form {
  margin-top: 16px;
  border: 1px solid #eceff6;
  border-radius: 12px;
  padding: 12px 12px 10px;
  background: #ffffff;
}

.auth-divider {
  margin: 18px 0 10px;
  text-align: center;
  color: #9098ab;
  font-size: 12px;
}

.auth-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.auth-submit-wrap {
  margin-top: 4px;
}

.auth-submit-btn {
  height: 40px;
  font-weight: 700;
}

.auth-submit-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #8b93a8;
  text-align: center;
}

:deep(.auth-form .el-form-item__label) {
  color: #364057;
  font-weight: 600;
}

:deep(.auth-actions .el-button) {
  border-color: #d8dcf3;
  color: #3d4664;
}

@media (max-width: 768px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-side {
    padding: 20px 18px;
  }

  .auth-shell {
    border-radius: 14px;
  }

  .auth-panel {
    padding: 20px 18px;
  }

  .auth-header h2 {
    font-size: 24px;
  }
}
</style>
