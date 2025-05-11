declare module 'vite-plugin-seo-prerender' {
  interface PreRenderOptions {
    routes: string[];
    network?: boolean;
    headOptions?: {
      title?: string;
      meta?: Array<{
        name: string;
        content: string;
      }>;
    };
  }
  
  export default function vitePluginSeoPrerender(options: PreRenderOptions): any;
} 