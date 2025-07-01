<template>
  <view class="container">
    <view class="chat-list">
      <view v-for="(msg, index) in messages" :key="index" class="chat-message">
        <text>{{ msg }}</text>
      </view>
    </view>
    <view class="input-area">
      <input
        v-model="inputText"
        placeholder="输入消息..."
        class="input-box"
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button @click="sendMessage" class="send-btn">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      messages: []
    };
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim()) return;
      this.messages.push(this.inputText.trim());
      this.inputText = '';
      this.$nextTick(() => {
        // 滚动到底部逻辑可添加
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
}
.chat-message {
  padding: 8px;
  background-color: #e1f0fb;
  border-radius: 5px;
  margin-bottom: 5px;
}
.input-area {
  display: flex;
  align-items: center;
}
.input-box {
  flex: 1;
  height: 40px;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.send-btn {
  margin-left: 10px;
  background-color: #1aad19;
  color: white;
  padding: 0 15px;
  height: 40px;
  border: none;
  border-radius: 4px;
}
</style>