<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <view class="header-content">
        <view class="group-avatar">
          <text class="avatar-icon">👥</text>
        </view>
        <view class="group-info">
          <text class="group-name">{{ groupName }}</text>
          <text class="online-count">{{ onlineCount }}人在线</text>
        </view>
      </view>
      <view class="header-actions">
        <view class="action-btn" @click="showGroupInfo">
          <text class="action-icon">ℹ️</text>
        </view>
        <view class="action-btn" @click="showMoreOptions">
          <text class="action-icon">⋯</text>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-top="scrollTop"
      scroll-with-animation
      @scrolltoupper="loadMoreMessages"
    >
      <!-- 加载更多提示 -->
      <view class="load-more" v-if="hasMoreMessages">
        <loading-spinner size="small" v-if="loadingMore" />
        <text class="load-text" v-else @tap="loadMoreMessages">点击加载更多消息</text>
      </view>

      <!-- 消息列表 -->
      <view class="messages-wrapper">
        <view 
          v-for="message in messages" 
          :key="message.id"
          class="message-item"
          :class="{ 'own-message': message.isOwn, 'system-message': message.type === 'system' }"
        >
          <!-- 系统消息 -->
          <view v-if="message.type === 'system'" class="system-content">
            <text class="system-text">{{ message.content }}</text>
          </view>
          
          <!-- 普通消息 -->
          <view v-else class="normal-content">
            <!-- 对方消息 -->
            <view v-if="!message.isOwn" class="other-message">
              <view class="message-avatar">
                <image 
                  class="avatar-img" 
                  :src="message.avatar || '/static/default-avatar.png'" 
                  mode="aspectFill" 
                />
              </view>
              <view class="message-body">
                <view class="message-header">
                  <text class="sender-name">{{ message.senderName }}</text>
                  <text class="message-time">{{ formatTime(message.timestamp) }}</text>
                </view>
                <view class="message-bubble other-bubble">
                  <text class="message-text">{{ message.content }}</text>
                </view>
              </view>
            </view>
            
            <!-- 自己的消息 -->
            <view v-else class="own-message-content">
              <view class="message-body">
                <view class="message-header">
                  <text class="message-time">{{ formatTime(message.timestamp) }}</text>
                  <view class="message-status">
                    <text class="status-icon" v-if="message.status === 'sending'">⏱️</text>
                    <text class="status-icon" v-else-if="message.status === 'sent'">✓</text>
                    <text class="status-icon" v-else-if="message.status === 'read'">✓✓</text>
                    <text class="status-icon error" v-else-if="message.status === 'failed'">⚠️</text>
                  </view>
                </view>
                <view class="message-bubble own-bubble">
                  <text class="message-text">{{ message.content }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 正在输入指示器 -->
      <view class="typing-indicator" v-if="showTyping">
        <view class="typing-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="typing-content">
          <text class="typing-text">{{ typingUsers.join('、') }} 正在输入...</text>
          <view class="typing-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-container">
        <view class="input-wrapper">
          <input
            v-model="inputText"
            placeholder="输入消息..."
            class="message-input"
            confirm-type="send"
            @confirm="sendMessage"
            @input="onInputChange"
            @focus="onInputFocus"
            @blur="onInputBlur"
            :disabled="isSending"
          />
          <view class="input-actions">
            <view class="action-btn" @click="showEmojiPanel">
              <text class="action-icon">😊</text>
            </view>
            <view class="action-btn" @click="showMoreActions">
              <text class="action-icon">➕</text>
            </view>
          </view>
        </view>
        <modern-button 
          type="primary" 
          size="medium"
          :disabled="!inputText.trim() || isSending"
          @click="sendMessage"
          class="send-button"
        >
          {{ isSending ? "发送中" : "发送" }}
        </modern-button>
      </view>
    </view>

    <!-- 更多操作面板 -->
    <view class="more-panel" v-if="showMorePanel" @tap="showMorePanel = false">
      <view class="panel-content" @tap.stop>
        <view class="panel-header">
          <text class="panel-title">更多功能</text>
          <text class="panel-close" @tap="showMorePanel = false">✕</text>
        </view>
        <view class="panel-actions">
          <view class="panel-action" @tap="sendImage">
            <view class="action-icon">📷</view>
            <text class="action-text">图片</text>
          </view>
          <view class="panel-action" @tap="sendFile">
            <view class="action-icon">📁</view>
            <text class="action-text">文件</text>
          </view>
          <view class="panel-action" @tap="sendLocation">
            <view class="action-icon">📍</view>
            <text class="action-text">位置</text>
          </view>
          <view class="panel-action" @tap="callAI">
            <view class="action-icon">🤖</view>
            <text class="action-text">AI助手</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import ModernButton from '../../components/ModernButton.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

export default {
  components: {
    ModernButton,
    LoadingSpinner
  },
  data() {
    return {
      groupId: null,
      groupName: '学习小组',
      onlineCount: 12,
      inputText: '',
      isSending: false,
      loadingMore: false,
      hasMoreMessages: true,
      scrollTop: 0,
      showMorePanel: false,
      showTyping: false,
      typingUsers: ['小明'],
      messages: [
        {
          id: 1,
          type: 'system',
          content: '欢迎加入学习小组！让我们一起努力学习吧！',
          timestamp: Date.now() - 3600000
        },
        {
          id: 2,
          type: 'normal',
          isOwn: false,
          senderName: '张三',
          avatar: '',
          content: '大家好，我是新加入的成员，请多多指教！',
          timestamp: Date.now() - 1800000,
          status: 'read'
        },
        {
          id: 3,
          type: 'normal',
          isOwn: true,
          content: '欢迎新成员！有什么问题可以随时问我们',
          timestamp: Date.now() - 1200000,
          status: 'read'
        },
        {
          id: 4,
          type: 'normal',
          isOwn: false,
          senderName: '李四',
          avatar: '',
          content: '今天的数学作业有点难，有人可以帮忙解答一下吗？',
          timestamp: Date.now() - 600000,
          status: 'read'
        },
        {
          id: 5,
          type: 'normal',
          isOwn: true,
          content: '我可以帮你看看，把题目发出来吧',
          timestamp: Date.now() - 300000,
          status: 'read'
        }
      ]
    }
  },
  onLoad(options) {
    if (options.groupId) {
      this.groupId = options.groupId
    }
    if (options.groupName) {
      this.groupName = decodeURIComponent(options.groupName)
    }
    this.loadInitialData()
  },
  onShow() {
    this.scrollToBottom()
    this.startTypingTimer()
  },
  onHide() {
    this.stopTypingTimer()
  },
  methods: {
    async loadInitialData() {
      try {
        // 模拟加载聊天记录
        await new Promise(resolve => setTimeout(resolve, 500))
        this.scrollToBottom()
      } catch (error) {
        console.error('加载聊天记录失败:', error)
      }
    },
    
    async loadMoreMessages() {
      if (this.loadingMore || !this.hasMoreMessages) return
      
      this.loadingMore = true
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        // 模拟加载更多消息
        const moreMessages = [
          {
            id: Date.now(),
            type: 'normal',
            isOwn: false,
            senderName: '王五',
            content: '早上好大家！',
            timestamp: Date.now() - 7200000,
            status: 'read'
          }
        ]
        this.messages.unshift(...moreMessages)
        this.hasMoreMessages = Math.random() > 0.7 // 模拟是否还有更多消息
      } catch (error) {
        console.error('加载更多消息失败:', error)
      } finally {
        this.loadingMore = false
      }
    },
    
    async sendMessage() {
      if (!this.inputText.trim() || this.isSending) return
      
      const messageContent = this.inputText.trim()
      this.inputText = ''
      this.isSending = true
      
      // 添加发送中的消息
      const tempMessage = {
        id: Date.now(),
        type: 'normal',
        isOwn: true,
        content: messageContent,
        timestamp: Date.now(),
        status: 'sending'
      }
      
      this.messages.push(tempMessage)
      this.scrollToBottom()
      
      try {
        // 模拟发送消息
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 更新消息状态
        const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id)
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'sent'
          
          // 模拟一段时间后标记为已读
          setTimeout(() => {
            if (this.messages[messageIndex]) {
              this.messages[messageIndex].status = 'read'
            }
          }, 2000)
        }
        
        // 模拟其他人的回复
        setTimeout(() => {
          this.simulateReply(messageContent)
        }, 3000)
        
      } catch (error) {
        console.error('发送消息失败:', error)
        const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id)
        if (messageIndex !== -1) {
          this.messages[messageIndex].status = 'failed'
        }
        uni.showToast({
          title: '发送失败',
          icon: 'error'
        })
      } finally {
        this.isSending = false
      }
    },
    
    simulateReply(originalMessage) {
      const replies = [
        '好的，我明白了',
        '谢谢分享！',
        '这个问题很有意思',
        '我也有同样的想法',
        '可以详细说说吗？'
      ]
      
      const reply = replies[Math.floor(Math.random() * replies.length)]
      const replyMessage = {
        id: Date.now(),
        type: 'normal',
        isOwn: false,
        senderName: '系统回复',
        content: reply,
        timestamp: Date.now(),
        status: 'read'
      }
      
      this.messages.push(replyMessage)
      this.scrollToBottom()
    },
    
    onInputChange(e) {
      this.inputText = e.detail.value
      // 模拟输入状态
      this.showTyping = this.inputText.length > 0
    },
    
    onInputFocus() {
      this.scrollToBottom()
    },
    
    onInputBlur() {
      this.showTyping = false
    },
    
    startTypingTimer() {
      this.typingTimer = setInterval(() => {
        this.showTyping = Math.random() > 0.8
        if (this.showTyping) {
          setTimeout(() => {
            this.showTyping = false
          }, 3000)
        }
      }, 10000)
    },
    
    stopTypingTimer() {
      if (this.typingTimer) {
        clearInterval(this.typingTimer)
      }
    },
    
    showGroupInfo() {
      uni.navigateTo({
        url: `/pages/groupInfo/groupInfo?groupId=${this.groupId}`
      })
    },
    
    showMoreOptions() {
      uni.showActionSheet({
        itemList: ['群组信息', 'AI助手', '聊天记录', '群组设置'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.showGroupInfo()
              break
            case 1:
              this.callAI()
              break
            case 2:
              uni.showToast({ title: '功能开发中', icon: 'none' })
              break
            case 3:
              uni.showToast({ title: '功能开发中', icon: 'none' })
              break
          }
        }
      })
    },
    
    showEmojiPanel() {
      uni.showToast({
        title: '表情功能开发中',
        icon: 'none'
      })
    },
    
    showMoreActions() {
      this.showMorePanel = true
    },
    
    sendImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showToast({
            title: '图片发送功能开发中',
            icon: 'none'
          })
        }
      })
      this.showMorePanel = false
    },
    
    sendFile() {
      uni.showToast({
        title: '文件发送功能开发中',
        icon: 'none'
      })
      this.showMorePanel = false
    },
    
    sendLocation() {
      uni.showToast({
        title: '位置发送功能开发中',
        icon: 'none'
      })
      this.showMorePanel = false
    },
    
    callAI() {
      uni.navigateTo({
        url: '/pages/aichat/aichat?source=group'
      })
      this.showMorePanel = false
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleDateString()
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(180deg, rgba($primary-50, 0.3) 0%, $surface-primary 100%);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4;
  background: $surface-primary;
  border-bottom: 1rpx solid $border-light;
  box-shadow: $shadow-sm;
}

.header-content {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.group-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $secondary-500, $secondary-600);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
}

.avatar-icon {
  font-size: 32rpx;
}

.group-info {
  display: flex;
  flex-direction: column;
}

.group-name {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.2;
}

.online-count {
  font-size: $text-sm;
  color: $success-500;
}

.header-actions {
  display: flex;
  gap: $space-2;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  background: rgba($gray-100, 0.8);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($gray-200, 0.8);
    transform: scale(0.95);
  }
}

.action-icon {
  font-size: 28rpx;
}

.message-list {
  flex: 1;
  padding: $space-4;
  background: transparent;
}

.load-more {
  text-align: center;
  padding: $space-4;
}

.load-text {
  color: $primary-600;
  font-size: $text-sm;
  
  &:active {
    opacity: 0.7;
  }
}

.messages-wrapper {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.message-item {
  &.system-message {
    text-align: center;
  }
}

.system-content {
  background: rgba($gray-100, 0.8);
  border-radius: $radius-xl;
  padding: $space-2 $space-4;
  display: inline-block;
  margin: 0 auto;
}

.system-text {
  font-size: $text-sm;
  color: $text-secondary;
}

.other-message {
  display: flex;
  align-items: flex-start;
  gap: $space-2;
}

.own-message-content {
  display: flex;
  justify-content: flex-end;
}

.message-avatar {
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  border: 2rpx solid $border-light;
}

.message-body {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: $space-1;
  
  .other-message & {
    justify-content: flex-start;
  }
  
  .own-message-content & {
    justify-content: flex-end;
  }
}

.sender-name {
  font-size: $text-sm;
  color: $text-secondary;
  font-weight: $font-medium;
  margin-right: $space-2;
}

.message-time {
  font-size: $text-xs;
  color: $text-tertiary;
}

.message-status {
  margin-left: $space-2;
}

.status-icon {
  font-size: $text-xs;
  
  &.error {
    color: $error-500;
  }
}

.message-bubble {
  padding: $space-3 $space-4;
  border-radius: $radius-xl;
  word-wrap: break-word;
  position: relative;
  
  &.other-bubble {
    background: $surface-primary;
    border: 1rpx solid $border-light;
    box-shadow: $shadow-sm;
    
    &::before {
      content: '';
      position: absolute;
      left: -8rpx;
      top: 16rpx;
      width: 0;
      height: 0;
      border-top: 8rpx solid transparent;
      border-bottom: 8rpx solid transparent;
      border-right: 8rpx solid $surface-primary;
    }
  }
  
  &.own-bubble {
    background: linear-gradient(135deg, $primary-500, $primary-600);
    color: $surface-primary;
    
    &::after {
      content: '';
      position: absolute;
      right: -8rpx;
      top: 16rpx;
      width: 0;
      height: 0;
      border-top: 8rpx solid transparent;
      border-bottom: 8rpx solid transparent;
      border-left: 8rpx solid $primary-500;
    }
  }
}

.message-text {
  font-size: $text-base;
  line-height: 1.5;
}

.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: $space-2;
  margin-top: $space-2;
}

.typing-avatar {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, $gray-400, $gray-500);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
}

.typing-content {
  background: $surface-primary;
  border: 1rpx solid $border-light;
  border-radius: $radius-xl;
  padding: $space-3 $space-4;
  box-shadow: $shadow-sm;
  display: flex;
  align-items: center;
  gap: $space-2;
}

.typing-text {
  font-size: $text-sm;
  color: $text-secondary;
}

.typing-dots {
  display: flex;
  gap: $space-1;
}

.dot {
  width: 6rpx;
  height: 6rpx;
  background: $primary-400;
  border-radius: $radius-full;
  animation: typing 1.4s infinite ease-in-out;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
}

.input-area {
  padding: $space-4;
  background: $surface-primary;
  border-top: 1rpx solid $border-light;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: $space-3;
}

.input-wrapper {
  flex: 1;
  position: relative;
  background: rgba($gray-50, 0.8);
  border: 2rpx solid $border-light;
  border-radius: $radius-2xl;
  transition: all $duration-200 $easing-smooth;
  
  &:focus-within {
    border-color: $primary-300;
    background: $surface-primary;
    box-shadow: 0 0 0 6rpx rgba($primary-100, 0.5);
  }
}

.message-input {
  width: 100%;
  min-height: 80rpx;
  max-height: 160rpx;
  padding: $space-3 $space-4;
  padding-right: 140rpx;
  font-size: $text-base;
  line-height: 1.4;
  color: $text-primary;
  background: transparent;
  border: none;
  border-radius: $radius-2xl;
  
  &::placeholder {
    color: $text-tertiary;
  }
  
  &:disabled {
    opacity: 0.6;
  }
}

.input-actions {
  position: absolute;
  right: $space-2;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: $space-1;
}

.send-button {
  flex-shrink: 0;
}

.more-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $surface-overlay;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
}

.panel-content {
  background: $surface-primary;
  border-radius: $radius-2xl $radius-2xl 0 0;
  width: 100%;
  max-height: 60vh;
  padding: $space-6;
  animation: slideUp $duration-300 $easing-smooth;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $space-6;
}

.panel-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.panel-close {
  font-size: $text-xl;
  color: $text-secondary;
  padding: $space-2;
}

.panel-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;
}

.panel-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  padding: $space-4;
  border-radius: $radius-xl;
  background: rgba($gray-50, 0.5);
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($gray-100, 0.8);
    transform: scale(0.95);
  }
}

.action-text {
  font-size: $text-sm;
  color: $text-secondary;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
