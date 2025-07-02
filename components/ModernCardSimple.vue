<template>
  <view :class="cardClass" @tap="handleTap">
    <view class="card-header" v-if="title || subtitle">
      <text class="card-title" v-if="title">{{ title }}</text>
      <text class="card-subtitle" v-if="subtitle">{{ subtitle }}</text>
    </view>
    
    <view class="card-body">
      <slot />
    </view>
    
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </view>
    
    <!-- 加载遮罩 -->
    <view class="card-loading" v-if="loading">
      <view class="loading-spinner">
        <view class="spinner-dot"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ModernCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default'
    },
    shadow: {
      type: String,
      default: 'md'
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardClass() {
      return [
        'modern-card',
        `card-variant-${this.variant}`,
        `card-shadow-${this.shadow}`,
        {
          'card-hoverable': this.hoverable,
          'card-clickable': this.clickable,
          'card-loading-state': this.loading
        }
      ]
    }
  },
  methods: {
    handleTap() {
      if (this.clickable && !this.loading) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modern-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.card-variant-default {
  border: 2rpx solid #f0f0f0;
}

.card-variant-primary {
  border: 2rpx solid #1890ff;
}

.card-variant-secondary {
  border: 2rpx solid #52c41a;
}

.card-variant-success {
  border: 2rpx solid #52c41a;
}

.card-variant-warning {
  border: 2rpx solid #faad14;
}

.card-variant-error {
  border: 2rpx solid #f5222d;
}

.card-shadow-none {
  box-shadow: none;
}

.card-shadow-sm {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-shadow-md {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.card-shadow-lg {
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.card-shadow-xl {
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.16);
}

.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
}

.card-clickable {
  cursor: pointer;
}

.card-clickable:active {
  transform: scale(0.98);
}

.card-header {
  padding: 32rpx 32rpx 0 32rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 8rpx;
}

.card-subtitle {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

.card-body {
  padding: 32rpx;
}

.card-footer {
  padding: 0 32rpx 32rpx 32rpx;
  border-top: 2rpx solid #f0f0f0;
  margin-top: 32rpx;
  padding-top: 32rpx;
}

.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  position: relative;
}

.spinner-dot {
  width: 100%;
  height: 100%;
  border: 4rpx solid transparent;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.card-loading-state {
  pointer-events: none;
}
</style>
