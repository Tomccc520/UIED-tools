/**
 * @file toolRuntimeLoaders.ts
 * @description 工具页重型依赖按需加载器，统一管理运行时懒加载与 Promise 缓存
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
 */

type HtmlPrettierRuntime = {
  prettier: typeof import('prettier/standalone')
  parserHtml: unknown
}

type CssPrettierRuntime = {
  prettier: typeof import('prettier/standalone')
  parserCss: unknown
}

type JsPrettierRuntime = {
  prettier: typeof import('prettier/standalone')
  parserBabel: unknown
  parserEstree: unknown
}

type HighlightRuntime = {
  hljs: typeof import('highlight.js')['default']
}

let htmlPrettierPromise: Promise<HtmlPrettierRuntime> | null = null
let cssPrettierPromise: Promise<CssPrettierRuntime> | null = null
let jsPrettierPromise: Promise<JsPrettierRuntime> | null = null
let cssMinifierPromise: Promise<{ minify: typeof import('csso').minify }> | null = null
let jsMinifierPromise: Promise<{ minify: typeof import('terser').minify }> | null = null
let diffRuntimePromise: Promise<{ diffLines: typeof import('diff').diffLines }> | null = null
let html2canvasPromise: Promise<{ html2canvas: typeof import('html2canvas').default }> | null = null
let jsPdfPromise: Promise<{ jsPDF: typeof import('jspdf').jsPDF }> | null = null
let markedPromise: Promise<{ marked: typeof import('marked').marked }> | null = null
let xlsxPromise: Promise<{ XLSX: typeof import('xlsx') }> | null = null
let highlightCorePromise: Promise<HighlightRuntime> | null = null
const highlightStylePromiseMap = new Map<string, Promise<void>>()

const highlightStyleLoaders = {
  github: () => import('highlight.js/styles/github.css'),
  'atom-one-light': () => import('highlight.js/styles/atom-one-light.css')
} as const

/**
 * 按需加载 HTML 格式化运行时
 * 首次调用时加载 Prettier 核心与 HTML 解析插件，后续复用同一 Promise
 */
export const ensureHtmlPrettierRuntime = async (): Promise<HtmlPrettierRuntime> => {
  if (!htmlPrettierPromise) {
    htmlPrettierPromise = (async () => {
      const [prettier, parserHtml] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/html')
      ])

      return { prettier, parserHtml }
    })()
  }

  return htmlPrettierPromise
}

/**
 * 按需加载 CSS 格式化运行时
 * 首次调用时加载 Prettier 核心与 PostCSS 解析插件，后续复用同一 Promise
 */
export const ensureCssPrettierRuntime = async (): Promise<CssPrettierRuntime> => {
  if (!cssPrettierPromise) {
    cssPrettierPromise = (async () => {
      const [prettier, parserCss] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/postcss')
      ])

      return { prettier, parserCss }
    })()
  }

  return cssPrettierPromise
}

/**
 * 按需加载 JS 格式化运行时
 * 首次调用时加载 Prettier 核心及 Babel/Estree 插件，后续复用同一 Promise
 */
export const ensureJsPrettierRuntime = async (): Promise<JsPrettierRuntime> => {
  if (!jsPrettierPromise) {
    jsPrettierPromise = (async () => {
      const [prettier, babelPlugin, estreePlugin] = await Promise.all([
        import('prettier/standalone'),
        import('prettier/plugins/babel'),
        import('prettier/plugins/estree')
      ])

      return {
        prettier,
        parserBabel: babelPlugin.default ?? babelPlugin,
        parserEstree: estreePlugin.default ?? estreePlugin
      }
    })()
  }

  return jsPrettierPromise
}

/**
 * 按需加载 CSS 压缩运行时
 * 仅在用户触发压缩操作时加载 csso，避免普通浏览路径引入压缩器
 */
export const ensureCssMinifierRuntime = async (): Promise<{ minify: typeof import('csso').minify }> => {
  if (!cssMinifierPromise) {
    cssMinifierPromise = (async () => {
      const { minify } = await import('csso')
      return { minify }
    })()
  }

  return cssMinifierPromise
}

/**
 * 按需加载 JS 压缩运行时
 * 仅在触发混淆压缩时加载 terser，降低工具页初始脚本体积
 */
export const ensureJsMinifierRuntime = async (): Promise<{ minify: typeof import('terser').minify }> => {
  if (!jsMinifierPromise) {
    jsMinifierPromise = (async () => {
      const { minify } = await import('terser')
      return { minify }
    })()
  }

  return jsMinifierPromise
}

/**
 * 按需加载文本差异对比运行时
 * 首次触发比对时加载 diff 库，避免非比对页面提前解析该依赖
 */
export const ensureDiffRuntime = async (): Promise<{ diffLines: typeof import('diff').diffLines }> => {
  if (!diffRuntimePromise) {
    diffRuntimePromise = (async () => {
      const { diffLines } = await import('diff')
      return { diffLines }
    })()
  }

  return diffRuntimePromise
}

/**
 * 按需加载 HTML 渲染画布运行时
 * 仅在需要将 DOM 转为图片时加载 html2canvas，避免普通编辑流程引入该依赖
 */
export const ensureHtml2canvasRuntime = async (): Promise<{ html2canvas: typeof import('html2canvas').default }> => {
  if (!html2canvasPromise) {
    html2canvasPromise = (async () => {
      const module = await import('html2canvas')
      return { html2canvas: module.default }
    })()
  }

  return html2canvasPromise
}

/**
 * 按需加载 PDF 生成运行时
 * 仅在导出 PDF 时加载 jsPDF，降低工具页初始包体积
 */
export const ensureJsPdfRuntime = async (): Promise<{ jsPDF: typeof import('jspdf').jsPDF }> => {
  if (!jsPdfPromise) {
    jsPdfPromise = (async () => {
      const { jsPDF } = await import('jspdf')
      return { jsPDF }
    })()
  }

  return jsPdfPromise
}

/**
 * 按需加载 Markdown 解析运行时
 * 首次渲染 Markdown 预览时加载 marked，后续复用同一 Promise
 */
export const ensureMarkedRuntime = async (): Promise<{ marked: typeof import('marked').marked }> => {
  if (!markedPromise) {
    markedPromise = (async () => {
      const { marked } = await import('marked')
      return { marked }
    })()
  }

  return markedPromise
}

/**
 * 按需加载表格转换运行时
 * 仅在 Excel/CSV/JSON 转换时加载 xlsx，减少工具页初始依赖解析开销
 */
export const ensureXlsxRuntime = async (): Promise<{ XLSX: typeof import('xlsx') }> => {
  if (!xlsxPromise) {
    xlsxPromise = (async () => {
      const XLSX = await import('xlsx')
      return { XLSX }
    })()
  }

  return xlsxPromise
}

/**
 * 按需加载代码高亮运行时
 * 统一复用 highlight.js 核心与样式加载 Promise，避免多个工具页重复请求同一资源
 * @param styleTheme 高亮样式主题名称，默认 github
 */
export const ensureHighlightRuntime = async (
  styleTheme: keyof typeof highlightStyleLoaders = 'github'
): Promise<HighlightRuntime> => {
  if (!highlightCorePromise) {
    highlightCorePromise = (async () => {
      const module = await import('highlight.js')
      return { hljs: module.default }
    })()
  }

  const normalizedTheme = styleTheme in highlightStyleLoaders ? styleTheme : 'github'
  if (!highlightStylePromiseMap.has(normalizedTheme)) {
    const loadStylePromise = highlightStyleLoaders[normalizedTheme]().then(() => undefined)
    highlightStylePromiseMap.set(normalizedTheme, loadStylePromise)
  }

  await highlightStylePromiseMap.get(normalizedTheme)
  return highlightCorePromise
}
