/**
 * @description 视频压缩本地回归：AVI 专业转码、取消配置检查、损坏文件、浏览器自动重试音轨和下载。
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

const baseUrl = (process.env.UIED_VIDEO_SMOKE_BASE_URL || 'http://127.0.0.1:5179').replace(/\/+$/, '')

/** 创建仅在本机上传的小视频，AVI 用于验证浏览器不可解码的输入仍可专业转码。 */
function createFixtures(directory) {
  for (const [extension, options] of [
    ['avi', ['-c:v', 'mjpeg', '-q:v', '2', '-c:a', 'pcm_s16le']],
    ['mp4', ['-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '10', '-c:a', 'aac', '-movflags', '+faststart']]
  ]) {
    execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=24',
      '-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=44100', '-t', '3', ...options, path.join(directory, `source.${extension}`)])
  }
}

/** 使用独立 ffprobe 检查真实下载视频的时长、分辨率和保留音轨。 */
function verifyVideo(filePath, requireH264 = false) {
  const data = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filePath], { encoding: 'utf8' }))
  const video = data.streams.find((stream) => stream.codec_type === 'video')
  const audio = data.streams.find((stream) => stream.codec_type === 'audio')
  assert.ok(video, '下载文件必须包含视频轨道')
  assert.ok(audio, '保留音频时自动重试不能静默丢失音轨')
  assert.equal(video.width, 320)
  assert.equal(video.height, 180)
  // MediaRecorder 的 WebM 常不写容器 duration，实际解码到末尾确认时长，避免把缺失元数据误判为截断。
  const decoded = execFileSync('ffmpeg', ['-v', 'error', '-i', filePath, '-f', 'null', '-', '-progress', 'pipe:1'], { encoding: 'utf8' })
  const decodedTime = [...decoded.matchAll(/out_time_us=(\d+)/g)].at(-1)?.[1]
  assert.ok(decodedTime && Math.abs(Number(decodedTime) / 1000000 - 3) < 0.5, `时长不得被截断：${decodedTime || '缺少解码进度'}`)
  if (requireH264) assert.equal(video.codec_name, 'h264')
}

/** 等待输出并通过站点真实下载按钮保存结果。 */
async function downloadOutput(page, targetPath) {
  await page.locator('.video-result-panel').waitFor({ timeout: 45000 })
  const pending = page.waitForEvent('download')
  await page.getByRole('button', { name: '下载压缩视频', exact: true }).click()
  const download = await pending
  assert.equal(await download.failure(), null)
  await download.saveAs(targetPath)
  return download.suggestedFilename()
}

/** 执行浏览器交互回归并释放浏览器与全部临时视频。 */
async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uied-video-smoke-'))
  let browser
  try {
    createFixtures(directory)
    browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({
      headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    }))
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const pageErrors = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    await page.goto(`${baseUrl}/tools/video/compress`, { waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles(path.join(directory, 'source.avi'))
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    const serverOutput = path.join(directory, 'server.mp4')
    await downloadOutput(page, serverOutput)
    verifyVideo(serverOutput, true)
    assert.ok((await fs.stat(serverOutput)).size < (await fs.stat(path.join(directory, 'source.avi'))).size)
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px 出现横向溢出`)
    }

    await page.reload({ waitUntil: 'networkidle' })
    await page.locator('input[type="file"]').setInputFiles(path.join(directory, 'source.mp4'))
    let uploads = 0
    page.on('request', (request) => { if (request.method() === 'POST' && request.url().endsWith('/video/compress')) uploads += 1 })
    const configPattern = '**/api/common/video/compress/config'
    let finishConfig
    const delayedConfig = new Promise((resolve) => { finishConfig = resolve })
    await page.route(configPattern, async (route) => {
      await delayedConfig
      await route.fulfill({ json: { code: 200, data: { available: true, crf: 26 } } })
    })
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    await page.getByRole('button', { name: '取消处理', exact: true }).click()
    finishConfig()
    await page.waitForTimeout(150)
    assert.equal(uploads, 0, '取消能力检测后不得发起压缩上传')
    assert.equal(await page.getByRole('button', { name: '开始压缩', exact: true }).isEnabled(), true)
    await page.unroute(configPattern)

    await page.locator('input[type="file"]').setInputFiles({ name: 'broken.mp4', mimeType: 'video/mp4', buffer: Buffer.from('not a real video') })
    await page.getByRole('button', { name: '开始压缩', exact: true }).click()
    await page.getByText('专业压缩失败，浏览器也无法读取此视频，请检查文件是否损坏或稍后重试', { exact: true }).first().waitFor({ timeout: 15000 })
    assert.equal(await page.getByRole('button', { name: '开始压缩', exact: true }).isEnabled(), true)

    // 首次录制器失败由测试注入，后续录制和下载均使用真实浏览器实现，验证兼容重试保留音频。
    const localPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    localPage.on('pageerror', (error) => pageErrors.push(error.message))
    await localPage.addInitScript(() => {
      const NativeRecorder = window.MediaRecorder
      let failed = false
      window.MediaRecorder = class extends NativeRecorder {
        constructor(stream, options) {
          if (!failed) { failed = true; throw new Error('QA: first recording attempt fails') }
          super(stream, options)
        }
      }
    })
    await localPage.goto(`${baseUrl}/tools/video/compress`, { waitUntil: 'networkidle' })
    await localPage.locator('input[type="file"]').setInputFiles(path.join(directory, 'source.mp4'))
    await localPage.waitForFunction(() => document.querySelector('.video-preview-panel video')?.videoWidth > 0)
    await localPage.getByText('浏览器本地', { exact: true }).click()
    await localPage.getByRole('button', { name: '开始压缩', exact: true }).click()
    const localOutput = path.join(directory, 'local-video')
    await downloadOutput(localPage, localOutput)
    verifyVideo(localOutput)
    assert.ok((await fs.stat(localOutput)).size <= (await fs.stat(path.join(directory, 'source.mp4'))).size, '体积未下降时应保留原视频')

    const stalledPage = await browser.newPage()
    stalledPage.on('pageerror', (error) => pageErrors.push(error.message))
    await stalledPage.addInitScript(() => {
      const nativeNow = performance.now.bind(performance)
      window.__uiedPlaybackAdvance = 0
      Object.defineProperty(performance, 'now', { value: () => nativeNow() + window.__uiedPlaybackAdvance })
    })
    await stalledPage.goto(`${baseUrl}/tools/video/compress`, { waitUntil: 'networkidle' })
    await stalledPage.locator('input[type="file"]').setInputFiles(path.join(directory, 'source.mp4'))
    await stalledPage.waitForFunction(() => document.querySelector('.video-preview-panel video')?.videoWidth > 0)
    await stalledPage.getByText('浏览器本地', { exact: true }).click()
    await stalledPage.getByRole('button', { name: '开始压缩', exact: true }).click()
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await stalledPage.waitForFunction(() => {
        const video = document.querySelector('.video-preview-panel video')
        return video && !video.paused
      })
      await stalledPage.evaluate(async () => {
        document.querySelector('.video-preview-panel video').pause()
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.__uiedPlaybackAdvance += 31000
      })
    }
    await stalledPage.getByText('视频播放长时间中断，请保持视频播放，或使用专业 H.264 模式重试', { exact: true }).first().waitFor()
    assert.equal(await stalledPage.getByRole('button', { name: '开始压缩', exact: true }).isEnabled(), true)
    assert.deepEqual(pageErrors, [])
    console.log('视频压缩回归通过：AVI 真实 H.264/AAC 转码下载、四档宽度、取消后不上传、损坏文件有限失败、浏览器真实兼容重试与音轨保留、播放停滞有限重试后失败。')
  } finally {
    await browser?.close()
    await fs.rm(directory, { recursive: true, force: true })
  }
}

await main()
