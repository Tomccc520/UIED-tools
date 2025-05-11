import request from '@/utils/request'
import type { ToolsReqData, IpReqData, WebInfoReqData, ApiResponse } from './types'

// 获取 sites 类型的分类数据
export const getSitesCategoriesApi = () => {
  return request.get<ApiResponse>('/wp-json/wp/v2/favorites', {
    params: {
      taxonomy: 'favorites',
      post_type: 'sites',
      per_page: 100,
      _fields: 'id,name,slug,description,count,parent'
    }
  })
}

// 获取工具列表
export const getToolsApi = (data: ToolsReqData) => {
  return request.get<ApiResponse>('/api/tools', { params: data })
}

// 获取工具详情
export const getToolInfoApi = (data: ToolsReqData) => {
  return request.get<ApiResponse>(`/api/tools/${data.id}`)
}

// 获取工具分类
export const getToolCateApi = () => {
  return request.get<ApiResponse>('/api/tools/categories')
}

// 获取推荐工具
export const getRecommendsApi = () => {
  return request.get<ApiResponse>('/api/tools/recommends')
}

// 获取IP信息
export const getIpApi = (data: IpReqData) => {
  return request.get<ApiResponse>('/api/ip', { params: data })
}

// 获取网站信息
export const getWebInfoApi = (data: WebInfoReqData) => {
  return request.get<ApiResponse>('/api/webinfo', { params: data })
}

// 获取 AI 写作分类文章列表
export const getAIWritingListApi = () => {
  // 使用 WordPress REST API 获取指定分类的文章
  return request.get<ApiResponse>('https://www.88sheji.cn/wp-json/wp/v2/posts', {
    params: {
      categories: 649,  // AI写作分类的ID
      _fields: 'id,title,link,excerpt,date,modified',  // 只获取需要的字段
      per_page: 50,     // 每页数量
      orderby: 'date',  // 按日期排序
      order: 'desc'     // 降序
    }
  })
}

// 获取文章详情
export const getPostDetailApi = (postId: number) => {
  return request.get<ApiResponse>(`https://www.88sheji.cn/wp-json/wp/v2/posts/${postId}`, {
    params: {
      _fields: 'id,title,content,excerpt,date,modified,link'
    }
  })
}

// 获取 WordPress 文章分类列表
export const getWpCategoriesApi = () => {
  return request.get<ApiResponse>('https://www.88sheji.cn/wp-json/wp/v2/categories', {
    params: {
      per_page: 100,  // 每页数量
      _fields: 'id,name,slug,description,count,parent', // 只获取需要的字段
      orderby: 'id',  // 按 ID 排序
      order: 'asc'    // 升序
    }
  })
}
