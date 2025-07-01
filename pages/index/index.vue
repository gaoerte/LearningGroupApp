<template>
  <view class="index-container" v-if="isLoggedIn">
    <!-- 顶部欢迎区域 -->
    <view class="header-section fade-in">
      <view class="welcome-banner">
        <view class="welcome-content">
          <text class="greeting">{{ greeting }}</text>
          <text class="username">{{ userInfo.name || '学习达人' }}</text>
          <text class="subtitle">今天也要继续加油哦！</text>
        </view>
        <view class="user-avatar">
          <image class="avatar-img" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="online-status"></view>
        </view>
      </view>
    </view>
    
    <!-- 统计卡片区域 -->
    <view class="stats-section slide-up">
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
          <view class="action-item" @tap="goToCheckin">
            <view class="action-icon primary">📝</view>
            <text class="action-label">今日打卡</text>
          </view>
          
          <view class="action-item" @tap="goToGroupMatch">
            <view class="action-icon secondary">🤝</view>
            <text class="action-label">匹配伙伴</text>
          </view>
          
          <view class="action-item" @tap="goToAIChat">
            <view class="action-icon success">🤖</view>
            <text class="action-label">AI助手</text>
          </view>
          
          <view class="action-item" @tap="goToStudyGroups">
            <view class="action-icon warning">📚</view>
            <text class="action-label">学习群组</text>
          </view>
        </view>
      </ModernCard>
    </view>
    
    <!-- 最近活动区域 -->
    <view class="activities-section fade-in">
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
  </view>
  
  <!-- 加载状态 -->
  <view v-else class="loading-container">
    <LoadingSpinner size="large" />
    <text class="loading-text">正在检测登录状态...</text>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

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
    this.checkLoginStatus()
    this.loadUserData()
  },
  onShow() {
    this.checkLoginStatus()
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      if (token) {
        this.isLoggedIn = true
        this.hasRedirected = false
      } else if (!this.hasRedirected) {
        this.hasRedirected = true
        uni.redirectTo({
          url: '/pages/login/login'
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

    goToCheckin() {
      uni.navigateTo({ url: '/pages/checkin/checkin' })
    },
    
    goToGroupMatch() {
      uni.navigateTo({ url: '/pages/groupMatch/groupMatch' })
    },
    
    goToAIChat() {
      uni.navigateTo({ url: '/pages/aichat/aichat' })
    },
    
    goToStudyGroups() {
      uni.navigateTo({ url: '/pages/studyGroups/studyGroups' })
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