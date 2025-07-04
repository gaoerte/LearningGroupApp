/**
 * 用户认证和登录状态管理工具
 * 统一处理所有页面的登录状态检查和用户信息获取
 */

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  try {
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    return !!(token && userInfo);
  } catch (error) {
    console.error('检查登录状态失败:', error);
    return false;
  }
}

/**
 * 获取当前用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getCurrentUser() {
  try {
    const userInfo = uni.getStorageSync('userInfo');
    return userInfo || null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

/**
 * 获取当前用户的认证token
 * @returns {string|null} token或null
 */
export function getToken() {
  try {
    return uni.getStorageSync('token') || null;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
}

/**
 * 保存用户信息和token
 * @param {Object} userInfo 用户信息
 * @param {string} token 认证token
 */
export function setUserSession(userInfo, token) {
  try {
    uni.setStorageSync('userInfo', userInfo);
    uni.setStorageSync('token', token);
    console.log('用户会话已保存:', userInfo);
  } catch (error) {
    console.error('保存用户会话失败:', error);
    throw error;
  }
}

/**
 * 清除用户会话信息
 */
export function clearUserSession() {
  try {
    uni.removeStorageSync('userInfo');
    uni.removeStorageSync('token');
    console.log('用户会话已清除');
  } catch (error) {
    console.error('清除用户会话失败:', error);
  }
}

/**
 * 检查登录状态，如果未登录则跳转到登录页
 * @param {Object} options 配置选项
 * @param {boolean} options.showToast 是否显示提示消息，默认true
 * @param {boolean} options.redirect 是否立即跳转，默认true
 * @param {string} options.message 提示消息，默认"请先登录"
 * @returns {boolean} 是否已登录
 */
export function requireLogin(options = {}) {
  const {
    showToast = true,
    redirect = true,
    message = '请先登录'
  } = options;
  
  if (isLoggedIn()) {
    return true;
  }
  
  if (showToast) {
    uni.showToast({
      title: message,
      icon: 'none'
    });
  }
  
  if (redirect) {
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/login'
      });
    }, 1500);
  }
  
  return false;
}

/**
 * 在页面中初始化API实例的用户信息
 * @param {Object} apiInstance API实例
 * @returns {Object|null} 用户信息或null
 */
export function initAPIUser(apiInstance) {
  if (!apiInstance) {
    console.warn('API实例为空，无法初始化用户信息');
    return null;
  }
  
  const userInfo = getCurrentUser();
  if (userInfo) {
    apiInstance.currentUser = userInfo;
    console.log('API实例用户信息已初始化:', userInfo);
  } else {
    console.warn('无法获取用户信息，API实例未初始化');
  }
  
  return userInfo;
}

/**
 * 页面通用初始化方法
 * 检查登录状态，初始化API实例，返回用户信息
 * @param {Object} options 配置选项
 * @param {Function} options.getAPI 获取API实例的方法
 * @param {string} options.pageName 页面名称，用于日志
 * @param {boolean} options.requireAuth 是否必须登录，默认true
 * @returns {Object} 返回 { userInfo, apiInstance, isLoggedIn }
 */
export function initPageAuth(options = {}) {
  const {
    getAPI,
    pageName = '页面',
    requireAuth = true
  } = options;
  
  console.log(`[${pageName}] 开始初始化用户认证`);
  
  // 检查登录状态
  const loggedIn = isLoggedIn();
  if (requireAuth && !loggedIn) {
    console.log(`[${pageName}] 用户未登录，跳转到登录页`);
    requireLogin();
    return {
      userInfo: null,
      apiInstance: null,
      isLoggedIn: false
    };
  }
  
  // 获取用户信息
  const userInfo = getCurrentUser();
  console.log(`[${pageName}] 用户信息:`, userInfo);
  
  // 初始化API实例
  let apiInstance = null;
  if (getAPI && typeof getAPI === 'function') {
    try {
      apiInstance = getAPI();
      if (apiInstance && userInfo) {
        apiInstance.currentUser = userInfo;
        console.log(`[${pageName}] API实例已初始化`);
      }
    } catch (error) {
      console.error(`[${pageName}] API实例初始化失败:`, error);
    }
  }
  
  return {
    userInfo,
    apiInstance,
    isLoggedIn: loggedIn
  };
}

/**
 * 生成模拟用户信息（开发调试用）
 * @returns {Object} 模拟的用户信息
 */
export function generateMockUser() {
  return {
    id: 'mock_user_' + Date.now(),
    openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
    nickname: '测试用户' + Math.floor(Math.random() * 1000),
    avatarUrl: '/static/default-avatar.png',
    created_at: new Date().toISOString()
  };
}

/**
 * 开发模式下的快速登录（生成模拟用户并保存）
 * 仅用于开发调试，生产环境应该使用真实的微信登录
 */
export function quickLoginForDev() {
  const mockUser = generateMockUser();
  const token = 'dev_token_' + Date.now();
  
  setUserSession(mockUser, token);
  
  console.log('开发模式快速登录完成:', mockUser);
  
  uni.showToast({
    title: '登录成功',
    icon: 'success'
  });
  
  return mockUser;
}
