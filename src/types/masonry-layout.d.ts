declare module 'masonry-layout' {
  interface MasonryOptions {
    itemSelector: string;
    columnWidth: string | number;
    gutter?: number;
    percentPosition?: boolean;
    horizontalOrder?: boolean;
    fitWidth?: boolean;
    originLeft?: boolean;
    originTop?: boolean;
    stamp?: string;
    transitionDuration?: string | number;
    stagger?: string | number;
    resize?: boolean;
    initLayout?: boolean;
  }

  class Masonry {
    constructor(element: Element | string, options?: MasonryOptions);
    layout(): void;
    reloadItems(): void;
    destroy(): void;
    getItemElements(): Element[];
    once(eventName: string, callback: () => void): void;
    off(eventName: string, callback: () => void): void;
    on(eventName: string, callback: () => void): void;
  }

  export = Masonry;
}
