<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="commercial-access" aria-label="访问与登录配置">
        <a-card
            class="!border-none"
            :bordered="false"
            data-admin-smoke="login-register-access-panel"
        >
            <div class="font-medium mb-6">通用设置</div>

            <a-form-item label="前台登录功能">
                <div>
                    <a-switch
                        v-model="formData.frontendLoginEnabled"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">
                        {{ formData.frontendLoginEnabled ? '开启' : '关闭' }}
                    </span>
                    <div class="form-tips">
                        关闭后官网隐藏登录入口，所有工具跳过登录与积分扣减，可直接免登录使用；工具停用策略仍然生效。
                    </div>
                </div>
            </a-form-item>

            <a-alert
                v-if="formData.frontendLoginEnabled === 0"
                type="warning"
                show-icon
                class="mb-5"
            >
                当前为免登录模式。下方登录、积分和会员配置会保留，但不会在官网工具运行时生效。
            </a-alert>

            <a-form-item label="登录方式" :required="formData.frontendLoginEnabled === 1">
                <div>
                    <a-checkbox-group v-model="formData.loginWay">
                        <a-checkbox :value="1">账号密码登录</a-checkbox>
                        <a-checkbox :value="2">手机验证码登录</a-checkbox>
                    </a-checkbox-group>
                    <div class="form-tips">系统通用登录方式，至少选择一项</div>
                </div>
            </a-form-item>

            <a-form-item label="强制绑定手机">
                <div>
                    <a-switch
                        v-model="formData.forceBindMobile"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">{{ formData.forceBindMobile ? '开启' : '关闭' }}</span>
                    <div class="form-tips">
                        1、如果开启，则新用户在注册完成之后要强制绑定手机号
                        <br />
                        2、老用户登录时如果检测到没有绑定手机，则要重新绑定手机号
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="政策协议">
                <div>
                    <a-switch
                        v-model="formData.openAgreement"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">{{ formData.openAgreement ? '开启' : '关闭' }}</span>
                    <div class="form-tips">登录/注册会员时，是否显示服务协议和隐私政策</div>
                </div>
            </a-form-item>

            <a-divider margin="8px 0 16px" />

            <a-form-item label="后台登录图形验证码">
                <div>
                    <a-switch
                        v-model="formData.adminLoginCaptchaOn"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">
                        {{ formData.adminLoginCaptchaOn ? '开启' : '关闭' }}
                    </span>
                    <div class="form-tips">
                        控制后台管理员登录是否强制校验图形验证码，建议生产环境保持开启。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="后台登录失败锁定阈值">
                <div class="w-full max-w-[420px]">
                    <a-input-number
                        v-model="formData.adminLoginFailLimit"
                        :min="3"
                        :max="20"
                        :step="1"
                        class="w-full"
                    />
                    <div class="form-tips mt-1">连续失败达到阈值后触发临时锁定，建议 5 次。</div>
                </div>
            </a-form-item>

            <a-form-item label="后台登录锁定窗口（秒）">
                <div class="w-full max-w-[420px]">
                    <a-input-number
                        v-model="formData.adminLoginFailWindow"
                        :min="60"
                        :max="86400"
                        :step="60"
                        class="w-full"
                    />
                    <div class="form-tips mt-1">锁定时长建议 900 秒（15 分钟）。</div>
                </div>
            </a-form-item>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="font-medium mb-6">第三方设置</div>

            <a-form-item label="第三方登录">
                <div>
                    <a-switch
                        v-model="formData.openOtherAuth"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">{{ formData.openOtherAuth ? '开启' : '关闭' }}</span>
                    <div class="form-tips">登录时支持第三方登录，新用户授权即自动注册账号</div>
                </div>
            </a-form-item>

            <a-form-item label="授权渠道" required>
                <div>
                    <a-checkbox-group v-model="formData.autoLoginAuth" class="mt-1">
                        <a-checkbox :value="1">微信登录</a-checkbox>
                        <a-checkbox :value="2">QQ登录</a-checkbox>
                    </a-checkbox-group>
                    <div class="form-tips">
                        第三方登录开启时，至少选择一个可用渠道；可同时开启微信和 QQ。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="微信开放平台配置" v-if="isWechatAuthEnabled">
                <div class="third-party-fields">
                    <a-input
                        v-model="formData.wechatAppId"
                        placeholder="请输入微信开放平台 AppID"
                        allow-clear
                    />
                    <a-input
                        v-model="formData.wechatAppSecret"
                        placeholder="请输入微信开放平台 AppSecret"
                        allow-clear
                        class="mt-2"
                    />
                    <a-input
                        v-model="formData.wechatRedirectUrl"
                        placeholder="请输入微信登录回调地址（如：https://uiedtool.com/auth/wechat/callback）"
                        allow-clear
                        class="mt-2"
                    />
                    <div class="form-tips mt-1">
                        回调地址必须与微信开放平台配置保持一致，否则将无法完成授权登录。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="QQ互联配置" v-if="isQqAuthEnabled">
                <div class="third-party-fields">
                    <a-input
                        v-model="formData.qqAppId"
                        placeholder="请输入 QQ 互联 AppID"
                        allow-clear
                    />
                    <a-input
                        v-model="formData.qqAppKey"
                        placeholder="请输入 QQ 互联 AppKey"
                        allow-clear
                        class="mt-2"
                    />
                    <a-input
                        v-model="formData.qqRedirectUrl"
                        placeholder="请输入 QQ 登录回调地址（如：https://uiedtool.com/auth/qq/callback）"
                        allow-clear
                        class="mt-2"
                    />
                    <div class="form-tips mt-1">
                        建议优先先在 QQ 互联后台完成回调域名校验，再启用线上登录入口。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="平台文档入口">
                <div>
                    <a-space>
                        <a-link href="https://open.weixin.qq.com/" target="_blank">
                            前往微信开放平台
                        </a-link>
                        <a-link href="https://connect.qq.com/" target="_blank">前往 QQ 互联</a-link>
                    </a-space>
                    <div class="form-tips">
                        1、在各渠道使用微信授权登录时，强烈建议配置微信开放平台
                        <br />
                        2、微信开放平台关联公众号、小程序和APP后，可实现各端用户账号统一，识别买家唯一微信身份
                        <br />
                        3、没有配置微信开放平台，同一微信号会生成多个用户，配置微信开放平台后已生成的用户账号无法合并
                    </div>
                </div>
            </a-form-item>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="font-medium mb-6">用户中心设置</div>

            <a-form-item label="启用用户中心入口">
                <div>
                    <a-switch
                        v-model="formData.userCenterEnabled"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">
                        {{ formData.userCenterEnabled ? '开启' : '关闭' }}
                    </span>
                    <div class="form-tips">
                        开启后，前端官网头部会显示“用户中心”入口，便于后续会员与配额体系接入。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="入口文案" v-if="formData.userCenterEnabled === 1">
                <a-input
                    v-model="formData.userCenterTitle"
                    placeholder="请输入入口文案，如：用户中心 / 会员中心"
                    allow-clear
                />
            </a-form-item>

            <a-form-item label="入口链接" v-if="formData.userCenterEnabled === 1" required>
                <div>
                    <a-input
                        v-model="formData.userCenterLink"
                        placeholder="请输入入口链接，如：https://uiedtool.com/user-center"
                        allow-clear
                    />
                    <div class="form-tips mt-1">
                        支持外链地址或站内路径，建议先配置可访问页面再上线入口。
                    </div>
                </div>
            </a-form-item>
        </a-card>
    </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { CommercialDraft } from './commercial-config'
const props = defineProps<{ formData: CommercialDraft }>()
// 草稿由父页唯一持有，子面板只原位编辑字段，切换和卸载均不重建默认值。
const formData = props.formData
/** 微信授权字段随父级渠道草稿展示，未访问面板不创建输入控件。 */
const isWechatAuthEnabled = computed(() => formData.autoLoginAuth.includes(1))
/** QQ 授权字段与父级保存校验读取相同的渠道草稿。 */
const isQqAuthEnabled = computed(() => formData.autoLoginAuth.includes(2))
</script>
<style scoped lang="scss">
.third-party-fields {
    width: 100%;
    max-width: 620px;
}
</style>
