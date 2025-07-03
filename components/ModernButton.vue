<template>
  <button :class="buttonClass" :disabled="disabled || loading" @tap="handleTap">
    <LoadingSpinner v-if="loading" size="small" color="currentColor" />
    <view class="button-content" :class="{ 'with-loading': loading }">
      <slot />
    </view>
  </button>
</template>

<script>
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  name: 'ModernButton',
  components: {
    LoadingSpinner
  },
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => ['primary', 'secondary', 'outline', 'ghost', 'success', 'warning', 'error'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    rounded: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    buttonClass() {
      return [
        'modern-button',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-block': this.block,
          'btn-rounded': this.rounded,
          'btn-disabled': this.disabled,
          'btn-loading': this.loading
        }
      ]
    }
  },
  methods: {
    handleTap() {
      if (!this.disabled && !this.loading) {
        this.$emit('tap')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.modern-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  border: none;
  font-weight: $font-medium;
  text-align: center;
  text-decoration: none;
  transition: all $transition-normal;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity $transition-fast;
  }
  
  &:active::before {
    opacity: 1;
  }
  
  &.btn-disabled {
    opacity: 0.5;
  }
  
  &.btn-loading {
    opacity: 0.8;
  }
  
  &.btn-block {
    width: 100%;
  }
  
  &.btn-rounded {
    border-radius: $radius-full;
  }
  
  // 变体样式
  &.btn-primary {
    background: $gradient-primary;
    color: $white;
    border-radius: $radius-md;
    box-shadow: $shadow-primary;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-md;
    }
  }
  
  &.btn-secondary {
    background: $gradient-secondary;
    color: $white;
    border-radius: $radius-md;
    box-shadow: $shadow-secondary;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-md;
    }
  }
  
  &.btn-outline {
    background: transparent;
    color: $primary-500;
    border: 2rpx solid $primary-500;
    border-radius: $radius-md;
    
    &:active {
      background: $primary-50;
    }
  }
  
  &.btn-ghost {
    background: rgba(255, 255, 255, 0.1);
    color: $gray-700;
    border: 1rpx solid $gray-300;
    border-radius: $radius-md;
    
    &:active {
      background: $gray-100;
    }
  }
  
  &.btn-success {
    background: $gradient-success;
    color: $white;
    border-radius: $radius-md;
    box-shadow: $shadow-success;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-md;
    }
  }
  
  &.btn-warning {
    background: $gradient-warm;
    color: $white;
    border-radius: $radius-md;
    box-shadow: $shadow-warning;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-md;
    }
  }
  
  &.btn-error {
    background: $gradient-sunset;
    color: $white;
    border-radius: $radius-md;
    box-shadow: $shadow-error;
    
    &:active {
      transform: translateY(2rpx);
      box-shadow: $shadow-md;
    }
  }
  
  // 尺寸样式
  &.btn-sm {
    padding: $space-2 $space-4;
    font-size: $text-sm;
    min-height: 64rpx;
  }
  
  &.btn-md {
    padding: $space-3 $space-6;
    font-size: $text-base;
    min-height: 88rpx;
  }
  
  &.btn-lg {
    padding: $space-4 $space-8;
    font-size: $text-lg;
    min-height: 96rpx;
  }
  
  &.btn-xl {
    padding: $space-5 $space-10;
    font-size: $text-xl;
    min-height: 112rpx;
  }
}

.button-content {
  transition: all $transition-fast;
  
  &.with-loading {
    opacity: 0.7;
  }
}

</style>
