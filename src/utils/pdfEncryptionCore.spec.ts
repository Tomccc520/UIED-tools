// @vitest-environment node
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it } from 'vitest'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import createQpdf from '@neslinesli93/qpdf-wasm'
import * as pdfjs from 'pdfjs-dist'
import { encryptPdfWithRuntime, resolvePdfEncryptionPasswords, type PdfEncryptionRuntime } from './pdfEncryptionCore'

// 测试用真实本地 WASM 文件，避开站点 Vite 对 Node 内置模块的浏览器垫片。
const dependenciesPath = `${globalThis.process.cwd()}/node_modules`

/** 函数说明：生成带两页文本与表单字段的回归样本，确认加密不会栅格化或丢失文档结构。 */
const createFixture = async (): Promise<Uint8Array> => {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  doc.addPage([400, 300]).drawText('PDF encryption page one', { x: 30, y: 240, font, size: 16 })
  doc.addPage([400, 300]).drawText('PDF encryption page two', { x: 30, y: 240, font, size: 16 })
  const name = doc.getForm().createTextField('testName')
  name.setText('UIED retained form')
  name.addToPage(doc.getPages()[0], { x: 30, y: 130, width: 220, height: 24 })
  return doc.save()
}

/** 函数说明：以真实 qpdf WASM 加密样本，使用与浏览器相同的核心执行逻辑。 */
const encryptFixture = async (userPassword: string, ownerPassword = ''): Promise<Uint8Array> => {
  const options = {
    locateFile: () => `${dependenciesPath}/@neslinesli93/qpdf-wasm/dist/qpdf.wasm`,
    print: () => undefined,
    printErr: () => undefined
  }
  const module = await createQpdf(options)
  return encryptPdfWithRuntime(module as typeof module & PdfEncryptionRuntime, await createFixture(), resolvePdfEncryptionPasswords({ userPassword, ownerPassword }))
}

/** 函数说明：使用独立的 PDF.js 阅读器尝试打开文档，失败时清理阅读任务。 */
const openWithReader = async (bytes: Uint8Array, password: string) => {
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    password,
    standardFontDataUrl: `${dependenciesPath}/pdfjs-dist/standard_fonts/`
  })
  try {
    return await task.promise
  } catch (error) {
    await task.destroy()
    throw error
  }
}

describe('PDF AES-256 真加密', () => {
  it('正确密码可读取两页内容和表单，错误或空密码无法打开', async () => {
    const encrypted = await encryptFixture('reader-test', 'owner-test')
    await expect(openWithReader(encrypted, 'wrong')).rejects.toMatchObject({ name: 'PasswordException' })
    await expect(openWithReader(encrypted, '')).rejects.toMatchObject({ name: 'PasswordException' })
    const doc = await openWithReader(encrypted, 'reader-test')
    try {
      expect(doc.numPages).toBe(2)
      for (const [index, text] of ['PDF encryption page one', 'PDF encryption page two'].entries()) {
        const page = await doc.getPage(index + 1)
        const content = await page.getTextContent()
        expect(content.items.map((item) => 'str' in item ? item.str : '').join(' ')).toContain(text)
      }
      const fields = await doc.getFieldObjects()
      expect(fields?.testName.some((field) => (field as { value?: string }).value === 'UIED retained form')).toBe(true)
    } finally { await doc.destroy() }
    const ownerDoc = await openWithReader(encrypted, 'owner-test')
    expect(ownerDoc.numPages).toBe(2)
    await ownerDoc.destroy()
  }, 30000)

  it('仅设置打开密码时随机权限密码仍禁止空密码打开，中文密码可用', async () => {
    const encrypted = await encryptFixture('中文打开密码')
    await expect(openWithReader(encrypted, '')).rejects.toMatchObject({ name: 'PasswordException' })
    const doc = await openWithReader(encrypted, '中文打开密码')
    expect(doc.numPages).toBe(2)
    await doc.destroy()
  }, 30000)

  it('仅设置权限密码时允许打开文档，并保留复制与编辑限制', async () => {
    const encrypted = await encryptFixture('', 'owner-only')
    const doc = await openWithReader(encrypted, '')
    const permissions = await doc.getPermissions()
    expect(permissions).not.toContain(pdfjs.PermissionFlag.COPY)
    expect(permissions).not.toContain(pdfjs.PermissionFlag.MODIFY_CONTENTS)
    await doc.destroy()
  }, 30000)

  it('明确拒绝空密码、空字符和会被引擎截断的超长密码', () => {
    expect(() => resolvePdfEncryptionPasswords({ userPassword: '', ownerPassword: '' })).toThrow('至少设置一个密码')
    expect(() => resolvePdfEncryptionPasswords({ userPassword: 'abc\0def', ownerPassword: '' })).toThrow('空字符')
    expect(() => resolvePdfEncryptionPasswords({ userPassword: '密'.repeat(43), ownerPassword: '' })).toThrow('127')
  })
})
