<template>
  <view class="index-container">
    <!-- 顶部欢迎区域 -->
    <view class="header-section">
      <view class="welcome-banner">
        <view class="welcome-content">
          <text class="greeting">{{ greeting }}</text>
          <text class="username">{{ isLoggedIn ? (userInfo.name || '学习达人') : '欢迎使用' }}</text>
          <text class="subtitle">{{ isLoggedIn ? '今天也要继续加油哦！' : '开始您的学习之旅' }}</text>
        </view>
        <view class="user-avatar">
          <image class="avatar-img" :src="isLoggedIn ? (userInfo.avatar || '/static/default-avatar.png') : '/static/default-avatar.png'" mode="aspectFill" />
          <view class="online-status" v-if="isLoggedIn"></view>
        </view>
      </view>
    </view>
    
    <!-- 未登录提示 -->
    <view class="login-prompt" v-if="!isLoggedIn">
      <view class="prompt-card">
        <view class="prompt-content">
          <text class="prompt-icon">🔐</text>
          <text class="prompt-title">需要登录</text>
          <text class="prompt-subtitle">登录后可使用完整功能</text>
          <button class="login-btn" @tap="goToLogin">立即登录</button>
        </view>
      </view>
    </view>
    
    <!-- 统计卡片区域 -->
    <view class="stats-section" v-if="isLoggedIn">
      <view class="stats-grid">
        <view class="stat-card" @tap="goToCheckin">
          <text class="stat-icon">📅</text>
          <text class="stat-number">{{ stats.checkinDays }}</text>
          <text class="stat-label">连续打卡</text>
        </view>
        <view class="stat-card" @tap="goToStudyGroups">
          <text class="stat-icon">👥</text>
          <text class="stat-number">{{ stats.joinedGroups }}</text>
          <text class="stat-label">加入群组</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">🏆</text>
          <text class="stat-number">{{ stats.achievements }}</text>
          <text class="stat-label">获得成就</text>
        </view>
        <view class="stat-card">
          <text class="stat-icon">⚡</text>
          <text class="stat-number">{{ stats.studyHours }}</text>
          <text class="stat-label">学习时长</text>
        </view>
      </view>
    </view>
    
    <!-- 快速操作区域 -->
    <view class="actions-section">
      <text class="section-title">快速操作</text>
      <view class="actions-grid">
        <view class="action-item" @tap="handleActionTap('checkin')">
          <view class="action-icon">📝</view>
          <text class="action-label">今日打卡</text>
        </view>
        <view class="action-item" @tap="handleActionTap('groupMatch')">
          <view class="action-icon">🤝</view>
          <text class="action-label">匹配伙伴</text>
        </view>
        <view class="action-item" @tap="handleActionTap('aiChat')">
          <view class="action-icon">🤖</view>
          <text class="action-label">AI助手</text>
        </view>
        <view class="action-item" @tap="handleActionTap('studyGroups')">
          <view class="action-icon">📚</view>
          <text class="action-label">学习群组</text>
        </view>
      </view>
    </view>
    
    <!-- 最近活动区域 -->
    <view class="activities-section" v-if="isLoggedIn">
      <text class="section-title">最近活动</text>
      <view class="activity-list">
        <view class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
          <view class="activity-icon">
            <text>{{ activity.icon }}</text>
          </view>
          <view class="activity-content">
            <text class="activity-text">{{ activity.text }}</text>
            <text class="activity-time">{{ activity.time }}</text>
          </view>
        </view>
        <view class="activity-empty" v-if="recentActivities.length === 0">
          <text class="empty-text">暂无最近活动</text>
          <text class="empty-hint">开始您的学习之旅吧！</text>
        </view>
      </view>
    </view>
    
    <!-- 功能介绍区域（未登录时显示） -->
    <view class="features-section" v-if="!isLoggedIn">
      <text class="section-title">功能介绍</text>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📚</text>
          <view class="feature-content">
            <text class="feature-title">学习群组</text>
            <text class="feature-desc">加入志同道合的学习小组</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📝</text>
          <view class="feature-content">
            <text class="feature-title">学习打卡</text>
            <text class="feature-desc">记录每日学习成果</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🤖</text>
          <view class="feature-content">
            <text class="feature-title">AI助手</text>
            <text class="feature-desc">智能学习辅导和答疑</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { notify } from '../../utils/notification.js'

export default {
  name: 'IndexPage',
  data() {
    return {
      isLoggedIn: false,
      hasRedirected: false,
      userInfo: {
        name: '小明',
        avatar: ''
      },
      stats: {
        checkinDays: 7,
        joinedGroups: 3,
        achievements: 12,
        studyHours: 24
      },
      recentActivities: [
        {
          type: 'checkin',
          icon: '✅',
          text: '完成今日打卡',
          time: '2小时前'
        },
        {
          type: 'group',
          icon: '👥',
          text: '加入了「前端学习小组」',
          time: '1天前'
        },
        {
          type: 'achievement',
          icon: '🏆',
          text: '获得「坚持打卡」成就',
          time: '2天前'
        }
      ]
    }
  },
  computed: {
    greeting() {
      const hour = new Date().getHours()
      if (hour < 6) return '夜深了'
      if (hour < 9) return '早上好'
      if (hour < 12) return '上午好'
      if (hour < 14) return '中午好'
      if (hour < 17) return '下午好'
      if (hour < 19) return '傍晚好'
      return '晚上好'
    }
  },
  async onLoad() {
    console.log('首页加载')
    await this.initPageWithAuth()
  },
  onShow() {
    console.log('首页显示')
    // 只刷新数据，不进行登录检查（避免影响tabBar跳转）
    this.refreshData()
    // 延迟检查登录状态，避免与tabBar切换冲突
    setTimeout(() => {
      this.checkLoginStatusSafe()
    }, 100)
  },
  methods: {
    // 集成认证管理器的页面初始化方法
    async initPageWithAuth() {
      try {
        console.log('[首页] 开始页面认证初始化')
        
        // 1. 内联定义认证管理器（避免模块导入问题）
        const authManager = this.getAuthManager()
        
        // 2. 进行页面认证初始化（自动同步用户到Supabase）
        const userInfo = await authManager.initPageAuth({
          requireAuth: false, // 首页不强制要求登录
          autoSync: true,     // 自动同步到Supabase
        })
        
        if (userInfo) {
          this.isLoggedIn = true
          this.userInfo = {
            name: userInfo.nickname || userInfo.name || '学习达人',
            avatar: userInfo.avatar_url || userInfo.avatarUrl || ''
          }
          console.log('[首页] 用户认证完成，已同步到Supabase:', userInfo)
          
          // 3. 加载用户数据
          await this.loadUserData()
        } else {
          this.isLoggedIn = false
          console.log('[首页] 用户未登录')
        }
        
      } catch (error) {
        console.error('[首页] 页面认证初始化失败:', error)
        this.isLoggedIn = false
        this.notifyError('页面初始化失败', '请尝试重新进入')
      }
    },
    
    // 内联认证管理器（避免模块导入问题）
    getAuthManager() {
      return {
        isLoggedIn() {
          try {
            const token = uni.getStorageSync('user_token')
            const userInfo = uni.getStorageSync('user_info')
            const isLoggedIn = uni.getStorageSync('is_logged_in')
            return !!(token && userInfo && userInfo.openid && isLoggedIn)
          } catch (error) {
            console.error('[AuthManager] 检查登录状态失败:', error)
            return false
          }
        },
        
        getCurrentUser() {
          try {
            if (!this.isLoggedIn()) {
              return null
            }
            return uni.getStorageSync('user_info') || null
          } catch (error) {
            console.error('[AuthManager] 获取用户信息失败:', error)
            return null
          }
        },
        
        async checkUserInSupabase(openid) {
          try {
            console.log('[AuthManager] 检查用户是否存在于Supabase:', openid)
            
            const result = await new Promise((resolve, reject) => {
              uniCloud.callFunction({
                name: 'learningGroupAPI',
                data: {
                  action: 'getUserInfo',
                  openid: openid
                },
                success: (res) => {
                  if (res.result && res.result.success) {
                    console.log('[AuthManager] 用户存在于Supabase:', res.result.data)
                    resolve(true)
                  } else {
                    console.log('[AuthManager] 用户不存在于Supabase')
                    resolve(false)
                  }
                },
                fail: (error) => {
                  console.error('[AuthManager] 检查用户失败:', error)
                  resolve(false)
                }
              })
            })
            
            return result
          } catch (error) {
            console.error('[AuthManager] 检查用户异常:', error)
            return false
          }
        },
        
        async syncUserToSupabase(userInfo) {
          try {
            console.log('[AuthManager] 开始同步用户到Supabase:', userInfo)
            
            const result = await new Promise((resolve, reject) => {
              uniCloud.callFunction({
                name: 'learningGroupAPI',
                data: {
                  action: 'createUser',
                  openid: userInfo.openid,
                  nickname: userInfo.nickname || userInfo.name || '微信用户',
                  avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || '',
                  bio: userInfo.bio || ''
                },
                success: (res) => {
                  if (res.result && res.result.success) {
                    console.log('[AuthManager] 用户同步成功:', res.result.data)
                    resolve(res.result.data)
                  } else {
                    reject(new Error(res.result?.error || '同步用户失败'))
                  }
                },
                fail: (error) => {
                  console.error('[AuthManager] 同步用户失败:', error)
                  reject(error)
                }
              })
            })
            
            return result
          } catch (error) {
            console.error('[AuthManager] 同步用户异常:', error)
            throw error
          }
        },
        
        async ensureUserSynced() {
          console.log('[AuthManager] 开始确保用户已同步')
          
          // 1. 检查登录状态
          if (!this.isLoggedIn()) {
            console.log('[AuthManager] 用户未登录，跳过同步')
            return null
          }

          const currentUser = this.getCurrentUser()
          if (!currentUser || !currentUser.openid) {
            console.log('[AuthManager] 无效用户信息，跳过同步')
            return null
          }

          // 2. 检查用户是否已存在于Supabase
          const exists = await this.checkUserInSupabase(currentUser.openid)
          
          if (exists) {
            console.log('[AuthManager] 用户已存在于Supabase，无需同步')
            return currentUser
          }
          
          // 3. 用户不存在，进行同步
          console.log('[AuthManager] 用户不存在于Supabase，开始同步...')
          try {
            const syncResult = await this.syncUserToSupabase(currentUser)
            
            // 4. 更新本地用户信息
            const updatedUserInfo = Object.assign({}, currentUser, syncResult)
            uni.setStorageSync('user_info', updatedUserInfo)
            
            console.log('[AuthManager] 用户同步完成，本地信息已更新:', updatedUserInfo)
            return updatedUserInfo
          } catch (syncError) {
            console.error('[AuthManager] 用户同步失败:', syncError)
            // 同步失败时返回原用户信息，不影响页面功能
            return currentUser
          }
        },
        
        async initPageAuth(options = {}) {
          const {
            requireAuth = true,
            autoSync = true,
          } = options

          try {
            console.log('[AuthManager] 开始页面认证初始化')

            // 1. 检查登录状态
            if (!this.isLoggedIn()) {
              console.log('[AuthManager] 用户未登录')
              if (requireAuth) {
                return null
              }
              return null
            }

            // 2. 获取用户信息
            const userInfo = this.getCurrentUser()
            if (!userInfo) {
              console.log('[AuthManager] 获取用户信息失败')
              if (requireAuth) {
                return null
              }
              return null
            }

            // 3. 自动同步到Supabase
            if (autoSync) {
              try {
                const syncedUser = await this.ensureUserSynced()
                console.log('[AuthManager] 页面认证初始化完成，用户已同步')
                return syncedUser
              } catch (syncError) {
                console.warn('[AuthManager] 用户同步失败，但继续页面加载:', syncError.message)
                return userInfo // 同步失败时返回本地用户信息
              }
            }

            console.log('[AuthManager] 页面认证初始化完成')
            return userInfo

          } catch (error) {
            console.error('[AuthManager] 页面认证初始化失败:', error)
            return null
          }
        }
      }
    },
    
    initPage() {
      try {
        this.checkLoginStatus()
        this.loadUserData()
      } catch (error) {
        console.error('首页初始化失败:', error)
        this.notifyError('页面初始化失败', '请尝试重新进入')
      }
    },
    
    refreshData() {
      try {
        if (this.isLoggedIn) {
          this.loadUserData()
        }
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    },
    
    checkLoginStatus() {
      try {
        // 使用与StorageManager一致的键名
        const token = uni.getStorageSync('user_token')
        const userInfo = uni.getStorageSync('user_info')
        const isLoggedIn = uni.getStorageSync('is_logged_in')
        
        if (token && userInfo && isLoggedIn) {
          this.isLoggedIn = true
          this.hasRedirected = false
          console.log('[首页] 用户已登录')
          
          // 设置用户信息到页面数据中
          this.userInfo = {
            name: userInfo.nickname || userInfo.name || '学习达人',
            avatar: userInfo.avatar_url || userInfo.avatarUrl || ''
          }
        } else if (!this.hasRedirected) {
          this.hasRedirected = true
          console.log('[首页] 用户未登录，跳转到登录页')
          uni.reLaunch({
            url: '/pages/login/login',
            fail: (err) => {
              console.error('[首页] 跳转登录页失败:', err)
              this.notifyError('登录跳转失败', '请手动进入登录页面')
            }
          })
        }
      } catch (error) {
        console.error('[首页] 检查登录状态失败:', error)
        this.isLoggedIn = false
      }
    },
    
    // 安全的登录状态检查，不会影响tabBar跳转
    checkLoginStatusSafe() {
      try {
        // 使用与StorageManager一致的键名
        const token = uni.getStorageSync('user_token')
        const userInfo = uni.getStorageSync('user_info')
        const isLoggedIn = uni.getStorageSync('is_logged_in')
        
        if (token && userInfo && isLoggedIn) {
          this.isLoggedIn = true
          this.hasRedirected = false
          console.log('[首页] 用户已登录')
          
          // 设置用户信息到页面数据中
          this.userInfo = {
            name: userInfo.nickname || userInfo.name || '学习达人',
            avatar: userInfo.avatar_url || userInfo.avatarUrl || ''
          }
        } else {
          // 显示登录提示而不是强制跳转
          this.showLoginPrompt()
        }
      } catch (error) {
        console.error('[首页] 检查登录状态失败:', error)
        this.isLoggedIn = false
      }
    },
    
    // 显示登录提示而不是强制跳转
    showLoginPrompt() {
      if (!this.hasRedirected) {
        this.hasRedirected = true
        uni.showModal({
          title: '需要登录',
          content: '请先登录后使用完整功能',
          confirmText: '去登录',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              uni.reLaunch({
                url: '/pages/login/login'
              })
            } else {
              // 用户选择稍后再说，设置为未登录状态但允许浏览
              this.isLoggedIn = false
            }
          }
        })
      }
    },
    
    async loadUserData() {
      try {
        // 模拟加载用户数据
        setTimeout(() => {
          // 模拟数据加载完成
        }, 1000)
      } catch (error) {
        console.error('加载用户数据失败:', error)
      }
    },
    
    // 处理操作点击，根据登录状态决定行为
    handleActionTap(action) {
      if (!this.isLoggedIn) {
        this.promptLogin()
        return
      }
      
      switch (action) {
        case 'checkin':
          this.goToCheckin()
          break
        case 'groupMatch':
          this.goToGroupMatch()
          break
        case 'aiChat':
          this.goToAIChat()
          break
        case 'studyGroups':
          this.goToStudyGroups()
          break
        default:
          console.warn('未知的操作:', action)
      }
    },
    
    // 提示用户登录
    promptLogin() {
      uni.showModal({
        title: '需要登录',
        content: '该功能需要登录后才能使用，是否立即登录？',
        confirmText: '立即登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.goToLogin()
          }
        }
      })
    },
    
    // 跳转到登录页
    goToLogin() {
      try {
        uni.reLaunch({
          url: '/pages/login/login',
          success: () => {
            console.log('跳转到登录页成功')
          },
          fail: (err) => {
            console.error('跳转到登录页失败:', err)
            uni.showToast({
              title: '跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('登录页跳转异常:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    goToCheckin() {
      try {
        uni.navigateTo({ 
          url: '/pages/checkin/checkin',
          fail: (err) => {
            console.error('跳转到打卡页面失败:', err)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('打卡页面跳转异常:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    goToGroupMatch() {
      try {
        uni.navigateTo({ 
          url: '/pages/groupMatch/groupMatch',
          fail: (err) => {
            console.error('跳转到群组匹配失败:', err)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('群组匹配页面跳转异常:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    goToAIChat() {
      try {
        uni.navigateTo({ 
          url: '/pages/aichat/aichat',
          fail: (err) => {
            console.error('跳转到AI聊天失败:', err)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('AI聊天页面跳转异常:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    goToStudyGroups() {
      try {
        uni.switchTab({ 
          url: '/pages/studyGroups/studyGroups',
          fail: (err) => {
            console.error('跳转到学习群组失败:', err)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      } catch (error) {
        console.error('学习群组页面跳转异常:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },
    
    // 通知相关方法
    notifyError(title, content) {
      try {
        notify.error(title, content, {
          persistent: true,
          data: {
            action: 'show-modal',
            modal: {
              title: '错误详情',
              content: content,
              showCancel: false
            }
          }
        })
      } catch (error) {
        console.error('发送错误通知失败:', error)
      }
    },
    
    notifySuccess(title, content) {
      try {
        notify.success(title, content, {
          persistent: false,
          sound: true,
          vibrate: true
        })
      } catch (error) {
        console.error('发送成功通知失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: #f9fafb;
  padding: 32rpx;
}

.header-section {
  margin-bottom: 48rpx;
  
  .welcome-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24rpx;
    padding: 48rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.15);
    
    .welcome-content {
      flex: 1;
      
      .greeting {
        color: rgba(255, 255, 255, 0.9);
        font-size: 28rpx;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .username {
        color: white;
        font-size: 48rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 28rpx;
      }
    }
    
    .user-avatar {
      position: relative;
      
      .avatar-img {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        border: 6rpx solid rgba(255, 255, 255, 0.2);
      }
      
      .online-status {
        position: absolute;
        bottom: 8rpx;
        right: 8rpx;
        width: 24rpx;
        height: 24rpx;
        background: #4ade80;
        border-radius: 50%;
        border: 4rpx solid white;
      }
    }
  }
}

.login-prompt {
  margin-bottom: 48rpx;
  
  .prompt-card {
    background: white;
    border-radius: 24rpx;
    padding: 48rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid #fbbf24;
    
    .prompt-content {
      text-align: center;
      
      .prompt-icon {
        font-size: 120rpx;
        display: block;
        margin-bottom: 32rpx;
      }
      
      .prompt-title {
        font-size: 48rpx;
        font-weight: bold;
        color: #1f2937;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .prompt-subtitle {
        font-size: 32rpx;
        color: #6b7280;
        display: block;
        margin-bottom: 48rpx;
      }
      
      .login-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 16rpx;
        padding: 24rpx 48rpx;
        font-size: 32rpx;
        font-weight: 500;
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

.stats-section {
  margin-bottom: 48rpx;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .stat-card {
      background: white;
      border-radius: 16rpx;
      padding: 32rpx;
      text-align: center;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      
      &:active {
        transform: translateY(-4rpx);
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
      }
      
      .stat-icon {
        font-size: 64rpx;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .stat-number {
        font-size: 56rpx;
        font-weight: bold;
        color: #1f2937;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: #6b7280;
      }
    }
  }
}

.actions-section {
  margin-bottom: 48rpx;
  
  .section-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .action-item {
      background: white;
      border-radius: 16rpx;
      padding: 32rpx;
      text-align: center;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      
      &:active {
        transform: translateY(-4rpx);
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
      }
      
      .action-icon {
        font-size: 64rpx;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .action-label {
        font-size: 28rpx;
        color: #1f2937;
        font-weight: 500;
      }
    }
  }
}

.activities-section, .features-section {
  .section-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .activity-list, .feature-list {
    background: white;
    border-radius: 16rpx;
    padding: 32rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    
    .activity-item, .feature-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f3f4f6;
      
      &:last-child {
        border-bottom: none;
      }
      
      .activity-icon, .feature-icon {
        font-size: 64rpx;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .activity-content, .feature-content {
        flex: 1;
        
        .activity-text, .feature-title {
          font-size: 32rpx;
          color: #1f2937;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .activity-time, .feature-desc {
          font-size: 24rpx;
          color: #6b7280;
        }
      }
    }
    
    .activity-empty {
      text-align: center;
      padding: 64rpx;
      
      .empty-text {
        font-size: 32rpx;
        color: #6b7280;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .empty-hint {
        font-size: 28rpx;
        color: #9ca3af;
      }
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .stats-grid, .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
