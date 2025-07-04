// api/coreAPI.js - 核心API封装，统一调用 supabaseCore 云函数

import { isCloudInitialized, cloudConfig } from '../config/cloud.js'

/**
 * 核心API类 - 统一的业务接口
 */
class CoreAPI {
  
  /**
   * 通用云函数调用方法
   * @param {String} action - 操作类型
   * @param {Object} data - 数据参数
   * @returns {Promise<Object>} - 返回Promise
   */
  static async call(action, data = {}) {
    return new Promise((resolve, reject) => {
      console.log(`[CoreAPI] 调用: ${action}`, data);
      
      // 检查云开发是否已初始化
      if (!isCloudInitialized()) {
        console.error('[CoreAPI] 云开发未初始化，请先调用 wx.cloud.init()');
        reject(new Error('云开发未初始化，请先在App.vue中调用云开发初始化'));
        return;
      }
      
      uni.cloud.callFunction({
        name: 'supabaseCore',
        data: { action, data },
        timeout: cloudConfig.timeout, // 使用配置的超时时间
        success: (res) => {
          try {
            let result = res.result;
            
            // 处理字符串响应
            if (typeof result === 'string') {
              try {
                result = JSON.parse(result);
              } catch (parseError) {
                console.warn(`[CoreAPI] ${action} 响应解析失败:`, parseError);
                result = { success: false, error: '响应格式错误', raw: result };
              }
            }
            
            console.log(`[CoreAPI] ${action} 响应:`, result);
            resolve(result);
          } catch (error) {
            console.error(`[CoreAPI] ${action} 响应处理异常:`, error);
            reject(error);
          }
        },
        fail: (error) => {
          console.error(`[CoreAPI] ${action} 请求失败:`, error);
          reject(new Error(error.errMsg || error.message || '云函数调用失败'));
        }
      });
    });
  }
  
  /**
   * 系统检查
   */
  static async healthCheck() {
    return this.call('healthCheck');
  }
  
  static async testDatabase() {
    return this.call('testDatabase');
  }
  
  /**
   * 用户管理
   */
  static async getUser(openid) {
    return this.call('getUser', { openid });
  }
  
  static async createUser(userData) {
    return this.call('createUser', userData);
  }
  
  static async updateUser(openid, userData) {
    return this.call('updateUser', { openid, userData });
  }
  
  /**
   * 群组管理
   */
  static async getGroups(filters = {}) {
    return this.call('getGroups', { filters });
  }
  
  static async createGroup(groupData) {
    return this.call('createGroup', groupData);
  }
  
  static async joinGroup(groupId, userId) {
    return this.call('joinGroup', { groupId, userId });
  }
  
  /**
   * 打卡管理
   */
  static async createCheckin(checkinData) {
    return this.call('createCheckin', checkinData);
  }
  
  static async getCheckins(userId, limit = 20) {
    return this.call('getCheckins', { userId, limit });
  }
}

export { CoreAPI };
