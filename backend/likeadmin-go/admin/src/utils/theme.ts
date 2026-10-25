import colors from 'css-color-function'
const lightConfig = {
    'dark-2': 'shade(20%)',
    'light-3': 'tint(30%)',
    'light-5': 'tint(50%)',
    'light-7': 'tint(70%)',
    'light-8': 'tint(80%)',
    'light-9': 'tint(90%)'
}

const darkConfig = {
    'light-3': 'shade(20%)',
    'light-5': 'shade(30%)',
    'light-7': 'shade(50%)',
    'light-8': 'shade(60%)',
    'light-9': 'shade(70%)',
    'dark-2': 'tint(20%)'
}

const arcoColorScaleConfig: Record<string, string> = {
    '1': 'tint(95%)',
    '2': 'tint(90%)',
    '3': 'tint(80%)',
    '4': 'tint(60%)',
    '5': 'tint(30%)',
    '7': 'shade(20%)',
    '8': 'shade(35%)',
    '9': 'shade(50%)',
    '10': 'shade(65%)'
}

const themeId = 'theme-vars'

/**
 * @author Jason
 * @description 生成主题变量（兼容历史变量并同步 Arco 色阶变量）
 * 可选值有primary、success、warning、danger、error、info
 */

export const generateVars = (color: string, type = 'primary', isDark = false) => {
    const colos: Record<string, string> = {
        [`--ui-color-${type}`]: color,
        [`--color-${type}-6`]: color
    }
    const config: Record<string, string> = isDark ? darkConfig : lightConfig

    // 输出 ui + Arco 需要的色阶变量，确保主题切换生效
    for (const key in config) {
        const toneColor = `color(${color} ${config[key]})`
        colos[`--ui-color-${type}-${key}`] = toneColor
    }

    // 保留项目历史色阶变量，实际 Arco RGB 通道在写入样式时同步生成。
    for (const level in arcoColorScaleConfig) {
        colos[`--color-${type}-${level}`] = `color(${color} ${arcoColorScaleConfig[level]})`
    }

    return colos
}

/**
 * @author Jason
 * @description 用于设置css变量
 * @param key css变量key 如 --color-primary
 * @param value css变量值 如 #f40
 * @param dom dom元素
 */
export const setCssVar = (key: string, value: string, dom = document.documentElement) => {
    dom.style.setProperty(key, value)
}

/**
 * @author Jason
 * @description 设置主题
 */
export const setTheme = (options: Record<string, string>, isDark = false) => {
    const varsMap: Record<string, string> = Object.keys(options).reduce((prev, key) => {
        return Object.assign(prev, generateVars(options[key], key, isDark))
    }, {})

    let theme = Object.keys(varsMap).reduce((prev, key) => {
        const color = colors.convert(varsMap[key])
        const arcoKey = key.match(/^--color-([a-z]+)-(\d+)$/)
        let arcoDeclaration = ''
        if (arcoKey) {
            // Arco 使用 rgb(var(--primary-6)) 等通道变量，不能直接写十六进制颜色。
            const rgbColor = colors.convert(`color(${color})`)
            const channels = rgbColor.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)
            if (channels) {
                const rgb = channels.slice(1).join(',')
                arcoDeclaration = `--${arcoKey[1]}-${arcoKey[2]}:${rgb};`
                if (arcoKey[1] === 'primary') arcoDeclaration += `--link-${arcoKey[2]}:${rgb};`
            }
        }
        return `${prev}${key}:${color};${arcoDeclaration}`
    }, '')
    // 组件库把默认通道定义在 body 上，仅修改 :root 无法覆盖其局部定义。
    theme = `:root,body,body[arco-theme='dark']{${theme}}`
    let style = document.getElementById(themeId)
    if (style) {
        style.innerHTML = theme
        return
    }
    style = document.createElement('style')
    style.setAttribute('type', 'text/css')
    style.setAttribute('id', themeId)
    style.innerHTML = theme
    document.head.append(style)
}
