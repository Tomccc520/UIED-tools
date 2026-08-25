/**
 * @file smoke-p0-actions.mjs
 * @description 后台 P0 页面关键操作入口静态冒烟，检查按钮/开关标记与隐藏规则
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-06-08
 */

import fs from 'node:fs'
import path from 'node:path'
import {
    ADMIN_P0_ACTION_PAGES,
    resolveAdminP0StaticMarkers
} from './lib/admin-p0-action-pages.mjs'

const cwd = process.cwd()

/**
 * 函数说明：读取后台源码文件，失败时返回空字符串并交由调用方记录错误。
 */
const readSourceFile = (relativePath) => {
    try {
        return fs.readFileSync(path.resolve(cwd, relativePath), 'utf8')
    } catch {
        return ''
    }
}

/**
 * 函数说明：读取 P0 页面主文件和拆分组件源码，保证工作台等组合页面也能被静态冒烟覆盖。
 */
const readPageSourceText = ({ file, files }) => {
    const fileList = [file, ...(Array.isArray(files) ? files : [])].filter(Boolean)
    return fileList
        .map((sourceFile) => ({
            file: sourceFile,
            text: readSourceFile(sourceFile)
        }))
        .filter((item) => item.text)
}

/**
 * 函数说明：检查单个页面的关键操作标记是否完整存在，覆盖默认、条件、错误态和高级模式入口。
 */
const collectMissingMarkers = (pageSpec) => {
    const sourceList = readPageSourceText(pageSpec)
    if (sourceList.length === 0) {
        return [`${pageSpec.file}: 文件不存在或不可读`]
    }
    const combinedText = sourceList.map((item) => item.text).join('\n')
    const markerList = resolveAdminP0StaticMarkers(pageSpec)
    return markerList
        .filter((marker) => !combinedText.includes(`data-admin-smoke="${marker}"`))
        .map((marker) => `${pageSpec.file}: 缺少 data-admin-smoke="${marker}"`)
}

/**
 * 函数说明：递归收集后台样式文件，用于守护全局样式不再隐藏业务入口。
 */
const collectStyleFiles = (relativeDir) => {
    const absoluteDir = path.resolve(cwd, relativeDir)
    if (!fs.existsSync(absoluteDir)) {
        return []
    }
    const files = []
    const walk = (currentDir) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true })
        entries.forEach((entry) => {
            const absolutePath = path.join(currentDir, entry.name)
            if (entry.isDirectory()) {
                walk(absolutePath)
                return
            }
            if (entry.isFile() && /\.(css|scss|sass|less)$/i.test(entry.name)) {
                files.push(path.relative(cwd, absolutePath).split(path.sep).join('/'))
            }
        })
    }
    walk(absoluteDir)
    return files
}

/**
 * 函数说明：检查后台全局治理样式，避免再次通过 display/visibility/opacity 强制隐藏业务入口。
 */
const collectStyleGuardErrors = () => {
    const styleFiles = collectStyleFiles('src/styles')
    if (styleFiles.length === 0) {
        return ['src/styles: 样式目录不存在或不可读']
    }
    return styleFiles.flatMap((styleFile) => {
        const styleText = readSourceFile(styleFile)
        const errors = []
        if (/display\s*:\s*none\s*!important/i.test(styleText)) {
            errors.push(`${styleFile}: 不允许使用 display:none!important 隐藏后台业务入口`)
        }
        if (/visibility\s*:\s*hidden\s*!important/i.test(styleText)) {
            errors.push(`${styleFile}: 不允许使用 visibility:hidden!important 隐藏后台业务入口`)
        }
        if (/opacity\s*:\s*0\s*!important/i.test(styleText)) {
            errors.push(`${styleFile}: 不允许使用 opacity:0!important 隐藏后台业务入口`)
        }
        return errors
    })
}

const redundantContentPatterns = [
    {
        pattern: /<section\s+class="[^"]*-workspace"/i,
        message: '不应重复展示工作区概览，保留页头状态、核心指标与业务表单即可'
    },
    {
        pattern: /<div\s+class="[^"]*-filter-strip"/i,
        message: '不应在筛选表单下重复展示筛选摘要'
    }
]

/**
 * 函数说明：检查 P0 页面是否重新堆叠工作区概览或筛选摘要，避免同一信息多次出现。
 */
const collectRedundantContentErrors = () => {
    return ADMIN_P0_ACTION_PAGES.flatMap((pageSpec) => {
        const sourceList = readPageSourceText(pageSpec)
        return sourceList.flatMap((item) =>
            redundantContentPatterns
                .filter(({ pattern }) => pattern.test(item.text))
                .map(({ message }) => `${item.file}: ${message}`)
        )
    })
}

/**
 * 函数说明：收集官网设置页面，防止配置页再次叠加入口说明和大型运营概览。
 */
const collectWebsiteSettingsRedundantContentErrors = () => {
    const websiteViewsDir = path.resolve(cwd, 'src/views/setting/website')
    if (!fs.existsSync(websiteViewsDir)) {
        return ['src/views/setting/website: 官网设置目录不存在或不可读']
    }

    return fs
        .readdirSync(websiteViewsDir)
        .filter((fileName) => fileName.endsWith('.vue'))
        .flatMap((fileName) => {
            const relativePath = `src/views/setting/website/${fileName}`
            const sourceText = readSourceFile(relativePath)
            const errors = []
            if (/<div\b[^>]*class="[^"]*\bpage-entry-grid\b/i.test(sourceText)) {
                errors.push(`${relativePath}: 不应重复展示“当前页维护什么”入口说明`)
            }
            if (/<section\b[^>]*class="[^"]*\bops-workspace\b/i.test(sourceText)) {
                errors.push(`${relativePath}: 不应在配置表单前重复展示大型运营工作区`)
            }
            if (/<a-alert\b[^>]*v-if="[^"]*simpleMode[^"]*"[^>]*class="[^"]*\bmode-alert\b/i.test(sourceText)) {
                errors.push(`${relativePath}: 简版模式说明应并入模式切换文案，不再单独占用提示框`)
            }
            return errors
        })
}

/**
 * 函数说明：按起止标记截取源码片段，供配置页保存范围静态审计使用。
 */
const sliceSourceBetween = (sourceText, startMarker, endMarker) => {
    const startIndex = sourceText.indexOf(startMarker)
    if (startIndex < 0) {
        return ''
    }
    const endIndex = sourceText.indexOf(endMarker, startIndex + startMarker.length)
    return endIndex < 0 ? sourceText.slice(startIndex) : sourceText.slice(startIndex, endIndex)
}

/**
 * 函数说明：守护前端布局页只保存自身负责模块，并确保简洁模式不会校验隐藏高级字段。
 */
const collectFrontendLayoutScopeErrors = () => {
    const relativePath = 'src/views/setting/website/frontend_layout.vue'
    const sourceText = readSourceFile(relativePath)
    if (!sourceText) {
        return [`${relativePath}: 文件不存在或不可读`]
    }

    const syncBlock = sliceSourceBetween(
        sourceText,
        'const syncLayoutFormToJson = (): boolean => {',
        'const moveSection = '
    )
    const exportBlock = sliceSourceBetween(
        sourceText,
        'const buildLayoutExportPayload = () => {',
        'const exportLayoutJson = '
    )
    const snapshotBlock = sliceSourceBetween(
        sourceText,
        'const buildLayoutSnapshot = (): string => {',
        'const updateBaselineLayoutSnapshot = '
    )
    const payloadBlock = sliceSourceBetween(
        sourceText,
        'const buildFrontendLayoutPayload = (): Record<string, string> => {',
        'const handleSubmit = '
    )
    const errors = []

    if (!syncBlock.includes('if (!simpleMode.value)')) {
        errors.push(`${relativePath}: 简洁模式保存必须跳过隐藏高级字段校验`)
    }
    if (!payloadBlock.includes('if (!simpleMode.value)')) {
        errors.push(`${relativePath}: 简洁模式提交必须排除隐藏高级字段`)
    }

    const forbiddenFields = [
        'toolsHeaderLinks',
        'toolsSidebarRecommend',
        'toolsCategoryTree',
        'toolsSeoPages',
        'toolsFooterQuickSections'
    ]
    forbiddenFields.forEach((fieldName) => {
        if (syncBlock.includes(`formData.${fieldName} =`)) {
            errors.push(`${relativePath}: 保存逻辑不应覆盖独立配置字段 ${fieldName}`)
        }
        if (exportBlock.includes(`${fieldName}:`)) {
            errors.push(`${relativePath}: 导出内容不应重复包含独立配置字段 ${fieldName}`)
        }
        if (snapshotBlock.includes(`${fieldName}:`)) {
            errors.push(`${relativePath}: 未保存状态不应受独立配置字段 ${fieldName} 影响`)
        }
    })

    if (!sourceText.includes('applyImportedFrontendLayoutData(source)')) {
        errors.push(`${relativePath}: 导入逻辑必须使用前端布局专用字段白名单`)
    }
    return errors
}

/**
 * 函数说明：守护工具主数据与菜单设置的操作去重和简版保存边界。
 */
const collectCatalogAndSidebarScopeErrors = () => {
    const errors = []
    const catalogPath = 'src/views/setting/website/tools_catalog.vue'
    const catalogSource = readSourceFile(catalogPath)
    if (!catalogSource) {
        errors.push(`${catalogPath}: 文件不存在或不可读`)
    } else {
        const policyActionCount = (
            catalogSource.match(/@click="syncToolPoliciesToLoginConfig"/g) || []
        ).length
        const healthActionCount = (
            catalogSource.match(/@click="runCatalogHealthCheck"/g) || []
        ).length
        if (policyActionCount > 2) {
            errors.push(`${catalogPath}: 同步计费策略入口重复，简版和高级模式各保留一个即可`)
        }
        if (healthActionCount > 1) {
            errors.push(`${catalogPath}: 一键体检入口重复，页头保留一个即可`)
        }
    }

    const sidebarPath = 'src/views/setting/website/sidebar.vue'
    const sidebarSource = readSourceFile(sidebarPath)
    if (!sidebarSource) {
        errors.push(`${sidebarPath}: 文件不存在或不可读`)
        return errors
    }
    const validateBlock = sliceSourceBetween(
        sidebarSource,
        'const validateBeforeSubmit = (showMessage = true): boolean => {',
        'const buildSidebarPayload = '
    )
    const payloadBlock = sliceSourceBetween(
        sidebarSource,
        'const buildSidebarPayload = (): Record<string, string> => {',
        'const handleSubmit = '
    )
    if (!validateBlock.includes('if (!simpleMode.value)')) {
        errors.push(`${sidebarPath}: 简版校验必须跳过隐藏高级菜单配置`)
    }
    if (!payloadBlock.includes('if (!simpleMode.value)')) {
        errors.push(`${sidebarPath}: 简版提交必须排除隐藏高级菜单配置`)
    }
    const simplePayloadBlock = payloadBlock.split('if (!simpleMode.value)')[0]
    const advancedSidebarFields = ['toolsSidebarMenuBlocks', 'toolsAiToolboxSidebarMenus']
    advancedSidebarFields.forEach((fieldName) => {
        if (simplePayloadBlock.includes(fieldName)) {
            errors.push(`${sidebarPath}: 简版提交不应包含 ${fieldName}`)
        }
    })
    return errors
}

const errors = [
    ...ADMIN_P0_ACTION_PAGES.flatMap(collectMissingMarkers),
    ...collectStyleGuardErrors(),
    ...collectRedundantContentErrors(),
    ...collectWebsiteSettingsRedundantContentErrors(),
    ...collectFrontendLayoutScopeErrors(),
    ...collectCatalogAndSidebarScopeErrors()
]

if (errors.length > 0) {
    console.error('后台 P0 页面关键操作入口冒烟未通过：')
    errors.forEach((error) => console.error(`- ${error}`))
    process.exitCode = 1
} else {
    console.log(`后台 P0 页面关键操作入口冒烟通过：${ADMIN_P0_ACTION_PAGES.length} 个页面。`)
}
