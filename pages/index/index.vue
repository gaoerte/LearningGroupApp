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
      <text class="debug-title">🔧 开发调试</text>
      <text class="debug-text">Token: {{ hasToken ? '已设置' : '未设置' }}</text>
      <text class="debug-text">页面加载: {{ loadTime }}</text>
      
      <view class="debug-buttons">
        <button class="debug-btn primary" @tap="goToSupabaseTest">
          🔌 测试 Supabase 连接
        </button>
        <button class="debug-btn success" @tap="goToSupabaseStableTest">
          🛡️ 稳定版连接测试
        </button>
        <button class="debug-btn secondary" @tap="goToSupabaseDemo">
          🔗 Supabase 完整演示
        </button>
        <button class="debug-btn warning" @tap="goToCheckinSimple">
          ✅ 打卡功能测试
        </button>
        <button class="debug-btn info" @tap="goToTestGuide">
          📋 完整测试指南
        </button>
        <button class="debug-btn success" @tap="goToChat">
          💬 聊天功能测试
        </button>
        <button class="debug-btn primary" @tap="goToGroupMatch">
          🎯 加入小组测试
        </button>
        <button class="debug-btn secondary" @tap="goToTest">
          🧭 页面跳转测试
        </button>
        <button class="debug-btn danger" @tap="toggleToken">
          {{ hasToken ? '🔑 清除Token' : '🔑 设置Token' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { StorageManager } from '../../utils/storage.js';

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
      if (this.hasToken) {
        try {
          const userInfo = StorageManager.getUserInfo();
          return userInfo ? userInfo.nickname : '学习达人';
        } catch (error) {
          console.error('[首页] 获取用户名失败:', error);
          return '学习达人';
        }
      }
      return '访客';
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
        // 使用 StorageManager 正确检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn();
        const token = StorageManager.getToken();
        
        this.hasToken = isLoggedIn && !!token;
        console.log('[首页] Token状态:', this.hasToken ? '存在' : '不存在');
        
        if (this.hasToken) {
          console.log('[首页] Token值:', token);
          // 加载用户信息
          const userInfo = StorageManager.getUserInfo();
          if (userInfo) {
            console.log('[首页] 用户信息:', userInfo);
          }
          this.loadStats();
        }
      } catch (error) {
        console.error('[首页] 检查Token失败:', error);
        this.hasToken = false;
      }
    },
    
    loadUserData() {
      try {
        console.log('[首页] 加载用户数据');
        
        if (this.hasToken) {
          const userInfo = StorageManager.getUserInfo();
          if (userInfo) {
            console.log('[首页] 用户信息加载成功:', userInfo.nickname);
            // 可以在这里更新用户相关的数据
          }
        }
      } catch (error) {
        console.error('[首页] 加载用户数据失败:', error);
      }
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
    
    goToSupabaseStableTest() {
      console.log('[首页] 跳转到系统测试中心')
      uni.navigateTo({
        url: '/pages/test/index',
        success: () => {
          console.log('[首页] 成功跳转到系统测试中心')
        },
        fail: (error) => {
          console.error('[首页] 跳转到测试中心失败:', error)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToSupabaseTest() {
      console.log('[首页] 跳转到系统测试中心')
      uni.navigateTo({
        url: '/pages/test/index',
        success: () => {
          console.log('[首页] 成功跳转到系统测试中心')
        },
        fail: (error) => {
          console.error('[首页] 跳转到测试中心失败:', error)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'error'
          })
        }
      })
    },
    
    goToSupabaseDemo() {
      console.log('[首页] 跳转到系统测试中心')
      uni.navigateTo({
        url: '/pages/test/index',
        success: () => {
          console.log('[首页] 成功跳转到系统测试中心')
        },
        fail: (error) => {
          console.error('[首页] 跳转到测试中心失败:', error)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'error'
          })
        }
      })
    },
    
    goToTest() {
      console.log('[首页] 跳转到系统测试中心')
      uni.navigateTo({
        url: '/pages/test/index',
        success: () => {
          console.log('[首页] 跳转到系统测试中心成功')
        },
        fail: (err) => {
          console.error('[首页] 跳转到测试中心失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToCheckinSimple() {
      console.log('[首页] 跳转到打卡功能测试页面')
      uni.navigateTo({
        url: '/pages/checkin/checkin-simple',
        success: () => {
          console.log('[首页] 成功跳转到打卡测试页面')
        },
        fail: (error) => {
          console.error('[首页] 跳转到打卡测试失败:', error)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'error'
          })
        }
      })
    },

    toggleToken() {
      try {
        if (this.hasToken) {
          // 使用 StorageManager 清除登录信息
          const cleared = StorageManager.clearAll();
          console.log('[首页] 登录信息已清除:', cleared);
        } else {
          // 创建测试登录数据
          const mockLoginData = {
            user: {
              id: 'debug_user_123',
              openid: 'debug_openid_123',
              nickname: '调试用户',
              avatar_url: '',
              status: 'active'
            },
            openid: 'debug_openid_123',
            token: `debug_token_${Date.now()}`,
            login_time: new Date().toISOString()
          };
          
          const saved = StorageManager.saveLoginData(mockLoginData);
          console.log('[首页] 调试Token已设置:', saved);
        }
        
        this.checkTokenStatus();
        uni.showToast({
          title: this.hasToken ? 'Token已设置' : 'Token已清除',
          icon: 'success'
        });
      } catch (error) {
        console.error('[首页] Token操作失败:', error);
      }
    },
    
    goToTestGuide() {
      console.log('[首页] 跳转到测试指南')
      uni.navigateTo({
        url: '/pages/test-guide/test-guide',
        success: () => {
          console.log('[首页] 跳转测试指南成功')
        },
        fail: (error) => {
          console.error('[首页] 跳转测试指南失败:', error)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToChat() {
      console.log('[首页] 跳转到聊天测试页面')
      uni.navigateTo({
        url: '/pages/chat-test/chat-test',
        success: () => {
          console.log('[首页] 跳转聊天测试页面成功')
        },
        fail: (error) => {
          console.error('[首页] 跳转聊天测试页面失败:', error)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToGroupMatch() {
      console.log('[首页] 跳转到加入小组测试页面')
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch',
        success: () => {
          console.log('[首页] 跳转加入小组测试页面成功')
          uni.showToast({
            title: '💡 选择兴趣领域，然后点击"加入小组"测试功能',
            icon: 'none',
            duration: 3000
          })
        },
        fail: (error) => {
          console.error('[首页] 跳转加入小组测试页面失败:', error)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
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
    margin-bottom: 20rpx;
  }
  
  .debug-text {
    font-size: 26rpx;
    color: #6b7280;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .debug-buttons {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 24rpx;
  }
  
  .debug-btn {
    border: none;
    border-radius: 12rpx;
    padding: 24rpx 32rpx;
    font-size: 28rpx;
    font-weight: bold;
    text-align: center;
    
    &.primary {
      background: #3b82f6;
      color: white;
    }
    
    &.success {
      background: #00b894;
      color: white;
    }
    
    &.secondary {
      background: #10b981;
      color: white;
    }
    
    &.danger {
      background: #ef4444;
      color: white;
    }
    
    &.info {
      background: #667eea;
      color: white;
    }
    
    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
  }
}
</style>
