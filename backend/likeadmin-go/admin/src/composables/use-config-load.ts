/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { ref, type ComputedRef } from 'vue'
import feedback from '@/utils/feedback'

/** 管理配置的首次加载和重载；加载失败不更新基线，重载前保护尚未保存的编辑。 */
export const useConfigLoad = (dirty: ComputedRef<boolean>) => {
    const isLoadingData = ref(false)
    const hasLoadedData = ref(false)
    const loadErrorMessage = ref('')

    /** 执行加载任务；任务包含读取和成功后的回填，失败保留既有表单供重试。 */
    const loadConfiguration = async (readAndApply: () => Promise<void>): Promise<boolean> => {
        if (isLoadingData.value) return false
        isLoadingData.value = true
        loadErrorMessage.value = ''
        try {
            await readAndApply()
            hasLoadedData.value = true
            return true
        } catch {
            loadErrorMessage.value = '配置加载失败，您的编辑内容已保留，请重新加载后再保存。'
            return false
        } finally {
            isLoadingData.value = false
        }
    }

    /** 仅在用户确认后重新读取配置；取消时不触发网络请求或覆盖本地编辑。 */
    const reloadConfiguration = async (reload: () => Promise<boolean>): Promise<boolean> => {
        if (isLoadingData.value) return false
        if (dirty.value) {
            try { await feedback.confirm('重新加载会放弃当前未保存更改，确定继续吗？') } catch { return false }
        }
        return reload()
    }
    return { isLoadingData, hasLoadedData, loadErrorMessage, loadConfiguration, reloadConfiguration }
}
