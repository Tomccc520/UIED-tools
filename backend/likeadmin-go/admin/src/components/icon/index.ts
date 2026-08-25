import * as ArcoIcons from '@arco-design/web-vue/es/icon'
//@ts-ignore
import localIconsName from 'virtual:svg-icons-names'

export const LOCAL_ICON_PREFIX = 'local-icon-'
export const SYSTEM_ICON_PREFIX = 'system-icon-'
// 函数说明：兼容历史数据库中遗留的前缀，读取时容错，写入统一走 system-icon-
export const LEGACY_ICON_PREFIX = 'el-icon-'

// 函数说明：历史菜单图标名到 Arco 图标名的别名映射，保障升级后图标可见。
export const LEGACY_SYSTEM_ICON_ALIASES: Record<string, string> = {
    Setting: 'Settings',
    CloseBold: 'Close',
    CopyDocument: 'Copy',
    RefreshRight: 'Refresh',
    View: 'Eye',
    Picture: 'Image',
    Monitor: 'Desktop',
    Female: 'Woman',
    Operation: 'Tool',
    OfficeBuilding: 'Storage',
    Coordinate: 'Location',
    PriceTag: 'Tag',
    Basketball: 'Apps',
    Box: 'Archive',
    SetUp: 'Settings',
    FolderOpened: 'Folder',
    House: 'Home',
    EditPen: 'Pen',
    DocumentAdd: 'File',
    PictureRounded: 'Image',
    Grid: 'Apps',
    ChatLineSquare: 'Message',
    ChatDotSquare: 'Message',
    CollectionTag: 'Tags',
    Cellphone: 'Mobile',
    DataBoard: 'Dashboard',
    Position: 'Location'
}

const legacySystemIconAliasesLowerCase: Record<string, string> = Object.fromEntries(
    Object.entries(LEGACY_SYSTEM_ICON_ALIASES).map(([key, value]) => [key.toLowerCase(), value])
)

const arcoIconNames = Object.keys(ArcoIcons)
    .filter((name) => /^Icon[A-Z]/.test(name))
    .map((name) => name.replace(/^Icon/, ''))

const legacyAliasNames = Object.keys(LEGACY_SYSTEM_ICON_ALIASES)

const systemIconsName = Array.from(new Set([...arcoIconNames, ...legacyAliasNames]))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `${SYSTEM_ICON_PREFIX}${name}`)

/**
 * 函数说明：标准化系统图标名称，兼容大小写、历史前缀和旧字段写法。
 */
export function normalizeSystemIconName(iconName: string) {
    let normalizedName = (iconName || '').trim()
    if (!normalizedName) {
        return ''
    }
    if (normalizedName.startsWith(SYSTEM_ICON_PREFIX)) {
        normalizedName = normalizedName.replace(SYSTEM_ICON_PREFIX, '')
    } else if (normalizedName.startsWith(LEGACY_ICON_PREFIX)) {
        normalizedName = normalizedName.replace(LEGACY_ICON_PREFIX, '')
    }
    // 函数说明：兼容 arco iconbox 习惯写法（icon-xxx / arco-icon-xxx）。
    normalizedName = normalizedName.replace(/^arco-icon-/i, '')
    normalizedName = normalizedName.replace(/^icon-/i, '')
    normalizedName = normalizedName.replace(/^Icon/, '')
    const aliasMatchedName =
        LEGACY_SYSTEM_ICON_ALIASES[normalizedName] ||
        legacySystemIconAliasesLowerCase[normalizedName.toLowerCase()]
    return aliasMatchedName || normalizedName
}

/**
 * 函数说明：将图标名规范化为 Arco 组件导出键（例如 Settings -> IconSettings）。
 */
export function getArcoIconExportKey(iconName: string) {
    const normalizedName = normalizeSystemIconName(iconName)
    const pascalName = normalizedName
        .split(/[-_\s]+/g)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join('')
    return `Icon${pascalName}`
}

/**
 * 函数说明：标准化后台菜单图标字段，未带前缀时自动补全 system-icon- 前缀。
 */
export function normalizeMenuIconName(iconName: string) {
    const normalizedName = (iconName || '').trim()
    if (!normalizedName) {
        return ''
    }
    if (normalizedName.startsWith(LOCAL_ICON_PREFIX)) {
        return normalizedName
    }
    // 函数说明：统一将历史 icon-xxx / el-icon-xxx / system-icon-xxx 归一化为 system-icon-<ArcoName>。
    const standardizedName = normalizeSystemIconName(normalizedName)
    return standardizedName ? `${SYSTEM_ICON_PREFIX}${standardizedName}` : ''
}

/**
 * 函数说明：返回系统图标列表（Arco 全量 + 历史别名）。
 */
export function getSystemIconNames() {
    return systemIconsName
}

/**
 * 函数说明：返回本地图标列表（svg sprite）。
 */
export function getLocalIconNames() {
    return localIconsName
}
