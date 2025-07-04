/**
 * 环境检测工具
 * 用于判断当前运行环境并提供相应的适配
 */

// 环境类型枚举
export const ENV_TYPES = {
  WECHAT_MINIPROGRAM: 'wechat_miniprogram',
  H5: 'h5',
  APP: 'app',
  NODE: 'node'
};

/**
 * 检测当前运行环境
 * @returns {string} 环境类型
 */
export function detectEnvironment() {
  // 检测微信小程序环境
  if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
    return ENV_TYPES.WECHAT_MINIPROGRAM;
  }
  
  // 检测浏览器环境
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return ENV_TYPES.H5;
  }
  
  // 检测 App 环境
  if (typeof plus !== 'undefined') {
    return ENV_TYPES.APP;
  }
  
  // 检测 Node.js 环境
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return ENV_TYPES.NODE;
  }
  
  return ENV_TYPES.H5; // 默认为 H5
}

/**
 * 判断是否为微信小程序环境
 * @returns {boolean}
 */
export function isMiniProgram() {
  return detectEnvironment() === ENV_TYPES.WECHAT_MINIPROGRAM;
}

/**
 * 判断是否为浏览器环境
 * @returns {boolean}
 */
export function isH5() {
  return detectEnvironment() === ENV_TYPES.H5;
}

/**
 * 判断是否为 App 环境
 * @returns {boolean}
 */
export function isApp() {
  return detectEnvironment() === ENV_TYPES.APP;
}

/**
 * 获取平台信息
 * @returns {Object} 平台信息对象
 */
export function getPlatformInfo() {
  const env = detectEnvironment();
  
  const info = {
    type: env,
    isMiniProgram: env === ENV_TYPES.WECHAT_MINIPROGRAM,
    isH5: env === ENV_TYPES.H5,
    isApp: env === ENV_TYPES.APP,
    isNode: env === ENV_TYPES.NODE,
    canUseWebSocket: env === ENV_TYPES.H5 || env === ENV_TYPES.APP,
    canUseSupabaseRealtime: env === ENV_TYPES.H5 || env === ENV_TYPES.APP,
    needsPolling: env === ENV_TYPES.WECHAT_MINIPROGRAM
  };
  
  console.log('[Environment] 平台信息:', info);
  return info;
}

/**
 * 获取适配的网络请求方法
 * @returns {Object} 网络请求方法对象
 */
export function getNetworkAdapter() {
  const env = detectEnvironment();
  
  switch (env) {
    case ENV_TYPES.WECHAT_MINIPROGRAM:
      return {
        request: wx.request.bind(wx),
        uploadFile: wx.uploadFile ? wx.uploadFile.bind(wx) : null,
        downloadFile: wx.downloadFile ? wx.downloadFile.bind(wx) : null
      };
    
    case ENV_TYPES.H5:
      return {
        request: fetch.bind(window),
        uploadFile: null,
        downloadFile: null
      };
    
    default:
      return {
        request: null,
        uploadFile: null,
        downloadFile: null
      };
  }
}

/**
 * 获取适配的存储方法
 * @returns {Object} 存储方法对象
 */
export function getStorageAdapter() {
  const env = detectEnvironment();
  
  switch (env) {
    case ENV_TYPES.WECHAT_MINIPROGRAM:
      return {
        setItem: (key, value) => {
          try {
            wx.setStorageSync(key, value);
          } catch (error) {
            console.error('[Storage] 存储失败:', error);
          }
        },
        getItem: (key) => {
          try {
            return wx.getStorageSync(key);
          } catch (error) {
            console.error('[Storage] 读取失败:', error);
            return null;
          }
        },
        removeItem: (key) => {
          try {
            wx.removeStorageSync(key);
          } catch (error) {
            console.error('[Storage] 删除失败:', error);
          }
        }
      };
    
    case ENV_TYPES.H5:
      return {
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error('[Storage] 存储失败:', error);
          }
        },
        getItem: (key) => {
          try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          } catch (error) {
            console.error('[Storage] 读取失败:', error);
            return null;
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('[Storage] 删除失败:', error);
          }
        }
      };
    
    default:
      return {
        setItem: () => {},
        getItem: () => null,
        removeItem: () => {}
      };
  }
}

export default {
  ENV_TYPES,
  detectEnvironment,
  isMiniProgram,
  isH5,
  isApp,
  getPlatformInfo,
  getNetworkAdapter,
  getStorageAdapter
};
