/**
 * @file v-md-editor.ts
 * @description Markdown 编辑器全局异步注册，避免主包同步引入重型编辑器依赖
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
 */

import { defineAsyncComponent } from 'vue'
import type { App, Component } from 'vue'

type MdEditorReady = {
  editor: Component
  preview: Component
}

let mdEditorReadyPromise: Promise<MdEditorReady> | null = null

/**
 * 初始化 Markdown 编辑器模块
 * 仅在首次渲染编辑器/预览组件时加载依赖并完成主题配置，后续复用同一 Promise
 */
const ensureMdEditorReady = async (): Promise<MdEditorReady> => {
  if (!mdEditorReadyPromise) {
    mdEditorReadyPromise = (async () => {
      const [{ default: VMdEditor }, { default: vuepressTheme }, { default: Prism }] = await Promise.all([
        import('@kangc/v-md-editor'),
        import('@kangc/v-md-editor/lib/theme/vuepress.js'),
        import('prismjs'),
        import('@kangc/v-md-editor/lib/style/base-editor.css'),
        import('@kangc/v-md-editor/lib/theme/style/vuepress.css')
      ])

      VMdEditor.use(vuepressTheme, { Prism })

      return {
        editor: VMdEditor as unknown as Component,
        preview: VMdEditor.Preview as unknown as Component
      }
    })()
  }

  return mdEditorReadyPromise
}

/**
 * 注册异步 Markdown 编辑器组件
 * 保持现有 `<v-md-editor />` 与 `<v-md-preview />` 的使用方式不变
 */
export function setupMdEditor(app: App) {
  app.component('v-md-editor', defineAsyncComponent({
    loader: async () => {
      const { editor } = await ensureMdEditorReady()
      return editor
    },
    delay: 0,
    suspensible: false
  }))

  app.component('v-md-preview', defineAsyncComponent({
    loader: async () => {
      const { preview } = await ensureMdEditorReady()
      return preview
    },
    delay: 0,
    suspensible: false
  }))
}

export default setupMdEditor
