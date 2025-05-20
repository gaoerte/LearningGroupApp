<template>
    <view class="page">
      <scroll-view class="chat-container" scroll-y>
        <view
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <text>{{ msg.content }}</text>
        </view>
      </scroll-view>
  
      <view class="input-area">
        <input
          v-model="userInput"
          placeholder="请输入你的问题"
          confirm-type="send"
          @confirm="handleSend"
          :disabled="isLoading"
          class="chat-input"
        />
        <button
          :disabled="!userInput.trim() || isLoading"
          @click="handleSend"
          class="send-btn"
        >
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </view>
    </view>
  </template>
  
  <script>
  import { createStreamingChat } from '@/api/deepseek';
  
  export default {
    data() {
      return {
        messages: [],
        userInput: '',
        isLoading: false,
      };
    },
    methods: {
      async handleSend() {
        if (!this.userInput.trim() || this.isLoading) return;
  
        // 添加用户消息
        this.messages.push({ role: 'user', content: this.userInput });
  
        // 清空输入框
        this.userInput = '';
        this.isLoading = true;
  
        // 先添加一条空的 assistant 消息，用于拼接流式数据
        this.messages.push({ role: 'assistant', content: '' });
  
        try {
          await createStreamingChat(this.messages, (partialResponse) => {
            if (partialResponse) {
              const lastIndex = this.messages.length - 1;
              this.messages[lastIndex].content += partialResponse;
              this.messages = [...this.messages]; // 触发响应式更新
            }
          });
        } catch (error) {
          this.messages.push({
            role: 'assistant',
            content: 'AI 请求失败，请稍后再试。',
          });
          console.error('API请求失败:', error);
        } finally {
          this.isLoading = false;
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #fff;
  }
  
  .chat-container {
    flex: 1;
    padding: 10px;
    background-color: #f9f9f9;
    height: 70vh;
    overflow-y: scroll;
  }
  
  .message {
    margin-bottom: 10px;
    padding: 10px 15px;
    border-radius: 16px;
    max-width: 70%;
    word-wrap: break-word;
    font-size: 16px;
    line-height: 1.4;
  }
  
  .user {
    background-color: #dcf8c6;
    align-self: flex-end;
    text-align: right;
  }
  
  .assistant {
    background-color: #f1f0f0;
    align-self: flex-start;
    text-align: left;
  }
  
  .input-area {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
    background-color: #fff;
  }
  
  .chat-input {
    flex: 1;
    height: 40px;
    padding: 0 10px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 16px;
  }
  
  .send-btn {
    margin-left: 10px;
    background-color: #1aad19;
    color: white;
    padding: 0 20px;
    border-radius: 20px;
    font-size: 16px;
    line-height: 40px;
    user-select: none;
    cursor: pointer;
  }
  
  .send-btn:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
  </style>