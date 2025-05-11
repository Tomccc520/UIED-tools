export interface ToolsReqData {
  id?: number
  title?: string
  category?: string
  page?: number
  pageSize?: number
}

export interface Tool {
  id: number
  title: string
  logo: string | { type: 'svg', name: string }
  desc: string
  url: string
  cateId?: number
  cate?: string
  isExternal?: boolean
  releaseDate?: string
}

export interface ToolCategory {
  id: number
  title: string
  tools: Tool[]
}

export interface RecommendTool extends Tool {
  cateId: number
  cate: string
}
