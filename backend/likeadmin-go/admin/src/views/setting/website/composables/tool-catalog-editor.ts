/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-18
 */
export interface CatalogEditorRow {
    key: string
    category: string
    group: string
    tool: Record<string, any>
}

/** 解析工具预览链接，只允许站内路径或 HTTP(S) 地址，保留业务查询参数并拒绝脚本协议。 */
export const resolveCatalogPreviewHref = (value: unknown, baseUrl: string): string => {
    const input = String(value || '').trim()
    if (!input || (!input.startsWith('/') && !/^https?:\/\//i.test(input))) return ''
    try {
        const parsed = new URL(input, baseUrl || undefined)
        if (baseUrl) {
            const base = new URL(baseUrl)
            if (parsed.origin === base.origin && base.searchParams.get('_uied_preview') === '1') parsed.searchParams.set('_uied_preview', '1')
        }
        return /^https?:$/.test(parsed.protocol) ? parsed.href : ''
    } catch { return '' }
}

/** 读取原始分类树并验证层级；保留未识别字段，不在可视编辑时过滤或重建业务数据。 */
export const readCatalogEditorTree = (source: string): Record<string, any>[] => {
    const tree = JSON.parse(source || '[]')
    if (!Array.isArray(tree)) throw new Error('工具分类必须是数组，请在高级编辑中检查格式')
    for (const category of tree) {
        if (!category || typeof category !== 'object' || !Array.isArray(category.list)) {
            throw new Error('工具分类结构不完整，请在高级编辑中检查分类分组')
        }
        for (const group of category.list) {
            if (!group || typeof group !== 'object' || !Array.isArray(group.list)
                || group.list.some((tool: unknown) => !tool || typeof tool !== 'object' || Array.isArray(tool))) {
                throw new Error('工具分组结构不完整，请在高级编辑中检查工具列表')
            }
        }
    }
    return tree
}

/** 将分类树展开为带稳定位置的列表，返回分类、分组与原始工具字段供搜索和编辑。 */
export const flattenCatalogEditorTree = (source: string): CatalogEditorRow[] => {
    const rows: CatalogEditorRow[] = []
    readCatalogEditorTree(source).forEach((category, c) => {
        category.list.forEach((group: Record<string, any>, g: number) => {
            group.list.forEach((tool: Record<string, any>, t: number) => {
                rows.push({ key: `${c}:${g}:${t}`, category: String(category.title || '未命名分类'), group: String(group.title || '未命名分组'), tool })
            })
        })
    })
    return rows
}

const editableFields = new Set(['title', 'desc', 'tags', 'seoTitle', 'seoKeywords', 'seoDescription', 'seoImage', 'geoSummary', 'geoQuestions', 'status', 'consumePoints', 'memberFree'])

/** 只合并指定工具的可编辑字段；校验编辑基线防止异步同步或其他编辑覆盖，其他工具与扩展字段原样保留。 */
export const updateCatalogEditorTool = (source: string, key: string, baseline: string, patch: Record<string, unknown>): string => {
    const tree = readCatalogEditorTree(source)
    if (!/^\d+:\d+:\d+$/.test(key)) throw new Error('工具位置无效，请重新选择')
    const [c, g, t] = key.split(':').map(Number)
    const tool = tree[c]?.list[g]?.list[t]
    if (!tool || JSON.stringify(tool) !== baseline) throw new Error('该工具已发生变化，请关闭编辑后重新打开，避免覆盖新内容')
    for (const [field, value] of Object.entries(patch)) {
        if (!editableFields.has(field)) throw new Error('存在不支持直接编辑的字段，请重新打开编辑器')
        if (value === undefined) delete tool[field]
        else tool[field] = value
    }
    if (!String(tool.title || '').trim()) throw new Error('请填写工具名称')
    return JSON.stringify(tree, null, 2)
}
