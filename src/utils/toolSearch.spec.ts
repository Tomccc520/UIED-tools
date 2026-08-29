/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-08-29
 */
import { describe, expect, it } from 'vitest'
import type { Tool } from '@/types/tools'
import { searchToolsByQuery } from './toolSearch'

const tools: Tool[] = [
  {
    id: 1,
    title: '图片压缩',
    logo: '',
    desc: '在线减小图片体积',
    url: '/tools/image-compress',
    cate: '图片处理',
    status: 1
  },
  {
    id: 2,
    title: '智能抠图',
    logo: '',
    desc: '自动移除图片背景',
    url: '/tools/matting',
    cate: '图片处理',
    status: 1
  },
  {
    id: 3,
    title: '二维码生成器',
    logo: '',
    desc: '生成二维码图片',
    url: '/tools/qrcode?source=test',
    cate: '常用工具',
    toolKey: 'qr-generator',
    status: 1
  },
  {
    id: 4,
    title: '二维码生成器',
    logo: '',
    desc: '重复入口',
    url: '/tools/qrcode#preview',
    cate: '常用工具',
    status: 1
  },
  {
    id: 5,
    title: '视频压缩',
    logo: '',
    desc: '在线减小视频体积',
    url: '/tools/video-compress',
    cate: '视频处理',
    status: 1
  }
]

describe('searchToolsByQuery', () => {
  it('支持首尾空格和中间空格归一化', () => {
    expect(searchToolsByQuery(tools, '  图片 压缩  ')[0]?.title).toBe('图片压缩')
  })

  it('支持常用同义词与英文别名搜索', () => {
    expect(searchToolsByQuery(tools, '去背景')[0]?.title).toBe('智能抠图')
    expect(searchToolsByQuery(tools, 'QR')[0]?.title).toBe('二维码生成器')
  })

  it('支持工具标识检索并按标准链接去重', () => {
    const results = searchToolsByQuery(tools, 'qr-generator')
    expect(results).toHaveLength(1)
    expect(results[0]?.url).toContain('/tools/qrcode')
  })

  it('多概念查询需同时满足，避免只命中部分词义', () => {
    const results = searchToolsByQuery(tools, '图片压缩')
    expect(results.map(item => item.title)).toContain('图片压缩')
    expect(results.map(item => item.title)).not.toContain('视频压缩')
  })
})
