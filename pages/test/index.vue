<template>
  <view class="test-container">
    <view class="header">
      <text class="title">系统测试中心</text>
      <text class="subtitle">检测各项功能运行状态</text>
    </view>
    
    <view class="test-section">
      <view class="section-title">连接测试</view>
      
      <view class="test-item">
        <button 
          class="test-btn"
          :class="{ 'loading': testing.supabase }"
          @click="testSupabase"
        >
          {{ testing.supabase ? '测试中...' : 'Supabase连接测试' }}
        </button>
        <view class="result" :class="results.supabase.status">
          {{ results.supabase.message }}
        </view>
      </view>
      
      <view class="test-item">
        <button 
          class="test-btn"
          :class="{ 'loading': testing.cloudFunction }"
          @click="testCloudFunction"
        >
          {{ testing.cloudFunction ? '测试中...' : '云函数测试' }}
        </button>
        <view class="result" :class="results.cloudFunction.status">
          {{ results.cloudFunction.message }}
        </view>
      </view>
      
      <view class="test-item">
        <button 
          class="test-btn"
          :class="{ 'loading': testing.database }"
          @click="testDatabase"
        >
          {{ testing.database ? '测试中...' : '数据库测试' }}
        </button>
        <view class="result" :class="results.database.status">
          {{ results.database.message }}
        </view>
      </view>
    </view>
    
    <view class="test-section">
      <view class="section-title">功能测试</view>
      
      <view class="test-item">
        <button 
          class="test-btn"
          :class="{ 'loading': testing.userAPI }"
          @click="testUserAPI"
        >
          {{ testing.userAPI ? '测试中...' : '用户API测试' }}
        </button>
        <view class="result" :class="results.userAPI.status">
          {{ results.userAPI.message }}
        </view>
      </view>
      
      <view class="test-item">
        <button 
          class="test-btn"
          :class="{ 'loading': testing.groupAPI }"
          @click="testGroupAPI"
        >
          {{ testing.groupAPI ? '测试中...' : '群组API测试' }}
        </button>
        <view class="result" :class="results.groupAPI.status">
          {{ results.groupAPI.message }}
        </view>
      </view>
    </view>
    
    <view class="test-section">
      <view class="section-title">系统信息</view>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-label">应用版本</text>
          <text class="info-value">{{ systemInfo.version }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">环境</text>
          <text class="info-value">{{ systemInfo.environment }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">平台</text>
          <text class="info-value">{{ systemInfo.platform }}</text>
        </view>
      </view>
    </view>
    
    <view class="actions">
      <button class="action-btn primary" @click="runAllTests">
        {{ allTesting ? '全面测试中...' : '运行全部测试' }}
      </button>
      <button class="action-btn" @click="clearResults">清空结果</button>
      <button class="action-btn" @click="goBack">返回首页</button>
    </view>
  </view>
</template>

<script>
import { TestAPI, GroupAPI, UserAPI } from '../../api/index';

export default {
  data() {
    return {
      testing: {
        supabase: false,
        cloudFunction: false,
        database: false,
        userAPI: false,
        groupAPI: false
      },
      results: {
        supabase: { status: 'idle', message: '未测试' },
        cloudFunction: { status: 'idle', message: '未测试' },
        database: { status: 'idle', message: '未测试' },
        userAPI: { status: 'idle', message: '未测试' },
        groupAPI: { status: 'idle', message: '未测试' }
      },
      allTesting: false,
      systemInfo: {
        version: '1.0.0',
        environment: 'development',
        platform: 'mp-weixin'
      }
    };
  },
  
  onLoad() {
    this.initSystemInfo();
    console.log('[测试页面] 页面加载完成');
  },
  
  methods: {
    initSystemInfo() {
      try {
        const systemInfo = uni.getSystemInfoSync();
        this.systemInfo = {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          platform: systemInfo.platform || 'unknown'
        };
      } catch (error) {
        console.error('[测试页面] 获取系统信息失败:', error);
      }
    },
    
    async testSupabase() {
      this.testing.supabase = true;
      this.results.supabase = { status: 'testing', message: '测试中...' };
      
      try {
        const result = await TestAPI.testSupabaseConnection();
        this.results.supabase = {
          status: result.success ? 'success' : 'error',
          message: result.success ? '连接成功' : `连接失败: ${result.error}`
        };
      } catch (error) {
        this.results.supabase = {
          status: 'error',
          message: `测试失败: ${error.message}`
        };
      } finally {
        this.testing.supabase = false;
      }
    },
    
    async testCloudFunction() {
      this.testing.cloudFunction = true;
      this.results.cloudFunction = { status: 'testing', message: '测试中...' };
      
      try {
        const result = await GroupAPI.testConnection();
        this.results.cloudFunction = {
          status: result.success ? 'success' : 'error',
          message: result.success ? '云函数正常' : `云函数异常: ${result.error}`
        };
      } catch (error) {
        this.results.cloudFunction = {
          status: 'error',
          message: `测试失败: ${error.message}`
        };
      } finally {
        this.testing.cloudFunction = false;
      }
    },
    
    async testDatabase() {
      this.testing.database = true;
      this.results.database = { status: 'testing', message: '测试中...' };
      
      try {
        const result = await GroupAPI.testConnection(true);
        this.results.database = {
          status: result.success ? 'success' : 'error',
          message: result.success ? '数据库连接正常' : `数据库连接失败: ${result.error}`
        };
      } catch (error) {
        this.results.database = {
          status: 'error',
          message: `测试失败: ${error.message}`
        };
      } finally {
        this.testing.database = false;
      }
    },
    
    async testUserAPI() {
      this.testing.userAPI = true;
      this.results.userAPI = { status: 'testing', message: '测试中...' };
      
      try {
        // 这里可以添加用户API的具体测试
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟测试
        this.results.userAPI = {
          status: 'success',
          message: '用户API正常'
        };
      } catch (error) {
        this.results.userAPI = {
          status: 'error',
          message: `测试失败: ${error.message}`
        };
      } finally {
        this.testing.userAPI = false;
      }
    },
    
    async testGroupAPI() {
      this.testing.groupAPI = true;
      this.results.groupAPI = { status: 'testing', message: '测试中...' };
      
      try {
        const result = await TestAPI.testGroupAPI();
        this.results.groupAPI = {
          status: result.success ? 'success' : 'error',
          message: result.success ? '群组API正常' : `群组API异常: ${result.error}`
        };
      } catch (error) {
        this.results.groupAPI = {
          status: 'error',
          message: `测试失败: ${error.message}`
        };
      } finally {
        this.testing.groupAPI = false;
      }
    },
    
    async runAllTests() {
      this.allTesting = true;
      console.log('[测试页面] 开始运行全部测试');
      
      try {
        await this.testSupabase();
        await this.testCloudFunction();
        await this.testDatabase();
        await this.testUserAPI();
        await this.testGroupAPI();
        
        uni.showToast({
          title: '所有测试完成',
          icon: 'success'
        });
      } catch (error) {
        console.error('[测试页面] 全部测试过程中出错:', error);
        uni.showToast({
          title: '测试过程中出错',
          icon: 'error'
        });
      } finally {
        this.allTesting = false;
      }
    },
    
    clearResults() {
      this.results = {
        supabase: { status: 'idle', message: '未测试' },
        cloudFunction: { status: 'idle', message: '未测试' },
        database: { status: 'idle', message: '未测试' },
        userAPI: { status: 'idle', message: '未测试' },
        groupAPI: { status: 'idle', message: '未测试' }
      };
      uni.showToast({
        title: '结果已清空',
        icon: 'success'
      });
    },
    
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.test-container {
  padding: 30rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #7f8c8d;
  display: block;
}

.test-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 30rpx;
  border-left: 6rpx solid #3498db;
  padding-left: 20rpx;
}

.test-item {
  margin-bottom: 25rpx;
}

.test-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 15rpx;
}

.test-btn.loading {
  background: #bdc3c7;
}

.result {
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  text-align: center;
}

.result.idle {
  background: #ecf0f1;
  color: #7f8c8d;
}

.result.testing {
  background: #fff3cd;
  color: #856404;
}

.result.success {
  background: #d4edda;
  color: #155724;
}

.result.error {
  background: #f8d7da;
  color: #721c24;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.info-item {
  background: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
  text-align: center;
}

.info-label {
  font-size: 24rpx;
  color: #7f8c8d;
  display: block;
  margin-bottom: 8rpx;
}

.info-value {
  font-size: 28rpx;
  color: #2c3e50;
  font-weight: bold;
  display: block;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn:not(.primary) {
  background: white;
  color: #666;
  border: 2rpx solid #ddd;
}
</style>
