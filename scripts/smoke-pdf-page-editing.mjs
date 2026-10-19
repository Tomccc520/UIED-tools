/**
 * @description 用非对称 TOP 样本验证 PDF 重排、旋转、重置、删除和真实下载。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-19
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { chromium } from 'playwright'
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib'

const runFile = promisify(execFile)
const baseUrl = (process.env.UIED_PDF_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const outputDir = path.resolve('output/playwright/pdf-page-editing')

/** 创建 A/B/C 三页非对称样本，B 源页面已有 90 度旋转，红色标记位于原页面左上角。 */
const createFixture = async () => {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.HelveticaBold)
  for (const [index, label] of ['A', 'B', 'C'].entries()) {
    const page = pdf.addPage([320 + index * 20, 480])
    page.drawRectangle({ x: 20, y: 395, width: 90, height: 60, color: rgb(1, 0, 0) })
    page.drawText(`TOP ${label}`, { x: 24, y: 418, size: 20, font, color: rgb(1, 1, 1) })
    page.drawText(`PAGE ${label}`, { x: 40, y: 240, size: 26, font })
    page.drawRectangle({ x: 240, y: 20, width: 45, height: 35, color: rgb(0, 0, 1) })
    if (index === 1) page.setRotation(degrees(90))
  }
  return Buffer.from(await pdf.save())
}

/** 等待真实画布渲染完成，再获取当前像素与 CSS 状态以核对单一旋转机制。 */
const previewData = async (canvas) => {
  await canvas.page().waitForFunction((element) => {
    if (!element.width || !element.height) return false
    const data = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
    return data.some((value, index) => index % 4 === 0 && value > 180 && data[index + 1] < 80 && data[index + 2] < 80)
  }, await canvas.elementHandle())
  return canvas.evaluate((element) => ({ png: element.toDataURL('image/png'), transform: getComputedStyle(element).transform, width: element.width, height: element.height }))
}

/** 从真实图片提取红色 TOP 标记所在象限，便于独立阅读器核对方向。 */
const redQuadrant = async (page, png) => page.evaluate(async (url) => {
  const image = new Image()
  image.src = url
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = image.width; canvas.height = image.height
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0)
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data
  let count = 0, xSum = 0, ySum = 0
  for (let offset = 0; offset < data.length; offset += 4) {
    if (data[offset] > 180 && data[offset + 1] < 80 && data[offset + 2] < 80) {
      count++; xSum += (offset / 4) % canvas.width; ySum += Math.floor(offset / 4 / canvas.width)
    }
  }
  if (!count) throw new Error('预览或阅读器中缺少红色 TOP 标记')
  return `${ySum / count < canvas.height / 2 ? 'top' : 'bottom'}-${xSum / count < canvas.width / 2 ? 'left' : 'right'}`
}, png)

/** 等待门禁异步放行和 PDF.js 绘制结束，以用户能看到的新方向作为保存前条件。 */
const waitPreviewQuadrant = async (page, canvas, expected) => {
  await page.waitForFunction(({ element, expected }) => {
    const { width, height } = element
    const data = element.getContext('2d').getImageData(0, 0, width, height).data
    let count = 0, x = 0, y = 0
    for (let offset = 0; offset < data.length; offset += 4) {
      if (data[offset] > 180 && data[offset + 1] < 80 && data[offset + 2] < 80) {
        count++; x += (offset / 4) % width; y += Math.floor(offset / 4 / width)
      }
    }
    return count > 0 && `${y / count < height / 2 ? 'top' : 'bottom'}-${x / count < width / 2 ? 'left' : 'right'}` === expected
  }, { element: await canvas.elementHandle(), expected })
}

/** 下载页面实际生成的 PDF，重新读取页宽、旋转并使用 Poppler 提取源页文字。 */
const downloadPdf = async (page, buttonName, name, widths, rotations) => {
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: buttonName, exact: true }).click()])
  assert.equal(await download.failure(), null)
  const file = path.join(outputDir, `${name}.pdf`)
  await download.saveAs(file)
  const pdf = await PDFDocument.load(await fs.readFile(file))
  assert.deepEqual(pdf.getPages().map((entry) => entry.getWidth()), widths, `${name} 页序错误`)
  assert.deepEqual(pdf.getPages().map((entry) => entry.getRotation().angle), rotations, `${name} 旋转角度错误`)
  const { stdout } = await runFile(process.env.UIED_PDFTOTEXT_BIN || 'pdftotext', ['-layout', file, '-'])
  assert.deepEqual([...stdout.matchAll(/PAGE\s+([ABC])/g)].map((match) => match[1]), widths.map((width) => ({ 320: 'A', 340: 'B', 360: 'C' })[width]))
  return file
}

/** 将源 C 卡片真实拖到 A 前，核对 DOM 顺序后才进行导出。 */
const reorderCFirst = async (page) => {
  const source = page.locator('[data-source-page="3"]')
  const target = page.locator('[data-source-page="1"]')
  await source.dragTo(target, { sourcePosition: { x: 40, y: 60 }, targetPosition: { x: 15, y: 15 } })
  await page.waitForFunction(() => [...document.querySelectorAll('[data-source-page]')].map((element) => element.dataset.sourcePage).join(',') === '3,1,2')
}

/** 用 Poppler 独立渲染导出文件，检查 TOP 方向和 Chrome 预览一致。 */
const comparePreview = async (page, canvas, file, name, expected) => {
  const preview = await previewData(canvas)
  assert.equal(preview.transform, 'none', 'PDF.js 已旋转，canvas 不应再次 CSS 旋转')
  const prefix = path.join(outputDir, `${name}-reader`)
  await runFile(process.env.UIED_PDFTOPPM_BIN || 'pdftoppm', ['-f', '1', '-l', '1', '-r', '72', '-singlefile', '-png', file, prefix])
  const rendered = `data:image/png;base64,${(await fs.readFile(`${prefix}.png`)).toString('base64')}`
  assert.equal(await redQuadrant(page, preview.png), expected)
  assert.equal(await redQuadrant(page, rendered), expected)
  await fs.writeFile(path.join(outputDir, `${name}-preview.png`), Buffer.from(preview.png.split(',')[1], 'base64'))
}

/** 检查已上传文件后的完整编辑工具栏在窄屏也不会造成横向溢出。 */
const checkWidths = async (page, name) => {
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1100 })
    await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, undefined, { timeout: 4000 })
    if (width === 320 || width === 1440) await page.screenshot({ path: path.join(outputDir, `${name}-${width}.png`), fullPage: true })
  }
}

/** 实际操作旋转、拖拽、重置、删除并验证真实 PDF 文件，不模拟业务接口。 */
const main = async () => {
  await fs.mkdir(outputDir, { recursive: true })
  const fixture = await createFixture()
  await fs.writeFile(path.join(outputDir, 'source.pdf'), fixture)
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(`${baseUrl}/tools/pdf-rotate`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').setInputFiles({ name: 'top-abc.pdf', mimeType: 'application/pdf', buffer: fixture })
    const canvases = page.locator('.uied-tool-view canvas')
    await canvases.nth(2).waitFor()
    await previewData(canvases.nth(2))
    await page.getByTitle('顺时针旋转', { exact: true }).nth(2).click()
    await page.waitForFunction(() => document.querySelectorAll('.uied-tool-view canvas')[2].width > document.querySelectorAll('.uied-tool-view canvas')[2].height)
    await reorderCFirst(page)
    const rotated = await downloadPdf(page, '保存并下载', 'rotate-cab', [360, 320, 340], [90, 0, 90])
    await comparePreview(page, canvases.nth(0), rotated, 'rotate-cab', 'top-right')
    await page.getByRole('button', { name: '重置', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('.uied-tool-view canvas').height > document.querySelector('.uied-tool-view canvas').width)
    const reset = await downloadPdf(page, '保存并下载', 'reset-cab', [360, 320, 340], [0, 0, 90])
    await comparePreview(page, canvases.nth(0), reset, 'reset-cab', 'top-left')
    await checkWidths(page, 'rotate')
    console.log('PDF旋转：C/A/B实际拖拽、仅C旋转、重置重绘、源B旋转保留、Poppler方向核对通过')

    await page.goto(`${baseUrl}/tools/pdf-delete`, { waitUntil: 'networkidle' })
    await page.locator('input[type=file]').setInputFiles({ name: 'top-abc.pdf', mimeType: 'application/pdf', buffer: fixture })
    await page.locator('.uied-tool-view canvas').nth(2).waitFor()
    const a = page.locator('.uied-tool-view canvas').nth(0)
    await previewData(a)
    const aCard = a.locator('xpath=ancestor::div[contains(@class,"group")][1]')
    await aCard.hover()
    await aCard.getByRole('checkbox').click()
    for (const [angle, quadrant] of [[90, 'top-right'], [180, 'bottom-right'], [270, 'bottom-left']]) {
      await page.getByRole('button', { name: '顺时针旋转', exact: true }).click()
      await waitPreviewQuadrant(page, a, quadrant)
      const file = await downloadPdf(page, '保存PDF', `delete-rotate-${angle}`, [320, 340, 360], [angle, 90, 0])
      await comparePreview(page, a, file, `delete-rotate-${angle}`, quadrant)
    }
    await aCard.getByRole('checkbox').click()
    const bCard = page.locator('.uied-tool-view canvas').nth(1).locator('xpath=ancestor::div[contains(@class,"group")][1]')
    await bCard.hover()
    await bCard.getByRole('checkbox').click()
    await page.getByRole('button', { name: '顺时针旋转', exact: true }).click()
    await waitPreviewQuadrant(page, bCard.locator('canvas'), 'bottom-right')
    const cCard = page.locator('.uied-tool-view canvas').nth(2).locator('xpath=ancestor::div[contains(@class,"group")][1]')
    await cCard.hover()
    await cCard.getByRole('button', { name: '标记删除', exact: true }).click()
    await downloadPdf(page, '保存PDF', 'delete-c-rotate-b', [320, 340], [270, 180])
    await checkWidths(page, 'delete')
    assert.deepEqual(errors, [])
    console.log(`PDF编辑 Chrome 回归通过：真实下载+独立Poppler，四档宽度无溢出。产物：${outputDir}`)
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
