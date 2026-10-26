/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { collectVueSourceGraph } from './lib/vue-source-graph.mjs'

test('操作入口沿真实组件导入检查，兼容别名、异步、循环与缺失子文件', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'uied-component-graph-'))
    try {
        fs.mkdirSync(path.join(root, 'src/components'), { recursive: true })
        fs.writeFileSync(path.join(root, 'src/Page.vue'), `<script setup>import Real from '@/components/Real.vue'; import type Ghost from './Ghost.vue'; const lazy = () => import('./Lazy.vue'); // import './Comment.vue'
const unrelated = "import './String.vue'";</script>`)
        fs.writeFileSync(path.join(root, 'src/components/Real.vue'), `<template><button data-admin-smoke="real-action" /></template><script>import Page from '../Page.vue'; import Nope from '../../outside.vue'; import Missing from './Missing.vue';</script>`)
        fs.writeFileSync(path.join(root, 'src/Lazy.vue'), '<template><div /></template>')
        fs.writeFileSync(path.join(root, 'outside.vue'), '<template>不应读取</template>')
        const sources = collectVueSourceGraph(root, ['src/Page.vue'])
        assert.deepEqual(sources.map(item => item.file), ['src/Page.vue', 'src/components/Real.vue', 'src/components/Missing.vue', 'src/Lazy.vue'])
        assert.match(sources[1].text, /real-action/)
        assert.equal(sources[2].text, '')
    } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
