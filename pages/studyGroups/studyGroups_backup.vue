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
      
      <modern-card class="action-card" hover @click="showCreateGroupModal">
        <view class="action-content">
          <view class="action-icon">➕</view>
          <view class="action-info">
            <text class="action-title">创建学习小组</text>
            <text class="action-desc">建立属于你的学习社区</text>
          </view>
          <text class="action-arrow">></text>
        </view>
      </modern-card>
    </view>

    <!-- 加载状态 -->
    <view class="loading-section" v-if="isLoading">
      <view class="loading-spinner">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">正在加载群组...</text>
      </view>
    </view>

    <!-- 错误状态 -->
    <view class="error-section" v-if="error && !isLoading">
      <view class="error-card">
        <text class="error-icon">⚠️</text>
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @tap="loadUserGroups">重试</button>
      </view>
    </view>

    <!-- 群组列表 -->
    <view class="groups-section" v-if="joinedGroups.length > 0 && !isLoading">
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
      v-else-if="joinedGroups.length === 0 && !isLoading && !error"
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
    
    <!-- 创建群组弹窗 -->
    <view class="modal-overlay" v-if="showCreateModal" @tap="hideCreateGroupModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">创建学习小组</text>
          <view class="modal-close" @tap="hideCreateGroupModal">✕</view>
        </view>
        
        <view class="modal-body">
          <view class="form-group">
            <text class="form-label">群组名称</text>
            <input 
              class="form-input" 
              v-model="createForm.name" 
              placeholder="请输入群组名称"
              maxlength="20"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">群组描述</text>
            <textarea 
              class="form-textarea" 
              v-model="createForm.description" 
              placeholder="请简单描述一下群组的学习内容和目标"
              maxlength="100"
            />
          </view>
          
          <view class="form-group">
            <text class="form-label">学习分类</text>
            <picker @change="onCategoryChange" :value="categoryIndex" :range="categories">
              <view class="form-picker">
                <text>{{ categories[categoryIndex] }}</text>
                <text class="picker-arrow">></text>
              </view>
            </picker>
          </view>
          
          <view class="form-group">
            <text class="form-label">群组设置</text>
            <view class="form-switches">
              <view class="switch-item">
                <text class="switch-label">公开群组</text>
                <switch :checked="createForm.isPublic" @change="onPublicChange" />
              </view>
              <view class="switch-item">
                <text class="switch-label">需要审核</text>
                <switch :checked="createForm.requireApproval" @change="onApprovalChange" />
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel-btn" @tap="hideCreateGroupModal">取消</button>
          <button 
            class="modal-btn confirm-btn" 
            @tap="createGroup"
            :disabled="isCreating || !createForm.name"
          >
            {{ isCreating ? '创建中...' : '创建群组' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import EmptyState from '../../components/EmptyState.vue'
import { GroupAPI } from '@/api/groupAPI.js';
import { StorageManager } from '@/utils/storage.js';

export default {
  components: {
    ModernCard,
    ModernButton,
    EmptyState
  },
  data() {
    return {
      viewMode: 'grid', // 'grid' 或 'list'
      joinedGroups: [],
      recommendGroups: [],
      isLoading: false,
      error: null,
      currentUserId: null,
      
      // 创建群组相关
      showCreateModal: false,
      isCreating: false,
      createForm: {
        name: '',
        description: '',
        category: 'programming',
        isPublic: true,
        requireApproval: false
      },
      categories: ['编程技术', '语言学习', '考试备考', '兴趣爱好', '专业技能', '其他'],
      categoryIndex: 0
    }
  },
  methods: {
    onLoad() {
      console.log('[群组页面] onLoad 开始');
      this.initPage();
    },
    onShow() {
      console.log('[群组页面] onShow 开始');
      if (this.currentUserId) {
        this.loadUserGroups();
      }
    },
    initPage() {
      try {
        console.log('[群组页面] initPage 开始执行');
        
        // 检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn();
        if (!isLoggedIn) {
          console.log('[群组页面] 用户未登录，跳转到登录页');
          uni.reLaunch({
            url: '/pages/login/login'
          });
          return;
        }
        
        // 获取用户信息
        const userInfo = StorageManager.getUserInfo();
        this.currentUserId = userInfo ? userInfo.id : null;
        
        if (!this.currentUserId) {
          throw new Error('无法获取用户ID');
        }
        
        console.log('[群组页面] 初始化完成，用户ID:', this.currentUserId);
        
        // 异步加载数据
        this.loadData();
        
      } catch (error) {
        console.error('[群组页面] 初始化失败:', error);
        this.error = error.message;
        uni.showToast({
          title: '页面初始化失败',
          icon: 'none'
        });
      }
    },
    
    async loadData() {
      try {
        // 加载用户群组
        await this.loadUserGroups();
        // 加载推荐群组
        await this.loadRecommendedGroups();
      } catch (error) {
        console.error('[群组页面] 数据加载失败:', error);
      }
    },
    
    async loadUserGroups() {
      if (!this.currentUserId) {
        console.warn('[群组页面] 用户ID不存在，跳过加载群组');
        return;
      }
      
      try {
        console.log('[群组页面] 开始加载用户群组');
        this.isLoading = true;
        this.error = null;
        
        const result = await GroupAPI.getUserGroups(this.currentUserId);
        
        if (result.success) {
          this.joinedGroups = result.data.groups || [];
          console.log('[群组页面] 加载群组成功，数量:', this.joinedGroups.length);
        } else {
          throw new Error(result.error || '加载群组失败');
        }
        
      } catch (error) {
        console.error('[群组页面] 加载群组失败:', error);
        this.error = error.message;
        
        // 显示友好的错误提示
        uni.showToast({
          title: '加载群组失败',
          icon: 'none'
        });
        
        // 如果是网络错误，显示默认数据
        this.joinedGroups = [];
        
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadRecommendedGroups() {
      if (!this.currentUserId) {
        console.warn('[群组页面] 用户ID不存在，跳过加载推荐群组');
        return;
      }
      
      try {
        console.log('[群组页面] 开始加载推荐群组');
        
        const result = await GroupAPI.getRecommendedGroups(this.currentUserId);
        
        if (result.success) {
          this.recommendGroups = result.data.groups || [];
          console.log('[群组页面] 加载推荐群组成功，数量:', this.recommendGroups.length);
        } else {
          console.warn('[群组页面] 加载推荐群组失败:', result.error);
        }
        
      } catch (error) {
        console.error('[群组页面] 加载推荐群组失败:', error);
        // 推荐群组加载失败不影响主要功能，只记录日志
      }
    },
    
    // 创建群组相关方法
    showCreateGroupModal() {
      this.showCreateModal = true;
      console.log('[群组页面] 显示创建群组弹窗');
    },
    
    hideCreateGroupModal() {
      this.showCreateModal = false;
      this.resetCreateForm();
      console.log('[群组页面] 隐藏创建群组弹窗');
    },
    
    resetCreateForm() {
      this.createForm = {
        name: '',
        description: '',
        category: 'programming',
        isPublic: true,
        requireApproval: false
      };
      this.categoryIndex = 0;
    },
    
    onCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      const categoryMap = {
        0: 'programming',
        1: 'language',
        2: 'exam',
        3: 'hobby',
        4: 'skill',
        5: 'other'
      };
      this.createForm.category = categoryMap[this.categoryIndex] || 'other';
      console.log('[群组页面] 分类变更:', this.createForm.category);
    },
    
    onPublicChange(e) {
      this.createForm.isPublic = e.detail.value;
      console.log('[群组页面] 公开设置变更:', this.createForm.isPublic);
    },
    
    onApprovalChange(e) {
      this.createForm.requireApproval = e.detail.value;
      console.log('[群组页面] 审核设置变更:', this.createForm.requireApproval);
    },
    
    async createGroup() {
      if (!this.createForm.name) {
        uni.showToast({
          title: '请输入群组名称',
          icon: 'none'
        });
        return;
      }
      
      try {
        console.log('[群组页面] 开始创建群组:', this.createForm);
        this.isCreating = true;
        
        const groupData = {
          ...this.createForm,
          creatorId: this.currentUserId,
          maxMembers: 100
        };
        
        const result = await GroupAPI.createGroup(groupData);
        
        if (result.success) {
          console.log('[群组页面] 创建群组成功:', result.data);
          
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          this.hideCreateGroupModal();
          
          // 刷新群组列表
          await this.loadUserGroups();
          
        } else {
          throw new Error(result.error || '创建群组失败');
        }
        
      } catch (error) {
        console.error('[群组页面] 创建群组失败:', error);
        uni.showToast({
          title: '创建失败',
          icon: 'none'
        });
      } finally {
        this.isCreating = false;
      }
    },
    
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

/* 加载和错误状态样式 */
.loading-section, .error-section {
  padding: $space-8 $space-4;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner, .error-card {
  background: $surface-primary;
  border-radius: $radius-xl;
  padding: $space-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  box-shadow: $shadow-sm;
}

.loading-icon, .error-icon {
  font-size: 48rpx;
  margin-bottom: $space-2;
}

.loading-text, .error-text {
  font-size: $text-sm;
  color: $text-secondary;
  text-align: center;
}

.retry-btn {
  background: $primary-500;
  color: $surface-primary;
  border: none;
  border-radius: $radius-lg;
  padding: $space-2 $space-4;
  font-size: $text-sm;
  
  &:active {
    background: $primary-600;
  }
}

/* 创建群组弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $space-4;
}

.modal-content {
  background: $surface-primary;
  border-radius: $radius-xl;
  max-width: 600rpx;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-4 $space-6;
  border-bottom: 1px solid $surface-secondary;
}

.modal-title {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $text-primary;
}

.modal-close {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  font-size: $text-lg;
  cursor: pointer;
}

.modal-body {
  padding: $space-6;
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: $space-4;
}

.form-label {
  font-size: $text-sm;
  color: $text-primary;
  font-weight: $font-medium;
  display: block;
  margin-bottom: $space-2;
}

.form-input, .form-textarea {
  width: 100%;
  background: $surface-secondary;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  padding: $space-3;
  font-size: $text-base;
  color: $text-primary;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 120rpx;
  resize: vertical;
}

.form-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $surface-secondary;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  padding: $space-3;
  color: $text-primary;
}

.picker-arrow {
  color: $text-secondary;
}

.form-switches {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-label {
  font-size: $text-sm;
  color: $text-primary;
}

.modal-footer {
  display: flex;
  gap: $space-3;
  padding: $space-4 $space-6;
  border-top: 1px solid $surface-secondary;
}

.modal-btn {
  flex: 1;
  border: none;
  border-radius: $radius-lg;
  padding: $space-3;
  font-size: $text-base;
  font-weight: $font-medium;
  text-align: center;
}

.cancel-btn {
  background: $surface-secondary;
  color: $text-secondary;
}

.confirm-btn {
  background: $primary-500;
  color: $surface-primary;
  
  &:disabled {
    background: $surface-tertiary;
    color: $text-disabled;
  }
}
</style>
