/**
 * @description 用本地 A4 文件回归水印预览、平铺、真实下载及独立 Poppler 渲染。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { chromium } from 'playwright'
import { PDFDocument, StandardFonts, degrees } from 'pdf-lib'

const runFile = promisify(execFile)
const baseUrl = (process.env.UIED_PDF_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const outputDir = path.resolve(process.env.UIED_PDF_WATERMARK_OUTPUT_DIR || 'output/playwright/pdf-watermark')

/** 生成两页 A4 样本，第二页带旋转及裁剪框以核对预览与阅读器坐标。 */
const createFixture = async () => {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  for (let index = 1; index <= 2; index++) {
    const page = pdf.addPage([595.28, 841.89])
    page.drawText(`UIED A4 source page ${index}`, { x: 50, y: 760, size: 14, font })
    if (index === 2) {
      page.setCropBox(20, 30, 555.28, 781.89)
      page.setRotation(degrees(90))
    }
  }
  return Buffer.from(await pdf.save())
}

/** 捕获当前页面和水印两个画布叠加后的预览，尺寸使用真实画布像素。 */
const capturePreview = async (page) => page.evaluate(() => {
  const source = document.querySelector('canvas[aria-label="PDF 页面预览"]')
  const overlay = document.querySelector('canvas[aria-label="水印预览"]')
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const context = canvas.getContext('2d')
  context.drawImage(source, 0, 0)
  context.drawImage(overlay, 0, 0)
  return canvas.toDataURL('image/png')
})

/** 将水印预览与 Poppler 独立渲染结果归一化，比较红色像素、位置和重复行列。 */
const compareRendering = async (page, preview, rendered) => page.evaluate(async ({ preview, rendered }) => {
  /** 读取图片，在同一尺寸画布上提取红色水印区域。 */
  const readMask = async (url) => {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = Math.round(600 * image.height / image.width)
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
    const mask = new Uint8Array(canvas.width * canvas.height)
    const rows = new Array(canvas.height).fill(false)
    const columns = new Array(canvas.width).fill(false)
    let count = 0
    let left = canvas.width, top = canvas.height, right = 0, bottom = 0
    for (let index = 0; index < mask.length; index++) {
      const offset = index * 4
      if (pixels[offset] > pixels[offset + 1] + 30 && pixels[offset] > pixels[offset + 2] + 30) {
        mask[index] = 1
        count++
        const x = index % canvas.width, y = Math.floor(index / canvas.width)
        rows[y] = true
        columns[x] = true
        left = Math.min(left, x); right = Math.max(right, x)
        top = Math.min(top, y); bottom = Math.max(bottom, y)
      }
    }
    /** 合并字形间的小间隙，统计彼此分离的水印行或列。 */
    const countBands = (values) => {
      let count = 0, last = -100
      values.forEach((value, index) => {
        if (value) {
          if (index - last > 20) count++
          last = index
        }
      })
      return count
    }
    return { mask, count, width: canvas.width, height: canvas.height, bounds: [left, top, right, bottom], rows: countBands(rows), columns: countBands(columns) }
  }
  const expected = await readMask(preview)
  const actual = await readMask(rendered)
  // Poppler 对纸张边缘取整可能相差一像素，只比较两者共有的行。
  const length = Math.min(expected.mask.length, actual.mask.length)
  let intersection = 0, union = 0
  for (let index = 0; index < length; index++) {
    if (expected.mask[index] || actual.mask[index]) union++
    if (expected.mask[index] && actual.mask[index]) intersection++
  }
  return {
    preview: { count: expected.count, bounds: expected.bounds, rows: expected.rows, columns: expected.columns },
    exported: { count: actual.count, bounds: actual.bounds, rows: actual.rows, columns: actual.columns },
    areaRatio: actual.count / expected.count,
    overlap: intersection / union,
  }
}, { preview, rendered })

/** 下载真实 PDF，用独立 Poppler 渲染指定页并与当前预览比较。 */
const checkDownload = async (page, name, pageNumber = 1) => {
  const preview = await capturePreview(page)
  await fs.writeFile(path.join(outputDir, `${name}-preview.png`), Buffer.from(preview.split(',')[1], 'base64'))
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '添加水印并下载', exact: true }).click(),
  ])
  assert.equal(await download.failure(), null)
  const pdfPath = path.join(outputDir, `${name}.pdf`)
  await download.saveAs(pdfPath)
  const pdf = await PDFDocument.load(await fs.readFile(pdfPath))
  assert.equal(pdf.getPageCount(), 2)
  assert.equal(pdf.getPage(0).getWidth(), 595.28)
  assert.equal(pdf.getPage(0).getHeight(), 841.89)
  assert.equal(pdf.getPage(1).getRotation().angle, 90)
  const prefix = path.join(outputDir, `${name}-reader`)
  await runFile(process.env.UIED_PDFTOPPM_BIN || 'pdftoppm', ['-f', String(pageNumber), '-l', String(pageNumber), '-r', '72', '-cropbox', '-singlefile', '-png', pdfPath, prefix])
  const rendered = `data:image/png;base64,${(await fs.readFile(`${prefix}.png`)).toString('base64')}`
  const result = await compareRendering(page, preview, rendered)
  assert.ok(result.areaRatio > 0.85 && result.areaRatio < 1.15, `${name} 导出字号变化：${JSON.stringify(result)}`)
  assert.ok(result.overlap > 0.75, `${name} 预览与阅读器位置不符：${JSON.stringify(result)}`)
  console.log(`${name}: ${JSON.stringify(result)}`)
  return result
}

/** 在实际 Chrome 完成 A4 居中、平铺、旋转裁剪页和桌面/窄屏回归。 */
const main = async () => {
  await fs.mkdir(outputDir, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    const fixture = await createFixture()
    await page.goto(`${baseUrl}/tools/pdf-watermark`, { waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles({ name: 'a4-watermark.pdf', mimeType: 'application/pdf', buffer: fixture })
    await page.waitForFunction(() => document.querySelector('canvas[aria-label="PDF 页面预览"]')?.height > 0)
    await page.locator('.animate-spin').waitFor({ state: 'hidden' })
    assert.ok(await page.getByText('字体大小 (50px)', { exact: true }).count())
    const center = await checkDownload(page, 'center-50')
    assert.equal(center.exported.rows, 1)
    assert.equal(center.exported.columns, 1)
    await page.getByRole('radio', { name: '平铺', exact: true }).focus()
    await page.getByRole('radio', { name: '平铺', exact: true }).press('Space')
    assert.equal(await page.getByRole('radio', { name: '平铺', exact: true }).isChecked(), true)
    const tile = await checkDownload(page, 'tile-50')
    assert.ok(tile.exported.rows > 1 && tile.exported.columns > 1, '平铺应包含多行多列')
    assert.ok(tile.exported.count > center.exported.count * 3, '平铺应输出多处水印')
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1100 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px 页面存在横向溢出`)
      const sizes = await page.locator('canvas').evaluateAll((canvases) => canvases.slice(0, 2).map((canvas) => {
        const { width, height } = canvas.getBoundingClientRect()
        return { width, height }
      }))
      assert.ok(Math.abs(sizes[0].width - sizes[1].width) < 0.1 && Math.abs(sizes[0].height - sizes[1].height) < 0.1,
        `${width}px 水印预览与页面尺寸不一致：${JSON.stringify(sizes)}`)
      await page.screenshot({ path: path.join(outputDir, `tile-${width}.png`), fullPage: true })
    }
    await page.getByRole('button', { name: '下一页', exact: true }).click()
    await page.getByText('第 2 / 2 页', { exact: true }).waitFor()
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas[aria-label="PDF 页面预览"]')
      return canvas.width > canvas.height
    })
    await checkDownload(page, 'rotated-cropped-tile-50', 2)
    assert.deepEqual(errors, [])
    console.log(`PDF 水印浏览器回归通过：真实 Chrome、A4 字号 50 居中/多行多列平铺、预览与 Poppler 导出匹配、旋转裁剪页、320/1440px 无溢出。产物：${outputDir}`)
  } finally {
    await browser.close()
  }
}

await main()
