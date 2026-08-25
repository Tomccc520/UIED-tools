/**
 * @file admin-p0-action-pages.mjs
 * @description 后台 P0 页面关键操作入口冒烟共享配置，避免静态和可视脚本覆盖范围漂移
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

export const ADMIN_P0_ACTION_PAGES = [
    {
        name: '工作台',
        path: '/workbench',
        file: 'src/views/workbench/index.vue',
        files: [
            'src/views/workbench/components/quick-operation-panel.vue',
            'src/views/workbench/components/shortcut-panel.vue',
            'src/views/workbench/components/release-todo-panel.vue',
        ],
        markers: [
            'workbench-quick-operation',
            'workbench-shortcut-panel',
            'workbench-release-mark-all',
            'workbench-release-reset',
        ],
        safeClickMarkers: ['workbench-release-reset'],
    },
    {
        name: '用户列表',
        path: '/consumer/lists',
        file: 'src/views/consumer/lists/index.vue',
        markers: ['consumer-user-refresh', 'consumer-user-reset-header', 'consumer-user-query', 'consumer-user-reset'],
        safeClickMarkers: [
            'consumer-user-refresh',
            'consumer-user-reset-header',
            'consumer-user-query',
            'consumer-user-reset',
        ],
    },
    {
        name: '管理员',
        path: '/permission/admin',
        file: 'src/views/permission/admin/index.vue',
        markers: [
            'admin-query',
            'admin-reset',
            'admin-refresh',
            'admin-add',
        ],
        safeClickMarkers: ['admin-query', 'admin-reset', 'admin-refresh'],
    },
    {
        name: '菜单管理',
        path: '/permission/menu',
        file: 'src/views/permission/menu/index.vue',
        markers: [
            'menu-query',
            'menu-reset',
            'menu-refresh',
            'menu-expand',
            'menu-add',
        ],
        safeClickMarkers: [
            'menu-query',
            'menu-reset',
            'menu-refresh',
            'menu-expand',
        ],
    },
    {
        name: '角色管理',
        path: '/permission/role',
        file: 'src/views/permission/role/index.vue',
        markers: [
            'role-query',
            'role-reset',
            'role-refresh',
            'role-add',
        ],
        safeClickMarkers: ['role-query', 'role-reset', 'role-refresh'],
    },
    {
        name: '部门管理',
        path: '/organization/department',
        file: 'src/views/organization/department/index.vue',
        markers: [
            'dept-query',
            'dept-reset',
            'dept-expand',
            'dept-add',
        ],
        safeClickMarkers: ['dept-query', 'dept-reset', 'dept-expand'],
    },
    {
        name: '岗位管理',
        path: '/organization/post',
        file: 'src/views/organization/post/index.vue',
        markers: ['post-query', 'post-reset', 'post-add'],
        safeClickMarkers: ['post-query', 'post-reset'],
    },
    {
        name: '系统缓存',
        path: '/setting/system/cache',
        file: 'src/views/setting/system/cache.vue',
        markers: ['cache-refresh'],
        safeClickMarkers: ['cache-refresh'],
    },
    {
        name: '运行环境',
        path: '/setting/system/environment',
        file: 'src/views/setting/system/environment.vue',
        markers: ['environment-refresh'],
        safeClickMarkers: ['environment-refresh'],
    },
    {
        name: '系统日志',
        path: '/setting/system/journal',
        file: 'src/views/setting/system/journal.vue',
        markers: ['journal-query', 'journal-reset'],
        safeClickMarkers: ['journal-query', 'journal-reset'],
    },
    {
        name: '工具主数据',
        path: '/official_site/tools_catalog',
        file: 'src/views/setting/website/tools_catalog.vue',
        markers: [
            'tools-catalog-reload',
            'tools-catalog-seed-sync-quick',
            'tools-catalog-health-check-quick',
            'tools-catalog-preview-quick',
            'tools-catalog-health-summary',
            'tools-catalog-policy-sync',
            'tools-catalog-policy-switch',
            'tools-catalog-mode-switch',
            'tools-catalog-save',
        ],
        safeClickMarkers: [
            'tools-catalog-reload',
            'tools-catalog-health-check-quick',
            'tools-catalog-mode-switch',
        ],
        conditionalMarkers: [
            'tools-catalog-format-json',
            'tools-catalog-clear-json',
            'tools-catalog-mode-switch',
            'tools-catalog-policy-sync-advanced',
            'tools-catalog-policy-settings-advanced',
        ],
        preparedMarkerGroups: [
            {
                name: '高级模式',
                prepare: 'toolsCatalogAdvanced',
                markers: ['tools-catalog-policy-sync-advanced', 'tools-catalog-policy-settings-advanced'],
            },
        ],
    },
    {
        name: '菜单设置',
        path: '/official_site/sidebar',
        file: 'src/views/setting/website/sidebar.vue',
        markers: [
            'sidebar-reload',
            'sidebar-preview',
            'sidebar-health-check',
            'sidebar-mode-switch',
            'sidebar-save-top',
        ],
        safeClickMarkers: ['sidebar-reload', 'sidebar-health-check'],
        conditionalMarkers: [
            'sidebar-format-blocks',
            'sidebar-clear-blocks',
            'sidebar-add-ai-menu',
        ],
        preparedMarkerGroups: [
            {
                name: '高级模式',
                prepare: 'sidebarAdvanced',
                markers: [
                    'sidebar-format-blocks',
                    'sidebar-clear-blocks',
                    'sidebar-add-ai-menu',
                ],
            },
        ],
    },
    {
        name: '微信开放平台',
        path: '/channel/wx_dev',
        file: 'src/views/channel/wx_dev.vue',
        markers: ['channel-wx-dev-restore', 'channel-wx-dev-reset', 'channel-wx-dev-save'],
        safeClickMarkers: ['channel-wx-dev-reset'],
    },
    {
        name: '微信小程序',
        path: '/channel/weapp',
        file: 'src/views/channel/weapp.vue',
        markers: ['channel-weapp-restore', 'channel-weapp-reset', 'channel-weapp-save'],
        safeClickMarkers: ['channel-weapp-reset'],
    },
    {
        name: 'H5 渠道',
        path: '/channel/h5',
        file: 'src/views/channel/h5.vue',
        markers: ['channel-h5-restore', 'channel-h5-reset', 'channel-h5-save'],
        safeClickMarkers: ['channel-h5-reset'],
    },
    {
        name: '微信公众号配置',
        path: '/channel/wx_oa/config',
        file: 'src/views/channel/wx_oa/config.vue',
        markers: ['channel-wx-oa-config-restore', 'channel-wx-oa-config-reset', 'channel-wx-oa-config-save'],
        safeClickMarkers: ['channel-wx-oa-config-reset'],
    },
    {
        name: '公众号菜单',
        path: '/channel/wx_oa/menu',
        file: 'src/views/channel/wx_oa/menu.vue',
        markers: ['channel-oa-menu-reload', 'channel-oa-menu-save', 'channel-oa-menu-publish'],
        safeClickMarkers: ['channel-oa-menu-reload'],
    },
    {
        name: '公众号关注回复',
        path: '/channel/wx_oa/follow',
        file: 'src/views/channel/wx_oa/reply/follow_reply.vue',
        markers: [
            'channel-oa-reply-follow-query',
            'channel-oa-reply-follow-reset',
            'channel-oa-reply-follow-add',
            'channel-oa-reply-follow-refresh',
        ],
        safeClickMarkers: [
            'channel-oa-reply-follow-query',
            'channel-oa-reply-follow-reset',
            'channel-oa-reply-follow-refresh',
        ],
    },
    {
        name: '公众号关键词回复',
        path: '/channel/wx_oa/keyword',
        file: 'src/views/channel/wx_oa/reply/keyword_reply.vue',
        markers: [
            'channel-oa-reply-keyword-query',
            'channel-oa-reply-keyword-reset',
            'channel-oa-reply-keyword-add',
            'channel-oa-reply-keyword-refresh',
        ],
        safeClickMarkers: [
            'channel-oa-reply-keyword-query',
            'channel-oa-reply-keyword-reset',
            'channel-oa-reply-keyword-refresh',
        ],
    },
    {
        name: '公众号默认回复',
        path: '/channel/wx_oa/default',
        file: 'src/views/channel/wx_oa/reply/default_reply.vue',
        markers: [
            'channel-oa-reply-default-query',
            'channel-oa-reply-default-reset',
            'channel-oa-reply-default-add',
            'channel-oa-reply-default-refresh',
        ],
        safeClickMarkers: [
            'channel-oa-reply-default-query',
            'channel-oa-reply-default-reset',
            'channel-oa-reply-default-refresh',
        ],
    },
    {
        name: '登录与商业化',
        path: '/consumer/login_commerce',
        file: 'src/views/setting/user/login_register.vue',
        markers: ['login-register-reload', 'login-register-save', 'login-register-access-panel'],
        safeClickMarkers: ['login-register-reload'],
        preparedMarkerGroups: [
            {
                name: '积分与会员页签',
                prepare: 'loginCommerceBilling',
                markers: ['login-register-billing-panel'],
            },
            {
                name: '支付接入页签',
                prepare: 'loginCommercePayment',
                markers: ['login-register-payment-panel'],
            },
        ],
    },
    {
        name: '官网头部设置',
        path: '/official_site/header',
        file: 'src/views/setting/website/header.vue',
        markers: ['website-header-reload', 'website-header-preview', 'website-header-health', 'website-header-save'],
        safeClickMarkers: ['website-header-reload', 'website-header-health'],
    },
    {
        name: '官网页脚设置',
        path: '/official_site/footer',
        file: 'src/views/setting/website/footer.vue',
        markers: ['website-footer-reload', 'website-footer-preview', 'website-footer-health', 'website-footer-save'],
        safeClickMarkers: ['website-footer-reload', 'website-footer-health'],
    },
    {
        name: '官网 SEO 设置',
        path: '/official_site/seo',
        file: 'src/views/setting/website/seo.vue',
        markers: ['website-seo-reload', 'website-seo-preview', 'website-seo-health', 'website-seo-save'],
        safeClickMarkers: ['website-seo-reload', 'website-seo-health'],
    },
    {
        name: '前端布局',
        path: '/official_site/frontend_layout',
        file: 'src/views/setting/website/frontend_layout.vue',
        prepare: 'frontendLayoutUnsaved',
        markers: [
            'frontend-layout-preview',
            'frontend-layout-health-check',
            'frontend-layout-save-top',
            'frontend-layout-banner-add',
            'frontend-layout-health-check-floating',
            'frontend-layout-save-floating',
        ],
        safeClickMarkers: ['frontend-layout-health-check', 'frontend-layout-health-check-floating'],
        staticMarkers: ['frontend-layout-reload'],
    },
    {
        name: 'AI 抠图 API',
        path: '/ai_model_manage/ai_model',
        file: 'src/views/setting/website/ai_model.vue',
        markers: ['ai-matting-reload', 'ai-matting-save'],
        safeClickMarkers: ['ai-matting-reload'],
    },
]

/**
 * 函数说明：汇总单个 P0 页面静态冒烟需要检查的全部源码标记，覆盖默认入口、错误态入口和条件入口。
 */
export const resolveAdminP0StaticMarkers = (pageSpec) => {
    const preparedMarkers = Array.isArray(pageSpec.preparedMarkerGroups)
        ? pageSpec.preparedMarkerGroups.flatMap((group) => (Array.isArray(group.markers) ? group.markers : []))
        : []
    return [
        ...(Array.isArray(pageSpec.markers) ? pageSpec.markers : []),
        ...(Array.isArray(pageSpec.staticMarkers) ? pageSpec.staticMarkers : []),
        ...(Array.isArray(pageSpec.conditionalMarkers) ? pageSpec.conditionalMarkers : []),
        ...preparedMarkers,
    ]
}

/**
 * 函数说明：汇总单个 P0 页面可视冒烟检查分组，默认入口直接检查，条件入口先执行 prepare 再检查。
 */
export const resolveAdminP0VisualCheckGroups = (pageSpec) => {
    const groups = []
    if (Array.isArray(pageSpec.markers) && pageSpec.markers.length > 0) {
        groups.push({
            name: '默认入口',
            prepare: pageSpec.prepare,
            markers: pageSpec.markers,
        })
    }
    if (Array.isArray(pageSpec.preparedMarkerGroups)) {
        pageSpec.preparedMarkerGroups.forEach((group) => {
            if (!Array.isArray(group.markers) || group.markers.length === 0) {
                return
            }
            groups.push({
                name: group.name || group.prepare || '条件入口',
                prepare: group.prepare,
                markers: group.markers,
            })
        })
    }
    return groups
}

/**
 * 函数说明：汇总单个 P0 页面允许真实点击的安全入口，避免保存、同步、删除等入口被误触发。
 */
export const resolveAdminP0SafeClickMarkers = (pageSpec) => {
    return new Set(Array.isArray(pageSpec.safeClickMarkers) ? pageSpec.safeClickMarkers : [])
}

/**
 * 函数说明：根据关键字过滤后台 P0 页面配置，支持按页面名、路由或 smoke 标记局部执行。
 */
export const filterAdminP0ActionPages = (pageFilter) => {
    const filters = Array.isArray(pageFilter) ? pageFilter.map((item) => String(item || '').trim()).filter(Boolean) : []
    if (filters.length === 0) {
        return ADMIN_P0_ACTION_PAGES
    }
    return ADMIN_P0_ACTION_PAGES.filter((pageSpec) => {
        return filters.some((keyword) => {
            const normalizedKeyword = keyword.toLowerCase()
            return (
                pageSpec.name.toLowerCase().includes(normalizedKeyword) ||
                pageSpec.path.toLowerCase().includes(normalizedKeyword) ||
                resolveAdminP0StaticMarkers(pageSpec).some((marker) => marker.toLowerCase().includes(normalizedKeyword))
            )
        })
    })
}
