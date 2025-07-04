// api/userAPI.js - 用户相关API封装

import { CoreAPI } from './coreAPI.js';

/**
 * 用户API类
 */
class UserAPI {
  
  /**
   * 微信登录 - 完整流程，增强版：同时创建Supabase用户
   * @param {String} code - 微信授权码
   * @returns {Promise<Object>} 登录结果
   */
  static async wechatLogin(code) {
    try {
      console.log('[UserAPI] 开始微信登录，code:', code);
      
      // 1. 获取微信用户信息（这里使用模拟数据，实际应该调用微信API）
      const openid = `wx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      const userInfo = {
        openid: openid,
        nickname: '微信用户',
        name: '微信用户',
        avatar_url: '/static/default-avatar.png',
        avatarUrl: '/static/default-avatar.png',
        created_at: new Date().toISOString()
      };
      
      // 2. 同时在Supabase中创建用户
      try {
        console.log('[UserAPI] 在Supabase中创建微信用户...');
        const supabaseResult = await this.createSupabaseUser(userInfo);
        console.log('[UserAPI] Supabase微信用户创建成功:', supabaseResult);
        
        // 合并Supabase返回的用户信息
        Object.assign(userInfo, supabaseResult);
      } catch (supabaseError) {
        console.warn('[UserAPI] Supabase用户创建失败，但继续登录流程:', supabaseError.message);
        // 不阻断登录流程，即使Supabase创建失败
      }
      
      // 3. 生成token
      const token = `token_${openid}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      // 4. 返回登录结果
      const loginResult = {
        success: true,
        data: {
          userInfo: userInfo,
          token: token,
          loginTime: new Date().toISOString()
        }
      };
      
      console.log('[UserAPI] 微信登录成功:', loginResult);
      return loginResult;
      
    } catch (error) {
      console.error('[UserAPI] 微信登录失败:', error);
      throw error;
    }
  }

  /**
   * 快速登录 - 测试用，增强版：同时创建Supabase用户
   * @param {String} testOpenid - 测试用openid
   * @returns {Promise<Object>} 登录结果
   */
  static async quickLogin(testOpenid = null) {
    try {
      const openid = testOpenid || `test_user_${Date.now()}`;
      const nickname = `用户${openid.slice(-6)}`;
      const avatarUrl = '/static/default-avatar.png';
      
      console.log('[UserAPI] 开始快速登录，openid:', openid);
      
      // 1. 模拟用户信息
      const userInfo = {
        openid: openid,
        nickname: nickname,
        name: nickname,
        avatar_url: avatarUrl,
        avatarUrl: avatarUrl,
        created_at: new Date().toISOString()
      };
      
      // 2. 同时在Supabase中创建用户
      try {
        console.log('[UserAPI] 在Supabase中创建用户...');
        const supabaseResult = await this.createSupabaseUser(userInfo);
        console.log('[UserAPI] Supabase用户创建成功:', supabaseResult);
        
        // 合并Supabase返回的用户信息
        Object.assign(userInfo, supabaseResult);
      } catch (supabaseError) {
        console.warn('[UserAPI] Supabase用户创建失败，但继续登录流程:', supabaseError.message);
        // 不阻断登录流程，即使Supabase创建失败
      }
      
      // 3. 生成token
      const token = `token_${openid}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      // 4. 返回登录结果
      const loginResult = {
        success: true,
        data: {
          userInfo: userInfo,
          token: token,
          loginTime: new Date().toISOString()
        }
      };
      
      console.log('[UserAPI] 快速登录成功:', loginResult);
      return loginResult;
      
    } catch (error) {
      console.error('[UserAPI] 快速登录失败:', error);
      throw error;
    }
  }
  
  /**
   * 在Supabase中创建用户
   * @param {Object} userInfo - 用户信息
   * @returns {Promise<Object>} 创建结果
   */
  static async createSupabaseUser(userInfo) {
    try {
      console.log('[UserAPI] 调用云函数创建Supabase用户:', userInfo);
      
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
            console.log('[UserAPI] 云函数调用成功:', res);
            if (res.result && res.result.success) {
              resolve(res.result.data);
            } else {
              reject(new Error(res.result?.error || '创建用户失败'));
            }
          },
          fail: (error) => {
            console.error('[UserAPI] 云函数调用失败:', error);
            reject(error);
          }
        });
      });
      
      return result;
    } catch (error) {
      console.error('[UserAPI] 创建Supabase用户失败:', error);
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
