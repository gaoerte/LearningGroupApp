<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <view class="header-content">
        <view class="ai-avatar">
          <text class="avatar-icon">🤖</text>
        </view>
        <view class="ai-info">
          <text class="ai-name">AI学习助手</text>
          <text class="ai-status" :class="{ online: isOnline }">
            {{ isOnline ? '在线' : '离线' }}
          </text>
        </view>
      </view>
      <view class="header-actions">
        <view class="action-btn" @click="clearChat">
          <text class="action-icon">🗑️</text>
        </view>
      </view>
    </view>

    <!-- 聊天消息列表 -->
    <scroll-view 
      class="chat-messages" 
      scroll-y 
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <!-- 欢迎消息 -->
      <view class="welcome-message" v-if="messages.length === 0">
        <view class="welcome-card">
          <text class="welcome-title">👋 欢迎使用AI学习助手</text>
          <text class="welcome-desc">我可以帮助你解答学习问题、制定学习计划、推荐学习资源等。试试问我一些问题吧！</text>
          <view class="quick-questions">
            <text class="quick-title">💡 你可以这样问我：</text>
            <view 
              class="question-chip" 
              v-for="question in quickQuestions" 
              :key="question"
              @click="sendQuickQuestion(question)"
            >
              {{ question }}
            </view>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view class="message-list">
        <view 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-item"
          :class="{ 'user-message': msg.type === 'user', 'ai-message': msg.type === 'ai' }"
        >
          <view class="message-avatar" v-if="msg.type === 'ai'">
            <text class="avatar-icon">🤖</text>
          </view>
          
          <view class="message-content">
            <view class="message-bubble">
              <text class="message-text">{{ msg.content }}</text>
              <text class="message-time">{{ msg.time }}</text>
            </view>
          </view>
          
          <view class="message-avatar" v-if="msg.type === 'user'">
            <text class="avatar-icon">👤</text>
          </view>
        </view>

        <!-- 正在输入指示器 -->
        <view class="typing-indicator" v-if="isThinking">
          <view class="typing-avatar">
            <text class="avatar-icon">🤖</text>
          </view>
          <view class="typing-content">
            <view class="typing-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
            <text class="typing-text">AI正在思考中...</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="chat-input">
      <view class="input-container">
        <view class="input-wrapper">
          <input
            v-model="inputText"
            placeholder="输入你的问题..."
            class="input-box"
            confirm-type="send"
            @confirm="sendMessage"
            @input="onInput"
            :disabled="isThinking"
          />
          <view class="input-actions">
            <view class="voice-btn" @click="startVoiceInput">
              <text class="action-icon">🎤</text>
            </view>
          </view>
        </view>
        <modern-button 
          type="primary" 
          size="medium"
          :disabled="!inputText.trim() || isThinking"
          @click="sendMessage"
          class="send-button"
        >
          {{ isThinking ? "发送中" : "发送" }}
        </modern-button>
      </view>
    </view>
  </view>
</template>

<script>
import ModernButton from '../../components/ModernButton.vue'

export default {
  components: {
    ModernButton
  },
  data() {
    return {
      inputText: '',
      messages: [],
      isThinking: false,
      isOnline: true,
      scrollTop: 0,
      quickQuestions: [
        '如何制定学习计划？',
        '推荐一些学习资源',
        '如何提高学习效率？',
        '怎样克服学习焦虑？'
      ]
    }
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim() || this.isThinking) return
      
      const userMessage = {
        type: 'user',
        content: this.inputText.trim(),
        time: this.formatTime(new Date())
      }
      
      this.messages.push(userMessage)
      const userInput = this.inputText.trim()
      this.inputText = ''
      
      this.scrollToBottom()
      this.simulateAIResponse(userInput)
    },
    
    sendQuickQuestion(question) {
      this.inputText = question
      this.sendMessage()
    },
    
    simulateAIResponse(userInput) {
      this.isThinking = true
      
      // 模拟AI思考时间
      setTimeout(() => {
        const aiResponse = this.generateAIResponse(userInput)
        const aiMessage = {
          type: 'ai',
          content: aiResponse,
          time: this.formatTime(new Date())
        }
        
        this.messages.push(aiMessage)
        this.isThinking = false
        this.scrollToBottom()
      }, 1000 + Math.random() * 2000) // 1-3秒随机延迟
    },
    
    generateAIResponse(input) {
      const responses = {
        '学习计划': '制定学习计划的关键是：1）设定明确的目标；2）分解任务；3）合理安排时间；4）定期复习和调整。建议使用SMART原则（具体、可衡量、可达成、相关性、时限性）来设定学习目标。',
        '学习资源': '推荐以下学习资源：📚 在线课程平台（如网易云课堂、腾讯课堂）；📖 专业书籍和期刊；🎥 教学视频（如B站、YouTube）；💻 实践项目和开源代码；👥 学习社区和论坛。',
        '学习效率': '提高学习效率的方法：⏰ 采用番茄工作法；🧠 利用记忆曲线规律复习；📝 做好笔记和总结；🎯 专注于重点难点；💤 保证充足的休息和睡眠。',
        '学习焦虑': '克服学习焦虑的建议：😌 保持积极心态；🎯 设定合理的期望值；⚡ 采用渐进式学习；🤝 寻求帮助和支持；🏃‍♂️ 适当运动和放松。记住，学习是一个过程，不要给自己太大压力。'
      }
      
      // 简单的关键词匹配
      for (const key in responses) {
        if (input.includes(key)) {
          return responses[key]
        }
      }
      
      // 默认回复
      const defaultResponses = [
        '这是一个很好的问题！让我来帮你分析一下。根据你的问题，我建议...',
        '感谢你的提问！基于我的理解，这个问题可以从几个角度来看：',
        '很高兴为你解答！关于这个问题，我的建议是...',
        '这确实是一个值得深入思考的问题。让我为你提供一些建议：'
      ]
      
      return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
    },
    
    clearChat() {
      uni.showModal({
        title: '清空聊天',
        content: '确定要清空所有聊天记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = []
            uni.showToast({
              title: '聊天记录已清空',
              icon: 'success'
            })
          }
        }
      })
    },
    
    startVoiceInput() {
      uni.showToast({
        title: '语音输入功能开发中',
        icon: 'none'
      })
    },
    
    onInput(e) {
      this.inputText = e.detail.value
    },
    
    formatTime(date) {
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (diff < 86400000) { // 1天内
        return Math.floor(diff / 3600000) + '小时前'
      } else {
        return date.toLocaleString()
      }
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999
      })
    }
  },
  
  onLoad() {
    // 模拟网络连接状态
    this.isOnline = true
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

.ai-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $primary-500, $primary-600);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
}

.avatar-icon {
  font-size: 36rpx;
}

.ai-info {
  display: flex;
  flex-direction: column;
}

.ai-name {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.2;
}

.ai-status {
  font-size: $text-sm;
  color: $text-secondary;
  
  &.online {
    color: $success-500;
  }
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

.chat-messages {
  flex: 1;
  padding: $space-4;
  background: transparent;
}

.welcome-message {
  margin-bottom: $space-6;
}

.welcome-card {
  background: linear-gradient(135deg, rgba($primary-50, 0.8), rgba($secondary-50, 0.6));
  border: 1rpx solid rgba($primary-200, 0.5);
  border-radius: $radius-2xl;
  padding: $space-6;
  text-align: center;
}

.welcome-title {
  display: block;
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-3;
}

.welcome-desc {
  display: block;
  font-size: $text-base;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: $space-4;
}

.quick-questions {
  text-align: left;
}

.quick-title {
  display: block;
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $text-primary;
  margin-bottom: $space-3;
}

.question-chip {
  display: inline-block;
  background: rgba($primary-100, 0.8);
  color: $primary-700;
  font-size: $text-sm;
  padding: $space-2 $space-3;
  border-radius: $radius-full;
  margin: $space-1;
  border: 1rpx solid rgba($primary-300, 0.5);
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($primary-200, 0.8);
    transform: scale(0.98);
  }
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.message-item {
  display: flex;
  align-items: flex-end;
  gap: $space-2;
  
  &.user-message {
    flex-direction: row-reverse;
    
    .message-content {
      align-items: flex-end;
    }
    
    .message-bubble {
      background: linear-gradient(135deg, $primary-500, $primary-600);
      color: $surface-primary;
    }
    
    .message-time {
      color: rgba($surface-primary, 0.8);
    }
  }
  
  &.ai-message {
    .message-bubble {
      background: $surface-primary;
      color: $text-primary;
      border: 1rpx solid $border-light;
      box-shadow: $shadow-sm;
    }
  }
}

.message-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24rpx;
  
  .ai-message & {
    background: linear-gradient(135deg, $secondary-400, $secondary-500);
  }
  
  .user-message & {
    background: linear-gradient(135deg, $gray-400, $gray-500);
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

.message-bubble {
  padding: $space-3 $space-4;
  border-radius: $radius-xl;
  position: relative;
  word-wrap: break-word;
}

.message-text {
  font-size: $text-base;
  line-height: 1.5;
  display: block;
  margin-bottom: $space-1;
}

.message-time {
  font-size: $text-xs;
  opacity: 0.7;
  text-align: right;
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
  background: linear-gradient(135deg, $secondary-400, $secondary-500);
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
}

.typing-dots {
  display: flex;
  gap: $space-1;
  margin-bottom: $space-1;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: $primary-400;
  border-radius: $radius-full;
  animation: typing 1.4s infinite ease-in-out;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
  &:nth-child(3) { animation-delay: 0s; }
}

.typing-text {
  font-size: $text-xs;
  color: $text-tertiary;
}

.chat-input {
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

.input-box {
  width: 100%;
  min-height: 80rpx;
  max-height: 200rpx;
  padding: $space-3 $space-4;
  padding-right: 100rpx;
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

.voice-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba($secondary-100, 0.8);
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($secondary-200, 0.8);
    transform: scale(0.95);
  }
}

.send-button {
  flex-shrink: 0;
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
</style>