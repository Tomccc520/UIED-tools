/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
const extensions = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/gif', 'gif'],
  ['image/webp', 'webp']
])

/** 从同域网关读取随机表情原图，并按实际媒体类型确定下载后缀。 */
export async function fetchRandomEmoji(signal: AbortSignal) {
  const response = await fetch('/api/common/emoji/random', {
    headers: { Accept: 'image/*' },
    cache: 'no-store',
    signal
  })
  const extension = extensions.get(response.headers.get('Content-Type') ?? '')
  if (!response.ok || !extension) throw new Error('暂时无法获取表情包')

  const blob = await response.blob()
  if (!blob.size) throw new Error('表情包内容为空')
  return { blob, extension, source: response.headers.get('X-UIED-Emoji-Source') }
}
