<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="header-content">
        <text class="page-title">我的学习小组</text>
        <text class="page-subtitle">与志同道合的伙伴一起学习成长</text>
      </view>
      <view class="header-stats">
        <view class="stat-item">
          <text class="stat-number">{{ joinedGroups.length }}</text>
          <text class="stat-label">已加入</text>
        </view>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="quick-actions">
      <modern-card class="action-card" hover @click="goToGroupMatch">
        <view class="action-content">
          <view class="action-icon">🔍</view>
          <view class="action-info">
            <text class="action-title">发现新小组</text>
            <text class="action-desc">找到更多感兴趣的学习小组</text>
          </view>
          <text class="action-arrow">></text>
        </view>
      </modern-card>
    </view>

    <!-- 群组列表 -->
    <view class="groups-section" v-if="joinedGroups.length > 0">
      <view class="section-header">
        <text class="section-title">我的小组</text>
        <view class="view-options">
          <view 
            class="view-option" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <text class="option-icon">⊞</text>
          </view>
          <view 
            class="view-option" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <text class="option-icon">☰</text>
          </view>
        </view>
      </view>

      <view class="groups-container" :class="{ 'list-view': viewMode === 'list' }">
        <modern-card 
          v-for="(group, index) in joinedGroups" 
          :key="group.id"
          class="group-card"
          :class="{ 'list-card': viewMode === 'list' }"
          shadow="medium"
          hover
        >
          <!-- 群组头部 -->
          <view class="group-header">
            <view class="group-avatar" :style="{ background: group.color }">
              <text class="avatar-text">{{ group.name.charAt(0) }}</text>
            </view>
            <view class="group-basic-info" v-if="viewMode === 'list'">
              <text class="group-name">{{ group.name }}</text>
              <text class="group-category">{{ group.category }}</text>
            </view>
            <view class="group-status">
              <view class="status-dot" :class="group.status"></view>
              <text class="status-text">{{ getStatusText(group.status) }}</text>
            </view>
          </view>

          <!-- 群组信息 -->
          <view class="group-info" v-if="viewMode === 'grid'">
            <text class="group-name">{{ group.name }}</text>
            <text class="group-description">{{ group.description }}</text>
          </view>

          <!-- 群组统计 -->
          <view class="group-stats">
            <view class="stat-group">
              <view class="stat-item">
                <text class="stat-icon">👥</text>
                <text class="stat-text">{{ group.memberCount }}人</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">💬</text>
                <text class="stat-text">{{ group.unreadCount || 0 }}条未读</text>
              </view>
              <view class="stat-item">
                <text class="stat-icon">📅</text>
                <text class="stat-text">{{ group.lastActive }}</text>
              </view>
            </view>
          </view>

          <!-- 群组操作 -->
          <view class="group-actions">
            <modern-button 
              type="primary" 
              size="small"
              @click="enterGroupChat(group)"
            >
              <text class="button-icon">💬</text>
              进入群聊
            </modern-button>
            <modern-button 
              type="secondary" 
              size="small"
              @click="viewGroupInfo(group)"
            >
              详情
            </modern-button>
          </view>

          <!-- 未读消息指示器 -->
          <view class="unread-badge" v-if="group.unreadCount > 0">
            <text class="badge-text">{{ group.unreadCount > 99 ? '99+' : group.unreadCount }}</text>
          </view>
        </modern-card>
      </view>
    </view>

    <!-- 空状态 -->
    <empty-state
      v-else
      icon="👥"
      title="还没有加入任何学习小组"
      description="快去发现感兴趣的学习小组，与志同道合的朋友一起学习吧！"
      action-text="发现小组"
      @action="goToGroupMatch"
    />

    <!-- 推荐小组 -->
    <view class="recommend-section" v-if="recommendGroups.length > 0">
      <view class="section-header">
        <text class="section-title">推荐小组</text>
        <text class="section-desc">基于你的兴趣为你推荐</text>
      </view>
      
      <scroll-view class="recommend-scroll" scroll-x>
        <view class="recommend-list">
          <view 
            class="recommend-card" 
            v-for="group in recommendGroups" 
            :key="group.id"
            @click="joinRecommendGroup(group)"
          >
            <view class="recommend-avatar" :style="{ background: group.color }">
              <text class="avatar-text">{{ group.name.charAt(0) }}</text>
            </view>
            <text class="recommend-name">{{ group.name }}</text>
            <text class="recommend-members">{{ group.memberCount }}人</text>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import EmptyState from '../../components/EmptyState.vue'

export default {
  components: {
    ModernCard,
    ModernButton,
    EmptyState
  },
  data() {
    return {
      viewMode: 'grid', // 'grid' 或 'list'
      joinedGroups: [
        { 
          id: 1,
          name: '高等数学研讨小组', 
          description: '深入探讨微积分、线性代数等高等数学知识，适合大学生和数学爱好者',
          category: '数学',
          memberCount: 24,
          unreadCount: 3,
          lastActive: '2小时前',
          status: 'active',
          color: 'linear-gradient(135deg, #667eea, #764ba2)'
        },
        { 
          id: 2,
          name: '英语口语练习小组', 
          description: '通过日常对话练习提升英语口语水平，营造纯英语交流环境',
          category: '英语',
          memberCount: 18,
          unreadCount: 0,
          lastActive: '1天前',
          status: 'idle',
          color: 'linear-gradient(135deg, #f093fb, #f5576c)'
        },
        { 
          id: 3,
          name: 'Python学习小组', 
          description: '从零开始学习Python编程，包括基础语法、数据分析、web开发等',
          category: '编程',
          memberCount: 32,
          unreadCount: 12,
          lastActive: '30分钟前',
          status: 'active',
          color: 'linear-gradient(135deg, #4facfe, #00f2fe)'
        }
      ],
      recommendGroups: [
        {
          id: 101,
          name: '前端开发交流群',
          memberCount: 28,
          color: 'linear-gradient(135deg, #fa709a, #fee140)'
        },
        {
          id: 102,
          name: '雅思托福备考群',
          memberCount: 26,
          color: 'linear-gradient(135deg, #a8edea, #fed6e3)'
        },
        {
          id: 103,
          name: '大学物理学习小组',
          memberCount: 16,
          color: 'linear-gradient(135deg, #a18cd1, #fbc2eb)'
        }
      ]
    }
  },
  methods: {
    enterGroupChat(group) {
      uni.navigateTo({
        url: `/pages/groupChat/groupChat?groupId=${group.id}&groupName=${group.name}`
      })
    },
    
    viewGroupInfo(group) {
      uni.navigateTo({
        url: `/pages/groupInfo/groupInfo?groupId=${group.id}`
      })
    },
    
    goToGroupMatch() {
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch'
      })
    },
    
    joinRecommendGroup(group) {
      uni.showModal({
        title: '加入小组',
        content: `确定要加入「${group.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            // 模拟加入小组
            const newGroup = {
              id: group.id,
              name: group.name,
              description: '新加入的学习小组，一起努力学习吧！',
              category: '推荐',
              memberCount: group.memberCount + 1,
              unreadCount: 0,
              lastActive: '刚刚',
              status: 'active',
              color: group.color
            }
            
            this.joinedGroups.push(newGroup)
            this.recommendGroups = this.recommendGroups.filter(g => g.id !== group.id)
            
            uni.showToast({
              title: `成功加入${group.name}`,
              icon: 'success'
            })
          }
        }
      })
    },
    
    getStatusText(status) {
      const statusMap = {
        'active': '活跃',
        'idle': '空闲',
        'offline': '离线'
      }
      return statusMap[status] || '未知'
    }
  },
  
  onShow() {
    // 页面显示时刷新数据
    this.refreshData()
  },
  
  methods: {
    enterGroupChat(group) {
      uni.navigateTo({
        url: `/pages/groupChat/groupChat?groupId=${group.id}&groupName=${group.name}`
      })
    },
    
    viewGroupInfo(group) {
      uni.navigateTo({
        url: `/pages/groupInfo/groupInfo?groupId=${group.id}`
      })
    },
    
    goToGroupMatch() {
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch'
      })
    },
    
    joinRecommendGroup(group) {
      uni.showModal({
        title: '加入小组',
        content: `确定要加入「${group.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            // 模拟加入小组
            const newGroup = {
              id: group.id,
              name: group.name,
              description: '新加入的学习小组，一起努力学习吧！',
              category: '推荐',
              memberCount: group.memberCount + 1,
              unreadCount: 0,
              lastActive: '刚刚',
              status: 'active',
              color: group.color
            }
            
            this.joinedGroups.push(newGroup)
            this.recommendGroups = this.recommendGroups.filter(g => g.id !== group.id)
            
            uni.showToast({
              title: `成功加入${group.name}`,
              icon: 'success'
            })
          }
        }
      })
    },
    
    getStatusText(status) {
      const statusMap = {
        'active': '活跃',
        'idle': '空闲',
        'offline': '离线'
      }
      return statusMap[status] || '未知'
    },
    
    refreshData() {
      // 这里可以添加从服务器获取最新数据的逻辑
      console.log('刷新小组数据')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba($primary-50, 0.3), rgba($secondary-50, 0.3));
  padding: $space-4;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-6;
  padding: $space-4;
}

.header-content {
  flex: 1;
}

.page-title {
  display: block;
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-1;
}

.page-subtitle {
  display: block;
  font-size: $text-base;
  color: $text-secondary;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: $space-4;
}

.stat-item {
  text-align: center;
  background: rgba($surface-primary, 0.8);
  padding: $space-3;
  border-radius: $radius-xl;
  min-width: 120rpx;
  box-shadow: $shadow-sm;
}

.stat-number {
  display: block;
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $primary-600;
  line-height: 1.2;
}

.stat-label {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  margin-top: $space-1;
}

.quick-actions {
  margin-bottom: $space-6;
}

.action-card {
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    transform: scale(0.98);
  }
}

.action-content {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $secondary-400, $secondary-600);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.action-info {
  flex: 1;
}

.action-title {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-1;
}

.action-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.action-arrow {
  font-size: $text-xl;
  color: $text-tertiary;
  font-weight: $font-bold;
  transform: rotate(90deg);
}

.groups-section {
  margin-bottom: $space-8;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-4;
  padding: 0 $space-2;
}

.section-title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-desc {
  font-size: $text-sm;
  color: $text-secondary;
}

.view-options {
  display: flex;
  background: rgba($gray-100, 0.8);
  border-radius: $radius-lg;
  padding: $space-1;
}

.view-option {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  transition: all $duration-200 $easing-smooth;
  
  &.active {
    background: $surface-primary;
    box-shadow: $shadow-sm;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.option-icon {
  font-size: 24rpx;
  color: $text-secondary;
  
  .active & {
    color: $primary-600;
  }
}

.groups-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-4;
  
  &:not(.list-view) {
    grid-template-columns: repeat(auto-fit, minmax(300rpx, 1fr));
  }
}

.group-card {
  position: relative;
  transition: all $duration-300 $easing-smooth;
  
  &:hover:not(.list-card) {
    transform: translateY(-4rpx);
  }
  
  &.list-card {
    .group-header {
      align-items: center;
      margin-bottom: $space-3;
    }
    
    .group-stats {
      .stat-group {
        flex-direction: row;
        align-items: center;
      }
    }
    
    .group-actions {
      margin-top: $space-3;
    }
  }
}

.group-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: $space-4;
}

.group-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $space-3;
  flex-shrink: 0;
  box-shadow: $shadow-md;
}

.avatar-text {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $surface-primary;
}

.group-basic-info {
  flex: 1;
  min-width: 0;
}

.group-status {
  display: flex;
  align-items: center;
  gap: $space-1;
  background: rgba($gray-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
  flex-shrink: 0;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: $radius-full;
  
  &.active {
    background: $success-500;
  }
  
  &.idle {
    background: $warning-500;
  }
  
  &.offline {
    background: $gray-400;
  }
}

.status-text {
  font-size: $text-xs;
  color: $text-secondary;
}

.group-info {
  margin-bottom: $space-4;
}

.group-name {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
  line-height: 1.3;
}

.group-description {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.group-category {
  font-size: $text-sm;
  color: $primary-600;
  background: rgba($primary-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
  display: inline-block;
  margin-top: $space-1;
}

.group-stats {
  margin-bottom: $space-4;
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.stat-icon {
  font-size: 24rpx;
}

.stat-text {
  font-size: $text-sm;
  color: $text-secondary;
}

.group-actions {
  display: flex;
  gap: $space-2;
}

.button-icon {
  margin-right: $space-1;
}

.unread-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: $error-500;
  color: $surface-primary;
  border-radius: $radius-full;
  min-width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $text-xs;
  font-weight: $font-bold;
  box-shadow: $shadow-md;
}

.badge-text {
  padding: 0 $space-1;
}

.recommend-section {
  margin-top: $space-8;
}

.recommend-scroll {
  white-space: nowrap;
}

.recommend-list {
  display: flex;
  gap: $space-3;
  padding: $space-2;
}

.recommend-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  background: $surface-primary;
  padding: $space-4;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  min-width: 200rpx;
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    transform: scale(0.95);
    box-shadow: $shadow-md;
  }
}

.recommend-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
}

.recommend-name {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $text-primary;
  text-align: center;
  line-height: 1.3;
}

.recommend-members {
  font-size: $text-sm;
  color: $text-secondary;
}
</style>
