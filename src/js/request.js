import axios from 'axios'
import { ElMessage } from 'element-plus'


// 创建 axios 实例
const service = axios.create({
  // 从环境变量获取 baseURL
  // 开发环境 (npm run dev): 读取 .env.development => /api
  // 生产环境 (npm run build): 读取 .env.production => /api (或者空字符串，取决于 Nginx 配置)
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})


// request 拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  },
)


// response 拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (
      res.success === true ||
      res.code === 0 ||
      res.code === 1 ||
      res.code === 200 ||
      (res.success === false && res.msg) ||
      (res.success === undefined && res.code === undefined)
    ) {
      // 即使 success 为 false，只要有 msg，也返回给业务层去处理（显示 warning），而不是抛出 Error
      return response
    } else {
      ElMessage.error(res.msg || '系统错误')
      return Promise.reject(new Error(res.msg || 'Error'))
    }
  },
  (error) => {
    console.log('err' + error)
    let { message } = error


    // 如果是 Network Error，不显示错误提示
    if (message === 'Network Error') {
      return Promise.reject(error)
    }


    // 如果是 401 未授权，直接退出登录
    if (error.response && error.response.status === 401) {
      // 清除 token
      localStorage.removeItem('token')
      // 跳转到登录页面
      window.location.href = '/login'
      return Promise.reject(error)
    }


    if (message.includes('timeout')) {
      message = '系统接口请求超时'
    }
    // else if (message.includes('Request failed with status code')) {
    //   message = '系统接口' + message.substr(message.length - 3) + '异常'
    // }
    // ElMessage({
    //   message: message,
    //   type: 'error',
    //   duration: 5 * 1000,
    // })
    return Promise.reject(error)
  },
)


export default service
