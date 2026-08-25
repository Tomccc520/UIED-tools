import request from '@/utils/request'

export function fileCateAdd(params: Record<string, any>) {
    return request.post({ url: '/common/album/cateAdd', params })
}

export function fileCateEdit(params: Record<string, any>) {
    return request.post({ url: '/common/album/cateRename', params })
}

// 文件分类删除
export function fileCateDelete(params: Record<string, any>) {
    return request.post({ url: '/common/album/cateDel', params })
}

// 文件分类列表
export function fileCateLists(params: Record<string, any>) {
    return request.get({ url: '/common/album/cateList', params })
}

// 文件列表
export function fileList(params: Record<string, any>) {
    return request.get({ url: '/common/album/albumList', params })
}

// 文件删除
export function fileDelete(params: Record<string, any>) {
    return request.post({ url: '/common/album/albumDel', params })
}

// 文件移动
export function fileMove(params: Record<string, any>) {
    return request.post({ url: '/common/album/albumMove', params })
}

// 文件重命名
export function fileRename(params: { id: number; name: string }) {
    return request.post({ url: '/common/album/albumRename', params })
}

/**
 * 函数说明：保存素材附件元信息（替代文本/标题/说明/描述），用于素材中心右侧参数面板。
 */
export function fileMetaSave(params: {
    id: number
    title?: string
    altText?: string
    caption?: string
    description?: string
    uri?: string
    bindType?: string
    bindId?: number
    bindTitle?: string
    bindUrl?: string
}) {
    return request.post({ url: '/common/album/albumMetaSave', params })
}

/**
 * 函数说明：获取素材中心图片压缩配置（后台可配置）。
 */
export function fileCompressConfigDetail() {
    return request.get({ url: '/common/album/compressConfig' })
}

/**
 * 函数说明：保存素材中心图片压缩配置（自动压缩开关、阈值、质量等级）。
 */
export function fileCompressConfigSave(params: {
    enabled: 0 | 1
    minSizeKB: number
    jpegQuality: number
    pngCompressionLevel: 'speed' | 'default' | 'best'
}) {
    return request.post({ url: '/common/album/compressConfigSave', params })
}
