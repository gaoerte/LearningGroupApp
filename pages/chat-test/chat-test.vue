<template>
  <view class="chat-test-container">
    <!-- 标题区域 -->
    <view class="header-section">
      <text class="main-title">💬 聊天功能测试</text>
      <text class="subtitle">测试实时聊天、消息发送、表情等功能</text>
    </view>

    <!-- 功能测试区域 -->
    <view class="test-section">
      <text class="section-title">🧪 功能测试</text>
      
      <view class="test-grid">
        <view class="test-item" @tap="testBasicChat">
          <text class="test-icon">💬</text>
          <text class="test-label">基础聊天</text>
          <text class="test-desc">文本消息收发</text>
        </view>

        <view class="test-item" @tap="testImageChat">
          <text class="test-icon">📷</text>
          <text class="test-label">图片聊天</text>
          <text class="test-desc">图片发送预览</text>
        </view>

        <view class="test-item" @tap="testEmojiChat">
          <text class="test-icon">😊</text>
          <text class="test-label">表情聊天</text>
          <text class="test-desc">表情面板功能</text>
        </view>

        <view class="test-item" @tap="testGroupChat">
          <text class="test-icon">👥</text>
          <text class="test-label">群组聊天</text>
          <text class="test-desc">多人聊天室</text>
        </view>
      </view>
    </view>

    <!-- 快速测试 -->
    <view class="quick-test-section">
      <text class="section-title">⚡ 快速测试</text>
      
      <view class="quick-actions">
        <button class="quick-btn primary" @tap="startQuickTest">
          开始快速测试
        </button>
        <button class="quick-btn secondary" @tap="viewChatDemo">
          查看聊天演示
        </button>
      </view>
    </view>

    <!-- 测试说明 -->
    <view class="instruction-section">
      <text class="section-title">📋 测试说明</text>
      
      <view class="instruction-list">
        <view class="instruction-item">
          <text class="step-number">1</text>
          <text class="step-text">点击"基础聊天"进入聊天页面</text>
        </view>
        <view class="instruction-item">
          <text class="step-number">2</text>
          <text class="step-text">在输入框输入消息并发送</text>
        </view>
        <view class="instruction-item">
          <text class="step-number">3</text>
          <text class="step-text">测试表情面板和图片发送</text>
        </view>
        <view class="instruction-item">
          <text class="step-number">4</text>
          <text class="step-text">查看消息显示和自动回复</text>
        </view>
      </view>
    </view>

    <!-- 功能特点 -->
    <view class="features-section">
      <text class="section-title">✨ 功能特点</text>
      
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">💬</text>
          <text class="feature-text">实时消息收发</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📱</text>
          <text class="feature-text">响应式聊天界面</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">😊</text>
          <text class="feature-text">丰富表情支持</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📷</text>
          <text class="feature-text">图片消息发送</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">⏰</text>
          <text class="feature-text">消息时间显示</text>
        </view>
        <view class="feature-item">
          <text class="feature-icon">👤</text>
          <text class="feature-text">用户头像显示</text>
        </view>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-section">
      <button class="back-btn" @tap="goBack">
        返回首页
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatTest',
  methods: {
    // 测试基础聊天
    testBasicChat() {
      uni.navigateTo({
        url: '/pages/chat/chat?chatName=基础聊天测试&chatId=test_basic',
        success: () => {
          console.log('[聊天测试] 跳转基础聊天测试')
        },
        fail: (error) => {
          console.error('[聊天测试] 跳转失败:', error)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },

    // 测试图片聊天
    testImageChat() {
      uni.navigateTo({
        url: '/pages/chat/chat?chatName=图片聊天测试&chatId=test_image',
        success: () => {
          console.log('[聊天测试] 跳转图片聊天测试')
          // 提示用户测试图片功能
          setTimeout(() => {
            uni.showModal({
              title: '提示',
              content: '进入聊天后，点击相机图标📷测试图片发送功能',
              showCancel: false
            })
          }, 1000)
        }
      })
    },

    // 测试表情聊天
    testEmojiChat() {
      uni.navigateTo({
        url: '/pages/chat/chat?chatName=表情聊天测试&chatId=test_emoji',
        success: () => {
          console.log('[聊天测试] 跳转表情聊天测试')
          // 提示用户测试表情功能
          setTimeout(() => {
            uni.showModal({
              title: '提示',
              content: '进入聊天后，点击笑脸图标😊测试表情面板功能',
              showCancel: false
            })
          }, 1000)
        }
      })
    },

    // 测试群组聊天
    testGroupChat() {
      uni.navigateTo({
        url: '/pages/chat/chat?chatName=群组聊天测试&chatId=test_group',
        success: () => {
          console.log('[聊天测试] 跳转群组聊天测试')
        }
      })
    },

    // 开始快速测试
    startQuickTest() {
      uni.showModal({
        title: '快速测试',
        content: '将依次测试所有聊天功能，确定开始吗？',
        success: (res) => {
          if (res.confirm) {
            this.runQuickTest()
          }
        }
      })
    },

    // 执行快速测试
    runQuickTest() {
      const tests = [
        { name: '基础聊天', delay: 0 },
        { name: '表情功能', delay: 2000 },
        { name: '图片功能', delay: 4000 }
      ]

      tests.forEach((test, index) => {
        setTimeout(() => {
          uni.showToast({
            title: `测试${test.name}...`,
            icon: 'none',
            duration: 1500
          })
          
          if (index === tests.length - 1) {
            setTimeout(() => {
              this.testBasicChat()
            }, 1500)
          }
        }, test.delay)
      })
    },

    // 查看聊天演示
    viewChatDemo() {
      uni.showModal({
        title: '聊天演示',
        content: '聊天功能包含：\n• 文本消息发送\n• 图片分享\n• 表情支持\n• 自动回复\n• 消息时间\n• 用户头像',
        showCancel: false,
        confirmText: '立即体验',
        success: (res) => {
          if (res.confirm) {
            this.testBasicChat()
          }
        }
      })
    },

    // 返回首页
    goBack() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-test-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32rpx;
}

.header-section {
  text-align: center;
  margin-bottom: 48rpx;
  
  .main-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 32rpx;
}

.test-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .test-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .test-item {
      padding: 32rpx 24rpx;
      border: 2rpx solid #e5e7eb;
      border-radius: 12rpx;
      text-align: center;
      transition: all 0.3s ease;
      
      &:active {
        background: #f3f4f6;
        transform: scale(0.98);
        border-color: #667eea;
      }
      
      .test-icon {
        font-size: 56rpx;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .test-label {
        font-size: 32rpx;
        font-weight: 600;
        color: #1f2937;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .test-desc {
        font-size: 24rpx;
        color: #6b7280;
      }
    }
  }
}

.quick-test-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .quick-actions {
    display: flex;
    gap: 24rpx;
    
    .quick-btn {
      flex: 1;
      padding: 24rpx;
      border-radius: 12rpx;
      border: none;
      font-size: 32rpx;
      font-weight: 600;
      
      &.primary {
        background: #667eea;
        color: white;
      }
      
      &.secondary {
        background: #f3f4f6;
        color: #374151;
      }
    }
  }
}

.instruction-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .instruction-list {
    .instruction-item {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .step-number {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        background: #667eea;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .step-text {
        font-size: 28rpx;
        color: #374151;
        line-height: 1.5;
      }
    }
  }
}

.features-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .feature-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .feature-item {
      display: flex;
      align-items: center;
      padding: 16rpx;
      background: #f8fafc;
      border-radius: 8rpx;
      
      .feature-icon {
        font-size: 32rpx;
        margin-right: 16rpx;
      }
      
      .feature-text {
        font-size: 28rpx;
        color: #374151;
      }
    }
  }
}

.back-section {
  text-align: center;
  
  .back-btn {
    background: #6b7280;
    color: white;
    border: none;
    padding: 24rpx 64rpx;
    border-radius: 12rpx;
    font-size: 32rpx;
  }
}
</style>
