import { Tool, ToolsReqData } from '@/types/tools'
import request from '@/utils/request'

export async function getTools(data: ToolsReqData): Promise<Tool[]> {
  const response = await request({
    url: '/api/tools',
    method: 'get',
    params: data
  })
  return response.data
}

export async function getToolInfo(data: ToolsReqData): Promise<Tool | null> {
  const response = await request({
    url: `/api/tools/${data.id}`,
    method: 'get'
  })
  return response.data
}
