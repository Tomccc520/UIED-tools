<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="menu-page">
        <a-page-header
            title="菜单管理"
            subtitle="按模块维护目录/菜单/按钮权限，支持树形筛选与快速编辑。"
        >
            <template #extra>
                <a-space>
                    <a-tag color="purple" bordered>{{ menuDataSourceLabel }}</a-tag>
                    <a-tag color="arcoblue" bordered>已选 {{ selectedMenuRows.length }}</a-tag>
                    <a-button data-admin-smoke="menu-reset" @click="resetFilters">重置筛选</a-button>
                    <a-button data-admin-smoke="menu-query" @click="showAllRows">查看全部</a-button>
                    <a-button data-admin-smoke="menu-refresh" @click="refreshLists">
                        <template #icon>
                            <icon-refresh />
                        </template>
                        刷新
                    </a-button>
                    <a-button :disabled="selectedMenuRows.length === 0" @click="clearMenuSelection"
                        >清空选择</a-button
                    >
                    <a-button
                        v-perms="['system:menu:del']"
                        status="danger"
                        :disabled="selectedMenuRows.length === 0"
                        @click="handleBatchDelete"
                    >
                        批量删除
                    </a-button>
                    <a-button data-admin-smoke="menu-expand" @click="handleExpand">{{
                        isExpand ? '全部折叠' : '全部展开'
                    }}</a-button>
                    <a-button data-admin-smoke="menu-add" v-perms="['system:menu:add']" type="primary" @click="handleAdd()">
                        <template #icon>
                            <icon-plus />
                        </template>
                        新增菜单
                    </a-button>
                </a-space>
            </template>
        </a-page-header>

        <a-grid :cols="{ xs: 1, md: 2, lg: 4 }" :col-gap="12" :row-gap="12" class="menu-metrics">
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">菜单总数</div>
                    <div class="metric-value">{{ metrics.total }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">目录 / 菜单</div>
                    <div class="metric-value">{{ metrics.catalogue }} / {{ metrics.menu }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">按钮权限点</div>
                    <div class="metric-value">{{ metrics.button }}</div>
                </a-card>
            </a-grid-item>
            <a-grid-item>
                <a-card :bordered="false" class="metric-card">
                    <div class="metric-label">停用数量</div>
                    <div class="metric-value is-warning">{{ metrics.disabled }}</div>
                </a-card>
            </a-grid-item>
        </a-grid>


        <a-card class="general-card" title="菜单权限列表" :bordered="false">
            <a-grid :cols="{ xs: 1, md: 12 }" :col-gap="12" :row-gap="12" class="menu-filter-grid">
                <a-grid-item :span="{ xs: 12, md: 5 }">
                    <a-input-search
                        v-model="filters.keyword"
                        placeholder="搜索菜单名/权限标识/路由路径"
                        allow-clear
                    />
                </a-grid-item>
                <a-grid-item :span="{ xs: 6, md: 3 }">
                    <a-select v-model="filters.menuType" placeholder="菜单类型">
                        <a-option value="nav">侧边栏一致（目录+菜单）</a-option>
                        <a-option value="all">全部类型</a-option>
                        <a-option :value="MenuEnum.CATALOGUE">目录</a-option>
                        <a-option :value="MenuEnum.MENU">菜单</a-option>
                        <a-option :value="MenuEnum.BUTTON">按钮</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 6, md: 2 }">
                    <a-select v-model="filters.status" placeholder="状态">
                        <a-option value="all">全部状态</a-option>
                        <a-option value="0">正常</a-option>
                        <a-option value="1">停用</a-option>
                    </a-select>
                </a-grid-item>
                <a-grid-item :span="{ xs: 12, md: 2 }">
                    <div class="filter-result">
                        匹配 {{ visibleCount }} 项 / 已选 {{ selectedMenuRows.length }} 项
                    </div>
                </a-grid-item>
            </a-grid>


            <div
                v-if="selectedMenuRows.length > 0 || actionFeedback.message"
                class="menu-feedback-panel"
            >
                <div v-if="selectedMenuRows.length > 0" class="menu-feedback-panel__selection">
                    <div class="menu-feedback-panel__selection-main">
                        <div class="menu-feedback-panel__selection-title">
                            当前已选择 {{ selectedMenuRows.length }} 项菜单
                        </div>
                        <div class="menu-feedback-panel__selection-desc">
                            建议先确认是否包含目录节点，再执行批量删除，避免破坏树形结构。
                        </div>
                    </div>
                    <a-space wrap>
                        <a-button @click="clearMenuSelection">清空选择</a-button>
                        <a-button
                            v-perms="['system:menu:del']"
                            status="danger"
                            @click="handleBatchDelete"
                        >
                            批量删除
                        </a-button>
                    </a-space>
                </div>
                <a-alert
                    v-if="actionFeedback.message"
                    class="menu-feedback-panel__notice"
                    :type="actionFeedback.type"
                    closable
                    @close="clearActionFeedback"
                >
                    {{ actionFeedback.message }}
                </a-alert>
            </div>

            <a-table
                class="mt-4"
                :data="tableRows"
                :columns="menuColumns"
                :loading="loading"
                row-key="_rowKey"
                :children-column-name="'children'"
                :default-expand-all-rows="true"
                :pagination="false"
                :bordered="false"
                v-model:expanded-keys="expandedKeys"
                :row-selection="rowSelection"
                :scroll="menuTableScroll"
            >
                <template #menuType="{ record }">
                    <a-tag :color="menuTypeTagColorMap[record.menuType] || 'arcoblue'">
                        {{ getMenuTypeLabel(record.menuType) }}
                    </a-tag>
                </template>
                <template #menuIcon="{ record }">
                    <div class="flex items-center">
                        <icon :name="record.menuIcon || 'system-icon-Apps'" :size="18" />
                    </div>
                </template>
                <template #isDisable="{ record }">
                    <a-tag v-if="record.isDisable == 0" color="green">正常</a-tag>
                    <a-tag v-else color="red">停用</a-tag>
                </template>
                <template #action="{ record }">
                    <div class="row-actions">
                        <a-button
                            v-perms="['system:menu:add']"
                            type="text"
                            size="small"
                            @click="handleAdd(record.id)"
                        >
                            新增
                        </a-button>
                        <a-button
                            v-perms="['system:menu:edit']"
                            type="text"
                            size="small"
                            @click="handleEdit(record)"
                        >
                            编辑
                        </a-button>
                        <a-button
                            v-perms="['system:menu:del']"
                            type="text"
                            size="small"
                            status="danger"
                            @click="handleDelete(record.id)"
                        >
                            删除
                        </a-button>
                    </div>
                </template>
                <template #empty>
                    <a-empty :description="menuEmptyDescription">
                        <template #extra>
                            <a-space>
                                <a-button @click="resetFilters">重置筛选</a-button>
                                <a-button @click="refreshLists">重新加载</a-button>
                                <a-button
                                    v-if="menuDataSourceMode !== 'all'"
                                    type="outline"
                                    @click="showAllRows"
                                >
                                    查看全部菜单
                                </a-button>
                            </a-space>
                        </template>
                    </a-empty>
                </template>
            </a-table>
        </a-card>

        <edit-popup v-if="showEdit" ref="editRef" @success="getLists" @close="showEdit = false" />
    </div>
</template>
<script lang="ts" setup name="permissionMenu">
import type { TableColumnData } from '@arco-design/web-vue'
import { menuDelete, menuLists } from '@/api/perms/menu'
import { getMenu } from '@/api/user'
import { IconPlus, IconRefresh } from '@arco-design/web-vue/es/icon'
import { MenuEnum } from '@/enums/appEnums'
import EditPopup from './edit.vue'
import feedback from '@/utils/feedback'
import { getToken } from '@/utils/auth'

interface MenuRow {
    id: number
    _rowKey: string
    menuType: string
    menuName: string
    menuIcon?: string
    perms?: string
    paths?: string
    component?: string
    isDisable: number
    children?: MenuRow[]
    [key: string]: any
}

type RawMenuRow = Record<string, any>

type MenuListResponsePayload =
    | MenuRow[]
    | {
          lists?: MenuRow[]
          list?: MenuRow[]
          rows?: MenuRow[]
          items?: MenuRow[]
          data?: MenuRow[]
      }

interface ActionFeedbackState {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
}

type MenuDataSourceMode = 'route' | 'all'

const DEFAULT_MENU_TYPE_FILTER = 'all'
const DEFAULT_STATUS_FILTER = 'all'

const menuTypeLabelMap: Record<string, string> = {
    [MenuEnum.CATALOGUE]: '目录',
    [MenuEnum.MENU]: '菜单',
    [MenuEnum.BUTTON]: '按钮'
}
const menuTypeTagColorMap: Record<string, string> = {
    [MenuEnum.CATALOGUE]: 'arcoblue',
    [MenuEnum.MENU]: 'green',
    [MenuEnum.BUTTON]: 'orange'
}

/**
 * 函数说明：菜单表格列定义，统一通过 columns 配置渲染，避免列注册异常导致空表格。
 */
const menuColumns: TableColumnData[] = [
    { title: '菜单名称', dataIndex: 'menuName', width: 220, ellipsis: true, tooltip: true },
    { title: '类型', dataIndex: 'menuType', width: 110, slotName: 'menuType' },
    { title: '图标', dataIndex: 'menuIcon', width: 90, slotName: 'menuIcon' },
    { title: '权限标识', dataIndex: 'perms', width: 220, ellipsis: true, tooltip: true },
    { title: '状态', dataIndex: 'isDisable', width: 100, slotName: 'isDisable' },
    { title: '排序', dataIndex: 'menuSort', width: 90 },
    { title: '更新时间', dataIndex: 'updateTime', width: 170 },
    { title: '操作', dataIndex: 'action', width: 190, slotName: 'action' }
]

const editRef = shallowRef<InstanceType<typeof EditPopup>>()
const loading = ref(false)
const showEdit = ref(false)
const lists = ref<MenuRow[]>([])
const expandedKeys = ref<string[]>([])
const isExpand = ref(true)
const selectedMenuKeys = ref<string[]>([])
const menuDataSourceMode = ref<MenuDataSourceMode>('route')
const menuDataSourceLabel = computed(() =>
    menuDataSourceMode.value === 'route' ? '当前视图：侧边栏路由' : '当前视图：全量菜单'
)

/**
 * 函数说明：生成菜单页空态说明，让空表格时仍然给出明确下一步动作。
 */
const menuEmptyDescription = computed(() => {
    if (hasActiveFilters.value) {
        return '当前筛选下没有匹配菜单，建议先重置筛选再查看完整菜单树。'
    }
    if (menuDataSourceMode.value === 'all') {
        return '当前没有加载到全量菜单，建议先刷新或回退到侧边栏视图排查。'
    }
    return '当前没有可显示的菜单数据，建议先刷新或检查当前账号权限。'
})
const filters = reactive({
    keyword: '',
    menuType: DEFAULT_MENU_TYPE_FILTER,
    status: DEFAULT_STATUS_FILTER
})
const actionFeedback = reactive<ActionFeedbackState>({
    type: 'info',
    message: ''
})

/**
 * 函数说明：设置页面操作反馈消息，统一筛选/批量操作的提示风格。
 */
const setActionFeedback = (type: ActionFeedbackState['type'], message: string) => {
    actionFeedback.type = type
    actionFeedback.message = message
}

/**
 * 函数说明：关闭顶部操作反馈提示，避免页面信息噪音。
 */
const clearActionFeedback = () => {
    actionFeedback.message = ''
}

/**
 * 函数说明：按候选键名读取字段，兼容驼峰/下划线/首字母大写返回格式。
 */
const pickField = (record: RawMenuRow, candidates: string[]) => {
    for (const key of candidates) {
        if (Object.prototype.hasOwnProperty.call(record, key) && record[key] !== undefined) {
            return record[key]
        }
    }
    return undefined
}

/**
 * 函数说明：将任意值安全转为数字，失败时返回兜底值。
 */
const toNumberValue = (value: unknown, fallback = 0): number => {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
}

/**
 * 函数说明：将任意值安全转为字符串，避免页面渲染出现 undefined/null。
 */
const toStringValue = (value: unknown, fallback = ''): string => {
    if (value === null || value === undefined) {
        return fallback
    }
    const text = String(value)
    return text.trim() ? text : fallback
}

/**
 * 函数说明：将接口返回值统一转成对象数组，兼容数组或对象映射两种结构。
 */
const toObjectList = (value: unknown): unknown[] => {
    if (Array.isArray(value)) {
        return value
    }
    if (value && typeof value === 'object') {
        const candidateValues = Object.values(value as Record<string, unknown>)
        if (
            candidateValues.length > 0 &&
            candidateValues.every((item) => item && typeof item === 'object')
        ) {
            return candidateValues
        }
    }
    return []
}

/**
 * 函数说明：递归标准化菜单节点字段，确保表格渲染字段稳定。
 */
const normalizeMenuRows = (rows: unknown[], parentId = 0, pathPrefix = 'menu'): MenuRow[] => {
    const normalizedRows: MenuRow[] = []
    rows.forEach((item, index) => {
        if (!item || typeof item !== 'object') {
            return
        }
        const record = item as RawMenuRow
        const rawId = pickField(record, ['id', 'ID'])
        const fallbackId = Number(`${parentId || 0}${index + 1}`)
        const id = toNumberValue(rawId, fallbackId || index + 1)
        const menuType = toStringValue(
            pickField(record, ['menuType', 'menu_type', 'MenuType']),
            MenuEnum.MENU
        )
        const menuName = toStringValue(
            pickField(record, ['menuName', 'menu_name', 'MenuName']),
            `未命名菜单-${id}`
        )
        const menuIcon = toStringValue(pickField(record, ['menuIcon', 'menu_icon', 'MenuIcon']), '')
        const perms = toStringValue(pickField(record, ['perms', 'Perms']), '')
        const paths = toStringValue(pickField(record, ['paths', 'path', 'Paths', 'Path']), '')
        const component = toStringValue(pickField(record, ['component', 'Component']), '')
        const isDisable = toNumberValue(
            pickField(record, ['isDisable', 'is_disable', 'IsDisable']),
            0
        )
        const menuSort = toNumberValue(pickField(record, ['menuSort', 'menu_sort', 'MenuSort']), 0)
        const updateTime = pickField(record, ['updateTime', 'update_time', 'UpdateTime']) || ''
        const rawChildren = pickField(record, ['children', 'Children'])
        const nextPathPrefix = `${pathPrefix}-${index + 1}`
        const children = Array.isArray(rawChildren)
            ? normalizeMenuRows(rawChildren, id, nextPathPrefix)
            : []

        normalizedRows.push({
            ...record,
            id,
            _rowKey: `${nextPathPrefix}-${id}`,
            pid: toNumberValue(
                pickField(record, ['pid', 'Pid', 'parentId', 'parent_id']),
                parentId
            ),
            menuType,
            menuName,
            menuIcon,
            perms,
            paths,
            component,
            isDisable,
            menuSort,
            updateTime,
            children
        })
    })
    return normalizedRows
}

/**
 * 函数说明：为树表提供横向滚动宽度，避免固定列与树形选择组合时出现空白渲染。
 */
const menuTableScroll = computed(() => ({
    x: 1320
}))

/**
 * 函数说明：清理菜单树中的空壳节点，避免接口返回包裹层导致表格“有统计无数据”。
 */
const compactMenuTree = (rows: MenuRow[]): MenuRow[] => {
    const compactedRows: MenuRow[] = []
    rows.forEach((row) => {
        const children = Array.isArray(row.children) ? compactMenuTree(row.children) : []
        const menuName = String(row.menuName || '').trim()
        const hasMeaningfulName = Boolean(menuName) && !/^未命名菜单-\d+$/i.test(menuName)
        const hasBusinessFields = Boolean(
            String(row.perms || '').trim() ||
                String(row.paths || '').trim() ||
                String(row.component || '').trim() ||
                String(row.menuIcon || '').trim()
        )

        if (hasMeaningfulName || hasBusinessFields || children.length === 0) {
            compactedRows.push({
                ...row,
                children
            })
            return
        }
        compactedRows.push(...children)
    })
    return compactedRows
}

/**
 * 函数说明：兼容不同接口返回结构，统一提取菜单树数组。
 */
const resolveMenuRows = (payload: MenuListResponsePayload): MenuRow[] => {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const wrapperData = (payload as Record<string, any>).data
        const wrapperRows = toObjectList(wrapperData)
        if (wrapperRows.length > 0) {
            return compactMenuTree(normalizeMenuRows(wrapperRows))
        }
        /**
         * 函数说明：兼容 data 节点仍是对象包裹（如 data.lists / data.list）的历史返回结构。
         */
        if (wrapperData && typeof wrapperData === 'object' && !Array.isArray(wrapperData)) {
            const wrappedCandidate =
                (wrapperData as Record<string, any>).lists ||
                (wrapperData as Record<string, any>).list ||
                (wrapperData as Record<string, any>).rows ||
                (wrapperData as Record<string, any>).items ||
                (wrapperData as Record<string, any>).data ||
                []
            const wrappedRows = toObjectList(wrappedCandidate)
            if (wrappedRows.length > 0) {
                return compactMenuTree(normalizeMenuRows(wrappedRows))
            }
        }
    }
    if (Array.isArray(payload)) {
        return compactMenuTree(normalizeMenuRows(payload))
    }
    const candidate =
        payload?.lists || payload?.list || payload?.rows || payload?.items || payload?.data || []
    const candidateRows = toObjectList(candidate)
    if (candidateRows.length > 0) {
        return compactMenuTree(normalizeMenuRows(candidateRows))
    }
    const payloadRows = toObjectList(payload as unknown)
    return payloadRows.length > 0 ? compactMenuTree(normalizeMenuRows(payloadRows)) : []
}

/**
 * 函数说明：将树形菜单拍平，供统计与筛选逻辑复用。
 */
const flattenMenuRows = (rows: MenuRow[]): MenuRow[] => {
    const flatRows: MenuRow[] = []
    for (const row of rows) {
        flatRows.push(row)
        if (Array.isArray(row.children) && row.children.length) {
            flatRows.push(...flattenMenuRows(row.children))
        }
    }
    return flatRows
}

const allRows = computed(() => flattenMenuRows(lists.value))
const metrics = computed(() => {
    return {
        total: allRows.value.length,
        catalogue: allRows.value.filter((item) => item.menuType === MenuEnum.CATALOGUE).length,
        menu: allRows.value.filter((item) => item.menuType === MenuEnum.MENU).length,
        button: allRows.value.filter((item) => item.menuType === MenuEnum.BUTTON).length,
        disabled: allRows.value.filter((item) => Number(item.isDisable) === 1).length
    }
})

/**
 * 函数说明：判断单条菜单是否命中筛选条件。
 */
const isRowMatched = (row: MenuRow): boolean => {
    const keyword = filters.keyword.trim().toLowerCase()
    const keywordMatched =
        !keyword ||
        [row.menuName, row.perms, row.paths, row.component]
            .map((item) => String(item || '').toLowerCase())
            .some((text) => text.includes(keyword))

    const typeMatched =
        filters.menuType === 'all' ||
        (filters.menuType === 'nav'
            ? row.menuType === MenuEnum.CATALOGUE || row.menuType === MenuEnum.MENU
            : row.menuType === filters.menuType)
    const statusMatched =
        filters.status === 'all' || String(row.isDisable ?? 0) === String(filters.status)
    return keywordMatched && typeMatched && statusMatched
}

/**
 * 函数说明：按筛选条件裁剪树结构，保留命中节点及其父级路径。
 */
const filterTreeRows = (rows: MenuRow[]): MenuRow[] => {
    const result: MenuRow[] = []
    for (const row of rows) {
        const children = Array.isArray(row.children) ? filterTreeRows(row.children) : []
        const matched = isRowMatched(row)
        if (matched || children.length > 0) {
            result.push({
                ...row,
                children
            })
        }
    }
    return result
}

const filteredLists = computed(() => filterTreeRows(lists.value))
const hasActiveFilters = computed(() => {
    return (
        Boolean(filters.keyword.trim()) ||
        filters.menuType !== DEFAULT_MENU_TYPE_FILTER ||
        filters.status !== DEFAULT_STATUS_FILTER
    )
})
const tableRows = computed<MenuRow[]>(() => {
    if (filteredLists.value.length > 0 || hasActiveFilters.value) {
        return filteredLists.value
    }
    return lists.value
})
const visibleCount = computed(() => flattenMenuRows(tableRows.value).length)
const selectedMenuRows = computed<MenuRow[]>(() => {
    if (!selectedMenuKeys.value.length) {
        return []
    }
    const selectedKeySet = new Set(selectedMenuKeys.value)
    return allRows.value.filter((item) => selectedKeySet.has(item._rowKey))
})
const rowSelection = computed(() => ({
    type: 'checkbox',
    showCheckedAll: true,
    selectedRowKeys: selectedMenuKeys.value,
    onChange: (keys: Array<string | number>) => {
        selectedMenuKeys.value = keys.map((item) => String(item))
    }
}))

watch(
    () => filteredLists.value,
    () => {
        if (isExpand.value) {
            expandedKeys.value = collectExpandableKeys(tableRows.value)
        }
    },
    { deep: true }
)

/**
 * 函数说明：按当前数据源模式拉取菜单树，route 模式对齐左侧，all 模式展示完整菜单。
 */
const loadMenuRowsByDataSource = async (): Promise<MenuRow[]> => {
    if (menuDataSourceMode.value === 'all') {
        const payload = (await menuLists()) as MenuListResponsePayload
        return resolveMenuRows(payload)
    }
    const payload = (await getMenu()) as MenuListResponsePayload
    return resolveMenuRows(payload)
}

/**
 * 函数说明：返回菜单类型文案，未知值兜底显示“未定义”。
 */
const getMenuTypeLabel = (menuType: string) => menuTypeLabelMap[menuType] || '未定义'

/**
 * 函数说明：拉取菜单树数据并回填到表格，保证加载态与异常态正确收敛。
 */
const getLists = async () => {
    loading.value = true
    try {
        lists.value = await loadMenuRowsByDataSource()
        if (lists.value.length === 0) {
            if (menuDataSourceMode.value === 'all') {
                const routeFallbackRows = await loadMenuRowsFromRouteFallback()
                if (routeFallbackRows.length > 0) {
                    lists.value = routeFallbackRows
                    menuDataSourceMode.value = 'route'
                    setActionFeedback('warning', '全量菜单为空，已自动回退到侧边栏路由视图')
                } else {
                    setActionFeedback('warning', '菜单接口返回为空，请检查菜单数据或当前账号权限')
                }
            } else {
                setActionFeedback('warning', '路由菜单接口返回为空，请检查当前账号权限')
            }
        } else if (actionFeedback.message) {
            clearActionFeedback()
        }
        expandedKeys.value = collectExpandableKeys(tableRows.value)
        selectedMenuKeys.value = selectedMenuKeys.value.filter((key) =>
            allRows.value.some((item) => item._rowKey === key)
        )
    } catch {
        if (menuDataSourceMode.value === 'all') {
            const routeFallbackRows = await loadMenuRowsFromRouteFallback()
            if (routeFallbackRows.length > 0) {
                lists.value = routeFallbackRows
                menuDataSourceMode.value = 'route'
                expandedKeys.value = collectExpandableKeys(tableRows.value)
                selectedMenuKeys.value = selectedMenuKeys.value.filter((key) =>
                    allRows.value.some((item) => item._rowKey === key)
                )
                setActionFeedback('warning', '全量菜单接口不可用，已自动回退到侧边栏路由数据')
                return
            }
        }
        const routeFallbackRows = await loadMenuRowsFromRouteFallback()
        if (routeFallbackRows.length > 0 && menuDataSourceMode.value === 'route') {
            lists.value = routeFallbackRows
            expandedKeys.value = collectExpandableKeys(tableRows.value)
            selectedMenuKeys.value = selectedMenuKeys.value.filter((key) =>
                allRows.value.some((item) => item._rowKey === key)
            )
            setActionFeedback('warning', '菜单接口异常，已保底显示侧边栏路由数据')
        } else {
            lists.value = []
            expandedKeys.value = []
            selectedMenuKeys.value = []
            if (!getToken()) {
                setActionFeedback('warning', '登录状态已失效，请重新登录后再查看菜单')
                feedback.msgError('登录状态已失效，请重新登录')
                return
            }
            setActionFeedback('error', '菜单数据加载失败，请检查接口权限或服务状态')
            feedback.msgError('菜单数据加载失败，请检查接口权限或服务状态')
        }
    } finally {
        loading.value = false
    }
}

/**
 * 函数说明：刷新菜单数据，并保持当前筛选条件不变。
 */
const refreshLists = async () => {
    await getLists()
    setActionFeedback(
        'success',
        `${menuDataSourceMode.value === 'route' ? '路由菜单' : '全量菜单'}数据已刷新`
    )
    feedback.msgSuccess('菜单数据已刷新')
}

/**
 * 函数说明：重置筛选并切回 route 数据源，保证页面默认语义与左侧菜单一致。
 */
const resetFilters = async () => {
    filters.keyword = ''
    filters.menuType = DEFAULT_MENU_TYPE_FILTER
    filters.status = DEFAULT_STATUS_FILTER
    if (menuDataSourceMode.value !== 'route') {
        menuDataSourceMode.value = 'route'
        await getLists()
    }
    setActionFeedback('info', '筛选条件已重置')
}

/**
 * 函数说明：切换到全量菜单数据源，并重置筛选项便于排查按钮权限点与停用项。
 */
const showAllRows = async () => {
    filters.keyword = ''
    filters.menuType = 'all'
    filters.status = 'all'
    if (menuDataSourceMode.value !== 'all') {
        menuDataSourceMode.value = 'all'
        await getLists()
    }
    setActionFeedback('info', '已切换到全量菜单视图')
}

/**
 * 函数说明：清空当前批量选择状态，避免误操作。
 */
const clearMenuSelection = () => {
    if (selectedMenuKeys.value.length === 0) {
        setActionFeedback('info', '当前没有已选菜单')
        return
    }
    selectedMenuKeys.value = []
    setActionFeedback('info', '已清空菜单选择')
}

/**
 * 函数说明：打开新增弹窗，可按父级菜单 ID 预填 pid。
 */
const handleAdd = async (id?: number) => {
    showEdit.value = true
    await nextTick()
    if (id) {
        editRef.value?.setFormData({
            pid: id
        })
    }
    editRef.value?.open('add')
}

/**
 * 函数说明：打开编辑弹窗并拉取当前菜单详情。
 */
const handleEdit = async (data: MenuRow) => {
    showEdit.value = true
    await nextTick()
    editRef.value?.open('edit')
    editRef.value?.getDetail(data)
}

/**
 * 函数说明：删除菜单并刷新列表。
 */
const handleDelete = async (id: number) => {
    await feedback.confirm('确定要删除？')
    await menuDelete({ id })
    feedback.msgSuccess('删除成功')
    setActionFeedback('success', '菜单删除成功')
    await getLists()
}

/**
 * 函数说明：构建菜单深度映射，批量删除时优先删除叶子节点，降低父子依赖导致的失败概率。
 */
const buildMenuDepthMap = (
    rows: MenuRow[],
    depth = 0,
    depthMap: Record<number, number> = {}
): Record<number, number> => {
    for (const row of rows) {
        depthMap[Number(row.id)] = depth
        if (Array.isArray(row.children) && row.children.length > 0) {
            buildMenuDepthMap(row.children, depth + 1, depthMap)
        }
    }
    return depthMap
}

/**
 * 函数说明：批量删除菜单，输出成功/失败数量反馈并自动刷新列表。
 */
const handleBatchDelete = async () => {
    if (selectedMenuRows.value.length === 0) {
        setActionFeedback('warning', '请先选择要删除的菜单')
        feedback.msgError('请先选择要删除的菜单')
        return
    }
    await feedback.confirm(`确定删除已选择的 ${selectedMenuRows.value.length} 项菜单吗？`)

    const depthMap = buildMenuDepthMap(lists.value)
    const targetIds = selectedMenuRows.value
        .map((item) => Number(item.id))
        .filter((id) => Number.isFinite(id))
        .sort((left, right) => (depthMap[right] || 0) - (depthMap[left] || 0))

    let successCount = 0
    let failedCount = 0
    for (const id of targetIds) {
        try {
            await menuDelete({ id })
            successCount++
        } catch {
            failedCount++
        }
    }

    if (successCount > 0 && failedCount === 0) {
        const successText = `批量删除完成：成功 ${successCount} 项`
        setActionFeedback('success', successText)
        feedback.msgSuccess(successText)
    } else if (successCount > 0 && failedCount > 0) {
        const warningText = `批量删除完成：成功 ${successCount} 项，失败 ${failedCount} 项`
        setActionFeedback('warning', warningText)
        feedback.msgSuccess(warningText)
    } else {
        setActionFeedback('error', '批量删除失败，请先删除子菜单或检查权限')
        feedback.msgError('批量删除失败，请先删除子菜单或检查权限')
    }
    if (failedCount > 0) {
        feedback.alertWarning('存在删除失败项（可能包含父菜单或权限不足），请检查后重试')
    }
    selectedMenuKeys.value = []
    await getLists()
}

/**
 * 函数说明：切换菜单树展开/折叠状态。
 */
const handleExpand = () => {
    isExpand.value = !isExpand.value
    expandedKeys.value = isExpand.value ? collectExpandableKeys(tableRows.value) : []
}

/**
 * 函数说明：递归提取可展开节点 key，用于 Arco 表格批量展开。
 */
const collectExpandableKeys = (rows: MenuRow[]): string[] => {
    const rowKeys: string[] = []
    for (const row of rows) {
        if (Array.isArray(row.children) && row.children.length > 0) {
            rowKeys.push(row._rowKey)
            rowKeys.push(...collectExpandableKeys(row.children))
        }
    }
    return rowKeys
}

/**
 * 函数说明：菜单列表接口不可用时，回退读取路由菜单，保障页面最少可见“目录/菜单”结构。
 */
const loadMenuRowsFromRouteFallback = async (): Promise<MenuRow[]> => {
    try {
        const payload = (await getMenu()) as MenuListResponsePayload
        return resolveMenuRows(payload)
    } catch {
        return []
    }
}

onMounted(() => {
    getLists()
})
</script>

<style scoped lang="scss">
.menu-page {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.menu-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.9fr);
    gap: 12px;
}

.menu-workspace__main,
.menu-workspace__aside {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 14px;
    background: #fff;
    padding: 16px;
}

.menu-workspace__eyebrow {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    border-radius: 999px;
    border: 1px solid rgba(var(--primary-2), 0.6);
    background: rgba(var(--primary-1), 0.6);
    color: rgb(var(--primary-6));
    font-size: 12px;
    font-weight: 700;
}

.menu-workspace__title {
    margin-top: 10px;
    font-size: 20px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.menu-workspace__desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.65;
    color: var(--color-text-3, #86909c);
}

.menu-workspace__meta {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

.menu-workspace__meta-item {
    padding: 10px 12px;
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
}

.menu-workspace__meta-item span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.menu-workspace__meta-item strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.menu-workspace__aside-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.menu-workspace__checklist {
    margin-top: 10px;
    display: grid;
    gap: 8px;
}

.menu-workspace__checklist-item {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
    background: var(--color-fill-1, #f7f8fa);
    padding: 10px 12px;
}

.menu-workspace__checklist-item.is-ok {
    border-color: #d7ebde;
    background: #f7fcf8;
}

.menu-workspace__checklist-item.is-warning {
    border-color: #f0dfb0;
    background: #fffaf0;
}

.menu-workspace__checklist-label {
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.menu-workspace__checklist-value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.menu-workspace__checklist-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--color-text-3, #86909c);
}

.menu-workspace__actions {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

:deep(.menu-page .arco-page-header) {
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
}

:deep(.menu-page .arco-page-header-wrapper) {
    padding: 16px 18px;
}

.menu-metrics {
    .metric-card {
        .metric-label {
            font-size: 12px;
            color: var(--color-text-3, #86909c);
        }
        .metric-value {
            margin-top: 6px;
            font-size: 24px;
            font-weight: 700;
            color: var(--color-text-1, #1d2129);
            &.is-warning {
                color: #ff7d00;
            }
        }
    }
}

.menu-filter-grid {
    align-items: center;
    .filter-result {
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
    }
}

.menu-filter-strip {
    margin-top: 12px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.85fr);
    gap: 12px;
}

.menu-filter-strip__summary,
.menu-filter-strip__hint {
    border-radius: 12px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    background: var(--color-fill-1, #f7f8fa);
    padding: 12px;
}

.menu-filter-strip__summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
}

.menu-filter-strip__chip {
    padding: 10px 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid rgba(229, 230, 235, 0.9);
}

.menu-filter-strip__chip span {
    display: block;
    font-size: 12px;
    color: var(--color-text-3, #86909c);
}

.menu-filter-strip__chip strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--color-text-1, #1d2129);
    word-break: break-all;
}

.menu-filter-strip__hint-label {
    font-size: 12px;
    font-weight: 700;
    color: rgb(var(--primary-6));
}

.menu-filter-strip__hint-text {
    margin-top: 6px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--color-text-2, #4e5969);
}

.menu-feedback-panel {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.menu-feedback-panel__selection {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid rgba(var(--primary-6), 0.14);
    border-radius: 12px;
    background: rgba(var(--primary-6), 0.06);
}

.menu-feedback-panel__selection-main {
    min-width: 0;
}

.menu-feedback-panel__selection-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.menu-feedback-panel__selection-desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}

.menu-feedback-panel__notice {
    margin: 0;
}

.row-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
}

:deep(.menu-page .arco-card) {
    border-radius: 12px;
}

:deep(.menu-page .arco-table-container) {
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 10px;
}

:deep(.menu-page .arco-table-th) {
    background: var(--color-fill-1, #f7f8fa);
}

@media (max-width: 920px) {
    .menu-workspace,
    .menu-workspace__meta,
    .menu-filter-strip,
    .menu-filter-strip__summary {
        grid-template-columns: 1fr;
    }

    .menu-feedback-panel__selection {
        align-items: flex-start;
        flex-direction: column;
    }

    .menu-filter-grid {
        grid-template-columns: 1fr;
    }
}
</style>
