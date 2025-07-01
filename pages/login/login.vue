<template>
  <view class="login-container">
    <!-- 背景装饰 -->
    <view class="login-bg">
      <view class="bg-shape bg-shape-1"></view>
      <view class="bg-shape bg-shape-2"></view>
      <view class="bg-shape bg-shape-3"></view>
    </view>
    
    <!-- 主要内容 -->
    <view class="login-content">
      <!-- Logo 和标题区域 -->
      <view class="login-header fade-in">
        <view class="logo-container">
          <image class="logo" src="/static/logo.png" mode="aspectFit" />
        </view>
        <text class="app-title">学习小组</text>
        <text class="app-subtitle">找到志同道合的学习伙伴</text>
      </view>
      
      <!-- 登录表单区域 -->
      <view class="login-form slide-up">
        <ModernCard variant="default" shadow="xl" class="login-card">
          <view class="form-content">
            <text class="form-title">欢迎使用</text>
            <text class="form-subtitle">使用微信快速登录，开始您的学习之旅</text>
            
            <view class="login-actions">
              <ModernButton 
                variant="primary" 
                size="lg" 
                :loading="isLoading"
                :disabled="isLoading"
                block
                @tap="wechatLogin"
                class="login-button"
              >
                <view class="button-content">
                  <text class="wechat-icon">📱</text>
                  <text>{{ isLoading ? '登录中...' : '微信一键登录' }}</text>
                </view>
              </ModernButton>
            </view>
            
            <!-- 错误提示 -->
            <view class="error-message" v-if="error">
              <text class="error-text">{{ error }}</text>
            </view>
            
            <!-- 底部说明 -->
            <view class="login-footer">
              <text class="privacy-text">登录即表示您同意我们的</text>
              <text class="privacy-link">服务条款</text>
              <text class="privacy-text">和</text>
              <text class="privacy-link">隐私政策</text>
            </view>
          </view>
        </ModernCard>
      </view>
    </view>
    
    <!-- 底部装饰 -->
    <view class="login-decoration">
      <view class="decoration-dots">
        <view class="dot" v-for="n in 3" :key="n"></view>
      </view>
    </view>
  </view>
</template>

<script>
import ModernCard from '@/components/ModernCard.vue'
import ModernButton from '@/components/ModernButton.vue'

export default {
  name: 'LoginPage',
  components: {
    ModernCard,
    ModernButton
  },
  data() {
    return {
      isLoading: false,
      error: null
    }
  },
  methods: {
    async wechatLogin() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 1. 获取微信登录凭证
        const loginRes = await new Promise((resolve, reject) => {
          wx.login({
            success: resolve,
            fail: reject
          });
        });
        
        console.log('获取微信code:', loginRes.code);
        
        // 2. 简化登录流程 - 直接存储 token 并跳转
        wx.setStorageSync('token', 'temp_token_' + Date.now());
        wx.setStorageSync('user_id', 'temp_user');
        wx.setStorageSync('openid', 'temp_openid');
        
        console.log('登录成功');
        
        // 3. 延迟跳转，显示成功效果
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 500);
        
      } catch (err) {
        console.error('登录失败:', err);
        this.error = err.message || '登录失败，请重试';
        
        // 显示错误提示
        wx.showToast({
          title: this.error,
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-container {
  position: relative;
  min-height: 100vh;
  background: $gradient-primary;
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
  
  .bg-shape {
    position: absolute;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
    
    &.bg-shape-1 {
      width: 200rpx;
      height: 200rpx;
      top: 10%;
      right: -50rpx;
      animation-delay: 0s;
    }
    
    &.bg-shape-2 {
      width: 150rpx;
      height: 150rpx;
      top: 60%;
      left: -30rpx;
      animation-delay: 2s;
    }
    
    &.bg-shape-3 {
      width: 100rpx;
      height: 100rpx;
      top: 30%;
      left: 50%;
      animation-delay: 4s;
    }
  }
}

.login-content {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: $space-8 $space-6;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: $space-12;
  
  .logo-container {
    margin-bottom: $space-6;
    
    .logo {
      width: 120rpx;
      height: 120rpx;
    }
  }
  
  .app-title {
    font-size: $text-4xl;
    font-weight: $font-bold;
    color: $white;
    margin-bottom: $space-2;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .app-subtitle {
    font-size: $text-lg;
    color: rgba(255, 255, 255, 0.9);
    font-weight: $font-normal;
  }
}

.login-form {
  .login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
}

.form-content {
  text-align: center;
  
  .form-title {
    font-size: $text-2xl;
    font-weight: $font-semibold;
    color: $gray-800;
    margin-bottom: $space-2;
  }
  
  .form-subtitle {
    font-size: $text-base;
    color: $gray-600;
    margin-bottom: $space-8;
    line-height: $leading-relaxed;
  }
}

.login-actions {
  margin-bottom: $space-6;
  
  .login-button {
    border-radius: $radius-xl;
    box-shadow: $shadow-primary;
    
    .button-content {
      display: flex;
      align-items: center;
      gap: $space-3;
      
      .wechat-icon {
        font-size: $text-xl;
      }
    }
  }
}

.error-message {
  margin-bottom: $space-4;
  padding: $space-3 $space-4;
  background: $error-light;
  border-radius: $radius-md;
  border-left: 4rpx solid $error;
  
  .error-text {
    color: $error;
    font-size: $text-sm;
    text-align: center;
  }
}

.login-footer {
  .privacy-text {
    font-size: $text-xs;
    color: $gray-500;
  }
  
  .privacy-link {
    font-size: $text-xs;
    color: $primary-500;
    margin: 0 $space-1;
  }
}

.login-decoration {
  position: relative;
  z-index: 2;
  padding: $space-6;
  
  .decoration-dots {
    display: flex;
    justify-content: center;
    gap: $space-2;
    
    .dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: $radius-full;
      background: rgba(255, 255, 255, 0.3);
      animation: pulse 2s ease-in-out infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .login-content {
    padding: $space-6 $space-4;
  }
  
  .login-header {
    margin-bottom: $space-8;
    
    .app-title {
      font-size: $text-3xl;
    }
    
    .app-subtitle {
      font-size: $text-base;
    }
  }
  
  .form-content {
    .form-title {
      font-size: $text-xl;
    }
    
    .form-subtitle {
      font-size: $text-sm;
    }
  }
}
</style>