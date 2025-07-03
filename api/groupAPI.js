// api/groupAPI.js - 群组相关API封装

import { CoreAPI } from './coreAPI.js';

/**
 * 群组API类
 */
export class GroupAPI {
  
  /**
   * 获取用户加入的群组列表
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 群组列表
   */
  static async getUserGroups(userId) {
    try {
      console.log('[GroupAPI] 获取用户群组列表，用户ID:', userId);
      
      const result = await CoreAPI.call('getUserGroups', { userId });
      
      if (result.success) {
        console.log('[GroupAPI] 获取群组列表成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '获取群组列表失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 获取群组列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建新群组
   * @param {Object} groupData - 群组数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createGroup(groupData) {
    try {
      console.log('[GroupAPI] 创建群组:', groupData);
      
      const result = await CoreAPI.call('createGroup', { groupData });
      
      if (result.success) {
        console.log('[GroupAPI] 创建群组成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '创建群组失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 创建群组失败:', error);
      throw error;
    }
  }

  /**
   * 加入群组
   * @param {String} groupId - 群组ID
   * @param {String} userId - 用户ID
   * @param {String} inviteCode - 邀请码（可选）
   * @returns {Promise<Object>} 加入结果
   */
  static async joinGroup(groupId, userId, inviteCode = null) {
    try {
      console.log('[GroupAPI] 加入群组:', { groupId, userId, inviteCode });
      
      const result = await CoreAPI.call('joinGroup', { 
        groupId, 
        userId, 
        inviteCode 
      });
      
      if (result.success) {
        console.log('[GroupAPI] 加入群组成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '加入群组失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 加入群组失败:', error);
      throw error;
    }
  }

  /**
   * 获取群组详情
   * @param {String} groupId - 群组ID
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 群组详情
   */
  static async getGroupDetail(groupId, userId) {
    try {
      console.log('[GroupAPI] 获取群组详情:', { groupId, userId });
      
      const result = await CoreAPI.call('getGroupDetail', { groupId, userId });
      
      if (result.success) {
        console.log('[GroupAPI] 获取群组详情成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '获取群组详情失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 获取群组详情失败:', error);
      throw error;
    }
  }

  /**
   * 搜索公开群组
   * @param {String} keyword - 搜索关键词
   * @param {String} category - 分类（可选）
   * @returns {Promise<Object>} 搜索结果
   */
  static async searchGroups(keyword, category = null) {
    try {
      console.log('[GroupAPI] 搜索群组:', { keyword, category });
      
      const result = await CoreAPI.call('searchGroups', { 
        keyword, 
        category 
      });
      
      if (result.success) {
        console.log('[GroupAPI] 搜索群组成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '搜索群组失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 搜索群组失败:', error);
      throw error;
    }
  }

  /**
   * 获取推荐群组
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 推荐群组列表
   */
  static async getRecommendedGroups(userId) {
    try {
      console.log('[GroupAPI] 获取推荐群组:', userId);
      
      const result = await CoreAPI.call('getRecommendedGroups', { userId });
      
      if (result.success) {
        console.log('[GroupAPI] 获取推荐群组成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '获取推荐群组失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 获取推荐群组失败:', error);
      throw error;
    }
  }

  /**
   * 退出群组
   * @param {String} groupId - 群组ID
   * @param {String} userId - 用户ID
   * @returns {Promise<Object>} 退出结果
   */
  static async leaveGroup(groupId, userId) {
    try {
      console.log('[GroupAPI] 退出群组:', { groupId, userId });
      
      const result = await CoreAPI.call('leaveGroup', { groupId, userId });
      
      if (result.success) {
        console.log('[GroupAPI] 退出群组成功');
        return result;
      } else {
        throw new Error(result.error || '退出群组失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 退出群组失败:', error);
      throw error;
    }
  }

  /**
   * 获取群组成员列表
   * @param {String} groupId - 群组ID
   * @param {String} userId - 请求用户ID
   * @returns {Promise<Object>} 成员列表
   */
  static async getGroupMembers(groupId, userId) {
    try {
      console.log('[GroupAPI] 获取群组成员:', { groupId, userId });
      
      const result = await CoreAPI.call('getGroupMembers', { groupId, userId });
      
      if (result.success) {
        console.log('[GroupAPI] 获取群组成员成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '获取群组成员失败');
      }
    } catch (error) {
      console.error('[GroupAPI] 获取群组成员失败:', error);
      throw error;
    }
  }
}