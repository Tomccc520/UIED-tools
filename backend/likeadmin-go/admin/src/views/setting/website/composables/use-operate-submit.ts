/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
import feedback from '@/utils/feedback'
import { ref } from 'vue'

interface SubmitOptions {
    successText?: string | (() => string)
}

/**
 * 函数说明：解析固定或延迟生成的提交成功文案，支持根据接口返回结果生成精确反馈。
 */
const resolveSubmitSuccessText = (
    successText: SubmitOptions['successText'],
    fallbackText: string
): string => {
    if (typeof successText === 'function') {
        return successText() || fallbackText
    }
    return successText || fallbackText
}

/**
 * 函数说明：统一官网设置页面提交态、成功提示与最近保存时间，减少页面重复实现。
 */
export const useOperateSubmit = (defaultSuccessText = '配置已保存') => {
    const isSubmitting = ref(false)
    const lastSavedAt = ref('')

    /**
     * 函数说明：格式化时间文本，作为运营页“最近保存时间”展示值。
     */
    const formatDateTimeText = (date: Date): string => {
        const pad = (value: number) => String(value).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
            date.getHours()
        )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    /**
     * 函数说明：执行保存动作并统一反馈，成功后自动写入最近保存时间。
     */
    const runSubmit = async (
        executor: () => Promise<void>,
        options: SubmitOptions = {}
    ): Promise<boolean> => {
        if (isSubmitting.value) {
            return false
        }
        isSubmitting.value = true
        try {
            await executor()
            feedback.msgSuccess(resolveSubmitSuccessText(options.successText, defaultSuccessText))
            lastSavedAt.value = formatDateTimeText(new Date())
            return true
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        isSubmitting,
        lastSavedAt,
        runSubmit
    }
}
