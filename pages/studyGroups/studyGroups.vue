<template>
  <view class="groups-container">
    <!-- 顶部欢迎区域 -->
    <view class="welcome-section">
      <view class="welcome-content">
        <text class="welcome-title">学习群组</text>
        <text class="welcome-subtitle">加入学习群组，与志同道合的伙伴一起进步</text>
      </view>
    </view>

    <!-- 三个主要功能按钮 -->
    <view class="main-actions">
      <ModernCard 
        class="action-card my-groups-card"
        :clickable="true"
        @tap="goToMyGroups"
      >
        <view class="action-content">
          <view class="action-icon">📚</view>
          <view class="action-info">
            <text class="action-title">我的群组</text>
            <text class="action-desc">查看已加入的学习群组</text>
            <text class="action-count">{{ joinedGroupsCount }}个群组</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>

      <ModernCard 
        class="action-card recommend-card"
        :clickable="true"
        @tap="goToRecommendGroups"
      >
        <view class="action-content">
          <view class="action-icon">🔍</view>
          <view class="action-info">
            <text class="action-title">推荐群组</text>
            <text class="action-desc">发现适合你的学习群组</text>
            <text class="action-count">精准推荐</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>

      <ModernCard 
        class="action-card create-card"
        :clickable="true"
        @tap="showCreateGroupTip"
      >
        <view class="action-content">
          <view class="action-icon">➕</view>
          <view class="action-info">
            <text class="action-title">创建群组</text>
            <text class="action-desc">创建属于自己的学习群组</text>
            <text class="action-count">敬请期待</text>
          </view>
          <view class="action-arrow">›</view>
        </view>
      </ModernCard>
    </view>

    <!-- 快速统计 -->
    <view class="stats-section">
      <view class="stats-card">
        <text class="stats-number">{{ totalMembers }}</text>
        <text class="stats-label">群组成员</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ activeGroups }}</text>
        <text class="stats-label">活跃群组</text>
      </view>
      <view class="stats-card">
        <text class="stats-number">{{ todayMessages }}</text>
        <text class="stats-label">今日消息</text>
      </view>
    </view>

    <!-- Loading状态 -->
    <LoadingSpinner v-if="isLoading" text="加载中..." />

    <!-- 错误状态 -->
    <view v-if="error" class="error-state">
      <text class="error-text">{{ error }}</text>
      <ModernButton @tap="retryLoad" variant="outline" size="sm">
        重试
      </ModernButton>
    </view>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

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
    
    initCurrentUser: function() {
      var self = this;
      return this.getWechatUserInfo().then(function(userInfo) {
        return self.callCloudFunction('createUser', {
          openid: userInfo.openid,
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }).then(function(user) {
          self.currentUser = user;
          console.log('[API] 当前用户初始化成功:', self.currentUser);
          return self.currentUser;
        });
      });
    },
    
    getWechatUserInfo: function() {
      return Promise.resolve({
        openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
        nickName: '用户' + Math.floor(Math.random() * 1000),
        avatarUrl: '/static/default-avatar.png'
      });
    },
    
    getGroups: function(category, limit, offset) {
      return this.callCloudFunction('getGroups', {
        category: category || null,
        limit: limit || 20,
        offset: offset || 0
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

// 获取 API 实例
const getLearningGroupAPI = () => {
  console.log('[群组主页] 创建内联API实例');
  return createLocalAPI();
};

export default {
  components: {
    ModernCard,
    ModernButton,
    LoadingSpinner
  },
  data() {
    return {
      // 当前用户
      currentUser: null,
      
      // 统计数据
      joinedGroupsCount: 0,
      totalMembers: 0,
      activeGroups: 0,
      todayMessages: 0,
      
      // 状态
      isLoading: false,
      error: null
    }
  },
  methods: {
    async onLoad() {
      console.log('[群组主页] onLoad 开始')
      await this.initPageWithAuth()
    },
    onShow() {
      console.log('[群组主页] onShow 开始')
      this.loadStats()
    },
    
    // 集成认证管理器的页面初始化方法
    async initPageWithAuth() {
      try {
        console.log('[群组主页] 开始页面认证初始化')
        
        // 1. 内联定义认证管理器（避免模块导入问题）
        const authManager = this.getAuthManager()
        
        // 2. 进行页面认证初始化（自动同步用户到Supabase）
        const userInfo = await authManager.initPageAuth({
          requireAuth: true,  // 群组页面要求登录
          autoSync: true,     // 自动同步到Supabase
        })
        
        if (userInfo) {
          this.currentUser = userInfo
          console.log('[群组主页] 用户认证完成，已同步到Supabase:', userInfo)
          
          // 初始化 API 用户信息
          const learningGroupAPI = getLearningGroupAPI();
          if (learningGroupAPI) {
            learningGroupAPI.currentUser = this.currentUser;
            console.log('[群组主页] API 用户信息已设置');
          }
          
          // 3. 加载统计数据
          await this.loadStats()
        } else {
          console.log('[群组主页] 用户认证失败，跳转到登录页')
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
        }
        
      } catch (error) {
        console.error('[群组主页] 页面认证初始化失败:', error)
        this.error = error.message
        uni.showToast({
          title: '页面初始化失败: ' + error.message,
          icon: 'none'
        })
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
        console.log('[群组主页] initPage 开始执行')
        
        // 检查登录状态 - 使用与StorageManager一致的键名
        const token = uni.getStorageSync('user_token');
        const userInfo = uni.getStorageSync('user_info');
        const isLoggedIn = uni.getStorageSync('is_logged_in');
        
        if (!token || !userInfo || !isLoggedIn) {
          console.log('[群组主页] 用户未登录，跳转到登录页');
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
          return;
        }
        
        // 设置用户信息
        this.currentUser = userInfo;
        console.log('[群组主页] 当前用户:', this.currentUser);
        
        // 初始化 API 用户信息
        const learningGroupAPI = getLearningGroupAPI();
        if (learningGroupAPI) {
          learningGroupAPI.currentUser = this.currentUser;
          console.log('[群组主页] API 用户信息已设置');
        }
        
        // 加载统计数据
        await this.loadStats()
        
      } catch (error) {
        console.error('[群组主页] 初始化失败:', error)
        this.error = error.message
        uni.showToast({
          title: '页面初始化失败: ' + error.message,
          icon: 'none'
        })
      }
    },
    
    async loadStats() {
      if (!this.currentUser) return
      
      try {
        this.isLoading = true
        this.error = null
        
        console.log('[群组主页] 开始加载统计数据...')
        
        const learningGroupAPI = getLearningGroupAPI();
        if (!learningGroupAPI) {
          throw new Error('API 服务不可用');
        }
        
        // 确保 API 实例有用户信息 - 使用与StorageManager一致的键名
        const userInfo = uni.getStorageSync('user_info');
        if (userInfo) {
          learningGroupAPI.currentUser = userInfo;
        }
        
        // 获取所有群组列表
        const allGroups = await learningGroupAPI.getGroups(null, 100, 0)
        console.log('[群组主页] 获取群组列表:', allGroups)
        
        // 计算统计数据
        this.joinedGroupsCount = allGroups.length
        this.activeGroups = allGroups.filter(group => group.member_count && group.member_count.length > 0).length
        this.totalMembers = allGroups.reduce((total, group) => {
          return total + (group.member_count ? group.member_count.length : 0)
        }, 0)
        this.todayMessages = Math.floor(Math.random() * 50) + 10 // 临时模拟
        
        console.log('[群组主页] 统计数据加载完成:', {
          joinedGroupsCount: this.joinedGroupsCount,
          activeGroups: this.activeGroups,
          totalMembers: this.totalMembers,
          todayMessages: this.todayMessages
        })
        
      } catch (error) {
        console.error('[群组主页] 加载统计失败:', error)
        this.error = error.message
        
        // 降级到默认值
        this.joinedGroupsCount = 0
        this.activeGroups = 0
        this.totalMembers = 0
        this.todayMessages = 0
      } finally {
        this.isLoading = false
      }
    },
    
    // 跳转到我的群组页面
    goToMyGroups() {
      console.log('[群组主页] 跳转到我的群组')
      uni.navigateTo({
        url: '/pages/myGroups/myGroups'
      })
    },
    
    // 跳转到推荐群组页面
    goToRecommendGroups() {
      console.log('[群组主页] 跳转到推荐群组')
      uni.navigateTo({
        url: '/pages/groupMatch/groupMatch'
      })
    },
    
    // 创建群组
    showCreateGroupTip() {
      console.log('[学习群组] 跳转到创建群组页面')
      uni.navigateTo({
        url: '/pages/createGroup/createGroup'
      })
    },
    
    // 重试加载
    retryLoad() {
      this.loadStats()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.groups-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: $space-4;
}

.welcome-section {
  text-align: center;
  margin-bottom: $space-8;
  padding-top: $space-6;
}

.welcome-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
}

.welcome-title {
  font-size: $text-2xl;
  font-weight: $font-bold;
  color: $white;
  margin-bottom: $space-2;
}

.welcome-subtitle {
  font-size: $text-base;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.main-actions {
  display: flex;
  flex-direction: column;
  gap: $space-4;
  margin-bottom: $space-8;
}

.action-card {
  padding: $space-6;
  border-radius: $radius-xl;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  align-items: center;
  gap: $space-4;
}

.action-icon {
  font-size: 48rpx;
  width: 80rpx;
  text-align: center;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.action-title {
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $gray-800;
}

.action-desc {
  font-size: $text-sm;
  color: $gray-600;
  line-height: 1.4;
}

.action-count {
  font-size: $text-xs;
  color: $primary-600;
  font-weight: $font-medium;
}

.action-arrow {
  font-size: $text-xl;
  color: $gray-400;
  font-weight: $font-light;
}

.my-groups-card {
  border-left: 6rpx solid $primary-500;
}

.recommend-card {
  border-left: 6rpx solid $success-500;
}

.create-card {
  border-left: 6rpx solid $accent-500;
}

.stats-section {
  display: flex;
  justify-content: space-between;
  gap: $space-3;
  margin-bottom: $space-6;
}

.stats-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: $radius-lg;
  padding: $space-4;
  text-align: center;
  backdrop-filter: blur(5px);
}

.stats-number {
  display: block;
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $primary-600;
  margin-bottom: $space-1;
}

.stats-label {
  font-size: $text-xs;
  color: $gray-600;
}

.error-state {
  text-align: center;
  padding: $space-8;
  background: rgba(255, 255, 255, 0.9);
  border-radius: $radius-lg;
  margin-top: $space-4;
}

.error-text {
  display: block;
  color: $error-600;
  font-size: $text-sm;
  margin-bottom: $space-4;
}
</style>
