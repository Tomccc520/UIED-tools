/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
export interface ConfigLink extends Record<string, unknown> {
    name: string
    link: string
}

export interface ConfigLinkGroup extends Record<string, unknown> {
    title: string
    items: ConfigLink[]
}

/** 将严格数字 token 化为十进制系数与指数，仅用于比较数值，避免比较本身经过浮点运算。 */
const exactDecimalValue = (token: string): string => {
    const [mantissa, exponent = '0'] = token.toLowerCase().split('e')
    const negative = mantissa.startsWith('-')
    const [integer, fraction = ''] = (negative ? mantissa.slice(1) : mantissa).split('.')
    const digits = (integer + fraction).replace(/^0+/, '')
    if (!digits) return '0'
    const coefficient = digits.replace(/0+$/, '')
    const scale = BigInt(exponent) - BigInt(fraction.length) + BigInt(digits.length - coefficient.length)
    return `${negative ? '-' : ''}${coefficient}e${scale}`
}

/** 可视编辑需要解析再序列化，先拒绝会被浮点改值的数字；字符串内数字及等值指数写法不受影响。 */
const assertEditableJsonNumbers = (value: string, label: string): void => {
    const tokens = value.matchAll(/"(?:[^"\\]|\\[\s\S])*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/g)
    for (const match of tokens) {
        const token = match[0]
        if (token.startsWith('"')) continue
        const number = Number(token)
        if (!Number.isFinite(number) || exactDecimalValue(token) !== exactDecimalValue(JSON.stringify(number))) {
            throw new Error(`${label}包含可视编辑无法无损保存的数字，原始内容已保留；请先确认数值字段后再修复。`)
        }
    }
}

/** 读取对象数组并保留全部字段；无效输入明确失败，不能静默替换成空数组。 */
export const readConfigObjectArray = (value: unknown, label = '配置'): Record<string, unknown>[] => {
    let parsed: unknown
    if (typeof value === 'string') assertEditableJsonNumbers(value, label)
    try {
        parsed = typeof value === 'string' ? JSON.parse(value.trim() || '[]') : value === undefined ? [] : value
    } catch {
        throw new Error(`${label}不是有效的 JSON 数组，原始内容已保留。`)
    }
    if (!Array.isArray(parsed) || parsed.some(item => !item || typeof item !== 'object' || Array.isArray(item))) {
        throw new Error(`${label}必须是对象数组，原始内容已保留。`)
    }
    return parsed.map(item => ({ ...item }))
}

/** 读取链接列表，允许未填完的本地草稿；名称、地址类型错误必须由用户修正。 */
export const readConfigLinks = (value: unknown, label = '链接列表'): ConfigLink[] =>
    readConfigObjectArray(value, label).map((item, index) => {
        if ((item.name !== undefined && typeof item.name !== 'string') || (item.link !== undefined && typeof item.link !== 'string')) {
            throw new Error(`${label}第 ${index + 1} 条的名称和地址应为文字。`)
        }
        return { ...item, name: item.name ?? '', link: item.link ?? '' } as ConfigLink
    })

/** 读取分组及链接，保留组和链接的扩展字段，不把无效子数组降级成空组。 */
export const readConfigLinkGroups = (value: unknown, label = '链接分组'): ConfigLinkGroup[] =>
    readConfigObjectArray(value, label).map((group, index) => {
        if (group.title !== undefined && typeof group.title !== 'string') throw new Error(`${label}第 ${index + 1} 组的标题应为文字。`)
        return {
            ...group,
            title: group.title ?? '',
            items: readConfigLinks(group.items, `${label}第 ${index + 1} 组`)
        } as ConfigLinkGroup
    })

/** 从本页已组装的字段快照生成增量补丁；合法空字符串和空数组不能被过滤。 */
export const buildConfigFieldPatch = <T extends Record<string, string>>(payload: T, baseline: Record<string, string>): Partial<T> => {
    const patch: Partial<T> = {}
    for (const key of Object.keys(payload) as (keyof T)[]) {
        if (payload[key] !== baseline[String(key)]) patch[key] = payload[key]
    }
    return patch
}

/** 校验当前分组位置，拒绝越界写入而不误改其他分组。 */
const requireGroup = (groups: ConfigLinkGroup[], index: number): ConfigLinkGroup => {
    if (!Number.isInteger(index) || index < 0 || index >= groups.length) throw new Error('分组位置已变化，请重新选择。')
    return groups[index]
}

/** 更新一个分组的可编辑字段，其他分组和未知扩展内容保持原值。 */
export const updateConfigLinkGroup = (value: string, index: number, patch: { title?: string; items?: ConfigLink[] }): string => {
    const groups = readConfigLinkGroups(value)
    const group = requireGroup(groups, index)
    groups[index] = { ...group, ...patch }
    return JSON.stringify(readConfigLinkGroups(groups), null, 2)
}

/** 新增空分组作为本地草稿，由父页统一校验和保存。 */
export const addConfigLinkGroup = (value: string): string =>
    JSON.stringify([...readConfigLinkGroups(value), { title: '', items: [] }], null, 2)

/** 删除当前草稿中的指定分组，调用方可保留原始字符串供撤销。 */
export const removeConfigLinkGroup = (value: string, index: number): string => {
    const groups = readConfigLinkGroups(value)
    requireGroup(groups, index)
    return JSON.stringify(groups.filter((_, position) => position !== index), null, 2)
}

/** 调整一个分组的顺序，边界操作不改内容，不重新生成条目字段。 */
export const moveConfigLinkGroup = (value: string, index: number, step: -1 | 1): string => {
    const groups = readConfigLinkGroups(value)
    requireGroup(groups, index)
    const target = index + step
    if (target < 0 || target >= groups.length) return value
    ;[groups[index], groups[target]] = [groups[target], groups[index]]
    return JSON.stringify(groups, null, 2)
}
