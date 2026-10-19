/**
 * @description PDF 压缩、合并及分割本地浏览器回归，使用生成的小型文件检查真实下载。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import JSZip from 'jszip'

const baseUrl = (process.env.UIED_PDF_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 生成带明确文字及页数的 PDF，所有文件仅在本地测试使用。 */
const fixture = async (name, pageCount) => {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  for (let index = 1; index <= pageCount; index++) {
    pdf.addPage([400, 300]).drawText(`UIED PDF ${name} page ${index}`, { x: 25, y: 240, size: 15, font })
  }
  return { name: `${name}.pdf`, mimeType: 'application/pdf', buffer: Buffer.from(await pdf.save()) }
}

/** 等待浏览器完成下载并读取产物，下载目录由 Playwright 自动清理。 */
const downloadFile = async (page, button) => {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }), button.click()
  ])
  assert.equal(await download.failure(), null)
  return fs.readFile(await download.path())
}

/** 验证桌面和窄屏都没有页面横向溢出。 */
const checkWidths = async (page, tool) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${tool} 在 ${width}px 横向溢出`)
  }
}

/** 回归文件校验、追加合并、严格分割范围、失败后重试和真实 PDF 下载。 */
const main = async () => {
  const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({
    headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }))
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    const first = await fixture('qa-first', 3)
    const second = await fixture('qa-second', 1)
    await page.goto(`${baseUrl}/tools/pdf-compress`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').setInputFiles({ name: 'bad.txt', mimeType: 'text/plain', buffer: Buffer.from('bad') })
    await page.getByText('仅支持PDF文件', { exact: true }).waitFor()
    assert.equal(await page.getByRole('button', { name: '开始压缩', exact: true }).count(), 0)
    await page.locator('input[type=file]').setInputFiles({ name: 'broken.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a pdf') })
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    await page.getByText('文件 broken.pdf 压缩失败', { exact: true }).waitFor()
    assert.equal(await page.getByText('处理完成', { exact: true }).count(), 0)
    await page.getByRole('button', { name: '清空列表', exact: true }).click()
    await page.locator('input[type=file]').setInputFiles(first)
    await page.getByRole('heading', { name: first.name, exact: true }).waitFor()
    assert.equal(await page.getByRole('heading', { name: first.name, exact: true }).count(), 1)
    assert.equal(await page.getByText(`文件 ${first.name} 已在列表中`, { exact: true }).count(), 0)
    await checkWidths(page, 'PDF 压缩')
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    await page.getByTitle('下载', { exact: true }).waitFor({ timeout: 30000 })
    console.log('PDF 压缩完成，验证下载')
    const compressed = await downloadFile(page, page.getByTitle('下载', { exact: true }))
    assert.equal((await PDFDocument.load(compressed)).getPageCount(), 3)
    await page.getByTitle('重新压缩', { exact: true }).click()
    await page.getByTitle('下载', { exact: true }).waitFor({ timeout: 30000 })
    await page.getByRole('button', { name: '清空列表', exact: true }).click()
    assert.equal(await page.getByRole('heading', { name: first.name, exact: true }).count(), 0)

    await page.locator('input[type=file]').setInputFiles([first, { ...second, name: first.name }])
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    await page.waitForFunction(() => [...document.querySelectorAll('button[title="下载"]')].length === 2)
    const batch = await JSZip.loadAsync(await downloadFile(page, page.getByRole('button', { name: /打包下载全部/ })))
    assert.equal(Object.values(batch.files).filter((entry) => !entry.dir).length, 2, '同名不同大小文件不能在 ZIP 中互相覆盖')

    await page.goto(`${baseUrl}/tools/pdf-merge`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').setInputFiles(first)
    await page.getByRole('button', { name: '添加文件', exact: true }).waitFor()
    await page.locator('input[type=file]').setInputFiles(second)
    await page.getByText(second.name, { exact: true }).waitFor()
    await checkWidths(page, 'PDF 合并')
    console.log('PDF 追加文件完成，验证合并')
    const merged = await downloadFile(page, page.locator('[data-smoke=pdf-merge-start]'))
    assert.equal((await PDFDocument.load(merged)).getPageCount(), 4)
    await page.locator('input[type=file]').waitFor()

    await page.goto(`${baseUrl}/tools/pdf-split`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').setInputFiles(first)
    const range = page.getByRole('textbox', { name: 'PDF 页面范围' })
    await range.waitFor()
    await page.waitForFunction(() => !document.querySelector('input[aria-label="PDF 页面范围"]').disabled)
    await range.fill('1abc')
    await page.getByRole('alert').filter({ hasText: '页面范围格式无效' }).waitFor()
    let invalidDownloads = 0
    const countDownload = () => invalidDownloads++
    page.on('download', countDownload)
    await page.getByRole('button', { name: '开始拆分/提取', exact: true }).click()
    await page.getByText('页面范围格式无效，请使用 1-3, 5 这样的格式', { exact: true }).last().waitFor()
    assert.equal(invalidDownloads, 0)
    page.off('download', countDownload)
    await range.fill('1-2, 3')
    await page.getByRole('radio', { name: '按范围拆分为多个PDF' }).check()
    await checkWidths(page, 'PDF 分割')
    console.log('PDF 页码校验完成，验证分组输出')
    const split = await downloadFile(page, page.getByRole('button', { name: '开始拆分/提取', exact: true }))
    const zip = await JSZip.loadAsync(split)
    const files = Object.values(zip.files).filter((entry) => !entry.dir)
    assert.equal(files.length, 2)
    assert.deepEqual(await Promise.all(files.map(async (entry) => (await PDFDocument.load(await entry.async('uint8array'))).getPageCount())), [2, 1])
    await page.getByRole('button', { name: '清除文件', exact: true }).click()
    await page.locator('input[type=file]').waitFor()
    assert.deepEqual(errors, [])
    console.log('PDF 工具浏览器回归通过：非法文件拒绝、有效文件单次入队、重复压缩、追加合并 4 页、非法页码拒绝、分组 ZIP 下载 2+1 页、清除与 320/1440px 无溢出。')
  } finally { await browser.close() }
}

await main()
