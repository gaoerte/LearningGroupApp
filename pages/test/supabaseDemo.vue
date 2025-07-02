<template>
  <view class="demo-page">
    <view class="header">
      <text class="title">🔗 Supabase 连接演示</text>
      <text class="subtitle">前端 → 云函数 → Supabase 完整流程</text>
    </view>

    <!-- 连接状态 -->
    <view class="status-section">
      <view class="status-card" :class="connectionStatus.class">
        <text class="status-icon">{{ connectionStatus.icon }}</text>
        <text class="status-text">{{ connectionStatus.text }}</text>
        <text class="status-method" v-if="connectionStatus.method">
          连接方式: {{ connectionStatus.method }}
        </text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <button class="action-btn primary" @click="testConnection" :disabled="loading">
        {{ loading ? '连接中...' : '🔌 测试连接' }}
      </button>
      
      <button class="action-btn secondary" @click="createTestUser" :disabled="!connected || loading">
        👤 创建测试用户
      </button>
      
      <button class="action-btn secondary" @click="testCheckin" :disabled="!connected || loading">
        ✅ 测试打卡
      </button>
      
      <button class="action-btn secondary" @click="getTestData" :disabled="!connected || loading">
        📊 获取数据
      </button>
    </view>

    <!-- 结果显示 -->
    <view class="results" v-if="results.length > 0">
      <text class="results-title">📋 操作结果</text>
      <view 
        class="result-item"
        v-for="(result, index) in results"
        :key="index"
        :class="result.status"
      >
        <text class="result-icon">{{ result.icon }}</text>
        <view class="result-content">
          <text class="result-title">{{ result.title }}</text>
          <text class="result-message">{{ result.message }}</text>
          <text class="result-time">{{ result.time }}</text>
          <view class="result-data" v-if="result.data">
            <text class="data-label">返回数据:</text>
            <text class="data-content">{{ JSON.stringify(result.data, null, 2) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import supabaseConnection from '@/api/supabaseConnection.js';

export default {
  name: 'SupabaseDemo',
  data() {
    return {
      loading: false,
      connected: false,
      connectionStatus: {
        class: 'waiting',
        icon: '⏳',
        text: '等待连接测试',
        method: ''
      },
      results: [],
      testUserId: null
    };
  },

  onLoad() {
    console.log('[演示页面] 页面加载');
  },

  methods: {
    /**
     * 测试连接
     */
    async testConnection() {
      this.loading = true;
      this.updateStatus('testing', '🔄', '正在测试连接...');
      
      try {
        console.log('[演示] 开始连接测试');
        const result = await supabaseConnection.testConnection();
        
        if (result.success) {
          this.connected = true;
          this.updateStatus('connected', '✅', '连接成功', result.method);
          this.addResult('连接测试', 'success', '✅', '成功建立连接', result);
          
          uni.showToast({
            title: '连接成功',
            icon: 'success'
          });
        } else {
          this.connected = false;
          this.updateStatus('error', '❌', '连接失败');
          this.addResult('连接测试', 'error', '❌', result.error || '连接失败');
          
          uni.showToast({
            title: '连接失败',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('[演示] 连接测试失败:', error);
        this.connected = false;
        this.updateStatus('error', '❌', '连接异常');
        this.addResult('连接测试', 'error', '❌', error.message);
        
        uni.showToast({
          title: '连接异常',
          icon: 'error'
        });
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建测试用户
     */
    async createTestUser() {
      this.loading = true;
      
      try {
        const userData = {
          id: 'test_user_' + Date.now(),
          email: 'test@example.com',
          nickname: '测试用户',
          avatar_url: '',
          preferences: {
            study_reminder: true,
            group_notifications: true
          }
        };
        
        console.log('[演示] 创建测试用户:', userData);
        const result = await supabaseConnection.createUser(userData);
        
        if (result.success) {
          this.testUserId = userData.id;
          this.addResult('创建用户', 'success', '✅', '用户创建成功', result.data);
          
          uni.showToast({
            title: '用户创建成功',
            icon: 'success'
          });
        } else {
          this.addResult('创建用户', 'error', '❌', result.error || '用户创建失败');
        }
      } catch (error) {
        console.error('[演示] 创建用户失败:', error);
        this.addResult('创建用户', 'error', '❌', error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 测试打卡
     */
    async testCheckin() {
      if (!this.testUserId) {
        uni.showToast({
          title: '请先创建测试用户',
          icon: 'none'
        });
        return;
      }

      this.loading = true;
      
      try {
        const checkinData = {
          user_id: this.testUserId,
          study_duration: 30,
          study_content: '学习 Supabase 数据库操作',
          tags: ['数据库', '后端开发'],
          mood_score: 8,
          notes: '今天学会了云函数的部署和使用'
        };
        
        console.log('[演示] 提交打卡:', checkinData);
        const result = await supabaseConnection.checkin(checkinData);
        
        if (result.success) {
          this.addResult('学习打卡', 'success', '✅', '打卡成功', result.data);
          
          uni.showToast({
            title: '打卡成功',
            icon: 'success'
          });
        } else {
          this.addResult('学习打卡', 'error', '❌', result.error || '打卡失败');
        }
      } catch (error) {
        console.error('[演示] 打卡失败:', error);
        this.addResult('学习打卡', 'error', '❌', error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 获取测试数据
     */
    async getTestData() {
      if (!this.testUserId) {
        uni.showToast({
          title: '请先创建测试用户',
          icon: 'none'
        });
        return;
      }

      this.loading = true;
      
      try {
        console.log('[演示] 获取用户数据:', this.testUserId);
        
        // 获取用户信息
        const userResult = await supabaseConnection.getUserData(this.testUserId);
        if (userResult.success) {
          this.addResult('获取用户', 'success', '✅', '用户数据获取成功', userResult.data);
        }
        
        // 获取打卡记录
        const checkinResult = await supabaseConnection.getCheckinHistory(this.testUserId, 5);
        if (checkinResult.success) {
          this.addResult('打卡记录', 'success', '✅', '打卡记录获取成功', checkinResult.data);
        }
        
        // 获取群组信息
        const groupResult = await supabaseConnection.getGroups(this.testUserId);
        if (groupResult.success) {
          this.addResult('用户群组', 'success', '✅', '群组信息获取成功', groupResult.data);
        }
        
        uni.showToast({
          title: '数据获取完成',
          icon: 'success'
        });
        
      } catch (error) {
        console.error('[演示] 获取数据失败:', error);
        this.addResult('获取数据', 'error', '❌', error.message);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新连接状态
     */
    updateStatus(status, icon, text, method = '') {
      this.connectionStatus = {
        class: status,
        icon,
        text,
        method
      };
    },

    /**
     * 添加结果记录
     */
    addResult(title, status, icon, message, data = null) {
      this.results.unshift({
        title,
        status,
        icon,
        message,
        data,
        time: new Date().toLocaleTimeString()
      });
      
      // 限制结果数量
      if (this.results.length > 10) {
        this.results = this.results.slice(0, 10);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.demo-page {
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.status-section {
  margin-bottom: 40rpx;
}

.status-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  text-align: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  &.waiting {
    border-left: 8rpx solid #74b9ff;
  }
  
  &.testing {
    border-left: 8rpx solid #fdcb6e;
  }
  
  &.connected {
    border-left: 8rpx solid #00b894;
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
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #2d3436;
    margin-bottom: 8rpx;
  }
  
  .status-method {
    display: block;
    font-size: 24rpx;
    color: #636e72;
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
  
  .action-btn {
    height: 100rpx;
    border-radius: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    border: none;
    
    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
    }
    
    &.secondary {
      background: white;
      color: #667eea;
      border: 2rpx solid #667eea;
    }
    
    &:disabled {
      opacity: 0.5;
      box-shadow: none;
    }
    
    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
}

.results {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
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
      
      .result-title {
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
        margin-bottom: 4rpx;
      }
      
      .result-time {
        display: block;
        font-size: 20rpx;
        color: #b2bec3;
        margin-bottom: 8rpx;
      }
      
      .result-data {
        background: #f8f9fa;
        border-radius: 8rpx;
        padding: 16rpx;
        margin-top: 8rpx;
        
        .data-label {
          display: block;
          font-size: 20rpx;
          color: #636e72;
          margin-bottom: 8rpx;
        }
        
        .data-content {
          display: block;
          font-size: 20rpx;
          color: #2d3436;
          font-family: monospace;
          word-break: break-all;
          white-space: pre-wrap;
        }
      }
    }
  }
}
</style>
