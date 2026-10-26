/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { computed, reactive, ref } from 'vue'

/** 仅加载真实素材组件的配置与附件保存函数，接口均替换为可控内存边界。 */
const createSubject = () => {
    const source = fs
        .readFileSync(new URL('../src/components/material/index.vue', import.meta.url), 'utf8')
        .match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile(
        'material.ts',
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    const names = new Set([
        'compressConfigVisible',
        'compressConfigSaving',
        'compressConfigLoaded',
        'compressConfigLoading',
        'compressConfigError',
        'compressConfigSaveError',
        'compressConfigBaseline',
        'compressConfigForm',
        'normalizeCompressConfig',
        'loadCompressConfig',
        'retryCompressConfig',
        'openCompressConfigModal',
        'canCloseCompressConfig',
        'closeCompressConfig',
        'patchCompressConfig',
        'saveCompressConfig',
        'materialMetaForm',
        'materialMetaSaving',
        'patchMaterialMeta',
        'saveMaterialMeta'
    ])
    const statements = parsed.statements.filter(
        (statement) =>
            (ts.isVariableStatement(statement) &&
                statement.declarationList.declarations.some((item) =>
                    names.has(item.name.getText(parsed))
                )) ||
            (ts.isIfStatement(statement) &&
                statement.expression.getText(parsed) === "props.mode === 'page'")
    )
    const calls = {
        reads: 0,
        lists: 0,
        saves: [],
        metadata: [],
        success: [],
        errors: [],
        confirms: 0,
        syncs: 0
    }
    const io = {
        read: async () => ({
            enabled: 0,
            minSizeKB: 0,
            jpegQuality: 81,
            pngCompressionLevel: 'speed'
        }),
        save: async () => {},
        confirm: async () => {},
        meta: async (payload) => ({ ...payload })
    }
    const activeMaterial = ref({ id: 1 })
    const pager = reactive({
        lists: [
            { id: 1, title: 'A' },
            { id: 2, title: 'B' }
        ]
    })
    const mounted = []
    const bindings = {
        exports: {},
        reactive,
        ref,
        props: { type: 'image', mode: 'page' },
        activeMaterial,
        pager,
        isProcessingFiles: ref(false),
        onMounted: (callback) => mounted.push(callback),
        getData: async () => {
            calls.lists++
        },
        fileCompressConfigDetail: async () => {
            calls.reads++
            return io.read()
        },
        fileCompressConfigSave: async (payload) => {
            calls.saves.push(structuredClone(payload))
            return io.save(payload)
        },
        fileMetaSave: async (payload) => {
            calls.metadata.push(structuredClone(payload))
            return io.meta(payload)
        },
        feedback: {
            confirm: async () => {
                calls.confirms++
                return io.confirm()
            }
        },
        Message: {
            success: (text) => calls.success.push(text),
            error: (text) => calls.errors.push(text),
            warning() {}
        },
        syncMetaFormByActive: () => {
            calls.syncs++
        }
    }
    const context = vm.createContext(bindings)
    const code =
        statements.map((item) => item.getText(parsed)).join('\n') +
        '\nthis.subject = {' +
        [...names].join(',') +
        '};'
    vm.runInContext(
        ts.transpileModule(code, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
        }).outputText,
        context
    )
    return {
        page: context.subject,
        calls,
        io,
        activeMaterial,
        pager,
        mounted,
        processing: bindings.isProcessingFiles
    }
}

/** 运行实际展示组件的字段和动作处理函数，父级属性作为可替换的唯一数据源。 */
const createPanel = (file, props, exposure) => {
    const source = fs
        .readFileSync(new URL(`../src/components/material/${file}`, import.meta.url), 'utf8')
        .match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1]
    const parsed = ts.createSourceFile(
        'panel.ts',
        source,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    const code =
        parsed.statements
            .filter((item) => !ts.isImportDeclaration(item))
            .map((item) => item.getText(parsed))
            .join('\n') + `\nthis.subject = {${exposure}};`
    const events = []
    const context = vm.createContext({
        exports: {},
        computed,
        defineProps: () => props,
        defineEmits:
            () =>
            (...event) =>
                events.push(event)
    })
    vm.runInContext(
        ts.transpileModule(code, {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS }
        }).outputText,
        context
    )
    return { panel: context.subject, events }
}

test('图片素材页首屏不预读压缩策略，首次打开才读取，成功后重新打开复用配置和未保存草稿', async () => {
    const { page, calls, mounted } = createSubject()
    for (const mount of mounted) await mount()
    assert.equal(calls.lists, 1)
    assert.equal(calls.reads, 0)
    assert.equal(page.compressConfigLoaded.value, false)
    await page.openCompressConfigModal()
    assert.equal(calls.reads, 1)
    assert.equal(page.compressConfigForm.minSizeKB, 0)
    page.patchCompressConfig({ minSizeKB: 0, jpegQuality: 96 })
    assert.equal(page.closeCompressConfig(), true)
    await page.openCompressConfigModal()
    assert.equal(calls.reads, 1)
    assert.equal(page.compressConfigForm.jpegQuality, 96)
    assert.equal(page.compressConfigVisible.value, true)
})

test('压缩子弹窗只发字段补丁和动作，读取失败或保存中不能编辑、保存、重读及关闭', () => {
    const props = reactive({
        modelValue: {
            enabled: true,
            minSizeKB: 300,
            jpegQuality: 82,
            pngCompressionLevel: 'default'
        },
        loading: false,
        saving: false,
        loaded: false,
        error: '',
        saveError: ''
    })
    const { panel, events } = createPanel(
        'compress-config-dialog.vue',
        props,
        'patch,requestSave,requestClose,requestRetry'
    )
    panel.patch('minSizeKB', 0)
    panel.requestSave()
    assert.equal(events.length, 0)
    props.loaded = true
    panel.patch('minSizeKB', 0)
    assert.equal(events[0][0], 'patch')
    assert.equal(events[0][1].minSizeKB, 0)
    assert.equal(props.modelValue.minSizeKB, 300)
    props.error = '读取失败'
    panel.patch('jpegQuality', 90)
    panel.requestSave()
    assert.equal(events.length, 1)
    props.error = ''
    props.saving = true
    panel.requestRetry()
    panel.requestSave()
    panel.patch('enabled', false)
    assert.equal(panel.requestClose(), false)
    assert.equal(events.length, 1)
    props.saving = false
    panel.requestSave()
    panel.requestRetry()
    assert.equal(panel.requestClose(), true)
    assert.deepEqual(
        events.slice(1).map((item) => item[0]),
        ['save', 'retry', 'close']
    )
})

test('附件展示切换为B后读取B的详情与复制地址，编辑补丁不直接更改父级草稿', () => {
    const props = reactive({
        material: { id: 1, name: 'A', uri: '/A.png', width: 100, height: 50 },
        modelValue: { title: 'A草稿', bindId: 0, bindType: '', bindTitle: '', bindUrl: '' },
        disabled: false
    })
    const { panel, events } = createPanel(
        'metadata-panel.vue',
        props,
        'patch,requestCopy,metadata,hasBinding'
    )
    panel.patch('title', '新标题')
    assert.equal(props.modelValue.title, 'A草稿')
    assert.equal(events[0][1].title, '新标题')
    assert.equal(panel.metadata.value.find((item) => item.label === '分辨率').value, '100×50 像素')
    props.material = { id: 2, name: 'B', uri: '/B.png', resolution: '200×200 像素' }
    props.modelValue = { title: 'B草稿', bindId: 7, bindType: 'tool', bindTitle: '', bindUrl: '' }
    assert.equal(panel.metadata.value.find((item) => item.label === '文件名').value, 'B')
    assert.equal(panel.hasBinding.value, true)
    panel.requestCopy()
    assert.deepEqual(events[1], ['copy', '/B.png'])
    props.disabled = true
    panel.patch('title', '不应接受')
    panel.requestCopy()
    assert.equal(events.length, 2)
})

test('父级附件编辑门禁阻止文件操作期间改写草稿，压缩读取和保存锁同样保护字段补丁', async () => {
    const { page, processing } = createSubject()
    page.patchMaterialMeta({ title: '允许编辑' })
    processing.value = true
    page.patchMaterialMeta({ title: '被拦截' })
    assert.equal(page.materialMetaForm.title, '允许编辑')
    page.patchCompressConfig({ minSizeKB: 0 })
    assert.equal(page.compressConfigForm.minSizeKB, 300)
    await page.openCompressConfigModal()
    page.patchCompressConfig({ minSizeKB: 0, jpegQuality: 95 })
    assert.equal(page.compressConfigForm.jpegQuality, 95)
    page.compressConfigSaving.value = true
    page.patchCompressConfig({ jpegQuality: 88 })
    assert.equal(page.compressConfigForm.jpegQuality, 95)
    assert.equal(page.closeCompressConfig(), false)
})

test('首次读取失败显示错误和弹窗，不允许默认压缩策略写回', async () => {
    const { page, calls, io } = createSubject()
    io.read = async () => {
        throw Error('fixture unavailable')
    }
    await page.openCompressConfigModal()
    assert.equal(page.compressConfigVisible.value, true)
    assert.equal(page.compressConfigLoaded.value, false)
    assert.match(page.compressConfigError.value, /读取失败/)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
    io.read = async () => ({
        enabled: 0,
        minSizeKB: 0,
        jpegQuality: 90,
        pngCompressionLevel: 'best'
    })
    await page.retryCompressConfig()
    assert.equal(page.compressConfigForm.enabled, false)
    assert.equal(page.compressConfigForm.minSizeKB, 0)
    assert.equal(await page.saveCompressConfig(), true)
    assert.deepEqual(calls.saves[0], {
        enabled: 0,
        minSizeKB: 0,
        jpegQuality: 90,
        pngCompressionLevel: 'best'
    })
    assert.equal(calls.reads, 2)
})

test('重新读取取消或失败保留原输入，失败后必须成功重读才可保存', async () => {
    const { page, calls, io } = createSubject()
    await page.loadCompressConfig()
    page.compressConfigForm.jpegQuality = 95
    io.confirm = async () => {
        throw Error('cancel')
    }
    assert.equal(await page.retryCompressConfig(), false)
    assert.equal(calls.reads, 1)
    io.confirm = async () => {}
    io.read = async () => {
        throw Error('fixture unavailable')
    }
    assert.equal(await page.retryCompressConfig(), false)
    assert.equal(page.compressConfigForm.jpegQuality, 95)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
})

test('无效响应不局部覆盖旧配置，也不会恢复成可保存默认值', async () => {
    const { page, io } = createSubject()
    await page.loadCompressConfig()
    page.compressConfigForm.minSizeKB = 44
    for (const source of [
        {},
        null,
        { enabled: 1, minSizeKB: 5, jpegQuality: 0, pngCompressionLevel: 'best' },
        { enabled: '', minSizeKB: '', jpegQuality: 82, pngCompressionLevel: 'best' }
    ]) {
        io.read = async () => source
        await page.loadCompressConfig()
        assert.equal(page.compressConfigForm.minSizeKB, 44)
        assert.equal(page.compressConfigLoaded.value, false)
        assert.match(page.compressConfigError.value, /读取失败/)
    }
})

test('读取和保存进行中都禁止重复请求，失败释放锁并保留草稿供重试', async () => {
    const { page, calls, io } = createSubject()
    let readDone, rejectSave
    io.read = () =>
        new Promise((resolve) => {
            readDone = resolve
        })
    const reading = page.loadCompressConfig()
    assert.equal(await page.loadCompressConfig(), false)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.reads, 1)
    readDone({ enabled: 1, minSizeKB: 25, jpegQuality: 88, pngCompressionLevel: 'default' })
    await reading
    page.compressConfigForm.minSizeKB = 40
    io.save = () =>
        new Promise((_, reject) => {
            rejectSave = reject
        })
    const saving = page.saveCompressConfig()
    assert.equal(page.canCloseCompressConfig(), false)
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(await page.loadCompressConfig(), false)
    assert.equal(calls.saves.length, 1)
    rejectSave(Error('fixture denied'))
    assert.equal(await saving, false)
    assert.equal(page.compressConfigSaving.value, false)
    assert.equal(page.compressConfigForm.minSizeKB, 40)
    assert.match(page.compressConfigSaveError.value, /保存失败/)
    assert.equal(calls.success.length, 0)
    io.save = async () => {}
    assert.equal(await page.saveCompressConfig(), true)
})

test('保存使用提交快照，等待期间的新输入保留且弹窗继续打开', async () => {
    const { page, calls, io } = createSubject()
    await page.openCompressConfigModal()
    let done
    io.save = () =>
        new Promise((resolve) => {
            done = resolve
        })
    const saving = page.saveCompressConfig()
    page.compressConfigForm.jpegQuality = 99
    done()
    await saving
    assert.equal(calls.saves[0].jpegQuality, 81)
    assert.equal(page.compressConfigForm.jpegQuality, 99)
    assert.equal(page.compressConfigVisible.value, true)
    assert.equal(JSON.parse(page.compressConfigBaseline.value).jpegQuality, 81)
    assert.equal(calls.reads, 1)
})

test('保存前拒绝范围外输入，保留原字段和未保存弹窗', async () => {
    const { page, calls } = createSubject()
    await page.openCompressConfigModal()
    page.compressConfigForm.jpegQuality = 200
    assert.equal(await page.saveCompressConfig(), false)
    assert.equal(calls.saves.length, 0)
    assert.equal(page.compressConfigVisible.value, true)
    assert.match(page.compressConfigSaveError.value, /检查/)
})

test('保存素材A后切到B，A响应只更新A行，不覆盖B行或B草稿', async () => {
    const { page, calls, io, activeMaterial, pager } = createSubject()
    let done
    io.meta = () =>
        new Promise((resolve) => {
            done = resolve
        })
    page.materialMetaForm.title = 'A已编辑'
    const saving = page.saveMaterialMeta()
    activeMaterial.value = { id: 2 }
    page.materialMetaForm.title = 'B未保存'
    done({ id: 1, title: 'A服务器结果' })
    assert.equal(await saving, true)
    assert.equal(pager.lists[0].title, 'A服务器结果')
    assert.equal(pager.lists[1].id, 2)
    assert.equal(pager.lists[1].title, 'B')
    assert.equal(page.materialMetaForm.title, 'B未保存')
    assert.equal(calls.syncs, 0)
    assert.equal(calls.metadata[0].id, 1)
})

test('附件保存连点只发一次；失败保留输入，成功后新编辑也不会被同步回填覆盖', async () => {
    const { page, calls, io } = createSubject()
    let done
    io.meta = () =>
        new Promise((resolve) => {
            done = resolve
        })
    page.materialMetaForm.title = '旧草稿'
    const saving = page.saveMaterialMeta()
    assert.equal(await page.saveMaterialMeta(), false)
    page.materialMetaForm.title = '新草稿'
    done({ id: 1, title: '旧草稿' })
    await saving
    assert.equal(page.materialMetaForm.title, '新草稿')
    assert.equal(calls.metadata.length, 1)
    assert.equal(calls.syncs, 0)
    io.meta = async () => {
        throw Error('fixture denied')
    }
    assert.equal(await page.saveMaterialMeta(), false)
    assert.equal(page.materialMetaSaving.value, false)
    assert.equal(page.materialMetaForm.title, '新草稿')
    assert.match(calls.errors[0], /保存失败/)
})
