<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="commercial-offers">
        <div class="commercial-offers__heading">
            <p>保存配置后，前台读取最新{{ itemName }}。</p>
            <a-button size="small" type="outline" @click="addOffer">新增{{ itemName }}</a-button>
        </div>
        <p v-if="!modelValue.length" class="commercial-offers__empty">
            暂无{{ itemName }}，请新增。
        </p>
        <section
            v-for="(offer, index) in modelValue"
            :key="index"
            class="commercial-offer"
            :aria-label="`第${index + 1}个${itemName}`"
        >
            <div class="commercial-offer__fields">
                <label>
                    编码
                    <a-input
                        :model-value="offer.code"
                        :input-attrs="{ 'aria-label': fieldLabel(index, '编码') }"
                        :placeholder="kind === 'member' ? '如 vip_month' : '如 points_100'"
                        allow-clear
                        @update:model-value="updateOffer(index, 'code', $event)"
                    />
                </label>
                <label>
                    名称
                    <a-input
                        :model-value="offer.name"
                        :input-attrs="{ 'aria-label': fieldLabel(index, '名称') }"
                        :placeholder="kind === 'member' ? '如 VIP月卡' : '如 100积分包'"
                        allow-clear
                        @update:model-value="updateOffer(index, 'name', $event)"
                    />
                </label>
                <label>
                    价格（元）
                    <a-input-number
                        :model-value="offer.price"
                        :min="0"
                        :step="1"
                        :aria-label="fieldLabel(index, '价格')"
                        @update:model-value="updateOffer(index, 'price', $event)"
                    />
                </label>
                <label v-if="kind === 'member'">
                    会员天数
                    <a-input-number
                        :model-value="memberDays(offer)"
                        :min="1"
                        :step="1"
                        :aria-label="fieldLabel(index, '会员天数')"
                        @update:model-value="updateOffer(index, 'memberDays', $event)"
                    />
                </label>
                <label v-else>
                    积分数
                    <a-input-number
                        :model-value="points(offer)"
                        :min="1"
                        :step="10"
                        :aria-label="fieldLabel(index, '积分数')"
                        @update:model-value="updateOffer(index, 'points', $event)"
                    />
                </label>
                <label>
                    赠送积分
                    <a-input-number
                        :model-value="offer.giftPoints"
                        :min="0"
                        :step="10"
                        :aria-label="fieldLabel(index, '赠送积分')"
                        @update:model-value="updateOffer(index, 'giftPoints', $event)"
                    />
                </label>
                <label v-if="kind === 'member'">
                    角标
                    <a-input
                        :model-value="badge(offer)"
                        :input-attrs="{ 'aria-label': fieldLabel(index, '角标') }"
                        placeholder="如 热卖"
                        allow-clear
                        @update:model-value="updateOffer(index, 'badge', $event)"
                    />
                </label>
                <label>
                    排序
                    <a-input-number
                        :model-value="offer.sort"
                        :min="0"
                        :step="1"
                        :aria-label="fieldLabel(index, '排序')"
                        @update:model-value="updateOffer(index, 'sort', $event)"
                    />
                </label>
                <label>
                    启用
                    <span class="commercial-offer__switch">
                        <a-switch
                            :model-value="offer.status"
                            :checked-value="1"
                            :unchecked-value="0"
                            :aria-label="fieldLabel(index, '启用')"
                            @update:model-value="updateOffer(index, 'status', $event)"
                        />
                    </span>
                </label>
            </div>
            <div class="commercial-offer__actions">
                <a-button
                    size="small"
                    status="danger"
                    :aria-label="`删除第${index + 1}个${itemName}`"
                    @click="removeOffer(index)"
                >
                    删除{{ itemName }}
                </a-button>
            </div>
        </section>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import {
    createDefaultMemberPlan,
    createDefaultPointsPack,
    type MemberPlanFormItem,
    type PointsPackFormItem
} from './commercial-config'
type Offer = MemberPlanFormItem | PointsPackFormItem
type OfferField = keyof MemberPlanFormItem | keyof PointsPackFormItem
const props = defineProps<{ modelValue: Offer[]; kind: 'member' | 'points' }>()
const emit = defineEmits<{ (event: 'update:modelValue', value: Offer[]): void }>()
/** 会员与积分包共享编辑行为，保留各自字段和展示名称。 */
const itemName = computed(() => (props.kind === 'member' ? '会员套餐' : '积分包'))
/** 为重复配置项生成可区分的输入名称，供键盘和辅助技术定位。 */
const fieldLabel = (index: number, field: string) => `第${index + 1}个${itemName.value}${field}`
/** 只读取会员天数字段，不把积分包中的积分数误当成天数。 */
const memberDays = (offer: Offer) => ('memberDays' in offer ? offer.memberDays : 1)
/** 只读取积分包积分字段，会员套餐不生成隐藏的额外积分配置。 */
const points = (offer: Offer) => ('points' in offer ? offer.points : 1)
/** 只读取会员角标，积分包的扩展字段不参与本面板展示。 */
const badge = (offer: Offer) => ('badge' in offer ? offer.badge : '')
/** 合并当前行的单个字段，通过事件更新父级草稿，保留其它行与扩展数据。 */
const updateOffer = (index: number, field: OfferField, value: unknown) => {
    if (!Number.isInteger(index) || index < 0 || index >= props.modelValue.length) return
    emit(
        'update:modelValue',
        props.modelValue.map((offer, position) =>
            position === index ? { ...offer, [field]: value } : offer
        )
    )
}
/** 新配置进入父级草稿，继续使用原有业务默认值，保存只由页面统一执行。 */
const addOffer = () =>
    emit('update:modelValue', [
        ...props.modelValue,
        props.kind === 'member' ? createDefaultMemberPlan() : createDefaultPointsPack()
    ])
/** 删除只作用于当前草稿，服务器记录直到显式保存前仍保持原值。 */
const removeOffer = (index: number) => {
    if (!Number.isInteger(index) || index < 0 || index >= props.modelValue.length) return
    emit(
        'update:modelValue',
        props.modelValue.filter((_, position) => position !== index)
    )
}
</script>
<style scoped lang="scss">
.commercial-offers {
    width: 100%;
    max-width: 980px;
    padding: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-fill-1);
}
.commercial-offers__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}
.commercial-offers p {
    margin: 0;
    color: var(--color-text-3);
    font-size: 12px;
    line-height: 1.7;
}
.commercial-offers__empty {
    padding: 12px 0;
}
.commercial-offer {
    padding: 12px;
    border: 1px solid var(--color-border-2);
    border-radius: var(--uied-admin-radius);
    background: var(--color-bg-2);
}
.commercial-offer + .commercial-offer {
    margin-top: 12px;
}
.commercial-offer__fields {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}
.commercial-offer label {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    color: var(--color-text-2);
    font-size: 12px;
}
.commercial-offer :deep(.arco-input-number) {
    width: 100%;
}
.commercial-offer__switch {
    display: flex;
    align-items: center;
    min-height: 32px;
}
.commercial-offer__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
}
@media (max-width: 1000px) {
    .commercial-offer__fields {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}
@media (max-width: 600px) {
    .commercial-offer__fields {
        grid-template-columns: 1fr;
    }
    .commercial-offers :deep(.arco-btn) {
        min-height: 44px;
    }
}
</style>
