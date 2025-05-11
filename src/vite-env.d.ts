/// <reference types="vite/client" />
/// <reference path="./types/vue-cropperjs.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'upng-js' {
  export function encode(
    imgs: ArrayBuffer[],
    w: number,
    h: number,
    cnum?: number,
    dels?: number[]
  ): Uint8Array;

  export function decode(buffer: ArrayBuffer): {
    width: number;
    height: number;
    data: Uint8Array;
    depth: number;
    ctype: number;
    frames: number;
  };
}

interface Window {
  pdfjsLib: any
}
