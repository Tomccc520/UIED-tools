import vitePluginSeoPrerender from "vite-plugin-seo-prerender";

interface SeoOptions {
  routes?: string[];
  headOptions?: {
    title?: string;
    meta?: Array<{
      name: string;
      content: string;
    }>;
  };
}

export function seoperender(options?: SeoOptions) {
  const filterPath = ['/:pathMatch(.*)*', '/404']; // 排除的路径
  const routes = options?.routes || [
    '/',
    '/about',
    '/tools/image-compress',
    '/tools/image-crop',
    '/tools/img-cut',
    '/tools/img-format',
    '/tools/img-to-pdf',
    '/tools/pdf-to-images'
  ];

  return vitePluginSeoPrerender({
    routes: routes.filter(path => !filterPath.includes(path)),
    network: true,
    headOptions: options?.headOptions
  })
}