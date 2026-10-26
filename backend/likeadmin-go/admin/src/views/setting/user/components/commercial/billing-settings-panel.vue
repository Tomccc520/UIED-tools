<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <section class="commercial-billing" aria-label="积分与会员配置">
        <a-card
            class="!border-none mt-4"
            :bordered="false"
            data-admin-smoke="login-register-billing-panel"
        >
            <div class="font-medium mb-6">工具积分设置</div>

            <a-form-item label="每日赠送积分">
                <div class="w-full max-w-[360px]">
                    <a-input-number
                        v-model="formData.dailyGiftPoints"
                        aria-label="每日赠送积分"
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
                        aria-label="全局单次消耗积分"
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
                        <span>
                            按 toolKey 覆盖全局扣分策略，未配置的工具继续使用“单次工具消耗积分”。
                        </span>
                        <a-space size="mini">
                            <a-tag color="arcoblue" size="small">
                                已配置 {{ formData.toolConsumeRules.length }} 条
                            </a-tag>
                            <a-button size="small" type="outline" @click="handleAddToolConsumeRule">
                                新增空规则
                            </a-button>
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
                    <div v-if="formData.toolConsumeRules.length === 0" class="config-list__empty">
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
                        <div class="commercial-rule-grid">
                            <label>
                                工具标识
                                <a-input
                                    v-model="item.rule.toolKey"
                                    :input-attrs="{
                                        'aria-label': `第${item.index + 1}条规则工具标识`
                                    }"
                                    placeholder="如 video-compress"
                                    allow-clear
                                />
                            </label>
                            <label>
                                规则名称
                                <a-input
                                    v-model="item.rule.name"
                                    :input-attrs="{ 'aria-label': `第${item.index + 1}条规则名称` }"
                                    placeholder="可选"
                                    allow-clear
                                />
                            </label>
                            <label>
                                扣除积分
                                <a-input-number
                                    v-model="item.rule.consumePoints"
                                    :min="0"
                                    :step="1"
                                    :aria-label="`第${item.index + 1}条规则扣除积分`"
                                    class="w-full"
                                />
                            </label>
                            <label>
                                会员免扣
                                <span class="commercial-rule-switch">
                                    <a-switch
                                        v-model="item.rule.memberFree"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                        :aria-label="`第${item.index + 1}条规则会员免扣`"
                                    />
                                    {{ item.rule.memberFree === 1 ? '免扣' : '不免扣' }}
                                </span>
                            </label>
                            <label>
                                启用规则
                                <span class="commercial-rule-switch">
                                    <a-switch
                                        v-model="item.rule.status"
                                        :checked-value="1"
                                        :unchecked-value="0"
                                        :aria-label="`启用第${item.index + 1}条规则`"
                                    />
                                </span>
                            </label>
                            <label>
                                排序
                                <a-input-number
                                    v-model="item.rule.sort"
                                    :min="0"
                                    :step="1"
                                    :aria-label="`第${item.index + 1}条规则排序`"
                                    class="w-full"
                                />
                            </label>
                            <label>
                                备注
                                <a-input
                                    v-model="item.rule.remark"
                                    :input-attrs="{ 'aria-label': `第${item.index + 1}条规则备注` }"
                                    placeholder="可选"
                                    allow-clear
                                />
                            </label>
                        </div>
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
                        示例：`toolKey=video-compress` 设置 `consumePoints=2`，表示视频压缩每次扣 2
                        积分。
                    </div>
                </div>
            </a-form-item>

            <a-form-item label="工具调用风控规则">
                <div class="w-full max-w-[760px]">
                    <div class="commercial-risk-grid">
                        <div>
                            <a-form-item hide-label>
                                <a-input-number
                                    v-model="formData.consumeRiskRules.perMinute"
                                    :min="0"
                                    :step="1"
                                    class="w-full"
                                    placeholder="每分钟上限"
                                />
                            </a-form-item>
                        </div>
                        <div>
                            <a-form-item hide-label>
                                <a-input-number
                                    v-model="formData.consumeRiskRules.perHour"
                                    :min="0"
                                    :step="10"
                                    class="w-full"
                                    placeholder="每小时上限"
                                />
                            </a-form-item>
                        </div>
                        <div>
                            <a-form-item hide-label>
                                <a-input-number
                                    v-model="formData.consumeRiskRules.perDay"
                                    :min="0"
                                    :step="10"
                                    class="w-full"
                                    placeholder="每日上限"
                                />
                            </a-form-item>
                        </div>
                    </div>
                    <div class="form-tips mt-1">
                        设为 0 表示不限制。默认值：30/600/3000（分钟/小时/每日）。
                    </div>
                </div>
            </a-form-item>
        </a-card>

        <a-card class="!border-none mt-4" :bordered="false">
            <div class="font-medium mb-6">会员功能设置</div>

            <a-form-item label="启用会员功能">
                <div>
                    <a-switch
                        v-model="formData.memberEnabled"
                        :checked-value="1"
                        :unchecked-value="0"
                    />
                    <span class="mt-1 ml-2">{{ formData.memberEnabled ? '开启' : '关闭' }}</span>
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
                <commercial-offer-list v-model="formData.memberPlans" kind="member" />
            </a-form-item>
            <a-form-item label="积分包配置">
                <commercial-offer-list v-model="formData.pointsPacks" kind="points" />
            </a-form-item>
        </a-card>
    </section>
</template>
<script setup lang="ts">
import type { CommercialDraft } from './commercial-config'
import { useCommercialBillingEditor } from './use-commercial-billing-editor'
import CommercialOfferList from './commercial-offer-list.vue'
const props = defineProps<{ formData: CommercialDraft }>()
// 所有业务值仍属于父页草稿；局部搜索和预设选择不参与持久化。
const formData = props.formData
const {
    toolConsumeRuleKeyword,
    toolConsumeRulePresetKey,
    filteredToolConsumeRules,
    toolConsumeRulePresetOptions,
    handleAddToolConsumeRule,
    handleApplyToolConsumeRulePreset,
    handleRemoveToolConsumeRule
} = useCommercialBillingEditor(formData)
</script>
<style scoped lang="scss">
.config-list {
    width: 100%;
    max-width: 980px;
    padding: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-fill-1);
}
.config-list__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    color: var(--color-text-2);
}
.config-list__toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}
.config-list__search,
.config-list__preset-select {
    width: min(320px, 100%);
}
.config-list__empty {
    padding: 12px 0;
    color: var(--color-text-3);
    font-size: 13px;
}
.config-item {
    padding: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-bg-2);
}
.config-item + .config-item {
    margin-top: 12px;
}
.config-item__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}
.commercial-rule-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}
.commercial-rule-grid label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    color: var(--color-text-2);
    font-size: 12px;
}
.commercial-rule-switch {
    min-height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.commercial-risk-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}
@media (max-width: 1000px) {
    .commercial-rule-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 600px) {
    .commercial-rule-grid,
    .commercial-risk-grid {
        grid-template-columns: 1fr;
    }
    .config-list__toolbar :deep(.arco-btn),
    .config-list :deep(.arco-btn) {
        min-height: 44px;
    }
}
</style>
