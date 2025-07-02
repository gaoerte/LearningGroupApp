<template>
  <view class="loading-spinner" :class="{ 'inline': inline }">
    <view class="spinner-container">
      <view class="spinner" :class="size">
        <view class="spinner-dot dot1"></view>
        <view class="spinner-dot dot2"></view>
        <view class="spinner-dot dot3"></view>
      </view>
      <text class="loading-text" v-if="text">{{ text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    inline: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx;
}

.loading-spinner.inline {
  display: inline-flex;
  padding: 8rpx;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.spinner {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner.small {
  width: 40rpx;
  height: 40rpx;
}

.spinner.medium {
  width: 60rpx;
  height: 60rpx;
}

.spinner.large {
  width: 80rpx;
  height: 80rpx;
}

.spinner-dot {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4rpx solid transparent;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-dot.dot2 {
  border-top-color: rgba(24, 144, 255, 0.6);
  animation-delay: -0.4s;
  animation-duration: 1.8s;
}

.spinner-dot.dot3 {
  border-top-color: rgba(24, 144, 255, 0.3);
  animation-delay: -0.8s;
  animation-duration: 2.4s;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 24rpx;
  color: #666666;
  text-align: center;
}
</style>
