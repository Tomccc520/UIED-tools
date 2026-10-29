/**
 * @description 使用同一段本地合成视频，对比 FFmpeg 两档压缩的耗时与真实产物。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-29
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { parseArgs } from 'node:util'

const { values } = parseArgs({ options: {
  report: { type: 'string' },
  fixtures: { type: 'string' }
} })

/** 调用已安装的 FFmpeg；只返回必要日志，失败时由上层负责清理临时文件。 */
function ffmpeg(args, logLevel = 'error') {
  return execFileSync('ffmpeg', ['-hide_banner', '-loglevel', logLevel, '-y', ...args], {
    encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe']
  })
}

/** 获取独立 ffprobe 的编码、音轨、尺寸和时长，避免仅凭下载文件名判断成功。 */
function probe(filePath) {
  const data = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', filePath], {
    encoding: 'utf8'
  }))
  const video = data.streams.find(stream => stream.codec_type === 'video')
  const audio = data.streams.find(stream => stream.codec_type === 'audio')
  assert.ok(video, '产物必须包含视频轨道')
  assert.ok(audio, '产物必须保留音频轨道')
  return {
    videoCodec: video.codec_name, audioCodec: audio.codec_name,
    width: video.width, height: video.height,
    durationSeconds: Number(data.format.duration), sizeBytes: Number(data.format.size),
    frameRate: video.avg_frame_rate
  }
}

/** 解码到末尾确认完整性；编码耗时统计不包含本验收步骤。 */
function verifyOutput(filePath, sourceInfo) {
  const info = probe(filePath)
  assert.equal(info.videoCodec, 'h264')
  assert.equal(info.audioCodec, 'aac')
  assert.equal(info.width, sourceInfo.width)
  assert.equal(info.height, sourceInfo.height)
  assert.ok(Math.abs(info.durationSeconds - sourceInfo.durationSeconds) < 0.15, '转码不得截短视频')
  const decoded = ffmpeg(['-xerror', '-i', filePath, '-f', 'null', '-', '-progress', 'pipe:1'])
  const finalTime = [...decoded.matchAll(/out_time_us=(\d+)/g)].at(-1)?.[1]
  assert.ok(finalTime && Math.abs(Number(finalTime) / 1e6 - sourceInfo.durationSeconds) < 0.15, '完整解码时长必须与源视频一致')
  return { ...info, fullyDecoded: true }
}

/** 在用户指定目录生成小型浏览器验收素材；默认不额外保留任何视频文件。 */
async function createFixtures(directory) {
  await fs.mkdir(directory, { recursive: true })
  for (const [extension, codecArgs] of [
    ['mp4', ['-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '10', '-c:a', 'aac', '-movflags', '+faststart']],
    ['avi', ['-c:v', 'mjpeg', '-q:v', '2', '-c:a', 'pcm_s16le']]
  ]) {
    ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=size=320x180:rate=24',
      '-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=44100',
      '-t', '3', ...codecArgs, path.join(directory, `source.${extension}`)])
  }
}

/** 顺序执行两轮编码，记录速度、体积与独立解码结果，并始终清理大体积中间文件。 */
async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'uied-video-benchmark-'))
  try {
    const source = path.join(directory, 'source.mp4')
    ffmpeg(['-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30',
      '-f', 'lavfi', '-i', 'sine=frequency=880:sample_rate=48000',
      '-t', '18', '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '12',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', source])
    const sourceInfo = probe(source)
    const runs = []
    // 交替顺序避免把两档完全分开执行；每次仍是单任务，以免争抢 CPU。
    for (const [index, preset] of ['medium', 'veryfast', 'medium', 'veryfast'].entries()) {
      const output = path.join(directory, `${index}-${preset}.mp4`)
      const startedAt = performance.now()
      ffmpeg(['-i', source, '-map', '0:v:0', '-map', '0:a?', '-map_metadata', '-1',
        '-vf', "scale=w='min(1920,iw)':h='min(1920,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
        '-fpsmax', '30', '-c:v', 'libx264', '-preset', preset, '-crf', '26', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output])
      const elapsedMs = Math.round(performance.now() - startedAt)
      const result = verifyOutput(output, sourceInfo)
      runs.push({ preset, elapsedMs, ...result })
      console.log(`${preset}: ${(elapsedMs / 1000).toFixed(2)}s, ${(result.sizeBytes / 1024 / 1024).toFixed(2)} MiB, full decode OK`)
    }
    const summary = Object.fromEntries(['medium', 'veryfast'].map(preset => {
      const selected = runs.filter(run => run.preset === preset)
      return [preset, {
        averageElapsedMs: Math.round(selected.reduce((sum, run) => sum + run.elapsedMs, 0) / selected.length),
        outputSizeBytes: selected[0].sizeBytes,
        savingPercent: Number(((1 - selected[0].sizeBytes / sourceInfo.sizeBytes) * 100).toFixed(2))
      }]
    }))
    const report = {
      recordedAt: new Date().toISOString(),
      platform: `${os.platform()} ${os.arch()}`, cpu: os.cpus()[0]?.model,
      ffmpeg: execFileSync('ffmpeg', ['-version'], { encoding: 'utf8' }).split('\n')[0],
      fixture: '18s synthetic testsrc2, 1920x1080, 30fps, AAC; no user media',
      limitation: 'Local synthetic benchmark only; does not predict production upload, queue, CPU speed or perceptual quality.',
      source: sourceInfo, runs, summary,
      speedup: Number((summary.medium.averageElapsedMs / summary.veryfast.averageElapsedMs).toFixed(2)),
      fastOutputSizeChangePercent: Number(((summary.veryfast.outputSizeBytes / summary.medium.outputSizeBytes - 1) * 100).toFixed(2))
    }
    if (values.fixtures) {
      const fixturesDirectory = path.resolve(values.fixtures)
      await createFixtures(fixturesDirectory)
      report.browserFixturesDirectory = fixturesDirectory
    }
    if (values.report) {
      const reportPath = path.resolve(values.report)
      await fs.mkdir(path.dirname(reportPath), { recursive: true })
      await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`)
      console.log(`Report: ${reportPath}`)
    } else {
      console.log(JSON.stringify(report, null, 2))
    }
  } finally {
    await fs.rm(directory, { recursive: true, force: true })
  }
}

await main()
