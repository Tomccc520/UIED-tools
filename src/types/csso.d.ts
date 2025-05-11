declare module 'csso' {
  interface MinifyOptions {
    restructure?: boolean;
    comments?: boolean;
  }

  interface MinifyResult {
    css: string;
    map?: any;
  }

  export function minify(css: string, options?: MinifyOptions): MinifyResult;
}
