/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
/**
 * 将 AudioBuffer 全部采样按通道交错编码为 16 位 PCM WAV，文件头与样本游标分别管理。
 * @param buffer 音频缓冲
 * @returns WAV 格式 Blob
 */
export const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = buffer.numberOfChannels
  const length = buffer.length * numOfChan * 2 + 44
  const bufferArr = new ArrayBuffer(length)
  const view = new DataView(bufferArr)
  const channels: Float32Array[] = []
  let headerOffset = 0

  setUint32(0x46464952) // "RIFF"
  setUint32(length - 8) // file length - 8
  setUint32(0x45564157) // "WAVE"

  setUint32(0x20746d66) // "fmt " chunk
  setUint32(16) // length = 16
  setUint16(1) // PCM (uncompressed)
  setUint16(numOfChan)
  setUint32(buffer.sampleRate)
  setUint32(buffer.sampleRate * 2 * numOfChan)
  setUint16(numOfChan * 2)
  setUint16(16)

  setUint32(0x61746164) // "data" - chunk
  setUint32(length - 44)

  for (let channel = 0; channel < numOfChan; channel++) {
    channels.push(buffer.getChannelData(channel))
  }

  let dataOffset = 44
  for (let frame = 0; frame < buffer.length; frame++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]))
      const pcmSample = (sample < 0 ? sample * 32768 : sample * 32767) | 0
      view.setInt16(dataOffset, pcmSample, true)
      dataOffset += 2
    }
  }

  return new Blob([bufferArr], { type: 'audio/wav' })

  /** 将 16 位无符号字段写入 WAV 头并前移头部游标，参数为字段值。 */
  function setUint16(data: number) {
    view.setUint16(headerOffset, data, true)
    headerOffset += 2
  }

  /** 将 32 位无符号字段写入 WAV 头并前移头部游标，参数为字段值。 */
  function setUint32(data: number) {
    view.setUint32(headerOffset, data, true)
    headerOffset += 4
  }
}
