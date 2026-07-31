<!--
 * @file CircularGallery.vue
 * @description 基于 OGL 的循环工具画廊，支持滚轮、拖拽、吸附与卡片选择
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-07-17
 -->

<template>
  <div
    ref="containerRef"
    class="circular-gallery"
    role="listbox"
    aria-label="随机工具循环画廊"
  />
</template>

<script setup lang="ts">
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl'
import { onMounted, onUnmounted, ref, watch } from 'vue'

export interface CircularGalleryItem {
  image: string
  text: string
  key?: string | number
}

interface CircularGalleryProps {
  items?: CircularGalleryItem[]
  bend?: number
  textColor?: string
  borderRadius?: number
  font?: string
  scrollSpeed?: number
  scrollEase?: number
}

const props = withDefaults(defineProps<CircularGalleryProps>(), {
  items: () => [],
  bend: 3,
  textColor: '#ffffff',
  borderRadius: 0.05,
  font: '700 30px "PingFang SC", "Microsoft YaHei", sans-serif',
  scrollSpeed: 2,
  scrollEase: 0.05
})

const emit = defineEmits<{
  select: [index: number]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let galleryApp: GalleryApp | null = null
let componentMounted = false

type GL = Renderer['gl']

interface ScreenSize {
  width: number
  height: number
}

interface ViewportSize {
  width: number
  height: number
}

interface ScrollState {
  current: number
  target: number
  last: number
}

/**
 * 函数说明：在两个数值之间做线性插值，用于平滑画廊滚动位置。
 */
const lerp = (start: number, end: number, ease: number): number => {
  return start + (end - start) * ease
}

/**
 * 函数说明：从字体声明中提取字号，供 Canvas 文本纹理计算高度。
 */
const resolveFontSize = (font: string): number => {
  const matchedSize = font.match(/(\d+)px/)
  return matchedSize ? Number.parseInt(matchedSize[1], 10) : 30
}

/**
 * 函数说明：把工具标题绘制成透明 Canvas 纹理，避免 WebGL 场景额外依赖字体图片。
 */
const createTextTexture = (gl: GL, text: string, font: string, color: string) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('CircularGallery 无法创建文本画布')
  }

  context.font = font
  const textWidth = Math.ceil(context.measureText(text).width)
  const textHeight = Math.ceil(resolveFontSize(font) * 1.25)
  const logicalWidth = Math.max(64, textWidth + 32)
  const logicalHeight = textHeight + 24
  const pixelRatio = Math.min(2, Math.max(window.devicePixelRatio || 1, 1.5))
  canvas.width = Math.ceil(logicalWidth * pixelRatio)
  canvas.height = Math.ceil(logicalHeight * pixelRatio)
  context.scale(pixelRatio, pixelRatio)
  context.font = font
  context.fillStyle = color
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text, logicalWidth / 2, logicalHeight / 2)

  const texture = new Texture(gl, { generateMipmaps: false })
  texture.image = canvas
  return { texture, width: logicalWidth, height: logicalHeight }
}

class GalleryTitle {
  private readonly mesh: Mesh

  /**
   * 函数说明：创建并挂载单张工具卡片下方的标题纹理。
   */
  constructor(gl: GL, parent: Mesh, text: string, font: string, color: string) {
    const { texture, width, height } = createTextTexture(gl, text, font, color)
    const geometry = new Plane(gl)
    const program = new Program(gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.05) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
      depthTest: false,
      depthWrite: false
    })
    this.mesh = new Mesh(gl, { geometry, program })
    const textHeight = parent.scale.y * 0.13
    this.mesh.scale.set(textHeight * (width / height), textHeight, 1)
    this.mesh.position.y = -parent.scale.y * 0.5 - textHeight * 0.65
    this.mesh.setParent(parent)
  }
}

class GalleryMedia {
  readonly index: number
  readonly plane: Mesh
  width = 0
  widthTotal = 0
  x = 0
  extra = 0
  private readonly program: Program
  private readonly length: number
  private readonly bend: number
  private screen: ScreenSize
  private viewport: ViewportSize

  /**
   * 函数说明：创建单张工具封面、着色器与标题，并加入循环画廊场景。
   */
  constructor(options: {
    gl: GL
    geometry: Plane
    scene: Transform
    image: string
    text: string
    index: number
    length: number
    screen: ScreenSize
    viewport: ViewportSize
    bend: number
    textColor: string
    borderRadius: number
    font: string
  }) {
    this.index = options.index
    this.length = options.length
    this.bend = options.bend
    this.screen = options.screen
    this.viewport = options.viewport

    const texture = new Texture(options.gl, {
      generateMipmaps: true,
      anisotropy: 8
    })
    this.program = new Program(options.gl, {
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          float motion = smoothstep(0.002, 0.12, abs(uSpeed));
          p.z = sin(p.x * 3.6 + uTime) * motion * 0.075;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          float distance = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, distance);
          gl_FragColor = vec4(color.rgb, color.a * alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [1, 1] },
        uTime: { value: Math.random() * 100 },
        uSpeed: { value: 0 },
        uBorderRadius: { value: options.borderRadius }
      },
      transparent: true,
      depthTest: false,
      depthWrite: false
    })

    this.plane = new Mesh(options.gl, { geometry: options.geometry, program: this.program })
    this.plane.setParent(options.scene)
    this.resize(options.screen, options.viewport)
    new GalleryTitle(options.gl, this.plane, options.text, options.font, options.textColor)
    this.loadTexture(options.image, texture)
  }

  /**
   * 函数说明：加载工具封面并把真实尺寸写入着色器，保证图片按 cover 方式裁切。
   */
  private loadTexture(source: string, texture: Texture) {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      texture.image = image
      this.program.uniforms.uImageSizes.value = [image.naturalWidth, image.naturalHeight]
    }
    image.src = source
  }

  /**
   * 函数说明：按容器尺寸重算卡片尺寸和循环间距，适配桌面与移动端。
   */
  resize(screen: ScreenSize, viewport: ViewportSize) {
    this.screen = screen
    this.viewport = viewport
    const mobileScale = screen.width <= 640 ? 1.16 : 1
    const scale = (screen.height / 1500) * mobileScale
    this.plane.scale.y = (viewport.height * (900 * scale)) / screen.height
    this.plane.scale.x = (viewport.width * (700 * scale)) / screen.width
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y]
    const padding = screen.width <= 640 ? 1.15 : 1.7
    this.width = this.plane.scale.x + padding
    this.widthTotal = this.width * this.length
    this.x = this.width * this.index
  }

  /**
   * 函数说明：更新卡片弧形位置、滚动形变和无缝循环偏移。
   */
  update(scroll: ScrollState, direction: 'left' | 'right') {
    this.plane.position.x = this.x - scroll.current - this.extra
    const currentX = this.plane.position.x
    const halfViewport = this.viewport.width / 2

    if (this.bend === 0) {
      this.plane.position.y = 0
      this.plane.rotation.z = 0
    } else {
      const bendValue = Math.abs(this.bend)
      const radius = (halfViewport * halfViewport + bendValue * bendValue) / (2 * bendValue)
      const effectiveX = Math.min(Math.abs(currentX), halfViewport)
      const arc = radius - Math.sqrt(Math.max(0, radius * radius - effectiveX * effectiveX))
      this.plane.position.y = this.bend > 0 ? -arc : arc
      this.plane.rotation.z = (this.bend > 0 ? -1 : 1) * Math.sign(currentX) * Math.asin(effectiveX / radius)
    }

    const speed = scroll.current - scroll.last
    this.program.uniforms.uTime.value += 0.035
    this.program.uniforms.uSpeed.value = speed

    const planeOffset = this.plane.scale.x / 2
    const isBefore = this.plane.position.x + planeOffset < -halfViewport
    const isAfter = this.plane.position.x - planeOffset > halfViewport
    if (direction === 'right' && isBefore) {
      this.extra -= this.widthTotal
    }
    if (direction === 'left' && isAfter) {
      this.extra += this.widthTotal
    }
  }
}

class GalleryApp {
  private readonly container: HTMLElement
  private readonly renderer: Renderer
  private readonly gl: GL
  private readonly camera: Camera
  private readonly scene: Transform
  private readonly geometry: Plane
  private readonly scroll: ScrollState
  private readonly scrollEase: number
  private readonly scrollSpeed: number
  private readonly originalItemCount: number
  private readonly onSelect: (index: number) => void
  private readonly medias: GalleryMedia[] = []
  private readonly resizeObserver: ResizeObserver
  private screen: ScreenSize = { width: 1, height: 1 }
  private viewport: ViewportSize = { width: 1, height: 1 }
  private animationFrame = 0
  private snapTimer = 0
  private activePointerId: number | null = null
  private pointerStartX = 0
  private pointerStartY = 0
  private pointerLastX = 0
  private pointerOrigin = 0

  /**
   * 函数说明：初始化 OGL 渲染器、循环卡片和局部交互监听。
   */
  constructor(container: HTMLElement, options: Required<Omit<CircularGalleryProps, 'items'>> & {
    items: CircularGalleryItem[]
    onSelect: (index: number) => void
  }) {
    this.container = container
    this.scrollEase = options.scrollEase
    this.scrollSpeed = options.scrollSpeed
    this.originalItemCount = options.items.length
    this.onSelect = options.onSelect
    this.scroll = { current: 0, target: 0, last: 0 }
    const rendererPixelRatio = Math.min(2, Math.max(window.devicePixelRatio || 1, 1.5))
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: rendererPixelRatio
    })
    this.gl = this.renderer.gl
    this.gl.clearColor(0, 0, 0, 0)
    this.camera = new Camera(this.gl)
    this.camera.fov = 45
    this.camera.position.z = 20
    this.scene = new Transform()
    this.geometry = new Plane(this.gl, { widthSegments: 80, heightSegments: 40 })
    this.container.appendChild(this.gl.canvas as HTMLCanvasElement)
    this.resize()

    const repeatedItems = options.items.concat(options.items)
    repeatedItems.forEach((item, index) => {
      this.medias.push(new GalleryMedia({
        gl: this.gl,
        geometry: this.geometry,
        scene: this.scene,
        image: item.image,
        text: item.text,
        index,
        length: repeatedItems.length,
        screen: this.screen,
        viewport: this.viewport,
        bend: options.bend,
        textColor: options.textColor,
        borderRadius: options.borderRadius,
        font: options.font
      }))
    })
    const initialOffset = this.medias[0]?.width || 0
    this.scroll.current = initialOffset
    this.scroll.target = initialOffset
    this.scroll.last = initialOffset

    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(this.container)
    this.addEventListeners()
    this.update()
  }

  /**
   * 函数说明：把滚动目标吸附到最近卡片，保持停止后的画廊位置稳定。
   */
  private snapToNearest = () => {
    if (!this.medias[0]) {
      return
    }
    const itemWidth = this.medias[0].width
    this.scroll.target = Math.round(this.scroll.target / itemWidth) * itemWidth
  }

  /**
   * 函数说明：响应画廊区域滚轮并转成横向卡片移动，不影响区域外页面滚动。
   */
  private handleWheel = (event: WheelEvent) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
    this.scroll.target += Math.sign(delta || 1) * this.scrollSpeed * 0.22
    window.clearTimeout(this.snapTimer)
    this.snapTimer = window.setTimeout(this.snapToNearest, 140)
  }

  /**
   * 函数说明：记录拖拽起点并捕获当前指针，保证快速滑动时交互不中断。
   */
  private handlePointerDown = (event: PointerEvent) => {
    this.activePointerId = event.pointerId
    this.pointerStartX = event.clientX
    this.pointerStartY = event.clientY
    this.pointerLastX = event.clientX
    this.pointerOrigin = this.scroll.current
    this.container.setPointerCapture(event.pointerId)
  }

  /**
   * 函数说明：将横向拖拽距离映射为 WebGL 世界坐标并实时更新画廊目标位置。
   */
  private handlePointerMove = (event: PointerEvent) => {
    if (this.activePointerId !== event.pointerId) {
      return
    }
    this.pointerLastX = event.clientX
    const distance = (this.pointerStartX - event.clientX) * (this.scrollSpeed * 0.024)
    this.scroll.target = this.pointerOrigin + distance
  }

  /**
   * 函数说明：结束拖拽并区分点击与滑动，点击时打开命中的工具卡片。
   */
  private handlePointerUp = (event: PointerEvent) => {
    if (this.activePointerId !== event.pointerId) {
      return
    }
    const movedX = Math.abs(event.clientX - this.pointerStartX)
    const movedY = Math.abs(event.clientY - this.pointerStartY)
    if (movedX < 8 && movedY < 8) {
      this.selectAtClientX(event.clientX)
    } else {
      this.snapToNearest()
    }
    this.activePointerId = null
    if (this.container.hasPointerCapture(event.pointerId)) {
      this.container.releasePointerCapture(event.pointerId)
    }
  }

  /**
   * 函数说明：根据点击的屏幕横坐标命中距离最近的可见卡片并回传原始索引。
   */
  private selectAtClientX(clientX: number) {
    if (!this.medias.length || !this.originalItemCount) {
      return
    }
    const bounds = this.container.getBoundingClientRect()
    const normalizedX = (clientX - bounds.left) / Math.max(1, bounds.width) - 0.5
    const worldX = normalizedX * this.viewport.width
    const matchedMedia = this.medias.reduce((nearest, media) => {
      const currentDistance = Math.abs(media.plane.position.x - worldX)
      const nearestDistance = Math.abs(nearest.plane.position.x - worldX)
      return currentDistance < nearestDistance ? media : nearest
    })
    this.onSelect(matchedMedia.index % this.originalItemCount)
  }

  /**
   * 函数说明：监听容器自身的滚轮和指针事件，避免全局事件污染其它页面区域。
   */
  private addEventListeners() {
    this.container.addEventListener('wheel', this.handleWheel, { passive: false })
    this.container.addEventListener('pointerdown', this.handlePointerDown)
    this.container.addEventListener('pointermove', this.handlePointerMove)
    this.container.addEventListener('pointerup', this.handlePointerUp)
    this.container.addEventListener('pointercancel', this.handlePointerUp)
  }

  /**
   * 函数说明：根据容器尺寸更新渲染器、相机和全部卡片的响应式尺寸。
   */
  private resize() {
    this.screen = {
      width: Math.max(1, this.container.clientWidth),
      height: Math.max(1, this.container.clientHeight)
    }
    this.renderer.setSize(this.screen.width, this.screen.height)
    this.camera.perspective({ aspect: this.screen.width / this.screen.height })
    const fieldOfView = (this.camera.fov * Math.PI) / 180
    const height = 2 * Math.tan(fieldOfView / 2) * this.camera.position.z
    this.viewport = { width: height * this.camera.aspect, height }
    this.medias.forEach((media) => media.resize(this.screen, this.viewport))
  }

  /**
   * 函数说明：执行逐帧平滑、循环位置更新和场景渲染。
   */
  private update = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scrollEase)
    const direction = this.scroll.current >= this.scroll.last ? 'right' : 'left'
    this.medias.forEach((media) => media.update(this.scroll, direction))
    this.renderer.render({ scene: this.scene, camera: this.camera })
    this.scroll.last = this.scroll.current
    this.animationFrame = window.requestAnimationFrame(this.update)
  }

  /**
   * 函数说明：销毁渲染循环、观察器和局部事件，避免切页后残留 WebGL 资源。
   */
  destroy() {
    window.cancelAnimationFrame(this.animationFrame)
    window.clearTimeout(this.snapTimer)
    this.resizeObserver.disconnect()
    this.container.removeEventListener('wheel', this.handleWheel)
    this.container.removeEventListener('pointerdown', this.handlePointerDown)
    this.container.removeEventListener('pointermove', this.handlePointerMove)
    this.container.removeEventListener('pointerup', this.handlePointerUp)
    this.container.removeEventListener('pointercancel', this.handlePointerUp)
    const canvas = this.gl.canvas as HTMLCanvasElement
    if (canvas.parentNode === this.container) {
      this.container.removeChild(canvas)
    }
  }
}

/**
 * 函数说明：根据当前属性重新创建画廊实例，保证换一批和分类切换后内容立即更新。
 */
const rebuildGallery = () => {
  galleryApp?.destroy()
  galleryApp = null
  if (!componentMounted || !containerRef.value || !props.items.length) {
    return
  }
  galleryApp = new GalleryApp(containerRef.value, {
    items: props.items,
    bend: props.bend,
    textColor: props.textColor,
    borderRadius: props.borderRadius,
    font: props.font,
    scrollSpeed: props.scrollSpeed,
    scrollEase: props.scrollEase,
    onSelect: (index) => emit('select', index)
  })
}

onMounted(() => {
  componentMounted = true
  rebuildGallery()
})

onUnmounted(() => {
  componentMounted = false
  galleryApp?.destroy()
  galleryApp = null
})

watch(
  () => [props.items, props.bend, props.textColor, props.borderRadius, props.font, props.scrollSpeed, props.scrollEase],
  rebuildGallery,
  { deep: true }
)
</script>

<style scoped>
.circular-gallery {
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.circular-gallery:active {
  cursor: grabbing;
}

.circular-gallery :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
