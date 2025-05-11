/**
 * 声明svgo模块的类型
 */
declare module 'svgo' {
  /**
   * 自定义插件
   */
  export interface CustomPlugin {
    name: string;
    params?: any;
    fn?: (ast: any, params: any, info: any) => any;
  }

  /**
   * 插件配置
   */
  export type PluginConfig =
    | string
    | { name: string; params?: any; active?: boolean }
    | CustomPlugin
    | [string, any];

  /**
   * 优化选项
   */
  export interface OptimizeOptions {
    /** 插件配置 */
    plugins?: PluginConfig[];
    /** 路径前缀 */
    path?: string;
    /** 是否保留ID */
    multipass?: boolean;
    /** 精度 */
    floatPrecision?: number;
    /** 是否启用数据URI */
    datauri?: 'base64' | 'enc' | 'unenc';
  }

  /**
   * 优化结果
   */
  export interface OptimizedSvg {
    /** 优化后的SVG数据 */
    data: string;
    /** 信息对象 */
    info: {
      /** 原始宽度 */
      width?: string;
      /** 原始高度 */
      height?: string;
    };
  }

  /**
   * 优化SVG
   * @param svg 输入的SVG字符串
   * @param options 优化选项
   * @returns 优化后的SVG结果
   */
  export function optimize(svg: string, options?: OptimizeOptions): OptimizedSvg;
}
