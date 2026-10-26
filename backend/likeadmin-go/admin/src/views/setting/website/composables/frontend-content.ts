/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */

export const frontendContentKeys = [
    'toolsHomepageLearningEnabled', 'toolsHomepageLearningTitle', 'toolsHomepageLearningRssUrl',
    'toolsHomepageLearningFilterType', 'toolsHomepageLearningCategorySlug',
    'toolsHomepageLearningCategoryIds', 'toolsHomepageLearningLimit',
    'toolsChangelogIntroText', 'toolsChangelogStatsText', 'toolsChangelogTimeline',
    'toolsChangelogHeaderLinks', 'toolsChangelogMetaLinks', 'toolsChangelogSplitTitle',
    'toolsChangelogSplitDesc', 'toolsChangelogSplitLink', 'toolsChangelogSplitLinkText'
] as const
export type FrontendContentKey = typeof frontendContentKeys[number]
export type FrontendContentForm = Record<FrontendContentKey, string>
const jsonFields = new Set<string>(['toolsChangelogTimeline', 'toolsChangelogHeaderLinks', 'toolsChangelogMetaLinks'])

/** 创建本页可编辑字段；默认内容仅用于展示，未修改字段不提交到服务器。 */
export const createFrontendContent = (): FrontendContentForm => ({
    toolsHomepageLearningEnabled: '1', toolsHomepageLearningTitle: '每日学习',
    toolsHomepageLearningRssUrl: 'https://www.uied.cn/api/open/v1/rss.xml',
    toolsHomepageLearningFilterType: 'all', toolsHomepageLearningCategorySlug: '',
    toolsHomepageLearningCategoryIds: '', toolsHomepageLearningLimit: '20',
    toolsChangelogIntroText: '', toolsChangelogStatsText: '', toolsChangelogTimeline: '',
    toolsChangelogHeaderLinks: '', toolsChangelogMetaLinks: '', toolsChangelogSplitTitle: '',
    toolsChangelogSplitDesc: '', toolsChangelogSplitLink: '', toolsChangelogSplitLinkText: ''
})

/** 校验响应后只读取本页字段，兼容已解析的 JSON 数组，不接管其他页面配置。 */
export const readFrontendContent = (source: unknown): FrontendContentForm => {
    if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('配置响应无效')
    const form = createFrontendContent()
    for (const key of frontendContentKeys) {
        if (!Object.prototype.hasOwnProperty.call(source, key)) continue
        const value = (source as Record<string, unknown>)[key]
        if (value && typeof value === 'object' && !Array.isArray(value)) throw new Error('配置字段格式无效：' + key)
        form[key] = Array.isArray(value) && jsonFields.has(key) ? JSON.stringify(value) : String(value ?? '')
    }
    return form
}

/** 生成与服务器基线不同的字段补丁，保存栏目时不顺带发布未修改的更新记录。 */
export const buildFrontendContentPatch = (form: FrontendContentForm, baseline: FrontendContentForm): Partial<FrontendContentForm> => {
    const patch: Partial<FrontendContentForm> = {}
    for (const key of frontendContentKeys) if (form[key] !== baseline[key]) patch[key] = form[key]
    return patch
}

/** 解析原始对象数组，拒绝无效数据而不静默丢弃条目或未识别扩展字段。 */
export const readContentArray = (value: string): Record<string, any>[] => {
    const parsed = JSON.parse(value.trim() || '[]')
    if (!Array.isArray(parsed) || parsed.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
        throw new Error('内容必须是对象数组，请检查导入内容')
    }
    return parsed
}

/** 只修改一个条目的一个字段，保留其他版本、链接与扩展数据。 */
export const updateContentItem = (value: string, index: number, field: string, next: unknown): string => {
    const items = readContentArray(value)
    if (!Number.isInteger(index) || index < 0 || index >= items.length) throw new Error('内容位置已改变，请重新选择')
    items[index] = { ...items[index], [field]: next }
    return JSON.stringify(items, null, 2)
}

/** 校验更新记录必填项及重复版本；不规范化、不合并或删改用户输入。 */
export const validateContentTimeline = (value: string): string => {
    let items: Record<string, any>[]
    try { items = readContentArray(value) } catch { return '更新记录格式错误，请检查导入的 JSON' }
    const versions = new Set<string>()
    for (let index = 0; index < items.length; index++) {
        const item = items[index]
        const version = String(item.version || '').trim()
        if (!version || !String(item.date || '').trim() || !String(item.title || '').trim()) return '第 ' + (index + 1) + ' 个版本需要填写版本号、日期和标题'
        if (versions.has(version.toLowerCase())) return '版本号重复：' + version
        versions.add(version.toLowerCase())
        if (!Array.isArray(item.features) || !item.features.length) return '版本 ' + version + ' 至少需要一组更新内容'
        if (item.features.some((feature: any) => !feature || !String(feature.title || '').trim() || !Array.isArray(feature.points) || !feature.points.length || feature.points.some((point: any) => typeof point !== 'string' || !point.trim()))) {
            return '版本 ' + version + ' 的每组更新需要填写标题和至少一条内容'
        }
    }
    return ''
}

/** 允许站内地址和 HTTP(S) 外链，拒绝脚本协议及带账号密码的链接。 */
export const isContentLink = (value: string): boolean => {
    const text = value.trim()
    if (!text) return true
    if (/^\/(?!\/)/.test(text) || text.startsWith('#')) return true
    try {
        const url = new URL(text)
        return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password
    } catch { return false }
}

/** 仅校验本次修改的模块，避免无关历史字段阻止另一个模块保存。 */
export const validateFrontendContent = (form: FrontendContentForm, patch: Partial<FrontendContentForm>): string => {
    const changed = Object.keys(patch)
    if (changed.some(key => key.startsWith('toolsHomepageLearning')) && !['0', '1'].includes(form.toolsHomepageLearningEnabled)) return '栏目启用状态只能是开启或关闭'
    if (changed.some(key => key.startsWith('toolsHomepageLearning')) && form.toolsHomepageLearningEnabled === '1') {
        if (!form.toolsHomepageLearningTitle.trim()) return '请填写文章栏目标题'
        if (form.toolsHomepageLearningTitle.length > 20) return '文章栏目标题不能超过 20 个字符'
        try {
            const url = new URL(form.toolsHomepageLearningRssUrl)
            if (url.protocol !== 'https:' || !['uied.cn', 'www.uied.cn'].includes(url.hostname) || url.username || url.password) return 'RSS 地址仅支持 uied.cn 或 www.uied.cn 的 HTTPS 文章源'
        } catch { return '请填写有效的 RSS 地址' }
        if (!Number.isInteger(Number(form.toolsHomepageLearningLimit)) || Number(form.toolsHomepageLearningLimit) < 1 || Number(form.toolsHomepageLearningLimit) > 50) return '展示条数应为 1–50 的整数'
        if (!['all', 'category_slug', 'categories'].includes(form.toolsHomepageLearningFilterType)) return '请选择有效的筛选方式'
        if (form.toolsHomepageLearningFilterType === 'category_slug' && !form.toolsHomepageLearningCategorySlug.trim()) return '请填写分类别名'
        if (form.toolsHomepageLearningFilterType === 'categories' && !/^[1-9]\d*(\s*,\s*[1-9]\d*)*$/.test(form.toolsHomepageLearningCategoryIds.trim())) return '分类 ID 请填写正整数，多个用英文逗号分隔'
    }
    if ('toolsChangelogTimeline' in patch) {
        const error = validateContentTimeline(form.toolsChangelogTimeline)
        if (error) return error
    }
    for (const key of ['toolsChangelogHeaderLinks', 'toolsChangelogMetaLinks'] as const) {
        if (!(key in patch)) continue
        try {
            if (readContentArray(form[key]).some(item => !String(item.name || '').trim() || !isContentLink(String(item.link || '')) || !String(item.link || '').trim())) return '请为每条链接填写名称和有效地址'
        } catch { return '链接格式错误，请检查导入内容' }
    }
    if ('toolsChangelogSplitLink' in patch && !isContentLink(form.toolsChangelogSplitLink)) return '开源说明链接应为站内地址或 HTTP(S) 地址'
    return ''
}
