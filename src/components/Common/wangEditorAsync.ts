/**
 * @file wangEditorAsync.ts
 * @description wangEditor 异步加载公共方法，统一按需引入组件与样式
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
 */

import type { Component } from 'vue'

type WangEditorReady = {
  Editor: Component
  Toolbar: Component
}

let wangEditorReadyPromise: Promise<WangEditorReady> | null = null

/**
 * 确保 wangEditor 组件与样式仅初始化一次
 * 返回 Editor 与 Toolbar 组件，供异步封装组件复用
 */
export const ensureWangEditorReady = async (): Promise<WangEditorReady> => {
  if (!wangEditorReadyPromise) {
    wangEditorReadyPromise = (async () => {
      const [module] = await Promise.all([
        import('@wangeditor/editor-for-vue'),
        import('@wangeditor/editor/dist/css/style.css')
      ])

      return {
        Editor: module.Editor as Component,
        Toolbar: module.Toolbar as Component
      }
    })()
  }

  return wangEditorReadyPromise
}

