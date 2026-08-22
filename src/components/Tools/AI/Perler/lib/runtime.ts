/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-20
 */

export const APP_BASE_PATH = '/tools/ai-perler'

export const perlerStorageKeys = {
  paletteSelections: 'uied-perler:palette-selections',
  focusPixelData: 'uied-perler:focus-pixel-data',
  focusGridDimensions: 'uied-perler:focus-grid-dimensions',
  focusColorCounts: 'uied-perler:focus-color-counts',
  focusColorSystem: 'uied-perler:focus-color-system'
} as const

/**
 * 函数说明：为主站拼豆路由拼接路径，保证专心模式刷新后仍回到 Vue Router 页面。
 */
export const buildPerlerPath = (pathname = '/') => {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`
  return normalizedPath === '/' ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${normalizedPath}`
}
