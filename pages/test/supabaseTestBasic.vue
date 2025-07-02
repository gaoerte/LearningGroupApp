<template>
  <scroll-view class="container" scroll-y>
    <view class="test-page">
      <!-- 标题 -->
      <view class="header">
        <text class="title">🔌 Supabase 基础测试</text>
        <text class="subtitle">简化版连接测试，无外部依赖</text>
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
          class="test-btn primary big"
          @click="testConnection"
          :disabled="testing"
        >
          <text class="btn-icon">🔌</text>
          <text class="btn-text">{{ testing ? '连接测试中...' : '测试 Supabase 连接' }}</text>
        </button>
        
        <button 
          class="test-btn secondary"
          @click="clearResults"
        >
          <text class="btn-icon">🗑️</text>
          <text class="btn-text">清除测试结果</text>
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
        </view>
      </view>

      <!-- 使用说明 -->
      <view class="help-section">
        <text class="section-title">使用说明</text>
        <view class="help-content">
          <text class="help-item">1. 在 Supabase Dashboard 获取项目配置</text>
          <text class="help-item">2. 填写上述配置信息</text>
          <text class="help-item">3. 点击"测试连接"验证</text>
          <text class="help-item">4. 查看测试结果和建议</text>
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
        url: 'https://klpseujbhwvifsfshfdx.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
      },
      statusText: '未连接',
      statusIcon: '🔴',
      statusClass: 'disconnected',
      testResults: []
    }
  },

  onLoad() {
    this.loadConfig()
  },

  methods: {
    /**
     * 加载保存的配置
     */
    loadConfig() {
      try {
        const savedConfig = uni.getStorageSync('supabase_basic_config')
        if (savedConfig) {
          this.config = { ...this.config, ...savedConfig }
        }
      } catch (error) {
        console.warn('加载配置失败:', error)
      }
    },

    /**
     * 保存配置
     */
    saveConfig() {
      try {
        uni.setStorageSync('supabase_basic_config', this.config)
      } catch (error) {
        console.warn('保存配置失败:', error)
      }
    },

    /**
     * 添加测试结果
     */
    addTestResult(title, success, message) {
      this.testResults.push({
        title,
        success,
        message,
        timestamp: new Date().toLocaleTimeString()
      })
    },

    /**
     * 清除测试结果
     */
    clearResults() {
      this.testResults = []
    },

    /**
     * 更新连接状态
     */
    updateConnectionStatus(connected, message = '') {
      this.connected = connected
      if (connected) {
        this.statusText = '已连接'
        this.statusIcon = '🟢'
        this.statusClass = 'connected'
      } else {
        this.statusText = message || '未连接'
        this.statusIcon = '🔴'
        this.statusClass = 'disconnected'
      }
    },

    /**
     * 验证配置
     */
    validateConfig() {
      if (!this.config.url || !this.config.anonKey) {
        this.addTestResult('配置验证', false, '请填写完整的 URL 和 API Key')
        return false
      }

      if (!this.config.url.startsWith('https://')) {
        this.addTestResult('配置验证', false, 'URL 必须以 https:// 开头')
        return false
      }

      if (!this.config.url.includes('supabase.co')) {
        this.addTestResult('配置验证', false, 'URL 格式不正确，应包含 supabase.co')
        return false
      }

      this.addTestResult('配置验证', true, '配置信息格式正确')
      return true
    },

    /**
     * 测试连接
     */
    async testConnection() {
      if (this.testing) return

      this.testing = true
      this.clearResults()
      
      try {
        // 1. 验证配置
        if (!this.validateConfig()) {
          return
        }

        uni.showLoading({ title: '连接中...' })

        // 2. 测试云函数连接
        this.addTestResult('云函数连接', false, '开始测试云函数连接...')
        
        try {
          // 优先尝试简化版云函数
          const cloudResult = await uni.cloud.callFunction({
            name: 'supabaseProxySimple',
            data: {
              action: 'testConnection',
              data: this.config
            }
          })

          if (cloudResult.result?.success) {
            this.addTestResult('云函数连接', true, '简化版云函数连接正常')
          } else {
            this.addTestResult('云函数连接', false, cloudResult.result?.error || '简化版云函数响应异常')
            // 尝试完整版云函数
            throw new Error('尝试完整版云函数')
          }
        } catch (cloudError) {
          try {
            // 尝试完整版云函数
            const fullResult = await uni.cloud.callFunction({
              name: 'supabaseProxy',
              data: {
                action: 'testConnection',
                data: this.config
              }
            })
            
            if (fullResult.result?.success) {
              this.addTestResult('云函数连接', true, '完整版云函数连接正常')
            } else {
              this.addTestResult('云函数连接', false, fullResult.result?.error || '完整版云函数响应异常')
            }
          } catch (fullError) {
            this.addTestResult('云函数连接', false, `所有云函数连接失败: ${fullError.message}`)
          }
        }

        // 3. 测试 Supabase 直接连接
        this.addTestResult('Supabase连接', false, '开始测试 Supabase 直接连接...')
        
        try {
          const directResult = await new Promise((resolve, reject) => {
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
                if (res.statusCode === 200) {
                  resolve(res)
                } else {
                  reject(new Error(`HTTP ${res.statusCode}`))
                }
              },
              fail: (error) => {
                reject(new Error(error.errMsg || '网络请求失败'))
              }
            })
          })

          this.updateConnectionStatus(true)
          this.addTestResult('Supabase连接', true, `直接连接成功 (HTTP ${directResult.statusCode})`)
          this.saveConfig()
        } catch (directError) {
          this.updateConnectionStatus(false, '连接失败')
          this.addTestResult('Supabase连接', false, `直接连接失败: ${directError.message}`)
        }

        // 4. 显示测试总结
        const successCount = this.testResults.filter(r => r.success).length
        const totalCount = this.testResults.length
        const passRate = Math.round((successCount / totalCount) * 100)
        
        this.addTestResult('测试总结', passRate >= 70, `通过率: ${passRate}% (${successCount}/${totalCount})`)

      } catch (error) {
        console.error('测试失败:', error)
        this.updateConnectionStatus(false, '测试异常')
        this.addTestResult('测试异常', false, `测试过程发生异常: ${error.message}`)
      } finally {
        this.testing = false
        uni.hideLoading()
      }
    },

    /**
     * 更新连接状态
     */
    updateConnectionStatus(connected, message = '') {
      this.connected = connected
      if (connected) {
        this.statusText = '连接成功'
        this.statusIcon = '✅'
        this.statusClass = 'connected'
      } else {
        this.statusText = message || '连接失败'
        this.statusIcon = '❌'
        this.statusClass = 'disconnected'
      }
    }
  }
}
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
}

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

.status-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  text-align: center;
}

.status-card.connected {
  border-left: 8rpx solid #00b894;
}

.status-card.disconnected {
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

.config-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.config-item {
  margin-bottom: 30rpx;
}

.config-item:last-child {
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
}

.input:focus {
  border-color: #74b9ff;
  background: #ffffff;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.test-btn {
  height: 100rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: bold;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  position: relative;
  
  &.big {
    height: 120rpx;
    font-size: 32rpx;
  }
}

.test-btn.primary {
  background: #0984e3;
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(9, 132, 227, 0.3);
}

.test-btn.secondary {
  background: #00b894;
  color: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 184, 148, 0.3);
}

.test-btn:disabled {
  background: #b2bec3;
  color: #ffffff;
  box-shadow: none;
}

.test-btn:active:not(:disabled) {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: inherit;
  font-weight: inherit;
}

.results-section,
.help-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 25rpx;
  border-bottom: 2rpx solid #eee;
  padding-bottom: 15rpx;
}

.result-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #ddd;
}

.result-item.success {
  border-left-color: #00b894;
  background: #f1f8e9;
}

.result-item.error {
  border-left-color: #e17055;
  background: #ffebee;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.result-icon {
  font-size: 28rpx;
  margin-right: 15rpx;
}

.result-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.result-message {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.help-item {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
  padding-left: 20rpx;
  position: relative;
}

.help-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #74b9ff;
  font-weight: bold;
}
</style>
