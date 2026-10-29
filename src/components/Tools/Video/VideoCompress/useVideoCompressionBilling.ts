/**
 * @description 视频压缩单任务计费：跨引擎复用授权，终态幂等结算。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import { ref } from 'vue'
import { useToolConsume } from '@/composables/useToolConsume'
import { createCoreToolRunRequestId, useCoreToolManualConsume, type CoreToolRunOutcome } from '@/composables/useCoreToolManualConsume'
import { getFrontendUserProfile, type FrontendUserPointsConsumeResult } from '@/services/frontendUser'

interface VideoBillingTask {
  file: File
  toolKey: string
  ownerUid: string
  requestId: string
  authorization: Promise<boolean>
  receipt?: FrontendUserPointsConsumeResult
  outcome?: CoreToolRunOutcome
}

/** 同一视频的失败重试共享预扣，成功、最终失败或放弃时仅结算一次。 */
export const useVideoCompressionBilling = () => {
  const { ensureToolConsume } = useToolConsume()
  const { resolveCoreToolRun } = useCoreToolManualConsume()
  const canResumeTask = ref(false)
  let task: VideoBillingTask | null = null
  let cleanup = Promise.resolve()

  /** 关闭当前逻辑任务；等待迟到授权后结算，下一任务先等待上一任务退回积分。 */
  const finish = (outcome: CoreToolRunOutcome, reason = '') => {
    const current = task
    if (!current || current.outcome) return
    current.outcome = outcome
    task = null
    canResumeTask.value = false
    const previousCleanup = cleanup
    cleanup = Promise.all([previousCleanup, current.authorization.catch(() => false)]).then(async () => {
      // 免费放行没有账本记录，不能发送不存在记录的退款或结算请求。
      if (current.receipt?.status !== 'reserved') return
      await resolveCoreToolRun(current.requestId, outcome, reason, String(current.receipt.profile.uid))
    }).catch(() => {
      // 断网补偿由公共结算队列及后端预扣过期回收负责，不影响文件处理反馈。
      console.error('[视频压缩] 积分结算未完成，请稍后重试')
    })
  }

  /** 同文件、计费策略和账号复用授权；换文件、成功后重压或切换账号则建立新任务。 */
  const authorize = (file: File, toolKey: string): Promise<boolean> => {
    const ownerUid = String(getFrontendUserProfile()?.uid || '').trim()
    if (task && task.file === file && task.toolKey === toolKey && task.ownerUid === ownerUid) {
      canResumeTask.value = false
      return task.authorization
    }
    finish('failed', '源文件、计费策略或账号已变更')
    const previousCleanup = cleanup
    const current: VideoBillingTask = {
      file, toolKey, ownerUid, requestId: createCoreToolRunRequestId(), authorization: Promise.resolve(false)
    }
    task = current
    current.authorization = (async () => {
      await previousCleanup
      if (current.outcome) return false
      const allowed = await ensureToolConsume({
        toolKey, action: 'compress', requestId: current.requestId,
        loginWarningText: '请先登录后再使用视频压缩', showConsumeSuccessToast: true,
        /** 保存真实消费回执，区分免费放行和已经预扣的任务。 */
        onConsumed: (receipt) => { current.receipt = receipt }
      })
      return allowed && !current.outcome
        && (!current.receipt || current.receipt.status === 'reserved' || current.receipt.status === 'committed')
    })()
    return current.authorization
  }

  /** 服务端失败但仍可重试时保留授权，用户可选择本地兜底或主动结束任务。 */
  const retainForRetry = () => {
    if (task && !task.outcome) canResumeTask.value = true
  }

  return { authorize, finish, retainForRetry, canResumeTask }
}
