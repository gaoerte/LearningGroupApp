<template>
  <view class="stat-card" :class="{ 'animated': animated }" :style="animationStyle">
    <view class="stat-content">
      <view class="stat-icon-wrapper">
        <text class="stat-icon">{{ data.icon }}</text>
        <view class="stat-pulse" v-if="data.highlight"></view>
      </view>
      
      <view class="stat-info">
        <text class="stat-number" :class="data.color">{{ data.value }}</text>
        <text class="stat-label">{{ data.label }}</text>
        <text class="stat-change" v-if="data.change" :class="data.changeType">
          {{ data.change }}
        </text>
      </view>
    </view>
    
    <view class="stat-background">
      <view class="stat-bg-pattern"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    data: {
      type: Object,
      required: true,
      default: () => ({
        icon: '📊',
        value: 0,
        label: '统计',
        color: 'primary',
        change: null,
        changeType: 'positive',
        highlight: false
      })
    },
    animationDelay: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      animated: false
    };
  },
  computed: {
    animationStyle() {
      return {
        animationDelay: `${this.animationDelay}ms`
      };
    }
  },
  mounted() {
    // 延迟添加动画类以触发动画
    setTimeout(() => {
      this.animated = true;
    }, this.animationDelay);
  }
};
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';
@import '../styles/mixins.scss';

.stat-card {
  position: relative;
  @include card-modern;
  overflow: hidden;
  transform: translateY(40rpx);
  opacity: 0;
  transition: all $duration-normal $ease-out;
  
  &.animated {
    transform: translateY(0);
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.stat-content {
  position: relative;
  z-index: 2;
  padding: $space-6;
  @include flex-between;
}

.stat-icon-wrapper {
  position: relative;
  width: 80rpx;
  height: 80rpx;
  @include flex-center;
  background: $gradient-primary;
  border-radius: $radius-full;
  box-shadow: $shadow-primary;
}

.stat-icon {
  font-size: 36rpx;
  filter: brightness(0) invert(1);
}

.stat-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: $radius-full;
  @include pulse($primary-500);
}

.stat-info {
  flex: 1;
  margin-left: $space-4;
  @include flex-column;
  align-items: flex-end;
}

.stat-number {
  font-size: $text-3xl;
  font-weight: $font-bold;
  line-height: $leading-tight;
  
  &.primary { color: $primary-600; }
  &.success { color: $success; }
  &.warning { color: $warning; }
  &.error { color: $error; }
}

.stat-label {
  font-size: $text-sm;
  color: $gray-600;
  margin-top: $space-1;
}

.stat-change {
  font-size: $text-xs;
  font-weight: $font-medium;
  margin-top: $space-1;
  padding: 4rpx 8rpx;
  border-radius: $radius-sm;
  
  &.positive {
    color: $success;
    background: rgba($success, 0.1);
  }
  
  &.negative {
    color: $error;
    background: rgba($error, 0.1);
  }
}

.stat-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.stat-bg-pattern {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200rpx;
  height: 200rpx;
  background: $gradient-secondary;
  border-radius: $radius-full;
  opacity: 0.05;
  transform: rotate(45deg);
}
</style>
