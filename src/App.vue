<template>
  <div 
    class="font-inter bg-light dark:bg-dark-bg text-dark dark:text-light h-screen flex flex-col overflow-hidden"
    :class="{ 'dark': isDarkMode }"
  >
    <!-- 主内容区域 -->
    <div class="flex h-full overflow-hidden">
      <!-- 侧边栏 -->
      <aside
        :class="[
          'bg-white dark:bg-dark-card border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out z-20',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        ]"
      >
        <!-- 侧边栏顶部logo -->
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div class="flex items-center space-x-2" v-if="!isSidebarCollapsed">
            <div class="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <i class="fas fa-brain text-white text-lg"></i>
            </div>
            <h1 class="text-xl font-bold text-primary">DeepSeek</h1>
          </div>
          <button
            @click="toggleSidebar"
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
          >
            <i 
              :class="[
                'fas text-gray-500 dark:text-gray-400',
                isSidebarCollapsed ? 'fa-bars' : 'fa-chevron-left'
              ]"
            ></i>
          </button>
        </div>

        <!-- 侧边栏对话列表 -->
        <div class="flex-1 overflow-y-auto scrollbar-hide p-2">
          <div class="mb-4">
            <button
              @click="newChat"
              class="w-full flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 px-4 rounded-lg transition-bg font-medium"
            >
              <i class="fas fa-plus"></i>
              <span v-if="!isSidebarCollapsed">新对话</span>
            </button>
          </div>
          
          <div class="space-y-1" v-if="!isSidebarCollapsed">
            <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              最近对话
            </div>
            
            <!-- 对话项 -->
            <div
              v-for="chat in recentChats"
              :key="chat.id"
              @click="selectChat(chat.id)"
              :class="[
                'chat-item flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg cursor-pointer',
                { 'bg-gray-100 dark:bg-dark-hover': selectedChatId === chat.id }
              ]"
            >
              <div :class="`w-8 h-8 rounded-md ${chat.color} flex items-center justify-center flex-shrink-0`">
                <i :class="`fas fa-comment ${chat.iconColor}`"></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ chat.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ chat.time }}</p>
              </div>
              <button
                @click.stop="deleteChat(chat.id)"
                class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 hover:opacity-100 transition-opacity"
                title="删除对话"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- 侧边栏底部用户信息 -->
        <div class="p-3 border-t border-gray-200 dark:border-gray-700">
          <div class="relative">
            <!-- 用户信息区域 -->
            <div 
              @click="toggleUserDropdown"
              class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg cursor-pointer"
            >
              <img
                src="https://design.gemcoder.com/staticResource/echoAiSystemImages/3af53b10252ba2331a996da3c32fd378.png"
                alt="用户头像"
                class="w-8 h-8 rounded-full object-cover"
              />
              <div class="flex-1 min-w-0" v-if="!isSidebarCollapsed">
                <p class="text-sm font-medium truncate">张小明</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">个人版</p>
              </div>
              <i class="fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
            </div>
            
            <!-- 用户下拉菜单 -->
            <div 
              v-if="showUserDropdown"
              class="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
            >
              <button
                @click="showSettings"
                class="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg text-left"
              >
                <i class="fas fa-cog text-gray-500 dark:text-gray-400 w-5 text-center"></i>
                <span class="text-sm">设置</span>
              </button>
              <button
                @click="showHelp"
                class="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg text-left"
              >
                <i class="fas fa-question-circle text-gray-500 dark:text-gray-400 w-5 text-center"></i>
                <span class="text-sm">帮助与反馈</span>
              </button>
              <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                @click="toggleTheme"
                class="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg text-left"
              >
                <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'" class="text-gray-500 dark:text-gray-400 w-5 text-center"></i>
                <span class="text-sm">{{ isDarkMode ? '浅色模式' : '深色模式' }}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主聊天区域 -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 聊天区域顶部工具栏 -->
        <header class="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-dark-card">
          <div class="flex items-center space-x-2">
            <button
              @click="expandSidebar"
              class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg lg:hidden"
            >
              <i class="fas fa-bars text-gray-500 dark:text-gray-400"></i>
            </button>
            <div class="hidden md:flex items-center space-x-1">
              <button
                @click="showHistory"
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
              >
                <i class="fas fa-history text-gray-500 dark:text-gray-400"></i>
              </button>
              <button
                @click="toggleFavorite"
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
              >
                <i :class="isFavorite ? 'fas fa-star text-yellow-500' : 'fas fa-star text-gray-500 dark:text-gray-400'"></i>
              </button>
              <button
                @click="deleteChat"
                class="p-2 rounded hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
              >
                <i class="fas fa-trash-alt text-gray-500 dark:text-gray-400"></i>
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="relative">
              <button
                @click="toggleNotifications"
                class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
              >
                <i class="fas fa-bell text-gray-500 dark:text-gray-400"></i>
              </button>
              <span v-if="hasNotifications" class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>
            <div class="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div class="relative group">
              <button
                @click="toggleModelDropdown"
                class="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover transition-bg"
              >
                <span class="text-sm font-medium">{{ currentModel }}</span>
                <i class="fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
              </button>
              <div
                v-if="showModelDropdown"
                class="absolute right-0 mt-1 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
              >
                <a
                  v-for="model in availableModels"
                  :key="model"
                  href="javascript:void(0);"
                  @click="selectModel(model)"
                  :class="[
                    'block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-hover',
                    { 'bg-gray-100 dark:bg-dark-hover': currentModel === model }
                  ]"
                >
                  {{ model }}
                </a>
              </div>
            </div>
          </div>
        </header>

        <!-- 聊天区域对话内容 -->
        <main class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-dark-bg">
          <!-- 新对话时的欢迎消息 -->
          <div v-if="currentChat().messages.length === 0" class="max-w-3xl mx-auto">
            <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div class="flex items-start space-x-4">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <i class="fas fa-robot text-primary"></i>
                </div>
                <div>
                  <h2 class="text-xl font-bold mb-2">欢迎使用 DeepSeek Chat</h2>
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    我是由深度求索（DeepSeek）开发的AI助手，可以回答您的问题、提供信息和帮助完成各种任务。
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div
                      v-for="suggestion in quickSuggestions"
                      :key="suggestion.title"
                      @click="selectSuggestion(suggestion)"
                      class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-bg"
                    >
                      <h3 class="font-medium mb-1">{{ suggestion.title }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ suggestion.description }}</p>
                    </div>
                  </div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    DeepSeek Chat 会根据您的问题提供准确的信息和有用的建议。开始输入您的问题吧！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 显示当前对话的消息 -->
          <div v-for="message in currentChat().messages" :key="message.id" class="max-w-3xl mx-auto">
            <!-- 用户消息 -->
            <div v-if="message.type === 'user'" class="flex items-start space-x-4">
              <img
                src="https://design.gemcoder.com/staticResource/echoAiSystemImages/3af53b10252ba2331a996da3c32fd378.png"
                alt="用户头像"
                class="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div class="flex-1">
                <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                  <p>{{ message.content }}</p>
                </div>
                <div class="flex items-center space-x-2 mt-1 ml-2">
                  <button
                    @click="likeMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-thumbs-up"></i>
                  </button>
                  <button
                    @click="dislikeMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-thumbs-down"></i>
                  </button>
                  <button
                    @click="copyMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- AI回复 -->
            <div v-else-if="message.type === 'ai'" class="flex items-start space-x-4">
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-robot text-primary"></i>
              </div>
              <div class="flex-1">
                <div class="bg-white dark:bg-dark-card rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                  <div v-html="message.content"></div>
                </div>
                <div class="flex items-center space-x-2 mt-1 ml-2">
                  <button
                    @click="likeMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-thumbs-up"></i>
                  </button>
                  <button
                    @click="dislikeMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-thumbs-down"></i>
                  </button>
                  <button
                    @click="copyMessage"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs p-1"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <!-- 输入区域 -->
        <div class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card p-4">
          <div class="max-w-3xl mx-auto">
            <div class="flex items-end space-x-3">
              <div class="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <textarea
                  v-model="messageInput"
                  @keydown.enter.exact.prevent="sendMessage"
                  placeholder="输入您的问题..."
                  class="w-full bg-transparent border-0 focus:ring-0 focus:outline-none focus:border-primary/50 resize-none p-3 min-h-[60px] max-h-32 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent scrollbar-thumb-rounded-full"
                  rows="2"
                ></textarea>
              </div>
              <button
                @click="sendMessage"
                :disabled="!messageInput.trim()"
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center transition-bg',
                  messageInput.trim() 
                    ? 'bg-primary hover:bg-primary/90 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                ]"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  setup() {
    // 响应式状态
    const isDarkMode = ref(false)
    const isSidebarCollapsed = ref(false)
    const showModelDropdown = ref(false)
    const showUserDropdown = ref(false)
    const hasNotifications = ref(true)
    const isFavorite = ref(false)
    const messageInput = ref('')
    const selectedChatId = ref(1)
    
    const currentModel = ref('DeepSeek-7B')
    const availableModels = ['DeepSeek-7B', 'DeepSeek-13B', 'DeepSeek-Coder']
    
    const recentChats = reactive([
      { 
        id: 1, 
        title: '如何使用Tailwind CSS构建响应式界面', 
        time: '今天 14:30', 
        color: 'bg-blue-100 dark:bg-blue-900/30', 
        iconColor: 'text-blue-500 dark:text-blue-400',
        messages: [
          { id: 1, type: 'user', content: '你好，我想了解一下如何使用Tailwind CSS构建响应式界面' },
          { id: 2, type: 'ai', content: '使用Tailwind CSS构建响应式界面的基本步骤...' }
        ]
      },
      { 
        id: 2, 
        title: 'JavaScript异步编程最佳实践', 
        time: '昨天 09:15', 
        color: 'bg-green-100 dark:bg-green-900/30', 
        iconColor: 'text-green-500 dark:text-green-400',
        messages: [
          { id: 3, type: 'user', content: '请解释JavaScript异步编程的最佳实践' },
          { id: 4, type: 'ai', content: 'JavaScript异步编程的最佳实践包括使用async/await、Promise等...' }
        ]
      },
      { 
        id: 3, 
        title: 'React Hooks完全指南', 
        time: '2023/11/28', 
        color: 'bg-purple-100 dark:bg-purple-900/30', 
        iconColor: 'text-purple-500 dark:text-purple-400',
        messages: [
          { id: 5, type: 'user', content: '请介绍React Hooks的使用方法' },
          { id: 6, type: 'ai', content: 'React Hooks是React 16.8引入的新特性，包括useState、useEffect等...' }
        ]
      },
      { 
        id: 4, 
        title: '前端性能优化的10个技巧', 
        time: '2023/11/25', 
        color: 'bg-yellow-100 dark:bg-yellow-900/30', 
        iconColor: 'text-yellow-500 dark:text-yellow-400',
        messages: [
          { id: 7, type: 'user', content: '前端性能优化有哪些技巧？' },
          { id: 8, type: 'ai', content: '前端性能优化的10个技巧包括代码分割、懒加载、缓存策略等...' }
        ]
      }
    ])
    
    const quickSuggestions = reactive([
      { title: '解释量子计算的基本原理', description: '用简单易懂的语言解释量子计算的工作原理' },
      { title: '编写一个React组件示例', description: '创建一个简单的待办事项列表组件' },
      { title: '分析市场趋势', description: '讨论当前科技行业的发展方向' },
      { title: '帮助改进写作', description: '提供文章结构和表达方式的建议' }
    ])

    // 计算属性
    const currentChat = () => {
      return recentChats.find(chat => chat.id === selectedChatId.value) || recentChats[0]
    }

    // 方法
    const toggleTheme = () => {
      isDarkMode.value = !isDarkMode.value
      if (isDarkMode.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    const toggleSidebar = () => {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }

    const expandSidebar = () => {
      isSidebarCollapsed.value = false
    }

    const toggleModelDropdown = () => {
      showModelDropdown.value = !showModelDropdown.value
    }

    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value
    }

    const selectModel = (model) => {
      currentModel.value = model
      showModelDropdown.value = false
    }

    const newChat = () => {
      // 定义可用的颜色选项
      const colorOptions = [
        { color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-500 dark:text-blue-400' },
        { color: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-500 dark:text-green-400' },
        { color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-500 dark:text-purple-400' },
        { color: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-500 dark:text-yellow-400' },
        { color: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-500 dark:text-red-400' },
        { color: 'bg-indigo-100 dark:bg-indigo-900/30', iconColor: 'text-indigo-500 dark:text-indigo-400' },
        { color: 'bg-pink-100 dark:bg-pink-900/30', iconColor: 'text-pink-500 dark:text-pink-400' },
        { color: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-500 dark:text-teal-400' }
      ]
      
      // 随机选择一个颜色
      const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)]
      
      const newChat = {
        id: Date.now(),
        title: '新对话',
        time: '刚刚',
        color: randomColor.color,
        iconColor: randomColor.iconColor,
        messages: []
      }
      recentChats.unshift(newChat)
      selectedChatId.value = newChat.id
    }

    const selectChat = (chatId) => {
      selectedChatId.value = chatId
    }

    const showChatOptions = (chatId) => {
      console.log('显示对话选项:', chatId)
    }

    const showSettings = () => {
      console.log('显示设置')
      showUserDropdown.value = false
    }

    const showHelp = () => {
      console.log('显示帮助')
      showUserDropdown.value = false
    }

    const showHistory = () => {
      console.log('显示历史记录')
    }

    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value
    }

    const deleteChat = (chatId) => {
      // 找到要删除的对话索引
      const chatIndex = recentChats.findIndex(chat => chat.id === chatId)
      if (chatIndex === -1) return
      
      // 检查是否是最后一个对话
      const isLastChat = recentChats.length === 1
      
      // 如果要删除的是当前选中的对话，切换到其他对话
      if (selectedChatId.value === chatId) {
        // 如果有其他对话，切换到第一个
        if (recentChats.length > 1) {
          const newIndex = chatIndex === 0 ? 1 : 0
          selectedChatId.value = recentChats[newIndex].id
        }
      }
      
      // 从数组中删除对话
      recentChats.splice(chatIndex, 1)
      
      // 如果是最后一个对话被删除，创建一个新对话
      if (isLastChat) {
        newChat()
      }
      
      console.log('删除对话:', chatId)
    }

    const toggleNotifications = () => {
      hasNotifications.value = !hasNotifications.value
    }

    const selectSuggestion = (suggestion) => {
      messageInput.value = suggestion.title
    }

    const likeMessage = () => {
      console.log('点赞消息')
    }

    const dislikeMessage = () => {
      console.log('点踩消息')
    }

    const copyMessage = () => {
      console.log('复制消息')
    }

    const sendMessage = () => {
      if (!messageInput.value.trim()) return
      
      const current = currentChat()
      if (!current.messages) {
        current.messages = []
      }
      
      // 添加用户消息
      current.messages.push({
        id: Date.now(),
        type: 'user',
        content: messageInput.value.trim()
      })
      
      // 模拟AI回复
      setTimeout(() => {
        current.messages.push({
          id: Date.now() + 1,
          type: 'ai',
          content: `这是对"${messageInput.value.trim()}"的回复。这是一个模拟的AI回复。`
        })
      }, 1000)
      
      messageInput.value = ''
    }

    // 点击外部关闭下拉菜单
    const handleClickOutside = (event) => {
      if (showModelDropdown.value && !event.target.closest('.group')) {
        showModelDropdown.value = false
      }
      if (showUserDropdown.value && !event.target.closest('.relative')) {
        showUserDropdown.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // 检查系统主题偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDarkMode.value = true
        document.documentElement.classList.add('dark')
      }
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      // 状态
      isDarkMode,
      isSidebarCollapsed,
      showModelDropdown,
      showUserDropdown,
      hasNotifications,
      isFavorite,
      messageInput,
      selectedChatId,
      currentModel,
      availableModels,
      recentChats,
      quickSuggestions,
      
      // 计算属性
      currentChat,
      
      // 方法
      toggleTheme,
      toggleSidebar,
      expandSidebar,
      toggleModelDropdown,
      toggleUserDropdown,
      selectModel,
      newChat,
      selectChat,
      showChatOptions,
      showSettings,
      showHelp,
      showHistory,
      toggleFavorite,
      deleteChat,
      toggleNotifications,
      selectSuggestion,
      likeMessage,
      dislikeMessage,
      copyMessage,
      sendMessage
    }
  }
}
</script>

<style scoped>
/* 自定义样式确保与原始HTML一致 */
</style>