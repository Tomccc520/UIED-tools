//统一管理咱们项目用户相关的接口
import request from '@/utils/request'

import type {
  WebInfoReqData,
  getWebInfoResponseData
} from './type'

//项目用户相关的请求地址

enum API {
  //获取网站信息
  WEBINFO = '/webinfo'
}
//获取ip
export function getWebInfo(data: WebInfoReqData) {
  return request({
    url: '/api/webinfo',
    method: 'get',
    params: data
  })
}
