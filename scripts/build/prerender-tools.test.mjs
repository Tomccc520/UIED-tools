/**
 * @description 工具首个 HTML 回归，防止空 SPA、首页 canonical 或全站文案被误当预渲染成功。
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validatePrerenderHtml, validatePrerenderRoutes } from './prerender-tools.mjs'

const route = { path: '/tools/qrcode', readySelector: 'textarea[aria-label="二维码内容"]', headingIncludes: '二维码' }
const seo = { title: '免费二维码生成器', description: '在线生成网址和文本二维码，支持自定义尺寸与样式。' }

/** 函数说明：构造含真实工具输入区、说明与独立元数据的 HTML 夹具。 */
const fixture = () => `<!doctype html><html lang="zh-CN"><head>
<title>${seo.title} - UIED-Tools</title><meta name="description" content="${seo.description}">
<meta name="robots" content="index,follow"><meta property="og:url" content="https://uiedtool.com/tools/qrcode">
<link rel="canonical" href="https://uiedtool.com/tools/qrcode"></head><body><div id="app">
<main class="uied-tool-view"><h1>免费二维码生成</h1><textarea aria-label="二维码内容"></textarea>
<p>${'输入网址或文本后选择尺寸和纠错级别，点击生成二维码，再按需要下载图片。'.repeat(5)}</p>
</main></div></body></html>`

test('首个 HTML 必须具备当前工具正文、H1、输入区和独立 SEO', () => {
  const result = validatePrerenderHtml(fixture(), route, seo, 'https://uiedtool.com')
  assert.equal(result.heading, '免费二维码生成')
  assert.equal(result.canonical, 'https://uiedtool.com/tools/qrcode')
  assert.ok(result.bodyTextLength > 100)
})

test('空 SPA、错误工具或未就绪表单均不能通过构建验收', () => {
  assert.throws(() => validatePrerenderHtml('<div id="app"></div>', route, seo, 'https://uiedtool.com'), /正文/)
  assert.throws(() => validatePrerenderHtml(fixture().replace('免费二维码生成</h1>', '首页</h1>'), route, seo, 'https://uiedtool.com'), /正文/)
  assert.throws(() => validatePrerenderHtml(fixture().replace('aria-label="二维码内容"', 'aria-label="其他"'), route, seo, 'https://uiedtool.com'), /正文/)
})

test('文档标题只读取 head，不混入图标 SVG 的 title，也不允许正文标题冒充元数据', () => {
  const html = fixture().replace('</main>', '<svg><title>图标标题</title></svg></main>')
  assert.equal(validatePrerenderHtml(html, route, seo, 'https://uiedtool.com').title, `${seo.title} - UIED-Tools`)
  assert.throws(() => validatePrerenderHtml(html.replace(`<title>${seo.title} - UIED-Tools</title>`, ''), route, seo, 'https://uiedtool.com'), /SEO/)
})

test('首页 canonical、全站标题描述或 noindex 必须导致预渲染失败', () => {
  for (const html of [
    fixture().replace('rel="canonical" href="https://uiedtool.com/tools/qrcode"', 'rel="canonical" href="https://uiedtool.com/"'),
    fixture().replace(`<title>${seo.title} - UIED-Tools</title>`, '<title>UIED免费在线工具大全</title>'),
    fixture().replace(`content="${seo.description}"`, 'content="全站介绍"'),
    fixture().replace('content="index,follow"', 'content="noindex,nofollow"')
  ]) assert.throws(() => validatePrerenderHtml(html, route, seo, 'https://uiedtool.com'))
})

test('清单拒绝重复、跳转注入路径及缺少独立 SEO 的页面', () => {
  assert.doesNotThrow(() => validatePrerenderRoutes([route], { [route.path]: seo }))
  assert.throws(() => validatePrerenderRoutes([route, route], { [route.path]: seo }), /重复/)
  assert.throws(() => validatePrerenderRoutes([{ ...route, path: '/tools/../secret' }], {}), /无效/)
  assert.throws(() => validatePrerenderRoutes([route], {}), /独立 SEO/)
})
