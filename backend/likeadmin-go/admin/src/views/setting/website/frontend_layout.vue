<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-22
 */
-->
<template>
    <div class="website-frontend-layout pro-page-shell">
        <a-page-header class="layout-page-header" title="官网设置 · 前端布局">
            <template #subtitle> 集中维护首页 Banner、每日学习和更新记录。 </template>
            <template #extra>
                <div class="layout-page-actions">
                    <div class="layout-status-tags">
                        <a-tag v-if="totalMissingCount > 0" color="orange" bordered>
                            待完善 {{ totalMissingCount }}
                        </a-tag>
                        <a-tag v-if="hasUnsavedChanges" color="orange" bordered>待保存</a-tag>
                    </div>
                    <a-button data-admin-smoke="frontend-layout-preview" @click="openToolsHomePreview"
                        >预览前端</a-button
                    >
                    <a-dropdown trigger="click" position="br">
                        <a-button>其他设置</a-button>
                        <template #content>
                            <a-doption
                                v-for="item in officialSiteEntryCards"
                                :key="item.key"
                                @click="goOfficialSiteEntry(item.path)"
                                >{{ item.title }}</a-doption
                            >
                        </template>
                    </a-dropdown>
                    <a-button data-admin-smoke="frontend-layout-health-check" @click="runLayoutHealthCheck"
                        >一键体检</a-button
                    >
                    <a-button
                        v-perms="['setting:website:layout:save']"
                        data-admin-smoke="frontend-layout-save-top"
                        type="primary"
                        :loading="isSubmitting"
                        :disabled="isLoadingData"
                        @click="handleSubmit"
                        >保存配置</a-button
                    >
                </div>
            </template>
        </a-page-header>

        <a-alert v-if="loadErrorMessage" class="layout-load-alert" type="warning" show-icon :closable="false">
            {{ loadErrorMessage }}
            <template #action>
                <a-button data-admin-smoke="frontend-layout-reload" size="mini" type="outline" @click="retryLoadData"
                    >重新加载</a-button
                >
            </template>
        </a-alert>

        <a-spin :loading="isLoadingData" tip="正在加载前端布局配置...">
            <a-card class="layout-main-card pro-panel-card general-card" :bordered="false">
                <div class="layout-workspace">
                    <div class="layout-workspace-main">
                        <section class="layout-basic-workflow">
                            <div class="layout-current-module">
                                <div class="layout-current-module__main">
                                    <strong>{{ activeModuleLabel }}</strong>
                                    <a-tag :color="currentModuleMissingTips.length > 0 ? 'orange' : 'green'" bordered>
                                        {{
                                            currentModuleMissingTips.length > 0
                                                ? `待完善 ${currentModuleMissingTips.length}`
                                                : '配置完整'
                                        }}
                                    </a-tag>
                                </div>
                                <div v-if="activeTab === 'pageOps'" class="mode-toolbar__left">
                                    <span class="mode-toolbar__label">显示高级项</span>
                                    <a-switch
                                        v-model="simpleMode"
                                        type="round"
                                        :checked-value="false"
                                        :unchecked-value="true"
                                    />
                                </div>
                            </div>
                            <a-collapse
                                v-model:active-key="layoutContextCollapseKeys"
                                class="layout-context-collapse"
                                :bordered="false"
                            >
                                <a-collapse-item key="context">
                                    <template #header>
                                        <span class="layout-context-collapse__title"> 当前模块说明与检查 </span>
                                    </template>
                                    <div class="layout-context-content">
                                        <p>{{ layoutModuleDescMap[activeTab] }}</p>
                                        <ul v-if="currentModuleMissingTips.length > 0">
                                            <li v-for="item in currentModuleMissingTips" :key="item">
                                                {{ item }}
                                            </li>
                                        </ul>
                                        <p v-else>当前模块未发现阻断性配置问题。</p>
                                        <div class="layout-context-actions">
                                            <a-button size="small" @click="restoreActiveModuleDefaults">
                                                恢复当前模块默认
                                            </a-button>
                                            <a-button size="small" @click="exportLayoutJson"> 导出配置 </a-button>
                                            <a-button size="small" @click="openImportLayoutDialog"> 导入配置 </a-button>
                                        </div>
                                    </div>
                                </a-collapse-item>
                            </a-collapse>
                        </section>

                        <section class="layout-config-zone">
                            <a-tabs v-model:active-key="activeTab" class="layout-tabs" lazy-load>
                                <a-tab-pane
                                    v-if="isModuleTabEnabled('banner')"
                                    key="banner"
                                    title="顶部Banner（首页横幅）"
                                >
                                    <a-card class="panel-card">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>轮播内容配置</span>
                                                <a-button
                                                    data-admin-smoke="frontend-layout-banner-add"
                                                    type="text"
                                                    @click="addBannerSlide"
                                                    >新增轮播</a-button
                                                >
                                            </div>
                                        </template>
                                        <div class="panel-description">
                                            用于首页顶部广告横幅。建议每条文案 8-24 字，链接支持内链/外链/锚点。
                                        </div>
                                        <div class="row-list-empty" v-if="layoutForm.bannerSlides.length === 0">
                                            Banner 轮播还没开始配置，先补 3 条基础投放内容，首页首屏就能先跑起来。
                                        </div>
                                        <a-collapse
                                            v-model:active-key="bannerSectionCollapseKeys"
                                            class="banner-collapse"
                                            :bordered="false"
                                        >
                                            <a-collapse-item
                                                v-for="(item, index) in layoutForm.bannerSlides"
                                                :key="String(index)"
                                            >
                                                <template #header>
                                                    <div class="banner-summary">
                                                        <a-tag bordered>{{ item.badge || '未设置角标' }}</a-tag>
                                                        <strong>{{ item.text || '未填写轮播文案' }}</strong>
                                                        <span>{{ item.link || '未设置链接' }}</span>
                                                    </div>
                                                </template>
                                                <div class="banner-edit-grid">
                                                    <a-input v-model="item.badge" placeholder="角标，如：推荐" />
                                                    <a-input
                                                        v-model="item.text"
                                                        placeholder="文案，如：免费AI编程工具"
                                                    />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="跳转链接，支持 /、# 或 http(s)"
                                                    />
                                                    <a-input
                                                        v-model="item.gradient"
                                                        placeholder="背景渐变，如：linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="moveLinkItem(layoutForm.bannerSlides, index, -1)"
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="moveLinkItem(layoutForm.bannerSlides, index, 1)"
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeBannerSlide(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-collapse-item>
                                        </a-collapse>
                                    </a-card>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('homepageLearning')"
                                    key="homepageLearning"
                                    title="每日学习（首页文章）"
                                >
                                    <a-card class="panel-card">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>首页每日学习 RSS</span>
                                                <a-tag :color="homepageLearningEnabled ? 'green' : 'gray'" bordered>
                                                    {{ homepageLearningEnabled ? '已启用' : '已停用' }}
                                                </a-tag>
                                            </div>
                                        </template>
                                        <a-alert class="layout-section-alert" type="info" :closable="false" show-icon>
                                            后端会代理并解析 UIED RSS，前端不直连跨域
                                            XML。支持全部文章、分类别名、单个或多个分类 ID，不支持标签 ID。
                                        </a-alert>
                                        <a-form
                                            :model="formData"
                                            :label-col-props="{ span: 5 }"
                                            :wrapper-col-props="{ span: 19 }"
                                            class="compact-form"
                                        >
                                            <a-form-item label="启用栏目">
                                                <a-switch
                                                    v-model="homepageLearningEnabled"
                                                    data-admin-smoke="frontend-layout-learning-enabled"
                                                    type="round"
                                                />
                                            </a-form-item>
                                            <a-form-item label="栏目标题">
                                                <a-input
                                                    v-model.trim="formData.toolsHomepageLearningTitle"
                                                    maxlength="20"
                                                    show-word-limit
                                                    placeholder="每日学习"
                                                />
                                            </a-form-item>
                                            <a-form-item label="RSS 地址">
                                                <a-input
                                                    v-model.trim="formData.toolsHomepageLearningRssUrl"
                                                    placeholder="https://www.uied.cn/api/open/v1/rss.xml"
                                                />
                                                <template #extra>
                                                    仅允许 https://uied.cn 或 https://www.uied.cn，后端会再次校验。
                                                </template>
                                            </a-form-item>
                                            <a-form-item label="筛选方式">
                                                <a-radio-group
                                                    v-model="formData.toolsHomepageLearningFilterType"
                                                    type="button"
                                                >
                                                    <a-radio value="all">全部文章</a-radio>
                                                    <a-radio value="category_slug">分类别名</a-radio>
                                                    <a-radio value="categories">分类 ID</a-radio>
                                                </a-radio-group>
                                            </a-form-item>
                                            <a-form-item
                                                v-if="formData.toolsHomepageLearningFilterType === 'category_slug'"
                                                label="分类别名"
                                            >
                                                <a-input
                                                    v-model.trim="formData.toolsHomepageLearningCategorySlug"
                                                    placeholder="例如：ai"
                                                />
                                            </a-form-item>
                                            <a-form-item
                                                v-if="formData.toolsHomepageLearningFilterType === 'categories'"
                                                label="分类 ID"
                                            >
                                                <a-input
                                                    v-model.trim="formData.toolsHomepageLearningCategoryIds"
                                                    placeholder="单分类 307，多分类 417,3351"
                                                />
                                                <template #extra>
                                                    仅填数字分类 ID，多个用英文逗号分隔。原标签 3842 不能放入此字段。
                                                </template>
                                            </a-form-item>
                                            <a-form-item label="展示条数">
                                                <a-input-number
                                                    v-model="homepageLearningLimit"
                                                    :min="1"
                                                    :max="50"
                                                    :precision="0"
                                                />
                                                <template #extra>
                                                    UIED RSS 当前每次最多返回 20 条，这里仅限制首页最多展示数量。
                                                </template>
                                            </a-form-item>
                                        </a-form>
                                        <div class="panel-description">
                                            接口示例：<code>/api/open/v1/rss.xml</code>、<code>?category_slug=ai</code>、<code>?categories=307</code>、<code>?categories=417,3351</code>。
                                        </div>
                                    </a-card>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('sidebar')"
                                    key="sidebar"
                                    title="侧边栏菜单（全站导航）"
                                >
                                    <a-alert class="layout-section-alert" type="info" :closable="false" show-icon>
                                        “推荐工具”分组固定显示在左栏顶部；“AI工具箱”入口可独立打开聚合页，不影响其余分类导航结构。
                                    </a-alert>
                                    <a-collapse
                                        v-model:active-key="sidebarSectionCollapseKeys"
                                        class="layout-section-collapse"
                                        :bordered="false"
                                    >
                                        <a-collapse-item key="brand">
                                            <template #header>
                                                <span class="layout-section-collapse__title">品牌文案</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <div class="panel-description">
                                                    控制左侧 Logo 下方副标题与推荐分组标题，影响全站左侧导航观感。
                                                </div>
                                                <a-form
                                                    :model="formData"
                                                    :label-col-props="{ span: 5 }"
                                                    :wrapper-col-props="{ span: 19 }"
                                                    class="compact-form"
                                                >
                                                    <a-form-item label="品牌副标题">
                                                        <a-input
                                                            v-model="formData.toolsSiteSlogan"
                                                            maxlength="30"
                                                            show-word-limit
                                                            placeholder="如：免费在线工具集"
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="品牌Logo(SVG)">
                                                        <div class="menu-icon-editor">
                                                            <material-picker
                                                                v-model="formData.toolsSidebarBrandLogo"
                                                                :limit="1"
                                                                size="40px"
                                                                file-size="90px"
                                                            />
                                                            <a-textarea
                                                                v-model="formData.toolsSidebarBrandLogo"
                                                                :auto-size="{
                                                                    minRows: 3,
                                                                    maxRows: 6,
                                                                }"
                                                                placeholder="支持 /uploads/*.svg、http(s) 链接、纯 <svg>...</svg>、或包含 <div>...</div> 的整段 HTML（会自动提取 SVG）"
                                                            />
                                                        </div>
                                                    </a-form-item>
                                                    <a-form-item label="品牌主文案">
                                                        <a-input
                                                            v-model="formData.toolsSidebarBrandText"
                                                            maxlength="30"
                                                            show-word-limit
                                                            placeholder="如：UIED Tools"
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="推荐分组标题">
                                                        <a-input
                                                            v-model="formData.toolsSidebarRecommendTitle"
                                                            maxlength="20"
                                                            show-word-limit
                                                            placeholder="如：推荐工具"
                                                        />
                                                    </a-form-item>
                                                </a-form>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="recommend">
                                            <template #header>
                                                <span class="layout-section-collapse__title">推荐链接</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>推荐链接</span>
                                                        <a-button type="text" @click="addSidebarRecommendLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    位于左栏“推荐工具”分组。支持站内路由、锚点和外链。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.sidebarRecommendLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.sidebarRecommendLinks"
                                                    :key="`sidebar-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input v-model="item.name" placeholder="名称，如：每日热榜" />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="链接，如：/tools/hot-ranking 或 #recommend-hot"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(
                                                                    layoutForm.sidebarRecommendLinks,
                                                                    index,
                                                                    -1
                                                                )
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.sidebarRecommendLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeSidebarRecommendLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="category">
                                            <template #header>
                                                <span class="layout-section-collapse__title">分类菜单</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>分类菜单</span>
                                                        <div class="panel-header-buttons">
                                                            <a-button type="text" @click="goIconLibrary"
                                                                >图标库</a-button
                                                            >
                                                            <a-button type="text" @click="addSidebarCategoryMenu"
                                                                >新增菜单</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    控制左栏主导航分类。支持自定义图标 URL（建议
                                                    SVG），如配置直达链接将优先跳转该链接。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.sidebarCategoryMenus.length === 0"
                                                >
                                                    当前还没有菜单配置，建议先点击“新增菜单”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.sidebarCategoryMenus"
                                                    :key="`sidebar-category-${index}`"
                                                    class="menu-row"
                                                >
                                                    <a-input v-model="item.key" placeholder="菜单key，如：ai" />
                                                    <a-input
                                                        v-model="item.title"
                                                        placeholder="菜单标题，如：AI工具箱"
                                                    />
                                                    <div class="menu-icon-editor">
                                                        <material-picker
                                                            v-model="item.icon"
                                                            :limit="1"
                                                            size="40px"
                                                            file-size="90px"
                                                        />
                                                        <a-select
                                                            v-model="item.icon"
                                                            allow-search
                                                            allow-clear
                                                            allow-create
                                                            placeholder="选择内置图标或输入URL"
                                                        >
                                                            <a-option
                                                                v-for="option in builtinSidebarIconOptions"
                                                                :key="option.value"
                                                                :value="option.value"
                                                            >
                                                                {{ option.label }}
                                                            </a-option>
                                                        </a-select>
                                                    </div>
                                                    <a-input
                                                        v-model="item.cateTitle"
                                                        placeholder="分类标题，如：AI工具箱"
                                                    />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="直达链接（可选），如：/tools/ai/toolbox"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.sidebarCategoryMenus, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.sidebarCategoryMenus, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeSidebarCategoryMenu(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="bottom">
                                            <template #header>
                                                <span class="layout-section-collapse__title">底部入口</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>底部功能链接</span>
                                                        <a-button type="text" @click="addSidebarBottomLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    左栏底部固定入口，建议保留“更新记录/关于我们/意见反馈”等核心入口。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.sidebarBottomLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.sidebarBottomLinks"
                                                    :key="`sidebar-bottom-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input v-model="item.name" placeholder="名称，如：更新记录" />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="链接，如：/changelog 或 https://xxx"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.sidebarBottomLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.sidebarBottomLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeSidebarBottomLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="menu_blocks">
                                            <template #header>
                                                <span class="layout-section-collapse__title"
                                                    >菜单样式模块（下拉/列表/图片/分类）</span
                                                >
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>菜单样式模块</span>
                                                        <a-button type="text" @click="addSidebarMenuBlock"
                                                            >新增模块</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    可配置 4
                                                    种导航样式：<code>dropdown</code>、<code>list</code>、<code>image</code>、<code>category</code>。前端将按模块类型自动渲染。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.sidebarMenuBlocks.length === 0"
                                                >
                                                    当前还没有模块配置，建议先点击“新增模块”补一条基础内容；若留空将回退旧版分类菜单。
                                                </div>
                                                <div
                                                    v-for="(block, blockIndex) in layoutForm.sidebarMenuBlocks"
                                                    :key="`sidebar-menu-block-${blockIndex}`"
                                                    class="menu-block-card"
                                                >
                                                    <div class="menu-block-card__head">
                                                        <a-input
                                                            v-model="block.key"
                                                            placeholder="模块key，如：menu-dropdown"
                                                        />
                                                        <a-input
                                                            v-model="block.title"
                                                            placeholder="模块标题，如：下拉菜单"
                                                        />
                                                        <a-select
                                                            v-model="block.type"
                                                            :options="sidebarMenuBlockTypeOptions"
                                                            placeholder="选择模块类型"
                                                        />
                                                        <div class="menu-icon-editor">
                                                            <material-picker
                                                                v-model="block.icon"
                                                                :limit="1"
                                                                size="40px"
                                                                file-size="90px"
                                                            />
                                                            <a-input
                                                                v-model="block.icon"
                                                                placeholder="模块图标（可选）"
                                                            />
                                                        </div>
                                                        <div class="row-actions">
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveLinkItem(
                                                                        layoutForm.sidebarMenuBlocks,
                                                                        blockIndex,
                                                                        -1
                                                                    )
                                                                "
                                                                >上移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveLinkItem(
                                                                        layoutForm.sidebarMenuBlocks,
                                                                        blockIndex,
                                                                        1
                                                                    )
                                                                "
                                                                >下移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                status="danger"
                                                                @click="removeSidebarMenuBlock(blockIndex)"
                                                                >删除模块</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                    <div class="menu-block-card__body">
                                                        <div class="panel-header-actions menu-block-card__toolbar">
                                                            <span>模块条目</span>
                                                            <a-button
                                                                type="text"
                                                                @click="addSidebarMenuBlockItem(blockIndex)"
                                                                >新增条目</a-button
                                                            >
                                                        </div>
                                                        <div class="row-list-empty" v-if="block.items.length === 0">
                                                            当前模块还没有条目，建议先补一条基础入口。
                                                        </div>
                                                        <div
                                                            v-for="(item, itemIndex) in block.items"
                                                            :key="`sidebar-menu-block-item-${blockIndex}-${itemIndex}`"
                                                            class="menu-block-item-row"
                                                        >
                                                            <a-input
                                                                v-model="item.name"
                                                                placeholder="名称，如：AI抠图"
                                                            />
                                                            <a-input
                                                                v-model="item.link"
                                                                placeholder="链接，如：/tools/photo/background 或 #design"
                                                            />
                                                            <a-input
                                                                v-model="item.category"
                                                                placeholder="分类标签（分类菜单可填）"
                                                            />
                                                            <a-input
                                                                v-model="item.desc"
                                                                placeholder="说明（分类菜单可填）"
                                                            />
                                                            <a-input
                                                                v-model="item.icon"
                                                                placeholder="图标URL（可选）"
                                                            />
                                                            <a-input
                                                                v-model="item.image"
                                                                placeholder="图片URL（图片菜单可选）"
                                                            />
                                                            <div class="row-actions">
                                                                <a-button
                                                                    type="text"
                                                                    @click="moveLinkItem(block.items, itemIndex, -1)"
                                                                    >上移</a-button
                                                                >
                                                                <a-button
                                                                    type="text"
                                                                    @click="moveLinkItem(block.items, itemIndex, 1)"
                                                                    >下移</a-button
                                                                >
                                                                <a-button
                                                                    type="text"
                                                                    status="danger"
                                                                    @click="
                                                                        removeSidebarMenuBlockItem(
                                                                            blockIndex,
                                                                            itemIndex
                                                                        )
                                                                    "
                                                                    >删除</a-button
                                                                >
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>
                                    </a-collapse>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('toolsCatalog')"
                                    key="toolsCatalog"
                                    title="工具分类与列表（运营基础）"
                                >
                                    <a-card class="panel-card">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>工具分类树 JSON</span>
                                                <div class="panel-header-buttons">
                                                    <a-button type="text" @click="formatToolsCategoryTreeEditor"
                                                        >格式化</a-button
                                                    >
                                                    <a-button
                                                        type="text"
                                                        status="danger"
                                                        @click="resetToolsCategoryTreeEditor"
                                                        >清空为[]</a-button
                                                    >
                                                </div>
                                            </div>
                                        </template>
                                        <div class="panel-description">
                                            这是全站“工具分类 +
                                            工具列表”的核心配置。保存后前端将优先读取该配置；若为空数组会自动回退内置工具库。
                                            工具条目还支持
                                            <code>releaseDate</code>、<code>tags</code>、<code>isNew</code>、
                                            <code>seoTitle</code
                                            >、<code>seoKeywords</code>、<code>seoDescription</code>、<code>seoImage</code>。
                                        </div>
                                        <a-alert class="catalog-alert" type="warning" :closable="false" show-icon>
                                            建议从现有配置导出后再编辑。字段最小结构为：分类.title/list、子分类.title/list、工具.title/url。
                                            若要替代工具页静态 SEO，请直接在工具条目里补充对应 SEO 字段。
                                        </a-alert>
                                        <div class="catalog-overview-grid" v-if="toolsCatalogPreviewCards.length">
                                            <div
                                                v-for="(item, index) in toolsCatalogPreviewCards"
                                                :key="`catalog-overview-${index}`"
                                                class="catalog-overview-card"
                                            >
                                                <div class="catalog-overview-title">
                                                    {{ item.title }}
                                                </div>
                                                <div class="catalog-overview-meta">
                                                    {{ item.groupCount }}个分组 · {{ item.toolCount }}个工具
                                                </div>
                                            </div>
                                        </div>
                                        <a-textarea
                                            v-model="toolsCategoryTreeEditor"
                                            :rows="20"
                                            placeholder='请输入 JSON 数组，如：[{"title":"AI工具箱","list":[{"title":"AI对话","list":[{"title":"DeepSeek R1","url":"/tools/ai/deepseek-r1","desc":"...","seoTitle":"DeepSeek R1 免费对话","seoKeywords":"DeepSeek R1,AI对话","seoDescription":"..." }]}]}]'
                                        />
                                        <div class="catalog-stat-row">
                                            <a-tag color="arcoblue" bordered>一级分类 {{ toolsCategoryCount }}</a-tag>
                                            <a-tag color="arcoblue" bordered
                                                >二级分类 {{ toolsSubCategoryCount }}</a-tag
                                            >
                                            <a-tag color="green" bordered>工具总数 {{ toolsTotalCount }}</a-tag>
                                        </div>
                                        <div v-if="toolsCategoryTreeParseError" class="catalog-error">
                                            {{ toolsCategoryTreeParseError }}
                                        </div>
                                    </a-card>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('seo')"
                                    key="seo"
                                    title="SEO设置（首页 / 页面 / 分享）"
                                >
                                    <a-card class="panel-card">
                                        <div class="panel-description">
                                            这里统一维护默认 SEO、默认分享图，以及首页 / 更新页 / 登录页等固定页面的独立
                                            SEO。 工具页的专属 SEO 优先从“工具分类与列表”中的工具条目字段读取。
                                        </div>
                                        <a-form
                                            :model="formData"
                                            :label-col-props="{ span: 5 }"
                                            :wrapper-col-props="{ span: 19 }"
                                            class="compact-form"
                                        >
                                            <a-form-item label="默认标题">
                                                <a-input
                                                    v-model="formData.toolsSeoDefaultTitle"
                                                    maxlength="80"
                                                    show-word-limit
                                                    placeholder="留空时按“页面标题 - 站点名”自动生成"
                                                />
                                            </a-form-item>
                                            <a-form-item label="默认关键词">
                                                <a-textarea
                                                    v-model="formData.toolsSeoDefaultKeywords"
                                                    :auto-size="{ minRows: 2, maxRows: 4 }"
                                                    maxlength="220"
                                                    show-word-limit
                                                    placeholder="例如：免费在线工具,UIED,AI工具箱"
                                                />
                                            </a-form-item>
                                            <a-form-item label="默认描述">
                                                <a-textarea
                                                    v-model="formData.toolsSeoDefaultDescription"
                                                    :auto-size="{ minRows: 3, maxRows: 5 }"
                                                    maxlength="220"
                                                    show-word-limit
                                                    placeholder="用于未单独配置页面的描述"
                                                />
                                            </a-form-item>
                                            <a-form-item label="默认分享图">
                                                <div class="menu-icon-editor">
                                                    <material-picker
                                                        v-model="formData.toolsSeoDefaultImage"
                                                        :limit="1"
                                                        size="40px"
                                                        file-size="90px"
                                                    />
                                                    <a-input
                                                        v-model="formData.toolsSeoDefaultImage"
                                                        placeholder="支持 /uploads/*、/favicon.ico 或 http(s) 链接"
                                                    />
                                                </div>
                                            </a-form-item>
                                        </a-form>
                                    </a-card>

                                    <a-card class="panel-card">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>页面级 SEO</span>
                                                <a-button type="text" @click="addSeoPage">新增页面</a-button>
                                            </div>
                                        </template>
                                        <div class="panel-description">
                                            用于覆盖首页、更新页、登录页、用户中心等固定页面
                                            SEO。路径建议填完整站内路径，如
                                            <code>/changelog</code>。
                                        </div>
                                        <div class="row-list-empty" v-if="layoutForm.seoPages.length === 0">
                                            当前还没有页面配置，建议先点击“新增页面”补一条基础内容。
                                        </div>
                                        <div
                                            v-for="(item, index) in layoutForm.seoPages"
                                            :key="`seo-page-${index}`"
                                            class="seo-page-row"
                                        >
                                            <a-input v-model="item.path" placeholder="页面路径，如：/changelog" />
                                            <a-input v-model="item.title" placeholder="页面标题，如：更新日志" />
                                            <a-input
                                                v-model="item.image"
                                                placeholder="分享图，如：/favicon.ico 或 https://..."
                                            />
                                            <a-textarea
                                                v-model="item.keywords"
                                                :auto-size="{ minRows: 2, maxRows: 3 }"
                                                placeholder="关键词，使用英文逗号分隔"
                                            />
                                            <a-textarea
                                                v-model="item.description"
                                                :auto-size="{ minRows: 2, maxRows: 4 }"
                                                placeholder="页面描述"
                                            />
                                            <div class="row-actions">
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.seoPages, index, -1)"
                                                    >上移</a-button
                                                >
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.seoPages, index, 1)"
                                                    >下移</a-button
                                                >
                                                <a-button type="text" status="danger" @click="removeSeoPage(index)"
                                                    >删除</a-button
                                                >
                                            </div>
                                        </div>
                                    </a-card>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('pageOps')"
                                    key="pageOps"
                                    title="页面运营（更新记录）"
                                >
                                    <a-alert
                                        v-if="simpleMode"
                                        class="layout-section-alert"
                                        type="info"
                                        :closable="false"
                                        show-icon
                                    >
                                        当前为运营简版：仅展示“更新页说明”和“更新时间线”。如需维护顶部链接、资料链接和开源说明，请切换到高级模式。
                                    </a-alert>
                                    <a-collapse
                                        v-model:active-key="pageOpsSectionCollapseKeys"
                                        class="layout-section-collapse"
                                        :bordered="false"
                                    >
                                        <a-collapse-item key="changelog_intro">
                                            <template #header>
                                                <span class="layout-section-collapse__title">更新页说明</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <div class="panel-description">
                                                    用于
                                                    <code>/changelog</code>
                                                    顶部简介与统计说明，适合维护版本说明、作者信息和当前版本摘要。
                                                </div>
                                                <a-form
                                                    :model="formData"
                                                    :label-col-props="{ span: 5 }"
                                                    :wrapper-col-props="{ span: 19 }"
                                                    class="compact-form"
                                                >
                                                    <a-form-item label="顶部说明">
                                                        <a-textarea
                                                            v-model="formData.toolsChangelogIntroText"
                                                            :rows="3"
                                                            maxlength="160"
                                                            show-word-limit
                                                            placeholder="例如：UIED-Tools 现已开放主站、Go API 与管理后台源码。"
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="统计说明">
                                                        <a-input
                                                            v-model="formData.toolsChangelogStatsText"
                                                            maxlength="80"
                                                            show-word-limit
                                                            placeholder="例如：当前版本：3.0.1 全栈开源版 | 最后更新：2026-08-25"
                                                        />
                                                    </a-form-item>
                                                </a-form>
                                            </a-card>
                                        </a-collapse-item>
                                        <a-collapse-item key="changelog_timeline">
                                            <template #header>
                                                <span class="layout-section-collapse__title">更新页时间线正文</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>更新记录页正文时间线</span>
                                                        <a-space>
                                                            <a-tag color="arcoblue" bordered
                                                                >版本 {{ changelogTimelineVersionCount }}</a-tag
                                                            >
                                                            <a-tag color="green" bordered
                                                                >功能块 {{ changelogTimelineFeatureCount }}</a-tag
                                                            >
                                                        </a-space>
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    用于
                                                    <code>/changelog</code>
                                                    正文时间线。当前采用结构化 JSON 配置，建议通过“导出布局 JSON →
                                                    局部修改 → 再导入”维护，避免手工改错层级。
                                                </div>
                                                <a-alert
                                                    v-if="changelogTimelineParseResult.error"
                                                    class="layout-section-alert"
                                                    type="warning"
                                                    :closable="false"
                                                    show-icon
                                                >
                                                    {{ changelogTimelineParseResult.error }}
                                                </a-alert>
                                                <a-textarea
                                                    v-model="formData.toolsChangelogTimeline"
                                                    :rows="18"
                                                    placeholder="请粘贴更新记录时间线 JSON"
                                                />
                                                <div
                                                    class="link-preview-board"
                                                    v-if="changelogTimelinePreviewList.length > 0"
                                                >
                                                    <div class="preview-title">时间线预览（前 8 条）</div>
                                                    <div class="preview-chip-list">
                                                        <div
                                                            v-for="(item, index) in changelogTimelinePreviewList"
                                                            :key="`changelog-timeline-preview-${index}`"
                                                            class="preview-chip"
                                                        >
                                                            <span class="chip-name"
                                                                >{{ item.version }} · {{ item.title }}</span
                                                            >
                                                            <a-tag size="small" color="arcoblue" bordered>{{
                                                                item.date
                                                            }}</a-tag>
                                                        </div>
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item v-if="!simpleMode" key="changelog_header_links">
                                            <template #header>
                                                <span class="layout-section-collapse__title">更新页顶部链接</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>更新记录页顶部链接</span>
                                                        <a-button type="text" @click="addChangelogHeaderLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    用于
                                                    <code>/changelog</code>
                                                    顶部快捷入口，建议聚焦开源版、内容站、社区入口等强运营链接。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.changelogHeaderLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.changelogHeaderLinks"
                                                    :key="`changelog-header-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input v-model="item.name" placeholder="名称，如：AI资讯热榜" />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="链接，如：https://hot.uied.cn"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.changelogHeaderLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.changelogHeaderLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeChangelogHeaderLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item v-if="!simpleMode" key="changelog_meta_links">
                                            <template #header>
                                                <span class="layout-section-collapse__title">更新页资料链接</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>更新记录页资料链接</span>
                                                        <a-button type="text" @click="addChangelogMetaLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div class="panel-description">
                                                    用于更新记录页标题下方的站点资料入口，建议放仓库、博客、官网等稳定入口。
                                                </div>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.changelogMetaLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.changelogMetaLinks"
                                                    :key="`changelog-meta-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input
                                                        v-model="item.name"
                                                        placeholder="名称，如：GitHub（开源版）"
                                                    />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="链接，如：https://github.com/Tomccc520/UIED-tools"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.changelogMetaLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.changelogMetaLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeChangelogMetaLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item v-if="!simpleMode" key="changelog_split">
                                            <template #header>
                                                <span class="layout-section-collapse__title">开源说明</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <div class="panel-description">
                                                    用于更新记录页顶部的开源说明区，集中展示源码仓库、许可范围和部署入口。
                                                </div>
                                                <a-form
                                                    :model="formData"
                                                    :label-col-props="{ span: 5 }"
                                                    :wrapper-col-props="{ span: 19 }"
                                                    class="compact-form"
                                                >
                                                    <a-form-item label="提示标题">
                                                        <a-input
                                                            v-model="formData.toolsChangelogSplitTitle"
                                                            maxlength="40"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="提示说明">
                                                        <a-textarea
                                                            v-model="formData.toolsChangelogSplitDesc"
                                                            :rows="4"
                                                            maxlength="160"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="按钮文案">
                                                        <a-input
                                                            v-model="formData.toolsChangelogSplitLinkText"
                                                            maxlength="40"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="按钮链接">
                                                        <a-input
                                                            v-model="formData.toolsChangelogSplitLink"
                                                            placeholder="如：https://github.com/Tomccc520/UIED-tools"
                                                        />
                                                    </a-form-item>
                                                </a-form>
                                            </a-card>
                                        </a-collapse-item>
                                    </a-collapse>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('header')"
                                    key="header"
                                    title="头部设置（顶部导航）"
                                >
                                    <div class="footer-summary-grid">
                                        <div class="footer-summary-card">
                                            <div class="summary-label">头部快捷链接</div>
                                            <div class="summary-value">{{ headerLinkCount }}</div>
                                            <div class="summary-desc">用于顶部导航右侧入口</div>
                                        </div>
                                        <div class="footer-summary-card">
                                            <div class="summary-label">搜索快捷入口</div>
                                            <div class="summary-value">
                                                {{ searchQuickToolCount }}
                                            </div>
                                            <div class="summary-desc">用于搜索面板默认推荐</div>
                                        </div>
                                    </div>
                                    <a-card class="panel-card">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>头部快捷链接</span>
                                                <a-button type="text" @click="addHeaderLink">新增链接</a-button>
                                            </div>
                                        </template>
                                        <div class="panel-description">
                                            用于前端头部导航右侧快捷入口，建议控制在 3-8 条，避免过长导致换行。
                                        </div>
                                        <div class="row-list-empty" v-if="layoutForm.headerLinks.length === 0">
                                            当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                        </div>
                                        <div
                                            v-for="(item, index) in layoutForm.headerLinks"
                                            :key="`header-${index}`"
                                            class="link-row"
                                        >
                                            <a-input v-model="item.name" placeholder="名称，如：个人网站" />
                                            <a-input
                                                v-model="item.link"
                                                placeholder="链接，如：https://uiedtool.com/"
                                            />
                                            <div class="row-actions">
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.headerLinks, index, -1)"
                                                    >上移</a-button
                                                >
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.headerLinks, index, 1)"
                                                    >下移</a-button
                                                >
                                                <a-button type="text" status="danger" @click="removeHeaderLink(index)"
                                                    >删除</a-button
                                                >
                                            </div>
                                        </div>
                                        <div class="link-preview-board" v-if="layoutForm.headerLinks.length > 0">
                                            <div class="preview-title">链接预览</div>
                                            <div class="preview-chip-list">
                                                <div
                                                    class="preview-chip"
                                                    v-for="(item, index) in layoutForm.headerLinks"
                                                    :key="`header-preview-${index}`"
                                                >
                                                    <span class="chip-name">{{
                                                        item.name || `未命名${index + 1}`
                                                    }}</span>
                                                    <a-tag size="small" color="arcoblue" bordered>{{
                                                        getLinkTypeLabel(item.link)
                                                    }}</a-tag>
                                                </div>
                                            </div>
                                        </div>
                                    </a-card>
                                    <a-card class="panel-card panel-card--spaced">
                                        <template #title>
                                            <div class="panel-header-actions">
                                                <span>搜索面板快捷入口</span>
                                                <a-button type="text" @click="addSearchQuickTool">新增入口</a-button>
                                            </div>
                                        </template>
                                        <div class="panel-description">
                                            用于前端搜索面板首屏默认推荐，建议维护 4-8 条高频 AI /
                                            工具入口，支持标题、简介和链接。
                                        </div>
                                        <a-form
                                            :model="formData"
                                            :label-col-props="{ span: 6 }"
                                            :wrapper-col-props="{ span: 18 }"
                                            class="compact-form search-provider-form"
                                        >
                                            <a-form-item label="服务方名称">
                                                <a-input
                                                    v-model="formData.toolsSearchProviderLabel"
                                                    maxlength="80"
                                                    show-word-limit
                                                    placeholder="如：硅基流动 x 华为云联合 SiliconFlow"
                                                />
                                            </a-form-item>
                                            <a-form-item label="服务方链接">
                                                <a-input
                                                    v-model="formData.toolsSearchProviderLink"
                                                    placeholder="如：https://cloud.siliconflow.cn/i/AZywGNhl"
                                                />
                                            </a-form-item>
                                        </a-form>
                                        <div class="row-list-empty" v-if="layoutForm.searchQuickTools.length === 0">
                                            当前还没有入口配置，建议先点击“新增入口”补一条基础内容。
                                        </div>
                                        <div
                                            v-for="(item, index) in layoutForm.searchQuickTools"
                                            :key="`search-quick-${index}`"
                                            class="link-row search-quick-row"
                                        >
                                            <a-input v-model="item.name" placeholder="标题，如：DeepSeek R1对话" />
                                            <a-input
                                                v-model="item.desc"
                                                placeholder="简介，如：基于 DeepSeek-R1 推理模型的智能对话"
                                            />
                                            <a-input
                                                v-model="item.link"
                                                placeholder="链接，如：/tools/ai/deepseek-r1"
                                            />
                                            <div class="row-actions">
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.searchQuickTools, index, -1)"
                                                    >上移</a-button
                                                >
                                                <a-button
                                                    type="text"
                                                    @click="moveLinkItem(layoutForm.searchQuickTools, index, 1)"
                                                    >下移</a-button
                                                >
                                                <a-button
                                                    type="text"
                                                    status="danger"
                                                    @click="removeSearchQuickTool(index)"
                                                    >删除</a-button
                                                >
                                            </div>
                                        </div>
                                        <div class="link-preview-board" v-if="layoutForm.searchQuickTools.length > 0">
                                            <div class="preview-title">搜索面板预览</div>
                                            <div class="search-quick-preview-list">
                                                <div
                                                    class="search-quick-preview-card"
                                                    v-for="(item, index) in layoutForm.searchQuickTools"
                                                    :key="`search-preview-${index}`"
                                                >
                                                    <div class="search-quick-preview-head">
                                                        <span class="chip-name">{{
                                                            item.name || `未命名${index + 1}`
                                                        }}</span>
                                                        <a-tag size="small" color="arcoblue" bordered>{{
                                                            getLinkTypeLabel(item.link)
                                                        }}</a-tag>
                                                    </div>
                                                    <div class="search-quick-preview-desc">
                                                        {{ item.desc || '未填写简介，前端会只显示标题。' }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a-card>
                                </a-tab-pane>

                                <a-tab-pane
                                    v-if="isModuleTabEnabled('footer')"
                                    key="footer"
                                    title="页脚设置（全站底部）"
                                >
                                    <div class="footer-summary-grid">
                                        <div class="footer-summary-card">
                                            <div class="summary-label">快捷入口分组</div>
                                            <div class="summary-value">
                                                {{ footerQuickSectionCount }}
                                            </div>
                                            <div class="summary-desc">链接总数：{{ footerQuickLinkCount }}</div>
                                        </div>
                                        <div class="footer-summary-card">
                                            <div class="summary-label">友情链接分组</div>
                                            <div class="summary-value">
                                                {{ footerFriendSectionCount }}
                                            </div>
                                            <div class="summary-desc">链接总数：{{ footerFriendLinkCount }}</div>
                                        </div>
                                    </div>
                                    <a-collapse
                                        v-model:active-key="footerSectionCollapseKeys"
                                        class="layout-section-collapse"
                                        :bordered="false"
                                    >
                                        <a-collapse-item key="basic">
                                            <template #header>
                                                <span class="layout-section-collapse__title">基础文案</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <div class="panel-description">
                                                    设置页脚介绍文案与区块标题。介绍文案支持
                                                    <code>{webName}</code> 占位符。
                                                </div>
                                                <a-form
                                                    :model="formData"
                                                    :label-col-props="{ span: 6 }"
                                                    :wrapper-col-props="{ span: 18 }"
                                                    class="compact-form"
                                                >
                                                    <a-form-item label="介绍文案">
                                                        <a-input
                                                            v-model="formData.toolsFooterIntro"
                                                            maxlength="120"
                                                            show-word-limit
                                                            placeholder="支持 {webName} 占位符"
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="快捷入口标题">
                                                        <a-input
                                                            v-model="formData.toolsFooterQuickTitle"
                                                            maxlength="20"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="友情链接标题">
                                                        <a-input
                                                            v-model="formData.toolsFooterFriendTitle"
                                                            maxlength="20"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="官方媒体标题">
                                                        <a-input
                                                            v-model="formData.toolsOfficialMediaTitle"
                                                            maxlength="20"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                    <a-form-item label="技术支持标签">
                                                        <a-input
                                                            v-model="formData.toolsFooterSupportLabel"
                                                            maxlength="20"
                                                            show-word-limit
                                                        />
                                                    </a-form-item>
                                                </a-form>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="support_links">
                                            <template #header>
                                                <span class="layout-section-collapse__title">技术支持链接</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>技术支持链接</span>
                                                        <a-button type="text" @click="addFooterSupportLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.footerSupportLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.footerSupportLinks"
                                                    :key="`support-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input v-model="item.name" placeholder="名称" />
                                                    <a-input v-model="item.link" placeholder="链接" />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.footerSupportLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.footerSupportLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeFooterSupportLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="record_links">
                                            <template #header>
                                                <span class="layout-section-collapse__title">备案与版权</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>底部备案与版权链接</span>
                                                        <a-button type="text" @click="addFooterRecordLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.footerRecordLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.footerRecordLinks"
                                                    :key="`record-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input
                                                        v-model="item.name"
                                                        placeholder="名称，如：粤ICP备2022056875号"
                                                    />
                                                    <a-input
                                                        v-model="item.link"
                                                        placeholder="链接，如：https://beian.miit.gov.cn/"
                                                    />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.footerRecordLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.footerRecordLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeFooterRecordLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="quick_sections">
                                            <template #header>
                                                <span class="layout-section-collapse__title">快捷入口分组</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>页脚快捷入口分组</span>
                                                        <a-button type="text" @click="addQuickSection"
                                                            >新增分组</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.footerQuickSections.length === 0"
                                                >
                                                    当前还没有分组配置，建议先点击“新增分组”补一组基础内容。
                                                </div>
                                                <div
                                                    v-for="(section, sectionIndex) in layoutForm.footerQuickSections"
                                                    :key="`quick-section-${sectionIndex}`"
                                                    class="section-card"
                                                >
                                                    <div class="section-title-row">
                                                        <a-input
                                                            v-model="section.title"
                                                            placeholder="分组标题，如：设计"
                                                        />
                                                        <div class="row-actions">
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveSection(
                                                                        layoutForm.footerQuickSections,
                                                                        sectionIndex,
                                                                        -1
                                                                    )
                                                                "
                                                                >上移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveSection(
                                                                        layoutForm.footerQuickSections,
                                                                        sectionIndex,
                                                                        1
                                                                    )
                                                                "
                                                                >下移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                status="danger"
                                                                @click="removeQuickSection(sectionIndex)"
                                                                >删除分组</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                    <div
                                                        v-for="(item, itemIndex) in section.items"
                                                        :key="`quick-item-${sectionIndex}-${itemIndex}`"
                                                        class="link-row"
                                                    >
                                                        <a-input v-model="item.name" placeholder="链接名称" />
                                                        <a-input v-model="item.link" placeholder="链接地址" />
                                                        <div class="row-actions">
                                                            <a-button
                                                                type="text"
                                                                @click="moveLinkItem(section.items, itemIndex, -1)"
                                                                >上移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                @click="moveLinkItem(section.items, itemIndex, 1)"
                                                                >下移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                status="danger"
                                                                @click="removeQuickItem(sectionIndex, itemIndex)"
                                                                >删除</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                    <a-button type="text" @click="addQuickItem(sectionIndex)"
                                                        >新增分组链接</a-button
                                                    >
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="friend_sections">
                                            <template #header>
                                                <span class="layout-section-collapse__title">友情链接分组</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>友情链接分组</span>
                                                        <a-button type="text" @click="addFriendSection"
                                                            >新增分组</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.footerFriendSections.length === 0"
                                                >
                                                    当前还没有分组配置，建议先点击“新增分组”补一组基础内容。
                                                </div>
                                                <div
                                                    v-for="(section, sectionIndex) in layoutForm.footerFriendSections"
                                                    :key="`friend-section-${sectionIndex}`"
                                                    class="section-card"
                                                >
                                                    <div class="section-title-row">
                                                        <a-input
                                                            v-model="section.title"
                                                            placeholder="分组标题，如：AI"
                                                        />
                                                        <div class="row-actions">
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveSection(
                                                                        layoutForm.footerFriendSections,
                                                                        sectionIndex,
                                                                        -1
                                                                    )
                                                                "
                                                                >上移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                @click="
                                                                    moveSection(
                                                                        layoutForm.footerFriendSections,
                                                                        sectionIndex,
                                                                        1
                                                                    )
                                                                "
                                                                >下移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                status="danger"
                                                                @click="removeFriendSection(sectionIndex)"
                                                                >删除分组</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                    <div
                                                        v-for="(item, itemIndex) in section.items"
                                                        :key="`friend-item-${sectionIndex}-${itemIndex}`"
                                                        class="link-row"
                                                    >
                                                        <a-input v-model="item.name" placeholder="链接名称" />
                                                        <a-input v-model="item.link" placeholder="链接地址" />
                                                        <div class="row-actions">
                                                            <a-button
                                                                type="text"
                                                                @click="moveLinkItem(section.items, itemIndex, -1)"
                                                                >上移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                @click="moveLinkItem(section.items, itemIndex, 1)"
                                                                >下移</a-button
                                                            >
                                                            <a-button
                                                                type="text"
                                                                status="danger"
                                                                @click="removeFriendItem(sectionIndex, itemIndex)"
                                                                >删除</a-button
                                                            >
                                                        </div>
                                                    </div>
                                                    <a-button type="text" @click="addFriendItem(sectionIndex)"
                                                        >新增分组链接</a-button
                                                    >
                                                </div>
                                            </a-card>
                                        </a-collapse-item>

                                        <a-collapse-item key="official_media_links">
                                            <template #header>
                                                <span class="layout-section-collapse__title">官方媒体链接</span>
                                            </template>
                                            <a-card class="panel-card">
                                                <template #title>
                                                    <div class="panel-header-actions">
                                                        <span>官方媒体链接</span>
                                                        <a-button type="text" @click="addOfficialMediaLink"
                                                            >新增链接</a-button
                                                        >
                                                    </div>
                                                </template>
                                                <div
                                                    class="row-list-empty"
                                                    v-if="layoutForm.officialMediaLinks.length === 0"
                                                >
                                                    当前还没有链接配置，建议先点击“新增链接”补一条基础内容。
                                                </div>
                                                <div
                                                    v-for="(item, index) in layoutForm.officialMediaLinks"
                                                    :key="`official-${index}`"
                                                    class="link-row"
                                                >
                                                    <a-input v-model="item.name" placeholder="媒体名称，如：知乎" />
                                                    <a-input v-model="item.link" placeholder="链接地址" />
                                                    <div class="row-actions">
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.officialMediaLinks, index, -1)
                                                            "
                                                            >上移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            @click="
                                                                moveLinkItem(layoutForm.officialMediaLinks, index, 1)
                                                            "
                                                            >下移</a-button
                                                        >
                                                        <a-button
                                                            type="text"
                                                            status="danger"
                                                            @click="removeOfficialMediaLink(index)"
                                                            >删除</a-button
                                                        >
                                                    </div>
                                                </div>
                                            </a-card>
                                        </a-collapse-item>
                                    </a-collapse>
                                </a-tab-pane>
                            </a-tabs>
                        </section>
                    </div>
                </div>

                <a-modal v-model:visible="importDialogVisible" title="导入前端布局配置" :width="680" unmount-on-close>
                    <a-alert type="warning" :closable="false" show-icon class="import-dialog-alert">
                        仅支持导入本页面导出的 JSON 配置，导入后会覆盖当前编辑区内容，记得保存生效。
                    </a-alert>
                    <a-textarea v-model="importJsonText" :rows="14" placeholder="请粘贴导出的 JSON 内容" />
                    <template #footer>
                        <div class="dialog-footer">
                            <a-button @click="importDialogVisible = false">取消</a-button>
                            <a-button type="primary" @click="applyImportLayoutJson">导入并覆盖</a-button>
                        </div>
                    </template>
                </a-modal>
            </a-card>

            <div v-if="hasUnsavedChanges" class="layout-floating-submit">
                <div class="layout-floating-submit__left">
                    <a-tag color="orange" bordered>有未保存更改</a-tag>
                    <span class="layout-floating-submit__text">建议保存后再切换页面，避免运营配置丢失。</span>
                </div>
                <a-space>
                    <a-button data-admin-smoke="frontend-layout-health-check-floating" @click="runLayoutHealthCheck"
                        >一键体检</a-button
                    >
                    <a-button
                        data-admin-smoke="frontend-layout-save-floating"
                        type="primary"
                        :loading="isSubmitting"
                        :disabled="isLoadingData"
                        @click="handleSubmit"
                        >立即保存</a-button
                    >
                </a-space>
            </div>
        </a-spin>
    </div>
</template>

<script lang="ts" setup name="websiteFrontendLayout">
import { getWebsite, setWebsite } from '@/api/setting/website'
import useAppStore from '@/stores/modules/app'
import feedback from '@/utils/feedback'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import { resolveToolsPreviewUrl } from './composables/use-preview-url'
import defaultChangelogTimelineSource from './defaults/changelogTimeline'

interface ToolsLinkItem {
    name: string
    link: string
    desc?: string
}

interface ToolsBannerSlideItem {
    badge: string
    text: string
    link: string
    gradient: string
}

interface ToolsSidebarCategoryMenuItem {
    key: string
    title: string
    cateTitle: string
    link?: string
    icon?: string
}

type ToolsSidebarMenuBlockType = 'dropdown' | 'list' | 'image' | 'category'

interface ToolsSidebarMenuBlockItem {
    name: string
    link: string
    icon?: string
    image?: string
    desc?: string
    category?: string
}

interface ToolsSidebarMenuBlockItemNormalized extends ToolsSidebarMenuBlockItem {
    icon: string
    image: string
}

interface ToolsSidebarMenuBlockItemEditor extends ToolsSidebarMenuBlockItem {
    icon: string
    image: string
    desc: string
    category: string
}

interface ToolsSidebarMenuBlock {
    key: string
    title: string
    type: ToolsSidebarMenuBlockType
    icon?: string
    items: ToolsSidebarMenuBlockItem[]
}

interface ToolsSidebarMenuBlockEditor {
    key: string
    title: string
    type: ToolsSidebarMenuBlockType
    icon: string
    items: ToolsSidebarMenuBlockItemEditor[]
}

interface ToolsLinkSection {
    title: string
    items: ToolsLinkItem[]
}

interface SidebarIconOption {
    label: string
    value: string
}

interface ToolsCatalogToolItem {
    id?: number
    title: string
    desc?: string
    url: string
    logo?: string | Record<string, unknown>
    releaseDate?: string
    tags?: string[]
    icon?: string
    isNew?: boolean
    gradient?: string
    badge?: string
    text?: string
    seoTitle?: string
    seoKeywords?: string
    seoDescription?: string
    seoImage?: string
}

interface ToolsCatalogSubCategoryItem {
    id?: number
    title: string
    list: ToolsCatalogToolItem[]
}

interface ToolsCatalogCategoryItem {
    id?: number
    title: string
    icon?: string
    list: ToolsCatalogSubCategoryItem[]
}

interface ToolsCategoryTreeParseResult {
    items: ToolsCatalogCategoryItem[]
    error: string
}

interface ToolsCatalogPreviewCard {
    title: string
    groupCount: number
    toolCount: number
    sampleTools: string[]
}

interface ToolsSeoPageItem {
    path: string
    title: string
    keywords: string
    description: string
    image: string
}

interface ToolsChangelogFeatureItem {
    title: string
    points: string[]
}

interface ToolsChangelogTimelineItem {
    id: string
    version: string
    date: string
    badgeText: string
    badgeType: string
    title: string
    features: ToolsChangelogFeatureItem[]
}

interface ToolsChangelogTimelineParseResult {
    items: ToolsChangelogTimelineItem[]
    error: string
}

interface ModuleOverviewItem {
    key: string
    label: string
    description: string
    configuredCount: number
    missingCount: number
}

const defaultHeaderLinks: ToolsLinkItem[] = [{ name: '官网首页', link: 'https://uiedtool.com/' }]
const defaultSearchQuickTools: ToolsLinkItem[] = [
    {
        name: 'DeepSeek R1对话',
        desc: '基于 DeepSeek-R1 推理模型的智能对话',
        link: '/tools/ai/deepseek-r1',
    },
    {
        name: 'DeepSeek AI对话',
        desc: '基础智能对话服务',
        link: '/tools/ai/deepseek',
    },
    {
        name: 'DeepSeek提示词',
        desc: '专业的 Prompt 提示词指南',
        link: '/tools/ai/deepseek-prompt',
    },
    {
        name: 'DeepSeek导航',
        desc: 'DeepSeek 模型与工具导航',
        link: '/tools/ai/deepseek-nav',
    },
    {
        name: 'AI封面设计',
        desc: 'AI智能生成封面图片',
        link: '/tools/ai-design-cover',
    },
    {
        name: 'AI产品榜',
        desc: '跳转至 AI 产品导航站',
        link: 'https://hao.uied.cn/',
    },
]
const defaultSearchProviderLabel = '硅基流动 x 华为云联合 SiliconFlow'
const defaultSearchProviderLink = 'https://cloud.siliconflow.cn/i/AZywGNhl'
const defaultHomepageLearningTitle = '每日学习'
const defaultHomepageLearningRssUrl = 'https://www.uied.cn/api/open/v1/rss.xml'
const defaultHomepageLearningFilterType = 'all'
const defaultHomepageLearningLimit = 20
const defaultBannerSlides: ToolsBannerSlideItem[] = [
    {
        badge: '推荐',
        text: '一人企业Vibe Coding社区！',
        link: 'https://fsuied.com',
        gradient: 'linear-gradient(to right,#6366f1,#e0e7ff,#edf2ff,#8b5cf6)',
    },
    {
        badge: '热门',
        text: 'GPT-5.4重回巅峰 智能对话',
        link: 'https://nf.video/mbx1u6/?gid=18',
        gradient: 'linear-gradient(to right,#ec4899,#fbe7ef,#fdf2f8,#f472b6)',
    },
    {
        badge: '新品',
        text: '免费AI编程工具 Trae - 智能编码助手',
        link: 'https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied',
        gradient: 'linear-gradient(to right,#a855f7,#f3e8ff,#f5f3ff,#c084fc)',
    },
    {
        badge: '新品',
        text: '腾讯元宝 智能对话新体验',
        link: 'https://yuanbao.paluai.com/uied',
        gradient: 'linear-gradient(to right,#ffc800,#ffed99,#fff8cc,#ffaa00)',
    },
    {
        badge: '高效',
        text: '免费AI生成PPT - 一键生成演示文稿',
        link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047',
        gradient: 'linear-gradient(to right,#10b981,#d1fae5,#ecfdf5,#34d399)',
    },
    {
        badge: '特惠',
        text: 'Adobe 正版全家桶可用AI',
        link: 'https://universalbus.cn/?s=lPLG02aydo',
        gradient: 'linear-gradient(to right,#f97316,#ffedd5,#fff7ed,#fb923c)',
    },
    {
        badge: '新品',
        text: 'Gemini3 可用 nanobanana',
        link: 'https://universalbus.cn/?s=lPLG02aydo',
        gradient: 'linear-gradient(to right,#0ea5e9,#e0f2fe,#f0f9ff,#38bdf8)',
    },
]
const defaultSidebarRecommendLinks: ToolsLinkItem[] = [
    { name: '热门工具', link: '#recommend-hot' },
    { name: '随机推荐', link: '/tools/random-tools' },
    { name: '每日热榜', link: '/tools/hot-ranking' },
    { name: '每日文章', link: 'https://hot.uied.cn/' },
    { name: '实时资讯', link: '/tools/ai-news' },
    { name: 'AI产品榜', link: 'https://hao.uied.cn/' },
]
const defaultSidebarCategoryMenus: ToolsSidebarCategoryMenuItem[] = [
    {
        key: 'ai',
        title: 'AI工具箱',
        cateTitle: 'AI工具箱',
        link: '/tools/ai/toolbox',
        icon: '/icons/sidebar/ai.svg',
    },
    {
        key: 'design',
        title: '设计工具',
        cateTitle: '设计工具',
        icon: '/icons/sidebar/design.svg',
    },
    {
        key: 'image',
        title: '图片处理',
        cateTitle: '图片处理',
        icon: '/icons/sidebar/image.svg',
    },
    {
        key: 'office',
        title: '办公工具',
        cateTitle: '办公工具',
        icon: '/icons/sidebar/office.svg',
    },
    {
        key: 'daily',
        title: '生活常用',
        cateTitle: '生活常用',
        icon: '/icons/sidebar/daily.svg',
    },
    {
        key: 'copywriting',
        title: '文案工具',
        cateTitle: '文案工具',
        icon: '/icons/sidebar/copywriting.svg',
    },
    {
        key: 'psychology',
        title: '潜能测试',
        cateTitle: '潜能测试',
        icon: '/icons/sidebar/psychology.svg',
    },
    {
        key: 'video',
        title: '剪辑工具',
        cateTitle: '剪辑工具',
        icon: '/icons/sidebar/video.svg',
    },
    {
        key: 'dev',
        title: '开发工具',
        cateTitle: '开发工具',
        icon: '/icons/sidebar/dev.svg',
    },
    {
        key: 'slacking',
        title: '摸鱼工具',
        cateTitle: '摸鱼工具',
        icon: '/icons/sidebar/slacking.svg',
    },
    {
        key: 'efficiency',
        title: '效率工具',
        cateTitle: '效率工具',
        icon: '/icons/sidebar/efficiency.svg',
    },
]
const sidebarMenuBlockTypeOptions: Array<{
    label: string
    value: ToolsSidebarMenuBlockType
}> = [
    { label: '下拉菜单', value: 'dropdown' },
    { label: '列表菜单', value: 'list' },
    { label: '图片菜单', value: 'image' },
    { label: '分类菜单', value: 'category' },
]
const defaultSidebarMenuBlocks: ToolsSidebarMenuBlock[] = []
const builtinSidebarIconOptions: SidebarIconOption[] = [
    { label: 'AI工具箱', value: '/icons/sidebar/ai.svg' },
    { label: '设计工具', value: '/icons/sidebar/design.svg' },
    { label: '图片处理', value: '/icons/sidebar/image.svg' },
    { label: '办公工具', value: '/icons/sidebar/office.svg' },
    { label: '生活常用', value: '/icons/sidebar/daily.svg' },
    { label: '文案工具', value: '/icons/sidebar/copywriting.svg' },
    { label: '潜能测试', value: '/icons/sidebar/psychology.svg' },
    { label: '剪辑工具', value: '/icons/sidebar/video.svg' },
    { label: '开发工具', value: '/icons/sidebar/dev.svg' },
    { label: '摸鱼工具', value: '/icons/sidebar/slacking.svg' },
    { label: '效率工具', value: '/icons/sidebar/efficiency.svg' },
    { label: '默认图标', value: '/icons/sidebar/default.svg' },
]
const defaultSidebarBottomLinks: ToolsLinkItem[] = [
    { name: '更新记录', link: '/changelog' },
    { name: '意见反馈', link: 'https://uiedtool.com/' },
    { name: '关于我们', link: '/about' },
]
const defaultAiToolboxSidebarMenus: ToolsLinkItem[] = [
    { name: 'AI精选工具', link: '#ai-highlight' },
    { name: 'AI分组总览', link: '#ai-groups' },
]
const defaultChangelogHeaderLinks: ToolsLinkItem[] = [
    { name: 'AI学习平台', link: 'https://www.uied.cn/' },
    { name: 'AI免费工具', link: 'https://uiedtool.com' },
    { name: 'AI资讯热榜', link: 'https://hot.uied.cn' },
    { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' },
    {
        name: 'AI交流群',
        link: 'https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink',
    },
    {
        name: 'AI知识库',
        link: 'https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink',
    },
]
const defaultChangelogIntroText =
    'UIED-Tools 现已开放主站、Go API 与管理后台源码，持续以免费工具、内容与社区共建获取长期流量。'
const defaultChangelogMetaLinks: ToolsLinkItem[] = [
    { name: 'GitHub 源码仓库', link: 'https://github.com/Tomccc520/UIED-tools' },
    { name: '提交问题', link: 'https://github.com/Tomccc520/UIED-tools/issues' },
    {
        name: 'CSDN 博客',
        link: 'https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343',
    },
    { name: 'UIED技术团队', link: 'https://fsuied.com/' },
]
const defaultChangelogSplitTitle = '3.0.1 全栈开源说明'
const defaultChangelogSplitDesc =
    '本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。商业授权默认关闭，项目优先服务免费使用、SEO 内容和社区贡献。'
const defaultChangelogSplitLink = 'https://github.com/Tomccc520/UIED-tools'
const defaultChangelogSplitLinkText = '查看完整源码与部署说明'
const defaultChangelogStatsText = '当前版本：3.0.1 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-08-25 14:17'
const defaultChangelogTimeline = (defaultChangelogTimelineSource as ToolsChangelogTimelineItem[]).map((item) => ({
    ...item,
    features: Array.isArray(item.features)
        ? item.features.map((feature) => ({
              title: String(feature.title || '').trim(),
              points: Array.isArray(feature.points)
                  ? feature.points.map((point) => String(point || '').trim()).filter(Boolean)
                  : [],
          }))
        : [],
}))
const defaultAiChatHeaderLinks: ToolsLinkItem[] = defaultChangelogHeaderLinks.map((item) => ({
    ...item,
}))
const defaultAiCommonHeaderLinks: ToolsLinkItem[] = [
    {
        name: '每日免费分享最新AI资讯',
        link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink',
    },
    { name: 'AI学习平台', link: 'https://www.uied.cn/' },
    { name: 'AI免费工具uiedtool.com', link: 'https://uiedtool.com' },
    { name: 'AI资讯热榜hot.uied.cn', link: 'https://hot.uied.cn' },
    { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' },
]
const defaultFooterSupportLinks: ToolsLinkItem[] = [
    { name: 'uiedtool.com', link: 'https://uiedtool.com/' },
    { name: 'UIED技术团队', link: 'https://fsuied.com' },
]
const defaultFooterRecordLinks: ToolsLinkItem[] = [
    { name: '粤ICP备2022056875号', link: 'https://beian.miit.gov.cn/' },
    { name: '网站地图', link: '/sitemap.xml' },
]
const defaultOfficialMediaLinks: ToolsLinkItem[] = [
    {
        name: '知乎',
        link: 'https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi',
    },
    {
        name: '小红书',
        link: 'https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83',
    },
    { name: '微博', link: 'https://weibo.com/u/7542146005' },
    {
        name: 'B站',
        link: 'https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0',
    },
]
const defaultSeoPages: ToolsSeoPageItem[] = [
    {
        path: '/',
        title: '首页',
        keywords:
            'tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
        description:
            'tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
        image: '/favicon.ico',
    },
    {
        path: '/changelog',
        title: '更新日志',
        keywords: 'UIED-Tools更新日志,版本历史,功能更新',
        description: 'UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息',
        image: '/favicon.ico',
    },
    {
        path: '/user/login',
        title: '用户登录',
        keywords: '用户登录,QQ登录,微信登录,个人中心',
        description: 'UIED Tools 用户登录页，支持登录后进入个人中心，管理账号资料与QQ邮箱绑定。',
        image: '/favicon.ico',
    },
    {
        path: '/user/center',
        title: '个人中心',
        keywords: '个人中心,QQ邮箱绑定,用户资料',
        description: 'UIED Tools 个人中心，支持维护昵称与QQ邮箱绑定信息。',
        image: '/favicon.ico',
    },
    {
        path: '/tools/ai/toolbox',
        title: 'AI工具箱',
        keywords: 'AI工具箱,AI工具导航,AI工具合集,免费AI工具',
        description: 'UIED Tools AI工具箱聚合页，按分类整合对话、写作、图像、办公等高频 AI 工具。',
        image: '/favicon.ico',
    },
]
const defaultFooterQuickSections: ToolsLinkSection[] = [
    {
        title: '设计',
        items: [
            { name: '色彩对比度', link: '/tools/design/contrast-checker' },
            { name: 'CSS阴影', link: '/tools/design/box-shadow' },
            { name: '黄金比例', link: '/tools/design/golden-ratio' },
            { name: 'Blob生成器', link: '/tools/design/blob-maker' },
            { name: '玻璃拟态', link: '/tools/design/glassmorphism' },
        ],
    },
    {
        title: '图像',
        items: [
            { name: '图片压缩', link: '/tools/image-compress' },
            { name: '二维码生成', link: '/tools/qrcode' },
            { name: '图片切割', link: '/tools/img-cut' },
            { name: '图片处理', link: '/tools/signimage' },
            { name: 'GIF压缩', link: '/tools/gif-compress' },
        ],
    },
    {
        title: 'PDF',
        items: [
            { name: '图片转PDF', link: '/tools/img-to-pdf' },
            { name: 'PDF转图片', link: '/tools/pdf-to-images' },
            { name: 'PDF合并', link: '/tools/pdf-merge' },
            { name: 'PDF分割', link: '/tools/pdf-split' },
        ],
    },
    {
        title: '文本',
        items: [
            { name: '文本对比', link: '/tools/diff' },
            { name: 'Markdown编辑', link: '/tools/markdown' },
            { name: '字数统计', link: '/tools/wordcount' },
        ],
    },
    {
        title: '开发',
        items: [
            { name: 'JSON转换', link: '/tools/json' },
            { name: '正则测试', link: '/tools/reg' },
            { name: '时间戳', link: '/tools/timetran' },
        ],
    },
    {
        title: '文案',
        items: [
            { name: '疯狂星期四', link: '/tools/copywriting/kfc' },
            { name: '今日诗词', link: '/tools/copywriting/daily-poem' },
            { name: '舔狗日记', link: '/tools/copywriting/dog-diary' },
            { name: '朋友圈文案', link: '/tools/copywriting/moments' },
        ],
    },
]
const defaultFooterFriendSections: ToolsLinkSection[] = [
    {
        title: '官方入口',
        items: [
            { name: '官网首页', link: 'https://uiedtool.com/' },
            { name: 'AI工具箱', link: 'https://uiedtool.com/tools/ai/toolbox' },
            { name: '视频工具', link: 'https://uiedtool.com/tools/video' },
            { name: '更新日志', link: 'https://uiedtool.com/changelog' },
        ],
    },
    {
        title: '社区内容',
        items: [
            { name: 'AI资讯', link: 'https://hot.uied.cn/' },
            { name: '设计导航', link: 'https://hao.uied.cn/' },
            { name: 'UIED技术团队', link: 'https://fsuied.com' },
            { name: '关于我们', link: 'https://uiedtool.com/about' },
        ],
    },
]
const defaultToolsSiteSlogan = '免费在线工具集'
const defaultToolsSidebarBrandLogo = ''
const defaultToolsSidebarBrandText = 'UIED-Tools'
const defaultToolsSidebarRecommendTitle = '推荐工具'
const defaultToolsFooterIntro = '{webName} 是 UIED技术团队运营的 uiedtool.com 在线工具平台'
const defaultToolsFooterQuickTitle = '工具快捷入口'
const defaultToolsFooterFriendTitle = '友情链接'
const defaultToolsOfficialMediaTitle = '官方媒体'
const defaultToolsFooterSupportLabel = '技术支持'
const defaultToolsSeoDefaultTitle = ''
const defaultToolsSeoDefaultKeywords =
    '免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜'
const defaultToolsSeoDefaultDescription = 'UIED免费在线工具大全'
const defaultToolsSeoDefaultImage = '/favicon.ico'

/**
 * 函数说明：深拷贝链接数组，避免默认配置被表单编辑联动污染
 */
const cloneLinkItems = (items: ToolsLinkItem[]): ToolsLinkItem[] => {
    return items.map((item) => ({ ...item }))
}

/**
 * 函数说明：深拷贝分组链接数组，保证各分组 items 独立引用
 */
const cloneLinkSections = (sections: ToolsLinkSection[]): ToolsLinkSection[] => {
    return sections.map((section) => ({
        title: section.title,
        items: cloneLinkItems(section.items),
    }))
}

/**
 * 函数说明：深拷贝页面 SEO 配置，避免默认模板与表单状态互相污染。
 */
const cloneSeoPages = (items: ToolsSeoPageItem[]): ToolsSeoPageItem[] => {
    return items.map((item) => ({ ...item }))
}

/**
 * 函数说明：深拷贝更新记录时间线数组，避免默认模板与编辑态相互污染。
 */
const cloneChangelogTimeline = (items: ToolsChangelogTimelineItem[]): ToolsChangelogTimelineItem[] => {
    return items.map((item) => ({
        ...item,
        features: (Array.isArray(item.features) ? item.features : []).map((feature) => ({
            title: String(feature.title || '').trim(),
            points: Array.isArray(feature.points)
                ? feature.points.map((point) => String(point || '').trim()).filter(Boolean)
                : [],
        })),
    }))
}

/**
 * 函数说明：清洗更新记录时间线结构，统一版本、时间、徽标与要点字段。
 */
const normalizeChangelogTimeline = (input: unknown): ToolsChangelogTimelineItem[] => {
    if (!Array.isArray(input)) {
        return []
    }
    return input
        .map((item, index) => {
            if (!item || typeof item !== 'object') {
                return null
            }
            const record = item as Record<string, unknown>
            const version = String(record.version || '').trim()
            const date = String(record.date || '').trim()
            const title = String(record.title || '').trim()
            const badgeText = String(record.badgeText || '').trim()
            const badgeType = String(record.badgeType || '').trim() || 'info'
            const id =
                String(record.id || '').trim() ||
                `version-${String(version || index + 1)
                    .trim()
                    .replace(/[^\w-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase()}`
            const features = Array.isArray(record.features)
                ? record.features
                      .map((feature) => {
                          if (!feature || typeof feature !== 'object') {
                              return null
                          }
                          const featureRecord = feature as Record<string, unknown>
                          const featureTitle = String(featureRecord.title || '').trim()
                          const points = Array.isArray(featureRecord.points)
                              ? featureRecord.points.map((point) => String(point || '').trim()).filter(Boolean)
                              : []
                          if (!featureTitle || points.length === 0) {
                              return null
                          }
                          return {
                              title: featureTitle,
                              points,
                          }
                      })
                      .filter((feature): feature is ToolsChangelogFeatureItem => Boolean(feature))
                : []

            if (!version || !date || !title || features.length === 0) {
                return null
            }
            return {
                id,
                version,
                date,
                badgeText,
                badgeType,
                title,
                features,
            }
        })
        .filter((item): item is ToolsChangelogTimelineItem => Boolean(item))
}

/**
 * 函数说明：解析更新记录时间线 JSON 编辑器内容，失败时返回错误说明用于运营排查。
 */
const parseChangelogTimeline = (raw: string): ToolsChangelogTimelineParseResult => {
    const trimmed = String(raw || '').trim()
    if (!trimmed) {
        return {
            items: [],
            error: '',
        }
    }
    try {
        const parsed = JSON.parse(trimmed)
        const items = normalizeChangelogTimeline(parsed)
        return {
            items,
            error: '',
        }
    } catch (error) {
        return {
            items: [],
            error: `更新时间线 JSON 解析失败：${(error as Error).message}`,
        }
    }
}

/**
 * 函数说明：深拷贝侧栏菜单样式模块，保证块和块内条目引用独立。
 */
const cloneSidebarMenuBlocks = (blocks: ToolsSidebarMenuBlock[]): ToolsSidebarMenuBlockEditor[] => {
    return blocks.map((block) => ({
        key: String(block.key || '').trim(),
        title: String(block.title || '').trim(),
        type: block.type,
        icon: String(block.icon || '').trim(),
        items: (Array.isArray(block.items) ? block.items : []).map((item) => ({
            name: String(item.name || '').trim(),
            link: String(item.link || '').trim(),
            icon: String(item.icon || '').trim(),
            image: String(item.image || '').trim(),
            desc: String(item.desc || '').trim(),
            category: String(item.category || '').trim(),
        })),
    }))
}

const defaultHeaderLinksJson = JSON.stringify(defaultHeaderLinks)
const defaultSearchQuickToolsJson = JSON.stringify(defaultSearchQuickTools)
const defaultBannerSlidesJson = JSON.stringify(defaultBannerSlides)
const defaultSidebarRecommendLinksJson = JSON.stringify(defaultSidebarRecommendLinks)
const defaultSidebarCategoryMenusJson = JSON.stringify(defaultSidebarCategoryMenus)
const defaultSidebarMenuBlocksJson = JSON.stringify(defaultSidebarMenuBlocks)
const defaultSidebarBottomLinksJson = JSON.stringify(defaultSidebarBottomLinks)
const defaultAiToolboxSidebarMenusJson = JSON.stringify(defaultAiToolboxSidebarMenus)
const defaultChangelogHeaderLinksJson = JSON.stringify(defaultChangelogHeaderLinks)
const defaultChangelogMetaLinksJson = JSON.stringify(defaultChangelogMetaLinks)
const defaultChangelogTimelineJson = JSON.stringify(defaultChangelogTimeline, null, 2)
const defaultAiChatHeaderLinksJson = JSON.stringify(defaultAiChatHeaderLinks)
const defaultAiCommonHeaderLinksJson = JSON.stringify(defaultAiCommonHeaderLinks)
const defaultFooterSupportLinksJson = JSON.stringify(defaultFooterSupportLinks)
const defaultFooterRecordLinksJson = JSON.stringify(defaultFooterRecordLinks)
const defaultFooterQuickSectionsJson = JSON.stringify(defaultFooterQuickSections)
const defaultFooterFriendSectionsJson = JSON.stringify(defaultFooterFriendSections)
const defaultOfficialMediaLinksJson = JSON.stringify(defaultOfficialMediaLinks)
const defaultSeoPagesJson = JSON.stringify(defaultSeoPages)
const defaultToolsCategoryTreeJson = '[]'

const FRONTEND_LAYOUT_ACTIVE_TAB_KEY = 'uied_frontend_layout_active_tab'
const layoutModuleOrder = [
    'banner',
    'homepageLearning',
    'sidebar',
    'toolsCatalog',
    'seo',
    'aiToolbox',
    'pageOps',
    'header',
    'footer',
] as const
type LayoutModuleKey = (typeof layoutModuleOrder)[number]
const initialActiveTab = (() => {
    const storedTab = String(localStorage.getItem(FRONTEND_LAYOUT_ACTIVE_TAB_KEY) || '').trim()
    if (
        storedTab === 'seo' ||
        storedTab === 'toolsCatalog' ||
        storedTab === 'sidebar' ||
        storedTab === 'header' ||
        storedTab === 'footer' ||
        storedTab === 'aiToolbox'
    ) {
        return 'banner'
    }
    if ((layoutModuleOrder as readonly string[]).includes(storedTab)) {
        return storedTab as LayoutModuleKey
    }
    return 'banner'
})()
const activeTab = ref<LayoutModuleKey>(initialActiveTab)
const appStore = useAppStore()
const { getConfig } = appStore
const router = useRouter()
const importDialogVisible = ref(false)
const importJsonText = ref('')
const lastSavedAt = ref('')
const baselineLayoutSnapshot = ref('')
const isSubmitting = ref(false)
const isLoadingData = ref(false)
const loadErrorMessage = ref('')
const simpleMode = ref(true)
const layoutContextCollapseKeys = ref<(string | number)[]>([])
/**
 * 函数说明：维护 Banner 编辑项的展开状态，默认仅展开第一条减少页面信息量。
 */
const bannerSectionCollapseKeys = ref<(string | number)[]>(['0'])
/**
 * 函数说明：维护侧栏模块折叠分组展开状态，默认展开品牌配置分组。
 */
const sidebarSectionCollapseKeys = ref<(string | number)[]>(['brand'])
/**
 * 函数说明：维护页面运营模块折叠分组展开状态，默认展开更新页说明分组。
 */
const pageOpsSectionCollapseKeys = ref<(string | number)[]>(['changelog_intro'])
const pageOpsSimpleCollapseKeys: (string | number)[] = ['changelog_intro']
const pageOpsAdvancedCollapseKeys: (string | number)[] = ['changelog_intro']
/**
 * 函数说明：维护页脚模块折叠分组展开状态，默认展开基础文案分组。
 */
const footerSectionCollapseKeys = ref<(string | number)[]>(['basic'])
const officialSiteEntryCards = [
    {
        key: 'sidebar',
        title: '菜单设置',
        desc: '维护前端左侧菜单、推荐链接、一级菜单、底部入口与 AI 工具箱独立左栏。',
        path: '/official_site/sidebar',
    },
    {
        key: 'tools_catalog',
        title: '工具主数据',
        desc: '维护左侧菜单点击后的工具分类树、工具列表、工具简介与工具页 SEO 字段。',
        path: '/official_site/tools_catalog',
    },
    {
        key: 'header',
        title: '头部设置',
        desc: '维护顶部快捷入口、搜索面板快捷入口和 AI 页统一头部运营链接。',
        path: '/official_site/header',
    },
    {
        key: 'footer',
        title: '页脚设置',
        desc: '维护页脚版权、备案、分组链接与官方媒体入口。',
        path: '/official_site/footer',
    },
    {
        key: 'seo',
        title: 'SEO设置',
        desc: '维护全站默认 SEO、页面级 SEO 与分享图配置。',
        path: '/official_site/seo',
    },
] as const
const basicModeTabs: LayoutModuleKey[] = ['banner', 'homepageLearning', 'pageOps']
const layoutModuleLabelMap: Record<string, string> = {
    banner: '顶部Banner',
    homepageLearning: '每日学习',
    sidebar: '侧边栏菜单',
    toolsCatalog: '工具分类树',
    seo: 'SEO设置',
    aiToolbox: 'AI工具箱页',
    pageOps: '更新记录运营',
    header: '头部设置',
    footer: '页脚设置',
}
const layoutModuleDescMap: Record<string, string> = {
    banner: '首页横幅轮播内容',
    homepageLearning: '首页每日学习 RSS 文章源',
    sidebar: '左侧品牌、分类与固定入口',
    toolsCatalog: '全站工具分类与工具列表数据源',
    seo: '默认 SEO、页面 SEO 与分享图',
    aiToolbox: 'AI工具箱独立页固定导航',
    pageOps: '更新记录页说明、时间线与资料链接',
    header: '全站顶部快捷链接',
    footer: '全站底部文案与分组链接',
}

/**
 * 函数说明：从官网设置总览卡片跳转到对应独立运营页，减少运营寻找入口的成本。
 */
const goOfficialSiteEntry = (path: string) => {
    router.push(path)
}

/**
 * 函数说明：判断字符串是否为合法布局模块 key，避免无效跳转导致页面状态异常
 */
const isLayoutModuleKey = (moduleKey: string): moduleKey is LayoutModuleKey => {
    return (layoutModuleOrder as readonly string[]).includes(moduleKey)
}

/**
 * 函数说明：判断当前页面允许显示的模块，前端布局页保留 Banner、每日学习与更新记录运营。
 */
const isModuleTabVisible = (moduleKey: LayoutModuleKey): boolean => {
    return basicModeTabs.includes(moduleKey)
}

/**
 * 函数说明：判断模块页签在当前总览页是否可见。
 */
const isModuleTabEnabled = (moduleKey: LayoutModuleKey): boolean => {
    return isModuleTabVisible(moduleKey)
}

watch(
    () => activeTab.value,
    (moduleKey) => {
        localStorage.setItem(FRONTEND_LAYOUT_ACTIVE_TAB_KEY, moduleKey)
    },
    { immediate: true }
)

/**
 * 函数说明：运营模式切换时同步更新“页面运营”分组展开项，避免简版仍残留高级分组 key。
 */
watch(
    () => simpleMode.value,
    (isSimpleMode) => {
        pageOpsSectionCollapseKeys.value = isSimpleMode
            ? [...pageOpsSimpleCollapseKeys]
            : [...pageOpsAdvancedCollapseKeys]
    },
    { immediate: true }
)

// 使用完整站点字段，避免调用 website/save 时覆盖未编辑的配置
const formData = reactive<Record<string, string>>({
    name: '',
    favicon: '',
    logo: '',
    backdrop: '',
    shopName: '',
    shopLogo: '',
    toolsSiteSlogan: defaultToolsSiteSlogan,
    toolsSidebarBrandLogo: defaultToolsSidebarBrandLogo,
    toolsSidebarBrandText: defaultToolsSidebarBrandText,
    toolsSidebarRecommendTitle: defaultToolsSidebarRecommendTitle,
    toolsFooterIntro: defaultToolsFooterIntro,
    toolsFooterQuickTitle: defaultToolsFooterQuickTitle,
    toolsFooterFriendTitle: defaultToolsFooterFriendTitle,
    toolsOfficialMediaTitle: defaultToolsOfficialMediaTitle,
    toolsFooterSupportLabel: defaultToolsFooterSupportLabel,
    toolsFooterSupportLinks: defaultFooterSupportLinksJson,
    toolsFooterRecordLinks: defaultFooterRecordLinksJson,
    toolsHotTools: '[]',
    toolsBannerSlides: defaultBannerSlidesJson,
    toolsHeaderLinks: defaultHeaderLinksJson,
    toolsSearchQuickTools: defaultSearchQuickToolsJson,
    toolsSearchProviderLabel: defaultSearchProviderLabel,
    toolsSearchProviderLink: defaultSearchProviderLink,
    toolsSidebarRecommend: defaultSidebarRecommendLinksJson,
    toolsSidebarCategoryMenus: defaultSidebarCategoryMenusJson,
    toolsSidebarMenuBlocks: defaultSidebarMenuBlocksJson,
    toolsCategoryTree: defaultToolsCategoryTreeJson,
    toolsSidebarBottomLinks: defaultSidebarBottomLinksJson,
    toolsAiToolboxSidebarMenus: defaultAiToolboxSidebarMenusJson,
    toolsChangelogHeaderLinks: defaultChangelogHeaderLinksJson,
    toolsChangelogIntroText: defaultChangelogIntroText,
    toolsChangelogMetaLinks: defaultChangelogMetaLinksJson,
    toolsChangelogSplitTitle: defaultChangelogSplitTitle,
    toolsChangelogSplitDesc: defaultChangelogSplitDesc,
    toolsChangelogSplitLink: defaultChangelogSplitLink,
    toolsChangelogSplitLinkText: defaultChangelogSplitLinkText,
    toolsChangelogStatsText: defaultChangelogStatsText,
    toolsChangelogTimeline: defaultChangelogTimelineJson,
    toolsAiChatHeaderLinks: defaultAiChatHeaderLinksJson,
    toolsAiCommonHeaderLinks: defaultAiCommonHeaderLinksJson,
    toolsFooterQuickSections: defaultFooterQuickSectionsJson,
    toolsFooterFriendSections: defaultFooterFriendSectionsJson,
    toolsOfficialMediaLinks: defaultOfficialMediaLinksJson,
    toolsSeoDefaultTitle: defaultToolsSeoDefaultTitle,
    toolsSeoDefaultKeywords: defaultToolsSeoDefaultKeywords,
    toolsSeoDefaultDescription: defaultToolsSeoDefaultDescription,
    toolsSeoDefaultImage: defaultToolsSeoDefaultImage,
    toolsSeoPages: defaultSeoPagesJson,
    toolsHomepageLearningEnabled: '1',
    toolsHomepageLearningTitle: defaultHomepageLearningTitle,
    toolsHomepageLearningRssUrl: defaultHomepageLearningRssUrl,
    toolsHomepageLearningFilterType: defaultHomepageLearningFilterType,
    toolsHomepageLearningCategorySlug: '',
    toolsHomepageLearningCategoryIds: '',
    toolsHomepageLearningLimit: String(defaultHomepageLearningLimit),
})

/**
 * 函数说明：将每日学习开关在布尔值与后台 0/1 字符串之间双向转换。
 */
const homepageLearningEnabled = computed<boolean>({
    get: () => String(formData.toolsHomepageLearningEnabled || '1') !== '0',
    set: (value) => {
        formData.toolsHomepageLearningEnabled = value ? '1' : '0'
    },
})

/**
 * 函数说明：将每日学习条数在数字控件与后台字符串字段之间双向转换。
 */
const homepageLearningLimit = computed<number>({
    get: () => {
        const value = Number(formData.toolsHomepageLearningLimit)
        return Number.isFinite(value) ? Math.min(50, Math.max(1, Math.floor(value))) : defaultHomepageLearningLimit
    },
    set: (value) => {
        const normalized = Number.isFinite(Number(value))
            ? Math.min(50, Math.max(1, Math.floor(Number(value))))
            : defaultHomepageLearningLimit
        formData.toolsHomepageLearningLimit = String(normalized)
    },
})

const layoutForm = reactive<{
    bannerSlides: ToolsBannerSlideItem[]
    footerSupportLinks: ToolsLinkItem[]
    footerRecordLinks: ToolsLinkItem[]
    headerLinks: ToolsLinkItem[]
    searchQuickTools: ToolsLinkItem[]
    sidebarRecommendLinks: ToolsLinkItem[]
    sidebarCategoryMenus: ToolsSidebarCategoryMenuItem[]
    sidebarMenuBlocks: ToolsSidebarMenuBlockEditor[]
    sidebarBottomLinks: ToolsLinkItem[]
    aiToolboxSidebarMenus: ToolsLinkItem[]
    changelogHeaderLinks: ToolsLinkItem[]
    changelogMetaLinks: ToolsLinkItem[]
    aiChatHeaderLinks: ToolsLinkItem[]
    aiCommonHeaderLinks: ToolsLinkItem[]
    footerQuickSections: ToolsLinkSection[]
    footerFriendSections: ToolsLinkSection[]
    officialMediaLinks: ToolsLinkItem[]
    seoPages: ToolsSeoPageItem[]
}>({
    bannerSlides: defaultBannerSlides.map((item) => ({ ...item })),
    footerSupportLinks: cloneLinkItems(defaultFooterSupportLinks),
    footerRecordLinks: cloneLinkItems(defaultFooterRecordLinks),
    headerLinks: cloneLinkItems(defaultHeaderLinks),
    searchQuickTools: cloneLinkItems(defaultSearchQuickTools),
    sidebarRecommendLinks: cloneLinkItems(defaultSidebarRecommendLinks),
    sidebarCategoryMenus: defaultSidebarCategoryMenus.map((item) => ({
        ...item,
    })),
    sidebarMenuBlocks: cloneSidebarMenuBlocks(defaultSidebarMenuBlocks),
    sidebarBottomLinks: cloneLinkItems(defaultSidebarBottomLinks),
    aiToolboxSidebarMenus: cloneLinkItems(defaultAiToolboxSidebarMenus),
    changelogHeaderLinks: cloneLinkItems(defaultChangelogHeaderLinks),
    changelogMetaLinks: cloneLinkItems(defaultChangelogMetaLinks),
    aiChatHeaderLinks: cloneLinkItems(defaultAiChatHeaderLinks),
    aiCommonHeaderLinks: cloneLinkItems(defaultAiCommonHeaderLinks),
    footerQuickSections: cloneLinkSections(defaultFooterQuickSections),
    footerFriendSections: cloneLinkSections(defaultFooterFriendSections),
    officialMediaLinks: cloneLinkItems(defaultOfficialMediaLinks),
    seoPages: cloneSeoPages(defaultSeoPages),
})

const toolsCategoryTreeEditor = ref(defaultToolsCategoryTreeJson)
const changelogTimelineParseResult = computed<ToolsChangelogTimelineParseResult>(() =>
    parseChangelogTimeline(formData.toolsChangelogTimeline)
)
const changelogTimelineItems = computed<ToolsChangelogTimelineItem[]>(() => changelogTimelineParseResult.value.items)
const changelogTimelinePreviewList = computed<ToolsChangelogTimelineItem[]>(() =>
    changelogTimelineItems.value.slice(0, 8)
)
const changelogTimelineVersionCount = computed<number>(() => changelogTimelineItems.value.length)
const changelogTimelineFeatureCount = computed<number>(() =>
    changelogTimelineItems.value.reduce((count, item) => count + item.features.length, 0)
)

/**
 * 函数说明：将当前布局编辑态序列化为快照，用于判断是否存在未保存变更
 */
const buildLayoutSnapshot = (): string => {
    return JSON.stringify({
        text: {
            toolsChangelogIntroText: formData.toolsChangelogIntroText,
            toolsChangelogSplitTitle: formData.toolsChangelogSplitTitle,
            toolsChangelogSplitDesc: formData.toolsChangelogSplitDesc,
            toolsChangelogSplitLink: formData.toolsChangelogSplitLink,
            toolsChangelogSplitLinkText: formData.toolsChangelogSplitLinkText,
            toolsChangelogStatsText: formData.toolsChangelogStatsText,
            toolsChangelogTimeline: formData.toolsChangelogTimeline,
            toolsHomepageLearningEnabled: formData.toolsHomepageLearningEnabled,
            toolsHomepageLearningTitle: formData.toolsHomepageLearningTitle,
            toolsHomepageLearningRssUrl: formData.toolsHomepageLearningRssUrl,
            toolsHomepageLearningFilterType: formData.toolsHomepageLearningFilterType,
            toolsHomepageLearningCategorySlug: formData.toolsHomepageLearningCategorySlug,
            toolsHomepageLearningCategoryIds: formData.toolsHomepageLearningCategoryIds,
            toolsHomepageLearningLimit: formData.toolsHomepageLearningLimit,
        },
        layout: {
            bannerSlides: layoutForm.bannerSlides,
            changelogHeaderLinks: layoutForm.changelogHeaderLinks,
            changelogMetaLinks: layoutForm.changelogMetaLinks,
        },
    })
}

/**
 * 函数说明：更新布局基线快照，作为“已保存状态”参照
 */
const updateBaselineLayoutSnapshot = () => {
    baselineLayoutSnapshot.value = buildLayoutSnapshot()
}

/**
 * 函数说明：格式化时间显示文本，用于提示最近保存时间
 */
const formatDateTimeText = (date: Date): string => {
    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
        date.getMinutes()
    )}:${pad(date.getSeconds())}`
}

/**
 * 函数说明：判断当前页面是否存在未保存变更
 */
const hasUnsavedChanges = computed<boolean>(() => {
    if (!baselineLayoutSnapshot.value) {
        return false
    }
    return buildLayoutSnapshot() !== baselineLayoutSnapshot.value
})

/**
 * 函数说明：统计头部链接数量，作为运营配置密度提示
 */
const headerLinkCount = computed(() => layoutForm.headerLinks.length)

/**
 * 函数说明：统计搜索面板快捷入口数量，帮助运营控制默认入口密度。
 */
const searchQuickToolCount = computed(() => layoutForm.searchQuickTools.length)

/**
 * 函数说明：统计页脚快捷入口分组数量，方便运营快速评估信息结构
 */
const footerQuickSectionCount = computed(() => layoutForm.footerQuickSections.length)

/**
 * 函数说明：统计页脚友情链接分组数量，帮助运营控制外链分组规模
 */
const footerFriendSectionCount = computed(() => layoutForm.footerFriendSections.length)

/**
 * 函数说明：统计侧边栏分类菜单数量，便于检查导航层级是否过多
 */
const sidebarCategoryMenuCount = computed(() => layoutForm.sidebarCategoryMenus.length)

/**
 * 函数说明：工具分类树解析统一入口，提前建立可调用引用，规避初始化顺序导致的运行时报错。
 */
const parseToolsCategoryTree = (jsonText: string): ToolsCategoryTreeParseResult => {
    return parseToolsCategoryTreeImpl(jsonText)
}

/**
 * 函数说明：实时解析工具分类树编辑内容，输出可用于统计和校验的结构化数据
 */
const toolsCategoryTreeParseResult = computed<ToolsCategoryTreeParseResult>(() => {
    return parseToolsCategoryTree(toolsCategoryTreeEditor.value)
})

/**
 * 函数说明：提取工具分类树解析错误，供页面即时提示
 */
const toolsCategoryTreeParseError = computed<string>(() => toolsCategoryTreeParseResult.value.error)

/**
 * 函数说明：统计工具一级分类数量
 */
const toolsCategoryCount = computed<number>(() => toolsCategoryTreeParseResult.value.items.length)

/**
 * 函数说明：统计工具二级分类数量
 */
const toolsSubCategoryCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce((count, category) => count + category.list.length, 0)
})

/**
 * 函数说明：统计工具总数，便于运营确认配置规模
 */
const toolsTotalCount = computed<number>(() => {
    return toolsCategoryTreeParseResult.value.items.reduce((toolCount, category) => {
        return (
            toolCount + category.list.reduce((subToolCount, subCategory) => subToolCount + subCategory.list.length, 0)
        )
    }, 0)
})

/**
 * 函数说明：统计页脚快捷入口链接总数，用于运营规模提示
 */
const footerQuickLinkCount = computed(() => {
    return layoutForm.footerQuickSections.reduce((count, section) => count + section.items.length, 0)
})

/**
 * 函数说明：统计页脚友情链接总数，用于运营规模提示
 */
const footerFriendLinkCount = computed(() => {
    return layoutForm.footerFriendSections.reduce((count, section) => count + section.items.length, 0)
})

/**
 * 函数说明：统计文本字段中为空的项数，便于计算模块待完善数量
 */
const countEmptyTextValues = (values: Array<string | undefined>): number => {
    return values.reduce((count, value) => count + (String(value || '').trim() ? 0 : 1), 0)
}

/**
 * 函数说明：统计文本字段中非空项数量，用于简版模式下的配置完成度展示。
 */
const countFilledTextValues = (values: Array<string | undefined>): number => {
    return values.reduce((count, value) => count + (String(value || '').trim() ? 1 : 0), 0)
}

/**
 * 函数说明：统计链接数组中缺失名称或链接的项数
 */
const countInvalidLinkItems = (items: ToolsLinkItem[]): number => {
    return items.reduce((count, item) => {
        const name = String(item.name || '').trim()
        const link = String(item.link || '').trim()
        return count + (name && link ? 0 : 1)
    }, 0)
}

/**
 * 函数说明：统计 Banner 配置中缺失核心字段的项数
 */
const countInvalidBannerSlides = (items: ToolsBannerSlideItem[]): number => {
    return items.reduce((count, item) => {
        const badge = String(item.badge || '').trim()
        const text = String(item.text || '').trim()
        const link = String(item.link || '').trim()
        const gradient = String(item.gradient || '').trim()
        return count + (badge && text && link && gradient ? 0 : 1)
    }, 0)
}

/**
 * 函数说明：统计侧边栏分类菜单中缺失 key、标题或分类标题的项数
 */
const countInvalidSidebarCategoryMenus = (items: ToolsSidebarCategoryMenuItem[]): number => {
    return items.reduce((count, item) => {
        const key = String(item.key || '').trim()
        const title = String(item.title || '').trim()
        const cateTitle = String(item.cateTitle || '').trim()
        return count + (key && title && cateTitle ? 0 : 1)
    }, 0)
}

/**
 * 函数说明：统计菜单样式模块中缺失关键信息的项数，便于运营快速定位问题。
 */
const countInvalidSidebarMenuBlocks = (blocks: ToolsSidebarMenuBlockEditor[]): number => {
    return blocks.reduce((count, block) => {
        const keyMissing = String(block.key || '').trim() ? 0 : 1
        const titleMissing = String(block.title || '').trim() ? 0 : 1
        const typeMissing = String(block.type || '').trim() ? 0 : 1
        const items = Array.isArray(block.items) ? block.items : []
        const emptyItemsMissing = items.length > 0 ? 0 : 1
        const itemMissing = items.reduce((itemCount, item) => {
            const name = String(item.name || '').trim()
            const link = String(item.link || '').trim()
            return itemCount + (name && link ? 0 : 1)
        }, 0)
        return count + keyMissing + titleMissing + typeMissing + emptyItemsMissing + itemMissing
    }, 0)
}

/**
 * 函数说明：统计分组链接结构中缺失分组标题或链接项字段的数量
 */
const countInvalidLinkSections = (sections: ToolsLinkSection[]): number => {
    return sections.reduce((count, section) => {
        const titleCount = String(section.title || '').trim() ? 0 : 1
        const itemCount = countInvalidLinkItems(section.items || [])
        const emptyItemsCount = Array.isArray(section.items) && section.items.length > 0 ? 0 : 1
        return count + titleCount + itemCount + emptyItemsCount
    }, 0)
}

/**
 * 函数说明：统计页面 SEO 配置中缺失路径、标题或描述的项数。
 */
const countInvalidSeoPages = (items: ToolsSeoPageItem[]): number => {
    return items.reduce((count, item) => {
        const pathMissing = String(item.path || '').trim() ? 0 : 1
        const titleMissing = String(item.title || '').trim() ? 0 : 1
        const descriptionMissing = String(item.description || '').trim() ? 0 : 1
        return count + pathMissing + titleMissing + descriptionMissing
    }, 0)
}

/**
 * 函数说明：统计工具分类树中缺失标题或链接字段的项数
 */
const countInvalidToolsCategoryTree = (): number => {
    const parseResult = toolsCategoryTreeParseResult.value
    if (parseResult.error) {
        return 1
    }
    if (!parseResult.items.length) {
        return 1
    }
    return parseResult.items.reduce((categoryCount, category) => {
        const categoryMissing = String(category.title || '').trim() ? 0 : 1
        const subCategoryMissing = category.list.reduce((subCount, subCategory) => {
            const titleMissing = String(subCategory.title || '').trim() ? 0 : 1
            const emptyToolsMissing = Array.isArray(subCategory.list) && subCategory.list.length > 0 ? 0 : 1
            const toolMissing = subCategory.list.reduce((toolCount, tool) => {
                const toolTitle = String(tool.title || '').trim()
                const toolUrl = String(tool.url || '').trim()
                return toolCount + (toolTitle && toolUrl ? 0 : 1)
            }, 0)
            return subCount + titleMissing + emptyToolsMissing + toolMissing
        }, 0)
        return categoryCount + categoryMissing + subCategoryMissing
    }, 0)
}

/**
 * 函数说明：校验每日学习 RSS 地址是否为允许的 UIED HTTPS 地址。
 */
const isValidHomepageLearningRssUrl = (value: string): boolean => {
    try {
        const parsed = new URL(String(value || '').trim())
        return (
            parsed.protocol === 'https:' &&
            (parsed.hostname === 'uied.cn' || parsed.hostname === 'www.uied.cn') &&
            (!parsed.port || parsed.port === '443')
        )
    } catch {
        return false
    }
}

/**
 * 函数说明：校验单个或多个分类 ID，仅允许数字和英文逗号。
 */
const isValidHomepageLearningCategoryIds = (value: string): boolean => {
    const items = String(value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    return items.length > 0 && items.every((item) => /^\d+$/.test(item))
}

/**
 * 函数说明：计算指定模块当前已配置项数量，用于概览卡展示
 */
const getModuleConfiguredCount = (moduleKey: string): number => {
    if (moduleKey === 'banner') {
        return layoutForm.bannerSlides.length
    }
    if (moduleKey === 'homepageLearning') {
        return countFilledTextValues([
            formData.toolsHomepageLearningTitle,
            formData.toolsHomepageLearningRssUrl,
            formData.toolsHomepageLearningFilterType,
            formData.toolsHomepageLearningLimit,
        ])
    }
    if (moduleKey === 'sidebar') {
        const menuBlockItemsCount = layoutForm.sidebarMenuBlocks.reduce((count, block) => count + block.items.length, 0)
        return (
            layoutForm.sidebarRecommendLinks.length +
            layoutForm.sidebarCategoryMenus.length +
            layoutForm.sidebarMenuBlocks.length +
            menuBlockItemsCount +
            layoutForm.sidebarBottomLinks.length
        )
    }
    if (moduleKey === 'toolsCatalog') {
        return toolsTotalCount.value
    }
    if (moduleKey === 'seo') {
        return (
            layoutForm.seoPages.length +
            [
                formData.toolsSeoDefaultTitle,
                formData.toolsSeoDefaultKeywords,
                formData.toolsSeoDefaultDescription,
                formData.toolsSeoDefaultImage,
            ].filter((value) => Boolean(String(value || '').trim())).length
        )
    }
    if (moduleKey === 'aiToolbox') {
        return layoutForm.aiToolboxSidebarMenus.length
    }
    if (moduleKey === 'pageOps') {
        const baseConfiguredCount =
            changelogTimelineItems.value.length +
            countFilledTextValues([formData.toolsChangelogIntroText, formData.toolsChangelogStatsText])
        if (simpleMode.value) {
            return baseConfiguredCount
        }
        return baseConfiguredCount + layoutForm.changelogHeaderLinks.length + layoutForm.changelogMetaLinks.length
    }
    if (moduleKey === 'header') {
        return layoutForm.headerLinks.length + layoutForm.searchQuickTools.length
    }
    if (moduleKey === 'footer') {
        return (
            layoutForm.footerSupportLinks.length +
            layoutForm.footerRecordLinks.length +
            footerQuickLinkCount.value +
            footerFriendLinkCount.value +
            layoutForm.officialMediaLinks.length
        )
    }
    return 0
}

/**
 * 函数说明：计算指定模块的待完善项数量，供运营定位配置缺口
 */
const getModuleMissingCount = (moduleKey: string): number => {
    if (moduleKey === 'banner') {
        return (layoutForm.bannerSlides.length === 0 ? 1 : 0) + countInvalidBannerSlides(layoutForm.bannerSlides)
    }
    if (moduleKey === 'homepageLearning') {
        if (!homepageLearningEnabled.value) {
            return 0
        }
        const filterType = String(formData.toolsHomepageLearningFilterType || 'all')
        return (
            countEmptyTextValues([
                formData.toolsHomepageLearningTitle,
                formData.toolsHomepageLearningRssUrl,
                formData.toolsHomepageLearningFilterType,
                formData.toolsHomepageLearningLimit,
            ]) +
            (isValidHomepageLearningRssUrl(formData.toolsHomepageLearningRssUrl) ? 0 : 1) +
            (filterType === 'category_slug' && !String(formData.toolsHomepageLearningCategorySlug || '').trim()
                ? 1
                : 0) +
            (filterType === 'categories' &&
            !isValidHomepageLearningCategoryIds(formData.toolsHomepageLearningCategoryIds)
                ? 1
                : 0)
        )
    }
    if (moduleKey === 'sidebar') {
        return (
            countEmptyTextValues([
                formData.toolsSiteSlogan,
                formData.toolsSidebarBrandText,
                formData.toolsSidebarRecommendTitle,
            ]) +
            countInvalidLinkItems(layoutForm.sidebarRecommendLinks) +
            countInvalidSidebarCategoryMenus(layoutForm.sidebarCategoryMenus) +
            countInvalidSidebarMenuBlocks(layoutForm.sidebarMenuBlocks) +
            countInvalidLinkItems(layoutForm.sidebarBottomLinks)
        )
    }
    if (moduleKey === 'toolsCatalog') {
        return countInvalidToolsCategoryTree()
    }
    if (moduleKey === 'seo') {
        return (
            countEmptyTextValues([formData.toolsSeoDefaultKeywords, formData.toolsSeoDefaultDescription]) +
            countInvalidSeoPages(layoutForm.seoPages)
        )
    }
    if (moduleKey === 'aiToolbox') {
        return (
            (layoutForm.aiToolboxSidebarMenus.length === 0 ? 1 : 0) +
            countInvalidLinkItems(layoutForm.aiToolboxSidebarMenus)
        )
    }
    if (moduleKey === 'pageOps') {
        const baseMissingCount =
            countEmptyTextValues([formData.toolsChangelogIntroText, formData.toolsChangelogStatsText]) +
            (changelogTimelineParseResult.value.error ? 1 : 0) +
            (changelogTimelineItems.value.length === 0 ? 1 : 0)
        if (simpleMode.value) {
            return baseMissingCount
        }
        return (
            baseMissingCount +
            countEmptyTextValues([
                formData.toolsChangelogSplitTitle,
                formData.toolsChangelogSplitDesc,
                formData.toolsChangelogSplitLinkText,
                formData.toolsChangelogSplitLink,
            ]) +
            countInvalidLinkItems(layoutForm.changelogHeaderLinks) +
            countInvalidLinkItems(layoutForm.changelogMetaLinks)
        )
    }
    if (moduleKey === 'header') {
        return (
            (layoutForm.headerLinks.length === 0 ? 1 : 0) +
            (layoutForm.searchQuickTools.length === 0 ? 1 : 0) +
            countInvalidLinkItems(layoutForm.headerLinks) +
            countInvalidLinkItems(layoutForm.searchQuickTools)
        )
    }
    if (moduleKey === 'footer') {
        return (
            countEmptyTextValues([
                formData.toolsFooterIntro,
                formData.toolsFooterQuickTitle,
                formData.toolsFooterFriendTitle,
                formData.toolsOfficialMediaTitle,
                formData.toolsFooterSupportLabel,
            ]) +
            countInvalidLinkItems(layoutForm.footerSupportLinks) +
            countInvalidLinkItems(layoutForm.footerRecordLinks) +
            countInvalidLinkSections(layoutForm.footerQuickSections) +
            countInvalidLinkSections(layoutForm.footerFriendSections) +
            countInvalidLinkItems(layoutForm.officialMediaLinks)
        )
    }
    return 0
}

/**
 * 函数说明：提取指定模块的待完善明细，用于在顶部给运营展示可执行修复清单
 */
const collectModuleMissingTips = (moduleKey: LayoutModuleKey): string[] => {
    const tips: string[] = []

    if (moduleKey === 'banner') {
        if (layoutForm.bannerSlides.length === 0) {
            tips.push('请先新增至少 1 条 Banner 轮播。')
        }
        layoutForm.bannerSlides.forEach((item, index) => {
            if (
                !String(item.badge || '').trim() ||
                !String(item.text || '').trim() ||
                !String(item.link || '').trim()
            ) {
                tips.push(`第 ${index + 1} 条 Banner 缺少角标/文案/链接。`)
            }
        })
    }

    if (moduleKey === 'homepageLearning' && homepageLearningEnabled.value) {
        if (!String(formData.toolsHomepageLearningTitle || '').trim()) {
            tips.push('每日学习栏目标题为空。')
        }
        if (!isValidHomepageLearningRssUrl(formData.toolsHomepageLearningRssUrl)) {
            tips.push('RSS 地址必须使用 UIED 官方 HTTPS 域名。')
        }
        if (
            formData.toolsHomepageLearningFilterType === 'category_slug' &&
            !String(formData.toolsHomepageLearningCategorySlug || '').trim()
        ) {
            tips.push('已选择分类别名，请填写如 ai 的别名。')
        }
        if (
            formData.toolsHomepageLearningFilterType === 'categories' &&
            !isValidHomepageLearningCategoryIds(formData.toolsHomepageLearningCategoryIds)
        ) {
            tips.push('分类 ID 应为 307 或 417,3351 这类数字逗号串。')
        }
    }

    if (moduleKey === 'sidebar') {
        if (!String(formData.toolsSiteSlogan || '').trim()) {
            tips.push('品牌副标题为空，请补充站点一句话说明。')
        }
        if (!String(formData.toolsSidebarBrandText || '').trim()) {
            tips.push('品牌主文案为空，请补充侧栏 Logo 文案。')
        }
        if (!String(formData.toolsSidebarRecommendTitle || '').trim()) {
            tips.push('推荐分组标题为空，请补充左栏推荐区标题。')
        }
        if (layoutForm.sidebarCategoryMenus.length === 0) {
            tips.push('请至少配置 1 个侧栏分类菜单。')
        }
        if (countInvalidSidebarCategoryMenus(layoutForm.sidebarCategoryMenus) > 0) {
            tips.push('侧栏分类菜单存在 key/标题/分类标题缺失，请检查后保存。')
        }
        if (layoutForm.sidebarMenuBlocks.length === 0) {
            tips.push('菜单样式模块为空，将回退旧版分类菜单渲染。')
        }
        if (countInvalidSidebarMenuBlocks(layoutForm.sidebarMenuBlocks) > 0) {
            tips.push('菜单样式模块存在空标题、空条目或无效链接，请检查后保存。')
        }
    }

    if (moduleKey === 'toolsCatalog') {
        if (toolsCategoryTreeParseError.value) {
            tips.push(`工具分类树 JSON 解析失败：${toolsCategoryTreeParseError.value}`)
        } else if (toolsCategoryTreeParseResult.value.items.length === 0) {
            tips.push('工具分类树当前为空，将回退内置工具库。')
        } else if (toolsTotalCount.value === 0) {
            tips.push('工具分类树暂无工具条目，请补充工具列表。')
        }
    }

    if (moduleKey === 'seo') {
        if (!String(formData.toolsSeoDefaultKeywords || '').trim()) {
            tips.push('默认 SEO 关键词为空，建议补充站点级关键词。')
        }
        if (!String(formData.toolsSeoDefaultDescription || '').trim()) {
            tips.push('默认 SEO 描述为空，建议补充站点级描述。')
        }
        if (layoutForm.seoPages.length === 0) {
            tips.push('页面级 SEO 为空，建议至少维护首页和更新页。')
        }
        if (countInvalidSeoPages(layoutForm.seoPages) > 0) {
            tips.push('页面级 SEO 存在路径、标题或描述缺失项，请检查后保存。')
        }
    }

    if (moduleKey === 'aiToolbox') {
        if (layoutForm.aiToolboxSidebarMenus.length === 0) {
            tips.push('AI 工具箱左栏建议至少保留 1 条固定入口。')
        }
        if (countInvalidLinkItems(layoutForm.aiToolboxSidebarMenus) > 0) {
            tips.push('AI 工具箱左栏存在名称或链接为空的项。')
        }
    }

    if (moduleKey === 'pageOps') {
        if (!String(formData.toolsChangelogIntroText || '').trim()) {
            tips.push('更新页顶部说明为空，建议补充版本背景文案。')
        }
        if (!String(formData.toolsChangelogStatsText || '').trim()) {
            tips.push('更新页统计说明为空，建议补充“工具总数/更新时间”。')
        }
        if (changelogTimelineParseResult.value.error) {
            tips.push(changelogTimelineParseResult.value.error)
        } else if (changelogTimelineItems.value.length === 0) {
            tips.push('更新记录页正文时间线为空，请补充至少 1 个版本节点。')
        }
        if (!simpleMode.value) {
            if (!String(formData.toolsChangelogSplitLink || '').trim()) {
                tips.push('开源说明缺少源码仓库链接。')
            }
            if (
                countInvalidLinkItems(layoutForm.changelogHeaderLinks) > 0 ||
                countInvalidLinkItems(layoutForm.changelogMetaLinks) > 0
            ) {
                tips.push('更新页顶部链接或资料链接存在空项。')
            }
        }
    }

    if (moduleKey === 'header') {
        if (layoutForm.headerLinks.length === 0) {
            tips.push('头部快捷链接为空，建议至少保留 1 条核心入口。')
        }
        if (countInvalidLinkItems(layoutForm.headerLinks) > 0) {
            tips.push('头部快捷链接存在名称或链接为空的项。')
        }
        if (layoutForm.searchQuickTools.length === 0) {
            tips.push('搜索面板快捷入口为空，建议至少保留 3-6 条高频工具。')
        }
        if (countInvalidLinkItems(layoutForm.searchQuickTools) > 0) {
            tips.push('搜索面板快捷入口存在标题或链接为空的项。')
        }
    }

    if (moduleKey === 'footer') {
        if (!String(formData.toolsFooterIntro || '').trim()) {
            tips.push('页脚介绍文案为空。')
        }
        if (layoutForm.footerQuickSections.length === 0) {
            tips.push('页脚快捷入口分组为空，建议至少保留 1 个分组。')
        }
        if (layoutForm.footerFriendSections.length === 0) {
            tips.push('页脚友情链接分组为空，建议至少保留 1 个分组。')
        }
        if (
            countInvalidLinkSections(layoutForm.footerQuickSections) > 0 ||
            countInvalidLinkSections(layoutForm.footerFriendSections) > 0
        ) {
            tips.push('页脚分组内存在空标题或空链接项。')
        }
    }

    return tips.slice(0, 6)
}

/**
 * 函数说明：生成模块概览卡数据，展示各模块配置规模与待完善项
 */
const moduleOverviewList = computed<ModuleOverviewItem[]>(() => {
    return layoutModuleOrder.map((key) => ({
        key,
        label: layoutModuleLabelMap[key],
        description: layoutModuleDescMap[key],
        configuredCount: getModuleConfiguredCount(key),
        missingCount: getModuleMissingCount(key),
    }))
})

/**
 * 函数说明：在当前运营模式与分组下过滤模块概览源数据。
 */
const moduleOverviewVisibleList = computed<ModuleOverviewItem[]>(() => {
    return moduleOverviewList.value.filter((item) => {
        const moduleKey = item.key as LayoutModuleKey
        return isModuleTabEnabled(moduleKey)
    })
})

/**
 * 函数说明：返回当前激活模块中文名称，用于顶部概览区实时反馈编辑焦点
 */
const activeModuleLabel = computed<string>(() => {
    if (!isLayoutModuleKey(activeTab.value)) {
        return '未选择'
    }
    return layoutModuleLabelMap[activeTab.value] || '未命名模块'
})

/**
 * 函数说明：汇总当前模块待完善项，默认收进折叠区避免说明和表单同时占满首屏。
 */
const currentModuleMissingTips = computed<string[]>(() => {
    if (!isLayoutModuleKey(activeTab.value)) {
        return []
    }
    return collectModuleMissingTips(activeTab.value)
})

/**
 * 函数说明：统计全模块待完善项总数，帮助运营快速评估发布前风险
 */
const totalMissingCount = computed<number>(() => {
    return moduleOverviewVisibleList.value.reduce((total, moduleItem) => total + moduleItem.missingCount, 0)
})

/**
 * 函数说明：生成前端布局总览页动作摘要，帮助运营先判断当前应优先维护 Banner 还是更新记录运营。
 */
const frontendLayoutActionSummary = computed(() => {
    if (totalMissingCount.value > 0) {
        return `当前总览页还有 ${totalMissingCount.value} 项待完善，建议先修 Banner 的投放内容，再确认每日学习 RSS 筛选，最后处理更新记录。`
    }
    return '当前 Banner、每日学习与更新记录配置已基本完整，建议保存后到首页做一次数据回归。'
})

/**
 * 函数说明：生成前端布局总览页重点检查项，统一展示 Banner、更新时间线和资料链接的完整度。
 */
const frontendLayoutFocusItems = computed(() => {
    const bannerMissingCount = getModuleMissingCount('banner')
    const learningMissingCount = getModuleMissingCount('homepageLearning')
    const pageOpsMissingCount = getModuleMissingCount('pageOps')
    const changelogLinkCount = layoutForm.changelogHeaderLinks.length + layoutForm.changelogMetaLinks.length

    return [
        {
            label: 'Banner 投放',
            value: layoutForm.bannerSlides.length > 0 ? `${layoutForm.bannerSlides.length} 条` : '待补充',
            desc:
                bannerMissingCount > 0
                    ? 'Banner 仍有空文案、空链接或空背景配置，建议先完成首页首屏投放。'
                    : 'Banner 轮播内容和核心字段已完整，可直接做前台回归。',
            className: bannerMissingCount > 0 ? 'is-warning' : 'is-ok',
        },
        {
            label: '每日学习',
            value: homepageLearningEnabled.value
                ? formData.toolsHomepageLearningFilterType === 'categories'
                    ? formData.toolsHomepageLearningCategoryIds || '待填分类 ID'
                    : formData.toolsHomepageLearningFilterType === 'category_slug'
                    ? formData.toolsHomepageLearningCategorySlug || '待填分类别名'
                    : '全部文章'
                : '已停用',
            desc:
                learningMissingCount > 0
                    ? '每日学习 RSS 地址或筛选条件不完整，请先修复再保存。'
                    : '当前将通过后端代理读取 UIED RSS，避免前端跨域失败。',
            className: learningMissingCount > 0 ? 'is-warning' : 'is-ok',
        },
        {
            label: '更新时间线',
            value: changelogTimelineVersionCount.value > 0 ? `${changelogTimelineVersionCount.value} 个版本` : '待补充',
            desc:
                changelogTimelineParseResult.value.error ||
                (pageOpsMissingCount > 0
                    ? '更新记录运营仍有待完善项，建议继续检查时间线、开源说明和版本文案。'
                    : '时间线、顶部说明和开源入口当前可正常支撑更新页运营。'),
            className: changelogTimelineParseResult.value.error
                ? 'is-danger'
                : pageOpsMissingCount > 0
                ? 'is-warning'
                : 'is-ok',
        },
        {
            label: '资料入口',
            value: `${changelogLinkCount} 条`,
            desc:
                changelogLinkCount > 0
                    ? '更新页顶部链接和资料链接已配置，可用于承接源码、Issue 和社区入口。'
                    : '更新页资料入口为空，建议至少补充源码仓库或社区入口。',
            className: changelogLinkCount > 0 ? 'is-ok' : 'is-warning',
        },
    ]
})

/**
 * 函数说明：生成工具分类树摘要卡片，帮助运营不用阅读 JSON 也能理解当前结构
 */
const toolsCatalogPreviewCards = computed<ToolsCatalogPreviewCard[]>(() => {
    return toolsCategoryTreeParseResult.value.items.map((category) => {
        const sampleTools = category.list
            .flatMap((subCategory) => subCategory.list.map((tool) => String(tool.title || '').trim()).filter(Boolean))
            .slice(0, 3)
        return {
            title: category.title.trim() || '未命名分类',
            groupCount: category.list.length,
            toolCount: category.list.reduce((count, subCategory) => count + subCategory.list.length, 0),
            sampleTools,
        }
    })
})

/**
 * 函数说明：创建空链接项，统一新增条目默认值
 */
const createEmptyLinkItem = (): ToolsLinkItem => ({
    name: '',
    link: '',
})

/**
 * 函数说明：创建空搜索快捷入口，统一补齐简介字段避免运营逐项新增属性。
 */
const createEmptySearchQuickToolItem = (): ToolsLinkItem => ({
    name: '',
    desc: '',
    link: '',
})

/**
 * 函数说明：创建空 Banner 轮播项，统一新增条目默认值
 */
const createEmptyBannerSlideItem = (): ToolsBannerSlideItem => ({
    badge: '',
    text: '',
    link: '',
    gradient: '',
})

/**
 * 函数说明：创建空侧边栏分类菜单项，统一新增菜单默认值
 */
const createEmptySidebarCategoryMenuItem = (): ToolsSidebarCategoryMenuItem => ({
    key: '',
    title: '',
    cateTitle: '',
    link: '',
    icon: '',
})

/**
 * 函数说明：创建空菜单样式模块条目，统一新增条目默认值。
 */
const createEmptySidebarMenuBlockItem = (): ToolsSidebarMenuBlockItemEditor => ({
    name: '',
    link: '',
    icon: '',
    image: '',
    desc: '',
    category: '',
})

/**
 * 函数说明：创建空菜单样式模块，默认类型为下拉菜单并附带1条空条目。
 */
const createEmptySidebarMenuBlock = (): ToolsSidebarMenuBlockEditor => ({
    key: '',
    title: '',
    type: 'dropdown',
    icon: '',
    items: [createEmptySidebarMenuBlockItem()],
})

/**
 * 函数说明：创建空分组项，统一新增分组默认值
 */
const createEmptySection = (): ToolsLinkSection => ({
    title: '',
    items: [createEmptyLinkItem()],
})

/**
 * 函数说明：创建空页面 SEO 配置项，统一新增页面默认值。
 */
const createEmptySeoPage = (): ToolsSeoPageItem => ({
    path: '',
    title: '',
    keywords: '',
    description: '',
    image: '',
})

/**
 * 函数说明：模块切换时跳转到对应页签，并重置对应子分区到首个标签，降低运营迷路成本
 */
const jumpToModule = (moduleKey: string) => {
    if (!isLayoutModuleKey(moduleKey)) {
        return
    }
    activeTab.value = moduleKey
    if (moduleKey === 'sidebar') {
        sidebarSectionCollapseKeys.value = ['brand']
    }
    if (moduleKey === 'pageOps') {
        pageOpsSectionCollapseKeys.value = simpleMode.value
            ? [...pageOpsSimpleCollapseKeys]
            : [...pageOpsAdvancedCollapseKeys]
    }
    if (moduleKey === 'footer') {
        footerSectionCollapseKeys.value = ['basic']
    }
}

/**
 * 函数说明：恢复 Banner 模块默认配置，便于快速回退到推荐运营模板
 */
const resetBannerModuleToDefault = () => {
    layoutForm.bannerSlides = defaultBannerSlides.map((item) => ({ ...item }))
}

/**
 * 函数说明：恢复每日学习为 UIED RSS 全部文章默认配置。
 */
const resetHomepageLearningModuleToDefault = () => {
    formData.toolsHomepageLearningEnabled = '1'
    formData.toolsHomepageLearningTitle = defaultHomepageLearningTitle
    formData.toolsHomepageLearningRssUrl = defaultHomepageLearningRssUrl
    formData.toolsHomepageLearningFilterType = defaultHomepageLearningFilterType
    formData.toolsHomepageLearningCategorySlug = ''
    formData.toolsHomepageLearningCategoryIds = ''
    formData.toolsHomepageLearningLimit = String(defaultHomepageLearningLimit)
}

/**
 * 函数说明：恢复侧边栏模块默认配置，统一品牌文案、推荐链接、分类菜单与底部入口
 */
const resetSidebarModuleToDefault = () => {
    formData.toolsSiteSlogan = defaultToolsSiteSlogan
    formData.toolsSidebarBrandLogo = defaultToolsSidebarBrandLogo
    formData.toolsSidebarBrandText = defaultToolsSidebarBrandText
    formData.toolsSidebarRecommendTitle = defaultToolsSidebarRecommendTitle
    layoutForm.sidebarRecommendLinks = cloneLinkItems(defaultSidebarRecommendLinks)
    layoutForm.sidebarCategoryMenus = defaultSidebarCategoryMenus.map((item) => ({
        ...item,
    }))
    layoutForm.sidebarMenuBlocks = cloneSidebarMenuBlocks(defaultSidebarMenuBlocks)
    layoutForm.sidebarBottomLinks = cloneLinkItems(defaultSidebarBottomLinks)
    sidebarSectionCollapseKeys.value = ['brand']
}

/**
 * 函数说明：恢复工具分类树为默认空数组，触发前端回退内置工具库
 */
const resetToolsCatalogModuleToDefault = () => {
    toolsCategoryTreeEditor.value = defaultToolsCategoryTreeJson
}

/**
 * 函数说明：恢复 SEO 模块默认配置，包含全站默认值与页面级 SEO 模板。
 */
const resetSeoModuleToDefault = () => {
    formData.toolsSeoDefaultTitle = defaultToolsSeoDefaultTitle
    formData.toolsSeoDefaultKeywords = defaultToolsSeoDefaultKeywords
    formData.toolsSeoDefaultDescription = defaultToolsSeoDefaultDescription
    formData.toolsSeoDefaultImage = defaultToolsSeoDefaultImage
    layoutForm.seoPages = cloneSeoPages(defaultSeoPages)
}

/**
 * 函数说明：恢复 AI 工具箱模块默认配置，保留推荐锚点入口
 */
const resetAiToolboxModuleToDefault = () => {
    layoutForm.aiToolboxSidebarMenus = cloneLinkItems(defaultAiToolboxSidebarMenus)
}

/**
 * 函数说明：恢复页面运营模块默认配置，仅回退更新记录页相关内容
 */
const resetPageOpsModuleToDefault = () => {
    formData.toolsChangelogIntroText = defaultChangelogIntroText
    formData.toolsChangelogStatsText = defaultChangelogStatsText
    formData.toolsChangelogSplitTitle = defaultChangelogSplitTitle
    formData.toolsChangelogSplitDesc = defaultChangelogSplitDesc
    formData.toolsChangelogSplitLinkText = defaultChangelogSplitLinkText
    formData.toolsChangelogSplitLink = defaultChangelogSplitLink
    formData.toolsChangelogTimeline = defaultChangelogTimelineJson
    layoutForm.changelogHeaderLinks = cloneLinkItems(defaultChangelogHeaderLinks)
    layoutForm.changelogMetaLinks = cloneLinkItems(defaultChangelogMetaLinks)
    pageOpsSectionCollapseKeys.value = ['changelog_intro', 'changelog_timeline']
}

/**
 * 函数说明：恢复头部模块默认配置，回退为预设快捷链接
 */
const resetHeaderModuleToDefault = () => {
    layoutForm.headerLinks = cloneLinkItems(defaultHeaderLinks)
    layoutForm.searchQuickTools = cloneLinkItems(defaultSearchQuickTools)
    formData.toolsSearchProviderLabel = defaultSearchProviderLabel
    formData.toolsSearchProviderLink = defaultSearchProviderLink
}

/**
 * 函数说明：恢复页脚模块默认配置，回退文案与分组链接模板
 */
const resetFooterModuleToDefault = () => {
    formData.toolsFooterIntro = defaultToolsFooterIntro
    formData.toolsFooterQuickTitle = defaultToolsFooterQuickTitle
    formData.toolsFooterFriendTitle = defaultToolsFooterFriendTitle
    formData.toolsOfficialMediaTitle = defaultToolsOfficialMediaTitle
    formData.toolsFooterSupportLabel = defaultToolsFooterSupportLabel
    layoutForm.footerSupportLinks = cloneLinkItems(defaultFooterSupportLinks)
    layoutForm.footerRecordLinks = cloneLinkItems(defaultFooterRecordLinks)
    layoutForm.footerQuickSections = cloneLinkSections(defaultFooterQuickSections)
    layoutForm.footerFriendSections = cloneLinkSections(defaultFooterFriendSections)
    layoutForm.officialMediaLinks = cloneLinkItems(defaultOfficialMediaLinks)
    footerSectionCollapseKeys.value = ['basic']
}

/**
 * 函数说明：恢复当前激活模块的默认配置，仅影响当前编辑态，保存后才会真正发布
 */
const restoreActiveModuleDefaults = async () => {
    if (!isLayoutModuleKey(activeTab.value)) {
        return
    }
    const moduleLabel = layoutModuleLabelMap[activeTab.value] || '当前模块'
    try {
        await feedback.confirm(`确定恢复「${moduleLabel}」默认配置吗？该操作不会自动保存。`)
    } catch {
        return
    }
    if (activeTab.value === 'banner') {
        resetBannerModuleToDefault()
    } else if (activeTab.value === 'homepageLearning') {
        resetHomepageLearningModuleToDefault()
    } else if (activeTab.value === 'sidebar') {
        resetSidebarModuleToDefault()
    } else if (activeTab.value === 'toolsCatalog') {
        resetToolsCatalogModuleToDefault()
    } else if (activeTab.value === 'seo') {
        resetSeoModuleToDefault()
    } else if (activeTab.value === 'aiToolbox') {
        resetAiToolboxModuleToDefault()
    } else if (activeTab.value === 'pageOps') {
        resetPageOpsModuleToDefault()
    } else if (activeTab.value === 'header') {
        resetHeaderModuleToDefault()
    } else if (activeTab.value === 'footer') {
        resetFooterModuleToDefault()
    }
    feedback.msgSuccess(`已恢复「${moduleLabel}」默认配置，请检查后保存生效`)
}

/**
 * 函数说明：将 JSON 文本解析为数组，异常时返回空数组
 */
const parseJsonArray = (jsonText: string): unknown[] => {
    const trimmed = (jsonText || '').trim()
    if (!trimmed) {
        return []
    }
    try {
        const parsed = JSON.parse(trimmed)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

/**
 * 函数说明：将未知对象清洗为链接项，非法数据返回 null
 */
const normalizeLinkItem = (source: unknown): ToolsLinkItem | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const name = String(record.name || record.title || '').trim()
    const link = String(record.link || record.url || '').trim()
    const desc = String(record.desc || record.description || '').trim()
    if (!name && !link && !desc) {
        return null
    }
    return {
        name,
        link,
        ...(desc ? { desc } : {}),
    }
}

/**
 * 函数说明：将未知对象清洗为 Banner 轮播项，非法数据返回 null
 */
const normalizeBannerSlideItem = (source: unknown): ToolsBannerSlideItem | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const badge = String(record.badge || '').trim()
    const text = String(record.text || '').trim()
    const link = String(record.link || '').trim()
    const gradient = String(record.gradient || '').trim()
    if (!badge && !text && !link && !gradient) {
        return null
    }
    return { badge, text, link, gradient }
}

/**
 * 函数说明：将未知对象清洗为页面 SEO 项，非法数据返回 null。
 */
const normalizeSeoPageItem = (source: unknown): ToolsSeoPageItem | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const path = String(record.path || '').trim()
    const title = String(record.title || '').trim()
    const keywords = String(record.keywords || '').trim()
    const description = String(record.description || '').trim()
    const image = String(record.image || '').trim()
    if (!path && !title && !keywords && !description && !image) {
        return null
    }
    return { path, title, keywords, description, image }
}

/**
 * 函数说明：将未知对象清洗为侧边栏分类菜单项，非法数据返回 null
 */
const normalizeSidebarCategoryMenuItem = (source: unknown): ToolsSidebarCategoryMenuItem | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const key = String(record.key || '').trim()
    const title = String(record.title || '').trim()
    const cateTitle = String(record.cateTitle || '').trim()
    const link = String(record.link || '').trim()
    const icon = String(record.icon || '').trim()
    if (!key && !title && !cateTitle && !link && !icon) {
        return null
    }
    return { key, title, cateTitle, link, icon }
}

/**
 * 函数说明：标准化菜单样式模块类型，非法值回退为列表菜单。
 */
const normalizeSidebarMenuBlockType = (source: unknown): ToolsSidebarMenuBlockType => {
    const value = String(source || '')
        .trim()
        .toLowerCase()
    if (value === 'dropdown' || value === 'list' || value === 'image' || value === 'category') {
        return value
    }
    return 'list'
}

/**
 * 函数说明：将未知对象清洗为菜单样式模块条目，非法数据返回 null。
 */
const normalizeSidebarMenuBlockItem = (source: unknown): ToolsSidebarMenuBlockItemNormalized | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const name = String(record.name || '').trim()
    const link = String(record.link || '').trim()
    const icon = String(record.icon || '').trim()
    const image = String(record.image || '').trim()
    const desc = String(record.desc || '').trim()
    const category = String(record.category || '').trim()
    if (!name && !link && !icon && !image && !desc && !category) {
        return null
    }
    return {
        name,
        link,
        icon,
        image,
        desc,
        category,
    }
}

/**
 * 函数说明：将未知对象清洗为菜单样式模块，非法数据返回 null。
 */
const normalizeSidebarMenuBlock = (source: unknown, index: number): ToolsSidebarMenuBlockEditor | null => {
    if (!source || typeof source !== 'object') {
        return null
    }
    const record = source as Record<string, unknown>
    const rawKey = String(record.key || '').trim()
    const title = String(record.title || '').trim()
    const type = normalizeSidebarMenuBlockType(record.type)
    const icon = String(record.icon || '').trim()
    const items = Array.isArray(record.items)
        ? record.items
              .map((item) => normalizeSidebarMenuBlockItem(item))
              .filter((item): item is ToolsSidebarMenuBlockItemNormalized => Boolean(item))
              .map((item) => ({
                  name: item.name,
                  link: item.link,
                  icon: item.icon,
                  image: item.image,
                  desc: String(item.desc || ''),
                  category: String(item.category || ''),
              }))
        : []
    if (!rawKey && !title && !icon && items.length === 0) {
        return null
    }
    return {
        key: rawKey || `menu-block-${index + 1}`,
        title,
        type,
        icon,
        items: items.length > 0 ? items : [createEmptySidebarMenuBlockItem()],
    }
}

/**
 * 函数说明：把 JSON 文本转换为链接数组，供运营表单回填
 */
const parseLinkItems = (jsonText: string, fallback: ToolsLinkItem[] = []): ToolsLinkItem[] => {
    const parsed = parseJsonArray(jsonText)
        .map((item) => normalizeLinkItem(item))
        .filter((item): item is ToolsLinkItem => Boolean(item))
    return parsed.length ? parsed : cloneLinkItems(fallback)
}

/**
 * 函数说明：把 JSON 文本转换为 Banner 轮播数组，供运营表单回填
 */
const parseBannerSlides = (jsonText: string, fallback: ToolsBannerSlideItem[] = []): ToolsBannerSlideItem[] => {
    const parsed = parseJsonArray(jsonText)
        .map((item) => normalizeBannerSlideItem(item))
        .filter((item): item is ToolsBannerSlideItem => Boolean(item))
    return parsed.length ? parsed : fallback.map((item) => ({ ...item }))
}

/**
 * 函数说明：把 JSON 文本转换为链接分组数组，供运营表单回填
 */
const parseLinkSections = (jsonText: string, fallback: ToolsLinkSection[] = []): ToolsLinkSection[] => {
    const parsed = parseJsonArray(jsonText)
        .map((section) => {
            if (!section || typeof section !== 'object') {
                return null
            }
            const record = section as Record<string, unknown>
            const title = String(record.title || '').trim()
            const items = Array.isArray(record.items)
                ? record.items
                      .map((item) => normalizeLinkItem(item))
                      .filter((item): item is ToolsLinkItem => Boolean(item))
                : []
            if (!title && items.length === 0) {
                return null
            }
            return {
                title,
                items: items.length > 0 ? items : [createEmptyLinkItem()],
            }
        })
        .filter((section): section is ToolsLinkSection => Boolean(section))
    return parsed.length ? parsed : cloneLinkSections(fallback)
}

/**
 * 函数说明：把 JSON 文本转换为侧边栏分类菜单数组，供运营表单回填
 */
const parseSidebarCategoryMenus = (
    jsonText: string,
    fallback: ToolsSidebarCategoryMenuItem[] = []
): ToolsSidebarCategoryMenuItem[] => {
    const parsed = parseJsonArray(jsonText)
        .map((item) => normalizeSidebarCategoryMenuItem(item))
        .filter((item): item is ToolsSidebarCategoryMenuItem => Boolean(item))
    return parsed.length ? parsed : fallback.map((item) => ({ ...item }))
}

/**
 * 函数说明：把 JSON 文本转换为页面 SEO 配置数组，供运营表单回填。
 */
const parseSeoPages = (jsonText: string, fallback: ToolsSeoPageItem[] = []): ToolsSeoPageItem[] => {
    const parsed = parseJsonArray(jsonText)
        .map((item) => normalizeSeoPageItem(item))
        .filter((item): item is ToolsSeoPageItem => Boolean(item))
    return parsed.length ? parsed : cloneSeoPages(fallback)
}

/**
 * 函数说明：把 JSON 文本转换为菜单样式模块数组，供运营表单回填。
 */
const parseSidebarMenuBlocks = (
    jsonText: string,
    fallback: ToolsSidebarMenuBlock[] = []
): ToolsSidebarMenuBlockEditor[] => {
    const parsed = parseJsonArray(jsonText)
        .map((item, index) => normalizeSidebarMenuBlock(item, index))
        .filter((item): item is ToolsSidebarMenuBlockEditor => Boolean(item))
    if (parsed.length > 0) {
        return parsed
    }
    return cloneSidebarMenuBlocks(fallback)
}

/**
 * 函数说明：解析工具分类树 JSON，返回结构化结果与错误信息
 */
function parseToolsCategoryTreeImpl(jsonText: string): ToolsCategoryTreeParseResult {
    const trimmed = String(jsonText || '').trim()
    if (!trimmed) {
        return {
            items: [],
            error: '',
        }
    }

    try {
        const parsed = JSON.parse(trimmed)
        if (!Array.isArray(parsed)) {
            return {
                items: [],
                error: '工具分类配置必须是 JSON 数组',
            }
        }

        const categories = parsed
            .map((category) => {
                if (!category || typeof category !== 'object') {
                    return null
                }
                const categoryRecord = category as Record<string, unknown>
                const categoryTitle = String(categoryRecord.title || '').trim()
                const categoryIcon = String(categoryRecord.icon || '').trim()
                const categoryIdRaw = Number(categoryRecord.id)
                const categoryId = Number.isFinite(categoryIdRaw) && categoryIdRaw > 0 ? categoryIdRaw : undefined

                const subCategories = Array.isArray(categoryRecord.list)
                    ? categoryRecord.list
                          .map((subCategory) => {
                              if (!subCategory || typeof subCategory !== 'object') {
                                  return null
                              }
                              const subCategoryRecord = subCategory as Record<string, unknown>
                              const subCategoryTitle = String(subCategoryRecord.title || '').trim()
                              const subCategoryIdRaw = Number(subCategoryRecord.id)
                              const subCategoryId =
                                  Number.isFinite(subCategoryIdRaw) && subCategoryIdRaw > 0
                                      ? subCategoryIdRaw
                                      : undefined

                              const tools = Array.isArray(subCategoryRecord.list)
                                  ? subCategoryRecord.list
                                        .map((tool) => {
                                            if (!tool || typeof tool !== 'object') {
                                                return null
                                            }
                                            const toolRecord = tool as Record<string, unknown>
                                            const title = String(toolRecord.title || '').trim()
                                            const url = String(toolRecord.url || '').trim()
                                            const desc = String(toolRecord.desc || '').trim()
                                            const logo = toolRecord.logo
                                            const releaseDate = String(toolRecord.releaseDate || '').trim()
                                            const icon = String(toolRecord.icon || '').trim()
                                            const gradient = String(toolRecord.gradient || '').trim()
                                            const badge = String(toolRecord.badge || '').trim()
                                            const text = String(toolRecord.text || '').trim()
                                            const seoTitle = String(toolRecord.seoTitle || '').trim()
                                            const seoKeywords = String(toolRecord.seoKeywords || '').trim()
                                            const seoDescription = String(toolRecord.seoDescription || '').trim()
                                            const seoImage = String(toolRecord.seoImage || '').trim()
                                            const tags = Array.isArray(toolRecord.tags)
                                                ? toolRecord.tags.map((tag) => String(tag || '').trim()).filter(Boolean)
                                                : []
                                            const isNew = Boolean(toolRecord.isNew)
                                            const toolIdRaw = Number(toolRecord.id)
                                            const toolId =
                                                Number.isFinite(toolIdRaw) && toolIdRaw > 0 ? toolIdRaw : undefined
                                            if (
                                                !title &&
                                                !url &&
                                                !desc &&
                                                !logo &&
                                                !toolId &&
                                                !seoTitle &&
                                                !seoDescription
                                            ) {
                                                return null
                                            }
                                            return {
                                                ...(toolId ? { id: toolId } : {}),
                                                title,
                                                url,
                                                ...(desc ? { desc } : {}),
                                                ...(logo ? { logo } : {}),
                                                ...(releaseDate ? { releaseDate } : {}),
                                                ...(tags.length > 0 ? { tags } : {}),
                                                ...(icon ? { icon } : {}),
                                                ...(isNew ? { isNew } : {}),
                                                ...(gradient ? { gradient } : {}),
                                                ...(badge ? { badge } : {}),
                                                ...(text ? { text } : {}),
                                                ...(seoTitle ? { seoTitle } : {}),
                                                ...(seoKeywords ? { seoKeywords } : {}),
                                                ...(seoDescription ? { seoDescription } : {}),
                                                ...(seoImage ? { seoImage } : {}),
                                            } as ToolsCatalogToolItem
                                        })
                                        .filter((tool): tool is ToolsCatalogToolItem => Boolean(tool))
                                  : []

                              if (!subCategoryTitle && tools.length === 0 && !subCategoryId) {
                                  return null
                              }
                              return {
                                  ...(subCategoryId ? { id: subCategoryId } : {}),
                                  title: subCategoryTitle,
                                  list: tools,
                              } as ToolsCatalogSubCategoryItem
                          })
                          .filter((subCategory): subCategory is ToolsCatalogSubCategoryItem => Boolean(subCategory))
                    : []

                if (!categoryTitle && subCategories.length === 0 && !categoryId && !categoryIcon) {
                    return null
                }
                return {
                    ...(categoryId ? { id: categoryId } : {}),
                    title: categoryTitle,
                    ...(categoryIcon ? { icon: categoryIcon } : {}),
                    list: subCategories,
                } as ToolsCatalogCategoryItem
            })
            .filter((category): category is ToolsCatalogCategoryItem => Boolean(category))

        return {
            items: categories,
            error: '',
        }
    } catch (error) {
        return {
            items: [],
            error: `工具分类 JSON 解析失败：${(error as Error).message}`,
        }
    }
}

/**
 * 函数说明：将后端 JSON 字段回填到运营可视化表单
 */
const applyLayoutFormFromJson = () => {
    layoutForm.bannerSlides = parseBannerSlides(formData.toolsBannerSlides, defaultBannerSlides)
    layoutForm.footerSupportLinks = parseLinkItems(formData.toolsFooterSupportLinks, defaultFooterSupportLinks)
    layoutForm.footerRecordLinks = parseLinkItems(formData.toolsFooterRecordLinks, defaultFooterRecordLinks)
    layoutForm.headerLinks = parseLinkItems(formData.toolsHeaderLinks, defaultHeaderLinks)
    layoutForm.searchQuickTools = parseLinkItems(formData.toolsSearchQuickTools, defaultSearchQuickTools)
    layoutForm.sidebarRecommendLinks = parseLinkItems(formData.toolsSidebarRecommend, defaultSidebarRecommendLinks)
    layoutForm.sidebarCategoryMenus = parseSidebarCategoryMenus(
        formData.toolsSidebarCategoryMenus,
        defaultSidebarCategoryMenus
    )
    layoutForm.sidebarMenuBlocks = parseSidebarMenuBlocks(formData.toolsSidebarMenuBlocks, defaultSidebarMenuBlocks)
    layoutForm.sidebarBottomLinks = parseLinkItems(formData.toolsSidebarBottomLinks, defaultSidebarBottomLinks)
    layoutForm.aiToolboxSidebarMenus = parseLinkItems(formData.toolsAiToolboxSidebarMenus, defaultAiToolboxSidebarMenus)
    layoutForm.changelogHeaderLinks = parseLinkItems(formData.toolsChangelogHeaderLinks, defaultChangelogHeaderLinks)
    layoutForm.changelogMetaLinks = parseLinkItems(formData.toolsChangelogMetaLinks, defaultChangelogMetaLinks)
    layoutForm.aiChatHeaderLinks = parseLinkItems(formData.toolsAiChatHeaderLinks, defaultAiChatHeaderLinks)
    layoutForm.aiCommonHeaderLinks = parseLinkItems(formData.toolsAiCommonHeaderLinks, defaultAiCommonHeaderLinks)
    layoutForm.footerQuickSections = parseLinkSections(formData.toolsFooterQuickSections, defaultFooterQuickSections)
    layoutForm.footerFriendSections = parseLinkSections(formData.toolsFooterFriendSections, defaultFooterFriendSections)
    layoutForm.officialMediaLinks = parseLinkItems(formData.toolsOfficialMediaLinks, defaultOfficialMediaLinks)
    layoutForm.seoPages = parseSeoPages(formData.toolsSeoPages, defaultSeoPages)
    formData.toolsChangelogTimeline =
        (formData.toolsChangelogTimeline || defaultChangelogTimelineJson).trim() || defaultChangelogTimelineJson
    toolsCategoryTreeEditor.value =
        (formData.toolsCategoryTree || defaultToolsCategoryTreeJson).trim() || defaultToolsCategoryTreeJson
}

/**
 * 函数说明：判断链接是否为允许格式，支持站内路径、锚点与外链
 */
const isValidLinkValue = (link: string, allowHash = true): boolean => {
    const value = String(link || '').trim()
    if (!value) {
        return false
    }
    if (value.startsWith('/')) {
        return true
    }
    if (allowHash && value.startsWith('#')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：校验侧栏品牌 Logo 值，支持站内地址、外链地址、data URL 与内联 SVG。
 */
const isValidSidebarBrandLogo = (logoValue: string): boolean => {
    const value = String(logoValue || '').trim()
    if (!value) {
        return true
    }
    const lowerValue = value.toLowerCase()
    if (
        lowerValue.startsWith('<svg') ||
        lowerValue.startsWith('<g') ||
        /<svg[\s\S]*<\/svg>/i.test(value) ||
        /<g[\s\S]*<\/g>/i.test(value) ||
        lowerValue.startsWith('data:image/')
    ) {
        return true
    }
    if (value.startsWith('/')) {
        return true
    }
    return /^https?:\/\//i.test(value)
}

/**
 * 函数说明：校验链接数组必填项，避免运营误填后保存出错
 */
const validateLinkItems = (
    items: ToolsLinkItem[],
    fieldLabel: string,
    options: { allowHash?: boolean } = {}
): boolean => {
    const allowHash = options.allowHash ?? true
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        if (!item.name.trim()) {
            feedback.msgError(`${fieldLabel} 第${index + 1}项：名称不能为空`)
            return false
        }
        if (!item.link.trim()) {
            feedback.msgError(`${fieldLabel} 第${index + 1}项：链接不能为空`)
            return false
        }
        if (!isValidLinkValue(item.link, allowHash)) {
            const linkRuleTip = allowHash ? '/、# 或 http(s)' : '/ 或 http(s)'
            feedback.msgError(`${fieldLabel} 第${index + 1}项：链接需为 ${linkRuleTip} 开头`)
            return false
        }
    }
    return true
}

/**
 * 函数说明：校验 Banner 轮播配置，确保角标/文案/链接/渐变背景完整
 */
const validateBannerSlides = (items: ToolsBannerSlideItem[]): boolean => {
    if (!items.length) {
        feedback.msgError('顶部Banner 至少需要配置1条轮播')
        return false
    }
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        if (!item.badge.trim()) {
            feedback.msgError(`顶部Banner 第${index + 1}项：角标不能为空`)
            return false
        }
        if (!item.text.trim()) {
            feedback.msgError(`顶部Banner 第${index + 1}项：文案不能为空`)
            return false
        }
        const link = item.link.trim()
        if (!link) {
            feedback.msgError(`顶部Banner 第${index + 1}项：跳转链接不能为空`)
            return false
        }
        if (!isValidLinkValue(link, true)) {
            feedback.msgError(`顶部Banner 第${index + 1}项：链接需为 /、# 或 http(s) 开头`)
            return false
        }
        const gradient = item.gradient.trim()
        if (!gradient) {
            feedback.msgError(`顶部Banner 第${index + 1}项：背景渐变不能为空`)
            return false
        }
        if (!/gradient\(/i.test(gradient)) {
            feedback.msgError(`顶部Banner 第${index + 1}项：背景建议使用 linear-gradient(...)`)
            return false
        }
    }
    return true
}

/**
 * 函数说明：校验侧边栏分类菜单，确保 key、标题和分类标题完整
 */
const validateSidebarCategoryMenus = (items: ToolsSidebarCategoryMenuItem[]): boolean => {
    const keyMap = new Set<string>()
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        const key = item.key.trim()
        if (!key) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：菜单key不能为空`)
            return false
        }
        if (keyMap.has(key)) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：菜单key重复（${key}）`)
            return false
        }
        keyMap.add(key)
        if (!item.title.trim()) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：菜单标题不能为空`)
            return false
        }
        if (!item.cateTitle.trim()) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：分类标题不能为空`)
            return false
        }
        const link = String(item.link || '').trim()
        if (link && !isValidLinkValue(link, true)) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：直达链接需为 /、# 或 http(s) 开头`)
            return false
        }
        const icon = String(item.icon || '').trim()
        if (icon && !icon.startsWith('/') && !/^https?:\/\//i.test(icon)) {
            feedback.msgError(`侧边栏分类菜单 第${index + 1}项：图标地址需为 / 或 http(s) 开头`)
            return false
        }
    }
    return true
}

/**
 * 函数说明：校验菜单样式模块，确保模块标题、类型与条目链接完整可用。
 */
const validateSidebarMenuBlocks = (blocks: ToolsSidebarMenuBlockEditor[]): boolean => {
    const keyMap = new Set<string>()
    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const block = blocks[blockIndex]
        const key = String(block.key || '').trim()
        const title = String(block.title || '').trim()
        const type = normalizeSidebarMenuBlockType(block.type)
        if (!key) {
            feedback.msgError(`菜单样式模块 第${blockIndex + 1}项：模块key不能为空`)
            return false
        }
        if (keyMap.has(key)) {
            feedback.msgError(`菜单样式模块 第${blockIndex + 1}项：模块key重复（${key}）`)
            return false
        }
        keyMap.add(key)
        if (!title) {
            feedback.msgError(`菜单样式模块 第${blockIndex + 1}项：模块标题不能为空`)
            return false
        }
        if (!type) {
            feedback.msgError(`菜单样式模块 第${blockIndex + 1}项：模块类型无效`)
            return false
        }
        if (!Array.isArray(block.items) || block.items.length === 0) {
            feedback.msgError(`菜单样式模块「${title}」至少需要 1 条菜单`)
            return false
        }
        for (let itemIndex = 0; itemIndex < block.items.length; itemIndex++) {
            const item = block.items[itemIndex]
            const name = String(item.name || '').trim()
            const link = String(item.link || '').trim()
            if (!name) {
                feedback.msgError(`菜单样式模块「${title}」第${itemIndex + 1}条：名称不能为空`)
                return false
            }
            if (!link) {
                feedback.msgError(`菜单样式模块「${title}」第${itemIndex + 1}条：链接不能为空`)
                return false
            }
            if (!isValidLinkValue(link, true)) {
                feedback.msgError(`菜单样式模块「${title}」第${itemIndex + 1}条：链接需为 /、# 或 http(s) 开头`)
                return false
            }
            const icon = String(item.icon || '').trim()
            if (icon && !icon.startsWith('/') && !/^https?:\/\//i.test(icon)) {
                feedback.msgError(`菜单样式模块「${title}」第${itemIndex + 1}条：图标地址需为 / 或 http(s) 开头`)
                return false
            }
            const image = String(item.image || '').trim()
            if (image && !image.startsWith('/') && !/^https?:\/\//i.test(image)) {
                feedback.msgError(`菜单样式模块「${title}」第${itemIndex + 1}条：图片地址需为 / 或 http(s) 开头`)
                return false
            }
        }
    }
    return true
}

/**
 * 函数说明：跳转素材管理图标库页面，方便运营先上传 SVG 图标再回填到侧边栏菜单
 */
const goIconLibrary = () => {
    router.push('/material/icons')
}

/**
 * 函数说明：跳转到热门工具配置页，联动首页热门推荐运营位
 */
const goHotToolsConfig = () => {
    router.push('/official_site/hot_tools')
}

/**
 * 函数说明：打开 tools 前端首页预览，便于运营即时核对布局与链接生效情况
 */
const openToolsHomePreview = () => {
    window.open(resolveToolsPreviewUrl(appStore.config), '_blank')
}

/**
 * 函数说明：计算当前布局配置项总量，用于统计清理前后变化
 */
const calcLayoutItemCount = (): number => {
    const footerQuickItemsCount = layoutForm.footerQuickSections.reduce(
        (count, section) => count + section.items.length,
        0
    )
    const footerFriendItemsCount = layoutForm.footerFriendSections.reduce(
        (count, section) => count + section.items.length,
        0
    )
    const sidebarMenuBlockItemsCount = layoutForm.sidebarMenuBlocks.reduce(
        (count, block) => count + block.items.length,
        0
    )
    return (
        layoutForm.bannerSlides.length +
        layoutForm.footerSupportLinks.length +
        layoutForm.footerRecordLinks.length +
        layoutForm.headerLinks.length +
        layoutForm.searchQuickTools.length +
        layoutForm.sidebarRecommendLinks.length +
        layoutForm.sidebarCategoryMenus.length +
        layoutForm.sidebarMenuBlocks.length +
        sidebarMenuBlockItemsCount +
        layoutForm.sidebarBottomLinks.length +
        layoutForm.aiToolboxSidebarMenus.length +
        layoutForm.changelogHeaderLinks.length +
        layoutForm.changelogMetaLinks.length +
        layoutForm.aiChatHeaderLinks.length +
        layoutForm.aiCommonHeaderLinks.length +
        layoutForm.footerQuickSections.length +
        layoutForm.footerFriendSections.length +
        layoutForm.officialMediaLinks.length +
        layoutForm.seoPages.length +
        footerQuickItemsCount +
        footerFriendItemsCount
    )
}

/**
 * 函数说明：清理链接列表中的空白项并统一裁剪首尾空格
 */
const sanitizeLinkItems = (items: ToolsLinkItem[]): ToolsLinkItem[] => {
    return items
        .map((item) => ({
            name: String(item.name || '').trim(),
            link: String(item.link || '').trim(),
            desc: String(item.desc || '').trim(),
        }))
        .filter((item) => Boolean(item.name || item.link || item.desc))
}

/**
 * 函数说明：清理 Banner 轮播列表中的空白项并统一裁剪首尾空格
 */
const sanitizeBannerSlides = (items: ToolsBannerSlideItem[]): ToolsBannerSlideItem[] => {
    return items
        .map((item) => ({
            badge: String(item.badge || '').trim(),
            text: String(item.text || '').trim(),
            link: String(item.link || '').trim(),
            gradient: String(item.gradient || '').trim(),
        }))
        .filter((item) => Boolean(item.badge || item.text || item.link || item.gradient))
}

/**
 * 函数说明：清理侧栏分类菜单空白项并统一裁剪首尾空格
 */
const sanitizeSidebarCategoryMenus = (items: ToolsSidebarCategoryMenuItem[]): ToolsSidebarCategoryMenuItem[] => {
    return items
        .map((item) => ({
            key: String(item.key || '').trim(),
            title: String(item.title || '').trim(),
            cateTitle: String(item.cateTitle || '').trim(),
            link: String(item.link || '').trim(),
            icon: String(item.icon || '').trim(),
        }))
        .filter((item) => Boolean(item.key || item.title || item.cateTitle || item.link || item.icon))
}

/**
 * 函数说明：清理菜单样式模块中的空白项并统一裁剪首尾空格。
 */
const sanitizeSidebarMenuBlocks = (blocks: ToolsSidebarMenuBlockEditor[]): ToolsSidebarMenuBlockEditor[] => {
    return blocks
        .map((block, index) => {
            const key = String(block.key || '').trim() || `menu-block-${index + 1}`
            const title = String(block.title || '').trim()
            const type = normalizeSidebarMenuBlockType(block.type)
            const icon = String(block.icon || '').trim()
            const items = (Array.isArray(block.items) ? block.items : [])
                .map((item) => ({
                    name: String(item.name || '').trim(),
                    link: String(item.link || '').trim(),
                    icon: String(item.icon || '').trim(),
                    image: String(item.image || '').trim(),
                    desc: String(item.desc || '').trim(),
                    category: String(item.category || '').trim(),
                }))
                .filter((item) =>
                    Boolean(item.name || item.link || item.icon || item.image || item.desc || item.category)
                )
            if (!title && items.length === 0 && !icon) {
                return null
            }
            return {
                key,
                title,
                type,
                icon,
                items: items.length > 0 ? items : [createEmptySidebarMenuBlockItem()],
            } as ToolsSidebarMenuBlockEditor
        })
        .filter((item): item is ToolsSidebarMenuBlockEditor => Boolean(item))
}

/**
 * 函数说明：清理链接分组结构中的空白分组和空白链接项
 */
const sanitizeLinkSections = (sections: ToolsLinkSection[]): ToolsLinkSection[] => {
    return sections
        .map((section) => {
            const title = String(section.title || '').trim()
            const items = sanitizeLinkItems(section.items || [])
            if (!title && items.length === 0) {
                return null
            }
            return {
                title,
                items: items.length > 0 ? items : [createEmptyLinkItem()],
            } as ToolsLinkSection
        })
        .filter((section): section is ToolsLinkSection => Boolean(section))
}

/**
 * 函数说明：清理页面 SEO 配置中的空白项并统一裁剪首尾空格。
 */
const sanitizeSeoPages = (items: ToolsSeoPageItem[]): ToolsSeoPageItem[] => {
    return items
        .map((item) => ({
            path: String(item.path || '').trim(),
            title: String(item.title || '').trim(),
            keywords: String(item.keywords || '').trim(),
            description: String(item.description || '').trim(),
            image: String(item.image || '').trim(),
        }))
        .filter((item) => Boolean(item.path || item.title || item.keywords || item.description || item.image))
}

/**
 * 函数说明：一键清理当前配置草稿中的空白项，减少运营误填噪音
 */
const cleanupLayoutDraft = () => {
    const countBefore = calcLayoutItemCount()

    formData.toolsSiteSlogan = formData.toolsSiteSlogan.trim()
    formData.toolsSidebarBrandLogo = formData.toolsSidebarBrandLogo.trim()
    formData.toolsSidebarBrandText = formData.toolsSidebarBrandText.trim()
    formData.toolsSidebarRecommendTitle = formData.toolsSidebarRecommendTitle.trim()
    formData.toolsFooterIntro = formData.toolsFooterIntro.trim()
    formData.toolsFooterQuickTitle = formData.toolsFooterQuickTitle.trim()
    formData.toolsFooterFriendTitle = formData.toolsFooterFriendTitle.trim()
    formData.toolsOfficialMediaTitle = formData.toolsOfficialMediaTitle.trim()
    formData.toolsFooterSupportLabel = formData.toolsFooterSupportLabel.trim()
    formData.toolsChangelogIntroText = formData.toolsChangelogIntroText.trim()
    formData.toolsChangelogSplitTitle = formData.toolsChangelogSplitTitle.trim()
    formData.toolsChangelogSplitDesc = formData.toolsChangelogSplitDesc.trim()
    formData.toolsChangelogSplitLink = formData.toolsChangelogSplitLink.trim()
    formData.toolsChangelogSplitLinkText = formData.toolsChangelogSplitLinkText.trim()
    formData.toolsChangelogStatsText = formData.toolsChangelogStatsText.trim()

    layoutForm.bannerSlides = sanitizeBannerSlides(layoutForm.bannerSlides)
    layoutForm.footerSupportLinks = sanitizeLinkItems(layoutForm.footerSupportLinks)
    layoutForm.footerRecordLinks = sanitizeLinkItems(layoutForm.footerRecordLinks)
    layoutForm.headerLinks = sanitizeLinkItems(layoutForm.headerLinks)
    layoutForm.searchQuickTools = sanitizeLinkItems(layoutForm.searchQuickTools)
    layoutForm.sidebarRecommendLinks = sanitizeLinkItems(layoutForm.sidebarRecommendLinks)
    layoutForm.sidebarCategoryMenus = sanitizeSidebarCategoryMenus(layoutForm.sidebarCategoryMenus)
    layoutForm.sidebarMenuBlocks = sanitizeSidebarMenuBlocks(layoutForm.sidebarMenuBlocks)
    layoutForm.sidebarBottomLinks = sanitizeLinkItems(layoutForm.sidebarBottomLinks)
    layoutForm.aiToolboxSidebarMenus = sanitizeLinkItems(layoutForm.aiToolboxSidebarMenus)
    layoutForm.changelogHeaderLinks = sanitizeLinkItems(layoutForm.changelogHeaderLinks)
    layoutForm.changelogMetaLinks = sanitizeLinkItems(layoutForm.changelogMetaLinks)
    layoutForm.aiChatHeaderLinks = sanitizeLinkItems(layoutForm.aiChatHeaderLinks)
    layoutForm.aiCommonHeaderLinks = sanitizeLinkItems(layoutForm.aiCommonHeaderLinks)
    layoutForm.footerQuickSections = sanitizeLinkSections(layoutForm.footerQuickSections)
    layoutForm.footerFriendSections = sanitizeLinkSections(layoutForm.footerFriendSections)
    layoutForm.officialMediaLinks = sanitizeLinkItems(layoutForm.officialMediaLinks)
    layoutForm.seoPages = sanitizeSeoPages(layoutForm.seoPages)

    const countAfter = calcLayoutItemCount()
    const removedCount = Math.max(0, countBefore - countAfter)
    if (removedCount === 0) {
        feedback.msgSuccess('未发现可清理的空白项')
        return
    }
    feedback.msgSuccess(`已清理 ${removedCount} 条空白配置项`)
}

/**
 * 函数说明：将任意文本转换为菜单 key 安全值，避免非法字符导致保存校验失败
 */
const buildSafeMenuKey = (inputText: string, fallback: string): string => {
    const normalizedText = String(inputText || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_\-\u4e00-\u9fa5]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
    return normalizedText || fallback
}

/**
 * 函数说明：按工具一级分类自动同步侧栏分类菜单，减少手工维护成本
 */
const syncSidebarMenusFromCatalog = async () => {
    const categoryItems = parseToolsCategoryTree(toolsCategoryTreeEditor.value).items.filter((item) =>
        Boolean(item.title.trim())
    )
    if (!categoryItems.length) {
        activeTab.value = 'toolsCatalog'
        feedback.msgError('工具分类为空，无法同步侧栏分类菜单')
        return
    }
    try {
        await feedback.confirm('将按工具一级分类覆盖当前“侧边栏分类菜单”，确定继续吗？')
    } catch {
        return
    }

    const existingMenuMap = new Map<string, ToolsSidebarCategoryMenuItem>()
    layoutForm.sidebarCategoryMenus.forEach((item) => {
        const menuTitle = String(item.cateTitle || item.title || '').trim()
        if (menuTitle && !existingMenuMap.has(menuTitle)) {
            existingMenuMap.set(menuTitle, item)
        }
    })

    const usedKeySet = new Set<string>()
    layoutForm.sidebarCategoryMenus = categoryItems.map((category, index) => {
        const matchedMenu = existingMenuMap.get(category.title)
        const keyBase = buildSafeMenuKey(String(matchedMenu?.key || category.title), `category_${index + 1}`)
        let key = keyBase
        let suffix = 2
        while (usedKeySet.has(key)) {
            key = `${keyBase}_${suffix}`
            suffix += 1
        }
        usedKeySet.add(key)
        return {
            key,
            title: String(matchedMenu?.title || category.title).trim() || `分类${index + 1}`,
            cateTitle: category.title.trim(),
            link: String(matchedMenu?.link || '').trim(),
            icon: String(matchedMenu?.icon || '').trim(),
        } as ToolsSidebarCategoryMenuItem
    })
    router.push('/official_site/sidebar')
    feedback.msgSuccess(
        `已同步 ${layoutForm.sidebarCategoryMenus.length} 个侧栏分类菜单，请前往“侧栏设置”检查图标后保存生效`
    )
}

/**
 * 函数说明：构建可导出的前端布局配置对象
 */
const buildLayoutExportPayload = () => {
    return {
        version: '3.0.1',
        exportedAt: formatDateTimeText(new Date()),
        websiteLayout: {
            toolsChangelogIntroText: formData.toolsChangelogIntroText,
            toolsChangelogSplitTitle: formData.toolsChangelogSplitTitle,
            toolsChangelogSplitDesc: formData.toolsChangelogSplitDesc,
            toolsChangelogSplitLink: formData.toolsChangelogSplitLink,
            toolsChangelogSplitLinkText: formData.toolsChangelogSplitLinkText,
            toolsChangelogStatsText: formData.toolsChangelogStatsText,
            toolsHomepageLearningEnabled: formData.toolsHomepageLearningEnabled,
            toolsHomepageLearningTitle: formData.toolsHomepageLearningTitle,
            toolsHomepageLearningRssUrl: formData.toolsHomepageLearningRssUrl,
            toolsHomepageLearningFilterType: formData.toolsHomepageLearningFilterType,
            toolsHomepageLearningCategorySlug: formData.toolsHomepageLearningCategorySlug,
            toolsHomepageLearningCategoryIds: formData.toolsHomepageLearningCategoryIds,
            toolsHomepageLearningLimit: formData.toolsHomepageLearningLimit,
            bannerSlides: layoutForm.bannerSlides.map((item) => ({ ...item })),
            changelogHeaderLinks: cloneLinkItems(layoutForm.changelogHeaderLinks),
            changelogMetaLinks: cloneLinkItems(layoutForm.changelogMetaLinks),
            changelogTimeline: cloneChangelogTimeline(changelogTimelineItems.value),
        },
    }
}

/**
 * 函数说明：导出当前前端布局配置为 JSON 文件，便于备份与迁移
 */
const exportLayoutJson = () => {
    const payload = buildLayoutExportPayload()
    const jsonText = JSON.stringify(payload, null, 2)
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    // 说明：拆分替换逻辑，规避 Tailwind 对正则字符集文本的误扫描。
    const safeTime = formatDateTimeText(new Date()).replace(/[-:]/g, '').replace(/\s+/g, '')
    link.href = url
    link.download = `uiedtool-frontend-layout-${safeTime}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    feedback.msgSuccess('前端布局配置已导出')
}

/**
 * 函数说明：打开布局 JSON 导入弹窗
 */
const openImportLayoutDialog = () => {
    importJsonText.value = ''
    importDialogVisible.value = true
}

/**
 * 函数说明：仅导入前端布局页负责的三个运营模块，避免覆盖菜单、工具主数据、SEO、头部和页脚配置。
 */
const applyImportedFrontendLayoutData = (source: Record<string, unknown>) => {
    const readString = (key: string, fallback: string): string => {
        const value = source[key]
        return typeof value === 'string' ? value : fallback
    }
    const writeArrayToJsonField = (arrayKey: string, jsonKey: string, targetField: keyof typeof formData) => {
        const arrayValue = source[arrayKey]
        if (Array.isArray(arrayValue)) {
            formData[targetField] = JSON.stringify(arrayValue)
            return
        }
        const jsonValue = source[jsonKey]
        if (typeof jsonValue === 'string' && jsonValue.trim()) {
            formData[targetField] = jsonValue
        }
    }

    formData.toolsHomepageLearningEnabled = readString(
        'toolsHomepageLearningEnabled',
        formData.toolsHomepageLearningEnabled
    )
    formData.toolsHomepageLearningTitle = readString('toolsHomepageLearningTitle', formData.toolsHomepageLearningTitle)
    formData.toolsHomepageLearningRssUrl = readString(
        'toolsHomepageLearningRssUrl',
        formData.toolsHomepageLearningRssUrl
    )
    formData.toolsHomepageLearningFilterType = readString(
        'toolsHomepageLearningFilterType',
        formData.toolsHomepageLearningFilterType
    )
    formData.toolsHomepageLearningCategorySlug = readString(
        'toolsHomepageLearningCategorySlug',
        formData.toolsHomepageLearningCategorySlug
    )
    formData.toolsHomepageLearningCategoryIds = readString(
        'toolsHomepageLearningCategoryIds',
        formData.toolsHomepageLearningCategoryIds
    )
    formData.toolsHomepageLearningLimit = readString(
        'toolsHomepageLearningLimit',
        formData.toolsHomepageLearningLimit
    )
    formData.toolsChangelogIntroText = readString('toolsChangelogIntroText', formData.toolsChangelogIntroText)
    formData.toolsChangelogSplitTitle = readString('toolsChangelogSplitTitle', formData.toolsChangelogSplitTitle)
    formData.toolsChangelogSplitDesc = readString('toolsChangelogSplitDesc', formData.toolsChangelogSplitDesc)
    formData.toolsChangelogSplitLink = readString('toolsChangelogSplitLink', formData.toolsChangelogSplitLink)
    formData.toolsChangelogSplitLinkText = readString(
        'toolsChangelogSplitLinkText',
        formData.toolsChangelogSplitLinkText
    )
    formData.toolsChangelogStatsText = readString('toolsChangelogStatsText', formData.toolsChangelogStatsText)

    writeArrayToJsonField('bannerSlides', 'toolsBannerSlides', 'toolsBannerSlides')
    writeArrayToJsonField('changelogHeaderLinks', 'toolsChangelogHeaderLinks', 'toolsChangelogHeaderLinks')
    writeArrayToJsonField('changelogMetaLinks', 'toolsChangelogMetaLinks', 'toolsChangelogMetaLinks')
    writeArrayToJsonField('changelogTimeline', 'toolsChangelogTimeline', 'toolsChangelogTimeline')
}

/**
 * 函数说明：导入并应用布局 JSON 内容到当前页面表单
 */
const applyImportLayoutJson = () => {
    const rawText = importJsonText.value.trim()
    if (!rawText) {
        feedback.msgError('请先粘贴 JSON 配置内容')
        return
    }
    let parsed: unknown
    try {
        parsed = JSON.parse(rawText)
    } catch (error) {
        feedback.msgError(`JSON 解析失败：${(error as Error).message}`)
        return
    }
    if (!parsed || typeof parsed !== 'object') {
        feedback.msgError('导入失败：配置内容必须是 JSON 对象')
        return
    }
    const wrapper = parsed as Record<string, unknown>
    const source =
        wrapper.websiteLayout && typeof wrapper.websiteLayout === 'object'
            ? (wrapper.websiteLayout as Record<string, unknown>)
            : wrapper
    applyImportedFrontendLayoutData(source)
    applyLayoutFormFromJson()
    importDialogVisible.value = false
    feedback.msgSuccess('导入成功，请检查内容后点击保存生效')
}

/**
 * 函数说明：解析链接类型标签，便于运营快速识别站内/外链配置占比
 */
const getLinkTypeLabel = (link: string): string => {
    const value = String(link || '').trim()
    if (!value) {
        return '空链接'
    }
    if (value.startsWith('#')) {
        return '锚点'
    }
    if (/^https?:\/\//i.test(value)) {
        return '外链'
    }
    return '内链'
}

/**
 * 函数说明：统计链接列表中的重复链接项，返回可读问题描述
 */
const collectDuplicateLinkWarnings = (items: ToolsLinkItem[], fieldLabel: string): string[] => {
    const warningMessages: string[] = []
    const linkIndexMap = new Map<string, number[]>()
    items.forEach((item, index) => {
        const link = String(item.link || '').trim()
        if (!link) {
            return
        }
        const positions = linkIndexMap.get(link) || []
        positions.push(index + 1)
        linkIndexMap.set(link, positions)
    })
    linkIndexMap.forEach((positions, link) => {
        if (positions.length > 1) {
            warningMessages.push(`${fieldLabel} 存在重复链接：${link}（第 ${positions.join('、')} 项）`)
        }
    })
    return warningMessages
}

/**
 * 函数说明：统计分组链接中的重复链接，便于运营排查冗余配置
 */
const collectSectionDuplicateLinkWarnings = (sections: ToolsLinkSection[], fieldLabel: string): string[] => {
    const warningMessages: string[] = []
    sections.forEach((section, sectionIndex) => {
        warningMessages.push(
            ...collectDuplicateLinkWarnings(
                section.items,
                `${fieldLabel} / ${section.title || `第${sectionIndex + 1}组`}`
            )
        )
    })
    return warningMessages
}

/**
 * 函数说明：检查工具分类树中是否存在重复工具 URL，避免路由与统计冲突
 */
const collectDuplicateToolUrlWarnings = (categories: ToolsCatalogCategoryItem[]): string[] => {
    const warningMessages: string[] = []
    const urlPathMap = new Map<string, string[]>()
    categories.forEach((category) => {
        category.list.forEach((subCategory) => {
            subCategory.list.forEach((tool, toolIndex) => {
                const url = String(tool.url || '').trim()
                if (!url) {
                    return
                }
                const path = `${category.title || '未命名分类'} / ${subCategory.title || '未命名分组'} / ${
                    tool.title || `第${toolIndex + 1}个工具`
                }`
                const paths = urlPathMap.get(url) || []
                paths.push(path)
                urlPathMap.set(url, paths)
            })
        })
    })
    urlPathMap.forEach((paths, url) => {
        if (paths.length > 1) {
            warningMessages.push(`工具链接重复：${url}（${paths.join('；')}）`)
        }
    })
    return warningMessages
}

/**
 * 函数说明：检查侧栏分类菜单是否与工具一级分类存在未匹配项
 */
const collectSidebarCategoryMismatchWarnings = (
    sidebarMenus: ToolsSidebarCategoryMenuItem[],
    categories: ToolsCatalogCategoryItem[]
): string[] => {
    const warningMessages: string[] = []
    const categoryTitleSet = new Set(
        categories.map((category) => String(category.title || '').trim()).filter((title) => Boolean(title))
    )
    sidebarMenus.forEach((menu, index) => {
        const cateTitle = String(menu.cateTitle || '').trim()
        if (!cateTitle) {
            return
        }
        if (!categoryTitleSet.has(cateTitle)) {
            warningMessages.push(`侧栏分类菜单 第${index + 1}项未匹配工具一级分类：${cateTitle}`)
        }
    })
    return warningMessages
}

/**
 * 函数说明：提示 AI 工具箱固定入口中的站内路由项，避免与自动生成分类导航产生重复
 */
const collectAiToolboxRouteOverlapWarnings = (items: ToolsLinkItem[]): string[] => {
    const warningMessages: string[] = []
    items.forEach((item, index) => {
        const link = String(item.link || '').trim()
        if (link.startsWith('/')) {
            warningMessages.push(`AI工具箱左栏菜单 第${index + 1}项为站内路由：${link}，如非必要建议改为 #锚点或移除`)
        }
    })
    return warningMessages
}

/**
 * 函数说明：检查菜单样式模块中的重复链接与空分组风险，减少侧栏导航冗余。
 */
const collectSidebarMenuBlockWarnings = (blocks: ToolsSidebarMenuBlockEditor[]): string[] => {
    const warningMessages: string[] = []
    blocks.forEach((block, blockIndex) => {
        const blockTitle = String(block.title || '').trim() || `第${blockIndex + 1}个模块`
        if (!Array.isArray(block.items) || block.items.length === 0) {
            warningMessages.push(`菜单样式模块「${blockTitle}」未配置条目`)
            return
        }
        warningMessages.push(
            ...collectDuplicateLinkWarnings(
                block.items.map((item) => ({ name: item.name, link: item.link })),
                `菜单样式模块 / ${blockTitle}`
            )
        )
    })
    return warningMessages
}

/**
 * 函数说明：执行前端布局配置体检，输出必填校验与重复项风险提示
 */
const runLayoutHealthCheck = () => {
    if (!syncLayoutFormToJson()) {
        return
    }

    const warningMessages: string[] = []
    warningMessages.push(
        ...collectDuplicateLinkWarnings(
            layoutForm.bannerSlides.map((item) => ({
                name: item.text,
                link: item.link,
            })),
            '顶部Banner'
        )
    )
    if (!simpleMode.value) {
        warningMessages.push(...collectDuplicateLinkWarnings(layoutForm.changelogHeaderLinks, '更新记录页顶部链接'))
        warningMessages.push(...collectDuplicateLinkWarnings(layoutForm.changelogMetaLinks, '更新记录页资料链接'))
    }
    if (changelogTimelineParseResult.value.error) {
        warningMessages.push(changelogTimelineParseResult.value.error)
    } else if (changelogTimelineItems.value.length === 0) {
        warningMessages.push('更新记录页正文时间线为空')
    }

    if (warningMessages.length === 0) {
        feedback.msgSuccess('配置体检通过：未发现重复链接风险')
        return
    }

    const previewMessages = warningMessages.slice(0, 12)
    const suffix = warningMessages.length > 12 ? `\n... 其余 ${warningMessages.length - 12} 项请继续排查` : ''
    feedback.alertWarning(
        `基础校验通过，但发现 ${warningMessages.length} 项可优化问题：\n${previewMessages.join('\n')}${suffix}`
    )
}

/**
 * 函数说明：校验链接分组数据，确保分组名和组内链接完整
 */
const validateLinkSections = (sections: ToolsLinkSection[], fieldLabel: string): boolean => {
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
        const section = sections[sectionIndex]
        if (!section.title.trim()) {
            feedback.msgError(`${fieldLabel} 第${sectionIndex + 1}组：分组标题不能为空`)
            return false
        }
        if (!section.items.length) {
            feedback.msgError(`${fieldLabel} 第${sectionIndex + 1}组：请至少配置1条链接`)
            return false
        }
        if (!validateLinkItems(section.items, `${fieldLabel} 第${sectionIndex + 1}组`)) {
            return false
        }
    }
    return true
}

/**
 * 函数说明：校验页面级 SEO 配置，确保路径、标题、描述完整且分享图地址合法。
 */
const validateSeoPages = (items: ToolsSeoPageItem[]): boolean => {
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        const path = String(item.path || '').trim()
        const title = String(item.title || '').trim()
        const description = String(item.description || '').trim()
        const image = String(item.image || '').trim()
        if (!path) {
            feedback.msgError(`页面 SEO 第${index + 1}项：页面路径不能为空`)
            return false
        }
        if (!path.startsWith('/')) {
            feedback.msgError(`页面 SEO 第${index + 1}项：页面路径需以 / 开头`)
            return false
        }
        if (!title) {
            feedback.msgError(`页面 SEO 第${index + 1}项：页面标题不能为空`)
            return false
        }
        if (!description) {
            feedback.msgError(`页面 SEO 第${index + 1}项：页面描述不能为空`)
            return false
        }
        if (image && !image.startsWith('/') && !/^https?:\/\//i.test(image)) {
            feedback.msgError(`页面 SEO 第${index + 1}项：分享图需为 / 或 http(s) 开头`)
            return false
        }
    }
    return true
}

/**
 * 函数说明：校验工具分类树配置，确保分类/分组/工具的核心字段完整
 */
const validateToolsCategoryTree = (): boolean => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        feedback.msgError(result.error)
        return false
    }

    for (let categoryIndex = 0; categoryIndex < result.items.length; categoryIndex++) {
        const category = result.items[categoryIndex]
        if (!category.title.trim()) {
            feedback.msgError(`工具分类 第${categoryIndex + 1}项：分类标题不能为空`)
            return false
        }
        if (!Array.isArray(category.list) || category.list.length === 0) {
            feedback.msgError(`工具分类「${category.title}」至少需要 1 个二级分组`)
            return false
        }
        for (let subCategoryIndex = 0; subCategoryIndex < category.list.length; subCategoryIndex++) {
            const subCategory = category.list[subCategoryIndex]
            if (!subCategory.title.trim()) {
                feedback.msgError(`工具分类「${category.title}」第${subCategoryIndex + 1}个分组：标题不能为空`)
                return false
            }
            if (!Array.isArray(subCategory.list) || subCategory.list.length === 0) {
                feedback.msgError(`工具分组「${category.title} / ${subCategory.title}」至少需要 1 个工具`)
                return false
            }
            for (let toolIndex = 0; toolIndex < subCategory.list.length; toolIndex++) {
                const tool = subCategory.list[toolIndex]
                if (!tool.title.trim()) {
                    feedback.msgError(
                        `工具分组「${category.title} / ${subCategory.title}」第${toolIndex + 1}个工具：标题不能为空`
                    )
                    return false
                }
                const url = tool.url.trim()
                if (!url) {
                    feedback.msgError(`工具「${tool.title}」链接不能为空`)
                    return false
                }
                if (!isValidLinkValue(url, false)) {
                    feedback.msgError(`工具「${tool.title}」链接需为 / 或 http(s) 开头`)
                    return false
                }
                const seoImage = String(tool.seoImage || '').trim()
                if (seoImage && !seoImage.startsWith('/') && !/^https?:\/\//i.test(seoImage)) {
                    feedback.msgError(`工具「${tool.title}」SEO 分享图需为 / 或 http(s) 开头`)
                    return false
                }
            }
        }
    }
    return true
}

/**
 * 函数说明：格式化工具分类树 JSON，便于运营编辑与排查
 */
const formatToolsCategoryTreeEditor = () => {
    const result = parseToolsCategoryTree(toolsCategoryTreeEditor.value)
    if (result.error) {
        feedback.msgError(result.error)
        return
    }
    toolsCategoryTreeEditor.value = JSON.stringify(result.items, null, 2)
}

/**
 * 函数说明：重置工具分类树编辑器内容为空数组，触发前端回退内置工具库
 */
const resetToolsCategoryTreeEditor = () => {
    toolsCategoryTreeEditor.value = defaultToolsCategoryTreeJson
}

/**
 * 函数说明：将可视化表单同步为后端接口需要的 JSON 字符串
 */
const syncLayoutFormToJson = (): boolean => {
    if (!validateBannerSlides(layoutForm.bannerSlides)) {
        activeTab.value = 'banner'
        return false
    }
    if (!formData.toolsChangelogIntroText.trim()) {
        activeTab.value = 'pageOps'
        feedback.msgError('更新记录页顶部说明不能为空')
        return false
    }
    if (!formData.toolsChangelogStatsText.trim()) {
        activeTab.value = 'pageOps'
        feedback.msgError('更新记录页顶部统计说明不能为空')
        return false
    }
    if (changelogTimelineParseResult.value.error) {
        activeTab.value = 'pageOps'
        feedback.msgError(changelogTimelineParseResult.value.error)
        return false
    }
    if (changelogTimelineItems.value.length === 0) {
        activeTab.value = 'pageOps'
        feedback.msgError('更新记录页正文时间线不能为空')
        return false
    }

    if (!simpleMode.value) {
        if (
            !validateLinkItems(layoutForm.changelogHeaderLinks, '更新记录页顶部链接', {
                allowHash: false,
            })
        ) {
            activeTab.value = 'pageOps'
            return false
        }
        if (
            !validateLinkItems(layoutForm.changelogMetaLinks, '更新记录页资料链接', {
                allowHash: false,
            })
        ) {
            activeTab.value = 'pageOps'
            return false
        }
        if (!formData.toolsChangelogSplitTitle.trim()) {
            activeTab.value = 'pageOps'
            feedback.msgError('更新记录页版本提示标题不能为空')
            return false
        }
        if (!formData.toolsChangelogSplitDesc.trim()) {
            activeTab.value = 'pageOps'
            feedback.msgError('更新记录页版本提示说明不能为空')
            return false
        }
        if (!formData.toolsChangelogSplitLink.trim() || !isValidLinkValue(formData.toolsChangelogSplitLink, false)) {
            activeTab.value = 'pageOps'
            feedback.msgError('更新记录页版本提示链接需为 / 或 http(s) 开头')
            return false
        }
        if (!formData.toolsChangelogSplitLinkText.trim()) {
            activeTab.value = 'pageOps'
            feedback.msgError('更新记录页版本提示按钮文案不能为空')
            return false
        }
    }

    formData.toolsChangelogIntroText = formData.toolsChangelogIntroText.trim()
    formData.toolsChangelogStatsText = formData.toolsChangelogStatsText.trim()
    formData.toolsChangelogTimeline = JSON.stringify(changelogTimelineItems.value, null, 2)
    if (!simpleMode.value) {
        formData.toolsChangelogSplitTitle = formData.toolsChangelogSplitTitle.trim()
        formData.toolsChangelogSplitDesc = formData.toolsChangelogSplitDesc.trim()
        formData.toolsChangelogSplitLink = formData.toolsChangelogSplitLink.trim()
        formData.toolsChangelogSplitLinkText = formData.toolsChangelogSplitLinkText.trim()
    }

    formData.toolsBannerSlides = JSON.stringify(layoutForm.bannerSlides)
    formData.toolsChangelogHeaderLinks = JSON.stringify(layoutForm.changelogHeaderLinks)
    formData.toolsChangelogMetaLinks = JSON.stringify(layoutForm.changelogMetaLinks)
    return true
}

/**
 * 函数说明：通用数组排序方法，支持上移和下移
 */
function moveLinkItem<T>(list: T[], index: number, step: -1 | 1) {
    const targetIndex = index + step
    if (targetIndex < 0 || targetIndex >= list.length) {
        return
    }
    const current = list[index]
    list[index] = list[targetIndex]
    list[targetIndex] = current
}

/**
 * 函数说明：移动分组顺序，支持上移和下移
 */
const moveSection = (list: ToolsLinkSection[], index: number, step: -1 | 1) => {
    moveLinkItem(list, index, step)
}

/**
 * 函数说明：新增 Banner 轮播条目
 */
const addBannerSlide = () => {
    layoutForm.bannerSlides.push(createEmptyBannerSlideItem())
    bannerSectionCollapseKeys.value = [String(layoutForm.bannerSlides.length - 1)]
}

/**
 * 函数说明：删除 Banner 轮播条目
 */
const removeBannerSlide = (index: number) => {
    layoutForm.bannerSlides.splice(index, 1)
    bannerSectionCollapseKeys.value = layoutForm.bannerSlides.length > 0 ? ['0'] : []
}

/**
 * 函数说明：新增页脚技术支持链接条目
 */
const addFooterSupportLink = () => {
    layoutForm.footerSupportLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除页脚技术支持链接条目
 */
const removeFooterSupportLink = (index: number) => {
    layoutForm.footerSupportLinks.splice(index, 1)
}

/**
 * 函数说明：新增页脚备案与版权链接条目
 */
const addFooterRecordLink = () => {
    layoutForm.footerRecordLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除页脚备案与版权链接条目
 */
const removeFooterRecordLink = (index: number) => {
    layoutForm.footerRecordLinks.splice(index, 1)
}

/**
 * 函数说明：新增头部链接条目
 */
const addHeaderLink = () => {
    layoutForm.headerLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除头部链接条目
 */
const removeHeaderLink = (index: number) => {
    layoutForm.headerLinks.splice(index, 1)
}

/**
 * 函数说明：新增搜索面板快捷入口条目。
 */
const addSearchQuickTool = () => {
    layoutForm.searchQuickTools.push(createEmptySearchQuickToolItem())
}

/**
 * 函数说明：删除搜索面板快捷入口条目。
 */
const removeSearchQuickTool = (index: number) => {
    layoutForm.searchQuickTools.splice(index, 1)
}

/**
 * 函数说明：新增侧栏推荐链接条目
 */
const addSidebarRecommendLink = () => {
    layoutForm.sidebarRecommendLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除侧栏推荐链接条目
 */
const removeSidebarRecommendLink = (index: number) => {
    layoutForm.sidebarRecommendLinks.splice(index, 1)
}

/**
 * 函数说明：新增侧边栏分类菜单条目
 */
const addSidebarCategoryMenu = () => {
    layoutForm.sidebarCategoryMenus.push(createEmptySidebarCategoryMenuItem())
}

/**
 * 函数说明：删除侧边栏分类菜单条目
 */
const removeSidebarCategoryMenu = (index: number) => {
    layoutForm.sidebarCategoryMenus.splice(index, 1)
}

/**
 * 函数说明：新增菜单样式模块条目。
 */
const addSidebarMenuBlock = () => {
    layoutForm.sidebarMenuBlocks.push(createEmptySidebarMenuBlock())
}

/**
 * 函数说明：删除菜单样式模块条目。
 */
const removeSidebarMenuBlock = (index: number) => {
    layoutForm.sidebarMenuBlocks.splice(index, 1)
}

/**
 * 函数说明：新增菜单样式模块中的菜单条目。
 */
const addSidebarMenuBlockItem = (blockIndex: number) => {
    layoutForm.sidebarMenuBlocks[blockIndex].items.push(createEmptySidebarMenuBlockItem())
}

/**
 * 函数说明：删除菜单样式模块中的菜单条目。
 */
const removeSidebarMenuBlockItem = (blockIndex: number, itemIndex: number) => {
    layoutForm.sidebarMenuBlocks[blockIndex].items.splice(itemIndex, 1)
}

/**
 * 函数说明：新增侧边栏底部功能链接条目
 */
const addSidebarBottomLink = () => {
    layoutForm.sidebarBottomLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除侧边栏底部功能链接条目
 */
const removeSidebarBottomLink = (index: number) => {
    layoutForm.sidebarBottomLinks.splice(index, 1)
}

/**
 * 函数说明：新增 AI 工具箱页左侧菜单条目
 */
const addAiToolboxSidebarMenu = () => {
    layoutForm.aiToolboxSidebarMenus.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除 AI 工具箱页左侧菜单条目
 */
const removeAiToolboxSidebarMenu = (index: number) => {
    layoutForm.aiToolboxSidebarMenus.splice(index, 1)
}

/**
 * 函数说明：新增更新记录页顶部快捷链接条目
 */
const addChangelogHeaderLink = () => {
    layoutForm.changelogHeaderLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除更新记录页顶部快捷链接条目
 */
const removeChangelogHeaderLink = (index: number) => {
    layoutForm.changelogHeaderLinks.splice(index, 1)
}

/**
 * 函数说明：新增更新记录页资料链接条目
 */
const addChangelogMetaLink = () => {
    layoutForm.changelogMetaLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除更新记录页资料链接条目
 */
const removeChangelogMetaLink = (index: number) => {
    layoutForm.changelogMetaLinks.splice(index, 1)
}

/**
 * 函数说明：新增 AI 对话页顶部快捷链接条目
 */
const addAiChatHeaderLink = () => {
    layoutForm.aiChatHeaderLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除 AI 对话页顶部快捷链接条目
 */
const removeAiChatHeaderLink = (index: number) => {
    layoutForm.aiChatHeaderLinks.splice(index, 1)
}

/**
 * 函数说明：新增 AI 通用工具页顶部快捷链接条目
 */
const addAiCommonHeaderLink = () => {
    layoutForm.aiCommonHeaderLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除 AI 通用工具页顶部快捷链接条目
 */
const removeAiCommonHeaderLink = (index: number) => {
    layoutForm.aiCommonHeaderLinks.splice(index, 1)
}

/**
 * 函数说明：新增页脚快捷入口分组
 */
const addQuickSection = () => {
    layoutForm.footerQuickSections.push(createEmptySection())
}

/**
 * 函数说明：删除页脚快捷入口分组
 */
const removeQuickSection = (sectionIndex: number) => {
    layoutForm.footerQuickSections.splice(sectionIndex, 1)
}

/**
 * 函数说明：新增页脚快捷入口分组中的链接
 */
const addQuickItem = (sectionIndex: number) => {
    layoutForm.footerQuickSections[sectionIndex].items.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除页脚快捷入口分组中的链接
 */
const removeQuickItem = (sectionIndex: number, itemIndex: number) => {
    layoutForm.footerQuickSections[sectionIndex].items.splice(itemIndex, 1)
}

/**
 * 函数说明：新增友情链接分组
 */
const addFriendSection = () => {
    layoutForm.footerFriendSections.push(createEmptySection())
}

/**
 * 函数说明：删除友情链接分组
 */
const removeFriendSection = (sectionIndex: number) => {
    layoutForm.footerFriendSections.splice(sectionIndex, 1)
}

/**
 * 函数说明：新增友情链接分组中的链接
 */
const addFriendItem = (sectionIndex: number) => {
    layoutForm.footerFriendSections[sectionIndex].items.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除友情链接分组中的链接
 */
const removeFriendItem = (sectionIndex: number, itemIndex: number) => {
    layoutForm.footerFriendSections[sectionIndex].items.splice(itemIndex, 1)
}

/**
 * 函数说明：新增官方媒体链接条目
 */
const addOfficialMediaLink = () => {
    layoutForm.officialMediaLinks.push(createEmptyLinkItem())
}

/**
 * 函数说明：删除官方媒体链接条目
 */
const removeOfficialMediaLink = (index: number) => {
    layoutForm.officialMediaLinks.splice(index, 1)
}

/**
 * 函数说明：新增页面 SEO 条目。
 */
const addSeoPage = () => {
    layoutForm.seoPages.push(createEmptySeoPage())
}

/**
 * 函数说明：删除页面 SEO 条目。
 */
const removeSeoPage = (index: number) => {
    layoutForm.seoPages.splice(index, 1)
}

/**
 * 函数说明：读取网站配置并回填前端布局表单
 */
const getData = async () => {
    isLoadingData.value = true
    loadErrorMessage.value = ''
    try {
        const data = (await getWebsite()) as Record<string, unknown>
        for (const key in formData) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                formData[key] = String(data[key] ?? '')
            }
        }
        applyLayoutFormFromJson()
        updateBaselineLayoutSnapshot()
    } catch {
        loadErrorMessage.value = '前端布局配置加载失败，请检查接口连通性或重新登录后重试。'
        feedback.msgError('前端布局配置加载失败，请检查接口或登录状态')
        updateBaselineLayoutSnapshot()
    } finally {
        isLoadingData.value = false
    }
}

/**
 * 函数说明：手动重试读取前端布局配置，减少偶发网络失败时的刷新成本。
 */
const retryLoadData = async () => {
    await getData()
}

/**
 * 函数说明：保存前校验每日学习配置，阻止无效域名或不完整筛选条件进入接口。
 */
const validateHomepageLearningForm = (): boolean => {
    if (!homepageLearningEnabled.value) {
        return true
    }
    const tips = collectModuleMissingTips('homepageLearning')
    if (tips.length === 0) {
        return true
    }
    activeTab.value = 'homepageLearning'
    feedback.msgError(tips[0])
    return false
}

/**
 * 函数说明：仅组装首页运营页当前开放模块的配置，避免覆盖菜单、头部、页脚、SEO 和工具主数据的独立保存结果。
 */
const buildFrontendLayoutPayload = (): Record<string, string> => {
    const payload: Record<string, string> = {
        toolsBannerSlides: formData.toolsBannerSlides,
        toolsHomepageLearningEnabled: formData.toolsHomepageLearningEnabled,
        toolsHomepageLearningTitle: formData.toolsHomepageLearningTitle,
        toolsHomepageLearningRssUrl: formData.toolsHomepageLearningRssUrl,
        toolsHomepageLearningFilterType: formData.toolsHomepageLearningFilterType,
        toolsHomepageLearningCategorySlug: formData.toolsHomepageLearningCategorySlug,
        toolsHomepageLearningCategoryIds: formData.toolsHomepageLearningCategoryIds,
        toolsHomepageLearningLimit: formData.toolsHomepageLearningLimit,
        toolsChangelogIntroText: formData.toolsChangelogIntroText,
        toolsChangelogStatsText: formData.toolsChangelogStatsText,
        toolsChangelogTimeline: formData.toolsChangelogTimeline,
    }
    if (!simpleMode.value) {
        Object.assign(payload, {
            toolsChangelogHeaderLinks: formData.toolsChangelogHeaderLinks,
            toolsChangelogMetaLinks: formData.toolsChangelogMetaLinks,
            toolsChangelogSplitTitle: formData.toolsChangelogSplitTitle,
            toolsChangelogSplitDesc: formData.toolsChangelogSplitDesc,
            toolsChangelogSplitLink: formData.toolsChangelogSplitLink,
            toolsChangelogSplitLinkText: formData.toolsChangelogSplitLinkText,
        })
    }
    return payload
}

/**
 * 函数说明：校验并保存前端布局配置
 */
const handleSubmit = async () => {
    if (isSubmitting.value || isLoadingData.value) {
        return
    }
    if (!validateHomepageLearningForm()) {
        return
    }
    if (!syncLayoutFormToJson()) {
        return
    }

    isSubmitting.value = true
    try {
        await setWebsite(buildFrontendLayoutPayload())
        feedback.msgSuccess('前端布局配置已保存')
        lastSavedAt.value = formatDateTimeText(new Date())
        await getConfig()
        await getData()
    } finally {
        isSubmitting.value = false
    }
}

/**
 * 函数说明：浏览器刷新/关闭前拦截未保存变更，减少运营误操作丢数据
 */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!hasUnsavedChanges.value) {
        return
    }
    event.preventDefault()
    event.returnValue = ''
}

/**
 * 函数说明：路由切换前提醒未保存变更，避免运营配置编辑中断
 */
onBeforeRouteLeave(async () => {
    if (!hasUnsavedChanges.value) {
        return true
    }
    try {
        await feedback.confirm('当前页面存在未保存变更，确定离开吗？')
        return true
    } catch {
        return false
    }
})

onMounted(() => {
    void getData()
    window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style lang="scss" scoped>
.website-frontend-layout {
    padding-bottom: 12px;

    .layout-load-alert {
        margin-bottom: 10px;
        border-radius: 10px;
    }

    .layout-current-module {
        min-width: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .layout-current-module__main {
        min-width: 0;
        display: flex;
        align-items: baseline;
        gap: 10px;
    }

    .layout-current-module__main strong {
        flex-shrink: 0;
        font-size: 14px;
        color: var(--color-text-1, #1d2129);
    }

    .layout-current-module__main span {
        overflow: hidden;
        color: var(--color-text-3, #86909c);
        font-size: 12px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .layout-page-header {
        margin-bottom: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        background: #fff;

        :deep(.arco-page-header-wrapper) {
            padding: 14px 16px;
        }

        :deep(.arco-page-header-title) {
            font-size: 18px;
        }

        :deep(.arco-page-header-subtitle) {
            max-width: 820px;
            line-height: 1.6;
            color: var(--color-text-3, #86909c);
        }
    }

    .layout-page-actions {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;

        .layout-mode-switch {
            :deep(.arco-radio-button-content) {
                min-width: 72px;
                text-align: center;
            }
        }
    }

    .layout-status-tags {
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .layout-top-metrics {
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
    }

    .layout-main-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        background: #fff;
        overflow: hidden;
        box-shadow: none;

        :deep(.arco-card-body) {
            padding: 14px 16px 16px;
        }
    }

    .layout-main-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding-bottom: 10px;
        border-bottom: 1px solid var(--color-border-2, #e5e6eb);
        margin-bottom: 10px;
    }

    .layout-main-head__main {
        min-width: 280px;
        flex: 1;
    }

    .layout-main-head__title {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .layout-main-head__desc {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-text-3, #86909c);
    }

    .layout-workspace {
        display: block;
    }

    .layout-workspace.is-advanced {
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
        gap: 14px;
        align-items: start;
    }

    .layout-workspace-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .layout-operate-zone,
    .layout-config-zone {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        background: #fff;
        padding: 12px;
    }

    .layout-config-zone {
        padding: 0;
        border: 0;
    }

    .layout-zone-header {
        margin-bottom: 14px;
        padding: 4px 2px 12px;
        border-bottom: 1px solid var(--color-border-2, #e5e6eb);
    }

    .layout-zone-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .layout-zone-desc {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1.6;
    }

    .official-tabs {
        margin-bottom: 12px;
        :deep(.arco-tabs-nav::before) {
            background-color: var(--color-border-2, #e5e6eb);
        }
    }

    .layout-basic-workflow {
        margin-bottom: 14px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--color-border-2, #e5e6eb);
    }

    .layout-context-collapse {
        margin-top: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        overflow: hidden;

        :deep(.arco-collapse-item-header) {
            min-height: 40px;
            padding: 8px 12px;
            background: var(--color-fill-1, #f7f8fa);
        }

        :deep(.arco-collapse-item-content-box) {
            padding: 12px;
        }
    }

    .layout-context-collapse__title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-2, #4e5969);
    }

    .layout-context-content {
        font-size: 12px;
        line-height: 1.7;
        color: var(--color-text-2, #4e5969);

        p,
        ul {
            margin: 0 0 10px;
        }

        ul {
            padding-left: 18px;
        }
    }

    .layout-context-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .layout-inline-guide {
        padding: 10px 12px;
        border-left: 3px solid rgb(var(--primary-6));
        border-radius: 8px;
        background: #f7f8ff;
        font-size: 13px;
        line-height: 1.7;
        color: var(--color-text-2, #4e5969);
    }

    .basic-workflow-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }

    .basic-workflow-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .basic-workflow-desc {
        margin: 6px 0 0;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .basic-workflow-switch {
        width: 100%;

        :deep(.arco-radio-group-button) {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            width: 100%;
        }

        :deep(.arco-radio-button) {
            min-width: 0;
        }

        :deep(.arco-radio-button-content) {
            width: 100%;
            text-align: center;
        }
    }

    .layout-current-module {
        margin-top: 10px;
        min-height: 24px;
    }

    .mode-toolbar__left {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .mode-toolbar__label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .basic-missing-count {
        margin-left: 2px;
        font-size: 12px;
        color: var(--color-warning-6, #ff7d00);
    }

    .layout-assist-card {
        margin-bottom: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
    }

    .layout-assist-left {
        min-width: 0;
    }

    .layout-assist-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .layout-assist-desc {
        margin-top: 4px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .layout-assist-right {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
    }

    .layout-assist-tip {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .inner-section-tabs {
        margin-top: 10px;
    }

    .layout-workflow-card {
        margin-bottom: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 12px;
    }

    .workflow-head {
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .workflow-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .workflow-desc {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1.6;
    }

    .layout-metric-grid {
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
    }

    .layout-metric-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .metric-label {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .metric-value {
        margin-top: 4px;
        font-size: 20px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .layout-shortcuts {
        margin-bottom: 10px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
    }

    .shortcut-group {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        background: #fff;
        padding: 8px 10px;
    }

    .shortcut-label {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        padding-right: 2px;
        white-space: nowrap;
    }

    .layout-module-nav {
        margin-bottom: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .module-nav-title {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .module-nav-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .import-dialog-alert {
        margin-bottom: 10px;
    }

    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
    }

    .layout-guide-card {
        margin-bottom: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #f8fafc;
        padding: 10px 12px;
    }

    .layout-preview-grid {
        margin-bottom: 10px;
    }

    .layout-section-alert {
        margin-bottom: 10px;
    }

    .layout-section-collapse {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .layout-section-collapse :deep(.arco-collapse-item) {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        overflow: hidden;
        background: #fff;
    }

    .layout-section-collapse :deep(.arco-collapse-item-header) {
        min-height: 44px;
        padding: 10px 14px;
        background: #f8f9fc;
        border-bottom: 1px solid var(--color-border-2, #e5e6eb);
    }

    .layout-section-collapse :deep(.arco-collapse-item-content) {
        padding: 0;
        background: #fff;
    }

    .layout-section-collapse :deep(.arco-collapse-item-content-box) {
        padding: 10px 12px 12px;
    }

    .layout-section-collapse__title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .guide-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .guide-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .guide-description {
        margin-top: 6px;
        font-size: 13px;
        color: var(--color-text-2, #4e5969);
        line-height: 1.6;
    }

    .guide-tips {
        margin-top: 6px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1.6;
    }

    .guide-tips-label {
        color: var(--color-text-1, #1d2129);
        font-weight: 500;
    }

    .guide-example {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .preview-inline-alert {
        margin-bottom: 10px;
    }

    .preview-group + .preview-group {
        margin-top: 14px;
    }

    .preview-group-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .preview-group-desc {
        margin-top: 4px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .catalog-preview-list {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
    }

    .catalog-preview-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .catalog-preview-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .catalog-preview-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .catalog-preview-meta,
    .catalog-preview-samples {
        margin-top: 6px;
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .footer-summary-grid {
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .footer-summary-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .summary-label {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .summary-value {
        margin-top: 4px;
        font-size: 20px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .summary-desc {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .layout-tabs {
        margin-top: 0;

        :deep(.arco-tabs-nav) {
            display: none;
        }

        :deep(.arco-tabs-content) {
            padding-top: 0;
        }
    }

    .official-tabs,
    .inner-section-tabs {
        :deep(.arco-tabs-nav) {
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: thin;
            padding-bottom: 2px;
        }

        :deep(.arco-tabs-nav-tab-list) {
            flex-wrap: nowrap;
        }

        :deep(.arco-tabs-tab) {
            white-space: nowrap;
        }

        :deep(.arco-tabs-content) {
            padding-top: 6px;
        }
    }

    .catalog-alert {
        margin-bottom: 10px;
    }

    .catalog-overview-grid {
        margin-bottom: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 10px;
    }

    .catalog-overview-card {
        border-radius: 10px;
        border: 1px dashed var(--color-border-2, #e5e6eb);
        background: #fff;
        padding: 10px 12px;
    }

    .catalog-overview-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .catalog-overview-meta {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .catalog-stat-row {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .catalog-error {
        margin-top: 8px;
        color: var(--color-danger-6, #f53f3f);
        font-size: 12px;
    }

    .panel-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .panel-card {
        border-radius: 10px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        overflow: hidden;
        background: #fff;

        :deep(.arco-card-header) {
            min-height: 46px;
            padding: 10px 14px;
            border-bottom: 1px solid var(--color-border-2, #e5e6eb);
            background: #fff;
        }

        :deep(.arco-card-body) {
            padding: 12px 14px 14px;
        }
    }

    .panel-card--spaced {
        margin-top: 16px;
    }

    .panel-description {
        margin-bottom: 10px;
        padding: 8px 0 10px;
        border: 0;
        border-bottom: 1px dashed var(--color-border-2, #e5e6eb);
        border-radius: 0;
        background: transparent;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1.6;
    }

    .panel-description code {
        display: inline-block;
        padding: 0 4px;
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.06);
        color: var(--color-text-1, #1d2129);
    }

    .panel-header-actions {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }

    .panel-header-actions :deep(.arco-btn) {
        height: 30px;
        padding: 0 10px;
        border-radius: 8px;
    }

    .panel-header-actions :deep(.arco-btn.arco-btn-text) {
        background: transparent;
    }

    .panel-header-buttons {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .compact-form {
        padding-right: 8px;
    }

    .row-list-empty {
        font-size: 13px;
        color: var(--color-text-3, #86909c);
        padding: 10px 12px;
        border: 1px dashed var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #f8fafc;
    }

    .link-row {
        display: grid;
        grid-template-columns: minmax(120px, 220px) minmax(220px, 1fr) auto;
        gap: 10px;
        margin-bottom: 10px;
        align-items: start;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fafbff;
        padding: 10px;
    }

    .search-quick-row {
        grid-template-columns:
            minmax(160px, 220px) minmax(240px, 1.3fr) minmax(220px, 1fr)
            auto;
    }

    .banner-collapse {
        display: flex;
        flex-direction: column;
        gap: 8px;

        :deep(.arco-collapse-item) {
            overflow: hidden;
            border: 1px solid var(--color-border-2, #e5e6eb);
            border-radius: 6px;
            background: #fff;
        }

        :deep(.arco-collapse-item-header) {
            min-height: 42px;
            padding: 8px 12px;
            background: var(--color-fill-1, #f7f8fa);
        }

        :deep(.arco-collapse-item-content-box) {
            padding: 12px;
        }
    }

    .banner-summary {
        min-width: 0;
        width: 100%;
        display: grid;
        grid-template-columns: auto minmax(180px, 1fr) minmax(180px, 0.7fr);
        align-items: center;
        gap: 10px;

        strong,
        span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        strong {
            color: var(--color-text-1, #1d2129);
            font-size: 13px;
        }

        span {
            color: var(--color-text-3, #86909c);
            font-size: 12px;
        }
    }

    .banner-edit-grid {
        display: grid;
        grid-template-columns: minmax(90px, 140px) minmax(200px, 1fr) minmax(240px, 1fr);
        gap: 10px;
        align-items: start;

        > :nth-child(4) {
            grid-column: 1 / -2;
        }
    }

    .menu-row {
        display: grid;
        grid-template-columns:
            minmax(80px, 120px) minmax(120px, 180px) minmax(220px, 1fr) minmax(120px, 180px)
            minmax(220px, 1fr) auto;
        gap: 10px;
        margin-bottom: 10px;
        align-items: start;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fafbff;
        padding: 10px;
    }

    .menu-block-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fafbff;
        padding: 10px;
        margin-bottom: 10px;
    }

    .menu-block-card__head {
        display: grid;
        grid-template-columns:
            minmax(120px, 180px) minmax(120px, 180px) minmax(120px, 180px) minmax(220px, 1fr)
            auto;
        gap: 10px;
        align-items: start;
    }

    .menu-block-card__body {
        margin-top: 10px;
        border-top: 1px dashed var(--color-border-2, #e5e6eb);
        padding-top: 10px;
    }

    .menu-block-card__toolbar {
        margin-bottom: 8px;
    }

    .menu-block-item-row {
        display: grid;
        grid-template-columns:
            minmax(120px, 180px) minmax(220px, 1fr) minmax(100px, 140px) minmax(140px, 220px)
            minmax(180px, 1fr) minmax(180px, 1fr) auto;
        gap: 10px;
        margin-bottom: 10px;
        align-items: start;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px;
    }

    .seo-page-row {
        display: grid;
        grid-template-columns:
            minmax(180px, 220px) minmax(180px, 220px) minmax(220px, 1fr) minmax(220px, 1fr)
            minmax(240px, 1.2fr) auto;
        gap: 10px;
        margin-bottom: 10px;
        align-items: start;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fafbff;
        padding: 10px;
    }

    .menu-icon-editor {
        display: grid;
        grid-template-columns: auto minmax(140px, 1fr);
        align-items: center;
        gap: 8px;
    }

    .row-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        min-height: 32px;
    }

    .row-actions :deep(.arco-btn) {
        padding: 0 8px;
        border-radius: 8px;
    }

    .link-preview-board {
        margin-top: 8px;
        border: 1px dashed var(--color-border-2, #e5e6eb);
        border-radius: 8px;
        padding: 10px;
        background: #fff;
    }

    .preview-title {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        margin-bottom: 8px;
    }

    .preview-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .preview-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 999px;
        padding: 4px 10px;
        background: #fff;
    }

    .chip-name {
        font-size: 12px;
        color: var(--color-text-1, #1d2129);
        max-width: 180px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .search-quick-preview-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 10px;
    }

    .search-quick-preview-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fafbff;
        padding: 10px;
    }

    .search-quick-preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 6px;
    }

    .search-quick-preview-desc {
        font-size: 12px;
        line-height: 1.6;
        color: var(--color-text-3, #86909c);
    }

    .sidebar-menu-preview-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
    }

    .sidebar-menu-preview-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .sidebar-menu-preview-header {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sidebar-menu-preview-icon {
        width: 18px;
        height: 18px;
        object-fit: contain;
    }

    .sidebar-menu-preview-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-1, #1d2129);
    }

    .sidebar-menu-preview-meta {
        margin-top: 6px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        line-height: 1.6;
    }

    .footer-preview-grid {
        margin-top: 10px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    .footer-preview-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        background: #fff;
        padding: 10px 12px;
    }

    .footer-preview-label {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .footer-preview-value {
        margin-top: 4px;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text-1, #1d2129);
    }

    .footer-preview-desc {
        margin-top: 4px;
        font-size: 12px;
        color: var(--color-text-3, #86909c);
    }

    .section-card {
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 10px;
        padding: 10px;
        background: #fff;
        margin-bottom: 10px;
    }

    .section-title-row {
        display: grid;
        grid-template-columns: minmax(160px, 320px) auto;
        gap: 10px;
        margin-bottom: 10px;
    }

    .layout-floating-submit {
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 50;
        border: 1px solid var(--color-border-2, #e5e6eb);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(8px);
        padding: 10px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 360px;
        max-width: calc(100vw - 40px);
    }

    .layout-floating-submit__left {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .layout-floating-submit__text {
        font-size: 12px;
        color: var(--color-text-3, #86909c);
        white-space: nowrap;
    }

    @media (max-width: 1080px) {
        .layout-workspace.is-advanced {
            grid-template-columns: 1fr;
        }

        .layout-top-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .layout-assist-card {
            flex-direction: column;
            align-items: flex-start;
        }

        .layout-assist-right {
            width: 100%;
            justify-content: space-between;
        }

        .layout-metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .layout-shortcuts {
            flex-direction: column;
            align-items: stretch;
        }

        .shortcut-group {
            width: 100%;
        }

        .footer-summary-grid {
            grid-template-columns: 1fr;
        }

        .panel-grid {
            grid-template-columns: 1fr;
        }

        .footer-preview-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 1360px) {
        .layout-page-actions {
            justify-content: flex-start;
        }

        .layout-top-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .layout-workspace.is-advanced {
            grid-template-columns: 1fr;
        }

        .link-row,
        .menu-row,
        .seo-page-row,
        .menu-block-card__head,
        .menu-block-item-row,
        .section-title-row {
            grid-template-columns: 1fr;
        }

        .row-actions {
            justify-content: flex-start;
            flex-wrap: wrap;
        }
    }

    @media (max-width: 920px) {
        .layout-page-actions {
            width: 100%;
            .layout-mode-switch {
                width: 100%;
                :deep(.arco-radio-group-button) {
                    width: 100%;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }
            }
        }

        .layout-top-metrics {
            grid-template-columns: 1fr;
        }

        .layout-metric-grid {
            grid-template-columns: 1fr;
        }

        .layout-current-module {
            flex-direction: column;
            align-items: flex-start;
        }

        .layout-current-module__main {
            width: 100%;
        }

        .guide-title-row {
            flex-direction: column;
            align-items: flex-start;
        }

        .link-row {
            grid-template-columns: 1fr;
        }

        .banner-summary,
        .banner-edit-grid {
            grid-template-columns: 1fr;
        }

        .banner-edit-grid > :nth-child(4) {
            grid-column: auto;
        }

        .menu-row {
            grid-template-columns: 1fr;
        }

        .seo-page-row {
            grid-template-columns: 1fr;
        }

        .menu-block-card__head {
            grid-template-columns: 1fr;
        }

        .menu-block-item-row {
            grid-template-columns: 1fr;
        }

        .section-title-row {
            grid-template-columns: 1fr;
        }

        .layout-floating-submit {
            left: 12px;
            right: 12px;
            bottom: 12px;
            min-width: 0;
            flex-direction: column;
            align-items: stretch;
        }

        .layout-floating-submit__left {
            width: 100%;
            justify-content: flex-start;
        }

        .layout-floating-submit__text {
            white-space: normal;
        }
    }
}
</style>
