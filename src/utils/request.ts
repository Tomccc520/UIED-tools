import axios from "axios";

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        console.log('Request URL:', config.url)
        console.log('Request Method:', config.method)
        console.log('Request Headers:', config.headers)
        console.log('Request Data:', config.data)
        return config
    },
    error => {
        // 对请求错误做些什么
        console.error('Request error:', error)
        console.error('Request Config:', error.config)
        return Promise.reject(error)
    }
);

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        console.log('Response Data:', response.data)
        return response.data
    },
    error => {
        // 对响应错误做点什么
        console.error('Response error:', error)
        if (error.response) {
            console.error('Response Status:', error.response.status)
            console.error('Response Data:', error.response.data)
        }
        return Promise.reject(error)
    }
);

export default request;
