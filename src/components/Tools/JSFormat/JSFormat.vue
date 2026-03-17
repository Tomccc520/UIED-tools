<!--
 * @file JSFormat.vue
 * @description JS代码格式化/压缩工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-17
-->

<script setup lang="ts">
import { reactive } from 'vue'
import DetailHeader from '@/components/Layout/DetailHeader/DetailHeader.vue'
import ToolDetail from '@/components/Layout/ToolDetail/ToolDetail.vue'
import AsyncCodemirror from '@/components/Common/AsyncCodemirror.vue'
import { copy } from '@/utils/string'
import { ensureJsMinifierRuntime, ensureJsPrettierRuntime } from '@/utils/toolRuntimeLoaders'
import { ElMessage } from 'element-plus'

const info = reactive({
  title: "js代码格式化/压缩",
  code: '',
  isParseErr: false,
  parseErr: '',
})

interface Error {
  name: string
  message: string
  stack?: string
}

/**
 * 格式化 JS 代码
 * 调用时才按需加载 Prettier 运行时，避免进入页面即加载格式化依赖
 */
const formatCode = async () => {
  try {
    const { prettier, parserBabel, parserEstree } = await ensureJsPrettierRuntime()
    info.code = await prettier.format(info.code, {
      parser: 'babel',
      plugins: [parserBabel as any, parserEstree as any]
    })
  } catch (error) {
    ElMessage({
      showClose: true,
      message: '请填入正确的js代码',
      type: 'error'
    })
  }
}

/**
 * 混淆压缩 JS 代码
 * 仅在用户触发压缩时加载 terser，减少工具页初始加载负担
 */
const confuseCompress = async () => {
  try {
    const { minify } = await ensureJsMinifierRuntime()
    let res = await minify(info.code, {
      mangle: {
        toplevel: true
      }
    })
    info.code = res.code != undefined ? res.code : info.code
  } catch (error) {
    ElMessage({
      showClose: true,
      message: '请填入正确的js代码: ' + (error as Error).message,
      type: 'error'
    })
  }
}

/**
 * 清空输入框
 */
const clear = () => {
  info.code = ''
}

/**
 * 复制结果文本
 */
const copyRes = async () => {
  copy(info.code)
}
</script>

<template>
  <div class="flex flex-col mt-3 flex-1">
    <DetailHeader :title="info.title"></DetailHeader>

    <div class="p-4 rounded-2xl bg-white ">

      <div>
        <AsyncCodemirror
          v-model="info.code"
          placeholder="这里是代码..."
          :height="400"
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="2"
        />
      </div>

      <div class="mt-4">
        <el-button type="primary" @click="formatCode">格式化</el-button>
        <el-button type="primary" @click="confuseCompress">混淆压缩</el-button>
        <el-button type="primary" @click="copyRes">复制</el-button>
        <el-button type="primary" @click="clear">清空</el-button>
      </div>

      <div class="mt-3 min-h-md bg-red-100 p-3 mb-3" v-show="info.isParseErr">
        <el-text type="danger">{{ info.parseErr }}</el-text>
      </div>
    </div>

    <!-- desc -->
    <ToolDetail title="描述">
      <el-text>
        JS格式化/压缩工具,提供在线JS格式化、JS压缩、JS混淆
      </el-text>
    </ToolDetail>
  </div>
</template>

<style scoped></style>
