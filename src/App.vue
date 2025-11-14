<template>
  <div 
    class="font-inter h-screen flex flex-col overflow-hidden"
    :class="{ 
      'dark': isDarkMode,
      'bg-light text-dark': !isDarkMode,
      'bg-dark-bg text-light': isDarkMode 
    }"
  >
    <!-- 提示组件 -->
    <Toast ref="toastRef" />
    
    <!-- 登录弹窗 -->
    <LoginModal
      :show-login-modal="showLoginModal"
      @close-modal="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @show-success="toast.success"
      @show-error="toast.error"
    />
    
    <!-- 主布局 -->
    <div class="flex h-full overflow-hidden">
      <!-- 侧边栏组件 -->
      <Sidebar
        :is-sidebar-collapsed="isSidebarCollapsed"
        :is-logged-in="isLoggedIn"
        :user-info="userInfo"
        :show-user-dropdown="showUserDropdown"
        :is-dark-mode="isDarkMode"
        :recent-chats="recentChats"
        :selected-chat-id="selectedChatId"
        @toggle-sidebar="toggleSidebar"
        @new-chat="newChat"
        @select-chat="selectChat"
        @delete-chat="deleteChat"
        @open-login-modal="showLoginModal = true"
        @toggle-user-dropdown="toggleUserDropdown"
        @show-settings="showSettings"
        @show-help="showHelp"
        @toggle-theme="toggleTheme"
        @logout="handleLogout"
      />
      
      <!-- 主聊天区域组件 -->
      <ChatArea
        :current-chat-id="selectedChatId"
        :messages="currentMessages"
        :is-loading="isLoading"
        :input-message="inputMessage"
        :user-info="userInfo"
        :is-dark-mode="isDarkMode"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
        @show-settings="showSettings"
        @show-help="showHelp"
        @quick-start="handleQuickStart"
        @send-message="sendMessage"
        @copy-message="copyMessage"
        @regenerate-message="regenerateMessage"
        @clear-input="inputMessage = ''"
        @upload-file="uploadFile"
        @update:input-message="(value) => inputMessage = value"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
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
    newChat() {
      const newChatId = Date.now()
      // 随机颜色配置
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
      
      this.recentChats.unshift({
        id: newChatId,
        title: '新对话',
        time: '刚刚',
        color: randomConfig.color,
        iconColor: randomConfig.iconColor
      })
      this.selectedChatId = newChatId
      this.currentMessages = []
      this.toast.info('已创建新对话')
    },
    
    selectChat(chatId) {
      this.selectedChatId = chatId
      // 模拟加载聊天记录
      this.loadChatMessages(chatId)
    },
    
    deleteChat(chatId) {
      const index = this.recentChats.findIndex(chat => chat.id === chatId)
      if (index !== -1) {
        this.recentChats.splice(index, 1)
        if (this.selectedChatId === chatId) {
          this.selectedChatId = this.recentChats.length > 0 ? this.recentChats[0].id : null
          this.currentMessages = []
        }
        this.toast.success('对话已删除')
      }
    },
    
    loadChatMessages(chatId) {
      // 模拟加载消息
      if (chatId === 1) {
        this.currentMessages = [
          {
            id: 1,
            role: 'assistant',
            content: '欢迎使用DeepSeek！我是您的AI助手，可以帮您解答问题、创作内容、分析文档等。有什么我可以帮助您的吗？',
            timestamp: Date.now() - 60000
          }
        ]
      } else {
        this.currentMessages = []
      }
    },
    
    // 消息处理
    async sendMessage(content) {
      if (!content.trim()) return
      
      // 添加用户消息
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now()
      }
      this.currentMessages.push(userMessage)
      
      // 清空输入框
      this.inputMessage = ''
      
      // 模拟AI回复
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `我已经收到您的消息："${content.trim()}"。这是一个模拟回复，实际应用中会调用AI接口生成回复内容。`,
          timestamp: Date.now() + 1000
        }
        this.currentMessages.push(aiMessage)
        
        // 更新对话标题
        if (this.selectedChatId && this.currentMessages.length === 2) {
          const chat = this.recentChats.find(c => c.id === this.selectedChatId)
          if (chat && chat.title === '新对话') {
            chat.title = content.trim().substring(0, 20) + (content.trim().length > 20 ? '...' : '')
          }
        }
      } catch (error) {
        this.toast.error('发送消息失败')
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
    async handleLoginSuccess(userData) {
      this.isLoggedIn = true
      this.userInfo = { ...userData, plan: '个人版' }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
      this.toast.success('登录成功')
    },
    
    handleLogout() {
      this.isLoggedIn = false
      this.userInfo = { username: '', email: '', avatar: '', plan: '个人版' }
      this.showUserDropdown = false
      localStorage.removeItem('userInfo')
      this.toast.info('已退出登录')
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
    }
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