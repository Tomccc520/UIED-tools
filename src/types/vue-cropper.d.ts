declare module 'vue-cropper' {
  import { DefineComponent } from 'vue'

  export interface CropperInstance {
    refresh: () => void
    rotateLeft: () => void
    rotateRight: () => void
    getCropData: (callback: (data: string) => void) => void
  }

  export interface CropperOptions {
    img: string
    outputSize?: number
    outputType?: string
    info?: boolean
    canScale?: boolean
    autoCrop?: boolean
    fixedBox?: boolean
    fixed?: boolean
    fixedNumber?: [number, number]
    centerBox?: boolean
    high?: boolean
    infoTrue?: boolean
    maxImgSize?: number
    enlarge?: number
    mode?: string
  }

  export const VueCropper: DefineComponent<{
    img: string
    outputSize: number
    outputType: string
    info: boolean
    canScale: boolean
    autoCrop: boolean
    fixedBox: boolean
    fixed: boolean
    fixedNumber: [number, number]
    centerBox: boolean
    high: boolean
    infoTrue: boolean
    maxImgSize: number
    enlarge: number
    mode: string
  }>
}
