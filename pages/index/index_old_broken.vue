<template>
  <view class="index-container">
    <!-- 顶部欢迎区域 -->
    <view class="header-section fade-in">
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
    <view class="login-prompt slide-up" v-if="!isLoggedIn">
      <ModernCard variant="warning" shadow="md" class="prompt-card">
        <view class="prompt-content">
          <text class="prompt-icon">🔐</text>
          <text class="prompt-title">需要登录</text>
          <text class="prompt-subtitle">登录后可使用完整功能</text>
          
          <button class="login-btn" @tap="goToLogin">
            立即登录
          </button>
        </view>
      </ModernCard>
    </view>
    
    <!-- 统计卡片区域 -->
    <view class="stats-section slide-up" v-if="isLoggedIn">
      <view class="stats-grid">
        <ModernCard variant="primary" shadow="lg" hoverable clickable @tap="goToCheckin" class="stat-card">
          <view class="stat-content">
            <text class="stat-icon">📅</text>
            <text class="stat-number">{{ stats.checkinDays }}</text>
            <text class="stat-label">连续打卡</text>
          </view>
        </ModernCard>
        
        <ModernCard variant="secondary" shadow="lg" hoverable clickable @tap="goToStudyGroups" class="stat-card">
          <view class="stat-content">
            <text class="stat-icon">👥</text>
            <text class="stat-number">{{ stats.joinedGroups }}</text>
            <text class="stat-label">加入群组</text>
          </view>
        </ModernCard>
        
        <ModernCard variant="success" shadow="lg" hoverable class="stat-card">
          <view class="stat-content">
            <text class="stat-icon">🏆</text>
            <text class="stat-number">{{ stats.achievements }}</text>
            <text class="stat-label">获得成就</text>
          </view>
        </ModernCard>
        
        <ModernCard variant="warning" shadow="lg" hoverable class="stat-card">
          <view class="stat-content">
            <text class="stat-icon">⚡</text>
            <text class="stat-number">{{ stats.studyHours }}</text>
            <text class="stat-label">学习时长</text>
          </view>
        </ModernCard>
      </view>
    </view>
    
    <!-- 快速操作区域 -->
    <view class="actions-section scale-in">
      <ModernCard title="快速操作" shadow="md" class="actions-card">
        <view class="actions-grid">
          <view class="action-item" @tap="handleActionTap('checkin')">
            <view class="action-icon primary">📝</view>
            <text class="action-label">今日打卡</text>
          </view>
          
          <view class="action-item" @tap="handleActionTap('groupMatch')">
            <view class="action-icon secondary">🤝</view>
            <text class="action-label">匹配伙伴</text>
          </view>
          
          <view class="action-item" @tap="handleActionTap('aiChat')">
            <view class="action-icon success">🤖</view>
            <text class="action-label">AI助手</text>
          </view>
          
          <view class="action-item" @tap="handleActionTap('studyGroups')">
            <view class="action-icon warning">📚</view>
            <text class="action-label">学习群组</text>
          </view>
        </view>
      </ModernCard>
    </view>
    
    <!-- 最近活动区域 -->
    <view class="activities-section fade-in" v-if="isLoggedIn">
      <ModernCard title="最近活动" shadow="md" class="activities-card">
        <view class="activity-list">
          <view class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
            <view class="activity-icon" :class="activity.type">
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
      </ModernCard>
    </view>
    
    <!-- 功能介绍区域（未登录时显示） -->
    <view class="features-section fade-in" v-if="!isLoggedIn">
      <ModernCard title="功能介绍" shadow="md" class="features-card">
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
      </ModernCard>
    </view>        </view>
      </ModernCard>
    </view>
    
    <!-- 功能介绍区域（未登录时显示） -->
    <view class="features-section fade-in" v-if="!isLoggedIn">
      <ModernCard title="功能介绍" shadow="md" class="features-card">
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
      </ModernCard>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import { notify } from '../../utils/notification.js'

export default {
  name: 'IndexPage',
  components: {
    ModernCard,
    LoadingSpinner
  },
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
  onLoad() {
    console.log('首页加载')
    this.initPage()
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
        const token = uni.getStorageSync('token')
        if (token) {
          this.isLoggedIn = true
          this.hasRedirected = false
          console.log('用户已登录')
        } else if (!this.hasRedirected) {
          this.hasRedirected = true
          console.log('用户未登录，跳转到登录页')
          uni.reLaunch({
            url: '/pages/login/login',
            fail: (err) => {
              console.error('跳转登录页失败:', err)
              this.notifyError('登录跳转失败', '请手动进入登录页面')
            }
          })
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.isLoggedIn = false
      }
    },
    
    // 安全的登录状态检查，不会影响tabBar跳转
    checkLoginStatusSafe() {
      try {
        const token = uni.getStorageSync('token')
        if (token) {
          this.isLoggedIn = true
          this.hasRedirected = false
          console.log('用户已登录')
        } else {
          // 显示登录提示而不是强制跳转
          this.showLoginPrompt()
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
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
      // 模拟加载用户数据
      try {
        // 这里可以调用 API 获取真实数据
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
@import '../../styles/variables.scss';

.index-container {
  min-height: 100vh;
  background: $gray-50;
  padding: $space-4;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: $space-4;
  
  .loading-text {
    color: $gray-600;
    font-size: $text-base;
  }
}

.login-prompt {
  margin-bottom: $space-6;
  
  .prompt-card {
    .prompt-content {
      text-align: center;
      
      .prompt-icon {
        font-size: $text-6xl;
        display: block;
        margin-bottom: $space-4;
      }
      
      .prompt-title {
        font-size: $text-xl;
        font-weight: $font-semibold;
        color: $gray-800;
        display: block;
        margin-bottom: $space-2;
      }
      
      .prompt-subtitle {
        font-size: $text-base;
        color: $gray-600;
        display: block;
        margin-bottom: $space-6;
      }
      
      .login-btn {
        background: $gradient-primary;
        color: white;
        border: none;
        border-radius: $radius-lg;
        padding: $space-3 $space-6;
        font-size: $text-base;
        font-weight: $font-medium;
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

.features-section {
  .features-card {
    .feature-list {
      .feature-item {
        display: flex;
        align-items: center;
        padding: $space-4 0;
        border-bottom: 1px solid $gray-200;
        
        &:last-child {
          border-bottom: none;
        }
        
        .feature-icon {
          font-size: $text-3xl;
          margin-right: $space-4;
          flex-shrink: 0;
        }
        
        .feature-content {
          flex: 1;
          
          .feature-title {
            font-size: $text-base;
            font-weight: $font-semibold;
            color: $gray-800;
            display: block;
            margin-bottom: $space-1;
          }
          
          .feature-desc {
            font-size: $text-sm;
            color: $gray-600;
          }
        }
      }
    }
  }
}

.header-section {
  margin-bottom: $space-6;
  
  .welcome-banner {
    background: $gradient-primary;
    border-radius: $radius-xl;
    padding: $space-6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: $shadow-primary;
    
    .welcome-content {
      flex: 1;
      
      .greeting {
        color: rgba(255, 255, 255, 0.9);
        font-size: $text-sm;
        font-weight: $font-normal;
        display: block;
        margin-bottom: $space-1;
      }
      
      .username {
        color: $white;
        font-size: $text-2xl;
        font-weight: $font-bold;
        display: block;
        margin-bottom: $space-1;
      }
      
      .subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: $text-sm;
        font-weight: $font-normal;
      }
    }
    
    .user-avatar {
      position: relative;
      
      .avatar-img {
        width: 80rpx;
        height: 80rpx;
        border-radius: $radius-full;
        border: 3px solid rgba(255, 255, 255, 0.3);
      }
      
      .online-status {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20rpx;
        height: 20rpx;
        background: $success;
        border-radius: $radius-full;
        border: 2px solid $white;
      }
    }
  }
}

.stats-section {
  margin-bottom: $space-6;
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $space-4;
    
    .stat-card {
      text-align: center;
      
      .stat-content {
        .stat-icon {
          font-size: $text-3xl;
          display: block;
          margin-bottom: $space-2;
        }
        
        .stat-number {
          font-size: $text-2xl;
          font-weight: $font-bold;
          color: $white;
          display: block;
          margin-bottom: $space-1;
        }
        
        .stat-label {
          font-size: $text-sm;
          color: rgba(255, 255, 255, 0.9);
          font-weight: $font-medium;
        }
      }
    }
  }
}

.actions-section {
  margin-bottom: $space-6;
  
  .actions-card {
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $space-4;
      
      .action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: $space-4;
        border-radius: $radius-md;
        transition: all $transition-normal;
        cursor: pointer;
        
        &:hover {
          background: $gray-50;
          transform: translateY(-2rpx);
        }
        
        .action-icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: $radius-full;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: $text-2xl;
          margin-bottom: $space-3;
          
          &.primary { background: $gradient-primary; }
          &.secondary { background: $gradient-secondary; }
          &.success { background: $gradient-success; }
          &.warning { background: $gradient-warm; }
        }
        
        .action-label {
          font-size: $text-sm;
          font-weight: $font-medium;
          color: $gray-700;
          text-align: center;
        }
      }
    }
  }
}

.activities-section {
  .activities-card {
    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        padding: $space-3 0;
        border-bottom: 1px solid $gray-200;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          width: 64rpx;
          height: 64rpx;
          border-radius: $radius-full;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: $space-3;
          font-size: $text-xl;
          
          &.checkin { background: $success-light; }
          &.group { background: $info-light; }
          &.achievement { background: $warning-light; }
        }
        
        .activity-content {
          flex: 1;
          
          .activity-text {
            font-size: $text-base;
            color: $gray-800;
            font-weight: $font-medium;
            display: block;
            margin-bottom: $space-1;
          }
          
          .activity-time {
            font-size: $text-xs;
            color: $gray-500;
          }
        }
      }
      
      .activity-empty {
        text-align: center;
        padding: $space-8 $space-4;
        
        .empty-text {
          font-size: $text-base;
          color: $gray-500;
          display: block;
          margin-bottom: $space-2;
        }
        
        .empty-hint {
          font-size: $text-sm;
          color: $gray-400;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .index-container {
    padding: $space-3;
  }
  
  .header-section {
    .welcome-banner {
      padding: $space-4;
      
      .welcome-content {
        .username {
          font-size: $text-xl;
        }
      }
      
      .user-avatar {
        .avatar-img {
          width: 60rpx;
          height: 60rpx;
        }
      }
    }
  }
  
  .stats-grid {
    gap: $space-3;
    
    .stat-card {
      .stat-content {
        .stat-icon {
          font-size: $text-2xl;
        }
        
        .stat-number {
          font-size: $text-xl;
        }
      }
    }
  }
  
  .actions-grid {
    gap: $space-3;
    
    .action-item {
      padding: $space-3;
      
      .action-icon {
        width: 60rpx;
        height: 60rpx;
        font-size: $text-xl;
      }
    }
  }
}
</style>