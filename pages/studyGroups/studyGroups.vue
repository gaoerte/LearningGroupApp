<template>
  <view class="groups-container">
    <!-- 顶部欢迎区域 -->
    <view class="welcome-section">
      <view class="welcome-content">
        <text class="welcome-title">学习群组</text>
        <text class="welcome-subtitle">加入学习群组，与志同道合的伙伴一起进步</text>
      </view>
    </view>

    <!-- 三个主要功能按钮 -->
    <view class="main-actions">
      <ModernCard 
        class="action-card my-groups-card"
        :clickable="true"
        @tap="goToMyGroups"
      >
        <view class="action-content">
          <view class="action-icon">📚</view>
          <view class="action-info">
            <text class="action-title">我的群组</text>
            <text class="action-desc">查看已加入的学习群组</text>
            <text class="action-count">{{ joinedGroupsCount }}个群组</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>

      <ModernCard 
        class="action-card recommend-card"
        :clickable="true"
        @tap="goToRecommendGroups"
      >
        <view class="action-content">
          <view class="action-icon">🔍</view>
          <view class="action-info">
            <text class="action-title">推荐群组</text>
            <text class="action-desc">发现适合你的学习群组</text>
            <text class="action-count">精准推荐</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>

      <ModernCard 
        class="action-card create-card"
        :clickable="true"
        @tap="showCreateGroupTip"
      >
        <view class="action-content">
          <view class="action-icon">➕</view>
          <view class="action-info">
            <text class="action-title">创建群组</text>
            <text class="action-desc">创建属于自己的学习群组</text>
            <text class="action-count">敬请期待</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>
    </view>

    <!-- 快速统计 -->
    <view class="stats-section">
      <view class="stats-card">
        <text class="stats-number">{{ totalMembers }}</text>
        <text class="stats-label">群组成员</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ activeGroups }}</text>
        <text class="stats-label">活跃群组</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ todayMessages }}</text>
        <text class="stats-label">今日消息</text>
      </view>
    </view>

    <!-- Loading状态 -->
    <LoadingSpinner v-if="isLoading" text="加载中..." />

    <!-- 错误状态 -->
    <view v-if="error" class="error-state">
      <text class="error-text">{{ error }}</text>
      <ModernButton @tap="retryLoad" variant="outline" size="sm">
        重试
      </ModernButton>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import { GroupAPI } from '@/api/groupAPI.js'
import { StorageManager } from '@/utils/storage.js'

export default {
  components: {
    ModernCard,
    ModernButton,
    LoadingSpinner
  },
  data() {
    return {
      isLoading: false,
      error: null,
      currentUserId: null,
      joinedGroupsCount: 0,
      totalMembers: 0,
      activeGroups: 0,
      todayMessages: 0
    }
  },
  methods: {
    onLoad() {
      console.log('[群组主页] onLoad 开始')
      this.initPage()
    },
    onShow() {
      console.log('[群组主页] onShow 开始')
      this.loadStats()
    },
    initPage() {
      try {
        console.log('[群组主页] initPage 开始执行')
        
        // 检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn()
        if (!isLoggedIn) {
          console.log('[群组主页] 用户未登录，跳转到登录页')
          uni.reLaunch({
            url: '/pages/login/login'
          })
          return
        }
        
        // 获取用户信息
        const userInfo = StorageManager.getUserInfo()
        this.currentUserId = userInfo ? userInfo.id : null
        
        if (!this.currentUserId) {
          throw new Error('无法获取用户ID')
        }
        
        console.log('[群组主页] 初始化完成，用户ID:', this.currentUserId)
        
        // 加载统计数据
        this.loadStats()
        
      } catch (error) {
        console.error('[群组主页] 初始化失败:', error)
        this.error = error.message
        uni.showToast({
          title: '页面初始化失败',
          icon: 'none'
        })
      }
    },
    
    async loadStats() {
      if (!this.currentUserId) return
      
      try {
        this.isLoading = true
        this.error = null
        
        // 获取用户群组统计
        const result = await GroupAPI.getUserGroups(this.currentUserId)
        
        if (result.success) {
          this.joinedGroupsCount = result.data.groups ? result.data.groups.length : 0
          
          // 模拟统计数据
          this.totalMembers = 156
          this.activeGroups = 8
          this.todayMessages = 42
        }
        
      } catch (error) {
        console.error('[群组主页] 加载统计失败:', error)
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },
    
    // 跳转到我的群组页面
    goToMyGroups() {
      console.log('[群组主页] 跳转到我的群组')
      uni.navigateTo({
        url: '/pages/myGroups/myGroups'
      })
    },
    
    // 跳转到推荐群组页面
    goToRecommendGroups() {
      console.log('[群组主页] 跳转到推荐群组')
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch'
      })
    },
    
    // 创建群组提示
    showCreateGroupTip() {
      uni.showToast({
        title: '创建群组功能开发中',
        icon: 'none',
        duration: 2000
      })
    },
    
    // 重试加载
    retryLoad() {
      this.loadStats()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.groups-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $space-4;
}

.welcome-section {
  text-align: center;
  margin-bottom: $space-8;
  padding-top: $space-6;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.welcome-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $white;
  margin-bottom: $space-2;
}

.welcome-subtitle {
  font-size: $text-base;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.main-actions {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-bottom: $space-8;
}

.action-card {
  padding: $space-6;
  border-radius: $radius-xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.action-icon {
  font-size: 48rpx;
  width: 80rpx;
  text-align: center;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.action-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $gray-800;
}

.action-desc {
  font-size: $text-sm;
  color: $gray-600;
  line-height: 1.4;
}

.action-count {
  font-size: $text-xs;
  color: $primary-600;
  font-weight: $font-medium;
}

.action-arrow {
  font-size: $text-xl;
  color: $gray-400;
  font-weight: $font-light;
}

.my-groups-card {
  border-left: 6rpx solid $primary-500;
}

.recommend-card {
  border-left: 6rpx solid $success-500;
}

.create-card {
  border-left: 6rpx solid $accent-500;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-6;
}

.stats-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: $radius-lg;
  padding: $space-4;
  text-align: center;
  backdrop-filter: blur(5px);
}

.stats-number {
  display: block;
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $primary-600;
  margin-bottom: $space-1;
}

.stats-label {
  font-size: $text-xs;
  color: $gray-600;
}

.error-state {
  text-align: center;
  padding: $space-8;
  background: rgba(255, 255, 255, 0.9);
  border-radius: $radius-lg;
  margin-top: $space-4;
}

.error-text {
  display: block;
  color: $error-600;
  font-size: $text-sm;
  margin-bottom: $space-4;
}
</style>
