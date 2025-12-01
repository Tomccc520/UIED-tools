import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import GifCompress from './GifCompress.vue'

// Mock URL APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Worker
class MockWorker {
  onmessage: (e: any) => void = () => {}
  postMessage(data: any) {
    // Simulate worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: { type: 'finished', data: new Blob(['mock-gif']) } })
      }
    }, 100)
  }
  terminate() {}
}
global.Worker = MockWorker as any

// Mock gif.js
vi.mock('gif.js', () => {
  return {
    default: class GIF {
      constructor() {}
      addFrame() {}
      on(event: string, cb: Function) {
        if (event === 'finished') {
          setTimeout(() => cb(new Blob(['mock-result']), new Uint8Array([])), 100)
        }
        return this
      }
      render() {}
    }
  }
})

// Mock gifuct-js
vi.mock('gifuct-js', () => {
  return {
    parseGIF: () => ({}),
    decompressFrames: () => [
      {
        dims: { width: 100, height: 100, top: 0, left: 0 },
        patch: new Uint8ClampedArray(40000),
        delay: 100,
        disposalType: 2
      }
    ]
  }
})

describe('GifCompress.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(GifCompress)
  })

  it('renders correctly', () => {
    expect(wrapper.text()).toContain('免费在线 GIF 动图压缩工具')
    expect(wrapper.find('input[type="file"]').exists()).toBe(true)
  })

  it('updates options correctly', async () => {
    // Upload file simulation
    const file = new File([''], 'test.gif', { type: 'image/gif' })
    const input = wrapper.find('input[type="file"]')
    
    // Trigger file change
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')
    
    // Check if options panel appears
    expect(wrapper.find('.el-slider').exists()).toBe(true)
    
    // Change scale
    wrapper.vm.options.scale = 0.5
    expect(wrapper.vm.options.scale).toBe(0.5)
  })

  it('resets state correctly', async () => {
    // Set some state
    wrapper.vm.file = new File([''], 'test.gif')
    wrapper.vm.compressedSrc = 'blob:something'
    
    // Call reset
    await wrapper.vm.reset()
    
    expect(wrapper.vm.file).toBeNull()
    expect(wrapper.vm.compressedSrc).toBe('')
  })
})
