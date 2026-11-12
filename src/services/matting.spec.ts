import { afterEach, describe, expect, it, vi } from 'vitest'
import { requestMattingImage } from './matting'

const input = new File(['test'], 'input.png', { type: 'image/png' })
const options = { provider: 'koukoutu' as const }

afterEach(() => vi.unstubAllGlobals())

describe('抠图接口产物校验', () => {
  it('将 HTTP 200 的业务 404 识别为服务未接通', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ code: 404, msg: '请求接口不存在' }),
      { headers: { 'Content-Type': 'application/json' } }
    )))
    await expect(requestMattingImage(input, options)).rejects.toThrow('抠图服务暂未接通')
  })

  it.each([
    ['text/html', '<html>proxy error</html>'],
    ['image/png', '<html>invalid png payload returned by upstream</html>']
  ])('拒绝 %s 的无效图片响应', async (mime, body) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, {
      headers: { 'Content-Type': mime }
    })))
    await expect(requestMattingImage(input, options)).rejects.toThrow('未返回有效图片')
  })

  it('返回正确的 PNG 图片', async () => {
    const bytes = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+fkgUAAAAASUVORK5CYII='),
      char => char.charCodeAt(0)
    )
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(bytes, {
      headers: { 'Content-Type': 'image/png' }
    })))
    const result = await requestMattingImage(input, options)
    expect(result.type).toBe('image/png')
    expect(result.size).toBe(bytes.length)
  })
})
