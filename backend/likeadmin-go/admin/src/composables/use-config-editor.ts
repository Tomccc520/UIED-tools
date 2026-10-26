/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import {
    computed,
    onActivated,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    ref,
    type ComputedRef,
} from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import feedback from '@/utils/feedback'
import { useConfigLoad } from '@/composables/use-config-load'
import { useOperateSubmit } from '@/composables/use-operate-submit'

interface ConfigEditorOptions {
    canEdit: ComputedRef<boolean>
    snapshot: () => string
    successText: string
}

/** 复用配置读写与离开保护；业务字段、校验、读取回填和写入接口仍由页面维护。 */
export const useConfigEditor = (options: ConfigEditorOptions) => {
    const baseline = ref<string | null>(null)
    let disposed = false
    let confirmingReload = false
    let active = true
    let unloadAttached = false
    const hasUnsavedChanges = computed(
        () => baseline.value !== null && options.snapshot() !== baseline.value
    )
    const {
        isLoadingData,
        hasLoadedData,
        loadErrorMessage,
        loadConfiguration: readConfiguration,
        reloadConfiguration: confirmReload,
    } = useConfigLoad(hasUnsavedChanges)
    const { isSubmitting, lastSavedAt, submitError, runSubmit } = useOperateSubmit(
        options.successText
    )

    /** 已卸载、只读、未读取成功或正在读写时，禁止修改列表或提交默认草稿。 */
    const canOperate = () =>
        !disposed &&
        active &&
        options.canEdit.value &&
        hasLoadedData.value &&
        !isLoadingData.value &&
        !isSubmitting.value &&
        !loadErrorMessage.value

    /** 读取成功后建立完整草稿基线；加载或保存中不并行发起第二次读取。 */
    const loadConfiguration = async (readAndApply: () => Promise<void>): Promise<boolean> => {
        if (disposed || !active || isSubmitting.value) return false
        return readConfiguration(async () => {
            await readAndApply()
            if (disposed) return
            baseline.value = options.snapshot()
            submitError.value = ''
        })
    }

    /** 确认后再读取，确认等待期间开始保存或已卸载时同样取消重载。 */
    const reloadConfiguration = async (reload: () => Promise<boolean>): Promise<boolean> => {
        if (disposed || !active || isSubmitting.value || confirmingReload) return false
        confirmingReload = true
        try {
            return await confirmReload(async () =>
                disposed || !active || isSubmitting.value ? false : reload()
            )
        } finally {
            confirmingReload = false
        }
    }

    /** 保存页面已组装的独立快照；失败留稿，后续编辑不并入已提交的保存基线。 */
    const submitConfiguration = async (
        persist: () => Promise<unknown>,
        snapshot?: string
    ): Promise<boolean> => {
        if (!canOperate() || !hasUnsavedChanges.value) return false
        const submittedSnapshot = snapshot ?? options.snapshot()
        return runSubmit(async () => {
            await persist()
            if (!disposed) baseline.value = submittedSnapshot
        })
    }

    /** 刷新和关闭前保护草稿及正在提交的状态，不阻止正常的只读浏览。 */
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (hasUnsavedChanges.value || isSubmitting.value) {
            event.preventDefault()
            event.returnValue = ''
        }
    }

    /** 提交中禁止切走；只有真实草稿变化时才确认离开，取消不丢失编辑。 */
    const confirmLeave = async (): Promise<boolean> => {
        if (isSubmitting.value) return false
        if (!hasUnsavedChanges.value) return true
        try {
            await feedback.confirm('当前页面存在未保存更改，确定离开吗？')
            return true
        } catch {
            return false
        }
    }

    /** 激活缓存页时只绑定一次刷新守卫，保留草稿但不重复注册事件。 */
    const attachUnloadGuard = () => {
        if (disposed) return
        active = true
        if (!unloadAttached) {
            window.addEventListener('beforeunload', handleBeforeUnload)
            unloadAttached = true
        }
    }
    /** 离开缓存页时停止影响当前页面，回到该页时仍可继续原草稿。 */
    const detachUnloadGuard = () => {
        active = false
        if (unloadAttached) {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            unloadAttached = false
        }
    }

    onBeforeRouteLeave(confirmLeave)
    onMounted(attachUnloadGuard)
    onActivated(attachUnloadGuard)
    onDeactivated(detachUnloadGuard)
    onBeforeUnmount(() => {
        disposed = true
        detachUnloadGuard()
    })

    return {
        isLoadingData,
        hasLoadedData,
        loadErrorMessage,
        isSubmitting,
        lastSavedAt,
        submitError,
        hasUnsavedChanges,
        canOperate,
        loadConfiguration,
        reloadConfiguration,
        submitConfiguration,
    }
}
