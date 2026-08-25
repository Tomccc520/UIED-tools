import { fileURLToPath, URL } from 'url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const proxyTarget = env.VITE_APP_PROXY_TARGET || 'http://127.0.0.1:8003'
    const publicPath =
        env.VITE_APP_PUBLIC_PATH || (mode === 'production' ? '/admin/' : '/')

    return {
        base: publicPath,
        server: {
            host: '0.0.0.0',
            /**
             * 函数说明：开发环境统一走本地代理，避免浏览器直连 8003 导致跨域报错。
             */
            proxy: {
                '/api': {
                    target: proxyTarget,
                    changeOrigin: true
                }
            }
        },
        plugins: [
            vue(),
            vueJsx(),
            AutoImport({
                imports: ['vue', 'vue-router'],
                resolvers: [ArcoResolver()],
                eslintrc: {
                    enabled: true
                }
            }),
            Components({
                directoryAsNamespace: true,
                resolvers: [ArcoResolver({ sideEffect: true })]
            }),
            createSvgIconsPlugin({
                // 配置路劲在你的src里的svg存放文件
                iconDirs: [fileURLToPath(new URL('./src/assets/icons', import.meta.url))],
                symbolId: 'local-icon-[dir]-[name]'
            }),
            vueSetupExtend()
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        build: {
            rollupOptions: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString()
                    }
                }
            }
        }
    }
})
