<template>
  <view class="chat-demo">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <text class="chat-title">实时聊天演示</text>
      <text class="connection-status" :class="connectionStatus">
        {{ connectionText }}
      </text>
    </view>

    <!-- 消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view 
        v-for="message in messages" 
        :key="message.id" 
        class="message-item"
        :class="{ 'own-message': message.senderId === currentUserId }"
      >
        <view class="message-info">
          <text class="sender-name">{{ message.senderName }}</text>
          <text class="message-time">{{ formatTime(message.timestamp) }}</text>
        </view>
        <view class="message-content">
          {{ message.content }}
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <input 
        class="message-input"
        v-model="inputMessage"
        placeholder="输入消息..."
        @confirm="sendMessage"
        confirm-type="send"
      />
      <button 
        class="send-button"
        @click="sendMessage"
        :disabled="!inputMessage.trim()"
      >
        发送
      </button>
    </view>

    <!-- 调试信息 -->
    <view class="debug-info" v-if="showDebug">
      <text class="debug-title">调试信息</text>
      <text class="debug-text">连接类型: {{ connectionType }}</text>
      <text class="debug-text">消息数量: {{ messages.length }}</text>
      <text class="debug-text">群组ID: {{ groupId }}</text>
      <button @click="toggleDebug" class="debug-toggle">隐藏调试</button>
    </view>
    
    <button 
      v-else 
      @click="toggleDebug" 
      class="debug-toggle show-debug"
    >
      显示调试
    </button>
  </view>
</template>

<script>
import { ChatAPI } from '../../api/chatAPI.js'

export default {
  name: 'ChatDemo',
  data() {
    return {
      groupId: 1, // 演示群组ID
      messages: [],
      inputMessage: '',
      currentUserId: null,
      connectionStatus: 'connecting',
      connectionType: 'CloudFunction',
      scrollTop: 0,
      showDebug: false,
      unsubscribe: null
    }
  },
  computed: {
    connectionText() {
      switch (this.connectionStatus) {
        case 'connected': return '已连接'
        case 'connecting': return '连接中...'
        case 'disconnected': return '已断开'
        case 'error': return '连接错误'
        default: return '未知状态'
      }
    }
  },
  async onLoad(options) {
    // 获取群组ID（从页面参数）
    if (options.groupId) {
      this.groupId = parseInt(options.groupId)
    }
    
    // 获取当前用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && userInfo.id) {
      this.currentUserId = userInfo.id
    } else {
      // 生成临时用户ID用于演示
      this.currentUserId = 'user_' + Date.now()
      uni.setStorageSync('userInfo', {
        id: this.currentUserId,
        nickname: '演示用户'
      })
    }
    
    await this.initializeChat()
  },
  onUnload() {
    // 页面卸载时清理订阅
    this.cleanup()
  },
  methods: {
    /**
     * 初始化聊天
     */
    async initializeChat() {
      try {
        console.log('[ChatDemo] 初始化聊天...')
        this.connectionStatus = 'connecting'
        
        // 获取历史消息
        await this.loadMessages()
        
        // 订阅实时消息
        await this.subscribeToMessages()
        
        this.connectionStatus = 'connected'
        console.log('[ChatDemo] 聊天初始化成功')
      } catch (error) {
        console.error('[ChatDemo] 聊天初始化失败:', error)
        this.connectionStatus = 'error'
        
        uni.showToast({
          title: '聊天初始化失败',
          icon: 'none',
          duration: 2000
        })
      }
    },

    /**
     * 加载历史消息
     */
    async loadMessages() {
      try {
        console.log('[ChatDemo] 加载历史消息...')
        
        const result = await ChatAPI.getGroupMessages(this.groupId, 50)
        if (result.success && result.data) {
          this.messages = result.data.messages || []
          this.$nextTick(() => {
            this.scrollToBottom()
          })
          console.log(`[ChatDemo] 加载了 ${this.messages.length} 条历史消息`)
        } else {
          console.warn('[ChatDemo] 加载历史消息失败:', result.error)
        }
      } catch (error) {
        console.error('[ChatDemo] 加载历史消息异常:', error)
      }
    },

    /**
     * 订阅实时消息
     */
    async subscribeToMessages() {
      try {
        console.log('[ChatDemo] 订阅实时消息...')
        
        const chatClient = ChatAPI.getChatClient()
        this.unsubscribe = chatClient.subscribeToGroup(this.groupId, (message) => {
          this.onNewMessage(message, 'realtime')
        })
        
        console.log('[ChatDemo] 实时消息订阅成功')
      } catch (error) {
        console.error('[ChatDemo] 订阅实时消息失败:', error)
        throw error
      }
    },

    /**
     * 处理新消息
     */
    onNewMessage(message, type = 'new') {
      console.log('[ChatDemo] 收到新消息:', message, '类型:', type)
      
      // 检查消息是否已存在（避免重复）
      const exists = this.messages.some(m => m.id === message.id)
      if (!exists) {
        // 根据时间戳插入到正确位置
        const insertIndex = this.messages.findIndex(m => 
          new Date(m.timestamp) < new Date(message.timestamp)
        )
        
        if (insertIndex === -1) {
          this.messages.push(message)
        } else {
          this.messages.splice(insertIndex, 0, message)
        }
        
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },

    /**
     * 发送消息
     */
    async sendMessage() {
      const content = this.inputMessage.trim()
      if (!content) return
      
      const tempMessage = content
      this.inputMessage = ''
      
      try {
        console.log('[ChatDemo] 发送消息:', content)
        
        const result = await ChatAPI.sendGroupMessage(this.groupId, content, 'text')
        if (result.success) {
          console.log('[ChatDemo] 消息发送成功')
          // 消息会通过实时订阅自动添加到列表中
        } else {
          console.error('[ChatDemo] 消息发送失败:', result.error)
          this.inputMessage = tempMessage // 恢复消息内容
          
          uni.showToast({
            title: '发送失败',
            icon: 'none',
            duration: 2000
          })
        }
      } catch (error) {
        console.error('[ChatDemo] 发送消息异常:', error)
        this.inputMessage = tempMessage // 恢复消息内容
        
        uni.showToast({
          title: '发送异常',
          icon: 'none',
          duration: 2000
        })
      }
    },

    /**
     * 滚动到底部
     */
    scrollToBottom() {
      this.scrollTop = 999999
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) { // 1分钟内
        return '刚刚'
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前'
      } else if (date.toDateString() === now.toDateString()) { // 今天
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else { // 其他
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    },

    /**
     * 切换调试信息显示
     */
    toggleDebug() {
      this.showDebug = !this.showDebug
    },

    /**
     * 清理资源
     */
    cleanup() {
      if (this.unsubscribe) {
        this.unsubscribe()
        this.unsubscribe = null
      }
      
      // 清理聊天客户端
      const chatClient = ChatAPI.getChatClient()
      if (chatClient && chatClient.destroy) {
        chatClient.destroy()
      }
    }
  }
}
</script>

<style>
.chat-demo {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  background-color: #007aff;
  color: white;
  padding: 20px 15px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  font-size: 18px;
  font-weight: bold;
}

.connection-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
}

.connection-status.connected {
  background-color: #4cd964;
}

.connection-status.connecting {
  background-color: #ff9500;
}

.connection-status.error {
  background-color: #ff3b30;
}

.message-list {
  flex: 1;
  padding: 10px;
}

.message-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-item.own-message {
  background-color: #007aff;
  color: white;
  margin-left: 60px;
}

.message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.sender-name {
  font-size: 12px;
  color: #666;
  font-weight: bold;
}

.own-message .sender-name {
  color: rgba(255, 255, 255, 0.8);
}

.message-time {
  font-size: 10px;
  color: #999;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.6);
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
}

.input-area {
  padding: 10px;
  background-color: white;
  display: flex;
  align-items: center;
  border-top: 1px solid #e5e5e5;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 14px;
}

.send-button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}

.send-button[disabled] {
  background-color: #ccc;
}

.debug-info {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  font-size: 12px;
}

.debug-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

.debug-text {
  display: block;
  margin-bottom: 3px;
}

.debug-toggle {
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  margin-top: 5px;
}

.debug-toggle.show-debug {
  position: fixed;
  bottom: 20px;
  right: 20px;
  border-radius: 20px;
  padding: 8px 12px;
}
</style>