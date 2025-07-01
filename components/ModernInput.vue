<template>
  <view class="modern-input-group">
    <text class="input-label" v-if="label">{{ label }}</text>
    <view class="input-wrapper" :class="inputWrapperClass">
      <view class="input-prefix" v-if="$slots.prefix">
        <slot name="prefix" />
      </view>
      
      <input 
        :class="inputClass"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxlength"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @confirm="handleConfirm"
      />
      
      <view class="input-suffix" v-if="$slots.suffix || showClear">
        <slot name="suffix">
          <view class="clear-button" v-if="showClear" @tap="handleClear">
            <text class="clear-icon">×</text>
          </view>
        </slot>
      </view>
    </view>
    
    <text class="input-error" v-if="error">{{ error }}</text>
    <text class="input-help" v-if="help && !error">{{ help }}</text>
  </view>
</template>

<script>
export default {
  name: 'ModernInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    help: {
      type: String,
      default: ''
    },
    maxlength: {
      type: Number,
      default: -1
    },
    clearable: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    }
  },
  data() {
    return {
      focused: false
    }
  },
  computed: {
    inputWrapperClass() {
      return [
        'input-wrapper',
        `input-${this.size}`,
        {
          'focused': this.focused,
          'error': this.error,
          'disabled': this.disabled
        }
      ]
    },
    inputClass() {
      return [
        'modern-input',
        {
          'has-prefix': this.$slots.prefix,
          'has-suffix': this.$slots.suffix || this.showClear
        }
      ]
    },
    showClear() {
      return this.clearable && this.modelValue && !this.disabled
    }
  },
  methods: {
    handleInput(e) {
      this.$emit('update:modelValue', e.detail.value)
      this.$emit('input', e.detail.value)
    },
    handleFocus(e) {
      this.focused = true
      this.$emit('focus', e)
    },
    handleBlur(e) {
      this.focused = false
      this.$emit('blur', e)
    },
    handleConfirm(e) {
      this.$emit('confirm', e.detail.value)
    },
    handleClear() {
      this.$emit('update:modelValue', '')
      this.$emit('clear')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.modern-input-group {
  margin-bottom: $space-4;
}

.input-label {
  display: block;
  font-size: $text-sm;
  font-weight: $font-medium;
  color: $gray-700;
  margin-bottom: $space-2;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: $white;
  border: 2rpx solid $gray-300;
  border-radius: $radius-md;
  transition: all $transition-normal;
  overflow: hidden;
  
  &.focused {
    border-color: $primary-500;
    box-shadow: 0 0 0 6rpx rgba(14, 165, 233, 0.1);
  }
  
  &.error {
    border-color: $error;
    box-shadow: 0 0 0 6rpx rgba(239, 68, 68, 0.1);
  }
  
  &.disabled {
    background: $gray-100;
    border-color: $gray-200;
    cursor: not-allowed;
  }
  
  // 尺寸变体
  &.input-sm {
    min-height: 64rpx;
    
    .modern-input {
      padding: $space-2 $space-3;
      font-size: $text-sm;
    }
  }
  
  &.input-md {
    min-height: 88rpx;
    
    .modern-input {
      padding: $space-3 $space-4;
      font-size: $text-base;
    }
  }
  
  &.input-lg {
    min-height: 96rpx;
    
    .modern-input {
      padding: $space-4 $space-5;
      font-size: $text-lg;
    }
  }
}

.modern-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: $gray-800;
  
  &::placeholder {
    color: $gray-400;
  }
  
  &:disabled {
    color: $gray-400;
    cursor: not-allowed;
  }
  
  &.has-prefix {
    padding-left: 0;
  }
  
  &.has-suffix {
    padding-right: 0;
  }
}

.input-prefix,
.input-suffix {
  display: flex;
  align-items: center;
  color: $gray-500;
  padding: 0 $space-3;
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  border-radius: $radius-full;
  background: $gray-300;
  cursor: pointer;
  transition: all $transition-fast;
  
  &:hover {
    background: $gray-400;
  }
  
  .clear-icon {
    font-size: 20rpx;
    color: $white;
    line-height: 1;
  }
}

.input-error {
  color: $error;
  font-size: $text-xs;
  margin-top: $space-1;
  line-height: $leading-normal;
}

.input-help {
  color: $gray-500;
  font-size: $text-xs;
  margin-top: $space-1;
  line-height: $leading-normal;
}

// 响应式设计
@media (max-width: $breakpoint-sm) {
  .input-wrapper {
    &.input-lg {
      min-height: 88rpx;
      
      .modern-input {
        font-size: $text-base;
      }
    }
  }
}
</style>
