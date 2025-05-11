import { ResponseData } from "../common"

export interface IpReqData {
  ip?: string
}

export interface IpInfo {
  ip: string
  country: string
  region: string
  city: string
  isp: string
  location: {
    lat: number
    lng: number
  }
}

//响应格式
export interface getIpResponseData extends ResponseData {
  data: IpInfo
}
