<template>
  <view class="page-container">
    <!-- 群组头部卡片 -->
    <modern-card class="header-card" shadow="lg">
      <view class="group-header">
        <view class="group-avatar" :style="{ background: groupInfo.color }">
          <text class="avatar-text">{{ groupInfo.name ? groupInfo.name.charAt(0) : 'G' }}</text>
        </view>
        <view class="group-basic">
          <text class="group-name">{{ groupInfo.name }}</text>
          <view class="group-tags">
            <text class="tag category">{{ groupInfo.category }}</text>
            <text class="tag level">{{ groupInfo.level || '初级' }}</text>
            <view class="status-indicator" :class="groupInfo.status">
              <view class="status-dot"></view>
              <text class="status-text">{{ getStatusText(groupInfo.status) }}</text>
            </view>
          </view>
        </view>
        <view class="header-actions">
          <modern-button 
            type="primary" 
            size="small"
            @click="joinOrLeaveGroup"
            :disabled="isLoading"
          >
            {{ isJoined ? '退出群组' : '加入群组' }}
          </modern-button>
        </view>
      </view>
    </modern-card>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stats-grid">
        <modern-card class="stat-card" variant="primary">
          <view class="stat-content">
            <text class="stat-icon">👥</text>
            <text class="stat-number">{{ groupInfo.memberCount || 0 }}</text>
            <text class="stat-label">成员</text>
          </view>
        </modern-card>
        
        <modern-card class="stat-card" variant="secondary">
          <view class="stat-content">
            <text class="stat-icon">💬</text>
            <text class="stat-number">{{ groupInfo.messageCount || 0 }}</text>
            <text class="stat-label">消息</text>
          </view>
        </modern-card>
        
        <modern-card class="stat-card" variant="success">
          <view class="stat-content">
            <text class="stat-icon">📅</text>
            <text class="stat-number">{{ getDaysAgo(groupInfo.created_at) }}</text>
            <text class="stat-label">天前创建</text>
          </view>
        </modern-card>
      </view>
    </view>

    <!-- 群组介绍 -->
    <modern-card title="群组介绍" class="intro-card">
      <view class="intro-content">
        <text class="description" v-if="groupInfo.description">{{ groupInfo.description }}</text>
        <text class="no-description" v-else>该群组暂未添加介绍</text>
      </view>
    </modern-card>

    <!-- 群组功能 -->
    <modern-card title="群组功能" class="features-card">
      <view class="features-grid">
        <view class="feature-item" @click="goToGroupChat">
          <view class="feature-icon primary">💬</view>
          <text class="feature-title">群组聊天</text>
          <text class="feature-desc">与成员实时交流</text>
        </view>
        
        <view class="feature-item" @click="goToAIChat">
          <view class="feature-icon secondary">🤖</view>
          <text class="feature-title">AI助手</text>
          <text class="feature-desc">智能学习指导</text>
        </view>
        
        <view class="feature-item" @click="shareGroup">
          <view class="feature-icon success">📤</view>
          <text class="feature-title">分享群组</text>
          <text class="feature-desc">邀请好友加入</text>
        </view>
        
        <view class="feature-item" @click="showInviteCodeModal">
          <view class="feature-icon warning">🔗</view>
          <text class="feature-title">邀请码</text>
          <text class="feature-desc">生成邀请链接</text>
        </view>
      </view>
    </modern-card>

    <!-- 成员列表 -->
    <modern-card title="群组成员" class="members-card">
      <view class="members-header">
        <text class="members-count">共 {{ members.length }} 人</text>
        <text class="view-all" @click="viewAllMembers">查看全部</text>
      </view>
      
      <view class="members-grid">
        <view 
          class="member-item" 
          v-for="member in displayMembers" 
          :key="member.id"
          @click="viewMemberProfile(member)"
        >
          <view class="member-avatar">
            <image 
              class="avatar-img" 
              :src="member.avatar || '/static/default-avatar.png'" 
              mode="aspectFill" 
            />
            <view class="role-badge" v-if="member.role === 'admin'">管</view>
          </view>
          <text class="member-name">{{ member.name }}</text>
        </view>
        
        <view class="member-item more-members" v-if="members.length > 6" @click="viewAllMembers">
          <view class="more-avatar">
            <text class="more-text">+{{ members.length - 6 }}</text>
          </view>
          <text class="member-name">更多</text>
        </view>
      </view>
    </modern-card>

    <!-- 邀请码弹窗 -->
    <modal 
      :visible="showInviteModal"
      title="群组邀请码"
      :show-cancel="false"
      confirm-text="复制邀请码"
      @confirm="copyInviteCode"
      @close="showInviteModal = false"
    >
      <view class="invite-content">
        <view class="invite-code">{{ inviteCode }}</view>
        <text class="invite-hint">分享此邀请码，让好友快速加入群组</text>
      </view>
    </modal>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import Modal from '../../components/Modal.vue'

export default {
  components: {
    ModernCard,
    ModernButton,
    Modal
  },
  data() {
    return {
      groupId: null,
      isLoading: false,
      isJoined: false,
      showInviteModal: false,
      inviteCode: '',
      groupInfo: {
        id: 1,
        name: '高等数学研讨小组',
        category: '数学',
        level: '中级',
        description: '深入探讨微积分、线性代数等高等数学知识，适合大学生和数学爱好者。我们定期举办学习讨论会，分享学习心得和解题技巧。',
        memberCount: 24,
        messageCount: 1245,
        status: 'active',
        color: 'linear-gradient(135deg, #667eea, #764ba2)',
        created_at: '2024-06-15T10:30:00Z'
      },
      members: [
        { id: 1, name: '张三', avatar: '', role: 'admin' },
        { id: 2, name: '李四', avatar: '', role: 'member' },
        { id: 3, name: '王五', avatar: '', role: 'member' },
        { id: 4, name: '赵六', avatar: '', role: 'member' },
        { id: 5, name: '孙七', avatar: '', role: 'member' },
        { id: 6, name: '周八', avatar: '', role: 'member' },
        { id: 7, name: '吴九', avatar: '', role: 'member' },
        { id: 8, name: '郑十', avatar: '', role: 'member' }
      ]
    }
  },
  computed: {
    displayMembers() {
      return this.members.slice(0, 6)
    }
  },
  onLoad(options) {
    if (options.groupId) {
      this.groupId = options.groupId
      this.loadGroupInfo()
    }
  },
  methods: {
    async loadGroupInfo() {
      this.isLoading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 这里应该调用实际的API
        this.checkMembershipStatus()
      } catch (error) {
        console.error('加载群组信息失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'error'
        })
      } finally {
        this.isLoading = false
      }
    },
    
    checkMembershipStatus() {
      // 检查当前用户是否已加入群组
      this.isJoined = Math.random() > 0.5 // 模拟状态
    },
    
    async joinOrLeaveGroup() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (this.isJoined) {
          // 退出群组
          uni.showModal({
            title: '确认退出',
            content: '确定要退出这个群组吗？',
            success: (res) => {
              if (res.confirm) {
                this.isJoined = false
                this.groupInfo.memberCount--
                uni.showToast({
                  title: '已退出群组',
                  icon: 'success'
                })
              }
            }
          })
        } else {
          // 加入群组
          this.isJoined = true
          this.groupInfo.memberCount++
          uni.showToast({
            title: '加入成功',
            icon: 'success'
          })
        }
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'error'
        })
      } finally {
        this.isLoading = false
      }
    },
    
    goToGroupChat() {
      uni.navigateTo({
        url: `/pages/groupChat/groupChat?groupId=${this.groupId}&groupName=${this.groupInfo.name}`
      })
    },
    
    goToAIChat() {
      uni.navigateTo({
        url: '/pages/aichat/aichat?source=group'
      })
    },
    
    shareGroup() {
      uni.share({
        provider: 'weixin',
        type: 0,
        title: `邀请你加入「${this.groupInfo.name}」`,
        summary: this.groupInfo.description,
        success: () => {
          uni.showToast({
            title: '分享成功',
            icon: 'success'
          })
        }
      })
    },
    
    showInviteCodeModal() {
      this.generateInviteCode()
      this.showInviteModal = true
    },
    
    generateInviteCode() {
      // 生成邀请码
      this.inviteCode = `LGAPP${this.groupId}${Date.now().toString().slice(-6)}`
    },
    
    copyInviteCode() {
      uni.setClipboardData({
        data: this.inviteCode,
        success: () => {
          uni.showToast({
            title: '邀请码已复制',
            icon: 'success'
          })
          this.showInviteModal = false
        }
      })
    },
    
    viewAllMembers() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },
    
    viewMemberProfile(member) {
      uni.showToast({
        title: `查看 ${member.name} 的资料`,
        icon: 'none'
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
    
    getDaysAgo(dateString) {
      if (!dateString) return 0
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
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

.header-card {
  margin-bottom: $space-6;
}

.group-header {
  display: flex;
  align-items: flex-start;
  gap: $space-4;
}

.group-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-2xl;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
  flex-shrink: 0;
}

.avatar-text {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $surface-primary;
}

.group-basic {
  flex: 1;
  min-width: 0;
}

.group-name {
  display: block;
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-2;
  line-height: 1.3;
}

.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
  align-items: center;
}

.tag {
  font-size: $text-xs;
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
  
  &.category {
    background: rgba($primary-100, 0.8);
    color: $primary-700;
    border: 1rpx solid rgba($primary-300, 0.5);
  }
  
  &.level {
    background: rgba($secondary-100, 0.8);
    color: $secondary-700;
    border: 1rpx solid rgba($secondary-300, 0.5);
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: $space-1;
  background: rgba($gray-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: $radius-full;
  
  .active & {
    background: $success-500;
  }
  
  .idle & {
    background: $warning-500;
  }
  
  .offline & {
    background: $gray-400;
  }
}

.status-text {
  font-size: $text-xs;
  color: $text-secondary;
}

.header-actions {
  flex-shrink: 0;
}

.stats-section {
  margin-bottom: $space-6;
}

.stats-grid {
  display: flex;
  gap: $space-3;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.stat-icon {
  font-size: $text-2xl;
}

.stat-number {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $surface-primary;
}

.stat-label {
  font-size: $text-sm;
  color: rgba($surface-primary, 0.9);
}

.intro-card,
.features-card,
.members-card {
  margin-bottom: $space-6;
}

.intro-content {
  .description {
    font-size: $text-base;
    color: $text-secondary;
    line-height: 1.6;
  }
  
  .no-description {
    font-size: $text-base;
    color: $text-tertiary;
    font-style: italic;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-4;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $space-4;
  border-radius: $radius-xl;
  background: rgba($gray-50, 0.5);
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($gray-100, 0.8);
    transform: scale(0.98);
  }
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-bottom: $space-2;
  
  &.primary { background: linear-gradient(135deg, $primary-400, $primary-600); }
  &.secondary { background: linear-gradient(135deg, $secondary-400, $secondary-600); }
  &.success { background: linear-gradient(135deg, $success-400, $success-600); }
  &.warning { background: linear-gradient(135deg, $warning-400, $warning-600); }
}

.feature-title {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $text-primary;
  margin-bottom: $space-1;
}

.feature-desc {
  font-size: $text-sm;
  color: $text-secondary;
  text-align: center;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-4;
}

.members-count {
  font-size: $text-base;
  font-weight: $font-medium;
  color: $text-primary;
}

.view-all {
  font-size: $text-sm;
  color: $primary-600;
  
  &:active {
    opacity: 0.7;
  }
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  transition: all $duration-200 $easing-smooth;
  
  &:active:not(.more-members) {
    transform: scale(0.95);
  }
}

.member-avatar {
  position: relative;
  width: 80rpx;
  height: 80rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  border: 2rpx solid $border-light;
}

.role-badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  background: $error-500;
  color: $surface-primary;
  font-size: $text-xs;
  padding: 2rpx 6rpx;
  border-radius: $radius-sm;
}

.more-avatar {
  width: 80rpx;
  height: 80rpx;
  background: rgba($gray-200, 0.8);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $border-light;
}

.more-text {
  font-size: $text-sm;
  color: $text-secondary;
  font-weight: $font-medium;
}

.member-name {
  font-size: $text-sm;
  color: $text-secondary;
  text-align: center;
  line-height: 1.2;
}

.invite-content {
  text-align: center;
  padding: $space-4;
}

.invite-code {
  background: rgba($primary-100, 0.8);
  color: $primary-700;
  font-size: $text-lg;
  font-weight: $font-bold;
  padding: $space-3 $space-4;
  border-radius: $radius-lg;
  margin-bottom: $space-3;
  letter-spacing: 2rpx;
}

.invite-hint {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

@media (max-width: $breakpoint-sm) {
  .stats-grid {
    flex-direction: column;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .members-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
