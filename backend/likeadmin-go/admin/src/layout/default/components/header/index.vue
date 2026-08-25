<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-25
 */
-->
<template>
    <header class="header-wrap">
        <div class="navbar">
            <div class="left-side">
                <a-button class="nav-btn menu-trigger-btn" type="outline" shape="circle" @click="toggleCollapsed">
                    <template #icon>
                        <icon-menu-fold />
                    </template>
                </a-button>
                <a-space v-if="isMobile" :size="10" class="left-brand">
                    <div
                        class="brand-logo-wrap"
                        :class="{ 'brand-logo-wrap--inline': brandLogoMode !== 'image' }"
                    >
                        <div
                            class="brand-logo-inline-svg"
                            v-if="brandLogoMode !== 'image'"
                            v-html="brandLogoSvg"
                        ></div>
                        <img v-else class="brand-logo" alt="logo" :src="brandLogo" />
                    </div>
                    <div class="brand-copy">
                        <a-typography-title class="brand-title" :style="{ margin: 0, fontSize: '18px' }" :heading="5">
                            {{ brandTitle }}
                        </a-typography-title>
                    </div>
                </a-space>
            </div>

            <div class="center-side">
                <breadcrumb v-if="!isMobile && settingStore.showCrumb" />
            </div>

            <ul class="right-side">
                <li>
                    <a-tooltip :content="`全局搜索（${searchHotkeyLabel}）`">
                        <a-button
                            class="nav-btn"
                            type="outline"
                            shape="circle"
                            @click="openSearchModal"
                        >
                            <template #icon>
                                <icon-search />
                            </template>
                        </a-button>
                    </a-tooltip>
                </li>
                <li>
                    <a-tooltip content="系统通知">
                        <div class="message-box-trigger">
                            <a-badge :count="noticeCount" dot>
                                <a-button
                                    class="nav-btn"
                                    type="outline"
                                    shape="circle"
                                    @click="openNoticeDrawer"
                                >
                                    <icon-notification />
                                </a-button>
                            </a-badge>
                        </div>
                    </a-tooltip>
                </li>
                <li>
                    <a-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
                        <a-button
                            class="nav-btn"
                            type="outline"
                            shape="circle"
                            @click="handleToggleFullscreen"
                        >
                            <template #icon>
                                <icon-fullscreen-exit v-if="isFullscreen" />
                                <icon-fullscreen v-else />
                            </template>
                        </a-button>
                    </a-tooltip>
                </li>
                <li>
                    <a-tooltip content="界面设置">
                        <a-button
                            class="nav-btn"
                            type="outline"
                            shape="circle"
                            @click="openSetting"
                        >
                            <template #icon>
                                <icon-settings />
                            </template>
                        </a-button>
                    </a-tooltip>
                </li>
                <li>
                    <user-drop-down />
                </li>
            </ul>
        </div>

        <multiple-tabs v-if="settingStore.openMultipleTabs" />

        <a-modal
            v-model:visible="searchVisible"
            title="全局搜索"
            width="720px"
            :footer="false"
            unmount-on-close
        >
            <div class="search-panel">
                <div class="search-panel__hero">
                    <div class="search-panel__hero-main">
                        <div class="search-panel__eyebrow">命令搜索</div>
                        <div class="search-panel__headline">快速跳到后台任意工作区或配置页</div>
                        <div class="search-panel__hero-desc">
                            支持按菜单名称、面包屑关键词检索。适合直接定位官网设置、权限页和模型配置。
                        </div>
                    </div>
                    <div class="search-panel__hotkey">{{ searchHotkeyLabel }}</div>
                </div>
                <a-input-search
                    ref="searchInputRef"
                    v-model="searchKeyword"
                    class="search-panel__input"
                    size="large"
                    placeholder="输入菜单名称、面包屑关键词，支持上下键选择"
                    allow-clear
                    @keydown.down.prevent="highlightNextSearchItem"
                    @keydown.up.prevent="highlightPrevSearchItem"
                    @keydown.enter.prevent="handleSearchSubmit"
                    @search="handleSearchSubmit"
                />
                <div v-if="searchQuickActions.length" class="search-panel__section search-shortcuts">
                    <div class="search-panel__section-head">
                        <span>常用入口</span>
                        <span>{{ searchQuickActions.length }} 项</span>
                    </div>
                    <a-space wrap size="mini">
                        <a-button
                            v-for="item in searchQuickActions"
                            :key="`quick-${item.path}`"
                            class="search-shortcut-btn"
                            size="mini"
                            @click="handleSearchJump(item)"
                        >
                            {{ item.title }}
                        </a-button>
                    </a-space>
                </div>
                <div class="search-panel__section-head search-panel__section-head--compact">
                    <span>匹配结果</span>
                    <span>{{ visibleSearchItems.length }} 项</span>
                </div>
                <div class="search-panel-meta">
                    <span>{{ searchResultSummary }}</span>
                    <span class="search-panel-tip">快捷键 {{ searchHotkeyLabel }}</span>
                </div>
                <a-empty
                    v-if="!visibleSearchItems.length"
                    description="没找到对应菜单，换个关键词，或者直接从左侧导航进入。"
                >
                    <template #extra>
                        <a-button type="outline" size="small" @click="searchKeyword = ''">
                            清空搜索词
                        </a-button>
                    </template>
                </a-empty>
                <a-scrollbar v-else class="search-result-scroll">
                    <div
                        v-for="(item, index) in visibleSearchItems"
                        :key="item.path"
                        class="search-item"
                        :class="{ 'is-active': index === searchActiveIndex }"
                        @mouseenter="searchActiveIndex = index"
                        @click="handleSearchJump(item)"
                    >
                        <div class="search-item__head">
                            <div class="search-item__title">{{ item.title }}</div>
                            <a-tag v-if="item.external" size="small" color="orange" bordered
                                >外链</a-tag
                            >
                        </div>
                        <div class="search-item__meta">{{ item.breadcrumb }}</div>
                        <div class="search-item__path">{{ item.path }}</div>
                    </div>
                </a-scrollbar>
            </div>
        </a-modal>

        <a-drawer
            v-model:visible="noticeDrawerVisible"
            width="380px"
            title="系统通知"
            placement="right"
            :footer="false"
            unmount-on-close
        >
            <div class="notice-panel">
                <div class="notice-panel__hero">
                    <div class="notice-panel__eyebrow">通知中心</div>
                    <div class="notice-panel__headline">当前有 {{ noticeCount }} 条待处理通知</div>
                    <div class="notice-panel__desc">
                        这里只保留后台当前最需要处理的配置提醒，适合运营和交付阶段快速修复问题。
                    </div>
                    <div class="notice-panel__stats">
                        <div class="notice-panel__stat">
                            <span>待处理</span>
                            <strong>{{ noticeCount }}</strong>
                        </div>
                        <div class="notice-panel__stat">
                            <span>已加载</span>
                            <strong>{{ noticeItems.length }}</strong>
                        </div>
                    </div>
                </div>
                <a-space class="mb-3 notice-toolbar" wrap fill>
                    <a-button @click="refreshNotices" :loading="noticeLoading">刷新通知</a-button>
                    <a-button @click="markAllNoticeAsRead" :disabled="noticeCount <= 0"
                        >全部已读</a-button
                    >
                    <a-button type="primary" @click="goNoticeCenter">通知配置</a-button>
                </a-space>
                <div class="notice-panel__section-head">
                    <span>待处理通知</span>
                    <span>{{ noticeItems.length }} 项</span>
                </div>
                <a-spin :loading="noticeLoading" style="display: block">
                    <a-empty
                        v-if="!noticeItems.length"
                        description="当前没有待处理通知，刷新后会同步最新状态。"
                    >
                        <template #extra>
                            <a-button type="outline" size="small" @click="refreshNotices">
                                重新拉取
                            </a-button>
                        </template>
                    </a-empty>
                    <a-list v-else :bordered="false" :split="true" :data="noticeItems">
                        <template #item="{ item }">
                            <a-list-item class="notice-item" @click="handleNoticeJump(item)">
                                <div class="notice-item__indicator"></div>
                                <a-space direction="vertical" :size="2" fill class="notice-item__body">
                                    <div class="notice-item__head">
                                        <a-typography-text bold>{{ item.name }}</a-typography-text>
                                        <a-tag size="small" color="arcoblue" bordered>待处理</a-tag>
                                    </div>
                                    <a-typography-text type="secondary" :ellipsis="{ rows: 1 }">
                                        {{ item.desc }}
                                    </a-typography-text>
                                    <div class="notice-item__path">{{ item.targetPath }}</div>
                                </a-space>
                            </a-list-item>
                        </template>
                    </a-list>
                </a-spin>
            </div>
        </a-drawer>

        <layout-setting />
    </header>
</template>

<script setup lang="ts">
import { noticeLists } from '@/api/message'
import { getRoutePath } from '@/router'
import { MenuEnum } from '@/enums/appEnums'
import useAppStore from '@/stores/modules/app'
import useSettingStore from '@/stores/modules/setting'
import useUserStore from '@/stores/modules/user'
import { getNormalPath } from '@/utils/util'
import { isExternal } from '@/utils/validate'
import Breadcrumb from './breadcrumb.vue'
import UserDropDown from './user-drop-down.vue'
import MultipleTabs from './multiple-tabs.vue'
import LayoutSetting from '../setting/drawer.vue'
import { Message } from '@arco-design/web-vue'
import {
    IconFullscreen,
    IconFullscreenExit,
    IconMenuFold,
    IconNotification,
    IconSearch,
    IconSettings
} from '@arco-design/web-vue/es/icon'
import { useFullscreen } from '@vueuse/core'

interface SearchMenuItem {
    title: string
    path: string
    breadcrumb: string
    external: boolean
}

interface NoticeItem {
    id: number | string
    name: string
    desc: string
    targetPath: string
}

const appStore = useAppStore()
const settingStore = useSettingStore()
const userStore = useUserStore()
const router = useRouter()

const defaultBrandLogoSvg = `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>logo-3</title><defs><polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon></defs><g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-3"><rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect><g id="logo-copy" transform="translate(19, 24)"><path d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z" class="svg-elem"></path><g id="group"><mask id="mask-9z3bcfbp2n-2" fill="white"><use xlink:href="#path-9z3bcfbp2n-1"></use></mask><g id="Clip-4"></g><path d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0" class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path></g><path d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z" class="svg-elem"></path><polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon><polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon></g></g></g></svg>`

/**
 * 函数说明：规范化内联 SVG 字符串，兼容完整 <svg>、仅 <g> 片段，以及包含外层 div 的整段 HTML。
 */
const normalizeInlineSvgLogo = (logoValue: string): string => {
    const rawValue = String(logoValue || '').trim()
    if (!rawValue) {
        return ''
    }
    const svgMatched = rawValue.match(/<svg[\s\S]*<\/svg>/i)
    if (svgMatched?.[0]) {
        return svgMatched[0]
    }
    const groupMatched = rawValue.match(/<g[\s\S]*<\/g>/i)
    if (groupMatched?.[0]) {
        return `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${groupMatched[0]}</svg>`
    }
    return ''
}

const isMobile = computed(() => appStore.isMobile)
const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
const isMacDevice = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform)

/**
 * 函数说明：读取站点名称作为顶部导航品牌标题，优先使用侧栏品牌文案配置。
 */
const brandTitle = computed(() =>
    String(appStore.config?.toolsSidebarBrandText || appStore.config?.webName || 'Arco Pro')
)

/**
 * 函数说明：根据当前设备生成搜索快捷键展示文案，提升顶部导航可发现性。
 */
const searchHotkeyLabel = computed(() => (isMacDevice ? '⌘K' : 'Ctrl+K'))

/**
 * 函数说明：读取站点 logo 配置并自动补全地址，兼容图片链接与内联 SVG。
 */
const brandLogo = computed(() => {
    const logoPath = String(appStore.config?.toolsSidebarBrandLogo || '').trim()
    if (!logoPath) {
        return ''
    }
    if (normalizeInlineSvgLogo(logoPath)) {
        return ''
    }
    if (/^(https?:)?\/\//i.test(logoPath) || logoPath.startsWith('data:')) {
        return logoPath
    }
    return appStore.getImageUrl(logoPath)
})

/**
 * 函数说明：识别品牌 Logo 的渲染模式，内联 SVG 使用 v-html 渲染，其余走图片地址。
 */
const brandLogoMode = computed<'image' | 'inline-svg'>(() => {
    const logoValue = String(appStore.config?.toolsSidebarBrandLogo || '').trim()
    const normalizedInlineSvg = normalizeInlineSvgLogo(logoValue)
    if (!logoValue.trim()) {
        return 'inline-svg'
    }
    return normalizedInlineSvg ? 'inline-svg' : 'image'
})

/**
 * 函数说明：输出可渲染的内联 SVG 字符串，避免模板层重复做格式判断。
 */
const brandLogoSvg = computed(() => {
    const logoValue = String(appStore.config?.toolsSidebarBrandLogo || '').trim()
    if (!logoValue) {
        return defaultBrandLogoSvg
    }
    return brandLogoMode.value === 'inline-svg' ? normalizeInlineSvgLogo(logoValue) : ''
})

const searchVisible = ref(false)
const searchKeyword = ref('')
const searchInputRef = ref<{ focus?: () => void }>()

const noticeDrawerVisible = ref(false)
const noticeLoading = ref(false)
const noticeItems = ref<NoticeItem[]>([])
const unreadNoticeIds = ref<Array<number | string>>([])
const noticeCount = computed(() => unreadNoticeIds.value.length)

/**
 * 函数说明：将菜单树拍平成可检索项，供顶部全局搜索弹层实时过滤。
 */
const searchMenuItems = computed<SearchMenuItem[]>(() => {
    const flattenList: SearchMenuItem[] = []

    const walkRoutes = (routes: any[], parentPath = '', titleStack: string[] = []) => {
        for (const routeItem of routes) {
            const routePath = String(routeItem.path || '')
            const fullPath = resolveRoutePath(parentPath, routePath)
            const title = String(routeItem.meta?.title || '')
            const nextTitleStack = title ? [...titleStack, title] : titleStack

            if (
                routeItem.meta?.type === MenuEnum.MENU &&
                !routeItem.meta?.hidden &&
                title &&
                fullPath
            ) {
                flattenList.push({
                    title,
                    path: fullPath,
                    breadcrumb: nextTitleStack.join(' / '),
                    external: isExternal(fullPath)
                })
            }

            if (Array.isArray(routeItem.children) && routeItem.children.length) {
                walkRoutes(routeItem.children, fullPath, nextTitleStack)
            }
        }
    }

    walkRoutes(userStore.routes as any[])
    return flattenList
})

const filteredSearchItems = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()
    if (!keyword) {
        return searchMenuItems.value.slice(0, 30)
    }
    return searchMenuItems.value.filter((item) => {
        return (
            item.title.toLowerCase().includes(keyword) ||
            item.breadcrumb.toLowerCase().includes(keyword)
        )
    })
})

const searchActiveIndex = ref(0)

/**
 * 函数说明：限制全局搜索展示结果数量，避免菜单较多时弹层滚动过长。
 */
const visibleSearchItems = computed<SearchMenuItem[]>(() => {
    return filteredSearchItems.value.slice(0, 60)
})

/**
 * 函数说明：抽取后台高频配置入口作为搜索快捷访问按钮，降低运营人员点击层级。
 */
const searchQuickActions = computed<SearchMenuItem[]>(() => {
    const preferredKeywords = [
        '工作台',
        '前端布局',
        '热门工具',
        '网站信息',
        '菜单管理',
        '角色管理',
        '管理员'
    ]
    const pickedItems: SearchMenuItem[] = []
    preferredKeywords.forEach((keyword) => {
        const matchedItem = searchMenuItems.value.find((item) => item.title.includes(keyword))
        if (matchedItem && !pickedItems.some((item) => item.path === matchedItem.path)) {
            pickedItems.push(matchedItem)
        }
    })
    if (pickedItems.length >= 6) {
        return pickedItems.slice(0, 6)
    }
    for (const item of searchMenuItems.value) {
        if (!pickedItems.some((existsItem) => existsItem.path === item.path)) {
            pickedItems.push(item)
        }
        if (pickedItems.length >= 6) {
            break
        }
    }
    return pickedItems
})

/**
 * 函数说明：输出全局搜索统计文案，便于快速判断筛选结果规模。
 */
const searchResultSummary = computed(() => {
    const totalCount = searchMenuItems.value.length
    const filteredCount = filteredSearchItems.value.length
    if (!searchKeyword.value.trim()) {
        return `共 ${totalCount} 个菜单，已展示前 ${visibleSearchItems.value.length} 项`
    }
    return `匹配 ${filteredCount} 项（展示前 ${visibleSearchItems.value.length} 项）`
})

/**
 * 函数说明：规范化路由拼接，兼容绝对路径、相对路径与外链。
 */
const resolveRoutePath = (parentPath: string, routePath: string) => {
    if (!routePath) {
        return ''
    }
    if (isExternal(routePath)) {
        return routePath
    }
    if (routePath.startsWith('/')) {
        return routePath
    }
    return getNormalPath(`${parentPath}/${routePath}`)
}

/**
 * 函数说明：切换侧边栏展开状态，复用原有 store 行为。
 */
const toggleCollapsed = () => {
    appStore.toggleCollapsed()
}

/**
 * 函数说明：打开全局搜索弹层并重置检索词。
 */
const openSearchModal = () => {
    searchKeyword.value = ''
    searchActiveIndex.value = 0
    searchVisible.value = true
    nextTick(() => {
        searchInputRef.value?.focus?.()
    })
}

/**
 * 函数说明：统一响应顶部搜索快捷键（Cmd/Ctrl + K），提升后台导航效率。
 */
const handleGlobalHotkey = (event: KeyboardEvent) => {
    if (!(event.metaKey || event.ctrlKey)) {
        return
    }
    if (event.key.toLowerCase() !== 'k') {
        return
    }
    event.preventDefault()
    openSearchModal()
}

/**
 * 函数说明：回车时优先跳转第一条匹配菜单，提高键盘操作效率。
 */
const handleSearchSubmit = () => {
    const target = visibleSearchItems.value[searchActiveIndex.value] || visibleSearchItems.value[0]
    if (!target) {
        Message.warning('未找到可跳转菜单')
        return
    }
    handleSearchJump(target)
}

/**
 * 函数说明：高亮下一条搜索结果，支持全局搜索弹层键盘导航。
 */
const highlightNextSearchItem = () => {
    const resultCount = visibleSearchItems.value.length
    if (!resultCount) {
        return
    }
    searchActiveIndex.value = (searchActiveIndex.value + 1) % resultCount
}

/**
 * 函数说明：高亮上一条搜索结果，支持全局搜索弹层键盘导航。
 */
const highlightPrevSearchItem = () => {
    const resultCount = visibleSearchItems.value.length
    if (!resultCount) {
        return
    }
    searchActiveIndex.value = (searchActiveIndex.value - 1 + resultCount) % resultCount
}

/**
 * 函数说明：执行菜单跳转，支持内部路由与外链菜单。
 */
const handleSearchJump = (item: SearchMenuItem) => {
    searchVisible.value = false
    if (item.external) {
        window.open(item.path, '_blank', 'noopener,noreferrer')
        return
    }
    router.push(item.path)
}

watch(
    () => searchKeyword.value,
    () => {
        searchActiveIndex.value = 0
    }
)

/**
 * 函数说明：打开通知抽屉并自动拉取通知场景列表。
 */
const openNoticeDrawer = async () => {
    noticeDrawerVisible.value = true
    await refreshNotices()
}

/**
 * 函数说明：拉取用户/平台通知配置作为通知列表，支持一键进入配置详情。
 */
const refreshNotices = async () => {
    try {
        noticeLoading.value = true
        const [userNoticeList, platformNoticeList] = await Promise.all([
            noticeLists({ recipient: 1 }),
            noticeLists({ recipient: 2 })
        ])
        const detailRoute = getRoutePath('setting:notice:detail')
        const listRoute = getRoutePath('setting:notice:list') || '/message/notice'
        const nextItems = [...(userNoticeList || []), ...(platformNoticeList || [])]
            .slice(0, 20)
            .map((item: any) => {
                const targetPath = detailRoute ? `${detailRoute}?id=${item.id}` : listRoute
                return {
                    id: item.id,
                    name: item.name || '未命名通知',
                    desc: `${item.type || '未知类型'} · 点击进入配置`,
                    targetPath
                } as NoticeItem
            })
        /**
         * 函数说明：通知接口返回空数组时回退到默认通知入口，保证右上角通知有可操作内容。
         */
        if (nextItems.length === 0) {
            const fallbackNotices = getFallbackNotices()
            noticeItems.value = fallbackNotices
            unreadNoticeIds.value = fallbackNotices.map((item) => item.id)
            return
        }
        noticeItems.value = nextItems
        unreadNoticeIds.value = nextItems.map((item) => item.id)
    } catch (error) {
        const fallbackNotices = getFallbackNotices()
        noticeItems.value = fallbackNotices
        unreadNoticeIds.value = fallbackNotices.map((item) => item.id)
        Message.warning('通知接口暂不可用，已切换为默认通知入口')
    } finally {
        noticeLoading.value = false
    }
}

/**
 * 函数说明：当通知接口不可用时回退到默认通知入口，避免顶部通知抽屉空白无内容。
 */
const getFallbackNotices = (): NoticeItem[] => {
    const noticeCenterPath =
        getRoutePath('setting:website:layout:detail') || '/official_site/frontend_layout'
    const aiModelPath = getRoutePath('setting:ai:provider:detail') || '/ai_model_manage/ai_provider'
    return [
        {
            id: 'fallback-notice-center',
            name: '通知配置入口',
            desc: '通知模块已下线，点击进入官网运营配置页',
            targetPath: noticeCenterPath
        },
        {
            id: 'fallback-ai-model',
            name: 'AI模型管理入口',
            desc: '建议检查模型状态与可用性配置',
            targetPath: aiModelPath
        }
    ]
}

/**
 * 函数说明：从通知项跳转到对应通知配置页。
 */
const handleNoticeJump = (item: NoticeItem) => {
    noticeDrawerVisible.value = false
    unreadNoticeIds.value = unreadNoticeIds.value.filter((id) => id !== item.id)
    if (isExternal(item.targetPath)) {
        window.open(item.targetPath, '_blank', 'noopener,noreferrer')
        return
    }
    router.push(item.targetPath)
}

/**
 * 函数说明：将当前通知列表全部标记为已读，仅影响前端展示计数。
 */
const markAllNoticeAsRead = () => {
    unreadNoticeIds.value = []
    Message.success('已全部标记为已读')
}

/**
 * 函数说明：跳转到通知配置页，方便运营直接维护消息策略。
 */
const goNoticeCenter = () => {
    noticeDrawerVisible.value = false
    router.push(getRoutePath('setting:website:layout:detail') || '/official_site/frontend_layout')
}

/**
 * 函数说明：切换浏览器全屏状态。
 */
const handleToggleFullscreen = () => {
    toggleFullscreen()
        .then(() => {
            Message.success(isFullscreen.value ? '已进入全屏模式' : '已退出全屏模式')
        })
        .catch(() => {
            Message.error('当前浏览器不支持全屏功能')
        })
}

/**
 * 函数说明：打开右侧设置抽屉，复用既有 settingStore 控制逻辑。
 */
const openSetting = () => {
    settingStore.setSetting({
        key: 'showDrawer',
        value: true
    })
    Message.info('已打开界面设置')
}

onMounted(() => {
    window.addEventListener('keydown', handleGlobalHotkey)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleGlobalHotkey)
})
</script>

<style scoped lang="scss">
.header-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-2, #fff);
}

.navbar {
    display: flex;
    justify-content: space-between;
    flex: 0 0 var(--navbar-height);
    height: var(--navbar-height);
    background-color: var(--color-bg-2, #fff);
    border-bottom: 1px solid var(--color-border, #e5e6eb);
}

.left-side {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    padding-left: 20px;
}

.brand-logo {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    object-fit: cover;
}

.brand-logo-wrap {
    width: 30px;
    height: 30px;
    border-radius: 6px;
    overflow: hidden;
    background: var(--color-fill-2, #f2f3f5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.brand-logo-wrap--inline {
    width: 66px;
    height: 30px;
    border-radius: 0;
    background: transparent;
}

.brand-logo-inline-svg {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    :deep(svg) {
        width: 100%;
        height: 100%;
        display: block;
    }
    :deep(.svg-elem) {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        stroke-width: 1;
        fill: transparent;
        stroke: #fff;
        stroke-linejoin: round;
        stroke-linecap: round;
        animation: draw 2s linear forwards, fill-color 2s linear forwards;
    }
    :deep(#background-rect) {
        fill: #6c54ff;
    }
}

.brand-title {
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.brand-copy {
    display: flex;
    align-items: center;
    min-width: 0;
}

.center-side {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 0 16px;
}

.right-side {
    display: flex;
    align-items: center;
    padding-right: 16px;
    margin: 0;
    list-style: none;
    li {
        position: relative;
        display: flex;
        align-items: center;
        padding: 0 6px;
    }
    a {
        color: var(--color-text-1, #1d2129);
        text-decoration: none;
    }
}

.nav-btn {
    width: 32px;
    height: 32px;
    border-color: var(--color-border-2, #e5e6eb);
    background: transparent;
    color: var(--color-text-2, #4e5969);
    font-size: 15px;
    transition: all 0.2s ease;
}

.nav-btn:hover {
    color: rgb(var(--arcoblue-6));
    border-color: rgba(60, 94, 255, 0.28);
    background: rgba(60, 94, 255, 0.06);
}

.menu-trigger-btn {
    flex-shrink: 0;
}

.right-side {
    .nav-btn {
        width: 32px;
        height: 32px;
        min-width: 32px;
    }

    .trigger-btn,
    .ref-btn {
        position: absolute;
        bottom: 14px;
    }
    .trigger-btn {
        margin-left: 14px;
    }
}

.search-panel {
    padding-top: 4px;

    .search-panel__hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
        padding: 16px 18px;
        border: 1px solid rgba(229, 232, 240, 0.92);
        border-radius: 14px;
        background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
    }

    .search-panel__hero-main {
        min-width: 0;
        flex: 1;
    }

    .search-panel__eyebrow {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(var(--primary-1), 0.9);
        color: rgb(var(--primary-6));
        font-size: 12px;
        font-weight: 700;
    }

    .search-panel__headline {
        margin-top: 10px;
        font-size: 18px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .search-panel__hero-desc {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-text-3, #86909c);
    }

    .search-panel__hotkey {
        flex-shrink: 0;
        min-width: 68px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(229, 232, 240, 0.92);
        background: #fff;
        text-align: center;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .search-panel__input {
        :deep(.arco-input-wrapper) {
            border-radius: 12px;
            padding-inline: 12px;
            min-height: 48px;
            background: #f7f8fa;
            border-color: transparent;
        }

        :deep(.arco-input-wrapper:hover) {
            background: #fff;
            border-color: rgba(22, 93, 255, 0.22);
        }
    }

    .search-panel__section {
        margin-top: 14px;
        padding: 14px 16px;
        border: 1px solid rgba(229, 232, 240, 0.92);
        border-radius: 12px;
        background: #fff;
    }

    .search-panel__section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-3, #86909c);
    }

    .search-panel__section-head--compact {
        margin-top: 14px;
        margin-bottom: 8px;
    }

    .search-shortcuts {
        display: block;
    }

    .search-shortcuts-label {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1;
    }

    .search-shortcut-btn {
        border-radius: 999px;
        border-color: rgba(229, 232, 240, 0.88);
        background: #f7f8fa;
    }

    .search-panel-meta {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
    }

    .search-panel-tip {
        border: 1px solid rgba(229, 232, 240, 0.92);
        border-radius: 999px;
        padding: 4px 8px;
        background: #fff;
        color: var(--color-text-2, #4e5969);
    }

    .search-result-scroll {
        margin-top: 2px;
        max-height: 356px;
    }

    .search-item {
        padding: 12px 14px;
        border: 1px solid transparent;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
            border-color: rgba(22, 93, 255, 0.14);
            background: rgba(22, 93, 255, 0.04);
        }

        &.is-active {
            border-color: rgba(22, 93, 255, 0.22);
            background: rgba(60, 94, 255, 0.08);
            box-shadow: 0 8px 18px rgba(15, 35, 95, 0.06);
        }
    }

    .search-item__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .search-item__title {
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .search-item__meta {
        margin-top: 2px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .search-item__path {
        margin-top: 4px;
        font-size: 11px;
        color: var(--color-text-4, #c9cdd4);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

@keyframes draw {
    from {
        stroke-dashoffset: 1000;
    }
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fill-color {
    0% {
        fill: transparent;
    }
    100% {
        fill: #fff;
    }
}

.notice-panel {
    .notice-panel__hero {
        padding: 16px 16px 14px;
        border: 1px solid rgba(229, 232, 240, 0.92);
        border-radius: 14px;
        background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
    }

    .notice-panel__eyebrow {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(var(--primary-1), 0.9);
        color: rgb(var(--primary-6));
        font-size: 12px;
        font-weight: 700;
    }

    .notice-panel__headline {
        margin-top: 10px;
        font-size: 18px;
        line-height: 1.35;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .notice-panel__desc {
        margin-top: 6px;
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-text-3, #86909c);
    }

    .notice-panel__stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 14px;
    }

    .notice-panel__stat {
        padding: 12px 14px;
        border-radius: 12px;
        background: #fff;
        border: 1px solid rgba(229, 232, 240, 0.92);

        span {
            display: block;
            font-size: 12px;
            color: var(--color-text-3, #86909c);
        }

        strong {
            display: block;
            margin-top: 6px;
            font-size: 18px;
            line-height: 1;
            color: var(--color-text-1, #1d2129);
        }
    }

    .notice-toolbar {
        margin-top: 14px;
        :deep(.arco-btn) {
            flex: 1;
        }
    }

    .notice-panel__section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
        font-weight: 600;
    }

    .notice-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 12px 14px;
        transition: all 0.2s ease;
        &:hover {
            border-color: rgba(22, 93, 255, 0.14);
            background: rgba(22, 93, 255, 0.04);
        }
    }

    .notice-item__indicator {
        flex-shrink: 0;
        width: 8px;
        height: 8px;
        margin-top: 7px;
        border-radius: 999px;
        background: rgb(var(--primary-6));
        box-shadow: 0 0 0 4px rgba(var(--primary-1), 0.9);
    }

    .notice-item__body {
        min-width: 0;
        flex: 1;
    }

    .notice-item__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }

    .notice-item__path {
        margin-top: 4px;
        font-size: 11px;
        line-height: 1.5;
        color: var(--color-text-4, #c9cdd4);
        word-break: break-all;
    }
}

@media (max-width: 980px) {
    .center-side {
        display: none;
    }

    .right-side {
        padding-right: 0;
        li {
            padding: 0 6px;
        }
    }

    .left-side {
        gap: 10px;
        padding-left: 14px;
    }

    .search-panel {
        .search-panel__hero {
            flex-direction: column;
        }

        .search-panel__hotkey {
            width: 100%;
        }
    }
}
</style>
