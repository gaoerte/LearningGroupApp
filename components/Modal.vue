<template>
  <view v-if="visible" class="modal-mask" @touchmove.stop.prevent @tap="handleMaskTap">
    <view class="modal-content" @tap.stop>
      <view class="modal-header" v-if="title">
        <text class="modal-title">{{ title }}</text>
        <text class="modal-close" @tap="close">×</text>
      </view>
      
      <view class="modal-body">
        <slot>
          <text v-if="content">{{ content }}</text>
        </slot>
      </view>
      
      <view class="modal-footer" v-if="showFooter">
        <button 
          v-if="showCancel" 
          class="modal-btn cancel-btn" 
          @tap="handleCancel"
        >
          {{ cancelText }}
        </button>
        <button 
          v-if="showConfirm" 
          class="modal-btn confirm-btn" 
          @tap="handleConfirm"
        >
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showCancel: {
      type: Boolean,
      default: true
    },
    showConfirm: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    maskClosable: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    handleCancel() {
      this.$emit('cancel');
      this.close();
    },
    handleConfirm() {
      this.$emit('confirm');
    },
    handleMaskTap() {
      if (this.maskClosable) {
        this.close();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/variables.scss';

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $surface-overlay;
  backdrop-filter: blur(8rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn $duration-300 $easing-smooth;
}

.modal-content {
  position: relative;
  background: $surface-primary;
  border-radius: $radius-2xl;
  width: 80%;
  max-width: 680rpx;
  min-width: 560rpx;
  overflow: hidden;
  box-shadow: $shadow-2xl;
  transform: scale(0.9);
  animation: modalSlideIn $duration-300 $easing-smooth forwards;
  
  @media (max-width: 640rpx) {
    width: 90%;
    min-width: auto;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $space-6;
  background: linear-gradient(135deg, rgba($primary-500, 0.08), rgba($secondary-500, 0.08));
  border-bottom: 2rpx solid $border-light;
}

.modal-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.4;
}

.modal-close {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: $text-secondary;
  background: $gray-100;
  border-radius: $radius-full;
  transition: all $duration-200 $easing-smooth;
  
  &:hover {
    background: $gray-200;
    color: $text-primary;
    transform: scale(1.1);
  }
}

.modal-body {
  padding: $space-6;
  min-height: 120rpx;
  line-height: 1.6;
  color: $text-secondary;
  font-size: $text-base;
}

.modal-footer {
  display: flex;
  gap: $space-3;
  padding: $space-4 $space-6 $space-6;
  background: rgba($gray-50, 0.5);
}

.modal-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-xl;
  font-size: $text-base;
  font-weight: $font-medium;
  border: none;
  transition: all $duration-200 $easing-smooth;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform $duration-500 $easing-smooth;
  }
  
  &:active::before {
    transform: translateX(100%);
  }
}

.cancel-btn {
  background: $gray-100;
  color: $text-secondary;
  border: 2rpx solid $border-light;
  
  &:hover {
    background: $gray-200;
    color: $text-primary;
    transform: translateY(-2rpx);
    box-shadow: $shadow-sm;
  }
}

.confirm-btn {
  background: linear-gradient(135deg, $primary-500, $primary-600);
  color: $surface-primary;
  border: 2rpx solid transparent;
  
  &:hover {
    background: linear-gradient(135deg, $primary-600, $primary-700);
    transform: translateY(-2rpx);
    box-shadow: $shadow-md;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.9) translateY(-20rpx);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
