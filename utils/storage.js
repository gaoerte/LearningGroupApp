/**
 * 存储相关工具函数
 */

/**
 * 统一的存储键名管理
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_ID: 'user_id',
  OPENID: 'openid',
  USER_INFO: 'user_info',
  CHECKIN_DATA: 'checkin_data',
  THEME: 'theme'
};

/**
 * 存储数据
 * @param {string} key 存储键
 * @param {any} value 存储值
 */
export function setStorage(key, value) {
  try {
    uni.setStorageSync(key, value);
  } catch (error) {
    console.error('存储数据失败:', error);
  }
}

/**
 * 获取存储数据
 * @param {string} key 存储键
 * @param {any} defaultValue 默认值
 * @returns {any} 存储的值或默认值
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
