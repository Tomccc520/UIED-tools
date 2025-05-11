/**
 * 声明esm-potrace-wasm模块的类型
 */
declare module 'esm-potrace-wasm' {
  /**
   * 初始化Potrace库
   */
  export function init(): Promise<void>;

  /**
   * Potrace转换选项
   */
  export interface PotraceOptions {
    /** 噪点阈值, 忽略小于该值的区域 */
    turdsize?: number;
    /** 转向策略 */
    turnpolicy?: number;
    /** 拐角阈值 */
    alphamax?: number;
    /** 是否优化曲线 */
    opticurve?: boolean;
    /** 曲线优化容差 */
    opttolerance?: number;
    /** 是否提取颜色 */
    extractcolors?: boolean;
    /** 颜色采样算法 */
    colorsampling?: number;
    /** 颜色级别 [1-255] */
    posterizelevel?: number;
    /** 颜色处理算法: 0=简单, 1=插值 */
    posterizationalgorithm?: number;
    /** 仅返回路径数据 */
    pathonly?: boolean;
  }

  /**
   * 将图像转换为SVG
   * @param image 图像源，可以是HTMLImageElement, SVGImageElement, HTMLVideoElement, HTMLCanvasElement, ImageData, ImageBitmap或Blob
   * @param options 转换选项
   * @returns 生成的SVG字符串
   */
  export function potrace(
    image: HTMLImageElement | SVGImageElement | HTMLVideoElement | HTMLCanvasElement | ImageData | ImageBitmap | Blob,
    options?: PotraceOptions
  ): Promise<string>;
}
