<template>
  <view class="my-groups-container">
    <!-- 顶部统计 -->
    <view class="header-stats">
      <view class="stat-item">
        <text class="stat-number">{{ joinedGroups.length }}</text>
        <text class="stat-label">已加入群组</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ activeGroupsCount }}</text>
        <text class="stat-label">活跃群组</text>
      </view>
    </view>

    <!-- Loading状态 -->
    <LoadingSpinner v-if="isLoading" text="加载群组中..." />

    <!-- 错误状态 -->
    <view v-if="error && !isLoading" class="error-container">
      <EmptyState
        icon="⚠️"
        title="加载失败"
        :description="error"
        actionText="重试"
        @action="loadUserGroups"
      />
    </view>

    <!-- 群组列表 -->
    <view v-if="!isLoading && !error" class="groups-content">
      <!-- 有群组时显示列表 -->
      <view v-if="joinedGroups.length > 0" class="groups-list">
        <ModernCard 
          v-for="group in joinedGroups" 
          :key="group.id"
          class="group-card"
          :clickable="true"
          @tap="enterGroupChat(group)"
        >
          <view class="group-content">
            <view class="group-header">
              <text class="group-name">{{ group.name }}</text>
              <view class="group-status" :class="group.status">
                <text class="status-dot"></text>
                <text class="status-text">{{ group.status === 'active' ? '活跃' : '休眠' }}</text>
              </view>
            </view>
            <text class="group-description">{{ group.description }}</text>
            <view class="group-meta">
              <view class="meta-item">
                <text class="meta-icon">👥</text>
                <text class="meta-text">{{ group.memberCount }}/{{ group.maxMembers }}</text>
              </view>
              <view class="meta-item">
                <text class="meta-icon">🏷️</text>
                <text class="meta-text">{{ getCategoryName(group.category) }}</text>
              </view>
              <view class="meta-item">
                <text class="meta-icon">💬</text>
                <text class="meta-text">进入聊天</text>
              </view>
            </view>
          </view>
        </ModernCard>
      </view>

      <!-- 空状态 -->
      <EmptyState
        v-else
        icon="📚"
        title="暂无加入的群组"
        description="快去发现和加入感兴趣的学习群组吧"
        actionText="发现群组"
        @action="goToRecommendGroups"
      />
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { GroupAPI } from '@/api/groupAPI.js'
import { StorageManager } from '@/utils/storage.js'

export default {
  components: {
    ModernCard,
    LoadingSpinner,
    EmptyState
  },
  data() {
    return {
      joinedGroups: [],
      isLoading: false,
      error: null,
      currentUserId: null
    }
  },
  computed: {
    activeGroupsCount() {
      return this.joinedGroups.filter(group => group.status === 'active').length
    }
  },
  methods: {
    onLoad() {
      console.log('[我的群组] onLoad 开始')
      this.initPage()
    },
    onShow() {
      console.log('[我的群组] onShow 开始')
      if (this.currentUserId) {
        this.loadUserGroups()
      }
    },
    initPage() {
      try {
        console.log('[我的群组] initPage 开始执行')
        
        // 检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn()
        if (!isLoggedIn) {
          console.log('[我的群组] 用户未登录，跳转到登录页')
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
        
        console.log('[我的群组] 初始化完成，用户ID:', this.currentUserId)
        
        // 加载群组数据
        this.loadUserGroups()
        
      } catch (error) {
        console.error('[我的群组] 初始化失败:', error)
        this.error = error.message
        uni.showToast({
          title: '页面初始化失败',
          icon: 'none'
        })
      }
    },
    
    async loadUserGroups() {
      if (!this.currentUserId) {
        console.warn('[我的群组] 用户ID不存在，跳过加载群组')
        return
      }
      
      try {
        console.log('[我的群组] 开始加载用户群组')
        this.isLoading = true
        this.error = null
        
        const result = await GroupAPI.getUserGroups(this.currentUserId)
        
        if (result.success) {
          this.joinedGroups = result.data.groups || []
          console.log('[我的群组] 加载群组成功，数量:', this.joinedGroups.length)
        } else {
          throw new Error(result.error || '加载群组失败')
        }
        
      } catch (error) {
        console.error('[我的群组] 加载群组失败:', error)
        this.error = error.message
        
        // 显示友好的错误提示
        uni.showToast({
          title: '加载群组失败',
          icon: 'none'
        })
        
        // 如果是网络错误，显示默认数据
        this.joinedGroups = []
        
      } finally {
        this.isLoading = false
      }
    },
    
    // 进入群组聊天
    enterGroupChat(group) {
      console.log('[我的群组] 进入群组聊天:', group.name)
      uni.navigateTo({
        url: `/pages/groupChat/groupChat?groupId=${group.id}&groupName=${encodeURIComponent(group.name)}`
      })
    },
    
    // 跳转到推荐群组
    goToRecommendGroups() {
      console.log('[我的群组] 跳转到推荐群组')
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch'
      })
    },
    
    // 获取分类名称
    getCategoryName(category) {
      const categoryMap = {
        'programming': '编程技术',
        'language': '语言学习',
        'exam': '考试备考',
        'hobby': '兴趣爱好',
        'skill': '专业技能',
        'other': '其他'
      }
      return categoryMap[category] || '其他'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.my-groups-container {
  min-height: 100vh;
  background: $gray-50;
  padding: $space-4;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: $space-8;
  margin-bottom: $space-6;
  padding: $space-4;
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $primary-600;
  margin-bottom: $space-1;
}

.stat-label {
  font-size: $text-sm;
  color: $gray-600;
}

.groups-content {
  flex: 1;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.group-card {
  padding: $space-5;
  border-left: 6rpx solid $primary-500;
}

.group-content {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-name {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $gray-800;
  flex: 1;
}

.group-status {
  display: flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  font-size: $text-xs;
  
  &.active {
    background: rgba(34, 197, 94, 0.1);
    
    .status-dot {
      background: $success-500;
    }
    
    .status-text {
      color: $success-600;
    }
  }
  
  &:not(.active) {
    background: rgba(156, 163, 175, 0.1);
    
    .status-dot {
      background: $gray-400;
    }
    
    .status-text {
      color: $gray-600;
    }
  }
}

.status-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
}

.status-text {
  font-weight: $font-medium;
}

.group-description {
  font-size: $text-sm;
  color: $gray-600;
  line-height: 1.5;
  margin: $space-2 0;
}

.group-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: $space-2;
  border-top: 1rpx solid $gray-200;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: $space-1;
}

.meta-icon {
  font-size: $text-sm;
}

.meta-text {
  font-size: $text-xs;
  color: $gray-600;
}

.error-container {
  padding: $space-8;
}
</style>
