// config/cloud.js - 云开发配置

/**
 * 云开发环境配置
 */
export const cloudConfig = {
  // 微信小程序云开发环境ID
  // 请在微信开发者工具的云开发控制台中获取你的环境ID
  envId: 'cloud1-5gefd2w950febab8', // 你的实际环境ID
  
  // 云函数超时设置（毫秒）- 增加到 20 秒
  timeout: 20000,
  
  // 是否开启调试模式
  debug: true,
  
  // 是否追踪用户
  traceUser: true
}

/**
 * 获取云开发配置
 * @returns {Object} 云开发配置对象
 */
export function getCloudConfig() {
  return cloudConfig
}

/**
 * 初始化云开发
 * @returns {Promise<boolean>} 初始化结果
 */
export async function initCloud() {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.cloud) {
      try {
        wx.cloud.init({
          env: cloudConfig.envId,
          traceUser: cloudConfig.traceUser
        })
        
        console.log('[Cloud] 云开发初始化成功, 环境ID:', cloudConfig.envId)
        
        // 设置全局云开发实例
        uni.cloud = wx.cloud
        
        resolve(true)
      } catch (error) {
        console.error('[Cloud] 云开发初始化失败:', error)
        reject(error)
      }
    } else {
      const error = new Error('当前环境不支持云开发')
      console.warn('[Cloud] 当前环境不支持云开发')
      reject(error)
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    console.log('[Cloud] 非微信小程序环境，跳过云开发初始化')
    resolve(false)
    // #endif
  })
}

/**
 * 检查云开发是否已初始化
 * @returns {boolean} 是否已初始化
 */
export function isCloudInitialized() {
  // #ifdef MP-WEIXIN
  return typeof wx !== 'undefined' && wx.cloud && uni.cloud
  // #endif
  
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

export default {
  cloudConfig,
  getCloudConfig,
  initCloud,
  isCloudInitialized
}
