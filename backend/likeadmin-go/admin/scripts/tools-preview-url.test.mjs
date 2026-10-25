/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-25
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/views/setting/website/composables/use-preview-url.ts', import.meta.url), 'utf8')

/** 按指定运行环境加载真实预览函数，隔离浏览器全局和 Vite 环境变量，不改写业务逻辑。 */
const loadResolver = async ({ origin = 'http://localhost:5180', development = true, previewUrl = '' } = {}) => {
    const location = new URL('/admin/official_site/tools_catalog', origin)
    const runtimeSource = source
        .replace(/import\.meta\.env/g, JSON.stringify({ DEV: development, VITE_TOOLS_PREVIEW_URL: previewUrl }))
        .replace(/window\.location/g, JSON.stringify({
            origin: location.origin, hostname: location.hostname, port: location.port,
            protocol: location.protocol, href: location.href
        }))
    const compiled = ts.transpileModule(runtimeSource, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
    }).outputText
    return (await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)).resolveToolsPreviewUrl
}

test('开发后台默认预览切到 5179，并保留工具路径、查询与锚点', async () => {
    const resolve = await loadResolver()
    assert.equal(resolve({}), 'http://localhost:5179/')
    assert.equal(resolve('/tools/ai/deepseek?mode=chat#input'), 'http://localhost:5179/tools/ai/deepseek?mode=chat#input')
    assert.equal(resolve({}, '/tools/ai/deepseek?mode=chat#input'), 'http://localhost:5179/tools/ai/deepseek?mode=chat#input')
})

test('开发端口回退只匹配本机 5180，不影响其他端口、远端或生产', async () => {
    for (const origin of ['http://127.0.0.1:5180', 'http://[::1]:5180']) {
        const resolve = await loadResolver({ origin })
        assert.equal(new URL(resolve('/tools/qrcode')).port, '5179')
        assert.equal(new URL(resolve('/tools/qrcode')).hostname, new URL(origin).hostname)
    }
    for (const options of [
        { origin: 'http://localhost:5181' },
        { origin: 'http://admin.example.com:5180' },
        { origin: 'http://localhost:5180', development: false }
    ]) {
        const resolve = await loadResolver(options)
        assert.equal(resolve('/tools/qrcode'), `${options.origin}/tools/qrcode`)
    }
})

test('生产后台部署在 admin 子路径时，预览仍从同域主站根路径进入', async () => {
    const resolve = await loadResolver({ origin: 'https://uiedtool.com', development: false })
    assert.equal(resolve({}), 'https://uiedtool.com/')
    assert.equal(resolve({}, '/tools/qrcode?text=hello#preview'), 'https://uiedtool.com/tools/qrcode?text=hello#preview')
})

test('有效环境预览地址优先于后台地址，后台别名和相对部署路径继续可用', async () => {
    const resolve = await loadResolver({ previewUrl: 'https://preview.example.com/app/' })
    assert.equal(resolve({ webUrl: 'https://configured.example.com/' }, 'tools/qrcode?text=hello'), 'https://preview.example.com/app/tools/qrcode?text=hello')
    const configured = await loadResolver()
    for (const key of ['webUrl', 'web_url', 'web']) {
        assert.equal(configured({ [key]: 'https://tools.example.com/' }, '/tools/qrcode'), 'https://tools.example.com/tools/qrcode')
    }
    assert.equal(configured({ webUrl: '/frontend/' }, 'tools/qrcode'), 'http://localhost:5180/frontend/tools/qrcode')
})

test('无效预览配置不能执行危险协议，且仍尝试有效后台配置', async () => {
    const configured = await loadResolver({ previewUrl: 'javascript:alert(1)' })
    assert.equal(configured({ webUrl: 'https://tools.example.com' }, '/tools/qrcode'), 'https://tools.example.com/tools/qrcode')
    const resolve = await loadResolver()
    for (const webUrl of ['javascript:alert(1)', 'data:text/html,x', 'file:///tmp/page', 'https://', 'https://user:pass@tools.example.com/']) {
        assert.equal(resolve({ webUrl }, '/tools/qrcode'), 'http://localhost:5179/tools/qrcode')
    }
    assert.equal(resolve({ webUrl: 'javascript:alert(1)', web_url: 'https://tools.example.com' }), 'https://tools.example.com/')
})

test('预览目标只允许 HTTP 页面，非法目标回到安全主站且保留合法外链', async () => {
    const resolve = await loadResolver()
    for (const path of ['javascript:alert(1)', 'data:text/html,x', 'file:///tmp/page', 'https://']) {
        assert.equal(resolve(path), 'http://localhost:5179/')
    }
    assert.equal(resolve('https://external.example.com/tool?q=one#result'), 'https://external.example.com/tool?q=one#result')
})
