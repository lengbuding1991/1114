<template>
  <div class="font-inter h-screen flex flex-col overflow-hidden" :class="{
    'dark': isDarkMode,
    'bg-light text-dark': !isDarkMode,
    'bg-dark-bg text-light': isDarkMode
  }">
    <!-- 提示组件 -->
    <Toast ref="toastRef" />

    <!-- 登录弹窗 -->
    <LoginModal :show-login-modal="showLoginModal" @close-modal="showLoginModal = false"
      @login-success="handleLoginSuccess" @show-success="toast.success" @show-error="toast.error" />

    <!-- 主布局 -->
    <div class="flex h-full overflow-hidden">
      <!-- 侧边栏组件 -->
      <Sidebar :is-sidebar-collapsed="isSidebarCollapsed" :is-logged-in="isLoggedIn" :user-info="userInfo"
        :show-user-dropdown="showUserDropdown" :is-dark-mode="isDarkMode" :recent-chats="recentChats"
        :selected-chat-id="selectedChatId" @toggle-sidebar="toggleSidebar" @new-chat="newChat" @select-chat="selectChat"
        @delete-chat="deleteChat" @open-login-modal="showLoginModal = true" @toggle-user-dropdown="toggleUserDropdown"
        @show-settings="showSettings" @show-help="showHelp" @toggle-theme="toggleTheme" @logout="handleLogout" />

      <!-- 主聊天区域组件 -->
      <ChatArea :current-chat-id="selectedChatId" :messages="currentMessages" :is-loading="isLoading"
        :input-message="inputMessage" :user-info="userInfo" :is-dark-mode="isDarkMode" @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme" @show-settings="showSettings" @show-help="showHelp" @quick-start="handleQuickStart"
        @send-message="sendMessage" @copy-message="copyMessage" @regenerate-message="regenerateMessage"
        @clear-input="inputMessage = ''" @upload-file="uploadFile"
        @update:input-message="(value) => inputMessage = value" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { authAPI, chatAPI } from '@/services/api'
import Toast from './components/Toast.vue'
import Sidebar from './components/Sidebar.vue'
import ChatArea from './components/ChatArea.vue'
import LoginModal from './components/LoginModal.vue'
import { useToast } from './composables/useToast'

export default {
  name: 'App',
  components: {
    Toast,
    Sidebar,
    ChatArea,
    LoginModal
  },
  setup() {
    const toastRef = ref(null)
    const toast = useToast()

    // 立即设置Toast引用
    const setToastRef = () => {
      if (toastRef.value) {
        toast.setRef(toastRef.value)
      }
    }

    return {
      toastRef,
      toast,
      setToastRef
    }
  },
  data() {
    return {
      // 主题相关
      isDarkMode: false,

      // 侧边栏相关
      isSidebarCollapsed: false,
      showUserDropdown: false,

      // 用户认证相关
      isLoggedIn: false,
      userInfo: {
        username: '',
        email: '',
        avatar: '',
        plan: '个人版'
      },
      showLoginModal: false,

      // 聊天相关
      selectedChatId: null,
      recentChats: [
        {
          id: 1,
          title: '欢迎使用DeepSeek',
          time: '刚刚',
          color: 'bg-blue-100',
          iconColor: 'text-blue-500'
        }
      ],
      currentMessages: [],
      isLoading: false,
      inputMessage: '',

      // 其他状态
    }
  },
  mounted() {
    // 设置提示组件引用
    this.setToastRef()
    this.$nextTick(() => {
      this.setToastRef()
    })
    const token = localStorage.getItem('authToken')
    if (token) {
      this.loadUserInfo()
    }

    // 检查本地存储的主题设置
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      this.isDarkMode = true
    }

    // 检查登录状态
    const savedUser = localStorage.getItem('userInfo')
    if (savedUser) {
      this.isLoggedIn = true
      this.userInfo = JSON.parse(savedUser)
    }

    // 添加键盘事件监听
    this.setupKeyboardShortcuts()
  },
  methods: {
    // 侧边栏相关方法
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },

    expandSidebar() {
      this.isSidebarCollapsed = false
    },

    toggleUserDropdown() {
      this.showUserDropdown = !this.showUserDropdown
    },

    // 聊天相关方法
    async newChat() {
      try {
        const response = await chatAPI.createChat('新对话')
        const colorConfigs = [
          { color: 'bg-blue-100', iconColor: 'text-blue-500' },
          { color: 'bg-green-100', iconColor: 'text-green-500' },
          { color: 'bg-yellow-100', iconColor: 'text-yellow-500' },
          { color: 'bg-red-100', iconColor: 'text-red-500' },
          { color: 'bg-purple-100', iconColor: 'text-purple-500' },
          { color: 'bg-pink-100', iconColor: 'text-pink-500' },
          { color: 'bg-indigo-100', iconColor: 'text-indigo-500' },
          { color: 'bg-teal-100', iconColor: 'text-teal-500' }
        ]
        const randomConfig = colorConfigs[Math.floor(Math.random() * colorConfigs.length)]

        const newChat = {
          id: response.id,
          title: '新对话',
          time: '刚刚',
          color: randomConfig.color,
          iconColor: randomConfig.iconColor
        }
        this.recentChats.unshift(newChat)
        this.selectedChatId = newChat.id
        this.currentMessages = []
        this.toast.info('已创建新对话')
      } catch (error) {
        console.error('创建聊天失败:', error)
        this.toast.error('创建聊天失败')
      }
    },

    async selectChat(chatId) {
      this.selectedChatId = chatId
      await this.loadChatMessages(chatId)
    },

    // 删除聊天
    async deleteChat(chatId) {
      try {
        await chatAPI.deleteChat(chatId)

        const index = this.recentChats.findIndex(chat => chat.id === chatId)
        if (index !== -1) {
          this.recentChats.splice(index, 1)
          if (this.selectedChatId === chatId) {
            this.selectedChatId = this.recentChats.length > 0 ? this.recentChats[0].id : null
            this.currentMessages = []
          }
          this.toast.success('对话已删除')
        }

      } catch (error) {
        console.error('删除聊天失败:', error)
        this.toast.error('删除聊天失败')
      }
    },

    // 加载聊天消息
    async loadChatMessages(chatId) {
      try {
        const messages = await chatAPI.getMessages(chatId)
        this.currentMessages = messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp
        }))
      } catch (error) {
        console.error('加载消息失败:', error)
        this.toast.error('加载消息失败')
      }
    },

    // 消息处理
    async sendMessage(content) {
      if (!content.trim()) return

      if (!this.selectedChatId) {
        // 如果没有选中聊天，先创建新聊天
        await this.createNewChatAndSend(content)
        return
      }

      try {
        // 添加用户消息到界面
        const userMessage = {
          id: Date.now(),
          role: 'user',
          content: content.trim(),
          timestamp: Date.now()
        }
        this.currentMessages.push(userMessage)

        // 清空输入框
        this.inputMessage = ''

        // 发送到后端
        this.isLoading = true
        const response = await chatAPI.sendMessage(this.selectedChatId, content.trim())

        // 添加AI回复到界面
        const aiMessage = {
          id: response.id,
          role: 'assistant',
          content: response.content,
          timestamp: response.timestamp
        }
        this.currentMessages.push(aiMessage)

      } catch (error) {
        console.error('发送消息失败:', error)
        this.toast.error('发送消息失败')
      } finally {
        this.isLoading = false
      }
    },
    // 创建新聊天并发送消息
    async createNewChatAndSend(content) {
      try {
        this.isLoading = true

        // 创建新聊天
        const chatResponse = await chatAPI.createChat('新对话')
        const colorConfigs = [
          { color: 'bg-blue-100', iconColor: 'text-blue-500' },
          { color: 'bg-green-100', iconColor: 'text-green-500' },
          { color: 'bg-yellow-100', iconColor: 'text-yellow-500' },
          { color: 'bg-red-100', iconColor: 'text-red-500' },
          { color: 'bg-purple-100', iconColor: 'text-purple-500' },
          { color: 'bg-pink-100', iconColor: 'text-pink-500' },
          { color: 'bg-indigo-100', iconColor: 'text-indigo-500' },
          { color: 'bg-teal-100', iconColor: 'text-teal-500' }
        ]
        const randomConfig = colorConfigs[Math.floor(Math.random() * colorConfigs.length)]
        const newChat = {
          id: chatResponse.id,
          title: '新对话',
          time: '刚刚',
          color: randomConfig.color,
          iconColor: randomConfig.iconColor
        }

        this.recentChats.unshift(newChat)
        this.selectedChatId = newChat.id

        // 发送消息
        await this.sendMessage(content)

      } catch (error) {
        console.error('创建聊天失败:', error)
        this.toast.error('创建聊天失败')
      } finally {
        this.isLoading = false
      }
    },

    handleQuickStart(prompt) {
      this.inputMessage = prompt
      this.$nextTick(() => {
        this.sendMessage(prompt)
      })
    },

    copyMessage(content) {
      navigator.clipboard.writeText(content).then(() => {
        this.toast.success('消息已复制到剪贴板')
      }).catch(() => {
        this.toast.error('复制失败')
      })
    },

    regenerateMessage(messageId) {
      this.toast.info('重新生成功能开发中')
    },

    // 用户认证相关
    async handleLoginSuccess(userInfo) {
      this.isAuthenticated = true
      this.userInfo = userInfo

      try {
        // 从FastAPI获取用户聊天列表
        const chats = await chatAPI.getChats()
        this.chats = chats

        this.toast.success('登录成功')
      } catch (error) {
        console.error('获取聊天列表失败:', error)
        this.toast.error('获取聊天数据失败')
      }
    },

    async handleLogout() {
      try {
        // 调用FastAPI登出接口
        await authAPI.logout()
      } catch (error) {
        console.error('登出失败:', error)
      } finally {
        // 清除本地存储
        localStorage.removeItem('authToken')
        localStorage.removeItem('userInfo')

        this.isAuthenticated = false
        this.userInfo = null
        this.chats = []
        this.currentChat = null

        this.toast.info('已退出登录')
      }
    },

    // 主题相关
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
    },

    // 其他功能
    showSettings() {
      this.toast.info('设置功能开发中')
    },

    showHelp() {
      this.toast.info('帮助与反馈功能开发中')
    },

    uploadFile() {
      this.toast.info('文件上传功能开发中')
    },

    // 键盘快捷键
    setupKeyboardShortcuts() {
      const handleKeydown = (event) => {
        // Ctrl/Cmd + K: 新建对话
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault()
          this.newChat()
        }

        // Ctrl/Cmd + ,: 打开设置
        if ((event.ctrlKey || event.metaKey) && event.key === ',') {
          event.preventDefault()
          this.showSettings()
        }

        // Ctrl/Cmd + L: 切换主题
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
          event.preventDefault()
          this.toggleTheme()
        }
      }

      document.addEventListener('keydown', handleKeydown)

      // 在组件销毁时移除事件监听器
      this.$options.beforeUnmount = () => {
        document.removeEventListener('keydown', handleKeydown)
      }
    },
    // 加载用户信息
    async loadUserInfo() {
      try {
        const userInfo = await authAPI.getUserInfo()
        this.isLoggedIn = true
        this.userInfo = userInfo
      } catch (error) {
        console.error('获取用户信息失败:', error)
        localStorage.removeItem('authToken')
      }
    },

    // 修改登录成功处理
    async handleLoginSuccess(userData) {
      this.isLoggedIn = true
      this.userInfo = userData

      // 加载聊天列表
      await this.loadChats()
    },

    // 加载聊天列表
    async loadChats() {
      try {
        const chats = await chatAPI.getChats()
        this.recentChats = chats.map(chat => ({
          id: chat.id,
          title: chat.title,
          time: this.formatTime(chat.updatedAt),
          color: 'bg-blue-100',
          iconColor: 'text-blue-500'
        }))
      } catch (error) {
        console.error('加载聊天列表失败:', error)
        this.toast.error('加载聊天列表失败')
      }
    },
  }
}
</script>

<style scoped>
/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar-collapsed {
    width: 0 !important;
    min-width: 0 !important;
  }

  .sidebar-expanded {
    width: 100% !important;
    position: absolute;
    z-index: 30;
  }
}
</style>