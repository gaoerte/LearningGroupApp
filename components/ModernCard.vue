<template>
  <view 
    class="modern-card"
    :class="[
      variant,
      shadow,
      {
        'has-title': !!title,
        'clickable': clickable
      }
    ]"
    @click="handleClick"
  >
    <!-- 卡片标题 -->
    <view class="card-header" v-if="title">
      <text class="card-title">{{ title }}</text>
      <slot name="header-extra"></slot>
    </view>
    
    <!-- 卡片内容 -->
    <view class="card-body" :class="{ 'no-title': !title }">
      <slot></slot>
    </view>
    
    <!-- 卡片底部 -->
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
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
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
    },
    shadow: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    clickable: {
      type: Boolean,
      default: false
    },
    padding: {
      type: String,
      default: 'normal',
      validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
    }
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit('click', event);
        this.$emit('tap', event); // 兼容uni-app
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modern-card {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  transition: all 0.3s ease;
  
  // 阴影变体
  &.none {
    box-shadow: none;
  }
  
  &.sm {
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  }
  
  &.md {
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  }
  
  &.lg {
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  }
  
  &.xl {
    box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.16);
  }
  
  // 样式变体
  &.default {
    border: 1rpx solid #e5e7eb;
  }
  
  &.primary {
    border: 1rpx solid rgba(102, 126, 234, 0.2);
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  }
  
  &.secondary {
    border: 1rpx solid rgba(107, 114, 128, 0.2);
    background: rgba(107, 114, 128, 0.02);
  }
  
  &.success {
    border: 1rpx solid rgba(16, 185, 129, 0.2);
    background: rgba(16, 185, 129, 0.05);
  }
  
  &.warning {
    border: 1rpx solid rgba(245, 158, 11, 0.2);
    background: rgba(245, 158, 11, 0.05);
  }
  
  &.danger {
    border: 1rpx solid rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.05);
  }
  
  // 交互状态
  &.clickable {
    cursor: pointer;
    
    &:active {
      transform: translateY(-2rpx);
      box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
    }
  }
  
  // 悬停效果（H5）
  &:hover {
    transform: translateY(-1rpx);
  }
}

.card-header {
  padding: 32rpx 32rpx 0 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #1f2937;
    flex: 1;
  }
}

.card-body {
  padding: 32rpx;
  
  &.no-title {
    padding-top: 32rpx;
  }
  
  // 内边距变体
  .modern-card.none & {
    padding: 0;
  }
  
  .modern-card.small & {
    padding: 20rpx;
  }
  
  .modern-card.large & {
    padding: 48rpx;
  }
}

.card-footer {
  padding: 0 32rpx 32rpx 32rpx;
  border-top: 1rpx solid #f3f4f6;
  margin-top: 24rpx;
  padding-top: 24rpx;
}

// 特殊布局
.has-title .card-body {
  padding-top: 24rpx;
}

// 响应式
@media (max-width: 750rpx) {
  .card-header,
  .card-body,
  .card-footer {
    padding-left: 24rpx;
    padding-right: 24rpx;
  }
}
</style>
