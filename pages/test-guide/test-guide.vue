<template>
  <view class="test-guide-container">
    <!-- 标题区域 -->
    <view class="header-section">
      <text class="main-title">🧪 打卡功能测试指南</text>
      <text class="subtitle">欢迎体验学习打卡功能</text>
    </view>

    <!-- 测试步骤 -->
    <view class="steps-section">
      <text class="section-title">📋 测试步骤</text>
      
      <view class="step-item">
        <view class="step-number">1</view>
        <view class="step-content">
          <text class="step-title">检查登录状态</text>
          <text class="step-desc">确保已登录或使用测试账号</text>
          <button class="step-btn" @tap="checkLoginStatus">检查状态</button>
        </view>
      </view>

      <view class="step-item">
        <view class="step-number">2</view>
        <view class="step-content">
          <text class="step-title">进入打卡页面</text>
          <text class="step-desc">点击下方按钮进入打卡功能</text>
          <button class="step-btn primary" @tap="goToCheckin">开始测试打卡</button>
        </view>
      </view>

      <view class="step-item">
        <view class="step-number">3</view>
        <view class="step-content">
          <text class="step-title">测试打卡流程</text>
          <text class="step-desc">填写学习内容、选择心情、添加标签</text>
        </view>
      </view>

      <view class="step-item">
        <view class="step-number">4</view>
        <view class="step-content">
          <text class="step-title">查看打卡记录</text>
          <text class="step-desc">确认新记录显示在最前面，有"新"标识</text>
        </view>
      </view>
    </view>

    <!-- 功能测试区域 -->
    <view class="test-section">
      <text class="section-title">🔧 功能测试</text>
      
      <view class="test-grid">
        <view class="test-item" @tap="goToCheckin">
          <text class="test-icon">📝</text>
          <text class="test-label">打卡页面</text>
          <text class="test-desc">主要功能测试</text>
        </view>

        <view class="test-item" @tap="goToCheckinSimple">
          <text class="test-icon">⚡</text>
          <text class="test-label">简化版测试</text>
          <text class="test-desc">调试专用</text>
        </view>

        <view class="test-item" @tap="resetCheckinData">
          <text class="test-icon">🔄</text>
          <text class="test-label">重置数据</text>
          <text class="test-desc">清除测试记录</text>
        </view>

        <view class="test-item" @tap="viewLogs">
          <text class="test-icon">📊</text>
          <text class="test-label">查看日志</text>
          <text class="test-desc">调试信息</text>
        </view>
      </view>
    </view>

    <!-- 测试账号信息 -->
    <view class="account-section">
      <text class="section-title">👤 测试账号</text>
      
      <view class="account-card">
        <text class="account-title">当前状态</text>
        <text class="account-status" :class="{ 'logged-in': isLoggedIn }">
          {{ isLoggedIn ? '✅ 已登录' : '❌ 未登录' }}
        </text>
        
        <view class="account-actions" v-if="!isLoggedIn">
          <button class="account-btn" @tap="setTestAccount">设置测试账号</button>
          <button class="account-btn secondary" @tap="goToLogin">正常登录</button>
        </view>

        <view class="account-info" v-if="isLoggedIn">
          <text class="info-item">用户: {{ userInfo.nickname || '测试用户' }}</text>
          <text class="info-item">Token: {{ hasToken ? '有效' : '无效' }}</text>
          <button class="account-btn danger" @tap="logout">退出登录</button>
        </view>
      </view>
    </view>

    <!-- 预期结果 -->
    <view class="result-section">
      <text class="section-title">✅ 预期结果</text>
      
      <view class="result-list">
        <view class="result-item">
          <text class="result-icon">✓</text>
          <text class="result-text">按钮可以点击，弹窗正常显示</text>
        </view>
        <view class="result-item">
          <text class="result-icon">✓</text>
          <text class="result-text">可以输入学习内容，选择心情标签</text>
        </view>
        <view class="result-item">
          <text class="result-icon">✓</text>
          <text class="result-text">提交成功后显示在打卡历程最前面</text>
        </view>
        <view class="result-item">
          <text class="result-icon">✓</text>
          <text class="result-text">用户记录有特殊样式和"新"标识</text>
        </view>
        <view class="result-item">
          <text class="result-icon">✓</text>
          <text class="result-text">连续天数正确增加</text>
        </view>
      </view>
    </view>

    <!-- 联系信息 -->
    <view class="contact-section">
      <text class="section-title">📞 反馈测试结果</text>
      <text class="contact-text">如果发现问题，请截图并记录具体操作步骤</text>
      
      <view class="contact-actions">
        <button class="contact-btn" @tap="copyTestInfo">复制测试信息</button>
        <button class="contact-btn secondary" @tap="goBack">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script>
import { StorageManager } from '../../utils/storage.js'

export default {
  name: 'TestGuide',
  data() {
    return {
      isLoggedIn: false,
      hasToken: false,
      userInfo: {}
    }
  },
  onLoad() {
    this.checkStatus()
  },
  onShow() {
    this.checkStatus()
  },
  methods: {
    checkStatus() {
      try {
        this.isLoggedIn = StorageManager.isLoggedIn()
        this.hasToken = !!StorageManager.getToken()
        this.userInfo = StorageManager.getUserInfo() || {}
        
        console.log('[测试指南] 状态检查:', {
          isLoggedIn: this.isLoggedIn,
          hasToken: this.hasToken,
          userInfo: this.userInfo
        })
      } catch (error) {
        console.error('[测试指南] 状态检查失败:', error)
      }
    },

    checkLoginStatus() {
      this.checkStatus()
      
      uni.showModal({
        title: '登录状态检查',
        content: `登录状态: ${this.isLoggedIn ? '已登录' : '未登录'}\nToken: ${this.hasToken ? '有效' : '无效'}`,
        showCancel: false
      })
    },

    goToCheckin() {
      uni.navigateTo({
        url: '/pages/checkin/checkin',
        success: () => {
          console.log('[测试指南] 跳转到打卡页面成功')
        },
        fail: (error) => {
          console.error('[测试指南] 跳转失败:', error)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },

    goToCheckinSimple() {
      uni.navigateTo({
        url: '/pages/checkin/checkin-simple',
        success: () => {
          console.log('[测试指南] 跳转到简化版打卡页面成功')
        },
        fail: (error) => {
          console.error('[测试指南] 跳转失败:', error)
          uni.showToast({
            title: '跳转失败，可能页面不存在',
            icon: 'none'
          })
        }
      })
    },

    setTestAccount() {
      try {
        // 设置测试账号信息
        const testUser = {
          id: 'test_user_001',
          nickname: '测试用户',
          avatar: '',
          email: 'test@example.com'
        }
        
        const testToken = 'test_token_' + Date.now()
        
        StorageManager.setUserInfo(testUser)
        StorageManager.setToken(testToken)
        
        this.checkStatus()
        
        uni.showToast({
          title: '测试账号设置成功',
          icon: 'success'
        })
        
        console.log('[测试指南] 测试账号设置完成')
      } catch (error) {
        console.error('[测试指南] 设置测试账号失败:', error)
        uni.showToast({
          title: '设置失败',
          icon: 'none'
        })
      }
    },

    goToLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    },

    logout() {
      try {
        StorageManager.clearUserInfo()
        StorageManager.clearToken()
        this.checkStatus()
        
        uni.showToast({
          title: '已退出登录',
          icon: 'success'
        })
      } catch (error) {
        console.error('[测试指南] 退出登录失败:', error)
      }
    },

    resetCheckinData() {
      uni.showModal({
        title: '重置确认',
        content: '确定要清除所有打卡测试数据吗？',
        success: (res) => {
          if (res.confirm) {
            try {
              uni.removeStorageSync('lastCheckinDate')
              uni.removeStorageSync('checkinStreak')
              uni.removeStorageSync('checkinHistory')
              
              uni.showToast({
                title: '数据已重置',
                icon: 'success'
              })
              
              console.log('[测试指南] 打卡数据已重置')
            } catch (error) {
              console.error('[测试指南] 重置数据失败:', error)
              uni.showToast({
                title: '重置失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    viewLogs() {
      // 显示最近的console日志（模拟）
      const logs = [
        '[打卡页] 初始化完成',
        '[打卡页] 用户已登录',
        '[打卡页] 弹窗已显示',
        '[打卡页] 新打卡记录已添加'
      ]
      
      uni.showModal({
        title: '最近日志',
        content: logs.join('\n'),
        showCancel: false
      })
    },

    copyTestInfo() {
      const testInfo = `
学习打卡功能测试信息：
- 版本: v1.0
- 测试时间: ${new Date().toLocaleString()}
- 登录状态: ${this.isLoggedIn ? '已登录' : '未登录'}
- Token状态: ${this.hasToken ? '有效' : '无效'}
- 用户信息: ${JSON.stringify(this.userInfo)}

测试步骤：
1. 检查登录状态 ✓
2. 进入打卡页面 
3. 填写并提交打卡
4. 查看记录显示

如有问题请截图反馈。
      `.trim()
      
      uni.setClipboardData({
        data: testInfo,
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },

    goBack() {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test-guide-container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 32rpx;
}

.header-section {
  text-align: center;
  margin-bottom: 48rpx;
  
  .main-title {
    font-size: 48rpx;
    font-weight: bold;
    color: #1f2937;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #6b7280;
  }
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 32rpx;
}

.steps-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .step-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 32rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .step-number {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 28rpx;
      margin-right: 24rpx;
      flex-shrink: 0;
    }
    
    .step-content {
      flex: 1;
      
      .step-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #1f2937;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .step-desc {
        font-size: 28rpx;
        color: #6b7280;
        display: block;
        margin-bottom: 16rpx;
      }
      
      .step-btn {
        background: #e5e7eb;
        color: #374151;
        border: none;
        padding: 16rpx 32rpx;
        border-radius: 8rpx;
        font-size: 28rpx;
        
        &.primary {
          background: #667eea;
          color: white;
        }
      }
    }
  }
}

.test-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .test-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .test-item {
      padding: 24rpx;
      border: 2rpx solid #e5e7eb;
      border-radius: 12rpx;
      text-align: center;
      transition: all 0.3s ease;
      
      &:active {
        background: #f3f4f6;
        transform: scale(0.98);
      }
      
      .test-icon {
        font-size: 48rpx;
        display: block;
        margin-bottom: 12rpx;
      }
      
      .test-label {
        font-size: 28rpx;
        font-weight: 600;
        color: #1f2937;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .test-desc {
        font-size: 24rpx;
        color: #6b7280;
      }
    }
  }
}

.account-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .account-card {
    .account-title {
      font-size: 28rpx;
      color: #374151;
      display: block;
      margin-bottom: 16rpx;
    }
    
    .account-status {
      font-size: 32rpx;
      font-weight: bold;
      color: #ef4444;
      display: block;
      margin-bottom: 24rpx;
      
      &.logged-in {
        color: #10b981;
      }
    }
    
    .account-actions, .account-info {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
    }
    
    .account-btn {
      padding: 20rpx;
      border-radius: 8rpx;
      border: none;
      font-size: 28rpx;
      background: #667eea;
      color: white;
      
      &.secondary {
        background: #6b7280;
      }
      
      &.danger {
        background: #ef4444;
      }
    }
    
    .info-item {
      font-size: 28rpx;
      color: #374151;
      padding: 8rpx 0;
      border-bottom: 1rpx solid #f3f4f6;
    }
  }
}

.result-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .result-list {
    .result-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      .result-icon {
        width: 32rpx;
        height: 32rpx;
        border-radius: 50%;
        background: #10b981;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
        margin-right: 16rpx;
      }
      
      .result-text {
        font-size: 28rpx;
        color: #374151;
      }
    }
  }
}

.contact-section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  
  .contact-text {
    font-size: 28rpx;
    color: #6b7280;
    display: block;
    margin-bottom: 24rpx;
    line-height: 1.6;
  }
  
  .contact-actions {
    display: flex;
    gap: 16rpx;
    
    .contact-btn {
      flex: 1;
      padding: 20rpx;
      border-radius: 8rpx;
      border: none;
      font-size: 28rpx;
      background: #667eea;
      color: white;
      
      &.secondary {
        background: #6b7280;
      }
    }
  }
}
</style>
