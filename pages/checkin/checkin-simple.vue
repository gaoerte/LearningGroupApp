<template>
  <view class="checkin-simple">
    <!-- 顶部状态 -->
    <view class="status-header">
      <text class="status-title">今日打卡状态</text>
      <text class="status-text" :class="{ completed: todayChecked }">
        {{ todayChecked ? '✅ 已完成打卡' : '⏰ 还未打卡' }}
      </text>
    </view>

    <!-- 打卡按钮区域 -->
    <view class="action-section" v-if="!todayChecked">
      <button 
        class="checkin-btn" 
        type="primary" 
        :disabled="isSubmitting"
        @click="handleCheckinClick"
      >
        {{ isSubmitting ? '提交中...' : '开始打卡' }}
      </button>
      
      <text class="debug-info">点击状态: {{ clickCount }} 次</text>
    </view>

    <!-- 已完成状态 -->
    <view class="completed-section" v-if="todayChecked">
      <text class="completed-text">🎉 今日打卡已完成！</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>

    <!-- 简化的打卡弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">学习打卡</text>
        
        <view class="form-group">
          <text class="label">今天学了什么？</text>
          <textarea 
            class="textarea"
            v-model="content"
            placeholder="分享今天的学习内容..."
            maxlength="200"
          />
        </view>

        <view class="modal-actions">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button 
            class="submit-btn" 
            type="primary" 
            :disabled="!content.trim() || isSubmitting"
            @click="submitCheckin"
          >
            {{ isSubmitting ? '提交中...' : '完成打卡' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 调试信息 -->
    <view class="debug-section">
      <text class="debug-title">调试信息</text>
      <text class="debug-item">Modal状态: {{ showModal ? '显示' : '隐藏' }}</text>
      <text class="debug-item">是否提交中: {{ isSubmitting ? '是' : '否' }}</text>
      <text class="debug-item">今日是否打卡: {{ todayChecked ? '是' : '否' }}</text>
      <text class="debug-item">内容长度: {{ content.length }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CheckinSimple',
  data() {
    return {
      todayChecked: false,
      showModal: false,
      isSubmitting: false,
      content: '',
      clickCount: 0
    }
  },
  onLoad() {
    console.log('[简化打卡] 页面加载')
    this.loadCheckinStatus()
  },
  methods: {
    loadCheckinStatus() {
      try {
        const today = new Date().toDateString()
        const lastCheckin = uni.getStorageSync('simple_checkin_date')
        this.todayChecked = lastCheckin === today
        console.log('[简化打卡] 状态加载:', { today, lastCheckin, todayChecked: this.todayChecked })
      } catch (error) {
        console.error('[简化打卡] 状态加载失败:', error)
      }
    },

    handleCheckinClick() {
      console.log('[简化打卡] 点击开始打卡')
      this.clickCount++
      
      if (this.isSubmitting) {
        console.log('[简化打卡] 正在提交中，忽略点击')
        return
      }

      this.showModal = true
      console.log('[简化打卡] 弹窗已显示:', this.showModal)
    },

    closeModal() {
      console.log('[简化打卡] 关闭弹窗')
      this.showModal = false
      this.content = ''
    },

    async submitCheckin() {
      if (!this.content.trim()) {
        uni.showToast({
          title: '请填写学习内容',
          icon: 'none'
        })
        return
      }

      console.log('[简化打卡] 开始提交:', this.content)
      this.isSubmitting = true

      try {
        // 模拟提交延迟
        await new Promise(resolve => setTimeout(resolve, 1500))

        // 保存打卡状态
        const today = new Date().toDateString()
        uni.setStorageSync('simple_checkin_date', today)
        uni.setStorageSync('simple_checkin_content', this.content)

        // 更新状态
        this.todayChecked = true
        this.closeModal()

        // 成功提示
        uni.showToast({
          title: '打卡成功！',
          icon: 'success'
        })

        console.log('[简化打卡] 提交成功')

      } catch (error) {
        console.error('[简化打卡] 提交失败:', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isSubmitting = false
      }
    },

    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.checkin-simple {
  min-height: 100vh;
  padding: 32rpx;
  background: #f5f5f5;
}

.status-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48rpx 32rpx;
  border-radius: 16rpx;
  text-align: center;
  margin-bottom: 32rpx;
  color: white;

  .status-title {
    display: block;
    font-size: 32rpx;
    margin-bottom: 16rpx;
    opacity: 0.9;
  }

  .status-text {
    display: block;
    font-size: 40rpx;
    font-weight: bold;
    
    &.completed {
      color: #4ade80;
    }
  }
}

.action-section {
  text-align: center;
  margin-bottom: 32rpx;

  .checkin-btn {
    width: 80%;
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
  }

  .debug-info {
    display: block;
    font-size: 28rpx;
    color: #666;
  }
}

.completed-section {
  text-align: center;
  background: white;
  padding: 64rpx 32rpx;
  border-radius: 16rpx;
  margin-bottom: 32rpx;

  .completed-text {
    display: block;
    font-size: 40rpx;
    margin-bottom: 32rpx;
    color: #10b981;
  }

  .back-btn {
    width: 200rpx;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 32rpx;
  }
}

.modal-mask {
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

  .modal-content {
    background: white;
    width: 90%;
    max-width: 600rpx;
    border-radius: 16rpx;
    padding: 48rpx 32rpx;

    .modal-title {
      display: block;
      text-align: center;
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 32rpx;
      color: #333;
    }

    .form-group {
      margin-bottom: 32rpx;

      .label {
        display: block;
        font-size: 32rpx;
        color: #333;
        margin-bottom: 16rpx;
      }

      .textarea {
        width: 100%;
        min-height: 200rpx;
        padding: 24rpx;
        border: 2rpx solid #e5e5e5;
        border-radius: 12rpx;
        font-size: 30rpx;
        box-sizing: border-box;
      }
    }

    .modal-actions {
      display: flex;
      gap: 24rpx;

      .cancel-btn,
      .submit-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 40rpx;
        font-size: 32rpx;
      }
    }
  }
}

.debug-section {
  background: white;
  padding: 32rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e5e5e5;

  .debug-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 16rpx;
    color: #333;
  }

  .debug-item {
    display: block;
    font-size: 28rpx;
    color: #666;
    margin-bottom: 8rpx;
  }
}
</style>
