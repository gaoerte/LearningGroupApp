<template>
  <scroll-view class="test-container" scroll-y>
    <view class="test-page">
      <view class="header">
        <text class="title">🔧 云函数连接测试</text>
        <text class="subtitle">诊断小程序与云函数的连接问题</text>
      </view>

      <!-- 连接状态 -->
      <view class="status-card">
        <text class="status-label">连接状态:</text>
        <text class="status-value" :class="connectionStatus.class">
          {{ connectionStatus.text }}
        </text>
      </view>

      <!-- 测试按钮 -->
      <view class="test-buttons">
        <button 
          class="test-btn primary"
          @click="testBasicConnection"
          :disabled="testing"
        >
          {{ testing ? '测试中...' : '测试基础连接' }}
        </button>

        <button 
          class="test-btn secondary"
          @click="testSupabaseProxy"
          :disabled="testing"
        >
          测试Supabase代理
        </button>

        <button 
          class="test-btn info"
          @click="showLogs"
        >
          查看日志
        </button>

        <button 
          class="test-btn warning"
          @click="clearLogs"
        >
          清除日志
        </button>
      </view>

      <!-- 测试结果 -->
      <view class="results-section" v-if="testResults.length > 0">
        <text class="results-title">📊 测试结果</text>
        <view 
          v-for="(result, index) in testResults" 
          :key="index"
          class="result-item"
          :class="result.success ? 'success' : 'error'"
        >
          <view class="result-header">
            <text class="result-name">{{ result.name }}</text>
            <text class="result-time">{{ formatTime(result.timestamp) }}</text>
          </view>
          <text class="result-message">{{ result.message }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-text">点击按钮开始测试</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      testing: false,
      connectionStatus: {
        text: '未测试',
        class: 'status-unknown'
      },
      testResults: [],
      logs: []
    }
  },
  methods: {
    // 记录日志
    log(type, message, data = null) {
      const logEntry = {
        type,
        message,
        data,
        timestamp: new Date().toISOString()
      };
      
      this.logs.push(logEntry);
      console.log(`[${type}]`, message, data);
      
      // 保持最近50条日志
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(-50);
      }
    },

    // 添加测试结果
    addResult(name, success, message) {
      this.testResults.push({
        name,
        success,
        message,
        timestamp: new Date()
      });
    },

    // 测试基础连接
    async testBasicConnection() {
      if (this.testing) return;
      
      this.testing = true;
      this.addResult('基础连接测试', false, '测试中...');
      this.log('INFO', '开始基础连接测试');

      try {
        // 检查uni.cloud是否可用
        if (!uni.cloud) {
          throw new Error('uni.cloud 不可用，请检查云开发配置');
        }

        this.log('INFO', 'uni.cloud 可用，尝试调用测试云函数');

        // 调用测试云函数
        const result = await uni.cloud.callFunction({
          name: 'testProxy',
          data: {
            action: 'ping'
          }
        });

        this.log('INFO', '云函数调用结果', result);

        if (result.result && result.result.success) {
          this.connectionStatus = {
            text: '连接正常',
            class: 'status-success'
          };
          this.updateResult('基础连接测试', true, '云函数连接正常');
          
          // 继续测试环境
          await this.testEnvironment();
        } else {
          this.connectionStatus = {
            text: '连接失败',
            class: 'status-error'
          };
          this.updateResult('基础连接测试', false, result.errMsg || '云函数调用失败');
        }

      } catch (error) {
        this.log('ERROR', '基础连接测试失败', error);
        this.connectionStatus = {
          text: '连接错误',
          class: 'status-error'
        };
        this.updateResult('基础连接测试', false, error.message);
      } finally {
        this.testing = false;
      }
    },

    // 测试环境
    async testEnvironment() {
      this.addResult('环境检查', false, '检查中...');
      this.log('INFO', '开始环境检查');

      try {
        const result = await uni.cloud.callFunction({
          name: 'testProxy',
          data: {
            action: 'env'
          }
        });

        this.log('INFO', '环境检查结果', result);

        if (result.result && result.result.success) {
          const env = result.result.environment;
          this.updateResult('环境检查', true, 
            `Node: ${env.nodeVersion}, Supabase配置: ${env.hasSupabaseUrl ? '✓' : '✗'}`);
        } else {
          this.updateResult('环境检查', false, '环境检查失败');
        }

      } catch (error) {
        this.log('ERROR', '环境检查失败', error);
        this.updateResult('环境检查', false, error.message);
      }
    },

    // 测试Supabase代理
    async testSupabaseProxy() {
      if (this.testing) return;
      
      this.testing = true;
      this.addResult('Supabase代理测试', false, '测试中...');
      this.log('INFO', '开始Supabase代理测试');

      try {
        const result = await uni.cloud.callFunction({
          name: 'supabaseProxy',
          data: {
            action: 'healthCheck'
          }
        });

        this.log('INFO', 'Supabase代理测试结果', result);

        if (result.result && result.result.success) {
          this.updateResult('Supabase代理测试', true, 'Supabase代理云函数正常');
        } else {
          this.updateResult('Supabase代理测试', false, 
            result.result?.error || result.errMsg || 'Supabase代理调用失败');
        }

      } catch (error) {
        this.log('ERROR', 'Supabase代理测试失败', error);
        this.updateResult('Supabase代理测试', false, error.message);
      } finally {
        this.testing = false;
      }
    },

    // 更新测试结果
    updateResult(name, success, message) {
      const index = this.testResults.findIndex(r => r.name === name);
      if (index >= 0) {
        this.testResults[index] = {
          ...this.testResults[index],
          success,
          message,
          timestamp: new Date()
        };
      }
    },

    // 显示日志
    showLogs() {
      const logText = this.logs.map(log => 
        `[${log.type}] ${new Date(log.timestamp).toLocaleTimeString()} - ${log.message}`
      ).join('\n');

      uni.showModal({
        title: '调试日志',
        content: logText || '暂无日志',
        showCancel: false
      });
    },

    // 清除日志
    clearLogs() {
      this.logs = [];
      this.testResults = [];
      this.connectionStatus = {
        text: '未测试',
        class: 'status-unknown'
      };
      
      uni.showToast({
        title: '已清除',
        icon: 'success'
      });
    },

    // 格式化时间
    formatTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString();
    }
  }
}
</script>

<style scoped>
.test-container {
  height: 100vh;
  background: #f5f5f5;
}

.test-page {
  padding: 30rpx;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  background: white;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.status-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.status-value {
  font-size: 28rpx;
  font-weight: 600;
  padding: 10rpx 20rpx;
  border-radius: 12rpx;
}

.status-unknown {
  color: #ff9500;
  background: #fff3e0;
}

.status-success {
  color: #34c759;
  background: #e8f5e8;
}

.status-error {
  color: #ff3b30;
  background: #ffe8e8;
}

.test-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.test-btn {
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-btn.primary {
  background: #007aff;
  color: white;
}

.test-btn.secondary {
  background: #34c759;
  color: white;
}

.test-btn.info {
  background: #5ac8fa;
  color: white;
}

.test-btn.warning {
  background: #ff9500;
  color: white;
}

.test-btn:disabled {
  opacity: 0.6;
}

.results-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.results-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
}

.result-item {
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  border-left: 8rpx solid #ddd;
}

.result-item.success {
  background: #f0fff4;
  border-left-color: #34c759;
}

.result-item.error {
  background: #fff5f5;
  border-left-color: #ff3b30;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.result-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.result-time {
  font-size: 24rpx;
  color: #999;
}

.result-message {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: block;
}

.empty-state {
  text-align: center;
  padding: 100rpx 40rpx;
  background: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 响应式 */
@media (max-width: 750rpx) {
  .test-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
