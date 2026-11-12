/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */

import { createCoreToolRunRequestId, useCoreToolManualConsume } from '@/composables/useCoreToolManualConsume'
import { useToolConsume, type ToolConsumeOptions } from '@/composables/useToolConsume'
import { requestMattingImage } from '@/services/matting'

/** 提供证件照抠图的预扣、交付和结算流程，并复用工具的下载校验。 */
export const usePhotoMatting = () => {
  const { ensureToolConsume } = useToolConsume()
  const { resolveCoreToolRun } = useCoreToolManualConsume()

  /** 在有效图片成功交付后确认消费，接口或结果处理失败时退还预扣积分。 */
  const runPhotoMatting = async (
    file: File,
    options: Pick<ToolConsumeOptions, 'toolKey' | 'loginWarningText'>,
    deliver: (image: Blob) => void | Promise<void>
  ): Promise<boolean> => {
    const requestId = createCoreToolRunRequestId()
    let ownerUid: string | undefined
    let delivered = false
    try {
      const allowed = await ensureToolConsume({
        ...options,
        action: 'matting',
        requestId,
        /** 仅记录真实预扣，免费放行时无需请求积分结算。 */
        onConsumed: (result) => {
          if (result.status === 'reserved') ownerUid = String(result.profile.uid)
        }
      })
      if (!allowed) return false
      await deliver(await requestMattingImage(file))
      delivered = true
      return true
    } finally {
      if (ownerUid !== undefined) {
        await resolveCoreToolRun(requestId, delivered ? 'success' : 'failed', delivered ? '' : '证件照抠图未完成', ownerUid)
      }
    }
  }

  return { ensureToolConsume, runPhotoMatting }
}
