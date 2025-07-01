<template>
  <view :class="cardClass" @tap="handleTap">
    <view class="card-header" v-if="$slots.header || title || subtitle">
      <slot name="header">
        <text class="card-title" v-if="title">{{ title }}</text>
        <text class="card-subtitle" v-if="subtitle">{{ subtitle }}</text>
      </slot>
    </view>
    
    <view class="card-body">
      <slot />
    </view>
    
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </view>
    
    <!-- 加载遮罩 -->
    <view class="card-loading" v-if="loading">
      <LoadingSpinner size="small" />
    </view>
  </view>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'ModernCard',
  components: {
    LoadingSpinner
  },
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
      default: 'default',
      validator: value => ['default', 'primary', 'secondary', 'success', 'warning', 'error'].includes(value)
    },
    shadow: {
      type: String,
      default: 'md',
      validator: value => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    hoverable: {
      type: Boolean,
      default: true
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
        `card-${this.variant}`,
        `shadow-${this.shadow}`,
        {
          'hoverable': this.hoverable && !this.loading,
          'clickable': this.clickable && !this.loading,
          'loading': this.loading
        }
      ]
    }
  },
  methods: {
    handleTap() {
      if (!this.loading && this.clickable) {
        this.$emit('tap')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.modern-card {
  position: relative;
  background: $white;
  border-radius: $radius-lg;
  padding: $space-6;
  margin-bottom: $space-4;
  transition: all $transition-normal;
  overflow: hidden;
  
  &.hoverable:hover {
    transform: translateY(-4rpx);
  }
  
  &.clickable {
    cursor: pointer;
    
    &:active {
      transform: translateY(2rpx);
    }
  }
  
  &.loading {
    pointer-events: none;
  }
  
  // 变体样式
  &.card-primary {
    background: $gradient-primary;
    color: $white;
    
    .card-title { color: $white; }
    .card-subtitle { color: rgba(255, 255, 255, 0.8); }
  }
  
  &.card-secondary {
    background: $gradient-secondary;
    color: $white;
    
    .card-title { color: $white; }
    .card-subtitle { color: rgba(255, 255, 255, 0.8); }
  }
  
  &.card-success {
    background: $success-light;
    border-left: 8rpx solid $success;
    
    .card-title { color: $success; }
  }
  
  &.card-warning {
    background: $warning-light;
    border-left: 8rpx solid $warning;
    
    .card-title { color: $warning; }
  }
  
  &.card-error {
    background: $error-light;
    border-left: 8rpx solid $error;
    
    .card-title { color: $error; }
  }
  
  // 阴影样式
  &.shadow-none { box-shadow: none; }
  &.shadow-sm { box-shadow: $shadow-sm; }
  &.shadow-md { box-shadow: $shadow-md; }
  &.shadow-lg { box-shadow: $shadow-lg; }
  &.shadow-xl { box-shadow: $shadow-xl; }
}

.card-header {
  margin-bottom: $space-4;
  
  .card-title {
    font-size: $text-xl;
    font-weight: $font-semibold;
    color: $gray-800;
    margin-bottom: $space-1;
    line-height: $leading-tight;
  }
  
  .card-subtitle {
    font-size: $text-sm;
    color: $gray-500;
    line-height: $leading-normal;
  }
}

.card-body {
  flex: 1;
  line-height: $leading-relaxed;
}

.card-footer {
  margin-top: $space-4;
  padding-top: $space-4;
  border-top: 1px solid $gray-200;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  z-index: 10;
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .modern-card {
    padding: $space-4;
    
    .card-title {
      font-size: $text-lg;
    }
  }
}
</style>
