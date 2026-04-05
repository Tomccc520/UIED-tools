import { createApp } from '@vue/runtime-dom'
import App from './App.vue'
import ElementPlus from 'element-plus';
//@ts-ignore忽略当前文件ts类型的检测否则有红色提示(打包会失败)
//入口文件main.ts全局安装element-plus,element-plus默认支持语言英语设置为中文
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
//router
import router from './router'
//styles
import './styles/tailwind.css'
//element-plus css
import 'element-plus/dist/index.css'
//pinia
import pinia from './store'
//v-md-editor
import { setupMdEditor } from './plugins/v-md-editor'
//default-passive-events
import 'default-passive-events'
// 导入调试工具
import { debugLog, isDev } from './utils/debug'
import { ensureFreeToolTitle } from './utils/string'
import { applyRouteSeoFallback } from './services/siteSeo'
import { warmupSitePublicConfig } from './services/siteConfig'

const app = createApp(App)
//安装仓库
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
setupMdEditor(app)
// 挂载全局模板方法：仅用于工具页面内部标题展示
app.config.globalProperties.$ensureFreeToolTitle = ensureFreeToolTitle

// 路由守卫：先用本地兜底 SEO 立即更新页面，再由 router.afterEach 异步套用后台配置
router.beforeEach((to, _from, next) => {
  applyRouteSeoFallback(to)
  next()
})

// 在应用启动时打印环境信息
isDev ?
  debugLog('应用运行在开发环境，调试信息将会显示') :
  debugLog('应用运行在生产环境，调试信息已禁用')

// 预热站点公共配置缓存，减少首次进入工具页时的 SEO 回填等待
void warmupSitePublicConfig()

app.mount('#app')
