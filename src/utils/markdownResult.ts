/**
 * @file markdownResult.ts
 * @description AI 文本工具 Markdown 结果下载能力
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

/**
 * 函数说明：清理页面标题中的站点后缀和文件名非法字符，生成可读的 Markdown 文件名。
 */
export const resolveMarkdownResultFilename = (suggestedTitle = ''): string => {
  const heading = typeof document === 'undefined'
    ? ''
    : String(document.querySelector('h1')?.textContent || '').trim()
  const documentTitle = typeof document === 'undefined'
    ? ''
    : String(document.title || '').split(/[-|｜_]/)[0].trim()
  const title = String(suggestedTitle || heading || documentTitle || 'AI生成结果')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60) || 'AI生成结果'
  const dateText = new Date().toISOString().slice(0, 10)
  return `${title}-${dateText}.md`
}

/**
 * 函数说明：将非空 Markdown 内容下载为本地文件，成功触发下载时返回 true。
 */
export const downloadMarkdownResult = (markdown: string, suggestedTitle = ''): boolean => {
  const content = String(markdown || '').trim()
  if (!content || typeof document === 'undefined' || typeof URL === 'undefined') {
    return false
  }

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = resolveMarkdownResultFilename(suggestedTitle)
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  return true
}
