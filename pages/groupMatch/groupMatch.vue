<template>
  <view class="page-container">
    <!-- 头部区域 -->
    <view class="header-section">
      <view class="header-content">
        <text class="page-title">推荐群组</text>
        <text class="page-subtitle">根据你的兴趣发现新的学习群组</text>
      </view>
      <view class="header-decoration">
        <view class="decoration-circle circle-1"></view>
        <view class="decoration-circle circle-2"></view>
        <view class="decoration-circle circle-3"></view>
      </view>
    </view>

    <!-- 兴趣选择卡片 -->
    <modern-card class="interest-card" shadow="md">
      <view class="interest-header">
        <view class="interest-icon">🎯</view>
        <view class="interest-info">
          <text class="interest-title">选择你的兴趣领域</text>
          <text class="interest-desc">我们将为你推荐相关的学习小组</text>
        </view>
      </view>
      
      <view class="picker-container">
        <picker mode="selector" :range="interests" @change="selectInterest">
          <view class="custom-picker">
            <text class="picker-text">{{ selectedInterest || '点击选择兴趣领域' }}</text>
            <text class="picker-arrow">></text>
          </view>
        </picker>
      </view>
    </modern-card>

    <!-- 快速创建群组卡片 -->
    <modern-card class="create-group-card" shadow="md" :clickable="true" @tap="goToCreateGroup">
      <view class="create-content">
        <view class="create-icon">✨</view>
        <view class="create-info">
          <text class="create-title">找不到合适的群组？</text>
          <text class="create-desc">创建你自己的学习小组，邀请志同道合的伙伴</text>
        </view>
        <view class="create-arrow">›</view>
      </view>
    </modern-card>

    <!-- 推荐小组列表 -->
    <view class="groups-section" v-if="recommendedGroups.length > 0">
      <view class="section-header">
        <text class="section-title">为你推荐</text>
        <text class="section-count">{{ recommendedGroups.length }}个小组</text>
      </view>
      
      <view class="groups-grid">
        <modern-card 
          v-for="(group, index) in recommendedGroups" 
          :key="index"
          class="group-card"
          shadow="md"
          hover
        >
          <view class="group-header">
            <view class="group-avatar">
              <text class="avatar-text">{{ group.name.charAt(0) }}</text>
            </view>
            <view class="group-info">
              <text class="group-name">{{ group.name }}</text>
              <view class="group-tags">
                <text class="tag">{{ group.interest }}</text>
                <text class="tag">{{ group.level || '初级' }}</text>
              </view>
            </view>
            <view class="group-stats">
              <text class="member-count">{{ group.memberCount || 12 }}人</text>
            </view>
          </view>
          
          <view class="group-content">
            <text class="group-description">{{ group.description }}</text>
          </view>
          
          <view class="group-footer">
            <view class="group-meta">
              <text class="create-time">{{ group.createTime || '2天前创建' }}</text>
              <text class="activity">{{ group.activity || '活跃度高' }}</text>
            </view>
            <modern-button 
              type="primary" 
              size="small"
              @tap.stop="joinGroup(group)"
              @click.stop="joinGroup(group)"
              style="z-index: 999; position: relative;"
            >
              加入小组
            </modern-button>
            
            <!-- 备用原生按钮 -->
            <button 
              class="native-join-btn"
              @tap.stop="joinGroup(group)"
              @click.stop="joinGroup(group)"
            >
              备用按钮
            </button>
          </view>
        </modern-card>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="selectedInterest">
      <view class="empty-icon">🔍</view>
      <text class="empty-title">暂无推荐小组</text>
      <text class="empty-desc">该兴趣领域暂时没有合适的学习小组，请尝试其他兴趣</text>
      
      <!-- 测试按钮 -->
      <modern-button 
        type="primary" 
        @tap="testButtonClick"
        @click="testButtonClick"
        style="margin-top: 32rpx;"
      >
        测试按钮点击
      </modern-button>
    </view>

    <!-- 功能提示 -->
    <modern-card class="tips-card" v-if="!selectedInterest">
      <view class="tips-content">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">选择你感兴趣的领域，我们会推荐最合适的学习小组</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">👥</text>
          <text class="tip-text">加入小组后可以与志同道合的朋友一起学习</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📈</text>
          <text class="tip-text">通过小组学习，提高学习效率和积极性</text>
        </view>
      </view>
    </modern-card>
  </view>
</template>

<script>
import ModernCard from '../../components/ModernCard.vue'
import ModernButton from '../../components/ModernButton.vue'

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
    
    getGroups: function(category, limit, offset) {
      return this.callCloudFunction('getGroups', {
        category: category || null,
        limit: limit || 20,
        offset: offset || 0
      });
    },
    
    joinGroup: function(groupId) {
      if (!this.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return this.callCloudFunction('joinGroup', {
        groupId: groupId,
        userOpenid: this.currentUser.openid
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
  console.log('[群组匹配] 创建内联API实例');
  return createLocalAPI();
};

export default {
  components: {
    ModernCard,
    ModernButton
  },
  data() {
    return {
      selectedInterest: null,
      interests: ['编程技术', '语言学习', '考试备考', '兴趣爱好', '专业技能', '其他'],
      recommendedGroups: [],
      isLoading: false,
      error: null,
      currentUserId: null
    }
  },
  async onLoad() {
    console.log('[群组匹配] onLoad 开始');
    await this.initPageWithAuth();
  },
  methods: {
    // 集成认证管理器的页面初始化方法
    async initPageWithAuth() {
      try {
        console.log('[群组匹配] 开始页面认证初始化')
        
        // 1. 内联定义认证管理器（避免模块导入问题）
        const authManager = this.getAuthManager()
        
        // 2. 进行页面认证初始化（自动同步用户到Supabase）
        const userInfo = await authManager.initPageAuth({
          requireAuth: true,  // 群组匹配页面要求登录
          autoSync: true,     // 自动同步到Supabase
        })
        
        if (userInfo) {
          this.currentUserId = userInfo.id || userInfo.openid
          console.log('[群组匹配] 用户认证完成，已同步到Supabase:', userInfo)
          
          // 初始化 API 用户信息
          const learningGroupAPI = getLearningGroupAPI();
          if (learningGroupAPI) {
            learningGroupAPI.currentUser = userInfo;
            console.log('[群组匹配] API 用户信息已设置');
          }
          
          // 3. 加载推荐群组
          await this.loadRecommendedGroups()
        } else {
          console.log('[群组匹配] 用户认证失败，跳转到登录页')
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
        console.error('[群组匹配] 页面认证初始化失败:', error)
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
        console.log('[群组匹配] 初始化页面开始');
        
        // 检查登录状态 - 使用与StorageManager一致的键名
        const token = uni.getStorageSync('user_token');
        const userInfo = uni.getStorageSync('user_info');
        const isLoggedIn = uni.getStorageSync('is_logged_in');
        
        if (!token || !userInfo || !isLoggedIn) {
          console.log('[群组匹配] 用户未登录，跳转到登录页');
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
        this.currentUserId = userInfo.id || userInfo.openid;
        console.log('[群组匹配] 当前用户ID:', this.currentUserId);
        
        // 初始化 API 用户信息
        const learningGroupAPI = getLearningGroupAPI();
        if (learningGroupAPI) {
          learningGroupAPI.currentUser = userInfo;
          console.log('[群组匹配] API 用户信息已设置');
        }
        
        // 加载推荐群组
        await this.loadRecommendedGroups();
        
      } catch (error) {
        console.error('[群组匹配] 初始化页面失败:', error);
        uni.showToast({
          title: '初始化失败',
          icon: 'none'
        });
      }
    },
    
    async loadRecommendedGroups() {
      try {
        console.log('[群组匹配] 开始加载推荐群组');
        this.isLoading = true;
        this.error = null;
        
        const learningGroupAPI = getLearningGroupAPI();
        if (!learningGroupAPI) {
          throw new Error('API 服务不可用');
        }
        
        // 确保 API 实例有用户信息 - 使用与StorageManager一致的键名
        const userInfo = uni.getStorageSync('user_info');
        if (userInfo) {
          learningGroupAPI.currentUser = userInfo;
        }
        
        // 获取所有群组作为推荐
        const groups = await learningGroupAPI.getGroups(null, 20, 0);
        
        // 转换数据格式以匹配界面需求
        this.recommendedGroups = groups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description || '暂无描述',
          interest: group.category || 'general',
          memberCount: group.member_count ? group.member_count.length : 0,
          createTime: this.formatTime(group.created_at),
          activity: '活跃度高',
          level: '适合所有人'
        }));
        
        console.log('[群组匹配] 加载推荐群组成功，数量:', this.recommendedGroups.length);
        
      } catch (error) {
        console.error('[群组匹配] 加载推荐群组失败:', error);
        this.error = error.message;
        
        // 降级到模拟数据
        this.addTestGroups();
        
        uni.showToast({
          title: '加载推荐失败，显示示例数据',
          icon: 'none'
        });
        
      } finally {
        this.isLoading = false;
      }
    },
    
    async selectInterest(e) {
      const selectedIndex = e.detail.value;
      this.selectedInterest = this.interests[selectedIndex];
      console.log('[群组匹配] 选择兴趣:', this.selectedInterest);
      await this.searchGroupsByCategory();
    },
    
    async searchGroupsByCategory() {
      if (!this.selectedInterest) {
        return;
      }
      
      try {
        console.log('[群组匹配] 根据分类搜索群组:', this.selectedInterest);
        this.isLoading = true;
        
        const learningGroupAPI = getLearningGroupAPI();
        if (!learningGroupAPI) {
          throw new Error('API 服务不可用');
        }
        
        const categoryMap = {
          '编程技术': 'programming',
          '语言学习': 'language',
          '考试备考': 'exam',
          '兴趣爱好': 'hobby',
          '专业技能': 'skill',
          '其他': 'other'
        };
        
        const category = categoryMap[this.selectedInterest] || 'other';
        
        // 使用新API搜索群组
        const groups = await learningGroupAPI.getGroups(category, 20, 0);
        
        // 转换数据格式
        this.recommendedGroups = groups.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description || '暂无描述',
          interest: group.category || 'general',
          memberCount: group.member_count || 0,
          createTime: this.formatTime(group.created_at),
          activity: '活跃度高',
          level: '适合所有人'
        }));
        
        console.log('[群组匹配] 搜索群组成功，数量:', this.recommendedGroups.length);
        
      } catch (error) {
        console.error('[群组匹配] 搜索群组失败:', error);
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    testButtonClick() {
      console.log('[群组匹配] 测试按钮被点击了！');
      console.log('[群组匹配] 当前推荐群组数量:', this.recommendedGroups.length);
      console.log('[群组匹配] 推荐群组数据:', this.recommendedGroups);
      uni.showToast({
        title: '测试按钮工作正常！',
        icon: 'success'
      });
    },
    
    addTestGroups() {
      console.log('[群组匹配] 添加测试群组数据');
      this.recommendedGroups = [
        {
          id: 'test_group_1',
          name: 'Vue.js学习交流',
          description: 'Vue.js技术交流和项目分享',
          interest: '编程技术',
          level: '初级',
          memberCount: 33,
          createTime: '2天前创建',
          activity: '活跃度高'
        },
        {
          id: 'test_group_2',
          name: '设计师交流群',
          description: 'UI/UX设计师的学习和交流平台',
          interest: '设计',
          level: '初级',
          memberCount: 28,
          createTime: '2天前创建',
          activity: '活跃度高'
        }
      ];
      console.log('[群组匹配] 测试群组添加完成，数量:', this.recommendedGroups.length);
    },
    
    async joinGroup(group) {
      console.log('[群组匹配] 点击了加入群组按钮！', group);
      
      if (!this.currentUserId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      try {
        console.log('[群组匹配] 准备加入群组:', group.name);
        
        // 显示确认对话框
        const confirmResult = await new Promise((resolve) => {
          uni.showModal({
            title: '加入小组',
            content: `确定要加入「${group.name}」吗？`,
            success: (res) => {
              resolve(res.confirm);
            },
            fail: () => {
              resolve(false);
            }
          });
        });
        
        if (!confirmResult) {
          return;
        }
        
        // 显示加载提示
        uni.showLoading({
          title: '正在加入...'
        });
        
        const learningGroupAPI = getLearningGroupAPI();
        if (!learningGroupAPI) {
          throw new Error('API 服务不可用');
        }
        
        // 确保 API 实例有用户信息 - 使用与StorageManager一致的键名
        const userInfo = uni.getStorageSync('user_info');
        if (userInfo) {
          learningGroupAPI.currentUser = userInfo;
        }
        
        // 调用加入群组API
        await learningGroupAPI.joinGroup(group.id, this.currentUserId);
        
        uni.hideLoading();
        
        console.log('[群组匹配] 加入群组成功');
        
        // 显示成功提示
        uni.showToast({
          title: '加入成功！',
          icon: 'success',
          duration: 1500
        });
        
        // 延迟跳转到群组聊天室
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/groupChat/groupChat?groupId=${group.id}&groupName=${encodeURIComponent(group.name)}&justJoined=true`
          });
        }, 1500);
        
      } catch (error) {
        console.error('[群组匹配] 加入群组失败:', error);
        uni.hideLoading();
        
        let errorMessage = '加入失败';
        if (error.message) {
          if (error.message.includes('已经是群组成员')) {
            errorMessage = '您已经是该群组成员了';
          } else if (error.message.includes('群组人数已满')) {
            errorMessage = '群组人数已满';
          } else if (error.message.includes('群组不存在')) {
            errorMessage = '群组不存在';
          } else {
            errorMessage = error.message;
          }
        }
        
        uni.showToast({
          title: errorMessage,
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    /**
     * 格式化时间
     */
    formatTime(timeString) {
      if (!timeString) return '未知时间';
      
      try {
        const date = new Date(timeString);
        const now = new Date();
        const diff = now - date;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
          return `${days}天前创建`;
        } else if (hours > 0) {
          return `${hours}小时前创建`;
        } else if (minutes > 0) {
          return `${minutes}分钟前创建`;
        } else {
          return '刚刚创建';
        }
      } catch (error) {
        return '未知时间';
      }
    },
    
    /**
     * 跳转到创建群组页面
     */
    goToCreateGroup() {
      console.log('[群组匹配] 跳转到创建群组页面');
      uni.navigateTo({
        url: '/pages/createGroup/createGroup'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba($primary-50, 0.3), rgba($secondary-50, 0.3));
  padding: $space-4;
}

.header-section {
  position: relative;
  text-align: center;
  margin-bottom: $space-8;
  padding: $space-6 $space-4;
  overflow: hidden;
}

.header-content {
  position: relative;
  z-index: 2;
}

.page-title {
  display: block;
  font-size: $text-3xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.page-subtitle {
  display: block;
  font-size: $text-base;
  color: $text-secondary;
  line-height: 1.5;
}

.header-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  border-radius: $radius-full;
  opacity: 0.1;
  
  &.circle-1 {
    width: 200rpx;
    height: 200rpx;
    background: $primary-500;
    top: -50rpx;
    right: -50rpx;
    animation: float 6s ease-in-out infinite;
  }
  
  &.circle-2 {
    width: 120rpx;
    height: 120rpx;
    background: $secondary-500;
    bottom: -30rpx;
    left: -30rpx;
    animation: float 4s ease-in-out infinite reverse;
  }
  
  &.circle-3 {
    width: 80rpx;
    height: 80rpx;
    background: $accent-500;
    top: 50%;
    left: 10%;
    animation: float 5s ease-in-out infinite;
  }
}

.interest-card {
  margin-bottom: $space-6;
}

.interest-header {
  display: flex;
  align-items: center;
  margin-bottom: $space-4;
}

.interest-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $primary-500, $primary-600);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: $space-4;
}

.interest-info {
  flex: 1;
}

.interest-title {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-1;
}

.interest-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.picker-container {
  margin-top: $space-4;
}

.custom-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-4;
  background: rgba($primary-50, 0.5);
  border: 2rpx solid $border-light;
  border-radius: $radius-xl;
  transition: all $duration-200 $easing-smooth;
  
  &:active {
    background: rgba($primary-100, 0.7);
    border-color: $primary-300;
    transform: scale(0.98);
  }
}

.picker-text {
  font-size: $text-base;
  color: $text-primary;
  font-weight: $font-medium;
}

.picker-arrow {
  font-size: $text-lg;
  color: $primary-500;
  font-weight: $font-bold;
  transform: rotate(90deg);
  transition: transform $duration-200 $easing-smooth;
}

// 创建群组卡片样式
.create-group-card {
  margin-bottom: $space-6;
  border: 2rpx dashed $primary-300;
  background: linear-gradient(135deg, rgba($primary-50, 0.3), rgba($secondary-50, 0.2));
  transition: all $duration-300 $easing-smooth;
  
  &:active {
    transform: scale(0.98);
    border-color: $primary-500;
    background: linear-gradient(135deg, rgba($primary-100, 0.5), rgba($secondary-100, 0.3));
  }
}

.create-content {
  display: flex;
  align-items: center;
  padding: $space-4;
}

.create-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $secondary-400, $secondary-500);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: $space-4;
}

.create-info {
  flex: 1;
}

.create-title {
  display: block;
  font-size: $text-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-1;
}

.create-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.4;
}

.create-arrow {
  font-size: $text-xl;
  color: $primary-500;
  font-weight: $font-bold;
}

.groups-section {
  margin-bottom: $space-8;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $space-4;
  padding: 0 $space-2;
}

.section-title {
  font-size: $text-xl;
  font-weight: $font-bold;
  color: $text-primary;
}

.section-count {
  font-size: $text-sm;
  color: $text-secondary;
  background: rgba($primary-100, 0.6);
  padding: $space-1 $space-3;
  border-radius: $radius-full;
}

.groups-grid {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.group-card {
  transition: all $duration-300 $easing-smooth;
  
  &:hover {
    transform: translateY(-4rpx);
  }
}

.group-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: $space-4;
}

.group-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, $secondary-400, $secondary-600);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $space-3;
  flex-shrink: 0;
}

.avatar-text {
  font-size: $text-lg;
  font-weight: $font-bold;
  color: $surface-primary;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  display: block;
  font-size: $text-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
  line-height: 1.3;
}

.group-tags {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
}

.tag {
  font-size: $text-xs;
  color: $primary-600;
  background: rgba($primary-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
  border: 1rpx solid rgba($primary-300, 0.5);
}

.group-stats {
  text-align: right;
  flex-shrink: 0;
}

.member-count {
  font-size: $text-sm;
  color: $text-secondary;
  background: rgba($gray-100, 0.8);
  padding: $space-1 $space-2;
  border-radius: $radius-lg;
}

.group-content {
  margin-bottom: $space-4;
}

.group-description {
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.6;
}

.group-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: $space-3;
  border-top: 1rpx solid $border-light;
}

.group-meta {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.create-time,
.activity {
  font-size: $text-xs;
  color: $text-tertiary;
}

.empty-state {
  text-align: center;
  padding: $space-12 $space-4;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $space-4;
}

.empty-title {
  display: block;
  font-size: $text-xl;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: $space-2;
}

.empty-desc {
  display: block;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

.tips-card {
  margin-top: $space-6;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: $space-3;
}

.tip-icon {
  font-size: 32rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.tip-text {
  flex: 1;
  font-size: $text-sm;
  color: $text-secondary;
  line-height: 1.5;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

.native-join-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  margin-left: 16rpx;
  z-index: 1000;
  position: relative;
}
</style>
