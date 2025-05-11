declare module '@mediapipe/selfie_segmentation' {
  export interface SelfieSegmentationOptions {
    modelSelection: number;
    selfieMode: boolean;
  }

  export interface SegmentationResults {
    segmentationMask: HTMLCanvasElement | null;
    image: HTMLCanvasElement | null;
  }

  export class SelfieSegmentation {
    constructor(options?: { locateFile?: (file: string) => string });
    setOptions(options: SelfieSegmentationOptions): Promise<void>;
    initialize(): Promise<void>;
    send(config: { image: HTMLImageElement }): Promise<SegmentationResults>;
    close(): Promise<void>;
  }
}
