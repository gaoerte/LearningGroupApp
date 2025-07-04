<template>
  <view class="create-group-container">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="nav-bar">
        <text class="back-btn" @click="goBack">← 返回</text>
        <text class="title">创建学习小组</text>
        <view class="placeholder"></view>
      </view>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 群组名称 -->
      <view class="form-item">
        <text class="label">群组名称 *</text>
        <input 
          class="input"
          v-model="formData.name"
          placeholder="请输入群组名称（2-30字符）"
          maxlength="30"
        />
        <text class="char-count">{{ formData.name.length }}/30</text>
      </view>

      <!-- 群组描述 -->
      <view class="form-item">
        <text class="label">群组描述</text>
        <textarea 
          class="textarea"
          v-model="formData.description"
          placeholder="请描述你的学习小组，让更多志同道合的人找到你..."
          maxlength="200"
        />
        <text class="char-count">{{ formData.description.length }}/200</text>
      </view>

      <!-- 群组分类 -->
      <view class="form-item">
        <text class="label">群组分类 *</text>
        <picker 
          :value="categoryIndex" 
          :range="categories" 
          :range-key="'name'"
          @change="onCategoryChange"
        >
          <view class="picker">
            <text>{{ selectedCategory.name }}</text>
            <text class="arrow">></text>
          </view>
        </picker>
      </view>

      <!-- 群组设置 -->
      <view class="form-item">
        <text class="label">群组设置</text>
        <view class="settings">
          <view class="setting-item">
            <text>公开群组</text>
            <switch :checked="formData.isPublic" @change="onPublicChange" />
          </view>
          <text class="setting-desc">公开群组会在推荐列表中显示</text>
        </view>
      </view>

      <!-- 最大成员数 -->
      <view class="form-item">
        <text class="label">最大成员数</text>
        <view class="member-count">
          <button class="count-btn" @click="decreaseMemberCount">-</button>
          <text class="count">{{ formData.maxMembers }}</text>
          <button class="count-btn" @click="increaseMemberCount">+</button>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button 
        class="create-btn" 
        :class="{ disabled: !canCreate }"
        :disabled="!canCreate"
        @click="createGroup"
      >
        {{ isCreating ? '创建中...' : '创建群组' }}
      </button>
    </view>
  </view>
</template>

<script>
// 内联 API 定义 - 避免模块导入问题
function createLocalAPI() {
  return {
    cloudFunctionName: 'learningGroupAPI',
    currentUser: null,
    
    callCloudFunction: function(action, params) {
      params = params || {};
      
      return new Promise(function(resolve, reject) {
        console.log('[API] 调用云函数 ' + action + ':', params);
        
        uniCloud.callFunction({
          name: 'learningGroupAPI',
          data: Object.assign({ action: action }, params)
        }).then(function(result) {
          console.log('[API] ' + action + ' 云函数响应:', result);
          
          if (result.result && result.result.success) {
            resolve(result.result.data);
          } else {
            reject(new Error((result.result && result.result.error) || '调用失败'));
          }
        }).catch(function(error) {
          console.error('[API] ' + action + ' 云函数调用失败:', error);
          reject(error);
        });
      });
    },
    
    createGroup: function(groupData) {
      if (!this.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return this.callCloudFunction('createGroup', Object.assign({}, groupData, {
        creatorOpenid: this.currentUser.openid
      }));
    },
    
    // 添加检查用户是否存在的方法
    checkUserExists: function() {
      if (!this.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return this.callCloudFunction('getUserInfo', {
        openid: this.currentUser.openid
      });
    },
    
    // 添加创建用户的方法
    ensureUserExists: function() {
      if (!this.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return this.callCloudFunction('createUser', {
        openid: this.currentUser.openid,
        nickname: this.currentUser.nickname || this.currentUser.name || '微信用户',
        avatarUrl: this.currentUser.avatar_url || this.currentUser.avatarUrl || ''
      });
    },
    
    getCurrentUser: function() {
      return this.currentUser;
    },
    
    isLoggedIn: function() {
      return this.currentUser !== null;
    }
  };
}

// 用户认证工具函数 - 内联定义，与StorageManager保持一致
function isLoggedIn() {
  try {
    const token = uni.getStorageSync('user_token');
    const userInfo = uni.getStorageSync('user_info');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    return !!(token && userInfo && isLoggedIn);
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}

function getCurrentUser() {
  try {
    const userInfo = uni.getStorageSync('user_info');
    return userInfo || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

function getToken() {
  try {
    return uni.getStorageSync('user_token') || null;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
}

function requireLogin(message = '请先登录') {
  uni.showToast({
    title: message,
    icon: 'none'
  });
  
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/login/login'
    });
  }, 1500);
}

// 用户同步工具函数 - 内联定义
async function autoSyncUser() {
  try {
    console.log('[用户同步] 自动检查用户同步状态');
    
    const token = uni.getStorageSync('user_token');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    if (!token || !isLoggedIn) {
      console.log('[用户同步] 用户未登录，跳过同步');
      return null;
    }
    
    const userInfo = uni.getStorageSync('user_info');
    if (!userInfo || !userInfo.openid) {
      console.log('[用户同步] 本地无用户信息');
      return null;
    }
    
    // 检查用户是否在Supabase中存在
    const exists = await checkUserInSupabase(userInfo.openid);
    
    if (exists) {
      console.log('[用户同步] 用户已存在，无需同步');
      return userInfo;
    }
    
    // 用户不存在，进行同步
    console.log('[用户同步] 用户不存在，开始同步...');
    const syncResult = await syncUserToSupabase(userInfo);
    
    console.log('[用户同步] 用户同步完成:', syncResult);
    return syncResult;
    
  } catch (error) {
    console.warn('[用户同步] 自动同步失败，但不影响页面功能:', error.message);
    return null;
  }
}

async function checkUserInSupabase(openid) {
  try {
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'getUserInfo',
          openid: openid
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: (error) => {
          console.error('[用户同步] 检查用户失败:', error);
          resolve(false);
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error('[用户同步] 检查用户异常:', error);
    return false;
  }
}

async function syncUserToSupabase(userInfo) {
  try {
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'createUser',
          openid: userInfo.openid,
          nickname: userInfo.nickname || userInfo.name || '微信用户',
          avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || '',
          bio: userInfo.bio || ''
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(res.result.data);
          } else {
            reject(new Error(res.result?.error || '同步用户失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
    
    return result;
  } catch (error) {
    console.error('[用户同步] 同步用户异常:', error);
    throw error;
  }
}

// 获取 API 实例
const getLearningGroupAPI = () => {
  console.log('[创建群组] 创建内联API实例');
  return createLocalAPI();
};

export default {
  data() {
    return {
      formData: {
        name: '',
        description: '',
        category: 'programming',
        isPublic: true,
        maxMembers: 50
      },
      categories: [
        { key: 'programming', name: '编程技术' },
        { key: 'design', name: 'UI设计' },
        { key: 'algorithm', name: '算法学习' },
        { key: 'language', name: '语言学习' },
        { key: 'exam', name: '考试备考' },
        { key: 'hobby', name: '兴趣爱好' },
        { key: 'skill', name: '专业技能' },
        { key: 'other', name: '其他' }
      ],
      categoryIndex: 0,
      isCreating: false,
      currentUser: null
    }
  },
  
  computed: {
    selectedCategory() {
      return this.categories[this.categoryIndex] || this.categories[0]
    },
    
    canCreate() {
      return this.formData.name.trim().length >= 2 && 
             this.formData.name.trim().length <= 30 &&
             !this.isCreating
    }
  },
  
  async onLoad() {
    console.log('[创建群组] 页面加载')
    await this.initPageWithAuth()
  },
  
  methods: {
  // 集成认证管理器的页面初始化方法
  async initPageWithAuth() {
    try {
      console.log('[创建群组] 开始页面认证初始化')
      
      // 1. 内联定义认证管理器（避免模块导入问题）
      const authManager = this.getAuthManager()
      
      // 2. 进行页面认证初始化（自动同步用户到Supabase）
      const userInfo = await authManager.initPageAuth({
        requireAuth: true,  // 创建群组页面要求登录
        autoSync: true,     // 自动同步到Supabase
      })
      
      if (userInfo) {
        this.currentUser = userInfo
        console.log('[创建群组] 用户认证完成，已同步到Supabase:', userInfo)
        
        // 初始化 API 用户信息
        const learningGroupAPI = getLearningGroupAPI();
        if (learningGroupAPI) {
          learningGroupAPI.currentUser = this.currentUser;
          console.log('[创建群组] API 用户信息已设置');
        }
        
        // 设置默认分类
        this.formData.category = this.selectedCategory.key;
        
        console.log('[创建群组] 页面初始化完成');
      } else {
        console.log('[创建群组] 用户认证失败，跳转到登录页')
        requireLogin()
      }
      
    } catch (error) {
      console.error('[创建群组] 页面认证初始化失败:', error)
      uni.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    }
  },
  
  // 内联认证管理器（避免模块导入问题）
  getAuthManager() {
    return {
      isLoggedIn() {
        try {
          const token = uni.getStorageSync('user_token')
          const userInfo = uni.getStorageSync('user_info')
          const isLoggedIn = uni.getStorageSync('is_logged_in')
          return !!(token && userInfo && userInfo.openid && isLoggedIn)
        } catch (error) {
          console.error('[AuthManager] 检查登录状态失败:', error)
          return false
        }
      },
      
      getCurrentUser() {
        try {
          if (!this.isLoggedIn()) {
            return null
          }
          return uni.getStorageSync('user_info') || null
        } catch (error) {
          console.error('[AuthManager] 获取用户信息失败:', error)
          return null
        }
      },
      
      async checkUserInSupabase(openid) {
        try {
          console.log('[AuthManager] 检查用户是否存在于Supabase:', openid)
          
          const result = await new Promise((resolve, reject) => {
            uniCloud.callFunction({
              name: 'learningGroupAPI',
              data: {
                action: 'getUserInfo',
                openid: openid
              },
              success: (res) => {
                if (res.result && res.result.success) {
                  console.log('[AuthManager] 用户存在于Supabase:', res.result.data)
                  resolve(true)
                } else {
                  console.log('[AuthManager] 用户不存在于Supabase')
                  resolve(false)
                }
              },
              fail: (error) => {
                console.error('[AuthManager] 检查用户失败:', error)
                resolve(false)
              }
            })
          })
          
          return result
        } catch (error) {
          console.error('[AuthManager] 检查用户异常:', error)
          return false
        }
      },
      
      async syncUserToSupabase(userInfo) {
        try {
          console.log('[AuthManager] 开始同步用户到Supabase:', userInfo)
          
          const result = await new Promise((resolve, reject) => {
            uniCloud.callFunction({
              name: 'learningGroupAPI',
              data: {
                action: 'createUser',
                openid: userInfo.openid,
                nickname: userInfo.nickname || userInfo.name || '微信用户',
                avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || '',
                bio: userInfo.bio || ''
              },
              success: (res) => {
                if (res.result && res.result.success) {
                  console.log('[AuthManager] 用户同步成功:', res.result.data)
                  resolve(res.result.data)
                } else {
                  reject(new Error(res.result?.error || '同步用户失败'))
                }
              },
              fail: (error) => {
                console.error('[AuthManager] 同步用户失败:', error)
                reject(error)
              }
            })
          })
          
          return result
        } catch (error) {
          console.error('[AuthManager] 同步用户异常:', error)
          throw error
        }
      },
      
      async ensureUserSynced() {
        console.log('[AuthManager] 开始确保用户已同步')
        
        // 1. 检查登录状态
        if (!this.isLoggedIn()) {
          console.log('[AuthManager] 用户未登录，跳过同步')
          return null
        }

        const currentUser = this.getCurrentUser()
        if (!currentUser || !currentUser.openid) {
          console.log('[AuthManager] 无效用户信息，跳过同步')
          return null
        }

        // 2. 检查用户是否已存在于Supabase
        const exists = await this.checkUserInSupabase(currentUser.openid)
        
        if (exists) {
          console.log('[AuthManager] 用户已存在于Supabase，无需同步')
          return currentUser
        }
        
        // 3. 用户不存在，进行同步
        console.log('[AuthManager] 用户不存在于Supabase，开始同步...')
        try {
          const syncResult = await this.syncUserToSupabase(currentUser)
          
          // 4. 更新本地用户信息
          const updatedUserInfo = Object.assign({}, currentUser, syncResult)
          uni.setStorageSync('user_info', updatedUserInfo)
          
          console.log('[AuthManager] 用户同步完成，本地信息已更新:', updatedUserInfo)
          return updatedUserInfo
        } catch (syncError) {
          console.error('[AuthManager] 用户同步失败:', syncError)
          // 同步失败时返回原用户信息，不影响页面功能
          return currentUser
        }
      },
      
      async initPageAuth(options = {}) {
        const {
          requireAuth = true,
          autoSync = true,
        } = options

        try {
          console.log('[AuthManager] 开始页面认证初始化')

          // 1. 检查登录状态
          if (!this.isLoggedIn()) {
            console.log('[AuthManager] 用户未登录')
            return null
          }

          // 2. 获取用户信息
          const userInfo = this.getCurrentUser()
          if (!userInfo) {
            console.log('[AuthManager] 获取用户信息失败')
            return null
          }

          // 3. 自动同步到Supabase
          if (autoSync) {
            try {
              const syncedUser = await this.ensureUserSynced()
              console.log('[AuthManager] 页面认证初始化完成，用户已同步')
              return syncedUser
            } catch (syncError) {
              console.warn('[AuthManager] 用户同步失败，但继续页面加载:', syncError.message)
              return userInfo // 同步失败时返回本地用户信息
            }
          }

          console.log('[AuthManager] 页面认证初始化完成')
          return userInfo

        } catch (error) {
          console.error('[AuthManager] 页面认证初始化失败:', error)
          return null
        }
      }
    }
  },
  async initPage() {
    try {
      console.log('[创建群组] 开始初始化页面');
      
      // 检查登录状态
      if (!isLoggedIn()) {
        console.log('[创建群组] 用户未登录');
        requireLogin();
        return;
      }
      
      // 获取用户信息
      const userInfo = getCurrentUser();
      if (!userInfo) {
        console.log('[创建群组] 无法获取用户信息');
        requireLogin('用户信息获取失败，请重新登录');
        return;
      }
      
      // 自动检查并同步用户到Supabase
      try {
        console.log('[创建群组] 检查用户同步状态...');
        await autoSyncUser();
        console.log('[创建群组] 用户同步检查完成');
      } catch (syncError) {
        console.warn('[创建群组] 用户同步检查失败，但继续初始化:', syncError.message);
      }
      
      // 设置用户信息
      this.currentUser = userInfo;
      console.log('[创建群组] 当前用户:', this.currentUser);
      
      // 初始化 API 实例
      const learningGroupAPI = getLearningGroupAPI();
      if (learningGroupAPI) {
        learningGroupAPI.currentUser = userInfo;
        console.log('[创建群组] API 用户信息已设置');
      }
      
      // 设置默认分类
      this.formData.category = this.selectedCategory.key;
      
      console.log('[创建群组] 页面初始化完成');
      
    } catch (error) {
      console.error('[创建群组] 初始化失败:', error);
      uni.showToast({
        title: '初始化失败',
        icon: 'none'
      });
    }
  },
    
    onCategoryChange(e) {
      this.categoryIndex = parseInt(e.detail.value)
      this.formData.category = this.selectedCategory.key
      console.log('[创建群组] 选择分类:', this.selectedCategory)
    },
    
    onPublicChange(e) {
      this.formData.isPublic = e.detail.value
    },
    
    decreaseMemberCount() {
      if (this.formData.maxMembers > 10) {
        this.formData.maxMembers -= 10
      }
    },
    
    increaseMemberCount() {
      if (this.formData.maxMembers < 200) {
        this.formData.maxMembers += 10
      }
    },
    
    async createGroup() {
      if (!this.canCreate) {
        return
      }
      
      try {
        console.log('[创建群组] 开始创建:', this.formData)
        this.isCreating = true
        
        // 验证数据
        if (!this.formData.name.trim()) {
          throw new Error('请输入群组名称')
        }
        
        if (this.formData.name.trim().length < 2) {
          throw new Error('群组名称至少需要2个字符')
        }
        
        // 再次检查用户登录状态
        if (!this.currentUser) {
          const userInfo = getCurrentUser();
          if (!userInfo) {
            throw new Error('用户未登录，请重新登录');
          }
          this.currentUser = userInfo;
        }
        
        console.log('[创建群组] 当前用户信息:', this.currentUser);
        
        const learningGroupAPI = getLearningGroupAPI();
        if (!learningGroupAPI) {
          throw new Error('API 服务不可用');
        }
        
        // 确保 API 实例有用户信息
        learningGroupAPI.currentUser = this.currentUser;
        
        // 先确保用户在数据库中存在
        try {
          console.log('[创建群组] 检查用户是否存在...');
          await learningGroupAPI.checkUserExists();
          console.log('[创建群组] 用户已存在');
        } catch (userCheckError) {
          console.log('[创建群组] 用户不存在，创建用户...', userCheckError.message);
          try {
            const newUser = await learningGroupAPI.ensureUserExists();
            console.log('[创建群组] 用户创建成功:', newUser);
          } catch (createUserError) {
            console.error('[创建群组] 创建用户失败:', createUserError);
            throw new Error('用户信息初始化失败，请重试');
          }
        }
        
        // 调用创建API
        const groupData = {
          name: this.formData.name.trim(),
          description: this.formData.description.trim(),
          category: this.formData.category,
          isPublic: this.formData.isPublic,
          maxMembers: this.formData.maxMembers,
          creatorOpenid: this.currentUser.openid
        }
        
        console.log('[创建群组] 提交数据:', groupData)
        
        const result = await learningGroupAPI.createGroup(groupData)
        
        console.log('[创建群组] 创建成功:', result)
        
        // 显示成功提示
        uni.showToast({
          title: '群组创建成功！',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟跳转到群组聊天页面
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/groupChat/groupChat?groupId=${result.id}&groupName=${encodeURIComponent(result.name)}&isCreator=true`
          })
        }, 2000)
        
      } catch (error) {
        console.error('[创建群组] 创建失败:', error)
        
        let errorMessage = '创建失败'
        if (error.message) {
          if (error.message.includes('duplicate') || error.message.includes('重复')) {
            errorMessage = '群组名称已存在'
          } else if (error.message.includes('permission') || error.message.includes('权限')) {
            errorMessage = '没有创建权限'
          } else {
            errorMessage = error.message
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 3000
        })
        
      } finally {
        this.isCreating = false
      }
    },
    
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style scoped>
.create-group-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 100rpx;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding-top: var(--status-bar-height);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  height: 88rpx;
}

.back-btn {
  color: white;
  font-size: 32rpx;
  font-weight: 500;
}

.title {
  color: white;
  font-size: 36rpx;
  font-weight: 600;
}

.placeholder {
  width: 120rpx;
}

.form-container {
  padding: 40rpx;
}

.form-item {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.label {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.input, .textarea {
  width: 100%;
  font-size: 30rpx;
  color: #333;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  box-sizing: border-box;
}

.input {
  height: 80rpx;
}

.textarea {
  height: 160rpx;
  resize: none;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  background: #fafafa;
}

.arrow {
  color: #999;
  transform: rotate(90deg);
}

.settings {
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.setting-desc {
  font-size: 24rpx;
  color: #999;
}

.member-count {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}

.count-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #667eea;
  color: white;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
}

.count {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  min-width: 60rpx;
  text-align: center;
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid #eee;
}

.create-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.create-btn.disabled {
  background: #ccc;
  color: #999;
}
</style>
