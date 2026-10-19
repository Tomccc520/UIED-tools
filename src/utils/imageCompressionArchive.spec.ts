/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
import { describe, expect, it } from 'vitest'
import { createImageArchiveEntries, createImageArchiveNames } from './imageCompressionArchive'

describe('图片压缩下载命名', () => {
  it('同名及大小写重复的图片不会在 ZIP 或独立下载中互相覆盖', () => {
    expect(createImageArchiveNames([{ name: 'photo.png' }, { name: 'photo.png' }, { name: 'PHOTO.PNG' }]))
      .toEqual(['uied_photo.png', 'uied_photo (2).png', 'uied_PHOTO (3).PNG'])
  })

  it('处理原文件名自带编号及目录分隔符的情况', () => {
    expect(createImageArchiveNames([{ name: 'photo (2).png' }, { name: 'photo.png' }, { name: 'photo.png' }, { name: '../photo.png' }]))
      .toEqual(['uied_photo (2).png', 'uied_photo.png', 'uied_photo (3).png', 'uied_.._photo.png'])
  })

  it('仅打包成功结果，同时保留整批命名，避免失败项改变后续下载名称', () => {
    const second = new Blob(['second'])
    const files = [{ name: 'photo.png' }, { name: 'photo.png', compressedBlob: second }]
    expect(createImageArchiveEntries(files)).toEqual([{ name: 'uied_photo (2).png', blob: second }])
  })
})
