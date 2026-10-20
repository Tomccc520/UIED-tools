/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import FileUploadZone from './FileUploadZone.vue'

let view: VueWrapper | undefined

afterEach(() => {
  view?.unmount()
  view = undefined
  vi.restoreAllMocks()
})

/** 挂载真实上传区，保留原生按钮、文件输入与父组件事件契约。 */
function mountZone(props: Record<string, unknown> = {}) {
  view = mount(FileUploadZone, { props: { title: '点击或拖拽图片', ...props } })
  return view
}

/** 模拟系统选择文件，使用可写假路径验证组件会在通知父级之前清空输入。 */
async function chooseFiles(files: File[]) {
  const input = view!.get<HTMLInputElement>('input[type="file"]')
  Object.defineProperty(input.element, 'files', { configurable: true, value: files })
  Object.defineProperty(input.element, 'value', {
    configurable: true, writable: true, value: files.length ? `C:\\fakepath\\${files[0].name}` : ''
  })
  await input.trigger('change')
  return input
}

/** 发出真实可取消拖拽事件，便于同时核对浏览器默认行为与 Vue 事件输出。 */
async function dragEvent(type: string, files?: File[]) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  if (files) Object.defineProperty(event, 'dataTransfer', { value: { files } })
  view!.get('.file-upload-zone').element.dispatchEvent(event)
  await nextTick()
  return event
}

describe('公共文件上传区的输入契约', () => {
  it('保留多选文件顺序和对象，不按 accept 过滤或改变父页面的校验结果', async () => {
    mountZone({ multiple: true, accept: 'image/png' })
    const files = [
      new File(['second'], '02.png', { type: 'image/png' }),
      new File(['first'], '01.txt', { type: 'text/plain' })
    ]
    const input = await chooseFiles(files)
    expect(input.attributes('accept')).toBe('image/png')
    expect(input.element.multiple).toBe(true)
    expect(view!.emitted('files')).toEqual([[files]])
    expect((view!.emitted('files')![0][0] as File[])[1]).toBe(files[1])
    expect(input.element.value).toBe('')
  })

  it('默认单选对选择器和拖入文件均只提交第一张', async () => {
    mountZone()
    const files = [new File(['one'], 'one.png'), new File(['two'], 'two.png')]
    await chooseFiles(files)
    await dragEvent('drop', files)
    expect(view!.get<HTMLInputElement>('input[type="file"]').element.multiple).toBe(false)
    expect(view!.emitted('files')).toEqual([[[files[0]]], [[files[0]]]])
  })

  it('清空文件输入以允许连续重新选择同一文件，每次只发出一次 files', async () => {
    mountZone()
    const file = new File(['source'], 'same.png', { type: 'image/png' })
    const firstInput = await chooseFiles([file])
    expect(firstInput.element.value).toBe('')
    const secondInput = await chooseFiles([file])
    expect(secondInput.element.value).toBe('')
    expect(view!.emitted('files')).toEqual([[[file]], [[file]]])
  })

  it('取消选择或拖入空文件集合不发出 files', async () => {
    mountZone({ multiple: true })
    await chooseFiles([])
    await dragEvent('drop', [])
    await dragEvent('drop')
    expect(view!.emitted('files')).toBeUndefined()
  })

  it('使用有名称的原生按钮打开选择器，一次点击只打开一次且不额外提交', async () => {
    mountZone({ ariaLabel: '选择合成 GIF 的图片' })
    const input = view!.get<HTMLInputElement>('input[type="file"]')
    const click = vi.spyOn(input.element, 'click').mockImplementation(() => {})
    const button = view!.get<HTMLButtonElement>('button')
    expect(button.attributes('type')).toBe('button')
    expect(button.attributes('aria-label')).toBe('选择合成 GIF 的图片')
    await button.trigger('click')
    expect(click).toHaveBeenCalledOnce()
    expect(view!.emitted('files')).toBeUndefined()
    expect(view!.emitted('select')).toBeUndefined()
  })
})

describe('公共文件上传区的拖拽与处理中反馈', () => {
  it('拖入时高亮，离开或完成放下时清除，并阻止浏览器打开文件', async () => {
    mountZone({ multiple: true })
    const over = await dragEvent('dragover')
    expect(over.defaultPrevented).toBe(true)
    expect(view!.classes()).toContain('file-upload-zone--active')
    const leave = new Event('dragleave', { bubbles: true, cancelable: true })
    Object.defineProperty(leave, 'relatedTarget', { value: view!.get('.file-upload-zone__title').element })
    view!.get('.file-upload-zone').element.dispatchEvent(leave)
    await nextTick()
    expect(view!.classes()).toContain('file-upload-zone--active')
    await dragEvent('dragleave')
    expect(view!.classes()).not.toContain('file-upload-zone--active')
    await dragEvent('dragover')
    const files = [new File(['one'], '01.png'), new File(['two'], '02.png')]
    const drop = await dragEvent('drop', files)
    expect(drop.defaultPrevented).toBe(true)
    expect(view!.classes()).not.toContain('file-upload-zone--active')
    expect(view!.emitted('files')).toEqual([[files]])
    expect(view!.emitted('drop')).toBeUndefined()
  })

  it('禁用后忽略点击、选择和拖入，仍阻止拖拽默认导航，恢复后可上传', async () => {
    mountZone({ disabled: true })
    const button = view!.get<HTMLButtonElement>('button')
    const input = view!.get<HTMLInputElement>('input[type="file"]')
    const click = vi.spyOn(input.element, 'click').mockImplementation(() => {})
    expect(button.element.disabled).toBe(true)
    button.element.click()
    await chooseFiles([new File(['ignored'], 'ignored.png')])
    const over = await dragEvent('dragover')
    const drop = await dragEvent('drop', [new File(['ignored'], 'ignored.png')])
    expect(over.defaultPrevented).toBe(true)
    expect(drop.defaultPrevented).toBe(true)
    expect(click).not.toHaveBeenCalled()
    expect(view!.classes()).not.toContain('file-upload-zone--active')
    expect(view!.emitted('files')).toBeUndefined()
    await view!.setProps({ disabled: false })
    const accepted = new File(['accepted'], 'accepted.png')
    await chooseFiles([accepted])
    expect(view!.emitted('files')).toEqual([[[accepted]]])
  })

  it('拖拽过程中切为禁用会清除旧高亮', async () => {
    mountZone()
    await dragEvent('dragover')
    await view!.setProps({ disabled: true })
    expect(view!.classes()).not.toContain('file-upload-zone--active')
  })

  it('busy 只提供读取状态，不阻止图片解码期间追加下一批文件', async () => {
    mountZone({ busy: true, busyText: '正在读取图片，可以继续添加', multiple: true })
    expect(view!.attributes('aria-busy')).toBe('true')
    expect(view!.get<HTMLButtonElement>('button').element.disabled).toBe(false)
    expect(view!.get('[role="status"]').text()).toContain('正在读取图片，可以继续添加')
    const file = new File(['next'], 'next.png')
    await chooseFiles([file])
    expect(view!.emitted('files')).toEqual([[[file]]])
  })
})

describe('视频上传外部选择器兼容', () => {
  it('外部模式不创建 input，点击只发 select，放下只原样转发 drop', async () => {
    mountZone({ externalPicker: true })
    expect(view!.find('input[type="file"]').exists()).toBe(false)
    await view!.get('button').trigger('click')
    expect(view!.emitted('select')).toHaveLength(1)
    const files = [new File(['video'], 'source.mp4', { type: 'video/mp4' })]
    const drop = await dragEvent('drop', files)
    expect(view!.emitted('drop')).toEqual([[drop]])
    expect(view!.emitted('files')).toBeUndefined()
    expect(view!.emitted('select')).toHaveLength(1)
  })

  it('外部模式禁用时不触发现有选择器和拖入处理', async () => {
    mountZone({ externalPicker: true, disabled: true })
    view!.get<HTMLButtonElement>('button').element.click()
    await dragEvent('drop', [new File(['video'], 'source.mp4')])
    expect(view!.emitted('select')).toBeUndefined()
    expect(view!.emitted('drop')).toBeUndefined()
    expect(view!.emitted('files')).toBeUndefined()
  })
})
