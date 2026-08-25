<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="login-register pro-page-shell">
        <a-page-header class="layout-page-header" title="用户登录与商业化">
            <template #subtitle>
                统一管理前台登录、工具积分、会员权益和支付渠道。
            </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag :color="formData.frontendLoginEnabled === 1 ? 'green' : 'orange'" bordered>
                            {{ formData.frontendLoginEnabled === 1 ? '登录已开启' : '免登录模式' }}
                        </a-tag>
                        <a-tag :color="formData.memberEnabled === 1 ? 'green' : 'gray'" bordered>
                            {{ formData.memberEnabled === 1 ? '会员已开启' : '会员未开启' }}
                        </a-tag>
                    </div>
                    <a-button
                        size="small"
                        data-admin-smoke="login-register-reload"
                        @click="reloadLoginConfig"
                    >
                        重新加载
                    </a-button>
                </div>
            </template>
        </a-page-header>

        <a-card class="login-section-nav page-card pro-panel-card" :bordered="false">
            <a-tabs v-model:active-key="activeSection" type="rounded">
                <a-tab-pane key="access" title="访问与登录" />
                <a-tab-pane key="billing" title="积分与会员" />
                <a-tab-pane key="payment" title="支付接入" />
            </a-tabs>
            <div class="login-section-nav__tip">
                {{ activeSectionTip }}
            </div>
        </a-card>

        <a-form :model="formData" layout="vertical">
            <a-card
                v-show="activeSection === 'access'"
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
                        <span class="mt-1 ml-2">{{
                            formData.frontendLoginEnabled ? '开启' : '关闭'
                        }}</span>
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
                        <span class="mt-1 ml-2">{{
                            formData.forceBindMobile ? '开启' : '关闭'
                        }}</span>
                        <div class="form-tips">
                            1、如果开启，则新用户在注册完成之后要强制绑定手机号<br />
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
                        <span class="mt-1 ml-2">{{
                            formData.openAgreement ? '开启' : '关闭'
                        }}</span>
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
                        <span class="mt-1 ml-2">{{
                            formData.adminLoginCaptchaOn ? '开启' : '关闭'
                        }}</span>
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
                        <div class="form-tips mt-1">
                            连续失败达到阈值后触发临时锁定，建议 5 次。
                        </div>
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

            <a-card v-show="activeSection === 'access'" class="!border-none mt-4" :bordered="false">
                <div class="font-medium mb-6">第三方设置</div>

                <a-form-item label="第三方登录">
                    <div>
                        <a-switch
                            v-model="formData.openOtherAuth"
                            :checked-value="1"
                            :unchecked-value="0"
                        />
                        <span class="mt-1 ml-2">{{
                            formData.openOtherAuth ? '开启' : '关闭'
                        }}</span>
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
                            <a-link href="https://open.weixin.qq.com/" target="_blank"
                                >前往微信开放平台</a-link
                            >
                            <a-link href="https://connect.qq.com/" target="_blank"
                                >前往 QQ 互联</a-link
                            >
                        </a-space>
                        <div class="form-tips">
                            1、在各渠道使用微信授权登录时，强烈建议配置微信开放平台<br />
                            2、微信开放平台关联公众号、小程序和APP后，可实现各端用户账号统一，识别买家唯一微信身份<br />
                            3、没有配置微信开放平台，同一微信号会生成多个用户，配置微信开放平台后已生成的用户账号无法合并
                        </div>
                    </div>
                </a-form-item>
            </a-card>

            <a-card v-show="activeSection === 'access'" class="!border-none mt-4" :bordered="false">
                <div class="font-medium mb-6">用户中心设置</div>

                <a-form-item label="启用用户中心入口">
                    <div>
                        <a-switch
                            v-model="formData.userCenterEnabled"
                            :checked-value="1"
                            :unchecked-value="0"
                        />
                        <span class="mt-1 ml-2">{{
                            formData.userCenterEnabled ? '开启' : '关闭'
                        }}</span>
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

            <a-card
                v-show="activeSection === 'billing'"
                class="!border-none mt-4"
                :bordered="false"
                data-admin-smoke="login-register-billing-panel"
            >
                <div class="font-medium mb-6">工具积分设置</div>

                <a-form-item label="每日赠送积分">
                    <div class="w-full max-w-[360px]">
                        <a-input-number
                            v-model="formData.dailyGiftPoints"
                            :min="0"
                            :max="100000"
                            :step="10"
                            class="w-full"
                        />
                        <div class="form-tips mt-1">
                            用户每天首次使用工具前自动发放该积分，默认建议 50。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="单次工具消耗积分">
                    <div class="w-full max-w-[360px]">
                        <a-input-number
                            v-model="formData.toolConsumePoints"
                            :min="1"
                            :max="1000"
                            :step="1"
                            class="w-full"
                        />
                        <div class="form-tips mt-1">
                            每执行一次工具处理（如压缩/转换/抠图）扣减积分，默认 1。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="按工具计费规则（可选）">
                    <div class="w-full max-w-[980px] config-list">
                        <div class="config-list__head">
                            <span
                                >按 toolKey
                                覆盖全局扣分策略，未配置的工具继续使用“单次工具消耗积分”。</span
                            >
                            <a-space size="mini">
                                <a-tag color="arcoblue" size="small"
                                    >已配置 {{ formData.toolConsumeRules.length }} 条</a-tag
                                >
                                <a-button
                                    size="small"
                                    type="outline"
                                    @click="handleAddToolConsumeRule"
                                    >新增空规则</a-button
                                >
                            </a-space>
                        </div>
                        <div class="config-list__toolbar">
                            <a-input
                                v-model="toolConsumeRuleKeyword"
                                size="small"
                                allow-clear
                                class="config-list__search"
                                placeholder="搜索 toolKey / 规则名称 / 备注"
                            />
                            <a-select
                                v-model="toolConsumeRulePresetKey"
                                size="small"
                                allow-search
                                allow-clear
                                class="config-list__preset-select"
                                placeholder="从常用工具预设快速新增"
                                :options="toolConsumeRulePresetOptions"
                            />
                            <a-button
                                size="small"
                                type="primary"
                                :disabled="!toolConsumeRulePresetKey"
                                @click="handleApplyToolConsumeRulePreset"
                            >
                                添加预设
                            </a-button>
                        </div>
                        <div
                            v-if="formData.toolConsumeRules.length === 0"
                            class="config-list__empty"
                        >
                            暂无规则，当前全部工具都按全局积分规则执行
                        </div>
                        <div
                            v-else-if="filteredToolConsumeRules.length === 0"
                            class="config-list__empty"
                        >
                            未匹配到规则，请调整搜索关键字
                        </div>
                        <div
                            v-for="item in filteredToolConsumeRules"
                            :key="`tool-rule-${item.index}`"
                            class="config-item"
                        >
                            <a-grid :cols="24" :col-gap="12" :row-gap="12">
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="item.rule.toolKey"
                                        placeholder="toolKey，如 video-compress"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="item.rule.name"
                                        placeholder="规则名称（可选）"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="item.rule.consumePoints"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="4">
                                    <a-switch
                                        v-model="item.rule.memberFree"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                    <span class="ml-2 text-xs" style="color: var(--color-text-3)">
                                        {{ item.rule.memberFree === 1 ? '会员免扣' : '会员不免扣' }}
                                    </span>
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-switch
                                        v-model="item.rule.status"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-input-number
                                        v-model="item.rule.sort"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="5">
                                    <a-input
                                        v-model="item.rule.remark"
                                        placeholder="备注（可选）"
                                        allow-clear
                                    />
                                </a-grid-item>
                            </a-grid>
                            <div class="config-item__actions">
                                <a-button
                                    size="mini"
                                    status="danger"
                                    @click="handleRemoveToolConsumeRule(item.index)"
                                >
                                    删除
                                </a-button>
                            </div>
                        </div>
                        <div class="form-tips mt-2">
                            示例：`toolKey=video-compress` 设置
                            `consumePoints=2`，表示视频压缩每次扣 2 积分。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="工具调用风控规则">
                    <div class="w-full max-w-[760px]">
                        <a-grid :cols="24" :col-gap="12">
                            <a-grid-item :span="8">
                                <a-form-item hide-label>
                                    <a-input-number
                                        v-model="formData.consumeRiskRules.perMinute"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                        placeholder="每分钟上限"
                                    />
                                </a-form-item>
                            </a-grid-item>
                            <a-grid-item :span="8">
                                <a-form-item hide-label>
                                    <a-input-number
                                        v-model="formData.consumeRiskRules.perHour"
                                        :min="0"
                                        :step="10"
                                        class="w-full"
                                        placeholder="每小时上限"
                                    />
                                </a-form-item>
                            </a-grid-item>
                            <a-grid-item :span="8">
                                <a-form-item hide-label>
                                    <a-input-number
                                        v-model="formData.consumeRiskRules.perDay"
                                        :min="0"
                                        :step="10"
                                        class="w-full"
                                        placeholder="每日上限"
                                    />
                                </a-form-item>
                            </a-grid-item>
                        </a-grid>
                        <div class="form-tips mt-1">
                            设为 0 表示不限制。默认值：30/600/3000（分钟/小时/每日）。
                        </div>
                    </div>
                </a-form-item>
            </a-card>

            <a-card v-show="activeSection === 'billing'" class="!border-none mt-4" :bordered="false">
                <div class="font-medium mb-6">会员功能设置</div>

                <a-form-item label="启用会员功能">
                    <div>
                        <a-switch
                            v-model="formData.memberEnabled"
                            :checked-value="1"
                            :unchecked-value="0"
                        />
                        <span class="mt-1 ml-2">{{
                            formData.memberEnabled ? '开启' : '关闭'
                        }}</span>
                        <div class="form-tips">
                            开启后支持前端会员身份识别；会员有效期内工具调用默认不扣积分。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="新用户会员试用天数" v-if="formData.memberEnabled === 1">
                    <div class="w-full max-w-[360px]">
                        <a-input-number
                            v-model="formData.memberTrialDays"
                            :min="0"
                            :max="3650"
                            :step="1"
                            class="w-full"
                        />
                        <div class="form-tips mt-1">
                            设置为 0 表示不开启试用；例如 7 表示新注册用户自动获得 7 天会员。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="会员权益说明">
                    <div class="w-full max-w-[760px]">
                        <a-textarea
                            v-model="formData.memberRightsIntro"
                            :auto-size="{ minRows: 2, maxRows: 4 }"
                            placeholder="示例：会员有效期内可免费使用积分工具；购买会员套餐将赠送积分。"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            用于前台用户中心展示权益文案，建议突出“免扣积分 + 赠送积分 + 到期规则”。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="会员套餐配置">
                    <div class="w-full max-w-[980px] config-list">
                        <div class="config-list__head">
                            <span>支持新增/删除套餐，保存后前台实时读取。</span>
                            <a-button size="small" type="outline" @click="handleAddMemberPlan"
                                >新增套餐</a-button
                            >
                        </div>
                        <div v-if="formData.memberPlans.length === 0" class="config-list__empty">
                            暂无套餐，请新增
                        </div>
                        <div
                            v-for="(plan, index) in formData.memberPlans"
                            :key="`plan-${index}`"
                            class="config-item"
                        >
                            <a-grid :cols="24" :col-gap="12" :row-gap="12">
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="plan.code"
                                        placeholder="编码，如 vip_month"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="plan.name"
                                        placeholder="名称，如 VIP月卡"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="plan.price"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                        placeholder="价格"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="plan.memberDays"
                                        :min="1"
                                        :step="1"
                                        class="w-full"
                                        placeholder="天数"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="plan.giftPoints"
                                        :min="0"
                                        :step="10"
                                        class="w-full"
                                        placeholder="赠送积分"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input
                                        v-model="plan.badge"
                                        placeholder="角标，如 热卖"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-input-number
                                        v-model="plan.sort"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                        placeholder="排序"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-switch
                                        v-model="plan.status"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </a-grid-item>
                            </a-grid>
                            <div class="config-item__actions">
                                <a-button
                                    size="mini"
                                    status="danger"
                                    @click="handleRemoveMemberPlan(index)"
                                    >删除</a-button
                                >
                            </div>
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="积分包配置">
                    <div class="w-full max-w-[980px] config-list">
                        <div class="config-list__head">
                            <span>支持新增/删除积分包，保存后前台实时读取。</span>
                            <a-button size="small" type="outline" @click="handleAddPointsPack"
                                >新增积分包</a-button
                            >
                        </div>
                        <div v-if="formData.pointsPacks.length === 0" class="config-list__empty">
                            暂无积分包，请新增
                        </div>
                        <div
                            v-for="(pack, index) in formData.pointsPacks"
                            :key="`pack-${index}`"
                            class="config-item"
                        >
                            <a-grid :cols="24" :col-gap="12" :row-gap="12">
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="pack.code"
                                        placeholder="编码，如 points_100"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="4">
                                    <a-input
                                        v-model="pack.name"
                                        placeholder="名称，如 100积分包"
                                        allow-clear
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="pack.price"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                        placeholder="价格"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="4">
                                    <a-input-number
                                        v-model="pack.points"
                                        :min="1"
                                        :step="10"
                                        class="w-full"
                                        placeholder="积分数"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="3">
                                    <a-input-number
                                        v-model="pack.giftPoints"
                                        :min="0"
                                        :step="10"
                                        class="w-full"
                                        placeholder="赠送积分"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-input-number
                                        v-model="pack.sort"
                                        :min="0"
                                        :step="1"
                                        class="w-full"
                                        placeholder="排序"
                                    />
                                </a-grid-item>
                                <a-grid-item :span="2">
                                    <a-switch
                                        v-model="pack.status"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                    />
                                </a-grid-item>
                            </a-grid>
                            <div class="config-item__actions">
                                <a-button
                                    size="mini"
                                    status="danger"
                                    @click="handleRemovePointsPack(index)"
                                    >删除</a-button
                                >
                            </div>
                        </div>
                    </div>
                </a-form-item>
            </a-card>

            <a-card
                v-show="activeSection === 'payment'"
                class="!border-none mt-4"
                :bordered="false"
                data-admin-smoke="login-register-payment-panel"
            >
                <div class="font-medium mb-6">支付设置</div>

                <a-form-item label="可用支付渠道">
                    <div>
                        <a-checkbox-group v-model="formData.paymentChannels">
                            <a-checkbox value="mock">测试支付（开发环境）</a-checkbox>
                            <a-checkbox value="wechat_h5">微信支付（H5）</a-checkbox>
                            <a-checkbox value="alipay_h5">支付宝（H5）</a-checkbox>
                        </a-checkbox-group>
                        <div class="form-tips">
                            建议至少保留一个渠道；正式环境可关闭 mock，仅保留微信/支付宝。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="微信支付跳转地址"
                    v-if="formData.paymentChannels.includes('wechat_h5')"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input
                            v-model="formData.paymentWechatUrl"
                            placeholder="请输入微信支付页地址，如：https://pay.example.com/wechat"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            下单后前端将跳转该地址，并自动拼接 orderSn / payChannel 参数。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="微信下单接口地址"
                    v-if="formData.paymentChannels.includes('wechat_h5')"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input
                            v-model="formData.paymentWechatCreateApi"
                            placeholder="可选：服务端下单接口地址，如：https://pay.example.com/api/wechat/create"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            配置后系统将由后端发起微信下单，并返回实时 payUrl/tradeNo。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="微信支付 V3 官方参数"
                    v-if="formData.paymentChannels.includes('wechat_h5')"
                >
                    <div class="w-full max-w-[980px] payment-v3-fields">
                        <a-alert type="info" class="mb-3">
                            <template #title>官方微信支付 V3 参数（推荐生产环境配置）</template>
                            建议同时配置“微信下单接口地址”与以下参数，便于后续切换官方直连链路。
                        </a-alert>
                        <a-space class="mb-3">
                            <a-button
                                size="small"
                                type="outline"
                                :loading="syncWechatCertLoading"
                                @click="handleSyncWechatPlatformCert"
                            >
                                自动拉取微信平台证书
                            </a-button>
                        </a-space>
                        <div class="wechat-cert-meta mb-3">
                            <a-space wrap>
                                <a-tag :color="wechatCertStatusColor">{{
                                    wechatCertStatusText
                                }}</a-tag>
                                <a-tag color="arcoblue">
                                    平台证书序列号：{{
                                        formData.paymentWechatPlatformSerialNo || '-'
                                    }}
                                </a-tag>
                            </a-space>
                            <div class="form-tips mt-1">
                                生效时间：{{
                                    formatWechatTimeText(
                                        formData.paymentWechatPlatformEffectiveTime
                                    )
                                }}
                            </div>
                            <div class="form-tips">
                                到期时间：{{
                                    formatWechatTimeText(formData.paymentWechatPlatformExpireTime)
                                }}
                            </div>
                            <div class="form-tips">
                                最近同步：{{
                                    formData.paymentWechatPlatformSyncedAt > 0
                                        ? new Date(
                                              formData.paymentWechatPlatformSyncedAt * 1000
                                          ).toLocaleString()
                                        : '-'
                                }}
                            </div>
                        </div>
                        <a-grid :cols="24" :col-gap="12" :row-gap="12">
                            <a-grid-item :span="8">
                                <a-input
                                    v-model="formData.paymentWechatMchId"
                                    placeholder="商户号 mchid（必填）"
                                    allow-clear
                                />
                            </a-grid-item>
                            <a-grid-item :span="8">
                                <a-input
                                    v-model="formData.paymentWechatAppId"
                                    placeholder="AppID（必填）"
                                    allow-clear
                                />
                            </a-grid-item>
                            <a-grid-item :span="8">
                                <a-input
                                    v-model="formData.paymentWechatSerialNo"
                                    placeholder="商户证书序列号 serial_no（必填）"
                                    allow-clear
                                />
                            </a-grid-item>
                            <a-grid-item :span="12">
                                <a-input-password
                                    v-model="formData.paymentWechatApiV3Key"
                                    placeholder="APIv3 密钥（必填）"
                                    allow-clear
                                />
                            </a-grid-item>
                            <a-grid-item :span="12">
                                <a-input
                                    v-model="formData.paymentWechatNotifyUrl"
                                    placeholder="支付回调地址（必填），如：https://api.xxx.com/api/common/frontend-user/purchase/wechat/callback"
                                    allow-clear
                                />
                            </a-grid-item>
                            <a-grid-item :span="24">
                                <a-textarea
                                    v-model="formData.paymentWechatPrivateKey"
                                    :auto-size="{ minRows: 4, maxRows: 10 }"
                                    placeholder="商户私钥 PEM（必填）"
                                />
                            </a-grid-item>
                            <a-grid-item :span="24">
                                <a-textarea
                                    v-model="formData.paymentWechatPlatformCert"
                                    :auto-size="{ minRows: 3, maxRows: 8 }"
                                    placeholder="平台证书 PEM（可选，建议配置）"
                                />
                            </a-grid-item>
                        </a-grid>
                        <div class="form-tips mt-1">
                            必填项：商户号、AppID、商户证书序列号、APIv3
                            密钥、商户私钥、支付回调地址。平台证书建议按微信平台最新证书同步。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="支付宝跳转地址"
                    v-if="formData.paymentChannels.includes('alipay_h5')"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input
                            v-model="formData.paymentAlipayUrl"
                            placeholder="请输入支付宝支付页地址，如：https://pay.example.com/alipay"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            下单后前端将跳转该地址，并自动拼接 orderSn / payChannel 参数。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="支付宝下单接口地址"
                    v-if="formData.paymentChannels.includes('alipay_h5')"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input
                            v-model="formData.paymentAlipayCreateApi"
                            placeholder="可选：服务端下单接口地址，如：https://pay.example.com/api/alipay/create"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            建议正式支付联调时配置，支持待支付订单重新拉起支付。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="下单请求签名密钥">
                    <div class="w-full max-w-[760px]">
                        <a-input-password
                            v-model="formData.paymentRequestSecret"
                            placeholder="可选：后端调用支付网关下单时用于签名"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            若支付网关要求签名校验，请填写；系统会自动生成 sign 与 X-Payment-Sign。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="支付网关鉴权模式">
                    <div class="w-full max-w-[760px]">
                        <a-radio-group v-model="formData.paymentRequestAuthType" type="button">
                            <a-radio value="none">不鉴权</a-radio>
                            <a-radio value="bearer">Bearer Token</a-radio>
                            <a-radio value="header">自定义 Header</a-radio>
                        </a-radio-group>
                        <div class="form-tips mt-1">
                            用于“服务端下单接口地址”请求头鉴权；仅影响后端到支付网关的下单调用。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="自定义鉴权 Header"
                    v-if="formData.paymentRequestAuthType === 'header'"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input
                            v-model="formData.paymentRequestHeader"
                            placeholder="请输入请求头名称，例如：X-Payment-Token"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            仅支持字母/数字/短横线，默认 X-Payment-Token。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item
                    label="支付网关鉴权令牌"
                    v-if="formData.paymentRequestAuthType !== 'none'"
                >
                    <div class="w-full max-w-[760px]">
                        <a-input-password
                            v-model="formData.paymentRequestToken"
                            placeholder="请输入支付网关鉴权令牌"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            Bearer 模式会写入 Authorization: Bearer Token；自定义模式会写入你指定的
                            Header。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="支付网关下单超时（秒）">
                    <div class="w-full max-w-[360px]">
                        <a-input-number
                            v-model="formData.paymentRequestTimeout"
                            :min="3"
                            :max="60"
                            :step="1"
                            class="w-full"
                        />
                        <div class="form-tips mt-1">
                            建议 8~20 秒，避免网关超时导致“下单接口请求失败”。
                        </div>
                    </div>
                </a-form-item>

                <a-form-item label="回调签名密钥">
                    <div class="w-full max-w-[760px]">
                        <a-input-password
                            v-model="formData.paymentCallbackSecret"
                            placeholder="用于第三方支付回调验签，建议 16~64 位随机字符串"
                            allow-clear
                        />
                        <div class="form-tips mt-1">
                            mock 渠道可留空；启用微信/支付宝正式回调时建议必填。
                        </div>
                    </div>
                </a-form-item>
            </a-card>
        </a-form>

        <footer-btns v-perms="['setting:login:save']">
            <a-button data-admin-smoke="login-register-save" type="primary" @click="handleSubmit">保存</a-button>
        </footer-btns>
    </div>
</template>

<script lang="ts" setup name="loginRegister">
import type { LoginSetup } from '@/api/setting/user'
import { getLogin, setLogin, syncWechatPlatformCert } from '@/api/setting/user'
import feedback from '@/utils/feedback'

interface MemberPlanFormItem {
    code: string
    name: string
    price: number
    memberDays: number
    giftPoints: number
    sort: number
    status: number
    badge: string
}

interface PointsPackFormItem {
    code: string
    name: string
    price: number
    points: number
    giftPoints: number
    sort: number
    status: number
}

interface ToolConsumeRuleFormItem {
    toolKey: string
    name: string
    consumePoints: number
    memberFree: number
    status: number
    sort: number
    remark: string
}

interface ConsumeRiskRulesForm {
    perMinute: number
    perHour: number
    perDay: number
}

interface ToolConsumeRulePresetOption {
    value: string
    label: string
    defaultName: string
    consumePoints: number
    memberFree: number
    remark: string
}

interface ToolConsumeRuleRenderItem {
    index: number
    rule: ToolConsumeRuleFormItem
}

/**
 * 函数说明：创建一个默认会员套餐项，便于运营快速新增配置。
 */
const createDefaultMemberPlan = (): MemberPlanFormItem => ({
    code: '',
    name: '',
    price: 0,
    memberDays: 30,
    giftPoints: 0,
    sort: 0,
    status: 1,
    badge: ''
})

/**
 * 函数说明：创建一个默认积分包项，便于运营快速新增配置。
 */
const createDefaultPointsPack = (): PointsPackFormItem => ({
    code: '',
    name: '',
    price: 0,
    points: 100,
    giftPoints: 0,
    sort: 0,
    status: 1
})

/**
 * 函数说明：创建默认工具计费规则项，便于运营快速按 toolKey 配置扣分策略。
 */
const createDefaultToolConsumeRule = (): ToolConsumeRuleFormItem => ({
    toolKey: '',
    name: '',
    consumePoints: 1,
    memberFree: 1,
    status: 1,
    sort: 0,
    remark: ''
})

const defaultMemberPlans: MemberPlanFormItem[] = [
    {
        code: 'vip_month',
        name: 'VIP月卡',
        price: 29,
        memberDays: 30,
        giftPoints: 80,
        sort: 1,
        status: 1,
        badge: '热卖'
    },
    {
        code: 'vip_quarter',
        name: 'VIP季卡',
        price: 79,
        memberDays: 90,
        giftPoints: 300,
        sort: 2,
        status: 1,
        badge: '推荐'
    },
    {
        code: 'vip_year',
        name: 'VIP年卡',
        price: 299,
        memberDays: 365,
        giftPoints: 1500,
        sort: 3,
        status: 1,
        badge: '省钱'
    }
]

const defaultPointsPacks: PointsPackFormItem[] = [
    {
        code: 'points_100',
        name: '100积分包',
        price: 9.9,
        points: 100,
        giftPoints: 0,
        sort: 1,
        status: 1
    },
    {
        code: 'points_500',
        name: '500积分包',
        price: 39.9,
        points: 500,
        giftPoints: 50,
        sort: 2,
        status: 1
    },
    {
        code: 'points_1000',
        name: '1000积分包',
        price: 69.9,
        points: 1000,
        giftPoints: 200,
        sort: 3,
        status: 1
    }
]

const defaultToolConsumeRules: ToolConsumeRuleFormItem[] = []
const defaultConsumeRiskRules: ConsumeRiskRulesForm = {
    perMinute: 30,
    perHour: 600,
    perDay: 3000
}

const toolConsumeRulePresetOptions: ToolConsumeRulePresetOption[] = [
    {
        value: 'video-compress',
        label: 'video-compress（视频压缩）',
        defaultName: '视频压缩',
        consumePoints: 2,
        memberFree: 1,
        remark: '视频压缩场景通常更耗资源'
    },
    {
        value: 'gif-compress',
        label: 'gif-compress（GIF压缩）',
        defaultName: 'GIF压缩',
        consumePoints: 2,
        memberFree: 1,
        remark: 'GIF 编解码较重，建议按次扣 2 分'
    },
    {
        value: 'photo-background',
        label: 'photo-background（AI抠图）',
        defaultName: 'AI抠图',
        consumePoints: 3,
        memberFree: 1,
        remark: '抠图模型调用较重，可适当提高扣分'
    },
    {
        value: 'pdf-compress',
        label: 'pdf-compress（PDF压缩）',
        defaultName: 'PDF压缩',
        consumePoints: 2,
        memberFree: 1,
        remark: 'PDF 压缩包含重型处理链路'
    },
    {
        value: 'video-format-convert',
        label: 'video-format-convert（视频格式转换）',
        defaultName: '视频格式转换',
        consumePoints: 2,
        memberFree: 1,
        remark: '转码链路建议统一按 2 分'
    }
]

/**
 * 函数说明：统一规范 toolKey 文本，便于搜索、去重和预设匹配复用。
 */
const normalizeToolKeyText = (value: unknown): string => {
    return String(value || '')
        .trim()
        .toLowerCase()
}

/**
 * 函数说明：将后端配置值解析为数组，兼容字符串 JSON 与数组对象。
 */
function parseArrayConfig<T>(value: unknown, fallback: T[]): T[] {
    if (Array.isArray(value)) {
        return value as T[]
    }
    if (typeof value === 'string') {
        const text = value.trim()
        if (!text) {
            return fallback
        }
        try {
            const parsed = JSON.parse(text)
            return Array.isArray(parsed) ? (parsed as T[]) : fallback
        } catch {
            return fallback
        }
    }
    return fallback
}

/**
 * 函数说明：清洗会员套餐配置，过滤掉关键字段为空的无效项。
 */
const sanitizeMemberPlans = (value: unknown): MemberPlanFormItem[] => {
    const list = parseArrayConfig<MemberPlanFormItem>(value, defaultMemberPlans)
    return list
        .map((item, index) => ({
            code: String(item.code || '').trim(),
            name: String(item.name || '').trim(),
            price: Math.max(0, Number(item.price || 0)),
            memberDays: Math.max(1, Number(item.memberDays || 1)),
            giftPoints: Math.max(0, Number(item.giftPoints || 0)),
            sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
            status: Number(item.status ?? 1) === 0 ? 0 : 1,
            badge: String(item.badge || '').trim()
        }))
        .filter((item) => item.code && item.name)
}

/**
 * 函数说明：清洗积分包配置，过滤掉关键字段为空的无效项。
 */
const sanitizePointsPacks = (value: unknown): PointsPackFormItem[] => {
    const list = parseArrayConfig<PointsPackFormItem>(value, defaultPointsPacks)
    return list
        .map((item, index) => ({
            code: String(item.code || '').trim(),
            name: String(item.name || '').trim(),
            price: Math.max(0, Number(item.price || 0)),
            points: Math.max(1, Number(item.points || 1)),
            giftPoints: Math.max(0, Number(item.giftPoints || 0)),
            sort: Number.isFinite(Number(item.sort)) ? Number(item.sort) : index,
            status: Number(item.status ?? 1) === 0 ? 0 : 1
        }))
        .filter((item) => item.code && item.name)
}

/**
 * 函数说明：清洗工具计费规则，过滤无效 toolKey 并统一字段范围。
 */
const sanitizeToolConsumeRules = (value: unknown): ToolConsumeRuleFormItem[] => {
    const list = parseArrayConfig<ToolConsumeRuleFormItem>(value, defaultToolConsumeRules)
    const seenToolKey = new Set<string>()
    return list
        .map((item, index) => {
            const toolKey = normalizeToolKeyText(item.toolKey)
            return {
                toolKey,
                name: String(item.name || '').trim(),
                consumePoints: Math.max(0, Number(item.consumePoints ?? 1)),
                memberFree: Number(item.memberFree ?? 1) === 0 ? 0 : 1,
                status: Number(item.status ?? 1) === 0 ? 0 : 1,
                sort: Number.isFinite(Number(item.sort))
                    ? Math.max(0, Number(item.sort))
                    : index + 1,
                remark: String(item.remark || '').trim()
            }
        })
        .filter((item) => {
            if (!item.toolKey || seenToolKey.has(item.toolKey)) {
                return false
            }
            seenToolKey.add(item.toolKey)
            return true
        })
}

/**
 * 函数说明：检测 toolKey 重复配置，避免保存后被清洗逻辑静默去重。
 */
const detectDuplicatedToolKeys = (value: ToolConsumeRuleFormItem[]): string[] => {
    const duplicatedList: string[] = []
    const seenToolKey = new Set<string>()
    ;(value || []).forEach((item) => {
        const toolKey = normalizeToolKeyText(item.toolKey)
        if (!toolKey) {
            return
        }
        if (seenToolKey.has(toolKey)) {
            duplicatedList.push(toolKey)
            return
        }
        seenToolKey.add(toolKey)
    })
    return Array.from(new Set(duplicatedList))
}

/**
 * 函数说明：清洗工具调用风控规则，避免负值配置导致风控失效。
 */
const sanitizeConsumeRiskRules = (value: unknown): ConsumeRiskRulesForm => {
    if (typeof value === 'string') {
        try {
            return sanitizeConsumeRiskRules(JSON.parse(value))
        } catch {
            return { ...defaultConsumeRiskRules }
        }
    }
    if (!value || typeof value !== 'object') {
        return { ...defaultConsumeRiskRules }
    }
    const source = value as Partial<ConsumeRiskRulesForm>
    return {
        perMinute: Math.max(0, Number(source.perMinute ?? defaultConsumeRiskRules.perMinute)),
        perHour: Math.max(0, Number(source.perHour ?? defaultConsumeRiskRules.perHour)),
        perDay: Math.max(0, Number(source.perDay ?? defaultConsumeRiskRules.perDay))
    }
}

const formData = reactive<LoginSetup>({
    frontendLoginEnabled: 0,
    loginWay: [],
    forceBindMobile: 0,
    openAgreement: 0,
    openOtherAuth: 0,
    autoLoginAuth: [1],
    openWechatAuth: 1,
    openQqAuth: 0,
    wechatAppId: '',
    wechatAppSecret: '',
    wechatRedirectUrl: '',
    qqAppId: '',
    qqAppKey: '',
    qqRedirectUrl: '',
    userCenterEnabled: 0,
    userCenterTitle: '用户中心',
    userCenterLink: '',
    dailyGiftPoints: 50,
    toolConsumePoints: 1,
    toolConsumeRules: [...defaultToolConsumeRules],
    consumeRiskRules: { ...defaultConsumeRiskRules },
    memberEnabled: 0,
    memberTrialDays: 0,
    memberPlans: [...defaultMemberPlans],
    pointsPacks: [...defaultPointsPacks],
    memberRightsIntro:
        '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。',
    paymentChannels: ['mock'],
    paymentWechatUrl: '',
    paymentWechatCreateApi: '',
    paymentWechatMchId: '',
    paymentWechatAppId: '',
    paymentWechatSerialNo: '',
    paymentWechatApiV3Key: '',
    paymentWechatPrivateKey: '',
    paymentWechatPlatformCert: '',
    paymentWechatPlatformSerialNo: '',
    paymentWechatPlatformEffectiveTime: '',
    paymentWechatPlatformExpireTime: '',
    paymentWechatPlatformSyncedAt: 0,
    paymentWechatNotifyUrl: '',
    paymentAlipayUrl: '',
    paymentAlipayCreateApi: '',
    paymentCallbackSecret: '',
    paymentRequestSecret: '',
    paymentRequestAuthType: 'none',
    paymentRequestHeader: 'X-Payment-Token',
    paymentRequestToken: '',
    paymentRequestTimeout: 12,
    adminLoginCaptchaOn: 1,
    adminLoginFailLimit: 5,
    adminLoginFailWindow: 900
})

const toolConsumeRuleKeyword = ref('')
const toolConsumeRulePresetKey = ref('')
const syncWechatCertLoading = ref(false)
const activeSection = ref<'access' | 'billing' | 'payment'>('access')

/**
 * 函数说明：根据当前页签给出简短操作提示，避免把所有说明长期展开。
 */
const activeSectionTip = computed(() => {
    const tips = {
        access: '设置前台登录开关、第三方授权和用户中心入口。',
        billing: '设置工具扣分、风控上限、会员套餐和积分包。',
        payment: '设置微信、支付宝与网关鉴权，上线前请关闭测试支付。'
    }
    return tips[activeSection.value]
})

/**
 * 函数说明：按关键词过滤工具计费规则，便于运营快速检索与定位。
 */
const filteredToolConsumeRules = computed<ToolConsumeRuleRenderItem[]>(() => {
    const keyword = String(toolConsumeRuleKeyword.value || '')
        .trim()
        .toLowerCase()
    const allRules = (formData.toolConsumeRules as ToolConsumeRuleFormItem[]).map(
        (rule, index) => ({ index, rule })
    )
    if (!keyword) {
        return allRules
    }
    return allRules.filter(({ rule }) => {
        const fieldText = `${rule.toolKey} ${rule.name} ${rule.remark}`.toLowerCase()
        return fieldText.includes(keyword)
    })
})

/**
 * 函数说明：判断当前是否启用了微信登录渠道。
 */
const isWechatAuthEnabled = computed<boolean>(() => {
    return Array.isArray(formData.autoLoginAuth) && formData.autoLoginAuth.includes(1)
})

/**
 * 函数说明：判断当前是否启用了 QQ 登录渠道。
 */
const isQqAuthEnabled = computed<boolean>(() => {
    return Array.isArray(formData.autoLoginAuth) && formData.autoLoginAuth.includes(2)
})

/**
 * 函数说明：将后端返回的多选值标准化为数字数组，兼容字符串和数组格式
 */
const normalizeMultiValue = (value: unknown): number[] => {
    if (Array.isArray(value)) {
        return value.map((item) => Number(item)).filter((item) => !Number.isNaN(item))
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => Number(item.trim()))
            .filter((item) => !Number.isNaN(item))
    }
    if (typeof value === 'number') {
        return [value]
    }
    return []
}

/**
 * 函数说明：将多选数组序列化为逗号分隔字符串，统一提交参数格式
 */
const serializeMultiValue = (value: unknown): string => {
    const list = normalizeMultiValue(value)
    return list.join(',')
}

/**
 * 函数说明：将多选字符串值标准化为字符串数组（用于支付渠道配置）。
 */
const normalizeStringMultiValue = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || '').trim()).filter((item) => item.length > 0)
    }
    if (typeof value === 'string') {
        return value
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
    }
    return []
}

/**
 * 函数说明：将字符串数组序列化为逗号分隔字符串，供后端保存。
 */
const serializeStringMultiValue = (value: unknown): string => {
    const list = normalizeStringMultiValue(value)
    return list.join(',')
}

/**
 * 函数说明：判断微信支付 V3 关键参数是否完整，用于支付渠道保存前校验。
 */
const hasCompleteWechatV3Config = (): boolean => {
    return Boolean(
        String(formData.paymentWechatMchId || '').trim() &&
            String(formData.paymentWechatAppId || '').trim() &&
            String(formData.paymentWechatSerialNo || '').trim() &&
            String(formData.paymentWechatApiV3Key || '').trim() &&
            String(formData.paymentWechatPrivateKey || '').trim() &&
            String(formData.paymentWechatNotifyUrl || '').trim()
    )
}

/**
 * 函数说明：将 ISO 时间文本格式化为本地可读时间，解析失败则返回原文本。
 */
const formatWechatTimeText = (value: unknown): string => {
    const text = String(value || '').trim()
    if (!text) {
        return '-'
    }
    const timestamp = new Date(text).getTime()
    if (Number.isNaN(timestamp)) {
        return text
    }
    return new Date(timestamp).toLocaleString()
}

/**
 * 函数说明：计算微信平台证书剩余天数，返回 null 表示未配置或不可计算。
 */
const wechatCertRemainDays = computed<number | null>(() => {
    const expireText = String(formData.paymentWechatPlatformExpireTime || '').trim()
    if (!expireText) {
        return null
    }
    const expireTimestamp = new Date(expireText).getTime()
    if (Number.isNaN(expireTimestamp)) {
        return null
    }
    const remainMs = expireTimestamp - Date.now()
    return Math.floor(remainMs / (24 * 60 * 60 * 1000))
})

/**
 * 函数说明：根据证书剩余天数生成状态文案，便于运营快速判断是否需要续拉。
 */
const wechatCertStatusText = computed<string>(() => {
    const remainDays = wechatCertRemainDays.value
    if (remainDays === null) {
        return '未获取'
    }
    if (remainDays < 0) {
        return '已过期'
    }
    if (remainDays <= 7) {
        return `即将过期（剩余${remainDays}天）`
    }
    if (remainDays <= 30) {
        return `需关注（剩余${remainDays}天）`
    }
    return `有效（剩余${remainDays}天）`
})

/**
 * 函数说明：根据证书剩余天数返回状态颜色，用于 Arco 标签视觉提示。
 */
const wechatCertStatusColor = computed<string>(() => {
    const remainDays = wechatCertRemainDays.value
    if (remainDays === null) {
        return 'gray'
    }
    if (remainDays < 0) {
        return 'red'
    }
    if (remainDays <= 7) {
        return 'orangered'
    }
    if (remainDays <= 30) {
        return 'gold'
    }
    return 'green'
})

/**
 * 函数说明：获取登录注册配置并回填页面表单
 */
const getData = async () => {
    try {
        const data = await getLogin()
        formData.frontendLoginEnabled = Number(data.frontendLoginEnabled ?? 0) === 1 ? 1 : 0
        formData.loginWay = normalizeMultiValue(data.loginWay)
        formData.forceBindMobile = Number(data.forceBindMobile ?? 0)
        formData.openAgreement = Number(data.openAgreement ?? 0)
        formData.openOtherAuth = Number(data.openOtherAuth ?? 0)
        formData.autoLoginAuth = normalizeMultiValue(data.autoLoginAuth)
        formData.openWechatAuth = Number(data.openWechatAuth ?? 0)
        formData.openQqAuth = Number(data.openQqAuth ?? 0)
        formData.wechatAppId = String(data.wechatAppId || '')
        formData.wechatAppSecret = String(data.wechatAppSecret || '')
        formData.wechatRedirectUrl = String(data.wechatRedirectUrl || '')
        formData.qqAppId = String(data.qqAppId || '')
        formData.qqAppKey = String(data.qqAppKey || '')
        formData.qqRedirectUrl = String(data.qqRedirectUrl || '')
        formData.userCenterEnabled = Number(data.userCenterEnabled ?? 0)
        formData.userCenterTitle = String(data.userCenterTitle || '用户中心')
        formData.userCenterLink = String(data.userCenterLink || '')
        formData.dailyGiftPoints = Math.max(0, Number(data.dailyGiftPoints ?? 50))
        formData.toolConsumePoints = Math.max(1, Number(data.toolConsumePoints ?? 1))
        formData.toolConsumeRules = sanitizeToolConsumeRules(data.toolConsumeRules)
        formData.consumeRiskRules = sanitizeConsumeRiskRules(data.consumeRiskRules)
        formData.memberEnabled = Number(data.memberEnabled ?? 0) === 1 ? 1 : 0
        formData.memberTrialDays = Math.max(0, Number(data.memberTrialDays ?? 0))
        formData.memberPlans = sanitizeMemberPlans(data.memberPlans)
        formData.pointsPacks = sanitizePointsPacks(data.pointsPacks)
        formData.memberRightsIntro =
            String(data.memberRightsIntro || '').trim() ||
            '会员有效期内可免费使用积分工具；购买会员套餐将赠送积分；积分包购买后即时到账。'
        formData.paymentChannels = normalizeStringMultiValue(data.paymentChannels)
        if (!formData.paymentChannels.length) {
            formData.paymentChannels = ['mock']
        }
        formData.paymentWechatUrl = String(data.paymentWechatUrl || '').trim()
        formData.paymentWechatCreateApi = String(data.paymentWechatCreateApi || '').trim()
        formData.paymentWechatMchId = String(data.paymentWechatMchId || '').trim()
        formData.paymentWechatAppId = String(data.paymentWechatAppId || '').trim()
        formData.paymentWechatSerialNo = String(data.paymentWechatSerialNo || '').trim()
        formData.paymentWechatApiV3Key = String(data.paymentWechatApiV3Key || '').trim()
        formData.paymentWechatPrivateKey = String(data.paymentWechatPrivateKey || '').trim()
        formData.paymentWechatPlatformCert = String(data.paymentWechatPlatformCert || '').trim()
        formData.paymentWechatPlatformSerialNo = String(
            data.paymentWechatPlatformSerialNo || ''
        ).trim()
        formData.paymentWechatPlatformEffectiveTime = String(
            data.paymentWechatPlatformEffectiveTime || ''
        ).trim()
        formData.paymentWechatPlatformExpireTime = String(
            data.paymentWechatPlatformExpireTime || ''
        ).trim()
        formData.paymentWechatPlatformSyncedAt = Math.max(
            0,
            Number(data.paymentWechatPlatformSyncedAt || 0)
        )
        formData.paymentWechatNotifyUrl = String(data.paymentWechatNotifyUrl || '').trim()
        formData.paymentAlipayUrl = String(data.paymentAlipayUrl || '').trim()
        formData.paymentAlipayCreateApi = String(data.paymentAlipayCreateApi || '').trim()
        formData.paymentCallbackSecret = String(data.paymentCallbackSecret || '')
        formData.paymentRequestSecret = String(data.paymentRequestSecret || '')
        formData.paymentRequestAuthType = ['none', 'bearer', 'header'].includes(
            String(data.paymentRequestAuthType || '').trim()
        )
            ? String(data.paymentRequestAuthType || '').trim()
            : 'none'
        formData.paymentRequestHeader =
            String(data.paymentRequestHeader || 'X-Payment-Token').trim() || 'X-Payment-Token'
        formData.paymentRequestToken = String(data.paymentRequestToken || '').trim()
        formData.paymentRequestTimeout = Math.min(
            60,
            Math.max(3, Number(data.paymentRequestTimeout ?? 12))
        )
        formData.adminLoginCaptchaOn = Number(data.adminLoginCaptchaOn ?? 1) === 1 ? 1 : 0
        formData.adminLoginFailLimit = Math.min(
            20,
            Math.max(3, Number(data.adminLoginFailLimit ?? 5))
        )
        formData.adminLoginFailWindow = Math.min(
            86400,
            Math.max(60, Number(data.adminLoginFailWindow ?? 900))
        )
        if (!formData.autoLoginAuth.length) {
            if (formData.openWechatAuth === 1) {
                formData.autoLoginAuth.push(1)
            }
            if (formData.openQqAuth === 1) {
                formData.autoLoginAuth.push(2)
            }
        }
    } catch (error) {
        console.log('获取=>', error)
    }
}

/**
 * 函数说明：重新读取登录与商业化配置，用于多人编辑后快速同步最新值。
 */
const reloadLoginConfig = async () => {
    await getData()
    feedback.msgSuccess('已重新加载登录与商业化配置')
}

/**
 * 函数说明：新增一个会员套餐配置项。
 */
const handleAddMemberPlan = () => {
    ;(formData.memberPlans as MemberPlanFormItem[]).push(createDefaultMemberPlan())
}

/**
 * 函数说明：删除指定下标的会员套餐配置项。
 */
const handleRemoveMemberPlan = (index: number) => {
    ;(formData.memberPlans as MemberPlanFormItem[]).splice(index, 1)
}

/**
 * 函数说明：新增一个积分包配置项。
 */
const handleAddPointsPack = () => {
    ;(formData.pointsPacks as PointsPackFormItem[]).push(createDefaultPointsPack())
}

/**
 * 函数说明：删除指定下标的积分包配置项。
 */
const handleRemovePointsPack = (index: number) => {
    ;(formData.pointsPacks as PointsPackFormItem[]).splice(index, 1)
}

/**
 * 函数说明：新增一个工具计费规则项。
 */
const handleAddToolConsumeRule = () => {
    ;(formData.toolConsumeRules as ToolConsumeRuleFormItem[]).push(createDefaultToolConsumeRule())
}

/**
 * 函数说明：从常用工具预设快速新增规则，若已存在则直接覆盖该规则关键字段。
 */
const handleApplyToolConsumeRulePreset = () => {
    const presetKey = normalizeToolKeyText(toolConsumeRulePresetKey.value)
    if (!presetKey) {
        feedback.msgError('请先选择一个工具预设')
        return
    }
    const preset = toolConsumeRulePresetOptions.find((item) => item.value === presetKey)
    if (!preset) {
        feedback.msgError('未找到对应预设，请重新选择')
        return
    }
    const ruleList = formData.toolConsumeRules as ToolConsumeRuleFormItem[]
    const existingIndex = ruleList.findIndex(
        (item) => normalizeToolKeyText(item.toolKey) === presetKey
    )
    const presetRule: ToolConsumeRuleFormItem = {
        ...createDefaultToolConsumeRule(),
        toolKey: preset.value,
        name: preset.defaultName,
        consumePoints: preset.consumePoints,
        memberFree: preset.memberFree,
        status: 1,
        sort:
            existingIndex >= 0
                ? ruleList[existingIndex]?.sort || existingIndex + 1
                : ruleList.length + 1,
        remark: preset.remark
    }
    if (existingIndex >= 0) {
        ruleList.splice(existingIndex, 1, presetRule)
        feedback.msgSuccess(`已更新预设规则：${preset.defaultName}`)
    } else {
        ruleList.push(presetRule)
        feedback.msgSuccess(`已新增预设规则：${preset.defaultName}`)
    }
    toolConsumeRuleKeyword.value = presetKey
    toolConsumeRulePresetKey.value = ''
}

/**
 * 函数说明：删除指定下标的工具计费规则项。
 */
const handleRemoveToolConsumeRule = (index: number) => {
    ;(formData.toolConsumeRules as ToolConsumeRuleFormItem[]).splice(index, 1)
}

/**
 * 函数说明：自动从微信支付V3拉取平台证书并回填到当前表单，降低手工拷贝证书出错概率。
 */
const handleSyncWechatPlatformCert = async () => {
    if (syncWechatCertLoading.value) {
        return
    }
    if (
        !String(formData.paymentWechatMchId || '').trim() ||
        !String(formData.paymentWechatSerialNo || '').trim() ||
        !String(formData.paymentWechatApiV3Key || '').trim() ||
        !String(formData.paymentWechatPrivateKey || '').trim()
    ) {
        feedback.msgError('请先填写商户号、证书序列号、APIv3 密钥、商户私钥后再拉取平台证书')
        return
    }
    syncWechatCertLoading.value = true
    try {
        const result = await syncWechatPlatformCert()
        const certPem = String(result?.platformCertPem || '').trim()
        if (certPem) {
            formData.paymentWechatPlatformCert = certPem
        }
        formData.paymentWechatPlatformSerialNo = String(result?.platformSerialNo || '').trim()
        formData.paymentWechatPlatformEffectiveTime = String(result?.effectiveTime || '').trim()
        formData.paymentWechatPlatformExpireTime = String(result?.expireTime || '').trim()
        formData.paymentWechatPlatformSyncedAt = Math.max(0, Number(result?.syncedAt || 0))
        const serialNo = String(result?.platformSerialNo || '').trim()
        if (serialNo) {
            feedback.msgSuccess(`平台证书同步成功（serial: ${serialNo}）`)
        } else {
            feedback.msgSuccess('平台证书同步成功')
        }
    } catch (error) {
        console.log('同步微信平台证书失败=>', error)
    } finally {
        syncWechatCertLoading.value = false
    }
}

/**
 * 函数说明：保存登录注册配置，提交前做必要字段校验
 */
const handleSubmit = async () => {
    if (
        formData.frontendLoginEnabled === 1 &&
        (!Array.isArray(formData.loginWay) || formData.loginWay.length === 0)
    ) {
        feedback.msgError('登录方式至少选择一项！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        formData.openOtherAuth === 1 &&
        (!Array.isArray(formData.autoLoginAuth) || formData.autoLoginAuth.length === 0)
    ) {
        feedback.msgError('开启第三方登录时，至少选择一个授权渠道！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        isWechatAuthEnabled.value &&
        (!formData.wechatAppId.trim() || !formData.wechatRedirectUrl.trim())
    ) {
        feedback.msgError('微信登录至少需要配置 AppID 与回调地址！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        isQqAuthEnabled.value &&
        (!formData.qqAppId.trim() || !formData.qqRedirectUrl.trim())
    ) {
        feedback.msgError('QQ 登录至少需要配置 AppID 与回调地址！')
        return
    }
    if (
        formData.frontendLoginEnabled === 1 &&
        formData.userCenterEnabled === 1 &&
        !formData.userCenterLink.trim()
    ) {
        feedback.msgError('请填写用户中心入口链接！')
        return
    }
    if (formData.dailyGiftPoints < 0) {
        feedback.msgError('每日赠送积分不能小于 0')
        return
    }
    if (formData.toolConsumePoints < 1) {
        feedback.msgError('单次工具消耗积分至少为 1')
        return
    }
    if (formData.adminLoginFailLimit < 3 || formData.adminLoginFailLimit > 20) {
        feedback.msgError('后台登录失败锁定阈值需在 3~20 次之间')
        return
    }
    if (formData.adminLoginFailWindow < 60 || formData.adminLoginFailWindow > 86400) {
        feedback.msgError('后台登录锁定窗口需在 60~86400 秒之间')
        return
    }
    const duplicatedToolKeys = detectDuplicatedToolKeys(
        formData.toolConsumeRules as ToolConsumeRuleFormItem[]
    )
    if (duplicatedToolKeys.length > 0) {
        feedback.msgError(`按工具计费规则存在重复 toolKey：${duplicatedToolKeys.join('、')}`)
        return
    }
    const normalizedToolConsumeRules = sanitizeToolConsumeRules(formData.toolConsumeRules)
    const normalizedConsumeRiskRules = sanitizeConsumeRiskRules(formData.consumeRiskRules)
    if (
        normalizedConsumeRiskRules.perHour > 0 &&
        normalizedConsumeRiskRules.perMinute > normalizedConsumeRiskRules.perHour
    ) {
        feedback.msgError('风控规则异常：每小时上限不能小于每分钟上限')
        return
    }
    if (
        normalizedConsumeRiskRules.perDay > 0 &&
        normalizedConsumeRiskRules.perHour > normalizedConsumeRiskRules.perDay
    ) {
        feedback.msgError('风控规则异常：每日上限不能小于每小时上限')
        return
    }
    if (formData.memberEnabled === 1 && formData.memberTrialDays < 0) {
        feedback.msgError('会员试用天数不能小于 0')
        return
    }

    const normalizedMemberPlans = sanitizeMemberPlans(formData.memberPlans)
    const normalizedPointsPacks = sanitizePointsPacks(formData.pointsPacks)
    if (normalizedMemberPlans.length === 0) {
        feedback.msgError('请至少保留一个有效会员套餐（需填写编码与名称）')
        return
    }
    if (normalizedPointsPacks.length === 0) {
        feedback.msgError('请至少保留一个有效积分包（需填写编码与名称）')
        return
    }
    const paymentChannels = normalizeStringMultiValue(formData.paymentChannels)
    if (!paymentChannels.length) {
        feedback.msgError('请至少保留一个支付渠道')
        return
    }
    const hasWechatPayUrl = Boolean(String(formData.paymentWechatUrl || '').trim())
    const hasWechatCreateApi = Boolean(String(formData.paymentWechatCreateApi || '').trim())
    const hasWechatV3Config = hasCompleteWechatV3Config()
    if (
        paymentChannels.includes('wechat_h5') &&
        !hasWechatPayUrl &&
        !hasWechatCreateApi &&
        !hasWechatV3Config
    ) {
        feedback.msgError(
            '启用微信支付时，请配置微信支付跳转地址、微信下单接口地址或完整的微信支付V3参数'
        )
        return
    }
    const hasWechatV3PartialInput = Boolean(
        String(formData.paymentWechatMchId || '').trim() ||
            String(formData.paymentWechatAppId || '').trim() ||
            String(formData.paymentWechatSerialNo || '').trim() ||
            String(formData.paymentWechatApiV3Key || '').trim() ||
            String(formData.paymentWechatPrivateKey || '').trim() ||
            String(formData.paymentWechatNotifyUrl || '').trim()
    )
    if (paymentChannels.includes('wechat_h5') && hasWechatV3PartialInput && !hasWechatV3Config) {
        feedback.msgError(
            '微信支付V3参数未配置完整，请至少补齐商户号/AppID/证书序列号/APIv3密钥/商户私钥/回调地址'
        )
        return
    }
    const hasAlipayPayUrl = Boolean(String(formData.paymentAlipayUrl || '').trim())
    const hasAlipayCreateApi = Boolean(String(formData.paymentAlipayCreateApi || '').trim())
    if (paymentChannels.includes('alipay_h5') && !hasAlipayPayUrl && !hasAlipayCreateApi) {
        feedback.msgError('启用支付宝时，请至少配置支付宝跳转地址或支付宝下单接口地址')
        return
    }
    const paymentRequestAuthType = ['none', 'bearer', 'header'].includes(
        String(formData.paymentRequestAuthType || 'none')
    )
        ? String(formData.paymentRequestAuthType || 'none')
        : 'none'
    const paymentRequestHeader = String(formData.paymentRequestHeader || '').trim()
    const paymentRequestToken = String(formData.paymentRequestToken || '').trim()
    if (paymentRequestAuthType !== 'none' && !paymentRequestToken) {
        feedback.msgError('启用支付网关鉴权后，请填写鉴权令牌')
        return
    }
    if (paymentRequestAuthType === 'header' && !paymentRequestHeader) {
        feedback.msgError('自定义 Header 模式下，请填写鉴权 Header 名称')
        return
    }
    if (formData.paymentRequestTimeout < 3 || formData.paymentRequestTimeout > 60) {
        feedback.msgError('支付网关下单超时需在 3~60 秒之间')
        return
    }

    try {
        formData.openWechatAuth = isWechatAuthEnabled.value ? 1 : 0
        formData.openQqAuth = isQqAuthEnabled.value ? 1 : 0
        await setLogin({
            ...formData,
            loginWay: serializeMultiValue(formData.loginWay),
            autoLoginAuth: serializeMultiValue(formData.autoLoginAuth),
            toolConsumeRules: normalizedToolConsumeRules,
            consumeRiskRules: normalizedConsumeRiskRules,
            memberPlans: normalizedMemberPlans,
            pointsPacks: normalizedPointsPacks,
            memberRightsIntro: String(formData.memberRightsIntro || '').trim(),
            paymentChannels: serializeStringMultiValue(paymentChannels),
            paymentWechatUrl: String(formData.paymentWechatUrl || '').trim(),
            paymentWechatCreateApi: String(formData.paymentWechatCreateApi || '').trim(),
            paymentWechatMchId: String(formData.paymentWechatMchId || '').trim(),
            paymentWechatAppId: String(formData.paymentWechatAppId || '').trim(),
            paymentWechatSerialNo: String(formData.paymentWechatSerialNo || '').trim(),
            paymentWechatApiV3Key: String(formData.paymentWechatApiV3Key || '').trim(),
            paymentWechatPrivateKey: String(formData.paymentWechatPrivateKey || '').trim(),
            paymentWechatPlatformCert: String(formData.paymentWechatPlatformCert || '').trim(),
            paymentWechatNotifyUrl: String(formData.paymentWechatNotifyUrl || '').trim(),
            paymentAlipayUrl: String(formData.paymentAlipayUrl || '').trim(),
            paymentAlipayCreateApi: String(formData.paymentAlipayCreateApi || '').trim(),
            paymentCallbackSecret: String(formData.paymentCallbackSecret || '').trim(),
            paymentRequestSecret: String(formData.paymentRequestSecret || '').trim(),
            paymentRequestAuthType,
            paymentRequestHeader,
            paymentRequestToken,
            paymentRequestTimeout: Math.min(
                60,
                Math.max(3, Number(formData.paymentRequestTimeout || 12))
            )
        })
        feedback.msgSuccess('操作成功')
        getData()
    } catch (error) {
        console.log('保存=>', error)
    }
}

getData()
</script>

<style lang="scss" scoped>
.login-section-nav {
    margin-bottom: 16px;
}

.login-section-nav :deep(.arco-tabs-content) {
    display: none;
}

.login-section-nav__tip {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border-2);
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.7;
}

.layout-page-actions,
.layout-status-tags {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.third-party-fields {
    width: 100%;
    max-width: 620px;
}

.payment-v3-fields {
    padding: 12px;
    border: 1px dashed var(--color-border-2);
    border-radius: 10px;
    background: var(--color-fill-1);
}

.wechat-cert-meta {
    padding: 10px;
    border-radius: 8px;
    background: var(--color-bg-2);
    border: 1px solid var(--color-border-2);
}

.config-list {
    border: 1px solid var(--color-border-2);
    border-radius: 10px;
    padding: 12px;
    background: var(--color-fill-1);
}

.config-list__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--color-text-2);
    font-size: 12px;
}

.config-list__empty {
    color: var(--color-text-3);
    font-size: 13px;
    padding: 10px 0;
}

.config-list__toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.config-list__search {
    width: min(320px, 100%);
}

.config-list__preset-select {
    width: min(320px, 100%);
}

.config-item {
    border: 1px dashed var(--color-border-2);
    border-radius: 8px;
    padding: 10px;
    background: var(--color-bg-2);
}

.config-item + .config-item {
    margin-top: 10px;
}

.config-item__actions {
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
}

@media (max-width: 768px) {
    .layout-page-actions {
        justify-content: flex-start;
    }
}
</style>
