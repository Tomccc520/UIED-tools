/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import { computed, ref } from 'vue'
import feedback from '@/utils/feedback'
import {
    createDefaultToolConsumeRule,
    normalizeToolKeyText,
    toolConsumeRulePresetOptions,
    type CommercialDraft,
    type ToolConsumeRuleFormItem,
    type ToolConsumeRuleRenderItem
} from './commercial-config'

/** 管理计费规则的局部筛选与草稿动作，不独立读取或保存后台设置。 */
export const useCommercialBillingEditor = (formData: CommercialDraft) => {
    const toolConsumeRuleKeyword = ref('')
    const toolConsumeRulePresetKey = ref('')
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
     * 函数说明：新增一个工具计费规则项。
     */
    const handleAddToolConsumeRule = () => {
        ;(formData.toolConsumeRules as ToolConsumeRuleFormItem[]).push(
            createDefaultToolConsumeRule()
        )
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
        if (!Number.isInteger(index) || index < 0 || index >= formData.toolConsumeRules.length)
            return
        ;(formData.toolConsumeRules as ToolConsumeRuleFormItem[]).splice(index, 1)
    }

    return {
        toolConsumeRuleKeyword,
        toolConsumeRulePresetKey,
        filteredToolConsumeRules,
        toolConsumeRulePresetOptions,
        handleAddToolConsumeRule,
        handleApplyToolConsumeRulePreset,
        handleRemoveToolConsumeRule
    }
}
