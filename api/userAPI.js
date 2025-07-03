// api/userAPI.js - 用户相关API封装

import { CoreAPI } from './coreAPI.js';

/**
 * 用户API类
 */
class UserAPI {
  
  /**
   * 微信登录 - 完整流程
   * @param {String} code - 微信授权码
   * @returns {Promise<Object>} 登录结果
   */
  static async wechatLogin(code) {
    try {
      console.log('[UserAPI] 开始微信登录，code:', code);
      
      const result = await CoreAPI.call('wechatLogin', { code });
      
      if (result.success) {
        console.log('[UserAPI] 微信登录成功:', result);
        return result;
      } else {
        throw new Error(result.error || '微信登录失败');
      }
    } catch (error) {
      console.error('[UserAPI] 微信登录失败:', error);
      throw error;
    }
  }

  /**
   * 快速登录 - 测试用
   * @param {String} testOpenid - 测试用openid
   * @returns {Promise<Object>} 登录结果
   */
  static async quickLogin(testOpenid = null) {
    try {
      const openid = testOpenid || `test_user_${Date.now()}`;
      console.log('[UserAPI] 开始快速登录，openid:', openid);
      
      const result = await CoreAPI.call('quickLogin', { openid });
      
      if (result.success) {
        console.log('[UserAPI] 快速登录成功:', result);
        return result;
      } else {
        throw new Error(result.error || '快速登录失败');
      }
    } catch (error) {
      console.error('[UserAPI] 快速登录失败:', error);
      throw error;
    }
  }

  /**
   * 根据openid获取用户信息
   * @param {String} openid - 用户openid
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserByOpenid(openid) {
    try {
      console.log('[UserAPI] 获取用户信息，openid:', openid);
      
      const result = await CoreAPI.call('getUserByOpenid', { openid });
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || '获取用户信息失败');
      }
    } catch (error) {
      console.error('[UserAPI] 获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息
   * @param {String} openid - 用户openid
   * @param {Object} userInfo - 用户信息
   * @returns {Promise<Object>} 更新结果
   */
  static async updateUserInfo(openid, userInfo) {
    try {
      console.log('[UserAPI] 更新用户信息，openid:', openid, 'userInfo:', userInfo);
      
      const result = await CoreAPI.call('updateUserInfo', { openid, userInfo });
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || '更新用户信息失败');
      }
    } catch (error) {
      console.error('[UserAPI] 更新用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取微信授权码
   * @returns {Promise<String>} 微信授权码
   */
  static async getWechatCode() {
    return new Promise((resolve, reject) => {
      uni.login({
        success: (res) => {
          if (res.code) {
            console.log('[UserAPI] 获取微信授权码成功:', res.code);
            resolve(res.code);
          } else {
            reject(new Error('获取微信授权码失败'));
          }
        },
        fail: (error) => {
          console.error('[UserAPI] 获取微信授权码失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(openid, userInfo) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'update',
          openid: openid,
          userInfo: userInfo
        },
        success: (res) => {
          console.log('用户信息更新成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('用户信息更新失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 获取用户信息
   */
  static async getProfile(openid) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'get',
          openid: openid
        },
        success: (res) => {
          console.log('获取用户信息成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('获取用户信息失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(openid, avatarData) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'uploadAvatar',
          openid: openid,
          userInfo: { avatarData: avatarData }
        },
        success: (res) => {
          console.log('头像上传成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('头像上传失败:', error);
          reject(error);
        }
      });
    });
  }
}

export { UserAPI };
