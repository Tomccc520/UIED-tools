/**
 * @file markdownResult.spec.ts
 * @description Markdown 结果下载能力单元测试
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-24
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadMarkdownResult, resolveMarkdownResultFilename } from './markdownResult'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('Markdown 结果下载', () => {
  it('优先使用页面标题并清理文件名非法字符', () => {
    document.body.innerHTML = '<h1>工作/总结：生成</h1>'
    expect(resolveMarkdownResultFilename()).toMatch(/^工作-总结：生成-\d{4}-\d{2}-\d{2}\.md$/)
  })

  it('空内容不触发下载', () => {
    expect(downloadMarkdownResult('   ')).toBe(false)
  })

  it('非空内容生成 Markdown 文件并触发下载', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:markdown-result')
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    expect(downloadMarkdownResult('# 测试内容', '工作总结')).toBe(true)
    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })
})
