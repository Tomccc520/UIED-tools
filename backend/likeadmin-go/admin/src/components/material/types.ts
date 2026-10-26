/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
export interface MaterialItem {
    id: number
    name: string
    fileName?: string
    path?: string
    uri: string
    size?: string
    sizeBytes?: number
    mimeType?: string
    width?: number
    height?: number
    resolution?: string
    createTime?: string
    uploaderName?: string
    cateName?: string
    uploadToName?: string
    title?: string
    altText?: string
    caption?: string
    description?: string
    bindType?: string
    bindId?: number
    bindTitle?: string
    bindUrl?: string
}

export interface MaterialMetaForm {
    title: string
    altText: string
    caption: string
    description: string
    uri: string
    bindType: string
    bindId: number | undefined
    bindTitle: string
    bindUrl: string
}

export interface MaterialCompressConfig {
    enabled: boolean
    minSizeKB: number
    jpegQuality: number
    pngCompressionLevel: 'speed' | 'default' | 'best'
}
