<template>
  <transition name="modal">
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="$emit('close-modal')">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <!-- 弹窗头部 -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ isLoginMode ? '登录' : '注册' }}
          </h3>
          <button @click="$emit('close-modal')"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-6">
          <!-- 登录/注册切换 -->
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <button @click="isLoginMode = true" :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              isLoginMode
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            ]">
              登录
            </button>
            <button @click="isLoginMode = false" :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              !isLoginMode
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            ]">
              注册
            </button>
          </div>

          <!-- 登录表单 -->
          <form v-if="isLoginMode" @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label for="login-modal-identifier" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                用户名或邮箱
              </label>
              <input id="login-modal-identifier" v-model="loginForm.identifier" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入用户名或邮箱地址" />
            </div>

            <div>
              <label for="login-modal-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码
              </label>
              <input id="login-modal-password" v-model="loginForm.password" type="password" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入密码" />
            </div>

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input v-model="loginForm.rememberMe" type="checkbox"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span class="ml-2 text-sm text-gray-600 dark:text-gray-400">记住我</span>
              </label>
              <button type="button" class="text-sm text-primary hover:text-primary/80 transition-colors">
                忘记密码？
              </button>
            </div>

            <button type="submit" :disabled="isLoading" :class="[
              'w-full py-3 px-4 rounded-lg font-medium transition-colors',
              isLoading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            ]">
              <span v-if="!isLoading">登录</span>
              <span v-else class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                登录中...
              </span>
            </button>
          </form>

          <!-- 注册表单 -->
          <form v-else @submit.prevent="handleRegister" class="space-y-4">
            <div>
              <label for="register-modal-username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                用户名
              </label>
              <input id="register-modal-username" v-model="registerForm.username" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入用户名" />
            </div>

            <div>
              <label for="register-modal-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                邮箱地址
              </label>
              <input id="register-modal-email" v-model="registerForm.email" type="email" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入邮箱地址" />
            </div>

            <div>
              <label for="register-modal-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                密码
              </label>
              <input id="register-modal-password" v-model="registerForm.password" type="password" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请输入密码" />
            </div>

            <div>
              <label for="register-modal-confirm-password"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                确认密码
              </label>
              <input id="register-modal-confirm-password" v-model="registerForm.confirmPassword" type="password" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-input text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="请再次输入密码" />
            </div>

            <div class="flex items-center">
              <input id="register-modal-agree-terms" v-model="registerForm.agreeTerms" type="checkbox" required
                class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" />
              <label for="register-modal-agree-terms" class="ml-2 text-sm text-gray-600 dark:text-gray-400">
                我已阅读并同意
                <a href="#" class="text-primary hover:text-primary/80 transition-colors">服务条款</a>
                和
                <a href="#" class="text-primary hover:text-primary/80 transition-colors">隐私政策</a>
              </label>
            </div>

            <button type="submit" :disabled="isLoading" :class="[
              'w-full py-3 px-4 rounded-lg font-medium transition-colors',
              isLoading
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            ]">
              <span v-if="!isLoading">注册</span>
              <span v-else class="flex items-center justify-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                注册中...
              </span>
            </button>
          </form>


        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { authAPI } from '@/services/api'

export default {
  name: 'LoginModal',
  props: {
    showLoginModal: {
      type: Boolean,
      default: false
    }
  },
  inject: ['toast'],
  data() {
    return {
      isLoginMode: true,
      isLoading: false,
      loginForm: {
        identifier: '',
        password: '',
        rememberMe: false
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.loginForm.identifier || !this.loginForm.password) {
        this.toast.error('请输入用户名和密码')
        return
      }

      try {
        this.isLoading = true

        // 调用后端API进行认证
        const response = await authAPI.login({
          username: this.loginForm.identifier,
          password: this.loginForm.password
        })

        // 保存认证信息到本地存储
        localStorage.setItem('authToken', response.access_token)
        
        // 构建用户信息（由于后端可能没有提供获取用户信息的端点）
        const userInfo = {
          username: this.loginForm.identifier,
          email: this.loginForm.identifier.includes('@') ? this.loginForm.identifier : `${this.loginForm.identifier}@example.com`,
          id: Date.now().toString() // 临时ID
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))

        // 触发登录成功事件
        this.$emit('login-success', userInfo)
        this.toast.success('登录成功')

        // 关闭登录弹窗
        this.$emit('close-modal')

      } catch (error) {
        console.error('登录失败:', error)

        // 根据错误类型显示不同的提示信息
        if (error.message.includes('网络连接失败')) {
          this.toast.error('无法连接到后端服务，请检查后端是否启动')
        } else if (error.response?.status === 401) {
          this.toast.error('用户名或密码错误')
        } else if (error.response?.status === 404) {
          this.toast.error('后端服务未找到，请检查API地址配置')
        } else {
          this.toast.error(error.response?.data?.message || '登录失败，请稍后重试')
        }
      } finally {
        this.isLoading = false
      }
    },

    // 模拟登录API调用
    async loginUser(identifier, password) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // 模拟后端验证逻辑
          const testUsers = [
            {
              id: 1,
              username: "冷丶布丁",
              email: "498128186@qq.com",
              password: "shuishui",
              avatar: "https://design.gemcoder.com/staticResource/echoAiSystemImages/3af53b10252ba2331a996da3c32fd378.png",
              plan: "个人版",
              createdAt: "2023-11-01"
            }
          ]

          // 查找用户（通过邮箱或用户名）
          const user = testUsers.find(u =>
            u.email === identifier || u.username === identifier
          )

          if (!user) {
            resolve({ success: false, message: '用户不存在' })
            return
          }

          if (user.password !== password) {
            resolve({ success: false, message: '密码错误' })
            return
          }

          // 登录成功，返回用户信息（不包含密码）
          const { password: _, ...userInfo } = user
          resolve({ success: true, user: userInfo })
        }, 500)
      })
    },

    async handleRegister() {
      if (!this.registerForm.username || !this.registerForm.email || !this.registerForm.password) {
        this.$emit('show-error', '请填写所有必填字段')
        return
      }

      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.$emit('show-error', '两次输入的密码不一致')
        return
      }

      if (!this.registerForm.agreeTerms) {
        this.$emit('show-error', '请同意服务条款和隐私政策')
        return
      }

      this.isLoading = true
      try {
        // 模拟注册API调用
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 注册成功，切换到登录模式
        this.isLoginMode = true
        this.$emit('show-success', '注册成功，请登录')
        this.resetForms()
      } catch (error) {
        this.$emit('show-error', '注册失败，请稍后重试')
      } finally {
        this.isLoading = false
      }
    },

    resetForms() {
      this.loginForm = {
        identifier: '',
        password: '',
        rememberMe: false
      }
      this.registerForm = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      }
    }
  },
  watch: {
    showLoginModal(newVal) {
      if (!newVal) {
        this.resetForms()
        this.isLoading = false
      }
    }
  },
  emits: [
    'close-modal',
    'login-success',
    'show-success',
    'show-error'
  ]
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>