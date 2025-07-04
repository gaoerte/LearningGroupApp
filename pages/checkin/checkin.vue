<template>
  <view class="checkin-container">
    <!-- 头部状态区域 -->
    <view class="checkin-header fade-in">
      <view class="status-card">
        <view class="status-content">
          <text class="status-title">今日打卡状态</text>
          <view class="status-info">
            <text class="status-text" :class="{ 'completed': todayChecked }">
              {{ todayChecked ? '已完成打卡' : '还未打卡' }}
            </text>
            <text class="status-emoji">{{ todayChecked ? '✅' : '⏰' }}</text>
          </view>
          <text class="status-subtitle">
            {{ todayChecked ? '今天学习很棒哦！' : '记录今天的学习成果吧' }}
          </text>
        </view>
        
        <view class="streak-info">
          <text class="streak-number">{{ streakDays }}</text>
          <text class="streak-label">连续天数</text>
        </view>
      </view>
    </view>
    
    <!-- 打卡按钮区域 -->
    <view class="checkin-action slide-up" v-if="!todayChecked">
      <ModernCard variant="default" shadow="lg" class="action-card">
        <view class="action-content">
          <text class="action-title">记录今日学习</text>
          <text class="action-subtitle">分享你今天的学习收获</text>
          
          <ModernButton 
            variant="primary" 
            size="lg" 
            :loading="isSubmitting"
            :disabled="isSubmitting"
            block
            @tap="openCheckinModal"
            @click="openCheckinModal"
            class="checkin-button"
            style="pointer-events: auto; z-index: 10;"
          >
            <text>{{ isSubmitting ? '提交中...' : '开始打卡' }}</text>
          </ModernButton>

          <!-- 备用原生按钮 -->
          <button 
            class="native-checkin-button"
            type="primary"
            :disabled="isSubmitting"
            @tap="openCheckinModal"
            @click="openCheckinModal"
          >
            {{ isSubmitting ? '提交中...' : '备用按钮：开始打卡' }}
          </button>

          <!-- 调试信息 -->
          <view class="debug-info" style="margin-top: 16rpx; font-size: 24rpx; color: #666;">
            <text>调试：todayChecked={{ todayChecked }}, isSubmitting={{ isSubmitting }}, isModalVisible={{ isModalVisible }}</text>
          </view>
        </view>
      </ModernCard>
    </view>
    
    <!-- 已完成打卡的状态 -->
    <view class="checkin-completed slide-up" v-if="todayChecked">
      <ModernCard variant="success" shadow="lg" class="completed-card">
        <view class="completed-content">
          <text class="completed-icon">🎉</text>
          <text class="completed-title">今日打卡已完成</text>
          <text class="completed-subtitle">继续保持学习的好习惯！</text>
          
          <ModernButton 
            variant="primary" 
            size="lg" 
            @tap="goBackToHome"
            class="back-home-button"
          >
            <text>返回首页</text>
          </ModernButton>
        </view>
      </ModernCard>
    </view>
    
    <!-- 打卡历程 -->
    <view class="checkin-timeline scale-in">
      <ModernCard title="打卡历程" shadow="md" class="timeline-card">
        <view class="timeline-list">
          <view class="timeline-item" v-for="(checkin, index) in sortedCheckins" :key="index" :class="{ 'my-checkin': checkin.type === 'my-checkin' }">
            <view class="timeline-dot" :class="checkin.type"></view>
            <view class="timeline-content">
              <view class="timeline-header">
                <view class="timeline-name-wrapper">
                  <text class="timeline-name">{{ checkin.name }}</text>
                  <text v-if="checkin.type === 'my-checkin' && checkin.time === '刚刚'" class="new-badge">新</text>
                </view>
                <text class="timeline-time">{{ checkin.time }}</text>
              </view>
              <text class="timeline-text">{{ checkin.content }}</text>
              <view class="timeline-tags" v-if="checkin.tags">
                <text class="tag" v-for="tag in checkin.tags" :key="tag">{{ tag }}</text>
              </view>
            </view>
          </view>
          
          <view class="timeline-empty" v-if="sortedCheckins.length === 0">
            <text class="empty-text">暂无打卡记录</text>
            <text class="empty-hint">开始你的第一次打卡吧！</text>
          </view>
        </view>
      </ModernCard>
    </view>
    
    <!-- 打卡弹窗 - 简化版直接实现 -->
    <view v-if="isModalVisible" class="inline-modal-mask" @tap="closeModal">
      <view class="inline-modal-content" @tap.stop>
        <view class="inline-modal-header">
          <text class="inline-modal-title">今日学习打卡</text>
          <text class="inline-modal-close" @tap="closeModal">×</text>
        </view>
        
        <view class="inline-form-section">
          <view class="inline-form-group">
            <text class="inline-form-label">学习内容</text>
            <textarea 
              class="inline-form-textarea"
              v-model="checkinForm.content"
              placeholder="分享今天学了什么..."
              maxlength="200"
            />
          </view>
          
          <view class="inline-mood-section">
            <text class="inline-mood-label">今日心情</text>
            <view class="inline-mood-options">
              <view 
                class="inline-mood-item" 
                :class="{ active: checkinForm.mood === mood.value }"
                v-for="mood in moodOptions" 
                :key="mood.value"
                @tap="selectMood(mood.value)"
              >
                <text class="inline-mood-emoji">{{ mood.emoji }}</text>
                <text class="inline-mood-text">{{ mood.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="inline-tags-section">
            <text class="inline-tags-label">学习标签</text>
            <view class="inline-tags-options">
              <view 
                class="inline-tag-item" 
                :class="{ active: checkinForm.tags.includes(tag) }"
                v-for="tag in tagOptions" 
                :key="tag"
                @tap="toggleTag(tag)"
              >
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="inline-modal-actions">
          <button class="inline-cancel-btn" @tap="closeModal">
            取消
          </button>
          <button 
            class="inline-submit-btn" 
            :disabled="!checkinForm.content.trim() || isSubmitting"
            @tap="submitCheckin"
          >
            {{ isSubmitting ? '提交中...' : '完成打卡' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import ModernInput from '../../components/ModernInput.vue'
// import Modal from '../../components/Modal.vue' // 使用内联弹窗替代
import { StorageManager } from '../../utils/storage.js'
// import { notify } from '../../utils/notification.js' // 暂时注释掉，避免依赖问题

export default {
  name: 'CheckinPage',
  components: {
    ModernCard,
    ModernButton,
    ModernInput
    // Modal // 不再使用
  },
  data() {
    return {
      todayChecked: false,
      streakDays: 7,
      isModalVisible: false,
      isSubmitting: false,
      
      checkinForm: {
        content: '',
        mood: '',
        tags: []
      },
      
      moodOptions: [
        { value: 'happy', emoji: '😊', label: '开心' },
        { value: 'focused', emoji: '🎯', label: '专注' },
        { value: 'tired', emoji: '😴', label: '疲惫' },
        { value: 'excited', emoji: '🤩', label: '兴奋' }
      ],
      
      tagOptions: ['前端开发', 'Vue', 'JavaScript', '算法', '数据结构', '设计模式'],
      
      checkins: [
        { 
          name: '小张', 
          content: '今天学习了 Vue 3 的组合式 API，感觉很有收获！', 
          time: '2小时前',
          type: 'study',
          tags: ['Vue', '前端开发']
        },
        { 
          name: '小李', 
          content: '完成了算法练习，解决了几道二叉树的题目', 
          time: '5小时前',
          type: 'practice',
          tags: ['算法', '数据结构']
        },
        { 
          name: '小王', 
          content: '复习了JavaScript的闭包和原型链概念', 
          time: '1天前',
          type: 'review',
          tags: ['JavaScript']
        }
      ]
    }
  },
  computed: {
    sortedCheckins() {
      return this.checkins.slice().sort((a, b) => {
        // 优先显示用户自己的打卡记录（刚刚提交的）
        if (a.type === 'my-checkin' && b.type !== 'my-checkin') {
          return -1 // a 排在前面
        }
        if (b.type === 'my-checkin' && a.type !== 'my-checkin') {
          return 1 // b 排在前面
        }
        
        // 如果都是用户打卡或都不是，按时间排序
        const timeOrder = { 
          '刚刚': 10, 
          '1分钟前': 9,
          '5分钟前': 8,
          '10分钟前': 7,
          '30分钟前': 6,
          '1小时前': 5,
          '2小时前': 4, 
          '5小时前': 3, 
          '1天前': 2,
          '2天前': 1
        }
        return (timeOrder[b.time] || 0) - (timeOrder[a.time] || 0)
      })
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.refreshPageData()
  },
  methods: {
    initPage() {
      try {
        console.log('[打卡页] 初始化开始')
        this.checkLoginStatus()
        this.loadCheckinStatus()
        this.loadCheckinHistory()
        console.log('[打卡页] 初始化完成')
      } catch (error) {
        console.error('[打卡页] 初始化失败:', error)
        this.notifyError('页面初始化失败', '请尝试重新进入页面')
      }
    },
    
    checkLoginStatus() {
      try {
        // 使用 StorageManager 正确检查登录状态
        const isLoggedIn = StorageManager.isLoggedIn();
        const token = StorageManager.getToken();
        
        console.log('[打卡页] 登录状态检查:', { isLoggedIn, hasToken: !!token });
        
        if (!isLoggedIn || !token) {
          console.log('[打卡页] 用户未登录，提示登录')
          uni.showModal({
            title: '需要登录',
            content: '使用打卡功能需要先登录，是否立即登录？',
            confirmText: '立即登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                uni.reLaunch({
                  url: '/pages/login/login'
                })
              } else {
                uni.switchTab({
                  url: '/pages/index/index'
                })
              }
            }
          })
          return false
        }
        
        console.log('[打卡页] 用户已登录，token:', token)
        return true
      } catch (error) {
        console.error('[打卡页] 检查登录状态失败:', error)
        return false
      }
    },
    
    refreshPageData() {
      try {
        this.loadCheckinStatus()
      } catch (error) {
        console.error('刷新页面数据失败:', error)
      }
    },
    
    loadCheckinStatus() {
      try {
        const today = new Date().toDateString()
        const lastCheckinDate = uni.getStorageSync('lastCheckinDate')
        const savedStreak = uni.getStorageSync('checkinStreak')
        
        this.todayChecked = lastCheckinDate === today
        this.streakDays = savedStreak || 0
        
        console.log('打卡状态加载:', {
          today,
          lastCheckinDate,
          todayChecked: this.todayChecked,
          streakDays: this.streakDays
        })
      } catch (error) {
        console.error('加载打卡状态失败:', error)
        this.todayChecked = false
        this.streakDays = 0
      }
    },
    
    loadCheckinHistory() {
      try {
        // 这里可以从本地存储或API加载历史记录
        // 暂时使用默认的模拟数据
        console.log('打卡历史加载完成')
      } catch (error) {
        console.error('加载打卡历史失败:', error)
      }
    },
    
    openCheckinModal() {
      console.log('[打卡页] 点击开始打卡按钮')
      console.log('[打卡页] 当前状态:', {
        todayChecked: this.todayChecked,
        isSubmitting: this.isSubmitting,
        isModalVisible: this.isModalVisible
      })
      
      if (this.isSubmitting) {
        console.log('[打卡页] 正在提交中，忽略点击')
        return
      }
      
      if (this.todayChecked) {
        console.log('[打卡页] 今日已打卡，忽略点击')
        return
      }
      
      this.isModalVisible = true
      console.log('[打卡页] 弹窗已显示:', this.isModalVisible)
    },
    
    closeModal() {
      console.log('[打卡页] 关闭弹窗')
      this.isModalVisible = false
      this.resetForm()
    },
    
    resetForm() {
      console.log('[打卡页] 重置表单')
      this.checkinForm = {
        content: '',
        mood: '',
        tags: []
      }
    },
    
    selectMood(mood) {
      this.checkinForm.mood = mood
    },
    
    toggleTag(tag) {
      const index = this.checkinForm.tags.indexOf(tag)
      if (index > -1) {
        this.checkinForm.tags.splice(index, 1)
      } else {
        this.checkinForm.tags.push(tag)
      }
    },
    
    async submitCheckin() {
      if (!this.checkinForm.content.trim()) {
        uni.showToast({
          title: '请填写学习内容',
          icon: 'none'
        })
        return
      }
      
      this.isSubmitting = true
      
      try {
        // 模拟提交延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 获取当前时间
        const currentTime = this.formatTimeToISO(new Date())
        
        // 添加新的打卡记录到列表最前面
        const newCheckin = {
          name: '我',
          content: this.checkinForm.content,
          time: '刚刚',
          type: 'my-checkin',
          tags: [...this.checkinForm.tags],
          mood: this.checkinForm.mood,
          timestamp: Date.now() // 添加时间戳用于准确排序
        }
        
        // 使用 unshift 添加到数组开头，确保显示在最前面
        this.checkins.unshift(newCheckin)
        
        console.log('[打卡页] 新打卡记录已添加:', newCheckin)
        console.log('[打卡页] 当前打卡记录数量:', this.checkins.length)
        
        // 更新本地存储
        const today = new Date().toDateString()
        uni.setStorageSync('lastCheckinDate', today)
        uni.setStorageSync('checkinStreak', this.streakDays + 1)
        
        // 更新状态
        this.todayChecked = true
        this.streakDays += 1
        
        // 关闭弹窗
        this.closeModal()
        
        // 显示成功提示
        uni.showToast({
          title: '打卡成功！',
          icon: 'success'
        })
        
        // 触发打卡成功动画
        this.celebrateCheckin()
        
        // 延迟1.5秒后询问是否返回首页
        setTimeout(() => {
          this.showReturnHomeDialog()
        }, 1500)
        
      } catch (error) {
        console.error('提交打卡失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
        
        // 使用通知系统记录错误
        this.notifyError('打卡提交失败', error.message || '网络连接异常')
      } finally {
        this.isSubmitting = false
      }
    },
    
    celebrateCheckin() {
      // 打卡成功的庆祝动画
      uni.showToast({
        title: `连续打卡 ${this.streakDays} 天！`,
        icon: 'success',
        duration: 2000
      })
    },
    
    showReturnHomeDialog() {
      uni.showModal({
        title: '打卡完成',
        content: '恭喜完成今日打卡！是否返回首页？',
        confirmText: '返回首页',
        cancelText: '继续浏览',
        success: (res) => {
          if (res.confirm) {
            this.goBackToHome()
          }
        }
      })
    },
    
    goBackToHome() {
      // 返回首页，由于首页在tabBar中，需要使用switchTab
      uni.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('成功返回首页')
        },
        fail: (err) => {
          console.error('返回首页失败:', err)
          // 如果switchTab失败，尝试使用navigateBack
          uni.navigateBack({
            delta: 1,
            fail: (backErr) => {
              console.error('navigateBack失败:', backErr)
              // 最后尝试使用reLaunch
              uni.reLaunch({
                url: '/pages/index/index',
                fail: (relaunchErr) => {
                  console.error('reLaunch失败:', relaunchErr)
                  uni.showToast({
                    title: '返回首页失败',
                    icon: 'none'
                  })
                }
              })
            }
          })
        }
      })
    },
    
    formatTimeToISO(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
    },
    
    // 通知相关方法
    notifyError(title, content) {
      try {
        console.error('[打卡页] 错误:', title, content)
        // 暂时使用 uni.showModal 替代 notify
        uni.showModal({
          title: title || '错误',
          content: content || '发生未知错误',
          showCancel: false
        })
      } catch (error) {
        console.error('发送错误通知失败:', error)
      }
    },
    
    notifySuccess(title, content) {
      try {
        console.log('[打卡页] 成功:', title, content)
        // 暂时使用 uni.showToast 替代 notify
        uni.showToast({
          title: title || '操作成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('发送成功通知失败:', error)
      }
    }
  },
  
  // 配置分享内容
  onShareAppMessage() {
    return {
      title: `我已连续打卡${this.streakDays}天！一起来学习吧`,
      path: '/pages/checkin/checkin'
    }
  }
}
</script>

<style lang="scss" scoped>
// 基础变量定义
$primary-color: #667eea;
$success-color: #10b981;
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$white: #ffffff;

.checkin-container {
  min-height: 100vh;
  background: $gray-50;
  padding: 32rpx;
}

.checkin-header {
  margin-bottom: 48rpx;
  
  .status-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24rpx;
    padding: 48rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.15);
    
    .status-content {
      flex: 1;
      
      .status-title {
        color: rgba(255, 255, 255, 0.9);
        font-size: 28rpx;
        font-weight: normal;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .status-info {
        display: flex;
        align-items: center;
        gap: 16rpx;
        margin-bottom: 16rpx;
        
        .status-text {
          color: $white;
          font-size: 40rpx;
          font-weight: bold;
          
          &.completed {
            color: #4ade80;
          }
        }
        
        .status-emoji {
          font-size: 48rpx;
        }
      }
      
      .status-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: 28rpx;
      }
    }
    
    .streak-info {
      text-align: center;
      padding: 24rpx;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16rpx;
      
      .streak-number {
        color: $white;
        font-size: 64rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .streak-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: 24rpx;
      }
    }
  }
}

.checkin-action {
  margin-bottom: 48rpx;
  
  .action-card {
    .action-content {
      text-align: center;
      
      .action-title {
        font-size: 40rpx;
        font-weight: 600;
        color: $gray-800;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .action-subtitle {
        font-size: 32rpx;
        color: $gray-600;
        display: block;
        margin-bottom: 48rpx;
      }
      
      .checkin-button {
        border-radius: 16rpx;
        width: 100%;
        margin-bottom: 16rpx;
      }

      .native-checkin-button {
        width: 100%;
        height: 80rpx;
        border-radius: 16rpx;
        background: #f39c12;
        color: white;
        font-size: 32rpx;
        border: none;
        margin-bottom: 16rpx;
      }
    }
  }
}

.checkin-completed {
  margin-bottom: 48rpx;
  
  .completed-card {
    .completed-content {
      text-align: center;
      
      .completed-icon {
        font-size: 120rpx;
        display: block;
        margin-bottom: 32rpx;
      }
      
      .completed-title {
        font-size: 40rpx;
        font-weight: 600;
        color: $gray-800;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .completed-subtitle {
        font-size: 32rpx;
        color: $gray-600;
        display: block;
        margin-bottom: 48rpx;
      }
      
      .back-home-button {
        border-radius: 16rpx;
        width: 100%;
      }
    }
  }
}

.checkin-timeline {
  .timeline-card {
    .timeline-list {
      .timeline-item {
        position: relative;
        display: flex;
        padding: 32rpx 0;
        border-bottom: 1px solid $gray-200;
        
        &:last-child {
          border-bottom: none;
        }
        
        // 用户自己的打卡记录特殊样式
        &.my-checkin {
          background: rgba(102, 126, 234, 0.05);
          margin: 0 -32rpx;
          padding: 32rpx;
          border-radius: 12rpx;
          border: 2rpx solid rgba(102, 126, 234, 0.2);
          
          .timeline-name {
            color: $primary-color;
            font-weight: bold;
          }
        }
        
        .timeline-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: 50%;
          margin-right: 32rpx;
          margin-top: 8rpx;
          flex-shrink: 0;
          
          &.study { background: $primary-color; }
          &.practice { background: $success-color; }
          &.review { background: #f59e0b; }
          &.my-checkin { 
            background: $primary-color; 
            box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.2);
          }
        }
        
        .timeline-content {
          flex: 1;
          
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16rpx;
            
            .timeline-name-wrapper {
              display: flex;
              align-items: center;
              gap: 12rpx;
            }
            
            .timeline-name {
              font-size: 32rpx;
              font-weight: 600;
              color: $gray-800;
            }
            
            .new-badge {
              background: #ff6b6b;
              color: white;
              font-size: 20rpx;
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
              font-weight: bold;
              animation: pulse 2s infinite;
            }
            
            .timeline-time {
              font-size: 24rpx;
              color: $gray-500;
            }
          }
          
          .timeline-text {
            font-size: 28rpx;
            color: $gray-700;
            line-height: 1.6;
            margin-bottom: 16rpx;
          }
          
          .timeline-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 16rpx;
            
            .tag {
              background: $gray-100;
              color: $gray-600;
              padding: 8rpx 16rpx;
              border-radius: 8rpx;
              font-size: 24rpx;
            }
          }
        }
      }
      
      .timeline-empty {
        text-align: center;
        padding: 64rpx;
        
        .empty-text {
          font-size: 32rpx;
          color: $gray-500;
          display: block;
          margin-bottom: 16rpx;
        }
        
        .empty-hint {
          font-size: 28rpx;
          color: $gray-300;
        }
      }
    }
  }
}

.checkin-modal {
  .modal-content {
    padding: 48rpx;
    
    .modal-title {
      font-size: 48rpx;
      font-weight: bold;
      color: $gray-800;
      text-align: center;
      margin-bottom: 48rpx;
    }
    
    .form-section {
      margin-bottom: 48rpx;
      
      .content-input {
        margin-bottom: 32rpx;
      }
      
      .mood-section {
        margin-bottom: 32rpx;
        
        .mood-label {
          font-size: 32rpx;
          font-weight: 500;
          color: $gray-700;
          display: block;
          margin-bottom: 24rpx;
        }
        
        .mood-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24rpx;
          
          .mood-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 24rpx;
            border: 2rpx solid $gray-300;
            border-radius: 12rpx;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &.active {
              border-color: $primary-color;
              background: rgba(102, 126, 234, 0.1);
            }
            
            .mood-emoji {
              font-size: 48rpx;
              margin-bottom: 8rpx;
            }
            
            .mood-text {
              font-size: 28rpx;
              color: $gray-700;
            }
          }
        }
      }
      
      .tags-section {
        .tags-label {
          font-size: 32rpx;
          font-weight: 500;
          color: $gray-700;
          display: block;
          margin-bottom: 24rpx;
        }
        
        .tags-options {
          display: flex;
          flex-wrap: wrap;
          gap: 16rpx;
          
          .tag-item {
            padding: 16rpx 24rpx;
            border: 2rpx solid $gray-300;
            border-radius: 12rpx;
            font-size: 28rpx;
            color: $gray-700;
            transition: all 0.3s ease;
            cursor: pointer;
            
            &.active {
              border-color: $primary-color;
              background: $primary-color;
              color: $white;
            }
          }
        }
      }
    }
    
    .modal-actions {
      display: flex;
      gap: 24rpx;
      
      .cancel-btn {
        flex: 1;
      }
      
      .submit-btn {
        flex: 2;
      }
    }
  }
}

// 响应式设计
@media (max-width: 750rpx) {
  .checkin-container {
    padding: 24rpx;
  }
  
  .checkin-header {
    .status-card {
      padding: 32rpx;
      flex-direction: column;
      text-align: center;
      gap: 32rpx;
      
      .status-content {
        .status-info {
          justify-content: center;
          
          .status-text {
            font-size: 36rpx;
          }
        }
      }
      
      .streak-info {
        .streak-number {
          font-size: 48rpx;
        }
      }
    }
  }
  
  .checkin-modal {
    .modal-content {
      padding: 32rpx;
      
      .form-section {
        .mood-section {
          .mood-options {
            grid-template-columns: repeat(4, 1fr);
            gap: 16rpx;
            
            .mood-item {
              padding: 16rpx;
              
              .mood-emoji {
                font-size: 40rpx;
              }
              
              .mood-text {
                font-size: 24rpx;
              }
            }
          }
        }
      }
      
      .modal-actions {
        flex-direction: column;
        
        .cancel-btn,
        .submit-btn {
          flex: none;
        }
      }
    }
  }
}

// 内联弹窗样式
.inline-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.inline-modal-content {
  background: white;
  width: 90%;
  max-width: 600rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.inline-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.inline-modal-title {
  font-size: 36rpx;
  font-weight: bold;
}

.inline-modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.inline-form-section {
  padding: 32rpx;
}

.inline-form-group {
  margin-bottom: 32rpx;
}

.inline-form-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.inline-form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  background: #fafafa;
}

.inline-mood-section {
  margin-bottom: 32rpx;
}

.inline-mood-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.inline-mood-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.inline-mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  background: #fafafa;
  
  &.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
}

.inline-mood-emoji {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.inline-mood-text {
  font-size: 28rpx;
  color: #666;
}

.inline-tags-section {
  margin-bottom: 32rpx;
}

.inline-tags-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
}

.inline-tags-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.inline-tag-item {
  padding: 16rpx 24rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
  background: #fafafa;
  
  &.active {
    border-color: #667eea;
    background: #667eea;
    color: white;
  }
}

.inline-modal-actions {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: #f8f8f8;
}

.inline-cancel-btn,
.inline-submit-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  border: none;
}

.inline-cancel-btn {
  background: #e5e5e5;
  color: #666;
}

.inline-submit-btn {
  background: #667eea;
  color: white;
  
  &:disabled {
    background: #ccc;
    color: #999;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    transform: scale(0.9) translateY(-50rpx);
    opacity: 0;
  }
  to { 
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  70% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 10rpx rgba(255, 107, 107, 0);
  }
  100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}
</style>
