<template>
  <view class="login-container">
    <!-- 背景装饰 -->
    <view class="login-bg">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
      <view class="bg-circle bg-circle-3"></view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="login-content">
      <!-- 顶部Logo和标题 -->
      <view class="login-header">
        <image class="logo" src="/static/logo.png" mode="aspectFit" />
        <text class="app-title">学习小组</text>
        <text class="app-subtitle">让学习更有趣，让成长更有伴</text>
      </view>
      
      <!-- 登录卡片 -->
      <view class="login-card">
        <view class="card-header">
          <text class="card-title">欢迎使用</text>
          <text class="card-subtitle">开始您的学习之旅</text>
        </view>
        
        <view class="login-form">
          <!-- 微信登录按钮 -->
          <button 
            class="login-btn wechat-btn"
            :class="{ 'loading': isLoading }"
            :disabled="isLoading"
            @tap="wechatLogin"
          >
            <text class="btn-icon" v-if="!isLoading">📱</text>
            <text class="btn-text">{{ isLoading ? '登录中...' : '微信登录' }}</text>
          </button>
          
          <!-- 错误提示 -->
          <view class="error-tip" v-if="error">
            <text class="error-text">{{ error }}</text>
          </view>
          
          <!-- 快速登录 -->
          <view class="quick-login">
            <text class="quick-text">测试登录</text>
            <button 
              class="quick-btn"
              :disabled="isLoading"
              @tap="quickLogin"
            >
              一键登录
            </button>
          </view>
        </view>
        
        <!-- 底部说明 -->
        <view class="login-footer">
          <text class="privacy-text">登录即表示您同意</text>
          <text class="privacy-link">服务条款</text>
          <text class="privacy-text">和</text>
          <text class="privacy-link">隐私政策</text>
        </view>
      </view>
    </view>
    
    <!-- 底部装饰 -->
    <view class="login-decoration">
      <view class="decoration-line"></view>
    </view>
  </view>
</template>

<script>
import { UserAPI } from '../../api/index.js';
import { StorageManager } from '../../utils/storage.js';

export default {
  name: 'LoginPage',
  data() {
    return {
      isLoading: false,
      error: null,
      loginType: null // 'wechat' 或 'quick'
    }
  },
  
  onLoad() {
    console.log('[登录页] 页面加载');
    this.checkExistingLogin();
  },
  
  methods: {
    /**
     * 检查是否已经登录
     */
    checkExistingLogin() {
      if (StorageManager.isLoggedIn() && StorageManager.isTokenValid()) {
        console.log('[登录页] 用户已登录且token有效，跳转首页');
        this.navigateToHome();
      }
    },
    
    /**
     * 微信登录
     */
    async wechatLogin() {
      this.loginType = 'wechat';
      await this.performLogin('wechat');
    },
    
    /**
     * 快速登录（测试用）
     */
    async quickLogin() {
      this.loginType = 'quick';
      await this.performLogin('quick');
    },
    
    /**
     * 执行登录流程
     * @param {String} type - 登录类型
     */
    async performLogin(type = 'quick') {
      this.isLoading = true;
      this.error = null;
      
      try {
        console.log(`[登录页] 开始${type}登录`);
        
        let result;
        
        if (type === 'wechat') {
          // 微信登录流程
          const code = await UserAPI.getWechatCode();
          result = await UserAPI.wechatLogin(code);
        } else {
          // 快速登录流程
          const testOpenid = `test_user_${Date.now()}`;
          result = await UserAPI.quickLogin(testOpenid);
        }
        
        if (result.success) {
          // 保存登录信息
          const loginData = result.data;
          const saveResult = StorageManager.saveLoginData(loginData);
          
          if (saveResult) {
            console.log(`[登录页] ${type}登录成功，用户信息已保存`);
            
            // 显示成功提示
            uni.showToast({
              title: '登录成功！',
              icon: 'success',
              duration: 1500
            });
            
            // 延迟跳转到首页
            setTimeout(() => {
              this.navigateToHome();
            }, 1500);
          } else {
            throw new Error('保存登录信息失败');
          }
        } else {
          throw new Error(result.error || `${type}登录失败`);
        }
        
      } catch (err) {
        console.error(`[登录页] ${type}登录失败:`, err);
        this.error = err.message || '登录失败，请重试';
        
        uni.showToast({
          title: this.error,
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * 跳转到首页
     */
    navigateToHome() {
      console.log('[登录页] 准备跳转到首页');
      
      // 优先使用 switchTab
      uni.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('[登录页] switchTab跳转成功');
        },
        fail: (err) => {
          console.error('[登录页] switchTab失败，尝试reLaunch:', err);
          // 如果switchTab失败，使用reLaunch
          uni.reLaunch({
            url: '/pages/index/index',
            success: () => {
              console.log('[登录页] reLaunch跳转成功');
            },
            fail: (relaunchErr) => {
              console.error('[登录页] reLaunch也失败:', relaunchErr);
            }
          });
        }
      });
    },
    
    /**
     * 跳转到首页
     */
    navigateToHome() {
      console.log('[登录页] 准备跳转到首页');
      
      // 优先使用 switchTab
      uni.switchTab({
        url: '/pages/index/index',
        success: () => {
          console.log('[登录页] switchTab跳转成功');
        },
        fail: (err) => {
          console.error('[登录页] switchTab失败，尝试reLaunch:', err);
          // 如果switchTab失败，使用reLaunch
          uni.reLaunch({
            url: '/pages/index/index',
            success: () => {
              console.log('[登录页] reLaunch跳转成功');
            },
            fail: (relaunchErr) => {
              console.error('[登录页] reLaunch也失败:', relaunchErr);
              uni.showToast({
                title: '跳转失败，请手动返回首页',
                icon: 'none'
              });
            }
          });
        }
      });
    },
    
    /**
     * 清除错误信息
     */
    clearError() {
      this.error = null;
    }
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  
  .bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    &.bg-circle-1 {
      width: 200rpx;
      height: 200rpx;
      top: 15%;
      right: -50rpx;
    }
    
    &.bg-circle-2 {
      width: 150rpx;
      height: 150rpx;
      top: 65%;
      left: -30rpx;
    }
    
    &.bg-circle-3 {
      width: 100rpx;
      height: 100rpx;
      top: 35%;
      left: 50%;
    }
  }
}

.login-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 32rpx;
  }
  
  .app-title {
    display: block;
    font-size: 56rpx;
    font-weight: bold;
    color: white;
    margin-bottom: 16rpx;
  }
  
  .app-subtitle {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-card {
  background: white;
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .card-header {
    text-align: center;
    margin-bottom: 48rpx;
    
    .card-title {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 16rpx;
    }
    
    .card-subtitle {
      display: block;
      font-size: 28rpx;
      color: #6b7280;
    }
  }
}

.login-form {
  .login-btn {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    margin-bottom: 24rpx;
    border: none;
    transition: all 0.3s ease;
    
    &.wechat-btn {
      background: #07c160;
      color: white;
      
      &:active {
        background: #06ad56;
      }
      
      &.loading {
        background: #a1a1aa;
      }
    }
    
    .btn-icon {
      margin-right: 16rpx;
      font-size: 36rpx;
    }
  }
  
  .error-tip {
    background: #fef2f2;
    border: 1rpx solid #fecaca;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    
    .error-text {
      color: #dc2626;
      font-size: 26rpx;
      text-align: center;
    }
  }
  
  .quick-login {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-top: 1rpx solid #e5e7eb;
    margin-top: 24rpx;
    
    .quick-text {
      font-size: 28rpx;
      color: #6b7280;
    }
    
    .quick-btn {
      background: #f3f4f6;
      color: #374151;
      border: 1rpx solid #d1d5db;
      border-radius: 12rpx;
      padding: 12rpx 24rpx;
      font-size: 26rpx;
      
      &:active {
        background: #e5e7eb;
      }
      
      &:disabled {
        opacity: 0.5;
      }
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 40rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #e5e7eb;
  
  .privacy-text {
    font-size: 24rpx;
    color: #9ca3af;
  }
  
  .privacy-link {
    font-size: 24rpx;
    color: #3b82f6;
    margin: 0 8rpx;
  }
}

.login-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6rpx;
  z-index: 2;
  
  .decoration-line {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .login-content {
    padding: 40rpx 32rpx;
  }
  
  .login-header {
    margin-bottom: 60rpx;
    
    .app-title {
      font-size: 48rpx;
    }
    
    .app-subtitle {
      font-size: 26rpx;
    }
  }
  
  .login-card {
    padding: 40rpx 32rpx;
    
    .card-header {
      margin-bottom: 40rpx;
      
      .card-title {
        font-size: 40rpx;
      }
      
      .card-subtitle {
        font-size: 26rpx;
      }
    }
  }
}
</style>
