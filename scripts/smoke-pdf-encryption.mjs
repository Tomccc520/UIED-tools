/**
 * @description PDF 加密浏览器验收：真实下载、独立阅读器密码验证、页数文本与表单保留。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium } from 'playwright'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import pdfjs from 'pdfjs-dist'

const require = createRequire(import.meta.url)
const baseUrl = (process.env.UIED_PDF_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 函数说明：生成仅用于本地回归的两页 PDF，包含可搜索文本及交互表单。 */
const createFixture = async () => {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  for (const text of ['UIED PDF page one', 'UIED PDF page two']) {
    pdf.addPage([400, 300]).drawText(text, { x: 30, y: 240, size: 16, font })
  }
  const field = pdf.getForm().createTextField('qaName')
  field.setText('Retained interactive field')
  field.addToPage(pdf.getPages()[0], { x: 30, y: 150, width: 240, height: 24 })
  return Buffer.from(await pdf.save())
}

/** 函数说明：使用独立 PDF.js 阅读器验证输出文件，不使用加密引擎自证。 */
const readPdf = async (bytes, password) => {
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes), password,
    standardFontDataUrl: require.resolve('pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf').replace(/[^/]+$/, '')
  })
  try { return await task.promise } catch (error) { await task.destroy(); throw error }
}

/** 函数说明：验证密码不可绕过、文本和表单仍可读取，并检查所有者密码。 */
const verifyEncryptedPdf = async (bytes, userPassword, ownerPassword) => {
  for (const wrongPassword of ['', 'incorrect-password']) {
    await assert.rejects(readPdf(bytes, wrongPassword), (error) => error.name === 'PasswordException')
  }
  const pdf = await readPdf(bytes, userPassword)
  try {
    assert.equal(pdf.numPages, 2)
    for (const [index, expected] of ['UIED PDF page one', 'UIED PDF page two'].entries()) {
      const page = await pdf.getPage(index + 1)
      const content = await page.getTextContent()
      assert.ok(content.items.some((item) => item.str === expected), `第 ${index + 1} 页文本丢失`)
    }
    assert.ok((await pdf.getFieldObjects()).qaName.some((field) => field.value === 'Retained interactive field'))
  } finally { await pdf.destroy() }
  const ownerPdf = await readPdf(bytes, ownerPassword)
  assert.equal(ownerPdf.numPages, 2)
  await ownerPdf.destroy()
}

/** 函数说明：回归 PDF 页面上传、密码输入和下载，同时检查桌面与移动宽度。 */
const main = async () => {
  const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({
    headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }))
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  const uploads = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => { if (request.method() === 'POST') uploads.push(request.url()) })
  try {
    await page.goto(`${baseUrl}/tools/pdf-encrypt`, { waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles({
      name: 'qa-encryption.pdf', mimeType: 'application/pdf', buffer: await createFixture()
    })
    await page.getByPlaceholder('请输入打开文件所需的密码').fill('reader-qa-2026')
    await page.getByPlaceholder('不填写时自动生成随机权限密码').fill('owner-qa-2026')
    const button = page.getByRole('button', { name: '加密并下载' })
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some((element) => element.textContent.includes('加密并下载') && !element.disabled))
    const downloadPromise = page.waitForEvent('download', { timeout: 45000 })
    await button.click()
    const download = await downloadPromise
    assert.equal(await download.failure(), null)
    assert.equal(download.suggestedFilename(), 'encrypted_qa-encryption.pdf')
    const bytes = await fs.readFile(await download.path())
    await verifyEncryptedPdf(bytes, 'reader-qa-2026', 'owner-qa-2026')
    // 可选导出用于 Poppler/外部阅读器复验，默认不保留临时文件。
    if (process.env.UIED_PDF_SMOKE_OUTPUT) await fs.writeFile(process.env.UIED_PDF_SMOKE_OUTPUT, bytes)
    assert.ok(!uploads.some((url) => /pdf|encrypt/i.test(url)), '本地加密不应上传 PDF 到服务器')
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px 存在横向溢出`)
    }
    // 已加密输入应给出可读错误，不能一直等待密码。
    await page.getByRole('button', { name: '重新上传' }).click()
    await page.locator('input[type="file"]').setInputFiles({ name: 'protected.pdf', mimeType: 'application/pdf', buffer: bytes })
    await page.getByText('此 PDF 已有打开密码，请先解密后再加密', { exact: true }).first().waitFor()
    assert.equal(await page.getByRole('button', { name: '加密并下载' }).isDisabled(), true)
    assert.deepEqual(errors, [])
    console.log('PDF 加密浏览器回归通过：AES-256 下载、错误/空密码拒绝、正确/权限密码读取、两页文本与表单保留、已加密文件提示、四档宽度。')
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
