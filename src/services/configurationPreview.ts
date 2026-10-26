/**
 * @description 管理后台只读预览的启动刷新状态，不改变普通访客缓存或业务参数。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
type PreviewResource = 'site-config' | 'learning-rss'
const refreshedResources = new Set<PreviewResource>()
let previewActive = false

/** 识别明确的后台预览标记；一旦进入预览，本次应用启动内的路由切换保持该刷新上下文。 */
const isConfigurationPreview = (): boolean => {
  if (!previewActive && typeof window !== 'undefined') {
    previewActive = new URLSearchParams(window.location.search).get('_uied_preview') === '1'
  }
  return previewActive
}

/** 判断本次启动中指定公开资源是否还需要一次最新读取，普通访问始终保留原缓存策略。 */
export const needsConfigurationPreviewRefresh = (resource: PreviewResource): boolean =>
  isConfigurationPreview() && !refreshedResources.has(resource)

/** 仅在公开资源成功返回后完成一次预览刷新；请求失败不调用，后续操作仍可重试。 */
export const completeConfigurationPreviewRefresh = (resource: PreviewResource): void => {
  if (isConfigurationPreview()) refreshedResources.add(resource)
}
