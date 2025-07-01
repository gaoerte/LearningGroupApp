<template>
  <view class="empty-state">
    <view class="empty-illustration">
      <text class="empty-icon">{{ icon }}</text>
    </view>
    
    <view class="empty-content">
      <text class="empty-title">{{ title }}</text>
      <text class="empty-description" v-if="description">{{ description }}</text>
      
      <button 
        v-if="actionText" 
        class="empty-action-btn"
        @click="$emit('action')"
      >
        {{ actionText }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: {
      type: String,
      default: '📭'
    },
    title: {
      type: String,
      default: '暂无数据'
    },
    description: {
      type: String,
      default: ''
    },
    actionText: {
      type: String,
      default: ''
    }
  },
  emits: ['action']
};
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 128rpx 64rpx;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 64rpx;
}

.empty-icon {
  font-size: 120rpx;
  opacity: 0.6;
  display: block;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #374151;
  line-height: 1.25;
}

.empty-description {
  font-size: 28rpx;
  color: #6b7280;
  line-height: 1.5;
  max-width: 400rpx;
}

.empty-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  padding: 24rpx 64rpx;
  font-size: 28rpx;
  border-radius: 24rpx;
  font-weight: 500;
  background: #0ea5e9;
  color: #ffffff;
  border: none;
  transition: all 0.3s ease;
}

/* 小程序不支持 hover 效果 */
</style>
