<template>
  <scroll-view class="container" scroll-y>
    <view class="test-page">
      <!-- 标题 -->
      <view class="header">
        <text class="title">🔌 Supabase 连接测试</text>
        <text class="subtitle">快速验证数据库连接状态</text>
      </view>

      <!-- 状态卡片 -->
      <view class="status-card" :class="statusClass">
        <text class="status-icon">{{ statusIcon }}</text>
        <text class="status-text">{{ statusText }}</text>
      </view>

      <!-- 配置区域 -->
      <view class="config-section">
        <view class="config-item">
          <text class="label">Supabase URL:</text>
          <input 
            class="input"
            v-model="config.url"
            placeholder="https://your-project.supabase.co"
          />
        </view>
        <view class="config-item">
          <text class="label">Anonymous Key:</text>
          <input 
            class="input"
            v-model="config.anonKey"
            placeholder="your-anon-key"
            password
          />
        </view>
      </view>

      <!-- 测试按钮 -->
      <view class="button-group">
        <button 
          class="test-btn primary"
          @click="testBasicConnection"
          :disabled="testing"
        >
          {{ testing ? '连接中...' : '测试连接' }}
        </button>
        
        <button 
          class="test-btn secondary"
          @click="testTables"
          :disabled="testing || !connected"
        >
          测试表结构
        </button>
        
        <button 
          class="test-btn success"
          @click="runFullTest"
          :disabled="testing || !connected"
        >
          完整测试
        </button>
      </view>

      <!-- 测试结果 -->
      <view class="results-section" v-if="testResults.length > 0">
        <text class="section-title">测试结果</text>
        <view 
          class="result-item" 
          v-for="(result, index) in testResults" 
          :key="index"
          :class="result.success ? 'success' : 'error'"
        >
          <view class="result-header">
            <text class="result-icon">{{ result.success ? '✅' : '❌' }}</text>
            <text class="result-title">{{ result.title }}</text>
          </view>
          <text class="result-message">{{ result.message }}</text>
          <view class="result-details" v-if="result.details">
            <text class="details-text">{{ JSON.stringify(result.details, null, 2) }}</text>
          </view>
        </view>
      </view>

      <!-- 使用说明 -->
      <view class="help-section">
        <text class="section-title">使用说明</text>
        <view class="help-content">
          <text class="help-item">1. 在 Supabase Dashboard 获取项目 URL 和 API Key</text>
          <text class="help-item">2. 填写上述配置信息</text>
          <text class="help-item">3. 点击"测试连接"验证基础连接</text>
          <text class="help-item">4. 连接成功后可以进行进一步测试</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  data() {
    return {
      testing: false,
      connected: false,
      config: {
        url: '',
        anonKey: ''
      },
      statusText: '未连接',
      statusIcon: '🔴',
      statusClass: 'disconnected',
      testResults: []
    };
  },

  onLoad() {
    this.loadConfig();
  },

  methods: {
    /**
     * 加载保存的配置
     */
    loadConfig() {
      try {
        const savedConfig = uni.getStorageSync('supabase_config');
        if (savedConfig) {
          this.config = { ...this.config, ...savedConfig };
        }
      } catch (error) {
        console.warn('加载配置失败:', error);
      }
    },

    /**
     * 保存配置
     */
    saveConfig() {
      try {
        uni.setStorageSync('supabase_config', this.config);
      } catch (error) {
        console.warn('保存配置失败:', error);
      }
    },

    /**
     * 添加测试结果
     */
    addTestResult(title, success, message, details = null) {
      this.testResults.push({
        title,
        success,
        message,
        details,
        timestamp: new Date().toLocaleTimeString()
      });
    },

    /**
     * 清除测试结果
     */
    clearResults() {
      this.testResults = [];
    },

    /**
     * 更新连接状态
     */
    updateConnectionStatus(connected, message = '') {
      this.connected = connected;
      if (connected) {
        this.statusText = '已连接';
        this.statusIcon = '🟢';
        this.statusClass = 'connected';
      } else {
        this.statusText = message || '未连接';
        this.statusIcon = '🔴';
        this.statusClass = 'disconnected';
      }
    },

    /**
     * 测试基础连接
     */
    async testBasicConnection() {
      if (this.testing) return;

      // 验证配置
      if (!this.config.url || !this.config.anonKey) {
        uni.showToast({
          title: '请填写完整配置',
          icon: 'error'
        });
        return;
      }

      this.testing = true;
      this.clearResults();
      
      try {
        uni.showLoading({ title: '连接中...' });

        // 1. 首先测试直接HTTP连接
        this.addTestResult('配置验证', true, '配置信息完整');
        
        try {
          await this.testDirectHTTP();
        } catch (httpError) {
          console.log('直接HTTP连接失败，继续其他测试');
        }

        // 2. 测试云函数连接（如果部署了的话）
        await this.testCloudFunctions();

        // 3. 计算测试结果
        const successResults = this.testResults.filter(r => r.success);
        const totalResults = this.testResults.length;
        const successRate = Math.round((successResults.length / totalResults) * 100);

        if (successRate >= 50) {
          this.updateConnectionStatus(true);
          this.addTestResult('测试总结', true, `测试完成，成功率: ${successRate}%`);
          this.saveConfig();
        } else {
          this.updateConnectionStatus(false, '部分测试失败');
          this.addTestResult('测试总结', false, `测试完成，成功率: ${successRate}%`);
        }

      } catch (error) {
        console.error('连接测试失败:', error);
        this.updateConnectionStatus(false, '测试异常');
        this.addTestResult(
          '连接测试',
          false,
          `测试异常: ${error.message}`,
          error
        );
      } finally {
        this.testing = false;
        uni.hideLoading();
      }
    },

    /**
     * 测试表结构
     */
    async testTables() {
      if (this.testing || !this.connected) return;

      this.testing = true;
      
      try {
        uni.showLoading({ title: '测试表结构...' });

        // 尝试访问一个简单的表来测试数据库连接
        const testResult = await new Promise((resolve, reject) => {
          uni.request({
            url: this.config.url + '/rest/v1/users?limit=1',
            method: 'GET',
            header: {
              'Authorization': 'Bearer ' + this.config.anonKey,
              'apikey': this.config.anonKey,
              'Content-Type': 'application/json'
            },
            timeout: 10000,
            success: (res) => {
              console.log('表结构测试结果:', res);
              if (res.statusCode === 200) {
                resolve({ success: true, message: '数据库表访问正常', data: res.data });
              } else if (res.statusCode === 404) {
                resolve({ success: true, message: '数据库连接正常(表不存在是预期的)', data: null });
              } else {
                reject(new Error(`HTTP ${res.statusCode}`));
              }
            },
            fail: (error) => {
              reject(new Error(error.errMsg || '数据库访问失败'));
            }
          });
        });

        if (testResult.success) {
          this.addTestResult(
            '数据库测试',
            true,
            testResult.message,
            testResult.data
          );
        } else {
          this.addTestResult(
            '数据库测试',
            false,
            '数据库访问失败',
            null
          );
        }

      } catch (error) {
        console.error('表结构测试失败:', error);
        this.addTestResult(
          '表结构测试',
          false,
          `测试失败: ${error.message}`,
          error
        );
      } finally {
        this.testing = false;
        uni.hideLoading();
      }
    },

    /**
     * 运行完整测试
     */
    async runFullTest() {
      if (this.testing || !this.connected) return;

      this.testing = true;
      
      try {
        uni.showLoading({ title: '运行完整测试...' });

        // 运行所有基础测试
        const tests = [
          { name: '基础连接', fn: () => this.testDirectHTTP() },
          { name: '云函数连接', fn: () => this.testCloudFunctions() }
        ];

        let successCount = 0;
        const totalTests = tests.length;

        for (const test of tests) {
          try {
            await test.fn();
            successCount++;
            console.log(`[完整测试] ${test.name} 成功`);
          } catch (error) {
            console.warn(`[完整测试] ${test.name} 失败:`, error.message);
          }
        }

        const successRate = Math.round((successCount / totalTests) * 100);
        
        if (successRate >= 50) {
          this.addTestResult(
            '完整测试',
            true,
            `完整测试完成，成功率: ${successRate}% (${successCount}/${totalTests})`,
            { successCount, totalTests, successRate }
          );
        } else {
          this.addTestResult(
            '完整测试',
            false,
            `完整测试失败，成功率: ${successRate}% (${successCount}/${totalTests})`,
            { successCount, totalTests, successRate }
          );
        }

      } catch (error) {
        console.error('完整测试失败:', error);
        this.addTestResult(
          '完整测试',
          false,
          `测试失败: ${error.message}`,
          error
        );
      } finally {
        this.testing = false;
        uni.hideLoading();
      }
    },

    /**
     * 测试直接HTTP连接
     */
    async testDirectHTTP() {
      console.log('[测试] 开始直接HTTP连接测试');
      
      return new Promise((resolve, reject) => {
        uni.request({
          url: this.config.url + '/rest/v1/',
          method: 'GET',
          header: {
            'Authorization': 'Bearer ' + this.config.anonKey,
            'apikey': this.config.anonKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          success: (res) => {
            console.log('[测试] 直接HTTP连接成功:', res.statusCode);
            if (res.statusCode === 200) {
              this.addTestResult('直接连接', true, `HTTP ${res.statusCode} - REST API 可访问`);
              resolve(res);
            } else {
              this.addTestResult('直接连接', false, `HTTP ${res.statusCode} - 状态码异常`);
              reject(new Error(`HTTP ${res.statusCode}`));
            }
          },
          fail: (error) => {
            console.error('[测试] 直接HTTP连接失败:', error);
            this.addTestResult('直接连接', false, error.errMsg || '网络请求失败');
            reject(new Error(error.errMsg || '网络请求失败'));
          }
        });
      });
    },

    /**
     * 测试云函数连接
     */
    async testCloudFunctions() {
      console.log('[测试] 开始云函数连接测试');
      
      // 测试简化版云函数
      try {
        const simpleResult = await uni.cloud.callFunction({
          name: 'supabaseProxySimple',
          data: {
            action: 'testConnection',
            data: this.config
          }
        });
        
        if (simpleResult.result?.success) {
          this.addTestResult('云函数(简化版)', true, '简化版云函数连接成功');
          return;
        } else {
          this.addTestResult('云函数(简化版)', false, simpleResult.result?.error || '简化版云函数调用失败');
        }
      } catch (simpleError) {
        console.log('[测试] 简化版云函数失败，尝试完整版');
        this.addTestResult('云函数(简化版)', false, '简化版云函数未部署');
      }
      
      // 测试完整版云函数
      try {
        const fullResult = await uni.cloud.callFunction({
          name: 'supabaseProxy',
          data: {
            action: 'testConnection',
            data: this.config
          }
        });
        
        if (fullResult.result?.success) {
          this.addTestResult('云函数(完整版)', true, '完整版云函数连接成功');
        } else {
          this.addTestResult('云函数(完整版)', false, fullResult.result?.error || '完整版云函数调用失败');
        }
      } catch (fullError) {
        console.error('[测试] 完整版云函数失败:', fullError);
        this.addTestResult('云函数(完整版)', false, '完整版云函数未部署');
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.test-page {
  padding: 30rpx;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 50rpx;
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #ffffff;
    opacity: 0.9;
  }
}

.status-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  text-align: center;
  
  &.connected {
    border-left: 8rpx solid #00b894;
  }
  
  &.disconnected {
    border-left: 8rpx solid #e17055;
  }
  
  .status-icon {
    font-size: 60rpx;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .status-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.config-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  
  .config-item {
    margin-bottom: 30rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      font-weight: bold;
    }
    
    .input {
      width: 100%;
      height: 80rpx;
      border: 2rpx solid #ddd;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      background: #f8f9fa;
      
      &:focus {
        border-color: #74b9ff;
        background: #ffffff;
      }
    }
  }
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
  
  .test-btn {
    height: 90rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: bold;
    border: none;
    
    &.primary {
      background: #0984e3;
      color: #ffffff;
    }
    
    &.secondary {
      background: #00b894;
      color: #ffffff;
    }
    
    &.success {
      background: #00cec9;
      color: #ffffff;
    }
    
    &:disabled {
      background: #b2bec3;
      color: #ffffff;
    }
  }
}

.results-section,
.help-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 25rpx;
    border-bottom: 2rpx solid #eee;
    padding-bottom: 15rpx;
  }
}

.result-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #ddd;
  
  &.success {
    border-left-color: #00b894;
    background: #f1f8e9;
  }
  
  &.error {
    border-left-color: #e17055;
    background: #ffebee;
  }
  
  .result-header {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
    
    .result-icon {
      font-size: 28rpx;
      margin-right: 15rpx;
    }
    
    .result-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .result-message {
    font-size: 26rpx;
    color: #666;
    line-height: 1.5;
    margin-bottom: 15rpx;
  }
  
  .result-details {
    background: #ffffff;
    border-radius: 8rpx;
    padding: 20rpx;
    
    .details-text {
      font-size: 22rpx;
      color: #333;
      font-family: monospace;
      line-height: 1.4;
    }
  }
}

.help-content {
  .help-item {
    display: block;
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 15rpx;
    padding-left: 20rpx;
    position: relative;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #74b9ff;
      font-weight: bold;
    }
  }
}
</style>
