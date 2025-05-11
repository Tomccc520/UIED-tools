//通过vue-router插件实现模板路由配置
import { createRouter, createWebHistory } from 'vue-router'
import { constantRoute } from './router'

//创建路由器
const router = createRouter({
  //路由模式hash
  // history: createWebHashHistory(),
  history: createWebHistory(),
  routes: [
    ...constantRoute
  ],
  //滚动行为
  scrollBehavior() {
    return {
      left: 0,
      top: 0,
    }
  },
})

// _form: '_'表示占位变量，可以不被使用
router.beforeEach((to, from, next) => {
  // 处理标题
  if (to.meta.title && to.meta.title != '') {
    let oldTitle = document.title
    document.title = <string>to.meta.title + '-' + oldTitle
  }
  next()
})

//路由后置卫士
router.afterEach((to) => {
  //填充mate元信息
  const { title, keywords, description, image } = to.meta
  //详情页标题
  const detailTitle = title
  //设置title
  if (detailTitle) {
    document.title = detailTitle + '-' + import.meta.env.VITE_APP_TITLE
  } else {
    document.title = import.meta.env.VITE_APP_TITLE + '-' + import.meta.env.VITE_APP_DESC
  }

  // 默认站点信息
  const defaultTitle = import.meta.env.VITE_APP_TITLE
  const defaultDescription = import.meta.env.VITE_APP_DESC || 'UIED免费在线工具大全'
  const defaultKeywords = '免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜,AI工具网站排名,AI工具网站推荐,AI工具网站排行榜,AI工具网站排名,AI工具网站推荐,AI工具网站排行榜,AI工具网站排名'
  const defaultImage = '/logo.png' // 默认分享图片
  const siteUrl = import.meta.env.VITE_APP_URL || window.location.origin
  const currentUrl = window.location.href
  const pageTitle = document.title

  // 设置基础meta标签
  document.querySelector('meta[name="keywords"]')?.setAttribute("content", `${keywords || defaultKeywords}`)
  document.querySelector('meta[name="description"]')?.setAttribute("content", `${description || defaultDescription}`)

  // 设置Open Graph meta标签
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${pageTitle}`)
  document.querySelector('meta[property="og:site_name"]')?.setAttribute("content", `${defaultTitle}`)
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", `${description || defaultDescription}`)
  document.querySelector('meta[property="og:type"]')?.setAttribute("content", 'website')
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${currentUrl}`)
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", `${siteUrl}${image || defaultImage}`)

  // 设置Twitter Cards meta标签
  document.querySelector('meta[name="twitter:card"]')?.setAttribute("content", 'summary_large_image')
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", `${pageTitle}`)
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", `${description || defaultDescription}`)
  document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", `${siteUrl}${image || defaultImage}`)

  // 设置标准的规范链接
  let canonicalElement = document.querySelector('link[rel="canonical"]')
  if (!canonicalElement) {
    canonicalElement = document.createElement('link')
    canonicalElement.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalElement)
  }
  canonicalElement.setAttribute('href', currentUrl)
})

export default router
