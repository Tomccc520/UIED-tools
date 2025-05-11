import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 已经在vite.config.ts中配置了代理
  timeout: 10000,  // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 统一处理响应数据
    return response.data
  },
  error => {
    // 统一处理错误
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 接口封装
export const apiTest = {
  // 测试GET请求
  async getTest(params?: any) {
    return request({
      url: '/test',
      method: 'get',
      params
    })
  },

  // 测试POST请求
  async postTest(data: any) {
    return request({
      url: '/test',
      method: 'post',
      data
    })
  },

  // 测试PUT请求
  async putTest(id: string | number, data: any) {
    return request({
      url: `/test/${id}`,
      method: 'put',
      data
    })
  },

  // 测试DELETE请求
  async deleteTest(id: string | number) {
    return request({
      url: `/test/${id}`,
      method: 'delete'
    })
  }
}

export default apiTest
