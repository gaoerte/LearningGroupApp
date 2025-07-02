<template>
  <scroll-view class="container" scroll-y>
    <view class="test-page">
      <!-- 页面标题 -->
      <view class="header">
        <text class="title">🔌 Supabase 快速测试</text>
        <text class="subtitle">无需云函数的简化测试工具</text>
      </view>

      <!-- 连接状态显示 -->
      <view class="status-card" :class="statusClass">
        <text class="status-icon">{{ statusIcon }}</text>
        <text class="status-text">{{ statusText }}</text>
      </view>

      <!-- 配置区域 -->
      <view class="config-section">
        <view class="form-item">
          <text class="label">Supabase URL:</text>
          <input 
            class="input"
            v-model="config.url"
            placeholder="https://your-project.supabase.co"
          />
        </view>
        
        <view class="form-item">
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
      <view class="button-section">
        <button 
          class="test-button"
          @click="runTest"
          :disabled="testing"
        >
          <text class="btn-icon">{{ testing ? '⏳' : '🚀' }}</text>
          <text class="btn-text">{{ testing ? '测试中...' : '开始连接测试' }}</text>
        </button>
        
        <button 
          class="clear-button"
          @click="clearAll"
          :disabled="testing"
        >
          清除结果
        </button>
      </view>

      <!-- 测试结果 -->
      <view class="results-section" v-if="results.length > 0">
        <text class="results-title">🧪 测试结果</text>
        <view 
          class="result-item"
          v-for="(result, index) in results"
          :key="index"
          :class="result.status"
        >
          <text class="result-icon">{{ result.icon }}</text>
          <view class="result-content">
            <text class="result-name">{{ result.name }}</text>
            <text class="result-message">{{ result.message }}</text>
            <text class="result-time">{{ result.time }}</text>
          </view>
        </view>
      </view>

      <!-- 使用说明 -->
      <view class="help-section">
        <text class="help-title">📖 使用说明</text>
        <text class="help-item">1. 在 Supabase Dashboard 获取项目 URL 和 Anonymous Key</text>
        <text class="help-item">2. 填写上方配置信息</text>
        <text class="help-item">3. 点击"开始连接测试"进行验证</text>
        <text class="help-item">4. 根据测试结果判断连接状态</text>
      </view>
    </view>
  </scroll-view>
</template>

<script>
export default {
  name: 'SupabaseQuickTest',
  data() {
    return {
      testing: false,
      config: {
        url: 'https://klpseujbhwvifsfshfdx.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
      },
      statusText: '等待测试',
      statusIcon: '⚪',
      statusClass: 'waiting',
      results: []
    }
  },

  onLoad() {
    console.log('[快速测试] 页面加载');
    this.loadConfig();
  },

  methods: {
    /**
     * 加载保存的配置
     */
    loadConfig() {
      try {
        const saved = uni.getStorageSync('supabase_config');
        if (saved) {
          this.config = { ...this.config, ...saved };
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
     * 运行测试
     */
    async runTest() {
      if (this.testing) return;

      this.testing = true;
      this.results = [];
      this.updateStatus('testing', '🔄', '正在测试...');

      console.log('[快速测试] 开始测试');

      try {
        // 验证配置
        if (!this.validateConfig()) {
          return;
        }

        // 测试REST API连接
        await this.testRestAPI();

        // 测试认证端点
        await this.testAuth();

        // 计算成功率
        const successCount = this.results.filter(r => r.status === 'success').length;
        const totalCount = this.results.length;
        const rate = Math.round((successCount / totalCount) * 100);

        // 更新最终状态
        if (rate >= 70) {
          this.updateStatus('success', '✅', `测试完成 (${rate}% 通过)`);
          this.addResult('测试总结', 'success', '✅', `连接测试通过，成功率: ${rate}%`);
          this.saveConfig();
        } else {
          this.updateStatus('warning', '⚠️', `部分成功 (${rate}% 通过)`);
          this.addResult('测试总结', 'warning', '⚠️', `部分测试通过，成功率: ${rate}%`);
        }

        uni.showToast({
          title: '测试完成',
          icon: 'success'
        });

      } catch (error) {
        console.error('[快速测试] 测试异常:', error);
        this.updateStatus('error', '❌', '测试失败');
        this.addResult('测试异常', 'error', '❌', error.message);
        
        uni.showToast({
          title: '测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 验证配置
     */
    validateConfig() {
      if (!this.config.url) {
        this.addResult('配置验证', 'error', '❌', 'URL 不能为空');
        this.updateStatus('error', '❌', '配置错误');
        return false;
      }

      if (!this.config.anonKey) {
        this.addResult('配置验证', 'error', '❌', 'Anonymous Key 不能为空');
        this.updateStatus('error', '❌', '配置错误');
        return false;
      }

      if (!this.config.url.startsWith('https://')) {
        this.addResult('配置验证', 'error', '❌', 'URL 必须以 https:// 开头');
        this.updateStatus('error', '❌', '配置错误');
        return false;
      }

      this.addResult('配置验证', 'success', '✅', '配置信息验证通过');
      return true;
    },

    /**
     * 测试REST API连接
     */
    async testRestAPI() {
      console.log('[快速测试] 测试 REST API');

      return new Promise((resolve) => {
        uni.request({
          url: this.config.url + '/rest/v1/',
          method: 'GET',
          header: {
            'Authorization': 'Bearer ' + this.config.anonKey,
            'apikey': this.config.anonKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          dataType: 'text', // 使用 text 类型避免 JSON 解析问题
          success: (res) => {
            try {
              console.log('[快速测试] REST API 响应:', res.statusCode);
              if (res.statusCode === 200) {
                this.addResult('REST API', 'success', '✅', `连接成功 (HTTP ${res.statusCode})`);
              } else {
                this.addResult('REST API', 'warning', '⚠️', `响应异常 (HTTP ${res.statusCode})`);
              }
            } catch (error) {
              console.error('[快速测试] 处理响应时出错:', error);
              this.addResult('REST API', 'warning', '⚠️', '响应处理异常');
            }
            resolve();
          },
          fail: (error) => {
            console.error('[快速测试] REST API 失败:', error);
            this.addResult('REST API', 'error', '❌', error.errMsg || '连接失败');
            resolve();
          }
        });
      });
    },

    /**
     * 测试认证端点
     */
    async testAuth() {
      console.log('[快速测试] 测试认证端点');

      return new Promise((resolve) => {
        uni.request({
          url: this.config.url + '/auth/v1/settings',
          method: 'GET',
          header: {
            'Authorization': 'Bearer ' + this.config.anonKey,
            'apikey': this.config.anonKey,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
          dataType: 'text', // 使用 text 类型避免 JSON 解析问题
          success: (res) => {
            try {
              console.log('[快速测试] 认证端点响应:', res.statusCode);
              if (res.statusCode === 200) {
                this.addResult('认证服务', 'success', '✅', '认证端点可访问');
              } else {
                this.addResult('认证服务', 'warning', '⚠️', `认证端点异常 (HTTP ${res.statusCode})`);
              }
            } catch (error) {
              console.error('[快速测试] 处理认证响应时出错:', error);
              this.addResult('认证服务', 'warning', '⚠️', '认证响应处理异常');
            }
            resolve();
          },
          fail: (error) => {
            console.error('[快速测试] 认证端点失败:', error);
            this.addResult('认证服务', 'error', '❌', error.errMsg || '认证端点不可访问');
            resolve();
          }
        });
      });
    },

    /**
     * 更新状态
     */
    updateStatus(status, icon, text) {
      this.statusClass = status;
      this.statusIcon = icon;
      this.statusText = text;
    },

    /**
     * 添加结果
     */
    addResult(name, status, icon, message) {
      this.results.push({
        name,
        status,
        icon,
        message,
        time: new Date().toLocaleTimeString()
      });
    },

    /**
     * 清除所有结果
     */
    clearAll() {
      this.results = [];
      this.updateStatus('waiting', '⚪', '等待测试');
      console.log('[快速测试] 已清除结果');
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.test-page {
  padding: 40rpx;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: white;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.status-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  &.waiting {
    border-left: 8rpx solid #74b9ff;
  }
  
  &.testing {
    border-left: 8rpx solid #fdcb6e;
  }
  
  &.success {
    border-left: 8rpx solid #00b894;
  }
  
  &.warning {
    border-left: 8rpx solid #e17055;
  }
  
  &.error {
    border-left: 8rpx solid #d63031;
  }
  
  .status-icon {
    display: block;
    font-size: 64rpx;
    margin-bottom: 20rpx;
  }
  
  .status-text {
    font-size: 32rpx;
    font-weight: bold;
    color: #2d3436;
  }
}

.config-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .form-item {
    margin-bottom: 32rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .label {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 16rpx;
  }
  
  .input {
    width: 100%;
    height: 88rpx;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #495057;
    
    &:focus {
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
    }
  }
}

.button-section {
  margin-bottom: 40rpx;
  
  .test-button {
    width: 100%;
    height: 120rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
    
    &:disabled {
      opacity: 0.7;
      box-shadow: none;
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
    
    .btn-icon {
      font-size: 40rpx;
    }
  }
  
  .clear-button {
    width: 100%;
    height: 80rpx;
    background: transparent;
    color: white;
    border: 2rpx solid rgba(255, 255, 255, 0.5);
    border-radius: 16rpx;
    font-size: 28rpx;
    
    &:active:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.results-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .results-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 32rpx;
  }
  
  .result-item {
    display: flex;
    align-items: flex-start;
    gap: 20rpx;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f1f3f4;
    
    &:last-child {
      border-bottom: none;
    }
    
    .result-icon {
      font-size: 32rpx;
      min-width: 32rpx;
    }
    
    .result-content {
      flex: 1;
      
      .result-name {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #2d3436;
        margin-bottom: 8rpx;
      }
      
      .result-message {
        display: block;
        font-size: 24rpx;
        color: #636e72;
        line-height: 1.5;
        margin-bottom: 4rpx;
      }
      
      .result-time {
        display: block;
        font-size: 20rpx;
        color: #b2bec3;
      }
    }
  }
}

.help-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 32rpx;
  
  .help-title {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 20rpx;
  }
  
  .help-item {
    display: block;
    font-size: 24rpx;
    color: #636e72;
    line-height: 1.6;
    margin-bottom: 12rpx;
    padding-left: 20rpx;
    position: relative;
    
    &::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
    }
  }
}
</style>
