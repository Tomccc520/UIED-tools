<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-12
 */
-->
<template>
    <details class="visitor-trend" :open="expanded" @toggle="handleToggle">
        <summary>
            <span>查看访问趋势</span>
            <span class="visitor-trend__range">最近 15 天</span>
        </summary>
        <div class="visitor-trend__content" :aria-busy="loading">
            <a-empty v-if="!hasData" class="trend-empty" description="最近 15 天暂无工具访问记录" />
            <div v-else-if="loading" class="trend-loading" role="status">正在加载访问趋势...</div>
            <a-alert v-else-if="errorMessage" type="error" role="alert" :closable="false">
                {{ errorMessage }}
                <template #action><a-button @click="loadChart">重试</a-button></template>
            </a-alert>
            <component v-else-if="expanded && chartComponent && active" :is="chartComponent" class="visitor-chart" :option="option" :autoresize="true" />
        </div>
    </details>
</template>

<script lang="ts" setup>
import { onActivated, onBeforeUnmount, onDeactivated, ref, shallowRef, watch, type Component } from 'vue'

const props = defineProps<{
    option: Record<string, any>
    hasData: boolean
}>()
const expanded = ref(false)
const chartComponent = shallowRef<Component | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const active = ref(true)
let disposed = false
let loadSequence = 0
let loadTimer: ReturnType<typeof setTimeout> | undefined

/** 用户查看有数据的趋势时才加载图表；八秒超时或模块失败均提供重试，不阻塞概况和任务入口。 */
const loadChart = async () => {
    if (!active.value || disposed || !expanded.value || !props.hasData || chartComponent.value || loading.value) return
    const sequence = ++loadSequence
    loading.value = true
    errorMessage.value = ''
    try {
        const timeout = new Promise<never>((_, reject) => {
            loadTimer = setTimeout(() => reject(new Error('WORKBENCH_CHART_TIMEOUT')), 8000)
        })
        const chart = await Promise.race([import('vue-echarts'), timeout])
        if (sequence !== loadSequence || disposed) return
        chartComponent.value = chart.default
    } catch (error) {
        if (sequence !== loadSequence || disposed) return
        console.error('[workbench] 访问趋势组件加载失败', error)
        errorMessage.value = '访问趋势加载失败，请重试。仍无法加载时，可刷新页面重试。'
    } finally {
        if (sequence === loadSequence) {
            if (loadTimer) clearTimeout(loadTimer)
            loadTimer = undefined
            loading.value = false
        }
    }
}

/** 原生展开控件支持键盘；收起仅隐藏图表，已加载模块保留供再次查看。 */
const handleToggle = (event: Event) => {
    expanded.value = (event.currentTarget as HTMLDetailsElement).open
}

/** 数据后来可用或用户首次展开时加载，零访问的空状态不请求图表模块。 */
watch([expanded, () => props.hasData], () => { void loadChart() })

/** 缓存页重新激活时恢复可见图表，不重复下载已经加载的模块。 */
const activateTrend = () => {
    if (disposed) return
    active.value = true
    void loadChart()
}

/** 停止非活动页面的图表请求反馈，旧回调不能覆盖下一次激活的加载状态。 */
const deactivateTrend = () => {
    active.value = false
    loadSequence += 1
    if (loadTimer) clearTimeout(loadTimer)
    loadTimer = undefined
    loading.value = false
}

onActivated(activateTrend)
onDeactivated(deactivateTrend)
onBeforeUnmount(() => {
    disposed = true
    deactivateTrend()
})
</script>

<style lang="scss" scoped>
.visitor-trend { border-top: 1px solid var(--uied-admin-border); }
.visitor-trend > summary { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 12px 20px; box-sizing: border-box; cursor: pointer; color: var(--color-text-1); font-size: 13px; }
.visitor-trend > summary::before { content: '▸'; color: var(--color-text-3); transition: transform 160ms ease; }
.visitor-trend[open] > summary::before { transform: rotate(90deg); }
.visitor-trend > summary:hover { background: var(--color-fill-1); }
.visitor-trend > summary:focus-visible { outline: 2px solid var(--uied-admin-accent); outline-offset: -3px; }
.visitor-trend__range { margin-left: auto; color: var(--color-text-3); font-size: 12px; white-space: nowrap; }
.visitor-trend__content { padding: 0 20px 16px; }
.visitor-chart { height: 260px; }
.trend-empty { padding: 24px 0; }
.trend-loading { min-height: 120px; display: grid; place-items: center; color: var(--color-text-3); font-size: 13px; }
@media (max-width: 600px) { .visitor-trend > summary { padding: 12px 16px; } .visitor-trend__content { padding: 0 16px 16px; } .visitor-chart { height: 220px; } }
@media (prefers-reduced-motion: reduce) { .visitor-trend > summary::before { transition: none; } }
</style>
