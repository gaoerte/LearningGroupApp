<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="header-content">
        <text class="page-title">智能推荐</text>
        <text class="page-subtitle">根据你的兴趣找到最合适的学习小组</text>
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
              @click="joinGroup(group)"
            >
              加入小组
            </modern-button>
          </view>
        </modern-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="selectedInterest">
      <view class="empty-icon">🔍</view>
      <text class="empty-title">暂无推荐小组</text>
      <text class="empty-desc">该兴趣领域暂时没有合适的学习小组，请尝试其他兴趣</text>
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

export default {
  components: {
    ModernCard,
    ModernButton
  },
  data() {
    return {
      selectedInterest: null,
      interests: ['数学', '编程', '英语', '物理', '化学', '生物', '历史', '地理'],
      recommendedGroups: []
    }
  },
  methods: {
    selectInterest(e) {
      const selectedIndex = e.detail.value
      this.selectedInterest = this.interests[selectedIndex]
      this.filterGroupsByInterest(this.selectedInterest)
    },
    
    filterGroupsByInterest(interest) {
      const allGroups = {
        '数学': [
          { 
            name: '高等数学研讨小组', 
            description: '深入探讨微积分、线性代数等高等数学知识，适合大学生和数学爱好者',
            interest: '数学',
            level: '中级',
            memberCount: 24,
            createTime: '3天前创建',
            activity: '活跃度高'
          },
          { 
            name: '数学建模竞赛队', 
            description: '准备数学建模竞赛，提升数学应用能力和团队协作能力',
            interest: '数学',
            level: '高级',
            memberCount: 15,
            createTime: '1周前创建',
            activity: '活跃度高'
          }
        ],
        '编程': [
          { 
            name: 'Python学习小组', 
            description: '从零开始学习Python编程，包括基础语法、数据分析、web开发等',
            interest: '编程',
            level: '初级',
            memberCount: 32,
            createTime: '2天前创建',
            activity: '活跃度高'
          },
          { 
            name: '前端开发交流群', 
            description: '分享前端开发技术，包括Vue、React、小程序开发等前沿技术',
            interest: '编程',
            level: '中级',
            memberCount: 28,
            createTime: '5天前创建',
            activity: '活跃度中'
          },
          { 
            name: '算法竞赛训练营', 
            description: '提升算法编程能力，准备ACM、蓝桥杯等编程竞赛',
            interest: '编程',
            level: '高级',
            memberCount: 18,
            createTime: '1周前创建',
            activity: '活跃度高'
          }
        ],
        '英语': [
          { 
            name: '英语口语练习小组', 
            description: '通过日常对话练习提升英语口语水平，营造纯英语交流环境',
            interest: '英语',
            level: '中级',
            memberCount: 20,
            createTime: '4天前创建',
            activity: '活跃度高'
          },
          { 
            name: '雅思托福备考群', 
            description: '专注雅思托福考试备考，分享学习资料和备考经验',
            interest: '英语',
            level: '高级',
            memberCount: 26,
            createTime: '6天前创建',
            activity: '活跃度中'
          }
        ],
        '物理': [
          { 
            name: '大学物理学习小组', 
            description: '探讨力学、电磁学、热学等大学物理知识，解决学习难题',
            interest: '物理',
            level: '中级',
            memberCount: 16,
            createTime: '5天前创建',
            activity: '活跃度中'
          }
        ]
      }
      
      this.recommendedGroups = allGroups[interest] || []
    },
    
    joinGroup(group) {
      uni.showModal({
        title: '加入小组',
        content: `确定要加入「${group.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: `成功加入${group.name}`,
              icon: 'success',
              duration: 2000
            })
            
            // 这里可以添加实际的加入小组逻辑
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/studyGroups/studyGroups'
              })
            }, 2000)
          }
        }
      })
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
</style>
