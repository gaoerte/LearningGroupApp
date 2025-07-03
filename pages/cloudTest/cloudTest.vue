<!-- 云函数测试页面 -->
<template>
  <view class="test-container">
    <view class="header">
      <text class="title">云函数测试</text>
      <text class="subtitle">验证登录系统是否正常工作</text>
    </view>
    
    <view class="test-section">
      <view class="section-title">基础测试</view>
      <button @click="testSimple" :disabled="loading" class="test-btn">
        {{ loading ? '测试中...' : '简单测试' }}
      </button>
      <view v-if="simpleResult" class="result">
        <text class="result-title">结果:</text>
        <text class="result-content">{{ JSON.stringify(simpleResult, null, 2) }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <view class="section-title">登录测试</view>
      <button @click="testQuickLogin" :disabled="loading" class="test-btn">
        {{ loading ? '测试中...' : '快速登录测试' }}
      </button>
      <button @click="testWechatLogin" :disabled="loading" class="test-btn">
        {{ loading ? '测试中...' : '微信登录测试' }}
      </button>
      <view v-if="loginResult" class="result">
        <text class="result-title">登录结果:</text>
        <text class="result-content">{{ JSON.stringify(loginResult, null, 2) }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <view class="section-title">日志</view>
      <view class="logs">
        <view v-for="(log, index) in logs" :key="index" class="log-item">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-message">{{ log.message }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CloudFunctionTest',
  data() {
    return {
      loading: false,
      simpleResult: null,
      loginResult: null,
      logs: []
    };
  },
  
  methods: {
    addLog(message) {
      this.logs.unshift({
        time: new Date().toLocaleTimeString(),
        message: message
      });
      
      // 保持最多20条日志
      if (this.logs.length > 20) {
        this.logs = this.logs.slice(0, 20);
      }
    },
    
    async callCloudFunction(action, data = {}) {
      this.addLog(`开始调用云函数: ${action}`);
      
      try {
        const result = await uni.cloud.callFunction({
          name: 'supabaseCore',
          data: {
            action: action,
            data: data
          }
        });
        
        this.addLog(`云函数调用成功: ${action}`);
        return result.result;
      } catch (error) {
        this.addLog(`云函数调用失败: ${action} - ${error.message}`);
        throw error;
      }
    },
    
    async testSimple() {
      this.loading = true;
      this.simpleResult = null;
      
      try {
        const result = await this.callCloudFunction('simpleTest', {
          test: true,
          timestamp: Date.now()
        });
        
        this.simpleResult = result;
        
        if (result.success) {
          uni.showToast({
            title: '简单测试成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '简单测试失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('简单测试异常:', error);
        this.simpleResult = { error: error.message };
        uni.showToast({
          title: '测试异常',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    },
    
    async testQuickLogin() {
      this.loading = true;
      this.loginResult = null;
      
      try {
        const testOpenid = `test_${Date.now()}`;
        const result = await this.callCloudFunction('quickLogin', {
          openid: testOpenid
        });
        
        this.loginResult = result;
        
        if (result.success) {
          uni.showToast({
            title: '快速登录成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '快速登录失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('快速登录测试异常:', error);
        this.loginResult = { error: error.message };
        uni.showToast({
          title: '登录测试异常',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    },
    
    async testWechatLogin() {
      this.loading = true;
      this.loginResult = null;
      
      try {
        const mockCode = `mock_code_${Date.now()}`;
        const result = await this.callCloudFunction('wechatLogin', {
          code: mockCode
        });
        
        this.loginResult = result;
        
        if (result.success) {
          uni.showToast({
            title: '微信登录成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '微信登录失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('微信登录测试异常:', error);
        this.loginResult = { error: error.message };
        uni.showToast({
          title: '登录测试异常',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.test-container {
  padding: 32rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.test-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.test-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  margin-right: 16rpx;
  font-size: 28rpx;
}

.test-btn:disabled {
  background-color: #ccc;
}

.result {
  margin-top: 24rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
  border-left: 4rpx solid #007aff;
}

.result-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.result-content {
  display: block;
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
  white-space: pre-wrap;
}

.logs {
  max-height: 400rpx;
  overflow-y: auto;
}

.log-item {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #eee;
}

.log-time {
  display: inline-block;
  font-size: 24rpx;
  color: #999;
  margin-right: 16rpx;
}

.log-message {
  font-size: 26rpx;
  color: #333;
}
</style>
