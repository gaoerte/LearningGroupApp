<template>
  <view class="loading-spinner" :class="{ 'inline': inline }">
    <view class="spinner-container">
      <view class="spinner" :class="size">
        <view class="spinner-ring"></view>
        <view class="spinner-ring"></view>
        <view class="spinner-ring"></view>
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
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

.loading-spinner {
  @include flex-center;
  padding: $space-8;
  
  &.inline {
    display: inline-flex;
    padding: $space-2;
  }
}

.spinner-container {
  @include flex-column;
  align-items: center;
  gap: $space-3;
}

.spinner {
  position: relative;
  
  &.small {
    width: 40rpx;
    height: 40rpx;
  }
  
  &.medium {
    width: 60rpx;
    height: 60rpx;
  }
  
  &.large {
    width: 80rpx;
    height: 80rpx;
  }
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4rpx solid transparent;
  border-top-color: $primary-500;
  border-radius: $radius-full;
  animation: spin 1.2s linear infinite;
  
  &:nth-child(2) {
    border-top-color: $primary-300;
    animation-delay: -0.4s;
    animation-duration: 1.8s;
  }
  
  &:nth-child(3) {
    border-top-color: $primary-200;
    animation-delay: -0.8s;
    animation-duration: 2.4s;
  }
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
  font-size: $text-sm;
  color: $gray-600;
  text-align: center;
}
</style>
