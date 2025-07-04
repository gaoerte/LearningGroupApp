/**
 * 统一的用户认证管理器
 * 集成openid认证、Supabase同步、登录状态管理
 */

/**
 * 认证管理器类
 */
class AuthManager {
  constructor() {
    this.syncPromise = null; // 防止并发同步
  }

  /**
   * 检查当前登录状态
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    try {
      const token = uni.getStorageSync('user_token');
      const userInfo = uni.getStorageSync('user_info');
      const isLoggedIn = uni.getStorageSync('is_logged_in');
      
      return !!(token && userInfo && userInfo.openid && isLoggedIn);
    } catch (error) {
      console.error('[AuthManager] 检查登录状态失败:', error);
      return false;
    }
  }

  /**
   * 获取当前用户信息
   * @returns {Object|null} 用户信息
   */
  getCurrentUser() {
    try {
      if (!this.isLoggedIn()) {
        return null;
      }
      return uni.getStorageSync('user_info') || null;
    } catch (error) {
      console.error('[AuthManager] 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 获取用户openid
   * @returns {string|null} openid
   */
  getUserOpenid() {
    const userInfo = this.getCurrentUser();
    return userInfo ? userInfo.openid : null;
  }

  /**
   * 引导用户登录
   * @param {string} message 提示信息
   */
  requireLogin(message = '请先登录') {
    uni.showToast({ 
      title: message, 
      icon: 'none',
      duration: 2000
    });
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' });
    }, 2000);
  }

  /**
   * 检查用户是否在Supabase中存在
   * @param {string} openid 用户openid
   * @returns {Promise<boolean>} 是否存在
   */
  async checkUserInSupabase(openid = null) {
    try {
      const targetOpenid = openid || this.getUserOpenid();
      if (!targetOpenid) {
        console.log('[AuthManager] 无openid，跳过检查');
        return false;
      }
      
      console.log('[AuthManager] 检查用户是否存在于Supabase:', targetOpenid);
      
      const result = await new Promise((resolve, reject) => {
        uniCloud.callFunction({
          name: 'learningGroupAPI',
          data: {
            action: 'getUserInfo',
            openid: targetOpenid
          },
          success: (res) => {
            if (res.result && res.result.success) {
              console.log('[AuthManager] 用户存在于Supabase:', res.result.data);
              resolve(true);
            } else {
              console.log('[AuthManager] 用户不存在于Supabase');
              resolve(false);
            }
          },
          fail: (error) => {
            console.error('[AuthManager] 检查用户失败:', error);
            resolve(false);
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('[AuthManager] 检查用户异常:', error);
      return false;
    }
  }

  /**
   * 同步用户到Supabase
   * @param {Object} userInfo 用户信息（可选，默认使用当前用户）
   * @returns {Promise<Object>} 同步结果
   */
  async syncUserToSupabase(userInfo = null) {
    try {
      const targetUserInfo = userInfo || this.getCurrentUser();
      if (!targetUserInfo || !targetUserInfo.openid) {
        throw new Error('无用户信息或openid');
      }
      
      console.log('[AuthManager] 开始同步用户到Supabase:', targetUserInfo);
      
      const result = await new Promise((resolve, reject) => {
        uniCloud.callFunction({
          name: 'learningGroupAPI',
          data: {
            action: 'createUser',
            openid: targetUserInfo.openid,
            nickname: targetUserInfo.nickname || targetUserInfo.name || '微信用户',
            avatarUrl: targetUserInfo.avatar_url || targetUserInfo.avatarUrl || '',
            bio: targetUserInfo.bio || ''
          },
          success: (res) => {
            if (res.result && res.result.success) {
              console.log('[AuthManager] 用户同步成功:', res.result.data);
              resolve(res.result.data);
            } else {
              reject(new Error(res.result?.error || '同步用户失败'));
            }
          },
          fail: (error) => {
            console.error('[AuthManager] 同步用户失败:', error);
            reject(error);
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('[AuthManager] 同步用户异常:', error);
      throw error;
    }
  }

  /**
   * 确保用户已同步到Supabase（核心方法）
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async ensureUserSynced() {
    try {
      // 防止并发同步
      if (this.syncPromise) {
        console.log('[AuthManager] 等待现有同步完成...');
        return await this.syncPromise;
      }

      this.syncPromise = this._doEnsureUserSynced();
      const result = await this.syncPromise;
      this.syncPromise = null;
      return result;
    } catch (error) {
      this.syncPromise = null;
      throw error;
    }
  }

  /**
   * 实际执行用户同步逻辑
   * @private
   */
  async _doEnsureUserSynced() {
    console.log('[AuthManager] 开始确保用户已同步');
    
    // 1. 检查登录状态
    if (!this.isLoggedIn()) {
      console.log('[AuthManager] 用户未登录，跳过同步');
      return null;
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.openid) {
      console.log('[AuthManager] 无效用户信息，跳过同步');
      return null;
    }

    // 2. 检查用户是否已存在于Supabase
    const exists = await this.checkUserInSupabase(currentUser.openid);
    
    if (exists) {
      console.log('[AuthManager] 用户已存在于Supabase，无需同步');
      return currentUser;
    }
    
    // 3. 用户不存在，进行同步
    console.log('[AuthManager] 用户不存在于Supabase，开始同步...');
    try {
      const syncResult = await this.syncUserToSupabase(currentUser);
      
      // 4. 更新本地用户信息
      const updatedUserInfo = Object.assign({}, currentUser, syncResult);
      uni.setStorageSync('user_info', updatedUserInfo);
      
      console.log('[AuthManager] 用户同步完成，本地信息已更新:', updatedUserInfo);
      return updatedUserInfo;
    } catch (syncError) {
      console.error('[AuthManager] 用户同步失败:', syncError);
      // 同步失败时返回原用户信息，不影响页面功能
      return currentUser;
    }
  }

  /**
   * 页面初始化时的认证检查（推荐在所有页面onLoad中调用）
   * @param {Object} options 配置选项
   * @param {boolean} options.requireAuth 是否必须认证，默认true
   * @param {boolean} options.autoSync 是否自动同步到Supabase，默认true
   * @param {string} options.redirectUrl 认证失败时跳转的页面，默认登录页
   * @returns {Promise<Object|null>} 用户信息或null
   */
  async initPageAuth(options = {}) {
    const {
      requireAuth = true,
      autoSync = true,
      redirectUrl = '/pages/login/login'
    } = options;

    try {
      console.log('[AuthManager] 开始页面认证初始化');

      // 1. 检查登录状态
      if (!this.isLoggedIn()) {
        console.log('[AuthManager] 用户未登录');
        if (requireAuth) {
          this.requireLogin();
          return null;
        }
        return null;
      }

      // 2. 获取用户信息
      const userInfo = this.getCurrentUser();
      if (!userInfo) {
        console.log('[AuthManager] 获取用户信息失败');
        if (requireAuth) {
          this.requireLogin('用户信息获取失败，请重新登录');
          return null;
        }
        return null;
      }

      // 3. 自动同步到Supabase
      if (autoSync) {
        try {
          const syncedUser = await this.ensureUserSynced();
          console.log('[AuthManager] 页面认证初始化完成，用户已同步');
          return syncedUser;
        } catch (syncError) {
          console.warn('[AuthManager] 用户同步失败，但继续页面加载:', syncError.message);
          return userInfo; // 同步失败时返回本地用户信息
        }
      }

      console.log('[AuthManager] 页面认证初始化完成');
      return userInfo;

    } catch (error) {
      console.error('[AuthManager] 页面认证初始化失败:', error);
      if (requireAuth) {
        uni.showToast({
          title: '认证失败',
          icon: 'none'
        });
        setTimeout(() => {
          uni.reLaunch({ url: redirectUrl });
        }, 1500);
      }
      return null;
    }
  }

  /**
   * 清除认证信息（登出）
   */
  async logout() {
    try {
      console.log('[AuthManager] 开始登出');
      
      // 清除所有认证相关的存储
      uni.removeStorageSync('user_token');
      uni.removeStorageSync('user_info');
      uni.removeStorageSync('is_logged_in');
      
      // 清除同步状态
      this.syncPromise = null;
      
      console.log('[AuthManager] 登出完成');
      
      // 跳转到登录页
      uni.reLaunch({ url: '/pages/login/login' });
      
    } catch (error) {
      console.error('[AuthManager] 登出失败:', error);
    }
  }
}

// 创建全局实例
const authManager = new AuthManager();

// 导出工具函数（兼容现有代码）
export function isLoggedIn() {
  return authManager.isLoggedIn();
}

export function getCurrentUser() {
  return authManager.getCurrentUser();
}

export function requireLogin(message) {
  return authManager.requireLogin(message);
}

export function getUserOpenid() {
  return authManager.getUserOpenid();
}

export async function checkUserInSupabase(openid) {
  return await authManager.checkUserInSupabase(openid);
}

export async function syncUserToSupabase(userInfo) {
  return await authManager.syncUserToSupabase(userInfo);
}

export async function ensureUserSynced() {
  return await authManager.ensureUserSynced();
}

export async function initPageAuth(options) {
  return await authManager.initPageAuth(options);
}

export async function logout() {
  return await authManager.logout();
}

// 导出主要的AuthManager实例
export { authManager };
export default authManager;
