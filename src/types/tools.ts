export interface ToolsReqData {
  id?: number
  title?: string
  cateId?: number
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
  tags?: string[]
  icon?: string
  isNew?: boolean
  gradient?: string
  badge?: string
  text?: string
  children?: Tool[]
}

export interface ToolSubCategory {
  id: number
  title: string
  list: Tool[]
}

export interface ToolCategory {
  id: number
  title: string
  icon?: string
  list: ToolSubCategory[]
}

export interface RecommendTool extends Tool {
  cateId: number
  cate: string
}

export interface ToolsFilterParams {
  cateId: number
  title: string
}
