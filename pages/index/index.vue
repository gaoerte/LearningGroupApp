<template>
  <view class="container" v-if="isLoggedIn">
    <text class="welcome-text">欢迎回来，小明</text>
    <view class="buttons">
      <button @click="goToCheckin">打卡</button>
      <button @click="goToGroupMatch">小组匹配</button>
      <button @click="goToAIChat">AI聊天</button>
    </view>
  </view>
  <view v-else class="loading-container">
    <text>正在检测登录状态...</text>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
      hasRedirected: false
    };
  },
  
  onLoad() {
    // 页面加载时检查登录状态
    this.checkLoginStatus();
  },
  
  onShow() {
    // 页面重新显示时也检查登录状态
    this.checkLoginStatus();
  },

  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      if (token) {
        this.isLoggedIn = true;
        this.hasRedirected = false;  // 清除重定向标志
      } else if (!this.hasRedirected) {
        this.hasRedirected = true;
        uni.redirectTo({
          url: '/pages/login/login'
        });
      }
    },

    goToCheckin() {
      uni.navigateTo({ url: '/pages/checkin/checkin' });
    },
    
    goToGroupMatch() {
      uni.navigateTo({ url: '/pages/groupMatch/groupMatch' });
    },
    
    goToAIChat() {
      uni.navigateTo({ url: '/pages/aichat/aichat' });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  padding: 20px;
}

.loading-container {
  display: flex;
  height: 100vh;
  justify-content: center;
  align-items: center;
}

.welcome-text {
  font-size: 24px;
  text-align: center;
  margin-bottom: 30px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

button {
  padding: 12px;
  font-size: 16px;
  background-color: #1aad19;
  color: white;
  border-radius: 5px;
  border: none;
}
</style>