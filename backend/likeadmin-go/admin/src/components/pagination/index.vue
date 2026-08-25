<template>
    <div class="pagination">
        <a-pagination
            :current="pager.page"
            :page-size="pager.size"
            :total="pager.count"
            :page-size-options="pageSizes"
            :show-total="showTotal"
            :show-page-size="showPageSize"
            :show-jumper="showJumper"
            @update:current="pageChange"
            @update:page-size="sizeChange"
        />
    </div>
</template>

<script lang="ts" setup>
interface Props {
    modelValue?: Record<string, any>
    pageSizes?: number[]
    layout?: string
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: () => ({}),
    pageSizes: () => [15, 20, 30, 40],
    layout: 'total, sizes, prev, pager, next, jumper'
})

const emit = defineEmits<{
    (event: 'change'): void
    (event: 'update:modelValue', value: any): void
}>()

const pager = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

/**
 * 调整每页数量后回到第一页并触发列表刷新。
 */
const sizeChange = (size: number) => {
    pager.value.size = size
    pager.value.page = 1
    emit('change')
}

/**
 * 切换页码并触发列表刷新。
 */
const pageChange = (page: number) => {
    pager.value.page = page
    emit('change')
}

/**
 * 兼容旧版 layout 字符串，映射 Arco 分页显示项。
 */
const layoutTokens = computed(() =>
    props.layout
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
)
const showTotal = computed(() => layoutTokens.value.includes('total'))
const showPageSize = computed(() => layoutTokens.value.includes('sizes'))
const showJumper = computed(() => layoutTokens.value.includes('jumper'))
</script>
