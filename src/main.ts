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
//echarts
import * as echarts from 'echarts'
// 导入调试工具
import { debugLog, isDev } from './utils/debug'

const app = createApp(App)
//安装仓库
app.use(pinia)
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})
setupMdEditor(app)
//全局挂载echarts
app.config.globalProperties.$echarts = echarts

// 路由守卫，动态更新页面标题和 meta 信息
router.beforeEach((to, from, next) => {
  // 更新标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - UIED Tools`
  } else {
    document.title = 'UIED Tools - 免费在线工具集合'
  }

  // 更新 meta 描述
  const descriptionMeta = document.querySelector('meta[name="description"]')
  if (descriptionMeta && to.meta.description) {
    descriptionMeta.setAttribute('content', to.meta.description as string)
  }

  // 更新 meta 关键词
  const keywordsMeta = document.querySelector('meta[name="keywords"]')
  if (keywordsMeta && to.meta.keywords) {
    keywordsMeta.setAttribute('content', to.meta.keywords as string)
  }

  next()
})

// 在应用启动时打印环境信息
isDev ?
  debugLog('应用运行在开发环境，调试信息将会显示') :
  debugLog('应用运行在生产环境，调试信息已禁用')

app.mount('#app')
