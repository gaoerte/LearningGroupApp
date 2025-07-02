<template>
  <view class="container">
    <view class="header">
      <text class="title">🔗 Supabase 连接测试（稳定版）</text>
      <text class="subtitle">验证 Supabase 服务可用性</text>
    </view>

    <!-- 状态显示 -->
    <view class="status-card" :class="statusClass">
      <text class="status-icon">{{ statusIcon }}</text>
      <text class="status-text">{{ statusText }}</text>
    </view>

    <!-- 配置表单 -->
    <view class="config-section">
      <text class="section-title">⚙️ 配置信息</text>
      
      <view class="input-group">
        <text class="label">项目 URL</text>
        <input
          class="input"
          v-model="config.url"
          placeholder="https://your-project.supabase.co"
        />
      </view>
      
      <view class="input-group">
        <text class="label">Anonymous Key</text>
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
      <text class="help-item">3. 点击开始测试验证连接</text>
      <text class="help-item">4. 查看测试结果，绿色表示成功</text>
    </view>
  </view>
</template>

<script>
export default {
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
    console.log('[稳定版测试] 页面加载');
    this.loadConfig();
  },

  methods: {
    /**
     * 加载保存的配置
     */
    loadConfig() {
      try {
        const saved = uni.getStorageSync('supabase_config');
        if (saved && typeof saved === 'object') {
          // 安全地合并配置
          Object.keys(saved).forEach(key => {
            if (saved[key] && typeof saved[key] === 'string') {
              this.config[key] = saved[key];
            }
          });
        }
      } catch (error) {
        console.error('[稳定版测试] 加载配置失败:', error);
      }
    },

    /**
     * 保存配置
     */
    saveConfig() {
      try {
        // 创建一个纯净的配置对象
        const configToSave = {
          url: this.config.url || '',
          anonKey: this.config.anonKey || ''
        };
        uni.setStorageSync('supabase_config', configToSave);
      } catch (error) {
        console.error('[稳定版测试] 保存配置失败:', error);
      }
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
     * 运行测试
     */
    async runTest() {
      if (this.testing) return;

      console.log('[稳定版测试] 开始运行测试');
      this.testing = true;
      this.results = [];
      this.updateStatus('testing', '⏳', '正在测试...');

      try {
        // 保存配置
        this.saveConfig();

        // 验证配置
        if (!this.validateConfig()) {
          this.updateStatus('error', '❌', '配置验证失败');
          return;
        }

        // 运行测试
        await this.testBasicConnection();
        await this.delay(1000); // 延迟1秒
        await this.testAuthEndpoint();

        // 计算成功率
        const successCount = this.results.filter(r => r.status === 'success').length;
        const totalCount = this.results.length;
        const rate = Math.round((successCount / totalCount) * 100);

        if (rate >= 80) {
          this.updateStatus('success', '✅', `测试完成，成功率: ${rate}%`);
          this.addResult('测试总结', 'success', '✅', `连接测试通过，成功率: ${rate}%`);
        } else if (rate >= 50) {
          this.updateStatus('warning', '⚠️', `测试完成，成功率: ${rate}%`);
          this.addResult('测试总结', 'warning', '⚠️', `部分测试通过，成功率: ${rate}%`);
        } else {
          this.updateStatus('error', '❌', `测试失败，成功率: ${rate}%`);
          this.addResult('测试总结', 'error', '❌', `大部分测试失败，成功率: ${rate}%`);
        }

      } catch (error) {
        console.error('[稳定版测试] 测试过程出错:', error);
        this.addResult('测试异常', 'error', '❌', error.message || '测试过程异常');
        this.updateStatus('error', '❌', '测试过程异常');
      } finally {
        this.testing = false;
      }
    },

    /**
     * 验证配置
     */
    validateConfig() {
      if (!this.config.url || this.config.url.trim() === '') {
        this.addResult('配置验证', 'error', '❌', 'URL 不能为空');
        return false;
      }

      if (!this.config.anonKey || this.config.anonKey.trim() === '') {
        this.addResult('配置验证', 'error', '❌', 'Anonymous Key 不能为空');
        return false;
      }

      if (!this.config.url.startsWith('https://')) {
        this.addResult('配置验证', 'error', '❌', 'URL 必须以 https:// 开头');
        return false;
      }

      this.addResult('配置验证', 'success', '✅', '配置信息验证通过');
      return true;
    },

    /**
     * 测试基础连接
     */
    async testBasicConnection() {
      console.log('[稳定版测试] 测试基础连接');

      return new Promise((resolve) => {
        const url = this.config.url + '/rest/v1/';
        console.log('[稳定版测试] 请求URL:', url);

        uni.request({
          url: url,
          method: 'GET',
          header: {
            'Authorization': 'Bearer ' + this.config.anonKey,
            'apikey': this.config.anonKey
          },
          timeout: 10000,
          dataType: 'text', // 强制使用 text 避免 JSON 解析
          responseType: 'text', // 确保响应类型为文本
          success: (res) => {
            try {
              console.log('[稳定版测试] 基础连接响应:', res.statusCode);
              
              // 只使用状态码，完全不处理响应数据
              if (res.statusCode === 200) {
                this.addResult('基础连接', 'success', '✅', '连接成功');
              } else if (res.statusCode === 401) {
                this.addResult('基础连接', 'warning', '⚠️', '认证失败，请检查 API Key');
              } else if (res.statusCode === 404) {
                this.addResult('基础连接', 'warning', '⚠️', 'API 端点不存在，请检查 URL');
              } else {
                this.addResult('基础连接', 'warning', '⚠️', `响应异常 (HTTP ${res.statusCode})`);
              }
            } catch (error) {
              console.error('[稳定版测试] 处理基础连接响应时出错:', error);
              this.addResult('基础连接', 'warning', '⚠️', '响应处理异常');
            }
            resolve();
          },
          fail: (error) => {
            console.error('[稳定版测试] 基础连接失败:', error);
            this.addResult('基础连接', 'error', '❌', this.getErrorMessage(error));
            resolve();
          }
        });
      });
    },

    /**
     * 测试认证端点
     */
    async testAuthEndpoint() {
      console.log('[稳定版测试] 测试认证端点');

      return new Promise((resolve) => {
        const url = this.config.url + '/auth/v1/settings';
        console.log('[稳定版测试] 认证URL:', url);

        uni.request({
          url: url,
          method: 'GET',
          header: {
            'Authorization': 'Bearer ' + this.config.anonKey,
            'apikey': this.config.anonKey
          },
          timeout: 10000,
          dataType: 'text', // 强制使用 text 避免 JSON 解析
          responseType: 'text', // 确保响应类型为文本
          success: (res) => {
            try {
              console.log('[稳定版测试] 认证端点响应:', res.statusCode);
              
              if (res.statusCode === 200) {
                this.addResult('认证服务', 'success', '✅', '认证端点正常');
              } else if (res.statusCode === 401) {
                this.addResult('认证服务', 'warning', '⚠️', '认证失败');
              } else {
                this.addResult('认证服务', 'warning', '⚠️', `认证端点异常 (HTTP ${res.statusCode})`);
              }
            } catch (error) {
              console.error('[稳定版测试] 处理认证响应时出错:', error);
              this.addResult('认证服务', 'warning', '⚠️', '认证响应处理异常');
            }
            resolve();
          },
          fail: (error) => {
            console.error('[稳定版测试] 认证端点失败:', error);
            this.addResult('认证服务', 'error', '❌', this.getErrorMessage(error));
            resolve();
          }
        });
      });
    },

    /**
     * 获取错误信息
     */
    getErrorMessage(error) {
      if (error.errMsg) {
        if (error.errMsg.includes('timeout')) {
          return '连接超时';
        } else if (error.errMsg.includes('fail')) {
          return '连接失败';
        } else {
          return error.errMsg;
        }
      }
      return '未知错误';
    },

    /**
     * 添加结果
     */
    addResult(name, status, icon, message) {
      // 创建一个纯净的结果对象
      const result = {
        name: String(name),
        status: String(status),
        icon: String(icon),
        message: String(message),
        time: new Date().toLocaleTimeString()
      };
      
      this.results.push(result);
    },

    /**
     * 清除所有结果
     */
    clearAll() {
      this.results = [];
      this.updateStatus('waiting', '⚪', '等待测试');
      console.log('[稳定版测试] 已清除结果');
    },

    /**
     * 延迟函数
     */
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  display: block;
}

.status-card {
  background: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.status-card.waiting {
  border-left: 4px solid #999;
}

.status-card.testing {
  border-left: 4px solid #007AFF;
}

.status-card.success {
  border-left: 4px solid #28a745;
}

.status-card.warning {
  border-left: 4px solid #ffc107;
}

.status-card.error {
  border-left: 4px solid #dc3545;
}

.status-icon {
  font-size: 24px;
  margin-right: 10px;
}

.status-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.config-section {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.input-group {
  margin-bottom: 15px;
}

.label {
  font-size: 14px;
  color: #555;
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0 12px;
  font-size: 14px;
  box-sizing: border-box;
}

.button-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.test-button {
  flex: 1;
  height: 50px;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.test-button:disabled {
  background: #ccc;
}

.clear-button {
  height: 50px;
  padding: 0 20px;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-size: 16px;
  font-weight: 500;
}

.results-section {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.results-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  border-left: 4px solid #ddd;
}

.result-item.success {
  background: #f8fff9;
  border-left-color: #28a745;
}

.result-item.warning {
  background: #fffdf8;
  border-left-color: #ffc107;
}

.result-item.error {
  background: #fff8f8;
  border-left-color: #dc3545;
}

.result-icon {
  font-size: 18px;
  margin-right: 12px;
  margin-top: 2px;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.result-message {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.result-time {
  font-size: 12px;
  color: #999;
}

.help-section {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.help-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.help-item {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 8px;
  line-height: 1.5;
}
</style>
