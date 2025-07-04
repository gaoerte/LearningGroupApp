<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="header-content">
        <text class="page-title">推荐群组</text>
        <text class="page-subtitle">根据你的兴趣发现新的学习群组</text>
      </view>
      <view class="header-decoration">
        <view class="decoration-circle circle-1"></view>
        <view class="decoration-circle circle-2"></view>
        <view class="decoration-circle circle-3"></view>
      </view>
    </view>

    <!-- 兴趣选择卡片 -->
    <modern-card class="interest-card" shadow="medium">
      <view class="interest-header">
        <view class="interest-icon">🎯</view>
        <view class="interest-info">
          <text class="interest-title">选择你的兴趣领域</text>
          <text class="interest-desc">我们将为你推荐相关的学习小组</text>
        </view>
      </view>
      
      <view class="picker-container">
        <picker mode="selector" :range="interests" @change="selectInterest">
          <view class="custom-picker">
            <text class="picker-text">{{ selectedInterest || '点击选择兴趣领域' }}</text>
            <text class="picker-arrow">></text>
          </view>
        </picker>
      </view>
    </modern-card>

    <!-- 推荐小组列表 -->
    <view class="groups-section" v-if="recommendedGroups.length > 0">
      <view class="section-header">
        <text class="section-title">为你推荐</text>
        <text class="section-count">{{ recommendedGroups.length }}个小组</text>
      </view>
      
      <view class="groups-grid">
        <modern-card 
          v-for="(group, index) in recommendedGroups" 
          :key="index"
          class="group-card"
          shadow="medium"
          hover
        >
          <view class="group-header">
            <view class="group-avatar">
              <text class="avatar-text">{{ group.name.charAt(0) }}</text>
            </view>
            <view class="group-info">
              <text class="group-name">{{ group.name }}</text>
              <view class="group-tags">
                <text class="tag">{{ group.interest }}</text>
                <text class="tag">{{ group.level || '初级' }}</text>
              </view>
            </view>
            <view class="group-stats">
              <text class="member-count">{{ group.memberCount || 12 }}人</text>
            </view>
          </view>
          
          <view class="group-content">
            <text class="group-description">{{ group.description }}</text>
          </view>
          
          <view class="group-footer">
            <view class="group-meta">
              <text class="create-time">{{ group.createTime || '2天前创建' }}</text>
              <text class="activity">{{ group.activity || '活跃度高' }}</text>
            </view>
            <modern-button 
              type="primary" 
              size="small"
              @tap.stop="joinGroup(group)"
              @click.stop="joinGroup(group)"
              style="z-index: 999; position: relative;"
            >
              加入小组
            </modern-button>
            
            <!-- 备用原生按钮 -->
            <button 
              class="native-join-btn"
              @tap.stop="joinGroup(group)"
              @click.stop="joinGroup(group)"
            >
              备用按钮
            </button>
          </view>
        </modern-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="selectedInterest">
      <view class="empty-icon">🔍</view>
      <text class="empty-title">暂无推荐小组</text>
      <text class="empty-desc">该兴趣领域暂时没有合适的学习小组，请尝试其他兴趣</text>
      
      <!-- 测试按钮 -->
      <modern-button 
        type="primary" 
        @tap="testButtonClick"
        @click="testButtonClick"
        style="margin-top: 32rpx;"
      >
        测试按钮点击
      </modern-button>
    </view>

    <!-- 功能提示 -->
    <modern-card class="tips-card" v-if="!selectedInterest">
      <view class="tips-content">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">选择你感兴趣的领域，我们会推荐最合适的学习小组</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">👥</text>
          <text class="tip-text">加入小组后可以与志同道合的朋友一起学习</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📈</text>
          <text class="tip-text">通过小组学习，提高学习效率和积极性</text>
        </view>
      </view>
    </modern-card>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import { GroupAPI } from '../../api/groupAPI.js';
import { StorageManager } from '../../utils/storage.js';

export default {
  components: {
    ModernCard,
    ModernButton
  },
  data() {
    return {
      selectedInterest: null,
      interests: ['编程技术', '语言学习', '考试备考', '兴趣爱好', '专业技能', '其他'],
      recommendedGroups: [],
      isLoading: false,
      error: null,
      currentUserId: null
    }
  },
  async onLoad() {
    console.log('[群组匹配] onLoad 开始');
    await this.initPage();
  },
  methods: {
    async initPage() {
      try {
        // 检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn();
        if (!isLoggedIn) {
          console.log('[群组匹配] 用户未登录，跳转到登录页');
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
        
        console.log('[群组匹配] 初始化完成，用户ID:', this.currentUserId);
        
        // 加载推荐群组
        await this.loadRecommendedGroups();
        
        // 添加一些测试数据
        this.addTestGroups();
        
      } catch (error) {
        console.error('[群组匹配] 初始化失败:', error);
        this.error = error.message;
        uni.showToast({
          title: '页面初始化失败',
          icon: 'none'
        });
      }
    },
    
    async loadRecommendedGroups() {
      if (!this.currentUserId) {
        console.warn('[群组匹配] 用户ID不存在，跳过加载推荐群组');
        return;
      }
      
      try {
        console.log('[群组匹配] 开始加载推荐群组');
        this.isLoading = true;
        this.error = null;
        
        const result = await GroupAPI.getRecommendedGroups(this.currentUserId);
        
        if (result.success) {
          this.recommendedGroups = result.data.groups || [];
          console.log('[群组匹配] 加载推荐群组成功，数量:', this.recommendedGroups.length);
        } else {
          throw new Error(result.error || '加载推荐群组失败');
        }
        
      } catch (error) {
        console.error('[群组匹配] 加载推荐群组失败:', error);
        this.error = error.message;
        
        // 显示友好的错误提示
        uni.showToast({
          title: '加载推荐失败',
          icon: 'none'
        });
        
      } finally {
        this.isLoading = false;
      }
    },
    
    async selectInterest(e) {
      const selectedIndex = e.detail.value;
      this.selectedInterest = this.interests[selectedIndex];
      console.log('[群组匹配] 选择兴趣:', this.selectedInterest);
      await this.searchGroupsByCategory();
    },
    
    async searchGroupsByCategory() {
      if (!this.selectedInterest) {
        return;
      }
      
      try {
        console.log('[群组匹配] 根据分类搜索群组:', this.selectedInterest);
        this.isLoading = true;
        
        const categoryMap = {
          '编程技术': 'programming',
          '语言学习': 'language',
          '考试备考': 'exam',
          '兴趣爱好': 'hobby',
          '专业技能': 'skill',
          '其他': 'other'
        };
        
        const category = categoryMap[this.selectedInterest] || 'other';
        
        const result = await GroupAPI.searchGroups('', category);
        
        if (result.success) {
          this.recommendedGroups = result.data.groups || [];
          console.log('[群组匹配] 搜索群组成功，数量:', this.recommendedGroups.length);
        } else {
          throw new Error(result.error || '搜索群组失败');
        }
        
      } catch (error) {
        console.error('[群组匹配] 搜索群组失败:', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    testButtonClick() {
      console.log('[群组匹配] 测试按钮被点击了！');
      console.log('[群组匹配] 当前推荐群组数量:', this.recommendedGroups.length);
      console.log('[群组匹配] 推荐群组数据:', this.recommendedGroups);
      uni.showToast({
        title: '测试按钮工作正常！',
        icon: 'success'
      });
    },
    
    addTestGroups() {
      console.log('[群组匹配] 添加测试群组数据');
      this.recommendedGroups = [
        {
          id: 'test_group_1',
          name: 'Vue.js学习交流',
          description: 'Vue.js技术交流和项目分享',
          interest: '编程技术',
          level: '初级',
          memberCount: 33,
          createTime: '2天前创建',
          activity: '活跃度高'
        },
        {
          id: 'test_group_2',
          name: '设计师交流群',
          description: 'UI/UX设计师的学习和交流平台',
          interest: '设计',
          level: '初级',
          memberCount: 28,
          createTime: '2天前创建',
          activity: '活跃度高'
        }
      ];
      console.log('[群组匹配] 测试群组添加完成，数量:', this.recommendedGroups.length);
    },
    
    async joinGroup(group) {
      console.log('[群组匹配] 点击了加入群组按钮！', group);
      
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      try {
        console.log('[群组匹配] 准备加入群组:', group.name);
        
        // 显示确认对话框
        const confirmResult = await new Promise((resolve) => {
          uni.showModal({
            title: '加入小组',
            content: `确定要加入「${group.name}」吗？`,
            success: (res) => {
              resolve(res.confirm);
            },
            fail: () => {
              resolve(false);
            }
          });
        });
        
        if (!confirmResult) {
          return;
        }
        
        // 显示加载提示
        uni.showLoading({
          title: '正在加入...'
        });
        
        // 调用加入群组API
        const result = await GroupAPI.joinGroup(group.id, this.currentUserId);
        
        uni.hideLoading();
        
        if (result.success) {
          console.log('[群组匹配] 加入群组成功:', result);
          
          // 显示成功提示
          uni.showToast({
            title: '加入成功！',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟跳转到群组聊天室
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/groupChat/groupChat?groupId=${group.id}&groupName=${encodeURIComponent(group.name)}&justJoined=true`
            });
          }, 1500);
          
        } else {
          throw new Error(result.error || '加入群组失败');
        }
        
      } catch (error) {
        console.error('[群组匹配] 加入群组失败:', error);
        uni.hideLoading();
        
        let errorMessage = '加入失败';
        if (error.message) {
          if (error.message.includes('已经是群组成员')) {
            errorMessage = '您已经是该群组成员了';
          } else if (error.message.includes('群组人数已满')) {
            errorMessage = '群组人数已满';
          } else if (error.message.includes('群组不存在')) {
            errorMessage = '群组不存在';
          } else {
            errorMessage = error.message;
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        });
      }
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
  position: relative;
  text-align: center;
  margin-bottom: $space-8;
  padding: $space-6 $space-4;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 2;
}

.page-title {
  display: block;
  font-size: $text-3xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.page-subtitle {
  display: block;
  font-size: $text-base;
  color: $text-secondary;
  line-height: 1.5;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: $radius-full;
  opacity: 0.1;
  
  &.circle-1 {
    width: 200rpx;
    height: 200rpx;
    background: $primary-500;
    top: -50rpx;
    right: -50rpx;
    animation: float 6s ease-in-out infinite;
  }
  
  &.circle-2 {
    width: 120rpx;
    height: 120rpx;
    background: $secondary-500;
    bottom: -30rpx;
    left: -30rpx;
    animation: float 4s ease-in-out infinite reverse;
  }
  
  &.circle-3 {
    width: 80rpx;
    height: 80rpx;
    background: $accent-500;
    top: 50%;
    left: 10%;
    animation: float 5s ease-in-out infinite;
  }
}

.interest-card {
  margin-bottom: $space-6;
}

.interest-header {
  display: flex;
  align-items: center;
  margin-bottom: $space-4;
}

.interest-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $primary-500, $primary-600);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: $space-4;
}

.interest-info {
  flex: 1;
}

.interest-title {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-1;
}

.interest-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.picker-container {
  margin-top: $space-4;
}

.custom-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4;
  background: rgba($primary-50, 0.5);
  border: 2rpx solid $border-light;
  border-radius: $radius-xl;
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($primary-100, 0.7);
    border-color: $primary-300;
    transform: scale(0.98);
  }
}

.picker-text {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
}

.picker-arrow {
  font-size: $text-lg;
  color: $primary-500;
  font-weight: $font-bold;
  transform: rotate(90deg);
  transition: transform $duration-200 $easing-smooth;
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

.section-count {
  font-size: $text-sm;
  color: $text-secondary;
  background: rgba($primary-100, 0.6);
  padding: $space-1 $space-3;
  border-radius: $radius-full;
}

.groups-grid {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.group-card {
  transition: all $duration-300 $easing-smooth;
  
  &:hover {
    transform: translateY(-4rpx);
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
  background: linear-gradient(135deg, $secondary-400, $secondary-600);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $space-3;
  flex-shrink: 0;
}

.avatar-text {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $surface-primary;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
  line-height: 1.3;
}

.group-tags {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
}

.tag {
  font-size: $text-xs;
  color: $primary-600;
  background: rgba($primary-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
  border: 1rpx solid rgba($primary-300, 0.5);
}

.group-stats {
  text-align: right;
  flex-shrink: 0;
}

.member-count {
  font-size: $text-sm;
  color: $text-secondary;
  background: rgba($gray-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
}

.group-content {
  margin-bottom: $space-4;
}

.group-description {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.group-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $space-3;
  border-top: 1rpx solid $border-light;
}

.group-meta {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.create-time,
.activity {
  font-size: $text-xs;
  color: $text-tertiary;
}

.empty-state {
  text-align: center;
  padding: $space-12 $space-4;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $space-4;
}

.empty-title {
  display: block;
  font-size: $text-xl;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.empty-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.tips-card {
  margin-top: $space-6;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: $space-3;
}

.tip-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.tip-text {
  flex: 1;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.native-join-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  margin-left: 16rpx;
  z-index: 1000;
  position: relative;
}
</style>
