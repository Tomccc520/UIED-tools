/**
 * @description 图片格式转换真实 Chrome 回归：编码、下载、ZIP 解包、重名保留与编码回退拒绝。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'

const baseUrl = (process.env.UIED_IMAGE_FORMAT_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')
const expectedNames = ['design.v1.jpg', 'design.v2.jpg', 'design.v1 (2).jpg', 'design.v1 (3).jpg', 'DESIGN.V1 (4).jpg', 'design.v1 (2) (2).jpg']
const colors = [[230, 30, 40], [30, 190, 80], [40, 80, 230], [220, 170, 30], [160, 40, 190], [30, 180, 190]]

/** 根据真实格式生成不同纯色图片；参数为浏览器页面，返回可直接上传的独立测试文件。 */
const createFixtures = async (page) => {
  const names = ['design.v1.png', 'design.v2.png', 'design.v1.webp', 'design.v1.png', 'DESIGN.V1.JPG', 'design.v1 (2).png']
  const encoded = await page.evaluate(({ sourceNames, rgbColors }) => sourceNames.map((name, index) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')
    context.fillStyle = `rgb(${rgbColors[index].join(',')})`
    context.fillRect(0, 0, 64, 64)
    const mimeType = /webp$/i.test(name) ? 'image/webp' : /jpg$/i.test(name) ? 'image/jpeg' : 'image/png'
    return { name, mimeType, data: canvas.toDataURL(mimeType, 1).split(',')[1] }
  }), { sourceNames: names, rgbColors: colors })
  return encoded.map(({ data, ...file }) => ({ ...file, buffer: Buffer.from(data, 'base64') }))
}

/** 选择页面上实际可用的编码格式；同时确认没有承诺浏览器不能编码的 BMP/TIFF。 */
const selectFormat = async (page, format) => {
  const select = page.locator('[data-smoke="image-format-output"]')
  const controls = await select.getByRole('combobox').getAttribute('aria-controls')
  await select.click()
  const list = page.locator(`[id="${controls}"]`)
  assert.deepEqual(await list.getByRole('option').allTextContents(), ['JPG', 'PNG', 'WEBP'])
  await list.getByRole('option', { name: format, exact: true }).click()
  await list.waitFor({ state: 'hidden' })
}

/** 通过真实操作等待转换完成，并用表格的成功状态核对结果数量。 */
const convertFiles = async (page, count) => {
  await page.locator('[data-smoke="image-format-start"]').click()
  await page.waitForFunction((expected) => (
    document.querySelectorAll('[data-smoke="image-format-files"] .el-tag--success').length === expected
    && !document.querySelector('[data-smoke="image-format-start"]').disabled
  ), count)
}

/** 校验独立下载字节的真实文件头，参数为下载内容及期望编码格式。 */
const verifySignature = (bytes, format) => {
  if (format === 'JPG') assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff')
  else if (format === 'PNG') assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  else {
    assert.equal(bytes.subarray(0, 4).toString(), 'RIFF')
    assert.equal(bytes.subarray(8, 12).toString(), 'WEBP')
  }
}

/** 用浏览器解码系统 unzip 提取的图片，核对每份重名结果对应的颜色，确保原始内容都被保留。 */
const verifyImageColor = async (page, bytes, expectedRgb) => {
  const actual = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/jpeg;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return [...context.getImageData(32, 32, 1, 1).data].slice(0, 3)
  }, bytes.toString('base64'))
  assert.ok(actual.every((value, index) => Math.abs(value - expectedRgb[index]) <= 6), `${actual} 应接近 ${expectedRgb}`)
}

/** 运行真实 Chrome 上传、单张下载、系统解包和回退拒绝回归，并释放所有临时文件。 */
const main = async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'uied-img-format-'))
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  try {
    await page.goto(`${baseUrl}/tools/img-format`, { waitUntil: 'networkidle' })
    const fixtures = await createFixtures(page)
    await page.locator('input[type="file"]').setInputFiles(fixtures)
    for (const [index, format] of ['JPG', 'PNG', 'WEBP'].entries()) {
      if (index) await selectFormat(page, format)
      else {
        await selectFormat(page, 'JPG')
      }
      await convertFiles(page, fixtures.length)
      const actualMimes = await page.locator('[data-smoke="image-format-files"] .el-image img').evaluateAll(async (images) => (
        Promise.all(images.map(async (image) => (await (await fetch(image.src)).blob()).type))
      ))
      assert.deepEqual(actualMimes, Array(fixtures.length).fill(format === 'JPG' ? 'image/jpeg' : `image/${format.toLowerCase()}`))
      const singleDownload = page.waitForEvent('download')
      await page.locator('[data-smoke="image-format-files"]').getByRole('button', { name: '下载', exact: true }).first().click()
      const single = await singleDownload
      assert.equal(await single.failure(), null)
      assert.equal(single.suggestedFilename(), `design.v1.${format.toLowerCase()}`)
      verifySignature(await fs.readFile(await single.path()), format)
      if (format === 'JPG') {
        const zipDownload = page.waitForEvent('download')
        await page.locator('[data-smoke="image-format-download-all"]').click()
        const download = await zipDownload
        assert.equal(await download.failure(), null)
        const zipPath = path.join(tempDir, 'converted.zip')
        await download.saveAs(zipPath)
        const entries = execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).trim().split('\n').filter((name) => !name.endsWith('/'))
        assert.deepEqual(entries, expectedNames.map((name) => `converted_images/${name}`))
        const extractedDir = path.join(tempDir, 'extracted')
        execFileSync('unzip', ['-q', zipPath, '-d', extractedDir])
        for (const [fileIndex, entry] of entries.entries()) {
          const bytes = await fs.readFile(path.join(extractedDir, entry))
          verifySignature(bytes, 'JPG')
          await verifyImageColor(page, bytes, colors[fileIndex])
        }
      }
    }

    // 模拟浏览器不支持 WebP 编码时的标准 PNG 回退，页面必须明确失败且撤下下载。
    await page.getByRole('button', { name: '清除全部', exact: true }).click()
    await page.locator('input[type="file"]').setInputFiles(fixtures[0])
    await page.evaluate(() => {
      window.__imageFormatOriginalToBlob = HTMLCanvasElement.prototype.toBlob
      HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
        return window.__imageFormatOriginalToBlob.call(this, callback, type === 'image/webp' ? 'image/png' : type, quality)
      }
    })
    await page.locator('[data-smoke="image-format-start"]').click()
    await page.getByRole('alert').filter({ hasText: '当前浏览器不支持导出 WEBP' }).waitFor()
    assert.equal(await page.locator('[data-smoke="image-format-files"] .el-tag--success').count(), 0)
    assert.equal(await page.locator('[data-smoke="image-format-files"] .el-tag--danger').count(), 1)
    assert.equal(await page.locator('[data-smoke="image-format-download-all"]').isDisabled(), true)
    await page.evaluate(() => { HTMLCanvasElement.prototype.toBlob = window.__imageFormatOriginalToBlob })
    await convertFiles(page, 1)
    await page.waitForFunction(() => !document.querySelector('.el-message'))

    await fs.mkdir('output/playwright', { recursive: true })
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth, undefined, { timeout: 3000 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px 存在横向溢出`)
      const clippedControls = await page.locator('[data-smoke="image-format-settings"] button, [data-smoke="image-format-settings"] input, [data-smoke="image-format-settings"] .el-checkbox').evaluateAll((controls) => (
        controls.filter((control) => {
          const rect = control.getBoundingClientRect()
          return rect.width > 2 && (rect.left < 0 || rect.right > innerWidth)
        }).map((control) => control.textContent || control.getAttribute('placeholder') || control.tagName)
      ))
      assert.deepEqual(clippedControls, [], `${width}px 控件被裁切`)
      const narrowDownload = page.waitForEvent('download')
      await page.locator('[data-smoke="image-format-download-all"]').click()
      verifySignature(await fs.readFile(await (await narrowDownload).path()), 'WEBP')
      await page.screenshot({ path: `output/playwright/image-format-${width}.png`, fullPage: true })
      await page.locator('[data-smoke="image-format-settings"]').screenshot({ path: `output/playwright/image-format-settings-${width}.png` })
    }
    assert.deepEqual(pageErrors, [])
    console.log(`图片格式浏览器回归通过：真实 Chrome ${browser.version()} 的 JPG/PNG/WebP MIME 与文件头正确，六份多句点及重名结果经系统 unzip 解包且颜色齐全，PNG 回退明确失败并可重试，320/1440px 控件无裁切且可下载。`)
  } finally {
    await browser.close()
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
