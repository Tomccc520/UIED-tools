/**
 * @file vite.config.ts
 * @description Vite 配置文件，包含开发服务器代理配置
 * @author UIED技术团队
 * @copyright UIED技术团队 (https://fsuied.com)
 *
 * API 代理配置说明:
 * 1. 翻译接口 (/api/translate)
 *    - 目标地址: https://suapi.net/api/text/translate
 *    - 用途: 文本翻译服务
 *    - 请求方式: POST
 *    - 响应格式: JSON
 *
 * 2. KFC文案 (/api/kfc)
 *    - 目标地址: https://tools.mgtv100.com/external/v1/pear/kfc
 *    - 用途: 生成KFC文案
 *    - 请求方式: GET
 *    - 响应格式: JSON
 *    - 特殊请求头: Origin, Referer
 *
 * 3. 情话文案 (/api/wenan)
 *    - 目标地址: https://api.uomg.com/api/rand.qinghua
 *    - 用途: 随机生成情话文案
 *    - 请求方式: GET
 *    - 响应格式: JSON
 *
 * 4. 一言接口 (/api/yiyan)
 *    - 目标地址: https://api.52vmy.cn/api/wl/yan/yiyan
 *    - 用途: 随机一言生成
 *    - 请求方式: GET
 *    - 响应格式: JSON
 *
 * 5. 壁纸接口 (/api/wallpaper)
 *    - 目标地址: https://api.52vmy.cn/api/img/tu/pc
 *    - 用途: 获取随机壁纸
 *    - 请求方式: GET
 *    - 响应格式: JSON
 *    - 特殊请求头: Origin, Referer
 *
 * 6. 爱情公寓台词 (/api/aqgy)
 *    - 目标地址: https://api.tangdouz.com/aqgy.php
 *    - 用途: 获取随机爱情公寓台词
 *    - 请求方式: GET
 *    - 响应格式: text/plain
 *    - 特殊请求头: Origin, Referer
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// 环境变量配置
const isProd = process.env.NODE_ENV === 'production'
const BASE_API = isProd ? '' : ''  // 移除生产环境的基础URL

export default defineConfig({
  plugins: [
    vue(),
    // 添加Node.js polyfills
    nodePolyfills({
      // 是否添加全局的process/buffer/global对象
      globals: {
        process: true,
        Buffer: true,
        global: true,
      },
      // 是否polyfill特定的模块
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
    // 添加 .mjs 扩展名支持
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  optimizeDeps: {
    include: [
      'element-plus/es',
      'element-plus/es/components/steps/style/css',
      'element-plus/es/components/button/style/css',
      'element-plus/es/components/input/style/css',
      'element-plus/es/components/slider/style/css',
      'element-plus/es/components/switch/style/css'
    ]
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  },
  // 生产环境基础路径配置
  base: '/',

  // 为Node.js模块提供polyfill
  define: {
    // 为svgo提供process.env.NODE_ENV
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 使用 terser 进行更安全的代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      // 添加更多配置以避免变量访问问题
      mangle: {
        safari10: true
      },
      format: {
        comments: false,
        safari10: true
      }
    },
    // CSS 代码分割
    cssCodeSplit: true,
    // 小于此阈值的导入或引用资源将内联为 base64 编码
    assetsInlineLimit: 4096,
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      // 确保 Vue 相关的包能够正确被引用
      external: [],
      output: {
        // 解决代码分割问题
        manualChunks: {
          'vendor-vue': ['vue', '@vue/runtime-core', '@vue/reactivity', '@vue/shared'],
          'vendor-element-plus': ['element-plus']
        }
      }
    },
    // 修改 sourcemap 配置
    sourcemap: process.env.NODE_ENV === 'development',
    // 调整警告阈值
    chunkSizeWarningLimit: 2000
  },

  // 开发服务器配置
  server: {
    host: true,
    port: 5173,
    proxy: {
      // 翻译接口代理配置
      '/api/translate': {
        target: 'https://suapi.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/translate/, '/api/text/translate'),
        secure: false
      },

      // KFC文案接口代理配置
      '/api/kfc': {
        target: 'https://tools.mgtv100.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kfc/, '/external/v1/pear/kfc'),
        secure: false,
        headers: {
          'Origin': 'https://tools.mgtv100.com',
          'Referer': 'https://tools.mgtv100.com/'
        }
      },

      // 情话文案接口代理配置
      '/api/wenan': {
        target: 'https://api.uomg.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wenan/, '/api/rand.qinghua'),
        secure: false
      },

      // 一言接口代理配置
      '/api/yiyan': {
        target: 'https://api.52vmy.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yiyan/, '/api/wl/yan/yiyan'),
        secure: false
      },

      // 壁纸接口代理配置
      '/api/wallpaper': {
        target: 'https://api.52vmy.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wallpaper/, '/api/img/tu/pc'),
        secure: false,
        headers: {
          'Origin': 'https://api.52vmy.cn',
          'Referer': 'https://api.52vmy.cn/'
        }
      },

      // 爱情公寓台词接口代理配置
      '/api/aqgy': {
        target: 'https://api.tangdouz.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aqgy/, '/aqgy.php'),
        secure: false,
        headers: {
          'Origin': 'https://api.tangdouz.com',
          'Referer': 'https://api.tangdouz.com/'
        }
      },

      // 聚合热榜接口代理配置
      '/api/hotlist': {
        target: 'https://api.vvhan.com',
        changeOrigin: true,
        rewrite: (path) => '/api/hotlist/all',
        secure: false,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://api.vvhan.com',
          'Referer': 'https://api.vvhan.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      },

      // 热榜聚合接口代理配置
      '/api/dailyhot': {
        target: 'https://api.pearktrue.cn',
        changeOrigin: true,
        rewrite: (path) => path,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      // UIED 热榜接口代理配置
      '/api/uied': {
        target: 'https://www.uied.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/uied/, '/wp-json/wp/v2'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      // SiliconFlow Chat API 代理配置
      '/api/v1/chat/completions': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => '/v1/chat/completions',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://api.siliconflow.cn',
          'Referer': 'https://api.siliconflow.cn/',
          'Host': 'api.siliconflow.cn',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Origin': '*'
        }
      },

      // SiliconFlow Embeddings API 代理配置
      '/api/v1/embeddings': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1\/embeddings/, '/v1/embeddings'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      // SiliconFlow API 代理配置
      '/api/siliconflow': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/siliconflow/, ''),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      // SiliconFlow 知识库 API 代理配置
      '/api/v1/knowledge': {
        target: 'https://api.siliconflow.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1\/knowledge/, '/v1/knowledge'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://api.siliconflow.cn',
          'Referer': 'https://api.siliconflow.cn/',
          'Host': 'api.siliconflow.cn'
        }
      },

      // 本地后端API代理配置
      '/api': {
        target: 'http://localhost:8848', // 你的后端服务地址
        changeOrigin: true,
        // 如果后台接口没有/api前缀，可以取消下面注释来重写路径
        // rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      // 添加favorites的代理配置
      '/api/favorites': {
        target: 'https://www.88sheji.cn',  // 替换为你的实际API地址
        changeOrigin: true,
        rewrite: (path) => path,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      },

      '/36kr-proxy': {
        target: 'https://36kr.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/36kr-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://36kr.com',
          'Origin': 'https://36kr.com',
          'Host': '36kr.com'
        }
      },

      '/rss-proxy': {
        target: 'https://www.ithome.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.ithome.com',
          'Origin': 'https://www.ithome.com',
          'Host': 'www.ithome.com'
        }
      },

      '/ifanr-proxy': {
        target: 'https://www.ifanr.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ifanr-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.ifanr.com'
        }
      },

      '/geekpark-proxy': {
        target: 'https://www.geekpark.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/geekpark-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.geekpark.net'
        }
      },

      '/pingwest-proxy': {
        target: 'https://www.pingwest.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pingwest-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.pingwest.com'
        }
      },

      '/jiejing-proxy': {
        target: 'https://www.jiejingtech.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jiejing-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.jiejingtech.com'
        }
      },

      '/cnbeta-proxy': {
        target: 'https://www.cnbeta.com.tw',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cnbeta-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.cnbeta.com.tw'
        }
      },

      '/oschina-proxy': {
        target: 'https://www.oschina.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oschina-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.oschina.net'
        }
      },

      '/infoq-proxy': {
        target: 'https://www.infoq.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/infoq-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.infoq.cn'
        }
      },

      '/readhub-proxy': {
        target: 'https://readhub.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/readhub-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://readhub.cn'
        }
      },

      '/sspai-proxy': {
        target: 'https://sspai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sspai-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://sspai.com',
          'Origin': 'https://sspai.com',
          'Host': 'sspai.com'
        }
      },

      '/jqzx-proxy': {
        target: 'https://www.jiqizhixin.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jqzx-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.jiqizhixin.com/rss',
          'Origin': 'https://www.jiqizhixin.com',
          'Host': 'www.jiqizhixin.com',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        }
      },

      '/uied-proxy': {
        target: 'https://uied.cn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/uied-proxy/, ''),
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Cache-Control': 'no-cache'
        }
      },

      '/quantumu-proxy': {
        target: 'https://www.qbitai.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/quantumu-proxy/, ''),
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.qbitai.com',
          'Origin': 'https://www.qbitai.com',
          'Host': 'www.qbitai.com'
        },
        configure: (proxy, options) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
          });
        }
      },

      // RSS 源代理配置
      '/api/rss/36kr': {
        target: 'https://36kr.com',
        changeOrigin: true,
        rewrite: () => '/feed-newsflash',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      '/api/rss/ithome': {
        target: 'https://www.ithome.com',
        changeOrigin: true,
        rewrite: () => '/rss',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      '/api/rss/sspai': {
        target: 'https://sspai.com',
        changeOrigin: true,
        rewrite: () => '/feed',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      '/api/rss/jqzx': {
        target: 'https://www.jiqizhixin.com',
        changeOrigin: true,
        rewrite: () => '/rss',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      '/api/rss/uied': {
        target: 'https://www.uied.cn',
        changeOrigin: true,
        rewrite: () => '/feed',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      '/api/rss/quantumu': {
        target: 'https://www.qbitai.com',
        changeOrigin: true,
        rewrite: () => '/feed',
        headers: {
          'Accept': 'application/xml, text/xml, application/rss+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)'
        }
      },
      // 图片代理配置
      '/image-proxy': {
        target: 'https://images.weserv.nl',
        changeOrigin: true,
        rewrite: (path) => {
          const url = path.replace('/image-proxy/', '');
          return `/?url=${url}`;
        },
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      }
    },
    fs: {
      // 允许服务器访问父级目录
      strict: false,
      // 允许的文件类型
      allow: ['..']
    }
  }
})
