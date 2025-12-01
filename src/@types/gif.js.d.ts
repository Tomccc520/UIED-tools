declare module 'gif.js' {
  import { EventEmitter } from 'events';

  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    transparent?: string | number;
    dither?: boolean | string;
    debug?: boolean;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    disposal?: number;
  }

  class GIF extends EventEmitter {
    constructor(options?: GIFOptions);
    addFrame(image: HTMLImageElement | HTMLCanvasElement | CanvasRenderingContext2D | ImageData, options?: AddFrameOptions): void;
    render(): void;
    abort(): void;
    on(event: 'finished', listener: (blob: Blob, data: Uint8Array) => void): this;
    on(event: 'start' | 'abort', listener: () => void): this;
    on(event: 'progress', listener: (percent: number) => void): this;
  }

  export = GIF;
}
