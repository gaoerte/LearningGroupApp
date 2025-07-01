<template>
  <view class="personal-center">
    <!-- 用户信息头部 - 简化版 -->
    <view class="profile-header">
      <view class="profile-card">
        <view class="avatar-section">
          <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
          <view class="user-info">
            <text class="username">{{ userInfo.name || '未设置昵称' }}</text>
            <text class="user-level">{{ userInfo.level || 'LV.1 学习新手' }}</text>
          </view>
          <text class="edit-btn" @tap="editProfile">编辑</text>
        </view>
        
        <view class="stats-section">
          <view class="stat-item">
            <text class="stat-number">{{ userInfo.studyDays || 0 }}</text>
            <text class="stat-label">天</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ userInfo.studyHours || 0 }}</text>
            <text class="stat-label">小时</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ userInfo.achievements || 0 }}</text>
            <text class="stat-label">成就</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @tap="viewCheckinHistory">
        <view class="action-icon">📅</view>
        <text class="action-text">打卡记录</text>
      </view>
      <view class="action-item" @tap="viewMyGroups">
        <view class="action-icon">👥</view>
        <text class="action-text">我的群组</text>
      </view>
      <view class="action-item" @tap="viewStudyReport">
        <view class="action-icon">📊</view>
        <text class="action-text">学习统计</text>
      </view>
      <view class="action-item" @tap="openSettings">
        <view class="action-icon">⚙️</view>
        <text class="action-text">设置</text>
      </view>
    </view>
    
    <!-- 主要功能菜单 - 精简版 -->
    <view class="menu-section">
      <view class="menu-item" @tap="viewAchievements">
        <view class="menu-left">
          <view class="menu-icon">🏆</view>
          <text class="menu-text">我的成就</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @tap="openHelp">
        <view class="menu-left">
          <view class="menu-icon">❓</view>
          <text class="menu-text">帮助中心</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @tap="aboutApp">
        <view class="menu-left">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">关于应用</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section">
      <text class="logout-btn" @tap="logout">退出登录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PersonalCenterPage',
  data() {
    return {
      userInfo: {
        name: '小明',
        level: 'LV.5 学习达人',
        avatar: '',
        studyDays: 128,
        studyHours: 256,
        achievements: 18
      }
    }
  },
  onLoad() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      // 加载用户信息
      try {
        console.log('加载用户信息')
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    },
    
    editProfile() {
      uni.navigateTo({
        url: '/pages/personalCenter/editProfile'
      })
    },
    
    viewAchievements() {
      uni.showToast({
        title: '成就系统开发中',
        icon: 'none'
      })
    },
    
    viewStudyReport() {
      uni.showToast({
        title: '学习报告开发中',
        icon: 'none'
      })
    },
    
    viewCheckinHistory() {
      uni.navigateTo({
        url: '/pages/checkin/checkin'
      })
    },
    
    viewMyGroups() {
      uni.navigateTo({
        url: '/pages/studyGroups/studyGroups'
      })
    },
    
    openSettings() {
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
    },
    
    openHelp() {
      uni.showToast({
        title: '帮助中心开发中',
        icon: 'none'
      })
    },
    
    aboutApp() {
      uni.showModal({
        title: '关于应用',
        content: '学习群组 App v1.0\n专为学习交流打造的社交平台',
        showCancel: false
      })
    },
    
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.clearStorageSync()
            uni.reLaunch({
              url: '/pages/login/login'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.personal-center {
  min-height: 100vh;
  background: #f9fafb;
  padding: 32rpx;
}

.profile-header {
  margin-bottom: 48rpx;
  
  .profile-card {
    background: white;
    border-radius: 32rpx;
    padding: 48rpx 32rpx;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    
    .avatar-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48rpx;
      
      .avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 60rpx;
        margin-right: 24rpx;
      }
      
      .user-info {
        flex: 1;
        
        .username {
          font-size: 42rpx;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8rpx;
        }
        
        .user-level {
          font-size: 28rpx;
          color: #6b7280;
        }
      }
      
      .edit-btn {
        background: #0ea5e9;
        color: white;
        padding: 16rpx 32rpx;
        border-radius: 24rpx;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
    
    .stats-section {
      display: flex;
      justify-content: space-around;
      border-top: 1px solid #e5e7eb;
      padding-top: 32rpx;
      
      .stat-item {
        text-align: center;
        
        .stat-number {
          font-size: 48rpx;
          font-weight: 700;
          color: #0ea5e9;
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
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 48rpx;
  
  .action-item {
    flex: 1;
    text-align: center;
    background: white;
    border-radius: 24rpx;
    padding: 32rpx 16rpx;
    margin: 0 8rpx;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    
    .action-icon {
      font-size: 48rpx;
      margin-bottom: 16rpx;
    }
    
    .action-text {
      font-size: 24rpx;
      color: #4b5563;
      font-weight: 500;
    }
  }
}

.menu-section {
  background: white;
  border-radius: 24rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    .menu-left {
      display: flex;
      align-items: center;
      
      .menu-icon {
        font-size: 40rpx;
        margin-right: 24rpx;
      }
      
      .menu-text {
        font-size: 32rpx;
        color: #374151;
        font-weight: 500;
      }
    }
    
    .menu-arrow {
      font-size: 36rpx;
      color: #9ca3af;
    }
  }
}

.logout-section {
  text-align: center;
  
  .logout-btn {
    color: #ef4444;
    font-size: 32rpx;
    font-weight: 500;
    background: white;
    padding: 24rpx 64rpx;
    border-radius: 24rpx;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }
}
</style>
