// @vitest-environment node
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { describe, expect, it } from 'vitest'
import { audioBufferToWav } from './audioBufferToWav'

/** 用指定通道采样与采样率构造音频输入，保持每个通道的原始顺序。 */
const createAudioBuffer = (channels: number[][], sampleRate = 48000): AudioBuffer => ({
  numberOfChannels: channels.length,
  length: channels[0].length,
  sampleRate,
  getChannelData: (channel: number) => new Float32Array(channels[channel])
} as AudioBuffer)

/** 直接读取 WAV 数据块内的小端 16 位样本，验证真实导出字节而非模拟编码调用。 */
const readPcmSamples = async (blob: Blob): Promise<number[]> => {
  const view = new DataView(await blob.arrayBuffer())
  return Array.from({ length: (view.byteLength - 44) / 2 }, (_, index) => view.getInt16(44 + index * 2, true))
}

describe('视频提取音频 WAV 编码', () => {
  it('写入标准 RIFF/WAVE PCM 头，数据长度和采样总数一致', async () => {
    const blob = audioBufferToWav(createAudioBuffer([[0, 0.5, 1], [0, -0.5, -1]], 44100))
    const bytes = new Uint8Array(await blob.arrayBuffer())
    const view = new DataView(bytes.buffer)
    const text = new TextDecoder()
    expect(blob.type).toBe('audio/wav')
    expect(bytes.length).toBe(44 + 3 * 2 * 2)
    expect(text.decode(bytes.subarray(0, 4))).toBe('RIFF')
    expect(view.getUint32(4, true)).toBe(bytes.length - 8)
    expect(text.decode(bytes.subarray(8, 12))).toBe('WAVE')
    expect(text.decode(bytes.subarray(12, 16))).toBe('fmt ')
    expect(view.getUint32(16, true)).toBe(16)
    expect(view.getUint16(20, true)).toBe(1)
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint32(24, true)).toBe(44100)
    expect(view.getUint32(28, true)).toBe(44100 * 2 * 2)
    expect(view.getUint16(32, true)).toBe(4)
    expect(view.getUint16(34, true)).toBe(16)
    expect(text.decode(bytes.subarray(36, 40))).toBe('data')
    expect(view.getUint32(40, true)).toBe(3 * 2 * 2)
  })

  it('少于 44 帧的短音频保留每个样本，不能被整段写成静音', async () => {
    const blob = audioBufferToWav(createAudioBuffer([[1, 0.5, -0.25, -1]]))
    expect(await readPcmSamples(blob)).toEqual([32767, 16383, -8192, -32768])
  })

  it('较长音频从第零帧写到最后一帧，不丢首音或在末尾补静音', async () => {
    const samples = new Array(100).fill(0.5)
    samples[0] = 1
    samples[99] = -1
    const actual = await readPcmSamples(audioBufferToWav(createAudioBuffer([samples])))
    expect(actual).toEqual([32767, ...new Array(98).fill(16383), -32768])
  })

  it('立体声按帧交错写入左右通道，首尾和通道顺序都保留', async () => {
    const blob = audioBufferToWav(createAudioBuffer([[1, 0, -1], [-0.5, 0.5, 0.25]]))
    expect(await readPcmSamples(blob)).toEqual([32767, -16384, 0, 16383, -32768, 8191])
  })

  it('正负采样使用各自的 16 位范围，并限制超范围采样以免溢出', async () => {
    const blob = audioBufferToWav(createAudioBuffer([[-2, -0.5, -0.25, 0, 0.25, 0.5, 2]]))
    expect(await readPcmSamples(blob)).toEqual([-32768, -16384, -8192, 0, 8191, 16383, 32767])
  })

  it('空音频输出完整文件头和零长度数据块', async () => {
    const blob = audioBufferToWav(createAudioBuffer([[]]))
    const view = new DataView(await blob.arrayBuffer())
    expect(blob.size).toBe(44)
    expect(view.getUint32(40, true)).toBe(0)
    expect(await readPcmSamples(blob)).toEqual([])
  })
})
