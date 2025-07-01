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
            class="checkin-button"
          >
            <text>{{ isSubmitting ? '提交中...' : '开始打卡' }}</text>
          </ModernButton>
        </view>
      </ModernCard>
    </view>
    
    <!-- 打卡历程 -->
    <view class="checkin-timeline scale-in">
      <ModernCard title="打卡历程" shadow="md" class="timeline-card">
        <view class="timeline-list">
          <view class="timeline-item" v-for="(checkin, index) in sortedCheckins" :key="index">
            <view class="timeline-dot" :class="checkin.type"></view>
            <view class="timeline-content">
              <view class="timeline-header">
                <text class="timeline-name">{{ checkin.name }}</text>
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
    
    <!-- 打卡弹窗 -->
    <Modal v-if="isModalVisible" @close="closeModal" class="checkin-modal">
      <view class="modal-content">
        <text class="modal-title">今日学习打卡</text>
        
        <view class="form-section">
          <ModernInput
            v-model="checkinForm.content"
            label="学习内容"
            placeholder="分享今天学了什么..."
            :maxlength="200"
            class="content-input"
          />
          
          <view class="mood-section">
            <text class="mood-label">今日心情</text>
            <view class="mood-options">
              <view 
                class="mood-item" 
                :class="{ active: checkinForm.mood === mood.value }"
                v-for="mood in moodOptions" 
                :key="mood.value"
                @tap="selectMood(mood.value)"
              >
                <text class="mood-emoji">{{ mood.emoji }}</text>
                <text class="mood-text">{{ mood.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="tags-section">
            <text class="tags-label">学习标签</text>
            <view class="tags-options">
              <view 
                class="tag-item" 
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
        
        <view class="modal-actions">
          <ModernButton variant="outline" @tap="closeModal" class="cancel-btn">
            取消
          </ModernButton>
          <ModernButton 
            variant="primary" 
            :loading="isSubmitting"
            :disabled="!checkinForm.content.trim() || isSubmitting"
            @tap="submitCheckin"
            class="submit-btn"
          >
            {{ isSubmitting ? '提交中...' : '完成打卡' }}
          </ModernButton>
        </view>
      </view>
    </Modal>
  </view>
</template>

<script>
import ModernCard from '@/components/ModernCard.vue'
import ModernButton from '@/components/ModernButton.vue'
import ModernInput from '@/components/ModernInput.vue'
import Modal from '@/components/Modal.vue'

export default {
  name: 'CheckinPage',
  components: {
    ModernCard,
    ModernButton,
    ModernInput,
    Modal
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
        // 简单的时间排序，实际项目中应该使用真实的时间戳
        const timeOrder = { '2小时前': 3, '5小时前': 2, '1天前': 1 }
        return (timeOrder[b.time] || 0) - (timeOrder[a.time] || 0)
      })
    }
  },
  onLoad() {
    this.checkTodayStatus()
    this.loadCheckinData()
  },
  methods: {
    checkTodayStatus() {
      // 检查今天是否已经打卡
      const today = new Date().toDateString()
      const lastCheckinDate = uni.getStorageSync('lastCheckinDate')
      this.todayChecked = lastCheckinDate === today
    },
    
    loadCheckinData() {
      try {
        const streakData = uni.getStorageSync('checkinStreak')
        if (streakData) {
          this.streakDays = streakData
        }
      } catch (error) {
        console.error('加载打卡数据失败:', error)
      }
    },
    
    openCheckinModal() {
      this.isModalVisible = true
    },
    
    closeModal() {
      this.isModalVisible = false
      this.resetForm()
    },
    
    resetForm() {
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
        
        // 添加新的打卡记录
        this.checkins.unshift({
          name: '我',
          content: this.checkinForm.content,
          time: '刚刚',
          type: 'my-checkin',
          tags: this.checkinForm.tags
        })
        
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
        
      } catch (error) {
        console.error('提交打卡失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
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
    
    formatTimeToISO(date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
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
@import '@/styles/variables.scss';

.checkin-container {
  min-height: 100vh;
  background: $gray-50;
  padding: $space-4;
}

.checkin-header {
  margin-bottom: $space-6;
  
  .status-card {
    background: $gradient-primary;
    border-radius: $radius-xl;
    padding: $space-6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: $shadow-primary;
    
    .status-content {
      flex: 1;
      
      .status-title {
        color: rgba(255, 255, 255, 0.9);
        font-size: $text-sm;
        font-weight: $font-normal;
        display: block;
        margin-bottom: $space-2;
      }
      
      .status-info {
        display: flex;
        align-items: center;
        gap: $space-2;
        margin-bottom: $space-2;
        
        .status-text {
          color: $white;
          font-size: $text-xl;
          font-weight: $font-bold;
          
          &.completed {
            color: #4ade80;
          }
        }
        
        .status-emoji {
          font-size: $text-2xl;
        }
      }
      
      .status-subtitle {
        color: rgba(255, 255, 255, 0.8);
        font-size: $text-sm;
      }
    }
    
    .streak-info {
      text-align: center;
      padding: $space-3;
      background: rgba(255, 255, 255, 0.15);
      border-radius: $radius-lg;
      
      .streak-number {
        color: $white;
        font-size: $text-3xl;
        font-weight: $font-bold;
        display: block;
        margin-bottom: $space-1;
      }
      
      .streak-label {
        color: rgba(255, 255, 255, 0.8);
        font-size: $text-xs;
      }
    }
  }
}

.checkin-action {
  margin-bottom: $space-6;
  
  .action-card {
    .action-content {
      text-align: center;
      
      .action-title {
        font-size: $text-xl;
        font-weight: $font-semibold;
        color: $gray-800;
        display: block;
        margin-bottom: $space-2;
      }
      
      .action-subtitle {
        font-size: $text-base;
        color: $gray-600;
        margin-bottom: $space-6;
      }
      
      .checkin-button {
        border-radius: $radius-xl;
        box-shadow: $shadow-primary;
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
        padding: $space-4 0;
        border-bottom: 1px solid $gray-200;
        
        &:last-child {
          border-bottom: none;
        }
        
        .timeline-dot {
          width: 24rpx;
          height: 24rpx;
          border-radius: $radius-full;
          margin-right: $space-4;
          margin-top: $space-1;
          flex-shrink: 0;
          
          &.study { background: $primary-500; }
          &.practice { background: $success; }
          &.review { background: $warning; }
          &.my-checkin { background: $secondary-500; }
        }
        
        .timeline-content {
          flex: 1;
          
          .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: $space-2;
            
            .timeline-name {
              font-size: $text-base;
              font-weight: $font-semibold;
              color: $gray-800;
            }
            
            .timeline-time {
              font-size: $text-xs;
              color: $gray-500;
            }
          }
          
          .timeline-text {
            font-size: $text-sm;
            color: $gray-700;
            line-height: $leading-relaxed;
            margin-bottom: $space-2;
          }
          
          .timeline-tags {
            display: flex;
            flex-wrap: wrap;
            gap: $space-2;
            
            .tag {
              background: $gray-100;
              color: $gray-600;
              padding: $space-1 $space-2;
              border-radius: $radius-sm;
              font-size: $text-xs;
            }
          }
        }
      }
      
      .timeline-empty {
        text-align: center;
        padding: $space-8;
        
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

.checkin-modal {
  .modal-content {
    padding: $space-6;
    
    .modal-title {
      font-size: $text-2xl;
      font-weight: $font-bold;
      color: $gray-800;
      text-align: center;
      margin-bottom: $space-6;
    }
    
    .form-section {
      margin-bottom: $space-6;
      
      .content-input {
        margin-bottom: $space-4;
      }
      
      .mood-section {
        margin-bottom: $space-4;
        
        .mood-label {
          font-size: $text-base;
          font-weight: $font-medium;
          color: $gray-700;
          display: block;
          margin-bottom: $space-3;
        }
        
        .mood-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: $space-3;
          
          .mood-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: $space-3;
            border: 2rpx solid $gray-300;
            border-radius: $radius-md;
            transition: all $transition-normal;
            cursor: pointer;
            
            &.active {
              border-color: $primary-500;
              background: $primary-50;
            }
            
            .mood-emoji {
              font-size: $text-2xl;
              margin-bottom: $space-1;
            }
            
            .mood-text {
              font-size: $text-sm;
              color: $gray-700;
            }
          }
        }
      }
      
      .tags-section {
        .tags-label {
          font-size: $text-base;
          font-weight: $font-medium;
          color: $gray-700;
          display: block;
          margin-bottom: $space-3;
        }
        
        .tags-options {
          display: flex;
          flex-wrap: wrap;
          gap: $space-2;
          
          .tag-item {
            padding: $space-2 $space-3;
            border: 2rpx solid $gray-300;
            border-radius: $radius-md;
            font-size: $text-sm;
            color: $gray-700;
            transition: all $transition-normal;
            cursor: pointer;
            
            &.active {
              border-color: $primary-500;
              background: $primary-500;
              color: $white;
            }
          }
        }
      }
    }
    
    .modal-actions {
      display: flex;
      gap: $space-3;
      
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
@media (max-width: $breakpoint-sm) {
  .checkin-container {
    padding: $space-3;
  }
  
  .checkin-header {
    .status-card {
      padding: $space-4;
      flex-direction: column;
      text-align: center;
      gap: $space-4;
      
      .status-content {
        .status-info {
          justify-content: center;
          
          .status-text {
            font-size: $text-lg;
          }
        }
      }
      
      .streak-info {
        .streak-number {
          font-size: $text-2xl;
        }
      }
    }
  }
  
  .checkin-modal {
    .modal-content {
      padding: $space-4;
      
      .form-section {
        .mood-section {
          .mood-options {
            grid-template-columns: repeat(4, 1fr);
            gap: $space-2;
            
            .mood-item {
              padding: $space-2;
              
              .mood-emoji {
                font-size: $text-xl;
              }
              
              .mood-text {
                font-size: $text-xs;
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
</style>
