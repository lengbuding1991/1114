import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// 创建axios实例，配置FastAPI连接
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器 - 为FastAPI添加JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      // FastAPI通常使用Bearer token认证
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理FastAPI返回的错误
apiClient.interceptors.response.use(
  (response) => {
    // FastAPI通常直接返回数据对象
    return response.data
  },
  (error) => {
    // FastAPI错误处理
    if (error.response?.status === 401) {
      // JWT token过期或无效
      localStorage.removeItem('authToken')
      localStorage.removeItem('userInfo')
      window.location.reload()
    } else if (error.response?.status === 422) {
      // FastAPI数据验证错误
      console.error('数据验证错误:', error.response.data)
    }
    
    // 网络错误处理
    if (!error.response) {
      console.error('无法连接到FastAPI后端:', error.message)
      throw new Error('无法连接到后端服务，请检查FastAPI是否启动')
    }
    
    return Promise.reject(error)
  }
)

// FastAPI认证接口
export const authAPI = {
  // 用户登录 - 对应FastAPI的 /api/auth/login
  login: (credentials) => apiClient.post('/auth/login', credentials),
  
  // 用户注册 - 对应FastAPI的 /api/auth/register
  register: (userData) => apiClient.post('/auth/register', userData),
  
  // 获取用户信息 - 对应FastAPI的 /api/auth/me
  getCurrentUser: () => apiClient.get('/auth/me'),
  
  // 刷新token - 对应FastAPI的 /api/auth/refresh
  refreshToken: () => apiClient.post('/auth/refresh'),
  
  // 用户登出 - 对应FastAPI的 /api/auth/logout
  logout: () => apiClient.post('/auth/logout')
}

// FastAPI聊天接口
export const chatAPI = {
  // 获取聊天列表 - 对应FastAPI的 /api/chats/
  getChats: () => apiClient.get('/chats/'),
  
  // 创建新聊天 - 对应FastAPI的 /api/chats/
  createChat: (title) => apiClient.post(`/chats/?title=${encodeURIComponent(title)}`),
  
  // 删除聊天 - 对应FastAPI的 /api/chats/{chat_id}
  deleteChat: (chatId) => apiClient.delete(`/chats/${chatId}`),
  
  // 获取聊天消息 - 对应FastAPI的 /api/chats/{chat_id}/messages
  getMessages: (chatId) => apiClient.get(`/chats/${chatId}/messages`),
  
  // 发送消息 - 对应FastAPI的 /api/chats/{chat_id}/messages
  sendMessage: (chatId, content) => apiClient.post(`/chats/${chatId}/messages`, { content }),
  
  // 流式消息（如果FastAPI支持）
  streamMessage: (chatId, content) => apiClient.post(`/chats/${chatId}/stream`, { content })
}

export default apiClient