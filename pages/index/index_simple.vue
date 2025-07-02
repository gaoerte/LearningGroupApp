<template>
  <view class="index-container">
    <!-- 欢迎区域 -->
    <view class="header-section">
      <view class="welcome-banner">
        <view class="welcome-content">
          <text class="greeting">{{ greeting }}</text>
          <text class="username">{{ userName }}</text>
          <text class="subtitle">{{ subtitle }}</text>
        </view>
        <view class="user-avatar">
          <image class="avatar-img" :src="avatarUrl" mode="aspectFill" />
          <view class="online-status" v-if="hasToken"></view>
        </view>
      </view>
    </view>
    
    <!-- 登录提示 -->
    <view class="login-prompt" v-if="!hasToken">
      <view class="prompt-card">
        <text class="prompt-icon">🔐</text>
        <text class="prompt-title">需要登录</text>
        <text class="prompt-subtitle">登录后享受完整功能</text>
        <button class="login-btn" @tap="goToLogin">立即登录</button>
      </view>
    </view>
    
    <!-- 功能区域 -->
    <view class="actions-section">
      <text class="section-title">功能菜单</text>
      <view class="actions-grid">
        <view class="action-item" @tap="handleAction('checkin')">
          <text class="action-icon">📝</text>
          <text class="action-label">学习打卡</text>
        </view>
        <view class="action-item" @tap="handleAction('groups')">
          <text class="action-icon">👥</text>
          <text class="action-label">学习群组</text>
        </view>
        <view class="action-item" @tap="handleAction('ai')">
          <text class="action-icon">🤖</text>
          <text class="action-label">AI助手</text>
        </view>
        <view class="action-item" @tap="handleAction('profile')">
          <text class="action-icon">👤</text>
          <text class="action-label">个人中心</text>
        </view>
      </view>
    </view>
    
    <!-- 状态信息 -->
    <view class="status-section" v-if="hasToken">
      <text class="section-title">我的数据</text>
      <view class="status-grid">
        <view class="status-item">
          <text class="status-number">{{ stats.days }}</text>
          <text class="status-label">连续打卡</text>
        </view>
        <view class="status-item">
          <text class="status-number">{{ stats.groups }}</text>
          <text class="status-label">加入群组</text>
        </view>
      </view>
    </view>
    
    <!-- 调试信息 -->
    <view class="debug-section" v-if="showDebug">
      <text class="debug-title">调试信息</text>
      <text class="debug-text">Token: {{ hasToken ? '已设置' : '未设置' }}</text>
      <text class="debug-text">页面加载: {{ loadTime }}</text>
      <button class="debug-btn" @tap="toggleToken">{{ hasToken ? '清除Token' : '设置Token' }}</button>
      <button class="debug-btn" @tap="goToTest">测试页面</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      hasToken: false,
      showDebug: true,
      loadTime: '',
      stats: {
        days: 0,
        groups: 0
      }
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
    },
    userName() {
      return this.hasToken ? '学习达人' : '访客'
    },
    subtitle() {
      return this.hasToken ? '今天也要继续加油哦！' : '登录后开始学习之旅'
    },
    avatarUrl() {
      return '/static/default-avatar.png'
    }
  },
  onLoad() {
    console.log('[首页] onLoad 开始')
    this.loadTime = new Date().toLocaleTimeString()
    this.initPage()
  },
  onShow() {
    console.log('[首页] onShow 开始')
    this.checkTokenStatus()
  },
  methods: {
    initPage() {
      try {
        this.checkTokenStatus()
        this.loadUserData()
        console.log('[首页] 初始化完成')
      } catch (error) {
        console.error('[首页] 初始化失败:', error)
      }
    },
    
    checkTokenStatus() {
      try {
        const token = uni.getStorageSync('token')
        this.hasToken = !!token
        console.log('[首页] Token状态:', this.hasToken ? '存在' : '不存在')
        
        if (this.hasToken) {
          this.loadStats()
        }
      } catch (error) {
        console.error('[首页] 检查Token失败:', error)
        this.hasToken = false
      }
    },
    
    loadUserData() {
      // 模拟加载用户数据
      console.log('[首页] 加载用户数据')
    },
    
    loadStats() {
      try {
        const streak = uni.getStorageSync('checkinStreak') || 0
        this.stats.days = streak
        this.stats.groups = 2
        console.log('[首页] 统计数据加载:', this.stats)
      } catch (error) {
        console.error('[首页] 加载统计数据失败:', error)
      }
    },
    
    handleAction(action) {
      console.log('[首页] 处理操作:', action)
      
      if (!this.hasToken && action !== 'ai') {
        this.promptLogin()
        return
      }
      
      switch (action) {
        case 'checkin':
          this.goToCheckin()
          break
        case 'groups':
          this.goToGroups()
          break
        case 'ai':
          this.goToAI()
          break
        case 'profile':
          this.goToProfile()
          break
        default:
          console.warn('[首页] 未知操作:', action)
      }
    },
    
    promptLogin() {
      uni.showModal({
        title: '需要登录',
        content: '该功能需要登录后使用，是否立即登录？',
        confirmText: '立即登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.goToLogin()
          }
        }
      })
    },
    
    goToLogin() {
      console.log('[首页] 跳转到登录页')
      uni.reLaunch({
        url: '/pages/login/login',
        success: () => {
          console.log('[首页] 跳转登录页成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转登录页失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToCheckin() {
      console.log('[首页] 跳转到打卡页')
      uni.navigateTo({
        url: '/pages/checkin/checkin',
        success: () => {
          console.log('[首页] 跳转打卡页成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转打卡页失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToGroups() {
      console.log('[首页] 跳转到群组页')
      uni.switchTab({
        url: '/pages/studyGroups/studyGroups',
        success: () => {
          console.log('[首页] 跳转群组页成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转群组页失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToAI() {
      console.log('[首页] 跳转到AI页')
      uni.navigateTo({
        url: '/pages/aichat/aichat',
        success: () => {
          console.log('[首页] 跳转AI页成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转AI页失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToProfile() {
      console.log('[首页] 跳转到个人中心')
      uni.switchTab({
        url: '/pages/personalCenter/personalCenter',
        success: () => {
          console.log('[首页] 跳转个人中心成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转个人中心失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToTest() {
      console.log('[首页] 跳转到测试页')
      uni.navigateTo({
        url: '/pages/test/navigationTest',
        success: () => {
          console.log('[首页] 跳转测试页成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转测试页失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    toggleToken() {
      try {
        if (this.hasToken) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('user_id')
          uni.removeStorageSync('openid')
          console.log('[首页] Token已清除')
        } else {
          const token = 'debug_token_' + Date.now()
          uni.setStorageSync('token', token)
          uni.setStorageSync('user_id', 'debug_user')
          uni.setStorageSync('checkinStreak', 5)
          console.log('[首页] Token已设置:', token)
        }
        this.checkTokenStatus()
        uni.showToast({
          title: this.hasToken ? 'Token已设置' : 'Token已清除',
          icon: 'success'
        })
      } catch (error) {
        console.error('[首页] Token操作失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background: #f5f7fa;
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
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid #fbbf24;
    
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
      width: 100%;
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}

.actions-section, .status-section {
  margin-bottom: 48rpx;
  
  .section-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 24rpx;
  }
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

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .status-item {
    background: white;
    border-radius: 16rpx;
    padding: 32rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    
    .status-number {
      font-size: 56rpx;
      font-weight: bold;
      color: #667eea;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .status-label {
      font-size: 24rpx;
      color: #6b7280;
    }
  }
}

.debug-section {
  background: #f3f4f6;
  border-radius: 16rpx;
  padding: 32rpx;
  border: 2rpx dashed #9ca3af;
  
  .debug-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #374151;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .debug-text {
    font-size: 24rpx;
    color: #6b7280;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .debug-btn {
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 8rpx;
    padding: 16rpx 24rpx;
    font-size: 24rpx;
    margin: 8rpx 8rpx 0 0;
    
    &:active {
      opacity: 0.8;
    }
  }
}
</style>
