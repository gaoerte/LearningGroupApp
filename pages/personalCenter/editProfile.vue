<template>
  <view class="edit-profile-container">
    <!-- 头像编辑区域 -->
    <view class="avatar-section">
      <view class="avatar-container">
        <image class="avatar" :src="profileForm.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="avatar-edit" @tap="changeAvatar">
          <text class="edit-icon">📷</text>
        </view>
      </view>
      <text class="avatar-hint">点击更换头像</text>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-card">
        <!-- 基本信息 -->
        <view class="form-group">
          <text class="group-title">基本信息</text>
          
          <view class="form-item">
            <text class="label">昵称</text>
            <input v-model="profileForm.nickname" placeholder="请输入昵称" class="input" />
          </view>
          
          <view class="form-item">
            <text class="label">性别</text>
            <view class="gender-options">
              <view 
                class="gender-item" 
                :class="{ active: profileForm.gender === 'male' }"
                @tap="selectGender('male')"
              >
                <text>👨 男</text>
              </view>
              <view 
                class="gender-item" 
                :class="{ active: profileForm.gender === 'female' }"
                @tap="selectGender('female')"
              >
                <text>👩 女</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="label">生日</text>
            <picker mode="date" :value="profileForm.birthday" @change="onBirthdayChange">
              <view class="picker-input">
                <text :class="{ placeholder: !profileForm.birthday }">
                  {{ profileForm.birthday || '请选择生日' }}
                </text>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="label">所在地</text>
            <input v-model="profileForm.location" placeholder="请输入所在地" class="input" />
          </view>
        </view>
        
        <!-- 学习信息 -->
        <view class="form-group">
          <text class="group-title">学习信息</text>
          
          <view class="form-item">
            <text class="label">职业/专业</text>
            <input v-model="profileForm.profession" placeholder="请输入职业或专业" class="input" />
          </view>
          
          <view class="form-item">
            <text class="label">学习方向</text>
            <view class="tags-container">
              <view 
                class="tag-item" 
                :class="{ active: profileForm.interests.includes(tag) }"
                v-for="tag in availableTags" 
                :key="tag"
                @tap="toggleTag(tag)"
              >
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="label">个人简介</text>
            <textarea 
              v-model="profileForm.bio" 
              placeholder="介绍一下自己吧..." 
              class="textarea"
              maxlength="200"
            />
          </view>
        </view>
        
        <!-- 联系方式 -->
        <view class="form-group">
          <text class="group-title">联系方式</text>
          
          <view class="form-item">
            <text class="label">邮箱</text>
            <input v-model="profileForm.email" placeholder="请输入邮箱地址" class="input" type="email" />
          </view>
          
          <view class="form-item">
            <text class="label">微信号</text>
            <input v-model="profileForm.wechat" placeholder="请输入微信号" class="input" />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-section">
      <button 
        class="save-button" 
        :class="{ disabled: !canSave || isSaving }"
        @tap="saveProfile"
      >
        {{ isSaving ? '保存中...' : '保存修改' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'EditProfilePage',
  data() {
    return {
      isSaving: false,
      originalData: {},
      profileForm: {
        avatar: '',
        nickname: '小明',
        gender: 'male',
        birthday: '1995-01-15',
        location: '北京市',
        profession: '前端开发工程师',
        interests: ['前端开发', 'Vue'],
        bio: '热爱学习，喜欢分享技术心得',
        email: 'xiaoming@example.com',
        wechat: 'xiaoming_dev'
      },
      availableTags: [
        '前端开发', 'Vue', 'React', 'JavaScript',
        '后端开发', 'Python', 'Java', 'Node.js',
        '移动开发', 'uni-app', 'Flutter',
        '设计', 'UI设计', 'UX设计'
      ]
    }
  },
  computed: {
    canSave() {
      return this.profileForm.nickname && this.profileForm.nickname.trim()
    }
  },
  onLoad() {
    this.originalData = { ...this.profileForm }
  },
  methods: {
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.profileForm.avatar = res.tempFilePaths[0]
          uni.showToast({
            title: '头像已选择',
            icon: 'success'
          })
        }
      })
    },
    
    selectGender(gender) {
      this.profileForm.gender = gender
    },
    
    onBirthdayChange(e) {
      this.profileForm.birthday = e.detail.value
    },
    
    toggleTag(tag) {
      const index = this.profileForm.interests.indexOf(tag)
      if (index > -1) {
        this.profileForm.interests.splice(index, 1)
      } else {
        if (this.profileForm.interests.length >= 5) {
          uni.showToast({
            title: '最多选择5个方向',
            icon: 'none'
          })
          return
        }
        this.profileForm.interests.push(tag)
      }
    },
    
    async saveProfile() {
      if (!this.canSave || this.isSaving) return
      
      this.isSaving = true
      
      try {
        // 模拟保存延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 保存到本地存储
        uni.setStorageSync('userProfile', this.profileForm)
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
        
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-container {
  min-height: 100vh;
  background: #f9fafb;
  padding: 32rpx;
}

.avatar-section {
  text-align: center;
  margin-bottom: 48rpx;
  
  .avatar-container {
    position: relative;
    display: inline-block;
    margin-bottom: 24rpx;
    
    .avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 6px solid #fff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .avatar-edit {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 64rpx;
      height: 64rpx;
      background: #0ea5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 4px solid #fff;
      
      .edit-icon {
        font-size: 32rpx;
        color: #fff;
      }
    }
  }
  
  .avatar-hint {
    color: #6b7280;
    font-size: 28rpx;
  }
}

.form-section {
  margin-bottom: 160rpx;
  
  .form-card {
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 48rpx;
    
    .form-group {
      margin-bottom: 64rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .group-title {
        font-size: 36rpx;
        font-weight: 600;
        color: #374151;
        margin-bottom: 32rpx;
        padding-bottom: 16rpx;
        border-bottom: 2px solid #e0f2fe;
      }
      
      .form-item {
        margin-bottom: 32rpx;
        
        .label {
          display: block;
          font-size: 28rpx;
          font-weight: 500;
          color: #374151;
          margin-bottom: 16rpx;
        }
        
        .input, .textarea {
          width: 100%;
          padding: 24rpx 32rpx;
          border: 2px solid #e5e7eb;
          border-radius: 16rpx;
          font-size: 32rpx;
          background: #fff;
          transition: all 0.3s ease;
          
          &:focus {
            border-color: #0ea5e9;
            outline: none;
            box-shadow: 0 0 0 6rpx rgba(14, 165, 233, 0.1);
          }
        }
        
        .textarea {
          min-height: 160rpx;
          resize: none;
        }
        
        .picker-input {
          padding: 24rpx 32rpx;
          border: 2px solid #e5e7eb;
          border-radius: 16rpx;
          background: #fff;
          font-size: 32rpx;
          
          .placeholder {
            color: #9ca3af;
          }
        }
      }
    }
  }
}

.gender-options {
  display: flex;
  gap: 24rpx;
  
  .gender-item {
    flex: 1;
    padding: 24rpx;
    border: 2px solid #e5e7eb;
    border-radius: 16rpx;
    text-align: center;
    transition: all 0.3s ease;
    
    &.active {
      border-color: #0ea5e9;
      background: #e0f2fe;
      color: #0ea5e9;
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .tag-item {
    padding: 16rpx 24rpx;
    border: 2px solid #e5e7eb;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #374151;
    transition: all 0.3s ease;
    
    &.active {
      border-color: #0ea5e9;
      background: #0ea5e9;
      color: #fff;
    }
  }
}

.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 32rpx;
  border-top: 1px solid #e5e7eb;
  
  .save-button {
    width: 100%;
    padding: 32rpx;
    background: linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%);
    color: #fff;
    border: none;
    border-radius: 24rpx;
    font-size: 36rpx;
    font-weight: 600;
    box-shadow: 0 10px 15px rgba(14, 165, 233, 0.2);
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(2rpx);
    }
    
    &.disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>
