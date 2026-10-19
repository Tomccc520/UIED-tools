/**
 * @description 图片压缩浏览器回归：真实本地编码、透明度、同名 ZIP、增量批次和损坏图片恢复。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import JSZip from 'jszip'

const baseUrl = (process.env.UIED_IMAGE_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 从浏览器 Canvas 生成透明 PNG 和 JPEG 样本，全程不读取或上传用户文件。 */
const createFixtures = async (page) => page.evaluate(() => {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')
  const pngs = ['#e83b3b', '#259d5a'].map((color) => {
    context.clearRect(0, 0, 256, 256)
    context.fillStyle = color
    context.fillRect(40, 40, 176, 176)
    return canvas.toDataURL('image/png').split(',')[1]
  })
  context.fillStyle = '#d9e5f4'
  context.fillRect(0, 0, 256, 256)
  return { pngs, jpeg: canvas.toDataURL('image/jpeg', 1).split(',')[1] }
})

/** 等待指定数量的真实压缩结果，确保异步事件已完成。 */
const waitForResults = async (page, count) => page.waitForFunction((expected) => (
  document.querySelectorAll('[data-smoke="image-compress-file"] a[download]').length === expected
  && !document.querySelector('[data-smoke="image-compress-start"]').disabled
), count)

/** 校验下载 ZIP 内的 PNG 可以解码，且透明区域和实色区域均保留。 */
const verifyPng = async (page, bytes, expectedRgb) => {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  const pixels = await page.evaluate(async (base64) => {
    const image = new Image()
    image.src = `data:image/png;base64,${base64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    return { width: image.width, height: image.height, alpha: context.getImageData(0, 0, 1, 1).data[3], center: [...context.getImageData(128, 128, 1, 1).data] }
  }, bytes.toString('base64'))
  assert.deepEqual(pixels, { width: 256, height: 256, alpha: 0, center: [...expectedRgb, 255] })
}

/** 执行上传、压缩、下载及错误恢复，并验证桌面与窄屏没有横向溢出。 */
const main = async () => {
  const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }))
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const pageErrors = []
  const uploadRequests = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('request', (request) => { if (request.method() === 'POST' && /image|compress/i.test(request.url())) uploadRequests.push(request.url()) })
  try {
    await page.goto(`${baseUrl}/tools/image-compress`, { waitUntil: 'networkidle' })
    const fixtures = await createFixtures(page)
    const png = (index) => ({ name: 'same.png', mimeType: 'image/png', buffer: Buffer.from(fixtures.pngs[index], 'base64') })
    const input = page.locator('input[type="file"]')
    await input.setInputFiles([png(0), png(1)])
    await page.locator('[data-smoke="image-compress-start"]').click()
    await waitForResults(page, 2)
    assert.deepEqual(await page.locator('[data-smoke="image-compress-file"] a[download]').evaluateAll((links) => links.map((link) => link.download)), ['uied_same.png', 'uied_same (2).png'])
    assert.ok((await page.locator('body').innerText()).includes('已完成: 2'))

    // 已有结果后补充无 MIME 的 JPEG，直接打包应压缩新增图片并包含三个文件。
    await input.setInputFiles({ name: 'later.JPG', mimeType: '', buffer: Buffer.from(fixtures.jpeg, 'base64') })
    const downloaded = page.waitForEvent('download')
    await page.locator('[data-smoke="image-compress-download"]').first().click()
    const download = await downloaded
    assert.equal(await download.failure(), null)
    const zip = await JSZip.loadAsync(await fs.readFile(await download.path()))
    assert.deepEqual(Object.keys(zip.files), ['uied_same.png', 'uied_same (2).png', 'uied_later.JPG'])
    await verifyPng(page, await zip.file('uied_same.png').async('nodebuffer'), [232, 59, 59])
    await verifyPng(page, await zip.file('uied_same (2).png').async('nodebuffer'), [37, 157, 90])
    assert.equal((await zip.file('uied_later.JPG').async('nodebuffer')).subarray(0, 3).toString('hex'), 'ffd8ff')

    // 损坏文件留有可理解错误，并可移除；其余图片继续正常压缩。
    await input.setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') })
    await page.locator('[data-smoke="image-compress-start"]').click()
    await page.getByRole('alert').filter({ hasText: '图片可能已损坏' }).waitFor()
    await page.getByRole('button', { name: '移除 broken.png', exact: true }).click()
    assert.equal(await page.locator('[data-smoke="image-compress-file"]').count(), 3)
    assert.equal(await page.getByRole('alert').filter({ hasText: '图片可能已损坏' }).count(), 0)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${width}px 存在横向溢出`)
    }

    // 同一张文件移除后重新选择，文件输入不会因值未清空而失去响应。
    await page.getByRole('button', { name: '清空文件列表', exact: true }).first().click()
    await input.setInputFiles(png(0))
    await page.getByRole('button', { name: '移除 same.png', exact: true }).click()
    await input.setInputFiles(png(0))
    assert.equal(await page.locator('[data-smoke="image-compress-file"]').count(), 1)
    await page.locator('[data-smoke="image-compress-start"]').click()
    await waitForResults(page, 1)
    // 独立设计压缩器也必须在损坏文件后撤下旧下载，并可重新选择恢复。
    await page.goto(`${baseUrl}/tools/design/image-compressor`, { waitUntil: 'networkidle' })
    const designInput = page.locator('input[type="file"]')
    await designInput.setInputFiles(png(0))
    await page.getByRole('button', { name: '下载图片', exact: true }).waitFor()
    await page.getByRole('button', { name: 'PNG', exact: true }).click()
    await page.getByRole('button', { name: '下载图片', exact: true }).waitFor()
    const designDownloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: '下载图片', exact: true }).click()
    const designDownload = await designDownloaded
    assert.match(designDownload.suggestedFilename(), /\.png$/)
    await verifyPng(page, await fs.readFile(await designDownload.path()), [232, 59, 59])
    await designInput.setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not a PNG') })
    await page.getByRole('alert').filter({ hasText: '图片无法读取' }).waitFor()
    assert.equal(await page.getByRole('button', { name: '下载图片', exact: true }).count(), 0)
    await designInput.setInputFiles(png(1))
    await page.getByRole('button', { name: '下载图片', exact: true }).waitFor()
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `设计压缩器 ${width}px 存在横向溢出`)
    }
    assert.deepEqual(pageErrors, [])
    assert.deepEqual(uploadRequests, [])
    console.log('图片压缩浏览器回归通过：同名结果无覆盖、增量批次完整打包、PNG 透明与像素保留、JPEG 真实编码、两个压缩器的损坏文件恢复、重复选择、320/1440px 无溢出、无文件上传。')
  } finally { await browser.close() }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
