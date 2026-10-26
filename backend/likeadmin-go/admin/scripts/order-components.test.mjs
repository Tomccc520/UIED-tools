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
import { computed, nextTick, reactive, ref, toRaw, watch } from 'vue'

const directory = new URL('../src/views/consumer/order/', import.meta.url)
/** 从生产文件读取实际脚本，不另写订单业务实现。 */
const source = (file) => {
    const text = fs.readFileSync(new URL(file, directory), 'utf8')
    return file.endsWith('.vue') ? text.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1] : text
}
/** 隔离编译真实脚本；所有订单接口只使用本测试传入的合成边界。 */
const execute = (code, bindings = {}, exposure = '') => {
    const parsed = ts.createSourceFile(
        'order.ts',
        code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS
    )
    const subject = parsed.statements
        .filter((item) => !ts.isImportDeclaration(item))
        .map((item) => item.getText(parsed))
        .join('\n')
    const context = vm.createContext({
        exports: {},
        computed,
        nextTick,
        reactive,
        ref,
        toRaw,
        watch,
        ...bindings
    })
    const compiled = ts.transpileModule(
        subject + (exposure ? '\nthis.subject={' + exposure + '};' : ''),
        {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.CommonJS
            }
        }
    ).outputText
    vm.runInContext(compiled, context)
    return exposure ? context.subject : context.exports
}
const display = execute(source('order-display.ts'))
const usePaging = execute(
    fs.readFileSync(new URL('../src/hooks/usePaging.ts', import.meta.url), 'utf8'),
    {},
    'usePaging'
).usePaging
/** 只转换隔离上下文的对象原型，不修改测试数据的字段和值。 */
const plain = (value) => JSON.parse(JSON.stringify(value))
/** 创建可控的迟到响应，不通过计时器模拟并发顺序。 */
const deferred = () => {
    let resolve, reject
    const promise = new Promise((yes, no) => {
        resolve = yes
        reject = no
    })
    return { promise, resolve, reject }
}
/** 构造完整的订单交付汇总，避免把异常响应当作零订单。 */
const summary = () => ({
    sourceOrderCount: 3,
    abnormalCount: 1,
    okCount: 2,
    pendingDeliveryCount: 0,
    licenseInactiveCount: 0,
    domainMismatchCount: 0,
    downloadInvalidCount: 1,
    deliveryIncompleteCount: 0,
    expiredCount: 0
})
/** 运行订单父页，记录写动作但不连接数据库、不补单、不交付、不关闭真实订单。 */
const createPage = () => {
    const calls = {
        reads: [],
        summaries: 0,
        reissues: [],
        deliveries: [],
        checks: [],
        closes: [],
        exports: [],
        successes: [],
        errors: [],
        confirms: 0
    }
    const io = {
        list: async () => ({ lists: [], count: 0 }),
        summary: async () => summary(),
        reissue: async () => {},
        delivery: async () => {},
        check: async () => ({ order: { downloadCheckStatus: 1 } }),
        close: async () => {},
        export: async () => ({ lists: [] }),
        confirm: async () => {}
    }
    const route = reactive({
        path: '/consumer/order',
        fullPath: '/consumer/order',
        query: {}
    })
    let routeChanged
    const activations = []
    const feedback = {
        msgSuccess: (value) => calls.successes.push(value),
        msgWarning() {},
        msgError: (value) => calls.errors.push(value),
        confirm: async () => {
            calls.confirms++
            return io.confirm()
        }
    }
    const page = execute(
        source('index.vue'),
        {
            ...display,
            feedback,
            usePaging,
            useRoute: () => route,
            useRouter: () => ({
                replace: async ({ query }) => {
                    route.query = query
                    await routeChanged?.()
                },
                push: async () => {}
            }),
            getRoutePath: () => '',
            onActivated(callback) {
                activations.push(callback)
            },
            watch: (_source, callback) => {
                routeChanged = callback
            },
            getOrderList: async (params) => {
                calls.reads.push(plain(params))
                return io.list(params)
            },
            getOrderLinkageSummary: async () => {
                calls.summaries++
                return io.summary()
            },
            reissueOrder: async (payload) => {
                calls.reissues.push(payload)
                return io.reissue(payload)
            },
            saveOrderDelivery: async (payload) => {
                calls.deliveries.push(payload)
                return io.delivery(payload)
            },
            checkOrderDownload: async (payload) => {
                calls.checks.push(payload)
                return io.check(payload)
            },
            closeOrder: async (payload) => {
                calls.closes.push(payload)
                return io.close(payload)
            },
            exportOrderList: async (payload) => {
                calls.exports.push(payload)
                return io.export(payload)
            }
        },
        'queryParams,pager,reissueModal,deliveryModal,reissueError,deliveryError,reissueSubmitting,deliverySubmitting,summaryError,summaryLoaded,linkageSummary,updateOrderFilters,patchReissueDraft,patchDeliveryDraft,closeReissueDialog,closeDeliveryDialog,handleOpenReissue,handleOpenDelivery,handleSubmitReissue,handleSubmitDelivery,handleCheckDownload,handleCloseOrder,handleExport,handleSearch,handleResetFilters,loadLinkageSummary,isRowActionLoading'
    )
    return {
        page,
        calls,
        io,
        route,
        routeChanged: () => routeChanged(),
        activate: () => Promise.all(activations.map((callback) => callback()))
    }
}
/** 以可观察的 props 与 emits 运行子组件的实际事件处理器，不挂接网络接口。 */
const createComponent = (file, props, exposure, onEmit = () => {}) => {
    const events = []
    const page = execute(
        source('components/' + file),
        {
            ...display,
            defineProps: () => props,
            defineEmits: () => (event, value) => {
                events.push({ event, value })
                onEmit(event, value)
            }
        },
        exposure
    )
    return { page, events }
}

test('订单常用列保留关键处理信息，完整模式仍含全部22列；手机不固定操作列', () => {
    const core = display.buildVisibleOrderColumns(false, false)
    assert.equal(core.length, 9)
    assert.ok(core.some((column) => column.dataIndex === 'orderSn'))
    assert.ok(core.some((column) => column.dataIndex === 'deliveryCheck'))
    const full = display.buildVisibleOrderColumns(true, false)
    assert.equal(full.length, 22)
    assert.deepEqual(
        plain(full.map((column) => column.dataIndex)),
        plain(display.allOrderColumns.map((column) => column.dataIndex))
    )
    const mobile = display.buildVisibleOrderColumns(true, true)
    assert.ok(mobile.every((column) => column.fixed === undefined))
    assert.equal(display.allOrderColumns.at(-1).fixed, 'right')
})

test('高级筛选由真实路由条件展开；输入只发字段补丁，清空和日期两端不丢失其他条件', async () => {
    const state = createPage()
    const props = reactive({
        modelValue: state.page.queryParams,
        licenseVisible: false,
        activeFilterCount: 0,
        resultCount: 0
    })
    const component = createComponent(
        'order-filters.vue',
        props,
        'advancedOpen,advancedFilterCount,updateField',
        (event, value) => {
            if (event === 'patch') state.page.updateOrderFilters(value)
        }
    )
    component.page.updateField('keyword', '目标订单')
    component.page.updateField('status', undefined)
    component.page.updateField('startTime', '2026-10-01')
    component.page.updateField('endTime', '2026-10-26')
    await nextTick()
    assert.equal(state.page.queryParams.keyword, '目标订单')
    assert.equal(state.page.queryParams.status, '')
    assert.equal(state.page.queryParams.startTime, '2026-10-01')
    assert.equal(state.page.queryParams.endTime, '2026-10-26')
    assert.equal(component.page.advancedOpen.value, true)
    assert.equal(component.page.advancedFilterCount.value, 2)
    assert.equal(state.calls.reads.length, 0)
    assert.deepEqual(plain(component.events[2].value), {
        startTime: '2026-10-01'
    })
})

test('授权上下文换订单后从第一页查询；重置仍清除路由与全部筛选', async () => {
    const state = createPage()
    state.page.pager.page = 4
    state.route.query = {
        from: 'license',
        orderSn: 'ORDER-B',
        domain: 'example.test',
        deliveryCheckStatus: 'download_invalid'
    }
    await state.routeChanged()
    assert.equal(state.calls.reads[0].pageNo, 1)
    assert.equal(state.calls.reads[0].keyword, 'ORDER-B')
    assert.equal(state.calls.reads[0].boundDomain, 'example.test')
    assert.equal(state.calls.reads[0].deliveryCheckStatus, 'download_invalid')
    await state.page.handleResetFilters()
    assert.deepEqual(plain(state.route.query), {})
    assert.equal(state.page.pager.page, 1)
    assert.equal(state.page.queryParams.keyword, '')
    assert.equal(state.page.queryParams.boundDomain, '')
    assert.equal(state.calls.reads.length, 2)
})

test('补单失败保留弹窗和表单；重试成功后列表刷新失败不再误报补单失败', async () => {
    const { page, calls, io } = createPage()
    page.handleOpenReissue('ORDER-A')
    page.patchReissueDraft({ tradeNo: 'txn-1', remark: '合成备注' })
    io.reissue = async () => {
        throw Error('模拟失败')
    }
    assert.equal(await page.handleSubmitReissue(), false)
    assert.equal(page.reissueModal.visible, true)
    assert.equal(page.reissueModal.tradeNo, 'txn-1')
    assert.ok(page.reissueError.value)
    assert.equal(calls.successes.length, 0)
    io.reissue = async () => {}
    io.list = async () => {
        throw Error('写入成功后读取失败')
    }
    assert.equal(await page.handleSubmitReissue(), true)
    assert.equal(page.reissueModal.visible, false)
    assert.equal(page.reissueError.value, '')
    assert.ok(page.pager.error)
    assert.equal(calls.successes.length, 1)
})

for (const kind of ['reissue', 'delivery']) {
    test(`${kind} 保存中禁止重复提交、更换目标、关闭或继续更改提交字段`, async () => {
        const { page, calls, io } = createPage()
        const pending = deferred()
        io[kind] = () => pending.promise
        const isDelivery = kind === 'delivery'
        if (isDelivery)
            page.handleOpenDelivery({
                id: 11,
                orderSn: 'ORDER-A',
                downloadUrl: 'https://example.test/a.zip'
            })
        else page.handleOpenReissue('ORDER-A')
        const save = isDelivery ? page.handleSubmitDelivery : page.handleSubmitReissue
        const active = isDelivery ? page.deliveryModal : page.reissueModal
        const first = save()
        assert.equal(await save(), false)
        if (isDelivery) {
            page.patchDeliveryDraft({
                downloadUrl: 'https://example.test/new.zip',
                id: 999
            })
            page.handleOpenDelivery({ id: 22, orderSn: 'ORDER-B' })
            page.closeDeliveryDialog()
            assert.equal(active.downloadUrl, 'https://example.test/a.zip')
        } else {
            page.patchReissueDraft({ tradeNo: 'second', orderSn: 'ORDER-B' })
            page.handleOpenReissue('ORDER-B')
            page.closeReissueDialog()
            assert.equal(active.tradeNo, '')
        }
        assert.equal(active.orderSn, 'ORDER-A')
        assert.equal(active.visible, true)
        assert.equal((isDelivery ? calls.deliveries : calls.reissues).length, 1)
        pending.resolve()
        assert.equal(await first, true)
        assert.equal(active.visible, false)
    })
}

test('交付保存失败保留零状态、下载地址和备注，重新提交使用原始字段快照', async () => {
    const { page, io, calls } = createPage()
    page.handleOpenDelivery({ id: 1, orderSn: 'ORDER-A', deliveryStatus: 1 })
    page.patchDeliveryDraft({
        deliveryStatus: 0,
        deliveredTime: 0,
        downloadUrl: 'https://example.test/a.zip',
        deliveryNote: '合成备注',
        id: 999
    })
    assert.equal(page.deliveryModal.id, 1)
    io.delivery = async () => {
        throw Error('模拟保存失败')
    }
    assert.equal(await page.handleSubmitDelivery(), false)
    assert.equal(page.deliveryModal.visible, true)
    assert.equal(page.deliveryModal.deliveryNote, '合成备注')
    assert.equal(calls.deliveries[0].deliveryStatus, 0)
    assert.equal(calls.deliveries[0].deliveredTime, 0)
    io.delivery = async () => {}
    assert.equal(await page.handleSubmitDelivery(), true)
    assert.deepEqual(plain(calls.deliveries[0]), plain(calls.deliveries[1]))
})

test('A下载检测晚到不能回填已切换的B交付弹窗，且同一行不重复请求', async () => {
    const { page, calls, io } = createPage()
    const pending = deferred()
    io.check = () => pending.promise
    page.handleOpenDelivery({
        id: 1,
        orderSn: 'ORDER-A',
        downloadUrl: 'https://example.test/a.zip'
    })
    const first = page.handleCheckDownload(page.deliveryModal)
    assert.equal(page.isRowActionLoading('ORDER-A', 'check_download'), true)
    assert.equal(await page.handleCheckDownload(page.deliveryModal), false)
    page.handleOpenDelivery({
        id: 2,
        orderSn: 'ORDER-B',
        downloadUrl: 'https://example.test/b.zip',
        downloadCheckStatus: 2,
        downloadCheckMessage: 'B原状态'
    })
    pending.resolve({
        order: {
            id: 1,
            orderSn: 'ORDER-A',
            downloadCheckStatus: 1,
            downloadCheckMessage: 'A结果'
        }
    })
    assert.equal(await first, true)
    assert.equal(calls.checks.length, 1)
    assert.equal(page.deliveryModal.orderSn, 'ORDER-B')
    assert.equal(page.deliveryModal.downloadCheckStatus, 2)
    assert.equal(page.deliveryModal.downloadCheckMessage, 'B原状态')
    assert.equal(page.isRowActionLoading('ORDER-A', 'check_download'), false)
})

test('下载检测期间修改当前链接时不把旧检测结果标在新链接上；失败后行锁释放', async () => {
    const { page, io } = createPage()
    const pending = deferred()
    io.check = () => pending.promise
    page.handleOpenDelivery({
        id: 1,
        orderSn: 'ORDER-A',
        downloadUrl: 'https://example.test/a.zip',
        downloadCheckStatus: 0
    })
    const first = page.handleCheckDownload(page.deliveryModal)
    page.patchDeliveryDraft({ downloadUrl: 'https://example.test/new.zip' })
    pending.resolve({ order: { downloadCheckStatus: 1 } })
    await first
    assert.equal(page.deliveryModal.downloadCheckStatus, 0)
    io.check = async () => {
        throw Error('模拟检测失败')
    }
    assert.equal(await page.handleCheckDownload(page.deliveryModal), false)
    assert.equal(page.isRowActionLoading('ORDER-A', 'check_download'), false)
})

test('下载检测的空结果或错误订单标识不能回填成成功状态', async () => {
    const { page, io, calls } = createPage()
    page.handleOpenDelivery({ id: 1, orderSn: 'ORDER-A', downloadCheckStatus: 2 })
    for (const order of [
        {},
        { id: 2, downloadCheckStatus: 1 },
        { orderSn: 'ORDER-B', downloadCheckStatus: 1 }
    ]) {
        io.check = async () => ({ order })
        assert.equal(await page.handleCheckDownload(page.deliveryModal), false)
        assert.equal(page.deliveryModal.downloadCheckStatus, 2)
        assert.equal(page.isRowActionLoading('ORDER-A', 'check_download'), false)
    }
    assert.equal(calls.successes.length, 0)
})

test('关闭确认前已锁定目标行；取消或失败都能释放，不能重复发关闭请求', async () => {
    const { page, calls, io } = createPage()
    const confirmation = deferred()
    io.confirm = () => confirmation.promise
    const first = page.handleCloseOrder('ORDER-A')
    assert.equal(await page.handleCloseOrder('ORDER-A'), false)
    assert.equal(calls.confirms, 1)
    confirmation.reject(Error('取消'))
    assert.equal(await first, false)
    assert.equal(calls.closes.length, 0)
    assert.equal(page.isRowActionLoading('ORDER-A', 'close'), false)
    io.confirm = async () => {}
    io.close = async () => {
        throw Error('关闭失败')
    }
    assert.equal(await page.handleCloseOrder('ORDER-A'), false)
    assert.equal(page.isRowActionLoading('ORDER-A', 'close'), false)
})

test('导出使用查询快照并阻止重复导出，等待期间改筛选不改写在途参数', async () => {
    const { page, io, calls } = createPage()
    const pending = deferred()
    io.export = () => pending.promise
    page.updateOrderFilters({ keyword: 'ORDER-A' })
    const first = page.handleExport()
    page.updateOrderFilters({ keyword: 'ORDER-B' })
    assert.equal(await page.handleExport(), false)
    assert.equal(calls.exports.length, 1)
    assert.equal(calls.exports[0].keyword, 'ORDER-A')
    pending.resolve({ lists: [] })
    assert.equal(await first, false)
})

test('汇总失败不当作零订单，迟到的旧汇总不覆盖更新结果', async () => {
    const { page, io } = createPage()
    io.summary = async () => ({})
    await page.loadLinkageSummary()
    assert.equal(page.summaryLoaded.value, false)
    assert.ok(page.summaryError.value)
    const old = deferred()
    io.summary = () => old.promise
    const first = page.loadLinkageSummary()
    io.summary = async () => ({ ...summary(), sourceOrderCount: 9 })
    await page.loadLinkageSummary()
    old.resolve(summary())
    await first
    assert.equal(page.linkageSummary.value.sourceOrderCount, 9)
    assert.equal(page.summaryError.value, '')
    assert.equal(page.summaryLoaded.value, true)
})

for (const kind of ['reissue', 'delivery']) {
    test(`${kind} 子组件只发补丁，保存中不发迟到输入，模型切换能读取新订单`, () => {
        const initial =
            kind === 'reissue'
                ? { visible: true, orderSn: 'A', tradeNo: '' }
                : { visible: true, orderSn: 'A', deliveryNote: '', deliveredTime: 0 }
        const props = reactive({
            modelValue: initial,
            saving: false,
            error: '',
            licenseVisible: false,
            checking: false
        })
        const alias = kind === 'reissue' ? 'reissueModal' : 'deliveryModal'
        const { page, events } = createComponent(
            `order-${kind}-dialog.vue`,
            props,
            'updateField,' + alias
        )
        const key = kind === 'reissue' ? 'tradeNo' : 'deliveryNote'
        page.updateField(key, '新草稿')
        assert.equal(props.modelValue[key], '')
        assert.deepEqual(plain(events[0]), {
            event: 'patch',
            value: { [key]: '新草稿' }
        })
        props.saving = true
        page.updateField(key, '迟到输入')
        assert.equal(events.length, 1)
        props.modelValue = { ...initial, orderSn: 'B' }
        assert.equal(page[alias].value.orderSn, 'B')
    })
}

test('订单首次进入只读一次，离开后的全局路由变化不请求；再次进入正常刷新', async () => {
    const state = createPage()
    await state.routeChanged()
    await state.activate()
    assert.equal(state.calls.reads.length, 1)
    state.route.path = '/workbench'
    state.route.fullPath = '/workbench'
    await state.routeChanged()
    assert.equal(state.calls.reads.length, 1)
    state.route.path = '/consumer/order'
    state.route.query = { orderSn: 'ORDER-B' }
    state.route.fullPath = '/consumer/order?orderSn=ORDER-B'
    await state.routeChanged()
    await state.activate()
    assert.equal(state.calls.reads.length, 2)
    assert.equal(state.calls.reads[1].keyword, 'ORDER-B')
})
