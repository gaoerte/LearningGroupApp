<template>
  <view class="chat-page">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <view class="header-left">
        <view class="back-btn" @tap="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="chat-avatar">
          <image v-if="chatInfo.avatar" :src="chatInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ chatInfo.name.charAt(0) }}</text>
        </view>
        <view class="chat-info">
          <text class="chat-name">{{ chatInfo.name }}</text>
          <text class="chat-status">{{ chatInfo.status }}</text>
        </view>
      </view>
      <view class="header-right">
        <view class="action-btn" @tap="showChatMenu">
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
      @scroll="handleScroll"
      @scrolltoupper="loadMoreMessages"
    >
      <!-- 时间分割线 -->
      <view class="date-divider" v-if="messages.length > 0">
        <text class="date-text">{{ formatDate(new Date()) }}</text>
      </view>

      <!-- 消息项 -->
      <view 
        v-for="(message, index) in messages" 
        :key="message.id"
        class="message-item"
      >
        <!-- 时间显示 -->
        <view 
          v-if="shouldShowTime(message, index)" 
          class="time-divider"
        >
          <text class="time-text">{{ formatTime(message.timestamp) }}</text>
        </view>

        <!-- 消息气泡 -->
        <view 
          class="message-bubble"
          :class="{ 
            'own-message': message.isOwn,
            'other-message': !message.isOwn 
          }"
        >
          <!-- 头像 -->
          <view class="message-avatar" v-if="!message.isOwn">
            <image v-if="message.avatar" :src="message.avatar" class="avatar-img" />
            <text v-else class="avatar-text">{{ message.userName.charAt(0) }}</text>
          </view>

          <!-- 消息内容 -->
          <view class="message-content">
            <!-- 用户名 -->
            <text v-if="!message.isOwn" class="user-name">{{ message.userName }}</text>
            
            <!-- 消息体 -->
            <view class="message-body" :class="message.type">
              <!-- 文本消息 -->
              <text v-if="message.type === 'text'" class="message-text">{{ message.content }}</text>
              
              <!-- 图片消息 -->
              <image 
                v-if="message.type === 'image'" 
                :src="message.content" 
                class="message-image"
                mode="aspectFit"
                @tap="previewImage(message.content)"
              />
              
              <!-- 系统消息 -->
              <text v-if="message.type === 'system'" class="system-text">{{ message.content }}</text>
            </view>

            <!-- 消息状态 -->
            <view class="message-status" v-if="message.isOwn">
              <text v-if="message.status === 'sending'" class="status-text">发送中</text>
              <text v-if="message.status === 'sent'" class="status-text">已发送</text>
              <text v-if="message.status === 'failed'" class="status-text error" @tap="resendMessage(message)">发送失败，点击重试</text>
            </view>
          </view>

          <!-- 发送者头像 -->
          <view class="message-avatar" v-if="message.isOwn">
            <image v-if="currentUser.avatar" :src="currentUser.avatar" class="avatar-img" />
            <text v-else class="avatar-text">{{ currentUser.name.charAt(0) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-messages" v-if="messages.length === 0">
        <text class="empty-icon">💬</text>
        <text class="empty-text">还没有消息，开始聊天吧~</text>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-container">
        <!-- 功能按钮 -->
        <view class="input-actions">
          <view class="action-item" @tap="showEmojiPanel">
            <text class="action-icon">😊</text>
          </view>
          <view class="action-item" @tap="chooseImage">
            <text class="action-icon">📷</text>
          </view>
        </view>

        <!-- 输入框 -->
        <view class="input-wrapper">
          <textarea
            v-model="inputText"
            class="message-input"
            placeholder="输入消息..."
            auto-height
            :maxlength="500"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
            @confirm="sendMessage"
          />
        </view>

        <!-- 发送按钮 -->
        <view 
          class="send-btn" 
          :class="{ 'can-send': canSend }"
          @tap="sendMessage"
        >
          <text class="send-icon">{{ canSend ? '发送' : '📤' }}</text>
        </view>
      </view>

      <!-- 表情面板 -->
      <view v-if="showEmoji" class="emoji-panel">
        <view class="emoji-grid">
          <text 
            v-for="emoji in emojiList" 
            :key="emoji"
            class="emoji-item"
            @tap="insertEmoji(emoji)"
          >
            {{ emoji }}
          </text>
        </view>
      </view>
    </view>

    <!-- 聊天菜单 -->
    <view v-if="showMenu" class="chat-menu-overlay" @tap="hideChatMenu">
      <view class="chat-menu" @tap.stop>
        <view class="menu-item" @tap="clearMessages">
          <text class="menu-icon">🗑️</text>
          <text class="menu-text">清空聊天记录</text>
        </view>
        <view class="menu-item" @tap="exportChat">
          <text class="menu-icon">📤</text>
          <text class="menu-text">导出聊天记录</text>
        </view>
        <view class="menu-item" @tap="searchMessages">
          <text class="menu-icon">🔍</text>
          <text class="menu-text">搜索消息</text>
        </view>
        <view class="menu-cancel" @tap="hideChatMenu">
          <text>取消</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { StorageManager } from '../../utils/storage.js'

export default {
  name: 'ChatPage',
  data() {
    return {
      // 聊天信息
      chatInfo: {
        name: '学习交流群',
        avatar: '',
        status: '3人在线'
      },
      
      // 当前用户
      currentUser: {
        id: 'user_001',
        name: '我',
        avatar: ''
      },
      
      // 消息列表
      messages: [
        {
          id: '1',
          content: '大家好，欢迎来到学习交流群！',
          type: 'text',
          userName: '管理员',
          avatar: '',
          timestamp: Date.now() - 3600000,
          isOwn: false,
          status: 'sent'
        },
        {
          id: '2',
          content: '大家好！很高兴加入这个群',
          type: 'text',
          userName: '我',
          avatar: '',
          timestamp: Date.now() - 1800000,
          isOwn: true,
          status: 'sent'
        },
        {
          id: '3',
          content: '今天有什么学习计划吗？',
          type: 'text',
          userName: '小李',
          avatar: '',
          timestamp: Date.now() - 900000,
          isOwn: false,
          status: 'sent'
        }
      ],
      
      // 输入相关
      inputText: '',
      showEmoji: false,
      showMenu: false,
      
      // 滚动相关
      scrollTop: 0,
      
      // 表情列表
      emojiList: [
        '😊', '😄', '😃', '😀', '😆', '😂', '🤣', '😭',
        '😘', '😍', '🥰', '😋', '😎', '🤔', '😮', '😱',
        '😴', '🤤', '😪', '😵', '🤯', '🥳', '🤗', '🤭',
        '👍', '👎', '👌', '✌️', '🤝', '👏', '🙏', '💪'
      ]
    }
  },
  
  computed: {
    canSend() {
      return this.inputText.trim().length > 0
    }
  },
  
  onLoad(options) {
    this.initChat(options)
  },
  
  onShow() {
    this.scrollToBottom()
  },
  
  methods: {
    // 初始化聊天
    initChat(options = {}) {
      try {
        // 获取用户信息
        const userInfo = StorageManager.getUserInfo()
        if (userInfo) {
          this.currentUser = {
            id: userInfo.id || 'user_001',
            name: userInfo.nickname || '我',
            avatar: userInfo.avatar || ''
          }
        }
        
        // 设置聊天信息
        if (options.chatName) {
          this.chatInfo.name = options.chatName
        }
        if (options.chatId) {
          this.loadChatMessages(options.chatId)
        }
        
        console.log('[聊天页] 初始化完成:', this.chatInfo)
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('[聊天页] 初始化失败:', error)
      }
    },
    
    // 加载聊天消息
    loadChatMessages(chatId) {
      try {
        // 这里可以从API或本地存储加载消息
        console.log('[聊天页] 加载消息:', chatId)
      } catch (error) {
        console.error('[聊天页] 加载消息失败:', error)
      }
    },
    
    // 发送消息
    sendMessage() {
      if (!this.canSend) return
      
      const messageText = this.inputText.trim()
      if (!messageText) return
      
      try {
        // 创建新消息
        const newMessage = {
          id: 'msg_' + Date.now(),
          content: messageText,
          type: 'text',
          userName: this.currentUser.name,
          avatar: this.currentUser.avatar,
          timestamp: Date.now(),
          isOwn: true,
          status: 'sending'
        }
        
        // 添加到消息列表
        this.messages.push(newMessage)
        
        // 清空输入框
        this.inputText = ''
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
        
        // 模拟发送
        setTimeout(() => {
          newMessage.status = 'sent'
          
          // 模拟回复
          setTimeout(() => {
            this.simulateReply()
          }, 1000)
        }, 500)
        
        console.log('[聊天页] 消息发送:', newMessage)
      } catch (error) {
        console.error('[聊天页] 发送消息失败:', error)
      }
    },
    
    // 模拟回复
    simulateReply() {
      const replies = [
        '收到！',
        '好的，明白了',
        '我也这么觉得',
        '说得对！',
        '赞同👍',
        '有道理',
        '我来回答一下这个问题...'
      ]
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)]
      
      const replyMessage = {
        id: 'reply_' + Date.now(),
        content: randomReply,
        type: 'text',
        userName: '小王',
        avatar: '',
        timestamp: Date.now(),
        isOwn: false,
        status: 'sent'
      }
      
      this.messages.push(replyMessage)
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    
    // 重发消息
    resendMessage(message) {
      message.status = 'sending'
      setTimeout(() => {
        message.status = 'sent'
      }, 1000)
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          const imagePath = res.tempFilePaths[0]
          
          const imageMessage = {
            id: 'img_' + Date.now(),
            content: imagePath,
            type: 'image',
            userName: this.currentUser.name,
            avatar: this.currentUser.avatar,
            timestamp: Date.now(),
            isOwn: true,
            status: 'sent'
          }
          
          this.messages.push(imageMessage)
          
          this.$nextTick(() => {
            this.scrollToBottom()
          })
        },
        fail: (error) => {
          console.error('[聊天页] 选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 预览图片
    previewImage(imageUrl) {
      uni.previewImage({
        urls: [imageUrl],
        current: imageUrl
      })
    },
    
    // 插入表情
    insertEmoji(emoji) {
      this.inputText += emoji
    },
    
    // 显示表情面板
    showEmojiPanel() {
      this.showEmoji = !this.showEmoji
    },
    
    // 显示聊天菜单
    showChatMenu() {
      this.showMenu = true
    },
    
    // 隐藏聊天菜单
    hideChatMenu() {
      this.showMenu = false
    },
    
    // 清空消息
    clearMessages() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有聊天记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.messages = []
            this.hideChatMenu()
            uni.showToast({
              title: '已清空聊天记录',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 导出聊天记录
    exportChat() {
      const chatData = this.messages.map(msg => ({
        time: this.formatTime(msg.timestamp),
        user: msg.userName,
        content: msg.content
      }))
      
      console.log('导出聊天记录:', chatData)
      uni.showToast({
        title: '聊天记录已导出到控制台',
        icon: 'success'
      })
      this.hideChatMenu()
    },
    
    // 搜索消息
    searchMessages() {
      uni.showToast({
        title: '搜索功能开发中',
        icon: 'none'
      })
      this.hideChatMenu()
    },
    
    // 加载更多消息
    loadMoreMessages() {
      console.log('[聊天页] 加载更多消息')
    },
    
    // 处理输入框焦点
    handleInputFocus() {
      this.showEmoji = false
      setTimeout(() => {
        this.scrollToBottom()
      }, 300)
    },
    
    handleInputBlur() {
      // 输入框失去焦点时的处理
    },
    
    // 处理滚动
    handleScroll(e) {
      // 滚动处理
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 99999
      })
    },
    
    // 返回
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }
      })
    },
    
    // 工具方法
    shouldShowTime(message, index) {
      if (index === 0) return true
      const prevMessage = this.messages[index - 1]
      const timeDiff = message.timestamp - prevMessage.timestamp
      return timeDiff > 300000 // 5分钟
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (messageDate.getTime() === today.getTime()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      }
    },
    
    formatDate(date) {
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

// 聊天头部
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 32rpx;
  background: white;
  border-bottom: 1rpx solid #e5e5e5;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .back-btn {
      margin-right: 24rpx;
      padding: 8rpx;
      
      .back-icon {
        font-size: 36rpx;
        color: #333;
      }
    }
    
    .chat-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #667eea;
      
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      
      .avatar-text {
        color: white;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
    
    .chat-info {
      .chat-name {
        font-size: 36rpx;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .chat-status {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .header-right {
    .action-btn {
      padding: 16rpx;
      
      .action-icon {
        font-size: 32rpx;
        color: #666;
      }
    }
  }
}

// 消息列表
.message-list {
  flex: 1;
  padding: 24rpx 32rpx;
}

.date-divider {
  text-align: center;
  margin-bottom: 32rpx;
  
  .date-text {
    background: rgba(0, 0, 0, 0.1);
    color: #666;
    padding: 8rpx 24rpx;
    border-radius: 24rpx;
    font-size: 24rpx;
  }
}

.time-divider {
  text-align: center;
  margin: 32rpx 0;
  
  .time-text {
    background: rgba(0, 0, 0, 0.05);
    color: #999;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    font-size: 22rpx;
  }
}

.message-item {
  margin-bottom: 32rpx;
}

.message-bubble {
  display: flex;
  
  &.own-message {
    justify-content: flex-end;
    
    .message-content {
      align-items: flex-end;
      
      .message-body {
        background: #667eea;
        color: white;
      }
    }
  }
  
  &.other-message {
    justify-content: flex-start;
    
    .message-content {
      align-items: flex-start;
      
      .message-body {
        background: white;
        color: #333;
      }
    }
  }
}

.message-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ddd;
  margin: 0 16rpx;
  flex-shrink: 0;
  
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  
  .avatar-text {
    color: white;
    font-size: 28rpx;
    font-weight: bold;
  }
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 60%;
  
  .user-name {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }
  
  .message-body {
    padding: 24rpx;
    border-radius: 16rpx;
    word-wrap: break-word;
    
    &.system {
      background: #f0f0f0 !important;
      color: #666 !important;
      text-align: center;
      font-size: 24rpx;
    }
    
    .message-text {
      font-size: 32rpx;
      line-height: 1.4;
    }
    
    .message-image {
      max-width: 400rpx;
      max-height: 400rpx;
      border-radius: 12rpx;
    }
    
    .system-text {
      font-size: 28rpx;
    }
  }
  
  .message-status {
    margin-top: 8rpx;
    
    .status-text {
      font-size: 20rpx;
      color: #999;
      
      &.error {
        color: #ff4444;
      }
    }
  }
}

.empty-messages {
  text-align: center;
  margin-top: 200rpx;
  
  .empty-icon {
    font-size: 120rpx;
    display: block;
    margin-bottom: 32rpx;
    opacity: 0.3;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

// 输入区域
.input-area {
  background: white;
  border-top: 1rpx solid #e5e5e5;
}

.input-container {
  display: flex;
  align-items: flex-end;
  padding: 24rpx 32rpx;
  min-height: 100rpx;
}

.input-actions {
  display: flex;
  margin-right: 16rpx;
  
  .action-item {
    margin-right: 16rpx;
    padding: 12rpx;
    
    .action-icon {
      font-size: 48rpx;
    }
  }
}

.input-wrapper {
  flex: 1;
  margin-right: 16rpx;
}

.message-input {
  width: 100%;
  max-height: 200rpx;
  padding: 20rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 24rpx;
  font-size: 32rpx;
  background: #f8f8f8;
}

.send-btn {
  padding: 20rpx 32rpx;
  border-radius: 24rpx;
  background: #ddd;
  
  &.can-send {
    background: #667eea;
    
    .send-icon {
      color: white;
    }
  }
  
  .send-icon {
    font-size: 28rpx;
    color: #999;
  }
}

// 表情面板
.emoji-panel {
  padding: 32rpx;
  background: #f8f8f8;
  border-top: 1rpx solid #e5e5e5;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 24rpx;
}

.emoji-item {
  font-size: 48rpx;
  text-align: center;
  padding: 16rpx;
  border-radius: 12rpx;
  
  &:active {
    background: #e5e5e5;
  }
}

// 聊天菜单
.chat-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

.chat-menu {
  width: 100%;
  background: white;
  border-radius: 32rpx 32rpx 0 0;
  padding: 32rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  
  .menu-icon {
    font-size: 40rpx;
    margin-right: 24rpx;
  }
  
  .menu-text {
    font-size: 32rpx;
    color: #333;
  }
}

.menu-cancel {
  text-align: center;
  padding: 32rpx 0;
  margin-top: 16rpx;
  color: #999;
  font-size: 32rpx;
}
</style>
