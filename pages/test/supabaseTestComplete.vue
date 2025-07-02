<template>
  <scroll-view class="test-container" scroll-y>
    <view class="test-page">
      <!-- 页面标题 -->
      <view class="header">
        <text class="title">🧪 Supabase 完整测试</text>
        <text class="subtitle">全方位测试数据库连接、CRUD操作、RLS策略</text>
      </view>

      <!-- 测试状态概览 -->
      <view class="status-overview">
        <view class="status-card">
          <text class="status-label">连接状态</text>
          <text class="status-value" :class="connectionStatus.class">
            {{ connectionStatus.text }}
          </text>
        </view>
        
        <view class="status-card">
          <text class="status-label">测试进度</text>
          <text class="status-value info">
            {{ testProgress.current }}/{{ testProgress.total }}
          </text>
        </view>
        
        <view class="status-card">
          <text class="status-label">通过率</text>
          <text class="status-value" :class="passRateClass">
            {{ testStats.passRate }}%
          </text>
        </view>
      </view>

      <!-- 快速测试按钮 -->
      <view class="quick-test-section">
        <text class="section-title">🚀 快速测试</text>
        <view class="test-buttons">
          <button 
            class="test-btn primary"
            @click="runQuickTest"
            :disabled="testing"
          >
            {{ testing ? '测试中...' : '运行快速测试' }}
          </button>
          
          <button 
            class="test-btn success"
            @click="runFullTest"
            :disabled="testing"
          >
            运行完整测试
          </button>
        </view>
      </view>

      <!-- 单项测试按钮 -->
      <view class="individual-test-section">
        <text class="section-title">🔧 单项测试</text>
        <view class="test-buttons">
          <button 
            class="test-btn secondary"
            @click="testConnection"
            :disabled="testing"
          >
            连接测试
          </button>
          
          <button 
            class="test-btn secondary"
            @click="testTableSchema"
            :disabled="testing"
          >
            表结构测试
          </button>
          
          <button 
            class="test-btn secondary"
            @click="testUserOperations"
            :disabled="testing"
          >
            用户操作测试
          </button>
          
          <button 
            class="test-btn secondary"
            @click="testGroupOperations"
            :disabled="testing"
          >
            群组操作测试
          </button>
        </view>
      </view>

      <!-- 数据管理 -->
      <view class="data-management-section">
        <text class="section-title">🗂️ 数据管理</text>
        <view class="test-buttons">
          <button 
            class="test-btn warning"
            @click="cleanupTestData"
            :disabled="testing"
          >
            清理测试数据
          </button>
          
          <button 
            class="test-btn info"
            @click="exportTestResults"
          >
            导出测试结果
          </button>
        </view>
      </view>

      <!-- 测试结果展示 -->
      <view class="results-section" v-if="testResults.length > 0">
        <text class="section-title">📊 测试结果</text>
        
        <!-- 测试统计 -->
        <view class="test-stats">
          <view class="stat-item">
            <text class="stat-label">总测试数</text>
            <text class="stat-value">{{ testStats.total }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">成功</text>
            <text class="stat-value success">{{ testStats.passed }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">失败</text>
            <text class="stat-value error">{{ testStats.failed }}</text>
          </view>
        </view>

        <!-- 测试结果列表 -->
        <view class="test-results">
          <view 
            class="test-result-item"
            v-for="(result, index) in testResults"
            :key="index"
            :class="result.success ? 'success' : 'error'"
          >
            <view class="result-header">
              <text class="result-icon">{{ result.success ? '✅' : '❌' }}</text>
              <text class="result-name">{{ result.testName }}</text>
              <text class="result-time">{{ formatTime(result.timestamp) }}</text>
            </view>
            <text class="result-message">{{ result.message }}</text>
            <view 
              class="result-details" 
              v-if="result.details && showDetails[index]"
            >
              <text class="details-content">{{ JSON.stringify(result.details, null, 2) }}</text>
            </view>
            <button 
              class="details-btn" 
              @click="toggleDetails(index)"
              v-if="result.details"
            >
              {{ showDetails[index] ? '隐藏详情' : '显示详情' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 测试配置 -->
      <view class="config-section">
        <text class="section-title">⚙️ 测试配置</text>
        <view class="config-item">
          <text class="config-label">Supabase URL:</text>
          <input 
            class="config-input"
            v-model="supabaseConfig.url"
            placeholder="https://your-project.supabase.co"
          />
        </view>
        <view class="config-item">
          <text class="config-label">Anonymous Key:</text>
          <input 
            class="config-input"
            v-model="supabaseConfig.anonKey"
            placeholder="your-anon-key"
            type="password"
          />
        </view>
        <button 
          class="test-btn info"
          @click="saveConfig"
        >
          保存配置
        </button>
      </view>

      <!-- 帮助信息 -->
      <view class="help-section">
        <text class="section-title">💡 使用说明</text>
        <view class="help-content">
          <text class="help-text">1. 首先配置 Supabase URL 和 Anonymous Key</text>
          <text class="help-text">2. 运行"快速测试"检查基础连接</text>
          <text class="help-text">3. 运行"完整测试"进行全面的功能测试</text>
          <text class="help-text">4. 查看测试结果，分析可能的问题</text>
          <text class="help-text">5. 使用"清理测试数据"清除测试产生的数据</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script>
import supabaseTester from '@/utils/supabase-tester.js';

export default {
  data() {
    return {
      testing: false,
      testResults: [],
      showDetails: {},
      connectionStatus: {
        text: '未连接',
        class: 'warning'
      },
      testProgress: {
        current: 0,
        total: 0
      },
      testStats: {
        total: 0,
        passed: 0,
        failed: 0,
        passRate: 0
      },
      supabaseConfig: {
        url: '',
        anonKey: ''
      }
    };
  },

  computed: {
    passRateClass() {
      const rate = this.testStats.passRate;
      if (rate >= 90) return 'success';
      if (rate >= 70) return 'warning';
      return 'error';
    }
  },

  onLoad() {
    this.loadConfig();
    this.updateTestResults();
  },

  methods: {
    /**
     * 加载配置
     */
    loadConfig() {
      try {
        const config = uni.getStorageSync('supabase_test_config');
        if (config) {
          this.supabaseConfig = { ...this.supabaseConfig, ...config };
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
        uni.setStorageSync('supabase_test_config', this.supabaseConfig);
        uni.showToast({
          title: '配置已保存',
          icon: 'success'
        });
      } catch (error) {
        console.error('保存配置失败:', error);
        uni.showToast({
          title: '保存失败',
          icon: 'error'
        });
      }
    },

    /**
     * 更新测试结果
     */
    updateTestResults() {
      this.testResults = supabaseTester.getTestResults();
      this.testStats = supabaseTester.getTestStats();
      this.updateConnectionStatus();
    },

    /**
     * 更新连接状态
     */
    updateConnectionStatus() {
      const hasConnectionTest = this.testResults.find(r => 
        r.testName.includes('连接') || r.testName.includes('代理')
      );
      
      if (hasConnectionTest) {
        if (hasConnectionTest.success) {
          this.connectionStatus = {
            text: '已连接',
            class: 'success'
          };
        } else {
          this.connectionStatus = {
            text: '连接失败',
            class: 'error'
          };
        }
      } else {
        this.connectionStatus = {
          text: '未测试',
          class: 'warning'
        };
      }
    },

    /**
     * 运行快速测试
     */
    async runQuickTest() {
      if (this.testing) return;
      
      this.testing = true;
      this.testProgress = { current: 0, total: 3 };
      
      try {
        uni.showLoading({ title: '快速测试中...' });
        
        // 1. 测试云函数连接
        this.testProgress.current = 1;
        await supabaseTester.testCloudFunctionConnection();
        this.updateTestResults();
        
        // 2. 测试 Supabase 代理
        this.testProgress.current = 2;
        await supabaseTester.testSupabaseProxyConnection();
        this.updateTestResults();
        
        // 3. 测试数据库表结构
        this.testProgress.current = 3;
        await supabaseTester.testDatabaseSchema();
        this.updateTestResults();
        
        uni.hideLoading();
        uni.showToast({
          title: '快速测试完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('快速测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
        this.testProgress = { current: 0, total: 0 };
      }
    },

    /**
     * 运行完整测试
     */
    async runFullTest() {
      if (this.testing) return;
      
      this.testing = true;
      
      try {
        uni.showLoading({ title: '完整测试中...' });
        
        await supabaseTester.runFullTestSuite();
        this.updateTestResults();
        
        uni.hideLoading();
        
        const stats = this.testStats;
        uni.showModal({
          title: '测试完成',
          content: `总计 ${stats.total} 项测试，成功 ${stats.passed} 项，失败 ${stats.failed} 项，通过率 ${stats.passRate}%`,
          showCancel: false
        });
        
      } catch (error) {
        console.error('完整测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 测试连接
     */
    async testConnection() {
      if (this.testing) return;
      
      this.testing = true;
      
      try {
        uni.showLoading({ title: '测试连接中...' });
        
        await supabaseTester.testCloudFunctionConnection();
        await supabaseTester.testSupabaseProxyConnection();
        
        this.updateTestResults();
        
        uni.hideLoading();
        uni.showToast({
          title: '连接测试完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('连接测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '连接测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 测试表结构
     */
    async testTableSchema() {
      if (this.testing) return;
      
      this.testing = true;
      
      try {
        uni.showLoading({ title: '测试表结构中...' });
        
        await supabaseTester.testDatabaseSchema();
        this.updateTestResults();
        
        uni.hideLoading();
        uni.showToast({
          title: '表结构测试完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('表结构测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '表结构测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 测试用户操作
     */
    async testUserOperations() {
      if (this.testing) return;
      
      this.testing = true;
      
      try {
        uni.showLoading({ title: '测试用户操作中...' });
        
        await supabaseTester.testUserCRUD();
        this.updateTestResults();
        
        uni.hideLoading();
        uni.showToast({
          title: '用户操作测试完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('用户操作测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '用户操作测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 测试群组操作
     */
    async testGroupOperations() {
      if (this.testing) return;
      
      this.testing = true;
      
      try {
        uni.showLoading({ title: '测试群组操作中...' });
        
        // 先创建测试用户
        const userId = await supabaseTester.testUserCRUD();
        if (userId) {
          await supabaseTester.testGroupCRUD(userId);
        }
        
        this.updateTestResults();
        
        uni.hideLoading();
        uni.showToast({
          title: '群组操作测试完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('群组操作测试失败:', error);
        uni.hideLoading();
        uni.showToast({
          title: '群组操作测试失败',
          icon: 'error'
        });
      } finally {
        this.testing = false;
      }
    },

    /**
     * 清理测试数据
     */
    async cleanupTestData() {
      uni.showModal({
        title: '确认清理',
        content: '确定要清理所有测试数据吗？此操作不可撤销。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '清理中...' });
              
              const cleanupCount = await supabaseTester.cleanupTestData();
              this.updateTestResults();
              
              uni.hideLoading();
              uni.showToast({
                title: `清理了 ${cleanupCount} 条数据`,
                icon: 'success'
              });
              
            } catch (error) {
              console.error('清理数据失败:', error);
              uni.hideLoading();
              uni.showToast({
                title: '清理失败',
                icon: 'error'
              });
            }
          }
        }
      });
    },

    /**
     * 导出测试结果
     */
    exportTestResults() {
      try {
        const results = {
          timestamp: new Date().toISOString(),
          stats: this.testStats,
          results: this.testResults
        };
        
        const content = JSON.stringify(results, null, 2);
        
        // 复制到剪贴板
        uni.setClipboardData({
          data: content,
          success: () => {
            uni.showToast({
              title: '结果已复制到剪贴板',
              icon: 'success'
            });
          }
        });
        
      } catch (error) {
        console.error('导出结果失败:', error);
        uni.showToast({
          title: '导出失败',
          icon: 'error'
        });
      }
    },

    /**
     * 切换详情显示
     */
    toggleDetails(index) {
      this.$set(this.showDetails, index, !this.showDetails[index]);
    },

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
  }
};
</script>

<style lang="scss" scoped>
.test-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.test-page {
  padding: 20rpx;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  
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

.status-overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  
  .status-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.9);
    padding: 20rpx;
    border-radius: 16rpx;
    text-align: center;
    margin: 0 10rpx;
    
    .status-label {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
    }
    
    .status-value {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      
      &.success { color: #52c41a; }
      &.warning { color: #faad14; }
      &.error { color: #f5222d; }
      &.info { color: #1890ff; }
    }
  }
}

.quick-test-section,
.individual-test-section,
.data-management-section,
.config-section,
.help-section {
  margin-bottom: 40rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #ffffff;
    margin-bottom: 20rpx;
  }
}

.test-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  
  .test-btn {
    flex: 1;
    min-width: 200rpx;
    height: 80rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: bold;
    border: none;
    
    &.primary {
      background: #1890ff;
      color: #ffffff;
    }
    
    &.secondary {
      background: #52c41a;
      color: #ffffff;
    }
    
    &.success {
      background: #52c41a;
      color: #ffffff;
    }
    
    &.warning {
      background: #faad14;
      color: #ffffff;
    }
    
    &.info {
      background: #1890ff;
      color: #ffffff;
    }
    
    &:disabled {
      background: #d9d9d9 !important;
      color: #ffffff !important;
    }
  }
}

.results-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
  
  .section-title {
    color: #333;
    margin-bottom: 20rpx;
  }
}

.test-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30rpx;
  
  .stat-item {
    text-align: center;
    
    .stat-label {
      display: block;
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
    }
    
    .stat-value {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      
      &.success { color: #52c41a; }
      &.error { color: #f5222d; }
    }
  }
}

.test-results {
  .test-result-item {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-left: 8rpx solid #d9d9d9;
    
    &.success {
      border-left-color: #52c41a;
    }
    
    &.error {
      border-left-color: #f5222d;
    }
    
    .result-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .result-icon {
        font-size: 28rpx;
        margin-right: 12rpx;
      }
      
      .result-name {
        flex: 1;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
      
      .result-time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .result-message {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
      margin-bottom: 12rpx;
    }
    
    .result-details {
      background: #fff;
      border-radius: 8rpx;
      padding: 16rpx;
      margin: 12rpx 0;
      
      .details-content {
        font-size: 22rpx;
        color: #333;
        font-family: monospace;
        white-space: pre-wrap;
      }
    }
    
    .details-btn {
      background: #1890ff;
      color: #ffffff;
      border: none;
      border-radius: 6rpx;
      padding: 8rpx 16rpx;
      font-size: 24rpx;
    }
  }
}

.config-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 30rpx;
  
  .section-title {
    color: #333;
  }
  
  .config-item {
    margin-bottom: 20rpx;
    
    .config-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .config-input {
      width: 100%;
      height: 70rpx;
      border: 2rpx solid #d9d9d9;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      background: #ffffff;
    }
  }
}

.help-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  padding: 30rpx;
  
  .section-title {
    color: #333;
  }
  
  .help-content {
    .help-text {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 16rpx;
    }
  }
}
</style>
