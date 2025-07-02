<template>
  <view class="nav-test-container">
    <view class="header">
      <text class="title">页面跳转测试</text>
      <text class="subtitle">测试各种页面跳转场景</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">基础跳转测试</text>
      
      <button class="test-btn" @tap="testNavigateTo">
        测试 navigateTo (打卡页面)
      </button>
      
      <button class="test-btn" @tap="testSwitchTab">
        测试 switchTab (首页)
      </button>
      
      <button class="test-btn" @tap="testRedirectTo">
        测试 redirectTo (登录页)
      </button>
      
      <button class="test-btn" @tap="testReLaunch">
        测试 reLaunch (首页)
      </button>
      
      <button class="test-btn" @tap="testNavigateBack">
        测试 navigateBack
      </button>
    </view>
    
    <view class="test-section">
      <text class="section-title">存储状态测试</text>
      
      <button class="test-btn" @tap="setLoginToken">
        设置登录Token
      </button>
      
      <button class="test-btn" @tap="clearLoginToken">
        清除登录Token
      </button>
      
      <button class="test-btn" @tap="checkStorageStatus">
        检查存储状态
      </button>
    </view>
    
    <view class="test-section">
      <text class="section-title">通知系统测试</text>
      
      <button class="test-btn" @tap="testSuccessNotify">
        测试成功通知
      </button>
      
      <button class="test-btn" @tap="testErrorNotify">
        测试错误通知
      </button>
      
      <button class="test-btn" @tap="testWarningNotify">
        测试警告通知
      </button>
    </view>
    
    <view class="log-section">
      <text class="log-title">操作日志</text>
      <scroll-view class="log-content" scroll-y="true">
        <text class="log-item" v-for="(log, index) in logs" :key="index">
          {{ log }}
        </text>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { notify } from '@/utils/notification.js'

export default {
  name: 'NavigationTest',
  data() {
    return {
      logs: []
    }
  },
  methods: {
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      const logMessage = `[${timestamp}] ${message}`
      this.logs.unshift(logMessage)
      console.log(logMessage)
      
      // 限制日志数量
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(0, 50)
      }
    },
    
    testNavigateTo() {
      this.addLog('开始测试 navigateTo')
      uni.navigateTo({
        url: '/pages/checkin/checkin',
        success: () => {
          this.addLog('navigateTo 成功')
        },
        fail: (err) => {
          this.addLog(`navigateTo 失败: ${JSON.stringify(err)}`)
        }
      })
    },
    
    testSwitchTab() {
      this.addLog('开始测试 switchTab')
      uni.switchTab({
        url: '/pages/index/index',
        success: () => {
          this.addLog('switchTab 成功')
        },
        fail: (err) => {
          this.addLog(`switchTab 失败: ${JSON.stringify(err)}`)
        }
      })
    },
    
    testRedirectTo() {
      this.addLog('开始测试 redirectTo')
      uni.redirectTo({
        url: '/pages/login/login',
        success: () => {
          this.addLog('redirectTo 成功')
        },
        fail: (err) => {
          this.addLog(`redirectTo 失败: ${JSON.stringify(err)}`)
        }
      })
    },
    
    testReLaunch() {
      this.addLog('开始测试 reLaunch')
      uni.reLaunch({
        url: '/pages/index/index',
        success: () => {
          this.addLog('reLaunch 成功')
        },
        fail: (err) => {
          this.addLog(`reLaunch 失败: ${JSON.stringify(err)}`)
        }
      })
    },
    
    testNavigateBack() {
      this.addLog('开始测试 navigateBack')
      uni.navigateBack({
        delta: 1,
        success: () => {
          this.addLog('navigateBack 成功')
        },
        fail: (err) => {
          this.addLog(`navigateBack 失败: ${JSON.stringify(err)}`)
        }
      })
    },
    
    setLoginToken() {
      try {
        const token = 'test_token_' + Date.now()
        uni.setStorageSync('token', token)
        this.addLog(`设置登录Token成功: ${token}`)
        
        // 同时设置一些测试用的打卡数据
        uni.setStorageSync('lastCheckinDate', new Date().toDateString())
        uni.setStorageSync('checkinStreak', 5)
        this.addLog('设置测试打卡数据成功')
      } catch (error) {
        this.addLog(`设置登录Token失败: ${error.message}`)
      }
    },
    
    clearLoginToken() {
      try {
        uni.removeStorageSync('token')
        this.addLog('清除登录Token成功')
      } catch (error) {
        this.addLog(`清除登录Token失败: ${error.message}`)
      }
    },
    
    checkStorageStatus() {
      try {
        const token = uni.getStorageSync('token')
        const checkinDate = uni.getStorageSync('lastCheckinDate')
        const streak = uni.getStorageSync('checkinStreak')
        
        this.addLog(`存储状态检查: token=${token ? '存在' : '不存在'}, checkinDate=${checkinDate || '无'}, streak=${streak || 0}`)
      } catch (error) {
        this.addLog(`检查存储状态失败: ${error.message}`)
      }
    },
    
    testSuccessNotify() {
      try {
        notify.success('测试成功', '这是一个成功通知')
        this.addLog('发送成功通知')
      } catch (error) {
        this.addLog(`发送成功通知失败: ${error.message}`)
      }
    },
    
    testErrorNotify() {
      try {
        notify.error('测试错误', '这是一个错误通知')
        this.addLog('发送错误通知')
      } catch (error) {
        this.addLog(`发送错误通知失败: ${error.message}`)
      }
    },
    
    testWarningNotify() {
      try {
        notify.warning('测试警告', '这是一个警告通知')
        this.addLog('发送警告通知')
      } catch (error) {
        this.addLog(`发送警告通知失败: ${error.message}`)
      }
    }
  },
  
  onLoad() {
    this.addLog('页面加载完成')
  },
  
  onShow() {
    this.addLog('页面显示')
  },
  
  onHide() {
    this.addLog('页面隐藏')
  },
  
  onUnload() {
    this.addLog('页面卸载')
  }
}
</script>

<style lang="scss" scoped>
.nav-test-container {
  padding: 20rpx;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  
  .title {
    display: block;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .subtitle {
    display: block;
    font-size: 24rpx;
    color: #666;
  }
}

.test-section {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .section-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .test-btn {
    display: block;
    width: 100%;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 8rpx;
    font-size: 28rpx;
    
    &:active {
      background: #0056cc;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.log-section {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  
  .log-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .log-content {
    height: 400rpx;
    border: 1px solid #eee;
    border-radius: 8rpx;
    padding: 20rpx;
    
    .log-item {
      display: block;
      font-size: 24rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 10rpx;
      word-break: break-all;
    }
  }
}
</style>
