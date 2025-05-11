//统一管理咱们项目用户相关的接口
import request from '@/utils/request'

import type {
  IpReqData,
  getIpResponseData
} from './type'

//项目用户相关的请求地址

enum API {
  //获取ip
  GET_IP = '/api/ip'
}
//获取ip
export function getIp(data: IpReqData) {
  return request({
    url: API.GET_IP,
    method: 'get',
    params: data
  })
}
