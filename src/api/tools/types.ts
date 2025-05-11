// API 请求参数类型定义
export interface ToolsReqData {
  id?: number
  type?: string
  page?: number
  pageSize?: number
}

export interface IpReqData {
  ip?: string
}

export interface WebInfoReqData {
  url: string
}

// API 响应类型定义
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface Tool {
  id: number
  title: string
  desc: string
  url: string
  logo?: string
  type?: string
  cateId?: number
}
