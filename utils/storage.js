/**
 * 存储相关工具函数
 */

/**
 * 统一的存储键名管理
 */
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_OPENID: 'user_openid',
  USER_INFO: 'user_info',
  LOGIN_TIME: 'login_time',
  IS_LOGGED_IN: 'is_logged_in',
  CHECKIN_DATA: 'checkin_data',
  THEME: 'theme'
};

/**
 * 用户存储管理类
 */
export class StorageManager {
  
  /**
   * 保存登录信息
   * @param {Object} loginData - 登录数据，支持多种数据结构
   */
  static saveLoginData(loginData) {
    try {
      console.log('[Storage] 原始登录数据:', loginData);
      
      let userInfo, token, loginTime, openid;
      
      // 兼容 UserAPI 返回的数据结构
      if (loginData.userInfo && loginData.token) {
        userInfo = loginData.userInfo;
        token = loginData.token;
        loginTime = loginData.loginTime;
        openid = loginData.userInfo.openid;
      } 
      // 兼容旧版数据结构
      else if (loginData.user && loginData.token) {
        userInfo = loginData.user;
        token = loginData.token;
        loginTime = loginData.login_time;
        openid = loginData.openid || loginData.user.openid;
      }
      // 直接传递的数据结构
      else {
        userInfo = loginData.user || loginData.userInfo;
        token = loginData.token;
        loginTime = loginData.login_time || loginData.loginTime;
        openid = loginData.openid || (userInfo && userInfo.openid);
      }
      
      if (!userInfo || !token || !openid) {
        throw new Error('登录数据缺少必要字段: userInfo, token, openid');
      }
      
      console.log('[Storage] 保存登录信息:', { 
        openid, 
        token: token.substring(0, 20) + '...', 
        loginTime,
        userInfo: userInfo.nickname || userInfo.name 
      });
      
      // 保存基本信息
      uni.setStorageSync(STORAGE_KEYS.USER_TOKEN, token);
      uni.setStorageSync(STORAGE_KEYS.USER_OPENID, openid);
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
      uni.setStorageSync(STORAGE_KEYS.LOGIN_TIME, loginTime);
      uni.setStorageSync(STORAGE_KEYS.IS_LOGGED_IN, true);
      
      console.log('[Storage] 登录信息保存成功');
      return true;
    } catch (error) {
      console.error('[Storage] 保存登录信息失败:', error);
      return false;
    }
  }

  /**
   * 获取登录信息
   * @returns {Object|null} 登录信息
   */
  static getLoginData() {
    try {
      const token = uni.getStorageSync(STORAGE_KEYS.USER_TOKEN);
      const openid = uni.getStorageSync(STORAGE_KEYS.USER_OPENID);
      const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
      const loginTime = uni.getStorageSync(STORAGE_KEYS.LOGIN_TIME);
      const isLoggedIn = uni.getStorageSync(STORAGE_KEYS.IS_LOGGED_IN);
      
      if (token && openid && isLoggedIn) {
        return {
          token,
          openid,
          userInfo,
          loginTime,
          isLoggedIn
        };
      }
      
      return null;
    } catch (error) {
      console.error('[Storage] 获取登录信息失败:', error);
      return null;
    }
  }

  /**
   * 检查是否已登录
   * @returns {Boolean} 是否已登录
   */
  static isLoggedIn() {
    try {
      const token = uni.getStorageSync(STORAGE_KEYS.USER_TOKEN);
      const openid = uni.getStorageSync(STORAGE_KEYS.USER_OPENID);
      const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO);
      const loginTime = uni.getStorageSync(STORAGE_KEYS.LOGIN_TIME);
      const isLoggedIn = uni.getStorageSync(STORAGE_KEYS.IS_LOGGED_IN);
      
      console.log('[Storage] 登录状态检查:', {
        hasToken: !!token,
        hasOpenid: !!openid,
        hasUserInfo: !!userInfo,
        hasLoginTime: !!loginTime,
        isLoggedInFlag: isLoggedIn,
        tokenPrefix: token ? token.substring(0, 20) + '...' : null,
        userNickname: userInfo ? userInfo.nickname || userInfo.name : null
      });
      
      const loginData = this.getLoginData();
      const result = loginData !== null && loginData.isLoggedIn === true;
      
      console.log('[Storage] 最终登录状态:', result);
      return result;
    } catch (error) {
      console.error('[Storage] 检查登录状态失败:', error);
      return false;
    }
  }

  /**
   * 清除登录信息
   */
  static clearLoginData() {
    try {
      console.log('[Storage] 清除登录信息');
      
      uni.removeStorageSync(STORAGE_KEYS.USER_TOKEN);
      uni.removeStorageSync(STORAGE_KEYS.USER_OPENID);
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO);
      uni.removeStorageSync(STORAGE_KEYS.LOGIN_TIME);
      uni.removeStorageSync(STORAGE_KEYS.IS_LOGGED_IN);
      
      console.log('[Storage] 登录信息清除成功');
      return true;
    } catch (error) {
      console.error('[Storage] 清除登录信息失败:', error);
      return false;
    }
  }

  /**
   * 获取用户openid
   * @returns {String|null} 用户openid
   */
  static getUserOpenid() {
    try {
      return uni.getStorageSync(STORAGE_KEYS.USER_OPENID) || null;
    } catch (error) {
      console.error('[Storage] 获取用户openid失败:', error);
      return null;
    }
  }

  /**
   * 检查token是否有效
   * @param {Number} maxAge - 最大有效期（毫秒），默认7天
   * @returns {Boolean} token是否有效
   */
  static isTokenValid(maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      const loginTime = uni.getStorageSync(STORAGE_KEYS.LOGIN_TIME);
      
      if (!loginTime) {
        return false;
      }
      
      const loginTimestamp = new Date(loginTime).getTime();
      const now = Date.now();
      
      return (now - loginTimestamp) < maxAge;
    } catch (error) {
      console.error('[Storage] 检查token有效性失败:', error);
      return false;
    }
  }

  /**
   * 获取用户token
   * @returns {String|null} 用户token
   */
  static getToken() {
    try {
      return uni.getStorageSync(STORAGE_KEYS.USER_TOKEN) || null;
    } catch (error) {
      console.error('[Storage] 获取用户token失败:', error);
      return null;
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  static getUserInfo() {
    try {
      return uni.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
    } catch (error) {
      console.error('[Storage] 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 清除所有登录信息（别名方法）
   * @returns {Boolean} 是否成功
   */
  static clearAll() {
    return this.clearLoginData();
  }
}

/**
 * 通用存储操作函数
 */

/**
 * 获取存储的值
 * @param {string} key 键名
 * @param {any} defaultValue 默认值
 * @returns {any} 存储的值
 */
export function getStorage(key, defaultValue = null) {
  try {
    return uni.getStorageSync(key) || defaultValue;
  } catch (error) {
    console.error('获取存储数据失败:', error);
    return defaultValue;
  }
}

/**
 * 移除存储数据
 * @param {string} key 存储键
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
  } catch (error) {
    console.error('移除存储数据失败:', error);
  }
}

/**
 * 清空所有存储数据
 */
export function clearStorage() {
  try {
    uni.clearStorageSync();
  } catch (error) {
    console.error('清空存储数据失败:', error);
  }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getStorage(STORAGE_KEYS.TOKEN);
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息
 */
export function getUserInfo() {
  return getStorage(STORAGE_KEYS.USER_INFO);
}

/**
 * 设置用户信息
 * @param {object} userInfo 用户信息
 */
export function setUserInfo(userInfo) {
  setStorage(STORAGE_KEYS.USER_INFO, userInfo);
}
