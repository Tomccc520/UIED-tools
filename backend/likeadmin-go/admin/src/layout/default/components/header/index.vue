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
                <a-button
                    class="nav-btn menu-trigger-btn"
                    type="outline"
                    shape="circle"
                    aria-label="展开或收起侧栏"
                    @click="toggleCollapsed"
                >
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
                        <a-typography-title
                            class="brand-title"
                            :style="{ margin: 0, fontSize: '18px' }"
                            :heading="5"
                        >
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
                            aria-label="打开全局搜索"
                            @click="openSearchModal"
                        >
                            <template #icon>
                                <icon-search />
                            </template>
                        </a-button>
                    </a-tooltip>
                </li>
                <li>
                    <a-tooltip content="通知配置">
                        <div class="message-box-trigger">
                            <a-button
                                class="nav-btn"
                                type="outline"
                                shape="circle"
                                aria-label="打开通知配置"
                                @click="openNoticeDrawer"
                            >
                                <icon-notification />
                            </a-button>
                        </div>
                    </a-tooltip>
                </li>
                <li>
                    <a-tooltip :content="isFullscreen ? '退出全屏' : '全屏'">
                        <a-button
                            class="nav-btn"
                            type="outline"
                            shape="circle"
                            :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
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
                            aria-label="打开界面设置"
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
            title="查找功能"
            :width="isMobile ? 'calc(100vw - 24px)' : '640px'"
            :footer="false"
            unmount-on-close
        >
            <div class="search-panel">
                <a-input-search
                    ref="searchInputRef"
                    v-model="searchKeyword"
                    class="search-panel__input"
                    size="large"
                    placeholder="搜索功能或用途，例如：广告、工具上架、备案"
                    aria-label="搜索后台功能"
                    allow-clear
                    @keydown.down.prevent="highlightNextSearchItem"
                    @keydown.up.prevent="highlightPrevSearchItem"
                    @keydown.enter.prevent="handleSearchSubmit"
                    @search="handleSearchSubmit"
                />
                <div
                    v-if="!searchKeyword.trim() && searchQuickActions.length"
                    class="search-panel__section search-shortcuts"
                >
                    <div class="search-panel__section-head">
                        <span>常用入口</span>
                    </div>
                    <a-space wrap size="mini">
                        <a-button
                            v-for="item in searchQuickActions"
                            :key="`quick-${item.path}`"
                            class="search-shortcut-btn"
                            size="mini"
                            @click="handleSearchJump(item)"
                        >
                            {{ configurationTitle(item.path, item.title) }}
                        </a-button>
                    </a-space>
                </div>
                <div class="search-panel-meta">
                    <span>{{ searchResultSummary }}</span>
                    <span>↑ ↓ 选择 · 回车打开</span>
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
                <div v-else ref="searchResultRef">
                    <a-scrollbar class="search-result-scroll">
                        <button
                            type="button"
                            v-for="(item, index) in visibleSearchItems"
                            :key="item.path"
                            class="search-item"
                            :class="{ 'is-active': index === searchActiveIndex }"
                            @pointermove="highlightPointerSearchItem($event, index)"
                            @focus="searchActiveIndex = index"
                            @click="handleSearchJump(item)"
                        >
                            <div class="search-item__head">
                                <div class="search-item__title">{{ configurationTitle(item.path, item.title) }}</div>
                                <a-tag v-if="item.external" size="small" color="orange" bordered
                                    >外链</a-tag
                                >
                            </div>
                            <div class="search-item__meta">{{ item.breadcrumb }}</div>
                        </button>
                    </a-scrollbar>
                </div>
            </div>
        </a-modal>

        <a-drawer
            v-model:visible="noticeDrawerVisible"
            :width="isMobile ? 'calc(100vw - 24px)' : '380px'"
            title="通知配置"
            placement="right"
            :footer="false"
            unmount-on-close
        >
            <div class="notice-panel">
                <p class="notice-panel__desc">
                    管理通知场景与发送规则，配置条目不代表未读消息或待办。
                </p>
                <a-space v-if="noticeCenter" class="mb-3 notice-toolbar" wrap fill>
                    <a-button @click="refreshNotices" :loading="noticeLoading">刷新通知</a-button>
                    <a-button type="primary" @click="goNoticeCenter">通知配置</a-button>
                </a-space>
                <a-alert v-if="noticeError" type="error">{{ noticeError }}</a-alert>
                <a-spin :loading="noticeLoading" style="display: block">
                    <a-empty
                        v-if="!noticeItems.length && !noticeError && !noticeLoading"
                        :description="
                            noticeCenter ? '暂无通知配置' : '当前账号暂无可用的通知配置入口'
                        "
                    >
                    </a-empty>
                    <a-list
                        v-else-if="noticeItems.length"
                        :bordered="false"
                        :split="true"
                        :data="noticeItems"
                    >
                        <template #item="{ item }">
                            <a-list-item class="notice-item" @click="handleNoticeJump(item)">
                                <a-space
                                    direction="vertical"
                                    :size="2"
                                    fill
                                    class="notice-item__body"
                                >
                                    <div class="notice-item__head">
                                        <a-typography-text bold>{{ item.name }}</a-typography-text>
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
import useAppStore from '@/stores/modules/app'
import useSettingStore from '@/stores/modules/setting'
import useUserStore from '@/stores/modules/user'
import {
    flattenAdminNavigation,
    searchAdminNavigation,
    type AdminNavigationItem
} from '@/utils/admin-navigation'
import { isExternal } from '@/utils/validate'
import { configurationTitle } from '@/utils/site-configuration'
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

type SearchMenuItem = AdminNavigationItem

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
const searchResultRef = ref<HTMLElement>()

const noticeDrawerVisible = ref(false)
const noticeLoading = ref(false)
const noticeItems = ref<NoticeItem[]>([])
const noticeError = ref('')

/**
 * 函数说明：将菜单树拍平成可检索项，供顶部全局搜索弹层实时过滤。
 */
const searchMenuItems = computed<SearchMenuItem[]>(() => flattenAdminNavigation(userStore.routes))

const filteredSearchItems = computed(() => {
    return searchAdminNavigation(searchMenuItems.value, searchKeyword.value)
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
    const preferredPaths = [
        '/workbench',
        '/official_site/tools_catalog',
        '/official_site/frontend_layout',
        '/official_site/sidebar',
        '/official_site/seo',
        '/ai_model_manage/ai_model'
    ]
    const pickedItems: SearchMenuItem[] = []
    preferredPaths.forEach((path) => {
        const matchedItem = searchMenuItems.value.find((item) => item.path.split('?')[0] === path)
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
        return `可访问 ${totalCount} 个功能${
            totalCount > visibleSearchItems.value.length
                ? `，展示前 ${visibleSearchItems.value.length} 项`
                : ''
        }`
    }
    return `找到 ${filteredCount} 个功能${
        filteredCount > visibleSearchItems.value.length
            ? `，展示前 ${visibleSearchItems.value.length} 项`
            : ''
    }`
})

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
    if (!searchVisible.value) return
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

/** 仅在指针实际移动时选中悬停条目，避免键盘滚动或列表更新把选择重置到静止鼠标下。 */
const highlightPointerSearchItem = (event: PointerEvent, index: number) => {
    if (event.movementX !== 0 || event.movementY !== 0) searchActiveIndex.value = index
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

/** 键盘切换结果时滚动到当前条目，避免较长结果列表选中了屏外功能。 */
watch(searchActiveIndex, async () => {
    await nextTick()
    searchResultRef.value
        ?.querySelector('.search-item.is-active')
        ?.scrollIntoView({ block: 'nearest' })
})

/** 只从当前账号可见菜单查找通知配置入口，不用其他模块作为伪通知兜底。 */
const noticeCenter = computed(() => {
    const path = getRoutePath('setting:notice:list')
    return searchMenuItems.value.find((item) => item.path.split('?')[0] === path)
})

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
    if (noticeLoading.value) return
    noticeError.value = ''
    noticeItems.value = []
    if (!noticeCenter.value) return
    try {
        noticeLoading.value = true
        const [userNoticeList, platformNoticeList] = await Promise.all([
            noticeLists({ recipient: 1 }),
            noticeLists({ recipient: 2 })
        ])
        const detailRoute = getRoutePath('setting:notice:detail')
        const listRoute = noticeCenter.value.path
        const nextItems = [...(userNoticeList || []), ...(platformNoticeList || [])]
            .slice(0, 20)
            .map((item: any) => {
                const targetPath = detailRoute ? `${detailRoute}?id=${item.id}` : listRoute
                return {
                    id: item.id,
                    name: item.name || '未命名通知',
                    desc: `${item.type || '通知场景'} · 查看发送规则`,
                    targetPath
                } as NoticeItem
            })
        noticeItems.value = nextItems
    } catch (error) {
        noticeError.value = '通知配置加载失败，请重试'
        console.error('[admin-navigation] 通知配置加载失败', error)
    } finally {
        noticeLoading.value = false
    }
}

/**
 * 函数说明：从通知项跳转到对应通知配置页。
 */
const handleNoticeJump = (item: NoticeItem) => {
    noticeDrawerVisible.value = false
    if (isExternal(item.targetPath)) {
        window.open(item.targetPath, '_blank', 'noopener,noreferrer')
        return
    }
    router.push(item.targetPath)
}

/**
 * 函数说明：跳转到通知配置页，方便运营直接维护消息策略。
 */
const goNoticeCenter = () => {
    if (!noticeCenter.value) return
    noticeDrawerVisible.value = false
    router.push(noticeCenter.value.path)
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
    window.addEventListener('uied:admin-navigation-search', openSearchModal)
})

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleGlobalHotkey)
    window.removeEventListener('uied:admin-navigation-search', openSearchModal)
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

/* 功能搜索保持输入、结果和键盘提示三层结构，避免重复说明挤占可见结果。 */
.search-panel {
    .search-panel__input {
        width: 100%;
    }

    .search-panel__section {
        margin-top: 16px;
    }

    .search-panel__section-head,
    .search-panel-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        color: var(--color-text-3);
        font-size: 12px;
    }

    .search-panel__section-head {
        margin-bottom: 8px;
    }

    .search-panel-meta {
        flex-wrap: wrap;
        margin: 16px 0 8px;
    }

    .search-result-scroll {
        max-height: min(440px, 50vh);
    }

    .search-item {
        display: block;
        width: 100%;
        padding: 10px 12px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: transparent;
        text-align: left;
        cursor: pointer;
        font: inherit;

        &:hover,
        &.is-active {
            background: var(--color-primary-light-1);
        }

        &:focus-visible {
            outline: 2px solid rgb(var(--primary-6));
            outline-offset: -2px;
        }
    }

    .search-item__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .search-item__title {
        color: var(--color-text-1);
        font-weight: 600;
    }

    .search-item__meta {
        margin-top: 4px;
        color: var(--color-text-3);
        font-size: 12px;
        overflow-wrap: anywhere;
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
    .notice-panel__desc {
        margin: 0 0 16px;
        color: var(--color-text-3);
        font-size: 13px;
        line-height: 1.7;
    }

    .notice-item {
        cursor: pointer;
    }

    .notice-item__body {
        min-width: 0;
        flex: 1;
    }

    .notice-item__path {
        color: var(--color-text-3);
        font-size: 11px;
        overflow-wrap: anywhere;
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
}
</style>
