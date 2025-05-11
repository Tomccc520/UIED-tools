import { ResponseData } from "../common"

export interface WebInfoReqData {
  url: string
}

export interface WebInfo {
  title: string
  description: string
  keywords: string[]
  favicon: string
  screenshot: string
  lastModified: string
  contentType: string
  contentLength: number
  statusCode: number
  headers: Record<string, string>
}

//响应格式
export interface getWebInfoResponseData extends ResponseData {
  data: WebInfo
}
